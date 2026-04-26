# Landing page — design doc

**Status:** Approved (brainstorming concluso)
**Data:** 2026-04-26
**Tipo:** Feature design (deviazione consapevole dal piano §15.6)
**Sostituisce:** —
**Sprint target:** Sprint operativo 1.x o 2.x

---

## 1. Contesto

Il piano §15.6 dichiara: _"Per MVP personale: non serve [landing page]. La PWA stessa è il punto d'ingresso."_

Questo design **devia consapevolmente** da quella decisione per ragioni di **identità visiva pura**, non di marketing né di onboarding. Motivazione dichiarata dall'utente:

> "Solo identità/estetica, nessuna spiegazione, solo una vetrina/porta di ingresso carina"

Metafora portante: **lock screen di Windows**. La landing è sempre il primo schermo all'apertura dell'app, anche per utente già loggato. Non spiega niente, non fa onboarding, non vende. È una soglia rituale prima della pratica.

L'aggiornamento del piano §15.6 con questa eccezione fa parte del Definition of Done.

---

## 2. Decisioni chiuse durante il brainstorming

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| L1 | Tipo di landing | Hero + CTA only, identità/estetica pura, no copy esplicativa |
| L2 | Visibilità | Sempre su `/`, anche per utente loggato (lock-screen sempre presente) |
| L3 | CTA dinamica | Determinata server-side da `getCurrentProfile()`: nessuna sessione → `/login`; sessione senza onboarding → `/onboarding`; sessione + onboardato → `/today` |
| L4 | Asset visivo | Illustrazione cavallo al galoppo + nuvole, vettorializzata da `Screenshot_20260217-163743~2.png` (Dropbox utente) |
| L5 | Trattamento SVG | Rimozione fill rossi di fondo, mantenimento cream cavallo + arancio nuvole, no ricolorazione |
| L6 | Citazione | 學而不厭 (Confucio) — "apprendere e non esserne mai sazio" |
| L7 | Ideogramma | 丙午 (Bǐng Wǔ — Anno del Cavallo di Fuoco), tradizionale |
| L8 | Forma scrittura cinese | Tradizionale (il citato è già 學而不厭, 丙午 identico in entrambe forme) |
| L9 | Layout | Approccio C — "Pergamena verticale" mobile-first (cavallo top, ideogramma+citazione al centro, CTA bottom) |
| L10 | Stile CTA | Outlined gold, non filled. Suggerisce soglia, non grida azione |
| L11 | Animazioni | CSS-only, `prefers-reduced-motion` aware, mount staggered fade-in + idle "respiro" cavallo |
| L12 | `start_url` PWA | `/` — la landing è sempre presente anche al lancio della PWA installata |
| L13 | Logout redirect | A `/` (landing), non a `/login`. Coerente con metafora lock-screen |
| L14 | Font cinese | Noto Serif TC (Google Fonts), weights 500/700 |

---

## 3. Architettura

### 3.1 Routing

| Route | Stato attuale | Stato post-implementazione |
|-------|---------------|----------------------------|
| `/` | Server Component che redirige a `/login` o `/today` | Server Component che renderizza la **landing** |
| `/login` | Form login | Invariato |
| `/today` | Today protetto | Invariato |
| `(app)/*` | Route protette via `proxy.ts` | Invariato |

`src/proxy.ts` deve esporre `/` come pubblica (oltre `/login`, `/auth/callback`).

### 3.2 Logica CTA (server-side, niente JS client)

Pseudocodice in `src/app/page.tsx`:

```typescript
const profile = await getCurrentProfileSafe();  // try/catch wrapper

let destination: string;
if (!profile) destination = "/login";
else if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) destination = "/onboarding";
else destination = "/today";

return <LandingHero ctaHref={destination} />;
```

Fallback su errore Supabase: `destination = "/login"`. Mai schermo bianco.

### 3.3 Nuovi file

| Path | Scopo |
|------|-------|
| `public/landing/cavallo-fuoco.svg` | SVG ripulito (~50-70 KB dopo SVGO) |
| `src/components/landing/LandingHero.tsx` | Server Component, riceve `ctaHref` |
| `src/components/landing/HorseEmblem.tsx` | SVG inline come React component |
| `src/components/landing/EnterButton.tsx` | `<Link>` con stile outlined gold |
| `scripts/clean-landing-svg.mjs` | Script Node monouso per pulizia SVG |

### 3.4 File modificati

| Path | Modifica |
|------|----------|
| `src/app/page.tsx` | Rimuove redirect, renderizza LandingHero |
| `src/proxy.ts` | Aggiunge `/` alla whitelist pubblica |
| `src/app/layout.tsx` | Aggiunge import `Noto_Serif_TC` da `next/font/google` |
| `public/manifest.json` | Verifica/imposta `start_url: "/"` |
| `next.config.js` | Configurazione SVGR per import SVG come componente React |
| `src/lib/actions/auth.ts` (o equivalente) | Logout redirect a `/` invece di `/login` |
| `plan/current-plan.md` | Aggiornamento §15.6 con deviazione documentata |

---

## 4. Layout & componenti

### 4.1 Composizione (mobile-first, max-width ~28rem centrato)

```
┌─ container, padding 24px, min-h-svh ───┐
│                                         │
│  [HorseEmblem ~280h, cream/arancio      │
│   su transparent + grain overlay]       │
│                                         │
│             丙午                         │   Noto Serif TC 700, ~96px, accent
│                                         │
│           學而不厭                        │   Noto Serif TC 500, ~40px, foreground
│                                         │
│   apprendere e non esserne mai sazio    │   Geist italic, ~16px, muted
│                                         │
│             — Confucio                   │   Geist, ~13px, muted-foreground/70
│                                         │
│      ┌─────────────────────┐            │
│      │       Entra         │            │   bordo accent, bg transparent
│      └─────────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Spaziatura verticale

- Cavallo → 丙午: `mt-8`
- 丙午 → 學而不厭: `mt-6`
- 學而不厭 → traduzione: `mt-4`
- traduzione → autore: `mt-2`
- autore → CTA: `mt-12` (vuoto rituale prima dell'azione)
- bottom: `pb-12` + `env(safe-area-inset-bottom)`

### 4.3 Tipografia

| Elemento | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| 丙午 | Noto Serif TC | ~96px / 80px mobile | 700 | `var(--accent)` |
| 學而不厭 | Noto Serif TC | ~40px | 500 | `var(--foreground)` |
| Traduzione italiana | Geist | ~16px italic | 400 | `var(--muted-foreground)` |
| Autore | Geist | ~13px | 400 | `var(--muted-foreground)` + `opacity-70` |
| CTA | Geist | ~18px tracking-wide | 500 | `var(--accent)` |

### 4.4 Palette (riuso `globals.css` §16.3, niente modifiche)

| Elemento | Token |
|----------|-------|
| Background | `var(--background)` near-black + grain overlay esistente |
| Cavallo SVG | nativo `#f8c387` cream + arancio (no recolor) |
| Ideogramma + CTA | `var(--accent)` amber gold `35 85% 55%` |
| Citazione | `var(--foreground)` cream `0 0% 95%` |
| Traduzione + autore | `var(--muted-foreground)` `0 0% 65%` |
| CTA hover | bg `var(--accent)`, testo `var(--background)` |

---

## 5. Trattamento SVG

### 5.1 Pulizia colori

L'SVG vettorializzato (`FreeSample-Vectorizer-io-Screenshot_20260217-163743~2.svg`, 145 KB, 14 colori) contiene fill di background da rimuovere.

| Tieni | Drop |
|-------|------|
| `#f8c387` (cream cavallo) | `#1e0807`, `#250707`, `#320708`, `#760d0d` (dark fondo) |
| `#bc622d`, `#bd6a31`, `#cf7b30`, `#da8733` (nuvole) | `#831f16`, `#941d19`, `#a4281f` (rosso fondo) |
| | `#9d3c20`, `#ab5125` (fiori rossi) |

### 5.2 Pipeline

1. `scripts/clean-landing-svg.mjs`: parsa l'SVG sorgente, filtra `<path>` con fill nelle 7 tinte da scartare, salva pulito
2. Run SVGO: `npx svgo --input cleaned.svg --output public/landing/cavallo-fuoco.svg`
3. Verifica visiva: aprire l'SVG nel browser, controllare che cavallo + nuvole siano integri su transparent
4. Peso atteso finale: 50-70 KB

### 5.3 Embed

Inline come React component via SVGR:

```jsx
import HorseEmblem from "@/public/landing/cavallo-fuoco.svg";

<HorseEmblem className="w-full max-w-xs h-auto" aria-hidden />
```

Configurazione in `next.config.js` per loader SVGR. Vantaggi: nessuna richiesta HTTP extra, animabile via CSS, no FOIC.

---

## 6. Animazioni (CSS-only)

Tutte sotto `@media (prefers-reduced-motion: no-preference)`.

### 6.1 Mount staggered fade-in

| Elemento | Animazione | Durata | Delay |
|----------|-----------|--------|-------|
| Cavallo | opacity 0→1, translate-y 20→0 | 800ms ease-out | 0 |
| 丙午 | opacity 0→1, translate-y 8→0 | 600ms ease-out | 200ms |
| 學而不厭 | opacity 0→1 | 600ms ease-out | 400ms |
| Traduzione | opacity 0→1 | 600ms ease-out | 600ms |
| Autore | opacity 0→1 | 600ms ease-out | 700ms |
| CTA | opacity 0→1 | 600ms ease-out | 900ms |

### 6.2 Cavallo idle

`animation: breath 6s ease-in-out infinite` — translate-y ±4px. Solo dopo che il mount fade-in è terminato (delay 800ms).

### 6.3 CTA stati

- Default: bordo `var(--accent)` 1px, bg transparent
- Hover: bg fade-in `var(--accent)`, testo → `var(--background)`, transition 300ms
- Active: `scale-[0.98]` per 100ms

---

## 7. Error handling

| Caso | Comportamento |
|------|---------------|
| `getCurrentProfile()` solleva eccezione | Try/catch, fallback `destination = "/login"`. Landing visibile normalmente |
| Sessione scaduta | `getCurrentProfile()` ritorna `null`, CTA → `/login` |
| Font cinese non carica | `display: swap`, fallback Geist (perde gravitas, resta leggibile) |
| SVG malformato | Bundle error a build time, non runtime — colto da `npm run build` |
| `prefers-reduced-motion: reduce` | Animazioni disattivate, render statico immediato |

---

## 8. Testing & DoD

### 8.1 Test manuali (golden path + edge)

| # | Scenario | Esito atteso |
|---|----------|--------------|
| 1 | `/` no sessione | Landing visibile, CTA → `/login` |
| 2 | `/` sessione + onboarded | Landing visibile, CTA → `/today` |
| 3 | `/` sessione senza onboarding | Landing visibile, CTA → `/onboarding` |
| 4 | `/` sessione scaduta | Landing visibile, CTA → `/login` |
| 5 | Mobile iOS Safari (PWA installata) | Safe-area rispettata, font cinesi caricati |
| 6 | Mobile Android Chrome | Idem |
| 7 | Lighthouse desktop + mobile | PWA ≥ 90, Accessibility ≥ 90, Performance ≥ 90 |
| 8 | WCAG AA contrast | Gold su dark ≥ 4.5:1 (verificato in piano §16.3) |
| 9 | `prefers-reduced-motion` ON | Animazioni disattivate, render statico |
| 10 | Logout da app | Redirect a `/` (landing), non `/login` |

### 8.2 Definition of Done

- `npm run lint` passa
- `npm run build` passa con Turbopack
- Test manuali #1, #2, #10 verificati manualmente
- SVG asset pulito e committato in `public/landing/`
- `plan/current-plan.md` §15.6 aggiornato con la deviazione consapevole
- Asset originali (PNG, SVG vectorizer) NON committati nel repo

---

## 9. Esclusioni esplicite (per non sforare scope)

| Cosa | Perché NO |
|------|-----------|
| Copy esplicativa "cos'è skill-practice" | L11 — solo identità, no spiegazione |
| Form di registrazione/waiting list | L1 — solo CTA verso `/login` |
| Multilingua | Piano §10 esclude multi-lingua |
| Cookie banner / privacy policy link | Piano §15.1 — zero requisiti per MVP single-user |
| Analytics / tracking | Niente GA/Plausible per MVP (piano §15.3) |
| A/B test / variant | Identità unica, niente split |
| Tablet/desktop layout differenziato | Mobile-first basta, max-width container regge entrambi |

---

## 10. Riferimenti

- Piano principale: `plan/current-plan.md` (§7 navigazione, §15.6 landing escluse, §16 design system)
- Visual identity: `plan/visual-identity-plan.md`
- Asset sorgente PNG: `C:\Users\FGarzia\Dropbox\fede\Screenshot_20260217-163743~2.png` (NON committare)
- Asset vettorializzato: `C:\Users\FGarzia\Downloads\FreeSample-Vectorizer-io-Screenshot_20260217-163743~2.svg` (NON committare il sorgente, solo l'output ripulito in `public/landing/`)
- Citazione fonte: 論語 7.2 (Analetti di Confucio, capitolo 7 verso 2)
