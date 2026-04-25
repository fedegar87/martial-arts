import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsForDiscipline } from "@/lib/queries/skills";
import { getUserPlanItems } from "@/lib/queries/plan";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { LibraryNav } from "@/components/library/LibraryNav";
import { GradeSection } from "@/components/library/GradeSection";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { gradesForDiscipline } from "@/lib/grades";
import type { Discipline, PlanStatus, Skill } from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string }> };

export default async function ProgramPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const userLevel =
    discipline === "shaolin"
      ? profile.assigned_level_shaolin
      : profile.assigned_level_taichi;

  const [skills, planItems] = await Promise.all([
    listSkillsForDiscipline(discipline),
    getUserPlanItems(profile.id),
  ]);

  const byGrade = skills.reduce<Record<number, Skill[]>>((acc, skill) => {
    (acc[skill.minimum_grade_value] ??= []).push(skill);
    return acc;
  }, {});
  const statusBySkillId = new Map<string, PlanStatus>(
    planItems.map((item) => [item.skill_id, item.status]),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Programma FESK</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS[discipline]} — skill introdotte per grado.
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library/program"
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />
      <LibraryNav />

      <div className="space-y-6">
        {gradesForDiscipline(discipline)
          .filter((grade) => grade.value !== 0)
          .map((grade) => (
            <GradeSection
              key={grade.value}
              title={grade.label}
              skills={byGrade[grade.value] ?? []}
              locked={userLevel !== 0 && grade.value < userLevel}
              planStatusBySkillId={statusBySkillId}
            />
          ))}
      </div>
    </div>
  );
}
