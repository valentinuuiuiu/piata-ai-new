SELECT cron.schedule(
  'external-trends-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.app_url') || '/api/cron/external-trends',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  );
  $$
);
