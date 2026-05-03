import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getExamProgramById } from "@/lib/queries/exam-programs";
import { listSkillsAtGrade, listSkillsForExam } from "@/lib/queries/skills";
import { getUserPlanItems } from "@/lib/queries/plan";
import {
  activateCustomFormAction,
  activateExamFormAction,
} from "@/lib/actions/plan";
import { SkillListItem } from "@/components/library/SkillListItem";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { PlanTabsNav } from "@/components/programma/PlanTabsNav";
import { PlanStatusLegend } from "@/components/skill/PlanStatusLegend";
import { Button } from "@/components/ui/button";
import { SKILL_CATEGORY_LABELS, DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline, nextGradeValue } from "@/lib/grades";
import type {
  Discipline,
  ExamProgram,
  PlanMode,
  PlanStatus,
  Skill,
  SkillCategory,
  UserProfile,
} from "@/lib/types";

type Props = { searchParams: Promise<{ d?: string; t?: string }> };

export default async function ProgrammaPage({ searchParams }: Props) {
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
        ? listSkillsForExam(selectedExamId)
        : nextGrade !== null
          ? listSkillsAtGrade(discipline, nextGrade)
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
  const planStatusBySkillId = new Map<string, PlanStatus>(
    tabPlanItems.map((item) => [item.skill_id, item.status]),
  );

  const grouped = skills.reduce<Record<SkillCategory, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const subtitle = buildSubtitle(
    tab,
    discipline,
    selectedExamForDiscipline,
    nextGrade,
  );
  const showBanner = tab !== activeMode && skills.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Programma</h1>
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
            <EmptyState
              tab={tab}
              hasNextGrade={nextGrade !== null}
            />
          ) : (
            <>
              {planStatusBySkillId.size > 0 && <PlanStatusLegend />}
              <div className="space-y-6">
                {(Object.keys(grouped) as SkillCategory[]).map((category) => (
                  <section key={category} className="space-y-2">
                    <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                      {SKILL_CATEGORY_LABELS[category]}
                    </h2>
                    <div className="space-y-2">
                      {grouped[category].map((skill) => (
                        <SkillListItem
                          key={skill.id}
                          skill={skill}
                          planStatus={planStatusBySkillId.get(skill.id)}
                          editableStatus={tab === activeMode}
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
  tab: PlanMode,
  discipline: Discipline,
  selectedExam: ExamProgram | null,
  nextGrade: number | null,
): string {
  const disciplineLabel = DISCIPLINE_LABELS[discipline];
  if (tab === "exam") {
    if (selectedExam)
      return `${disciplineLabel} — programma selezionato: ${selectedExam.level_name}.`;
    if (nextGrade === null)
      return `${disciplineLabel} — nessun esame in preparazione.`;
    return `${disciplineLabel} — prossimo esame: ${gradeLabelForDiscipline(discipline, nextGrade)}.`;
  }
  return `${disciplineLabel} — selezione personale.`;
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
  const action =
    tab === "exam" ? activateExamFormAction : activateCustomFormAction;
  const label =
    tab === "exam"
      ? "Stai esplorando il programma esame, ma il piano attivo è la selezione personale."
      : "Stai esplorando la selezione personale, ma il piano attivo è il programma esame.";

  return (
    <form
      action={action}
      className="border-border bg-card flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-muted-foreground">{label}</p>
      <Button type="submit" size="sm" variant="outline">
        Imposta come piano attivo
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
  const href =
    tab === "exam" ? "/plan/exam" : `/plan/custom?d=${discipline}`;
  const label =
    tab === "exam" ? "Scegli programma esame" : "Modifica selezione";
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
  if (tab === "exam") {
    return (
      <p className="text-muted-foreground text-sm">
        {hasNextGrade
          ? "Nessun contenuto in questo programma."
          : "Nessun esame in preparazione per questa disciplina."}
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Non hai ancora una selezione personale.
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href="/plan/custom">Crea selezione personale</Link>
      </Button>
    </div>
  );
}
