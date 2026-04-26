import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  buildPracticeCalendar,
  computeBestStreak,
  computeCurrentStreak,
  dateDaysAgo,
  type PracticeDay,
} from "@/lib/progress-logic";
import type { Discipline, PlanStatus, PracticeLog, Skill, UserProfile } from "@/lib/types";

export {
  buildCurriculumCells,
  computeCategoryProgress,
  type CategoryAxis,
  type CurriculumCell,
  type PracticeDay,
} from "@/lib/progress-logic";

export type ExamProgressInfo = {
  discipline: Discipline;
  title: string;
  percent: number;
  covered: number;
  total: number;
  missing: Skill[];
};

export type ProgressData = {
  skills: Skill[];
  planBySkillId: Map<string, PlanStatus>;
  logs: PracticeLog[];
  calendar: PracticeDay[];
  currentStreak: number;
  bestStreak: number;
  examProgressByDiscipline: Partial<Record<Discipline, ExamProgressInfo>>;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();

  const [{ data: skillsData }, { data: planData }, { data: logsData }] =
    await Promise.all([
      supabase.from("skills").select("*").order("display_order"),
      supabase
        .from("user_plan_items")
        .select("*")
        .eq("user_id", userId)
        .eq("is_hidden", false),
      supabase
        .from("practice_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", dateDaysAgo(89))
        .order("date", { ascending: true }),
    ]);

  const skills = (skillsData as Skill[] | null) ?? [];
  const logs = (logsData as PracticeLog[] | null) ?? [];
  const planRows =
    (planData as Array<{ skill_id: string; status: PlanStatus }> | null) ?? [];
  const planBySkillId = new Map(planRows.map((row) => [row.skill_id, row.status]));
  const calendar = buildPracticeCalendar(logs);

  return {
    skills,
    planBySkillId,
    logs,
    calendar,
    currentStreak: computeCurrentStreak(calendar),
    bestStreak: computeBestStreak(calendar),
    examProgressByDiscipline: await getExamProgressByDiscipline(
      profile,
      skills,
      planBySkillId,
    ),
  };
}

async function getExamProgressByDiscipline(
  profile: UserProfile,
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
): Promise<ProgressData["examProgressByDiscipline"]> {
  const examRefs: Array<{ discipline: Discipline; id: string }> = [
    profile.preparing_exam_id
      ? { discipline: "shaolin", id: profile.preparing_exam_id }
      : null,
    profile.preparing_exam_taichi_id
      ? { discipline: "taichi", id: profile.preparing_exam_taichi_id }
      : null,
  ].filter((item): item is { discipline: Discipline; id: string } => item !== null);

  if (examRefs.length === 0) return {};

  const supabase = await createClient();
  const examIds = examRefs.map((exam) => exam.id);
  const [{ data: examData }, { data: reqData }] = await Promise.all([
    supabase.from("exam_programs").select("*").in("id", examIds),
    supabase
      .from("exam_skill_requirements")
      .select("exam_id, skill_id")
      .in("exam_id", examIds),
  ]);

  const examsById = new Map(
    ((examData ?? []) as Array<{ id: string; level_name?: string }>).map(
      (exam) => [exam.id, exam],
    ),
  );
  const reqsByExamId = new Map<string, Set<string>>();
  for (const row of (reqData ?? []) as Array<{ exam_id: string; skill_id: string }>) {
    const reqs = reqsByExamId.get(row.exam_id) ?? new Set<string>();
    reqs.add(row.skill_id);
    reqsByExamId.set(row.exam_id, reqs);
  }

  const result: ProgressData["examProgressByDiscipline"] = {};
  for (const examRef of examRefs) {
    const reqIds = reqsByExamId.get(examRef.id) ?? new Set<string>();
    const requiredSkills = skills.filter((skill) => reqIds.has(skill.id));
    const covered = requiredSkills.filter((skill) => planBySkillId.has(skill.id));
    const missing = requiredSkills.filter((skill) => !planBySkillId.has(skill.id));

    result[examRef.discipline] = {
      discipline: examRef.discipline,
      title: examsById.get(examRef.id)?.level_name ?? "Esame",
      percent:
        requiredSkills.length === 0
          ? 0
          : Math.round((covered.length / requiredSkills.length) * 100),
      covered: covered.length,
      total: requiredSkills.length,
      missing,
    };
  }

  return result;
}
