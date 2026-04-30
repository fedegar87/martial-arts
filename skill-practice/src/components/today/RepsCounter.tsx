"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementRep, decrementRep } from "@/lib/actions/practice";

type Props = {
  skillId: string;
  repsDone: number;
  repsTarget: number;
};

export function RepsCounter({ skillId, repsDone, repsTarget }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const completed = repsDone >= repsTarget;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={pending || repsDone === 0}
          onClick={() =>
            startTransition(async () => {
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
          {repsDone} / {repsTarget}
        </span>
        <Button
          type="button"
          size="sm"
          disabled={pending || completed}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await incrementRep(skillId);
              if (result && "error" in result) setError(result.error);
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          {completed ? "Completata" : "Ripetizione"}
        </Button>
      </div>
      {error && (
        <p role="status" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
