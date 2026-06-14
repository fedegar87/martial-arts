-- Estende lo scope di accesso al LIVELLO SUCCESSIVO (quello in preparazione), non solo
-- al grado posseduto: la selezione personale e il catalogo devono mostrare anche i
-- contenuti dell'esame che si sta preparando, come la modalita esame.
-- Floor per disciplina = COALESCE(next_grade_value(livello), livello). Mantiene: blocco
-- disciplina non praticata (0), gate Altro, bypass all-access, clausola esame-in-prep.
-- Corpo identico al precedente is_skill_in_scope salvo il floor (next grade).

CREATE OR REPLACE FUNCTION public.is_skill_in_scope(p_skill_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.skills s
    JOIN public.user_profiles p ON p.id = (SELECT auth.uid())
    WHERE s.id = p_skill_id
      AND s.school_id = p.school_id
      AND (
        p.content_access_mode = 'all_school_content'
        OR (
          (NOT s.is_extra OR p.can_view_extra_content)
          AND (
            (s.discipline = 'shaolin'
              AND p.assigned_level_shaolin <> 0
              AND s.minimum_grade_value >= COALESCE(public.next_grade_value(p.assigned_level_shaolin), p.assigned_level_shaolin))
            OR (s.discipline = 'taichi'
              AND p.assigned_level_taichi <> 0
              AND s.minimum_grade_value >= COALESCE(public.next_grade_value(p.assigned_level_taichi), p.assigned_level_taichi))
            OR EXISTS (
              SELECT 1 FROM public.exam_skill_requirements r
              WHERE r.skill_id = s.id
                AND r.exam_id IN (p.preparing_exam_id, p.preparing_exam_taichi_id)
            )
          )
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_skill_in_scope(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_skill_in_scope(uuid) TO authenticated;
