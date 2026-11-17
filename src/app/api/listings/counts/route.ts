import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cache for 2 minutes on Vercel Edge CDN
export const revalidate = 120;

export async function GET() {
  try {
    // Only select lightweight fields and konut_details relation needed for counts
    const { data, error } = await supabase
      .from('listings')
      .select('id, property_type, title, is_active, konut_details(konut_type)')
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

    const isPrefabrik = (listing: any) => {
      const kType = (listing.konut_details?.[0]?.konut_type || '').toLowerCase();
      const title = (listing.title || '').toLowerCase();
      return kType.includes('prefabrik') || kType.includes('konteyner') || kType.includes('tiny') ||
        title.includes('tiny house') || title.includes('prefabrik') || title.includes('konteyner');
    };

    const counts = {
      konut: data.filter((listing: any) => listing.property_type === 'konut' && !isPrefabrik(listing)).length,
      ticari: data.filter((listing: any) => listing.property_type === 'ticari').length,
      arsa: data.filter((listing: any) => listing.property_type === 'arsa').length,
      vasita: data.filter((listing: any) => listing.property_type === 'vasita').length,
      prefabrik: data.filter((listing: any) => isPrefabrik(listing)).length,
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
