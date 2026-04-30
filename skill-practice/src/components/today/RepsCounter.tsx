"use client";

import { useTransition } from "react";
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
  const completed = repsDone >= repsTarget;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={pending || repsDone === 0}
        onClick={() =>
          startTransition(async () => {
            await decrementRep(skillId);
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
            await incrementRep(skillId);
          })
        }
      >
        <Plus className="mr-1 h-4 w-4" />
        {completed ? "Completata" : "Ripetizione"}
      </Button>
    </div>
  );
}
