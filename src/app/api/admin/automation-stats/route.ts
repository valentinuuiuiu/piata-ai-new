import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This function fetches real-time automation statistics from the Supabase database.
async function getAutomationStatsFromDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Get the number of emails sent in the last 24 hours
  const { count: emailsSent, error: emailError } = await supabase
    .from('email_campaigns')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', twentyFourHoursAgo);

  if (emailError) console.error('Error fetching email stats:', emailError.message);

  // 2. Get the number of agent matches found in the last 24 hours
  const { count: matchesFound, error: matchError } = await supabase
    .from('agent_matches')
    .select('id', { count: 'exact', head: true })
    .gte('matched_at', twentyFourHoursAgo);

  if (matchError) console.error('Error fetching match stats:', matchError.message);

  // 3. Get the number of social media posts generated in the last 24 hours
  const { count: socialPosts, error: postError } = await supabase
    .from('social_media_posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', twentyFourHoursAgo);

  if (postError) console.error('Error fetching social post stats:', postError.message);

  // 4. Calculate the automation success rate from a logs table
  // NOTE: This assumes a table `automation_logs` exists with `status` ('success'/'failure')
  // and `execution_time` columns. This should be created to make this metric fully functional.
  const { data: logs, error: logError } = await supabase
    .from('automation_logs')
    .select('status')
    .gte('execution_time', twentyFourHoursAgo);

  if (logError) console.error('Error fetching automation logs:', logError.message);

  const totalRuns = logs?.length || 0;
  const successfulRuns = logs?.filter(log => log.status === 'success').length || 0;
  const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 100;

  return {
    emailsSent: emailsSent || 0,
    matchesFound: matchesFound || 0,
    socialPosts: socialPosts || 0,
    successRate: successRate,
  };
}

export async function GET(request: Request) {
  try {
    // We could add an admin-role security check here in the future
    const stats = await getAutomationStatsFromDatabase();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching automation stats:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching automation statistics.', details: error.message },
      { status: 500 }
    );
  }
}
