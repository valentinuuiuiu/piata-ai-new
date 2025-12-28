import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Default contact email for all listings
const DEFAULT_CONTACT_EMAIL = 'claude.dev@mail.com';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Configure route to handle larger payloads
export const maxDuration = 60; // 60 seconds for Vercel Pro
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient();

    console.log('GET /api/anunturi - Starting Supabase query with service client');

    // Query all anunturi
    const { data: listings, error } = await supabase
      .from('anunturi')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase anunturi query error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));

      // Return empty array instead of error to prevent frontend crash
      console.log('Returning empty array due to database error');
      return NextResponse.json([]);
    }

    console.log(`Successfully fetched ${listings?.length || 0} listings from Supabase`);

    // Transform images if they're stored as JSON strings or blobs
    const transformedListings = listings?.map((listing: any) => {
      let images = [];
      try {
        if (Array.isArray(listing.images)) {
          images = listing.images;
        } else if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images || '[]');
        } else if (listing.images && typeof listing.images === 'object') {
          // Handle Supabase blob objects
          if (listing.images.length !== undefined) {
            images = Array.from({ length: listing.images.length }, (_, i) => {
              const blob = listing.images[i];
              return URL.createObjectURL(blob);
            });
          } else {
            images = [];
          }
        } else {
          images = [];
        }
      } catch (e) {
        console.error('Error parsing images for listing', listing.id, e);
        images = [];
      }
      return {
        ...listing,
        images,
        description: listing.description || '',
      };
    }) || [];

    return NextResponse.json(transformedListings);
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

    // Validate category_id
    if (isNaN(rawData.categoryId)) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }

    // 🎯 CREDIT SYSTEM: Check if category requires credits
    const PAID_CATEGORIES = {
      1: { name: 'Imobiliare', creditsRequired: 5 }, // Real Estate
      11: { name: 'Matrimoniale', creditsRequired: 3 } // Matrimonial/Dating
    };

    const categoryInfo = PAID_CATEGORIES[rawData.categoryId as keyof typeof PAID_CATEGORIES];
    
    // Check user's credit balance (needed for both validation and deduction)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', finalUserId)
      .single();

    const userCredits = (profile as any)?.credits_balance || 0;
    
    if (categoryInfo) {
      console.log(`💰 Category "${categoryInfo.name}" requires ${categoryInfo.creditsRequired} credits`);
      console.log(`User has ${userCredits} credits, needs ${categoryInfo.creditsRequired}`);

      if (userCredits < categoryInfo.creditsRequired) {
        console.log(`❌ Insufficient credits for ${categoryInfo.name}`);
        return NextResponse.json({
          error: 'Insufficient credits',
          message: `Categoria "${categoryInfo.name}" necesită ${categoryInfo.creditsRequired} credite. Ai doar ${userCredits} credite.`,
          requiredCredits: categoryInfo.creditsRequired,
          currentCredits: userCredits,
          redirectToCredits: true,
          categoryName: categoryInfo.name
        }, { status: 402 });
      }

      console.log(`✅ User has sufficient credits for ${categoryInfo.name}`);
    } else {
      console.log('📝 Free category - no credits required');
    }

    console.log('Parsed data:', rawData);

    // Validate required fields
    if (!rawData.title || !rawData.categoryId) {
      console.log('Validation failed: missing title or category');
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Use default contact email for all listings
    const contactEmail = DEFAULT_CONTACT_EMAIL;
    console.log('Using default contact email for ad creation');

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
        price: parseFloat(rawData.price) || 0,
        category_id: rawData.categoryId,
        subcategory_id: rawData.subcategoryId,
        location: rawData.location,
        phone: rawData.phone,
        images: images, // Store as JSON array
        status: 'active', // Immediate approval
        is_premium: false,
        is_featured: false
      })
      .select('id, title, created_at, status')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create listing', 
        details: insertError.message 
      }, { status: 500 });
    }

    console.log('✅ Listing created successfully:', listing);

    // 💰 CREDIT DEDUCTION: Deduct credits if category requires them
    if (categoryInfo && listing?.id) {
      console.log(`💳 Deducting ${categoryInfo.creditsRequired} credits from user ${finalUserId}`);
      
      const creditsToDeduct = categoryInfo.creditsRequired;
      
      // Deduct credits from user profile
      const { error: deductionError } = await supabase
        .from('user_profiles')
        .update({
          credits_balance: (userCredits - creditsToDeduct)
        })
        .eq('user_id', finalUserId);

      if (deductionError) {
        console.error('❌ Credit deduction failed:', deductionError);
        // Don't fail the whole operation, just log the error
      } else {
        console.log(`✅ Successfully deducted ${creditsToDeduct} credits`);
        
        // Record the transaction
        const { error: transactionError } = await supabase
          .from('credits_transactions')
          .insert({
            user_id: finalUserId,
            credits_amount: -creditsToDeduct,
            transaction_type: 'spend',
            status: 'completed',
            description: `Postare anunț în categoria "${categoryInfo.name}"`
          });

        if (transactionError) {
          console.error('❌ Transaction record failed:', transactionError);
        } else {
          console.log('✅ Transaction recorded successfully');
        }
      }
    }

    // Trigger AI validation asynchronously
    if (listing?.id) {
      console.log(`🚀 Triggering AI validation for listing ${listing.id}`);
      
      // Don't wait for AI validation to return response
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-ai.vercel.app'}/api/ai-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          autoApprove: true
        })
      }).catch(error => {
        console.error('❌ AI validation trigger failed:', error);
      });
    }

    // Prepare success message
    let successMessage = 'Anunț creat și trimis spre validare AI';
    if (categoryInfo) {
      successMessage = `Anunț creat în "${categoryInfo.name}" (-${categoryInfo.creditsRequired} credite) și trimis spre validare AI`;
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        message: successMessage,
        creditsDeducted: categoryInfo?.creditsRequired || 0,
        remainingCredits: categoryInfo ? (userCredits - categoryInfo.creditsRequired) : undefined
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