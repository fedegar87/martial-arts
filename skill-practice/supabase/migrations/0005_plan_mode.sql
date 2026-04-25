-- Sprint 1.7 — explicit plan mode and atomic plan mutations.

BEGIN;

ALTER TABLE user_profiles
  ADD COLUMN plan_mode TEXT NOT NULL DEFAULT 'exam'
  CHECK (plan_mode IN ('exam', 'custom')),
  ADD COLUMN preparing_exam_taichi_id UUID
  REFERENCES exam_programs(id) ON DELETE SET NULL;

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

  DELETE FROM user_plan_items WHERE user_id = current_user_id;

  UPDATE user_profiles
  SET
    plan_mode = 'exam',
    preparing_exam_id = p_exam_shaolin_id,
    preparing_exam_taichi_id = p_exam_taichi_id
  WHERE id = current_user_id;

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    current_user_id,
    req.skill_id,
    req.default_status,
    'exam_program'::plan_item_source,
    false
  FROM exam_skill_requirements req
  WHERE req.exam_id IN (
    SELECT id FROM exam_programs
    WHERE id IN (p_exam_shaolin_id, p_exam_taichi_id)
  )
  ON CONFLICT (user_id, skill_id) DO UPDATE
  SET
    status = EXCLUDED.status,
    source = EXCLUDED.source,
    is_hidden = false;
END;
$$;

CREATE OR REPLACE FUNCTION public.switch_to_custom_mode()
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

  DELETE FROM user_plan_items
  WHERE user_id = current_user_id
    AND source = 'exam_program';

  UPDATE user_profiles
  SET
    plan_mode = 'custom',
    preparing_exam_id = NULL,
    preparing_exam_taichi_id = NULL
  WHERE id = current_user_id;
END;
$$;

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
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE user_profiles
  SET plan_mode = 'custom'
  WHERE id = current_user_id;

  DELETE FROM user_plan_items item
  USING skills skill
  WHERE item.user_id = current_user_id
    AND item.skill_id = skill.id
    AND item.source = 'manual'
    AND skill.discipline = p_discipline
    AND NOT (item.skill_id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[])));

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    current_user_id,
    skill.id,
    'review'::plan_status,
    'manual'::plan_item_source,
    false
  FROM skills skill
  WHERE skill.id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[]))
    AND skill.discipline = p_discipline
  ON CONFLICT (user_id, skill_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_plan_item_status(
  p_skill_id UUID,
  p_status plan_status
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

  UPDATE user_plan_items
  SET status = p_status, is_hidden = false
  WHERE user_id = current_user_id
    AND skill_id = p_skill_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.hide_plan_item(p_skill_id UUID)
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

  UPDATE user_plan_items
  SET is_hidden = true
  WHERE user_id = current_user_id
    AND skill_id = p_skill_id;
END;
$$;

COMMIT;
