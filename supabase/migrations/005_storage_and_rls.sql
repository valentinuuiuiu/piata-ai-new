-- Create storage bucket for listings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings', 
  'listings', 
  false, 
  5242880, -- 5MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage
-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload listings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name)[1] = auth.uid()::text OR auth.jwt() ->> 'is_admin')
);

-- Policy 2: Users can update their own files
CREATE POLICY "Users can update own listings" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name)[1] = auth.uid()::text OR auth.jwt() ->> 'is_admin')
);

-- Policy 3: Users can read their own files
CREATE POLICY "Users can read own listings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name)[1] = auth.uid()::text OR auth.jwt() ->> 'is_admin')
);

-- Policy 4: Admins can do everything
CREATE POLICY "Admins full access to listings" ON storage.objects
FOR ALL USING (
  bucket_id = 'listings' AND
  auth.jwt() ->> 'is_admin'
);

-- Policy 5: Public can read listing images
CREATE POLICY "Public can read listing images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'listings' AND
  (storage.foldername(name)[1] = auth.uid()::text OR auth.jwt() ->> 'is_admin')
);

-- Grant permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- Create function to check if user owns the listing
CREATE OR REPLACE FUNCTION user_owns_listing(listing_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM anunturi 
        WHERE id = listing_id_param 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(auth.jwt() ->> 'is_admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies with better checks
DROP POLICY IF EXISTS "Users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own listings" ON storage.objects;
DROP POLICY IF EXISTS "Admins full access to listings" ON storage.objects;
DROP POLICY IF EXISTS "Public can read listing images" ON storage.objects;

CREATE POLICY "Users can upload listings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own listings" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated' AND
  storage.foldername(name)[1] = auth.uid()::text
);

CREATE POLICY "Users can read own listings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated' AND
  storage.foldername(name)[1] = auth.uid()::text
);

CREATE POLICY "Admins full access to listings" ON storage.objects
FOR ALL USING (
  bucket_id = 'listings' AND
  is_current_user_admin()
);

CREATE POLICY "Public can read listing images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'listings' AND
  (storage.foldername(name)[1] = auth.uid()::text OR is_current_user_admin())
);

-- Create RLS policies for anunturi table
-- Policy 1: Users can see their own listings
CREATE POLICY "Users can view own listings" ON anunturi
FOR SELECT USING (
  auth.uid() = user_id
);

-- Policy 2: Users can insert their own listings
CREATE POLICY "Users can insert own listings" ON anunturi
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Policy 3: Users can update their own listings
CREATE POLICY "Users can update own listings" ON anunturi
FOR UPDATE USING (
  auth.uid() = user_id
);

-- Policy 4: Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON anunturi
FOR DELETE USING (
  auth.uid() = user_id
);

-- Policy 5: Admins can do everything
CREATE POLICY "Admins full access to listings" ON anunturi
FOR ALL USING (
  is_current_user_admin()
);

-- Enable RLS on anunturi table
ALTER TABLE anunturi ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON anunturi TO authenticated;
GRANT ALL ON anunturi TO service_role;