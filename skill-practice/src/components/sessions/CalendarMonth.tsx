import { Moon, Dumbbell } from "lucide-react";
import type { ScheduledSession } from "@/lib/session-scheduler";

type Row = { date: string; session: ScheduledSession };
type Props = { monthLabel: string; rows: Row[] };

export function CalendarMonth({ monthLabel, rows }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-muted-foreground sticky top-0 bg-background py-1 text-xs font-medium uppercase tracking-wide">
        {monthLabel}
      </h2>
      <ul className="border-border divide-y divide-border rounded-lg border">
        {rows.map((row) => (
          <CalendarRow key={row.date} row={row} />
        ))}
      </ul>
    </section>
  );
}

function CalendarRow({ row }: { row: Row }) {
  const date = new Date(`${row.date}T00:00:00Z`);
  const label = date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
  const session = row.session;
  return (
    <li className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="capitalize">{label}</span>
      {session.kind === "training" ? (
        <span className="flex items-center gap-2 text-foreground">
          <Dumbbell className="h-3.5 w-3.5" />
          {session.focus.length + session.review.length + session.maintenance.length} forme
        </span>
      ) : (
        <span className="text-muted-foreground flex items-center gap-2">
          <Moon className="h-3.5 w-3.5" />
          riposo
        </span>
      )}
    </li>
  );
}
