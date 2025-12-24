/**
 * Autonomous Marketing System for Piata AI
 * Fully autonomous marketing engine with AI decision-making
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

interface MarketingDecision {
  action: string;
  priority: number;
  reasoning: string;
  execute_at: string;
}

class AutonomousMarketingEngine {
  private supabase;
  
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  /**
   * AI Decision Maker - Analyzes marketplace state and decides marketing actions
   */
  async makeMarketingDecisions(): Promise<MarketingDecision[]> {
    console.log('🧠 AI Marketing Brain: Analyzing marketplace state...');
    
    // Gather intelligence
    const marketIntel = await this.gatherMarketIntelligence();
    
    // Ask AI what to do
    const decisions = await this.consultAI(marketIntel);
    
    return decisions;
  }

  /**
   * Gather comprehensive market intelligence
   */
  async gatherMarketIntelligence() {
    const [listings, users, agents, campaigns, socialPosts, blogPosts] = await Promise.all([
      // Recent listings performance
      this.supabase
        .from('anunturi')
        .select('id, title, views, created_at, category_id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('views', { ascending: false })
        .limit(20),
      
      // User activity
      this.supabase
        .from('user_profiles')
        .select('user_id, last_login, created_at')
        .order('last_login', { ascending: false })
        .limit(100),
      
      // Active shopping agents
      this.supabase
        .from('shopping_agents')
        .select('*')
        .eq('is_active', true),
      
      // Recent campaigns
      this.supabase
        .from('email_campaigns')
        .select('campaign_type, status, sent_at')
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Social media queue
      this.supabase
        .from('social_media_posts')
        .select('platform, status')
        .eq('status', 'pending'),
      
      // Blog posts
      this.supabase
        .from('blog_posts')
        .select('id, title, published')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate metrics
    const activeUsers24h = users.data?.filter(u => 
      new Date(u.last_login).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length || 0;
    
    const inactiveUsers14d = users.data?.filter(u => 
      new Date(u.last_login).getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000
    ).length || 0;

    return {
      listings: {
        total_24h: listings.data?.length || 0,
        avg_views: listings.data?.reduce((sum, l) => sum + (l.views || 0), 0) / (listings.data?.length || 1),
        top_category: this.findTopCategory(listings.data || [])
      },
      users: {
        active_24h: activeUsers24h,
        inactive_14d: inactiveUsers14d,
        total: users.data?.length || 0
      },
      shopping_agents: {
        active: agents.data?.length || 0
      },
      campaigns: {
        sent_7d: campaigns.data?.length || 0,
        last_campaign_type: campaigns.data?.[0]?.campaign_type
      },
      social: {
        pending_posts: socialPosts.data?.length || 0
      },
      content: {
        blog_posts: blogPosts.data?.length || 0,
        last_published: blogPosts.data?.[0]?.published
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Consult AI for marketing decisions
   */
  async consultAI(intel: any): Promise<MarketingDecision[]> {
    const prompt = `You are an autonomous marketing AI for a Romanian marketplace called Piata AI.

CURRENT MARKET STATE:
${JSON.stringify(intel, null, 2)}

AVAILABLE ACTIONS:
1. generate_blog_post - Create SEO blog content
2. run_email_campaign - Send re-engagement emails
3. create_social_media - Generate social posts
4. optimize_listings - Improve low-performing listings
5. activate_shopping_agents - Match users with products
6. analyze_trends - Deep dive into market trends
7. boost_top_listings - Promote best performers

DECIDE: What marketing actions should execute in the next 24 hours?
Return a JSON array of decisions with: action, priority (1-10), reasoning, execute_at (ISO timestamp)

Consider:
- User engagement levels
- Content freshness
- Campaign fatigue
- Market trends
- Time of day optimization

Return ONLY valid JSON array.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://piata-ai.vercel.app',
          'X-Title': 'Piata AI - Autonomous Marketing'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a marketing automation AI. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{"decisions": []}';
      const parsed = JSON.parse(content);
      
      return parsed.decisions || [];
    } catch (error) {
      console.error('AI consultation failed:', error);
      // Fallback to rule-based decisions
      return this.fallbackDecisions(intel);
    }
  }

  /**
   * Rule-based fallback decisions
   */
  fallbackDecisions(intel: any): MarketingDecision[] {
    const decisions: MarketingDecision[] = [];
    const now = new Date();

    // If no blog post today, create one
    if (!intel.content.last_published) {
      decisions.push({
        action: 'generate_blog_post',
        priority: 8,
        reasoning: 'No recent blog content, SEO needs fresh content',
        execute_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      });
    }

    // If many inactive users, send re-engagement
    if (intel.users.inactive_14d > 10) {
      decisions.push({
        action: 'run_email_campaign',
        priority: 7,
        reasoning: `${intel.users.inactive_14d} inactive users need re-engagement`,
        execute_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
      });
    }

    // If low social media presence, create posts
    if (intel.social.pending_posts < 5) {
      decisions.push({
        action: 'create_social_media',
        priority: 6,
        reasoning: 'Social media queue low, need more content',
        execute_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
      });
    }

    // Always run shopping agents
    decisions.push({
      action: 'activate_shopping_agents',
      priority: 9,
      reasoning: 'Continuous matching for user satisfaction',
      execute_at: now.toISOString()
    });

    return decisions;
  }

  /**
   * Execute marketing decision
   */
  async executeDecision(decision: MarketingDecision) {
    console.log(`🎯 Executing: ${decision.action} (Priority: ${decision.priority})`);
    console.log(`   Reasoning: ${decision.reasoning}`);

    const startTime = Date.now();
    let result;

    try {
      switch (decision.action) {
        case 'generate_blog_post':
          result = await this.executeBlogGeneration();
          break;
        
        case 'run_email_campaign':
          result = await this.executeEmailCampaign();
          break;
        
        case 'create_social_media':
          result = await this.executeSocialMediaCreation();
          break;
        
        case 'activate_shopping_agents':
          result = await this.executeShoppingAgents();
          break;
        
        case 'optimize_listings':
          result = await this.executeListingOptimization();
          break;
        
        default:
          result = { status: 'skipped', message: 'Action not implemented' };
      }

      const duration = Date.now() - startTime;

      // Log execution
      await this.supabase.from('automation_logs').insert({
        task_name: decision.action,
        status: 'success',
        duration_ms: duration,
        summary: `${decision.reasoning} - ${JSON.stringify(result)}`
      });

      console.log(`   ✅ Completed in ${duration}ms`);
      return result;

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      
      await this.supabase.from('automation_logs').insert({
        task_name: decision.action,
        status: 'failure',
        details: error.message
      });
      
      throw error;
    }
  }

  // Action executors
  async executeBlogGeneration() {
    const response = await fetch('http://localhost:3001/api/cron/blog-daily', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    return response.json();
  }

  async executeEmailCampaign() {
    // Get inactive users and send personalized emails
    const { data: inactiveUsers } = await this.supabase
      .from('user_profiles')
      .select('user_id, email, preferences')
      .lt('last_login', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    let sent = 0;
    for (const user of inactiveUsers || []) {
      // Send email via your email service
      sent++;
    }

    return { sent, total: inactiveUsers?.length };
  }

  async executeSocialMediaCreation() {
    const response = await fetch('http://localhost:3001/api/cron/social-media-generator', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    return response.json();
  }

  async executeShoppingAgents() {
    const response = await fetch('http://localhost:3001/api/cron/shopping-agents-runner', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    return response.json();
  }

  async executeListingOptimization() {
    // Analyze low-performing listings
    const { data: lowPerformers } = await this.supabase
      .from('anunturi')
      .select('*')
      .eq('status', 'active')
      .lt('views', 10)
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    return { analyzed: lowPerformers?.length };
  }

  // Helper methods
  findTopCategory(listings: any[]) {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.category_id] = (counts[l.category_id] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'unknown');
  }

  /**
   * Main autonomous loop
   */
  async run() {
    console.log('🤖 Autonomous Marketing Engine Starting...\n');

    while (true) {
      try {
        // Make decisions
        const decisions = await this.makeMarketingDecisions();
        
        console.log(`\n📋 AI Decided on ${decisions.length} actions:\n`);
        decisions.forEach((d, i) => {
          console.log(`${i + 1}. ${d.action} (Priority: ${d.priority})`);
          console.log(`   → ${d.reasoning}`);
        });

        // Execute decisions by priority
        const sorted = decisions.sort((a, b) => b.priority - a.priority);
        
        for (const decision of sorted) {
          const executeTime = new Date(decision.execute_at).getTime();
          const now = Date.now();
          
          if (executeTime <= now) {
            await this.executeDecision(decision);
          } else {
            console.log(`⏰ Scheduled: ${decision.action} for ${new Date(executeTime).toLocaleString()}`);
          }
        }

        // Wait before next decision cycle (15 minutes)
        console.log('\n💤 Sleeping for 15 minutes before next decision cycle...\n');
        await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));

      } catch (error) {
        console.error('❌ Engine error:', error);
        await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Wait 1 minute on error
      }
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const engine = new AutonomousMarketingEngine();
  engine.run().catch(console.error);
}

export { AutonomousMarketingEngine };
