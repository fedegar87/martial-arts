import { Button } from "@/components/ui/button";
import type { PlanMode } from "@/lib/types";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  dayName: string;
  planMode: PlanMode;
  programName?: string | null;
  gradeSummary: string;
  scopeLabel?: string | null;
};

export function TodaySessionHeader({
  dayName,
  planMode,
  programName,
  gradeSummary,
  scopeLabel,
}: Props) {
  const tr = useTranslations("ui");
  const planLabel =
    planMode === "custom" ? programName ?? tr("customSelection") : tr("examProgram");

  const eyebrowParts = [planLabel];
  if (scopeLabel) eyebrowParts.push(scopeLabel);
  eyebrowParts.push(gradeSummary);

  return (
    <header className="material-bar sticky top-0 z-30 -mx-4 border-b border-border/80 px-4 pt-3 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="label-font text-primary text-xs uppercase tracking-wider">
            {eyebrowParts.join(" · ")}
          </p>
          <h1 className="text-3xl font-medium capitalize tracking-tight text-foreground">
            {dayName}
          </h1>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={tr("openCalendar")}
          >
            <Link href="/calendar">
              <CalendarDays className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={tr("setupTraining")}
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
