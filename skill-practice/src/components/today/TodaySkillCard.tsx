import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge";
import { PracticeCompletionBadge } from "@/components/skill/PracticeCompletionBadge";
import { TeacherNote } from "@/components/skill/TeacherNote";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { PracticeCheckButton } from "./PracticeCheckButton";
import { RepsCounter } from "./RepsCounter";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  status: PlanStatus;
  alreadyDoneToday: boolean;
  repsTarget?: number;
  repsDone?: number;
};

export function TodaySkillCard({
  skill,
  status,
  alreadyDoneToday,
  repsTarget,
  repsDone,
}: Props) {
  const needsPartner =
    skill.practice_mode === "paired" || skill.practice_mode === "both";
  const completedToday =
    alreadyDoneToday ||
    (typeof repsTarget === "number" &&
      typeof repsDone === "number" &&
      repsDone >= repsTarget);

  return (
    <Card
      className={
        completedToday
          ? "border-[color:var(--status-success)]"
          : status === "focus"
            ? "border-primary/40 shadow-[0_0_24px_var(--gold-glow)]"
            : "border-transparent"
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
            <PracticeCompletionBadge completed={completedToday} />
            <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
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
        <TeacherNote note={skill.teacher_notes} compact />
        {needsPartner && (
          <p className="text-muted-foreground text-sm">
            {skill.practice_mode === "paired"
              ? "Richiede un partner: se sei da solo, ripassa mentalmente la sequenza."
              : "Ripassa la forma da solo; l'applicazione richiede un partner."}
          </p>
        )}
        {typeof repsTarget === "number" && typeof repsDone === "number" ? (
          <RepsCounter
            skillId={skill.id}
            repsDone={repsDone}
            repsTarget={repsTarget}
          />
        ) : (
          <PracticeCheckButton
            skillId={skill.id}
            alreadyDone={alreadyDoneToday}
          />
        )}
      </CardContent>
    </Card>
  );
}
