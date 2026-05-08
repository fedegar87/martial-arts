BEGIN;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, skill_id, date
      ORDER BY created_at DESC, id DESC
    ) AS rn,
    bool_or(completed) OVER (
      PARTITION BY user_id, skill_id, date
    ) AS merged_completed,
    max(reps_done) OVER (
      PARTITION BY user_id, skill_id, date
    ) AS merged_reps_done,
    first_value(reps_target) OVER (
      PARTITION BY user_id, skill_id, date
      ORDER BY (reps_target IS NOT NULL) DESC, created_at DESC, id DESC
    ) AS merged_reps_target,
    first_value(nullif(btrim(personal_note), '')) OVER (
      PARTITION BY user_id, skill_id, date
      ORDER BY (nullif(btrim(personal_note), '') IS NOT NULL) DESC, created_at DESC, id DESC
    ) AS merged_personal_note
  FROM practice_logs
),
updated AS (
  UPDATE practice_logs target
  SET
    completed = ranked.merged_completed,
    reps_done = coalesce(ranked.merged_reps_done, 0),
    reps_target = ranked.merged_reps_target,
    personal_note = coalesce(ranked.merged_personal_note, target.personal_note)
  FROM ranked
  WHERE target.id = ranked.id
    AND ranked.rn = 1
  RETURNING target.id
)
DELETE FROM practice_logs target
USING ranked
WHERE target.id = ranked.id
  AND ranked.rn > 1;

ALTER TABLE practice_logs
  ADD CONSTRAINT practice_logs_user_skill_date_key
  UNIQUE (user_id, skill_id, date);

CREATE INDEX IF NOT EXISTS practice_logs_user_date_idx
  ON practice_logs (user_id, date);

CREATE OR REPLACE FUNCTION public.update_plan_item_last_practiced_at(
  target_skill_id uuid,
  practiced_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE user_plan_items
  SET last_practiced_at = GREATEST(
    COALESCE(last_practiced_at, practiced_at),
    practiced_at
  )
  WHERE user_id = auth.uid()
    AND skill_id = target_skill_id;
$$;

GRANT EXECUTE ON FUNCTION public.update_plan_item_last_practiced_at(uuid, timestamptz)
  TO authenticated;

COMMIT;
