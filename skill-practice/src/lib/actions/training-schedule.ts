"use server";
import { getTranslations } from "next-intl/server";

import { addDaysToDateKey, localDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import type { Discipline, PlanMode } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type FormState = { error: string } | { success: true } | null;
type ExamDisciplineScope = "both" | Discipline;

const ALL_DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export async function setupTrainingSchedule(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: tr("unauthenticated") };

  const weekdaysRaw = formData.getAll("weekdays").map((v) => Number(v));
  const cadenceWeeks = Number(formData.get("cadence_weeks"));
  const repsPerForm = Number(formData.get("reps_per_form"));
  const durationWeeks = Number(formData.get("duration_weeks"));
  const examScope = parseExamScope(formData.get("exam_discipline_scope"));

  const weekdays = weekdaysRaw.filter(
    (n) => Number.isInteger(n) && n >= 1 && n <= 7,
  );
  if (weekdays.length !== weekdaysRaw.length) {
    return { error: tr("invalidDays") };
  }
  if (weekdays.length === 0) return { error: tr("selectDay") };
  if (![1, 2, 4].includes(cadenceWeeks)) return { error: tr("invalidCadence") };
  if (!Number.isInteger(repsPerForm) || repsPerForm < 1 || repsPerForm > 10) {
    return { error: tr("repsOutOfRange") };
  }
  if (![4, 8, 12, 24].includes(durationWeeks))
    return { error: tr("invalidDuration") };
  if (!examScope) return { error: tr("invalidExamScope") };

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("plan_mode")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: tr("profileNotFoundPeriod") };

  const planMode = (profileData as { plan_mode: PlanMode }).plan_mode;
  const examDisciplines =
    planMode === "exam"
      ? await validateExamDisciplines(supabase, auth.user.id, examScope)
      : ALL_DISCIPLINES;

  if ("error" in examDisciplines) return examDisciplines;

  const startDate = localDateKey();
  // end_date inclusivo: N settimane = N*7 giorni a partire dal giorno 0 (start incluso),
  // quindi l'ultimo giorno e start + (N*7 - 1). Senza il -1 si aggiunge una sessione extra.
  const endDate = addDaysToDateKey(startDate, durationWeeks * 7 - 1);

  const { error } = await supabase.from("training_schedule").upsert({
    user_id: auth.user.id,
    weekdays: Array.from(new Set(weekdays)).sort((a, b) => a - b),
    cadence_weeks: cadenceWeeks,
    reps_per_form: repsPerForm,
    exam_disciplines: examDisciplines,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/calendar");
  redirect("/today");
}

export async function resetTrainingSchedule(): Promise<
  { error: string } | { success: true }
> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: tr("unauthenticated") };

  const { error } = await supabase
    .from("training_schedule")
    .delete()
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
  return { success: true };
}

function parseExamScope(
  value: FormDataEntryValue | null,
): ExamDisciplineScope | null {
  const raw = String(value ?? "both");
  if (raw === "both" || raw === "shaolin" || raw === "taichi") return raw;
  return null;
}

async function validateExamDisciplines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  scope: ExamDisciplineScope,
): Promise<Discipline[] | { error: string }> {
  const tr = await getTranslations("ui");
  const { data, error } = await supabase
    .from("user_plan_items")
    .select("skill:skills(discipline)")
    .eq("user_id", userId)
    .eq("source", "exam_program")
    .eq("is_hidden", false);

  if (error) return { error: error.message };

  const rows = (data ?? []) as unknown as Array<{
    skill:
      { discipline: Discipline } | Array<{ discipline: Discipline }> | null;
  }>;
  const available = new Set<Discipline>();
  for (const row of rows) {
    const skill = Array.isArray(row.skill) ? row.skill[0] : row.skill;
    if (skill?.discipline) available.add(skill.discipline);
  }

  if (available.size === 0) {
    return { error: tr("emptyActiveExam") };
  }

  const selected =
    scope === "both"
      ? ALL_DISCIPLINES.filter((discipline) => available.has(discipline))
      : [scope];

  if (selected.length === 0) {
    return { error: tr("selectTrainingDiscipline") };
  }

  if (selected.some((discipline) => !available.has(discipline))) {
    return { error: tr("disciplineNotInExam") };
  }

  return selected;
}
