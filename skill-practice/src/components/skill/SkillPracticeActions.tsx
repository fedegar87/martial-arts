"use client";

import { useState, useTransition } from "react";
import { Check, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { PracticeNoteButton } from "@/components/today/PracticeNoteButton";

type Props = {
  skillId: string;
  inPlan: boolean;
  practicedToday: boolean;
};

export function SkillPracticeActions({
  skillId,
  inPlan,
  practicedToday,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(practicedToday);
  const [noteOpen, setNoteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleFreePracticeDone() {
    startTransition(async () => {
      setMessage(null);
      const result = await markPracticeDone(skillId);
      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }
      setDone(true);
      setNoteOpen(true);
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          type="button"
          onClick={handleFreePracticeDone}
          disabled={pending || done}
          variant={done ? "outline" : "default"}
          className={
            done
              ? "w-full border-[color:var(--status-success)] text-[var(--status-success)]"
              : "w-full"
          }
        >
          {done ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Dumbbell className="mr-2 h-4 w-4" />
          )}
          {done ? "Praticato oggi" : pending ? "..." : "Pratica libera fatta"}
        </Button>
        <PracticeNoteButton
          skillId={skillId}
          open={noteOpen}
          onOpenChange={setNoteOpen}
          showStatus={false}
        />
      </div>

      <AddToPlanButton skillId={skillId} inPlan={inPlan} />

      <p className="text-xs leading-relaxed text-muted-foreground">
        La pratica libera aggiorna lo storico senza cambiare il programma.
        Aggiungilo al piano se vuoi rivederlo nelle sessioni.
      </p>

      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
