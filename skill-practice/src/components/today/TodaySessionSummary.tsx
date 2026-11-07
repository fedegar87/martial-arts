import type { UiTranslator } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";
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
  const tr = useTranslations("ui");
  const completionPercent =
    exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;

  return (
    <section
      className="space-y-2 border-b border-border/60 pb-3"
      aria-label={tr("sessionSummary")}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">
          <span className="font-mono text-primary font-semibold">
            {completedCount}
          </span>
          <span className="text-muted-foreground font-mono">
            /{exerciseCount}
          </span>{" "}
          {tr("completedExercises")}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground font-medium">
            {repsPerForm}x
          </span>{" "}
          · {weekPracticeText(tr, weekDoneCount)}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted border border-border/40"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_var(--tint-glow)] transition-[width] duration-500 ease-out"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      {completionPercent === 100 && (
        <p className="label-font text-xs text-primary tracking-wider">
          {tr("todayPracticeDone")}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {tr("reviewCadence")} {cadenceText(tr, cadenceWeeks)}.
      </p>
    </section>
  );
}

function cadenceText(tr: UiTranslator, weeks: 1 | 2 | 4): string {
  if (weeks === 1) return tr("weekly");
  if (weeks === 2) return tr("everyTwoWeeks");
  return tr("everyMonth");
}

function weekPracticeText(tr: UiTranslator, days: number): string {
  return tr("practiceThisWeek", { count: days });
}
