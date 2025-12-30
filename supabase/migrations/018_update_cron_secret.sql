-- Update cron jobs with correct CRON_SECRET

-- Unschedule existing jobs
SELECT cron.unschedule('shopping-agents-hourly');
SELECT cron.unschedule('auto-repost-30min');
SELECT cron.unschedule('social-media-6h');

-- Reschedule with updated secret
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/shopping-agents-runner',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer test-secret-1766568744'
    )
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'auto-repost-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/auto-repost',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer test-secret-1766568744'
    )
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/social-media-generator',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer test-secret-1766568744'
    )
  ) as request_id;
  $$
);