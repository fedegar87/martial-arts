import { localizedBrand } from "@/lib/brand";
import type { UiTranslator } from "@/lib/i18n/config";
import { categoryLabel, disciplineLabel } from "@/lib/labels";

import { CatalogMarkerLegend } from "@/components/library/CatalogMarkerLegend";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { GradeSection } from "@/components/library/GradeSection";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { LockedGradeSection } from "@/components/library/LockedGradeSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { EXTRA_GRADE_VALUE, gradesForDiscipline } from "@/lib/grades";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { getUserPlanItems } from "@/lib/queries/plan";
import {
  listLockedSkillOutlineForDiscipline,
  listVisibleSkillsForDiscipline,
} from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { hasSkillVideo } from "@/lib/skill-video";
import type {
  Discipline,
  PlanStatus,
  Skill,
  SkillCategory,
  SkillOption,
} from "@/lib/types";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    d?: string;
    category?: string | string[];
    withVideo?: string;
    q?: string;
  }>;
};

export default async function ScuolaChangPage({ searchParams }: Props) {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d, category, withVideo, q } = await searchParams;
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
  const selectedCategories = parseSkillCategories(category);
  const selectedCategorySet = new Set(selectedCategories);
  const onlyWithVideo = withVideo === "1";
  const query = normalizeQuery(q);
  // I marker di stato hanno senso solo per la selezione personale (scelta reale
  // dell'utente). In modalita esame lo stato e' il default uniforme del programma:
  // niente pallini, niente legenda. Coerente con /programma.
  const showPlanStatus = profile.plan_mode === "custom";
  const planStatusLabelPrefix = tr("inCustomSelection");
  const emptyPlanStatusLabel = tr("outsideCustomSelection");

  const [allSkills, lockedOutline, activePlanItems] = await Promise.all([
    listVisibleSkillsForDiscipline(discipline, profile),
    listLockedSkillOutlineForDiscipline(discipline, profile),
    showPlanStatus
      ? getUserPlanItems(profile.id, discipline, "manual")
      : Promise.resolve([]),
  ]);

  const availableCategories = (
    Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[]
  ).filter((cat) => allSkills.some((s) => s.category === cat));

  const searchMatchedSkills = query
    ? allSkills.filter((skill) =>
        matchesSkillSearch(tr, skill, query, discipline),
      )
    : allSkills;

  // Skill bloccate (gradi oltre il livello in preparazione): mostrate come anteprima
  // di sola struttura. Rispettano ricerca e filtro categoria; il filtro "solo con
  // video" le esclude (non espongono lo stato video).
  const filteredLockedSkills = (
    query
      ? lockedOutline.filter((skill) =>
          matchesSkillSearch(tr, skill, query, discipline),
        )
      : lockedOutline
  ).filter((s) =>
    selectedCategorySet.size > 0 ? selectedCategorySet.has(s.category) : true,
  );
  const lockedSkills = onlyWithVideo ? [] : filteredLockedSkills;
  const lockedByGrade = lockedSkills.reduce<Record<number, SkillOption[]>>(
    (acc, skill) => {
      (acc[skill.minimum_grade_value] ??= []).push(skill);
      return acc;
    },
    {},
  );
  const hasLockedSections = lockedSkills.length > 0;
  const categoryCountBase = searchMatchedSkills.filter((s) =>
    onlyWithVideo ? hasSkillVideo(s) : true,
  );
  const categoryOptions = availableCategories.map((value) => ({
    value,
    count: categoryCountBase.filter((s) => s.category === value).length,
  }));
  const videoCount = searchMatchedSkills
    .filter((s) =>
      selectedCategorySet.size > 0 ? selectedCategorySet.has(s.category) : true,
    )
    .filter(hasSkillVideo).length;
  const filteredSkills = searchMatchedSkills
    .filter((s) =>
      selectedCategorySet.size > 0 ? selectedCategorySet.has(s.category) : true,
    )
    .filter((s) => (onlyWithVideo ? hasSkillVideo(s) : true));

  const byGrade = filteredSkills.reduce<Record<number, Skill[]>>(
    (acc, skill) => {
      (acc[skill.minimum_grade_value] ??= []).push(skill);
      return acc;
    },
    {},
  );

  const planStatusBySkillId = new Map<string, PlanStatus>();
  for (const item of activePlanItems) {
    planStatusBySkillId.set(item.skill_id, item.status);
  }
  const resetHref = `/library?d=${discipline}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {localizedBrand(tr("locale")).lineageLabel}
        </h1>
        <p className="text-muted-foreground text-sm">
          {disciplineLabel(discipline, tr)} {tr("catalogDescription")}
        </p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/library"
        hiddenShaolin={!shaolinOn}
        hiddenTaichi={!taichiOn}
        extraParams={{
          withVideo: onlyWithVideo ? "1" : undefined,
          q: query || undefined,
        }}
      />

      <LibraryFilters
        basePath="/library"
        discipline={discipline}
        selectedCategories={selectedCategories}
        categories={categoryOptions}
        withVideo={onlyWithVideo}
        query={query}
        resultCount={filteredSkills.length}
        totalCount={allSkills.length}
        allVisibleCount={categoryCountBase.length}
        videoCount={videoCount}
      />

      {showPlanStatus && (
        <CatalogMarkerLegend
          planStatusLabelPrefix={planStatusLabelPrefix}
          emptyLabel={emptyPlanStatusLabel}
        />
      )}

      {filteredSkills.length === 0 && !hasLockedSections ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title={tr("noContent")}
          description={tr("adjustFilters")}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={resetHref}>{tr("resetFilters")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {gradesForDiscipline(discipline, tr)
            .filter((grade) => grade.value !== 0)
            .map((grade) => (
              <GradeSection
                key={grade.value}
                title={grade.label}
                skills={byGrade[grade.value] ?? []}
                planStatusBySkillId={planStatusBySkillId}
                planStatusLabelPrefix={planStatusLabelPrefix}
              />
            ))}
          <GradeSection
            title={tr("other")}
            skills={byGrade[EXTRA_GRADE_VALUE] ?? []}
            planStatusBySkillId={planStatusBySkillId}
            planStatusLabelPrefix={planStatusLabelPrefix}
          />

          {hasLockedSections && (
            <>
              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {tr("nextLevels")}
                  </span>
                  <div className="bg-border h-px flex-1" />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {tr("unlockLevels")}
                </p>
              </div>
              {gradesForDiscipline(discipline, tr)
                .filter((grade) => grade.value !== 0)
                .map((grade) => (
                  <LockedGradeSection
                    key={grade.value}
                    title={grade.label}
                    skills={lockedByGrade[grade.value] ?? []}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function parseSkillCategories(value?: string | string[]): SkillCategory[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return (Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[]).filter(
    (category) => values.includes(category),
  );
}

function normalizeQuery(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function matchesSkillSearch(
  tr: UiTranslator,
  skill: Pick<Skill, "name" | "name_italian" | "subtitle" | "category">,
  query: string,
  discipline: Discipline,
): boolean {
  const needle = searchableText(query);
  const haystack = searchableText(
    [
      skill.name,
      skill.subtitle ?? skill.name_italian,
      categoryLabel(skill.category, tr),
      disciplineLabel(discipline, tr),
    ]
      .filter(Boolean)
      .join(" "),
  );
  return haystack.includes(needle);
}

function searchableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
