# Architettura e briefing operativo per LLM

Data aggiornamento: 2026-11-07. Repo: `martial-arts/`, app principale:
`skill-practice/`.

Questo documento e' la mappa tecnica canonica dell'app. Serve a dare contesto
a un altro LLM o a un nuovo maintainer prima di modificare il progetto. Descrive
lo stato corrente del codice nel workspace, non solo il piano storico.

## 0. Come usare questo documento

Leggi prima questa sezione se sei un agent/LLM.

1. Per il contesto tecnico parti da questo file.
2. Per scope, prodotto, decisioni strategiche e priorita leggi
   [../plan/current-plan.md](../plan/current-plan.md).
3. Per evoluzione white-label, altre scuole Chang o altre arti marziali
   (es. Taekwondo) leggi **obbligatoriamente**
   [../plan/white-label-strategy.md](../plan/white-label-strategy.md) (regola
   zero: niente over-engineering o astrazioni anticipate prima del trigger).
4. Per regole concrete di implementazione leggi
   [../skill-practice/CLAUDE.md](../skill-practice/CLAUDE.md).
5. Per UI e componenti leggi
   [../skill-practice/docs/ui-system.md](../skill-practice/docs/ui-system.md).
6. Per debito ancora aperto e verifiche da completare usa le sezioni 17 e 19.

Regola pratica: se il piano e il codice non coincidono, verifica il codice e
aggiorna il documento/piano invece di copiare assunzioni vecchie.

## 1. Sintesi del progetto

`skill-practice` e' una PWA Next.js per guidare la pratica personale di arti
marziali tradizionali, oggi centrata sul curriculum FESK / Scuola Chang
Shaolin + T'ai Chi (`FESK Practice`). Il valore principale e': "oggi fai questi
esercizi", con video YouTube unlisted, piano per esame o selezione personale,
sessioni programmate, diario pratica, progresso e promemoria.

Stato prodotto:

- Rollout FESK invite-only in produzione (`access_groups`, `user_invites`,
  profilo bloccato per studenti e sblocco progressivo per grado).
- Identita testuale e manifest PWA centralizzati in `src/lib/brand.ts` e
  `src/app/manifest.ts`; dominio DB/UI ancora FESK-first per scelta deliberata
  fino all'arrivo di una seconda organizzazione reale (vedi
  [../plan/white-label-strategy.md](../plan/white-label-strategy.md)).
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

## 2. Mappa documenti

Documenti correnti del workspace:

| Documento | Ruolo | Stato |
| --- | --- | --- |
| [architecture.md](architecture.md) | Briefing tecnico canonico per LLM/maintainer | Fonte tecnica primaria |
| [video-tutorial-setup.md](video-tutorial-setup.md) | Setup degli strumenti video | Procedura ripetibile |
| [marketing-video-promo-guide.md](marketing-video-promo-guide.md) | Guida operativa per video promozionale | Non tecnica, nessuna fusione con architettura |

I piani conclusi sono rimossi dopo il consolidamento delle decisioni; lo storico e' in Git. I report con attivita' ancora aperte e le evidenze di ricerca restano.

La strategia white-label, multi-istanza e generalizzazione multi-arte marziale
vive ora in un unico documento canonico:
[../plan/white-label-strategy.md](../plan/white-label-strategy.md) (che ha
assorbito e sostituito il vecchio `architecture-multitenancy-readiness.md`).

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
|   |-- video-tutorial-setup.md
|   `-- marketing-video-promo-guide.md
|-- plan/
|   |-- current-plan.md
|   |-- white-label-strategy.md
|   |-- README.md
|   |-- CLAUDE.md
|   `-- reference/
|-- archive/
`-- skill-practice/
    |-- package.json
    |-- next.config.ts
    |-- vercel.json
    |-- public/
    |-- scripts/
    |-- src/
    |-- tests/browser/
    |-- supabase/migrations/
    `-- docs/
```

Cartelle importanti:

- `plan/current-plan.md`: fonte prodotto/strategia, contiene anche storico
  lungo; alcune parti storiche sono deliberatamente superate.
- `archive/`: ricerca di mercato e validazione, read-only salvo esplicita richiesta.
- `skill-practice/`: unica app reale. Non e' monorepo.
- `skill-practice/docs/`: documenti correnti di UI, verifiche accessi e condizioni legali aperte.

## 4. Stack tecnico corrente

Fonte primaria: [../skill-practice/package.json](../skill-practice/package.json).

| Area | Scelta |
| --- | --- |
| Framework | Next.js 16.3.6, App Router |
| React | React 19.2.8 |
| Linguaggio | TypeScript strict |
| Stile | Tailwind CSS v4, shadcn/ui, Radix UI, class-variance-authority |
| Icone | lucide-react |
| Auth/DB | Supabase Auth + Postgres, `@supabase/ssr`, `@supabase/supabase-js` |
| PWA | Service worker statico (`public/sw.js`) + manifest dinamico (`src/app/manifest.ts` da `src/lib/brand.ts`), niente `next-pwa` |
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
- `vercel.json` fissa la regione `fra1`; l'integrazione Git Vercel pubblica i
  push su `main`. Il blocco temporaneo usato durante P4/P5 e' stato rimosso.
- `next.config.ts` contiene security headers globali e disabilita la cache
  persistente Turbopack delle build: verificato riuso di CSS obsoleto in locale
  e su Vercel dopo modifiche a `globals.css`. Il controllo del rilascio deve
  verificare HTML e CSS sul dominio pubblico, oltre allo stato del deploy.

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
| `/` | pubblica | Landing/entrypoint FESK (`FeskLandingHero`) |
| `/landing-legacy` | pubblica | Landing storica personale cavallo/Confucio preservata |
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
| `/calendar` | protetta | Sessioni, pratica libera, eventi federali e promemoria scelti |
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

Navigazione corrente (P5, 2026-11-07): la barra inferiore contiene Allenamento,
Programma, Scuola, Progressi e Profilo. Nell'header, nascosto sul hub, Home resta
a sinistra e Bacheca e' raggiungibile dalla campanella a destra, con stato attivo
su `/news`. Le nuove comunicazioni sono segnalate dal banner in Allenamento;
nessun badge globale o lettura DB aggiuntiva nel layout.
Nel hub la stessa campanella compare a destra dell'intestazione, senza barra
aggiuntiva o pulsante Home; resta anche la tile Bacheca. Entrambe le campanelle
usano `Button` ghost con target 48x48 e link `/news` con nome accessibile.

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
  mantiene il piano manuale per disciplina. Il filtro grado non modifica la
  selezione: `CustomSelectionForm` invia anche gli ID selezionati fuori filtro,
  senza duplicare quelli dei checkbox visibili. Il contatore riguarda la sola
  disciplina visualizzata; cambiare disciplina conserva le altre scelte.
  Un listener nativo impedisce il reset automatico dei checkbox dopo un errore
  dell'azione React. Nessun comando di selezione collettiva. La RPC continua a
  verificare utente, scuola e scope dei contenuti.
- Dual persistence: manuale ed esame coesistono via `source`, e il profilo
  sceglie `plan_mode`.

Regressione editor personale: dopo `npm run build`, eseguire
`npm run test:custom-selection` in `skill-practice/`. Usa esbuild e Chromium
gia' presenti in `tools/video/`, il componente reale e azioni simulate, senza
scritture al database; non aggiunge dipendenze all'app o alla CI.

Allenamento:

1. `/sessions/setup` definisce weekdays, durata, lunghezza ciclo, reps e
   discipline incluse.
2. `/today` prende piano attivo + schedule e genera la sessione del giorno.
3. L'utente segna completamento, reps e note. Nelle card di `/today` nota del
   maestro e contatore sono subito visibili; il video di ripasso
   (`TodayVideoDisclosure`) e' chiuso di default e monta `VideoPlayer` solo
   dopo il tap su "Ripassa il video". Aprire o guardare il video non segna la
   pratica.
4. Le mutazioni aggiornano `practice_logs`, `user_plan_items.last_practiced_at`
   e revalidano le rotte impattate.

Scheda tecnica e video (P2, 2026-11-07):

- `/skill/[skillId]` monta una sola variante valida; `?v=2` apre il secondo
  video. `SegmentedNav` usa `replace` e `scroll={false}` per i soli cambi
  variante, con etichette intere su mobile. Il link da `/today` al secondo
  video apre direttamente `?v=2` con normale navigazione. Il proxy conserva
  pathname e query nel parametro interno `next` del login; pagina e azione
  login continuano a validare la destinazione con `safeRedirectPath`.
- `lib/skill-video.ts` sceglie la prima sorgente valida se il parametro e'
  assente, ripetuto o non disponibile, e deduplica gli ID YouTube. `youtube.ts`
  valida ID, protocolli e host prima di costruire l'embed sul dominio fisso
  `youtube-nocookie.com`.
- Solo il player ha una key dipendente dal video: il cambio interrompe la
  riproduzione e torna a pre-play; azioni, stato pratica e bozze note restano
  associati alla tecnica. `SkillPracticeActions` riceve la nota del giorno
  gia' caricata dalla pagina.
- Il player ha altezza minima 200 px e usa `Button` per il pre-play. Non
  carica iframe, script o miniature Google prima di Play. L'eventuale
  `thumbnail_url` del principale e' ammessa solo nel formato
  `/video-thumbnails/<nome>.<png|jpg|jpeg|webp|avif>`, servita come asset locale
  senza ottimizzazione remota; il secondario non eredita quella miniatura.
  Errori dell'immagine ripristinano la superficie tipografica. Non vengono
  aggiunti meccanismi di consenso.

Ripasso video e liste (P2.2 / P3 ridotto, 2026-11-07):

- `YouTubePlayback` viene montato solo dopo Play, crea l'iframe in un
  contenitore di cui React non gestisce i figli e collega l'IFrame API tramite
  `lib/youtube-api.ts`. Lo script e' condiviso tra player, con timeout e retry.
  Se l'API fallisce l'iframe resta utilizzabile. Lo smontaggio distrugge il
  player senza lasciare iframe o callback attivi sul componente.
- Le velocita' `0,5x / 0,75x / 1x` compaiono solo se disponibili e in numero
  maggiore di uno; il valore selezionato segue l'evento confermato dall'API.
  Ogni nuova variante parte a 1x. `origin` deriva dal dominio corrente e il
  Referer conserva la policy `strict-origin-when-cross-origin`.
- `lib/skill-presentation.ts` omette nomi italiani vuoti o ridondanti e durate
  non valide. Programma e Scuola permettono il ritorno a capo di titolo e
  sottotitolo, senza nuovi badge di pratica o grado. Ogni riga ha un solo link;
  il menu di stato resta separato, con target di 44x44.
- Badge e filtro video includono il secondario valido, coerentemente con la
  scheda tecnica e senza interrogazioni DB aggiuntive.

Calendario:

- `/calendar` mostra sessioni programmate, pratica libera retroattiva, note e
  toggles.
- Non permette di segnare giorni futuri.
- `practice_logs` e' la fonte comune per sessioni programmate e pratica libera.
- Gli eventi federali non modificano cadenza, esercizi o stato della pratica.
  Una piccola icona li segnala nelle celle; nel giorno selezionato appaiono
  titolo, orario italiano e luogo. `CalendarEventCard` apre un Sheet condiviso,
  scorrevole su mobile, con dettagli, fonte ufficiale e Ricordamelo opzionale.
- `brand.calendar` configura pagina ufficiale, feed pubblico e fuso della fonte.
  `ical-events.ts` usa `ical.js` per timezone, all-day, ricorrenze ed eccezioni;
  `federation-event-sync.ts` salva anno corrente e successivo in Supabase.
  Il cron esistente sincronizza al massimo ogni ora: HTTPS/host vincolati,
  redirect rifiutati, timeout 10 s, limite 2 MB. Il browser non contatta Google.
  Un errore conserva l'ultimo snapshot e sospende i soli promemoria eventi.
- Per il primo import/manuale: `npm run sync:events` con `.env.local` e service
  role. Lo script non invia push. Migrazione 0049 applicata e primo import di
  52 eventi verificato il 2026-11-07.
- Gli eventi scelti sono inclusi nell'export personale; l'informativa descrive
  separatamente la disattivazione di allenamenti ed eventi.

Progresso:

- `/progress` mostra ciclo attivo, giorni praticati, streak, calendario 90
  giorni e top skill praticate.
- P4 (2026-11-07) sostituisce i due contatori del ciclo con un solo riepilogo
  fino a oggi e una barra accessibile; nessuna sessione prevista mostra un
  messaggio anziche' 0/0. Il calendario vuoto mostra un messaggio e un link ad
  Allenamento al posto della griglia. Nessuna sezione "Da rinfrescare", nuova
  metrica o intensita' calendario; query e criteri di completamento invariati.
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
| `access_groups` | Template di accesso per grado/ruolo + puntatori promozione |

Entita utente:

| Tabella | Scopo |
| --- | --- |
| `user_invites` | Pre-assegnazione email -> scuola/gruppo/livelli (invite-only) |
| `user_profiles` | Profilo, scuola, gradi, esami, ruolo, `profile_locked`, `content_access_mode` |
| `user_plan_items` | Piano utente, source exam/manual, status focus/maintenance |
| `practice_logs` | Diario giornaliero per skill, note, reps, completed |
| `training_schedule` | Giorni e ciclo di allenamento |
| `weekly_reflections` | Storico/reflection introdotto in sprint precedenti |
| `account_deletion_requests` | Richieste cancellazione dati |
| `notification_preferences` | Preferenze reminder |
| `push_subscriptions` | Subscription Web Push browser/device |
| `notification_deliveries` | Storico deduplicato delivery reminder |
| `federation_events` | Snapshot del calendario pubblico federale dell'istanza |
| `federation_event_reminders` | Eventi scelti dall'utente, RLS proprietario |

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
| 0037-0045 | Rollout FESK: `access_groups`, `user_invites`, `profile_locked`, scope RLS per livello, `skills.is_extra`, bulk ops e promozioni post-esame |
| 0046 | `is_skill_in_scope`: sblocco fino al livello successivo (quello in preparazione) |
| 0047 | `list_locked_skill_outline`: anteprima solo-titolo delle skill future bloccate |
| 0048 | Fix attribuzione video Mei Hua |
| 0049 | Calendario federale, sync atomica service role, promemoria e delivery eventi |

Stato applicazione DB:

- Le migrazioni `0001`–`0049` rappresentano lo schema e il seed FESK correnti.
- La migration `0050_i18n_content_and_notifications.sql` aggiunge traduzioni dei contenuti e lingua dei promemoria; applicazione in Supabase confermata dall'utente il 2026-11-07, senza verifica diretta autenticata.
- Ogni nuova modifica schema deve avere una migration numerata; niente cambio
  manuale da dashboard senza file corrispondente.

## 11. RLS, visibilita per grado e strategia multi-scuola

Stato reale del dominio:

- L'app e' in produzione per FESK in modalita invite-only (`handle_new_user`
  richiede un invito `pending` in `user_invites` e copia livelli/scope).
- Il modello contiene `school_id` su contenuti statici e profili con isolamento
  RLS (`0028`).
- La visibilita del catalogo e del piano e' governata lato DB da
  `public.is_skill_in_scope(skill_id)` (`0046`): gli studenti
  (`up_to_assigned_level`, `profile_locked = true`) vedono fino al livello
  successivo a quello posseduto per le discipline praticate (`<> 0`), senza
  `Altro` (`is_extra`), piu l'outline solo-titolo dei livelli futuri
  (`list_locked_skill_outline`, `0047`); gli utenti `all_school_content` vedono
  tutto.
- Il dominio DB/TS resta deliberatamente FESK-first (`shaolin`/`taichi`, scala
  Chi/Chieh/Mezza Luna `8..-7`) finche non si attiva una seconda organizzazione
  reale.

Strategia white-label e altre arti marziali:

- Architettura decisa: **1 codebase unico + deploy isolati Vercel/Supabase**
  fino a ~15-20 scuole (zero fork Git, zero SaaS multi-tenant prematuro).
- Roadmap attivata da trigger reali (Fase 1 per altre scuole Chang; Fase 2 con
  `curriculum_tracks` `1..N`, `grade_levels` con `rank_order` crescente e
  `skill_categories` con `tracking_mode` per discipline come Taekwondo/Karate):
  leggi [../plan/white-label-strategy.md](../plan/white-label-strategy.md).

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
| `federation-events.ts` | Eventi nel periodo e selezioni/preferenze dell'utente |
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
| `federation-events.ts` | Opt-in/rimozione evento con auth, validazione e rilettura server |
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
| `ical-events.ts` | Parser ICS con timezone, ricorrenze, annullamenti e limiti |
| `federation-event-logic.ts` | Disponibilita', scadenza, orari e payload eventi |
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
  `OptionCard`, `SegmentedNav`, `FormSelect`, `Disclosure`).
- `src/components/shared/`: shell, header, skeleton, empty state, asset app.
- `src/components/<domain>/`: componenti di feature.

Regole:

- Button variant `default` solo per CTA primaria.
- Chip e segmented controls non usano gold pieno come stato attivo.
- Stato "completato" e' uno stato, non CTA primaria; usare classi condivise in
  `src/lib/ui-classes.ts`.
- `FormSelect` usa font mobile-safe per evitare zoom iOS.
- Header e bottom sheets gestiscono safe-area PWA.
- Il Profilo mostra subito identita' e gradi; Lingua usa `Disclosure` e `FormSelect` come le altre impostazioni, con riepilogo della lingua salvata. L'header autenticato contiene solo Home e Bacheca. `Disclosure` raccoglie dettagli
  account, programma, promemoria, sicurezza e privacy/dati senza smontare i form.
  Gli esiti riaprono la sezione; riepiloghi di modalita' e promemoria indicano
  dati salvati. Allenamento/Calendario ed Esci restano direttamente accessibili.
  Query, azioni server e autorizzazioni conservano il comportamento esistente.
- Non aggiungere primitive se il pattern non ha almeno 3 callsite reali, salvo
  eccezione motivata.

Design:

- Tema scuro caldo/gold FESK in `src/app/globals.css`.
- Tailwind v4 via CSS theme, non `tailwind.config.ts`.
- Materiali condivisi di barre e pannelli in `globals.css` (`--material-*`):
  traslucenza discreta solo con supporto al backdrop filter, base opaca e
  preferenze di trasparenza/contrasto rispettate anche dagli overlay modali.
  Ricette fuori dai layer Tailwind per prevalere sulle utility generate;
  componenti shadcn, card di contenuto e logica dati restano invariati.
- Font e asset sono brand-specific, non ancora configurabili per tenant.
- Landing/hub possono essere piu editoriali; strumenti operativi restano densi
  e prevedibili.

## 15. PWA, offline e push

Service worker:

- File: [../skill-practice/public/sw.js](../skill-practice/public/sw.js).
- Cache name attuale: `fesk-practice-v7` (aggiornamento della pagina offline bilingue).
- Precache: `/offline.html`, `/manifest.webmanifest`, `/icon.svg`.
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
- Cron endpoint: `/api/cron/training-reminders`, runtime nodejs, auth timing-safe
  con header `Authorization: Bearer <CRON_SECRET>`; schedulato ogni 15 minuti via
  Supabase `pg_cron` + `pg_net` (`scripts/setup-push-cron.sql`, finestra di
  recupero 90m e retry sui `failed`).
- Sender: `src/lib/training-reminder-sender.ts`, usa service role, `web-push` e
  fallback `VAPID_SUBJECT` da `brand.supportEmail`.
- Payload costruito in `src/lib/push-notifications.ts`.
- Eventi: `event-reminder-sender.ts` invia solo quelli scelti con Ricordamelo,
  il giorno prima all'orario/fuso comune salvato. Esclude annullati e iniziati;
  topic distinti per evento, deduplica `(subscription_id,event_id)` e retry dei
  falliti. Il delivery giornaliero degli allenamenti rimane distinto.
- Disattivare gli allenamenti cambia solo il relativo opt-in; preserva la
  sottoscrizione necessaria agli eventi. Salvare l'orario comune non abilita
  gli allenamenti. Il logout revoca la sottoscrizione del dispositivo per tutti.
- `sync_federation_events` e' una RPC atomica service-role-only con lock,
  UID/occorrenza stabili e rifiuto di snapshot obsoleti; gli eventi rimossi
  diventano annullati. RLS nega scritture eventi ai client e accesso ai
  promemoria altrui; lettura eventi pubblici a tutti gli autenticati dell'istanza.
- Test browser isolato: `npm run test:federation-calendar` dopo build;
  usa il tooling Chromium del workspace e azioni/push simulate, senza account
  o invii reali. Verifica dettagli, focus, errori, selezione/rimozione, orario
  condiviso indipendente dagli allenamenti e mobile/landscape. Test puri in
  `ical-events.test.ts` e `federation-event-logic.test.ts` inclusi in `npm test`.

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

Verifiche performance ancora utili:

- Misurare TTFB e timing delle query con sessione reale, distinguendo primo
  accesso e navigazioni successive; consultare Query Performance prima di aggiungere indici.
- Non introdurre cache del catalogo con client che dipendono da `cookies()`
  fuori dal request scope; prima definire il modello di autorizzazione della cache.
- Un eventuale passaggio a `getClaims` richiede verifica della configurazione JWT.

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
- I test in `tests/browser/` coprono componenti reali con azioni/push simulate.
- Non copre route handlers.
- Non copre RLS/RPC con DB reale.
- Non e' una suite E2E con account e database reali.
- Comandi: `npm run test:custom-selection` e `npm run test:federation-calendar`.
  Usano il tooling browser locale in `tools/video/`; gli artefatti sono in
  `skill-practice/test-results/` (ignorata da Git).

Quando tocchi:

- `grades.ts`: aggiungi test.
- `session-scheduler.ts`: aggiungi test, perche cambia output utente.
- `calendar-logic.ts` o practice logs: aggiungi test dove possibile.
- RLS/RPC/migration: prepara smoke test manuale e rollback SQL.
- UI mobile/PWA: serve verifica manuale su viewport mobile o device.

## 19. Known risks e debito consapevole

Debito architetturale consapevole (gestito a trigger in `plan/white-label-strategy.md`):

- Dominio FESK hardcoded in disciplina (`shaolin`/`taichi`), gradi (`8..-7`),
  categorie e asset statici; testi base gia centralizzati in `src/lib/brand.ts`
  e `src/app/manifest.ts`.
- `types.ts` e' manuale, puo divergere dallo schema DB.
- Nessun admin panel web per contenuti/utenti (operativita tramite script CLI in
  `skill-practice/scripts/`).
- i18n italiano/francese attivata per Arlon con `next-intl`: cataloghi UI in `src/lib/i18n/`, cookie/browser, date localizzate, brand con testi per lingua e resolver di contenuti authored. Migration `0050_i18n_content_and_notifications.sql`: traduzioni JSONB di skills/esami/news e lingua dei promemoria; applicazione in Supabase confermata dall'utente il 2026-11-07. Restano da inserire/validare i contenuti tecnici francesi e da tradurre/rivedere i testi legali. Procedura: `skill-practice/docs/i18n.md`.
- Nessuna suite E2E autenticata/RLS persistente; procedure manuali in
  `skill-practice/docs/access-control-checks.md`.

Rischi funzionali:

- Session progress storico puo essere ricalcolato su composizione corrente del
  piano: resta da scegliere fra conteggio basato sui log e snapshot della composizione.
- `getClaims` per ridurre round trip auth e' deferito perche dipende dalla
  configurazione JWT Supabase.
- Rileggere e aggiornare in modo coerente gli errori in `lib/queries/*`, il
  guard onboarding sui deep link e l'eventuale CSP compatibile con YouTube/Supabase.
- Valutare atomicita' degli incrementi concorrenti delle ripetizioni e DTO
  ridotti per `/sessions/setup`; introdurre cambi solo con un caso reale.
- Mancano tipi Supabase `Database` generati e un ledger automatico delle
  migrazioni applicate; il mirror manuale e il workflow SQL restano espliciti.

Evoluzione multi-scuola / altre arti marziali:

- Non anticipare refactoring: seguire esclusivamente i trigger definiti in
  [../plan/white-label-strategy.md](../plan/white-label-strategy.md).

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
- Verifica accessi: [../skill-practice/docs/access-control-checks.md](../skill-practice/docs/access-control-checks.md)
- Migrations:
  [../skill-practice/supabase/migrations](../skill-practice/supabase/migrations)

Prodotto/strategia:

- Piano attivo: [../plan/current-plan.md](../plan/current-plan.md)
- Strategia white-label e multi-arte marziale:
  [../plan/white-label-strategy.md](../plan/white-label-strategy.md)
- Indice piani: [../plan/README.md](../plan/README.md)
- Curriculum FESK:
  [../plan/reference/domain/curriculum-mapping-fesk.md](../plan/reference/domain/curriculum-mapping-fesk.md)
- Performance: stato e verifiche nella sezione 16 di questo documento.
- Video promo:
  [marketing-video-promo-guide.md](marketing-video-promo-guide.md)
