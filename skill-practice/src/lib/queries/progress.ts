import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  activePlanSource,
  buildPracticeCalendar,
  computePlanProgress,
  computeBestStreak,
  computeCurrentStreak,
  dateDaysAgo,
  type PlanProgressSummary,
  type PracticeDay,
} from "@/lib/progress-logic";
import type { Discipline, PlanStatus, PracticeLog, Skill, UserProfile } from "@/lib/types";

export {
  buildCurriculumCells,
  type CurriculumCell,
  type PlanProgressSummary as PlanProgressInfo,
  type PracticeDay,
} from "@/lib/progress-logic";

export type ProgressData = {
  skills: Skill[];
  planBySkillId: Map<string, PlanStatus>;
  logs: PracticeLog[];
  calendar: PracticeDay[];
  currentStreak: number;
  bestStreak: number;
  recentPracticedSkillCount: number;
  planProgressByDiscipline: Partial<Record<Discipline, PlanProgressSummary>>;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();
  const source = activePlanSource(profile.plan_mode);

  const [{ data: skillsData }, { data: planData }, { data: logsData }] =
    await Promise.all([
      supabase.from("skills").select("*").order("display_order"),
      supabase
        .from("user_plan_items")
        .select("*")
        .eq("user_id", userId)
        .eq("is_hidden", false)
        .eq("source", source),
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
  const recentCutoff = dateDaysAgo(29);
  const recentPracticedSkillCount = new Set(
    logs
      .filter((log) => log.completed && log.date >= recentCutoff)
      .map((log) => log.skill_id),
  ).size;

  return {
    skills,
    planBySkillId,
    logs,
    calendar,
    currentStreak: computeCurrentStreak(calendar),
    bestStreak: computeBestStreak(calendar),
    recentPracticedSkillCount,
    planProgressByDiscipline: await getPlanProgressByDiscipline(
      profile,
      skills,
      planBySkillId,
      logs,
    ),
  };
}

async function getPlanProgressByDiscipline(
  profile: UserProfile,
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
  logs: PracticeLog[],
): Promise<ProgressData["planProgressByDiscipline"]> {
  if (profile.plan_mode === "custom") {
    const result: ProgressData["planProgressByDiscipline"] = {};
    for (const discipline of activeDisciplines(profile.assigned_level_taichi)) {
      const requiredSkills = skills.filter(
        (skill) => skill.discipline === discipline && planBySkillId.has(skill.id),
      );
      if (requiredSkills.length === 0) continue;
      result[discipline] = computePlanProgress({
        discipline,
        mode: "custom",
        title: "Selezione personalizzata",
        requiredSkills,
        planBySkillId,
        logs,
      });
    }
    return result;
  }

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

  const result: ProgressData["planProgressByDiscipline"] = {};
  for (const examRef of examRefs) {
    const reqIds = reqsByExamId.get(examRef.id) ?? new Set<string>();
    const requiredSkills = skills.filter((skill) => reqIds.has(skill.id));
    if (requiredSkills.length === 0) continue;

    result[examRef.discipline] = computePlanProgress({
      discipline: examRef.discipline,
      mode: "exam",
      title: examsById.get(examRef.id)?.level_name ?? "Esame",
      requiredSkills,
      planBySkillId,
      logs,
    });
  }

  return result;
}

function activeDisciplines(taichiLevel: number): Discipline[] {
  return taichiLevel > 0 ? ["shaolin", "taichi"] : ["shaolin"];
}
