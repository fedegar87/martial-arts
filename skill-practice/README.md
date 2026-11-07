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
```

Eseguirli dopo la build. Usano azioni e push simulate; non scrivono nel database.
Gli screenshot sono in `test-results/`, ignorata da Git; le fixture temporanee
vengono eliminate a fine test. Le procedure di verifica accessi sono in
[docs/access-control-checks.md](docs/access-control-checks.md).

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
