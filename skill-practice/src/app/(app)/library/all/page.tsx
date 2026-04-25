import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listAccessibleSkills } from "@/lib/queries/skills";
import { SkillListItem } from "@/components/library/SkillListItem";
import { LibraryNav } from "@/components/library/LibraryNav";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { SKILL_CATEGORY_LABELS, DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string; category?: string }> };

export default async function AllSkillsPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d, category } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const selectedCategory = isSkillCategory(category) ? category : undefined;

  const userGradeValue =
    discipline === "shaolin"
      ? profile.assigned_level_shaolin
      : profile.assigned_level_taichi;

  const skills =
    userGradeValue === 0
      ? []
      : await listAccessibleSkills(
          discipline,
          userGradeValue,
          selectedCategory,
        );

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
          {DISCIPLINE_LABELS[discipline]} — tutte le skill accessibili
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library/all"
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />
      <LibraryNav />
      <CategoryFilter
        basePath="/library/all"
        discipline={discipline}
        current={selectedCategory}
        categories={Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[]}
      />

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

function isSkillCategory(value?: string): value is SkillCategory {
  return Boolean(
    value && Object.prototype.hasOwnProperty.call(SKILL_CATEGORY_LABELS, value),
  );
}
