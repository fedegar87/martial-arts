"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { localDateKey } from "@/lib/date";
import {
  getScheduledPlanItems,
  getScheduledSession,
  type ItemWithSkill,
} from "@/lib/session-scheduler";
import type { PlanMode, PracticeLog, TrainingSchedule } from "@/lib/types";

export type JournalActionState = { error: string } | { success: true };

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ScheduleContext = {
  schedule: TrainingSchedule | null;
  isScheduled: boolean;
  repsPerForm: number;
};

export async function setPracticeCompletionForDate(
  skillId: string,
  dateKey: string,
  completed: boolean,
): Promise<JournalActionState> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return { error: "Sessione scaduta" };

  const dateError = validateMutableDateKey(dateKey);
  if (dateError) return { error: dateError };

  const scheduleContext = await getScheduleContext(supabase, userId, skillId, dateKey);
  if ("error" in scheduleContext) return scheduleContext;

  if (completed) {
    const { error } = await supabase.from("practice_logs").upsert(
      {
        user_id: userId,
        skill_id: skillId,
        date: dateKey,
        completed: true,
        reps_target: scheduleContext.repsPerForm,
        reps_done: scheduleContext.repsPerForm,
      },
      { onConflict: "user_id,skill_id,date" },
    );
    if (error) return { error: error.message };

    const rpcError = await updateLastPracticedAt(supabase, skillId, dateKey);
    if (rpcError) return { error: rpcError };
  } else {
    const { data: existing, error: selectError } = await supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("skill_id", skillId)
      .eq("date", dateKey)
      .maybeSingle();

    if (selectError) return { error: selectError.message };
    if (existing) {
      const neutralizeError = await neutralizeOrDeleteLog(
        supabase,
        userId,
        existing as PracticeLog,
      );
      if (neutralizeError) return { error: neutralizeError };
    }
  }

  revalidateJournalPaths(dateKey);
  return { success: true };
}

export async function addFreePracticeForDate(
  skillId: string,
  dateKey: string,
): Promise<JournalActionState> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return { error: "Sessione scaduta" };

  const dateError = validateMutableDateKey(dateKey);
  if (dateError) return { error: dateError };

  const scheduleContext = await getScheduleContext(supabase, userId, skillId, dateKey);
  if ("error" in scheduleContext) return scheduleContext;

  if (scheduleContext.isScheduled) {
    return setPracticeCompletionForDate(skillId, dateKey, true);
  }

  const { error } = await supabase.from("practice_logs").upsert(
    {
      user_id: userId,
      skill_id: skillId,
      date: dateKey,
      completed: true,
      reps_target: null,
      reps_done: 0,
    },
    { onConflict: "user_id,skill_id,date" },
  );
  if (error) return { error: error.message };

  const rpcError = await updateLastPracticedAt(supabase, skillId, dateKey);
  if (rpcError) return { error: rpcError };

  revalidateJournalPaths(dateKey);
  return { success: true };
}

export async function removeFreePracticeForDate(
  skillId: string,
  dateKey: string,
): Promise<JournalActionState> {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return { error: "Sessione scaduta" };

  const dateError = validateMutableDateKey(dateKey);
  if (dateError) return { error: dateError };

  const scheduleContext = await getScheduleContext(supabase, userId, skillId, dateKey);
  if ("error" in scheduleContext) return scheduleContext;

  if (scheduleContext.isScheduled) {
    return { error: "Questa pratica appartiene alla sessione programmata." };
  }

  const { data: existing, error: selectError } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .eq("date", dateKey)
    .maybeSingle();

  if (selectError) return { error: selectError.message };
  if (existing) {
    const neutralizeError = await neutralizeOrDeleteLog(
      supabase,
      userId,
      existing as PracticeLog,
    );
    if (neutralizeError) return { error: neutralizeError };
  }

  revalidateJournalPaths(dateKey);
  return { success: true };
}

async function getAuthenticatedUserId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getScheduleContext(
  supabase: SupabaseClient,
  userId: string,
  skillId: string,
  dateKey: string,
): Promise<ScheduleContext | { error: string }> {
  const [{ data: scheduleData }, { data: profileData, error: profileError }] =
    await Promise.all([
      supabase
        .from("training_schedule")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_profiles")
        .select("plan_mode")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  if (profileError) return { error: profileError.message };

  const schedule = (scheduleData as TrainingSchedule | null) ?? null;
  const repsPerForm = schedule?.reps_per_form ?? 1;

  if (!schedule || !profileData) {
    return { schedule, isScheduled: false, repsPerForm };
  }

  const planMode = (profileData as { plan_mode: PlanMode }).plan_mode;
  const source = planMode === "custom" ? "manual" : "exam_program";
  const { data: itemsData, error: itemsError } = await supabase
    .from("user_plan_items")
    .select("*, skill:skills(*)")
    .eq("user_id", userId)
    .eq("is_hidden", false)
    .eq("source", source);

  if (itemsError) return { error: itemsError.message };

  const scheduledItems = getScheduledPlanItems(
    ((itemsData ?? []) as ItemWithSkill[]).filter((item) => item.skill),
    schedule,
    planMode,
  );
  const session = getScheduledSession(dateKey, schedule, scheduledItems);
  const isScheduled =
    session.kind === "training" &&
    [...session.focus, ...session.maintenance].some(
      (item) => item.skill_id === skillId,
    );

  return { schedule, isScheduled, repsPerForm };
}

async function neutralizeOrDeleteLog(
  supabase: SupabaseClient,
  userId: string,
  log: PracticeLog,
): Promise<string | null> {
  if ((log.personal_note?.trim().length ?? 0) === 0) {
    const { error } = await supabase
      .from("practice_logs")
      .delete()
      .eq("id", log.id)
      .eq("user_id", userId);
    return error?.message ?? null;
  }

  const { error } = await supabase
    .from("practice_logs")
    .update({ completed: false, reps_done: 0 })
    .eq("id", log.id)
    .eq("user_id", userId);
  return error?.message ?? null;
}

async function updateLastPracticedAt(
  supabase: SupabaseClient,
  skillId: string,
  dateKey: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("update_plan_item_last_practiced_at", {
    target_skill_id: skillId,
    practiced_at: `${dateKey}T12:00:00.000Z`,
  });
  return error?.message ?? null;
}

function validateMutableDateKey(dateKey: string): string | null {
  if (!isValidDateKey(dateKey)) return "Data non valida";
  if (dateKey > localDateKey()) return "Non puoi segnare giorni futuri";
  return null;
}

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function revalidateJournalPaths(dateKey: string): void {
  revalidatePath("/journal");
  revalidatePath("/progress");
  if (dateKey === localDateKey()) revalidatePath("/today");
}
