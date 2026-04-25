# Analisi Operativa Finale: Vertical Arti Marziali Tradizionali
## Livello 3 — Teardown, JTBD, MVP Design, Interview Scripts

---

## 1. EXECUTIVE SUMMARY

1. **budoo.one è un all-in-one admin-first con un LMS annesso**, non una piattaforma pedagogica. Il suo "campus" è una libreria statica di contenuti organizzata per livello cintura. Non ha logica di pratica quotidiana guidata, né gestione degli stati di apprendimento (focus/maintenance). Il differenziatore è reale, ma più sottile di quanto speravi.

2. **Il pricing di budoo.one è alto: €99.90-199.90/mese.** Questo è un dato critico. Se il tuo prodotto è pedagogia-only (senza admin/billing/scheduling), non puoi competere sullo stesso prezzo. Ma puoi posizionarti come add-on complementare a basso costo, o come alternativa per chi non ha bisogno dell'admin suite.

3. **Il vero job-to-be-done non è "avere un campus" ma "ridurre l'attrito tra lezione e pratica autonoma".** Il maestro vuole che gli allievi arrivino preparati. L'allievo non sa cosa praticare a casa. Il gap è nel "cosa fai oggi", non nel "ecco la libreria dei contenuti."

4. **Il setup burden rimane il killer potenziale.** Senza un modello che riduca drasticamente il lavoro iniziale del maestro (template, pre-configurazione federazione, assistenza), il prodotto morirà nell'adozione. La soglia massima realistica è 2 ore di setup per un maestro non tech-savvy.

5. **La value proposition più forte non è "miglioramento didattico" ma "retention + preparazione esami".** I maestri non si svegliano pensando "devo migliorare la pedagogia". Si svegliano pensando "perché quel ragazzo ha smesso?" e "come faccio a far arrivare pronti agli esami?"

6. **La federazione resta il wedge migliore, ma con un caveat:** se la federazione non è disposta a pre-configurare il curriculum e a sponsorizzare l'adozione, ricadi nel problema della vendita scuola-per-scuola.

7. **Il test paper via WhatsApp per 2 settimane è il singolo next step più efficiente.** Costa zero, richiede 1 ora di preparazione, e genera un segnale forte di validazione.

8. **L'MVP non deve competere con budoo.one sulla suite admin.** Deve essere un tool leggero, pedagogia-only, che può coesistere con qualsiasi software di management la scuola già usa.

9. **Lo scenario "NO GO" si verifica se:** (a) i maestri intervistati non riconoscono il problema come significativo, (b) gli allievi non aprono i contenuti inviati, (c) la federazione non è disposta a investire tempo nel pre-setup.

10. **Verdetto: GO BUT ONLY IF il test paper conferma utilizzo reale da parte degli allievi.** Senza questo segnale, il prodotto rimane un'idea elegante senza trazione.

---

## 2. VERIFICATO vs ANCORA INCERTO

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Esiste un competitor diretto (budoo.one) | ✅ Verificato | GetApp, Capterra, Software Advice, Play Store, App Store |
| budoo.one è admin-first con campus LMS annesso | ✅ Verificato | Feature list dominata da billing/scheduling/CRM; campus descritto come add-on |
| budoo.one è nel mercato DACH primariamente | ✅ Verificato | Review tutte in tedesco, company tedesca (HERZBERG UG) |
| Nessun competitor ha logica focus/maintenance/archive | ✅ Verificato (per quanto cercato) | Nessuna piattaforma menziona questo concetto |
| Il mercato MA è grande (50,000+ scuole USA) | ✅ Verificato | Multiple fonti concordi (MyStudio, Wellyx, industry reports) |
| La pratica a casa è riconosciuta come necessaria | ✅ Verificato | Blog di istruttori, GMAU, Karate Academy Online, articoli multipli |
| Le scuole usano workaround artigianali | ⚠️ Plausibile ma non quantificato | Evidenze aneddotiche (pagine web con video kata, DVD, home study courses) |
| Il pain è abbastanza forte da pagare | ❓ Non verificato | Zero dati diretti sulla willingness to pay per un tool pedagogico-only |
| I maestri avrebbero tempo/voglia di fare setup | ❓ Non verificato | Un reviewer budoo dice "serviva tempo" ma poi "ne è valsa la pena" |
| Gli allievi userebbero davvero l'app quotidianamente | ❓ Non verificato | Nessun dato di utilizzo reale |
| La federazione è disposta a pagare/pre-configurare | ❓ Non verificato | Ipotesi strategica, nessuna evidenza diretta |
| Il focus/maintenance è un differenziatore che conta | ❓ Non verificato | Elegante concettualmente, zero validazione con utenti reali |

**La colonna "non verificato" è più lunga di quella "verificato". Questo è il punto critico.** Hai bisogno di dati dal campo, non di altra ricerca desk.

---

## 3. BUDOO.ONE TEARDOWN

### 3.1 Fatti verificati

**Identità:** HERZBERG UG (haftungsbeschränkt), azienda tedesca. App su iOS e Android.

**Pricing:**
- GetApp: €99.90/mese flat rate
- SoftwareWorld: $199.90/mese (Basic)
- Capterra: "Get Price" (non pubblico standard)
- Contratto minimo: 12 mesi
- App studente: gratuita

**Feature set verificato (da GetApp, Capterra, Software Advice):**
- Member management e CRM
- Billing, invoicing, automated payments
- Class scheduling e attendance (QR code check-in)
- Event management e ticket booking
- Communication (mailcenter in-app, push notifications, WhatsApp, RCS, email)
- Belt ranking classification
- budoo campus (LMS): video, testi, immagini per preparazione esami
- budoo points (gamification)
- Buddy deal (referral)
- Training tools (round timer, interval timer, workout timer)
- Multi-location / franchise / license system support
- API integrations
- AI tools (menzionati ma non dettagliati)
- Digital contracts
- Custom training and grading programs
- Parent accounts
- Staff management con permessi

**Review verificate (3 totali, tutte in tedesco, tutte positive):**
1. "budoo pensa dalla prospettiva di un artista marziale. Processi e flussi specifici per scuole MA."
2. "Sistema nutzerfreundlich nonostante alta densità di funzioni. Anche chi preferiva la carta ora lo usa."
3. "Avevamo bisogno di tempo per inserire i contenuti [nel campus], ma ora sono utilissimi per la preparazione cinture."

**Download/Users:** MWM.ai riporta "0 users" nell'interfaccia, il che probabilmente indica dati non disponibili piuttosto che zero utenti.

### 3.2 Inferenze plausibili

**Posizionamento:** budoo.one è posizionato come "all-in-one" che sostituisce TUTTO il software della scuola (billing, scheduling, CRM, comunicazione, E contenuti). Il campus è un modulo dentro un ecosistema più grande, non il prodotto core.

**Target reale:** Scuole di arti marziali medio-grandi e professionali nel mercato DACH. Il pricing (€99-200/mese + 12 mesi minimo) suggerisce che targetizzano scuole con almeno 100+ studenti e revenue ricorrente significativa.

**Quanto è admin-first vs pedagogy-first:** Chiaramente admin-first. La feature list su GetApp ha 40+ feature elencate; di queste, solo "belt ranking classification" e il campus (non listato come feature separata) riguardano l'aspetto pedagogico. Il 90%+ è gestione business.

**Come tratta il campus:** Il campus è descritto come un luogo dove la scuola carica "video, testi e immagini" e lo studente li consulta "sotto Exam Content." Questo suggerisce un modello libreria statica organizzata per livello/cintura, non un sistema che dice "oggi pratica questo." Lo studente deve navigare attivamente e trovare cosa gli serve.

**Setup burden:** La review "avevamo bisogno di tempo per inserire i contenuti" suggerisce un setup significativo. Il "support per la prima configurazione" menzionato indica che serve assistenza. Il pricing alto probabilmente include onboarding.

### 3.3 Speculazioni (non confermate)

- Non è chiaro se il campus supporti video proprietari caricati dalla scuola o una libreria pre-fornita.
- Non è chiaro se supporti assegnazione di contenuti a specifici studenti o gruppi.
- Non è chiaro quanto sia personalizzabile la struttura del curriculum.
- Non è chiaro se esista tracking di "cosa lo studente ha guardato/praticato."
- Il numero reale di scuole clienti non è pubblico.

### 3.4 Dove è forte / dove è debole

**Forte:**
- Suite all-in-one completa (lo compri e non hai bisogno di altro)
- Specificità MA (non è un fitness tool generico adattato)
- Multi-location/franchise (scala bene per reti di scuole)
- App studente gratuita con buona UX apparente
- Gamification (budoo points)

**Potenzialmente debole:**
- Campus come libreria statica, non sistema di pratica guidata
- Nessuna logica "oggi fai questo"
- Nessun concetto di focus/consolidamento/maintenance
- Pricing alto che esclude scuole piccole/amatoriali
- Solo mercato DACH (opportunità per mercati non serviti: Italia, Spagna, UK, USA)
- Poche review pubbliche (3 su Capterra, 1 su GetApp) = base clienti forse ancora piccola

---

## 4. COMPETITOR COMPARISON (solo ciò che conta)

| Dimensione | budoo.one | Zen Planner | Kicksite | Wodify | Stack WhatsApp/Drive/YouTube |
|------------|-----------|-------------|----------|--------|------------------------------|
| **Core** | All-in-one + campus | Admin + belt tracking | Admin semplice | Performance + content | Nessun costo |
| **Contenuti pedagogici** | Campus (libreria statica per esami) | Zero | Zero | Content sharing generico | Video sparsi, non organizzati |
| **"Oggi fai questo"** | No | No | No | No | Solo se il maestro manda msg manualmente |
| **Focus/maintenance** | No | No | No | No | No |
| **Video proprietari** | Probabile (upload) | No | No | Sì (upload) | YouTube unlisted |
| **Prezzo** | €99-200/mo | $69-199/mo | $49-149/mo | $69-199/mo | €0 |
| **Setup** | Alto (assistito) | Medio | Basso | Medio | Molto basso |
| **Per chi** | Scuola profess. DACH | Scuola USA medio-grande | Scuola piccola USA | Gym/studio performance | Chiunque |
| **Punto di forza** | Specificità MA + campus | Ecosistema maturo | Semplicità | Skill logging | Zero barriera |
| **Punto di debolezza** | Caro, poche review, DACH-only | Zero pedagogia | Zero pedagogia | Non MA-specifico | Zero struttura |

**Conclusione competitiva:** C'è spazio reale per un prodotto che sia SOLO pedagogia, leggero, economico, e che funzioni come complemento a qualsiasi software admin la scuola già usa. Non come sostituto di budoo.one, ma come tool specializzato che budoo.one non copre bene.

---

## 5. JOBS TO BE DONE

### Per il Maestro / Scuola

**JTBD 1:** "Quando i miei allievi vengono a lezione e non ricordano cosa abbiamo fatto la volta scorsa, ho bisogno che abbiano un riferimento chiaro di cosa ripassare a casa, così non perdo 15 minuti ogni lezione a ripetere le stesse cose."

**JTBD 2:** "Quando devo preparare gli allievi all'esame di cintura, ho bisogno di mostrargli esattamente quali forme e tecniche devono ripassare, con i miei video e le mie correzioni, così non mi mandano messaggi WhatsApp chiedendomi dettagli che ho già spiegato."

**JTBD 3:** "Quando un allievo è avanzato e ha accumulato 6-8 forme nel suo repertorio, ho bisogno di gestire quali sono in fase attiva e quali in mantenimento, così l'allievo non trascura le forme vecchie concentrandosi solo sulle nuove."

**JTBD 4:** "Quando un allievo si assenta per settimane e torna, ho bisogno di sapere dove si era fermato e cosa ha ripassato, così posso reinserirlo senza rallentare il gruppo."

### Per la Federazione / Associazione

**JTBD 5:** "Quando voglio garantire uno standard qualitativo uniforme tra le scuole affiliate, ho bisogno che tutti i maestri usino lo stesso curriculum di riferimento con gli stessi contenuti tecnici, così gli allievi che cambiano scuola o partecipano a eventi federali trovano coerenza."

**JTBD 6:** "Quando voglio dimostrare il valore dell'affiliazione alla federazione, ho bisogno di offrire strumenti concreti che le singole scuole non avrebbero da sole, così giustificare la quota federale e ridurre il churn delle scuole affiliate."

### Per l'Allievo Adulto

**JTBD 7:** "Quando sono a casa e voglio praticare, ho bisogno di sapere esattamente cosa fare e per quanto, con il video del mio maestro come riferimento, così non perdo tempo a cercare su YouTube e non rischio di praticare male."

### Per il Genitore

**JTBD 8:** "Quando mio figlio ha l'esame di cintura tra due settimane, ho bisogno di aiutarlo a prepararsi mostrando cosa deve praticare, anche se io non so niente di arti marziali, così non dipendo solo dalle 2 lezioni settimanali."

---

## 6. BUYER / USER / ADMIN / CHAMPION

### Scenario A: Singola scuola medio-grande (50-200 studenti)

| Ruolo | Chi è | Incentivo | Paura | Trigger di acquisto |
|-------|-------|-----------|-------|---------------------|
| **Buyer** | Maestro/Owner | Retention, differenziazione | Costo, complessità, tempo | Perde allievi prima degli esami; allievi impreparati |
| **User** | Allievi + genitori | Progredire, prepararsi esami | App inutile, troppo complessa | Esame in arrivo, bisogno di ripasso |
| **Admin** | Maestro o assistente | Avere sistema ordinato | Setup lungo, manutenzione | — |
| **Champion** | Allievo senior o assistente tech-savvy | Modernizzare la scuola | Resistenza del maestro tradizionale | Frustrazioni con WhatsApp |

### Scenario B: Federazione (5-30 scuole)

| Ruolo | Chi è | Incentivo | Paura | Trigger di acquisto |
|-------|-------|-----------|-------|---------------------|
| **Buyer** | Presidente/Direttore federazione | Valore affiliazione, standardizzazione | Resistenza maestri, costo aggregato | Perdita di scuole affiliate, necessità modernizzazione |
| **User** | Allievi di tutte le scuole | Uguale allo scenario A | Uguale | Uguale |
| **Admin** | Staff federazione + maestri | Centralizzare curriculum | Setup massiccio | — |
| **Champion** | Direttore tecnico della federazione | Qualità insegnamento omogenea | Maestri autonomi che rifiutano | Incoerenza tecnica tra scuole |

**Buyer migliore:** La federazione è il buyer migliore ma solo se il direttore/presidente è il champion. Se il champion deve essere il singolo maestro e il buyer la federazione, c'è un mismatch: chi vuole il prodotto non lo compra, chi lo compra non lo vuole necessariamente. Questo va validato con interviste.

---

## 7. SETUP BURDEN ANALYSIS

### Scomposizione del lavoro iniziale

| Attività | Tempo stimato | Chi lo fa | Comprimibile? |
|----------|---------------|-----------|---------------|
| Filmare video delle forme/tecniche principali (10 forme × 5 min each = 50 min video) | 3-5 ore (incluso setup, errori, ri-riprese) | Maestro | Sì: bastano video smartphone base |
| Tagliare/editare video | 2-3 ore (se fatto minimamente) | Maestro o assistente | Sì: se il sistema accetta video grezzi con trim in-app |
| Caricare e nominare video | 1 ora | Chiunque | Sì: bulk upload + naming automatico |
| Strutturare curriculum (livelli, sequenze, ordine) | 1-2 ore | Maestro | Sì: template pre-configurati per stile |
| Assegnare contenuti a studenti/gruppi | 30 min - 1 ora | Maestro | Sì: assegnazione per livello cintura = automatica |
| Gestire stati focus/maintenance | 15-30 min/settimana ongoing | Maestro | Parzialmente: regole automatiche possibili |
| **TOTALE SETUP INIZIALE** | **8-12 ore** | Maestro + aiuto | — |

### Soglie realistiche

| Soglia | Probabilità di adozione |
|--------|------------------------|
| 20 minuti (sign up + tour) | Alta. Ma non genera valore. |
| 1 ora (curriculum pre-caricato, aggiungere 3 video) | Ragionevole. Il minimo per generare valore immediato. |
| 2 ore (curriculum completo per un livello cintura) | Massimo tollerabile per un maestro motivato. |
| 4+ ore | Solo se c'è assistenza dedicata o è la federazione a farlo. |
| 8-12 ore (setup completo) | Solo con setup centralizzato federazione + supporto. |

### Quando il prodotto muore

Il prodotto muore se:
- Richiede più di 2 ore di setup prima di generare qualsiasi valore per un singolo allievo
- Non ha un "quick win" visibile entro la prima sessione
- Il maestro deve strutturare tutto da zero senza template
- Il processo di upload video è macchinoso (conversione formati, limiti di dimensione, editing obbligatorio)
- Non c'è un modo di iniziare con 3 video e espandere gradualmente

### Come farlo sopravvivere

- Template di curriculum per stile (Shotokan, TKD, Wing Chun, ecc.)
- "Quick start": carica 3 video → assegna a un livello → invita 5 allievi. Fatto in 30 minuti.
- Federazione pre-carica il curriculum base. Il maestro aggiunge solo i propri video.
- Video accettati così come escono dallo smartphone, nessun editing necessario.
- Trim video in-app (seleziona inizio-fine).

---

## 8. VALUE PROPOSITION RANKING

| # | Value Proposition | Target | Forza | Rischio "nice to have" | WTP stimata |
|---|-------------------|--------|-------|----------------------|-------------|
| 1 | **"I tuoi allievi arrivano preparati agli esami"** | Maestro con sistema gradi | ★★★★★ | Basso | €15-25/mo |
| 2 | **"Riduci il dropout: gli allievi che praticano tra le lezioni restano più a lungo"** | Scuola con problema retention | ★★★★ | Medio (difficile da provare) | €15-25/mo |
| 3 | **"Stop alle 50 domande WhatsApp: il riferimento è nell'app"** | Maestro sommerso di messaggi | ★★★★ | Basso | €10-20/mo |
| 4 | **"Dai alla tua scuola un'app professionale con i tuoi contenuti"** | Scuola che vuole prestigio | ★★★ | Alto (vanity metric) | €15-30/mo |
| 5 | **"Standardizza il curriculum di tutte le scuole della federazione"** | Federazione | ★★★★★ | Basso | €100-300/mo (federazione) |
| 6 | **"Aiuta i genitori a far praticare i figli a casa"** | Scuola bambini | ★★★ | Medio | €10-15/mo |
| 7 | **"L'allievo sa sempre cosa praticare oggi, senza chiederti"** | Maestro + allievo | ★★★★ | Medio (richiede logica sofisticata) | €10-20/mo |

**VP #1 (preparazione esami) e VP #5 (standardizzazione federazione) sono le più forti.** Hanno un trigger chiaro (l'esame in arrivo, la necessità di coerenza), un beneficio misurabile, e basso rischio di essere percepite come "nice to have."

VP #7 (pratica quotidiana guidata) è il differenziatore tecnico più forte ma il più difficile da vendere perché il maestro medio non ragiona ancora in quei termini.

---

## 9. TRE CONCEPT MVP

### MVP A: "Exam Ready" — Preparazione esami per federazione

**Target:** Federazione di kung fu (la tua) con 5-10 scuole.
**Problema:** Gli allievi arrivano agli esami di cintura impreparati. I maestri ripetono le stesse istruzioni via WhatsApp.
**Promessa:** "Ogni allievo ha nell'app esattamente cosa deve sapere per il prossimo esame, con i video della federazione."
**Include:** Upload video per livello cintura, lista requisiti per ogni grado, countdown al prossimo esame, check "ho praticato questo."
**NON include:** Pratica quotidiana guidata, focus/maintenance, scheduling, billing, comunicazione.
**Perché è piccolo:** Solo contenuti per esame, organizzati per cintura. Nessuna logica di progressione dinamica.
**Come testare senza sviluppare:** Pagina Notion con video embed (YouTube unlisted) organizzati per cintura, condivisa via link con 20 allievi di 3 scuole. Dopo 1 mese, misura quanti hanno aperto, quanti hanno praticato, quanti maestri hanno ricevuto meno domande WhatsApp.
**Segnale positivo:** 50%+ degli allievi apre i contenuti almeno 2 volte prima dell'esame. I maestri confermano riduzione domande.
**Kill metric:** Meno del 20% apre i contenuti. I maestri dicono "funzionava già abbastanza con WhatsApp."

### MVP B: "Daily Practice" — Pratica guidata tra le lezioni

**Target:** Singola scuola di kung fu/karate con 30-80 allievi adulti.
**Problema:** Gli allievi non sanno cosa praticare a casa. Il maestro non ha modo di guidarli.
**Promessa:** "Ogni giorno l'allievo apre l'app e vede: oggi pratica questo. 20 minuti. Video del tuo maestro."
**Include:** Piano settimanale generato dal maestro, video della scuola, distinzione "focus" (nuovo) vs "ripasso" (vecchio), feedback "fatto/non fatto."
**NON include:** Gamification, billing, scheduling, sistema gradi.
**Perché è piccolo:** Solo piano di pratica + video. Niente admin.
**Come testare senza sviluppare:** WhatsApp broadcast. Ogni mattina il maestro manda un messaggio tipo: "Oggi: Siu Nim Tao sez. 3 (focus) + Tan Sao (ripasso). Video: [link1] [link2]. Fai 20 minuti. Rispondi ✅ quando hai finito." Per 2 settimane.
**Segnale positivo:** 40%+ rispondono ✅ almeno 3 volte nella prima settimana. Allievi chiedono di continuare dopo le 2 settimane.
**Kill metric:** Meno del 15% risponde dopo la prima settimana. Gli allievi ignorano i messaggi.

### MVP C: "School Library" — Libreria video proprietaria semplice

**Target:** Maestro singolo tech-savvy con 20-50 allievi.
**Problema:** Ha già video ma sparsi su YouTube unlisted/Drive. Gli allievi non li trovano.
**Promessa:** "Un posto unico dove i tuoi allievi trovano tutti i tuoi video, organizzati per livello e tecnica."
**Include:** Upload video, organizzazione per categoria/livello, link condivisibile, player semplice.
**NON include:** Piano di pratica, focus/maintenance, assegnazione personalizzata, scheduling.
**Perché è piccolo:** È solo una libreria video organizzata. Nient'altro.
**Come testare senza sviluppare:** Sito statico (Carrd o Google Sites) con video embed organizzati per sezione. Condividi con gli allievi. Misura visite.
**Segnale positivo:** Gli allievi lo usano come riferimento spontaneamente. Il maestro lo cita in lezione.
**Kill metric:** Gli allievi continuano a cercare su YouTube o chiedere via WhatsApp.

**MVP consigliato per partire: MVP B (Daily Practice via WhatsApp).** È il test più rapido (zero sviluppo), valida il differenziatore core (pratica guidata quotidiana), e genera il segnale più forte. Se funziona, hai la base per costruire. Se non funziona, hai risparmiato mesi.

---

## 10. INTERVIEW SCRIPTS

### Script 1 — Maestri / Scuole (30 minuti)

*Obiettivo: capire il workflow attuale, il pain reale, e la disponibilità a investire tempo.*

**Riscaldamento (3 min)**
1. Da quanti anni insegni? Quanti allievi hai?
2. Quante lezioni fai a settimana?

**Pratica tra le lezioni (10 min)**
3. Quando finisce una lezione, dai indicazioni specifiche su cosa praticare a casa?
4. Come le comunichi? (voce in classe, WhatsApp, scritto, niente?)
5. Quanti dei tuoi allievi secondo te praticano davvero tra una lezione e l'altra?
6. Succede che gli allievi arrivino a lezione senza ricordare cosa avete fatto la volta prima?
7. Quanto ti infastidisce questa situazione, da 1 a 10?

**Preparazione esami (5 min)**
8. Come si preparano i tuoi allievi per gli esami di cintura?
9. Hai mai dato loro video o materiali per ripassare? Come?
10. Quanto sei soddisfatto di come arrivano agli esami?

**Contenuti video (5 min)**
11. Hai mai filmato le forme o le tecniche che insegni? Se sì, dove sono quei video?
12. Ti piacerebbe che i tuoi allievi avessero un riferimento video TUO, non di YouTube?
13. Se dovessi filmare le 5 forme principali per i tuoi allievi, quanto tempo ti servirebbe?

**Setup e tecnologia (5 min)**
14. Usi qualche software per gestire la scuola? Quale?
15. Se ti dicessi che esiste un sistema dove carichi 5 video e i tuoi allievi sanno cosa praticare ogni giorno, saresti interessato?
16. Quante ore saresti disposto a investire per configurarlo la prima volta?
17. Quanto saresti disposto a pagare al mese per un tool del genere?

**Chiusura (2 min)**
18. C'è qualcosa che renderebbe la tua vita di maestro molto più facile e che nessun software ti dà oggi?

### Script 2 — Allievi Adulti (20 minuti)

*Obiettivo: capire cosa fanno davvero tra le lezioni, come si preparano, quali frizioni hanno.*

1. Da quanto pratichi? Che cintura hai?
2. Quante volte vai a lezione a settimana?
3. Tra una lezione e l'altra, pratichi qualcosa a casa? Cosa? Quanto spesso?
4. Come decidi cosa praticare? Ti lo dice il maestro? Lo decidi tu?
5. Quando pratichi a casa, usi video? Di chi? Dove li trovi?
6. Ti è mai capitato di non sapere se stai facendo una forma correttamente a casa?
7. Come ti prepari per gli esami di cintura? Quanto prima inizi?
8. Hai mai ricevuto dal maestro un messaggio o un documento con "pratica queste cose"? Come?
9. Se avessi un'app dove ogni giorno trovi "oggi pratica questo" con il video del tuo maestro, la useresti? Quante volte a settimana?
10. Se dovessi scegliere tra: (a) un'app di esercizi generici, (b) un'app con i contenuti specifici della tua scuola, quale preferiresti? Perché?

### Script 3 — Responsabili Federazione (30 minuti)

*Obiettivo: capire il valore strategico, il budget, e gli ostacoli interni.*

1. Quante scuole affiliate ci sono nella federazione? Quanti allievi totali stimati?
2. Esiste un curriculum tecnico condiviso tra le scuole? Quanto è rispettato?
3. Quando un allievo cambia scuola all'interno della federazione, trova coerenza nel programma?
4. Come vengono gestiti gli esami di grado? Sono centralizzati o gestiti dalla singola scuola?
5. La federazione fornisce già materiali didattici alle scuole (video, manuali, guide)?
6. Se la federazione potesse dare a ogni scuola affiliata un sistema digitale per la pratica degli allievi, come lo vedrebbe? Come un valore aggiunto dell'affiliazione?
7. Ci sono maestri nella federazione che resisterebbero a un sistema digitale? Quanti?
8. La federazione sarebbe disposta a pre-configurare un curriculum base con video di riferimento?
9. Quanto tempo/risorse la federazione potrebbe dedicare a un progetto del genere?
10. Se il sistema funzionasse e migliorasse la preparazione degli allievi, la federazione sarebbe disposta a pagare un abbonamento mensile? Orientativamente quanto?

---

## 11. VERDETTO FINALE

### GO BUT ONLY IF…

**Condizioni necessarie:**

1. **Il test paper (MVP B via WhatsApp) mostra che almeno il 30-40% degli allievi praticano seguendo le indicazioni inviate per almeno 2 settimane.** Se questo non succede, il bisogno è teorico, non pratico.

2. **Almeno 3 maestri su 5 intervistati riconoscono il problema come significativo (≥7/10 sulla scala di fastidio) e dichiarano disponibilità a investire almeno 1 ora nel setup.** Se dicono "sì bello" ma non fairebbero niente, è un segnale di "nice to have."

3. **La federazione è disposta a pre-configurare il curriculum base e a sponsorizzare l'adozione in almeno 3 scuole pilota.** Senza questo, ricadi nella vendita scuola-per-scuola che è troppo lenta e costosa.

**Cosa è verificato:** Il gap pedagogico esiste. budoo.one non lo copre bene. Il mercato è grande abbastanza. La pratica a casa è riconosciuta come necessaria.

**Cosa è ancora ipotesi:** Che gli allievi userebbero davvero il sistema. Che i maestri investirebbero tempo nel setup. Che la federazione pagherebbe. Che il differenziatore focus/maintenance conta per gli utenti reali.

**Il singolo next step che riduce di più l'incertezza:** Lancia il test MVP B (WhatsApp daily practice) con 10-15 allievi di una scuola per 2 settimane. Costa zero. Richiede 1 ora di preparazione. Genera dati reali sull'unico punto che conta: gli allievi praticherebbero davvero se guidati?

Se il test funziona, sei in una posizione forte: hai un gap validato, un differenziatore reale, un wedge (federazione), e dati di comportamento reale per presentare ai primi clienti.

Se il test non funziona, hai risparmiato tutto il tempo che avresti speso a costruire un prodotto che nessuno usa.

---

*Nota finale: L'onestà richiede di dire una cosa scomoda. Il rischio più grande di questo progetto non è la competizione di budoo.one o la dimensione del mercato. È che il fondatore, essendo un praticante appassionato di kung fu, potrebbe sopravvalutare il bisogno perché lo sente personalmente come allievo. Il test paper serve anche a questo: separare il bisogno del fondatore dal bisogno del mercato.*