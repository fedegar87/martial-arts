# Architettura e briefing operativo per LLM

Data aggiornamento: 2026-06-11. Repo: `martial-arts/`, app principale:
`skill-practice/`.

Questo documento e' la mappa tecnica canonica dell'app. Serve a dare contesto
a un altro LLM o a un nuovo maintainer prima di modificare il progetto. Descrive
lo stato corrente del codice nel workspace, non solo il piano storico.

## 0. Come usare questo documento

Leggi prima questa sezione se sei un agent/LLM.

1. Per il contesto tecnico parti da questo file.
2. Per scope, prodotto, decisioni strategiche e priorita leggi
   [../plan/current-plan.md](../plan/current-plan.md).
3. Per regole concrete di implementazione leggi
   [../skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md).
4. Per UI e componenti leggi
   [../skill-practice/docs/ui-system.md](../skill-practice/docs/ui-system.md).
5. Per lavoro recente di hardening/correzioni leggi
   [../skill-practice/docs/plans/2026-06-11-review-fixes.md](../skill-practice/docs/plans/2026-06-11-review-fixes.md).

Regola pratica: se il piano e il codice non coincidono, verifica il codice e
aggiorna il documento/piano invece di copiare assunzioni vecchie.

## 1. Sintesi del progetto

`skill-practice` e' una PWA Next.js per guidare la pratica personale di arti
marziali tradizionali, oggi centrata sul curriculum FESK / Scuola Chang
Shaolin + T'ai Chi. Il valore principale e': "oggi fai questi esercizi",
con video YouTube unlisted, piano per esame o selezione personale, sessioni
programmate, diario pratica, progresso e promemoria.

Stato prodotto:

- MVP personale single-user in produzione.
- Predisposizione multi-utente e multi-scuola a livello schema/RLS, ma dominio
  ancora FESK-first.
- Non e' un SaaS self-service, non e' un LMS, non ospita video, non sostituisce
  software gestionali di palestra/federazione.
- Auth e DB sono Supabase; hosting Vercel; video esterni su YouTube unlisted.

Principi architetturali:

- Next.js App Router con Server Components per letture pagina.
- Server Actions per mutazioni utente.
- Route handlers solo per auth, export e cron.
- Logica transazionale complessa in RPC Postgres.
- Logica algoritmica pura in `src/lib/*-logic.ts`, testata con `node --test`.
- Service worker statico manuale in `public/sw.js`; `next-pwa` e' stato rimosso.

## 2. Mappa documenti e ridondanze

Cartella [docs/](.) oggi contiene quattro documenti:

| Documento | Ruolo | Stato |
| --- | --- | --- |
| [architecture.md](architecture.md) | Briefing tecnico canonico per LLM/maintainer | Fonte tecnica primaria |
| [architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md) | Analisi approfondita multi-scuola/white-label | Da tenere separato: dettagli troppo specifici per il briefing |
| [performance-assessment.md](performance-assessment.md) | Diagnosi e piano performance | Da tenere separato, ma alcune sezioni sono superate da fix gia implementati |
| [marketing-video-promo-guide.md](marketing-video-promo-guide.md) | Guida operativa per video promozionale | Non tecnica, nessuna fusione con architettura |

Decisione documentale:

- Non cancellare documenti in `docs/` ora.
- Non fondere `architecture-multitenancy-readiness.md`: resta utile come deep
  dive quando si discute una seconda scuola.
- Non fondere `performance-assessment.md`: e' un piano operativo storico; questo
  file ne riporta solo lo stato tecnico corrente.
- Non fondere `marketing-video-promo-guide.md`: riguarda comunicazione, non
  architettura.
- Per ridurre ambiguita, `performance-assessment.md` e
  `architecture-multitenancy-readiness.md` hanno un banner di stato che rimanda
  a questo documento per lo stato corrente.

## 3. Struttura repository

```
martial-arts/
|-- README.md
|-- CLAUDE.md
|-- .github/workflows/
|   |-- ci.yml
|   `-- training-reminders.yml
|-- docs/
|   |-- architecture.md
|   |-- architecture-multitenancy-readiness.md
|   |-- performance-assessment.md
|   `-- marketing-video-promo-guide.md
|-- plan/
|   |-- current-plan.md
|   |-- README.md
|   |-- completed/
|   `-- reference/
|-- archive/
`-- skill-practice/
    |-- package.json
    |-- next.config.ts
    |-- vercel.json
    |-- public/
    |-- src/
    |-- supabase/migrations/
    `-- docs/
```

Cartelle importanti:

- `plan/current-plan.md`: fonte prodotto/strategia, contiene anche storico
  lungo; alcune parti storiche sono deliberatamente superate.
- `archive/`: ricerca e brief superati, read-only salvo esplicita richiesta.
- `skill-practice/`: unica app reale. Non e' monorepo.
- `skill-practice/docs/`: documenti tecnici interni all'app, soprattutto UI e
  piani di review/fix.

## 4. Stack tecnico corrente

Fonte primaria: [../skill-practice/package.json](../skill-practice/package.json).

| Area | Scelta |
| --- | --- |
| Framework | Next.js 16.2.4, App Router |
| React | React 19.2.4 |
| Linguaggio | TypeScript strict |
| Stile | Tailwind CSS v4, shadcn/ui, Radix UI, class-variance-authority |
| Icone | lucide-react |
| Auth/DB | Supabase Auth + Postgres, `@supabase/ssr`, `@supabase/supabase-js` |
| PWA | Service worker statico + manifest, niente `next-pwa` |
| Push | Web Push, VAPID, `web-push` |
| Hosting | Vercel, region fissata a `fra1` in `vercel.json` |
| Test | `node --test` nativo |
| Lint/typecheck | ESLint 9, `tsc --noEmit` |
| CI | GitHub Actions su push `main` e pull_request |

Script npm:

```json
{
  "dev": "next dev --webpack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-isolation=none ...",
  "ui:audit": "node scripts/ui-audit.mjs"
}
```

Note:

- `next dev` forza Webpack; Turbopack dev aveva dato problemi locali.
- `next build` usa il comportamento standard di Next 16.
- `next-pwa` non e' installato.
- `vercel.json` contiene `{"regions":["fra1"]}`.
- `next.config.ts` contiene solo security headers globali.

## 5. Convenzioni architetturali vincolanti

Le convenzioni sono intenzionali. Non introdurre nuove cartelle o pattern
senza aggiornare piano e documentazione.

| Necessita | Dove va |
| --- | --- |
| Nuova pagina protetta | `src/app/(app)/<feature>/page.tsx` |
| Nuova pagina auth pubblica | `src/app/(auth)/<name>/page.tsx` |
| Nuova pagina legale pubblica | `src/app/(legal)/<name>/page.tsx` |
| Route handler auth/export/cron | `src/app/**/route.ts` |
| Lettura DB per Server Component | `src/lib/queries/<entity>.ts` |
| Mutazione applicativa | `src/lib/actions/<entity>.ts` con `"use server"` |
| Logica pura testabile | `src/lib/<domain>-logic.ts` o simile |
| Tipi condivisi | `src/lib/types.ts` |
| Componente dominio | `src/components/<domain>/<Name>.tsx` |
| Primitiva custom UI | `src/components/primitives/<Name>.tsx` |
| Shell/shared app | `src/components/shared/<Name>.tsx` |
| Componenti shadcn | `src/components/ui/` |
| Migrazione DB | `supabase/migrations/NNNN_<descr>.sql` |

Vietato o da evitare:

- Niente `src/services/`, `src/data/`, `src/api/` custom.
- Niente hook client per leggere dati remoti (`useSkills`, `usePlan`, ecc.).
- Niente import server-only dentro Client Components.
- Niente modifiche manuali a `src/components/ui/` se il componente e' shadcn-managed.
- Niente localStorage/IndexedDB come storage primario.
- Niente upload video o storage video proprietario.
- Niente cache service worker su navigazioni autenticate.

## 6. Route map

Pagine:

| Route | Tipo | Scopo |
| --- | --- | --- |
| `/` | pubblica | Landing/entrypoint |
| `/login` | pubblica auth | Login email/password, consuma `next` sicuro |
| `/forgot-password` | pubblica auth | Richiesta reset password |
| `/auth/update-password` | auth-only | Cambio password dopo recovery |
| `/privacy`, `/terms`, `/cookies`, `/disclaimer` | pubbliche legal | Documenti legali custom con placeholder da completare |
| `/hub` | protetta | Home app con tile verso aree principali |
| `/today` | protetta | Sessione di oggi |
| `/programma` | protetta | Programma/piano attivo |
| `/library` | protetta | Catalogo Scuola Chang con filtri |
| `/skill/[skillId]` | protetta | Dettaglio tecnica + video + note |
| `/plan/exam` | protetta | Selezione piano da esame |
| `/plan/custom` | protetta | Selezione personale |
| `/sessions/setup` | protetta | Giorni, durata, ciclo e reps |
| `/calendar` | protetta | Calendario unificato sessioni + pratica libera |
| `/progress` | protetta | Progresso, streak, calendario, top skill |
| `/news` | protetta | Bacheca scuola |
| `/profile` | protetta | Profilo, gradi, account, sicurezza, privacy, reminder |
| `/onboarding` | protetta | Setup iniziale profilo/piano |

Route handlers:

| Route handler | Scopo |
| --- | --- |
| `/auth/callback/route.ts` | Exchange code Supabase; reset recovery confinato |
| `/auth/confirm/route.ts` | Invite/recovery con `token_hash` |
| `/profile/export/route.ts` | Export JSON dati utente |
| `/api/cron/training-reminders/route.ts` | Cron reminder push, protetto da `CRON_SECRET` |

Loading states:

- Esistono `loading.tsx` per le principali rotte in `(app)`: parent, today,
  programma, library, progress, news, calendar, hub, profile, plan/exam,
  plan/custom, sessions/setup, skill detail.
- `/progress` usa anche `Suspense` per sezioni indipendenti.

## 7. Auth, sessione e Supabase clients

Auth:

- Supabase Auth email/password.
- Provisioning pensato come invite/admin, non self-signup pubblico.
- Min password: 8 caratteri, max 72, senza regex complesse.
- Reset password passa da `/auth/callback` o `/auth/confirm`, poi forza
  `/auth/update-password`.
- Durante una sessione recovery, il cookie `auth_password_update` confina
  l'utente a `/auth/update-password`; le route protette redirectano li finche
  la password non viene aggiornata.
- Il login consuma `next` solo se `safeRedirectPath` lo valida come path interno
  protetto. Previene open redirect.

Auth gate:

- Next 16 usa `src/proxy.ts`, non `middleware.ts`.
- `proxy(request)` delega a `updateSession` in
  [../skill-practice/src/lib/supabase/middleware.ts](../skill-practice/src/lib/supabase/middleware.ts).
- `updateSession` crea un server client request-bound e chiama
  `supabase.auth.getUser()` per refresh sessione/cookies.
- `PROTECTED_PREFIXES` e' definito in
  [../skill-practice/src/lib/auth-validation.ts](../skill-practice/src/lib/auth-validation.ts).
- Matcher esclude asset statici, immagini, favicon, manifest e sw.

Supabase entrypoint:

| File | Uso |
| --- | --- |
| `src/lib/supabase/client.ts` | Browser client per Client Components quando serve |
| `src/lib/supabase/server.ts` | Server client con cookies da `next/headers` |
| `src/lib/supabase/middleware.ts` | Client request-bound per proxy/session refresh |
| `src/lib/supabase/admin.ts` | Service role server-only, usato dal cron reminder |

Profilo corrente:

- `getCurrentUser`, `getCurrentProfile`, `getCurrentProfileAccount` in
  `src/lib/queries/user-profile.ts` sono wrappati con `React.cache`.
- Questo deduplica chiamate dentro lo stesso render React, non attraversa il
  boundary proxy -> Server Components.

## 8. Flussi utente principali

Landing/login:

1. Utente apre `/`.
2. Se non loggato va a `/login`.
3. Dopo login, se `next` e' valido torna al deep link; altrimenti
   `resolveLandingDestination(profile)` manda a `/hub` o `/onboarding`.

Onboarding:

1. Profilo creato da trigger `handle_new_user`.
2. Utente imposta livelli Shaolin/T'ai Chi e sceglie esame o nessun esame.
3. `isProfileOnboarded` considera onboarded il profilo in custom mode o con
   esame preparato.

Piano:

- `exam`: il piano deriva da `exam_programs` + `exam_skill_requirements`;
  RPC Postgres attivano/cambiano esame in modo atomico.
- `custom`: l'utente seleziona manualmente skill; `save_custom_selection`
  mantiene il piano manuale per disciplina.
- Dual persistence: manuale ed esame coesistono via `source`, e il profilo
  sceglie `plan_mode`.

Allenamento:

1. `/sessions/setup` definisce weekdays, durata, lunghezza ciclo, reps e
   discipline incluse.
2. `/today` prende piano attivo + schedule e genera la sessione del giorno.
3. L'utente segna completamento, reps e note.
4. Le mutazioni aggiornano `practice_logs`, `user_plan_items.last_practiced_at`
   e revalidano le rotte impattate.

Calendario:

- `/calendar` mostra sessioni programmate, pratica libera retroattiva, note e
  toggles.
- Non permette di segnare giorni futuri.
- `practice_logs` e' la fonte comune per sessioni programmate e pratica libera.

Progresso:

- `/progress` mostra ciclo attivo, giorni praticati, streak, calendario 90
  giorni e top skill praticate.
- Aggregati globali/streak sono RPC SQL, non download storico completo.

## 9. Modello dati

Tipi condivisi:

- [../skill-practice/src/lib/types.ts](../skill-practice/src/lib/types.ts) e'
  un mirror manuale del DB in snake_case.
- Non c'e' ancora un layer generato Supabase `Database` completo.
- `SkillOption` e' un DTO snello per form client che non devono serializzare
  note/video/thumbnail.

Entita statiche:

| Tabella | Scopo |
| --- | --- |
| `schools` | Tenant/scuola |
| `skills` | Catalogo tecniche, con `school_id`, disciplina, categoria, video |
| `exam_programs` | Programmi esame per grado/disciplina |
| `exam_skill_requirements` | Junction esplicita exam -> skill, no JSONB |
| `news_items` | Bacheca scuola |

Entita utente:

| Tabella | Scopo |
| --- | --- |
| `user_profiles` | Profilo, scuola, gradi, esami, ruolo, mode piano |
| `user_plan_items` | Piano utente, source exam/manual, status focus/maintenance |
| `practice_logs` | Diario giornaliero per skill, note, reps, completed |
| `training_schedule` | Giorni e ciclo di allenamento |
| `weekly_reflections` | Storico/reflection introdotto in sprint precedenti |
| `account_deletion_requests` | Richieste cancellazione dati |
| `notification_preferences` | Preferenze reminder |
| `push_subscriptions` | Subscription Web Push browser/device |
| `notification_deliveries` | Storico deduplicato delivery reminder |

Campi/semantiche importanti:

- `Discipline = "shaolin" | "taichi"`.
- `PlanStatus = "focus" | "maintenance"`; `review` e' stato rimosso.
- `PlanItemSource = "exam_program" | "manual"`.
- `practice_logs` ha chiave logica unica `(user_id, skill_id, date)`.
- Date giornaliere sono stringhe `YYYY-MM-DD`; timestamp restano ISO string.
- `assigned_level_taichi = 0` significa "T'ai Chi non praticato".
- Gradi FESK usano numeri con semantica specifica: Chi 8..1, Chieh -1..-5,
  Mezza Luna -6..-7.
- `EXTRA_GRADE_VALUE = 99` rappresenta contenuti extra/fondamentali fuori
  programma esame.

## 10. Migrazioni DB

Le migration sono in
[../skill-practice/supabase/migrations/](../skill-practice/supabase/migrations/).
Il workflow operativo e' SQL Editor Supabase: la CLI non e' considerata
disponibile nel PATH.

Sequenza presente nel repo:

| Range | Tema |
| --- | --- |
| 0001 | Schema base, RLS iniziale, tabelle core |
| 0002 | Seed storico iniziale |
| 0003 | Evoluzione FESK: discipline, practice_mode, categorie, gradi |
| 0004 | Seed FESK generato |
| 0005-0011 | Plan mode, news/reflections, piani esame/manuale, dual persistence |
| 0012 | Training schedule e reps su practice_logs |
| 0013-0014 | URL video skill |
| 0015 | `exam_disciplines` su schedule |
| 0016 | Privacy/account, deletion requests, trigger privilege hardening |
| 0017-0018 | Hardening RPC e selezione esami |
| 0019 | Semplificazione status: solo focus/maintenance |
| 0020 | Altri URL video |
| 0021 | Unique `(user_id, skill_id, date)` + RPC last_practiced_at |
| 0022 | Aggregati progresso SQL |
| 0023 | RLS performance hardening con `(SELECT auth.uid())` |
| 0024 | Indice composito catalogo skills |
| 0025 | RPC top practiced skills |
| 0026 | Push reminders, subscriptions, deliveries |
| 0027 | Altri URL video |
| 0028 | Isolamento multi-tenant per scuola |
| 0029 | Altri URL video |
| 0030 | Secondo video per skill |
| 0031 | Altri URL video |
| 0032 | Fondamentali armi extra, grade sentinel 99 |
| 0033 | Streak calcolato sulla data locale app |
| 0034 | Drop indice duplicato practice_logs |
| 0035 | Revoke EXECUTE pubblico su RPC SECURITY DEFINER |
| 0036 | Hardening `handle_new_user` contro metadata tenant non fidati |

Stato applicazione DB:

- Il piano corrente dice che 0001-0028 sono applicate.
- 0033-0036 sono presenti nel repo come migration di hardening/fix; prima di
  assumere che siano applicate, verificare il DB Supabase reale.
- Ogni nuova modifica schema deve avere una migration numerata; niente cambio
  manuale da dashboard senza file corrispondente.

## 11. RLS e multi-tenancy

Stato reale del dominio:

- L'app e' single-tenant/FESK nella pratica.
- Il modello contiene `school_id` su contenuti statici e profili.
- La migration 0028 introduce isolamento per scuola su letture statiche e
  `WITH CHECK` tenant-aware su `user_plan_items`/`practice_logs`.
- Il dominio UI/TS resta FESK-first: discipline fisse, categorie cinesi,
  gradi Chi/Chieh/Mezza Luna, testi Scuola Chang.

RLS:

- Tabelle dinamiche: owner-bound su `auth.uid()`.
- Tabelle statiche: con 0028, lettura limitata alla scuola del profilo.
- `account_deletion_requests`: utente vede/inserisce proprie richieste; admin
  vede/aggiorna quelle della propria scuola.
- `notification_deliveries`: scrittura cron/service role, lettura utente sulle
  proprie delivery.

RPC SECURITY DEFINER:

- Necessarie per transazioni atomiche di piano/esame.
- La migration 0035 rimuove `EXECUTE` da `PUBLIC`/`anon` per le RPC mutanti e
  concede solo ad `authenticated`; verificare sul DB reale se e' gia applicata.

Limiti multi-scuola ancora veri:

- Non esiste tabella dinamica `disciplines`.
- Non esiste tabella `grade_levels`/`grade_scales`.
- Profilo ha colonne dedicate Shaolin/T'ai Chi.
- Pannello admin multi-scuola non esiste.
- Per una seconda scuola reale serve un flusso inviti/allowlist server-side; i
  metadata utente non bastano come fonte di tenant.

Per analisi completa vedi
[architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md).

## 12. Query, actions e RPC

Pattern query:

- Ogni file `src/lib/queries/*.ts` deve iniziare con `import "server-only";`.
- Le pagine Server Component chiamano query direttamente.
- Query user-scoped filtrano sempre per `user_id` o passano dal profilo.
- Query catalogo dovrebbero ricevere/filtrare `school_id` quando possibile.
- Nessuna query DB da Client Components.

Query files:

| File | Scopo |
| --- | --- |
| `account.ts` | Deletion/export account |
| `calendar.ts` | DayView calendario e skill options |
| `exam-programs.ts` | Programmi esame e requisiti |
| `news.ts` | Bacheca/unread |
| `plan.ts` | Piano utente |
| `practice-log.ts` | Log oggi/settimana/note |
| `progress.ts` | Aggregati progresso, streak, top skill |
| `push-notifications.ts` | Preferenze/subscription reminder |
| `skills.ts` | Catalogo e skill detail |
| `training-schedule.ts` | Schedule |
| `user-profile.ts` | User/profile corrente |

Pattern actions:

- File in `src/lib/actions/*.ts` con `"use server"`.
- Ogni action crea server client, chiama `auth.getUser()`, valida input, muta
  DB o RPC, poi `revalidatePath()` sulle route impattate.
- Return tipico: `{ success: true } | { error: string } | null`.
- Actions form multi-step usano signature `(_prev, formData) => state`.

Action files:

| File | Scopo |
| --- | --- |
| `account.ts` | Richiesta cancellazione account |
| `auth.ts` | Login, logout, reset/update/change password |
| `calendar.ts` | Toggle completamento per data, pratica libera |
| `news.ts` | Mark news seen |
| `onboarding.ts` | Setup iniziale e scelta esame |
| `plan.ts` | Piano exam/custom, add/hide/status |
| `practice.ts` | Segna pratica, note, reps |
| `profile.ts` | Profilo, gradi, mode |
| `push-notifications.ts` | Subscription e preferenze reminder |
| `training-schedule.ts` | Setup/reset schedule |

RPC principali:

- `activate_exam_mode`
- `switch_to_exam_mode`
- `switch_to_custom_mode`
- `save_custom_selection`
- `update_plan_item_status`
- `hide_plan_item`
- `update_plan_item_last_practiced_at`
- `count_practice_days`
- `current_practice_streak`
- `top_practiced_skills`

## 13. Logica di dominio pura

Moduli testabili in `src/lib/`:

| File | Responsabilita |
| --- | --- |
| `practice-logic.ts` | Fallback "oggi": focus tutti i giorni + maintenance meno praticate |
| `session-scheduler.ts` | Scheduler deterministico su ciclo N settimane x giorni |
| `calendar-logic.ts` | DayView calendario, scheduled/free, future/toggle |
| `progress-logic.ts` | Calendar 90 giorni, readiness, conteggi sessioni |
| `session-progress.ts` | Stato sessioni e reps su periodo |
| `grades.ts` | Scala FESK, label, next grade, esami selezionabili |
| `plan-manager.ts` | Costruzione item manuale |
| `onboarding-state.ts` | Profilo onboarded |
| `landing.ts` | Landing destination |
| `auth-validation.ts` | Email/password/redirect validation |
| `youtube.ts` | Parsing URL YouTube |
| `push-notifications.ts` | Helper puri per subscription/time/payload |
| `date.ts` | Date locali `YYYY-MM-DD`, default Europe/Rome |
| `perf.ts` | Timing helper server-only |

Scheduler:

- Input: data, schedule, plan items.
- Stati sessione: `no_schedule`, `expired`, `rest_day`, `training`.
- Focus pesa 2, maintenance pesa 1.
- Distribuzione deterministica tipo Bresenham per spaziare occorrenze nel ciclo.
- `cadence_weeks` e' lunghezza ciclo, non frequenza di ripasso generica.
- Cambiare peso o algoritmo cambia cosa vede l'utente il giorno dopo: farlo
  solo con test e decisione esplicita.

Practice logs:

- Una riga per `(user_id, skill_id, date)`.
- `completed=true` indica pratica completata.
- `reps_done > 0` conta come pratica significativa per progress/streak.
- Note vuote non devono cancellare note esistenti per errore.
- Toggle calendario preserva reps parziali e note quando neutralizza un log.

## 14. UI system

Riferimento operativo:
[../skill-practice/docs/ui-system.md](../skill-practice/docs/ui-system.md).

Cartelle:

- `src/components/ui/`: componenti shadcn-managed.
- `src/components/primitives/`: primitive custom senza dominio (`Chip`,
  `OptionCard`, `SegmentedNav`, `FormSelect`).
- `src/components/shared/`: shell, header, skeleton, empty state, asset app.
- `src/components/<domain>/`: componenti di feature.

Regole:

- Button variant `default` solo per CTA primaria.
- Chip e segmented controls non usano gold pieno come stato attivo.
- Stato "completato" e' uno stato, non CTA primaria; usare classi condivise in
  `src/lib/ui-classes.ts`.
- `FormSelect` usa font mobile-safe per evitare zoom iOS.
- Header e bottom sheets gestiscono safe-area PWA.
- Non aggiungere primitive se il pattern non ha almeno 3 callsite reali, salvo
  eccezione motivata.

Design:

- Tema scuro caldo/gold FESK in `src/app/globals.css`.
- Tailwind v4 via CSS theme, non `tailwind.config.ts`.
- Font e asset sono brand-specific, non ancora configurabili per tenant.
- Landing/hub possono essere piu editoriali; strumenti operativi restano densi
  e prevedibili.

## 15. PWA, offline e push

Service worker:

- File: [../skill-practice/public/sw.js](../skill-practice/public/sw.js).
- Cache name attuale: `kung-fu-practice-v3`.
- Precache: `/offline.html`, `/manifest.json`, `/icon.svg`.
- `install`: cache asset + `skipWaiting`.
- `activate`: elimina cache con nome diverso + `clients.claim`.
- `fetch`: solo GET same-origin.
- `/_next/static/`: cache-first, ma cache solo `response.ok`.
- Navigazioni: network-only con fallback `/offline.html`.
- Non cachea contenuto autenticato per privacy/logout.

Registrazione:

- `ServiceWorkerRegister` registra `/sw.js` solo in produzione.
- Le feature reminder possono registrare il SW on demand se serve.

Push reminders:

- UI reminder e' gated da `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- Preferenze in `notification_preferences`.
- Subscription in `push_subscriptions`.
- Delivery/dedup in `notification_deliveries`.
- Cron: `/api/cron/training-reminders`, runtime nodejs, auth con
  `Authorization: Bearer <CRON_SECRET>` o query `?secret=`.
- Sender: `src/lib/training-reminder-sender.ts`, usa service role e `web-push`.
- Payload costruito in `src/lib/push-notifications.ts`.

GitHub workflow:

- `.github/workflows/training-reminders.yml` puo chiamare manualmente il cron
  usando `TRAINING_REMINDER_CRON_URL` e `CRON_SECRET`.

## 16. Performance e operativita

Performance corrente:

- Vercel region fissata a `fra1`.
- `src/lib/perf.ts` logga timing se `NODE_ENV !== "production"` oppure
  `PERF_LOG=1`.
- `/today` strumenta profilo, piano, logs, news, schedule, reminder.
- `/progress` usa `Suspense` per sezioni e RPC SQL per aggregati.
- `/sessions/setup` parallelizza schedule e items.
- `/skill/[skillId]` parallelizza skill, plan items, note e log oggi.
- `/plan/custom` usa `SkillOption` DTO snello.

Documentazione performance:

- [performance-assessment.md](performance-assessment.md) e' utile come deep
  dive, ma alcune azioni elencate sono gia implementate. Verificare il codice
  prima di usare quel file come backlog.

Operativita:

- Hosting: Vercel free/Hobby.
- DB: Supabase cloud.
- Migrazioni: SQL Editor Supabase; niente assunzione di CLI locale.
- Env locali in [../skill-practice/.env.local.example](../skill-practice/.env.local.example).
- Build/deploy automatico da Vercel su branch configurato.
- CI GitHub esegue `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`.

Comandi locali standard:

```bash
cd skill-practice
npm run lint
npm run typecheck
npm test
npm run build
```

Per sviluppo:

```bash
cd skill-practice
npm run dev
```

## 17. Sicurezza e privacy

Difese in posto:

- Supabase Auth, niente JWT custom.
- Auth gate in `src/proxy.ts`.
- RLS su tutte le tabelle introdotte.
- 0028 aggiunge isolamento multi-tenant per scuola.
- Trigger `prevent_user_profile_privilege_changes` blocca self-change di
  `role` e `school_id`.
- La migration 0036 hardenizza `handle_new_user` ignorando metadata tenant in
  single-tenant; verificare sul DB reale se e' gia applicata.
- Redirect post-auth validati contro path interni.
- Recovery password confinato a update-password.
- Security headers in `next.config.ts`: HSTS, X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy.
- Export dati fallisce con 500 se una sezione query fallisce.
- Logout client-side pulisce local/session storage/cache best-effort.
- Service worker non cachea pagine autenticate.
- Cron protetto da `CRON_SECRET`.
- Service role usato solo server-only.

Privacy/compliance:

- Pagine custom `/privacy`, `/terms`, `/cookies`, `/disclaimer`.
- Molti dati legali non derivabili sono placeholder e richiedono revisione
  prima di apertura a utenti terzi.
- Cookie banner non necessario finche non entrano analytics/tracking/marketing.
- Export dati utente via `/profile/export`.
- Richiesta cancellazione via `account_deletion_requests`; esecuzione reale
  operativa/admin non e' un pannello self-service completo.

Verifiche esterne da non dimenticare:

- Supabase "require current password" per cambio password attuale dipende da
  configurazione server.
- Stato applicazione reale delle migration 0033-0036 va verificato su Supabase.
- VAPID/CRON env devono essere configurate su Vercel per abilitare reminder.

## 18. Testing

Suite attuale:

- `auth-validation.test.ts`
- `calendar-logic.test.ts`
- `grades.test.ts`
- `landing.test.ts`
- `onboarding-state.test.ts`
- `practice-logic.test.ts`
- `progress-logic.test.ts`
- `push-notifications.test.ts`
- `seed-fesk.test.ts`
- `session-scheduler.test.ts`
- `youtube.test.ts`

Coverage:

- Copre logica pura.
- Non copre componenti React.
- Non copre route handlers.
- Non copre RLS/RPC con DB reale.
- Non c'e' Playwright E2E.

Quando tocchi:

- `grades.ts`: aggiungi test.
- `session-scheduler.ts`: aggiungi test, perche cambia output utente.
- `calendar-logic.ts` o practice logs: aggiungi test dove possibile.
- RLS/RPC/migration: prepara smoke test manuale e rollback SQL.
- UI mobile/PWA: serve verifica manuale su viewport mobile o device.

## 19. Known risks e debito consapevole

Debito architetturale:

- Dominio FESK hardcoded in disciplina, gradi, categorie, testi e UI.
- `types.ts` e' manuale, puo divergere dallo schema DB.
- Nessun admin panel per contenuti/utenti.
- PWA manifest statico; non pronto per white-label runtime.
- No i18n/terminology layer.
- No test E2E/RLS.

Rischi funzionali:

- Session progress storico puo essere ricalcolato su composizione corrente del
  piano; il piano review 2026-06-11 segnala M7 come decisione aperta
  (fix log-based vs snapshot composizione).
- `getClaims` per ridurre round trip auth e' deferito perche dipende dalla
  configurazione JWT Supabase.
- Push/cron ha finding esclusi dal piano 2026-06-11 perche non prioritari.

Rischi multi-tenant:

- 0028 chiude una parte importante, ma una seconda scuola richiede flusso inviti
  robusto e validazione tenant server-side.
- Per scuole non simili a FESK serve refactor di discipline, gradi, categorie e
  concetto di esercizio.

## 20. Cosa fare quando si modifica il progetto

Checklist agent/LLM:

1. Leggi la richiesta utente piu recente.
2. Leggi questo documento e le sezioni rilevanti di `plan/current-plan.md`.
3. Controlla lo stato reale del codice con `rg`/letture mirate.
4. Rispetta la struttura `queries/actions/components/lib`.
5. Prima di editare, capisci se ci sono modifiche utente nel worktree.
6. Non revertire modifiche non tue.
7. Se aggiungi schema, crea migration numerata.
8. Se cambi route/tabella/componente core, aggiorna questo documento o il piano.
9. Esegui almeno i check rilevanti (`lint`, `typecheck`, `test`, `build`) se
   il cambio non e' solo documentale.
10. Nel resoconto finale indica cosa hai cambiato e cosa non hai potuto
    verificare.

Pattern per nuove feature:

- Nuova lettura: Server Component -> `lib/queries/*` -> Supabase.
- Nuova mutazione: Client/form -> Server Action -> Supabase/RPC ->
  `revalidatePath`.
- Nuova logica non-I/O: funzione pura in `src/lib`, test `node --test`.
- Nuova UI ripetuta: prima locale; estrarre in `primitives/` solo con callsite
  reali.
- Nuova tabella: migration con RLS abilitata e policy esplicite nello stesso
  ciclo.

## 21. Riferimenti rapidi

Tecnici:

- App: [../skill-practice](../skill-practice)
- Package: [../skill-practice/package.json](../skill-practice/package.json)
- Regole progetto: [../skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md)
- UI system: [../skill-practice/docs/ui-system.md](../skill-practice/docs/ui-system.md)
- Review fixes 2026-06-11:
  [../skill-practice/docs/plans/2026-06-11-review-fixes.md](../skill-practice/docs/plans/2026-06-11-review-fixes.md)
- Migrations:
  [../skill-practice/supabase/migrations](../skill-practice/supabase/migrations)

Prodotto/strategia:

- Piano attivo: [../plan/current-plan.md](../plan/current-plan.md)
- Indice piani: [../plan/README.md](../plan/README.md)
- Curriculum FESK:
  [../plan/reference/domain/curriculum-mapping-fesk.md](../plan/reference/domain/curriculum-mapping-fesk.md)
- Multi-tenancy:
  [architecture-multitenancy-readiness.md](architecture-multitenancy-readiness.md)
- Performance:
  [performance-assessment.md](performance-assessment.md)
- Video promo:
  [marketing-video-promo-guide.md](marketing-video-promo-guide.md)
