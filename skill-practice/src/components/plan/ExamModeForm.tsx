"use client";

import { useActionState, useMemo, useState } from "react";
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
  const [shaolinId, setShaolinId] = useState(selectedShaolinId ?? "");
  const [taichiId, setTaichiId] = useState(selectedTaichiId ?? "");
  const selectedLabels = useMemo(
    () =>
      [
        shaolinExams.find((exam) => exam.id === shaolinId)?.level_name,
        taichiExams.find((exam) => exam.id === taichiId)?.level_name,
      ].filter(Boolean),
    [shaolinExams, shaolinId, taichiExams, taichiId],
  );

  return (
    <form action={action} className="space-y-5">
      <ExamSelect
        name="examShaolinId"
        label="Shaolin"
        exams={shaolinExams}
        value={shaolinId}
        onChange={setShaolinId}
      />
      {showTaichi && (
        <ExamSelect
          name="examTaichiId"
          label="T'ai Chi"
          exams={taichiExams}
          value={taichiId}
          onChange={setTaichiId}
        />
      )}

      <div className="surface-inset rounded-md p-3 text-sm">
        <div className="font-medium">Anteprima piano</div>
        <p className="text-muted-foreground mt-1">
          {selectedLabels.length > 0
            ? `Attiverai: ${selectedLabels.join(" + ")}. I contenuti del programma esame verranno rigenerati; storico pratica e note restano salvati.`
            : "Nessun esame selezionato. Puoi comunque usare la selezione libera."}
        </p>
      </div>

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
  value,
  onChange,
}: {
  name: string;
  label: string;
  exams: ExamProgram[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input bg-background min-h-11 w-full rounded-lg border px-3 text-sm"
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
