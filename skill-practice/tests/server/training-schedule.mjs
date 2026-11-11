import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(
  path.join(path.dirname(app), "tools/video/package.json"),
);
const { build } = requireTools("esbuild");
const results = path.join(app, "test-results");
await fs.mkdir(results, { recursive: true });
const temporary = await fs.mkdtemp(path.join(results, "training-server-"));
const userId = "training-user";
const skillId = "training-form";
let checks = 0;

try {
  const mocks = {
    "supabase.ts": "export const createClient = async () => globalThis.__trainingTest.client;",
    "intl.ts": "export const getTranslations = async () => key => key;",
    "cache.ts": "export const revalidatePath = path => globalThis.__trainingTest.revalidated.push(path);",
    "navigation.ts": "export const redirect = path => { const error = new Error('TEST_REDIRECT'); error.destination = path; throw error; };",
    "date.ts": `export { addDaysToDateKey } from ${JSON.stringify(path.join(app, "src/lib/date.ts"))}; export const localDateKey = () => globalThis.__trainingTest.today;`,
  };
  for (const [name, contents] of Object.entries(mocks)) {
    await fs.writeFile(path.join(temporary, name), contents);
  }
  await build({
    stdin: {
      contents: "export {setupTrainingSchedule, resetTrainingSchedule} from '@/lib/actions/training-schedule'; export {incrementRep, decrementRep} from '@/lib/actions/practice'; export {setPracticeCompletionForDate} from '@/lib/actions/calendar'; export {getScheduledSession} from '@/lib/session-scheduler';",
      resolveDir: app,
    },
    outfile: path.join(temporary, "bundle.mjs"),
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
    alias: {
      "@": path.join(app, "src"),
      "@/lib/supabase/server": path.join(temporary, "supabase.ts"),
      "@/lib/date": path.join(temporary, "date.ts"),
      "next-intl/server": path.join(temporary, "intl.ts"),
      "next/cache": path.join(temporary, "cache.ts"),
      "next/navigation": path.join(temporary, "navigation.ts"),
    },
  });
  const { setupTrainingSchedule, resetTrainingSchedule, incrementRep, decrementRep, setPracticeCompletionForDate, getScheduledSession } = await import(
    pathToFileURL(path.join(temporary, "bundle.mjs"))
  );
  const state = (globalThis.__trainingTest = {});

  function reset(overrides = {}) {
    Object.assign(state, {
      user: { id: userId },
      profile: { id: userId, plan_mode: "exam" },
      items: [
        { user_id: userId, source: "exam_program", is_hidden: false, skill: { discipline: "shaolin" } },
        { user_id: userId, source: "exam_program", is_hidden: false, skill: { discipline: "taichi" } },
      ],
      today: "2026-11-11",
      schedule: { user_id: userId, reps_per_form: 3 },
      logs: [],
      queries: [],
      writes: [],
      rpcs: [],
      revalidated: [],
      errors: {},
      ...overrides,
    });
  }

  function query(table) {
    const request = { table, kind: null, filters: [] };
    const chain = {
      select(columns) { request.kind = "select"; request.columns = columns; return chain; },
      eq(column, value) { request.filters.push([column, value]); return chain; },
      upsert(payload) { request.kind = "upsert"; request.payload = payload; return chain; },
      insert(payload) { request.kind = "insert"; request.payload = payload; return chain; },
      update(payload) { request.kind = "update"; request.payload = payload; return chain; },
      delete() { request.kind = "delete"; return chain; },
      maybeSingle: async () => execute(true),
      then(resolve, reject) { return Promise.resolve().then(() => execute(false)).then(resolve, reject); },
    };
    function execute(single) {
      state.queries.push(structuredClone(request));
      const error = state.errors[`${table}:${request.kind}`] ?? null;
      if (error) return { data: null, error: { message: error } };
      const matches = row => request.filters.every(([column, value]) => row[column] === value);
      if (request.kind === "select") {
        const rows = table === "user_profiles" ? [state.profile].filter(Boolean)
          : table === "user_plan_items" ? state.items
          : table === "training_schedule" ? [state.schedule].filter(Boolean)
          : table === "practice_logs" ? state.logs
          : assert.fail(`Unexpected read: ${table}`);
        const filtered = rows.filter(matches);
        return { data: single ? filtered[0] ?? null : filtered, error: null };
      }
      state.writes.push(structuredClone(request));
      if (table === "training_schedule" && request.kind === "upsert") state.schedule = structuredClone(request.payload);
      else if (table === "training_schedule" && request.kind === "delete") {
        if (state.schedule && matches(state.schedule)) state.schedule = null;
      } else if (table === "practice_logs" && request.kind === "insert") {
        state.logs.push({ id: `log-${state.logs.length}`, personal_note: null, ...request.payload });
      } else if (table === "practice_logs" && request.kind === "update") {
        state.logs = state.logs.map(row => matches(row) ? { ...row, ...request.payload } : row);
      } else if (table === "practice_logs" && request.kind === "upsert") {
        const index = state.logs.findIndex(row => ["user_id", "skill_id", "date"].every(column => row[column] === request.payload[column]));
        if (index < 0) state.logs.push({ id: `log-${state.logs.length}`, personal_note: null, ...request.payload });
        else state.logs[index] = { ...state.logs[index], ...request.payload };
      } else if (table === "practice_logs" && request.kind === "delete") {
        state.logs = state.logs.filter(row => !matches(row));
      } else assert.ok(table === "user_plan_items" && request.kind === "update", `Unexpected write: ${table}/${request.kind}`);
      return { data: null, error: null };
    }
    return chain;
  }
  state.client = {
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: query,
    rpc: async (name, payload) => {
      assert.equal(name, "update_plan_item_last_practiced_at");
      state.rpcs.push({ name, payload });
      return { error: null };
    },
  };

  function form(overrides = {}) {
    const values = { weekdays: [1, 3, 5], cadence_weeks: 2, reps_per_form: 3, duration_weeks: 12, exam_discipline_scope: "both", ...overrides };
    const data = new FormData();
    for (const [name, value] of Object.entries(values)) {
      if (value === null) continue;
      for (const entry of Array.isArray(value) ? value : [value]) data.append(name, String(entry));
    }
    return data;
  }

  async function save(overrides = {}) {
    await assert.rejects(setupTrainingSchedule(null, form(overrides)), error => {
      assert.equal(error.message, "TEST_REDIRECT");
      assert.equal(error.destination, "/today");
      return true;
    });
    assert.deepEqual(state.revalidated, ["/today", "/calendar"]);
    assert.equal(state.writes.length, 1);
    assert.equal(state.writes[0].table, "training_schedule");
    checks++;
    return state.schedule;
  }

  async function reject(overrides, expectedError) {
    assert.deepEqual(await setupTrainingSchedule(null, form(overrides)), { error: expectedError });
    assert.equal(state.writes.length, 0);
    assert.deepEqual(state.revalidated, []);
    checks++;
  }

  const dayMilliseconds = 86400000;
  for (let mask = 1; mask < 128; mask++) {
    const weekdays = Array.from({ length: 7 }, (_, index) => index + 1).filter(day => mask & (1 << (day - 1)));
    for (const cadence of [1, 2, 4]) {
      for (let reps = 1; reps <= 10; reps++) {
        for (const duration of [4, 8, 12, 24]) {
          reset();
          const saved = await save({ weekdays, cadence_weeks: cadence, reps_per_form: reps, duration_weeks: duration });
          assert.deepEqual(saved, {
            user_id: userId,
            weekdays,
            cadence_weeks: cadence,
            reps_per_form: reps,
            exam_disciplines: ["shaolin", "taichi"],
            start_date: "2026-11-11",
            end_date: new Date(Date.parse("2026-11-11T00:00:00Z") + (duration * 7 - 1) * dayMilliseconds).toISOString().slice(0, 10),
          });
        }
      }
    }
  }

  reset();
  assert.deepEqual((await save({ weekdays: [7, 1, 3, 1, 7] })).weekdays, [1, 3, 7]);

  for (const today of ["2026-03-23", "2026-10-19", "2026-12-20", "2028-02-25"]) {
    for (const duration of [4, 8, 12, 24]) {
      reset({ today });
      const saved = await save({ weekdays: [1, 2, 3, 4, 5, 6, 7], duration_weeks: duration });
      const actualLength = (Date.parse(`${saved.end_date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / dayMilliseconds + 1;
      assert.equal(actualLength, duration * 7);
      assert.equal(getScheduledSession(saved.end_date, saved, []).kind, "training");
      const after = new Date(Date.parse(`${saved.end_date}T00:00:00Z`) + dayMilliseconds).toISOString().slice(0, 10);
      assert.equal(getScheduledSession(after, saved, []).kind, "expired");
    }
  }

  for (const scope of ["both", "shaolin", "taichi", null]) {
    reset();
    const saved = await save({ exam_discipline_scope: scope });
    assert.deepEqual(saved.exam_disciplines, scope === "shaolin" || scope === "taichi" ? [scope] : ["shaolin", "taichi"]);
    const examRead = state.queries.find(entry => entry.table === "user_plan_items");
    assert.deepEqual(examRead.filters, [["user_id", userId], ["source", "exam_program"], ["is_hidden", false]]);
  }
  for (const discipline of ["shaolin", "taichi"]) {
    reset({ items: [{ user_id: userId, source: "exam_program", is_hidden: false, skill: [{ discipline }] }] });
    assert.deepEqual((await save()).exam_disciplines, [discipline]);
    reset({ items: [{ user_id: userId, source: "exam_program", is_hidden: false, skill: { discipline } }] });
    await reject({ exam_discipline_scope: discipline === "shaolin" ? "taichi" : "shaolin" }, "disciplineNotInExam");
  }
  reset({ items: [
    { user_id: userId, source: "exam_program", is_hidden: true, skill: { discipline: "shaolin" } },
    { user_id: userId, source: "manual", is_hidden: false, skill: { discipline: "shaolin" } },
    { user_id: "other-user", source: "exam_program", is_hidden: false, skill: { discipline: "shaolin" } },
    { user_id: userId, source: "exam_program", is_hidden: false, skill: null },
  ] });
  await reject({}, "emptyActiveExam");
  for (const scope of ["both", "shaolin", "taichi"]) {
    reset({ profile: { id: userId, plan_mode: "custom" }, items: [] });
    assert.deepEqual((await save({ exam_discipline_scope: scope })).exam_disciplines, ["shaolin", "taichi"]);
    assert.equal(state.queries.some(entry => entry.table === "user_plan_items"), false);
  }

  const invalid = [
    [{ weekdays: [] }, "selectDay"],
    ...[0, 8, -1, 1.5, "abc", "Infinity"].map(day => [{ weekdays: [1, day] }, "invalidDays"]),
    ...[0, 3, 5, 1.5, "abc", "Infinity", null].map(cadence => [{ cadence_weeks: cadence }, "invalidCadence"]),
    ...[0, 11, -1, 1.5, "abc", "Infinity", null].map(reps => [{ reps_per_form: reps }, "repsOutOfRange"]),
    ...[0, 1, 6, 13, "abc", "Infinity", null].map(duration => [{ duration_weeks: duration }, "invalidDuration"]),
    [{ exam_discipline_scope: "unknown" }, "invalidExamScope"],
  ];
  for (const [values, message] of invalid) {
    reset();
    await reject(values, message);
    assert.equal(state.queries.length, 0);
  }
  reset({ user: null });
  await reject({}, "unauthenticated");
  assert.equal(state.queries.length, 0);
  reset({ profile: null });
  await reject({}, "profileNotFoundPeriod");
  for (const table of ["user_profiles", "user_plan_items", "training_schedule"]) {
    reset({ errors: { [`${table}:${table === "training_schedule" ? "upsert" : "select"}`]: "Fixture database error" } });
    await reject({}, "Fixture database error");
  }

  reset();
  assert.deepEqual(await resetTrainingSchedule(), { success: true });
  assert.equal(state.schedule, null);
  assert.deepEqual(state.writes[0].filters, [["user_id", userId]]);
  assert.deepEqual(state.revalidated, ["/today", "/calendar", "/sessions/setup"]);
  checks++;
  reset({ user: null });
  assert.deepEqual(await resetTrainingSchedule(), { error: "unauthenticated" });
  assert.equal(state.queries.length, 0);
  checks++;
  reset({ errors: { "training_schedule:delete": "Fixture deletion error" } });
  assert.deepEqual(await resetTrainingSchedule(), { error: "Fixture deletion error" });
  assert.deepEqual(state.revalidated, []);
  checks++;

  function existingLog(overrides = {}) {
    return { id: "existing-log", user_id: userId, skill_id: skillId, date: state.today, reps_target: null, reps_done: 0, completed: false, personal_note: "Preserve this note", ...overrides };
  }
  reset();
  state.logs.push(existingLog());
  assert.deepEqual(await incrementRep(skillId), { success: true });
  assert.equal(state.logs[0].reps_done, 1);
  assert.equal(state.logs[0].reps_target, 3, "first repetition snapshots the target on an existing note-only log");
  assert.equal(state.logs[0].completed, false);
  assert.equal(state.logs[0].personal_note, "Preserve this note");
  state.schedule.reps_per_form = 10;
  await incrementRep(skillId);
  await incrementRep(skillId);
  await incrementRep(skillId);
  assert.equal(state.logs[0].reps_done, 3);
  assert.equal(state.logs[0].reps_target, 3, "changing schedule reps preserves an existing daily target");
  assert.equal(state.logs[0].completed, true);
  await decrementRep(skillId);
  assert.equal(state.logs[0].reps_done, 2);
  assert.equal(state.logs[0].completed, false);
  await incrementRep(skillId);
  assert.equal(state.logs[0].completed, true);
  for (let index = 0; index < 5; index++) await decrementRep(skillId);
  assert.equal(state.logs[0].reps_done, 0);
  assert.equal(state.logs[0].personal_note, "Preserve this note");
  checks++;

  reset();
  state.logs.push(existingLog({ completed: true }));
  await incrementRep(skillId);
  assert.equal(state.logs[0].completed, true, "an explicit completion survives a partial repetition");
  assert.equal(state.logs[0].reps_target, 3);
  checks++;
  for (const target of [1, 3, 10]) {
    reset({ schedule: { user_id: userId, reps_per_form: target } });
    for (let index = 1; index <= target + 1; index++) {
      assert.deepEqual(await incrementRep(skillId), { success: true });
      assert.equal(state.logs.length, 1);
      assert.equal(state.logs[0].reps_target, target);
      assert.equal(state.logs[0].reps_done, Math.min(index, target));
      assert.equal(state.logs[0].completed, index >= target);
    }
    checks++;
  }
  reset({ schedule: null });
  await incrementRep(skillId);
  assert.equal(state.logs[0].reps_target, 1);
  assert.equal(state.logs[0].completed, true);
  checks++;
  for (const [errors, expected] of [
    [{ "training_schedule:select": "No schedule" }, "repsTargetLoadFailed"],
    [{ "practice_logs:select": "No logs" }, "No logs"],
    [{ "practice_logs:insert": "Cannot insert" }, "Cannot insert"],
  ]) {
    reset({ errors });
    assert.deepEqual(await incrementRep(skillId), { error: expected });
    assert.equal(state.writes.length, 0);
    assert.deepEqual(state.revalidated, []);
    checks++;
  }
  reset({ errors: { "practice_logs:update": "Cannot update" } });
  state.logs.push(existingLog({ reps_target: 3 }));
  assert.deepEqual(await incrementRep(skillId), { error: "Cannot update" });
  assert.equal(state.logs[0].reps_done, 0);
  assert.deepEqual(state.revalidated, []);
  checks++;
  reset({ user: null });
  assert.deepEqual(await incrementRep(skillId), { error: "sessionExpired" });
  assert.deepEqual(await decrementRep(skillId), { error: "sessionExpired" });
  assert.equal(state.queries.length, 0);
  checks++;

  function resetCalendar(overrides = {}) {
    reset({
      schedule: { user_id: userId, reps_per_form: 10, weekdays: [3], cadence_weeks: 1, exam_disciplines: ["shaolin"], start_date: "2026-11-11", end_date: "2026-12-08" },
      items: [{ id: "calendar-plan-item", skill_id: skillId, user_id: userId, source: "exam_program", status: "focus", is_hidden: false, skill: { id: skillId, discipline: "shaolin", category: "forme", display_order: 0 } }],
      ...overrides,
    });
  }
  resetCalendar();
  state.logs.push(existingLog({ reps_target: 3, reps_done: 1 }));
  assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { success: true });
  assert.equal(state.logs.length, 1);
  assert.equal(state.logs[0].reps_target, 3, "calendar completion preserves the saved daily target after settings change");
  assert.equal(state.logs[0].reps_done, 3);
  assert.equal(state.logs[0].completed, true);
  assert.equal(state.logs[0].personal_note, "Preserve this note");
  assert.deepEqual(state.revalidated, ["/calendar", "/progress", "/today"]);
  assert.equal(state.rpcs.length, 1);
  checks++;

  resetCalendar();
  state.logs.push(existingLog({ reps_done: 1 }));
  assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { success: true });
  assert.equal(state.logs[0].reps_target, 10, "calendar completion snapshots the current target on a note-only log");
  assert.equal(state.logs[0].reps_done, 10);
  assert.equal(state.logs[0].personal_note, "Preserve this note");
  checks++;

  resetCalendar();
  assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { success: true });
  assert.equal(state.logs[0].reps_target, 10);
  assert.equal(state.logs[0].reps_done, 10);
  assert.equal(state.logs[0].completed, true);
  checks++;

  resetCalendar({ schedule: null });
  state.logs.push(existingLog({ reps_target: 3, reps_done: 1 }));
  assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { success: true });
  assert.equal(state.logs[0].reps_target, 3, "historical daily targets survive deletion of the schedule");
  assert.equal(state.logs[0].reps_done, 3);
  checks++;

  for (const [errors, message] of [
    [{ "training_schedule:select": "Calendar schedule unavailable" }, "Calendar schedule unavailable"],
    [{ "practice_logs:select": "Calendar log unavailable" }, "Calendar log unavailable"],
    [{ "practice_logs:upsert": "Calendar save unavailable" }, "Calendar save unavailable"],
  ]) {
    resetCalendar({ errors });
    state.logs.push(existingLog({ reps_target: 3, reps_done: 1 }));
    const before = structuredClone(state.logs);
    assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { error: message });
    assert.deepEqual(state.logs, before);
    assert.equal(state.writes.length, 0);
    assert.equal(state.rpcs.length, 0);
    assert.deepEqual(state.revalidated, []);
    checks++;
  }
  resetCalendar({ user: null });
  assert.deepEqual(await setPracticeCompletionForDate(skillId, state.today, true), { error: "sessionExpired" });
  assert.equal(state.queries.length, 0);
  checks++;
  for (const [date, message] of [["2026-11-12", "noFuturePractice"], ["2026-02-30", "invalidDate"]]) {
    resetCalendar();
    assert.deepEqual(await setPracticeCompletionForDate(skillId, date, true), { error: message });
    assert.equal(state.queries.length, 0);
    checks++;
  }

  console.log(`PASS: ${checks} server scenarios, including 15,240 day/cycle/repetition/duration combinations, discipline/source/hidden filters, inclusive dates across DST and leap years, validation, auth/database failures, reset, persistent daily repetition targets and calendar completion. Actual actions and scheduler; mocked I/O, no network or production writes.`);
} finally {
  delete globalThis.__trainingTest;
  assert.ok(path.resolve(temporary).startsWith(path.resolve(results) + path.sep));
  await fs.rm(temporary, { recursive: true, force: true });
}
