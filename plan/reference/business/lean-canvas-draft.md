# Lean Canvas - Bozza Operativa

**App:** Skill Practice
**Data:** 2026-07-03
**Status:** bozza v0 compilata dal materiale del validation lab, da validare con le interviste in corso
**Metodo:** Lean Canvas (Ash Maurya, *Running Lean*) - variante del BMC per fase di validazione
**Collegamenti:** `business-model-canvas-draft.md` (BMC operativo), `business-model-canvas-assumption-map.md` (registro assunzioni), `validation-lab/2026-06-10-session-2-where-to-play.md` (early adopter), `validation-lab/2026-06-27-session-3-script-intervista.md` (prima evidenza sul campo)

---

## 0. Perche un Lean Canvas accanto al BMC

Il BMC descrive il modello; il Lean Canvas mappa i rischi. Sostituisce quattro blocchi (Partner, Attivita, Risorse, Relazioni) con Problem, Solution, Key Metrics e Unfair Advantage. Per la fase attuale del lab la domanda non e "come opero" ma "sto risolvendo un problema reale per qualcuno che pagherebbe": questo canvas serve a tenere quella domanda al centro.

Convenzioni:

- ogni voce e marcata con il livello di evidenza della assumption map: **[forte]**, **[media]**, **[debole]**, **[assente]**;
- dove esiste, e citato l'ID assunzione (CSx, VPx, P0-x) del registro in `business-model-canvas-assumption-map.md`;
- l'unica evidenza sul campo ad oggi e lo scambio in chat della Sessione 3 (§6): una fonte, via chat, quindi al massimo **[media]**.

---

## 1. Canvas one-page

| Problem | Solution | Unique Value Proposition | Unfair Advantage | Customer Segments |
|---|---|---|---|---|
| Video/materiali tecnici dispersi, ritrovarli costa tempo | Curriculum per grado con video protetti | Il quaderno tecnico digitale della scuola: sai cosa praticare oggi, con i video della tua scuola, che restano sotto il suo controllo | Lignaggio Chang/FESK e fiducia dei maestri (da costruire) | Allievi intermedi/pre-esame (user) |
| L'allievo non sa cosa praticare tra le lezioni | Sessione guidata "cosa praticare oggi" | *Concept:* budoo gestisce la scuola, Skill Practice fa praticare il curriculum | Curriculum FESK gia mappato nel prodotto | Maestri/istruttori (champion, forse primo user) |
| La condivisione e bloccata dalla paura del leak | Programma esame consultabile + log pratica | | | Scuole/federazioni (buyer) |
| **Existing alternatives:** WhatsApp, Drive, YouTube unlisted, quaderni/PDF, archivi locali, memoria del maestro, budoo Campus, sito fai-da-te | **Key Metrics:** interviste con episodi concreti; conversione invito -> onboarding; attivi settimana 6 >25%; ore setup <= 2-3; pricing conversation avviata | | | **Early adopters:** scuola/gruppo con patrimonio tecnico pronto, uso didattico interno, materiali dispersi, maestro sponsor, decision path |

| Cost Structure | Revenue Streams |
|---|---|
| Tempo founder: manutenzione, supporto, curation, relazione (costo dominante) | Licenza/quota annuale scuola o federazione (modello principale, non validato) |
| Hosting Supabase/Vercel, dominio (basso in pilota) | Pilota 60-90 giorni gratuito e misurato |
| Import/mapping curriculum per scuola | Setup fee import curriculum (ipotesi futura) |
| Privacy, fiscale, legale (se si apre a terzi) | Abbonamento allievi (ipotesi futura, sconsigliata ora) |

---

## 2. Problem

I tre problemi principali, in ordine di evidenza:

| # | Problema | Evidenza | Fonte |
|---|---|---|---|
| 1 | **Materiali tecnici dispersi**: video girati negli anni sparsi su dispositivi, archivi locali, chat; ritrovare quello giusto per un grado costa tempo | [media] episodio concreto: "Franco ogni volta fa fatica a cercare i video tra tutti quelli che ha" (Sessione 3 §6) | VP1, P0-1 |
| 2 | **La condivisione e bloccata dalla paura del leak**: il patrimonio tecnico e desiderabile da condividere solo se resta "dentro il giro"; senza garanzia di controllo la scuola non condivide affatto | [media] "che i video escano dal giro e vengano pubblicati... dinamica difficile e rischiosa"; "se si tiene in locale... potrebbe essere la svolta" (Sessione 3 §6) | VP6, P0-6 |
| 3 | **L'allievo non sa cosa praticare tra le lezioni**: sa che dovrebbe praticare ma non sa cosa fare oggi, dove trovare il riferimento giusto, cosa ripassare pre-esame | [debole] osservato dal founder nel contesto reale, nessuna intervista allievo ancora | H1/H2, P0-1 |

Nota d'ordine: la gerarchia riflette l'evidenza raccolta, non l'importanza teorica. Il problema 3 e il cuore del prodotto ma resta il meno validato; il problema 2 e emerso sul campo e ha scalato la classifica (promosso P0 il 2026-06-27).

### Existing alternatives

Il vero competitor e l'inerzia, non un software:

- WhatsApp, Drive, YouTube unlisted, PDF, quaderni tecnici (workaround gratuiti, gia familiari);
- archivi locali sui dispositivi personali + condivisione manuale caso per caso;
- memoria del maestro come indice dei contenuti;
- sito web fai-da-te dell'associazione (il lead Sessione 3 ne sta sviluppando uno);
- budoo.one Campus per scuole strutturate disposte a pagare ~200 EUR/mese per un all-in-one.

---

## 3. Customer Segments

Tre ruoli distinti, da non fondere (regola chiave del modello):

| Ruolo | Chi | Nota |
|---|---|---|
| User | Allievi intermedi/pre-esame | Pain potenziale alto, potere decisionale basso |
| Champion | Maestro/istruttore | Canale, fiducia e legittimazione didattica |
| Buyer | Scuola/federazione | Pagatore piu plausibile (CS4) |

**Segnale aperto dalla Sessione 3:** l'accesso ai video e pensato "prima ai maestri" - il primo utente reale potrebbe essere il maestro, non l'allievo. Da verificare in intervista se e cautela iniziale o il vero JTBD (Sessione 3 §6.2).

### Early adopters (profilo V2)

> Scuola o gruppo didattico con **patrimonio tecnico pronto** (curriculum stabile per almeno un livello/esame, 5-10 contenuti usabili), uso come **supporto didattico interno**, **materiali dispersi**, **maestro sponsor** con prontezza all'azione e **decision path** osservabile.

Gate obbligatori e must-have: Sessione 2 §9.6 e §10.5. Il quadrante "patrimonio pronto + leva strategica/commerciale" e target futuro, non primo pilota.

---

## 4. Unique Value Proposition

> **Il quaderno tecnico digitale della scuola: gli allievi sanno cosa praticare oggi, con i video e il programma della propria scuola - che restano sotto il controllo della scuola.**

La coda ("sotto il controllo della scuola") e nuova rispetto al BMC: incorpora VP6/A-NEW1, dove la protezione dei contenuti e leva di proposta e non solo vincolo. Se le prossime interviste la confermano, va promossa da coda a centro del messaggio.

High-level concept:

> budoo gestisce la scuola; Skill Practice fa praticare il curriculum della scuola.

Cosa la UVP non promette: non sostituisce il maestro, non e un gestionale, non e una piattaforma pubblica di corsi.

---

## 5. Solution

Tre soluzioni, una per problema - da trattare come ipotesi di soluzione, non roadmap:

| # | Problema | Soluzione |
|---|---|---|
| 1 | Materiali dispersi | Curriculum organizzato per grado/livello con video collegati: il contenuto giusto si trova per posizione nel programma, non cercando in un archivio |
| 2 | Paura del leak | Accesso controllato dalla scuola: contenuti visibili solo ai membri autorizzati (maestri, poi allievi), mai pubblici; la scuola decide chi vede cosa |
| 3 | "Cosa pratico oggi?" | Sessione guidata del giorno + programma esame consultabile + log pratica/progressi |

Coerente con la scelta strategica anti-budoo (assumption map §6.7): fare poco ma validarlo bene; niente CRM, billing, presenze, eventi.

---

## 6. Channels

Percorso high-touch, coerente con B2B2C piccolo (CH1-CH3):

1. Demo diretta al maestro (rete Chang/FESK, gancio di lignaggio) - primo aggancio;
2. Pilota con gruppo reale di 5-15 allievi - validazione comportamentale;
3. Report dati post-pilota - conversazione economica con scuola/federazione;
4. Passaparola tra maestri / campionamento a valanga dalle interviste;
5. Landing pubblica solo come credenziale, non come canale.

Da evitare ora: ads consumer, app store come canale, SEO generico, freemium pubblico.

---

## 7. Revenue Streams

Tutto **[assente]** come evidenza: nessuna pricing conversation ancora avvenuta.

| Fase | Modello | Stato |
|---|---|---|
| Pilota 60-90 giorni | Gratuito, misurato | Da avviare dopo le interviste |
| Anno fondatori | Quota leggera scuola/federazione | Ipotesi (RS1) |
| Regime | Quota annuale proporzionata ad adozione e lavoro ricorrente | Da validare con report + pricing conversation (P0-4) |

Benchmark di riferimento: budoo a 199,90 EUR/mese posiziona il tetto per un all-in-one; Skill Practice deve costare sensibilmente meno ed essere giustificabile come supporto didattico, non gestionale. Abbonamento allievi e setup fee restano ipotesi future (RS2).

---

## 8. Cost Structure

| Voce | Peso | Nota |
|---|---|---|
| Tempo founder | **Dominante** | Manutenzione, supporto, curation, relazione con maestri (RS3) |
| Import/mapping curriculum per scuola | Medio-alto | Target: <= 2-3 ore lato maestro per il setup iniziale, ma il lavoro lato founder va misurato (CSX2) |
| Hosting Supabase/Vercel, dominio | Basso in pilota | Da monitorare con la crescita (CSX1) |
| Privacy, fiscale, legale | Medio, differibile | Necessario prima di utenti terzi reali e incassi (CSX3) |

Principio di pricing: la quota deve coprire tempo founder + costi vivi, non solo l'infrastruttura.

---

## 9. Key Metrics

Metriche per fase, con soglie gia definite nel lab:

**Fase attuale (interviste, P0-0/P0-1/P0-6):**

- interviste completate vs target (3-5 maestri, 8-10 allievi);
- quota di intervistati con episodi concreti spontanei (soglia: 7/10 allievi, 3/5 maestri);
- candidati che superano i gate early adopter (soglia: almeno 2);
- scuole che confermano la protezione come pre-condizione risolvibile (soglia: almeno 2, P0-6);
- saturazione: chiudere quando le nuove interviste non aggiungono evidenze.

**Fase pilota (P0-2/P0-3):**

- conversione invito maestro -> onboarding allievi;
- allievi attivi settimana 6 (positivo >25%, negativo <10% degli invitati);
- sessioni completate / uso pre-esame vs uso continuativo (separati);
- ore setup lato maestro (<= 2-3) e ore supporto/curation lato founder.

**Fase ricavi (P0-4):**

- pricing conversation avviate e decisore con budget/processo identificato.

---

## 10. Unfair Advantage

Il blocco piu debole - ed e normale a questo stadio: un vero unfair advantage ("cio che non si puo copiare o comprare") spesso non esiste all'inizio e va costruito. Candidati onesti:

| Candidato | E davvero unfair? |
|---|---|
| Appartenenza al lignaggio Chang/FESK: accesso, fiducia e credibilita presso le scuole target | Il piu promettente: budoo o un concorrente generico non puo comprarla ne replicarla in tempi brevi |
| Curriculum FESK gia mappato e strutturato nel prodotto | Difendibile solo se autorizzato formalmente (P0-5) e se la relazione con la federazione si consolida |
| Fiducia personale dei maestri sponsor | Reale ma fragile: e legata al founder, non al prodotto |
| Il prodotto (PWA, feature) | **Non** e unfair: replicabile da chiunque, budoo incluso |

Da rivisitare dopo il pilota: se P0-2 e P0-6 reggono, il combinato "dentro la federazione + contenuti protetti + fiducia dei maestri" diventa il candidato forte.

---

## 11. I tre rischi che invalidano il canvas

1. **Il problema non e prioritario** (Problem 1 e 3): interviste con risposte vaghe -> la UVP non regge (P0-1).
2. **Il maestro non spinge** (Channels): senza champion operativo il canale non parte (P0-2).
3. **Nessuno paga** (Revenue): uso positivo ma nessuna disponibilita economica -> modello non validato (P0-4).

Regola operativa invariata: nessuna feature business-critical prima di validare P0-1...P0-6.

---

## 12. Prossimi aggiornamenti del canvas

| Evento | Blocco da aggiornare |
|---|---|
| Interviste maestri confermano/smontano la protezione come leva | UVP, Problem (ordine), Solution #2 |
| Emerge che il primo utente e il maestro, non l'allievo | Customer Segments, UVP, Key Metrics del pilota |
| Trigger dominante = esame (vs pratica continua) | UVP, Solution #3, Key Metrics |
| Pricing conversation con esito | Revenue Streams, Unfair Advantage |
| Un candidato supera tutti i gate | Early adopters: sostituire il profilo con il caso reale |
