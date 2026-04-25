import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeEmbed } from "@/components/skill/YouTubeEmbed";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { PracticeCheckButton } from "./PracticeCheckButton";
import type { PlanStatus, Skill } from "@/lib/types";
import { Lightbulb } from "lucide-react";

type Props = {
  skill: Skill;
  status: PlanStatus;
  alreadyDoneToday: boolean;
};

export function TodaySkillCard({ skill, status, alreadyDoneToday }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{skill.name}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <YouTubeEmbed videoUrl={skill.video_url} title={skill.name} />
        {skill.teacher_notes && (
          <div className="bg-muted text-muted-foreground flex gap-2 rounded-md p-3 text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{skill.teacher_notes}</span>
          </div>
        )}
        <PracticeCheckButton
          skillId={skill.id}
          alreadyDone={alreadyDoneToday}
        />
      </CardContent>
    </Card>
  );
}
