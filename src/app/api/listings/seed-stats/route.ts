import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple deterministic pseudo-random number generator based on string
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function POST(request: NextRequest) {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, views_count, contact_count, created_at, is_featured');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({ message: 'No listings found' });
    }

    let updatedCount = 0;

    for (const listing of listings) {
      // If listing has 0 or null views, populate realistic initial baseline
      if (!listing.views_count || listing.views_count === 0) {
        const hash = stringHash(listing.id);
        const baseViews = 120 + (hash % 380); // 120 - 500 views
        const featuredBonus = listing.is_featured ? 150 + (hash % 200) : 0;
        const views_count = baseViews + featuredBonus;
        
        // Conversion rate ~3% - 7%
        const conversionPct = 0.03 + ((hash % 40) / 1000); // 3.0% - 7.0%
        const contact_count = Math.max(1, Math.floor(views_count * conversionPct));

        const { error: updateError } = await supabase
          .from('listings')
          .update({ views_count, contact_count })
          .eq('id', listing.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded baseline stats for ${updatedCount} listings.`
    });
  } catch (err) {
    console.error('Error seeding stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
