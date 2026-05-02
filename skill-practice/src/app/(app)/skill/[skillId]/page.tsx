import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillById } from "@/lib/queries/skills";
import { getUserPlanItemBySkill } from "@/lib/queries/plan";
import {
  getPersonalNotesForSkill,
  getTodayLogForSkill,
} from "@/lib/queries/practice-log";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { PersonalNotesPanel } from "@/components/skill/PersonalNotesPanel";
import { SkillPracticeActions } from "@/components/skill/SkillPracticeActions";
import { TeacherNote } from "@/components/skill/TeacherNote";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge";
import { PracticeCompletionBadge } from "@/components/skill/PracticeCompletionBadge";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";

type Props = { params: Promise<{ skillId: string }> };

export default async function SkillDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { skillId } = await params;
  const skill = await getSkillById(skillId);
  if (!skill) notFound();

  const [planItem, personalNotes, todayLog] = await Promise.all([
    getUserPlanItemBySkill(profile.id, skillId),
    getPersonalNotesForSkill(profile.id, skillId),
    getTodayLogForSkill(profile.id, skillId),
  ]);
  const inPlan = planItem !== null && !planItem.is_hidden;
  const practicedToday = todayLog?.completed ?? false;
  const requiresPartner =
    skill.practice_mode === "paired" || skill.practice_mode === "both";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{skill.name}</h1>
        {skill.name_italian && (
          <p className="text-muted-foreground">{skill.name_italian}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <DisciplineBadge discipline={skill.discipline} />
          <span className="text-muted-foreground text-sm">
            {SKILL_CATEGORY_LABELS[skill.category]}
          </span>
          <LevelBadge level={skill.minimum_grade_value} />
          <PracticeModeBadge mode={skill.practice_mode} />
          {inPlan && planItem && <StatusBadge status={planItem.status} />}
          <PracticeCompletionBadge completed={practicedToday} />
          <VideoAvailabilityBadge videoUrl={skill.video_url} />
        </div>
      </header>

      <VideoPlayer
        videoUrl={skill.video_url}
        title={skill.name}
        category={skill.category}
        practiceMode={skill.practice_mode}
      />

      {requiresPartner && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            {skill.practice_mode === "paired"
              ? "Questa pratica richiede un partner per essere completata."
              : "La forma si pratica da soli; l'applicazione richiede un partner."}
          </AlertDescription>
        </Alert>
      )}

      <TeacherNote note={skill.teacher_notes} />

      <PersonalNotesPanel notes={personalNotes} />

      <div className="app-sticky-action material-bar">
        <SkillPracticeActions
          skillId={skillId}
          inPlan={inPlan}
          practicedToday={practicedToday}
        />
      </div>
    </div>
  );
}
