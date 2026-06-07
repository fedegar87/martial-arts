-- 4 video "fondamentali" di armi fuori dal programma cinture Shaolin.
-- Nuove skill (non esistono nel seed 0004): categoria 'preparatori' (label "Altro"),
-- grado-sentinella 99 = fuori dalla scala -7..8, quindi non entra negli esami.
-- In libreria compaiono nella sezione "Altro"; consultazione + selezione personale.
-- L'assert dei 137 skill della 0004 non e' toccato (gira solo nella 0004).
-- INSERT idempotenti, senza CTE (evita il falso positivo "table without RLS"
-- del linter dell'editor SQL di Supabase). skills ha gia' RLS dalla 0001.

INSERT INTO skills (
  school_id, name, name_italian, category, discipline, practice_mode,
  video_url, minimum_grade_value, display_order, teacher_notes
)
SELECT
  (SELECT id FROM schools LIMIT 1),
  'Shuang Chieh Kun fond.', 'Nunchaku - fondamentali',
  'preparatori'::skill_category, 'shaolin'::discipline, 'solo'::practice_mode,
  'https://www.youtube.com/watch?v=5CW4b75SHNI', 99, 1,
  'Fondamentali, fuori dal programma cinture'
WHERE NOT EXISTS (
  SELECT 1 FROM skills WHERE name = 'Shuang Chieh Kun fond.' AND discipline = 'shaolin'
);

INSERT INTO skills (
  school_id, name, name_italian, category, discipline, practice_mode,
  video_url, minimum_grade_value, display_order, teacher_notes
)
SELECT
  (SELECT id FROM schools LIMIT 1),
  'Kuan Tao fond.', 'Alabarda - fondamentali',
  'preparatori'::skill_category, 'shaolin'::discipline, 'solo'::practice_mode,
  'https://www.youtube.com/watch?v=uagg6MPEz2A', 99, 2,
  'Fondamentali, fuori dal programma cinture'
WHERE NOT EXISTS (
  SELECT 1 FROM skills WHERE name = 'Kuan Tao fond.' AND discipline = 'shaolin'
);

INSERT INTO skills (
  school_id, name, name_italian, category, discipline, practice_mode,
  video_url, minimum_grade_value, display_order, teacher_notes
)
SELECT
  (SELECT id FROM schools LIMIT 1),
  'Shuang Kuei fond.', 'Martelli doppi - fondamentali',
  'preparatori'::skill_category, 'shaolin'::discipline, 'solo'::practice_mode,
  'https://www.youtube.com/watch?v=afu3xltrSIk', 99, 3,
  'Fondamentali, fuori dal programma cinture'
WHERE NOT EXISTS (
  SELECT 1 FROM skills WHERE name = 'Shuang Kuei fond.' AND discipline = 'shaolin'
);

INSERT INTO skills (
  school_id, name, name_italian, category, discipline, practice_mode,
  video_url, minimum_grade_value, display_order, teacher_notes
)
SELECT
  (SELECT id FROM schools LIMIT 1),
  'Shuang Tao fond.', 'Sciabole doppie - fondamentali',
  'preparatori'::skill_category, 'shaolin'::discipline, 'solo'::practice_mode,
  'https://www.youtube.com/watch?v=TgkOnp_qvAg', 99, 4,
  'Fondamentali, fuori dal programma cinture'
WHERE NOT EXISTS (
  SELECT 1 FROM skills WHERE name = 'Shuang Tao fond.' AND discipline = 'shaolin'
);
