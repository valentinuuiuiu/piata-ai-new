-- Shopping Agent Triggers and Functions
-- Automatically check new listings against active shopping agents

-- Function to check a listing against all active shopping agents
CREATE OR REPLACE FUNCTION check_listing_against_agents()
RETURNS TRIGGER AS $$
DECLARE
    agent_record RECORD;
    match_score INTEGER;
    match_exists BOOLEAN;
BEGIN
    -- Only check active listings
    IF NEW.status != 'active' THEN
        RETURN NEW;
    END IF;

    -- Loop through all active shopping agents
    FOR agent_record IN 
        SELECT id, filters, user_id 
        FROM shopping_agents 
        WHERE is_active = true
    LOOP
        -- Check if this listing matches the agent's criteria
        match_score := calculate_agent_match_score(NEW, agent_record.filters);
        
        -- If match score is above threshold (50), create a match record
        IF match_score >= 50 THEN
            -- Check if this match already exists to avoid duplicates
            SELECT EXISTS(
                SELECT 1 FROM agent_matches 
                WHERE agent_id = agent_record.id AND listing_id = NEW.id
            ) INTO match_exists;
            
            IF NOT match_exists THEN
                -- Insert new match
                INSERT INTO agent_matches (
                    agent_id, 
                    listing_id, 
                    match_score, 
                    notified_at, 
                    created_at
                ) VALUES (
                    agent_record.id,
                    NEW.id,
                    match_score,
                    NULL, -- Will be set when user is notified
                    NOW()
                );
                
                -- Update agent's matches_found count
                UPDATE shopping_agents 
                SET matches_found = matches_found + 1,
                    last_checked_at = NOW()
                WHERE id = agent_record.id;
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate match score for a listing against agent filters
CREATE OR REPLACE FUNCTION calculate_agent_match_score(
    listing_record anunturi,
    agent_filters JSONB
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 50; -- Base score
    keywords_array TEXT[];
    keyword TEXT;
    price_value NUMERIC;
    location_value TEXT;
    title_lower TEXT;
BEGIN
    -- Price factor
    price_value := COALESCE(listing_record.price, 0);
    
    IF agent_filters->>'minPrice' IS NOT NULL THEN
        IF price_value < (agent_filters->>'minPrice')::NUMERIC THEN
            score := score - 20;
        END IF;
    END IF;
    
    IF agent_filters->>'maxPrice' IS NOT NULL THEN
        IF price_value > (agent_filters->>'maxPrice')::NUMERIC THEN
            score := score - 20;
        END IF;
    END IF;
    
    -- Price bonus for being in range
    IF price_value > 0 AND price_value < 1000 THEN
        score := score + 10;
    ELSIF price_value >= 1000 AND price_value < 10000 THEN
        score := score + 20;
    ELSIF price_value >= 10000 THEN
        score := score + 30;
    END IF;
    
    -- Keywords matching
    keywords_array := ARRAY(SELECT jsonb_array_elements_text(agent_filters->'keywords'));
    title_lower := LOWER(COALESCE(listing_record.title, ''));
    
    FOREACH keyword IN ARRAY keywords_array
    LOOP
        IF keyword IS NOT NULL AND title_lower LIKE '%' || LOWER(keyword) || '%' THEN
            score := score + 15;
        END IF;
    END LOOP;
    
    -- Description quality bonus
    IF listing_record.description IS NOT NULL AND LENGTH(listing_record.description) > 100 THEN
        score := score + 10;
    ELSIF listing_record.description IS NOT NULL AND LENGTH(listing_record.description) > 50 THEN
        score := score + 5;
    END IF;
    
    -- Images presence bonus
    IF listing_record.images IS NOT NULL AND jsonb_array_length(listing_record.images) > 0 THEN
        score := score + 15;
    ELSIF listing_record.images IS NOT NULL AND jsonb_array_length(listing_record.images) > 2 THEN
        score := score + 10;
    END IF;
    
    -- Location matching
    location_value := agent_filters->>'location';
    IF location_value IS NOT NULL AND listing_record.location IS NOT NULL THEN
        IF LOWER(listing_record.location) LIKE '%' || LOWER(location_value) || '%' THEN
            score := score + 10;
        ELSE
            score := score - 5;
        END IF;
    END IF;
    
    RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually trigger agent checking for a specific listing
CREATE OR REPLACE FUNCTION trigger_agent_check_for_listing(listing_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER := 0;
BEGIN
    -- Manually trigger the check for a specific listing
    -- This can be used to re-check existing listings against new agents
    PERFORM check_listing_against_agents() FROM anunturi WHERE id = listing_id_param;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on anunturi table
DROP TRIGGER IF EXISTS trigger_check_agents_on_listing_insert ON anunturi;
CREATE TRIGGER trigger_check_agents_on_listing_insert
    AFTER INSERT ON anunturi
    FOR EACH ROW
    EXECUTE FUNCTION check_listing_against_agents();

-- Create trigger on anunturi table for updates (in case status changes to active)
DROP TRIGGER IF EXISTS trigger_check_agents_on_listing_update ON anunturi;
CREATE TRIGGER trigger_check_agents_on_listing_update
    AFTER UPDATE ON anunturi
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION check_listing_against_agents();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_listing_against_agents() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_agent_match_score(anunturi, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION trigger_agent_check_for_listing(BIGINT) TO authenticated, service_role;

-- Success message
SELECT 'Shopping Agent triggers and functions created successfully!' as message;