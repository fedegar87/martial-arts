---
status: design-approved
date: 2026-05-11
supersedes: niente
related:
  - skill-practice/supabase/migrations/0022_progress_aggregates.sql
  - skill-practice/supabase/migrations/0021_practice_logs_unique.sql
---

# Top contenuti più praticati in `/progress`

## Problema

Mancano insight retrospettivi per-skill. L'utente non ha modo di leggere "quali contenuti del mio repertorio sto praticando di più nella vita". Il dato è già nel DB (`practice_logs`) ma non è esposto.

## Decisione

Aggiungere una quarta sezione in `/progress`: **"I contenuti più praticati"**, classifica top 5 per giorni distinti di pratica.

- Nessun nuovo contatore persistito: aggregazione derivata da `practice_logs`
- Stesso filtro "meaningful log" già usato in 0022: `completed = true OR reps_done > 0`
- Conteggio = giorni distinti (l'unique constraint `practice_logs_user_skill_date_key` garantisce 1 log/giorno/skill, quindi `COUNT(*) ≡ COUNT(DISTINCT date)`)
- Nessun filtro per categoria (forme + tui_fa + chi_kung + ... tutto pratica vera)
- Label: "I contenuti più praticati" (non "le forme più praticate", per onestà semantica)

## Non-obiettivi (esplicito)

- Contatore lifetime di ripetizioni fisiche (`SUM(reps_done)`) — non chiesto
- Contatore esposto sulla skill-detail page — rimandato
- Filtri temporali (lifetime / 30g / mese)
- Filtri per categoria / disciplina sulla Top
- Visualizzazione a barre proporzionali, ranking 1°/2°/3°, badge
- Aggregato in `/today` o `/hub`
- Modifiche al modello dati: zero (no migration su tabelle, solo nuova funzione)

## Architettura

### Data layer — RPC SQL

Migration: `skill-practice/supabase/migrations/0025_top_practiced_skills.sql`

```sql
CREATE OR REPLACE FUNCTION public.top_practiced_skills(
  p_user_id UUID,
  p_limit   INT DEFAULT 5
)
RETURNS TABLE (
  skill_id              UUID,
  skill_name            TEXT,
  skill_name_italian    TEXT,
  discipline            discipline,
  category              skill_category,
  practice_days         INT,
  last_practiced_date   DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id              AS skill_id,
    s.name            AS skill_name,
    s.name_italian    AS skill_name_italian,
    s.discipline,
    s.category,
    COUNT(*)::INT     AS practice_days,
    MAX(pl.date)      AS last_practiced_date
  FROM practice_logs pl
  INNER JOIN skills s ON s.id = pl.skill_id
  WHERE pl.user_id = p_user_id
    AND (pl.completed = true OR pl.reps_done > 0)
  GROUP BY s.id, s.name, s.name_italian, s.discipline, s.category
  ORDER BY practice_days DESC, last_practiced_date DESC, s.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5), 50));
$$;

GRANT EXECUTE ON FUNCTION public.top_practiced_skills(UUID, INT) TO authenticated;
```

Note:
- `SECURITY INVOKER` → rispetta RLS su `practice_logs` (coerente con 0022)
- Tie-break a 3 livelli: `practice_days DESC → last_practiced_date DESC → name ASC` per determinismo
- Clamp `LIMIT` fra 1 e 50 contro chiamate accidentali con valori fuori range
- Indice esistente `(user_id, skill_id, date)` da 0021 supporta nativamente `WHERE user_id=X GROUP BY skill_id`
- Workflow DB: la migration NON viene applicata via CLI. SQL copia-incolla per il SQL Editor Supabase

### Query layer

File: estende `skill-practice/src/lib/queries/progress.ts`

```ts
import type { Discipline, SkillCategory } from "@/lib/types";

export type TopPracticedSkill = {
  skillId: string;
  skillName: string;
  skillNameItalian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practiceDays: number;
  lastPracticedDate: string;
};

type TopPracticedSkillRow = {
  skill_id: string;
  skill_name: string;
  skill_name_italian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practice_days: number;
  last_practiced_date: string;
};

export async function getTopPracticedSkills(
  userId: string,
  limit = 5,
): Promise<TopPracticedSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("top_practiced_skills", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Errore in top_practiced_skills: ${error.message}`);
  }

  return ((data ?? []) as TopPracticedSkillRow[]).map((row) => ({
    skillId: row.skill_id,
    skillName: row.skill_name,
    skillNameItalian: row.skill_name_italian,
    discipline: row.discipline,
    category: row.category,
    practiceDays: row.practice_days,
    lastPracticedDate: row.last_practiced_date,
  }));
}
```

Riusa `Discipline` e `SkillCategory` già esportati da `src/lib/types.ts`. Tipo della row RPC esplicito per evitare `any`/inferenza unsafe.

### UI layer

Pattern: stesso split usato dalle altre sezioni di `/progress` — `Section.tsx` server + componente presentazionale puro.

**File nuovo 1**: `skill-practice/src/components/progress/sections/TopPracticedSection.tsx`

```tsx
import "server-only";
import { getTopPracticedSkills } from "@/lib/queries/progress";
import { TopPracticedList } from "@/components/progress/TopPracticedList";

export async function TopPracticedSection({ userId }: { userId: string }) {
  const items = await getTopPracticedSkills(userId, 5);
  if (items.length === 0) return null;
  return <TopPracticedList items={items} />;
}
```

**File nuovo 2**: `skill-practice/src/components/progress/TopPracticedList.tsx`

```tsx
import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { TopPracticedSkill } from "@/lib/queries/progress";

type Props = { items: TopPracticedSkill[] };

export function TopPracticedList({ items }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={ListOrdered}
        title="I contenuti più praticati"
        right={<span className="text-xs text-muted-foreground">da sempre</span>}
      />
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.skillId}>
            <Link
              href={`/skill/${item.skillId}`}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{item.skillName}</span>
                {item.skillNameItalian && (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.skillNameItalian}
                  </span>
                )}
              </span>
              <Badge variant="secondary" className="shrink-0">
                {item.practiceDays} {item.practiceDays === 1 ? "giorno" : "giorni"}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Decisioni UX:
- Shell `<section>` + `SectionHeader` come le altre sezioni progress (non Card)
- Nome primario = `skillName` (tecnico/cinese), secondario = `skillNameItalian` su seconda riga muted — coerente con library e skill-detail
- Right slot "da sempre" per chiarire ambito temporale lifetime
- Niente ranking visibile, niente barre proporzionali (no gamification, piano §10)
- Empty state = `return null`: le altre sezioni già coprono assenza di pratica
- Click su riga → `/skill/{skillId}` (riusa skill-detail esistente)
- Pluralizzazione inline `giorno` / `giorni`

### Integrazione pagina

`skill-practice/src/app/(app)/progress/page.tsx` — aggiunge quarta `Suspense` block in coda:

```tsx
<Suspense fallback={<ProgressSectionSkeleton heightClass="h-56" />}>
  <TopPracticedSection userId={profile.id} />
</Suspense>
```

Ordine finale `/progress` (zoom temporale da "adesso" a "lifetime"):

1. `ActiveCycleSection` — ciclo attivo
2. `GeneralProgressSection` — streak + totale
3. `PracticeCalendarSection` — ultimi 90 giorni
4. `TopPracticedSection` — lifetime per-skill ← nuova

## Verifica

### Tecnica
- `npm run lint && npm run build` in `skill-practice/` passa
- Migration `0025_top_practiced_skills.sql` applicata manualmente nel SQL Editor Supabase
- Smoke test SQL: `select * from top_practiced_skills('<user-uuid>', 5);` ritorna ≤ 5 righe ordinate per `practice_days DESC`

### Accettazione (manuale, da `/progress` dopo login)
- Reale verifica RLS: il SQL Editor può girare con privilegi diversi dal client app, l'accettazione effettiva è da UI
- Utente con 0 log → la sezione non appare
- Utente con log → top 5 ordinata correttamente
- Click su una riga → apre `/skill/{id}`
- Nome cinese in primo piano, italiano sotto in muted
- Mobile: nomi lunghi non rompono il layout (truncate)

## Aggiornamento `current-plan.md`

Solo §11 (stato): annotare presenza della sezione "Top contenuti praticati" in `/progress` con riferimento a 0025. Non toccare §4 (modello dati invariato) né §5 (struttura cartelle: nuovi file dentro `progress/sections/` e `progress/` seguono convenzione esistente).
