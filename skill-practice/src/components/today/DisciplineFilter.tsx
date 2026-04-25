import Link from "next/link";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type FilterValue = Discipline | "all";

type Props = {
  current: FilterValue;
};

const OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "Tutte" },
  { value: "shaolin", label: DISCIPLINE_LABELS.shaolin },
  { value: "taichi", label: DISCIPLINE_LABELS.taichi },
];

export function DisciplineFilter({ current }: Props) {
  return (
    <div className="bg-muted inline-flex rounded-lg p-1">
      {OPTIONS.map((option) => {
        const active = current === option.value;
        const href =
          option.value === "all" ? "/today" : `/today?d=${option.value}`;

        return (
          <Link
            key={option.value}
            href={href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
