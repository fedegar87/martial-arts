# BRIEF PER AI AGENT — Scaffold progetto "Skill Practice"

## COSA DEVI FARE

Struttura il progetto per una PWA (Progressive Web App) di pratica guidata per arti marziali. Il progetto deve funzionare come webapp da browser E essere installabile come app su Android.

Fase attuale: MVP personale. Un solo utente (io). Nessun backend complesso. Dati locali o su un database leggero.

---

## STACK TECNOLOGICO

- **Frontend:** Next.js 14+ con App Router e TypeScript
- **UI:** Tailwind CSS + shadcn/ui (componenti pronti, professionali, accessibili)
- **PWA:** next-pwa per service worker, manifest, installabilità su Android
- **Database:** Supabase (PostgreSQL hosted, auth inclusa, gratuito fino a 500MB). Alternativa: SQLite locale via IndexedDB se vuoi zero backend
- **Video:** YouTube embed (unlisted) come prima implementazione. Nessun upload/storage video per ora
- **Hosting:** Vercel (gratuito per progetti personali, deploy automatico da GitHub)
- **Monorepo:** No. Un solo progetto, una sola cartella

---

## STRUTTURA CARTELLE

```
skill-practice/
├── public/
│   ├── manifest.json          # PWA manifest (nome app, icone, theme)
│   ├── sw.js                  # Service worker (generato da next-pwa)
│   ├── icons/                 # Icone app (192x192, 512x512)
│   └── favicon.ico
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Layout globale
│   │   ├── page.tsx           # Home: schermata "OGGI"
│   │   ├── library/
│   │   │   └── page.tsx       # Libreria: tutte le skill organizzate per livello
│   │   ├── skill/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Dettaglio singola skill (video + note + stato)
│   │   ├── progress/
│   │   │   └── page.tsx       # Storico pratica (calendario check)
│   │   └── settings/
│   │       └── page.tsx       # Impostazioni (livello cintura, preferenze)
│   ├── components/
│   │   ├── ui/                # Componenti shadcn/ui
│   │   ├── TodayCard.tsx      # Card "oggi fai questo" con video e nota
│   │   ├── SkillCard.tsx      # Card skill nella libreria
│   │   ├── VideoPlayer.tsx    # Wrapper YouTube embed responsive
│   │   ├── PracticeCheck.tsx  # Bottone "ho praticato oggi"
│   │   ├── WeekView.tsx       # Vista settimanale con check giornalieri
│   │   ├── StatusBadge.tsx    # Badge stato skill (focus/ripasso/maintenance)
│   │   └── ExamCountdown.tsx  # Countdown al prossimo esame
│   ├── lib/
│   │   ├── db.ts              # Connessione Supabase (o IndexedDB wrapper)
│   │   ├── types.ts           # TypeScript types per Skill, Session, Video, ecc.
│   │   ├── practice-logic.ts  # Logica: cosa proporre oggi in base agli stati
│   │   └── utils.ts           # Utility generiche
│   ├── data/
│   │   └── seed.ts            # Dati iniziali: le mie skill, video, livelli
│   └── hooks/
│       ├── useTodayPractice.ts   # Hook: cosa praticare oggi
│       ├── useSkills.ts          # Hook: CRUD skill
│       └── usePracticeLog.ts     # Hook: log pratica completata
├── .env.local                 # Variabili ambiente (Supabase URL, chiavi)
├── next.config.js             # Config Next.js + PWA
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## MODELLO DATI

### Skill
```typescript
type Skill = {
  id: string
  name: string                    // "Siu Nim Tao - Sezione 3"
  description?: string            // Breve descrizione
  level: string                   // "cintura_gialla", "cintura_verde", ecc.
  videoUrl: string                // URL YouTube unlisted
  notes?: string                  // Note del maestro o personali
  status: "focus" | "review" | "maintenance" | "archive"
  order: number                   // Ordine di visualizzazione nel livello
  createdAt: Date
  updatedAt: Date
}
```

### PracticeLog
```typescript
type PracticeLog = {
  id: string
  date: string                    // "2026-04-25"
  skillIds: string[]              // Quali skill ho praticato
  durationMinutes?: number        // Durata stimata
  note?: string                   // Note personali post-pratica
  completed: boolean              // Check "ho praticato"
}
```

### Level
```typescript
type Level = {
  id: string
  name: string                    // "Cintura Gialla"
  order: number                   // Ordine progressivo
  examDate?: Date                 // Data prossimo esame (opzionale)
}
```

---

## LOGICA "OGGI FAI QUESTO"

Il file `practice-logic.ts` deve implementare questa logica semplice:

1. Prendi tutte le skill con status "focus" → mostrale TUTTE ogni giorno
2. Prendi le skill con status "review" → mostra 2-3 a rotazione (non tutte ogni giorno)
3. Prendi le skill con status "maintenance" → mostra 1 a rotazione, ogni 3-4 giorni
4. Le skill "archive" non appaiono mai nella schermata "oggi"

La rotazione per review e maintenance si basa su: "quale ho praticato meno di recente?" (ultima data nel PracticeLog).

---

## SCHERMATA PRINCIPALE (page.tsx)

Deve mostrare esattamente questo, nient'altro:

```
OGGI — [giorno della settimana]

📌 FOCUS
[SkillCard con video embed e nota]
[SkillCard con video embed e nota]

🔄 RIPASSO
[SkillCard con video embed e nota]
[SkillCard con video embed e nota]

🔧 MAINTENANCE (se presente oggi)
[SkillCard]

---
⏱ Tempo stimato: ~[X] minuti
[ ✅ Ho praticato oggi ]

📋 Questa settimana: [X]/[Y] giorni completati
📝 Prossimo esame: [X] giorni (se impostato)
```

Design: mobile-first. Font grande. Pochi colori. Zero navigazione complessa. L'utente apre e vede subito cosa fare.

---

## COSA NON FARE

- NO autenticazione complessa (per ora basta un singolo utente)
- NO upload video (solo URL YouTube/embed)
- NO backend API custom (usa Supabase direttamente dal client, oppure IndexedDB per zero-backend)
- NO notifiche push (ancora)
- NO gamification, punti, badge
- NO chat, messaggistica, social
- NO multi-utente, ruoli, permessi
- NO i18n / multi-lingua
- NO analytics / tracking avanzato
- NO CI/CD complesso (Vercel auto-deploy da main branch basta)

---

## PRIORITÀ DI IMPLEMENTAZIONE

### Sprint 1 (deve funzionare subito)
1. Struttura progetto + PWA manifest + installabilità Android
2. Modello dati (types + seed data con 5-8 skill reali di kung fu)
3. Schermata "Oggi" con logica focus/review/maintenance
4. Video player YouTube embed
5. Bottone "Ho praticato oggi" con salvataggio in DB/localStorage

### Sprint 2 (utile ma non urgente)
6. Libreria completa skill organizzata per livello
7. Vista settimanale/calendario pratica
8. Possibilità di cambiare stato di una skill (drag o menu)
9. Countdown esame

### Sprint 3 (solo se lo uso davvero)
10. Note personali post-pratica
11. Statistiche di pratica (streak, frequenza)
12. Offline mode completo via service worker

---

## SEED DATA (esempio reale)

Popola il database iniziale con questi dati di esempio per kung fu Wing Chun:

```typescript
const seedSkills: Skill[] = [
  {
    id: "1",
    name: "Siu Nim Tao - Sezione 1",
    level: "base",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "maintenance",
    notes: "Concentrati sulla stabilità della stance",
    order: 1
  },
  {
    id: "2",
    name: "Siu Nim Tao - Sezione 2",
    level: "base",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "review",
    notes: "Rotazione del polso nel Huen Sao",
    order: 2
  },
  {
    id: "3",
    name: "Siu Nim Tao - Sezione 3",
    level: "base",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "focus",
    notes: "Attenzione alla posizione del gomito nel Fak Sao",
    order: 3
  },
  {
    id: "4",
    name: "Tan Sao",
    level: "base",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "review",
    notes: "Angolo 45 gradi, gomito sulla linea centrale",
    order: 4
  },
  {
    id: "5",
    name: "Bong Sao",
    level: "base",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "review",
    notes: "Il gomito non deve mai scendere sotto la spalla",
    order: 5
  },
  {
    id: "6",
    name: "Chum Kiu - Sezione 1",
    level: "intermedio",
    videoUrl: "https://youtube.com/embed/PLACEHOLDER",
    status: "focus",
    notes: "Coordinazione passo-rotazione",
    order: 6
  }
]
```

Sostituirò i PLACEHOLDER con i miei URL YouTube reali dopo il setup.

---

## NOTE PER L'AGENT

- Questo è un progetto personale, non un SaaS. Ottimizza per semplicità, non per scala.
- Mobile-first. La prima esperienza è su telefono Android.
- Il design deve essere pulito, minimale, e leggibile con un colpo d'occhio. Niente clutter.
- Preferisci meno feature fatte bene a tante feature fatte male.
- Se devi scegliere tra "elegante" e "funziona", scegli "funziona".