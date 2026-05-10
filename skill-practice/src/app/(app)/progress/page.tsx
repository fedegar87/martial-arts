import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  buildCurriculumCells,
  getProgressData,
} from "@/lib/queries/progress";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { ActiveCycleProgress } from "@/components/progress/ActiveCycleProgress";
import { GeneralProgressSummary } from "@/components/progress/GeneralProgressSummary";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";
import {
  ProgressDisciplineSections,
  type ProgressDisciplineView,
} from "@/components/progress/ProgressDisciplineSections";
import { WeeklyReflectionCard } from "@/components/progress/WeeklyReflectionCard";
import {
  getCurrentWeekReflection,
  shouldPromptWeeklyReflection,
} from "@/lib/queries/reflections";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Progresso</h1>
          <p className="text-muted-foreground text-sm">
            {disciplines.map((discipline) => DISCIPLINE_LABELS[discipline]).join(" / ")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/journal">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            Apri diario
          </Link>
        </Button>
      </header>

      {shouldPromptWeeklyReflection() && !weeklyReflection && (
        <WeeklyReflectionCard />
      )}
      <GeneralProgressSummary progress={data.generalProgress} />
      <PracticeCalendar days={data.generalProgress.calendar} />
      {data.activeCycleProgress && (
        <ActiveCycleProgress progress={data.activeCycleProgress} />
      )}
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
