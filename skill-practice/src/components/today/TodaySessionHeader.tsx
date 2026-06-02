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
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="label-font text-primary text-xs uppercase">
            {eyebrowParts.join(" · ")}
          </p>
          <h1 className="text-2xl font-semibold capitalize tracking-tight">
            {dayName}
          </h1>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Apri calendario">
            <Link href="/calendar">
              <CalendarDays className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Imposta allenamento"
          >
            <Link href="/sessions/setup">
              <SlidersHorizontal className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
