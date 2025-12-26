import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Default contact email for all listings
const DEFAULT_CONTACT_EMAIL = 'claude.dev@mail.com';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Configure route
export const maxDuration = 60;
export const runtime = 'nodejs';

// Allow caching at the edge/CDN for GET (we set explicit Cache-Control below)
export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient();

    console.log('GET /api/anunturi - Starting Supabase query with service client');

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const summary = (searchParams.get('summary') || '1') !== '0';

    // OPTIMIZED: select only needed fields for list views
    const select = summary
      ? 'id,title,price,location,status,created_at,published_at,images,category_id,subcategory_id,user_id,views,is_premium,is_featured'
      : '*';

    const { data: listings, error } = await supabase
      .from('anunturi')
      .select(select)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase anunturi query error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));

      // Return empty array instead of error to prevent frontend crash
      console.log('Returning empty array due to database error');
      return NextResponse.json([]);
    }

    console.log(`Successfully fetched ${listings?.length || 0} listings from Supabase`);

    // Transform images (server-safe, no URL.createObjectURL)
    const transformedListings = (listings || []).map((listing: any) => {
      let images: string[] = [];
      try {
        if (Array.isArray(listing.images)) {
          images = listing.images;
        } else if (typeof listing.images === 'string') {
          const s = listing.images.trim();
          if (s.startsWith('[')) {
            const parsed = JSON.parse(s);
            images = Array.isArray(parsed) ? parsed : [];
          } else if (s.length > 0) {
            images = [s];
          }
        }
      } catch {
        images = [];
      }
      return { ...listing, images };
    });

    // CDN cache (safe for public listings list)
    return NextResponse.json(transformedListings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    // Return empty array instead of error to prevent frontend crash
    console.log('Returning empty array due to API error');
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/anunturi - Request received');

    // Use Supabase service client for server-side operations
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

    // Use provided contact email or fallback to defaults
    const contactEmail = rawData.contactEmail || DEFAULT_CONTACT_EMAIL;

    // Validate category_id
    if (isNaN(rawData.categoryId)) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }

    // 🎯 CREDIT SYSTEM: Check if category requires credits
    const PAID_CATEGORIES = {
      1: { name: 'Imobiliare', creditsRequired: 5 }, // Real Estate
      10: { name: 'Matrimoniale', creditsRequired: 3 } // Matrimonial (Corrected ID to 10)
    };

    const categoryInfo = PAID_CATEGORIES[rawData.categoryId as keyof typeof PAID_CATEGORIES];
    
    // Check user's credit balance
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', finalUserId)
      .single();

    const userCredits = (profile as any)?.credits_balance || 0;
    
    if (categoryInfo) {
      if (userCredits < categoryInfo.creditsRequired) {
        return NextResponse.json({
          error: 'Insufficient credits',
          message: `Categoria "${categoryInfo.name}" necesită ${categoryInfo.creditsRequired} credite. Ai doar ${userCredits} credite.`,
          requiredCredits: categoryInfo.creditsRequired,
          currentCredits: userCredits,
          redirectToCredits: true
        }, { status: 402 });
      }
    }

    // Handle image uploads in PARALLEL for speed and to avoid timeouts
    const uploadPromises: Promise<string | null>[] = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`) as File;
      if (file && file.size > 0) {
        if (!file.type.startsWith('image/')) continue;
        
        const filename = `listing_${userId}_${Date.now()}_${i}.${file.name.split('.').pop()}`;
        
        uploadPromises.push((async () => {
          try {
            const fileBuffer = await file.arrayBuffer();
            const { error: uploadError } = await supabase.storage
              .from('listings')
              .upload(filename, new Uint8Array(fileBuffer), {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('listings')
              .getPublicUrl(filename);
            
            return publicUrl;
          } catch (err) {
            console.error(`Upload error for image ${i}:`, err);
            return null;
          }
        })());
      }
    }

    const uploadedImages = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);

    if (uploadedImages.length === 0) {
      return NextResponse.json({ error: 'At least 1 image required' }, { status: 400 });
    }

    // Generate unique confirmation token
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Insert listing with status 'pending_verification'
    const { data: listing, error: insertError } = await (supabase as any)
      .from('anunturi')
      .insert({
        user_id: finalUserId,
        title: rawData.title,
        description: rawData.description,
        price: parseFloat(rawData.price) || 0,
        category_id: rawData.categoryId,
        subcategory_id: rawData.subcategoryId,
        location: rawData.location,
        phone: rawData.phone,
        contact_email: contactEmail,
        images: uploadedImages,
        status: 'pending_verification', // New mandatory state
        confirmation_token: confirmationToken,
        email_confirmed: false,
        is_premium: false,
        is_featured: false
      })
      .select('id, title, created_at, status')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create listing', details: insertError.message }, { status: 500 });
    }

    // 💰 CREDIT DEDUCTION
    if (categoryInfo && listing?.id) {
      const creditsToDeduct = categoryInfo.creditsRequired;
      await supabase.from('user_profiles').update({ credits_balance: (userCredits - creditsToDeduct) }).eq('user_id', finalUserId);
      await supabase.from('credits_transactions').insert({
        user_id: finalUserId,
        credits_amount: -creditsToDeduct,
        transaction_type: 'spend',
        status: 'completed',
        description: `Postare anunț în categoria "${categoryInfo.name}"`
      });
    }

    // Trigger AI validation asynchronously
    if (listing?.id) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const host = request.headers.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      fetch(`${baseUrl}/api/ai-validation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id })
      }).catch(err => console.error('AI trigger error:', err));
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        status: 'pending_verification',
        message: 'Anunț creat. Verifică email-ul pentru confirmare după validarea AI.'
      }
    });

  } catch (error) {
    console.error('❌ POST /api/anunturi error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { adData } = await request.json();

    // Create FormData from adData
    const formData = new FormData();
    Object.entries(adData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Use default contact email
    formData.append('contact_email', DEFAULT_CONTACT_EMAIL);

    // Create a new request with the FormData
    const newRequest = new Request(request.url, {
      method: 'POST',
      body: formData
    });

    // Call the POST handler
    return POST(newRequest);

  } catch (error) {
    console.error('❌ PUT /api/anunturi error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}