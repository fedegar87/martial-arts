# Business Model Canvas - Bozza Operativa

**App:** Skill Practice
**Data:** 2026-06-04
**Status:** bozza v0 da validare con interviste, pilota e dati reali
**Documento metodologico collegato:** `plan/reference/business/business-model-canvas.md`
**Assunzioni e ricerca mercato:** `plan/reference/business/business-model-canvas-assumption-map.md`
**Aggiornamento Sessione 2:** `plan/reference/business/validation-lab/2026-06-10-session-2-where-to-play.md`

---

> Nota 2026-06-11: dopo la Sessione 2 del validation lab e la review critica, il segmento
> iniziale ha due livelli. **V1 grezzo:** scuole strutturate analogiche/frammentate.
> **V2 operativo:** scuole/gruppi con patrimonio tecnico pronto, uso come supporto
> didattico interno, materiali dispersi, maestro sponsor e decision path osservabile.
> **Target strategico futuro:** scuole/federazioni con patrimonio pronto che vogliono
> usare la piattaforma come leva premium, differenziazione, retention o servizio alle
> affiliate. Federazione e scuola restano buyer potenziali, ma la prossima validazione
> parte dal champion operativo.

## 0. Sintesi

Skill Practice e' una PWA per la pratica guidata di arti marziali tradizionali. Il modello piu' coerente oggi non e' B2C puro, ma **B2B2C leggero**:

- gli allievi usano l'app;
- i maestri la abilitano e la rendono credibile;
- scuola o federazione pagano una quota annuale per offrire il servizio agli iscritti.

La tesi da validare e':

> Una scuola o federazione e' disposta a sostenere economicamente Skill Practice se l'app aiuta gli allievi a praticare con piu' continuita', riduce dispersione su programma/video e rende piu' usabile il patrimonio tecnico della scuola.

---

## 0.1 Canvas one-page

Questa sezione e' la versione "post-it" del canvas, modellata sul formato dell'esempio LinkedIn. Ogni voce deve essere breve, autonoma e collocata nella casella giusta.

| Partner Chiave | Attivita' Chiave | Proposte di Valore | Relazioni con i Clienti | Segmenti di Clientela |
|---|---|---|---|---|
| Maestri sponsorizzano adozione | Curare curriculum e video | Organizzazione contenuti didattici | Contatto diretto con scuole/federazioni | Maestri |
| Scuole ospitano pilota | Mappare skill, gradi ed esami | Fruibilita' contenuti sparsi | Allievi portati a bordo dalla scuola | Allievi intermedi |
| Federazione autorizza curriculum | Mantenere app e database | Programma esame consultabile | Maestro introduce l'app | Scuole |
| Proprietari video chiariscono diritti | Onboardare scuole e allievi | Video coerenti con la scuola | Onboarding guidato dal founder | Federazioni |
| Supabase/Vercel erogano infrastruttura | Misurare uso e retention | Allenamento del giorno guidato | Report dati guida rinnovo | Allievi pre-esame, sotto-segmento |
| Commercialista/privacy abilita incassi | Supportare maestri e utenti | Meno link dispersi in chat | Feedback pilota aggiorna modello | Genitori, se minori |

| Risorse Chiave | Canali |
|---|---|
| PWA installabile | Demo al maestro |
| Curriculum strutturato | Invito da scuola/maestro |
| Video tecnici autorizzati | Pilota pre-esame |
| Dati pratica e progressi | Report a scuola/federazione |
| Fiducia dei maestri | Landing come credenziale |
| Tempo founder | Passaparola tra maestri |

| Struttura dei Costi | Flussi di Ricavi |
|---|---|
| Database, hosting, dominio | Licenza uso scuole/federazioni |
| Personalizzazione prodotto | Quota annuale scuola |
| Manutenzione prodotto | Setup fee import curriculum, futuro |
| Curation video/curriculum | Abbonamento allievi, ipotesi futura |
| Supporto utenti/scuole | |
| Privacy, fiscale, legale | |

### Lettura rapida del canvas

| Area | Valutazione |
|---|---|
| Segmenti | Buoni, ma vanno tenuti separati: utente, influencer e pagatore non sono la stessa persona. |
| Valore | Buono: "organizzazione e fruibilita' contenuti didattici altrimenti sparsi e poco gestibili" e' una formulazione chiara. |
| Canali | Coerenti con B2B2C piccolo: demo, maestro sponsor, pilota, report. |
| Ricavi | Coerenti: scuola/federazione paga; evitare B2C in questa fase. |
| Costi | Da non sottostimare: il costo vero e' tempo founder + curation, non hosting. |
| Partner | Corretti, ma manca ancora una verifica formale sui diritti video e sul referente decisionale. |

### Note di qualita' rispetto al canvas LinkedIn

| Criterio | Stato | Nota |
|---|---|---|
| Tutte le 9 caselle presenti | OK | La bozza copre tutte le aree canoniche. |
| Post-it sintetici | OK | Le voci sono brevi, autonome e non richiedono spiegazioni lunghe. |
| Segmenti chiari | Migliorato | Segmento pilota scelto dopo Sessione 2: scuola/gruppo con patrimonio tecnico pronto, supporto didattico interno, materiali dispersi, maestro sponsor e decision path; utenti test = allievi intermedi o pre-esame. |
| Ricavi collegati ai segmenti | Parziale | Il pagatore e' scuola/federazione; va validato con pricing conversation. |
| Value proposition non confusa con feature | OK | Restano centrali "cosa praticare oggi" e "quaderno tecnico digitale". |
| Ipotesi rischiose esplicite | OK | Sezione 10 le rende visibili. |
| Metriche di validazione | Da rafforzare nel pilota | Servono dati: onboarding, retention, sessioni, supporto, willingness to pay. |

### Check dei quattro criteri allegati

| Criterio | Esito | Correzione applicata |
|---|---|---|
| Leggibile da chiunque | Buono | Le voci one-page sono state riscritte come frasi brevi: "Maestro introduce l'app", "Report dati guida rinnovo". |
| Granularita' ottimale | Buono | Il canvas e' sintetico ma non vago. La scelta iniziale e' patrimonio tecnico pronto + supporto didattico interno; il gruppo utenti puo essere intermedio o pre-esame in base al maestro sponsor. |
| Logiche, non sostantivi | Migliorato | Sostantivi generici come "Supabase/Vercel" e "Sviluppo prodotto" sono diventati meccanismi: "erogano infrastruttura", "aggiornare app e bug". |
| Coerente | Buono, ma da validare | I blocchi seguono una logica B2B2C: maestro abilita, allievo usa, scuola/federazione paga. La coerenza economica resta da provare con il pilota. |

---

## 0.2 Mappatura sul template ricevuto

Il template ricevuto usa le stesse 9 aree del Business Model Canvas canonico. Non e' diverso dal canvas compilato qui: cambia solo la disposizione grafica.

| Area del template | Area in questa bozza | Cosa incollare nel template |
|---|---|---|
| Partner Chiave | Partner Chiave | Righe della colonna `Partner Chiave` nel canvas one-page. |
| Attivita' Chiave | Attivita' Chiave | Righe della colonna `Attivita' Chiave`. |
| Risorse Chiave | Risorse Chiave | Tabella `Risorse Chiave`. |
| Proposte di Valore | Proposte di Valore | Righe della colonna `Proposte di Valore`. |
| Relazioni con i Clienti | Relazioni con i Clienti | Righe della colonna `Relazioni con i Clienti`. |
| Canali | Canali | Tabella `Canali`. |
| Segmenti di Clientela | Segmenti di Clientela | Righe della colonna `Segmenti di Clientela`. |
| Struttura dei Costi | Struttura dei Costi | Tabella `Struttura dei Costi`. |
| Flussi di Ricavi | Flussi di Ricavi | Tabella `Flussi di Ricavi`. |

### Ordine consigliato di compilazione

Per il tuo caso non partirei da sinistra a destra. Compilerei cosi':

1. **Segmenti di Clientela**: chiarire utenti, maestri, scuole/federazione.
2. **Proposte di Valore**: una promessa chiara per ciascun segmento.
3. **Canali**: come arrivi a maestri/scuole e come gli allievi entrano.
4. **Relazioni con i Clienti**: chi fa onboarding, supporto e rinnovo.
5. **Flussi di Ricavi**: chi paga e per cosa.
6. **Attivita' Chiave**: cosa devi fare per mantenere la promessa.
7. **Risorse Chiave**: cosa serve per svolgere quelle attivita'.
8. **Partner Chiave**: chi abilita risorse, accesso, fiducia o compliance.
9. **Struttura dei Costi**: cosa costa davvero il modello.

### Nota importante

Nel template ricevuto la casella "Clienti" puo' trarre in inganno. Per Skill Practice ci sono tre ruoli diversi:

| Ruolo | Esempio | Dove metterlo |
|---|---|---|
| Utente | Allievo pre-esame/intermedio | Segmenti di Clientela |
| Influencer/abilitatore | Maestro/istruttore | Segmenti di Clientela e Relazioni |
| Pagatore | Scuola/federazione | Segmenti di Clientela e Flussi di Ricavi |

Non fonderli in un solo post-it: e' il punto piu' importante del tuo modello.

---

## 0.3 Compilazione corrente del template

Questa e' la versione che stai compilando nel canvas fisico/digitale.

### Partner Chiave

Da incollare:

- Maestri sponsor
- Scuole pilota
- Federazione / referente tecnico
- Proprietari video
- YouTube unlisted
- Supabase / Vercel
- Commercialista / privacy-legale

Logica:

- I maestri portano fiducia e adozione.
- Le scuole danno accesso a un gruppo reale di test.
- Federazione/referente tecnico legittima curriculum e contenuti.
- I proprietari video chiariscono i diritti d'uso.
- YouTube evita infrastruttura video proprietaria.
- Supabase/Vercel erogano auth, database, hosting e deploy.
- Commercialista/privacy-legale riducono rischio fiscale, privacy e responsabilita'.

### Attivita' Chiave

Da incollare:

- Curare curriculum e video
- Mappare skill, gradi ed esami
- Mantenere app e database
- Onboardare scuole e allievi
- Misurare uso e retention
- Supportare maestri e utenti
- Preparare report pilota/rinnovo
- Gestire privacy, accessi e contenuti

Logica:

- Per creare l'offerta servono curriculum, video, app, database e accessi.
- Per diffonderla servono demo, onboarding, pilota e report.
- Per fidelizzare servono stabilita', supporto, curriculum aggiornato e dati di utilizzo.

### Proposta di Valore

Versione che hai scelto:

> Organizzazione e fruibilita' contenuti didattici altrimenti sparsi e poco gestibili.

Possibile versione leggermente piu' canvas-like:

> Organizzare e rendere fruibili contenuti didattici sparsi, cosi' allievi e maestri trovano rapidamente cosa praticare e consultare.

Nota: la tua formulazione e' buona. La seconda versione esplicita meglio il meccanismo e il destinatario, ma puoi usare tranquillamente la tua se vuoi tenerla piu' sintetica.

### Segmenti di Clientela

Versione che hai scelto:

- Maestri
- Allievi intermedi
- Scuole
- Federazioni

Nota: e' corretta come lista di stakeholder. Dopo la Sessione 2, pero', il segmento operativo di ingresso va reso piu specifico:

- **Scuole/gruppi con patrimonio tecnico pronto, supporto didattico interno, materiali dispersi, maestro sponsor e decision path** sono l'early adopter da validare.
- **Allievi intermedi/pre-esame** sono gli utenti test.
- **Maestri** sono champion e canale.
- **Scuole/federazioni** sono buyer potenziali dopo evidenze di uso.
- **Scuole/federazioni con patrimonio pronto e logica strategica/commerciale** sono un target futuro per monetizzazione, differenziazione o servizio alle affiliate.

Per precisione di modello:

- **Allievi intermedi** sono gli utenti principali.
- **Maestri** sono influencer/abilitatori.
- **Scuole** e **federazioni** sono i pagatori piu' probabili.
- Gli **allievi pre-esame** possono essere un sotto-segmento degli allievi intermedi, utile per il primo pilota.

### Relazioni con i Clienti

Versione che hai scelto:

> Serve contatto diretto in una fase iniziale lato scuole e federazioni. Allievi portati a bordo dalla scuola.

Lettura operativa:

- Con **scuole e federazioni** la relazione e' diretta, personale e inizialmente high-touch.
- Con i **maestri** la relazione e' co-creativa: servono feedback, fiducia e validazione didattica.
- Con gli **allievi** la relazione e' mediata dalla scuola: non arrivano tramite marketing pubblico, ma tramite invito o indicazione del maestro.
- Nel tempo alcune parti possono diventare piu' automatiche, ma non nella fase iniziale.

### Struttura dei Costi

Versione che hai scritto:

> Database e personalizzazione prodotto.

Valutazione:

- Ha senso come post-it sintetico: database e personalizzazione sono due costi reali.
- E' pero' un po' riduttivo: il costo principale non sara' solo il database, ma il tempo di adattamento, manutenzione, supporto e gestione contenuti.

Versione consigliata se hai spazio:

> Database, hosting e personalizzazione prodotto.

Versione ancora piu' precisa:

> Database/hosting, personalizzazione curriculum, manutenzione e supporto.

Nota: per il canvas finale puoi lasciare la tua versione se vuoi restare molto sintetico. Se puoi aggiungere un secondo post-it, metterei almeno **manutenzione e supporto**.

### Flussi di Ricavi

Versione che hai scritto:

> Due pilastri: scuole e allievi. Abbonamento per allievi e licenza uso per scuole??

Valutazione:

- Ha senso come ipotesi di lungo periodo: scuole/federazioni pagano per l'accesso organizzativo, allievi potrebbero pagare per valore individuale.
- Pero' e' piu' complesso del necessario per la fase iniziale: pagamenti individuali significano billing, burocrazia, supporto, fiscalita' e potenziale attrito politico sui contenuti.
- Per il primo pilota terrei **licenza scuola/federazione** come pilastro principale e segnerei **abbonamento allievi** come ipotesi futura, non come modello da implementare subito.

Versione consigliata per il post-it:

> Licenza uso per scuole/federazioni. Abbonamento allievi come ipotesi futura.

Versione ancora piu' prudente:

> Scuole/federazioni pagano licenza o quota annuale; allievi inclusi.

---

## 1. Customer Segments

### Segmenti principali

| Segmento | Ruolo | Priorita' | Bisogno principale |
|---|---|---:|---|
| Maestri sponsor | Champion e canale | Molto alta | Rendere gli allievi piu' autonomi senza creare nuovo lavoro |
| Allievi intermedi | Utenti finali | Molto alta | Sapere cosa praticare tra una lezione e l'altra |
| Scuole/gruppi con patrimonio tecnico pronto, supporto didattico interno e materiali dispersi | Early adopter operativo | Molto alta | Rendere usabili curriculum e materiali gia esistenti senza adottare un gestionale pesante |
| Scuole/federazioni con patrimonio pronto e logica strategica/commerciale | Target strategico futuro | Media ora, alta dopo evidenze | Trasformare il patrimonio tecnico in servizio, differenziazione, retention o accesso premium |
| Scuole | Cliente pagatore possibile | Alta | Offrire un supporto digitale ai propri allievi |
| Federazioni | Cliente pagatore ideale | Alta ma piu' lenta | Preservare e distribuire il curriculum in modo coerente |
| Allievi pre-esame | Sotto-segmento degli allievi intermedi | Molto alta per il pilota | Avere programma, video e checklist chiari |

### Segmento iniziale consigliato

Partire da una scuola/gruppo con patrimonio tecnico pronto, uso come supporto didattico interno e materiali dispersi, cioe':

- curriculum stabile per almeno un livello/esame;
- 5-10 contenuti gia usabili o facilmente ordinabili;
- frizione osservabile: WhatsApp, Drive, quaderni, video, memoria o domande ripetitive;
- 1 maestro sponsor disposto ad agire, non solo interessato;
- decision path esplicito: il champion decide o puo raggiungere chi decide;
- setup iniziale sostenibile in <= 2-3 ore lato maestro.

Non partire da pubblico generico online, da federazione intera senza sponsor locale, da scuole senza curriculum/materiali gia pronti o da lead senza autorizzazioni minime sui contenuti.

### Ipotesi da validare

- Gli allievi intermedi hanno abbastanza materiale da rendere utile una guida.
- Gli allievi pre-esame hanno il pain piu' urgente.
- I maestri sono disposti a raccomandare l'app e integrarla nel modo in cui guidano gli allievi.
- Le scuole/gruppi con patrimonio tecnico pronto, uso didattico interno e materiali dispersi sentono la frammentazione dei materiali come problema concreto.
- Il setup contenuti iniziale resta sostenibile se il curriculum e i materiali esistono gia.
- Il maestro sponsor ha prontezza all'azione e un decision path chiaro.
- La scuola distingue supporto didattico interno da possibile leva strategica/commerciale.
- Il pagatore reale e' scuola/federazione, non l'allievo singolo.

---

## 2. Value Propositions

### Versione principale

> Organizzazione e fruibilita' contenuti didattici altrimenti sparsi e poco gestibili.

Questa e' la formulazione corrente scelta per il template.

Lettura operativa:

- i contenuti esistono gia', ma sono dispersi;
- il valore non e' "creare contenuti", ma renderli ordinati, accessibili e usabili;
- il problema riguarda sia gli allievi che cercano cosa praticare, sia i maestri che vogliono evitare link e indicazioni sparse;
- la scuola/federazione ottiene un modo piu' gestibile per valorizzare il patrimonio didattico.

### Proposta per l'allievo

> "Apro il telefono e so cosa praticare oggi, con i video e il programma della mia scuola."

Valore:

- riduce incertezza;
- evita video sbagliati o link dispersi;
- aiuta a mantenere continuita';
- rende piu' chiaro il programma d'esame;
- da' un piccolo senso di progresso.

### Proposta per il maestro

> "Gli allievi hanno un riferimento ordinato e praticano con piu' direzione, senza che io debba rimandare sempre gli stessi link."

Valore:

- meno dispersione su WhatsApp/YouTube;
- programma tecnico piu' chiaro;
- supporto tra una lezione e l'altra;
- recupero piu' semplice dopo assenze;
- possibilita' di orientare la pratica autonoma.

### Proposta per scuola/federazione

> "Un quaderno tecnico digitale per valorizzare il curriculum e offrire un servizio moderno agli iscritti."

Valore:

- preserva patrimonio tecnico;
- aumenta coerenza didattica;
- offre un servizio percepibile agli iscritti;
- non richiede app store o gestionale complesso;
- puo' partire con costi tecnici bassi.

### Cosa non promettere

- Non sostituisce il maestro.
- Non garantisce il superamento dell'esame.
- Non e' un gestionale palestra.
- Non e' una piattaforma pubblica di corsi.
- Non monetizza direttamente i contenuti tecnici della federazione.

---

## 3. Channels

### Canali di acquisizione

| Canale | Uso | Priorita' |
|---|---|---:|
| Demo diretta al maestro | Primo aggancio e fiducia | Molto alta |
| Pilota con gruppo reale | Validazione comportamentale | Molto alta |
| Report dati post-pilota | Discussione con scuola/federazione | Molto alta |
| Riunione scuola/federazione | Decisione economica | Alta |
| Landing pubblica | Supporto reputazionale | Media |
| Passaparola tra maestri | Espansione controllata | Media |

### Canali da evitare ora

- Ads consumer.
- App store come canale principale.
- SEO generico "impara kung fu online".
- Freemium pubblico.
- Marketplace contenuti.

Motivo: portano verso un modello B2C fuori fuoco.

---

## 4. Customer Relationships

### Versione principale

> Serve contatto diretto in una fase iniziale lato scuole e federazioni. Allievi portati a bordo dalla scuola.

### Relazione iniziale

La relazione corretta con scuole e federazioni e' **diretta, high-touch e fiduciaria**:

- contatto diretto con scuola/federazione;
- onboarding manuale dei primi gruppi;
- supporto diretto al maestro/referente;
- raccolta feedback;
- report periodico;
- correzioni rapide durante pilota.

### Relazione con allievi

Deve essere leggera:

- invito o indicazione da parte della scuola/maestro;
- app semplice;
- reminder opt-in;
- nessuna chat;
- nessuna community;
- nessun customer support pesante.

### Rischio

Se ogni allievo scrive direttamente al founder per ogni problema, il modello non scala.

Contromisura:

- referente scuola;
- FAQ minima;
- istruzioni onboarding;
- logging dei problemi ricorrenti.

---

## 5. Revenue Streams

### Versione emersa nel template

> Due pilastri: scuole e allievi. Abbonamento per allievi e licenza uso per scuole.

Questa ipotesi e' comprensibile, ma va trattata come **scenario a due livelli**, non come scelta automatica.

Lettura:

- **Licenza uso per scuole/federazioni**: modello piu' semplice e coerente per partire.
- **Abbonamento allievi**: possibile in futuro, ma introduce molta complessita' operativa e fiscale.

### Modello raccomandato

**Quota annuale pagata da federazione o scuola.**

Possibile progressione:

| Fase | Modello | Ricavo |
|---|---|---:|
| Pilota 60-90 giorni | Gratuito, misurato | 0 |
| Anno fondatori | Quota federazione/scuola leggera | Da definire |
| Regime | Quota annuale proporzionata ad adozione e lavoro ricorrente | Da validare |

### Alternative

| Modello | Valutazione |
|---|---|
| Quota scuola singola | Buon fallback se federazione non decide |
| Setup fee per import curriculum | Sensata se si lavora con nuove scuole |
| Supporter link volontario | Possibile, ma marginale |
| Abbonamento individuale allievi | Ipotesi futura, sconsigliata nella fase iniziale |
| Freemium / premium feature | Sconsigliato ora |
| Ads | Da evitare |

### Cosa validare

- Chi paga davvero?
- Quale processo serve per approvare?
- Quale importo e' accettabile?
- La quota copre almeno tempo founder + costi vivi?
- Il pagamento riguarda software, servizio, curation o tutti e tre?

---

## 6. Key Resources

### Risorse chiave

| Risorsa | Perche' conta |
|---|---|
| Codebase PWA | Prodotto gia' funzionante e installabile |
| Supabase Auth/Postgres/RLS | Base multi-utente e dati protetti |
| Curriculum strutturato | Asset centrale e differenziante |
| Video tecnici | Riferimento visivo utile agli allievi |
| Relazione con maestri | Necessaria per adozione |
| Credibilita' nel contesto | Riduce frizione politica |
| Tempo founder | Risorsa critica per manutenzione, supporto e curation |

### Risorsa piu' difendibile

Non e' il codice da solo. E' la combinazione:

> curriculum strutturato + contenuti della scuola + fiducia dei maestri + prodotto mobile semplice.

---

## 7. Key Activities

### Attivita' principali

| Attivita' | Frequenza | Note |
|---|---|---|
| Curare curriculum e video | Ricorrente | Link, mapping, note, ordine |
| Mappare skill, gradi ed esami | A ogni cambio programma | Serve per rendere navigabile il curriculum |
| Mantenere app e database | Continua | Bug, sicurezza, compatibilita', dati |
| Onboardare scuole e allievi | A ogni nuovo gruppo | All'inizio manuale |
| Misurare uso e retention | Settimanale nel pilota | Serve per decidere e fare report |
| Supportare maestri e utenti | Durante uso reale | Da misurare per capire sostenibilita' |
| Preparare report pilota/rinnovo | Fine pilota e rinnovi | Serve per scuola/federazione |
| Gestire privacy, accessi e contenuti | Continua | Riduce rischio legale e operativo |

### Attivita' da non fare ora

- Billing in-app.
- CRM palestra.
- Chat.
- Marketplace.
- Upload video self-service.
- Admin multi-ruolo complesso prima del bisogno.

---

## 8. Key Partnerships

### Partner necessari

| Partner | Ruolo |
|---|---|
| Maestri sponsor | Portano fiducia, adozione e feedback didattico |
| Scuole pilota | Offrono accesso ad allievi e contesto reale di test |
| Federazione / referente tecnico | Legittima curriculum, programma e contenuti |
| Proprietari video | Chiariscono diritti d'uso e distribuzione |
| YouTube unlisted | Offre hosting video senza infrastruttura proprietaria |
| Supabase / Vercel | Erogano auth, database, hosting e deploy |
| Commercialista / privacy-legale | Inquadrano incassi, privacy e responsabilita' |

### Partner non necessari ora

- Payment provider.
- Agenzia marketing.
- App store consultant.
- Piattaforme LMS.
- Provider video proprietario.

---

## 9. Cost Structure

### Costi diretti

| Voce | Peso attuale | Nota |
|---|---|---|
| Hosting Vercel | Basso | Da verificare al momento della proposta |
| Supabase | Basso in pilota | Da monitorare se utenti crescono |
| Dominio | Basso | Utile per credibilita' |
| Privacy/legale | Medio | Necessario prima di apertura reale |
| Fiscalita'/amministrazione | Medio | Dipende dal modello di incasso |

### Costi indiretti

| Voce | Peso | Nota |
|---|---|---|
| Tempo founder | Alto | Costo principale |
| Supporto utenti | Da scoprire | Va misurato nel pilota |
| Curation curriculum/video | Medio-alto | Puo' crescere nel tempo |
| Coordinamento con maestri | Medio | Non e' codice, ma pesa |
| Manutenzione prodotto | Medio | Continuita' del servizio |

### Principio di pricing

Il prezzo non deve coprire solo l'infrastruttura. Deve coprire:

- costi vivi;
- tempo di manutenzione;
- curation contenuti;
- supporto;
- responsabilita' di continuita'.

---

## 10. Ipotesi piu' rischiose

| Ipotesi | Tipo rischio | Test |
|---|---|---|
| Gli allievi usano l'app oltre la curiosita' iniziale | Desirability | Pilota 60-90 giorni |
| I maestri la raccomandano davvero | Channel / Relationship | Maestro sponsor e osservazione uso |
| Scuola/federazione paga | Viability | Pricing conversation dopo report |
| I contenuti video sono autorizzabili | Feasibility / Legal | Check con referente |
| Supporto e curation sono sostenibili | Feasibility | Timesheet + log supporto |

### Cosa deve essere vero perche' tutto funzioni

Seguendo la logica della slide: il modello funziona solo se queste assunzioni sono vere.

| Area del canvas | Questo funziona solo se... | Perche' e' critico | Come lo validiamo |
|---|---|---|---|
| Problema / valore | Maestri e allievi percepiscono i contenuti didattici sparsi come un problema reale, non solo come fastidio minore. | Se il problema non e' prioritario, nessuno cambia abitudine. | Interviste: racconti concreti su link persi, video sbagliati, programma poco chiaro, confusione pre-esame. |
| Segmenti | Le scuole/gruppi con patrimonio tecnico pronto, uso didattico interno e materiali dispersi hanno abbastanza materiali e allievi intermedi/pre-esame da rendere utile uno strumento di pratica autonoma. | Se il segmento e' troppo piccolo o poco motivato, l'uso resta episodico. | Interviste a maestri + 5-15 allievi per scuola; poi pilota misurando onboarding, uso settimana 2 e settimana 6. |
| Caratteristiche cliente | I maestri sono davvero disposti a raccomandare l'app e integrarla nel modo in cui guidano gli allievi. | Senza maestro sponsor gli allievi non entrano o non continuano. | Demo + pilota: osservare se il maestro invita, ricorda, commenta e usa l'app come riferimento. |
| Canale | Gli allievi si fidano del canale scuola/maestro per adottare questo tipo di soluzione. | Se l'invito della scuola non basta, servirebbe marketing B2C molto piu' costoso. | Misurare conversione invito -> onboarding e chiedere agli allievi perche' hanno accettato. |
| Relazione | Scuole e federazioni accettano una relazione diretta e high-touch nella fase iniziale. | Se vogliono self-service completo subito, il prodotto non e' pronto. | Verificare disponibilita' a call, referente, pilota guidato, feedback e report. |
| Ricavi | Scuole o federazioni sono disposte a pagare licenza/quota annuale per un servizio che gli allievi usano senza pagare direttamente. | Se il pagatore resta indefinito, il modello non monetizza. | Pricing conversation dopo report pilota: budget, processo decisionale, soglia di prezzo, tempi. |
| Partner / contenuti | Curriculum e video possono essere usati con autorizzazione chiara. | Se i contenuti non sono autorizzabili, crolla la proposta "contenuti della tua scuola". | Check con referente tecnico/proprietari video prima di estendere il pilota. |
| Costi / fattibilita' | Supporto, curation e manutenzione restano sostenibili rispetto alla quota pagata. | Se il lavoro ricorrente supera il ricavo, il modello non regge. | Timesheet founder + log richieste supporto durante pilota. |

### Assunzioni piu' pericolose

Le tre assunzioni che, se false, fanno collassare il modello sono:

1. **Il maestro non spinge l'adozione.**  
   Senza legittimazione del maestro, il canale scuola non funziona.

2. **Gli allievi non usano l'app dopo la curiosita' iniziale.**  
   Senza uso ricorrente, la scuola/federazione non ha motivo forte per pagare.

3. **Scuola/federazione non vuole pagare una quota/licenza.**  
   Senza pagatore B2B, passare agli abbonamenti individuali cambierebbe complessita', fiscalita' e posizionamento.

---

## 11. Prossimi passi consigliati

1. Identificare 5 maestri/scuole candidate con patrimonio tecnico pronto, supporto didattico interno, materiali dispersi, champion operativo e decision path.
2. Fare 3-5 interviste a maestri/istruttori e 8-10 interviste ad allievi intermedi/pre-esame.
3. Chiarire chi puo' autorizzare video e curriculum per un test reale.
4. Scegliere un primo gruppo con 5-15 allievi e maestro sponsor.
5. Decidere, dopo le interviste, se fare test WhatsApp 14 giorni o mini-pilota app.
6. Misurare onboarding, retention, sessioni completate e problemi supporto.
7. Solo dopo il report discutere quota annuale e forma amministrativa.

---

## 12. Bozza finale in una frase

> Skill Practice e' il quaderno tecnico digitale della scuola: aiuta gli allievi a sapere cosa praticare oggi, aiuta i maestri a dare continuita' tra le lezioni e aiuta scuola/federazione a valorizzare il proprio curriculum con un servizio digitale leggero e sostenibile.
