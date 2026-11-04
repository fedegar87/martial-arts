-- Setup completo promemoria push per istanza (Vercel Free + Supabase Free, costo 0 €).
--
-- Checklist rapida per una nuova istanza white-label:
--   A. Genera le chiavi localmente in skill-practice/:
--        npx web-push generate-vapid-keys --json
--        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
--   B. Salva su Vercel (Environment Variables -> Production & Preview):
--        NEXT_PUBLIC_VAPID_PUBLIC_KEY = <publicKey>   (Type: Config)
--        VAPID_PRIVATE_KEY            = <privateKey>  (Type: Secret)
--        CRON_SECRET                  = <hex 64 char> (Type: Secret)
--      (VAPID_SUBJECT usa in automatico mailto: + brand.supportEmail da src/lib/brand.ts).
--   C. Incolla questo file nel Supabase SQL Editor dell'istanza sostituendo i due
--      placeholder qui sotto (NON committare mai il vero CRON_SECRET nel repository):
--        1. https://<DOMINIO_VERCEL>  (es. https://fesk-practice.vercel.app, senza slash finale)
--        2. <IL_TUO_CRON_SECRET>      (lo stesso identico valore salvato in CRON_SECRET su Vercel)

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Salva (o aggiorna) URL e CRON_SECRET nel Vault cifrato di Supabase
DO $$
DECLARE
  v_url    text := 'https://<DOMINIO_VERCEL>/api/cron/training-reminders';
  v_secret text := '<IL_TUO_CRON_SECRET>';
  v_existing_id uuid;
BEGIN
  SELECT id INTO v_existing_id FROM vault.secrets WHERE name = 'training_reminders_url' LIMIT 1;
  IF v_existing_id IS NULL THEN
    PERFORM vault.create_secret(v_url, 'training_reminders_url');
  ELSE
    PERFORM vault.update_secret(v_existing_id, v_url, 'training_reminders_url');
  END IF;

  SELECT id INTO v_existing_id FROM vault.secrets WHERE name = 'training_reminders_secret' LIMIT 1;
  IF v_existing_id IS NULL THEN
    PERFORM vault.create_secret(v_secret, 'training_reminders_secret');
  ELSE
    PERFORM vault.update_secret(v_existing_id, v_secret, 'training_reminders_secret');
  END IF;
END $$;

-- 2. Rimuove eventuale schedulazione precedente con lo stesso nome (idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'training-reminders-every-15m') THEN
    PERFORM cron.unschedule('training-reminders-every-15m');
  END IF;
END $$;

-- 3. Schedula chiamata HTTP ogni 15 minuti verso l'endpoint protetto
SELECT cron.schedule(
  'training-reminders-every-15m',
  '*/15 * * * *',
  $cron$
  SELECT net.http_get(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'training_reminders_url' LIMIT 1),
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'training_reminders_secret' LIMIT 1)
    ),
    timeout_milliseconds := 15000
  );
  $cron$
);

-- ============================================================
-- Query utili di verifica (opzionali, eseguibili separatamente)
-- ============================================================
-- Verifica che il job sia attivo:
--   SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'training-reminders-every-15m';
--
-- Ultime esecuzioni del job e risposte HTTP:
--   SELECT jobid, status, return_message, start_time, end_time
--   FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
--   SELECT id, status_code, content, created
--   FROM net._http_response ORDER BY created DESC LIMIT 10;
