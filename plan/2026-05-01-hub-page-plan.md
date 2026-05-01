# Hub page implementation plan

> **Per Claude:** SUB-SKILL RICHIESTA: usa `superpowers:executing-plans` per implementare questo piano task-per-task.

**Goal:** Aggiungere pagina `/hub` (home permanente) fra la landing e le 6 aree dell'app, con `AppHeader` non-sticky per tornare all'hub da qualunque pagina. Risolve bug pre-esistente di onboarding state inconsistente.

**Architecture:** `/hub` è un Server Component dentro `(app)/`. Renderizza una lista verticale di 6 tile outlined oro (Oggi, Programma, Scuola Chang, Progressi, Bacheca, Profilo), con cavallo watermark di sfondo e animazione staggered. Helper condiviso `isProfileOnboarded` unifica il check fra landing, hub e onboarding. Client conditional `AppHeaderConditional` nasconde l'header solo su `/hub` (i layout Next non possono sostituire il parent). `AppHeader` è non-sticky per evitare collisioni con sub-sticky pre-esistenti.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, lucide-react (già in deps), Noto Serif TC (già caricato per landing). Niente nuove dipendenze.

**Design source of truth:** `plan/2026-05-01-hub-page-design.md`.

---

## Working directory

Tutti i comandi sotto `c:/martial-arts/skill-practice` salvo dove indicato (`plan/` è in `c:/martial-arts/`).

## Convenzioni di test

`node --test` (vedi `package.json` script `test`). Test esistenti in `src/lib/*.test.ts`. Per logica pura usiamo TDD; per i componenti React presentational verifichiamo con `npm run build` + smoke test manuale (DoD §8.2 del design doc).

---

### Task 1 — Estrarre helper `isProfileOnboarded` (TDD)

**Razionale:** Oggi il check "utente onboardato" è duplicato in `landing.ts` (considera `plan_mode === "custom"` come onboarded) e `onboarding/page.tsx` (controlla solo `preparing_exam_id`). Bug: utente custom senza esami va in loop. Estraiamo helper condiviso.

**Files:**
- Create: `src/lib/onboarding-state.ts`
- Create: `src/lib/onboarding-state.test.ts`

**Step 1.1 — Scrivere il test fallito**

Creare `src/lib/onboarding-state.test.ts`:

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { isProfileOnboarded } from "./onboarding-state.ts";

test("isProfileOnboarded: con esame kung fu torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: "exam-1",
      preparing_exam_taichi_id: null,
    }),
    true,
  );
});

test("isProfileOnboarded: con esame tai chi torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: "tc-1",
    }),
    true,
  );
});

test("isProfileOnboarded: plan_mode custom senza esami torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
      plan_mode: "custom",
    }),
    true,
  );
});

test("isProfileOnboarded: senza esami e senza plan_mode custom torna false", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
    }),
    false,
  );
});

test("isProfileOnboarded: plan_mode exam senza esami torna false", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
      plan_mode: "exam",
    }),
    false,
  );
});
```

> NOTA: aggiunto un 5° caso `plan_mode: "exam"` senza esami → false. Cattura il caso "utente ha scelto modalità exam ma non ha ancora selezionato un esame": va a `/onboarding` per completare.

**Step 1.2 — Eseguire test e verificare che falliscano**

Aggiungere prima il file alla suite. Modificare `package.json` script `test`:

```json
"test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-isolation=none src/lib/youtube.test.ts src/lib/practice-logic.test.ts src/lib/progress-logic.test.ts src/lib/session-scheduler.test.ts src/lib/landing.test.ts src/lib/onboarding-state.test.ts"
```

Run:
```bash
npm run test
```

Atteso: errore "Cannot find module './onboarding-state.ts'" o equivalente. Tutti gli altri test passano.

**Step 1.3 — Implementare il helper**

Creare `src/lib/onboarding-state.ts`:

```typescript
export type OnboardingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
  plan_mode?: "exam" | "custom";
};

export function isProfileOnboarded(profile: OnboardingProfile): boolean {
  if (profile.plan_mode === "custom") return true;
  return Boolean(
    profile.preparing_exam_id || profile.preparing_exam_taichi_id,
  );
}
```

**Step 1.4 — Eseguire test e verificare passino**

Run:
```bash
npm run test
```

Atteso: tutti i test verdi.

**Step 1.5 — Commit**

```bash
git add src/lib/onboarding-state.ts src/lib/onboarding-state.test.ts package.json
git commit -m "feat(onboarding): helper condiviso isProfileOnboarded con test"
```

---

### Task 2 — Aggiornare `resolveLandingDestination` per usare helper + ritornare `/hub`

**Razionale:** Sostituire la logica duplicata in `landing.ts` con il helper. Ritornare `/hub` invece di `/today` per onboardati. Aggiornare i test.

**Files:**
- Modify: `src/lib/landing.ts`
- Modify: `src/lib/landing.test.ts`

**Step 2.1 — Aggiornare i test**

Sostituire `src/lib/landing.test.ts` con:

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { resolveLandingDestination } from "./landing.ts";

test("resolveLandingDestination: senza profilo torna /login", () => {
  assert.equal(resolveLandingDestination(null), "/login");
});

test("resolveLandingDestination: profilo senza esami torna /onboarding", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/onboarding");
});

test("resolveLandingDestination: profilo con kung fu exam torna /hub", () => {
  const profile = {
    preparing_exam_id: "exam-1",
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});

test("resolveLandingDestination: profilo con tai chi exam torna /hub", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: "tc-1",
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});

test("resolveLandingDestination: plan_mode custom senza esami torna /hub", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: null,
    plan_mode: "custom" as const,
  };
  assert.equal(resolveLandingDestination(profile), "/hub");
});
```

**Step 2.2 — Eseguire test, verificare falliscano**

Run:
```bash
npm run test
```

Atteso: 3 fallimenti su `landing.test.ts` (i test "torna /hub"). Helper test (Task 1) verde. Altri verdi.

**Step 2.3 — Aggiornare l'implementazione**

Sostituire `src/lib/landing.ts` con:

```typescript
import { isProfileOnboarded, type OnboardingProfile } from "./onboarding-state";

export function resolveLandingDestination(
  profile: OnboardingProfile | null,
): "/login" | "/onboarding" | "/hub" {
  if (!profile) return "/login";
  if (!isProfileOnboarded(profile)) return "/onboarding";
  return "/hub";
}
```

> NOTA: il tipo `LandingProfile` locale viene rimosso e sostituito da `OnboardingProfile` importato. Più DRY.

**Step 2.4 — Eseguire test**

Run:
```bash
npm run test
```

Atteso: tutti verdi.

**Step 2.5 — Commit**

```bash
git add src/lib/landing.ts src/lib/landing.test.ts
git commit -m "feat(landing): usa isProfileOnboarded e redirige a /hub"
```

---

### Task 3 — Allineare `onboarding/page.tsx` al helper (fix bug pre-esistente)

**Razionale:** Oggi `onboarding/page.tsx:9` controlla solo `preparing_exam_id`. Un utente con `plan_mode = custom` senza esami (legittimo) atterra su /onboarding e non viene mai rediretto via — bug pre-esistente. Usare il helper risolve.

**Files:**
- Modify: `src/app/(app)/onboarding/page.tsx`

**Step 3.1 — Leggere il file completo**

Apri `src/app/(app)/onboarding/page.tsx` per contesto. Struttura attuale:

```typescript
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.preparing_exam_id || profile.preparing_exam_taichi_id) {
    redirect("/today");
  }
  // ...
}
```

**Step 3.2 — Applicare la modifica**

Sostituire l'import e la logica di gating:

```typescript
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { isProfileOnboarded } from "@/lib/onboarding-state";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (isProfileOnboarded(profile)) {
    redirect("/hub");
  }

  const exams = await listExamProgramsForSchool(profile.school_id);

  return <OnboardingForm exams={exams} displayName={profile.display_name} />;
}
```

> NOTA: il redirect ora va a `/hub` (era `/today`). Coerente con Task 5.

**Step 3.3 — Verificare lint + build**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde. Se TS lamenta su `getCurrentProfile()` perché ritorna un tipo più ricco di `OnboardingProfile`, va bene — lo struct è subset, TS strutturale.

**Step 3.4 — Commit**

```bash
git add src/app/\(app\)/onboarding/page.tsx
git commit -m "fix(onboarding): usa isProfileOnboarded e redirige a /hub (chiude bug custom-senza-esami)"
```

---

### Task 4 — Reindirizzare auth callback e onboarding action a `/hub`

**Razionale:** Due punti del flusso post-success oggi vanno a `/today`. Vanno a `/hub`.

**Files:**
- Modify: `src/app/auth/callback/route.ts:7`
- Modify: `src/lib/actions/onboarding.ts:96`

**Step 4.1 — Modificare auth callback**

`src/app/auth/callback/route.ts`, riga 7:

Da:
```typescript
const next = searchParams.get("next") ?? "/today";
```

A:
```typescript
const next = searchParams.get("next") ?? "/hub";
```

**Step 4.2 — Modificare onboarding action**

`src/lib/actions/onboarding.ts`, riga 96:

Da:
```typescript
redirect("/today");
```

A:
```typescript
redirect("/hub");
```

**Step 4.3 — Build**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 4.4 — Commit**

```bash
git add src/app/auth/callback/route.ts src/lib/actions/onboarding.ts
git commit -m "feat(auth): redirect post-login/onboarding-action a /hub"
```

---

### Task 5 — Aggiungere `/hub` (e gap pre-esistenti) a `PROTECTED_PREFIXES`

**Razionale:** Il middleware ha array hardcoded `PROTECTED_PREFIXES`. Senza `/hub` aggiunto, la rotta sarebbe pubblica. Bonus segnalato dalla review: aggiungo `/progress` e `/sessions` per consistenza con il route group `(app)` (sono attualmente non protetti). Cambio low-risk.

**Files:**
- Modify: `src/lib/supabase/middleware.ts:4-13`

**Step 5.1 — Aggiornare l'array**

Sostituire:

```typescript
const PROTECTED_PREFIXES = [
  "/today",
  "/programma",
  "/library",
  "/skill",
  "/plan",
  "/profile",
  "/onboarding",
  "/news",
];
```

Con:

```typescript
const PROTECTED_PREFIXES = [
  "/hub",
  "/today",
  "/programma",
  "/library",
  "/skill",
  "/plan",
  "/profile",
  "/onboarding",
  "/news",
  "/progress",
  "/sessions",
];
```

**Step 5.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 5.3 — Smoke test in dev (opzionale ma consigliato)**

```bash
npm run dev
```

Aprire browser **incognito** (nessuna sessione):
1. Vai a `http://localhost:3000/hub` → deve redirigere a `/login?next=/hub`
2. Vai a `http://localhost:3000/progress` → deve redirigere a `/login?next=/progress`
3. Vai a `http://localhost:3000/sessions/setup` → deve redirigere a `/login?next=/sessions/setup`

Se uno qualunque non redirige, fermarsi e investigare.

**Step 5.4 — Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "fix(auth): aggiunge /hub /progress /sessions a PROTECTED_PREFIXES"
```

---

### Task 6 — Aggiungere keyframes `.hub-anim-*` in `globals.css` (heading + 6 tile)

**Razionale:** Le animazioni mount dell'hub riusano i pattern `.landing-anim-*` esistenti (`globals.css` righe 237-305). Aggiungiamo 8 classi: heading, sottotitolo, 6 tile.

**Files:**
- Modify: `src/app/globals.css` (aggiunta dentro il blocco `@media (prefers-reduced-motion: no-preference)` esistente, prima della chiusura a riga 305)

**Step 6.1 — Aggiungere il blocco hub-anim**

Inserire alla fine del blocco `@media (prefers-reduced-motion: no-preference)` (dopo `.landing-anim-cta` riga 304):

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
  .hub-anim-tile-6 {
    opacity: 0;
    animation: landing-mount-fade 500ms ease-out 700ms forwards;
  }
```

**Step 6.2 — Verificare CSS valido**

Run:
```bash
npm run build
```

Atteso: verde.

**Step 6.3 — Commit**

```bash
git add src/app/globals.css
git commit -m "feat(hub): aggiunge keyframes .hub-anim-* (heading + 6 tile)"
```

---

### Task 7 — Creare il componente `HubTile`

**Razionale:** Componente presentational riusabile per ogni riga dell'hub. Outlined oro, icona lucide a sinistra, titolo + sottotitolo a destra. Server Component.

**Files:**
- Create: `src/components/hub/HubTile.tsx`

**Step 7.1 — Creare il file**

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

**Step 7.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 7.3 — Commit**

```bash
git add src/components/hub/HubTile.tsx
git commit -m "feat(hub): aggiunge componente HubTile"
```

---

### Task 8 — Creare il componente `HubGrid` (6 tile con Bacheca)

**Razionale:** Server Component che monta la lista delle 6 tile. Bacheca è la 5° (sopra Profilo), coerente con design §4.1.

**Files:**
- Create: `src/components/hub/HubGrid.tsx`

**Step 8.1 — Creare il file**

```typescript
import {
  BarChart3,
  BookOpenText,
  Home,
  Megaphone,
  Target,
  User,
} from "lucide-react";
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
    href: "/news",
    Icon: Megaphone,
    title: "Bacheca",
    subtitle: "comunicazioni della scuola",
    anim: "hub-anim-tile-5",
  },
  {
    href: "/profile",
    Icon: User,
    title: "Profilo",
    subtitle: "livello, esame, settings",
    anim: "hub-anim-tile-6",
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

**Step 8.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 8.3 — Commit**

```bash
git add src/components/hub/HubGrid.tsx
git commit -m "feat(hub): aggiunge HubGrid con 6 tile (incluso Bacheca)"
```

---

### Task 9 — Creare il componente `HubBackground`

**Razionale:** Cavallo watermark fixed in basso a destra, opacity ~0.05. Riusa l'asset SVG già presente. **z-index decisione upfront**: `z-0` (sopra il `bg-background` del layout, sotto al contenuto). Il wrapping di `relative` sul `<section>` di `/hub` (Task 10) evita che le tile finiscano sotto il watermark.

**Files:**
- Create: `src/components/hub/HubBackground.tsx`

**Step 9.1 — Creare il file**

```typescript
/* eslint-disable @next/next/no-img-element */

export function HubBackground() {
  return (
    <img
      src="/landing/cavallo-fuoco.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 right-0 z-0 w-[70vw] max-w-2xl opacity-[0.05]"
    />
  );
}
```

**Step 9.2 — Commit**

```bash
git add src/components/hub/HubBackground.tsx
git commit -m "feat(hub): aggiunge HubBackground (cavallo watermark)"
```

---

### Task 10 — Creare la pagina `/hub`

**Razionale:** Server Component che usa `isProfileOnboarded` per gating, monta heading + HubGrid e include `HubBackground`. Wrapper `<section className="relative">` per stack z-index pulito.

**Files:**
- Create: `src/app/(app)/hub/page.tsx`

**Step 10.1 — Creare il file**

```typescript
import { redirect } from "next/navigation";
import { HubGrid } from "@/components/hub/HubGrid";
import { HubBackground } from "@/components/hub/HubBackground";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { isProfileOnboarded } from "@/lib/onboarding-state";

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

  if (!isProfileOnboarded(profile)) {
    redirect("/onboarding");
  }

  return (
    <>
      <HubBackground />
      <section className="relative z-10 mx-auto max-w-md">
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
> - `relative z-10` sulla section: stack context locale che mantiene le tile sopra il watermark `z-0`.
> - `max-w-md` (~28rem): più stretto del `max-w-2xl` ereditato dal layout `(app)`. Coerente con design §4.1.
> - Try/catch su `getCurrentProfile()` rispecchia il pattern di `src/app/page.tsx:5-11`.

**Step 10.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde. Build genera la rotta `/hub` come Server Component.

**Step 10.3 — Smoke test parziale**

```bash
npm run dev
```

In browser loggato e onboardato:
1. Vai a `/hub` → vedi heading, sottotitolo, 6 tile, cavallo watermark in basso a destra (opacity bassa)
2. Tap su tile "Bacheca" → naviga a `/news`
3. Tap su altre tile → naviga correttamente

L'header globale NON è ancora montato — verrà aggiunto in Task 12. Per ora ogni pagina interna non ha modo di tornare a `/hub` se non con back-button del browser. È atteso a questo step.

**Step 10.4 — Commit**

```bash
git add src/app/\(app\)/hub/page.tsx
git commit -m "feat(hub): aggiunge pagina /hub con gating onboarding"
```

---

### Task 11 — Creare il componente `AppHeader` (NON-sticky)

**Razionale:** Header con ideogramma 丙午 cliccabile che porta a `/hub`. **Non-sticky**: scrolla via insieme al contenuto. Decisione basata su review: sticky causerebbe collisioni con sub-header su `/today` e sticky su CalendarMonth.

**Files:**
- Create: `src/components/shared/AppHeader.tsx`

**Step 11.1 — Creare il file**

```typescript
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="material-bar hairline flex h-14 items-center border-b px-5 pt-[env(safe-area-inset-top)]">
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-2xl font-bold text-accent transition-opacity hover:opacity-80 font-serif-tc"
        lang="zh-Hant"
      >
        丙午
      </Link>
    </header>
  );
}
```

> NOTE:
> - Niente `sticky top-0 z-40`. Header è block normale, scrolla via.
> - `font-serif-tc` come Tailwind utility (esposta dal `@theme` in `globals.css`, vedi `LandingHero.tsx:17` che la usa). Se la build dice "unknown utility", fallback a `style={{ fontFamily: "var(--font-serif-tc)" }}`.
> - `material-bar` + `hairline` per coerenza visiva con BottomNav.
> - `pt-[env(safe-area-inset-top)]` rispetta safe-area iOS anche se non sticky.

**Step 11.2 — Verificare**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde.

**Step 11.3 — Commit**

```bash
git add src/components/shared/AppHeader.tsx
git commit -m "feat(nav): aggiunge AppHeader non-sticky con ideogramma 丙午"
```

---

### Task 12 — Wrapper `AppHeaderConditional` + montaggio in `(app)/layout.tsx`

**Razionale:** Il pattern "layout annidato per togliere header" non funziona in Next App Router (i layout sono additivi). Soluzione: client component che legge pathname e nasconde l'header su `/hub`.

**Files:**
- Create: `src/components/shared/AppHeaderConditional.tsx`
- Modify: `src/app/(app)/layout.tsx`

**Step 12.1 — Creare il wrapper**

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

**Step 12.2 — Modificare `(app)/layout.tsx`**

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
> - `<AppHeaderConditional />` è la prima riga dentro il `<div>`. Header non-sticky → scrolla via insieme al main.
> - `<main>` mantiene `max-w-2xl` come prima. Il `/hub` dentro va più stretto (`max-w-md` nel suo `<section>`, vedi Task 10).
> - BottomNav resta `fixed bottom-0` invariata.

**Step 12.3 — Verificare lint + build**

Run:
```bash
npm run lint
npm run build
```

Atteso: verde. Build conferma il client boundary fra layout server e wrapper conditional client.

**Step 12.4 — Smoke test golden path**

```bash
npm run dev
```

Eseguire (utente loggato e onboardato):

1. `/` → tap "Entra" → atterro su `/hub`. Vedo heading, 6 tile animate, cavallo watermark.
2. `/hub` non ha header (verifica visiva: nessun ideogramma in alto).
3. Tap tile "Oggi" → `/today`. Vedo header con 丙午 in alto. Sub-header "Oggi - lunedì" sotto. BottomNav sotto.
4. Scroll su `/today` → AppHeader scrolla via (non sticky), sub-header con titolo resta sticky in alto. Nessuna sovrapposizione.
5. Tap su 丙午 dell'header → torno a `/hub`. Header sparisce.
6. Vai a `/sessions/calendar` → AppHeader visibile, mese sticky funziona. Scroll: AppHeader scrolla via, mese resta sticky. OK.
7. Tap tile "Bacheca" → `/news`. Header visibile.

Se uno qualunque step fallisce, fermarsi e investigare prima di committare.

**Step 12.5 — Commit**

```bash
git add src/components/shared/AppHeaderConditional.tsx src/app/\(app\)/layout.tsx
git commit -m "feat(nav): monta AppHeader in layout (app) escludendolo da /hub"
```

---

### Task 13 — Aggiornare `plan/current-plan.md`

**Razionale:** Il piano è la fonte di verità. Aggiornarlo con le modifiche fatte.

**Files:**
- Modify: `plan/current-plan.md` (§5 struttura, §7 navigazione, §15.6 flusso landing)

**Step 13.1 — Aggiornare §5 struttura cartelle**

In `plan/current-plan.md`, aggiungere all'interno del blocco di codice della struttura (riga 211-307):

- Sotto `(app)/` aggiungere riga: `│   │   │   ├── hub/page.tsx                # Home permanente con 6 aree`
- Sotto `components/`, dopo `today/`: cartella `hub/` con `HubTile.tsx`, `HubGrid.tsx`, `HubBackground.tsx`
- Sotto `components/shared/`: aggiungere `AppHeader.tsx` e `AppHeaderConditional.tsx`
- Sotto `lib/`: aggiungere `onboarding-state.ts` e `onboarding-state.test.ts`

**Step 13.2 — Aggiungere §7.0 hub e header**

In §7 (Navigazione), aggiungere subito sopra §7.1:

```markdown
### 7.0 Hub e header globale

Da Sprint 2.x esiste `/hub`, home permanente con 6 tile (Oggi, Programma, Scuola Chang, Progressi, Bacheca, Profilo). La landing CTA `Entra` reindirizza qui per utenti onboardati. Da `/hub` si raggiunge ogni area.

In tutte le pagine `(app)/*` tranne `/hub` è montato `AppHeader`: barra non-sticky con ideogramma 丙午 cliccabile che riporta a `/hub`. È non-sticky di design: l'AppHeader scrolla via per non collidere con sticky pre-esistenti su `/today` e `/sessions/calendar`. Vedi `plan/2026-05-01-hub-page-design.md`.
```

**Step 13.3 — Aggiornare §15.6 landing page**

Sostituire l'attuale §15.6 con:

```markdown
### 15.6 Landing page e hub

Per MVP personale: **landing minimale (hero+CTA) implementata** come "lock screen" identitaria su `/`. Vedi `plan/2026-04-26-landing-page-design.md`.

Da Sprint 2.x la CTA "Entra" della landing reindirizza a `/hub` (era `/today`) per utenti onboardati. L'hub è una home permanente con 6 tile che mostrano le aree dell'app e fungono da crocevia panoramico. Vedi `plan/2026-05-01-hub-page-design.md`.

Il flusso completo: landing `/` → Entra → `/hub` → scegli area → BottomNav per saltare fra aree → ideogramma 丙午 in `AppHeader` per tornare al hub. Login/onboarding redirigono a `/hub`. Logout torna a `/` (landing).

L'AppHeader è non-sticky per evitare collisioni con sub-header sticky pre-esistenti.

Lo stato di onboarding è centralizzato in `src/lib/onboarding-state.ts` (helper `isProfileOnboarded`). Usato da landing, /hub, /onboarding per evitare check duplicati e inconsistenti.

Per pre-vendita federazione: landing statica separata su Carrd (€19/anno) o Framer (free tier). Una pagina, value prop, screenshot, form contatto. Non integrata nell'app.
```

**Step 13.4 — Commit**

```bash
cd c:/martial-arts
git add plan/current-plan.md
git commit -m "docs(plan): aggiorna piano con /hub, AppHeader, helper onboarding"
cd skill-practice
```

> NOTE: `plan/` è in `c:/martial-arts/`, non `c:/martial-arts/skill-practice/`.

---

### Task 14 — Verifica finale: lint, test, build, smoke test golden path

**Razionale:** Definition of Done del design doc §8.3.

**Files:** Nessuno modificato — solo verifiche.

**Step 14.1 — Suite completa**

```bash
npm run lint
npm run test
npm run build
```

Atteso: tutti verdi. In particolare `npm run test` deve includere:
- 5 test in `onboarding-state.test.ts`
- 5 test in `landing.test.ts` (con `/hub` invece di `/today`)
- Tutti i test pre-esistenti

**Step 14.2 — Smoke test golden path manuale**

```bash
npm run dev
```

Eseguire scenari di §8.2 del design:

| # | Azione | Esito |
|---|--------|-------|
| 1 | `/` da incognito | Landing → tap Entra → /login |
| 2 | Login con utente onboardato | Redirect /hub |
| 3 | `/hub` mostra 6 tile + cavallo | OK |
| 4 | Tap tile "Oggi" | /today, header 丙午 visibile, BottomNav |
| 5 | Tap su 丙午 | Torna a /hub, header sparisce |
| 6 | Scroll su /today | AppHeader scrolla via, sub-header sticky resta in alto, nessuna sovrapposizione |
| 7 | Tap tile "Bacheca" | /news, header visibile |
| 8 | `/sessions/calendar` scroll | AppHeader scrolla via, mese sticky funziona |
| 9 | Logout | Torna a / (landing) |
| 10 | Da onboarding completato fai Entra | /hub |
| 11 | Utente custom senza esami login | /hub (era loop pre-fix) |
| 12 | DevTools `prefers-reduced-motion: reduce` | Animazioni hub disattivate |
| 13 | DevTools mobile iPhone SE | Layout 6 tile leggibili, scroll naturale |
| 14 | Incognito accesso diretto a `/hub` | Redirect a /login?next=/hub |

**Step 14.3 — Done.**

Implementazione completa quando tutti gli step da 1 a 14.2 sono verdi.

---

## Esclusioni esplicite (NON fare in questo piano)

- **Avatar profilo top-right nell'header** → Profilo resta come tile dell'hub, scelta esplicita post-review
- **News in BottomNav** → resta solo in hub e banner Today
- **Info dinamiche nelle tile** → tile pure (design H8)
- **Skeleton loader sull'hub** → server-rendered statico
- **AppHeader sticky** → escluso per evitare collisioni con sub-sticky
- **`(app)/hub/layout.tsx`** → escluso, i layout Next non sostituiscono il parent
- **Refactor degli sticky in `today/page.tsx` o `CalendarMonth.tsx`** → fuori scope, l'AppHeader non-sticky lo evita
- **Modifiche a `BottomNav`** → resta a 5 tab invariato

---

## Riferimenti

- Design doc: `plan/2026-05-01-hub-page-design.md`
- Landing design: `plan/2026-04-26-landing-page-design.md`
- Piano principale: `plan/current-plan.md`
- Skill `superpowers:executing-plans` per l'esecuzione task-per-task
