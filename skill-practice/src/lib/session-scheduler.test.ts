import assert from "node:assert/strict";
import test from "node:test";
import {
  getScheduledPlanItems,
  getScheduledSession,
  listSessionsInRange,
  type ItemWithSkill,
} from "./session-scheduler.ts";
import { buildSessionPeriodProgress } from "./session-progress.ts";
import type { Discipline, PracticeLog, Skill, TrainingSchedule } from "./types.ts";
import { isDateKey } from "./date.ts";

test("scheduler ignores invalid or nonfinite schedule dates", () => {
  for (const start_date of ["-infinity", "infinity", "2026-02-30", "0000-01-01", "10000-01-01"]) {
    assert.deepEqual(getScheduledSession("2026-05-04", makeSchedule({ start_date }), []), { kind: "no_schedule" });
  }
  assert.equal(isDateKey("2024-02-29"), true);
  assert.equal(isDateKey("2026-02-29"), false);
  assert.equal(isDateKey("0001-01-01"), true);
  assert.equal(isDateKey("9999-12-31"), true);
});

test("weekly arithmetic preserves the scheduler's day-by-day session index", () => {
  const start = "2026-01-01";
  for (const weekdays of [[1], [1, 3, 5], [1, 2, 3, 4, 5, 6, 7]]) {
    const schedule = makeSchedule({ start_date: start, end_date: "2027-01-01", weekdays });
    let expectedIndex = -1;
    for (let offset = 0; offset < 90; offset++) {
      const date = addDaysIso(start, offset);
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
      if (weekdays.includes(weekday)) expectedIndex++;
      const session = getScheduledSession(date, schedule, []);
      if (session.kind === "training") assert.equal(session.sessionIndex, expectedIndex);
      else assert.equal(session.kind, "rest_day");
    }
  }
});

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
  category: Skill["category"] = "forme",
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
      category,
      discipline,
      practice_mode: "solo",
      description: null,
      video_url: "",
      video_label: null,
      secondary_video_url: null,
      secondary_video_label: null,
      thumbnail_url: null,
      teacher_notes: null,
      estimated_duration_seconds: 180,
      minimum_grade_value: 1,
      is_extra: false,
      display_order: 0,
      created_at: "2026-04-01T00:00:00.000Z",
    },
  };
}

function practiceLog(
  date: string,
  skillId: string,
  over: Partial<PracticeLog> = {},
): PracticeLog {
  return {
    id: `${date}-${skillId}`,
    user_id: "user-1",
    skill_id: skillId,
    date,
    completed: false,
    personal_note: null,
    reps_target: null,
    reps_done: 0,
    created_at: `${date}T00:00:00.000Z`,
    ...over,
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

test("session ranges reject invalid dates and stop at the last supported date", () => {
  const schedule = makeSchedule({ start_date: "9999-12-01", end_date: "9999-12-31" });
  assert.deepEqual(listSessionsInRange("invalid", "2026-05-01", schedule, []), []);
  assert.deepEqual(listSessionsInRange("2026-05-01", "2026-02-30", schedule, []), []);
  assert.deepEqual(listSessionsInRange("2026-05-02", "2026-05-01", schedule, []), []);
  assert.deepEqual(listSessionsInRange("9999-12-30", "9999-12-31", schedule, []).map((row) => row.date), ["9999-12-30", "9999-12-31"]);
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

test("buildSessionPeriodProgress summarizes planned sessions against logs", () => {
  const rows = [
    {
      date: "2026-05-04",
      session: {
        kind: "training" as const,
        sessionIndex: 0,
        focus: [item("form", "focus")],
        maintenance: [item("kick", "maintenance", "shaolin", "tui_fa")],
      },
    },
    {
      date: "2026-05-05",
      session: {
        kind: "training" as const,
        sessionIndex: 1,
        focus: [item("future-form", "focus")],
        maintenance: [],
      },
    },
  ];

  const summary = buildSessionPeriodProgress({
    rows,
    logs: [
      practiceLog("2026-05-04", "form", {
        completed: true,
        reps_target: 3,
        reps_done: 3,
      }),
      practiceLog("2026-05-04", "kick", { completed: true }),
    ],
    from: "2026-05-04",
    to: "2026-05-05",
    repsPerForm: 3,
    today: new Date("2026-05-04T12:00:00.000Z"),
  });

  assert.equal(summary.sessionCompleted, 1);
  assert.equal(summary.sessionTotal, 2);
  assert.equal(summary.exerciseCompleted, 2);
  assert.equal(summary.exerciseTotal, 3);
  assert.equal(summary.repsDone, 3);
  assert.equal(summary.repsTarget, 6);
  assert.equal(summary.rows[0].status, "completed");
  assert.equal(summary.rows[1].status, "future");
});

test("buildSessionPeriodProgress marks partial sessions from repetition progress", () => {
  const summary = buildSessionPeriodProgress({
    rows: [
      {
        date: "2026-05-04",
        session: {
          kind: "training" as const,
          sessionIndex: 0,
          focus: [item("form", "focus")],
          maintenance: [],
        },
      },
    ],
    logs: [practiceLog("2026-05-04", "form", { reps_target: 3, reps_done: 1 })],
    from: "2026-05-04",
    to: "2026-05-04",
    repsPerForm: 3,
    today: new Date("2026-05-04T12:00:00.000Z"),
  });

  assert.equal(summary.rows[0].exerciseCompleted, 0);
  assert.equal(summary.rows[0].repsDone, 1);
  assert.equal(summary.rows[0].status, "partial");
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

test("collisioni focus non sovraccaricano una sessione del ciclo", () => {
  const schedule = makeSchedule({ weekdays: [1], cadence_weeks: 2 });
  const items = [
    item("a-focus", "focus"),
    item("b-maintenance", "maintenance"),
    item("c-maintenance", "maintenance"),
  ];
  const sessions = listSessionsInRange("2026-04-27", "2026-05-10", schedule, items)
    .flatMap(({ session }) => session.kind === "training" ? [session] : []);

  assert.deepEqual(sessions.map((session) => session.focus.length + session.maintenance.length), [2, 2]);
  assert.deepEqual(countOccurrencesInCycle(schedule, items), new Map([
    ["a-focus", 2],
    ["b-maintenance", 1],
    ["c-maintenance", 1],
  ]));
});

const schedulerWeekdayCases = [[1], [1, 3, 5], [1, 2, 3, 4, 5, 6, 7]];
const schedulerCadenceCases = [1, 2, 4] as const;
const schedulerPlanCases = [
  { focus: 0, maintenance: 0 },
  { focus: 1, maintenance: 0 },
  { focus: 0, maintenance: 1 },
  { focus: 1, maintenance: 2 },
  { focus: 2, maintenance: 1 },
  { focus: 7, maintenance: 6 },
  { focus: 6, maintenance: 7 },
  { focus: 7, maintenance: 7 },
  { focus: 14, maintenance: 0 },
  { focus: 0, maintenance: 14 },
];

for (const weekdays of schedulerWeekdayCases) {
  for (const cadence_weeks of schedulerCadenceCases) {
    test(`matrice scheduler: ${weekdays.length} giorni, ciclo ${cadence_weeks} settimane, dieci composizioni`, () => {
      const schedule = makeSchedule({ weekdays, cadence_weeks });
      const slotCount = weekdays.length * cadence_weeks;

      for (const planCase of schedulerPlanCases) {
        const context = `${planCase.focus} focus, ${planCase.maintenance} maintenance`;
        const items = Array.from({ length: planCase.focus + planCase.maintenance }, (_, index) =>
          item(`form-${String(index).padStart(2, "0")}`, index < planCase.focus ? "focus" : "maintenance"),
        );
        const originalItems = structuredClone(items);
        const rows = listSessionsInRange(
          schedule.start_date,
          addDaysIso(schedule.start_date, cadence_weeks * 14 - 1),
          schedule,
          items,
        );
        const sessions = rows.flatMap(({ session }) => session.kind === "training" ? [session] : []);
        assert.equal(sessions.length, slotCount * 2, context);

        for (let cycle = 0; cycle < 2; cycle++) {
          const counts = new Map<string, number>();
          const loads: number[] = [];
          const cycleSessions = sessions.slice(cycle * slotCount, (cycle + 1) * slotCount);
          for (const [index, session] of cycleSessions.entries()) {
            const scheduledItems = [...session.focus, ...session.maintenance];
            const ids = scheduledItems.map((entry) => entry.skill_id);
            assert.equal(session.sessionIndex, cycle * slotCount + index, context);
            assert.equal(new Set(ids).size, ids.length, `duplicati: ${context}`);
            assert.ok(session.focus.every((entry) => entry.status === "focus"), context);
            assert.ok(session.maintenance.every((entry) => entry.status === "maintenance"), context);
            loads.push(ids.length);
            for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
          }

          const expectedTotal = planCase.focus * Math.min(2, slotCount) + planCase.maintenance;
          assert.equal(loads.reduce((sum, load) => sum + load, 0), expectedTotal, context);
          assert.ok(Math.max(...loads) - Math.min(...loads) <= 1, `carico sbilanciato ${JSON.stringify(loads)}: ${context}`);
          for (const entry of items) {
            assert.equal(counts.get(entry.skill_id), entry.status === "focus" ? Math.min(2, slotCount) : 1, context);
          }
        }

        assert.deepEqual(
          sessions.slice(0, slotCount).map(({ focus, maintenance }) => ({ focus, maintenance })),
          sessions.slice(slotCount).map(({ focus, maintenance }) => ({ focus, maintenance })),
          `cicli diversi: ${context}`,
        );
        assert.deepEqual(items, originalItems, `input modificato: ${context}`);
      }
    });
  }
}

test("13 o 14 forme focus in ciclo di quattro settimane quotidiane producono al massimo una forma al giorno", () => {
  const schedule = makeSchedule({ weekdays: [1, 2, 3, 4, 5, 6, 7], cadence_weeks: 4 });
  for (const formCount of [13, 14]) {
    const items = Array.from({ length: formCount }, (_, index) => item(`form-${index}`, "focus"));
    const rows = listSessionsInRange("2026-04-27", "2026-05-24", schedule, items);
    const loads = rows.map(({ session }) => {
      assert.equal(session.kind, "training");
      return session.kind === "training" ? session.focus.length + session.maintenance.length : -1;
    });
    assert.equal(loads.filter((load) => load === 1).length, formCount * 2);
    assert.equal(loads.filter((load) => load === 0).length, 28 - formCount * 2);
    assert.equal(Math.max(...loads), 1);
  }
});

test("ordine degli input e giorni non ordinati non cambiano la tabella e non vengono modificati", () => {
  const schedule = makeSchedule({ weekdays: [5, 1, 3], cadence_weeks: 4 });
  const items = [
    item("taichi-form", "focus", "taichi", "forme"),
    item("shaolin-weapon", "maintenance", "shaolin", "armi_forma"),
    item("shaolin-form-a", "focus", "shaolin", "forme"),
    item("taichi-kick", "maintenance", "taichi", "tui_fa"),
    item("shaolin-form-b", "maintenance", "shaolin", "forme"),
  ];
  items[2].skill.display_order = 2;
  items[4].skill.display_order = 1;
  const originalSchedule = structuredClone(schedule);
  const originalItems = structuredClone(items);
  const canonical = listSessionsInRange("2026-04-27", "2026-05-24", schedule, items);

  for (const permutation of [items.toReversed(), [items[2], items[0], items[4], items[1], items[3]]]) {
    assert.deepEqual(listSessionsInRange("2026-04-27", "2026-05-24", schedule, permutation), canonical);
  }
  assert.deepEqual(listSessionsInRange("2026-04-27", "2026-05-24", { ...schedule, weekdays: [1, 3, 5] }, items), canonical);
  assert.deepEqual(items, originalItems);
  assert.deepEqual(schedule, originalSchedule);
});

test("ripetizioni per forma cambiano il lavoro nella sessione senza moltiplicare le date programmate", () => {
  const schedule = makeSchedule({ weekdays: [1, 3, 5], cadence_weeks: 2 });
  const items = [item("focus", "focus"), item("maintenance", "maintenance")];
  const canonical = listSessionsInRange("2026-04-27", "2026-05-10", schedule, items);
  for (const reps_per_form of [1, 2, 5, 10]) {
    assert.deepEqual(listSessionsInRange("2026-04-27", "2026-05-10", { ...schedule, reps_per_form }, items), canonical);
  }
});

test("confini inclusivi, avvio a settimana iniziata e scadenza non aggiungono sessioni", () => {
  const schedule = makeSchedule({
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
    start_date: "2026-04-30",
    end_date: "2026-05-13",
  });
  const rows = listSessionsInRange("2026-04-29", "2026-05-14", schedule, [item("focus", "focus")]);
  assert.deepEqual(rows.flatMap(({ date, session }) => session.kind === "training" ? [date] : []), [
    "2026-05-01", "2026-05-04", "2026-05-06", "2026-05-08", "2026-05-11", "2026-05-13",
  ]);
  assert.deepEqual(rows[0].session, { kind: "rest_day", nextTrainingDate: "2026-05-01" });
  assert.equal(rows.at(-2)?.session.kind, "training");
  assert.deepEqual(rows.at(-1)?.session, { kind: "expired", endDate: "2026-05-13" });
});

test("anno bisestile e cambio ora non saltano giorni o indici di sessione", () => {
  for (const start_date of ["2028-02-27", "2026-03-27", "2026-10-23", "2026-12-29"]) {
    const end_date = addDaysIso(start_date, 7);
    const schedule = makeSchedule({ start_date, end_date, weekdays: [1, 2, 3, 4, 5, 6, 7], cadence_weeks: 1 });
    const rows = listSessionsInRange(start_date, end_date, schedule, []);
    assert.equal(rows.length, 8);
    rows.forEach(({ date, session }, index) => {
      assert.equal(date, addDaysIso(start_date, index));
      assert.equal(session.kind, "training");
      if (session.kind === "training") assert.equal(session.sessionIndex, index);
    });
  }
});

test("scheduler rifiuta cadenze non supportate e giorni duplicati", () => {
  for (const cadence of [0, -1, 3, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const schedule = makeSchedule({ cadence_weeks: cadence as TrainingSchedule["cadence_weeks"] });
    assert.deepEqual(getScheduledSession("2026-04-27", schedule, [item("focus", "focus")]), { kind: "no_schedule" });
  }
  for (const weekdays of [[], [1, 1], [1, 3, 3, 5], [0], [8], [1.5], [Number.NaN]]) {
    assert.deepEqual(getScheduledSession("2026-04-27", makeSchedule({ weekdays }), []), { kind: "no_schedule" });
  }
});
