import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const categorySlug = searchParams.get('category') || searchParams.get('categoria');
    const subcategorySlug = searchParams.get('subcategory');
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build Supabase query
    // NOTE: Keep this endpoint publicly accessible.
    // Avoid joins to user tables (often protected by RLS) to prevent hard failures in production.
    let query = supabase
      .from('anunturi')
      .select(`
        id,
        title,
        description,
        price,
        location,
        images,
        created_at,
        status,
        views,
        is_premium,
        is_featured,
        category_id,
        subcategory_id,
        categories:category_id (
          name,
          slug
        ),
        subcategories:subcategory_id (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'active');

    // Apply filters
    if (categorySlug) {
      const { data: category } = await (supabase as any)
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        query = query.eq('category_id', (category as any).id);
      }
    }

    if (subcategorySlug) {
      const { data: subcategory } = await (supabase as any)
        .from('subcategories')
        .select('id')
        .eq('slug', subcategorySlug)
        .single();

      if (subcategory) {
        query = query.eq('subcategory_id', (subcategory as any).id);
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply price filters
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply location filter
    if (location) {
      query = query.ilike('location', `%${location}%`);
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
      case 'popular':
        // For now, we'll order by a views column if it exists, or by a boosted status
        // Since we don't have a views column in the schema, we'll order by is_premium and created_at
        query = query.order('is_premium', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: listings, error } = await query;

    if (error) {
      // Keep error response generic, but log enough for debugging in Vercel runtime logs.
      console.error('Supabase search error:', {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Transform the data
    const transformedListings = listings?.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      images: Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || '[]'),
      category_name: listing.categories?.name,
      category_slug: listing.categories?.slug,
      subcategory_name: listing.subcategories?.name,
      subcategory_slug: listing.subcategories?.slug,
      seller_name: null,
      location: listing.location,
      created_at: listing.created_at,
      views: listing.views || 0, // Default to 0 if no views column exists
      is_boosted: listing.is_premium || listing.is_featured || false
    })) || [];

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}