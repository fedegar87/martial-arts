# martial-arts workspace — istruzioni per Claude

## Fonte di verità

Il documento autoritativo per **questo intero workspace** è:

```
plan/current-plan.md
```

Prima di proporre, modificare o scrivere codice, **leggi quel file**. Sostituisce qualunque assunzione tu possa avere su scope, stack o priorità.

Gerarchia:

1. Istruzioni utente nel turno corrente
2. `plan/current-plan.md` (piano attivo)
3. `skill-practice/CLAUDE.md` (regole concrete d'implementazione, esiste solo se il progetto è scaffoldato)
4. Questo file

In caso di conflitto vince ciò che è più alto. Se trovi una contraddizione fra il piano e `skill-practice/CLAUDE.md`, **fermati e segnalala**: aggiorniamo prima il piano.

## Cosa NON è questo workspace

- Non è una libreria
- Non è un monorepo
- Non è un SaaS pronto al rilascio

È: un progetto personale (MVP single-user, predisposto multi-utente) per la pratica di arti marziali. Vedi §0 e §1 del piano.

## Convenzioni base

- Lingua: italiano nelle conversazioni e nei commit, inglese negli identificatori di codice
- Niente emoji nei file di codice o commit
- Niente nuovi file `.md` in root senza una ragione esplicita: la documentazione vive in `plan/` e nei `CLAUDE.md`
- `archive/` è di sola lettura, è cronologia di ricerca

## Struttura repository

```
martial-arts/
├── CLAUDE.md                    # questo file
├── README.md
├── plan/
│   └── current-plan.md          # PIANO ATTIVO — fonte di verità
├── archive/                     # ricerca storica e brief superati (read-only)
└── skill-practice/              # progetto Next.js (creato in Sprint 1)
    └── CLAUDE.md                # regole concrete d'implementazione
```

## Quando aggiornare il piano

- Una decisione aperta in §2.2 viene chiusa → spostala in §2.1 con risoluzione
- Si aggiunge/rimuove una rotta, tabella, componente core → aggiorna §4 o §5
- Cambia uno stack item → aggiorna §3 + spiega in §2.1 perché
- Si chiude uno Sprint → aggiorna §9
- Brief tecnico sostituito → vecchio in `archive/` con suffisso `-superseded.md`, nuovo in `plan/current-plan.md`, riferimento nel front-matter
