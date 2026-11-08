// Post-exam promotion runner (FESK rollout).
//
// Usage:
//   node scripts/promote-after-exam.mjs <input.json> --out <plan.json>
//   node scripts/promote-after-exam.mjs <plan.json> --apply
//
// input.json: [{ "email": "a@b.it", "shaolin": true, "taichi": false }, ...]
//   - identify users by "email" or "userId";
//   - true resolves the current exam during dry-run only;
//   - the reviewed plan pins each passed discipline to its exam UUID.
//
// Env (read from process.env or a local .env.local / .env):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// The actual promotion (level, preparing exam, access group, plan regeneration, audit)
// runs in the SECURITY DEFINER RPC public.promote_user_after_exam; this script only
// resolves users and calls it once per passed discipline.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
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
  const inputPath = args[0]?.startsWith("--") ? null : args[0];
  const outIndex = args.indexOf("--out");
  const outputPath = outIndex < 0 ? null : args[outIndex + 1];
  if (!inputPath) {
    console.error("Usage: node scripts/promote-after-exam.mjs <input.json> [--out <plan.json> | --apply]");
    process.exit(1);
  }
  if (outIndex >= 0 && (!outputPath || outputPath.startsWith("--") || apply)) {
    throw new Error("--out requires a new plan filename and cannot be combined with --apply");
  }
  if (outputPath && existsSync(outputPath)) throw new Error("Plan file already exists; review it instead of overwriting it");

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
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || (!entry.userId && !entry.email)) {
      throw new Error("Every entry requires userId or email");
    }
    for (const discipline of ["shaolin", "taichi"]) {
      const value = entry[discipline];
      if (value === undefined || value === false) continue;
      if ((!apply && value === true) || (typeof value === "string" && uuid.test(value))) continue;
      throw new Error(`${discipline}: --apply requires an explicit passed-exam UUID from the reviewed plan, not true`);
    }
  }

  let promoted = 0;
  let skipped = 0;
  const plan = [];

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
      const { data: prof, error } = await supabase
        .from("user_profiles")
        .select("assigned_level_shaolin, assigned_level_taichi, preparing_exam_id, preparing_exam_taichi_id")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!prof) throw new Error(`Profile not found for ${userId}`);
      const planned = { userId };
      for (const discipline of disciplines) {
        const currentExam = discipline === "shaolin" ? prof.preparing_exam_id : prof.preparing_exam_taichi_id;
        if (!currentExam || (entry[discipline] !== true && entry[discipline] !== currentExam)) {
          throw new Error(`${userId} ${discipline}: no current exam or stale expected exam; no plan written`);
        }
        planned[discipline] = currentExam;
      }
      plan.push(planned);
      continue;
    }

    for (const discipline of disciplines) {
      const { error } = await supabase.rpc("promote_user_after_exam", {
        p_user_id: userId,
        p_discipline: discipline,
        p_expected_exam_id: entry[discipline],
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

  if (!apply) {
    if (skipped) throw new Error("Some entries were skipped; correct the input before preparing a plan");
    const json = JSON.stringify(plan, null, 2) + "\n";
    if (outputPath) writeFileSync(outputPath, json, { flag: "wx" });
    else console.log(json);
    console.log("Review the fixed exam UUIDs, then apply that same plan. Do not regenerate it to retry a partial failure.");
  } else {
    console.log(`Applied: ${promoted} promotions, ${skipped} skipped/errors.`);
    if (skipped) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
