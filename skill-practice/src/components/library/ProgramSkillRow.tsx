import Link from "next/link";
import { categoryEmoji } from "@/lib/labels";
import type { PlanStatus, Skill } from "@/lib/types";

type Props = {
  skill: Skill;
  locked: boolean;
  planStatus?: PlanStatus;
};

const STATUS_CLASS: Record<PlanStatus, string> = {
  focus: "bg-primary",
  review: "bg-amber-500",
  maintenance: "bg-green-500",
};

export function ProgramSkillRow({ skill, locked, planStatus }: Props) {
  const content = (
    <div
      className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
        locked ? "text-muted-foreground opacity-60" : "hover:bg-muted"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          planStatus ? STATUS_CLASS[planStatus] : "bg-border"
        }`}
        aria-label={planStatus ? `Nel piano: ${planStatus}` : "Non nel piano"}
      />
      <span aria-hidden>{categoryEmoji(skill.category)}</span>
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
