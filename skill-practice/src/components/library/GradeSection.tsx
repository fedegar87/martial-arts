import { ProgramSkillRow } from "@/components/library/ProgramSkillRow";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  title: string;
  skills: Skill[];
  planStatusBySkillId: Map<string, PlanStatus>;
  planStatusLabelPrefix: string;
};

export function GradeSection({
  title,
  skills,
  planStatusBySkillId,
  planStatusLabelPrefix,
}: Props) {
  if (skills.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="divide-border rounded-lg border p-1">
        {skills.map((skill) => (
          <ProgramSkillRow
            key={skill.id}
            skill={skill}
            planStatus={planStatusBySkillId.get(skill.id)}
            planStatusLabelPrefix={planStatusLabelPrefix}
          />
        ))}
      </div>
    </section>
  );
}
