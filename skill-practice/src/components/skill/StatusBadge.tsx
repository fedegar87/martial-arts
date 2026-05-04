import { Badge } from "@/components/ui/badge";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: PlanStatus }) {
  const visual = PLAN_STATUS_VISUALS[status];
  const Icon = visual.Icon;
  return (
    <Badge className={`label-font ${visual.badgeClassName}`}>
      <Icon className="mr-1 h-3 w-3" />
      {visual.label}
    </Badge>
  );
}
