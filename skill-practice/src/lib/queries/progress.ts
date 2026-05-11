import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  buildPracticeCalendar,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
  type PracticeDay,
} from "@/lib/progress-logic";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ItemWithSkill,
} from "@/lib/session-scheduler";
import { buildSessionPeriodProgress } from "@/lib/session-progress";
import { dateKeyDaysAgo, localDateKey } from "@/lib/date";
import type {
  Discipline,
  PracticeLog,
  SkillCategory,
  TrainingSchedule,
  UserProfile,
} from "@/lib/types";

export type { PracticeDay } from "@/lib/progress-logic";

export type GeneralProgress = {
  practicedDaysTotal: number;
  currentStreak: number;
};

export type ActiveCycleProgress = {
  periodLabel: string;
  respectedUntilToday: number;
  dueUntilToday: number;
  respectedTotal: number;
  sessionTotal: number;
};

export type TopPracticedSkill = {
  skillId: string;
  skillName: string;
  skillNameItalian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practiceDays: number;
  lastPracticedDate: string;
};

export async function getGeneralProgress(userId: string): Promise<GeneralProgress> {
  const supabase = await createClient();
  const [daysResult, streakResult] = await Promise.all([
    supabase.rpc("count_practice_days", { p_user_id: userId }),
    supabase.rpc("current_practice_streak", { p_user_id: userId }),
  ]);

  if (daysResult.error) {
    throw new Error(`Errore in count_practice_days: ${daysResult.error.message}`);
  }
  if (streakResult.error) {
    throw new Error(`Errore in current_practice_streak: ${streakResult.error.message}`);
  }

  return {
    practicedDaysTotal: (daysResult.data as number | null) ?? 0,
    currentStreak: (streakResult.data as number | null) ?? 0,
  };
}

export async function getPracticeCalendarDays(userId: string): Promise<PracticeDay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", dateKeyDaysAgo(89))
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Errore nel caricamento di practice_logs recenti: ${error.message}`);
  }

  return buildPracticeCalendar((data as PracticeLog[] | null) ?? []);
}

export async function getActiveCycleProgress(
  userId: string,
  profile: UserProfile,
): Promise<ActiveCycleProgress | null> {
  const supabase = await createClient();
  const { data: scheduleRow } = await supabase
    .from("training_schedule")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const schedule = scheduleRow as TrainingSchedule | null;
  const todayKey = localDateKey();
  if (!schedule || todayKey < schedule.start_date || todayKey > schedule.end_date) {
    return null;
  }

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

  if (logsResult.error) {
    throw new Error(`Errore nel caricamento di practice_logs ciclo: ${logsResult.error.message}`);
  }
  if (planItemsResult.error) {
    throw new Error(`Errore nel caricamento di user_plan_items: ${planItemsResult.error.message}`);
  }

  const logs = (logsResult.data as PracticeLog[] | null) ?? [];
  const planItems = ((planItemsResult.data as ItemWithSkill[] | null) ?? []).filter(
    (item) => item.skill,
  );
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

  return {
    periodLabel: `${fmtDate(schedule.start_date)} - ${fmtDate(schedule.end_date)}`,
    respectedUntilToday: countRespectedSessionsUpTo(summary.rows, todayKey),
    dueUntilToday: countSessionsUpTo(summary.rows, todayKey),
    respectedTotal: summary.sessionCompleted,
    sessionTotal: summary.sessionTotal,
  };
}

type TopPracticedSkillRow = {
  skill_id: string;
  skill_name: string;
  skill_name_italian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practice_days: number;
  last_practiced_date: string;
};

export async function getTopPracticedSkills(
  userId: string,
  limit = 5,
): Promise<TopPracticedSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("top_practiced_skills", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Errore in top_practiced_skills: ${error.message}`);
  }

  return ((data ?? []) as TopPracticedSkillRow[]).map((row) => ({
    skillId: row.skill_id,
    skillName: row.skill_name,
    skillNameItalian: row.skill_name_italian,
    discipline: row.discipline,
    category: row.category,
    practiceDays: row.practice_days,
    lastPracticedDate: row.last_practiced_date,
  }));
}

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
