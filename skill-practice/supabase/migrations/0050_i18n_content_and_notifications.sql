begin;

alter table public.notification_preferences
  add column locale text not null default 'it'
  constraint notification_preferences_locale_check check (locale in ('it', 'fr'));

comment on column public.notification_preferences.locale is
  'Language for background reminders, independent of reminder timezone.';

alter table public.skills
  add column translations jsonb not null default '{}'::jsonb
  constraint skills_translations_object check (jsonb_typeof(translations) = 'object');

alter table public.exam_programs
  add column translations jsonb not null default '{}'::jsonb
  constraint exam_programs_translations_object check (jsonb_typeof(translations) = 'object');

alter table public.news_items
  add column translations jsonb not null default '{}'::jsonb
  constraint news_items_translations_object check (jsonb_typeof(translations) = 'object');

comment on column public.skills.translations is
  'Authored localized text by locale: {"fr":{"subtitle":"...","teacher_notes":"...","description":"...","video_label":"...","secondary_video_label":"..."}}. Chinese name and technical identifiers remain unchanged. Existing table RLS also protects translations.';

commit;
