"use client";

import { useActionState } from "react";
import { activateExamModeFromForm } from "@/lib/actions/plan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ExamProgram } from "@/lib/types";

type Props = {
  shaolinExams: ExamProgram[];
  taichiExams: ExamProgram[];
  selectedShaolinId?: string | null;
  selectedTaichiId?: string | null;
  showTaichi: boolean;
};

export function ExamModeForm({
  shaolinExams,
  taichiExams,
  selectedShaolinId,
  selectedTaichiId,
  showTaichi,
}: Props) {
  const [state, action, pending] = useActionState(
    activateExamModeFromForm,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <ExamSelect
        name="examShaolinId"
        label="Shaolin"
        exams={shaolinExams}
        defaultValue={selectedShaolinId}
      />
      {showTaichi && (
        <ExamSelect
          name="examTaichiId"
          label="T'ai Chi"
          exams={taichiExams}
          defaultValue={selectedTaichiId}
        />
      )}

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">Programma aggiornato.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio..." : "Attiva programma esame"}
      </Button>
    </form>
  );
}

function ExamSelect({
  name,
  label,
  exams,
  defaultValue,
}: {
  name: string;
  label: string;
  exams: ExamProgram[];
  defaultValue?: string | null;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
      >
        <option value="">Nessun esame</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.level_name}
          </option>
        ))}
      </select>
    </label>
  );
}
