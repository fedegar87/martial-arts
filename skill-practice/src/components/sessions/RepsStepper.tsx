"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type Props = { value: number; onChange: (n: number) => void };

export function RepsStepper({ value, onChange }: Props) {
  const tr = useTranslations("ui");
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={tr("decrease")}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-8 text-center text-lg font-semibold tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.min(10, value + 1))}
        aria-label={tr("increase")}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <input type="hidden" name="reps_per_form" value={value} />
    </div>
  );
}
