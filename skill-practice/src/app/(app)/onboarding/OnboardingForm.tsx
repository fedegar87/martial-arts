"use client";

import { useActionState, useMemo, useState } from "react";
import { selectExam } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExamProgram } from "@/lib/types";
import { nextGradeValue, SHAOLIN_GRADES, TAICHI_GRADES } from "@/lib/grades";
import { DISCIPLINE_LABELS } from "@/lib/labels";

type Props = {
  exams: ExamProgram[];
  displayName: string;
};

export function OnboardingForm({ exams, displayName }: Props) {
  const [state, action, pending] = useActionState(selectExam, null);
  const [practicesShaolin, setPracticesShaolin] = useState(true);
  const [practicesTaichi, setPracticesTaichi] = useState(false);
  const [assignedLevelShaolin, setAssignedLevelShaolin] = useState(8);
  const [assignedLevelTaichi, setAssignedLevelTaichi] = useState(5);

  const visibleExams = useMemo(
    () =>
      exams.filter(
        (exam) => {
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
        },
      ),
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
        <CardTitle>Ciao {displayName}</CardTitle>
        <CardDescription>
          Imposta discipline, gradi attuali ed esame da preparare. Genereremo
          il tuo piano di pratica dal prossimo esame.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <section className="space-y-3">
            <div className="text-sm font-medium">Discipline praticate</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="tap-feedback flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  name="practicesShaolin"
                  checked={practicesShaolin}
                  onChange={(event) => setPracticesShaolin(event.target.checked)}
                  className="h-5 w-5"
                />
                {DISCIPLINE_LABELS.shaolin}
              </label>
              <label className="tap-feedback flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  name="practicesTaichi"
                  checked={practicesTaichi}
                  onChange={(event) => setPracticesTaichi(event.target.checked)}
                  className="h-5 w-5"
                />
                {DISCIPLINE_LABELS.taichi}
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-sm font-medium">Grado attuale</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {practicesShaolin && (
                <Label className="space-y-1.5">
                  <span className="text-muted-foreground text-sm">Shaolin</span>
                  <select
                    name="assignedLevelShaolin"
                    value={assignedLevelShaolin}
                    onChange={(event) =>
                      setAssignedLevelShaolin(Number(event.target.value))
                    }
                    className="border-input bg-background min-h-11 w-full rounded-lg border px-3 text-sm"
                  >
                    {SHAOLIN_GRADES.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </Label>
              )}

              {practicesTaichi && (
                <Label className="space-y-1.5">
                  <span className="text-muted-foreground text-sm">
                    T&apos;ai Chi
                  </span>
                  <select
                    name="assignedLevelTaichi"
                    value={assignedLevelTaichi}
                    onChange={(event) =>
                      setAssignedLevelTaichi(Number(event.target.value))
                    }
                    className="border-input bg-background min-h-11 w-full rounded-lg border px-3 text-sm"
                  >
                    {TAICHI_GRADES.filter((grade) => grade.value !== 0).map(
                      (grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ),
                    )}
                  </select>
                </Label>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <Label htmlFor="examId">Esame in preparazione</Label>
            <select
              key={firstExamId}
              id="examId"
              name="examId"
              required
              defaultValue={firstExamId}
              className="border-input bg-background min-h-11 w-full rounded-lg border px-3 text-sm"
              disabled={visibleExams.length === 0}
            >
              {visibleExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {DISCIPLINE_LABELS[exam.discipline]} — {exam.level_name}
                </option>
              ))}
            </select>
            {visibleExams.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nessun prossimo esame disponibile per i gradi selezionati.
              </p>
            )}
            <div className="space-y-2">
              {visibleExams.slice(0, 4).map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="font-medium">
                    {DISCIPLINE_LABELS[exam.discipline]} — {exam.level_name}
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
            {pending ? "Creazione piano..." : "Inizia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
