import { Badge } from "@/components/ui/badge";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";
import { Flame, Repeat, Wrench } from "lucide-react";

const STATUS_CONFIG: Record<
  PlanStatus,
  { Icon: typeof Flame }
> = {
  focus: {
    Icon: Flame,
  },
  review: {
    Icon: Repeat,
  },
  maintenance: {
    Icon: Wrench,
  },
};

export function StatusBadge({ status }: { status: PlanStatus }) {
  const { Icon } = STATUS_CONFIG[status];
  const visual = PLAN_STATUS_VISUALS[status];
  return (
    <Badge className={`label-font ${visual.badgeClassName}`}>
      <Icon className="mr-1 h-3 w-3" />
      {visual.label}
    </Badge>
  );
}
