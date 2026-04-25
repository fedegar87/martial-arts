"use client";

import { useActionState } from "react";
import { updateProfileGrades } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SHAOLIN_GRADES, TAICHI_GRADES } from "@/lib/grades";

type Props = {
  assignedLevelShaolin: number;
  assignedLevelTaichi: number;
};

export function GradeEditor({
  assignedLevelShaolin,
  assignedLevelTaichi,
}: Props) {
  const [state, action, pending] = useActionState(updateProfileGrades, null);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Shaolin</span>
          <select
            name="assignedLevelShaolin"
            defaultValue={assignedLevelShaolin}
            className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
          >
            {SHAOLIN_GRADES.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">T&apos;ai Chi</span>
          <select
            name="assignedLevelTaichi"
            defaultValue={assignedLevelTaichi}
            className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
          >
            {TAICHI_GRADES.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">Gradi aggiornati.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio..." : "Salva gradi"}
      </Button>
    </form>
  );
}
