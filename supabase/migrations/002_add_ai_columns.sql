-- Add AI validation columns to anunturi table
ALTER TABLE anunturi 
ADD COLUMN IF NOT EXISTS ai_validation_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_validation_issues JSONB,
ADD COLUMN IF NOT EXISTS ai_validation_suggestions JSONB,
ADD COLUMN IF NOT EXISTS ai_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_requested_fixes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_rejected_at TIMESTAMP WITH TIME ZONE;

-- Create index for AI validation performance
CREATE INDEX IF NOT EXISTS idx_anunturi_ai_score ON anunturi(ai_validation_score);
CREATE INDEX IF NOT EXISTS idx_anunturi_ai_approved ON anunturi(ai_approved);
CREATE INDEX IF NOT EXISTS idx_anunturi_status_ai ON anunturi(status, ai_approved);

-- Create function to trigger AI validation
CREATE OR REPLACE FUNCTION trigger_ai_validation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger
  INSERT INTO ai_validation_logs (listing_id, action, created_at)
  VALUES (NEW.id, 'auto_validate', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create log table for AI validation
CREATE TABLE IF NOT EXISTS ai_validation_logs (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES anunturi(id) ON DELETE CASCADE,
  action VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  error_message TEXT
);

-- Create trigger for new listings
DROP TRIGGER IF EXISTS on_anunturi_insert_ai_validation ON anunturi;
CREATE TRIGGER on_anunturi_insert_ai_validation
  AFTER INSERT ON anunturi
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_validation();