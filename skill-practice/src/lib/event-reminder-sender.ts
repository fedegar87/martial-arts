import { addDaysToDateKey, localDateKey } from "@/lib/date";
import {
  buildEventReminderPayload,
  isEventReminderDue,
} from "@/lib/federation-event-logic";
import {
  defaultTrainingReminderSettings,
  isAllowedPushEndpoint,
} from "@/lib/push-notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  claimPendingDelivery,
  getVapidDetails,
  markDeliveryFailed,
  markDeliverySent,
  revokeSubscription,
  toWebPushSubscription,
} from "@/lib/training-reminder-sender";
import type {
  FederationEvent,
  NotificationPreference,
  PushSubscriptionRecord,
} from "@/lib/types";
import { createHash } from "node:crypto";
import "server-only";
import webpush from "web-push";

type ReminderRow = {
  user_id: string;
  event_id: string;
  event: FederationEvent;
};

export async function sendDueEventReminders(now = new Date()) {
  const supabase = createAdminClient();
  const todayUtc = localDateKey(now, "UTC");
  const { data, error } = await supabase
    .from("federation_event_reminders")
    .select("user_id,event_id,event:federation_events!inner(*)")
    .eq("event.cancelled", false)
    .gte("event.starts_on", todayUtc)
    .lte("event.starts_on", addDaysToDateKey(todayUtc, 2));
  if (error)
    throw new Error("Impossibile caricare i promemoria eventi.", {
      cause: error,
    });
  const reminders = (data ?? []) as unknown as ReminderRow[];
  const result = { checked: reminders.length, sent: 0, skipped: 0, failed: 0 };
  if (!reminders.length) return result;
  const vapid = getVapidDetails();
  const users = [...new Set(reminders.map((row) => row.user_id))];
  const revoked = new Set<string>();
  for (let offset = 0; offset < users.length; offset += 100) {
    const userIds = users.slice(offset, offset + 100);
    const [preferenceResult, subscriptionResult] = await Promise.all([
      supabase
        .from("notification_preferences")
        .select("*")
        .in("user_id", userIds),
      supabase
        .from("push_subscriptions")
        .select("*")
        .in("user_id", userIds)
        .is("revoked_at", null),
    ]);
    if (preferenceResult.error || subscriptionResult.error)
      throw new Error("Impossibile caricare le preferenze push.");
    const preferences = new Map(
      ((preferenceResult.data ?? []) as NotificationPreference[]).map((row) => [
        row.user_id,
        row,
      ]),
    );
    const subscriptions = (subscriptionResult.data ??
      []) as PushSubscriptionRecord[];
    for (const row of reminders.filter((item) =>
      userIds.includes(item.user_id),
    )) {
      const saved = preferences.get(row.user_id);
      const defaults = defaultTrainingReminderSettings();
      const preference = {
        reminderTime: saved?.reminder_time ?? defaults.reminderTime,
        timeZone: saved?.time_zone ?? defaults.timeZone,
      };
      if (!isEventReminderDue(row.event, preference, now)) {
        result.skipped++;
        continue;
      }
      for (const subscription of subscriptions.filter(
        (item) => item.user_id === row.user_id,
      )) {
        if (revoked.has(subscription.id)) {
          result.skipped++;
          continue;
        }
        if (!isAllowedPushEndpoint(subscription.endpoint)) {
          await revokeSubscription(supabase, subscription.id);
          revoked.add(subscription.id);
          result.failed++;
          continue;
        }
        const delivery = await claimPendingDelivery(supabase, {
          userId: row.user_id,
          subscriptionId: subscription.id,
          date: localDateKey(now, preference.timeZone),
          eventId: row.event_id,
        });
        if (!delivery) {
          result.skipped++;
          continue;
        }
        try {
          await webpush.sendNotification(
            toWebPushSubscription(subscription),
            JSON.stringify(buildEventReminderPayload(row.event, saved?.locale)),
            {
              vapidDetails: vapid,
              TTL: Math.max(
                1,
                Math.min(
                  86400,
                  Math.floor(
                    (Date.parse(row.event.starts_at) - now.getTime()) / 1000,
                  ),
                ),
              ),
              urgency: "normal",
              topic: `event-${createHash("sha256").update(row.event_id).digest("base64url").slice(0, 24)}`,
            },
          );
          await markDeliverySent(supabase, delivery);
          result.sent++;
        } catch (error) {
          await markDeliveryFailed(supabase, delivery, error);
          if (
            error instanceof webpush.WebPushError &&
            [404, 410].includes(error.statusCode)
          ) {
            await revokeSubscription(supabase, subscription.id);
            revoked.add(subscription.id);
          }
          result.failed++;
        }
      }
    }
  }
  return result;
}
