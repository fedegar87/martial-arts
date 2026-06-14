# Business Model Canvas - Assumption Map e Ricerca di Mercato

**App:** Skill Practice
**Data:** 2026-06-04
**Status:** desk research + mappa assunzioni v0
**Canvas collegato:** `plan/reference/business/business-model-canvas-draft.md`
**Aggiornamento Sessione 2:** `plan/reference/business/validation-lab/2026-06-10-session-2-where-to-play.md`

---

> Nota 2026-06-11: la Sessione 2 e la review critica hanno prodotto due livelli
> di early adopter. **V1 grezzo:** scuole strutturate analogiche/frammentate.
> **V2 operativo:** scuole/gruppi con patrimonio tecnico pronto, uso come supporto
> didattico interno, materiali dispersi, maestro sponsor e decision path osservabile.
> **Target strategico futuro:** scuole/federazioni con patrimonio pronto che vogliono
> usare la piattaforma come leva premium, differenziazione, retention o servizio alle
> affiliate. Questa mappa resta valida come registro assunzioni, ma le prossime
> validazioni vanno orientate prima sul profilo V2.

## 0. Scopo

Questo documento risponde alla domanda:

> Cosa deve essere vero perche' il Business Model Canvas di Skill Practice funzioni?

L'obiettivo non e' "dimostrare" che il modello funziona. L'obiettivo e':

- mappare le assunzioni critiche attorno ai 9 blocchi del canvas;
- distinguere ipotesi, evidenze e rischi;
- usare desk research per alzare o abbassare la plausibilita' delle ipotesi;
- definire test concreti per validare cio' che la ricerca di mercato non puo' provare.

Regola: la ricerca di mercato puo' rendere un'ipotesi piu' o meno plausibile, ma non sostituisce il comportamento reale di allievi, maestri, scuole e federazioni.

---

## 1. Metodo

### 1.1 Fonti usate

Fonti primarie o quasi-primarie usate:

| Fonte | Perche' serve | Link |
|---|---|---|
| ISTAT, pratica sportiva in Italia | Contesto generale: quanti italiani praticano sport e rapporto con tecnologie | https://www.istat.it/comunicato-stampa/la-pratica-sportiva-in-italia/ |
| CONI, Numeri dello Sport 2023 | Presenza organizzata di federazioni/discipline arti marziali in Italia | https://www.coni.it/images/numeri_dello_sport/2023/CONI-Numeri-Sport-2023.pdf |
| Kicksite | Competitor admin-first con curriculum/belt tracking e pricing | https://kicksite.com/martial-arts-management-software/ |
| budoo.one home | Competitor principale verticale: CRM, app studenti, campus/e-learning, esami, comunicazioni | https://www.budoo.one/ |
| budoo.one Budoobiz | Pagina piu' concreta su campus, gestione scuola e prezzo pubblico | https://budoo.one/site/budoobiz |
| budoo.one AGB | Conferma modello partner/scuola -> utenti finali e contenuti forniti dalla scuola | https://www.budoo.one/site/terms-of-use |
| budoo.one App Store | App studenti reale, contenuti forniti dalla scuola | https://apps.apple.com/de/app/budoo-one/id1549009895 |
| Zen Planner pricing | Benchmark costo admin software per palestre/scuole | https://zenplanner.com/pricing/ |
| Martialytics pricing | Benchmark verticale arti marziali | https://martialytics.com/pricing |
| ClubWorx pricing | Benchmark gestione club/membership | https://www.clubworx.com/pricing |
| Global Martial Arts University | Benchmark B2C contenuti video/online training | https://globalmartialarts.university/ |
| Supabase pricing | Costi backend/Auth/DB | https://supabase.com/pricing |
| Vercel pricing | Costi hosting/deploy | https://vercel.com/pricing |
| Commissione Europea GDPR | Vincoli privacy generali | https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations_it |
| Garante Privacy, basi giuridiche | Vincoli su trattamento dati personali in Italia | https://www.garanteprivacy.it/regolamentoue/basi-giuridiche |

### 1.2 Scala di evidenza

| Livello | Significato |
|---|---|
| Forte | Comportamento reale misurato, pagamento, uso ricorrente, decisione formale |
| Media | Fonte mercato ufficiale, pricing competitor, intervista con episodio concreto |
| Debole | Opinione, interesse dichiarato, plausibilita' teorica |
| Assente | Non abbiamo ancora evidenza |

### 1.3 Scala di rischio

| Rischio | Definizione |
|---|---|
| P0 | Se falsa, il modello cade o cambia radicalmente |
| P1 | Se falsa, serve pivot operativo o di pricing |
| P2 | Se falsa, modifica il piano ma non il modello base |

---

## 2. Sintesi Ricerca di Mercato

### 2.1 Domanda potenziale

Segnali favorevoli:

- In Italia la pratica sportiva e' ampia: ISTAT indica milioni di praticanti sportivi e un rapporto crescente con strumenti digitali/tecnologie.
- Il mondo arti marziali e sport da combattimento ha una base organizzata: il report CONI 2023 mostra numeri rilevanti per federazioni come FIJLKAM e FEDERKOMBAT, con societa' sportive e atleti tesserati.
- Questo suggerisce che esiste un bacino di scuole, istruttori e allievi in discipline tecniche dove curriculum, gradi ed esami sono centrali.

Limite:

- Questi dati non provano che il target specifico FESK/Scuola Chang abbia budget o volonta' di adottare Skill Practice.
- Non provano neanche che gli allievi pratichino a casa.

Assunzione aggiornata:

> Esiste un mercato organizzato di discipline marziali; resta da provare che il problema specifico "contenuti didattici sparsi e poco gestibili" sia prioritario per scuole e allievi.

### 2.2 Competitor e alternative

Cluster competitor:

| Cluster | Esempi | Cosa risolvono | Implicazione per Skill Practice |
|---|---|---|---|
| Admin-first per palestre/scuole | Kicksite, Zen Planner, Martialytics, ClubWorx | Billing, attendance, scheduling, belt tracking, membership | Non competere sul gestionale. Posizionarsi pedagogia-first e complementare. |
| Verticale all-in-one arti marziali | budoo.one | CRM, app studenti, campus/e-learning, esami, eventi, comunicazioni, KPI | Competitor principale serio. Skill Practice deve essere piu' focalizzato, leggero e specifico sul curriculum della scuola/federazione. |
| B2C online training | Global Martial Arts University, app/video training | Imparare da corsi/video online generici | Non competere come corso online pubblico. Valore: contenuti della propria scuola. |
| Workaround gratuiti | WhatsApp, YouTube, Drive, PDF, quaderno | Distribuzione manuale di contenuti | Vero competitor: inerzia e strumenti gia' familiari. |

Segnale importante:

- I software admin-first includono spesso funzioni di curriculum, belt tracking o member app, ma dentro pacchetti piu' ampi e piu' costosi.
- Questo rafforza l'idea che Skill Practice debba evitare billing/CRM e concentrarsi sulla pratica guidata.

Budoo.one cambia il livello competitivo:

- Non e' solo gestionale: la comunicazione pubblica parla di software specifico per scuole di arti marziali, CRM, appuntamenti, esami cintura, organizzazione, campus/e-learning, statistiche e app studenti.
- Il budoo Campus copre gia' una parte vicina alla nostra proposta: contenuti didattici, video, PDF, programmi digitali d'esame e fruizione da parte degli allievi.
- Il modello e' B2B2C: la scuola/partner controlla contenuti e utenti, gli allievi usano app/account.
- Quindi Skill Practice non puo' differenziarsi solo dicendo "organizziamo contenuti": deve differenziarsi su focus, leggerezza, contesto FESK/Scuola Chang e pratica guidata quotidiana.

### 2.3 Pricing benchmark

Pattern da desk research:

- Software admin-first hanno pricing ricorrente mensile, spesso in fasce legate a membri/funzionalita'.
- Budoo.one mostra pubblicamente un pacchetto a 199,90 EUR/mese nella pagina Budoobiz, con 30 giorni di test e setup/training inclusi.
- Per una scuola piccola, questi prezzi possono essere percepiti come alti se l'esigenza e' solo pedagogica.
- Infrastruttura tecnica per Skill Practice puo' partire con costi bassi, ma il costo dominante e' tempo founder: manutenzione, supporto, curation e relazione.

Assunzione aggiornata:

> Una quota/licenza scuola-federazione e' piu' coerente dell'abbonamento individuale in fase iniziale, perche' riduce attrito, billing e conflitti sui contenuti.

### 2.4 Privacy, contenuti e compliance

Segnali:

- Una app con auth, profili, log di pratica e potenzialmente minori tratta dati personali.
- Se vengono usati video o curriculum di scuola/federazione, serve autorizzazione chiara.

Assunzione aggiornata:

> Prima di aprire a utenti terzi reali, bisogna chiarire basi privacy, ruoli, contenuti video e responsabilita'.

---

## 3. Assumption Map per i 9 Blocchi

### 3.1 Segmenti di Clientela

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| CS1 | Maestri, allievi intermedi, scuole e federazioni sono gli stakeholder corretti. | I dati CONI indicano una base organizzata di discipline marziali; il prodotto e' costruito attorno a curriculum/gradi. | P0 | Il modello parla alle persone sbagliate. | 10 interviste allievi + 5 maestri + 1-2 decisori. |
| CS2 | Gli allievi intermedi/pre-esame hanno un pain piu' forte dei principianti. | Coerente con logica di curriculum progressivo, ma non provato da dati esterni. | P0 | L'uso resta basso o episodico. | Pilota su gruppo pre-esame e gruppo intermedio; confrontare retention. |
| CS3 | Maestri sono influencer/abilitatori, non solo utenti. | Nel contesto scuola il maestro controlla fiducia, programma e canale. | P0 | Il canale scuola non porta adozione. | Misurare quanti allievi entrano dopo invito del maestro. |
| CS4 | Scuole/federazioni sono pagatori piu' plausibili degli allievi singoli. | Pricing competitor e complessita' B2C suggeriscono modello B2B/B2B2C. | P0 | Non c'e' ricavo senza passare a B2C. | Pricing conversation post-report con scuola/federazione. |
| CS5 | Il miglior early adopter operativo e' una scuola/gruppo con patrimonio tecnico pronto, uso didattico interno, materiali dispersi, maestro sponsor e decision path. | Emerso dalla Sessione 2 e raffinato con feedback coach: massimo valore iniziale dove esistono curriculum/materiali, la distribuzione e' caotica e l'uso richiesto e' supporto interno, non ancora premium/marketing. | P0 | Si rischia di validare con un target troppo lento, troppo destrutturato o senza sbocco economico. | 3-5 interviste maestri/scuole candidate + verifica gate early adopter. |
| CS6 | Il maestro sponsor ha prontezza all'azione e non solo interesse dichiarato. | Non validato: e' il rischio principale lato canale. | P0 | Il test non parte o resta dipendente dal founder. | Chiedere workaround gia tentati, disponibilita tempo, azioni concrete per invitare/sollecitare allievi. |
| CS7 | Esiste un decision path: il champion ha accesso al buyer o puo decidere il test. | Non validato: utile per evitare test senza sbocco economico. | P0 | Uso positivo ma nessuna decisione di spesa o estensione. | Mappare chi decide, chi paga e come il champion puo portarci il report. |
| CS8 | La scuola distingue supporto didattico interno da leva strategica/commerciale della piattaforma. | Non validato: emerso dal feedback coach come secondo asse piu forte della matrice narrativa. | P0 | Si confondono primo pilota, pricing, premium allievi e white label. | Chiedere se l'accesso digitale sarebbe supporto incluso, servizio premium, elemento di differenziazione o servizio federale. |

### 3.2 Proposta di Valore

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| VP1 | "Organizzazione e fruibilita' contenuti didattici sparsi" e' un problema percepito. | Workaround noti: WhatsApp, YouTube, Drive, PDF/quaderno. Competitor offrono library/curriculum in software piu' ampi. | P0 | La value proposition e' debole. | Interviste: chiedere ultimo episodio di contenuti persi/confusi. |
| VP2 | I contenuti della propria scuola valgono piu' dei corsi B2C generici. | B2C online esiste, ma non sostituisce curriculum locale/esame. | P1 | Il prodotto viene visto come "un'altra libreria video". | Test con allievi: confronto tra video scuola e video generici. |
| VP3 | La funzione "cosa praticare oggi" aumenta valore rispetto a una libreria statica. | Admin software spesso include curriculum, ma non necessariamente pratica guidata quotidiana. | P0 | Skill Practice perde differenziazione. | A/B qualitativo: library-only vs sessione del giorno nel pilota. |
| VP4 | Programma esame consultabile crea valore specifico. | Molti sistemi arti marziali usano gradi/esami; competitor admin hanno belt/curriculum tracking. | P1 | L'uso diventa occasionale. | Misurare uso nelle 2-4 settimane pre-esame. |
| VP5 | Skill Practice e' abbastanza diverso da budoo Campus. | Budoo copre contenuti scuola, app studenti, programmi digitali ed esami. | P0 | Il prodotto sembra un sottoinsieme debole di budoo. | Confronto demo/pitch: chiedere a maestri se preferiscono all-in-one o tool pedagogico leggero. |

### 3.3 Canali

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| CH1 | Il canale iniziale migliore e' maestro/scuola, non marketing pubblico. | Modello B2B2C, contenuti locali e fiducia didattica lo rendono plausibile. | P0 | Servirebbe marketing B2C piu' costoso. | Invito maestro -> tasso onboarding. |
| CH2 | Demo + pilota + report e' canale sufficiente per scuole/federazioni. | Tipico per vendite high-touch in piccoli B2B/associazioni; ma non provato localmente. | P1 | Il ciclo decisionale si blocca. | Tracciare conversione demo -> pilota -> riunione decisionale. |
| CH3 | Landing pubblica serve come credenziale, non come canale principale. | Coerente con prodotto non self-service. | P2 | Poca acquisizione organica. | Chiedere ai maestri se landing aumenta fiducia. |

### 3.4 Relazioni con i Clienti

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| CR1 | Serve contatto diretto iniziale con scuole/federazioni. | Il prodotto richiede fiducia, contenuti, autorizzazioni, onboarding. | P0 | Il modello self-service non e' pronto. | Validare disponibilita' a call, referente, pilota guidato. |
| CR2 | Gli allievi possono essere portati a bordo dalla scuola. | Plausibile nel contesto didattico; da provare. | P0 | Serve acquisizione individuale. | Misurare conversione invito scuola -> onboarding. |
| CR3 | Supporto agli allievi deve rimanere leggero e mediato. | Supporto diretto founder-allievi non scala. | P1 | Costi operativi esplodono. | Log supporto per utente/settimana. |

### 3.5 Flussi di Ricavi

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| RS1 | Licenza/quota per scuole/federazioni e' il modello iniziale migliore. | Competitor vendono ricorrente B2B; B2C allievi e' piu' complesso. | P0 | Ricavi incerti. | Pricing conversation dopo pilota con dati. |
| RS2 | Abbonamento allievi e' solo ipotesi futura. | Billing B2C porta complessita' fiscale, supporto, attrito e potenziale conflitto sui contenuti. | P1 | Se richiesto subito, il modello cambia. | Chiedere a scuole/maestri se preferiscono allievi inclusi o paganti. |
| RS3 | La quota deve coprire tempo founder, non solo database/hosting. | Vercel/Supabase possono essere bassi in pilota; lavoro ricorrente domina. | P0 | Progetto non sostenibile. | Timesheet founder + stima costo annuo. |
| RS4 | Prezzo inferiore e focus pedagogico bastano a essere alternativa a budoo. | Budoo e' piu' caro ma molto piu' completo. | P1 | Le scuole strutturate scelgono all-in-one. | Intervista scuole: "preferiresti tool leggero o gestionale completo?" |

### 3.6 Risorse Chiave

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| KR1 | Curriculum strutturato e video autorizzati sono asset centrali. | Differenziano da B2C generico e workaround. | P0 | Crolla valore "della tua scuola". | Check autorizzazioni e ownership contenuti. |
| KR2 | Fiducia dei maestri e' risorsa chiave quanto il software. | Canale e adozione dipendono dal maestro. | P0 | L'app resta tool isolato. | Maestro sponsor nominato prima del pilota. |
| KR3 | PWA + Supabase/Vercel sono sufficienti per pilota. | Stack attuale supporta auth, DB, PWA; costi official low-tier. | P1 | Serve infrastruttura piu' costosa. | Test tecnico con 10-30 utenti reali. |

### 3.7 Attivita' Chiave

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| KA1 | Curare curriculum/video e mappare skill/esami e' attivita' centrale. | La value proposition e' organizzare contenuti didattici. | P0 | Il prodotto diventa semplice app tecnica senza contenuto. | Misurare ore curation per scuola. |
| KA2 | Misurare uso/retention e preparare report e' necessario per vendere/rinnovare. | Il pagatore B2B ha bisogno di evidenza d'uso. | P1 | Difficile giustificare quota. | Report pilota standard. |
| KA3 | Supporto e onboarding restano gestibili manualmente in fase iniziale. | High-touch e' accettabile in pilota, non a scala. | P1 | Serve automazione/admin. | Log richieste e tempo supporto. |

### 3.8 Partner Chiave

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| KP1 | Maestri sponsor sono partner piu' importanti dei provider tecnici. | Senza fiducia didattica, canale e contenuti non funzionano. | P0 | L'adozione non parte. | Ottenere 1-3 sponsor espliciti. |
| KP2 | Federazione/referente tecnico puo' legittimare curriculum. | Necessario per uso non puramente personale. | P0 | Rischio politico/contenuti. | Verifica formale prima di estensione. |
| KP3 | YouTube unlisted e' accettabile per video. | Riduce costi; gia' coerente col piano tecnico. | P1 | Serve hosting video proprietario. | Verificare accettazione maestri/proprietari video. |
| KP4 | Trasparenza privacy/contenuti puo' diventare vantaggio competitivo. | La conversazione su budoo evidenzia domande aperte su privacy, OpenAI, RCS/Superchat, crittografia e minori. | P1 | Se anche noi siamo opachi, perdiamo fiducia. | Preparare privacy/DPA essenziale prima di utenti terzi. |

### 3.9 Struttura dei Costi

| ID | Assunzione | Evidenza desk | Rischio | Se falsa... | Test |
|---|---|---|---|---|---|
| CSX1 | Database/hosting sono costi reali ma non dominanti in pilota. | Pricing Vercel/Supabase mostra piani low-tier; il tempo founder domina. | P1 | Pricing sbagliato se basato su costi vivi. | Calcolare costi vivi + ore mensili. |
| CSX2 | Personalizzazione prodotto/curriculum pesa piu' del previsto. | Ogni scuola/curriculum richiede mapping e validazione. | P1 | Setup non scalabile. | Timesheet import/mapping per prima scuola. |
| CSX3 | Privacy/fiscale/legale diventano costi se si apre a terzi. | GDPR e incassi richiedono gestione corretta. | P1 | Rischio compliance e amministrativo. | Consulenza prima di utenti paganti. |

---

## 4. Assunzioni P0 da Validare per Prime

| Priorita' | Assunzione | Esperimento minimo | Soglia positiva | Soglia negativa |
|---|---|---|---|---|
| P0-0 | Patrimonio tecnico pronto + supporto didattico interno + materiali dispersi e' il cluster early adopter giusto | 3-5 interviste maestri/scuole candidate usando i gate Sessione 2 | Almeno 2 candidati superano patrimonio pronto, logica di valore, frizione, champion operativo, decision path, setup e autorizzazioni | Nessun candidato accessibile o problema non sentito |
| P0-1 | Il problema contenuti sparsi e' prioritario | 10 interviste allievi + 5 maestri | 7/10 allievi e 3/5 maestri raccontano episodi concreti | Risposte vaghe o "non e' un problema" |
| P0-2 | Maestro spinge adozione | Pilota con maestro sponsor | Maestro invita, ricorda e usa app come riferimento | Maestro non la cita o delega tutto al founder |
| P0-3 | Allievi usano oltre novelty effect | Pilota 60-90 giorni | >25% invitati attivi settimana 6 | <10% invitati attivi settimana 6 |
| P0-4 | Scuola/federazione paga | Report + pricing conversation | Decisore identifica budget/processo | Nessun pagatore o "solo gratis" |
| P0-5 | Video/curriculum autorizzabili | Check con referente/proprietari | Autorizzazione chiara per pilota/uso | Dubbi o stop su contenuti |

---

## 5. Cosa Aggiornare nel Canvas in Base ai Test

| Risultato test | Cambio canvas |
|---|---|
| Usano soprattutto pre-esame | Segmenti: focalizzare "allievi pre-esame"; Value Proposition: "preparazione esame guidata" |
| Usano tutto l'anno | Segmenti: allievi intermedi; Value Proposition: "routine di pratica continua" |
| Maestro non spinge | Canali/Relazioni: rivedere onboarding e ruolo maestro; possibile stop |
| Scuola non paga ma singoli maestri si' | Ricavi: passare da federazione a quota scuola |
| Nessuno paga | Ricavi: modello non validato; evitare sviluppo extra |
| Supporto alto | Costi/Attivita': introdurre FAQ, referente scuola, automazioni |
| Contenuti video bloccati | Partner/Risorse: ridefinire autorizzazioni o cambiare value proposition |

---

## 6. Competitor Principale: budoo.one

### 6.1 Sintesi

Budoo.one va considerato il competitor principale piu' serio, non un gestionale generico.

Posizionamento pubblico:

- software verticale per scuole di arti marziali e sport da combattimento;
- CRM per lead/prove;
- gestione appuntamenti, eventi, presenze, esami e cinture;
- app studenti/genitori;
- campus/e-learning con testi, immagini, PDF e video;
- comunicazioni app/email/WhatsApp/RCS;
- statistiche/KPI;
- formazione staff/collaboratori tramite campus.

### 6.1.1 Verifica diretta fonti pubbliche

Verifica effettuata il 2026-06-04 su fonti pubbliche ufficiali.

Nota metodologica: "confermato" significa che il punto e' presente in fonti pubbliche ufficiali o store pubblici. Non significa che sia stata verificata la qualita' operativa della feature, la sicurezza tecnica interna o il contenuto del contratto B2B.

| Claim | Stato | Fonte |
|---|---|---|
| Budoo e' software specifico per scuole di arti marziali | Confermato | Home pubblica `https://www.budoo.one/` |
| Include CRM, appuntamenti, esami cintura, corsi, presenze, task/checklist, KPI | Confermato come claim pubblico | Home pubblica |
| Include budoo Campus con testi, immagini, PDF, video e programmi digitali d'esame | Confermato | Home + `https://budoo.one/site/budoobiz` |
| App studenti con contenuti, appuntamenti, eventi, messaggi, push, dati contratto/contatto | Confermato | App Store `https://apps.apple.com/us/app/budoo-one/id1549009895` |
| Modello B2B2C: account utente solo se membro/cliente di partner | Confermato | Termini `https://www.budoo.one/site/terms-of-use` |
| Budoo non fornisce contenuti propri: i contenuti arrivano dal partner/scuola | Confermato | Termini |
| Prezzo pubblico 199,90 EUR/mese per Starterpaket | Confermato sulla pagina Budoobiz | `https://budoo.one/site/budoobiz` |
| Google Play dichiara raccolta di dati personali/messaggi e "Data isn't encrypted" | Confermato da listing Google Play pubblico | `https://play.google.com/store/apps/details?id=one.budoo.budoo` |
| Privacy policy cita RCS, OpenAI e Superchat/WhatsApp | Confermato | Privacy `https://budoo.one/site/privacy-policy` |

Nota su Google Play: la voce "Data isn't encrypted" e' una dichiarazione del listing pubblico, non un audit indipendente. Va trattata come red flag da chiarire in demo/contratto, non come prova tecnica conclusiva.

Cosa non e' verificabile senza demo/login/contratto:

- qualita' reale dell'interfaccia admin;
- workflow effettivo di caricamento contenuti e programmi;
- granularita' ruoli/permessi;
- export dati;
- DPA B2B completo e lista sub-responsabili;
- hosting/data residency effettivi;
- se il prezzo reale e' negoziato o diverso dal listino pubblico;
- profondita' reale del campus rispetto a pratica guidata quotidiana.

Implicazione:

> Skill Practice non puo' differenziarsi solo con "contenuti didattici organizzati", perche' budoo copre gia' contenuti e campus. Deve differenziarsi come strumento leggero, pedagogia-first, specifico sul curriculum della scuola/federazione e centrato sulla domanda "cosa praticare oggi?".

### 6.2 Dove budoo e' forte

| Area | Forza budoo | Implicazione per Skill Practice |
|---|---|---|
| Verticalita' arti marziali | Parla di cinture, esami, scuole, genitori, contenuti, app studenti | Non liquidarlo come CRM generico |
| App studenti | Contenuti, messaggi, appuntamenti, esami, eventi | Skill Practice deve essere piu' focalizzata sul training, non solo "app studenti" |
| Campus/e-learning | Video, PDF, programmi digitali, contenuti scuola | La nostra value proposition deve includere guida pratica, non solo archivio |
| All-in-one scuola | CRM, presenze, eventi, KPI, staff | Per scuole strutturate budoo puo' essere piu' attraente |
| Modello B2B2C | Scuola partner -> allievi utenti | Conferma che il nostro modello scuola/federazione -> allievi e' plausibile |

### 6.3 Dove Skill Practice puo' differenziarsi

| Differenziazione | Perche' conta |
|---|---|
| Tool pedagogico leggero | Non tutte le scuole vogliono pagare/gestire un ERP completo |
| Focus su curriculum specifico FESK/Scuola Chang | Budoo e' piattaforma, non contenuto gia' curato per questa realta' |
| "Allenamento del giorno" | Differenzia da library/campus statico |
| Costi e complessita' inferiori | Utile per scuole piccole o federazioni con budget limitato |
| Privacy e governance piu' trasparenti | Possibile vantaggio se budoo solleva dubbi su dati, OpenAI, RCS/WhatsApp, minori |
| Nessun billing/CRM | Scelta intenzionale: complemento, non sostituto gestionale |

### 6.4 Rischi competitivi

| Rischio | Gravita' | Cosa fare |
|---|---|---|
| Budoo ha gia' abbastanza campus/e-learning per coprire il bisogno | Alta | Testare se il bisogno e' "organizzare contenuti" o "guidare pratica quotidiana" |
| Una scuola strutturata preferisce un all-in-one | Alta | Target iniziale: scuole/gruppi con patrimonio pronto ma disperso che vogliono pedagogia, non gestionale |
| Il nostro prezzo basso non basta se budoo promette piu' valore | Media | Vendere focus e semplicitia', non solo prezzo |
| Budoo chiarisce privacy/compliance e diventa piu' rassicurante | Media | Non basare la differenziazione solo su dubbi privacy altrui |
| Budoo aggiunge pratica guidata/SRS | Alta | Rafforzare curriculum specifico, esperienza utente e relazione con maestri |

### 6.5 Domande da fare a maestri/scuole

Queste domande servono a capire se Skill Practice ha spazio accanto o al posto di budoo:

1. "Vi serve un gestionale completo o solo un supporto didattico?"
2. "Oggi il problema principale e' gestione scuola o pratica autonoma degli allievi?"
3. "Paghereste un all-in-one da circa 100-200 EUR/mese se vi servisse soprattutto il campus contenuti?"
4. "Preferireste una app leggera gia' adattata al vostro curriculum, anche se non gestisce CRM/billing/presenze?"
5. "Quanto conta che i video e il programma siano specifici della vostra scuola/federazione?"
6. "Quanto e' importante sapere esattamente dove vanno dati, video, log pratica e dati dei minori?"

### 6.6 Aggiornamento della tesi competitiva

Tesi precedente:

> Skill Practice organizza contenuti didattici sparsi e poco gestibili.

Tesi aggiornata dopo budoo:

> Skill Practice e' una alternativa leggera e pedagogia-first ai sistemi all-in-one: non gestisce la scuola, ma rende praticabile il curriculum della scuola nella routine degli allievi.

Questa tesi e' piu' forte perche':

- riconosce che budoo copre gia' organizzazione contenuti;
- sposta la differenza su pratica guidata, focus e leggerezza;
- evita confronto frontale su CRM, eventi, presenze e KPI;
- lascia spazio a Skill Practice come complemento o come soluzione minima per chi non vuole un ERP.

### 6.7 Scelta strategica: non competere per ampiezza

Budoo.one ha troppe funzionalita' diverse per essere affrontato con una logica di feature parity. Copre CRM, eventi, app studenti, campus, esami, comunicazioni, statistiche e processi scuola. Per Skill Practice sarebbe rischioso inseguire questa ampiezza prima di avere validato il bisogno centrale.

Scelta strategica:

> Fare poco, ma validare molto bene: pratica guidata, curriculum della scuola/federazione, contenuti ordinati e uso reale degli allievi.

Questo implica:

- non aggiungere CRM, billing, presenze, eventi o gestione scuola in questa fase;
- validare prima se gli allievi usano davvero la pratica guidata;
- validare se i maestri la promuovono come parte del percorso;
- validare se scuole/federazioni pagano per un supporto didattico leggero;
- misurare retention, completamento sessioni e uso pre-esame prima di costruire altro;
- usare budoo come benchmark competitivo, non come roadmap da copiare.

Formula di posizionamento:

> Budoo gestisce la scuola; Skill Practice deve aiutare l'allievo a praticare meglio il curriculum della scuola.

---

## 7. Conclusione

La ricerca di mercato rende plausibile il modello, ma non lo valida.

Punti favorevoli:

- esiste un contesto organizzato di discipline marziali;
- i competitor admin-first confermano che curriculum, belt tracking e member app sono aree reali;
- i workaround gratuiti suggeriscono un problema di organizzazione dei contenuti;
- lo stack tecnico ha costi infrastrutturali iniziali gestibili.

Punti non provati:

- urgenza del problema per FESK/scuole specifiche;
- uso ricorrente degli allievi;
- disponibilita' dei maestri a promuovere;
- disponibilita' di scuole/federazioni a pagare;
- autorizzazione formale dei contenuti;
- sostenibilita' del lavoro ricorrente.

Decisione operativa:

> Non costruire nuove feature business-critical prima di validare P0-1, P0-2, P0-3, P0-4 e P0-5.
