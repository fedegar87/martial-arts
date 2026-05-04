-- Aggiunge/sostituisce video reali per Po Chi 6, Pang Fa 1, Pang Fa 2 e Mei Hua 2 Lu.
-- Match per name + discipline (univoco entro la scuola FESK).

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=fGFrpaonhnU'
WHERE name = 'Po Chi 6 (Lu-Tao)' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=jTKTapNFnIY'
WHERE name = 'Pang Fa 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=uJMqfPAjCY0'
WHERE name = 'Pang Fa 2 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=OuG-oC3i2mM'
WHERE name = 'Mei Hua Ch''uan 2 Lu' AND discipline = 'shaolin';
