import { disciplineLabel } from "@/lib/labels";

import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { CustomSelectionForm } from "@/components/plan/CustomSelectionForm";
import { getSelectedSkillIds } from "@/lib/queries/plan";
import { listVisibleSkillOptionsForDiscipline } from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type { Discipline, SkillCategory, SkillOption } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function PlanCustomPage({ searchParams }: Props) {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const allAccess = profile.content_access_mode === "all_school_content";
  const shaolinOn = allAccess || profile.assigned_level_shaolin !== 0;
  const taichiOn = allAccess || profile.assigned_level_taichi !== 0;
  const requested: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const discipline: Discipline =
    requested === "shaolin" && !shaolinOn
      ? "taichi"
      : requested === "taichi" && !taichiOn
        ? "shaolin"
        : requested;

  const [skills, selectedSkillIds] = await Promise.all([
    listVisibleSkillOptionsForDiscipline(discipline, profile),
    getSelectedSkillIds(profile.id, "manual"),
  ]);

  const grouped = skills.reduce<Record<SkillCategory, SkillOption[]>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {} as Record<SkillCategory, SkillOption[]>,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{tr("customSelection")}</h1>
        <p className="text-muted-foreground text-sm">
          {disciplineLabel(discipline, tr)} {tr("customSelectionDescription")}
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/plan/custom"
        hiddenShaolin={!shaolinOn}
        hiddenTaichi={!taichiOn}
      />

      <CustomSelectionForm
        discipline={discipline}
        groupedSkills={
          Object.entries(grouped) as Array<[SkillCategory, SkillOption[]]>
        }
        selectedSkillIds={[...selectedSkillIds]}
      />
    </div>
  );
}
