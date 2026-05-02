# Strategia di Monetizzazione — Skill Practice

**Data:** 2026-05-02
**Stato:** Definitiva (rivedibile dopo pilota)
**Scope:** Monetizzazione per federazione FESK (~15 scuole, ~200 praticanti). Non strategia per scaling oltre FESK.
**Vincolo guida:** **massimizzare il rapporto entrate/complessità di codice e terze parti.** Ogni opzione che richiede Stripe, feature gating, fatturazione automatica o nuove dipendenze parte con un handicap pesante.

---

## 0. Sintesi in tre righe

1. **Modello scelto:** quota annuale a carico della federazione FESK, scaglionata sull'adozione misurata. Zero feature gating, zero pagamenti in-app, zero terze parti.
2. **Cifra target:** anno-fondatori €1.200/anno (post-pilota); regime €2.400-3.600/anno se l'adozione raggiunge ≥50% dei tesserati attivi.
3. **Prerequisito non negoziabile:** pilota gratuito 90 giorni con 2-3 scuole, report dati, *poi* discussione economica.

---

## 1. Assessment dell'analisi ricevuta dal secondo LLM

L'analisi ricevuta (allegata in §11 per riferimento) è nel complesso solida e raccomanda lo stesso modello "solo federazione paga + supporter link opzionale" che adottiamo qui. Ma ha tre allucinazioni e tre lacune che vanno corrette prima di trattarla come definitiva.

### 1.1 Allucinazioni da correggere

| Cosa ha detto l'LLM | Realtà |
|---|---|
| "FESK = Federazione Europea Scuola Kung Fu" | Inventato. Il codebase ([curriculum-mapping-fesk.md:5](curriculum-mapping-fesk.md#L5)) cita solo il dominio `feskfongttai.it`. L'espansione corretta non è confermata. **Non usare nessuna espansione finché non verificata.** |
| "Maestro Bestetti, patrimonio tecnico del Maestro Bestetti" | Inventato. Nessun nome di maestro è mai stato dichiarato. **Rimuovere ogni riferimento personale dalla comunicazione al direttivo.** |
| "Espansione ad altre federazioni Chang (3-4 organizzazioni in Italia ed Europa)" | Speculativo. "Chang" nel codebase è solo il nome di una tile dell'hub ([hub-page-design.md:228](2026-05-01-hub-page-design.md#L228)) che corrisponde alla libreria. Nessun mercato di "federazioni Chang" è stato verificato. **Tenere come opzione teorica, non come piano.** |

### 1.2 Punti forti da preservare

- **Ricalcolo onesto dei costi vivi**: €0-45/anno (non €590-790). Free tier Vercel + Supabase + GitHub coprono 200 utenti senza pressione tecnica. Vedi §3.
- **Smontaggio chirurgico del freemium B2C**: monetizzare contenuti che non sono di proprietà del founder è politicamente esplosivo, conversioni reali 1-5% (non 20-30%), burocrazia sproporzionata al ricavo. Vedi §5.2.
- **Calcolo ROI premium tier**: 80-120 ore di sviluppo + 5-15 ore/mese manutenzione per €100-300/anno extra = ROI orribile. Vedi §5.3.
- **Roadmap con stop signals espliciti**: pilota 90gg → fondatori → regime, con metriche di abbandono. Vedi §7.
- **Email al direttivo sobria, da praticante non da venditore.** Vedi §9 (versione corretta dalle allucinazioni).

### 1.3 Lacune da colmare

| Lacuna | Perché conta | Dove la copriamo |
|---|---|---|
| Zero analisi fiscale italiana per ricevere €1.200-3.600/anno | È la prima cosa concreta da risolvere. Senza inquadramento corretto la federazione non sa nemmeno che modulo emettere. | §6 |
| Nessuna opzione "single school" come fallback | Se la federazione tergiversa ma 2-3 maestri vogliono pagare individualmente, è fattibile a complessità zero. | §5.4 |
| Costo curation contenuti non quantificato | Caricare video YouTube unlisted, mantenere sincronia con cambi di programma esame, gestire richieste maestri = ore/mese reali. È la voce più sottostimata del lavoro ricorrente. | §8 |

---

## 2. Cosa stiamo monetizzando, esattamente

Per evitare ambiguità con il direttivo: la federazione non paga "una app". Paga **un servizio digitale federale** che include:

| Componente | Cosa è | Cosa costa al founder |
|---|---|---|
| **Piattaforma software** | PWA installabile, hosting, database, auth | Tempo manutenzione + free tier hosting |
| **Curation contenuti** | Caricamento e organizzazione video YouTube, mantenimento mappatura programmi esame | Ore ricorrenti (vedi §8) |
| **Supporto agli utenti** | Risposte a problemi tecnici di praticanti e maestri | Ore ricorrenti |
| **Sviluppo evolutivo** | Nuove feature richieste dal direttivo o dai maestri | Ore variabili per sprint |
| **Continuità** | Garanzia che l'app non sparisca a 6 mesi | Costo opportunità + impegno personale |

Quello che la federazione **non paga** (esplicito):
- Possesso del codice (resta del founder)
- Possesso dei contenuti video (restano del relativo proprietario, tipicamente la federazione/scuola)
- Esclusiva: il founder può, in futuro, proporre l'app ad altre realtà se la cosa è coerente

Questa distinzione è importante perché:
- Toglie il sospetto "stai vendendo i NOSTRI contenuti"
- Chiarisce che il sostegno è per il *servizio*, non per l'oggetto
- Lascia spazio a opzioni di uscita pulite

---

## 3. I costi reali (verità sui numeri)

### 3.1 Costi vivi correnti

| Voce | Necessario | Costo annuo |
|---|---|---|
| Vercel Hobby | sì | 0€ — limite 100GB banda/mese, irraggiungibile a 200 utenti |
| Supabase Free | sì | 0€ — limite 500MB DB e 50k MAU, irraggiungibili |
| GitHub privato | sì | 0€ |
| YouTube unlisted | sì | 0€ |
| Dominio custom | no, utile per credibilità | 0-15€/anno |
| Privacy/ToS (iubenda) | sì se utenti reali | 0-29€/anno |
| Monitoring (Sentry free) | no all'inizio | 0€ |

**Totale realistico anno 1: 0-45€/anno.**

### 3.2 Costi futuri (probabili ma non immediati)

| Trigger | Voce | Costo annuo aggiuntivo |
|---|---|---|
| Vercel free tier saturo (improbabile <500 utenti attivi) | Vercel Pro | ~240€ |
| Supabase free tier saturo (improbabile <500 utenti attivi) | Supabase Pro | ~300€ |
| Volume contenuti / supporto significativo | Sentry team | ~0-360€ |

Soglia plausibile a regime su 200 utenti FESK: **~50-100€/anno costi vivi**, escluso il tempo del founder.

### 3.3 Implicazione strategica

Il break-even tecnico è praticamente zero. La pressione "devo coprire i costi" non esiste. La domanda corretta è:

> Quanto vale il tempo che dedico a manutenzione, supporto, curation e sviluppo, e quanto è ragionevole chiedere alla federazione per coprirlo in modo sostenibile?

### 3.4 Break-even per scenari di tempo

Tariffa di riferimento (lavoro side-project, founder tech): **30-40€/h netti equivalenti**.

| Scenario | Costi vivi | Tempo founder | Quota necessaria |
|---|---|---|---|
| Solo costi vivi | 50€ | 0 ore | 50€/anno |
| + 2h/mese (manutenzione minima) | 50€ | 24h × 35€ = 840€ | ~900€/anno |
| + 4h/mese (manutenzione + curation) | 50€ | 48h × 35€ = 1.680€ | ~1.700€/anno |
| + 6h/mese (side-project serio) | 50€ | 72h × 35€ = 2.520€ | ~2.600€/anno |
| + 10h/mese (semi-mezzo-lavoro) | 50€ | 120h × 35€ = 4.200€ | ~4.250€/anno |

**Lettura:** la quota €1.200-2.400/anno proposta nei modelli sotto copre 2-4h/mese di lavoro. È la fascia onesta per side-project di un founder solitario che pratica nella stessa federazione.

---

## 4. Tutti i modelli valutati

Confronto sintetico, dettaglio per ciascuno in §5.

| Modello | Codice nuovo | 3rd party | Burocrazia | Ricavo realistico anno 1 | Verdetto |
|---|---|---|---|---|---|
| **A. Solo federazione paga** | 0 | 0 | 1 fattura/anno | €1.200-2.400 | **SCELTO** |
| **B. Solo utenti pagano (freemium B2C)** | 80-120h | Stripe + email + fatt.elettr. | P.IVA, IVA 22%, 200+ fatture/anno | €70-280 | Scartato |
| **C. Ibrido federazione + premium utenti** | 80-120h | Stripe + email + fatt.elettr. | P.IVA + 1 fattura B2B | €1.300-2.700 | Scartato (effort sproporzionato) |
| **D. Federazione + supporter link** | 1-2h | Buy Me a Coffee / Liberapay | gestita dalla piattaforma | €1.210-2.460 | Opzione aggiuntiva ad A |
| **E. Single school (fallback)** | 0 | 0 | 1-3 fatture/anno | €300-900 | Fallback se A fallisce |
| **F. In-kind (solo riconoscimento, senza cash)** | 0 | 0 | 0 | €0 | Solo come "anno 0 esteso" |

---

## 5. Dettaglio modelli

### 5.1 Modello A — Solo federazione paga ★ SCELTO

**Funzionamento.** La federazione FESK paga una quota annuale. Tutti gli iscritti delle scuole affiliate accedono a tutto, senza distinzioni in-app.

**Pricing scaglionato sull'adozione misurata.**

| Anno | Condizione | Quota |
|---|---|---|
| 0 (mesi 0-3) | Pilota 2-3 scuole volontarie | 0€ |
| 1 (mesi 4-12) | "Anno fondatori", apertura a tutte le 15 scuole | €1.200 |
| 2 (mesi 13-24), regime base | Adozione 30-50% dei tesserati attivi | €2.400 |
| 2 (mesi 13-24), regime evoluto | Adozione >50% + 1 nuova feature evolutiva | €3.600 |

**Pro.**
- **Zero codice nuovo.** L'app oggi non ha pagamenti in-app, non serve aggiungerli.
- **Zero terze parti.** Nessun Stripe, nessun servizio email transazionale, nessun gateway.
- **Una fattura/anno.** Gestione amministrativa minima.
- **Politicamente pulito.** Non chiedi soldi ai praticanti per usare contenuti che non sono tuoi.
- **Coerente con il modello associativo italiano.** Le federazioni sportive sono abituate a pagare servizi annuali.

**Contro.**
- **Cliente unico.** Cambio di direttivo o di budget = a rischio.
- **Ciclo decisionale lento.** Direttivi associativi votano, deliberano, possono rimandare.
- **Adozione bassa = nessuna leva di prezzo.** Se l'app la usano in 30, non puoi alzare a €3.600.

**Mitigazione.**
- Contratto pluriennale 2 anni con prezzo fondatori bloccato (riduce esposizione al cambio direttivo).
- Mantenere apertura mentale a opzione E (single school) come fallback.
- Tracciare adozione settimanale dal primo giorno del pilota per avere numeri al rinnovo.

### 5.2 Modello B — Solo utenti pagano (freemium B2C). SCARTATO

**Funzionamento.** Libreria gratis, schermata Oggi + scheduler + progresso a pagamento (es. €7/anno).

**Stima ricavi su 200 praticanti.**

| Conversione | Paganti | Ricavo lordo | Ricavo netto post tasse e fee |
|---|---|---|---|
| 5% (realistico) | 10 | €70 | ~€45 |
| 10% | 20 | €140 | ~€90 |
| 20% (ottimistico per side-project consumer) | 40 | €280 | ~€180 |

**Perché è scartato.**

1. **Politicamente esplosivo.** I contenuti video sono della federazione/scuole, non del founder. Far pagare l'accesso espone a obiezioni legittime e politicamente difficili da gestire.
2. **Pubblico inadatto.** Allievo italiano paga già scuola + tessera + esami. Aggiungere €7/anno viene letto come "ennesima cosa da pagare", non come "investimento personale".
3. **Conversion rate B2C consumer:** 1-5% normale, non 20%.
4. **Burocrazia sproporzionata.** P.IVA quasi obbligatoria, fatturazione elettronica per ogni transazione (anche da €7), IVA 22%, eventualmente OSS UE. Per €70-280/anno il costo amministrativo (commercialista, software, tempo) **azzera o supera il ricavo**.
5. **Codice nuovo richiesto:** Stripe + feature gating + email transazionale + pagina account + ciclo di vita subscription. Stima 80-120h.

**Verdetto.** Non vale la pena nemmeno discuterlo. Ricomparirebbe solo come scenario di disperazione se A ed E falliscono entrambi e si decide di pivot completo a B2C.

### 5.3 Modello C — Ibrido federazione + premium utenti. SCARTATO

**Funzionamento.** Federazione paga la piattaforma collettiva (es. €1.200/anno). In più, utenti pagano feature personali (es. €5-7/anno) per cose tipo: sync multi-device, export PDF piano, backup cloud personale, statistiche avanzate, note illimitate.

**Stima ricavi anno 1 realistico.**
- Federazione: €1.200
- Conversione 7% premium: 14 paganti × €7 = €98
- **Totale: €1.298** (vs €1.200 del solo A)

**Stima ricavi anno 2 buono.**
- Federazione: €2.400
- Conversione 12%: 24 × €8 = €192
- **Totale: €2.592** (vs €2.400 del solo A)

**Perché è scartato.**

| Voce | Modello A | Modello C | Delta |
|---|---|---|---|
| Codice nuovo iniziale | 0h | 80-120h | +80-120h |
| Manutenzione mensile | ~2-4h | ~7-15h | +5-11h/mese |
| Terze parti | nessuna | Stripe + email + fatt.elettr. | 3 nuove |
| Burocrazia | 1 fattura/anno | P.IVA + 14-24 fatture/anno B2C + 1 B2B | enormemente più pesante |
| Ricavo extra realistico | base | +€100-300/anno | +8-12% |

**ROI.** 80-120 ore di sviluppo iniziale + 5-11 ore/mese di manutenzione **per €100-300/anno di ricavi extra**. Anche pagando il tempo a €30/h, l'investimento si ripaga in 10-30 anni. Numeri che non stanno in piedi.

**Verdetto.** Esclusivamente reintroducibile **se** in anno 2 emerge una richiesta forte e ripetuta da utenti specifici per UNA feature che vale la pena gateare. Non da pianificare ora.

### 5.4 Modello D — Solo federazione + supporter link (Buy Me a Coffee / Liberapay)

**Funzionamento.** Sopra al Modello A, link "Sostieni il progetto" nella pagina profilo. La piattaforma terza gestisce tutto.

**Stima ricavi.**
- Conversione 1-3% su 200 utenti = 2-6 sostenitori
- × €5-10/anno = **€10-60/anno extra**

**Pro.**
- Implementazione: un link in `/profile`. Stima 1-2 ore.
- Burocrazia: nessuna in capo al founder se si usa Buy Me a Coffee (lo gestiscono loro), bassa con Liberapay.
- Politicamente neutro: non gateggia nulla, è puro sostegno volontario.

**Contro.**
- Conversione bassissima.
- Devi resistere alla tentazione di dare riconoscimenti in-app (porta a complessità).

**Verdetto.** **OK come aggiunta opzionale al Modello A.** Decisione minore, può essere aggiunto in qualsiasi momento.

### 5.5 Modello E — Single school paga (fallback)

**Funzionamento.** Se la federazione non delibera, 2-4 maestri / scuole pagano individualmente per usare l'app per i propri allievi.

**Pricing.**
- €150-300/anno per scuola (proporzionato a "1-2 lezioni private equivalenti").
- Pagamento da parte della scuola, non degli allievi singoli.

**Stima ricavi.**
- 2 scuole × €200 = €400/anno
- 4 scuole × €250 = €1.000/anno

**Pro.**
- Stesso "zero codice / zero terze parti" del Modello A.
- 1-4 fatture/anno gestibili.
- Inizia a generare **mentre** la federazione decide.
- Validazione di mercato a livello scuola, utile per convincere il direttivo.

**Contro.**
- Politicamente delicato se la federazione si è già espressa contro o ha rivendicato il canale.
- Necessario chiarire che i contenuti restano della federazione.
- Frammenta la base utenti se non tutte le scuole aderiscono.

**Verdetto.** **Fallback attivo da tenere pronto.** Da proporre **dopo** o **insieme** alla richiesta alla federazione, non prima (per non sembrare di scavalcare).

### 5.6 Modello F — In-kind, solo riconoscimento

**Funzionamento.** Nessun cash. La federazione riconosce ufficialmente l'app come strumento federale, dà visibilità, eventualmente offre partecipazione gratuita a corsi/stage al founder, citazione su sito, possibilità di parlare in assemblea.

**Verdetto.** Accettabile **solo come estensione di "anno 0"** se servono altri 3-6 mesi di pilota per maturare la decisione economica. Non sostenibile a regime: senza coperture economiche, il founder finisce per smettere.

---

## 6. Inquadramento fiscale (la lacuna principale dell'analisi LLM)

Ricevere €1.200-3.600/anno da una federazione associativa in Italia richiede una scelta esplicita di forma. Tre opzioni realistiche per un founder dipendente o freelance occasionale:

### 6.1 Opzione fiscale A — Prestazione occasionale

| Aspetto | Dettaglio |
|---|---|
| Quando si applica | Lavoro autonomo non abituale, sotto soglia €5.000/anno per singolo committente |
| Documento emesso | Ricevuta per prestazione occasionale (no fattura) |
| Tasse | Ritenuta d'acconto 20% trattenuta dal committente, da conguagliare in dichiarazione |
| Contributi INPS | Solo sopra €5.000 cumulativi nell'anno (Gestione Separata) |
| Costo amministrativo | Quasi zero (modulo + dichiarazione redditi annuale) |
| Limite | Carattere "occasionale" — se diventa ricorrente pluriennale, l'Agenzia Entrate può contestarlo |

**Adatta per:** anno 1 fondatori (€1.200) e anno 2 base (€2.400). Anno 3+ a ricorrenza confermata può diventare contestabile.

### 6.2 Opzione fiscale B — P.IVA forfettario

| Aspetto | Dettaglio |
|---|---|
| Quando si applica | Lavoro autonomo abituale, sotto soglia €85.000/anno |
| Documento emesso | Fattura elettronica via SDI |
| Tasse | Aliquota sostitutiva 5% primi 5 anni se "nuova attività", poi 15%; coefficiente redditività 78% per consulenza/sviluppo software |
| Contributi INPS | Gestione Separata ~26% sulla parte imponibile (con riduzioni se già lavoratore subordinato) |
| Costo amministrativo | Commercialista forfettario ~€500-800/anno + software fatturazione elettronica ~€60/anno |
| Vantaggio | Sostenibile a vita, tutela contributiva, scalabile |

**Adatta per:** anno 2-3 quando la quota arriva a €2.400-3.600 e diventa stabile. **Diventa quasi obbligatoria se si attiva anche Modello E (più scuole) o se si pensa di espandere a un'altra federazione.**

### 6.3 Opzione fiscale C — Associazione di Promozione Sociale (APS) / ETS

| Aspetto | Dettaglio |
|---|---|
| Quando si applica | Si vuole inquadrare lo strumento come "iniziativa di promozione sociale" |
| Documento emesso | Quota associativa o contributo liberale (esenti IVA in molti casi) |
| Tasse | Regime fiscale agevolato (vedi Codice Terzo Settore) |
| Costo amministrativo | Costituzione APS ~€300-500 + statuto + libri sociali + adempimenti annuali (~€500-1.000/anno) |
| Vantaggio | Adatto se l'app diventa "spalla digitale" della federazione e si vuole una struttura formale comune |

**Adatta per:** scenario di lungo termine se la federazione e il founder concordano una governance comune (es. APS condivisa che gestisce il servizio digitale). Sovradimensionata oggi.

### 6.4 Raccomandazione

| Anno | Quota target | Forma |
|---|---|---|
| 1 (€1.200) | €1.200 | **Prestazione occasionale** (sotto €5.000, no P.IVA, costo amministrativo zero) |
| 2 base (€2.400) | €2.400 | **Prestazione occasionale** (ancora sotto €5.000, ma valutare P.IVA forfettario se prevedo Modello E o altre entrate) |
| 2 evoluto / 3 (€3.600+) | €3.600+ | **P.IVA forfettario** (carattere ricorrente certificato, scalabilità) |

**Azione concreta da fare ORA, prima di proporre alla federazione:** consultare un commercialista per validare l'inquadramento prestazione occasionale per anno 1 e capire i tempi/costi di apertura P.IVA forfettario per quando servirà. Costo: 1 ora di consulenza, ~€60-100.

---

## 7. Roadmap operativa

### 7.1 Mesi 0-3 — Pilota gratuito

**Azioni founder:**
- Selezionare 2-3 scuole volontarie (preferibilmente: scuola del founder + 1-2 maestri ben disposti).
- Onboardare 30-50 praticanti via Supabase invite.
- Tracciare metriche: utenti attivi settimanali, retention W1-W2-W4, sessioni completate, feedback maestri raccolto in conversazione.
- Preparare report finale con grafici e citazioni dirette.

**Costi:** 0€.

**Output:** report di 4-6 pagine al direttivo con dati quantitativi + qualitativi.

**Stop signal pilota:**
- < 15 utenti attivi settimanali su 30-50 invitati = problema di prodotto, non di pricing. **Risolvere prima di parlare di soldi.**
- Nessun maestro promuove spontaneamente l'app ai propri allievi = adozione organica nulla.

### 7.2 Mesi 4-12 — Anno 1 fondatori

**Pre-condizione:** pilota OK, direttivo ha visto report e accettato proposta.

**Azioni:**
- Apertura graduale a tutte le 15 scuole.
- Quota: **€1.200/anno** in prestazione occasionale, fatturata in unica soluzione o due tranche.
- Manutenzione, bug fix, supporto via email/WhatsApp.
- Sviluppo solo del necessario richiesto da maestri.
- Curation contenuti: caricamento video federali nuovi se la federazione li produce (vedi §8).

**Output target:**
- 30+ utenti attivi settimanali su 200 potenziali (15%)
- Retention W4 ≥ 25%
- ≥ 5 maestri che hanno usato lo strumento almeno una volta per indicare pratica agli allievi

### 7.3 Mesi 13-24 — Anno 2 a regime

**Trigger di pricing scaglionato:**

| Adozione misurata anno 1 | Quota anno 2 |
|---|---|
| < 15% utenti attivi (sotto target) | €1.200 (rinnovo fondatori, no aumento) |
| 15-30% | €2.400 (regime base) |
| > 30% + richiesta evolutiva | €3.600 (regime evoluto) |

**Sviluppo prioritario anno 2:**
- Pannello istruttore (Sprint 3 del piano tecnico) — abilita il maestro a vedere progressi degli allievi.
- Eventuale notifiche push (richiesta probabile dopo 6 mesi d'uso).

**Inquadramento fiscale:** valutare passaggio a P.IVA forfettario se quota €3.600 o se si attiva Modello E in parallelo.

### 7.4 Mesi 24+ — Decisione strategica

Quattro percorsi possibili da valutare con dati alla mano:
1. **Continui in autonomia** con FESK come cliente principale.
2. **Apri a una seconda federazione** (Modello scaling, da analizzare separatamente — non si pianifica oggi).
3. **Cedi alla FESK / APS condivisa** se la federazione vuole assumersi gestione e proprietà.
4. **Chiudi** se nessuna delle precedenti è sostenibile.

---

## 8. Costo curation contenuti (lacuna LLM)

Voce sottostimata da rendere esplicita per non lavorare gratis.

| Attività | Frequenza | Tempo unitario | Tempo annuo |
|---|---|---|---|
| Caricamento nuovo video YouTube unlisted + insert in `skills` | per video | 10-15 min | dipende dal flusso federale |
| Aggiornamento mappatura programma esame se la federazione cambia curriculum | per cambio | 2-4 ore | 0-8 ore |
| Risposta a domande tecniche praticanti/maestri | per richiesta | 5-15 min | dipende dall'adozione |
| Risoluzione problemi auth/login | per ticket | 10-30 min | dipende |
| Aggiornamento news/bacheca federazione | per news | 5 min | 0-2 ore (se la federazione delega) |

**Stima realistica anno 1 a regime:** **2-4 ore/mese di curation + supporto** = 24-48 ore/anno.

**Implicazione sulla quota:** la fascia €1.200-2.400/anno copre questo tempo a ~€30-50/h equivalenti. È onesta. Sotto €1.000/anno il founder è in perdita di tempo netto.

**Mitigazione di lungo termine:**
- Pannello admin in-app (Sprint 3) per delegare alla federazione l'inserimento di skill e news.
- Documentazione operativa per i maestri che caricano i propri video.

---

## 9. Email al direttivo (versione corretta)

Riscrittura della bozza dell'altro LLM, depurata dalle allucinazioni e con linguaggio adatto a una federazione associativa italiana.

---

**Oggetto:** Proposta di pilota per uno strumento digitale di pratica federale

Gentile Presidente, gentile Direttivo,

vi scrivo in qualità di praticante della scuola di [città/maestro], iscritto alla FESK dal [anno].

Negli ultimi mesi ho sviluppato come progetto personale una web app pensata per supportare la pratica autonoma degli allievi tra una lezione e l'altra, basata sul curriculum tecnico ufficiale della federazione. L'idea è semplice: dare ai praticanti un riferimento digitale organizzato dei programmi d'esame, dei video tecnici e delle indicazioni dei maestri, accessibile dal telefono come un'evoluzione naturale dei quaderni tecnici.

Lo strumento è già funzionante, accessibile via browser, installabile sul telefono senza passare da app store. Non gestisce pagamenti, non richiede iscrizione separata e non raccoglie dati sensibili al di là di nome, livello e log di pratica personali.

Vorrei proporre alla federazione una **fase pilota di 90 giorni, gratuita, con 2-3 scuole volontarie**, per verificare con dati reali se lo strumento è effettivamente utile agli allievi e ai maestri. Al termine del pilota presenterei un report con i numeri di utilizzo (sessioni di pratica registrate, frequenza d'uso, feedback raccolti) e una proposta di sostegno economico **modesto e proporzionato all'adozione effettiva**, finalizzato a coprire i costi di manutenzione e a permettere lo sviluppo nelle direzioni che la federazione riterrà utili.

Per chiarezza fin da subito: la proprietà dei contenuti video resta dei rispettivi autori (federazione, scuole, maestri). L'app è un servizio di organizzazione e accesso, non un canale di rivendita di contenuti.

L'obiettivo non è vendere un prodotto. È capire insieme se questo strumento può diventare un servizio digitale federale stabile, e in che forma sostenerlo.

Resto a disposizione per una presentazione, in presenza o in call, in cui mostrare lo strumento dal vivo e discutere le modalità del pilota.

Cordialmente,
[Nome Cognome]
[contatto]

---

## 10. Stop signals e quando NON monetizzare

### 10.1 Quando ritardare la richiesta economica

- < 30 utenti attivi settimanali su 200 potenziali dopo 6 mesi → resta in pilota gratuito esteso, indaga le cause.
- Retention W2 < 30% → problema di prodotto, non di pricing.
- Solo i compagni di scuola del founder usano l'app → manca diffusione organica.
- Nessun maestro promuove l'app spontaneamente ai propri allievi → manca buy-in dei "moltiplicatori".

### 10.2 Quando abbandonare il progetto

- 12 mesi di pilota gratuito senza segnali di adozione organica.
- Direttivo decide di sviluppare uno strumento alternativo proprio.
- Il founder smette di usarla quotidianamente (se non funziona per il founder, non funzionerà per nessuno).
- Manutenzione richiede > 6h/mese stabilmente senza alcun ritorno (cash o in-kind).

### 10.3 Quando alzare il prezzo o estendere

- Adozione > 50% degli utenti potenziali per 6+ mesi consecutivi.
- Maestri che chiedono nuove feature in modo strutturato (segnale di valore percepito).
- Altre federazioni Kung Fu (verificate, non ipotizzate) che ne sentono parlare e chiedono accesso.

---

## 11. Rischio politico

Il rischio principale **non è il prezzo sbagliato**, è la dipendenza da cliente unico associativo:
- Cambio direttivo = nuove priorità.
- Scissioni interne = nessuno vuole "ereditare" un servizio del precedente direttivo.
- Budget federale che si comprime per ragioni esterne (es. perdita affiliati).

**Protezioni concrete:**
- Contratto pluriennale 2 anni con quota fondatori bloccata.
- Mantenere Modello E (single school) come fallback caldo: anche se la federazione si ritira, 2-3 scuole possono continuare individualmente.
- **Non investire** in feature FESK-specifiche non riutilizzabili (es. iconografia federale hard-coded, terminologia FESK non parametrica). Tenere il modello dati `school_id` parametrico — già è così nel piano corrente, mantenere disciplina.
- Documentare il funzionamento e il modello dati: in caso di subentro, qualcuno deve poter prendere in mano lo strumento.

---

## 12. Decisione finale

| Voce | Scelta |
|---|---|
| Modello primario | **A — Solo federazione paga** |
| Aggiunta opzionale | **D — Buy Me a Coffee link in profilo** (1-2h di lavoro, in qualsiasi momento dopo il pilota) |
| Fallback se A fallisce | **E — Single school**, attivabile a 1-2 maestri |
| Modelli scartati | B, C (premium tier B2C) — riapribili solo con dati di richiesta concreta |
| Inquadramento fiscale anno 1 | **Prestazione occasionale** |
| Inquadramento fiscale anno 2-3 | **P.IVA forfettario se quota stabile ≥ €2.400 o se si attiva E** |
| Quota anno 1 fondatori | **€1.200** (post-pilota) |
| Quota regime | **€2.400-3.600** scaglionata su adozione misurata |
| Pre-condizione assoluta | **Pilota 90gg gratuito con 2-3 scuole, report dati, poi proposta economica** |

---

## 13. Prossimi passi concreti

In ordine di priorità, eseguibili nelle prossime 4-8 settimane:

1. **[Operativo, ~30 min]** Selezionare 2-3 scuole pilota (incluso scuola del founder).
2. **[Operativo, ~1 ora]** Definire le 4-5 metriche tracciabili dal pilota e verificare che siano già loggate (utenti attivi settimanali, retention, sessioni, ecc.).
3. **[Amministrativo, ~1 ora + €60-100]** Consultare commercialista per validare prestazione occasionale anno 1 e tempi P.IVA forfettario.
4. **[Comunicazione, ~2 ore]** Inviare email §9 al direttivo con preavviso al proprio maestro.
5. **[Tecnico, ~1 giorno]** Preparare onboarding semplificato per i ~30-50 praticanti pilota (istruzioni installazione PWA + invito Supabase).
6. **[Manutenzione, ricorrente]** Loggare ore mensili dedicate per validare la stima §8 con dati reali del pilota.
7. **[Decisionale, fine pilota]** Compilare report dati pilota e fissare meeting con direttivo per proposta economica.

---

## Appendice — Allegato dell'analisi originale del secondo LLM

L'analisi completa ricevuta dal secondo LLM è disponibile nella conversazione del 2026-05-02. Punti chiave già recepiti in questo documento:
- Ricalcolo onesto dei costi vivi (§3).
- Smontaggio del freemium B2C (§5.2).
- Calcolo ROI premium tier (§5.3).
- Modello supporter come compromesso (§5.4).
- Roadmap pilota → fondatori → regime (§7).
- Stop signals (§10).
- Rischio politico (§11).
- Bozza email (§9, riscritta per rimuovere allucinazioni).

Punti **non recepiti** o corretti rispetto all'originale:
- Espansione "FESK = Federazione Europea Scuola Kung Fu" → rimossa (allucinazione).
- "Maestro Bestetti" → rimosso (allucinazione).
- "Espansione ad altre federazioni Chang (3-4 organizzazioni)" → declassato a opzione teorica (§7.4) senza numeri di mercato.
- Aggiunta sezione fiscale italiana (§6).
- Aggiunta opzione fallback "single school" (§5.5).
- Aggiunta quantificazione costo curation (§8).
