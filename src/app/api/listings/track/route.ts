import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { listing_id, slug, action } = await request.json();

    if (!action || (!listing_id && !slug)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Resolve listing ID if slug is provided
    let id = listing_id;
    if (!id && slug) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      if (isUUID) {
        id = slug;
      } else {
        const { data: listing } = await supabase
          .from('listings')
          .select('id')
          .eq('slug', slug)
          .single();
        if (listing) id = listing.id;
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (action === 'view') {
      // Try Supabase RPC first, fallback to direct update
      const { error: rpcError } = await supabase.rpc('increment_view_count', { listing_id: id });
      if (rpcError) {
        const { data: current } = await supabase
          .from('listings')
          .select('views_count')
          .eq('id', id)
          .single();
        const newViews = ((current?.views_count) || 0) + 1;
        await supabase.from('listings').update({ views_count: newViews }).eq('id', id);
      }
    } else if (action === 'contact') {
      const { error: rpcError } = await supabase.rpc('increment_contact_count', { listing_id: id });
      if (rpcError) {
        const { data: current } = await supabase
          .from('listings')
          .select('contact_count')
          .eq('id', id)
          .single();
        const newContacts = ((current?.contact_count) || 0) + 1;
        await supabase.from('listings').update({ contact_count: newContacts }).eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error tracking listing action:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
