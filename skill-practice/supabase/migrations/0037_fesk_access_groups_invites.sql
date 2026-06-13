-- FESK rollout - access groups, invite preassignment, profile lock, extra-content flag.
-- Additive only: creates tables/columns, seeds the all-access group, backfills the
-- existing founder/admin profile. Does NOT delete user data.
-- Apply via Supabase SQL Editor (CLI not in PATH). Idempotent guards allow re-run.

BEGIN;

-- ============================================================
-- 1. content_access_mode enum (access enforcement axis, not role)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_access_mode') THEN
    CREATE TYPE content_access_mode AS ENUM (
      'exam_scope', 'up_to_assigned_level', 'all_school_content'
    );
  END IF;
END $$;

-- ============================================================
-- 2. access_groups: thin template copied into the profile on invite-accept,
--    plus per-discipline promotion pointers. NOT combined-state, NOT a junction.
-- ============================================================

CREATE TABLE IF NOT EXISTS access_groups (
  id                                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                         uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  code                              text NOT NULL,
  role                              user_role NOT NULL DEFAULT 'student',
  default_level_shaolin             int NOT NULL DEFAULT 8,
  default_level_taichi              int NOT NULL DEFAULT 0,
  default_preparing_exam_id         uuid REFERENCES exam_programs(id) ON DELETE SET NULL,
  default_preparing_exam_taichi_id  uuid REFERENCES exam_programs(id) ON DELETE SET NULL,
  content_access_mode               content_access_mode NOT NULL DEFAULT 'up_to_assigned_level',
  can_view_extra_content            boolean NOT NULL DEFAULT false,
  can_edit_own_profile              boolean NOT NULL DEFAULT false,
  next_shaolin_access_group_id      uuid REFERENCES access_groups(id) ON DELETE SET NULL,
  next_taichi_access_group_id       uuid REFERENCES access_groups(id) ON DELETE SET NULL,
  created_at                        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

-- ============================================================
-- 3. user_invites: email-keyed preassignment (email stored lower(trim(...)))
-- ============================================================

CREATE TABLE IF NOT EXISTS user_invites (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email             text NOT NULL,
  access_group_id   uuid NOT NULL REFERENCES access_groups(id) ON DELETE RESTRICT,
  display_name      text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'revoked')),
  accepted_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  accepted_at       timestamptz,
  UNIQUE (school_id, email)
);

CREATE INDEX IF NOT EXISTS idx_user_invites_email ON user_invites (email);

-- ============================================================
-- 4. user_profiles: lock + scope columns. profile_locked defaults true, so all
--    existing rows become locked; admins/instructors are unlocked in step 7.
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS profile_locked          boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS access_group_id         uuid REFERENCES access_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS content_access_mode     content_access_mode NOT NULL DEFAULT 'up_to_assigned_level',
  ADD COLUMN IF NOT EXISTS can_view_extra_content  boolean NOT NULL DEFAULT false;

-- ============================================================
-- 5. skills.is_extra: replaces the magic sentinel 99 for access logic.
-- ============================================================

ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS is_extra boolean NOT NULL DEFAULT false;

UPDATE skills SET is_extra = true WHERE minimum_grade_value = 99 AND is_extra = false;

-- ============================================================
-- 6. Seed the all-access group for every existing school.
-- ============================================================

INSERT INTO access_groups (
  school_id, code, role,
  default_level_shaolin, default_level_taichi,
  content_access_mode, can_view_extra_content, can_edit_own_profile
)
SELECT
  s.id, 'all_access_instructor', 'instructor',
  -7, -7,
  'all_school_content', true, true
FROM schools s
WHERE NOT EXISTS (
  SELECT 1 FROM access_groups g
  WHERE g.school_id = s.id AND g.code = 'all_access_instructor'
);

-- ============================================================
-- 7. Backfill existing founder/admin (and staff instructor) profiles to all-access
--    (errata 1: reused project already has these rows; invite bootstrap is not enough).
-- ============================================================

UPDATE user_profiles up
SET
  content_access_mode    = 'all_school_content',
  can_view_extra_content = true,
  profile_locked         = false,
  access_group_id        = g.id
FROM access_groups g
WHERE up.role IN ('admin', 'instructor')
  AND g.school_id = up.school_id
  AND g.code = 'all_access_instructor';

-- OPTIONAL (run manually if the founder account is role 'student'): assign it
-- explicitly so the operator is not locked out. Replace FOUNDER_USER_ID.
-- UPDATE user_profiles
-- SET content_access_mode = 'all_school_content', can_view_extra_content = true,
--     profile_locked = false,
--     access_group_id = (SELECT id FROM access_groups WHERE code = 'all_access_instructor' LIMIT 1)
-- WHERE id = 'FOUNDER_USER_ID';

-- ============================================================
-- 8. RLS: access_groups + user_invites are admin-only, scoped to the admin's school.
--    SECURITY DEFINER (handle_new_user) and the service role bypass RLS by design.
-- ============================================================

ALTER TABLE access_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_groups_admin_all" ON access_groups;
CREATE POLICY "access_groups_admin_all" ON access_groups
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = access_groups.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = access_groups.school_id
    )
  );

DROP POLICY IF EXISTS "user_invites_admin_all" ON user_invites;
CREATE POLICY "user_invites_admin_all" ON user_invites
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = user_invites.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin
      WHERE admin.id = (SELECT auth.uid())
        AND admin.role = 'admin'
        AND admin.school_id = user_invites.school_id
    )
  );

COMMIT;
