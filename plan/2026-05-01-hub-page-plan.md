# Hub page implementation plan

> **Per Claude:** SUB-SKILL RICHIESTA: usa `superpowers:executing-plans` per implementare questo piano task-per-task.

**Goal:** Aggiungere pagina `/hub` (home permanente) fra la landing e le 5 aree dell'app, con header globale `AppHeader` per tornare all'hub da qualunque pagina.

**Architecture:** `/hub` è un Server Component dentro `(app)/`. Renderizza una lista verticale di 5 tile outlined oro (Oggi, Programma, Scuola Chang, Progressi, Profilo), con cavallo watermark di sfondo e animazione staggered identica alla landing. Layout annidato `(app)/hub/layout.tsx` esclude `AppHeader` solo su `/hub`. La logica di redirect post-login/onboarding cambia: `/today` → `/hub`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, lucide-react (già in deps), Noto Serif TC (già caricato per landing). Niente nuove dipendenze.

**Design source of truth:** `plan/2026-05-01-hub-page-design.md`.

---

## Working directory

Tutti i comandi sotto `c:/martial-arts/skill-practice` salvo dove indicato (`plan/` è in `c:/martial-arts/`).

## Convenzioni di test

Il progetto usa `node --test` (vedi `package.json` script `test`). Test esistenti in `src/lib/*.test.ts`. Niente Vitest/Jest. Per i componenti React presentational non si scrivono unit test: si verifica visivamente in dev e con `npm run build` + smoke test manuale (DoD §8.1 del design doc).

---

### Task 1 — Aggiornare `resolveLandingDestination` per ritornare `/hub`

**Razionale:** La logica della landing CTA deve mandare gli utenti onboardati a `/hub`, non `/today`. Test-first sul file `src/lib/landing.ts` e relativo `landing.test.ts`.

**Files:**
- Modify: `src/lib/landing.ts` (return type + 2 occorrenze di `"/today"`)
- Modify: `src/lib/landing.test.ts` (3 test di "torna /today" → "torna /hub")

**Step 1.1 — Aggiornare i test esistenti**

Sostituire in `src/lib/landing.test.ts` ogni `"/today"` con `"/hub"` nei 3 test che asseriscono il caso onboardato. Manteniamo invariati i test "senza profilo → /login" e "senza esami → /onboarding".

Apri `src/lib/landing.test.ts` e applica:

```typescript
// Riga 17-23
test("resolveLandingDestination: profilo con kung fu exam torna /hub", () => {
  const profile = {
    preparing_exam_id: "exam-1",
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});

// Riga 25-31
test("resolveLandingDestination: profilo con tai chi exam torna /hub", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: "tc-1",
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});

// Riga 33-40
test("resolveLandingDestination: plan_mode custom senza esami torna /hub", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: null,
    plan_mode: "custom" as const,
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});
```

**Step 1.2 — Eseguire i test e verificare che falliscano**

Run:
```bash
npm run test
```

Atteso: 3 fallimenti su `landing.test.ts` con messaggio tipo `Expected '/today' to equal '/hub'`. Tutti gli altri test devono passare.

**Step 1.3 — Aggiornare l'implementazione**

In `src/lib/landing.ts` sostituire ogni `return "/today"` con `return "/hub"` e il return type union. Risultato finale:

```typescript
type LandingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
  plan_mode?: "exam" | "custom";
};

export function resolveLandingDestination(
  profile: LandingProfile | null,
): "/login" | "/onboarding" | "/hub" {
  if (!profile) return "/login";
  if (profile.plan_mode === "custom") return "/hub";
  if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) {
    return "/onboarding";
  }
  return "/hub";
}
```

**Step 1.4 — Eseguire i test e verificare che passino**

Run:
```bash
npm run test
```

Atteso: tutti i test verdi. Output finale `# pass N` senza fail.

**Step 1.5 — Commit**

```bash
git add src/lib/landing.ts src/lib/landing.test.ts
git commit -m "feat(landing): redirect onboardati a /hub invece di /today"
```

---

### Task 2 — Reindirizzare login/onboarding/auth-callback a `/hub`

**Razionale:** Tre punti del flusso post-success oggi vanno a `/today`. Vanno tutti spostati a `/hub` per coerenza con la nuova home.

**Files:**
- Modify: `src/app/auth/callback/route.ts:7` (`?? "/today"` → `?? "/hub"`)
- Modify: `src/lib/actions/onboarding.ts:96` (`redirect("/today")` → `redirect("/hub")`)
- Modify: `src/app/(app)/onboarding/page.tsx:10` (`redirect("/today")` → `redirect("/hub")`)

**Step 2.1 — Modificare auth callback**

`src/app/auth/callback/route.ts`, riga 7:

Da:
```typescript
const next = searchParams.get("next") ?? "/today";
```

A:
```typescript
const next = searchParams.get("next") ?? "/hub";
```

**Step 2.2 — Modificare onboarding action**

`src/lib/actions/onboarding.ts`, riga 96:

Da:
```typescript
redirect("/today");
```

A:
```typescript
redirect("/hub");
```

**Step 2.3 — Modificare onboarding page redirect**

`src/app/(app)/onboarding/page.tsx`, riga 10:

Da:
```typescript
redirect("/today");
```

A:
```typescript
redirect("/hub");
```

> ATTENZIONE: questo redirect parte solo se l'utente è GIÀ onboardato e atterra su `/onboarding`. Verifica leggendo il context circostante prima di toccare la riga: la condizione deve restare la stessa (utente onboardato → mandalo via dalla pagina di onboarding).

**Step 2.4 — Build e lint**

Run:
```bash
npm run lint
npm run build
```

Atteso: entrambi verdi. La build conferma che la rotta `/hub` è ancora marcata come "non esistente" — non è ancora un errore di compilazione perché Next App Router non valida i `redirect()` a tempo di build, ma noteremo eventuali type error sui tipi del path.

**Step 2.5 — Commit**

```bash
git add src/app/auth/callback/route.ts src/lib/actions/onboarding.ts src/app/(app)/onboarding/page.tsx
git commit -m "feat(auth): redirect post-login/onboarding a /hub"
```

---

### Task 3 — Aggiungere keyframes e classi `.hub-anim-*` in `globals.css`

**Razionale:** Le animazioni mount dell'hub riusano i pattern `.landing-anim-*` esistenti (vedi `globals.css` righe 237-305). Aggiungiamo 7 classi nuove per heading, sottotitolo e 5 tile, riutilizzando i keyframes `landing-mount-fade-soft` e `landing-mount-fade` già definiti.

**Files:**
- Modify: `src/app/globals.css` (aggiunta dopo riga 305, prima di `@media (prefers-reduced-transparency)` che è a riga 307)

**Step 3.1 — Aggiungere il blocco hub-anim**

Inserire all'interno del blocco `@media (prefers-reduced-motion: no-preference)` esistente (che si chiude a riga 305), subito dopo `.landing-anim-cta`:

```css
  .hub-anim-heading {
    opacity: 0;
    animation: landing-mount-fade-soft 500ms ease-out 0ms forwards;
  }
  .hub-anim-subtitle {
    opacity: 0;
    animation: landing-mount-fade-static 500ms ease-out 100ms forwards;
  }
  .hub-anim-tile-1 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 200ms forwards;
  }
  .hub-anim-tile-2 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 300ms forwards;
  }
  .hub-anim-tile-3 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 400ms forwards;
  }
  .hub-anim-tile-4 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 500ms forwards;
  }
  .hub-anim-tile-5 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 600ms forwards;
  }
```

> NOTA: il keyframe `landing-mount-fade` originale fa translateY 20→0; per le tile il design dice 12→0 ma la differenza è impercettibile, riusiamo lo stesso keyframe per non duplicare. Se in test visivo il movimento risulta troppo grande, sostituire con un keyframe `hub-mount-tile` dedicato.

**Step 3.2 — Verificare CSS valido**

Run:
```bash
npm run build
```

Atteso: build verde. PostCSS/Tailwind v4 non solleva errori sul nuovo blocco.

**Step 3.3 — Commit**

```bash
git add src/app/globals.css
git commit -m "feat(hub): aggiunte classi animation .hub-anim-* in globals.css"
```

---

### Task 4 — Creare il componente `HubTile`

**Razionale:** Componente presentational riusabile per ogni riga dell'hub. Outlined oro, icona lucide a sinistra, titolo + sottotitolo a destra. Server Component (nessun `"use client"`), riceve la classe animation come prop per consentire delay sequenziale.

**Files:**
- Create: `src/components/hub/HubTile.tsx`

**Step 4.1 — Creare il file**

```typescript
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type HubTileProps = {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  animClassName: string;
};

export function HubTile({
  href,
  Icon,
  title,
  subtitle,
  animClassName,
}: HubTileProps) {
  return (
    <Link
      href={href}
      className={`tap-feedback flex items-center gap-4 rounded-xl border border-accent bg-transparent px-5 py-4 transition-colors hover:bg-accent/5 active:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${animClassName}`}
    >
      <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />
      <div className="flex flex-col">
        <span className="label-font text-base font-semibold tracking-wide text-foreground">
          {title}
        </span>
        <span className="text-[13px] text-muted-foreground">{subtitle}</span>
      </div>
    </Link>
  );
}
```

> NOTE:
> - `border-accent`, `bg-accent/5`, `text-accent`, `text-foreground`, `text-muted-foreground` sono token Tailwind v4 generati dal `@theme` in `globals.css` — verificati: `--accent` esiste come token CSS.
> - `tap-feedback` è la classe utility globale che dà `active:scale-0.97` (vedi `globals.css:194-204`).
> - Il `min-height` della tile è dato dal padding `py-4` + altezza testo (≈76px), coerente con design §4.5.

**Step 4.2 — Verificare lint + build**

Run:
```bash
npm run lint
npm run build
```

Atteso: entrambi verdi. ESLint potrebbe lamentarsi se `LucideIcon` non è importato come `type-only`; in caso di warning, aggiustare a `import type { LucideIcon } from "lucide-react"`.

**Step 4.3 — Commit**

```bash
git add src/components/hub/HubTile.tsx
git commit -m "feat(hub): aggiunto componente HubTile outlined oro"
```

---

### Task 5 — Creare il componente `HubGrid`

**Razionale:** Server Component che monta la lista delle 5 tile con i dati hardcoded delle aree. È hardcoded perché le aree sono fisse e cambiano solo se il piano cambia (vedi `plan/current-plan.md §7.1`).

**Files:**
- Create: `src/components/hub/HubGrid.tsx`

**Step 5.1 — Creare il file**

```typescript
import { BarChart3, BookOpenText, Home, Target, User } from "lucide-react";
import { HubTile } from "./HubTile";

const HUB_AREAS = [
  {
    href: "/today",
    Icon: Home,
    title: "Oggi",
    subtitle: "la tua pratica del giorno",
    anim: "hub-anim-tile-1",
  },
  {
    href: "/programma",
    Icon: Target,
    title: "Programma",
    subtitle: "esami e modalità di studio",
    anim: "hub-anim-tile-2",
  },
  {
    href: "/library",
    Icon: BookOpenText,
    title: "Scuola Chang",
    subtitle: "libreria delle skill",
    anim: "hub-anim-tile-3",
  },
  {
    href: "/progress",
    Icon: BarChart3,
    title: "Progressi",
    subtitle: "cosa hai praticato",
    anim: "hub-anim-tile-4",
  },
  {
    href: "/profile",
    Icon: User,
    title: "Profilo",
    subtitle: "livello, esame, settings",
    anim: "hub-anim-tile-5",
  },
];

export function HubGrid() {
  return (
    <div className="flex flex-col gap-3">
      {HUB_AREAS.map(({ href, Icon, title, subtitle, anim }) => (
        <HubTile
          key={href}
          href={href}
          Icon={Icon}
          title={title}
          subtitle={subtitle}
          animClassName={anim}
        />
      ))}
    </div>
  );
}
```

> NOTE:
> - I titoli hanno la `label-font` applicata da `HubTile` (uppercase + tracking 0.08em via `globals.css:220`). Quindi i titoli appariranno come `OGGI`, `PROGRAMMA`, ecc. anche se nel codice sono in title-case. Coerente con design §4.3.
> - Le icone sono identiche al `BottomNav` (`src/components/nav/BottomNav.tsx:5,8-12`) — coerenza voluta dal design §4.6.

**Step 5.2 — Verificare lint + build**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 5.3 — Commit**

```bash
git add src/components/hub/HubGrid.tsx
git commit -m "feat(hub): aggiunto componente HubGrid con 5 tile"
```

---

### Task 6 — Creare il componente `HubBackground`

**Razionale:** Cavallo watermark fixed in basso a destra, opacity ~0.05. Riusa l'asset SVG già presente in `public/landing/cavallo-fuoco.svg`.

**Files:**
- Create: `src/components/hub/HubBackground.tsx`

**Step 6.1 — Creare il file**

```typescript
/* eslint-disable @next/next/no-img-element */

export function HubBackground() {
  return (
    <img
      src="/landing/cavallo-fuoco.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 right-0 -z-10 w-[70vw] max-w-2xl opacity-[0.05]"
    />
  );
}
```

> NOTE:
> - `-z-10` posiziona il watermark dietro a tutto. Il `<main>` del layout `(app)` ha `bg-background` ma il fondo è opaco solo se sovrapposto a un layer dietro: verificare visivamente che il watermark sia effettivamente visibile (potrebbe servire `z-index: 0` invece di `-z-10` se il main copre il watermark). Se invisibile, cambiare in `z-0` e applicare `relative` al wrapper del page hub.
> - Niente animazione idle (defocalizzato, design §6.2).

**Step 6.2 — Commit**

```bash
git add src/components/hub/HubBackground.tsx
git commit -m "feat(hub): aggiunto componente HubBackground (cavallo watermark)"
```

---

### Task 7 — Creare la pagina `/hub`

**Razionale:** Server Component che è il vero entry point. Verifica gating onboarding lato server (utente senza esami selezionati → redirect a `/onboarding`) e renderizza heading + HubGrid + HubBackground.

**Files:**
- Create: `src/app/(app)/hub/page.tsx`

**Step 7.1 — Verificare il pattern di gating esistente**

Aprire `src/app/(app)/onboarding/page.tsx` per leggere come fa il check `getCurrentProfile()` e il redirect. Replicare lo stesso pattern (l'inverso: redirect se NON onboardato).

**Step 7.2 — Creare il file**

```typescript
import { redirect } from "next/navigation";
import { HubGrid } from "@/components/hub/HubGrid";
import { HubBackground } from "@/components/hub/HubBackground";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export default async function HubPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    redirect("/login");
  }

  if (!profile) {
    redirect("/login");
  }

  const hasExam =
    profile.preparing_exam_id || profile.preparing_exam_taichi_id;
  const isCustom = profile.plan_mode === "custom";
  if (!hasExam && !isCustom) {
    redirect("/onboarding");
  }

  return (
    <>
      <HubBackground />
      <section className="relative">
        <h1 className="hub-anim-heading mt-8 text-[22px] font-medium text-foreground">
          Dove vuoi praticare oggi?
        </h1>
        <p className="hub-anim-subtitle mt-1 text-sm text-muted-foreground">
          Scegli un&apos;area.
        </p>
        <div className="mt-8">
          <HubGrid />
        </div>
      </section>
    </>
  );
}
```

> NOTE:
> - Il pattern try/catch su `getCurrentProfile()` rispecchia la landing (`src/app/page.tsx:5-11`).
> - Il check `plan_mode === "custom"` è coerente con `resolveLandingDestination` aggiornata.
> - `relative` su `<section>` è importante se il watermark resta sotto.

**Step 7.3 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde. Build genera la rotta `/hub` come Server Component.

**Step 7.4 — Commit**

```bash
git add src/app/\(app\)/hub/page.tsx
git commit -m "feat(hub): aggiunta pagina /hub con gating onboarding"
```

---

### Task 8 — Creare layout annidato `(app)/hub/layout.tsx`

**Razionale:** Override del layout parent `(app)/layout.tsx` per **non** montare `AppHeader` su `/hub`. Sfrutta il file system nesting di Next App Router. **Va creato PRIMA di Task 9-10**, altrimenti quando aggiungiamo `AppHeader` al parent layout, comparirà anche su `/hub`.

**Files:**
- Create: `src/app/(app)/hub/layout.tsx`

**Step 8.1 — Creare il file**

```typescript
export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

> NOTE:
> - Questo layout fa solo da pass-through. Importante: in Next App Router i layout sono CUMULATIVI: il parent layout `(app)/layout.tsx` continua a montare BottomNav, padding container, ecc. Il nuovo `hub/layout.tsx` aggiunge SOLO un fragment, non sostituisce il parent. Quindi BottomNav resta visibile su `/hub` (corretto, design §3.1).
> - Per "togliere" l'AppHeader su /hub useremo un'altra tecnica: vedi Task 10. Questo layout serve come marker.

> ATTENZIONE — aggiornamento al design: il pattern "layout annidato per togliere header" non funziona perché in Next App Router i layout sono additivi, non sostitutivi. Vedi Task 10 per la soluzione effettiva.

**Step 8.2 — Verificare**

Run:
```bash
npm run build
```

Atteso: verde.

**Step 8.3 — Commit**

```bash
git add src/app/\(app\)/hub/layout.tsx
git commit -m "feat(hub): aggiunto layout annidato per /hub (pass-through)"
```

---

### Task 9 — Creare il componente `AppHeader`

**Razionale:** Header sticky globale con ideogramma 丙午 cliccabile che porta a `/hub`. Niente lato destro. Server Component (no interattività JS oltre al `<Link>`).

**Files:**
- Create: `src/components/shared/AppHeader.tsx`

**Step 9.1 — Creare il file**

```typescript
import Link from "next/link";

export function AppHeader() {
  return (
    <header
      className="material-bar hairline sticky top-0 z-40 flex h-14 items-center border-b px-5 pt-[env(safe-area-inset-top)]"
    >
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-2xl font-bold text-accent transition-opacity hover:opacity-80"
        style={{ fontFamily: "var(--font-serif-tc)" }}
        lang="zh-Hant"
      >
        丙午
      </Link>
    </header>
  );
}
```

> NOTE:
> - Riusa `material-bar` + `hairline` esattamente come `BottomNav` per coerenza visiva.
> - Il `style={{ fontFamily: "var(--font-serif-tc)" }}` accede al CSS variable definito in `globals.css:13`. Verifica funzioni: alternativa è la classe Tailwind `font-serif-tc` se è esposta dal `@theme` (vedi `LandingHero.tsx:18` che la usa). Se la classe `font-serif-tc` esiste come Tailwind utility, preferirla allo style inline.
> - `pt-[env(safe-area-inset-top)]` rispetta la safe-area iOS.
> - `z-40` < z-50 della BottomNav (no conflitto).

**Step 9.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 9.3 — Commit**

```bash
git add src/components/shared/AppHeader.tsx
git commit -m "feat(nav): aggiunto AppHeader globale con ideogramma 丙午"
```

---

### Task 10 — Montare `AppHeader` nel layout `(app)` con esclusione su `/hub`

**Razionale:** Il pattern "layout annidato per togliere header" non funziona in Next App Router perché i layout sono additivi. Soluzione corretta: leggere il pathname server-side via `headers()` (Next 16 espone l'URL dell'attuale request via header `x-pathname` settato dal `proxy.ts`, oppure si usa una soluzione client-side).

**Approccio scelto:** Client Component che legge `usePathname()` e nasconde l'header su `/hub`. Server-only sarebbe più pulito ma richiederebbe modificare `proxy.ts` per esporre il pathname; client component è più semplice e ha overhead trascurabile.

**Files:**
- Modify: `src/app/(app)/layout.tsx` (aggiungere import + render `<AppHeader />`)
- Create: `src/components/shared/AppHeaderConditional.tsx` (Client Component wrapper)

**Step 10.1 — Creare il wrapper conditional**

`src/components/shared/AppHeaderConditional.tsx`:

```typescript
"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";

export function AppHeaderConditional() {
  const pathname = usePathname();
  if (pathname === "/hub") return null;
  return <AppHeader />;
}
```

> NOTE:
> - Questo è uno dei pochi Client Components ammessi: legge URL reattivamente. Nessuna fetch, nessun stato proprio.
> - L'override su `/hub` è esplicito qui — lascia commentato per leggibilità futura.

**Step 10.2 — Modificare `(app)/layout.tsx`**

Sostituire il contenuto di `src/app/(app)/layout.tsx` con:

```typescript
import { BottomNav } from "@/components/nav/BottomNav";
import { AppHeaderConditional } from "@/components/shared/AppHeaderConditional";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <AppHeaderConditional />
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
```

> NOTE:
> - `<AppHeaderConditional />` è messo PRIMA del `<main>` perché è sticky top.
> - Il `pb-[calc(5.5rem+env(safe-area-inset-bottom))]` esistente continua a gestire lo spazio sopra BottomNav. L'header sticky NON richiede padding aggiuntivo perché è posto in flow normale.

**Step 10.3 — Reconsiderare il `hub/layout.tsx` di Task 8**

Il file `src/app/(app)/hub/layout.tsx` creato in Task 8 ora diventa **inutile** (il filtraggio avviene client-side nel wrapper). Possiamo:

a) **Lasciarlo come marker** (pass-through fragment, costo zero, esplicita la specialità di /hub)
b) **Rimuoverlo**

Decisione: **lasciarlo** (a). Costa zero ed esprime intent. Niente da fare in questo step.

**Step 10.4 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde. La build conferma il client boundary fra layout server e wrapper conditional client.

**Step 10.5 — Smoke test manuale**

```bash
npm run dev
```

Aprire browser su `http://localhost:3000`:

1. `/` mostra landing → tap "Entra" → atterro su `/hub` (utente loggato e onboardato). Verifico cavallo watermark in basso a destra, 5 tile animate in sequenza.
2. Tap su tile "Oggi" → `/today` carica, vedo header con 丙午 in alto, BottomNav in basso.
3. Tap su 丙午 → torno a `/hub`, header sparisce.
4. Tap su tab BottomNav "Profilo" → `/profile`, header torna visibile.
5. Refresh `/hub` → animazioni ripartono, gating funziona.

Se uno qualunque di questi step fallisce, fermarsi e investigare prima di committare.

**Step 10.6 — Commit**

```bash
git add src/components/shared/AppHeaderConditional.tsx src/app/\(app\)/layout.tsx
git commit -m "feat(nav): monta AppHeader in layout (app) con esclusione /hub"
```

---

### Task 11 — Aggiornare `plan/current-plan.md`

**Razionale:** Il piano è la fonte di verità. Aggiornarlo con le modifiche fatte (rotta /hub, AppHeader, struttura cartelle, flusso landing).

**Files:**
- Modify: `plan/current-plan.md` (§5 struttura, §7 navigazione, §15.6 flusso landing)

**Step 11.1 — Aggiornare §5 struttura cartelle**

In `plan/current-plan.md`, dentro il blocco di codice della struttura (riga 211-307), aggiungere:

- Sotto `(app)/` aggiungere riga `│   │   │   ├── hub/page.tsx                # Home permanente con 5 aree`
- Sotto `components/` creare/aggiornare entry `hub/` con `HubTile.tsx`, `HubGrid.tsx`, `HubBackground.tsx`
- Sotto `components/shared/` aggiungere `AppHeader.tsx` e `AppHeaderConditional.tsx`

**Step 11.2 — Aggiornare §7 navigazione**

In §7.1 Bottom navigation: aggiungere subito sopra al diagramma BottomNav una nota:

```markdown
### 7.0 Hub e header globale

Da Sprint 2.x esiste `/hub`, home permanente con 5 tile (Oggi, Programma, Scuola Chang, Progressi, Profilo). La landing CTA `Entra` reindirizza qui per utenti onboardati. Da `/hub` si raggiunge ogni area.

In tutte le pagine `(app)/*` tranne `/hub` è montato `AppHeader`: barra sticky con ideogramma 丙午 cliccabile che riporta a `/hub`. Vedi `plan/2026-05-01-hub-page-design.md` per i dettagli.
```

**Step 11.3 — Aggiornare §15.6 landing page**

Sostituire l'attuale §15.6 con un paragrafo aggiornato:

```markdown
### 15.6 Landing page e hub

Per MVP personale: **landing minimale (hero+CTA) implementata** come "lock screen" identitaria su `/`. Vedi `plan/2026-04-26-landing-page-design.md` per il design originale.

Da Sprint 2.x la CTA "Entra" della landing reindirizza a `/hub` (era `/today`) per utenti onboardati. L'hub è una home permanente con 5 tile che mostrano le aree dell'app e fungono da crocevia panoramico. Vedi `plan/2026-05-01-hub-page-design.md`.

Il flusso completo è: landing `/` → Entra → `/hub` → scegli un'area → BottomNav per saltare fra aree → ideogramma 丙午 in `AppHeader` per tornare al hub. Login/onboarding redirigono a `/hub`. Logout torna a `/` (landing).

Per pre-vendita federazione: landing statica separata su Carrd (€19/anno) o Framer (free tier). Una pagina, value prop, screenshot, form contatto. Non integrata nell'app.
```

**Step 11.4 — Commit**

```bash
git add plan/current-plan.md
git commit -m "docs(plan): aggiorna piano con /hub e AppHeader"
```

> NOTE: `plan/` è in `c:/martial-arts/`, non `c:/martial-arts/skill-practice/`. Eseguire il commit dalla root del repo:
> ```bash
> cd c:/martial-arts
> git add plan/current-plan.md
> git commit -m "docs(plan): aggiorna piano con /hub e AppHeader"
> cd skill-practice
> ```

---

### Task 12 — Verifica finale: build, lint, test, smoke test golden path

**Razionale:** Definition of Done del design doc §8.2. Ultima passata prima di considerare completa l'implementazione.

**Files:** Nessuno modificato — solo verifiche.

**Step 12.1 — Suite completa di verifica**

```bash
npm run lint
npm run test
npm run build
```

Atteso: tutti verdi.

**Step 12.2 — Smoke test golden path manuale**

```bash
npm run dev
```

Eseguire i seguenti scenari (corrispondono a §8.1 del design):

| # | Azione | Esito atteso |
|---|--------|--------------|
| 1 | Vai a `/` da incognito (no sessione) | Landing visibile, tap "Entra" → `/login` |
| 2 | Login con utente onboardato | Redirect a `/hub` |
| 3 | `/hub` mostra 5 tile animate + cavallo watermark | OK |
| 4 | Tap tile "Oggi" | `/today` carica, header con 丙午 visibile, BottomNav visibile |
| 5 | Tap su 丙午 dall'header | Torna a `/hub`, header sparisce |
| 6 | Tap tab BottomNav "Programma" da `/hub` | `/programma` carica, header visibile |
| 7 | Logout | Torna alla landing `/` |
| 8 | Da onboarding completato fai Entra | `/hub` (era `/today`) |
| 9 | DevTools: forza `prefers-reduced-motion: reduce` | Animazioni hub disattivate, render statico |
| 10 | DevTools mobile: iPhone SE simulato | Safe-area top per header, layout 5 tile leggibili |

**Step 12.3 — Se tutto verde, commit di chiusura (opzionale)**

Se i task precedenti hanno già coperto tutto, niente da committare. Altrimenti:

```bash
git add <eventuali fix scoperti>
git commit -m "fix(hub): smoke test golden path"
```

**Step 12.4 — Done.**

L'implementazione è completa quando tutti gli step da 1.5 a 12.2 sono verdi. A questo punto il design `plan/2026-05-01-hub-page-design.md` è realizzato.

---

## Esclusioni esplicite (NON fare in questo piano)

- **Aggiungere `/news` come 6° tile** → decisione futura, design §9
- **Avatar top-right nell'header** → decisione futura, design §9
- **Info dinamiche nelle tile** → tile pure, design H8
- **Skeleton loader sull'hub** → server-rendered statico
- **Modifiche a `proxy.ts`** → `/hub` è dentro `(app)/*`, già protetto
- **Modifiche a `BottomNav`** → resta a 5 tab invariato
- **Modifiche al cavallo watermark con animazioni** → design §6.2 esclude

---

## Riferimenti

- Design doc: `plan/2026-05-01-hub-page-design.md`
- Landing design: `plan/2026-04-26-landing-page-design.md`
- Piano principale: `plan/current-plan.md`
- Skill `superpowers:executing-plans` per l'esecuzione task-per-task
