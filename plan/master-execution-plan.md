# Master Execution Plan - Skill Practice

**Status:** roadmap operativa + implementation pass locale completato  
**Versione:** v2  
**Ultimo aggiornamento:** 2026-04-25  
**Owner:** founder + agente  
**Scope primario:** finire lo Scenario A, cioe' MVP personale FESK installabile e usabile ogni giorno  
**Scope secondario:** preparare, solo dopo validazione, lo Scenario B federazione/scuole

---

## 0. Scopo

Questo documento e' il piano unico per chiudere tutto il lavoro ancora aperto.

Usalo cosi':

1. Prima si chiude lo Scenario A: app personale, dati FESK, bacheca, note, PWA, deploy, contenuti minimi reali.
2. Poi il founder usa l'app per 30 giorni.
3. Solo se l'uso reale conferma valore, si apre lo Scenario B: multiutente, admin, istruttore, privacy/GDPR, SRS reale.

Il documento corregge il v1 dove il codebase non permetteva una verifica completa, soprattutto sullo stato remoto Supabase. Da repo si puo' verificare cio' che e' nel filesystem, non se le migration siano gia' applicate nel progetto Supabase remoto.

---

## 1. Cross-check eseguito

### 1.1 Evidenza locale

Verificato sul repository locale `c:\martial-arts`, HEAD:

```text
91c4b70 (HEAD -> main, origin/main) Implement FESK curriculum and practice UX
```

Stato Git prima della modifica:

```text
## main...origin/main
?? plan/master-execution-plan.md
```

Comandi eseguiti in `skill-practice`:

```text
npm run lint   -> OK
npm run build  -> OK
```

Build verificata:

```text
Next.js 16.2.4 (Turbopack)
Compiled successfully
TypeScript OK
Generated static pages: 17/17
Proxy active
```

### 1.2 Cosa NON e' verificabile dal solo repo

Questi punti richiedono controllo manuale o ambiente esterno:

| Area | Stato |
|---|---|
| Supabase remoto | Non verificabile dal repo. Le migration 0003/0004/0005 esistono localmente, ma va controllato se sono applicate nel progetto remoto. |
| Vercel deploy | Non verificato dal repo. |
| Login reale browser | Non verificato in browser durante questo audit. |
| PWA installabile Android/iOS | Non verificata. |
| Offline mode | Non implementato/configurato, quindi non verificabile. |
| Video reali | Seed locale usa placeholder YouTube; contenuti reali da caricare. |
| Performance YouTube "0 request before tap" | Implementazione coerente, ma test DevTools non eseguito qui. |

---

## 2. Snapshot reale del codebase

### 2.1 Stack effettivo

| Item | Stato reale |
|---|---|
| Framework | Next.js `16.2.4`, App Router, Turbopack build |
| React | `19.2.4` |
| TypeScript | Presente, build passa |
| Tailwind | v4 via `globals.css` + `@theme inline` |
| UI | shadcn/Nova style, componenti copiati in `src/components/ui` |
| Supabase | `@supabase/supabase-js` + `@supabase/ssr` |
| PWA | Service worker statico `/sw.js` registrato in produzione; `next-pwa` resta installato ma inutilizzato |
| Service worker | Presente in `public/sw.js`, con cache asset statici e fallback offline |
| Test | `npm run test` copre YouTube parsing, practice logic e progress logic |

### 2.2 Route buildate

| Rotta | Tipo build | Stato |
|---|---:|---|
| `/` | dynamic | Redirect auth/onboarding/today |
| `/auth/callback` | dynamic route | Callback Supabase |
| `/login` | static | Email/password |
| `/onboarding` | dynamic | Onboarding multi-disciplina |
| `/today` | dynamic | Pratica giornaliera, filtro disciplina, status menu |
| `/library` | dynamic | Mio livello |
| `/library/all` | dynamic | Tutto + filtri |
| `/library/exam` | dynamic | Lista esami |
| `/library/exam/[examId]` | dynamic | Skill richieste |
| `/library/program` | dynamic | Programma completo |
| `/skill/[skillId]` | dynamic | Dettaglio skill + VideoPlayer |
| `/profile` | dynamic | Gradi + modalita piano |
| `/plan/exam` | dynamic | Piano da esame |
| `/plan/custom` | dynamic | Selezione libera |
| `/progress` | dynamic | Progresso con calendario, reflection, toggle disciplina e sezioni curriculum/radar/timeline |
| `/news` | dynamic | Bacheca reale con feed, pinned/eventi e mark-as-seen |

### 2.3 Componenti inventariati

`src/components` contiene 48 file:

| Cartella | Count | Note |
|---|---:|---|
| `ui` | 12 | button, badge, card, sheet, tabs, avatar, separator, skeleton, input, label, radio-group, alert |
| `skill` | 6 | VideoPlayer, AddToPlanButton, DisciplineBadge, LevelBadge, PracticeModeBadge, StatusBadge |
| `library` | 6 | CategoryFilter, DisciplineToggle, GradeSection, LibraryNav, ProgramSkillRow, SkillListItem |
| `today` | 5 | TodaySkillCard, TodayEmptyState, DisciplineFilter, PracticeCheckButton, SkillStatusMenu |
| `profile` | 3 | GradeEditor, PlanModeSection, SignOutButton |
| `plan` | 2 | ExamModeForm, CustomSelectionForm |
| `progress` | 9 | 5 sezioni + SectionHeader + ProgressDisciplineSections + WeeklyReflectionCard + skeleton generico |
| `news` | 2 | NewsBanner, NewsSeenMarker |
| `pwa` | 1 | ServiceWorkerRegister |
| `nav` | 1 | BottomNav |
| `shared` | 1 | EmptyState |

### 2.4 Database e migration locali

| Migration | Stato file | Contenuto verificato |
|---|---|---|
| `0001_schema.sql` | Presente | Schema base, RLS, `news_items`, `practice_logs.personal_note`, trigger `handle_new_user` vecchio stile |
| `0002_seed_school_skills.sql` | Presente ma svuotata | Commento: seed Wing Chun rimosso, sostituito da 0004 |
| `0003_schema_evolve_fesk.sql` | Presente | Enum FESK, `discipline`, `practice_mode`, `minimum_grade_value`, doppi livelli utente, trigger aggiornato |
| `0004_seed_fesk.sql` | Presente | Seed generato da script, 137 skill attese, 15 esami Shaolin, 12 esami T'ai Chi, URL video placeholder |
| `0005_plan_mode.sql` | Presente | `plan_mode`, `preparing_exam_taichi_id`, 5 RPC atomiche |
| `0006_news_reflections.sql` | Presente | `last_news_seen_at`, policy write news admin/instructor, seed demo news, tabella `weekly_reflections` |

Nota operativa: il seed 0004 usa `https://www.youtube.com/watch?v=PLACEHOLDER` per tutte le skill. Il componente `extractYouTubeId` lo tratta correttamente come video non disponibile.

### 2.5 Funzionalita realmente implementate

| Area | Stato |
|---|---|
| Auth gate | Implementato con `src/proxy.ts` e helper Supabase middleware |
| Root redirect | Implementato in `src/app/page.tsx` |
| Onboarding | Implementato, supporta profilo FESK multi-disciplina |
| Piano da esame | Implementato via RPC `activate_exam_mode` |
| Piano custom | Implementato via RPC `save_custom_selection` |
| Today | Implementato con focus/review/maintenance, filtro disciplina, log settimanali |
| Practice done | Implementato: insert in `practice_logs`, update `last_practiced_at` |
| Libreria | Implementata con 4 sotto-viste: mio livello, per esame, tutto, programma |
| Video lazy | Implementato con placeholder e iframe YouTube nocookie solo dopo click |
| Profilo | Implementato: gradi e modalita piano |
| Progress | Implementato: 5 sezioni, toggle disciplina client-side, ExamProgress per disciplina attiva |
| News | Implementata con query, pagina feed, banner unread in Today e mark-as-seen |
| Note personali | Implementate: nota opzionale dopo pratica e lista note in skill detail |
| Weekly reflection | Implementata in Progress la domenica/lunedi se non compilata |
| Offline/PWA | Implementato localmente: manifest con PNG, service worker statico e fallback offline |

---

## 3. Cross-reference piani vs implementazione

| Piano | Stato dopo audit | Correzione da tenere a mente |
|---|---|---|
| `current-plan.md` | Parzialmente superato | D4 news e D6 note sono ancora aperte; progress e FESK sono gia stati anticipati |
| `sprint-curriculum-fesk.md` | Implementato localmente | Necessario smoke test DB remoto; termini FESK aperti restano founder review |
| `curriculum-mapping-fesk.md` | Usato come riferimento seed | In sezione 6 restano 6 termini da chiarire |
| `sprint-video-player.md` | Implementato | Serve solo verifica manuale Network tab su browser reale |
| `sprint-plan-ux.md` | Implementato | Rotte `/plan/exam`, `/plan/custom`, `/library/program` presenti |
| `sprint-progresso.md` | Implementato con parity minima | Toggle disciplina presente; Suspense/skeleton granulari restano polish opzionale |
| `visual-identity-plan.md` | Implementato | Font reali caricati, Space Mono applicato ai livelli, label badge e sepia placeholder video |
| `positioning-analysis.md` | Da aggiornare dopo progress | P1 di fatto chiusa; P2/P4/P5 restano decisioni/narrativa |

---

## 4. Gap analysis ordinata per severita

### 4.1 P0 - blocchi per usare davvero l'app

| ID | Gap | Perche blocca | Owner | Effort |
|---|---|---|---|---:|
| P0-1 | Verificare/applicare migration 0003, 0004, 0005 su Supabase remoto | Senza schema FESK il browser puo rompersi su colonne/RPC mancanti | Founder | 15-30 min |
| P0-2 | Smoke test browser su account reale | Lint/build non garantiscono che RLS, trigger, auth e dati remoti funzionino | Founder + agente | 30-60 min |
| P0-3 | Definire esattamente quale DB/ambiente e' production | Evita divergenza tra locale, Supabase remoto, Vercel | Founder | 15 min |

### 4.2 P1 - necessario per chiudere Scenario A

| ID | Gap | Stato reale | Owner | Effort |
|---|---|---|---|---:|
| P1-1 | Font reali visual identity | Chiuso localmente con `next/font/google` | Agente | done |
| P1-2 | Rifiniture visual identity | Chiuso localmente: label badge, mono livelli, sepia placeholder | Agente | done |
| P1-3 | Progress parity minima | Chiuso localmente: toggle disciplina + progress per disciplina attiva | Agente | done |
| P1-4 | News/Bacheca D4 | Chiuso localmente: migration, query/action, pagina feed, banner Today | Agente | done |
| P1-5 | Note post-pratica D6 | Chiuso localmente: nota dopo pratica, detail note, weekly reflection | Agente | done |
| P1-6 | PWA/offline | Chiuso localmente: static service worker, manifest PNG, offline fallback | Agente | done |
| P1-7 | Deploy Vercel | Non verificato | Founder + agente | 1-2 h |
| P1-8 | Video reali minimi | 137 placeholder; pratica reale limitata | Founder | progressivo |

### 4.3 P2 - qualita e rischio tecnico

| ID | Gap | Impatto | Owner |
|---|---|---|---|
| P2-1 | Nessun test unitario per logiche pure | Chiuso localmente: 7 test su `practice-logic`, progress logic e YouTube parsing | Agente |
| P2-2 | Nessun E2E smoke script | Golden path va testato solo manualmente | Agente |
| P2-3 | Supabase CLI non documentata/eseguita | Migration test locale non automatizzato | Agente + Founder |
| P2-4 | `progress` mostra un solo esame se Shaolin e T'ai Chi sono entrambi in preparazione | Chiuso localmente: toggle disciplina e progress per disciplina attiva | Agente |
| P2-5 | `news_items` ha solo read policy | Serve policy admin/instructor prima di gestire news da app o dashboard autenticata | Agente |
| P2-6 | Legal/privacy non pronti per utenti terzi | Blocca Scenario B e test con allievi reali | Founder |

### 4.4 P3 - Scenario B, non fare prima della validazione

| ID | Area |
|---|---|
| B-1 | SRS reale tipo SM-2 / intervalli crescenti |
| B-2 | Admin CRUD skill, esami, news, utenti |
| B-3 | Pannello istruttore e relazione instructor-student |
| B-4 | Signup pubblico, reset password, account settings |
| B-5 | Privacy policy, ToS, cookie banner se serve analytics |
| B-6 | GDPR minorenni solo se si onboardano under 16 |
| B-7 | Pricing Scenario B e rapporto formale con FESK |

---

## 5. Roadmap per finire Scenario A

### Fase 0 - DB reale e smoke test

**Obiettivo:** rendere testabile cio' che e' gia' in repo.

| Task | Acceptance |
|---|---|
| 0.1 Controllare nel progetto Supabase remoto quali migration risultano applicate | Elenco migration remoto confrontato con `0001..0005` locali |
| 0.2 Applicare `0003_schema_evolve_fesk.sql`, se manca | `user_profiles` contiene `assigned_level_shaolin`, `assigned_level_taichi` |
| 0.3 Applicare `0004_seed_fesk.sql`, se manca | `select count(*) from skills` restituisce 137 |
| 0.4 Applicare `0005_plan_mode.sql`, se manca | RPC `activate_exam_mode`, `save_custom_selection`, `update_plan_item_status`, `hide_plan_item`, `switch_to_custom_mode` presenti |
| 0.5 Creare o ricreare un utente test | Trigger crea profilo con default FESK |
| 0.6 Golden path manuale | Login -> onboarding -> today -> library -> skill -> progress -> profile senza errori console |

**Definition of Done:** founder conferma browser OK su Supabase remoto.

### Fase 1 - Hardening UI e qualita minima

**Stato:** chiusa localmente. Richiede solo verifica browser dopo migration 0006.

**Obiettivo:** chiudere i debiti piccoli ma visibili prima di aggiungere feature nuove.

| Task | File principali | Acceptance |
|---|---|---|
| 1.1 Caricare font reali | `src/app/layout.tsx`, `globals.css` | Cormorant/Spectral/Bebas/Space Mono sono esposti come CSS variables reali |
| 1.2 Applicare label/mono nei badge | `StatusBadge.tsx`, `LevelBadge.tsx` | Status uppercase label font; gradi in mono |
| 1.3 Sepia sul placeholder video | `VideoPlayer.tsx` | Filtro solo sul placeholder, non sull'iframe |
| 1.4 Progress parity minima | `progress/page.tsx`, `components/progress/*`, `queries/progress.ts` | Toggle disciplina se utente pratica entrambe; ExamProgress considera Shaolin e T'ai Chi oppure mostra chiaramente una sola disciplina |
| 1.5 Test unitari essenziali | nuovo setup test leggero | `extractYouTubeId`, `getTodayPractice`, progress pure functions coperte |
| 1.6 Verifica | - | `npm run lint`, `npm run build`, test command passano |

**Definition of Done:** UI coerente con visual plan e progress non nasconde dati multi-disciplina.

### Fase 2 - News/Bacheca D4

**Stato:** chiusa localmente. Richiede apply migration 0006 su Supabase remoto.

**Obiettivo:** chiudere la terza funzione core dichiarata: libreria + pratica + bacheca.

| Task | Acceptance |
|---|---|
| 2.1 Migration `0006_news_read_state.sql` | Aggiunge `last_news_seen_at` a `user_profiles`, indici utili, policy write admin/instructor se si abilita CRUD da app |
| 2.2 Query `lib/queries/news.ts` | Lista news pubblicate per scuola, pinned first, `published_at desc` |
| 2.3 Action `lib/actions/news.ts` | `markNewsAsSeen()` aggiorna profilo corrente |
| 2.4 Pagina `/news` reale | Mostra announcement/event, pinned, empty state |
| 2.5 Banner in `/today` | Se news non lette, banner contestuale porta a `/news` |
| 2.6 Seed demo opzionale | 1 announcement e 1 event futuro visibili in ambiente test |

**Decisione UX:** niente quinta tab. La bacheca entra via banner contestuale e link diretto `/news`; BottomNav resta a 4 tab.

**Definition of Done:** Today segnala news non lette; visita a `/news` marca come lette.

### Fase 3 - Note post-pratica e reflection D6

**Stato:** chiusa localmente. Richiede apply migration 0006 su Supabase remoto.

**Obiettivo:** dare memoria personale alla pratica senza trasformare l'app in diario pesante.

| Task | Acceptance |
|---|---|
| 3.1 Action note pratica | Aggiorna `practice_logs.personal_note` per log corrente |
| 3.2 UI post-pratica opzionale | Dopo "Fatto" si puo aggiungere nota o saltare |
| 3.3 Skill detail mostra note | Ultime note personali per skill con data |
| 3.4 Migration `weekly_reflections` | Tabella owner-only con RLS |
| 3.5 Card reflection in Progress | Domenica/lunedi, se non compilata, mostra 2 prompt brevi |

**Definition of Done:** founder puo aggiungere una nota dopo una pratica e ritrovarla nella skill.

### Fase 4 - PWA e deploy production

**Stato:** implementazione locale pronta; deploy e test mobile restano esterni.

**Obiettivo:** app installabile e raggiungibile fuori da localhost.

| Task | Acceptance |
|---|---|
| 4.1 Collegare soluzione compatibile Next 16 | Chiuso localmente con `public/sw.js` statico e `ServiceWorkerRegister` |
| 4.2 Manifest e icone | Chiuso localmente: PNG 192/512 + maskable |
| 4.3 Cache strategy | Chiuso localmente: asset statici CacheFirst, navigazioni NetworkFirst con fallback offline |
| 4.4 Vercel root `skill-practice` | Deploy pubblico risponde |
| 4.5 Env vars Vercel | Supabase URL/anon key configurate; service role solo se serve server-side |
| 4.6 Mobile test | Android Chrome installa in standalone |
| 4.7 Offline smoke | Dopo visita online, pagine principali gia viste aprono offline |

**Definition of Done:** PWA installata su telefono del founder e URL Vercel usabile.

### Fase 5 - Contenuti e curriculum review

**Obiettivo:** passare da app tecnicamente pronta ad app utile.

| Task | Owner | Acceptance |
|---|---|---|
| 5.1 Caricare 30 video reali prioritari | Founder | Almeno forme e basi da 8 Chi a 5 Chi coperte |
| 5.2 Chiarire 6 termini FESK aperti | Founder | `curriculum-mapping-fesk.md` aggiornato |
| 5.3 Rigenerare seed se cambiano termini | Agente | `0004_seed_fesk.sql` coerente con generator |
| 5.4 Definire kill metric 30 giorni | Founder | Criterio scritto in `current-plan.md` o qui |

**Definition of Done:** l'app ha contenuti sufficienti per uso personale quotidiano serio.

### Fase 6 - Uso reale 30 giorni

**Obiettivo:** decidere con dati minimi se procedere a Scenario B.

| Task | Acceptance |
|---|---|
| 6.1 Usare l'app per 30 giorni | Pratica loggata con continuita ragionevole |
| 6.2 Annotare frizioni | Lista concreta di problemi, non sensazioni generiche |
| 6.3 Decidere D5 SRS reale | Rotazione attuale basta oppure serve algoritmo intervalli |
| 6.4 Decidere D7 video player | YouTube basta oppure servono loop/slow-mo/MP4 |
| 6.5 Go/no-go Scenario B | Decisione esplicita: procedere, iterare Scenario A, o fermare |

**Definition of Done:** founder decide se il prodotto merita investimento federazione.

---

## 6. Scenario B - solo dopo go

Questa sezione non va implementata prima della Fase 6, salvo richiesta esplicita.

### 6.1 SRS reale

| Task | Acceptance |
|---|---|
| Migration su `user_plan_items`: `interval_days`, `ease_factor`, `next_due_at`, `last_quality` | Dati pronti per scheduling |
| UI feedback post-pratica: hard/good/easy | Aggiorna intervalli |
| `getTodayPractice` basato su `next_due_at <= today` | Rotazione semplice sostituita |
| Simulazione 30 sessioni | Distribuzione plausibile |

### 6.2 Storico pratica completo

| Task | Acceptance |
|---|---|
| `/profile/history` | Heatmap 1 anno, filtri disciplina/skill |
| Export CSV opzionale | Founder puo scaricare log |

### 6.3 Admin

| Task | Acceptance |
|---|---|
| `/admin` role-gated | Solo `admin` |
| CRUD skill | Nome, categoria, disciplina, video, note, grado |
| CRUD esami e requisiti | Multi-select skill |
| CRUD news | Admin pubblica bacheca senza SQL manuale |
| Policy RLS admin write | Scrittura controllata |

### 6.4 Istruttore

| Task | Acceptance |
|---|---|
| `student_relationships` | Relazione instructor-student |
| `/instructor` | Lista allievi |
| Vista progresso allievo | Read-only iniziale |
| Note istruttore opzionali | Tabella separata da note personali |

### 6.5 Multiutente, legal, GDPR

| Task | Acceptance |
|---|---|
| Signup pubblico | Email confirmation e reset password |
| Account settings | Cambio email/password, delete account |
| Privacy/ToS | Pronte prima del primo utente terzo |
| Cookie banner | Solo se si aggiungono cookie non essenziali o analytics |
| GDPR minorenni | Solo se utenti under 16, con consenso parentale |
| Pricing e accordo FESK | Chiariti prima di rollout federazione |

---

## 7. Ordine operativo consigliato

| Ordine | Fase | Dipende da | Owner |
|---:|---|---|---|
| 1 | Fase 0 - DB remoto + smoke | Nessuna | Founder + agente |
| 2 | Fase 1 - hardening UI/progress/test | Fase 0 | Agente - chiusa locale |
| 3 | Fase 2 - News/Bacheca | Fase 0 + 0006 remoto | Agente - chiusa locale |
| 4 | Fase 3 - Note/reflection | Fase 0 + 0006 remoto | Agente - chiusa locale |
| 5 | Fase 4 - PWA/deploy | Deploy richiesto | Founder + agente |
| 6 | Fase 5 - video/curriculum | In parallelo da subito | Founder |
| 7 | Fase 6 - uso 30 giorni | Deploy + contenuti minimi | Founder |
| 8 | Scenario B | Go dopo Fase 6 | Founder + agente |

---

## 8. Acceptance globale

### Scenario A e' completo quando

| # | Criterio | Stato ora |
|---:|---|---|
| 1 | `npm run lint` passa | OK verificato |
| 2 | `npm run build` passa | OK verificato |
| 3 | `npm run test` passa | OK verificato |
| 4 | Migration FESK + 0006 applicate su Supabase remoto | Da verificare |
| 5 | Golden path browser senza errori | Da verificare |
| 6 | Visual identity font reali | OK locale |
| 7 | Progress non nasconde dati multi-disciplina | OK locale |
| 8 | Bacheca news reale | OK locale, richiede DB 0006 remoto |
| 9 | Note post-pratica reali | OK locale, richiede DB 0006 remoto |
| 10 | PWA installabile e offline minimo | OK locale, da testare su deploy/telefono |
| 11 | Vercel deploy pubblico | Aperto |
| 12 | Almeno 30 video reali | Aperto |
| 13 | Termini FESK ambigui chiariti o accettati come TODO documentato | Aperto |
| 14 | 30 giorni di uso personale completati | Aperto |

### Scenario B e' completo quando

| # | Criterio |
|---:|---|
| 1 | SRS reale implementato o esplicitamente scartato |
| 2 | Admin CRUD pronto |
| 3 | Istruttore pronto |
| 4 | Signup pubblico + reset + account settings |
| 5 | Privacy/ToS/GDPR pronti |
| 6 | Pricing e rapporto FESK definiti |
| 7 | Almeno un gruppo pilota non-founder usa l'app senza interventi manuali |

---

## 9. Decision log aperto

| ID | Decisione | Sblocca | Owner | Deadline consigliata |
|---|---|---|---|---|
| D-1 | Supabase remoto ha 0003/0004/0005 applicate? | Fase 0 | Founder | Subito |
| D-2 | Quale progetto Supabase e' production? | Deploy | Founder | Subito |
| D-3 | Confermare banner news invece di quinta tab | Fase 2 | Implementato banner, niente quinta tab | Chiusa locale |
| D-4 | Note post-pratica: dopo click o pulsante separato? | Fase 3 | Implementato: dopo "Fatto" apre sheet, pulsante nota sempre disponibile | Chiusa locale |
| D-5 | Font Google via `next/font/google` accettati? | Fase 1 | Implementato con `next/font/google` | Chiusa locale |
| D-6 | Primi 30 video: quali gradi prioritari? | Fase 5 | Founder | Settimana 1 |
| D-7 | 6 termini FESK aperti confermati? | Fase 5 | Founder | Settimana 2 |
| D-8 | Kill metric 30 giorni resta soggettivo o diventa numerico? | Fase 6 | Founder | Prima del deploy |
| D-9 | Go/no-go Scenario B | Scenario B | Founder | Dopo 30 giorni |

---

## 10. File da aggiornare quando chiude una fase

| Fase chiusa | File |
|---|---|
| Fase 0 | `plan/current-plan.md`, se cambia stato Supabase o setup |
| Fase 1 | `plan/visual-identity-plan.md`, `plan/sprint-progresso.md` se si completa parity |
| Fase 2 | `plan/current-plan.md` D4/Sprint 2 |
| Fase 3 | `plan/current-plan.md` D6/Sprint 2 |
| Fase 4 | `plan/current-plan.md` stack PWA/deploy |
| Fase 5 | `plan/curriculum-mapping-fesk.md`, eventualmente rigenerare seed |
| Fase 6 | `plan/positioning-analysis.md`, decisione Scenario B |
| Scenario B | `plan/current-plan.md` Sprint 3 task completati |

---

## 11. Changelog

| Versione | Data | Cambio |
|---|---|---|
| v1 | 2026-04-25 | Prima bozza consolidata |
| v2 | 2026-04-25 | Cross-check accurato su repo, lint/build, route, migration e componenti; roadmap rifatta con Scenario A prima e Scenario B dopo validazione |
| v3 | 2026-04-25 | Implementate localmente Fasi 1-4: visual identity, progress parity, news, note/reflection, PWA statica e test |
