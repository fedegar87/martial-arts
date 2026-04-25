import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listAccessibleSkills } from "@/lib/queries/skills";
import { SkillListItem } from "@/components/library/SkillListItem";
import { LibraryNav } from "@/components/library/LibraryNav";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { Skill, SkillCategory } from "@/lib/types";

export default async function AllSkillsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const skills = await listAccessibleSkills(profile.assigned_level);
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
          Tutte le skill accessibili
        </p>
      </header>

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
