# Push notifications — setup pending

Stato al **2026-05-16**: feature implementata e in produzione, ma **disattivata in UI** finché non vengono configurate VAPID + cron secret su Vercel.

## Cosa è già fatto

- Codice feature D12/Sprint 1.16 in `main` (commit `c03c7c8`).
- Migration `0026_training_reminder_push_notifications.sql` applicata su Supabase.
- Service worker `public/sw.js` con handler `push` e `notificationclick` deployato.
- Cron job dichiarato in `vercel.json` (`*/15 * * * *`).
- Componenti `TrainingReminderPrompt` (in `/today`) e `TrainingReminderSettings` (in `/profile`) presenti nel codice ma **non renderizzati** finché manca `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

## Cosa manca per attivare

### 1. Generare le chiavi VAPID

Le push notifications web richiedono una coppia di chiavi crittografiche per identificare il server verso FCM/Mozilla/Apple, firmare le notifiche e cifrare il payload. Si generano una volta sola e restano permanenti.

In un terminale qualsiasi:

```bash
npx web-push generate-vapid-keys --json
```

Output:

```json
{
  "publicKey": "BJk8K9wH... (~87 caratteri)",
  "privateKey": "kT7Hj... (~43 caratteri)"
}
```

Tienile aperte in una nota temporanea. Non committare mai la privata.

### 2. Generare il CRON_SECRET

Stringa random lunga che protegge `/api/cron/training-reminders` da chiamate non autorizzate. Senza, chiunque potrebbe scatenare invii a tutti gli utenti.

Su Windows PowerShell:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Va bene anche una qualsiasi stringa da 40+ caratteri imprevedibili.

### 3. Configurare le env su Vercel

**Project Settings → Environment Variables**. Per ognuna spuntare sia `Production` che `Preview`:

| Nome | Valore | Server-only? |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `publicKey` dal JSON | No: il prefisso `NEXT_PUBLIC_` la espone al browser. **È il flag che ri-abilita la UI.** |
| `VAPID_PRIVATE_KEY` | `privateKey` dal JSON | Sì. Niente prefisso `NEXT_PUBLIC_`. |
| `VAPID_SUBJECT` | `mailto:letis87@gmail.com` | Sì. Deve essere `mailto:` o `https://`. |
| `CRON_SECRET` | la stringa random | Sì. |

### 4. Redeploy

Le env vars vengono lette al build. Dopo aver salvato:

- **Deployments → ultimo deploy in Ready → menu `…` → Redeploy** (senza cache).

Da qui in poi:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` è popolata → la UI di promemoria appare automaticamente in `/today` (quando ci sono esercizi non completati) e in `/profile`.
- Il cron Vercel ogni 15 minuti chiama l'endpoint protetto e invia le push agli utenti con orario reminder nella finestra corrente.

## Come avviene il "rendi di nuovo evidenti i selettori"

**Niente cambi codice richiesti.** Il rendering dei due componenti è gated da:

```ts
const pushEnabled = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
```

in [skill-practice/src/app/(app)/today/page.tsx](../skill-practice/src/app/(app)/today/page.tsx) e [skill-practice/src/app/(app)/profile/page.tsx](../skill-practice/src/app/(app)/profile/page.tsx).

Appena la variabile è popolata su Vercel e il deploy è rilanciato, i selettori riappaiono senza toccare il codice. Il gate è esplicito proprio per evitare di mostrare un bottone "Attiva" che fallisce.

## Verifica post-attivazione

Dopo il redeploy:

```bash
curl -H "Authorization: Bearer IL_TUO_CRON_SECRET" \
  https://<dominio-vercel>/api/cron/training-reminders
```

Risposta attesa subito dopo il setup (nessun utente ha ancora attivato i promemoria):

```json
{"checkedPreferences":0,"duePreferences":0,"sent":0,"skipped":0,"failed":0}
```

Errori comuni:

- `401 Unauthorized` → `CRON_SECRET` sbagliato o mancante.
- `500 Missing VAPID configuration` → manca una delle tre chiavi VAPID/subject.

## Note di attenzione

- **Vercel Hobby + cron `*/15`**: il piano Hobby ha limiti sui cron job; se non parte ogni 15 minuti, rallentare lo schedule o passare a Pro.
- **iOS**: Web Push funziona solo da PWA installata in Home Screen. Su Safari tab normale il prompt non comparirà.
- **Niente prompt automatici**: per design la richiesta del permesso parte solo da gesto utente (`/today` se ci sono esercizi non completati, `/profile` per gestione stabile).

## Quando questo documento può sparire

Quando tutti i punti di §"Cosa manca per attivare" sono fatti e una push di test arriva sul tuo dispositivo. A quel punto è sufficiente eliminare questo file e togliere lo stato "pending" da [current-plan.md](current-plan.md) §D12/§1.16 (eventualmente promuovendo la feature a "attivata in produzione").
