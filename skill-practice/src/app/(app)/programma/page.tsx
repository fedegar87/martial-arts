import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsAtGrade } from "@/lib/queries/skills";
import { getUserPlanItems } from "@/lib/queries/plan";
import {
  activateCustomFormAction,
  activateExamFormAction,
} from "@/lib/actions/plan";
import { SkillListItem } from "@/components/library/SkillListItem";
import { DisciplineToggle } from "@/components/library/DisciplineToggle";
import { PlanTabsNav } from "@/components/programma/PlanTabsNav";
import { Button } from "@/components/ui/button";
import { SKILL_CATEGORY_LABELS, DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline, nextGradeValue } from "@/lib/grades";
import type { Discipline, PlanMode, Skill, SkillCategory } from "@/lib/types";

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

  const skills =
    tab === "exam"
      ? nextGrade === null
        ? []
        : await listSkillsAtGrade(discipline, nextGrade)
      : (await getUserPlanItems(profile.id, discipline, "manual")).map(
          (item) => item.skill,
        );

  const grouped = skills.reduce<Record<SkillCategory, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const subtitle = buildSubtitle(tab, discipline, nextGrade);
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
        hiddenTaichi={profile.assigned_level_taichi === 0}
      />

      <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
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
  nextGrade: number | null,
): string {
  const disciplineLabel = DISCIPLINE_LABELS[discipline];
  if (tab === "exam") {
    if (nextGrade === null)
      return `${disciplineLabel} — nessun esame in preparazione.`;
    return `${disciplineLabel} — prossimo esame: ${gradeLabelForDiscipline(discipline, nextGrade)}.`;
  }
  return `${disciplineLabel} — selezione personalizzata.`;
}

function ActivateModeBanner({ tab }: { tab: PlanMode }) {
  const action =
    tab === "exam" ? activateExamFormAction : activateCustomFormAction;
  const label =
    tab === "exam"
      ? "Stai esplorando il programma esame, ma il piano attivo è personalizzato."
      : "Stai esplorando la selezione personalizzata, ma il piano attivo è l'esame.";

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
  const label = tab === "exam" ? "Cambia esame" : "Modifica selezione";
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
        Non hai ancora una selezione personalizzata.
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href="/plan/custom">Crea selezione personalizzata</Link>
      </Button>
    </div>
  );
}
