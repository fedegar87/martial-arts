import Link from "next/link";
import { cn } from "@/lib/utils";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type Props = {
  current: Discipline;
  basePath: string;
  hiddenTaichi?: boolean;
  extraParams?: Record<string, string | undefined>;
};

const DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export function DisciplineToggle({
  current,
  basePath,
  hiddenTaichi = false,
  extraParams,
}: Props) {
  const visible = hiddenTaichi
    ? DISCIPLINES.filter((d) => d !== "taichi")
    : DISCIPLINES;

  if (visible.length < 2) return null;

  return (
    <nav
      aria-label="Disciplina"
      className="flex w-full gap-1 rounded-md bg-muted/40 p-1"
    >
      {visible.map((discipline) => {
        const active = current === discipline;
        return (
          <Link
            key={discipline}
            href={disciplineHref(basePath, discipline, extraParams)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "label-font tap-feedback flex min-h-10 flex-1 items-center justify-center rounded-sm px-3 text-sm transition-colors",
              active
                ? "border border-border bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="truncate">{DISCIPLINE_LABELS[discipline]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function disciplineHref(
  basePath: string,
  discipline: Discipline,
  extraParams?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }
  params.set("d", discipline);
  return `${basePath}?${params.toString()}`;
}
