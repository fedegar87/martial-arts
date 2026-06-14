-- FESK rollout - lock preassigned student profiles at the DB layer.
-- Extends prevent_user_profile_privilege_changes (0016): besides role/school_id, a
-- LOCKED owner cannot self-edit assigned levels or exam targets. Service-role and
-- admin paths (auth.uid() <> OLD.id, e.g. the promotion script) are exempt, so invite
-- provisioning and post-exam promotion keep working.
--
-- plan_mode is intentionally NOT locked here: the dangerous combined writes
-- (updateProfileGrade / selectExam / finishWithoutExam) all also change levels or
-- exam targets and are therefore already blocked, while the sanctioned mode-switch
-- RPCs (switch_to_exam_mode / switch_to_custom_mode) change only plan_mode and must
-- keep working. A locked student can toggle between their assigned exam and a custom
-- plan, but cannot change which exam or their grade. Content scope is enforced
-- separately by is_skill_visible (0040).
-- Apply via Supabase SQL Editor AFTER 0037/0038.

CREATE OR REPLACE FUNCTION public.prevent_user_profile_privilege_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND auth.uid() = OLD.id THEN
    -- role and school_id are always administrator-managed
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.school_id IS DISTINCT FROM OLD.school_id THEN
      RAISE EXCEPTION 'role and school_id are managed by administrators';
    END IF;

    -- locked profiles: assigned levels and exam targets are administrator-managed
    IF OLD.profile_locked AND (
         NEW.assigned_level_shaolin   IS DISTINCT FROM OLD.assigned_level_shaolin
      OR NEW.assigned_level_taichi    IS DISTINCT FROM OLD.assigned_level_taichi
      OR NEW.preparing_exam_id        IS DISTINCT FROM OLD.preparing_exam_id
      OR NEW.preparing_exam_taichi_id IS DISTINCT FROM OLD.preparing_exam_taichi_id
    ) THEN
      RAISE EXCEPTION 'profile is locked: levels and exam targets are managed by administrators';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
