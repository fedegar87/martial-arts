-- Let exam-mode schedules choose which active exam disciplines feed Today/Calendar.
-- Custom plans ignore this field and always use all manual plan items.

BEGIN;

ALTER TABLE training_schedule
  ADD COLUMN exam_disciplines discipline[] NOT NULL
    DEFAULT ARRAY['shaolin', 'taichi']::discipline[],
  ADD CONSTRAINT ts_exam_disciplines_scope CHECK (
    exam_disciplines = ARRAY['shaolin']::discipline[]
    OR exam_disciplines = ARRAY['taichi']::discipline[]
    OR exam_disciplines = ARRAY['shaolin', 'taichi']::discipline[]
  );

COMMIT;
