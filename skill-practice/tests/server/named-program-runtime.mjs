import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(path.join(path.dirname(app), "tools/video/package.json"));
const { build } = requireTools("esbuild");
const results = path.join(app, "test-results");
await fs.mkdir(results, { recursive: true });
const temporary = await fs.mkdtemp(path.join(results, "named-runtime-"));
const userId = "runtime-owner";
const today = "2026-11-11";
let checks = 0;

try {
  const mocks = {
    "empty.ts": "",
    "supabase.ts": "export const createClient = async () => globalThis.__namedRuntime.client; export const createAdminClient = () => globalThis.__namedRuntime.client;",
    "programs.ts": "export const getActiveCustomProgramId = async () => { globalThis.__namedRuntime.activeReads++; return globalThis.__namedRuntime.activeProgram; };",
    "intl.ts": "export const getLocale = async () => 'it'; export const getTranslations = async () => key => key;",
    "cache.ts": "export const revalidatePath = path => globalThis.__namedRuntime.revalidated.push(path);",
    "date.ts": `export {dateKeyDaysAgo} from ${JSON.stringify(path.join(app, "src/lib/date.ts"))}; export const localDateKey = () => '${today}';`,
    "push.ts": "export class WebPushError extends Error {} export default {sendNotification: async (...args) => globalThis.__namedRuntime.sent.push(args)};",
  };
  for (const [name, source] of Object.entries(mocks)) await fs.writeFile(path.join(temporary, name), source);
  await build({
    stdin: { contents: "export * from '@/lib/queries/plan'; export {getActiveCycleProgress} from '@/lib/queries/progress'; export {addFreePracticeForDate} from '@/lib/actions/calendar'; export {sendDueTrainingReminders} from '@/lib/training-reminder-sender';", resolveDir: app },
    outfile: path.join(temporary, "bundle.mjs"), bundle: true, platform: "node", format: "esm", logLevel: "silent",
    alias: {
      "@": path.join(app, "src"),
      "server-only": path.join(temporary, "empty.ts"),
      "@/lib/supabase/server": path.join(temporary, "supabase.ts"),
      "@/lib/supabase/admin": path.join(temporary, "supabase.ts"),
      "@/lib/queries/custom-programs": path.join(temporary, "programs.ts"),
      "@/lib/date": path.join(temporary, "date.ts"),
      "next-intl/server": path.join(temporary, "intl.ts"),
      "next/cache": path.join(temporary, "cache.ts"),
      "web-push": path.join(temporary, "push.ts"),
    },
  });
  const api = await import(pathToFileURL(path.join(temporary, "bundle.mjs")));
  const state = (globalThis.__namedRuntime = {});
  const skill = (id, display_order = 0) => ({ id, name: id, discipline: "shaolin", category: "forme", display_order, translations: null });
  const item = (id, program, over = {}) => ({ id: `${program}-${id}`, user_id: userId, skill_id: id, source: program === null ? "exam_program" : "manual", custom_program_id: program, status: "focus", is_hidden: false, skill: skill(id), ...over });
  const log = (id, over = {}) => ({ id: `log-${id}`, user_id: userId, skill_id: id, date: today, completed: true, reps_done: 3, reps_target: 3, personal_note: null, ...over });
  function reset(overrides = {}) {
    Object.assign(state, {
      activeProgram: "program-a", activeReads: 0, queries: [], writes: [], sent: [], revalidated: [], errors: {},
      profile: { id: userId, plan_mode: "custom", active_custom_program_id: "program-a" },
      items: [item("shared", "program-a"), item("shared", "program-b", { status: "maintenance" }), item("other", "program-b"), item("exam", null), item("hidden", "program-a", { is_hidden: true }), item("foreign", "program-a", { user_id: "other-owner" })],
      schedule: { user_id: userId, weekdays: [1, 2, 3, 4, 5, 6, 7], cadence_weeks: 1, reps_per_form: 3, exam_disciplines: ["shaolin", "taichi"], start_date: today, end_date: "2026-11-17" },
      logs: [],
      preferences: [{ user_id: userId, training_reminders_enabled: true, reminder_time: "11:00", time_zone: "Europe/Rome", locale: "it", include_exercise_names: true }],
      subscriptions: [{ id: "subscription", user_id: userId, endpoint: "https://fcm.googleapis.com/fcm/send/runtime", p256dh: "fixture-key", auth: "fixture-auth", revoked_at: null }],
      ...overrides,
    });
  }
  function query(table) {
    const request = { table, kind: "select", filters: [] };
    const chain = {
      select(columns, options) { request.columns = columns; request.options = options; return chain; },
      eq(column, value) { request.filters.push([column, "eq", value]); return chain; },
      is(column, value) { request.filters.push([column, "eq", value]); return chain; },
      gte(column, value) { request.filters.push([column, "gte", value]); return chain; },
      lte(column, value) { request.filters.push([column, "lte", value]); return chain; },
      or(value) { request.or = value; return chain; },
      order() { return chain; },
      insert(payload) { request.kind = "insert"; request.payload = payload; return chain; },
      update(payload) { request.kind = "update"; request.payload = payload; return chain; },
      upsert(payload) { request.kind = "upsert"; request.payload = payload; return chain; },
      maybeSingle: async () => execute(true),
      then(resolve, reject) { return Promise.resolve().then(() => execute(false)).then(resolve, reject); },
    };
    function execute(single) {
      state.queries.push(structuredClone(request));
      const message = state.errors[table];
      if (message) return { data: null, error: { message } };
      if (request.kind !== "select") {
        state.writes.push(structuredClone(request));
        if (table === "notification_deliveries") return { data: { id: "delivery" }, error: null };
        if (table === "practice_logs") {
          const index = state.logs.findIndex(row => ["user_id", "skill_id", "date"].every(column => row[column] === request.payload[column]));
          if (index >= 0) state.logs[index] = { ...state.logs[index], ...request.payload };
          else state.logs.push({ id: "created-log", reps_target: null, reps_done: 0, ...request.payload });
        }
        return { data: null, error: null };
      }
      const rows = table === "user_plan_items" ? state.items : table === "user_profiles" ? [state.profile].filter(Boolean)
        : table === "practice_logs" ? state.logs : table === "training_schedule" ? [state.schedule].filter(Boolean)
        : table === "notification_preferences" ? state.preferences : table === "push_subscriptions" ? state.subscriptions
        : assert.fail(`Unexpected table ${table}`);
      const matches = row => request.filters.every(([column, op, value]) => op === "eq" ? row[column] === value : op === "gte" ? row[column] >= value : row[column] <= value)
        && (!request.or || request.or.split(",").some(clause => { const [column, , value] = clause.split("."); return row[column] === value; }));
      const filtered = rows.filter(matches);
      return { data: request.options?.head ? null : single ? filtered[0] ?? null : filtered, count: filtered.length, error: null };
    }
    return chain;
  }
  state.client = { from: query, auth: { getUser: async () => ({ data: { user: { id: userId } } }) }, rpc: async () => ({ error: null }) };

  reset();
  assert.deepEqual((await api.getUserPlanItems(userId, undefined, "manual")).map(row => row.id), ["program-a-shared"]);
  assert.equal(await api.getUserPlanCount(userId, "manual"), 1);
  assert.deepEqual([...(await api.getSelectedSkillIds(userId, "manual"))], ["shared"]);
  checks += 3;

  reset();
  assert.deepEqual((await api.getUserPlanItems(userId, undefined, "manual", "program-b")).map(row => row.id), ["program-b-shared", "program-b-other"]);
  assert.equal(await api.getUserPlanCount(userId, "manual", "program-b"), 2);
  assert.deepEqual([...(await api.getSelectedSkillIds(userId, "manual", "program-b"))], ["shared", "other"]);
  assert.equal(state.activeReads, 0, "previewing a program must not resolve or change the active selection");
  assert.equal(state.writes.length, 0);
  checks += 3;

  reset();
  assert.deepEqual((await api.getUserPlanItems(userId)).map(row => row.id), ["program-a-shared", "null-exam"]);
  assert.deepEqual((await api.getUserPlanItemsBySkill(userId, "shared")).map(row => row.id), ["program-a-shared"]);
  assert.equal((await api.getUserPlanItemBySkill(userId, "shared")).status, "focus");
  assert.equal(await api.getUserPlanCount(userId), 2);
  assert.deepEqual([...(await api.getSelectedSkillIds(userId))], ["shared", "exam"]);
  checks += 5;

  reset({ activeProgram: null });
  assert.deepEqual(await api.getUserPlanItems(userId, undefined, "manual"), []);
  assert.equal(await api.getUserPlanCount(userId, "manual"), 0);
  assert.equal((await api.getSelectedSkillIds(userId, "manual")).size, 0);
  assert.deepEqual((await api.getUserPlanItems(userId)).map(row => row.skill_id), ["exam"]);
  assert.deepEqual(await api.getUserPlanItemsBySkill(userId, "shared"), []);
  checks += 5;

  reset();
  assert.deepEqual((await api.getUserPlanItems(userId, undefined, "exam_program")).map(row => row.skill_id), ["exam"]);
  assert.equal(state.activeReads, 0, "exam reads do not require a custom program");
  assert.deepEqual(await api.getUserPlanItems(userId, undefined, "manual", null), []);
  assert.equal(state.activeReads, 0);
  checks += 2;

  const active = item("z-active", "program-a", { skill: skill("z-active", 10) });
  const inactive = item("a-inactive", "program-b");
  reset({ items: [inactive, active], logs: [log("z-active")], activeProgram: "program-b" });
  const progress = await api.getActiveCycleProgress(userId, state.profile);
  assert.equal(progress.respectedUntilToday, 1, "only the active program determines whether today's session is completed");
  assert.equal(state.activeReads, 0, "progress uses the provided profile program");
  checks++;

  reset({ items: [inactive, active] });
  assert.deepEqual(await api.addFreePracticeForDate("a-inactive", today), { success: true });
  assert.equal(state.logs[0].reps_target, null, "a skill scheduled only by an inactive program remains free practice");
  assert.equal(state.logs[0].completed, true);
  assert.ok(state.queries.find(row => row.table === "user_plan_items").filters.some(([column, , value]) => column === "custom_program_id" && value === "program-a"));
  checks++;

  reset({ items: [inactive, active] });
  assert.deepEqual(await api.addFreePracticeForDate("z-active", today), { success: true });
  assert.equal(state.logs[0].reps_target, 3);
  checks++;

  const savedEnvironment = Object.fromEntries(["VAPID_SUBJECT", "NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"].map(key => [key, process.env[key]]));
  Object.assign(process.env, { VAPID_SUBJECT: "mailto:fixture@example.test", NEXT_PUBLIC_VAPID_PUBLIC_KEY: "fixture-public", VAPID_PRIVATE_KEY: "fixture-private" });
  try {
    reset({ items: [inactive, active] });
    const result = await api.sendDueTrainingReminders(new Date("2026-11-11T10:00:00Z"));
    assert.equal(result.sent, 1);
    assert.equal(state.sent.length, 1);
    const payload = JSON.parse(state.sent[0][1]);
    assert.match(payload.body, /z-active/);
    assert.doesNotMatch(payload.body, /a-inactive/);
    checks++;
    reset({ profile: { id: userId, plan_mode: "custom", active_custom_program_id: null }, items: [inactive, active] });
    const missing = await api.sendDueTrainingReminders(new Date("2026-11-11T10:00:00Z"));
    assert.equal(missing.skipped, 1);
    assert.equal(state.sent.length, 0);
    assert.equal(state.queries.filter(row => row.table === "user_plan_items").length, 0);
    checks++;
    reset({ profile: { id: userId, plan_mode: "exam", active_custom_program_id: null }, items: [inactive, item("exam", null)] });
    assert.equal((await api.sendDueTrainingReminders(new Date("2026-11-11T10:00:00Z"))).sent, 1);
    assert.match(JSON.parse(state.sent[0][1]).body, /exam/);
    checks++;
  } finally {
    for (const [key, value] of Object.entries(savedEnvironment)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  console.log(`PASS: ${checks} named-program runtime scenarios: active/explicit/null scopes, exam and owner isolation, selected/count/by-skill queries, progress, calendar free/scheduled classification and reminder payloads. Real runtime modules, mocked I/O; no network, database or push delivery.`);
} finally {
  delete globalThis.__namedRuntime;
  assert.ok(path.resolve(temporary).startsWith(path.resolve(results) + path.sep));
  await fs.rm(temporary, { recursive: true, force: true });
}
