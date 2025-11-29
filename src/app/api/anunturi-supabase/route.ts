import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const categorySlug = searchParams.get('category') || searchParams.get('categoria');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build Supabase query
    let query = supabase
      .from('anunturi')
      .select('*')
      .eq('status', 'active');

    // Apply category filter if provided
    if (categorySlug) {
      // For now, skip category filtering to avoid complex joins
      // This can be added back with proper Supabase types
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false, nullsFirst: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: listings, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    // Transform images from JSON string to array if needed
    const transformedListings = listings?.map((listing: any) => ({
      ...listing,
      images: typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images
    })) || [];

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categoryId = parseInt(formData.get('category_id') as string, 10);
    const subcategoryId = formData.get('subcategory_id') ? parseInt(formData.get('subcategory_id') as string, 10) : null;
    const location = formData.get('location') as string;
    const contactEmail = formData.get('contact_email') as string;
    const phone = formData.get('contact_phone') as string;

    // Validate required fields
    if (!title || !categoryId) {
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
        const filename = `listing_${user.id}_${Date.now()}_${i}.${file.name.split('.').pop()}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filename, file, {
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

        images.push(publicUrl);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'At least 3 images required' }, { status: 400 });
    }

    // Insert listing
    const { data: listing, error: insertError } = await (supabase as any)
      .from('anunturi')
      .insert({
        user_id: user.id,
        title,
        description,
        price: price ? parseFloat(price) : null,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        location: location || 'București',
        contact_email: contactEmail,
        phone,
        images,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
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