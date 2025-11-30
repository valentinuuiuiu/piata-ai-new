# 🤖 AI Shopping Agents - Build Plan

## Architecture (Using Your Existing Stack!)

### 1. Database Table
```sql
CREATE TABLE shopping_agents (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL, -- What user is looking for
  filters JSONB, -- {category, price_min, price_max, location}
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Cron Job (Daily Check)
- Location: `/api/cron/check-agents/route.ts`
- Triggered by: Vercel Cron (already setup!)
- Uses: Grok-4-Fast via OpenRouter
- Frequency: Daily at 9 AM

### 3. AI Matching Logic
- Get new listings from last 24h
- For each active agent:
  - Use Grok to match listing vs agent description
  - Smart semantic matching (not just keywords!)
  - Score: 0-100% match confidence

### 4. Email Alerts
- Use existing `src/lib/email.ts`
- Template: "Agent [name] found X matches!"
- Include: Listing title, price, link

### 5. User Interface
- New page: `/dashboard/agents`
- Create/Edit/Delete agents
- View match history
- Enable/Disable agents

## Files to Create:
1. Database migration SQL
2. /api/cron/check-agents/route.ts
3. /api/agents/route.ts (CRUD)
4. /dashboard/agents/page.tsx
5. Agent matching service

## Timeline:
- Database setup: 30 min
- API endpoints: 2 hours
- Cron job + matching: 3 hours
- UI: 2 hours
- Testing: 1 hour
**Total: ~8 hours** (not 12, we're in YOLO mode!)

Ready to BUILD! 🚀
