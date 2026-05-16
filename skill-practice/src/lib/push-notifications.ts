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
};

const MAX_EXERCISE_NAMES = 4;

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

export function validateBrowserPushSubscription(
  subscription: BrowserPushSubscription,
): { endpoint: string; p256dh: string; auth: string } | null {
  const endpoint = subscription.endpoint?.trim();
  const p256dh = subscription.keys?.p256dh?.trim();
  const auth = subscription.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
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
    ? `Apri la sessione: ${formatExerciseList(exerciseNames)}`
    : `Apri la sessione di oggi: ${count} ${count === 1 ? "esercizio" : "esercizi"}`;

  return {
    title: "Allenamento di oggi",
    body,
    url: "/today",
    tag: `training-reminder-${date}`,
  };
}

export function formatExerciseList(names: string[]): string {
  const visible = names.slice(0, MAX_EXERCISE_NAMES);
  const hidden = names.length - visible.length;
  const suffix = hidden > 0 ? ` e altri ${hidden}` : "";
  return `${visible.join(", ")}${suffix}`;
}
