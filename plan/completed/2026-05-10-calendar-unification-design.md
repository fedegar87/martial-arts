---
status: design
date: 2026-05-10
supersedes: archive/2026-05-07-calendar-overhaul-design-superseded.md (parziale: D11 viene rivisto)
related_decisions: D11 (current-plan.md)
---

# Calendar unification design

## 1. Obiettivo

Unificare le due pagine calendario attualmente esistenti (`/journal` e `/sessions/calendar`) in una sola pagina canonica `/calendar`, con etichetta "Calendario", che funge da calendario generale dell'app. Eliminare la duplicazione di accessi e di componenti, semplificare la navigazione da `/today`, e completare la rinomina del dominio `journal` in `calendar` nel codice.

## 2. Stato attuale (problema)

Esistono due pagine basate sullo stesso componente `JournalCalendar` con prop `mode` diverso:

- `/journal` (`mode="all"`): mostra sessioni programmate + pratica libera, nessun limite di periodo, permette aggiunta di pratica libera.
- `/sessions/calendar` (`mode="session"`): mostra solo sessioni programmate, periodo limitato a `start_date`/`end_date` dello schedule, espone `SessionPeriodSummary` (riepilogo periodo) e bottone editor sessioni.

Da `/today` si raggiungono entrambe (bottone "Calendario" sticky in alto → `/sessions/calendar`; bottone "Apri diario" in fondo → `/journal`). Anche `/progress`, `/profile` e altri componenti hanno link separati alle due pagine. Risultato: due punti d'ingresso visivamente equivalenti che portano a viste sovrapposte, rumore di vocabolario ("diario" vs "calendario"), `JournalCalendar` con condizionali interni `mode`-driven.

## 3. Decisioni di design

| # | Decisione |
|---|-----------|
| 1 | Una sola pagina canonica: `/calendar`, etichetta "Calendario". Elimina `/sessions/calendar`. |
| 2 | Accesso da `/today` da un solo punto: il bottone "Calendario" già presente nello sticky header (cambia solo l'href). Il bottone "Apri diario" in fondo al `TodayShell` è rimosso. |
| 3 | Rinomina completa del dominio: tutti i file `journal*` → `calendar*`, tipi `Journal*` → `Calendar*`, route `/journal` → `/calendar`. Il tipo `JournalMode` viene eliminato (non più necessario). |
| 4 | Da `/calendar` rimossi: filtro "Solo sessioni" nell'header, link a editor sessioni, `SessionPeriodSummary` ("Riepilogo periodo"). |
| 5 | Toolbar del calendario: rimossa la riga di sottotitolo "X sessioni nel periodo" (era fuorviante perché ignorava la pratica libera). Restano titolo periodo + nav prev/next. |
| 6 | Il prop `mode` di `JournalCalendar` (e di tutti i componenti figli) viene eliminato; il componente diventa una sola modalità. Anche `previousDisabled`/`nextDisabled` (clamp sul range schedule) vanno via. |
| 7 | I toggle di completamento e l'aggiunta di pratica libera nel pannello giorno restano: sono correzione/log retroattivo, coerenti con un calendario generale. |

## 4. Mappa file: prima → dopo

### Route

| Prima | Dopo |
|---|---|
| `src/app/(app)/journal/page.tsx` | `src/app/(app)/calendar/page.tsx` |
| `src/app/(app)/sessions/calendar/page.tsx` | **eliminato** (cartella `sessions/calendar/` rimossa) |
| `src/app/(app)/sessions/setup/page.tsx` | invariato |

### Componenti

| Prima | Dopo |
|---|---|
| `src/components/journal/JournalCalendar.tsx` | `src/components/calendar/Calendar.tsx` |
| `src/components/journal/JournalDayPanel.tsx` | `src/components/calendar/CalendarDayPanel.tsx` |
| `src/components/journal/AddFreePracticeSheet.tsx` | `src/components/calendar/AddFreePracticeSheet.tsx` |
| `src/components/journal/PracticeCompletionToggle.tsx` | `src/components/calendar/PracticeCompletionToggle.tsx` |

### Lib

| Prima | Dopo |
|---|---|
| `src/lib/queries/journal.ts` | `src/lib/queries/calendar.ts` |
| `src/lib/actions/journal.ts` | `src/lib/actions/calendar.ts` |
| `src/lib/journal-logic.ts` | `src/lib/calendar-logic.ts` |
| `src/lib/journal-logic.test.ts` | `src/lib/calendar-logic.test.ts` |

### Tipi (`src/lib/types.ts`)

| Prima | Dopo |
|---|---|
| `JournalDayView` | `CalendarDayView` |
| `JournalSkill` | `CalendarSkill` |
| `JournalMode` | **eliminato** |

## 5. Codice morto da eliminare

- `src/app/(app)/sessions/calendar/` (intera cartella).
- `src/components/sessions/SessionPeriodSummary.tsx` (usato solo da `/sessions/calendar`).
- `src/lib/session-progress.ts` (`buildSessionPeriodProgress`) e relativi test in `src/lib/session-scheduler.test.ts:184` (test "buildSessionPeriodProgress summarizes…" più import correlato).
- `src/components/sessions/GeneratedPlanCalendar.tsx` (mai importato).
- `src/components/sessions/CalendarMonth.tsx` (mai importato).

## 6. Aggiornamenti collegati

### Link

| File | Cambio |
|---|---|
| `src/components/today/TodaySessionHeader.tsx:42` | href `/sessions/calendar` → `/calendar`. Etichetta resta "Calendario". |
| `src/app/(app)/today/page.tsx:195-200` | Bottone "Apri diario" rimosso dal `TodayShell`. |
| `src/app/(app)/progress/page.tsx:64-69` | href `/journal` → `/calendar`. Etichetta "Apri diario" → "Apri calendario". |
| `src/app/(app)/profile/page.tsx:113-118` | href `/sessions/calendar` → `/calendar`. Etichetta "Calendario sessioni" → "Calendario". |

### Server actions / revalidate

| File | Cambio |
|---|---|
| `src/lib/actions/calendar.ts` (ex `journal.ts`):279-281 | `revalidatePath("/journal")` → `/calendar`. Rimuovere `revalidatePath("/sessions/calendar")`. |
| `src/lib/actions/training-schedule.ts:73,92` | `revalidatePath("/sessions/calendar")` → `/calendar`. |

### Build / test config

| File | Cambio |
|---|---|
| `package.json:10` | Sostituire `src/lib/journal-logic.test.ts` con `src/lib/calendar-logic.test.ts`. |

### Documentazione

| File | Cambio |
|---|---|
| `plan/current-plan.md` D11 (riga 60) | Riscrivere: ora la vista canonica è `/calendar`, `/sessions/calendar` non esiste più. Riferimento a questo design doc. |
| `plan/current-plan.md` §4 (rotte) | Sostituire `/journal` e `/sessions/calendar` con `/calendar`. |
| `plan/current-plan.md` §5 (struttura cartelle) | Aggiornare riferimenti a `components/journal/` → `components/calendar/`, `queries/journal.ts` → `queries/calendar.ts`, ecc. |
| `archive/2026-05-07-calendar-overhaul-design-superseded.md` | Marcare come superato (front-matter `superseded_by`). |

## 7. Pagina `/calendar` — struttura finale

```
<header>
  <h1>Calendario</h1>
  <p>Sessioni programmate e pratica libera.</p>
</header>

<Calendar
  view={"week"|"month"}
  selectedDate
  days={journalDataDays}
  periodLabel
  previousDate
  nextDate
  skillOptions
/>
```

Il componente `Calendar`:

- Toolbar: titolo periodo + nav prev/next (niente sottotitolo conteggio).
- Griglia week o month.
- `CalendarDayPanel` per il giorno selezionato:
  - lista sessioni programmate del giorno con toggle di completamento;
  - lista pratica libera registrata;
  - bottone "Aggiungi pratica libera" (`AddFreePracticeSheet`).

Nessuna `SessionPeriodSummary`, nessun bottone "Solo sessioni", nessun bottone editor sessioni.

## 8. Verifica

- `npm run lint` e `npm run build` passano.
- `npm test` passa (baseline pre-cambiamento: 77 test). Conteggio atteso post-cambiamento: 77 - N, dove N = numero di test relativi a `buildSessionPeriodProgress` rimossi da `session-scheduler.test.ts`.
- Smoke check manuale: da `/today` il bottone "Calendario" porta a `/calendar`; da `/progress` "Apri calendario" porta a `/calendar`; da `/profile` "Calendario" porta a `/calendar`. La vecchia URL `/journal` e `/sessions/calendar` restituisce 404 (nessun redirect, è progetto personale).

## 9. Fuori scope

- Nessuna modifica a `/sessions/setup` (resta accessibile dallo sticky header di `/today`).
- Nessuna modifica al modello dati (`practice_logs`, training-schedule, plan items).
- Nessun redirect 301 dalle vecchie URL: progetto personale, basta il break.
