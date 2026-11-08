# Analisi EGM e Security Audit

8 novembre 2026. Codice esaminato: `d195718eff98cedea6cb3f8a10fd127776b30c99`.
Entrambe le revisioni dei sorgenti sono concluse. Nessuna modifica applicativa,
migrazione, commit, push o deploy eseguito durante queste analisi.

## Piano applicato e risultati

**EGM**: tre Goldfish senza conversazione ereditata hanno confrontato architettura,
procedure di apertura e strategia white label con il codice, usando persona e
standard del plugin. Deduplicazione del parent e quarto controllo fattuale
indipendente: **18 rilievi** documentali/operativi. Non sono 18 vulnerabilità.
Non è stato eseguito il ciclo di riscrittura fino alla convergenza.

[Report EGM](2026-11-08-egm/2026-11-08_DRIFT_REPORT.md).

**Security Audit**: profilo standard sui sorgenti first-party, quattro ricognizioni,
tre ondate di hunter, critico dopo ogni ondata e critico finale distinto.
**30 unità**: 14 coperte nei sorgenti, 14 collegate a candidati, 2 bloccate da fatti
esterni sul comportamento Auth e sulle autorizzazioni CI effettive. Nessuna lacuna
materiale di sorgente aggiunta dal critico finale. I dieci candidati hanno ricevuto
ciascuno una verifica indipendente e un secondo controllo da un nuovo revisore:
**10 piste da validare, 0 vulnerabilità confermate dinamicamente**.

[Report sicurezza](C:/Users/FGarzia/security-audit-skill/martial-arts/run-1/REPORT.md)
e [piani di validazione](C:/Users/FGarzia/security-audit-skill/martial-arts/run-1/NEEDS-VALIDATION.md).
I report di sicurezza restano fuori dal repository, come previsto dalla skill.
Il ledger e i record passano i validatori ufficiali; 166 riferimenti sorgente
puntano a file e righe esistenti. Il PASS strutturale non dimostra la sicurezza.

## Ordine operativo proposto

1. **Permessi del profilo**: verificare grant e trigger effettivi per gli aggiornamenti
   diretti del proprietario. Nei sorgenti, scope dei contenuti e blocco del profilo
   non sono protetti come ruolo e scuola. Se raggiungibile, il percorso riguarda
   contenuti della stessa scuola e stato assegnato dall'amministratore; non è stata
   dimostrata un'escalation di ruolo o fra scuole.
2. **Promemoria condivisi**: validare il caso di fuso orario non valido e quello
   delle date fuori dal dominio previsto. Il codice non isola alcuni errori prima
   dell'invio; resta da provare se input ammessi possano interrompere lavoro altrui.
   Verificare separatamente il budget per proprietario e il comportamento del logout push.
3. **Recupero e bootstrap**: verificare le garanzie effettive Supabase sul cambio
   password, l'origine di callback e la chiusura del bootstrap amministratore.
   Un cookie da solo non dimostra acquisizione di un account; le piste Auth hanno
   prerequisiti precisi riportati nei record.
4. **Procedure affidabili prima di Arlon**: aggiornare inviti e verifica rollout
   alla catena corrente, confermare l'applicazione di 0051, correggere il rollback
   i18n e la procedura di ripetizione delle promozioni parziali. Questi rilievi EGM
   sono già documentati; lo stato remoto non è stato interrogato durante l'audit.
5. **Collaudo di apertura**: ambiente dedicato con utenti sintetici, gradi e lingua
   assegnati, recupero, scope e notifiche. Restano i gate di traduzione tecnica e
   verifica legale già presenti nel progetto. Non serve anticipare il SaaS o il
   modello multi-arte per una scuola affiliata francofona.

L'ordine è una priorità di lavoro, non una classificazione della severità delle
piste non dimostrate. Nei report si trovano percorsi, controlli contrari, fatti
mancanti e condizioni che potrebbero smentire ogni pista.

## Uso successivo delle skill

Usare EGM quando cambiano onboarding, permessi, briefing tecnico o strategia
white label; dopo le correzioni, un review-loop con nuovi revisori può controllare
la convergenza dei documenti. Usare Security Audit in modalità mirata per le
modifiche a Auth, RLS, provisioning e cron/push, e una revisione standard dopo
modifiche trasversali o prima di una nuova apertura esterna. Il protocollo completo
non serve per ogni modifica grafica. Conservare fingerprint e decisioni motivate
per evitare di ripetere piste smentite o perdere quelle ancora aperte.

## Limite delle prove

Analisi dei soli sorgenti: nessuna esecuzione dell'app, test, fixture, browser o
accesso a dati, segreti, endpoint o control plane live. La
[skill Security Audit](C:/Users/FGarzia/.codex/skills/security-audit/SKILL.md)
prescrive: “If every control cannot be enforced, do not execute target code”.
Il runner non dimostra tutti i controlli OS di isolamento e promozione sicura
delle evidenze richiesti; i piani indicano come risolvere questo blocco in modo
isolato. I fatti sui provider non sono stati presunti. Lo stato completo del
protocollo sui sorgenti non equivale a un collaudo operativo o a una certificazione.

I validatori sono stati usati tramite le API ufficiali pure `validateDocument`
con JSON del parent su stdin: la CLI Windows rifiuta l'apertura protetta dei file,
e quel controllo è rimasto intatto. Nessuna prova target è stata promossa.
