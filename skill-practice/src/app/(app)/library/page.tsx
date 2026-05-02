import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsForDiscipline } from "@/lib/queries/skills";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getPracticedSkillIds } from "@/lib/queries/practice-log";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { GradeSection } from "@/components/library/GradeSection";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { CatalogMarkerLegend } from "@/components/library/CatalogMarkerLegend";
import { DISCIPLINE_LABELS, SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { gradesForDiscipline } from "@/lib/grades";
import { hasPlayableVideo } from "@/lib/youtube";
import type { Discipline, Skill, SkillCategory } from "@/lib/types";

const ENABLE_LEVEL_LOCK = false;

type Props = {
  searchParams: Promise<{ d?: string; category?: string; withVideo?: string }>;
};

export default async function ScuolaChangPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d, category, withVideo } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const selectedCategory = isSkillCategory(category) ? category : undefined;
  const onlyWithVideo = withVideo === "1";
  const userLevel =
    discipline === "shaolin"
      ? profile.assigned_level_shaolin
      : profile.assigned_level_taichi;
  const activeSource =
    profile.plan_mode === "custom" ? "manual" : "exam_program";

  const [allSkills, activePlanItems, practicedSkillIds] = await Promise.all([
    listSkillsForDiscipline(discipline),
    getUserPlanItems(profile.id, discipline, activeSource),
    getPracticedSkillIds(profile.id),
  ]);

  const availableCategories = (
    Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[]
  ).filter((cat) => allSkills.some((s) => s.category === cat));

  const filteredSkills = allSkills
    .filter((s) => (selectedCategory ? s.category === selectedCategory : true))
    .filter((s) => (onlyWithVideo ? hasPlayableVideo(s.video_url) : true));

  const byGrade = filteredSkills.reduce<Record<number, Skill[]>>(
    (acc, skill) => {
      (acc[skill.minimum_grade_value] ??= []).push(skill);
      return acc;
    },
    {},
  );

  const activePlanSkillIds = new Set(
    activePlanItems.map((item) => item.skill_id),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Scuola Chang</h1>
        <p className="text-muted-foreground text-sm">
          {DISCIPLINE_LABELS[discipline]} —{" "}
          {selectedCategory
            ? `${SKILL_CATEGORY_LABELS[selectedCategory]}: ${filteredSkills.length} contenuti totali`
            : "forme e tecniche introdotte per grado."}
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library"
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />

      <CategoryFilter
        basePath="/library"
        discipline={discipline}
        current={selectedCategory}
        categories={availableCategories}
        withVideo={onlyWithVideo}
      />

      <CatalogMarkerLegend />

      <div className="space-y-6">
        {gradesForDiscipline(discipline)
          .filter((grade) => grade.value !== 0)
          .map((grade) => (
            <GradeSection
              key={grade.value}
              title={grade.label}
              skills={byGrade[grade.value] ?? []}
              locked={ENABLE_LEVEL_LOCK && userLevel !== 0 && grade.value < userLevel}
              activePlanSkillIds={activePlanSkillIds}
              practicedSkillIds={practicedSkillIds}
            />
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
