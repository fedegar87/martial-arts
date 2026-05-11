# Piano refactor UI e struttura codice

Versione: 2026-05-11.

Questo documento sostituisce la prima stesura del piano UI. Tiene conto dei vincoli in `CLAUDE.md` e del piano autoritativo `../plan/current-plan.md`.

## Obiettivo

Portare l'app verso una struttura in cui:

- le pagine descrivono contenuto, dati e composizione;
- i componenti di dominio descrivono comportamento specifico della feature;
- i componenti UI custom decidono forma, colore, spaziatura, focus, hover, disabled e stati;
- le classi Tailwind locali restano per layout e composizione, non per reinventare pattern comuni.

Il problema da risolvere non e' solo estetico. La codebase deve ridurre la duplicazione implicita di pattern come bottoni, chip, segmented control, card selezionabili, righe cliccabili, stati completati e conferme destructive.

## Vincoli di progetto

Questi vincoli sono non negoziabili finche' non vengono aggiornati nel piano autoritativo:

- `src/components/ui/` e' riservato ai componenti shadcn-managed. Non aggiungere componenti custom in questa cartella.
- Se un componente in `src/components/ui/` deve essere modificato, serve una decisione esplicita nel piano: e' una personalizzazione shadcn locale, non un posto per primitive di progetto.
- La struttura canonica e' in `../plan/current-plan.md` e `CLAUDE.md`. Qualsiasi nuova cartella top-level sotto `src/components/` richiede aggiornamento di quei documenti prima della migrazione.
- Tema dark/gold FESK preservato. Le eccezioni brand/editoriali restano ammesse per landing, hub, video player e news banner.
- Nessuna nuova dipendenza senza approvazione.
- Refactor incrementale: ogni tranche deve essere revert-safe.

## Valutazione dell'architettura attuale

La codebase ha gia' una separazione utile:

- `src/components/ui/`: componenti shadcn-like e base UI.
- `src/components/shared/`: componenti trasversali.
- `src/components/<domain>/`: feature specifiche.
- `src/app/**`: pagine e route.
- `src/lib/**`: actions, queries, logica pura, tipi.

Il difetto attuale e' che `shared/` sta diventando il luogo naturale per primitive UI custom (`Chip`, `OptionCard`, `SegmentedNav`) ma non ha una regola esplicita. Il refactor deve chiarire questa responsabilita' senza rompere il vincolo su `ui/`.

## Architettura proposta

### Stato implementato

```txt
src/components/primitives/
  Chip.tsx
  OptionCard.tsx
  SegmentedNav.tsx

src/lib/
  ui-classes.ts
```

`../plan/current-plan.md` e `CLAUDE.md` sono stati aggiornati per riconoscere `primitives/`.

### Stato finale consigliato

La direzione resta:

```txt
src/components/
  ui/               # shadcn-managed. Non aggiungere custom primitives qui.
  primitives/       # UI custom generica del progetto. PascalCase.
  shared/           # componenti trasversali di layout/app, non primitive pure.
  composed/         # opzionale; creare solo quando serve davvero.
  calendar/
  today/
  sessions/
  library/
  profile/
  plan/
  skill/
```

Responsabilita':

- `ui/`: componenti generati o gestiti da shadcn. Kebab-case, convenzione shadcn.
- `primitives/`: wrapper e primitive custom generiche del progetto, senza dominio. PascalCase.
- `shared/`: componenti trasversali non puramente primitivi. Restano qui i componenti che dipendono da layout app, routing, shell applicativa o asset identitari.
- `composed/`: pattern semantici con stato applicativo generico, da creare solo se emergono almeno 3 componenti chiari.
- `<domain>/`: componenti che conoscono skill, piano, calendario, profilo, azioni e label di dominio.

Regola pratica `shared/` vs `primitives/`:

- se il componente e' puramente presentazionale, non conosce routing, non usa asset identitari e non dipende dalla shell app, il target finale e' `primitives/`;
- se il componente esiste per comporre l'app o per identita' di prodotto, resta in `shared/` o nella cartella specifica gia' esistente;
- con questa regola, `EmptyState` e `MetricStrip` sono candidati `primitives/`, mentre `AppHeader`, `AppHeaderConditional`, `AppRouteSkeleton` e `TempleHomeIcon` restano `shared/`.

Esempi di `primitives/`:

- `Chip.tsx`
- `OptionCard.tsx`
- `SegmentedNav.tsx`
- `FormSelect.tsx`
- `EmptyState.tsx`, se resta puramente presentazionale.
- `MetricStrip.tsx`, se non incorpora logica di dominio.
- `ConfirmDialog.tsx`, solo quando ci sono almeno 3 callsite concrete.

Esempi eventuali di `composed/`:

- `CompletionButton.tsx`, solo se lo stato completato ha logica oltre una classe.
- `SkillRow.tsx`, se unifica davvero `SkillListItem` e `ProgramSkillRow`.

## Nomenclatura

- `src/components/ui/`: kebab-case, coerente con shadcn.
- `src/components/primitives/`, `shared/`, `composed/`, `<domain>/`: PascalCase, coerente con il repo.
- Non mescolare convenzioni: `Chip.tsx` non deve diventare `chip.tsx` se non vive in `ui/`.

## Decision tree per nuovi componenti

```txt
Il pattern e' usato in almeno 3 callsite reali oggi?
|-- No
|   `-- resta locale; non creare un componente.
`-- Si
    `-- conosce concetti di dominio? (skill, plan, calendar, exam, profile)
        |-- Si
        |   `-- components/<domain>/
        `-- No
            `-- conosce stato applicativo generico? (completed, selected, dirty)
                |-- Si
                |   `-- components/composed/ solo se la cartella contiene almeno 3 pattern.
                |       Altrimenti resta in shared o nel dominio finche' matura.
                `-- No
                    `-- components/primitives/
```

Eccezione: 2 callsite + un terzo gia' introdotto nella stessa PR possono giustificare il componente.

Anti-regola: non creare componenti "perche' serviranno". Si creano quando il bisogno e' presente.

## Quando una classe Tailwind locale e' ammessa

Classi locali ammesse nei componenti dominio:

- layout di composizione: `flex`, `grid`, `gap-*`, `space-*`, `items-*`, `justify-*`, `w-*`, `min-w-*`, `h-*`, `min-h-*`, `overflow-*`, `truncate`, `sr-only`;
- spaziatura locale di pagina o sezione: `mt-*`, `mb-*`, `pt-*`, `pb-*`, `px-*`, `py-*` su wrapper;
- tipografia contenutistica: `text-sm`, `font-medium`, `uppercase`, `leading-*`, solo su testo statico o contenuto. Non usarla per definire la forma di wrapper interattivi come button, chip, tab o card selezionabili;
- eccezione brand/editoriale con motivazione ovvia oppure commento locale se non ovvia.

Classi locali da evitare nei componenti dominio:

- colori strutturali su elementi interattivi: `bg-primary`, `bg-card`, `border-primary`, `text-primary`, `text-primary-foreground`;
- radius su elementi interattivi: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`;
- stati interattivi: `hover:*`, `focus-visible:*`, `aria-*:*`, `data-*:*`;
- glow gold: `shadow-[0_0_24px_var(--gold-glow)]`;
- stati success/destructive duplicati: `var(--status-success)`, `var(--destructive)`;
- `tap-feedback` fuori da primitive o componenti documentati.

Nota: queste regole non sono divieti assoluti per sempre. Sono segnali di audit: ogni match va spostato, giustificato o documentato.

## Regole UI

### Button

Varianti previste:

- `default`: CTA primaria, gold pieno + glow. Massimo una per intent.
- `secondary`: azione importante ma non finale.
- `outline`: neutra o terziaria.
- `ghost`: azione leggera, inline o di annullamento.
- `destructive`: azione pericolosa.
- `link`: link testuale.

Uso:

- submit principale: `default`;
- "Modifica", "Calendario", "Aggiungi" in lista ripetuta: `secondary` o `outline`;
- "Annulla", "Salta": `ghost`;
- "Cancella", "Reset", "Richiedi cancellazione": `destructive`.

### Chip

Uso:

- filtri;
- gradi;
- giorni settimana;
- durata;
- tag selezionabili compatti.

Stato attivo:

```txt
border-primary bg-primary/10 text-primary
```

Mai usare `bg-primary text-primary-foreground` per un chip selezionato.

### SegmentedNav

Uso:

- cambio disciplina;
- cambio vista calendario;
- cambio contesto mutuamente esclusivo.

Stato attivo:

```txt
border-border bg-card text-foreground
```

Niente gold pieno.

### OptionCard

Uso:

- scelte grandi nei form;
- disciplina onboarding;
- cadenza;
- ambito sessioni.

Regole:

- input reale dentro la card;
- stato selezionato con bordo primary e fondo `primary/10`;
- focus visibile centralizzato.

### FormSelect

Uso:

- select nativi con la stessa ricetta visiva;
- onboarding gradi/esame;
- piano esame;
- editor gradi profilo.

Regole:

- wrapper leggero, non form system;
- niente nuova dipendenza;
- non sostituisce un componente Radix Select finche' non serve un select custom accessibile piu' complesso.

### Stato completato

Default pragmatico:

- una costante condivisa per la classe success vive in `src/lib/ui-classes.ts`;
- questa posizione e' giustificata perche' lo stato completato e' usato da piu' domini (`today`, `calendar`, `skill`);
- se in futuro lo stato acquisisce comportamento comune oltre lo styling, valutare `CompletionButton`.

Promuovere a `CompletionButton` solo se emergono almeno 3 callsite con logica propria, per esempio:

- gestione coerente di `aria-pressed` / `role`;
- animazione o transizione;
- label standardizzata;
- comportamento comune oltre lo styling.

### ConfirmDialog

Creare un wrapper custom solo quando ci sono almeno 3 callsite da migrare:

- reset schedule;
- cancellazione selezione personale;
- cancellazione account o richiesta cancellazione.

Il wrapper deve garantire che l'action destructive non erediti gold + glow da `AlertDialogAction`.

## Audit ripetibile

Non legare l'audit a bash o PowerShell. La soluzione finale consigliata e':

- `scripts/ui-audit.mjs`, senza nuove dipendenze;
- comando npm `ui:audit`;
- baseline JSON in `docs/ui-audit-baseline.json`.

Lo script deve distinguere almeno due superfici:

- `domain_surface`: `src/app/**` e `src/components/**` esclusi `src/app/globals.css`, `ui/**` e `primitives/**`;
- `allowed_surface`: `src/components/ui/**`, `src/components/primitives/**` e `src/lib/ui-classes.ts`.

La metrica principale e' `domain_surface`. I match in `allowed_surface` possono crescere quando si centralizza uno stile; i match in `domain_surface` devono calare o restare stabili.

Finche' lo script non esiste, usare questi comandi `rg` adattandoli alla shell locale:

```txt
rg -n "bg-primary text-primary-foreground|border-primary bg-primary" src/app src/components --glob "!src/app/globals.css" --glob "!src/components/ui/**" --glob "!src/components/primitives/**"
rg -n "rounded-(xl|lg|full)" src/app src/components --glob "!src/components/ui/**" --glob "!src/components/primitives/**"
rg -n "tap-feedback" src/app src/components --glob "!src/app/globals.css" --glob "!src/components/ui/**" --glob "!src/components/primitives/**"
rg -n "<button|<select|<textarea" src/app src/components --glob "!src/components/ui/**" --glob "!src/components/primitives/**"
rg -n "var\\(--status-success\\)|var\\(--destructive\\)" src/app src/components --glob "!src/app/globals.css" --glob "!src/components/ui/**" --glob "!src/components/primitives/**"
rg -n "shadow-\\[0_0_24px_var\\(--gold-glow\\)" src/app src/components --glob "!src/components/ui/button.tsx"
```

Ogni fase registra:

```txt
domain_surface_before -> domain_surface_after
allowed_surface_before -> allowed_surface_after
```

Se `domain_surface` aumenta, la PR deve spiegare perche'. Se aumenta solo `allowed_surface`, la PR deve indicare quale stile e' stato centralizzato.

## Roadmap

Ogni fase va trattata come una PR piccola o una sequenza di commit atomici. Non fare una mega-PR.

### Fase 0: Allineamento documentale

Obiettivo: rendere legittima la direzione prima di muovere file.

1. Aggiornare `../plan/current-plan.md` con la cartella `src/components/primitives/`, se si decide di adottarla.
2. Aggiornare `CLAUDE.md` aggiungendo:
   - `ui/` shadcn-managed;
   - `primitives/` per custom UI generici;
   - PascalCase per custom components.
3. Creare `docs/ui-system.md` con regole sintetiche:
   - Button;
   - Chip;
   - SegmentedNav;
   - OptionCard;
   - FormSelect;
   - classi Tailwind locali ammesse/vietate;
   - eccezioni brand.

Output concreto:

- `CLAUDE.md` aggiornato;
- `../plan/current-plan.md` aggiornato;
- `docs/ui-system.md` creato.

Rollback: revert della sola documentazione.

### Fase 1: Baseline e stabilizzazione senza spostamenti

Obiettivo: trasformare l'audit in dati misurabili prima di muovere file.

1. Verificare la migrazione corrente:
   - `primitives/Chip.tsx`;
   - `primitives/OptionCard.tsx`;
   - `primitives/SegmentedNav.tsx`;
   - `lib/ui-classes.ts`.
2. Creare `docs/ui-audit-baseline.json` con conteggi iniziali separati per `domain_surface` e `allowed_surface`.
3. Aggiornare l'Appendice A di questo documento con inventario componente -> target -> fase.
4. Verificare callsite esistenti e props:
   - `ChipButton`;
   - `chipClassName`;
   - `OptionCard selected`;
   - `SegmentedNav fullWidth/compact`.
   - `FormSelect label/helperText`.
5. Se una prop e' instabile, correggerla ora con il minimo cambio possibile.
6. Non creare nuovi primitivi.

Output concreto:

- `docs/ui-audit-baseline.json`;
- Appendice A aggiornata;
- elenco callsite principali citato nella PR.

Rollback: revert dei singoli componenti o callsite.

### Fase 2: Migrazione cartella

Stato: completata nella prima tranche di implementazione.

Prerequisito di approvazione:

- Fase 0 mergeata con `CLAUDE.md` e `../plan/current-plan.md` aggiornati;
- Fase 1 completata con baseline e inventario.

Commit atomici:

1. `shared/Chip.tsx` -> `primitives/Chip.tsx`; aggiornare import; verificare.
2. `shared/OptionCard.tsx` -> `primitives/OptionCard.tsx`; aggiornare import; verificare.
3. `shared/SegmentedNav.tsx` -> `primitives/SegmentedNav.tsx`; aggiornare import; verificare.

`buttonStates.ts` non esiste piu': lo stato completato e' centralizzato in `src/lib/ui-classes.ts`.

Rollback: revert del singolo commit.

### Fase 3: Sessions e setup pratica

Obiettivo: completare la zona piu' ricca di selettori.

Componenti:

- `WeekdayChips`;
- `DurationPicker`;
- `CadencePicker`;
- `ExamScopePicker`;
- `RepsStepper`;
- `SetupForm`.

Regole:

- `Chip` per selezioni compatte;
- `OptionCard` per scelte grandi;
- niente nuovo `ActionBar` finche' non ci sono almeno 3 callsite reali.

Rimandare:

- `ResetScheduleSection`, che dipende da `ConfirmDialog`.

### Fase 4: Today e stato completato

Obiettivo: centralizzare lo stato "fatto" senza over-engineering.

Componenti:

- `PracticeCheckButton`;
- `RepsCounter`;
- `PracticeCompletionToggle`;
- `SkillPracticeActions`;
- `TodaySkillCard`.

Regole:

- verificare gli import di `src/lib/ui-classes.ts`;
- mantenere la classe in `lib` finche' resta cross-domain;
- creare `CompletionButton` solo se serve logica comune oltre lo styling;
- verificare `aria` e stato disabled per i bottoni gia' completati.

### Fase 5: Calendar

Obiettivo: ridurre complessita' solo dove conviene.

Componenti:

- `Calendar`;
- `CalendarDayPanel`;
- `AddFreePracticeSheet`;
- `PracticeCompletionToggle`.

Estrazioni ammesse:

- `CalendarToolbar`, se riduce davvero il file padre;
- `CalendarDayCell`, se incapsula bene stato selected/month/rest;
- `CalendarPracticeRow`, se scheduled/free practice condividono abbastanza.

Non creare `ListRow` generico finche' non emergono almeno 3 callsite cross-domain.

### Fase 6: ConfirmDialog

Obiettivo: wrapper destructive solo quando giustificato.

Creare `primitives/ConfirmDialog.tsx` se e solo se ci sono almeno 3 callsite:

- reset schedule;
- cancellazione selezione personale;
- cancellazione account o richiesta cancellazione.

Migrare un callsite per commit.

### Fase 7: Library e Programma

Obiettivo: unificare le righe skill e stabilizzare i tab.

Componenti:

- `SkillListItem`;
- `ProgramSkillRow`;
- `GradeSection`;
- `LibraryFilters`;
- `PlanTabsNav`;
- `programma/page.tsx`.

Decisioni:

- creare `SkillRow` solo se puo' sostituire davvero sia `SkillListItem` sia `ProgramSkillRow` senza props eccessive;
- `PlanTabsNav` resta un componente domain in `src/components/programma/`;
- `PlanTabsNav` puo' importare `SegmentedNav` solo se la forma corrisponde senza gonfiare `SegmentedNav` con props troppo specifiche;
- altrimenti `PlanTabsNav` tiene una composizione locale documentata.

Criterio PlanTabsNav:

- se le tab rappresentano cambio vista mutuamente esclusivo, usare `SegmentedNav`;
- se rappresentano gerarchia laterale/folder-specific con marker "attivo", tenerlo domain-specific.

### Fase 8: Plan custom/exam

Componenti:

- `CustomSelectionForm`;
- `ExamModeForm`;
- banner attivazione piano.

Obiettivo:

- completare uso di `Chip`;
- valutare `ConfirmDialog`;
- valutare `ActionBar` solo se altri callsite lo richiedono;
- sostituire select locali con primitivo solo se il pattern e' gia' presente in almeno 3 punti.

### Fase 9: Profile, Auth, Onboarding

Componenti:

- `LoginForm`;
- `ForgotPasswordForm`;
- `UpdatePasswordForm`;
- `OnboardingForm`;
- `ProfilePage`;
- `GradeEditor`;
- `PlanModeSection`;
- `PrivacyDataSection`;
- `ChangePasswordSection`.

Obiettivo:

- non creare `AuthCard` o `FormSection` in anticipo;
- prima misurare duplicazione reale;
- creare `FormSelect` solo se i select locali sono almeno 3 e hanno stessa ricetta.

### Fase 10: Aree brand/editoriali

Aree:

- landing;
- hub;
- news;
- progress;
- video player.

Regola:

- soft touch;
- non sterilizzare l'identita' visiva;
- documentare eccezioni in `docs/ui-system.md`;
- intervenire solo su controlli operativi chiaramente incoerenti.

### Fase 11: Pulizia `lib`

Da fare solo dopo stabilizzazione UI:

- `lib/format.ts` se la duplicazione di date/testi e' reale;
- split di `lib/types.ts` solo se migliora la navigazione;
- nessuna modifica alle query/action solo per estetica.

## Cosa non fare

- Non aggiungere componenti custom in `src/components/ui/`.
- Non creare `PageHeader`, `SectionCard`, `ActionBar`, `ListRow`, `FilterPanel`, `AuthCard`, `FormSection` in Fase 1.
- Non creare `composed/` se contiene meno di 3 componenti.
- Non fare rename massivi in un unico commit.
- Non promuovere `src/lib/ui-classes.ts` a componente senza evidenza.
- Non reintrodurre `shared/buttonStates.ts`.
- Non introdurre Storybook, Chromatic o nuove UI library.
- Non rifattorizzare `lib/` mentre si sta ancora stabilizzando la UI.

## Checklist per ogni PR

```txt
[ ] Decision tree applicato per ogni nuovo componente
[ ] Soglia >=3 callsite reali rispettata o eccezione dichiarata
[ ] Nessun nuovo componente custom in src/components/ui/
[ ] Tailwind locale solo nelle categorie ammesse
[ ] Audit rg eseguito e conteggi indicati nella PR
[ ] domain_surface non aumenta senza giustificazione
[ ] allowed_surface aumenta solo se centralizza stile
[ ] npm run lint passa
[ ] npx tsc --noEmit passa
[ ] npm test passa
[ ] npm run build passa se non bloccato da lock/processo Next
[ ] Smoke manuale sulle rotte impattate
[ ] PR revert-safe
```

## Verifiche

Obbligatorie a ogni tranche:

```txt
npm run lint
npx tsc --noEmit
npm test
```

Build:

```txt
npm run build
```

Se `next build` e' bloccato da `.next/lock` o da un processo appeso, documentare il blocco e non considerarlo errore di codice finche' lint, typecheck e test passano.

Smoke manuale minimo per modifiche UI:

- aprire le rotte toccate;
- verificare che CTA primaria, selettori, stati completati e destructive dialog abbiano gerarchia coerente;
- salvare screenshot prima/dopo se la PR e' visiva.

Playwright:

- utile, ma non obbligatorio in Fase 0 se richiede nuova dipendenza;
- introdurlo solo con approvazione esplicita;
- in alternativa, creare una checklist manuale ripetibile.

Rotte critiche per smoke:

- `/today`
- `/programma`
- `/library`
- `/calendar`
- `/sessions/setup`
- `/profile`
- `/plan/custom`
- `/plan/exam`

## Rischi e mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---:|---|
| Conflitto con shadcn | Alto | `ui/` resta shadcn-managed; custom in `primitives/` solo dopo aggiornamento piano |
| Astrazione prematura | Alto | decision tree e soglia >=3 callsite |
| Rename massivo rompe import | Alto | un componente per commit |
| Refactor blocca feature | Alto | PR piccole, mergeabili in giornata |
| Regressione visiva | Medio | smoke manuale e screenshot prima/dopo |
| Drift dark/gold | Medio | eccezioni brand documentate e audit sul glow |
| Over-engineering completion state | Medio | costante condivisa prima, componente solo dopo evidenza |
| Audit shell-specific | Basso | script Node `ui-audit.mjs` invece di dipendere da bash/PowerShell |

## Deliverable finale

Il refactor e' completo quando esistono:

1. `docs/ui-system.md` con regole d'uso UI.
2. `docs/ui-codebase-refactor-plan.md` aggiornato con stato delle fasi.
3. `docs/ui-audit-baseline.json` con conteggi iniziali.
4. `scripts/ui-audit.mjs` per audit ripetibile.
5. Eventuale `src/components/primitives/` documentato in `../plan/current-plan.md` e `CLAUDE.md`.
6. Riduzione misurabile delle classi UI locali nei componenti dominio.
7. Lint, typecheck, test e build verdi o blocco build documentato.

## Criteri di successo

Il lavoro e' riuscito quando:

- un nuovo sviluppatore capisce in meno di 2 minuti quale componente usare per button, chip, segmented control, option card e destructive dialog;
- i componenti dominio non copiano ricette Tailwind complesse;
- il gold pieno indica quasi sempre la CTA primaria;
- gli stati completati sono centralizzati;
- le pagine leggono come composizione, non come markup UI dettagliato;
- le eccezioni sono intenzionali e documentate;
- l'audit mostra riduzione o stabilita' dei match strutturali in `domain_surface` rispetto alla baseline.

Target numerici:

- non fissarli prima della baseline reale;
- dopo la Fase 1 aggiungere target indicativi per area, per esempio riduzione del 50% dei match gold-fill fuori da primitive entro la Fase 7;
- i target sono gate di direzione, non motivo per creare astrazioni premature.

## Appendice A: inventario candidati

Questa tabella e' una baseline operativa. Va aggiornata in Fase 1 dopo l'audit completo.

| Componente attuale | Cartella attuale | Target consigliato | Fase | Note |
|---|---|---|---:|---|
| `Chip.tsx` | `primitives/` | resta `primitives/Chip.tsx` | 2 | Primitiva custom generica usata da filtri/selettori. |
| `OptionCard.tsx` | `primitives/` | resta `primitives/OptionCard.tsx` | 2 | Primitiva per scelte grandi. |
| `SegmentedNav.tsx` | `primitives/` | resta `primitives/SegmentedNav.tsx` | 2 | Primitiva per scelte mutuamente esclusive. |
| `FormSelect.tsx` | `primitives/` | resta `primitives/FormSelect.tsx` | 2 | Giustificato da select duplicati in onboarding, piano esame e profilo. |
| `ui-classes.ts` | `lib/` | resta `lib/ui-classes.ts` | 4 | Contiene la classe success cross-domain. |
| `EmptyState.tsx` | `shared/` | `primitives/EmptyState.tsx` candidato | 9 | Solo se resta presentazionale e ha >=3 callsite. |
| `MetricStrip.tsx` | `shared/` | `primitives/MetricStrip.tsx` candidato | 10 | Solo se non incorpora logica di dominio/progress. |
| `AppHeader.tsx` | `shared/` | resta `shared/` | 0 | Shell app/layout. |
| `AppHeaderConditional.tsx` | `shared/` | resta `shared/` | 0 | Dipende da routing/shell. |
| `AppRouteSkeleton.tsx` | `shared/` | resta `shared/` | 0 | Skeleton di route app. |
| `TempleHomeIcon.tsx` | `shared/` | resta `shared/` | 0 | Asset identitario. |
| `BottomNav.tsx` | `nav/` | resta `nav/` | 0 | Navigazione applicativa, non primitiva UI pura. |
| `WeekdayChips.tsx` | `sessions/` | resta `sessions/`, usa `Chip` | 3 | Wrapper dominio per giorni pratica. |
| `DurationPicker.tsx` | `sessions/` | resta `sessions/`, usa `Chip` | 3 | Wrapper dominio per durata. |
| `CadencePicker.tsx` | `sessions/` | resta `sessions/`, usa `OptionCard` | 3 | Wrapper dominio per cadenza. |
| `ResetScheduleSection.tsx` | `sessions/` | resta `sessions/`, usa `ConfirmDialog` se creato | 6 | Destructive confirm. |
| `Calendar.tsx` | `calendar/` | resta `calendar/` | 5 | Estrarre toolbar/cell solo se riduce complessita'. |
| `AddFreePracticeSheet.tsx` | `calendar/` | resta `calendar/` | 5 | Verificare gerarchia CTA nelle righe. |
| `PracticeCompletionToggle.tsx` | `calendar/` | resta `calendar/`, usa classe completion centralizzata | 4 | Stato, non CTA primaria. |
| `PracticeCheckButton.tsx` | `today/` | resta `today/`, usa classe completion centralizzata | 4 | Valutare `CompletionButton` solo con logica comune. |
| `RepsCounter.tsx` | `today/` | resta `today/`, usa classe completion centralizzata | 4 | Stato completato condiviso. |
| `SkillPracticeActions.tsx` | `skill/` | resta `skill/`, usa classe completion centralizzata | 4 | Import cross-domain rilevante per decisione Fase 4. |
| `LibraryFilters.tsx` | `library/` | resta `library/`, compone `Chip`/`SegmentedNav` | 7 | Non creare `FilterPanel` se non necessario. |
| `SkillListItem.tsx` | `library/` | possibile `composed/SkillRow.tsx` | 7 | Solo se unifica davvero con `ProgramSkillRow`. |
| `ProgramSkillRow.tsx` | `library/` | possibile `composed/SkillRow.tsx` | 7 | Verificare props prima dell'estrazione. |
| `PlanTabsNav.tsx` | `programma/` | resta `programma/` | 7 | Puo' importare `SegmentedNav`, ma non deve deformarlo. |
| `CustomSelectionForm.tsx` | `plan/` | resta `plan/`, compone `Chip`/`ConfirmDialog` | 8 | Evitare select/ActionBar prematuri. |
| `ExamModeForm.tsx` | `plan/` | resta `plan/` | 8 | Valutare solo duplicazione reale. |
| `OnboardingForm.tsx` | `src/app/(app)/onboarding/` | resta feature/app, compone `OptionCard` e `FormSelect` | 9 | Non creare `AuthCard` in anticipo. |
| `PrivacyDataSection.tsx` | `profile/` | resta `profile/`, usa `ConfirmDialog` se creato | 9 | Destructive/request flow. |
