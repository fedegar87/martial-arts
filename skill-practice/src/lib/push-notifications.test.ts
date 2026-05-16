import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTrainingReminderPayload,
  formatExerciseList,
  normalizeReminderTime,
  validateBrowserPushSubscription,
} from "./push-notifications.ts";

test("normalizeReminderTime accepts HH:mm and strips seconds", () => {
  assert.equal(normalizeReminderTime("09:00"), "09:00");
  assert.equal(normalizeReminderTime("18:30:00"), "18:30");
  assert.equal(normalizeReminderTime("24:00"), null);
});

test("validateBrowserPushSubscription requires endpoint and keys", () => {
  assert.deepEqual(
    validateBrowserPushSubscription({
      endpoint: " https://push.example/sub ",
      keys: { p256dh: " key ", auth: " auth " },
    }),
    {
      endpoint: "https://push.example/sub",
      p256dh: "key",
      auth: "auth",
    },
  );
  assert.equal(validateBrowserPushSubscription({ endpoint: "" }), null);
});

test("buildTrainingReminderPayload keeps notification simple", () => {
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
    },
  );
});

test("formatExerciseList truncates long lists", () => {
  assert.equal(formatExerciseList(["A", "B", "C", "D", "E", "F"]), "A, B, C, D e altri 2");
});
