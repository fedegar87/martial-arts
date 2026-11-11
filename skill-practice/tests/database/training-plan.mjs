import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireSql = createRequire(path.join(app, "test-results/sql-tools/package.json"));
const { PGlite } = requireSql("@electric-sql/pglite");
const db = new PGlite();

try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'service_role') $$;
  `);
  const directory = path.join(app, "supabase/migrations");
  const migrations = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of migrations) {
    try {
      await db.exec(await fs.readFile(path.join(directory, file), "utf8"));
    } catch (error) {
      throw new Error(`${file}: ${error.message}`, { cause: error });
    }
  }
  await db.exec(`
    GRANT USAGE ON SCHEMA public, auth TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
  `);

  const asAdmin = async () => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claim.role', 'service_role', false)");
  };
  const asUser = async (id) => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.role', 'authenticated', false)", [id]);
    await db.exec("SET ROLE authenticated");
  };
  const provision = async (email) => {
    const invite = (await db.query("SELECT * FROM public.bulk_upsert_user_invites($1::jsonb)", [
      JSON.stringify([{ email, level_shaolin: -1, level_taichi: -1 }]),
    ])).rows[0];
    assert.equal(invite.result_status, "pending");
    const id = (await db.query("INSERT INTO auth.users(email) VALUES($1) RETURNING id", [email])).rows[0].id;
    await db.query("UPDATE public.user_profiles SET profile_locked=false WHERE id=$1", [id]);
    return id;
  };
  const owner = await provision("training-owner@example.test");
  const other = await provision("training-other@example.test");
  const exams = (await db.query("SELECT id, discipline, grade_value FROM public.exam_programs WHERE grade_value IN (-2,-3) ORDER BY discipline, grade_value")).rows;
  const examId = (discipline, grade = -2) => {
    const exam = exams.find((entry) => entry.discipline === discipline && entry.grade_value === grade);
    assert.ok(exam, `${discipline} grade ${grade} must be seeded`);
    return exam.id;
  };
  const snapshot = async (id, source) => (await db.query(`
    SELECT i.id, i.skill_id, i.status, i.source, i.is_hidden, s.discipline, s.category, s.minimum_grade_value
    FROM public.user_plan_items i JOIN public.skills s ON s.id=i.skill_id
    WHERE i.user_id=$1 AND ($2::text IS NULL OR i.source::text=$2)
    ORDER BY i.source, i.skill_id
  `, [id, source ?? null])).rows;
  const activeMode = async () => (await db.query("SELECT plan_mode FROM public.user_profiles WHERE id=auth.uid()")).rows[0].plan_mode;
  const otherBefore = await snapshot(other);

  await asUser(owner);
  await db.query("SELECT public.activate_exam_mode($1,$2)", [examId("shaolin"), examId("taichi")]);
  assert.equal(await activeMode(), "exam");
  const initial = await snapshot(owner, "exam_program");
  assert.equal(initial.length, 14, "second Chieh in both disciplines has 14 exercises");
  assert.equal(initial.filter((entry) => ["forme", "armi_forma"].includes(entry.category)).length, 6);
  assert.ok(initial.every((entry) => entry.minimum_grade_value === -2 && !entry.is_hidden && entry.status === "focus"));
  assert.equal(new Set(initial.map((entry) => entry.skill_id)).size, 14);
  assert.equal((await snapshot(other)).length, 0, "authenticated reads cannot see the other user's plan");
  console.log("PASS: complete migrations, second Chieh incremental plan: 14 exercises, 6 forms, no prior/future grade or duplicate.");

  const shaolin = initial.filter((entry) => entry.discipline === "shaolin").map((entry) => entry.skill_id);
  const taichi = initial.filter((entry) => entry.discipline === "taichi").map((entry) => entry.skill_id);
  await db.query("SELECT public.save_custom_selection($1::uuid[], 'shaolin')", [[shaolin[0], shaolin[1]]]);
  await db.query("SELECT public.save_custom_selection($1::uuid[], 'taichi')", [[taichi[0]]]);
  assert.equal(await activeMode(), "custom");
  await db.query("SELECT public.update_plan_item_status($1, 'focus')", [shaolin[0]]);
  await db.query("SELECT public.hide_plan_item($1)", [shaolin[0]]);
  const manualBefore = await snapshot(owner, "manual");
  assert.equal(manualBefore.length, 3);
  assert.ok(manualBefore.some((entry) => entry.skill_id === shaolin[0] && entry.is_hidden && entry.status === "focus"));

  await db.query("SELECT public.switch_to_exam_mode()");
  assert.equal(await activeMode(), "exam");
  assert.deepEqual(await snapshot(owner, "manual"), manualBefore);
  await db.query("SELECT public.update_plan_item_status($1, 'maintenance')", [shaolin[0]]);
  await db.query("SELECT public.hide_plan_item($1)", [shaolin[0]]);
  const examBefore = await snapshot(owner, "exam_program");
  await db.query("SELECT public.activate_exam_mode($1,$2)", [examId("shaolin"), examId("taichi")]);
  assert.deepEqual(await snapshot(owner, "exam_program"), examBefore, "reactivating the same exams preserves per-skill status and visibility");
  assert.deepEqual(await snapshot(owner, "manual"), manualBefore);

  await db.query("SELECT public.switch_to_custom_mode()");
  assert.equal(await activeMode(), "custom");
  assert.deepEqual(await snapshot(owner, "exam_program"), examBefore);
  assert.deepEqual(await snapshot(owner, "manual"), manualBefore);
  await db.query("SELECT public.switch_to_exam_mode()");
  assert.equal(await activeMode(), "exam");
  assert.deepEqual(await snapshot(owner, "exam_program"), examBefore);
  console.log("PASS: custom/exam switching preserves both plans, independent status and hidden flags for the same skill.");

  await db.query("SELECT public.activate_exam_mode($1,NULL)", [examId("shaolin")]);
  const singleDiscipline = await snapshot(owner, "exam_program");
  assert.equal(singleDiscipline.length, shaolin.length);
  assert.ok(singleDiscipline.every((entry) => entry.discipline === "shaolin"));
  assert.deepEqual(await snapshot(owner, "manual"), manualBefore);
  await db.query("SELECT public.activate_exam_mode($1,$2)", [examId("shaolin"), examId("taichi")]);
  assert.equal((await snapshot(owner, "exam_program")).length, 14);
  await assert.rejects(db.query("SELECT public.activate_exam_mode(NULL,NULL)"), /Seleziona almeno un esame/);
  await assert.rejects(db.query("SELECT public.activate_exam_mode($1,$2)", [examId("taichi"), examId("shaolin")]), /Invalid Shaolin exam/);
  await assert.rejects(db.query("SELECT public.activate_exam_mode($1,NULL)", [examId("shaolin", -3)]), /Invalid Shaolin exam/);
  assert.equal((await snapshot(owner, "exam_program")).length, 14, "invalid selections leave the plan intact");
  console.log("PASS: single/both discipline selection, rejection of empty, reversed and future exams; manual plan retained.");

  await asAdmin();
  assert.deepEqual(await snapshot(other), otherBefore, "all owner mutations leave the other user's plan unchanged");
  await asUser(owner);
  await db.query("SELECT public.switch_to_custom_mode()");
  await db.query("SELECT public.save_custom_selection($1::uuid[], 'shaolin')", [[shaolin[0]]]);
  const reselected = await snapshot(owner, "manual");
  assert.equal(reselected.filter((entry) => entry.discipline === "shaolin").length, 1);
  assert.ok(reselected.some((entry) => entry.discipline === "taichi"), "saving Shaolin does not delete Tai Chi custom items");
  const restored = reselected.find((entry) => entry.skill_id === shaolin[0]);
  assert.equal(restored.status, "focus", "explicit reselection preserves an existing focus status");
  assert.equal(restored.is_hidden, false, "explicitly reselecting a hidden custom skill must restore it");
  await asAdmin();
  assert.deepEqual(await snapshot(other), otherBefore);
  await asUser(owner);
  await db.query("SELECT set_config('request.jwt.claim.sub','',false)");
  await assert.rejects(db.query("SELECT public.switch_to_custom_mode()"), /Not authenticated/);
  console.log(`PASS: hidden custom reselection, discipline isolation, owner-only mutations and unauthenticated rejection. ${migrations.length} migrations; in-memory PostgreSQL; no network or Supabase writes.`);
} finally {
  await db.close();
}
