import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(
  path.join(path.dirname(app), "tools/video/package.json"),
);
const { build } = requireTools("esbuild");
const results = path.join(app, "test-results");
await fs.mkdir(results, { recursive: true });
const temporary = await fs.mkdtemp(path.join(results, "locale-server-"));
try {
  await fs.writeFile(path.join(temporary, "empty.ts"), "");
  await fs.writeFile(
    path.join(temporary, "headers.ts"),
    `export const cookies = async () => ({set: (...args) => globalThis.__localeTest.cookies.push(args)});`,
  );
  await fs.writeFile(
    path.join(temporary, "supabase.ts"),
    `export const createClient = async () => globalThis.__localeTest.client;`,
  );
  await build({
    stdin: {
      contents: `export {setLocale} from '@/lib/actions/locale'; export {getCurrentUserLocale} from '@/lib/queries/user-profile';`,
      resolveDir: app,
    },
    outfile: path.join(temporary, "bundle.mjs"),
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
    alias: {
      "@": path.join(app, "src"),
      react: path.join(app, "node_modules/react"),
      "server-only": path.join(temporary, "empty.ts"),
      "next/headers": path.join(temporary, "headers.ts"),
      "@/lib/supabase/server": path.join(temporary, "supabase.ts"),
    },
  });
  const { setLocale, getCurrentUserLocale } = await import(
    pathToFileURL(path.join(temporary, "bundle.mjs"))
  );
  const preferences = new Map();
  const state = (globalThis.__localeTest = {
    user: null,
    cookies: [],
    error: null,
    reads: 0,
    upserts: [],
    client: {
      auth: { getUser: async () => ({ data: { user: state.user } }) },
      from: (table) => {
        assert.equal(table, "notification_preferences");
        return {
          upsert: async (payload) => {
            state.upserts.push(payload);
            if (!state.error)
              preferences.set(payload.user_id, {
                ...preferences.get(payload.user_id),
                ...payload,
              });
            return { error: state.error };
          },
          select: (columns) => {
            assert.equal(columns, "locale");
            return {
              eq: (column, id) => {
                assert.equal(column, "user_id");
                assert.equal(id, state.user.id);
                return {
                  maybeSingle: async () => {
                    state.reads++;
                    return {
                      data: preferences.get(id) ?? null,
                      error: state.error,
                    };
                  },
                };
              },
            };
          },
        };
      },
    },
  });
  assert.equal(await getCurrentUserLocale(), null);
  assert.equal(state.reads, 0);
  await assert.rejects(setLocale("fr"), /Authentication required/);
  assert.equal(state.upserts.length, 0);
  state.user = { id: "fr-user" };
  assert.equal(await getCurrentUserLocale(), null);
  await setLocale("fr");
  assert.deepEqual(preferences.get("fr-user"), {
    user_id: "fr-user",
    locale: "fr",
  });
  assert.equal(await getCurrentUserLocale(), "fr");
  assert.equal(state.cookies[0][0], "practice_locale");
  assert.equal(state.cookies[0][1], "fr");
  assert.equal(state.cookies[0][2].httpOnly, true);
  preferences.set("fr-user", {
    user_id: "fr-user",
    locale: "fr",
    training_reminders_enabled: false,
    time_zone: "Europe/Brussels",
    reminder_time: "18:30",
  });
  await setLocale("it");
  assert.deepEqual(preferences.get("fr-user"), {
    user_id: "fr-user",
    locale: "it",
    training_reminders_enabled: false,
    time_zone: "Europe/Brussels",
    reminder_time: "18:30",
  });
  await assert.rejects(setLocale("de"), /Unsupported locale/);
  state.error = { message: "Fixture database error" };
  await assert.rejects(setLocale("fr"), /Unable to save/);
  assert.equal(state.cookies.length, 2);
  assert.equal(preferences.get("fr-user").locale, "it");
  state.error = null;
  state.user = { id: "other-user" };
  assert.equal(await getCurrentUserLocale(), null);
  await setLocale("fr");
  assert.equal(preferences.get("fr-user").locale, "it");
  assert.equal(preferences.get("other-user").locale, "fr");
  console.log(
    "PASS: actual server locale query/action, anonymous rejection, preference creation, account isolation, preserved reminder settings, invalid locale and database failure without cookie changes. Mocked Supabase; no network or production writes.",
  );
} finally {
  delete globalThis.__localeTest;
  assert.ok(
    path.resolve(temporary).startsWith(path.resolve(results) + path.sep),
  );
  await fs.rm(temporary, { recursive: true, force: true });
}
