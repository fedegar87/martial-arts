import Link from "next/link";
import { Target } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ExamProgressInfo } from "@/lib/queries/progress";

type Props = {
  progress: ExamProgressInfo;
};

export function ExamProgress({ progress }: Props) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress.percent / 100) * circumference;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Target} title="Esame in preparazione" />
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
            {progress.percent}%
          </text>
        </svg>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{progress.title}</div>
          <p className="text-muted-foreground text-sm">
            {progress.covered}/{progress.total} contenuti nel piano.{" "}
            {progress.missing.length} mancanti.
          </p>
        </div>
      </div>
      {progress.missing.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Mostra contenuti mancanti
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
