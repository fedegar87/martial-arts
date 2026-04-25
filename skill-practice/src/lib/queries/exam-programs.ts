import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Discipline,
  ExamProgram,
  ExamSkillRequirement,
} from "@/lib/types";

export async function listExamProgramsForSchool(
  schoolId: string,
  discipline?: Discipline,
): Promise<ExamProgram[]> {
  const supabase = await createClient();
  let query = supabase
    .from("exam_programs")
    .select("*")
    .eq("school_id", schoolId);

  if (discipline) {
    query = query.eq("discipline", discipline);
  }

  // grade_value: numericamente decrescente da 7 (primo esame) a -7 (ultimo)
  // Più alto = grado più basso = esame più precoce.
  const { data } = await query.order("grade_value", { ascending: false });

  return (data as ExamProgram[] | null) ?? [];
}

export async function getExamProgramRequirements(
  examId: string,
): Promise<ExamSkillRequirement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_skill_requirements")
    .select("*")
    .eq("exam_id", examId);

  return (data as ExamSkillRequirement[] | null) ?? [];
}

export async function getExamProgramById(
  examId: string,
): Promise<ExamProgram | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_programs")
    .select("*")
    .eq("id", examId)
    .maybeSingle();

  return (data as ExamProgram | null) ?? null;
}
