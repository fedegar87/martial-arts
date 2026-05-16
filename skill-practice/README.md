# Kung Fu Practice

PWA Next.js per la pratica guidata del curriculum FESK: programma personale, sessione del giorno, calendario pratica, progressi e promemoria allenamento.

La fonte di verita di prodotto e architettura resta [../plan/current-plan.md](../plan/current-plan.md). Le regole operative per lavorare nel progetto sono in [CLAUDE.md](CLAUDE.md).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth/Postgres/RLS
- Service worker statico in `public/sw.js`
- Web Push + VAPID per promemoria allenamento opt-in
- Vercel hosting + cron

## Setup locale

```bash
npm install
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
npm run build
```

La Supabase CLI non e assunta disponibile nel PATH: se non c'e, validare le migration via review SQL e applicarle con il workflow previsto dal progetto.
