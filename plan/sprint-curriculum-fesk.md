# Sprint 1.5 — Curriculum FESK

**Status:** Implemented in code — richiede applicazione migrations e walkthrough reale
**Versione:** v1
**Ultimo aggiornamento:** 2026-04-25
**Sostituisce:** seed placeholder Wing Chun di `supabase/migrations/0002_seed_school_skills.sql`
**Dipende da:** `plan/current-plan.md` (Sprint 1 completato — schema 0001, seed 0002, auth, today, library, profile in piedi)

---

## 0. CONTESTO IN UNA FRASE

Sostituire i contenuti placeholder Wing Chun con il **curriculum reale FESK** (Federazione Europea Scuola Kung Fu "Fong Ttai", Maestro Bestetti / lignaggio Chang Dsu Yao) e adeguare modello dati e UI per supportare **due discipline parallele** (Shaolin + T'ai Chi) e **gradi negativi** (Chi → Chieh → Mezza Luna).

**Riferimento esterno:** https://www.feskfongttai.it/il-kung-fu/il-programma-d-insegnamento

---

## 1. POSIZIONAMENTO RISPETTO AL PIANO

Questo documento è un'**evoluzione di contenuto + adeguamento schema**, non una nuova architettura. Tutti i vincoli di `current-plan.md` restano validi:

- Stack §3 invariato (Next.js + Supabase + YouTube embed)
- Struttura cartelle §5 invariata
- Esclusioni hard §10 invariate (no upload video, no admin UI ora, no AI)
- RLS §14.3 invariata (le ALTER TABLE non toccano le policy esistenti)

**Cosa cambia:** colonne aggiuntive, due nuovi enum, dati seed completamente nuovi, e quattro pagine UI esistenti adeguate (onboarding, today, library, skill detail).

**Cosa NON cambia:**
- Algoritmo focus/review/maintenance (`practice-logic.ts`) — solo input filtrato per disciplina
- Server Actions `actions/practice.ts` e `actions/plan.ts`
- Auth flow / middleware
- PWA setup / security headers / deploy

---

## 2. DECISIONI CHIUSE

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| **C1** | Convenzione numerica per i gradi | **Lineare decrescente** — Chi positivi (8 → 1), Chieh negativi (-1 → -5), Mezza Luna (-6 → -7). Permette query `WHERE minimum_grade_value >= user.assigned_level_X`. T'ai Chi parte da 5, Shaolin da 8. Valore `0` riservato a "T'ai Chi non iniziato". |
| **C2** | Cumulatività esami | Programma del grado X = **tutte le skill** con `minimum_grade_value >= X` per quella disciplina. Default status assegnato in seed con regola C3. |
| **C3** | Default status nelle exam_skill_requirements | Skill introdotte **a questo grado** (`min_grade_value == X`) → `focus`. Skill del grado **immediatamente precedente** (`min_grade_value == X+1`) → `review`. Skill di **gradi più vecchi** (`min_grade_value > X+1`) → `maintenance`. |
| **C4** | Practice mode "both" in schermata Oggi | La skill viene proposta ogni volta come "ripassa la forma (Lu) da solo" — l'applicazione (Tao) è una nota informativa, non blocca il "Fatto". |
| **C5** | Practice mode "paired" in schermata Oggi | Skill mostrata comunque, con nota "👥 richiede partner — ripassa mentalmente". Bottone "Fatto" comunque attivo (l'utente decide se conta). |
| **C6** | Schools con due discipline | **Una sola row** in `schools` ("FESK"). Le discipline sono colonne sulle skill, non scuole separate. |
| **C7** | Migration strategy | **Additiva** — niente DROP TABLE. Nuove migration 0003 (schema evolve) e 0004 (seed FESK). 0002 viene **svuotato** (commento o file vuoto), non rimosso, per non rompere la cronologia migration. |
| **C8** | Traduzioni italiane | Le traduzioni in §3 del prompt sorgente sono **proposte**. Verranno revisionate dal fondatore in un secondo momento. Nel seed iniziale si usano quelle proposte. |
| **C9** | Naming nuovo enum vs ALTER TYPE | Postgres non permette di rimuovere valori da un enum. Quindi `skill_category` viene **droppato e ricreato** dentro la stessa transaction (le righe esistenti del seed Wing Chun saranno già state svuotate prima). |

---

## 3. DECISIONI APERTE

| # | Decisione | Note | Priorità |
|---|-----------|------|----------|
| **C10** | Soglia "review → maintenance" oltre il grado attuale | Dopo aver superato un grado, le skill del grado precedente diventano `review` o `maintenance`? Per ora regola C3 si applica solo alla **generazione iniziale** del piano. Dopo, l'utente le sposta a mano. | 🟢 Sprint 2 (collegato a D6) |
| **C11** | Visualizzazione gradi misti (es. 3° Chi Shaolin + 5° Chi T'ai Chi) | Mostrare entrambi sempre nel profilo / nav, o filtrabili? | 🟢 Sprint 2 |
| **C12** | Cosa fare se l'utente seleziona un esame in una disciplina che non pratica | Bloccare onboarding o permettere upgrade in profilo? | 🟢 Sprint 2 |

---

## 4. CONVENZIONE GRADI (riferimento canonico)

```
Shaolin (parte da 8° Chi):
   8° Chi   = 8     ← principiante (primo esame: 8° → 7°)
   7° Chi   = 7
   6° Chi   = 6
   5° Chi   = 5
   4° Chi   = 4
   3° Chi   = 3
   2° Chi   = 2
   1° Chi   = 1     ← pre-cintura nera
   1° Chieh = -1    ← prima cintura nera
   2° Chieh = -2
   3° Chieh = -3
   4° Chieh = -4
   5° Chieh = -5    ← massimo Chieh
   1° Mezza Luna = -6
   2° Mezza Luna = -7

T'ai Chi (parte da 5° Chi):
   0        = "non iniziato"
   5° Chi   = 5     ← principiante T'ai Chi (primo esame: 5° → 4°)
   ... (stessa logica)

Regola di accesso:
   skill visibile per discipline D  ⇔
   skill.discipline = D
   AND skill.minimum_grade_value >= user.assigned_level_<D>
   (numero più alto = grado più basso = prerequisito più leggero)
```

Helper TS in `lib/grades.ts` (nuovo file):

```typescript
export type Grade = { value: number; label: string }

export const SHAOLIN_GRADES: Grade[] = [
  { value: 8, label: "8° Chi" }, { value: 7, label: "7° Chi" },
  { value: 6, label: "6° Chi" }, { value: 5, label: "5° Chi" },
  { value: 4, label: "4° Chi" }, { value: 3, label: "3° Chi" },
  { value: 2, label: "2° Chi" }, { value: 1, label: "1° Chi" },
  { value: -1, label: "1° Chieh" }, { value: -2, label: "2° Chieh" },
  { value: -3, label: "3° Chieh" }, { value: -4, label: "4° Chieh" },
  { value: -5, label: "5° Chieh" },
  { value: -6, label: "1° Mezza Luna" }, { value: -7, label: "2° Mezza Luna" },
]

export const TAICHI_GRADES: Grade[] = [
  { value: 0, label: "Non praticato" },
  ...SHAOLIN_GRADES.filter((g) => g.value <= 5),
]

export function gradeLabel(value: number): string {
  return SHAOLIN_GRADES.find((g) => g.value === value)?.label ?? `${value}`
}
```

---

## 5. MODIFICHE AL MODELLO DATI

### 5.1 Nuovi enum

```sql
CREATE TYPE discipline AS ENUM ('shaolin', 'taichi');
CREATE TYPE practice_mode AS ENUM ('solo', 'paired', 'both');
```

### 5.2 Sostituzione `skill_category`

L'enum esistente non copre le categorie FESK. Sostituzione completa (Postgres non rimuove valori da un enum):

```sql
ALTER TABLE skills ALTER COLUMN category TYPE TEXT USING category::text;
DROP TYPE skill_category;
CREATE TYPE skill_category AS ENUM (
  'forme',
  'tui_fa',
  'po_chi',
  'chin_na',
  'armi_forma',
  'armi_combattimento',
  'tue_shou',
  'ta_lu',
  'chi_kung',
  'preparatori'
);
ALTER TABLE skills ALTER COLUMN category TYPE skill_category USING category::skill_category;
```

> ⚠️ Da eseguire **dopo** aver svuotato il seed Wing Chun (vedi §6 task 1).

### 5.3 Nuove colonne `skills`

```sql
ALTER TABLE skills
  ADD COLUMN name_italian   TEXT,
  ADD COLUMN discipline     discipline NOT NULL DEFAULT 'shaolin',
  ADD COLUMN practice_mode  practice_mode NOT NULL DEFAULT 'solo';

ALTER TABLE skills RENAME COLUMN minimum_level TO minimum_grade_value;

CREATE INDEX idx_skills_discipline ON skills(discipline);
DROP INDEX idx_skills_minimum_level;
CREATE INDEX idx_skills_min_grade ON skills(minimum_grade_value);
```

### 5.4 Nuove colonne `exam_programs`

```sql
ALTER TABLE exam_programs
  ADD COLUMN discipline  discipline NOT NULL DEFAULT 'shaolin',
  ADD COLUMN grade_from  TEXT,
  ADD COLUMN grade_to    TEXT;

ALTER TABLE exam_programs RENAME COLUMN level_number TO grade_value;

ALTER TABLE exam_programs DROP CONSTRAINT exam_programs_school_id_level_number_key;
ALTER TABLE exam_programs
  ADD CONSTRAINT exam_programs_school_discipline_grade_key
  UNIQUE (school_id, discipline, grade_value);
```

### 5.5 Doppio livello in `user_profiles`

```sql
ALTER TABLE user_profiles
  ADD COLUMN assigned_level_shaolin INT NOT NULL DEFAULT 8,
  ADD COLUMN assigned_level_taichi  INT NOT NULL DEFAULT 0;

ALTER TABLE user_profiles DROP COLUMN assigned_level;
```

Aggiornare il trigger `handle_new_user` per inizializzare entrambi i livelli (8 / 0):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE default_school_id UUID;
BEGIN
  SELECT id INTO default_school_id FROM public.schools LIMIT 1;
  INSERT INTO public.user_profiles
    (id, school_id, display_name, assigned_level_shaolin, assigned_level_taichi)
  VALUES (
    NEW.id, default_school_id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    8, 0
  );
  RETURN NEW;
END;
$$;
```

### 5.6 Tipi TypeScript aggiornati

In `src/lib/types.ts` sostituire i tipi dominio:

```typescript
export type Discipline = 'shaolin' | 'taichi'
export type PracticeMode = 'solo' | 'paired' | 'both'

export type SkillCategory =
  | 'forme' | 'tui_fa' | 'po_chi' | 'chin_na'
  | 'armi_forma' | 'armi_combattimento'
  | 'tue_shou' | 'ta_lu' | 'chi_kung' | 'preparatori'

export type Skill = {
  id: string
  schoolId: string
  name: string                   // nome cinese
  nameItalian: string | null
  discipline: Discipline
  category: SkillCategory
  practiceMode: PracticeMode
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  teacherNotes: string | null
  estimatedDurationSeconds: number | null
  minimumGradeValue: number
  order: number
  createdAt: Date
}

export type ExamProgram = {
  id: string
  schoolId: string
  discipline: Discipline
  gradeFrom: string
  gradeTo: string
  gradeValue: number
  description: string | null
  skills: ExamSkillRequirement[]
}

export type UserProfile = {
  id: string
  schoolId: string
  displayName: string
  assignedLevelShaolin: number
  assignedLevelTaichi: number      // 0 = non praticato
  preparingExamId: string | null
  role: 'student' | 'instructor' | 'admin'
  createdAt: Date
}
```

> Rigenerare i tipi DB con `supabase gen types typescript --local` dopo la migration.

---

## 6. SEED DATA

> **Fonte canonica risolta:** `plan/curriculum-mapping-fesk.md` contiene la mappatura validata dal fondatore. La migration `0004_seed_fesk.sql` è generata da `skill-practice/scripts/generate-fesk-seed.mjs`.

Vedi §3.1 → §3.9 del prompt sorgente per **l'elenco completo delle ~137 skill**, già strutturato come array TS. Il seed va trasformato in SQL nella migration `0004_seed_fesk.sql`.

### 6.1 Conteggi attesi (acceptance check)

| Sezione | Numero skill |
|---------|--------------|
| Shaolin — Forme | 23 |
| Shaolin — Tui Fa | 23 |
| Shaolin — Po Chi | 15 |
| Shaolin — Chin Na | 6 |
| Shaolin — Armi (forme + combattimenti) | 30 |
| T'ai Chi — Forme + Chi Kung | 15 |
| T'ai Chi — Tue Shou + Ta Lu + Chin Na | 16 |
| T'ai Chi — Armi | 8 |
| Preparatori | 1 |
| **Totale** | **137** |

### 6.2 Generazione exam_programs (regola C2 + C3)

Per ogni `(discipline, grade_value)` in cui esiste almeno una skill:

```sql
-- Esempio: esame Shaolin a 7° Chi (gradeValue = 7)
INSERT INTO exam_programs (school_id, discipline, grade_value, grade_from, grade_to, description)
VALUES ('<fesk_id>', 'shaolin', 7, '8° Chi', '7° Chi', 'Primo esame Shaolin');

-- Junction: tutte le skill shaolin con minimum_grade_value >= 7
INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status)
SELECT
  '<exam_7_id>',
  s.id,
  CASE
    WHEN s.minimum_grade_value = 7 THEN 'focus'
    WHEN s.minimum_grade_value = 8 THEN 'review'
    ELSE 'maintenance'
  END::plan_status
FROM skills s
WHERE s.discipline = 'shaolin' AND s.minimum_grade_value >= 7;
```

Il seed userà CTE/function PL/pgSQL per generare tutti i programmi senza ripetere il pattern. Gradi da generare:

- **Shaolin:** da 7 a -7 (15 esami totali, dato che 8 è il punto di partenza)
- **T'ai Chi:** da 4 a -7 (12 esami, 5 è il punto di partenza)

### 6.3 School row

```sql
INSERT INTO schools (id, name, description) VALUES (
  gen_random_uuid(),
  'FESK — Federazione Europea Scuola Kung Fu "Fong Ttai"',
  'Lignaggio Maestro Chang Dsu Yao, fondata dal Maestro Gianluigi Bestetti.'
);
```

### 6.4 Video URL placeholder

Tutti i `video_url` sono `'https://www.youtube.com/watch?v=PLACEHOLDER'`. `YouTubeEmbed` deve gestire elegantemente l'URL placeholder (mostrare un'immagine grigia con scritta "Video in arrivo" anziché un embed rotto).

---

## 7. MODIFICHE UI

### 7.1 Onboarding (`src/app/(app)/onboarding/page.tsx`)

Aggiungere step:

1. **Nome** (invariato)
2. **Discipline praticate:** checkbox multi `[ ] Shaolin  [ ] T'ai Chi`
3. **Grado attuale:** uno o due dropdown (uno per disciplina selezionata) usando `SHAOLIN_GRADES` / `TAICHI_GRADES` da `lib/grades.ts`
4. **Esame in preparazione:** uno o due dropdown opzionali — mostra solo gradi inferiori (più "alti" tecnicamente) a quello corrente

Server action `actions/onboarding.ts` aggiornata: scrive `assigned_level_shaolin`, `assigned_level_taichi`, e (opz.) `preparing_exam_id`. Se l'utente non seleziona T'ai Chi, `assigned_level_taichi` resta a `0`.

Genera `user_plan_items` solo per la disciplina con esame selezionato (logica `plan-manager.ts` invariata, gira due volte se servono entrambe).

### 7.2 Today (`src/app/(app)/today/page.tsx`)

- Header: mostra grado per disciplina praticata (es. "Shaolin 4° Chi · T'ai Chi 5° Chi")
- Se utente pratica entrambe le discipline: aggiungere **toggle in cima** `[ Shaolin | T'ai Chi | Tutte ]` (default: Tutte)
- `practice-logic.ts` riceve `discipline?: Discipline` come parametro opzionale e filtra l'input prima di applicare focus/review/maintenance
- Le card skill mostrano badge `practice_mode`:
  - `solo` → `🧍 Da solo`
  - `paired` → `👥 Con partner` (+ nota "ripassa mentalmente")
  - `both` → `🧍 Forma + 👥 Applicazione`

### 7.3 Library (`src/app/(app)/library/`)

- **Toggle disciplina in cima:** `[ Shaolin | T'ai Chi ]` (persistito in URL search param `?d=shaolin`)
- Sotto-toggle invariato `[ Mio livello | Per esame | Tutto ]`
- Pagina "Per esame" (`exam/[examId]/page.tsx`): query filtra `discipline = ?` e raggruppa per categoria. Mostra solo i gradi accessibili all'allievo (`grade_value >= user.assigned_level_<discipline>`)
- Pagina "Tutto" (`all/page.tsx`): aggiungere chip filtri categoria — i nuovi nomi categoria (vedi §5.6) richiedono `lib/labels.ts` con mapping `SkillCategory → string italiano`

### 7.4 Skill detail (`src/app/(app)/skill/[skillId]/page.tsx`)

- Mostra `name` (cinese) come titolo principale, `nameItalian` come sottotitolo
- Badge categoria + badge disciplina + badge `practice_mode`
- Se `practice_mode = 'paired'` o `'both'`: avviso "Questa pratica richiede un partner per essere completata"

### 7.5 Profile (`src/app/(app)/profile/page.tsx`)

Mostra:
- Nome
- Grado Shaolin (dropdown editabile, salvataggio via Server Action)
- Grado T'ai Chi (dropdown editabile, "Non praticato" come opzione)
- Esame in preparazione (per ogni disciplina attiva)

### 7.6 BottomNav

Invariato.

### 7.7 Componenti nuovi/modificati

| File | Tipo | Note |
|------|------|------|
| `src/lib/grades.ts` | Nuovo | Helper `SHAOLIN_GRADES`, `TAICHI_GRADES`, `gradeLabel()` |
| `src/lib/labels.ts` | Nuovo | Mapping `SkillCategory → label IT`, `Discipline → label IT`, `PracticeMode → label IT` |
| `src/components/skill/PracticeModeBadge.tsx` | Nuovo | Badge `🧍 / 👥 / 🧍👥` |
| `src/components/skill/DisciplineBadge.tsx` | Nuovo | Badge Shaolin / T'ai Chi |
| `src/components/library/DisciplineToggle.tsx` | Nuovo | Toggle in URL search param |
| `src/components/onboarding/DisciplineSelector.tsx` | Nuovo | Multi-checkbox discipline |
| `src/components/profile/GradeEditor.tsx` | Nuovo | Dropdown grado per disciplina |
| `src/lib/practice-logic.ts` | Modifica | Aggiunge parametro `discipline?: Discipline` |
| `src/lib/queries/skills.ts` | Modifica | Filtri per `discipline` e `minimum_grade_value` |
| `src/lib/queries/plan.ts` | Modifica | Idem |
| `src/lib/plan-manager.ts` | Modifica | Genera per disciplina specifica |
| `src/lib/actions/onboarding.ts` | Modifica | Scrive doppio livello |
| `src/components/today/TodaySkillCard.tsx` | Modifica | Aggiunge badge mode + nota partner |
| `src/components/skill/YouTubeEmbed.tsx` | Modifica | Placeholder grafico per `PLACEHOLDER` URL |

---

## 8. NAVIGAZIONE LIBRERIA — schema

```
LIBRERIA
│
├── Toggle: [ Shaolin ] [ T'ai Chi ]
│
├── Sotto-vista: [ Il mio livello ] [ Per esame ] [ Tutto ]
│
│   "Il mio livello" (default):
│   └── Skill della disciplina con minimum_grade_value >= user.assigned_level_<d>
│
│   "Per esame":
│   ├── Lista esami della disciplina (solo gradi accessibili)
│   └── Tap esame → skill richieste, raggruppate per categoria
│
│   "Tutto":
│   ├── Filtro categoria (chip)
│   └── Lista completa skill della disciplina
```

---

## 9. TASK ATOMICI

Eseguibili da sub-agent in ordine. Ogni task ha acceptance criteria espliciti.

| # | Task | Deliverable | Tipo agent | Acceptance criteria |
|---|------|-------------|------------|---------------------|
| 1 | Svuotare seed Wing Chun | `supabase/migrations/0002_seed_school_skills.sql` ridotto a commento "-- Sostituito da 0004_seed_fesk.sql" | general-purpose | `supabase db reset` esegue senza errori, tabelle vuote |
| 2 | Migration schema evolve | `supabase/migrations/0003_schema_evolve_fesk.sql` con tutto §5.1-§5.5 | general-purpose | `supabase db reset` passa, `\d skills` mostra `discipline`, `practice_mode`, `name_italian`, `minimum_grade_value` |
| 3 | Update tipi TS + helpers gradi/labels | `src/lib/types.ts`, `src/lib/grades.ts`, `src/lib/labels.ts` | general-purpose | `npm run build` passa con tipi nuovi |
| 4 | Migration seed FESK | `supabase/migrations/0004_seed_fesk.sql` con school + 137 skill + exam_programs + exam_skill_requirements | general-purpose | Query `SELECT count(*) FROM skills` = 137; `SELECT count(*) FROM exam_programs WHERE discipline='shaolin'` = 15; `SELECT count(*) FROM exam_programs WHERE discipline='taichi'` = 12 |
| 5 | YouTubeEmbed placeholder graphics | `src/components/skill/YouTubeEmbed.tsx` rileva `PLACEHOLDER` e mostra fallback | general-purpose | URL placeholder rende riquadro "Video in arrivo", URL reale rende embed normale |
| 6 | Badge components | `PracticeModeBadge.tsx`, `DisciplineBadge.tsx` | frontend-design | Render in tutte e 3 le varianti, accessibili (aria-label) |
| 7 | practice-logic update | `src/lib/practice-logic.ts` con parametro `discipline?` + test | general-purpose | Test: input misto Shaolin+T'ai Chi → output filtrato correttamente quando `discipline` passato |
| 8 | queries update | `src/lib/queries/skills.ts`, `plan.ts` con filtro `discipline` e nuova colonna `minimum_grade_value` | general-purpose | Tipi corretti, build passa, RLS rispettata |
| 9 | plan-manager update | `src/lib/plan-manager.ts` accetta `discipline` e genera plan per quella disciplina | general-purpose | Test: input esame T'ai Chi → user_plan_items solo per skill T'ai Chi |
| 10 | Onboarding multi-disciplina | `src/app/(app)/onboarding/page.tsx` + `DisciplineSelector.tsx` + `actions/onboarding.ts` | frontend-design | Flusso a 4 step, scrive `assigned_level_shaolin`, `assigned_level_taichi`, eventuale `preparing_exam_id`, redirect a `/today` |
| 11 | Profile editor gradi | `src/app/(app)/profile/page.tsx` + `GradeEditor.tsx` + Server Action update | frontend-design | Cambio grado salvato in DB, opzione "Non praticato" per T'ai Chi visibile |
| 12 | Today con toggle disciplina | `today/page.tsx` + `today/DisciplineFilter.tsx` (se utente pratica entrambe) | frontend-design | Header mostra grado Shaolin + T'ai Chi; toggle filtra le skill mostrate; badge mode visibili |
| 13 | Library con toggle disciplina | `library/page.tsx`, `library/exam/[examId]/page.tsx`, `library/all/page.tsx` + `DisciplineToggle.tsx` | frontend-design | Toggle in URL `?d=shaolin/taichi`; "Per esame" mostra solo gradi accessibili; "Tutto" raggruppa per categoria con chip filtro |
| 14 | Skill detail aggiornato | `skill/[skillId]/page.tsx` mostra nome cinese + IT, badge categoria/disciplina/mode, nota partner se applicabile | frontend-design | Render corretto su skill `solo`, `paired`, `both` |
| 15 | Verifica end-to-end | Walk-through manuale: signup → onboarding entrambe le discipline → today → library Shaolin → skill detail → "Aggiungi al piano" → today aggiornato → "Fatto" | general-purpose | Nessun errore console, nessun 500, RLS non bloccante; `npm run lint && npm run build` passa |

### 9.1 Dipendenze critiche

- 3 dipende da 2 (tipi richiedono schema)
- 4 dipende da 2 e 1 (seed richiede schema nuovo e tabelle vuote)
- 7-9 dipendono da 3 (logica usa nuovi tipi)
- 10-14 dipendono da 4-9 (UI legge dati reali)
- 15 dipende da tutti

---

## 10. ESCLUSIONI HARD (per questo sprint)

| Cosa | Perché NO |
|------|-----------|
| Pannello admin per gestire skill | Resta Sprint 3 — qui si tocca solo seed SQL |
| Caricamento video YouTube reali | Il fondatore li sostituirà uno alla volta dopo lo sprint |
| Sistema tag custom oltre `category` | Non richiesto dal curriculum FESK |
| Internazionalizzazione (EN, ZH) | Solo IT + nomi cinesi traslitterati nel campo `name` |
| Animazioni transizione disciplina | YAGNI |
| Calendario esami / countdown multi-disciplina | Sprint 2 (D6) |
| SRS reale | Sprint 3 (D5) — invariato |
| Bacheca news | Sprint 2 — invariato |
| Migrazione dati utenti esistenti dal vecchio schema | MVP single-user pre-utenti reali, basta un reset DB |

---

## 11. RISCHI E MITIGAZIONI

| Rischio | Mitigazione |
|---------|-------------|
| Drop e ricrea `skill_category` rompe row esistenti | Task 1 **deve** precedere Task 2; verificare `SELECT count(*) FROM skills` = 0 prima di Task 2 |
| Trigger `handle_new_user` referenzia colonna `assigned_level` rimossa | Migration 0003 **include** la riscrittura del trigger (vedi §5.5) — non dimenticare |
| 137 skill in singola migration = file SQL grosso (>2k righe) | Generare con script TS che emette SQL, non scrivere a mano. Script in `scripts/generate-fesk-seed.ts`, output committato come migration |
| Traduzioni italiane proposte potrebbero essere imprecise | Marker `-- TODO REVIEW` accanto alle traduzioni più incerte (es. nomi armi); il fondatore le rivedrà prima di mostrare ad altri utenti |
| Utente pratica solo T'ai Chi ma `assigned_level_shaolin = 8` di default | Profilo deve permettere "Non pratico Shaolin" — usare valore sentinel (es. `9`) o aggiungere flag `practices_shaolin BOOLEAN`. **Decisione rinviata a C12.** Per ora si tollera che entrambi i livelli siano sempre valorizzati |
| Library "Tutto" con 137 skill = lista lunga | Filtro categoria è obbligatorio. Considerare ricerca testuale Sprint 2 |

---

## 12. DEFINITION OF DONE

Lo Sprint 1.5 è chiuso quando:

1. Migration 0003 e 0004 applicate, `supabase db reset` passa
2. Conteggi §6.1 verificati via SQL
3. `npm run lint` e `npm run build` passano
4. Walk-through end-to-end (task 15) completato senza errori
5. Schermate `today`, `library`, `skill detail`, `onboarding`, `profile` rispettano §7
6. Badge `practice_mode` e `discipline` visibili dove previsto
7. URL placeholder mostra fallback grazioso, non embed rotto
8. Aggiornati `current-plan.md` (§4 modello dati) e `skill-practice/CLAUDE.md` (sezione "Stato attuale") con il nuovo schema e categorie

---

## 13. AGGIORNAMENTI A `current-plan.md` DOPO QUESTO SPRINT

Modifiche da riportare nel piano principale a chiusura sprint:

- §4.1: aggiornare `Skill`, `ExamProgram`, `SkillCategory` con i nuovi tipi e citare le due discipline
- §4.2: aggiornare `UserProfile` con doppio livello
- §5: aggiungere `lib/grades.ts`, `lib/labels.ts`, componenti badge
- §9 Sprint 1: aggiungere riga "1.5 — Curriculum FESK ✅" come completato
- §12: sostituire seed Wing Chun con riferimento a questo file (`vedi sprint-curriculum-fesk.md §6`)
- §17.5 Runbook: aggiornare istruzioni di insert (con `discipline`, `practice_mode`, `minimum_grade_value`)

---

## 14. RIASSUNTO ESECUTIVO

**Cosa fai:** sostituisci dati placeholder Wing Chun con curriculum FESK reale (137 skill, 27 esami totali tra Shaolin e T'ai Chi) e adegui schema + UI per supportare due discipline parallele e gradi negativi (Chieh, Mezza Luna).

**Quando:** dopo che Sprint 1 di `current-plan.md` è verde (build + walk-through OK).

**Costo stimato:** 1-2 giorni di lavoro per agent ben istruito. La parte SQL è meccanica (script genera 0004), la parte UI è il vero costo (5 schermate da adeguare).

**Cosa NON fai:** admin, video reali, internazionalizzazione, SRS, bacheca, multi-utente reale.

**Da fare prima di considerare chiuso:** verificare conteggi §6.1, walk-through end-to-end, aggiornare `current-plan.md` e `skill-practice/CLAUDE.md` come da §13.
