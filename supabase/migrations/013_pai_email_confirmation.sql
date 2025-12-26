-- Migration: Add confirmation tokens table for PAI internal email system
-- Run this in Supabase SQL Editor to enable PAI ad confirmation emails

-- Create table to store confirmation tokens
CREATE TABLE IF NOT EXISTS listing_confirmations (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES anunturi(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_listing_confirmations_token ON listing_confirmations(token);
CREATE INDEX IF NOT EXISTS idx_listing_confirmations_listing_id ON listing_confirmations(listing_id);

-- Function to clean up expired tokens (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_confirmation_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM listing_confirmations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at column if not exists
ALTER TABLE anunturi ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE anunturi ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Remove old Vercel cron resend dependency - PAI now handles this internally
-- This migration enables:
-- 1. PAI creates listing and sends confirmation email via Resend
-- 2. User clicks confirmation link
-- 3. Token is verified against listing_confirmations table
-- 4. Listing is activated

-- Note: Remove old cron jobs from vercel.json that handled email sending
-- PAI now does this internally via /api/pai action="create_listing"
