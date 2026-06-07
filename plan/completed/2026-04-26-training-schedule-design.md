---
title: Schedulazione sessioni di allenamento (Today empty → setup → calendario)
date: 2026-04-26
status: approved
sprint: 1.9
supersedes: —
---

# Schedulazione sessioni di allenamento

## 0. Contesto

Oggi `/today` con piano vuoto mostra un CTA "Apri programma esame / selezione". L'utente chiede di trasformarlo in un **vero schedulatore di sessioni**: una volta definite preferenze (giorni, durata, cadenza, ripetizioni), Today distribuisce automaticamente le forme del programma attivo nelle sessioni della settimana, fino a una data di fine, con un calendario completo navigabile.

Resta dentro lo scope MVP single-user. Nessuna gamification, nessuna notifica, nessuna feature multi-utente.

## 1. Decisioni chiuse in brainstorming

| # | Domanda | Scelta |
|---|---------|--------|
| Q1 | Cosa significa "cadenza" | Frequenza per forma (ogni X settimane ricompare) |
| Q2 | Cadenza unica o per stato | Focus sempre, una sola cadenza per review/maintenance, maintenance default 2× cadenza review |
| Q3 | Ripetizioni per forma | Numero unico globale (default 3, range 1-10) |
| Q4 | Durata in mesi | Fine rigida + serve anche per visualizzare il calendario fino alla fine |
| Q5 | Schedulazione computed o materialized | Computed (regole salvate, sessioni calcolate al volo) |

## 2. Modello dati

### 2.1 Nuova tabella `training_schedule`

Una sola riga per utente. Si crea/aggiorna al completamento del setup.

```sql
CREATE TABLE training_schedule (
  user_id        uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  weekdays       smallint[] NOT NULL,           -- ISO weekday: 1=Lun ... 7=Dom
  cadence_weeks  smallint NOT NULL,             -- 1, 2 o 4
  reps_per_form  smallint NOT NULL DEFAULT 3,
  start_date     date NOT NULL,
  end_date       date NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (array_length(weekdays, 1) BETWEEN 1 AND 7),
  CHECK (cadence_weeks IN (1, 2, 4)),
  CHECK (reps_per_form BETWEEN 1 AND 10),
  CHECK (end_date > start_date)
);
ALTER TABLE training_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ts_owner" ON training_schedule FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

**Una sola `cadence_weeks`** per review e maintenance. Maintenance internamente moltiplica × 2. Splittabile in futuro senza migrazione bloccante.

### 2.2 Estensione `practice_logs`

```sql
ALTER TABLE practice_logs
  ADD COLUMN reps_target smallint,             -- snapshot dal training_schedule al primo log della giornata
  ADD COLUMN reps_done   smallint NOT NULL DEFAULT 0;
```

Resta una riga per `(user_id, skill_id, date)`. Backward compatible: log con `reps_target = NULL` mantengono semantica corrente (`completed = boolean` puro).

`completed` viene calcolato come `reps_done >= reps_target` quando `reps_target` non è NULL, altrimenti resta gestito a mano dall'azione esistente.

## 3. Algoritmo `getScheduledSession`

File: `src/lib/session-scheduler.ts`. Funzione pura, niente DB.

```
Input:
  date           — data target
  schedule       — riga training_schedule (oppure null)
  items          — UserPlanItem visibili (con skill joinata)

Output:
  | { kind: "no_schedule" }
  | { kind: "expired", endDate: date }
  | { kind: "rest_day", nextTrainingDate: date }
  | { kind: "training", focus: T[], review: T[], maintenance: T[] }
```

### 3.1 Logica

1. Se `schedule == null` → `no_schedule`.
2. Se `date > schedule.end_date` → `expired`.
3. Se `date < schedule.start_date` o weekday(date) ∉ `weekdays` → `rest_day` con calcolo prossimo training day.
4. Calcola `session_index` = numero di training-day passati da `start_date` fino a `date` inclusa, − 1.
5. `focus` = tutti gli item con `status = "focus"` (ordinati per `skill.display_order`).
6. `cycle_size_review = cadence_weeks * weekdays.length`
   `review = bucket(items_review, session_index, cycle_size_review)`
7. `cycle_size_maint = (cadence_weeks * 2) * weekdays.length`
   `maintenance = bucket(items_maint, session_index, cycle_size_maint)`

### 3.2 Bucket distribution (deterministica)

```ts
function bucket<T>(items: T[], sessionIndex: number, cycleSize: number, key: (t: T) => string): T[] {
  if (items.length === 0 || cycleSize === 0) return [];
  const sorted = [...items].sort((a, b) => key(a).localeCompare(key(b)));
  const formsPerSession = Math.ceil(sorted.length / cycleSize);
  const slot = sessionIndex % cycleSize;
  return sorted.slice(slot * formsPerSession, (slot + 1) * formsPerSession);
}
```

Garanzie:
- Ogni forma compare **esattamente una volta** per ciclo se `N <= cycleSize`.
- Se `N > cycleSize`, distribuzione uniforme con qualche forma in più per slot.
- Se `N < cycleSize`, alcuni slot sono vuoti — riempiti dal focus, ok.
- `sort` su `skill_id` (uuid) è stabile, quindi a parità di input l'output è identico.

### 3.3 `listSessionsInRange(from, to, schedule, items)`

Itera su `for d = from; d <= to; d += 1 day` chiamando `getScheduledSession`. Restituisce `{ date, session }[]`. Usato dalla pagina calendario; nessun extra DB query (la sessione è funzione di parametri già caricati).

## 4. UX

### 4.1 Empty state Today (3 stati)

| Stato | Trigger | CTA |
|-------|---------|-----|
| No schedule | Nessuna riga in `training_schedule` | "Definisci le tue sessioni di allenamento" → `/sessions/setup` |
| Schedule scaduta | `end_date < today` | "Le tue sessioni sono terminate" → `/sessions/setup` (form pre-compilato) |
| No piano | `plan_mode = exam` ma `preparing_exam_id IS NULL`, oppure `custom` con 0 manual items | come oggi (link a `/plan/exam` o `/plan/custom`) — il setup richiede un programma attivo |

Se schedule attiva ma oggi è weekday non in `weekdays` → **non è empty**: render `<RestDayCard nextSession={...} />`.

### 4.2 Setup (`/sessions/setup`)

Single page form, 5 card scrollabili in sequenza. Niente wizard multi-step.

1. **Programma attivo** — radio Esame/Personalizzato, default `profile.plan_mode`. Etichetta riepilogo del programma corrente. Link "Modifica esame/selezione" → `/plan/exam` o `/plan/custom?from=setup`.
2. **Giorni di allenamento** — 7 chip toggle (Lun…Dom). Almeno 1 selezionato per submit.
3. **Durata** — pill: 1 mese / 2 mesi / 3 mesi / 6 mesi (4/8/12/24 settimane). Mostra "fino a 25 lug 2026".
4. **Cadenza ripasso** — radio: ogni settimana / ogni 2 settimane / ogni mese (1/2/4).
5. **Ripetizioni per forma** — stepper (1-10, default 3). Anteprima reactiva: "Sessione tipo: ~12 minuti, 4 forme × 3 ripetizioni".

Submit: `setupTrainingSchedule(formData)` Server Action → upsert riga → `revalidatePath('/today', '/sessions/calendar')` → redirect `/today`.

### 4.3 Today con schedule attiva

- Branca tra empty / rest / training.
- Se training day: stesse 3 sezioni Focus/Ripasso/Mantenimento di oggi, ma:
  - `TodaySkillCard` mostra `RepsCounter` con `reps_done / reps_target`.
  - Bottone primario "Fatto" → "**+1 ripetizione**". Bottone secondario "↶" annulla l'ultima.
  - Card si segna verde "Completata" quando `reps_done >= reps_target`.
  - Una completion bar in cima alla sessione (0% / 33% / 66% / 100% delle forme completate).
- `MetricStrip` adattata: aggiungo "Cadenza" e "Fine" (oppure mini-pannello "Schedule" sopra — scelta visiva al momento dell'implementazione).

### 4.4 Reps tracking (`incrementRep` / `decrementRep`)

Estensione di `src/lib/actions/practice.ts`:

```
incrementRep(skillId, date)
  -- Server-side: legge training_schedule per ottenere reps_per_form corrente
  -- UPSERT practice_logs (user_id, skill_id, date)
  --   nuovo: reps_target = ts.reps_per_form, reps_done = 1
  --   esistente: reps_done = LEAST(reps_done + 1, reps_target)
  -- aggiorna user_plan_items.last_practiced_at = now()
  -- revalidatePath('/today')

decrementRep(skillId, date)
  -- se reps_done > 0: decremento di 1
  -- se reps_done diventa 0: lascia la riga (non delete) per audit; completed = false
```

Snapshot di `reps_target` evita confusione se l'utente cambia `reps_per_form` mid-day.

`markPracticeDone` esistente: viene mantenuto come no-schedule fallback — se `reps_target IS NULL`, comportamento legacy (1 click = completed).

### 4.5 Calendar (`/sessions/calendar`)

Server Component. Header: "Dal 26 apr al 25 lug · 36 sessioni totali · ogni Lun/Mer/Ven · ripasso ogni 2 sett." + bottone "Modifica sessioni" → `/sessions/setup`.

Body: lista verticale per mese (`LUGLIO 2026` heading sticky), riga per giorno:
- Training day: `Mer 8 — 5 forme` (tap → drill-down sheet con elenco forme read-only).
- Riposo: `Mar 7 — riposo` (testo muto, niente tap).

Niente paging: tutta la finestra `[start_date..end_date]` in una pagina. ~90-180 righe max, va bene.

### 4.6 Navigazione

- **Profilo** — sezione "Allenamento": link "Modifica sessioni" e "Calendario sessioni".
- **Today header** — icona calendario accanto a "Modifica piano" → `/sessions/calendar`.
- **BottomNav** — invariata (4 tab: Oggi / Programma / Progresso / Profilo). Niente quinta tab.

## 5. File toccati

### Nuovi

```
supabase/migrations/0012_training_schedule.sql

src/lib/session-scheduler.ts                       # logica pura
src/lib/queries/training-schedule.ts
src/lib/actions/training-schedule.ts

src/app/(app)/sessions/setup/page.tsx
src/app/(app)/sessions/calendar/page.tsx

src/components/sessions/SetupForm.tsx              # client, useActionState
src/components/sessions/WeekdayChips.tsx
src/components/sessions/DurationPicker.tsx
src/components/sessions/CadencePicker.tsx
src/components/sessions/RepsStepper.tsx
src/components/sessions/SessionPreview.tsx
src/components/sessions/CalendarMonth.tsx
src/components/sessions/SessionDetailSheet.tsx

src/components/today/RestDayCard.tsx
src/components/today/RepsCounter.tsx
```

### Modificati

```
src/lib/types.ts                                   # +TrainingSchedule, +reps_* su PracticeLog
src/lib/actions/practice.ts                        # +incrementRep, +decrementRep

src/app/(app)/today/page.tsx                       # branca empty/rest/training, passa reps_*
src/app/(app)/profile/page.tsx                     # link Allenamento

src/components/today/TodayEmptyState.tsx           # 3 stati (no_schedule/expired/no_plan)
src/components/today/TodaySkillCard.tsx            # integra RepsCounter
```

## 6. Ordine di esecuzione

| # | Step | Verifica |
|---|------|----------|
| 1 | Migration `0012` + tipi TS | `supabase db reset` ok, `npm run build` ok |
| 2 | `session-scheduler.ts` + test (rest day, training day, ciclo, scaduta, no schedule) | Test verde |
| 3 | Query + action setup | Build ok |
| 4 | `/sessions/setup` + componenti form | Setup manuale → riga in DB |
| 5 | Empty state aggiornato + Today branca | Today per data X mostra forme attese (no reps ancora) |
| 6 | Reps tracking (action + counter + integrazione card) | Tap +1 / annulla, card completed |
| 7 | `/sessions/calendar` + link profilo + Today header | Calendar 90+ giorni corretto |
| 8 | Polish + edge case (plan attivo cambiato dopo setup, schedule scaduta in mezzo, weekdays vuoti server-guard) | `npm run lint && npm run build` puliti |

Ogni step = 1 commit atomico.

## 7. Out of scope

- Materializzazione delle sessioni in DB (approccio 1 scelto).
- Editing per-sessione (sposta forme di mercoledì → venerdì).
- Notifiche / reminder.
- Cambio runtime di `getTodayPractice` legacy (resta come fallback se `training_schedule == null`).
- Dashboard di progresso sul completamento programma (l'attuale `/progress` resta invariato).

## 8. Aggiornamento al piano principale

A lavoro chiuso, su `plan/current-plan.md`:

- §4.2 — aggiungo `TrainingSchedule`, estendo `PracticeLog` con `reps_target`/`reps_done`.
- §5 — aggiungo route `/sessions/setup`, `/sessions/calendar`, cartella `components/sessions/`.
- §6 — nuovo §6.4 "Schedulazione sessioni" (linka questo doc).
- §7.2 — aggiorno wireframe Today (counter reps, RestDayCard).
- §9 — aggiungo Sprint 1.9 — Schedulazione sessioni.
