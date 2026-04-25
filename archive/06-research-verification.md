# Ricerca Indipendente di Verifica
## Stress-test dell'analisi precedente con dati freschi (Aprile 2026)

---

## 0. PERCHÉ QUESTO DOCUMENTO

I documenti step1-step4 sono stati prodotti il 30 Marzo 2026. Lo step5 ha definito il brief tecnico per l'MVP. Prima di iniziare lo sviluppo, ho commissionato tre ricerche indipendenti in parallelo per verificare se le conclusioni reggono ancora a un mese di distanza e se l'analisi originale ha mancato qualcosa.

Le tre ricerche sono state condotte senza accesso ai documenti precedenti, per evitare bias di conferma.

**Tre obiettivi:**
1. Deep-dive su budoo.one con dati verificati (pricing, feature, adozione)
2. Scan indipendente del mercato per nuovi entranti 2024-2026
3. Stress-test dei gap dichiarati: cosa ha mancato l'analisi precedente

---

## 1. EXECUTIVE SUMMARY — 7 PUNTI NETTI

1. **budoo.one resta admin-first.** Pricing confermato: €99.90/mo (Basic), €199.90/mo (Complete), 12 mesi minimo. Adozione molto piccola (~10k+ install Play Store, <1.500 scuole stimate, solo DACH, solo tedesco). Zero segnali pubblici di movimento verso skill-state nel 2025-2026. Il positioning "pedagogia-first complemento" è validato.

2. **La premessa "nessuno fa skill-state per MA" è parzialmente invalidata.** Esistono player che l'analisi originale non aveva mappato:
   - **Wing Chun Trainer "At Home"** — competitor diretto sul tuo stile, con voice coaching e daily reminders
   - **dojoHUB** — Kyokushin-specific, home-practice + exam prep
   - **Movements Karate** — Shotokan reference 3D/AR
   - **Athlete Analyzer** — kata video analysis (coach-facing)
   - **Zen Planner** ha shippato un curriculum feature nel Member App (terzo most-requested)

3. **Skill-state come pattern non è inventato.** Chessable, Chessdriller, Listudy fanno spaced repetition su sequenze (aperture = analogo strutturale dei kata). Tonebase Practice Plan fa per-piece progression, weekly templates, reflection per pezzi musicali lunghi (analogo ai kata). Stai portando un pattern noto da musica/scacchi a MA, non inventandolo. Questo indebolisce la differenziazione narrativa ma non la utilità del prodotto.

4. **YouTube embed non supporta loop nativo né slow-motion senza pitch shift.** Il brief Sprint 1 ha un costo nascosto: o si usa YouTube IFrame API con custom controls, o si passa a file MP4 self-hosted. STEEZY ha la UX video di riferimento perché ha costruito player custom.

5. **Founder bias confermato come rischio principale.** App fitness solo: 90% perde utenti in 30 giorni, 95% in 90 giorni. Scuole MA perdono il 50% degli studenti nel primo anno per ragioni motivazionali/community, non per mancanza di struttura di pratica. Il founder pratica già — il prodotto risolve un problema che lui non ha. L'allievo medio che ha bisogno di struttura è lo stesso che non manterrà una tassonomia a 4 stati.

6. **Spaced repetition per skill motorie è scientificamente supportato.** Meta-analisi confermano benefici dello spacing per task motori (badminton, chirurgia, tiro). Decay procedurale reale e misurabile (~6.5 mesi per perdere metà dei guadagni in accuratezza). La premessa pedagogica è solida.

7. **Verdetto operativo:** procedere con MVP personale come da brief step5. Le critiche più dure (founder bias, retention app, video player) riguardano lo scaling B2C, non l'uso personale del founder. Tenere il brief Sprint 1 invariato. Considerare il video player come decisione tecnica da risolvere subito.

---

## 2. BUDOO.ONE — DEEP DIVE VERIFICATO

### 2.1 Dati confermati (aggiornamento al precedente teardown)

| Campo | Valore verificato | Fonte |
|-------|-------------------|-------|
| Entità legale | HERZBERG UG (haftungsbeschränkt) | Sito ufficiale |
| Tier Basic | €99.90/mese | Capterra DE, GetApp |
| Tier Complete | €199.90/mese | Comparison sites |
| Contratto | 12 mesi minimo, rinnovo 6 mesi auto, preavviso 30gg | Sito ufficiale |
| Trial | 30 giorni | Sito ufficiale |
| Lingue | Solo tedesco | Sito ufficiale |
| Mercato | DACH | Tutte le review in tedesco |
| Play Store install | 10,000+ | Google Play |
| Review Capterra DE | 1 (5.0, marzo 2023) | Capterra DE |
| Review Capterra US | 1 | Capterra US |
| Review GetApp | 1 | GetApp |

**Stima scuole paganti:** <1.500 (estrapolato da install studenti / dimensione media scuola).

### 2.2 Campus module — cosa fa e cosa NON fa

**Confermato che fa:**
- Upload custom video da parte della scuola (training videos, theory lessons, assignments)
- Assegnazione contenuti per studente o per gruppo (via budoobiz page)
- Organizzazione per programma esame e media library della scuola
- Belt countdown
- Budoo points (gamification per attendance)

**Non trovato (assente fino a prova contraria):**
- "Today practice this" — nessun daily plan
- Spaced repetition di alcun tipo
- Skill-state lifecycle (focus/review/maintenance/archive)
- Progression tracking oltre il countdown cintura

**Caveat metodologico:** L'assenza nelle pagine pubbliche non è evidenza definitiva di assenza nel prodotto. Una demo bookata sarebbe l'unico modo per confermare al 100%. Ma zero menzioni in marketing copy + zero menzioni in review = inferenza ragionevole che la feature non esista.

### 2.3 Segnali strategici

**Recente attività prodotto:** L'unica feature recente highlighted pubblicamente è il check-in via QR code. Nessun changelog pubblico, nessuna attività LinkedIn/blog 2025-2026 indicizzata che suggerisca movimento verso pedagogia avanzata.

**Difendibilità della tua nicchia:** Alta nel breve. Bassa nel medio. budoo ha le risorse per copiare uno skill-state engine se vede traction. Ma non c'è segnale che lo stiano facendo.

**Competizione di pricing:** budoo è 5-10x più caro di un MVP personale/freemium. Non sei nello stesso budget bucket — non competi sul procurement.

---

## 3. NUOVI PLAYER E SHIFT DI MERCATO (mancati dall'analisi originale)

### 3.1 Competitor diretti non mappati prima

| Player | Focus | Threat level | Note |
|--------|-------|--------------|------|
| **Wing Chun Trainer "At Home"** | Form practice Siu Nim Tao / Chum Kiu / Biu Jee con voice coaching e daily reminders | 🔴 ALTO | Diretto sul TUO stile. Verificare cosa fa esattamente |
| **dojoHUB** | Kyokushin-specific home practice + exam prep | 🟡 MEDIO | Modello single-style replicabile da altre federazioni |
| **Movements Karate** | Shotokan reference 3D/AR | 🟢 BASSO | Reference content, non practice planning |
| **Athlete Analyzer (kata module)** | Video analysis kata, coach-facing | 🟢 BASSO | Coach tool, non student-facing |
| **World Taekwondo AR Textbook** | Federazione spedisce app a studenti | 🟡 MEDIO | Conferma il modello "federazione → studente" |

**Insight:** Il segmento "single-style home practice app" è più popolato di quanto l'analisi originale suggerisse. Wing Chun Trainer è il più allarmante — vale la pena scaricarlo e fare teardown prima di costruire.

### 3.2 Shift incumbent

**Zen Planner ha aggiunto un curriculum feature** nel Member App, dichiarato come "third most-requested feature" dai school owner. Non è skill-state ma è un movimento verso l'area pedagogica che 12 mesi fa non c'era. Da monitorare.

**Wodify, WellnessLiving, Kicksite:** Nessun movimento rilevante 2024-2026.

### 3.3 AI/CV per MA

Solo paper accademici 2025-2026:
- Nature Sci Reports — Shotokan stance analysis via Google ML Kit
- CNN-based kata scoring con accuratezza ~96%
- AiShifu (HRNET pose estimation)

Nessun prodotto consumer credibile ancora. Kemtai resta in physio/fitness, non MA. La tecnologia è vicina ma non shipped.

### 3.4 Reference tools che gli studenti usano oggi

Pattern dominante confermato dai forum (MartialTalk, karate blogs, roundup IT/DE):
- Reference video apps (26 Shotokan Katas, Taekwondo Bible, Taekwondo Poomsae Master con 0.5x/2x speed)
- Generic timer/metronome apps
- YouTube unlisted dei propri maestri
- WhatsApp

**Nessuna evidenza che gli studenti rifiutino la pratica a casa con app.** L'esistenza di download volumi a 5 cifre per app reference conferma domanda. La frammentazione dello stack è confermata come pain reale.

---

## 4. STRESS-TEST DEI GAP DICHIARATI

### 4.1 Gap "nessuno fa skill-state" — RIDIMENSIONATO

**Falso in altri domini:**
- **Chessable, Chessdriller, Chessreps, Listudy**: SRS vero su sequenze multi-mossa (aperture = kata)
- **Tonebase Practice Plan**: per-piece progression, weekly templates, reflection prompts, goal reviews per pezzi classici lunghi
- **Musora Practice Planner**: planner per chitarra/batteria/pianoforte
- **MedBridge GO**: "today's dose" con stima tempo, prescription model

**Vero per MA shipped products:** Nessuno dei competitor MA ha skill-state vero.

**Implicazione:** Stai portando un pattern conosciuto da musica/scacchi/physio a MA. Differenziazione narrativa più onesta: "spaced repetition portato dai musicisti alla pratica marziale" invece di "abbiamo inventato lo skill-state".

### 4.2 Gap "video as attachment vs structural" — VERO MA NON IMPORTA AL UTENTE

L'analisi originale aveva ragione tecnicamente ma sbagliava il punto. L'utente non vuole "structural video", vuole:
- Loop di sezioni (STEEZY)
- Slow-motion senza pitch shift
- A/B markers
- Cambio angolazione

**Costo nascosto per l'MVP:** YouTube embed disabilita il loop. Per avere queste UX servono:
- Opzione A: YouTube IFrame API + custom controls (limitato)
- Opzione B: file MP4 self-hosted con player HTML5 custom (controllo totale, ma costo storage)
- Opzione C: accettare UX degradata nello Sprint 1

Il brief step5 non considera questa scelta. Vale la pena risolverla nello Sprint 1 invece di scoprirla dopo.

### 4.3 Gap "no today practice this" — VERO PER MA

Confermato. Reference video apps non lo fanno. Zen Planner curriculum feature non lo fa (è admin-driven). budoo non lo fa. Resta uno spazio reale.

**Precedente più rilevante:** MedBridge GO ("how much time today's exercises will take") — ma è prescription model in physiotherapy, non self-driven practice.

### 4.4 Critica più dura — FOUNDER BIAS

> "Il prodotto è costruito per un utente (il founder) il cui problema di motivazione è già risolto."

Questa è la critica più seria. I dati la supportano:

| Dato | Valore | Fonte |
|------|--------|-------|
| App fitness che perdono utenti in 30 giorni | 90% | Industry data |
| App fitness che perdono utenti in 90 giorni | 95% | Industry data |
| Studenti MA persi nel primo anno | ~50% | MA retention research |
| Decay procedurale (perdita 50% accuracy) | ~6.5 mesi senza pratica | Meta-analysis |

**Tre implicazioni:**
1. Il MVP single-user per il founder funziona perché il founder ha già motivazione
2. Lo scaling a "altri allievi" colpisce direttamente il muro della retention
3. La leva di retention più forte (community, social bonds) è esplicitamente esclusa dal brief step5

**Per l'MVP personale: irrilevante.** Per qualsiasi scaling futuro: critico.

---

## 5. AGGIORNAMENTI ALLE TABELLE PRECEDENTI

### 5.1 Aggiornamento competitor map (rispetto step3 §4.1)

| Player | Stato precedente | Stato aggiornato |
|--------|------------------|------------------|
| budoo.one | "Competitor diretto" | Confermato. Adozione più piccola del previsto. Pricing confermato alto |
| BudoCode | "Più limitato" | Invariato |
| GMAU | "B2C completo" | Invariato |
| **Wing Chun Trainer "At Home"** | NON MAPPATO | 🔴 Da analizzare urgentemente — diretto sullo stile |
| **dojoHUB** | NON MAPPATO | 🟡 Modello single-style, replicabile da federazioni |
| **Movements Karate** | NON MAPPATO | 🟢 Reference content, basso threat |
| **Athlete Analyzer (kata)** | Marginale | 🟢 Coach-facing, non sovrapposizione |
| Zen Planner | "Zero pedagogia" | Aggiornato: ha curriculum feature dal 2024-2025 |

### 5.2 Aggiornamento value proposition ranking (rispetto step3 §8)

Le VP restano valide ma con caveat:
- **VP #1 (preparazione esami):** ancora la più forte. Confermata da download volumi reference apps
- **VP #5 (federazione):** confermata, World Taekwondo AR Textbook valida il modello
- **VP #7 (pratica quotidiana guidata):** confermato come differenziatore tecnico ma con il rischio motivazionale che l'analisi precedente sottostimava

### 5.3 Aggiornamento decision framework (rispetto step4 §6)

**Aggiungere alle GO conditions:**
- Validare che il video player UX (loop / slow-mo) sia accettabile per il founder come single-user prima di pensare a B2C

**Aggiungere alle NO-GO conditions:**
- Se l'utilizzo personale del founder per 30 giorni cade sotto il 50% delle sessioni pianificate, qualsiasi scaling è prematuro

---

## 6. AZIONI OPERATIVE DA QUESTA RICERCA

### Per lo Sprint 1 dell'MVP (step5)

1. **Decisione video player:** scegliere tra YouTube IFrame API con custom controls vs MP4 self-hosted vs accettare UX degradata. Risolvere prima di iniziare a sviluppare i componenti video
2. **Teardown immediato di Wing Chun Trainer "At Home":** scaricare l'app, capire cosa fa, cosa manca, cosa puoi fare meglio. Tempo: 1 ora
3. **Tenere il brief invariato per il resto:** single-user, focus/review/maintenance/archive, seed data Wing Chun

### Per validazione futura (se si scala oltre uso personale)

4. **Test WhatsApp 14 giorni (step4):** resta il next step più efficiente, ma misurare anche segnali di motivazione/community, non solo open rate
5. **Monitor competitor:**
   - Zen Planner curriculum feature (estensione verso student-side?)
   - Recess.tv ("training content")
   - Wing Chun Trainer "At Home" (evoluzione)
   - dojoHUB (espansione oltre Kyokushin?)
6. **Considerare narrazione:** spostare da "skill-state inventato" a "spaced repetition portato dai musicisti/scacchisti alla pratica marziale" — più onesto, più difendibile, ricollegabile a precedenti scientifici

### Cosa NON fare

7. Non cambiare lo stack del brief step5 sulla base di questa ricerca. È coerente per MVP personale
8. Non aggiungere feature di community/social all'MVP. Sono critiche per retention B2C ma fuori scope per uso personale
9. Non investire ancora in AI/CV per movement analysis. Tecnologia non matura, costo elevato, fuori scope MVP

---

## 7. VERDETTO FINALE

**L'analisi originale (step1-4) regge nei punti chiave:**
- Gap pedagogico nelle MA reale e non servito ✅
- budoo.one admin-first, complementare non sostituibile ✅
- Federazione come wedge plausibile ✅
- Test paper WhatsApp come next step più efficiente ✅

**L'analisi originale era debole su:**
- Mancata mappatura di Wing Chun Trainer "At Home" e dojoHUB ❌
- Sopravvalutazione della novità del pattern skill-state ❌
- Sottovalutazione del costo nascosto del video player ❌
- Sottovalutazione del rischio motivazionale/retention per scaling ❌

**Per l'MVP personale dello step5:** GO senza modifiche al brief, con la sola decisione tecnica del video player da risolvere subito.

**Per qualsiasi scaling futuro:** le critiche sopra vanno integrate prima di scrivere un business plan o pitchare la federazione.

---

*Ricerca indipendente condotta il 25 Aprile 2026 tramite tre agenti paralleli con accesso a web search e fetch diretto, senza accesso ai documenti step1-step5 per evitare bias di conferma. Fonti principali: budoo.one e budoobiz, Capterra DE/US, GetApp, Google Play Store, Apple App Store DE, Zen Planner blog, Tonebase, Chessable/Chessdriller, MedBridge, Nature Scientific Reports, ScienceDirect, MartialTalk, karatemojo.de, karateka.it, World Taekwondo, paper accademici 2025-2026 su pose estimation per kata.*
