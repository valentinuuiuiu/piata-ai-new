import { AIOrchestrator } from '@/lib/ai-orchestrator';
import { AgentCapability } from '@/lib/agents/types';
import { createClient } from '@supabase/supabase-js';

/**
 * Generates a daily blog post about marketplace trends using an AI agent
 * and saves it to the database.
 */
export async function generateDailyBlogPost(): Promise<{ success: boolean; blogId?: string; error?: string }> {
  try {
    console.log('Starting daily blog post generation task...');

    const orchestrator = new AIOrchestrator();
    const grokAgent = orchestrator.getAgent('Grok');

    if (!grokAgent) {
      throw new Error('Grok agent not available');
    }

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
        source: 'jules-orchestrator',
        date: new Date().toISOString()
      }
    });

    if (result.status !== 'success') {
      throw new Error(result.error || 'AI generation failed');
    }

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
      .select('id')
      .single();

    if (error) {
      throw new Error(`Database save error: ${error.message}`);
    }

    console.log(`Blog post saved to database with ID: ${data.id}`);
    return { success: true, blogId: data.id };

  } catch (error: any) {
    console.error('Blog generation task failed:', error);
    return { success: false, error: error.message };
  }
}
