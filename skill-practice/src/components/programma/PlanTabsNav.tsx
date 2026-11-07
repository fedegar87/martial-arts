import type { UiTranslator } from "@/lib/i18n/config";
import type { Discipline, PlanMode } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  current: PlanMode;
  discipline: Discipline;
  activeMode: PlanMode;
};

function TABS(tr: UiTranslator): { mode: PlanMode; label: string }[] {
  return [
    { mode: "exam", label: tr("exam") },
    { mode: "custom", label: tr("personal") },
  ];
}

export function PlanTabsNav({ current, discipline, activeMode }: Props) {
  const tr = useTranslations("ui");
  return (
    <nav
      aria-label={tr("planMode")}
      className="program-plan-tabs shrink-0 self-start"
    >
      {TABS(tr).map(({ mode, label }) => (
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
  const tr = useTranslations("ui");
  return (
    <Link
      href={href}
      prefetch
      aria-current={active ? "page" : undefined}
      className={`program-plan-tab tap-feedback label-font relative flex min-h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-card text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {isActiveMode && (
        <span
          aria-label={tr("activeMode")}
          title={tr("activeMode")}
          className="ml-auto inline-flex items-center gap-1 text-primary"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span className="hidden text-[0.65rem] sm:inline">
            {tr("active")}
          </span>
        </span>
      )}
    </Link>
  );
}
