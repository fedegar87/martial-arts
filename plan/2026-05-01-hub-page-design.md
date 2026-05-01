# Hub page — design doc

**Status:** Approved (brainstorming concluso, revisione tecnica applicata)
**Data:** 2026-05-01
**Tipo:** Feature design (estensione del flusso landing → app)
**Sostituisce:** —
**Sprint target:** Sprint operativo 2.x

> **Revisione 2026-05-01:** dopo review tecnica esterna sono stati corretti 5 punti:
> 1. `/hub` aggiunto a `PROTECTED_PREFIXES` (era assunto erroneamente "già protetto da `(app)/*`")
> 2. Rimosso `(app)/hub/layout.tsx` (i layout Next sono additivi, non sostitutivi)
> 3. Estratto helper `isProfileOnboarded` per evitare check duplicati e inconsistenti fra `landing.ts` e `onboarding/page.tsx`
> 4. `AppHeader` reso **non-sticky** (scrolla via) per evitare collisioni con sticky pre-esistenti su `/today` e `/sessions/calendar`
> 5. News inclusa come 6° tile dell'hub (era stata rimandata)

---

## 1. Contesto

Oggi il flusso di ingresso è:

```
landing /  →  click "Entra"  →  /today  ←→  BottomNav (5 tab) per altre aree
```

`/today` è un'azione (la pratica del giorno), non una "panoramica". Per chi apre l'app non sempre vuole praticare subito: a volte vuole guardare il programma, sfogliare la libreria, vedere i progressi, leggere la bacheca.

Questo design introduce una **home permanente** — l'**hub** — fra la landing e l'app. L'hub è un crocevia panoramico che mostra le aree dell'app in grande e permette di scegliere dove andare. La BottomNav resta visibile dentro le aree per spostarsi velocemente; l'hub è alternativa contemplativa, raggiungibile sempre via ideogramma 丙午 in `AppHeader`.

Coerente con la metafora della landing (lock-screen rituale): la landing è la soglia, l'hub è il "cosa scegli oggi".

---

## 2. Decisioni chiuse durante il brainstorming

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| H1 | Quando appare l'hub | Home permanente, non solo soglia d'ingresso una-tantum |
| H2 | Hub vs BottomNav | **B1**: hub permanente + BottomNav resta. Hub = panoramica, BottomNav = velocità |
| H3 | Flusso post-landing | **α**: landing → "Entra" → `/hub` → scegli area. Login/onboarding → `/hub` |
| H4 | Come tornare all'hub da una pagina | `AppHeader` (non-sticky) con ideogramma 丙午 cliccabile in alto |
| H5 | Cosa includere nell'hub | **6 aree**: Oggi, Programma, Scuola Chang, Progressi, Profilo, **Bacheca** (news) |
| H6 | News nell'hub | Inclusa come 6° tile (decisione presa post-review). Banner Today resta per unread |
| H7 | Layout tile | Lista verticale grande, 6 tile in colonna |
| H8 | Tile pure vs dinamiche | **A**: tile pure (titolo + sottotitolo statico). Niente count o stato dinamico |
| H9 | Stile tile | Outlined oro 1px + icone lucide (coerenza con CTA "Entra" della landing) |
| H10 | Header globale | Minimale: solo 丙午 a sinistra, niente titolo pagina, niente lato destro |
| H11 | Header visibilità | Tutte le `(app)/*` tranne `/hub`. Niente su `/` (landing) |
| H12 | Header sticky? | **No**: scrolla via con il contenuto (evita collisioni con sticky pre-esistenti) |
| H13 | Animazioni mount | **α**: staggered fade-in (heading + 6 tile), 100ms apart. `prefers-reduced-motion` aware |
| H14 | Sfondo hub | Cavallo watermark fixed, opacity ~0.05, in basso a destra |
| H15 | BottomNav layout | Resta a 5 tab invariata (Profilo dentro). News raggiungibile da hub e da banner Today |

---

## 3. Architettura

### 3.1 Routing e protezione

| Route | Stato attuale | Stato post-implementazione |
|-------|---------------|----------------------------|
| `/` | Landing rituale | Invariata, ma CTA destination cambia per utenti onboardati |
| `/hub` | Non esiste | **NUOVA** — Server Component, 6 tile verticali |
| `/today`, `/programma`, `/library`, `/progress`, `/profile`, `/news` | Pagine BottomNav o secondarie | Invariate, ma con `AppHeader` sopra |
| `/login`, `/onboarding` | Invariate | Redirect post-success → `/hub` (era `/today`) |

**Protezione `/hub`:** la protezione auth NON è basata sul route group `(app)` — è basata su un array hardcoded `PROTECTED_PREFIXES` in `src/lib/supabase/middleware.ts`. Senza modifica, `/hub` sarebbe pubblicamente accessibile senza sessione. Va aggiunto `/hub` (e per consistenza segnalo i gap pre-esistenti su `/progress` e `/sessions`).

### 3.2 Logica CTA della landing (cambia)

Pseudocodice in `src/app/page.tsx`:

```typescript
const profile = await getCurrentProfileSafe();

let destination: string;
if (!profile) destination = "/login";
else if (!isProfileOnboarded(profile)) destination = "/onboarding";
else destination = "/hub";   // era "/today"

return <LandingHero ctaHref={destination} />;
```

**Helper condiviso `isProfileOnboarded`:** estratto per uniformare il check, oggi duplicato e inconsistente fra `landing.ts` (tratta `plan_mode === "custom"` come onboarded) e `onboarding/page.tsx` (controlla solo `preparing_exam_id`). Il bug pre-esistente è che un utente con `plan_mode = custom` senza esami selezionati va in loop fra le due rotte. La definizione canonica diventa:

```typescript
// src/lib/onboarding-state.ts
type OnboardingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
  plan_mode?: "exam" | "custom";
};

export function isProfileOnboarded(profile: OnboardingProfile): boolean {
  if (profile.plan_mode === "custom") return true;
  return Boolean(profile.preparing_exam_id || profile.preparing_exam_taichi_id);
}
```

Usata in: `src/lib/landing.ts`, `src/app/(app)/hub/page.tsx`, `src/app/(app)/onboarding/page.tsx`.

### 3.3 Nuovi file

| Path | Scopo |
|------|-------|
| `src/lib/onboarding-state.ts` | Helper `isProfileOnboarded(profile)` + tipo `OnboardingProfile` |
| `src/lib/onboarding-state.test.ts` | Test del helper (4 casi: senza profilo gestito dai caller, con esame, custom senza esami, niente di niente) |
| `src/app/(app)/hub/page.tsx` | Server Component: gating onboarding via helper, renderizza HubGrid + HubBackground |
| `src/components/hub/HubGrid.tsx` | Lista verticale 6 tile, server component |
| `src/components/hub/HubTile.tsx` | Singola tile outlined oro: icona lucide + titolo + sottotitolo, `<Link>` |
| `src/components/hub/HubBackground.tsx` | Cavallo watermark fixed, riusa l'asset SVG esistente |
| `src/components/shared/AppHeader.tsx` | Header **non-sticky**: ideogramma 丙午 cliccabile (→ `/hub`) |
| `src/components/shared/AppHeaderConditional.tsx` | Client wrapper che nasconde `AppHeader` su `/hub` via `usePathname()` |

**NIENTE `(app)/hub/layout.tsx`**: i layout Next sono additivi, non sostitutivi — un layout annidato non rimuoverebbe `AppHeader`. Si usa il client wrapper.

### 3.4 File modificati

| Path | Modifica |
|------|----------|
| `src/lib/landing.ts` | Usa `isProfileOnboarded`. Return `/hub` invece di `/today` per onboardati |
| `src/lib/landing.test.ts` | 3 test "torna /today" → "torna /hub" |
| `src/app/page.tsx` | Invariato (la logica è in `resolveLandingDestination`) |
| `src/app/(app)/onboarding/page.tsx` | Usa `isProfileOnboarded` (era check `preparing_exam_id` only). Redirect onboardato → `/hub` |
| `src/lib/actions/onboarding.ts:96` | `redirect("/today")` → `redirect("/hub")` |
| `src/app/auth/callback/route.ts:7` | Default `?? "/today"` → `?? "/hub"` |
| `src/lib/supabase/middleware.ts` | Aggiunge `/hub` a `PROTECTED_PREFIXES`. Bonus: aggiunge `/progress` e `/sessions` (gap pre-esistente) |
| `src/app/(app)/layout.tsx` | Aggiunge `<AppHeaderConditional />` come prima riga (non-sticky, normale flow) |
| `plan/current-plan.md` | §7 nav: aggiunge hub + AppHeader. §15.6 flusso. §5 struttura |

### 3.5 File invariati

- `src/components/nav/BottomNav.tsx` — resta 5 tab (Profilo dentro)
- `src/components/landing/*` — solo CTA destination diversa
- `public/landing/cavallo-fuoco.svg` — riusato per watermark hub
- `src/components/today/page.tsx` — invariato (header sticky interno resta sticky, niente collisioni grazie a H12)
- `src/components/sessions/CalendarMonth.tsx` — invariato (idem)

---

## 4. Layout dell'hub

### 4.1 Composizione (mobile-first, max-width ~28rem centrato)

> Il layout `(app)/layout.tsx` ha `max-w-2xl` (32rem). L'hub costringe ulteriormente a `max-w-md` (~28rem) tramite il proprio `<section>` per coerenza con il design contemplativo.

```
┌─ section, max-w-md, padding 24px ───────────┐
│                                              │
│  [HubBackground: cavallo fixed, opacity .05]│
│                                              │
│  Dove vuoi praticare oggi?                  │   ← Geist 500, ~22px, foreground
│  Scegli un'area.                             │   ← Geist 400, ~14px, muted
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  🏠  OGGI                              │ │
│  │      la tua pratica del giorno         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  🎯  PROGRAMMA                         │ │
│  │      esami e modalità di studio        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  📚  SCUOLA CHANG                      │ │
│  │      libreria delle skill              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  📊  PROGRESSI                         │ │
│  │      cosa hai praticato                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  📣  BACHECA                           │ │
│  │      comunicazioni della scuola        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  👤  PROFILO                           │ │
│  │      livello, esame, settings          │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

### 4.2 Spaziatura verticale

- Top safe-area → heading: `pt-[env(safe-area-inset-top)] mt-8`
- Heading → sottotitolo: `mt-1`
- Sottotitolo → prima tile: `mt-8`
- Tile → tile: gap-3
- Bottom: `pb-24` (spazio sopra BottomNav + safe-area-inset-bottom)

### 4.3 Tipografia

| Elemento | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| Heading hub | Geist | 22px | 500 | `var(--foreground)` |
| Sottotitolo hub | Geist | 14px | 400 | `var(--muted-foreground)` |
| Tile titolo | Geist | 18px tracking-wide | 600 | `var(--foreground)` |
| Tile sottotitolo | Geist | 13px | 400 | `var(--muted-foreground)` |
| Icona lucide | — | 24px | — | `var(--accent)` |

### 4.4 Tile — palette stati

| Stato | Bordo | Background | Note |
|-------|-------|------------|------|
| Default | `var(--accent)` 1px | transparent | Coerente con CTA "Entra" |
| Hover | `var(--accent)` 1px | `var(--accent)/0.05` | Lieve fill oro |
| Active (tap) | `var(--accent)` 1px | `var(--accent)/0.1` | scale-[0.98] 100ms |
| Focus-visible | `var(--accent)` 2px outline | — | A11y |

### 4.5 Tile — dimensions

- Padding interno: `px-5 py-4`
- Border radius: `rounded-xl` (allineato a `--radius` 0.75rem)
- Min height: ~76px (touch target generoso, ≥48px)
- Icona left, testo right con `gap-4`

### 4.6 Iconografia (lucide, coerente con BottomNav)

| Area | Route | Icona | Titolo | Sottotitolo |
|------|-------|-------|--------|-------------|
| Oggi | `/today` | `Home` | OGGI | la tua pratica del giorno |
| Programma | `/programma` | `Target` | PROGRAMMA | esami e modalità di studio |
| Scuola Chang | `/library` | `BookOpenText` | SCUOLA CHANG | libreria delle skill |
| Progressi | `/progress` | `BarChart3` | PROGRESSI | cosa hai praticato |
| Bacheca | `/news` | `Megaphone` | BACHECA | comunicazioni della scuola |
| Profilo | `/profile` | `User` | PROFILO | livello, esame, settings |

---

## 5. Header globale (`AppHeader`)

### 5.1 Layout

```
┌─ block normale (NON sticky), height ~56px, hairline border-b ──┐
│                                                                  │
│   丙午                                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
   ↑ scrolla via insieme al contenuto
```

### 5.2 Specifiche

| Proprietà | Valore |
|-----------|--------|
| Position | **Block normale** (NON sticky, NON fixed). Scrolla via |
| Height | `h-14` (56px) + `pt-[env(safe-area-inset-top)]` |
| Sfondo | `material-bar hairline` (coerenza con BottomNav) |
| Border | `border-b` con `var(--border)` |
| Padding | `px-5` |
| Allineamento | `flex items-center` |

**Perché non sticky:** [`today/page.tsx:101`](skill-practice/src/app/(app)/today/page.tsx#L101) ha già un `<header sticky top-0 z-30>` interno con il titolo della pagina, e [`CalendarMonth.tsx:10`](skill-practice/src/components/sessions/CalendarMonth.tsx#L10) ha sticky senza z-index. Un AppHeader sticky `top-0 z-40` causerebbe collisioni: i sub-sticky scivolerebbero sotto. Mantenere AppHeader nel flow normale evita il conflitto. Il prezzo: l'ideogramma 丙午 non è sempre visibile durante lo scroll. Trade-off accettato (coerenza > convenienza).

### 5.3 Ideogramma 丙午 (sinistra)

| Proprietà | Valore |
|-----------|--------|
| Font | `Noto Serif TC` (già caricato per landing) |
| Weight | 700 |
| Size | ~24px |
| Color | `var(--accent)` |
| Cliccabile | `<Link href="/hub">` |
| Tap target | `min-h-12 min-w-12` |
| Aria-label | `"Torna alla home"` |
| Hover | opacity 0.8 |

### 5.4 Visibilità (client conditional)

`<AppHeaderConditional />` è un Client Component che usa `usePathname()` per nascondersi su `/hub`:

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

Montato come prima riga in `src/app/(app)/layout.tsx`. Trade-off: piccolo client boundary (acceptable) per non duplicare layout server-side via `headers()`.

> **Nota tecnica importante:** il pattern "creare `(app)/hub/layout.tsx` per togliere l'header" NON funziona — i layout Next sono additivi, mai sostitutivi. Quel file non viene creato.

### 5.5 Effetti collaterali

- Pagine `(app)/*` perdono ~56px in cima (l'header) ma poi lo riprendono allo scroll (non-sticky). Il `<main>` esistente non richiede modifiche di padding.
- Niente conflitti con sticky pre-esistenti.
- BottomNav `fixed bottom-0 z-50` invariata.

---

## 6. Animazioni

Tutte sotto `@media (prefers-reduced-motion: no-preference)`. CSS-only, niente JS animation library.

### 6.1 Mount staggered hub

| Elemento | Animazione | Durata | Delay |
|----------|-----------|--------|-------|
| Heading "Dove vuoi praticare?" | opacity 0→1, ty 8→0 | 500ms ease-out | 0 |
| Sottotitolo | opacity 0→1 | 500ms ease-out | 100ms |
| Tile 1 (Oggi) | opacity 0→1, ty 12→0 | 500ms ease-out | 200ms |
| Tile 2 (Programma) | opacity 0→1, ty 12→0 | 500ms ease-out | 300ms |
| Tile 3 (Scuola) | opacity 0→1, ty 12→0 | 500ms ease-out | 400ms |
| Tile 4 (Progressi) | opacity 0→1, ty 12→0 | 500ms ease-out | 500ms |
| Tile 5 (Bacheca) | opacity 0→1, ty 12→0 | 500ms ease-out | 600ms |
| Tile 6 (Profilo) | opacity 0→1, ty 12→0 | 500ms ease-out | 700ms |

Implementazione: 8 classi `.hub-anim-heading`, `.hub-anim-subtitle`, `.hub-anim-tile-1 ... .hub-anim-tile-6` in `globals.css`, riusano i keyframes `landing-mount-fade*` esistenti.

### 6.2 Cavallo watermark

- `position: fixed`, `bottom: 0`, `right: 0`, `pointer-events: none`
- `opacity: 0.05`, width ~70% viewport, `aria-hidden`
- Niente animazione idle (defocalizzato, animarlo distrae)
- **z-index**: `z-0` con wrapper `<section className="relative">` sull'hub (non `-z-10` che rischia di finire dietro il `bg-background` del layout). Il watermark va dietro alle tile ma sopra al background.

### 6.3 Tile stati interattivi

- Default: bordo accent 1px, bg transparent
- Hover: bg `var(--accent)/0.05`, transition 200ms
- Active: `scale-[0.98]` 100ms (riusa `tap-feedback`)
- Focus-visible: outline 2px accent, offset 2px

### 6.4 Header

Niente animazione mount. È statico, scrolla normalmente.

---

## 7. Error handling

| Caso | Comportamento |
|------|---------------|
| `/hub` accesso senza sessione | `middleware.ts` redirige a `/login` (richiede `/hub` in `PROTECTED_PREFIXES`) |
| `/hub` accesso senza onboarding | Server Component verifica `isProfileOnboarded(profile)`. Falso → `redirect("/onboarding")` |
| Errore fetch profilo Supabase | Try/catch in `page.tsx`, fallback `redirect("/login")`. Mai schermo bianco |
| Logout da pagina interna | Coerente con landing: redirect a `/`, non a `/hub` |
| `prefers-reduced-motion: reduce` | Animazioni mount disattivate, render statico immediato |
| Utente con `plan_mode=custom` senza esami | `isProfileOnboarded` torna `true` → atterra su `/hub` correttamente. **Bug pre-esistente risolto** (prima andava in loop) |

---

## 8. Testing & DoD

### 8.1 Test automatici

| File | Test |
|------|------|
| `src/lib/onboarding-state.test.ts` | 4 casi: con esame kung fu → true; con esame tai chi → true; plan_mode custom senza esami → true; niente di niente → false |
| `src/lib/landing.test.ts` | 3 casi aggiornati per `/hub` invece di `/today`; 1 caso aggiunto: custom senza esami → /hub (verifica del bug fixato) |

### 8.2 Test manuali (golden path + edge)

| # | Scenario | Esito atteso |
|---|----------|--------------|
| 1 | `/` no sessione → tap "Entra" | Redirect a `/login` |
| 2 | `/` con sessione + onboarding → tap "Entra" | Redirect a `/hub` |
| 3 | `/` con sessione senza onboarding | Redirect a `/onboarding` |
| 4 | `/hub` carica con sessione valida | 6 tile visibili, animazione staggered, cavallo watermark in basso |
| 5 | `/hub` accesso diretto senza sessione | Middleware redirige a `/login` |
| 6 | `/hub` accesso senza onboarding | Server redirige a `/onboarding` |
| 7 | Tap su tile "Oggi" da `/hub` | `/today`, header con 丙午 visibile, BottomNav visibile |
| 8 | Da `/today` tap su 丙午 nell'header | Torna a `/hub` |
| 9 | Da `/today` scroll giù | Sub-header sticky resta in alto, AppHeader scrolla via (no overlap) |
| 10 | `/sessions/calendar` scroll giù | Sticky month heading funziona, AppHeader scrolla via |
| 11 | Tap su tile "Bacheca" | `/news`, header visibile, BottomNav visibile (news non è in BottomNav) |
| 12 | Su `/hub` l'header NON appare | OK |
| 13 | Logout da `/profile` | Redirect a `/` |
| 14 | Login con utente onboardato | Redirect a `/hub` |
| 15 | Utente custom senza esami → login | Redirect a `/hub` (era loop fra /onboarding e /today) |
| 16 | `prefers-reduced-motion: reduce` | Animazioni hub disattivate |
| 17 | Mobile iOS Safari (PWA) | Safe-area top per header (anche se non sticky), bottom per BottomNav |
| 18 | Lighthouse `/hub` | Accessibility ≥ 90, Performance ≥ 90 |
| 19 | WCAG AA contrast tile | ≥ 4.5:1 |

### 8.3 Definition of Done

- `npm run lint` passa
- `npm run test` passa (incluso nuovo `onboarding-state.test.ts`)
- `npm run build` passa con Turbopack
- Test manuali #1, #2, #4, #7, #8, #9, #10, #14, #15 verificati
- `plan/current-plan.md` aggiornato (§5 struttura, §7 nav, §15.6 flusso)
- Nessuna nuova dipendenza npm
- BottomNav resta 5 tab (Profilo dentro)
- `/hub`, `/progress`, `/sessions` aggiunti a `PROTECTED_PREFIXES`

---

## 9. Esclusioni esplicite (per non sforare scope)

| Cosa | Perché NO |
|------|-----------|
| Avatar profilo top-right nell'header | Esclusa — Profilo resta come tile dell'hub. Decisione esplicita post-review |
| Info dinamiche nelle tile | H8 — tile pure |
| Nuovi token CSS / palette | Riuso `globals.css` esistente |
| Modifiche alla landing page | Solo CTA destination cambia (`/hub` invece di `/today`) |
| Animazione idle cavallo watermark | Defocalizzato, animarlo distrae |
| Cambiare layout BottomNav | Resta 5 tab uguale (News raggiungibile da hub) |
| News in BottomNav | Resta solo in hub e banner Today. BottomNav invariata |
| Skeleton loader | Hub è statico server-rendered |
| Sticky AppHeader | Esclusa per evitare collisioni con sub-sticky pre-esistenti |
| `(app)/hub/layout.tsx` | Esclusa — i layout Next sono additivi, non funzionerebbe |
| Refactor di `today/page.tsx` sticky | Fuori scope — il sub-header resta com'è grazie a AppHeader non-sticky |

---

## 10. Riferimenti

- Piano principale: `plan/current-plan.md` (§7 navigazione, §15.6 landing, §16 design system)
- Landing design: `plan/2026-04-26-landing-page-design.md`
- Visual identity: `plan/visual-identity-plan.md`
- Implementation plan: `plan/2026-05-01-hub-page-plan.md`
