"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { markPracticeDone } from "@/lib/actions/practice";
import { completedButtonClassName } from "@/lib/ui-classes";
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
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyDone);
  const [noteOpen, setNoteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setDone(true);
    start(async () => {
      try {
        const result = await markPracticeDone(skillId);
        if (result && "error" in result) {
          setDone(false);
          setMessage(result.error);
          return;
        }
        setNoteOpen(true);
      } catch {
        setDone(false);
        setMessage("Connessione assente, riprova.");
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          onClick={handleClick}
          disabled={pending || done}
          variant={done ? "outline" : "default"}
          className={
            done
              ? `w-full ${completedButtonClassName}`
              : "w-full"
          }
        >
          <Check className="mr-2 h-4 w-4" />
          {done ? "Praticato oggi" : pending ? "..." : "Fatto"}
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
        <p className="text-muted-foreground text-xs" role="status">
          {message}
        </p>
      )}
    </>
  );
}
