-- Shopping Agents Tables Migration
-- Creates tables for the AI Shopping Agents feature

-- 1. Shopping Agents Table
CREATE TABLE IF NOT EXISTS shopping_agents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    matches_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agent Matches Table (stores listings found by agents)
CREATE TABLE IF NOT EXISTS agent_matches (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES shopping_agents(id) ON DELETE CASCADE,
    listing_id BIGINT, -- Can be null if external listing
    external_url TEXT,
    title TEXT NOT NULL,
    price NUMERIC,
    location TEXT,
    match_score INTEGER DEFAULT 50,
    notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agent Learning History Table
CREATE TABLE IF NOT EXISTS agent_learning_history (
    id BIGSERIAL PRIMARY KEY,
    agent_name TEXT NOT NULL,
    task_description TEXT NOT NULL,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN DEFAULT true,
    feedback TEXT,
    performance_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Agent Capabilities Table
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id BIGSERIAL PRIMARY KEY,
    agent_name TEXT NOT NULL,
    capability_name TEXT NOT NULL,
    capability_description TEXT,
    proficiency_level INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_name, capability_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_agents_user_id ON shopping_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_agents_is_active ON shopping_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_matches_agent_id ON agent_matches(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_learning_agent_name ON agent_learning_history(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_name ON agent_capabilities(agent_name);

-- Enable Row Level Security (RLS)
ALTER TABLE shopping_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_agents
CREATE POLICY "Users can view their own agents"
    ON shopping_agents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
    ON shopping_agents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
    ON shopping_agents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
    ON shopping_agents FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for agent_matches
CREATE POLICY "Users can view matches for their agents"
    ON agent_matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shopping_agents
            WHERE shopping_agents.id = agent_matches.agent_id
            AND shopping_agents.user_id = auth.uid()
        )
    );

-- RLS Policies for learning history (admin only for now)
CREATE POLICY "Anyone can view learning history"
    ON agent_learning_history FOR SELECT
    USING (true);

CREATE POLICY "Service role can insert learning history"
    ON agent_learning_history FOR INSERT
    WITH CHECK (true);

-- RLS Policies for capabilities (admin only for now)
CREATE POLICY "Anyone can view capabilities"
    ON agent_capabilities FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage capabilities"
    ON agent_capabilities FOR ALL
    USING (true);
