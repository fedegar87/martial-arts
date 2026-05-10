import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  buildPracticeCalendar,
  computeCurrentStreakFromLogs,
  countPracticeDays,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
  type PracticeActivityLog,
  type PracticeDay,
} from "@/lib/progress-logic";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ItemWithSkill,
} from "@/lib/session-scheduler";
import { buildSessionPeriodProgress } from "@/lib/session-progress";
import { addDaysToDateKey, localDateKey } from "@/lib/date";
import type { PracticeLog, TrainingSchedule, UserProfile } from "@/lib/types";

export type { PracticeDay } from "@/lib/progress-logic";

export type GeneralProgress = {
  practicedDaysTotal: number;
  currentStreak: number;
  calendar: PracticeDay[];
};

export type ActiveCycleProgress = {
  periodLabel: string;
  respectedUntilToday: number;
  dueUntilToday: number;
  respectedTotal: number;
  sessionTotal: number;
};

export type ProgressData = {
  generalProgress: GeneralProgress;
  activeCycleProgress: ActiveCycleProgress | null;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();

  const [recentLogsResult, activityLogsResult, scheduleResult] = await Promise.all([
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", dateKeyDaysAgo(89))
      .order("date", { ascending: true }),
    supabase
      .from("practice_logs")
      .select("date, skill_id, completed, reps_done")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
    supabase
      .from("training_schedule")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const recentLogs = expectData<PracticeLog[]>(recentLogsResult, "practice_logs recenti") ?? [];
  const activityLogs =
    expectData<PracticeActivityLog[]>(activityLogsResult, "practice_logs storici") ?? [];
  const schedule = expectMaybeData<TrainingSchedule>(scheduleResult, "training_schedule");

  return {
    generalProgress: {
      practicedDaysTotal: countPracticeDays(activityLogs),
      currentStreak: computeCurrentStreakFromLogs(activityLogs),
      calendar: buildPracticeCalendar(recentLogs),
    },
    activeCycleProgress: await getActiveCycleProgress({ userId, profile, schedule }),
  };
}

async function getActiveCycleProgress({
  userId,
  profile,
  schedule,
}: {
  userId: string;
  profile: UserProfile;
  schedule: TrainingSchedule | null;
}): Promise<ActiveCycleProgress | null> {
  const todayKey = localDateKey();
  if (!schedule || todayKey < schedule.start_date || todayKey > schedule.end_date) {
    return null;
  }

  const supabase = await createClient();
  const [logsResult, planItemsResult] = await Promise.all([
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", schedule.start_date)
      .lte("date", schedule.end_date)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("user_plan_items")
      .select("*, skill:skills(*)")
      .eq("user_id", userId)
      .eq("is_hidden", false)
      .eq("source", profile.plan_mode === "custom" ? "manual" : "exam_program"),
  ]);

  const logs = expectData<PracticeLog[]>(logsResult, "practice_logs ciclo") ?? [];
  const planItems = (expectData<ItemWithSkill[]>(planItemsResult, "user_plan_items") ?? [])
    .filter((item) => item.skill);
  const scheduledItems = getScheduledPlanItems(planItems, schedule, profile.plan_mode);
  const rows = listSessionsInRange(
    schedule.start_date,
    schedule.end_date,
    schedule,
    scheduledItems,
  );
  const summary = buildSessionPeriodProgress({
    rows,
    logs,
    from: schedule.start_date,
    to: schedule.end_date,
    repsPerForm: schedule.reps_per_form,
  });

  const trainingRows = summary.rows.map((row) => ({ date: row.date, status: row.status }));

  return {
    periodLabel: `${fmtDate(schedule.start_date)} - ${fmtDate(schedule.end_date)}`,
    respectedUntilToday: countRespectedSessionsUpTo(trainingRows, todayKey),
    dueUntilToday: countSessionsUpTo(trainingRows, todayKey),
    respectedTotal: summary.sessionCompleted,
    sessionTotal: summary.sessionTotal,
  };
}

function dateKeyDaysAgo(days: number, today = new Date()): string {
  return addDaysToDateKey(localDateKey(today), -days);
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

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
