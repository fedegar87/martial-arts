import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  const cookieStore = await cookies();

  if (!cookieStore.has(PASSWORD_UPDATE_COOKIE)) {
    redirect("/login?error=link_invalid");
  }

  return <UpdatePasswordForm />;
}
