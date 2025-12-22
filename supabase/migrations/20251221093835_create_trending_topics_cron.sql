SELECT cron.schedule(
  'trending-topics-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/trending-topics',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  );
  $$
);
