"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccountFormState = { error: string } | { success: string } | null;

export async function requestAccountDeletion(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const confirmed = formData.get("confirmDeletionRequest") === "on";
  if (!confirmed) {
    return {
      error:
        "Conferma di aver capito che la richiesta verra gestita dalla scuola.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta." };

  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({ user_id: user.id, status: "pending" });

  if (error) {
    if (error.code === "23505") {
      return { success: "Hai gia una richiesta di cancellazione in attesa." };
    }
    return { error: error.message };
  }

  revalidatePath("/profile");
  return {
    success:
      "Richiesta registrata. Un amministratore dovra completare la cancellazione.",
  };
}
