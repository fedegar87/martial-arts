-- FESK rollout - post-exam promotion.
-- promotion_audit logs each promotion; promote_user_after_exam(user, discipline)
-- advances ONE discipline: sets the passed grade as the new assigned level, points the
-- preparing exam at the next grade, repoints the access group (if a next-group is set),
-- and regenerates that discipline's exam plan items. The other discipline and all
-- practice history are untouched. SECURITY DEFINER + service-role only (the script
-- calls it; auth.uid() is null so the profile lock trigger does not apply).
-- Apply via Supabase SQL Editor AFTER 0037-0040.

BEGIN;

CREATE TABLE IF NOT EXISTS promotion_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline    discipline NOT NULL,
  from_level    int,
  to_level      int,
  from_exam_id  uuid,
  to_exam_id    uuid,
  note          text,
  performed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promotion_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promotion_audit_admin_select" ON promotion_audit;
CREATE POLICY "promotion_audit_admin_select" ON promotion_audit
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.promote_user_after_exam(
  p_user_id uuid,
  p_discipline discipline
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof          public.user_profiles%ROWTYPE;
  passed_exam   uuid;
  old_level     int;
  passed_grade  int;
  next_grade    int;
  new_exam_id   uuid;
  next_group    uuid;
BEGIN
  SELECT * INTO prof FROM public.user_profiles WHERE id = p_user_id;
  IF prof.id IS NULL THEN
    RAISE EXCEPTION 'promote: utente % inesistente', p_user_id;
  END IF;

  IF p_discipline = 'shaolin' THEN
    passed_exam := prof.preparing_exam_id;
    old_level   := prof.assigned_level_shaolin;
  ELSE
    passed_exam := prof.preparing_exam_taichi_id;
    old_level   := prof.assigned_level_taichi;
  END IF;

  IF passed_exam IS NULL THEN
    RAISE EXCEPTION 'promote: nessun esame in preparazione per % (%)', p_user_id, p_discipline;
  END IF;

  SELECT grade_value INTO passed_grade FROM public.exam_programs WHERE id = passed_exam;

  -- next grade after the achieved one (ladder skips 0; stops at -7)
  next_grade := CASE WHEN passed_grade = 1 THEN -1 ELSE passed_grade - 1 END;
  IF next_grade < -7 THEN next_grade := NULL; END IF;

  IF next_grade IS NOT NULL THEN
    SELECT id INTO new_exam_id
    FROM public.exam_programs
    WHERE school_id = prof.school_id
      AND discipline = p_discipline
      AND grade_value = next_grade
      AND grade_from IS NOT NULL;
  END IF;

  IF prof.access_group_id IS NOT NULL THEN
    IF p_discipline = 'shaolin' THEN
      SELECT next_shaolin_access_group_id INTO next_group
      FROM public.access_groups WHERE id = prof.access_group_id;
    ELSE
      SELECT next_taichi_access_group_id INTO next_group
      FROM public.access_groups WHERE id = prof.access_group_id;
    END IF;
  END IF;

  IF p_discipline = 'shaolin' THEN
    UPDATE public.user_profiles
    SET assigned_level_shaolin = passed_grade,
        preparing_exam_id = new_exam_id,
        access_group_id = COALESCE(next_group, access_group_id)
    WHERE id = p_user_id;
  ELSE
    UPDATE public.user_profiles
    SET assigned_level_taichi = passed_grade,
        preparing_exam_taichi_id = new_exam_id,
        access_group_id = COALESCE(next_group, access_group_id)
    WHERE id = p_user_id;
  END IF;

  -- Regenerate ONLY this discipline's exam plan items; manual items and the other
  -- discipline are left untouched, practice history is preserved.
  DELETE FROM public.user_plan_items item
  USING public.skills skill
  WHERE item.user_id = p_user_id
    AND item.source = 'exam_program'
    AND item.skill_id = skill.id
    AND skill.discipline = p_discipline;

  IF new_exam_id IS NOT NULL THEN
    INSERT INTO public.user_plan_items (user_id, skill_id, status, source, is_hidden)
    SELECT p_user_id, req.skill_id, req.default_status, 'exam_program'::plan_item_source, false
    FROM public.exam_skill_requirements req
    JOIN public.skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = prof.school_id
     AND skill.discipline = p_discipline
     AND skill.minimum_grade_value = next_grade
    WHERE req.exam_id = new_exam_id
    ON CONFLICT (user_id, skill_id, source) DO NOTHING;
  END IF;

  INSERT INTO public.promotion_audit
    (user_id, discipline, from_level, to_level, from_exam_id, to_exam_id, note)
  VALUES
    (p_user_id, p_discipline, old_level, passed_grade, passed_exam, new_exam_id, 'promote_user_after_exam');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, discipline) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, discipline) TO service_role;

COMMIT;
