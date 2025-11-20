import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const status = searchParams.get('status'); // kiralik veya satilik
    
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    console.log('Searching listings with query:', query, 'status:', status);
    
    // Normalize the query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Kelimelere ayır (multi-word search için)
    const words = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
    
    // Fetch all listings with their related details
    let queryBuilder = supabase
      .from('listings')
      .select(`
        *,
        images(url, is_cover),
        konut_details(*),
        ticari_details(*),
        arsa_details(*),
        vasita_details(*),
        addresses(*)
      `)
      .eq('is_active', true);
    
    // Listing status filtresi
    if (status) {
      queryBuilder = queryBuilder.eq('listing_status', status);
    }
    
    const { data: allListings, error } = await queryBuilder.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error when fetching listings for search:', error);
      return NextResponse.json(
        { error: 'Failed to search listings', details: error },
        { status: 500 }
      );
    }
    
    // Multi-word search: Her kelime için ayrı ayrı kontrol (AND mantığı)
    const filteredListings = allListings.filter(listing => {
      // Her kelime için eşleşme kontrolü
      for (const word of words) {
        const wordRegex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        let wordMatches = false;
        
        // Title'da ara
        if (listing.title && wordRegex.test(listing.title)) {
          wordMatches = true;
        }
        
        // Description'da ara
        if (!wordMatches && listing.description && wordRegex.test(listing.description)) {
          wordMatches = true;
        }
        
        // Address information
        if (!wordMatches && listing.addresses && listing.addresses.length > 0) {
          const address = listing.addresses[0];
          if (
            (address.province && wordRegex.test(address.province)) ||
            (address.district && wordRegex.test(address.district)) ||
            (address.neighborhood && wordRegex.test(address.neighborhood)) ||
            (address.full_address && wordRegex.test(address.full_address))
          ) {
            wordMatches = true;
          }
        }
        
        // Property-specific details
        if (!wordMatches) {
          if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
            const konutDetails = listing.konut_details[0];
            if (
              (konutDetails.konut_type && wordRegex.test(konutDetails.konut_type)) ||
              (konutDetails.room_count && wordRegex.test(konutDetails.room_count))
            ) {
              wordMatches = true;
            }
          } else if (listing.property_type === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
            const ticariDetails = listing.ticari_details[0];
            if (ticariDetails.ticari_type && wordRegex.test(ticariDetails.ticari_type)) {
              wordMatches = true;
            }
          } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
            const arsaDetails = listing.arsa_details[0];
            if (arsaDetails.arsa_type && wordRegex.test(arsaDetails.arsa_type)) {
              wordMatches = true;
            }
          } else if (listing.property_type === 'vasita' && listing.vasita_details && listing.vasita_details.length > 0) {
            const vasitaDetails = listing.vasita_details[0];
            if (
              (vasitaDetails.vasita_type && wordRegex.test(vasitaDetails.vasita_type)) ||
              (vasitaDetails.brand && wordRegex.test(vasitaDetails.brand)) ||
              (vasitaDetails.model && wordRegex.test(vasitaDetails.model)) ||
              (vasitaDetails.sub_model && wordRegex.test(vasitaDetails.sub_model)) ||
              (vasitaDetails.fuel_type && wordRegex.test(vasitaDetails.fuel_type)) ||
              (vasitaDetails.transmission && wordRegex.test(vasitaDetails.transmission)) ||
              (vasitaDetails.color && wordRegex.test(vasitaDetails.color))
            ) {
              wordMatches = true;
            }
          }
        }
        
        // Eğer bu kelime eşleşmediyse, listing'i filtrele
        if (!wordMatches) {
          return false;
        }
      }
      
      // Tüm kelimeler eşleştiyse true döndür
      return true;
    });
    
    // Transform data to include thumbnail_url and remove unnecessary details
    const transformedData = filteredListings.map(listing => {
      // Find cover image if it exists
      const coverImage = listing.images?.find((img: { is_cover: boolean }) => img.is_cover === true);
      // Or use the first image if no cover is marked
      const firstImage = listing.images?.[0];
      
      // Extract location information
      let location = '';
      if (listing.addresses && listing.addresses.length > 0) {
        const address = listing.addresses[0];
        location = `${address.province}/${address.district}${address.neighborhood ? '/' + address.neighborhood : ''}`;
      }
      
      // Extract property-specific details
      let rooms, area, konut_type, model, year;
      
      if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
        const konutDetails = listing.konut_details[0];
        rooms = konutDetails.room_count || 'Belirtilmemiş';
        area = konutDetails.gross_sqm || konutDetails.net_sqm;
        konut_type = konutDetails.konut_type;
      } else if (listing.property_type === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
        const ticariDetails = listing.ticari_details[0];
        rooms = ticariDetails.room_count ? ticariDetails.room_count.toString() : 'Belirtilmemiş';
        area = ticariDetails.gross_sqm || ticariDetails.net_sqm;
      } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
        const arsaDetails = listing.arsa_details[0];
        area = arsaDetails.sqm;
      } else if (listing.property_type === 'vasita' && listing.vasita_details && listing.vasita_details.length > 0) {
        const vasitaDetails = listing.vasita_details[0];
        model = vasitaDetails.model;
        year = vasitaDetails.year;
      }
      
      // Return the transformed listing with only necessary information
      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        property_type: listing.property_type,
        listing_status: listing.listing_status,
        thumbnail_url: coverImage?.url || firstImage?.url || null,
        created_at: listing.created_at,
        location,
        area,
        rooms,
        konut_type,
        model,
        year,
        is_featured: listing.is_featured,
        // Include address components for filtering
        district: listing.addresses?.[0]?.district,
        province: listing.addresses?.[0]?.province,
        neighborhood: listing.addresses?.[0]?.neighborhood
      };
    });
    
    console.log(`Search found ${transformedData.length} results for query: ${query}`);
    return NextResponse.json({
      results: transformedData,
      query
    });
  } catch (error) {
    console.error('Error in listings search route:', error);
    return NextResponse.json(
      { error: 'Failed to search listings', details: error },
      { status: 500 }
    );
  }
} 