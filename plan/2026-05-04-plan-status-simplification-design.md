---
status: design-approved
date: 2026-05-04
supersedes: parte di §6.1, §6.4 di plan/current-plan.md
related:
  - plan/2026-04-26-training-schedule-design.md
---

# Semplificazione PlanStatus: da 3 a 2 livelli (focus / mantenimento)

## Problema

Oggi `PlanStatus = "focus" | "review" | "maintenance"`. Tre livelli sono troppi:

- Cognitivo: l'utente deve decidere per ogni skill fra tre stati con semantica sovrapposta
- Algoritmico: focus appare ogni sessione, review ruota su `cadence_weeks * weekdays`, maintenance su `cadence_weeks * 2 * weekdays`. Tre regole diverse per gestire una sola variabile (intensità)
- Pratico: nei seed esami "review" e "maintenance" si confondono, le scelte di default sono arbitrarie

## Decisione

**Due stati**: `focus` e `mantenimento`. Una sola dimensione: intensità.

Tutte le skill del piano vengono praticate dentro lo stesso ciclo. Le skill in **focus appaiono il doppio delle volte** rispetto a quelle in **mantenimento**, distribuite uniformemente nelle sessioni del ciclo.

Niente più rotazioni distinte per stato. Una sola formula deterministica, sempre intera.

## Modello formale

### Parametri

- `N_focus`, `N_maint` = numero skill per status nel piano
- `weekdays.length` = giorni di pratica nella settimana
- `cycle_weeks` = lunghezza del ciclo (1, 2 o 4 settimane). Resta nello schedule come `cadence_weeks` (semantica nuova)
- pesi fissi: `focus = 2`, `maintenance = 1`

### Formula occorrenze

```
occorrenze_focus_per_skill   = 2     (nel ciclo)
occorrenze_maint_per_skill   = 1     (nel ciclo)
occorrenze_totali_ciclo      = N_focus * 2 + N_maint * 1
giorni_pratica_ciclo         = weekdays.length * cycle_weeks
forme_per_sessione           = ceil(occorrenze_totali_ciclo / giorni_pratica_ciclo)
```

**Invariante**: `forme_per_sessione * giorni_pratica_ciclo >= occorrenze_totali_ciclo`. Sempre intero per costruzione, niente arrotondamenti dubbi.

### Esempi

| Skill | weekdays | cycle | distribuzione | forme/giorno |
|---|---|---|---|---|
| 10 (tutte mantenimento) | 5 | 1 sett | 10 occ. | 2 |
| 10 (4 focus + 6 maint) | 5 | 1 sett | 4*2 + 6*1 = 14 occ. | 3 |
| 10 (tutte focus) | 5 | 1 sett | 20 occ. | 4 |
| 30 (10 focus + 20 maint) | 4 | 2 sett | 40 occ. | 5 |

## Algoritmo di distribuzione skill→sessione

Serve sapere *quale* skill in *quale* sessione, non solo quanti slot al giorno.

1. Per ogni skill, genera `occorrenze` token: `[s1, s1, s2, s3, s3, ...]`
2. Ordinamento stabile primario: `discipline → category → display_order → skill_id`
3. Distribuzione "Bresenham-like" su `S` sessioni del ciclo: token i-esimo va a sessione `floor(i * S / totale_token)`. Evita cluster e ripetizioni nella stessa sessione finché possibile
4. Per `getScheduledSession(date)`: calcola `sessionIndex` come oggi, restituisci i token assegnati a quello slot

**Garanzia**: ogni skill compare esattamente `occorrenze` volte nel ciclo. Stessa skill mai ripetuta nella stessa sessione, salvo caso patologico (`occorrenze_focus > S`, ovvero più focus che sessioni nel ciclo — improbabile).

Non si distinguono più "focus / review / maintenance" nella ScheduledSession: tutte le skill della sessione sono mostrate insieme. Il badge per skill mostra il suo status (focus/mantenimento) per riferimento.

> Si valuterà in fase di plan se mantenere visivamente due sezioni separate o una unica lista con badge.

## Schema DB e migrazione

### Migration `0018_simplify_plan_status.sql`

```sql
-- 1. Collassa stato esistente
UPDATE user_plan_items
SET status = 'maintenance'
WHERE status = 'review';

UPDATE exam_skill_requirements
SET default_status = 'maintenance'
WHERE default_status = 'review';

-- 2. Sostituisci enum (Postgres non supporta DROP VALUE, ricreare)
ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE text;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE text;

DROP TYPE IF EXISTS plan_status CASCADE;
CREATE TYPE plan_status AS ENUM ('focus', 'maintenance');

ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE plan_status USING status::plan_status;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE plan_status USING default_status::plan_status;
```

> Da fornire all'utente come SQL copia-incolla per il SQL Editor Supabase (CLI non in PATH).

### RPC

`update_plan_item_status(p_skill_id, p_status)` esiste già. Cambia solo il dominio accettato (`'focus' | 'maintenance'`), nessuna modifica alla firma.

## UI

### Cambi in `/today` e `/sessions/calendar`

- Da 3 sezioni a 2: **Focus** e **Mantenimento**
- Card skill: badge a 2 stati invece di 3
- Copy: `Focus` / `Mantenimento` (in linea con il resto)

### Cambi in `/programma`

- Chip filtro stato: 2 valori invece di 3

### Cambi in `/sessions/setup`

Nuova card **"Forme nel piano"** inserita fra `Frequenza del ripasso` e `Ripetizioni per forma` (5ª card del form).

```
┌─────────────────────────────────┐
│ Forme nel piano                 │
│ 10 forme · 4 focus · 6 manten.  │
│                                 │
│ ▸ Shaolin (6)                   │
│   Forme                         │
│     Tan Ta Quan        [Focus]  │
│     Wu Bu Quan         [Mant.]  │
│   Tecniche base                 │
│     Tan Sao            [Focus]  │
│   ...                           │
│                                 │
│ ▸ Taichi (4)                    │
│   ...                           │
└─────────────────────────────────┘
```

- Sottotitolo conta-skill aggiornato live
- Raggruppamento `discipline → category` con header
- Toggle binario per riga (componente shadcn `Switch` o custom pill `[Focus | Mantenimento]`)
- **Persistenza immediata**: ogni toggle invoca `updatePlanItemStatus` (server action già esistente). Coerente con pattern del resto dell'app
- **Filtro per ambito**: la lista mostra solo skill che rientrano nello scope esame attivo (selezionato nella card "Ambito sessioni")
- Ordinamento: `discipline → category → display_order`

### Rinomina label

`Frequenza del ripasso` → **`Lunghezza ciclo`**. Sottotitolo: *"Entro questo intervallo tutte le forme vengono praticate almeno una volta"*. Il `CadencePicker` (1/2/4 settimane) resta invariato. Default 2 (com'è oggi).

### Preview reattivo `Ripetizioni per forma`

Il `SessionPreview` esistente usa oggi `previewCount = min(selectedItemCount, 6)`. Aggiornare per riflettere la formula nuova:

```
previewCount = ceil((N_focus * 2 + N_maint * 1) / (weekdays.length * cycle_weeks))
```

Aggiornamento in tempo reale al variare di toggle, weekdays, cadence.

### Nuovo componente

`src/components/sessions/PlanFormsSection.tsx` — Client Component. Riceve `items: ItemWithSkill[]`, `scope`, gestisce render lista + invoca `updatePlanItemStatus`. State locale = `item.status` come source of truth (riallineato dopo ogni revalidate).

## Cosa rimuovere

- `REVIEW_PER_DAY`, `MAINTENANCE_PER_DAY` da `practice-logic.ts`
- Calcoli `cycleSizeReview` / `cycleSizeMaintenance` distinti in `session-scheduler.ts`
- Tutti i riferimenti a `"review"` in: types, queries, actions, componenti UI, label, badge
- Branch "review" in `ScheduledSession` (oggi `{ focus, review, maintenance }` → `{ focus, maintenance }` o lista unica)

## Test

### `practice-logic.test.ts`
- Distribuzione 2:1 tra focus e mantenimento
- Edge: tutti focus, tutti mantenimento, lista vuota
- Filtri disciplina invariati

### `session-scheduler.test.ts`
- Invariante: per ogni skill, somma occorrenze nel ciclo == peso atteso (2 per focus, 1 per maint)
- Forme/sessione costanti (max ±1 fra sessioni del ciclo)
- Stessa skill mai due volte nella stessa sessione (tranne caso patologico)
- Scope esame: filtro per `exam_disciplines` continua a funzionare

### Regressione manuale
- Piano migrato dell'utente attuale: forme/giorno restano nei limiti pratici (≤ 8)
- Toggle in setup persiste e si riflette in `/today` immediatamente

## Trade-off accettati

- **Rapporto fisso 2:1**: nessuna configurabilità (no preset 3:2, 3:1). Se serve, si aggiunge in futuro
- **`review → maintenance`**: scelta conservativa, l'utente promuove a focus quel che vuole. Alternativa "review → focus" sarebbe stata più ambiziosa ma avrebbe sovraccaricato i piani esistenti
- **Persistenza immediata dei toggle in setup**: niente "annulla" — coerente col resto dell'app, ma se l'utente cambia molti stati e poi non clicca "Genera sessioni" gli stati restano modificati. Accettabile

## Out of scope

- SRS reale con intervalli crescenti (D5 nel piano, Sprint 3)
- Configurabilità del rapporto focus:mantenimento
- Storia dei toggle (audit log)

## Aggiornamenti a `plan/current-plan.md`

Da fare contestualmente all'esecuzione del plan:

- §4.1: `ExamSkillRequirement.defaultStatus` → `"focus" | "maintenance"`
- §4.2: `UserPlanItem.status` → `"focus" | "maintenance"`
- §6.1 e §6.4: aggiornare descrizione algoritmo
- §12.2: rimappare `defaultStatus` nei seed esami (review → maintenance)
- D5 in §2.2: nota che la semplificazione è stata fatta, SRS resta come decisione futura
