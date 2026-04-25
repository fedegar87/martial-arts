import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { ChevronRight, Clock } from "lucide-react";
import type { Skill } from "@/lib/types";

export function SkillListItem({ skill }: { skill: Skill }) {
  return (
    <Link href={`/skill/${skill.id}`}>
      <Card className="hover:bg-muted/50 flex flex-row items-center gap-3 p-3 transition-colors">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{skill.name}</div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <LevelBadge level={skill.minimum_level} />
            {skill.estimated_duration_seconds && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(skill.estimated_duration_seconds / 60)} min
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
      </Card>
    </Link>
  );
}
