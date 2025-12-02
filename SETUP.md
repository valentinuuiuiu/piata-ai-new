# API Keys & Account Setup - Keep It Simple

## 🎯 Philosophy: Minimal Setup, Maximum Power

We built this to work **WITHOUT complex integrations**. Most features work out of the box.

---

## ✅ REQUIRED (Bare Minimum)

### 1. OpenRouter API Key (FREE tier)

**Why:** Powers KATE & Grok (free AI models)  
**Cost:** $0  
**Setup:** 2 minutes

```bash
# Get it from: https://openrouter.ai
# Add to .env.local:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Test it works:**

```bash
./subagents/kate-agent.sh
# Type: "Hello, are you working?"
```

### 2. Supabase (Already Connected)

**Why:** Database for listings, users, etc.  
**Cost:** $0 (generous free tier)  
**Status:** ✅ Already configured in your project

---

## 🔧 OPTIONAL (Add When Needed)

### Stripe (For Payments)

**Only needed if:** You want users to buy credits  
**Skip if:** You're testing or don't need payments yet

```bash
STRIPE_API_KEY=sk_live_...  # You already have this
```

### Redis (For Job Scheduler)

**Only needed if:** You want automated marketing/cron jobs  
**Skip if:** You're doing manual operations

```bash
# Install locally:
brew install redis  # macOS
sudo apt install redis  # Ubuntu

# Or skip entirely - not required for core features
```

### Google Workspace (For Email Marketing)

**Only needed if:** You want automated newsletters  
**Skip if:** You're using claude.dev@mail.com for contacts (current setup)

```bash
# Skip this for now - we simplified to use default email
```

### GitHub Token (For Code Management)

**Only needed if:** You want Jules to manage repos  
**Skip if:** You're doing git manually

---

## 🚀 Quick Start (What Actually Works RIGHT NOW)

### Scenario 1: Just Want AI Assistance

```bash
# Only need: OPENROUTER_API_KEY
./subagents/kate-agent.sh  # Code help
./subagents/grok-agent.sh  # Marketing insights
```

### Scenario 2: Want Full Marketplace

```bash
# Already working:
npm run dev
# Visit: http://localhost:3000
# Post listings, browse categories - NO API keys needed!
```

### Scenario 3: Want Payments

```bash
# Need: STRIPE_API_KEY (you have it)
# Already configured in the project
```

### Scenario 4: Want Automation

```bash
# Need: Redis + OPENROUTER_API_KEY
brew install redis
npx tsx scripts/scheduler-daemon.ts
```

---

## 📋 Current .env.local Status

**What you MUST have:**

```bash
OPENROUTER_API_KEY=your-key-here  # ⚠️ Add this if missing
```

**What's already there (optional):**

```bash
STRIPE_API_KEY=sk_live_51MxDeN...  # ✅ Already set
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_fb...  # ✅ Already set
REDIS_URL=redis://localhost:6379  # ⚠️ Only if Redis installed
```

**What's NOT needed:**

```bash
❌ RESEND_API_KEY  # Removed - simplified email
❌ GOOGLE_CLIENT_ID  # Optional - only for advanced features
❌ CELERY_BROKER  # Don't need - using simple Redis jobs
```

---

## 🧪 Test What's Working

### Test 1: Free AI (No accounts needed!)

```bash
# Get OpenRouter key (free): https://openrouter.ai
echo "OPENROUTER_API_KEY=your-key" >> .env.local

# Test KATE
./subagents/kate-agent.sh
```

### Test 2: Marketplace (Works immediately!)

```bash
npm run dev
# Open http://localhost:3000
# Everything works except AI features
```

### Test 3: Jules Manager

```bash
npx tsx scripts/test-jules-manager.ts
# Shows which agents are ready
```

---

## 🎯 Recommended Setup Order

**Day 1: Core Features (5 min)**

1. Get OpenRouter API key (free)
2. Test KATE & Grok agents
3. Run marketplace locally

**Day 2: Payments (if needed)**

1. Verify Stripe key works
2. Test credit purchase flow

**Day 3: Automation (optional)**

1. Install Redis locally
2. Set up scheduled jobs
3. Test marketing automation

**Never: Complex OAuth, Celery, RabbitMQ** ❌
We don't need enterprise infrastructure!

---

## 💡 The Reality Check

**What's ACTUALLY required to go live:**

- ✅ Supabase (you have it)
- ✅ Vercel deployment (free)
- ✅ Domain (piata-ai.ro - you have it)
- ⚠️ OpenRouter key for AI features (free, 2-min setup)

**What's NOT required:**

- ❌ Email service (using default email)
- ❌ Complex auth (Supabase handles it)
- ❌ Message queues (simple Redis jobs)
- ❌ 10+ API integrations

---

## 🚀 To Deploy RIGHT NOW

```bash
# 1. Ensure you have OpenRouter key
grep OPENROUTER_API_KEY .env.local || echo "Add it!"

# 2. Add to Vercel env vars
vercel env add OPENROUTER_API_KEY

# 3. Deploy
git add .
git commit -m "feat: simplified setup - ready for production"
git push origin main

# Done! 🎉
```

---

**Bottom line:**

- **Minimum to test:** Just OpenRouter ($0)
- **Minimum to deploy:** OpenRouter + Supabase (both free)
- **For full features:** Add Stripe when you need payments

**Keep it simple. Keep it real.** ✨
