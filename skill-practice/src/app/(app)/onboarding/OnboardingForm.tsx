"use client";
import { gradesForDiscipline } from "@/lib/grades";
import { disciplineLabel } from "@/lib/labels";

import { useTranslations } from "next-intl";

import { LegalLinks } from "@/components/legal/LegalLinks";
import { FormSelect } from "@/components/primitives/FormSelect";
import { OptionCard } from "@/components/primitives/OptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { finishWithoutExam, selectExam } from "@/lib/actions/onboarding";
import { nextGradeValue } from "@/lib/grades";
import type { ExamProgram } from "@/lib/types";
import { useActionState, useMemo, useState } from "react";

type Props = {
  exams: ExamProgram[];
  displayName: string;
};

export function OnboardingForm({ exams, displayName }: Props) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(selectExam, null);
  const [practicesShaolin, setPracticesShaolin] = useState(true);
  const [practicesTaichi, setPracticesTaichi] = useState(false);
  const [assignedLevelShaolin, setAssignedLevelShaolin] = useState(8);
  const [assignedLevelTaichi, setAssignedLevelTaichi] = useState(5);

  const visibleExams = useMemo(
    () =>
      exams.filter((exam) => {
        if (exam.discipline === "shaolin") {
          return (
            practicesShaolin &&
            exam.grade_value === nextGradeValue(assignedLevelShaolin)
          );
        }
        return (
          practicesTaichi &&
          exam.grade_value === nextGradeValue(assignedLevelTaichi)
        );
      }),
    [
      assignedLevelShaolin,
      assignedLevelTaichi,
      exams,
      practicesShaolin,
      practicesTaichi,
    ],
  );

  const firstExamId = visibleExams[0]?.id ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tr("hello")} {displayName}
        </CardTitle>
        <CardDescription>{tr("onboardingDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <section className="space-y-3">
            <div className="text-sm font-medium">
              {tr("practicedDisciplines")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard selected={practicesShaolin}>
                <input
                  type="checkbox"
                  name="practicesShaolin"
                  checked={practicesShaolin}
                  onChange={(event) =>
                    setPracticesShaolin(event.target.checked)
                  }
                  className="h-5 w-5"
                />
                {disciplineLabel("shaolin", tr)}
              </OptionCard>
              <OptionCard selected={practicesTaichi}>
                <input
                  type="checkbox"
                  name="practicesTaichi"
                  checked={practicesTaichi}
                  onChange={(event) => setPracticesTaichi(event.target.checked)}
                  className="h-5 w-5"
                />
                {disciplineLabel("taichi", tr)}
              </OptionCard>
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-sm font-medium">{tr("currentGrade")}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {practicesShaolin && (
                <FormSelect
                  label={tr("shaolin")}
                  name="assignedLevelShaolin"
                  value={assignedLevelShaolin}
                  onChange={(event) =>
                    setAssignedLevelShaolin(Number(event.target.value))
                  }
                >
                  {gradesForDiscipline("shaolin", tr).map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </FormSelect>
              )}

              {practicesTaichi && (
                <FormSelect
                  label={tr("taichi")}
                  name="assignedLevelTaichi"
                  value={assignedLevelTaichi}
                  onChange={(event) =>
                    setAssignedLevelTaichi(Number(event.target.value))
                  }
                >
                  {gradesForDiscipline("taichi", tr)
                    .filter((grade) => grade.value !== 0)
                    .map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                </FormSelect>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <FormSelect
              key={firstExamId}
              id="examId"
              label={tr("preparingExam")}
              name="examId"
              required
              defaultValue={firstExamId}
              disabled={visibleExams.length === 0}
            >
              {visibleExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {disciplineLabel(exam.discipline, tr)} — {exam.level_name}
                </option>
              ))}
            </FormSelect>
            {visibleExams.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {tr("noNextExam")}
              </p>
            )}
            <div className="space-y-2">
              {visibleExams.slice(0, 4).map((exam) => (
                <div key={exam.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">
                    {disciplineLabel(exam.discipline, tr)} — {exam.level_name}
                  </div>
                  {exam.description && (
                    <div className="text-muted-foreground">
                      {exam.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {!practicesShaolin && (
            <input type="hidden" name="assignedLevelShaolin" value="8" />
          )}
          {!practicesTaichi && (
            <input type="hidden" name="assignedLevelTaichi" value="0" />
          )}

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={pending || visibleExams.length === 0}
            className="w-full"
          >
            {pending ? tr("creatingPlan") : tr("start")}
          </Button>
          <Button
            type="submit"
            formAction={finishWithoutExam}
            variant="outline"
            disabled={pending}
            className="w-full"
          >
            {tr("continueWithoutExam")}
          </Button>
          <LegalLinks className="justify-center" />
        </form>
      </CardContent>
    </Card>
  );
}
