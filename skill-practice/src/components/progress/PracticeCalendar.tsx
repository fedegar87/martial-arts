import { SectionHeader } from "@/components/progress/SectionHeader";
import { Button } from "@/components/ui/button";
import type { UiTranslator } from "@/lib/i18n/config";
import type { PracticeDay } from "@/lib/queries/progress";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  days: PracticeDay[];
};

export function PracticeCalendar({ days }: Props) {
  const tr = useTranslations("ui");
  const weeks = buildWeeks(days);
  const monthLabels = buildMonthLabels(weeks);
  const practicedCount = days.filter((day) => day.practiced).length;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarDays}
        title={tr("practiceCalendar")}
        right={
          practicedCount > 0 ? (
            <span className="text-xs text-muted-foreground">
              {tr("last90Days")}
            </span>
          ) : undefined
        }
      />
      {practicedCount === 0 ? (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {tr("noPractice90Days")}
          </p>
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href="/today">{tr("goTraining")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="grid grid-cols-[1.75rem_1fr] gap-2">
              <div aria-hidden />
              <div
                aria-hidden
                className="grid gap-1 text-[0.62rem] leading-none text-muted-foreground"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {monthLabels.map((label, index) => (
                  <span key={index} className="truncate">
                    {label ?? ""}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[1.75rem_1fr] gap-2">
              <div
                aria-hidden
                className="grid grid-rows-7 gap-1 text-right text-[0.62rem] leading-none text-muted-foreground"
              >
                {WEEKDAY_LABELS(tr).map((label, index) => (
                  <span key={index} className="flex items-center justify-end">
                    {label}
                  </span>
                ))}
              </div>
              <div
                role="img"
                aria-label={tr("practiceMapLabel", {
                  p0: practicedCount,
                  p1: practicedCount === 1 ? tr("day") : tr("days"),
                })}
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                    {week.map((day, dayIndex) =>
                      day ? (
                        <div
                          key={day.date}
                          aria-hidden
                          title={`${formatDate(tr, day.date)}: ${day.practiced ? tr("practiced") : tr("notPracticedLowercase")}`}
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
          </div>
          <p className="text-sm text-muted-foreground">
            {practicedCount} {practicedCount === 1 ? tr("day") : tr("days")}{" "}
            {tr("practicedLast90")}
          </p>
        </>
      )}
    </section>
  );
}

function WEEKDAY_LABELS(tr: UiTranslator) {
  return [
    tr("mondayShort"),
    tr("tuesdayShort"),
    tr("wednesdayShort"),
    tr("thursdayShort"),
    tr("fridayShort"),
    tr("saturdayShort"),
    tr("sundayShort"),
  ];
}
const MONTH_LABELS = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

type CalendarCell = PracticeDay | null;

function buildMonthLabels(weeks: CalendarCell[][]): (string | null)[] {
  let lastMonth: number | null = null;
  return weeks.map((week) => {
    const firstDay = week.find((cell): cell is PracticeDay => cell !== null);
    if (!firstDay) return null;
    const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
    if (month === lastMonth) return null;
    lastMonth = month;
    return MONTH_LABELS[month];
  });
}

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

function formatDate(tr: UiTranslator, date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(tr("locale"), {
    day: "numeric",
    month: "short",
  });
}
