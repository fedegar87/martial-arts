-- Fix-forward: bulk_upsert_user_invites used min(id) on a uuid column to resolve the
-- single school, but min(uuid) does not exist in Postgres -> runtime error
-- "function min(uuid) does not exist". Replace that resolution with count + LIMIT 1.
-- Body identical to 0042 except the p_school_id IS NULL branch.

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

COMMIT;
