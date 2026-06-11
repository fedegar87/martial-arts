# Business Model Canvas & Business Design System - Skill Practice

**Status:** v1 state-of-the-art Strategyzer/Osterwalder
**Data:** 2026-06-04
**Scope:** trasformare Skill Practice da PWA personale/pilota a servizio sostenibile per scuole, federazione e praticanti usando Business Model Canvas, Value Proposition Canvas, Business Model Environment e testing sistematico delle ipotesi.
**Fonte prodotto:** `plan/current-plan.md`, `plan/2026-05-02-monetization-strategy.md`, `plan/reference/business/positioning-analysis.md`, `archive/04-validation-framework.md`.

---

> **Questo documento vs `validation-lab-workbook.md`.** Questo file descrive il **modello di
> business e il metodo** di validazione (i 9 blocchi del canvas, le quattro lenti, i template
> Strategyzer: Assumptions Map, Test Card, Learning Card, Evidence Ladder). Il **workbook** contiene
> l'**esecuzione concreta** del validation lab: le ipotesi vive (H1-H10, fonte unica), gli script
> intervista compilabili, l'evidence log, gli esperimenti datati e la scorecard finale. Regola: le
> ipotesi e i dati raccolti vivono nel workbook; qui resta il "come si valida" e il "che modello stiamo
> testando". Quando un'evidenza del workbook cambia il modello, aggiorna i blocchi del canvas qui.

---

## 0. Executive Summary

Skill Practice non va trattata come "una app da vendere", ma come un servizio pedagogico digitale che aiuta l'allievo a praticare tra una lezione e l'altra, usando curriculum e contenuti della propria scuola/federazione.

Il Business Model Canvas piu' coerente oggi e' un modello **B2B2C leggero**:

- il valore d'uso nasce per l'allievo;
- il valore organizzativo nasce per maestro/scuola/federazione;
- il pagatore piu' razionale, almeno nella fase pilota, e' federazione o scuola, non il singolo praticante;
- la sostenibilita' economica deve coprire soprattutto tempo di manutenzione, curation contenuti, supporto e continuita', non costi infrastrutturali elevati.

Questo documento non e' un business plan e non va trattato come documento statico. E' un **sistema di business design**: descrive il modello, identifica le ipotesi critiche, assegna esperimenti e aggiorna il canvas in base alle evidenze raccolte.

Ipotesi guida:

1. Il vero problema non e' "guardare video", ma sapere **cosa praticare oggi** e avere un riferimento coerente con il programma della propria scuola.
2. Il vero competitor non e' un gestionale di palestra, ma inerzia: quaderno cartaceo, memoria, WhatsApp, link YouTube sparsi.
3. Il modello piu' robusto non richiede pagamenti in-app, gating feature o subscription individuali.
4. La validazione deve misurare comportamento reale: uso ricorrente, completamento sessioni, richiesta di continuare, disponibilita' a sponsorizzare o pagare.

---

## 1. Metodo: come usare questo documento

### 1.1 Perche' Business Model Canvas

Il Business Model Canvas, nella formulazione di Osterwalder e Pigneur, descrive come un'organizzazione crea, distribuisce e cattura valore tramite nove blocchi: segmenti clienti, proposta di valore, canali, relazioni, ricavi, risorse, attivita', partner e costi.

In questo documento il canvas non e' usato come esercizio estetico. E' usato come **mappa di ipotesi falsificabili**:

- ogni casella deve dichiarare cosa crediamo;
- ogni credenza deve avere evidenze gia' disponibili o evidenze da raccogliere;
- ogni assunzione critica deve avere un test;
- ogni test deve avere una soglia di decisione.

### 1.2 Fonti metodologiche

Fonti usate come riferimento:

- Strategyzer, "The Business Model Canvas": https://www.strategyzer.com/library/the-business-model-canvas
- Strategyzer, "What is a business model": https://www.strategyzer.com/library/what-is-a-business-model
- Strategyzer, "Business models: the toolkit to design a disruptive company": https://www.strategyzer.com/library/business-models-the-toolkit-to-design-a-disruptive-company
- Strategyzer, "Value proposition": https://www.strategyzer.com/value-proposition
- Strategyzer, "Testing Business Ideas": https://www.strategyzer.com/library/testing-business-ideas-book
- Strategyzer, "Validate your ideas with The Test Card": https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card
- Strategyzer, "Capture insights and actions with The Learning Card": https://www.strategyzer.com/library/capture-customer-insights-and-actions-with-the-learning-card
- Strategyzer, "Designing strong experiments": https://www.strategyzer.com/library/designing-strong-experiments
- Strategyzer, "Navigating your business model environment": https://www.strategyzer.com/library/your-business-model-environment
- NSF I-Corps, customer discovery e business model testing: https://www.nsf.gov/funding/opportunities/nsf-national-innovation-corps-teams-nsf-national-i-corps-tm/nsf17-559/solicitation
- NSF I-Corps per SBIR/STTR Phase I awardees: https://seedfund.nsf.gov/resources/awardees/phase-1/nsf-i-corps/
- Vercel pricing ufficiale, per validazione costi hosting: https://vercel.com/pricing
- Supabase pricing ufficiale, per validazione costi backend: https://supabase.com/pricing

### 1.3 Stack metodologico Strategyzer/Osterwalder

La scuola Strategyzer/Osterwalder non usa un solo canvas isolato. Il metodo state-of-the-art combina piu' strumenti in sequenza:

| Strumento | Domanda | Uso in questo documento |
|---|---|---|
| Business Model Canvas | Come creiamo, distribuiamo e catturiamo valore? | Sezioni 3 e 16 |
| Value Proposition Canvas | Quale fit tra jobs/pains/gains del cliente e prodotti/pain relievers/gain creators? | Sezione 5 |
| Business Model Environment | In quale contesto competitivo, normativo, sociale e tecnologico opera il modello? | Sezione 18 |
| Assumptions Map | Quali ipotesi sono piu' rischiose e meno provate? | Sezione 13 |
| Test Card | Come testiamo una specifica ipotesi? | Sezione 14 |
| Learning Card | Che cosa abbiamo imparato e come cambia il canvas? | Sezione 14 |
| Progress Board | Quali esperimenti sono pianificati, in corso, conclusi o da ripetere? | Sezione 14 |

### 1.4 Le quattro lenti

Il canvas va letto attraverso quattro lenti:

| Lente | Domanda | Blocchi principali |
|---|---|---|
| Desirability | I clienti/utenti lo vogliono davvero? | Customer Segments, Value Propositions, Channels, Customer Relationships |
| Viability | Vale economicamente la pena? | Revenue Streams, Cost Structure |
| Feasibility | Possiamo consegnarlo bene? | Key Resources, Key Activities, Key Partnerships |
| Adaptability | Sopravvive a cambiamenti di mercato e contesto? | Environment, trend, competitor, regolazione, tecnologia |

Per Skill Practice oggi il rischio piu' grande e' **desirability comportamentale**: non basta che allievi e maestri dicano che l'app e' utile, devono usarla o promuoverla in modo ricorrente.

### 1.5 Regola scientifica

Una affermazione entra nel canvas solo se puo' essere classificata in una di queste categorie:

| Classe | Significato | Esempio |
|---|---|---|
| Evidenza interna | Deriva da codice, piani o uso reale del founder | L'app ha calendario, programma, progressi, push reminder |
| Evidenza esterna | Deriva da interviste, dati mercato, pricing competitor, fonti pubbliche | Una scuola usa WhatsApp per mandare link video |
| Ipotesi forte | Probabile ma non ancora verificata | La federazione preferisce pagare una quota annuale unica |
| Ipotesi debole | Plausibile ma fragile | Le scuole non affiliate sarebbero disposte a pagare |
| Rischio | Se falso, cambia modello | I maestri non vogliono spingere l'app agli allievi |

### 1.6 Output atteso

Questo documento serve a produrre quattro decisioni:

1. quale segmento validare prima;
2. quale proposta di valore comunicare;
3. quale modello di ricavo testare;
4. quali metriche usare per decidere se continuare, cambiare modello o fermarsi.

---

## 2. Contesto prodotto

### 2.1 Cosa e' Skill Practice oggi

Skill Practice e' una PWA per pratica guidata di arti marziali tradizionali. Il posizionamento corrente la definisce come evoluzione digitale del quaderno tecnico federale:

- curriculum FESK / Scuola Chang organizzato per disciplina e grado;
- video YouTube unlisted collegati alle skill;
- piano personale da esame o selezione custom;
- sessione del giorno;
- calendario pratica;
- log, progressi e top skill praticate;
- promemoria push opt-in;
- autenticazione Supabase e architettura predisposta a multi-utente/multi-scuola.

### 2.2 Cosa non e'

Non e':

- gestionale palestra;
- CRM;
- software di billing;
- calendario lezioni;
- marketplace di corsi;
- LMS pubblico;
- video hosting platform;
- app consumer generica per imparare kung fu da zero.

Questa distinzione e' centrale per il canvas: il business model non deve competere frontalmente con software amministrativi. Deve occupare il vuoto tra lezione, programma tecnico e pratica autonoma.

### 2.3 Unita' economica reale

L'unita' economica non e' "un download".

Le possibili unita' sono:

| Unita' | Quando ha senso | Limite |
|---|---|---|
| Federazione | Se l'app diventa servizio ufficiale o semi-ufficiale | Cliente unico, decisione lenta |
| Scuola | Se 2-4 maestri vogliono partire anche senza delibera federale | Frammentazione e sensibilita' politica |
| Allievo | Se si crea prodotto B2C autonomo | Pagamenti, burocrazia e diritto sui contenuti diventano pesanti |
| Network multi-scuola | Se si generalizza oltre FESK | Richiede vero multi-tenant, onboarding e supporto scalabili |

Oggi l'unita' piu' razionale e' **federazione o scuola**, con allievi come utenti finali.

---

## 3. Canvas Sintetico v1

Questa e' la versione compatta del modello. Le sezioni successive scompongono ogni blocco in ipotesi, evidenze, rischi e test.

### 3.1 Canvas in nove blocchi

| Blocco | Ipotesi v1 | Rischio primario | Test prioritario |
|---|---|---|---|
| Customer Segments | Cliente economico: federazione/scuola. Utenti: allievi intermedi e in preparazione esame. Influencer: maestri. | Confondere utente, influencer e pagatore. | Interviste separate per allievi, maestri, decisori. |
| Value Propositions | Quaderno tecnico digitale che dice cosa praticare oggi con video e programma della propria scuola. | Valore percepito ma non usato. | Pilota 60-90 giorni con log reali. |
| Channels | Demo diretta, maestri sponsor, pilota, report dati, riunione federale. | Canale troppo dipendente dal founder. | Misurare conversione demo -> pilota -> decisione. |
| Customer Relationships | High-touch iniziale, supporto fiduciario, onboarding manuale, report periodico. | Supporto non scalabile. | Tracciare ticket/problemi per utente attivo. |
| Revenue Streams | Quota annuale federazione; fallback quota scuola; niente pagamenti in-app. | Nessun pagatore formale anche con app utile. | Conversazione pricing solo dopo report pilota. |
| Key Resources | App, DB curriculum, video, relazione maestri, credibilita' interna, tempo founder. | Dipendenza da contenuti/autorizzazioni e founder. | Chiarire governance contenuti e ore operative. |
| Key Activities | Manutenzione, curation curriculum, supporto, onboarding, misurazione, report. | Curation e supporto sottostimati. | Timesheet founder durante pilota. |
| Key Partnerships | Maestri pilota, federazione/scuola, proprietari video, provider tecnici, consulenti fiscale/privacy. | Partner passivi o non autorizzanti. | Nominare un referente per scuola/pilota. |
| Cost Structure | Tempo founder, hosting/backend, dominio, privacy/fiscalita', curation video, supporto. | Prezzo basato solo sui costi vivi. | Calcolare quota su ore + costi, non solo infrastruttura. |

### 3.2 Lettura per lenti Strategyzer

| Lente | Stato attuale | Cosa deve diventare vero |
|---|---|---|
| Desirability | Plausibile, ma non ancora provata su uso ricorrente. | Allievi attivi oltre novelty effect; maestri sponsor; richiesta di continuare. |
| Viability | Modello federazione/scuola e' coerente, prezzo da validare. | Esiste budget annuale e processo decisionale concreto. |
| Feasibility | Prodotto tecnicamente gia' vicino al pilota. | Supporto, contenuti e privacy gestibili senza carico eccessivo. |
| Adaptability | Predisposizione multi-utente/multi-tenant, ma mercato ancora ristretto. | Il modello resta valido se FESK non paga o se si passa a singole scuole. |

### 3.3 Tesi strategica da validare

> Se un maestro sponsor inserisce Skill Practice nel rituale di preparazione degli allievi, una quota annuale scuola/federazione puo' sostenere il servizio perche' l'app riduce dispersione, aumenta continuita' di pratica e rende piu' usabile il patrimonio tecnico.

Questa tesi fallisce se almeno una delle tre condizioni non regge:

1. gli allievi non la usano;
2. i maestri non la promuovono;
3. scuola/federazione non riconosce valore economico o istituzionale.

---

## 4. Segmenti Clienti

### 4.1 Segmentazione corretta

Nel canvas bisogna separare tre ruoli che spesso vengono confusi:

| Ruolo | Chi e' | Cosa vuole | Cosa rischia |
|---|---|---|---|
| Utente finale | Allievo | Sapere cosa praticare, prepararsi meglio, non perdere il filo | Abbandona se l'app richiede troppo sforzo |
| Influencer/abilitatore | Maestro | Allievi piu' preparati, meno ripetizioni, programma chiaro | Non promuove l'app se gli crea lavoro |
| Pagatore | Federazione o scuola | Servizio utile, coerente, sostenibile, politicamente accettabile | Non paga se non vede adozione o beneficio |

### 4.2 Segmento primario: scuole/federazione FESK

**Ipotesi:** FESK o singole scuole hanno interesse a rendere il patrimonio tecnico piu' accessibile e usabile tra una lezione e l'altra.

**Perche' e' il segmento iniziale corretto:**

- curriculum gia' modellato;
- app gia' orientata a quel contesto;
- relazione e contesto culturale gia' disponibili;
- problema osservabile: quaderni, video, memoria, WhatsApp;
- costo marginale di servire altri praticanti FESK e' basso.

**Rischi:**

- il direttivo puo' non voler formalizzare;
- alcuni maestri possono percepire l'app come interferenza didattica;
- la proprieta' dei contenuti video deve essere chiarita;
- gli allievi potrebbero installarla ma non usarla.

### 4.3 Segmento utente: allievo intermedio

**Ipotesi:** l'allievo intermedio e' il segmento con pain piu' forte.

Profilo:

- pratica da 1-5 anni;
- ha abbastanza materiale da confondere forme, tecniche e priorita';
- prepara esami;
- usa telefono come supporto naturale;
- puo' praticare a casa ma spesso non sa cosa fare.

Pain:

- "non ricordo cosa devo ripassare";
- "trovo video online ma non sono quelli della mia scuola";
- "so che dovrei praticare, ma mi manca una traccia";
- "prima dell'esame non so se sono pronto".

Non target prioritario:

- principiante assoluto con poche skill;
- avanzato molto autonomo;
- praticante occasionale senza intenzione di allenarsi fuori lezione.

### 4.4 Segmento pagatore alternativo: singola scuola

**Ipotesi:** se la federazione non decide, alcune scuole possono pagare una quota annuale leggera.

Condizione per validarlo:

- il maestro vede l'app come servizio per i suoi allievi;
- la quota e' abbastanza bassa da equivalere a poche lezioni/private o piccola voce di budget;
- il modello resta senza pagamenti individuali.

### 4.5 Segmento futuro: network multi-scuola

**Ipotesi:** altre scuole o federazioni con curriculum strutturato possono avere lo stesso problema.

Da non attivare ora senza prove, perche' richiede:

- onboarding curriculum;
- permessi admin scuola;
- gestione tenant;
- supporto;
- contratti e responsabilita' su contenuti;
- processi di import/export.

### 4.6 Test per segmenti clienti

| Ipotesi | Test | Soglia positiva | Soglia negativa |
|---|---|---|---|
| Gli allievi intermedi sentono il problema | 10 interviste semi-strutturate | 7/10 citano confusione o mancanza piano senza suggerimento | Meno di 3/10 riconoscono il problema |
| I maestri vedono valore pedagogico | 5 interviste maestri + demo | 3/5 chiedono pilota con allievi reali | 4/5 dicono "bello ma non lo useremmo" |
| Il pagatore e' scuola/federazione | Discussione pricing post-demo | Almeno 1 decisore accetta range quota o pilota formale | Nessun decisore accetta neanche pilota misurato |

---

## 5. Proposta di Valore

### 5.1 Formula breve

> Skill Practice e' il quaderno tecnico digitale della scuola: ogni allievo vede cosa praticare oggi, con video, programma d'esame, calendario e progressi.

### 5.2 Proposta per allievo

Benefici funzionali:

- sapere cosa praticare oggi;
- vedere video corretti della propria scuola;
- preparare esami con checklist e piano;
- tracciare pratica e continuita';
- ricevere reminder se attivati.

Benefici emotivi:

- meno ansia pre-esame;
- piu' senso di controllo;
- meno frizione nel cominciare ad allenarsi;
- percezione di continuita' tra palestra e casa.

Benefici sociali:

- arrivare in lezione piu' preparato;
- parlare col maestro usando riferimenti condivisi;
- sentirsi dentro un percorso strutturato.

### 5.3 Proposta per maestro

Benefici:

- riduce messaggi ripetitivi su "cosa devo ripassare?";
- evita link dispersi in chat;
- rende il programma piu' chiaro;
- aiuta allievi assenti a rientrare;
- puo' aumentare qualita' della pratica autonoma.

Rischio da evitare:

- non deve diventare un nuovo lavoro amministrativo;
- non deve sostituire il giudizio didattico;
- non deve promettere progressi automatici.

### 5.4 Proposta per federazione/scuola

Benefici:

- preserva e rende usabile il patrimonio tecnico;
- aumenta coerenza del programma tra allievi e scuole;
- offre un servizio moderno senza costruire un gestionale;
- crea dati aggregati utili su adozione e pratica;
- rafforza identita' e continuita' didattica.

### 5.5 Cosa non promettere

Non promettere:

- che l'app faccia praticare chi non vuole praticare;
- che sostituisca il maestro;
- che certifichi competenza tecnica;
- che garantisca superamento esame;
- che sia una piattaforma completa per gestire la scuola.

Promessa difendibile:

- riduce la frizione tra intenzione di praticare e sessione concreta;
- organizza contenuti e programma in modo coerente;
- rende visibile la continuita' di pratica.

### 5.6 Evidenze da raccogliere

| Claim | Evidenza richiesta |
|---|---|
| "Riduce confusione" | Interviste pre/post pilota; domande su chiarezza del programma |
| "Aumenta pratica autonoma" | Log sessioni, giorni attivi, completamento sessioni |
| "Aiuta il maestro" | Feedback maestro su messaggi ricevuti, preparazione allievi, tempo risparmiato |
| "Ha valore per federazione" | Disponibilita' a sponsorizzare, comunicare, pagare o includere in percorso ufficiale |

### 5.7 Value Proposition Canvas - Allievo

Customer Profile:

| Jobs | Pains | Gains |
|---|---|---|
| Preparare l'esame. | Non ricordare cosa ripassare. | Sentirsi pronto e ordinato. |
| Allenarsi a casa in 10-30 minuti. | Aprire YouTube e trovare versioni diverse. | Sapere subito cosa fare oggi. |
| Recuperare dopo assenze. | Perdere il filo del programma. | Rientrare senza dipendere da messaggi individuali. |
| Mantenere forme e tecniche gia' imparate. | Confondere forme simili o dettagli tecnici. | Vedere progressi e continuita'. |
| Mostrare serieta' al maestro. | Sentirsi impreparato in lezione. | Arrivare piu' sicuro e focalizzato. |

Value Map:

| Products & Services | Pain Relievers | Gain Creators |
|---|---|---|
| Sessione del giorno. | Riduce scelta e incertezza. | Trasforma "dovrei praticare" in piano concreto. |
| Catalogo per disciplina/grado. | Evita link sparsi. | Rende consultabile il curriculum reale. |
| Video associati alle skill. | Riduce rischio di guardare versioni non coerenti. | Fornisce riferimento visivo rapido. |
| Calendario e log pratica. | Evita memoria manuale. | Mostra continuita' e preparazione. |
| Reminder opt-in. | Riduce dimenticanza. | Aiuta a costruire routine. |

Fit da provare:

- problem-solution fit: l'allievo riconosce il problema e capisce come l'app lo risolve;
- product-market fit iniziale: l'allievo usa l'app senza sollecito costante;
- business model fit: l'uso degli allievi genera valore percepito per maestro/scuola/federazione.

### 5.8 Value Proposition Canvas - Maestro

Customer Profile:

| Jobs | Pains | Gains |
|---|---|---|
| Far progredire gli allievi tra le lezioni. | Ripetere sempre le stesse indicazioni. | Allievi piu' preparati e autonomi. |
| Mantenere coerenza tecnica. | Video casuali o versioni sbagliate viste online. | Riferimento condiviso e controllato. |
| Preparare gruppi agli esami. | Domande individuali pre-esame. | Programma piu' chiaro per tutti. |
| Gestire assenze e recuperi. | Allievo assente che rientra perso. | Recupero piu' ordinato. |
| Proteggere il valore della lezione. | Timore che digitale sostituisca insegnamento. | App come supporto, non sostituto. |

Value Map:

| Products & Services | Pain Relievers | Gain Creators |
|---|---|---|
| Programma esame strutturato. | Riduce ambiguita' su cosa serve. | Rende esplicito il percorso. |
| Note maestro / teacher notes. | Mantiene indicazioni chiave vicino al video. | Estende la voce didattica del maestro. |
| Piani focus/maintenance. | Evita piano generico uguale per tutti. | Prioritizza pratica. |
| Report pilota. | Porta dati, non impressioni. | Aiuta a decidere se estendere. |
| Onboarding manuale. | Riduce lavoro iniziale del maestro. | Abbassa frizione di adozione. |

Fit da provare:

- il maestro deve vedere l'app come riduzione di carico, non come nuovo admin;
- il maestro deve essere disposto a dire agli allievi: "usate questa come riferimento";
- il maestro deve accettare almeno un rituale minimo, per esempio controllo settimanale o uso pre-esame.

### 5.9 Value Proposition Canvas - Federazione/Scuola Pagatrice

Customer Profile:

| Jobs | Pains | Gains |
|---|---|---|
| Preservare e diffondere curriculum. | Patrimonio tecnico disperso in quaderni, memoria e chat. | Servizio digitale coerente e moderno. |
| Aumentare qualita' preparazione. | Disomogeneita' tra praticanti e scuole. | Maggiore continuita' didattica. |
| Offrire valore agli iscritti. | Difficile giustificare nuovi costi. | Beneficio tangibile senza gestionale complesso. |
| Gestire reputazione e contenuti. | Rischio uso improprio video o comunicazione esterna confusa. | Controllo del perimetro e accesso. |
| Decidere investimenti piccoli ma ricorrenti. | Mancanza di dati su uso reale. | Report pilota per deliberare. |

Value Map:

| Products & Services | Pain Relievers | Gain Creators |
|---|---|---|
| PWA federale/scuola. | Evita progetto app nativa costoso. | Strumento accessibile da mobile. |
| Auth e accesso controllato. | Riduce apertura indiscriminata. | Servizio riservato agli iscritti. |
| Curriculum digitalizzato. | Riduce dipendenza da supporti statici. | Valorizza lavoro tecnico gia' esistente. |
| Report adozione. | Riduce decisioni basate su opinioni. | Crea base per rinnovo o estensione. |
| Modello quota annuale. | Evita pagamenti individuali. | Amministrazione semplice. |

Fit da provare:

- il pagatore deve riconoscere che paga un servizio continuo, non solo software;
- deve esistere un processo deliberativo;
- la quota deve essere proporzionata al numero di utenti serviti e al lavoro ricorrente.

### 5.10 Errori Strategyzer da evitare

| Errore | Rischio per Skill Practice | Contromisura |
|---|---|---|
| Mescolare segmenti | Scrivere una proposta unica per allievo, maestro e federazione. | Canvas separati per ciascun ruolo. |
| Profilare il cliente dalla prospettiva del founder | Sopravvalutare l'amore per il prodotto. | Interviste su comportamenti passati. |
| Cercare di risolvere ogni pain | Scope creep verso gestionale/LMS/social. | Scegliere massimo 3 pain prioritari per fase. |
| Confondere opinioni con evidenza | "Bella app" scambiato per domanda. | Misurare uso, referral, budget, commitment. |
| Saltare dal canvas allo sviluppo | Costruire feature non validate. | Test Card prima di nuove feature business-critical. |

---

## 6. Canali

### 6.1 Canali iniziali

| Canale | Uso | Perche' |
|---|---|---|
| Demo diretta al maestro | Acquisizione pilota | Fiducia e contesto contano piu' della landing |
| Pilota in 2-3 scuole | Validazione | Misura comportamento reale |
| Report post-pilota | Conversione pagatore | Porta evidenze, non opinioni |
| Landing pubblica | Supporto reputazionale | Serve come biglietto da visita |
| Assemblea o riunione federale | Decisione economica | Il pagatore e' collettivo |

### 6.2 Canali da evitare ora

Da evitare nella fase 1:

- ads consumer;
- App Store / Play Store come canale principale;
- freemium pubblico;
- influencer marketing;
- marketplace corsi;
- SEO generico "impara kung fu online".

Motivo: attirano utenti fuori segmento e spingono verso un modello B2C non coerente con i contenuti e con l'organizzazione attuale.

### 6.3 Funnel pilota

1. maestro accetta demo;
2. maestro seleziona 5-15 allievi;
3. founder configura utenti e piano;
4. allievi usano app per 30-90 giorni;
5. si raccolgono log e feedback;
6. si produce report;
7. scuola/federazione decide se continuare e con quale quota.

### 6.4 Metriche canale

| Metrica | Buona | Critica |
|---|---|---|
| Maestri che accettano demo | 3 su 5 | 0-1 su 5 |
| Maestri che accettano pilota | 2 su 3 demo | 0 su 3 demo |
| Allievi invitati che completano onboarding | >70% | <40% |
| Utenti attivi nella seconda settimana | >40% degli invitati | <15% |

---

## 7. Relazioni con i Clienti

### 7.1 Relazione con federazione/scuola

In fase iniziale la relazione deve essere personale e fiduciaria:

- onboarding manuale;
- supporto diretto;
- aggiornamenti periodici;
- report di adozione;
- gestione richieste curriculum;
- revisione contenuti con referenti tecnici.

Non e' ancora un SaaS self-service.

### 7.2 Relazione con allievi

Relazione prodotto:

- app semplice;
- nessuna community/chat;
- reminder opt-in;
- feedback minimo ma visibile;
- uso individuale e privato.

Supporto:

- istruzioni essenziali;
- canale maestro/founder per problemi;
- niente customer support pesante finche' base utenti e' piccola.

### 7.3 Rischio relazione

Se il founder diventa unico punto di supporto per ogni allievo, il modello non scala.

Mitigazioni:

- FAQ corta;
- messaggio chiaro in onboarding;
- referenti scuola;
- report problemi ricorrenti;
- automatizzare solo dopo pattern ripetuti.

---

## 8. Flussi di Ricavo

### 8.1 Modello raccomandato: quota annuale federazione

Ipotesi:

- pilota gratuito misurato;
- quota annuale leggera dopo prova;
- accesso gratuito per allievi;
- nessun gating feature;
- nessun pagamento in-app.

Razionali:

- amministrazione minima;
- politicamente piu' pulito;
- allineato a contenuti federali/scuola;
- riduce complessita' tecnica e fiscale;
- facilita adozione per allievi.

### 8.2 Fallback: quota annuale per scuola

Da usare se:

- federazione non decide;
- singole scuole mostrano domanda reale;
- contenuti e autorizzazioni sono chiari.

### 8.3 Modelli da non attivare ora

| Modello | Motivo |
|---|---|
| Freemium B2C | Ricavi bassi, burocrazia alta, rischio politico sui contenuti |
| Premium feature individuali | Troppo codice e supporto per poco upside |
| Marketplace video | Cambia natura del prodotto e richiede diritti contenuti |
| Commissioni su esami/stage | Politicamente sensibile e fuori scope |
| Ads | Incoerente con fiducia, privacy e contesto didattico |

### 8.4 Willingness to Pay: come testarla

Non chiedere "pagheresti?". Chiedere:

- "Se dopo 90 giorni il report mostra uso reale, quale budget annuale sarebbe realistico?"
- "Chi dovrebbe pagare: federazione, scuola o allievo?"
- "Quale processo serve per deliberare?"
- "Quale cifra sarebbe troppo bassa da far sembrare il servizio non serio?"
- "Quale cifra richiederebbe una gara, contratto o approvazione formale?"

Segnali piu' forti delle parole:

- richiesta di estendere il pilota;
- disponibilita' a presentarlo al direttivo;
- richiesta di preventivo;
- proposta di budget;
- scelta di un referente interno;
- introduzione ad altre scuole.

### 8.5 Metriche ricavi

| Domanda | Metrica |
|---|---|
| Esiste budget? | Almeno una scuola/federazione indica range concreto |
| Esiste processo? | E' identificato chi decide e quando |
| Esiste commitment? | Lettera, email, riunione, delibera o pagamento |
| Il prezzo copre tempo? | Ricavo annuo / ore annue founder >= soglia minima accettabile |

---

## 9. Risorse Chiave

### 9.1 Risorse tecniche

- codebase Next.js/PWA;
- Supabase Auth/Postgres/RLS;
- schema curriculum;
- service worker e push reminder;
- test su logica pura;
- hosting Vercel.

### 9.2 Risorse contenuto

- curriculum strutturato;
- mapping skill/esami/gradi;
- video unlisted;
- note maestro;
- nomenclatura coerente.

Questa e' probabilmente la risorsa piu' difendibile: non perche' sia tecnicamente difficile, ma perche' richiede relazione, contesto e curation.

### 9.3 Risorse relazionali

- fiducia dei maestri;
- accesso a scuole pilota;
- legittimazione federale o scolastica;
- feedback diretto degli allievi.

### 9.4 Risorse operative

- tempo founder;
- capacita' di supporto;
- processo di aggiornamento curriculum;
- disciplina nel non allargare scope.

---

## 10. Attivita' Chiave

### 10.1 Attivita' prodotto

- mantenere app funzionante;
- correggere bug;
- migliorare UX mobile;
- monitorare performance;
- gestire compatibilita' PWA/browser;
- mantenere sicurezza e privacy.

### 10.2 Attivita' contenuto

- aggiornare programmi;
- aggiungere o correggere video;
- validare nomi tecnici;
- mantenere coerenza tra curriculum e DB;
- documentare cambi.

### 10.3 Attivita' business

- condurre interviste;
- gestire pilota;
- produrre report;
- presentare risultati;
- negoziare quota;
- curare relazione con decisori.

### 10.4 Attivita' da evitare

- costruire billing;
- costruire CRM;
- creare admin complesso prima del bisogno;
- supportare scuole non validate;
- inseguire feature richieste da un solo utente;
- trasformare il prodotto in social/community.

---

## 11. Partner Chiave

### 11.1 Partner interni al contesto

| Partner | Ruolo | Rischio |
|---|---|---|
| Maestri pilota | Validazione didattica e adozione | Se non promuovono, gli allievi non usano |
| Referente federale | Sponsorship e decisione | Processo lento |
| Allievi tester | Dati d'uso e feedback | Novelty effect |
| Proprietari contenuti video | Autorizzazione e qualita' | Diritti non chiari |

### 11.2 Partner tecnici

| Partner | Ruolo | Nota |
|---|---|---|
| Vercel | Hosting e deploy | Pricing da verificare prima di impegno economico |
| Supabase | Auth, DB, RLS | Pricing e limiti da monitorare |
| YouTube | Hosting video unlisted | Dipendenza accettata dal piano corrente |
| GitHub | Repo e workflow | Reminder via workflow se necessario |

### 11.3 Partner professionali

Da coinvolgere prima di apertura a utenti terzi:

- commercialista;
- consulente privacy/legale;
- eventuale referente comunicazione federale.

---

## 12. Struttura Costi

### 12.1 Categorie

| Categoria | Descrizione | Driver |
|---|---|---|
| Hosting/app | Vercel, dominio, eventuale monitoring | Utenti, traffico, logging |
| Backend | Supabase DB/Auth/storage eventuale | MAU, DB, egress, backup |
| Tempo founder | sviluppo, bugfix, supporto, report | numero scuole, richieste, complessita' |
| Curation contenuti | video, mapping curriculum, revisioni | numero discipline, cambi programma |
| Compliance | privacy, termini, fiscalita' | utenti reali, pagamenti, enti coinvolti |
| Supporto | problemi login, onboarding, device | utenti e scuole attive |

### 12.2 Regola di accuratezza sui costi

Non fissare pricing finale basandosi su stime vecchie. Prima di proporre quota annuale, verificare:

- pricing corrente Vercel;
- pricing corrente Supabase;
- costo dominio;
- costo eventuale consulenza privacy;
- costo fiscale/amministrativo per ricevere pagamenti;
- ore founder realistiche per mese.

### 12.3 Costo dominante

Nel modello attuale il costo dominante non e' infrastruttura. E':

> tempo qualificato del founder per mantenere servizio, contenuti, relazione e continuita'.

Questa e' la voce da monetizzare con onesta'. Se la quota copre solo hosting, il modello non e' sostenibile.

---

## 13. Ipotesi Critiche e Registro Evidenze

> **Fonte unica delle ipotesi: il workbook (§2.4).** Per evitare due numerazioni divergenti, l'elenco
> autoritativo delle ipotesi vive in `validation-lab-workbook.md` §2.4 (H1-H10), con il loro stato
> aggiornato in §6.5 e l'evidence log in §6.1. Qui sotto resta solo il *metodo* per classificarle
> (Assumptions Map, Evidence Ladder), che il workbook non duplica.
>
> Le ipotesi piu' rischiose lato modello di business, mappate sugli ID del workbook: uso ricorrente
> dell'allievo (H4), accettazione/promozione del maestro (H6), willingness to pay di scuola/federazione
> (H7+H9), pilota fattibile (H8), setup contenuti sostenibile (H10). L'autorizzazione legale di video e
> marchio non ha un ID nel workbook ma e' P0 lato viability: vedi Domande Aperte (workbook §10) e §18 di
> questo documento. Quando aggiungi un'ipotesi di business non coperta, creala prima nel workbook e poi
> referenziala qui.

### 13.4 Assumptions Map

La mappa assunzioni incrocia due dimensioni:

- impatto sul modello se l'ipotesi e' falsa;
- evidenza gia' disponibile.

Priorita':

| Quadrante | Significato | Azione |
|---|---|---|
| Alto impatto / bassa evidenza | Rischio critico | Testare subito |
| Alto impatto / alta evidenza | Pilastro da monitorare | Verificare periodicamente |
| Basso impatto / bassa evidenza | Rumore | Non investire ora |
| Basso impatto / alta evidenza | Fatto operativo | Documentare, non discutere |

Mappa corrente (ID allineati al workbook §2.4; "VID" = autorizzazione contenuti, senza ID nel workbook):

| Ipotesi | Impatto | Evidenza | Priorita' | Esperimento |
|---|---|---|---|---|
| H4: allievi usano l'app oltre novelty effect (uso ricorrente) | Alto | Bassa | P0 | Pilota con retention settimana 6 |
| H6: maestri accettano/promuovono senza carico extra | Alto | Bassa | P0 | Maestro sponsor + intervista post-pilota |
| H7+H9: federazione/scuola paga quota annuale | Alto | Bassa | P0 | Pricing conversation con report |
| VID: contenuti video autorizzabili | Alto | Media-bassa | P0 | Check governance contenuti prima pilota esteso |
| H10: setup/supporto resta gestibile | Medio-alto | Bassa | P1 | Log richieste supporto durante pilota |
| (scope) modello non richiede admin complesso | Medio | Media | P1 | Tenere onboarding manuale e misurare attriti |
| (espansione) replicabilita' multi-scuola | Medio | Bassa | P2 | Seconda scuola dopo primo pilota |

### 13.5 Evidence Ladder

Gerarchia delle evidenze da usare nelle decisioni:

| Forza | Tipo evidenza | Esempio per Skill Practice |
|---|---|---|
| Forte | Comportamento reale | Utente completa sessioni per 6 settimane |
| Forte | Commitment economico | Scuola/federazione approva quota o budget |
| Forte | Commitment operativo | Maestro nomina gruppo pilota e referente |
| Media | Intenzione concreta | Decisore chiede preventivo o riunione |
| Media | Feedback specifico | Allievo descrive un momento in cui l'app ha risolto confusione |
| Debole | Opinione generica | "Bella app", "potrebbe essere utile" |
| Debole | Interesse senza costo | Download o visita landing senza uso successivo |

Regola: una decisione economica non puo' basarsi solo su evidenze deboli.

---

## 14. Protocollo di Validazione

> **Esecuzione concreta nel workbook.** Le tre fasi operative (discovery qualitativa, pilota,
> validazione economica) con script intervista, campione, metriche e soglie vivono nel workbook:
> Fase 1 discovery -> §4 (piano ricerca) + §4.4-4.7 (script per allievo/maestro/federazione/genitore);
> Fase 2 pilota -> §8.1-8.3 (esperimenti con metriche e soglie); Fase 3 validazione economica ->
> §8.4 (buyer conversation) + §9 (scorecard e decisione). Qui sotto restano solo i **template
> Strategyzer** (Test Card, Learning Card, Progress Board) da usare per ogni esperimento: sono il
> formato, non i dati.

### 14.4 Test Card

Ogni esperimento deve essere scritto prima di eseguirlo.

Template:

| Campo | Contenuto |
|---|---|
| Ipotesi | Crediamo che... |
| Rischio | Se e' falsa, allora... |
| Esperimento | Per verificarlo faremo... |
| Segmento | Con chi lo testeremo... |
| Artefatto | Useremo questo script/demo/prototipo/report... |
| Metrica | Misureremo... |
| Criterio successo | Avremo evidenza positiva se... |
| Criterio fallimento | Consideriamo l'ipotesi indebolita se... |
| Durata | Inizio/fine |
| Owner | Responsabile |

Test card prioritarie:

| ID | Ipotesi | Esperimento | Successo |
|---|---|---|---|
| TC1 | Allievi intermedi hanno pain reale | 10 interviste problema | 7/10 raccontano episodi concreti senza prompt |
| TC2 | Maestro sponsor abilita adozione | Pilota con gruppo reale | >70% onboarding e maestro cita app in lezione |
| TC3 | App crea uso ricorrente | Pilota 60-90 giorni | >25% invitati attivi settimana 6 |
| TC4 | Pagatore riconosce valore | Report + pricing conversation | Decisore identifica budget/processo |
| TC5 | Supporto gestibile | Log supporto pilota | <1 problema bloccante ogni 10 utenti/settimana |

### 14.5 Learning Card

Dopo ogni esperimento compilare una learning card.

Template:

| Campo | Contenuto |
|---|---|
| Ipotesi testata | Quale assunzione era in gioco |
| Osservazioni | Cosa e' successo davvero |
| Insight | Cosa deduciamo dalle osservazioni |
| Decisione | Perseverare, pivotare, ripetere, fermare |
| Cambio al canvas | Quali blocchi cambiano |
| Prossimo test | Quale ipotesi emerge ora |

Esempio:

| Campo | Esempio |
|---|---|
| Ipotesi testata | Gli allievi usano la sessione del giorno senza sollecito quotidiano |
| Osservazioni | 12 invitati, 10 onboarding, 5 attivi settimana 2, 3 attivi settimana 6 |
| Insight | Il valore esiste per un sotto-segmento motivato, ma onboarding/rituale maestro sono determinanti |
| Decisione | Perseverare con segmento "preparazione esame", non allievi generici |
| Cambio al canvas | Customer Segments e Channels piu' focalizzati su gruppi pre-esame |
| Prossimo test | Pilota pre-esame 30 giorni con rituale maestro esplicito |

### 14.6 Progress Board

Stato esperimenti:

| Stato | Significato |
|---|---|
| Backlog | Ipotesi identificata, test non progettato |
| Designed | Test Card pronta |
| Running | Esperimento in corso |
| Learning | Dati raccolti, Learning Card da compilare |
| Decided | Decisione presa e canvas aggiornato |

Progress board iniziale:

| Esperimento | Stato | Owner | Output |
|---|---|---|---|
| Interviste allievi | Backlog | Founder | Customer Profile validato |
| Interviste maestri | Backlog | Founder | Maestro sponsor e rischi |
| Check contenuti video | Backlog | Founder + referente | Autorizzazione o blocco |
| Pilota 60-90 giorni | Backlog | Founder + maestro | Retention e usage report |
| Pricing conversation | Backlog | Founder + decisore | Processo e budget |

---

## 15. Metriche di Decisione

### 15.1 Decisione: continuare

Continuare se:

- almeno un maestro vuole proseguire;
- almeno un gruppo mostra uso ricorrente;
- i problemi tecnici sono gestibili;
- il pagatore accetta discussione economica concreta;
- non emergono blocchi sui contenuti.

### 15.2 Decisione: cambiare modello

Cambiare modello se:

- allievi usano ma federazione non paga: testare quota scuola;
- maestri apprezzano ma allievi non usano: ridurre scope e lavorare su onboarding/rituale;
- allievi usano solo prima degli esami: posizionare come "exam preparation companion";
- supporto e curation pesano troppo: alzare quota o ridurre servizio.

### 15.3 Decisione: fermarsi

Fermarsi o mettere in pausa se:

- uso ricorrente sotto soglia dopo onboarding corretto;
- nessun maestro vuole sponsorizzare;
- nessun pagatore accetta un percorso di decisione;
- contenuti non autorizzabili;
- il tempo richiesto supera il valore economico e personale.

---

## 16. Business Model Canvas Dettagliato

### 16.1 Customer Segments

**Ipotesi principale:** scuole/federazione sono clienti, allievi sono utenti, maestri sono canale e influencer.

Sotto-segmenti:

- federazione FESK;
- scuola singola;
- maestro responsabile programma;
- allievo intermedio;
- allievo in preparazione esame;
- genitore di allievo minore, se il target include minori.

Domande aperte:

- quanti praticanti attivi sono raggiungibili?
- quanti hanno eta'/device/aditudine adatta?
- quanti praticano fuori lezione?
- quanti maestri vogliono spingere uso extra-lezione?

### 16.2 Value Propositions

Proposta core:

- pratica guidata giornaliera;
- programma d'esame chiaro;
- video corretti;
- tracciamento semplice;
- continuita' scuola-casa.

Differenziatori:

- contenuto della propria scuola, non generico;
- pedagogia-first, non admin-first;
- PWA installabile, nessuno store;
- basso costo operativo;
- predisposizione multi-utente.

### 16.3 Channels

Canali di acquisizione:

- demo dirette;
- maestri;
- federazione;
- pilota;
- landing.

Canali di delivery:

- PWA;
- reminder push;
- onboarding manuale;
- report.

### 16.4 Customer Relationships

Relazione iniziale:

- high-touch;
- fiduciaria;
- founder-led;
- reportistica manuale.

Relazione futura:

- referenti scuola;
- onboarding documentato;
- supporto leggero;
- admin strumenti minimi solo se necessari.

### 16.5 Revenue Streams

Preferenza:

- quota annuale federazione;
- fallback quota scuola;
- eventuale setup fee solo se import curriculum richiede lavoro extra.

Non preferenza:

- pagamento allievo;
- gating;
- ads;
- commissioni.

### 16.6 Key Resources

- software;
- curriculum;
- video;
- database;
- relazione;
- know-how didattico;
- tempo founder;
- reputazione.

### 16.7 Key Activities

- sviluppo e manutenzione;
- curation contenuti;
- supporto;
- onboarding;
- analytics e report;
- gestione privacy/fiscalita';
- relazione con referenti.

### 16.8 Key Partnerships

- scuole pilota;
- maestri;
- federazione;
- consulente fiscale;
- consulente privacy;
- provider tecnici.

### 16.9 Cost Structure

Costi diretti:

- hosting;
- backend;
- dominio;
- servizi email/monitoring eventuali;
- consulenza.

Costi indiretti:

- tempo founder;
- supporto;
- aggiornamenti contenuto;
- coordinamento;
- rischio opportunita'.

---

## 17. Scenari Strategici

### 17.1 Scenario A - Federazione paga

Uso:

- scenario preferito;
- una quota annuale;
- tutti gli allievi accedono;
- governance piu' chiara.

Pro:

- semplicita' tecnica;
- semplicita' amministrativa;
- politicamente piu' pulito.

Contro:

- cliente unico;
- tempi lenti;
- rischio cambio priorita'.

### 17.2 Scenario B - Scuole pagano

Uso:

- fallback o ponte;
- 2-4 scuole attive;
- quota leggera.

Pro:

- validazione piu' rapida;
- meno dipendenza da direttivo;
- stesso prodotto.

Contro:

- frammentazione;
- possibile sensibilita' politica;
- piu' relazioni da gestire.

### 17.3 Scenario C - SaaS multi-scuola

Uso:

- futuro, non ora;
- solo dopo prove ripetute;
- richiede onboarding curriculum e admin.

Pro:

- mercato piu' grande;
- ricavi potenzialmente ricorrenti.

Contro:

- complessita' alta;
- supporto alto;
- perdita di specificita';
- serve processo commerciale vero.

### 17.4 Scenario D - B2C

Uso:

- sconsigliato per fase attuale.

Perche':

- contenuti non sono puramente del founder;
- ricavi bassi;
- pagamenti individuali complessi;
- rischio di spostare posizionamento verso "corso online".

---

## 18. Business Model Environment e Falsificazione

Il canvas non vive nel vuoto. Prima di decidere investimenti o pricing va letto nel contesto.

### 18.1 Market Forces

| Forza | Implicazione | Domanda da validare |
|---|---|---|
| Allievi gia' pagano quota scuola, esami e stage | Pagamento individuale aggiuntivo e' fragile | Chi percepisce abbastanza valore da pagare? |
| Il problema e' piu' forte in preparazione esame | Uso potrebbe essere stagionale | Il modello deve essere annuale o legato a cicli esame? |
| Molti praticanti non praticano a casa | TAM comportamentale minore del numero iscritti | Quale percentuale ha intenzione reale di pratica autonoma? |
| Genitori possono influenzare minori | Segmento con value proposition diversa | Serve comunicazione per genitori o no? |

### 18.2 Industry Forces

| Forza | Implicazione | Domanda da validare |
|---|---|---|
| Gestionali palestra risolvono billing/schedule | Skill Practice deve restare complementare | Le scuole vogliono un secondo tool pedagogico? |
| WhatsApp/YouTube/quaderno sono gratuiti | Il competitor e' inerzia a costo zero | Il miglioramento e' abbastanza forte da giustificare quota? |
| App B2C martial arts esistono | Differenziazione deve essere "contenuto della tua scuola" | Il vantaggio scuola-specifico e' percepito? |
| Potenziali tool generici Notion/Drive | Soluzione artigianale sempre possibile | Cosa rende Skill Practice piu' comoda di uno stack manuale? |

### 18.3 Key Trends

| Trend | Opportunita' | Rischio |
|---|---|---|
| PWA e mobile-first | Distribuzione senza store | Compatibilita' iOS/push/offline da gestire |
| Micro-learning e pratica autonoma | Sessione del giorno facile da capire | Rischio di sembrare corso online consumer |
| Digitalizzazione associazioni sportive | Apertura a servizi leggeri | Budget e competenze digitali disomogenei |
| Privacy e controllo dati | Supabase/RLS e app chiusa sono vantaggio | Compliance da chiarire prima di utenti terzi |

### 18.4 Macroeconomic Forces

| Forza | Implicazione |
|---|---|
| Budget associativi piccoli | Pricing deve essere sobrio e giustificato |
| Costi infrastrutturali bassi in fase iniziale | Non usare hosting come argomento principale di prezzo |
| Tempo founder scarso | La quota deve coprire lavoro ricorrente o il progetto non regge |
| Fiscalita' italiana su piccoli incassi | Forma di pagamento va chiarita prima della proposta |

### 18.5 Falsificazione

| Rischio | Segnale precoce | Mitigazione |
|---|---|---|
| Novelty effect | Uso alto settimana 1, crollo settimana 3 | Misurare 60-90 giorni |
| Maestro non promuove | Allievi non completano onboarding | Scegliere referenti convinti |
| Troppo supporto | Molti problemi login/device | Migliorare onboarding, FAQ, referenti |
| Contenuti non autorizzati | Dubbi su proprieta' video | Chiarire prima del pilota pubblico |
| Pagatore assente | Tutti apprezzano, nessuno decide | Identificare decisore prima del pilota |
| Scope creep | Richieste admin/billing/chat | Proteggere posizionamento pedagogico |
| Uso solo consultazione | Pochi log, molti video view | Valutare pivot a biblioteca esame |

---

## 19. Roadmap Business

### 19.1 Prossime 2 settimane

- definire lista intervistati;
- preparare script interviste;
- scegliere 1-2 maestri sponsor;
- chiarire stato contenuti video;
- definire metriche pilota;
- aggiornare costi vivi da fonti ufficiali.

### 19.2 Prossimi 30 giorni

- condurre interviste;
- completare eventuali fix onboarding;
- scegliere gruppo pilota;
- creare baseline uso attuale;
- definire report template.

### 19.3 Prossimi 90 giorni

- eseguire pilota;
- leggere dati settimanali;
- raccogliere feedback;
- produrre report;
- proporre modello economico.

### 19.4 Dopo il pilota

Decisione:

- continuare come federazione;
- continuare come scuola;
- ridurre scope;
- cambiare segmento;
- mettere in pausa.

---

## 20. Template Report Pilota

### 20.1 Dati quantitativi

| Metrica | Valore | Lettura |
|---|---:|---|
| Allievi invitati | TBD | Dimensione pilota |
| Onboarding completati | TBD | Frizione iniziale |
| Utenti attivi settimana 2 | TBD | Superamento curiosita' |
| Utenti attivi settimana 6 | TBD | Retention iniziale |
| Sessioni completate | TBD | Valore d'uso |
| Giorni medi di pratica per attivo | TBD | Continuita' |
| Reminder attivati | TBD | Intenzione di abitudine |
| Richieste supporto | TBD | Costo operativo |

### 20.2 Dati qualitativi

- cosa e' stato utile;
- cosa ha creato confusione;
- cosa manca davvero;
- cosa e' superfluo;
- cosa il maestro ha osservato;
- cosa servirebbe per estendere.

### 20.3 Decisione proposta

Scrivere una sola raccomandazione:

- "Estendere a tutta la federazione";
- "Continuare con 2 scuole paganti";
- "Fare secondo pilota con onboarding corretto";
- "Fermare per mancanza di uso";
- "Pivot a libreria esame".

---

## 21. Checklist prima di parlare di prezzo

Non discutere prezzo finale se mancano:

- dati uso pilota;
- referente decisionale;
- autorizzazione contenuti;
- perimetro utenti;
- stima ore founder;
- costi tecnici aggiornati;
- forma fiscale possibile;
- responsabilita' privacy;
- criterio di rinnovo.

---

## 22. Changelog

| Versione | Data | Cambio |
|---|---|---|
| v0 | 2026-06-04 | Documento creato: BMC dettagliato, metodo scientifico, ipotesi, esperimenti e metriche per Skill Practice. |
| v1 | 2026-06-04 | Evoluto in Business Design System Strategyzer/Osterwalder: quattro lenti, canvas v1, Value Proposition Canvas multi-segmento, Assumptions Map, Evidence Ladder, Test Card, Learning Card, Progress Board e Business Model Environment. |
