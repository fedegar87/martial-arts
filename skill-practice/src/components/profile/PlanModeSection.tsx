"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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

  function handleCustomClick() {
    const confirmed = window.confirm(
      "Passare alla selezione libera rimuove le skill del programma esame, ma mantiene lo storico pratica.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      await switchToCustomMode();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">
          {planMode === "custom" ? "Selezione libera" : "Programma esame"}
        </div>
        <p className="text-muted-foreground text-sm">
          {planCount} skill attive nel piano
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
          Selezione libera
        </Button>
      </div>
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
