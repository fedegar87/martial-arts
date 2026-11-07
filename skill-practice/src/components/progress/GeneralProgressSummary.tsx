import { SectionHeader } from "@/components/progress/SectionHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import type { GeneralProgress } from "@/lib/queries/progress";
import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  progress: GeneralProgress;
};

export function GeneralProgressSummary({ progress }: Props) {
  const tr = useTranslations("ui");
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Activity} title={tr("generalStats")} />
      <MetricStrip
        metrics={[
          { label: tr("practiceDays"), value: progress.practicedDaysTotal },
          { label: tr("currentStreak"), value: progress.currentStreak },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        {tr("practiceCountsDescription")}
      </p>
    </section>
  );
}
