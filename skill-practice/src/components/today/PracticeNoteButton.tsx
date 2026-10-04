"use client";

import { useState, useTransition } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { savePracticeNote } from "@/lib/actions/practice";

type Props = {
  skillId: string;
  compact?: boolean;
  block?: boolean;
  showStatus?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialNote?: string;
};

export function PracticeNoteButton({
  skillId,
  compact = false,
  block = false,
  showStatus = true,
  open,
  onOpenChange,
  initialNote = "",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [internalOpen, setInternalOpen] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;
  const setSheetOpen = onOpenChange ?? setInternalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setMessage(null);
    setError(null);
    setSheetOpen(nextOpen);
  }

  function handleSaveNote() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await savePracticeNote(skillId, note);
        if (!result || "error" in result) {
          setError(result?.error ?? "Salvataggio non confermato. Riprova.");
          return;
        }
        setMessage("Nota salvata.");
        setSheetOpen(false);
      } catch {
        setError("Non è stato possibile confermare il salvataggio. Riprova.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={block ? "default" : compact ? "sm" : "icon"}
        className={block ? "h-11 w-full" : undefined}
        aria-label="Aggiungi nota pratica"
        onClick={() => handleOpenChange(true)}
      >
        <NotebookPen
          className={
            block ? "mr-2 h-4 w-4" : compact ? "mr-1 h-3.5 w-3.5" : "h-4 w-4"
          }
        />
        {(block || compact) && "Nota"}
      </Button>
      {showStatus && message && (
        <p className="text-muted-foreground text-xs" role="status">
          {message}
        </p>
      )}
      <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="material-sheet border-border pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader>
            <SheetTitle>Nota pratica</SheetTitle>
            <SheetDescription>
              Registra un dettaglio da ricordare la prossima volta che lavori
              su questo video.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={pending}
              aria-label="Nota pratica"
              rows={5}
              className="border-input bg-background min-h-32 w-full resize-y rounded-md border px-3 py-2 text-base md:text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            {error && (
              <p className="text-destructive mt-2 text-xs" role="alert">
                {error}
              </p>
            )}
          </div>
          <SheetFooter>
            <Button
              type="button"
              onClick={handleSaveNote}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Salvataggio..." : "Salva nota"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Salta
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
