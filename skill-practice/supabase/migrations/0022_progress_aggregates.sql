-- C.5 — Aggregati lato SQL per /progress.
-- Sostituisce due query non-bounded su practice_logs (scaricavano tutto lo storico
-- per calcolare totali e streak lato applicazione) con due funzioni server-side.
--
-- Convenzione: una pratica conta come effettiva se completed=true OPPURE reps_done>0
-- (allineato con isMeaningfulLog / computeCurrentStreakFromLogs in TypeScript).

CREATE OR REPLACE FUNCTION public.count_practice_days(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT date)::INT
  FROM practice_logs
  WHERE user_id = p_user_id
    AND (completed = true OR reps_done > 0);
$$;

CREATE OR REPLACE FUNCTION public.current_practice_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  streak INTEGER := 0;
  cursor_date DATE := CURRENT_DATE;
  has_practice BOOLEAN;
  today_skipped BOOLEAN := false;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM practice_logs
      WHERE user_id = p_user_id
        AND date = cursor_date
        AND (completed = true OR reps_done > 0)
    ) INTO has_practice;

    IF NOT has_practice THEN
      -- Tolleranza: se è oggi e non c'è pratica, prova ieri prima di rompere lo streak
      IF cursor_date = CURRENT_DATE AND NOT today_skipped THEN
        today_skipped := true;
        cursor_date := cursor_date - 1;
        CONTINUE;
      END IF;
      EXIT;
    END IF;

    streak := streak + 1;
    cursor_date := cursor_date - 1;
  END LOOP;

  RETURN streak;
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_practice_days(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_practice_streak(UUID) TO authenticated;
