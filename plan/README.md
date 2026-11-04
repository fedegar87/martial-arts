# Indice Cartella `plan/`

Mappa di navigazione per agenti AI e maintainer. Indica quali documenti sono attivi e dove vive lo storico.

## Ordine di Lettura Attivo

1. [current-plan.md](current-plan.md)
   - Piano prodotto master, storico decisioni (`D1`–`D14`), stack e cronologia sprint.

2. [white-label-strategy.md](white-label-strategy.md)
   - **Strategia architetturale canonica** per evoluzione multi-scuola, white-label (altre scuole Kung Fu Chang) e altre arti marziali (es. Taekwondo/Karate con `1..N` percorsi e propri gradi/categorie).
   - Contiene le regole anti-overengineering, la fotografia reale post-migrazione `0048`, la roadmap attivata da trigger reali e il riepilogo operativo FESK.

3. [../docs/architecture.md](../docs/architecture.md)
   - Briefing tecnico completo dell'app (`skill-practice/`) aggiornato allo stato corrente del codice.

## Piani Parcheggiati (Non bloccanti)

| File | Stato | Note |
|---|---|---|
| [2026-05-02-monetization-strategy.md](2026-05-02-monetization-strategy.md) | Parcheggiato | Analisi monetizzazione FESK; da rivalutare dopo l'uso operativo reale. |

## Piani Completati e Riferimenti Perenni

- **Storico sprint e rollout implementati:** [completed/](completed/) — incluso il rollout FESK chiuso in [completed/2026-06-13-fesk-rollout-implementation-plan.md](completed/2026-06-13-fesk-rollout-implementation-plan.md).
- **Dominio FESK:** [reference/domain/curriculum-mapping-fesk.md](reference/domain/curriculum-mapping-fesk.md).
- **Design & Visual Identity:** [reference/design/](reference/design/).
- **Business & Validation Lab:** [reference/business/](reference/business/).

## Regola per Agenti AI

Non anticipare refactoring multi-tenant o astrazioni multi-disciplina finché l'utente non dichiara attivo il relativo trigger reale descritto in [white-label-strategy.md](white-label-strategy.md).
