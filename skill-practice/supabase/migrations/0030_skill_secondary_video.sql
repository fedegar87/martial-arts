-- Una skill puo' avere un secondo video con label.
-- Due semantiche d'uso:
--   1) forme paired: i due ruoli dello stesso combattimento
--      (es. Tan Tao Tui Pang Fa -> forma Tan Tao / forma Pang Fa);
--   2) forme solo con piu' esecuzioni dello stesso form
--      (es. Shuang Tao 1 Lu -> due esecuzioni).
-- video_url resta il video primario: badge "ha video" e filtri libreria restano invariati.

ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS video_label           TEXT,
  ADD COLUMN IF NOT EXISTS secondary_video_url   TEXT,
  ADD COLUMN IF NOT EXISTS secondary_video_label TEXT;
