import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  activePlanSource,
  buildPracticeCalendar,
  computeBestStreakFromLogs,
  computePlanProgress,
  computeCurrentStreakFromLogs,
  countGlobalFormReps,
  countPracticedSkills,
  countPracticeDays,
  dateDaysAgo,
  type PracticeActivityLog,
  type PlanProgressSummary,
  type PracticeDay,
} from "@/lib/progress-logic";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ItemWithSkill,
} from "@/lib/session-scheduler";
import { buildSessionPeriodProgress, type SessionPeriodProgress } from "@/lib/session-progress";
import { addDaysToDateKey, localDateKey } from "@/lib/date";
import type {
  Discipline,
  PlanStatus,
  PracticeLog,
  Skill,
  TrainingSchedule,
  UserProfile,
} from "@/lib/types";

export {
  buildCurriculumCells,
  type CurriculumCell,
  type PlanProgressSummary as PlanProgressInfo,
  type PracticeDay,
} from "@/lib/progress-logic";

export type ProgressData = {
  skills: Skill[];
  planBySkillId: Map<string, PlanStatus>;
  generalProgress: GeneralProgress;
  activeCycleProgress: ActiveCycleProgress | null;
  planProgressByDiscipline: Partial<Record<Discipline, PlanProgressSummary>>;
};

export type GeneralProgress = {
  calendar: PracticeDay[];
  currentStreak: number;
  bestStreak: number;
  practicedDays30: number;
  practicedDaysTotal: number;
  practicedSkillCount30: number;
  practicedSkillCountTotal: number;
  globalFormReps: number;
};

export type ActiveCycleProgress = {
  startDate: string;
  endDate: string;
  todayKey: string;
  periodLabel: string;
  daysRemaining: number;
  nextTrainingDate: string | null;
  summary: SessionPeriodProgress;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();
  const source = activePlanSource(profile.plan_mode);

  const [
    skillsResult,
    planResult,
    recentLogsResult,
    activityLogsResult,
    repLogsResult,
    scheduleResult,
  ] = await Promise.all([
    supabase.from("skills").select("*").order("display_order"),
    supabase
      .from("user_plan_items")
      .select("*, skill:skills(*)")
      .eq("user_id", userId)
      .eq("is_hidden", false)
      .eq("source", source),
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", dateDaysAgo(89))
      .order("date", { ascending: true }),
    supabase
      .from("practice_logs")
      .select("date, skill_id, completed, reps_done")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
    supabase
      .from("practice_logs")
      .select("skill_id, reps_done")
      .eq("user_id", userId)
      .gt("reps_done", 0),
    supabase
      .from("training_schedule")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const skills = expectData<Skill[]>(skillsResult, "skills") ?? [];
  const planItems = (expectData<ItemWithSkill[]>(planResult, "user_plan_items") ?? [])
    .filter((item) => item.skill);
  const recentLogs = expectData<PracticeLog[]>(recentLogsResult, "practice_logs recenti") ?? [];
  const activityLogs =
    expectData<PracticeActivityLog[]>(activityLogsResult, "practice_logs storici") ?? [];
  const repLogs =
    expectData<Array<{ skill_id: string; reps_done: number | null }>>(
      repLogsResult,
      "practice_logs ripetizioni",
    ) ?? [];
  const schedule = expectMaybeData<TrainingSchedule>(
    scheduleResult,
    "training_schedule",
  );
  const planBySkillId = new Map(
    planItems.map((row) => [row.skill_id, row.status] as const),
  );
  const globalFormReps = countGlobalFormReps(skills, repLogs);
  const calendar = buildPracticeCalendar(recentLogs);
  const recentCutoff = dateDaysAgo(29);
  const recentActivityLogs = activityLogs.filter((log) => log.date >= recentCutoff);

  return {
    skills,
    planBySkillId,
    generalProgress: {
      calendar,
      currentStreak: computeCurrentStreakFromLogs(activityLogs),
      bestStreak: computeBestStreakFromLogs(activityLogs),
      practicedDays30: countPracticeDays(recentActivityLogs),
      practicedDaysTotal: countPracticeDays(activityLogs),
      practicedSkillCount30: countPracticedSkills(recentActivityLogs),
      practicedSkillCountTotal: countPracticedSkills(activityLogs),
      globalFormReps,
    },
    activeCycleProgress: await getActiveCycleProgress({
      userId,
      profile,
      schedule,
      planItems,
    }),
    planProgressByDiscipline: await getPlanProgressByDiscipline(
      profile,
      skills,
      planBySkillId,
      activityLogs,
    ),
  };
}

async function getPlanProgressByDiscipline(
  profile: UserProfile,
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
  logs: PracticeActivityLog[],
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
        title: "Selezione personale",
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

async function getActiveCycleProgress({
  userId,
  profile,
  schedule,
  planItems,
}: {
  userId: string;
  profile: UserProfile;
  schedule: TrainingSchedule | null;
  planItems: ItemWithSkill[];
}): Promise<ActiveCycleProgress | null> {
  const todayKey = localDateKey();
  if (!schedule || todayKey < schedule.start_date || todayKey > schedule.end_date) {
    return null;
  }

  const supabase = await createClient();
  const logsResult = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", schedule.start_date)
    .lte("date", schedule.end_date)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });
  const logs = expectData<PracticeLog[]>(logsResult, "practice_logs ciclo") ?? [];
  const scheduledItems = getScheduledPlanItems(planItems, schedule, profile.plan_mode);
  const rows = listSessionsInRange(schedule.start_date, schedule.end_date, schedule, scheduledItems);
  const summary = buildSessionPeriodProgress({
    rows,
    logs,
    from: schedule.start_date,
    to: schedule.end_date,
    repsPerForm: schedule.reps_per_form,
  });
  const nextTrainingDate =
    rows.find((row) => row.date >= todayKey && row.session.kind === "training")?.date ??
    null;

  return {
    startDate: schedule.start_date,
    endDate: schedule.end_date,
    todayKey,
    periodLabel: `${fmtDate(schedule.start_date)} - ${fmtDate(schedule.end_date)}`,
    daysRemaining: Math.max(0, daysBetween(todayKey, schedule.end_date)),
    nextTrainingDate,
    summary,
  };
}

function activeDisciplines(taichiLevel: number): Discipline[] {
  return taichiLevel > 0 ? ["shaolin", "taichi"] : ["shaolin"];
}

function expectData<T>(
  result: { data: unknown; error: { message: string } | null },
  label: string,
): T | null {
  if (result.error) {
    throw new Error(`Errore nel caricamento di ${label}: ${result.error.message}`);
  }
  return result.data as T | null;
}

function expectMaybeData<T>(
  result: { data: unknown; error: { message: string; code?: string } | null },
  label: string,
): T | null {
  if (result.error) {
    throw new Error(`Errore nel caricamento di ${label}: ${result.error.message}`);
  }
  return result.data as T | null;
}

function daysBetween(from: string, to: string): number {
  let days = 0;
  let cursor = from;
  while (cursor < to) {
    days += 1;
    cursor = addDaysToDateKey(cursor, 1);
  }
  return days;
}

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
