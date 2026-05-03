import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  Dumbbell,
  Flame,
  Moon,
  Repeat,
  Wrench,
} from "lucide-react";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import { cn } from "@/lib/utils";
import type { ScheduledSession } from "@/lib/session-scheduler";
import type { PlanStatus } from "@/lib/types";

export type CalendarView = "week" | "month";

type CalendarRow = { date: string; session: ScheduledSession };

type Props = {
  view: CalendarView;
  selectedDate: string;
  rows: CalendarRow[];
  scheduleStart: string;
  scheduleEnd: string;
  periodLabel: string;
  totalSessions: number;
  repsPerForm: number;
  previousDate: string;
  nextDate: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
};

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];

const STATUS_ICONS: Record<PlanStatus, typeof Flame> = {
  focus: Flame,
  review: Repeat,
  maintenance: Wrench,
};

export function GeneratedPlanCalendar({
  view,
  selectedDate,
  rows,
  scheduleStart,
  scheduleEnd,
  periodLabel,
  totalSessions,
  repsPerForm,
  previousDate,
  nextDate,
  previousDisabled,
  nextDisabled,
}: Props) {
  const selectedRow = rows.find((row) => row.date === selectedDate);

  return (
    <div className="space-y-5">
      <CalendarToolbar
        view={view}
        selectedDate={selectedDate}
        periodLabel={periodLabel}
        totalSessions={totalSessions}
        previousDate={previousDate}
        nextDate={nextDate}
        previousDisabled={previousDisabled}
        nextDisabled={nextDisabled}
      />

      {view === "week" ? (
        <WeekCalendar
          rows={rows}
          selectedDate={selectedDate}
          scheduleStart={scheduleStart}
          scheduleEnd={scheduleEnd}
        />
      ) : (
        <MonthCalendar
          rows={rows}
          selectedDate={selectedDate}
          scheduleStart={scheduleStart}
          scheduleEnd={scheduleEnd}
        />
      )}

      <SelectedDaySession
        row={selectedRow}
        selectedDate={selectedDate}
        scheduleStart={scheduleStart}
        scheduleEnd={scheduleEnd}
        repsPerForm={repsPerForm}
      />
    </div>
  );
}

function CalendarToolbar({
  view,
  selectedDate,
  periodLabel,
  totalSessions,
  previousDate,
  nextDate,
  previousDisabled,
  nextDisabled,
}: {
  view: CalendarView;
  selectedDate: string;
  periodLabel: string;
  totalSessions: number;
  previousDate: string;
  nextDate: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold capitalize">{periodLabel}</h2>
          <p className="text-muted-foreground text-sm">
            {totalSessions} {totalSessions === 1 ? "sessione" : "sessioni"} nel
            periodo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodButton
            direction="previous"
            view={view}
            date={previousDate}
            disabled={previousDisabled}
          />
          <PeriodButton
            direction="next"
            view={view}
            date={nextDate}
            disabled={nextDisabled}
          />
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
  disabled,
}: {
  direction: "previous" | "next";
  view: CalendarView;
  date: string;
  disabled: boolean;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Periodo precedente" : "Periodo successivo";
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border";

  if (disabled) {
    return (
      <span aria-disabled="true" className={`${className} text-muted-foreground/40`}>
        <Icon className="h-4 w-4" />
      </span>
    );
  }

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
  rows,
  selectedDate,
  scheduleStart,
  scheduleEnd,
}: {
  rows: CalendarRow[];
  selectedDate: string;
  scheduleStart: string;
  scheduleEnd: string;
}) {
  return (
    <section aria-label="Settimana" className="space-y-2">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {rows.map((row) => (
          <DayCell
            key={row.date}
            row={row}
            view="week"
            selected={row.date === selectedDate}
            inCurrentMonth
            available={row.date >= scheduleStart && row.date <= scheduleEnd}
          />
        ))}
      </div>
    </section>
  );
}

function MonthCalendar({
  rows,
  selectedDate,
  scheduleStart,
  scheduleEnd,
}: {
  rows: CalendarRow[];
  selectedDate: string;
  scheduleStart: string;
  scheduleEnd: string;
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
        {rows.map((row) => (
          <DayCell
            key={row.date}
            row={row}
            view="month"
            selected={row.date === selectedDate}
            inCurrentMonth={row.date.startsWith(selectedMonth)}
            available={row.date >= scheduleStart && row.date <= scheduleEnd}
          />
        ))}
      </div>
    </section>
  );
}

function DayCell({
  row,
  view,
  selected,
  inCurrentMonth,
  available,
}: {
  row: CalendarRow;
  view: CalendarView;
  selected: boolean;
  inCurrentMonth: boolean;
  available: boolean;
}) {
  const stats = sessionStats(row.session);
  const date = new Date(`${row.date}T00:00:00Z`);
  const dayNumber = date.getUTCDate();
  const weekdayLabel = date.toLocaleDateString("it-IT", { weekday: "short" });
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
      <DayCellBody stats={stats} view={view} available={available} />
    </>
  );
  const className = cn(
    "tap-feedback flex min-h-20 flex-col gap-2 rounded-md border p-2 text-left transition-colors sm:min-h-24",
    selected
      ? "border-primary bg-primary/5"
      : "border-border bg-card hover:bg-muted/50",
    !inCurrentMonth && "bg-muted/30",
    !available && "pointer-events-none opacity-40",
  );

  if (!available) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link
      href={calendarHref(view, row.date)}
      aria-current={selected ? "date" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function DayCellBody({
  stats,
  view,
  available,
}: {
  stats: SessionStats;
  view: CalendarView;
  available: boolean;
}) {
  if (!available) {
    return <span className="text-[0.65rem] text-muted-foreground">fuori periodo</span>;
  }

  if (stats.kind !== "training") {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
        <Moon className="h-3 w-3" />
        {view === "week" ? "riposo" : ""}
      </span>
    );
  }

  if (stats.total === 0) {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
        <Circle className="h-3 w-3" />
        vuoto
      </span>
    );
  }

  return (
    <span className="space-y-1">
      <span className="flex items-center gap-1 text-[0.65rem] text-foreground">
        <Dumbbell className="h-3 w-3" />
        {stats.total}
        {view === "week" ? " esercizi" : ""}
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {(["focus", "review", "maintenance"] as PlanStatus[]).map((status) =>
          stats[status] > 0 ? (
            <span
              key={status}
              className={cn(
                "h-1.5 min-w-1.5 rounded-full",
                PLAN_STATUS_VISUALS[status].dotClassName,
              )}
              style={{ width: `${Math.min(18, 6 + stats[status] * 3)}px` }}
            />
          ) : null,
        )}
      </span>
    </span>
  );
}

function SelectedDaySession({
  row,
  selectedDate,
  scheduleStart,
  scheduleEnd,
  repsPerForm,
}: {
  row: CalendarRow | undefined;
  selectedDate: string;
  scheduleStart: string;
  scheduleEnd: string;
  repsPerForm: number;
}) {
  const formattedDate = new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString(
    "it-IT",
    { weekday: "long", day: "numeric", month: "long" },
  );

  if (!row || selectedDate < scheduleStart || selectedDate > scheduleEnd) {
    return (
      <section className="rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold capitalize">{formattedDate}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Questo giorno è fuori dalla durata del piano.
        </p>
      </section>
    );
  }

  if (row.session.kind !== "training") {
    return (
      <section className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize">{formattedDate}</h2>
            <p className="text-sm text-muted-foreground">Nessuna sessione prevista.</p>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            <Moon className="mr-1 h-3 w-3" />
            Riposo
          </Badge>
        </div>
      </section>
    );
  }

  const dailyItems = [
    ...row.session.focus,
    ...row.session.review,
    ...row.session.maintenance,
  ];

  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold capitalize">{formattedDate}</h2>
          <p className="text-sm text-muted-foreground">
            {dailyItems.length} esercizi - {repsPerForm}x
          </p>
        </div>
        <Badge variant="outline">
          <CalendarDays className="mr-1 h-3 w-3" />
          Sessione {row.session.sessionIndex + 1}
        </Badge>
      </div>

      {dailyItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Il piano non assegna esercizi a questa sessione.
        </p>
      ) : (
        <div className="space-y-5">
          <SessionSection status="focus" items={row.session.focus} />
          <SessionSection status="review" items={row.session.review} />
          <SessionSection status="maintenance" items={row.session.maintenance} />
        </div>
      )}
    </section>
  );
}

type TrainingSession = Extract<ScheduledSession, { kind: "training" }>;

function SessionSection({
  status,
  items,
}: {
  status: PlanStatus;
  items: TrainingSession[PlanStatus];
}) {
  if (items.length === 0) return null;

  const Icon = STATUS_ICONS[status];
  const visual = PLAN_STATUS_VISUALS[status];

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Icon className={cn("h-4 w-4", visual.textClassName)} />
        {visual.label}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <SessionSkillRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function SessionSkillRow({
  item,
}: {
  item: TrainingSession[PlanStatus][number];
}) {
  return (
    <Link
      href={`/skill/${item.skill.id}`}
      className="tap-feedback flex min-h-14 items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted/50"
    >
      <PlanStatusDot status={item.status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.skill.name}</span>
        {item.skill.name_italian && (
          <span className="block truncate text-xs text-muted-foreground">
            {item.skill.name_italian}
          </span>
        )}
      </span>
      <span className="hidden flex-wrap items-center justify-end gap-1 sm:flex">
        <DisciplineBadge discipline={item.skill.discipline} />
        <StatusBadge status={item.status} />
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

type SessionStats =
  | { kind: "rest_day" | "expired" | "no_schedule"; total: 0 }
  | {
      kind: "training";
      total: number;
      focus: number;
      review: number;
      maintenance: number;
    };

function sessionStats(session: ScheduledSession): SessionStats {
  if (session.kind !== "training") {
    return { kind: session.kind, total: 0 };
  }

  return {
    kind: "training",
    total:
      session.focus.length +
      session.review.length +
      session.maintenance.length,
    focus: session.focus.length,
    review: session.review.length,
    maintenance: session.maintenance.length,
  };
}

function calendarHref(view: CalendarView, date: string): string {
  return `/sessions/calendar?view=${view}&date=${date}`;
}
