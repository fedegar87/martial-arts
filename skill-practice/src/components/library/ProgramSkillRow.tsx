import Link from "next/link";
import { CategoryIcon } from "@/components/skill/CategoryIcon";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  locked: boolean;
  planStatus?: PlanStatus;
};

const STATUS_CLASS: Record<PlanStatus, string> = {
  focus: "bg-primary",
  review: "bg-[var(--status-warning)]",
  maintenance: "bg-[var(--status-success)]",
};

export function ProgramSkillRow({ skill, locked, planStatus }: Props) {
  const content = (
    <div
      className={`tap-feedback flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm ${
        locked ? "text-muted-foreground opacity-60" : "hover:bg-muted"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          planStatus ? STATUS_CLASS[planStatus] : "bg-border"
        }`}
        aria-label={planStatus ? `Nel piano: ${planStatus}` : "Non nel piano"}
      />
      <CategoryIcon category={skill.category} className="text-muted-foreground h-4 w-4" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{skill.name}</span>
        {skill.name_italian && (
          <span className="text-muted-foreground block truncate text-xs">
            {skill.name_italian}
          </span>
        )}
      </span>
    </div>
  );

  if (locked) return content;
  return <Link href={`/skill/${skill.id}`}>{content}</Link>;
}
