import { writeFileSync } from "node:fs";

const OUT = "supabase/migrations/0004_seed_fesk.sql";

function item(name, category, practiceMode, note = null) {
  return { name, category, practiceMode, note };
}

function range(prefix, from, to, suffix, category, practiceMode, note = null) {
  return Array.from({ length: to - from + 1 }, (_, i) =>
    item(`${prefix} ${from + i}${suffix}`, category, practiceMode, note),
  );
}

const shaolin = [
  { grade: 7, items: [item("Lien Pu Ch'uan 1 Lu", "forme", "solo"), ...range("Tui Fa", 1, 2, "", "tui_fa", "solo", "Calci fondamentali")] },
  { grade: 6, items: [item("Lien Pu Ch'uan 2 Lu", "forme", "solo"), ...range("Tui Fa", 3, 4, "", "tui_fa", "solo", "Calci fondamentali")] },
  { grade: 5, items: [item("Shaolin 1 Lu", "forme", "solo"), ...range("Tui Fa", 5, 6, "", "tui_fa", "solo", "Calci fondamentali")] },
  { grade: 4, items: [item("Shaolin 2 Lu", "forme", "solo"), ...range("Tui Fa", 7, 8, "", "tui_fa", "solo", "Calci fondamentali")] },
  { grade: 3, items: [item("Shaolin 3 Lu", "forme", "solo"), ...range("Tui Fa", 9, 10, "", "tui_fa", "solo", "Calci fondamentali"), item("Po Chi 1 (Lu-Tao)", "po_chi", "both")] },
  { grade: 2, items: [item("Shaolin 4 Lu", "forme", "solo"), ...range("Tui Fa", 11, 12, "", "tui_fa", "solo", "Calci fondamentali"), item("Po Chi 2 (Lu-Tao)", "po_chi", "both")] },
  { grade: 1, items: [item("Shaolin 5 Lu", "forme", "solo"), ...range("Tui Fa", 13, 15, "", "tui_fa", "solo", "Calci fondamentali"), item("Po Chi 3 (Lu-Tao)", "po_chi", "both")] },
  { grade: -1, items: [...range("Tui Fa Lu", 1, 2, "", "tui_fa", "solo", "Forme che combinano i calci"), ...range("Po Chi", 4, 5, " (Lu-Tao)", "po_chi", "both"), ...range("Pang Fa", 1, 2, " Lu", "armi_forma", "solo", "Bastone corto"), item("Mei Hua Ch'uan Chi Pen Pa Fa", "forme", "solo", "8 metodi base Pruno Fiorito"), item("Ti Kung Ch'uan fond. (10)", "preparatori", "solo", "10 cadute fondamentali")] },
  { grade: -2, items: [item("Tui Fa Lu 3", "tui_fa", "solo"), ...range("Po Chi", 6, 7, " (Lu-Tao)", "po_chi", "both"), item("Pang Fa Po Chi 1 Tao", "armi_combattimento", "paired"), ...range("Kun Fa", 1, 2, " Lu", "armi_forma", "solo", "Bastone lungo"), item("Mei Hua Ch'uan 1 Lu", "forme", "solo"), ...range("Shaolin", 6, 7, " Lu", "forme", "solo"), item("Chinna 1 (Lu-Tao)", "chin_na", "both")] },
  { grade: -3, items: [item("Tui Fa Lu 4", "tui_fa", "solo"), item("Pa Chi Ch'uan 1 Lu", "forme", "solo"), ...range("Po Chi", 8, 9, " (Lu-Tao)", "po_chi", "both"), ...range("Shaolin", 8, 9, " Lu", "forme", "solo"), item("Kun Fa Po Chi 1 Tao", "armi_combattimento", "paired"), ...range("Tan Tao", 1, 2, " Lu", "armi_forma", "solo", "Sciabola singola"), item("Tan Tao Tui Pang Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Chinna 2 (Lu-Tao)", "chin_na", "both")] },
  { grade: -4, items: [item("Tui Fa Lu 5", "tui_fa", "solo"), ...range("Po Chi", 10, 11, " (Lu-Tao)", "po_chi", "both"), item("Shaolin 10 Lu", "forme", "solo"), ...range("Shuang Kuei", 1, 2, "", "armi_forma", "solo", "Martelli doppi"), item("Sho Hung Ch'uan", "forme", "solo"), item("Shuang Chieh Kun 1 Lu", "armi_forma", "solo", "Nunchaku"), item("Pang Fa Tui Kun Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Tan Tao Tui Kun Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Chinna 3 (Lu-Tao)", "chin_na", "both")] },
  { grade: -5, items: [item("Tui Fa Lu 6", "tui_fa", "solo"), ...range("Po Chi", 12, 13, " (Lu-Tao)", "po_chi", "both"), item("Mei Hua Ch'uan 2 Lu", "forme", "solo"), item("Pa Chi Ch'uan 2 Lu", "forme", "solo"), item("Shuang Kuei Tui Ta", "armi_combattimento", "paired", "TODO REVIEW: termine Ta da chiarire"), item("Shuang Chieh Kun Tui Pang Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Shuang Chieh Kun Tui Kun Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Kuan Tao 1 Lu", "armi_forma", "solo", "Alabarda"), item("Kun Fa 3 Lu", "armi_forma", "solo"), item("Shaolin Chiang Fa", "armi_forma", "solo", "Lancia Shaolin"), item("Chinna 4 (Lu-Tao)", "chin_na", "both")] },
  { grade: -6, items: [item("Tui Fa 7", "tui_fa", "solo"), item("Po Chi 14 (Lu-Tao)", "po_chi", "both"), item("Kung Li Ch'uan", "forme", "solo"), item("Pa Chi Ch'uan Tao", "forme", "paired"), item("Chiang Fa Tui Za (Lu-Tao)", "armi_combattimento", "paired", "TODO REVIEW: termine Za da chiarire"), item("Mei Hua Ch'uan 3 Lu", "forme", "solo"), item("Kuan Tao Tui Chiang Fa (Lu-Tao)", "armi_combattimento", "paired"), item("Shuang Tao 1 Lu", "armi_forma", "solo", "Sciabole doppie"), item("Shuang Kuei Tui Tan Tao (Lu-Tao)", "armi_combattimento", "paired"), item("Chinna 5 (Lu-Tao)", "chin_na", "both")] },
  { grade: -7, items: [item("Tui Fa 8", "tui_fa", "solo"), item("Po Chi 15 (Lu-Tao)", "po_chi", "both"), item("Tan Tao 3 Lu", "armi_forma", "solo"), item("Shuang Chieh Kun 2 Lu", "armi_forma", "solo"), item("San Chieh Kun 1 Lu", "armi_forma", "solo", "Bastone a tre sezioni"), item("Tan Tao Tui Chiang (Lu-Tao)", "armi_combattimento", "paired"), item("Mei Hua Ch'uan 4 Lu", "forme", "solo"), item("Kung Shou To Tan Tao (Tao-Lu)", "armi_combattimento", "paired"), item("Ta Hung Ch'uan", "forme", "solo"), item("Shuang Tao 2 Lu", "armi_forma", "solo"), item("Chinna 6 (Lu-Tao)", "chin_na", "both")] },
];

const taichi = [
  { grade: 5, items: [item("Tai Chi 1 Lu", "forme", "solo")] },
  { grade: 4, items: [item("Tai Chi 2 Lu", "forme", "solo")] },
  { grade: 3, items: [item("Tai Chi 3 Lu", "forme", "solo")] },
  { grade: 2, items: [item("Tai Chi 4 Lu", "forme", "solo")] },
  { grade: 1, items: [item("Tue Shou Chi Pen Pa Fa", "tue_shou", "paired", "Basi pushing hands"), item("Tai Chi 1 Lu SX", "forme", "solo")] },
  { grade: -1, items: [item("Tue Shou 1 Tao", "tue_shou", "paired"), item("Chi Kung Chi Pen Kung Chia", "chi_kung", "solo"), item("Hsing I Wu Shin Ch'uan", "forme", "solo"), item("Tai Chi 2 Lu SX", "forme", "solo")] },
  { grade: -2, items: [item("Tue Shou 2 Tao", "tue_shou", "paired"), item("San Shou Ta Lu Chi Pen Pa Fa", "ta_lu", "paired"), item("Chinna 1 (Lu-Tao)", "chin_na", "both"), item("Tai Chi 3 Lu SX", "forme", "solo")] },
  { grade: -3, items: [item("Tue Shou 3 Tao", "tue_shou", "paired"), item("Ta Lu 1 Tao", "ta_lu", "paired"), item("Mei Hua Ch'uan Chi Pen Pa Fa", "forme", "solo"), item("Chinna 2 (Lu-Tao)", "chin_na", "both"), item("Tai Chi 4 Lu SX", "forme", "solo")] },
  { grade: -4, items: [item("Tue Shou 4 Tao", "tue_shou", "paired"), item("Ta Lu 2 Tao", "ta_lu", "paired"), item("T'ai Chi Tao", "armi_forma", "solo", "Sciabola TC"), item("Liang I Ch'uan 1 Lu", "forme", "solo"), item("Chinna 3 (Lu-Tao)", "chin_na", "both")] },
  { grade: -5, items: [item("Ta Lu 3 Tao", "ta_lu", "paired"), item("T'ai Chi Tao Tui T'ai Chi Tao", "armi_combattimento", "paired"), item("T'ai Chi Kun", "armi_forma", "solo"), item("Hsing I Shih Erh Hsing", "forme", "solo"), item("Chinna 4 (Lu-Tao)", "chin_na", "both")] },
  { grade: -6, items: [item("Ta Lu 4 Tao", "ta_lu", "paired"), item("T'ai Chi Kun Tui T'ai Chi Kun", "armi_combattimento", "paired"), item("T'ai Chi Chiang", "armi_forma", "solo"), item("Lung Hsing Pa Kua Chang", "forme", "solo"), item("Chinna 5 (Lu-Tao)", "chin_na", "both")] },
  { grade: -7, items: [item("T'ai Chi Tieh Chih", "armi_forma", "solo", "TODO REVIEW: significato da confermare"), item("Mei Hua Shuang Chien", "armi_forma", "solo"), item("T'ai Chi Chiang Tui T'ai Chi Chiang", "armi_combattimento", "paired"), item("Liang I Ch'uan 2 Lu", "forme", "solo"), item("Chinna 6 (Lu-Tao)", "chin_na", "both")] },
];

const shaolinExamGrades = [8, 7, 6, 5, 4, 3, 2, 1, -1, -2, -3, -4, -5, -6, -7];
const taichiExamGrades = [5, 4, 3, 2, 1, -1, -2, -3, -4, -5, -6, -7];

const skills = [
  ...flatten("shaolin", shaolin),
  ...flatten("taichi", taichi),
];

assertCount("skills", skills.length, 137);
assertCount("Shaolin exam programs", shaolinExamGrades.length, 15);
assertCount("T'ai Chi exam programs", taichiExamGrades.length, 12);

const categoryCounts = countBy(skills, (skill) => `${skill.discipline}:${skill.category}`);
assertCount("Shaolin forme", categoryCounts.get("shaolin:forme") ?? 0, 23);
assertCount("Shaolin tui_fa", categoryCounts.get("shaolin:tui_fa") ?? 0, 23);
assertCount("Shaolin po_chi", categoryCounts.get("shaolin:po_chi") ?? 0, 15);
assertCount("Shaolin chin_na", categoryCounts.get("shaolin:chin_na") ?? 0, 6);
assertCount("Shaolin armi", (categoryCounts.get("shaolin:armi_forma") ?? 0) + (categoryCounts.get("shaolin:armi_combattimento") ?? 0), 30);
assertCount("Preparatori", categoryCounts.get("shaolin:preparatori") ?? 0, 1);
assertCount("T'ai Chi forms+chi_kung", (categoryCounts.get("taichi:forme") ?? 0) + (categoryCounts.get("taichi:chi_kung") ?? 0), 15);
assertCount("T'ai Chi tue_shou+ta_lu+chin_na", (categoryCounts.get("taichi:tue_shou") ?? 0) + (categoryCounts.get("taichi:ta_lu") ?? 0) + (categoryCounts.get("taichi:chin_na") ?? 0), 16);
assertCount("T'ai Chi armi", (categoryCounts.get("taichi:armi_forma") ?? 0) + (categoryCounts.get("taichi:armi_combattimento") ?? 0), 8);

const sql = `-- Sprint 1.5 — seed curriculum FESK.
-- Generato da scripts/generate-fesk-seed.mjs usando plan/curriculum-mapping-fesk.md.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schools) THEN
    INSERT INTO schools (id, name, description)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'FESK — Federazione Europea Scuola Kung Fu "Fong Ttai"',
      'Lignaggio Maestro Chang Dsu Yao, fondata dal Maestro Gianluigi Bestetti.'
    );
  END IF;

  UPDATE schools
  SET
    name = 'FESK — Federazione Europea Scuola Kung Fu "Fong Ttai"',
    description = 'Lignaggio Maestro Chang Dsu Yao, fondata dal Maestro Gianluigi Bestetti.';
END $$;

WITH school AS (
  SELECT id FROM schools LIMIT 1
),
skill_seed (display_order, discipline, minimum_grade_value, name, category, practice_mode, teacher_notes) AS (
  VALUES
${skills.map((skill, index) => `    (${index + 1}, ${q(skill.discipline)}::discipline, ${skill.grade}, ${q(skill.name)}, ${q(skill.category)}::skill_category, ${q(skill.practiceMode)}::practice_mode, ${q(skill.note)})`).join(",\n")}
),
inserted_skills AS (
  INSERT INTO skills (
    school_id,
    name,
    name_italian,
    category,
    discipline,
    practice_mode,
    description,
    video_url,
    thumbnail_url,
    teacher_notes,
    estimated_duration_seconds,
    minimum_grade_value,
    display_order
  )
  SELECT
    school.id,
    skill_seed.name,
    NULL,
    skill_seed.category,
    skill_seed.discipline,
    skill_seed.practice_mode,
    NULL,
    'https://www.youtube.com/watch?v=PLACEHOLDER',
    NULL,
    skill_seed.teacher_notes,
    NULL,
    skill_seed.minimum_grade_value,
    skill_seed.display_order
  FROM skill_seed
  CROSS JOIN school
  RETURNING id, discipline, minimum_grade_value
),
exam_seed (sort_order, discipline, grade_value, level_name, grade_from, grade_to, description) AS (
  VALUES
${[
  ...shaolinExamGrades.map((grade, index) => examRow(index + 1, "shaolin", grade, shaolinExamGrades[index - 1] ?? null)),
  ...taichiExamGrades.map((grade, index) => examRow(index + 1, "taichi", grade, taichiExamGrades[index - 1] ?? null)),
].join(",\n")}
),
exam_with_prev AS (
  SELECT
    *,
    LAG(grade_value) OVER (PARTITION BY discipline ORDER BY sort_order) AS previous_grade_value
  FROM exam_seed
),
inserted_exams AS (
  INSERT INTO exam_programs (
    school_id,
    discipline,
    grade_value,
    level_name,
    description,
    grade_from,
    grade_to
  )
  SELECT
    school.id,
    exam_with_prev.discipline,
    exam_with_prev.grade_value,
    exam_with_prev.level_name,
    exam_with_prev.description,
    exam_with_prev.grade_from,
    exam_with_prev.grade_to
  FROM exam_with_prev
  CROSS JOIN school
  RETURNING id, discipline, grade_value
)
INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status)
SELECT
  exam.id,
  skill.id,
  CASE
    WHEN skill.minimum_grade_value = exam.grade_value THEN 'focus'
    WHEN exam_with_prev.previous_grade_value IS NOT NULL
      AND skill.minimum_grade_value = exam_with_prev.previous_grade_value THEN 'review'
    ELSE 'maintenance'
  END::plan_status
FROM inserted_exams exam
JOIN exam_with_prev
  ON exam_with_prev.discipline = exam.discipline
 AND exam_with_prev.grade_value = exam.grade_value
JOIN inserted_skills skill
  ON skill.discipline = exam.discipline
 AND skill.minimum_grade_value >= exam.grade_value;

DO $$
DECLARE
  skill_count INT;
  shaolin_exam_count INT;
  taichi_exam_count INT;
BEGIN
  SELECT COUNT(*) INTO skill_count FROM skills;
  SELECT COUNT(*) INTO shaolin_exam_count FROM exam_programs WHERE discipline = 'shaolin';
  SELECT COUNT(*) INTO taichi_exam_count FROM exam_programs WHERE discipline = 'taichi';

  IF skill_count <> 137 THEN
    RAISE EXCEPTION 'Expected 137 skills, got %', skill_count;
  END IF;
  IF shaolin_exam_count <> 15 THEN
    RAISE EXCEPTION 'Expected 15 Shaolin exams, got %', shaolin_exam_count;
  END IF;
  IF taichi_exam_count <> 12 THEN
    RAISE EXCEPTION 'Expected 12 T''ai Chi exams, got %', taichi_exam_count;
  END IF;
END $$;

COMMIT;
`;

writeFileSync(OUT, sql);
console.log(`Wrote ${OUT}`);

function flatten(discipline, groups) {
  return groups.flatMap((group) =>
    group.items.map((skill) => ({
      ...skill,
      discipline,
      grade: group.grade,
    })),
  );
}

function countBy(values, keyFn) {
  const counts = new Map();
  for (const value of values) {
    const key = keyFn(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function assertCount(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function q(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function examRow(sortOrder, discipline, grade, previousGrade) {
  const label = gradeLabel(grade);
  const previousLabel = previousGrade === null ? null : gradeLabel(previousGrade);
  const levelName = `${discipline === "shaolin" ? "Shaolin" : "T'ai Chi"} ${label}`;
  const description =
    previousLabel === null
      ? `Punto di partenza ${discipline === "shaolin" ? "Shaolin" : "T'ai Chi"}`
      : `Da ${previousLabel} a ${label}`;

  return `    (${sortOrder}, ${q(discipline)}::discipline, ${grade}, ${q(levelName)}, ${q(previousLabel)}, ${q(label)}, ${q(description)})`;
}

function gradeLabel(value) {
  if (value > 0) return `${value}° Chi`;
  if (value >= -6) return `${Math.abs(value)}° Chieh`;
  return `${Math.abs(value) - 6}° Mezza Luna`;
}
