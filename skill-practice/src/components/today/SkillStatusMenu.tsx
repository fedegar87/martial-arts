"use client";

import { useState, useTransition } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { hidePlanItem, updatePlanItemStatus } from "@/lib/actions/plan";
import type { PlanStatus } from "@/lib/types";

type Props = {
  skillId: string;
  currentStatus: PlanStatus;
};

const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: "focus", label: "Focus" },
  { value: "review", label: "Ripasso" },
  { value: "maintenance", label: "Mantenimento" },
];

export function SkillStatusMenu({ skillId, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Modifica stato">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Stato nel piano</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 px-4 pb-4">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={option.value === currentStatus ? "default" : "outline"}
              disabled={pending}
              onClick={() =>
                run(() => updatePlanItemStatus(skillId, option.value))
              }
              className="justify-start"
            >
              {option.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => hidePlanItem(skillId))}
            className="justify-start text-muted-foreground"
          >
            Nascondi da Oggi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
