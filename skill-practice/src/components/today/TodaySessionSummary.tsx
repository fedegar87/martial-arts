import { MetricStrip } from "@/components/shared/MetricStrip";

type Props = {
  exerciseCount: number;
  completedCount: number;
  estimatedMinutes: number;
  repsPerForm: number;
  cadenceWeeks: 1 | 2 | 4;
  weekDoneCount: number;
};

export function TodaySessionSummary({
  exerciseCount,
  completedCount,
  estimatedMinutes,
  repsPerForm,
  cadenceWeeks,
  weekDoneCount,
}: Props) {
  return (
    <section className="space-y-2" aria-label="Sintesi sessione">
      <MetricStrip
        metrics={[
          { label: "Esercizi", value: exerciseCount },
          { label: "Fatto", value: `${completedCount}/${exerciseCount}` },
          { label: "Ripetizioni", value: `${repsPerForm}x` },
          { label: "Tempo", value: `${estimatedMinutes}m` },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Ripasso {cadenceText(cadenceWeeks)}. Questa settimana:{" "}
        {weekDoneCount} {weekDoneCount === 1 ? "giorno" : "giorni"} praticati.
      </p>
    </section>
  );
}

function cadenceText(weeks: 1 | 2 | 4): string {
  if (weeks === 1) return "settimanale";
  if (weeks === 2) return "ogni 2 settimane";
  return "ogni mese";
}
