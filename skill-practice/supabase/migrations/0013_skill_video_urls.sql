-- Aggiorna video_url per skill specifiche con video reali (sostituisce PLACEHOLDER).
-- Match per name + discipline (univoco entro la scuola FESK seedata in 0004).

UPDATE skills
SET video_url = 'https://www.youtube.com/watch?v=W7O2X6dzzos'
WHERE name = 'T''ai Chi Tieh Chih'
  AND discipline = 'taichi';

UPDATE skills
SET video_url = 'https://www.youtube.com/watch?v=zmdAeGsasbE'
WHERE name = 'Shuang Tao 1 Lu'
  AND discipline = 'shaolin';

UPDATE skills
SET video_url = 'https://www.youtube.com/watch?v=FBcHVTGZIhI'
WHERE name = 'Ta Hung Ch''uan'
  AND discipline = 'shaolin';
