import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (!profile.preparing_exam_id) redirect("/onboarding");
  redirect("/today");
}
