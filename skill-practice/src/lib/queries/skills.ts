import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Skill, SkillCategory } from "@/lib/types";

export async function listAccessibleSkills(maxLevel: number): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .lte("minimum_level", maxLevel)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}

export async function listSkillsByCategory(
  maxLevel: number,
  category: SkillCategory,
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .lte("minimum_level", maxLevel)
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
