"use server";

import { createClient } from "@/lib/supabase/server";
import { localDateKey } from "@/lib/date";
import { revalidatePath } from "next/cache";

export type PracticeFormState = { error: string } | { success: true } | null;

export async function markPracticeDone(
  skillId: string,
  note?: string,
): Promise<PracticeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const today = localDateKey();
  const now = new Date().toISOString();

  const { error: logError } = await supabase.from("practice_logs").insert({
    user_id: user.id,
    skill_id: skillId,
    date: today,
    completed: true,
    personal_note: normalizeNote(note),
  });
  if (logError) return { error: logError.message };

  const { error: planError } = await supabase
    .from("user_plan_items")
    .update({ last_practiced_at: now })
    .eq("user_id", user.id)
    .eq("skill_id", skillId);
  if (planError) return { error: planError.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}

export async function savePracticeNote(
  skillId: string,
  note: string,
): Promise<PracticeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const today = localDateKey();
  const normalizedNote = normalizeNote(note);

  const { data: latestLog, error: selectError } = await supabase
    .from("practice_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  if (!latestLog) {
    const { error } = await supabase.from("practice_logs").insert({
      user_id: user.id,
      skill_id: skillId,
      date: today,
      completed: true,
      personal_note: normalizedNote,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("practice_logs")
      .update({ personal_note: normalizedNote })
      .eq("id", (latestLog as { id: string }).id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}

export async function incrementRep(skillId: string): Promise<PracticeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const dateKey = localDateKey();

  const { data: scheduleRow } = await supabase
    .from("training_schedule")
    .select("reps_per_form")
    .eq("user_id", user.id)
    .maybeSingle();
  const target = (scheduleRow as { reps_per_form: number } | null)?.reps_per_form ?? 1;

  const { data: existing, error: selectError } = await supabase
    .from("practice_logs")
    .select("id, reps_done, reps_target")
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .eq("date", dateKey)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  if (existing) {
    const row = existing as { id: string; reps_done: number; reps_target: number | null };
    const effectiveTarget = row.reps_target ?? target;
    const newDone = Math.min(row.reps_done + 1, effectiveTarget);
    const { error } = await supabase
      .from("practice_logs")
      .update({
        reps_done: newDone,
        completed: newDone >= effectiveTarget,
      })
      .eq("id", row.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("practice_logs").insert({
      user_id: user.id,
      skill_id: skillId,
      date: dateKey,
      reps_target: target,
      reps_done: 1,
      completed: 1 >= target,
    });
    if (error) return { error: error.message };
  }

  await supabase
    .from("user_plan_items")
    .update({ last_practiced_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("skill_id", skillId);

  revalidatePath("/today");
  return { success: true };
}

export async function decrementRep(skillId: string): Promise<PracticeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const dateKey = localDateKey();

  const { data: existing, error: selectError } = await supabase
    .from("practice_logs")
    .select("id, reps_done, reps_target")
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .eq("date", dateKey)
    .maybeSingle();

  if (selectError) return { error: selectError.message };
  if (!existing) {
    revalidatePath("/today");
    return { success: true };
  }

  const row = existing as { id: string; reps_done: number; reps_target: number | null };
  const newDone = Math.max(0, row.reps_done - 1);
  const { error } = await supabase
    .from("practice_logs")
    .update({
      reps_done: newDone,
      completed: row.reps_target !== null && newDone >= row.reps_target,
    })
    .eq("id", row.id);
  if (error) return { error: error.message };

  revalidatePath("/today");
  return { success: true };
}

function normalizeNote(note?: string): string | null {
  const trimmed = note?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
