"use server";
import { getLocale, getTranslations } from "next-intl/server";

import {
  isAllowedPushEndpoint,
  normalizeReminderTime,
  normalizeTimeZone,
  validateBrowserPushSubscription,
  type BrowserPushSubscription,
} from "@/lib/push-notifications";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PushNotificationActionState =
  { error: string } | { success: true } | null;

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
  const tr = await getTranslations("ui");
  const parsedSubscription = validateBrowserPushSubscription(subscription);
  if (!parsedSubscription) return { error: tr("invalidPushSubscription") };

  const normalizedReminderTime = normalizeReminderTime(reminderTime);
  if (!normalizedReminderTime) return { error: tr("invalidReminderTime") };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };

  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const now = new Date().toISOString();

  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      training_reminders_enabled: true,
      locale: await getLocale(),
      reminder_time: normalizedReminderTime,
      time_zone: normalizedTimeZone,
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
  const tr = await getTranslations("ui");
  const normalizedReminderTime = normalizeReminderTime(reminderTime);
  if (!normalizedReminderTime) return { error: tr("invalidReminderTime") };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    reminder_time: normalizedReminderTime,
    time_zone: normalizeTimeZone(timeZone),
    locale: await getLocale(),
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  return { success: true };
}

export async function disableTrainingReminders(): Promise<PushNotificationActionState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };

  const now = new Date().toISOString();
  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      training_reminders_enabled: false,
      updated_at: now,
    });

  if (preferenceError) return { error: preferenceError.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  return { success: true };
}

export async function revokePushSubscriptionOnSignOut(
  endpoint: string,
): Promise<void> {
  const trimmed = endpoint.trim();
  if (!isAllowedPushEndpoint(trimmed)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();
  await supabase
    .from("push_subscriptions")
    .update({ revoked_at: now, last_seen_at: now })
    .eq("user_id", user.id)
    .eq("endpoint", trimmed)
    .is("revoked_at", null);
}
