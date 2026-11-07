"use server";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AccountFormState = { error: string } | { success: string } | null;

export async function requestAccountDeletion(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const tr = await getTranslations("ui");
  const confirmed = formData.get("confirmDeletionRequest") === "on";
  if (!confirmed) {
    return {
      error: tr("confirmDeletionUnderstanding"),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };

  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({ user_id: user.id, status: "pending" });

  if (error) {
    if (error.code === "23505") {
      return { success: tr("alreadyPendingDeletion") };
    }
    return { error: error.message };
  }

  revalidatePath("/profile");
  return {
    success: tr("deletionRegistered"),
  };
}
