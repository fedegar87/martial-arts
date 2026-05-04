-- 0019_simplify_plan_status.sql
-- Collassa enum plan_status a 2 valori: 'focus' | 'maintenance'.
-- Tutti i record con status='review' diventano 'maintenance' (scelta conservativa).
--
-- Robusta a stati DB già parzialmente migrati: cast colonne a text PRIMA
-- degli UPDATE, così il confronto `WHERE status = 'review'` funziona sempre
-- (su colonna text, non sull'enum). Se l'enum non contiene 'review',
-- l'UPDATE è no-op senza errore. DROP TYPE ... CASCADE libera tutte le
-- funzioni dipendenti (firma o body) in un colpo solo, e poi ricreiamo:
--
-- 1. RPC update_plan_item_status: ha `p_status plan_status` nella firma
-- 2. RPC save_custom_selection: ha letterale 'review'::plan_status nel body

BEGIN;

ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE text USING default_status::text;

UPDATE user_plan_items
SET status = 'maintenance'
WHERE status = 'review';

UPDATE exam_skill_requirements
SET default_status = 'maintenance'
WHERE default_status = 'review';

DROP TYPE IF EXISTS plan_status CASCADE;
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
