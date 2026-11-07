import { CalendarCheck2 } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ActiveCycleProgress as ActiveCycleProgressData } from "@/lib/queries/progress";

type Props = {
  progress: ActiveCycleProgressData;
};

export function ActiveCycleProgress({ progress }: Props) {
  const due = progress.dueUntilToday;
  const completed = Math.max(0, Math.min(progress.respectedUntilToday, due));
  const percentage = due > 0 ? (completed / due) * 100 : 0;

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarCheck2}
        title="Ciclo sessioni attivo"
        right={<span className="text-xs text-muted-foreground">{progress.periodLabel}</span>}
      />
      {due > 0 ? (
        <div
          role="progressbar"
          aria-label="Sessioni completate fino a oggi"
          aria-valuemin={0}
          aria-valuemax={due}
          aria-valuenow={completed}
          aria-valuetext={`${completed} su ${due} ${due === 1 ? "sessione prevista completata" : "sessioni previste completate"} fino a oggi`}
          className="space-y-2"
        >
          <p className="text-sm">
            <span className="font-mono font-semibold">{completed} / {due}</span>{" "}
            {due === 1 ? "sessione completata" : "sessioni completate"} fino a oggi.
          </p>
          <div className="h-2 overflow-hidden rounded-md border border-border/40 bg-muted">
            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nessuna sessione prevista fino a oggi.
        </p>
      )}
    </section>
  );
}
