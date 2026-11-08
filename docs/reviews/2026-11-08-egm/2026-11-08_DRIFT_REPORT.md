# EGM — coerenza fra progetto, procedure e codice

Data: 8 novembre 2026. Baseline: `d195718eff98cedea6cb3f8a10fd127776b30c99`.
Analisi in sola lettura, senza eseguire app, test, script o interrogare servizi reali.

## Esito e ordine degli interventi

L'architettura attuale resta compatibile con una scuola affiliata FESK francofona:
non serve anticipare un SaaS o generalizzare tutte le arti marziali. La documentazione,
pero', non costituisce ancora una procedura affidabile per aprire a nuovi utenti.
Sono emersi 18 rilievi deduplicati: alcuni riguardano istruzioni operative rischiose,
altri descrizioni inesatte e altri ancora prescrizioni per evoluzioni future.

Prima degli inviti reali: riallineare setup e verifiche accessi, confermare le
migrazioni applicate e svolgere il collaudo autenticato; rendere sicure le procedure
di rollback/promozione. Le condizioni legali e le traduzioni tecniche non approvate
restano aperte come gia' dichiarato, senza formulare qui una nuova valutazione legale.

Le etichette Blocker/Major/Nit sono quelle delle revisioni **documentali EGM**:
non sono severita' di vulnerabilita' e non attestano un attacco riuscito.
Il tema recovery E06 e' anche da sottoporre alla verifica di sicurezza indipendente.

## Metodo e stato dei revisori

Applicata la skill `egm-drift-report` ai tre documenti canonici e alle procedure
correnti `ui-system.md`, `i18n.md`, `access-control-checks.md`,
`legal-review-2026-11-06.md`, con letture dei sorgenti pertinenti. I documenti sono
stati confrontati con il codice, distinguendo stato attuale, storico e futuro.

| Revisore Goldfish | Persona / standard del plugin EGM 0.1.1 | Target | Stato |
|---|---|---|---|
| `egm_architecture` | `codebase_details` / `re-implementation-standard` | `docs/architecture.md` | Completato; letture obbligatorie dichiarate complete |
| `egm_rollout` | `implementation_readiness` / `implementation-readiness-standard` | Piano e procedure di apertura, invito, verifica e ripristino | Completato; letture obbligatorie dichiarate complete |
| `egm_strategy` | `zoom_out` / `zoom-out-standard` | `plan/white-label-strategy.md` | Completato; letture obbligatorie dichiarate complete |

Ogni revisore e' stato avviato con `fork_turns: none`, senza conversazione del
parent, con percorsi espliciti a persona, standard e documenti. Non si dichiara
isolamento del filesystem o esclusione delle istruzioni di progetto del sistema.
Il parent ha ricontrollato le evidenze principali e deduplicato i risultati.
Un quarto revisore indipendente, `egm_report_verify`, ha poi verificato il report
finale contro i riferimenti correnti: E01–E18 verificati, nessuna correzione
fattuale richiesta. Anche questa verifica e' stata svolta senza esecuzione o rete.
Non e' stato eseguito il ciclo iterativo di riscrittura `egm-review-loop` e non si
dichiara convergenza dopo due round: l'utente ha richiesto analisi, non correzioni.

## `skill-practice/docs/access-control-checks.md`

### E01 — Major: setup degli inviti ancora basato sui gruppi

Il setup a righe 10, 16–19 assegna i gradi e gli accessi attraverso i default del
gruppo. La 0042 copia gruppo -> invito una sola volta durante la migrazione
(`0042_invite_person_levels_bulk_ops.sql:74–94`); il provisioning corrente usa i
campi per-persona dell'invito (`0051_invite_locale.sql:60–73`). Seguire oggi la sola
forma 0037 puo' lasciare i default Shaolin 8/T'ai Chi 0/student anziche' predisporre
uno studente T'ai Chi-only o un istruttore come descritto.

Intervento: prescrivere la RPC corrente o tutti i campi espliciti dell'invito,
incluso `locale`, e verificare il profilo effettivamente creato con un account di
collaudo prima degli inviti reali.

### E02 — Major: il gate di verifica rimanda a un provisioning superato

Il gate alle righe 48–51 rimanda a `scripts/verify-rollout.sql`, che a righe 3–7
indica 0037–0041 e il corpo 0038 di `handle_new_user`. La 0045 documenta invece che
quel corpo falliva per un cast a un tipo inesistente (`0045_fix_handle_new_user_plan_mode_cast.sql:1–6`).
Lo script non dimostra ne' il provisioning per-persona ne' quello della lingua
introdotto in 0051. Il solo controllo della presenza della colonna negli script
di invito non dimostra il corpo della funzione installata.

Intervento: aggiornare attesi di funzioni, colonne e grant alla catena corrente;
separare evidenza di installazione SQL da collaudo autenticato. L'applicazione
0051 e' ancora non confermata nel documento `i18n.md:19–23`; non e' stata
interrogata nuovamente la produzione in questa analisi.

### E03 — Major: la query di pulizia degli account convertiti usa la soglia vecchia

La procedura a righe 40–43 consiglia la query 13 di `verify-rollout.sql:82–105`.
I confronti a righe 95–98 usano il grado corrente, mentre il predicato finale
0046 include il successivo (`0046_scope_up_to_next_level.sql:26–35`). Una skill
del grado successivo puo' essere segnalata fuori scope anche quando consentita.

Intervento: riallineare il controllo alla formula corrente, includendo scuola,
discipline, extra ed esame. Il risultato deve richiedere revisione, senza
cancellazione automatica dei piani.

### E05 — Major: ritentare una promozione parziale puo' ripetere quella riuscita

La procedura a righe 12 e 23 considera il caso di successo. Lo script
`scripts/promote-after-exam.mjs:108–119` esegue una RPC per disciplina e continua
dopo un errore. La RPC usa l'esame attualmente in preparazione e lo avanza
(`0042_invite_person_levels_bulk_ops.sql:546–595`), senza identificativo dell'evento
gia' elaborato. Ripetere l'intero input dopo un successo parziale puo' avanzare
di nuovo la disciplina riuscita. Si tratta di un rischio operativo del percorso
amministrativo; non e' una dimostrazione di attacco da parte di uno studente.

Intervento minimo: documentare controllo di profilo e `promotion_audit`, e
ritentare solo le coppie utente/disciplina fallite. Valutare un vincolo di
idempotenza sul risultato dell'esame se si vuole rendere sicuro il ritento completo.
Prevedere un test di fallimento parziale, senza eseguirlo su account reali.

## `skill-practice/docs/i18n.md`

### E04 — Major: rollback incompleto dopo la 0051

Il rinvio a righe 162–164 porta a `i18n-rollback.sql:4–11`, che elimina
`notification_preferences.locale`. Il trigger installato dalla 0051 continua
pero' a scriverla (`0051_invite_locale.sql:76–78`). Ripristinare soltanto una
versione applicativa precedente a 0050 non ripristina il trigger DB: la creazione
di nuovi utenti puo' quindi fallire. Restano anche colonna invito e RPC 0051.

Intervento minimo: limitare il vecchio rollback al caso 0051 non applicata oppure
prevedere prima il ripristino delle funzioni pre-0051 e una sequenza esplicita di
gestione dei dati e delle colonne. Non eseguire l'attuale rollback come intervento
di attivazione o di ordinaria manutenzione.

## `docs/architecture.md`

### E06 — Blocker documentale: confinamento recovery promesso senza scadenza

Le righe 252–254 e 809 dicono che il confinamento dura fino al cambio password.
I callback impostano invece un cookie di 15 minuti (`src/app/auth/callback/route.ts:17–23`,
`auth/confirm/route.ts:31–37`) e il proxy controlla solo la sua presenza
(`src/lib/supabase/middleware.ts:54–60`). La descrizione garantisce piu' del
controllo implementato. Il comportamento effettivo della sessione oltre la
scadenza e degli accessi diretti richiede una verifica di sicurezza separata.

Intervento: documentare il limite reale; valutare con l'audit sicurezza quale
invariante debba valere per sessione, Server Actions e accesso diretto al DB.

### E07 — Blocker documentale: formula di accesso descritta in modo incompleto

Alle righe 521–527 gli studenti limitati sono descritti sempre senza extra e
confinati alla soglia di grado. `0046_scope_up_to_next_level.sql:19–37` prevede
invece stessa scuola, bypass all-school, gate `can_view_extra_content` e
alternativamente soglia per disciplina oppure appartenenza all'esame preparato.
`profile_locked` non fa parte del predicato. Il catalogo applica ulteriori filtri
(`src/lib/queries/skills.ts:196–204,268–276`).

Intervento: esplicitare la formula e distinguere autorizzazione DB, preset
normale degli studenti e contenuto elencato dalla UI.

### E08 — Blocker documentale: flusso landing/login attribuito al componente sbagliato

Alle righe 286–291 l'anonimo sembra rediretto da `/` a `/login`, mentre
`src/app/page.tsx:5–14` rende la landing con CTA. Il login senza `next` invia al
hub (`src/lib/actions/auth.ts:18–38`); e' poi `/hub` a controllare l'onboarding
(`src/app/(app)/hub/page.tsx:13–20`). `resolveLandingDestination` risolve la CTA,
non il risultato del login.

Intervento: separare rendering pubblico, click, redirect di login e guard del hub.

### E09 — Major: failure mode di cron e delivery non documentati

Le righe 720–730 riassumono deduplica/retry ma omettono che una delivery `pending`
non viene reclamata (`training-reminder-sender.ts:223–278`), alcune eccezioni
interrompono il run, il sender allenamenti precede quello eventi e risposte
404/410 revocano la subscription. Alcune letture per utente non verificano errori
(`training-reminder-sender.ts:99–154`).

Intervento: matrice compatta di stati/errori, retry da `failed`, limiti dei `pending`,
ordine dei sender, revoca, risposte GET/POST e comportamento delle eccezioni.
Eventuali cambiamenti di affidabilita' sono un lavoro distinto dal riallineamento.

### E10 — Major rispetto allo standard: contratto dello scheduler insufficiente

Le righe 628–636 non descrivono ordine stabile, peso limitato agli slot, formula
di distribuzione, collisioni e indice della sessione presenti in
`session-scheduler.ts:27–57,75–133,148–157`; mancano vincoli e fine inclusiva del
setup (`actions/training-schedule.ts:24–75,105–155`).

Intervento: un contratto algoritmico breve e collegamenti ai test. E' una lacuna
di reimplementabilita', non la prova che l'algoritmo attuale calcoli male.

### E11 — Major: infrastruttura di test descritta parzialmente

L'inventario a righe 835–860 omette suite correnti e harness recenti. Il browser
i18n avvia il vero Next su 3107 per route pubbliche; il profilo usa pagine reali
con query/azioni simulate; il test server sostituisce Supabase e cookies; il test
PGlite applica l'intera sequenza SQL in memoria con Auth simulato. Riferimenti:
`package.json:11–17`, `tests/browser/i18n.smoke.mjs:8–42`,
`tests/browser/profile.smoke.mjs:33–125`, `tests/server/locale.mjs:8–41`,
`tests/database/invite-locale.mjs:8–45`.

Intervento: completare comandi, prerequisiti, sostituzioni e limiti, richiamando
`i18n.md:142–154`. Un test DB isolato non e' un collaudo della configurazione Supabase
installata; un mock UI non prova RLS.

### E12 — Major: manca l'eccezione privilegiata di bootstrap

Le righe 295–298 e 517–518 descrivono solo inviti, ma il trigger consente il
bootstrap admin senza invito a profili vuoti con esattamente una scuola
(`0051_invite_locale.sql:96–130`, gia' presente nella 0045).

Intervento: descrivere prerequisiti e chiusura di questa eccezione prima di
esporre una nuova istanza; non confonderla con il normale provisioning.

## `plan/white-label-strategy.md`

### E13 — Major: Fase 0 confonde assenza di refactoring con prontezza all'apertura

Le righe 145–149 dicono "nessuno" e "unica regola". Sono gia' documentate condizioni
operative e legali aperte (`legal-review-2026-11-06.md:27–35`), revisione per il
Belgio (`i18n.md:123–129`) e applicazione 0051 non confermata; gli script aggiornati
richiedono quest'ultima (`scripts/invita-utenti.mjs:208–209`,
`onboard-users.mjs:140–141`).

Intervento: dire "nessun refactoring brand/dominio per le affiliate" e richiamare
i gate esistenti. Separare codice disponibile, SQL installato e collaudo reale;
in Fase 1 prevedere anche i testi specifici del gestore nel catalogo legale.

### E14 — Major solo per il progetto futuro: convergenza multi-tenant troppo semplificata

Le righe 99 e 169–171 suggeriscono che `school_id` e RLS esistenti bastino per
convergere. Gli eventi federali 0049 sono globali all'istanza, senza `school_id`,
con lettura autenticata e snapshot globale (`0049_federation_calendar.sql:4–30,75–95`;
`queries/federation-events.ts:10–13`; `federation-event-sync.ts:12–20,45–48`).

Intervento: mantenere la Fase 3 come rivalutazione futura con inventario dei dati
globali. Non aggiungere multi-tenancy ora: gli eventi globali sono coerenti con
l'attuale deploy isolato.

### E15 — Major solo per il progetto futuro: progressi utente non sostituiscono inviti/default

La riga 122 propone `user_track_progress(user_id,...)` al posto anche di campi
di gruppo e invito. I primi esistono prima dell'account; il provisioning li usa
per crearlo (`0037_fesk_access_groups_invites.sql:22–65`, `0051:38–73`).

Intervento: separare stato dell'utente da preassegnazioni e default per percorso.
Rinviare lo schema preciso al trigger reale della Fase 2.

### E16 — Nit: fallback senza calendario non raggiungibile in Today

La riga 46 lo indica fra i moduli pronti, ma `src/app/(app)/today/page.tsx:78–88,113–123`
mostra `TodayEmptyState` quando manca lo schedule. Intervento: descrivere il
prerequisito attuale, senza ripristinare feature non richieste.

### E17 — Nit: categoria e contatore UI hanno responsabilita' diverse

La riga 71 attribuisce `isFormCategory` al contatore. Esso e' usato per aggregati
(`session-progress.ts:110–120,196–197`); la UI riceve reps su ogni item e sceglie il
counter dalle props (`TodayPracticeSections.tsx:35–43`, `TodaySkillCard.tsx:75–87`).
Intervento: correggere il punto di intervento futuro, includendo presentazione e
aggregazione se verra' introdotto `tracking_mode`.

### E18 — Nit solo per il progetto futuro: durata di categoria non ancora motivata

Le righe 134–137 introducono `est_minutes`, ma esiste gia'
`Skill.estimated_duration_seconds` (`types.ts:57`), non usato intenzionalmente
nell'anteprima (`SessionPreview.tsx:2–4`). Intervento: valutare prima il riuso o
la stima semplice; non imporre una seconda configurazione ora.

## Limiti e seguito

Nessuna conferma dello schema remoto, dei grant effettivi o delle impostazioni di
Auth/SMTP/cron e nessuna prova dinamica eseguita durante questa analisi. Lo storico
dei test citato nei documenti non e' stato trasformato in evidenza di questa run.
I percorsi Markdown del target architetturale esistono; le anomalie descritte sono
di contenuto, non semplicemente link mancanti. Non sono state corrette le fonti.

Ordine proposto: verifiche indipendenti di sicurezza -> procedure invito/rollout e
rollback -> collaudo autenticato su ambiente dedicato -> gate apertura Arlon ->
riallineamento del briefing tecnico. Le prescrizioni future E14/E15/E18 richiedono
solo correzione della strategia, non implementazione anticipata.

## Come usare le due skill nel workflow

EGM: ripetere una revisione mirata quando cambiano onboarding, scope dei contenuti,
modello scuola o procedura di rilascio. Fornire ai Goldfish documenti e codice
correnti, senza storia della conversazione; usare gli standard di architettura,
prontezza operativa e strategia. Dopo le correzioni documentali, il review-loop
puo' verificare la convergenza con nuovi revisori, senza riutilizzare come prova
le conclusioni di questa run.

Security Audit: usare revisioni mirate sui confini modificati in ogni intervento
su Auth, RLS, provisioning, cron/push o script amministrativi. Prima dell'apertura
ad Arlon risolvere le piste prioritarie con un ambiente isolato e configurazioni
osservate dal gestore; poi riesaminare i record corretti. Un nuovo audit standard
ha senso dopo modifiche trasversali ai permessi o al modello di distribuzione.
Conservare fingerprint e candidati respinti per non riproporre ipotesi gia'
smentite; non interpretare l'assenza di conferme dinamiche come approvazione.

Il piano applicato in questa run e' stato: confronto indipendente dei tre
documenti canonici e delle procedure con il codice, deduplicazione e verifica
fattuale EGM; inventario dei confini di sicurezza, caccia guidata dalla copertura,
recupero dei vuoti e due verifiche indipendenti delle piste mantenute. I dettagli
di sicurezza e i relativi limiti sono nell'area esterna
`C:/Users/FGarzia/security-audit-skill/martial-arts/run-1`.
