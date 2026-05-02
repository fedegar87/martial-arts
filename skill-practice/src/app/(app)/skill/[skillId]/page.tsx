import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillById } from "@/lib/queries/skills";
import { getUserPlanItemsBySkill } from "@/lib/queries/plan";
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
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";

type Props = { params: Promise<{ skillId: string }> };

export default async function SkillDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { skillId } = await params;
  const skill = await getSkillById(skillId);
  if (!skill) notFound();

  const [planItems, personalNotes, todayLog] = await Promise.all([
    getUserPlanItemsBySkill(profile.id, skillId),
    getPersonalNotesForSkill(profile.id, skillId),
    getTodayLogForSkill(profile.id, skillId),
  ]);
  const activeSource = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const activePlanItem =
    planItems.find((item) => item.source === activeSource && !item.is_hidden) ??
    null;
  const manualPlanItem =
    planItems.find((item) => item.source === "manual" && !item.is_hidden) ??
    null;
  const inPersonalSelection = manualPlanItem !== null;
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
          {activePlanItem && (
            <>
              <StatusBadge status={activePlanItem.status} />
              <SkillStatusMenu
                skillId={skill.id}
                currentStatus={activePlanItem.status}
                showHide={false}
              />
            </>
          )}
          <PracticeCompletionBadge completed={practicedToday} />
          <VideoAvailabilityBadge videoUrl={skill.video_url} />
        </div>
      </header>

      <VideoPlayer
        videoUrl={skill.video_url}
        title={skill.name}
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
          inPersonalSelection={inPersonalSelection}
          practicedToday={practicedToday}
          planMode={profile.plan_mode}
        />
      </div>
    </div>
  );
}
