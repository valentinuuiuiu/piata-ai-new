CREATE TABLE IF NOT EXISTS marketing_insights (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
