import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ExamProgram, ExamSkillRequirement } from "@/lib/types";

export async function listExamProgramsForSchool(
  schoolId: string,
): Promise<ExamProgram[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_programs")
    .select("*")
    .eq("school_id", schoolId)
    .order("level_number", { ascending: true });

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
