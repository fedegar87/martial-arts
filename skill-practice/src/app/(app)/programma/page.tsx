import { categoryLabel, disciplineLabel } from "@/lib/labels";

import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { SkillListItem } from "@/components/library/SkillListItem";
import { PlanTabsNav } from "@/components/programma/PlanTabsNav";
import { Button } from "@/components/ui/button";
import {
  activateCustomFormAction,
  activateExamFormAction,
} from "@/lib/actions/plan";
import { gradeLabelForDiscipline, nextGradeValue } from "@/lib/grades";
import type { UiTranslator } from "@/lib/i18n/config";
import { getExamProgramById } from "@/lib/queries/exam-programs";
import { getUserPlanItems } from "@/lib/queries/plan";
import { listSkillsAtGrade, listSkillsForExam } from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type {
  Discipline,
  ExamProgram,
  PlanMode,
  PlanStatus,
  Skill,
  SkillCategory,
  UserProfile,
} from "@/lib/types";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ d?: string; t?: string }> };

export default async function ProgrammaPage({ searchParams }: Props) {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { d, t } = await searchParams;
  const discipline: Discipline = d === "taichi" ? "taichi" : "shaolin";
  const activeMode: PlanMode = profile.plan_mode ?? "exam";
  const tab: PlanMode =
    t === "custom" ? "custom" : t === "exam" ? "exam" : activeMode;

  const userLevel =
    discipline === "shaolin"
      ? profile.assigned_level_shaolin
      : profile.assigned_level_taichi;
  const nextGrade = userLevel === 0 ? null : nextGradeValue(userLevel);
  const selectedExamId =
    tab === "exam" ? selectedExamIdForDiscipline(profile, discipline) : null;

  const tabSource = tab === "custom" ? "manual" : "exam_program";
  const [selectedExam, examSkills, tabPlanItems] = await Promise.all([
    selectedExamId ? getExamProgramById(selectedExamId) : Promise.resolve(null),
    tab === "exam"
      ? selectedExamId
        ? listSkillsForExam(selectedExamId, profile.school_id)
        : nextGrade !== null
          ? listSkillsAtGrade(discipline, nextGrade, profile.school_id)
          : Promise.resolve([])
      : Promise.resolve([]),
    getUserPlanItems(profile.id, discipline, tabSource),
  ]);

  const selectedExamForDiscipline =
    selectedExam?.discipline === discipline ? selectedExam : null;
  const skills =
    tab === "exam"
      ? examSkills.filter((skill) => skill.discipline === discipline)
      : tabPlanItems.map((item) => item.skill);

  const grouped = skills.reduce<Record<SkillCategory, Skill[]>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {} as Record<SkillCategory, Skill[]>,
  );
  // In modalita esame lo stato focus/ripasso e' il default del programma (uguale per
  // tutte le forme, non una scelta dell'utente): non lo mostriamo. Nella selezione
  // personale invece riflette una scelta reale, quindi resta visibile.
  const showStatus = tab === "custom";
  const planStatusBySkillId = new Map<string, PlanStatus>();
  for (const item of tabPlanItems) {
    planStatusBySkillId.set(item.skill_id, item.status);
  }
  const planStatusLabelPrefix = tr("inCustomSelection");

  const subtitle = buildSubtitle(
    tr,
    tab,
    discipline,
    selectedExamForDiscipline,
    nextGrade,
  );
  const showBanner = tab !== activeMode && skills.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{tr("program")}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </header>

      <DisciplineToggle
        current={discipline}
        basePath="/programma"
        hiddenTaichi={tab === "exam" && profile.assigned_level_taichi === 0}
        extraParams={{ t: tab }}
      />

      <div className="program-layout">
        <PlanTabsNav
          current={tab}
          discipline={discipline}
          activeMode={activeMode}
        />

        <div className="min-w-0 space-y-4">
          {showBanner && <ActivateModeBanner tab={tab} />}

          {skills.length === 0 ? (
            <EmptyState tab={tab} hasNextGrade={nextGrade !== null} />
          ) : (
            <>
              <div className="space-y-6">
                {(Object.keys(grouped) as SkillCategory[]).map((category) => (
                  <section key={category} className="space-y-2">
                    <h2 className="section-label">
                      {categoryLabel(category, tr)}
                    </h2>
                    <div className="space-y-2">
                      {grouped[category].map((skill) => (
                        <SkillListItem
                          key={skill.id}
                          skill={skill}
                          planStatus={
                            showStatus
                              ? planStatusBySkillId.get(skill.id)
                              : undefined
                          }
                          statusLabelPrefix={planStatusLabelPrefix}
                          showEmptyStatusDot={false}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              <ModifyLink tab={tab} discipline={discipline} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function buildSubtitle(
  tr: UiTranslator,
  tab: PlanMode,
  discipline: Discipline,
  selectedExam: ExamProgram | null,
  nextGrade: number | null,
): string {
  const disciplineName = disciplineLabel(discipline, tr);
  if (tab === "exam") {
    if (selectedExam)
      return tr("selectedProgram", {
        p0: disciplineName,
        p1: selectedExam.level_name,
      });
    if (nextGrade === null)
      return tr("noPreparingExamFor", { p0: disciplineName });
    return tr("nextExamFor", {
      p0: disciplineName,
      p1: gradeLabelForDiscipline(discipline, nextGrade, tr),
    });
  }
  return tr("customSelectionFor", { p0: disciplineName });
}

function selectedExamIdForDiscipline(
  profile: UserProfile,
  discipline: Discipline,
): string | null {
  return discipline === "shaolin"
    ? profile.preparing_exam_id
    : profile.preparing_exam_taichi_id;
}

function ActivateModeBanner({ tab }: { tab: PlanMode }) {
  const tr = useTranslations("ui");
  const action =
    tab === "exam" ? activateExamFormAction : activateCustomFormAction;
  const label =
    tab === "exam" ? tr("examPreviewNotice") : tr("customPreviewNotice");

  return (
    <form
      action={action}
      className="border-border bg-card flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-muted-foreground">{label}</p>
      <Button type="submit" size="sm" variant="outline">
        {tr("setActivePlan")}
      </Button>
    </form>
  );
}

function ModifyLink({
  tab,
  discipline,
}: {
  tab: PlanMode;
  discipline: Discipline;
}) {
  const tr = useTranslations("ui");
  const href = tab === "exam" ? "/plan/exam" : `/plan/custom?d=${discipline}`;
  const label = tab === "exam" ? tr("chooseExamProgram") : tr("editSelection");
  return (
    <div className="pt-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={href}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          {label}
        </Link>
      </Button>
    </div>
  );
}

function EmptyState({
  tab,
  hasNextGrade,
}: {
  tab: PlanMode;
  hasNextGrade: boolean;
}) {
  const tr = useTranslations("ui");
  if (tab === "exam") {
    return (
      <p className="text-muted-foreground text-sm">
        {hasNextGrade ? tr("emptyProgram") : tr("noDisciplineExam")}
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">{tr("noCustomSelection")}</p>
      <Button asChild size="sm" variant="outline">
        <Link href="/plan/custom">{tr("createCustomSelection")}</Link>
      </Button>
    </div>
  );
}
