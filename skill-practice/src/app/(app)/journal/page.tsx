import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  getCalendarDataInRange,
  getCalendarSkillOptions,
} from "@/lib/queries/calendar";
import { addDaysToDateKey, localDateKey } from "@/lib/date";
import {
  Calendar,
  type CalendarView,
} from "@/components/calendar/Calendar";

type Props = { searchParams: Promise<{ view?: string; date?: string }> };

type CalendarRange = {
  from: string;
  to: string;
  activeFrom: string;
  activeTo: string;
};

export default async function JournalPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { view: rawView, date: rawDate } = await searchParams;
  const view = parseCalendarView(rawView);
  const selectedDate = parseDateKey(rawDate) ?? localDateKey();
  const range = getCalendarRange(view, selectedDate);
  const previousDate = shiftCalendarDate(view, selectedDate, -1);
  const nextDate = shiftCalendarDate(view, selectedDate, 1);

  const [journalData, skillOptions] = await Promise.all([
    getCalendarDataInRange({
      userId: profile.id,
      profile,
      from: range.from,
      to: range.to,
    }),
    getCalendarSkillOptions(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Diario</h1>
        <p className="text-muted-foreground text-sm">
          Sessioni programmate e pratica libera.
        </p>
      </header>

      <Calendar
        view={view}
        selectedDate={selectedDate}
        days={journalData.days}
        periodLabel={formatPeriodLabel(view, range.activeFrom, range.activeTo)}
        previousDate={previousDate}
        nextDate={nextDate}
        skillOptions={skillOptions}
      />
    </div>
  );
}

function parseCalendarView(value: string | undefined): CalendarView {
  return value === "month" ? "month" : "week";
}

function parseDateKey(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === value ? value : null;
}

function getCalendarRange(view: CalendarView, date: string): CalendarRange {
  if (view === "week") {
    const from = startOfWeek(date);
    const to = addDaysToDateKey(from, 6);
    return { from, to, activeFrom: from, activeTo: to };
  }

  const activeFrom = startOfMonth(date);
  const activeTo = endOfMonth(date);
  return {
    from: startOfWeek(activeFrom),
    to: endOfWeek(activeTo),
    activeFrom,
    activeTo,
  };
}

function shiftCalendarDate(
  view: CalendarView,
  date: string,
  direction: -1 | 1,
): string {
  if (view === "week") return addDaysToDateKey(date, direction * 7);
  return addMonthsToDateKey(date, direction);
}

function startOfWeek(date: string): string {
  const weekday = isoWeekday(date);
  return addDaysToDateKey(date, -(weekday - 1));
}

function endOfWeek(date: string): string {
  return addDaysToDateKey(startOfWeek(date), 6);
}

function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

function endOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function addMonthsToDateKey(date: string, months: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return [
    targetYear,
    String(targetMonth).padStart(2, "0"),
    String(Math.min(day, lastDay)).padStart(2, "0"),
  ].join("-");
}

function isoWeekday(date: string): number {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function formatPeriodLabel(
  view: CalendarView,
  from: string,
  to: string,
): string {
  if (view === "month") {
    return new Date(`${from}T00:00:00Z`).toLocaleDateString("it-IT", {
      month: "long",
      year: "numeric",
    });
  }

  return `${fmtDate(from)} - ${fmtDate(to)}`;
}

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
