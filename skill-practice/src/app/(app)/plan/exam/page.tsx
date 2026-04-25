import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { ExamModeForm } from "@/components/plan/ExamModeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlanExamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [shaolinExams, taichiExams] = await Promise.all([
    listExamProgramsForSchool(profile.school_id, "shaolin"),
    listExamProgramsForSchool(profile.school_id, "taichi"),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Programma esame</h1>
        <p className="text-muted-foreground text-sm">
          Scegli gli esami da preparare e rigenera il piano.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Esami</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamModeForm
            shaolinExams={shaolinExams}
            taichiExams={taichiExams}
            selectedShaolinId={profile.preparing_exam_id}
            selectedTaichiId={profile.preparing_exam_taichi_id}
            showTaichi={profile.assigned_level_taichi > 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
