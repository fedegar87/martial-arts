# Calendar Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unificare `/journal` e `/sessions/calendar` in un'unica pagina canonica `/calendar`, semplificare il dominio "journal → calendar" nel codice, ridurre i punti di accesso da `/today`.

**Architecture:** Refactor incrementale in 8 fasi. Ogni task = un commit. Si parte rimuovendo elementi UI dal calendario esistente, si stacca `SessionPeriodSummary`, si elimina la rotta `/sessions/calendar` e il codice morto, si semplifica `JournalCalendar` (via prop `mode`), si rinominano i file/identifiers per modulo logico, si rinomina la route, si aggiornano config e documentazione. Build/lint/test verdi dopo ogni commit.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase. Nessuna nuova dipendenza.

**Design doc:** `plan/completed/2026-05-10-calendar-unification-design.md`

**Baseline:** `npm test` = 77 test passano (verificato dall'utente).

---

## FASE 1 — Pulizie UI minori

### Task 1: Rimuovere bottone "Apri diario" da TodayShell

**Files:**
- Modify: `skill-practice/src/app/(app)/today/page.tsx:195-200`

**Step 1: Modifica**

Nel file `today/page.tsx`, dentro la funzione `TodayShell`, rimuovere l'intero blocco `<Button asChild variant="outline" size="sm">…<Link href="/journal">…Apri diario…</Link>…</Button>` (linee 195-200). Rimuovere anche gli import non più usati: `Link` solo se non usato altrove nel file (verificare), e `CalendarDays` da `lucide-react` solo se non usato altrove.

**Step 2: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
```

Atteso: nessun errore. Aprire `/today` in browser: il bottone "Apri diario" in fondo non c'è più; lo sticky header in alto resta invariato.

**Step 3: Commit**

```bash
git add skill-practice/src/app/(app)/today/page.tsx
git commit -m "ux(today): rimuove bottone 'Apri diario' (resta accesso da sticky header)"
```

---

### Task 2: Rimuovere bottone "Solo sessioni" da header /journal

**Files:**
- Modify: `skill-practice/src/app/(app)/journal/page.tsx:50-63`

**Step 1: Modifica**

Nel file `journal/page.tsx`, sostituire il blocco header attuale:

```tsx
<header className="space-y-2">
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold">Diario</h1>
      <p className="text-muted-foreground text-sm">
        Sessioni programmate e pratica libera.
      </p>
    </div>
    <Button asChild variant="outline">
      <Link href="/sessions/calendar?view=week">
        <CalendarDays className="mr-2 h-3.5 w-3.5" />
        Solo sessioni
      </Link>
    </Button>
  </div>
</header>
```

con:

```tsx
<header className="space-y-2">
  <h1 className="text-2xl font-semibold">Diario</h1>
  <p className="text-muted-foreground text-sm">
    Sessioni programmate e pratica libera.
  </p>
</header>
```

Rimuovere import `Link`, `CalendarDays`, `Button` se non più usati nel file.

**Step 2: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
```

**Step 3: Commit**

```bash
git add skill-practice/src/app/(app)/journal/page.tsx
git commit -m "ux(journal): rimuove bottone 'Solo sessioni' dall'header"
```

---

### Task 3: Rimuovere sottotitolo "X sessioni nel periodo" dalla toolbar

**Files:**
- Modify: `skill-practice/src/components/journal/JournalCalendar.tsx:104-113`

**Step 1: Modifica**

Nel file `JournalCalendar.tsx`, sostituire dentro `CalendarToolbar`:

```tsx
<div>
  <h2 className="text-lg font-semibold capitalize">{periodLabel}</h2>
  <p className="text-muted-foreground text-sm">
    {totalSessions} {totalSessions === 1 ? "sessione" : "sessioni"} nel
    periodo
  </p>
</div>
```

con:

```tsx
<div>
  <h2 className="text-lg font-semibold capitalize">{periodLabel}</h2>
</div>
```

Rimuovere il prop `totalSessions` da `CalendarToolbar` (sia dal tipo che dal sito di chiamata in `JournalCalendar`). Rimuovere il prop `totalSessions` anche dal tipo `Props` di `JournalCalendar`. Aggiornare i due call site (`journal/page.tsx` e `sessions/calendar/page.tsx`) rimuovendo il prop `totalSessions={…}`. Rimuovere anche le funzioni helper `countTrainingSessions` da entrambi i page se non più usate.

**Step 2: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
```

**Step 3: Commit**

```bash
git add skill-practice/src/components/journal/JournalCalendar.tsx skill-practice/src/app/(app)/journal/page.tsx skill-practice/src/app/(app)/sessions/calendar/page.tsx
git commit -m "ux(calendar): rimuove conteggio 'X sessioni nel periodo' (era fuorviante per pratica libera)"
```

---

## FASE 2 — Stacco SessionPeriodSummary da JournalCalendar

### Task 4: Rimuovere SessionPeriodSummary e prop correlati da JournalCalendar

**Files:**
- Modify: `skill-practice/src/components/journal/JournalCalendar.tsx`
- Modify: `skill-practice/src/app/(app)/sessions/calendar/page.tsx`
- Modify: `skill-practice/src/app/(app)/journal/page.tsx`

**Step 1: Modifica JournalCalendar**

Nel file `JournalCalendar.tsx`:

- Rimuovere import: `SessionPeriodSummary` e `SessionPeriodProgress`.
- Rimuovere dal tipo `Props`: `previousDisabled?`, `nextDisabled?`, `periodProgress?`.
- Rimuovere dalla destrutturazione di `JournalCalendar`: `previousDisabled = false`, `nextDisabled = false`, `periodProgress`.
- Rimuovere il blocco `{periodProgress && (<SessionPeriodSummary …/>)}`.
- Rimuovere dal call site interno di `CalendarToolbar` i prop `previousDisabled` e `nextDisabled`.
- Rimuovere dal tipo del componente `CalendarToolbar` i prop `previousDisabled` e `nextDisabled`.
- Sostituire l'uso di `previousDisabled`/`nextDisabled` dentro `PeriodButton` (props `disabled`) con `disabled={false}` rimuovendo del tutto il prop `disabled` dal tipo `PeriodButton` se non più usato. Verificare con grep che `PeriodButton` non usi più `disabled`.

**Step 2: Modifica sessions/calendar/page.tsx**

Rimuovere dal file `sessions/calendar/page.tsx`:

- Import: `buildSessionPeriodProgress`.
- Calcolo `periodProgress = buildSessionPeriodProgress(...)`.
- Calcolo `previousRange`, `nextRange` (non più usati).
- Prop passati a `JournalCalendar`: `periodProgress`, `previousDisabled`, `nextDisabled`.

**Step 3: Modifica journal/page.tsx**

Verificare che non passi prop `periodProgress`, `previousDisabled`, `nextDisabled` (probabilmente non lo fa già).

**Step 4: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
npm test
```

Atteso: tutto verde. La pagina `/sessions/calendar` mostrerà ancora il calendario ma senza la card "Riepilogo periodo".

**Step 5: Commit**

```bash
git add skill-practice/src/components/journal/JournalCalendar.tsx skill-practice/src/app/(app)/sessions/calendar/page.tsx skill-practice/src/app/(app)/journal/page.tsx
git commit -m "refactor(calendar): stacca SessionPeriodSummary e prop di clamp da JournalCalendar"
```

---

### Task 5: Eliminare SessionPeriodSummary, session-progress.ts e test correlati

**Files:**
- Delete: `skill-practice/src/components/sessions/SessionPeriodSummary.tsx`
- Delete: `skill-practice/src/lib/session-progress.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Verifica preliminare**

```bash
cd skill-practice
```

Usare grep per confermare che `SessionPeriodSummary` sia importato solo da `GeneratedPlanCalendar.tsx` (che è codice morto, eliminato in Task 7) e `session-progress` solo dal test e dal file `GeneratedPlanCalendar.tsx`. Atteso: nessun altro consumer.

**Step 2: Modifica session-scheduler.test.ts**

Rimuovere:

- Import alla linea 9: `import { buildSessionPeriodProgress } from "./session-progress.ts";`
- Test "buildSessionPeriodProgress summarizes planned sessions against logs" (linea 184, ~50 righe).
- Test "buildSessionPeriodProgress marks partial sessions from repetition progress" (linea 232, ~25 righe).

Verificare che non restino import o helper non più usati (`practiceLog` se usato altrove ok, altrimenti rimuovere).

**Step 3: Eliminare i file**

Rimuovere `src/components/sessions/SessionPeriodSummary.tsx` e `src/lib/session-progress.ts`.

**Step 4: Verifica**

```bash
npm run lint
npm run build
npm test
```

Atteso: build OK. Conteggio test atteso: 75 (era 77, rimossi 2).

**Step 5: Commit**

```bash
git add -A skill-practice/src/components/sessions/SessionPeriodSummary.tsx skill-practice/src/lib/session-progress.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "chore: rimuove SessionPeriodSummary, session-progress.ts e test correlati (codice morto)"
```

---

## FASE 3 — Eliminazione /sessions/calendar e codice morto

### Task 6: Aggiornare i link verso /sessions/calendar a /journal (transient)

**Files:**
- Modify: `skill-practice/src/components/today/TodaySessionHeader.tsx:42`
- Modify: `skill-practice/src/app/(app)/profile/page.tsx:114-117`
- Modify: `skill-practice/src/lib/actions/training-schedule.ts:73,92`
- Modify: `skill-practice/src/lib/actions/journal.ts:281`

**Step 1: TodaySessionHeader**

Cambiare `href="/sessions/calendar"` → `href="/journal"`. Etichetta resta "Calendario".

**Step 2: profile/page.tsx**

Cambiare `<Link href="/sessions/calendar">…Calendario sessioni…</Link>` → `<Link href="/journal">…Calendario…</Link>`. Etichetta diventa "Calendario".

**Step 3: training-schedule.ts**

Sostituire entrambe le occorrenze di `revalidatePath("/sessions/calendar")` con `revalidatePath("/journal")`.

**Step 4: journal.ts (actions)**

Nel `revalidateJournalPaths`, rimuovere completamente la riga `if (isInScheduleRange) revalidatePath("/sessions/calendar");`. Rimuovere il parametro `isInScheduleRange` dalla signature della funzione e dai siti di chiamata se non più usato (verificare con grep).

**Step 5: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add skill-practice/src/components/today/TodaySessionHeader.tsx skill-practice/src/app/(app)/profile/page.tsx skill-practice/src/lib/actions/training-schedule.ts skill-practice/src/lib/actions/journal.ts
git commit -m "refactor(routing): tutti i link a /sessions/calendar puntano a /journal"
```

---

### Task 7: Eliminare cartella /sessions/calendar e codice morto

**Files:**
- Delete: `skill-practice/src/app/(app)/sessions/calendar/` (intera cartella)
- Delete: `skill-practice/src/components/sessions/GeneratedPlanCalendar.tsx`
- Delete: `skill-practice/src/components/sessions/CalendarMonth.tsx`

**Step 1: Verifica preliminare**

```bash
cd skill-practice
```

Confermare con grep che `GeneratedPlanCalendar` e `CalendarMonth` non sono importati da nessun file (devono comparire solo nelle loro definizioni).

**Step 2: Eliminare**

Rimuovere `src/app/(app)/sessions/calendar/` (la cartella e tutti i file dentro), `src/components/sessions/GeneratedPlanCalendar.tsx`, `src/components/sessions/CalendarMonth.tsx`.

**Step 3: Verifica**

```bash
npm run lint
npm run build
npm test
```

Atteso: tutto verde. Aprire in browser `/sessions/calendar` → 404.

**Step 4: Commit**

```bash
git add -A skill-practice/src/app/\(app\)/sessions/calendar skill-practice/src/components/sessions/GeneratedPlanCalendar.tsx skill-practice/src/components/sessions/CalendarMonth.tsx
git commit -m "chore: elimina rotta /sessions/calendar e componenti calendario non usati"
```

---

## FASE 4 — Semplificazione JournalCalendar (rimozione prop mode)

### Task 8: Rimuovere prop mode da JournalCalendar e dipendenti

**Files:**
- Modify: `skill-practice/src/components/journal/JournalCalendar.tsx`
- Modify: `skill-practice/src/components/journal/JournalDayPanel.tsx`
- Modify: `skill-practice/src/app/(app)/journal/page.tsx`
- Modify: `skill-practice/src/lib/types.ts:142`

**Step 1: JournalCalendar.tsx**

- Rimuovere import `JournalMode` dai tipi.
- Rimuovere `mode: JournalMode` dal tipo `Props` di `JournalCalendar`.
- Rimuovere dalla destrutturazione e dal sito di passaggio a `CalendarToolbar`, `WeekCalendar`, `MonthCalendar`, `JournalDayPanel`.
- Rimuovere `mode` dai tipi e dalla destrutturazione di `CalendarToolbar`, `PeriodButton`, `WeekCalendar`, `MonthCalendar`, `WeekDayCell`, `MonthDayCell` (e qualunque altro componente interno che lo riceva).
- Nella funzione `calendarHref` (linea 412), rimuovere il parametro `mode` e fissare `base = "/journal"`. Aggiornare tutti i call site.

**Step 2: JournalDayPanel.tsx**

- Rimuovere import `JournalMode`.
- Rimuovere `mode: JournalMode` dal tipo `Props`.
- Rimuovere `mode` dalla destrutturazione.
- Verificare se `mode` è usato dentro il componente per rendering condizionale. Se sì, mantenere il comportamento come se fosse sempre `"all"` (rimuovendo i rami `mode === "session"`).

**Step 3: journal/page.tsx**

Rimuovere il prop `mode="all"` dal `<JournalCalendar />`.

**Step 4: types.ts**

Rimuovere completamente la linea `export type JournalMode = "all" | "session";`.

**Step 5: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add skill-practice/src/components/journal/JournalCalendar.tsx skill-practice/src/components/journal/JournalDayPanel.tsx skill-practice/src/app/\(app\)/journal/page.tsx skill-practice/src/lib/types.ts
git commit -m "refactor(calendar): rimuove prop 'mode' da JournalCalendar (una sola modalità)"
```

---

## FASE 5 — Rinomina codice (commit per modulo logico)

### Task 9: Rinominare journal-logic → calendar-logic

**Files:**
- Rename: `skill-practice/src/lib/journal-logic.ts` → `skill-practice/src/lib/calendar-logic.ts`
- Rename: `skill-practice/src/lib/journal-logic.test.ts` → `skill-practice/src/lib/calendar-logic.test.ts`
- Modify: import path in `skill-practice/src/lib/queries/journal.ts`
- Modify: import path nel test stesso

**Step 1: Rinomina file**

```bash
cd skill-practice
git mv src/lib/journal-logic.ts src/lib/calendar-logic.ts
git mv src/lib/journal-logic.test.ts src/lib/calendar-logic.test.ts
```

**Step 2: Rinominare identifiers nei file rinominati**

In `src/lib/calendar-logic.ts`:
- `buildJournalDayView` → `buildCalendarDayView`
- `buildJournalDayViewsInRange` → `buildCalendarDayViewsInRange`
- `BuildJournalDayViewInput` → `BuildCalendarDayViewInput`
- `BuildJournalDayViewsInRangeInput` → `BuildCalendarDayViewsInRangeInput`
- Tipo `JournalDayView` resta per ora (sarà rinominato in Task 13). Stesso per `JournalSkill`.

In `src/lib/calendar-logic.test.ts`:
- Aggiornare import `from "./journal-logic.ts"` → `from "./calendar-logic.ts"`
- Aggiornare nomi di funzione: `buildJournalDayView` → `buildCalendarDayView`, `buildJournalDayViewsInRange` → `buildCalendarDayViewsInRange`
- Aggiornare nomi dei test (`buildJournalDayView` → `buildCalendarDayView`, ecc.)

**Step 3: Aggiornare consumer**

In `src/lib/queries/journal.ts`:
- Cambiare import: `from "@/lib/journal-logic"` → `from "@/lib/calendar-logic"`
- `buildJournalDayViewsInRange` → `buildCalendarDayViewsInRange`

**Step 4: Aggiornare package.json**

```json
"test": "node ... src/lib/journal-logic.test.ts ..."
```

→ sostituire con `src/lib/calendar-logic.test.ts`.

**Step 5: Verifica**

```bash
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(calendar): rinomina journal-logic in calendar-logic"
```

---

### Task 10: Rinominare lib/queries/journal → lib/queries/calendar

**Files:**
- Rename: `skill-practice/src/lib/queries/journal.ts` → `skill-practice/src/lib/queries/calendar.ts`
- Modify: tutti i consumer

**Step 1: Trovare consumer**

```bash
cd skill-practice
```

Usare grep per cercare `from "@/lib/queries/journal"` in tutto `src/`. Atteso almeno: `src/app/(app)/journal/page.tsx`, `src/app/(app)/sessions/calendar/page.tsx` (già eliminato).

**Step 2: Rinomina file**

```bash
git mv src/lib/queries/journal.ts src/lib/queries/calendar.ts
```

**Step 3: Rinominare identifiers**

Nel file rinominato `src/lib/queries/calendar.ts`:
- `getJournalDataInRange` → `getCalendarDataInRange`
- `getJournalSkillOptions` → `getCalendarSkillOptions`
- `toJournalSkill` → `toCalendarSkill`
- I tipi `JournalDayView`, `JournalSkill` restano (cambieranno in Task 13).

**Step 4: Aggiornare consumer**

In `src/app/(app)/journal/page.tsx`:
- Import path: `from "@/lib/queries/journal"` → `from "@/lib/queries/calendar"`
- `getJournalDataInRange` → `getCalendarDataInRange`
- `getJournalSkillOptions` → `getCalendarSkillOptions`

**Step 5: Verifica**

```bash
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(calendar): rinomina lib/queries/journal in lib/queries/calendar"
```

---

### Task 11: Rinominare lib/actions/journal → lib/actions/calendar

**Files:**
- Rename: `skill-practice/src/lib/actions/journal.ts` → `skill-practice/src/lib/actions/calendar.ts`
- Modify: tutti i consumer

**Step 1: Trovare consumer**

Usare grep per cercare `from "@/lib/actions/journal"` in `src/`.

**Step 2: Rinomina file**

```bash
cd skill-practice
git mv src/lib/actions/journal.ts src/lib/actions/calendar.ts
```

**Step 3: Rinominare funzione interna `revalidateJournalPaths`**

Nel file rinominato, `revalidateJournalPaths` → `revalidateCalendarPaths`. Aggiornare tutti i call site nel medesimo file.

**Step 4: Aggiornare consumer**

In `src/components/journal/AddFreePracticeSheet.tsx`:
- Cambiare `from "@/lib/actions/journal"` → `from "@/lib/actions/calendar"`

In `src/components/journal/PracticeCompletionToggle.tsx`:
- Cambiare `from "@/lib/actions/journal"` → `from "@/lib/actions/calendar"`

**Step 5: Verifica**

```bash
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(calendar): rinomina lib/actions/journal in lib/actions/calendar"
```

---

### Task 12: Rinominare cartella components/journal → components/calendar e identifiers componenti

**Files:**
- Rename: cartella `skill-practice/src/components/journal/` → `skill-practice/src/components/calendar/`
- Rename file dentro la cartella:
  - `JournalCalendar.tsx` → `Calendar.tsx`
  - `JournalDayPanel.tsx` → `CalendarDayPanel.tsx`
  - `AddFreePracticeSheet.tsx` (resta stesso nome)
  - `PracticeCompletionToggle.tsx` (resta stesso nome)
- Modify: tutti i consumer

**Step 1: Trovare consumer**

```bash
cd skill-practice
```

Grep `from "@/components/journal/`. Atteso: `journal/page.tsx`, e tra i componenti stessi (cross-import).

**Step 2: Spostare file**

```bash
git mv src/components/journal src/components/calendar
git mv src/components/calendar/JournalCalendar.tsx src/components/calendar/Calendar.tsx
git mv src/components/calendar/JournalDayPanel.tsx src/components/calendar/CalendarDayPanel.tsx
```

**Step 3: Rinominare identifiers**

In `src/components/calendar/Calendar.tsx`:
- `export function JournalCalendar` → `export function Calendar`
- Aggiornare import `JournalDayPanel` → `CalendarDayPanel` (path: `@/components/calendar/CalendarDayPanel`)

In `src/components/calendar/CalendarDayPanel.tsx`:
- `export function JournalDayPanel` → `export function CalendarDayPanel`
- Aggiornare import path interni: `@/components/journal/AddFreePracticeSheet` → `@/components/calendar/AddFreePracticeSheet`, idem `PracticeCompletionToggle`.

In `src/components/calendar/AddFreePracticeSheet.tsx`:
- (Solo se contiene import da `@/components/journal/...`) aggiornare i path.

In `src/components/calendar/PracticeCompletionToggle.tsx`:
- Stesso check.

**Step 4: Aggiornare consumer esterni**

In `src/app/(app)/journal/page.tsx`:
- Cambiare import `from "@/components/journal/JournalCalendar"` → `from "@/components/calendar/Calendar"`
- Cambiare riferimento al componente `JournalCalendar` → `Calendar`

**Step 5: Verifica**

```bash
npm run lint
npm run build
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(calendar): rinomina components/journal in components/calendar e identifiers"
```

---

### Task 13: Rinominare tipi JournalDayView/JournalSkill → CalendarDayView/CalendarSkill

**Files:**
- Modify: `skill-practice/src/lib/types.ts`
- Modify: tutti i consumer dei tipi

**Step 1: types.ts**

In `src/lib/types.ts`:
- `export type JournalDayView` → `export type CalendarDayView`
- `export type JournalSkill` → `export type CalendarSkill`
- Aggiornare riferimenti interni allo stesso file (i campi `skill: JournalSkill` dentro altri tipi).

**Step 2: Aggiornare consumer**

Usare grep `JournalDayView\|JournalSkill` su tutto `src/` e sostituire ogni occorrenza con `CalendarDayView`/`CalendarSkill`. File coinvolti attesi:
- `src/lib/calendar-logic.ts`
- `src/lib/calendar-logic.test.ts`
- `src/lib/queries/calendar.ts`
- `src/components/calendar/Calendar.tsx`
- `src/components/calendar/CalendarDayPanel.tsx`
- `src/components/calendar/AddFreePracticeSheet.tsx`

Rinominare anche `toJournalSkill` (in `lib/queries/calendar.ts`, già fatto in Task 10 ma confermare).

**Step 3: Verifica**

```bash
cd skill-practice
npm run lint
npm run build
npm test
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor(calendar): rinomina tipi JournalDayView/JournalSkill in CalendarDayView/CalendarSkill"
```

---

## FASE 6 — Rinomina route /journal → /calendar

### Task 14: Rinominare route /journal → /calendar e aggiornare tutti i link

**Files:**
- Rename: `skill-practice/src/app/(app)/journal/page.tsx` → `skill-practice/src/app/(app)/calendar/page.tsx`
- Modify: link in `today`, `progress`, `profile`, `TodaySessionHeader`
- Modify: revalidatePath in `lib/actions/calendar.ts` e `lib/actions/training-schedule.ts`
- Modify: titolo H1 della pagina ("Diario" → "Calendario")
- Modify: `calendarHref` in `Calendar.tsx`

**Step 1: Spostare la route**

```bash
cd skill-practice
mkdir -p src/app/\(app\)/calendar
git mv src/app/\(app\)/journal/page.tsx src/app/\(app\)/calendar/page.tsx
rmdir src/app/\(app\)/journal
```

**Step 2: Aggiornare il titolo H1**

In `src/app/(app)/calendar/page.tsx`:
- `<h1 className="text-2xl font-semibold">Diario</h1>` → `<h1 className="text-2xl font-semibold">Calendario</h1>`
- (sottotitolo "Sessioni programmate e pratica libera" resta).

**Step 3: Aggiornare calendarHref interno**

In `src/components/calendar/Calendar.tsx`, funzione `calendarHref`:
- `const base = "/journal";` → `const base = "/calendar";`

**Step 4: Aggiornare link esterni**

| File | Cambio |
|---|---|
| `src/components/today/TodaySessionHeader.tsx:42` | `href="/journal"` → `href="/calendar"`. Etichetta "Calendario" invariata. |
| `src/app/(app)/profile/page.tsx` | `<Link href="/journal">` → `<Link href="/calendar">`. Etichetta "Calendario" invariata. |
| `src/app/(app)/progress/page.tsx:65-68` | `<Link href="/journal">…Apri diario…</Link>` → `<Link href="/calendar">…Apri calendario…</Link>`. |

**Step 5: Aggiornare revalidatePath**

| File | Cambio |
|---|---|
| `src/lib/actions/calendar.ts` | `revalidatePath("/journal")` → `revalidatePath("/calendar")`. |
| `src/lib/actions/training-schedule.ts` | Entrambe le occorrenze `revalidatePath("/journal")` → `revalidatePath("/calendar")`. |

**Step 6: Verifica**

```bash
npm run lint
npm run build
npm test
```

Smoke check manuale:
- `/calendar` carica e mostra il calendario.
- `/today` → bottone "Calendario" sticky in alto porta a `/calendar`.
- `/progress` → bottone "Apri calendario" porta a `/calendar`.
- `/profile` → bottone "Calendario" nella card Allenamento porta a `/calendar`.
- `/journal` → 404.
- `/sessions/calendar` → 404.

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor(routing): rinomina route /journal in /calendar e aggiorna tutti i link"
```

---

## FASE 7 — Documentazione

### Task 15: Aggiornare current-plan.md (D11, §4, §5)

**Files:**
- Modify: `plan/current-plan.md`

**Step 1: D11 (riga 60)**

Sostituire l'attuale entry D11:

```
| **D11** | Diario calendario | **`/journal` è la vista canonica di tracking/correzione.** Compone `practice_logs`, schedule e piano attivo in una DayView; `/sessions/calendar` resta vista filtrata sulle sessioni. `practice_logs` ha chiave logica unica `(user_id, skill_id, date)` e indice `(user_id, date)`. Design: `archive/2026-05-07-calendar-overhaul-design-superseded.md` |
```

con:

```
| **D11** | Calendario unificato | **`/calendar` è l'unica vista calendario dell'app.** Mostra sessioni programmate + pratica libera in una DayView, senza filtri. `/sessions/calendar` e `/journal` non esistono più (unificate il 2026-05-10). `practice_logs` ha chiave logica unica `(user_id, skill_id, date)` e indice `(user_id, date)`. Design: `plan/completed/2026-05-10-calendar-unification-design.md` |
```

**Step 2: §4 (rotte)**

Cercare in `current-plan.md` la sezione §4 (rotte applicazione). Per ogni occorrenza di `/journal` e `/sessions/calendar`, rimuoverle/sostituirle con `/calendar`. Mantenere `/sessions/setup` invariato.

**Step 3: §5 (struttura cartelle)**

Cercare riferimenti a `components/journal/`, `lib/queries/journal.ts`, `lib/actions/journal.ts`, `lib/journal-logic.ts`. Sostituire con i nuovi path: `components/calendar/`, `lib/queries/calendar.ts`, `lib/actions/calendar.ts`, `lib/calendar-logic.ts`.

**Step 4: Verifica**

Aprire il file e leggere le sezioni modificate per coerenza testuale.

**Step 5: Commit**

```bash
git add plan/current-plan.md
git commit -m "docs(plan): aggiorna D11 e §4/§5 con calendario unificato /calendar"
```

---

### Task 16: Marcare design 2026-05-07 come superseded

**Files:**
- Modify: `archive/2026-05-07-calendar-overhaul-design-superseded.md` (front-matter)

**Step 1: Aggiungere/aggiornare front-matter**

In testa al file `archive/2026-05-07-calendar-overhaul-design-superseded.md`, aggiungere o aggiornare il front-matter YAML:

```yaml
---
status: superseded
superseded_by: plan/completed/2026-05-10-calendar-unification-design.md
superseded_date: 2026-05-10
---
```

(Se il file ha già un front-matter, aggiungere solo i campi `status`, `superseded_by`, `superseded_date`. Lasciare invariato il resto del documento.)

**Step 2: Commit**

```bash
git add archive/2026-05-07-calendar-overhaul-design-superseded.md
git commit -m "docs(plan): marca 2026-05-07-calendar-overhaul-design come superseded"
```

---

## FASE 8 — Verifica finale

### Task 17: Verifica end-to-end

**Step 1: Lint, build, test**

```bash
cd skill-practice
npm run lint
npm run build
npm test
```

Atteso: tutto verde, 75 test passano (era 77 - 2 test rimossi su `buildSessionPeriodProgress`).

**Step 2: Smoke check manuale (dev server)**

```bash
npm run dev
```

Visitare a mano:
- [ ] `/today` → sticky header in alto ha "Calendario" che porta a `/calendar`. In fondo NON c'è più "Apri diario".
- [ ] `/calendar` → titolo "Calendario", sottotitolo "Sessioni programmate e pratica libera", calendario settimana/mese, pannello giorno con toggle completamento + aggiungi pratica libera. NESSUNA card "Riepilogo periodo", NESSUN bottone "Solo sessioni" o "Modifica sessioni" o "Diario completo", NESSUN sottotitolo "X sessioni nel periodo".
- [ ] `/progress` → "Apri calendario" porta a `/calendar`.
- [ ] `/profile` → "Calendario" nella card Allenamento porta a `/calendar`.
- [ ] `/journal` → 404.
- [ ] `/sessions/calendar` → 404.
- [ ] `/sessions/setup` → invariato e accessibile.
- [ ] Aggiungere pratica libera da `/calendar`: si salva, riappare al refresh, rivalida `/today` se è oggi.
- [ ] Toggle completamento da `/calendar`: funziona.

**Step 3: Cleanup**

Verificare con grep che non restino occorrenze residue (errori di rinomina): `Journal`, `journal`, `/sessions/calendar` in `src/`.

Per ogni risultato non ovvio (es. variabili interne, parole italiane), valutare. Risultati ammessi residui: nessuno.

**Step 4: Commit (se ci sono fix residui)**

Se step 3 ha rivelato qualche residuo, fare un commit di fix:

```bash
git commit -m "chore(calendar): cleanup occorrenze residue post-rinomina"
```

Altrimenti nessun commit.

---

## Riepilogo commit attesi

1. `ux(today): rimuove bottone 'Apri diario' (resta accesso da sticky header)`
2. `ux(journal): rimuove bottone 'Solo sessioni' dall'header`
3. `ux(calendar): rimuove conteggio 'X sessioni nel periodo' (era fuorviante per pratica libera)`
4. `refactor(calendar): stacca SessionPeriodSummary e prop di clamp da JournalCalendar`
5. `chore: rimuove SessionPeriodSummary, session-progress.ts e test correlati (codice morto)`
6. `refactor(routing): tutti i link a /sessions/calendar puntano a /journal`
7. `chore: elimina rotta /sessions/calendar e componenti calendario non usati`
8. `refactor(calendar): rimuove prop 'mode' da JournalCalendar (una sola modalità)`
9. `refactor(calendar): rinomina journal-logic in calendar-logic`
10. `refactor(calendar): rinomina lib/queries/journal in lib/queries/calendar`
11. `refactor(calendar): rinomina lib/actions/journal in lib/actions/calendar`
12. `refactor(calendar): rinomina components/journal in components/calendar e identifiers`
13. `refactor(calendar): rinomina tipi JournalDayView/JournalSkill in CalendarDayView/CalendarSkill`
14. `refactor(routing): rinomina route /journal in /calendar e aggiorna tutti i link`
15. `docs(plan): aggiorna D11 e §4/§5 con calendario unificato /calendar`
16. `docs(plan): marca 2026-05-07-calendar-overhaul-design come superseded`
17. (eventuale) `chore(calendar): cleanup occorrenze residue post-rinomina`
