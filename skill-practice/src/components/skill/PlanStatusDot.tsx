import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import { cn } from "@/lib/utils";
import type { PlanStatus } from "@/lib/types";

type Props = {
  status?: PlanStatus;
  className?: string;
  activeLabelPrefix?: string;
};

export function PlanStatusDot({
  status,
  className,
  activeLabelPrefix = "Nel piano",
}: Props) {
  const label = status
    ? `${activeLabelPrefix}: ${PLAN_STATUS_VISUALS[status].label}`
    : "Non nel piano";

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        status
          ? PLAN_STATUS_VISUALS[status].dotClassName
          : "border border-muted-foreground/40 bg-transparent",
        className,
      )}
    />
  );
}
