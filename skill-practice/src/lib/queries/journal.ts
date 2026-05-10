import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ScheduledSession,
} from "@/lib/session-scheduler";
import { buildCalendarDayViewsInRange } from "@/lib/calendar-logic";
import { localDateKey } from "@/lib/date";
import type {
  JournalDayView,
  JournalSkill,
  PracticeLog,
  Skill,
  TrainingSchedule,
  UserProfile,
} from "@/lib/types";

export type JournalCalendarRow = { date: string; session: ScheduledSession };

export type JournalData = {
  days: JournalDayView[];
  rows: JournalCalendarRow[];
  logs: PracticeLog[];
  schedule: TrainingSchedule | null;
  repsPerForm: number;
};

type PracticeLogWithSkill = PracticeLog & {
  skill: JournalSkill | JournalSkill[] | null;
};

export async function getJournalDataInRange({
  userId,
  profile,
  from,
  to,
}: {
  userId: string;
  profile: UserProfile;
  from: string;
  to: string;
}): Promise<JournalData> {
  const supabase = await createClient();
  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [schedule, items, logsWithSkill] = await Promise.all([
    getTrainingSchedule(userId),
    getUserPlanItems(userId, undefined, sourceFilter),
    fetchMeaningfulLogsWithSkill(supabase, userId, from, to),
  ]);

  const scheduledItems = schedule
    ? getScheduledPlanItems(items, schedule, profile.plan_mode)
    : [];
  const rows = listSessionsInRange(from, to, schedule, scheduledItems);
  const skillById = new Map<string, JournalSkill>();

  for (const item of scheduledItems) {
    skillById.set(item.skill.id, toJournalSkill(item.skill));
  }

  const logs: PracticeLog[] = [];
  for (const row of logsWithSkill) {
    const { skill, ...log } = row;
    logs.push(log);
    const normalizedSkill = normalizeJoinedSkill(skill);
    if (normalizedSkill) skillById.set(normalizedSkill.id, normalizedSkill);
  }

  const repsPerForm = schedule?.reps_per_form ?? 1;

  return {
    days: buildCalendarDayViewsInRange(from, to, {
      rows,
      logs,
      skillById,
      todayKey: localDateKey(),
      repsPerForm,
      hasSchedule: schedule !== null,
      scheduleStart: schedule?.start_date ?? null,
      scheduleEnd: schedule?.end_date ?? null,
    }),
    rows,
    logs,
    schedule,
    repsPerForm,
  };
}

export async function getJournalSkillOptions(): Promise<JournalSkill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select(
      `
        id,
        name,
        name_italian,
        discipline,
        category,
        practice_mode,
        minimum_grade_value,
        display_order
      `,
    )
    .order("discipline", { ascending: true })
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (data as JournalSkill[] | null) ?? [];
}

async function fetchMeaningfulLogsWithSkill(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: string,
  to: string,
): Promise<PracticeLogWithSkill[]> {
  const { data } = await supabase
    .from("practice_logs")
    .select(
      `
        *,
        skill:skills(
          id,
          name,
          name_italian,
          discipline,
          category,
          practice_mode,
          minimum_grade_value,
          display_order
        )
      `,
    )
    .eq("user_id", userId)
    .gte("date", from)
    .lte("date", to)
    .or("completed.eq.true,reps_done.gt.0,personal_note.not.is.null")
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  return (data as PracticeLogWithSkill[] | null) ?? [];
}

function normalizeJoinedSkill(
  skill: JournalSkill | JournalSkill[] | null,
): JournalSkill | null {
  if (Array.isArray(skill)) return skill[0] ?? null;
  return skill;
}

function toJournalSkill(skill: Skill): JournalSkill {
  return {
    id: skill.id,
    name: skill.name,
    name_italian: skill.name_italian,
    discipline: skill.discipline,
    category: skill.category,
    practice_mode: skill.practice_mode,
    minimum_grade_value: skill.minimum_grade_value,
    display_order: skill.display_order,
  };
}
