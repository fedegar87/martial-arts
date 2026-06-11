# Validation Lab Workbook - Skill Practice

**Status:** Living  
**Creato:** 2026-06-04  
**Owner:** founder  
**Uso:** documento operativo per seguire il validation lab, raccogliere evidenze e decidere i prossimi passi per l'app.

---

> **Questo documento vs `business-model-canvas.md`.** Questo workbook e' l'**esecuzione** del validation
> lab: ipotesi vive (§2.4, H1-H10 = fonte unica), script intervista, evidence log, esperimenti e
> scorecard di decisione. Il **business-model-canvas.md** descrive il **modello e il metodo** (i 9
> blocchi del canvas, le quattro lenti, i template Strategyzer Test/Learning Card, Evidence Ladder).
> Regola pratica: ipotesi e dati si aggiornano qui; quando un'evidenza cambia il modello di business,
> si riporta la conseguenza nei blocchi del canvas. La §13 della appendice qui sotto e' bozza non
> validata; non confonderla con le sezioni operative 1-12.
> Le singole attivita del lab, quando diventano troppo estese per il workbook, vivono in
> `validation-lab/`.

---

## 0. Come Usare Questo Documento

Questo workbook serve a non disperdere insight durante il corso. Ogni sezione corrisponde a una fase del lab:

| Fase lab | Obiettivo | Output atteso |
|---|---|---|
| 1. Onboarding | chiarire obiettivi, metodo, primo modello e ipotesi | modello iniziale + lista ipotesi critiche |
| 2. Where to play | scegliere mercato, early adopter e Jobs To Be Done | segmento target prioritario + JTBD |
| 3. Indagine | osservare clienti, proposta di valore, impianto ricerca | script interviste + note + insight |
| 4. Follow-up | convergere e decidere i prossimi passi | decisione go/no-go/pivot + piano esperimenti |

Regola pratica: ogni affermazione importante deve finire in una di queste tre categorie:

| Categoria | Significato | Esempio |
|---|---|---|
| Fatto osservato | detto, visto o misurato direttamente | "3 allievi su 5 hanno chiesto il video prima dell'esame" |
| Inferenza | interpretazione ragionevole ma non dimostrata | "il bisogno aumenta vicino agli esami" |
| Ipotesi | cosa crediamo ma dobbiamo ancora testare | "i maestri pagherebbero una quota annuale" |

---

## 1. Snapshot Dell'Idea

### 1.1 Problema in una riga

Chi impara un'abilita' pratica (caso scuole arti marziali) ha difficolta' a ritrovare, organizzare e applicare cio' che ha imparato, soprattutto quando deve esercitarsi da solo fuori dal contesto della lezione.

### 1.2 Performance del modello di business - 7 domande

Fonte lab: 7 domande per valutare il Business Model Design, con punteggio da 0 a 10. Questa e' una prima autovalutazione del modello ipotizzato per Skill Practice, non una validazione.

| # | Area | Domanda | 0 significa | 10 significa |
|---|---|---|---|---|
| 1 | Costi di transizione | E' facile o difficile per i miei clienti passare a un concorrente? | Niente impedisce ai miei clienti di andarsene. | I miei clienti sono legati per molti anni. |
| 2 | Ricavi ricorrenti | Sto generando ricavi ricorrenti? | Il 100% delle mie vendite e' transazionale. | Il 100% delle mie vendite porta automaticamente a ricavi ricorrenti. |
| 3 | Guadagnare prima di spendere | Sto guadagnando prima di iniziare a spendere? | Sostengo il 100% dei miei costi di beni e servizi prima di ottenere ricavi. | Ottengo il 100% dei miei ricavi prima di sostenere i costi dei beni e servizi venduti. |
| 4 | Struttura dei costi | La mia struttura mi consente di sostenere costi inferiori rispetto ai miei concorrenti? | La mia struttura di costi e' superiore di almeno il 30% rispetto ai concorrenti. | La mia struttura di costi e' inferiore di almeno il 30% rispetto ai concorrenti. |
| 5 | Altri fanno il lavoro per te | Quanto i clienti o terze parti del mio modello di business forniscono gratuitamente cio' che serve per farlo funzionare? | Sostengo i costi per tutto il valore creato nel mio modello di business. | Tutto il valore creato nel mio modello di business e' creato gratuitamente da esterni. |
| 6 | Scalabilita' | Quanto rapidamente e quanto velocemente il mio modello di business puo' crescere senza incorrere in blocchi, come infrastruttura, customer support, ecc.? | Far crescere il mio modello di business richiede risorse e impegno sostanziali. | Il mio modello di business non ha praticamente limiti alla crescita. |
| 7 | Protezione dai competitor | Quanto il mio modello di business e' difficile da replicare? | Il mio modello non ha vantaggi e sono esposto alla concorrenza. | Il mio modello mi da' vantaggi sostanziali che e' difficile battere. |

#### Assunzione concreta per questa valutazione

Cliente = scuola/federazione, non singolo allievo. Il prodotto non e' una app generica di allenamento: e' un database tailor-made del curriculum tecnico della scuola/federazione, con video, programmi esame, livelli, piani di pratica, storico e routine d'uso degli allievi.

#### Competitor e alternative rilevanti

| Categoria | Esempi | Quanto sono sostituti reali? |
|---|---|---|
| Gestionali martial arts con contenuti | budoo.one, Zen Planner | Parziali. Sono admin-first: CRM, pagamenti, classi, comunicazioni. Possono avere campus/curriculum, ma non sono costruiti intorno al curriculum specifico FESK e alla pratica quotidiana tailor-made. |
| App stile-specifiche B2C | dojoHUB per Kyokushin, Wuji per Wing Chun | Parziali. Offrono contenuti e training per uno stile, ma non sono il database della scuola/federazione dell'utente e non usano i video/curriculum proprietari della sua scuola. |
| Stack artigianale | quaderno tecnico, WhatsApp, YouTube unlisted, Drive | Competitor piu' forte. E' gia' in uso, costa zero, ma non crea database, storico, proposta di pratica e vista ordinata per livello/esame. |

#### Prima risposta per Skill Practice

| # | Area | Punteggio bozza | Perche' questo numero | Cosa aumenterebbe il punteggio | Cosa validare |
|---|---:|---:|---|---|---|
| 1 | Costi di transizione | 7/10 | Per una scuola/federazione che adotta davvero l'app, passare a un concorrente non e' banale: bisognerebbe ricostruire curriculum, video associati, livelli, programmi esame, utenti, storico pratica, routine e materiali. Inoltre non esiste un concorrente equivalente gia' pronto sul caso FESK: budoo/Zen Planner sono gestionali, dojoHUB/Wuji sono app B2C di stile, WhatsApp/quaderno sono workaround. Non e' 10 perche' prima dell'adozione piena si puo' sempre tornare allo stack artigianale. | app come fonte ufficiale del curriculum, video autorizzati, storico progressi usato da allievi/maestri, integrazione nel processo esami, accordo federale | se il cliente percepisce la perdita del database/curriculum come costo reale o se vede tutto come semplice raccolta di link |
| 2 | Ricavi ricorrenti | 4/10 | Oggi non sto generando ricavi e il modello non e' ancora chiaro. Potrebbe diventare ricorrente con un abbonamento annuale per scuola/federazione e, forse, fee per funzionalita' premium agli allievi. Pero' al momento sono ipotesi, non ricavi attivi ne' rinnovi validati. | abbonamento annuale scuola/federazione, rinnovo legato all'anno sportivo, eventuale premium allievi solo se richiesto davvero, contratto pluriennale | se scuola/federazione accetta una quota periodica e se gli allievi pagherebbero premium senza complicare troppo il modello |
| 3 | Guadagnare prima di spendere | 8/10 | Sto costruendo con Supabase e Vercel su piani gratuiti, quindi le spese vive oggi sono quasi zero. Non sto ancora guadagnando prima di spendere in senso pieno, perche' sto investendo tempo personale nello sviluppo, nella curation e nella validazione prima di avere ricavi. | mantenere costi cash a zero, ottenere pagamento annuale anticipato dopo pilota, fee di setup, commitment scritto prima di nuove feature costose | se il buyer e' disposto a pagare prima di un rollout completo e quanto tempo founder resta necessario |
| 4 | Struttura dei costi | 8/10 | Si', il ragionamento e' simile al punto precedente: usando Supabase/Vercel gratuiti, YouTube unlisted e una PWA, le spese vive sono quasi zero. Rispetto a gestionali come budoo/Zen Planner la struttura e' molto piu' leggera perche' non gestisco billing, CRM, scheduling, POS, app store o video hosting proprietario. Non e' 10 perche' restano costi nascosti: tempo founder, supporto, curation contenuti, privacy/legal e onboarding. | restare pedagogia-only, evitare upload video pesante, evitare pagamenti in-app, automatizzare onboarding, mantenere supporto sostenibile | costo reale di supporto, manutenzione contenuti, privacy/legal e onboarding utenti |
| 5 | Altri fanno il lavoro per te | 7/10 | Si', una parte essenziale del valore deve arrivare dal cliente: scuola/federazione devono fornire i video della loro scuola e il curriculum/programmi esame. Non e' creazione contenuti in stile social, ma senza i video del proprio maestro/scuola l'app diventa molto meno appetibile per gli allievi. YouTube gestisce l'hosting e gli allievi generano storico pratica. Non e' 10 perche' il founder oggi cura ancora struttura, modello dati, UX e organizzazione. | video forniti e aggiornati dalla scuola, curriculum validato dalla federazione, champion locali che fanno onboarding, utenti che alimentano log e note | se scuole/federazione sono davvero disposte a fornire video e mantenerli aggiornati |
| 6 | Scalabilita' | 4/10 | La scalabilita' e' ridotta perche' il valore nasce proprio da un certo grado di personalizzazione: curriculum, livelli, programmi esame, video della scuola/federazione e onboarding. Il software puo' servire molti allievi dentro la stessa scuola/federazione, ma scalare a molte scuole richiede definire bene il modello di servizio e quanto lavoro tailor-made resta a carico del founder. | pacchetti di servizio chiari, template per curriculum, processo onboarding ripetibile, ruoli admin scuola/federazione, limiti espliciti alla personalizzazione | quanto lavoro manuale serve per attivare una nuova scuola/federazione e quanto puo' essere standardizzato |
| 7 | Protezione dai competitor | 6/10 | La protezione non viene dal codice, che e' copiabile, ma dal fatto che il modello e' poco generico: curriculum specifico, video della scuola/federazione, relazione di fiducia, conoscenza del dominio e possibile ruolo di riferimento ufficiale. La ridotta scalabilita' puo' diventare un vantaggio competitivo perche' scoraggia competitor generici: per replicare davvero il valore dovrebbero fare lavoro tailor-made, ottenere contenuti e costruire fiducia con ogni scuola/federazione. Non e' 8-10 perche' oggi non c'e' ancora un accordo ufficiale o esclusiva. | accordo ufficiale, contenuti/video autorizzati o esclusivi, adozione da piu' scuole affiliate, storico dati, posizionamento come quaderno tecnico digitale federale | se la barriera e' davvero relazione/curriculum ufficiale o se il cliente accetterebbe una alternativa generica |

Sintesi provvisoria: il modello e' piu' forte di quanto sembrava se viene valutato come servizio tailor-made per scuola/federazione, non come app generica. La forza sta in database curriculum + contenuti ufficiali + relazione + routine d'uso. Il rischio principale non e' il competitor diretto gia' pronto, ma che il cliente percepisca il prodotto come "solo una raccolta ordinata di link" e quindi torni facilmente a quaderno/WhatsApp.

### 1.3 One-liner soluzione

Skill Practice e' una PWA per la pratica guidata di arti marziali tradizionali: organizza il curriculum tecnico della scuola/federazione, mostra video di riferimento e propone all'allievo cosa praticare oggi.

### 1.4 Descrizione attuale

| Campo | Stato attuale |
|---|---|
| Prodotto | quaderno tecnico digitale + pratica guidata |
| Dominio iniziale | arti marziali tradizionali, curriculum FESK Shaolin + T'ai Chi |
| Utente finale | allievo/praticante |
| Buyer ipotizzato | federazione o singola scuola |
| Champion ipotizzato | maestro, direttore tecnico o praticante senior |
| Modello attuale | MVP personale single-user, predisposto multi-utente |
| Canale iniziale | relazione diretta con federazione/scuole |
| Pricing ipotizzato | quota annuale federazione post-pilota |
| Alternativa principale | quaderno stampato + WhatsApp + YouTube/Drive |

### 1.5 Cosa fa

- Mostra curriculum tecnico organizzato per livello, disciplina e programma esame.
- Usa video YouTube unlisted come riferimento tecnico.
- Propone una pratica giornaliera con focus e mantenimento.
- Tiene traccia di pratica completata, note personali e progressi.
- Supporta calendario, profilo, promemoria push e preparazione esame.

### 1.6 Cosa non fa

- Non e' un gestionale per palestre.
- Non gestisce pagamenti, presenze, CRM, prenotazioni o tesseramenti.
- Non e' un marketplace di corsi.
- Non sostituisce il maestro.
- Non monetizza contenuti tecnici della federazione verso i singoli allievi.

### 1.7 Tesi da validare

> Gli allievi di arti marziali tradizionali, soprattutto intermedi e in preparazione esame, hanno attrito nel praticare a casa perche' non sanno con precisione cosa fare, in che ordine e con quale riferimento visivo. Una app leggera con video della propria scuola/federazione e proposta "oggi fai questo" riduce l'attrito, aiuta la preparazione esami e puo' diventare un servizio digitale sostenuto dalla federazione o dalle scuole.

---

## 2. Onboarding - Modello Iniziale E Ipotesi

### 2.1 Obiettivo personale del validation lab

Compilare durante il corso:

- Obiettivo principale:
- Cosa voglio capire entro la fine del lab:
- Cosa sarebbe una buona decisione finale:
- Cosa devo evitare di auto-convincermi:

### 2.2 Autovalutazione validazione iniziale

**Punteggio:** 2/5

**Motivo:** bisogno visto di persona, con palestre di arti marziali che preparano quaderni tecnici per il ripasso a casa degli allievi.

### 2.3 Modello iniziale

| Blocco | Ipotesi corrente | Evidenza attuale | Rischio |
|---|---|---|---|
| Problema | l'allievo non sa cosa praticare tra una lezione e l'altra | ricerca desk + esperienza founder | potrebbe essere un problema poco doloroso |
| Cliente utente | allievi intermedi, allievi in preparazione esame | plausibile | potrebbero non aprire l'app con costanza |
| Cliente pagante | federazione o scuola | strategia definita, non validata | buyer lento o non interessato |
| Soluzione | app con curriculum, video, pratica giornaliera e log | MVP esistente | potrebbe essere troppo prodotto rispetto al bisogno |
| Alternativa | WhatsApp, YouTube, quaderno, memoria | osservabile | alternative abbastanza buone |
| Trigger | esame vicino, assenza, confusione su forme vecchie | ipotesi forte | trigger non abbastanza frequente |
| Canale | pilota con 2-3 scuole o gruppo ristretto | fattibile | accesso politico/relazionale |
| Monetizzazione | quota annuale federazione post-pilota | piano monetizzazione | willingness to pay non verificata |

### 2.4 Ipotesi critiche da ordinare

Assegnare priorita' 1-5. Le ipotesi con alto rischio e poca evidenza vanno testate per prime.
Scala: 1 = da testare subito nella Sessione 3; 5 = da testare solo dopo evidenze di problema, champion e uso.

| # | Ipotesi | Tipo | Rischio | Evidenza oggi | Priorita' |
|---|---|---|---|---|---|
| H1 | Gli allievi intermedi riconoscono il problema "non so cosa praticare oggi" | problema | alto | esperienza + desk | 1 |
| H2 | Il momento esame rende il bisogno urgente | problema | medio | plausibile | 2 |
| H3 | I maestri vogliono ridurre domande ripetitive e impreparazione | problema/buyer | alto | desk + esperienza | 1 |
| H4 | Gli allievi userebbero una proposta giornaliera almeno 2-3 volte a settimana | comportamento | alto | non verificata | 3 |
| H5 | Il video della propria scuola/federazione conta piu' di un video generico | valore | medio | plausibile | 2 |
| H6 | Il maestro accetta che l'app supporti la pratica senza sostituire la lezione | adozione | alto | non verificata | 1 |
| H7 | La federazione vede valore nella standardizzazione del curriculum | buyer | alto | non verificata | 4 |
| H8 | La federazione o 2-3 scuole accetterebbero un pilota di 90 giorni | canale | medio | non verificata | 2 |
| H9 | Dopo il pilota, una quota annuale 1.200-2.400 EUR e' sostenibile | monetizzazione | alto | non verificata | 5 |
| H10 | Il setup contenuti non diventa il vero collo di bottiglia | operativa | alto | parzialmente mitigata da curriculum esistente | 2 |

### 2.5 Criteri di apprendimento del lab

| Domanda | Perche' conta | Come la verifico |
|---|---|---|
| Il problema e' sentito o solo elegante? | evita founder bias | interviste + test comportamento |
| Chi soffre di piu': allievo, maestro o federazione? | definisce target | confronto segmenti |
| Il trigger e' esame, pratica quotidiana o recupero assenze? | definisce value proposition | interviste su episodi recenti |
| Il buyer reale e' federazione o singola scuola? | definisce go-to-market | interviste buyer/champion |
| La soluzione deve essere app, WhatsApp potenziato o libreria? | evita overbuilding | esperimenti a bassa tecnologia |
| Che prova serve per chiedere soldi? | definisce milestone | pilota con metriche |

---

## 3. Where To Play - Segmenti, Early Adopter, JTBD

### 3.1 Segmenti candidati

| Segmento | Pain probabile | Accesso | Budget | Fit prodotto | Rischio |
|---|---:|---:|---:|---:|---|
| Allievi FESK intermedi adulti | alto | alto | basso | alto | non pagano direttamente |
| Allievi FESK in preparazione esame | alto | alto | basso | molto alto | uso episodico |
| Maestri FESK | medio/alto | medio | medio | alto | tempo/setup |
| Direttivo/federazione FESK | medio | medio | medio | alto | decisione lenta |
| Genitori di giovani allievi | medio | basso | basso/medio | medio | app potrebbe non essere prioritaria |
| Scuole non-FESK Chang | medio | basso | medio | medio/alto | accesso e politica |
| Scuole MA generiche | incerto | basso | medio | basso/medio | curriculum non pronto |

### 3.2 Segmento early adopter scelto

Scelta consolidata dopo Sessione 2 / lavoro Miro:

- Segmento: scuola strutturata ma ancora analogica/frammentata, con curriculum gia formalizzato, esami regolari e materiali/video gia esistenti ma dispersi.
- Perche' questo segmento ora: ha abbastanza struttura per capire subito il valore, ma abbastanza frizione manuale da sentire il problema; il setup e' piu leggero rispetto a scuole destrutturate e la vendita e' meno lenta rispetto alla federazione intera.
- Criteri per riconoscerlo: programma scritto o stabile, passaggi di grado/esami, uso di PDF/quaderni/WhatsApp/Drive/YouTube unlisted, domande ricorrenti degli allievi, maestro disposto a coinvolgere un piccolo gruppo.
- Dove trovarlo: scuola del founder, maestri FESK gia ben disposti, scuole con gruppi pre-esame, istruttori che gia condividono materiali tecnici via chat o link.
- Chi decide: maestro responsabile o direttore scuola per un test; federazione/direttivo solo per estensione e quota.
- Chi influenza: istruttori, praticanti senior, referente tecnico, proprietari/autori dei video.
- Primo contatto utile: maestro sponsor con 5-15 allievi intermedi o pre-esame disponibili per interviste/test.

Documento di attivita collegato: `validation-lab/2026-06-10-session-2-where-to-play.md`.

### 3.3 Early adopter profile

Un buon early adopter dovrebbe avere almeno 5 di questi segnali:

- Ha un programma tecnico scritto o stabilizzato.
- Ha esami/passaggi di grado regolari.
- Ha materiali gia esistenti: quaderni, PDF, dispense, video, link YouTube/Drive.
- Usa gia WhatsApp o chat per distribuire materiali tecnici.
- Ha un esame vicino o un gruppo che prepara esami.
- Ha gia' chiesto o condiviso video tecnici via WhatsApp/YouTube/Drive.
- E' infastidito da domande ripetitive su "cosa devo ripassare?".
- Ha allievi intermedi che confondono forme/tecniche vecchie.
- E' aperto a strumenti digitali ma non vuole un gestionale complesso.
- Ha accesso a video tecnici o e' disposto a registrarne pochi.
- Puo' coinvolgere 5-15 allievi per un test.
- Puo' dare feedback onesto e rapido.

Non e' un buon early adopter iniziale se:

- non ha curriculum o programma abbastanza stabile;
- non ha un maestro/champion disposto a spingere il test;
- vuole subito CRM, billing, presenze o funzioni gestionali;
- richiede white label, revenue sharing o monetizzazione allievi prima di validare il bisogno;
- non puo chiarire l'uso dei video/materiali tecnici.

### 3.4 Jobs To Be Done da validare

| Persona | JTBD | Segnale che e' reale | Domanda di verifica |
|---|---|---|---|
| Allievo intermedio | quando ho 20 minuti a casa, voglio sapere esattamente cosa praticare per non perdere tempo e non praticare male | chiede video, appunti, lista cose da fare | "Raccontami l'ultima volta che hai provato a praticare a casa: cosa hai fatto concretamente?" |
| Allievo pre-esame | quando ho l'esame vicino, voglio una checklist chiara con video di riferimento per capire se sono pronto | ansia, messaggi al maestro, ricerca su YouTube | "Nelle due settimane prima dell'ultimo esame, come ti sei organizzato?" |
| Maestro | quando gli allievi arrivano impreparati, voglio dare riferimenti chiari senza ripetere sempre via messaggio | manda contenuti, corregge gli stessi errori | "Cosa succede oggi quando un allievo non ricorda una forma?" |
| Federazione | quando voglio standardizzare la qualita' tecnica, voglio un riferimento comune per scuole e allievi | programmi, dispense, video ufficiali | "Qual e' oggi il modo ufficiale per assicurare coerenza tra scuole?" |
| Genitore | quando mio figlio deve preparare un esame, voglio aiutarlo anche se non conosco la disciplina | chiede al maestro, cerca materiali | "Come capisci cosa deve ripassare tuo figlio?" |

### 3.5 Alternative attuali

| Alternativa | Quando funziona | Dove fallisce | Cosa chiedere |
|---|---|---|---|
| Memoria | allievo molto motivato, poche tecniche | dimenticanza, confusione | "Cosa ti ricordi dopo 3 giorni dalla lezione?" |
| Quaderno stampato/PDF | lista programma stabile | niente video, niente priorita' oggi | "Quando lo consulti davvero?" |
| WhatsApp | veloce, familiare | contenuti persi nello scroll | "Quante volte cerchi vecchi messaggi tecnici?" |
| YouTube generico | facile da trovare | versioni diverse dalla scuola | "Ti e' mai capitato di trovare una versione diversa?" |
| YouTube unlisted/Drive | video della scuola | organizzazione debole | "Come ritrovi il link giusto?" |
| Maestro in lezione | qualita' massima | dipende da presenza fisica | "Cosa fai se salti due lezioni?" |

---

## 4. Indagine - Piano Ricerca

### 4.1 Obiettivo dell'indagine

Non vendere l'app. Capire:

- quale problema reale esiste;
- chi lo vive piu' spesso;
- quali workaround usa oggi;
- quanto costa il problema in tempo, frustrazione, preparazione o dropout;
- quale trigger rende il problema urgente;
- quale soluzione minima verrebbe provata.

### 4.2 Campione minimo consigliato

| Target | Numero minimo | Perche' |
|---|---:|---|
| Allievi intermedi FESK | 5 | validare uso e pain utente finale |
| Allievi pre-esame | 3 | validare trigger forte |
| Maestri / istruttori | 3 | validare problema didattico e setup |
| Persona federazione/direttivo | 1-2 | validare buyer e standardizzazione |
| Genitori | 2 | opzionale, se target junior diventa rilevante |

### 4.3 Regole anti-bias

- Chiedere episodi recenti, non opinioni generiche.
- Non mostrare subito l'app se l'obiettivo e' capire il problema.
- Non chiedere "useresti questa app?", chiedere "cosa hai fatto l'ultima volta?".
- Non spiegare troppo la soluzione prima di ascoltare il workflow attuale.
- Annotare parole esatte dell'intervistato quando indicano pain.
- Distinguere entusiasmo educato da comportamento osservabile.
- Chiudere sempre con: "cosa faresti gia' domani senza aspettare una nuova app?"

### 4.4 Script intervista - Allievo

Durata: 20-30 minuti.

1. Da quanto pratichi e che livello stai preparando?
2. Quante volte a settimana vai a lezione?
3. Nell'ultimo mese hai praticato a casa? Raccontami l'ultima volta concreta.
4. Come hai deciso cosa praticare?
5. Hai usato video, appunti, messaggi o YouTube? Quali?
6. Cosa ti ha rallentato o bloccato?
7. Ti capita di confondere forme/tecniche vecchie con quelle nuove?
8. Prima di un esame, come organizzi il ripasso?
9. Hai mai scritto al maestro per chiedere cosa ripassare o un video?
10. Se domani ricevessi un piano di pratica di 15 minuti, quante volte realisticamente lo seguiresti in una settimana?
11. Cosa ti farebbe smettere di usarlo dopo i primi giorni?
12. Quale sarebbe il formato piu' naturale: WhatsApp, app, PDF, video playlist, calendario?

Frasi da catturare:

- "Non so cosa fare"
- "Cerco su YouTube"
- "Chiedo al maestro"
- "Mi dimentico"
- "Prima dell'esame..."
- "Mi basterebbe..."

### 4.5 Script intervista - Maestro / Istruttore

Durata: 30 minuti.

1. Quanti allievi segui e con quali livelli?
2. Cosa assegni oggi come pratica tra una lezione e l'altra?
3. Come comunichi cosa devono ripassare?
4. Raccontami l'ultima volta in cui un allievo e' arrivato impreparato o confuso.
5. Quanto tempo perdi a ripetere istruzioni gia' date?
6. Quali domande tecniche ricevi piu' spesso fuori lezione?
7. Hai mai mandato video o link via WhatsApp? Con che frequenza?
8. Cosa succede nelle settimane prima degli esami?
9. Che materiali ufficiali o non ufficiali usate oggi?
10. Se avessi una soluzione, quanto tempo massimo potresti dedicare al setup iniziale?
11. Chi dovrebbe gestire contenuti e curriculum: maestro, scuola o federazione?
12. Che cosa ti farebbe dire "questa cosa non la voglio nella mia scuola"?
13. Quale prova ti convincerebbe a proporla agli allievi?

### 4.6 Script intervista - Federazione / Direttivo

Durata: 30-45 minuti.

1. Oggi come viene garantita la coerenza tecnica tra scuole?
2. Quali materiali ufficiali esistono per curriculum, programmi e video?
3. Quali problemi emergono piu' spesso nella preparazione esami?
4. Ci sono differenze rilevanti tra scuole nella preparazione degli allievi?
5. Che valore avrebbe offrire uno strumento digitale comune agli affiliati?
6. Chi dovrebbe approvare un pilota?
7. Quali obiezioni prevedi da parte dei maestri?
8. Quali vincoli esistono su contenuti video, diritti, privacy e uso del nome federazione?
9. Che risultati servirebbero dopo 90 giorni per considerarlo utile?
10. Come verrebbe valutata una quota annuale per mantenere il servizio?

### 4.7 Script intervista - Genitore

Durata: 15-20 minuti.

1. Tuo figlio/a pratica a casa tra le lezioni?
2. Prima di un esame, come capite cosa ripassare?
3. Ti capita di cercare materiali, video o messaggi del maestro?
4. Cosa ti aiuterebbe ad accompagnare la preparazione senza conoscere la disciplina?
5. Che formato useresti davvero con tuo figlio/a?

### 4.8 Scheda singola intervista

Copiala per ogni intervista.

```markdown
## Intervista - [Nome/ruolo] - [Data]

Persona:
- Ruolo:
- Livello / scuola:
- Contesto:

Episodio recente raccontato:

Workflow attuale:

Workaround usati:

Pain emersi:

Trigger:

Frasi esatte:

Reazione a soluzione minima:

Segnali comportamentali:

Contraddizioni / dubbi:

Ipotesi confermate:

Ipotesi smentite:

Follow-up:
```

---

## 5. Simulazioni Con AI

### 5.1 Quando usarle

Le simulazioni servono per preparare domande migliori e stressare assunzioni. Non sostituiscono interviste reali.

### 5.2 Prompt per simulare un allievo

```text
Agisci come un allievo adulto di arti marziali tradizionali, livello intermedio, 2 lezioni a settimana, lavoro full-time, esame tra 6 settimane. Rispondi in modo realistico, non compiacente. Io ti intervistero' per capire come pratichi a casa, quali materiali usi, cosa ti blocca e cosa useresti davvero. Se una domanda e' troppo guidata o biasata, segnalamelo.
```

### 5.3 Prompt per simulare un maestro scettico

```text
Agisci come un maestro di arti marziali tradizionali con 60 allievi, poco tempo, approccio prudente verso strumenti digitali. Hai gia' WhatsApp e video YouTube unlisted. Rispondi in modo concreto e scettico. Io ti intervistero' per capire se una app di pratica guidata puo' aiutare. Non essere gentile per forza: evidenzia lavoro extra, rischi pedagogici e obiezioni.
```

### 5.4 Prompt per estrarre insight da una trascrizione

```text
Analizza questa intervista per un validation lab. Estrai:
1. fatti osservati;
2. pain espliciti;
3. workaround attuali;
4. trigger di urgenza;
5. segnali comportamentali, non opinioni;
6. ipotesi confermate/smentite;
7. citazioni brevi utili;
8. prossima domanda da fare.

Non vendere la soluzione e non trasformare entusiasmo generico in validazione.

Trascrizione:
[incolla qui]
```

---

## 6. Estrazione Insight

### 6.1 Evidence log

| Data | Persona | Fatto osservato | Ipotesi collegata | Forza evidenza | Note |
|---|---|---|---|---|---|
| | | | | bassa/media/alta | |

### 6.2 Pattern board

| Pattern | Chi lo ha detto/fatto | Frequenza | Impatto | Implicazione |
|---|---|---:|---|---|
| Allievi cercano video su YouTube | | | | |
| Maestri mandano link WhatsApp | | | | |
| Problema esplode prima degli esami | | | | |
| Setup video preoccupa i maestri | | | | |
| Federazione vuole standardizzazione | | | | |
| App quotidiana sembra eccessiva | | | | |

### 6.3 Valutazione pain

| Domanda | Risposta sintetica | Evidenza |
|---|---|---|
| Il problema e' frequente? | | |
| Il problema e' doloroso? | | |
| Esiste un workaround stabile? | | |
| Il workaround e' insoddisfacente? | | |
| Il trigger e' chiaro? | | |
| Chi ha piu' motivazione a risolverlo? | | |
| Chi ha potere di pagare o approvare? | | |

### 6.4 Segnali forti vs deboli

| Segnale forte | Segnale debole |
|---|---|
| ha gia' cercato/chiesto video tecnici | "bella idea" |
| ha gia' usato un workaround | "la userei" |
| ha un esame o problema imminente | "potrebbe servire" |
| dedica tempo a un test | "fammi sapere quando e' pronta" |
| coinvolge altri allievi/maestri | entusiasmo senza azione |
| chiede di continuare dopo test | complimenti generici |

### 6.5 Mappa delle ipotesi dopo le interviste

| Ipotesi | Confermata | Smentita | Incerta | Evidenza chiave | Prossimo test |
|---|---:|---:|---:|---|---|
| H1 problema allievi | | | | | |
| H2 trigger esame | | | | | |
| H3 pain maestri | | | | | |
| H4 uso ricorrente | | | | | |
| H5 video proprietario | | | | | |
| H6 accettazione maestro | | | | | |
| H7 valore federazione | | | | | |
| H8 pilota 90 giorni | | | | | |
| H9 quota annuale | | | | | |
| H10 setup sostenibile | | | | | |

---

## 7. Proposta Di Valore

### 7.1 Formulazioni candidate

| Target | Proposta | Rischio |
|---|---|---|
| Allievo | "Sai sempre cosa praticare oggi, con i video della tua scuola." | potrebbe non voler praticare comunque |
| Allievo pre-esame | "Prepari l'esame con checklist, video e piano di ripasso chiaro." | uso solo episodico |
| Maestro | "Meno domande ripetitive e allievi piu' preparati a lezione." | difficile misurare subito |
| Federazione | "Un riferimento tecnico digitale comune per tutte le scuole affiliate." | processo decisionale lento |
| Scuola | "Un'app pedagogica leggera senza sostituire il gestionale." | budget separato limitato |

### 7.2 Proposta scelta dopo il lab

- Target:
- Problema principale:
- Promessa:
- Perche' ora:
- Prova richiesta:
- Cosa non promettere:

### 7.3 Claim vietati finche' non validati

- "Aumenta la retention" senza dati.
- "Gli allievi praticheranno ogni giorno" senza test comportamento.
- "La federazione paghera'" senza conversazione buyer.
- "Nessun competitor fa nulla di simile" senza aggiornare ricerca.
- "Sostituisce il quaderno" se i maestri lo considerano ancora importante.

---

## 8. Esperimenti

### 8.1 Esperimento 1 - Test WhatsApp 14 giorni

Obiettivo: validare il comportamento "seguo una proposta di pratica".

| Elemento | Piano |
|---|---|
| Target | 8-15 allievi intermedi o pre-esame |
| Setup | 5-8 video gia' disponibili + piano 2 settimane |
| Canale | WhatsApp broadcast/gruppo |
| Frequenza | 3-4 messaggi a settimana |
| Call to action | rispondere con check o segnare pratica |
| Durata | 14 giorni |

Metriche:

| Metrica | Soglia positiva | Soglia negativa |
|---|---:|---:|
| Apertura link/video | >= 50% settimana 1 | < 20% |
| Pratica dichiarata | >= 30% per almeno 6 sessioni | < 15% settimana 1 |
| Retention settimana 2 | calo < 30% | calo > 60% |
| Richiesta di continuare | almeno 3 persone | zero |
| Feedback maestro | nota differenza o interesse | "non cambia nulla" |

### 8.2 Esperimento 2 - Interviste pre-esame

Obiettivo: capire se il trigger esame e' il caso d'uso piu' forte.

| Elemento | Piano |
|---|---|
| Target | allievi con esame entro 4-8 settimane |
| Metodo | intervista + osservazione materiali usati |
| Output | checklist dei bisogni in fase esame |
| Decisione | app daily practice vs exam prep first |

### 8.3 Esperimento 3 - Pilota scuola/federazione 90 giorni

Obiettivo: verificare adozione reale e base per monetizzazione.

| Elemento | Piano |
|---|---|
| Target | 2-3 scuole o gruppo federale ristretto |
| Durata | 90 giorni |
| Setup | curriculum/video gia' pronti, inviti controllati |
| Misure | utenti attivi, sessioni completate, uso pre-esame, feedback maestri |
| Output | report per decidere quota annuale o stop |

### 8.4 Esperimento 4 - Buyer conversation

Obiettivo: validare chi paga e con quali condizioni.

Domande chiave:

- Chi dovrebbe approvare un pilota?
- Che budget esiste per un servizio digitale federale?
- Cosa deve dimostrare il pilota per giustificare una quota?
- Quali vincoli legali/politici bloccano l'uso di video e marchio?
- La quota e' federale, per scuola o in-kind?

---

## 9. Follow-Up - Decisione E Prossimi Passi

### 9.1 Scorecard finale

| Area | Verde | Giallo | Rosso | Stato |
|---|---|---|---|---|
| Problema | episodi frequenti e dolorosi | pain episodico | nessun pain chiaro | |
| Utente | target identificato e accessibile | target ampio ma accessibile | target confuso | |
| Comportamento | test mostra uso reale | interesse ma poco uso | nessun uso | |
| Maestro | champion disponibile | curioso ma passivo | contrario | |
| Buyer | buyer identificato | buyer possibile | nessun buyer | |
| Setup | sostenibile < 2h per valore iniziale | sostenibile con supporto | troppo oneroso | |
| Proposta valore | frase chiara e ripetuta dagli utenti | ancora generica | non aggancia | |
| Monetizzazione | percorso quota/pilota chiaro | da negoziare | nessuna disponibilita' | |

### 9.2 Decisione

Scegliere una sola opzione dopo il follow-up:

| Opzione | Quando sceglierla | Decisione |
|---|---|---|
| Persevere | problema e target confermati, prossimo esperimento chiaro | |
| Pivot segmento | problema reale ma target diverso | |
| Pivot use case | esame/libreria funziona piu' di daily practice | |
| Ridurre scope | serve soluzione piu' semplice di app completa | |
| Stop | problema debole o nessun comportamento reale | |

### 9.3 Piano 30 giorni post-lab

| Settimana | Azione | Output |
|---|---|---|
| 1 | completare interviste mancanti | evidence log aggiornato |
| 2 | scegliere segmento + proposta valore | decisione target |
| 3 | eseguire test WhatsApp o pilota mini | dati comportamento |
| 4 | sintetizzare report e decidere roadmap | go/no-go/pivot |

### 9.4 Backlog prodotto derivato dalla validazione

Compilare solo dopo evidenze.

| Insight | Implicazione prodotto | Priorita' | Tipo |
|---|---|---:|---|
| | | | feature/copy/processo |

---

## 10. Domande Aperte

| Domanda | Perche' e' critica | Stato |
|---|---|---|
| Il vero primo use case e' pratica quotidiana o preparazione esame? | cambia schermata principale e messaggio | aperta |
| L'utente principale e' l'allievo o il maestro? | cambia ricerca e UX | aperta |
| Il buyer iniziale e' federazione o singola scuola? | cambia monetizzazione | aperta |
| Serve davvero proposta giornaliera o basta libreria + checklist? | riduce o aumenta scope | aperta |
| Quanto conta il video della propria scuola rispetto a video ufficiali generici? | impatta setup contenuti | aperta |
| La federazione puo' usare nome, video e curriculum in una app gestita dal founder? | vincolo legale/politico | aperta |
| Quale metrica rende credibile una quota annuale? | prepara follow-up economico | aperta |

---

## 11. Glossario Operativo

| Termine | Significato nel lab |
|---|---|
| Early adopter | persona/scuola che sente gia' il problema e accetta un test imperfetto |
| JTBD | situazione concreta in cui una persona "assume" una soluzione per fare progresso |
| Workaround | soluzione artigianale attuale, spesso piu' importante delle opinioni |
| Pain | costo concreto: tempo, ansia, errore, frustrazione, perdita opportunita' |
| Trigger | momento che rende il problema urgente |
| Champion | persona che spinge internamente l'adozione |
| Buyer | persona/ente che puo' approvare o pagare |
| User | persona che usa l'app |
| Kill metric | misura che obbliga a fermarsi o cambiare direzione |

---

## 12. Log Sessioni Lab

### Sessione 1 - Onboarding

Data:

Appunti:

Decisioni:

Azioni:

### Sessione 2 - Where to play

Data: 2026-06-10

Appunti:

- Esercizio di apertura con carte metaforiche (Dixit cards): raccontare "perche' e' importante il tuo progetto" senza dire cosa e', scegliendo una carta con immagine onirica come spunto. Formato ispirato al Golden Circle di Simon Sinek (start with why).
- Attivita' 2: dedurre i segmenti di clientela in modo bottom-up. Catena: funzionalita' principali del prodotto -> casi d'uso per ogni funzionalita' -> soggetti interessati a ogni caso d'uso -> segmenti clientela di primo livello.

Risultato attivita' 2 (funzionalita' -> casi d'uso -> soggetti):

1. Curriculum tecnico organizzato (livelli, discipline, programmi esame)

| Caso d'uso | Soggetti interessati |
|---|---|
| Consultare il programma del proprio livello | allievo (tutti i livelli) |
| Verificare cosa richiede il prossimo esame | allievo pre-esame, genitore |
| Avere un riferimento tecnico unico e ufficiale | maestro, direttore tecnico, federazione |
| Ritrovare forme/tecniche di livelli passati | allievo intermedio/avanzato |

2. Video di riferimento della scuola/federazione

| Caso d'uso | Soggetti interessati |
|---|---|
| Rivedere l'esecuzione corretta di una forma a casa | allievo, genitore (per figli) |
| Evitare versioni "sbagliate" trovate su YouTube | maestro, federazione |
| Distribuire i video senza link sparsi su WhatsApp/Drive | maestro, scuola |

3. Proposta di pratica giornaliera ("oggi fai questo")

| Caso d'uso | Soggetti interessati |
|---|---|
| Praticare 15-20 min senza dover decidere cosa fare | allievo intermedio |
| Non perdere le forme vecchie (mantenimento) | allievo avanzato, maestro |
| Strutturare il ripasso di chi salta lezioni | allievo discontinuo, maestro |

4. Log pratica, note e progressi

| Caso d'uso | Soggetti interessati |
|---|---|
| Vedere quanto/cosa ho praticato | allievo |
| Capire se gli allievi praticano davvero a casa | maestro |
| Dati aggregati sulla preparazione | direttore tecnico, federazione |

5. Calendario e promemoria push

| Caso d'uso | Soggetti interessati |
|---|---|
| Ricordarsi di praticare con costanza | allievo |
| Scandire le settimane pre-esame | allievo pre-esame, maestro |

Segmenti di primo livello emersi: allievi intermedi adulti, allievi pre-esame, maestri/istruttori, scuola/direttore tecnico, federazione, genitori di allievi junior. Soggetti piu' ricorrenti: allievo (utente) e maestro (champion); federazione/scuola ricorre su standardizzazione e dati (coerente con ipotesi buyer).

Nota: la funzionalita' "Preparazione esame (checklist + piano ripasso)" e' stata esclusa dall'esercizio su decisione del founder.

Altre attivita Miro consolidate nel documento di sessione:

- Business Model Canvas: confermato modello B2B2C leggero, con allievi utenti, maestri champion, scuole/federazione buyer potenziali.
- Valutare opportunita: "scuole/federazioni" risulta il macro-segmento piu promettente, ma troppo ampio per essere early adopter operativo.
- Assi di segmentazione: individuati 13 assi; i piu decisivi per l'early adopter sono formalizzazione del sapere, maturita digitale, materiali gia disponibili, esami regolari e presenza di maestro sponsor.
- Persona matrix: utile per descrivere personas, ma non sufficiente da sola per scegliere l'early adopter.
- Selezione matrici: la matrice definitiva scelta e' formalizzazione del sapere x maturita digitale.

Decisioni:

- Separare stakeholder e segmenti: allievo = user, maestro = champion, scuola/federazione = buyer.
- Non usare "scuole/federazioni" come segmento generico di validazione.
- Scegliere come early adopter operativo la scuola strutturata analogica/frammentata: curriculum gia formalizzato, gestione materiali ancora manuale o dispersa.
- Trattare federazione come buyer istituzionale futuro, non come primo blocco da validare senza dati.
- Trattare white label, revenue sharing, premium allievi e scuola come operatore economico come ipotesi future, non come decisioni di questa fase.
- Portare in Sessione 3 le ipotesi H1, H2, H3, H5, H6, H8 e H10, con priorita su pain allievo e maestro sponsor.

Azioni:

- Preparare lista di 5 maestri/scuole candidati con segnali early adopter.
- Preparare lista di 8-10 allievi intermedi o pre-esame da intervistare.
- Eseguire prima interviste problema, poi decidere se test WhatsApp 14 giorni o mini-pilota app.
- Verificare con almeno un referente la disponibilita/uso consentito di video e materiali tecnici.
- Aggiornare `business-model-canvas-draft.md` sostituendo il segmento iniziale generico con "scuola strutturata analogica/frammentata con maestro sponsor".
- Usare `validation-lab/2026-06-10-session-2-where-to-play.md` come documento di dettaglio della Sessione 2.

### Sessione 3 - Indagine

Data:

Appunti:

Decisioni:

Azioni:

### Sessione 4 - Follow-up

Data:

Appunti:

Decisioni:

Azioni:

---

## 13. Appendice - Spunti Da Raffinare (Bozza)

> Stato: BOZZA grezza, raccolta il 2026-06-10 durante la Sessione 2. NON e' validata.
> Mescola visione, feature desiderate e ipotesi di pricing oltre lo scope MVP attuale.
> Serve come bacino di idee da indagare/raffinare piu' avanti, non come piano. Da
> incrociare con `plan/current-plan.md` e con la scorecard "Valutare le opportunita'"
> prima di promuovere qualunque voce.
>
> Consolidamento: gli elementi della Sessione 2 che sono stati promossi a output operativo
> vivono in `validation-lab/2026-06-10-session-2-where-to-play.md` e nelle sezioni
> operative 2.4, 3.2, 3.3 e 12 di questo workbook. Questa appendice resta deliberatamente
> piu ampia e speculativa.

### 13.1 Vision

Una piattaforma digitale che organizza il curriculum tecnico delle arti marziali, fornisce video di riferimento ufficiali e guida il praticante attraverso programmi di allenamento e ripasso personalizzati.

### 13.2 Proposta di valore (tre pilastri)

| Pilastro | Cosa | Benefici |
|---|---|---|
| Curriculum tecnico organizzato | Programma della scuola strutturato per livelli, gradi, argomenti, obiettivi | Visione chiara del percorso; standardizzazione insegnamento; accesso immediato ai contenuti |
| Video di riferimento ufficiali scuola/federazione | Ogni tecnica/forma/kata associata a video validati da istruttori o federazione | Uniformita' tecnica; meno interpretazioni errate; ripasso autonomo affidabile |
| Struttura pratica giornaliera | Programmi e ripasso in sessioni quotidiane o pianificate | Maggiore costanza; preparazione esami efficace; miglior mantenimento competenze |

### 13.3 Funzionalita' principali

- Gestione curriculum tecnico: creazione forme/kata, tecniche e sequenze; organizzazione per stile/livello/grado; tag e categorie; descrizioni testuali.
- Gestione video: associazione ai contenuti tecnici; streaming; ricerca e filtri; cronologia visualizzazioni; preferiti.
- Gestione programmi di allenamento: programmi personalizzati, per esame, giornalieri; assegnazione a utenti o gruppi.
- Gestione gradi: definizione gradi; associazione tecniche/kata richiesti; checklist requisiti.
- Area allievo: dashboard personale; programmi assegnati; contenuti consigliati; monitoraggio avanzamento.
- Area istruttore: gestione libreria tecnica; gestione allievi; creazione programmi; monitoraggio utilizzo.

### 13.4 Funzionalita' avanzate

- Ripasso intelligente: suggerisce kata non ripassati di recente, tecniche poco praticate, contenuti critici per il prossimo esame.
- Calendario esame: l'allievo inserisce grado e data; la piattaforma genera il piano di preparazione.
- Modalita' allenamento: sessione guidata (riscaldamento -> tecniche -> kata/forme -> ripasso finale).
- Tracking progressi: sessioni completate, tempo di allenamento, contenuti studiati, percentuale preparazione esame.
- Versionamento contenuti: storico modifiche, aggiornamenti controllati, mantenimento versioni precedenti.

### 13.5 Killer feature - Piano automatico di preparazione al grado

Flusso: (1) l'istruttore definisce il programma tecnico; (2) l'allievo seleziona il grado da preparare; (3) l'app genera piano di studio, piano di ripasso, sequenza allenamenti, stato avanzamento, requisiti mancanti. La piattaforma diventa un assistente digitale per la progressione.

### 13.6 Applicazioni e casi d'uso

| Caso d'uso | Problema | Soluzione |
|---|---|---|
| Preparazione esami di grado | L'allievo non conosce con precisione il programma richiesto | Curriculum, video ufficiali, programmi assegnati |
| Ripasso tra le lezioni | Dimenticanza delle tecniche apprese | Accesso continuo ai contenuti + pratica giornaliera |
| Recupero dopo assenze | Perdita di lezioni | Recupero autonomo via curriculum digitale |
| Standardizzazione insegnamento | Differenze tra istruttori | Video e contenuti ufficiali condivisi |
| Onboarding nuovi allievi | Difficolta' a comprendere il percorso | Percorso strutturato e accessibile |
| Supporto agli istruttori | Ripetizione delle stesse spiegazioni | Materiale sempre disponibile agli allievi |
| Scuole multi-sede | Uniformita' della didattica | Curriculum centralizzato |
| Federazioni | Distribuzione programmi ufficiali | Pubblicazione centralizzata + aggiornamenti immediati |
| Preparazione agonistica | Preparazione sistematica alle competizioni | Programmi dedicati + contenuti ufficiali |
| Conservazione patrimonio tecnico | Perdita del know-how della scuola | Archivio digitale permanente |

### 13.7 Segmentazione clientela (esigenze / valore percepito)

| Segmento | Esigenze | Valore percepito |
|---|---|---|
| Allievi | ripasso, preparazione esami, allenamento autonomo | video ufficiali, programmi guidati, avanzamento chiaro |
| Istruttori | supporto didattico, meno spiegazioni ripetitive, uniformita' | distribuzione contenuti, gestione programmi, supporto insegnamento |
| Scuole e dojo | standardizzazione, fidelizzazione allievi, qualita' didattica | archivio tecnico centralizzato, differenziazione, maggiore coinvolgimento |
| Federazioni e organizzazioni | diffusione programmi ufficiali, uniformita', aggiornamenti centralizzati | controllo curriculum, distribuzione immediata, gestione qualita' |

### 13.8 Segmenti di mercato (discipline target)

Karate, Judo, Aikido, Taekwondo, Kung Fu, Kobudo, Ju Jitsu, Hapkido. In generale qualsiasi disciplina con curriculum tecnico, forme, kata, sequenze e progressione per gradi.

### 13.9 Modello di business (ipotesi di pricing - NON validato)

| Piano | Destinatari | Funzionalita' | Prezzo indicativo |
|---|---|---|---|
| Gratuito | singoli praticanti | accesso limitato, programmi base, video essenziali | 0 |
| Professional | scuole e dojo | gestione allievi, curriculum personalizzato, programmi illimitati, statistiche | 39-79 EUR/mese |
| Academy | organizzazioni strutturate | multi-istruttore, multi-sede, branding personalizzato | 99-199 EUR/mese |
| White Label Federazioni | federazioni, org. nazionali | personalizzazione completa, curriculum ufficiale, distribuzione affiliati | 2.000-20.000 EUR/anno |

> ATTENZIONE: questo pricing freemium/per-scuola diverge dall'ipotesi corrente del piano
> (quota annuale federazione post-pilota, vedi 1.4 e 2.3) e dalla strategia in
> `plan/2026-05-02-monetization-strategy.md`. Da non assumere come deciso: e' materiale da testare con i buyer.

### 13.10 Posizionamento

Non una semplice videoteca. Non un gestionale per palestre. Una piattaforma per la gestione, distribuzione e apprendimento del curriculum tecnico delle arti marziali.

Tagline candidate:
- "Studia. Ripassa. Progredisci."
- "Il curriculum tecnico della tua scuola, sempre con te."
- "Dal kata al grado: un percorso digitale per la crescita marziale."

### 13.11 Brainstorming "Discovery Strategica v1" (Sessione 2 - bozza)

> Stato: BOZZA grezza Sessione 2 (2026-06-10), da raffinare. Si sovrappone ai file
> BMC (`business-model-canvas*.md`); va incrociata con quelli prima di promuovere voci.
> Spunti nuovi rispetto al BMC consolidato evidenziati in 13.13.

Definizione prodotto proposta: "Sistema di gestione, distribuzione e conservazione del curriculum tecnico delle arti marziali" -> framing finale come "CMS verticale delle arti marziali tradizionali". Non videoteca, non app fitness, non catalogo.

Problema per stakeholder:
- Allievi: dimenticano forme/tecniche, non sanno cosa ripassare, materiale sparso ("So che dovrei allenarmi ma non so cosa fare oggi").
- Istruttori: ripetono le stesse spiegazioni, inviano materiale su WhatsApp, gestione artigianale, niente monitoraggio ("Spiego sempre le stesse cose a persone diverse").
- Scuole: hanno contenuti ma non un sistema ("Abbiamo materiale, ma non abbiamo un sistema").
- Federazioni: devono distribuire programmi ufficiali e mantenere standard ("Come trasmettiamo lo stesso curriculum a tutte le affiliate?").

Funzionalita' principali citate: curriculum organizzato (forme/kata/tecniche/combinazioni/programmi di grado), video di riferimento, struttura pratica giornaliera, programmi personalizzati, progress tracking, reminder/notifiche.

Segmenti A-J (lista estesa):

| Segmento | Ruolo | Note |
|---|---|---|
| A. Allievi intermedi adulti | utenti finali | alto uso, basso potere decisionale, bassa willingness to pay, alta sostituibilita' |
| B. Maestri/istruttori | moltiplicatori | attivano gruppi; poco tempo, forte inerzia |
| C. Scuole/dojo | buyer naturali | revenue stabile |
| D. Federazioni | buyer istituzionali | massima scalabilita' |
| E. Istruttori indipendenti | early adopter ideali | - |
| F. Esaminatori | influenzano gli standard | - |
| G. Content creator marziali | partner/promotori | - |
| H. Accademie multisede | forte standardizzazione | - |
| I. Scuole tradizionali | conservazione patrimonio | - |
| J. Organizzatori eventi/esami | utilizzatori operativi | - |

Scala di grigi dei segmenti (assi di maturita' organizzativa, da allievo a federazione):
- Potere decisionale: allievo -> istruttore -> scuola -> federazione (crescente)
- Disponibilita' a pagare: bassa -> media -> alta -> molto alta
- Necessita' personalizzazione: minima -> bassa -> alta -> massima
- Lock-in: basso -> medio -> alto -> altissimo
- Complessita' problema: individuale -> operativo -> organizzativo -> sistemico

White label come conseguenza del dominio (non feature): nelle AM non esiste curriculum universale; ogni disciplina/scuola ha tecniche, livelli, nomenclatura (kata/forme/poomsae, gradi, dan/kup/chi/chieh) propri. Componenti: branding, curriculum, linguaggio, esperienza utente.

Scoperta strategica - la scuola come operatore economico (non solo cliente):
- Scenario 1: scuola usa l'app internamente (organizzazione/efficienza).
- Scenario 2: scuola offre servizi premium agli allievi (nuova fonte di ricavi).
- Scenario 3: scuola usa l'app come marketing (differenziazione, acquisizione, retention).
- Scenario 4: federazione offre il sistema alle affiliate (revenue, standardizzazione, controllo network).

Modelli di business possibili: SaaS tradizionale, SaaS white label, B2B2C (federazione->scuola->allievo), revenue sharing (scuola monetizza, piattaforma trattiene %), licenza federale.

Evoluzione naturale: Fase 1 istruttori indipendenti -> Fase 2 scuole -> Fase 3 white label -> Fase 4 federazioni.

Architettura tecnica (snapshot): Next.js 16, React 19, TypeScript, Supabase/Postgres, Tailwind, PWA. Logica nel DB/RPC/moduli puri, non nella UI. Dati statici (schools, skills, exam_programs), dinamici (user_profiles, user_plan_items, practice_logs, training_schedule).

### 13.12 Brainstorming "Segmentazione Scuole e Federazioni" (Sessione 2 - bozza)

> Stato: BOZZA grezza Sessione 2 (datata 2026-06-11), da raffinare. Focus sul lato
> buyer (scuole/dojo/accademie/federazioni/network), non sugli allievi finali.

Distinzione chiave: stakeholder != segmenti. Stakeholder ecosystem:
- Utilizzatori: allievi intermedi, praticanti avanzati.
- Influencer: istruttori, maestri, esaminatori.
- Buyer: scuole, accademie, federazioni.
- Amplificatori: content creator, network.

Metodo: segmentazione tramite assi bipolari (dimensioni del mercato, non segmenti).

Assi individuati (13):

| # | Asse | Poli | Misura |
|---|---|---|---|
| 6.1 | Disponibilita' materiale didattico | ha materiale / non ne ha mai avuto | codifica del sapere |
| 6.2 | Target didattico | bambini / adulti | ripetizione, monitoraggio |
| 6.3 | Standardizzazione disciplina | standardizzata (TKD, karate federato) / non (kung fu tradizionale) | struttura |
| 6.4 | Tipo entita' | scuola singola / network multisede | governance |
| 6.5 | Densita' studenti/istruttore | pochi / molti | automazione |
| 6.6 | Dipendenza dal maestro | indipendente / centrato sul maestro | replicabilita', rischio perdita sapere |
| 6.7 | Modalita' pratica | forme individuali / in coppia | natura curriculum |
| 6.8 | Modalita' insegnamento | solo presenza / integrabile da remoto | utilita' digitale |
| 6.9 | Formalizzazione curriculum | ufficiale / interpretato dai maestri | struttura del sapere |
| 6.10 | Livello certificazione | esami frequenti / rari-informali | tracking, storico |
| 6.11 | Orientamento didattico | sportivo-performance / culturale-tradizionale | obiettivi |
| 6.12 | Uso strumenti digitali | digital ready / analogico | probabilita' adozione |
| 6.13 | Struttura curriculum | lineare / ramificato | complessita' |

Macro-famiglie degli assi: A) Struttura del sapere; B) Organizzazione; C) Didattica; D) Standardizzazione e controllo; E) Maturita' digitale.

Cluster derivati:

| Cluster | Profilo | Opportunita' |
|---|---|---|
| 1. Tradizione orale analogica | nessun materiale, non standardizzata, curriculum interpretato, analogico, in presenza | valore teorico alto, adozione iniziale difficile |
| 2. Scuole strutturate analogiche | materiale esistente, curriculum ufficiale, standardizzata, analogica, esami frequenti; tracking assente, organizzazione dispersiva | MIGLIOR MERCATO INIZIALE |
| 3. Scuole ibride digitali | materiale esistente, curriculum ufficiale, strumenti parziali (PDF/WhatsApp/video sparsi) | problema = frammentazione strumenti |
| 4. Network strutturati digitalizzati | curriculum formalizzato, digitale, multisede, governance centralizzata | valore alto, vendita lenta |

Insight emersi:
1. La variabile piu' importante non e' il contenuto, ma il grado di formalizzazione del sapere.
2. Seconda variabile: maturita' digitale.
3. Massimo valore quando c'e' tensione tra curriculum gia' strutturato e gestione ancora manuale.
4. Scuole destrutturate: hanno bisogno del prodotto ma difficili da convertire.
5. Scuole digitalizzate: meno urgenza ma ticket piu' alto.

Segmento prioritario individuato: SCUOLE STRUTTURATE ANALOGICHE (curriculum esistente, esami regolari, gestione manuale, materiali disponibili, poca digitalizzazione). Perche': capiscono subito il valore, onboarding semplice, basso sforzo di adozione, problema quotidiano evidente.

Direzioni future suggerite: (1) selezionare 3-5 assi prioritari; (2) validare con scuole reali; (3) costruire ICP dettagliato; (4) definire MVP per il cluster prioritario; (5) test di adozione sul campo; (6) estensione verso federazioni/network.

### 13.13 Spunti nuovi rispetto al BMC consolidato (da promuovere se validati)

Elementi presenti in 13.11/13.12 ma NON ancora nei file `business-model-canvas*.md`. Da testare e, se reggono, portare nei documenti BMC e/o nel piano:

1. ICP piu' preciso: il segmento d'ingresso non e' "scuola" generica ma "scuola strutturata analogica" (curriculum gia' formalizzato + gestione ancora manuale). E' la tensione che crea valore (Insight 3).
2. Assi di segmentazione: formalizzazione del sapere + maturita' digitale come due variabili-guida del mercato, piu' discriminanti della disciplina. Possibile base per qualificare i lead.
3. Scuola come operatore economico: scenari revenue-sharing / premium agli allievi / white label - estendono la monetizzazione oltre la sola "quota federazione post-pilota" del piano. ATTENZIONE: divergono da 1.4/2.3 e da `2026-05-02-monetization-strategy.md`; trattare come ipotesi, non come decisione.
4. Sequenza go-to-market "istruttori indipendenti -> scuole -> white label -> federazioni": ordine di attacco diverso dal "pilota federazione" oggi ipotizzato; da confrontare con la scorecard opportunita'.
