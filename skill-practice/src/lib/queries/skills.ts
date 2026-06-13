import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Discipline,
  Skill,
  SkillCategory,
  SkillOption,
  UserProfile,
} from "@/lib/types";

// FESK access scope mirrored client-side for clean listings (defense-in-depth with
// the is_skill_in_scope RLS predicate). Library scope = current grade and easier;
// exam content (next grade) is delivered through the plan, not the catalog.
type SkillScope = Pick<
  UserProfile,
  | "school_id"
  | "content_access_mode"
  | "can_view_extra_content"
  | "assigned_level_shaolin"
  | "assigned_level_taichi"
>;

// Livello 0 = disciplina non praticata (per Shaolin e T'ai Chi). Gli all-access vedono
// comunque tutto.
function disciplineNotPracticed(discipline: Discipline, scope: SkillScope): boolean {
  if (scope.content_access_mode === "all_school_content") return false;
  const level =
    discipline === "shaolin"
      ? scope.assigned_level_shaolin
      : scope.assigned_level_taichi;
  return level === 0;
}

/**
 * Skill accessibili per disciplina e grado utente.
 * Convenzione FESK: numero più alto = grado più basso → accessibile a chi ha
 * un valore di grado minore o uguale alla minimum_grade_value della skill.
 *
 * Filtro: minimum_grade_value >= userGradeValue
 */
export async function listAccessibleSkills(
  discipline: Discipline,
  userGradeValue: number,
  category?: SkillCategory,
): Promise<Skill[]> {
  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .gte("minimum_grade_value", userGradeValue);

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function listSkillsByCategory(
  discipline: Discipline,
  userGradeValue: number,
  category: SkillCategory,
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .gte("minimum_grade_value", userGradeValue)
    .eq("category", category)
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function getSkillById(
  skillId: string,
  schoolId?: string | null,
): Promise<Skill | null> {
  const supabase = await createClient();
  let query = supabase.from("skills").select("*").eq("id", skillId);
  // Difesa in profondita: scope esplicito per scuola oltre alla RLS di 0028.
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data } = await query.maybeSingle();
  return (data as Skill | null) ?? null;
}

export async function listSkillsAtGrade(
  discipline: Discipline,
  gradeValue: number,
  schoolId?: string | null,
): Promise<Skill[]> {
  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .eq("minimum_grade_value", gradeValue);
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data } = await query
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function listSkillsForDiscipline(
  discipline: Discipline,
  schoolId?: string | null,
): Promise<Skill[]> {
  const supabase = await createClient();
  let query = supabase.from("skills").select("*").eq("discipline", discipline);
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data } = await query
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (data as Skill[] | null) ?? [];
}

// Variante snella di listSkillsForDiscipline per le schermate di selezione piano.
export async function listSkillOptionsForDiscipline(
  discipline: Discipline,
  schoolId?: string | null,
): Promise<SkillOption[]> {
  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("id, name, name_italian, minimum_grade_value, category")
    .eq("discipline", discipline);
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data } = await query
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (data as SkillOption[] | null) ?? [];
}

export async function listSkillsForExam(
  examId: string,
  schoolId?: string | null,
): Promise<Skill[]> {
  const supabase = await createClient();

  const { data: reqs } = await supabase
    .from("exam_skill_requirements")
    .select("skill_id")
    .eq("exam_id", examId);

  if (!reqs || reqs.length === 0) return [];

  const skillIds = (reqs as Array<{ skill_id: string }>).map((r) => r.skill_id);

  let query = supabase.from("skills").select("*").in("id", skillIds);
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data: skills } = await query
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (skills as Skill[] | null) ?? [];
}

// Catalogo libreria, ristretto allo scope di accesso dell'utente (grado/disciplina,
// Altro solo per all-access). Sostituisce listSkillsForDiscipline nelle viste utente.
export async function listVisibleSkillsForDiscipline(
  discipline: Discipline,
  scope: SkillScope,
): Promise<Skill[]> {
  if (disciplineNotPracticed(discipline, scope)) return [];

  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .eq("school_id", scope.school_id);

  if (scope.content_access_mode !== "all_school_content") {
    const level =
      discipline === "shaolin"
        ? scope.assigned_level_shaolin
        : scope.assigned_level_taichi;
    query = query.gte("minimum_grade_value", level);
    if (!scope.can_view_extra_content) {
      query = query.eq("is_extra", false);
    }
  }

  const { data } = await query
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function listVisibleSkillOptionsForDiscipline(
  discipline: Discipline,
  scope: SkillScope,
): Promise<SkillOption[]> {
  if (disciplineNotPracticed(discipline, scope)) return [];

  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("id, name, name_italian, minimum_grade_value, category")
    .eq("discipline", discipline)
    .eq("school_id", scope.school_id);

  if (scope.content_access_mode !== "all_school_content") {
    const level =
      discipline === "shaolin"
        ? scope.assigned_level_shaolin
        : scope.assigned_level_taichi;
    query = query.gte("minimum_grade_value", level);
    if (!scope.can_view_extra_content) {
      query = query.eq("is_extra", false);
    }
  }

  const { data } = await query
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as SkillOption[] | null) ?? [];
}
