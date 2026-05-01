import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.preparing_exam_id || profile.preparing_exam_taichi_id) {
    redirect("/today");
  }

  const exams = await listExamProgramsForSchool(profile.school_id);

  return <OnboardingForm exams={exams} displayName={profile.display_name} />;
}
