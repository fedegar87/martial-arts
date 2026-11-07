import { StatusBadge } from "@/components/skill/StatusBadge";
import { TeacherNote } from "@/components/skill/TeacherNote";
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanStatus, Skill } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PracticeCheckButton } from "./PracticeCheckButton";
import { RepsCounter } from "./RepsCounter";
import { TodayVideoDisclosure } from "./TodayVideoDisclosure";

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
  const tr = useTranslations("ui");
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
        <div className="flex items-start justify-between gap-2">
          <Link href={`/skill/${skill.id}`} className="min-w-0 space-y-1">
            <CardTitle className="flex items-baseline gap-1.5 text-2xl">
              <span>{skill.name}</span>
              <ArrowUpRight
                className="text-muted-foreground h-4 w-4 shrink-0 self-center"
                aria-hidden
              />
            </CardTitle>
            {(skill.subtitle ?? skill.name_italian) && (
              <p className="text-muted-foreground text-xs">
                {skill.subtitle ?? skill.name_italian}
              </p>
            )}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <StatusBadge status={status} />
            <SkillStatusMenu
              skillId={skill.id}
              currentStatus={status}
              hideLabel={tr("hideFromTraining")}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
        <TodayVideoDisclosure
          skillId={skill.id}
          skillName={skill.name}
          videoUrl={skill.video_url}
          secondaryVideoUrl={skill.secondary_video_url}
        />
      </CardContent>
    </Card>
  );
}
