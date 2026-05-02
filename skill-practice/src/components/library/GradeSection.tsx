import { Lock } from "lucide-react";
import { ProgramSkillRow } from "@/components/library/ProgramSkillRow";
import type { Skill } from "@/lib/types";

type Props = {
  title: string;
  skills: Skill[];
  locked: boolean;
  activePlanSkillIds: Set<string>;
  practicedSkillIds: Set<string>;
};

export function GradeSection({
  title,
  skills,
  locked,
  activePlanSkillIds,
  practicedSkillIds,
}: Props) {
  if (skills.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          {locked && <Lock className="h-3.5 w-3.5" />}
          {skills.length} contenuti
        </div>
      </div>
      <div className="divide-border rounded-lg border p-1">
        {skills.map((skill) => (
          <ProgramSkillRow
            key={skill.id}
            skill={skill}
            locked={locked}
            inActivePlan={activePlanSkillIds.has(skill.id)}
            practiced={practicedSkillIds.has(skill.id)}
          />
        ))}
      </div>
    </section>
  );
}
