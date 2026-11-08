-- FESK rollout verification queries.
-- Paste into the Supabase SQL Editor (CLI is not in PATH) AFTER applying migrations
-- 0001-0054. Each block prints what the application relies on; compare against the
-- "Expect" notes. Read-only: no data is modified.

-- 1. handle_new_user body actually applied (must read user_invites, block on no match,
--    and initialize notification_preferences.locale from inv.locale). Expect: 0051.
--    The empty-profile/one-school admin bootstrap remains an explicit exception.
--    Auth signup must be restricted before exposing a fresh instance.
SELECT pg_get_functiondef('public.handle_new_user'::regproc);

-- 2. is_skill_in_scope present (content visibility predicate). Expect: one row.
SELECT proname, pg_get_function_identity_arguments(oid) AS args
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'is_skill_in_scope';

-- 3. Expect the 0052 body: role, school_id, access_group_id, profile_locked,
--    content_access_mode and can_view_extra_content are administrator-managed;
--    a locked owner cannot change assigned grades/exams.
SELECT pg_get_functiondef('public.prevent_user_profile_privilege_changes'::regproc);

-- 4. RLS enabled on the security-relevant tables. Expect: rowsecurity = true for all.
SELECT relname, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('skills','exam_programs','exam_skill_requirements','news_items',
                  'user_profiles','user_plan_items','practice_logs',
                  'access_groups','user_invites','promotion_audit',
                  'notification_preferences','push_subscriptions','notification_deliveries',
                  'training_schedule','federation_events','federation_event_reminders')
ORDER BY relname;

-- 5. Read/visibility + write-check policies. Expect: skills_read USING references
--    is_skill_in_scope; user_plan_items/practice_logs WITH CHECK reference it;
--    access_groups/user_invites are admin-only.
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('skills','user_profiles','user_plan_items','practice_logs',
                    'access_groups','user_invites','promotion_audit')
ORDER BY tablename, policyname;

-- 6. New access-control schema columns on user_profiles. Expect: profile_locked,
--    access_group_id, content_access_mode, can_view_extra_content present.
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
  AND column_name IN ('profile_locked','access_group_id','content_access_mode','can_view_extra_content')
ORDER BY column_name;

-- 7. skills.is_extra exists and is backfilled for the Altro sentinel.
--    Expect: extra_count = count of minimum_grade_value = 99 rows.
SELECT count(*) FILTER (WHERE is_extra) AS extra_count,
       count(*) FILTER (WHERE minimum_grade_value = 99) AS sentinel_count
FROM skills;

-- 8. Exactly one school (single-tenant hardening assumption). Expect: 1.
SELECT count(*) AS school_count FROM schools;

-- 9. All-access group seeded per school. Expect: one all_access_instructor per school.
SELECT school_id, code, content_access_mode, can_view_extra_content, can_edit_own_profile
FROM access_groups
WHERE code = 'all_access_instructor';

-- 10. Founder/admin backfilled to all-access. Expect: admin/instructor rows show
--     content_access_mode = all_school_content, profile_locked = false.
SELECT role, content_access_mode, can_view_extra_content, profile_locked, count(*)
FROM user_profiles
GROUP BY role, content_access_mode, can_view_extra_content, profile_locked
ORDER BY role;

-- 11. Mutating RPC grants. Expect: the 6 plan RPCs executable by authenticated only
--     (no anon/PUBLIC, 0035); promote_user_after_exam NOT executable by authenticated
--     (service_role only, 0041).
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.proacl
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND p.proname IN ('activate_exam_mode','switch_to_exam_mode','switch_to_custom_mode',
                    'save_custom_selection','update_plan_item_status','hide_plan_item',
                    'is_skill_in_scope','promote_user_after_exam','bulk_promote_users_after_exam',
                    'bulk_upsert_user_invites','current_practice_streak')
ORDER BY p.proname;

-- 12. Pending invites overview (operational). Expect: rows you inserted before inviting.
SELECT status, count(*) FROM user_invites GROUP BY status ORDER BY status;

-- 13. Converted/legacy accounts: plan items OUT of the owner's current scope. These stay
-- readable via the in-plan branch of skills_read, so review (and clean) them before
-- inviting if an existing account is repurposed as a locked student. Inlines the
-- is_skill_in_scope rule. Expect: 0 rows for a clean invited cohort.
SELECT up.id AS user_id, up.display_name, s.id AS skill_id, s.name,
       s.discipline, s.minimum_grade_value, s.is_extra
FROM user_plan_items i
JOIN user_profiles up ON up.id = i.user_id
JOIN skills s ON s.id = i.skill_id
WHERE NOT (
  s.school_id = up.school_id
  AND (
    up.content_access_mode = 'all_school_content'
    OR (
      (NOT s.is_extra OR up.can_view_extra_content)
      AND (
        (s.discipline = 'shaolin' AND up.assigned_level_shaolin <> 0
          AND s.minimum_grade_value >= COALESCE(public.next_grade_value(up.assigned_level_shaolin), up.assigned_level_shaolin))
        OR (s.discipline = 'taichi' AND up.assigned_level_taichi <> 0
          AND s.minimum_grade_value >= COALESCE(public.next_grade_value(up.assigned_level_taichi), up.assigned_level_taichi))
        OR EXISTS (
          SELECT 1 FROM exam_skill_requirements r
          WHERE r.skill_id = s.id
            AND r.exam_id IN (up.preparing_exam_id, up.preparing_exam_taichi_id)
        )
      )
    )
  )
)
ORDER BY up.id;

-- Review each legacy row intentionally; do not perform automatic plan cleanup.

-- 14. Required i18n columns: expect 5 rows.
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND ((table_name IN ('skills','exam_programs','news_items') AND column_name='translations')
    OR (table_name IN ('notification_preferences','user_invites') AND column_name='locale'))
ORDER BY table_name;

-- 15. 0051 provisioning and bulk invite locale support: both true.
SELECT position('inv.locale' IN pg_get_functiondef('public.handle_new_user'::regproc)) > 0 AS provisioning_locale,
       position('invite_locale' IN pg_get_functiondef('public.bulk_upsert_user_invites(jsonb,uuid)'::regprocedure)) > 0 AS invite_locale;

-- 16. Active profile trigger: expect tgenabled='O' and the intended function.
SELECT tgenabled, pg_get_triggerdef(oid)
FROM pg_trigger WHERE tgrelid='public.user_profiles'::regclass AND NOT tgisinternal;

-- 17. 0053 guards new writes; NOT VALID is intentional until historical review.
SELECT conname, convalidated, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN ('public.training_schedule'::regclass,'public.practice_logs'::regclass)
  AND conname IN ('training_schedule_date_domain','practice_logs_date_domain');
SELECT count(*) AS schedules_requiring_review FROM public.training_schedule
WHERE NOT (start_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
  AND end_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31');
SELECT count(*) AS practice_dates_requiring_review FROM public.practice_logs
WHERE NOT (date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31');

-- 18. Guarded promotion: expect guarded_present=true, unsafe_legacy_present=false,
-- authenticated_can_promote=false, service_can_promote=true.
SELECT to_regprocedure('public.promote_user_after_exam(uuid,discipline,uuid)') IS NOT NULL AS guarded_present,
       to_regprocedure('public.promote_user_after_exam(uuid,discipline)') IS NOT NULL AS unsafe_legacy_present,
       has_function_privilege('authenticated','public.promote_user_after_exam(uuid,discipline,uuid)','EXECUTE') AS authenticated_can_promote,
       has_function_privilege('service_role','public.promote_user_after_exam(uuid,discipline,uuid)','EXECUTE') AS service_can_promote;
