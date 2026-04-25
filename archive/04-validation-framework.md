# DOPPIO BINARIO: VALIDAZIONE + PRODUCT DESIGN
## Piattaforma di pratica guidata per arti marziali tradizionali

---

# PARTE 1 — ESTRAZIONE DEL CORE

## 1. Problema reale

**Il problema più concreto:** L'allievo di arti marziali tradizionali esce dalla lezione, torna a casa, e non sa esattamente cosa praticare. Ha visto 3-4 cose in lezione. Ne ricorda vagamente 2. Non sa quale ha priorità. Non ha un riferimento visivo affidabile. Pratica male o non pratica affatto. Arriva alla lezione successiva e il maestro deve ripetere.

**Per chi è doloroso:**
- Per l'allievo intermedio (1-3 anni, cinture colorate) che ha accumulato 4-8 forme e non sa come gestirle. Il principiante ha poco da ripassare. L'avanzato ha già il suo sistema. L'intermedio è perso.
- Per il maestro che vede allievi progredire lentamente nonostante le lezioni siano buone. Il collo di bottiglia non è la lezione: è ciò che succede (o non succede) tra le lezioni.
- Per il genitore che paga 50-80€/mese e vorrebbe che il figlio progredisse più velocemente.

**Quando si manifesta:**
- 2-3 settimane prima dell'esame di cintura (panico: "cosa devo sapere?")
- Dopo un'assenza di 2+ settimane (l'allievo è perso)
- Quando l'allievo impara la 4a-5a forma e inizia a confondere le precedenti
- La domenica sera, quando l'allievo pensa "domani ho lezione, cosa dovevo ripassare?"

## 2. Segnale osservabile

Come capisco che il problema esiste nel mondo reale:

- Maestri che mandano video WhatsApp dopo le lezioni (workaround = segnale di bisogno)
- Scuole che hanno pagine web con "home practice resources" e video kata organizzati per livello
- GMAU che ha costruito un intero business B2C sulla strutturazione dello studio a distanza
- Kim's Hapkido che vende DVD/USB per "accelerare il progresso" dei propri studenti locali
- Karate Academy Online che ha una "Skill Drill Library" perché "ogni istruttore sa che la pratica a casa è la chiave"
- Il sensei che diceva "fai ogni kata 3 volte al giorno" e ammette che era noioso e che "solo 1 su 500 arriva alla cintura nera"
- budoo.one che ha creato un "campus" con contenuti per preparazione esami e ha review positive
- Allievi che cercano su YouTube le forme del proprio stile e finiscono a guardare versioni diverse da quella insegnata dal proprio maestro

**Segnale più forte:** I workaround artigianali. Quando la gente costruisce soluzioni improvvisate con strumenti non pensati per quello scopo, il bisogno è reale. Non stai inventando un problema.

## 3. Alternative attuali

| Workaround | Cosa fanno | Dove fallisce |
|------------|------------|---------------|
| **Niente** (il più comune) | L'allievo si affida alla memoria | Dimentica, pratica poco, progredisce lento |
| **WhatsApp** | Il maestro manda video/istruzioni dopo la lezione | Si perde nello scroll. Nessuna organizzazione. Il maestro ripete le stesse cose a chi chiede |
| **YouTube** | L'allievo cerca la forma che deve ripassare | Trova versioni diverse, di altri stili. Il maestro non vuole che guardi "roba sbagliata" |
| **YouTube unlisted del maestro** | Video proprietari condivisi via link | Nessuna struttura. L'allievo deve ricordarsi quali link corrispondono a cosa |
| **Google Drive/cartella** | Il maestro organizza video in cartelle | UX orribile per consultazione rapida. L'allievo non lo apre |
| **PDF/foglio stampato** | Lista di cosa praticare per livello | Statico, generico, non adattato al momento dell'allievo |
| **Memoria + buona volontà** | L'allievo diligente si scrive appunti dopo la lezione | Funziona per il 5% degli allievi ultra-motivati. Non scala |

## 4. Perché NON è già risolto?

Tre ragioni concrete:

**A. I software MA esistenti risolvono un altro problema.** Zen Planner, Kicksite, Wodify risolvono la gestione del business (billing, scheduling, attendance). budoo.one fa lo stesso + aggiunge un campus contenuti. Ma nessuno risolve il problema della pratica quotidiana guidata perché nessuno ha costruito la logica "oggi l'allievo X dovrebbe praticare Y perché Z è la sua priorità."

**B. Il concetto non esiste ancora come categoria.** Non c'è un nome per "sistema di gestione della pratica autonoma tra le lezioni." Non è un LMS (non ci sono corsi). Non è un fitness tracker (non ci sono reps). Non è un gestionale (non c'è billing). È una cosa nuova che sta tra l'insegnamento e la pratica individuale. Quando un concetto non ha nome, nessuno lo cerca, nessuno lo costruisce.

**C. Il maestro tipico non è un product designer.** Il maestro sa che i suoi allievi dovrebbero praticare di più. Ma non sa come strutturare un sistema digitale per guidarli. Sa insegnare kung fu, non sa progettare workflow digitali. Quindi usa WhatsApp perché è l'unica cosa che conosce.

---

# PARTE 2 — DESIGN DEL WORKFLOW (senza tecnologia)

## Il Maestro

**Cosa fa (setup iniziale, una tantum):**
1. Filma le forme/tecniche principali con lo smartphone. Video grezzi, niente editing professionale. Una forma = un video di 2-5 minuti.
2. Decide la struttura: "per la cintura gialla servono queste 3 forme + queste 5 tecniche base."
3. Carica i video e li associa ai livelli.

**Tempo totale setup:** 2-3 ore per il primo livello (cintura bianca → gialla). Poi 30-60 minuti per ogni livello successivo, aggiunto quando serve.

**Cosa fa settimanalmente (5-10 minuti):**
- Aggiorna le priorità per allievo o gruppo: "questa settimana il gruppo cinture verdi si concentra sulla forma 3, ripasso forma 1 e 2."
- Eventualmente aggiunge una nota: "attenzione alla posizione del gomito nel Tan Sao."

**Cosa NON deve fare:**
- Mandare messaggi individuali ogni giorno
- Editare video professionalmente
- Creare piani personalizzati per ogni singolo allievo (troppo lavoro)
- Gestire billing o scheduling (ha già altri tool per quello)

## L'Allievo

**Cosa vede:**
Apre il telefono. Vede una schermata semplice:

```
OGGI — Martedì

📌 FOCUS (nuovo)
Siu Nim Tao — Sezione 3
▶ Video del Maestro (3:22)
Nota: "Concentrati sulla rotazione del polso nel Fak Sao"

🔄 RIPASSO
Tan Sao + Bong Sao (combinazione)
▶ Video del Maestro (1:45)

📋 Questa settimana
□ Lun: Focus + Ripasso ✅
□ Mar: Focus + Ripasso ←oggi
□ Gio: Focus + Ripasso + Forma completa
□ Sab: Forma completa × 3
```

**Quando lo usa:**
- Prima di praticare a casa (3-5 volte a settimana per chi è motivato, 1-2 per la media)
- Per rivedere il video del maestro mentre pratica
- 2 settimane prima dell'esame (intensificazione)

**Perché torna:**
- Sa cosa fare (riduce l'incertezza)
- Vede il video del suo maestro (non di uno sconosciuto)
- Sente di progredire (check "fatto")
- Prima dell'esame diventa essenziale

## Momento chiave: "oggi cosa faccio?"

Questo è il momento zero. L'allievo sta in piedi nel salotto, ha 20 minuti, vuole praticare. Senza il sistema: "boh, faccio un po' di quella forma... quale era? Vabbè, faccio qualche pugno." Con il sistema: "ok, oggi focus sulla sezione 3, poi ripasso del Tan Sao. 20 minuti. Via."

## Momento critico: prima dell'esame

2 settimane prima dell'esame, l'allievo è in ansia. "Cosa devo sapere? Sono pronto?" Senza il sistema: manda 5 messaggi WhatsApp al maestro, che risponde a 3, e l'allievo resta insicuro. Con il sistema: apre la sezione "Prossimo esame", vede la checklist completa, i video di riferimento, e segna cosa ha ripassato.

---

# PARTE 3 — MVP REALE (zero sviluppo)

## Test: "Daily Practice via WhatsApp" — 14 giorni

### 1. Setup minimo

**Tempo maestro:** 1 ora.
- 30 min: scegliere 5-8 video già fatti (o filmare 5 video base con smartphone)
- 15 min: caricarli su YouTube unlisted o Google Drive
- 15 min: scrivere il piano di 2 settimane (cosa praticare ogni giorno)

**Formato del piano (esempio):**

```
SETTIMANA 1
Lun: Focus — Siu Nim Tao sez. 3 [link] + Ripasso — Tan Sao [link] → 15 min
Mar: Focus — Siu Nim Tao sez. 3 [link] + Ripasso — Bong Sao [link] → 15 min
Gio: Siu Nim Tao completa [link] × 2 + Tan/Bong combo [link] → 20 min
Sab: Forma completa × 3 + stretching libero → 20 min

SETTIMANA 2
(evoluzione con aggiunta sezione 4)
```

### 2. Strumenti

- **WhatsApp:** broadcast list o gruppo (non individuale, troppo lavoro)
- **YouTube unlisted** o **Google Drive:** per i video
- **Un foglio Google condiviso** (opzionale): dove gli allievi segnano ✅ quando hanno praticato

### 3. Flusso giornaliero

Ogni mattina alle 7:00 (programmato con WhatsApp Business o inviato manualmente):

```
Buongiorno! 🥋

OGGI — Martedì
📌 FOCUS: Siu Nim Tao sez. 3
▶ [link video — 3 min]
💡 Nota: concentrati sulla rotazione del polso

🔄 RIPASSO: Tan Sao + Bong Sao
▶ [link video — 2 min]

⏱ Tempo totale: 15 minuti

Quando hai finito, rispondi con ✅
```

### 4. Metriche (numeri, non opinioni)

| Metrica | Come misurarla | Soglia buona | Soglia kill |
|---------|----------------|--------------|-------------|
| **Open rate** | Quanti aprono i link video | 50%+ nella settimana 1 | <20% |
| **Completion rate** | Quanti rispondono ✅ | 30%+ per almeno 8/14 giorni | <15% nella settimana 1 |
| **Retention settimana 2** | Quanti continuano a rispondere ✅ nella sett. 2 | Calo <30% rispetto a sett. 1 | Calo >60% |
| **Richiesta di continuare** | Quanti chiedono "possiamo continuare?" alla fine | 3+ allievi su 10 | Zero richieste |
| **Feedback maestro** | Il maestro nota differenza nella preparazione degli allievi | "Sì, arrivano meglio" | "Non vedo differenza" |

### 5. Kill criteria

L'idea è da scartare se:

- Meno del 15% degli allievi risponde ✅ dopo la prima settimana
- Il maestro dice "non ne vale la pena, tanto li vedo in palestra"
- Gli allievi non aprono i link video (controllabile con YouTube analytics)
- Dopo 14 giorni, zero allievi chiedono di continuare
- Il maestro non è disposto a investire 1 ora nel setup

---

# PARTE 4 — PRODUCT BLUEPRINT (solo se il test funziona)

## 1. Entità del sistema

| Entità | Cosa rappresenta | Esempio |
|--------|-----------------|---------|
| **Skill** | Un'unità tecnica insegnabile | "Siu Nim Tao — Sezione 3", "Tan Sao", "Forma del drago" |
| **Video** | Contenuto visivo associato a una skill | Video del maestro che mostra la forma |
| **Stato** | Posizione dell'allievo rispetto a quella skill | Focus / Ripasso / Maintenance / Archivio |
| **Livello** | Raggruppamento di skill per cintura/grado | "Programma cintura gialla" |
| **Sessione** | Piano di pratica per un giorno | "Oggi: Focus X + Ripasso Y — 15 min" |
| **Nota** | Indicazione del maestro su una skill specifica | "Attenzione al gomito", "Più lento" |

Non serve altro. Niente utenti multipli con permessi complessi, niente scheduling, niente billing, niente chat.

## 2. Logica centrale

La logica è semplice. Per ogni allievo (o gruppo), ogni skill ha uno stato:

```
FOCUS      → L'allievo la sta imparando adesso. Appare ogni sessione.
RIPASSO    → L'allievo la conosce ma deve consolidarla. Appare 2-3x/settimana.
MAINTENANCE → L'allievo la padroneggia. Appare 1x/settimana o su richiesta.
ARCHIVIO   → Non serve più attenzione attiva. Consultabile ma non proposta.
```

**Chi gestisce gli stati?** Il maestro, manualmente, con un gesto semplice (swipe, drag, bottone). Non un algoritmo. Non AI. Il maestro sa meglio di qualsiasi algoritmo cosa serve al suo allievo. Il sistema organizza, non decide.

**Critica alla logica:** Questa logica è elegante ma potrebbe essere over-engineered per l'MVP. Se i maestri non ragionano già in questi termini, imporre questo framework potrebbe creare confusione. Per l'MVP, basta: "cosa è prioritario" e "cosa è ripasso." Due stati, non quattro. Espandi dopo se serve.

## 3. Schermata principale dell'allievo

```
┌─────────────────────────────────┐
│  Ciao Marco          Cin. Verde │
│                                 │
│  OGGI — Martedì                │
│                                 │
│  📌 FOCUS                      │
│  Siu Nim Tao — Sez. 3          │
│  ▶ ██████████████████ 3:22     │
│  💡 "Polso fermo nel Fak Sao"  │
│                                 │
│  🔄 RIPASSO                    │
│  Tan Sao + Bong Sao            │
│  ▶ ██████████████████ 1:45     │
│                                 │
│  ────────────────────           │
│  ⏱ ~15 minuti                  │
│  [  ✅ Ho praticato oggi  ]    │
│                                 │
│  📋 Questa settimana  2/4 ✅   │
│                                 │
│  📝 Prossimo esame: 23 giorni  │
└─────────────────────────────────┘
```

Nient'altro. Zero navigazione complessa. Zero menu. L'allievo apre, vede, pratica, segna fatto.

## 4. Flusso maestro

```
1. SETUP (una tantum per livello)
   → Filma video con smartphone
   → Caricali nell'app
   → Associa a un livello (es. "cintura gialla")
   → Nomina ogni skill ("Siu Nim Tao sez. 1", "Tan Sao", ecc.)

2. GESTIONE SETTIMANALE (5 min)
   → Apri il gruppo "cinture verdi"
   → Trascina "Siu Nim Tao sez. 3" in FOCUS
   → Trascina "Forma 1" e "Forma 2" in RIPASSO
   → Aggiungi nota opzionale
   → Salva

3. CONTROLLO (quando vuole)
   → Vede chi ha praticato e quanto
   → Non deve fare niente: i dati sono lì
```

## 5. Cosa ESCLUDERE (lista critica)

| Feature | Perché NO |
|---------|-----------|
| Billing/pagamenti | Zen Planner, Kicksite, budoo.one lo fanno già |
| Scheduling/prenotazioni | Idem |
| Chat/messaggistica | WhatsApp esiste e funziona |
| Libreria esercizi generica | Non è il problema. Il valore è nei contenuti PROPRI |
| Tracking peso/misure/fitness | Non è un fitness tracker |
| Gamification complessa | I budoo points di budoo.one sono carini ma non risolvono il core |
| AI di qualsiasi tipo | Non serve. Il maestro sa cosa serve all'allievo |
| Community/social features | Non è un social network |
| Video editing in-app | Lo smartphone basta |
| Multi-lingua | Non ancora |
| Marketplace | Mai |

---

# PARTE 5 — CRITICA FORZATA

## Perché potrebbe fallire

**1. Il problema è silenzioso, non acuto.** Nessuna scuola chiude perché gli allievi non praticano a casa. Il dropout è graduale e ha mille cause. Il maestro non collega "i miei allievi non usano un'app di pratica" con "perdo studenti." Questo rende il prodotto un "nice to have" mascherato da "need to have."

**2. Gli allievi non sono paganti diretti.** L'allievo riceve il servizio gratis (incluso nella quota scuola). Non ha skin in the game. Se non apre l'app, non perde niente. Il tasso di utilizzo di qualsiasi app "gratuita per l'utente finale" è storicamente basso.

**3. Il maestro di kung fu tradizionale potrebbe rifiutare ideologicamente.** "L'arte si impara in palestra, non sul telefono." Questa obiezione è reale e diffusa. Non tutti i maestri sono aperti alla digitalizzazione. Molti la vedono come una distorsione del rapporto maestro-allievo.

**4. Il setup è comunque lavoro.** Anche con template, anche con federazione, qualcuno deve filmare quei video. E quei video devono essere decenti. Un maestro con 10 allievi che lavora part-time come impiegato non dedicherà il sabato mattina a filmare kata con lo smartphone.

**5. Il differenziatore "focus/maintenance" potrebbe non importare a nessuno.** È elegante come concetto di product design. Ma se il maestro medio pensa in termini di "fai la tua forma 3 volte" e non in termini di "questa skill è in fase di consolidamento," il framework è troppo sofisticato per il mercato.

**6. Rischio "Founder Bias."** Tu pratichi kung fu. Tu senti questo bisogno. Ma tu non sei il mercato. Sei un praticante tech-savvy con interesse per il product design. L'allievo medio di kung fu ha 35 anni, lavora, ha due figli, e pratica 2 volte a settimana perché gli piace, non perché vuole ottimizzare il suo apprendimento motorio.

**7. La federazione potrebbe non essere il buyer ideale.** Le federazioni di arti marziali spesso sono organizzazioni piccole, volontaristiche, con budget limitato e processi decisionali lenti. "La federazione paga" suona bene in teoria. In pratica, ottenere un sì e un pagamento da un'associazione no-profit di kung fu potrebbe richiedere 6-12 mesi di discussioni.

## Cosa stai sopravvalutando

- Il desiderio dei maestri di digitalizzare l'insegnamento
- La frequenza con cui gli allievi praticherebbero davvero a casa
- L'importanza dei "contenuti proprietari" vs "qualsiasi video decente"
- La sofisticazione del framework focus/maintenance per l'utente medio

## Cosa stai ignorando

- Il fatto che molti allievi non VOGLIONO praticare a casa: vanno a lezione per stare con gli altri, muoversi, staccare dal quotidiano. La pratica solitaria non li interessa.
- Il fatto che il video del maestro potrebbe non essere migliore di quello trovato su YouTube. Un maestro di una piccola scuola di kung fu non è necessariamente un bravo comunicatore video.
- Il fatto che il timing dell'app è la mattina (quando l'allievo dovrebbe praticare) ma la motivazione è alla sera (dopo la lezione). C'è un gap motivazionale.

## Cosa succede se gli allievi NON lo usano

Se il test paper mostra che gli allievi non aprono i messaggi o non praticano:

- L'ipotesi "il problema è l'attrito nella pratica autonoma" è falsificata
- Il vero problema potrebbe essere un altro (motivazione, non organizzazione)
- Il prodotto va ripensato radicalmente o abbandonato
- Non vale la pena costruire niente

---

# PARTE 6 — DECISION FRAMEWORK

## GO CONDITIONS (tutte devono essere vere)

1. Nel test paper di 14 giorni, almeno il **30% degli allievi** pratica e risponde ✅ per almeno 8 giorni su 14
2. Almeno **3 allievi su 10** chiedono spontaneamente di continuare dopo il test
3. Il maestro conferma di **notare una differenza** nella preparazione degli allievi
4. Il maestro dichiara che **investirebbe 1-2 ore** per avere questo sistema in forma permanente
5. La **federazione** esprime interesse concreto (non generico "sì bello") a sponsorizzare un pilota su 3+ scuole

## NO-GO CONDITIONS (una qualsiasi è sufficiente)

1. Meno del **15% degli allievi** risponde nella prima settimana
2. Il maestro dice "non ne vale la pena" o "i miei allievi non sono così"
3. Nessun allievo chiede di continuare dopo il test
4. La federazione dice "interessante" ma non si impegna in niente di concreto entro 30 giorni
5. Il setup di 1 ora viene percepito come "troppo"

## ZONA GRIGIA (servono più dati)

Se il test mostra 20-30% di partecipazione: il bisogno esiste ma è debole. Potrebbe funzionare solo per un sotto-segmento (allievi pre-esame). In questo caso, pivot verso un prodotto più stretto: solo preparazione esami, non pratica quotidiana.

## NEXT STEP OPERATIVO — Prossimi 7 giorni

| Giorno | Azione |
|--------|--------|
| **1** | Scegli 10-15 allievi di una scuola (mix di livelli, inclusi 3-4 pre-esame) |
| **1** | Seleziona 5-8 video già esistenti o filmane 5 nuovi (smartphone, niente editing) |
| **2** | Carica su YouTube unlisted. Crea i link. |
| **2** | Scrivi il piano di 14 giorni (4 sessioni/settimana × 2 settimane) |
| **3** | Crea un gruppo WhatsApp "Pratica [nome scuola]" |
| **3** | Manda il primo messaggio: spiegazione + prima sessione |
| **4-10** | Manda il messaggio quotidiano ogni mattina (o pre-programma) |
| **10** | Checkpoint a metà: guarda i numeri. Chi risponde? Chi ha smesso? |
| **11-14** | Seconda settimana. Osserva il calo (o la tenuta). |
| **14** | Manda un messaggio finale: "Questo esperimento finisce oggi. Vi è stato utile? Vorreste continuare?" |
| **15** | Conta i numeri. Decidi. |

**Costo totale: zero euro. Tempo totale: 3-4 ore distribuite su 2 settimane.**

Se dopo 15 giorni i numeri sono sopra soglia: hai la validazione per costruire l'MVP software.
Se i numeri sono sotto soglia: hai risparmiato mesi di sviluppo e migliaia di euro.

Non c'è un next step più efficiente di questo.

---

*Nota finale: tre ricerche desk sono abbastanza. Non ti serve un quarto livello di analisi. Ti serve mandare quel messaggio WhatsApp. I dati che mancano sono nel mondo reale, non in un'altra pagina web.*