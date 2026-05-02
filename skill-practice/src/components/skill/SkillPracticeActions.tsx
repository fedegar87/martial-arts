"use client";

import { useState, useTransition } from "react";
import { Check, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { PracticeNoteButton } from "@/components/today/PracticeNoteButton";
import type { PlanMode } from "@/lib/types";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
  practicedToday: boolean;
  planMode: PlanMode;
};

export function SkillPracticeActions({
  skillId,
  inPersonalSelection,
  practicedToday,
  planMode,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(practicedToday);
  const [noteOpen, setNoteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const helperText =
    planMode === "custom"
      ? inPersonalSelection
        ? "La pratica libera aggiorna lo storico. Questo contenuto è nella selezione personale e può comparire nelle sessioni."
        : "La pratica libera aggiorna lo storico senza cambiare le sessioni. Aggiungi il contenuto alle sessioni se vuoi ripassarlo con cadenza regolare."
      : inPersonalSelection
        ? "La pratica libera aggiorna lo storico senza cambiare il programma esame. Questo contenuto è salvato nella selezione personale, che resta inattiva."
        : "La pratica libera aggiorna lo storico senza cambiare il programma esame. Aggiungere il contenuto alla selezione personale non la rende attiva.";

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
          {done ? "Praticato oggi" : pending ? "..." : "Registra pratica libera"}
        </Button>
        <PracticeNoteButton
          skillId={skillId}
          open={noteOpen}
          onOpenChange={setNoteOpen}
          showStatus={false}
        />
      </div>

      <AddToPlanButton
        skillId={skillId}
        inPersonalSelection={inPersonalSelection}
        planMode={planMode}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">
        {helperText}
      </p>

      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
