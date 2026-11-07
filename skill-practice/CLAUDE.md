# Kung Fu Practice - regole di progetto

## Fonte di verità

Il file `../plan/current-plan.md` è la fonte autoritativa per scope, stack, modello dati, struttura cartelle, sprint plan e esclusioni; `../plan/white-label-strategy.md` governa branding, evoluzione multi-scuola/white-label e altre arti marziali (regola zero: niente over-engineering). **Leggili prima di qualsiasi modifica strutturale.**

In caso di conflitto fra questo file e il piano: vince il piano. Aggiorna questo file e segnala la deviazione.

---

## Stack vincolato

Non sostituire questi pezzi senza approvazione esplicita (e aggiornamento del piano §3):

- **Next.js 14+ App Router** + TypeScript strict
- **Tailwind CSS** + **shadcn/ui** — niente altre UI library
- **Supabase** (Auth + Postgres) — no localStorage/IndexedDB come storage primario
- **Service worker statico** in `public/sw.js` (registrato da `ServiceWorkerRegister`) + manifest dinamico in `src/app/manifest.ts` (alimentato da `src/lib/brand.ts`) — niente `next-pwa` (era fermo al Pages Router, mai importato, rimosso)
- **YouTube unlisted embed** — niente upload video, niente signed URL, niente storage video proprio
- **Vercel** per hosting
- **Tema dark/gold FESK** (`globals.css`): niente UI chiare o palette fuori tema senza aggiornare `../plan/reference/design/visual-identity-plan.md`

Se hai dubbi su una libreria nuova: **non aggiungerla**. Chiedi prima.

---

## Struttura cartelle

La struttura canonica è in `../plan/current-plan.md §5`. **Non improvvisare deviazioni.**

Regole d'oro:

| Serve... | Mettilo in... |
|----------|---------------|
| Nuova route protetta | `src/app/(app)/<feature>/page.tsx` |
| Nuova route pubblica | `src/app/(auth)/<name>/page.tsx` |
| Nuovo componente di feature | `src/components/<feature>/<Name>.tsx` |
| Primitiva UI custom trasversale | `src/components/primitives/<Name>.tsx` |
| Componente trasversale di app/layout | `src/components/shared/<Name>.tsx` |
| Lettura DB (Server Component) | `src/lib/queries/<entity>.ts` |
| Mutation (Server Action) | `src/lib/actions/<entity>.ts` (con `"use server"`) |
| Logica pura | file dedicato in `src/lib/` (es. `practice-logic.ts`) |
| Tipo condiviso | `src/lib/types.ts` |
| Migrazione SQL | `supabase/migrations/NNNN_<descr>.sql` (numerazione 4 cifre) |

**Vietato:**

- `src/utils.ts` o `src/helpers.ts` come pattumiere
- `src/services/`, `src/api/`, `src/data/` (non sono nella convenzione)
- Hook lato client per leggere dati (`useSkills`, `useUserPlan` ecc.) — usa Server Components + `lib/queries/*`
- Importare codice server (`lib/server.ts`, `lib/queries/*`, `lib/actions/*`) dentro Client Components
- Modificare `src/components/ui/` a mano (è generato da shadcn)

Regole UI:

- `src/components/ui/` resta riservato ai componenti generati o gestiti da shadcn.
- `src/components/primitives/` contiene wrapper e primitive UI custom del progetto, senza dominio: `Chip`, `OptionCard`, `SegmentedNav`, eventuali wrapper conferma.
- `src/components/shared/` contiene componenti trasversali di shell/app/layout o asset identitari, non primitive UI pure.
- Fuori da `src/components/ui/`, i file componenti restano PascalCase.
- Le regole operative complete sono in `docs/ui-system.md`.

---

## Pattern dati

- **Lettura**: Server Component invoca `lib/queries/*` direttamente. Niente `useEffect + fetch`.
- **Mutation**: Server Action in `lib/actions/*` con `"use server"`. Chiamata da `<form action={...}>` o da Client Component via `usePracticeMutation` / `usePlanMutation`.
- **Schema DB**: solo via migrazioni in `supabase/migrations/`. **Mai** modifiche manuali alla dashboard senza migration corrispondente.
- **RLS abilitata su tutte le tabelle** dal primo migration. Niente policy permissive temporanee.
- **Tipi DB**: generati con `supabase gen types typescript --local` in `src/lib/types.ts` (sezione `Database`). Tipi UI/dominio nello stesso file ma sezione separata.

---

## Scope e disciplina

- **Non implementare feature di Sprint 2 o 3 finché Sprint 1 non è chiuso** (vedi piano §9).
- **Non aggiungere route, componenti, tabelle non listati nel piano** senza prima aggiornare il piano.
- Se qualcosa che servirebbe non è nel piano: **fermati, proponi, aggiorna il piano, poi codifica.**
- Esclusioni hard del piano §10 (no upload video, no gamification, no AI, no chat, no multi-lingua, ecc.) sono vincolanti. Non reintrodurle "tanto è facile".

---

## Convenzioni codice

- Default: un componente = un file.
- **Niente commenti** se il nome è chiaro. Commento solo per il "perché" non ovvio (vincolo nascosto, workaround per bug specifico).
- Niente JSDoc/TSDoc su funzioni con tipi già espliciti.
- TypeScript strict. Niente `any` salvo `unknown` con narrowing.
- Server-only mai importato da Client Components (`"use client"` boundary chiaro).
- Date: `string` ISO `YYYY-MM-DD` per giornate, `Date` solo per timestamp.
- IDs: `uuid` lato Postgres, `string` lato TS.

---

I test browser ripetibili vivono in `tests/browser/`; i test unitari restano accanto alla logica pura. I piani operativi conclusi si eliminano dopo aver aggiornato i documenti correnti.

## Ciclo di lavoro consigliato

1. Leggi la sezione rilevante di `../plan/current-plan.md` (Sprint corrente, parte di struttura/dati toccata)
2. Verifica che la modifica rientri nello Sprint attuale
3. Se serve qualcosa di nuovo non nel piano: **prima aggiorna il piano, poi codifica**
4. Implementa rispettando struttura e pattern
5. `npm run lint && npm run build` prima di considerare fatto un task
6. Aggiorna il piano se il lavoro ha chiuso/aperto decisioni
