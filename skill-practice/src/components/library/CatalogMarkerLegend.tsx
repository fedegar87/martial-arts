import { PlanStatusDot } from "@/components/skill/PlanStatusDot";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";

type Props = {
  planStatusLabelPrefix: string;
  emptyLabel: string;
};

const STATUSES: PlanStatus[] = ["focus", "maintenance"];

export function CatalogMarkerLegend({
  planStatusLabelPrefix,
  emptyLabel,
}: Props) {
  return (
    <div className="rounded-md border border-border/70 px-3 py-2 text-xs">
      <div className="text-muted-foreground mb-2 font-medium">Indicatori</div>
      <ul className="text-muted-foreground flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1.5">
        {STATUSES.map((status) => (
          <li key={status} className="inline-flex items-center gap-2">
            <PlanStatusDot status={status} activeLabelPrefix={planStatusLabelPrefix} />
            <span>
              {planStatusLabelPrefix}: {PLAN_STATUS_VISUALS[status].label}
            </span>
          </li>
        ))}
        <li className="inline-flex items-center gap-2">
          <PlanStatusDot />
          <span>{emptyLabel}</span>
        </li>
      </ul>
    </div>
  );
}
