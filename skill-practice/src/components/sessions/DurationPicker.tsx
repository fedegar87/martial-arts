"use client";
import type { UiTranslator } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

import { ChipButton } from "@/components/primitives/Chip";

function OPTIONS(
  tr: UiTranslator,
): Array<{ weeks: 4 | 8 | 12 | 24; label: string }> {
  return [
    { weeks: 4, label: tr("oneMonth") },
    { weeks: 8, label: tr("twoMonths") },
    { weeks: 12, label: tr("threeMonths") },
    { weeks: 24, label: tr("sixMonths") },
  ];
}

type Props = {
  value: 4 | 8 | 12 | 24;
  onChange: (w: 4 | 8 | 12 | 24) => void;
};

export function DurationPicker({ value, onChange }: Props) {
  const tr = useTranslations("ui");
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS(tr).map((opt) => (
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
