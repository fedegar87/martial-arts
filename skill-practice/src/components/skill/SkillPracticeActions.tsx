"use client";

import { useState, useTransition } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
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
          className={done ? `w-full ${completedButtonClassName}` : "w-full"}
        >
          <Dumbbell className="mr-2 h-4 w-4" />
          {done
            ? "Pratica libera registrata"
            : pending
              ? "..."
              : "Registra pratica libera"}
        </Button>
        <PracticeNoteButton
          skillId={skillId}
          showStatus={false}
        />
      </div>

      <AddToPlanButton
        skillId={skillId}
        inPersonalSelection={inPersonalSelection}
        planMode={planMode}
      />

      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
