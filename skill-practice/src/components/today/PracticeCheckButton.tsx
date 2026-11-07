"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { markPracticeDone } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { PracticeNoteButton } from "./PracticeNoteButton";

type Props = {
  skillId: string;
  alreadyDone: boolean;
  initialNote?: string;
};

export function PracticeCheckButton({
  skillId,
  alreadyDone,
  initialNote,
}: Props) {
  const tr = useTranslations("ui");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyDone);
  const [noteOpen, setNoteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    start(async () => {
      try {
        const result = await markPracticeDone(skillId);
        if (!result || "error" in result) {
          setMessage(result?.error ?? tr("saveUnconfirmed"));
          return;
        }
        setDone(true);
        setNoteOpen(true);
      } catch {
        setMessage(tr("saveConfirmationFailed"));
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          type="button"
          onClick={handleClick}
          disabled={pending || done}
          aria-busy={pending}
          variant={done ? "outline" : "default"}
          className={done ? `w-full ${completedButtonClassName}` : "w-full"}
        >
          <Check className="mr-2 h-4 w-4" />
          {pending
            ? tr("savingEllipsis")
            : done
              ? tr("practicedToday")
              : tr("done")}
        </Button>
        <PracticeNoteButton
          skillId={skillId}
          open={noteOpen}
          onOpenChange={setNoteOpen}
          showStatus={false}
          initialNote={initialNote}
        />
      </div>
      {message && (
        <p className="text-destructive text-xs" role="status">
          {message}
        </p>
      )}
    </>
  );
}
