-- Read-only checks after 0051-0054. Expect every esito to be true.
-- No user records or credentials are returned.
WITH installed AS (
  SELECT
    to_regprocedure('public.prevent_user_profile_privilege_changes()') AS profile_guard,
    pg_get_functiondef(to_regprocedure('public.prevent_user_profile_privilege_changes()')) AS profile_body,
    to_regprocedure('public.promote_user_after_exam(uuid,discipline,uuid)') AS promotion,
    pg_get_functiondef(to_regprocedure('public.current_practice_streak(uuid,date)')) AS streak_body
)
SELECT checks.controllo, COALESCE(checks.esito, false) AS esito
FROM installed i
CROSS JOIN LATERAL (VALUES
  ('01_trigger_profilo_attivo', EXISTS (
    SELECT 1 FROM pg_trigger t
    WHERE t.tgrelid = to_regclass('public.user_profiles')
      AND t.tgfoid = i.profile_guard
      AND NOT t.tgisinternal AND t.tgenabled IN ('O', 'A')
      AND (t.tgtype & 19) = 19
  )),
  ('02_protezione_profilo_0052',
    position('profile access is managed by administrators' IN i.profile_body) > 0),
  ('03_vincolo_date_programma', EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = to_regclass('public.training_schedule')
      AND conname = 'training_schedule_date_domain' AND contype = 'c'
  )),
  ('04_vincolo_date_pratica', EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = to_regclass('public.practice_logs')
      AND conname = 'practice_logs_date_domain' AND contype = 'c'
  )),
  ('05_streak_date_non_finite_bloccate',
    position('not isfinite(p_today)' IN lower(i.streak_body)) > 0),
  ('06_promozione_con_esame_atteso', i.promotion IS NOT NULL),
  ('07_vecchia_promozione_rimossa',
    to_regprocedure('public.promote_user_after_exam(uuid,discipline)') IS NULL),
  ('08_promozione_negata_a_utenti',
    NOT has_function_privilege('authenticated', i.promotion::oid, 'EXECUTE')),
  ('09_promozione_negata_ad_anonimi',
    NOT has_function_privilege('anon', i.promotion::oid, 'EXECUTE')),
  ('10_promozione_consentita_al_server',
    has_function_privilege('service_role', i.promotion::oid, 'EXECUTE')),
  ('11_date_storiche_programma_regolari', NOT EXISTS (
    SELECT 1 FROM public.training_schedule
    WHERE NOT (start_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
      AND end_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31')
  )),
  ('12_date_storiche_pratica_regolari', NOT EXISTS (
    SELECT 1 FROM public.practice_logs
    WHERE NOT (date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31')
  ))
) AS checks(controllo, esito)
ORDER BY checks.controllo;
