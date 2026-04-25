import { Badge } from "@/components/ui/badge";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

const STYLES: Record<Discipline, string> = {
  shaolin: "bg-orange-700 text-white border-transparent",
  taichi: "bg-blue-700 text-white border-transparent",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  return (
    <Badge className={STYLES[discipline]}>{DISCIPLINE_LABELS[discipline]}</Badge>
  );
}
