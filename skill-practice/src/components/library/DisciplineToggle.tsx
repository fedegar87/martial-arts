import Link from "next/link";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type Props = {
  current: Discipline;
  basePath: string;
  hiddenTaichi?: boolean;
};

const DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export function DisciplineToggle({
  current,
  basePath,
  hiddenTaichi = false,
}: Props) {
  const visible = hiddenTaichi
    ? DISCIPLINES.filter((d) => d !== "taichi")
    : DISCIPLINES;

  if (visible.length < 2) return null;

  return (
    <div className="bg-muted inline-flex rounded-lg p-1">
      {visible.map((discipline) => {
        const active = current === discipline;
        return (
          <Link
            key={discipline}
            href={`${basePath}?d=${discipline}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {DISCIPLINE_LABELS[discipline]}
          </Link>
        );
      })}
    </div>
  );
}
