import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  status?: PlanStatus;
  className?: string;
  activeLabelPrefix?: string;
};

export function PlanStatusDot({ status, className, activeLabelPrefix }: Props) {
  const tr = useTranslations("ui");
  if (!status) {
    return (
      <span
        role="img"
        aria-label={tr("notInPlan")}
        title={tr("notInPlan")}
        className={cn(
          "border-muted-foreground/40 inline-block h-2.5 w-2.5 shrink-0 rounded-full border bg-transparent",
          className,
        )}
      />
    );
  }

  const visual = PLAN_STATUS_VISUALS[status];
  const Icon = visual.Icon;
  const label = `${activeLabelPrefix ?? tr("inPlan")}: ${tr(status)}`;

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
