-- 0019_simplify_plan_status.sql
-- Collassa enum plan_status da 3 a 2 valori: 'focus' | 'maintenance'.
-- Tutti i record con status='review' diventano 'maintenance' (scelta conservativa).
-- Postgres non supporta DROP VALUE su enum: ricreazione del tipo.
--
-- Dipendenze sull'enum da gestire prima del DROP TYPE:
--
-- 1. RPC update_plan_item_status (definita in 0011): la firma include
--    `p_status plan_status`, quindi Postgres la traccia come hard dependency
--    sull'enum. Senza DROP FUNCTION esplicita, `DROP TYPE plan_status`
--    fallisce con "cannot drop type plan_status because other objects
--    depend on it". Va droppata prima e ricreata dopo con la stessa
--    signature/body, ora vincolata al nuovo enum.
--
-- 2. RPC save_custom_selection (definita in 0011): la firma NON dipende
--    dall'enum, ma il body contiene il letterale `'review'::plan_status`
--    come default per gli skill aggiunti al piano custom. Dopo il
--    re-create del tipo senza 'review', la prossima invocazione
--    fallirebbe con "invalid input value for enum plan_status".
--    Va ricreata per usare 'maintenance'.

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

DROP FUNCTION IF EXISTS public.update_plan_item_status(UUID, plan_status);

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

CREATE OR REPLACE FUNCTION public.update_plan_item_status(
  p_skill_id UUID,
  p_status plan_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  active_source plan_item_source;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT CASE
    WHEN plan_mode = 'custom' THEN 'manual'::plan_item_source
    ELSE 'exam_program'::plan_item_source
  END
  INTO active_source
  FROM user_profiles
  WHERE id = current_user_id;

  UPDATE user_plan_items
  SET status = p_status, is_hidden = false
  WHERE user_id = current_user_id
    AND skill_id = p_skill_id
    AND source = active_source;
END;
$$;

COMMIT;
