import { Badge } from "@/components/ui/badge";
import { gradeLabel } from "@/lib/grades";

export function LevelBadge({ level }: { level: number }) {
  return <Badge variant="outline">{gradeLabel(level)}</Badge>;
}
