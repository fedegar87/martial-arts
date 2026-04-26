# GUI/UX Experience Audit - Skill Practice

**Status:** nuova analisi UX separata dal master plan
**Data:** 2026-04-25
**Scope:** esperienza implementata oggi in `skill-practice`, navigazione, moduli, tabs, pratica, libreria/programma, profilo, progresso e possibile landing pubblica
**Non modifica:** `plan/master-execution-plan.md`

---

## 0. Evidenza usata

Audit basato su lettura codice e build locale:

- `npm run lint` passa
- `npm run build` passa
- Route reali: `/login`, `/onboarding`, `/today`, `/library`, `/library/all`, `/library/exam`, `/library/exam/[examId]`, `/library/program`, `/skill/[skillId]`, `/plan/exam`, `/plan/custom`, `/profile`, `/progress`, `/news`
- Componenti UX principali letti: `BottomNav`, `TodaySkillCard`, `VideoPlayer`, `LibraryNav`, `DisciplineToggle`, `CustomSelectionForm`, `ExamModeForm`, `PlanModeSection`, componenti `progress`

Limite dell'audit: non e' stato fatto un walkthrough browser con account Supabase reale. Quindi questa analisi valuta la UX implementata nel codice, non lo stato del DB remoto o dei video reali.

---

## 1. Diagnosi sintetica

L'app oggi e' funzionale, ma comunica ancora "tool tecnico interno" piu' che "compagno di pratica quotidiana".

Il modello di prodotto e' forte: curriculum FESK, programma per grado, pratica giornaliera, video e log. Il problema UX e' che questo modello resta distribuito in molte schermate con gerarchie deboli:

- "cosa devo fare ora" e' chiaro solo in `/today`, ma la sessione non guida davvero la pratica
- "come scelgo cosa praticare" e' nascosto tra Profilo, Piano, Libreria e Programma
- "dove sono nel percorso FESK" esiste in Progress/Programma, ma non diventa il centro narrativo dell'app
- "perche' questa app vale" non esiste fuori dal login: nessuna landing, nessuna hero, nessun racconto per utenti o federazione

La priorita' UX non e' aggiungere decorazione. E' ridisegnare l'informazione attorno a tre domande:

1. Cosa pratico oggi?
2. Per quale obiettivo mi sto allenando?
3. Come sto avanzando nel programma?

---

## 2. Problemi trasversali P0/P1

### P0 - Da correggere prima di rifinire

| Area | Problema | Impatto | Raccomandazione |
|---|---|---|---|
| Encoding/copy | Nel codice sono presenti stringhe mojibake, inclusi dash, emoji e lettere accentate renderizzati male | La UI puo' apparire non professionale e poco affidabile | Normalizzare encoding UTF-8 e sostituire tutte le stringhe mojibake |
| Accessibilita' | `viewport.userScalable = false` e `maximumScale = 1` | Blocca zoom utente, male per accessibilita' mobile | Rimuovere il blocco zoom |
| Touch target | Bottoni shadcn default `h-8`, select `h-9`, checkbox `h-4` | Sotto i 48px richiesti per uso mobile durante allenamento | Portare controlli interattivi principali a min 44-48px |
| Data "oggi" | `toISOString().split("T")[0]` usa UTC | In Italia puo' segnare il giorno sbagliato in alcune fasce orarie | Usare helper locale/timezone per date pratica |
| Iconografia | Uso di emoji per categorie/practice mode | Rendering instabile, gia' rotto dall'encoding; stile non coerente | Passare a Lucide o icone interne coerenti |

### P1 - Debiti UX visibili

| Area | Problema | Raccomandazione |
|---|---|---|
| Font | CSS dichiara Cormorant/Spectral/Bebas, ma `layout.tsx` carica solo Geist | Caricare font reali o rimuovere la promessa visiva |
| Moduli | Form con `select` native, checkbox piccole, `window.confirm` | Usare componenti coerenti: select/sheet/dialog/checkbox row |
| Tabs | Ogni area ha toggle diversi: `LibraryNav`, `DisciplineToggle`, Progress buttons | Creare un unico pattern `SegmentedNav` + `SubTabs` |
| Navigazione | `/plan/*` e `/news` sono route importanti ma poco discoverable | Rendere Piano e Bacheca azioni visibili nel flusso principale |
| Copy | Alternanza "skill", "forme", "programma", "piano" | Stabilire lessico: usare "forme/tecniche" lato utente, "skill" solo nel codice |

---

## 3. Information Architecture proposta

### Stato attuale

Bottom nav:

```text
Oggi | Libreria | Progresso | Profilo
```

Rotte fuori nav:

```text
/plan/exam
/plan/custom
/news
```

Problema: il piano di pratica e' una scelta centrale, ma non ha una posizione mentale chiara. La bacheca e' dichiarata funzione core, ma non e' raggiungibile dalla nav.

### Proposta Scenario A - MVP personale

Tenere 4 tab per non sovraccaricare la bottom nav:

```text
Oggi | Programma | Progressi | Profilo
```

Mappatura:

- `Oggi`: pratica quotidiana + CTA "Modifica piano"
- `Programma`: sostituisce "Libreria"; contiene curriculum, esami, tutte le forme
- `Progressi`: storico, copertura, grado, riflessioni
- `Profilo`: dati personali, gradi, impostazioni, uscita

Il "Piano" non deve per forza essere una tab primaria: deve essere una CTA persistente nei punti giusti:

- header di `Oggi`: "Piano attivo: Programma esame / Selezione libera" + "Modifica"
- empty state di `Oggi`
- pagina `Programma`, accanto alle skill selezionabili
- Profilo come impostazione secondaria

La bacheca in Scenario A puo' vivere come card/banner in `Oggi`, con badge "nuovo", senza diventare quinta tab.

### Proposta Scenario B - federazione/scuole

Quando ci sono utenti terzi e comunicazioni reali:

```text
Oggi | Programma | Progressi | Bacheca | Profilo
```

Cinque tab sono accettabili solo se:

- label corte
- icone chiare
- safe area gestita
- Bacheca ha uso reale settimanale, non e' placeholder

---

## 4. Landing pubblica

### Stato attuale

Non esiste landing. `/` fa redirect a `/login`, `/onboarding` o `/today`.

Questo e' coerente con MVP personale, ma non con una fase di pre-validazione federazione/scuole. Se l'app deve essere capita da un istruttore o da un allievo prima del login, serve una landing separata.

### Raccomandazione

Per non rompere il flusso app:

- mantenere `/today` come ingresso app per utenti loggati
- trasformare `/` in landing pubblica solo quando serve Scenario B/pre-vendita
- lasciare `/login` come route di accesso diretta

### Struttura landing consigliata

Hero, primo viewport:

- H1: `Skill Practice FESK` oppure `Il quaderno tecnico digitale FESK`
- Background: foto/video reale di pratica o immagine generata realistica coerente, non gradient astratto
- Copy breve: "Programma per grado, video tecnici e pratica quotidiana in una PWA installabile."
- CTA primaria: "Accedi"
- CTA secondaria: "Guarda come funziona"
- Nel primo viewport deve intravedersi la sezione successiva

Sezioni:

1. **Oggi fai questo**: screenshot/card della pratica giornaliera
2. **Programma FESK completo**: gradi, discipline, esami, skill bloccate/sbloccate
3. **Video e note tecniche**: player lazy + nota del maestro
4. **Progressi**: calendario, copertura curriculum, esame in preparazione
5. **Come funziona**: scegli disciplina/grado, prepara esame, pratichi, registri progressi
6. **Per scuole/federazione**: solo se autorizzato; evitare claim ufficiali non confermati

No pricing, no waiting list, no form contatto finche' non sono pronte privacy/ToS.

---

## 5. Schermate: analisi e ridisegno

### 5.1 Login

Stato attuale:

- card centrata con email/password
- titolo generico "Accedi"
- nessun brand signal forte
- nessun recupero password o magic link

Problema:

Per un'app a forte identita' marziale, il login sembra un boilerplate. Inoltre la prima esperienza non spiega il prodotto.

Raccomandazione:

- aggiungere mini-brand header sopra il form
- copy: "Accedi al tuo quaderno tecnico"
- aggiungere "Password dimenticata" se Supabase flow previsto
- se si introduce landing, login resta asciutto ma coerente visivamente
- non usare card hero per la landing; il form puo' restare card

### 5.2 Onboarding

Stato attuale:

- una singola card con discipline, gradi, esame
- select native
- default Shaolin attivo, T'ai Chi off
- esame richiesto
- mostra solo i primi 4 esami come preview

Problemi:

- troppa decisione in una pagina unica
- non chiarisce "programma esame" vs "selezione libera"
- l'utente non vede quante forme entreranno nel piano
- i select mostrano dati tecnici, non una progressione guidata

Ridisegno:

```text
Step 1 - Cosa pratichi?
[Shaolin] [T'ai Chi]

Step 2 - Qual e' il tuo grado attuale?
Shaolin: [8 Chi ...]
T'ai Chi: [non pratico / 5 Chi ...]

Step 3 - Come vuoi iniziare?
[Preparo il prossimo esame]
[Scelgo forme da ripassare]

Step 4 - Anteprima piano
12 forme: 5 focus, 5 ripasso, 2 mantenimento
[Inizia pratica]
```

Acceptance UX:

- ogni step ha massimo 1 decisione primaria
- controlli 48px
- preview del risultato prima di creare il piano
- possibilita' di iniziare anche senza esame, finendo su selezione libera

### 5.3 Today

Stato attuale:

- header con saluto, giorno e gradi
- filtro disciplina solo se entrambe praticate
- sezioni Focus/Ripasso/Mantenimento
- ogni card contiene video, note, partner warning, bottone Fatto, menu stato

Punti buoni:

- la pagina risponde alla domanda "cosa faccio oggi"
- lazy video evita carico YouTube immediato
- status menu esplicito, non nascosto in long-press

Problemi:

- se ci sono molte card, la pagina diventa una lista lunga di player
- non esiste una "sessione" guidata: l'utente scrolla e decide
- "Fatto" non offre undo, nota rapida o qualita' pratica
- week summary e' debole: "X giorni" non dice se sto seguendo il piano

Ridisegno:

- in alto: `Piano attivo`, `N skill oggi`, `tempo stimato`, `Modifica piano`
- CTA primaria: `Inizia sessione`
- sotto: queue compatta con Focus/Ripasso/Mantenimento
- card espansa solo per la skill attiva o tappata
- dopo "Fatto": sheet leggero con `Aggiungi nota` / `Salta` / eventuale qualita' futura

Pattern:

```text
Oggi
12 min stimati - 4 forme
[Inizia sessione]

Focus
[Siu Nim Tao] [8 min] [Apri]

Ripasso
[Tui Fa 1] [3 min] [Apri]
```

### 5.4 Programma/Libreria

Stato attuale:

- tab "Libreria" con sotto-tab: Mio livello, Per esame, Tutto, Programma
- toggle disciplina ripetuto in piu' pagine
- lista skill per categorie
- vista Programma mostra skill introdotte per grado e locked state

Problema:

"Libreria" e' un termine generico. Per questo prodotto il concetto forte e' "Programma": gradi, esami, discipline. Inoltre le tab mescolano tre intenti:

- consultare il curriculum
- trovare una tecnica
- modificare il piano

Ridisegno:

Rinominare tab principale in `Programma`.

Sotto-tab:

```text
Mio grado | Prossimo esame | Curriculum | Tutte
```

Azioni:

- ogni riga skill: stato nel piano visibile
- CTA contestuale: `Aggiungi al piano` / `Nel piano`
- per gradi futuri: lock con testo breve, non solo opacita'
- ricerca testuale opzionale quando i contenuti reali superano 100 item

La vista Programma deve diventare la mappa mentale primaria, non una quarta sotto-vista nascosta.

### 5.5 Skill detail e video

Stato attuale:

- badge disciplina/categoria/grado/mode/status
- titolo, video lazy, alert partner, nota maestro, add/remove piano

Punti buoni:

- buona gerarchia base
- player lazy coerente con performance
- nota maestro separata

Problemi:

- badge numerosi prima del titolo creano rumore
- azione piano in fondo puo' essere lontana
- non mostra storico personale per quella skill
- placeholder video usa emoji/categoria invece di thumbnail coerente

Ridisegno:

- titolo prima, metadati sotto in una riga compatta
- CTA piano sticky bottom o subito sotto video
- aggiungere "Ultime pratiche" e note personali quando D6 entra
- placeholder video con frame/thumbnail reale o immagine coerente, non emoji
- controlli futuri: loop segmento, velocita', "ripeti da capo" se YouTube basta

### 5.6 Piano esame

Stato attuale:

- card con select Shaolin/T'ai Chi
- mostra tutti gli esami disponibili
- submit "Attiva programma esame"

Problemi:

- non filtra al prossimo grado come previsto da sprint UX
- non spiega che rigenera il piano e cosa succede agli item manuali
- native select piccole
- nessuna anteprima count skill

Ridisegno:

- card per disciplina
- opzione consigliata: prossimo esame
- anteprima: `Questo aggiunge N forme al piano`
- dialog di conferma: cosa cambia, cosa resta
- usare shadcn Select o radio-card quando opzioni poche

### 5.7 Selezione libera

Stato attuale:

- lista checkbox raggruppata per categoria
- sticky save
- nessun counter live
- nessun quick select per grado
- nessun filtro/search

Problema:

Con 137 skill, una lista checkbox statica e' faticosa. Non e' una buona UI per scegliere "ripasso 5 Chi" o "tutte le forme del grado precedente".

Ridisegno minimo:

- chips per grado: `7 Chi (3)`, `6 Chi (5)`, ecc.
- counter sticky: `8 selezionate`
- salva disabilitato se 0
- righe grandi 48px con checkbox custom
- stato partial/selected sui chip
- filtro categoria e ricerca solo se necessario

Ridisegno ideale:

```text
Selezione libera
[Shaolin] [T'ai Chi]

Gradi
[7 Chi 3] [6 Chi 5] [5 Chi 8]

Forme
[x] Lien Pu Ch'uan 1 Lu
[ ] Shaolin 1 Lu

8 selezionate                [Salva piano]
```

### 5.8 Progressi

Stato attuale:

- calendario recente
- exam progress
- curriculum map
- radar competenze
- timeline gradi
- reflection settimanale se richiesta

Punti buoni:

- sezione piu' ricca dell'app
- copertura curriculum e timeline sono pertinenti al dominio

Problemi:

- molte visualizzazioni dense senza una risposta sintetica
- radar con label lunghe rischia leggibilita' bassa
- calendario a quadratini usa solo `title`, poco accessibile
- se due discipline attive, toggle diverso dagli altri

Ridisegno:

- top summary: `Streak`, `giorni mese`, `% esame`, `forme nel piano`
- toggle disciplina con stesso segmented control globale
- curriculum map con legenda esplicita
- radar opzionale o sotto fold; non deve essere il primo elemento cognitivo
- reflection come card dismissible, non blocco permanente

### 5.9 Profilo

Stato attuale:

- gradi, editor gradi
- esame in preparazione
- piano di pratica
- pratica ultimi 30 giorni
- logout

Problema:

Profilo mescola identita', piano, gradi e impostazioni operative. Alcune azioni hanno conseguenze forti ma non sono spiegate.

Ridisegno:

- profilo come impostazioni secondarie
- card "Piano di pratica" linka a `/plan/exam` o `/plan/custom`, ma il piano e' modificabile anche da `Oggi`
- cambiare grado richiede warning: puo' cambiare contenuti accessibili e piano
- sostituire `window.confirm` con dialog coerente

### 5.10 Bacheca

Stato attuale:

- `/news` esiste solo come placeholder
- non e' nella bottom nav
- nessun banner in Today

Raccomandazione:

Per Scenario A:

- aggiungere banner contestuale in Today se news non lette
- pagina News con pinned/eventi/comunicazioni

Per Scenario B:

- promuovere Bacheca a tab solo se usata davvero
- altrimenti resta accesso contestuale

---

## 6. Design system da consolidare

### Componenti mancanti

Creare componenti UX comuni prima di rifare le schermate:

- `SegmentedControl`: disciplina, progress discipline, mode switch
- `SubTabs`: sotto-navigazione Programma
- `FormSelect` / `NativeSelect` stilizzato 48px
- `SelectableRow`: checkbox/radio row grande
- `ConfirmDialog`: sostituisce `window.confirm`
- `PageHeader`: titolo, sottotitolo, azione contestuale
- `StickyActionBar`: salva selezione, counter, safe-area bottom
- `MetricStrip`: summary Today/Progress

### Regole visive

- ridurre pill/rounded e usare radius 4-8px coerente
- oro solo per azioni primarie, stato attivo e focus reale
- verde/amber solo come semantic status, non decorazione
- evitare emoji; usare icone coerenti
- caricare font reali o semplificare tipografia
- mantenere dark/gold, ma introdurre gerarchia con spaziatura e immagini reali, non solo bordi/card

### Accessibilita'

Checklist minima:

- `aria-current="page"` su bottom nav e tab attive
- label esplicite per calendar/curriculum cells, non solo `title`
- zoom browser abilitato
- touch target 48px
- focus state visibile su tutti i link/card tappabili
- contrasto verificato per `muted-foreground`
- safe area per iPhone/Android standalone PWA

---

## 7. Roadmap UX consigliata

### Fase UX-0 - Correzioni immediate

Effort: 0.5-1 giorno

Acceptance:

- stringhe mojibake corrette
- zoom riabilitato
- bottoni/select principali >= 44/48px
- font reali o CSS corretto
- emoji sostituite nei punti critici
- `aria-current` su nav/tabs

### Fase UX-1 - Navigazione e lessico

Effort: 1-2 giorni

Acceptance:

- "Libreria" rinominata o riposizionata come "Programma"
- route `/plan/*` discoverable da Today e Programma
- pattern unico per discipline/tabs
- Bacheca ha decisione chiara: banner contestuale ora, tab dopo
- glossario UX deciso: forme/tecniche/programma/piano

### Fase UX-2 - Moduli e selezione piano

Effort: 2-3 giorni

Acceptance:

- Onboarding a step con anteprima piano
- Piano esame con preview e conferma
- Selezione libera con grade chips, counter, sticky action bar
- nessun `window.confirm`
- nessun controllo nativo piccolo

### Fase UX-3 - Pratica quotidiana

Effort: 2-4 giorni

Acceptance:

- Today mostra summary e CTA "Inizia sessione"
- queue compatta + card espansa
- "Fatto" con undo e nota opzionale
- week progress piu' utile di semplice count giorni
- data locale corretta per Europe/Rome o timezone utente

### Fase UX-4 - Landing

Effort: 1-2 giorni per prima versione statica

Acceptance:

- `/` pubblica se non loggato, redirect a `/today` se loggato
- hero con immagine reale/generata, non gradient
- sezioni: features, how it works, screenshot/prodotto
- CTA login
- nessun form raccolta dati senza legal

### Fase UX-5 - Walkthrough reale

Effort: 1 giorno

Acceptance:

- test su telefono: login, onboarding, pratica, modifica piano, progresso
- 5 task cronometrati senza aiuto
- lista frizioni concrete aggiornata
- screenshot mobile/desktop salvati come riferimento per iterazioni

---

## 8. Decisioni da prendere

| ID | Decisione | Raccomandazione |
|---|---|---|
| UX-D1 | Landing subito o solo pre-vendita? | Solo se l'app deve essere mostrata fuori dal founder; altrimenti preparare design ma non bloccare Scenario A |
| UX-D2 | Bottom nav 4 o 5 tab? | 4 tab ora; 5 solo quando Bacheca ha contenuti reali |
| UX-D3 | "Libreria" resta nome pubblico? | Rinominare in "Programma" |
| UX-D4 | Piano come tab primaria? | No per ora; renderlo CTA persistente e contestuale |
| UX-D5 | Session mode in Today? | Si', e' il salto UX piu' importante per uso quotidiano |
| UX-D6 | Emoji accettate? | No, sostituire con icone coerenti |
| UX-D7 | Linguaggio "skill" nella UI? | Evitare, usare "forma", "tecnica", "contenuto" secondo contesto |

---

## 9. Sintesi operativa

Il prodotto non va ripensato da zero: il nucleo e' corretto. Va ripensata la gerarchia.

La nuova esperienza dovrebbe essere:

1. **Landing/Login:** capisco subito cos'e' il quaderno tecnico digitale.
2. **Onboarding:** scelgo disciplina, grado e obiettivo senza ambiguita'.
3. **Oggi:** entro e vedo una sessione guidata, non una lista di card.
4. **Programma:** vedo il percorso FESK e posso capire/modificare cosa entra nel piano.
5. **Progressi:** capisco se sto avanzando verso l'esame.
6. **Profilo:** gestisco impostazioni, non le decisioni centrali nascoste.

La prima tranche da fare non e' estetica: encoding, accessibilita', touch target, lessico, navigazione e form. Dopo questi interventi, il design dark/gold puo' diventare autorevole invece che solo tematico.
