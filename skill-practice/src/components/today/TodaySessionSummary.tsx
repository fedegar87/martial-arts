type Props = {
  exerciseCount: number;
  completedCount: number;
  repsPerForm: number;
  cadenceWeeks: 1 | 2 | 4;
  weekDoneCount: number;
};

export function TodaySessionSummary({
  exerciseCount,
  completedCount,
  repsPerForm,
  cadenceWeeks,
  weekDoneCount,
}: Props) {
  const completionPercent =
    exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;

  return (
    <section
      className="space-y-2 border-b border-border/60 pb-3"
      aria-label="Sintesi sessione"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">
          {completedCount}/{exerciseCount} esercizi completati
        </p>
        <p className="text-xs text-muted-foreground">
          {repsPerForm}x - {weekPracticeText(weekDoneCount)}
        </p>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Ripasso: {cadenceText(cadenceWeeks)}.
      </p>
    </section>
  );
}

function cadenceText(weeks: 1 | 2 | 4): string {
  if (weeks === 1) return "settimanale";
  if (weeks === 2) return "ogni 2 settimane";
  return "ogni mese";
}

function weekPracticeText(days: number): string {
  return `${days} ${days === 1 ? "giorno" : "giorni"} questa settimana`;
}
