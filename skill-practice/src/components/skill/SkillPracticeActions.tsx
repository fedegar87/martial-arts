"use client";

import { useState, useTransition } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { PracticeNoteButton } from "@/components/today/PracticeNoteButton";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
  practicedToday: boolean;
};

export function SkillPracticeActions({
  skillId,
  inPersonalSelection,
  practicedToday,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(practicedToday);
  const [message, setMessage] = useState<string | null>(null);

  function handleFreePracticeDone() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await markPracticeDone(skillId);
        if (!result || "error" in result) {
          setMessage(result?.error ?? "Salvataggio non confermato. Riprova.");
          return;
        }
        setDone(true);
      } catch {
        setMessage("Non è stato possibile confermare il salvataggio. Riprova.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleFreePracticeDone}
        disabled={pending || done}
        aria-busy={pending}
        variant={done ? "outline" : "default"}
        className={done ? `h-12 w-full ${completedButtonClassName}` : "h-12 w-full"}
      >
        <Dumbbell className="mr-2 h-4 w-4" />
        {pending ? "Salvataggio…" : done ? "Praticato oggi" : "Segna praticato"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <AddToPlanButton
          skillId={skillId}
          inPersonalSelection={inPersonalSelection}
        />
        <PracticeNoteButton skillId={skillId} block showStatus={false} />
      </div>

      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
