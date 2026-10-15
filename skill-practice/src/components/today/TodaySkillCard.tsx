import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { StatusBadge } from "@/components/skill/StatusBadge";
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
  todayNote?: string;
};

export function TodaySkillCard({
  skill,
  status,
  alreadyDoneToday,
  repsTarget,
  repsDone,
  todayNote,
}: Props) {
  const completedToday =
    alreadyDoneToday ||
    (typeof repsTarget === "number" &&
      typeof repsDone === "number" &&
      repsDone >= repsTarget);

  return (
    <Card
      className={`transition-all duration-[var(--duration-transition)] ease-[var(--ease-spring-smooth)] ${
        completedToday
          ? "border-[color:var(--status-success)]/60 bg-[color:var(--status-success)]/[0.02]"
          : status === "focus"
            ? "border-primary/50 shadow-[0_2px_20px_var(--tint-glow),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
            : "border-border/70"
      }`}
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
            <StatusBadge status={status} />
            <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
            <SkillStatusMenu
              skillId={skill.id}
              currentStatus={status}
              hideLabel="Nascondi da Allenamento"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <VideoPlayer
          videoUrl={skill.video_url}
          title={skill.name}
        />
        <TeacherNote note={skill.teacher_notes} compact />
        {typeof repsTarget === "number" && typeof repsDone === "number" ? (
          <RepsCounter
            skillId={skill.id}
            repsDone={repsDone}
            repsTarget={repsTarget}
            todayNote={todayNote}
          />
        ) : (
          <PracticeCheckButton
            skillId={skill.id}
            alreadyDone={alreadyDoneToday}
            initialNote={todayNote}
          />
        )}
      </CardContent>
    </Card>
  );
}
