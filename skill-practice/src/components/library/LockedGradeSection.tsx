import { Lock } from "lucide-react";
import type { SkillOption } from "@/lib/types";

type Props = {
  title: string;
  skills: SkillOption[];
};

export function LockedGradeSection({ title, skills }: Props) {
  if (skills.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={`${title} - bloccato`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">{title}</h2>
        <Lock className="text-muted-foreground/70 h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="border-border/60 rounded-lg border border-dashed p-1 opacity-65">
        {skills.map((skill) => (
          <div
            key={skill.id}
            aria-disabled="true"
            className="flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="text-muted-foreground block truncate font-medium">
                {skill.name}
              </span>
              {skill.name_italian && (
                <span className="text-muted-foreground/80 block truncate text-xs">
                  {skill.name_italian}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
