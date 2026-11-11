"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { updateCustomProgramItemStatus } from "@/lib/actions/custom-programs";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import type { PlanStatus } from "@/lib/types";
import { CheckCircle2, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

type Props = { programId: string; skillId: string; skillName: string; status: PlanStatus };

export function CustomProgramItemStatus({ programId, skillId, skillName, status }: Props) {
  const tr = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" size="icon" variant="ghost" aria-label={tr("planStatusFor", { p0: skillName })}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="material-sheet pb-[env(safe-area-inset-bottom)]">
        <SheetHeader><SheetTitle>{tr("planStatusFor", { p0: skillName })}</SheetTitle></SheetHeader>
        <div className="grid gap-2 px-4 pb-6">
          {(["focus", "maintenance"] as const).map((nextStatus) => {
            const visual = PLAN_STATUS_VISUALS[nextStatus];
            const Icon = visual.Icon;
            return (
              <Button key={nextStatus} type="button" variant="outline" disabled={pending}
                className={`justify-start ${nextStatus === status ? visual.badgeClassName : visual.textClassName}`}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    try {
                      const result = await updateCustomProgramItemStatus(programId, skillId, nextStatus);
                      if (result && "error" in result) { setError(result.error); return; }
                      setOpen(false);
                    } catch { setError(tr("offlineRetry")); }
                  });
                }}>
                <Icon className="mr-2 h-4 w-4" />{tr(nextStatus)}
                {nextStatus === status && <CheckCircle2 className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
          {error && <p role="status" className="text-sm text-destructive">{error}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
