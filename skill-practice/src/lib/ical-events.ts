import ICAL from "ical.js";
import { addDaysToDateKey, localDateKey } from "./date.ts";
import type { FederationEvent } from "./types.ts";

export type ImportedFederationEvent = Omit<FederationEvent, "id" | "synced_at">;
const MAX_OCCURRENCES = 10000;

export function parseFederationCalendar(
  text: string,
  { from, to, timeZone }: { from: string; to: string; timeZone: string },
): ImportedFederationEvent[] {
  if (!text.trimStart().startsWith("BEGIN:VCALENDAR")) throw new Error("Calendario iCalendar non valido.");
  const calendar = new ICAL.Component(ICAL.parse(text));
  for (const zone of calendar.getAllSubcomponents("vtimezone")) {
    ICAL.TimezoneService.register(zone);
  }
  const components = calendar.getAllSubcomponents("vevent");
  if (!components.length || components.length > 5000) throw new Error("Calendario vuoto o troppo grande.");
  const groups = new Map<string, Map<string, ICAL.Component>>();
  for (const component of components) {
    for (const property of ["dtstart", "dtend", "recurrence-id", "rdate", "exdate"].flatMap((name) => component.getAllProperties(name))) {
      const zone = property.getParameter("tzid");
      if (typeof zone === "string" && !ICAL.TimezoneService.has(zone)) throw new Error("Definizione del fuso orario mancante.");
    }
    const uid = String(component.getFirstPropertyValue("uid") ?? "").trim();
    if (!uid || uid.length > 512) throw new Error("Identificativo evento non valido.");
    const key = String(component.getFirstPropertyValue("recurrence-id") ?? "");
    const group = groups.get(uid) ?? new Map<string, ICAL.Component>();
    const previous = group.get(key);
    if (!previous || isNewer(component, previous)) group.set(key, component);
    groups.set(uid, group);
  }

  const output = new Map<string, ImportedFederationEvent>();
  let iterations = 0;
  function append(uid: string, item: ICAL.Event, start: ICAL.Time, end: ICAL.Time, recurrenceKey: string, seriesCancelled = false) {
    const startsAt = instant(start, timeZone);
    const endsAt = instant(end, timeZone);
    const startsOn = start.isDate ? start.toString() : localDateKey(startsAt, timeZone);
    const endsOn = start.isDate
      ? addDaysToDateKey(end.toString(), -1)
      : localDateKey(new Date(Math.max(startsAt.getTime(), endsAt.getTime() - 1)), timeZone);
    if (startsOn > to || endsOn < from) return;
    if (endsAt < startsAt || endsOn < startsOn) throw new Error("Intervallo evento non valido.");
    const title = cleanText(item.summary, 300).replace(/\s+/g, " ").trim();
    if (!title) throw new Error("Titolo evento mancante.");
    output.set(JSON.stringify([uid, recurrenceKey]), {
      source_uid: uid,
      recurrence_key: recurrenceKey,
      title,
      description: cleanText(item.description, 16000),
      location: cleanText(item.location, 600).replace(/\s+/g, " ").trim(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      starts_on: startsOn,
      ends_on: endsOn,
      all_day: start.isDate,
      cancelled: seriesCancelled || String(item.component.getFirstPropertyValue("status")).toUpperCase() === "CANCELLED",
    });
  }

  for (const [uid, group] of groups) {
    const master = group.get("");
    if (!master) {
      for (const [key, component] of group) {
        const exception = new ICAL.Event(component);
        append(uid, exception, exception.startDate, exception.endDate, key);
      }
      continue;
    }
    const event = new ICAL.Event(master, { exceptions: [...group.entries()].filter(([key]) => key).map(([, value]) => value) });
    if (!event.isRecurring()) {
      append(uid, event, event.startDate, event.endDate, "");
      continue;
    }
    const iterator = event.iterator();
    const seriesCancelled = String(master.getFirstPropertyValue("status")).toUpperCase() === "CANCELLED";
    let occurrence: ICAL.Time | null;
    while ((occurrence = iterator.next())) {
      if (++iterations > MAX_OCCURRENCES) throw new Error("Troppe ricorrenze nel calendario.");
      if (occurrence.toString().slice(0, 10) > addDaysToDateKey(to, 2)) break;
      const details = event.getOccurrenceDetails(occurrence);
      append(uid, details.item, details.startDate, details.endDate, occurrence.toString(), seriesCancelled);
    }
    // Exceptions can move an occurrence into the import window from outside it.
    for (const [key, component] of group) {
      if (!key) continue;
      const exception = new ICAL.Event(component);
      append(uid, exception, exception.startDate, exception.endDate, key, seriesCancelled);
    }
  }
  return [...output.values()].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

function isNewer(component: ICAL.Component, previous: ICAL.Component): boolean {
  const sequence = (value: ICAL.Component) => Number(value.getFirstPropertyValue("sequence") ?? 0);
  if (sequence(component) !== sequence(previous)) return sequence(component) > sequence(previous);
  const timestamp = (value: ICAL.Component) => {
    const modified = value.getFirstPropertyValue("last-modified") ?? value.getFirstPropertyValue("dtstamp");
    return modified instanceof ICAL.Time ? modified.toUnixTime() : 0;
  };
  return timestamp(component) >= timestamp(previous);
}

function instant(value: ICAL.Time, fallbackZone: string): Date {
  if (!value) throw new Error("Data evento mancante.");
  const time = value.clone();
  if (time.isDate || time.zone === ICAL.Timezone.localTimezone) {
    const zone = ICAL.TimezoneService.get(fallbackZone);
    if (!zone) throw new Error("Definizione del fuso orario mancante.");
    time.isDate = false;
    time.zone = zone;
  }
  const date = time.toJSDate();
  if (!Number.isFinite(date.getTime())) throw new Error("Data evento non valida.");
  return date;
}

function cleanText(value: unknown, limit: number): string {
  return String(value ?? "").replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, (entity) => ({
      "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&nbsp;": " ",
    })[entity] ?? entity).replaceAll("\0", "").trim().slice(0, limit);
}
