import { brand } from "./brand.ts";
import { notificationTranslator } from "./notification-messages.ts";
import { addDaysToDateKey, localDateKey } from "./date.ts";
import {
  isReminderTimeDue,
  normalizeReminderTime,
  normalizeTimeZone,
} from "./push-notifications.ts";
import type { FederationEvent } from "./types.ts";

type ReminderEvent = Pick<
  FederationEvent,
  "starts_at" | "starts_on" | "cancelled"
>;
type ReminderPreference = { reminderTime: string; timeZone: string };

export function canSelectEventReminder(
  event: ReminderEvent,
  preference: ReminderPreference,
  now = new Date(),
): boolean {
  const start = Date.parse(event.starts_at);
  if (event.cancelled || !Number.isFinite(start) || start <= now.getTime())
    return false;
  const time = normalizeReminderTime(preference.reminderTime);
  if (!time) return false;
  const timeZone = normalizeTimeZone(preference.timeZone);
  const dueDate = addDaysToDateKey(event.starts_on, -1);
  const today = localDateKey(now, timeZone);
  if (dueDate !== today) return dueDate > today;
  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return currentTime <= time;
}

export function isEventReminderDue(
  event: ReminderEvent,
  preference: ReminderPreference,
  now = new Date(),
): boolean {
  return (
    !event.cancelled &&
    Date.parse(event.starts_at) > now.getTime() &&
    addDaysToDateKey(event.starts_on, -1) ===
      localDateKey(now, normalizeTimeZone(preference.timeZone)) &&
    isReminderTimeDue({ ...preference, now })
  );
}

export function formatFederationEventTime(
  event: Pick<FederationEvent, "all_day" | "starts_at" | "ends_at">,
  locale = "it",
): string {
  const french = locale.startsWith("fr");
  if (event.all_day) return notificationTranslator(locale)("allDay");
  const format = (value: string) =>
    new Intl.DateTimeFormat(french ? "fr-BE" : "it-IT", {
      timeZone: brand.calendar.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(value));
  const start = format(event.starts_at);
  return event.ends_at === event.starts_at
    ? start
    : `${start}–${format(event.ends_at)}`;
}

export function buildEventReminderPayload(
  event: FederationEvent,
  locale = "it",
) {
  return {
    title: notificationTranslator(locale)("eventTomorrow", {
      brand: brand.shortName,
    }),
    body: [
      event.title,
      formatFederationEventTime(event, locale),
      event.location,
    ]
      .filter(Boolean)
      .join(" · "),
    url: `/calendar?date=${event.starts_on}`,
    tag: `federation-event-${event.id}`,
    icon: brand.notificationIcon,
    badge: brand.notificationIcon,
  };
}
