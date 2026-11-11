# Kung Fu Practice

PWA Next.js per la pratica guidata del curriculum FESK: programma personale, sessione del giorno, calendario con eventi federali, progressi e promemoria scelti.

La fonte di verita di prodotto e architettura resta [../plan/current-plan.md](../plan/current-plan.md). Le regole operative per lavorare nel progetto sono in [CLAUDE.md](CLAUDE.md).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth/Postgres/RLS
- Service worker statico in `public/sw.js`
- Web Push + VAPID per allenamenti ed eventi scelti
- Vercel hosting; cron Supabase `pg_cron`/`pg_net`

## Setup locale

```bash
npm ci
npm run dev
```

Variabili base:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:privacy@example.com
CRON_SECRET=
```

Generazione VAPID:

```bash
npx web-push generate-vapid-keys --json
```

## Verifica

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Italiano/francese: configurazione, cataloghi, contenuti e migrazione da applicare
prima del deploy in [docs/i18n.md](docs/i18n.md). Verifica del cambio lingua con
`npm run test:i18n` dopo la build.
`npm run test:profile` verifica il profilo completo con query e azioni simulate:
selettore lingua, riepiloghi, errori e uniformita' grafica a 320/390 px e in landscape.

I test unitari sono accanto alla logica in `src/lib/`. I test browser ripetibili
sono in `tests/browser/` e usano Chromium dal tooling locale `../tools/video/`:

```bash
npm run test:custom-selection
npm run test:federation-calendar
npm run test:training-schedule
npm run test:named-programs
```

Eseguirli dopo la build. Usano azioni e push simulate; non scrivono nel database.
Gli screenshot sono in `test-results/`, ignorata da Git; le fixture temporanee
vengono eliminate a fine test. Le procedure di verifica accessi sono in
[docs/access-control-checks.md](docs/access-control-checks.md).

La matrice dei controlli allenamento e' in
[docs/training-schedule-checks.md](docs/training-schedule-checks.md), con regole,
conteggi attesi e limiti. `npm run test:training-plan` verifica anche le RPC
su PostgreSQL in memoria usando il runtime PGlite locale gia' predisposto.
La migrazione 0056 per ripristinare le selezioni nascoste e' verificata
localmente e applicata su Supabase su conferma dell'utente.

Programma supporta piu' programmi personali con nome e selettore unico
Esame/Personali. Creazione e modifica non cambiano il programma in uso:
"Usa per allenarti" lo attiva, mantenendo giorni, ciclo e ripetizioni comuni.
La migrazione 0057 conserva la selezione personale esistente ed e' applicata
su Supabase su conferma dell'utente, con schema verificato in sola lettura.
`test:named-programs` copre migrazione/RPC su PostgreSQL in memoria, azioni e
query con I/O simulato, pagine reali nel browser a 320/390 px in italiano/francese.

`npm run ui:audit` mostra il report UI corrente; con `-- --write-report` lo
salva in `test-results/ui-audit.json`, senza versionare snapshot di collaudo.

La Supabase CLI non e assunta disponibile nel PATH: le migrazioni numerate in
`supabase/migrations/` si conservano e si applicano con il workflow del progetto.

## Deploy su Vercel Hobby

Il push su `main` avvia il deploy Vercel. Verificare CI, stato Production e
dominio pubblico, inclusi i CSS; la cache persistente della build Turbopack
e' disattivata per evitare il riuso di stili obsoleti.

Il cron ogni 15 minuti e' configurato in Supabase tramite
`scripts/setup-push-cron.sql`; sincronizza il calendario al massimo ogni ora.
Il primo import/manuale si esegue con `npm run sync:events` e non invia push.
Il workflow `.github/workflows/training-reminders.yml` resta un'alternativa manuale.

Per il solo avvio manuale da GitHub, configurare i secret:

```text
TRAINING_REMINDER_CRON_URL=https://<dominio-produzione>/api/cron/training-reminders
CRON_SECRET=<stesso valore configurato su Vercel>
```

`CRON_SECRET` deve essere presente anche nelle Environment Variables del progetto Vercel per l'ambiente Production.

## Consolidamento accessi (locale, 2026-11-08)

Istanza FESK: l'utente ha confermato i controlli 0051, l'esecuzione di 0052–0054
e le 12 righe positive di `scripts/verify-hardening.sql`. Le date storiche risultano
regolari secondo quel controllo; `0055_validate_training_dates.sql` completa la
validazione dei CHECK, con esecuzione riuscita confermata dall'utente. Il rilascio
del codice applicativo e il collaudo Auth sono separati dal setup SQL;
lo stato operativo è registrato in `../plan/current-plan.md` (D16).

Per istanze ancora da aggiornare, applicare solo le migrazioni mancanti in ordine:
0051, 0052, 0053, 0054; eseguire 0055 dopo il controllo positivo delle date storiche.
La 0054 cambia la firma della RPC amministrativa di promozione: usare il runner
aggiornato e un piano con UUID degli esami fissati. I CHECK date 0053 proteggono le
nuove scritture; riesaminare le anomalie storiche prima di `VALIDATE CONSTRAINT`.
Gate SQL aggiornato: `scripts/verify-rollout.sql`. Recupero e configurazione Auth:
[docs/auth-checks.md](docs/auth-checks.md). Rollback i18n protetto dopo 0051.

`tests/sql/` contiene bootstrap Auth simulato, catena completa di migrazioni e
regressioni. Richiede PostgreSQL usa-e-getta con sole fixture, mai un DB reale.
In questa attività è stato eseguito con immagine locale `postgres:16-alpine`, rete
Docker `none`, ambiente esplicito vuoto, sorgenti in sola lettura, scratch tmpfs
256 MiB, memoria 512 MiB, 1 CPU, 48 processi, file 64 MiB e timeout 120 s.
`run-security-hardening.sh` assume mount RO `/migrations`, `/tests`, `/rollback.sql`
e `/verify-rollout.sql`, utente `postgres` e directory scrivibile `/scratch`.
I risultati non attestano grant/configurazioni effettivi della produzione.

TypeScript ed ESLint sono stati usati come analizzatori statici tramite API dei
pacchetti installati, senza eseguire script/configurazione JavaScript del progetto
o moduli applicativi. Il compilatore TypeScript non emette file e ha i plugin
disabilitati; ESLint usa direttamente i preset installati di Next/TypeScript.
Verifica successiva completata con autorizzazione esplicita dell'utente a usare
Node locale fuori dal sandbox della skill: copia senza `.env`, nessuna credenziale
reale, soli valori fittizi, richieste esterne limitate ai Google Fonts della build.
Superati 112 test, lint completo, typecheck, build Turbopack e 7 controlli HTTP
anonimi su loopback. Per evitare problemi del wrapper shell Windows, i comandi
Node equivalenti agli script npm sono stati invocati direttamente; entrambi i
gruppi di test usano `--test-isolation=none`, con `react-server` solo per il grant.
La copia temporanea non è un artefatto di rilascio: usa configurazioni fittizie.
Restano separati deploy e collaudo reale di invito/recupero con il provider.
