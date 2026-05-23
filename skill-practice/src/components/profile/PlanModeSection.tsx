"use client";

import Link from "next/link";
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
import { switchToCustomMode } from "@/lib/actions/plan";
import type { PlanMode } from "@/lib/types";

type Props = {
  planMode: PlanMode;
};

export function PlanModeSection({ planMode }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleCustomClick() {
    if (planMode === "custom") return;
    setConfirmOpen(true);
  }

  function confirmCustomMode() {
    startTransition(async () => {
      await switchToCustomMode();
      setConfirmOpen(false);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant={planMode === "exam" ? "secondary" : "outline"}>
          <Link href="/plan/exam">Programma esame</Link>
        </Button>
        <Button
          type="button"
          variant={planMode === "custom" ? "secondary" : "outline"}
          disabled={pending}
          onClick={handleCustomClick}
        >
          Selezione personale
        </Button>
      </div>
      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/programma">Vedi programma</Link>
      </Button>
      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent side="bottom" className="material-sheet pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Passare alla selezione personale?</SheetTitle>
            <SheetDescription>
              Il piano attivo userà la tua selezione personale. Programma
              esame, storico pratica e note restano salvati.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button onClick={confirmCustomMode} disabled={pending}>
              {pending ? "Aggiornamento..." : "Conferma"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Annulla
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
