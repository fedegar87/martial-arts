-- Seed iniziale: 1 federazione, 11 skill Wing Chun, 3 programmi d'esame.
-- UUID deterministici per leggibilità e debug.

-- ============================================================
-- SCHOOL
-- ============================================================

INSERT INTO schools (id, name, description) VALUES
  ('00000000-0000-0000-0001-000000000001',
   'Federazione Kung Fu',
   'Federazione di riferimento per Wing Chun tradizionale');

-- ============================================================
-- SKILLS (11 totali)
-- Convenzione UUID: 00000000-0000-0000-skill-XXXXXXXXXXXX
-- ============================================================

INSERT INTO skills (id, school_id, name, category, video_url, teacher_notes, estimated_duration_seconds, minimum_level, display_order) VALUES

-- FORME
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Siu Nim Tao - Sezione 1',
   'forme',
   'https://www.youtube.com/watch?v=PLACEHOLDER_1',
   'Concentrati sulla stabilità del cavallo. Schiena dritta, spalle rilassate.',
   300, 1, 1),

  ('00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000001',
   'Siu Nim Tao - Sezione 2',
   'forme',
   'https://www.youtube.com/watch?v=PLACEHOLDER_2',
   'Rotazione polso nel Huen Sao: lenta e precisa. Non forzare.',
   240, 1, 2),

  ('00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0001-000000000001',
   'Siu Nim Tao - Sezione 3',
   'forme',
   'https://www.youtube.com/watch?v=PLACEHOLDER_3',
   'Fak Sao: il polso resta fermo, il gomito guida il movimento.',
   200, 2, 3),

  ('00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   'Chum Kiu - Sezione 1',
   'forme',
   'https://www.youtube.com/watch?v=PLACEHOLDER_4',
   'Coordinazione passo-rotazione-tecnica. Il passo parte prima della mano.',
   300, 3, 4),

-- TECNICHE BASE
  ('00000000-0000-0000-0002-000000000005',
   '00000000-0000-0000-0001-000000000001',
   'Tan Sao',
   'tecniche_base',
   'https://www.youtube.com/watch?v=PLACEHOLDER_5',
   'Angolo 45°, gomito sulla linea centrale. Non alzare la spalla.',
   120, 1, 1),

  ('00000000-0000-0000-0002-000000000006',
   '00000000-0000-0000-0001-000000000001',
   'Bong Sao',
   'tecniche_base',
   'https://www.youtube.com/watch?v=PLACEHOLDER_6',
   'Il gomito non scende mai sotto la spalla. Braccio rilassato.',
   120, 1, 2),

  ('00000000-0000-0000-0002-000000000007',
   '00000000-0000-0000-0001-000000000001',
   'Fook Sao',
   'tecniche_base',
   'https://www.youtube.com/watch?v=PLACEHOLDER_7',
   'Polso rilassato, pressione costante in avanti sulla linea centrale.',
   120, 1, 3),

  ('00000000-0000-0000-0002-000000000008',
   '00000000-0000-0000-0001-000000000001',
   'Pak Sao',
   'tecniche_base',
   'https://www.youtube.com/watch?v=PLACEHOLDER_8',
   'Contatto breve e secco. Non spingere, schiaffeggia.',
   90, 1, 4),

-- COMBINAZIONI
  ('00000000-0000-0000-0002-000000000009',
   '00000000-0000-0000-0001-000000000001',
   'Tan Sao + Bong Sao drill',
   'combinazioni',
   'https://www.youtube.com/watch?v=PLACEHOLDER_9',
   'Transizione fluida. Nessuna pausa tra le due tecniche.',
   180, 1, 1),

  ('00000000-0000-0000-0002-000000000010',
   '00000000-0000-0000-0001-000000000001',
   'Lap Sao + contropugno',
   'combinazioni',
   'https://www.youtube.com/watch?v=PLACEHOLDER_10',
   'Il Lap tira, il pugno parte simultaneamente. Non in sequenza.',
   180, 2, 2),

-- CONDIZIONAMENTO
  ('00000000-0000-0000-0002-000000000011',
   '00000000-0000-0000-0001-000000000001',
   'Stance training (Yee Ji Kim Yeung Ma)',
   'condizionamento',
   'https://www.youtube.com/watch?v=PLACEHOLDER_11',
   '2 minuti minimo. Schiena dritta. Ginocchia verso l''interno.',
   180, 1, 1);

-- ============================================================
-- EXAM PROGRAMS
-- Convenzione UUID: 00000000-0000-0000-exam-XXXXXXXXXXXX
-- ============================================================

INSERT INTO exam_programs (id, school_id, level_number, level_name, description) VALUES
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0001-000000000001',
   1, '1° Livello',
   'Fondamenti: Siu Nim Tao sez. 1-2, tecniche base, stance'),

  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0001-000000000001',
   2, '2° Livello',
   'Siu Nim Tao completa, combinazioni, inizio Chum Kiu'),

  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0001-000000000001',
   3, '3° Livello',
   'Chum Kiu, applicazioni avanzate');

-- ============================================================
-- EXAM SKILL REQUIREMENTS (junction)
-- ============================================================

-- 1° Livello
INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'focus'),       -- SNT s1
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000002', 'focus'),       -- SNT s2
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000005', 'focus'),       -- Tan Sao
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000006', 'focus'),       -- Bong Sao
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000007', 'focus'),       -- Fook Sao
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000008', 'focus'),       -- Pak Sao
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000009', 'review'),      -- Tan+Bong drill
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000011', 'review');      -- Stance

-- 2° Livello
INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status) VALUES
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000003', 'focus'),       -- SNT s3
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000010', 'focus'),       -- Lap+contropugno
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', 'maintenance'), -- SNT s1
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000002', 'maintenance'), -- SNT s2
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000005', 'review'),      -- Tan Sao
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000006', 'review'),      -- Bong Sao
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000009', 'review');      -- Tan+Bong drill

-- 3° Livello
INSERT INTO exam_skill_requirements (exam_id, skill_id, default_status) VALUES
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000004', 'focus'),       -- Chum Kiu s1
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000003', 'review'),      -- SNT s3
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000010', 'review'),      -- Lap+contropugno
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', 'maintenance'), -- SNT s1
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000002', 'maintenance'); -- SNT s2
