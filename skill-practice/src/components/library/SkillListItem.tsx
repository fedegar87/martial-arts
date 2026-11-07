import { LevelBadge } from "@/components/skill/LevelBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { Card } from "@/components/ui/card";
import {
  formatEstimatedMinutes,
  skillItalianSubtitle,
} from "@/lib/skill-presentation";
import type { PlanStatus, Skill } from "@/lib/types";
import { ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  skill: Skill;
  planStatus?: PlanStatus;
  statusLabelPrefix?: string;
  showEmptyStatusDot?: boolean;
  editableStatus?: boolean;
};

export function SkillListItem({
  skill,
  planStatus,
  statusLabelPrefix,
  showEmptyStatusDot = true,
  editableStatus = false,
}: Props) {
  const tr = useTranslations("ui");
  const subtitle = skillItalianSubtitle(
    skill.name,
    skill.subtitle ?? skill.name_italian,
  );
  const duration = formatEstimatedMinutes(skill.estimated_duration_seconds);
  const editable = editableStatus && planStatus;

  return (
    <Card className="flex min-h-16 flex-row items-center gap-1 p-0">
      <Link
        href={`/skill/${skill.id}`}
        className="flex min-h-16 min-w-0 flex-1 items-center gap-3 p-3"
      >
        {planStatus || showEmptyStatusDot ? (
          <PlanStatusDot
            status={planStatus}
            activeLabelPrefix={statusLabelPrefix ?? tr("inPlan")}
          />
        ) : (
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="wrap-break-word font-medium leading-snug">
            {skill.name}
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 wrap-break-word text-xs leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
            <LevelBadge level={skill.minimum_grade_value} />
            {duration && (
              <span
                className="flex items-center gap-1"
                aria-label={tr("estimatedPracticeDuration", { p0: duration })}
              >
                <Clock className="h-3 w-3" aria-hidden />
                {duration}
              </span>
            )}
          </div>
        </div>
        {planStatus && (
          <span className="hidden sm:inline-flex">
            <StatusBadge status={planStatus} />
          </span>
        )}
        <VideoAvailabilityBadge
          videoUrl={skill.video_url}
          secondaryVideoUrl={skill.secondary_video_url}
          compact
        />
        {!editable && (
          <ChevronRight
            className="text-muted-foreground h-4 w-4 shrink-0"
            aria-hidden
          />
        )}
      </Link>
      {editable && (
        <div className="pr-2">
          <SkillStatusMenu
            skillId={skill.id}
            currentStatus={planStatus}
            showHide={false}
          />
        </div>
      )}
    </Card>
  );
}
