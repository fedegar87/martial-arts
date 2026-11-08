BEGIN;

-- Enforce new writes without blocking rollout on historical rows; inspect those
-- separately before validating the constraints.
ALTER TABLE public.training_schedule
  ADD CONSTRAINT training_schedule_date_domain CHECK (
    start_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
    AND end_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
  ) NOT VALID;

ALTER TABLE public.practice_logs
  ADD CONSTRAINT practice_logs_date_domain CHECK (
    date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
  ) NOT VALID;

CREATE OR REPLACE FUNCTION public.current_practice_streak(
  p_user_id UUID,
  p_today DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  streak INTEGER := 0;
  cursor_date DATE := p_today;
  has_practice BOOLEAN;
  today_skipped BOOLEAN := false;
BEGIN
  IF p_today IS NULL OR NOT isfinite(p_today) THEN RETURN 0; END IF;
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM practice_logs
      WHERE user_id = p_user_id
        AND date = cursor_date
        AND (completed = true OR reps_done > 0)
    ) INTO has_practice;

    IF NOT has_practice THEN
      -- Tolleranza: se e oggi e non c'e pratica, prova ieri prima di rompere lo streak
      IF cursor_date = p_today AND NOT today_skipped THEN
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

GRANT EXECUTE ON FUNCTION public.current_practice_streak(UUID, DATE) TO authenticated;

COMMIT;
