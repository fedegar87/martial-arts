-- Apply after verify-hardening.sql reports both historical date checks true.
BEGIN;

ALTER TABLE public.training_schedule
  VALIDATE CONSTRAINT training_schedule_date_domain;

ALTER TABLE public.practice_logs
  VALIDATE CONSTRAINT practice_logs_date_domain;

COMMIT;
