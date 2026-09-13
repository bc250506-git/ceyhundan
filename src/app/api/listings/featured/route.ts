import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatLocationFromAddress } from '@/lib/utils';

// Simple deterministic hash function for time-slot based rotation
function getDeterministicHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Rotation interval in hours (default 1 hour)
    const intervalHoursParam = searchParams.get('interval');
    const intervalHours = intervalHoursParam ? parseInt(intervalHoursParam, 10) : 1;

    // Fetch all active listings with full relational details
    const { data: allListings, error } = await supabase
      .from('listings')
      .select(`
        *,
        images(url, is_cover),
        konut_details(room_count, gross_sqm, net_sqm, konut_type),
        ticari_details(room_count, gross_sqm, ticari_type),
        arsa_details(sqm, arsa_type),
        vasita_details(brand, model, year, vasita_type),
        addresses(province, district, neighborhood, full_address)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !allListings) {
      console.error('Error fetching active listings for featured rotation:', error);
      return NextResponse.json([]);
    }

    if (!allListings || allListings.length === 0) {
      return NextResponse.json([]);
    }

    // Process & enhance listings with location and thumbnail
    const processedListings = allListings.map((listing: any) => {
      let enhanced: any = { ...listing };

      // Cover image
      if (listing.images && listing.images.length > 0) {
        const cover = listing.images.find((img: any) => img.is_cover) || listing.images[0];
        enhanced.thumbnail_url = cover.url;
      } else {
        enhanced.thumbnail_url = "/images/ce.png";
      }

      // Address / location
      if (listing.addresses && listing.addresses.length > 0) {
        enhanced.location = formatLocationFromAddress(listing.addresses[0]);
      }

      // Details mapping
      if (listing.property_type === 'konut' && listing.konut_details?.length > 0) {
        const details = listing.konut_details[0];
        const isPrefabrik = (details.konut_type ?? '').toLowerCase() === 'prefabrik';
        if (!isPrefabrik) {
          enhanced.rooms = details.room_count;
          enhanced.area = details.gross_sqm;
        }
        enhanced.subcategory = details.konut_type || 'Daire';
      } else if (listing.property_type === 'ticari' && listing.ticari_details?.length > 0) {
        const details = listing.ticari_details[0];
        enhanced.rooms = details.room_count ? details.room_count.toString() : undefined;
        enhanced.area = details.gross_sqm;
        enhanced.subcategory = details.ticari_type || 'Ofis';
      } else if (listing.property_type === 'arsa' && listing.arsa_details?.length > 0) {
        const details = listing.arsa_details[0];
        enhanced.area = details.sqm;
        enhanced.subcategory = details.arsa_type || 'Arsa';
      } else if (listing.property_type === 'vasita' && listing.vasita_details?.length > 0) {
        const details = listing.vasita_details[0];
        enhanced.subcategory = details.brand || 'Otomobil';
        enhanced.brand = details.brand;
        enhanced.model = details.model;
        const parsedYear = parseInt(details.year as unknown as string);
        enhanced.year = !isNaN(parsedYear) ? parsedYear : undefined;
      }

      return enhanced;
    });

    // Separate into manually featured and candidates for auto-rotation
    const manualFeatured = processedListings.filter((l: any) => l.is_featured === true);
    const nonFeaturedCandidates = processedListings.filter((l: any) => !l.is_featured);

    let resultFeatured: any[] = [];

    // Tag manual listings
    const manualTagged = manualFeatured.map((l: any) => ({
      ...l,
      is_manual_featured: true,
      is_auto_featured: false
    }));

    if (manualTagged.length >= limit) {
      // If we have enough manually featured listings, pick top `limit`
      resultFeatured = manualTagged.slice(0, limit);
    } else {
      // Take ALL manual featured listings and fill the rest with auto-rotated listings
      resultFeatured = [...manualTagged];
      const neededCount = limit - manualTagged.length;

      if (nonFeaturedCandidates.length <= neededCount) {
        // If candidate count is less than needed, take all candidates
        const autoTagged = nonFeaturedCandidates.map((l: any) => ({
          ...l,
          is_manual_featured: false,
          is_auto_featured: true
        }));
        resultFeatured.push(...autoTagged);
      } else {
        // Deterministic Time-based Rotation Slot calculation (changes slot index every `intervalHours`)
        const currentSlot = Math.floor(Date.now() / (1000 * 60 * 60 * intervalHours));

        // Sort candidates deterministically for this time slot
        const hashedCandidates = nonFeaturedCandidates.map((l: any) => {
          const hashValue = getDeterministicHash(`${l.id}-${currentSlot}`);
          return { listing: l, hash: hashValue };
        });

        hashedCandidates.sort((a: any, b: any) => a.hash - b.hash);

        // Pick top `neededCount` from hashed candidates
        const autoSelected = hashedCandidates.slice(0, neededCount).map((item: any) => ({
          ...item.listing,
          is_manual_featured: false,
          is_auto_featured: true
        }));

        resultFeatured.push(...autoSelected);
      }
    }

    return NextResponse.json(resultFeatured);
  } catch (err: any) {
    console.error('Error in /api/listings/featured route:', err);
    return NextResponse.json([]);
  }
}
