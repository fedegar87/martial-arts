-- Aggiunge video reali per altre 7 skill (sostituisce PLACEHOLDER seedati in 0004).
-- Match per name + discipline (univoco entro la scuola FESK).

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=af5ESEYiCSg'
WHERE name = 'Po Chi 7 (Lu-Tao)' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=YrORYC-DhHY'
WHERE name = 'Shaolin 6 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=JD97ycFEn44'
WHERE name = 'Shaolin 7 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=BCtbk6GJbcY'
WHERE name = 'Pa Chi Ch''uan 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=pf8t8cI2FgQ'
WHERE name = 'Mei Hua Ch''uan 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=rPmAPBYfFuw'
WHERE name = 'Kun Fa 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=aZpUtxCEbWc'
WHERE name = 'Kun Fa 2 Lu' AND discipline = 'shaolin';
