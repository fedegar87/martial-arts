"use client";

import { useActionState } from "react";
import { saveCustomSelectionFromForm } from "@/lib/actions/plan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
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
  const selected = new Set(selectedSkillIds);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="discipline" value={discipline} />

      {groupedSkills.map(([category, skills]) => (
        <section key={category} className="space-y-2">
          <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            {SKILL_CATEGORY_LABELS[category]}
          </h2>
          <div className="divide-border overflow-hidden rounded-lg border">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-start gap-3 border-b p-3 text-sm last:border-b-0"
              >
                <input
                  type="checkbox"
                  name="skillIds"
                  value={skill.id}
                  defaultChecked={selected.has(skill.id)}
                  className="mt-1 h-4 w-4"
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
      ))}

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state && "success" in state && (
        <p className="text-muted-foreground text-sm">Selezione salvata.</p>
      )}

      <div className="bg-background/95 sticky bottom-20 border-t py-3">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvataggio..." : "Salva selezione"}
        </Button>
      </div>
    </form>
  );
}
