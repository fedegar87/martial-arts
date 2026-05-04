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
  if (!status) {
    return (
      <span
        role="img"
        aria-label="Non nel piano"
        title="Non nel piano"
        className={cn(
          "border-muted-foreground/40 inline-block h-2.5 w-2.5 shrink-0 rounded-full border bg-transparent",
          className,
        )}
      />
    );
  }

  const visual = PLAN_STATUS_VISUALS[status];
  const Icon = visual.Icon;
  const label = `${activeLabelPrefix}: ${visual.label}`;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center",
        visual.textClassName,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
