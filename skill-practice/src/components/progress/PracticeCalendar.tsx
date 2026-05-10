import { CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { PracticeDay } from "@/lib/queries/progress";

type Props = {
  days: PracticeDay[];
};

export function PracticeCalendar({ days }: Props) {
  const weeks = buildWeeks(days);
  const practicedCount = days.filter((day) => day.practiced).length;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarDays}
        title="Calendario pratica"
        right={<span className="text-xs text-muted-foreground">ultimi 90 giorni</span>}
      />
      <div className="grid grid-cols-[1.25rem_1fr] gap-2">
        <div className="grid grid-rows-7 gap-1 text-center text-[0.62rem] leading-none text-muted-foreground">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`${label}-${index}`} className="flex items-center justify-center">
              {label}
            </span>
          ))}
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={day.date}
                    title={`${formatDate(day.date)}: ${day.practiced ? "praticato" : "non praticato"}`}
                    aria-label={`${formatDate(day.date)}: ${day.practiced ? "praticato" : "non praticato"}`}
                    className={`aspect-square min-h-2 rounded-sm border ${cellStyle(day.practiced)}`}
                  />
                ) : (
                  <div
                    key={`blank-${weekIndex}-${dayIndex}`}
                    aria-hidden
                    className="aspect-square min-h-2 rounded-sm border border-transparent"
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {practicedCount} giorni con pratica negli ultimi 90.
      </p>
    </section>
  );
}

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];

type CalendarCell = PracticeDay | null;

function buildWeeks(days: PracticeDay[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = Array.from({ length: 7 }, () => null);

  for (const day of days) {
    const index = isoWeekday(day.date) - 1;
    if (index === 0 && currentWeek.some(Boolean)) {
      weeks.push(currentWeek);
      currentWeek = Array.from({ length: 7 }, () => null);
    }
    currentWeek[index] = day;
  }

  if (currentWeek.some(Boolean)) weeks.push(currentWeek);
  return weeks;
}

function isoWeekday(dateKey: string): number {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function cellStyle(practiced: boolean): string {
  if (practiced) {
    return "border-[color:var(--status-success)] bg-[var(--status-success)]";
  }
  return "border-border/70 bg-background";
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
