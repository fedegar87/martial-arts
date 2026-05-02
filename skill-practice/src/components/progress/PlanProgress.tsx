import Link from "next/link";
import { Target } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanProgressInfo } from "@/lib/queries/progress";

type Props = {
  progress: PlanProgressInfo;
};

export function PlanProgress({ progress }: Props) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (progress.readinessPercent / 100) * circumference;
  const sectionTitle =
    progress.mode === "exam" ? "Preparazione esame" : "Piano attivo";

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Target} title={sectionTitle} />
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-foreground text-lg font-semibold"
          >
            {progress.readinessPercent}%
          </text>
        </svg>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-medium">{progress.title}</div>
          <p className="text-muted-foreground text-sm">
            {progress.practicedRecent}/{progress.total} praticati negli ultimi
            30 giorni.
          </p>
          <p className="text-muted-foreground text-sm">
            {progress.covered}/{progress.total} contenuti nel piano attivo.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <StatusStat
          label={PLAN_STATUS_VISUALS.focus.label}
          value={progress.statusCounts.focus}
          className={PLAN_STATUS_VISUALS.focus.textClassName}
        />
        <StatusStat
          label={PLAN_STATUS_VISUALS.review.label}
          value={progress.statusCounts.review}
          className={PLAN_STATUS_VISUALS.review.textClassName}
        />
        <StatusStat
          label={PLAN_STATUS_VISUALS.maintenance.label}
          value={progress.statusCounts.maintenance}
          className={PLAN_STATUS_VISUALS.maintenance.textClassName}
        />
      </div>
      {progress.missing.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            {progress.missing.length} contenuti richiesti non nel piano attivo
          </summary>
          <div className="mt-2 space-y-1">
            {progress.missing.map((skill) => (
              <Link
                key={skill.id}
                href={`/skill/${skill.id}`}
                className="block rounded-md px-2 py-1 hover:bg-muted"
              >
                {skill.name}
              </Link>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function StatusStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-md bg-muted p-2">
      <div className={`font-semibold ${className}`}>{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
