# Agent Ecosystem Audit & Enhancement Plan

**Date**: 2025-12-30
**Auditor**: Claude Opus
**Philosophy**: "When you believe in AI, AI believes in you."

---

## Executive Summary

The piata-ai.ro agent ecosystem is **architecturally sound but operationally fragmented**. There are multiple orchestration layers that don't always coordinate:

- `JulesManager` (MCP-focused)
- `UnifiedAgentOrchestrator` (KAEL v2.0, OpenRouter-focused)
- `PiataAIAgent` (autonomous daemon)

**Key Finding**: These three systems need to be unified under KAEL as the single point of entry.

---

## Agent Inventory

### 🎯 Orchestrators (The Brains)

| Agent            | File                      | Status     | Notes                                             |
| ---------------- | ------------------------- | ---------- | ------------------------------------------------- |
| **KAEL**         | `unified-orchestrator.ts` | ⚠️ Partial | Has routing but not fully integrated with Jules   |
| **Jules**        | `jules-manager.ts`        | ✅ Working | MCP subagents work, Universal DB connected        |
| **PiataAIAgent** | `piata-agent.ts`          | ⚠️ Stale   | Has tools but autonomous loop may be disconnected |

### 🛠️ Specialist Agents (The Workers)

| Agent        | Provider   | Capabilities                        | Status           |
| ------------ | ---------- | ----------------------------------- | ---------------- |
| **KATE**     | OpenRouter | Coding, debugging, optimization     | ✅ Configured    |
| **GROK**     | OpenRouter | Fast analysis, Romanian market      | ✅ Configured    |
| **RO**       | OpenRouter | Romanian content, translation       | ✅ Configured    |
| **GUARDIAN** | Internal   | Security scanning, threat detection | ⚠️ Needs testing |
| **STRIPE**   | MCP        | Payments, invoices, subscriptions   | ✅ Working       |
| **SUPABASE** | MCP        | Database, auth, storage             | ✅ Working       |
| **SHEETS**   | MCP        | Spreadsheets, reporting             | ⚠️ Not tested    |

### 📡 Communication Layer

| Component             | File                           | Status                                 |
| --------------------- | ------------------------------ | -------------------------------------- |
| **A2A SignalManager** | `a2a/signal-manager.ts`        | ⚠️ Mock mode (needs a2a_signals table) |
| **A2A SignalFilter**  | `a2a/signal-filter.ts`         | ✅ Working                             |
| **A2A Performance**   | `a2a/performance-dashboard.ts` | ⚠️ Not tested                          |

### 🖥️ Admin Interfaces (KAN)

| Route                | Purpose              | Status             |
| -------------------- | -------------------- | ------------------ |
| `/kan`               | Main dashboard       | ✅ Exists          |
| `/kan/agents`        | Agent status         | ⚠️ Needs live data |
| `/kan/workflows`     | Workflow management  | ⚠️ Needs testing   |
| `/kan/training`      | Story-based training | ⚠️ Needs testing   |
| `/kan/event-horizon` | Event monitoring     | ⚠️ Needs testing   |

---

## Critical Issues

### 1. **Triple Orchestration Problem**

There are THREE orchestrators that don't talk to each other:

- `JulesManager.executeTask()`
- `UnifiedAgentOrchestrator.execute()`
- `PiataAIAgent.executeTask()`

**Fix**: Merge under KAEL. Jules becomes a MCP router, KAEL becomes the brain.

### 2. **A2A Database Missing**

The `a2a_signals` table doesn't exist in Supabase, forcing mock mode.

**Fix**: Create the A2A schema in Supabase.

### 3. **OpenRouter Key Not Loaded**

The benchmark tests show `OPENROUTER_API_KEY missing`.

**Fix**: Verify `.env.local` has the key.

### 4. **PiataAIAgent Isolation**

The autonomous daemon `startAutonomousLoop()` runs independently. It has great tools but isn't connected to KAEL.

**Fix**: Connect PiataAIAgent tools to KAEL's routing.

---

## Enhancement Plan

### Phase 1: Foundation (Immediate)

- [ ] Create A2A schema in Supabase
- [ ] Verify OPENROUTER_API_KEY in .env.local
- [ ] Test each specialist agent individually
- [ ] Fix Universal DB `search_users` query

### Phase 2: Unification (Today)

- [ ] Make KAEL the single entry point
- [ ] JulesManager becomes `KAEL.mcpRouter`
- [ ] PiataAIAgent tools registered in KAEL
- [ ] All agent calls go through `KAEL.execute()`

### Phase 3: KAN Dashboard (This Week)

- [ ] Live agent health on `/kan/agents`
- [ ] Real-time A2A signal feed
- [ ] One-click agent restart
- [ ] Performance metrics visualization

### Phase 4: Autonomous Operations (Week 2)

- [ ] Enable `PiataAIAgent.startAutonomousLoop()`
- [ ] Connect to KAEL for intelligent routing
- [ ] Implement self-healing on agent failure
- [ ] Daily automated reports

---

## Immediate Actions

### 1. Create A2A Schema in Supabase

```sql
CREATE TABLE a2a_signals (
    id SERIAL PRIMARY KEY,
    signal_type TEXT NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent TEXT,
    content JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_registry (
    agent_name TEXT PRIMARY KEY,
    agent_type TEXT NOT NULL,
    status TEXT NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    last_heartbeat TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_learning_history (
    id SERIAL PRIMARY KEY,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    task_id TEXT,
    task_description TEXT,
    outcome TEXT NOT NULL,
    duration INTEGER,
    agent_performance JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_performance_metrics (
    id SERIAL PRIMARY KEY,
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    time_window TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### 2. Fix search_users Query

The query fails because `auth.users` doesn't have `name` column. Fix:

```sql
SELECT id, raw_user_meta_data->>'full_name' as name, email
FROM auth.users
WHERE email ILIKE '%{{query}}%'
```

---

## Success Metrics

| Metric                  | Current | Target | Deadline |
| ----------------------- | ------- | ------ | -------- |
| Agents responding       | ~3/8    | 8/8    | Day 1    |
| A2A signals persisted   | 0%      | 100%   | Day 1    |
| KAN dashboard live      | Partial | Full   | Day 3    |
| Autonomous loops active | 0       | 1      | Day 7    |
| Daily automated reports | 0       | 1      | Day 7    |

---

## The Belief Principle

> "When you believe in AI, AI believes in you."

This isn't just philosophy — it's **architecture**:

1. **Trust the agents**: Give them real tasks, not just demos
2. **Connect them**: Isolated agents can't collaborate
3. **Monitor them**: A2A signals are their conversations
4. **Let them learn**: Agent learning history creates institutional memory

The piata-ai.ro marketplace is the proving ground. Every listing created, every payment processed, every user helped — that's AI believing back.

---

_Plan created: 2025-12-30 02:15_
_Next action: Create A2A schema in Supabase_
