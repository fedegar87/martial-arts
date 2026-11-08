\set ON_ERROR_STOP on
BEGIN;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON auth.users TO service_role;

CREATE FUNCTION pg_temp.assert_true(value boolean, message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF value IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', message; END IF;
  RAISE NOTICE 'PASS: %', message;
END;
$$;

-- Provision via the real 0051 trigger and the per-person invite RPC.
SELECT * FROM public.bulk_upsert_user_invites('[{"email":"audit-student@example.invalid","level_shaolin":8,"level_taichi":0,"locale":"fr"}]');
INSERT INTO auth.users(id,email) VALUES ('11111111-1111-4111-8111-111111111111','audit-student@example.invalid');
SELECT pg_temp.assert_true((SELECT profile_locked AND content_access_mode='up_to_assigned_level' FROM user_profiles WHERE id='11111111-1111-4111-8111-111111111111'), 'invite provisions a locked restricted profile');
SELECT pg_temp.assert_true((SELECT locale='fr' AND NOT training_reminders_enabled FROM notification_preferences WHERE user_id='11111111-1111-4111-8111-111111111111'), 'invite assigns French without enabling reminders');
INSERT INTO skills(id,school_id,name,category,discipline,practice_mode,video_url,minimum_grade_value)
SELECT '22222222-2222-4222-8222-222222222222',school_id,'Synthetic advanced skill','forme','shaolin','solo','https://www.youtube.com/watch?v=abcdefghijk',-7
FROM user_profiles WHERE id='11111111-1111-4111-8111-111111111111';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
SELECT set_config('request.jwt.claim.role','authenticated',true);
DO $$
DECLARE assignment text;
BEGIN
  FOREACH assignment IN ARRAY ARRAY[
    'profile_locked=false',
    'content_access_mode=''all_school_content''',
    'can_view_extra_content=true',
    'access_group_id=NULL',
    'role=''admin''',
    'school_id=gen_random_uuid()',
    'assigned_level_shaolin=7',
    'preparing_exam_id=NULL'
  ] LOOP
    BEGIN
      EXECUTE 'UPDATE public.user_profiles SET ' || assignment || ' WHERE id=auth.uid()';
      RAISE EXCEPTION 'FAIL: owner changed %', assignment;
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM NOT LIKE '%managed by administrators%' THEN RAISE; END IF;
      RAISE NOTICE 'PASS: owner cannot change %', assignment;
    END;
  END LOOP;
END;
$$;
UPDATE user_profiles SET display_name='Synthetic student',plan_mode='custom' WHERE id=auth.uid();
UPDATE notification_preferences SET locale='it' WHERE user_id=auth.uid();
SELECT pg_temp.assert_true((SELECT locale='it' FROM notification_preferences WHERE user_id=auth.uid()), 'owner can still change language');
SELECT pg_temp.assert_true((SELECT display_name='Synthetic student' AND plan_mode='custom' FROM user_profiles WHERE id=auth.uid()), 'owner can still change personal fields and plan mode');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM skills WHERE id='22222222-2222-4222-8222-222222222222'), 'advanced skill remains unreadable after attempted scope changes');

DO $$
BEGIN
  BEGIN
    INSERT INTO training_schedule(user_id,weekdays,cadence_weeks,reps_per_form,start_date,end_date)
    VALUES(auth.uid(),ARRAY[1,3,5],1,3,'-infinity','9999-12-31');
    RAISE EXCEPTION 'FAIL: nonfinite schedule admitted';
  EXCEPTION WHEN check_violation THEN RAISE NOTICE 'PASS: nonfinite schedule rejected'; END;
  BEGIN
    INSERT INTO practice_logs(user_id,skill_id,date,completed)
    SELECT auth.uid(),skill_id,'infinity',true FROM user_plan_items WHERE user_id=auth.uid() LIMIT 1;
    RAISE EXCEPTION 'FAIL: nonfinite practice date admitted';
  EXCEPTION WHEN check_violation THEN RAISE NOTICE 'PASS: nonfinite practice date rejected'; END;
END;
$$;
INSERT INTO training_schedule(user_id,weekdays,cadence_weeks,reps_per_form,start_date,end_date)
VALUES(auth.uid(),ARRAY[1,3,5],1,3,'2026-11-01','2026-12-01');
SELECT pg_temp.assert_true(public.current_practice_streak(auth.uid(),'infinity')=0, 'nonfinite streak input exits');
SELECT pg_temp.assert_true(NOT has_function_privilege('authenticated','public.promote_user_after_exam(uuid,discipline,uuid)','EXECUTE'), 'owner cannot execute promotion');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claim.role','service_role',true);

-- Admin path remains usable. Pin the exam once and retry the exact same plan.
CREATE TEMP TABLE expected AS SELECT preparing_exam_id AS id FROM user_profiles WHERE id='11111111-1111-4111-8111-111111111111';
GRANT SELECT ON expected TO service_role;
SET LOCAL ROLE service_role;
SELECT public.promote_user_after_exam('11111111-1111-4111-8111-111111111111','shaolin',(SELECT id FROM expected));
DO $$
BEGIN
  BEGIN
    PERFORM public.promote_user_after_exam('11111111-1111-4111-8111-111111111111','shaolin',(SELECT id FROM expected));
    RAISE EXCEPTION 'FAIL: same plan promoted twice';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE '%expected exam does not match%' THEN RAISE; END IF;
    RAISE NOTICE 'PASS: stale retry rejected';
  END;
END;
$$;
SELECT pg_temp.assert_true((SELECT NOT promoted FROM public.bulk_promote_users_after_exam(
  jsonb_build_array(jsonb_build_object('email','audit-student@example.invalid','shaolin',(SELECT id FROM expected)))
)), 'bulk runner also rejects the same stale exam');
SELECT pg_temp.assert_true((SELECT NOT promoted FROM public.bulk_promote_users_after_exam(
  '[{"email":"audit-student@example.invalid","shaolin":true}]'
)), 'bulk runner rejects unpinned boolean promotions');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM promotion_audit WHERE user_id='11111111-1111-4111-8111-111111111111'), 'one advancement and audit entry after retry');
SELECT pg_temp.assert_true((SELECT assigned_level_taichi=0 AND profile_locked FROM user_profiles WHERE id='11111111-1111-4111-8111-111111111111'), 'promotion preserves other discipline and profile lock');
RESET ROLE;
ROLLBACK;
