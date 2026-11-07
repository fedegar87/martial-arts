# UI system operativo

Versione: 2026-11-07.

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

Per varianti video con etichette lunghe usare `wrapLabels`; gli altri utilizzi
mantengono il testo troncato predefinito. `replace` e `scroll={false}` sono
opzioni esplicite per cambiare variante senza accumulare history o spostare la
pagina: non applicarle automaticamente alle altre navigazioni.

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

## Disclosure

`Disclosure` e' la primitiva condivisa per le cinque sezioni secondarie del
Profilo. Riusa `Card` con `details`/`summary` nativi: titolo e riepilogo visibili,
chevron, target minimo 56 px e focus interno al bordo. Le sezioni si aprono
indipendentemente e i figli restano montati, conservando i campi alla chiusura.
Il toggle funziona anche senza JavaScript; `revealKey` riapre la sezione quando
arriva un nuovo esito dell'azione, senza controllare lo stato nativo del toggle.

Identita' e gradi restano visibili; Allenamento, Calendario ed Esci mantengono
accessi diretti. Non annidare altri accordion intorno a questi controlli.
I riepiloghi devono rappresentare lo stato salvato, non le bozze dei form;
eventuali richieste pendenti devono essere riconoscibili anche a sezione chiusa.

Nel Calendario gli eventi federali riusano celle e giorno esistenti: un solo
indicatore, elenco essenziale e dettagli su richiesta nel `material-sheet`.
Il pannello deve restare scorrevole entro il viewport, con focus ripristinato
alla riga, chiusura accessibile e feedback visibile dopo le azioni asincrone.
Ricordamelo e' per singolo evento; il Profilo conserva l'orario comune e
l'interruttore separato degli allenamenti, senza nuovi pannelli o filtri.

Home usa `House` Lucide nello stesso `Button` ghost della campanella (48 px).
Entra nella landing usa il `Button` primario condiviso. Il logo resta un asset
nitido: il glass si applica alle superfici di navigazione e sovrapposizione,
senza blur sul marchio, sulle celle o sui testi degli eventi.

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

## Superfici e ombre

Mappa delle superfici (token in `globals.css`):

- pagina / sfondo app = `--surface-base`
- card e sezioni raggruppate = `--surface-grouped` (`bg-card`)
- chrome sovrapposto (header, sheet, nav) = `--surface-elevated`, applicato via `material-bar` / `material-sheet`
- nota / contenuto incassato = `--surface-inset` (classe `surface-inset`)

I materiali di barre e pannelli sono definiti soltanto in `globals.css`, tramite
i token `--material-*`, derivati dalle superfici del tema. Barre: opacita' 86%,
blur 16 px e saturazione 120%; navigazione: opacita' 88%; pannelli: opacita' 95%,
blur 18 px e saturazione 115%. Bordi luminosi al 5% e ombre contenute. Le
etichette secondarie delle barre hanno un colore locale leggermente piu' chiaro
per mantenere il contrasto anche sopra contenuti chiari.

Le ricette `material-bar` / `material-sheet` sono intenzionalmente fuori dai
layer Tailwind: l'opt-in al materiale deve prevalere sul `bg-popover` generato
di shadcn. La navigazione varia i token della ricetta comune, senza duplicare
background o filtri con selettori piu' specifici. Non modificare i componenti
generati e non aggiungere override nei singoli callsite.

La base e' opaca; `@supports` abilita trasparenza e blur soltanto con supporto
al filtro. Scrivere `-webkit-backdrop-filter` prima di `backdrop-filter`: l'ordine
inverso fa perdere la proprieta' standard nell'ottimizzazione della build.
Verificare gli stili calcolati con il CSS di produzione, non soltanto il sorgente.
Non animare i filtri: i pannelli limitano le transizioni a opacita' e movimento.

`prefers-reduced-transparency: reduce` e `prefers-contrast: more` rendono opachi
i materiali ed eliminano il blur anche dagli overlay di sheet e alert-dialog.
Con contrasto aumentato i separatori sono piu' evidenti; `forced-colors: active`
usa colori di sistema senza filtri o ombre. Conservare il controllo del sistema
sui colori, il focus visibile e le preferenze di movimento gia' esistenti.

Applicare questi materiali ai livelli di navigazione e comandi sovrapposti.
Card, testi e controlli ordinari conservano i trattamenti esistenti; evitare
filtri per pulsante, rifrazione e sfondi decorativi aggiunti per mostrare il vetro.

Esistono due tier di "card su pagina", entrambi intenzionali:

- **Card standard** (`<Card>` shadcn): `rounded-md` + ombra ambient `shadow-[0_0_40px_rgba(0,0,0,0.35)]`. Default per contenuto e controlli (today, profilo, programma, skill).
- **Data card** (`/progress`): `rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]`. Variante piu' piatta per le sezioni dati/statistiche; lo skeleton di sezione condivide lo stesso trattamento per evitare shadow-pop al caricamento.

Non introdurre un terzo trattamento: nuova superficie di contenuto/controllo usa `<Card>`, nuova sezione dati in `/progress` usa la data card.

## Eccezioni brand

Landing, hub, news, progress e video player possono restare piu' espressivi. Le eccezioni devono riguardare identita' o contenuto editoriale, non controlli operativi come bottoni, chip, tab o conferme destructive.
