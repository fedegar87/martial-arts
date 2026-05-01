-- Sprint 1.5 — seed curriculum FESK.
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
    (1, 'shaolin'::discipline, 7, 'Lien Pu Ch''uan 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (2, 'shaolin'::discipline, 7, 'Tui Fa 1', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (3, 'shaolin'::discipline, 7, 'Tui Fa 2', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (4, 'shaolin'::discipline, 6, 'Lien Pu Ch''uan 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (5, 'shaolin'::discipline, 6, 'Tui Fa 3', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (6, 'shaolin'::discipline, 6, 'Tui Fa 4', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (7, 'shaolin'::discipline, 5, 'Shaolin 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (8, 'shaolin'::discipline, 5, 'Tui Fa 5', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (9, 'shaolin'::discipline, 5, 'Tui Fa 6', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (10, 'shaolin'::discipline, 4, 'Shaolin 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (11, 'shaolin'::discipline, 4, 'Tui Fa 7', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (12, 'shaolin'::discipline, 4, 'Tui Fa 8', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (13, 'shaolin'::discipline, 3, 'Shaolin 3 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (14, 'shaolin'::discipline, 3, 'Tui Fa 9', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (15, 'shaolin'::discipline, 3, 'Tui Fa 10', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (16, 'shaolin'::discipline, 3, 'Po Chi 1 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (17, 'shaolin'::discipline, 2, 'Shaolin 4 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (18, 'shaolin'::discipline, 2, 'Tui Fa 11', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (19, 'shaolin'::discipline, 2, 'Tui Fa 12', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (20, 'shaolin'::discipline, 2, 'Po Chi 2 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (21, 'shaolin'::discipline, 1, 'Shaolin 5 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (22, 'shaolin'::discipline, 1, 'Tui Fa 13', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (23, 'shaolin'::discipline, 1, 'Tui Fa 14', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (24, 'shaolin'::discipline, 1, 'Tui Fa 15', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Calci fondamentali'),
    (25, 'shaolin'::discipline, 1, 'Po Chi 3 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (26, 'shaolin'::discipline, -1, 'Tui Fa Lu 1', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Forme che combinano i calci'),
    (27, 'shaolin'::discipline, -1, 'Tui Fa Lu 2', 'tui_fa'::skill_category, 'solo'::practice_mode, 'Forme che combinano i calci'),
    (28, 'shaolin'::discipline, -1, 'Po Chi 4 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (29, 'shaolin'::discipline, -1, 'Po Chi 5 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (30, 'shaolin'::discipline, -1, 'Pang Fa 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Bastone corto'),
    (31, 'shaolin'::discipline, -1, 'Pang Fa 2 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Bastone corto'),
    (32, 'shaolin'::discipline, -1, 'Mei Hua Ch''uan Chi Pen Pa Fa', 'forme'::skill_category, 'solo'::practice_mode, '8 metodi base Pruno Fiorito'),
    (33, 'shaolin'::discipline, -1, 'Ti Kung Ch''uan fond. (10)', 'forme'::skill_category, 'solo'::practice_mode, '10 cadute fondamentali'),
    (34, 'shaolin'::discipline, -2, 'Tui Fa Lu 3', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (35, 'shaolin'::discipline, -2, 'Po Chi 6 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (36, 'shaolin'::discipline, -2, 'Po Chi 7 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (37, 'shaolin'::discipline, -2, 'Pang Fa Po Chi 1 Tao', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (38, 'shaolin'::discipline, -2, 'Kun Fa 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Bastone lungo'),
    (39, 'shaolin'::discipline, -2, 'Kun Fa 2 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Bastone lungo'),
    (40, 'shaolin'::discipline, -2, 'Mei Hua Ch''uan 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (41, 'shaolin'::discipline, -2, 'Shaolin 6 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (42, 'shaolin'::discipline, -2, 'Shaolin 7 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (43, 'shaolin'::discipline, -2, 'Chinna 1 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (44, 'shaolin'::discipline, -3, 'Tui Fa Lu 4', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (45, 'shaolin'::discipline, -3, 'Pa Chi Ch''uan 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (46, 'shaolin'::discipline, -3, 'Po Chi 8 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (47, 'shaolin'::discipline, -3, 'Po Chi 9 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (48, 'shaolin'::discipline, -3, 'Shaolin 8 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (49, 'shaolin'::discipline, -3, 'Shaolin 9 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (50, 'shaolin'::discipline, -3, 'Kun Fa Po Chi 1 Tao', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (51, 'shaolin'::discipline, -3, 'Tan Tao 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Sciabola singola'),
    (52, 'shaolin'::discipline, -3, 'Tan Tao 2 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Sciabola singola'),
    (53, 'shaolin'::discipline, -3, 'Tan Tao Tui Pang Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (54, 'shaolin'::discipline, -3, 'Chinna 2 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (55, 'shaolin'::discipline, -4, 'Tui Fa Lu 5', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (56, 'shaolin'::discipline, -4, 'Po Chi 10 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (57, 'shaolin'::discipline, -4, 'Po Chi 11 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (58, 'shaolin'::discipline, -4, 'Shaolin 10 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (59, 'shaolin'::discipline, -4, 'Shuang Kuei 1', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Martelli doppi'),
    (60, 'shaolin'::discipline, -4, 'Shuang Kuei 2', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Martelli doppi'),
    (61, 'shaolin'::discipline, -4, 'Sho Hung Ch''uan', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (62, 'shaolin'::discipline, -4, 'Shuang Chieh Kun 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Nunchaku'),
    (63, 'shaolin'::discipline, -4, 'Pang Fa Tui Kun Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (64, 'shaolin'::discipline, -4, 'Tan Tao Tui Kun Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (65, 'shaolin'::discipline, -4, 'Chinna 3 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (66, 'shaolin'::discipline, -5, 'Tui Fa Lu 6', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (67, 'shaolin'::discipline, -5, 'Po Chi 12 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (68, 'shaolin'::discipline, -5, 'Po Chi 13 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (69, 'shaolin'::discipline, -5, 'Mei Hua Ch''uan 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (70, 'shaolin'::discipline, -5, 'Pa Chi Ch''uan 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (71, 'shaolin'::discipline, -5, 'Shuang Kuei Tui Ta', 'armi_combattimento'::skill_category, 'paired'::practice_mode, 'TODO REVIEW: termine Ta da chiarire'),
    (72, 'shaolin'::discipline, -5, 'Shuang Chieh Kun Tui Pang Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (73, 'shaolin'::discipline, -5, 'Shuang Chieh Kun Tui Kun Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (74, 'shaolin'::discipline, -5, 'Kuan Tao 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Alabarda'),
    (75, 'shaolin'::discipline, -5, 'Kun Fa 3 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (76, 'shaolin'::discipline, -5, 'Shaolin Chiang Fa', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Lancia Shaolin'),
    (77, 'shaolin'::discipline, -5, 'Chinna 4 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (78, 'shaolin'::discipline, -6, 'Tui Fa 7', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (79, 'shaolin'::discipline, -6, 'Po Chi 14 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (80, 'shaolin'::discipline, -6, 'Kung Li Ch''uan', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (81, 'shaolin'::discipline, -6, 'Pa Chi Ch''uan Tao', 'forme'::skill_category, 'paired'::practice_mode, NULL),
    (82, 'shaolin'::discipline, -6, 'Chiang Fa Tui Za (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, 'TODO REVIEW: termine Za da chiarire'),
    (83, 'shaolin'::discipline, -6, 'Mei Hua Ch''uan 3 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (84, 'shaolin'::discipline, -6, 'Kuan Tao Tui Chiang Fa (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (85, 'shaolin'::discipline, -6, 'Shuang Tao 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Sciabole doppie'),
    (86, 'shaolin'::discipline, -6, 'Shuang Kuei Tui Tan Tao (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (87, 'shaolin'::discipline, -6, 'Chinna 5 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (88, 'shaolin'::discipline, -7, 'Tui Fa 8', 'tui_fa'::skill_category, 'solo'::practice_mode, NULL),
    (89, 'shaolin'::discipline, -7, 'Po Chi 15 (Lu-Tao)', 'po_chi'::skill_category, 'both'::practice_mode, NULL),
    (90, 'shaolin'::discipline, -7, 'Tan Tao 3 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (91, 'shaolin'::discipline, -7, 'Shuang Chieh Kun 2 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (92, 'shaolin'::discipline, -7, 'San Chieh Kun 1 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Bastone a tre sezioni'),
    (93, 'shaolin'::discipline, -7, 'Tan Tao Tui Chiang (Lu-Tao)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (94, 'shaolin'::discipline, -7, 'Mei Hua Ch''uan 4 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (95, 'shaolin'::discipline, -7, 'Kung Shou To Tan Tao (Tao-Lu)', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (96, 'shaolin'::discipline, -7, 'Ta Hung Ch''uan', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (97, 'shaolin'::discipline, -7, 'Shuang Tao 2 Lu', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (98, 'shaolin'::discipline, -7, 'Chinna 6 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (99, 'taichi'::discipline, 5, 'Tai Chi 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (100, 'taichi'::discipline, 4, 'Tai Chi 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (101, 'taichi'::discipline, 3, 'Tai Chi 3 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (102, 'taichi'::discipline, 2, 'Tai Chi 4 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (103, 'taichi'::discipline, 1, 'Tue Shou Chi Pen Pa Fa', 'tue_shou'::skill_category, 'paired'::practice_mode, 'Basi pushing hands'),
    (104, 'taichi'::discipline, 1, 'Tai Chi 1 Lu SX', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (105, 'taichi'::discipline, -1, 'Tue Shou 1 Tao', 'tue_shou'::skill_category, 'paired'::practice_mode, NULL),
    (106, 'taichi'::discipline, -1, 'Chi Kung Chi Pen Kung Chia', 'chi_kung'::skill_category, 'solo'::practice_mode, NULL),
    (107, 'taichi'::discipline, -1, 'Hsing I Wu Shin Ch''uan', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (108, 'taichi'::discipline, -1, 'Tai Chi 2 Lu SX', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (109, 'taichi'::discipline, -2, 'Tue Shou 2 Tao', 'tue_shou'::skill_category, 'paired'::practice_mode, NULL),
    (110, 'taichi'::discipline, -2, 'San Shou Ta Lu Chi Pen Pa Fa', 'ta_lu'::skill_category, 'paired'::practice_mode, NULL),
    (111, 'taichi'::discipline, -2, 'Chinna 1 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (112, 'taichi'::discipline, -2, 'Tai Chi 3 Lu SX', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (113, 'taichi'::discipline, -3, 'Tue Shou 3 Tao', 'tue_shou'::skill_category, 'paired'::practice_mode, NULL),
    (114, 'taichi'::discipline, -3, 'Ta Lu 1 Tao', 'ta_lu'::skill_category, 'paired'::practice_mode, NULL),
    (115, 'taichi'::discipline, -3, 'Mei Hua Ch''uan Chi Pen Pa Fa', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (116, 'taichi'::discipline, -3, 'Chinna 2 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (117, 'taichi'::discipline, -3, 'Tai Chi 4 Lu SX', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (118, 'taichi'::discipline, -4, 'Tue Shou 4 Tao', 'tue_shou'::skill_category, 'paired'::practice_mode, NULL),
    (119, 'taichi'::discipline, -4, 'Ta Lu 2 Tao', 'ta_lu'::skill_category, 'paired'::practice_mode, NULL),
    (120, 'taichi'::discipline, -4, 'T''ai Chi Tao', 'armi_forma'::skill_category, 'solo'::practice_mode, 'Sciabola TC'),
    (121, 'taichi'::discipline, -4, 'Liang I Ch''uan 1 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (122, 'taichi'::discipline, -4, 'Chinna 3 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (123, 'taichi'::discipline, -5, 'Ta Lu 3 Tao', 'ta_lu'::skill_category, 'paired'::practice_mode, NULL),
    (124, 'taichi'::discipline, -5, 'T''ai Chi Tao Tui T''ai Chi Tao', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (125, 'taichi'::discipline, -5, 'T''ai Chi Kun', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (126, 'taichi'::discipline, -5, 'Hsing I Shih Erh Hsing', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (127, 'taichi'::discipline, -5, 'Chinna 4 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (128, 'taichi'::discipline, -6, 'Ta Lu 4 Tao', 'ta_lu'::skill_category, 'paired'::practice_mode, NULL),
    (129, 'taichi'::discipline, -6, 'T''ai Chi Kun Tui T''ai Chi Kun', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (130, 'taichi'::discipline, -6, 'T''ai Chi Chiang', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (131, 'taichi'::discipline, -6, 'Lung Hsing Pa Kua Chang', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (132, 'taichi'::discipline, -6, 'Chinna 5 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL),
    (133, 'taichi'::discipline, -7, 'T''ai Chi Tieh Chih', 'armi_forma'::skill_category, 'solo'::practice_mode, 'TODO REVIEW: significato da confermare'),
    (134, 'taichi'::discipline, -7, 'Mei Hua Shuang Chien', 'armi_forma'::skill_category, 'solo'::practice_mode, NULL),
    (135, 'taichi'::discipline, -7, 'T''ai Chi Chiang Tui T''ai Chi Chiang', 'armi_combattimento'::skill_category, 'paired'::practice_mode, NULL),
    (136, 'taichi'::discipline, -7, 'Liang I Ch''uan 2 Lu', 'forme'::skill_category, 'solo'::practice_mode, NULL),
    (137, 'taichi'::discipline, -7, 'Chinna 6 (Lu-Tao)', 'chin_na'::skill_category, 'both'::practice_mode, NULL)
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
    (1, 'shaolin'::discipline, 8, 'Shaolin 8° Chi', NULL, '8° Chi', 'Punto di partenza Shaolin'),
    (2, 'shaolin'::discipline, 7, 'Shaolin 7° Chi', '8° Chi', '7° Chi', 'Da 8° Chi a 7° Chi'),
    (3, 'shaolin'::discipline, 6, 'Shaolin 6° Chi', '7° Chi', '6° Chi', 'Da 7° Chi a 6° Chi'),
    (4, 'shaolin'::discipline, 5, 'Shaolin 5° Chi', '6° Chi', '5° Chi', 'Da 6° Chi a 5° Chi'),
    (5, 'shaolin'::discipline, 4, 'Shaolin 4° Chi', '5° Chi', '4° Chi', 'Da 5° Chi a 4° Chi'),
    (6, 'shaolin'::discipline, 3, 'Shaolin 3° Chi', '4° Chi', '3° Chi', 'Da 4° Chi a 3° Chi'),
    (7, 'shaolin'::discipline, 2, 'Shaolin 2° Chi', '3° Chi', '2° Chi', 'Da 3° Chi a 2° Chi'),
    (8, 'shaolin'::discipline, 1, 'Shaolin 1° Chi', '2° Chi', '1° Chi', 'Da 2° Chi a 1° Chi'),
    (9, 'shaolin'::discipline, -1, 'Shaolin 1° Chieh', '1° Chi', '1° Chieh', 'Da 1° Chi a 1° Chieh'),
    (10, 'shaolin'::discipline, -2, 'Shaolin 2° Chieh', '1° Chieh', '2° Chieh', 'Da 1° Chieh a 2° Chieh'),
    (11, 'shaolin'::discipline, -3, 'Shaolin 3° Chieh', '2° Chieh', '3° Chieh', 'Da 2° Chieh a 3° Chieh'),
    (12, 'shaolin'::discipline, -4, 'Shaolin 4° Chieh', '3° Chieh', '4° Chieh', 'Da 3° Chieh a 4° Chieh'),
    (13, 'shaolin'::discipline, -5, 'Shaolin 5° Chieh', '4° Chieh', '5° Chieh', 'Da 4° Chieh a 5° Chieh'),
    (14, 'shaolin'::discipline, -6, 'Shaolin 6° Chieh', '5° Chieh', '6° Chieh', 'Da 5° Chieh a 6° Chieh'),
    (15, 'shaolin'::discipline, -7, 'Shaolin 1° Mezza Luna', '6° Chieh', '1° Mezza Luna', 'Da 6° Chieh a 1° Mezza Luna'),
    (1, 'taichi'::discipline, 5, 'T''ai Chi 5° Chi', NULL, '5° Chi', 'Punto di partenza T''ai Chi'),
    (2, 'taichi'::discipline, 4, 'T''ai Chi 4° Chi', '5° Chi', '4° Chi', 'Da 5° Chi a 4° Chi'),
    (3, 'taichi'::discipline, 3, 'T''ai Chi 3° Chi', '4° Chi', '3° Chi', 'Da 4° Chi a 3° Chi'),
    (4, 'taichi'::discipline, 2, 'T''ai Chi 2° Chi', '3° Chi', '2° Chi', 'Da 3° Chi a 2° Chi'),
    (5, 'taichi'::discipline, 1, 'T''ai Chi 1° Chi', '2° Chi', '1° Chi', 'Da 2° Chi a 1° Chi'),
    (6, 'taichi'::discipline, -1, 'T''ai Chi 1° Chieh', '1° Chi', '1° Chieh', 'Da 1° Chi a 1° Chieh'),
    (7, 'taichi'::discipline, -2, 'T''ai Chi 2° Chieh', '1° Chieh', '2° Chieh', 'Da 1° Chieh a 2° Chieh'),
    (8, 'taichi'::discipline, -3, 'T''ai Chi 3° Chieh', '2° Chieh', '3° Chieh', 'Da 2° Chieh a 3° Chieh'),
    (9, 'taichi'::discipline, -4, 'T''ai Chi 4° Chieh', '3° Chieh', '4° Chieh', 'Da 3° Chieh a 4° Chieh'),
    (10, 'taichi'::discipline, -5, 'T''ai Chi 5° Chieh', '4° Chieh', '5° Chieh', 'Da 4° Chieh a 5° Chieh'),
    (11, 'taichi'::discipline, -6, 'T''ai Chi 6° Chieh', '5° Chieh', '6° Chieh', 'Da 5° Chieh a 6° Chieh'),
    (12, 'taichi'::discipline, -7, 'T''ai Chi 1° Mezza Luna', '6° Chieh', '1° Mezza Luna', 'Da 6° Chieh a 1° Mezza Luna')
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
  'focus'::plan_status
FROM inserted_exams exam
JOIN exam_with_prev
  ON exam_with_prev.discipline = exam.discipline
 AND exam_with_prev.grade_value = exam.grade_value
JOIN inserted_skills skill
  ON skill.discipline = exam.discipline
 AND skill.minimum_grade_value = exam.grade_value;

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
