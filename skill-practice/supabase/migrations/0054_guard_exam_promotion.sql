-- Pin the passed exam and serialize concurrent updates. Preserve the 0042
-- next-exam/plan helpers; stale retries must never promote the next exam.
BEGIN;

CREATE OR REPLACE FUNCTION public.promote_user_after_exam(
  p_user_id uuid,
  p_discipline public.discipline,
  p_expected_exam_id uuid
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
  SELECT * INTO prof FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
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

  IF p_expected_exam_id IS NULL OR passed_exam IS DISTINCT FROM p_expected_exam_id THEN
    RAISE EXCEPTION 'promote: expected exam does not match current exam; no changes made';
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
      passed_shaolin := COALESCE(item->>'shaolin', item->>'passed_shaolin', 'false') NOT IN ('false', '');
      passed_taichi := COALESCE(item->>'taichi', item->>'passed_taichi', 'false') NOT IN ('false', '');

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
          PERFORM public.promote_user_after_exam(
            target_user_id, target_discipline,
            COALESCE(
              NULLIF(item->>('expected_' || target_discipline::text || '_exam_id'), ''),
              NULLIF(NULLIF(item->>target_discipline::text, 'true'), 'false')
            )::uuid
          );

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

DROP FUNCTION public.promote_user_after_exam(uuid, public.discipline);
REVOKE EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, public.discipline, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_after_exam(uuid, public.discipline, uuid) TO service_role;

COMMIT;
