import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillById } from "@/lib/queries/skills";
import { getUserPlanItemsBySkill } from "@/lib/queries/plan";
import {
  getPersonalNotesForSkill,
  getTodayLogForSkill,
} from "@/lib/queries/practice-log";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { BackButton } from "@/components/skill/BackButton";
import { PersonalNotesPanel } from "@/components/skill/PersonalNotesPanel";
import { SkillPracticeActions } from "@/components/skill/SkillPracticeActions";
import { TeacherNote } from "@/components/skill/TeacherNote";
import { gradeLabelForDiscipline, isSkillWithinLevelScope } from "@/lib/grades";

type Props = { params: Promise<{ skillId: string }> };

function LabeledVideo({
  url,
  label,
  skillName,
}: {
  url: string;
  label: string | null;
  skillName: string;
}) {
  return (
    <figure className="space-y-2">
      {label && (
        <figcaption className="text-muted-foreground text-sm font-medium">
          {label}
        </figcaption>
      )}
      <VideoPlayer
        videoUrl={url}
        title={label ? `${skillName} — ${label}` : skillName}
      />
    </figure>
  );
}

export default async function SkillDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { skillId } = await params;
  const [skill, planItems, personalNotes, todayLog] = await Promise.all([
    getSkillById(skillId, profile.school_id),
    getUserPlanItemsBySkill(profile.id, skillId),
    getPersonalNotesForSkill(profile.id, skillId),
    getTodayLogForSkill(profile.id, skillId),
  ]);
  if (!skill) notFound();
  // Access scope: in-plan content (exam or personal selection) is always allowed;
  // otherwise the skill must be within the user's library level scope. Mirrors the
  // is_skill_in_scope RLS predicate (0040) as defense-in-depth at the page layer.
  const accessible =
    planItems.length > 0 || isSkillWithinLevelScope(profile, skill);
  if (!accessible) notFound();
  const manualPlanItem =
    planItems.find((item) => item.source === "manual" && !item.is_hidden) ??
    null;
  const inPersonalSelection = manualPlanItem !== null;
  const practicedToday = todayLog?.completed ?? false;

  return (
    <div className="space-y-6">
      <BackButton />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{skill.name}</h1>
        <p className="text-muted-foreground text-sm">
          {[
            skill.name_italian,
            gradeLabelForDiscipline(skill.discipline, skill.minimum_grade_value),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {skill.secondary_video_url ? (
        <div className="space-y-4">
          <LabeledVideo
            url={skill.video_url}
            label={skill.video_label}
            skillName={skill.name}
          />
          <LabeledVideo
            url={skill.secondary_video_url}
            label={skill.secondary_video_label}
            skillName={skill.name}
          />
        </div>
      ) : (
        <VideoPlayer videoUrl={skill.video_url} title={skill.name} />
      )}

      <TeacherNote note={skill.teacher_notes} />

      <PersonalNotesPanel notes={personalNotes} />

      <div className="app-sticky-action material-bar">
        <SkillPracticeActions
          skillId={skillId}
          inPersonalSelection={inPersonalSelection}
          practicedToday={practicedToday}
        />
      </div>
    </div>
  );
}
