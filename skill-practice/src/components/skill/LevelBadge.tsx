import { Badge } from "@/components/ui/badge";
import { gradeLabel } from "@/lib/grades";
import { useTranslations } from "next-intl";

export function LevelBadge({ level }: { level: number }) {
  const tr = useTranslations("ui");
  return (
    <Badge variant="outline" className="font-mono text-[0.7rem]">
      {gradeLabel(level, tr)}
    </Badge>
  );
}
