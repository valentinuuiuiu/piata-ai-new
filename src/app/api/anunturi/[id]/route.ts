import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

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

    // Use service client so public users can view active listings details (same pattern as /api/anunturi list)
    const supabase = createServiceClient();
    
    // NOTE: Avoid fragile cross-table join syntax in production.
    // Some environments differ in relationship naming, which causes join errors and false 404s.
    // We fetch the listing first, then hydrate category + seller with separate queries.
    const { data: ad, error } = await supabase
      .from('anunturi')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Ad not found or database error' }, { status: 404 });
    }

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Hydrate category + seller (best-effort)
    const adWithImages = ad as any;

    try {
      if (adWithImages.category_id) {
        const { data: cat } = await supabase
          .from('categories')
          .select('name')
          .eq('id', adWithImages.category_id)
          .single();
        if (cat) adWithImages.category = cat;
      }
    } catch {}

    try {
      if (adWithImages.user_id) {
        const { data: seller } = await supabase
          .from('users')
          .select('name,email')
          .eq('id', adWithImages.user_id)
          .single();
        if (seller) adWithImages.seller = seller;
      }
    } catch {}

    // Parse images for frontend - handle various formats
    // (normalize to string[])

    
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

    // Return the normalized object (with images parsed)
    return NextResponse.json(adWithImages);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ad',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user using standard client
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // 2. Fetch ad to check ownership (using service client to ensure we can see it even if some RLS hides it)
    // Actually, checking ownership requires seeing the record.
    const supabaseAdmin = createServiceClient();

    const { data: ad, error: fetchError } = await supabaseAdmin
        .from('anunturi')
        .select('user_id')
        .eq('id', id)
        .single();

    if (fetchError || !ad) {
       return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // 3. Check permissions
    // Allow if user is the owner OR if user is the specific admin
    const ADMIN_EMAIL = 'ionutbaltag3@gmail.com';
    const isOwner = ad.user_id === user.id;
    const isAdmin = user.email === ADMIN_EMAIL;

    if (!isOwner && !isAdmin) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Perform Delete using Service Client (bypassing RLS) to ensure Admin/Owner can definitely delete it
    const { error: deleteError } = await supabaseAdmin
      .from('anunturi')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete failed:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
     console.error('DELETE error:', error);
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
