// Post-exam promotion runner (FESK rollout).
//
// Usage:
//   node scripts/promote-after-exam.mjs <input.json>          # dry-run (default)
//   node scripts/promote-after-exam.mjs <input.json> --apply  # perform promotions
//
// input.json: [{ "email": "a@b.it", "shaolin": true, "taichi": false }, ...]
//   - identify users by "email" or "userId";
//   - flag the discipline(s) the user PASSED; only flagged disciplines advance.
//
// Env (read from process.env or a local .env.local / .env):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// The actual promotion (level, preparing exam, access group, plan regeneration, audit)
// runs in the SECURITY DEFINER RPC public.promote_user_after_exam; this script only
// resolves users and calls it once per passed discipline.

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

async function resolveUserId(supabase, entry) {
  if (entry.userId) return entry.userId;
  if (!entry.email) return null;
  const target = entry.email.trim().toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (found) return found.id;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

async function main() {
  loadEnvFiles();

  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const inputPath = args.find((a) => !a.startsWith("--"));
  if (!inputPath) {
    console.error("Usage: node scripts/promote-after-exam.mjs <input.json> [--apply]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const entries = JSON.parse(readFileSync(inputPath, "utf8"));
  if (!Array.isArray(entries)) {
    console.error("input.json must be an array of { email|userId, shaolin?, taichi? }");
    process.exit(1);
  }

  let promoted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const userId = await resolveUserId(supabase, entry);
    if (!userId) {
      console.warn(`SKIP: cannot resolve user for ${JSON.stringify(entry)}`);
      skipped += 1;
      continue;
    }

    const disciplines = [];
    if (entry.shaolin) disciplines.push("shaolin");
    if (entry.taichi) disciplines.push("taichi");
    if (disciplines.length === 0) {
      console.warn(`SKIP: no discipline flagged for ${userId}`);
      skipped += 1;
      continue;
    }

    if (!apply) {
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("assigned_level_shaolin, assigned_level_taichi, preparing_exam_id, preparing_exam_taichi_id")
        .eq("id", userId)
        .maybeSingle();
      console.log(
        `DRY-RUN ${userId} -> ${disciplines.join("+")} | now shaolin=${prof?.assigned_level_shaolin} taichi=${prof?.assigned_level_taichi}`,
      );
      continue;
    }

    for (const discipline of disciplines) {
      const { error } = await supabase.rpc("promote_user_after_exam", {
        p_user_id: userId,
        p_discipline: discipline,
      });
      if (error) {
        console.error(`ERROR ${userId} ${discipline}: ${error.message}`);
        skipped += 1;
        continue;
      }
      console.log(`OK promoted ${userId} ${discipline}`);
      promoted += 1;
    }
  }

  console.log(`\n${apply ? "Applied" : "Dry-run"}: ${promoted} promotions, ${skipped} skipped/errors.`);
  if (!apply) console.log("Re-run with --apply to perform the promotions.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
