-- Marketing Automation Tables
-- Create tables for email campaigns, social media posts, and automation tracking

-- Email Campaigns Tracking
CREATE TABLE IF NOT EXISTS email_campaigns (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL, -- 're-engagement', 'welcome', 'digest', 'notification'
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent', -- 'sent', 'opened', 'clicked', 'bounced', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Posts Queue
CREATE TABLE IF NOT EXISTS social_media_posts (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin'
  content TEXT NOT NULL,
  listing_id BIGINT REFERENCES anunturi(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed'
  engagement_stats JSONB DEFAULT '{}'::jsonb, -- likes, shares, comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Execution Logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id BIGSERIAL PRIMARY KEY,
  automation_name TEXT NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  execution_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences for Marketing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weekly_digest BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS email_campaigns_user_idx ON email_campaigns(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON email_campaigns(status, sent_at DESC);
CREATE INDEX IF NOT EXISTS social_posts_platform_idx ON social_media_posts(platform, scheduled_for);
CREATE INDEX IF NOT EXISTS social_posts_status_idx ON social_media_posts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS automation_logs_name_idx ON automation_logs(automation_name, execution_time DESC);

-- RLS Policies
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON email_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage everything
CREATE POLICY "Service role full access campaigns"
  ON email_campaigns FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access social"
  ON social_media_posts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access logs"
  ON automation_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view social posts and logs
CREATE POLICY "Admins can view social posts"
  ON social_media_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view automation logs"
  ON automation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log automation execution
CREATE OR REPLACE FUNCTION log_automation_execution(
  p_automation_name TEXT,
  p_status TEXT,
  p_processed INTEGER,
  p_succeeded INTEGER,
  p_failed INTEGER,
  p_duration_ms INTEGER,
  p_error_details JSONB DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  INSERT INTO automation_logs (
    automation_name,
    status,
    records_processed,
    records_succeeded,
    records_failed,
    execution_duration_ms,
    error_details
  ) VALUES (
    p_automation_name,
    p_status,
    p_processed,
    p_succeeded,
    p_failed,
    p_duration_ms,
    p_error_details
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track email opens (called via pixel or webhook)
CREATE OR REPLACE FUNCTION track_email_open(p_campaign_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    opened_at = COALESCE(opened_at, NOW()),
    status = CASE WHEN status = 'sent' THEN 'opened' ELSE status END
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track email clicks
CREATE OR REPLACE FUNCTION track_email_click(p_campaign_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    clicked_at = COALESCE(clicked_at, NOW()),
    status = 'clicked'
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for marketing analytics
CREATE OR REPLACE VIEW marketing_analytics AS
SELECT 
  DATE_TRUNC('day', sent_at) as date,
  campaign_type,
  COUNT(*) as total_sent,
  COUNT(opened_at) as total_opened,
  COUNT(clicked_at) as total_clicked,
  ROUND(COUNT(opened_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
  ROUND(COUNT(clicked_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as click_rate
FROM email_campaigns
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', sent_at), campaign_type
ORDER BY date DESC;

-- Grant access to service role
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON social_media_posts TO service_role;
GRANT ALL ON automation_logs TO service_role;
GRANT SELECT ON marketing_analytics TO service_role;