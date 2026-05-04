import assert from "node:assert/strict";
import test from "node:test";
import {
  getScheduledPlanItems,
  getScheduledSession,
  listSessionsInRange,
  type ItemWithSkill,
} from "./session-scheduler.ts";
import type { Discipline, TrainingSchedule } from "./types.ts";

function makeSchedule(over: Partial<TrainingSchedule> = {}): TrainingSchedule {
  return {
    user_id: "user-1",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
    reps_per_form: 3,
    exam_disciplines: ["shaolin", "taichi"],
    start_date: "2026-04-27",
    end_date: "2026-07-26",
    created_at: "2026-04-26T00:00:00.000Z",
    updated_at: "2026-04-26T00:00:00.000Z",
    ...over,
  };
}

function item(
  id: string,
  status: "focus" | "maintenance",
  discipline: Discipline = "shaolin",
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
      discipline,
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

function addDaysIso(d: string, n: number): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function countOccurrencesInCycle(
  schedule: TrainingSchedule,
  items: ItemWithSkill[],
): Map<string, number> {
  const counts = new Map<string, number>();
  const totalDays = schedule.weekdays.length * schedule.cadence_weeks;
  let cur = schedule.start_date;
  let scheduled = 0;
  while (scheduled < totalDays) {
    const s = getScheduledSession(cur, schedule, items);
    if (s.kind === "training") {
      [...s.focus, ...s.maintenance].forEach((it) => {
        counts.set(it.skill_id, (counts.get(it.skill_id) ?? 0) + 1);
      });
      scheduled++;
    }
    cur = addDaysIso(cur, 1);
  }
  return counts;
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

test("training day returns a training kind session with focus/maintenance arrays", () => {
  const schedule = makeSchedule({ start_date: "2026-04-27", weekdays: [1, 3, 5] });
  const items: ItemWithSkill[] = [
    item("a", "focus"),
    item("b", "focus"),
    item("c", "maintenance"),
  ];
  const result = getScheduledSession("2026-04-27", schedule, items);
  assert.equal(result.kind, "training");
  if (result.kind === "training") {
    assert.ok(Array.isArray(result.focus));
    assert.ok(Array.isArray(result.maintenance));
  }
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
    assert.deepEqual(result.maintenance, []);
    assert.equal(result.sessionIndex, 0);
  }
});

test("getScheduledPlanItems filters exam items by schedule disciplines", () => {
  const schedule = makeSchedule({ exam_disciplines: ["taichi"] });
  const items = [
    item("shaolin-focus", "focus", "shaolin"),
    item("taichi-focus", "focus", "taichi"),
  ];

  const result = getScheduledPlanItems(items, schedule, "exam");

  assert.deepEqual(
    result.map((entry) => entry.skill_id),
    ["taichi-focus"],
  );
});

test("getScheduledPlanItems keeps all custom items regardless of schedule disciplines", () => {
  const schedule = makeSchedule({ exam_disciplines: ["shaolin"] });
  const items = [
    item("shaolin-maint", "maintenance", "shaolin"),
    item("taichi-maint", "maintenance", "taichi"),
  ];

  const result = getScheduledPlanItems(items, schedule, "custom");

  assert.deepEqual(
    result.map((entry) => entry.skill_id),
    ["shaolin-maint", "taichi-maint"],
  );
});

test("nuova distribuzione: ogni focus skill compare 2 volte nel ciclo, ogni maint 1 volta", () => {
  const schedule = makeSchedule({ weekdays: [1, 2, 3, 4, 5], cadence_weeks: 1 });
  const items = [
    item("f1", "focus"),
    item("f2", "focus"),
    item("m1", "maintenance"),
    item("m2", "maintenance"),
    item("m3", "maintenance"),
  ];
  const counts = countOccurrencesInCycle(schedule, items);
  assert.equal(counts.get("f1"), 2);
  assert.equal(counts.get("f2"), 2);
  assert.equal(counts.get("m1"), 1);
  assert.equal(counts.get("m2"), 1);
  assert.equal(counts.get("m3"), 1);
});

test("nuova distribuzione: forme/sessione = ceil(occorrenze_totali / giorni_pratica_ciclo)", () => {
  const schedule = makeSchedule({ weekdays: [1, 3, 5], cadence_weeks: 2 });
  const items = [
    ...Array.from({ length: 4 }, (_, i) => item(`f${i}`, "focus")),
    ...Array.from({ length: 6 }, (_, i) => item(`m${i}`, "maintenance")),
  ];
  // 4*2 + 6*1 = 14 occ; giorni = 3*2 = 6; ceil(14/6) = 3 forme/sessione max
  // Sessioni con almeno 1 forma; total su tutto il ciclo = 14 occorrenze
  let total = 0;
  let maxPerSession = 0;
  // Itera su tutto il ciclo (6 sessioni in 14 giorni con weekdays=[1,3,5] cadence=2)
  for (let day = 0; day < 14; day++) {
    const date = addDaysIso(schedule.start_date, day);
    const s = getScheduledSession(date, schedule, items);
    if (s.kind !== "training") continue;
    const sessionTotal = s.focus.length + s.maintenance.length;
    total += sessionTotal;
    maxPerSession = Math.max(maxPerSession, sessionTotal);
    assert.ok(
      sessionTotal >= 2,
      `expected >=2 forme/sessione (floor(14/6)=2), got ${sessionTotal} on ${date}`,
    );
  }
  assert.equal(total, 14);
  assert.ok(maxPerSession <= 3, `expected <=3 forme/sessione, got ${maxPerSession}`);
});

test("nuova distribuzione: stessa skill non compare due volte nella stessa sessione", () => {
  const schedule = makeSchedule({ weekdays: [1, 2, 3, 4, 5], cadence_weeks: 1 });
  const items = [
    item("f1", "focus"),
    item("f2", "focus"),
    item("m1", "maintenance"),
  ];
  for (let day = 0; day < 5; day++) {
    const date = addDaysIso(schedule.start_date, day);
    const s = getScheduledSession(date, schedule, items);
    if (s.kind !== "training") continue;
    const ids = [...s.focus, ...s.maintenance].map((i) => i.skill_id);
    assert.equal(new Set(ids).size, ids.length, `duplicate skill in session ${date}: ${ids.join(",")}`);
  }
});

test("cycleSize=1 con focus skill non duplica nella sessione", () => {
  // start_date 2026-04-27 e' un lunedi (weekday 1), quindi e' un training day
  const schedule = makeSchedule({ weekdays: [1], cadence_weeks: 1 });
  const items = [item("f1", "focus")];
  const r = getScheduledSession(schedule.start_date, schedule, items);
  assert.equal(r.kind, "training");
  if (r.kind !== "training") return;
  const ids = [...r.focus, ...r.maintenance].map((i) => i.skill_id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    `duplicates in cycleSize=1 session: ${ids.join(",")}`,
  );
  assert.equal(ids.length, 1, `expected 1 occurrence (clamped from 2), got ${ids.length}`);
});
