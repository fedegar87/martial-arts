# Skill Practice

PWA per la pratica guidata di arti marziali tradizionali, oggi centrata sul curriculum FESK Shaolin + T'ai Chi e predisposta per federazione/scuole.

## Struttura repository

```
martial-arts/
├── CLAUDE.md                    ← Istruzioni workspace per Claude (gerarchia fonti)
├── plan/
│   ├── current-plan.md          ← PIANO ATTIVO. Inizia da qui.
│   ├── README.md                ← Indice dei piani (completati / reference / attivi)
│   ├── completed/               ← Design + plan di sprint chiusi (storico implementato)
│   └── reference/               ← Documenti perenni (curriculum, identity, positioning, gui/ios)
├── docs/                        ← Architettura e assessment del workspace
│   ├── architecture.md                  Architettura attuale di skill-practice
│   ├── architecture-multitenancy-readiness.md  Prontezza multi-tenant
│   ├── performance-assessment.md        Diagnosi performance + piano
│   └── marketing-video-promo-guide.md   Guida produzione video promo
├── archive/                     ← Ricerca storica e brief superati (read-only)
│   ├── 01-research-market.md           Ricerca mercato piattaforme skill-training
│   ├── 02-research-vertical.md         Deep-dive scuole MA come entry vertical
│   ├── 03-analysis-operational.md      JTBD, MVP concepts, interview scripts
│   ├── 04-validation-framework.md      Doppio binario validazione + product blueprint
│   ├── 05-brief-v1-superseded.md       Brief tecnico v1 (sostituito dal piano attivo)
│   ├── 06-research-verification.md     Ricerca indipendente di stress-test
│   └── 2026-05-07-calendar-overhaul-design-superseded.md  Design calendario superato da 1.14
├── skill-practice/              ← Progetto Next.js (scaffold in Sprint 1)
│   ├── CLAUDE.md                ← Regole concrete d'implementazione
│   └── docs/plans/              ← Piani di progetto (con sotto-cartella completed/)
└── README.md
```

## Quick start

1. Leggi `plan/current-plan.md` — è autosufficiente
2. Verifica le **decisioni aperte** marcate con ⚠️ nella sezione 2
3. La cartella `archive/` serve solo per il razionale — non è richiesta per implementare

## Cronologia analisi

I documenti in `archive/` sono numerati in ordine cronologico (Marzo-Aprile 2026). Il numero indica la sequenza di pensiero, non la priorità di lettura.

Il brief tecnico è stato iterato:
- **v1** (`05-brief-v1-superseded.md`): single-user puro, generico
- **v3** (`plan/current-plan.md`): multi-user predisposto, framing "quaderno digitale", decisioni aperte esplicite
