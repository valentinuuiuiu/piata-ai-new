-- Setup Supabase pg_cron for frequent automation jobs
-- This allows us to run jobs more frequently than Vercel's daily limit

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Store cron secret in settings
ALTER DATABASE postgres SET app.settings.cron_secret TO 'your-cron-secret-here';

-- Shopping Agents Runner - Every Hour
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/shopping-agents-runner',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
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
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
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
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
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
