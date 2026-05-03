import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AccountDeletionRequest = {
  id: string;
  user_id: string;
  status: "pending" | "resolved" | "cancelled";
  requested_at: string;
  resolved_at: string | null;
  note: string | null;
};

export async function getPendingAccountDeletionRequest(
  userId: string,
): Promise<AccountDeletionRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("account_deletion_requests")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as AccountDeletionRequest | null) ?? null;
}
