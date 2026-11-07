"use server";
import { getTranslations } from "next-intl/server";

import { SHAOLIN_GRADES, TAICHI_GRADES, nextGradeValue } from "@/lib/grades";
import { createClient } from "@/lib/supabase/server";
import type { Discipline } from "@/lib/types";
import { revalidatePath } from "next/cache";

export type ProfileFormState = { error: string } | { success: true } | null;

export async function updateProfileGrade(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  const discipline = String(formData.get("discipline") ?? "") as Discipline;
  const assignedLevel = Number(formData.get("assignedLevel"));

  if (discipline !== "shaolin" && discipline !== "taichi") {
    return { error: tr("invalidDiscipline") };
  }

  if (!Number.isFinite(assignedLevel)) {
    return { error: tr("invalidGrade") };
  }

  const validGrades = discipline === "shaolin" ? SHAOLIN_GRADES : TAICHI_GRADES;
  if (!validGrades.some((grade) => grade.value === assignedLevel)) {
    return { error: tr("invalidGrade") };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select(
      "assigned_level_shaolin, assigned_level_taichi, school_id, profile_locked",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: tr("profileNotFound") };

  const profileRow = profileData as {
    assigned_level_shaolin: number;
    assigned_level_taichi: number;
    school_id: string;
    profile_locked: boolean;
  };

  if (profileRow.profile_locked) {
    return { error: tr("profileManaged") };
  }
  const currentLevel =
    discipline === "shaolin"
      ? profileRow.assigned_level_shaolin
      : profileRow.assigned_level_taichi;
  const gradeChanged = currentLevel !== assignedLevel;

  const updates: Record<string, unknown> =
    discipline === "shaolin"
      ? { assigned_level_shaolin: assignedLevel }
      : { assigned_level_taichi: assignedLevel };

  if (gradeChanged) {
    const nextExamId =
      discipline === "taichi" && assignedLevel === 0
        ? null
        : await findExamForNextGrade(
            supabase,
            profileRow.school_id,
            discipline,
            assignedLevel,
          );
    if (discipline === "shaolin") {
      updates.preparing_exam_id = nextExamId;
    } else {
      updates.preparing_exam_taichi_id = nextExamId;
    }
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  if (gradeChanged || (discipline === "taichi" && assignedLevel === 0)) {
    await removePlanItemsForDiscipline(
      supabase,
      user.id,
      discipline,
      discipline === "taichi" && assignedLevel === 0
        ? undefined
        : "exam_program",
    );
  }

  revalidatePath("/profile");
  revalidatePath("/today");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/plan/exam");
  revalidatePath("/progress");
  return { success: true };
}

async function findExamForNextGrade(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  discipline: Discipline,
  currentGrade: number,
): Promise<string | null> {
  const next = nextGradeValue(currentGrade);
  if (next === null) return null;

  const { data } = await supabase
    .from("exam_programs")
    .select("id")
    .eq("school_id", schoolId)
    .eq("discipline", discipline)
    .eq("grade_value", next)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}

async function removePlanItemsForDiscipline(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  discipline: Discipline,
  source?: "exam_program",
) {
  const { data: skills } = await supabase
    .from("skills")
    .select("id")
    .eq("discipline", discipline);

  const skillIds = ((skills ?? []) as Array<{ id: string }>).map(
    (skill) => skill.id,
  );
  if (skillIds.length === 0) return;

  let query = supabase
    .from("user_plan_items")
    .delete()
    .eq("user_id", userId)
    .in("skill_id", skillIds);

  if (source) {
    query = query.eq("source", source);
  }

  await query;
}
