import assert from "node:assert/strict";
import test from "node:test";
import {
  getScheduledSession,
  listSessionsInRange,
  type ItemWithSkill,
} from "./session-scheduler.ts";
import type { TrainingSchedule } from "./types.ts";

function makeSchedule(over: Partial<TrainingSchedule> = {}): TrainingSchedule {
  return {
    user_id: "user-1",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
    reps_per_form: 3,
    start_date: "2026-04-27",
    end_date: "2026-07-26",
    created_at: "2026-04-26T00:00:00.000Z",
    updated_at: "2026-04-26T00:00:00.000Z",
    ...over,
  };
}

function item(
  id: string,
  status: "focus" | "review" | "maintenance",
): ItemWithSkill {
  return {
    id: `pi-${id}`,
    user_id: "user-1",
    skill_id: id,
    status,
    source: "manual",
    is_hidden: false,
    last_practiced_at: null,
    added_at: "2026-04-01T00:00:00.000Z",
    skill: {
      id,
      school_id: "school-1",
      name: id,
      name_italian: null,
      category: "forme",
      discipline: "shaolin",
      practice_mode: "solo",
      description: null,
      video_url: "",
      thumbnail_url: null,
      teacher_notes: null,
      estimated_duration_seconds: 180,
      minimum_grade_value: 1,
      display_order: 0,
      created_at: "2026-04-01T00:00:00.000Z",
    },
  };
}

function isoWeekdayForTest(d: string): number {
  const dt = new Date(`${d}T00:00:00Z`).getUTCDay();
  return dt === 0 ? 7 : dt;
}

function addDaysForTest(d: string, n: number): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

test("returns no_schedule when schedule is null", () => {
  const result = getScheduledSession("2026-05-01", null, []);
  assert.equal(result.kind, "no_schedule");
});

test("returns expired when date is past end_date", () => {
  const schedule = makeSchedule({ end_date: "2026-05-01" });
  const result = getScheduledSession("2026-05-02", schedule, []);
  assert.equal(result.kind, "expired");
  if (result.kind === "expired") assert.equal(result.endDate, "2026-05-01");
});

test("returns rest_day before start_date", () => {
  const schedule = makeSchedule({ start_date: "2026-05-01" });
  const result = getScheduledSession("2026-04-29", schedule, []);
  assert.equal(result.kind, "rest_day");
});

test("returns rest_day when weekday not in weekdays", () => {
  const schedule = makeSchedule({ start_date: "2026-04-27", weekdays: [1, 3, 5] });
  const result = getScheduledSession("2026-04-28", schedule, []);
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") {
    assert.equal(result.nextTrainingDate, "2026-04-29");
  }
});

test("nextTrainingDate is start_date if start_date is a training weekday", () => {
  const schedule = makeSchedule({ start_date: "2026-05-04", weekdays: [1, 3, 5] });
  const result = getScheduledSession("2026-05-02", schedule, []);
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") assert.equal(result.nextTrainingDate, "2026-05-04");
});

test("nextTrainingDate skips dates before start_date even if they fall on a weekday", () => {
  // start_date = Mon 2026-05-04, weekdays = [1,3,5] (Lun/Mer/Ven)
  // Query Wed 2026-04-29 (in weekdays, but before start_date)
  // Expected nextTrainingDate = 2026-05-04 (start_date itself), NOT 2026-04-29
  const schedule = makeSchedule({ start_date: "2026-05-04", weekdays: [1, 3, 5] });
  const result = getScheduledSession("2026-04-29", schedule, []);
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") {
    assert.equal(result.nextTrainingDate, "2026-05-04");
  }
});

test("training day returns all focus items sorted by display_order", () => {
  const schedule = makeSchedule({ start_date: "2026-04-27", weekdays: [1, 3, 5] });
  const items: ItemWithSkill[] = [
    item("a", "focus"),
    item("b", "focus"),
    item("c", "review"),
  ];
  const result = getScheduledSession("2026-04-27", schedule, items);
  assert.equal(result.kind, "training");
  if (result.kind === "training") {
    assert.deepEqual(result.focus.map((i) => i.skill_id).sort(), ["a", "b"]);
  }
});

test("review items distributed across cycle, each appears once", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
  });
  const reviews = ["r1", "r2", "r3", "r4", "r5", "r6"].map((id) =>
    item(id, "review"),
  );
  const dates = [
    "2026-04-27",
    "2026-04-29",
    "2026-05-01",
    "2026-05-04",
    "2026-05-06",
    "2026-05-08",
  ];
  const seen = new Set<string>();
  for (const d of dates) {
    const r = getScheduledSession(d, schedule, reviews);
    if (r.kind === "training") for (const it of r.review) seen.add(it.skill_id);
  }
  assert.equal(seen.size, 6);
});

test("maintenance uses cadence_weeks * 2 cycle", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
  });
  const maint = Array.from({ length: 12 }, (_, i) =>
    item(`m${i.toString().padStart(2, "0")}`, "maintenance"),
  );
  const seen = new Set<string>();
  let cur = "2026-04-27";
  for (let i = 0; i < 12; i++) {
    const r = getScheduledSession(cur, schedule, maint);
    if (r.kind === "training") for (const it of r.maintenance) seen.add(it.skill_id);
    do {
      cur = addDaysForTest(cur, 1);
    } while (![1, 3, 5].includes(isoWeekdayForTest(cur)));
  }
  assert.equal(seen.size, 12);
});

test("listSessionsInRange labels training/rest correctly", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    end_date: "2026-05-03",
    weekdays: [1, 3, 5],
  });
  const items: ItemWithSkill[] = [item("a", "focus")];
  const list = listSessionsInRange("2026-04-27", "2026-05-03", schedule, items);
  assert.equal(list.length, 7);
  const trainingDates = list
    .filter((s) => s.session.kind === "training")
    .map((s) => s.date);
  assert.deepEqual(trainingDates, ["2026-04-27", "2026-04-29", "2026-05-01"]);
});

test("bucket handles fewer items than cycle slots without duplicates", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
  });
  const reviews = [item("r1", "review"), item("r2", "review")];
  const counts = new Map<string, number>();
  let cur = "2026-04-27";
  for (let i = 0; i < 6; i++) {
    const r = getScheduledSession(cur, schedule, reviews);
    if (r.kind === "training") {
      for (const it of r.review) {
        counts.set(it.skill_id, (counts.get(it.skill_id) ?? 0) + 1);
      }
    }
    do {
      cur = addDaysForTest(cur, 1);
    } while (![1, 3, 5].includes(isoWeekdayForTest(cur)));
  }
  assert.equal(counts.get("r1"), 1);
  assert.equal(counts.get("r2"), 1);
});

test("cadence_weeks=1 with daily training collapses cycle", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 2, 3, 4, 5, 6, 7],
    cadence_weeks: 1,
  });
  const reviews = Array.from({ length: 7 }, (_, i) => item(`r${i}`, "review"));
  const seen = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const date = addDaysForTest("2026-04-27", i);
    const r = getScheduledSession(date, schedule, reviews);
    if (r.kind === "training") for (const it of r.review) seen.add(it.skill_id);
  }
  assert.equal(seen.size, 7);
});

test("nextTrainingDate is null when no training day before end_date", () => {
  const schedule = makeSchedule({
    start_date: "2026-05-01",
    end_date: "2026-05-03",
    weekdays: [1],
  });
  const result = getScheduledSession("2026-05-02", schedule, []);
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") {
    assert.equal(result.nextTrainingDate, null);
  }
});

test("empty items list yields empty buckets on training day", () => {
  const schedule = makeSchedule({ start_date: "2026-04-27", weekdays: [1, 3, 5] });
  const result = getScheduledSession("2026-04-27", schedule, []);
  assert.equal(result.kind, "training");
  if (result.kind === "training") {
    assert.deepEqual(result.focus, []);
    assert.deepEqual(result.review, []);
    assert.deepEqual(result.maintenance, []);
    assert.equal(result.sessionIndex, 0);
  }
});
