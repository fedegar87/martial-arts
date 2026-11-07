"use client";
import { useTranslations } from "next-intl";

import { Disclosure } from "@/components/primitives/Disclosure";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Bell, BellOff, Save } from "lucide-react";
import { useState, useTransition } from "react";

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
  const tr = useTranslations("ui");
  const [enabled, setEnabled] = useState(
    settings.enabled && settings.activeSubscriptionCount > 0,
  );
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [savedReminderTime, setSavedReminderTime] = useState(
    settings.reminderTime,
  );
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
      setMessage(pushSupportErrorMessage(support, tr));
      return;
    }

    startTransition(async () => {
      try {
        const subscription = await subscribeToPushNotifications(
          publicVapidKey,
          tr,
        );
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
        setMessage(tr("trainingRemindersEnabled"));
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : tr("activationFailed"),
        );
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
        setMessage(tr("trainingRemindersDisabled"));
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : tr("deactivationFailed"),
        );
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
        setMessage(tr("timeUpdated"));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : tr("saveFailed"));
      }
    });
  };

  return (
    <Disclosure
      title={tr("reminders")}
      summary={`${enabled ? tr("trainingEnabled") : tr("trainingDisabled")} · ${savedReminderTime}`}
      revealKey={message}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs">
              {enabled
                ? tr("trainingEnabledDescription")
                : tr("trainingDisabledDescription")}
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
              {tr("disable")}
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
              {tr("enable")}
            </Button>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="training-reminder-time">{tr("time")}</Label>
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
              aria-label={tr("saveReminderTime")}
            >
              <Save className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {tr("sharedReminderTime")} {tr("timeZone")} {savedTimeZone}.
          </p>
        </div>

        {!hasSchedule && (
          <p className="text-muted-foreground text-xs">
            {tr("scheduleForReminders")}
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
