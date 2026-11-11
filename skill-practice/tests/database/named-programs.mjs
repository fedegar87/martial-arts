import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireSql = createRequire(path.join(app, "test-results/sql-tools/package.json"));
const { PGlite } = requireSql("@electric-sql/pglite");
const db = new PGlite();
let assertions = 0;
const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'service_role') $$;
  `);
  const directory = path.join(app, "supabase/migrations");
  const migrations = (await fs.readdir(directory)).filter(file => file.endsWith(".sql")).sort();
  const apply = async file => {
    try { await db.exec(await fs.readFile(path.join(directory, file), "utf8")); }
    catch (error) { throw new Error(`${file}: ${error.message}`, { cause: error }); }
  };
  for (const file of migrations.filter(file => file < "0057")) await apply(file);
  const provision = async email => {
    const inviteSchool = (await db.query("SELECT school_id FROM public.access_groups ORDER BY created_at,id LIMIT 1")).rows[0].school_id;
    check((await db.query("SELECT * FROM public.bulk_upsert_user_invites($1::jsonb,$2::uuid)", [JSON.stringify([{ email, level_shaolin: -1, level_taichi: -1 }]),inviteSchool])).rows[0].result_status, "pending");
    const id = (await db.query("INSERT INTO auth.users(email) VALUES($1) RETURNING id", [email])).rows[0].id;
    await db.query("UPDATE public.user_profiles SET profile_locked=false WHERE id=$1", [id]);
    return id;
  };
  const owner = await provision("program-owner@example.test");
  const other = await provision("program-other@example.test");
  const profile = async id => (await db.query("SELECT * FROM public.user_profiles WHERE id=$1", [id])).rows[0];
  const schoolId = (await profile(owner)).school_id;
  const shaolin = (await db.query("SELECT id FROM public.skills WHERE school_id=$1 AND discipline='shaolin' AND minimum_grade_value=-2 ORDER BY display_order, id LIMIT 3", [schoolId])).rows.map(row => row.id);
  const tai = (await db.query("SELECT id FROM public.skills WHERE school_id=$1 AND discipline='taichi' AND minimum_grade_value=-2 ORDER BY display_order, id LIMIT 1", [schoolId])).rows[0].id;
  const exams = (await db.query("SELECT id,discipline FROM public.exam_programs WHERE school_id=$1 AND grade_value=-2", [schoolId])).rows;
  const exam = discipline => exams.find(row => row.discipline === discipline).id;
  const foreignSchool = (await db.query("INSERT INTO public.schools(name) VALUES('Other program school') RETURNING id")).rows[0].id;
  const foreignSkill = (await db.query("INSERT INTO public.skills(school_id,name,category,discipline,practice_mode,video_url,minimum_grade_value,display_order) VALUES($1,'Other school form','forme','shaolin','solo','',-2,0) RETURNING id", [foreignSchool])).rows[0].id;
  const futureSkill = (await db.query("SELECT id FROM public.skills WHERE school_id=$1 AND discipline='shaolin' AND minimum_grade_value=-3 LIMIT 1", [schoolId])).rows[0].id;
  await db.query("UPDATE public.user_profiles SET plan_mode='custom' WHERE id=$1", [owner]);
  await db.query("INSERT INTO public.user_plan_items(user_id,skill_id,status,source,is_hidden,last_practiced_at) VALUES($1,$2,'focus','manual',true,'2026-11-10T10:00:00Z')", [owner, shaolin[0]]);
  await db.query("INSERT INTO public.practice_logs(user_id,skill_id,date,completed,reps_target,reps_done,personal_note) VALUES($1,$2,'2026-11-10',false,3,1,'Keep this note')", [owner, shaolin[0]]);
  await db.query("INSERT INTO public.training_schedule(user_id,weekdays,cadence_weeks,reps_per_form,start_date,end_date) VALUES($1,ARRAY[1,3,5],2,3,'2026-11-01','2027-01-23')", [owner]);
  const oldItems = (await db.query("SELECT id,user_id,skill_id,status,source,is_hidden,last_practiced_at,added_at FROM public.user_plan_items WHERE user_id=$1 AND source='manual'", [owner])).rows;
  const oldLogs = (await db.query("SELECT * FROM public.practice_logs ORDER BY id")).rows;
  const oldSchedule = (await db.query("SELECT * FROM public.training_schedule ORDER BY user_id")).rows;
  for (const file of migrations.filter(file => file >= "0057")) await apply(file);
  await db.exec("GRANT USAGE ON SCHEMA public,auth TO authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;");
  const migrated = (await db.query("SELECT id,user_id,skill_id,status,source,is_hidden,last_practiced_at,added_at FROM public.user_plan_items WHERE user_id=$1 AND source='manual'", [owner])).rows;
  check(migrated, oldItems, "migration preserves all original item values");
  const legacy = (await profile(owner)).active_custom_program_id;
  assert.ok(legacy);
  check((await db.query("SELECT custom_program_id FROM public.user_plan_items WHERE user_id=$1 AND source='manual'", [owner])).rows[0].custom_program_id, legacy);
  check((await db.query("SELECT name FROM public.custom_programs WHERE id=$1", [legacy])).rows[0].name, "Il mio programma");

  const asUser = async id => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role','authenticated',false)", [id]);
    await db.exec("SET ROLE authenticated");
  };
  const asAdmin = async () => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','service_role',false)");
  };
  const create = async name => (await db.query("SELECT public.create_custom_program($1) AS id", [name])).rows[0].id;
  const items = async id => (await db.query("SELECT skill_id,status,is_hidden FROM public.user_plan_items WHERE custom_program_id=$1 ORDER BY skill_id", [id])).rows;
  await asUser(owner);
  const first = await create("  Ripasso generale  ");
  const second = await create("Armi");
  check((await profile(owner)).active_custom_program_id, legacy, "creating does not activate");
  check((await profile(owner)).plan_mode, "custom");
  check((await db.query("SELECT name FROM public.custom_programs WHERE id=$1", [first])).rows[0].name, "Ripasso generale");
  for (const name of ["", "   ", "x".repeat(61), "New\nline", null]) {
    await assert.rejects(create(name)); assertions++;
  }
  await assert.rejects(create("ARMI"), /duplicate key/); assertions++;
  await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [first, [shaolin[0], shaolin[1]]]);
  await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'taichi')", [first, [tai]]);
  await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [second, [shaolin[0]]]);
  await db.query("SELECT public.update_named_custom_item_status($1,$2,'focus')", [first, shaolin[0]]);
  check((await items(first)).find(row => row.skill_id === shaolin[0]).status, "focus");
  check((await items(second))[0].status, "maintenance", "status is independent for the same skill");
  for (const unavailable of [foreignSkill, futureSkill]) {
    await assert.rejects(db.query("SELECT public.add_skill_to_custom_program($1,'focus')", [unavailable]), /Skill not available/); assertions++;
    await assert.rejects(db.query("INSERT INTO public.user_plan_items(user_id,skill_id,status,source,custom_program_id) VALUES($1,$2,'focus','manual',$3)", [owner,unavailable,second]), /row-level security/); assertions++;
    await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [second, [shaolin[0],unavailable]]);
    check((await items(second)).map(row => row.skill_id), [shaolin[0]], "named selection excludes foreign or future skills");
  }
  check((await profile(owner)).active_custom_program_id, legacy, "saving inactive program does not activate");
  check((await items(legacy))[0].is_hidden, true, "editing another program preserves hidden state");
  await db.query("SELECT public.activate_custom_program($1)", [first]);
  await db.query("SELECT public.hide_plan_item($1)", [shaolin[0]]);
  check((await items(first)).find(row => row.skill_id === shaolin[0]).is_hidden, true);
  check((await items(second))[0].is_hidden, false, "legacy hide only affects active program");
  await db.query("SELECT public.update_plan_item_status($1,'maintenance')", [shaolin[0]]);
  check((await items(first)).find(row => row.skill_id === shaolin[0]).status, "maintenance");
  await db.query("SELECT public.update_named_custom_item_status($1,$2,'focus')", [second, shaolin[0]]);
  check((await items(second))[0].status, "focus");
  await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [first, [shaolin[0]]]);
  check((await items(first)).find(row => row.skill_id === shaolin[0]).is_hidden, false);
  check((await items(first)).find(row => row.skill_id === shaolin[0]).status, "maintenance");
  assert.ok((await items(first)).some(row => row.skill_id === tai), "saving Shaolin preserves Tai Chi"); assertions++;
  check((await items(first)).length, 2);
  await db.query("SELECT public.rename_custom_program($1,'Armi e bastone')", [second]);
  check((await db.query("SELECT name FROM public.custom_programs WHERE id=$1", [second])).rows[0].name, "Armi e bastone");
  await assert.rejects(db.query("SELECT public.delete_custom_program($1)", [first]), /Cannot delete the active/); assertions++;
  await assert.rejects(db.query("DELETE FROM public.custom_programs WHERE id=$1", [first]), /Cannot delete the active/); assertions++;

  await asUser(other);
  const otherProgram = await create("Other user's program");
  check((await db.query("SELECT * FROM public.custom_programs WHERE id=$1", [first])).rows.length, 0);
  for (const [sql,args] of [
    ["SELECT public.activate_custom_program($1)", [first]],
    ["SELECT public.rename_custom_program($1,'Stolen')", [first]],
    ["SELECT public.delete_custom_program($1)", [first]],
    ["SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [first,[shaolin[0]]]],
    ["SELECT public.update_named_custom_item_status($1,$2,'focus')", [first,shaolin[0]]],
  ]) { await assert.rejects(db.query(sql,args), /Custom program not found/); assertions++; }
  await assert.rejects(db.query("UPDATE public.user_profiles SET active_custom_program_id=$1 WHERE id=$2", [first,other]), /foreign key/); assertions++;
  await assert.rejects(db.query("INSERT INTO public.user_plan_items(user_id,skill_id,status,source,custom_program_id) VALUES($1,$2,'focus','manual',$3)", [other,shaolin[0],first]), /foreign key/); assertions++;
  await assert.rejects(db.query("SELECT public.ensure_user_custom_program($1)", [owner]), /permission denied/); assertions++;

  await asUser(owner);
  await db.query("SELECT public.activate_exam_mode($1,$2)", [exam("shaolin"),exam("taichi")]);
  check((await db.query("SELECT count(*)::int AS count FROM public.user_plan_items WHERE user_id=$1 AND source='exam_program'", [owner])).rows[0].count, 14);
  check((await profile(owner)).active_custom_program_id, first);
  const beforeExamEdit = await items(first);
  await db.query("SELECT public.update_plan_item_status($1,'focus')", [shaolin[0]]);
  await db.query("SELECT public.hide_plan_item($1)", [shaolin[0]]);
  check(await items(first), beforeExamEdit, "exam status and hiding do not touch custom items");
  await db.query("SELECT public.switch_to_exam_mode()");
  await db.query("SELECT public.save_named_custom_selection($1,$2::uuid[],'shaolin')", [second,[shaolin[0],shaolin[2]]]);
  check((await profile(owner)).plan_mode, "exam", "saving program while using exam leaves exam active");
  await db.query("SELECT public.add_skill_to_custom_program($1,'focus')", [shaolin[2]]);
  check((await profile(owner)).plan_mode, "exam");
  check((await items(first)).find(row => row.skill_id === shaolin[2]).status, "focus");
  await db.query("SELECT public.delete_custom_program($1)", [first]);
  check((await profile(owner)).active_custom_program_id, null);
  check((await items(first)).length, 0, "deletion cascades only its items");
  assert.ok((await items(second)).length > 0); assertions++;
  await db.query("SELECT public.switch_to_custom_mode()");
  assert.ok((await profile(owner)).active_custom_program_id); assertions++;
  await db.query("SELECT public.save_custom_selection($1::uuid[],'shaolin')", [[shaolin[0]]]);
  check((await profile(owner)).plan_mode, "custom", "legacy editor still works");

  await asAdmin();
  check((await db.query("SELECT * FROM public.practice_logs ORDER BY id")).rows, oldLogs, "all operations preserve practice and notes");
  check((await db.query("SELECT * FROM public.training_schedule ORDER BY user_id")).rows, oldSchedule, "switching preserves all shared scheduling fields");
  const customBeforePromotion = (await db.query("SELECT * FROM public.user_plan_items WHERE user_id=$1 AND source='manual' ORDER BY id", [owner])).rows;
  await db.query("SELECT public.promote_user_after_exam($1,'shaolin',$2)", [owner,exam("shaolin")]);
  check((await db.query("SELECT * FROM public.user_plan_items WHERE user_id=$1 AND source='manual' ORDER BY id", [owner])).rows, customBeforePromotion);
  const newUser = await provision("lazy-program@example.test");
  check((await profile(newUser)).active_custom_program_id, null);
  await asUser(newUser);
  await db.query("SELECT public.add_skill_to_custom_program($1,'focus')", [shaolin[0]]);
  const lazyProgram = (await profile(newUser)).active_custom_program_id;
  assert.ok(lazyProgram); assertions++;
  check((await profile(newUser)).plan_mode, "exam", "lazy creation does not activate");
  await db.query("INSERT INTO public.user_plan_items(user_id,skill_id,status,source) VALUES($1,$2,'maintenance','manual')", [newUser,tai]);
  check((await items(lazyProgram)).length, 2, "legacy manual insert receives active program");
  await db.query("SELECT public.activate_custom_program($1)", [lazyProgram]);
  await asAdmin();
  await db.query("DELETE FROM auth.users WHERE id=$1", [newUser]);
  check((await db.query("SELECT * FROM public.custom_programs WHERE user_id=$1", [newUser])).rows, [], "account cascade deletes active programs");
  check((await db.query("SELECT id FROM public.custom_programs WHERE id=$1", [otherProgram])).rows.length, 1, "another user's program remains");
  await asUser(owner);
  await db.query("SELECT set_config('request.jwt.claim.sub','',false)");
  await assert.rejects(create("Anonymous"), /Not authenticated/); assertions++;
  console.log(`PASS: ${assertions} named-program assertions; ${migrations.length} migrations; migration preservation, independent programs/status/visibility, owner isolation, legacy compatibility, shared schedule/history, lazy creation, active deletion guard, exam switching/promotion and account cascade. In-memory PostgreSQL; no network or production writes.`);
} finally { await db.close(); }
