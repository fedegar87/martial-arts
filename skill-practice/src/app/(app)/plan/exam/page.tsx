import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { ExamModeForm } from "@/components/plan/ExamModeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isSelectableExamGrade,
  minimumSelectableExamGradeValue,
} from "@/lib/grades";
import type { ExamProgram } from "@/lib/types";

export default async function PlanExamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [allShaolinExams, allTaichiExams] = await Promise.all([
    listExamProgramsForSchool(profile.school_id, "shaolin"),
    listExamProgramsForSchool(profile.school_id, "taichi"),
  ]);
  const shaolinExams = selectableExamCandidates(
    allShaolinExams,
    profile.assigned_level_shaolin,
  );
  const taichiExams = selectableExamCandidates(
    allTaichiExams,
    profile.assigned_level_taichi,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Programma esame</h1>
        <p className="text-muted-foreground text-sm">
          Scegli il programma dell&apos;esame corrente o di un esame precedente.
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

function selectableExamCandidates(
  exams: ExamProgram[],
  currentGrade: number,
): ExamProgram[] {
  const currentExamGrade = minimumSelectableExamGradeValue(currentGrade);
  if (currentExamGrade === null) return [];

  return exams.filter(
    (exam) =>
      exam.grade_from !== null &&
      isSelectableExamGrade(currentGrade, exam.grade_value),
  ).sort(
    (a, b) =>
      Math.abs(a.grade_value - currentExamGrade) -
      Math.abs(b.grade_value - currentExamGrade),
  );
}

function selectedExamId(
  exams: ExamProgram[],
  selectedId: string | null,
): string | null {
  if (!selectedId) return null;
  return exams.some((exam) => exam.id === selectedId) ? selectedId : null;
}
