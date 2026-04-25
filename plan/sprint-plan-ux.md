# Sprint 1.7 — UX Programma + Modalità di studio + Selezione skill

**Status:** Implemented in code — richiede migrations applicate e walkthrough reale
**Versione:** v1
**Ultimo aggiornamento:** 2026-04-25
**Dipende da:** `current-plan.md`, `sprint-curriculum-fesk.md`
**Compatibile con (non blocca):** `sprint-video-player.md`

---

## 0. CONTESTO IN UNA FRASE

Aggiungere alla libreria una **vista "Programma" completo del curriculum FESK** (con gradi futuri in grigio) e introdurre nel profilo una **scelta esplicita della modalità di studio** (Programma esame vs Selezione libera) con relativa interfaccia di selezione delle skill.

---

## 1. PROBLEMA

Dopo lo Sprint 1.5 l'app ha ~137 skill FESK e una libreria con 3 sotto-viste (Mio livello / Per esame / Tutto). Ma:

1. **Manca la vista panoramica:** nessun punto in cui l'allievo veda *l'intero* programma FESK come la tabella sul sito ufficiale, inclusi i gradi che ancora non ha sbloccato (motivante)
2. **Manca un punto chiaro di scelta della modalità:** la generazione del piano è implicita (avviene in onboarding); non c'è una decisione esplicita ed editabile fra "seguo il programma esame" e "scelgo io le forme da ripassare"
3. **La selezione libera non ha UI dedicata:** oggi si aggiungono skill una alla volta dal dettaglio. Per un ripasso di un esame precedente (decine di skill) è impraticabile

Queste tre lacune compromettono l'usabilità centrale dell'app.

---

## 2. POSIZIONAMENTO RISPETTO AGLI ALTRI PIANI

Aggiunge:
- 1 colonna su `user_profiles` (`plan_mode`)
- 3 nuove rotte (`/library/program`, `/plan/exam`, `/plan/custom`)
- 9 nuovi componenti (vedi §7)
- 3 nuove Server Action in `lib/actions/plan.ts`

Non tocca:
- Schema FESK (skill, exam_programs, exam_skill_requirements)
- `practice-logic.ts` (la logica "Oggi" è invariata: legge UserPlanItem, niente di più)
- Auth, RLS, middleware, PWA, security headers
- `VideoPlayer` di Sprint 1.6 (consumato a sola lettura)

Il toggle "Programma" diventa la **quarta** sotto-vista della libreria, accanto a "Mio livello", "Per esame", "Tutto" — confermata come scelta strutturale (vedi P1).

---

## 3. DECISIONI CHIUSE

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| **P1** | Posizione della vista Programma | **Quarta sotto-vista della libreria** (URL `/library/program`). Non in profilo, non in nuova tab. È contenuto di consultazione, appartiene alla libreria |
| **P2** | Default `plan_mode` per nuovo utente | **`exam`** se l'utente in onboarding ha selezionato un esame da preparare, altrimenti **`custom`**. Coerente con il flusso esistente |
| **P3** | Grouping in Programma view | Per ogni grado, mostrare **solo le skill introdotte a quel grado** (`min_grade_value == grade_value`), **non** la lista cumulativa. L'utente vede chiaramente "cosa è nuovo" a ciascun esame. La cumulatività resta nella vista "Per esame" |
| **P4** | Soglia di lock nei gradi futuri | Lock se `grade.value < user.assigned_level_<discipline>` (numericamente più piccolo = grado più alto = ancora da raggiungere). Mostrato in grigio + lucchetto, tap mostra toast "Sblocca al raggiungimento di X° Chi" |
| **P5** | Indicatore stato nelle skill già nel piano | Pallino colorato a sinistra del nome: `focus = primary` (rosso burgundy come tema), `review = accent` (amber), `maintenance = green-500`. Niente lettera, solo colore + tooltip/aria-label |
| **P6** | Mutua esclusività delle modalità | **Sì, hard.** `plan_mode` è una colonna unica. Switch sempre con conferma. Mai uno stato "ibrido" |
| **P7** | Cosa elimina il switch modalità | Switch → `exam`: elimina **tutti** i `UserPlanItem`, rigenera dall'esame. Switch → `custom`: elimina solo `source = 'exam_program'`, mantiene `source = 'manual'` esistenti. `practice_logs` **mai** toccati. Coerente con prompt §8 |
| **P8** | Default status nella selezione libera | **Tutte `review`**. Niente UI per scegliere lo stato in fase di selezione (troppa complessità). Cambio stato disponibile da "Oggi" via menu (vedi §6) |
| **P9** | Shortcut "Seleziona tutto X° Chi" | Una **barra di chip** in cima alla schermata di selezione, una per grado accessibile. Tap → spunta tutte le skill con `min_grade_value == X` della disciplina corrente. Tap di nuovo → de-spunta. Mostra anche conteggio (es. "7° Chi (3)") |
| **P10** | Trigger del menu cambio stato in Today | **Bottone `⋮` esplicito** sulla card, non long-press. Long-press è invisibile (discoverability scarsa) e collide con i context menu mobili nativi |
| **P11** | Gestione esami in due discipline simultanei | Modalità esame supporta `preparing_exam_shaolin_id` + `preparing_exam_taichi_id` (due colonne) o singolo `preparing_exam_id` esistente? **Soluzione:** aggiungere `preparing_exam_taichi_id` come seconda colonna, mantenendo `preparing_exam_id` per Shaolin (rinomina concettuale, niente migration aggiuntiva sul nome) |
| **P12** | Empty state Today con `plan_mode = 'custom'` e 0 skill | Card centrale: "Nessuna forma selezionata. [ Apri selezione → ]" che porta a `/plan/custom` |
| **P13** | Persistenza `lastPracticedAt` al re-save selezione | **Sì, mantenere.** `saveCustomSelection` non droppa fisicamente la riga: per ogni skill già presente, lascia stare; per quelle rimosse, delete; per quelle nuove, insert. Questo preserva `last_practiced_at` (vedi §8.3 algoritmo) |

---

## 4. DECISIONI APERTE

| # | Decisione | Note | Priorità |
|---|-----------|------|----------|
| **P14** | Drag-and-drop per riordinare priorità nelle skill `focus` | Esplicitamente escluso ora. Da rivalutare se l'utente accumula >10 focus | 🟢 Sprint 2+ |
| **P15** | Filtri avanzati nella selezione (per arma, per practice_mode) | Non ora. Raggruppamento per categoria basta | 🟢 Sprint 2+ |
| **P16** | Hidden vs eliminato in modalità custom | In modalità custom, "nascondi" e "deseleziona" sono diversi? Per ora **identici**: deseleziona = elimina UserPlanItem. Hidden ha senso solo in modalità esame (nascondi senza rompere la coerenza col programma) | 🟢 Confermare con uso reale |
| **P17** | Sezioni "Cinture colorate / Cinture nere / Gradi superiori" come header visivi | Sì in v1 (rispetta il design del prompt). Da semplificare se ridondante | 🟢 Dopo uso reale |

---

## 5. VISTA "PROGRAMMA COMPLETO"

### 5.1 Rotta e struttura

```
/library/program                   → page.tsx (Server Component)
  ?d=shaolin (default) | taichi    → search param disciplina
```

`page.tsx` legge: tutti gli `exam_programs` della disciplina (ordinati per `grade_value` discendente: 7, 6, 5, ..., -7) + tutte le `skills` della disciplina, raggruppate in memoria per `min_grade_value`.

### 5.2 Render

```
┌─────────────────────────────────┐
│  Programma FESK                 │
│  [ Shaolin ]  [ T'ai Chi ]      │
│                                 │
│  ─── CINTURE COLORATE ───       │
│                                 │
│  Da 8° a 7° Chi      [3 skill]  │
│  ● Lien Pu Ch'uan 1° Lu  🥋   │
│  ● Tui Fa 1°             🦵   │
│  ● Tui Fa 2°             🦵   │
│                                 │
│  Da 7° a 6° Chi      [N skill]  │
│  ...                            │
│                                 │
│  Da 6° a 5° Chi      [N skill]  │
│  ...                            │
│                                 │
│  ─── CINTURE NERE ───           │
│                                 │
│  🔒 1° Chieh         [N skill]  │
│  (lista in grigio, non tappab.) │
│                                 │
│  🔒 2° Chieh                    │
│  ...                            │
│                                 │
│  ─── GRADI SUPERIORI ───        │
│  🔒 1° Mezza Luna               │
│  🔒 2° Mezza Luna               │
└─────────────────────────────────┘
```

Header di sezione (`Cinture colorate` / `Cinture nere` / `Gradi superiori`) calcolati da `grade_value`:
- ≥ 1 → "CINTURE COLORATE"
- ∈ [-5, -1] → "CINTURE NERE"
- ≤ -6 → "GRADI SUPERIORI"

### 5.3 Stati per grado

| Condizione | Render |
|------------|--------|
| `grade.value >= user.assigned_level_<d>` | Sbloccato. Skill tappabili → vanno a `/skill/[id]`. Pallino stato se nel piano (P5) |
| `grade.value < user.assigned_level_<d>` | Bloccato. Sezione opaca al 50%, icona 🔒 a fianco, header tappabile → toast "Sblocca al raggiungimento di X" |

### 5.4 Vista è di sola consultazione

Nessun bottone "aggiungi al piano" qui. Per modificare il piano si usa `/plan/custom` o `/plan/exam`. Conferma del prompt §1.

### 5.5 Componenti

- `src/app/(app)/library/program/page.tsx` (Server Component)
- `src/components/library/ProgramView.tsx` (Client, per il toggle disciplina via URL)
- `src/components/library/GradeSection.tsx` (Server, riceve grado + skill[])
- `src/components/library/ProgramSkillRow.tsx` (Server, riceve skill + planStatus opzionale per P5)
- `src/components/library/LockedToast.tsx` (Client, mostra toast on tap dell'header bloccato)

---

## 6. SCELTA MODALITÀ DI STUDIO (in Profilo)

### 6.1 Render nel profilo

Sezione "Piano di pratica" sotto le info personali, sopra impostazioni:

```
┌─────────────────────────────────┐
│  📋 Piano di pratica            │
│                                 │
│  Modalità: Programma esame      │
│  Esame Shaolin: Da 5° a 4° Chi │
│  Esame T'ai Chi: nessuno        │
│  12 forme nel piano             │
│                                 │
│  [ Cambia modalità ]            │
│  [ Modifica esame ]             │
└─────────────────────────────────┘
```

In modalità custom:

```
│  Modalità: Selezione libera     │
│  8 forme selezionate            │
│                                 │
│  [ Cambia modalità ]            │
│  [ Modifica selezione ]         │
```

### 6.2 Switch modalità

Tap "Cambia modalità" → modale con due card (Programma esame / Selezione libera). Dopo la selezione:

```
┌─────────────────────────────────┐
│  Cambiare in [modalità]?        │
│                                 │
│  Verranno [eliminate N skill /  │
│   rigenerate dal programma].    │
│  I tuoi log di pratica restano. │
│                                 │
│  [ Annulla ]    [ Conferma ]    │
└─────────────────────────────────┘
```

Conferma → Server Action → redirect a `/plan/exam` o `/plan/custom`.

### 6.3 Componenti

- `src/components/profile/PlanModeSection.tsx` (Server, riceve UserProfile + count skill)
- `src/components/plan/PlanModeSwitchModal.tsx` (Client, modale conferma)

---

## 7. MODALITÀ A — PROGRAMMA ESAME (`/plan/exam`)

### 7.1 Render

```
┌─────────────────────────────────┐
│  📝 Programma esame             │
│                                 │
│  Quale esame stai preparando?   │
│                                 │
│  Shaolin (attuale: 5° Chi):     │
│  [ Da 5° a 4° Chi        ▼ ]   │
│  [ Nessun esame          ▼ ]   │
│                                 │
│  T'ai Chi (attuale: 5° Chi):    │
│  [ Da 5° a 4° Chi        ▼ ]   │
│  [ Nessun esame          ▼ ]   │
│                                 │
│  [ Attiva programma → ]         │
└─────────────────────────────────┘
```

### 7.2 Regole dropdown

- Mostra **solo il prossimo grado** rispetto al livello attuale (`grade.value == user.assigned_level - 1`, considerando il salto Chi→Chieh: dopo `assigned_level=1` viene `-1`, non `0`)
- Opzione "Nessun esame" sempre presente
- Disciplina T'ai Chi **non visibile** se `assigned_level_taichi == 0` (utente non pratica T'ai Chi)

### 7.3 Server Action

```typescript
// lib/actions/plan.ts
export async function activateExamMode(input: {
  examShaolinId: string | null
  examTaichiId: string | null
}): Promise<void> {
  // Atomic transaction:
  // 1. UPDATE user_profiles SET plan_mode='exam',
  //    preparing_exam_id=input.examShaolinId,
  //    preparing_exam_taichi_id=input.examTaichiId
  // 2. DELETE FROM user_plan_items WHERE user_id=auth.uid()
  // 3. INSERT FROM exam_skill_requirements per ciascun esame selezionato
  //    (riusa generatePlanItemsFromExam di plan-manager.ts)
  // 4. revalidatePath('/today'); revalidatePath('/profile')
}
```

### 7.4 Componenti

- `src/app/(app)/plan/exam/page.tsx`
- `src/components/plan/ExamSelector.tsx` (Client, doppio dropdown + submit)

---

## 8. MODALITÀ B — SELEZIONE LIBERA (`/plan/custom`)

### 8.1 Render

```
┌─────────────────────────────────┐
│  🎯 Seleziona forme             │
│                                 │
│  [ Shaolin ]  [ T'ai Chi ]      │
│                                 │
│  Esami:                         │
│  [7° Chi (3)] [6° Chi (3)]      │
│  [5° Chi (4)] [4° Chi (5)]      │
│                                 │
│  Forme                          │
│  ☑ Lien Pu Ch'uan 1° Lu  🥋  │
│  ☐ Shaolin 1° Lu          🥋  │
│  ...                            │
│                                 │
│  Tecniche di calcio             │
│  ☑ Tui Fa 1°             🦵  │
│  ...                            │
│                                 │
│  Combattimenti (Po Chi)         │
│  ☐ Po Chi 1°       ⚔️ 🧍👥 │
│  ...                            │
│                                 │
│  ─────────────────────────────  │
│  5 forme selezionate            │
│  [ Salva piano → ]              │
└─────────────────────────────────┘
```

### 8.2 Regole

- Toggle disciplina via URL `?d=shaolin/taichi`
- Mostra solo skill **accessibili**: `min_grade_value >= user.assigned_level_<d>` (a differenza della vista Programma che mostra anche futuri)
- Raggruppate per `category` (label IT da `lib/labels.ts`)
- Chip "X° Chi (N)" in alto: tap → toggla la selezione di tutte le skill con `min_grade_value == X` della disciplina corrente. Stato chip: `selected` se tutte selezionate, `partial` se alcune, `unselected` se nessuna
- Contatore "X forme selezionate" sticky in basso
- "Salva piano" disabilitato se 0 selezionate (con tooltip "Seleziona almeno una forma")
- All'apertura: checkbox riflettono lo stato attuale del piano (skill già nel piano = checked)

### 8.3 Server Action `saveCustomSelection`

```typescript
export async function saveCustomSelection(input: {
  selectedSkillIds: string[]
}): Promise<void> {
  // Atomic transaction:
  const userId = auth.uid()
  const existing = await db.query(
    "SELECT skill_id FROM user_plan_items WHERE user_id=$1 AND source='manual'",
    [userId]
  )
  const existingIds = new Set(existing.map(r => r.skill_id))
  const targetIds  = new Set(input.selectedSkillIds)

  const toRemove = [...existingIds].filter(id => !targetIds.has(id))
  const toAdd    = [...targetIds].filter(id => !existingIds.has(id))

  if (toRemove.length) {
    await db.query(
      "DELETE FROM user_plan_items WHERE user_id=$1 AND skill_id = ANY($2) AND source='manual'",
      [userId, toRemove]
    )
  }
  if (toAdd.length) {
    await db.query(
      "INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden) " +
      "SELECT $1, unnest($2::uuid[]), 'review', 'manual', false",
      [userId, toAdd]
    )
  }
  revalidatePath('/today')
  revalidatePath('/profile')
}
```

> **Importante (P13):** la diff add/remove preserva `last_practiced_at` per le skill che restano nel piano fra due salvataggi.

### 8.4 Server Action `switchToCustomMode`

Chiamata dal `PlanModeSwitchModal`:

```typescript
export async function switchToCustomMode(): Promise<void> {
  const userId = auth.uid()
  await db.transaction(async tx => {
    await tx.query(
      "DELETE FROM user_plan_items WHERE user_id=$1 AND source='exam_program'",
      [userId]
    )
    await tx.query(
      "UPDATE user_profiles SET plan_mode='custom', preparing_exam_id=NULL, preparing_exam_taichi_id=NULL WHERE id=$1",
      [userId]
    )
  })
  revalidatePath('/today')
  revalidatePath('/profile')
}
```

### 8.5 Componenti

- `src/app/(app)/plan/custom/page.tsx` (Server, query iniziale skill + plan)
- `src/components/plan/SkillCheckList.tsx` (Client, gestisce stato selezione)
- `src/components/plan/SkillCheckRow.tsx` (Client, singola riga checkbox)
- `src/components/plan/GradeQuickSelect.tsx` (Client, chip "X° Chi (N)")
- `src/components/plan/SelectedCounter.tsx` (Client, contatore sticky + bottone salva)

---

## 9. CAMBIO STATO DA "OGGI"

### 9.1 Trigger

Bottone `⋮` (kebab) in alto a destra su ogni skill card della schermata Today. Tap → menu inline (popover/sheet):

```
┌─────────────────────────┐
│  Shaolin 2° Lu          │
│  Stato: Ripasso         │
│                         │
│  Cambia in:             │
│  ○ Focus                │
│  ● Ripasso              │
│  ○ Mantenimento         │
│  ─────────────────────  │
│  ○ Nascondi dal piano   │
└─────────────────────────┘
```

### 9.2 Server Action

Esistente o nuova in `lib/actions/plan.ts`:

```typescript
export async function updatePlanItemStatus(input: {
  planItemId: string
  status: 'focus' | 'review' | 'maintenance'
}): Promise<void>

export async function hidePlanItem(planItemId: string): Promise<void>
```

### 9.3 Componente

- `src/components/today/SkillStatusMenu.tsx` (Client, usa shadcn Sheet o Popover)
- Modifica: `src/components/today/TodaySkillCard.tsx` per aggiungere il bottone `⋮`

---

## 10. MODIFICHE AL MODELLO DATI

### 10.1 Migration `0005_plan_mode.sql`

```sql
-- 1. plan_mode su user_profiles
ALTER TABLE user_profiles
  ADD COLUMN plan_mode TEXT NOT NULL DEFAULT 'exam'
  CHECK (plan_mode IN ('exam', 'custom'));

-- 2. Secondo esame in preparazione (T'ai Chi). Il preparing_exam_id esistente
--    diventa "preparing_exam_shaolin_id" concettualmente — niente rename SQL
--    per non rompere migration history. La logica TS distingue per disciplina.
ALTER TABLE user_profiles
  ADD COLUMN preparing_exam_taichi_id UUID
  REFERENCES exam_programs(id) ON DELETE SET NULL;

-- 3. Aggiornare il trigger handle_new_user per inizializzare plan_mode='exam'
--    (default copre il caso, ma esplicitiamo se l'utente arriva senza esame)
-- (nessun update funzionale al trigger: il DEFAULT vale anche per il trigger)
```

### 10.2 Tipi TS

In `src/lib/types.ts`:

```typescript
export type PlanMode = 'exam' | 'custom'

export type UserProfile = {
  // ... campi esistenti dopo Sprint 1.5 ...
  planMode: PlanMode
  preparingExamId: string | null            // Shaolin (storica colonna)
  preparingExamTaichiId: string | null      // T'ai Chi (nuova)
}
```

### 10.3 Trigger compatibilità

Il trigger `handle_new_user` di Sprint 1.5 non scrive `plan_mode` né `preparing_exam_*` — il `DEFAULT 'exam'` SQL copre automaticamente. Onboarding scrive entrambi al termine del flusso.

---

## 11. STRUTTURA CARTELLE

```
src/
├── app/(app)/
│   ├── library/
│   │   └── program/
│   │       └── page.tsx                          # Vista Programma completo
│   ├── plan/
│   │   ├── exam/
│   │   │   └── page.tsx                          # Selezione esame
│   │   └── custom/
│   │       └── page.tsx                          # Selezione libera checkbox
│   ├── profile/
│   │   └── page.tsx                              # MOD: aggiunge sezione PlanModeSection
│   └── today/
│       └── page.tsx                              # MOD: empty state se custom + 0 skill
├── components/
│   ├── library/
│   │   ├── ProgramView.tsx                       # Toggle disciplina + render gradi
│   │   ├── GradeSection.tsx                      # Sezione singolo grado
│   │   ├── ProgramSkillRow.tsx                   # Riga skill con stato pallino
│   │   └── LockedToast.tsx                       # Toast sblocco grado futuro
│   ├── plan/
│   │   ├── PlanModeSwitchModal.tsx               # Modale conferma cambio
│   │   ├── ExamSelector.tsx                      # Doppio dropdown esami
│   │   ├── SkillCheckList.tsx                    # Container selezione libera
│   │   ├── SkillCheckRow.tsx                     # Riga singola con checkbox
│   │   ├── GradeQuickSelect.tsx                  # Chip "X° Chi (N)"
│   │   └── SelectedCounter.tsx                   # Contatore + salva sticky
│   ├── profile/
│   │   └── PlanModeSection.tsx                   # Sezione "Piano di pratica"
│   └── today/
│       ├── SkillStatusMenu.tsx                   # Menu cambio stato
│       └── TodayEmptyState.tsx                   # Empty state custom + 0 skill
└── lib/
    ├── actions/
    │   └── plan.ts                               # MOD: aggiunge activateExamMode,
    │                                             # switchToCustomMode, saveCustomSelection,
    │                                             # updatePlanItemStatus, hidePlanItem
    ├── queries/
    │   └── plan.ts                               # MOD: query per modalità + counts
    └── plan-manager.ts                           # MOD: aggiunge generatePlanItemsForBothDisciplines
```

---

## 12. NAVIGAZIONE LIBRERIA AGGIORNATA

```
LIBRERIA
│
├── Toggle disciplina: [ Shaolin ] [ T'ai Chi ]    (Sprint 1.5)
│
├── Sotto-vista: [ Mio livello ] [ Per esame ] [ Tutto ] [ Programma ]
│   ↑ già esistenti                                ↑ nuovo
```

URL pattern:
- `/library?d=shaolin` → "Mio livello"
- `/library/exam/[examId]?d=shaolin`
- `/library/all?d=shaolin`
- `/library/program?d=shaolin` ← nuovo

---

## 13. TASK ATOMICI

| # | Task | Deliverable | Tipo agent | Acceptance criteria |
|---|------|-------------|------------|---------------------|
| 1 | Migration plan_mode | `supabase/migrations/0005_plan_mode.sql` | general-purpose | `\d user_profiles` mostra `plan_mode TEXT DEFAULT 'exam'` e `preparing_exam_taichi_id UUID`. CHECK constraint attivo. `supabase db reset` passa |
| 2 | Update tipi TS | `src/lib/types.ts` aggiornato con `PlanMode`, nuovi campi UserProfile | general-purpose | `npm run build` passa |
| 3 | Server Actions modalità | `lib/actions/plan.ts` con `activateExamMode`, `switchToCustomMode`, `saveCustomSelection`, `updatePlanItemStatus`, `hidePlanItem` | general-purpose | Ogni action atomica (transazione), revalida `/today` e `/profile`, RLS rispettata |
| 4 | Queries supporto | `lib/queries/plan.ts` con `getUserPlanCount(userId, source?)`, `getCurrentPlanMode(userId)`, `getSelectedSkillIds(userId, source)` | general-purpose | Tipi corretti, build passa |
| 5 | ProgramView (libreria) | `library/program/page.tsx` + `ProgramView`, `GradeSection`, `ProgramSkillRow`, `LockedToast` | frontend-design | Toggle disciplina via URL; gradi sbloccati tappabili; gradi futuri grigi+lucchetto con toast on tap; pallino stato per skill nel piano |
| 6 | Aggiornare BottomNav/Library tabs | `library/page.tsx` o `library/layout.tsx`: aggiungere link "Programma" alla nav sotto-viste | frontend-design | Tab "Programma" visibile, navigation attiva, search param disciplina propagato |
| 7 | PlanModeSection nel profilo | `components/profile/PlanModeSection.tsx` + integrazione in `profile/page.tsx` | frontend-design | Mostra modalità attuale, esame/i preparato/i, count skill nel piano, due bottoni azione |
| 8 | PlanModeSwitchModal | `components/plan/PlanModeSwitchModal.tsx` + Server Actions hook | frontend-design | Modale shadcn Dialog, copy chiara su cosa viene eliminato/preservato, conferma → Server Action → redirect |
| 9 | ExamSelector (modalità A) | `app/(app)/plan/exam/page.tsx` + `ExamSelector.tsx` | frontend-design | Doppio dropdown, mostra solo prossimo grado per disciplina, opzione "nessun esame", T'ai Chi nascosto se livello=0, submit → `activateExamMode` |
| 10 | SkillCheckList (modalità B) | `app/(app)/plan/custom/page.tsx` + `SkillCheckList`, `SkillCheckRow`, `GradeQuickSelect`, `SelectedCounter` | frontend-design | Toggle disciplina, raggruppamento per categoria, chip per grado tri-state (selected/partial/unselected), contatore sticky, bottone salva disabilitato se 0 |
| 11 | SkillStatusMenu in Today | `today/SkillStatusMenu.tsx` + bottone `⋮` su `TodaySkillCard` | frontend-design | Menu Sheet/Popover shadcn, opzioni focus/review/maintenance + nascondi, conferma → Server Action |
| 12 | TodayEmptyState | `today/TodayEmptyState.tsx` + branch in `today/page.tsx` | frontend-design | Se `plan_mode='custom'` e 0 skill → card "Nessuna forma selezionata. [Apri selezione]" link a `/plan/custom` |
| 13 | Onboarding scrive plan_mode | Aggiornare `lib/actions/onboarding.ts` per scrivere `plan_mode = exam_id ? 'exam' : 'custom'` | general-purpose | Test: utente che salta esame in onboarding → arriva su Today con TodayEmptyState (non con errore) |
| 14 | Verifica end-to-end | Walk-through manuale dei 5 flussi del prompt §5 | general-purpose | Tutti e 5 i flussi completati senza errori; build + lint verdi; nessuna regressione su Today/Library esistenti |

### 13.1 Dipendenze critiche

- 2 dipende da 1
- 3, 4 dipendono da 2
- 5-12 dipendono da 3, 4
- 13 dipende da 3 (action `activateExamMode`)
- 14 dipende da tutti

---

## 14. COSA NON FARE

| Cosa | Perché NO |
|------|-----------|
| Mescolare modalità esame + custom | Mutua esclusività hard (P6). Una sola colonna `plan_mode` |
| Selezione stato (focus/review/maint.) nella schermata checkbox | Tutto parte come `review`. Cambio successivo da Today (P8) |
| Drag-and-drop riordino | YAGNI mobile, da rivalutare se utenti accumulano molti focus (P14) |
| Filtri avanzati (per arma, per practice_mode) | Categoria basta (P15) |
| Cancellare `practice_logs` al cambio modalità | Mai. Storico pratica è sacro |
| `IntersectionObserver` per ProgramView lunga | YAGNI. ~137 skill in lista lunga ma raggruppate caricano in <100ms |
| Long-press per il menu cambio stato | Discoverability scarsa, collide con context menu mobili (P10) |
| Vista Programma con bottone "aggiungi al piano" | Vista è di sola consultazione (§5.4) |

---

## 15. RISCHI E MITIGAZIONI

| Rischio | Mitigazione |
|---------|-------------|
| `saveCustomSelection` con set molto grandi (utente spunta tutto = ~80 skill) | Diff add/remove invece di delete-all+insert. Test con 100+ skill simulate |
| Switch modalità in transazione fallita lascia stato inconsistente (es. `plan_mode='exam'` ma 0 plan_items) | Tutte le Server Actions §8.3-8.4 dentro una transazione esplicita Supabase. Se fallisce, ROLLBACK automatico |
| Conflitto onboarding × switch modalità: utente esce da onboarding senza esame → atterra su Today vuoto senza capire perché | TodayEmptyState (task 12) gestisce esplicitamente `plan_mode='custom' AND count=0` con CTA chiara |
| Vista Programma confonde l'utente fra "skill introdotte a quel grado" (P3) e "skill richieste all'esame" (cumulativo, vista "Per esame") | Header sezione molto chiari: "Da X° a Y° Chi" + sottotitolo "[N skill nuove]". Nessuna ambiguità |
| Dropdown esame mostra opzioni inesistenti se utente è già al massimo (`assigned_level=-7`) | Branch UI: se `next_grade_value` non ha programma → mostra "Hai raggiunto il massimo grado disponibile" |
| Bottone `⋮` su card Today aumenta il rumore visivo | Usare `Subtle/Ghost` button shadcn, dimensioni 32px, opacità ridotta, hover solo |
| Chip "X° Chi (N)" raggrupperebbe male in T'ai Chi (parte da 5) | Helper centralizza la lista gradi accessibili per disciplina. Chip generati da quella lista, non hardcoded |
| `preparing_exam_taichi_id` nuova colonna ma `preparing_exam_id` resta come "Shaolin" (P11) | Documentare in `skill-practice/CLAUDE.md` che `preparing_exam_id == Shaolin per convenzione`. Considerare rename in Sprint 2 quando aggiungiamo migration cleanup |

---

## 16. DEFINITION OF DONE

Lo Sprint 1.7 è chiuso quando:

1. Migration 0005 applicata, `plan_mode` e `preparing_exam_taichi_id` esistono e funzionano con i default
2. `/library/program?d=shaolin` mostra l'intero curriculum, gradi futuri grigi+lucchetto, pallini stato sulle skill nel piano
3. Profilo mostra sezione "Piano di pratica" con modalità attiva, esame/i, count
4. Switch modalità funziona con conferma e copy esplicita su cosa viene eliminato
5. `/plan/exam` permette di scegliere prossimo grado Shaolin/T'ai Chi e attivare programma
6. `/plan/custom` mostra checkbox per skill accessibili, raggruppate per categoria, con chip grado, contatore e salvataggio
7. `last_practiced_at` preservato fra salvataggi successivi della selezione libera
8. Today empty state appare se `plan_mode='custom'` e 0 skill
9. Bottone `⋮` su skill card Today apre menu cambio stato funzionante
10. Tutti i 5 flussi del prompt §5 percorribili end-to-end
11. `npm run lint && npm run build` passano
12. `practice_logs` non toccati al cambio modalità o alla riselezione (verifica con count prima/dopo)
13. RLS continua a impedire accesso cross-user (verifica con secondo utente di test)
14. Aggiornare `current-plan.md` come da §17

---

## 17. AGGIORNAMENTI A `current-plan.md` DOPO QUESTO SPRINT

- §4.2: aggiungere campi `planMode`, `preparingExamTaichiId` su `UserProfile`
- §5: aggiungere cartelle `app/(app)/plan/`, `app/(app)/library/program/`, `components/plan/`
- §6.2: aggiungere riferimento alla modalità custom (`source = 'manual'`) come prima cittadinanza, non più "edge case"
- §7.3 Tab Libreria: aggiornare con quarta sotto-vista "Programma"
- §7.4 Tab Profilo: aggiornare wireframe con sezione "Piano di pratica"
- §9 Sprint 1: aggiungere riga "1.7 — UX Programma + Modalità + Selezione ✅"
- §17.5 Runbook: aggiungere "Reset piano utente" via cambio modalità custom→exam

---

## 18. RIASSUNTO ESECUTIVO

**Cosa fai:**
1. Quarta sotto-vista "Programma" nella libreria — tutto il curriculum FESK, futuri in grigio
2. Sezione "Piano di pratica" nel profilo con scelta esplicita modalità (Esame / Libera)
3. Schermata checkbox per la selezione libera, con chip per grado e contatore
4. Menu cambio stato su ogni skill card di Today (bottone `⋮`)
5. Migration: aggiunge `plan_mode` e `preparing_exam_taichi_id`

**Quando:** dopo Sprint 1.5 FESK (richiede schema/seed). Sprint 1.6 VideoPlayer non blocca.

**Costo stimato:** 2-3 giorni di lavoro per agent. La parte UI è il grosso (5 schermate nuove + 9 componenti).

**Beneficio:** rende esplicita e gestibile la **scelta centrale** dell'app (cosa pratico oggi). Senza questo, il modello focus/review/maintenance non è veramente controllabile dall'utente.

**Cosa NON fai:** drag-and-drop, filtri avanzati, mix modalità, eliminazione log storici, custom controls per video, sblocco "trial" dei gradi futuri.

**Da fare prima di considerare chiuso:** percorrere i 5 flussi end-to-end, verificare conservazione `practice_logs` e `last_practiced_at`, aggiornare `current-plan.md` come da §17.
