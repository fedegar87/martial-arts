import { CheckCircle2, Circle, Target } from "lucide-react";

export function CatalogMarkerLegend() {
  return (
    <details className="rounded-md border border-border/70 px-3 py-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground">
        Indicatori
      </summary>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--status-success)]" />
          Praticata
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Circle className="h-3.5 w-3.5 text-muted-foreground/45" />
          Mai praticata
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          Nel piano attivo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-muted-foreground/45" />
          Non nel piano
        </span>
      </div>
    </details>
  );
}
