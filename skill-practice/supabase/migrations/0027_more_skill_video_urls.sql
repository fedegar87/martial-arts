-- Aggiunge video reali per Lien Pu 1-2, Shaolin 1-5, Tui Fa Lu 1-2 e Tui Fa fondamentali.
-- Match per name + discipline (univoco entro la scuola FESK seedata in 0004).
-- Il video "Tui Fa fondamentali" copre tutti i 15 calci singoli: stesso video_url su Tui Fa 1..15.

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=0AKfjy5lfk4'
WHERE name = 'Lien Pu Ch''uan 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=ZxrEdiupTiA'
WHERE name = 'Lien Pu Ch''uan 2 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=9Z8pvyu-H4M'
WHERE name = 'Shaolin 1 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=McAFineSuOY'
WHERE name = 'Shaolin 2 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=XICGTKsb7h0'
WHERE name = 'Shaolin 3 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=eVnF8o9d8z0'
WHERE name = 'Shaolin 4 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=2l_tfEeMgEE'
WHERE name = 'Shaolin 5 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=QoHNMyFJHsA'
WHERE name = 'Tui Fa Lu 1' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=0n7IgLQ_1EQ'
WHERE name = 'Tui Fa Lu 2' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=JciCYm59xNQ'
WHERE name = 'Tui Fa Lu 3' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=LyI-RLZ7lzA'
WHERE name IN (
  'Tui Fa 1', 'Tui Fa 2', 'Tui Fa 3', 'Tui Fa 4', 'Tui Fa 5',
  'Tui Fa 6', 'Tui Fa 7', 'Tui Fa 8', 'Tui Fa 9', 'Tui Fa 10',
  'Tui Fa 11', 'Tui Fa 12', 'Tui Fa 13', 'Tui Fa 14', 'Tui Fa 15'
) AND discipline = 'shaolin';
