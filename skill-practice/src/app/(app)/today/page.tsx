import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, Repeat, Wrench } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getUnreadNewsCount } from "@/lib/queries/news";
import { getTodayPractice } from "@/lib/practice-logic";
import { localDateKey } from "@/lib/date";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { DisciplineFilter } from "@/components/today/DisciplineFilter";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { NewsBanner } from "@/components/news/NewsBanner";
import { Button } from "@/components/ui/button";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline } from "@/lib/grades";
import type { Discipline } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function TodayPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const filter: Discipline | undefined =
    d === "shaolin" || d === "taichi" ? d : undefined;
  const practicesBoth = profile.assigned_level_taichi > 0;

  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const items = await getUserPlanItems(profile.id, filter, sourceFilter);
  const logs = await getThisWeekLogs(profile.id);
  const unreadNewsCount = await getUnreadNewsCount(profile);

  const todayStr = localDateKey();
  const doneTodaySkillIds = new Set(
    logs
      .filter((l) => l.date === todayStr && l.completed)
      .map((l) => l.skill_id),
  );

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState customMode={profile.plan_mode === "custom"} />
      </div>
    );
  }

  const daily = getTodayPractice(items, filter);
  const dailyItems = [...daily.focus, ...daily.review, ...daily.maintenance];
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
  const planLabel =
    profile.plan_mode === "custom" ? "Selezione libera" : "Programma esame";
  const planHref = profile.plan_mode === "custom" ? "/plan/custom" : "/plan/exam";

  const dayName = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const weekDoneCount = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  ).size;

  return (
    <div className="space-y-6">
      <header className="material-bar sticky top-0 z-30 -mx-4 space-y-4 border-b border-border px-4 py-4">
        <div>
          <p className="text-muted-foreground text-sm">
            Ciao {profile.display_name}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold capitalize">
                Oggi - {dayName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {DISCIPLINE_LABELS.shaolin}{" "}
                {gradeLabelForDiscipline(
                  "shaolin",
                  profile.assigned_level_shaolin,
                )}
                {profile.assigned_level_taichi > 0 &&
                  ` · ${DISCIPLINE_LABELS.taichi} ${gradeLabelForDiscipline(
                    "taichi",
                    profile.assigned_level_taichi,
                  )}`}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={planHref}>Modifica piano</Link>
            </Button>
          </div>
        </div>

        <MetricStrip
          metrics={[
            { label: "Piano", value: planLabel },
            { label: "Oggi", value: dailyCount },
            { label: "Tempo", value: `${estimatedMinutes}m` },
            { label: "Settimana", value: weekDoneCount },
          ]}
        />
        <Button asChild className="w-full">
          <Link href="#sessione">Inizia sessione</Link>
        </Button>
      </header>

      <NewsBanner unreadCount={unreadNewsCount} />

      {practicesBoth && <DisciplineFilter current={filter ?? "all"} />}

      <div id="sessione" className="scroll-mt-40 space-y-6">
        {daily.focus.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Flame className="text-primary h-4 w-4" />
            Focus
          </h2>
          {daily.focus.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
        )}

        {daily.review.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Repeat className="h-4 w-4 text-[var(--status-warning)]" />
            Ripasso
          </h2>
          {daily.review.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
        )}

        {daily.maintenance.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Wrench className="text-muted-foreground h-4 w-4" />
            Mantenimento
          </h2>
          {daily.maintenance.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
        )}
      </div>

      <footer className="text-muted-foreground hairline border-t pt-4 text-sm">
        Questa settimana: {weekDoneCount} giorni di pratica
      </footer>
    </div>
  );
}
