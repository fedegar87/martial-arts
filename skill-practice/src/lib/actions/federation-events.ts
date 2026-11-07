"use server";
import { getLocale, getTranslations } from "next-intl/server";

import { canSelectEventReminder } from "@/lib/federation-event-logic";
import {
  defaultTrainingReminderSettings,
  normalizeTimeZone,
  validateBrowserPushSubscription,
  type BrowserPushSubscription,
} from "@/lib/push-notifications";
import { createClient } from "@/lib/supabase/server";
import type { FederationEvent } from "@/lib/types";
import { revalidatePath } from "next/cache";

type EventReminderState = { success: true } | { error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function enableFederationEventReminder({
  eventId,
  subscription,
  timeZone,
  userAgent,
}: {
  eventId: string;
  subscription: BrowserPushSubscription;
  timeZone: string;
  userAgent?: string;
}): Promise<EventReminderState> {
  const tr = await getTranslations("ui");
  const parsed = validateBrowserPushSubscription(subscription);
  if (!UUID.test(eventId) || !parsed) return { error: tr("invalidReminder") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };
  const [eventResult, preferenceResult] = await Promise.all([
    supabase
      .from("federation_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle(),
    supabase
      .from("notification_preferences")
      .select("reminder_time,time_zone")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (eventResult.error || preferenceResult.error || !eventResult.data)
    return { error: tr("eventUnavailable") };
  const defaults = defaultTrainingReminderSettings();
  const preference = {
    reminderTime: preferenceResult.data?.reminder_time ?? defaults.reminderTime,
    timeZone: preferenceResult.data?.time_zone ?? normalizeTimeZone(timeZone),
  };
  if (
    !canSelectEventReminder(eventResult.data as FederationEvent, preference)
  ) {
    return { error: tr("eventReminderExpired") };
  }
  if (!preferenceResult.data) {
    const { error } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: user.id,
        time_zone: preference.timeZone,
        locale: await getLocale(),
      });
    if (error && error.code !== "23505")
      return { error: tr("preferencesSaveFailed") };
  } else {
    const { error } = await supabase
      .from("notification_preferences")
      .update({ locale: await getLocale() })
      .eq("user_id", user.id);
    if (error) return { error: tr("preferencesSaveFailed") };
  }
  const now = new Date().toISOString();
  const { error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: parsed.endpoint,
        p256dh: parsed.p256dh,
        auth: parsed.auth,
        user_agent: userAgent?.slice(0, 512) ?? null,
        revoked_at: null,
        last_seen_at: now,
      },
      { onConflict: "endpoint" },
    );
  if (subscriptionError) return { error: tr("pushActivationFailed") };
  const { error } = await supabase
    .from("federation_event_reminders")
    .insert({ user_id: user.id, event_id: eventId });
  if (error && error.code !== "23505")
    return { error: tr("reminderSaveFailed") };
  revalidatePath("/calendar");
  revalidatePath("/profile");
  return { success: true };
}

export async function disableFederationEventReminder(
  eventId: string,
): Promise<EventReminderState> {
  const tr = await getTranslations("ui");
  if (!UUID.test(eventId)) return { error: tr("invalidEvent") };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpiredPeriod") };
  const { error } = await supabase
    .from("federation_event_reminders")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);
  if (error) return { error: tr("reminderRemovalFailed") };
  revalidatePath("/calendar");
  return { success: true };
}
