import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const categorySlug = searchParams.get('category') || searchParams.get('categoria');
    const subcategorySlug = searchParams.get('subcategory');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search');

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build Supabase query
    let query = supabase
      .from('anunturi')
      .select(`
        *,
        categories:category_id (
          name,
          slug
        ),
        subcategories:subcategory_id (
          id,
          name,
          slug
        ),
        users:user_id (
          name,
          phone
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
      console.error('Supabase search error:', error);
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
      seller_name: listing.users?.name,
      location: listing.location,
      created_at: listing.created_at
    })) || [];

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}