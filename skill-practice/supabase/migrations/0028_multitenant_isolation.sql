-- 0028_multitenant_isolation.sql
-- Track B — isolamento multi-tenant per scuola.
--
-- STATO: NO-OP in single-tenant (una sola scuola FESK). Diventa la barriera reale
-- nel momento in cui una seconda federazione viene inserita nello stesso database.
-- Applicare via Supabase SQL Editor (la CLI non e' nel PATH). Consigliato uno snapshot
-- del DB prima, perche' questa migration riscrive policy di sicurezza.
--
-- Cosa fa:
-- 1. Le policy di lettura dei contenuti statici (schools/skills/exam_programs/
--    exam_skill_requirements/news_items) passano da USING(true) a "solo la tua scuola".
-- 2. user_plan_items / practice_logs: WITH CHECK aggiuntivo che impone che la skill
--    referenziata appartenga alla scuola dell'utente (copre i path di INSERT/UPDATE
--    diretti: addSkillToPlan, markPracticeDone, pratica libera).
-- 3. handle_new_user: la scuola del nuovo utente arriva dai metadata dell'invito
--    (raw_user_meta_data->>'school_id'); fallback alla scuola unica solo se ne esiste
--    esattamente una, altrimenti errore esplicito.
-- 4. save_custom_selection (SECURITY DEFINER, bypassa l'RLS): filtra le skill per scuola
--    dell'utente, non solo per disciplina.
-- 5. account_deletion_requests: colonna school_id denormalizzata + trigger, e policy
--    admin ristrette alla propria scuola.

BEGIN;

-- ============================================================
-- 1. CONTENUTI STATICI: lettura ristretta alla scuola del chiamante
-- ============================================================

DROP POLICY IF EXISTS "schools_read" ON schools;
CREATE POLICY "schools_read" ON schools
  FOR SELECT TO authenticated
  USING (
    id = (SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "skills_read" ON skills;
CREATE POLICY "skills_read" ON skills
  FOR SELECT TO authenticated
  USING (
    school_id = (SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "exam_programs_read" ON exam_programs;
CREATE POLICY "exam_programs_read" ON exam_programs
  FOR SELECT TO authenticated
  USING (
    school_id = (SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "news_items_read" ON news_items;
CREATE POLICY "news_items_read" ON news_items
  FOR SELECT TO authenticated
  USING (
    school_id = (SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

-- exam_skill_requirements non ha school_id: si scopa tramite l'exam_program collegato.
DROP POLICY IF EXISTS "esr_read" ON exam_skill_requirements;
CREATE POLICY "esr_read" ON exam_skill_requirements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_programs ep
      WHERE ep.id = exam_skill_requirements.exam_id
        AND ep.school_id = (
          SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
  );

-- ============================================================
-- 2. COERENZA TENANT SU PIANO E DIARIO (path di scrittura diretti)
--    USING invariato (lettura/cancellazione delle proprie righe);
--    WITH CHECK impone che la skill scritta sia della propria scuola.
-- ============================================================

DROP POLICY IF EXISTS "user_plan_items_owner" ON user_plan_items;
CREATE POLICY "user_plan_items_owner" ON user_plan_items
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.skills s
      WHERE s.id = user_plan_items.skill_id
        AND s.school_id = (
          SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "practice_logs_owner" ON practice_logs;
CREATE POLICY "practice_logs_owner" ON practice_logs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.skills s
      WHERE s.id = practice_logs.skill_id
        AND s.school_id = (
          SELECT school_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
        )
    )
  );

-- ============================================================
-- 3. handle_new_user: scuola dai metadata dell'invito
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_school_id UUID;
  meta_school TEXT;
  school_count INT;
BEGIN
  meta_school := NEW.raw_user_meta_data->>'school_id';

  IF meta_school IS NOT NULL AND meta_school <> '' THEN
    SELECT id INTO target_school_id FROM public.schools WHERE id = meta_school::uuid;
    IF target_school_id IS NULL THEN
      RAISE EXCEPTION 'handle_new_user: school_id % dai metadata invito non esiste', meta_school;
    END IF;
  ELSE
    SELECT count(*) INTO school_count FROM public.schools;
    IF school_count = 1 THEN
      SELECT id INTO target_school_id FROM public.schools LIMIT 1;
    ELSE
      RAISE EXCEPTION 'handle_new_user: school_id obbligatorio nei metadata invito con piu'' scuole';
    END IF;
  END IF;

  INSERT INTO public.user_profiles
    (id, school_id, display_name, assigned_level_shaolin, assigned_level_taichi)
  VALUES (
    NEW.id,
    target_school_id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    8,
    0
  );

  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. save_custom_selection: filtro per scuola (la funzione bypassa l'RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.save_custom_selection(
  p_skill_ids UUID[],
  p_discipline discipline
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_school_id UUID;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT school_id INTO current_school_id
  FROM user_profiles WHERE id = current_user_id;

  UPDATE user_profiles
  SET plan_mode = 'custom'
  WHERE id = current_user_id;

  DELETE FROM user_plan_items item
  USING skills skill
  WHERE item.user_id = current_user_id
    AND item.skill_id = skill.id
    AND item.source = 'manual'
    AND skill.discipline = p_discipline
    AND skill.school_id = current_school_id
    AND NOT (item.skill_id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[])));

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    current_user_id,
    skill.id,
    'maintenance'::plan_status,
    'manual'::plan_item_source,
    false
  FROM skills skill
  WHERE skill.id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[]))
    AND skill.discipline = p_discipline
    AND skill.school_id = current_school_id
  ON CONFLICT (user_id, skill_id, source) DO NOTHING;
END;
$$;

-- ============================================================
-- 5. account_deletion_requests: scuola denormalizzata + admin per scuola
-- ============================================================

ALTER TABLE account_deletion_requests
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

CREATE OR REPLACE FUNCTION public.set_deletion_request_school()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT school_id INTO NEW.school_id
  FROM public.user_profiles WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS account_deletion_requests_set_school
  ON account_deletion_requests;
CREATE TRIGGER account_deletion_requests_set_school
  BEFORE INSERT ON account_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_deletion_request_school();

-- Backfill righe esistenti
UPDATE account_deletion_requests adr
SET school_id = up.school_id
FROM user_profiles up
WHERE up.id = adr.user_id
  AND adr.school_id IS NULL;

DROP POLICY IF EXISTS "account_deletion_requests_admin_select"
  ON account_deletion_requests;
CREATE POLICY "account_deletion_requests_admin_select"
  ON account_deletion_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = account_deletion_requests.school_id
    )
  );

DROP POLICY IF EXISTS "account_deletion_requests_admin_update"
  ON account_deletion_requests;
CREATE POLICY "account_deletion_requests_admin_update"
  ON account_deletion_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = account_deletion_requests.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = account_deletion_requests.school_id
    )
  );

COMMIT;
