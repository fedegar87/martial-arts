# Verifica testi legali del 6 novembre 2026

Stato: bozze aggiornate, con condizioni ancora aperte prima dell'invito di utenti esterni.
Il gestore ha successivamente richiesto esplicitamente commit, push e deploy su Vercel delle bozze, mantenendo visibili le riserve. Questa pubblicazione non attesta il completamento delle verifiche legali e operative elencate sotto.

## Dati confermati dal gestore

- Gestore a titolo personale: Federico Garzia, senza incarico formale FESK.
- Servizio gratuito, attualmente riservato ai maggiorenni su invito.
- Il gestore non intende pubblicare email o altro recapito. Nessun indirizzo è stato inventato; il contatto della federazione è stato rimosso dai testi legali dell'app.

## Riscontri nel repository

- Non erano presenti tag letterali `[PLACEHOLDER: ...]` nelle quattro pagine: erano presenti riserve di revisione legale.
- Le pagine utilizzano `src/components/legal/LegalPage.tsx`, che mostrava una data di giugno e riferimenti alla federazione anche nell'avviso di bozza.
- Il titolare non coincide automaticamente con il nome della federazione configurato in `src/lib/brand.ts`.
- `requestAccountDeletion` registra una richiesta: l'eliminazione richiede un amministratore. Non è implementata una scadenza automatica per inattività.
- La disattivazione push aggiorna `revoked_at`; non elimina il record. Anche il mittente revoca le sottoscrizioni non più valide senza cancellarle.
- L'SDK `@supabase/ssr` installato imposta cookie con durata massima di 400 giorni. Il nome predefinito deriva dal riferimento del progetto; sono possibili frammenti numerici e un cookie PKCE. La durata del cookie non equivale alla validità del token.
- `auth_password_update` dura al massimo 15 minuti ed è eliminato dopo l'aggiornamento della password.
- Il service worker usa `fesk-practice-v6` per risorse statiche e pagina offline; non salva le pagine private. La pulizia al logout è best effort e non cancella i dati sul server.
- `VideoPlayer.tsx` carica un iframe `youtube-nocookie.com` dopo il clic. Non contiene un'informativa specifica presso il pulsante né un controllo distinto per gli eventuali strumenti non necessari del fornitore.
- Non sono stati modificati autenticazione, routing, schema dati, logica applicativa o player.
- Progetto Vercel verificato con CLI: `fesk-practice`, root directory `skill-practice`, Node 24.x. Il collegamento `.vercel` nella root identifica questo progetto; quello interno a `skill-practice` identifica un altro progetto chiamato `skill-practice`.
- La modifica preesistente a `skill-practice/.gitignore` non fa parte di questo intervento.

## Condizioni ancora necessarie

1. **Contatto del titolare:** indicare un canale effettivo per le comunicazioni e l'esercizio dei diritti. Il nome del gestore e il comando di cancellazione account non sono sufficienti a coprire tutte le richieste. Non serve inventare una PEC o una partita IVA per una persona fisica.
2. **Conservazione:** adottare tempi o criteri effettivi e una procedura manuale coerente, inclusi inviti inutilizzati, storico, sottoscrizioni revocate, dati di invio, log ed eventuali backup. Non esiste un termine GDPR universale di 12 mesi dopo la cancellazione.
3. **Fornitori e trasferimenti:** verificare regione Supabase, soggetti contrattuali, accordi applicabili agli account effettivi, sub-responsabili e garanzie di trasferimento. La configurazione `fra1` di Vercel non dimostra residenza esclusivamente UE di ogni trattamento. Il DPA pubblico Vercel consultato dichiara applicabilità ai piani Pro/Enterprise; non è stato verificato il piano dell'account né va dedotta automaticamente l'assenza di un accordo diverso.
4. **Player esterno:** verificare cookie, memorizzazione locale e richieste effettive in produzione prima e dopo l'avvio. La modalità di privacy avanzata non garantisce assenza di trattamento. Se risultano strumenti non necessari, occorre predisporre consenso informato preventivo e revocabile; questo richiederebbe un intervento funzionale distinto dal solo testo autorizzato.
5. **Contenuti e gestione:** confermare autorizzazioni d'uso dei materiali/marchi, basi giuridiche rispetto al servizio personale, misure organizzative e modalità effettive per assistenza e comunicazione delle modifiche.

Il carattere gratuito e informale non dimostra, da solo, l'applicabilità dell'esenzione per attività esclusivamente personali o domestiche. Non è stata presunta tale esenzione per il previsto invito di utenti esterni.

## Fonti consultate

- [GDPR, testo ufficiale italiano, artt. 2, 5, 6, 12-14, 22, 28, 37 e 44 ss.](https://eur-lex.europa.eu/eli/reg/2016/679/oj/?locale=it)
- [Garante: contenuti e tempi dell'informativa](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/8981258)
- [Garante: principi fondamentali, conservazione e responsabilizzazione](https://www.garanteprivacy.it/web/guest/home/principi-fondamentali-del-trattamento)
- [Garante: esercizio dei diritti e reclamo](https://www.garanteprivacy.it/home/diritti/come-agire-per-tutelare-i-tuoi-dati-personali)
- [Garante: linee guida cookie del 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)
- [Garante: FAQ cookie](https://www.garanteprivacy.it/faq/Cookie)
- [Supabase: Data Processing Addendum](https://supabase.com/legal/customer-resources/data-processing-addendum)
- [Vercel: Data Processing Addendum, sezioni 1 e 4](https://vercel.com/legal/dpa)
- [YouTube: incorporamento e modalità di privacy avanzata](https://support.google.com/youtube/answer/171780?hl=it)
- [Codice civile, testo ufficiale, art. 1229](https://www.normattiva.it/eli/id/1942/04/04/042U0262/CONSOLIDATED/20260118)
- [MIMIT: diritti dei consumatori e servizi digitali](https://www.mimit.gov.it/images/stories/documenti/allegati/Quaderno_MC_anno_2023.pdf)

## Verifica tecnica

- `npm run lint`: superato sullo stato finale.
- `npm run typecheck`: superato sullo stato finale, con TypeScript strict.
- `npm run build`: superato; tutte e quattro le pagine legali sono prerenderizzate. Il primo tentativo nella sandbox ha incontrato `spawn EPERM` durante l'avvio del processo TypeScript; la ripetizione fuori sandbox ha completato la build senza modificare configurazioni o dipendenze.
- HTML generato: verificati data aggiornata, testi attesi, identità del gestore dove pertinente, assenza del contatto della federazione e collegamenti tra le quattro pagine.
- `git diff --check`: superato. Nessuna modifica a schema, routing o logica applicativa.

Il superamento dei controlli tecnici non risolve le condizioni legali e operative elencate sopra. Le riserve rimangono esplicite nelle bozze; non è dichiarato che tutti i dati mancanti siano stati completati.
