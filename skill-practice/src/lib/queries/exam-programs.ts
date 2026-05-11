import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Discipline,
  ExamProgram,
  ExamSkillRequirement,
} from "@/lib/types";

export const listExamProgramsForSchool = unstable_cache(
  async (
    schoolId: string,
    discipline?: Discipline,
  ): Promise<ExamProgram[]> => {
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
  },
  ["exam-programs-for-school"],
  { revalidate: 3600, tags: ["exams"] },
);

export const getExamProgramRequirements = unstable_cache(
  async (examId: string): Promise<ExamSkillRequirement[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("exam_skill_requirements")
      .select("*")
      .eq("exam_id", examId);

    return (data as ExamSkillRequirement[] | null) ?? [];
  },
  ["exam-program-requirements"],
  { revalidate: 3600, tags: ["exams"] },
);

export const getExamProgramById = unstable_cache(
  async (examId: string): Promise<ExamProgram | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("exam_programs")
      .select("*")
      .eq("id", examId)
      .maybeSingle();

    return (data as ExamProgram | null) ?? null;
  },
  ["exam-program-by-id"],
  { revalidate: 3600, tags: ["exams"] },
);
