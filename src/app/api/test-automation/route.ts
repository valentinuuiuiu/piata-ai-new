import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'test_ai_validation') {
      // Create a test listing to trigger AI validation
      const supabase = createServiceClient();
      
      const { data: testUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'test@piata-ai.ro')
        .single();

      if (userError || !testUser) {
        // Create test user if doesn't exist
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            id: 'test-user-' + Date.now(),
            email: 'test@piata-ai.ro',
            name: 'Test User AI',
            phone: '0712345678'
          })
          .select('id')
          .single();

        if (newUser) {
          // Create user profile
          await supabase
            .from('user_profiles')
            .insert({
              user_id: newUser.id,
              credits_balance: 100
            });
        }
      }

      // Create test listing
      const { data: testListing, error: listingError } = await supabase
        .from('anunturi')
        .insert({
          user_id: testUser?.id || 'test-user-' + Date.now(),
          category_id: 3, // Electronice
          title: 'iPhone 15 Pro Max 256GB - Test AI Validation',
          description: 'Vând iPhone 15 Pro Max, 256GB, culoare albastru titan. Stare perfectă, funcțional 100%, ambalaj original. Accept testare în orice magazin. Preț negociabil. Telefon arată impecabil, fără zgârieturi, baterie sănătă (95% sănătate). Vine cu încărcător, cutie și toate accesoriile originale.',
          price: 4500,
          location: 'București',
          phone: '0712345678',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg'
          ],
          status: 'pending_ai'
        })
        .select('id, title, created_at')
        .single();

      if (listingError) {
        return NextResponse.json({ error: listingError }, { status: 500 });
      }

      // Trigger AI validation manually
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-ai.vercel.app'}/api/ai-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: testListing.id,
          autoApprove: true
        })
      });

      const validation = await validationResponse.json();

      return NextResponse.json({
        success: true,
        testListing,
        validation,
        message: 'Test listing created and AI validation triggered'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Test automation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}