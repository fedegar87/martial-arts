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
import type { ExamProgram, PlanMode } from "@/lib/types";

type Props = {
  planMode: PlanMode;
  examShaolin?: ExamProgram | null;
  examTaichi?: ExamProgram | null;
  planCount: number;
};

export function PlanModeSection({
  planMode,
  examShaolin,
  examTaichi,
  planCount,
}: Props) {
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
      <div>
        <div className="text-sm font-medium">
          {planMode === "custom" ? "Selezione personale" : "Programma esame"}
        </div>
        <p className="text-muted-foreground text-sm">
          {planCount} contenuti attivi nel piano
        </p>
      </div>

      {planMode === "exam" && (
        <div className="space-y-1 text-sm">
          <ExamLine label="Shaolin" exam={examShaolin} />
          <ExamLine label="T'ai Chi" exam={examTaichi} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={planMode === "exam" ? "default" : "outline"}>
          <Link href="/plan/exam">Programma esame</Link>
        </Button>
        <Button
          type="button"
          variant={planMode === "custom" ? "default" : "outline"}
          disabled={pending}
          onClick={handleCustomClick}
        >
          Selezione personale
        </Button>
      </div>
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

function ExamLine({
  label,
  exam,
}: {
  label: string;
  exam?: ExamProgram | null;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{exam?.level_name ?? "nessuno"}</span>
    </div>
  );
}
