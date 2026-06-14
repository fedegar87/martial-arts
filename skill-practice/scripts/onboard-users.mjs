// Onboarding FESK in un comando: upsert delle righe invito + creazione/invito utenti Auth.
//
// Uso (lancia da skill-practice/):
//   node scripts/onboard-users.mjs people.json                          # DRY-RUN (default), modalita invite
//   node scripts/onboard-users.mjs people.json --apply                  # APPLY, invite: manda email set-password (richiede SMTP)
//   node scripts/onboard-users.mjs people.json --apply --password-test  # APPLY, password temporanea (nessuna email; per test)
//
// people.json: [{ "email", "name"?, "shaolin"?, "taichi"?, "all_access"? }, ...]
//   shaolin/taichi = grado intero (0 = non praticato). Default 8 / 0. all_access:true = istruttore/operatore.
//
// Env (process.env o .env.local in skill-practice/): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Ordine garantito: prima bulk_upsert_user_invites (riga DB), poi creazione Auth, perche'
// handle_new_user pretende un invito 'pending' prima di provisionare il profilo. Idempotente:
// re-run salta gli inviti gia' accettati e ritenta gli Auth mancanti.

import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

function tempPassword() {
  return randomBytes(14).toString("base64url");
}

function isValidGrade(value) {
  return (
    Number.isInteger(value) &&
    (value === 0 || (value >= 1 && value <= 8) || (value >= -7 && value <= -1))
  );
}

function normalizeItem(raw) {
  return {
    email: String(raw.email ?? "").trim().toLowerCase(),
    display_name: (raw.name ?? raw.display_name ?? "").toString().trim() || null,
    level_shaolin: raw.shaolin ?? raw.level_shaolin ?? raw.assigned_level_shaolin ?? 8,
    level_taichi: raw.taichi ?? raw.level_taichi ?? raw.assigned_level_taichi ?? 0,
    all_access: Boolean(raw.all_access ?? raw.instructor ?? false),
  };
}

function rpcPayload(it) {
  const p = {
    email: it.email,
    level_shaolin: it.level_shaolin,
    level_taichi: it.level_taichi,
  };
  if (it.display_name) p.display_name = it.display_name;
  if (it.all_access) p.all_access = true;
  return p;
}

async function main() {
  loadEnvFiles();

  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const passwordTest = args.includes("--password-test");
  if (args.includes("--invite") && passwordTest) {
    console.error("Scegli una sola modalita: --invite oppure --password-test");
    process.exit(1);
  }
  const inviteMode = !passwordTest; // default: invite

  const inputPath = args.find((a) => !a.startsWith("--"));
  if (!inputPath) {
    console.error("Uso: node scripts/onboard-users.mjs <people.json> [--apply] [--invite|--password-test]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (env o .env.local)");
    process.exit(1);
  }

  let raw;
  try {
    raw = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (e) {
    console.error(`JSON non valido in ${inputPath}: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(raw) || raw.length === 0) {
    console.error("Il file deve essere un array JSON non vuoto.");
    process.exit(1);
  }

  const items = raw.map(normalizeItem);

  const problems = [];
  const seen = new Set();
  for (const it of items) {
    if (!it.email) problems.push("voce senza email");
    else if (seen.has(it.email)) problems.push(`email duplicata: ${it.email}`);
    else seen.add(it.email);
    if (!isValidGrade(it.level_shaolin)) problems.push(`${it.email}: grado shaolin non valido (${it.level_shaolin})`);
    if (!isValidGrade(it.level_taichi)) problems.push(`${it.email}: grado taichi non valido (${it.level_taichi})`);
  }
  if (problems.length) {
    console.error("Errori di validazione:\n  - " + problems.join("\n  - "));
    process.exit(1);
  }

  const mode = passwordTest
    ? "password-test (nessuna email)"
    : "invite (email set-password, richiede SMTP)";
  console.log(`Onboarding ${items.length} utenti | modalita: ${mode} | ${apply ? "APPLY" : "DRY-RUN"}`);
  for (const it of items) {
    console.log(
      `  - ${it.email} | ${it.display_name ?? "(no name)"} | shaolin=${it.level_shaolin} taichi=${it.level_taichi}${it.all_access ? " | ALL-ACCESS" : ""}`,
    );
  }

  if (!apply) {
    console.log("\nDRY-RUN: nessuna modifica. Rilancia con --apply per eseguire.");
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Righe invito (idempotente; salta gli accepted)
  const { data: inviteRows, error: inviteErr } = await supabase.rpc("bulk_upsert_user_invites", {
    p_invites: items.map(rpcPayload),
  });
  if (inviteErr) {
    console.error(`bulk_upsert_user_invites fallita: ${inviteErr.message}`);
    process.exit(1);
  }
  const inviteByEmail = new Map((inviteRows ?? []).map((r) => [r.email, r]));

  // 2) Utenti Auth
  const report = [];
  for (const it of items) {
    const inv = inviteByEmail.get(it.email);
    const inviteStatus = inv?.result_status ?? "?";
    const inviteMsg = inv?.message ?? "";

    if (inviteStatus === "error") {
      report.push({ email: it.email, invite: "error", auth: "skipped", note: inviteMsg });
      continue;
    }
    if (inviteStatus === "skipped") {
      report.push({ email: it.email, invite: "skipped", auth: "exists", note: "invito gia' accettato" });
      continue;
    }

    try {
      if (inviteMode) {
        const { error } = await supabase.auth.admin.inviteUserByEmail(it.email);
        report.push(
          error
            ? { email: it.email, invite: inviteStatus, auth: "error", note: error.message }
            : { email: it.email, invite: inviteStatus, auth: "invited", note: "email inviata" },
        );
      } else {
        const pw = tempPassword();
        const { error } = await supabase.auth.admin.createUser({
          email: it.email,
          password: pw,
          email_confirm: true,
        });
        report.push(
          error
            ? { email: it.email, invite: inviteStatus, auth: "error", note: error.message }
            : { email: it.email, invite: inviteStatus, auth: "created", note: `password: ${pw}` },
        );
      }
    } catch (e) {
      report.push({ email: it.email, invite: inviteStatus, auth: "error", note: e.message });
    }
  }

  console.log("\nReport:");
  for (const r of report) {
    console.log(`  ${r.email} | invite=${r.invite} | auth=${r.auth} | ${r.note}`);
  }
  const okCount = report.filter((r) => r.auth === "invited" || r.auth === "created").length;
  console.log(`\nFatto: ${okCount}/${items.length} utenti creati/invitati.`);
  if (!inviteMode) {
    console.log("Modalita password-test: comunica le password in modo sicuro. Per il rollout vero usa --invite con SMTP configurato.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
