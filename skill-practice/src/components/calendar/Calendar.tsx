import { CalendarDayPanel } from "@/components/calendar/CalendarDayPanel";
import { SegmentedNav } from "@/components/primitives/SegmentedNav";
import type { UiTranslator } from "@/lib/i18n/config";
import type { CalendarDayView, CalendarSkill } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  Dumbbell,
  Moon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export type CalendarView = "week" | "month";

type Props = {
  view: CalendarView;
  selectedDate: string;
  days: CalendarDayView[];
  periodLabel: string;
  previousDate: string;
  nextDate: string;
  skillOptions?: CalendarSkill[];
  publicVapidKey?: string;
  eventReminderTime?: string;
};

export function Calendar({
  view,
  selectedDate,
  days,
  periodLabel,
  previousDate,
  nextDate,
  skillOptions = [],
  publicVapidKey = "",
  eventReminderTime = "09:00",
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

      <CalendarDayPanel
        day={selectedDay}
        skillOptions={skillOptions}
        publicVapidKey={publicVapidKey}
        eventReminderTime={eventReminderTime}
      />
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
  const tr = useTranslations("ui");
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold capitalize">{periodLabel}</h2>
        <div className="flex items-center gap-2">
          <PeriodButton direction="previous" view={view} date={previousDate} />
          <PeriodButton direction="next" view={view} date={nextDate} />
        </div>
      </div>

      <SegmentedNav
        ariaLabel={tr("calendarView")}
        fullWidth
        items={[
          {
            href: calendarHref("week", selectedDate),
            label: tr("week"),
            active: view === "week",
          },
          {
            href: calendarHref("month", selectedDate),
            label: tr("month"),
            active: view === "month",
          },
        ]}
      />
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
  const tr = useTranslations("ui");
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label =
    direction === "previous" ? tr("previousPeriod") : tr("nextPeriod");
  const className =
    "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border";

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

function WeekCalendar({
  days,
  selectedDate,
}: {
  days: CalendarDayView[];
  selectedDate: string;
}) {
  const tr = useTranslations("ui");
  return (
    <section aria-label={tr("week")} className="space-y-2">
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
  const tr = useTranslations("ui");
  const selectedMonth = selectedDate.slice(0, 7);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(tr("locale"), {
      weekday: "narrow",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, 0, 5 + index))),
  );

  return (
    <section aria-label={tr("month")} className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-medium text-muted-foreground">
        {weekdayLabels.map((label, index) => (
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
  const tr = useTranslations("ui");
  const date = new Date(`${day.date}T00:00:00Z`);
  const dayNumber = date.getUTCDate();
  const weekdayLabel = date.toLocaleDateString(tr("locale"), {
    weekday: "short",
  });
  const cellLabel = dayCellLabel(tr, date, day);
  const content = (
    <>
      <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
      {day.events.length > 0 && (
        <CalendarDays className="text-muted-foreground h-3 w-3" aria-hidden />
      )}
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

function dayCellLabel(
  tr: UiTranslator,
  date: Date,
  day: CalendarDayView,
): string {
  const formattedDate = date.toLocaleDateString(tr("locale"), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const eventLabel = day.events.length
    ? `, ${day.events.length} ${day.events.length === 1 ? tr("federationEventSingular") : tr("federationEventPlural")}`
    : "";
  if (day.sessionKind === "training") {
    return `${formattedDate}: ${day.scheduled.length} ${
      day.scheduled.length === 1 ? "esercizio" : tr("exercisesLowercase")
    }${eventLabel}`;
  }
  if (day.freePractice.length > 0)
    return tr("dayPracticed", { p0: formattedDate, p1: eventLabel });
  if (day.sessionKind === "rest_day")
    return tr("dayRest", { p0: formattedDate, p1: eventLabel });
  return tr("dayNoSession", { p0: formattedDate, p1: eventLabel });
}

function calendarHref(view: CalendarView, date: string): string {
  return `/calendar?view=${view}&date=${date}`;
}
