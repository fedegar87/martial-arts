import Link from "next/link";
import { CatalogSkillMarkers } from "@/components/library/CatalogSkillMarkers";
import { VideoAvailabilityBadge } from "@/components/skill/VideoAvailabilityBadge";
import type { Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  locked: boolean;
  practiced: boolean;
  inActivePlan: boolean;
};

export function ProgramSkillRow({
  skill,
  locked,
  practiced,
  inActivePlan,
}: Props) {
  const content = (
    <div
      className={`tap-feedback flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm ${
        locked ? "text-muted-foreground opacity-60" : "hover:bg-muted"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{skill.name}</span>
        {skill.name_italian && (
          <span className="text-muted-foreground block truncate text-xs">
            {skill.name_italian}
          </span>
        )}
      </span>
      <CatalogSkillMarkers
        practiced={practiced}
        inActivePlan={inActivePlan}
      />
      <VideoAvailabilityBadge videoUrl={skill.video_url} compact />
    </div>
  );

  if (locked) return content;
  return <Link href={`/skill/${skill.id}`}>{content}</Link>;
}
