-- Sprint 2 - news read state, demo bulletin board content, weekly reflections.

BEGIN;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_news_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_news_items_school_pinned_dt
  ON news_items (school_id, pinned DESC, published_at DESC);

CREATE POLICY "news_items_admin_insert" ON news_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.school_id = news_items.school_id
        AND profile.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "news_items_admin_update" ON news_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.school_id = news_items.school_id
        AND profile.role IN ('admin', 'instructor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.school_id = news_items.school_id
        AND profile.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "news_items_admin_delete" ON news_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.school_id = news_items.school_id
        AND profile.role IN ('admin', 'instructor')
    )
  );

CREATE TABLE IF NOT EXISTS weekly_reflections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,
  prompt_1_text  TEXT NOT NULL,
  prompt_2_text  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_week
  ON weekly_reflections (user_id, week_start DESC);

ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_reflections_owner" ON weekly_reflections
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

WITH school AS (
  SELECT id FROM schools LIMIT 1
)
INSERT INTO news_items (
  id,
  school_id,
  title,
  body,
  type,
  published_at,
  event_date,
  event_location,
  pinned
)
SELECT
  '00000000-0000-0000-0000-000000000601'::uuid,
  school.id,
  'Benvenuto nella bacheca',
  'Qui compariranno comunicazioni, promemoria e aggiornamenti della scuola.',
  'announcement'::news_type,
  now(),
  NULL,
  NULL,
  true
FROM school
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  type = EXCLUDED.type,
  published_at = EXCLUDED.published_at,
  event_date = EXCLUDED.event_date,
  event_location = EXCLUDED.event_location,
  pinned = EXCLUDED.pinned;

WITH school AS (
  SELECT id FROM schools LIMIT 1
)
INSERT INTO news_items (
  id,
  school_id,
  title,
  body,
  type,
  published_at,
  event_date,
  event_location,
  pinned
)
SELECT
  '00000000-0000-0000-0000-000000000602'::uuid,
  school.id,
  'Sessione tecnica dimostrativa',
  'Evento demo per verificare la visualizzazione degli appuntamenti in bacheca.',
  'event'::news_type,
  now(),
  (now() + interval '14 days'),
  'Sede scuola',
  false
FROM school
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  type = EXCLUDED.type,
  published_at = EXCLUDED.published_at,
  event_date = EXCLUDED.event_date,
  event_location = EXCLUDED.event_location,
  pinned = EXCLUDED.pinned;

COMMIT;
