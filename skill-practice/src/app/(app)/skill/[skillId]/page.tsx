import { notFound, redirect } from "next/navigation";
import { Lightbulb, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillById } from "@/lib/queries/skills";
import { getUserPlanItemBySkill } from "@/lib/queries/plan";
import { getPersonalNotesForSkill } from "@/lib/queries/practice-log";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge";
import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";

type Props = { params: Promise<{ skillId: string }> };

export default async function SkillDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { skillId } = await params;
  const skill = await getSkillById(skillId);
  if (!skill) notFound();

  const planItem = await getUserPlanItemBySkill(profile.id, skillId);
  const personalNotes = await getPersonalNotesForSkill(profile.id, skillId);
  const inPlan = planItem !== null && !planItem.is_hidden;
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

      {skill.teacher_notes && (
        <Card className="surface-inset">
          <CardContent className="flex gap-3 pt-6">
            <Lightbulb className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <div className="font-medium">Nota del maestro</div>
              <p className="text-muted-foreground text-sm">
                {skill.teacher_notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {personalNotes.length > 0 && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="font-medium">Le tue note</div>
            <div className="space-y-3">
              {personalNotes.map((note) => (
                <article key={note.id} className="border-border border-l pl-3">
                  <time className="text-muted-foreground text-xs">
                    {formatDate(note.date)}
                  </time>
                  <p className="text-sm">{note.personal_note}</p>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="material-bar sticky bottom-24 z-40 -mx-4 border-t border-border px-4 py-3">
        <AddToPlanButton skillId={skillId} inPlan={inPlan} />
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
