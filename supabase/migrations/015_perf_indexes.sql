-- Performance indexes for marketplace scale
-- Adds indexes to keep listing/category/search queries fast as data grows

-- Listings (anunturi)
CREATE INDEX IF NOT EXISTS idx_anunturi_status_created_at ON public.anunturi (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anunturi_category_status ON public.anunturi (category_id, status);
CREATE INDEX IF NOT EXISTS idx_anunturi_subcategory_status ON public.anunturi (subcategory_id, status);
CREATE INDEX IF NOT EXISTS idx_anunturi_user_created_at ON public.anunturi (user_id, created_at DESC);

-- If you use title search often
CREATE INDEX IF NOT EXISTS idx_anunturi_title_trgm ON public.anunturi USING gin (title gin_trgm_ops);

-- Categories/subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories (category_id);

-- Notes:
-- 1) idx_anunturi_title_trgm requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- 2) Run in Supabase SQL editor if migrations aren't auto-applied.
