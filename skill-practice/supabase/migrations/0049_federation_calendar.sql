-- Public federation events, explicit user reminders and per-event push delivery.
BEGIN;

CREATE TABLE IF NOT EXISTS public.federation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_uid text NOT NULL CHECK (length(source_uid) BETWEEN 1 AND 512),
  recurrence_key text NOT NULL DEFAULT '' CHECK (length(recurrence_key) <= 128),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 300),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 16000),
  location text NOT NULL DEFAULT '' CHECK (length(location) <= 600),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  cancelled boolean NOT NULL DEFAULT false,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_uid, recurrence_key),
  CHECK (ends_at >= starts_at),
  CHECK (ends_on >= starts_on)
);
CREATE INDEX IF NOT EXISTS federation_events_dates_idx
  ON public.federation_events (starts_on, ends_on);
ALTER TABLE public.federation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.federation_events FROM anon, authenticated;
GRANT SELECT ON public.federation_events TO authenticated;
GRANT ALL ON public.federation_events TO service_role;
DROP POLICY IF EXISTS federation_events_authenticated_read ON public.federation_events;
CREATE POLICY federation_events_authenticated_read ON public.federation_events
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.federation_event_reminders (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.federation_events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
CREATE INDEX IF NOT EXISTS federation_event_reminders_event_idx
  ON public.federation_event_reminders (event_id);
ALTER TABLE public.federation_event_reminders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.federation_event_reminders FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.federation_event_reminders TO authenticated;
GRANT ALL ON public.federation_event_reminders TO service_role;
DROP POLICY IF EXISTS federation_event_reminders_owner_select ON public.federation_event_reminders;
CREATE POLICY federation_event_reminders_owner_select ON public.federation_event_reminders
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS federation_event_reminders_owner_insert ON public.federation_event_reminders;
CREATE POLICY federation_event_reminders_owner_insert ON public.federation_event_reminders
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.federation_events event
      WHERE event.id = event_id AND NOT event.cancelled AND event.starts_at > now()
    )
  );
DROP POLICY IF EXISTS federation_event_reminders_owner_delete ON public.federation_event_reminders;
CREATE POLICY federation_event_reminders_owner_delete ON public.federation_event_reminders
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

ALTER TABLE public.notification_deliveries
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.federation_events(id) ON DELETE CASCADE;
ALTER TABLE public.notification_deliveries DROP CONSTRAINT IF EXISTS notification_deliveries_kind_check;
ALTER TABLE public.notification_deliveries ADD CONSTRAINT notification_deliveries_kind_check
  CHECK (kind IN ('training_reminder', 'event_reminder'));
ALTER TABLE public.notification_deliveries DROP CONSTRAINT IF EXISTS notification_deliveries_event_kind_check;
ALTER TABLE public.notification_deliveries ADD CONSTRAINT notification_deliveries_event_kind_check
  CHECK ((kind = 'event_reminder') = (event_id IS NOT NULL));
DROP INDEX IF EXISTS public.notification_deliveries_subscription_kind_date_key;
CREATE UNIQUE INDEX notification_deliveries_subscription_kind_date_key
  ON public.notification_deliveries (subscription_id, kind, date)
  WHERE subscription_id IS NOT NULL AND event_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS notification_deliveries_subscription_event_key
  ON public.notification_deliveries (subscription_id, event_id)
  WHERE subscription_id IS NOT NULL AND event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_federation_events(
  p_events jsonb, p_from date, p_to date, p_fetched_at timestamptz
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE imported integer;
BEGIN
  IF p_events IS NULL OR jsonb_typeof(p_events) <> 'array' OR jsonb_array_length(p_events) > 5000
    OR p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 800
    OR p_fetched_at IS NULL OR p_fetched_at > now() + interval '5 minutes' THEN
    RAISE EXCEPTION 'Invalid federation calendar snapshot';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('federation_event_sync', 0));
  IF EXISTS (SELECT 1 FROM public.federation_events WHERE synced_at > p_fetched_at) THEN
    RETURN 0;
  END IF;

  INSERT INTO public.federation_events (
    source_uid, recurrence_key, title, description, location, starts_at, ends_at,
    starts_on, ends_on, all_day, cancelled, synced_at
  )
  SELECT event.source_uid, event.recurrence_key, event.title, event.description,
    event.location, event.starts_at, event.ends_at, event.starts_on, event.ends_on,
    event.all_day, event.cancelled, p_fetched_at
  FROM jsonb_to_recordset(p_events) AS event(
    source_uid text, recurrence_key text, title text, description text, location text,
    starts_at timestamptz, ends_at timestamptz, starts_on date, ends_on date,
    all_day boolean, cancelled boolean
  )
  ON CONFLICT (source_uid, recurrence_key) DO UPDATE SET
    title = EXCLUDED.title, description = EXCLUDED.description,
    location = EXCLUDED.location, starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at, starts_on = EXCLUDED.starts_on,
    ends_on = EXCLUDED.ends_on, all_day = EXCLUDED.all_day,
    cancelled = EXCLUDED.cancelled, synced_at = EXCLUDED.synced_at;
  GET DIAGNOSTICS imported = ROW_COUNT;

  UPDATE public.federation_events SET cancelled = true, synced_at = p_fetched_at
  WHERE synced_at < p_fetched_at AND ends_on >= p_from AND starts_on <= p_to;
  RETURN imported;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_federation_events(jsonb, date, date, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_federation_events(jsonb, date, date, timestamptz)
  TO service_role;

COMMIT;
