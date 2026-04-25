import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.plan_mode === "custom") redirect("/today");
  if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) {
    redirect("/onboarding");
  }
  redirect("/today");
}
