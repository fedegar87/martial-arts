import { SkillListItem } from "@/components/library/SkillListItem";
import { SegmentedNav } from "@/components/primitives/SegmentedNav";
import { CustomProgramItemStatus } from "@/components/programma/CustomProgramItemStatus";
import { ProgramManagement } from "@/components/programma/ProgramManagement";
import { ProgramSelector } from "@/components/programma/ProgramSelector";
import { Button } from "@/components/ui/button";
import { activateCustomProgramFromForm } from "@/lib/actions/custom-programs";
import { activateExamFormAction } from "@/lib/actions/plan";
import { nextGradeValue } from "@/lib/grades";
import { categoryLabel, disciplineLabel } from "@/lib/labels";
import { listCustomPrograms } from "@/lib/queries/custom-programs";
import { getExamProgramById } from "@/lib/queries/exam-programs";
import { getUserPlanItems } from "@/lib/queries/plan";
import { listSkillsAtGrade, listSkillsForExam } from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type { Discipline, Skill } from "@/lib/types";
import { CheckCircle2, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { searchParams: Promise<{ d?: string; t?: string; program?: string }> };

export default async function ProgrammaPage({ searchParams }: Props) {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const [params, programs] = await Promise.all([searchParams, listCustomPrograms(profile.id)]);
  const active = profile.plan_mode === "custom" ? profile.active_custom_program_id ?? "" : "exam";
  const current = params.program ?? (params.t === "exam" ? "exam" : params.t === "custom" ? profile.active_custom_program_id ?? programs[0]?.id ?? "exam" : active || programs[0]?.id || "exam");
  const customProgram = current === "exam" ? null : programs.find((program) => program.id === current);
  if (current !== "exam" && !customProgram) notFound();
  const isExam = current === "exam";
  const discipline = params.d === "shaolin" || params.d === "taichi" ? params.d : "all";
  const [items, shaolinExam, taichiExam] = await Promise.all([
    getUserPlanItems(profile.id, undefined, isExam ? "exam_program" : "manual", customProgram?.id),
    profile.preparing_exam_id ? getExamProgramById(profile.preparing_exam_id) : Promise.resolve(null),
    profile.preparing_exam_taichi_id ? getExamProgramById(profile.preparing_exam_taichi_id) : Promise.resolve(null),
  ]);
  let skills: Skill[] = items.map((item) => item.skill);
  if (isExam) {
    const examParts = await Promise.all((["shaolin", "taichi"] as Discipline[]).map((part) => {
      const exam = part === "shaolin" ? shaolinExam : taichiExam;
      if (exam?.discipline === part) return listSkillsForExam(exam.id, profile.school_id);
      const grade = part === "shaolin" ? profile.assigned_level_shaolin : profile.assigned_level_taichi;
      const next = grade === 0 ? null : nextGradeValue(grade);
      return next === null ? Promise.resolve([]) : listSkillsAtGrade(part, next, profile.school_id);
    }));
    skills = examParts.flat();
  }
  const filtered = skills.filter((skill) => discipline === "all" || skill.discipline === discipline);
  const groups = new Map<string, Skill[]>();
  for (const skill of filtered) {
    const key = `${skill.discipline}:${skill.category}`;
    groups.set(key, [...(groups.get(key) ?? []), skill]);
  }
  const statuses = new Map(items.map((item) => [item.skill_id, item.status]));
  const activeName = active === "exam" ? tr("examProgram") : programs.find((program) => program.id === active)?.name ?? tr("noActiveTrainingProgram");
  const examSummary = [shaolinExam, taichiExam].filter((exam) => exam !== null).map((exam) => `${disciplineLabel(exam.discipline, tr)} ${exam.level_name}`).join(" · ");
  const editableDiscipline = discipline === "taichi" ? "taichi" : "shaolin";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{tr("program")}</h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {tr("inTrainingProgram")} <span className="text-primary">{activeName}</span>
        </p>
      </header>
      <div className="space-y-2">
        <ProgramSelector programs={programs} current={current} active={active} discipline={discipline} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{isExam ? tr("examProgram") : tr("personalProgram")}</span>
          <ProgramManagement />
        </div>
      </div>
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="wrap-break-word text-xl font-semibold">{customProgram?.name ?? tr("examProgram")}</h2>
            {isExam && examSummary && <p className="text-sm text-muted-foreground">{examSummary}</p>}
            <p className="text-xs text-muted-foreground">{tr("namedProgramExerciseCount", { p0: skills.length })}</p>
          </div>
          {current === active && (
            <span className="inline-flex items-center gap-1 text-xs text-primary"><CheckCircle2 className="h-4 w-4" />{tr("active")}</span>
          )}
        </div>
        {current !== active && skills.length > 0 && (
          <form action={isExam ? activateExamFormAction : activateCustomProgramFromForm}>
            {!isExam && <input type="hidden" name="program_id" value={current} />}
            <Button type="submit" className="w-full sm:w-auto">{tr("useForTraining")}</Button>
          </form>
        )}
        <SegmentedNav fullWidth ariaLabel={tr("discipline")} items={[
          { id: "all", label: tr("allDisciplines") },
          { id: "shaolin", label: disciplineLabel("shaolin", tr) },
          { id: "taichi", label: disciplineLabel("taichi", tr) },
        ].filter((option) => option.id !== "taichi" || profile.assigned_level_taichi !== 0 || profile.content_access_mode === "all_school_content" || skills.some((skill) => skill.discipline === "taichi")).map((option) => ({
          href: `/programma?${new URLSearchParams({ program: current, d: option.id }).toString()}`,
          label: option.label,
          active: discipline === option.id,
        }))} />
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{skills.length === 0 && !isExam ? tr("emptyNamedProgram") : tr("emptyProgram")}</p>
        ) : (
          <div className="space-y-6">
            {[...groups.entries()].map(([key, group]) => (
              <section key={key} className="space-y-2">
                <h3 className="section-label">{disciplineLabel(group[0].discipline, tr)} · {categoryLabel(group[0].category, tr)}</h3>
                <div className="space-y-2">
                  {group.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        <SkillListItem skill={skill} planStatus={isExam ? undefined : statuses.get(skill.id)} statusLabelPrefix={tr("inCustomSelection")} showEmptyStatusDot={false} />
                      </div>
                      {!isExam && customProgram && statuses.has(skill.id) && (
                        <CustomProgramItemStatus programId={customProgram.id} skillId={skill.id} skillName={skill.name} status={statuses.get(skill.id)!} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={isExam ? "/plan/exam" : `/plan/custom?${new URLSearchParams({ program: current, d: editableDiscipline }).toString()}`}>
              <Pencil className="mr-2 h-4 w-4" />{isExam ? tr("chooseExamProgram") : tr("editSelection")}
            </Link>
          </Button>
          {customProgram && <ProgramManagement key={`${customProgram.id}:${customProgram.name}`} program={customProgram} isActive={current === active} />}
        </div>
      </section>
    </div>
  );
}
