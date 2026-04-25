import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  buildCurriculumCells,
  computeCategoryProgress,
  getProgressData,
} from "@/lib/queries/progress";
import { gradesForDiscipline } from "@/lib/grades";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { ExamProgress } from "@/components/progress/ExamProgress";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";
import { CurriculumMap } from "@/components/progress/CurriculumMap";
import { CompetenceRadar } from "@/components/progress/CompetenceRadar";
import { JourneyTimeline } from "@/components/progress/JourneyTimeline";
import type { Discipline } from "@/lib/types";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const data = await getProgressData(profile.id, profile);
  const discipline = defaultDiscipline(profile.assigned_level_shaolin, profile.assigned_level_taichi);
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
  const axes = computeCategoryProgress(cells);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Progresso</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS[discipline]}
        </p>
      </header>

      {data.examProgress && <ExamProgress progress={data.examProgress} />}
      <PracticeCalendar
        days={data.calendar}
        currentStreak={data.currentStreak}
        bestStreak={data.bestStreak}
      />
      <CurriculumMap cells={cells} />
      <CompetenceRadar axes={axes} />
      <JourneyTimeline
        grades={gradesForDiscipline(discipline)}
        currentLevel={userLevel}
      />
    </div>
  );
}

function defaultDiscipline(shaolinLevel: number, taichiLevel: number): Discipline {
  if (taichiLevel === 0) return "shaolin";
  return taichiLevel < shaolinLevel ? "taichi" : "shaolin";
}
