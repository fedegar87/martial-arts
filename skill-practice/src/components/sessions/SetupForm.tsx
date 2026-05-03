"use client";

import { useActionState, useState } from "react";
import { setupTrainingSchedule } from "@/lib/actions/training-schedule";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeekdayChips } from "./WeekdayChips";
import { DurationPicker } from "./DurationPicker";
import { CadencePicker } from "./CadencePicker";
import { RepsStepper } from "./RepsStepper";
import { SessionPreview } from "./SessionPreview";
import type { Discipline, PlanMode, TrainingSchedule } from "@/lib/types";

type ExamDisciplineScope = "both" | Discipline;

const ALL_DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

// Riapertura: ricostruiamo il pill "durata" dalla differenza date salvate.
// L'action ri-ancora start_date a oggi al save, quindi un re-save senza modifiche estende
// implicitamente la fine di N giorni. Comportamento voluto: "rieditare = N settimane da ora".
function durationFromSchedule(schedule: TrainingSchedule | null): 4 | 8 | 12 | 24 {
  if (!schedule) return 12;
  const start = new Date(`${schedule.start_date}T00:00:00Z`).getTime();
  const end = new Date(`${schedule.end_date}T00:00:00Z`).getTime();
  const weeks = Math.round((end - start) / (7 * 24 * 60 * 60 * 1000));
  if (!Number.isFinite(weeks)) return 12;
  const options: Array<4 | 8 | 12 | 24> = [4, 8, 12, 24];
  return options.reduce((best, opt) =>
    Math.abs(opt - weeks) < Math.abs(best - weeks) ? opt : best
  , 12 as 4 | 8 | 12 | 24);
}

type Props = {
  current: TrainingSchedule | null;
  programLabel: string;
  planMode: PlanMode;
  disciplineCounts: Record<Discipline, number>;
};

export function SetupForm({
  current,
  programLabel,
  planMode,
  disciplineCounts,
}: Props) {
  const [state, action, pending] = useActionState(setupTrainingSchedule, null);
  const availableExamDisciplines = availableDisciplines(disciplineCounts);
  const [examScope, setExamScope] = useState<ExamDisciplineScope>(() =>
    initialExamScope(current, availableExamDisciplines),
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    current?.weekdays ?? [1, 3, 5],
  );
  const [duration, setDuration] = useState<4 | 8 | 12 | 24>(durationFromSchedule(current));
  const [cadence, setCadence] = useState<1 | 2 | 4>(
    current?.cadence_weeks ?? 2,
  );
  const [reps, setReps] = useState<number>(current?.reps_per_form ?? 3);

  const showExamScope =
    planMode === "exam" && availableExamDisciplines.length > 0;
  const isSingleDiscipline =
    showExamScope && availableExamDisciplines.length === 1;
  const selectedItemCount =
    planMode === "exam"
      ? countForScope(examScope, disciplineCounts)
      : totalCount(disciplineCounts);
  const previewCount = Math.max(1, Math.min(selectedItemCount, 6));
  const canSubmit = weekdays.length > 0;
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() + duration * 7);
  const endLabel = endDate.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Piano attivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{programLabel}</p>
        </CardContent>
      </Card>

      {showExamScope ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ambito sessioni</CardTitle>
          </CardHeader>
          <CardContent>
            {isSingleDiscipline ? (
              <SingleDisciplineNotice
                discipline={availableExamDisciplines[0]}
                count={disciplineCounts[availableExamDisciplines[0]]}
              />
            ) : (
              <ExamScopePicker
                value={examScope}
                onChange={setExamScope}
                disciplineCounts={disciplineCounts}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <input
          type="hidden"
          name="exam_discipline_scope"
          value={hiddenExamScope(planMode, availableExamDisciplines)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giorni di allenamento</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekdayChips value={weekdays} onChange={setWeekdays} />
          {weekdays.length === 0 && (
            <p className="text-muted-foreground mt-2 text-xs">
              Seleziona almeno un giorno.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Durata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DurationPicker value={duration} onChange={setDuration} />
          <p className="text-muted-foreground text-xs">Fino al {endLabel}.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequenza del ripasso</CardTitle>
        </CardHeader>
        <CardContent>
          <CadencePicker value={cadence} onChange={setCadence} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ripetizioni per forma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RepsStepper value={reps} onChange={setReps} />
          <SessionPreview formCount={previewCount} reps={reps} />
        </CardContent>
      </Card>

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !canSubmit}
      >
        {pending ? "Salvataggio..." : "Genera sessioni"}
      </Button>
    </form>
  );
}

function SingleDisciplineNotice({
  discipline,
  count,
}: {
  discipline: Discipline;
  count: number;
}) {
  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name="exam_discipline_scope"
        value={discipline}
      />
      <div className="border-border bg-muted/40 flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm">
        <span className="font-medium">
          Solo {DISCIPLINE_LABELS[discipline]}
        </span>
        <span className="text-muted-foreground text-xs">
          {count} esercizi
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        Il piano d&apos;esame attivo contiene solo {DISCIPLINE_LABELS[discipline]}.
        Aggiungi l&apos;altra disciplina da Programma esame per cambiare ambito.
      </p>
    </div>
  );
}

function ExamScopePicker({
  value,
  onChange,
  disciplineCounts,
}: {
  value: ExamDisciplineScope;
  onChange: (value: ExamDisciplineScope) => void;
  disciplineCounts: Record<Discipline, number>;
}) {
  const options = [
    {
      value: "both" as const,
      label: "Entrambi",
      detail: `${totalCount(disciplineCounts)} esercizi`,
    },
    ...ALL_DISCIPLINES.filter((discipline) => disciplineCounts[discipline] > 0).map(
      (discipline) => ({
        value: discipline,
        label: DISCIPLINE_LABELS[discipline],
        detail: `${disciplineCounts[discipline]} esercizi`,
      }),
    ),
  ];

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "border-border bg-card flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm",
            value === option.value && "border-primary",
          )}
        >
          <span className="font-medium">{option.label}</span>
          <span className="text-muted-foreground text-xs">{option.detail}</span>
          <input
            type="radio"
            name="exam_discipline_scope"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
        </label>
      ))}
    </div>
  );
}

function availableDisciplines(
  counts: Record<Discipline, number>,
): Discipline[] {
  return ALL_DISCIPLINES.filter((discipline) => counts[discipline] > 0);
}

function initialExamScope(
  schedule: TrainingSchedule | null,
  available: Discipline[],
): ExamDisciplineScope {
  if (available.length === 1) return available[0];
  const selected = new Set(schedule?.exam_disciplines ?? ALL_DISCIPLINES);
  const visibleSelection = available.filter((discipline) =>
    selected.has(discipline),
  );
  if (visibleSelection.length === 1) return visibleSelection[0];
  return "both";
}

function hiddenExamScope(
  planMode: PlanMode,
  available: Discipline[],
): ExamDisciplineScope {
  if (planMode !== "exam") return "both";
  return available.length === 1 ? available[0] : "both";
}

function countForScope(
  scope: ExamDisciplineScope,
  counts: Record<Discipline, number>,
): number {
  if (scope === "both") return totalCount(counts);
  return counts[scope];
}

function totalCount(counts: Record<Discipline, number>): number {
  return counts.shaolin + counts.taichi;
}
