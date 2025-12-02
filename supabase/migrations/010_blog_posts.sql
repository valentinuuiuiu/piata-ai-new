-- Create blog_posts table for automated blog generation
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'AI Marketplace Bot',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.title, '[^a-zA-Z0-9 -]', '', 'g'),
      '\s+', '-', 'g'
    )) || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_slug_trigger
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION generate_blog_slug();

-- Update timestamp trigger  
CREATE TRIGGER blog_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Service role can do everything
CREATE POLICY "Service role can manage posts"
  ON blog_posts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create index for faster queries
CREATE INDEX blog_posts_published_idx ON blog_posts(published, published_at DESC);
CREATE INDEX blog_posts_tags_idx ON blog_posts USING GIN(tags);
