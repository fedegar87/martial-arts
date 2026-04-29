"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string } | { success: true } | null;

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

  const weekdays = weekdaysRaw.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  if (weekdays.length === 0) return { error: "Seleziona almeno un giorno." };
  if (![1, 2, 4].includes(cadenceWeeks)) return { error: "Cadenza non valida." };
  if (!(repsPerForm >= 1 && repsPerForm <= 10)) return { error: "Ripetizioni fuori range (1-10)." };
  if (![4, 8, 12, 24].includes(durationWeeks)) return { error: "Durata non valida." };

  const today = new Date();
  const startDate = today.toISOString().slice(0, 10);
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() + durationWeeks * 7);
  const endDate = end.toISOString().slice(0, 10);

  const { error } = await supabase.from("training_schedule").upsert({
    user_id: auth.user.id,
    weekdays: Array.from(new Set(weekdays)).sort((a, b) => a - b),
    cadence_weeks: cadenceWeeks,
    reps_per_form: repsPerForm,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/sessions/calendar");
  redirect("/today");
}
