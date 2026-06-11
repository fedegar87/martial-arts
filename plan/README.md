# Indice piani — workspace martial-arts

Mappa di orientamento della cartella `plan/`. La fonte di verità resta **[current-plan.md](current-plan.md)**: questo indice serve solo a sapere dove guardare.

## Struttura

- **`current-plan.md`** — piano master, fonte autoritativa per scope/stack/modello dati/sprint.
- **root `plan/`** — solo piani **attivi o pendenti** (decisione presa, lavoro non concluso).
- **`completed/`** — design + implementation plan di sprint **chiusi e in produzione**. Storico, di sola consultazione.
- **`reference/`** — documenti **perenni** non legati a un singolo sprint.

Quando uno sprint si chiude, il suo design/plan si sposta in `completed/` e si aggiorna questo indice (vedi `../CLAUDE.md` → "Quando aggiornare il piano").

## Attivi / pendenti (root `plan/`)

| File | Stato | Note |
|------|-------|------|
| [2026-05-02-monetization-strategy.md](2026-05-02-monetization-strategy.md) | 🟡 Attivo | Strategia quota federazione, non implementata. Rivedere dopo pilota. |
| [2026-05-16-push-notifications-setup-pending.md](2026-05-16-push-notifications-setup-pending.md) | ⏸ Pending | Codice in prod, UI gated finché VAPID + CRON_SECRET non configurati su Vercel. |

## Reference perenni (`reference/`)

Organizzati per tema in sottocartelle. Il `master-execution-plan.md` resta in radice perché trasversale.

### `reference/business/` — Strategia, business model, validazione

| File | Scopo |
|------|-------|
| [reference/business/validation-lab-workbook.md](reference/business/validation-lab-workbook.md) | Workbook operativo del validation lab: ipotesi, segmenti, interviste, insight, follow-up. §13 = appendice bozza (brainstorming Sessione 2). |
| [reference/business/business-model-canvas.md](reference/business/business-model-canvas.md) | Sistema di business design (metodo Strategyzer/Osterwalder): canvas come mappa di ipotesi falsificabili. |
| [reference/business/business-model-canvas-draft.md](reference/business/business-model-canvas-draft.md) | Canvas one-page compilato (bozza v0 da validare). Collegato al doc metodologico. |
| [reference/business/business-model-canvas-assumption-map.md](reference/business/business-model-canvas-assumption-map.md) | Assumption map + desk research sui 9 blocchi: cosa deve essere vero perché il modello funzioni. |
| [reference/business/positioning-analysis.md](reference/business/positioning-analysis.md) | Analisi posizionamento competitivo (living). |

### `reference/design/` — GUI, UX, identità visiva

| File | Scopo |
|------|-------|
| [reference/design/gui-ios-definitive-plan.md](reference/design/gui-ios-definitive-plan.md) | Principi GUI iOS consolidati ed eseguibili. Assorbe e sostituisce audit + enhancement (ora in `archive/`). |
| [reference/design/visual-identity-plan.md](reference/design/visual-identity-plan.md) | Visual identity dark/gold, palette, tipografia (implementata in `globals.css`). |

### `reference/domain/` — Dominio e curriculum

| File | Scopo |
|------|-------|
| [reference/domain/curriculum-mapping-fesk.md](reference/domain/curriculum-mapping-fesk.md) | Glossario/curriculum FESK validato — sorgente concettuale del seed `0004_seed_fesk.sql`. |

### `reference/` (radice) — Trasversale

| File | Scopo |
|------|-------|
| [reference/master-execution-plan.md](reference/master-execution-plan.md) | Roadmap operativa scenario A/B, cross-check. |

## Completati (`completed/`) — per sprint

Tutti gli sprint operativi 1.5–1.16 sono chiusi e in produzione (vedi `current-plan.md` §9).

| Sprint | Design | Plan / Implementation |
|--------|--------|------------------------|
| 1.5 Curriculum FESK | — | [completed/2026-04-25-curriculum-fesk-plan.md](completed/2026-04-25-curriculum-fesk-plan.md) |
| 1.6 VideoPlayer | — | [completed/2026-04-25-video-player-plan.md](completed/2026-04-25-video-player-plan.md) |
| 1.7 Programma + modalità | — | [completed/2026-04-25-program-plan-mode-selection-plan.md](completed/2026-04-25-program-plan-mode-selection-plan.md) |
| 1.8 Tab Progresso | — | [completed/2026-04-25-progress-tab-plan.md](completed/2026-04-25-progress-tab-plan.md) |
| 1.9 Training schedule | [completed/2026-04-26-training-schedule-design.md](completed/2026-04-26-training-schedule-design.md) | [completed/2026-04-26-training-schedule-plan.md](completed/2026-04-26-training-schedule-plan.md) |
| 1.10 Auth password | [completed/2026-05-02-auth-password-management-design.md](completed/2026-05-02-auth-password-management-design.md) | [completed/2026-05-02-auth-password-management-plan.md](completed/2026-05-02-auth-password-management-plan.md) |
| 1.11 Profilo/privacy | — | [completed/2026-05-03-profile-account-privacy-settings-plan.md](completed/2026-05-03-profile-account-privacy-settings-plan.md) |
| 1.12 Plan status (2 stati) | [completed/2026-05-04-plan-status-simplification-design.md](completed/2026-05-04-plan-status-simplification-design.md) | [completed/2026-05-04-plan-status-simplification-plan.md](completed/2026-05-04-plan-status-simplification-plan.md) |
| 1.14 Calendario unificato | [completed/2026-05-10-calendar-unification-design.md](completed/2026-05-10-calendar-unification-design.md) | [completed/2026-05-10-calendar-unification-plan.md](completed/2026-05-10-calendar-unification-plan.md) |
| 1.15 Top practiced skills | [completed/2026-05-11-top-practiced-skills-design.md](completed/2026-05-11-top-practiced-skills-design.md) | [completed/2026-05-11-top-practiced-skills-plan.md](completed/2026-05-11-top-practiced-skills-plan.md) |
| 1.16 Push reminder | — | [completed/2026-05-16-training-reminder-push-notifications-plan.md](completed/2026-05-16-training-reminder-push-notifications-plan.md) |
| Progress redesign | [completed/2026-05-10-progress-redesign-design.md](completed/2026-05-10-progress-redesign-design.md) | [completed/2026-05-10-progress-redesign-implementation.md](completed/2026-05-10-progress-redesign-implementation.md) |
| Landing page | [completed/2026-04-26-landing-page-design.md](completed/2026-04-26-landing-page-design.md) | [completed/2026-04-26-landing-page-plan.md](completed/2026-04-26-landing-page-plan.md) |
| Hub page | [completed/2026-05-01-hub-page-design.md](completed/2026-05-01-hub-page-design.md) | [completed/2026-05-01-hub-page-plan.md](completed/2026-05-01-hub-page-plan.md) |
| Allenamento redesign | [completed/2026-05-03-allenamento-tab-redesign-design.md](completed/2026-05-03-allenamento-tab-redesign-design.md) | — |
| Today restructure | — | [completed/2026-05-01-today-page-restructure-plan.md](completed/2026-05-01-today-page-restructure-plan.md) |
| Note maestro/personali | — | [completed/2026-05-01-video-notes-role-plan.md](completed/2026-05-01-video-notes-role-plan.md) |
| Scuola Chang / pratica libera | — | [completed/2026-05-01-scuola-chang-free-practice-plan.md](completed/2026-05-01-scuola-chang-free-practice-plan.md) |
| Sistema marker | — | [completed/2026-05-01-marker-system-plan.md](completed/2026-05-01-marker-system-plan.md) |

## Superati

- `archive/2026-05-07-calendar-overhaul-design-superseded.md` — design calendario/diario retroattivo (Sprint 1.13), sostituito dalla calendar unification 1.14.
- `archive/2026-04-25-gui-ux-experience-audit-superseded.md` — audit UX di partenza, assorbito da `reference/design/gui-ios-definitive-plan.md`.
- `archive/2026-04-25-ios-design-principles-enhancement-superseded.md` — addendum principi iOS, assorbito dal piano GUI definitivo.
