-- FESK rollout verification queries.
-- Paste into the Supabase SQL Editor (CLI is not in PATH) AFTER applying migrations
-- 0037-0041. Each block prints what the application relies on; compare against the
-- "Expect" notes. Read-only: no data is modified.

-- 1. handle_new_user body actually applied (must read user_invites, block on no match,
--    and NOT hardcode 8/0). Expect: the 0038 body.
SELECT pg_get_functiondef('public.handle_new_user'::regproc);

-- 2. is_skill_in_scope present (content visibility predicate). Expect: one row.
SELECT proname, pg_get_function_identity_arguments(oid) AS args
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'is_skill_in_scope';

-- 3. Profile-lock trigger covers levels/exam. Expect: body references
--    assigned_level_shaolin / preparing_exam_id and profile_locked.
SELECT pg_get_functiondef('public.prevent_user_profile_privilege_changes'::regproc);

-- 4. RLS enabled on the security-relevant tables. Expect: rowsecurity = true for all.
SELECT relname, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('skills','exam_programs','exam_skill_requirements','news_items',
                  'user_profiles','user_plan_items','practice_logs',
                  'access_groups','user_invites','promotion_audit')
ORDER BY relname;

-- 5. Read/visibility + write-check policies. Expect: skills_read USING references
--    is_skill_in_scope; user_plan_items/practice_logs WITH CHECK reference it;
--    access_groups/user_invites are admin-only.
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('skills','user_plan_items','practice_logs',
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
                    'is_skill_in_scope','promote_user_after_exam')
ORDER BY p.proname;

-- 12. Pending invites overview (operational). Expect: rows you inserted before inviting.
SELECT status, count(*) FROM user_invites GROUP BY status ORDER BY status;
