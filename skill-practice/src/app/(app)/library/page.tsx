import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listSkillsForExam } from "@/lib/queries/skills";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { SkillListItem } from "@/components/library/SkillListItem";
import { LibraryNav } from "@/components/library/LibraryNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";
import type { Skill, SkillCategory } from "@/lib/types";

export default async function LibraryPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.preparing_exam_id) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Libreria</h1>
        </header>
        <LibraryNav />
        <EmptyState
          title="Nessun esame selezionato"
          description="Scegli un esame per vedere le skill richieste."
          action={
            <Button asChild>
              <Link href="/library/exam">Scegli un esame</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const exams = await listExamProgramsForSchool(profile.school_id);
  const preparingExam = exams.find((e) => e.id === profile.preparing_exam_id);
  const skills = await listSkillsForExam(profile.preparing_exam_id);

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
          {preparingExam?.level_name ?? "Mio livello"}
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
