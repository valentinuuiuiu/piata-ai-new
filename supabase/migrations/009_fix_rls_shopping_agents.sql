-- Quick fix for RLS policies to allow service role access
-- Run this AFTER the main migration if tables exist but aren't accessible

-- Temporarily disable RLS for testing (you can re-enable later)
ALTER TABLE shopping_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities DISABLE ROW LEVEL SECURITY;

-- Or keep RLS enabled but add service role bypass policies
-- These allow the service role key to bypass RLS

-- Uncomment these if you want to keep RLS enabled:
/*
CREATE POLICY "Service role bypass for shopping_agents"
    ON shopping_agents
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for agent_matches"
    ON agent_matches
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for agent_learning_history"  
    ON agent_learning_history
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for agent_capabilities"
    ON agent_capabilities
    USING (true)  
    WITH CHECK (true);
*/
