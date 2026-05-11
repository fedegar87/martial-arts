"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementRep, decrementRep } from "@/lib/actions/practice";
import { PracticeNoteButton } from "./PracticeNoteButton";

type Props = {
  skillId: string;
  repsDone: number;
  repsTarget: number;
};

export function RepsCounter({ skillId, repsDone, repsTarget }: Props) {
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
              const result = await decrementRep(skillId);
              if (result && "error" in result) setError(result.error);
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
              ? "border-[color:var(--status-success)] text-[var(--status-success)]"
              : undefined
          }
          onClick={() =>
            startTransition(async () => {
              applyDelta(1);
              setError(null);
              const result = await incrementRep(skillId);
              if (result && "error" in result) setError(result.error);
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          {completed ? "Completata" : "Ripetizione"}
        </Button>
        <PracticeNoteButton skillId={skillId} compact />
      </div>
      {error && (
        <p role="status" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
