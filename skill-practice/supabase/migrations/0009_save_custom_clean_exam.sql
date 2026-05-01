-- save_custom_selection must clear exam_program items + reset preparing exams
-- when switching plan_mode to custom, mirroring switch_to_custom_mode.
-- Without this fix, /today would show exam + manual items mixed together.

BEGIN;

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
  SET
    plan_mode = 'custom',
    preparing_exam_id = NULL,
    preparing_exam_taichi_id = NULL
  WHERE id = current_user_id;

  DELETE FROM user_plan_items
  WHERE user_id = current_user_id
    AND source = 'exam_program';

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

COMMIT;
