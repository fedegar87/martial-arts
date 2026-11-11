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
const temporary = await fs.mkdtemp(path.join(results, "named-program-actions-"));
const ids = Array.from({ length: 6 }, (_, i) => `${String(i + 1).repeat(8)}-${String(i + 1).repeat(4)}-${String(i + 1).repeat(4)}-${String(i + 1).repeat(4)}-${String(i + 1).repeat(12)}`);
const [programA, programB, foreignProgram, createdProgram, skillA, skillB] = ids;
const owner = "owner";
const scenarios = [];
const failures = [];
try {
  const mocks = {
    "supabase.ts": "export const createClient = async () => globalThis.__namedProgramActions.client;",
    "intl.ts": "export const getTranslations = async () => key => key;",
    "cache.ts": "export const revalidatePath = path => globalThis.__namedProgramActions.revalidated.push(path);",
    "navigation.ts": "export const redirect = path => { const error = new Error('TEST_REDIRECT'); error.destination = path; throw error; };",
    "queries.ts": `
      export const getActiveCustomProgramId = async userId => {
        const state = globalThis.__namedProgramActions;
        state.reads.push({ kind: 'active', userId });
        return state.profile.id === userId ? state.profile.active_custom_program_id : null;
      };
      export const getCustomProgram = async (userId, id) => {
        const state = globalThis.__namedProgramActions;
        state.reads.push({ kind: 'program', userId, id });
        return state.programs.find(p => p.user_id === userId && p.id === id) ?? null;
      };
    `,
  };
  for (const [name, contents] of Object.entries(mocks)) await fs.writeFile(path.join(temporary, name), contents);
  await build({
    stdin: {
      contents: "export * from '@/lib/actions/custom-programs'; export {addSkillToPlan,removeSkillFromPlan,saveCustomSelectionFromForm,deleteCustomSelection} from '@/lib/actions/plan';",
      resolveDir: app,
    },
    outfile: path.join(temporary, "bundle.mjs"), bundle: true, platform: "node", format: "esm", logLevel: "silent",
    alias: {
      "@": path.join(app, "src"),
      "@/lib/supabase/server": path.join(temporary, "supabase.ts"),
      "@/lib/queries/custom-programs": path.join(temporary, "queries.ts"),
      "next-intl/server": path.join(temporary, "intl.ts"),
      "next/cache": path.join(temporary, "cache.ts"),
      "next/navigation": path.join(temporary, "navigation.ts"),
    },
  });
  const actions = await import(pathToFileURL(path.join(temporary, "bundle.mjs")));
  const state = (globalThis.__namedProgramActions = {});
  const form = values => {
    const data = new FormData();
    for (const [name, value] of Object.entries(values)) {
      for (const entry of Array.isArray(value) ? value : [value]) if (entry !== null) data.append(name, entry);
    }
    return data;
  };
  const snapshot = () => structuredClone({ profile: state.profile, programs: state.programs, items: state.items, schedule: state.schedule });
  const reset = (overrides = {}) => Object.assign(state, {
    user: { id: owner },
    profile: { id: owner, plan_mode: "exam", active_custom_program_id: programA },
    programs: [{ id: programA, user_id: owner, name: "General" }, { id: programB, user_id: owner, name: "Weapons" }, { id: foreignProgram, user_id: "other", name: "Foreign" }],
    items: [
      { user_id: owner, source: "manual", custom_program_id: programA, skill_id: skillA, discipline: "shaolin", status: "focus" },
      { user_id: owner, source: "manual", custom_program_id: programB, skill_id: skillA, discipline: "shaolin", status: "maintenance" },
      { user_id: owner, source: "manual", custom_program_id: programB, skill_id: skillB, discipline: "taichi", status: "focus" },
      { user_id: owner, source: "exam_program", custom_program_id: null, skill_id: skillA, discipline: "shaolin", status: "focus" },
      { user_id: "other", source: "manual", custom_program_id: foreignProgram, skill_id: skillA, discipline: "shaolin", status: "focus" },
    ],
    schedule: { weekdays: [1, 3, 5], cadence_weeks: 2, reps_per_form: 3, start_date: "2026-11-01", end_date: "2027-01-23" },
    rpcs: [], reads: [], writes: [], revalidated: [], authCalls: 0, rpcError: null, tableError: null,
    createResult: createdProgram,
    ...overrides,
  });
  state.client = {
    auth: { getUser: async () => { state.authCalls++; return { data: { user: state.user } }; } },
    rpc: async (name, payload) => {
      state.rpcs.push({ name, payload });
      if (!state.user) return { data: null, error: { message: "Not authenticated" } };
      if (state.rpcError) return { data: null, error: typeof state.rpcError === "string" ? { message: state.rpcError } : state.rpcError };
      const program = state.programs.find(p => p.id === payload.p_program_id && p.user_id === state.user.id);
      if (!["create_custom_program", "add_skill_to_custom_program"].includes(name) && !program) return { error: { message: "Custom program not found" } };
      if (name === "create_custom_program") {
        if (state.createResult === createdProgram) state.programs.push({ id: createdProgram, user_id: state.user.id, name: payload.p_name });
        return { data: state.createResult, error: null };
      }
      if (name === "rename_custom_program") program.name = payload.p_name;
      else if (name === "delete_custom_program") {
        if (state.profile.plan_mode === "custom" && state.profile.active_custom_program_id === program.id) return { error: { message: "Cannot delete the active custom program" } };
        state.programs = state.programs.filter(p => p.id !== program.id);
        state.items = state.items.filter(item => item.custom_program_id !== program.id);
      } else if (name === "activate_custom_program") {
        state.profile.plan_mode = "custom"; state.profile.active_custom_program_id = program.id;
      } else if (name === "save_named_custom_selection") {
        state.items = state.items.filter(item => item.custom_program_id !== program.id || item.discipline !== payload.p_discipline || payload.p_skill_ids.includes(item.skill_id));
        for (const id of payload.p_skill_ids) {
          if (!state.items.some(item => item.custom_program_id === program.id && item.skill_id === id)) {
            state.items.push({ user_id: owner, source: "manual", custom_program_id: program.id, skill_id: id, discipline: payload.p_discipline, status: "maintenance" });
          }
        }
      } else if (name === "update_named_custom_item_status") {
        state.items.find(item => item.custom_program_id === program.id && item.skill_id === payload.p_skill_id).status = payload.p_status;
      } else if (name === "add_skill_to_custom_program") {
        const existing = state.items.find(item => item.user_id === owner && item.custom_program_id === state.profile.active_custom_program_id && item.skill_id === payload.p_skill_id);
        if (existing) existing.status = payload.p_status;
      } else assert.fail(`Unexpected RPC ${name}`);
      return { data: null, error: null };
    },
    from: table => {
      assert.equal(table, "user_plan_items");
      const request = { table, filters: [] };
      const chain = {
        delete: () => chain,
        eq: (column, value) => { request.filters.push([column, value]); return chain; },
        then: (resolve, reject) => Promise.resolve().then(() => {
          if (state.tableError) return { error: { message: state.tableError } };
          state.writes.push(structuredClone(request));
          state.items = state.items.filter(item => !request.filters.every(([key,value]) => item[key] === value));
          return { error: null };
        }).then(resolve, reject),
      };
      return chain;
    },
  };
  const scenario = async (name, run) => {
    reset();
    try { await run(); scenarios.push(name); }
    catch (error) { failures.push(`${name}: ${error.message}`); }
  };
  const expectRedirect = async (promise, destination) => assert.rejects(promise, error => {
    assert.equal(error.message, "TEST_REDIRECT"); assert.equal(error.destination, destination); return true;
  });
  const expectCaches = () => {
    for (const route of ["/programma", "/today", "/calendar", "/sessions/setup", "/progress", "/library"]) {
      assert.ok(state.revalidated.includes(route), `${route} must be revalidated`);
    }
  };
  const unchanged = before => { assert.deepEqual(snapshot(), before); assert.deepEqual(state.revalidated, []); };

  await scenario("create named program without activating", async () => {
    const profile = structuredClone(state.profile), schedule = structuredClone(state.schedule);
    await expectRedirect(actions.createCustomProgramFromForm(null, form({ name: "  Sabato  " })), `/plan/custom?program=${createdProgram}`);
    assert.deepEqual(state.rpcs, [{ name: "create_custom_program", payload: { p_name: "Sabato" } }]);
    assert.deepEqual(state.profile, profile); assert.deepEqual(state.schedule, schedule); expectCaches();
  });
  for (const name of ["", "   ", "x".repeat(61), "New\nline"]) await scenario(`invalid name ${JSON.stringify(name)}`, async () => {
    const before = snapshot();
    assert.deepEqual(await actions.createCustomProgramFromForm(null, form({ name })), { error: "customProgramNameInvalid" });
    assert.equal(state.rpcs.length, 0); unchanged(before);
  });
  await scenario("create unconfirmed result does not redirect or invalidate", async () => {
    state.createResult = null;
    assert.deepEqual(await actions.createCustomProgramFromForm(null, form({ name: "Missing" })), { error: "saveUnconfirmed" });
    assert.deepEqual(state.revalidated, []);
  });
  for (const method of ["createCustomProgramFromForm", "renameCustomProgramFromForm"]) await scenario(`duplicate name ${method}`, async () => {
    state.rpcError = { code: "23505", message: "duplicate key violates custom_programs_owner_name_key" };
    const before = snapshot();
    assert.deepEqual(await actions[method](null,form({program_id:programB,name:"Duplicate"})),{error:"customProgramNameTaken"});
    unchanged(before);
  });
  await scenario("rename inactive program without activating", async () => {
    const profile = structuredClone(state.profile);
    await expectRedirect(actions.renameCustomProgramFromForm(null, form({ program_id: programB, name: "  Armi  " })), `/programma?program=${programB}`);
    assert.deepEqual(state.rpcs[0], { name: "rename_custom_program", payload: { p_program_id: programB, p_name: "Armi" } });
    assert.deepEqual(state.profile, profile); expectCaches();
  });
  await scenario("delete inactive program scoped to its items", async () => {
    const protectedItems = state.items.filter(item => item.custom_program_id !== programB);
    await expectRedirect(actions.deleteCustomProgramFromForm(null, form({ program_id: programB })), "/programma");
    assert.deepEqual(state.items, protectedItems); expectCaches();
  });
  await scenario("delete active program reports localized guidance", async () => {
    state.profile.plan_mode = "custom"; const before = snapshot();
    assert.deepEqual(await actions.deleteCustomProgramFromForm(null, form({ program_id: programA })), { error: "customProgramActiveDelete" });
    unchanged(before);
  });
  await scenario("activate changes only selected program and mode", async () => {
    const before = snapshot();
    await expectRedirect(actions.activateCustomProgramFromForm(form({ program_id: programB })), `/programma?program=${programB}`);
    assert.equal(state.profile.plan_mode, "custom"); assert.equal(state.profile.active_custom_program_id, programB);
    assert.deepEqual(state.schedule, before.schedule); assert.deepEqual(state.items, before.items); expectCaches();
  });
  await scenario("change inactive status does not mutate active or exam items", async () => {
    const before = snapshot();
    assert.deepEqual(await actions.updateCustomProgramItemStatus(programB,skillA,"focus"), { success: true });
    assert.deepEqual(state.items.filter(item => item.custom_program_id !== programB), before.items.filter(item => item.custom_program_id !== programB));
    assert.deepEqual(state.profile, before.profile); expectCaches();
  });
  for (const [id,skill,status] of [["bad",skillA,"focus"],[programB,"bad","focus"],[programB,skillA,"review"]]) await scenario(`invalid status parameters ${id}/${skill}/${status}`, async () => {
    const before = snapshot(); assert.deepEqual(await actions.updateCustomProgramItemStatus(id,skill,status), { error: "invalidProgramSelection" });
    assert.equal(state.rpcs.length,0); unchanged(before);
  });
  for (const method of ["renameCustomProgramFromForm","deleteCustomProgramFromForm"]) await scenario(`invalid id ${method}`, async () => {
    const before = snapshot(); assert.deepEqual(await actions[method](null,form({ program_id: "bad",name: "Valid" })), { error: "invalidProgramSelection" });
    assert.equal(state.rpcs.length,0); unchanged(before);
  });
  await scenario("invalid activation id never calls RPC", async () => {
    await assert.rejects(actions.activateCustomProgramFromForm(form({program_id:"bad"})),/invalidProgramSelection/); assert.equal(state.rpcs.length,0);
  });
  await scenario("save inactive named selection preserves mode and program", async () => {
    const before = snapshot();
    await expectRedirect(actions.saveCustomSelectionFromForm(null,form({ program_id:programB,discipline:"shaolin",skillIds:[skillA] })), `/programma?d=shaolin&program=${programB}`);
    assert.deepEqual(state.rpcs[0], { name:"save_named_custom_selection",payload:{p_program_id:programB,p_skill_ids:[skillA],p_discipline:"shaolin"} });
    assert.deepEqual(state.profile,before.profile); assert.deepEqual(state.schedule,before.schedule); expectCaches();
  });
  for (const values of [{program_id:"bad",discipline:"shaolin"},{program_id:programB,discipline:"invalid"},{program_id:programB,discipline:"shaolin",skillIds:["invalid-skill-id"]}]) await scenario(`invalid save selection ${JSON.stringify(values)}`, async () => {
    assert.deepEqual(await actions.saveCustomSelectionFromForm(null,form(values)),{error:"invalidProgramSelection"}); assert.equal(state.rpcs.length,0);
  });
  await scenario("add skill uses named-program RPC and invalidates all views", async () => {
    const before = snapshot(); assert.deepEqual(await actions.addSkillToPlan(skillA,"maintenance"),{success:true});
    assert.deepEqual(state.rpcs,[{name:"add_skill_to_custom_program",payload:{p_skill_id:skillA,p_status:"maintenance"}}]);
    assert.deepEqual(state.profile,before.profile); assert.deepEqual(state.items.filter(i=>i.custom_program_id!==programA),before.items.filter(i=>i.custom_program_id!==programA)); expectCaches();
  });
  await scenario("remove skill restricts owner/source/program/skill", async () => {
    const before = snapshot(); assert.deepEqual(await actions.removeSkillFromPlan(skillA),{success:true});
    assert.deepEqual(state.writes[0].filters,[['user_id',owner],['skill_id',skillA],['source','manual'],['custom_program_id',programA]]);
    assert.deepEqual(state.items,before.items.filter(i=>!(i.user_id===owner&&i.source==='manual'&&i.custom_program_id===programA&&i.skill_id===skillA))); expectCaches();
  });
  await scenario("clear explicitly viewed inactive program only", async () => {
    const before=snapshot(); assert.deepEqual(await actions.deleteCustomSelection(programB),{success:true});
    assert.deepEqual(state.writes[0].filters,[['user_id',owner],['source','manual'],['custom_program_id',programB]]);
    assert.deepEqual(state.items,before.items.filter(i=>i.custom_program_id!==programB)); assert.deepEqual(state.profile,before.profile); expectCaches();
  });
  await scenario("clear default program uses active id", async () => {
    assert.deepEqual(await actions.deleteCustomSelection(),{success:true}); assert.deepEqual(state.writes[0].filters.at(-1),['custom_program_id',programA]); expectCaches();
  });
  await scenario("cannot clear another owner's program", async () => {
    const before=snapshot(); assert.deepEqual(await actions.deleteCustomSelection(foreignProgram),{error:"customProgramNotFound"}); assert.equal(state.writes.length,0); unchanged(before);
  });
  await scenario("remove missing active program cannot clear other programs", async () => {
    state.profile.active_custom_program_id=null; const before=snapshot(); assert.deepEqual(await actions.removeSkillFromPlan(skillA),{error:"customProgramNotFound"}); assert.equal(state.writes.length,0); unchanged(before);
  });

  const authenticatedCalls = [
    ['create',()=>actions.createCustomProgramFromForm(null,form({name:'New'}))],
    ['rename',()=>actions.renameCustomProgramFromForm(null,form({program_id:programB,name:'New'}))],
    ['delete',()=>actions.deleteCustomProgramFromForm(null,form({program_id:programB}))],
    ['status',()=>actions.updateCustomProgramItemStatus(programB,skillA,'focus')],
    ['save',()=>actions.saveCustomSelectionFromForm(null,form({program_id:programB,discipline:'shaolin',skillIds:[skillA]}))],
    ['add',()=>actions.addSkillToPlan(skillA)],
    ['remove',()=>actions.removeSkillFromPlan(skillA)],
    ['clear',()=>actions.deleteCustomSelection(programB)],
  ];
  for(const [name,call] of authenticatedCalls) await scenario(`anonymous rejection ${name}`,async()=>{
    state.user=null;const before=snapshot();assert.deepEqual(await call(),{error:'sessionExpired'});assert.equal(state.rpcs.length,0);assert.equal(state.writes.length,0);unchanged(before);
  });
  await scenario('anonymous activation redirects to login',async()=>{
    state.user=null;await expectRedirect(actions.activateCustomProgramFromForm(form({program_id:programB})),'/login');assert.equal(state.rpcs.length,0);
  });
  for(const [name,call] of authenticatedCalls.filter(([name])=>!['remove','clear'].includes(name))) await scenario(`RPC failure ${name}`,async()=>{
    state.rpcError='Fixture database unavailable';const before=snapshot();assert.deepEqual(await call(),{error:'Fixture database unavailable'});unchanged(before);
  });
  for(const [name,call] of authenticatedCalls.filter(([name])=>['remove','clear'].includes(name))) await scenario(`delete query failure ${name}`,async()=>{
    state.tableError='Fixture delete unavailable';const before=snapshot();assert.deepEqual(await call(),{error:'Fixture delete unavailable'});unchanged(before);
  });
  await scenario('activation RPC failure does not invalidate',async()=>{
    state.rpcError='Fixture activation unavailable';const before=snapshot();await assert.rejects(actions.activateCustomProgramFromForm(form({program_id:programB})),/Fixture activation unavailable/);unchanged(before);
  });
  if(failures.length) {
    console.error(failures.join('\n'));
    assert.fail(`${failures.length} failed named-program action scenarios; ${scenarios.length} passed`);
  }
  console.log(`PASS: ${scenarios.length} named-program action scenarios; actual actions, isolated Supabase/cache/navigation mocks. Create/rename/delete/activate, inactive editing, status isolation, owner/source/program filters, shared schedules, validation, authentication, database failures and calendar/setup invalidation. No network or production writes.`);
} finally {
  delete globalThis.__namedProgramActions;
  assert.ok(path.resolve(temporary).startsWith(path.resolve(results)+path.sep));
  await fs.rm(temporary,{recursive:true,force:true});
}
