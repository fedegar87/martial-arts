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
  pushSupportErrorMessage,
  subscribeToPushNotifications,
} from "@/lib/push-client";
import type { TrainingReminderSettings as TrainingReminderSettingsModel } from "@/lib/push-notifications";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disclosure } from "@/components/primitives/Disclosure";

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
  const [savedReminderTime, setSavedReminderTime] = useState(settings.reminderTime);
  const [savedTimeZone, setSavedTimeZone] = useState(settings.timeZone);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const localTimeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : settings.timeZone;

  const handleEnable = () => {
    setMessage(null);
    const support = getPushSupportState(publicVapidKey);
    if (support !== "supported") {
      setMessage(pushSupportErrorMessage(support));
      return;
    }

    startTransition(async () => {
      try {
        const subscription = await subscribeToPushNotifications(publicVapidKey);
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
        setSavedReminderTime(reminderTime);
        setSavedTimeZone(localTimeZone);
        setMessage("Promemoria allenamenti attivati.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Attivazione non riuscita.");
      }
    });
  };

  const handleDisable = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await disableTrainingReminders();

        if (result && "error" in result) {
          setMessage(result.error);
          return;
        }

        setEnabled(false);
        setMessage("Promemoria allenamenti disattivati.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Disattivazione non riuscita.");
      }
    });
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateTrainingReminderSettings({
          reminderTime,
          timeZone: localTimeZone,
        });

        if (result && "error" in result) {
          setMessage(result.error);
          return;
        }

        setSavedReminderTime(reminderTime);
        setSavedTimeZone(localTimeZone);
        setMessage("Orario aggiornato.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
      }
    });
  };

  return (
    <Disclosure
      title="Promemoria"
      summary={`${enabled ? "Allenamento attivo" : "Allenamento disattivato"} · ${savedReminderTime}`}
      revealKey={message}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs">
              {enabled
              ? "Allenamenti: attivi nei giorni con esercizi ancora da fare."
              : "Allenamenti: disattivati."}
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
              disabled={isPending}
              className="max-w-32"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isPending}
              onClick={handleSave}
              aria-label="Salva orario promemoria"
            >
              <Save className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            L&apos;orario vale anche per gli eventi scelti nel Calendario.
            {" "}Fuso orario: {savedTimeZone}.
          </p>
        </div>

        {!hasSchedule && (
          <p className="text-muted-foreground text-xs">
            Per attivare gli avvisi degli allenamenti, imposta una cadenza.
          </p>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </Disclosure>
  );
}
