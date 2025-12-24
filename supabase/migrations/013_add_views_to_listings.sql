-- Add views column to anunturi table for tracking listing views

ALTER TABLE anunturi ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_view(p_listing_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE anunturi 
  SET views = views + 1 
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance when sorting by views
CREATE INDEX IF NOT EXISTS anunturi_views_idx ON anunturi(views DESC);
