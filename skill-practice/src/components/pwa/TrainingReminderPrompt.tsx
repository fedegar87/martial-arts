"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { enableTrainingReminders } from "@/lib/actions/push-notifications";
import {
  getPushSupportState,
  subscribeToTrainingReminders,
} from "@/lib/push-client";
import type { TrainingReminderSettings } from "@/lib/push-notifications";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  settings: TrainingReminderSettings;
  publicVapidKey: string;
  exerciseCount: number;
};

export function TrainingReminderPrompt({
  settings,
  publicVapidKey,
  exerciseCount,
}: Props) {
  const [enabled, setEnabled] = useState(
    settings.enabled && settings.activeSubscriptionCount > 0,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (enabled) return null;

  const handleEnable = () => {
    setMessage(null);
    const support = getPushSupportState(publicVapidKey);
    if (support === "missing_key") {
      setMessage("Promemoria non configurati sul server.");
      return;
    }
    if (support === "unsupported") {
      setMessage("Questo browser non supporta le notifiche push per questa app.");
      return;
    }
    if (support === "permission_denied") {
      setMessage("Notifiche bloccate. Riattivale dalle impostazioni del browser.");
      return;
    }

    startTransition(async () => {
      try {
        const subscription = await subscribeToTrainingReminders(publicVapidKey);
        const result = await enableTrainingReminders({
          subscription,
          reminderTime: settings.reminderTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          userAgent: navigator.userAgent,
        });

        if (result && "error" in result) {
          setMessage(result.error);
          return;
        }

        setEnabled(true);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Attivazione non riuscita.");
      }
    });
  };

  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Promemoria allenamento</p>
          <p className="text-muted-foreground text-xs">
            Ricevi un avviso nei giorni con esercizi da completare.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || exerciseCount <= 0}
          onClick={handleEnable}
        >
          <Bell className="h-3.5 w-3.5" aria-hidden />
          {isPending ? "Attivo..." : "Attiva"}
        </Button>
      </div>
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
