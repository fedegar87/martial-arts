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
    <details className="rounded-md border border-border/70 px-3 py-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground">
        Indicatori
      </summary>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
        {STATUSES.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${PLAN_STATUS_VISUALS[status].dotClassName}`}
            />
            {planStatusLabelPrefix}: {PLAN_STATUS_VISUALS[status].label}
          </span>
        ))}
        <span>{emptyLabel}</span>
      </div>
    </details>
  );
}
