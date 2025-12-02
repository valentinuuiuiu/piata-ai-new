# Automation System - Google Workspace + Redis Scheduler

## 🎯 What We Built

A **production-ready automation engine** without the complexity of Celery/RabbitMQ:

- 📊 **Google Sheets** - Data source/sink for marketing campaigns
- 📅 **Google Calendar** - Event-based triggers
- ⏰ **Redis Job Scheduler** - Lightweight cron alternative
- 🤖 **Jules Agents** - Execute the automation

---

## 🚀 Quick Start

### 1. Install Redis (if not already running)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis
```

### 2. Set up Google Workspace MCP

Get credentials from Google Cloud Console:

```bash
# Add to .env.local
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

### 3. Start the Scheduler

```bash
# Option A: Run as daemon (recommended for production)
npx tsx scripts/scheduler-daemon.ts

# Option B: Via API (for testing)
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### 4. Set Up Default Jobs

```bash
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "setup-defaults"}'
```

---

## 📋 Available Jobs

### Daily Newsletter (9 AM)

Sends marketing emails to users via Google Workspace.

```typescript
{
  id: 'daily-newsletter',
  schedule: '0 9 * * *',
  handler: 'sendDailyNewsletter'
}
```

### Hourly Google Sheets Sync

Syncs data between Supabase and Google Sheets.

```typescript
{
  id: 'hourly-sync',
  schedule: '0 * * * *',
  handler: 'syncGoogleSheets'
}
```

### AI Validation (Every 15 min)

Validates new listings using Grok agent.

```typescript
{
  id: 'validate-ads',
  schedule: '*/15 * * * *',
  handler: 'validateNewListings'
}
```

### Weekly Price Optimization (Monday 10 AM)

Uses AI to optimize pricing based on market data.

```typescript
{
  id: 'weekly-pricing',
  schedule: '0 10 * * 1',
  handler: 'optimizePricing'
}
```

---

## 🛠️ API Usage

### List All Jobs

```bash
curl http://localhost:3000/api/scheduler
```

### Add Custom Job

```bash
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "jobData": {
      "id": "custom-job",
      "name": "My Custom Task",
      "schedule": "0 12 * * *",
      "handler": "myCustomHandler",
      "enabled": true
    }
  }'
```

### Delete Job

```bash
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "jobId": "custom-job"
  }'
```

### Stop Scheduler

```bash
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

---

## 📅 Cron Format Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sunday=0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**

- `0 9 * * *` - Daily at 9 AM
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 1` - Every Monday at midnight
- `30 2 1 * *` - 2:30 AM on the 1st of every month

---

## 🔌 Integration with Google Workspace

### Example: Send Email via Google Workspace MCP

```typescript
import { getJulesManager } from "@/lib/jules-manager";

async function sendEmail(to: string, subject: string, body: string) {
  const jules = getJulesManager();
  await jules.initialize();

  // Call Google Workspace agent
  const result = await jules.callTool("google", "send_email", {
    to,
    subject,
    body,
  });

  return result;
}
```

### Example: Read from Google Sheets

```typescript
async function getMarketingList() {
  const jules = getJulesManager();
  await jules.initialize();

  const result = await jules.callTool("google", "read_sheet", {
    spreadsheetId: "your-sheet-id",
    range: "A1:C100",
  });

  return result;
}
```

---

## 🚢 Deployment

### Option 1: Vercel Cron (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduler/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

### Option 2: Systemd Service (VPS)

Create `/etc/systemd/system/piata-scheduler.service`:

```ini
[Unit]
Description=Piata AI Scheduler
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/piata-ai-new
ExecStart=/usr/bin/node /var/www/piata-ai-new/scripts/scheduler-daemon.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable piata-scheduler
sudo systemctl start piata-scheduler
sudo systemctl status piata-scheduler
```

---

## 💡 Use Cases

### 1. Automated Marketing Campaigns

- Pull subscriber list from Google Sheets
- Use KATE to generate personalized email content
- Send via Google Workspace
- Track opens/clicks in Redis

### 2. Dynamic Pricing

- Every week, analyze market trends
- Use Grok to optimize prices
- Update Supabase database
- Log changes to Google Sheets

### 3. AI Content Moderation

- Every 15 minutes, check for new listings
- Use Grok to validate content
- Auto-approve or flag for review
- Store results in Redis

### 4. Analytics Reports

- Daily at 9 AM, generate reports
- Use KATE to create visualizations
- Export to Google Sheets
- Email summary to admin

---

## 🎯 Why This Approach Rocks

**vs Celery + RabbitMQ:**

- ✅ No complex infrastructure
- ✅ Redis is lightweight and fast
- ✅ Easy to debug and monitor
- ✅ Works on Vercel, VPS, or localhost

**vs Cloud Functions:**

- ✅ No vendor lock-in
- ✅ Free (just Redis + your server)
- ✅ Full control over execution
- ✅ Can run locally for testing

---

## 📊 Monitoring

### Check Scheduler Status

```bash
curl http://localhost:3000/api/scheduler | jq
```

### View Redis Jobs

```bash
redis-cli keys "job:*"
redis-cli get job:daily-newsletter
```

### Monitor Execution Logs

```bash
tail -f logs/scheduler.log
```

---

_Last updated: December 2, 2025_  
_Status: ✅ Production Ready_  
_Complexity: Low (Redis only)_  
_Cost: $0_ ✨
