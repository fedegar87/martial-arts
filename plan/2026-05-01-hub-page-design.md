# Hub page — design doc

**Status:** Approved (brainstorming concluso)
**Data:** 2026-05-01
**Tipo:** Feature design (estensione del flusso landing → app)
**Sostituisce:** —
**Sprint target:** Sprint operativo 2.x

---

## 1. Contesto

Oggi il flusso di ingresso è:

```
landing /  →  click "Entra"  →  /today  ←→  BottomNav (5 tab) per altre aree
```

`/today` è un'azione (la pratica del giorno), non una "panoramica". Per chi apre l'app non sempre vuole praticare subito: a volte vuole guardare il programma, sfogliare la libreria, vedere i progressi.

Questo design introduce una **home permanente** — l'**hub** — fra la landing e l'app. L'hub è un crocevia panoramico che mostra le 5 aree dell'app in grande e permette di scegliere dove andare. La BottomNav resta visibile dentro le aree per spostarsi velocemente; l'hub è alternativa contemplativa, raggiungibile sempre.

Coerente con la metafora della landing (lock-screen rituale): la landing è la soglia, l'hub è il "cosa scegli oggi".

---

## 2. Decisioni chiuse durante il brainstorming

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| H1 | Quando appare l'hub | Home permanente, non solo soglia d'ingresso una-tantum |
| H2 | Hub vs BottomNav | **B1**: hub permanente + BottomNav resta a 5 tab. Hub = panoramica, BottomNav = velocità |
| H3 | Flusso post-landing | **α**: landing → "Entra" → `/hub` → scegli area. Login/onboarding → `/hub` |
| H4 | Come tornare all'hub da una pagina | Header globale con ideogramma 丙午 cliccabile in alto |
| H5 | Cosa includere nell'hub | 5 aree (Oggi, Programma, Scuola Chang, Progressi, Profilo). Profilo dentro per ora |
| H6 | News nell'hub | Rimandata — gestiamo dopo |
| H7 | Layout tile | Lista verticale grande, 5 tile in colonna |
| H8 | Tile pure vs dinamiche | **A**: tile pure (titolo + sottotitolo statico). Niente count o stato dinamico |
| H9 | Stile tile | Outlined oro 1px + icone lucide (coerenza con CTA "Entra" della landing) |
| H10 | Header globale | Minimale: solo 丙午 a sinistra, niente titolo pagina, niente lato destro |
| H11 | Header visibilità | Tutte le `(app)/*` tranne `/hub`. Niente su `/` (landing) |
| H12 | Animazioni mount | **α**: staggered fade-in (heading + 5 tile), 100ms apart. `prefers-reduced-motion` aware |
| H13 | Sfondo hub | Cavallo watermark fixed, opacity ~0.05, in basso a destra |

---

## 3. Architettura

### 3.1 Routing

| Route | Stato attuale | Stato post-implementazione |
|-------|---------------|----------------------------|
| `/` | Landing rituale | Invariata, ma CTA destination cambia per utenti onboardati |
| `/hub` | Non esiste | **NUOVA** — Server Component, 5 tile verticali |
| `/today`, `/programma`, `/library`, `/progress`, `/profile` | Pagine BottomNav | Invariate, ma con `AppHeader` sopra |
| `/login`, `/onboarding` | Invariate | Redirect post-success → `/hub` (era `/today`) |

### 3.2 Logica CTA della landing (cambia)

Pseudocodice in `src/app/page.tsx`:

```typescript
const profile = await getCurrentProfileSafe();

let destination: string;
if (!profile) destination = "/login";
else if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) destination = "/onboarding";
else destination = "/hub";   // era "/today"

return <LandingHero ctaHref={destination} />;
```

Fallback su errore Supabase: `destination = "/login"`.

### 3.3 Nuovi file

| Path | Scopo |
|------|-------|
| `src/app/(app)/hub/page.tsx` | Server Component: gating onboarding, renderizza `HubGrid` |
| `src/app/(app)/hub/layout.tsx` | Override silenzioso del parent layout: niente `AppHeader` su `/hub` |
| `src/components/hub/HubGrid.tsx` | Lista verticale 5 tile, server component |
| `src/components/hub/HubTile.tsx` | Singola tile outlined oro: icona lucide + titolo + sottotitolo, `<Link>` |
| `src/components/hub/HubBackground.tsx` | Cavallo watermark fixed, riusa `HorseEmblem` |
| `src/components/shared/AppHeader.tsx` | Header globale: ideogramma 丙午 cliccabile (→ `/hub`) |

### 3.4 File modificati

| Path | Modifica |
|------|----------|
| `src/app/page.tsx` | CTA destination: utente onboardato → `/hub` invece di `/today` |
| `src/app/(app)/layout.tsx` | Aggiunge `<AppHeader />` sopra `{children}` |
| `src/lib/actions/auth.ts` (o equivalente) | Login/onboarding success → redirect `/hub` invece di `/today` |
| `plan/current-plan.md` | §7 nav: aggiunge hub + AppHeader. §15.6 flusso. §5 struttura |

### 3.5 File invariati (importante)

- `src/proxy.ts` — `/hub` è dentro `(app)/*`, già protetto dal gating esistente
- `src/components/nav/BottomNav.tsx` — resta 5 tab
- `src/components/landing/*` — solo CTA destination diversa
- `public/landing/cavallo-fuoco.svg` — riusato per watermark hub

---

## 4. Layout dell'hub

### 4.1 Composizione (mobile-first, max-width ~28rem centrato)

```
┌─ container, padding 24px, min-h-svh ────────┐
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
| Profilo | `/profile` | `User` | PROFILO | livello, esame, settings |

---

## 5. Header globale (`AppHeader`)

### 5.1 Layout

```
┌─ sticky top, height ~56px, hairline border-b ──┐
│                                                  │
│   丙午                                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5.2 Specifiche

| Proprietà | Valore |
|-----------|--------|
| Height | `h-14` (56px) + `pt-[env(safe-area-inset-top)]` |
| Sfondo | `material-bar hairline` (riusa classe BottomNav) |
| Border | `border-b` con `var(--border)` |
| Posizione | `sticky top-0 z-40` (BottomNav è z-50) |
| Padding | `px-5` |
| Allineamento | `flex items-center` |

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

### 5.4 Visibilità (layout annidati Next)

- `src/app/(app)/layout.tsx`: monta `<AppHeader />` sopra `{children}`
- `src/app/(app)/hub/layout.tsx`: nuovo, renderizza solo `{children}` → niente header su `/hub`
- `src/app/page.tsx` (landing): non è dentro `(app)` → header non viene montato. Invariato.

### 5.5 Effetti collaterali

- Pagine sotto `(app)/*` perdono ~56px di altezza utile. Verifica visiva post-implementazione su `/today`, `/programma`, `/library`, `/progress`, `/profile`. Lo `min-h-svh` esistente continua a funzionare; eventuali sticky/fixed interni vanno controllati.
- BottomNav `fixed bottom-0 z-50` + AppHeader `sticky z-40` → nessun conflitto.

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
| Tile 5 (Profilo) | opacity 0→1, ty 12→0 | 500ms ease-out | 600ms |

Implementazione: classi Tailwind con keyframes inline in `globals.css` (riuso pattern landing). 5 classi `.hub-tile-1 ... .hub-tile-5` per evitare inline style.

### 6.2 Cavallo watermark

- `position: fixed`, `bottom: 0`, `right: 0`, `pointer-events: none`
- `opacity: 0.05`, width ~70% viewport, `aria-hidden`
- Niente animazione idle (defocalizzato, animarlo distrae)

### 6.3 Tile stati interattivi

- Default: bordo accent 1px, bg transparent
- Hover: bg `var(--accent)/0.05`, transition 200ms
- Active: `scale-[0.98]` 100ms (riusa `tap-feedback` se esistente)
- Focus-visible: outline 2px accent, offset 2px

### 6.4 Header

Niente animazione mount (sticky, sempre presente, animarlo distrae).

---

## 7. Error handling

| Caso | Comportamento |
|------|---------------|
| `/hub` accesso senza sessione | Proxy redirige a `/login` (gating `(app)/*` esistente) |
| `/hub` accesso senza onboarding | Server Component verifica `profile.preparing_exam_id`. Mancante → `redirect("/onboarding")` |
| Errore fetch profilo Supabase | Try/catch in `page.tsx`, fallback `redirect("/login")`. Mai schermo bianco |
| Logout da pagina interna | Coerente con landing (decisione L13): redirect a `/`, non a `/hub` |
| `prefers-reduced-motion: reduce` | Animazioni mount disattivate, render statico immediato |

---

## 8. Testing & DoD

### 8.1 Test manuali (golden path + edge)

| # | Scenario | Esito atteso |
|---|----------|--------------|
| 1 | `/` no sessione → tap "Entra" | Redirect a `/login` |
| 2 | `/` con sessione + onboarding → tap "Entra" | Redirect a `/hub` (nuovo) |
| 3 | `/` con sessione senza onboarding → tap "Entra" | Redirect a `/onboarding` |
| 4 | `/hub` carica con sessione valida | 5 tile visibili, animazione staggered, cavallo watermark in basso |
| 5 | `/hub` accesso diretto senza sessione | Proxy redirige a `/login` |
| 6 | `/hub` accesso senza onboarding | Server redirige a `/onboarding` |
| 7 | Tap su tile "Oggi" da `/hub` | Naviga a `/today`, header con 丙午 visibile, BottomNav visibile |
| 8 | Da `/today` tap su 丙午 nell'header | Torna a `/hub` |
| 9 | Da `/today` tap su tab BottomNav (es. Programma) | Naviga, header e BottomNav restano |
| 10 | Su `/hub` l'header NON appare | Layout annidato override conferma assenza |
| 11 | Logout da `/profile` | Redirect a `/` (landing, invariato) |
| 12 | Login riuscito da `/login` | Redirect a `/hub` (era `/today`) |
| 13 | `prefers-reduced-motion: reduce` | Animazioni hub disattivate, render statico |
| 14 | Mobile iOS Safari (PWA) | Safe-area top per header, safe-area bottom per BottomNav |
| 15 | Lighthouse `/hub` | Accessibility ≥ 90, Performance ≥ 90 |
| 16 | WCAG AA contrast tile | Bordo accent + testi ≥ 4.5:1 |
| 17 | Tap target tile + header | ≥ 48px verificato |

### 8.2 Definition of Done

- `npm run lint` passa
- `npm run build` passa con Turbopack
- Test manuali #1, #2, #4, #7, #8, #10, #12 verificati
- `plan/current-plan.md` aggiornato:
  - §7 navigazione: aggiunge `/hub` + AppHeader
  - §15.6: aggiorna flusso landing → hub
  - §5 struttura: aggiunge nuovi file
- Nessuna nuova dipendenza npm
- BottomNav resta 5 tab (Profilo dentro)
- News non toccato

---

## 9. Esclusioni esplicite (per non sforare scope)

| Cosa | Perché NO |
|------|-----------|
| News (`/news`) come 6° tile | Decisione rimandata — gestiamo dopo |
| Avatar top-right nell'header | Decisione rimandata — Profilo resta nell'hub |
| Info dinamiche nelle tile | H8 — tile pure |
| Nuovi token CSS / palette | Riuso `globals.css` esistente |
| Modifiche alla landing page | Solo CTA destination cambia (`/hub` invece di `/today`) |
| Animazione idle cavallo watermark | Defocalizzato, animarlo distrae |
| Cambiare layout BottomNav | Resta 5 tab uguale |
| Skeleton loader | Hub è statico server-rendered |
| Rimuovere/spostare tab esistenti | Continuità totale, BottomNav invariata |

---

## 10. Riferimenti

- Piano principale: `plan/current-plan.md` (§7 navigazione, §15.6 landing, §16 design system)
- Landing design: `plan/2026-04-26-landing-page-design.md`
- Visual identity: `plan/visual-identity-plan.md`
