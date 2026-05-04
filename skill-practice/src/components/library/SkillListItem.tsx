import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { StatusBadge } from "@/components/skill/StatusBadge";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { SkillStatusMenu } from "@/components/today/SkillStatusMenu";
import { ChevronRight, Clock } from "lucide-react";
import type { PlanStatus, Skill } from "@/lib/types";

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
  statusLabelPrefix = "Nel piano",
  showEmptyStatusDot = true,
  editableStatus = false,
}: Props) {
  return (
    <Card className="tap-feedback hover:bg-muted/50 flex min-h-16 flex-row items-center gap-3 p-3 transition-colors">
      <Link
        href={`/skill/${skill.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {planStatus || showEmptyStatusDot ? (
          <PlanStatusDot
            status={planStatus}
            activeLabelPrefix={statusLabelPrefix}
          />
        ) : (
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{skill.name}</div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <LevelBadge level={skill.minimum_grade_value} />
            {skill.estimated_duration_seconds && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(skill.estimated_duration_seconds / 60)} min
              </span>
            )}
          </div>
        </div>
      </Link>
      {planStatus && (
        <span className="hidden sm:inline-flex">
          <StatusBadge status={planStatus} />
        </span>
      )}
      <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
      {editableStatus && planStatus ? (
        <SkillStatusMenu
          skillId={skill.id}
          currentStatus={planStatus}
          showHide={false}
        />
      ) : (
        <Link
          href={`/skill/${skill.id}`}
          aria-label={`Apri ${skill.name}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      )}
    </Card>
  );
}
