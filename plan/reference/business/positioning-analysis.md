# Analisi di Posizionamento Competitivo — Living Document

**Status:** Living
**Versione:** v1
**Ultimo aggiornamento:** 2026-04-25
**Owner:** founder
**Sostituisce:** —

---

## 0. Come usare questo documento

Documento vivo che combina:

1. **L'analisi di posizionamento** prodotta dal founder (sezione §3, congelata fino a revisione esplicita)
2. **Le valutazioni critiche** dell'agent (sezione §4, aggiornate ad ogni passaggio)
3. **Le issue aperte** da risolvere prima di mostrare il documento all'esterno (§5)

**Quando aggiornare:**

- Si chiude una decisione aperta in `current-plan.md` §2.2 che impatta il posizionamento (es. D5 SRS, D7 player video) → aggiornare §4 e §5
- Si aggiungono/rimuovono feature dal piano che cambiano i differenziatori → aggiornare §3 e §4
- Esce un nuovo competitor o un competitor esistente lancia feature rilevanti → aggiornare §3.2 e §6
- Cambia lo scenario strategico (A → B) → riscrivere §3.7 e aggiornare §7

**Regola chiave:** la sezione §3 (analisi originale) è "frozen" fino a revisione esplicita del founder. L'agent può aggiungere note di valutazione in §4 ma non riscrivere §3 senza richiesta.

---

## 1. SINTESI VALUTAZIONE CORRENTE (v1, aggiornata 2026-06-11)

L'analisi è **strategicamente corretta nelle linee guida** (Scenario A, vero competitor = inerzia, complementare ad admin-tool).

**Aggiornamenti:**
- **"Tab Progresso con 5 visualizzazioni"** — rimosso. Non esiste in nessun piano e non sarà implementato.
- **"Logica focus/mantenimento"** — corretto. Non è un concetto architetturale: è semplice rotazione basata su `last_practiced_at` (~20 righe in `practice-logic.ts`). No ripasso. D5 (SRS reale) è aperta, Sprint 3+.

Dettagli minori corretti:
- "~130 skill" → 137 (aggiornato in §3.1)

---

## 2. ALLINEAMENTO CON I PIANI VIGENTI

| Claim dell'analisi | Stato nei piani | Verdetto |
|---|---|---|
| PWA installabile | `current-plan.md` §3 + Sprint 1 task #18 | ✅ Reale |
| Curriculum FESK 137 skill Shaolin + T'ai Chi | `2026-04-25-curriculum-fesk-plan.md` §6.1 | ✅ Reale |
| Tre modi: programma esame / ripasso / piano libero | `current-plan.md` §7.3 + Sprint 2 task #12 | ✅ Reale (libero in Sprint 2) |
| Logica focus/maintenance con rotazione | `src/lib/practice-logic.ts` | ✅ Reale (semplice rotazione, non SRS) |
| Doppio livello Shaolin + T'ai Chi | `2026-04-25-curriculum-fesk-plan.md` §5.5 | ✅ Reale dopo Sprint 1.5 |
| Bacheca comunicazioni federazione | `current-plan.md` §9 Sprint 2 | ✅ Pianificato |
| Architettura multi-utente predisposta | `current-plan.md` §4 + §14.3 RLS | ✅ Reale |

---

## 3. ANALISI ORIGINALE (aprile 2026, frozen)

> Sezione frozen — riprodotta integralmente dal contributo del founder. Non riscrivere senza richiesta esplicita. Le note di valutazione vivono in §4.

### 3.1 Il prodotto come è oggi

**Cosa fa:**
- PWA installabile (Android/iOS via browser, niente store)
- Contiene l'intero curriculum FESK: 137 skill divise in Shaolin e T'ai Chi
- Video YouTube unlisted della federazione (evoluzione digitale dei quaderni tecnici stampati)
- Tre modi di usarlo: programma esame preconfigurato, ripasso di un livello precedente, selezione libera di skill
- Logica "oggi fai questo" con stati focus/mantenimento e rotazione automatica basata su last_practiced_at
- Doppio livello (Shaolin + T'ai Chi separati)
- Bacheca comunicazioni federazione
- Architettura multi-utente predisposta (Supabase Auth + RLS)

**Cosa NON fa:**
- Niente gestionale (billing, scheduling, attendance, CRM)
- Niente marketplace
- Niente AI
- Niente gamification (badge, punti, achievement)
- Niente chat
- Niente upload video dall'app

### 3.2 Competitor — cosa fanno davvero

**budoo.one** — admin-first tedesco con campus contenuti. Non competitor diretto: complementare. Tu vai in profondità dove budoo resta in superficie.

**Zen Planner** — ha lanciato "Curriculum in the Member App". Più vicino di prima ma resta libreria statica dentro un gestionale $69-199/mese. Manca pratica guidata, rotazione, visualizzazioni avanzate.

**Martialytics** — admin-first, kata curriculum tracking ma è "lo studente ha completato questo livello", non "oggi pratica questo". Niente proposta quotidiana.

**1club** — AI-native gestionale con belt tracking. Zero contenuti pedagogici.

**Clubworx** — Automated Grading System, attendance-driven. Niente video, niente proposta di pratica.

**Wing Chun Trainer "At Home" / Wuji** — B2C generico o single-master. Nessuna sovrapposizione.

**GMAU** — B2C puro, conferma il modello "apprendimento strutturato con video" ma in segmento diverso.

**Stack artigianale (WhatsApp + YouTube + PDF/Quaderno)** — il vero competitor. Funziona da 20+ anni.

### 3.3 Matrice comparativa

| Dimensione | Tuo prodotto | budoo.one | Zen Planner | Martialytics | Stack artigianale |
|------------|:---:|:---:|:---:|:---:|:---:|
| Contenuti video della scuola | ✅ Core | ✅ Campus | ✅ (nuovo) | ❌ | YouTube sparso |
| Organizzazione per livello/cintura | ✅ | ✅ | ✅ | ✅ | Quaderno stampato |
| "Oggi fai questo" (pratica guidata) | ✅ Core | ❌ | ❌ | ❌ | Solo se maestro WhatsApp |
| Focus / mantenimento con rotazione | ✅ | ❌ | ❌ | ❌ | ❌ |
| Doppia disciplina (Shaolin + T'ai Chi) | ✅ | ❌ | ❌ | ❌ | Quaderno separato |
| Programma esame preconfigurato | ✅ | ✅ (parziale) | ✅ (parziale) | ✅ | Quaderno |
| Ripasso esame precedente | ✅ | ? | ? | ❌ | Manuale |
| Piano personale libero | ✅ | ❌ | ❌ | ❌ | ❌ |
| Indicatore solo/coppia | ✅ | ❌ | ❌ | ❌ | Quaderno |
| Bacheca comunicazioni | ✅ (Sprint 2) | ✅ | ✅ | ✅ | WhatsApp |
| Billing / scheduling / CRM | ❌ (escluso) | ✅ Core | ✅ Core | ✅ Core | ❌ |
| Prezzo | €0 (MVP) | €99-200/mo | $69-199/mo | Custom | €0 |

### 3.4 Posizionamento netto

**Cosa sei:** unico prodotto sul mercato che combina contenuti specifici di scuola + pratica guidata quotidiana con rotazione semplice (focus/mantenimento). Nessun competitor lo fa.

**Cosa NON sei:** un gestionale. Non competi su billing/scheduling/CRM/attendance.

**Vero competitor:** quaderno stampato + memoria + WhatsApp. Il 90% delle scuole tradizionali non usa software pedagogico. Mercato vergine, zero switching cost ma anche zero "demand pull".

### 3.5 Punti di forza

**Forte e difendibile:**
1. Curriculum FESK completo (137 skill) — non replicabile senza lavoro manuale
2. Doppia disciplina con gradi separati — Shaolin + T'ai Chi paralleli

**Forte ma copiabile:**
3. Pratica guidata con rotazione (focus/mantenimento)
4. Prezzo €0 vs €99-200/mese

**Debole:**
5. Nessuna parte gestionale — alcune scuole vorranno "un solo tool"

### 3.6 Rischi competitivi

| Livello | Rischio | Probabilità |
|---|---|---|
| Alto | Zen Planner espande modulo curriculum con pratica guidata | Media |
| Medio | budoo.one migliora il campus | Bassa |
| Basso | Nuovo player costruisce prodotto identico | Improbabile (serve federazione) |
| Zero | App generiche tipo Wing Chun Trainer | Non competono |

### 3.7 Scenari strategici

**A — FESK only (più probabile a breve):** focus totale, mercato limitato ma feedback loop stretto.

**B — Scuole lignaggio Chang Dsu Yao:** stesso curriculum, mercato più ampio, possibile attrito politico.

**C — Piattaforma generica:** complessità alta, perdi specificità. Prematuro.

**Consiglio:** A per 6-12 mesi, poi eventualmente B. C non ora.

### 3.8 Sintesi in 4 punti

1. Nessun competitor fa quello che fai tu (combinazione contenuti + pratica guidata con rotazione)
2. Zen Planner si è avvicinato ma non è arrivato (libreria statica vs pratica guidata)
3. Il vero competitor è l'inerzia (quaderno + WhatsApp funziona "abbastanza bene")
4. Il rischio più grande non è un competitor, è che l'app non venga usata (kill metric §11.1)

---

## 4. VALUTAZIONE CRITICA (agent, aggiornabile)

### 4.1 Cosa regge

**Inquadramento competitor (§3.2 e §3.3): solido.**
La separazione fra admin-first (budoo, Zen Planner, Martialytics, 1club, Clubworx) e pedagogia-first è corretta. La matrice §3.3 è il pezzo migliore: chiara, asimmetrica al punto giusto, evita di gonfiare le differenze.

**"Il vero competitor è l'inerzia" (§3.4 e §3.8 punto 3): l'insight più importante.**
Coerente con `current-plan.md` §11.1 (kill metric soggettivo: "l'utilità si sente"). Non è retorica.

**Strategia §3.7: corretta.**
Scenario A → B → mai C prematuramente. Allineato con `current-plan.md` §1.

**Differenziazione vs Zen Planner (§3.2): onesta.**
Riconosce che si sono avvicinati ma non arrivati. Non li liquida, non li gonfia.

### 4.2 Cosa è stato corretto

**Rimosso 1 — Tab Progresso con 5 visualizzazioni.**
Non esiste in nessun piano e non sarà costruito. Rimosso da §3.1, §3.3, §3.5.

**Corretto 2 — focus/mantenimento come "concetto architetturale".**
È una rotazione semplice per `last_practiced_at` (~20 righe in `src/lib/practice-logic.ts`). Non c'è il ripasso (niente review). L'SRS reale è D5, decisione aperta, Sprint 3+. Non è un differenziatore architetturale, è un modello pedagogico che gli admin-tool non implementano perché non si pongono il problema.

**Numero — "~130 skill" → 137.**
Corretto in §3.1 e §2.

### 4.3 Cosa manca

**1. Decisioni aperte rilevanti per il posizionamento.**
- D5 (SRS reale) — se non si costruisce, "rotazione" è differenziatore debole
- D7 (player video) — Sprint 1.6 ha custom player; passaggio a MP4 cambia il discorso "zero infrastruttura video"

**2. Test di falsificazione.**
"Cosa farebbe crollare questa tesi?" Esempio: se Zen Planner aggiunge "daily practice suggestion" basata sul curriculum caricato, quanto del vantaggio resta? Vedi §6 (skeleton da riempire).

**3. Quantificazione del rischio "complementare".**
"Siamo complementari, non sostitutivi" è veicolo di una scommessa: il segmento "scuola con gestionale + disposta a pagare un secondo tool pedagogico" potrebbe essere molto piccolo. Le scuole piccole italiane spesso non comprano nulla; le grandi vogliono un solo tool. Da quantificare prima di pre-vendita.

### 4.4 Verdetto

L'analisi è strategicamente corretta e allineata al codice. Overclaim rimossi. Pronto per audience interna; esterno dopo validazione della tesi con il validation lab.

---

## 5. ISSUES APERTE — da risolvere prima di uso esterno

| # | Issue | Azione richiesta | Owner | Stato |
|---|---|---|---|---|
| **P1** | Tab Progresso con 5 visualizzazioni | Rimosso (non esisteva, non sarà costruito) | — | ✅ Chiusa 2026-06-11 |
| **P2** | Riformulare focus/review/maintenance | Corretto: è rotazione semplice, non architetturale | — | ✅ Chiusa 2026-06-11 |
| **P3** | Aggiornare conteggio skill da ~130 a 137 | Corretto | — | ✅ Chiusa |
| **P4** | Aggiungere test di falsificazione esplicito | Riempire §6 di questo doc | founder | 🟡 Aperta |
| **P5** | Quantificare rischio "complementare" | Stima TAM segmento "scuola con gestionale + budget extra pedagogia" | founder | 🟡 Aperta |
| **P6** | Allineare posizionamento a chiusura D5 (SRS reale) | Quando D5 chiusa, aggiornare §3.5 se cambia il modello | founder | 🟢 Sprint 3+ |
| **P7** | Allineare posizionamento a chiusura D7 (player video) | Dopo 30gg uso, aggiornare narrativa "zero infrastruttura video" se cambia | founder | 🟢 Dopo 30gg uso |

---

## 6. TEST DI FALSIFICAZIONE (skeleton da riempire)

Per ciascuno scenario, definire: che probabilità ha (basso/medio/alto) e cosa faresti se accadesse.

| Scenario | Probabilità | Quanto del vantaggio resta? | Risposta |
|---|---|---|---|
| Zen Planner aggiunge "daily practice suggestion" basata su curriculum caricato | ? | ? | ? |
| budoo.one aggiunge logica focus/review/maintenance al campus | ? | ? | ? |
| Una federazione MA italiana lancia un'app interna gratuita per i propri allievi | ? | ? | ? |
| Apple/Google rilascia un template "skill practice tracker" generalizzato | ? | ? | ? |
| Maestro Bestetti / FESK decide di non sponsorizzare l'app | ? | ? | ? |
| Founder scopre che dopo 30gg di uso personale l'app non è più utile (kill metric §11.1) | Da scoprire | Tutto | Pivot o shelve |

> Da riempire dopo discussione esplicita con il founder.

---

## 7. DOMANDE STRATEGICHE APERTE

Domande che l'analisi non risolve e che vanno chiuse prima di pre-vendita:

1. **Pricing target Scenario B (lignaggio Chang).** €0 è un MVP, non un modello. Subscription per scuola? Pagamento federazione → allievi gratis? Freemium con feature pro?
2. **Rapporto con FESK formalmente.** Verbale, lettera intenti, contratto? Chi possiede i contenuti video? Cosa succede se la federazione cambia idea?
3. **Switching cost se Scenario A fallisce.** Quanto della codebase è riusabile per Scenario B se il primo target non funziona?
4. **Definizione di "successo MVP personale".** §11.1 di `current-plan.md` dice "l'utilità si sente". Concretamente: dopo 6 settimane, cosa significa "decidere di andare avanti"?

---

## 8. CHANGELOG

| Versione | Data | Cambio |
|---|---|---|
| v1 | 2026-04-25 | Documento creato. Analisi originale del founder + valutazione critica iniziale dell'agent. 7 issue aperte tracciate in §5 |
