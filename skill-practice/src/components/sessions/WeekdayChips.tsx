"use client";

import { cn } from "@/lib/utils";

const LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type Props = {
  value: number[];
  onChange: (v: number[]) => void;
};

export function WeekdayChips({ value, onChange }: Props) {
  function toggle(day: number) {
    onChange(
      value.includes(day)
        ? value.filter((d) => d !== day)
        : [...value, day].sort((a, b) => a - b),
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {LABELS.map((label, i) => {
        const day = i + 1;
        const active = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm transition",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
      {value.map((d) => (
        <input key={d} type="hidden" name="weekdays" value={d} />
      ))}
    </div>
  );
}
