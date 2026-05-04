"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { hidePlanItem, updatePlanItemStatus } from "@/lib/actions/plan";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";

type Props = {
  skillId: string;
  currentStatus: PlanStatus;
  hideLabel?: string;
  showHide?: boolean;
};

const STATUS_OPTIONS: PlanStatus[] = ["focus", "maintenance"];

export function SkillStatusMenu({
  skillId,
  currentStatus,
  hideLabel = "Nascondi dal piano attivo",
  showHide = true,
}: Props) {
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
          <SheetTitle>Stato nel piano attivo</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 px-4 pb-4">
          {STATUS_OPTIONS.map((status) => (
            <StatusOptionButton
              key={status}
              status={status}
              selected={status === currentStatus}
              disabled={pending}
              onClick={() => run(() => updatePlanItemStatus(skillId, status))}
            />
          ))}
          {showHide && (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => hidePlanItem(skillId))}
              className="justify-start text-muted-foreground"
            >
              {hideLabel}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatusOptionButton({
  status,
  selected,
  disabled,
  onClick,
}: {
  status: PlanStatus;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const visual = PLAN_STATUS_VISUALS[status];
  const Icon = visual.Icon;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={`justify-start ${selected ? visual.badgeClassName : visual.textClassName}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {visual.label}
      {selected && <CheckCircle2 className="ml-auto h-4 w-4" />}
    </Button>
  );
}
