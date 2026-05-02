import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ScheduledSession,
} from "@/lib/session-scheduler";
import { addDaysToDateKey, localDateKey } from "@/lib/date";
import {
  GeneratedPlanCalendar,
  type CalendarView,
} from "@/components/sessions/GeneratedPlanCalendar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = { searchParams: Promise<{ view?: string; date?: string }> };

type CalendarRange = {
  from: string;
  to: string;
  activeFrom: string;
  activeTo: string;
};

export default async function CalendarPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [schedule, items] = await Promise.all([
    getTrainingSchedule(profile.id),
    getUserPlanItems(profile.id, undefined, sourceFilter),
  ]);

  if (!schedule) {
    return (
      <EmptyState
        title="Nessuna sessione programmata"
        description="Definisci prima i giorni e la durata."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Definisci sessioni</Link>
          </Button>
        }
      />
    );
  }

  const scheduledItems = getScheduledPlanItems(items, schedule, profile.plan_mode);
  if (scheduledItems.length === 0) {
    return (
      <EmptyState
        title="Nessun esercizio nelle sessioni"
        description="Modifica l'ambito delle sessioni o controlla il piano attivo."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Modifica sessioni</Link>
          </Button>
        }
      />
    );
  }

  const { view: rawView, date: rawDate } = await searchParams;
  const view = parseCalendarView(rawView);
  const today = localDateKey();
  const selectedDate = clampDateKey(
    parseDateKey(rawDate) ?? today,
    schedule.start_date,
    schedule.end_date,
  );
  const range = getCalendarRange(view, selectedDate);
  const rows = listSessionsInRange(
    range.from,
    range.to,
    schedule,
    scheduledItems,
  );
  const previousDate = shiftCalendarDate(view, selectedDate, -1);
  const nextDate = shiftCalendarDate(view, selectedDate, 1);
  const previousRange = getCalendarRange(view, previousDate);
  const nextRange = getCalendarRange(view, nextDate);
  const totalSessions = countTrainingSessions(rows, range.activeFrom, range.activeTo);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Calendario sessioni</h1>
            <p className="text-muted-foreground text-sm">
              Dal {fmtDate(schedule.start_date)} al {fmtDate(schedule.end_date)}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/sessions/setup">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Modifica
            </Link>
          </Button>
        </div>
      </header>

      <GeneratedPlanCalendar
        view={view}
        selectedDate={selectedDate}
        rows={rows}
        scheduleStart={schedule.start_date}
        scheduleEnd={schedule.end_date}
        periodLabel={formatPeriodLabel(view, range.activeFrom, range.activeTo)}
        totalSessions={totalSessions}
        repsPerForm={schedule.reps_per_form}
        previousDate={previousDate}
        nextDate={nextDate}
        previousDisabled={previousRange.to < schedule.start_date}
        nextDisabled={nextRange.from > schedule.end_date}
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

function clampDateKey(date: string, min: string, max: string): string {
  if (date < min) return min;
  if (date > max) return max;
  return date;
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

function countTrainingSessions(
  rows: Array<{ date: string; session: ScheduledSession }>,
  from: string,
  to: string,
): number {
  return rows.filter(
    (row) =>
      row.date >= from &&
      row.date <= to &&
      row.session.kind === "training",
  ).length;
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
