import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  buildCurriculumCells,
  getProgressData,
} from "@/lib/queries/progress";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";
import { MetricStrip } from "@/components/shared/MetricStrip";
import {
  ProgressDisciplineSections,
  type ProgressDisciplineView,
} from "@/components/progress/ProgressDisciplineSections";
import { WeeklyReflectionCard } from "@/components/progress/WeeklyReflectionCard";
import {
  getCurrentWeekReflection,
  shouldPromptWeeklyReflection,
} from "@/lib/queries/reflections";
import type { Discipline } from "@/lib/types";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const data = await getProgressData(profile.id, profile);
  const disciplines = activeDisciplines(profile.assigned_level_taichi);
  const defaultActive = defaultDiscipline(
    profile.assigned_level_shaolin,
    profile.assigned_level_taichi,
  );
  const views: ProgressDisciplineView[] = disciplines.map((discipline) => {
    const userLevel =
      discipline === "shaolin"
        ? profile.assigned_level_shaolin
        : profile.assigned_level_taichi;
    const cells = buildCurriculumCells(
      data.skills,
      data.planBySkillId,
      discipline,
      userLevel,
    );
    return {
      discipline,
      cells,
      planProgress: data.planProgressByDiscipline[discipline] ?? null,
    };
  });
  const weeklyReflection = await getCurrentWeekReflection(profile.id);
  const daysThisMonth = data.calendar.slice(-30).filter((day) => day.count > 0).length;
  const activePlanCount = data.planBySkillId.size;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Progresso</h1>
        <p className="text-muted-foreground text-sm">
          {disciplines.map((discipline) => DISCIPLINE_LABELS[discipline]).join(" / ")}
        </p>
      </header>

      {shouldPromptWeeklyReflection() && !weeklyReflection && (
        <WeeklyReflectionCard />
      )}
      <MetricStrip
        metrics={[
          { label: "Streak", value: data.currentStreak },
          { label: "Giorni 30gg", value: daysThisMonth },
          { label: "Praticati 30gg", value: data.recentPracticedSkillCount },
          { label: "Piano attivo", value: activePlanCount },
        ]}
      />
      <PracticeCalendar
        days={data.calendar}
        currentStreak={data.currentStreak}
        bestStreak={data.bestStreak}
      />
      <ProgressDisciplineSections
        defaultDiscipline={defaultActive}
        views={views}
      />
    </div>
  );
}

function activeDisciplines(taichiLevel: number): Discipline[] {
  return taichiLevel > 0 ? ["shaolin", "taichi"] : ["shaolin"];
}

function defaultDiscipline(shaolinLevel: number, taichiLevel: number): Discipline {
  if (taichiLevel === 0) return "shaolin";
  return taichiLevel < shaolinLevel ? "taichi" : "shaolin";
}
