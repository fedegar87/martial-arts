"use client";

import { useActionState, useMemo, useState } from "react";
import { saveCustomSelectionFromForm } from "@/lib/actions/plan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { gradeLabel } from "@/lib/grades";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

type Props = {
  discipline: Discipline;
  groupedSkills: Array<[SkillCategory, Skill[]]>;
  selectedSkillIds: string[];
};

export function CustomSelectionForm({
  discipline,
  groupedSkills,
  selectedSkillIds,
}: Props) {
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
    return [...grades].sort((a, b) => b - a);
  }, [groupedSkills]);
  const selectedCount = selected.size;

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
    <form action={action} className="app-with-fixed-action space-y-5">
      <input type="hidden" name="discipline" value={discipline} />

      {gradeOptions.length > 0 && (
        <div className="scroll-chips">
          <GradeChip
            label="Tutti"
            active={activeGrade === "all"}
            onClick={() => setActiveGrade("all")}
          />
          {gradeOptions.map((grade) => (
            <GradeChip
              key={grade}
              label={gradeLabel(grade)}
              active={activeGrade === grade}
              onClick={() => setActiveGrade(grade)}
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
              activeGrade === "all" || skill.minimum_grade_value === activeGrade,
          )}
          selected={selected}
          onSelectedChange={updateSelected}
        />
      ))}

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">Selezione salvata.</p>
      )}

      <div className="app-fixed-action material-bar">
        <div className="app-fixed-action__inner grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="text-muted-foreground text-sm">
            <strong className="text-foreground">{selectedCount}</strong>{" "}
            selezionati
          </span>
          <Button type="submit" disabled={pending || selectedCount === 0}>
            {pending ? "Salvataggio..." : "Salva piano"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function GradeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tap-feedback label-font min-h-11 shrink-0 rounded-md border px-3 text-sm ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SkillGroup({
  category,
  skills,
  selected,
  onSelectedChange,
}: {
  category: SkillCategory;
  skills: Skill[];
  selected: Set<string>;
  onSelectedChange: (skillId: string, checked: boolean) => void;
}) {
  if (skills.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="label-font text-muted-foreground text-sm">
        {SKILL_CATEGORY_LABELS[category]}
      </h2>
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
              onChange={(event) =>
                onSelectedChange(skill.id, event.target.checked)
              }
              className="mt-0.5 h-5 w-5"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{skill.name}</span>
              {skill.name_italian && (
                <span className="text-muted-foreground block">
                  {skill.name_italian}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
