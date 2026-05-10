import { Activity } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { GeneralProgress } from "@/lib/queries/progress";

type Props = {
  progress: GeneralProgress;
};

export function GeneralProgressSummary({ progress }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Activity} title="Statistiche generali" />
      <MetricStrip
        metrics={[
          { label: "Streak", value: progress.currentStreak },
          { label: "Record", value: progress.bestStreak },
          { label: "Giorni 30gg", value: progress.practicedDays30 },
          { label: "Giorni totali", value: progress.practicedDaysTotal },
          { label: "Contenuti 30gg", value: progress.practicedSkillCount30 },
          { label: "Contenuti totali", value: progress.practicedSkillCountTotal },
          { label: "Rip. forme", value: formatInteger(progress.globalFormReps) },
        ]}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        I giorni di pratica contano completamenti e ripetizioni parziali. Le sole
        note non aumentano queste metriche.
      </p>
    </section>
  );
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("it-IT").format(value);
}
