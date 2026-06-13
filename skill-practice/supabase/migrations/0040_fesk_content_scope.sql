-- FESK rollout - content visibility enforcement at the database layer.
-- Adds is_skill_in_scope() and wires it into skills_read RLS, the write-path
-- WITH CHECKs (user_plan_items, practice_logs) and save_custom_selection, so
-- per-discipline grade scope plus the all-access / Altro rules hold server-side,
-- not just in the UI. Apply via Supabase SQL Editor AFTER 0037-0039.
--
-- Scope rule (non all-access): a skill is in scope when it is the user's school AND
--   (not Altro OR can_view_extra_content) AND
--   (minimum_grade_value >= the user's assigned level for that discipline
--    OR the skill belongs to one of the user's preparing exams).
-- T'ai Chi level 0 = not practiced -> no T'ai Chi in scope.
-- all_school_content short-circuits to true (founder/admin, masters, instructors).

BEGIN;

CREATE OR REPLACE FUNCTION public.is_skill_in_scope(p_uid uuid, p_skill_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.skills s
    JOIN public.user_profiles p ON p.id = p_uid
    WHERE s.id = p_skill_id
      AND s.school_id = p.school_id
      AND (
        p.content_access_mode = 'all_school_content'
        OR (
          (NOT s.is_extra OR p.can_view_extra_content)
          AND (
            (s.discipline = 'shaolin'
              AND s.minimum_grade_value >= p.assigned_level_shaolin)
            OR (s.discipline = 'taichi'
              AND p.assigned_level_taichi <> 0
              AND s.minimum_grade_value >= p.assigned_level_taichi)
            OR EXISTS (
              SELECT 1 FROM public.exam_skill_requirements r
              WHERE r.skill_id = s.id
                AND r.exam_id IN (p.preparing_exam_id, p.preparing_exam_taichi_id)
            )
          )
        )
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_skill_in_scope(uuid, uuid) TO authenticated;

-- skills_read: in scope, OR already in the caller's plan so existing plan/exam joins
-- never break. The in-plan branch is read-only; the write-path WITH CHECKs below use
-- is_skill_in_scope WITHOUT it, so it cannot be exploited to add out-of-scope skills.
DROP POLICY IF EXISTS "skills_read" ON skills;
CREATE POLICY "skills_read" ON skills
  FOR SELECT TO authenticated
  USING (
    public.is_skill_in_scope((SELECT auth.uid()), skills.id)
    OR EXISTS (
      SELECT 1 FROM public.user_plan_items i
      WHERE i.user_id = (SELECT auth.uid())
        AND i.skill_id = skills.id
    )
  );

-- Write paths: a skill can be attached to a plan / logged only if it is in scope.
DROP POLICY IF EXISTS "user_plan_items_owner" ON user_plan_items;
CREATE POLICY "user_plan_items_owner" ON user_plan_items
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_skill_in_scope((SELECT auth.uid()), user_plan_items.skill_id)
  );

DROP POLICY IF EXISTS "practice_logs_owner" ON practice_logs;
CREATE POLICY "practice_logs_owner" ON practice_logs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_skill_in_scope((SELECT auth.uid()), practice_logs.skill_id)
  );

-- save_custom_selection bypasses RLS (SECURITY DEFINER), so it must filter in-scope
-- skills itself. Body identical to 0028 plus the is_skill_in_scope predicate.
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
    AND public.is_skill_in_scope(current_user_id, skill.id)
  ON CONFLICT (user_id, skill_id, source) DO NOTHING;
END;
$$;

COMMIT;
