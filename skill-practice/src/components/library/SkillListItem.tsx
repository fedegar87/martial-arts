import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { ChevronRight, Clock } from "lucide-react";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  planStatus?: PlanStatus;
};

export function SkillListItem({ skill, planStatus }: Props) {
  return (
    <Link href={`/skill/${skill.id}`}>
      <Card className="tap-feedback hover:bg-muted/50 flex min-h-16 flex-row items-center gap-3 p-3 transition-colors">
        <PlanStatusDot status={planStatus} />
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
        <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
      </Card>
    </Link>
  );
}
