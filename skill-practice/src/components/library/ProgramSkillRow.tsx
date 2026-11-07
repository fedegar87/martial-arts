import Link from "next/link";
import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import { skillItalianSubtitle } from "@/lib/skill-presentation";
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
  const subtitle = skillItalianSubtitle(skill.name, skill.name_italian);
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
          <span className="block wrap-break-word font-medium leading-snug">{skill.name}</span>
          {subtitle && (
            <span className="text-muted-foreground mt-0.5 block wrap-break-word text-xs leading-relaxed">
              {subtitle}
            </span>
          )}
        </span>
        <VideoAvailabilityBadge videoUrl={skill.video_url} secondaryVideoUrl={skill.secondary_video_url} compact />
      </div>
    </Link>
  );
}
