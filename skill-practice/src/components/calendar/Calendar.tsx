import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Dumbbell,
  Moon,
} from "lucide-react";
import { CalendarDayPanel } from "@/components/calendar/CalendarDayPanel";
import { cn } from "@/lib/utils";
import type { CalendarDayView, CalendarSkill } from "@/lib/types";

export type CalendarView = "week" | "month";

type Props = {
  view: CalendarView;
  selectedDate: string;
  days: CalendarDayView[];
  periodLabel: string;
  previousDate: string;
  nextDate: string;
  skillOptions?: CalendarSkill[];
};

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];

export function Calendar({
  view,
  selectedDate,
  days,
  periodLabel,
  previousDate,
  nextDate,
  skillOptions = [],
}: Props) {
  const selectedDay = days.find((day) => day.date === selectedDate);

  return (
    <div className="space-y-5">
      <CalendarToolbar
        view={view}
        selectedDate={selectedDate}
        periodLabel={periodLabel}
        previousDate={previousDate}
        nextDate={nextDate}
      />

      {view === "week" ? (
        <WeekCalendar days={days} selectedDate={selectedDate} />
      ) : (
        <MonthCalendar days={days} selectedDate={selectedDate} />
      )}

      <CalendarDayPanel day={selectedDay} skillOptions={skillOptions} />
    </div>
  );
}

function CalendarToolbar({
  view,
  selectedDate,
  periodLabel,
  previousDate,
  nextDate,
}: {
  view: CalendarView;
  selectedDate: string;
  periodLabel: string;
  previousDate: string;
  nextDate: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold capitalize">{periodLabel}</h2>
        <div className="flex items-center gap-2">
          <PeriodButton
            direction="previous"
            view={view}
            date={previousDate}
          />
          <PeriodButton direction="next" view={view} date={nextDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-1">
        <ViewLink
          label="Settimana"
          view="week"
          selectedDate={selectedDate}
          active={view === "week"}
        />
        <ViewLink
          label="Mese"
          view="month"
          selectedDate={selectedDate}
          active={view === "month"}
        />
      </div>
    </section>
  );
}

function PeriodButton({
  direction,
  view,
  date,
}: {
  direction: "previous" | "next";
  view: CalendarView;
  date: string;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Periodo precedente" : "Periodo successivo";
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border";

  return (
    <Link
      href={calendarHref(view, date)}
      aria-label={label}
      className={`${className} tap-feedback hover:bg-muted`}
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function ViewLink({
  label,
  view,
  selectedDate,
  active,
}: {
  label: string;
  view: CalendarView;
  selectedDate: string;
  active: boolean;
}) {
  return (
    <Link
      href={calendarHref(view, selectedDate)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "tap-feedback label-font min-h-10 rounded-sm px-3 py-2 text-center text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function WeekCalendar({
  days,
  selectedDate,
}: {
  days: CalendarDayView[];
  selectedDate: string;
}) {
  return (
    <section aria-label="Settimana" className="space-y-2">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            view="week"
            selected={day.date === selectedDate}
            inCurrentMonth
          />
        ))}
      </div>
    </section>
  );
}

function MonthCalendar({
  days,
  selectedDate,
}: {
  days: CalendarDayView[];
  selectedDate: string;
}) {
  const selectedMonth = selectedDate.slice(0, 7);

  return (
    <section aria-label="Mese" className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            view="month"
            selected={day.date === selectedDate}
            inCurrentMonth={day.date.startsWith(selectedMonth)}
          />
        ))}
      </div>
    </section>
  );
}

function DayCell({
  day,
  view,
  selected,
  inCurrentMonth,
}: {
  day: CalendarDayView;
  view: CalendarView;
  selected: boolean;
  inCurrentMonth: boolean;
}) {
  const date = new Date(`${day.date}T00:00:00Z`);
  const dayNumber = date.getUTCDate();
  const weekdayLabel = date.toLocaleDateString("it-IT", { weekday: "short" });
  const cellLabel = dayCellLabel(date, day);
  const content = (
    <>
      <span className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "font-mono text-sm font-semibold leading-none sm:text-base",
            !inCurrentMonth && "text-muted-foreground",
          )}
        >
          {dayNumber}
        </span>
        {view === "week" && (
          <span className="truncate text-[0.65rem] capitalize text-muted-foreground">
            {weekdayLabel}
          </span>
        )}
      </span>
      <DayCellBody day={day} />
    </>
  );
  const className = cn(
    "tap-feedback flex min-h-20 flex-col gap-2 rounded-md border p-2 text-left transition-colors sm:min-h-24",
    selected
      ? "border-primary bg-primary/5"
      : "border-border bg-card hover:bg-muted/50",
    !inCurrentMonth && "bg-muted/30",
  );

  return (
    <Link
      href={calendarHref(view, day.date)}
      aria-label={cellLabel}
      aria-current={selected ? "date" : undefined}
      className={className}
      title={cellLabel}
    >
      {content}
    </Link>
  );
}

function DayCellBody({ day }: { day: CalendarDayView }) {
  if (day.sessionKind === "training") {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] text-foreground">
        <Dumbbell className="h-3 w-3" />
        {day.scheduled.length}
      </span>
    );
  }

  if (day.freePractice.length > 0) {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] text-foreground">
        <Dumbbell className="h-3 w-3" />
      </span>
    );
  }

  if (day.sessionKind === "rest_day") {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
        <Moon className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
      <Circle className="h-3 w-3" />
    </span>
  );
}

function dayCellLabel(date: Date, day: CalendarDayView): string {
  const formattedDate = date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (day.sessionKind === "training") {
    return `${formattedDate}: ${day.scheduled.length} ${
      day.scheduled.length === 1 ? "esercizio" : "esercizi"
    }`;
  }
  if (day.freePractice.length > 0) return `${formattedDate}: pratica registrata`;
  if (day.sessionKind === "rest_day") return `${formattedDate}: riposo`;
  return `${formattedDate}: nessuna sessione`;
}

function calendarHref(view: CalendarView, date: string): string {
  return `/calendar?view=${view}&date=${date}`;
}
