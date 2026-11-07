# Strategia White-Label e Multi-Arte Marziale

**Status:** Attiva (Strategia architetturale canonica)  
**Ultimo aggiornamento:** 2026-11-04  
**Stato codice di riferimento:** Migrazioni `0001`–`0049`, `src/lib/brand.ts`, `src/app/manifest.ts`
**Sostituisce:** `docs/architecture-multitenancy-readiness.md` (eliminato), `plan/2026-06-13-white-label-multi-instance-strategy.md` (eliminato)  

---

## 0. Regole Operative per Agenti AI (Zero Over-Engineering)

Leggi queste 5 regole prima di proporre o scrivere qualsiasi modifica legata a branding, scuole o dominio marziale:

1. **Niente astrazioni speculative in anticipo:** non implementare fasi future (né Tenant Pack né tabelle multi-percorso) finché l'utente non attiva esplicitamente il relativo trigger reale (nuova scuola Chang o nuova arte marziale).
2. **Mai fare fork del repository:** tutte le scuole presenti e future condividono **un solo codebase** (`skill-practice/`). La personalizzazione avviene tramite configurazione e dati, mai clonando il codice.
3. **Niente SaaS multi-tenant prematuro:** non costruire super-admin panel, routing per sottodominio, billing automatico o onboarding self-service per scuole. Da 1 fino a ~15–20 organizzazioni ogni cliente esterno usa **un deploy Vercel + un progetto Supabase isolato** dallo stesso branch `main`.
4. **Regola igienica immediata sul codice nuovo:** quando tocchi o aggiungi codice oggi per FESK, **non spargere nuovi hardcoding gratuiti**:
   - testi di identità/scuola vanno in `src/lib/brand.ts`;
   - colori e superfici passano dalle variabili CSS di `src/app/globals.css`;
   - logica dei gradi resta confinata in `src/lib/grades.ts` (lato app) e nelle funzioni SQL esistenti (`is_valid_grade_value`, `next_grade_value`, `is_skill_in_scope`).
5. **Preserva l'esperienza FESK in produzione:** qualsiasi evoluzione futura deve mantenere invariato il comportamento attuale per gli utenti FESK.

---

## 1. Obiettivo Strategico

`skill-practice` nasce per FESK (*Federazione Europea Scuola Kung Fu "Fong Ttai"*, Scuola Chang: Shaolin + T'ai Chi), ma il suo motore pedagogico risolve un problema universale a tutte le arti marziali strutturate per programmi ed esami: **"cosa pratico oggi a casa, con i video ufficiali della mia scuola, preparando il mio esame senza dimenticare il programma pregresso"**.

La strategia copre 3 livelli progressivi di adozione senza riscrivere il prodotto:

| Livello | Caso d'uso | Esempio concreto |
|---|---|---|
| **Livello 1 — Federazione attuale** | Scuole e palestre affiliate a FESK che condividono programma, gradi, video e identità federale. | Tutte le ASD dentro FESK. |
| **Livello 2 — Stesso sistema marziale, altra organizzazione** | Altra scuola/federazione Kung Fu Chang: stessa struttura didattica (Shaolin + T'ai Chi, gradi simili), ma nome, logo, colori, testi legali e video propri. | Altra scuola Kung Fu Chang indipendente da FESK. |
| **Livello 3 — Altra arte marziale** | Disciplina con programma, categorie, cinture/gradi, terminologia e numero di percorsi completamente diversi (es. **1 solo percorso** invece della coppia Shaolin/T'ai Chi). | Scuola di Taekwondo (Kup/Dan, Poomsae), Karate, Judo, Kobudo. |

---

## 2. Fotografia Reale dell'App Oggi (Stato `0049`)

### 2.1 Lo "Scheletro Universale" già pronto (~75% del prodotto)

Questi moduli sono già **indipendenti dal Kung Fu** e costituiscono il core invariante:

- **Motore ciclico deterministico (`src/lib/session-scheduler.ts`):** distribuzione pesata 2:1 (*focus d'esame* vs *mantenimento*) lungo `giorni × settimane`. Solo `normalizeExamDisciplines` tocca i nomi delle discipline.
- **Doppio piano persistente (`exam` vs `custom`) e Sessione `/today`:** `user_plan_items` (`source: "exam_program" | "manual"`, `status: "focus" | "maintenance"`), checklist giornaliera, fallback senza calendario, note insegnante e note personali post-pratica.
- **Player video YouTube unlisted a doppio riferimento (`src/lib/youtube.ts`, `VideoPlayer.tsx`):** caricamento lazy privacy-enhanced (`youtube-nocookie.com`) con supporto a secondo video (es. applicazione/angolo alternativo: utile tanto per forme Chang quanto per Poomsae/Bunkai).
- **Calendario unificato e Progressi (`/calendar`, `/progress`, `practice_logs`):** log giornaliero unico `(user_id, skill_id, date)`, pratica libera retroattiva, streak e aggregati via RPC SQL (`count_practice_days`, `current_practice_streak`, `top_practiced_skills`).
- **Meccanismo di accesso chiuso e controllo visibilità:** inviti pre-assegnati (`user_invites`), template di gruppo (`access_groups`), blocco modifiche profilo (`profile_locked`), anteprima dei soli titoli futuri bloccati (`list_locked_skill_outline` in `0047`), bacheca (`/news`) e Web Push (`push_subscriptions`).
- **UI già parzialmente adattiva:**
  - `src/lib/brand.ts` + `src/app/manifest.ts` centralizzano già nome app, short name, descrizione, email supporto, colori manifest e motto landing.
  - `src/app/globals.css` espone già il tema tramite variabili CSS (`@theme inline`).
  - `src/components/library/DisciplineToggle.tsx` ritorna già `null` se vede meno di 2 discipline (`if (visible.length < 2) return null`), e `SetupForm.tsx` gestisce già il caso a singola disciplina.

### 2.2 Dove FESK è ancora cablata (I 4 livelli di accoppiamento reali)

#### Accoppiamento A — Identità visiva e asset statici (oltre `brand.ts`)
- Asset fissi in `public/`: `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/maskable-512.png`, `/icons/apple-touch-icon.png`, `/icon.svg`, `/og-image.png`, `/logo-fesk.png`.
- `FeskLandingHero.tsx` + `src/app/layout.tsx`: presuppongono ideogramma tradizionale cinese (`lang="zh-Hant"` e font `Noto_Serif_TC`).
- `AppHeader.tsx` usa la casetta `House` Lucide, della stessa famiglia delle altre icone; nessun asset Home specifico FESK.
- `src/app/globals.css`: palette dark/gold cablata in `:root` e font editoriali `Cormorant_Garamond` / `Spectral`.
- `public/sw.js` (`CACHE_NAME = "fesk-practice-v6"`) e `public/offline.html` (colori dark/gold inline e testo italiano).
- `supabase/email-templates/invite.html`: logo, colori e dicitura `"FESK Practice"` / `"Fong Ttai"` cablati nell'HTML da incollare su Supabase Dashboard.
- `src/app/(legal)/privacy/page.tsx` (riga 20): contiene ancora un letterale `"FESK"` accanto a `brand.federationName`.

#### Accoppiamento B — Terminologia UI
- Termini come `"forme"`, `"ripetizioni per forma"`, `"3 minuti per forma"` (`SessionPreview.tsx`) e testi fissi in italiano nei componenti.

#### Accoppiamento C — Categorie e semantica del contatore ripetizioni
- Enum Postgres `skill_category` e tipo TS `SkillCategory` (`forme`, `tui_fa`, `po_chi`, `chin_na`, `armi_forma`, `armi_combattimento`, `tue_shou`, `ta_lu`, `chi_kung`, `preparatori`).
- `isFormCategory` in `src/lib/session-progress.ts` (`category === "forme" || category === "armi_forma"`): decide a codice quali skill mostrano il contatore di ripetizioni e pesano come forme nella stima durata.

#### Accoppiamento D — Modello strutturale nel DB e script CLI (Migrazioni `0037`–`0048`)
- **Binarismo fisso `shaolin` / `taichi`:** enum `discipline ('shaolin', 'taichi')` e coppie di colonne dedicate su `user_profiles` (`assigned_level_shaolin`, `assigned_level_taichi`, `preparing_exam_id`, `preparing_exam_taichi_id`), `access_groups` (`default_level_*`, `default_preparing_exam_*`, `next_shaolin_access_group_id`, `next_taichi_access_group_id`), `user_invites` e `training_schedule` (`exam_disciplines`).
- **Matematica invertita dei gradi FESK (`8..1, -1..-7, 0=non praticato, 99=extra`) dentro PostgreSQL:**
  - `public.is_valid_grade_value(int)` e relativi `CHECK` constraint (`0042`);
  - `public.next_grade_value(int)` col salto `1 -> -1` e decremento `p_grade - 1`;
  - `public.is_skill_in_scope(uuid)` (`0046`) e `public.list_locked_skill_outline(discipline)` (`0047`), che usano `s.discipline = 'shaolin' | 'taichi'` e il confronto decrescente `s.minimum_grade_value >= floor`;
  - RPC e script CLI (`scripts/invita-utenti.mjs`, `scripts/onboard-users.mjs`, `scripts/promote-after-exam.mjs`) costruiti sulle due colonne e sul parser Chi/Chieh/Mezza Luna.
- **Migrazioni `0001`–`0048` miste Schema + Dati FESK:** `0004_seed_fesk.sql` e circa 10 migrazioni successive (`0008`, `0013`, `0014`, `0020`, `0027`, `0029`, `0031`, `0032`, `0048`) inseriscono o aggiornano skill e URL YouTube FESK direttamente nella catena di migrazione.

---

## 3. Architettura Target (Semplice e Modulare)

### 3.1 Modello di Deploy: Single Codebase + Multi-Instance Isolato

Per tutta la fase da **1 a ~15–20 organizzazioni** l'architettura scelta è **Single Codebase, Isolated Deployment**:

- **1 solo repository Git** (`martial-arts/skill-practice`), **zero branch/fork per cliente**.
- Ogni organizzazione indipendente (es. FESK, una seconda scuola Chang, una scuola di Taekwondo) ha:
  1. **1 progetto Vercel dedicato** che punta allo stesso branch `main` con variabile `NEXT_PUBLIC_TENANT=<slug>` (default `fesk`);
  2. **1 progetto Supabase dedicato** (DB, Auth, template email e amministratori completamente isolati).

**Perché questa scelta evita l'over-engineering:**
- Zero pannello super-admin multi-scuola da scrivere e manutenere.
- Isolamento fisico totale dei dati personali/GDPR tra organizzazioni diverse.
- Ogni scuola ha una PWA nativa con il proprio nome, dominio e icona sulla schermata Home del telefono.
- Poiché le tabelle hanno già `school_id` e RLS dedicata (`0028_tighten_rls_school_isolation.sql`), se in futuro si superassero ~20 piccole scuole omogenee resta possibile farle convergere su un DB condiviso senza rifare il modello dati.

### 3.2 Concetto di "Tenant Pack" (da introdurre solo in Fase 1)

Invece di spargere `if` nel codice, ciò che cambia tra un'organizzazione e l'altra viene raccolto in `src/tenants/<slug>/` (selezionato tramite `NEXT_PUBLIC_TENANT`, con fallback `fesk`):

- `brand.ts` — nome app, federazione/scuola, contatti legali, opzioni landing (motto, eventuale simbolo/ideogramma opzionale, icona header), nome cache SW.
- `theme.css` (o mappa token CSS) — override delle sole variabili `:root` (`--gold-*` → `--accent-*`, superfici, font).
- `terminology.ts` — pochi termini chiave (`primaryUnitSingular/Plural`, es. `"forma"/"forme"` vs `"poomsae"` vs `"kata"`, etichetta sezione catalogo).
- Asset statici per tenant (icone PWA, logo, OG image) serviti/copiati in build o referenziati dal manifest dinamico.
- **Separazione netta nel DB:**
  - `supabase/schema/` (o baseline strutturale): contiene **solo** tabelle, indici, funzioni, trigger e RLS, senza alcun dato FESK.
  - `supabase/seeds/<tenant>.sql`: popola `schools`, percorsi, gradi, categorie, `skills`, `exam_programs` e `access_groups` della specifica scuola.

### 3.3 Modello di Dominio Universale per Altre Arti Marziali (da introdurre solo in Fase 2)

Per supportare discipline strutturalmente diverse come il Taekwondo (1 solo percorso, gradi Kup/Dan, Poomsae + tecniche + combattimento) mantenendo intatto il funzionamento di FESK, i 3 vincoli FESK nel DB vengono sostituiti da **3 astrazioni guidate dai dati**:

#### 1. Da colonne fisse `shaolin`/`taichi` a `curriculum_tracks` (`1..N` percorsi)
- Tabella `curriculum_tracks (id, school_id, slug, label, sort_order)`:
  - **Taekwondo:** 1 riga (`slug: 'taekwondo'`). Con 1 solo percorso attivo, l'UI nasconde automaticamente ogni selettore di disciplina.
  - **FESK:** 2 righe (`'shaolin'`, `'taichi'`).
  - **Altre scuole (es. Karate + Kobudo):** 2 o più righe senza modifiche al codice.
- Stato utente per percorso normalizzato in `user_track_progress (user_id, track_id, current_grade_id, preparing_exam_id)` al posto delle coppie di colonne su `user_profiles`, `access_groups` e `user_invites`.

#### 2. Da scala numerica invertita (`8..-7`) a `grade_levels` con `rank_order` crescente (`1..N`)
- Tabella `grade_levels (id, track_id, code, label, rank_order)`:
  - `rank_order` è sempre un intero monotono crescente dove **`1` = grado iniziale** e valori più alti = gradi più avanzati:
    - *Esempio FESK Shaolin:* `1 = "8° Chi"`, ..., `8 = "1° Chi"`, `9 = "1° Chieh"`, ..., `15 = "2° Mezza Luna"`.
    - *Esempio Taekwondo:* `1 = "10° Kup (Bianca)"`, ..., `10 = "1° Kup"`, `11 = "1° Dan"`, ...
- **Semplificazione drastica di RLS e promozioni:**
  - `is_skill_in_scope` diventa universale per qualsiasi arte marziale: una skill non-extra è visibile se `skill.min_rank_order <= user_current_rank_order + 1` (o appartiene all'esame in preparazione).
  - La promozione post-esame diventa semplicemente avanzare al grado con `rank_order + 1` nel percorso superato, eliminando dal SQL ogni formula speciale (`1 -> -1`).

#### 3. Da enum `skill_category` a `skill_categories` con `tracking_mode`
- Tabella `skill_categories (id, school_id, track_id NULL, slug, label, sort_order, tracking_mode, est_minutes)`:
  - `tracking_mode = 'reps'`: attiva il contatore ripetizioni nella sessione (es. *Forme* e *Armi forma* in FESK, *Poomsae* nel Taekwondo, *Kata* nel Karate).
  - `tracking_mode = 'check'`: spunta semplice di completamento (es. *Tui Fa*, *Chin Na*, *Kibon*, *Hosinsul*).
  - `est_minutes`: sostituisce la costante cablata `"3 minuti per forma"` nel calcolo durata di `SessionPreview.tsx`.

---

## 4. Roadmap Pragmatica a Trigger (Cosa fare e QUANDO)

Non anticipare mai una fase prima che si verifichi il suo trigger concreto.

### Fase 0 — Oggi: FESK e scuole affiliate FESK
- **Trigger:** stato attuale.
- **Lavoro codice richiesto:** **nessuno.** Tutte le associazioni affiliate FESK condividono lo stesso programma e usano l'istanza corrente tramite `user_invites` e gli script `invita-utenti.mjs` / `promote-after-exam.mjs`.
- **Unica regola:** rispettare l'igiene del §0 (niente nuovi hardcoding FESK sparsi).

### Fase 1 — Prima scuola Kung Fu Chang esterna a FESK (~2–4 giorni)
- **Trigger:** accordo concreto con una seconda scuola/federazione che condivide l'impianto Shaolin + T'ai Chi ma richiede brand, testi e catalogo video propri.
- **Interventi minimi necessari (senza toccare il modello `shaolin`/`taichi`):**
  1. **Separare Schema SQL da Seed FESK:** consolidare una baseline SQL di solo schema + spostare i dati FESK in `supabase/seeds/fesk.sql` e creare `supabase/seeds/<nuova-scuola>.sql`.
  2. **Tenant Brand & Asset Pack (`NEXT_PUBLIC_TENANT`):**
     - rendere `src/lib/brand.ts` selettivo per tenant;
     - gestire asset per tenant (icone PWA, logo, ideogramma landing e font `Noto_Serif_TC` opzionali); Home conserva la casetta Lucide comune;
     - parametrizzare token colore base in `globals.css`, `CACHE_NAME` in `sw.js`, `offline.html`, fix refuso `"FESK"` in `privacy/page.tsx` e generare il template `invite.html` dal brand.
  3. **Deploy isolato:** nuovo progetto Supabase + nuovo progetto Vercel collegato allo stesso repo.

### Fase 2 — Prima scuola di altra arte marziale, es. Taekwondo (~1.5–2 settimane)
- **Trigger:** accordo concreto con una scuola il cui programma non usa la coppia Shaolin/T'ai Chi o la scala Chi/Chieh (es. Taekwondo, Karate, Judo).
- **Interventi necessari:**
  1. **Migrazione dominio DB:** introdurre `curriculum_tracks`, `grade_levels` (`rank_order` crescente), `skill_categories` (`tracking_mode`) e `user_track_progress`, migrando in modo trasparente i dati FESK esistenti.
  2. **Aggiornamento RLS e RPC:** riscrivere `is_skill_in_scope`, `list_locked_skill_outline`, `save_custom_selection`, `activate_exam_mode` e RPC di promozione su `track_id` + `rank_order` (rimuovendo `is_valid_grade_value` e `next_grade_value` specifici FESK).
  3. **Adattamento App e CLI:** aggiornare `src/lib/grades.ts`, `session-progress.ts` (`tracking_mode` al posto di `isFormCategory`), form profilo/setup/onboarding e script CLI (`invita-utenti.mjs`, `promote-after-exam.mjs`) per operare su `1..N` percorsi, più il dizionario minimo `terminology.ts`.
  4. **Seed e Tenant Pack della nuova disciplina** (es. `tenants/taekwondo-xyz` con 1 solo track, gradi Kup/Dan e categorie Poomsae/Kyorugi/Kibon).

### Fase 3 — Scala SaaS (Solo oltre ~15–20 piccole scuole standardizzate)
- **Trigger:** l'onere operativo di applicare migrazioni SQL su N progetti Supabase separati supera il costo di costruire e mantenere un pannello admin multi-scuola.
- **Intervento:** far convergere i tenant piccoli su un DB condiviso sfruttando `school_id` + RLS (`0028`), aggiungendo risoluzione tenant da host/sottodominio e un'interfaccia admin per inviti/promozioni/catalogo.

---

## 5. Riferimento Rapido Decisioni FESK Attive

Questi sono i vincoli operativi FESK attualmente in vigore in produzione:

- **Prodotto e istanza:** `FESK Practice` (`info@feskfongttai.it`), deployato sull'istanza Vercel/Supabase principale; la vecchia landing personale cavallo/Confucio resta preservata su `/landing-legacy`.
- **Accesso solo su invito pre-assegnato:** inserimento riga in `user_invites` **prima** dell'invio invito Auth (`scripts/invita-utenti.mjs`); signup senza invito `pending` viene bloccato da `handle_new_user`.
- **Visibilità contenuti (`is_skill_in_scope`, migrazione `0046`):**
  - studenti (`content_access_mode = 'up_to_assigned_level'`, `profile_locked = true`): vedono le skill della disciplina praticata (`<> 0`) fino al **livello successivo** a quello posseduto (quello in preparazione), senza sezione `Altro` (`is_extra = false`), più l'outline solo-titolo dei livelli futuri (`0047`);
  - istruttori/maestri/admin abilitati (`content_access_mode = 'all_school_content'`, `can_view_extra_content = true`): vedono l'intero catalogo inclusa la sezione `Altro`.
- **Promozione post-esame:** Shaolin e T'ai Chi avanzano in modo indipendente tramite `scripts/promote-after-exam.mjs` (che aggiorna livello, esame in preparazione e rigenera gli item `exam_program` preservando storico e selezione manuale).
