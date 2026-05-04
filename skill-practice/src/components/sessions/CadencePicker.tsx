"use client";

import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: "Ciclo di 1 settimana" },
  { value: 2, label: "Ciclo di 2 settimane" },
  { value: 4, label: "Ciclo di 4 settimane" },
];

type Props = { value: 1 | 2 | 4; onChange: (v: 1 | 2 | 4) => void };

export function CadencePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm",
            value === opt.value && "border-primary",
          )}
        >
          <input
            type="radio"
            name="cadence_weeks"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
