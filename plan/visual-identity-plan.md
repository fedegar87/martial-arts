# Visual Identity Plan — FESK Theme per Skill Practice PWA

**Status:** Implementato in `skill-practice` — 2026-04-25
**Obiettivo:** Traslare l'identità visiva premium, tradizionale e autorevole progettata per il sito istituzionale FESK (Dark + Gold) all'interno della PWA `skill-practice`. L'obiettivo è sostituire l'attuale tema generico (shadcn Nova/Geist neutro) con un'interfaccia che comunichi la profondità e l'eredità storica del Kung Fu Chang, mantenendo intatta l'usabilità mobile-first della PWA.

---

## 1. PALETTE COLORI (Dark + Gold)

La PWA utilizzerà un tema strettamente scuro (Dark Mode Only). Il nero profondo comunica tradizione e serietà, mentre gli accenti dorati donano un senso "premium" ed "heritage".

### Colori Base (Tailwind/CSS Vars)
*   **Background Base (`--bg` / `--background`)**: `#080808` (Nero profondo, non flat black)
*   **Background Raised (`--bg-raised` / `--card`)**: `#111111` (Per card, bottom nav, modal)
*   **Background Sunken (`--bg-sunken` / `--muted`)**: `#050505` o `#1e1c1a` (Per sezioni secondarie o skeleton loading)

### Accenti Principali
*   **Oro Antico (`--gold` / `--primary`)**: `#c8a84b` (Usa per pulsanti primari, active tab, icone importanti)
*   **Oro Smorzato (`--gold-muted`)**: `#8a6e2f` (Bordi, sottolineature sottili)
*   **Glow Dorato (`--gold-glow`)**: `rgba(200, 168, 75, 0.12)` (Effetti hover su card tappabili)
*   **Rosso Funzionale (`--destructive`)**: `#7a1818` (Richiama il colore della cintura/divisa, usare solo per azioni distruttive o alert critici)

### Testo
*   **Testo Primario (`--text-primary` / `--foreground`)**: `#e8dfd0` (Bianco caldo/avorio, non puro)
*   **Testo Secondario (`--text-secondary` / `--muted-foreground`)**: `#9a8f80` (Caption, date, descrizioni secondarie)
*   **Testo Smorzato (`--text-muted`)**: `#4a4540` (Placeholder, testi disabilitati)

### Bordi
*   **Bordo Standard (`--border`)**: `#1e1c1a` (Bordi di default per card e divisori)
*   **Bordo Dorato (`--border-gold`)**: `rgba(200, 168, 75, 0.25)` (Bordi attivi, card focus)

---

## 2. TIPOGRAFIA

L'uso dei font serif eleva la percezione dell'app da "tool utilitario" a "quaderno tecnico storico".

*   **Display & Headings (Titoli Pagine, Nomi Forme): `Cormorant Garamond` (Serif)**
    *   *Uso:* Titoli principali (`h1`, `h2`), nomi delle skill in alto nelle pagine di dettaglio, eventuali quote del M° Chang. Conferisce eleganza calligrafica.
*   **Body (Testo Corrente, Note Tecniche): `Spectral` o `Source Serif 4` (Serif)**
    *   *Uso:* Descrizioni lunghe, le "Teacher Notes" delle skill, testi informativi. L'uso del serif nel body text differenzia la PWA dalle solite app commerciali, ricordando la pagina stampata de "Il Libro del Cinabro".
*   **Label & Navigazione: `Bebas Neue` (Sans-serif, Uppercase)**
    *   *Uso:* Tab della BottomNav, status badge (FOCUS, RIPASSO), etichette delle categorie (FORME, TECNICHE BASE). Sempre in maiuscolo con elevato letter-spacing (es. `tracking-widest`).
*   **Numeri & Dati Funzionali: `Space Mono` (Monospace)**
    *   *Uso:* Timer video, livelli (1° CHIEH), conteggio giorni di pratica, contatori esame.
*   **Caratteri Decorativi (Opzionale): `Noto Serif SC`**
    *   *Uso:* Singoli ideogrammi usati come icone di background in bassa opacità per specifiche categorie (es. pugni, forme).

---

## 3. DIMENSIONI E LAYOUT (Mobile-First)

*   **Spaziatura (Padding/Margin):** Ampia ed elegante. Utilizzare margini abbondanti tra le sezioni per far "respirare" i contenuti.
*   **Bordi Arrotondati (Border Radius):**
    *   Le forme del Kung Fu Chang hanno molta linearità e precisione. Abbandonare il full-rounded (pillole).
    *   Usare `rounded-sm` (2-4px) per bottoni e badge.
    *   Usare `rounded-md` (6-8px) al massimo per i container dei video o le grandi card. Niente bordi eccessivamente curvi.
*   **Touch Targets:** Minimo `48x48px` per usabilità PWA (Apple HIG & Android guidelines).
*   **Animazioni e Transizioni:** Molto fluide e lente (es. `duration-300` o `duration-500` con `ease-in-out`), evitando bounce esagerati. Effetto fade-in o impercettibile translate-y per le liste di skill.

---

## 4. APPLICAZIONE AI COMPONENTI CORE

### Bottom Navigation
*   **Sfondo:** `#111111` con `border-t border-[#1e1c1a]` e `backdrop-blur`.
*   **Stato Inattivo:** Icona e testo in `#9a8f80`.
*   **Stato Attivo:** Icona e testo in `#c8a84b` (`--gold`), font `Bebas Neue`. Niente background pillole, solo un underline dorato sottile o colorazione dell'icona.

### Today Skill Card (La pratica quotidiana)
*   **Sfondo:** `#111111` (`--card`).
*   **Bordo:** Sottile `#1e1c1a`. Se lo stato è "FOCUS", applicare `border-gold` o un leggero `box-shadow` oro (`--gold-glow`).
*   **Titolo Forme:** `Cormorant Garamond`, generoso (es. `text-2xl`).
*   **Badge Stato (Focus/Review/Maint):** Rettangolare, testo `Bebas Neue` uppercase, piccolo (`text-xs tracking-widest`).
    *   Focus: Bordo oro, testo oro.
    *   Ripasso: Bordo grigio, testo grigio chiaro.
*   **Teacher Notes:** Dentro un riquadro con sfondo `#050505`, testo in `Spectral` italic, per enfatizzare che è la voce del maestro.

### Video Player (Embed)
*   **Trattamento:** Bordo rettangolare pulito, niente bordi estremi arrotondati.
*   Se applicabile tramite sovrapposizione in CSS, un leggero filtro seppia sulla thumbnail di YouTube prima del play per integrarlo cromaticamente con l'app, tornando al colore originale on-play.

### Badge Livelli e Gradi
*   Utilizzare la palette "martial" con parsimonia: invece di usare sfondi pieni colorati per le cinture (che stonerebbero con il dark/gold), usare testo/border per i gradi.
*   Font `Space Mono` per "7° CHI" o "1° CHIEH".

### Pulsante "Fatto" (PracticeCheckButton)
*   Stile fantasma (Ghost) con bordo oro prima del tap.
*   Su tap: riempimento oro scuro/smorzato, testo nero/scuro, icona check (animazione fade lenta).

---

## 5. INTEGRAZIONE CON SHADCN/TAILWIND

Attualmente il progetto usa la convenzione shadcn. La configurazione di Tailwind (`globals.css`) dovrà essere riscritta per mappare questi nuovi colori sulle variabili native di shadcn:

```css
@layer base {
  :root {
    --background: 0 0% 3%; /* #080808 */
    --foreground: 40 33% 86%; /* #e8dfd0 */

    --card: 0 0% 7%; /* #111111 */
    --card-foreground: 40 33% 86%;

    --popover: 0 0% 7%;
    --popover-foreground: 40 33% 86%;

    --primary: 43 53% 54%; /* #c8a84b (Gold) */
    --primary-foreground: 0 0% 3%; /* Testo scuro su bottoni primari */

    --secondary: 0 0% 12%; /* #1e1c1a */
    --secondary-foreground: 40 10% 58%; /* #9a8f80 */

    --muted: 0 0% 5%; /* #050505 */
    --muted-foreground: 40 10% 58%;

    --accent: 43 53% 54%;
    --accent-foreground: 0 0% 3%;

    --destructive: 0 67% 29%; /* #7a1818 */
    --destructive-foreground: 40 33% 86%;

    --border: 0 0% 12%; /* #1e1c1a */
    --input: 0 0% 12%;
    --ring: 43 53% 54%; /* Glow di focus sull'oro */

    --radius: 0.25rem; /* Ridotto per un look più solido e meno "bolla" */
  }
}
```

---

## 6. ASSET E ATMOSFERA (Filtri)

### Il Trattamento Fotografico (Se presenti immagini utente/esami)
Applicare il filtro `sepia(0.15) contrast(1.05) brightness(0.92) saturate(0.8)` a qualsiasi foto o thumbnail caricata, per uniformarle all'identità visiva della scuola.

### Background Grain
Inserire nel `layout.tsx` globale della PWA l'elemento decorativo `.grain-overlay` (tile di noise png a bassa opacità). Questo rimuove la piattezza tipica del digitale, dando allo schermo un feel da pellicola o carta pregiata scura, estremamente coerente con le "Arti Marziali Tradizionali".

```css
/* In globals.css */
.grain-overlay {
  position: fixed; inset: 0;
  background-image: url('/icons/noise.png'); /* Aggiungere in public */
  opacity: 0.12; mix-blend-mode: overlay;
  pointer-events: none; z-index: 50;
}
```

## Sintesi per gli Sviluppi Futuri
Questo aggiornamento trasforma l'app `skill-practice` da uno strumento puramente funzionale a un "Tempio Digitale" personale. Ogni modifica alla UI nei futuri Sprint (es. Menu contestuali in Sprint 1.7 o Bacheca in Sprint 2) dovrà rispettare:
1.  **Niente sfondi bianchi o chiari.**
2.  **L'Oro (`#c8a84b`) è l'unico colore di risalto concesso** (oltre a rosso per distruzione o verde/grigio per status mantenimento).
3.  **L'uso corretto dei font** (Cormorant per gerarchia/titoli, Spectral per contenuto, Bebas per UI labels).

## 7. STATO IMPLEMENTAZIONE

- Palette dark/gold applicata in `src/app/globals.css` tramite variabili shadcn/Tailwind.
- Overlay grain implementato via CSS puro (`.grain-overlay`) in `src/app/layout.tsx`, senza asset esterni.
- Componenti core aggiornati: `Button`, `Badge`, `Card`, `BottomNav`, `StatusBadge`, `TodaySkillCard`, `VideoPlayer`.
- Font dichiarati come stack CSS (`Cormorant Garamond`, `Spectral`, `Bebas Neue`) con fallback locali; non sono stati aggiunti download o dipendenze runtime.
