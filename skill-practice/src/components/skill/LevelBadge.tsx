import { Badge } from "@/components/ui/badge";

export function LevelBadge({ level }: { level: number }) {
  return <Badge variant="outline">Livello {level}</Badge>;
}
