# Verifica accessi FESK

Run against the current numbered migrations (see `scripts/verify-rollout.sql`) after
the branded build is deployed. This is a repeatable procedure, not a rollout plan.
Use a test cohort, not the founder account. "Pass" means the
"must NOT" never happens via the UI OR a raw request. Test the raw path too: a logged-in
student's bearer token plus a direct PostgREST call is the real adversary, not just the UI.

Setup (migrazioni fino a `0054`):
- Usare `scripts/invita-utenti.mjs` / `onboard-users.mjs` oppure la RPC
  `bulk_upsert_user_invites`: ogni invito deve avere i gradi per-persona,
  ruolo, scope/blocco e `locale` (`it`/`fr`). I gruppi sono preset, non la fonte
  corrente dei gradi. La riga invito deve esistere PRIMA della creazione Auth.
- Esempio di fixture: `{"email":"test@example.invalid","level_shaolin":0,
  "level_taichi":8,"locale":"fr"}`. Non usare identità reali nei test.
- Promozione: `node scripts/promote-after-exam.mjs input.json --out plan.json`,
  controllare gli UUID degli esami, poi `node scripts/promote-after-exam.mjs plan.json --apply`.
  Il piano preparato usa `{"userId":"...","shaolin":"UUID_ESAME_SUPERATO"}`.
  Dopo un errore parziale ritentare lo STESSO piano: le parti già riuscite vengono
  rifiutate come obsolete, le altre possono riuscire. Non rigenerarlo per ritentare.
  Una risposta di rete incerta richiede verifica di profilo/audit prima di altro.
  La RPC bulk richiede anch'essa UUID per disciplina (oppure flag più
  `expected_shaolin_exam_id` / `expected_taichi_exam_id`), mai soli booleani.

| # | Scenario | Setup | Must SEE / DO | Must NOT see / do |
|---|---|---|---|---|
| 1 | Shaolin-only student | invite per-persona Shaolin impostato, T'ai Chi 0, scope limitato, extra disabilitati, profilo bloccato | Shaolin catalog through the next grade; their exam plan in Programma/Today | any T'ai Chi content; Shaolin forms more advanced than their exam; Altro; the T'ai Chi toggle |
| 2 | T'ai Chi-only student | invite per-persona Shaolin 0, T'ai Chi impostato, profilo bloccato | T'ai Chi catalog in scope; their T'ai Chi exam plan; only the T'ai Chi tab in the library | ANY Shaolin content (library, direct URL, plan); the Shaolin toggle; Altro |
| 3 | Dual-discipline student | invite -> both levels set, locked | both disciplines in scope; both exam plans | content beyond either exam; Altro |
| 4 | Instructor / all-access | invite -> `all_access_instructor` (`content_access_mode = all_school_content`, `can_view_extra_content = true`) | full catalog of both disciplines AND Altro; can add any skill | (no restriction expected) |
| 5 | Direct-URL to advanced skill | as #1, copy a known advanced/Altro `skillId`, open `/skill/<id>` | 404 (notFound) | the video, secondary video, or teacher notes of the out-of-scope skill |
| 6 | Custom-plan / add-to-plan bypass | as #1, POST out-of-scope and Altro `skillId`s to `save_custom_selection` and `addSkillToPlan` (raw request) | rejection / no rows inserted | any out-of-scope `user_plan_items` row created (verify in DB) |
| 7 | Self-promotion bypass | as #1, POST a higher grade to `updateProfileGrade` and via a raw PostgREST UPDATE on `user_profiles` | both rejected (trigger raises) | `assigned_level_*` / `preparing_exam_*` changed |
| 8 | Post-exam promotion | `promote-after-exam.mjs` for a Shaolin-only pass (`--apply`) | promoted user sees the new Shaolin grade + regenerated exam plan; T'ai Chi unchanged; history preserved; `promotion_audit` row written | non-promoted users moving scope; the other discipline changing; manual items lost |
| 9 | Legacy landing preserved | open `/` and `/landing-legacy` | `/` = FESK landing (logo + "Fong Ttai / Abbondanza di pace"); `/landing-legacy` = horse + Confucius variant | the horse landing being the public default; `public/landing/cavallo-fuoco.svg` missing |

## Raw-request bypass test (scenarios 5-7)

With a student session (anon key + the student's access token), attempt direct PostgREST
calls and confirm they fail at the DB layer (not only hidden in the UI):

- `POST /rest/v1/user_plan_items` with an out-of-scope `skill_id` -> rejected by the
  `user_plan_items_owner` WITH CHECK (`is_skill_in_scope`).
- `PATCH /rest/v1/user_profiles?id=eq.<self>` setting `assigned_level_shaolin` to a more
  advanced grade -> rejected by `prevent_user_profile_privilege_changes`.
- Tentare singolarmente e insieme `profile_locked=false`, `content_access_mode=all_school_content`,
  `can_view_extra_content=true`, modifica `access_group_id`: tutti rifiutati dal trigger 0052.
  Nome, lingua e cambio modalità piano devono continuare a funzionare.
- `GET /rest/v1/skills?id=eq.<advanced skill not in plan>` -> returns 0 rows
  (`skills_read` RLS).

## Converted/legacy accounts

`skills_read` keeps skills already in a user's plan readable (so existing plan/exam joins
never break). If an existing account is repurposed as a locked student, run query 13 in
`verify-rollout.sql` to list plan items outside the new scope and clean them before
inviting. Brand-new invited users start with no out-of-scope items, so this only matters
for reused accounts.

## Pre-invite gate

Before inviting real users, `scripts/verify-rollout.sql` must show: RLS enabled on all
listed tables; `skills_read` using `is_skill_in_scope`; `handle_new_user` reading per-person invites and locale,
blocking on no match outside the empty-profile bootstrap; the all-access group seeded; the founder/admin backfilled to
all-access; exactly one school; `promote_user_after_exam` not executable by `authenticated`.

Verificare separatamente nella configurazione Auth che il signup pubblico sia
chiuso e il bootstrap di una nuova istanza avvenga prima dell'esposizione.
SQL applicato, configurazione Auth e collaudo autenticato sono tre verifiche
separate: la presenza delle colonne non dimostra da sola il provisioning.

## Verifica locale delle correzioni

`tests/sql/` esegue tutte le migrazioni su PostgreSQL usa-e-getta con interfaccia
Auth simulata e grant espliciti: prova trigger/RLS, locale, date e retry promozione.
Non dimostra i grant o la configurazione Auth della produzione.
I test unitari coprono origine configurata, firma/sessione/scadenza del grant
password e regressione dell'indice delle sessioni.
