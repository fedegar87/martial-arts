-- FESK rollout - provision profiles from invite preassignment (replaces 0036 body).
-- On signup:
--   * normalize email (lower/trim) and find a matching PENDING user_invites row;
--   * copy school / role / levels / exam targets / scope / lock from the invite's
--     access_group (NOT from client metadata);
--   * mark the invite accepted and store accepted_user_id;
--   * BLOCK (raise) when no pending invite matches (errata 3), except the first-ever
--     signup on a fresh instance, which bootstraps an all-access admin (errata 1/2).
-- Existing users are unaffected: this trigger only fires on new auth.users INSERTs.
-- Apply via Supabase SQL Editor AFTER 0037. Operational rule: insert the user_invites
-- row BEFORE sending the Supabase invitation (inviteUserByEmail / dashboard).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT := lower(trim(NEW.email));
  inv              public.user_invites%ROWTYPE;
  grp              public.access_groups%ROWTYPE;
  profile_count    INT;
  school_count     INT;
  bootstrap_school UUID;
BEGIN
  SELECT * INTO inv
  FROM public.user_invites
  WHERE lower(trim(email)) = normalized_email
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF inv.id IS NOT NULL THEN
    SELECT * INTO grp FROM public.access_groups WHERE id = inv.access_group_id;
    IF grp.id IS NULL THEN
      RAISE EXCEPTION 'handle_new_user: invito % senza access_group valido', inv.id;
    END IF;

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
      COALESCE(inv.display_name, NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      grp.role,
      grp.default_level_shaolin,
      grp.default_level_taichi,
      grp.default_preparing_exam_id,
      grp.default_preparing_exam_taichi_id,
      CASE
        WHEN grp.default_preparing_exam_id IS NOT NULL
          OR grp.default_preparing_exam_taichi_id IS NOT NULL
        THEN 'exam'::plan_mode
        ELSE 'custom'::plan_mode
      END,
      NOT grp.can_edit_own_profile,
      grp.id,
      grp.content_access_mode,
      grp.can_view_extra_content
    );

    -- Seed exam plan items so a locked exam-mode student lands on a ready plan
    -- without going through onboarding. Mirrors activate_exam_mode's INSERT, keyed
    -- to NEW.id (the RPC uses auth.uid(), unavailable in this trigger context).
    -- No rows when neither exam is set.
    INSERT INTO public.user_plan_items (user_id, skill_id, status, source, is_hidden)
    SELECT NEW.id, req.skill_id, req.default_status, 'exam_program'::plan_item_source, false
    FROM public.exam_programs exam
    JOIN public.exam_skill_requirements req ON req.exam_id = exam.id
    JOIN public.skills skill
      ON skill.id = req.skill_id
     AND skill.school_id = exam.school_id
     AND skill.discipline = exam.discipline
     AND skill.minimum_grade_value = exam.grade_value
    WHERE exam.school_id = inv.school_id
      AND (
        (exam.id = grp.default_preparing_exam_id AND exam.discipline = 'shaolin')
        OR (exam.id = grp.default_preparing_exam_taichi_id AND exam.discipline = 'taichi')
      )
    ON CONFLICT (user_id, skill_id, source) DO NOTHING;

    UPDATE public.user_invites
    SET status = 'accepted', accepted_user_id = NEW.id, accepted_at = now()
    WHERE id = inv.id;

    RETURN NEW;
  END IF;

  -- No pending invite. Admin bootstrap only when no profiles exist yet (fresh instance).
  SELECT count(*) INTO profile_count FROM public.user_profiles;
  IF profile_count = 0 THEN
    SELECT count(*) INTO school_count FROM public.schools;
    IF school_count <> 1 THEN
      RAISE EXCEPTION 'handle_new_user: bootstrap richiede esattamente una scuola, trovate %', school_count;
    END IF;
    SELECT id INTO bootstrap_school FROM public.schools LIMIT 1;

    INSERT INTO public.user_profiles (
      id, school_id, display_name, role,
      assigned_level_shaolin, assigned_level_taichi,
      plan_mode, profile_locked,
      content_access_mode, can_view_extra_content
    )
    VALUES (
      NEW.id,
      bootstrap_school,
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      'admin',
      8, 0,
      'custom', false,
      'all_school_content', true
    );
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'handle_new_user: nessun invito pending per % - provisioning bloccato', normalized_email;
END;
$$;
