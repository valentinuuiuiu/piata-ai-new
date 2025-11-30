-- Fix Supabase storage bucket permissions and RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload listings" ON storage.buckets;
DROP POLICY IF EXISTS "Users can update own listings" ON storage.buckets;
DROP POLICY IF EXISTS "Users can read own listings" ON storage.buckets;
DROP POLICY IF EXISTS "Admins full access to listings" ON storage.buckets;
DROP POLICY IF EXISTS "Public can read listing images" ON storage.buckets;

-- Create proper policies for listings bucket
CREATE POLICY "Users can upload listings" ON storage.buckets
FOR INSERT
WITH CHECK (
  bucket_id = 'listings',
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own listings" ON storage.buckets
FOR UPDATE
WITH CHECK (
  bucket_id = 'listings',
  auth.role() = 'authenticated',
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can read own listings" ON storage.buckets
FOR SELECT
WITH CHECK (
  bucket_id = 'listings',
  auth.role() = 'authenticated',
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Admins full access to listings" ON storage.buckets
FOR ALL
USING (
  bucket_id = 'listings',
  auth.jwt() ->> 'is_admin'::boolean
);

CREATE POLICY "Public can read listing images" ON storage.buckets
FOR SELECT
WITH CHECK (
  bucket_id = 'listings',
  (storage.foldername(name))[1] = auth.uid()
);

-- Grant permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO service_role;

-- Fix RLS policies for anunturi table
DROP POLICY IF EXISTS "Users can view own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can insert own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can update own listings" ON anunturi;
DROP POLICY IF EXISTS "Users can delete own listings" ON anunturi;
DROP POLICY IF EXISTS "Admins full access to listings" ON anunturi;

-- Create proper RLS policies
CREATE POLICY "Users can view own listings" ON anunturi
FOR SELECT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert own listings" ON anunturi
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own listings" ON anunturi
FOR UPDATE
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own listings" ON anunturi
FOR DELETE
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Admins full access to listings" ON anunturi
FOR ALL
USING (
  auth.jwt() ->> 'is_admin'::boolean
);

-- Enable RLS on anunturi table
ALTER TABLE anunturi ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON anunturi TO authenticated;
GRANT ALL ON anunturi TO service_role;