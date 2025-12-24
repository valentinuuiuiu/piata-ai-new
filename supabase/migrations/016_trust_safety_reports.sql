-- Trust & Safety: listing reports + moderation actions (Human-in-the-loop)

-- 1) Reports table
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.anunturi(id) ON DELETE CASCADE,
  reporter_user_id UUID NULL,
  reason TEXT NOT NULL,
  details TEXT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new | reviewing | resolved | rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by UUID NULL,
  resolution TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON public.listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status_created ON public.listing_reports(status, created_at DESC);

-- 2) Moderation actions audit log
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT NULL REFERENCES public.listing_reports(id) ON DELETE SET NULL,
  listing_id BIGINT NULL REFERENCES public.anunturi(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- hide_listing | unhide_listing | reject_report | resolve_report
  actor TEXT NOT NULL DEFAULT 'telegram_admin',
  actor_user_id UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_listing_id ON public.moderation_actions(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report_id ON public.moderation_actions(report_id);

-- 3) RLS
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
DO $$
BEGIN
  -- listing_reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='listing_reports' AND policyname='service_role_all_reports'
  ) THEN
    CREATE POLICY service_role_all_reports ON public.listing_reports
      FOR ALL
      USING (auth.jwt()->>'role' = 'service_role');
  END IF;

  -- moderation_actions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='moderation_actions' AND policyname='service_role_all_actions'
  ) THEN
    CREATE POLICY service_role_all_actions ON public.moderation_actions
      FOR ALL
      USING (auth.jwt()->>'role' = 'service_role');
  END IF;

  -- Public can insert reports (no auth) if you want: allow insert with NULL reporter
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='listing_reports' AND policyname='public_insert_reports'
  ) THEN
    CREATE POLICY public_insert_reports ON public.listing_reports
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Note: for stricter auth later, replace public_insert_reports with auth-based policy.
