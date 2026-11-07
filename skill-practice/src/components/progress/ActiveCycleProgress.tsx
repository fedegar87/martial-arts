import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ActiveCycleProgress as ActiveCycleProgressData } from "@/lib/queries/progress";
import { CalendarCheck2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  progress: ActiveCycleProgressData;
};

export function ActiveCycleProgress({ progress }: Props) {
  const tr = useTranslations("ui");
  const due = progress.dueUntilToday;
  const completed = Math.max(0, Math.min(progress.respectedUntilToday, due));
  const percentage = due > 0 ? (completed / due) * 100 : 0;

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarCheck2}
        title={tr("activeCycle")}
        right={
          <span className="text-xs text-muted-foreground">
            {progress.periodLabel}
          </span>
        }
      />
      {due > 0 ? (
        <div
          role="progressbar"
          aria-label={tr("completedSessionsToDate")}
          aria-valuemin={0}
          aria-valuemax={due}
          aria-valuenow={completed}
          aria-valuetext={tr("sessionsToDate", {
            p0: completed,
            p1: due,
            p2:
              due === 1
                ? tr("scheduledSessionCompletedSingular")
                : tr("scheduledSessionCompletedPlural"),
          })}
          className="space-y-2"
        >
          <p className="text-sm">
            <span className="font-mono font-semibold">
              {completed} / {due}
            </span>{" "}
            {due === 1
              ? tr("sessionCompletedSingular")
              : tr("sessionCompletedPlural")}{" "}
            {tr("toDate")}
          </p>
          <div className="h-2 overflow-hidden rounded-md border border-border/40 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {tr("noSessionsToDate")}
        </p>
      )}
    </section>
  );
}
