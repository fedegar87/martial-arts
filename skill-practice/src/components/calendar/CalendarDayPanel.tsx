import type { UiTranslator } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/labels";

import { AddFreePracticeSheet } from "@/components/calendar/AddFreePracticeSheet";
import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import { PracticeCompletionToggle } from "@/components/calendar/PracticeCompletionToggle";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { Badge } from "@/components/ui/badge";
import type {
  CalendarDayView,
  CalendarSkill,
  FreePracticeItem,
  ScheduledPracticeItem,
} from "@/lib/types";
import { CalendarDays, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  day: CalendarDayView | undefined;
  skillOptions: CalendarSkill[];
  publicVapidKey?: string;
  eventReminderTime?: string;
};

export function CalendarDayPanel({
  day,
  skillOptions,
  publicVapidKey = "",
  eventReminderTime = "09:00",
}: Props) {
  const tr = useTranslations("ui");
  if (!day) return null;

  const title = new Date(`${day.date}T00:00:00Z`).toLocaleDateString(
    tr("locale"),
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );
  const scheduledSkillIds = day.scheduled.map((item) => item.skill.id);

  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold capitalize">{title}</h2>
          <DaySubtitle day={day} />
        </div>
        <DayBadge day={day} />
      </header>

      {day.events.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium uppercase">
            {tr("federationEvents")}
          </h3>
          <div className="divide-border divide-y">
            {day.events.map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                publicVapidKey={publicVapidKey}
                reminderTime={eventReminderTime}
              />
            ))}
          </div>
        </section>
      )}

      {day.scheduled.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            {tr("scheduledSession")}
          </h3>
          <div className="space-y-2">
            {day.scheduled.map((item) => (
              <ScheduledPracticeRow
                key={item.planItemId}
                item={item}
                dateKey={day.date}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            {tr("freePractice")}
          </h3>
          <AddFreePracticeSheet
            dateKey={day.date}
            skills={skillOptions}
            scheduledSkillIds={scheduledSkillIds}
            disabled={!day.canToggle}
          />
        </div>
        {day.freePractice.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tr("noFreePractice")}
          </p>
        ) : (
          <div className="space-y-2">
            {day.freePractice.map((item) => (
              <FreePracticeRow
                key={item.log.id}
                item={item}
                dateKey={day.date}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function DaySubtitle({ day }: { day: CalendarDayView }) {
  const tr = useTranslations("ui");
  if (day.sessionKind === "training") {
    return (
      <p className="text-sm text-muted-foreground">
        {day.scheduled.length} {tr("exerciseTarget")} {day.repsPerForm}x
      </p>
    );
  }

  if (day.sessionKind === "expired") {
    return (
      <p className="text-sm text-muted-foreground">
        {tr("planEndedOn")} {formatShortDate(tr, day.scheduleEndDate)}
      </p>
    );
  }

  if (day.sessionKind === "rest_day") {
    return (
      <p className="text-sm text-muted-foreground">{tr("noExpectedSession")}</p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">{tr("noScheduledSession")}</p>
  );
}

function DayBadge({ day }: { day: CalendarDayView }) {
  const tr = useTranslations("ui");
  if (day.sessionKind === "training") {
    return (
      <Badge variant="outline">
        <CalendarDays className="mr-1 h-3 w-3" />
        {tr("session")} {(day.sessionIndex ?? 0) + 1}
      </Badge>
    );
  }

  if (day.sessionKind === "rest_day") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Moon className="mr-1 h-3 w-3" />
        {tr("rest")}
      </Badge>
    );
  }

  if (day.isFuture) {
    return <Badge variant="outline">{tr("future")}</Badge>;
  }

  return <Badge variant="outline">{tr("journal")}</Badge>;
}

function ScheduledPracticeRow({
  item,
  dateKey,
}: {
  item: ScheduledPracticeItem;
  dateKey: string;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-border p-3">
      <PlanStatusDot status={item.status} />
      <SkillSummary skill={item.skill} />
      <div className="hidden flex-wrap items-center justify-end gap-1 sm:flex">
        <DisciplineBadge discipline={item.skill.discipline} />
        <StatusBadge status={item.status} />
      </div>
      <PracticeCompletionToggle
        skillId={item.skill.id}
        dateKey={dateKey}
        done={item.done}
        disabled={!item.canToggle}
        kind="scheduled"
      />
    </div>
  );
}

function FreePracticeRow({
  item,
  dateKey,
}: {
  item: FreePracticeItem;
  dateKey: string;
}) {
  const tr = useTranslations("ui");
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-border p-3">
      <SkillSummary skill={item.skill} />
      <div className="hidden flex-wrap items-center justify-end gap-1 sm:flex">
        <DisciplineBadge discipline={item.skill.discipline} />
        <Badge variant="outline">{tr("outsideSession")}</Badge>
        {item.hasNote && <Badge variant="outline">{tr("noteLowercase")}</Badge>}
      </div>
      <PracticeCompletionToggle
        skillId={item.skill.id}
        dateKey={dateKey}
        done={item.done}
        disabled={!item.canToggle}
        kind="free"
      />
    </div>
  );
}

function SkillSummary({ skill }: { skill: CalendarSkill }) {
  const tr = useTranslations("ui");
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium">{skill.name}</div>
      {(skill.subtitle ?? skill.name_italian) && (
        <div className="truncate text-xs text-muted-foreground">
          {skill.subtitle ?? skill.name_italian}
        </div>
      )}
      <div className="mt-1 text-xs text-muted-foreground sm:hidden">
        {categoryLabel(skill.category, tr)}
      </div>
    </div>
  );
}

function formatShortDate(tr: UiTranslator, date: string | null): string {
  if (!date) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(tr("locale"), {
    day: "numeric",
    month: "short",
  });
}
