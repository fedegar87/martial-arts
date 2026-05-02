"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDateKey, addDaysToDateKey } from "@/lib/date";
import type { Discipline, PlanMode } from "@/lib/types";

type FormState = { error: string } | { success: true } | null;
type ExamDisciplineScope = "both" | Discipline;

const ALL_DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export async function setupTrainingSchedule(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Non autenticato." };

  const weekdaysRaw = formData.getAll("weekdays").map((v) => Number(v));
  const cadenceWeeks = Number(formData.get("cadence_weeks"));
  const repsPerForm = Number(formData.get("reps_per_form"));
  const durationWeeks = Number(formData.get("duration_weeks"));
  const examScope = parseExamScope(formData.get("exam_discipline_scope"));

  const weekdays = weekdaysRaw.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  if (weekdays.length !== weekdaysRaw.length) {
    return { error: "Giorni non validi." };
  }
  if (weekdays.length === 0) return { error: "Seleziona almeno un giorno." };
  if (![1, 2, 4].includes(cadenceWeeks)) return { error: "Cadenza non valida." };
  if (!Number.isInteger(repsPerForm) || repsPerForm < 1 || repsPerForm > 10) {
    return { error: "Ripetizioni fuori range (1-10)." };
  }
  if (![4, 8, 12, 24].includes(durationWeeks)) return { error: "Durata non valida." };
  if (!examScope) return { error: "Ambito esame non valido." };

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("plan_mode")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: "Profilo non trovato." };

  const planMode = (profileData as { plan_mode: PlanMode }).plan_mode;
  const examDisciplines =
    planMode === "exam"
      ? await validateExamDisciplines(supabase, auth.user.id, examScope)
      : ALL_DISCIPLINES;

  if ("error" in examDisciplines) return examDisciplines;

  const startDate = localDateKey();
  const endDate = addDaysToDateKey(startDate, durationWeeks * 7);

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
  revalidatePath("/sessions/calendar");
  redirect("/today");
}

function parseExamScope(value: FormDataEntryValue | null): ExamDisciplineScope | null {
  const raw = String(value ?? "both");
  if (raw === "both" || raw === "shaolin" || raw === "taichi") return raw;
  return null;
}

async function validateExamDisciplines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  scope: ExamDisciplineScope,
): Promise<Discipline[] | { error: string }> {
  const { data, error } = await supabase
    .from("user_plan_items")
    .select("skill:skills(discipline)")
    .eq("user_id", userId)
    .eq("source", "exam_program")
    .eq("is_hidden", false);

  if (error) return { error: error.message };

  const rows = (data ?? []) as unknown as Array<{
    skill: { discipline: Discipline } | Array<{ discipline: Discipline }> | null;
  }>;
  const available = new Set<Discipline>();
  for (const row of rows) {
    const skill = Array.isArray(row.skill) ? row.skill[0] : row.skill;
    if (skill?.discipline) available.add(skill.discipline);
  }

  if (available.size === 0) {
    return { error: "Nessun contenuto nel programma esame attivo." };
  }

  const selected =
    scope === "both"
      ? ALL_DISCIPLINES.filter((discipline) => available.has(discipline))
      : [scope];

  if (selected.length === 0) {
    return { error: "Seleziona almeno una disciplina da allenare." };
  }

  if (selected.some((discipline) => !available.has(discipline))) {
    return { error: "La disciplina selezionata non è nel programma esame attivo." };
  }

  return selected;
}
