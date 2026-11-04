import { brand } from "./brand.ts";

export type BrowserPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export type TrainingReminderSettings = {
  enabled: boolean;
  reminderTime: string;
  timeZone: string;
  includeExerciseNames: boolean;
  activeSubscriptionCount: number;
};

export type TrainingReminderPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  icon: string;
  badge: string;
};

export const REMINDER_WINDOW_MINUTES = 90;

const MAX_EXERCISE_NAMES = 4;

const ALLOWED_PUSH_HOST_SUFFIXES = [
  ".googleapis.com",
  ".google.com",
  ".push.apple.com",
  ".push.services.mozilla.com",
  ".notify.windows.com",
];

export function defaultTrainingReminderSettings(): TrainingReminderSettings {
  return {
    enabled: false,
    reminderTime: "09:00",
    timeZone: "Europe/Rome",
    includeExerciseNames: true,
    activeSubscriptionCount: 0,
  };
}

export function normalizeReminderTime(value: string): string | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}

export function normalizeTimeZone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Europe/Rome";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format();
    return trimmed;
  } catch {
    return "Europe/Rome";
  }
}

export function isAllowedPushEndpoint(endpoint: string): boolean {
  if (!endpoint || endpoint.length > 2048) return false;

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;

  const hostname = parsed.hostname.toLowerCase();
  return ALLOWED_PUSH_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

export function validateBrowserPushSubscription(
  subscription: BrowserPushSubscription,
): { endpoint: string; p256dh: string; auth: string } | null {
  const endpoint = subscription.endpoint?.trim();
  const p256dh = subscription.keys?.p256dh?.trim();
  const auth = subscription.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) return null;
  if (p256dh.length > 256 || auth.length > 128) return null;
  if (!isAllowedPushEndpoint(endpoint)) return null;

  return { endpoint, p256dh, auth };
}

export function isReminderTimeDue({
  reminderTime,
  timeZone,
  now,
  windowMinutes = REMINDER_WINDOW_MINUTES,
}: {
  reminderTime: string;
  timeZone: string;
  now: Date;
  windowMinutes?: number;
}): boolean {
  const normalized = normalizeReminderTime(reminderTime);
  if (!normalized) return false;

  const currentMinutes = localMinutesOfDay(now, normalizeTimeZone(timeZone));
  const reminderMinutes = timeToMinutes(normalized);
  return (
    currentMinutes >= reminderMinutes &&
    currentMinutes < reminderMinutes + windowMinutes
  );
}

function localMinutesOfDay(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return (Number(values.hour) % 24) * 60 + Number(values.minute);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function buildTrainingReminderPayload({
  date,
  exerciseNames,
  includeExerciseNames,
}: {
  date: string;
  exerciseNames: string[];
  includeExerciseNames: boolean;
}): TrainingReminderPayload {
  const count = exerciseNames.length;
  const body = includeExerciseNames
    ? `Oggi devi allenare ${formatExerciseList(exerciseNames)}`
    : `Oggi devi allenare ${count} ${count === 1 ? "esercizio" : "esercizi"}`;

  return {
    title: brand.appName,
    body,
    url: "/today",
    tag: `training-reminder-${date}`,
    icon: brand.notificationIcon,
    badge: brand.notificationIcon,
  };
}

export function formatExerciseList(names: string[]): string {
  const visible = names.slice(0, MAX_EXERCISE_NAMES);
  const hidden = names.length - visible.length;
  const suffix = hidden > 0 ? ` e altri ${hidden}` : "";
  return `${visible.join(", ")}${suffix}`;
}
