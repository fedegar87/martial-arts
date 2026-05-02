import { Flame, Repeat, Wrench } from "lucide-react";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";

export function PlanStatusLegend() {
  return (
    <details className="rounded-md border border-border/70 px-3 py-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground">
        Legenda stati
      </summary>
      <div className="mt-2 grid gap-2 text-muted-foreground sm:grid-cols-3">
        <LegendItem
          icon={
            <Flame
              className={`h-3.5 w-3.5 ${PLAN_STATUS_VISUALS.focus.textClassName}`}
            />
          }
          label={PLAN_STATUS_VISUALS.focus.label}
          description="apprendimento attivo"
        />
        <LegendItem
          icon={
            <Repeat
              className={`h-3.5 w-3.5 ${PLAN_STATUS_VISUALS.review.textClassName}`}
            />
          }
          label={PLAN_STATUS_VISUALS.review.label}
          description="consolidamento"
        />
        <LegendItem
          icon={
            <Wrench
              className={`h-3.5 w-3.5 ${PLAN_STATUS_VISUALS.maintenance.textClassName}`}
            />
          }
          label={PLAN_STATUS_VISUALS.maintenance.label}
          description="repertorio"
        />
      </div>
    </details>
  );
}

function LegendItem({
  icon,
  label,
  description,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <span className="text-foreground">{label}</span>
      <span>{description}</span>
    </span>
  );
}
