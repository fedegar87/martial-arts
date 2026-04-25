import { CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { PracticeDay } from "@/lib/queries/progress";

type Props = {
  days: PracticeDay[];
  currentStreak: number;
  bestStreak: number;
};

export function PracticeCalendar({
  days,
  currentStreak,
  bestStreak,
}: Props) {
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <SectionHeader icon={CalendarDays} title="Pratica recente" />
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} skill`}
            className={`h-3 w-3 rounded-sm ${intensity(day.count)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="Streak" value={currentStreak} />
        <Stat label="Record" value={bestStreak} />
        <Stat label="Giorni" value={days.filter((day) => day.count > 0).length} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted p-2">
      <div className="font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

function intensity(count: number): string {
  if (count <= 0) return "bg-muted";
  if (count === 1) return "bg-primary/30";
  if (count === 2) return "bg-primary/60";
  return "bg-primary";
}
