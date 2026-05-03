-- Profile/account privacy controls.
-- Keeps user-owned profile edits from changing authorization-sensitive fields
-- and records account deletion requests for admin handling.

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_user_profile_privilege_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'authenticated'
    AND auth.uid() = OLD.id
    AND (
      NEW.role IS DISTINCT FROM OLD.role
      OR NEW.school_id IS DISTINCT FROM OLD.school_id
    )
  THEN
    RAISE EXCEPTION 'role and school_id are managed by administrators';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_prevent_privilege_changes
  ON public.user_profiles;

CREATE TRIGGER user_profiles_prevent_privilege_changes
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_profile_privilege_changes();

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'resolved', 'cancelled')),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  note          TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_account_deletion_requests_pending
  ON account_deletion_requests (user_id)
  WHERE status = 'pending';

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "account_deletion_requests_owner_select"
  ON account_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "account_deletion_requests_owner_insert"
  ON account_deletion_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "account_deletion_requests_admin_select"
  ON account_deletion_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.role = 'admin'
    )
  );

CREATE POLICY "account_deletion_requests_admin_update"
  ON account_deletion_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles profile
      WHERE profile.id = auth.uid()
        AND profile.role = 'admin'
    )
  );

COMMIT;
