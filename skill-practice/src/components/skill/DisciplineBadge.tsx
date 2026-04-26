import { Badge } from "@/components/ui/badge";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

const STYLES: Record<Discipline, string> = {
  shaolin: "border-primary/30 bg-primary/10 text-primary",
  taichi: "border-primary/30 bg-primary/10 text-primary",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return (
    <Badge className={STYLES[discipline]}>{DISCIPLINE_LABELS[discipline]}</Badge>
  );
}
