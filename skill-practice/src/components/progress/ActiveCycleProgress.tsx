import { CalendarCheck2 } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ActiveCycleProgress as ActiveCycleProgressData } from "@/lib/queries/progress";

type Props = {
  progress: ActiveCycleProgressData;
};

export function ActiveCycleProgress({ progress }: Props) {
  const rows = progress.summary.rows;
  const dueRows = rows.filter((row) => row.date <= progress.todayKey);
  const completedRows = rows.filter((row) => row.status === "completed");
  const partialRows = rows.filter((row) => row.status === "partial");
  const missedRows = rows.filter(
    (row) => row.status === "not_started" && row.date < progress.todayKey,
  );
  const dueExercises = sum(dueRows, (row) => row.exerciseTotal);
  const dueCompleted = sum(dueRows, (row) => row.exerciseCompleted);
  const adherencePercent =
    dueExercises > 0 ? Math.round((dueCompleted / dueExercises) * 100) : 0;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarCheck2}
        title="Ciclo sessioni attivo"
        right={
          <span className="text-xs text-muted-foreground">
            {progress.periodLabel}
          </span>
        }
      />
      <MetricStrip
        metrics={[
          {
            label: "Sessioni",
            value: `${completedRows.length}/${progress.summary.sessionTotal}`,
          },
          { label: "Aderenza", value: `${adherencePercent}%` },
          { label: "Parziali", value: partialRows.length },
          { label: "Saltate", value: missedRows.length },
          { label: "Giorni rim.", value: progress.daysRemaining },
          {
            label: "Prossima",
            value: progress.nextTrainingDate
              ? formatShortDate(progress.nextTrainingDate)
              : "-",
          },
        ]}
      />
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">
            {progress.summary.exerciseCompleted}/{progress.summary.exerciseTotal} esercizi
            completati nel ciclo
          </span>
          <span className="text-muted-foreground">
            {progress.summary.repsDone}/{progress.summary.repsTarget} ripetizioni
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress.summary.completionPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}
