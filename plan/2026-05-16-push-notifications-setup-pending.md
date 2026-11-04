# Promemoria Push Allenamento — Guida Rapida di Attivazione (FESK + White-Label)

Ultimo aggiornamento: **2026-11-04**.

Il codice applicativo e la migrazione DB (`0026_training_reminder_push_notifications.sql`) sono pronti, inclusi:
- finestra di recupero di **90 minuti** con retry automatico su errori temporanei e zero doppi invii nello stesso giorno;
- validazione SSRF sugli endpoint Web Push, revoca automatica della subscription del dispositivo al logout;
- icona/badge del brand (`src/lib/brand.ts` → `notificationIcon`) e fallback automatico `VAPID_SUBJECT` da `brand.supportEmail` (pronto white-label);
- messaggio dedicato per utenti **iPhone/iPad** che aprono da Safari senza aver ancora aggiunto la PWA alla schermata Home.

La UI in `/today` e `/profile` resta nascosta finché `NEXT_PUBLIC_VAPID_PUBLIC_KEY` non è impostata su Vercel.

---

## Procedura di attivazione in 4 passi (Costo 0 € su Vercel Free + Supabase Free)

### Passo 1 — Genera localmente le chiavi VAPID e il `CRON_SECRET`

Apri un terminale PowerShell nella cartella `skill-practice` sul tuo PC (non committare mai questi valori):

```powershell
cd c:\martial-arts\skill-practice
npx web-push generate-vapid-keys --json
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Il primo comando stampa `publicKey` e `privateKey`; il secondo stampa una stringa esadecimale da 64 caratteri da usare come `CRON_SECRET`.

### Passo 2 — Imposta le 3 variabili su Vercel

Su **Vercel → Project Settings → Environment Variables** (spunta `Production` e `Preview`):

| Variabile | Valore | Note |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `publicKey` generata al Passo 1 | Esposta al browser: **accende automaticamente la UI** in `/today` e `/profile`. |
| `VAPID_PRIVATE_KEY` | `privateKey` generata al Passo 1 | Solo server (mai prefisso `NEXT_PUBLIC_`). |
| `CRON_SECRET` | stringa random generata al Passo 1 | Protegge `/api/cron/training-reminders`. |

*(Opzionale: `VAPID_SUBJECT` non è più obbligatoria perché usa in automatico `mailto:` + `brand.supportEmail` da `src/lib/brand.ts`, ossia `mailto:info@feskfongttai.it` per FESK.)*

Fai **Redeploy** dell'ultimo deploy su Vercel per rendere attiva `NEXT_PUBLIC_VAPID_PUBLIC_KEY` nel bundle client.

### Passo 3 — Verifica immediata dell'endpoint

Da PowerShell verifica che Vercel risponda `200`:

```powershell
curl.exe -H "Authorization: Bearer IL_TUO_CRON_SECRET" https://<DOMINIO_VERCEL>/api/cron/training-reminders
```

Risposta attesa:

```json
{"checkedPreferences":0,"duePreferences":0,"sent":0,"skipped":0,"failed":0}
```

### Passo 4 — Attiva lo scheduler gratuito ogni 15 minuti su Supabase (`pg_cron` + `pg_net`)

Poiché Vercel Hobby non supporta cron ogni 15 minuti, il trigger gira gratuitamente dentro Supabase:

1. Apri [skill-practice/scripts/setup-push-cron.sql](../skill-practice/scripts/setup-push-cron.sql).
2. Copia il contenuto nel **Supabase SQL Editor**, sostituisci `<DOMINIO_VERCEL>` e `<IL_TUO_CRON_SECRET>` e premi **Run**.

Il job `training-reminders-every-15m` chiamerà `/api/cron/training-reminders` ogni 15 minuti leggendo il secret dal Vault cifrato di Supabase.

---

## Come testarla sul tuo telefono in 1 minuto

1. **Su Android:** apri l'app (o la PWA installata), assicurati di avere una cadenza attiva in `/sessions/setup` per il giorno corrente con almeno un esercizio non spuntato.
2. **Su iPhone:** apri prima il sito in Safari → **Condividi → Aggiungi alla schermata Home**, poi aprilo dall'icona sulla Home.
3. Vai in **Profilo → Allenamento → Promemoria**, imposta un orario tra 2–5 minuti da ora e tocca **Attiva** (concedendo il permesso notifiche al sistema operativo).
4. Per non aspettare i 15 minuti del cron al primo test, lancia manualmente il comando `curl.exe` del Passo 3 una volta superato l'orario scelto: la notifica comparirà subito sul telefono con i nomi degli esercizi rimasti per oggi!

---

## Nota per future istanze White-Label

Quando verrà creata un'istanza separata per un'altra scuola (`plan/white-label-strategy.md`), basterà ripetere identici i Passi 1–4 sul progetto Vercel e Supabase della nuova scuola: icona, nome app e indirizzo `mailto:` VAPID verranno presi automaticamente dal relativo `brand.ts`.
