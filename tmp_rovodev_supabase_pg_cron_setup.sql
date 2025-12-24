-- Supabase pg_cron Setup for Piata AI Autonomous Marketing
-- Run this in Supabase SQL Editor

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for making API calls
CREATE EXTENSION IF NOT EXISTS http;

-- Store CRON_SECRET in settings
-- Replace YOUR_CRON_SECRET with actual secret
ALTER DATABASE postgres SET app.settings.cron_secret TO 'test-secret-1735040064';
ALTER DATABASE postgres SET app.settings.app_url TO 'http://localhost:3001';

-- Function to call Next.js API endpoints
CREATE OR REPLACE FUNCTION call_nextjs_api(endpoint TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  app_url text;
  cron_secret text;
BEGIN
  -- Get settings
  app_url := current_setting('app.settings.app_url', true);
  cron_secret := current_setting('app.settings.cron_secret', true);
  
  -- Make HTTP request
  SELECT content::jsonb INTO result
  FROM http((
    'POST',
    app_url || endpoint,
    ARRAY[http_header('Authorization', 'Bearer ' || cron_secret)],
    'application/json',
    '{}'
  )::http_request);
  
  RETURN result;
END;
$$;

-- ========================================
-- CRON JOBS SETUP
-- ========================================

-- 1. Shopping Agents (Every hour)
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT call_nextjs_api('/api/cron/shopping-agents-runner');
  $$
);

-- 2. Blog Generation (Daily at 9 AM UTC)
SELECT cron.schedule(
  'blog-daily-9am',
  '0 9 * * *',  -- 9 AM UTC
  $$
  SELECT call_nextjs_api('/api/cron/blog-daily');
  $$
);

-- 3. Social Media Content (Every 6 hours)
SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *',  -- Every 6 hours
  $$
  SELECT call_nextjs_api('/api/cron/social-media-generator');
  $$
);

-- 4. Email Re-engagement (Daily at 10 AM UTC)
SELECT cron.schedule(
  'email-campaign-daily',
  '0 10 * * *',  -- 10 AM UTC
  $$
  SELECT call_nextjs_api('/api/cron/marketing-email-campaign');
  $$
);

-- 5. Jules Orchestrator (Daily at 8 AM UTC)
SELECT cron.schedule(
  'jules-orchestrator-daily',
  '0 8 * * *',  -- 8 AM UTC
  $$
  SELECT call_nextjs_api('/api/cron/jules-orchestrator');
  $$
);

-- 6. Listing Auto-Repost (Every 15 minutes) - Optional, can be intensive
SELECT cron.schedule(
  'auto-repost-15min',
  '*/15 * * * *',  -- Every 15 minutes
  $$
  SELECT call_nextjs_api('/api/cron/auto-repost');
  $$
);

-- ========================================
-- MONITORING & MANAGEMENT
-- ========================================

-- View all scheduled cron jobs
SELECT * FROM cron.job;

-- View cron job execution history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;

-- Function to get cron job status
CREATE OR REPLACE FUNCTION get_cron_status()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  last_run_time timestamp with time zone,
  last_run_status text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    j.jobid,
    j.schedule,
    j.command,
    j.nodename,
    j.nodeport,
    j.database,
    j.username,
    j.active,
    jr.start_time as last_run_time,
    jr.status as last_run_status
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, status
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) jr ON true
  ORDER BY j.jobid;
$$;

-- View cron status
SELECT * FROM get_cron_status();

-- ========================================
-- CLEANUP & MANAGEMENT FUNCTIONS
-- ========================================

-- Unschedule a job (by name)
-- SELECT cron.unschedule('shopping-agents-hourly');

-- Unschedule all jobs (DANGER!)
-- SELECT cron.unschedule(jobid) FROM cron.job;

-- Pause/Resume a job
-- UPDATE cron.job SET active = false WHERE jobname = 'shopping-agents-hourly';
-- UPDATE cron.job SET active = true WHERE jobname = 'shopping-agents-hourly';

-- Clean old execution logs (keep last 1000)
CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM cron.job_run_details
  WHERE runid NOT IN (
    SELECT runid FROM cron.job_run_details
    ORDER BY start_time DESC
    LIMIT 1000
  );
END;
$$;

-- Schedule log cleanup (once per week)
SELECT cron.schedule(
  'cleanup-cron-logs',
  '0 2 * * 0',  -- 2 AM every Sunday
  $$
  SELECT cleanup_old_cron_logs();
  $$
);

-- ========================================
-- VERIFICATION
-- ========================================

-- Test the API calling function
SELECT call_nextjs_api('/api/health');

-- Verify cron jobs are created
SELECT 
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname LIKE '%piata%' OR command LIKE '%/api/cron/%';

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON FUNCTION call_nextjs_api IS 'Calls Next.js API endpoints with proper authentication';
COMMENT ON FUNCTION get_cron_status IS 'Returns status of all cron jobs with last execution details';
COMMENT ON FUNCTION cleanup_old_cron_logs IS 'Removes old cron execution logs, keeping only the last 1000';

-- ========================================
-- DONE!
-- ========================================

SELECT 'Piata AI Cron Setup Complete! ✅' as status;
SELECT 'Total Jobs Scheduled: ' || COUNT(*)::text as jobs FROM cron.job;
