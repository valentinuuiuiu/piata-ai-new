import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// This endpoint receives Supabase webhook events
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔔 Supabase webhook received:', body);

    // Handle different event types
    const { type, table, record, old_record } = body;

    // Only process INSERT events on anunturi table
    if (type === 'INSERT' && table === 'anunturi') {
      const listingId = record?.id;
      
      if (listingId) {
        console.log(`🚀 New listing detected: ${listingId} - Starting AI validation`);
        
        // Trigger AI validation asynchronously
        // Don't wait for response to keep webhook fast
        triggerAIValidation(listingId).catch(error => {
          console.error('❌ AI validation trigger failed:', error);
        });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function triggerAIValidation(listingId: number) {
  try {
    // Call our AI validation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-ai.vercel.app'}/api/ai-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId,
        autoApprove: true // Enable auto-approval for scores >= 70
      })
    });

    if (!response.ok) {
      throw new Error(`AI validation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ AI validation completed for listing ${listingId}:`, result);

  } catch (error) {
    console.error(`❌ AI validation error for listing ${listingId}:`, error);
    
    // Fallback: mark as pending manual review
    const supabase = createServiceClient();
    await supabase
      .from('anunturi')
      .update({
        status: 'pending_review',
        ai_validation_score: 0,
        ai_validation_issues: ['Automated validation failed'],
        ai_approved: false,
        ai_validated_at: new Date().toISOString()
      })
      .eq('id', listingId);
  }
}

// Handle webhook verification (GET request for Supabase)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Verify webhook token (you should set this in Supabase)
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  
  if (token === webhookSecret) {
    return NextResponse.json({ status: 'verified' });
  }
  
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}