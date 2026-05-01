-- Sprint 1.8 - exam programs are incremental by grade.
-- Each exam lists only the forms/techniques introduced at that grade.

BEGIN;

DELETE FROM exam_skill_requirements;

INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status)
SELECT
  exam.id,
  skill.id,
  'focus'::plan_status
FROM exam_programs exam
JOIN skills skill
  ON skill.school_id = exam.school_id
 AND skill.discipline = exam.discipline
 AND skill.minimum_grade_value = exam.grade_value;

DELETE FROM user_plan_items
WHERE source = 'exam_program';

INSERT INTO user_plan_items (user_id, skill_id, status, source, is_hidden)
SELECT
  profile.id,
  req.skill_id,
  req.default_status,
  'exam_program'::plan_item_source,
  false
FROM user_profiles profile
JOIN exam_skill_requirements req
  ON req.exam_id = profile.preparing_exam_id
  OR req.exam_id = profile.preparing_exam_taichi_id
WHERE profile.plan_mode = 'exam'
ON CONFLICT (user_id, skill_id) DO UPDATE
SET
  status = EXCLUDED.status,
  source = EXCLUDED.source,
  is_hidden = false;

COMMIT;
