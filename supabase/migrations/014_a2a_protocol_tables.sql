-- A2A Protocol Tables Migration
-- Creates tables for agent registry, signaling, learning, and performance

-- 1. A2A Signals - Persistent communication store
CREATE TABLE IF NOT EXISTS a2a_signals (
    id SERIAL PRIMARY KEY,
    signal_type VARCHAR(100) NOT NULL,
    from_agent VARCHAR(50) NOT NULL,
    to_agent VARCHAR(50),
    content JSONB DEFAULT '{}'::jsonb,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agent Registry - Health monitoring and status
CREATE TABLE IF NOT EXISTS agent_registry (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL UNIQUE,
    agent_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'unknown',
    version VARCHAR(20),
    capabilities JSONB DEFAULT '[]'::jsonb,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    uptime_seconds INTEGER DEFAULT 0,
    load_average DECIMAL(8, 2) DEFAULT 0,
    memory_usage_mb DECIMAL(10, 2) DEFAULT 0,
    cpu_usage_percent DECIMAL(5, 2) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    task_queue_size INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agent Performance Metrics - Real-time dashboard data
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    time_window VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Signal Replay Sessions - For debugging and learning
CREATE TABLE IF NOT EXISTS signal_replay_sessions (
    id SERIAL PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    description TEXT,
    replay_speed DECIMAL(5, 2) DEFAULT 1,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    signal_filters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'created',
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Agent Skill Matching - For intelligent task routing
CREATE TABLE IF NOT EXISTS agent_skill_matching (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    skill_category VARCHAR(50) NOT NULL,
    skill_level INTEGER NOT NULL,
    confidence_score DECIMAL(5, 2) DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_a2a_signals_from_agent ON a2a_signals(from_agent);
CREATE INDEX IF NOT EXISTS idx_a2a_signals_to_agent ON a2a_signals(to_agent);
CREATE INDEX IF NOT EXISTS idx_a2a_signals_status ON a2a_signals(status);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance_metrics(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_skill_matching_agent ON agent_skill_matching(agent_name);

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;