-- Video reali aggiuntivi (sostituisce PLACEHOLDER seedati in 0004).
-- Match per name + discipline (univoco entro la scuola FESK).
-- Romanizzazione Wade-Giles dei titoli: "Ti" (ordinale) + numerale -> I=1, Ehr=2, San=3.

-- Forme solo, un video ciascuna.
UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=AfVFuNI_T0c'
WHERE name = 'Kun Fa 3 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=2fpuUSlAQtg'
WHERE name = 'Tan Tao 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=NRp3-P1g4F0'
WHERE name = 'Tan Tao 2 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=w_2RBRwG0QE'
WHERE name = 'Shuang Chieh Kun 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=7FvAE55rkPs'
WHERE name = 'Shuang Kuei 1' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=bRFKo_JvlmA'
WHERE name = 'Shuang Kuei 2' AND discipline = 'shaolin';

-- Tan Tao Tui Pang Fa: combattimento a coppia, due forme (un opponente per ruolo).
UPDATE skills SET
  video_url             = 'https://www.youtube.com/watch?v=6iCBdAR49tI',
  video_label           = 'Forma Tan Tao (sciabola)',
  secondary_video_url   = 'https://www.youtube.com/watch?v=DjfP3Y7GrB8',
  secondary_video_label = 'Forma Pang Fa (bastone corto)'
WHERE name = 'Tan Tao Tui Pang Fa (Lu-Tao)' AND discipline = 'shaolin';

-- Shuang Tao 1 Lu: forma solo; il video esistente (0013) resta primario, si aggiunge
-- una seconda esecuzione dello stesso form.
UPDATE skills SET
  video_label           = 'Esecuzione 1',
  secondary_video_url   = 'https://www.youtube.com/watch?v=XoYj63Yqbss',
  secondary_video_label = 'Esecuzione 2'
WHERE name = 'Shuang Tao 1 Lu' AND discipline = 'shaolin';
