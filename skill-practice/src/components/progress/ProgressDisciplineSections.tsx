"use client";

import { useState } from "react";
import { CurriculumMap } from "@/components/progress/CurriculumMap";
import { CompetenceRadar } from "@/components/progress/CompetenceRadar";
import { ExamProgress } from "@/components/progress/ExamProgress";
import { JourneyTimeline } from "@/components/progress/JourneyTimeline";
import { gradesForDiscipline } from "@/lib/grades";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type {
  CategoryAxis,
  CurriculumCell,
  ExamProgressInfo,
} from "@/lib/queries/progress";
import type { Discipline } from "@/lib/types";

export type ProgressDisciplineView = {
  discipline: Discipline;
  userLevel: number;
  cells: CurriculumCell[];
  axes: CategoryAxis[];
  examProgress: ExamProgressInfo | null;
};

type Props = {
  defaultDiscipline: Discipline;
  views: ProgressDisciplineView[];
};

export function ProgressDisciplineSections({
  defaultDiscipline,
  views,
}: Props) {
  const [active, setActive] = useState(defaultDiscipline);
  const view = views.find((item) => item.discipline === active) ?? views[0];

  if (!view) return null;

  return (
    <div className="space-y-6">
      {views.length > 1 && (
        <div
          className="inline-flex rounded-lg bg-muted p-1 shadow-[inset_0_0_0_0.5px_var(--separator)]"
          role="tablist"
          aria-label="Disciplina progressi"
        >
          {views.map((item) => (
            <button
              key={item.discipline}
              type="button"
              role="tab"
              aria-selected={item.discipline === view.discipline}
              className={`tap-feedback label-font min-h-10 min-w-24 rounded-md px-3 text-sm ${
                item.discipline === view.discipline
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActive(item.discipline)}
            >
              {DISCIPLINE_LABELS[item.discipline]}
            </button>
          ))}
        </div>
      )}

      {view.examProgress && <ExamProgress progress={view.examProgress} />}
      <CurriculumMap cells={view.cells} />
      <CompetenceRadar axes={view.axes} />
      <JourneyTimeline
        grades={gradesForDiscipline(view.discipline)}
        currentLevel={view.userLevel}
      />
    </div>
  );
}
