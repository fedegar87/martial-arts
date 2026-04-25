import { notFound, redirect } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getSkillById } from "@/lib/queries/skills";
import { getUserPlanItemBySkill } from "@/lib/queries/plan";
import { YouTubeEmbed } from "@/components/skill/YouTubeEmbed";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { AddToPlanButton } from "@/components/skill/AddToPlanButton";
import { Card, CardContent } from "@/components/ui/card";
import { SKILL_CATEGORY_LABELS } from "@/lib/types";

type Props = { params: Promise<{ skillId: string }> };

export default async function SkillDetailPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { skillId } = await params;
  const skill = await getSkillById(skillId);
  if (!skill) notFound();

  const planItem = await getUserPlanItemBySkill(profile.id, skillId);
  const inPlan = planItem !== null && !planItem.is_hidden;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {SKILL_CATEGORY_LABELS[skill.category]}
          </span>
          <LevelBadge level={skill.minimum_level} />
          {inPlan && planItem && <StatusBadge status={planItem.status} />}
        </div>
        <h1 className="text-2xl font-semibold">{skill.name}</h1>
      </header>

      <YouTubeEmbed videoUrl={skill.video_url} title={skill.name} />

      {skill.teacher_notes && (
        <Card>
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

      <AddToPlanButton skillId={skillId} inPlan={inPlan} />
    </div>
  );
}
