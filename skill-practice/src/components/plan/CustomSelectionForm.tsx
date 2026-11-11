"use client";
import { categoryLabel } from "@/lib/labels";

import { useTranslations } from "next-intl";

import { ChipButton } from "@/components/primitives/Chip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteCustomSelection,
  saveCustomSelectionFromForm,
} from "@/lib/actions/plan";
import { EXTRA_GRADE_VALUE, gradeLabel } from "@/lib/grades";
import type { Discipline, SkillCategory, SkillOption } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";

type Props = {
  programId?: string;
  discipline: Discipline;
  groupedSkills: Array<[SkillCategory, SkillOption[]]>;
  selectedSkillIds: string[];
};

export function CustomSelectionForm({
  programId,
  discipline,
  groupedSkills,
  selectedSkillIds,
}: Props) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(
    saveCustomSelectionFromForm,
    null,
  );
  const [selected, setSelected] = useState(() => new Set(selectedSkillIds));
  const [activeGrade, setActiveGrade] = useState<number | "all">("all");
  const gradeOptions = useMemo(() => {
    const grades = new Set<number>();
    for (const [, skills] of groupedSkills) {
      for (const skill of skills) grades.add(skill.minimum_grade_value);
    }
    return [...grades].sort((a, b) => {
      if (a === EXTRA_GRADE_VALUE) return 1;
      if (b === EXTRA_GRADE_VALUE) return -1;
      return b - a;
    });
  }, [groupedSkills]);
  const currentSkillIds = useMemo(
    () =>
      new Set(
        groupedSkills.flatMap(([, skills]) => skills.map((skill) => skill.id)),
      ),
    [groupedSkills],
  );
  const effectiveGrade =
    activeGrade === "all" || gradeOptions.includes(activeGrade)
      ? activeGrade
      : "all";
  const visibleSkillIds = useMemo(
    () =>
      new Set(
        groupedSkills.flatMap(([, skills]) =>
          skills
            .filter(
              (skill) =>
                effectiveGrade === "all" ||
                skill.minimum_grade_value === effectiveGrade,
            )
            .map((skill) => skill.id),
        ),
      ),
    [groupedSkills, effectiveGrade],
  );
  const selectedCount = [...selected].filter((id) =>
    currentSkillIds.has(id),
  ).length;
  const hadSelection = selectedSkillIds.some((id) => currentSkillIds.has(id));

  function updateSelected(skillId: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(skillId);
      } else {
        next.delete(skillId);
      }
      return next;
    });
  }

  return (
    <form
      action={action}
      className="app-with-fixed-action space-y-5"
      ref={preserveSelectionOnReset}
    >
      <input type="hidden" name="discipline" value={discipline} />
      {programId && <input type="hidden" name="program_id" value={programId} />}
      {/* Filtered-out checkboxes are absent from FormData. */}
      {[...selected]
        .filter((id) => !visibleSkillIds.has(id))
        .map((id) => (
          <input key={id} type="hidden" name="skillIds" value={id} />
        ))}

      {gradeOptions.length > 0 && (
        <div className="scroll-chips">
          <GradeChip
            label={tr("all")}
            active={effectiveGrade === "all"}
            onClick={() => setActiveGrade("all")}
            disabled={pending}
          />
          {gradeOptions.map((grade) => (
            <GradeChip
              key={grade}
              label={gradeLabel(grade, tr)}
              active={effectiveGrade === grade}
              onClick={() => setActiveGrade(grade)}
              disabled={pending}
            />
          ))}
        </div>
      )}

      {groupedSkills.map(([category, skills]) => (
        <SkillGroup
          key={category}
          category={category}
          skills={skills.filter(
            (skill) =>
              effectiveGrade === "all" ||
              skill.minimum_grade_value === effectiveGrade,
          )}
          selected={selected}
          onSelectedChange={updateSelected}
          disabled={pending}
        />
      ))}

      <DeleteCustomSelectionSection
        programId={programId}
        disabled={pending || selected.size === 0}
        onDeleted={() => setSelected(new Set())}
      />

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">{tr("selectionSaved")}</p>
      )}

      <div className="app-fixed-action material-bar">
        <div className="app-fixed-action__inner grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="text-muted-foreground text-sm">
            <strong className="text-foreground">{selectedCount}</strong>{" "}
            {tr("selected")}
          </span>
          <Button
            type="submit"
            disabled={pending || (selectedCount === 0 && !hadSelection)}
          >
            {pending ? tr("saving") : tr("savePlan")}
          </Button>
        </div>
      </div>
    </form>
  );
}

function preserveSelectionOnReset(form: HTMLFormElement | null) {
  if (!form) return;
  // React resets forms during commit, while its synthetic event handlers are disabled.
  const preventReset = (event: Event) => event.preventDefault();
  form.addEventListener("reset", preventReset);
  return () => form.removeEventListener("reset", preventReset);
}

function DeleteCustomSelectionSection({
  programId,
  disabled,
  onDeleted,
}: {
  programId?: string;
  disabled: boolean;
  onDeleted: () => void;
}) {
  const tr = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCustomSelection(programId);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      onDeleted();
      setOpen(false);
    });
  }

  return (
    <section className="space-y-3 border-t border-border pt-5">
      <div className="space-y-1">
        <h2 className="section-label">{tr("manageSelection")}</h2>
        <p className="text-sm text-muted-foreground">
          {tr("clearCustomDescription")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="h-auto min-h-10 max-w-full gap-2 whitespace-normal py-2"
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
            {tr("clearCustomPlan")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr("clearCustomConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr("clearCustomWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              {tr("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={pending}
              className="border border-destructive bg-transparent text-destructive shadow-none hover:bg-destructive/10"
            >
              {pending ? tr("deleting") : tr("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function GradeChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <ChipButton
      onClick={onClick}
      active={active}
      className="shrink-0"
      disabled={disabled}
    >
      {label}
    </ChipButton>
  );
}

function SkillGroup({
  category,
  skills,
  selected,
  onSelectedChange,
  disabled,
}: {
  category: SkillCategory;
  skills: SkillOption[];
  selected: Set<string>;
  onSelectedChange: (skillId: string, checked: boolean) => void;
  disabled: boolean;
}) {
  const tr = useTranslations("ui");
  if (skills.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="section-label">{categoryLabel(category, tr)}</h2>
      <div className="divide-border overflow-hidden rounded-lg border">
        {skills.map((skill) => (
          <label
            key={skill.id}
            className="tap-feedback flex min-h-14 items-start gap-3 border-b p-3 text-sm last:border-b-0 hover:bg-muted"
          >
            <input
              type="checkbox"
              name="skillIds"
              value={skill.id}
              checked={selected.has(skill.id)}
              disabled={disabled}
              onChange={(event) =>
                onSelectedChange(skill.id, event.target.checked)
              }
              className="mt-0.5 h-5 w-5"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{skill.name}</span>
              {(skill.subtitle ?? skill.name_italian) && (
                <span className="text-muted-foreground block">
                  {skill.subtitle ?? skill.name_italian}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
