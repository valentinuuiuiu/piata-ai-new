-- Setup Supabase pg_cron for frequent automation jobs
-- This allows us to run jobs more frequently than Vercel's daily limit on the Hobby plan.

-- Step 1: Enable necessary extensions in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Set the CRON_SECRET securely in your Supabase project.
-- Go to your Supabase Dashboard -> Project Settings -> Database -> Custom configuration.
-- Add a new configuration with the name 'app.settings.cron_secret' and set its value to your CRON_SECRET.
-- This keeps your secret secure and avoids hardcoding it in the script.
-- Example: app.settings.cron_secret = 'your-super-secret-cron-token'

-- Step 3: Run the following schedule commands.

-- Shopping Agents Runner - Every Hour
-- This job calls the main orchestrator and tells it to run only the 'shopping-agents-runner' task.
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *', -- Runs at the beginning of every hour
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/jules-orchestrator?task=shopping-agents-runner',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) as request_id;
  $$
);

-- Auto-Repost - Every 30 Minutes
-- This job calls the main orchestrator and tells it to run only the 'auto-repost' task.
SELECT cron.schedule(
  'auto-repost-30min',
  '*/30 * * * *', -- Runs every 30 minutes
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/jules-orchestrator?task=auto-repost',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) as request_id;
  $$
);

-- Social Media Generator - Every 6 Hours
-- This job calls the main orchestrator and tells it to run only the 'social-media-generator' task.
SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *', -- Runs every 6 hours
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/jules-orchestrator?task=social-media-generator',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  ) as request_id;
  $$
);

-- HELPFUL COMMANDS for managing cron jobs:
--
-- View all scheduled cron jobs:
-- SELECT * FROM cron.job;
--
-- To unschedule a job:
-- SELECT cron.unschedule('job-name-here'); -- e.g., SELECT cron.unschedule('shopping-agents-hourly');
--
-- To see the history of job runs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
