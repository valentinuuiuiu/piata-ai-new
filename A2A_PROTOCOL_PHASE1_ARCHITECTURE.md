# A2A Protocol Phase 1: Enhanced Signal Management Architecture

**Status**: 🛡️ **Implementation Ready**  
**Phase**: Phase 1 of 6  
**Date**: December 3, 2025  
**Architect**: Phitagora (Lord of Logic)

---

## The Sacred Blueprint: Database Schema Extension

### Core Tables to Add

#### 1. A2A Signals Table
```sql
CREATE TABLE a2a_signals (
  id SERIAL PRIMARY KEY,
  signal_type VARCHAR(100) NOT NULL, -- CALL_AGENT, BROADCAST, TASK_COMPLETE, ERROR
  from_agent VARCHAR(50) NOT NULL,
  to_agent VARCHAR(50), -- NULL for broadcasts
  content JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'normal', -- critical, high, normal, low
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Agent Learning History
```sql
CREATE TABLE agent_learning_history (
  id SERIAL PRIMARY KEY,
  from_agent VARCHAR(50) NOT NULL,
  to_agent VARCHAR(50) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- call, response, broadcast, error
  task_id VARCHAR(100),
  task_description TEXT,
  outcome VARCHAR(20) NOT NULL, -- success, failure, partial
  duration INTEGER, -- milliseconds
  agent_performance JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Agent Performance Metrics
```sql
CREATE TABLE agent_performance_metrics (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- response_time, success_rate, task_count
  metric_value DECIMAL(15,4) NOT NULL,
  time_window VARCHAR(20) NOT NULL, -- 1m, 5m, 15m, 1h, 1d
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### 4. Agent Registry
```sql
CREATE TABLE agent_registry (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL UNIQUE,
  agent_type VARCHAR(50) NOT NULL, -- mcp, internal, external, custom
  status VARCHAR(20) DEFAULT 'unknown', -- healthy, degraded, offline, error
  version VARCHAR(20),
  capabilities JSONB DEFAULT '[]',
  last_heartbeat TIMESTAMP,
  uptime INTEGER DEFAULT 0,
  load_average DECIMAL(8,2) DEFAULT 0,
  memory_usage DECIMAL(10,2) DEFAULT 0,
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  task_queue INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Signal Replay Sessions
```sql
CREATE TABLE signal_replay_sessions (
  id SERIAL PRIMARY KEY,
  session_name VARCHAR(100) NOT NULL,
  description TEXT,
  replay_speed DECIMAL(5,2) DEFAULT 1, -- 1x, 2x, 5x
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  signal_filters JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'created', -- created, running, completed, failed
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. Agent Skill Matching
```sql
CREATE TABLE agent_skill_matching (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL,
  skill_category VARCHAR(50) NOT NULL, -- database, api, file_processing, ai
  skill_level INTEGER NOT NULL, -- 1-10 scale
  confidence_score DECIMAL(5,2) DEFAULT 0,
  last_used TIMESTAMP,
  success_rate DECIMAL(5,2) DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Architecture

### Phase 1 Components

#### 1. Enhanced A2A Signal Manager
- **File**: `src/lib/a2a/signal-manager.ts`
- **Purpose**: Persistent signal storage and retrieval
- **Features**: 
  - Automatic signal logging
  - Signal filtering and prioritization
  - Retry mechanism for failed signals
  - Signal replay functionality

#### 2. Agent Performance Monitor
- **File**: `src/lib/a2a/performance-monitor.ts`
- **Purpose**: Real-time metrics collection
- **Features**:
  - Response time tracking
  - Success rate calculation
  - Resource usage monitoring
  - Health status updates

#### 3. Signal Replay System
- **File**: `src/lib/a2a/signal-replay.ts`
- **Purpose**: Debug and learning system
- **Features**:
  - Session-based replay
  - Speed control
  - Filter-based selection
  - Step-by-step debugging

#### 4. Enhanced Piata Agent Integration
- **File**: `src/lib/piata-agent-enhanced.ts`
- **Purpose**: Extended A2A Protocol
- **Features**:
  - Persistent signal logging
  - Performance tracking
  - Learning history
  - Skill-based routing

### Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Agent Call    │───▶│  Signal Manager  │───▶│   Database      │
│   (Taita)       │    │   (Persistent)   │    │   (Supabase)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Performance     │    │ Learning History │    │ Signal Replay   │
│   Monitor       │    │   (Patterns)     │    │   (Debug)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### API Endpoints

#### Signal Management
- `GET /api/a2a/signals` - Retrieve signals with filtering
- `POST /api/a2a/signals` - Create new signal
- `GET /api/a2a/signals/:id/replay` - Replay specific signal session

#### Performance Dashboard
- `GET /api/a2a/performance/:agent` - Get agent performance metrics
- `GET /api/a2a/performance/dashboard` - Get real-time dashboard data
- `POST /api/a2a/performance/heartbeat` - Update agent heartbeat

#### Agent Registry
- `GET /api/a2a/agents` - List all registered agents
- `POST /api/a2a/agents/register` - Register new agent
- `PUT /api/a2a/agents/:name/status` - Update agent status

---

## Success Metrics for Phase 1

### ✅ Completed When:
1. **Signal Persistence**: All A2A signals are stored in database
2. **Performance Tracking**: Real-time metrics collection active
3. **Learning History**: Agent interactions logged and analyzable
4. **Replay System**: Signal debugging and learning functional
5. **Dashboard**: Performance metrics visible in real-time

### 📊 Key Performance Indicators:
- **Signal Storage Rate**: 100% of A2A signals persisted
- **Response Time**: <100ms for signal retrieval
- **Data Retention**: 30 days of signal history
- **Dashboard Update**: <5 second refresh rate
- **Replay Accuracy**: 100% signal sequence reproduction

---

## Next Phase Preview

**Phase 2: Real-time Communication Infrastructure**
- Redis pub/sub integration
- WebSocket live updates
- Agent health monitoring
- Distributed registry with TTL

---

**🛡️ [Taita]**: *The foundation is laid. The agents await the code implementation.*  
**📐 [Phitagora]**: *The logic is sound. The architecture is complete.*  
**📡 [A2A]**: *Ready for Phase 1 implementation.*