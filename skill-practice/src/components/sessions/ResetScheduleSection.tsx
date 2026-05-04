"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

export function ResetScheduleSection() {
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
        <h2 className="label-font text-xs uppercase text-muted-foreground">
          Zona ripristino
        </h2>
        <p className="text-sm text-muted-foreground">
          Cancella la programmazione attuale per ricominciare da zero. Il piano
          di skill e lo storico delle pratiche restano invariati.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="h-10 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Cancella schedule
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancellare la programmazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Cancellerai giorni, ripetizioni, cadenza e durata. Il piano di
              skill e lo storico delle pratiche restano invariati. Dovrai
              ricreare la programmazione da zero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? "Cancellazione..." : "Cancella"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
