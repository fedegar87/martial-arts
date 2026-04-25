import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsForExam } from "@/lib/queries/skills";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { SkillListItem } from "@/components/library/SkillListItem";
import { LibraryNav } from "@/components/library/LibraryNav";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { Skill, SkillCategory } from "@/lib/types";

type Props = { params: Promise<{ examId: string }> };

export default async function ExamSkillsPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { examId } = await params;

  const exams = await listExamProgramsForSchool(profile.school_id);
  const exam = exams.find((e) => e.id === examId);
  if (!exam) notFound();

  const skills = await listSkillsForExam(examId);
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
        <h1 className="text-2xl font-semibold">{exam.level_name}</h1>
        {exam.description && (
          <p className="text-muted-foreground text-sm">{exam.description}</p>
        )}
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
