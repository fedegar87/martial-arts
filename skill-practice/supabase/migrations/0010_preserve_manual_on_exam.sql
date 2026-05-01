-- activate_exam_mode must preserve manual items so the user's custom selection
-- survives across mode switches. Only exam_program items get rewritten.
-- /today is filtered by plan_mode at the query level (manual items in DB are
-- not surfaced when plan_mode='exam', and vice versa).

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

  DELETE FROM user_plan_items
  WHERE user_id = current_user_id
    AND source = 'exam_program';

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

COMMIT;
