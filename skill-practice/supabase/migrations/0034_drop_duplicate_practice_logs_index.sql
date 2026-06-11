-- L14 — Indice ridondante su practice_logs.
-- practice_logs_user_date_idx (user_id, date) creato in 0021 duplica
-- idx_practice_logs_user_dt (user_id, date DESC) gia presente da 0001: un btree
-- serve scansioni in entrambe le direzioni, quindi il secondo indice e puro costo
-- di mantenimento sul write-path piu caldo dell'app.

DROP INDEX IF EXISTS practice_logs_user_date_idx;
