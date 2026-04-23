-- =============================================
-- Game Views tracking
-- =============================================
CREATE TABLE IF NOT EXISTS game_views (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text NOT NULL,
  viewed_at   timestamptz DEFAULT now(),
  ip_hash     text,            -- hashed IP for uniqueness (no PII stored)
  user_agent  text
);

CREATE INDEX IF NOT EXISTS idx_game_views_slug      ON game_views (slug);
CREATE INDEX IF NOT EXISTS idx_game_views_viewed_at ON game_views (viewed_at);

-- Materialized counter for fast reads
CREATE TABLE IF NOT EXISTS game_view_counts (
  slug        text PRIMARY KEY,
  view_count  bigint DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- =============================================
-- Comments
-- =============================================
CREATE TABLE IF NOT EXISTS game_comments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text NOT NULL,
  author      text NOT NULL DEFAULT 'Anonyme',
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_comments_slug       ON game_comments (slug);
CREATE INDEX IF NOT EXISTS idx_game_comments_created_at ON game_comments (created_at DESC);

-- =============================================
-- Scrape logs (for admin history)
-- =============================================
CREATE TABLE IF NOT EXISTS scrape_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source      text NOT NULL,
  started_at  timestamptz DEFAULT now(),
  finished_at timestamptz,
  status      text DEFAULT 'running',  -- running | success | error
  games_found int DEFAULT 0,
  games_new   int DEFAULT 0,
  error       text,
  details     jsonb
);

CREATE INDEX IF NOT EXISTS idx_scrape_logs_started_at ON scrape_logs (started_at DESC);

-- RLS: allow anon reads for views/comments, restrict writes
ALTER TABLE game_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_view_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Anon can insert views
CREATE POLICY "anon_insert_views" ON game_views FOR INSERT TO anon WITH CHECK (true);
-- Anon can read view counts
CREATE POLICY "anon_read_view_counts" ON game_view_counts FOR SELECT TO anon USING (true);
-- Anon can read and insert comments
CREATE POLICY "anon_read_comments" ON game_comments FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_comments" ON game_comments FOR INSERT TO anon WITH CHECK (true);
-- Service role only for scrape_logs
CREATE POLICY "service_all_scrape_logs" ON scrape_logs FOR ALL TO service_role USING (true);
-- Anon can read scrape_logs
CREATE POLICY "anon_read_scrape_logs" ON scrape_logs FOR SELECT TO anon USING (true);
-- Service role full access on view tables
CREATE POLICY "service_all_views" ON game_views FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_view_counts" ON game_view_counts FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_comments" ON game_comments FOR ALL TO service_role USING (true);
