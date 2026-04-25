-- Sprint 1.5 — adeguamento schema per curriculum FESK (Shaolin + T'ai Chi).
-- Rimuove dati Wing Chun, sostituisce skill_category, aggiunge discipline + practice_mode,
-- raddoppia il livello utente (assigned_level_shaolin + assigned_level_taichi).

BEGIN;

-- ============================================================
-- 1. SVUOTA DATI ESISTENTI (preserva schools per coerenza FK con user_profiles)
-- ============================================================

DELETE FROM exam_skill_requirements;
DELETE FROM user_plan_items;
DELETE FROM practice_logs;
DELETE FROM exam_programs;
DELETE FROM skills;
-- schools: aggiornata sotto, non eliminata (FK protegge user_profiles)

-- ============================================================
-- 2. RINOMINA SCHOOL ESISTENTE A FESK
-- ============================================================

UPDATE schools SET
  name = 'FESK — Federazione Europea Scuola Kung Fu "Fong Ttai"',
  description = 'Lignaggio Maestro Chang Dsu Yao, fondata dal Maestro Gianluigi Bestetti.';

-- ============================================================
-- 3. SOSTITUZIONE skill_category (Postgres non rimuove valori da enum)
-- ============================================================

ALTER TABLE skills ALTER COLUMN category TYPE TEXT USING category::text;
DROP TYPE skill_category;
CREATE TYPE skill_category AS ENUM (
  'forme',
  'tui_fa',
  'po_chi',
  'chin_na',
  'armi_forma',
  'armi_combattimento',
  'tue_shou',
  'ta_lu',
  'chi_kung',
  'preparatori'
);
-- skills è vuota → cast funziona anche senza valori
ALTER TABLE skills ALTER COLUMN category TYPE skill_category USING category::skill_category;

-- ============================================================
-- 4. NUOVI ENUM
-- ============================================================

CREATE TYPE discipline AS ENUM ('shaolin', 'taichi');
CREATE TYPE practice_mode AS ENUM ('solo', 'paired', 'both');

-- ============================================================
-- 5. SKILLS — nuove colonne + rinomina
-- ============================================================

ALTER TABLE skills
  ADD COLUMN name_italian   TEXT,
  ADD COLUMN discipline     discipline NOT NULL DEFAULT 'shaolin',
  ADD COLUMN practice_mode  practice_mode NOT NULL DEFAULT 'solo';

ALTER TABLE skills RENAME COLUMN minimum_level TO minimum_grade_value;

DROP INDEX IF EXISTS idx_skills_minimum_level;
CREATE INDEX idx_skills_min_grade   ON skills(minimum_grade_value);
CREATE INDEX idx_skills_discipline  ON skills(discipline);

-- ============================================================
-- 6. EXAM PROGRAMS — nuove colonne + rinomina + nuovo unique
-- ============================================================

ALTER TABLE exam_programs
  ADD COLUMN discipline  discipline NOT NULL DEFAULT 'shaolin',
  ADD COLUMN grade_from  TEXT,
  ADD COLUMN grade_to    TEXT;

ALTER TABLE exam_programs RENAME COLUMN level_number TO grade_value;

ALTER TABLE exam_programs DROP CONSTRAINT IF EXISTS exam_programs_school_id_level_number_key;
ALTER TABLE exam_programs
  ADD CONSTRAINT exam_programs_school_discipline_grade_key
  UNIQUE (school_id, discipline, grade_value);

-- ============================================================
-- 7. USER PROFILES — doppio livello per disciplina
-- ============================================================

-- Aggiungi nuove colonne con default sicuri (Shaolin principiante, T'ai Chi non praticato)
ALTER TABLE user_profiles
  ADD COLUMN assigned_level_shaolin INT NOT NULL DEFAULT 8,
  ADD COLUMN assigned_level_taichi  INT NOT NULL DEFAULT 0;

-- Rimuovi vecchio singolo livello
ALTER TABLE user_profiles DROP COLUMN assigned_level;

-- ============================================================
-- 8. AGGIORNA TRIGGER handle_new_user
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

  INSERT INTO public.user_profiles
    (id, school_id, display_name, assigned_level_shaolin, assigned_level_taichi)
  VALUES (
    NEW.id,
    default_school_id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    8,
    0
  );

  RETURN NEW;
END;
$$;

-- Trigger già esistente (on_auth_user_created), CREATE OR REPLACE FUNCTION basta.

COMMIT;
