-- Fix-forward: handle_new_user cast 'exam'/'custom' a public.plan_mode, ma plan_mode
-- NON e' un enum: e' una colonna TEXT con CHECK (vedi 0005_plan_mode.sql:5-7). Il cast
-- falliva con 'type "public.plan_mode" does not exist' (SQLSTATE 42704), per cui ogni
-- signup dava "Database error creating new user" (bug presente dalla 0038, mai eseguita
-- con successo). Le RPC esistenti assegnano plan_mode = 'exam' senza cast: si fa uguale.
-- Corpo identico alla 0042 tranne il CASE su plan_mode (niente ::plan_mode).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email text := lower(btrim(NEW.email));
  inv public.user_invites%ROWTYPE;
  pending_invite_count int;
  exam_shaolin uuid;
  exam_taichi uuid;
  profile_count int;
  school_count int;
  bootstrap_school uuid;
  bootstrap_group uuid;
BEGIN
  SELECT count(*) INTO pending_invite_count
  FROM public.user_invites
  WHERE lower(btrim(email)) = normalized_email
    AND status = 'pending';

  IF pending_invite_count > 1 THEN
    RAISE EXCEPTION 'handle_new_user: multiple pending invites for %', normalized_email;
  END IF;

  SELECT * INTO inv
  FROM public.user_invites
  WHERE lower(btrim(email)) = normalized_email
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF inv.id IS NOT NULL THEN
    exam_shaolin := public.next_exam_program_id(inv.school_id, 'shaolin', inv.assigned_level_shaolin);
    exam_taichi := public.next_exam_program_id(inv.school_id, 'taichi', inv.assigned_level_taichi);

    INSERT INTO public.user_profiles (
      id, school_id, display_name, role,
      assigned_level_shaolin, assigned_level_taichi,
      preparing_exam_id, preparing_exam_taichi_id,
      plan_mode, profile_locked, access_group_id,
      content_access_mode, can_view_extra_content
    )
    VALUES (
      NEW.id,
      inv.school_id,
      COALESCE(inv.display_name, NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      inv.role,
      inv.assigned_level_shaolin,
      inv.assigned_level_taichi,
      exam_shaolin,
      exam_taichi,
      CASE
        WHEN exam_shaolin IS NOT NULL OR exam_taichi IS NOT NULL
        THEN 'exam'
        ELSE 'custom'
      END,
      inv.profile_locked,
      inv.access_group_id,
      inv.content_access_mode,
      inv.can_view_extra_content
    );

    PERFORM public.refresh_exam_plan_items_for_discipline(
      NEW.id, inv.school_id, 'shaolin', exam_shaolin
    );
    PERFORM public.refresh_exam_plan_items_for_discipline(
      NEW.id, inv.school_id, 'taichi', exam_taichi
    );

    UPDATE public.user_invites
    SET status = 'accepted',
        accepted_user_id = NEW.id,
        accepted_at = now()
    WHERE id = inv.id;

    RETURN NEW;
  END IF;

  -- Fresh-instance bootstrap only. Existing projects still require an invite.
  SELECT count(*) INTO profile_count FROM public.user_profiles;
  IF profile_count = 0 THEN
    SELECT count(*) INTO school_count FROM public.schools;
    IF school_count <> 1 THEN
      RAISE EXCEPTION 'handle_new_user: bootstrap requires exactly one school, found %', school_count;
    END IF;

    SELECT id INTO bootstrap_school FROM public.schools LIMIT 1;
    SELECT id INTO bootstrap_group
    FROM public.access_groups
    WHERE school_id = bootstrap_school
      AND code = 'all_access_instructor'
    LIMIT 1;

    INSERT INTO public.user_profiles (
      id, school_id, display_name, role,
      assigned_level_shaolin, assigned_level_taichi,
      plan_mode, profile_locked, access_group_id,
      content_access_mode, can_view_extra_content
    )
    VALUES (
      NEW.id,
      bootstrap_school,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      'admin',
      8, 0,
      'custom', false, bootstrap_group,
      'all_school_content', true
    );

    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'handle_new_user: no pending invite for % - provisioning blocked', normalized_email;
END;
$$;
