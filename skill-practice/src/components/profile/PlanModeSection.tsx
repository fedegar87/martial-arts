"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { switchToCustomMode } from "@/lib/actions/plan";
import type { PlanMode } from "@/lib/types";
import { wrappingButtonClassName } from "@/lib/ui-classes";
import Link from "next/link";
import { useState, useTransition } from "react";

type Props = {
  planMode: PlanMode;
};

export function PlanModeSection({ planMode }: Props) {
  const tr = useTranslations("ui");
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleCustomClick() {
    if (planMode === "custom") return;
    setConfirmOpen(true);
  }

  function confirmCustomMode() {
    startTransition(async () => {
      await switchToCustomMode();
      setConfirmOpen(false);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          asChild
          variant={planMode === "exam" ? "secondary" : "outline"}
          className={wrappingButtonClassName}
        >
          <Link href="/plan/exam">{tr("examProgram")}</Link>
        </Button>
        <Button
          type="button"
          variant={planMode === "custom" ? "secondary" : "outline"}
          disabled={pending}
          onClick={handleCustomClick}
          className={wrappingButtonClassName}
        >
          {tr("customSelection")}
        </Button>
      </div>
      <Button
        asChild
        variant="ghost"
        className={`${wrappingButtonClassName} w-full justify-start text-left`}
      >
        <Link href="/programma">{tr("viewProgram")}</Link>
      </Button>
      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent
          side="bottom"
          className="material-sheet pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader>
            <SheetTitle>{tr("switchCustomConfirm")}</SheetTitle>
            <SheetDescription>{tr("switchCustomDescription")}</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button onClick={confirmCustomMode} disabled={pending}>
              {pending ? tr("updating") : tr("confirm")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              {tr("cancel")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
