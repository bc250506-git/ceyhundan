import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: listings, error: fetchErr } = await supabase
      .from('listings')
      .select('id');

    if (fetchErr) {
      console.error('Error fetching listing IDs:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (listings && listings.length > 0) {
      for (const item of listings) {
        await supabase
          .from('listings')
          .update({ views_count: 0, contact_count: 0 })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tüm ilan görüntülenme ve iletişim sayaçları 0 olarak sıfırlandı.'
    });
  } catch (err) {
    console.error('Error resetting stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
