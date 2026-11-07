import { SegmentedNav } from "@/components/primitives/SegmentedNav";
import { BackButton } from "@/components/skill/BackButton";
import { PersonalNotesPanel } from "@/components/skill/PersonalNotesPanel";
import { SkillPracticeActions } from "@/components/skill/SkillPracticeActions";
import { TeacherNote } from "@/components/skill/TeacherNote";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { gradeLabelForDiscipline, isSkillWithinLevelScope } from "@/lib/grades";
import { getUserPlanItemsBySkill } from "@/lib/queries/plan";
import {
  getPersonalNotesForSkill,
  getTodayLogForSkill,
} from "@/lib/queries/practice-log";
import { getSkillById } from "@/lib/queries/skills";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillVideoVariants, selectSkillVideo } from "@/lib/skill-video";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ skillId: string }>;
  searchParams: Promise<{ v?: string | string[] }>;
};

export default async function SkillDetailPage({ params, searchParams }: Props) {
  const tr = await getTranslations("ui");
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
  const variants = getSkillVideoVariants(skill, tr);
  const activeVideo = selectSkillVideo(variants, (await searchParams).v);

  return (
    <div className="space-y-6">
      <BackButton />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{skill.name}</h1>
        <p className="text-muted-foreground text-sm">
          {[
            skill.subtitle ?? skill.name_italian,
            gradeLabelForDiscipline(
              skill.discipline,
              skill.minimum_grade_value,
              tr,
            ),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <section aria-label={tr("techniqueVideo")} className="space-y-3">
        {variants.length > 1 && (
          <SegmentedNav
            ariaLabel={tr("videoVariant")}
            fullWidth
            wrapLabels
            replace
            scroll={false}
            items={variants.map((variant) => ({
              href: `/skill/${skillId}${variant.value === "2" ? "?v=2" : ""}`,
              label: variant.label,
              active: variant.value === activeVideo?.value,
            }))}
          />
        )}
        <VideoPlayer
          key={activeVideo?.videoId ?? "unavailable"}
          videoUrl={activeVideo?.url ?? ""}
          title={
            activeVideo ? `${skill.name} — ${activeVideo.label}` : skill.name
          }
          thumbnailUrl={activeVideo?.thumbnailUrl}
        />
      </section>

      <TeacherNote note={skill.teacher_notes} />

      <PersonalNotesPanel notes={personalNotes} />

      <div className="app-sticky-action material-bar">
        <SkillPracticeActions
          skillId={skillId}
          inPersonalSelection={inPersonalSelection}
          practicedToday={practicedToday}
          todayNote={todayLog?.personal_note ?? ""}
        />
      </div>
    </div>
  );
}
