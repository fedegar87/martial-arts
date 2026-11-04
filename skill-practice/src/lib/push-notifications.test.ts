import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTrainingReminderPayload,
  formatExerciseList,
  isAllowedPushEndpoint,
  isReminderTimeDue,
  normalizeReminderTime,
  validateBrowserPushSubscription,
} from "./push-notifications.ts";

test("normalizeReminderTime accepts HH:mm and strips seconds", () => {
  assert.equal(normalizeReminderTime("09:00"), "09:00");
  assert.equal(normalizeReminderTime("18:30:00"), "18:30");
  assert.equal(normalizeReminderTime("24:00"), null);
});

test("isAllowedPushEndpoint allows major browser push services and blocks SSRF", () => {
  assert.equal(isAllowedPushEndpoint("https://fcm.googleapis.com/fcm/send/abc"), true);
  assert.equal(isAllowedPushEndpoint("https://web.push.apple.com/Qabc123"), true);
  assert.equal(
    isAllowedPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/abc"),
    true,
  );
  assert.equal(isAllowedPushEndpoint("https://wns2-par02p.notify.windows.com/w/?token=1"), true);

  assert.equal(isAllowedPushEndpoint("http://fcm.googleapis.com/fcm/send/abc"), false);
  assert.equal(isAllowedPushEndpoint("https://169.254.169.254/latest/meta-data"), false);
  assert.equal(isAllowedPushEndpoint("https://push.example/sub"), false);
  assert.equal(isAllowedPushEndpoint("https://user:pass@fcm.googleapis.com/fcm/send/a"), false);
});

test("validateBrowserPushSubscription requires trusted HTTPS endpoint and keys", () => {
  assert.deepEqual(
    validateBrowserPushSubscription({
      endpoint: " https://fcm.googleapis.com/fcm/send/sub-1 ",
      keys: { p256dh: " key ", auth: " auth " },
    }),
    {
      endpoint: "https://fcm.googleapis.com/fcm/send/sub-1",
      p256dh: "key",
      auth: "auth",
    },
  );
  assert.equal(
    validateBrowserPushSubscription({
      endpoint: "https://evil.internal/hook",
      keys: { p256dh: "key", auth: "auth" },
    }),
    null,
  );
  assert.equal(validateBrowserPushSubscription({ endpoint: "" }), null);
});

test("isReminderTimeDue supports 90-minute catch-up window and midnight h23", () => {
  // 2026-05-16 is CEST (UTC+2) in Europe/Rome: 07:00Z = 09:00 local
  assert.equal(
    isReminderTimeDue({
      reminderTime: "09:00",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T06:59:00Z"),
    }),
    false,
  );
  assert.equal(
    isReminderTimeDue({
      reminderTime: "09:00",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T07:00:00Z"),
    }),
    true,
  );
  assert.equal(
    isReminderTimeDue({
      reminderTime: "09:00",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T08:15:00Z"),
    }),
    true,
  );
  assert.equal(
    isReminderTimeDue({
      reminderTime: "09:00",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T08:31:00Z"),
    }),
    false,
  );

  // Midnight check (22:10Z = 00:10 Europe/Rome): must not wrap 23:30 into next morning
  assert.equal(
    isReminderTimeDue({
      reminderTime: "23:30",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T22:10:00Z"),
    }),
    false,
  );
  assert.equal(
    isReminderTimeDue({
      reminderTime: "00:05",
      timeZone: "Europe/Rome",
      now: new Date("2026-05-16T22:10:00Z"),
    }),
    true,
  );
});

test("buildTrainingReminderPayload includes brand icon and exercise names", () => {
  assert.deepEqual(
    buildTrainingReminderPayload({
      date: "2026-05-16",
      exerciseNames: ["Tai Chi", "Ta Lu"],
      includeExerciseNames: true,
    }),
    {
      title: "Allenamento di oggi",
      body: "Apri la sessione: Tai Chi, Ta Lu",
      url: "/today",
      tag: "training-reminder-2026-05-16",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    },
  );
});

test("formatExerciseList truncates long lists", () => {
  assert.equal(formatExerciseList(["A", "B", "C", "D", "E", "F"]), "A, B, C, D e altri 2");
});
