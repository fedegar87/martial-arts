-- SOLO ANNULLAMENTO: NON ESEGUIRE PER ATTIVARE IL MULTILINGUA.
-- Installazione: supabase/migrations/0050_i18n_content_and_notifications.sql.
-- Questo file elimina le traduzioni e la preferenza di lingua dei promemoria.
-- Esportare prima i dati da conservare e ripristinare la versione applicativa
-- precedente a 0050, che non richiede queste colonne.

begin;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='user_invites' and column_name='locale'
  ) or position('notification_preferences' in pg_get_functiondef('public.handle_new_user'::regproc)) > 0 then
    raise exception 'Rollback blocked: provisioning 0051 requires locale. Keep the additive schema and roll back the app, or prepare a separate reviewed provisioning migration.';
  end if;
end;
$$;
alter table public.skills drop column if exists translations;
alter table public.exam_programs drop column if exists translations;
alter table public.news_items drop column if exists translations;
alter table public.notification_preferences drop column if exists locale;
commit;
