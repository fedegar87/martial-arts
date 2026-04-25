# Sprint 1.6 — VideoPlayer custom (lazy YouTube)

**Status:** Implemented in code — verifica manuale DevTools Network ancora da eseguire
**Versione:** v1
**Ultimo aggiornamento:** 2026-04-25
**Sostituisce:** `src/components/skill/YouTubeEmbed.tsx`
**Dipende da:** `plan/current-plan.md` (Sprint 1) e `plan/sprint-curriculum-fesk.md` (per i nuovi nomi categoria + `practice_mode`)

---

## 0. CONTESTO IN UNA FRASE

Sostituire l'iframe YouTube auto-caricato con un **placeholder custom + lazy iframe** per eliminare 2-4MB di JS YouTube dal first paint della schermata "Oggi" e mostrare un'anteprima coerente con il design dell'app (icona categoria + nome skill + bottone play) invece di una thumbnail YouTube generica.

---

## 1. PROBLEMA E OBIETTIVO

### 1.1 Problema

Il componente `YouTubeEmbed.tsx` attuale ([file](skill-practice/src/components/skill/YouTubeEmbed.tsx)) inietta un iframe YouTube standard al render della pagina. Conseguenze:

- Ogni iframe scarica ~500KB-1.3MB di JS YouTube **prima** del play
- Schermata "Oggi" con 4 skill = ~2-4MB di download per visualizzare 4 placeholder
- Thumbnail YouTube auto-generate (frame casuali, spesso brutti)
- Logo YouTube + "Guarda su YouTube" + video correlati visibili anche con `rel=0`
- First paint mobile: 3-5 secondi su 4G; LCP scarso

### 1.2 Obiettivo

- 0 KB di JS YouTube prima del tap
- Placeholder visivamente integrato col tema (nessuna thumbnail YouTube)
- Caricamento iframe **on-demand**, un video alla volta
- Nessuna nuova dipendenza npm
- Predisposizione a futuro controllo velocità / loop / capitoli (vedi §9)

---

## 2. POSIZIONAMENTO RISPETTO AGLI ALTRI PIANI

Questo sprint è una **micro-evoluzione UI**, completamente locale al componente `VideoPlayer`. Non tocca:

- Schema DB, migration, RLS
- Server Actions, queries, practice-logic
- Auth flow, middleware
- PWA setup, security headers

**Dipende da Sprint 1.5 FESK perché:**

- Le icone categoria del nuovo `getCategoryIcon` (`tui_fa`, `po_chi`, `chin_na`, ecc.) coincidono con i valori dell'enum `skill_category` post-FESK
- La prop `practiceMode` (`solo` / `paired` / `both`) esiste solo dopo la migration 0003
- `PracticeModeBadge` introdotto in FESK §7.7 viene riutilizzato qui

> Se per qualche motivo lo sprint FESK slitta, questa refactor è ancora eseguibile **senza** la prop `practiceMode` e con `getCategoryIcon` che restituisce sempre `🥋` per le categorie vecchie. Vedi §10 fallback.

---

## 3. DECISIONI CHIUSE

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| **V1** | Lazy load strategy | **Click-to-load**, non `IntersectionObserver`. Più semplice, più prevedibile, e su "Oggi" l'utente in genere apre 1-2 video, non scrolla alla cieca |
| **V2** | Dominio iframe | `youtube-nocookie.com` (privacy-friendly, no cookie tracking fino al play) |
| **V3** | `autoplay=1` sull'iframe | Sì — l'utente ha già premuto play sul placeholder, deve essere un singolo gesto |
| **V4** | Boundary client/server | `VideoPlayer` è **Client Component** (`"use client"`), usa `useState`. Le pagine che lo importano restano Server Component — solo il componente è client-side |
| **V5** | Sostituzione `YouTubeEmbed` | Rinominare il file in `VideoPlayer.tsx` con `git mv` per preservare la storia, poi riscrivere il contenuto. Nessun shim "deprecated" — sostituzione netta |
| **V6** | `lib/youtube.ts` | Mantenuto come modulo helper. La nuova funzione `extractYouTubeId` viene messa qui (purezza + testabilità), il componente la importa. **Non duplicare nel componente** |
| **V7** | Icone categoria | Emoji (no SVG, no asset). Un mapping in `lib/labels.ts` (creato in Sprint FESK) restituisce l'emoji per categoria. Fallback `🥋` |
| **V8** | URL placeholder | URL contenente `PLACEHOLDER` o non riconoscibile come YouTube → stato "Video non ancora disponibile". **Non** lanciare errore |
| **V9** | Mantenere `practiceMode` opzionale | Sì, default `undefined` → niente badge. Permette di usare il componente in contesti dove la skill non è ancora caricata |
| **V10** | Verifica performance | **Test manuale Network tab DevTools** (non Lighthouse CI in questo sprint). Acceptance esplicita su "0 richieste youtube prima del tap" |

---

## 4. DECISIONI APERTE

| # | Decisione | Note | Priorità |
|---|-----------|------|----------|
| **V11** | IntersectionObserver per video sotto la fold | Da valutare se gli utenti scrollano spesso oltre 2-3 video. Per ora click-to-load basta | 🟢 Dopo 30 giorni di uso |
| **V12** | Custom controls (velocità, loop, capitoli) | Richiede YouTube IFrame Player API (~50KB di JS). Da implementare quando D7 di `current-plan.md` viene chiusa | 🟢 Sprint 3+ |
| **V13** | Switch a video self-hosted MP4 | Solo se D7 si chiude verso "switch a MP4". Strutturare la prop `source` allora | 🟢 Sprint 3+ |
| **V14** | Pre-fetch del primo video al mount | Compromesso: caricare 1 iframe al mount riduce latenza al primo play ma costa ~500KB. Non ora | 🟢 Mai, salvo metriche reali |

---

## 5. SPECIFICA COMPONENTE

### 5.1 File: `src/components/skill/VideoPlayer.tsx`

```tsx
"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { extractYouTubeId } from "@/lib/youtube"
import { categoryEmoji } from "@/lib/labels"
import type { SkillCategory, PracticeMode } from "@/lib/types"
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge"

type Props = {
  videoUrl: string
  title: string
  category?: SkillCategory
  practiceMode?: PracticeMode
}

export function VideoPlayer({ videoUrl, title, category, practiceMode }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoId = extractYouTubeId(videoUrl)

  if (!videoId) return <UnavailablePlaceholder category={category} />

  if (isPlaying) {
    return (
      <div className="relative w-full">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
        {practiceMode && (
          <div className="absolute right-2 top-2">
            <PracticeModeBadge mode={practiceMode} compact />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsPlaying(true)}
        aria-label={`Riproduci video: ${title}`}
        className="bg-card hover:bg-accent/10 active:bg-accent/20 focus-visible:outline-primary flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="text-3xl" aria-hidden>{categoryEmoji(category)}</span>
        <span className="text-foreground px-4 text-center text-sm font-medium leading-tight">
          {title}
        </span>
        <span className="bg-primary flex h-14 w-14 items-center justify-center rounded-full shadow-lg">
          <Play className="text-primary-foreground ml-0.5 h-6 w-6" fill="currentColor" aria-hidden />
        </span>
      </button>
      {practiceMode && (
        <div className="absolute right-2 top-2">
          <PracticeModeBadge mode={practiceMode} compact />
        </div>
      )}
    </div>
  )
}

function UnavailablePlaceholder({ category }: { category?: SkillCategory }) {
  return (
    <div className="bg-muted flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg">
      <span className="text-2xl" aria-hidden>{categoryEmoji(category)}</span>
      <span className="text-muted-foreground text-sm">Video non ancora disponibile</span>
    </div>
  )
}
```

### 5.2 Helper: `src/lib/youtube.ts`

Aggiungere `extractYouTubeId`. La vecchia `toYouTubeEmbedUrl` può restare per ora (deprecata) o essere rimossa. **Decisione V6:** rimuoverla nello stesso commit per non lasciare codice morto.

```typescript
export function extractYouTubeId(url: string): string | null {
  if (!url || url.includes("PLACEHOLDER")) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v")
      if (parsed.pathname.startsWith("/embed/"))  return parsed.pathname.slice(7).split("/")[0] || null
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.slice(8).split("/")[0] || null
    }
    if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null
  } catch { /* fall through */ }
  return null
}
```

### 5.3 Helper: `src/lib/labels.ts` (creato in Sprint FESK)

Aggiungere (o spostare se già parzialmente presente):

```typescript
import type { SkillCategory } from "@/lib/types"

const CATEGORY_EMOJI: Record<SkillCategory, string> = {
  forme:               "🥋",
  tui_fa:              "🦵",
  po_chi:              "⚔️",
  chin_na:             "🤝",
  armi_forma:          "🗡️",
  armi_combattimento:  "⚔️",
  tue_shou:            "🤲",
  ta_lu:               "🌀",
  chi_kung:            "🧘",
  preparatori:         "🔥",
}

export function categoryEmoji(category?: SkillCategory): string {
  return category ? CATEGORY_EMOJI[category] : "🥋"
}
```

> Nota: `armi_combattimento` usa `⚔️` (singola spada incrociata) — `⚔️🗡️` del prompt sorgente è ridondante e diventa due glyph side-by-side. **Scelta:** singola spada per coerenza visiva.

### 5.4 PracticeModeBadge — adeguamento prop `compact`

In Sprint FESK, `PracticeModeBadge` mostra `🧍 Da solo` (icona + label). Per overlay sul video serve la variante compatta solo-icona. Aggiungere prop `compact?: boolean`:

```typescript
type Props = { mode: PracticeMode; compact?: boolean }

// Quando compact: solo icona, sfondo semi-trasparente, ottima per overlay
```

---

## 6. STATI VISIVI

### 6.1 Stato 1 — Placeholder (default)

- Aspect ratio 16:9
- Sfondo `bg-card`, bordo `border-border`
- Icona categoria (emoji 30px) + nome skill (font-medium, centrato) + cerchio play 56px col. `primary`
- Badge `practiceMode` overlay top-right (se prop fornita)
- Hover: `bg-accent/10`; active: `bg-accent/20`
- Focus visibile (outline 2px primary)
- L'**intero** rettangolo è il bottone (touch target ≥ 48px ovunque)

### 6.2 Stato 2 — Video in riproduzione

- Iframe YouTube nocookie con `autoplay=1&rel=0&modestbranding=1&playsinline=1`
- Stesso aspect ratio e bordo
- Badge `practiceMode` resta visibile sopra il video (z-index naturale)

### 6.3 Stato 3 — Video non disponibile

- Sfondo `bg-muted`, no bordo, no bottone play
- Icona categoria + testo "Video non ancora disponibile"
- Trigger: `extractYouTubeId(url) === null` (URL contiene `PLACEHOLDER`, vuoto, o non-YouTube)

---

## 7. PARAMETRI YOUTUBE

| Parametro | Valore | Effetto |
|-----------|--------|---------|
| `autoplay=1` | Video parte al caricamento iframe | L'utente ha già premuto play |
| `rel=0` | Niente video correlati alla fine | |
| `modestbranding=1` | Logo YouTube minimizzato | |
| `playsinline=1` | iOS non forza fullscreen | |
| `youtube-nocookie.com` | Dominio privacy-friendly | Cookie YT impostati solo dopo il play |

---

## 8. TASK ATOMICI

| # | Task | Deliverable | Tipo agent | Acceptance criteria |
|---|------|-------------|------------|---------------------|
| 1 | Aggiungere `extractYouTubeId` + rimuovere `toYouTubeEmbedUrl` | `src/lib/youtube.ts` aggiornato | general-purpose | `extractYouTubeId` gestisce 4 formati (`watch?v=`, `youtu.be/`, `embed/`, ID puro) + restituisce `null` per `PLACEHOLDER`/URL invalido. `toYouTubeEmbedUrl` rimossa, nessun import residuo |
| 2 | Aggiungere `categoryEmoji` in `lib/labels.ts` | `src/lib/labels.ts` con mapping completo | general-purpose | Tutte le 10 categorie dell'enum hanno un'emoji, fallback `🥋` per `undefined` |
| 3 | Aggiungere prop `compact` a `PracticeModeBadge` | `src/components/skill/PracticeModeBadge.tsx` | general-purpose | `<PracticeModeBadge mode="solo" compact />` rende solo l'icona, `<… compact={false} />` rende icona+label |
| 4 | Creare `VideoPlayer.tsx` (sostituisce `YouTubeEmbed.tsx`) | `git mv YouTubeEmbed.tsx VideoPlayer.tsx` poi riscrittura completa secondo §5.1 | frontend-design | Componente `"use client"`, 3 stati corretti, accessibile (aria-label, focus visibile), nessun JS YouTube caricato prima del click |
| 5 | Aggiornare import nelle pagine | `src/components/today/TodaySkillCard.tsx` e `src/app/(app)/skill/[skillId]/page.tsx` | general-purpose | `grep -r "YouTubeEmbed" src/` restituisce 0 risultati. Le pagine usano `<VideoPlayer videoUrl={…} title={…} category={…} practiceMode={…} />` |
| 6 | Verifica build + lint | — | general-purpose | `npm run lint && npm run build` passa, zero warning di import irrisolti |
| 7 | Verifica performance manuale | DevTools Network tab su `/today` con 4 skill | general-purpose | A pagina caricata, 0 richieste verso `youtube.com`/`youtube-nocookie.com`. Click su 1 placeholder → richieste solo per quel video |

### 8.1 Dipendenze critiche

- 4 dipende da 1, 2, 3
- 5 dipende da 4
- 6, 7 dipendono da 5

---

## 9. PREDISPOSIZIONI FUTURE (non implementare)

Il componente è strutturato per accogliere senza rewrite:

| Feature | Quando | Modifica richiesta |
|---------|--------|---------------------|
| Controllo velocità (0.5x / 1x / 1.5x) | D7 chiuso | Caricare YouTube IFrame API on-demand al play, esporre `setPlaybackRate` |
| Loop di sezione (start/end) | D7 chiuso | Props `loopStart?: number`, `loopEnd?: number` + `seekTo()` su `onStateChange = ENDED` |
| Capitoli/timestamp | Su richiesta | Prop `chapters?: { time: number; label: string }[]` + bottoni che chiamano `seekTo()` |
| Switch a MP4 self-hosted | D7 chiuso verso MP4 | Prop `source?: "youtube" \| "mp4"` + branch `<video>` HTML5 |
| IntersectionObserver lazy | V11 risolto | Wrappare il placeholder in un componente che imposta `isReady=true` quando entra in viewport, mostra il bottone solo allora |

**Niente di tutto questo va implementato in questo sprint.**

---

## 10. RISCHI E MITIGAZIONI

| Rischio | Mitigazione |
|---------|-------------|
| Sprint FESK non chiuso → categorie vecchie (`tecniche_base`, ecc.) ancora in DB | `categoryEmoji` accetta `string \| undefined`. Fallback `🥋` per qualsiasi categoria non mappata. Cambiare la signature da `SkillCategory` a `string` se serve compatibilità temporanea |
| Sprint FESK non chiuso → `practiceMode` non esiste sul tipo `Skill` | Prop `practiceMode` è opzionale. Senza, niente badge — il player funziona comunque. Le pagine chiamanti possono omettere la prop se il dato non c'è |
| `PracticeModeBadge` non ancora creato (FESK in corso) | Bloccare il task 3 finché FESK §7.7 non ha creato il componente base. Oppure inline il badge in `VideoPlayer` con TODO di refactoring |
| `youtube-nocookie.com` non rispetta `autoplay=1` su iOS senza gesto utente | Il click dell'utente sul placeholder È il gesto utente — funziona. Verificare su Safari iOS reale, non solo simulator |
| Iframe carica senza header `loading="lazy"` | Non serve: l'iframe esiste solo dopo il click, quindi è già lazy per definizione |
| Hover state mai visto su mobile | Non è regressione: il prompt sorgente lo definisce, lo manteniamo per desktop. `active:` copre il feedback mobile |

---

## 11. DEFINITION OF DONE

Lo Sprint 1.6 è chiuso quando:

1. `YouTubeEmbed.tsx` non esiste più, `VideoPlayer.tsx` esiste e copre i 3 stati
2. `extractYouTubeId` in `lib/youtube.ts`, `toYouTubeEmbedUrl` rimossa
3. `categoryEmoji` in `lib/labels.ts` con tutte le 10 categorie mappate
4. `PracticeModeBadge` supporta prop `compact`
5. `TodaySkillCard.tsx` e `skill/[skillId]/page.tsx` importano `VideoPlayer`
6. `grep -r "YouTubeEmbed" src/` → 0 risultati
7. `npm run lint && npm run build` passano senza warning
8. Verifica DevTools: pagina `/today` con 4 skill → 0 richieste verso `youtube*.com` prima del click
9. Click su un placeholder → solo quel video carica iframe + script
10. Test su mobile (anche solo DevTools mobile emulation): touch target del placeholder copre l'intero rettangolo, focus visibile col tab
11. Nessuna nuova dipendenza in `package.json`

---

## 12. AGGIORNAMENTI A `current-plan.md` DOPO QUESTO SPRINT

- §5: rinominare `YouTubeEmbed.tsx` → `VideoPlayer.tsx` nella struttura cartelle
- §9 Sprint 1: aggiungere riga "1.6 — VideoPlayer custom (lazy YouTube) ✅"
- §17.2 task #8: aggiornare deliverable a "VideoPlayer.tsx (lazy load + placeholder custom)"
- §2.2 D7: aggiungere nota "VideoPlayer custom già pronto per estensione velocità/loop senza rewrite"

---

## 13. RIASSUNTO ESECUTIVO

**Cosa fai:** sostituisci l'iframe YouTube auto-caricato con un placeholder custom (icona categoria + nome + play) che carica l'iframe **solo al click**.

**Quando:** dopo Sprint 1.5 FESK (perché serve `PracticeModeBadge` e il nuovo enum categorie).

**Costo stimato:** 0.5 giorni di lavoro per agent. Refactor focalizzato su 5 file.

**Beneficio:** schermata "Oggi" con 4 video carica in <0.5s invece di 3-5s su mobile. ~2-4MB di JS YouTube risparmiati per il first paint.

**Cosa NON fai:** controlli velocità, loop, capitoli, MP4 self-hosted, IntersectionObserver, custom Player API. Tutte le predisposizioni sono in §9, da implementare quando D7 di `current-plan.md` viene chiusa.

**Da fare prima di considerare chiuso:** verifica DevTools Network "0 richieste youtube prima del click", `grep YouTubeEmbed` vuoto, build verde, aggiornare `current-plan.md` come da §12.
