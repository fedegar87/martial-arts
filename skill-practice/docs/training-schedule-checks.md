# Verifica delle tabelle di allenamento

Controlli locali del 2026-11-11. Tutti i dati sono sintetici: nessun account,
lettura di `.env.local`, collegamento a Supabase o modifica di allenamenti reali
nei test dedicati.

Esito: 138 test unitari superati, 15.327 scenari server superati, prove browser
it/fr superate con CSS reali, tutte le 56 migrazioni e regressioni RPC superate
su PostgreSQL in memoria. Lint, controllo TypeScript e build superati.

## Regole verificate

- Il piano esame include gli esercizi del grado selezionato, non tutti i gradi
  precedenti. Il seed attuale per Shaolin 2° Chieh e T'ai Chi 2° Chieh contiene
  14 esercizi: 6 sono forme o forme con armi, gli altri sono tecniche.
- Le sessioni per ciclo sono `giorni selezionati × settimane del ciclo`.
  I cicli disponibili durano 1, 2 o 4 settimane; 4 settimane sono 28 giorni,
  indipendentemente dal mese di calendario.
- Ogni esercizio focus compare due volte per ciclo, ogni mantenimento una.
  Con un solo giorno di allenamento nell'intero ciclo, il focus compare una
  volta per evitare duplicati nella stessa sessione.
- Nessun esercizio appare due volte nella stessa sessione. Il numero di
  esercizi varia al massimo di uno fra le sessioni dello stesso ciclo.
  Il bilanciamento riguarda il numero di esercizi, non la loro durata reale.
- Le ripetizioni (1–10) si applicano a `forme` e `armi_forma` nella sessione;
  non moltiplicano i giorni assegnati. Il primo incremento salva l'obiettivo
  giornaliero anche se esiste gia' un log con una nota. Cambiare impostazione
  conserva l'obiettivo salvato, anche dopo aver riportato il contatore a zero.
  Anche il completamento dal calendario conserva il target preesistente e
  rifiuta il salvataggio se il caricamento della programmazione fallisce.
- In modalita' esame il filtro disciplina limita la tabella; nel piano
  personale vengono usate entrambe le discipline selezionate nel piano.
  Le query escludono elementi nascosti e la sorgente di piano inattiva.
- Le durate 4/8/12/24 settimane includono il giorno iniziale: la fine e'
  `inizio + settimane × 7 - 1`, inclusiva. I giorni di riposo non avanzano
  l'indice della sessione; dopo la fine il programma risulta scaduto.

Esempio con 14 esercizi tutti focus e allenamento quotidiano:

| Ciclo | Sessioni nel ciclo | Assegnazioni | Esercizi al giorno |
| --- | ---: | ---: | ---: |
| 1 settimana | 7 | 28 | 4 |
| 2 settimane | 14 | 28 | 2 |
| 4 settimane | 28 | 28 | 1 |

Con 13 focus su quattro settimane risultano 26 assegnazioni e due giorni
selezionati senza esercizi. Con mantenimento il totale scende a `2 × focus +
mantenimento`. Aumentare le ripetizioni aumenta il lavoro sulle forme, senza
cambiare questi conteggi.

## Prove ripetibili

Eseguire da `skill-practice/`:

```sh
npm test
npm run build
npm run test:training-schedule
npm run test:training-plan
```

`npm test` comprende la logica pura: matrice di 90 configurazioni (1/3/7
giorni, cicli 1/2/4 settimane, dieci combinazioni focus/mantenimento), due
cicli consecutivi, copertura esatta, duplicati, carico bilanciato, ordine
indipendente dall'input, date inclusive, ora legale, anno bisestile, input
non validi, progressi e target storici. Include il caso da 13/14 esercizi.

`test:training-schedule` riesegue i test pertinenti e aggiunge:

- `tests/server/training-schedule.mjs`: le Server Actions reali con Supabase,
  traduzioni, redirect e invalidazione cache simulati. 15.240 combinazioni
  (127 insiemi di giorni × 3 cicli × 10 ripetizioni × 4 durate) piu' 87 scenari
  per filtri, errori, date, autenticazione, reset e obiettivi giornalieri.
- `tests/browser/training-schedule.smoke.mjs`: il componente `SetupForm`
  reale in Chromium, con salvataggio simulato e riapertura. Verifica giorni,
  cicli, ripetizioni, durata, fine inclusiva, focus/mantenimento, discipline,
  passaggio esame/personale, piano vuoto, italiano/francese e viewport
  320/390 px. Screenshot in `test-results/training-schedule/`.

Questi due runner riusano esbuild e Playwright di `../tools/video/`, senza
nuove dipendenze applicative. Il test browser richiede i CSS di una build.

`test:training-plan` applica tutte le migrazioni a PostgreSQL in memoria
(PGlite), invocando le RPC reali come `authenticated` con due utenti
sintetici. Verifica il seed, piano incrementale, disciplina singola/doppia,
conservazione dei due piani, status/visibilita', ripristino di una selezione
nascosta, esami non ammessi e isolamento utenti. Riusa il runtime PGlite gia'
disponibile in `test-results/sql-tools/`, come `tests/database/invite-locale.mjs`;
non e' parte delle dipendenze dell'app o della CI.

## Correzioni e rilascio

Correzioni locali: carico sbilanciato dopo collisioni focus, anteprima
personale filtrata dal vecchio esame, focus sovrastimato su un solo slot,
forme confuse con tecniche nella stima, fine anteprima spostata di un giorno,
target non salvato su log esistenti e perso in calendario dopo azzeramento,
riepiloghi T'ai Chi mancanti ai gradi negativi, range data non validi.

`0056_restore_selected_custom_items.sql` corregge la riselezione di un
esercizio manuale nascosto: lo rende visibile conservando lo status. Mantiene
i controlli esistenti su utente, scuola, disciplina e accesso ai contenuti.
La migrazione sostituisce solo la funzione e non riscrive righe esistenti;
e' verificata sul database isolato e applicata a Supabase su conferma
dell'utente.
Per annullare la sola correzione si ripristina il corpo della funzione con
`ON CONFLICT (user_id, skill_id, source) DO NOTHING`, mantenendo gli stessi
grant e controlli della 0040.

La programmazione e' calcolata dalla configurazione corrente, anche per le
date passate: cambi di piano, filtri o algoritmo possono spostare le
assegnazioni storiche. I log restano registrati e possono comparire come
pratica libera. Il motore non e' un SRS e non garantisce distanza minima fra
le due occorrenze focus. Queste prove non sostituiscono un collaudo
autenticato dell'istanza pubblicata e non verificano PostgREST o il provider
Auth reale.
