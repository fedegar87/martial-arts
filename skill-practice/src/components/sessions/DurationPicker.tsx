"use client";

import { ChipButton } from "@/components/primitives/Chip";

const OPTIONS: Array<{ weeks: 4 | 8 | 12 | 24; label: string }> = [
  { weeks: 4, label: "1 mese" },
  { weeks: 8, label: "2 mesi" },
  { weeks: 12, label: "3 mesi" },
  { weeks: 24, label: "6 mesi" },
];

type Props = {
  value: 4 | 8 | 12 | 24;
  onChange: (w: 4 | 8 | 12 | 24) => void;
};

export function DurationPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <ChipButton
          key={opt.weeks}
          onClick={() => onChange(opt.weeks)}
          active={value === opt.weeks}
        >
          {opt.label}
        </ChipButton>
      ))}
      <input type="hidden" name="duration_weeks" value={value} />
    </div>
  );
}
