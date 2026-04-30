import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Flame, Repeat, Wrench } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getUnreadNewsCount } from "@/lib/queries/news";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getScheduledSession } from "@/lib/session-scheduler";
import { localDateKey } from "@/lib/date";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { RestDayCard } from "@/components/today/RestDayCard";
import { NewsBanner } from "@/components/news/NewsBanner";
import { Button } from "@/components/ui/button";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline } from "@/lib/grades";

export default async function TodayPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [items, logs, unreadNewsCount, schedule] = await Promise.all([
    getUserPlanItems(profile.id, undefined, sourceFilter),
    getThisWeekLogs(profile.id),
    getUnreadNewsCount(profile),
    getTrainingSchedule(profile.id),
  ]);

  const todayStr = localDateKey();
  const session = getScheduledSession(todayStr, schedule, items);

  // 1) No plan → empty state come prima
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="no_plan" customMode={profile.plan_mode === "custom"} />
      </div>
    );
  }

  // 2) No schedule → CTA al setup
  if (session.kind === "no_schedule") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="no_schedule" />
      </div>
    );
  }

  // 3) Schedule scaduta → CTA al setup
  if (session.kind === "expired") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="expired" />
      </div>
    );
  }

  // 4) Riposo
  if (session.kind === "rest_day") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <RestDayCard nextTrainingDate={session.nextTrainingDate} />
      </div>
    );
  }

  // 5) Training day
  const dailyItems = [...session.focus, ...session.review, ...session.maintenance];
  const dailyCount = dailyItems.length;
  const estimatedMinutes = Math.max(
    1,
    Math.round(
      dailyItems.reduce(
        (total, item) => total + (item.skill.estimated_duration_seconds ?? 180),
        0,
      ) / 60,
    ),
  );

  const doneTodaySkillIds = new Set(
    logs.filter((l) => l.date === todayStr && l.completed).map((l) => l.skill_id),
  );

  const dayName = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const weekDoneCount = new Set(logs.filter((l) => l.completed).map((l) => l.date)).size;

  return (
    <div className="space-y-6">
      <header className="material-bar sticky top-0 z-30 -mx-4 space-y-4 border-b border-border px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Ciao {profile.display_name}</p>
            <h1 className="text-2xl font-semibold capitalize">Oggi - {dayName}</h1>
            <p className="text-muted-foreground text-sm">
              {DISCIPLINE_LABELS.shaolin}{" "}
              {gradeLabelForDiscipline("shaolin", profile.assigned_level_shaolin)}
              {profile.assigned_level_taichi > 0 &&
                ` · ${DISCIPLINE_LABELS.taichi} ${gradeLabelForDiscipline(
                  "taichi",
                  profile.assigned_level_taichi,
                )}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" aria-label="Calendario sessioni">
              <Link href="/sessions/calendar"><CalendarDays className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions/setup">Modifica sessioni</Link>
            </Button>
          </div>
        </div>

        <MetricStrip
          metrics={[
            { label: "Oggi", value: dailyCount },
            { label: "Tempo", value: `${estimatedMinutes}m` },
            { label: "Cadenza", value: cadenceLabel(schedule!.cadence_weeks) },
            { label: "Settimana", value: weekDoneCount },
          ]}
        />
      </header>

      <NewsBanner unreadCount={unreadNewsCount} />

      <div className="space-y-6">
        {session.focus.length > 0 && (
          <Section icon={<Flame className="text-primary h-4 w-4" />} title="Focus">
            {session.focus.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
              />
            ))}
          </Section>
        )}
        {session.review.length > 0 && (
          <Section icon={<Repeat className="h-4 w-4 text-[var(--status-warning)]" />} title="Ripasso">
            {session.review.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
              />
            ))}
          </Section>
        )}
        {session.maintenance.length > 0 && (
          <Section icon={<Wrench className="text-muted-foreground h-4 w-4" />} title="Mantenimento">
            {session.maintenance.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-medium">{icon}{title}</h2>
      {children}
    </section>
  );
}

function cadenceLabel(weeks: number): string {
  if (weeks === 1) return "1 sett";
  if (weeks === 2) return "2 sett";
  return "1 mese";
}
