import "server-only";
import webpush, {
  WebPushError,
  type PushSubscription as WebPushSubscription,
} from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { localDateKey } from "@/lib/date";
import {
  buildTrainingReminderPayload,
  normalizeReminderTime,
} from "@/lib/push-notifications";
import { getScheduledPlanItems, getScheduledSession } from "@/lib/session-scheduler";
import type {
  NotificationPreference,
  PlanMode,
  PracticeLog,
  PushSubscriptionRecord,
  Skill,
  TrainingSchedule,
  UserPlanItem,
} from "@/lib/types";

type ItemWithSkill = UserPlanItem & { skill: Skill };

type ReminderRunResult = {
  checkedPreferences: number;
  duePreferences: number;
  sent: number;
  skipped: number;
  failed: number;
};

const REMINDER_WINDOW_MINUTES = 15;

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
    if (!isReminderDue(preference, now)) continue;
    result.duePreferences++;

    const userResult = await sendReminderForUser(preference, vapid, now);
    result.sent += userResult.sent;
    result.skipped += userResult.skipped;
    result.failed += userResult.failed;
  }

  return result;
}

async function sendReminderForUser(
  preference: NotificationPreference,
  vapid: VapidDetails,
  now: Date,
): Promise<Pick<ReminderRunResult, "sent" | "skipped" | "failed">> {
  const supabase = createAdminClient();
  const date = localDateKey(now, preference.time_zone);
  const userId = preference.user_id;
  const sourceFilter = await getPlanSourceForUser(supabase, userId);

  if (!sourceFilter) return { sent: 0, skipped: 1, failed: 0 };

  const [{ data: scheduleData }, { data: itemsData }, { data: logsData }, { data: subscriptionsData }] =
    await Promise.all([
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
  const items = ((itemsData ?? []) as ItemWithSkill[]).filter((item) => item.skill);
  const logs = (logsData ?? []) as PracticeLog[];
  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRecord[];

  if (!schedule || items.length === 0 || subscriptions.length === 0) {
    return { sent: 0, skipped: 1, failed: 0 };
  }

  const scheduledItems = getScheduledPlanItems(items, schedule, sourceFilter === "manual" ? "custom" : "exam");
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
    date,
    exerciseNames: remainingItems.map((item) => item.skill.name),
    includeExerciseNames: preference.include_exercise_names,
  });

  const counters = { sent: 0, skipped: 0, failed: 0 };

  for (const subscription of subscriptions) {
    const deliveryId = await createPendingDelivery({
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
      await markDeliverySent(deliveryId);
      counters.sent++;
    } catch (error) {
      await markDeliveryFailed(deliveryId, error);
      if (isExpiredSubscriptionError(error)) {
        await revokeSubscription(subscription.id);
      }
      counters.failed++;
    }
  }

  return counters;
}

async function getPlanSourceForUser(
  supabase: ReturnType<typeof createAdminClient>,
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

async function createPendingDelivery({
  userId,
  subscriptionId,
  date,
}: {
  userId: string;
  subscriptionId: string;
  date: string;
}): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      kind: "training_reminder",
      date,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return null;
    throw new Error(error.message);
  }

  return (data as { id: string } | null)?.id ?? null;
}

async function markDeliverySent(deliveryId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("notification_deliveries")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", deliveryId);
}

async function markDeliveryFailed(deliveryId: string, error: unknown) {
  const supabase = createAdminClient();
  await supabase
    .from("notification_deliveries")
    .update({
      status: "failed",
      error: describePushError(error),
    })
    .eq("id", deliveryId);
}

async function revokeSubscription(subscriptionId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("push_subscriptions")
    .update({
      revoked_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
}

function isReminderDue(preference: NotificationPreference, now: Date): boolean {
  const reminderTime = normalizeReminderTime(preference.reminder_time);
  if (!reminderTime) return false;

  const currentMinutes = localMinutes(now, preference.time_zone);
  const reminderMinutes = timeToMinutes(reminderTime);
  return (
    currentMinutes >= reminderMinutes &&
    currentMinutes < reminderMinutes + REMINDER_WINDOW_MINUTES
  );
}

function localMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return Number(values.hour) * 60 + Number(values.minute);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toWebPushSubscription(
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

function getVapidDetails(): VapidDetails {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

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
  return error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410);
}
