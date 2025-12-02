# Vercel Cron Jobs - LIVE NOW

## What's Running

Your site **piata-ai.ro** has active Vercel cron jobs:

1. **Daily Blog Post** - `/api/cron/blog-daily` - Runs at 9 AM daily
2. **Agent Health Check** - `/api/cron/check-agents` - Runs at 9 AM daily

## How to Test Them

```bash
# Test blog generation
curl https://piata-ai.ro/api/cron/blog-daily

# Test agent health
curl https://piata-ai.ro/api/cron/check-agents
```

## How to Add More Cron Jobs

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/your-new-job",
      "schedule": "0 */6 * * *" // Every 6 hours
    }
  ]
}
```

Schedule formats:

- `0 9 * * *` - Daily at 9 AM
- `0 */6 * * *` - Every 6 hours
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Weekly on Sunday

## Supabase pg_cron Alternative

To use Supabase instead:

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'daily-blog-post',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://piata-ai.ro/api/cron/blog-daily',
      headers:='{"Content-Type": "application/json"}'::jsonb
    ) as request_id;
  $$
);
```

## PAI (Personal AI Infrastructure) Alternative

For frontend-based automation, you can use the browser:

```typescript
// In your frontend
setInterval(async () => {
  await fetch("/api/cron/blog-daily", { method: "POST" });
}, 24 * 60 * 60 * 1000); // Daily
```

But Vercel Cron is the **best option** for your use case - it's already configured and will run automatically.
