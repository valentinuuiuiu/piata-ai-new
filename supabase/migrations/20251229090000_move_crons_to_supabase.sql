-- Migration to move Cron Jobs from Vercel to Supabase pg_cron
-- This bypasses the 2-job limit on Vercel Hobby plan

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to get the API URL (defaults to production if not set)
CREATE OR REPLACE FUNCTION get_app_url()
RETURNS text AS $$
BEGIN
    RETURN current_setting('app.settings.app_url', true);
EXCEPTION WHEN OTHERS THEN
    RETURN 'https://piata-ai.vercel.app';
END;
$$ LANGUAGE plpgsql;

-- Function to get the Cron Secret
CREATE OR REPLACE FUNCTION get_cron_secret()
RETURNS text AS $$
BEGIN
    RETURN current_setting('app.settings.cron_secret', true);
EXCEPTION WHEN OTHERS THEN
    -- Fallback placeholder, user should set this setting or replace this string
    RETURN 'dc14109cc7bd71b7cacb34c9ba3c3710d06a280bd6b8e5a1cb8c91bd1bd222a2';
END;
$$ LANGUAGE plpgsql;

-- Unschedule existing Vercel-bound jobs to avoid duplicates
SELECT cron.unschedule('jules-orchestrator-daily');
SELECT cron.unschedule('shopping-agents-hourly');
SELECT cron.unschedule('auto-repost-30min');
SELECT cron.unschedule('social-media-6h');
SELECT cron.unschedule('trending-topics-5min');
SELECT cron.unschedule('marketing-automation-15min');


-- 1. Jules Orchestrator (Daily Mission) - Every Morning at 8:00 AM RO time (6:00 UTC)
SELECT cron.schedule(
  'jules-orchestrator-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:=(get_app_url() || '/api/cron/jules-orchestrator'),
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_cron_secret()
    )
  ) as request_id;
  $$
);

-- 2. Shopping Agents (Matchmaking) - Hourly
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:=(get_app_url() || '/api/cron/shopping-agents-runner'),
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_cron_secret()
    )
  ) as request_id;
  $$
);

-- 3. Social Media Generator - Every 6 Hours
SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:=(get_app_url() || '/api/cron/social-media-generator'),
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_cron_secret()
    )
  ) as request_id;
  $$
);

-- 4. Trending Topics - Every 4 Hours (instead of 5 mins to save resources on Hobby)
SELECT cron.schedule(
  'trending-topics-4h',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url:=(get_app_url() || '/api/cron/trending-topics'),
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_cron_secret()
    )
  ) as request_id;
  $$
);

-- 5. Autonomous Marketing - Every 2 Hours
SELECT cron.schedule(
  'autonomous-marketing-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:=(get_app_url() || '/api/cron/autonomous-marketing'),
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_cron_secret()
    )
  ) as request_id;
  $$
);
