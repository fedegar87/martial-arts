"use client";

import { useActionState, useState } from "react";
import { setupTrainingSchedule } from "@/lib/actions/training-schedule";
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
import type { TrainingSchedule } from "@/lib/types";

type Props = {
  current: TrainingSchedule | null;
  programLabel: string;
  approxFormCount: number;
};

export function SetupForm({ current, programLabel, approxFormCount }: Props) {
  const [state, action, pending] = useActionState(setupTrainingSchedule, null);
  const [weekdays, setWeekdays] = useState<number[]>(
    current?.weekdays ?? [1, 3, 5],
  );
  const [duration, setDuration] = useState<4 | 8 | 12 | 24>(12);
  const [cadence, setCadence] = useState<1 | 2 | 4>(
    current?.cadence_weeks ?? 2,
  );
  const [reps, setReps] = useState<number>(current?.reps_per_form ?? 3);

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
          <CardTitle className="text-base">Programma attivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{programLabel}</p>
        </CardContent>
      </Card>

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
          <CardTitle className="text-base">Cadenza ripasso</CardTitle>
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
          <SessionPreview formCount={approxFormCount} reps={reps} />
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
