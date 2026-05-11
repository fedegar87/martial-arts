# Architettura dell'app — analisi dettagliata

Data analisi: 2026-05-11. Repo: `skill-practice/` (single project, Next.js 16 App Router).

Questo documento descrive lo stato corrente dell'architettura. Si concentra su cosa esiste oggi nel codice, non su cosa potrebbe esistere. Per readiness multi-scuola vedi [architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md). Per scope, decisioni e roadmap vedi [../plan/current-plan.md](../plan/current-plan.md).

## 1. Panoramica

`skill-practice` è una PWA Next.js 16 single-tenant (FESK / Scuola Chang) per la pratica guidata di arti marziali tradizionali. Single-user in produzione, ma con schema, auth e RLS predisposti per multi-utente (federazione → scuole → allievi → ruoli).

Caratteristiche architetturali:

- **App Router puro per la UI**: Server Components per le letture di pagina, Server Actions per le mutazioni utente, route handler solo per auth/export, niente fetch client.
- **Tre livelli netti**: pagine in `src/app/`, presentazione in `src/components/`, dominio/dati in `src/lib/`.
- **Postgres come centro logico**: gran parte della logica transazionale vive in funzioni RPC Supabase, non in TypeScript.
- **Logica pura testabile** isolata in moduli `*-logic.ts` con suite `node --test` dedicate.
- **PWA "manuale"**: `next-pwa` è installato ma non wirato; il service worker è in [skill-practice/public/sw.js](../skill-practice/public/sw.js).

## 2. Stack tecnico

Fonte: [skill-practice/package.json](../skill-practice/package.json).

| Strato | Scelta | Versione |
| --- | --- | --- |
| Framework | Next.js App Router | 16.2.4 |
| Runtime | React | 19.2.4 |
| Linguaggio | TypeScript strict | ^5 |
| Stile | Tailwind CSS v4 + shadcn/ui (preset Nova) | ^4 / ^4.5 |
| Icone | lucide-react | ^1.11 |
| Auth + DB | Supabase (Postgres + Auth) | `@supabase/ssr` ^0.10, `@supabase/supabase-js` ^2.104 |
| PWA | service worker statico + manifest | `next-pwa` ^5.6 installato ma inutilizzato |
| Lint | ESLint 9 + `eslint-config-next` | — |
| Test | `node --test` nativo | — |

**Script npm rilevanti** ([skill-practice/package.json](../skill-practice/package.json)):

- `dev` → `next dev --webpack` (Turbopack disabilitato per bug locale, vedi [plan §3](../plan/current-plan.md))
- `build` → `next build` (con Turbopack di build, verde)
- `lint` → `eslint`
- `test` → `node --test` sulle 10 suite in `src/lib/*.test.ts`

Non esiste uno script `typecheck` dedicato: i tipi sono verificati implicitamente da `next build`.

## 3. Struttura del repository

Convenzioni di workspace in [CLAUDE.md](../CLAUDE.md) e [skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md).

```
martial-arts/
├── CLAUDE.md                          # istruzioni Claude root
├── plan/current-plan.md               # fonte di verità workspace
├── docs/                              # questo documento + multitenancy readiness
├── archive/                           # ricerca storica (read-only)
└── skill-practice/
    ├── CLAUDE.md                      # regole concrete implementazione
    ├── public/
    │   ├── sw.js                      # service worker manuale
    │   ├── manifest.json
    │   ├── offline.html
    │   └── icons/
    ├── src/
    │   ├── proxy.ts                   # auth gate Next 16 (ex middleware.ts)
    │   ├── app/
    │   │   ├── (auth)/                # pubbliche: login, forgot-password
    │   │   ├── (app)/                 # pagine app autenticate
    │   │   ├── (legal)/                # pubbliche: privacy, terms, cookies, disclaimer
    │   │   ├── auth/                   # callback, confirm, update-password
    │   │   └── layout.tsx              # shell HTML, font, theme
    │   ├── components/                # raggruppati per feature
    │   ├── lib/
    │   │   ├── supabase/              # client.ts, server.ts, middleware.ts
    │   │   ├── queries/                # letture (server-only)
    │   │   ├── actions/                # mutazioni ("use server")
    │   │   ├── *-logic.ts              # logica pura
    │   │   ├── types.ts                # mirror DB + tipi UI
    │   │   └── *.test.ts               # suite node:test
    ├── supabase/
    │   └── migrations/                 # 21 file SQL numerati 0001-0021
    └── scripts/generate-fesk-seed.mjs  # generatore seed FESK
```

Regole strutturali vincolanti ([skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md)):

- Nuove route protette in `(app)/`, pubbliche in `(auth)/` o `(legal)/`.
- Lettura DB delle pagine **solo** in `lib/queries/*` invocato da Server Components; eccezioni esplicite per route handler auth/export.
- Mutazione applicativa **solo** in `lib/actions/*` con direttiva `"use server"`; auth callback/confirm restano route handler.
- Niente `services/`, `helpers/`, `data/`, `api/` custom.
- Niente hook client per leggere dati (sarebbero anti-pattern App Router).
- Niente import di codice server da Client Components.

## 4. Architettura applicativa

### 4.1 Route groups e segmenti

`src/app/` usa tre route group:

- **`(app)/`** — 13 segmenti pagina protetti: `hub`, `today`, `programma`, `library`, `skill/[skillId]`, `plan/exam`, `plan/custom`, `progress`, `calendar`, `news`, `onboarding`, `profile`, `sessions/setup`. Include anche `profile/export/route.ts` come route handler autenticato per esportare i dati account.
- **`(auth)/`** — pubbliche: `login`, `forgot-password`.
- **`(legal)/`** — pubbliche: `privacy`, `terms`, `cookies`, `disclaimer`.
- **`auth/`** (non group) — `auth/callback/route.ts` (exchange code Supabase), `auth/confirm/route.ts` (invite/recovery con `token_hash`), `auth/update-password` (autenticato ma fuori `(app)`).

### 4.2 Auth gate ([skill-practice/src/proxy.ts](../skill-practice/src/proxy.ts))

Next 16 ha rinominato il middleware in `proxy`. Il file `src/proxy.ts` espone una funzione `proxy(request)` che delega a `updateSession` in [skill-practice/src/lib/supabase/middleware.ts](../skill-practice/src/lib/supabase/middleware.ts).

Flusso:

1. `NextResponse.next` mutabile + `createServerClient` con cookies request-bound.
2. `supabase.auth.getUser()` refresha il cookie di sessione.
3. Path matchato contro `PROTECTED_PREFIXES` (`/hub`, `/today`, `/programma`, `/library`, `/skill`, `/plan`, `/profile`, `/onboarding`, `/news`, `/progress`, `/sessions`) e `AUTHENTICATED_ONLY` (`/auth/update-password`).
4. Se manca user e il path è protetto → redirect a `/login?next=<path>`. Nota: `login` oggi ignora `next` e manda alla destinazione calcolata da `resolveLandingDestination`; l'allowlist in [skill-practice/src/lib/auth-validation.ts](../skill-practice/src/lib/auth-validation.ts) protegge invece i redirect di `auth/callback` e `auth/confirm`.
5. Matcher esclude `_next/static`, `_next/image`, `favicon.ico`, `manifest.json`, `sw.js`, asset immagine.

`/calendar` è una particolarità attuale: non è nel matcher applicativo del proxy, ma la pagina fa comunque `getCurrentProfile()` server-side e redirige a `/login` senza sessione. Conviene allinearlo a `PROTECTED_PREFIXES` al prossimo hardening.

### 4.3 Entrypoint Supabase

Il progetto mantiene tre entrypoint separati per i diversi contesti App Router:

- [skill-practice/src/lib/supabase/client.ts](../skill-practice/src/lib/supabase/client.ts) — `createBrowserClient` per eventuali Client Components; al momento non è usato per letture dati.
- [skill-practice/src/lib/supabase/server.ts](../skill-practice/src/lib/supabase/server.ts) — `createServerClient` con cookies da `next/headers`, `try/catch` su `cookieStore.set` per i Server Components read-only.
- [skill-practice/src/lib/supabase/middleware.ts](../skill-practice/src/lib/supabase/middleware.ts) — helper invocato da `src/proxy.ts` per refresh sessione.

### 4.4 Server Components per le letture

Convenzione: ogni file in `lib/queries/*` inizia con `import "server-only";`, crea il client server e ritorna dati tipati.

Esempio rappresentativo, [skill-practice/src/lib/queries/skills.ts](../skill-practice/src/lib/queries/skills.ts):

```ts
import "server-only";
import { createClient } from "../supabase/server";

export async function listAccessibleSkills(...) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("discipline", discipline)
    .gte("minimum_grade_value", userGradeValue)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data ?? []) as Skill[];
}
```

Le query filtrano per `discipline` e `minimum_grade_value`. Alcune **non** filtrano `school_id`: in single-tenant non è un bug, in multi-tenant lo sarebbe (vedi [architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md)).

### 4.5 Server Actions per le mutazioni

Pattern in [skill-practice/src/lib/actions/](../skill-practice/src/lib/actions/):

1. `"use server";` in cima al file.
2. `createClient()` server + `supabase.auth.getUser()` con early return `{ error: "Sessione scaduta" }` se manca.
3. Validazione input server-side (`validateSelectedExams`, `optionalUuid`, `normalizeNote`).
4. Mutazione:
   - **Semplice**: `supabase.from(table).insert/update/upsert/delete(...)`.
   - **Complessa o transazionale**: `supabase.rpc("activate_exam_mode", ...)`, `rpc("save_custom_selection", ...)`, `rpc("update_plan_item_status", ...)`, `rpc("hide_plan_item", ...)`. Tutta la logica di stato del piano vive in Postgres, non in TS.
5. `revalidatePath()` sulle rotte affette (`/today`, `/programma`, `/library`, `/progress`, `/skill/[id]`, `/calendar`).
6. Opzionale `redirect()` finale.
7. Ritorno `{ success: true } | { error: string } | null` con tipo dedicato (`PracticeFormState`, `PlanFormState`).

Le form action multi-step usano la signature `(_prev, formData) => state` per essere consumate da `useActionState` lato Client.

### 4.6 Componenti

Sotto [skill-practice/src/components/](../skill-practice/src/components/) tutto è raggruppato per feature: `today/`, `library/`, `programma/`, `plan/`, `skill/`, `sessions/`, `calendar/`, `progress/`, `profile/`, `news/`, `hub/`, `landing/`, `legal/`. Trasversali in `shared/` (header, BottomNav, EmptyState, AppRouteSkeleton). `ui/` contiene gli output shadcn (non modificabili a mano).

PWA: registrazione SW in [skill-practice/src/components/pwa/ServiceWorkerRegister.tsx](../skill-practice/src/components/pwa/ServiceWorkerRegister.tsx), solo in `NODE_ENV === "production"`.

## 5. Modello dati

### 5.1 Migrazioni

21 file in [skill-practice/supabase/migrations/](../skill-practice/supabase/migrations/) (numerazione `NNNN_descr.sql`). Stratificazione storica:

| Range | Tema |
| --- | --- |
| 0001-0002 | Schema base, RLS, seed scuola/skill iniziale |
| 0003-0004 | Evoluzione FESK (gradi Chi/Chieh, discipline Shaolin/T'ai Chi) + seed FESK generato |
| 0005-0011 | Modalità piano (`exam`/`custom`), news, reflections, RPC piano dual-persistence |
| 0012 | `training_schedule` + reps su `practice_logs` |
| 0013-0014, 0020 | Aggiunte URL video skill |
| 0015 | Discipline esame in schedule |
| 0016 | Privacy account (trigger immutable + deletion requests) |
| 0017-0018 | Hardening RPC esami |
| 0019 | Semplificazione `plan_status` (collasso `review`→`maintenance`) |
| 0021 | Unique log giornaliero + RPC `update_plan_item_last_practiced_at` |

Convenzione: niente modifiche manuali dal pannello Supabase; ogni cambio passa da migration ([skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md) §"Pattern dati"). Workflow operativo per applicare migration: SQL copia-incolla nel SQL Editor Supabase (CLI non in PATH, app su Vercel + DB cloud).

### 5.2 Tabelle principali ([skill-practice/supabase/migrations/0001_schema.sql](../skill-practice/supabase/migrations/0001_schema.sql))

**Statiche (per scuola):**

- `schools` — tenant root (con `id`, `name`, `description`).
- `skills` — catalogo tecniche, FK a `school_id`, colonne `category`, `discipline`, `minimum_grade_value`, `video_url`, `display_order`.
- `exam_programs` — esami per livello, FK a `school_id`, `discipline`.
- `exam_skill_requirements` — junction `(exam_id, skill_id, default_status)`. **Mai JSONB**: vincolo esplicito da [plan §4.1](../plan/current-plan.md) per consentire query e indici puliti.

**Dinamiche (per utente):**

- `user_profiles` — PK = `auth.users.id`, FK a `school_id`, colonne `assigned_level_shaolin`, `assigned_level_taichi`, `preparing_exam_id`, `preparing_exam_taichi_id`, `plan_mode` (`exam`/`custom`), `role` (`student`/`instructor`/`admin`), `last_news_seen_at`.
- `user_plan_items` — `(user_id, skill_id)` unique. Colonne `status` (`focus`/`maintenance`), `source` (`exam_program`/`manual`), `is_hidden`, `last_practiced_at`.
- `practice_logs` — `(user_id, skill_id, date)` unique (0021), indice `(user_id, date DESC)`. Colonne `completed`, `personal_note`, `reps_target`, `reps_done`.
- `training_schedule` — `(user_id)` PK. `weekdays int[]`, `cadence_weeks`, `reps_per_form`, `start_date`, `end_date`, `exam_disciplines text[]` con check.
- `news_items` — bacheca per scuola, lette/non lette via `last_news_seen_at`.
- `account_deletion_requests` — coda richieste cancellazione, unique parziale `WHERE status = 'pending'`.
- `weekly_reflections` (Sprint 2 successivamente collassato).

### 5.3 RLS

RLS abilitata **su ogni tabella al momento della sua introduzione** (vincolo [skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md) §"Pattern dati"):

- **Statiche**: `FOR SELECT TO authenticated USING (true)`. Lettura pubblica per ogni utente loggato. Adatto a single-tenant, falla in multi-tenant.
- **Dinamiche**: `USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`. L'utente vede e scrive solo i propri record.
- **`account_deletion_requests`**: utente INSERT/SELECT proprie; admin (`user_profiles.role = 'admin'`) SELECT/UPDATE tutte.

**Trigger SECURITY DEFINER:**

- `handle_new_user` — crea automaticamente `user_profiles` quando arriva un nuovo `auth.users`.
- `prevent_user_profile_privilege_changes` ([migration 0016](../skill-practice/supabase/migrations/0016_profile_account_privacy.sql)) — blocca aggiornamento di `role` e `school_id` quando il chiamante è il proprietario autenticato. Limite noto: blocca anche l'admin che modifichi se stesso → cambi privilegi via service role / SQL Editor.

**Indici:**

- `idx_skills_school`, `idx_skills_minimum_level`, `idx_skills_category`.
- `idx_user_plan_items_user WHERE is_hidden = false` (parziale, per query "oggi").
- `idx_practice_logs_user_dt (user_id, date DESC)`.
- `idx_news_items_school_dt`.

### 5.4 RPC Postgres

La logica del piano vive in funzioni: `activate_exam_mode`, `switch_to_*`, `save_custom_selection`, `update_plan_item_status`, `hide_plan_item`, `update_plan_item_last_practiced_at`. Motivazione: atomicità (rimozione/insert/aggiornamento `last_practiced_at` non sono separabili in più round trip senza correre race).

### 5.5 Tipi condivisi

[skill-practice/src/lib/types.ts](../skill-practice/src/lib/types.ts) (193 righe) è scritto a mano e fa da mirror manuale dello schema in `snake_case`, senza layer generato Supabase. Il piano prescrive `supabase gen types typescript --local`, ma in pratica oggi è curato a mano. Domini coperti: enum (`Discipline`, `SkillCategory`, `PlanStatus`, `PlanItemSource`, `UserRole`, `NewsType`), entità statiche (`School`, `Skill`, `ExamProgram`, `ExamSkillRequirement`), entità utente (`UserProfile`, `UserPlanItem`, `PracticeLog`, `TrainingSchedule`, `NewsItem`), tipi UI derivati (`CalendarSkill`, `CalendarDayView`, `ScheduledPracticeItem`, `FreePracticeItem`).

## 6. Logica di business

Tutta isolata in moduli "puri" (no I/O, no dipendenze server) sotto [skill-practice/src/lib/](../skill-practice/src/lib/):

| File | Cosa fa |
| --- | --- |
| [practice-logic.ts](../skill-practice/src/lib/practice-logic.ts) | `getTodayPractice`: fallback senza schedule. Tutte le focus + le 4 maintenance meno praticate. |
| [session-scheduler.ts](../skill-practice/src/lib/session-scheduler.ts) | `getScheduledSession(date, schedule, items)`: distribuzione pesata 2:1 focus/maintenance su un ciclo di N settimane × M giorni. Algoritmo Bresenham-like per spaziare le occorrenze. Stati: `no_schedule`, `expired`, `rest_day`, `training`. |
| [calendar-logic.ts](../skill-practice/src/lib/calendar-logic.ts) | `buildCalendarDayView*`: aggrega sessione programmata + log per giorno, distingue `scheduled` vs `freePractice`, flag `canToggle`/`isFuture`. |
| [progress-logic.ts](../skill-practice/src/lib/progress-logic.ts) | `buildPracticeCalendar`: proietta 90 giorni di log in `{date, practiced}[]`. Calcola `readinessPercent` con `statusMaturityScore` (maintenance = 1.0 dopo 1.14). |
| [session-progress.ts](../skill-practice/src/lib/session-progress.ts) | Conteggio reps per sessione, stima 3 min/forma. |
| [grades.ts](../skill-practice/src/lib/grades.ts) | Scala FESK hardcoded (Chi 8→1, Chieh -1→-5, Mezza Luna -6→-7). `nextGradeValue` e `isSelectableExamGrade`. |
| [plan-manager.ts](../skill-practice/src/lib/plan-manager.ts) | `buildManualPlanItem(userId, skillId, status)`. |
| [onboarding-state.ts](../skill-practice/src/lib/onboarding-state.ts) | `isProfileOnboarded`: vero se custom mode o `preparing_exam_id` set. |
| [landing.ts](../skill-practice/src/lib/landing.ts) | `resolveLandingDestination` (`/today` o `/onboarding`). |
| [auth-validation.ts](../skill-practice/src/lib/auth-validation.ts) | Email regex, password 8-72, allowlist `next` per callback/confirm Supabase. |
| [youtube.ts](../skill-practice/src/lib/youtube.ts) | Parse di `watch?v=`, `embed/`, `shorts/`, `youtu.be`. |

Algoritmi chiave da capire prima di toccare il dominio: `session-scheduler.ts` (per la distribuzione delle forme) e `grades.ts` (per la semantica numerica della scala FESK — `-1` non è "primo livello avanzato" generico, è 1° Chieh).

## 7. PWA

[skill-practice/public/sw.js](../skill-practice/public/sw.js) (57 righe) è scritto a mano:

- Cache `kung-fu-practice-v2`.
- Precache `/offline.html`, `/manifest.json`, `/icon.svg`.
- `install` → `skipWaiting`.
- `activate` → cleanup cache vecchie + `clients.claim()`.
- `fetch` solo su GET same-origin; trattamento speciale per `/_next/static/`.

[skill-practice/public/manifest.json](../skill-practice/public/manifest.json): `display: standalone`, theme `#0f0f0f`, lingua `it`, icone SVG + PNG 192/512 + maskable 512.

[skill-practice/src/components/pwa/ServiceWorkerRegister.tsx](../skill-practice/src/components/pwa/ServiceWorkerRegister.tsx) registra `/sw.js` solo in produzione. `next-pwa` resta come dipendenza ma non è wirato in `next.config.ts`: rimozione bloccata da Windows che tiene aperti file in `node_modules`.

Comportamento offline: navigazioni autenticate non sono cachate (decisione di privacy: il logout non deve lasciare contenuto utente nel SW).

## 8. Sicurezza

Modello di minaccia da [plan §14](../plan/current-plan.md): MVP single-user, asset = account utente + dati di pratica + contenuti video (unlisted, non sensibili).

**Difese in posto:**

- Supabase Auth (hashing, sessioni, reset password) — niente JWT manuali.
- RLS abilitata su tutte le tabelle, owner-bounded sulle dinamiche.
- Trigger `prevent_user_profile_privilege_changes` blocca self-escalation di `role`/`school_id`.
- Auth gate in [skill-practice/src/proxy.ts](../skill-practice/src/proxy.ts).
- Allowlist sui redirect Supabase (`auth/callback`, `auth/confirm`) via [skill-practice/src/lib/auth-validation.ts](../skill-practice/src/lib/auth-validation.ts), contro open redirect.
- Security headers in [skill-practice/next.config.ts](../skill-practice/next.config.ts): HSTS, `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/microphone/geolocation chiusi).
- Logout client-side pulisce `localStorage`/`sessionStorage`/Cache best-effort.
- Min password 8 caratteri (NIST 2024 baseline, nessuna regex composta).
- Provisioning utenti solo admin (`Send invitation` via Supabase dashboard), no self-signup pubblico.

**Buchi noti:**

- Tabelle statiche leggibili da `authenticated USING (true)`: in multi-tenant un utente vedrebbe tutto. In single-tenant FESK è accettabile.
- Alcune query non filtrano `school_id` esplicitamente — la falla è speculativa finché c'è una sola scuola.
- Trigger anti-privilege-change blocca anche l'admin loggato → operatività privilegi via service role.

## 9. Testing

[skill-practice/package.json](../skill-practice/package.json) `test` → `node --test` nativo su 10 file `*.test.ts` in [skill-practice/src/lib/](../skill-practice/src/lib/): `youtube`, `practice-logic`, `progress-logic`, `session-scheduler`, `calendar-logic`, `landing`, `onboarding-state`, `auth-validation`, `grades`, `seed-fesk`.

**Coverage:** solo logica pura. Niente test su componenti, queries, actions, RPC, RLS. Nessuna suite E2E (no Playwright, no Vitest, no Jest). Verifica di queries/actions/policies è manuale tramite walkthrough nell'app.

## 10. Build, deploy, operatività

- **Dev:** `npm run dev` forza Webpack (`next dev --webpack`) — Turbopack dev panicava su `/login` in locale.
- **Build:** `next build` con Turbopack di build (verde).
- **Lint:** `eslint` + `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.
- **Type-check:** implicito nel build (nessuno script dedicato).
- **Hosting:** Vercel free tier, auto-deploy da `main`. Variabili di ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in Project Settings.
- **DB:** Supabase Frankfurt EU. Migration applicate copia-incolla nel SQL Editor (CLI non in PATH).
- **Video:** YouTube unlisted, no infrastruttura propria.
- **Costo totale a regime FESK:** 0 € (tutto su free tier).

## 11. Punti di forza

1. **App Router rigoroso** — Server Components + Server Actions ovunque. Niente waterfall client, niente prop drilling di stato remoto.
2. **Logica pura isolata e testata** — i moduli `*-logic.ts` sono unit-testabili senza DB e senza Next. Refactor della UI non rompe la matematica delle sessioni.
3. **RPC Postgres per le transazioni** — attivazione modalità, cambi piano, hide/restore: tutto atomico lato DB. Niente race da TypeScript.
4. **RLS dal primo migration** — ogni tabella protetta da subito, nessuna policy "permissive temporanea".
5. **PWA leggera** — SW manuale 57 righe, niente blackbox `next-pwa`. Comportamento prevedibile.
6. **Predisposizione multi-utente già nel modello** — `school_id` sulle entità statiche e su `user_profiles`, ruoli (`student`/`instructor`/`admin`), trigger anti-self-escalation. Falsa multi-tenancy a livello policy ma fondazione corretta.
7. **Documentazione viva** — il piano in [plan/current-plan.md](../plan/current-plan.md) è la fonte di verità, aggiornato a ogni Sprint, con archiviazione dei brief superati.

## 12. Punti deboli

1. **Semantica nascosta nei numeri di grado** — `-1` significa "1° Chieh FESK", non è generico. Render della scala in TS rende ogni futura scuola karate/judo un refactor non banale.
2. **Tabelle statiche con `USING (true)`** — leakage cross-tenant inevitabile se si attiva multi-tenant senza patch RLS. Vedi [architecture-multitenancy-readiness.md §1](architecture-multitenancy-readiness.md) righe 22 e 81.
3. **Categorie skill come enum DB+TS** — judo/aikido/taekwondo richiedono migration per ogni nuova categoria, non basta inserire una riga.
4. **Tipi `types.ts` curati a mano** — divergenza schema/tipi possibile, anche se oggi accettabile. Lo script `supabase gen types` prescritto dal CLAUDE.md non risulta usato.
5. **Niente test su componenti, queries, actions** — la safety net è solo sui moduli puri. Una regressione su RLS o su una RPC passa silenziosa.
6. **`next-pwa` dipendenza fantasma** — installato ma non wirato, sporca `package.json` e va rimosso quando Windows molla `node_modules`.
7. **Stringhe e label sparse** — "Scuola Chang", "Kung Fu Practice", terminologia FESK in `labels.ts`, componenti e legali. Riduzione del lock-in single-tenant possibile ma rimandata.
8. **No CI/CD oltre auto-deploy Vercel** — niente lint/build/test gate su PR. La verifica avviene localmente prima del push.

## 13. Cosa toccare con cautela

- **`grades.ts` + RPC `activate_exam_mode`/`save_custom_selection`** — la progressione dei livelli è incardinata sul valore numerico decrescente. Cambiare semantica richiede coordinare TS + Postgres + UI.
- **`session-scheduler.ts`** — l'algoritmo di distribuzione è coperto da test, ma cambia il peso `FOCUS_WEIGHT/MAINTENANCE_WEIGHT` e l'utente vede sessioni diverse il giorno dopo. Modifiche solo con design doc.
- **RLS** — qualunque cambio policy va testato con utente reale, non solo `EXPLAIN`. Lo schema RLS deve restare `enable + policies esplicite`, mai bypass via service role da Server Action.
- **`auth/callback/route.ts`, `auth/confirm/route.ts` + allowlist `next`** — qualunque allargamento del set di destinazioni post-auth va validato contro open redirect.
- **`practice_logs` unique key** — la pratica libera retroattiva e le sessioni programmate condividono la stessa tabella. Cambiare la chiave logica `(user_id, skill_id, date)` rompe entrambi i flussi.

## 14. Riferimenti

- Piano attivo: [../plan/current-plan.md](../plan/current-plan.md)
- Readiness multi-scuola: [architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md)
- Regole concrete d'implementazione: [../skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md)
- Convenzioni workspace: [../CLAUDE.md](../CLAUDE.md)
