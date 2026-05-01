import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { isProfileOnboarded } from "@/lib/onboarding-state";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (isProfileOnboarded(profile)) {
    redirect("/hub");
  }

  const exams = await listExamProgramsForSchool(profile.school_id);

  return <OnboardingForm exams={exams} displayName={profile.display_name} />;
}
