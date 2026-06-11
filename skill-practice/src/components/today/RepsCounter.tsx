"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementRep, decrementRep } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
import { PracticeNoteButton } from "./PracticeNoteButton";

type Props = {
  skillId: string;
  repsDone: number;
  repsTarget: number;
  todayNote?: string;
};

export function RepsCounter({ skillId, repsDone, repsTarget, todayNote }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticReps, applyDelta] = useOptimistic(
    repsDone,
    (current: number, delta: number) =>
      Math.max(0, Math.min(repsTarget, current + delta)),
  );
  const completed = optimisticReps >= repsTarget;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={pending || optimisticReps === 0}
          onClick={() =>
            startTransition(async () => {
              applyDelta(-1);
              setError(null);
              try {
                const result = await decrementRep(skillId);
                if (result && "error" in result) setError(result.error);
              } catch {
                setError("Connessione assente, riprova.");
              }
            })
          }
          aria-label="Annulla ripetizione"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-12 text-center text-sm tabular-nums">
          {optimisticReps} / {repsTarget}
        </span>
        <Button
          type="button"
          size="sm"
          variant={completed ? "outline" : "default"}
          disabled={pending || completed}
          className={
            completed
              ? completedButtonClassName
              : undefined
          }
          onClick={() =>
            startTransition(async () => {
              applyDelta(1);
              setError(null);
              try {
                const result = await incrementRep(skillId);
                if (result && "error" in result) setError(result.error);
              } catch {
                setError("Connessione assente, riprova.");
              }
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          {completed ? "Completata" : "Ripetizione"}
        </Button>
        <PracticeNoteButton skillId={skillId} compact initialNote={todayNote} />
      </div>
      {error && (
        <p role="status" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
