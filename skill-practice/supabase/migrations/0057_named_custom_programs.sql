BEGIN;

CREATE TABLE public.custom_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (
    char_length(name) BETWEEN 1 AND 60
    AND name = btrim(name)
    AND name !~ '[[:cntrl:]]'
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, id)
);
CREATE UNIQUE INDEX custom_programs_owner_name_key
  ON public.custom_programs (user_id, lower(name));
ALTER TABLE public.custom_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY custom_programs_owner ON public.custom_programs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_programs TO authenticated;
GRANT ALL ON public.custom_programs TO service_role;

ALTER TABLE public.user_profiles ADD COLUMN active_custom_program_id uuid;
ALTER TABLE public.user_plan_items ADD COLUMN custom_program_id uuid;

INSERT INTO public.custom_programs (user_id, name)
SELECT profile.id, 'Il mio programma'
FROM public.user_profiles profile
WHERE profile.plan_mode = 'custom'
   OR EXISTS (SELECT 1 FROM public.user_plan_items item
              WHERE item.user_id = profile.id AND item.source = 'manual');

UPDATE public.user_profiles profile
SET active_custom_program_id = program.id
FROM public.custom_programs program WHERE program.user_id = profile.id;
UPDATE public.user_plan_items item
SET custom_program_id = profile.active_custom_program_id
FROM public.user_profiles profile
WHERE item.user_id = profile.id AND item.source = 'manual';

ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_custom_program_owner_fk
  FOREIGN KEY (id, active_custom_program_id)
  REFERENCES public.custom_programs (user_id, id)
  ON DELETE SET NULL (active_custom_program_id);
ALTER TABLE public.user_plan_items ADD CONSTRAINT user_plan_items_custom_program_owner_fk
  FOREIGN KEY (user_id, custom_program_id)
  REFERENCES public.custom_programs (user_id, id) ON DELETE CASCADE;
ALTER TABLE public.user_plan_items ADD CONSTRAINT user_plan_items_program_source_check
  CHECK ((source = 'manual' AND custom_program_id IS NOT NULL)
      OR (source = 'exam_program' AND custom_program_id IS NULL));
ALTER TABLE public.user_plan_items DROP CONSTRAINT user_plan_items_user_skill_source_key;
ALTER TABLE public.user_plan_items ADD CONSTRAINT user_plan_items_user_skill_source_program_key
  UNIQUE NULLS NOT DISTINCT (user_id, skill_id, source, custom_program_id);
CREATE INDEX user_plan_items_visible_program_idx
  ON public.user_plan_items (user_id, custom_program_id) WHERE is_hidden = false;

CREATE FUNCTION public.touch_custom_program()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER custom_programs_touch BEFORE UPDATE ON public.custom_programs
  FOR EACH ROW EXECUTE FUNCTION public.touch_custom_program();

CREATE FUNCTION public.ensure_user_custom_program(p_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  program_id uuid;
BEGIN
  SELECT active_custom_program_id INTO program_id
  FROM user_profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF program_id IS NOT NULL THEN RETURN program_id; END IF;
  SELECT id INTO program_id FROM custom_programs
  WHERE user_id = p_user_id ORDER BY created_at, id LIMIT 1;
  IF program_id IS NULL THEN
    INSERT INTO custom_programs (user_id, name) VALUES (p_user_id, 'Il mio programma')
    RETURNING id INTO program_id;
  END IF;
  UPDATE user_profiles SET active_custom_program_id = program_id WHERE id = p_user_id;
  RETURN program_id;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_user_custom_program(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_custom_program(uuid) TO service_role;

CREATE FUNCTION public.assign_manual_program()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.source = 'manual' AND NEW.custom_program_id IS NULL THEN
    NEW.custom_program_id = public.ensure_user_custom_program(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER user_plan_items_assign_manual_program
  BEFORE INSERT ON public.user_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.assign_manual_program();

CREATE FUNCTION public.prevent_active_custom_program_deletion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  active_mode text;
  active_program_id uuid;
BEGIN
  -- Cascading account deletion must still remove the complete account.
  IF pg_trigger_depth() = 1 THEN
    SELECT plan_mode, active_custom_program_id INTO active_mode, active_program_id
    FROM user_profiles WHERE id = OLD.user_id FOR UPDATE;
    IF active_mode = 'custom' AND active_program_id = OLD.id THEN
      RAISE EXCEPTION 'Cannot delete the active custom program';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER custom_programs_guard_active_delete BEFORE DELETE ON public.custom_programs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_active_custom_program_deletion();

CREATE FUNCTION public.create_custom_program(p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_user_id uuid := auth.uid();
  program_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM 1 FROM user_profiles WHERE id = current_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  INSERT INTO custom_programs (user_id, name) VALUES (current_user_id, btrim(p_name))
  RETURNING id INTO program_id;
  RETURN program_id;
END;
$$;

CREATE FUNCTION public.rename_custom_program(p_program_id uuid, p_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE custom_programs SET name = btrim(p_name) WHERE id = p_program_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Custom program not found'; END IF;
END;
$$;

CREATE FUNCTION public.delete_custom_program(p_program_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM 1 FROM user_profiles WHERE id = auth.uid() FOR UPDATE;
  DELETE FROM custom_programs WHERE id = p_program_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Custom program not found'; END IF;
END;
$$;

CREATE FUNCTION public.activate_custom_program(p_program_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM 1 FROM user_profiles WHERE id = auth.uid() FOR UPDATE;
  PERFORM 1 FROM custom_programs WHERE id = p_program_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Custom program not found'; END IF;
  UPDATE user_profiles SET plan_mode = 'custom', active_custom_program_id = p_program_id
  WHERE id = auth.uid();
END;
$$;

CREATE FUNCTION public.save_named_custom_selection(
  p_program_id uuid, p_skill_ids uuid[], p_discipline discipline
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_school_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM 1 FROM user_profiles WHERE id = current_user_id FOR UPDATE;
  PERFORM 1 FROM custom_programs WHERE id = p_program_id AND user_id = current_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Custom program not found'; END IF;
  SELECT school_id INTO current_school_id FROM user_profiles WHERE id = current_user_id;
  DELETE FROM user_plan_items item USING skills skill
  WHERE item.user_id = current_user_id AND item.custom_program_id = p_program_id
    AND item.source = 'manual' AND item.skill_id = skill.id
    AND skill.discipline = p_discipline AND skill.school_id = current_school_id
    AND NOT (item.skill_id = ANY(COALESCE(p_skill_ids, ARRAY[]::uuid[])));
  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden, custom_program_id)
  SELECT current_user_id, skill.id, 'maintenance'::plan_status, 'manual'::plan_item_source, false, p_program_id
  FROM skills skill
  WHERE skill.id = ANY(COALESCE(p_skill_ids, ARRAY[]::uuid[]))
    AND skill.discipline = p_discipline AND skill.school_id = current_school_id
    AND public.is_skill_in_scope(skill.id)
  ON CONFLICT (user_id, skill_id, source, custom_program_id) DO UPDATE SET is_hidden = false;
  UPDATE custom_programs SET updated_at = now() WHERE id = p_program_id;
END;
$$;

CREATE FUNCTION public.update_named_custom_item_status(
  p_program_id uuid, p_skill_id uuid, p_status plan_status
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM 1 FROM custom_programs WHERE id = p_program_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Custom program not found'; END IF;
  IF NOT public.is_skill_in_scope(p_skill_id) THEN RAISE EXCEPTION 'Skill not available'; END IF;
  UPDATE user_plan_items SET status = p_status
  WHERE user_id = auth.uid() AND custom_program_id = p_program_id
    AND source = 'manual' AND skill_id = p_skill_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Program exercise not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.switch_to_custom_mode()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE program_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  program_id := public.ensure_user_custom_program(auth.uid());
  PERFORM public.activate_custom_program(program_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_custom_selection(p_skill_ids uuid[], p_discipline discipline)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE program_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  program_id := public.ensure_user_custom_program(auth.uid());
  PERFORM public.save_named_custom_selection(program_id, p_skill_ids, p_discipline);
  PERFORM public.activate_custom_program(program_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_plan_item_status(p_skill_id uuid, p_status plan_status)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE active_mode text; program_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT plan_mode, active_custom_program_id INTO active_mode, program_id
  FROM user_profiles WHERE id = auth.uid();
  UPDATE user_plan_items SET status = p_status
  WHERE user_id = auth.uid() AND skill_id = p_skill_id
    AND ((active_mode = 'custom' AND source = 'manual' AND custom_program_id = program_id)
      OR (active_mode = 'exam' AND source = 'exam_program'));
END;
$$;

CREATE OR REPLACE FUNCTION public.hide_plan_item(p_skill_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE active_mode text; program_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT plan_mode, active_custom_program_id INTO active_mode, program_id
  FROM user_profiles WHERE id = auth.uid();
  UPDATE user_plan_items SET is_hidden = true
  WHERE user_id = auth.uid() AND skill_id = p_skill_id
    AND ((active_mode = 'custom' AND source = 'manual' AND custom_program_id = program_id)
      OR (active_mode = 'exam' AND source = 'exam_program'));
END;
$$;

CREATE FUNCTION public.add_skill_to_custom_program(
  p_skill_id uuid, p_status plan_status DEFAULT 'maintenance'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE program_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_skill_in_scope(p_skill_id) THEN RAISE EXCEPTION 'Skill not available'; END IF;
  program_id := public.ensure_user_custom_program(auth.uid());
  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden, custom_program_id)
  VALUES (auth.uid(), p_skill_id, p_status, 'manual', false, program_id)
  ON CONFLICT (user_id, skill_id, source, custom_program_id)
  DO UPDATE SET status = EXCLUDED.status, is_hidden = false;
END;
$$;

REVOKE ALL ON FUNCTION public.add_skill_to_custom_program(uuid, plan_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_skill_to_custom_program(uuid, plan_status) TO authenticated;
REVOKE ALL ON FUNCTION public.create_custom_program(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rename_custom_program(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_custom_program(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.activate_custom_program(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_named_custom_selection(uuid, uuid[], discipline) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_named_custom_item_status(uuid, uuid, plan_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_custom_program(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rename_custom_program(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_custom_program(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_custom_program(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_named_custom_selection(uuid, uuid[], discipline) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_named_custom_item_status(uuid, uuid, plan_status) TO authenticated;

-- Existing exam function bodies follow, with the expanded conflict key only.

CREATE OR REPLACE FUNCTION public.activate_exam_mode(
  p_exam_shaolin_id UUID,
  p_exam_taichi_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_exam_shaolin_id IS NULL AND p_exam_taichi_id IS NULL THEN
    RAISE EXCEPTION 'Seleziona almeno un esame';
  END IF;

  IF p_exam_shaolin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
    WHERE profile.id = current_user_id
      AND exam.id = p_exam_shaolin_id
      AND exam.discipline = 'shaolin'
      AND exam.grade_from IS NOT NULL
      AND exam.grade_value >= CASE
        WHEN profile.assigned_level_shaolin = 1 THEN -1
        ELSE profile.assigned_level_shaolin - 1
      END
  ) THEN
    RAISE EXCEPTION 'Invalid Shaolin exam';
  END IF;

  IF p_exam_taichi_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
    WHERE profile.id = current_user_id
      AND exam.id = p_exam_taichi_id
      AND exam.discipline = 'taichi'
      AND profile.assigned_level_taichi <> 0
      AND exam.grade_from IS NOT NULL
      AND exam.grade_value >= CASE
        WHEN profile.assigned_level_taichi = 1 THEN -1
        ELSE profile.assigned_level_taichi - 1
      END
  ) THEN
    RAISE EXCEPTION 'Invalid T''ai Chi exam';
  END IF;

  UPDATE user_profiles
  SET
    plan_mode = 'exam',
    preparing_exam_id = p_exam_shaolin_id,
    preparing_exam_taichi_id = p_exam_taichi_id
  WHERE id = current_user_id;

  WITH expected_exam_items AS (
    SELECT
      current_user_id AS user_id,
      req.skill_id,
      req.default_status
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
     AND (
        (exam.id = p_exam_shaolin_id AND exam.discipline = 'shaolin')
        OR (exam.id = p_exam_taichi_id AND exam.discipline = 'taichi')
      )
    JOIN exam_skill_requirements req
      ON req.exam_id = exam.id
    JOIN skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = exam.school_id
     AND skill.discipline = exam.discipline
     AND skill.minimum_grade_value = exam.grade_value
    WHERE profile.id = current_user_id
  )
  DELETE FROM user_plan_items item
  WHERE item.user_id = current_user_id
    AND item.source = 'exam_program'
    AND NOT EXISTS (
      SELECT 1
      FROM expected_exam_items expected
      WHERE expected.user_id = item.user_id
        AND expected.skill_id = item.skill_id
    );

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    expected.user_id,
    expected.skill_id,
    expected.default_status,
    'exam_program'::plan_item_source,
    false
  FROM (
    SELECT
      current_user_id AS user_id,
      req.skill_id,
      req.default_status
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
     AND (
        (exam.id = p_exam_shaolin_id AND exam.discipline = 'shaolin')
        OR (exam.id = p_exam_taichi_id AND exam.discipline = 'taichi')
      )
    JOIN exam_skill_requirements req
      ON req.exam_id = exam.id
    JOIN skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = exam.school_id
     AND skill.discipline = exam.discipline
     AND skill.minimum_grade_value = exam.grade_value
    WHERE profile.id = current_user_id
  ) expected
  ON CONFLICT (user_id, skill_id, source, custom_program_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.switch_to_exam_mode()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  has_exam_selection BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT preparing_exam_id IS NOT NULL OR preparing_exam_taichi_id IS NOT NULL
  INTO has_exam_selection
  FROM user_profiles
  WHERE id = current_user_id;

  IF NOT COALESCE(has_exam_selection, false) THEN
    RAISE EXCEPTION 'Nessun piano esame da attivare';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM user_profiles profile
    WHERE profile.id = current_user_id
      AND profile.preparing_exam_id IS NOT NULL
  ) AND NOT EXISTS (
    SELECT 1
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
    WHERE profile.id = current_user_id
      AND exam.id = profile.preparing_exam_id
      AND exam.discipline = 'shaolin'
      AND exam.grade_from IS NOT NULL
      AND exam.grade_value >= CASE
        WHEN profile.assigned_level_shaolin = 1 THEN -1
        ELSE profile.assigned_level_shaolin - 1
      END
  ) THEN
    RAISE EXCEPTION 'Invalid Shaolin exam';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM user_profiles profile
    WHERE profile.id = current_user_id
      AND profile.preparing_exam_taichi_id IS NOT NULL
  ) AND NOT EXISTS (
    SELECT 1
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
    WHERE profile.id = current_user_id
      AND exam.id = profile.preparing_exam_taichi_id
      AND exam.discipline = 'taichi'
      AND profile.assigned_level_taichi <> 0
      AND exam.grade_from IS NOT NULL
      AND exam.grade_value >= CASE
        WHEN profile.assigned_level_taichi = 1 THEN -1
        ELSE profile.assigned_level_taichi - 1
      END
  ) THEN
    RAISE EXCEPTION 'Invalid T''ai Chi exam';
  END IF;

  UPDATE user_profiles
  SET plan_mode = 'exam'
  WHERE id = current_user_id;

  WITH expected_exam_items AS (
    SELECT
      profile.id AS user_id,
      req.skill_id,
      req.default_status
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
     AND (
        (exam.id = profile.preparing_exam_id AND exam.discipline = 'shaolin')
        OR (exam.id = profile.preparing_exam_taichi_id AND exam.discipline = 'taichi')
      )
    JOIN exam_skill_requirements req
      ON req.exam_id = exam.id
    JOIN skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = exam.school_id
     AND skill.discipline = exam.discipline
     AND skill.minimum_grade_value = exam.grade_value
    WHERE profile.id = current_user_id
  )
  DELETE FROM user_plan_items item
  WHERE item.user_id = current_user_id
    AND item.source = 'exam_program'
    AND NOT EXISTS (
      SELECT 1
      FROM expected_exam_items expected
      WHERE expected.user_id = item.user_id
        AND expected.skill_id = item.skill_id
    );

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    expected.user_id,
    expected.skill_id,
    expected.default_status,
    'exam_program'::plan_item_source,
    false
  FROM (
    SELECT
      profile.id AS user_id,
      req.skill_id,
      req.default_status
    FROM user_profiles profile
    JOIN exam_programs exam
      ON exam.school_id = profile.school_id
     AND (
        (exam.id = profile.preparing_exam_id AND exam.discipline = 'shaolin')
        OR (exam.id = profile.preparing_exam_taichi_id AND exam.discipline = 'taichi')
      )
    JOIN exam_skill_requirements req
      ON req.exam_id = exam.id
    JOIN skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = exam.school_id
     AND skill.discipline = exam.discipline
     AND skill.minimum_grade_value = exam.grade_value
    WHERE profile.id = current_user_id
  ) expected
  ON CONFLICT (user_id, skill_id, source, custom_program_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_exam_plan_items_for_discipline(
  p_user_id uuid,
  p_school_id uuid,
  p_discipline public.discipline,
  p_exam_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_plan_items item
  USING public.skills skill
  WHERE item.user_id = p_user_id
    AND item.source = 'exam_program'
    AND item.skill_id = skill.id
    AND skill.discipline = p_discipline;

  IF p_exam_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.exam_programs exam
    WHERE exam.id = p_exam_id
      AND exam.school_id = p_school_id
      AND exam.discipline = p_discipline
  ) THEN
    RAISE EXCEPTION 'exam % is not a % exam for school %',
      p_exam_id, p_discipline, p_school_id;
  END IF;

  INSERT INTO public.user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    p_user_id,
    req.skill_id,
    req.default_status,
    'exam_program'::public.plan_item_source,
    false
  FROM public.exam_programs exam
  JOIN public.exam_skill_requirements req ON req.exam_id = exam.id
  JOIN public.skills skill
    ON skill.id = req.skill_id
   AND skill.school_id = exam.school_id
   AND skill.discipline = exam.discipline
   AND skill.minimum_grade_value = exam.grade_value
  WHERE exam.id = p_exam_id
    AND exam.school_id = p_school_id
    AND exam.discipline = p_discipline
  ON CONFLICT (user_id, skill_id, source, custom_program_id) DO UPDATE
  SET
    status = EXCLUDED.status,
    is_hidden = false;
END;
$$;

COMMIT;
