"use client";

import { cn } from "@/lib/utils";

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
        <button
          key={opt.weeks}
          type="button"
          onClick={() => onChange(opt.weeks)}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm",
            value === opt.weeks
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
      <input type="hidden" name="duration_weeks" value={value} />
    </div>
  );
}
