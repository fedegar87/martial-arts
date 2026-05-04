import Link from "next/link";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  locked: boolean;
  planStatus?: PlanStatus;
  planStatusLabelPrefix: string;
};

export function ProgramSkillRow({
  skill,
  locked,
  planStatus,
  planStatusLabelPrefix,
}: Props) {
  const content = (
    <div
      className={`tap-feedback flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm ${
        locked ? "text-muted-foreground opacity-60" : "hover:bg-muted"
      }`}
    >
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
  );

  if (locked) return content;
  return <Link href={`/skill/${skill.id}`}>{content}</Link>;
}
