# Allenamento Tab — Redesign del pannello di gestione

**Data:** 2026-05-03
**Scope:** tab `/today` (Allenamento) + form `/sessions/setup`
**Tipo:** redesign UI focalizzato (no cambi schema DB, no nuove rotte)

---

## 1. Contesto e problema

La tab Allenamento (`/today`) è la schermata di pratica quotidiana. Il suo header attuale (`TodaySessionHeader`) mescola titolo, modalità, gradi e due icon-button outline 36px per Calendario e Sessioni. Dall'analisi con l'utente sono emersi tre problemi:

1. **Separazione visiva debole** fra "parte di gestione" (controlli) e "parte di visualizzazione" (sintesi sessione + card di pratica).
2. **Icone calendario/settings sacrificate**: 16px in pulsanti 36px outline. Poco leggibili, poco invitanti, non in linea con un feeling Apple/Google moderno.
3. **Manca un'azione di reset**: cancellare la programmazione delle sessioni e ricominciare da zero. Oggi non esiste, l'utente è bloccato con lo schedule corrente o deve agire sul DB.

## 2. Decisioni prese (Q&A con utente)

| # | Domanda | Scelta |
|---|---------|--------|
| Q1 | Scope del pannello di gestione | **C** — pannello come "hub di controllo" che concentra le azioni; tab Programma resta com'è |
| Q2 | Forma del pannello | **B** — header identitario + barra di controllo separata sotto |
| Q3 | Distribuzione azioni | **A** — 2 visibili (Calendario, Sessioni) + overflow per le altre |
| Q4 | Semantica del Reset | **A** — solo schedule. Programma esame/custom si modifica dalla tab Programma; lo storico pratica resta |
| Q5 | Posizione del Reset | **B** — pulsante in fondo alla form di `/sessions/setup`, non nel pannello Allenamento |
| Q6 | Stile pulsanti barra | **A** — due pill button affiancati 50/50, full-width, h-12, label visibile |

Conseguenza di Q4 + Q5: l'overflow ipotizzato in Q3 si svuota (il reset esce dal pannello). Restano solo 2 azioni nella barra Allenamento, niente menu "...". Confermato dall'utente.

## 3. Architettura del pannello (tab Allenamento)

```
┌─────────────────────────────────────────────────┐
│  HEADER IDENTITÀ SESSIONE                       │
│   PROGRAMMA ESAME · SHAOLIN 4° / TAICHI 1°      │  ← eyebrow uppercase
│   Martedì                                       │  ← display title 32-36px
├─────────────────────────────────────────────────┤  ← divider sottile (border-t border-border/50)
│  BARRA DI CONTROLLO                             │
│   ┌────────────────┬────────────────┐           │
│   │ 📅 Calendario  │ ⚙️  Sessioni   │           │  ← due Button h-12 secondary, flex-1
│   └────────────────┴────────────────┘           │
└─────────────────────────────────────────────────┘  ← fine pannello sticky
   NewsBanner (se presente)
   MetricStrip — sintesi sessione (esercizi · fatto · reps · tempo)
   Practice cards — focus / review / maintenance
```

Le due fasce (header + barra) sono dentro **lo stesso container sticky** (sticky top, z-30, `material-bar`). Quando si scrolla, identità sessione e controlli restano visibili insieme. La metric strip e le card scrollano via.

## 4. Header identità sessione

### Contenuto

- **Eyebrow line** (uppercase, `label-font`, `text-primary` o muted in base al test visivo, una sola riga con wrap): modalità + gradi separati da `·`. Esempio: `PROGRAMMA ESAME · SHAOLIN 4° TOA LOU / TAICHI 1°`.
- **Titolo**: il giorno della settimana con prima lettera maiuscola, peso `font-semibold`, taglia `text-3xl` (~30px) o `text-4xl` (~36px) da decidere in implementazione testando su mobile reale. Esempio: `Martedì`.
- **Niente parola "Allenamento"** nel titolo: ridondante (siamo già nella tab Allenamento, lo dice la BottomNav e l'active state).
- **Niente supporting line** sotto al titolo: la sintesi vive nel `MetricStrip` poco sotto, evitiamo duplicazione.

### Razionale

Apple Calendar, Apple Fitness, Google Calendar usano il giorno (o la data) come titolo della sessione corrente. La modalità + i gradi sono "tag identitari" che vivono meglio in un eyebrow leggero sopra al titolo, non in linee separate sotto.

## 5. Barra di controllo

### Specifiche

- **Layout**: `flex gap-2` con due `Button` `flex-1`.
- **Altezza**: `h-12` (48px), in linea con design rules §7.5 del piano.
- **Variant shadcn**: `secondary`. Niente outline (troppo timido, è il problema attuale). Niente primary (troppo aggressivo per due controlli equivalenti e non destructive).
- **Icona sinistra + label**: icona `h-5 w-5` (~20px), label `text-sm font-medium`, gap-2 fra icona e label, contenuto `justify-center`.
- **Icone scelte**:
  - `CalendarDays` per Calendario (invariata).
  - `SlidersHorizontal` per Sessioni (cambio da `Settings2`: comunica "regola parametri" più direttamente di un ingranaggio generico).
- **Label**: "Calendario" e "Sessioni". Nomi corti, contesto disambiguante (sei nella tab Allenamento).
- **Stati**: hover/active standard shadcn `secondary`. Niente badge di notifica.

### Posizione

Subito sotto l'header identità, dentro lo stesso container sticky. Stacco verticale `pt-3`. Divider sottile `border-t border-border/50` fra header e barra.

### Markup di riferimento (non finale)

```tsx
<div className="border-t border-border/50 pt-3">
  <div className="flex gap-2">
    <Button asChild variant="secondary" className="h-12 flex-1 justify-center">
      <Link href="/sessions/calendar">
        <CalendarDays className="mr-2 h-5 w-5" />
        Calendario
      </Link>
    </Button>
    <Button asChild variant="secondary" className="h-12 flex-1 justify-center">
      <Link href="/sessions/setup">
        <SlidersHorizontal className="mr-2 h-5 w-5" />
        Sessioni
      </Link>
    </Button>
  </div>
</div>
```

## 6. Reset & ricomincia (in `/sessions/setup`)

### Visibilità

Render condizionale: la sezione "Zona ripristino" appare solo se `current` (la `TrainingSchedule` passata alla `SetupForm`) è non-null. Senza schedule attivo non c'è nulla da resettare.

### Layout

In coda alla form, dopo il pulsante Salva. Stacco netto: `mt-6 pt-6 border-t`.

```
─────────────────────────────────────────────────
ZONA RIPRISTINO
Cancella la programmazione attuale per ricominciare
da zero. Il piano di skill e lo storico pratica
restano invariati.

[ Cancella schedule ]
```

- Eyebrow `text-sm font-semibold` o uppercase `label-font`: "Zona ripristino".
- Descrizione `text-sm text-muted-foreground` di una riga che dichiara cosa viene cancellato e cosa **non** viene cancellato.
- Pulsante: `variant="destructive"` shadcn (oppure `outline` + `text-destructive` se destructive pieno è troppo nel tema dark/gold; da provare). Label: "Cancella schedule". Icona opzionale `Trash2` o `RotateCcw`.

### Conferma (`AlertDialog` shadcn)

| Slot | Testo |
|------|-------|
| Title | Cancellare la programmazione? |
| Description | Cancellerai giorni, ripetizioni, cadenza e durata. Il piano di skill e lo storico delle pratiche restano invariati. Dovrai ricreare la programmazione da zero. |
| Cancel | Annulla |
| Action | Cancella (`bg-destructive`) |

### Server Action

Nuova in `src/lib/actions/training-schedule.ts`:

```ts
export async function resetTrainingSchedule(): Promise<void> {
  // 1. Auth check via server client
  // 2. DELETE FROM training_schedule WHERE user_id = auth.uid()
  // 3. revalidatePath("/today")
  // 4. revalidatePath("/sessions/setup")
}
```

- DELETE singola, no transazione necessaria.
- RLS garantisce isolamento.
- Nessun redirect: l'utente resta sulla pagina, la `SetupForm` ora vede `current = null` e mostra i default per ricostruire lo schedule. Flusso "cancello → form vuota → riempo → salvo" senza step intermedi.

### Cosa NON viene toccato (esplicito)

- `user_plan_items` (skill nel piano)
- `user_profiles.preparing_exam_id` / `plan_mode`
- `practice_logs` (storico, anche con `reps_target` valorizzato dallo schedule precedente)

I log futuri non sono pre-creati: `getScheduledSession` calcola al volo da `training_schedule` + `user_plan_items`. Nessun log "orfano" da gestire.

## 7. File toccati / nuovi

### Modificati

- `src/components/today/TodaySessionHeader.tsx` — riscritto: rimuove i due icon-button, rimuove la parola "Allenamento" dal titolo, fonde modalità+gradi in eyebrow line, aggiunge la barra di controllo sotto con divider.
- `src/components/sessions/SetupForm.tsx` — aggiunge sezione "Zona ripristino" condizionale in coda alla form.

### Nuovi

- `src/components/sessions/ResetScheduleSection.tsx` — Client Component che incapsula bottone destructive + `AlertDialog` + chiamata alla server action. Estratto in file separato per tenere `SetupForm` snella.
- `resetTrainingSchedule` server action in `src/lib/actions/training-schedule.ts` (file esistente, aggiunta nuova export).

### Eventualmente

- `src/components/today/TodayControlBar.tsx` — se `TodaySessionHeader` cresce troppo, estrarre la barra di controllo in componente separato. Da decidere in implementazione.

## 8. Acceptance criteria

1. Aprendo `/today` con sessione attiva: vedo eyebrow + titolo "Martedì" + divider + due pulsanti pill 50/50 alti 48px con label visibili.
2. Le icone Calendario e Sessioni non sono più 16px ma 20px in pulsanti 48px con label affianco.
3. Scrollando le card di pratica, header + barra restano sticky in alto.
4. Aprendo `/sessions/setup` con schedule esistente: vedo la zona "ripristino" in fondo alla form con bottone destructive.
5. Aprendo `/sessions/setup` senza schedule (es. utente nuovo o appena dopo reset): la zona ripristino non è visibile.
6. Click su "Cancella schedule" → dialog di conferma → conferma → schedule cancellato → la form si resetta ai default → l'utente può ricompilare e salvare.
7. Lo storico `practice_logs` resta intatto dopo il reset (verificabile da Supabase dashboard).
8. `npm run lint && npm run build` passano.

## 9. Esclusioni / Non-goals

- **Non si tocca la tab Programma** (`/programma`, `/plan/exam`, `/plan/custom`). Cambio esame, switch modalità, modifica selezione restano lì.
- **Non si introduce overflow menu** nella barra di controllo. Con sole 2 azioni non è giustificato.
- **Non si cancella mai** `user_plan_items`, `preparing_exam_id`, `practice_logs` da questo flusso.
- **Non si modifica lo schema DB**.
- **Non si introducono nuove dipendenze**: tutti i componenti shadcn usati (`Button`, `AlertDialog`) sono già installati.
- **Non si rifà il `MetricStrip`** né le `Practice cards` (sono "parte di visualizzazione" e non sono il problema sollevato).

## 10. Open question (non bloccanti)

- **Variant del pulsante Reset**: `destructive` pieno vs `outline` con text-destructive. Da scegliere in implementazione confrontando visivamente nel tema dark/gold FESK.
- **Taglia del titolo del giorno**: `text-3xl` vs `text-4xl`. Da testare su mobile per equilibrio rispetto a eyebrow + barra sotto.
- **Eventuale estrazione di `TodayControlBar`** in componente separato. Da decidere in implementazione in base a quanto cresce `TodaySessionHeader`.

Tutte e tre sono dettagli di rifinitura, non bloccano la pianificazione.
