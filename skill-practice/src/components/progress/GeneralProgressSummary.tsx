import { Activity } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { GeneralProgress } from "@/lib/queries/progress";

type Props = {
  progress: GeneralProgress;
};

export function GeneralProgressSummary({ progress }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Activity} title="Statistiche generali" />
      <MetricStrip
        metrics={[
          { label: "Giorni di pratica", value: progress.practicedDaysTotal },
          { label: "Streak attuale", value: progress.currentStreak },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Conta qualsiasi pratica registrata, anche fuori dal ciclo.
      </p>
    </section>
  );
}
