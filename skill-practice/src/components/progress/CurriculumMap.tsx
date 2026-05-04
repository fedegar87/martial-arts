import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import {
  CURRICULUM_MARKER_VISUALS,
  PLAN_STATUS_VISUALS,
} from "@/lib/marker-visuals";
import type { CurriculumCell } from "@/lib/queries/progress";

type Props = {
  cells: CurriculumCell[];
};

export function CurriculumMap({ cells }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Grid3X3} title="Copertura curriculum" />
      <div className="grid grid-cols-10 gap-1 sm:grid-cols-14">
        {cells.map((cell) => {
          const className = `h-5 rounded-sm ${statusClass(cell.status)}`;
          if (cell.status === "locked") {
            return (
              <div
                key={cell.skill.id}
                className={className}
                title={`${cell.skill.name}: bloccata`}
                aria-label={`${cell.skill.name}: bloccata`}
                aria-disabled
              />
            );
          }
          return (
            <Link
              key={cell.skill.id}
              href={`/skill/${cell.skill.id}`}
              className={className}
              title={cell.skill.name}
              aria-label={`${cell.skill.name}: ${statusLabel(cell.status)}`}
            />
          );
        })}
      </div>
      <div className="text-muted-foreground text-sm">
        {cells.filter((cell) => cell.status !== "locked").length} contenuti
        accessibili,{" "}
        {
          cells.filter(
            (cell) =>
              cell.status === "focus" || cell.status === "maintenance",
          ).length
        }{" "}
        nel piano attivo.
      </div>
      <MapLegend />
    </section>
  );
}

function statusClass(status: CurriculumCell["status"]): string {
  if (status === "focus") return PLAN_STATUS_VISUALS.focus.mapClassName;
  if (status === "maintenance") {
    return PLAN_STATUS_VISUALS.maintenance.mapClassName;
  }
  if (status === "locked") return CURRICULUM_MARKER_VISUALS.locked.mapClassName;
  return CURRICULUM_MARKER_VISUALS.available.mapClassName;
}

function statusLabel(status: CurriculumCell["status"]): string {
  if (status === "focus") return PLAN_STATUS_VISUALS.focus.label;
  if (status === "maintenance") return PLAN_STATUS_VISUALS.maintenance.label;
  if (status === "locked") return CURRICULUM_MARKER_VISUALS.locked.label;
  return CURRICULUM_MARKER_VISUALS.available.label;
}

function MapLegend() {
  return (
    <details className="rounded-md border border-border/70 px-3 py-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground">
        Legenda mappa
      </summary>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
        <LegendSwatch
          className={PLAN_STATUS_VISUALS.focus.mapClassName}
          label={PLAN_STATUS_VISUALS.focus.label}
        />
        <LegendSwatch
          className={PLAN_STATUS_VISUALS.maintenance.mapClassName}
          label={PLAN_STATUS_VISUALS.maintenance.label}
        />
        <LegendSwatch
          className={CURRICULUM_MARKER_VISUALS.available.mapClassName}
          label={CURRICULUM_MARKER_VISUALS.available.label}
        />
        <LegendSwatch
          className={CURRICULUM_MARKER_VISUALS.locked.mapClassName}
          label={CURRICULUM_MARKER_VISUALS.locked.label}
        />
      </div>
    </details>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
