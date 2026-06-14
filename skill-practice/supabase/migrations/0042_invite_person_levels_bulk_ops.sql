-- FESK rollout - per-person invite levels and bulk SQL Editor operations.
--
-- 0037-0041 introduced access_groups as templates. This migration moves the
-- variable state (per-discipline levels) onto user_invites, keeps access_groups
-- optional for coarse presets/reporting, derives preparing exams from levels, and
-- adds JSONB bulk helpers for SQL Editor usage.

BEGIN;

-- ============================================================
-- 1. Canonical grade helpers
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_valid_grade_value(p_grade int)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT p_grade IS NOT NULL
     AND (
       p_grade = 0
       OR p_grade BETWEEN 1 AND 8
       OR p_grade BETWEEN -7 AND -1
     );
$$;

CREATE OR REPLACE FUNCTION public.next_grade_value(p_grade int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_grade IS NULL OR p_grade = 0 OR p_grade = -7 THEN
    RETURN NULL;
  END IF;

  IF NOT public.is_valid_grade_value(p_grade) THEN
    RAISE EXCEPTION 'invalid grade value: %', p_grade;
  END IF;

  IF p_grade = 1 THEN
    RETURN -1;
  END IF;

  RETURN p_grade - 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_exam_program_id(
  p_school_id uuid,
  p_discipline public.discipline,
  p_current_level int
)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT e.id
  FROM public.exam_programs e
  WHERE e.school_id = p_school_id
    AND e.discipline = p_discipline
    AND e.grade_value = public.next_grade_value(p_current_level)
    AND e.grade_from IS NOT NULL
  LIMIT 1;
$$;

-- ============================================================
-- 2. user_invites becomes the per-person preassignment row
-- ============================================================

ALTER TABLE public.user_invites
  ALTER COLUMN access_group_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS assigned_level_shaolin int NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS assigned_level_taichi int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS content_access_mode public.content_access_mode NOT NULL DEFAULT 'up_to_assigned_level',
  ADD COLUMN IF NOT EXISTS can_view_extra_content boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_locked boolean NOT NULL DEFAULT true;

-- Preserve any pending preassignments that were already expressed through a group.
UPDATE public.user_invites inv
SET
  assigned_level_shaolin = grp.default_level_shaolin,
  assigned_level_taichi = grp.default_level_taichi,
  role = grp.role,
  content_access_mode = grp.content_access_mode,
  can_view_extra_content = grp.can_view_extra_content,
  profile_locked = NOT grp.can_edit_own_profile
FROM public.access_groups grp
WHERE inv.access_group_id = grp.id
  AND inv.status = 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_invites_assigned_level_shaolin_valid'
  ) THEN
    ALTER TABLE public.user_invites
      ADD CONSTRAINT user_invites_assigned_level_shaolin_valid
      CHECK (public.is_valid_grade_value(assigned_level_shaolin)) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_invites_assigned_level_taichi_valid'
  ) THEN
    ALTER TABLE public.user_invites
      ADD CONSTRAINT user_invites_assigned_level_taichi_valid
      CHECK (public.is_valid_grade_value(assigned_level_taichi)) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_assigned_level_shaolin_valid'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_assigned_level_shaolin_valid
      CHECK (public.is_valid_grade_value(assigned_level_shaolin)) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_assigned_level_taichi_valid'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_assigned_level_taichi_valid
      CHECK (public.is_valid_grade_value(assigned_level_taichi)) NOT VALID;
  END IF;
END $$;

-- Coarse presets only. Levels on these rows are legacy/default display values;
-- provisioning no longer reads them.
INSERT INTO public.access_groups (
  school_id, code, role,
  default_level_shaolin, default_level_taichi,
  content_access_mode, can_view_extra_content, can_edit_own_profile
)
SELECT
  s.id, 'locked_student', 'student',
  8, 0,
  'up_to_assigned_level', false, false
FROM public.schools s
WHERE NOT EXISTS (
  SELECT 1
  FROM public.access_groups g
  WHERE g.school_id = s.id AND g.code = 'locked_student'
);

-- ============================================================
-- 3. Shared plan regeneration helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.refresh_exam_plan_items_for_discipline(
  p_user_id uuid,
  p_school_id uuid,
  p_discipline public.discipline,
  p_exam_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_plan_items item
  USING public.skills skill
  WHERE item.user_id = p_user_id
    AND item.source = 'exam_program'
    AND item.skill_id = skill.id
    AND skill.discipline = p_discipline;

  IF p_exam_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.exam_programs exam
    WHERE exam.id = p_exam_id
      AND exam.school_id = p_school_id
      AND exam.discipline = p_discipline
  ) THEN
    RAISE EXCEPTION 'exam % is not a % exam for school %',
      p_exam_id, p_discipline, p_school_id;
  END IF;

  INSERT INTO public.user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    p_user_id,
    req.skill_id,
    req.default_status,
    'exam_program'::public.plan_item_source,
    false
  FROM public.exam_programs exam
  JOIN public.exam_skill_requirements req ON req.exam_id = exam.id
  JOIN public.skills skill
    ON skill.id = req.skill_id
   AND skill.school_id = exam.school_id
   AND skill.discipline = exam.discipline
   AND skill.minimum_grade_value = exam.grade_value
  WHERE exam.id = p_exam_id
    AND exam.school_id = p_school_id
    AND exam.discipline = p_discipline
  ON CONFLICT (user_id, skill_id, source) DO UPDATE
  SET
    status = EXCLUDED.status,
    is_hidden = false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_exam_plan_items_for_discipline(uuid, uuid, public.discipline, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_exam_plan_items_for_discipline(uuid, uuid, public.discipline, uuid)
TO service_role;

-- ============================================================
-- 4. Provision new auth users from invite row, not from access_group levels
-- ============================================================

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
        THEN 'exam'::public.plan_mode
        ELSE 'custom'::public.plan_mode
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

-- ============================================================
-- 5. SQL Editor bulk invite helper
-- ============================================================

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
    SELECT count(*), min(id) INTO school_count, target_school_id
    FROM public.schools;

    IF school_count <> 1 THEN
      RAISE EXCEPTION 'p_school_id is required when there is not exactly one school, found %',
        school_count;
    END IF;
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

-- ============================================================
-- 6. Promotion no longer moves access groups
-- ============================================================

CREATE OR REPLACE FUNCTION public.promote_user_after_exam(
  p_user_id uuid,
  p_discipline public.discipline
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof public.user_profiles%ROWTYPE;
  passed_exam uuid;
  old_level int;
  passed_grade int;
  new_exam_id uuid;
BEGIN
  SELECT * INTO prof FROM public.user_profiles WHERE id = p_user_id;
  IF prof.id IS NULL THEN
    RAISE EXCEPTION 'promote: user % does not exist', p_user_id;
  END IF;

  IF p_discipline = 'shaolin' THEN
    passed_exam := prof.preparing_exam_id;
    old_level := prof.assigned_level_shaolin;
  ELSE
    passed_exam := prof.preparing_exam_taichi_id;
    old_level := prof.assigned_level_taichi;
  END IF;

  IF passed_exam IS NULL THEN
    RAISE EXCEPTION 'promote: no preparing exam for user % (%)', p_user_id, p_discipline;
  END IF;

  SELECT exam.grade_value INTO passed_grade
  FROM public.exam_programs exam
  WHERE exam.id = passed_exam
    AND exam.school_id = prof.school_id
    AND exam.discipline = p_discipline;

  IF passed_grade IS NULL THEN
    RAISE EXCEPTION 'promote: exam % is not a % exam for user %',
      passed_exam, p_discipline, p_user_id;
  END IF;

  new_exam_id := public.next_exam_program_id(prof.school_id, p_discipline, passed_grade);

  IF p_discipline = 'shaolin' THEN
    UPDATE public.user_profiles
    SET assigned_level_shaolin = passed_grade,
        preparing_exam_id = new_exam_id
    WHERE id = p_user_id;
  ELSE
    UPDATE public.user_profiles
    SET assigned_level_taichi = passed_grade,
        preparing_exam_taichi_id = new_exam_id
    WHERE id = p_user_id;
  END IF;

  PERFORM public.refresh_exam_plan_items_for_discipline(
    p_user_id, prof.school_id, p_discipline, new_exam_id
  );

  INSERT INTO public.promotion_audit
    (user_id, discipline, from_level, to_level, from_exam_id, to_exam_id, note)
  VALUES
    (p_user_id, p_discipline, old_level, passed_grade, passed_exam, new_exam_id,
     'promote_user_after_exam');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, public.discipline)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, public.discipline)
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
