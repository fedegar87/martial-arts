"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeReminderTime,
  normalizeTimeZone,
  validateBrowserPushSubscription,
  type BrowserPushSubscription,
} from "@/lib/push-notifications";

export type PushNotificationActionState =
  | { error: string }
  | { success: true }
  | null;

export async function enableTrainingReminders({
  subscription,
  reminderTime,
  timeZone,
  userAgent,
}: {
  subscription: BrowserPushSubscription;
  reminderTime: string;
  timeZone: string;
  userAgent?: string;
}): Promise<PushNotificationActionState> {
  const parsedSubscription = validateBrowserPushSubscription(subscription);
  if (!parsedSubscription) return { error: "Subscription push non valida." };

  const normalizedReminderTime = normalizeReminderTime(reminderTime);
  if (!normalizedReminderTime) return { error: "Orario promemoria non valido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta." };

  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const now = new Date().toISOString();

  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      training_reminders_enabled: true,
      reminder_time: normalizedReminderTime,
      time_zone: normalizedTimeZone,
      include_exercise_names: true,
    });

  if (preferenceError) return { error: preferenceError.message };

  const { error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: parsedSubscription.endpoint,
        p256dh: parsedSubscription.p256dh,
        auth: parsedSubscription.auth,
        user_agent: userAgent?.slice(0, 512) ?? null,
        last_seen_at: now,
        revoked_at: null,
      },
      { onConflict: "endpoint" },
    );

  if (subscriptionError) return { error: subscriptionError.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  return { success: true };
}

export async function updateTrainingReminderSettings({
  reminderTime,
  timeZone,
}: {
  reminderTime: string;
  timeZone: string;
}): Promise<PushNotificationActionState> {
  const normalizedReminderTime = normalizeReminderTime(reminderTime);
  if (!normalizedReminderTime) return { error: "Orario promemoria non valido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta." };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      training_reminders_enabled: true,
      reminder_time: normalizedReminderTime,
      time_zone: normalizeTimeZone(timeZone),
      include_exercise_names: true,
    });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

export async function disableTrainingReminders(
  endpoint?: string,
): Promise<PushNotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta." };

  const now = new Date().toISOString();
  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      training_reminders_enabled: false,
      updated_at: now,
    });

  if (preferenceError) return { error: preferenceError.message };

  let query = supabase
    .from("push_subscriptions")
    .update({ revoked_at: now, last_seen_at: now })
    .eq("user_id", user.id)
    .is("revoked_at", null);

  if (endpoint) query = query.eq("endpoint", endpoint);

  const { error: subscriptionError } = await query;
  if (subscriptionError) return { error: subscriptionError.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  return { success: true };
}
