"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Check, NotebookPen } from "lucide-react";
import { markPracticeDone, savePracticeNote } from "@/lib/actions/practice";

type Props = {
  skillId: string;
  alreadyDone: boolean;
};

export function PracticeCheckButton({ skillId, alreadyDone }: Props) {
  const [pending, start] = useTransition();
  const [notePending, startNote] = useTransition();
  const [done, setDone] = useState(alreadyDone);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    start(async () => {
      const result = await markPracticeDone(skillId);
      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }
      setDone(true);
      setOpen(true);
    });
  }

  function handleSaveNote() {
    startNote(async () => {
      const result = await savePracticeNote(skillId, note);
      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }
      setMessage("Nota salvata.");
      setOpen(false);
    });
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          onClick={handleClick}
          disabled={pending || done}
          variant={done ? "outline" : "default"}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          {done ? "Praticato oggi" : pending ? "..." : "Fatto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Aggiungi nota"
          onClick={() => setOpen(true)}
        >
          <NotebookPen className="h-4 w-4" />
        </Button>
      </div>
      {message && (
        <p className="text-muted-foreground text-xs" role="status">
          {message}
        </p>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="material-sheet border-border pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Nota pratica</SheetTitle>
            <SheetDescription>
              Aggiungi un appunto breve alla pratica di oggi.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={5}
              className="border-input bg-background min-h-32 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
          <SheetFooter>
            <Button onClick={handleSaveNote} disabled={notePending}>
              {notePending ? "Salvataggio..." : "Salva nota"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Salta
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
