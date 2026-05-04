-- 0019_simplify_plan_status.sql
-- Collassa enum plan_status da 3 a 2 valori: 'focus' | 'maintenance'.
-- Tutti i record con status='review' diventano 'maintenance' (scelta conservativa).
-- Postgres non supporta DROP VALUE su enum: ricreazione del tipo.
--
-- Nota: la RPC save_custom_selection (definita in 0011) inseriva
-- 'review'::plan_status come default per gli skill aggiunti al piano custom.
-- Va ricreata per usare 'maintenance' altrimenti la prossima invocazione
-- fallirebbe con "invalid input value for enum plan_status".

BEGIN;

UPDATE user_plan_items
SET status = 'maintenance'
WHERE status = 'review';

UPDATE exam_skill_requirements
SET default_status = 'maintenance'
WHERE default_status = 'review';

ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE text USING default_status::text;

DROP TYPE plan_status;
CREATE TYPE plan_status AS ENUM ('focus', 'maintenance');

ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE plan_status USING status::plan_status;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE plan_status USING default_status::plan_status;

CREATE OR REPLACE FUNCTION public.save_custom_selection(
  p_skill_ids UUID[],
  p_discipline discipline
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE user_profiles
  SET plan_mode = 'custom'
  WHERE id = current_user_id;

  DELETE FROM user_plan_items item
  USING skills skill
  WHERE item.user_id = current_user_id
    AND item.skill_id = skill.id
    AND item.source = 'manual'
    AND skill.discipline = p_discipline
    AND NOT (item.skill_id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[])));

  INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
  SELECT
    current_user_id,
    skill.id,
    'maintenance'::plan_status,
    'manual'::plan_item_source,
    false
  FROM skills skill
  WHERE skill.id = ANY(COALESCE(p_skill_ids, ARRAY[]::UUID[]))
    AND skill.discipline = p_discipline
  ON CONFLICT (user_id, skill_id, source) DO NOTHING;
END;
$$;

COMMIT;
