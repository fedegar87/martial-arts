-- Training reminder push notifications.
-- Stores user preferences, browser push subscriptions and delivery attempts.

BEGIN;

CREATE TABLE notification_preferences (
  user_id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  training_reminders_enabled   boolean NOT NULL DEFAULT false,
  reminder_time                time NOT NULL DEFAULT '09:00',
  time_zone                    text NOT NULL DEFAULT 'Europe/Rome',
  include_exercise_names       boolean NOT NULL DEFAULT true,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_preferences_time_zone_not_blank CHECK (btrim(time_zone) <> '')
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_owner"
  ON notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE push_subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint       text NOT NULL,
  p256dh         text NOT NULL,
  auth           text NOT NULL,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at     timestamptz,
  CONSTRAINT push_subscriptions_endpoint_not_blank CHECK (btrim(endpoint) <> ''),
  CONSTRAINT push_subscriptions_p256dh_not_blank CHECK (btrim(p256dh) <> ''),
  CONSTRAINT push_subscriptions_auth_not_blank CHECK (btrim(auth) <> '')
);

CREATE UNIQUE INDEX push_subscriptions_endpoint_key
  ON push_subscriptions (endpoint);

CREATE INDEX push_subscriptions_user_active_idx
  ON push_subscriptions (user_id)
  WHERE revoked_at IS NULL;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_owner"
  ON push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE notification_deliveries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id  uuid REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  kind             text NOT NULL CHECK (kind IN ('training_reminder')),
  date             date NOT NULL,
  status           text NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error            text,
  sent_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX notification_deliveries_subscription_kind_date_key
  ON notification_deliveries (subscription_id, kind, date)
  WHERE subscription_id IS NOT NULL;

CREATE INDEX notification_deliveries_user_date_idx
  ON notification_deliveries (user_id, date DESC);

ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_deliveries_owner_select"
  ON notification_deliveries
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER notification_preferences_touch
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_notification_preferences();

COMMIT;
