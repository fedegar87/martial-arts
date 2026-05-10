"use client";

import { useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addFreePracticeForDate,
  removeFreePracticeForDate,
  setPracticeCompletionForDate,
} from "@/lib/actions/calendar";

type Props = {
  skillId: string;
  dateKey: string;
  done: boolean;
  disabled?: boolean;
  kind: "scheduled" | "free";
};

export function PracticeCompletionToggle({
  skillId,
  dateKey,
  done,
  disabled = false,
  kind,
}: Props) {
  const [optimisticDone, setOptimisticDone] = useState(done);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const checked = optimisticDone;

  function handleClick() {
    const next = !checked;
    startTransition(async () => {
      setError(null);
      const result =
        kind === "free"
          ? next
            ? await addFreePracticeForDate(skillId, dateKey)
            : await removeFreePracticeForDate(skillId, dateKey)
          : await setPracticeCompletionForDate(skillId, dateKey, next);

      if ("error" in result) {
        setError(result.error);
        return;
      }
      setOptimisticDone(next);
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={checked ? "outline" : "default"}
        size="sm"
        role="switch"
        aria-checked={checked}
        disabled={disabled || pending}
        onClick={handleClick}
        className={
          checked
            ? "border-[color:var(--status-success)] text-[var(--status-success)]"
            : undefined
        }
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        {pending ? "..." : checked ? "Fatto" : "Non fatto"}
      </Button>
      {error && (
        <p className="max-w-40 text-xs text-destructive" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
