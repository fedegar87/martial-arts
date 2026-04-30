import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import { listSessionsInRange, type ScheduledSession } from "@/lib/session-scheduler";
import { localDateKey } from "@/lib/date";
import { CalendarMonth } from "@/components/sessions/CalendarMonth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function CalendarPage() {
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

  const today = localDateKey();
  const from = today < schedule.start_date ? schedule.start_date : today;
  const rows = listSessionsInRange(from, schedule.end_date, schedule, items);
  const monthGroups = groupByMonth(rows);

  const totalSessions = rows.filter((r) => r.session.kind === "training").length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Calendario sessioni</h1>
            <p className="text-muted-foreground text-sm">
              Dal {fmtDate(from)} al {fmtDate(schedule.end_date)} · {totalSessions} sessioni
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

      <div className="space-y-6">
        {monthGroups.map((group) => (
          <CalendarMonth key={group.label} monthLabel={group.label} rows={group.rows} />
        ))}
      </div>
    </div>
  );
}

function groupByMonth(
  rows: Array<{ date: string; session: ScheduledSession }>,
): Array<{ label: string; rows: Array<{ date: string; session: ScheduledSession }> }> {
  const groups = new Map<string, Array<{ date: string; session: ScheduledSession }>>();
  for (const row of rows) {
    const key = row.date.slice(0, 7); // YYYY-MM
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return Array.from(groups.entries()).map(([key, rows]) => ({
    label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
    rows,
  }));
}

function fmtDate(d: string): string {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}
