import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cache for 2 minutes on Vercel Edge CDN
export const revalidate = 120;

export async function GET() {
  try {
    // Only select the lightweight fields needed for counts
    const { data, error } = await supabase
      .from('listings')
      .select('property_type, sub_category, konut_type, title, is_active')
      .eq('is_active', true);

    if (error || !data) {
      console.error('Error fetching listing counts:', error);
      return NextResponse.json({
        konut: 0,
        ticari: 0,
        arsa: 0,
        vasita: 0,
        prefabrik: 0,
        total: 0
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
        }
      });
    }

    const counts = {
      konut: data.filter((listing: any) => listing.property_type === 'konut').length,
      ticari: data.filter((listing: any) => listing.property_type === 'ticari').length,
      arsa: data.filter((listing: any) => listing.property_type === 'arsa').length,
      vasita: data.filter((listing: any) => listing.property_type === 'vasita').length,
      prefabrik: data.filter((listing: any) => 
        listing.sub_category === 'Prefabrik' || 
        listing.sub_category === 'Tiny House' ||
        listing.sub_category === 'Konteyner' ||
        listing.konut_type === 'prefabrik' ||
        (listing.title && listing.title.toLowerCase().includes('prefabrik')) || 
        (listing.title && listing.title.toLowerCase().includes('tiny house')) ||
        (listing.title && listing.title.toLowerCase().includes('konteyner'))
      ).length,
      total: data.length
    };

    return NextResponse.json(counts, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
      }
    });
  } catch (error) {
    console.error('Error in listing counts route:', error);
    return NextResponse.json({
      konut: 0,
      ticari: 0,
      arsa: 0,
      vasita: 0,
      prefabrik: 0,
      total: 0
    }, { status: 500 });
  }
}
