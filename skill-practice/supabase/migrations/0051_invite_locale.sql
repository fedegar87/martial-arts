-- Lingua iniziale assegnata insieme ai gradi; preferenza account condivisa con i promemoria.
-- Non modifica le preferenze degli utenti gia' presenti e non attiva notifiche.
BEGIN;

ALTER TABLE public.user_invites
  ADD COLUMN locale text NOT NULL DEFAULT 'it'
  CONSTRAINT user_invites_locale_check CHECK (locale IN ('it', 'fr'));

COMMENT ON COLUMN public.user_invites.locale IS
  'Initial account language assigned by the administrator before creating the Auth user.';

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

    INSERT INTO public.notification_preferences (user_id, locale)
    VALUES (NEW.id, inv.locale)
    ON CONFLICT (user_id) DO UPDATE SET locale = EXCLUDED.locale;

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

CREATE OR REPLACE FUNCTION public.bulk_upsert_user_invites(
  p_invites jsonb,
  p_school_id uuid DEFAULT NULL
)
RETURNS TABLE (
  email text,
  invite_id uuid,
  result_status text,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  target_school_id uuid;
  school_count int;
  item jsonb;
  normalized_email text;
  invite_display_name text;
  invite_locale text;
  lvl_shaolin int;
  lvl_taichi int;
  is_instructor boolean;
  invite_role public.user_role;
  is_all_access boolean;
  extra_access boolean;
  locked_profile boolean;
  scope public.content_access_mode;
  target_group_id uuid;
  group_code text;
BEGIN
  IF jsonb_typeof(p_invites) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'bulk_upsert_user_invites expects a JSON array';
  END IF;

  IF p_school_id IS NULL THEN
    SELECT count(*) INTO school_count FROM public.schools;

    IF school_count <> 1 THEN
      RAISE EXCEPTION 'p_school_id is required when there is not exactly one school, found %',
        school_count;
    END IF;

    SELECT id INTO target_school_id FROM public.schools LIMIT 1;
  ELSE
    target_school_id := p_school_id;

    IF NOT EXISTS (SELECT 1 FROM public.schools s WHERE s.id = target_school_id) THEN
      RAISE EXCEPTION 'school % does not exist', target_school_id;
    END IF;
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_invites)
  LOOP
    BEGIN
      normalized_email := lower(btrim(item->>'email'));
      IF normalized_email IS NULL OR normalized_email = '' THEN
        RAISE EXCEPTION 'email is required';
      END IF;

      invite_locale := COALESCE(item->>'locale', 'it');
      IF invite_locale NOT IN ('it', 'fr') THEN
        RAISE EXCEPTION 'invalid locale for %: %', normalized_email, invite_locale;
      END IF;

      invite_display_name := NULLIF(btrim(item->>'display_name'), '');
      lvl_shaolin := COALESCE(
        NULLIF(item->>'assigned_level_shaolin', '')::int,
        NULLIF(item->>'level_shaolin', '')::int,
        8
      );
      lvl_taichi := COALESCE(
        NULLIF(item->>'assigned_level_taichi', '')::int,
        NULLIF(item->>'level_taichi', '')::int,
        0
      );

      IF NOT public.is_valid_grade_value(lvl_shaolin) THEN
        RAISE EXCEPTION 'invalid assigned_level_shaolin for %: %',
          normalized_email, lvl_shaolin;
      END IF;

      IF NOT public.is_valid_grade_value(lvl_taichi) THEN
        RAISE EXCEPTION 'invalid assigned_level_taichi for %: %',
          normalized_email, lvl_taichi;
      END IF;

      is_instructor := COALESCE(NULLIF(item->>'instructor', '')::boolean, false);
      invite_role := COALESCE(
        NULLIF(item->>'role', '')::public.user_role,
        CASE WHEN is_instructor THEN 'instructor'::public.user_role ELSE 'student'::public.user_role END
      );
      is_all_access := COALESCE(
        NULLIF(item->>'all_access', '')::boolean,
        invite_role IN ('instructor'::public.user_role, 'admin'::public.user_role)
      );
      extra_access := COALESCE(
        NULLIF(item->>'can_view_extra_content', '')::boolean,
        is_all_access
      );
      locked_profile := COALESCE(
        NULLIF(item->>'profile_locked', '')::boolean,
        NOT is_all_access
      );
      scope := COALESCE(
        NULLIF(item->>'content_access_mode', '')::public.content_access_mode,
        CASE
          WHEN is_all_access THEN 'all_school_content'::public.content_access_mode
          ELSE 'up_to_assigned_level'::public.content_access_mode
        END
      );

      group_code := NULLIF(btrim(item->>'access_group_code'), '');
      IF group_code IS NULL THEN
        group_code := CASE
          WHEN is_all_access AND invite_role IN ('instructor'::public.user_role, 'admin'::public.user_role)
            THEN 'all_access_instructor'
          WHEN NOT is_all_access AND invite_role = 'student'::public.user_role
            THEN 'locked_student'
          ELSE NULL
        END;
      END IF;

      target_group_id := NULL;
      IF group_code IS NOT NULL THEN
        SELECT g.id INTO target_group_id
        FROM public.access_groups g
        WHERE g.school_id = target_school_id
          AND g.code = group_code
        LIMIT 1;
      END IF;

      invite_id := NULL;
      INSERT INTO public.user_invites (
        school_id, email, display_name, locale, access_group_id,
        assigned_level_shaolin, assigned_level_taichi,
        role, content_access_mode, can_view_extra_content, profile_locked,
        status, accepted_user_id, accepted_at
      )
      VALUES (
        target_school_id, normalized_email, invite_display_name, invite_locale, target_group_id,
        lvl_shaolin, lvl_taichi,
        invite_role, scope, extra_access, locked_profile,
        'pending', NULL, NULL
      )
      ON CONFLICT (school_id, email) DO UPDATE
      SET
        display_name = EXCLUDED.display_name,
        locale = EXCLUDED.locale,
        access_group_id = EXCLUDED.access_group_id,
        assigned_level_shaolin = EXCLUDED.assigned_level_shaolin,
        assigned_level_taichi = EXCLUDED.assigned_level_taichi,
        role = EXCLUDED.role,
        content_access_mode = EXCLUDED.content_access_mode,
        can_view_extra_content = EXCLUDED.can_view_extra_content,
        profile_locked = EXCLUDED.profile_locked,
        status = 'pending',
        accepted_user_id = NULL,
        accepted_at = NULL
      WHERE public.user_invites.status <> 'accepted'
      RETURNING public.user_invites.id INTO invite_id;

      email := normalized_email;
      IF invite_id IS NULL THEN
        result_status := 'skipped';
        message := 'invite already accepted';
      ELSE
        result_status := 'pending';
        message := 'ok';
      END IF;
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      email := COALESCE(normalized_email, item->>'email', '<missing>');
      invite_id := NULL;
      result_status := 'error';
      message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bulk_upsert_user_invites(jsonb, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_upsert_user_invites(jsonb, uuid)
TO service_role;


COMMIT;
