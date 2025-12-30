# Gemini CLI Instructions - Comprehensive Project Guide

**Created By**: Antigravity (Most Capable Model)  
**Date**: 2025-12-29  
**Project**: Piata AI Marketplace (piata-ai.ro)  
**User**: VasukiNaga (Shiva)

---

## 🎯 Primary Objectives

1. **Live Automation Deployment**: Ensure all automations run on `https://piata-ai.ro` via self-hosted Celery scheduler.
2. **TikTok Decommissioned**: Business account revoked. Focus on Meta (Facebook/Instagram) and LinkedIn.
3. **Vercel Hobby Limits**: Only 2 cron jobs allowed. Use Celery to bypass this limitation.

---

## 📊 Project Overview

| Metric                   | Count   |
| ------------------------ | ------- |
| `src/lib` files          | 62      |
| `src/lib` subdirectories | 14      |
| API route directories    | 59      |
| Components               | 41      |
| Total src lines (est.)   | 50,000+ |

### Key Technologies

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Supabase, Vercel Functions, Redis
- **Automation**: Celery (Beat + Worker), N8N
- **AI**: OpenRouter, Gemini, Minimax
- **Payments**: Stripe

---

## 🚀 Live Automation Status

### Current State (2025-12-29)

| Component       | Status     | URL/Config                    |
| --------------- | ---------- | ----------------------------- |
| Celery Worker   | ✅ RUNNING | `APP_URL=https://piata-ai.ro` |
| Celery Beat     | ✅ RUNNING | Schedules all tasks           |
| N8N             | ✅ RUNNING | `localhost:5678`              |
| Redis           | ✅ RUNNING | `redis://redis:6379/0`        |
| Next.js (local) | ✅ RUNNING | For testing only              |

### Key Files Modified

```
Backend/scheduler/tasks.py          # Updated for production URLs
Backend/scheduler/celery_config.py  # Fixed task registration
src/lib/social-media-automation.ts  # Removed TikTok
src/lib/platforms/tiktok-automation.ts # Disabled
```

### Quick Commands

```bash
# Check container status
docker ps | grep -E "celery|redis|n8n"

# Verify production URL is set
docker exec piata-celery-worker env | grep APP_URL

# Manually trigger a task
docker exec piata-celery-worker celery -A celery_config call tasks.social_media_generator

# View worker logs
docker logs piata-celery-worker --tail 50
```

---

## 🔧 Improvement Areas

### 1. **Code Consolidation** (Priority: Medium)

Multiple email-related files need consolidation:

- `email-automation.ts` (22KB)
- `email-confirmation.ts` (10KB)
- `email-integration.ts` (10KB)
- `email-system.ts` (35KB)
- `email.ts` (9KB)

**Action**: Create a unified `email/` directory with specialized modules.

### 2. **Agent Cleanup** (Priority: Medium)

The `agents/` directory has 12 files. Some may be redundant:

- `silent-agents.ts`
- `internal-agent-manager.ts`
- `piata-agent.ts` (30KB - very large)
- `piata-agent-enhanced.ts` (7KB)

**Action**: Audit for duplicate functionality and consolidate.

### 3. **API Route Organization** (Priority: Low)

59 API route directories exist. Some may be orphaned:

- `test-automation/`, `test-db/`, `test-status/` - Consider moving to `/tests`
- `supabase-check/`, `supabase-mcp/`, `supabase-webhook/` - Consolidate under `/supabase`

### 4. **Security Hardening** (Priority: High)

- Verify all cron endpoints enforce `CRON_SECRET` authorization
- Audit `security-config.ts` and `security.ts` for completeness
- Ensure no secrets are logged in automation outputs

### 5. **Environment Variable Audit** (Priority: High)

Multiple `.env*` files exist:

- `.env`, `.env.local`, `.env.vercel`, `.env.vercel.production`
- `.env.jules.example`, `.env.example`

**Action**: Document which variables are required for production vs. development.

---

## 📅 Scheduled Tasks (Celery Beat)

| Task                     | Time (UTC) | Endpoint                           |
| ------------------------ | ---------- | ---------------------------------- |
| `jules_orchestrator`     | 08:00      | `/api/cron/jules-orchestrator`     |
| `blog_daily`             | 09:00      | `/api/cron/blog-daily`             |
| `trending_topics`        | 09:00 Mon  | `/api/cron/trending-topics`        |
| `shopping_agents_runner` | 10:00      | `/api/cron/shopping-agents-runner` |
| `autonomous_marketing`   | 11:00      | `/api/cron/autonomous-marketing`   |
| `social_media_generator` | 12:00      | `/api/cron/social-media-generator` |

---

## 🛠️ Common Fixes

### If containers fail to start:

```bash
docker stop piata-celery-worker piata-celery-beat
docker rm piata-celery-worker piata-celery-beat

docker run -d --name piata-celery-worker \
  --network piata-ai-new_antigravity \
  -e APP_URL=https://piata-ai.ro \
  -e CRON_SECRET=5f8d9e2a1b4c7d0e3f6a9b2c5e8d1a4f \
  -e REDIS_URL=redis://redis:6379/0 \
  --restart always \
  piata-ai-new_celery_worker celery -A celery_config worker --loglevel=info

docker run -d --name piata-celery-beat \
  --network piata-ai-new_antigravity \
  -e APP_URL=https://piata-ai.ro \
  -e CRON_SECRET=5f8d9e2a1b4c7d0e3f6a9b2c5e8d1a4f \
  -e REDIS_URL=redis://redis:6379/0 \
  --restart always \
  piata-ai-new_celery_beat celery -A celery_config beat --loglevel=info
```

### If tasks.py changes need deployment:

```bash
docker cp Backend/scheduler/tasks.py piata-celery-worker:/app/tasks.py
docker cp Backend/scheduler/tasks.py piata-celery-beat:/app/tasks.py
docker restart piata-celery-worker piata-celery-beat
```

### If Next.js dev server stops:

```bash
cd /home/shiva/piata-ai-new
pkill -f "next dev"
npm run dev > next.log 2>&1 &
```

---

## 📝 Important Environment Variables

| Variable                    | Value                              | Purpose               |
| --------------------------- | ---------------------------------- | --------------------- |
| `APP_URL`                   | `https://piata-ai.ro`              | Production API target |
| `CRON_SECRET`               | `5f8d9e2a1b4c7d0e3f6a9b2c5e8d1a4f` | Cron endpoint auth    |
| `REDIS_URL`                 | `redis://redis:6379/0`             | Task queue            |
| `SUPABASE_SERVICE_ROLE_KEY` | (in .env.local)                    | Database admin access |
| `OPENROUTER_API_KEY`        | (in .env.local)                    | AI model access       |
| `STRIPE_SECRET_KEY`         | (in .env.local)                    | Payment processing    |

---

## ✅ Verification Checklist

- [ ] `docker exec piata-celery-worker env | grep APP_URL` returns `https://piata-ai.ro`
- [ ] Celery worker logs show `🚀 Triggering task: https://piata-ai.ro/...`
- [ ] No TikTok references in automation output
- [ ] `automation_logs` table in Supabase receives new entries daily
- [ ] All cron endpoints return 200 when called with proper auth header

---

## 📂 Key File Locations

```
Backend/scheduler/tasks.py           # Celery task definitions
Backend/scheduler/celery_config.py   # Celery configuration
src/lib/social-media-automation.ts   # Social media logic
src/lib/automation-engine.ts         # Main automation engine
src/app/api/cron/                     # All cron endpoints
docker-compose.yml                   # Docker services
.env.local                           # Local secrets
```

---

## 🔮 Future Work

1. **Add LinkedIn Automation**: Expand beyond Facebook/Instagram
2. **Consolidate Email System**: Merge 5 email files into one module
3. **Create Monitoring Dashboard**: Visualize automation health
4. **Add Webhook Notifications**: Notify on task failures
5. **Implement Retry Logic**: Handle transient API failures gracefully

---

## 📞 Contact/Debug

If issues persist:

1. Check Docker: `docker ps`
2. Check Redis: `docker logs piata-redis --tail 20`
3. Check Vercel logs: https://vercel.com/dashboard
4. Check Supabase: https://supabase.com/dashboard
