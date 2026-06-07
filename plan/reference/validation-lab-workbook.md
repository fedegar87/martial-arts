# Validation Lab Workbook - Skill Practice

**Status:** Living  
**Creato:** 2026-06-04  
**Owner:** founder  
**Uso:** documento operativo per seguire il validation lab, raccogliere evidenze e decidere i prossimi passi per l'app.

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

### 1.2 One-liner soluzione

Skill Practice e' una PWA per la pratica guidata di arti marziali tradizionali: organizza il curriculum tecnico della scuola/federazione, mostra video di riferimento e propone all'allievo cosa praticare oggi.

### 1.3 Descrizione attuale

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

### 1.4 Cosa fa

- Mostra curriculum tecnico organizzato per livello, disciplina e programma esame.
- Usa video YouTube unlisted come riferimento tecnico.
- Propone una pratica giornaliera con focus e mantenimento.
- Tiene traccia di pratica completata, note personali e progressi.
- Supporta calendario, profilo, promemoria push e preparazione esame.

### 1.5 Cosa non fa

- Non e' un gestionale per palestre.
- Non gestisce pagamenti, presenze, CRM, prenotazioni o tesseramenti.
- Non e' un marketplace di corsi.
- Non sostituisce il maestro.
- Non monetizza contenuti tecnici della federazione verso i singoli allievi.

### 1.6 Tesi da validare

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

| # | Ipotesi | Tipo | Rischio | Evidenza oggi | Priorita' |
|---|---|---|---|---|---|
| H1 | Gli allievi intermedi riconoscono il problema "non so cosa praticare oggi" | problema | alto | esperienza + desk | |
| H2 | Il momento esame rende il bisogno urgente | problema | medio | plausibile | |
| H3 | I maestri vogliono ridurre domande ripetitive e impreparazione | problema/buyer | alto | desk + esperienza | |
| H4 | Gli allievi userebbero una proposta giornaliera almeno 2-3 volte a settimana | comportamento | alto | non verificata | |
| H5 | Il video della propria scuola/federazione conta piu' di un video generico | valore | medio | plausibile | |
| H6 | Il maestro accetta che l'app supporti la pratica senza sostituire la lezione | adozione | alto | non verificata | |
| H7 | La federazione vede valore nella standardizzazione del curriculum | buyer | alto | non verificata | |
| H8 | La federazione o 2-3 scuole accetterebbero un pilota di 90 giorni | canale | medio | non verificata | |
| H9 | Dopo il pilota, una quota annuale 1.200-2.400 EUR e' sostenibile | monetizzazione | alto | non verificata | |
| H10 | Il setup contenuti non diventa il vero collo di bottiglia | operativa | alto | parzialmente mitigata da curriculum esistente | |

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

Compilare dopo il lab:

- Segmento:
- Perche' questo segmento ora:
- Criteri per riconoscerlo:
- Dove trovarlo:
- Chi decide:
- Chi influenza:
- Primo contatto utile:

### 3.3 Early adopter profile

Un buon early adopter dovrebbe avere almeno 4 di questi segnali:

- Ha un esame vicino o un gruppo che prepara esami.
- Ha gia' chiesto o condiviso video tecnici via WhatsApp/YouTube/Drive.
- E' infastidito da domande ripetitive su "cosa devo ripassare?".
- Ha allievi intermedi che confondono forme/tecniche vecchie.
- E' aperto a strumenti digitali ma non vuole un gestionale complesso.
- Ha accesso a video tecnici o e' disposto a registrarne pochi.
- Puo' coinvolgere 5-15 allievi per un test.
- Puo' dare feedback onesto e rapido.

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

Data:

Appunti:

Decisioni:

Azioni:

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
