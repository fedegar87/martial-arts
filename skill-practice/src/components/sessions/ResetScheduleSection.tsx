"use client";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { resetTrainingSchedule } from "@/lib/actions/training-schedule";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ResetScheduleSection() {
  const tr = useTranslations("ui");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await resetTrainingSchedule();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.replace("/today");
    });
  }

  return (
    <section className="border-t border-border pt-6 mt-6 space-y-3">
      <div className="space-y-1">
        <h2 className="section-label">{tr("resetSection")}</h2>
        <p className="text-sm text-muted-foreground">
          {tr("resetScheduleDescription")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="h-10 gap-2">
            <Trash2 className="h-4 w-4" />
            {tr("clearSchedule")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr("clearScheduleConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr("clearScheduleWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              {tr("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={pending}
              className="border border-destructive bg-transparent text-destructive shadow-none hover:bg-destructive/10"
            >
              {pending ? tr("deleting") : tr("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
