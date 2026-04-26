import { Badge } from "@/components/ui/badge";
import type { PracticeMode } from "@/lib/types";
import { PRACTICE_MODE_LABELS } from "@/lib/labels";
import { User, Users, type LucideIcon } from "lucide-react";

type Props = {
  mode: PracticeMode;
  compact?: boolean;
};

const ICONS: Record<PracticeMode, LucideIcon> = {
  solo: User,
  paired: Users,
  both: Users,
};

export function PracticeModeBadge({ mode, compact = false }: Props) {
  const Icon = ICONS[mode];
  const label = PRACTICE_MODE_LABELS[mode];

  if (!Icon || !label) return null;

  return (
    <Badge
      variant="secondary"
      aria-label={label}
      className={compact ? "bg-background/80 px-2 backdrop-blur-sm" : undefined}
      title={compact ? label : undefined}
    >
      <Icon className={compact ? "h-3 w-3" : "mr-1 h-3 w-3"} />
      {!compact && label}
    </Badge>
  );
}
