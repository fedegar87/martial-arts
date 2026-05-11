-- 0025 - RPC top_practiced_skills: classifica per giorni distinti di pratica.
-- Stessa convenzione di "log meaningful" di 0022: completed=true OPPURE reps_done>0.
-- Non aggiunge colonne o tabelle: aggregato derivato da practice_logs.
-- Il constraint unique practice_logs_user_skill_date_key (da 0021) supporta
-- WHERE user_id=X GROUP BY skill_id e garantisce un solo log per giorno/skill.

CREATE OR REPLACE FUNCTION public.top_practiced_skills(
  p_user_id UUID,
  p_limit   INT DEFAULT 5
)
RETURNS TABLE (
  skill_id              UUID,
  skill_name            TEXT,
  skill_name_italian    TEXT,
  discipline            discipline,
  category              skill_category,
  practice_days         INT,
  last_practiced_date   DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id              AS skill_id,
    s.name            AS skill_name,
    s.name_italian    AS skill_name_italian,
    s.discipline,
    s.category,
    COUNT(*)::INT     AS practice_days,
    MAX(pl.date)      AS last_practiced_date
  FROM practice_logs pl
  INNER JOIN skills s ON s.id = pl.skill_id
  WHERE pl.user_id = p_user_id
    AND (pl.completed = true OR pl.reps_done > 0)
  GROUP BY s.id, s.name, s.name_italian, s.discipline, s.category
  ORDER BY practice_days DESC, last_practiced_date DESC, s.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5), 50));
$$;

GRANT EXECUTE ON FUNCTION public.top_practiced_skills(UUID, INT) TO authenticated;
