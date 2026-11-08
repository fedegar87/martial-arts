BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_user_profile_privilege_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND auth.uid() = OLD.id THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.school_id IS DISTINCT FROM OLD.school_id
       OR NEW.access_group_id IS DISTINCT FROM OLD.access_group_id
       OR NEW.profile_locked IS DISTINCT FROM OLD.profile_locked
       OR NEW.content_access_mode IS DISTINCT FROM OLD.content_access_mode
       OR NEW.can_view_extra_content IS DISTINCT FROM OLD.can_view_extra_content THEN
      RAISE EXCEPTION 'profile access is managed by administrators';
    END IF;

    IF OLD.profile_locked AND (
         NEW.assigned_level_shaolin IS DISTINCT FROM OLD.assigned_level_shaolin
      OR NEW.assigned_level_taichi IS DISTINCT FROM OLD.assigned_level_taichi
      OR NEW.preparing_exam_id IS DISTINCT FROM OLD.preparing_exam_id
      OR NEW.preparing_exam_taichi_id IS DISTINCT FROM OLD.preparing_exam_taichi_id
    ) THEN
      RAISE EXCEPTION 'profile is locked: levels and exam targets are managed by administrators';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
