import { brand } from "@/lib/brand";
import { localDateKey } from "@/lib/date";
import {
  buildTrainingReminderPayload,
  isAllowedPushEndpoint,
  isReminderTimeDue,
  normalizeTimeZone,
} from "@/lib/push-notifications";
import {
  getScheduledPlanItems,
  getScheduledSession,
} from "@/lib/session-scheduler";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  NotificationPreference,
  PlanMode,
  PracticeLog,
  PushSubscriptionRecord,
  Skill,
  TrainingSchedule,
  UserPlanItem,
} from "@/lib/types";
import "server-only";
import webpush, {
  WebPushError,
  type PushSubscription as WebPushSubscription,
} from "web-push";

type ItemWithSkill = UserPlanItem & { skill: Skill };
type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

type ReminderRunResult = {
  checkedPreferences: number;
  duePreferences: number;
  sent: number;
  skipped: number;
  failed: number;
};

export async function sendDueTrainingReminders(
  now = new Date(),
): Promise<ReminderRunResult> {
  const vapid = getVapidDetails();
  const supabase = createAdminClient();

  const { data: preferencesData, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("training_reminders_enabled", true);

  if (error) throw new Error(error.message);

  const preferences = (preferencesData ?? []) as NotificationPreference[];
  const result: ReminderRunResult = {
    checkedPreferences: preferences.length,
    duePreferences: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const preference of preferences) {
    if (
      !isReminderTimeDue({
        reminderTime: preference.reminder_time,
        timeZone: preference.time_zone,
        now,
      })
    ) {
      continue;
    }
    result.duePreferences++;

    try {
      const userResult = await sendReminderForUser(
        supabase,
        preference,
        vapid,
        now,
      );
      result.sent += userResult.sent;
      result.skipped += userResult.skipped;
      result.failed += userResult.failed;
    } catch {
      console.error("Training reminder: owner processing failed");
      result.failed++;
    }
  }

  return result;
}

async function sendReminderForUser(
  supabase: AdminSupabaseClient,
  preference: NotificationPreference,
  vapid: VapidDetails,
  now: Date,
): Promise<Pick<ReminderRunResult, "sent" | "skipped" | "failed">> {
  const date = localDateKey(now, normalizeTimeZone(preference.time_zone));
  const userId = preference.user_id;
  const sourceFilter = await getPlanSourceForUser(supabase, userId);

  if (!sourceFilter) return { sent: 0, skipped: 1, failed: 0 };

  const [
    { data: scheduleData },
    { data: itemsData },
    { data: logsData },
    { data: subscriptionsData },
  ] = await Promise.all([
    supabase
      .from("training_schedule")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_plan_items")
      .select("*, skill:skills(*)")
      .eq("user_id", userId)
      .eq("source", sourceFilter)
      .eq("is_hidden", false),
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date),
    supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null),
  ]);

  const schedule = scheduleData as TrainingSchedule | null;
  const items = ((itemsData ?? []) as ItemWithSkill[]).filter(
    (item) => item.skill,
  );
  const logs = (logsData ?? []) as PracticeLog[];
  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRecord[];

  if (!schedule || items.length === 0 || subscriptions.length === 0) {
    return { sent: 0, skipped: 1, failed: 0 };
  }

  const scheduledItems = getScheduledPlanItems(
    items,
    schedule,
    sourceFilter === "manual" ? "custom" : "exam",
  );
  const session = getScheduledSession(date, schedule, scheduledItems);
  if (session.kind !== "training") return { sent: 0, skipped: 1, failed: 0 };

  const completedSkillIds = new Set(
    logs.filter((log) => log.completed).map((log) => log.skill_id),
  );
  const remainingItems = [...session.focus, ...session.maintenance].filter(
    (item) => !completedSkillIds.has(item.skill_id),
  );

  if (remainingItems.length === 0) return { sent: 0, skipped: 1, failed: 0 };

  const payload = buildTrainingReminderPayload({
    locale: preference.locale,
    date,
    exerciseNames: remainingItems.map((item) => item.skill.name),
    includeExerciseNames: preference.include_exercise_names,
  });

  const counters = { sent: 0, skipped: 0, failed: 0 };

  for (const subscription of subscriptions) {
    if (!isAllowedPushEndpoint(subscription.endpoint)) {
      await revokeSubscription(supabase, subscription.id);
      counters.failed++;
      continue;
    }

    const deliveryId = await claimPendingDelivery(supabase, {
      userId,
      subscriptionId: subscription.id,
      date,
    });

    if (!deliveryId) {
      counters.skipped++;
      continue;
    }

    try {
      await webpush.sendNotification(
        toWebPushSubscription(subscription),
        JSON.stringify(payload),
        {
          vapidDetails: vapid,
          TTL: 6 * 60 * 60,
          urgency: "normal",
          topic: "training-reminder",
        },
      );
      await markDeliverySent(supabase, deliveryId);
      counters.sent++;
    } catch (error) {
      await markDeliveryFailed(supabase, deliveryId, error);
      if (isExpiredSubscriptionError(error)) {
        await revokeSubscription(supabase, subscription.id);
      }
      counters.failed++;
    }
  }

  return counters;
}

async function getPlanSourceForUser(
  supabase: AdminSupabaseClient,
  userId: string,
): Promise<"exam_program" | "manual" | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("plan_mode")
    .eq("id", userId)
    .maybeSingle();

  const profile = data as { plan_mode: PlanMode } | null;
  if (!profile) return null;
  return profile.plan_mode === "custom" ? "manual" : "exam_program";
}

export async function claimPendingDelivery(
  supabase: AdminSupabaseClient,
  {
    userId,
    subscriptionId,
    date,
    eventId,
  }: {
    userId: string;
    subscriptionId: string;
    date: string;
    eventId?: string;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("notification_deliveries")
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      kind: eventId ? "event_reminder" : "training_reminder",
      event_id: eventId ?? null,
      date,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (!error) {
    return (data as { id: string } | null)?.id ?? null;
  }

  if (error.code !== "23505") {
    throw new Error(error.message);
  }

  // Se un tentativo precedente nello stesso giorno e' fallito per un errore di rete
  // transitorio (subscription non revocata), consente il retry al giro cron successivo.
  let retryQuery = supabase
    .from("notification_deliveries")
    .update({
      status: "pending",
      error: null,
      date,
    })
    .eq("subscription_id", subscriptionId)
    .eq("kind", eventId ? "event_reminder" : "training_reminder")
    .eq("status", "failed");
  retryQuery = eventId
    ? retryQuery.eq("event_id", eventId)
    : retryQuery.eq("date", date);
  const { data: retryData, error: retryError } = await retryQuery
    .select("id")
    .maybeSingle();

  if (retryError) throw new Error(retryError.message);
  return (retryData as { id: string } | null)?.id ?? null;
}

export async function markDeliverySent(
  supabase: AdminSupabaseClient,
  deliveryId: string,
) {
  await supabase
    .from("notification_deliveries")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", deliveryId);
}

export async function markDeliveryFailed(
  supabase: AdminSupabaseClient,
  deliveryId: string,
  error: unknown,
) {
  await supabase
    .from("notification_deliveries")
    .update({
      status: "failed",
      error: describePushError(error),
    })
    .eq("id", deliveryId);
}

export async function revokeSubscription(
  supabase: AdminSupabaseClient,
  subscriptionId: string,
) {
  await supabase
    .from("push_subscriptions")
    .update({
      revoked_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
}

export function toWebPushSubscription(
  subscription: PushSubscriptionRecord,
): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
}

type VapidDetails = {
  subject: string;
  publicKey: string;
  privateKey: string;
};

export function getVapidDetails(): VapidDetails {
  const subject =
    process.env.VAPID_SUBJECT?.trim() || `mailto:${brand.supportEmail}`;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!subject || !publicKey || !privateKey) {
    throw new Error("Missing VAPID configuration");
  }

  return { subject, publicKey, privateKey };
}

function describePushError(error: unknown): string {
  if (error instanceof WebPushError) {
    return `${error.statusCode}: ${error.body || error.message}`;
  }
  if (error instanceof Error) return error.message;
  return "Errore push sconosciuto";
}

function isExpiredSubscriptionError(error: unknown): boolean {
  return (
    error instanceof WebPushError &&
    (error.statusCode === 404 || error.statusCode === 410)
  );
}
