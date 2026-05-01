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
  showStatus?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PracticeNoteButton({
  skillId,
  compact = false,
  showStatus = true,
  open,
  onOpenChange,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [internalOpen, setInternalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;
  const setSheetOpen = onOpenChange ?? setInternalOpen;

  function handleSaveNote() {
    startTransition(async () => {
      const result = await savePracticeNote(skillId, note);
      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }
      setMessage("Nota salvata.");
      setSheetOpen(false);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "icon"}
        aria-label="Aggiungi nota pratica"
        onClick={() => setSheetOpen(true)}
      >
        <NotebookPen className={compact ? "mr-1 h-3.5 w-3.5" : "h-4 w-4"} />
        {compact && "Nota"}
      </Button>
      {showStatus && message && (
        <p className="text-muted-foreground text-xs" role="status">
          {message}
        </p>
      )}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
              rows={5}
              className="border-input bg-background min-h-32 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
          <SheetFooter>
            <Button onClick={handleSaveNote} disabled={pending}>
              {pending ? "Salvataggio..." : "Salva nota"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSheetOpen(false)}
            >
              Salta
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
