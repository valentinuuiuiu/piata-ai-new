-- Setup Supabase pg_cron for frequent automation jobs
-- This allows us to run jobs more frequently than Vercel's daily limit

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule existing jobs to update them
SELECT cron.unschedule('shopping-agents-hourly');
SELECT cron.unschedule('auto-repost-30min');
SELECT cron.unschedule('social-media-6h');

-- Shopping Agents Runner - Every Hour
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/shopping-agents-runner',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer dc14109cc7bd71b7cacb34c9ba3c3710d06a280bd6b8e5a1cb8c91bd1bd222a2'
    )
  ) as request_id;
  $$
);

-- Auto-Repost - Every 30 Minutes
SELECT cron.schedule(
  'auto-repost-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/auto-repost',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer dc14109cc7bd71b7cacb34c9ba3c3710d06a280bd6b8e5a1cb8c91bd1bd222a2'
    )
  ) as request_id;
  $$
);

-- Social Media Generator - Every 6 Hours
SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/social-media-generator',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer dc14109cc7bd71b7cacb34c9ba3c3710d06a280bd6b8e5a1cb8c91bd1bd222a2'
    )
  ) as request_id;
  $$
);

-- View all scheduled cron jobs
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('job-name-here');

-- To see job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;