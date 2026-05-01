import { Badge } from "@/components/ui/badge";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

const STYLES: Record<Discipline, string> = {
  shaolin: "border-border bg-secondary text-secondary-foreground",
  taichi: "border-border bg-secondary text-secondary-foreground",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return (
    <Badge className={STYLES[discipline]}>{DISCIPLINE_LABELS[discipline]}</Badge>
  );
}
