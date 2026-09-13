import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function performReset() {
  const { data: listings, error: fetchErr } = await supabase
    .from('listings')
    .select('id');

  if (fetchErr) {
    console.error('Error fetching listing IDs:', fetchErr);
    return { success: false, error: fetchErr.message };
  }

  if (listings && listings.length > 0) {
    for (const item of listings) {
      await supabase
        .from('listings')
        .update({ views_count: 0, contact_count: 0 })
        .eq('id', item.id);
    }
  }

  return { success: true, count: listings?.length || 0 };
}

export async function GET(request: NextRequest) {
  try {
    const result = await performReset();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: `${result.count} adet ilanın sayaçları 0 olarak sıfırlandı.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await performReset();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: `${result.count} adet ilanın sayaçları 0 olarak sıfırlandı.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
