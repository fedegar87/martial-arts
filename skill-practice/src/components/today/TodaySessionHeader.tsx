import Link from "next/link";
import { CalendarDays, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanMode } from "@/lib/types";

type Props = {
  dayName: string;
  planMode: PlanMode;
  gradeSummary: string;
};

export function TodaySessionHeader({
  dayName,
  planMode,
  gradeSummary,
}: Props) {
  const planLabel =
    planMode === "custom" ? "Selezione personale" : "Programma esame";

  return (
    <header className="material-bar sticky top-0 z-30 -mx-4 border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="label-font text-primary text-xs">{planLabel}</p>
          <h1 className="text-2xl font-semibold capitalize">
            Oggi - {dayName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {gradeSummary}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label="Calendario sessioni"
          >
            <Link href="/sessions/calendar">
              <CalendarDays className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label="Modifica sessioni"
          >
            <Link href="/sessions/setup">
              <Settings2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
