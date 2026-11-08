import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { createClient } from "@/lib/supabase/server";
import { verifyPasswordUpdateGrant } from "@/lib/password-update-grant";

export default async function UpdatePasswordPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (
    error ||
    !data ||
    !verifyPasswordUpdateGrant(
      cookieStore.get(PASSWORD_UPDATE_COOKIE)?.value,
      data.claims,
    )
  ) {
    redirect("/login?error=link_invalid");
  }

  return <UpdatePasswordForm />;
}
