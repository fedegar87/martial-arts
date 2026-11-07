# plan/ — convenzioni cartelle

- `plan/` (root): solo il piano master (`current-plan.md`), la strategia white-label/multi-arte (`white-label-strategy.md`) e i piani **attivi/pendenti** (decisione presa ma lavoro non concluso).
- `plan/reference/`: documenti **perenni** non legati a un singolo sprint, raggruppati per tema in sottocartelle: `business/` (business model, validation lab, positioning), `design/` (gui/ios, visual identity), `domain/` (curriculum FESK).
- A lavoro concluso, trasferire le decisioni ancora valide nei documenti correnti ed eliminare il piano operativo. Lo storico resta in Git, senza copie `completed/` o `superseded`.
- Le procedure ripetibili dell'app vivono in `skill-practice/docs/`; i test browser in `skill-practice/tests/browser/`. Test e migrazioni SQL si conservano anche dopo il rilascio.
