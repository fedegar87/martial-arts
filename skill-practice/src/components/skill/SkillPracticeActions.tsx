"use client";
import { useTranslations } from "next-intl";

import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { PracticeNoteButton } from "@/components/today/PracticeNoteButton";
import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
import { Dumbbell } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
  practicedToday: boolean;
  todayNote?: string;
};

export function SkillPracticeActions({
  skillId,
  inPersonalSelection,
  practicedToday,
  todayNote,
}: Props) {
  const tr = useTranslations("ui");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(practicedToday);
  const [message, setMessage] = useState<string | null>(null);

  function handleFreePracticeDone() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await markPracticeDone(skillId);
        if (!result || "error" in result) {
          setMessage(result?.error ?? tr("saveUnconfirmed"));
          return;
        }
        setDone(true);
      } catch {
        setMessage(tr("saveConfirmationFailed"));
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
        className={
          done ? `h-12 w-full ${completedButtonClassName}` : "h-12 w-full"
        }
      >
        <Dumbbell className="mr-2 h-4 w-4" />
        {pending
          ? tr("savingEllipsis")
          : done
            ? tr("practicedToday")
            : tr("markPracticed")}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <AddToPlanButton
          skillId={skillId}
          inPersonalSelection={inPersonalSelection}
        />
        <PracticeNoteButton
          skillId={skillId}
          block
          showStatus={false}
          initialNote={todayNote}
        />
      </div>

      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
