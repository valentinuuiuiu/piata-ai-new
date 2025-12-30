-- Consolidate crons into jules-orchestrator

-- Unschedule individual jobs to stay within Hobby limits and simplify orchestration
SELECT cron.unschedule('shopping-agents-hourly');
SELECT cron.unschedule('auto-repost-30min');
SELECT cron.unschedule('social-media-6h');

-- Schedule the orchestrator to run every 30 minutes
-- It will read JULES_DAILY_DIRECTIVE.md and execute the appropriate tasks for the current hour
SELECT cron.schedule(
  'jules-orchestrator',
  '*/30 * * * *',
  $$
  SELECT net.http_get(
    url:='https://piata-ai.vercel.app/api/cron/jules-orchestrator',
    headers:=jsonb_build_object(
      'Authorization', 'Bearer 5f8d9e2a1b4c7d0e3f6a9b2c5e8d1a4f'
    )
  ) as request_id;
  $$
);
