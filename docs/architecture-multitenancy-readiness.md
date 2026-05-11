# Studio architetturale: readiness multi-scuola

Data analisi: 2026-05-11. Repo analizzata: `skill-practice`. Documento solo analitico, non descrive lavoro pianificato.

## Sommario

L'app ha una base multi-scuola solo parziale. Il database contiene `school_id` su entita importanti, ma il dominio reale e ancora FESK-first: due discipline fisse (`shaolin`, `taichi`), categorie tecniche cinesi, gradi Chi/Chieh/Mezza Luna, programmi esame allineati a `minimum_grade_value`, UI che parla di forme, ripetizioni e "Scuola Chang".

Il punto piu rischioso non e il branding, ma la semantica: molti numeri e stringhe sembrano dati generici, ma in realta codificano regole FESK. Le categorie non sono solo label: portano comportamento (contatore ripetizioni, durata stimata, requisito partner). La scala di grado e duplicata in TypeScript e SQL. Le query statiche non sempre filtrano per `school_id`, anche se le RLS sono permissive.

Una scuola di kung fu gemella della FESK si adatta in giorni. Karate/taekwondo con scala kyu/dan e categorie diverse richiede settimane. Judo o aikido richiederebbero un ripensamento del concetto di esercizio, sessione e programma: meglio un'app separata.

Raccomandazione: non fare ora refactor SaaS completo. Tre interventi difensivi pragmatici, utili anche con la sola FESK: enforcement `school_id` end-to-end (query + RLS), centralizzazione brand/terminologia in un punto unico, astrazione testata della scala gradi. Tutto il resto dovrebbe aspettare domanda reale.

## 1. Inventario di cio che e hardcoded FESK

| Criticita | File/linee | Cosa e hardcoded | Per renderlo configurabile |
| --- | --- | --- | --- |
| 🔴 | `src/lib/types.ts:5`, `supabase/migrations/0003_schema_evolve_fesk.sql:51` | `Discipline = "shaolin" \| "taichi"` e enum Postgres `discipline AS ENUM ('shaolin','taichi')`. | Tabella `disciplines` per scuola, con slug, label, ordine e flag attiva. Tutte le UI devono iterare discipline DB, non union TS. |
| 🔴 | `src/lib/types.ts:72-79`, `supabase/migrations/0003_schema_evolve_fesk.sql:90-95` | Profilo con colonne dedicate `assigned_level_shaolin`, `assigned_level_taichi`, `preparing_exam_id`, `preparing_exam_taichi_id`. | Sostituire con `user_discipline_levels(user_id, discipline_id, grade_id, preparing_exam_id)`; supporta 0, 1, 2 o N discipline. |
| 🔴 | `src/lib/grades.ts:1-8`, `src/lib/grades.ts:14-35` | Scala FESK Chi/Chieh/Mezza Luna, numeri decrescenti, T'ai Chi come sottoinsieme di Shaolin e `0 = Non praticato`. | Tabella `grade_scales`/`grade_levels` con `rank_order`, `access_order`, label, valore legacy opzionale e regole "next". |
| 🔴 | `src/lib/grades.ts:55-78`, `supabase/migrations/0018_allow_review_exam_selection.sql:37-40`, `:55-58`, `:170-195` | `nextGradeValue` e RPC usano `current - 1` salvo transizione `1 -> -1`, poi validano `exam.grade_value >= minimum`. | Estrarre funzione di progressione per scuola/scala. In SQL non deve esistere una formula FESK; deve usare `grade_levels.next_grade_id` o `rank_order`. |
| 🔴 | `src/lib/queries/skills.ts:5-22`, `src/lib/queries/exam-programs.ts:23-25` | Accesso contenuti basato su `minimum_grade_value >= userGradeValue` e ordinamento decrescente. | Sostituire confronto numerico con join su livelli ordinati: `skill.minimum_grade_id` e `user_grade.rank_order`. |
| 🔴 | `src/lib/types.ts:9-19`, `supabase/migrations/0003_schema_evolve_fesk.sql:32-43` | `SkillCategory` e enum DB sono categorie FESK: `forme`, `tui_fa`, `po_chi`, `chin_na`, `armi_*`, `tue_shou`, `ta_lu`, `chi_kung`, `preparatori`. | Tabella `skill_categories(school_id, slug, label, icon, sort_order, practice_counter_kind)`. |
| 🟡 | `src/lib/labels.ts:3-18` | Label Shaolin/T'ai Chi e nomi categorie cinesi in codice. | Caricare label da `school_settings`, `disciplines`, `skill_categories` oppure da file config per white-label. |
| 🔴 | `supabase/migrations/0004_seed_fesk.sql:8-24`, `:26-199`, `:200-269`, `:282-288`; `scripts/generate-fesk-seed.mjs:15-68`, `:241-253` | Seed FESK: scuola FESK, 137 skill, 15 esami Shaolin, 12 T'ai Chi, nomi tecnici, gradi Chi/Chieh, controlli numerici. | Seeder per scuola, idealmente data-driven (`schools/*.json` o admin DB). Non deve rigenerare migration monolitica FESK per ogni cliente. |
| 🔴 | `supabase/migrations/0017_harden_incremental_exam_plans.sql:9-18`, `supabase/migrations/0018_allow_review_exam_selection.sql:84-88`, `:122-126`, `:219-223` | Requisiti esame ricostruiti/validati come skill dello stesso `minimum_grade_value` dell'esame. | `exam_skill_requirements` deve restare lista esplicita; rimuovere il vincolo logico "skill grade = exam grade" se altre scuole hanno programmi non allineati per grado. |
| 🔴 | `supabase/migrations/0015_training_schedule_exam_disciplines.sql:6-13`, `src/lib/session-scheduler.ts:10`, `src/lib/actions/training-schedule.ts:12`, `src/components/sessions/SetupForm.tsx:33` | `exam_disciplines` accetta solo `['shaolin']`, `['taichi']`, `['shaolin','taichi']`. | Tabella di scope o array di `discipline_id` senza check a due valori. |
| 🟡 | `src/lib/session-progress.ts:196-198`, `src/components/sessions/SessionPreview.tsx:1-14`, `src/components/sessions/SetupForm.tsx:174-175`, `:187-193` | Il conteggio ripetizioni vale per "forme" e `armi_forma`; anteprima assume 3 minuti per forma e "ripetizioni per forma". | Spostare il concetto di contatore su categoria (`reps`, `rounds`, `minutes`, `sets`, `none`). Per judo/randori servono round/minuti, non ripetizioni di forme. |
| 🟡 | `src/lib/practice-logic.ts:8-22`, `src/lib/session-scheduler.ts:11-12`, `:91-99` | Modello `focus`/`maintenance`, focus pesa 2 e maintenance 1. Abbastanza universale, ma non configurabile. | Parametri per scuola o per piano: pesi, numero mantenimenti/giorno, criteri di rotazione. |
| 🔴 | `src/lib/queries/skills.ts:19-22`, `:75-85`; `src/lib/queries/calendar.ts:92-113`; `src/lib/queries/plan.ts:13-29` | Diverse query skill non filtrano `school_id`; alcune filtrano solo `discipline`. Con piu scuole, catalogo e pratica libera potrebbero mostrare contenuti di altri tenant. | Passare sempre `school_id` alle query statiche o applicare RLS tenant-aware su `skills`, `exam_programs`, `exam_skill_requirements`. |
| 🔴 | `supabase/migrations/0001_schema.sql:142-155` | RLS delle tabelle statiche (`skills`, `exam_programs`, `exam_skill_requirements`, `news_items`) usa lettura per authenticated con `USING (true)`. | Policy per scuola dell'utente: `exists user_profiles where id=auth.uid() and school_id=...`; o contenuti pubblici solo se marcati globali. |
| 🟡 | `src/app/(app)/library/page.tsx:30`, `:112-115`; `src/components/nav/BottomNav.tsx:7-23`; `src/components/hub/HubGrid.tsx:11-54` | "Scuola Chang", "tecniche e forme", navigazione e hub FESK-oriented. | Etichette navigazione da configurazione scuola/app. |
| 🟡 | `src/app/(auth)/login/LoginForm.tsx:28`, `src/app/layout.tsx:50-51`, `public/manifest.json:2-4`, `public/offline.html:6-11` | Brand "Kung Fu Practice", "Kung Fu Practice FESK", descrizione Kung Fu. | `app_settings` o config build-time per nome, short name, descrizioni, manifest e offline page. |
| 🟡 | `src/app/globals.css:53-75`, `:90-103`, `:122-123`; `src/app/layout.tsx:18-48` | Tema scuro caldo, oro, font Cormorant/Spectral/Bebas/Noto Serif TC. | Variabili CSS per scuola, caricate build-time o generate server-side; attenzione a PWA/manifest che resta statico. |
| 🟢 | `src/components/landing/LandingHero.tsx:15-36`, `src/components/landing/HorseEmblem.tsx:3-10`, `src/components/hub/HubBackground.tsx:3-10`, `public/landing/cavallo-fuoco.svg` | Cavallo/ideogrammi/citazione Confucio. Forte identita Chang/FESK, ma non blocca il dominio applicativo. | Asset e hero per scuola, o landing disattivabile per deploy white-label. |
| 🟡 | `src/components/plan/ExamModeForm.tsx:9-15`, `:46-60`; `src/app/(app)/plan/exam/page.tsx:16-27`; `src/app/(app)/onboarding/OnboardingForm.tsx:25-55`, `:70-143` | Form con due select fisse Shaolin/T'ai Chi e onboarding con checkbox/grade dedicati. | Componenti dinamici su `disciplines[]`, con zero/una/N discipline e un grado per disciplina. |
| 🟡 | `src/components/profile/GradeEditor.tsx:20-37`; `src/components/profile/PlanModeSection.tsx:56-59` | Profilo mostra sempre due discipline. | Editor iterativo sui livelli utente; nascondere discipline non abilitate dalla scuola. |
| 🟡 | `src/components/library/DisciplineToggle.tsx:12-24`, `src/app/(app)/programma/page.tsx:37-49`, `src/app/(app)/plan/custom/page.tsx:16-20` | Toggle e routing assumono default `shaolin`, `taichi` come unico altro valore. | Routing con `disciplineSlug` generico e fallback alla prima disciplina della scuola. |
| 🟡 | `src/components/library/LibraryFilters.tsx:93`, `src/components/calendar/AddFreePracticeSheet.tsx:86`, `src/components/today/TodayEmptyState.tsx:17`, `:61-62`, `src/components/sessions/PlanFormsSection.tsx:64-66` | Testi "forme", "tecniche", "ripetizioni per forma". | Dizionario terminologico per scuola: `skillPlural`, `soloPracticeLabel`, `counterLabel`, `examLabel`, ecc. |
| 🟢 | `src/app/(legal)/privacy/page.tsx:12-35`, `src/app/(legal)/disclaimer/page.tsx:17-40`, `src/app/(legal)/terms/page.tsx:17-35` | Legali parlano di Kung Fu Practice, gradi, discipline, armi e scuola. Molti placeholder sono gia generici. | Template legali per scuola/titolare; revisione legale per B2B multi-cliente. |

## 2. Mappa delle dipendenze e dell'accoppiamento

Il nodo piu critico e la scala di grado. `minimum_grade_value` non e solo un campo dati: guida query (`src/lib/queries/skills.ts:21-22`), label (`src/components/skill/LevelBadge.tsx:4-8`), selezione esami (`src/lib/grades.ts:63-78`), RPC SQL (`supabase/migrations/0018_allow_review_exam_selection.sql:37-58`) e ordinamenti (`src/lib/queries/exam-programs.ts:23-25`). Una scuola con kyu/dan crescenti o con livelli testuali non funzionerebbe senza cambiare semantica. Una scala karate "10 kyu -> 1 kyu -> 1 dan" puo essere forzata in numeri FESK-like, ma sarebbe un workaround fragile.

La seconda dipendenza e il dualismo Shaolin/T'ai Chi. Non e solo un filtro: esistono colonne separate sul profilo, due select esame, due campi `preparing_exam`, check DB su `exam_disciplines`, toggle UI e calcoli di sintesi (`src/app/(app)/today/page.tsx:205-232`). Una scuola mono-disciplina funziona solo se viene mappata artificialmente su `shaolin` e si nasconde `taichi`; tre discipline richiedono refactor strutturale.

Le categorie sono enum TypeScript e Postgres. Questo garantisce coerenza per FESK, ma impedisce judo (`nage-waza`, `katame-waza`, `ukemi`, `randori`), taekwondo (`poomsae`, `kibon`, `gyeorugi`) o aikido (`tai-jutsu`, `bukiwaza`, `ukemi`, `kokyu-ho`) senza migration. Le categorie dovrebbero diventare dati DB, con comportamento associato per UI e contatori.

I programmi esame oggi sono "incrementali" per grado, non cumulativi: `0007_incremental_exam_programs.sql:1-17` e `0017_harden_incremental_exam_plans.sql:1-18` ricostruiscono requisiti solo con skill dello stesso `minimum_grade_value`. Questo e piu flessibile di un programma cumulativo fisso, ma resta vincolato a "skill introdotta al grado X = requisito dell'esame X". Judo o aikido potrebbero voler liste esame indipendenti dalla progressione generale.

`practice-logic.ts` e relativamente universale: filtra hidden, separa focus/maintenance e ruota i vecchi (`src/lib/practice-logic.ts:13-22`). L'accoppiamento emerge nello scheduler e nella progressione sessioni, dove "forma" e ripetizioni diventano unita primaria (`src/lib/session-progress.ts:196-198`, `src/components/sessions/SessionPreview.tsx:10-14`).

## 3. Architetture target possibili

### Livello A - Multi-scuola minimo, white-label semplice

Una istanza/deploy per scuola. Si cambia seed, branding, manifest, label, asset e forse `grades.ts`; nessun tenant condiviso. Effort realistico: 2-5 giorni per scuola simile alla FESK; 5-10 giorni se cambia scala di gradi ma resta catalogo/esame; oltre 2 settimane se cambia paradigma.

File toccati: `supabase/migrations/0004_seed_fesk.sql` o nuovo seed, `scripts/generate-fesk-seed.mjs`, `src/lib/grades.ts`, `src/lib/labels.ts`, `src/app/layout.tsx`, `public/manifest.json`, `src/app/globals.css`, landing/assets, testi UI principali. Schema DB: nessuna nuova tabella se si accetta di rimappare tutto sui nomi interni `shaolin/taichi`; al massimo migration per enum categorie. Rischi: fork divergenti, bugfix moltiplicati, update PWA/manifest manuali, debito semantico se si chiama "shaolin" una disciplina che non lo e. Ha senso solo per validare una singola scuola pagante senza trasformare il prodotto.

### Livello B - Multi-tenant con configurazione

Una istanza, scuole multiple nel DB. Ogni utente vede solo la propria scuola. Discipline, gradi, categorie, terminologia e palette sono dati. Effort: 4-7 settimane per una base solida, inclusi migrazione dati FESK, refactor UI e test RLS.

Nuove/modificate tabelle: `school_settings`, `disciplines`, `grade_scales`, `grade_levels`, `skill_categories`, `user_discipline_levels`, `school_theme`, eventuale `school_assets`. `skills` dovrebbe puntare a `discipline_id`, `category_id`, `minimum_grade_id`; `exam_programs` a `grade_id`; `training_schedule.exam_disciplines` a relazione generica. File impattati: quasi tutti quelli citati nelle sezioni 1-2, piu RPC `activate_exam_mode`, `save_custom_selection`, query `skills`, calendar, plan, profilo, onboarding, scheduler.

Rischi: migrazione dati con perdita semantica, RLS non banale su join statici, performance con policy tenant-aware, UI piu complessa per N discipline, gestione cache/manifest per branding. Ha senso quando ci sono almeno 2-3 scuole concrete o una trattativa B2B che giustifica piattaforma unica.

### Livello C - Multi-tenant self-service

Le scuole si registrano, configurano curriculum, gradi, categorie, utenti, branding e contenuti da pannello admin. Effort: 10-16 settimane minimo per prodotto SaaS credibile; di piu con billing, provisioning video, audit log, supporto e import curriculum.

Oltre al livello B servono admin UI, inviti utenti, import CSV/JSON, validatori curriculum, versioning dei programmi, billing, support tooling, backup/restore per tenant, audit, documentazione operativa. Rischio principale: non e piu "app FESK adattabile", ma piattaforma B2B. Ha senso solo con domanda commerciale ripetibile e budget di prodotto.

## 4. Cosa e gia stato fatto bene

La presenza di `school_id` su `schools`, `skills`, `exam_programs`, `news_items` e `user_profiles` (`supabase/migrations/0001_schema.sql:30-53`, `:72-77`, `:108-110`) e una buona base: il modello sa gia che i contenuti appartengono a una scuola. Manca pero enforcement completo nelle query e nelle policy.

Le tabelle dinamiche sono per utente e hanno RLS owner (`supabase/migrations/0001_schema.sql:159-173`, `supabase/migrations/0012_training_schedule.sql:22-26`). Questo isola log, piani e calendario dell'utente. Da completare: proteggere anche lettura contenuti statici e impedire skill cross-school nei piani manuali.

Supabase auth e ruoli esistono (`src/lib/types.ts:27`, `src/app/(legal)/privacy/page.tsx:72-75`), quindi admin/instructor/student non partono da zero. Mancano pero funzioni admin multi-scuola e policy "admin della propria scuola".

YouTube esterno (`src/lib/types.ts:46`, `src/app/(legal)/privacy/page.tsx:50`) evita migrazioni storage video. Per altre scuole servira solo gestione autorizzazioni/licenze e URL per tenant.

Next.js App Router e query server-side rendono possibile applicare configurazione per request/profilo senza riscrivere il runtime. Le Server Actions centralizzano molte mutazioni (`src/lib/actions/plan.ts`, `profile.ts`, `training-schedule.ts`), quindi il refactor e circoscritto, anche se ampio.

La palette e ben strutturata: `src/app/globals.css:7-50` definisce `@theme inline` di Tailwind v4 mappando tutte le utility a CSS custom properties, e `:root` (`:52-134`) espone l'intera palette gold/dark come variabili (`--gold-500`, `--tint`, `--status-error`, ecc.). Non esiste `tailwind.config.ts`. Cambiare brand per scuola e una `document.documentElement.style.setProperty` al boot, non un refactor CSS. Restano fuori solo gli asset statici (`public/icon.svg`, icone PNG, `og-image.png`) e il `manifest.json`, che pero sono problemi separati e piu piccoli.

## 5. Punti deboli architetturali

Il problema piu serio e la falsa multi-tenancy: `school_id` c'e, ma le tabelle statiche sono leggibili da tutti e query chiave non filtrano per scuola. In uno scenario multi-tenant reale questo e un rischio di leakage.

Il secondo problema e la semantica nascosta nei numeri. `-1` non significa "primo livello avanzato" in astratto: significa 1° Chieh FESK. Questo rende difficili test e migrazioni verso kyu/dan, kup/dan o cinture judo.

Il terzo problema e l'accoppiamento UI/business: onboarding, profilo, programma, calendario e sessioni conoscono Shaolin/T'ai Chi. Non basta sostituire stringhe: bisogna cambiare forma dei dati.

Manca una configurazione scuola centralizzata. Nome app, palette, hero, manifest, label curriculum e terminologia sono sparsi. Anche restando solo FESK, centralizzare ridurrebbe regressioni.

Il manifest PWA e statico (`public/manifest.json`). In un vero multi-tenant, nome app, icone e `theme_color` non possono cambiare per utente se il manifest resta unico. Soluzione possibile con Next 13+: convertirlo in `src/app/manifest.ts` che legge da DB in base al dominio o al profilo.

Infine non c'e un i18n/terminology layer. L'italiano hardcoded va bene per FESK, ma una scuola internazionale o un contesto giapponese/inglese richiede almeno un dizionario strutturato.

## 6. Roadmap se servisse

Scenario 1, altra scuola simile a FESK/Chang: effort 3-5 giorni in Livello A. Approccio: fork/deploy separato, nuovo seed, cambio brand, revisione testi. File: seed/script, `grades.ts`, `labels.ts`, manifest/layout/CSS, legal. Se si vuole evitare fork: 8-12 giorni per una configurazione build-time minima.

Scenario 2, karate Shotokan o taekwondo con gradi diversi ma struttura simile: effort 2-4 settimane. Serve astrarre scala gradi, categorie, disciplina singola, label esami e contatori. Karate puo usare kata/kihon/kumite; taekwondo poomsae/kibon/gyeorugi e kup/dan. L'app resta sensata se il curriculum e tecnico-progressivo.

Scenario 3, judo o paradigma molto diverso: effort 4-8 settimane per adattare dignitosamente; oltre se si vuole tracking randori, combattimenti, uke/tori, intensita, round, cadute, kumikata, ne-waza. Se la richiesta e solo catalogo + diario, adattare ha senso. Se il valore principale e gestione randori/competizione/classe, meglio una nuova app o un modulo separato invece di forzare "forme e ripetizioni".

## 7. Decisioni architetturali da considerare ora

1. Applicare `school_id` ovunque e irrigidire RLS statiche. Tempo: 1-2 giorni. Utile anche solo FESK per chiudere una falla futura.
2. Creare `school_settings` build/runtime per nome, short name, terminologia base, palette e asset. Tempo: 1-2 giorni. Riduce dispersione di stringhe senza rifare il dominio.
3. Estrarre un `gradeScale` service dietro `grades.ts`. Tempo: 2-4 giorni se resta in codice, 1-2 settimane se va in DB. Anche per FESK migliora testabilita.
4. Spostare `SKILL_CATEGORY_LABELS` in una config dati. Tempo: 1-2 giorni in config, 3-5 giorni in DB con migration. Preparerebbe judo/karate senza toccare componenti.
5. Documentare architettura e convenzioni FESK in `ARCHITECTURE.md`. Tempo: 4-6 ore. Ha senso subito: evita che `-1` e `taichi=0` diventino conoscenza orale.

Non farei ora il refactor completo a `user_discipline_levels` senza una seconda scuola concreta: e invasivo e tocca onboarding, profilo, piani, RPC, scheduler e test.

## 8. Costi nascosti e rischi

Multi-tenancy non e solo schema. Servono backup/restore per singola scuola, cancellazione selettiva, export amministrativi, migrazioni compatibili con tenant diversi, audit log per admin, supporto utenti per piu organizzazioni, gestione contenuti protetti e diritto di rimozione.

GDPR cresce di complessita: con scuole terze bisogna chiarire titolare/responsabile, DPA, sub-responsabili, regioni dati, tempi di conservazione, minori, procedure breach e richieste di cancellazione. I placeholder legali attuali lo anticipano, ma non lo risolvono.

Performance e sicurezza diventano piu delicate: policy tenant-aware su molte join, indici compositi `school_id`, test RLS, monitoring e rate limit. Anche il supporto operativo cambia: ogni scuola avra curriculum, terminologia, bug percepiti e richieste diverse.

## 9. Raccomandazione finale onesta

Non conviene preparare subito l'app al Livello B/C senza una scuola concreta. L'app e oggi correttamente costruita come prodotto FESK, non come piattaforma. Un refactor multi-tenant pieno richiede settimane e introduce complessita che non produce valore finche FESK resta l'unico cliente.

Conviene invece fare una "readiness leggera": chiudere le query/RLS su `school_id`, centralizzare branding/terminologia di base e documentare le convenzioni di grado. Sono interventi utili anche per FESK e riducono il costo di una futura conversazione commerciale.

Se arriva una singola scuola simile, scegliere Livello A. Se arrivano due o piu scuole o una scuola con budget per piattaforma condivisa, passare al Livello B. Il Livello C ha senso solo quando l'obiettivo e vendere un SaaS multi-cliente, non solo riusare l'app.

I tre interventi piu sensati ora sono: 1) enforcement `school_id` end-to-end; 2) `school_settings`/terminology config; 3) astrazione testata della scala gradi. Tutto il resto dovrebbe aspettare domanda reale.
