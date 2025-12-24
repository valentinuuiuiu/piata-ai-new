import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Update the view count using the function we created
    const { error } = await supabase.rpc('increment_listing_view', {
      p_listing_id: parseInt(listingId)
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
