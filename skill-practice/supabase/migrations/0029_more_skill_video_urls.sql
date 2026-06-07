-- Aggiunge video reali per Po Chi 10-11, Shaolin 8-10 Lu, Ti Kung Ch'uan fond.,
-- Mei Hua Ch'uan Chi Pen Pa Fa e Sho Hung Ch'uan (sostituisce PLACEHOLDER seedati in 0004).
-- Match per name + discipline (univoco entro la scuola FESK).
-- I titoli in romanizzazione Wade-Giles usano "Ti" (第, ordinale) + numerale:
-- Pa=8, Chiu=9, Shih=10, Shih I=11.

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=z-J-SuFLDYs'
WHERE name = 'Po Chi 10 (Lu-Tao)' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=EjNAJuHA1Gg'
WHERE name = 'Po Chi 11 (Lu-Tao)' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=NCZHdseetUI'
WHERE name = 'Shaolin 8 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=5hpz-IGoGOc'
WHERE name = 'Shaolin 9 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=i15gIj7PVjU'
WHERE name = 'Shaolin 10 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=AzRXv7mr4No'
WHERE name = 'Ti Kung Ch''uan fond. (10)' AND discipline = 'shaolin';

-- Mei Hua Ch'uan fondamentali: stessa forma base presente sia in shaolin sia in taichi.
UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=Nm8guic9SlI'
WHERE name = 'Mei Hua Ch''uan Chi Pen Pa Fa';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=0JHe99_-WBM'
WHERE name = 'Sho Hung Ch''uan' AND discipline = 'shaolin';
