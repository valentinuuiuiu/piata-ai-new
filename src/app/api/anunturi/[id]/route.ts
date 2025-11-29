import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: ad, error } = await supabase
      .from('anunturi')
      .select('*, category:categories(name), seller:users!user_id(name, email)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Ad not found or database error' }, { status: 404 });
    }

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Parse images for frontend - handle various formats
    const adWithImages = ad as any; // Type assertion for database result
    
    try {
      if (!adWithImages.images) {
        adWithImages.images = [];
      } else if (typeof adWithImages.images === 'string') {
        // Try to parse as JSON first
        if (adWithImages.images.trim().startsWith('[')) {
          const parsed = JSON.parse(adWithImages.images);
          adWithImages.images = Array.isArray(parsed) ? parsed : [adWithImages.images];
        } else {
          // Treat as single URL
          adWithImages.images = [adWithImages.images];
        }
      } else if (!Array.isArray(adWithImages.images)) {
        // If it's some other type (object?), wrap in array or stringify
        adWithImages.images = [String(adWithImages.images)];
      }
      // If it's already an array, leave it alone
    } catch (e) {
      console.error('Error parsing images in API:', e);
      adWithImages.images = [];
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}