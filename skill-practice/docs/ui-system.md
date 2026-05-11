# UI system operativo

Versione: 2026-05-11.

Questo documento e' la guida rapida per scegliere componenti UI, classi locali e cartelle. Il piano completo e' in `docs/ui-codebase-refactor-plan.md`.

## Cartelle

- `src/components/ui/`: solo componenti shadcn-managed. Non aggiungere primitive custom.
- `src/components/primitives/`: primitive UI custom del progetto, senza dominio, PascalCase.
- `src/components/shared/`: shell/app/layout, asset identitari e componenti trasversali non puramente presentazionali.
- `src/components/<domain>/`: componenti che conoscono skill, piano, calendario, profilo, label o azioni di dominio.
- `src/components/composed/`: opzionale; creare solo quando esistono almeno 3 pattern semantici chiari.

## Decision tree

```txt
Il pattern e' usato in almeno 3 callsite reali oggi?
|-- No
|   `-- resta locale; non creare un componente.
`-- Si
    `-- conosce concetti di dominio?
        |-- Si
        |   `-- components/<domain>/
        `-- No
            `-- conosce stato app generico?
                |-- Si
                |   `-- components/composed/ solo se la cartella contiene almeno 3 pattern.
                `-- No
                    `-- components/primitives/
```

Eccezione ammessa: 2 callsite + un terzo introdotto nella stessa PR.

## Button

- `default`: CTA primaria, gold pieno + glow. Massimo una per intent.
- `secondary`: azione importante ma non finale.
- `outline`: azione neutra o terziaria.
- `ghost`: azione leggera, inline o di annullamento.
- `destructive`: azione pericolosa.
- `link`: link testuale.

Nei contesti ripetitivi, come righe lista o sheet, evitare `default` su ogni riga. Usare `secondary` o `outline`.

## Chip

Usare `ChipButton` o `chipClassName` per filtri, gradi, giorni settimana, durata e tag selezionabili compatti.

Stato attivo:

```txt
border-primary bg-primary/10 text-primary
```

Non usare `bg-primary text-primary-foreground` per chip selezionati.

## SegmentedNav

Usare per opzioni mutuamente esclusive come disciplina, vista calendario o contesto.

Stato attivo:

```txt
border-border bg-card text-foreground
```

Non usare gold pieno.

## OptionCard

Usare per scelte grandi nei form: disciplina onboarding, cadenza, scope sessioni.

Regole:

- input reale dentro la card;
- selezionato con `border-primary bg-primary/10 text-foreground`;
- focus centralizzato nel componente.

## FormSelect

Usare `FormSelect` per select nativi con ricetta coerente. Resta una primitiva leggera: non sostituisce Radix Select e non introduce un form system.

Crearla e mantenerla ha senso perche' ci sono callsite reali in onboarding, piano esame e profilo.

## Stato completato

Lo stato completato e' uno stato, non una CTA primaria.

- Usare la classe condivisa da `src/lib/ui-classes.ts`.
- Promuovere a `CompletionButton` solo se emergono almeno 3 callsite con logica comune oltre lo styling.

## Tailwind locale

Ammesso nei componenti dominio:

- layout: `flex`, `grid`, `gap-*`, `space-*`, `items-*`, `justify-*`, `w-*`, `h-*`, `overflow-*`, `truncate`, `sr-only`;
- spaziatura pagina/sezione: `mt-*`, `mb-*`, `pt-*`, `pb-*`, `px-*`, `py-*` su wrapper;
- tipografia di contenuto statico: `text-sm`, `font-medium`, `uppercase`, `leading-*`;
- eccezioni brand/editoriali intenzionali.

Da evitare nei componenti dominio:

- colori strutturali su elementi interattivi;
- radius su elementi interattivi;
- stati `hover:*`, `focus-visible:*`, `aria-*:*`, `data-*:*`;
- glow gold fuori da `Button variant="default"`;
- success/destructive duplicati fuori da primitive o `src/lib/ui-classes.ts`;
- `tap-feedback` fuori da primitive o componenti documentati.

## Eccezioni brand

Landing, hub, news, progress e video player possono restare piu' espressivi. Le eccezioni devono riguardare identita' o contenuto editoriale, non controlli operativi come bottoni, chip, tab o conferme destructive.
