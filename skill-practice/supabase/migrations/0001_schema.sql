-- Skill Practice — schema iniziale
-- Tutte le tabelle hanno RLS attiva. Statici: read pubblico per authenticated.
-- Dinamici (per utente): solo proprietario via auth.uid().

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE skill_category AS ENUM (
  'forme',
  'tecniche_base',
  'combinazioni',
  'preparatori',
  'condizionamento',
  'altro'
);

CREATE TYPE plan_status AS ENUM ('focus', 'review', 'maintenance');

CREATE TYPE plan_item_source AS ENUM ('exam_program', 'manual');

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

CREATE TYPE news_type AS ENUM ('event', 'announcement');

-- ============================================================
-- TABELLE STATICHE (authored content)
-- ============================================================

CREATE TABLE schools (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT
);

CREATE TABLE skills (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name                        TEXT NOT NULL,
  category                    skill_category NOT NULL,
  description                 TEXT,
  video_url                   TEXT NOT NULL,
  thumbnail_url               TEXT,
  teacher_notes               TEXT,
  estimated_duration_seconds  INT,
  minimum_level               INT NOT NULL DEFAULT 1,
  display_order               INT NOT NULL DEFAULT 0,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exam_programs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  level_number  INT NOT NULL,
  level_name    TEXT NOT NULL,
  description   TEXT,
  UNIQUE (school_id, level_number)
);

-- Junction table (NON JSONB, vedi piano §4.1)
CREATE TABLE exam_skill_requirements (
  exam_id         UUID NOT NULL REFERENCES exam_programs(id) ON DELETE CASCADE,
  skill_id        UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  default_status  plan_status NOT NULL,
  PRIMARY KEY (exam_id, skill_id)
);

-- ============================================================
-- TABELLE DINAMICHE (per utente)
-- ============================================================

CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id           UUID NOT NULL REFERENCES schools(id),
  display_name        TEXT NOT NULL,
  assigned_level      INT NOT NULL DEFAULT 1,
  preparing_exam_id   UUID REFERENCES exam_programs(id) ON DELETE SET NULL,
  role                user_role NOT NULL DEFAULT 'student',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_plan_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id           UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  status             plan_status NOT NULL,
  source             plan_item_source NOT NULL,
  is_hidden          BOOLEAN NOT NULL DEFAULT false,
  last_practiced_at  TIMESTAMPTZ,
  added_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);

CREATE TABLE practice_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id       UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  completed      BOOLEAN NOT NULL DEFAULT true,
  personal_note  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABELLE PREDISPOSTE SPRINT 2/3
-- ============================================================

CREATE TABLE news_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            news_type NOT NULL DEFAULT 'announcement',
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_date      TIMESTAMPTZ,
  event_location  TEXT,
  pinned          BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- INDICI
-- ============================================================

CREATE INDEX idx_skills_school          ON skills(school_id);
CREATE INDEX idx_skills_minimum_level   ON skills(minimum_level);
CREATE INDEX idx_skills_category        ON skills(category);
CREATE INDEX idx_exam_programs_school   ON exam_programs(school_id);
CREATE INDEX idx_esr_skill              ON exam_skill_requirements(skill_id);
CREATE INDEX idx_user_plan_items_user   ON user_plan_items(user_id) WHERE is_hidden = false;
CREATE INDEX idx_practice_logs_user_dt  ON practice_logs(user_id, date DESC);
CREATE INDEX idx_news_items_school_dt   ON news_items(school_id, published_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Statici: lettura per qualsiasi utente autenticato
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schools_read" ON schools
  FOR SELECT TO authenticated USING (true);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_read" ON skills
  FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_programs_read" ON exam_programs
  FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_skill_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esr_read" ON exam_skill_requirements
  FOR SELECT TO authenticated USING (true);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_items_read" ON news_items
  FOR SELECT TO authenticated USING (true);

-- Dinamici: solo il proprietario
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_owner_select" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "user_profiles_owner_update" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- INSERT su user_profiles fatto dal trigger (SECURITY DEFINER), nessuna policy INSERT lato utente

ALTER TABLE user_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_plan_items_owner" ON user_plan_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_logs_owner" ON practice_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TRIGGER: auto-create user_profile alla registrazione
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_school_id UUID;
BEGIN
  SELECT id INTO default_school_id FROM public.schools LIMIT 1;

  INSERT INTO public.user_profiles (id, school_id, display_name, assigned_level)
  VALUES (
    NEW.id,
    default_school_id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    1
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
