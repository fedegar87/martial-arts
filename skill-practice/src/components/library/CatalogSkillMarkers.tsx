import { CheckCircle2, Circle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  practiced: boolean;
  inActivePlan: boolean;
};

export function CatalogSkillMarkers({ practiced, inActivePlan }: Props) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <Marker
        active={practiced}
        activeClassName="text-[var(--status-success)]"
        label={practiced ? "Praticata almeno una volta" : "Mai praticata"}
      >
        {practiced ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </Marker>
      <Marker
        active={inActivePlan}
        activeClassName="text-primary"
        label={inActivePlan ? "Nel piano attivo" : "Non nel piano attivo"}
      >
        <Target className="h-4 w-4" />
      </Marker>
    </span>
  );
}

function Marker({
  active,
  activeClassName,
  label,
  children,
}: {
  active: boolean;
  activeClassName: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-sm",
        active ? activeClassName : "text-muted-foreground/45",
      )}
    >
      {children}
    </span>
  );
}
