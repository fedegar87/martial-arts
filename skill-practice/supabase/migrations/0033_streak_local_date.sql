-- M4 — Lo streak veniva calcolato partendo da CURRENT_DATE (UTC), mentre i
-- practice_logs sono datati con la data locale (Europe/Rome via localDateKey).
-- Nella finestra dopo mezzanotte italiana questo escludeva la pratica appena
-- registrata, mostrando uno streak incoerente con il calendario 90 giorni.
--
-- Fix: la funzione accetta la data "oggi" dall'app (p_today), passata come
-- localDateKey(). Default a CURRENT_DATE per retrocompatibilita di chiamate.

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
