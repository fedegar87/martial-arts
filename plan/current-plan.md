# Skill Practice — Piano Attuale

**Status:** Active
**Versione brief:** v3
**Ultimo aggiornamento:** 2026-04-25
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

### 2.2 Decisioni aperte ⚠️

| # | Decisione | Opzioni | Impatto | Priorità |
|---|-----------|---------|---------|----------|
| **D5** | **SRS "vero" per review/maintenance** | A) Rotazione semplice (ultima pratica). B) Intervalli crescenti tipo Anki/Chessable | Letteratura supporta SR per skill motorie. B = differenziatore reale ma più complesso. Sprint 3 corretto | 🟢 Sprint 3 o oltre |
| **D7** | **Player video** | YouTube embed accettato in v3. Verificare se loop/slow-mo diventano frustranti dopo 30 giorni di uso personale. Eventuale switch a MP4 self-hosted con player custom | Se uso personale rivela frustrazione → riapertura decisione | 🟢 Dopo 30 giorni di uso |

---

## 3. STACK TECNOLOGICO

| Componente | Scelta | Note |
|------------|--------|------|
| Frontend | Next.js 14+ App Router + TypeScript | — |
| UI | Tailwind CSS + shadcn/ui | Componenti accessibili pronti |
| PWA | Service worker statico + manifest | `public/sw.js` registrato in produzione; `next-pwa` resta installato ma non usato |
| Database | Supabase (PostgreSQL + Auth) | Auth predisposta multi-utente |
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
- `next-pwa@5.6` resta installato ma **non usato**. Offline locale implementato con `public/sw.js` + `ServiceWorkerRegister`; rimozione pacchetto da fare quando Windows non blocca `node_modules`
- Per breaking changes complete vedi `skill-practice/node_modules/next/dist/docs/01-app/`

---

## 4. MODELLO DATI

### 4.1 Strutture statiche (seed authored)

```typescript
type School = {
  id: string
  name: string                        // "Federazione Kung Fu XYZ"
  description?: string
}

type Skill = {
  id: string
  schoolId: string
  name: string                        // "Siu Nim Tao - Sezione 3"
  category: SkillCategory
  description?: string
  videoUrl: string                    // YouTube unlisted
  thumbnailUrl?: string
  teacherNotes?: string
  estimatedDurationSeconds?: number
  minimumLevel: number                // Filtro UI per livello utente
  order: number
  createdAt: Date
}

type SkillCategory =
  | "forme"
  | "tecniche_base"
  | "combinazioni"
  | "preparatori"
  | "condizionamento"
  | "altro"

type ExamProgram = {
  id: string
  schoolId: string
  levelNumber: number                 // 1, 2, 3...
  levelName: string                   // "1° Livello - Cintura Gialla"
  description?: string
  skills: ExamSkillRequirement[]
}

type ExamSkillRequirement = {
  skillId: string
  defaultStatus: "focus" | "review" | "maintenance"
}
```

> ⚠️ **Nota implementazione SQL:** in TypeScript `skills` è array embedded per comodità. In Supabase/PostgreSQL deve essere una **tabella separata** `exam_skill_requirements (exam_id, skill_id, default_status)` come junction table. **Non** usare campo JSONB: rende impossibile queryare/aggiornare i livelli in modo pulito quando il numero di esami e skill cresce.

### 4.2 Strutture dinamiche (per utente)

```typescript
type UserProfile = {
  id: string
  schoolId: string
  displayName: string
  assignedLevel: number               // Filtro contenuti visibili
  preparingExamId?: string
  role: "student" | "instructor" | "admin"  // Predisposto
  createdAt: Date
}

type UserPlanItem = {
  id: string
  userId: string
  skillId: string
  status: "focus" | "review" | "maintenance"
  source: "exam_program" | "manual"
  isHidden: boolean
  lastPracticedAt?: Date
  addedAt: Date
}

type PracticeLog = {
  id: string
  userId: string
  date: string                        // "2026-04-25"
  skillId: string
  completed: boolean
  personalNote?: string               // Sprint 2 (D6)
  repsTarget?: number                 // null = log legacy senza schedule
  repsDone: number                    // default 0
  createdAt: Date
}

type TrainingSchedule = {
  userId: string
  weekdays: number[]                  // ISO 1=Lun ... 7=Dom
  cadenceWeeks: 1 | 2 | 4              // Frequenza review/maintenance
  repsPerForm: number                  // 1-10, snapshot del valore attuale
  startDate: string                    // YYYY-MM-DD
  endDate: string                      // YYYY-MM-DD
  createdAt: Date
  updatedAt: Date
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

---

## 5. STRUTTURA CARTELLE PROGETTO

```
skill-practice/
├── CLAUDE.md                           # Regole di progetto (vincoli stack, struttura, scope)
├── public/
│   ├── manifest.json
│   ├── icons/                          # 192, 512, maskable
│   └── favicon.ico
├── src/
│   ├── proxy.ts                        # Auth gate + refresh sessione Supabase (Next 16: ex middleware.ts)
│   ├── app/
│   │   ├── layout.tsx                  # Shell HTML + provider
│   │   ├── page.tsx                    # Redirect → /today o /onboarding
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/                      # Route group protetto da middleware
│   │   │   ├── layout.tsx              # Layout app + BottomNav
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── today/page.tsx
│   │   │   ├── hub/page.tsx               # Home permanente con 6 aree
│   │   │   ├── library/
│   │   │   │   ├── page.tsx            # default: mio livello
│   │   │   │   ├── exam/[examId]/page.tsx
│   │   │   │   └── all/page.tsx
│   │   │   ├── skill/[skillId]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── setup/page.tsx
│   │   │   │   └── calendar/page.tsx
│   │   │   └── news/page.tsx           # Sprint 2
│   │   └── auth/
│   │       └── callback/route.ts       # Magic link / OAuth callback
│   ├── components/
│   │   ├── ui/                         # shadcn/ui generato (non modificare a mano)
│   │   ├── nav/
│   │   │   └── BottomNav.tsx
│   │   ├── hub/
│   │   │   ├── HubTile.tsx
│   │   │   ├── HubGrid.tsx
│   │   │   └── HubBackground.tsx
│   │   ├── today/
│   │   │   ├── TodaySkillCard.tsx
│   │   │   ├── PracticeCheckButton.tsx
│   │   │   ├── RestDayCard.tsx
│   │   │   ├── RepsCounter.tsx
│   │   │   └── WeekProgress.tsx
│   │   ├── sessions/
│   │   │   ├── WeekdayChips.tsx
│   │   │   ├── DurationPicker.tsx
│   │   │   ├── CadencePicker.tsx
│   │   │   ├── RepsStepper.tsx
│   │   │   ├── SessionPreview.tsx
│   │   │   ├── SetupForm.tsx
│   │   │   └── CalendarMonth.tsx
│   │   ├── library/
│   │   │   ├── SkillListItem.tsx
│   │   │   └── AddToPlanSheet.tsx
│   │   ├── skill/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── profile/
│   │   │   └── ExamSelector.tsx
│   │   └── shared/
│   │       ├── AppHeader.tsx
│   │       ├── AppHeaderConditional.tsx
│   │       ├── ExamCountdown.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # createBrowserClient (Client Components)
│   │   │   ├── server.ts               # createServerClient (RSC + Server Actions)
│   │   │   └── middleware.ts           # helper per src/middleware.ts
│   │   ├── queries/                    # Lettura: chiamate da Server Components
│   │   │   ├── skills.ts
│   │   │   ├── plan.ts
│   │   │   ├── practice-log.ts
│   │   │   ├── training-schedule.ts
│   │   │   └── user-profile.ts
│   │   ├── actions/                    # Mutation: Next.js Server Actions
│   │   │   ├── plan.ts                 # add / hide / change-status
│   │   │   ├── practice.ts             # mark done
│   │   │   ├── training-schedule.ts
│   │   │   └── onboarding.ts
│   │   ├── practice-logic.ts           # Algoritmo "oggi fai questo" (puro)
│   │   ├── session-scheduler.ts        # Logica pura "sessione del giorno X"
│   │   ├── plan-manager.ts             # Genera UserPlanItem da ExamProgram
│   │   ├── onboarding-state.ts         # Helper isProfileOnboarded (puro)
│   │   ├── landing.ts                  # resolveLandingDestination (puro)
│   │   ├── youtube.ts                  # watch?v= → embed/
│   │   ├── types.ts                    # Tipi condivisi (DB + UI)
│   │   └── utils.ts                    # Solo utility realmente trasversali
│   └── hooks/                          # Solo client-side reattivo (mutation)
│       ├── usePracticeMutation.ts
│       └── usePlanMutation.ts
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql             # Tabelle + RLS
│   │   ├── 0002_seed_school_skills.sql # Seed scuola, skill, esami
│   │   └── 0012_training_schedule.sql  # Schedulazione sessioni + reps tracking
│   └── seed.sql                        # Per `supabase db seed` locale
├── .env.local.example
├── next.config.js                      # + next-pwa wrapping
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.1 Note vincolanti sulla struttura

- **Route groups `(auth)` e `(app)`**: separano pagine pubbliche da protette. Il middleware in `src/middleware.ts` redirige verso `/login` qualunque rotta sotto `(app)` se la sessione manca.
- **`lib/supabase/` con tre file**: in App Router servono client diversi per Client Components, RSC/Server Actions e middleware. Un singolo `supabase.ts` rompe SSR e session refresh.
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
2. Skill con `status = "review"` → mostrate **2-3 al giorno** in rotazione, ordinate per `lastPracticedAt` ascendente
3. Skill con `status = "maintenance"` → mostrata **1 ogni 3-4 giorni** in rotazione

**⚠️ D5:** la rotazione è "ultima pratica meno recente". Non è SRS vero. Da rivisitare in Sprint 3 con intervalli crescenti.

### 6.2 Generazione piano da esame (`plan-manager.ts`)

Quando l'utente seleziona un esame:
1. Per ogni `ExamSkillRequirement` del programma → crea una `UserPlanItem` con `source: "exam_program"` e `status` dal `defaultStatus`
2. L'utente può aggiungere skill manualmente → `source: "manual"`
3. L'utente può nascondere singole skill → `isHidden: true` (non eliminate, ripristinabili)
4. Cambio esame → vecchie `UserPlanItem` con `source: "exam_program"` archiviate, nuove generate

### 6.3 Filtro livello (UI only, non security)

Tutti i query lato client filtrano: `skill.minimumLevel <= user.assignedLevel`. Non è protezione: è UX per non sovraccaricare l'allievo con contenuti non rilevanti.

### 6.4 Schedulazione sessioni (`session-scheduler.ts`)

Quando l'utente completa il setup in `/sessions/setup`, una riga in `training_schedule` definisce giorni della settimana, durata, cadenza e ripetizioni. La funzione pura `getScheduledSession(date, schedule, items)` distribuisce le forme:

- **Focus**: tutte ogni sessione (ordinate per `display_order`)
- **Review**: bucket deterministico, ciclo `cadence_weeks * weekdays.length`
- **Maintenance**: bucket deterministico, ciclo `cadence_weeks * 2 * weekdays.length`

Sostituisce `getTodayPractice` (§6.1) per gli utenti con schedule attiva. Vedi `plan/2026-04-26-training-schedule-design.md` per i dettagli di algoritmo e UX.

---

## 7. NAVIGAZIONE E UI

### 7.0 Hub e header globale

Da Sprint 2.x esiste `/hub`, home permanente con 6 tile (Oggi, Programma, Scuola Chang, Progressi, Bacheca, Profilo). La landing CTA `Entra` reindirizza qui per utenti onboardati. Da `/hub` si raggiunge ogni area.

In tutte le pagine `(app)/*` tranne `/hub` è montato `AppHeader`: barra non-sticky con ideogramma 丙午 cliccabile che riporta a `/hub`. È non-sticky di design: l'AppHeader scrolla via per non collidere con sticky pre-esistenti su `/today` e `/sessions/calendar`. Vedi `plan/2026-05-01-hub-page-design.md`.

### 7.1 Bottom navigation

```
[ 🥋 Oggi ]    [ 📚 Libreria ]    [ 👤 Profilo ]
```

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

- **1.5 — Curriculum FESK:** schema/tipi/UI/seed implementati; `0004_seed_fesk.sql` generato da `skill-practice/scripts/generate-fesk-seed.mjs` usando `plan/curriculum-mapping-fesk.md`.
- **1.6 — VideoPlayer custom:** implementato in `src/components/skill/VideoPlayer.tsx`; sostituisce `YouTubeEmbed` e carica YouTube solo dopo tap.
- **1.7 — UX Programma + Modalità di studio:** schema `0005_plan_mode.sql`, `/library/program`, `/plan/exam`, `/plan/custom` e azioni RPC atomiche implementate; richiede migrations applicate per walkthrough reale.
- **1.8 — Tab Progresso:** `/progress` e BottomNav a 4 tab implementati con SVG/Tailwind, senza dipendenze chart.
- **1.9 — Schedulazione sessioni:** `0012_training_schedule.sql` (nuova tabella + reps su `practice_logs`), route `/sessions/setup` e `/sessions/calendar`, algoritmo `lib/session-scheduler.ts` puro, reps tracking via `incrementRep`/`decrementRep`, link nel profilo. Design: `plan/2026-04-26-training-schedule-design.md`. Plan: `plan/2026-04-26-training-schedule-plan.md`.
- **Visual identity FESK:** tema dark/gold applicato in `globals.css`, con overlay grain e componenti core meno arrotondati.

1. Setup: Next.js + Tailwind + shadcn/ui + PWA + Supabase
2. Schema database + seed data (skill, esami, scuola)
3. Login (Supabase Auth)
4. Onboarding (conferma livello + selezione esame)
5. Tab "Oggi": pratica guidata con focus/review/maintenance
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
| Notifiche push | Non per MVP personale |
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

## 12. SEED DATA INIZIALE (Wing Chun)

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
      { skillId: "s9", defaultStatus: "review" },
      { skillId: "s11", defaultStatus: "review" },
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
      { skillId: "s5", defaultStatus: "review" },
      { skillId: "s6", defaultStatus: "review" },
      { skillId: "s9", defaultStatus: "review" },
    ]
  },
  {
    id: "exam-3", schoolId: "school-1",
    levelNumber: 3,
    levelName: "3° Livello",
    description: "Chum Kiu, applicazioni avanzate",
    skills: [
      { skillId: "s4", defaultStatus: "focus" },
      { skillId: "s3", defaultStatus: "review" },
      { skillId: "s10", defaultStatus: "review" },
      { skillId: "s1", defaultStatus: "maintenance" },
      { skillId: "s2", defaultStatus: "maintenance" },
    ]
  },
]
```

> Ricorda §4.1: in SQL `examPrograms[].skills` diventa la junction table `exam_skill_requirements`, non un JSONB.

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

Niente custom auth, niente JWT manuali. Il middleware in `src/middleware.ts` gestisce refresh sessione e redirect.

### 14.3 RLS policies obbligatorie

Da scrivere nella prima migration. RLS attivata su **tutte** le tabelle.

```sql
-- Statici: read pubblico per authenticated
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_read" ON skills FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_programs_read" ON exam_programs FOR SELECT TO authenticated USING (true);

ALTER TABLE exam_skill_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esr_read" ON exam_skill_requirements FOR SELECT TO authenticated USING (true);

-- Dinamici: solo proprietario
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_owner" ON user_profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

ALTER TABLE user_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_plan_items_owner" ON user_plan_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "practice_logs_owner" ON practice_logs FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

### 14.4 Env vars rules

| Pattern | Visibilità | Esempio |
|---------|-----------|---------|
| `NEXT_PUBLIC_*` | Bundle client (visibili a chiunque) | URL Supabase, anon key |
| Senza prefisso | Server-only (Server Components, Actions, Route Handlers) | service_role_key |

`SUPABASE_SERVICE_ROLE_KEY` mai esposta al client. Usata solo in script di migrazione/admin.

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

### 15.1 Stato attuale: zero requisiti

MVP personale, founder unico utente. Nessun dato di terzi raccolto. Nessuna obbligazione GDPR. Nessuna landing page necessaria.

### 15.2 Trigger di attivazione

Aggiungere documenti legali appena si verifica uno di questi:

- Primo utente non-founder accede all'app (anche solo per test)
- Si parla con federazione di pre-adozione
- Si raccolgono email per waiting list
- Si pubblica una landing page promozionale

### 15.3 Quando arriva il primo utente terzo

Documenti minimi:

| Documento | Strumento consigliato | Costo | Tempo setup |
|-----------|----------------------|-------|-------------|
| Privacy Policy | iubenda generator | €29/anno | 1 ora |
| Terms of Service | iubenda | incluso | 1 ora |
| Cookie banner | iubenda Cookie Solution | incluso | 30 min |
| Informativa GDPR partecipanti | testo custom italiano | 0 | 2 ore |

Alternative gratuite: termsfeed.com, termly.io (con limiti).

Cookie banner serve **solo** se usi cookie non strettamente necessari (analytics, tracking). Se non aggiungi GA/Plausible, nessun banner.

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

Per MVP personale: **landing minimale (hero+CTA) implementata** come "lock screen" identitaria su `/`. Vedi `plan/2026-04-26-landing-page-design.md`.

Da Sprint 2.x la CTA "Entra" della landing reindirizza a `/hub` (era `/today`) per utenti onboardati. L'hub è una home permanente con 6 tile che mostrano le aree dell'app e fungono da crocevia panoramico. Vedi `plan/2026-05-01-hub-page-design.md`.

Il flusso completo: landing `/` → Entra → `/hub` → scegli area → BottomNav per saltare fra aree → ideogramma 丙午 in `AppHeader` per tornare al hub. Login/onboarding redirigono a `/hub`. Logout torna a `/` (landing).

L'AppHeader è non-sticky per evitare collisioni con sub-header sticky pre-esistenti.

Lo stato di onboarding è centralizzato in `src/lib/onboarding-state.ts` (helper `isProfileOnboarded`). Usato da landing, /hub, /onboarding per evitare check duplicati e inconsistenti.

Per pre-vendita federazione: landing statica separata su Carrd (€19/anno) o Framer (free tier). Una pagina, value prop, screenshot, form contatto. Non integrata nell'app.

---

## 16. DESIGN SYSTEM E TOOLING VISIVO

### 16.1 Approccio

Per MVP personale: zero branding, massima funzionalità. Identità visiva rifinita quando si va in pre-vendita federazione.

### 16.2 Componenti

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

Ogni task eseguibile da un sub-agent in isolamento. Ordine = dipendenze.

| # | Task | Deliverable | Sub-agent type | Acceptance criteria |
|---|------|-------------|----------------|---------------------|
| 1 | Bootstrap progetto | `skill-practice/` con Next.js + Tailwind + shadcn + next-pwa configurati | general-purpose | `npm run build` passa, `npm run dev` mostra placeholder |
| 2 | Schema DB | `supabase/migrations/0001_schema.sql` con 6 tabelle + RLS | general-purpose | `supabase db reset` esegue, RLS attiva su tutte le tabelle |
| 3 | Seed data | `supabase/migrations/0002_seed.sql` con i dati di §12 | general-purpose | 11 skill + 3 esami + junction `exam_skill_requirements` popolata |
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
