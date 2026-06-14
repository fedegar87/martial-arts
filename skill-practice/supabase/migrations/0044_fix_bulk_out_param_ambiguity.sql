-- Fix-forward: the bulk helpers declare RETURNS TABLE OUT params named like real
-- columns (email, discipline). Inside the INSERT column list / ON CONFLICT target the
-- bare name is ambiguous -> runtime error 'column reference "email" is ambiguous'.
-- Those positions cannot be table-qualified, so resolve the conflict in favour of the
-- column with '#variable_conflict use_column' (assignments and RETURN NEXT still use
-- the OUT variables). Bodies identical to 0042/0043 except that directive.

BEGIN;

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
        school_id, email, display_name, access_group_id,
        assigned_level_shaolin, assigned_level_taichi,
        role, content_access_mode, can_view_extra_content, profile_locked,
        status, accepted_user_id, accepted_at
      )
      VALUES (
        target_school_id, normalized_email, invite_display_name, target_group_id,
        lvl_shaolin, lvl_taichi,
        invite_role, scope, extra_access, locked_profile,
        'pending', NULL, NULL
      )
      ON CONFLICT (school_id, email) DO UPDATE
      SET
        display_name = EXCLUDED.display_name,
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

CREATE OR REPLACE FUNCTION public.bulk_promote_users_after_exam(p_promotions jsonb)
RETURNS TABLE (
  email text,
  user_id uuid,
  discipline public.discipline,
  promoted boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  item jsonb;
  normalized_email text;
  target_user_id uuid;
  passed_shaolin boolean;
  passed_taichi boolean;
  target_discipline public.discipline;
BEGIN
  IF jsonb_typeof(p_promotions) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'bulk_promote_users_after_exam expects a JSON array';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_promotions)
  LOOP
    BEGIN
      normalized_email := lower(btrim(item->>'email'));
      passed_shaolin := COALESCE(
        NULLIF(item->>'shaolin', '')::boolean,
        NULLIF(item->>'passed_shaolin', '')::boolean,
        false
      );
      passed_taichi := COALESCE(
        NULLIF(item->>'taichi', '')::boolean,
        NULLIF(item->>'passed_taichi', '')::boolean,
        false
      );

      IF normalized_email IS NULL OR normalized_email = '' THEN
        email := COALESCE(item->>'email', '<missing>');
        user_id := NULL;
        discipline := NULL;
        promoted := false;
        message := 'email is required';
        RETURN NEXT;
        CONTINUE;
      END IF;

      SELECT u.id INTO target_user_id
      FROM auth.users u
      WHERE lower(btrim(u.email)) = normalized_email
      LIMIT 1;

      IF target_user_id IS NULL THEN
        email := normalized_email;
        user_id := NULL;
        discipline := NULL;
        promoted := false;
        message := 'auth user not found';
        RETURN NEXT;
        CONTINUE;
      END IF;

      IF NOT passed_shaolin AND NOT passed_taichi THEN
        email := normalized_email;
        user_id := target_user_id;
        discipline := NULL;
        promoted := false;
        message := 'no passed discipline selected';
        RETURN NEXT;
        CONTINUE;
      END IF;

      FOR target_discipline IN
        SELECT v.discipline
        FROM (VALUES
          ('shaolin'::public.discipline, passed_shaolin),
          ('taichi'::public.discipline, passed_taichi)
        ) AS v(discipline, should_promote)
        WHERE v.should_promote
      LOOP
        BEGIN
          PERFORM public.promote_user_after_exam(target_user_id, target_discipline);

          email := normalized_email;
          user_id := target_user_id;
          discipline := target_discipline;
          promoted := true;
          message := 'ok';
          RETURN NEXT;
        EXCEPTION WHEN OTHERS THEN
          email := normalized_email;
          user_id := target_user_id;
          discipline := target_discipline;
          promoted := false;
          message := SQLERRM;
          RETURN NEXT;
        END;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      email := COALESCE(normalized_email, item->>'email', '<missing>');
      user_id := NULL;
      discipline := NULL;
      promoted := false;
      message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bulk_promote_users_after_exam(jsonb)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_promote_users_after_exam(jsonb)
TO service_role;

COMMIT;
