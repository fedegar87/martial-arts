---
data: 2026-05-10
stato: design approvato, pronto per piano implementativo
sostituisce: nessun documento (refinement della pagina /progress esistente)
---

# Redesign `/progress` — semplice e immediato

## Obiettivo

Rendere `/progress` immediatamente leggibile: aprendo la pagina si capisce in pochi secondi
**due cose, due livelli**:

1. Come sta andando il **ciclo di allenamento attivo** (aderenza al piano corrente)
2. Quanto si è praticato **in generale, dall'inizio dell'utilizzo dell'app** (abitudine)

Niente overinfo, niente metriche miste, niente curriculum/copertura esame in pagina.

## Principio guida

Due definizioni distinte di "pratica", non confonderle mai:

- **Aderenza al ciclo** = giorno completato al **100%** degli esercizi previsti per quel giorno.
  Misura quanto rispetto il piano.
- **Pratica generale di kung fu** = giorno con **almeno un esercizio praticato**
  (`completed = true` OR `reps_done > 0`). Misura l'abitudine, copre anche la pratica
  libera fuori piano (es. faccio una sola forma).

La regola è già canonizzata in `progress-logic.ts` come `isPracticeActivityLog`.

## Layout pagina

Al massimo 3 blocchi, in quest'ordine:

1. **Ciclo allenamento attivo** — solo se esiste una `training_schedule` attiva
2. **Storico generale** — sempre visibile
3. **Calendario pratica** — sempre visibile

Header invariato: titolo "Progresso" + bottone "Apri calendario".

Sparisce: riflessione settimanale, mappa curriculum, copertura esame/piano per disciplina,
tabs shaolin/taichi.

## Sezione 1 — Ciclo allenamento attivo

Visibile solo con ciclo attivo. Due metriche, niente altro:

- **Fino a oggi: X / Y** — sessioni rispettate al 100% sul totale di sessioni previste
  fino alla data odierna inclusa
- **Totale ciclo: X / Z** — sessioni rispettate al 100% sul totale di sessioni dell'intero ciclo

A destra dell'header, solo `periodLabel` (es. "1–28 mag 2026") come riferimento temporale.

**Definizione "rispettata"**: tutti gli esercizi previsti per quel giorno hanno `completed = true`.
Niente parziali, niente ambiguità.

**Sparisce rispetto a oggi**: aderenza %, parziali, saltate, giorni rimasti, prossima data,
barra esercizi/reps.

## Sezione 2 — Storico generale

Sempre visibile. Due metriche, niente altro:

- **Giorni di pratica** — totale giorni distinti con almeno un esercizio praticato,
  da quando l'utente si è loggato
- **Streak attuale** — giorni consecutivi di pratica fino a oggi (o fino a ieri se oggi
  non c'è ancora attività)

Sotto, una sola riga di nota:
> Conta qualsiasi pratica registrata, anche fuori dal ciclo.

**Sparisce rispetto a oggi**: record streak, giorni 30gg, contenuti praticati 30gg/totali,
ripetizioni forme totali, nota esplicativa lunga.

## Sezione 3 — Calendario pratica

Visualizzazione **binaria** (praticato sì / no), non più gradiente di intensità.

- Griglia settimanale lun-dom, ultimi 90 giorni
- Cella piena → giorno di pratica
- Cella vuota → giorno senza pratica
- Tooltip: data + "praticato" / "non praticato"
- Sotto: una riga, es. "42 giorni con pratica negli ultimi 90."

**Stessa definizione di "giorno di pratica" della sezione storico** (`completed || reps_done > 0`).
Coerenza fondamentale: se streak = 5, vedo 5 celle piene consecutive.

**Sparisce**: 4 livelli di intensità, conteggio "contenuti praticati per giorno", legenda 4 swatch.

## Logica (`progress-logic.ts`)

**Mantenere**:
- `isPracticeActivityLog` — definizione canonica
- `countPracticeDays`
- `computeCurrentStreakFromLogs`

**Rimuovere**:
- `computeBestStreakFromLogs`
- `countPracticedSkills`
- `computePlanProgress`
- `buildCurriculumCells`

**Aggiungere**:
- `countCompletedSessionsInRange(rows, fromDate, toDate)` — conta giorni con tutti
  gli esercizi al 100% in un range. Usata due volte per il ciclo: con `toDate = today`
  e con `toDate = endOfCycle`.

## Query (`queries/progress.ts`)

`getProgressData` restituisce:

```ts
{
  generalProgress: {
    practicedDaysTotal: number;
    currentStreak: number;
    calendar: PracticeDay[];   // 90gg, ogni day = {date, practiced: boolean}
  };
  activeCycleProgress: {
    periodLabel: string;
    respectedUntilToday: number;
    dueUntilToday: number;
    respectedTotal: number;
    sessionTotal: number;
  } | null;
}
```

Spariscono: `skills`, `planBySkillId`, `planProgressByDiscipline`. Le query Supabase
collegate (curriculum + plan items) non vengono più eseguite — pagina più veloce.

## Tipo `PracticeDay`

Da `{ date: string; count: number }` a `{ date: string; practiced: boolean }`.

## Componenti

- `GeneralProgressSummary` — semplificato a 2 metriche + nota
- `ActiveCycleProgress` — semplificato a 2 metriche + periodLabel
- `PracticeCalendar` — binario, niente legenda intensità
- **Eliminati** se non usati altrove: `ProgressDisciplineSections`, `CurriculumMap`,
  `PlanProgress`, `WeeklyReflectionCard` (verifica con grep prima di cancellare)

## Test

In `progress-logic.test.ts`:
- Mantenere test su `countPracticeDays` e streak (regola "completed OR reps_done > 0")
- Aggiungere test su `countCompletedSessionsInRange` (un esercizio non completato → giorno
  non conta; tutti completati → giorno conta; range che esclude/include oggi)
- Rimuovere test sulle funzioni eliminate

## Cosa NON tocchiamo

- Schema DB: nessuna migration
- Routing: nessun cambio
- Altre pagine (`/today`, `/calendar`, `/library`): zero impatto
- `WeeklyReflectionCard` e `getCurrentWeekReflection`/`shouldPromptWeeklyReflection`:
  rimosse solo se usate unicamente da `/progress`. Decisione in fase di esecuzione.

## Domande aperte risolte (riferimento conversazione di brainstorming)

1. ✅ Conteggio `reps_done > 0` come pratica generale → **sì**, è la definizione di `isPracticeActivityLog`
2. ✅ Note senza completamento o reps come pratica → **no**
3. ✅ Streak generale ignora allenamenti programmati saltati → **sì**, lo streak generale
   usa la regola "almeno un esercizio praticato", indipendente dal piano
4. ✅ Card "Copertura esame" → **eliminata** dalla pagina
5. ✅ Mappa curriculum → **eliminata** dalla pagina
6. ✅ Calendario pratica → **binario**, non più contribution graph

## Stato attuale del working tree (contesto)

Nel working tree esistono modifiche UI parziali su:
- `components/progress/CurriculumMap.tsx`
- `components/progress/GeneralProgressSummary.tsx`
- `components/progress/PracticeCalendar.tsx`

Queste modifiche andavano nella direzione di ritocchi label/legenda; con questo
redesign vengono **superate**. Le modifiche locali su `CurriculumMap.tsx` non
servono più (componente eliminato). Quelle su `GeneralProgressSummary.tsx` e
`PracticeCalendar.tsx` saranno rimpiazzate dalle versioni semplificate.
