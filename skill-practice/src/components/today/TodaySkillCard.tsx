import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge";
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { PracticeCheckButton } from "./PracticeCheckButton";
import type { PlanStatus, Skill } from "@/lib/types";
import { Lightbulb } from "lucide-react";

type Props = {
  skill: Skill;
  status: PlanStatus;
  alreadyDoneToday: boolean;
};

export function TodaySkillCard({ skill, status, alreadyDoneToday }: Props) {
  const needsPartner =
    skill.practice_mode === "paired" || skill.practice_mode === "both";

  return (
    <Card
      className={
        status === "focus"
          ? "border-primary shadow-[0_0_24px_var(--gold-glow)]"
          : undefined
      }
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{skill.name}</CardTitle>
            {skill.name_italian && (
              <p className="text-muted-foreground text-xs">
                {skill.name_italian}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <PracticeModeBadge mode={skill.practice_mode} />
            <StatusBadge status={status} />
            <SkillStatusMenu skillId={skill.id} currentStatus={status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <VideoPlayer
          videoUrl={skill.video_url}
          title={skill.name}
          category={skill.category}
          practiceMode={skill.practice_mode}
        />
        {skill.teacher_notes && (
          <div className="bg-muted text-muted-foreground flex gap-2 rounded-sm p-3 text-sm italic">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{skill.teacher_notes}</span>
          </div>
        )}
        {needsPartner && (
          <p className="text-muted-foreground text-sm">
            {skill.practice_mode === "paired"
              ? "Richiede un partner: se sei da solo, ripassa mentalmente la sequenza."
              : "Ripassa la forma da solo; l'applicazione richiede un partner."}
          </p>
        )}
        <PracticeCheckButton
          skillId={skill.id}
          alreadyDone={alreadyDoneToday}
        />
      </CardContent>
    </Card>
  );
}
