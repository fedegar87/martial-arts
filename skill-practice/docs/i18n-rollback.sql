-- SOLO ANNULLAMENTO: NON ESEGUIRE PER ATTIVARE IL MULTILINGUA.
-- Installazione: supabase/migrations/0050_i18n_content_and_notifications.sql.
-- Questo file elimina le traduzioni e la preferenza di lingua dei promemoria.
-- Esportare prima i dati da conservare e ripristinare la versione applicativa
-- precedente a 0050, che non richiede queste colonne.

begin;
alter table public.skills drop column translations;
alter table public.exam_programs drop column translations;
alter table public.news_items drop column translations;
alter table public.notification_preferences drop column locale;
commit;
