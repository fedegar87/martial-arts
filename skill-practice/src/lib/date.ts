export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "Europe/Rome";

const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateKey(
  date = new Date(),
  timeZone = APP_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${value.year}-${value.month}-${value.day}`;
}

export function dateKeyDaysAgo(
  days: number,
  date = new Date(),
  timeZone = APP_TIME_ZONE,
): string {
  return addDaysToDateKey(localDateKey(date, timeZone), -days);
}

export function weekStartDateKey(
  date = new Date(),
  timeZone = APP_TIME_ZONE,
): string {
  const key = localDateKey(date, timeZone);
  const weekday = weekdayForDateKey(key);
  return addDaysToDateKey(key, -((weekday + 6) % 7));
}

export function localWeekday(
  date = new Date(),
  timeZone = APP_TIME_ZONE,
): number {
  return weekdayForDateKey(localDateKey(date, timeZone));
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function weekdayForDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
