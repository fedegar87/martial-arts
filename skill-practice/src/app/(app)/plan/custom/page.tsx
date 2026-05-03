import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsForDiscipline } from "@/lib/queries/skills";
import { getSelectedSkillIds } from "@/lib/queries/plan";
import { CustomSelectionForm } from "@/components/plan/CustomSelectionForm";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function PlanCustomPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";

  const [skills, selectedSkillIds] = await Promise.all([
    listSkillsForDiscipline(discipline),
    getSelectedSkillIds(profile.id, "manual"),
  ]);

  const grouped = skills.reduce<Record<SkillCategory, Skill[]>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {} as Record<SkillCategory, Skill[]>,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Selezione personale</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS[discipline]} — scegli forme e tecniche da usare nel piano di allenamento.
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/plan/custom"
      />

      <CustomSelectionForm
        discipline={discipline}
        groupedSkills={Object.entries(grouped) as Array<[SkillCategory, Skill[]]>}
        selectedSkillIds={[...selectedSkillIds]}
      />
    </div>
  );
}
