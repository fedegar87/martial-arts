-- Correzione attribuzione video Mei Hua Ch'uan: il filmato assegnato in 0020 a
-- "Mei Hua Ch'uan 2 Lu" e' in realta' la 3 Lu. Lo spostiamo sulla forma corretta
-- e riportiamo la 2 Lu a placeholder (nessun video reale disponibile).

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=OuG-oC3i2mM'
WHERE name = 'Mei Hua Ch''uan 3 Lu' AND discipline = 'shaolin';

UPDATE skills SET video_url = 'https://www.youtube.com/watch?v=PLACEHOLDER'
WHERE name = 'Mei Hua Ch''uan 2 Lu' AND discipline = 'shaolin';
