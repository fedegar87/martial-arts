import test from "node:test";
import assert from "node:assert/strict";
import { buildEventReminderPayload, canSelectEventReminder, formatFederationEventTime, isEventReminderDue } from "./federation-event-logic.ts";
import type { FederationEvent } from "./types.ts";

const event: FederationEvent = {
  id: "11111111-1111-1111-1111-111111111111", source_uid: "demo", recurrence_key: "",
  title: "Allenamento cinture nere", description: "", location: "Milano",
  starts_at: "2026-11-21T08:30:00Z", ends_at: "2026-11-21T11:30:00Z",
  starts_on: "2026-11-21", ends_on: "2026-11-21", all_day: false, cancelled: false, synced_at: "2026-11-01T00:00:00Z",
};
const preference = { reminderTime: "09:00", timeZone: "Europe/Rome" };

test("event reminders are available before the deadline and never for cancelled/past events", () => {
  assert.equal(canSelectEventReminder(event, preference, new Date("2026-11-19T18:00:00Z")), true);
  assert.equal(canSelectEventReminder(event, preference, new Date("2026-11-20T07:59:00Z")), true);
  assert.equal(canSelectEventReminder(event, preference, new Date("2026-11-20T08:01:00Z")), false);
  assert.equal(canSelectEventReminder({ ...event, cancelled: true }, preference, new Date("2026-11-19T18:00:00Z")), false);
  assert.equal(canSelectEventReminder({ ...event, starts_at: "invalid" }, preference), false);
});

test("selected event reminders use the previous day, saved timezone and retry window", () => {
  assert.equal(isEventReminderDue(event, preference, new Date("2026-11-20T08:15:00Z")), true);
  assert.equal(isEventReminderDue(event, preference, new Date("2026-11-20T07:59:00Z")), false);
  assert.equal(isEventReminderDue(event, preference, new Date("2026-11-20T09:30:00Z")), false);
  assert.equal(isEventReminderDue(event, preference, new Date("2026-11-21T08:15:00Z")), false);
  assert.equal(isEventReminderDue({ ...event, cancelled: true }, preference, new Date("2026-11-20T08:15:00Z")), false);
  assert.equal(isEventReminderDue(event, { ...preference, timeZone: "America/New_York" }, new Date("2026-11-20T14:00:00Z")), true);
  const summer = { ...event, starts_at: "2026-06-06T07:30:00Z", starts_on: "2026-06-06" };
  assert.equal(isEventReminderDue(summer, preference, new Date("2026-06-05T07:00:00Z")), true);
});

test("event display and push use source times and a validated internal calendar destination", () => {
  assert.equal(formatFederationEventTime(event), "09:30–12:30");
  assert.equal(formatFederationEventTime({ ...event, all_day: true }), "Tutto il giorno");
  const payload = buildEventReminderPayload(event);
  assert.equal(payload.url, "/calendar?date=2026-11-21");
  assert.ok(payload.body.includes("09:30–12:30"));
  assert.notEqual(payload.tag, "training-reminder-2026-11-20");
});
