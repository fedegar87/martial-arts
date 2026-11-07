import { Badge } from "@/components/ui/badge";
import { disciplineLabel } from "@/lib/labels";
import type { Discipline } from "@/lib/types";
import { useTranslations } from "next-intl";

const STYLES: Record<Discipline, string> = {
  shaolin: "border-border bg-secondary text-secondary-foreground",
  taichi: "border-border bg-secondary text-secondary-foreground",
};

export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  const tr = useTranslations("ui");
  return (
    <Badge className={STYLES[discipline]}>
      {disciplineLabel(discipline, tr)}
    </Badge>
  );
}
