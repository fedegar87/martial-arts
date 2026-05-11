"use client";

import { ChipButton } from "@/components/primitives/Chip";

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
          <ChipButton
            key={day}
            onClick={() => toggle(day)}
            active={active}
          >
            {label}
          </ChipButton>
        );
      })}
      {value.map((d) => (
        <input key={d} type="hidden" name="weekdays" value={d} />
      ))}
    </div>
  );
}
