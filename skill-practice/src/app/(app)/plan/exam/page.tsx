import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { ExamModeForm } from "@/components/plan/ExamModeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nextGradeValue } from "@/lib/grades";
import type { ExamProgram } from "@/lib/types";

export default async function PlanExamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [allShaolinExams, allTaichiExams] = await Promise.all([
    listExamProgramsForSchool(profile.school_id, "shaolin"),
    listExamProgramsForSchool(profile.school_id, "taichi"),
  ]);
  const shaolinExams = nextExamCandidates(
    allShaolinExams,
    profile.assigned_level_shaolin,
  );
  const taichiExams = nextExamCandidates(
    allTaichiExams,
    profile.assigned_level_taichi,
  );

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
            selectedShaolinId={selectedExamId(
              shaolinExams,
              profile.preparing_exam_id,
            )}
            selectedTaichiId={selectedExamId(
              taichiExams,
              profile.preparing_exam_taichi_id,
            )}
            showTaichi={profile.assigned_level_taichi > 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function nextExamCandidates(
  exams: ExamProgram[],
  currentGrade: number,
): ExamProgram[] {
  const nextGrade = nextGradeValue(currentGrade);
  if (nextGrade === null) return [];
  return exams.filter((exam) => exam.grade_value === nextGrade);
}

function selectedExamId(
  exams: ExamProgram[],
  selectedId: string | null,
): string | null {
  if (!selectedId) return null;
  return exams.some((exam) => exam.id === selectedId) ? selectedId : null;
}
