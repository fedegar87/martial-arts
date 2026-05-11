-- C.11 — Indice composito per query catalogo /library e /programma.
-- Pattern d'accesso più frequente: filtra per discipline, gte minimum_grade_value,
-- ordina per minimum_grade_value DESC, category, display_order.
-- school_id incluso come prefisso per blindare il multi-tenant futuro e
-- per permettere index-only scan quando rilevante.

CREATE INDEX IF NOT EXISTS idx_skills_school_disc_grade_order
  ON public.skills (school_id, discipline, minimum_grade_value DESC, display_order);
