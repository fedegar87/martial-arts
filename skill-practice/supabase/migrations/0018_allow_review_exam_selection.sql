-- Allinea le RPC alla nuova logica client: l'utente può preparare il prossimo
-- esame oppure rivedere uno già fatto (ripasso). La validazione di grado
-- diventa `>=` rispetto al limite minimo (next grade del profilo) e accetta
-- solo esami con grade_from valorizzato (esclude lo starter Shaolin 8° Chi).

BEGIN;

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
  ON CONFLICT (user_id, skill_id, source) DO NOTHING;
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
  ON CONFLICT (user_id, skill_id, source) DO NOTHING;
END;
$$;

COMMIT;
