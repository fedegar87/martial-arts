import { redirect } from "next/navigation";
import { Flame, Repeat, Wrench } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getTodayPractice } from "@/lib/practice-logic";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { DisciplineFilter } from "@/components/today/DisciplineFilter";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
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

  const items = await getUserPlanItems(profile.id, filter);
  const logs = await getThisWeekLogs(profile.id);

  const todayStr = new Date().toISOString().split("T")[0];
  const doneTodaySkillIds = new Set(
    logs
      .filter((l) => l.date === todayStr && l.completed)
      .map((l) => l.skill_id),
  );

  if (items.length === 0) {
    return <TodayEmptyState customMode={profile.plan_mode === "custom"} />;
  }

  const daily = getTodayPractice(items, filter);

  const dayName = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const weekDoneCount = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  ).size;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted-foreground text-sm">
          Ciao {profile.display_name}
        </p>
        <h1 className="text-2xl font-semibold capitalize">Oggi — {dayName}</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS.shaolin}{" "}
          {gradeLabelForDiscipline("shaolin", profile.assigned_level_shaolin)}
          {profile.assigned_level_taichi > 0 &&
            ` · ${DISCIPLINE_LABELS.taichi} ${gradeLabelForDiscipline(
              "taichi",
              profile.assigned_level_taichi,
            )}`}
        </p>
      </header>

      {practicesBoth && <DisciplineFilter current={filter ?? "all"} />}

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
            <Repeat className="h-4 w-4 text-amber-500" />
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

      <footer className="text-muted-foreground border-border border-t pt-4 text-sm">
        Questa settimana: {weekDoneCount} giorni di pratica
      </footer>
    </div>
  );
}
