import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Discipline, PlanMode } from "@/lib/types";

type Props = {
  current: PlanMode;
  discipline: Discipline;
  activeMode: PlanMode;
};

const TABS: { mode: PlanMode; label: string }[] = [
  { mode: "exam", label: "Esame" },
  { mode: "custom", label: "Personalizzato" },
];

export function PlanTabsNav({ current, discipline, activeMode }: Props) {
  return (
    <nav
      aria-label="Modalità del piano"
      className="flex shrink-0 flex-col self-start"
    >
      {TABS.map(({ mode, label }) => (
        <TabLink
          key={mode}
          href={`/programma?d=${discipline}&t=${mode}`}
          active={current === mode}
          isActiveMode={activeMode === mode}
          label={label}
        />
      ))}
    </nav>
  );
}

function TabLink({
  href,
  active,
  isActiveMode,
  label,
}: {
  href: string;
  active: boolean;
  isActiveMode: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`tap-feedback label-font relative flex min-h-12 items-center gap-2 border-r-2 px-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-card text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {isActiveMode && (
        <span
          aria-label="Modalità attiva"
          title="Modalità attiva"
          className="ml-auto inline-flex items-center gap-1 text-primary"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span className="hidden text-[0.65rem] sm:inline">Attivo</span>
        </span>
      )}
    </Link>
  );
}
