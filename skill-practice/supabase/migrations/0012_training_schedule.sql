-- training_schedule: una riga per utente con le regole di schedulazione
-- delle sessioni. Le sessioni stesse sono calcolate al volo da
-- src/lib/session-scheduler.ts a partire da queste regole + user_plan_items.

BEGIN;

CREATE TABLE training_schedule (
  user_id        uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  weekdays       smallint[] NOT NULL,
  cadence_weeks  smallint NOT NULL,
  reps_per_form  smallint NOT NULL DEFAULT 3,
  start_date     date NOT NULL,
  end_date       date NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ts_weekdays_size CHECK (array_length(weekdays, 1) BETWEEN 1 AND 7),
  CONSTRAINT ts_cadence_valid CHECK (cadence_weeks IN (1, 2, 4)),
  CONSTRAINT ts_reps_range CHECK (reps_per_form BETWEEN 1 AND 10),
  CONSTRAINT ts_dates_order CHECK (end_date > start_date)
);

ALTER TABLE training_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ts_owner" ON training_schedule
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.touch_training_schedule()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER training_schedule_touch
  BEFORE UPDATE ON training_schedule
  FOR EACH ROW EXECUTE FUNCTION public.touch_training_schedule();

-- Estensione practice_logs per tracciare le ripetizioni.
-- reps_target è snapshot: si fissa al primo log della giornata e non cambia
-- se l'utente modifica reps_per_form a metà giornata. Resta NULL per i log
-- precedenti alla migration (backward compatible).
ALTER TABLE practice_logs
  ADD COLUMN reps_target smallint,
  ADD COLUMN reps_done   smallint NOT NULL DEFAULT 0;

ALTER TABLE practice_logs
  ADD CONSTRAINT pl_reps_done_nonneg CHECK (reps_done >= 0),
  ADD CONSTRAINT pl_reps_target_range CHECK (reps_target IS NULL OR reps_target BETWEEN 1 AND 10);

COMMIT;
