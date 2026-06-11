# Review fixes — implementation plan (2026-06-11)

> **Stato 2026-06-11:** implementato. Code-only: M5, M17, M6, L8, L7(parz.), L6, H2, M18, M16, M14, M15, L9, L4, L10, L3, U1(cleanup), M8, L12, M12(plan/custom), M3/L15. Migration create (da applicare a mano): `0033` M4, `0034` L14, `0035` L5, `0036` M2. Verifica: lint + typecheck + 79 test + build tutti verdi.
> **Deferiti (decisione/rischio):** M7 (log-based vs snapshot), M11 (getClaims: dipende da config JWT), L16 (race incremento server), M12 sessions/setup (query condivisa), M2 multi-scuola pieno (flusso invito = feature). Dettagli a fine documento.
>
> Deriva dalla code review multi-agente del 2026-06-11 (37 finding confermati + 1 incerto).
> **Esclusi da questo piano** i 9 finding push/cron (H1, M1, M9, M10, M13, L1, L2, L11, L13): le notifiche push non sono una priorità ora.
> Restano **19 finding** raggruppati in 6 fasi.

**Stack:** Next.js 16 App Router + Supabase (DB cloud-only). Le modifiche UI/logica sono code-only e sicure in single-tenant. Le modifiche RLS/SQL sono file migration che vanno **incollati a mano nel Supabase SQL Editor** (CLI non in PATH, vedi `feedback_db_changes_workflow`).

**Verifica dopo ogni fase:** `npm run lint && npm run typecheck && npm test && npm run build` (cwd `skill-practice`).

**Stato 0028:** la migration `0028_multitenant_isolation.sql` è **già applicata** in produzione (RLS school-scoped attiva). Questo declassa M3/L15 a "difesa in profondità latente", ma M2 (`handle_new_user`) resta un residuo reale.

**Ordine consigliato:** Fase 1 → 2 → 3 sono i bug che l'utente singolo vede oggi; 4 → 5 sono igiene PWA/perf; 6 è hardening multi-tenant latente (ultimo perché single-tenant oggi).

Numeri migration nuovi: `0033` (streak TZ), `0034` (drop indice duplicato), `0035` (grant RPC), `0036` (handle_new_user). Da applicare nell'ordine.

---

## Fase 1 — Correttezza dei log di pratica (priorità massima)

Bug che corrompono o falsano i dati di pratica del singolo utente oggi.

### 1.1 — M5: `incrementRep` de-completa una pratica già "fatta"
- **File:** [practice.ts:142-163](../../src/lib/actions/practice.ts#L142-L163)
- **Cambio:** nella select riga 143 aggiungere `completed`; nell'update riga 160 sostituire
  `completed: newDone >= effectiveTarget` con `completed: row.completed || newDone >= effectiveTarget`.
- Aggiornare il tipo locale `row` (riga 153) con `completed: boolean`.
- **Perché:** una skill segnata via "Segna praticato" (reps=0) non deve tornare incompleta al primo `+1`.
- **Test:** caso unità in `practice-logic.test.ts` se la logica di clamp viene estratta; altrimenti verifica manuale.

### 1.2 — M17: lo sheet "Nota pratica" non carica la nota e salvandolo vuoto la cancella
- **File componente:** [PracticeNoteButton.tsx:34-51](../../src/components/today/PracticeNoteButton.tsx#L34-L51) — passare la nota odierna esistente come stato iniziale (prop `initialNote`), idratata da `todayLogs` in [TodayPracticeSections.tsx](../../src/components/today/TodayPracticeSections.tsx).
- **File action:** [practice.ts:111-118](../../src/lib/actions/practice.ts#L111-L118) — in `savePracticeNote`, quando `normalizedNote === null` **e** il log esistente ha già una `personal_note` non vuota, **non** aggiornare (return success senza toccare il campo). Richiede di selezionare anche `personal_note` nella query riga 85.
- **Perché:** evitare la cancellazione silenziosa della nota; mostrare la nota reale alla riapertura.

### 1.3 — M6: i toggle calendario distruggono le ripetizioni parziali
- **File:** [calendar.ts:220-240](../../src/lib/actions/calendar.ts#L220-L240) e [calendar.ts:96-106](../../src/lib/actions/calendar.ts#L96-L106)
- **`neutralizeOrDeleteLog`** (220): cancellare solo se `reps_done === 0` **e** nota assente; altrimenti `update({ completed: false })` **preservando** `reps_done` (togliere `reps_done: 0` dall'update riga 236).
- **`addFreePracticeForDate`** (96-106): omettere `reps_done` e `reps_target` dal payload dell'upsert quando la riga può già esistere — PostgREST con `onConflict` aggiorna solo le colonne presenti, così non azzera lo storico reps. (Mantieni `completed: true`.)
- **Perché:** un doppio tap "Fatto"→"Non fatto" o un "Segna pratica libera" non deve perdere le reps reali né far sparire il giorno dallo streak.

### 1.4 — L8: `PracticeCompletionToggle` non si risincronizza con la prop server
- **File:** [PracticeCompletionToggle.tsx:28](../../src/components/calendar/PracticeCompletionToggle.tsx#L28)
- **Cambio:** sostituire `useState(done)` con `useOptimistic(done, (_, next: boolean) => next)`, così la base segue la prop dopo la revalidation; tenere in state solo l'override pendente.
- **Perché:** dopo "Segna" da `AddFreePracticeSheet` la riga programmata deve mostrare "Fatto".

### 1.5 — L7: race select-then-insert → errore Postgres grezzo
- **File:** [practice.ts](../../src/lib/actions/practice.ts) (`markPracticeDone` 23-53, `savePracticeNote` 83-118, `incrementRep` 142-174)
- **Cambio:** allineare a `calendar.ts` usando `upsert(..., { onConflict: "user_id,skill_id,date" })` invece di select+insert. Per `incrementRep`, dato che il nuovo valore dipende dal precedente, in alternativa intercettare il codice `23505` e ritentare la lettura una volta.
- **Priorità bassa:** la race richiede due client indipendenti (due tab / replay offline); dal singolo tab React serializza. Farlo insieme a 1.1/1.2 perché tocca lo stesso file.

### 1.6 — L6: durata pianificazione off-by-one
- **File:** [training-schedule.ts:57-58](../../src/lib/actions/training-schedule.ts#L57-L58)
- **Cambio:** `endDate = addDaysToDateKey(startDate, durationWeeks * 7 - 1)`. Il CHECK `end_date > start_date` resta soddisfatto.
- **Perché:** un piano "4 settimane" deve contenere 4 sessioni per weekday, non 5.
- **Test:** aggiungere un caso in `session-scheduler.test.ts` o `calendar-logic.test.ts` sul conteggio sessioni.

### 1.7 — M4: streak SQL in UTC mentre i log sono Europe/Rome *(SQL — migration 0033)*
- **File:** nuova `supabase/migrations/0033_streak_local_date.sql` che fa `CREATE OR REPLACE FUNCTION public.current_practice_streak` aggiungendo parametro `p_today DATE` e usando `cursor_date := p_today` (al posto di `CURRENT_DATE`, righe 30/44 di [0022](../../supabase/migrations/0022_progress_aggregates.sql#L30-L48)). Mantieni la tolleranza "oggi saltato".
- **File chiamante:** [progress.ts:53](../../src/lib/queries/progress.ts#L53) — `supabase.rpc("current_practice_streak", { p_user_id: userId, p_today: localDateKey() })`.
- **Alternativa senza param:** `cursor_date := (now() AT TIME ZONE 'Europe/Rome')::date` — più semplice ma fissa il TZ nel DB. Preferire il parametro per coerenza con `localDateKey`.
- **Applicazione:** fornire SQL copia-incolla per il SQL Editor (la funzione è `CREATE OR REPLACE`, sicura).
- **Perché:** lo streak in `/progress` deve coincidere col calendario 90 giorni nella stessa pagina anche nella finestra dopo mezzanotte.

### 1.8 — M7: i conteggi del ciclo sono riscritti retroattivamente da ogni modifica al piano
- **File:** [session-progress.ts:97-194](../../src/lib/session-progress.ts#L97-L194) + [progress.ts:131-143](../../src/lib/queries/progress.ts#L131-L143)
- **Problema:** la composizione di ogni sessione (focus/maintenance) è ricalcolata dai plan item *correnti*; cambiare peso/nascondere una skill ridipinge le sessioni passate e fa regredire quelle già "rispettate".
- **Fix raccomandato (minimo, no schema):** per le date `<= todayKey`, calcolare lo stato sessione dai **log** invece che dalla composizione corrente. In `buildSessionProgressRow`, per le date passate considerare `completed` la sessione se il numero di log *meaningful* (`completed || reps_done > 0`) su quella data `>= exerciseTotal` dello slot. `exerciseTotal` (dimensione dello slot) è stabile rispetto al reshuffle di quali skill, quindi è robusto. Le date future restano calcolate dalla composizione.
- **Decisione aperta:** l'alternativa robusta al 100% è snapshottare la composizione del ciclo alla generazione (nuova tabella `cycle_session_items`) — più invasiva. **Da valutare con l'utente** prima di implementare: il fix log-based copre il caso reale senza schema; lo snapshot serve solo se in futuro si vuole ricostruire l'esatta assegnazione storica. Default consigliato: fix log-based.
- **Test:** estendere `session-progress` con un caso "plan item cambia dopo sessione completata → la sessione passata resta completed".

**Commit suggeriti Fase 1:** (a) practice.ts M5+M17+L7; (b) calendar.ts M6; (c) PracticeCompletionToggle L8; (d) training-schedule L6; (e) migration 0033 + chiamante M4; (f) session-progress M7 (dopo decisione).

---

## Fase 2 — Resilienza UX mobile

Tutto code-only. H2 è il più importante (rompe un flusso core su rete instabile).

### 2.1 — H2: i gestori di pratica non catturano i reject di rete → error boundary
- **File principali:** [PracticeCheckButton.tsx:21-32](../../src/components/today/PracticeCheckButton.tsx#L21-L32), [RepsCounter.tsx](../../src/components/today/RepsCounter.tsx), [PracticeCompletionToggle.tsx](../../src/components/calendar/PracticeCompletionToggle.tsx), [SkillStatusMenu.tsx](../../src/components/today/SkillStatusMenu.tsx), [AddFreePracticeSheet.tsx](../../src/components/calendar/AddFreePracticeSheet.tsx), [PracticeNoteButton.tsx](../../src/components/today/PracticeNoteButton.tsx)
- **Cambio:** avvolgere ogni `await <action>()` dentro la transition in `try/catch`. Nel `catch`: ripristinare lo stato ottimistico (`setDone(false)` ecc.) e settare un messaggio (`"Connessione assente, riprova."`) riusando lo stato `message` già presente dove c'è.
- **Perché:** un reject `fetch` non gestito in `startTransition` (React 19) sale all'error boundary `(app)/error.tsx` e smonta la pagina, perdendo il tap.
- **Nota:** valutare un piccolo helper condiviso (es. `runMutation(action, { onError })`) per non ripetere il pattern in 6 file, ma senza over-engineering — anche solo i 6 try/catch vanno bene.

### 2.2 — M18: `SkillStatusMenu` scarta il risultato dell'action (no-op silenzioso)
- **File:** [SkillStatusMenu.tsx:35-40](../../src/components/today/SkillStatusMenu.tsx#L35-L40)
- **Cambio:** `const result = await action(); if (result && "error" in result) { setMessage(result.error); setOpen(true); return; }`. Aggiungere uno stato `message` renderizzato sotto le opzioni (stesso pattern di `PracticeCompletionToggle`). Non chiudere lo sheet prima dell'esito.
- Si combina naturalmente col try/catch di 2.1.

### 2.3 — M16: zoom-on-focus iOS su select e textarea (font < 16px)
- **File:** [FormSelect.tsx:12](../../src/components/primitives/FormSelect.tsx#L12) — `text-sm` → `text-base md:text-sm` (stesso pattern di `input.tsx`).
- **File:** [PracticeNoteButton.tsx:92](../../src/components/today/PracticeNoteButton.tsx#L92) — idem sulla `<textarea>`.
- **Perché:** evita l'auto-zoom iOS in onboarding (select grado/esame) e nelle note.

### 2.4 — M14: `AppHeader` schiacciato sotto la status bar nel PWA installato
- **File:** [AppHeader.tsx:7](../../src/components/shared/AppHeader.tsx#L7)
- **Cambio:** `h-14` → `min-h-14`, così `pt-[env(safe-area-inset-top)]` fa crescere la barra invece di consumare il content box.
- **Verifica:** controllare visivamente su iPhone con notch in standalone; le icone home/profilo (48px) non devono finire sotto la status bar.

### 2.5 — M15: bottom sheet senza safe-area in basso
- **File:** [AddFreePracticeSheet.tsx:84](../../src/components/calendar/AddFreePracticeSheet.tsx#L84) e [SkillStatusMenu.tsx:49](../../src/components/today/SkillStatusMenu.tsx#L49)
- **Cambio:** aggiungere `pb-[env(safe-area-inset-bottom)]` al `SheetContent`, oppure centralizzare nella regola bottom-sheet condivisa in `globals.css`. Preferire la regola condivisa per coprire anche futuri sheet.
- **Perché:** l'ultimo bottone non deve cadere nella fascia gesture dell'home indicator.

### 2.6 — L16: `RepsCounter` perde i tap rapidi (bottoni disabilitati durante il round trip)
- **File:** [RepsCounter.tsx:33,53](../../src/components/today/RepsCounter.tsx#L33)
- **Cambio:** togliere `pending` dalla condizione `disabled` del bottone `+` (tenere il clamp su `completed`; il server già clampa al target), lasciando accodare le transition mentre `useOptimistic` accumula i delta. Tenere `optimisticReps === 0` come unica guard sul `-`.
- Coordinare con 2.1 (gestione errori) sullo stesso file.

### 2.7 — L17: `VideoPlayer` autoplay ignorato da iOS (doppio tap)
- **File:** [VideoPlayer.tsx:23-35](../../src/components/skill/VideoPlayer.tsx#L23-L35)
- **Valutazione:** è in larga parte comportamento di piattaforma; **nessuna correzione obbligatoria**. Se si vuole eliminare il secondo tap su iOS, renderizzare l'iframe direttamente (non il facade) per UA iOS, oppure variante `mute=1`. **Decisione:** lasciare invariato salvo richiesta esplicita; documentare il comportamento.

**Commit suggeriti Fase 2:** (a) error-handling H2 + M18 + L16 (componenti today/calendar); (b) safe-area M14 + M15; (c) zoom M16.

---

## Fase 3 — Auth & privacy

### 3.1 — L9: il link di recovery concede una sessione app completa senza forzare il cambio password
- **File:** [auth/confirm/route.ts:16-44](../../src/app/auth/confirm/route.ts#L16-L44), [auth/callback/route.ts:12-28](../../src/app/auth/callback/route.ts#L12-L28), [supabase/middleware.ts:19-65](../../src/lib/supabase/middleware.ts#L19-L65), [auth-validation.ts:1-10](../../src/lib/auth-validation.ts#L1-L10)
- **Cambio:**
  1. In `confirm` e `callback`, per il flusso recovery **ignorare `next`** e redirigere sempre a `/auth/update-password`; settare `PASSWORD_UPDATE_COOKIE` con `path: "/"` (non più solo `/auth/update-password`).
  2. In `updateSession`, finché il cookie `PASSWORD_UPDATE_COOKIE` è presente, redirigere **ogni** path protetto a `/auth/update-password` (l'utente non può navigare l'app con una sessione di solo-recovery).
  3. In `updatePassword` ([auth.ts:102-105](../../src/lib/actions/auth.ts#L102-L105)) aggiornare il clear del cookie al nuovo `path: "/"`.
- **Perché:** un link recovery non deve funzionare come magic-login permanente verso `/hub` ed export dati.
- **Nota:** `callback` è il percorso del flusso reset *interno* dell'app (vedi 3.2 / R1); `confirm` copre invite/recovery via token_hash. Coprire entrambi.

### 3.2 — L4: il `?next=` del middleware non viene mai consumato dal login
- **File:** [middleware.ts:58-64](../../src/lib/supabase/middleware.ts#L58-L64) (già setta `next`), [login/page.tsx](../../src/app/(auth)/login/page.tsx) + [LoginForm.tsx](../../src/app/(auth)/login/LoginForm.tsx), [auth.ts:36-37](../../src/lib/actions/auth.ts#L36-L37), [auth-validation.ts:6-10,62-66](../../src/lib/auth-validation.ts#L62-L66)
- **Cambio:** `LoginPage` legge `searchParams.next` e lo passa come hidden input nel form; `login` action valida il valore con un prefix-check contro `PROTECTED_PREFIXES` (estendere `isAllowedNextPath`/`ALLOWED_NEXT_PATHS` o introdurre un validatore prefix-based) e redirige lì se presente, altrimenti `resolveLandingDestination(profile)`.
- **Sicurezza:** validare contro path interni (no open-redirect): solo path che iniziano con `/` e matchano un prefix protetto.
- **Perché:** dopo scadenza sessione, un deep link a `/calendar` deve riportare a `/calendar`, non a `/hub`.

### 3.3 — L10: l'export dati omette sezioni in silenzio su errore query
- **File:** [profile/export/route.ts:14-99](../../src/app/(app)/profile/export/route.ts#L14-L99)
- **Cambio:** dopo il `Promise.all`, raccogliere gli errori (`[profileResult, planItemsResult, ...].filter(r => r.error)`); se non vuoto, `return NextResponse.json({ error: "Export incompleto, riprova." }, { status: 500 })` invece di coalescere a `[]`/`null`.
- **Perché:** un export GDPR incompleto non deve apparire completo (200 con sezioni mancanti).

### 3.4 — L3: `finishWithoutExam` / `selectExam` salvano gradi non validati
- **File:** [onboarding.ts:88-117](../../src/lib/actions/onboarding.ts#L88-L117) (e il ramo non-esame di `selectExam` 22-32)
- **Cambio:** rifiutare valori non presenti in `SHAOLIN_GRADES` / `TAICHI_GRADES` (import da `@/lib/grades`), come fa già `updateProfileGrade` in `profile.ts`. Sostituire il solo `Number.isFinite` con un check di appartenenza alla lista gradi.
- **Perché:** un grado bogus (es. 999) degrada `/programma`, `/plan/exam` e la libreria.

### 3.5 — U1: cambio password — verifica della password attuale *(config, non codice)*
- **File:** [auth.ts:137-149](../../src/lib/actions/auth.ts#L137-L149) — il codice passa `current_password` a `auth.updateUser` (campo tipizzato corretto), **ma** l'enforcement dipende dal setting server `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD`.
- **Azione:** **verificare sul progetto Supabase** che il setting "Secure password change / require current password" sia attivo (Dashboard → Authentication → Settings). Se off, un attaccante con sessione viva può ruotare la password chiamando direttamente `PUT /auth/v1/user`.
- **Codice (opzionale):** togliere il catch-all `message.includes("invalid")` (riga 145) che maschera errori generici come "password attuale errata".
- **Non è un fix di codice puro:** è una verifica/cambio di configurazione, da confermare con l'utente.

**Commit suggeriti Fase 3:** (a) recovery confinement L9 (confirm+callback+middleware); (b) login next L4; (c) export L10; (d) onboarding grade L3. U1 = task di verifica config separato.

---

## Fase 4 — Service worker statico (PWA non-push)

### 4.1 — M8: `cacheFirst` mette in cache risposte non-OK (404/500) per sempre
- **File:** [sw.js:75-83](../../public/sw.js#L75-L83)
- **Cambio:** cachare solo le risposte ok:
  ```js
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
  ```
- **Perché:** un 404 transitorio su un chunk hashato non deve restare servito cache-first a oltranza (ChunkLoadError ricorrente).

### 4.2 — L12: la cache `/_next/static` cresce senza limite tra i deploy
- **File:** [sw.js:1,12-21](../../public/sw.js#L12-L21)
- **Cambio:** ruotare `CACHE_NAME` per release (iniettare un build id), oppure in `activate` prunare le entry `/_next/static` non più necessarie. Opzione minima: bump manuale di `CACHE_NAME` a ogni deploy significativo; opzione migliore: derivare il suffisso da una env build-time.
- **Perché:** evitare accumulo monotòno di storage finché il browser sfratta l'intera origin (perdendo anche `offline.html`).
- **Nota:** richiede attenzione al ciclo di update SW (`skipWaiting` + `clients.claim` già presenti); cambiare `CACHE_NAME` forza il refresh cache al prossimo `activate`.

**Commit suggerito Fase 4:** un singolo commit `sw.js` (M8 + L12).

---

## Fase 5 — Performance

### 5.1 — M11: 3 round trip seriali di auth/profilo prima di ogni query dati
- **File:** [user-profile.ts:11-33](../../src/lib/queries/user-profile.ts#L11-L33)
- **Cambio:** in `getCurrentUser()` usare `supabase.auth.getClaims()` (verifica JWT locale) per ricavare l'id senza round trip, tenendo `getUser()` solo nel middleware (dove serve il refresh token). In alternativa, fetchare il profilo direttamente con `.eq("id", claims.sub)` collassando hop 2+3.
- **Caveat:** il guadagno senza-rete di `getClaims` richiede chiavi JWT asimmetriche abilitate sul progetto Supabase; il collasso hop 2+3 vale comunque. **Verificare** la config JWT prima di assumere il beneficio pieno.
- **Perché:** ~100-300ms di waterfall su ogni navigazione protetta.

### 5.2 — M12: `/plan/custom` e `/sessions/setup` serializzano righe skill complete nel payload client
- **File:** [plan/custom/page.tsx:19-50](../../src/app/(app)/plan/custom/page.tsx#L19-L50), [sessions/setup/page.tsx](../../src/app/(app)/sessions/setup/page.tsx), query [skills.ts:75-88](../../src/lib/queries/skills.ts#L75-L88)
- **Cambio:** mappare le righe in un DTO snello prima di passarle ai client component (pattern già presente in `getCalendarSkillOptions`, [calendar.ts:92-114](../../src/lib/queries/calendar.ts#L92-L114)). Passare `{id, name, name_italian, minimum_grade_value, category}[]` a `CustomSelectionForm` e l'equivalente ridotto a `SetupForm`. Opzionale: una variante `listSkillsForDisciplineSlim` con `select` esplicito invece di `select("*")`.
- **Perché:** evitare di serializzare `teacher_notes`, URL video, thumbnail e timestamp nel flight quando il form mostra nome+grado.

### 5.3 — L14: indice duplicato su `practice_logs` *(SQL — migration 0034)*
- **File:** nuova `supabase/migrations/0034_drop_duplicate_practice_logs_index.sql`:
  ```sql
  DROP INDEX IF EXISTS practice_logs_user_date_idx;
  ```
- `practice_logs_user_date_idx (user_id, date)` di [0021](../../supabase/migrations/0021_practice_logs_unique.sql#L47-L48) duplica `idx_practice_logs_user_dt (user_id, date DESC)` di 0001 (un btree serve entrambe le direzioni).
- **Applicazione:** SQL copia-incolla nel SQL Editor.
- **Perché:** `practice_logs` è il write-path più caldo; un indice ridondante in meno a ogni write.

**Commit suggeriti Fase 5:** (a) user-profile M11 (dopo verifica JWT); (b) DTO skills M12; (c) migration 0034 L14.

---

## Fase 6 — Hardening multi-tenant (latente, single-tenant oggi)

0028 è già applicata, quindi questi sono "difesa in profondità" salvo M2. Farli per ultimi e con cura (toccano RLS/funzioni).

### 6.1 — M2: `handle_new_user` assegna `school_id` dai metadata auth senza autorizzazione *(SQL — migration 0036)*
- **File:** [0028:122-150](../../supabase/migrations/0028_multitenant_isolation.sql#L122-L150) → nuova `supabase/migrations/0036_harden_new_user_tenant.sql` con `CREATE OR REPLACE FUNCTION public.handle_new_user`.
- **Cambio:** non fidarsi di `raw_user_meta_data->>'school_id'`. Opzioni:
  - **(A) Invite-only:** assegnare `school_id` server-side da una riga invito/allowlist keyed su `NEW.email`; se assente, errore (o scuola di default unica).
  - **(B) Validazione:** accettare lo `school_id` dei metadata solo se matcha una riga invito per quella email.
- **Decisione da prendere con l'utente:** quale modello di registrazione (oggi single-tenant, quindi una scuola di default è accettabile come interim). Default consigliato: ignorare i metadata e assegnare la scuola unica corrente finché non esiste un flusso di invito.
- **Perché:** in multi-scuola, un signup self-service non deve poter scegliere la propria scuola via metadata.

### 6.2 — M3 / L15: scoping `school_id` lato codice come difesa in profondità
- **File:** [skills.ts:12-110](../../src/lib/queries/skills.ts#L12-L110) (tutte le letture skill), confronto con il pattern già scoped in `news.ts` / `exam-programs.ts`.
- **Cambio:** passare `profile.school_id` alle query skill e aggiungere `.eq("school_id", schoolId)` su `listAccessibleSkills`, `listSkillsByCategory`, `getSkillById`, `listSkillsAtGrade`, `listSkillsForDiscipline`. Per `listSkillsForExam`, lo scope passa dal parent `exam_programs` (la tabella `exam_skill_requirements` non ha `school_id`): validare l'esame via `listExamProgramsForSchool` a monte.
- **Perché:** l'isolamento non deve dipendere solo dalla RLS di 0028; con `.eq` esplicito sopravvive anche a un eventuale rollback/errore di policy. Sblocca anche l'indice 0024 (L15) rendendo usabile il predicato `school_id`.
- **Costo:** richiede di passare `school_id` (dal profilo) attraverso i call-site; modifica diffusa ma meccanica. Spezzare per file/feature in commit separati.

### 6.3 — L5: RPC SECURITY DEFINER eseguibili da PUBLIC/anon *(SQL — migration 0035)*
- **File:** nuova `supabase/migrations/0035_revoke_public_execute_on_rpcs.sql`.
- **Cambio:** per ogni RPC SECURITY DEFINER che muta stato (firme **correnti**: `activate_exam_mode`, `switch_to_exam_mode`, `switch_to_custom_mode`, `save_custom_selection`, `update_plan_item_status`, `hide_plan_item` — usare le ultime definizioni in 0011/0018/0019/0028):
  ```sql
  REVOKE EXECUTE ON FUNCTION public.<fn>(<args>) FROM PUBLIC, anon;
  GRANT  EXECUTE ON FUNCTION public.<fn>(<args>) TO authenticated;
  ```
- **Attenzione:** la signature deve combaciare con l'ultima ridefinizione di ogni funzione (i tipi degli argomenti). Verificare contro le migration più recenti prima di scrivere il REVOKE.
- **Perché:** rimuovere la superficie strutturale (oggi protetta solo dal null-check nel corpo).

**Commit suggeriti Fase 6:** (a) migration 0036 M2 (dopo decisione modello signup); (b) code scoping M3/L15 (più commit per feature); (c) migration 0035 L5.

---

## Riepilogo applicazioni DB manuali (Supabase SQL Editor)

In ordine, fornirò SQL copia-incolla per:
1. `0033_streak_local_date.sql` (Fase 1.7 — M4) — urgente
2. `0034_drop_duplicate_practice_logs_index.sql` (Fase 5.3 — L14)
3. `0035_revoke_public_execute_on_rpcs.sql` (Fase 6.3 — L5)
4. `0036_harden_new_user_tenant.sql` (Fase 6.1 — M2) — dopo decisione modello signup

Tutte le altre modifiche sono code-only e verificate con `npm run lint && npm run typecheck && npm test && npm run build`.

## Decisioni aperte da chiudere prima di implementare
- **M7 (1.8):** fix log-based (consigliato) vs snapshot composizione con nuova tabella.
- **M2 (6.1):** modello di registrazione (scuola di default interim vs invite-gated).
- **U1 (3.5):** verifica setting Supabase require-current-password (non è codice).
- **L17 (2.7):** lasciare invariato il doppio-tap video iOS (consigliato) o forzare iframe diretto su iOS.
