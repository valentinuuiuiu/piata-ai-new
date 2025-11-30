import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

// This runs daily to check all active agents
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Starting agent check cron job...');
    
    const supabase = await createClient();

    // Get all active agents
    const { data: agents, error: agentsError } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('is_active', true);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json({ error: agentsError.message }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      console.log('No active agents to check');
      return NextResponse.json({ message: 'No active agents', checked: 0 });
    }

    console.log(`Found ${agents.length} active agents to check`);

    // Get new listings from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: newListings, error: listingsError } = await supabase
      .from('anunturi')
      .select('id, title, description, price, location, category_id, images, created_at')
      .gte('created_at', yesterday)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return NextResponse.json({ error: listingsError.message }, { status: 500 });
    }

    console.log(`Found ${newListings?.length || 0} new listings to check`);

    if (!newListings || newListings.length === 0) {
      return NextResponse.json({ 
        message: 'No new listings to check', 
        agents_checked: agents.length,
        new_listings: 0 
      });
    }

    let totalMatches = 0;
    let agentsWithMatches = 0;

    // Check each agent against new listings
    for (const agent of agents) {
      console.log(`Checking agent: ${agent.name} (ID: ${agent.id})`);
      
      const matches = await checkAgentMatches(agent, newListings);
      
      if (matches.length > 0) {
        agentsWithMatches++;
        totalMatches += matches.length;
        
        // Save matches to database
        await saveMatches(supabase, agent.id, matches);
        
        // Send email notification
        await sendAgentNotification(supabase, agent, matches);
        
        // Update agent stats
        await supabase
          .from('shopping_agents')
          .update({
            last_checked_at: new Date().toISOString(),
            matches_found: agent.matches_found + matches.length,
          })
          .eq('id', agent.id);
      } else {
        // Just update last_checked_at
        await supabase
          .from('shopping_agents')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', agent.id);
      }
    }

    console.log(`✅ Agent check complete! ${totalMatches} matches found for ${agentsWithMatches} agents`);

    return NextResponse.json({
      success: true,
      agents_checked: agents.length,
      new_listings: newListings.length,
      total_matches: totalMatches,
      agents_with_matches: agentsWithMatches,
    });

  } catch (error: any) {
    console.error('Error in agent check cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Use Grok AI to match listings against agent description
async function checkAgentMatches(agent: any, listings: any[]): Promise<any[]> {
  const matches: any[] = [];

  for (const listing of listings) {
    // Basic filter checks first (faster)
    if (agent.filters) {
      const filters = agent.filters as any;
      
      // Price filter
      if (filters.priceMin && listing.price < filters.priceMin) continue;
      if (filters.priceMax && listing.price > filters.priceMax) continue;
      
      // Location filter
      if (filters.location && !listing.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        continue;
      }
      
      // Category filter
      if (filters.category && listing.category_id !== filters.category) {
        continue;
      }
    }

    // AI-powered semantic matching using Grok
    const matchScore = await getAIMatchScore(agent, listing);
    
    if (matchScore >= 70) { // 70% threshold
      matches.push({
        listing_id: listing.id,
        match_score: matchScore,
        listing,
      });
    }
  }

  return matches;
}

// Use Grok-4-Fast to score how well a listing matches agent intent
async function getAIMatchScore(agent: any, listing: any): Promise<number> {
  try {
    const prompt = `You are a shopping assistant matching listings to user preferences.

User is looking for:
"${agent.description}"

Listing details:
Title: ${listing.title}
Description: ${listing.description}
Price: ${listing.price} RON
Location: ${listing.location}

Rate how well this listing matches what the user wants on a scale of 0-100.
Consider: relevance, quality match, price appropriateness, location match.

Respond with ONLY a number between 0-100. No explanation.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piata-ai.ro',
        'X-Title': 'Shopping Agent Matcher',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4-fast',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status);
      return 0;
    }

    const data = await response.json();
    const scoreText = data.choices[0]?.message?.content?.trim() || '0';
    const score = parseInt(scoreText, 10);
    
    return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));

  } catch (error) {
    console.error('Error getting AI match score:', error);
    return 0; // Fail gracefully
  }
}

// Save matches to database
async function saveMatches(supabase: any, agentId: number, matches: any[]) {
  const matchRecords = matches.map(m => ({
    agent_id: agentId,
    listing_id: m.listing_id,
    match_score: m.match_score,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('agent_matches')
    .upsert(matchRecords, { onConflict: 'agent_id,listing_id' });

  if (error) {
    console.error('Error saving matches:', error);
  }
}

// Send email notification to user
async function sendAgentNotification(supabase: any, agent: any, matches: any[]) {
  try {
    // Get user email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', agent.user_id)
      .single();

    const { data: { user } } = await supabase.auth.admin.getUserById(agent.user_id);
    
    if (!user?.email) {
      console.log('No email found for user:', agent.user_id);
      return;
    }

    // Build email content
    const matchList = matches.slice(0, 5).map(m => {
      const listing = m.listing;
      return `
• ${listing.title}
  Preț: ${listing.price} RON
  Locație: ${listing.location}
  Match: ${m.match_score}%
  Link: https://www.piata-ai.ro/anunt/${listing.id}
      `;
    }).join('\n');

    const emailContent = `
Bună!

Agentul tău "${agent.name}" a găsit ${matches.length} anunțuri noi care se potrivesc cu ce cauți!

${matchList}

${matches.length > 5 ? `\n...și încă ${matches.length - 5} anunțuri!\n` : ''}

Vezi toate: https://www.piata-ai.ro/dashboard/agents

---
Piata AI RO - Agenți inteligenți de cumpărături
    `.trim();

    // Send email (using your email system)
    // For now, just log (you'll implement actual email sending)
    console.log(`📧 Would send email to ${user.email}:`, emailContent);

    // TODO: Implement with your email service
    // await sendEmail(user.email, `Agentul "${agent.name}" a găsit ${matches.length} anunțuri!`, emailContent);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
