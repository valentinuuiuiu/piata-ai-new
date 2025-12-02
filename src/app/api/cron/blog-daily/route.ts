import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator } from '@/lib/ai-orchestrator';
import { AgentCapability } from '@/lib/agents/types';

/**
 * Daily Blog Post Cron Job
 * Called by Vercel Cron at 9 AM daily
 * 
 * Creates an AI-generated blog post about marketplace trends
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is a Vercel Cron request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron request');
      // In production, you'd return 401 here
      // For now, we'll allow it to run
    }

    console.log('[CRON] Starting daily blog post generation...');

    const orchestrator = new AIOrchestrator();
    
    // Get Grok agent for marketplace insights
    const grokAgent = orchestrator.getAgent('Grok');
    
    if (!grokAgent) {
      throw new Error('Grok agent not available');
    }

    // Generate blog post
    const result = await grokAgent.run({
      id: `blog-${Date.now()}`,
      type: AgentCapability.CONTENT,
      goal: `Create a daily blog post about Romanian marketplace trends. 
      
      Include:
      1. Current hot categories (check recent listings)
      2. Price trends
      3. Popular searches
      4. Tips for buyers/sellers
      
      Write in Romanian, engaging style, 500-700 words.
      Format in HTML with proper headings.`,
      context: {
        source: 'vercel-cron',
        date: new Date().toISOString()
      }
    });

    if (result.status === 'success') {
      // Save to Supabase
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const blogContent = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: `Tendințe Piața ${new Date().toLocaleDateString('ro-RO', { month: 'long', day: 'numeric' })}`,
          content: blogContent,
          published: true,
          published_at: new Date().toISOString(),
          author: 'AI Marketplace Bot',
          tags: ['tendințe', 'piață', 'România']
        })
        .select()
        .single();

      if (error) {
        console.error('[CRON] Database save error:', error);
      } else {
        console.log('[CRON] Blog post saved to database:', data?.id);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Blog post generated and saved',
        blogId: data?.id,
        preview: blogContent.substring(0, 200)
      });
    } else {
      throw new Error(result.error || 'Generation failed');
    }

  } catch (error: any) {
    console.error('[CRON] Blog generation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Allow POST as well (for manual triggering)
export async function POST(req: NextRequest) {
  return GET(req);
}