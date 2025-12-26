-- Comprehensive Analytics and Performance Monitoring System
-- This migration adds tables for multi-channel tracking, real-time monitoring, and market intelligence

-- 1. Marketing Analytics Events (Raw event stream)
CREATE TABLE IF NOT EXISTS marketing_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'click', 'view', 'conversion', 'open', 'share', 'referral'
    channel TEXT NOT NULL, -- 'email', 'facebook', 'instagram', 'tiktok', 'seo', 'referral', 'direct'
    campaign_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id TEXT, -- For tracking non-logged in users
    url TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- browser, device, city, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Acquisition Funnel Tracking
CREATE TABLE IF NOT EXISTS acquisition_funnels (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT, -- utm_source
    medium TEXT, -- utm_medium
    campaign TEXT, -- utm_campaign
    content TEXT, -- utm_content
    term TEXT, -- utm_term
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    funnel_stage TEXT DEFAULT 'awareness', -- 'awareness', 'interest', 'consideration', 'conversion', 'retention'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Geographic Performance (Romanian Market Focus)
CREATE TABLE IF NOT EXISTS geographic_performance (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL, -- București, Cluj, Timișoara, etc.
    region TEXT,
    channel TEXT,
    users_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(city, channel, date)
);

-- 4. Competitor Monitoring
CREATE TABLE IF NOT EXISTS competitor_metrics (
    id BIGSERIAL PRIMARY KEY,
    competitor_name TEXT NOT NULL, -- 'OLX', 'eMAG', 'Okazii'
    metric_name TEXT NOT NULL, -- 'listing_count', 'avg_price', 'traffic_estimate'
    metric_value DECIMAL(12, 2),
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROI and Budget Optimization
CREATE TABLE IF NOT EXISTS marketing_roi (
    id BIGSERIAL PRIMARY KEY,
    channel TEXT NOT NULL,
    campaign_id TEXT,
    spend DECIMAL(10, 2) DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    roi DECIMAL(10, 2) GENERATED ALWAYS AS (CASE WHEN spend > 0 THEN (revenue - spend) / spend ELSE 0 END) STORED,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(channel, campaign_id, date)
);

-- 6. Performance Alerts Configuration
CREATE TABLE IF NOT EXISTS performance_alerts_config (
    id BIGSERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL, -- 'conversion_rate', 'error_rate', 'roi'
    channel TEXT,
    threshold_low DECIMAL(10, 2),
    threshold_high DECIMAL(10, 2),
    notification_channels TEXT[], -- ['email', 'slack', 'push']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Performance Alerts History
CREATE TABLE IF NOT EXISTS performance_alerts_history (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT REFERENCES performance_alerts_config(id),
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    current_value DECIMAL(10, 2),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' -- 'active', 'resolved', 'ignored'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS marketing_events_type_channel_idx ON marketing_events(event_type, channel, created_at DESC);
CREATE INDEX IF NOT EXISTS marketing_events_user_idx ON marketing_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS acquisition_funnels_source_idx ON acquisition_funnels(source, first_seen_at DESC);
CREATE INDEX IF NOT EXISTS geographic_performance_city_date_idx ON geographic_performance(city, date DESC);
CREATE INDEX IF NOT EXISTS competitor_metrics_name_idx ON competitor_metrics(competitor_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS marketing_roi_channel_date_idx ON marketing_roi(channel, date DESC);

-- RLS Policies
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_roi ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts_history ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access marketing_events" ON marketing_events FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access acquisition_funnels" ON acquisition_funnels FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access geographic_performance" ON geographic_performance FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access competitor_metrics" ON competitor_metrics FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access marketing_roi" ON marketing_roi FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access alerts_config" ON performance_alerts_config FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access alerts_history" ON performance_alerts_history FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view everything
CREATE POLICY "Admins can view marketing_events" ON marketing_events FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view acquisition_funnels" ON acquisition_funnels FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view geographic_performance" ON geographic_performance FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view competitor_metrics" ON competitor_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view marketing_roi" ON marketing_roi FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view alerts_config" ON performance_alerts_config FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view alerts_history" ON performance_alerts_history FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Functions for real-time aggregation
CREATE OR REPLACE FUNCTION track_marketing_event(
    p_event_type TEXT,
    p_channel TEXT,
    p_campaign_id TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS BIGINT AS $$
DECLARE
    v_event_id BIGINT;
    v_city TEXT;
BEGIN
    -- Insert raw event
    INSERT INTO marketing_events (event_type, channel, campaign_id, user_id, metadata)
    VALUES (p_event_type, p_channel, p_campaign_id, p_user_id, p_metadata)
    RETURNING id INTO v_event_id;

    -- Update geographic performance if city is in metadata
    v_city := p_metadata->>'city';
    IF v_city IS NOT NULL THEN
        INSERT INTO geographic_performance (city, channel, users_count, conversions_count, date)
        VALUES (v_city, p_channel, 1, CASE WHEN p_event_type = 'conversion' THEN 1 ELSE 0 END, CURRENT_DATE)
        ON CONFLICT (city, channel, date) DO UPDATE SET
            users_count = geographic_performance.users_count + 1,
            conversions_count = geographic_performance.conversions_count + (CASE WHEN p_event_type = 'conversion' THEN 1 ELSE 0 END);
    END IF;

    -- Update ROI metrics if it's a conversion with revenue
    IF p_event_type = 'conversion' AND (p_metadata->>'revenue') IS NOT NULL THEN
        INSERT INTO marketing_roi (channel, campaign_id, revenue, conversions, date)
        VALUES (p_channel, p_campaign_id, (p_metadata->>'revenue')::DECIMAL, 1, CURRENT_DATE)
        ON CONFLICT (channel, campaign_id, date) DO UPDATE SET
            revenue = marketing_roi.revenue + (p_metadata->>'revenue')::DECIMAL,
            conversions = marketing_roi.conversions + 1;
    END IF;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for Real-Time Dashboard
CREATE OR REPLACE VIEW realtime_marketing_stats AS
SELECT 
    channel,
    COUNT(*) FILTER (WHERE event_type = 'view') as views,
    COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
    ROUND(COUNT(*) FILTER (WHERE event_type = 'click')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE event_type = 'view'), 0) * 100, 2) as ctr,
    ROUND(COUNT(*) FILTER (WHERE event_type = 'conversion')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE event_type = 'click'), 0) * 100, 2) as conversion_rate
FROM marketing_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY channel;
