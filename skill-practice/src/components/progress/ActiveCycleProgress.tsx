import { CalendarCheck2 } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ActiveCycleProgress as ActiveCycleProgressData } from "@/lib/queries/progress";

type Props = {
  progress: ActiveCycleProgressData;
};

export function ActiveCycleProgress({ progress }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarCheck2}
        title="Ciclo sessioni attivo"
        right={<span className="text-xs text-muted-foreground">{progress.periodLabel}</span>}
      />
      <MetricStrip
        metrics={[
          {
            label: "Fino a oggi",
            value: `${progress.respectedUntilToday} / ${progress.dueUntilToday}`,
          },
          {
            label: "Totale ciclo",
            value: `${progress.respectedTotal} / ${progress.sessionTotal}`,
          },
        ]}
      />
    </section>
  );
}
