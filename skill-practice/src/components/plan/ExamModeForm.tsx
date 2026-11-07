"use client";
import { useTranslations } from "next-intl";

import { FormSelect } from "@/components/primitives/FormSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { activateExamModeFromForm } from "@/lib/actions/plan";
import type { ExamProgram } from "@/lib/types";
import { useActionState, useMemo, useState } from "react";

type Props = {
  shaolinExams: ExamProgram[];
  taichiExams: ExamProgram[];
  selectedShaolinId?: string | null;
  selectedTaichiId?: string | null;
  showTaichi: boolean;
};

export function ExamModeForm({
  shaolinExams,
  taichiExams,
  selectedShaolinId,
  selectedTaichiId,
  showTaichi,
}: Props) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(
    activateExamModeFromForm,
    null,
  );
  const [shaolinId, setShaolinId] = useState(
    selectedShaolinId ?? shaolinExams[0]?.id ?? "",
  );
  const [taichiId, setTaichiId] = useState(
    selectedTaichiId ?? taichiExams[0]?.id ?? "",
  );
  const selectedLabels = useMemo(
    () =>
      [
        shaolinExams.find((exam) => exam.id === shaolinId)?.level_name,
        taichiExams.find((exam) => exam.id === taichiId)?.level_name,
      ].filter(Boolean),
    [shaolinExams, shaolinId, taichiExams, taichiId],
  );
  const canSubmit = selectedLabels.length > 0;

  return (
    <form action={action} className="space-y-5">
      <ExamSelect
        name="examShaolinId"
        label={tr("shaolin")}
        exams={shaolinExams}
        value={shaolinId}
        onChange={setShaolinId}
      />
      {showTaichi && (
        <ExamSelect
          name="examTaichiId"
          label={tr("taichi")}
          exams={taichiExams}
          value={taichiId}
          onChange={setTaichiId}
        />
      )}

      <div className="surface-inset rounded-md p-3 text-sm">
        <div className="font-medium">{tr("planPreview")}</div>
        <p className="text-muted-foreground mt-1">
          {selectedLabels.length > 0
            ? tr("activatePlanPreview", { p0: selectedLabels.join(" + ") })
            : tr("noExamSelected")}
        </p>
      </div>

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">{tr("programUpdated")}</p>
      )}

      <Button type="submit" disabled={pending || !canSubmit}>
        {pending ? tr("saving") : tr("activateExamProgram")}
      </Button>
    </form>
  );
}

function ExamSelect({
  name,
  label,
  exams,
  value,
  onChange,
}: {
  name: string;
  label: string;
  exams: ExamProgram[];
  value: string;
  onChange: (value: string) => void;
}) {
  const tr = useTranslations("ui");
  return (
    <FormSelect
      label={label}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      helperText={
        exams.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            {tr("noExamForGrade")}
          </p>
        ) : undefined
      }
    >
      <option value="">{tr("noExam")}</option>
      {exams.map((exam) => (
        <option key={exam.id} value={exam.id}>
          {exam.level_name}
        </option>
      ))}
    </FormSelect>
  );
}
