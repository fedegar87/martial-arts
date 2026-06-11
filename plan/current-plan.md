# Skill Practice — Piano Attuale

**Status:** Active
**Versione brief:** v3
**Ultimo aggiornamento:** 2026-05-16
**Sostituisce:** `archive/05-brief-v1-superseded.md`

---

## 0. CONTESTO IN UNA FRASE

PWA per la pratica guidata di arti marziali tradizionali. È **l'evoluzione digitale dei quaderni tecnici della federazione di kung fu**: video al posto delle foto, organizzazione per livello, proposta di pratica giornaliera.

**Fase attuale:** MVP personale single-user. Architettura predisposta per multi-utente futuro (federazione + scuole + allievi).

---

## 1. POSIZIONAMENTO STRATEGICO

### 1.1 Cos'è (e cosa NON è)

| È | NON è |
|---|------|
| Organizzatore di link YouTube unlisted strutturato | Piattaforma di video hosting |
| Versione digitale del quaderno tecnico federale | Sostituto del software amministrativo (Zen Planner, budoo) |
| Tool di pratica quotidiana guidata | Marketplace di contenuti / LMS pubblico |
| Personale ora, predisposto multi-utente | SaaS B2B pronto per il mercato |

### 1.2 Differenziazione netta

- **vs budoo.one:** loro sono admin-first (€99-200/mo, billing/scheduling/CRM + campus statico). Noi siamo solo pedagogia, complementari, leggeri
- **vs YouTube/WhatsApp:** noi diamo "oggi fai questo" + log + organizzazione per livello, loro no
- **vs Wing Chun Trainer "At Home" / Wuji (Sifu Leo Au Yeung):** entrambe B2C generiche o single-master, video pre-fatti senza logica esame né contenuti della propria scuola. Nessuna sovrapposizione (vedi §2.1)
- **vs Notion + YouTube:** test di difendibilità implicito (vedi §11)

### 1.3 Riferimenti alla ricerca

Per il razionale completo vedi `archive/`:
- Mercato e gap: `01-research-market.md`, `02-research-vertical.md`
- JTBD e VP ranking: `03-analysis-operational.md`
- Validazione paper: `04-validation-framework.md`
- Stress-test e nuovi competitor: `06-research-verification.md`

---

## 2. DECISIONI

### 2.1 Decisioni chiuse ✅

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| **D1** | Auth | **Supabase Auth da subito.** Predispone multi-utente senza dover riscrivere. Il debt di localStorage costerebbe più dei 2-3 giorni risparmiati |
| **D2** | Wing Chun Trainer "At Home" come competitor | **Verificato, nessuna sovrapposizione.** È B2C generico con video pre-fatti, niente contenuti scuola, niente logica esame. Idem "Wuji" di Sifu Leo Au Yeung: B2C single-master, non B2B per federazioni. Il valore proprio resta: video della **tua** federazione, esami **tuoi**, curriculum **tuo** |
| **D3** | Kill metric personale | **Valutazione soggettiva.** Nessun numero rigido — il founder giudica dopo qualche settimana di uso se l'app è utile. L'utilità si sente (vedi §11.1) |
| **D4** | Bacheca/News | **Implementata localmente.** Route `/news`, banner unread in Today, migration `0006_news_reflections.sql` con seed demo e read-state |
| **D6** | Note post-pratica + reflection settimanale | **Implementata localmente.** Note opzionali dopo pratica, note nello skill detail, weekly reflection in Progress |
| **D8** | Provisioning utenti | **Solo admin.** Niente self-signup pubblico. Admin invita via Supabase dashboard "Send invitation". Coerente con modello federazione (§1.1). Self-signup riapribile in futuro se serve |
| **D9** | Min password length | **8 caratteri** (NIST 2024 baseline). Niente regex complex (es. una maiuscola + un numero) — NIST le ha rimosse |
| **D10** | Documenti legali (privacy/terms/cookies/disclaimer) | **Pagine custom in-app, non iubenda.** Deviazione esplicita rispetto al §15.3 v3 (che suggeriva iubenda generator a €29/anno). Razionale: (a) MVP single-user non ha budget legale ricorrente; (b) i contenuti devono essere specifici per pratica fisica/scuola e non generici da generator; (c) tutto il testo non derivabile è marcato `[PLACEHOLDER: ...]` per revisione legale prima di apertura a utenti terzi. iubenda resta opzione di fallback se la federazione richiederà policy generata da fonte certificata |
| **D11** | Calendario unificato | **`/calendar` è l'unica vista calendario dell'app.** Mostra sessioni programmate + pratica libera in una DayView, senza filtri. `/sessions/calendar` e `/journal` non esistono più (unificate il 2026-05-10). `practice_logs` ha chiave logica unica `(user_id, skill_id, date)` e indice `(user_id, date)`. Design: `plan/completed/2026-05-10-calendar-unification-design.md` |
| **D12** | Promemoria push allenamento | **Implementati come opt-in stretto, UI disattivata fino a setup VAPID.** Codice in produzione e migration applicata, ma i selettori in `/today` e `/profile` sono gated da `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: senza chiavi VAPID + `CRON_SECRET` configurati su Vercel la UI resta nascosta. Setup pendente: `plan/2026-05-16-push-notifications-setup-pending.md`. Design: `plan/completed/2026-05-16-training-reminder-push-notifications-plan.md` |

### 2.2 Decisioni aperte ⚠️

| # | Decisione | Opzioni | Impatto | Priorità |
|---|-----------|---------|---------|----------|
| **D5** | **SRS "vero" per review/maintenance** | A) Rotazione semplice (ultima pratica). B) Intervalli crescenti tipo Anki/Chessable | Letteratura supporta SR per skill motorie. B = differenziatore reale ma più complesso. Sprint 3 corretto. **Sprint 1.12:** i 3 livelli (focus/review/maintenance) sono stati semplificati a 2 (focus/maintenance) — vedi `plan/completed/2026-05-04-plan-status-simplification-design.md`. SRS reale resta come decisione futura | 🟢 Sprint 3 o oltre |
| **D7** | **Player video** | YouTube embed accettato in v3. Verificare se loop/slow-mo diventano frustranti dopo 30 giorni di uso personale. Eventuale switch a MP4 self-hosted con player custom | Se uso personale rivela frustrazione → riapertura decisione | 🟢 Dopo 30 giorni di uso |

---

## 3. STACK TECNOLOGICO

| Componente | Scelta | Note |
|------------|--------|------|
| Frontend | Next.js 14+ App Router + TypeScript | — |
| UI | Tailwind CSS + shadcn/ui | Componenti accessibili pronti |
| PWA | Service worker statico + manifest | `public/sw.js` registrato in produzione; `next-pwa` rimosso il 2026-06-02 |
| Database | Supabase (PostgreSQL + Auth) | Auth predisposta multi-utente |
| Push reminder | Web Push + VAPID + Vercel Cron | Subscription salvate in Supabase; invio server-only via `web-push` |
| Video | YouTube unlisted embed | Zero infrastruttura video |
| Hosting | Vercel | Free tier |
| Monorepo | No | Singolo progetto |

**Esplicitamente escluso:** Supabase Storage video, signed URL, API route video, compressione/upload, CDN proprio.

**Note Next 16 (versione installata: 16.2.4 con Turbopack):**
- `middleware` rinominato in `proxy` (file `src/proxy.ts`, era `src/middleware.ts`)
- `cookies()`, `headers()`, dynamic route `params` sono ora `Promise` (da `await`are)
- Tailwind v4 (config via `globals.css` `@theme`, niente `tailwind.config.ts` per shadcn)
- shadcn preset usato: **Nova** (Lucide + Geist), base color: **neutral**
- `npm run dev` forza `next dev --webpack`: Turbopack dev ha dato panic locale su `/login`; `npm run build` resta verde con Turbopack
- `next-pwa` **rimosso il 2026-06-02** (era fermo al Pages Router, incompatibile con App Router/Next 16, mai importato). Offline locale implementato con `public/sw.js` + `ServiceWorkerRegister`
- Per breaking changes complete vedi `skill-practice/node_modules/next/dist/docs/01-app/`

---

## 4. MODELLO DATI

### 4.1 Strutture statiche (seed authored)

Aggiornato a Sprint 1.5 (curriculum FESK, due discipline). I tipi reali — in snake_case mirror del DB — sono in [src/lib/types.ts](../skill-practice/src/lib/types.ts).

```typescript
type Discipline = "shaolin" | "taichi"

type PracticeMode = "solo" | "paired" | "both"

type SkillCategory =
  | "forme" | "tui_fa" | "po_chi" | "chin_na"
  | "armi_forma" | "armi_combattimento"
  | "tue_shou" | "ta_lu" | "chi_kung" | "preparatori"

type School = {
  id: string
  name: string                        // "FESK"
  description: string | null
}

type Skill = {
  id: string
  school_id: string
  name: string                        // nome cinese traslitterato
  name_italian: string | null
  category: SkillCategory
  discipline: Discipline
  practice_mode: PracticeMode
  description: string | null
  video_url: string                   // YouTube unlisted (video primario)
  video_label: string | null          // label del video primario (solo se 2 video)
  secondary_video_url: string | null  // 2o video: ruolo paired o esecuzione alt.
  secondary_video_label: string | null
  thumbnail_url: string | null
  teacher_notes: string | null
  estimated_duration_seconds: number | null
  minimum_grade_value: number         // gradi anche negativi (Chieh, Mezza Luna)
  display_order: number
  created_at: string
}

type ExamProgram = {
  id: string
  school_id: string
  discipline: Discipline
  grade_value: number
  level_name: string
  description: string | null
  grade_from: string | null
  grade_to: string | null
}

type ExamSkillRequirement = {
  exam_id: string
  skill_id: string
  default_status: "focus" | "maintenance"
}
```

> ⚠️ **Nota implementazione SQL:** in TypeScript `skills` è array embedded per comodità. In Supabase/PostgreSQL deve essere una **tabella separata** `exam_skill_requirements (exam_id, skill_id, default_status)` come junction table. **Non** usare campo JSONB: rende impossibile queryare/aggiornare i livelli in modo pulito quando il numero di esami e skill cresce.

### 4.2 Strutture dinamiche (per utente)

```typescript
type PlanMode = "exam" | "custom"

type UserProfile = {
  id: string
  school_id: string
  display_name: string
  assigned_level_shaolin: number      // grado Shaolin corrente
  assigned_level_taichi: number       // 0 = non praticato
  preparing_exam_id: string | null    // esame Shaolin in prep
  preparing_exam_taichi_id: string | null
  plan_mode: PlanMode                 // dual persistence (mig 0011)
  role: "student" | "instructor" | "admin"
  last_news_seen_at: string | null
  created_at: string
}

type UserPlanItem = {
  id: string
  user_id: string
  skill_id: string
  status: "focus" | "maintenance"
  source: "exam_program" | "manual"
  is_hidden: boolean
  last_practiced_at: string | null
  added_at: string
}

type PracticeLog = {
  id: string
  user_id: string
  skill_id: string
  date: string                        // "2026-04-25"
  completed: boolean
  personal_note: string | null        // Sprint 2 (D6)
  reps_target: number | null          // null = log libero senza schedule
  reps_done: number                   // default 0
  created_at: string
}

// Sprint 1.13: chiave logica unica (user_id, skill_id, date).
// Query range supportate da indice (user_id, date).
// Pratica libera retroattiva: completed=true, reps_target=null, reps_done=0.

type TrainingSchedule = {
  user_id: string
  weekdays: number[]                  // ISO 1=Lun ... 7=Dom
  cadence_weeks: 1 | 2 | 4             // Lunghezza ciclo (Sprint 1.12)
  reps_per_form: number                // 1-10, snapshot del valore attuale
  exam_disciplines: Discipline[]       // discipline incluse nella schedule (mig 0015)
  start_date: string                   // YYYY-MM-DD
  end_date: string                     // YYYY-MM-DD
  created_at: string
  updated_at: string
}

type NotificationPreference = {
  user_id: string
  training_reminders_enabled: boolean
  reminder_time: string                 // HH:mm, default 09:00
  time_zone: string                     // default Europe/Rome
  include_exercise_names: boolean
  created_at: string
  updated_at: string
}

type PushSubscriptionRecord = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
  last_seen_at: string
  revoked_at: string | null
}
```

### 4.3 Predisposto Sprint 2/3

```typescript
type NewsItem = {
  id: string
  schoolId: string
  title: string
  body: string
  type: "event" | "announcement"
  publishedAt: Date
  eventDate?: Date
  eventLocation?: string
  pinned: boolean
}
```

### 4.4 Account / privacy (Sprint 1.11)

```typescript
type AccountDeletionRequest = {
  id: string
  userId: string
  status: "pending" | "resolved" | "cancelled"
  requestedAt: Date
  resolvedAt?: Date
  note?: string
}
```

Tabella `account_deletion_requests` (migration `0016_profile_account_privacy.sql`):

- RLS: l'utente può `INSERT`/`SELECT` solo le proprie richieste; gli admin (`user_profiles.role = 'admin'`) possono `SELECT`/`UPDATE` tutte le richieste.
- Indice unique parziale su `(user_id) WHERE status = 'pending'`: massimo una richiesta pendente per utente.
- Cancellazione effettiva non automatica: la richiesta è un evento auditabile, l'admin esegue la pulizia manualmente.

La stessa migration aggiunge un trigger `prevent_user_profile_privilege_changes` su `user_profiles` che blocca l'aggiornamento di `role` e `school_id` quando il chiamante è il proprietario autenticato. **Limite noto:** il trigger blocca anche un admin loggato che tenti di modificare il proprio `role`/`school_id` dalla UI. Per cambi privilegi serve operatività via service role (Supabase dashboard / SQL Editor). Accettabile finché l'admin è il founder; da rivedere quando arriveranno admin di scuola.

---

## 5. STRUTTURA CARTELLE PROGETTO

Snapshot al 2026-05-16. La pianta è descrittiva, non esaustiva: alcuni file utility minori sono omessi. Per la lista canonica delle convenzioni di posizionamento vedi `skill-practice/CLAUDE.md`.

```
skill-practice/
├── CLAUDE.md                           # Regole di progetto (vincoli stack, struttura, scope)
├── docs/
│   ├── ui-system.md
│   └── ui-codebase-refactor-plan.md
├── public/
│   ├── manifest.json
│   ├── icons/                          # 192, 512, maskable
│   ├── sw.js                           # Service worker statico (offline base)
│   └── favicon.ico
├── src/
│   ├── proxy.ts                        # Auth gate + refresh sessione Supabase (Next 16: ex middleware.ts)
│   ├── app/
│   │   ├── layout.tsx                  # Shell HTML + provider
│   │   ├── page.tsx                    # Landing → /hub o /onboarding
│   │   ├── globals.css                 # Tailwind v4 @theme + tokens FESK
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (legal)/                    # Pagine pubbliche legali (Sprint 1.11)
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   ├── cookies/page.tsx
│   │   │   └── disclaimer/page.tsx
│   │   ├── (app)/                      # Route group protetto da proxy
│   │   │   ├── layout.tsx              # Layout app + BottomNav + AppHeader condizionale
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── hub/page.tsx              # Home permanente con tile
│   │   │   ├── today/page.tsx            # Allenamento
│   │   │   ├── calendar/page.tsx         # Calendario unificato (Sprint 1.14)
│   │   │   ├── library/page.tsx          # Scuola Chang: catalogo con DisciplineToggle + filtri
│   │   │   ├── programma/page.tsx        # Programma personale (entry CTA setup)
│   │   │   ├── plan/
│   │   │   │   ├── exam/page.tsx       # Editor piano da esame (Sprint 1.7)
│   │   │   │   └── custom/page.tsx     # Editor piano custom (Sprint 1.7)
│   │   │   ├── progress/page.tsx         # Tab Progressi (Sprint 1.8)
│   │   │   ├── skill/[skillId]/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx            # Account, gradi, programma, sicurezza, privacy
│   │   │   │   └── export/route.ts     # Export JSON dati utente (Sprint 1.11)
│   │   │   ├── sessions/setup/page.tsx   # Setup schedule allenamento
│   │   │   └── news/page.tsx             # Bacheca (D4)
│   │   ├── auth/
│   │   │   ├── callback/route.ts       # Magic link / OAuth callback con allowlist `next`
│   │   │   ├── confirm/route.ts        # Invite/recovery token_hash
│   │   │   └── update-password/page.tsx
│   │   └── api/cron/training-reminders/route.ts
│   ├── components/
│   │   ├── ui/                         # shadcn-managed (non modificare a mano)
│   │   ├── primitives/                 # Primitive UI custom (Chip, OptionCard, SegmentedNav, FormSelect)
│   │   ├── nav/BottomNav.tsx
│   │   ├── landing/                    # Hero / CTA / lock screen
│   │   ├── hub/                        # Tile, grid, background
│   │   ├── today/                      # TodaySkillCard, PracticeCheckButton, RepsCounter, ecc.
│   │   ├── sessions/                   # WeekdayChips, CadencePicker, RepsStepper, SetupForm, ResetScheduleSection, PlanFormsSection
│   │   ├── calendar/                   # Calendar, CalendarDayPanel, PracticeCompletionToggle, AddFreePracticeSheet
│   │   ├── library/                    # DisciplineToggle, LibraryFilters, GradeSection, ProgramSkillRow, CatalogMarkerLegend
│   │   ├── programma/                  # PlanTabsNav (Scuola/Programma personale)
│   │   ├── plan/                       # Editor piano (exam/custom)
│   │   ├── progress/                   # Visualizzazioni progresso
│   │   ├── skill/                      # VideoPlayer, badge livello/stato
│   │   ├── profile/                    # GradeEditor, PlanModeSection, ChangePasswordSection, PrivacyDataSection, TrainingReminderSettings, SignOutButton
│   │   ├── news/                       # Lista bacheca + badge unread
│   │   ├── legal/                      # LegalLinks, LegalPage
│   │   ├── pwa/                        # ServiceWorkerRegister, TrainingReminderPrompt
│   │   └── shared/                     # AppHeader, AppHeaderConditional, AppRouteSkeleton, EmptyState, MetricStrip, TempleHomeIcon
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── admin.ts                # service-role client per cron/server-only
│   │   │   ├── client.ts               # createBrowserClient (Client Components)
│   │   │   ├── server.ts               # createServerClient (RSC + Server Actions)
│   │   │   └── middleware.ts           # helper per src/proxy.ts
│   │   ├── queries/                    # Lettura da Server Components
│   │   │   ├── skills.ts
│   │   │   ├── exam-programs.ts
│   │   │   ├── plan.ts
│   │   │   ├── practice-log.ts
│   │   │   ├── calendar.ts             # DayView calendario (Sprint 1.14, ex journal.ts)
│   │   │   ├── training-schedule.ts
│   │   │   ├── user-profile.ts
│   │   │   ├── progress.ts             # Aggregati progresso
│   │   │   ├── news.ts
│   │   │   ├── push-notifications.ts
│   │   │   └── account.ts              # Deletion request (Sprint 1.11)
│   │   ├── actions/                    # Mutation: Next.js Server Actions
│   │   │   ├── auth.ts                 # Login, password reset/update (Sprint 1.10)
│   │   │   ├── plan.ts                 # add / hide / change-status
│   │   │   ├── practice.ts             # mark done + reps
│   │   │   ├── calendar.ts             # retroattiva / pratica libera (Sprint 1.13-1.14)
│   │   │   ├── training-schedule.ts
│   │   │   ├── profile.ts
│   │   │   ├── onboarding.ts
│   │   │   ├── news.ts
│   │   │   ├── push-notifications.ts
│   │   │   └── account.ts              # Richiesta cancellazione (Sprint 1.11)
│   │   ├── practice-logic.ts           # Fallback "oggi fai questo" senza schedule (puro)
│   │   ├── session-scheduler.ts        # getScheduledSession(date, schedule, items) puro
│   │   ├── calendar-logic.ts           # DayView calendario (puro, testato)
│   │   ├── plan-manager.ts             # Genera UserPlanItem da ExamProgram
│   │   ├── progress-logic.ts           # Maturità piano, streak, readiness
│   │   ├── session-progress.ts
│   │   ├── grades.ts                   # Mapping grado ↔ nome (Chieh, Mezza Luna, …)
│   │   ├── auth-validation.ts          # Validazione email/password (NIST baseline)
│   │   ├── onboarding-state.ts         # isProfileOnboarded (puro)
│   │   ├── landing.ts                  # resolveLandingDestination (puro)
│   │   ├── youtube.ts                  # watch?v= → embed/
│   │   ├── marker-visuals.ts           # Marker sistema per library
│   │   ├── push-client.ts              # Browser permission + subscription helper
│   │   ├── push-notifications.ts       # Tipi/helper payload promemoria
│   │   ├── training-reminder-sender.ts # Cron sender server-only
│   │   ├── date.ts | labels.ts | ui-classes.ts | perf.ts
│   │   ├── types.ts                    # Tipi condivisi (DB + UI)
│   │   └── utils.ts
│   └── hooks/                          # Solo client-side reattivo (mutation)
│       ├── usePracticeMutation.ts
│       └── usePlanMutation.ts
├── supabase/
│   └── migrations/                     # 26 migrations al 2026-05-16, vedi §5.1
├── scripts/
│   ├── generate-fesk-seed.mjs          # Genera 0004_seed_fesk.sql da curriculum-mapping-fesk.md
│   └── ui-audit.mjs
├── .env.local.example
├── next.config.ts
├── postcss.config.mjs                  # Tailwind v4
├── components.json                     # shadcn (preset Nova, base color neutral)
├── tsconfig.json
└── package.json
```

### 5.1 Migrations (cronologia)

Sequenza aggiornata al 2026-06-03. **0001–0028 applicate** via SQL Editor Supabase (CLI non in PATH, vedi `feedback_db_changes_workflow`).

| # | Nome | Scopo |
|---|------|-------|
| 0001 | `schema` | Tabelle base + RLS attiva su tutte |
| 0002 | `seed_school_skills` | Seed iniziale Wing Chun (storico, superato da 0004) |
| 0003 | `schema_evolve_fesk` | Pivot a FESK: enum `discipline`, `practice_mode`, rinomina `minimum_level → minimum_grade_value`, nuove categorie |
| 0004 | `seed_fesk` | Seed FESK generato da `scripts/generate-fesk-seed.mjs` |
| 0005 | `plan_mode` | `user_profiles.plan_mode` (exam/custom) — Sprint 1.7 |
| 0006 | `news_reflections` | Tabelle `news_items`, `weekly_reflections` + read-state (D4, D6) |
| 0007–0011 | `*_exam_programs` / `*_plan_persistence` | Evoluzioni Sprint 1.7: esami incrementali, dual plan persistence |
| 0012 | `training_schedule` | Tabella schedule + reps su `practice_logs` — Sprint 1.9 |
| 0013–0014, 0020 | `*_skill_video_urls` | Popolamento URL video FESK |
| 0015 | `training_schedule_exam_disciplines` | `exam_disciplines: Discipline[]` su schedule |
| 0016 | `profile_account_privacy` | Trigger anti-privilege-change + `account_deletion_requests` — Sprint 1.11 |
| 0017 | `harden_incremental_exam_plans` | Vincoli aggiuntivi su piano da esame |
| 0018 | `allow_review_exam_selection` | (pre-1.12) |
| 0019 | `simplify_plan_status` | Drop `review`, solo `focus`/`maintenance` — Sprint 1.12 |
| 0021 | `practice_logs_unique` | Unique `(user_id, skill_id, date)` + indice `(user_id, date)` + RPC atomica — Sprint 1.13 |
| 0022 | `progress_aggregates` | RPC `count_practice_days`, `current_practice_streak` server-side |
| 0023 | `rls_subselect_uid` | Wrap `auth.uid()` in `(SELECT auth.uid())` — pattern Supabase performance |
| 0024 | `skills_composite_index` | Indice composito `(school_id, discipline, minimum_grade_value DESC, display_order)` |
| 0025 | `top_practiced_skills` | RPC classifica skill praticate — Sprint 1.15 |
| 0026 | `training_reminder_push_notifications` | Preferenze reminder, subscription push e storico delivery — Sprint 1.16 |
| 0027 | `more_skill_video_urls` | Popolamento URL video FESK aggiuntivi |
| 0028 | `multitenant_isolation` | ✅ **Applicata il 2026-06-03.** Track B isolamento multi-tenant: RLS letture statiche per-scuola, `WITH CHECK` tenant su `user_plan_items`/`practice_logs`, `handle_new_user` da metadata invito, `save_custom_selection` per scuola, `account_deletion_requests.school_id` + policy admin per scuola. NO-OP in single-tenant; barriera reale alla 2ª federazione |
| 0029 | `more_skill_video_urls` | Popolamento URL video FESK (Po Chi 10-11, Shaolin 8-10 Lu, Ti Kung, Mei Hua fond., Sho Hung) |
| 0030 | `skill_secondary_video` | Colonne `video_label`, `secondary_video_url`, `secondary_video_label`: una skill puo' avere 2 video etichettati (ruoli paired o esecuzioni alternative) |
| 0031 | `more_skill_video_urls` | Video FESK aggiuntivi + primi 2 skill a doppio video (Tan Tao Tui Pang Fa, Shuang Tao 1 Lu) |
| 0032 | `extra_weapon_fundamentals` | 4 skill "fondamentali" armi fuori programma cinture: categoria `preparatori` ("Altro"), grado-sentinella `99` (`EXTRA_GRADE_VALUE`), sezione "Altro" in libreria |

> **0028 applicata il 2026-06-03** (single-tenant: no-op, verificato con smoke test). Quando arriverà la 2ª federazione, l'invito utenti deve passare `school_id` (e `display_name`) nei `user_metadata`, altrimenti con più scuole `handle_new_user` fallisce di proposito.

### 5.2 Note vincolanti sulla struttura

Aggiornamento UI 2026-05-11:

- `src/components/ui/` resta riservato ai componenti shadcn-managed.
- Le primitive UI custom del progetto vanno in `src/components/primitives/<Name>.tsx` con PascalCase.
- `src/components/shared/` resta per shell/app/layout e asset identitari, non per primitive UI pure.
- Regole e roadmap UI sono in `skill-practice/docs/ui-system.md` e `skill-practice/docs/ui-codebase-refactor-plan.md`.

- **Route groups `(auth)` e `(app)`**: separano pagine pubbliche da protette. `src/proxy.ts` (ex `src/middleware.ts`, rinominato in Next 16) redirige verso `/login` qualunque rotta sotto `(app)` se la sessione manca.
- **`lib/supabase/` con tre file**: in App Router servono client diversi per Client Components, RSC/Server Actions e proxy. Un singolo `supabase.ts` rompe SSR e session refresh.
- **`lib/queries/` + `lib/actions/`**: lettura via Server Components senza hook, mutation via Server Action. Per questo `hooks/` è ridotto a 2 file: hook tipo `useSkills`/`useUserPlan` sarebbero anti-pattern in App Router (riscaricano dati già nel server tree).
- **Componenti raggruppati per feature** (`today/`, `library/`, `skill/`, ecc.): quando arrivano news/admin in Sprint 2-3, una directory flat esplode. Ogni nuovo componente va nella sotto-cartella della feature, non nella root di `components/`.
- **Seed in SQL, non TypeScript**: §12 mostra TS perché è leggibile, ma il vero seed è eseguito da Supabase CLI come SQL in `supabase/migrations/0002_seed_school_skills.sql`. Il TS in §12 è documentazione di riferimento.
- **Niente `src/data/`**: i dati statici stanno in DB (Supabase), non nel bundle.
- **Niente `helpers/`, `services/`, `api/` custom**: la convenzione del progetto è `queries/` (read) + `actions/` (write). Punto.

---

## 6. LOGICA CENTRALE

### 6.1 "Oggi fai questo" (`practice-logic.ts`)

Input: tutte le `UserPlanItem` non nascoste dell'utente.

Algoritmo:
1. Tutte le skill con `status = "focus"` → mostrate **ogni giorno**
2. Skill con `status = "maintenance"` → **rotazione**, le 4 meno praticate (`sortByOldestPractice` + `slice(0, 4)`)

**Nota:** questo è il fallback per utenti senza schedule attivo. La distribuzione "vera" (con cicli, pesi e algoritmo deterministico) è in §6.4 (`session-scheduler.ts`).

### 6.2 Generazione piano da esame (`plan-manager.ts`)

Quando l'utente seleziona un esame:
1. Per ogni `ExamSkillRequirement` del programma → crea una `UserPlanItem` con `source: "exam_program"` e `status` dal `defaultStatus`
2. L'utente può aggiungere skill manualmente → `source: "manual"`
3. L'utente può nascondere singole skill → `isHidden: true` (non eliminate, ripristinabili)
4. Cambio esame → vecchie `UserPlanItem` con `source: "exam_program"` archiviate, nuove generate

### 6.3 Filtro livello (UI only, non security)

Tutti i query lato client filtrano: `skill.minimumLevel <= user.assignedLevel`. Non è protezione: è UX per non sovraccaricare l'allievo con contenuti non rilevanti.

### 6.4 Schedulazione sessioni (`session-scheduler.ts`)

Quando l'utente completa il setup in `/sessions/setup`, una riga in `training_schedule` definisce giorni della settimana, durata, cadenza e ripetizioni. La funzione pura `getScheduledSession(date, schedule, items)` distribuisce le forme con **distribuzione pesata 2:1**:

- Ogni skill **focus** compare 2 volte nel ciclo, ogni **maintenance** 1 volta
- Algoritmo Bresenham-like per spaziare le occorrenze ed evitare cluster e duplicati nella stessa sessione
- Clamp del peso a `slotCount` per gestire il caso edge `cycle_weeks=1` con `weekdays=[1]`
- Forme per sessione = `ceil((N_focus * 2 + N_maint * 1) / (weekdays.length * cycle_weeks))`
- `cadence_weeks` rappresenta ora la "lunghezza ciclo" (label rinominata in UI come **"Lunghezza ciclo"**)

Sostituisce `getTodayPractice` (§6.1) per gli utenti con schedule attiva. Vedi `plan/completed/2026-04-26-training-schedule-design.md` per la storia originale e `plan/completed/2026-05-04-plan-status-simplification-design.md` per il design corrente con 2 stati.

---

## 7. NAVIGAZIONE E UI

### 7.0 Hub e header globale

Da Sprint 2.x esiste `/hub`, home permanente con 6 tile (Oggi, Programma, Scuola Chang, Progressi, Bacheca, Profilo). La landing CTA `Entra` reindirizza qui per utenti onboardati. Da `/hub` si raggiunge ogni area.

In tutte le pagine `(app)/*` tranne `/hub` è montato `AppHeader`: barra non-sticky con ideogramma 丙午 cliccabile (sinistra → torna a `/hub`) e icona utente (destra → `/profile`). È non-sticky di design: l'AppHeader scrolla via per non collidere con la sticky pre-esistente su `/today`. Vedi `plan/completed/2026-05-01-hub-page-design.md`.

### 7.1 Bottom navigation

```
[ Allenamento ]  [ Programma ]  [ Scuola ]  [ Progressi ]  [ Bacheca ]
```

5 slot riservati alle aree ad alta frequenza di pratica. Il **Profilo non occupa uno slot**: si raggiunge via icona utente in alto a destra in `AppHeader` (oltre che dalla tile `/hub`). Razionale: gradi/sessions setup/password/logout sono destinazioni rare rispetto alla pratica giornaliera, e Bacheca (notifiche scuola) merita la promozione in nav permanente.

`/calendar` non occupa uno slot BottomNav: è il calendario generale dell'app. Si raggiunge da `/today` (sticky header), `/progress` (bottone "Apri calendario") e `/profile` (card Allenamento).

### 7.2 Tab "Oggi"

```
┌─────────────────────────────────┐
│  Ciao [nome]       Livello 2    │
│                                 │
│  OGGI — Martedì                 │
│                                 │
│  📌 FOCUS                       │
│  ┌───────────────────────────┐  │
│  │ Siu Nim Tao — Sez. 3      │  │
│  │ ┌─────────────────────┐   │  │
│  │ │  ▶ YouTube embed    │   │  │
│  │ └─────────────────────┘   │  │
│  │ 💡 "Polso fermo nel       │  │
│  │     Fak Sao"              │  │
│  │              [ ✅ Fatto ] │  │
│  └───────────────────────────┘  │
│                                 │
│  🔄 RIPASSO                     │
│  [card simili]                  │
│                                 │
│  ─────────────────────────────  │
│  📋 Questa settimana: 2/4 ✅    │
└─────────────────────────────────┘
```

### 7.3 Tab "Libreria"

Toggle in alto: `[ Il mio livello ]  [ Per esame ]  [ Tutto ]`

### 7.4 Tab "Profilo"

Nome, livello, esame in preparazione, progresso settimanale, settings.

### 7.5 Design rules

- Mobile-first, dark theme default
- Font grande, leggibile a colpo d'occhio
- Touch target minimo 48px
- Skeleton screens su caricamento
- Bordi arrotondati su card video
- Embed YouTube con `rel=0` (no video correlati a fine)
- Player video inline (no redirect a YouTube)

---

## 8. FLUSSO UTENTE

```
PRIMO UTILIZZO
├─ Login (Supabase Auth)
├─ Onboarding: "Vuoi preparare l'esame per il livello [X]?"
│    ├─ Sì → piano auto-generato → schermata "Oggi" piena
│    └─ No → schermata "Oggi" vuota + CTA libreria
└─ Default tab: Oggi

QUOTIDIANO
├─ Apre app → Tab "Oggi"
├─ Vede skill proposte con video embed
└─ Guarda → pratica → "Fatto"

RIPASSO LIVELLO PRECEDENTE
├─ Libreria → "Per esame" → tap livello inferiore
└─ Aggiunge skill desiderate al piano come "ripasso"

PIANO LIBERO
├─ Libreria → "Tutto" → naviga per categoria
└─ Seleziona skill → "Aggiungi al mio piano" → sceglie stato
```

---

## 9. SPRINT PLAN

### Sprint 1 — MUST HAVE

> Stato aprile 2026: Sprint 1 base completato; sono stati aggiunti sprint operativi 1.5-1.8 nei file dedicati in `plan/`.

#### Sprint 1.x operativo

- **1.5 — Curriculum FESK:** schema/tipi/UI/seed implementati; `0004_seed_fesk.sql` generato da `skill-practice/scripts/generate-fesk-seed.mjs` usando `plan/reference/domain/curriculum-mapping-fesk.md`.
- **1.6 — VideoPlayer custom:** implementato in `src/components/skill/VideoPlayer.tsx`; sostituisce `YouTubeEmbed` e carica YouTube solo dopo tap.
- **1.7 — UX Programma + Modalità di studio:** schema `0005_plan_mode.sql`, `/programma`, `/plan/exam`, `/plan/custom` e azioni RPC atomiche implementate; richiede migrations applicate per walkthrough reale.
- **1.8 — Tab Progresso:** `/progress` e BottomNav a 4 tab implementati con SVG/Tailwind, senza dipendenze chart.
- **1.9 — Schedulazione sessioni:** `0012_training_schedule.sql` (nuova tabella + reps su `practice_logs`), route `/sessions/setup`, algoritmo `lib/session-scheduler.ts` puro, reps tracking via `incrementRep`/`decrementRep`, link nel profilo. Design: `plan/completed/2026-04-26-training-schedule-design.md`. Plan: `plan/completed/2026-04-26-training-schedule-plan.md`. Nota 2026-05-10: la rotta `/sessions/calendar` originariamente prevista è stata unificata in `/calendar` (vedi 1.14).
- **1.10 — Auth password management:** flow completo per recovery, invite e change password. Pagine `/forgot-password`, `/auth/update-password`, sezione "Sicurezza" su `/profile`. Server actions `requestPasswordReset` / `updatePassword` / `changePassword`. Modifica `auth/callback/route.ts` con allowlist `next` (anti open redirect) e proxy con lista `AUTHENTICATED_ONLY`. Logica pura testabile in `lib/auth-validation.ts`. Provisioning solo admin (D8), invito via Supabase dashboard "Send invitation". Min password length 8 (D9). Design: `plan/completed/2026-05-02-auth-password-management-design.md`.
- **1.11 — Profilo, account, privacy e documenti legali:** `/profile` esteso con card Account (email, scuola, ruolo, member date), Programma, Allenamento, Sicurezza, Privacy/dati. Migration `0016_profile_account_privacy.sql` con trigger immutabile su `role`/`school_id` (vedi §4.4 limite admin) e tabella `account_deletion_requests`. Export JSON dati utente via `/profile/export`. Pagine pubbliche `/privacy`, `/terms`, `/cookies`, `/disclaimer` con `[PLACEHOLDER: ...]` espliciti per dati titolare/DPO/retention/sub-processor (decisione D10). Logout client-side ora pulisce localStorage/sessionStorage/Cache best-effort; service worker non cachea navigazioni autenticate. Plan completo + missing items: `plan/completed/2026-05-03-profile-account-privacy-settings-plan.md`.
- **1.12 — Semplificazione PlanStatus (2 stati):** collassati `review` e `maintenance` in un singolo stato `maintenance`. Nuovo algoritmo distribuzione pesata 2:1 in `session-scheduler.ts`, formula deterministica per forme/sessione, nuova UI `PlanFormsSection` in `/sessions/setup` con toggle binario, label "Frequenza del ripasso" rinominata "Lunghezza ciclo". Migration `0019_simplify_plan_status.sql`. Design: `plan/completed/2026-05-04-plan-status-simplification-design.md`. Plan: `plan/completed/2026-05-04-plan-status-simplification-plan.md`.
- **1.13 — Diario generale e segna-pratica retroattiva:** route `/journal`, componenti `components/journal/*`, query `lib/queries/journal.ts`, action retroattive `lib/actions/journal.ts`, logica pura `journal-logic.ts`. `/sessions/calendar` diventa vista filtrata sulle sessioni con stessa DayView. Migration `0021_practice_logs_unique.sql` aggiunge unique `(user_id, skill_id, date)`, indice `(user_id, date)` e RPC atomica `update_plan_item_last_practiced_at`. Design: `archive/2026-05-07-calendar-overhaul-design-superseded.md`. **Superato il 2026-05-10 da 1.14**.

- **1.14 — Calendario unificato:** `/journal` e `/sessions/calendar` unificati in unica route `/calendar` (etichetta "Calendario"). Rinomina del dominio nel codice: `components/journal/* → components/calendar/*` (con `JournalCalendar → Calendar`, `JournalDayPanel → CalendarDayPanel`), `lib/queries/journal.ts → lib/queries/calendar.ts`, `lib/actions/journal.ts → lib/actions/calendar.ts`, `lib/journal-logic.ts → lib/calendar-logic.ts`, tipi `JournalDayView/JournalSkill → CalendarDayView/CalendarSkill`. Rimossi: prop `mode` di JournalCalendar, sottotitolo "X sessioni nel periodo", riepilogo periodo `SessionPeriodSummary`, bottone "Apri diario" da `/today` (resta accesso da sticky header). Aggiornati link in `/today`, `/progress`, `/profile` a `/calendar`. Design: `plan/completed/2026-05-10-calendar-unification-design.md`. Plan: `plan/completed/2026-05-10-calendar-unification-plan.md`.

  **Behavior change**: gli item che prima erano `review` (peso `0.75` in `progress-logic.ts statusMaturityScore`) ora sono `maintenance` (peso `1.0`). Risultato: `readinessPercent` cresce leggermente per utenti con piani migrati. Decisione consapevole: `maintenance` semanticamente significa "padroneggiata". Per ridurre il peso rivedere `progress-logic.ts:185`.
- **1.15 — Top practiced skills + ottimizzazioni DB:** RPC `top_practiced_skills(user_id, limit)` per classifica skill praticate (mig 0025), aggregati `count_practice_days` + `current_practice_streak` lato SQL (mig 0022), indice composito catalogo `(school_id, discipline, minimum_grade_value DESC, display_order)` (mig 0024), wrap `(SELECT auth.uid())` su tutte le policy RLS (mig 0023). Design: `plan/completed/2026-05-11-top-practiced-skills-design.md`, plan: `plan/completed/2026-05-11-top-practiced-skills-plan.md`.
- **1.16 — Promemoria push allenamento:** Web Push opt-in per ricordare gli esercizi odierni non completati. Migration `0026_training_reminder_push_notifications.sql`, service worker `push`/`notificationclick`, prompt in `/today`, gestione in `/profile`, cron Vercel `/api/cron/training-reminders` con `CRON_SECRET`, invio via `web-push` e VAPID. Plan: `plan/completed/2026-05-16-training-reminder-push-notifications-plan.md`.
- **Refactor UI 2026-05-11:** unificazione grammatica button/segmented/chip/option card; tab disciplina come segmented control; CTA setup allenamento unificate; primitive UI in `components/primitives/`. Vedi `docs/ui-system.md`.
- **Visual identity FESK:** tema dark/gold applicato in `globals.css`, con overlay grain e componenti core meno arrotondati.

1. Setup: Next.js + Tailwind + shadcn/ui + PWA + Supabase
2. Schema database + seed data (skill, esami, scuola)
3. Login (Supabase Auth)
4. Onboarding (conferma livello + selezione esame)
5. Tab "Oggi": pratica guidata con focus/maintenance (review collassato in Sprint 1.12)
6. VideoPlayer responsive lazy YouTube
7. Bottone "Fatto" → log su database
8. Tab "Libreria" con tre modi: mio livello / per esame / tutto
9. Dettaglio skill: video + note + "Aggiungi al piano"
10. Filtro UI per livello
11. PWA manifest + installabilità

### Sprint 2

12. Piano libero: aggiungi/rimuovi/nascondi skill
13. **D6:** note personali post-pratica + reflection settimanale — implementate localmente in Sprint 2
14. Progresso settimanale + countdown esame — sostituito da Sprint 1.8 per le visualizzazioni progresso; countdown resta futuro perché manca una data esame nel modello dati
15. Bacheca news (eventi + comunicazioni federazione) — implementata localmente in Sprint 2

### Sprint 3

16. Pannello istruttore: assegna livelli, aggiungi note
17. Pannello admin: gestisci skill, esami dall'app
18. **⚠️ D5:** SRS reale per review/maintenance (intervalli crescenti)
19. Storico pratica con calendario
20. Offline mode base — implementato localmente con service worker statico; test mobile/deploy ancora da fare

---

## 10. ESCLUSIONI HARD

| Cosa | Perché NO |
|------|-----------|
| Video hosting/storage proprio | YouTube unlisted basta |
| Upload video dall'app | Idem |
| Signed URL / API route video | Non servono per contenuti unlisted |
| Pannello admin Sprint 1 | Gestione via Supabase dashboard finché serve |
| Push generiche/marketing | Ammesso solo il promemoria allenamento opt-in di D12 |
| Gamification (punti, badge, streak) | Non risolve il core, distrae |
| Chat / messaggistica | WhatsApp esiste |
| AI di qualsiasi tipo | Tecnologia non matura per MA, fuori scope |
| Multi-lingua | Non ancora |
| Marketplace | Mai |
| Community/social features | Fuori scope MVP, da rivalutare per scaling federazione |
| CI/CD complesso | Vercel auto-deploy da main basta |

---

## 11. KILL METRICS E VALIDAZIONE

### 11.1 MVP personale (immediato)

Nessuna metrica rigida. Valutazione soggettiva del founder dopo qualche settimana di uso reale: l'app risulta utile o no? Se la risposta è no, si scarta o si ripensa. Non serve numerare giorni di pratica — l'utilità si sente.

### 11.2 Scaling federazione (futuro, da `archive/04`)

- Test paper WhatsApp 14 giorni con 10-15 allievi: ≥ 30% pratica seguendo le indicazioni per ≥ 8 giorni su 14
- 3+ maestri su 5 intervistati riconoscono il problema con score ≥ 7/10
- Federazione disposta a pre-configurare curriculum e sponsorizzare 3+ scuole pilota

---

## 12. SEED DATA INIZIALE (Wing Chun — storico)

> **⚠️ Superato da Sprint 1.5 (FESK curriculum).** Il seed di partenza era Wing Chun (`0002_seed_school_skills.sql`); il seed attivo è ora `0004_seed_fesk.sql`, generato da `scripts/generate-fesk-seed.mjs` a partire da `plan/reference/domain/curriculum-mapping-fesk.md`. Lo schema include `discipline` (shaolin/taichi), `practice_mode`, `name_italian` e `minimum_grade_value` (anche negativo per gradi tipo Chieh, Mezza Luna). Il blocco TS sotto resta come documentazione del modello mentale iniziale.

11 skill in 4 categorie + 3 programmi d'esame. Sostituire `PLACEHOLDER_X` con URL YouTube unlisted reali. Il componente `YouTubeEmbed` deve convertire automaticamente `watch?v=` in formato `embed/`.

### 12.1 Skill

```typescript
const skills = [
  // FORME
  {
    id: "s1", schoolId: "school-1",
    name: "Siu Nim Tao - Sezione 1",
    category: "forme",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_1",
    teacherNotes: "Concentrati sulla stabilità del cavallo. Schiena dritta, spalle rilassate.",
    estimatedDurationSeconds: 300,
    minimumLevel: 1, order: 1
  },
  {
    id: "s2", schoolId: "school-1",
    name: "Siu Nim Tao - Sezione 2",
    category: "forme",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_2",
    teacherNotes: "Rotazione polso nel Huen Sao: lenta e precisa. Non forzare.",
    estimatedDurationSeconds: 240,
    minimumLevel: 1, order: 2
  },
  {
    id: "s3", schoolId: "school-1",
    name: "Siu Nim Tao - Sezione 3",
    category: "forme",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_3",
    teacherNotes: "Fak Sao: il polso resta fermo, il gomito guida il movimento.",
    estimatedDurationSeconds: 200,
    minimumLevel: 2, order: 3
  },
  {
    id: "s4", schoolId: "school-1",
    name: "Chum Kiu - Sezione 1",
    category: "forme",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_4",
    teacherNotes: "Coordinazione passo-rotazione-tecnica. Il passo parte prima della mano.",
    estimatedDurationSeconds: 300,
    minimumLevel: 3, order: 4
  },

  // TECNICHE BASE
  {
    id: "s5", schoolId: "school-1",
    name: "Tan Sao",
    category: "tecniche_base",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_5",
    teacherNotes: "Angolo 45°, gomito sulla linea centrale. Non alzare la spalla.",
    estimatedDurationSeconds: 120,
    minimumLevel: 1, order: 1
  },
  {
    id: "s6", schoolId: "school-1",
    name: "Bong Sao",
    category: "tecniche_base",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_6",
    teacherNotes: "Il gomito non scende mai sotto la spalla. Braccio rilassato.",
    estimatedDurationSeconds: 120,
    minimumLevel: 1, order: 2
  },
  {
    id: "s7", schoolId: "school-1",
    name: "Fook Sao",
    category: "tecniche_base",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_7",
    teacherNotes: "Polso rilassato, pressione costante in avanti sulla linea centrale.",
    estimatedDurationSeconds: 120,
    minimumLevel: 1, order: 3
  },
  {
    id: "s8", schoolId: "school-1",
    name: "Pak Sao",
    category: "tecniche_base",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_8",
    teacherNotes: "Contatto breve e secco. Non spingere, schiaffeggia.",
    estimatedDurationSeconds: 90,
    minimumLevel: 1, order: 4
  },

  // COMBINAZIONI
  {
    id: "s9", schoolId: "school-1",
    name: "Tan Sao + Bong Sao drill",
    category: "combinazioni",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_9",
    teacherNotes: "Transizione fluida. Nessuna pausa tra le due tecniche.",
    estimatedDurationSeconds: 180,
    minimumLevel: 1, order: 1
  },
  {
    id: "s10", schoolId: "school-1",
    name: "Lap Sao + contropugno",
    category: "combinazioni",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_10",
    teacherNotes: "Il Lap tira, il pugno parte simultaneamente. Non in sequenza.",
    estimatedDurationSeconds: 180,
    minimumLevel: 2, order: 2
  },

  // CONDIZIONAMENTO
  {
    id: "s11", schoolId: "school-1",
    name: "Stance training (Yee Ji Kim Yeung Ma)",
    category: "condizionamento",
    videoUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_11",
    teacherNotes: "2 minuti minimo. Schiena dritta. Ginocchia verso l'interno.",
    estimatedDurationSeconds: 180,
    minimumLevel: 1, order: 1
  },
]
```

### 12.2 Programmi d'esame

```typescript
const examPrograms = [
  {
    id: "exam-1", schoolId: "school-1",
    levelNumber: 1,
    levelName: "1° Livello",
    description: "Fondamenti: Siu Nim Tao sez. 1-2, tecniche base, stance",
    skills: [
      { skillId: "s1", defaultStatus: "focus" },
      { skillId: "s2", defaultStatus: "focus" },
      { skillId: "s5", defaultStatus: "focus" },
      { skillId: "s6", defaultStatus: "focus" },
      { skillId: "s7", defaultStatus: "focus" },
      { skillId: "s8", defaultStatus: "focus" },
      { skillId: "s9", defaultStatus: "maintenance" },
      { skillId: "s11", defaultStatus: "maintenance" },
    ]
  },
  {
    id: "exam-2", schoolId: "school-1",
    levelNumber: 2,
    levelName: "2° Livello",
    description: "Siu Nim Tao completa, combinazioni, inizio Chum Kiu",
    skills: [
      { skillId: "s3", defaultStatus: "focus" },
      { skillId: "s10", defaultStatus: "focus" },
      { skillId: "s1", defaultStatus: "maintenance" },
      { skillId: "s2", defaultStatus: "maintenance" },
      { skillId: "s5", defaultStatus: "maintenance" },
      { skillId: "s6", defaultStatus: "maintenance" },
      { skillId: "s9", defaultStatus: "maintenance" },
    ]
  },
  {
    id: "exam-3", schoolId: "school-1",
    levelNumber: 3,
    levelName: "3° Livello",
    description: "Chum Kiu, applicazioni avanzate",
    skills: [
      { skillId: "s4", defaultStatus: "focus" },
      { skillId: "s3", defaultStatus: "maintenance" },
      { skillId: "s10", defaultStatus: "maintenance" },
      { skillId: "s1", defaultStatus: "maintenance" },
      { skillId: "s2", defaultStatus: "maintenance" },
    ]
  },
]
```

> Ricorda §4.1: in SQL `examPrograms[].skills` diventa la junction table `exam_skill_requirements`, non un JSONB.

> **Nota:** il blocco TS sopra è documentazione di riferimento. Il seed reale in `supabase/migrations/0004_seed_fesk.sql` non usa più `review` (solo `focus`/`maintenance`), quindi non richiede modifica DB per la semplificazione di Sprint 1.12.

---

## 13. ACCOUNT, COSTI E SETUP OPERATIVO

### 13.1 Costi totali per partire: 0€

Tutti i servizi sui rispettivi free tier:

| Servizio | Tier | Limite free | Cosa serve |
|----------|------|-------------|------------|
| Vercel Hobby | gratis | 100GB bandwidth/mese, build illimitate | Login GitHub |
| Supabase Free | gratis | 500MB DB, 50k MAU, 2GB egress/mese | Login GitHub, region Frankfurt EU |
| GitHub | gratis | repo privati illimitati | — |
| YouTube | gratis | upload illimitato, video unlisted | Account Google esistente |

Esauriti i limiti (improbabile per uso personale): Vercel Pro $20/mese, Supabase Pro $25/mese.

### 13.2 Niente di tutto questo

- **Apple Developer ($99/anno)**: PWA installabile da Safari (Aggiungi a Home), nessuno store
- **Google Play ($25 una tantum)**: PWA installabile da Chrome, nessuno store
- **Dominio custom**: opzionale (~€10/anno). Senza, vai su `<nome>.vercel.app`
- **Stripe**: no monetizzazione MVP
- **Hosting video**: YouTube unlisted basta

### 13.3 Setup checklist Sprint 1 — giorno 1

Eseguibile in ~30 minuti.

- [ ] Creare repo GitHub `skill-practice` (privato)
- [ ] `npx create-next-app@latest skill-practice --ts --tailwind --app --src-dir --eslint`
- [ ] Creare progetto Supabase su supabase.com (region: **Frankfurt EU**)
- [ ] Copiare URL + anon key + service role key in `.env.local`
- [ ] `npx shadcn-ui@latest init` (theme dark, base color slate)
- [ ] `npm install @supabase/supabase-js @supabase/ssr next-pwa`
- [ ] Importare repo in Vercel (auto-deploy da `main`)
- [ ] Aggiungere env vars in Vercel Project Settings → Environment Variables
- [ ] Verificare deploy: `<nome>.vercel.app` risponde

### 13.4 File `.env.local.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # solo server-side, mai prefisso NEXT_PUBLIC_
```

`.env.local` in `.gitignore`. Solo `.env.local.example` committato.

---

## 14. SECURITY BASELINE

### 14.1 Modello di minaccia

MVP personale single-user: rischio basso. Asset da proteggere:

- Account utente → Supabase Auth gestisce hash, sessioni, recovery
- Dati pratica utente (`UserPlanItem`, `PracticeLog`) → privati per utente, RLS-protected
- Contenuti video → unlisted, non sensibili (kata pubblicabili)

### 14.2 Auth

Supabase Auth email/password Sprint 1. Magic link aggiungibile Sprint 2.

Niente custom auth, niente JWT manuali. Il proxy in `src/proxy.ts` gestisce refresh sessione e redirect.

### 14.3 RLS policies obbligatorie

Da scrivere nella prima migration. RLS attivata su **tutte** le tabelle. Pattern raccomandato Supabase: wrappare `auth.uid()` in `(SELECT auth.uid())` per farlo valutare come InitPlan (vedi migration 0023).

```sql
-- Statici: read pubblico per authenticated
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_read" ON skills FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_programs_read" ON exam_programs FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_skill_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esr_read" ON exam_skill_requirements FOR SELECT TO authenticated USING (true);

-- Dinamici: solo proprietario (wrap (SELECT auth.uid()) per planner InitPlan)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_owner" ON user_profiles FOR ALL TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

ALTER TABLE user_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_plan_items_owner" ON user_plan_items FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_logs_owner" ON practice_logs FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
```

### 14.4 Env vars rules

| Pattern | Visibilità | Esempio |
|---------|-----------|---------|
| `NEXT_PUBLIC_*` | Bundle client (visibili a chiunque) | URL Supabase, anon key, VAPID public key |
| Senza prefisso | Server-only (Server Components, Actions, Route Handlers) | service_role_key, VAPID private key, CRON_SECRET |

`SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY` e `CRON_SECRET` mai esposti al client. Il cron promemoria deve passare da route handler server-only.

### 14.5 Security headers

In `next.config.js`:

```javascript
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
```

Verifica grade A su securityheaders.com dopo deploy.

### 14.6 Trigger di upgrade security

| Evento | Azione |
|--------|--------|
| 2+ utenti reali | Audit RLS, magic link auth |
| Allievi <16 | Workflow consenso GDPR Art. 8 |
| Federazione paga | Audit security esterno, pen test, DPO |
| 10k+ MAU | Rate limiting (Upstash/Vercel), monitoring (Sentry), alerting |

---

## 15. COMPLIANCE E LEGALI (gating progressivo)

### 15.1 Stato attuale (Sprint 1.11)

MVP personale, founder unico utente, ma le **scaffolding legali sono già in app** in vista dell'apertura a utenti terzi. Pagine pubbliche disponibili senza login:

- `/privacy` — informativa GDPR Art. 13
- `/terms` — termini di servizio
- `/cookies` — cookie/storage policy
- `/disclaimer` — avvertenze pratica fisica

Tutto il testo non derivabile dal codice (titolare, DPO, retention, sub-processor, contatti, dati fiscali) è marcato con `[PLACEHOLDER: ...]`. **Le pagine non sono valide come documento legale finché i placeholder non vengono compilati e revisionati**, vedi `plan/completed/2026-05-03-profile-account-privacy-settings-plan.md` §"Explicit Missing Items To Complete".

In `/profile` esiste la sezione **Privacy e dati** con:

- Export JSON dei dati personali (`/profile/export`).
- Richiesta cancellazione account → record auditable in `account_deletion_requests` (vedi §4.4), pulizia eseguita manualmente da admin.
- Link alle pagine legali.

### 15.2 Trigger per completare i placeholder

I `[PLACEHOLDER: ...]` vanno compilati **prima** del primo di questi eventi:

- Primo utente non-founder accede all'app (anche solo per test interno alla scuola)
- Si parla con federazione di pre-adozione
- Si raccolgono email per waiting list
- Si pubblica una landing page promozionale o si attiva indicizzazione SEO

### 15.3 Decisione documenti legali (vedi D10)

Pagine custom in-app, non iubenda. Costo zero ricorrente, contenuti specifici per pratica fisica e scuola. Trade-off: la conformità formale richiede una revisione da DPO/avvocato prima del lancio pubblico, mentre iubenda fornirebbe testo pre-validato. Rivedibile se la federazione richiede policy generata da fonte certificata.

Cookie banner serve **solo** se vengono introdotti cookie non strettamente necessari (analytics, tracking, marketing). Allo stato attuale `/cookies` documenta solo cookie tecnici Supabase + cache PWA + YouTube no-cookie on demand → nessun banner consenso.

### 15.4 Quando arrivano allievi minorenni (federazione)

Stop e consultare un avvocato data protection prima di shippare. Required:

- Consenso parentale GDPR Art. 8 (sotto 16 in IT, sotto 14 in DE — verificare per stato)
- Workflow onboarding con verifica età + email genitore
- DPA (Data Processing Agreement) con la federazione come titolare
- Designazione DPO se >250 record o trattamento sistematico

### 15.5 Hosting e data residency

- **Supabase region: una EU** (NON US). Configurare alla creazione progetto, non modificabile dopo. Validi: `Frankfurt EU`, `London eu-west-2`. Il progetto attuale (`nano`) è su `London eu-west-2` — UK ha adequacy decision con EU per GDPR ✓
- **Vercel**: edge globale per static, ma dati DB restano in EU
- **Backup Supabase**: automatici, stesso region
- Dichiarare nel privacy policy: "I dati sono ospitati in EU su Supabase (Frankfurt) e Vercel (edge globale, no storage)"

### 15.6 Landing page e hub

Per MVP personale: **landing minimale (hero+CTA) implementata** come "lock screen" identitaria su `/`. Vedi `plan/completed/2026-04-26-landing-page-design.md`.

Da Sprint 2.x la CTA "Entra" della landing reindirizza a `/hub` (era `/today`) per utenti onboardati. L'hub è una home permanente con 6 tile che mostrano le aree dell'app e fungono da crocevia panoramico. Vedi `plan/completed/2026-05-01-hub-page-design.md`.

Il flusso completo: landing `/` → Entra → `/hub` → scegli area → BottomNav per saltare fra aree → ideogramma 丙午 in `AppHeader` per tornare al hub. Login/onboarding redirigono a `/hub`. Logout torna a `/` (landing).

L'AppHeader è non-sticky per evitare collisioni con sub-header sticky pre-esistenti.

Lo stato di onboarding è centralizzato in `src/lib/onboarding-state.ts` (helper `isProfileOnboarded`). Usato da landing, /hub, /onboarding per evitare check duplicati e inconsistenti.

Per pre-vendita federazione: landing statica separata su Carrd (€19/anno) o Framer (free tier). Una pagina, value prop, screenshot, form contatto. Non integrata nell'app.

---

## 16. DESIGN SYSTEM E TOOLING VISIVO

### 16.1 Approccio

Per MVP personale: zero branding, massima funzionalità. Identità visiva rifinita quando si va in pre-vendita federazione.

### 16.2 Componenti

Aggiornamento UI 2026-05-11: per coerenza con `CLAUDE.md`, `src/components/ui/` e' trattato come superficie shadcn-managed. Non aggiungere primitive custom in questa cartella e non modificarla a mano senza decisione esplicita. Le primitive custom vivono in `src/components/primitives/`.

shadcn/ui copiato nel repo (`src/components/ui/`). **Non è dipendenza npm** — è codice tuo, modificabile.

Setup minimo Sprint 1:

```bash
npx shadcn-ui@latest add button card sheet tabs avatar badge separator skeleton
```

Successivi (Sprint 2+): dialog, dropdown-menu, form, input, label, select, textarea.

### 16.3 Palette (dark default)

In `app/globals.css`:

```css
:root {
  --background: 0 0% 7%;          /* near-black */
  --foreground: 0 0% 95%;
  --card: 0 0% 10%;
  --primary: 0 65% 45%;            /* burgundy red — evoca arti marziali */
  --primary-foreground: 0 0% 98%;
  --accent: 35 85% 55%;            /* warm amber */
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;
  --border: 0 0% 18%;
  --radius: 0.75rem;
}
```

Iterare su realtimecolors.com prima di committare. Verificare contrasto WCAG AA (text vs background ≥ 4.5:1).

### 16.4 Tipografia

```typescript
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

Scale:
- Body: 16px (1rem)
- Card title: 20px (1.25rem)
- Section heading: 24-28px (1.5-1.75rem)
- Tap target: minimo 48px

### 16.5 Iconografia

Lucide React (incluso con shadcn). Set Sprint 1:

| Concetto | Icona |
|----------|-------|
| Tab Today | `Home` |
| Tab Library | `Library` |
| Tab Profile | `User` |
| Practice done | `Check` / `CheckCircle2` |
| Time | `Clock` |
| Focus skill | `Flame` |
| Play video | `Play` |
| Add to plan | `Plus` |
| Hide skill | `EyeOff` |
| Show skill | `Eye` |
| Next/expand | `ChevronRight` |

### 16.6 Tooling per design

| Strumento | Quando usare | Note |
|-----------|--------------|------|
| **v0.dev** | Generare componenti complessi da prompt | Output shadcn-compatible, copia/incolla |
| **shadcn/ui themes** (ui.shadcn.com/themes) | Scegliere variante palette | Copia variabili CSS direttamente |
| **frontend-design** skill | UI di alta qualità su richiesta | Skill disponibile localmente — invocabile per task UI |
| **realtimecolors.com** | Iterare palette in tempo reale | Free, no signup |
| **stitch MCP** | Generare schermate da prompt | MCP installato — utile per mockup veloci |
| **Figma** | Solo se servono mockup high-fidelity | Skip-pabile per MVP |

### 16.7 Per scaling federazione

Quando si va in pre-vendita:
- Logo proper (wordmark + glyph) — Looka / Brandmark / illustrator manuale
- Mood board basato su identità federazione
- Palette curata con accessibilità WCAG AA verificata
- Iconografia custom per concetti specifici (forme, tecniche, esami)
- Mockup Figma di tutte le schermate prima di iterare V2

---

## 17. ESECUZIONE PER AI AGENT

### 17.1 Gerarchia documenti

| Livello | File | Scopo | Lettore |
|---------|------|-------|---------|
| Strategico | `plan/current-plan.md` (questo) | Cosa, perché, decisioni | Founder + agent orchestratore |
| Workspace | `CLAUDE.md` (root) | Convenzioni globali, fonte di verità | Ogni agent |
| Operativo | `skill-practice/CLAUDE.md` | Convenzioni implementative concrete | Agent esecutore di codice |
| Tattico | Singolo task | Unità atomica di lavoro | Sub-agent atomico |

In conflitto vince ciò che è più alto. Vedi `CLAUDE.md` (root) per la regola completa.

### 17.2 Sprint 1 come task atomici

> **Storico:** questa tabella descrive la suddivisione iniziale di Sprint 1 (bootstrap → deploy). I task sono stati eseguiti; alcuni riferimenti (es. `library/exam/[examId]/page.tsx`, `library/all/page.tsx`) sono superati dagli sprint operativi 1.5–1.15 che hanno ristrutturato `/library`, `/plan`, `/programma`. Per lo stato attuale vedi §9 Sprint 1.x e §5.

Ogni task eseguibile da un sub-agent in isolamento. Ordine = dipendenze.

| # | Task | Deliverable | Sub-agent type | Acceptance criteria |
|---|------|-------------|----------------|---------------------|
| 1 | Bootstrap progetto | `skill-practice/` con Next.js + Tailwind + shadcn + next-pwa configurati | general-purpose | `npm run build` passa, `npm run dev` mostra placeholder |
| 2 | Schema DB | `supabase/migrations/0001_schema.sql` con 6 tabelle + RLS | general-purpose | `supabase db reset` esegue, RLS attiva su tutte le tabelle |
| 3 | Seed data | `supabase/migrations/0002_seed_school_skills.sql` con i dati storici di §12 | general-purpose | 11 skill + 3 esami + junction `exam_skill_requirements` popolata |
| 4 | Supabase clients | `lib/supabase/{client,server,middleware}.ts` | general-purpose | I 3 client esportano funzioni separate, tipi corretti |
| 5 | Proxy auth (ex middleware) | `src/proxy.ts` con redirect a `/login` per `(app)/*` (Next 16 file convention) | general-purpose | Request a `/today` senza sessione → 307 a `/login` |
| 6 | Login page | `(auth)/login/page.tsx` con form email/password | frontend-design | Login funzionante con utente Supabase |
| 7 | Onboarding | `(app)/onboarding/page.tsx` con selezione esame | frontend-design | UserProfile creato, redirect a `/today` |
| 8 | YouTubeEmbed | `components/skill/YouTubeEmbed.tsx` | general-purpose | Converte `watch?v=` in `embed/`, responsive 16:9, `rel=0` |
| 9 | practice-logic | `lib/practice-logic.ts` puro + test | general-purpose | Test unitario: input N skill con stati → output corretto |
| 10 | Today page | `(app)/today/page.tsx` | frontend-design | Mostra focus + review + maintenance del giorno |
| 11 | PracticeCheckButton | Server Action `actions/practice.ts` + componente client | general-purpose | Click → riga in `practice_logs`, `lastPracticedAt` aggiornato |
| 12 | Library "mio livello" | `(app)/library/page.tsx` | frontend-design | Mostra skill con `minimumLevel <= user.assignedLevel` |
| 13 | Library "per esame" | `(app)/library/exam/[examId]/page.tsx` | frontend-design | Skill richieste dall'esame, organizzate per categoria |
| 14 | Library "tutto" | `(app)/library/all/page.tsx` con filtri categoria | frontend-design | Tutte le skill accessibili, filtrate |
| 15 | Skill detail | `(app)/skill/[skillId]/page.tsx` | frontend-design | Video play, "Aggiungi al piano" funzionante |
| 16 | Profile page | `(app)/profile/page.tsx` | frontend-design | Nome, livello, esame, progresso settimanale |
| 17 | BottomNav | `(app)/layout.tsx` con nav | frontend-design | 3 tab funzionanti, active state |
| 18 | PWA manifest | `public/manifest.json` + icone (SVG ora; PNG 192/512/maskable per polish) | general-purpose | Manifest valido, installabile su Android. Lighthouse PWA ≥90 richiede service worker → Sprint 2 con `@serwist/next` |
| 19 | Security headers | `next.config.js` da §14.5 | general-purpose | securityheaders.com grade A |
| 20 | Deploy | Vercel + env vars | general-purpose | URL Vercel pubblico funzionante, login OK |

Dipendenze critiche:
- 4-5 dipendono da 2 (clients usano lo schema)
- 6-7 dipendono da 5 (auth flow richiede middleware)
- 10-16 dipendono da 4-9 (UI usa clients + logic)
- 20 è ultimo (richiede tutto verde)

### 17.3 Definition of Done per task

Ogni task chiuso solo quando:

1. Codice scritto e committato
2. `npm run build` passa
3. `npm run lint` passa
4. Test manuale del golden path
5. Auto-deploy Vercel passa (se applicabile)
6. Tutti gli acceptance criteria del task verificati

### 17.4 Workflow consigliato

**Opzione A — orchestrato con GSD** (più strutturato, audit trail completo):
- `/gsd:new-project` per inizializzare GSD nel `skill-practice/`
- `/gsd:plan-phase` per planificare ogni gruppo di task (Sprint 1 ≈ 3 fasi: bootstrap+DB, auth+core, UI+deploy)
- `/gsd:execute-phase` per esecuzione con commit atomici
- `/gsd:verify-work` al termine di ogni fase

**Opzione B — leggera** (più rapida):
- Passare la tabella di §17.2 a un agent unico
- Istruzione: "Esegui in ordine, fermati a fine task 5, 11, 17 e 20 per conferma"
- Acceptance criteria di colonna 5 sono il check automatico

### 17.5 Runbook operativo (post-launch)

| Operazione | Come fare |
|------------|-----------|
| Aggiungere una skill | Insert in `skills` via Supabase dashboard. Per associarla a un esame: insert in `exam_skill_requirements` |
| Aggiungere un esame | Insert in `exam_programs` + N row in `exam_skill_requirements` |
| Cambiare livello utente | Update `user_profiles.assigned_level` via dashboard |
| Sostituire video di una skill | Update `skills.video_url` con nuovo URL YouTube |
| Reset piano utente | Delete da `user_plan_items` con quel `user_id` + `source = 'exam_program'`, poi rigenerare via app (cambio esame) |
| Vedere log pratica | Query Supabase: `select * from practice_logs where user_id = ... order by date desc` |
| Promuovere admin | Update `user_profiles.role = 'admin'` (predisposto, attivo da Sprint 3) |
| Backup DB | Automatico Supabase. Snapshot manuale dal dashboard prima di migrazioni rischiose |

### 17.6 Quando aggiornare questo piano

Vedi `CLAUDE.md` root §"Quando aggiornare il piano". In sintesi:

- Decisione aperta in §2.2 chiusa → spostala in §2.1
- Stack item cambia → §3 + giustificazione in §2.1
- Nuova rotta/tabella/componente core → §4 o §5
- Sprint chiuso → §9
- Brief tecnico sostituito → vecchio in `archive/`, nuovo in `plan/current-plan.md`

---

## 18. RIASSUNTO ESECUTIVO

**Cosa stai costruendo:** la versione digitale del quaderno tecnico della federazione di kung fu, con video al posto delle foto e proposta di pratica giornaliera.

**Per chi:** te stesso ora. Federazione e allievi nel medio termine (architettura predisposta, non implementata).

**Costi:** 0€ per partire (vedi §13).

**Da fare prima di scrivere codice:** seguire la checklist setup §13.3 (~30 min). Tutte le decisioni bloccanti sono chiuse.

**Decisioni già chiuse (vedi §2.1):** D1 Supabase Auth, D2 no competitor reale, D3 valutazione soggettiva, D4 bacheca → Sprint 2.

**Esecuzione Sprint 1:** 20 task atomici in §17.2, eseguibili da sub-agent con acceptance criteria espliciti. Workflow GSD raccomandato (§17.4 Opzione A).

**Da fare durante l'uso reale:**
- Valutare soggettivamente l'utilità dell'app (§11.1)
- Riesaminare D7 (player video) se loop/slow-mo diventano frustranti
- Decidere D5 (SRS reale) e D6 (note post-pratica) sulla base dell'uso

**Cosa NON fare ora:** competere con budoo su admin, costruire community, aggiungere AI, scalare oltre il founder prima della validazione.
