-- Move "Ti Kung Ch'uan fond. (10)" from "preparatori" to "forme".
-- The "preparatori" enum value remains in the schema (now empty in seed),
-- and the UI label is renamed to "Altro" in src/lib/labels.ts.

BEGIN;

UPDATE skills
SET category = 'forme'::skill_category
WHERE name = 'Ti Kung Ch''uan fond. (10)'
  AND category = 'preparatori'::skill_category;

COMMIT;
