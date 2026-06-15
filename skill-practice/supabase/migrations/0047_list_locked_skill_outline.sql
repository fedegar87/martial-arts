-- Outline (sola struttura) del programma BLOCCATO: i gradi piu' avanzati del livello
-- in preparazione. La RLS skills_read (0040/0046) nasconde le skill fuori scope, quindi
-- la libreria si ferma al livello successivo. Per mostrare il resto del programma
-- "bloccato" servono solo i metadati (nome, grado, categoria), NON i contenuti.
--
-- SECURITY DEFINER per superare skills_read, ma ritorna SOLO colonne sicure: niente
-- video_url, teacher_notes, thumbnail. Scoping per scuola via join su user_profiles
-- (stesso pattern di is_skill_in_scope). Esclude le skill "Altro" (is_extra), che
-- restano gated dal proprio flag. Locked = minimum_grade_value < floor, dove
-- floor = COALESCE(next_grade_value(livello), livello): il livello in preparazione.
-- All-access non ha nulla di bloccato (gestito lato app, qui ritorna comunque vuoto
-- perche' content_access_mode <> 'all_school_content').

CREATE OR REPLACE FUNCTION public.list_locked_skill_outline(p_discipline public.discipline)
RETURNS TABLE (
  skill_id            uuid,
  skill_name          text,
  skill_name_italian  text,
  minimum_grade_value int,
  category            public.skill_category
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id                  AS skill_id,
    s.name                AS skill_name,
    s.name_italian        AS skill_name_italian,
    s.minimum_grade_value AS minimum_grade_value,
    s.category            AS category
  FROM public.skills s
  JOIN public.user_profiles p ON p.id = (SELECT auth.uid())
  WHERE s.school_id = p.school_id
    AND s.discipline = p_discipline
    AND s.is_extra = false
    AND p.content_access_mode <> 'all_school_content'
    AND (
      (p_discipline = 'shaolin'
        AND p.assigned_level_shaolin <> 0
        AND s.minimum_grade_value < COALESCE(public.next_grade_value(p.assigned_level_shaolin), p.assigned_level_shaolin))
      OR (p_discipline = 'taichi'
        AND p.assigned_level_taichi <> 0
        AND s.minimum_grade_value < COALESCE(public.next_grade_value(p.assigned_level_taichi), p.assigned_level_taichi))
    )
  ORDER BY s.minimum_grade_value DESC, s.category, s.display_order;
$$;

REVOKE EXECUTE ON FUNCTION public.list_locked_skill_outline(public.discipline) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.list_locked_skill_outline(public.discipline) TO authenticated;
