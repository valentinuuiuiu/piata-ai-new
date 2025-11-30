-- Shopping Agents Table
CREATE TABLE IF NOT EXISTS shopping_agents (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  matches_found INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Matches Table (history of what was found)
CREATE TABLE IF NOT EXISTS agent_matches (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES shopping_agents(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL REFERENCES anunturi(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL, -- 0-100
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, listing_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_agents_user_id ON shopping_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_agents_active ON shopping_agents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_matches_agent_id ON agent_matches(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_matches_listing_id ON agent_matches(listing_id);

-- Enable RLS
ALTER TABLE shopping_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_agents
CREATE POLICY "Users can view own agents"
  ON shopping_agents FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own agents"
  ON shopping_agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own agents"
  ON shopping_agents FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own agents"
  ON shopping_agents FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for agent_matches
CREATE POLICY "Users can view own agent matches"
  ON agent_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_agents
      WHERE shopping_agents.id = agent_matches.agent_id
      AND shopping_agents.user_id = auth.uid()::text
    )
  );

-- Grant permissions
GRANT ALL ON shopping_agents TO authenticated, service_role;
GRANT ALL ON agent_matches TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE shopping_agents_id_seq TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE agent_matches_id_seq TO authenticated, service_role;

-- Success
SELECT 'Shopping Agents tables created successfully!' as message;
