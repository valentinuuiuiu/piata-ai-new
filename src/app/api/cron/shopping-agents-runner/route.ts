import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email-automation';

/**
 * Shopping Agents Runner
 * Runs all active shopping agents and sends notifications
 * Runs hourly
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[AGENTS] Unauthorized cron request');
    }

    console.log('[AGENTS] Running shopping agents...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all active shopping agents
    const { data: agents, error } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('[AGENTS] Error fetching agents:', error);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ message: 'No active agents', processed: 0 });
    }

    const results = [];
    let totalMatches = 0;

    for (const agent of agents) {
      try {
        // Check recent listings that match agent criteria
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const filters = agent.filters as any;
        let query = supabase
          .from('anunturi')
          .select('*')
          .eq('status', 'active')
          .gte('created_at', oneHourAgo);

        // Apply filters
        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        const { data: listings, error: listingsError } = await query.limit(50);

        if (listingsError) {
          console.error(`[AGENTS] Error fetching listings for agent ${agent.id}:`, listingsError);
          continue;
        }

        // Filter by keywords in title/description
        const matchedListings = listings?.filter((listing: any) => {
          if (!filters.keywords || filters.keywords.length === 0) return true;
          
          const searchText = `${listing.title} ${listing.description}`.toLowerCase();
          return filters.keywords.some((keyword: string) => 
            searchText.includes(keyword.toLowerCase())
          );
        }) || [];

        if (matchedListings.length === 0) {
          results.push({
            agent_id: agent.id,
            agent_name: agent.name,
            matches: 0,
            status: 'no_matches'
          });
          continue;
        }

        // Save matches to database
        const matches = matchedListings.map((listing: any) => {
          // Calculate match score
          let score = 50; // Base score
          
          // Boost score for keyword matches in title
          if (filters.keywords) {
            const titleLower = listing.title.toLowerCase();
            filters.keywords.forEach((keyword: string) => {
              if (titleLower.includes(keyword.toLowerCase())) score += 15;
            });
          }
          
          // Boost for price in range
          if (filters.minPrice && filters.maxPrice) {
            const priceRange = filters.maxPrice - filters.minPrice;
            const priceDiff = Math.abs(listing.price - (filters.minPrice + priceRange / 2));
            score += Math.max(0, 20 - (priceDiff / priceRange) * 20);
          }
          
          // Cap at 100
          score = Math.min(100, score);

          return {
            agent_id: agent.id,
            listing_id: listing.id,
            match_score: Math.round(score),
            matched_at: new Date().toISOString()
          };
        });

        const { error: insertError } = await supabase
          .from('agent_matches')
          .insert(matches)
          .select();

        // Update agent stats
        await supabase
          .from('shopping_agents')
          .update({
            last_checked_at: new Date().toISOString(),
            matches_found: agent.matches_found + matches.length
          })
          .eq('id', agent.id);

        totalMatches += matches.length;

        // Send email notification if there are good matches
        const highScoreMatches = matches.filter(m => m.match_score >= 80);
        
        if (highScoreMatches.length > 0) {
          // Get user email
          const { data: user } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('user_id', agent.user_id)
            .single();

          if (user?.email) {
            await sendNotificationEmail(user, agent, highScoreMatches, matchedListings);
          }
        }

        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          matches: matches.length,
          high_score_matches: highScoreMatches.length,
          status: 'success'
        });

      } catch (error) {
        console.error(`[AGENTS] Error processing agent ${agent.id}:`, error);
        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`[AGENTS] Processed ${agents.length} agents, found ${totalMatches} matches`);

    return NextResponse.json({
      success: true,
      agentsProcessed: agents.length,
      totalMatches,
      results
    });

  } catch (error) {
    console.error('[AGENTS] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function sendNotificationEmail(user: any, agent: any, matches: any[], listings: any[]) {
  const matchedListings = matches.map(m => 
    listings.find(l => l.id === m.listing_id)
  ).filter(Boolean).slice(0, 5);

  const listingsHtml = matchedListings.map(listing => `
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3>${listing.title}</h3>
      <p><strong>Preț:</strong> ${listing.price} RON</p>
      <p><strong>Locație:</strong> ${listing.location}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/anunt/${listing.id}" 
         style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Vezi anunțul →
      </a>
    </div>
  `).join('');

  await sendEmail({
    to: user.email,
    subject: `🎯 ${matches.length} oferte noi pentru agentul "${agent.name}"`,
    html: `
      <h2>Bună ${user.full_name || 'Utilizator'}!</h2>
      <p>Agentul tău de cumpărături "<strong>${agent.name}</strong>" a găsit ${matches.length} oferte noi!</p>
      <h3>Cele mai bune potriviri:</h3>
      ${listingsHtml}
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/shopping-agents">Vezi toate potrivirile →</a>
      </p>
    `
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
