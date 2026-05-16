import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  defaultTrainingReminderSettings,
  normalizeReminderTime,
  type TrainingReminderSettings,
} from "@/lib/push-notifications";
import type { NotificationPreference } from "@/lib/types";

export async function getTrainingReminderSettings(
  userId: string,
): Promise<TrainingReminderSettings> {
  const supabase = await createClient();

  const [{ data: preferenceData }, { count }] = await Promise.all([
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("revoked_at", null),
  ]);

  const defaults = defaultTrainingReminderSettings();
  const preference = preferenceData as NotificationPreference | null;

  if (!preference) {
    return {
      ...defaults,
      activeSubscriptionCount: count ?? 0,
    };
  }

  return {
    enabled: preference.training_reminders_enabled,
    reminderTime: normalizeReminderTime(preference.reminder_time) ?? defaults.reminderTime,
    timeZone: preference.time_zone,
    includeExerciseNames: preference.include_exercise_names,
    activeSubscriptionCount: count ?? 0,
  };
}
