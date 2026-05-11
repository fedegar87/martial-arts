"use client";

import { OptionCard } from "@/components/primitives/OptionCard";

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
        <OptionCard
          key={opt.value}
          selected={value === opt.value}
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
        </OptionCard>
      ))}
    </div>
  );
}
