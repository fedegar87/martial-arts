"use client";
import type { UiTranslator } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

import { OptionCard } from "@/components/primitives/OptionCard";

function OPTIONS(tr: UiTranslator): Array<{ value: 1 | 2 | 4; label: string }> {
  return [
    { value: 1, label: tr("oneWeekCycle") },
    { value: 2, label: tr("twoWeekCycle") },
    { value: 4, label: tr("fourWeekCycle") },
  ];
}

type Props = { value: 1 | 2 | 4; onChange: (v: 1 | 2 | 4) => void };

export function CadencePicker({ value, onChange }: Props) {
  const tr = useTranslations("ui");
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS(tr).map((opt) => (
        <OptionCard key={opt.value} selected={value === opt.value}>
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
