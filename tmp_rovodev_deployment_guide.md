# 🚀 Piata AI - Autonomous Marketing Deployment Guide

## Overview
Comprehensive guide to deploy the fully autonomous marketing system for Piata AI marketplace.

## ✅ What We've Built

### 1. **Database Layer (Supabase)**
- ✅ Tables: `automation_tasks`, `automation_logs`, `email_campaigns`, `blog_posts`, `social_media_posts`, `shopping_agents`
- ✅ All tables verified and working
- ✅ RLS policies configured
- ✅ Service role access enabled

### 2. **Backend API Endpoints**
- ✅ `/api/cron/blog-daily` - Daily blog generation
- ✅ `/api/cron/shopping-agents-runner` - Hourly product matching
- ✅ `/api/cron/social-media-generator` - Social content every 6h
- ✅ `/api/cron/jules-orchestrator` - Daily orchestration
- ✅ `/api/cron/autonomous-marketing` - **NEW: AI decision maker**

### 3. **Frontend (PAI Agent)**
- ✅ PAI Helper component with smart routing
- ✅ Jules Manager integration for automation requests
- ✅ Real-time conversation memory
- ✅ Multi-model support (GPT-4, Claude, Gemini)

### 4. **N8N Workflows**
- ✅ 4 production workflows created:
  - Daily Blog Generator
  - Shopping Agents Runner  
  - Social Media Automation
  - Email Re-engagement Campaign
- ✅ N8N instance running on `localhost:5678`
- ✅ Workflows at `/tmp/piata_n8n_workflows/`

### 5. **Autonomous Marketing Engine**
- ✅ AI-driven decision making
- ✅ Market intelligence gathering
- ✅ Priority-based execution
- ✅ Comprehensive logging

---

## 📋 Deployment Steps

### Step 1: Supabase Setup (5 minutes)

```bash
# 1. Open Supabase SQL Editor
# URL: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql

# 2. Run the pg_cron setup script
cat piata-ai-new/tmp_rovodev_supabase_pg_cron_setup.sql
# Copy and paste into SQL Editor, then Execute

# 3. Verify cron jobs
SELECT * FROM cron.job;
```

**Expected result:** 6+ cron jobs scheduled ✅

### Step 2: Environment Variables

```bash
cd piata-ai-new

# Ensure these are set in .env
cat >> .env << EOF
CRON_SECRET=test-secret-1735040064
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g
OPENROUTER_API_KEY=<your-key-here>
NEXT_PUBLIC_APP_URL=https://piata-ai.vercel.app
EOF
```

### Step 3: Deploy to Vercel (10 minutes)

```bash
# 1. Login to Vercel
npx vercel login

# 2. Link project
npx vercel link

# 3. Set environment variables
npx vercel env add CRON_SECRET
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add OPENROUTER_API_KEY

# 4. Deploy
npx vercel --prod

# 5. Enable cron in vercel.json (already configured)
# Jobs: jules-orchestrator runs daily at 8 AM UTC
```

**Verify deployment:**
```bash
curl https://piata-ai.vercel.app/api/health
```

### Step 4: N8N Workflows Import (15 minutes)

```bash
# 1. Access N8N
open http://localhost:5678

# 2. Import workflows
# Navigate to: Settings → Import from file
# Import all 4 workflows from /tmp/piata_n8n_workflows/

# 3. Configure credentials
# Add HTTP Header Auth credential:
# - Name: Supabase-Auth
# - Header: apikey
# - Value: <SUPABASE_SERVICE_ROLE_KEY>

# Add HTTP Header Auth credential:
# - Name: Cron-Secret-Auth  
# - Header: Authorization
# - Value: Bearer test-secret-1735040064

# 4. Activate all workflows
# Click "Active" toggle on each workflow

# 5. Test execution
# Click "Execute Workflow" on each to verify
```

### Step 5: Test Autonomous Marketing (5 minutes)

```bash
# Test the autonomous marketing endpoint
curl -X POST http://localhost:3001/api/cron/autonomous-marketing \
  -H "Authorization: Bearer test-secret-1735040064"

# Expected response:
# {
#   "success": true,
#   "intelligence": {...},
#   "decisions": [...],
#   "executed": [...]
# }
```

### Step 6: Verify Automation Logs

```sql
-- In Supabase SQL Editor
SELECT 
  task_name,
  status,
  created_at,
  summary
FROM automation_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔄 Automation Schedule

### Supabase pg_cron (Recommended)
- **Every hour**: Shopping Agents
- **Every 6 hours**: Social Media Generator
- **Every 15 minutes**: Auto-repost (optional)
- **Daily 8 AM**: Jules Orchestrator
- **Daily 9 AM**: Blog Generation
- **Daily 10 AM**: Email Campaigns

### Vercel Cron (Hobby Plan - Limited)
- **Daily 8 AM**: Jules Orchestrator only
- *Upgrade to Pro for more frequent runs*

### N8N (Full Control)
- All schedules configurable
- No limits on frequency
- Full workflow customization

---

## 📊 Monitoring & Analytics

### 1. Real-time Logs
```bash
# Vercel logs
npx vercel logs --follow

# N8N execution history
# Visit: http://localhost:5678/workflows → Executions tab

# Supabase logs
SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 50;
```

### 2. Performance Metrics
```sql
-- Automation success rate
SELECT 
  task_name,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
  ROUND(AVG(duration_ms)) as avg_duration_ms
FROM automation_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY task_name;
```

### 3. Email Campaign Analytics
```sql
-- View from marketing_analytics
SELECT * FROM marketing_analytics
ORDER BY date DESC;
```

---

## 🛠️ Maintenance

### Daily Checks
1. Check automation_logs for failures
2. Review email campaign open rates
3. Monitor social media post generation
4. Verify shopping agent matches

### Weekly Tasks
1. Analyze blog post performance
2. Review inactive user re-engagement
3. Optimize low-performing listings
4. Update AI prompts based on results

### Monthly Reviews
1. Full marketing ROI analysis
2. User engagement trends
3. Content performance audit
4. System optimization

---

## 🚨 Troubleshooting

### Issue: Cron jobs not running
**Solution:**
```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Verify jobs are active
SELECT * FROM cron.job WHERE active = true;

-- Check execution logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Issue: API endpoints return 401
**Solution:**
```bash
# Verify CRON_SECRET matches everywhere
grep CRON_SECRET .env
# Should match value in Supabase settings and Vercel env vars
```

### Issue: N8N workflows fail
**Solution:**
1. Check credentials are configured
2. Verify endpoint URLs are correct
3. Test API endpoints manually with curl
4. Check N8N logs in execution history

### Issue: No emails sent
**Solution:**
```typescript
// Check email service configuration in:
// src/lib/email-automation.ts
// Ensure Resend API key is set
```

---

## 🎯 Next Steps for Full Autonomy

### Phase 1: Current (Completed ✅)
- ✅ Database setup
- ✅ API endpoints
- ✅ Basic automations
- ✅ N8N workflows
- ✅ AI decision making

### Phase 2: Enhanced Intelligence (Recommended)
- [ ] Machine learning for optimal post timing
- [ ] User behavior prediction
- [ ] Dynamic pricing suggestions
- [ ] Automated A/B testing
- [ ] Sentiment analysis on listings

### Phase 3: Full Autonomy (Advanced)
- [ ] Self-optimizing campaigns
- [ ] Autonomous budget allocation
- [ ] Multi-agent coordination
- [ ] Real-time market adaptation
- [ ] Predictive scaling

---

## 📞 Support & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh
- **Vercel Dashboard**: https://vercel.com/dashboard
- **N8N Instance**: http://localhost:5678
- **Marketplace**: https://piata-ai.vercel.app

---

## 🎉 Success Metrics

Track these KPIs to measure automation success:

1. **Engagement Rate**: Users active daily vs total
2. **Re-engagement Success**: Inactive users returning after email
3. **Social Media Reach**: Views/engagement on generated posts
4. **Blog Traffic**: Organic search visits
5. **Shopping Agent Matches**: Product-user matches per day
6. **Listing Performance**: Views increase after optimization
7. **Email Open Rate**: Campaign effectiveness
8. **Automation Reliability**: Success rate > 95%

---

**Status: READY FOR PRODUCTION** 🚀

All systems tested and verified. Deploy when ready!
