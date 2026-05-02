import Link from "next/link";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanMode } from "@/lib/types";

type Props = {
  dayName: string;
  planMode: PlanMode;
  gradeSummary: string;
  scopeLabel?: string | null;
};

export function TodaySessionHeader({
  dayName,
  planMode,
  gradeSummary,
  scopeLabel,
}: Props) {
  const planLabel =
    planMode === "custom" ? "Selezione personale" : "Programma esame";

  const eyebrowParts = [planLabel];
  if (scopeLabel) eyebrowParts.push(scopeLabel);
  eyebrowParts.push(gradeSummary);

  return (
    <header className="material-bar sticky top-0 z-30 -mx-4 border-b border-border px-4 pt-3 pb-3">
      <div className="space-y-1">
        <p className="label-font text-primary text-xs uppercase">
          {eyebrowParts.join(" · ")}
        </p>
        <h1 className="text-3xl font-semibold capitalize tracking-tight">
          {dayName}
        </h1>
      </div>
      <div className="mt-3 flex gap-2 border-t border-border/50 pt-3">
        <Button
          asChild
          variant="secondary"
          className="h-12 flex-1 justify-center text-sm"
        >
          <Link href="/sessions/calendar" aria-label="Calendario sessioni">
            <CalendarDays className="mr-2 h-5 w-5" />
            Calendario
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="h-12 flex-1 justify-center text-sm"
        >
          <Link href="/sessions/setup" aria-label="Modifica sessioni">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Sessioni
          </Link>
        </Button>
      </div>
    </header>
  );
}
