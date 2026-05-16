"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Save } from "lucide-react";
import {
  disableTrainingReminders,
  enableTrainingReminders,
  updateTrainingReminderSettings,
} from "@/lib/actions/push-notifications";
import {
  getPushSupportState,
  subscribeToTrainingReminders,
  unsubscribeFromTrainingReminders,
} from "@/lib/push-client";
import type { TrainingReminderSettings as TrainingReminderSettingsModel } from "@/lib/push-notifications";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  settings: TrainingReminderSettingsModel;
  hasSchedule: boolean;
  publicVapidKey: string;
};

export function TrainingReminderSettings({
  settings,
  hasSchedule,
  publicVapidKey,
}: Props) {
  const [enabled, setEnabled] = useState(
    settings.enabled && settings.activeSubscriptionCount > 0,
  );
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const localTimeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : settings.timeZone;

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
          reminderTime,
          timeZone: localTimeZone,
          userAgent: navigator.userAgent,
        });

        if (result && "error" in result) {
          setMessage(result.error);
          return;
        }

        setEnabled(true);
        setMessage("Promemoria attivati.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Attivazione non riuscita.");
      }
    });
  };

  const handleDisable = () => {
    setMessage(null);
    startTransition(async () => {
      const endpoint = await unsubscribeFromTrainingReminders();
      const result = await disableTrainingReminders(endpoint);

      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }

      setEnabled(false);
      setMessage("Promemoria disattivati.");
    });
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateTrainingReminderSettings({
        reminderTime,
        timeZone: localTimeZone,
      });

      if (result && "error" in result) {
        setMessage(result.error);
        return;
      }

      setMessage("Orario aggiornato.");
    });
  };

  return (
    <div className="border-border space-y-3 border-t pt-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Promemoria</p>
          <p className="text-muted-foreground text-xs">
            {enabled
              ? "Attivi nei giorni con esercizi ancora da fare."
              : "Disattivati per questo dispositivo."}
          </p>
        </div>
        {enabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleDisable}
          >
            <BellOff className="h-3.5 w-3.5" aria-hidden />
            Disattiva
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || !hasSchedule}
            onClick={handleEnable}
          >
            <Bell className="h-3.5 w-3.5" aria-hidden />
            Attiva
          </Button>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="training-reminder-time">Orario</Label>
        <div className="flex gap-2">
          <Input
            id="training-reminder-time"
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            disabled={!hasSchedule || isPending}
            className="max-w-32"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!hasSchedule || isPending || !enabled}
            onClick={handleSave}
            aria-label="Salva orario promemoria"
          >
            <Save className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Fuso orario rilevato: {localTimeZone || settings.timeZone}.
        </p>
      </div>

      {!hasSchedule && (
        <p className="text-muted-foreground text-xs">
          Disponibile dopo aver impostato una cadenza di allenamento.
        </p>
      )}

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
