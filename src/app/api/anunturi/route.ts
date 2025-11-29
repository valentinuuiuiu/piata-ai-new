import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    console.log('GET /api/anunturi - Starting Supabase query');

    // Try to query anunturi table directly
    const { data: listings, error } = await supabase
      .from('anunturi')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase anunturi query error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));

      return NextResponse.json({
        error: 'Database query failed',
        details: error.message,
        hint: 'Check if anunturi table exists and has correct structure'
      }, { status: 500 });
    }

    console.log(`Successfully fetched ${listings?.length || 0} listings from Supabase`);

    // Transform images if they're stored as JSON strings
    const transformedListings = listings?.map((listing: any) => ({
      ...listing,
      images: Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || '[]')
    })) || [];

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/anunturi - Request received');

    // For testing: use service client to bypass RLS
    const supabase = createServiceClient();

    const formData = await request.formData();
    console.log('Form data received:', Object.fromEntries(formData.entries()));

    // Get user ID from form data
    const userId = formData.get('user_id') as string;

    if (!userId) {
      console.log('No user_id provided');
      return NextResponse.json({ error: 'Unauthorized - user_id required' }, { status: 401 });
    }

    console.log('Processing ad creation for user:', userId);

    // Use userId as string (Supabase format)
    const finalUserId = userId;

    // Extract form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: formData.get('price') as string,
      categoryId: parseInt(formData.get('category_id') as string, 10),
      subcategoryId: formData.get('subcategory_id') ? parseInt(formData.get('subcategory_id') as string, 10) : undefined,
      location: formData.get('location') as string,
      contactEmail: formData.get('contact_email') as string,
      phone: formData.get('contact_phone') as string,
    };

    // Validate category_id
    if (isNaN(rawData.categoryId)) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }

    console.log('Parsed data:', rawData);

    // Validate required fields
    if (!rawData.title || !rawData.categoryId) {
      console.log('Validation failed: missing title or category');
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Handle image uploads
    const images: string[] = [];
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`image_${i}`) as File;
      if (file && file.size > 0) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
        }

        // Upload to Supabase Storage
        const filename = `listing_${userId}_${Date.now()}_${i}.${file.name.split('.').pop()}`;

        // Convert File to ArrayBuffer for Supabase
        const fileBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filename, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filename);

        console.log(`Uploaded image ${i}: ${filename} -> ${publicUrl}`);
        images.push(publicUrl);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'At least 1 image required' }, { status: 400 });
    }

    // Insert listing
    const { data: listing, error: insertError } = await (supabase as any)
      .from('anunturi')
      .insert({
        user_id: finalUserId,
        title: rawData.title,
        description: rawData.description,
        price: rawData.price ? parseFloat(rawData.price) : null,
        category_id: rawData.categoryId,
        subcategory_id: rawData.subcategoryId,
        location: rawData.location || 'București',
        contact_email: rawData.contactEmail,
        phone: rawData.phone,
        images,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Check if it's a table not found error
      if (insertError.code === '42P01') {
        return NextResponse.json({
          error: 'Database not initialized. Please run the migration script.',
          details: 'Tables not found. Run migration in Supabase SQL Editor.'
        }, { status: 503 });
      }
      return NextResponse.json({ error: 'Failed to create listing', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: (listing as any).id,
      images,
      message: `Listing created with ${images.length} images`
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}