import "server-only";
import { createClient } from "@/lib/supabase/server";
import { defaultTrainingReminderSettings, normalizeReminderTime } from "@/lib/push-notifications";
import { canSelectEventReminder } from "@/lib/federation-event-logic";
import type { CalendarFederationEvent, FederationEvent } from "@/lib/types";

export async function getFederationCalendarData(userId: string, from: string, to: string) {
  const supabase = await createClient();
  const defaults = defaultTrainingReminderSettings();
  const [eventResult, reminderResult, preferenceResult] = await Promise.all([
    supabase.from("federation_events").select("*").lte("starts_on", to).gte("ends_on", from).order("starts_at"),
    supabase.from("federation_event_reminders").select("event_id").eq("user_id", userId),
    supabase.from("notification_preferences").select("reminder_time,time_zone").eq("user_id", userId).maybeSingle(),
  ]);
  const preference = {
    reminderTime: normalizeReminderTime(preferenceResult.data?.reminder_time ?? "") ?? defaults.reminderTime,
    timeZone: preferenceResult.data?.time_zone ?? defaults.timeZone,
  };
  if (eventResult.error || reminderResult.error || preferenceResult.error) {
    return { events: [] as CalendarFederationEvent[], unavailable: true, ...preference };
  }
  const selected = new Set((reminderResult.data ?? []).map((row) => row.event_id as string));
  const events: CalendarFederationEvent[] = ((eventResult.data ?? []) as FederationEvent[])
    .filter((event) => !event.cancelled || selected.has(event.id))
    .map((event) => ({
      ...event, reminderSelected: selected.has(event.id), canRemind: canSelectEventReminder(event, preference),
    }));
  return { events, unavailable: false, ...preference };
}
