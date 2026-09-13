import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let inMemorySiteVisits = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pathname = body.pathname || '/';

    // Increment in-memory counter
    inMemorySiteVisits++;

    // Try to track in Supabase if analytics or site_visits table exists, or update RPC
    try {
      const { error } = await supabase.rpc('increment_site_visit');
      if (error) {
        // Fallback: try fetching current count from a key-value or system record if available
      }
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  try {
    return NextResponse.json({ count: inMemorySiteVisits });
  } catch (err) {
    return NextResponse.json({ count: 0 });
  }
}
