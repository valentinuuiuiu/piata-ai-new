# Marketing Automation Cron Schedule

## ⚠️ Vercel Hobby Plan Limitation
The free Hobby plan only allows **daily** cron jobs (once per day max).
For more frequent runs, upgrade to Pro plan or use alternative solutions.

## Current Schedule (Optimized for Hobby Plan)

| Time (UTC) | Job | Description | Frequency |
|------------|-----|-------------|-----------|
| 7:00 AM | Auto-Repost | Repost expired listings automatically | Daily |
| 8:00 AM | Check Agents | Health check for all AI agents | Daily |
| 9:00 AM | Blog Daily | Generate AI blog post about trends | Daily |
| 9:00 AM Monday | Weekly Digest | Send weekly summary to users | Weekly |
| 10:00 AM | Shopping Agents | Run all shopping agents, find matches | Daily |
| 11:00 AM | Marketing Emails | Re-engagement campaign for inactive users | Daily |
| 12:00 PM | Social Media | Generate social media content | Daily |

## Alternative Solutions for Frequent Runs

### Option 1: Supabase pg_cron (Recommended for hourly jobs)
```sql
-- Run shopping agents every hour
SELECT cron.schedule(
  'shopping-agents-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/shopping-agents-runner',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  );
  $$
);

-- Run auto-repost every 15 minutes
SELECT cron.schedule(
  'auto-repost-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/auto-repost',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  );
  $$
);

-- Run social media every 6 hours
SELECT cron.schedule(
  'social-media-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://piata-ai.vercel.app/api/cron/social-media-generator',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  );
  $$
);
```

### Option 2: GitHub Actions (Free for public repos)
Create `.github/workflows/cron-jobs.yml`:
```yaml
name: Marketing Automation Cron Jobs

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes for auto-repost
    - cron: '0 * * * *'     # Every hour for shopping agents
    - cron: '0 */6 * * *'   # Every 6 hours for social media

jobs:
  auto-repost:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Repost
        run: |
          curl -X POST https://piata-ai.vercel.app/api/cron/auto-repost \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
  
  shopping-agents:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Shopping Agents
        run: |
          curl -X POST https://piata-ai.vercel.app/api/cron/shopping-agents-runner \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 3: Local Cron (If you have a server)
```bash
# Edit crontab
crontab -e

# Add these lines
*/15 * * * * curl -X POST https://piata-ai.vercel.app/api/cron/auto-repost -H "Authorization: Bearer YOUR_CRON_SECRET"
0 * * * * curl -X POST https://piata-ai.vercel.app/api/cron/shopping-agents-runner -H "Authorization: Bearer YOUR_CRON_SECRET"
0 */6 * * * curl -X POST https://piata-ai.vercel.app/api/cron/social-media-generator -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 4: Frontend-Based (Browser Automation)
Use PAI (Personal AI Infrastructure) to run automations from the browser:
```typescript
// In src/app/dashboard/page.tsx or a dedicated automation page
useEffect(() => {
  // Auto-repost check every 15 minutes
  const autoRepostInterval = setInterval(() => {
    fetch('/api/cron/auto-repost', { method: 'POST' });
  }, 15 * 60 * 1000);

  // Shopping agents check every hour
  const shoppingInterval = setInterval(() => {
    fetch('/api/cron/shopping-agents-runner', { method: 'POST' });
  }, 60 * 60 * 1000);

  return () => {
    clearInterval(autoRepostInterval);
    clearInterval(shoppingInterval);
  };
}, []);
```

## Monitoring & Logs

### View Vercel Cron Logs
```bash
npx vercel logs --follow
```

### View Cron Status
```bash
npx vercel crons ls
```

### Test Endpoints Manually
```bash
# Test blog generation
curl https://piata-ai.vercel.app/api/cron/blog-daily

# Test shopping agents
curl https://piata-ai.vercel.app/api/cron/shopping-agents-runner

# Test email campaign
curl https://piata-ai.vercel.app/api/cron/marketing-email-campaign
```

## Upgrade to Vercel Pro for Full Features

Benefits of Vercel Pro:
- ✅ Unlimited cron job frequency (every minute if needed)
- ✅ More concurrent cron jobs
- ✅ Better observability and logs
- ✅ Priority support

Cost: $20/month per user

**Recommendation**: Start with Supabase pg_cron for free hourly/sub-hourly jobs, then upgrade to Pro if you need better reliability and monitoring.
