import { CalendarDays, Moon } from "lucide-react";
import { AddFreePracticeSheet } from "@/components/calendar/AddFreePracticeSheet";
import { PracticeCompletionToggle } from "@/components/calendar/PracticeCompletionToggle";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import type {
  FreePracticeItem,
  JournalDayView,
  JournalSkill,
  ScheduledPracticeItem,
} from "@/lib/types";

type Props = {
  day: JournalDayView | undefined;
  skillOptions: JournalSkill[];
};

export function CalendarDayPanel({ day, skillOptions }: Props) {
  if (!day) return null;

  const title = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

      {day.scheduled.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            Sessione programmata
          </h3>
          <div className="space-y-2">
            {day.scheduled.map((item) => (
              <ScheduledPracticeRow key={item.planItemId} item={item} dateKey={day.date} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyScheduledState day={day} />
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">
            Pratica libera
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
            Nessuna pratica libera registrata.
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

function DaySubtitle({ day }: { day: JournalDayView }) {
  if (day.sessionKind === "training") {
    return (
      <p className="text-sm text-muted-foreground">
        {day.scheduled.length} esercizi - target {day.repsPerForm}x
      </p>
    );
  }

  if (day.sessionKind === "expired") {
    return (
      <p className="text-sm text-muted-foreground">
        Piano concluso il {formatShortDate(day.scheduleEndDate)}
      </p>
    );
  }

  if (day.sessionKind === "rest_day") {
    return <p className="text-sm text-muted-foreground">Nessuna sessione prevista.</p>;
  }

  return <p className="text-sm text-muted-foreground">Nessuna sessione programmata.</p>;
}

function DayBadge({ day }: { day: JournalDayView }) {
  if (day.sessionKind === "training") {
    return (
      <Badge variant="outline">
        <CalendarDays className="mr-1 h-3 w-3" />
        Sessione {(day.sessionIndex ?? 0) + 1}
      </Badge>
    );
  }

  if (day.sessionKind === "rest_day") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Moon className="mr-1 h-3 w-3" />
        Riposo
      </Badge>
    );
  }

  if (day.isFuture) {
    return <Badge variant="outline">Futuro</Badge>;
  }

  return <Badge variant="outline">Diario</Badge>;
}

function EmptyScheduledState({ day }: { day: JournalDayView }) {
  if (day.sessionKind === "rest_day" && day.freePractice.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Riposo. Nessuna pratica registrata.
      </p>
    );
  }

  if (day.sessionKind !== "training") {
    return (
      <p className="text-sm text-muted-foreground">
        Nessuna sessione programmata.
      </p>
    );
  }

  return null;
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
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-border p-3">
      <SkillSummary skill={item.skill} />
      <div className="hidden flex-wrap items-center justify-end gap-1 sm:flex">
        <DisciplineBadge discipline={item.skill.discipline} />
        <Badge variant="outline">fuori sessione</Badge>
        {item.hasNote && <Badge variant="outline">nota</Badge>}
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

function SkillSummary({ skill }: { skill: JournalSkill }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium">{skill.name}</div>
      {skill.name_italian && (
        <div className="truncate text-xs text-muted-foreground">
          {skill.name_italian}
        </div>
      )}
      <div className="mt-1 text-xs text-muted-foreground sm:hidden">
        {SKILL_CATEGORY_LABELS[skill.category]}
      </div>
    </div>
  );
}

function formatShortDate(date: string | null): string {
  if (!date) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
