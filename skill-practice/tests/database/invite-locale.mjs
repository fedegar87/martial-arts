import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireSql = createRequire(
  path.join(app, "test-results/sql-tools/package.json"),
);
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
  for (const file of (await fs.readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    if (file.startsWith("0051_")) {
      await db.query(
        "SELECT * FROM public.bulk_upsert_user_invites($1::jsonb)",
        [JSON.stringify([{ email: "existing@example.test" }])],
      );
      const existing = (
        await db.query(
          "INSERT INTO auth.users(email) VALUES ('existing@example.test') RETURNING id",
        )
      ).rows[0];
      await db.query(
        "INSERT INTO public.notification_preferences(user_id,locale) VALUES($1,'fr')",
        [existing.id],
      );
    }
    try {
      await db.exec(await fs.readFile(path.join(directory, file), "utf8"));
    } catch (error) {
      throw new Error(`${file}: ${error.message}`);
    }
  }
  assert.equal(
    (
      await db.query(
        "SELECT locale FROM public.notification_preferences n JOIN auth.users u ON u.id=n.user_id WHERE u.email='existing@example.test'",
      )
    ).rows[0].locale,
    "fr",
  );
  const invite = async (email, locale) =>
    (
      await db.query(
        "SELECT * FROM public.bulk_upsert_user_invites($1::jsonb)",
        [
          JSON.stringify([
            { email, locale, level_shaolin: 5, level_taichi: 0 },
          ]),
        ],
      )
    ).rows[0];
  const provision = async (email) =>
    (
      await db.query("INSERT INTO auth.users(email) VALUES ($1) RETURNING id", [
        email,
      ])
    ).rows[0].id;
  const french = "fr@example.test";
  assert.equal((await invite(french, "fr")).result_status, "pending");
  const frenchId = await provision(french);
  const row = (
    await db.query(
      `SELECT p.assigned_level_shaolin, p.profile_locked, p.content_access_mode, n.locale, n.training_reminders_enabled
    FROM public.user_profiles p JOIN public.notification_preferences n ON n.user_id=p.id WHERE p.id=$1`,
      [frenchId],
    )
  ).rows[0];
  assert.deepEqual(row, {
    assigned_level_shaolin: 5,
    profile_locked: true,
    content_access_mode: "up_to_assigned_level",
    locale: "fr",
    training_reminders_enabled: false,
  });
  assert.equal((await invite(french, "it")).result_status, "skipped");
  assert.equal(
    (
      await db.query(
        "SELECT locale FROM public.notification_preferences WHERE user_id=$1",
        [frenchId],
      )
    ).rows[0].locale,
    "fr",
  );
  assert.equal((await invite("it@example.test")).result_status, "pending");
  const italianId = await provision("it@example.test");
  assert.equal(
    (
      await db.query(
        "SELECT locale FROM public.notification_preferences WHERE user_id=$1",
        [italianId],
      )
    ).rows[0].locale,
    "it",
  );
  assert.equal((await invite("bad@example.test", "de")).result_status, "error");
  assert.equal(
    (await invite("pending@example.test", "it")).result_status,
    "pending",
  );
  assert.equal(
    (await invite("pending@example.test", "fr")).result_status,
    "pending",
  );
  const pendingId = await provision("pending@example.test");
  assert.equal(
    (
      await db.query(
        "SELECT locale FROM public.notification_preferences WHERE user_id=$1",
        [pendingId],
      )
    ).rows[0].locale,
    "fr",
  );
  await assert.rejects(
    provision("uninvited@example.test"),
    /no pending invite/,
  );
  await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`, [
    frenchId,
  ]);
  await db.exec(
    "GRANT USAGE ON SCHEMA public,auth TO authenticated; GRANT SELECT,INSERT,UPDATE ON public.notification_preferences TO authenticated; SET ROLE authenticated;",
  );
  await db.query(
    `INSERT INTO public.notification_preferences(user_id,locale) VALUES($1,'it') ON CONFLICT(user_id) DO UPDATE SET locale=EXCLUDED.locale`,
    [frenchId],
  );
  assert.equal(
    (
      await db.query(
        "SELECT locale FROM public.notification_preferences WHERE user_id=$1",
        [frenchId],
      )
    ).rows[0].locale,
    "it",
  );
  assert.equal(
    (
      await db.query(
        `UPDATE public.notification_preferences SET locale='fr' WHERE user_id=$1 RETURNING *`,
        [italianId],
      )
    ).rows.length,
    0,
  );
  console.log(
    "PASS: complete migrations, invite locale defaults/validation/update, provisioning with preserved grade/access lock, no notification opt-in, accepted invite protection, uninvited signup rejection and owner-only locale changes. In-memory PostgreSQL; no Supabase writes.",
  );
} finally {
  await db.close();
}
