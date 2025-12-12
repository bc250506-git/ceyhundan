import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED - This endpoint is no longer used
 * Search is now performed client-side using searchListings() from @/lib/search
 * 
 * The /ilanlar page uses the searchListings function directly on the client
 * to filter listings based on the URL search parameter
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Search is performed client-side.',
      message: 'Use the searchListings function from @/lib/search instead'
    },
    { status: 410 } // 410 Gone
  );
} 