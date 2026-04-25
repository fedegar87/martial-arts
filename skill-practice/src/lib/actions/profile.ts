"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string } | { success: true } | null;

export async function updateProfileGrades(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const shaolin = Number(formData.get("assignedLevelShaolin"));
  const taichi = Number(formData.get("assignedLevelTaichi"));

  if (!Number.isFinite(shaolin) || !Number.isFinite(taichi)) {
    return { error: "Grado non valido" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      assigned_level_shaolin: shaolin,
      assigned_level_taichi: taichi,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/today");
  revalidatePath("/library");
  return { success: true };
}
