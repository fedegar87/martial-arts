# Verifica accesso e recupero password

## Configurazione prima del rilascio

- `NEXT_PUBLIC_SITE_URL` deve essere l'origine HTTPS pubblica esatta dell'istanza,
  senza percorso/query. `APP_ORIGIN` è un'alternativa se la prima è vuota.
  In produzione una configurazione mancante/invalida blocca la richiesta di reset:
  nessun fallback agli header del chiamante. In sviluppo il default è localhost.
- Il server deve avere `SUPABASE_SERVICE_ROLE_KEY`, già usata per le operazioni
  amministrative. Firma HMAC con separazione di dominio il grant di cambio password;
  la chiave non entra nel cookie o nel client e non viene usata per cambiare password
  tramite API amministrative. Ruotarla invalida anche i grant ancora aperti.
- Nel progetto Supabase verificare Site URL e allowlist Redirect URLs, limitati
  ai domini effettivamente usati, e il template recovery. Verificare separatamente
  l'opzione che richiede la password corrente e la policy di riautenticazione:
  la presenza di `current_password` nell'azione dell'app non dimostra la policy server.
- Signup pubblico disabilitato. Per una nuova istanza, eseguire il bootstrap
  amministratore in modo controllato prima dell'esposizione; l'eccezione SQL
  zero-profili/una-scuola non identifica da sola il gestore autorizzato.

Queste sono verifiche operative da eseguire sul progetto di destinazione;
non sono dichiarazioni sulla configurazione remota già osservata.

Stato FESK, conferma dell'utente del 2026-11-08: `Allow new users to sign up`
e `Allow anonymous sign-ins` erano già disattivati. Non è stato interrogato
direttamente il provider.

Screenshot provider Email ricevuto: Email e Secure email change attivi;
Require current password when updating attivo; Secure password change disattivato;
minimo 8 caratteri, nessun requisito aggiuntivo selezionato, OTP 3600 secondi e
8 cifre. Leaked password protection disattivata. Il codice passa `current_password`
nel cambio dal profilo e non implementa il nonce email della riautenticazione:
si conserva la configurazione mostrata, con collaudo provider ancora pendente.

Vercel Production, conferma dell'utente: `NEXT_PUBLIC_SITE_URL` vale
`https://fesk-practice.vercel.app` e `SUPABASE_SERVICE_ROLE_KEY` è presente.
Il valore della chiave non è stato richiesto né acquisito. Test/build locali
successivamente superati, su autorizzazione dell'utente in una copia senza `.env`
e con soli valori fittizi: 112 test, lint, typecheck, build e 7 GET anonime su
loopback. Il collaudo con account sintetico e provider resta separato.

Screenshot URL Configuration ricevuto dall'utente: Site URL
`https://fesk-practice.vercel.app`, unico redirect
`https://fesk-practice.vercel.app/**`. L'utente ha poi confermato la sostituzione
con `https://fesk-practice.vercel.app/auth/callback` e la variante completa
`https://fesk-practice.vercel.app/auth/callback?next=/auth/update-password`, che
corrisponde al `redirectTo` del reset. Il template inviti del progetto usa
direttamente `SiteURL` + `/auth/confirm` con TokenHash, senza `redirectTo` aggiuntivo.

Template recovery fornito dall'utente: link a `/auth/confirm` con `TokenHash`,
`type=recovery` e `next=/auth/update-password`, compatibile con il codice.
Il testo inglese/italiano è stato sostituito dalla variante italiana/francese
in `supabase/email-templates/recovery.html`, con salvataggio in Supabase confermato
dall'utente. Invio e completamento del flusso restano da collaudare.
È una mail bilingue: la preferenza
account non viene sincronizzata nei metadati Auth per personalizzare il template.

## Comportamento dell'app

Solo una conferma OTP invite/recovery o un exchange PKCE riuscito emettono il
cookie `auth_password_update`. Il valore è firmato, scade dopo 15 minuti ed è
legato a utente e `session_id` verificati con `getClaims`. Refresh dell'access
token nella stessa sessione non cambia questo vincolo. Pagina e Server Action
ricontrollano il grant; l'azione non si affida al solo middleware.

Il proxy elimina marker invalidi/precedenti e conserva i cookie di refresh nei
redirect. Il logout elimina il grant; il cambio password riuscito lo elimina.
Un deploy invalida i vecchi marker costanti: riavviare il reset se già aperto.
Mentre il grant valido è presente, il proxy indirizza la navigazione protetta
alla pagina di cambio password. Non è un blocco permanente lato database:
eliminazione/scadenza del cookie non revocano la sessione Supabase.

## Collaudo in ambiente dedicato

Usare solo utenti sintetici e un progetto/mailbox usa-e-getta:

1. Invito con gradi e `locale=fr`: impostare la password e controllare lingua/scope.
2. Reset reale tramite email: password nuova ammessa solo con grant valido per
   quella sessione; errore provider mostrato senza successo apparente.
3. Sessione ordinaria con marker `1`, manomesso, scaduto o di un'altra sessione:
   l'azione deve rifiutare prima di chiamare `updateUser`.
4. Cambio password dal profilo: verificare requisito password corrente secondo
   la policy provider; confrontare password errata e corretta.
5. Link aperto dopo scadenza, logout, refresh nella stessa sessione e nuova sessione.

I test unitari verificano firma, vincolo a utente/sessione, scadenza e origine
configurata. Non sostituiscono il collaudo del provider e del template email.
