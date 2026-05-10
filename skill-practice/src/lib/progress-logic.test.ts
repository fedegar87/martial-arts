import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPracticeCalendar,
  computeCurrentStreakFromLogs,
  countPracticeDays,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
} from "./progress-logic.ts";

test("practice activity metrics count partial reps but not notes alone", () => {
  const logs = [
    log("2026-04-21", "form", { completed: false, repsDone: 1 }),
    log("2026-04-21", "kick", { completed: false, repsDone: 0 }),
    log("2026-04-22", "kick"),
  ];
  const calendar = buildPracticeCalendar(logs, new Date("2026-04-22T12:00:00.000Z"));

  assert.equal(countPracticeDays(logs), 2);
  assert.deepEqual(calendar.slice(-2), [
    { date: "2026-04-21", practiced: true },
    { date: "2026-04-22", practiced: true },
  ]);
});

test("historical streaks are computed from all practice activity logs", () => {
  const logs = [
    log("2025-12-01"),
    log("2025-12-02"),
    log("2025-12-03"),
    log("2026-04-24", "form", { completed: false, repsDone: 1 }),
  ];
  const today = new Date("2026-04-25T12:00:00.000Z");

  assert.equal(computeCurrentStreakFromLogs(logs, today), 1);
});

test("practice calendar marks days without practice as practiced=false", () => {
  const today = new Date("2026-04-25T12:00:00.000Z");
  const calendar = buildPracticeCalendar([log("2026-04-25")], today);

  assert.equal(calendar.length, 90);
  assert.equal(calendar.at(-1)?.practiced, true);
  assert.equal(calendar.at(-2)?.practiced, false);
});

test("countRespectedSessionsUpTo conta solo righe completed entro la data limite", () => {
  const rows = [
    { date: "2026-05-01", status: "completed" as const },
    { date: "2026-05-02", status: "partial" as const },
    { date: "2026-05-03", status: "completed" as const },
    { date: "2026-05-10", status: "completed" as const },
  ];

  assert.equal(countRespectedSessionsUpTo(rows, "2026-05-05"), 2);
  assert.equal(countRespectedSessionsUpTo(rows, "2026-05-10"), 3);
  assert.equal(countRespectedSessionsUpTo(rows, "2026-04-30"), 0);
});

test("countSessionsUpTo conta tutte le righe entro la data limite", () => {
  const rows = [
    { date: "2026-05-01", status: "completed" as const },
    { date: "2026-05-02", status: "partial" as const },
    { date: "2026-05-10", status: "not_started" as const },
  ];

  assert.equal(countSessionsUpTo(rows, "2026-05-05"), 2);
  assert.equal(countSessionsUpTo(rows, "2026-05-15"), 3);
});

function log(
  date: string,
  skillId = "skill-1",
  options: { completed?: boolean; repsDone?: number } = {},
) {
  return {
    id: date,
    user_id: "user-1",
    skill_id: skillId,
    date,
    completed: options.completed ?? true,
    personal_note: null,
    reps_target: null,
    reps_done: options.repsDone ?? 0,
    created_at: `${date}T00:00:00.000Z`,
  };
}
