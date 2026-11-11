import { disciplineLabel } from "@/lib/labels";

import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { CustomSelectionForm } from "@/components/plan/CustomSelectionForm";
import { Button } from "@/components/ui/button";
import { listCustomPrograms } from "@/lib/queries/custom-programs";
import { getSelectedSkillIds } from "@/lib/queries/plan";
import { listVisibleSkillOptionsForDiscipline } from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type { Discipline, SkillCategory, SkillOption } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { searchParams: Promise<{ d?: string; program?: string }> };

export default async function PlanCustomPage({ searchParams }: Props) {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [{ d, program: requestedProgram }, programs] = await Promise.all([
    searchParams,
    listCustomPrograms(profile.id),
  ]);
  const programId = requestedProgram ?? profile.active_custom_program_id ?? programs[0]?.id;
  if (!programId) redirect("/programma");
  const program = programs.find((entry) => entry.id === programId);
  if (!program) notFound();
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
    getSelectedSkillIds(profile.id, "manual", program.id),
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
        <h1 className="wrap-break-word text-2xl font-semibold">{program.name}</h1>
        <p className="text-muted-foreground text-sm">
          {disciplineLabel(discipline, tr)} {tr("customSelectionDescription")}
        </p>
      </header>

      <Button asChild size="sm" variant="ghost">
        <Link href={`/programma?program=${program.id}`}>{tr("backToNamedProgram")}</Link>
      </Button>

      <DisciplineToggle
        current={discipline}
        basePath="/plan/custom"
        hiddenShaolin={!shaolinOn}
        hiddenTaichi={!taichiOn}
        extraParams={{ program: program.id }}
      />

      <CustomSelectionForm
        key={program.id}
        programId={program.id}
        discipline={discipline}
        groupedSkills={
          Object.entries(grouped) as Array<[SkillCategory, SkillOption[]]>
        }
        selectedSkillIds={[...selectedSkillIds]}
      />
    </div>
  );
}
