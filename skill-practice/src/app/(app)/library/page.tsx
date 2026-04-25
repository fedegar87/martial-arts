import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listAccessibleSkills } from "@/lib/queries/skills";
import { SkillListItem } from "@/components/library/SkillListItem";
import { LibraryNav } from "@/components/library/LibraryNav";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { SKILL_CATEGORY_LABELS, DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline } from "@/lib/grades";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const userGradeValue =
    discipline === "shaolin"
      ? profile.assigned_level_shaolin
      : profile.assigned_level_taichi;

  const skills =
    userGradeValue === 0
      ? []
      : await listAccessibleSkills(discipline, userGradeValue);

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
        <h1 className="text-2xl font-semibold">Libreria</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS[discipline]} —{" "}
          {userGradeValue === 0
            ? "non praticato"
            : gradeLabelForDiscipline(discipline, userGradeValue)}
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library"
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />
      <LibraryNav />

      <div className="space-y-6">
        {(Object.keys(grouped) as SkillCategory[]).map((category) => (
          <section key={category} className="space-y-2">
            <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {SKILL_CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-2">
              {grouped[category].map((skill) => (
                <SkillListItem key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
