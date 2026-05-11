import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

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

export async function getSkillById(skillId: string): Promise<Skill | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .maybeSingle();
  return (data as Skill | null) ?? null;
}

export async function listSkillsAtGrade(
  discipline: Discipline,
  gradeValue: number,
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .eq("minimum_grade_value", gradeValue)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function listSkillsForDiscipline(
  discipline: Discipline,
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (data as Skill[] | null) ?? [];
}

export async function listSkillsForExam(examId: string): Promise<Skill[]> {
  const supabase = await createClient();

  const { data: reqs } = await supabase
    .from("exam_skill_requirements")
    .select("skill_id")
    .eq("exam_id", examId);

  if (!reqs || reqs.length === 0) return [];

  const skillIds = (reqs as Array<{ skill_id: string }>).map((r) => r.skill_id);

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .in("id", skillIds)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (skills as Skill[] | null) ?? [];
}
