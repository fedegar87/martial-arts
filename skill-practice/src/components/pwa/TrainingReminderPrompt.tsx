"use client";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { enableTrainingReminders } from "@/lib/actions/push-notifications";
import {
  getPushSupportState,
  pushSupportErrorMessage,
  subscribeToPushNotifications,
} from "@/lib/push-client";
import type { TrainingReminderSettings } from "@/lib/push-notifications";
import { Bell } from "lucide-react";
import { useState, useTransition } from "react";

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
  const tr = useTranslations("ui");
  const [enabled, setEnabled] = useState(
    settings.enabled && settings.activeSubscriptionCount > 0,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (enabled) return null;

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
        setMessage(
          error instanceof Error ? error.message : tr("activationFailed"),
        );
      }
    });
  };

  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{tr("trainingReminder")}</p>
          <p className="text-muted-foreground text-xs">
            {tr("receiveReminderAt")} {settings.reminderTime}{" "}
            {tr("trainingReminderDescription")}
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
          {isPending ? tr("enabling") : tr("enable")}
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
