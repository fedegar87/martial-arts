"use client";
import { gradesForDiscipline } from "@/lib/grades";

import { useTranslations } from "next-intl";

import { FormSelect } from "@/components/primitives/FormSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { updateProfileGrade } from "@/lib/actions/profile";
import { gradeLabelForDiscipline, type Grade } from "@/lib/grades";
import type { Discipline } from "@/lib/types";
import { useState, useTransition } from "react";

type Props = {
  assignedLevelShaolin: number;
  assignedLevelTaichi: number;
  locked?: boolean;
};

export function GradeEditor({
  assignedLevelShaolin,
  assignedLevelTaichi,
  locked = false,
}: Props) {
  const tr = useTranslations("ui");
  return (
    <div className="space-y-4">
      <GradeField
        discipline="shaolin"
        label={tr("shaolin")}
        currentLevel={assignedLevelShaolin}
        grades={gradesForDiscipline("shaolin", tr)}
        locked={locked}
      />
      <GradeField
        discipline="taichi"
        label={tr("taichi")}
        currentLevel={assignedLevelTaichi}
        grades={gradesForDiscipline("taichi", tr)}
        locked={locked}
      />
      <p className="text-muted-foreground text-xs">
        {locked ? tr("managedGrades") : tr("gradeUpdateDescription")}
      </p>
    </div>
  );
}

type FieldProps = {
  discipline: Discipline;
  label: string;
  currentLevel: number;
  grades: Grade[];
  locked: boolean;
};

function GradeField({
  discipline,
  label,
  currentLevel,
  grades,
  locked,
}: FieldProps) {
  const tr = useTranslations("ui");
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentLevel);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const gradeChanged = value !== currentLevel;

  if (locked) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-sm">{label}</div>
          <div className="text-sm font-medium">
            {gradeLabelForDiscipline(discipline, currentLevel, tr)}
          </div>
        </div>
      </div>
    );
  }

  function runUpdate() {
    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("discipline", discipline);
      formData.set("assignedLevel", String(value));
      const result = await updateProfileGrade(null, formData);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      setEditing(false);
      setSuccess(true);
    });
  }

  function handleSave() {
    if (gradeChanged && !confirming) {
      setConfirming(true);
      return;
    }
    runUpdate();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-sm">{label}</div>
          <div className="text-sm font-medium">
            {gradeLabelForDiscipline(discipline, currentLevel, tr)}
          </div>
          {success && (
            <div
              className="mt-1 text-xs"
              style={{ color: "var(--status-success)" }}
              role="status"
            >
              {tr("gradeUpdated")}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSuccess(false);
            setValue(currentLevel);
            setEditing(true);
          }}
        >
          {tr("edit")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FormSelect
        label={label}
        name="assignedLevel"
        value={value}
        onChange={(event) => {
          setValue(Number(event.target.value));
          setConfirming(false);
        }}
      >
        {grades.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </FormSelect>

      {confirming && (
        <Alert variant="destructive">
          <AlertDescription>{tr("gradeUpdateWarning")}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="button" onClick={handleSave} disabled={pending}>
          {pending ? tr("saving") : confirming ? tr("confirm") : tr("save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirming(false);
            setValue(currentLevel);
            setEditing(false);
          }}
        >
          {tr("cancel")}
        </Button>
      </div>
    </div>
  );
}
