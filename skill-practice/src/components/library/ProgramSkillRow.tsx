import Link from "next/link";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  planStatus?: PlanStatus;
  planStatusLabelPrefix: string;
};

export function ProgramSkillRow({
  skill,
  planStatus,
  planStatusLabelPrefix,
}: Props) {
  return (
    <Link href={`/skill/${skill.id}`}>
      <div className="tap-feedback hover:bg-muted flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm">
        {planStatus ? (
          <PlanStatusDot
            status={planStatus}
            activeLabelPrefix={planStatusLabelPrefix}
          />
        ) : (
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{skill.name}</span>
          {skill.name_italian && (
            <span className="text-muted-foreground block truncate text-xs">
              {skill.name_italian}
            </span>
          )}
        </span>
        <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
      </div>
    </Link>
  );
}
