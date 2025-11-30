-- Supabase Function: Trigger AI validation on new listing
-- This function runs automatically when a new listing is inserted

CREATE OR REPLACE FUNCTION trigger_ai_validation()
RETURNS TRIGGER AS $$
DECLARE
  listing_id INTEGER;
BEGIN
  -- Get the ID of the newly inserted listing
  listing_id := NEW.id;
  
  -- Call our AI validation API
  -- This will be handled by our Next.js webhook endpoint
  PERFORM pg_notify('ai_validation_needed', 
    json_build_object(
      'listing_id', listing_id,
      'action', 'validate'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call AI validation on new listings
DROP TRIGGER IF EXISTS on_anunturi_insert_ai_validation ON anunturi;
CREATE TRIGGER on_anunturi_insert_ai_validation
  AFTER INSERT ON anunturi
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_validation();

-- Add AI validation columns to anunturi table if they don't exist
DO $$
BEGIN
  -- Check and add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_validation_score'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_validation_score INTEGER;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_validation_issues'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_validation_issues JSONB;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_validation_suggestions'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_validation_suggestions JSONB;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_approved'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_approved BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_validated_at'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_validated_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anunturi' 
    AND column_name = 'ai_reasoning'
  ) THEN
    ALTER TABLE anunturi ADD COLUMN ai_reasoning TEXT;
  END IF;
END $$;