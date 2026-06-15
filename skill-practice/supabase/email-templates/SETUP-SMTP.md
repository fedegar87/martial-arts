# Setup email di invito brandizzate — Resend + SMTP custom (piano gratuito)

Runbook per attivare l'invio delle email di invito FESK dal dominio
`feskfongttai.it`, con il template `invite.html` di questa cartella.
Tutto su piani gratuiti: Resend free (3.000 mail/mese, 100/giorno) + Supabase free
(SMTP custom incluso) + hosting logo su Vercel (`public/`).

L'unico prerequisito non banale: **accesso ai DNS di `feskfongttai.it`** per
aggiungere 3-4 record. Se non li gestisci tu, sbloccalo prima di iniziare.

---

## Fase 0 — Prerequisiti

- [ ] Deploy fatto: `https://<dominio-produzione>/logo-fesk.png` si apre nel browser.
- [ ] Hai accesso al pannello DNS di `feskfongttai.it`.

## Fase 1 — Resend: account + dominio verificato

1. Registrati su https://resend.com (free).
2. **Domains -> Add Domain** -> `feskfongttai.it`. Scegli region **EU (Ireland)**
   (dati in zona GDPR).
3. Resend mostra i record DNS da aggiungere. I valori (in particolare la chiave
   DKIM) sono unici del tuo dominio: **copiali esatti da Resend**, non da qui.
   Sono di questo tipo:

   | Tipo | Nome/Host | Valore | Note |
   |------|-----------|--------|------|
   | MX   | `send`              | `feedback-smtp.eu-west-1.amazonses.com` | priorita 10 |
   | TXT  | `send`              | `v=spf1 include:amazonses.com ~all`     | SPF |
   | TXT  | `resend._domainkey` | `p=MIGfMA0GCSq...` (lunga)               | DKIM, copia esatta |
   | TXT  | `_dmarc`            | `v=DMARC1; p=none;`                      | opzionale, consigliato |

4. Inserisci i record nel pannello DNS di `feskfongttai.it`.
5. Torna su Resend -> **Verify**. Propagazione: da pochi minuti a qualche ora.
6. **API Keys -> Create API Key** (permesso *Sending access*). Copia la chiave
   `re_...`: la vedi una volta sola.

## Fase 2 — Supabase: SMTP custom

Dashboard -> **Project Settings -> Authentication -> SMTP Settings ->
Enable Custom SMTP**:

| Campo        | Valore                       |
|--------------|------------------------------|
| Sender email | `noreply@feskfongttai.it`    |
| Sender name  | `FESK Practice`              |
| Host         | `smtp.resend.com`            |
| Port         | `465`                        |
| Username     | `resend`                     |
| Password     | la API key `re_...` (Fase 1) |

Salva.

## Fase 3 — Rate limit + URL

1. **Authentication -> Rate Limits**: alza *"Emails per hour"* (default basso) a un
   valore adeguato agli invii in blocco.
2. **Authentication -> URL Configuration**: **Site URL** e **Redirect URLs** devono
   puntare al dominio di produzione (lo stesso di `NEXT_PUBLIC_SITE_URL`), altrimenti
   il link `{{ .ConfirmationURL }}` porta sull'URL sbagliato.

## Fase 4 — Template

Dashboard -> **Authentication -> Email Templates -> Invite user**:

- **Subject**: `Benvenuto nel Tempio Digitale FESK`
- **Message body**: incolla il contenuto di `invite.html` (questa cartella).

## Fase 5 — Test

Da `skill-practice/`, con `test.json` = `[{ "email": "tua-mail@...", "name": "Test" }]`:

```
node scripts/onboard-users.mjs test.json --apply --invite
```

Verifica che la mail:
- arrivi **da `noreply@feskfongttai.it`**;
- mostri logo + tema dark/gold;
- col pulsante apra la pagina set-password sul dominio giusto.

---

## Troubleshooting

| Sintomo | Causa probabile | Fix |
|---------|-----------------|-----|
| Logo non si vede | logo non deployato o `{{ .SiteURL }}` errato | apri `https://<dominio>/logo-fesk.png`; controlla Site URL in Supabase |
| Mail in spam | DNS non ancora verificati / DMARC assente | verifica dominio su Resend; aggiungi record `_dmarc` |
| Link va su dominio sbagliato | Site URL / Redirect URLs errati | Fase 3.2 |
| "Email rate limit exceeded" | rate limit Supabase troppo basso | Fase 3.1 |
| Mittente ancora `@mail.app.supabase.io` | SMTP custom non abilitato/salvato | Fase 2 |
