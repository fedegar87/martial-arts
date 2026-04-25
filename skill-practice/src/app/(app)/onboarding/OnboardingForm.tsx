"use client";

import { useActionState } from "react";
import { selectExam } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExamProgram } from "@/lib/types";

type Props = {
  exams: ExamProgram[];
  displayName: string;
};

export function OnboardingForm({ exams, displayName }: Props) {
  const [state, action, pending] = useActionState(selectExam, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ciao {displayName}</CardTitle>
        <CardDescription>
          Scegli l&apos;esame per cui ti stai preparando. Genereremo il tuo
          piano di pratica con focus, ripasso e mantenimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <RadioGroup name="examId" required>
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-start space-x-3 rounded-lg border p-3"
              >
                <RadioGroupItem
                  value={exam.id}
                  id={exam.id}
                  className="mt-1"
                />
                <Label htmlFor={exam.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{exam.level_name}</div>
                  {exam.description && (
                    <div className="text-muted-foreground text-sm">
                      {exam.description}
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creazione piano..." : "Inizia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
