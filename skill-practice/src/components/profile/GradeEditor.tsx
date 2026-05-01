"use client";

import { useState, useTransition } from "react";
import { updateProfileGrade } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SHAOLIN_GRADES,
  TAICHI_GRADES,
  gradeLabelForDiscipline,
  type Grade,
} from "@/lib/grades";
import type { Discipline } from "@/lib/types";

type Props = {
  assignedLevelShaolin: number;
  assignedLevelTaichi: number;
};

export function GradeEditor({
  assignedLevelShaolin,
  assignedLevelTaichi,
}: Props) {
  return (
    <div className="space-y-4">
      <GradeField
        discipline="shaolin"
        label="Shaolin"
        currentLevel={assignedLevelShaolin}
        grades={SHAOLIN_GRADES}
      />
      <GradeField
        discipline="taichi"
        label="T'ai Chi"
        currentLevel={assignedLevelTaichi}
        grades={TAICHI_GRADES}
      />
      <p className="text-muted-foreground text-xs">
        Cambiando grado l&apos;esame in preparazione passa al livello successivo.
      </p>
    </div>
  );
}

type FieldProps = {
  discipline: Discipline;
  label: string;
  currentLevel: number;
  grades: Grade[];
};

function GradeField({ discipline, label, currentLevel, grades }: FieldProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      const result = await updateProfileGrade(null, formData);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-sm">{label}</div>
          <div className="text-sm font-medium">
            {gradeLabelForDiscipline(discipline, currentLevel)}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          Modifica
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <input type="hidden" name="discipline" value={discipline} />
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <select
          name="assignedLevel"
          defaultValue={currentLevel}
          className="border-input bg-background min-h-11 w-full rounded-lg border px-3 text-sm"
        >
          {grades.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvataggio..." : "Salva"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setError(null);
            setEditing(false);
          }}
        >
          Annulla
        </Button>
      </div>
    </form>
  );
}
