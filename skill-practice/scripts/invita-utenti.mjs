// ============================================================================
//  INVITA UTENTI FESK  —  aggiungere allievi in autonomia, senza SQL ne' dashboard
// ============================================================================
//
// COSA FA
//   In un solo comando, per ogni persona del blocco PERSONE qui sotto:
//     1) crea/aggiorna la riga di pre-assegnazione in user_invites (scuola, ruolo,
//        gradi Shaolin/T'ai Chi) — il passo che prima si faceva a mano nel SQL Editor;
//     2) manda l'email di invito "Imposta la password" — il passo che prima si faceva
//        a mano dalla dashboard Supabase ("Send invitation").
//   Al primo login di quella persona, il trigger handle_new_user crea il suo profilo
//   con i gradi indicati e (se previsto) il piano d'esame gia' pronto.
//
// COME SI USA
//   1) Apri questo file e modifica SOLO il blocco PERSONE qui sotto.
//      Per ogni persona cambi: nome, cognome, email, shaolin, taichi, istruttore, lingua.
//      lingua: "it" (default) oppure "fr". Richiede migration 0051_invite_locale.sql.
//      Per piu' persone, DUPLICA il blocco { ... } (uno per persona, separati da virgola).
//   2) Lancia i comandi dalla cartella skill-practice/.
//
// COMANDI (dalla cartella skill-practice/)
//   node scripts/invita-utenti.mjs
//       ANTEPRIMA: stampa cosa farebbe e basta. Non tocca il database, non manda email.
//       Usalo sempre prima, per controllare nomi e gradi.
//   node scripts/invita-utenti.mjs --apply
//       INVIA gli inviti alle persone del blocco.
//   node scripts/invita-utenti.mjs --apply --reinvite
//       RE-INVITO (vedi "Sicurezza 2" sotto).
//
// GRADI  (campi shaolin / taichi)
//   Puoi scrivere un numero (es. -1) oppure una stringa comoda (niente accenti):
//     "8 chi" ... "1 chi"      -> principianti   (valori interni 8 ... 1)
//     "1 chieh" ... "5 chieh"  -> cinture nere    (valori interni -1 ... -5)
//     "1 luna" / "2 luna"      -> cinture oro     (valori interni -6 / -7)
//     "non praticato"          -> 0  (per il T'ai Chi di chi non lo pratica)
//   Nota: il T'ai Chi parte da "5 chi". Non assegnare "6/7/8 chi" al taichi.
//   istruttore: true -> accesso completo al catalogo (istruttore/operatore), profilo
//   sbloccato. false -> allievo normale, vede solo i contenuti fino al suo livello.
//
// LE DUE SICUREZZE (perche' non puoi fare danni)
//   Sicurezza 1 — --apply NON sovrascrive nessuno:
//     se un'email ha gia' un account, la persona viene SALTATA (nessuna email, nessuna
//     modifica). Cosi' non rischi mai di cancellare pratica/progressi di un utente attivo.
//   Sicurezza 2 — --reinvite e' l'unico modo per RIMANDARE un invito:
//     serve quando una persona e' stata invitata ma non ha mai impostato la password
//     (es. link scaduto/rotto). Per quella persona: ELIMINA l'account incompleto e i suoi
//     dati, poi ricrea l'invito e rimanda l'email. NON usarlo su utenti gia' attivi:
//     ne cancelleresti pratica e progressi.
//
// PREREQUISITI (gia' a posto, qui per memoria)
//   - .env.local in skill-practice/ con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
//   - Template email "Invite user" sulla dashboard Supabase aggiornato (link con
//     token_hash verso /auth/confirm — vedi supabase/email-templates/invite.html).
//   - Site URL della dashboard = dominio di produzione.
//
// Per i cambi di grado dopo un esame NON usare questo script: usa la promozione dedicata
// (scripts/promote-after-exam.mjs), che mantiene lo storico.
// ============================================================================

// ============================================================
// ====================  MODIFICA QUI  ========================
// ============================================================

const PERSONE = [
  // Duplica e decommenta il blocco qui sotto per ogni persona da invitare
  // (non committare indirizzi email reali sul repository pubblico):
  // {
  //   nome: "Mario",
  //   cognome: "Rossi",
  //   email: "mario.rossi@example.com",
  //   shaolin: "8 chi",
  //   taichi: "non praticato",
  //   istruttore: false,
  //   lingua: "it",
  // },
];

// ============================================================
// ==================  FINE MODIFICA  =========================
// ============================================================

import { readFileSync, existsSync } from "node:fs";
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

function isValidGradeValue(v) {
  return Number.isInteger(v) && (v === 0 || (v >= 1 && v <= 8) || (v >= -7 && v <= -1));
}

function gradeLabel(v) {
  if (v === 0) return "Non praticato";
  if (v >= 1) return `${v}° Chi`;
  if (v >= -5) return `${-v}° Chieh`;
  return `${-v - 5}° Mezza Luna`;
}

function parseGrade(input, field, email) {
  if (typeof input === "number") {
    if (!isValidGradeValue(input)) throw new Error(`${email}: ${field} non valido (${input})`);
    return input;
  }
  const s = String(input ?? "").trim().toLowerCase();
  if (s === "" || s === "non praticato" || s === "no" || s === "-" || s === "0") return 0;

  let m;
  if ((m = s.match(/^(\d+)\s*chi$/))) return clampGrade(Number(m[1]), field, email);
  if ((m = s.match(/^(\d+)\s*chieh$/))) return clampGrade(-Number(m[1]), field, email);
  if ((m = s.match(/^(\d+)\s*(?:mezza\s*)?luna$/))) return clampGrade(-5 - Number(m[1]), field, email);
  if (/^-?\d+$/.test(s)) return clampGrade(Number(s), field, email);

  throw new Error(`${email}: ${field} non riconosciuto ("${input}"). Usa es. "1 chieh", "8 chi", "non praticato".`);
}

function clampGrade(v, field, email) {
  if (!isValidGradeValue(v)) throw new Error(`${email}: ${field} fuori scala (${v})`);
  return v;
}

function normalize(p) {
  const email = String(p.email ?? "").trim().toLowerCase();
  const locale = String(p.lingua ?? p.locale ?? "it").trim().toLowerCase();
  if (!["it", "fr"].includes(locale)) throw new Error(`${email}: lingua deve essere it o fr`);
  const display_name = [p.nome, p.cognome].map((x) => (x ?? "").toString().trim()).filter(Boolean).join(" ") || null;
  return {
    email,
    display_name,
    level_shaolin: parseGrade(p.shaolin, "shaolin", email || "(senza email)"),
    level_taichi: parseGrade(p.taichi, "taichi", email || "(senza email)"),
    all_access: Boolean(p.istruttore),
    locale,
  };
}

async function findAuthUser(supabase, email) {
  for (let page = 1; page <= 30; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers fallita: ${error.message}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  loadEnvFiles();

  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const reinvite = args.includes("--reinvite");

  if (!Array.isArray(PERSONE) || PERSONE.length === 0) {
    console.error("Il blocco PERSONE e' vuoto. Aggiungi almeno una persona.");
    process.exit(1);
  }

  let items;
  try {
    items = PERSONE.map(normalize);
  } catch (e) {
    console.error(`Errore nei dati: ${e.message}`);
    process.exit(1);
  }

  const seen = new Set();
  for (const it of items) {
    if (!it.email) {
      console.error("C'e' una persona senza email.");
      process.exit(1);
    }
    if (seen.has(it.email)) {
      console.error(`Email duplicata nel blocco: ${it.email}`);
      process.exit(1);
    }
    seen.add(it.email);
  }

  console.log(`${items.length} persone | ${apply ? "INVIO" : "ANTEPRIMA"}${reinvite ? " | RE-INVITE" : ""}`);
  for (const it of items) {
    console.log(
      `  - ${it.email} | ${it.display_name ?? "(senza nome)"} | Shaolin: ${gradeLabel(it.level_shaolin)} | T'ai Chi: ${gradeLabel(it.level_taichi)} | lingua: ${it.locale}${it.all_access ? " | ACCESSO COMPLETO" : ""}`,
    );
  }

  if (!apply) {
    console.log("\nAnteprima: niente e' stato inviato. Rilancia con --apply per mandare gli inviti.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: schemaError } = await supabase.from("user_invites").select("locale").limit(0);
  if (schemaError) throw new Error("Verifica accesso Supabase e applicazione della migration 0051_invite_locale.sql prima di invitare utenti.", { cause: schemaError });

  const report = [];
  for (const it of items) {
    try {
      const existing = await findAuthUser(supabase, it.email);

      if (existing && !reinvite) {
        report.push({ email: it.email, esito: "saltato", note: "account gia' esistente — usa --reinvite per rimandare" });
        continue;
      }

      if (reinvite) {
        if (existing) {
          const { error } = await supabase.auth.admin.deleteUser(existing.id);
          if (error) throw new Error(`eliminazione account fallita: ${error.message}`);
        }
        // Rimuovi la riga invito (anche se 'accepted') cosi' la RPC ne inserisce una nuova 'pending'.
        const { error: delInv } = await supabase.from("user_invites").delete().eq("email", it.email);
        if (delInv) throw new Error(`pulizia invito fallita: ${delInv.message}`);
      }

      const payload = { email: it.email, level_shaolin: it.level_shaolin, level_taichi: it.level_taichi, locale: it.locale };
      if (it.display_name) payload.display_name = it.display_name;
      if (it.all_access) payload.instructor = true;

      const { data: rows, error: rpcErr } = await supabase.rpc("bulk_upsert_user_invites", { p_invites: [payload] });
      if (rpcErr) throw new Error(`creazione invito fallita: ${rpcErr.message}`);
      const row = rows?.[0];
      if (row?.result_status === "error") throw new Error(row.message);
      if (row?.result_status === "skipped") {
        report.push({ email: it.email, esito: "saltato", note: "invito gia' accettato — usa --reinvite per rimandare" });
        continue;
      }

      const { error: invErr } = await supabase.auth.admin.inviteUserByEmail(it.email);
      if (invErr) throw new Error(`invio email fallito: ${invErr.message}`);

      report.push({ email: it.email, esito: reinvite && existing ? "re-invitato" : "invitato", note: "email inviata" });
    } catch (e) {
      report.push({ email: it.email, esito: "errore", note: e.message });
    }
  }

  console.log("\nReport:");
  for (const r of report) console.log(`  ${r.email} | ${r.esito} | ${r.note}`);
  const ok = report.filter((r) => r.esito === "invitato" || r.esito === "re-invitato").length;
  console.log(`\nFatto: ${ok}/${items.length} inviti inviati.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
