import { CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { PracticeDay } from "@/lib/queries/progress";

type Props = {
  days: PracticeDay[];
};

export function PracticeCalendar({ days }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarDays}
        title="Calendario pratica"
        right={<span className="text-xs text-muted-foreground">90 giorni</span>}
      />
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} contenuti praticati`}
            aria-label={`${day.date}: ${day.count} contenuti praticati`}
            className={`h-3 w-3 rounded-sm ${intensity(day.count)}`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {days.filter((day) => day.count > 0).length} giorni con pratica negli ultimi
        90 giorni.
      </p>
    </section>
  );
}

function intensity(count: number): string {
  if (count <= 0) return "bg-muted";
  if (count === 1) return "bg-[var(--status-success-weak)]";
  if (count === 2) return "bg-[var(--status-success-medium)]";
  return "bg-[var(--status-success)]";
}
