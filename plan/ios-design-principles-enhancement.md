# iOS Design Principles — Enhancement per GUI/UX Audit

**Status:** Addendum a `gui-ux-experience-audit.md`
**Data:** 2026-04-25
**Obiettivo:** Estrarre i principi chiave dal design system Apple iOS (HIG 2025, Liquid Glass, motion, materials) e tradurli in regole operative per la PWA Skill Practice FESK.

---

## 1. Cosa insegna Apple — Principi fondamentali

Apple non decora: **struttura**. Ogni scelta visiva risponde a uno di questi quattro pilastri:

| Pilastro | Definizione Apple | Traduzione FESK |
|---|---|---|
| **Clarity** | L'interfaccia è leggibile, precisa, non decorata | Il contenuto (forma, video, nota maestro) è il protagonista, non la card che lo contiene |
| **Deference** | La UI si toglie di mezzo; il contenuto parla | Dark/gold deve *incorniciare* la pratica, non competere con essa |
| **Depth** | Layer, ombre e motion creano gerarchia spaziale | Superfici elevate per azioni, superfici affossate per contesto |
| **Consistency** | Pattern ripetuti, comportamento prevedibile | Un solo `SegmentedControl`, un solo stile card, un solo pattern modale |

---

## 2. Colori — Dal flat al semantico stratificato

### Cosa fa Apple

- **Colori semantici**, non valori fissi: `label`, `secondaryLabel`, `tertiaryLabel`, `systemBackground`, `secondarySystemBackground`
- **Tre livelli di sfondo** in dark mode: base → grouped → elevated
- **Accento singolo** (tint color) usato con parsimonia per CTA e stato attivo
- **Vibrancy**: testo su materiali trasparenti adatta automaticamente luminosità e saturazione

### Cosa cambia nel piano FESK

**A. Introdurre layer semantici espliciti nelle CSS variables:**

```css
/* Layer System (Dark Mode) */
--surface-base:      hsl(0 0% 3%);        /* #080808 — sfondo app */
--surface-grouped:   hsl(0 0% 7%);        /* #111111 — card, sezioni */
--surface-elevated:  hsl(30 4% 11%);      /* modali, sheet, popover */
--surface-inset:     hsl(0 0% 2%);        /* #050505 — teacher note, code */

/* Testo semantico — non "primary/secondary" ma per ruolo */
--label:             hsl(40 33% 86%);     /* #e8dfd0 titoli, body */
--label-secondary:   hsl(40 10% 55%);     /* descrizioni, meta */
--label-tertiary:    hsl(40 8% 30%);      /* placeholder, disabilitato */
--label-quaternary:  hsl(40 5% 18%);      /* hint, ghost text */

/* Separatori — iOS usa opacità, non colori fissi */
--separator:         hsla(40 10% 50% / 0.12);
--separator-opaque:  hsl(30 4% 14%);
```

**B. Regola d'uso dell'oro:**

- Oro pieno (`#c8a84b`) SOLO per: tint color attivo, CTA primaria, tab selezionata
- Oro al 25% opacità: bordi focus, glow hover
- Oro al 8% opacità: sfondo subtle di card selezionate
- **Mai** oro su testo body o come sfondo pieno di grandi superfici

**C. Status colors con vibrancy adattiva:**

```css
--status-success:    hsl(142 60% 45%);   /* praticato oggi */
--status-warning:    hsl(38 90% 50%);    /* in scadenza esame */
--status-error:      hsl(0 67% 45%);     /* saltato, problema */
--status-info:       hsl(210 60% 55%);   /* nuovo, aggiornamento */
```

Usarli SOLO su badge e indicatori compatti, mai come sfondo card.

---

## 3. Forme e Superfici — Dal bordo alla profondità

### Cosa fa Apple

- **Continuous corner radius** (squircle), non border-radius CSS standard
- **Tre livelli di radius**: piccolo (8px badge/chip), medio (12-16px card/sheet), grande (20-24px modal/grouped)
- **Ombre stratificate**: non una singola `box-shadow` ma 2-3 ombre a opacità diverse
- **Separazione per elevazione**, non per bordi: in dark mode i bordi sono quasi assenti, la gerarchia è data dal colore di superficie

### Cosa cambia nel piano FESK

**A. Sistema radius coerente (sostituisce il `radius: 0.25rem` attuale):**

```css
--radius-sm:   6px;    /* badge, chip, bottoni inline */
--radius-md:   12px;   /* card, input, select */
--radius-lg:   16px;   /* sheet, modal, grouped sections */
--radius-xl:   20px;   /* onboarding card, hero container */
--radius-full: 9999px; /* avatar, indicatori circolari */
```

**B. Ombre per elevazione (dark mode):**

```css
--shadow-sm:  0 1px 2px hsla(0 0% 0% / 0.3);
--shadow-md:  0 2px 8px hsla(0 0% 0% / 0.4), 0 1px 2px hsla(0 0% 0% / 0.2);
--shadow-lg:  0 8px 24px hsla(0 0% 0% / 0.5), 0 2px 8px hsla(0 0% 0% / 0.3);
```

**C. Regola chiave: eliminare bordi decorativi.**

| Prima (attuale) | Dopo (iOS-informed) |
|---|---|
| Card con `border: 1px solid #1e1c1a` | Card con `background: var(--surface-grouped)` + `shadow-sm`, nessun bordo |
| Divider `<hr>` pieno | `border-top: 0.5px solid var(--separator)` (hairline, come iOS) |
| Badge con bordo oro pieno | Badge con `background: hsla(43 53% 54% / 0.12)` + testo oro |
| Bottom nav con `border-top` pesante | Bottom nav con `backdrop-filter: blur(20px)` + sfondo traslucido |

---

## 4. Trasparenze e Materiali — Liquid Glass per il web

### Cosa fa Apple

- **Materials**: superfici traslucide che lasciano intravedere il contenuto sottostante
- **Vibrancy**: il testo su materiali adatta colore/luminosità per restare leggibile
- **Regola fondamentale**: trasparenza SOLO su elementi interattivi flottanti (toolbar, tab bar, navigation), MAI sul layer base
- **Fallback accessibilità**: se l'utente attiva "Riduci trasparenza", i materiali diventano sfondi opachi

### Cosa cambia nel piano FESK

**A. Materiali CSS per gli elementi flottanti:**

```css
.material-bar {
  background: hsla(0 0% 7% / 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.material-sheet {
  background: hsla(0 0% 9% / 0.85);
  backdrop-filter: saturate(150%) blur(30px);
  -webkit-backdrop-filter: saturate(150%) blur(30px);
}

@media (prefers-reduced-transparency) {
  .material-bar, .material-sheet {
    background: var(--surface-elevated);
    backdrop-filter: none;
  }
}
```

**B. Dove applicare materiali (e dove NO):**

| Componente | Materiale | Motivo |
|---|---|---|
| Bottom Navigation | `.material-bar` | Flottante, il contenuto scrolla sotto |
| Header sticky Today | `.material-bar` | Il piano attivo resta visibile sopra la queue |
| Sheet "Fatto" / nota | `.material-sheet` | Overlay modale, non copre tutto |
| Card skill nella queue | **NO** — opaco `--surface-grouped` | È contenuto, non UI flottante |
| Teacher note box | **NO** — opaco `--surface-inset` | Deve essere chiaramente distinto |

**C. Grain overlay — ridurre o eliminare:**

Il `.grain-overlay` a `opacity: 0.12` può interferire con `backdrop-filter`. Opzioni:
1. Ridurre a `opacity: 0.04` e portare `z-index` sotto i materiali
2. Eliminare il grain e compensare con texture via gradient noise CSS

---

## 5. Motion e Animazioni — Dalla decorazione alla fisica

### Cosa fa Apple

- **Spring-based**: modello fisico a molla, non curve Bézier
- **Durate corte**: 100-500ms
- **Motion funzionale**: ogni animazione comunica una relazione causale
- **Reduce Motion**: tutte le animazioni hanno fallback cross-fade
- **Tre categorie**: feedback (< 200ms), transizione (200-400ms), narrativa (> 400ms, rara)

### Cosa cambia nel piano FESK

**A. Curve di animazione iOS-like:**

```css
--ease-spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-feedback: 150ms;

--ease-spring-smooth: cubic-bezier(0.25, 1.0, 0.5, 1.0);
--duration-transition: 300ms;

--ease-spring-gentle: cubic-bezier(0.22, 1.0, 0.36, 1.0);
--duration-narrative: 500ms;

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.15s !important;
  }
}
```

**B. Mappa animazioni per componente:**

| Componente | Animazione | Tipo | Durata |
|---|---|---|---|
| Bottone "Fatto" tap | Scale 1→0.95→1 + check fade-in | Feedback | 150ms |
| Card skill espansione | Height auto + content fade-in | Transizione | 300ms |
| Sheet "aggiungi nota" | Slide-up + overlay fade | Transizione | 350ms |
| Tab switch bottom nav | Icon cross-fade + label weight | Feedback | 200ms |
| Onboarding step avanti | Slide-left con spring overshoot | Transizione | 400ms |
| Badge "Nuovo" pulse | Scale 1→1.05→1 loop | Narrativa | 2000ms |
| Lista skill stagger | Fade-in + translateY(8→0), 50ms delay | Transizione | 250ms |

---

## 6. Impatto sulle Schermate — Revisioni specifiche

### 6.1 Bottom Navigation

- `.material-bar` con blur, non sfondo opaco
- Cross-fade icona 200ms, no bounce
- Indicatore attivo: dot/underline con spring-snappy
- `padding-bottom: env(safe-area-inset-bottom)`

### 6.2 Today — Sessione guidata

- Header sticky: `.material-bar` con piano attivo e CTA
- Card con `--surface-grouped`, nessun bordo, `shadow-sm`
- Tap espande card con spring-smooth 300ms
- Stagger loading: 50ms delay, `translateY(8px)` → 0
- CTA "Inizia sessione": oro pieno, `scale(0.97)` su press

### 6.3 Programma/Libreria

- `SegmentedControl` iOS-style con pill animata spring
- Separatori hairline `0.5px`, nessun bordo card
- Lock state: opacità 0.4 + lucchetto

### 6.4 Skill Detail

- Metadati: chips compatti, `--radius-sm`, sfondo `hsla(gold/0.08)`
- Teacher note: `--surface-inset` con bordo-left hairline oro 20%
- CTA piano sticky: `.material-bar` in basso

### 6.5 Onboarding

- Step transition: slide orizzontale spring-gentle 400ms
- Step indicator dots con spring-snappy scale
- Selezione disciplina: card con `scale(0.98)` → gold border spring

### 6.6 Progressi

- Top summary: 4 metriche con counter animato (count-up 600ms)
- Calendario: celle `--radius-sm`, intensità via opacità oro
- Radar: linee sottili, animazione draw-in su mount

---

## 7. Design Token — Struttura a tre livelli

```
Livello 1: Primitivi (valori grezzi)
  --gold-500: hsl(43 53% 54%);
  --neutral-900: hsl(0 0% 3%);

Livello 2: Semantici (ruolo)
  --surface-base: var(--neutral-900);
  --tint: var(--gold-500);
  --label: var(--warm-100);

Livello 3: Componente (scope)
  --card-bg: var(--surface-grouped);
  --card-radius: var(--radius-md);
  --btn-primary-bg: var(--tint);
```

Questo permette di cambiare tema modificando solo il livello 2.

---

## 8. Checklist implementativa — Priorità

### Fase iOS-0 (integrata in UX-0)

- [ ] Riorganizzare `globals.css` con token a 3 livelli
- [ ] Sostituire `border` card con elevation via `background` + `shadow`
- [ ] Aggiungere variabili motion (`--ease-spring-*`, `--duration-*`)
- [ ] Bottom nav: `backdrop-filter` + safe area
- [ ] `prefers-reduced-motion` media query globale
- [ ] `prefers-reduced-transparency` fallback

### Fase iOS-1 (integrata in UX-1)

- [ ] `SegmentedControl` con pill animata spring
- [ ] Separatori hairline `0.5px`
- [ ] Stagger animation sulle liste skill
- [ ] Header sticky con `.material-bar`

### Fase iOS-2 (integrata in UX-2/UX-3)

- [ ] Card espansione con spring-smooth
- [ ] Sheet "Fatto" con slide-up + blur
- [ ] Onboarding step con slide spring
- [ ] Counter animati su Progress
- [ ] Tap feedback `scale(0.97)` globale

---

## 9. Anti-pattern da evitare

| Anti-pattern | Perché Apple lo evita | Rischio FESK |
|---|---|---|
| Blur ovunque | Performance, leggibilità | Grain + blur su ogni card = soup visiva |
| Bounce esagerato | Non naturale, distrae | Spring con damping troppo basso |
| Troppi colori accento | Diluisce il tint color | Verde/amber/blu come tint concorrenti all'oro |
| Animazioni > 500ms | Percepisce lentezza | Transizioni "cinematiche" su azioni frequenti |
| Trasparenza su contenuto | Testo illeggibile | Material su card body o teacher note |
| Radius misti | Incoerenza percepita | 4px qui, 16px là, pill altrove |
| Shadow forte in dark | Sembra sporco | `box-shadow` con opacità alta su nero |

---

## 10. Sintesi

L'audit originale identificava correttamente che il problema non è estetico ma **gerarchico**. I principi iOS rafforzano questa diagnosi:

1. **Colori semantici a livelli** → gerarchia visiva chiara senza bordi
2. **Materiali solo su UI flottante** → separazione contenuto/navigazione
3. **Spring animation** → feedback fisico naturale, non decorativo
4. **Radius coerente** → identità visiva unificata
5. **Reduce motion/transparency** → accessibilità nativa

Il risultato atteso: un'app che si sente **nativa e autorevole**, non "sito web in un wrapper". L'oro FESK diventa il tint color unico, le superfici comunicano profondità, e ogni animazione ha una ragione fisica.
