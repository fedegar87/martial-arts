# Training reminder push notifications — implementation plan

## Goal

Inviare all'utente un promemoria semplice nei giorni in cui ha esercizi di allenamento non completati.

Formato notifica:

- title: `Allenamento di oggi`
- body: `Apri la sessione: <nomi esercizi>`
- click: apre `/today`

Niente icone custom, immagini, colori, action buttons, reminder generici o marketing.

## UX decision

La richiesta del permesso non parte mai al page load.

- `/today`: prompt contestuale solo quando esiste una sessione odierna con esercizi non completati.
- `/profile`: gestione stabile di attivazione, disattivazione e orario.
- `/sessions/setup`: resta focalizzata sulla definizione della schedule; non richiede permessi.

Razionale: Web Push richiede gesto utente e le best practice 2026 sconsigliano prompt nativi non contestuali. La UI usa prima una CTA interna, poi il prompt nativo del browser.

## Architecture

- `notification_preferences`: preferenza globale dell'utente, orario e fuso orario.
- `push_subscriptions`: subscription browser/device, revocabile.
- `notification_deliveries`: storico tentativi e deduplica per subscription/giorno.
- `public/sw.js`: gestisce `push` e `notificationclick`.
- `src/lib/training-reminder-sender.ts`: sender server-only.
- `src/app/api/cron/training-reminders/route.ts`: endpoint cron protetto da `CRON_SECRET`.
- `vercel.json`: cron ogni 15 minuti; il filtro orario reale avviene lato server in base a `time_zone` + `reminder_time`.

## Scheduling rules

Il cron:

1. Carica preferenze abilitate.
2. Tiene solo quelle dentro la finestra locale dell'orario reminder.
3. Ricostruisce la sessione con `getScheduledSession(date, schedule, items)`.
4. Esclude gli esercizi già completati in `practice_logs`.
5. Invia solo se resta almeno un esercizio.
6. Registra una delivery per evitare duplicati giornalieri.

## Environment

Richiesti:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:privacy@example.com
CRON_SECRET=
```

Generazione chiavi:

```powershell
npx web-push generate-vapid-keys --json
```

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`
- Manuale Chrome desktop/Android: attiva da `/today`, verifica subscription DB, esegui cron con `Authorization: Bearer <CRON_SECRET>`.
- Manuale iOS: testare da PWA installata in Home Screen; Safari tab normale può non esporre Push API.
