"use client";
import type { UiTranslator } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

import { ChipButton } from "@/components/primitives/Chip";

function LABELS(tr: UiTranslator) {
  return [
    tr("monday"),
    tr("tuesday"),
    tr("wednesday"),
    tr("thursday"),
    tr("friday"),
    tr("saturday"),
    tr("sunday"),
  ];
}

type Props = {
  value: number[];
  onChange: (v: number[]) => void;
};

export function WeekdayChips({ value, onChange }: Props) {
  const tr = useTranslations("ui");
  function toggle(day: number) {
    onChange(
      value.includes(day)
        ? value.filter((d) => d !== day)
        : [...value, day].sort((a, b) => a - b),
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {LABELS(tr).map((label, i) => {
        const day = i + 1;
        const active = value.includes(day);
        return (
          <ChipButton key={day} onClick={() => toggle(day)} active={active}>
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
