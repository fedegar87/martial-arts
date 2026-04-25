import { Badge } from "@/components/ui/badge";
import type { PracticeMode } from "@/lib/types";
import { PRACTICE_MODE_ICONS, PRACTICE_MODE_LABELS } from "@/lib/labels";

type Props = {
  mode: PracticeMode;
  compact?: boolean;
};

export function PracticeModeBadge({ mode, compact = false }: Props) {
  return (
    <Badge
      variant="secondary"
      aria-label={PRACTICE_MODE_LABELS[mode]}
      className={compact ? "bg-background/80 px-2 backdrop-blur-sm" : undefined}
      title={compact ? PRACTICE_MODE_LABELS[mode] : undefined}
    >
      <span className={compact ? "" : "mr-1"}>{PRACTICE_MODE_ICONS[mode]}</span>
      {!compact && PRACTICE_MODE_LABELS[mode]}
    </Badge>
  );
}
