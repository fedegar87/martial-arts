"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completedButtonClassName } from "@/lib/ui-classes";
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
  // useOptimistic: la base segue la prop `done` del server dopo la revalidation,
  // cosi una mutazione avvenuta altrove (es. "Segna" da AddFreePracticeSheet) si
  // riflette qui; in caso di errore l'override ottimistico si annulla da solo.
  const [optimisticDone, applyDone] = useOptimistic(
    done,
    (_current: boolean, next: boolean) => next,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const checked = optimisticDone;

  function handleClick() {
    const next = !checked;
    startTransition(async () => {
      applyDone(next);
      setError(null);
      try {
        const result =
          kind === "free"
            ? next
              ? await addFreePracticeForDate(skillId, dateKey)
              : await removeFreePracticeForDate(skillId, dateKey)
            : await setPracticeCompletionForDate(skillId, dateKey, next);

        if ("error" in result) {
          setError(result.error);
        }
      } catch {
        setError("Connessione assente, riprova.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={checked ? "outline" : "secondary"}
        size="sm"
        aria-pressed={checked}
        disabled={disabled || pending}
        onClick={handleClick}
        className={
          checked
            ? completedButtonClassName
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
