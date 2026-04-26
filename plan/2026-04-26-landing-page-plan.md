# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aggiungere una landing page hero+CTA su `/` come "lock screen" identitaria FESK, sempre visibile prima di accedere all'app.

**Architecture:** `src/app/page.tsx` diventa la landing (Server Component). Calcola server-side la destinazione del CTA leggendo `getCurrentProfile()`. SVG cavallo inlined via SVGR, citazione cinese tradizionale + traduzione italiana. Tutto CSS-only, zero JS client. Login e logout aggiornati per coerenza con la metafora "lock screen sempre presente".

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, SVGR (`@svgr/webpack`), `next/font/google` (Noto Serif TC), Server Components, no client JS.

**Design doc di riferimento:** `plan/2026-04-26-landing-page-design.md`

---

## Pre-flight

Prima di iniziare, verifica:
- Working directory: `c:/martial-arts/skill-practice/`
- Branch corrente: `main` (o branch di feature dedicato — vedi `superpowers:using-git-worktrees`)
- `npm run lint` e `npm run build` passano sullo stato attuale
- File sorgente vettorializzato presente: `C:\Users\FGarzia\Downloads\FreeSample-Vectorizer-io-Screenshot_20260217-163743~2.svg`

---

## Task 1: Script di pulizia SVG

**Files:**
- Create: `skill-practice/scripts/clean-landing-svg.mjs`
- Output finale (committato): `skill-practice/public/landing/cavallo-fuoco.svg`

**Step 1.1: Creare la cartella di output**

```bash
mkdir -p skill-practice/public/landing
```

**Step 1.2: Scrivere lo script di pulizia**

Crea `skill-practice/scripts/clean-landing-svg.mjs`:

```javascript
import { readFileSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

const [, , inputPath, outputPath] = argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node clean-landing-svg.mjs <input.svg> <output.svg>");
  process.exit(1);
}

const DROP_FILLS = new Set([
  "#1e0807",
  "#250707",
  "#320708",
  "#760d0d",
  "#831f16",
  "#941d19",
  "#a4281f",
  "#9d3c20",
  "#ab5125",
]);

const source = readFileSync(inputPath, "utf8");

const cleaned = source.replace(
  /<g\s+fill="(#[0-9a-fA-F]+)">[\s\S]*?<\/g>/g,
  (match, fill) => (DROP_FILLS.has(fill.toLowerCase()) ? "" : match),
);

writeFileSync(outputPath, cleaned, "utf8");
console.log(`Cleaned SVG written to ${outputPath}`);
```

**Step 1.3: Eseguire la pulizia sul file sorgente utente**

```bash
cd skill-practice
node scripts/clean-landing-svg.mjs \
  "C:/Users/FGarzia/Downloads/FreeSample-Vectorizer-io-Screenshot_20260217-163743~2.svg" \
  public/landing/cavallo-fuoco.raw.svg
```

Expected: `Cleaned SVG written to public/landing/cavallo-fuoco.raw.svg`

**Step 1.4: Comprimere con SVGO**

```bash
cd skill-practice
npx --yes svgo --input public/landing/cavallo-fuoco.raw.svg --output public/landing/cavallo-fuoco.svg
rm public/landing/cavallo-fuoco.raw.svg
```

Expected: dimensione finale 50-70 KB.

**Step 1.5: Verifica visiva**

Apri `skill-practice/public/landing/cavallo-fuoco.svg` nel browser:
- Cavallo cream visibile
- Nuvole arancio visibili
- Sfondo trasparente (vedi pattern checkerboard del browser)

Se ci sono ancora elementi rossi residui, ispeziona l'SVG e aggiungi i fill mancanti a `DROP_FILLS`, ripeti gli step 1.3-1.4.

**Step 1.6: Commit**

```bash
cd c:/martial-arts
git add skill-practice/scripts/clean-landing-svg.mjs skill-practice/public/landing/cavallo-fuoco.svg
git commit -m "chore(landing): asset cavallo SVG ripulito + script di pulizia"
```

---

## Task 2: Configurare SVGR per inline SVG import

**Files:**
- Modify: `skill-practice/next.config.ts`
- Modify: `skill-practice/package.json` (dipendenza)

**Step 2.1: Installare `@svgr/webpack`**

```bash
cd skill-practice
npm install --save-dev @svgr/webpack
```

**Step 2.2: Aggiornare `next.config.ts`**

Sostituisci il file con:

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: "@svgr/webpack", options: { svgo: false } }],
    });
    return config;
  },
};

export default nextConfig;
```

**Step 2.3: Verificare che build passi**

```bash
cd skill-practice
npm run build
```

Expected: build completa senza errori.

**Step 2.4: Commit**

```bash
cd c:/martial-arts
git add skill-practice/next.config.ts skill-practice/package.json skill-practice/package-lock.json
git commit -m "chore(landing): configurare SVGR per import SVG come componente React"
```

---

## Task 3: Helper di destination + test unitario (TDD)

**Files:**
- Create: `skill-practice/src/lib/landing.ts`
- Create: `skill-practice/src/lib/landing.test.ts`
- Modify: `skill-practice/package.json` (script `test`)

**Step 3.1: Scrivere il test fallente**

Crea `skill-practice/src/lib/landing.test.ts`:

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

test("resolveLandingDestination: profilo con kung fu exam torna /today", () => {
  const profile = {
    preparing_exam_id: "exam-1",
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/today");
});

test("resolveLandingDestination: profilo con tai chi exam torna /today", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: "tc-1",
  };
  assert.equal(resolveLandingDestination(profile), "/today");
});
```

**Step 3.2: Aggiungere il test allo script `test`**

In `skill-practice/package.json`, modifica lo script `test`:

```json
"test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-isolation=none src/lib/youtube.test.ts src/lib/practice-logic.test.ts src/lib/progress-logic.test.ts src/lib/landing.test.ts"
```

**Step 3.3: Eseguire il test e verificare il fallimento**

```bash
cd skill-practice
npm test
```

Expected: 4 test in `landing.test.ts` falliscono perché `./landing.ts` non esiste.

**Step 3.4: Implementare `resolveLandingDestination`**

Crea `skill-practice/src/lib/landing.ts`:

```typescript
type LandingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
};

export function resolveLandingDestination(
  profile: LandingProfile | null,
): "/login" | "/onboarding" | "/today" {
  if (!profile) return "/login";
  if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) {
    return "/onboarding";
  }
  return "/today";
}
```

**Step 3.5: Eseguire il test e verificare il successo**

```bash
cd skill-practice
npm test
```

Expected: tutti i test passano (inclusi i 4 nuovi).

**Step 3.6: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/lib/landing.ts skill-practice/src/lib/landing.test.ts skill-practice/package.json
git commit -m "feat(landing): helper resolveLandingDestination con test"
```

---

## Task 4: Caricare font Noto Serif TC

**Files:**
- Modify: `skill-practice/src/app/layout.tsx`

**Step 4.1: Leggere il layout corrente**

Apri `skill-practice/src/app/layout.tsx` per vedere come sono caricati i font Geist esistenti.

**Step 4.2: Aggiungere Noto Serif TC**

Aggiungi all'import:

```typescript
import { Noto_Serif_TC } from "next/font/google";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-serif-tc",
  display: "swap",
});
```

Aggiungi `notoSerifTC.variable` alla `className` del `<html>` o `<body>` dove sono già le altre `variable` (insieme a Geist):

```tsx
<html lang="it" className={`${geist.variable} ${geistMono.variable} ${notoSerifTC.variable}`}>
```

**Step 4.3: Esporre il font in Tailwind**

In `skill-practice/src/app/globals.css`, dentro il blocco `@theme` esistente (Tailwind v4), aggiungi:

```css
--font-serif-tc: var(--font-serif-tc);
```

**Step 4.4: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build completa, niente errori di font.

**Step 4.5: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/app/layout.tsx skill-practice/src/app/globals.css
git commit -m "feat(landing): caricare font Noto Serif TC per ideogrammi e citazione"
```

---

## Task 5: Componente HorseEmblem

**Files:**
- Create: `skill-practice/src/components/landing/HorseEmblem.tsx`

**Step 5.1: Creare la cartella**

```bash
mkdir -p skill-practice/src/components/landing
```

**Step 5.2: Scrivere il componente**

Crea `skill-practice/src/components/landing/HorseEmblem.tsx`:

```tsx
import HorseSvg from "@/../public/landing/cavallo-fuoco.svg";

export function HorseEmblem({ className }: { className?: string }) {
  return <HorseSvg className={className} aria-hidden="true" focusable="false" />;
}
```

**Note:** se l'import path con `@/../public/...` non funziona col tsconfig, usa import relativo o configura un alias dedicato `@public/`. Verifica con `npm run build`.

**Step 5.3: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build passa, nessun errore di import SVG.

**Step 5.4: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/components/landing/HorseEmblem.tsx
git commit -m "feat(landing): componente HorseEmblem con SVG inline"
```

---

## Task 6: Componente EnterButton

**Files:**
- Create: `skill-practice/src/components/landing/EnterButton.tsx`

**Step 6.1: Scrivere il componente**

Crea `skill-practice/src/components/landing/EnterButton.tsx`:

```tsx
import Link from "next/link";

export function EnterButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center justify-center
        px-12 py-4
        rounded-[var(--radius)]
        border border-accent text-accent
        text-lg font-medium tracking-wide
        transition-colors duration-300 ease-out
        hover:bg-accent hover:text-background
        active:scale-[0.98]
      "
    >
      Entra
    </Link>
  );
}
```

**Step 6.2: Verificare che le classi Tailwind v4 risolvano i token**

Il progetto usa `@theme` in `globals.css` con i token FESK. Verifica che `border-accent` e `bg-accent` siano definiti. Se non lo sono, usa `[border-color:var(--accent)]` e `[background-color:var(--accent)]` come fallback.

```bash
cd skill-practice
npm run build
```

Expected: build passa.

**Step 6.3: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/components/landing/EnterButton.tsx
git commit -m "feat(landing): componente EnterButton outlined gold"
```

---

## Task 7: Animazioni CSS

**Files:**
- Modify: `skill-practice/src/app/globals.css`

**Step 7.1: Aggiungere keyframes e classi**

Aggiungi in fondo a `globals.css`:

```css
@keyframes landing-mount-fade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes landing-mount-fade-soft {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes landing-mount-fade-static {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes landing-breath {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (prefers-reduced-motion: no-preference) {
  .landing-anim-horse {
    opacity: 0;
    animation:
      landing-mount-fade 800ms ease-out 0ms forwards,
      landing-breath 6s ease-in-out 800ms infinite;
  }
  .landing-anim-ideogram {
    opacity: 0;
    animation: landing-mount-fade-soft 600ms ease-out 200ms forwards;
  }
  .landing-anim-citation {
    opacity: 0;
    animation: landing-mount-fade-static 600ms ease-out 400ms forwards;
  }
  .landing-anim-translation {
    opacity: 0;
    animation: landing-mount-fade-static 600ms ease-out 600ms forwards;
  }
  .landing-anim-author {
    opacity: 0;
    animation: landing-mount-fade-static 600ms ease-out 700ms forwards;
  }
  .landing-anim-cta {
    opacity: 0;
    animation: landing-mount-fade-static 600ms ease-out 900ms forwards;
  }
}
```

**Step 7.2: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build passa.

**Step 7.3: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/app/globals.css
git commit -m "feat(landing): animazioni CSS staggered con prefers-reduced-motion"
```

---

## Task 8: Componente LandingHero

**Files:**
- Create: `skill-practice/src/components/landing/LandingHero.tsx`

**Step 8.1: Scrivere il componente**

Crea `skill-practice/src/components/landing/LandingHero.tsx`:

```tsx
import { HorseEmblem } from "./HorseEmblem";
import { EnterButton } from "./EnterButton";

export function LandingHero({ ctaHref }: { ctaHref: string }) {
  return (
    <main className="min-h-svh flex items-center justify-center px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <HorseEmblem className="landing-anim-horse w-full max-w-xs h-auto" />

        <h1
          className="landing-anim-ideogram mt-8 text-[80px] sm:text-[96px] leading-none text-accent"
          style={{ fontFamily: "var(--font-serif-tc)" }}
        >
          丙午
        </h1>

        <p
          className="landing-anim-citation mt-6 text-4xl text-foreground"
          style={{ fontFamily: "var(--font-serif-tc)", fontWeight: 500 }}
        >
          學而不厭
        </p>

        <p className="landing-anim-translation mt-4 text-base italic text-muted-foreground">
          apprendere e non esserne mai sazio
        </p>

        <p className="landing-anim-author mt-2 text-sm text-muted-foreground/70">
          — Confucio
        </p>

        <div className="landing-anim-cta mt-12">
          <EnterButton href={ctaHref} />
        </div>
      </div>
    </main>
  );
}
```

**Step 8.2: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build passa.

**Step 8.3: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/components/landing/LandingHero.tsx
git commit -m "feat(landing): componente LandingHero con composizione completa"
```

---

## Task 9: Sostituire root page con landing

**Files:**
- Modify: `skill-practice/src/app/page.tsx`

**Step 9.1: Leggere il file corrente**

Apri `skill-practice/src/app/page.tsx`. Ha attualmente la logica di redirect.

**Step 9.2: Sostituire con la landing**

Sostituisci tutto il contenuto con:

```tsx
import { LandingHero } from "@/components/landing/LandingHero";
import { resolveLandingDestination } from "@/lib/landing";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export default async function RootPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // Fallback silenzioso: la landing resta visibile, CTA → /login
  }

  const destination = resolveLandingDestination(profile);
  return <LandingHero ctaHref={destination} />;
}
```

**Step 9.3: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build passa.

**Step 9.4: Test manuale — golden path**

```bash
cd skill-practice
npm run dev
```

Apri `http://localhost:3000/` in incognito (no sessione):
- Landing visibile con cavallo, ideogramma, citazione, CTA
- Animazioni partono allo stagger
- Tap su "Entra" → redirige a `/login`

Apri in finestra normale (sessione esistente, profilo onboardato):
- Landing visibile
- Tap su "Entra" → redirige a `/today`

**Step 9.5: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/app/page.tsx
git commit -m "feat(landing): root / renderizza landing al posto del redirect"
```

---

## Task 10: Aggiornare login redirect alla destination corretta

**Files:**
- Modify: `skill-practice/src/lib/actions/auth.ts`

**Step 10.1: Aggiornare `login` action**

In `skill-practice/src/lib/actions/auth.ts`, sostituisci la funzione `login`:

```typescript
export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email e password sono obbligatorie" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Dopo login riuscito, salta la landing e vai alla destination corretta.
  // Il login è uno "sblocco esplicito": non senso mostrare di nuovo la lock screen.
  const { getCurrentProfile } = await import("@/lib/queries/user-profile");
  const { resolveLandingDestination } = await import("@/lib/landing");
  const profile = await getCurrentProfile();
  redirect(resolveLandingDestination(profile));
}
```

**Step 10.2: Aggiornare `signOut` action**

Nella stessa file, modifica `signOut`:

```typescript
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");  // Lock screen sempre presente
}
```

**Step 10.3: Verificare build**

```bash
cd skill-practice
npm run build
```

Expected: build passa.

**Step 10.4: Test manuale — flow completo**

Con `npm run dev`:
1. Logout dall'app → torna alla landing `/` (non a `/login`)
2. Tap "Entra" → `/login`
3. Inserisci credenziali → submit → vai direttamente a `/today` (skip della landing, sblocco esplicito)

**Step 10.5: Commit**

```bash
cd c:/martial-arts
git add skill-practice/src/lib/actions/auth.ts
git commit -m "feat(landing): login bypass landing su sblocco, signOut torna a landing"
```

---

## Task 11: Aggiornare il piano principale

**Files:**
- Modify: `plan/current-plan.md` (§15.6)

**Step 11.1: Aggiornare §15.6**

In `plan/current-plan.md` sezione §15.6 "Landing page", sostituisci il blocco esistente con:

```markdown
### 15.6 Landing page

Per MVP personale: **landing minimale (hero+CTA) implementata** come "lock screen" identitaria su `/`. Vedi `plan/2026-04-26-landing-page-design.md` per il design e `plan/2026-04-26-landing-page-plan.md` per l'implementazione.

Non è una landing promozionale né di onboarding: è solo identità visiva (cavallo di fuoco + citazione di Confucio) prima della pratica. Sempre visibile, anche per utente loggato.

Per pre-vendita federazione: una landing promozionale separata su Carrd/Framer resta valida quando servirà. Non integrata in app.
```

**Step 11.2: Commit**

```bash
cd c:/martial-arts
git add plan/current-plan.md
git commit -m "docs(plan): aggiornare §15.6 — landing identitaria implementata"
```

---

## Task 12: Verifica finale (DoD)

**Step 12.1: Lint**

```bash
cd skill-practice
npm run lint
```

Expected: zero errori.

**Step 12.2: Build**

```bash
cd skill-practice
npm run build
```

Expected: build completa con Turbopack senza errori.

**Step 12.3: Test unitari**

```bash
cd skill-practice
npm test
```

Expected: tutti i test passano (inclusi i 4 di `landing.test.ts`).

**Step 12.4: Verifica scenari manuali (golden path + edge)**

Con `npm run dev`, verifica nella tabella:

| # | Scenario | Esito atteso | OK? |
|---|----------|--------------|-----|
| 1 | `/` no sessione (incognito) | Landing visibile, CTA → `/login` | |
| 2 | `/` sessione + onboarded | Landing visibile, CTA → `/today` | |
| 3 | `/` sessione senza onboarding | Landing visibile, CTA → `/onboarding` | |
| 4 | Logout da app | Redirect a `/` (landing), non `/login` | |
| 5 | Login successo | Skip landing, vai direttamente a `/today` | |
| 6 | Mobile DevTools (iPhone, Android) | Layout regge, safe-area visibile | |
| 7 | `prefers-reduced-motion: reduce` (DevTools) | Animazioni disattivate, render statico | |
| 8 | Lighthouse | PWA ≥ 90, Accessibility ≥ 90 | |

Se uno scenario fallisce: NON marcare il task come completo. Diagnostica e correggi prima.

**Step 12.5: Verifica contrasto WCAG AA**

Usa DevTools → Lighthouse → Accessibility, oppure manualmente verifica con [contrastchecker.com](https://contrastchecker.com):
- Gold accent `#D9A544` (o equivalente HSL `35 85% 55%`) su dark `#121212` → contrast ratio ≥ 4.5:1

**Step 12.6: Commit finale di tagging (opzionale)**

Se serve un commit di "feature complete":

```bash
cd c:/martial-arts
git commit --allow-empty -m "feat(landing): feature completa, DoD verificato"
```

---

## Esclusioni esplicite (non implementare)

Da `plan/2026-04-26-landing-page-design.md` §9:

- Niente copy esplicativa "cos'è skill-practice"
- Niente form di registrazione/waiting list
- Niente multilingua (solo italiano + cinese tradizionale)
- Niente cookie banner / privacy link
- Niente analytics / tracking
- Niente A/B test
- Niente layout differenziato tablet/desktop (max-width container basta)

---

## Fine piano

**Riepilogo task:**
1. Script pulizia SVG + asset committato
2. Configurazione SVGR
3. Helper destination + 4 test unitari
4. Font Noto Serif TC
5. HorseEmblem component
6. EnterButton component
7. Animazioni CSS
8. LandingHero component
9. Root page renderizza landing
10. Login + signOut redirect aggiornati
11. Aggiornamento `current-plan.md` §15.6
12. Verifica finale DoD

**12 commit attesi**, ciascuno atomico e build-safe.
