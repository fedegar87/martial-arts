---
status: implemented
date: 2026-05-07
supersedes: nessuno (estende §6.4 e §7 di plan/current-plan.md)
related:
  - plan/2026-04-26-training-schedule-design.md
  - plan/2026-05-04-plan-status-simplification-design.md
---

# Calendario generale, segna-pratica retroattiva, vista forme della scuola, forme extra-curriculum

## Stato dei tre temi

Il documento copre tre richieste emerse il 2026-05-07. Solo il **Tema 1** è elaborato in dettaglio in questa revisione: ha implicazioni architetturali (nuova rotta, cambio del ruolo di `/sessions/calendar`, semantica nuova per i log di pratica). I **Temi 2 e 3** restano come placeholder, da elaborare in revisioni successive di questo stesso documento — vivono qui per garantire che il piano implementativo finale li veda insieme e non perda coerenza fra loro.

| Tema | Stato | Prossimo step |
|---|---|---|
| 1. Calendario generale + segna-pratica retroattiva | **Implementato** in §1 | Verificato con test/lint/build |
| 2. Pulizia della pagina forma `/skill/[id]` (vista "Scuola Chang") | Placeholder in §2 | Brainstorm dedicato |
| 3. Sezione "Altre forme" extra-curriculum | Placeholder in §3 | Brainstorm dedicato |

L'ordine di esecuzione consigliato è: 1 → 2 → 3. Il Tema 1 è prerequisito tecnico del Tema 2 (è la nuova home del segna-pratica retroattiva, quindi giustifica il togliere azioni dalla pagina forma).

---

## 1. Tema 1 — Calendario generale e segna-pratica retroattiva

### 1.1 Problema

Oggi tracciare la pratica passa da tre flussi disgiunti, con cinque limiti operativi:

1. **`/today`** — segna oggi con granularità fine: incrementa le ripetizioni fino a `reps_target`; quando `reps_done >= reps_target`, il log diventa `completed = true`.
2. **`/skill/[id]` "Registra pratica libera"** — registra una skill ad-hoc, ma solo per il giorno corrente e solo partendo dalla scheda della singola skill.
3. **`/sessions/calendar`** — visualizza le sessioni programmate giorno per giorno, ma non permette ancora di segnare o correggere nulla.

Limiti:

- **L1. Recupero retroattivo assente.** Se l'utente si dimentica di segnare ieri, o tre giorni fa, non esiste una UI per correggere. Le statistiche finiscono per misurare la disciplina nel segnare i dati, non solo la pratica reale.
- **L2. Calendario sessioni e diario pratica sono confusi.** `/sessions/calendar` oggi mostra cosa era previsto dal piano, non cosa è stato davvero fatto.
- **L3. Pratica libera invisibile a livello giornaliero.** I log fuori sessione esistono in `practice_logs`, ma non hanno una vista giorno/settimana/mese. Si ritrovano solo indirettamente nella pagina skill o nei numeri aggregati.
- **L4. Statistiche senza contesto.** `/progress` aggrega streak, readiness e conteggi, ma non permette di rispondere alla domanda pratica: "quel giorno cosa ho fatto davvero, fra sessione e extra?".
- **L5. Nessuna base per eventi futuri.** In futuro serviranno eventi di scuola/federazione (stage, esami, incontri). Se "calendario" resta sinonimo di "sessioni programmate", ogni evento non-allenamento verrà forzato in un modello sbagliato.

### 1.2 Decisione

Si introduce un **diario calendario generale** alla rotta `/journal` (label UI: **Diario**). `/journal` è la vista canonica per leggere e correggere cosa è successo in un giorno; non è però la "fonte unica di verità" in senso dati. La verità resta composta da:

- `practice_logs` per ciò che è stato praticato.
- `training_schedule` + piano attivo (`user_plan_items`) per ciò che era programmato.
- Eventuali future tabelle eventi per scuola/federazione.

`/journal` compone queste fonti in una DayView. `/sessions/calendar` diventa una **vista filtrata dello stesso modello**, centrata sulla sessione programmata.

Il segna-pratica retroattivo è binario:

- **Fatto** = `completed = true`; per righe di sessione anche `reps_done = reps_target`.
- **Non fatto** = `completed = false`; per righe di sessione anche `reps_done = 0`.
- Nessun contatore reps sui giorni passati: l'utente non vuole correggere "4 su 6", vuole dire "quella forma prevista l'ho completata / non l'ho completata".

Motivazione: la separazione fra `/today` e `/journal` mantiene puliti i due casi d'uso. `/today` resta il flusso operativo dell'allenamento corrente, con incrementi real-time. `/journal` diventa il luogo di audit e correzione, più rapido e meno rumoroso.

### 1.3 Scelte chiuse

| # | Decisione | Motivazione |
|---|---|---|
| 1A | **Niente segna-pratica su giorni futuri.** Toggle attivo solo per `date <= today`. | Pre-segnare domani crea dati falsi e rende più fragile il cambio idea. Le sessioni future si possono visualizzare, non completare. |
| 1B | **`/journal` è il diario generale; `/sessions/calendar` è una vista filtrata.** | Evita duplicazione UI e chiarisce il dominio: "piano" e "diario" sono concetti diversi. |
| 1C | **Niente conteggi nelle celle del calendario.** | La griglia resta leggibile. Il dettaglio completo vive nel pannello del giorno selezionato. |
| 1D | **Niente reps counter retroattivo.** | Per il recupero storico basta lo stato binario. Le ripetizioni restano granulari solo in `/today`. |
| 1E | **Nessuna colonna `source` su `practice_logs`.** | "Sessione" vs "pratica libera" si deduce confrontando log e sessione programmata del giorno. Una colonna `source` diventerebbe incoerente quando cambia lo schedule. |
| 1F | **Serve una migration minima su `practice_logs`.** | Il codice assume già una chiave logica `(user_id, skill_id, date)`, ma il DB non la impone. L'upsert del diario deve essere affidabile. |
| 1G | **`/journal` funziona anche fuori periodo schedule o senza schedule.** | La pratica libera non dipende dalla presenza di un piano. Il diario deve poter mostrare giorni precedenti, periodi senza sessioni e log extra. |
| 1H | **Il diario deve permettere di aggiungere pratica libera retroattiva.** | Se il Tema 2 pulirà la pagina skill, il log libero non può restare appeso solo a `/skill/[id]`. Il diario diventa la sede naturale per "ho fatto anche questa forma quel giorno". |

### 1.4 Invariante dati: un log per skill per giorno

Prima di implementare le server action del diario va aggiunta una migration, ad esempio `0021_practice_logs_unique.sql` se `0020` è già occupata, eseguita come unità transazionale:

```sql
BEGIN;

-- 1. Deduplicare eventuali righe esistenti per (user_id, skill_id, date).
-- 2. Aggiungere vincolo logico.
ALTER TABLE practice_logs
  ADD CONSTRAINT practice_logs_user_skill_date_key
  UNIQUE (user_id, skill_id, date);

-- 3. Mantenere efficiente la lettura del diario per range di date.
CREATE INDEX IF NOT EXISTS practice_logs_user_date_idx
  ON practice_logs (user_id, date);

COMMIT;
```

Prima del vincolo, la migration deve deduplicare eventuali righe già presenti per la stessa tripla `(user_id, skill_id, date)`. Strategia consigliata:

1. Scegliere come survivor la riga più recente (`created_at DESC`) o, se si preferisce conservare la cronologia più antica, la più vecchia. Per l'MVP è sufficiente la più recente.
2. Aggiornare il survivor con valori aggregati:
   - `completed = bool_or(completed)`;
   - `reps_done = max(reps_done)`;
   - `reps_target = primo valore non null`, preferibilmente quello della riga survivor se esiste;
   - `personal_note = ultima nota non vuota`, se presente.
3. Eliminare i duplicati.
4. Aggiungere il vincolo unique.

Motivazione tecnica:

- `incrementRep` e `decrementRep` usano già `.maybeSingle()` su `user_id + skill_id + date`; senza vincolo, due righe renderebbero il comportamento fragile.
- Le action del diario devono poter usare `upsert(..., { onConflict: "user_id,skill_id,date" })`; questo richiede la unique constraint come prerequisito.
- Una chiave logica esplicita riduce il rischio di "log fantasma" e rende più semplice costruire `DayView`.
- L'indice `(user_id, date)` è separato dal vincolo unique: le query `getPracticeLogsInDateRange` e `getJournalDataInRange` filtrano per utente + range data, non per `skill_id`, quindi hanno bisogno di un indice adatto a quel pattern.

La migration deve deduplicare e aggiungere constraint/index nello stesso file, dentro una transazione. La precedente ipotesi "nessuna migration" è scartata.

### 1.5 Modello concettuale

I tipi UI/dominio del diario vivono in `src/lib/types.ts`, insieme agli altri tipi condivisi dell'app. In particolare:

```ts
export type JournalMode = "all" | "session";
```

Per ogni `(user, date)` il diario costruisce una **JournalDayView**:

```ts
type JournalDayView = {
  date: string;                     // YYYY-MM-DD
  isFuture: boolean;
  hasSchedule: boolean;
  isInScheduleRange: boolean;
  scheduled: ScheduledPracticeItem[];
  freePractice: FreePracticeItem[];
  events: SchoolEvent[];            // [] in questo sprint
};

type ScheduledPracticeItem = {
  planItemId: string;
  skill: Skill;
  status: PlanStatus;               // focus | maintenance
  log: PracticeLog | null;
  done: boolean;                    // log?.completed === true
  repsDone: number;
  repsTarget: number;
  canToggle: boolean;               // !isFuture
};

type FreePracticeItem = {
  skill: Skill;
  log: PracticeLog;
  done: boolean;
  hasNote: boolean;
  canToggle: boolean;               // !isFuture
};
```

Funzioni pure in `src/lib/journal-logic.ts`:

- `buildJournalDayView(date, input): JournalDayView` — costruisce un giorno.
- `buildJournalDayViewsInRange(from, to, input): JournalDayView[]` — costruisce un range.
- `categorizeLogsForDay(...)` — separa log scheduled/free per un giorno.
- `isMeaningfulLog(log)` — decide se un log deve comparire nel diario.

```ts
function buildJournalDayView(date, input) {
  const scheduledSkillIds = new Set(scheduledItems.map((item) => item.skill.id));
  const { scheduledLogs, freePracticeLogs } = categorizeLogsForDay({
    scheduledSkillIds,
    logs: logsForDate.filter(isMeaningfulLog),
  });

  return {
    scheduled: scheduledItems.map((item) => ({
      ...item,
      log: scheduledLogs.get(item.skill.id) ?? null,
    })),
    freePractice: freePracticeLogs
      .map((log) => ({ log, skill: skillById.get(log.skill_id) })),
  };
}
```

Un log è "meaningful" se almeno una condizione è vera:

- `completed === true`;
- `reps_done > 0`;
- `personal_note` non è vuota.

Motivazione: quando un toggle viene spento, potremmo lasciare un log con `completed = false` e `reps_done = 0` per conservare una nota. Senza filtro, il diario mostrerebbe righe vuote come pratica libera non fatta. Le righe senza completamento, senza reps e senza nota vanno ignorate o eliminate.

Discriminante "sessione" vs "libera":

- Non è `reps_target`.
- Non è una futura colonna `source`.
- È solo: **la skill è nella sessione programmata di quel giorno secondo lo schedule corrente?**

Trade-off: se in futuro l'utente cambia schedule, un log passato può cambiare interpretazione visuale. Una skill prima programmata potrebbe apparire come pratica libera, o viceversa. Accettato per MVP single-user; lo storico immutabile richiederebbe `training_schedule_versions` o snapshot di sessione, fuori scope.

### 1.6 Architettura delle rotte

Stato attuale:

```txt
/today                 -> sessione di oggi
/sessions/setup        -> editor schedule
/sessions/calendar     -> calendario sessioni programmate
/progress              -> metriche aggregate
/skill/[id]            -> forma singola con azioni
```

Stato proposto:

```txt
/today                 -> sessione di oggi, con reps counter in tempo reale
/sessions/setup        -> editor schedule
/journal               -> diario generale: sessione + pratica libera + futuro eventi
/sessions/calendar     -> vista sessione del diario
/progress              -> metriche aggregate + ingresso al diario
/skill/[id]            -> scheda forma; da pulire nel Tema 2
```

`/journal`:

- Default: `date = today`, `view = week`.
- Usa `JournalCalendar` in `mode = "all"` (`JournalMode`).
- Non clampa la data dentro `training_schedule.start_date/end_date`.
- Se non esiste schedule, mostra comunque pratica libera ed eventuale stato vuoto.
- Se la data è fuori periodo schedule, mostra "Nessuna sessione programmata" ma non impedisce di vedere o aggiungere pratica libera per date `<= today`.

`/sessions/calendar`:

- Continua a essere raggiungibile dal flusso Programma/Setup.
- Può mantenere il clamp al periodo schedule, perché il suo scopo è vedere le sessioni programmate.
- Usa lo stesso componente base in `mode = "session"` (`JournalMode`).
- Mostra la pratica libera del giorno solo come informazione secondaria ("fuori sessione"), non come focus primario.

Motivazione: il diario deve essere più ampio del piano. Un giorno di pratica libera durante una pausa, prima dell'inizio del piano o dopo la scadenza non deve sparire solo perché non esiste una sessione programmata.

### 1.7 Navigazione

`BottomNav` resta invariata con 5 slot: Allenamento / Programma / Scuola / Progressi / Bacheca. Non si aggiunge un sesto tab.

Ingressi consigliati a `/journal`:

1. **Da `/progress`**: link prominente "Apri diario" sopra o vicino al calendario pratica recente. Motivazione: il diario è il dettaglio operativo dietro ai numeri.
2. **Da `/today`**: link compatto "Recupera giorni passati" o "Apri diario" sotto il riepilogo sessione. Motivazione: chi si accorge di non aver segnato ieri parte spesso da Allenamento.
3. **Da `/sessions/calendar`**: controllo "Vista: Solo sessioni / Diario completo"; "Diario completo" naviga a `/journal?view=...&date=...`.

Non aggiungere per ora una tile Hub dedicata. L'Hub ha già "Progressi"; finché il diario è uno strumento di consultazione/correzione e non un'area primaria autonoma, tenerlo sotto Progressi riduce rumore.

### 1.8 Pratica libera nel diario

`/journal` deve avere un'azione **Aggiungi pratica libera** per date `<= today`.

Comportamento:

1. L'utente seleziona un giorno nel diario.
2. Se `date > today`, l'azione non compare o è disabilitata.
3. Se `date <= today`, compare "Aggiungi pratica libera".
4. La UI apre un sheet/dialog con elenco skill filtrabile per disciplina/categoria e ricerca testuale.
5. Se la skill scelta è già nella sessione programmata di quel giorno, non si crea una pratica libera duplicata: la UI porta l'utente alla riga della sessione o attiva il suo toggle.
6. Se la skill scelta non è nella sessione, si crea/aggiorna un log libero con `completed = true`, `reps_target = null`, `reps_done = 0`.

Motivazione:

- La pratica libera è "ho praticato questa skill fuori dalla sessione", non "ho completato il target reps dello schedule".
- Non si inventa un numero reps arbitrario. La metrica "Rip. forme" che somma `reps_done` non viene gonfiata da pratica libera senza conteggio.
- Streak, calendario pratica e readiness usano `completed`, quindi il log libero contribuisce comunque alle statistiche di copertura.

Undo/cancellazione:

- Per una riga di pratica libera senza nota, spegnere il toggle può eliminare il log.
- Per una riga con nota, spegnere il toggle mantiene il log con `completed = false`, `reps_done = 0`, nota preservata. Il log non appare fra le pratiche libere completate, ma resta recuperabile se in futuro si aggiunge una vista note storiche.

Motivazione: evita righe vuote nel diario senza perdere eventuali annotazioni.

### 1.9 Server actions

Le action retroattive del diario vivono in `src/lib/actions/journal.ts`, non in `src/lib/actions/practice.ts`. `practice.ts` resta dedicato al flusso "oggi" (`markPracticeDone`, `incrementRep`, `decrementRep`, `savePracticeNote`). Separare i file evita che la logica retroattiva sporchi il flusso operativo di `/today`.

#### `setPracticeCompletionForDate(skillId, dateKey, completed)`

Preferire una action idempotente (`set...`) a una action puramente toggle. Il bottone in UI può comportarsi da toggle, ma la mutation riceve lo stato desiderato. Così un doppio click, una revalidation lenta o una UI stale non inverte accidentalmente il dato.

Logica:

```txt
1. Auth check.
2. Validare dateKey con formato YYYY-MM-DD e data reale.
3. Se dateKey > localDateKey() -> error: non puoi segnare giorni futuri.
4. Leggere training_schedule.reps_per_form; default 1 se assente.
5. Se completed = true:
   - upsert su (user_id, skill_id, date), con onConflict = "user_id,skill_id,date"
   - completed = true
   - reps_target = target
   - reps_done = target
6. Se completed = false:
   - se log non esiste: no-op
   - se log esiste: chiamare neutralizeOrDeleteLog(log)
7. Aggiornare user_plan_items.last_practiced_at solo quando completed = true.
8. Revalidate selettivo (vedi sotto).
```

Questa action è usata per righe della sessione programmata e per eventuali skill già trattate come scheduled nel DayView.

#### `addFreePracticeForDate(skillId, dateKey)`

Logica:

```txt
1. Auth check.
2. Validare dateKey; vietare date future.
3. Verificare se la skill è già nella sessione programmata del giorno.
4. Se è scheduled: chiamare/riusare setPracticeCompletionForDate(skillId, dateKey, true).
5. Se non è scheduled:
   - upsert su (user_id, skill_id, date), con onConflict = "user_id,skill_id,date"
   - completed = true
   - reps_target = null
   - reps_done = 0
6. Aggiornare user_plan_items.last_practiced_at se esiste una riga piano per quella skill.
7. Revalidate selettivo (vedi sotto).
```

Motivazione: separare l'azione "ho completato la forma prevista" dall'azione "ho fatto pratica extra" rende chiari i dati e impedisce che la pratica libera assuma per errore il target reps dello schedule.

Il branching scheduled-vs-free avviene **dentro l'action server**, non nel client. La UI può sempre chiamare `addFreePracticeForDate`; il server decide se trasformarla in completamento della riga scheduled o in log libero. Questo evita che una UI stale crei duplicati quando lo schedule è cambiato o la data selezionata è stata ricalcolata.

#### `removeFreePracticeForDate(skillId, dateKey)`

Necessaria se `/journal` permette di aggiungere pratica libera.

Logica:

```txt
1. Auth check e validazione dateKey.
2. Trovare il log.
3. Se non esiste: no-op.
4. Chiamare neutralizeOrDeleteLog(log).
6. Revalidate selettivo (vedi sotto).
```

Motivazione: l'utente deve poter correggere un'aggiunta sbagliata senza passare da SQL o dalla pagina skill.

#### Helper interno `neutralizeOrDeleteLog`

Regola unica, non esportata, usata da `setPracticeCompletionForDate(..., false)` e `removeFreePracticeForDate`:

```txt
neutralizeOrDeleteLog(log):
  se personal_note è vuota:
    delete practice_logs where id = log.id and user_id = currentUser
  altrimenti:
    update practice_logs set completed=false, reps_done=0 where id = log.id and user_id = currentUser
```

Motivazione: la regola "se c'è una nota la preservo, altrimenti cancello il log spento" deve avere un solo punto di implementazione.

#### Aggiornamento `last_practiced_at`

Per log retroattivi, `last_practiced_at = now()` è semanticamente sbagliato. Se oggi registro una pratica di ieri, l'ordinamento SRS non deve credere che la skill sia stata praticata oggi.

Regola:

```txt
candidate = timestamp sintetico per dateKey
last_practiced_at = max(last_practiced_at, candidate)
```

Implementazione consigliata:

- usare un timestamp stabile di ordinamento, per esempio `${dateKey}T12:00:00.000Z`, evitando problemi DST;
- aggiornare lato Postgres con `GREATEST`, non con read+write dal client;
- non ricalcolare al toggle-off.

Esempio SQL/RPC:

```sql
UPDATE user_plan_items
SET last_practiced_at = GREATEST(last_practiced_at, candidate_timestamp)
WHERE user_id = current_user_id
  AND skill_id = target_skill_id;
```

Se `last_practiced_at` può essere `NULL`, usare `GREATEST(COALESCE(last_practiced_at, candidate_timestamp), candidate_timestamp)`.

Motivazione: `last_practiced_at` serve per ordinamento/rotazione, non come audit dell'ora esatta. Mezzogiorno UTC conserva l'ordine dei giorni senza dover modellare la timezone locale in SQL.

Il check "data futura" usa `localDateKey()` e quindi la timezone configurata dell'app (`Europe/Rome` nell'MVP). Se l'app diventerà multi-utente con timezone diverse, questa regola andrà riconsiderata.

#### Revalidation selettiva

Le action non devono revalidare sempre tutti i path:

- sempre: `/journal`, `/progress`;
- `/sessions/calendar`: solo se la data ricade nel periodo dello schedule corrente;
- `/today`: solo se `dateKey === localDateKey()`;
- `/library`: normalmente non serve, perché la libreria mostra stato piano/catalogo, non l'ultima pratica.

Motivazione: per MVP funziona anche revalidare largo, ma il diario verrà usato spesso per correzioni retroattive. Evitare revalidation non necessarie riduce latenza e invalidazioni inutili.

### 1.10 Query e build della DayView

Nuova query consigliata: `getJournalDataInRange(userId, from, to)`.

Deve recuperare:

- `training_schedule` dell'utente, se presente.
- `user_plan_items` attivi secondo `profile.plan_mode`.
- righe meaningful di `practice_logs` nel range, includendo solo i campi skill necessari alla DayView.
- profilo utente per `plan_mode` e discipline attive.

Filtro log lato query:

```ts
supabase
  .from("practice_logs")
  .select(`
    *,
    skill:skills(
      id,
      name,
      name_italian,
      discipline,
      category,
      practice_mode,
      minimum_grade_value,
      display_order
    )
  `)
  .eq("user_id", userId)
  .gte("date", from)
  .lte("date", to)
  .or("completed.eq.true,reps_done.gt.0,personal_note.not.is.null")
```

Motivazione:

- Il filtro meaningful in query evita di caricare log spenti senza contenuto.
- Enumerare i campi skill evita `skills(*)`, che scarica video, note maestro e campi non usati nel diario.
- Se in futuro si vorrà una vista audit completa dei log spenti, questa query andrà separata da `getJournalDataInRange`.

Costruzione:

```txt
1. Calcolare rows = listSessionsInRange(from, to, schedule, scheduledItems), se schedule esiste.
2. Raggruppare logs per date + skill_id.
3. Per ogni data:
   - prendere la sessione programmata se esiste;
   - attaccare i log alle righe scheduled;
   - classificare i log rimanenti meaningful come freePractice;
   - calcolare isFuture, hasSchedule, isInScheduleRange.
```

`/journal` non deve fare early return se manca schedule o se non ci sono scheduledItems. Deve comunque mostrare pratica libera e stato vuoto.

`/sessions/calendar` può mantenere empty state quando manca schedule, perché il suo dominio è il piano sessioni.

### 1.11 UI del giorno selezionato

Vista `/journal`:

```txt
Mercoledì 6 maggio
Sessione 3 · 4 esercizi · target 6x

SESSIONE PROGRAMMATA
[switch] Siu Nim Tao sez. 2       Fatto
[switch] Siu Nim Tao sez. 3       Non fatto
[switch] Tan Sao                  Fatto
[switch] Pak Sao                  Non fatto

PRATICA LIBERA
Bong Sao                          Registrata
Lap Sao                           Registrata
[+ Aggiungi pratica libera]
```

Stati:

- Giorno con sessione e zero log: mostra righe scheduled tutte "Non fatto".
- Giorno di riposo con pratica libera: mostra solo "Pratica libera".
- Giorno di riposo senza log: "Riposo. Nessuna pratica registrata."
- Giorno fuori periodo schedule con log: "Nessuna sessione programmata" + pratica libera.
- Giorno futuro: mostra eventuale sessione futura, ma tutti i controlli sono read-only.

Vista `/sessions/calendar`:

- Sezione "Sessione programmata" identica, con toggle per date `<= today`.
- Sezione "Pratica libera" visibile se presente, ma secondaria e senza azione "Aggiungi".
- Link "Apri diario completo" porta a `/journal` sulla stessa data.

Skill `practice_mode = paired`:

- Non bloccare il toggle.
- Mostrare badge o testo breve "richiede partner" se già presente nel row component.
- Motivazione: Today non blocca la pratica paired; il diario deve restare coerente.

### 1.12 Componenti coinvolti

Nuovi:

- `src/app/(app)/journal/page.tsx` — server component per `/journal`.
- `src/components/journal/JournalCalendar.tsx` — componente condiviso week/month + pannello giorno.
- `src/components/journal/JournalDayPanel.tsx` — sezioni "Sessione programmata" e "Pratica libera".
- `src/components/journal/PracticeCompletionToggle.tsx` — client component idempotente; bottone accessibile con `role="switch"` e `aria-checked`, chiama `setPracticeCompletionForDate`.
- `src/components/journal/AddFreePracticeSheet.tsx` — selezione skill e creazione log libero.
- `src/lib/journal-logic.ts` — funzioni pure `buildJournalDayView`, `buildJournalDayViewsInRange`, `categorizeLogsForDay`, `isMeaningfulLog`.
- `src/lib/journal-logic.test.ts` — test unitari.
- `src/lib/queries/journal.ts` — query server aggregate per range.
- `src/lib/actions/journal.ts` — server action retroattive: `setPracticeCompletionForDate`, `addFreePracticeForDate`, `removeFreePracticeForDate`, helper interno `neutralizeOrDeleteLog`.

Modificati:

- `src/components/sessions/GeneratedPlanCalendar.tsx` — sostituito da wrapper o migrato a `JournalCalendar` in `mode="session"`.
- `src/app/(app)/sessions/calendar/page.tsx` — usa la vista sessione del diario e linka `/journal`.
- `src/lib/types.ts` — aggiunge tipi UI/dominio del diario (`JournalMode`, `JournalDayView`, `ScheduledPracticeItem`, `FreePracticeItem`).
- `src/app/(app)/today/page.tsx` — link al diario.
- `src/app/(app)/progress/page.tsx` — link al diario.
- `src/lib/queries/practice-log.ts` — non duplicare la query journal qui; resta per letture puntuali/esistenti.

Migration:

- nuova migration Supabase per deduplica + unique constraint su `practice_logs(user_id, skill_id, date)` + indice `practice_logs(user_id, date)`.

Non modificati:

- `src/lib/session-scheduler.ts` — resta la fonte pura per calcolare la sessione del giorno.
- `src/lib/progress-logic.ts` — non serve cambiarlo per far riflettere `completed`; eventuali metriche reps della pratica libera sono decisione separata.
- `src/lib/actions/practice.ts` — resta dedicato al flusso Today/pratica corrente. Follow-up possibile dopo la migration: semplificare `markPracticeDone`, `incrementRep`, `decrementRep` con `upsert(... onConflict ...)` e aggiornamento `last_practiced_at` con `GREATEST`.

### 1.13 Statistiche e impatto su `/progress`

Il diario aggiorna `practice_logs.completed`, quindi le statistiche che dipendono da `completed` si aggiornano automaticamente:

- calendario pratica recente;
- streak;
- copertura ultimi 30 giorni;
- readiness delle skill richieste dal piano/esame.

Per le righe di sessione, `setPracticeCompletionForDate(..., true)` imposta `reps_done = reps_target`, quindi anche i riepiloghi periodo sessione e la metrica "Rip. forme" restano coerenti con la logica attuale.

Per la pratica libera, invece, il piano mantiene `reps_done = 0` e `reps_target = null`. Effetti:

- conta come pratica completata;
- contribuisce a streak e copertura;
- non aumenta il conteggio numerico "Rip. forme".

Motivazione: senza chiedere quante ripetizioni sono state fatte, inserire un numero sarebbe arbitrario. Se in futuro si vuole che "Rip. forme" includa anche pratica libera, servirà una decisione esplicita sul significato di `reps_done` per log non schedulati.

### 1.14 Accessibilità e mobile

- Toggle: bottone con `role="switch"` e `aria-checked`; non è obbligatorio usare il componente visuale `Switch`, basta rispettare semantica e tap target.
- Tap target minimo 48px.
- Giorni futuri: controlli disabilitati con `aria-disabled` e copy breve "Disponibile dal giorno stesso".
- Sheet "Aggiungi pratica libera": ricerca accessibile, label testuali, chiusura esplicita.
- Stati vuoti chiari:
  - "Riposo. Nessuna pratica registrata."
  - "Nessuna sessione programmata. Puoi aggiungere pratica libera."
  - "Sessione futura. Potrai segnarla dal giorno stesso."

### 1.15 Out of scope (Tema 1)

- Eventi scuola/federazione: predisposizione concettuale (`events: []`), nessuna tabella in questo sprint.
- Versioning storico dello schedule: niente `training_schedule_versions` ora.
- Editing parziale reps su giorni passati: il diario resta binario.
- Note storiche complete: non si introduce un diario testuale o editor note per date passate, salvo preservare note esistenti.
- Bulk action ("segna fatto tutta la settimana").
- Nuovo slot BottomNav o tile Hub dedicata.

### 1.16 Decisioni finali prima dell'implementazione

- **Route e label.** La rotta è `/journal`; la label UI è "Diario".
- **Navigazione.** Link da `/progress`, `/today`, `/sessions/calendar`; nessuna tile Hub dedicata in questo sprint.
- **Skill paired.** Nessun blocco per `practice_mode = paired`; solo segnalazione visiva coerente con Today.
- **Pratica libera.** "Aggiungi pratica libera" nel diario è parte del Tema 1, perché rende il diario davvero generale e prepara la pulizia della pagina skill nel Tema 2.
- **Shape DayView.** `canToggle` e `hasNote` restano denormalizzati negli item per semplicità UI.

---

## 2. Tema 2 — Pulizia della pagina forma `/skill/[id]`

> **Stato:** placeholder. Da elaborare in revisione successiva di questo documento.

### 2.1 Problema noto

`/skill/[id]` mescola contenuti da due dimensioni distinte:

- **Scuola**: video, note maestro, livello, categoria, modalità di pratica, disciplina, partner alert.
- **Stato utente**: StatusBadge focus/maintenance, SkillStatusMenu, AddToPlanButton, "Registra pratica libera", helper text sulle sessioni.

L'utente vuole che la "vista forma della scuola" sia solo scheda della forma, senza informazioni che dipendono dalla sessione di allenamento attuale. Da chiarire al brainstorm: le note personali, e la sorte di "Registra pratica libera" (vedi opzioni α/β/γ in conversazione 2026-05-07).

### 2.2 Dipendenze dal Tema 1

Se il Tema 1 va in produzione, il segna-pratica retroattivo da `/journal` rende `/today` e `/journal` la coppia naturale per loggare pratica. Questo sblocca l'opzione di **eliminare "Registra pratica libera"** dalla pagina skill e mantenerla solo per la pratica del giorno corrente fuori sessione (oppure rimuoverla del tutto).

### 2.3 Da decidere nel brainstorm dedicato

- Quali delle voci sopra restano sulla pagina forma e quali vengono spostate.
- Se la pagina forma cambia in base al referrer (Today vs Library) o resta uniforme.
- Dove va a finire il flusso "Registra pratica libera" (§ Domanda 2C in conversazione).

---

## 3. Tema 3 — Sezione "Altre forme" extra-curriculum

> **Stato:** placeholder. Da elaborare in revisione successiva di questo documento.

### 3.1 Problema noto

Esistono forme che il founder pratica ma non hanno ancora un grado ufficiale assegnato dalla federazione (in attesa di colloquio per il fucsia futuro). Devono apparire nella libreria senza confondersi con i gradi ufficiali (8° Chi … 2° Mezza Luna).

### 3.2 Direzione di massima (proposta in conversazione)

Aggiungere a `skills` una colonna nullable `pending_grade_label TEXT`. Se valorizzata, la skill è "in attesa di classificazione" e l'etichetta descrive la collocazione futura ipotizzata. Render in libreria: sezione separata in fondo "Altre forme — in classificazione".

### 3.3 Da decidere nel brainstorm dedicato

- Numerosità reale delle forme (poche → categoria; molte → colonna dedicata).
- Comportamento rispetto a `user_plan_items` (entrano in selezione personale come `source = 'manual'`).
- Visibilità per livelli (per ora non rilevante: utente single).
- Workflow di promozione: quando una forma riceve un grado ufficiale, basta valorizzare `minimum_grade_value` e azzerare `pending_grade_label`. Migration manuale via Supabase SQL Editor (CLI non in PATH).

---

## 4. Acceptance criteria del Tema 1

- [ ] Da `/journal` posso navigare giorno per giorno (week + month) come oggi in `/sessions/calendar`.
- [ ] `/journal` non clampa la data dentro `training_schedule.start_date/end_date`: giorni fuori periodo e giorni senza schedule mostrano comunque pratica libera e stati vuoti corretti.
- [ ] Una migration transazionale deduplica eventuali duplicati e aggiunge `UNIQUE (user_id, skill_id, date)` + indice `(user_id, date)` a `practice_logs`.
- [ ] Per ogni giorno `<= oggi`, ogni forma della sessione programmata mostra un controllo "fatto / non fatto" che chiama una server action idempotente.
- [ ] Toggle attivato su un giorno passato → il log esiste con `completed = true`, `reps_target = target`, `reps_done = reps_target`.
- [ ] Toggle disattivato su un giorno passato già segnato → il log resta o viene neutralizzato con `completed = false` e `reps_done = 0`, preservando eventuale nota.
- [ ] Le nuove server action retroattive sono in `src/lib/actions/journal.ts`, non in `practice.ts`.
- [ ] `last_practiced_at` viene aggiornato in modo atomico lato Postgres con semantica `GREATEST`, non con read+write fragile.
- [ ] Le action usano revalidation selettiva: sempre `/journal` e `/progress`, `/today` solo per oggi, `/sessions/calendar` solo se rilevante.
- [ ] Per giorni futuri, il toggle è disabilitato (read-only) e visivamente distinguibile.
- [ ] Da `/journal` posso aggiungere una pratica libera su date `<= oggi` selezionando una skill non presente nella sessione programmata del giorno.
- [ ] Aggiungere pratica libera crea/upserta un log con `completed = true`, `reps_target = null`, `reps_done = 0`.
- [ ] Se provo ad aggiungere come pratica libera una skill già schedulata quel giorno, non nasce un duplicato: viene completata/indirizzata la riga scheduled.
- [ ] Le forme praticate liberamente (skill non in sessione del giorno) appaiono in una sezione "Pratica libera" del giorno solo se hanno un log meaningful.
- [ ] `getJournalDataInRange` filtra i log meaningful lato query ed enumera i campi skill necessari invece di usare `skills(*)`.
- [ ] Posso annullare una pratica libera aggiunta per errore: delete se non ha nota, altrimenti `completed = false` e nota preservata.
- [ ] `/sessions/calendar` mostra la stessa UI ma con `mode="session"` (priorità alla sezione sessione, pratica libera collassata o discreta).
- [ ] Da `/sessions/calendar` esiste un link "Apri diario completo" → `/journal`.
- [ ] Da `/today` esiste un link verso `/journal` per recuperare giorni passati.
- [ ] Da `/progress` esiste un link "Apri il diario di pratica" → `/journal`.
- [ ] `/progress` ricalcola correttamente streak/readiness dopo un toggle retroattivo (no modifiche a progress-logic.ts).
- [ ] `npm run lint && npm run build` passano.
- [ ] `journal-logic.ts` ha test unitari su `buildJournalDayView`, `buildJournalDayViewsInRange`, `categorizeLogsForDay` e `isMeaningfulLog`.

## 5. Trigger per aggiornare il piano principale

Una volta approvato e implementato il Tema 1:

- Aggiornare `plan/current-plan.md §5` (struttura cartelle): nuova cartella `src/components/journal/` e nuovo file `src/lib/journal-logic.ts`.
- Aggiornare `plan/current-plan.md §7` (navigazione): nuova rotta `/journal`, nuovi link da `/progress` e `/today`, evoluzione di `/sessions/calendar`.
- Aggiornare `plan/current-plan.md §9` (sprint plan): aggiungere voce 1.13 "Calendario generale e segna-pratica retroattiva".
- Marcare in §2.1 una nuova decisione D11 "Diario (`/journal`) come vista canonica di tracking/correzione, `/sessions/calendar` come vista filtrata sulle sessioni".
- Aggiornare `plan/current-plan.md §4` (modello dati): `practice_logs` ha chiave unica logica `(user_id, skill_id, date)` e indice `(user_id, date)` per letture range.
- Aggiornare `plan/current-plan.md §5` o note tipi: tipi UI del diario in `src/lib/types.ts` e action retroattive in `src/lib/actions/journal.ts`.
