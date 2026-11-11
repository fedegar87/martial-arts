import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CustomProgram } from "@/lib/types";

export const listCustomPrograms = cache(async (userId: string): Promise<CustomProgram[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("custom_programs")
    .select("*").eq("user_id", userId).order("created_at").order("id");
  if (error) throw new Error("Impossibile caricare i programmi personali", { cause: error });
  return (data ?? []) as CustomProgram[];
});

export async function getCustomProgram(userId: string, id: string): Promise<CustomProgram | null> {
  const programs = await listCustomPrograms(userId);
  return programs.find((program) => program.id === id) ?? null;
}

export const getActiveCustomProgramId = cache(async (userId: string): Promise<string | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_profiles")
    .select("active_custom_program_id").eq("id", userId).maybeSingle();
  if (error) throw new Error("Impossibile caricare il programma personale attivo", { cause: error });
  return data?.active_custom_program_id ?? null;
});
