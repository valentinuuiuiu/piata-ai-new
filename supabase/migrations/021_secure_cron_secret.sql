-- Update jules-orchestrator with production secret
-- Reschedule with the secret from .env.vercel.production for consistency

SELECT cron.unschedule('jules-orchestrator');

SELECT cron.schedule(
  'jules-orchestrator',
  '*/30 * * * *',
  $$
  SELECT net.http_get(
    url:='https://piata-ai.vercel.app/api/cron/jules-orchestrator',
    headers:=jsonb_build_object(
      'Authorization', 'Bearer dc14109cc7bd71b7cacb34c9ba3c3710d06a280bd6b8e5a1cb8c91bd1bd222a2'
    )
  ) as request_id;
  $$
);
