# Report di design — skill-practice, refresh mirato ispirato ai migliori player 2026

> Documento di riferimento. Generato il 2026-06-02 da un audit multi-agente (mappa codebase + ricerca di mercato + audit multi-lente + verifica avversariale). 39 finding confermati, 17 scartati perché appesantivano o violavano le esclusioni hard del piano (§10). Nessuna modifica al codice è stata applicata: è un piano di intervento.
>
> **Revisione incrociata 2026-06-02:** una seconda lettura ha corretto due errori fattuali (A1 e A2), limato due reason sovradette (A6, C4) e aggiunto dettagli implementativi (D2 fallback, E1 focus-ring) + una checklist di verifica (§8). Le correzioni sono recepite qui sotto.

## 1. Sintesi esecutiva

Il design system è già forte: token a tre layer (grezzi → dominio → shadcn), gerarchia di superfici tipo iOS, motion con vocabolario spring, governance UI scritta e rispettata quasi ovunque. Non serve un redesign, serve **rifinitura per sottrazione**. La tesi è netta: il maggior ritorno non viene dall'aggiungere effetti (View Transitions, glass nuovo, gamification — tutti scartati), ma dal **togliere segnali ridondanti e incoerenze accumulate**, soprattutto nel core loop `/today`, che oggi è il punto più affollato dell'app.

Dove investire per primo, in ordine: (1) **alleggerire `/today`** — header troppo alto, card con quattro segnali, glow gold fuori governance; (2) **uniformare tipografia e gerarchia** — le section-label hanno cinque trattamenti, l'h1 ha tre scale; (3) **chiudere le crepe negli stati** — error boundary senza uscita, skeleton che non combaciano, errori di mutation silenziosi. Tutto a effort S/M, zero dipendenze nuove, tema dark/gold intatto.

## 2. Cosa funziona già benissimo

Riconoscimenti onesti, ancorati al codice letto:

- **Sistema di token a tre layer** (`globals.css`): grezzi → semantici di dominio (`--surface-*`, `--label-*`, `--tint-*`) → semantici shadcn. È disciplina rara in un MVP personale e regge il dark/gold senza colori a caso.
- **Governance UI scritta e applicata** (`docs/ui-system.md`): grammatica button (un solo gold per intent), chip attivo `border-primary bg-primary/10 text-primary` mai gold pieno, "completato è uno STATO non una CTA". Le primitive (`Chip`, `OptionCard`, `SegmentedNav`, `FormSelect`) rispettano questo contratto.
- **Identità FESK coerente**: gold desaturato warm (#c8a84b) già scelto bene per il dark (la ricerca APCA conferma: niente accenti saturi su nero), `label` warm #e8dfd0 invece di bianco puro per ridurre halation, grain-overlay e ideogramma 丙午 come firma editoriale, font-serif-tc per il cinese.
- **Motion già a norma 2026**: durate 150/280ms nel range "calm", spring snappy riservato ai micro-feedback, `prefers-reduced-motion` e `prefers-reduced-transparency` gestiti, safe-area e adattamento landscape (side-nav) presenti.
- **Architettura RSC-first** rispettata: lettura via Server Components, mutation via Server Actions, embed YouTube lazy. Buona base per INP.
- **Stati ottimistici** già gestiti con rollback+errore visibile in `RepsCounter`, `PracticeCompletionToggle`, `PracticeCheckButton`: il pattern corretto esiste, va solo esteso ai due punti che lo violano.

Il problema non è la qualità: è l'**entropia accumulata** in pochi punti caldi.

## 3. Miglioramenti prioritizzati

Temi ordinati per rapporto valore/sforzo.

---

### Tema A — Core loop "Oggi" (massimo valore: è la schermata che si usa ogni giorno)

**A1. Snellire l'header sticky di `/today` — RILOCANDO prima gli accessi (corretto in revisione)**

> ⚠️ Correzione: la prima stesura assumeva che "Calendario" fosse già nella BottomNav e "Imposta allenamento" già presente in `/profile`. Verifica del codice: **falso in entrambi i casi quando una sessione è attiva.**
> - `BottomNav.tsx:17-22`: lo slot "Allenamento" ha `href: "/today"` e `match: ["/calendar","/sessions"]`. La nav **non linka** `/calendar`, lo evidenzia soltanto. Accesso al calendario garantito altrove solo da `/profile` (link sempre presente, `profile/page.tsx:101`).
> - `profile/page.tsx:93`: il link "Imposta allenamento" è gated da `!schedule` → **scompare quando una schedule è attiva**. `TodayEmptyState` compare solo a sessione vuota. Quindi a sessione attiva l'**unico** accesso a `/sessions/setup` è proprio il bottone in `TodaySessionHeader.tsx:52`. Rimuoverlo senza alternativa lascerebbe l'utente incapace di modificare la schedule.

- *Cosa (prerequisito)*: in `profile/page.tsx` rendere il link allenamento **sempre presente**: togliere il gate `!schedule` e cambiare label/destinazione in base allo stato (`!schedule` → "Imposta allenamento"; `schedule` → "Modifica allenamento", sempre verso `/sessions/setup`, dove `ResetScheduleSection` gestisce già il reset). Solo dopo questo, in `TodaySessionHeader.tsx` **demote** i due Button `h-12`: non eliminarli del tutto, ma sostituirli con un'affordance a basso peso (es. un singolo `Button variant="ghost" size="sm"` o un'icona `CalendarDays`/`Settings` con `aria-label`), non gold, non di pari peso del titolo. Portare l'h1 da `text-3xl` a `text-2xl` (allineandolo alle altre 9 route) e accorciare l'eyebrow (planLabel + scopeLabel, spostare il `gradeSummary` nella summary o ometterlo).
- *Perché*: oggi l'header sticky è altissimo (eyebrow lungo + h1 3xl + border-t + due bottoni di pari peso), spinge la prima `TodaySkillCard` sotto la piega e nessuna azione è davvero primaria. L'obiettivo è recuperare spazio e gerarchia **senza rimuovere percorsi d'accesso**: prima si rilocano (profilo come hub stabile di setup/calendario), poi si alleggerisce l'header.
- *Riferimento*: WHOOP (una sola istruzione contestuale al mattino, niente menu di scorciatoie sopra la piega); Linear refresh ("not every element should carry equal visual weight").
- *Impatto minimalismo*: alleggerisce (a parità di accessibilità delle funzioni).
- *Effort*: M.
- *File*: `TodaySessionHeader.tsx`, `app/(app)/today/page.tsx`, `app/(app)/profile/page.tsx`.

**A2. Ridurre i quattro segnali nella `TodaySkillCard`**
- *Cosa*: nell'header della card (righe 53-62) rimuovere `StatusBadge`+`PracticeCompletionBadge` **oppure** almeno `PracticeCompletionBadge` (l'opzione minima sicura). Il bordo card già codifica focus (`border-primary/40`) e completato (`border-[color:var(--status-success)]`), e il bottone azione dice già "Praticato oggi"/"Completata". Tenere `VideoAvailabilityBadge` compact + `SkillStatusMenu`. Non aggiungere il micro-checkmark gold suggerito altrove: sarebbe peso nuovo.
- *Perché*: oggi ci sono 3 badge + kebab che competono col titolo; focus e completato arrivano due o tre volte. Il loop deve leggersi a colpo d'occhio.
- *Riferimento*: Things (completato come stato silenzioso, niente doppia segnalazione); Linear (riduzione treatment ridondanti).
- *Impatto minimalismo*: alleggerisce.
- *Effort*: S.
- *File*: `TodaySkillCard.tsx` + `components/skill/PracticeCompletionBadge.tsx`.
- ⚠️ *Correzione (revisione)*: `PracticeCompletionBadge` è usato **solo** in `TodaySkillCard.tsx` (grep: nessun uso in `library/SkillListItem`). Rimuovendolo da qui il componente — e l'eventuale `COMPLETION_VISUALS` che usa — diventano **codice morto**. Decisione esplicita: o si elimina anche il componente (preferito, coerente con "alleggerisce"), oppure lo si tiene di proposito documentando il motivo. Non lasciare l'import orfano.

**A3. Rimuovere il glow gold dalla card in focus (violazione governance)**
- *Cosa*: in `TodaySkillCard.tsx:39` togliere `shadow-[0_0_24px_var(--gold-glow)]`, tenere solo `border-primary/40`.
- *Perché*: è esattamente la shadow di `Button variant=default`. `docs/ui-system.md:107` vieta il glow gold fuori dal CTA primario. Su una card non interattiva (uno stato, non una CTA), con più card focus in lista, si accendono più glow gold insieme.
- *Riferimento*: governance interna (ui-system.md:107) + Linear (accento riservato alla CTA).
- *Impatto minimalismo*: alleggerisce.
- *Effort*: S.
- *File*: `TodaySkillCard.tsx`.

**A4. Transizione calma "Fatto → completato"**
- *Cosa*: aggiungere alla Card di `TodaySkillCard` `transition-[border-color,box-shadow] duration-[var(--duration-transition)] ease-[var(--ease-spring-smooth)]`, così al completamento il bordo focus si abbassa dolcemente verso success invece dello hard swap.
- *Perché*: è il momento più significativo dell'app ed è oggi istantaneo. I token esistono già; niente confetti, solo abbassamento di luminanza (coerente con "completato è uno STATO"). Usare `smooth`, non `snappy`, su elemento grande (la ricerca a11y avverte: overshoot solo su micro-feedback).
- *Riferimento*: Things 3, Linear (completamento come micro-interazione 150-280ms).
- *Impatto minimalismo*: alleggerisce (rende coerente).
- *Effort*: S.
- *File*: `TodaySkillCard.tsx` (+ eventuale utility in `globals.css`).

**A5. Chiusura sobria della sessione completata**
- *Cosa*: in `TodaySessionSummary.tsx`, quando `completionPercent === 100`, mostrare una riga calma in `label-font` ("Pratica di oggi completata"), eventualmente con la prossima data riusando la formattazione `it-IT` già in `RestDayCard`. Nessun confetti, nessuno streak.
- *Perché*: oggi a fine pratica la schermata è identica a quella iniziale salvo barra piena e bordi success: manca un segnale di chiusura del loop. Constatazione di stato, non ricompensa (§10).
- *Riferimento*: Calm Technology (chiusura sobria del compito quotidiano); coerente con governance interna.
- *Impatto minimalismo*: neutro.
- *Effort*: S.
- *File*: `TodaySessionSummary.tsx`, `app/(app)/today/page.tsx`.

**A6. Redirect post-onboarding a `/today`, non `/hub`**
- *Cosa*: in `lib/actions/onboarding.ts`, cambiare i due `redirect('/hub')` di `selectExam` (riga 85) e `finishWithoutExam` (riga 116) in `redirect('/today')`.
- *Perché*: dopo aver configurato discipline/gradi/esame, l'utente atterra su un menu a 6 tile invece che sull'azione successiva. ⚠️ *Reason corretta (revisione)*: non sempre `/today` mostra "la pratica appena generata" — dopo `finishWithoutExam` il `plan_mode` è `custom` senza forme, e senza `training_schedule` non c'è una sessione; dopo `selectExam` il fallback `practice-logic.ts` mostra le forme focus ma non una sessione schedulata. Il valore corretto è: **atterrare sulla schermata d'azione** (`/today`), che con `TodayEmptyState` guida al passo mancante (scegli forme / imposta sessioni), invece che su un menu neutro. Non promettere "pratica pronta".
- *Riferimento*: Apple Fitness+ ("remove the guesswork around what to do next"). Recap dedicato scartato come over-engineering.
- *Impatto minimalismo*: alleggerisce.
- *Effort*: S.
- *File*: `lib/actions/onboarding.ts`, `OnboardingForm.tsx` (verifica).

---

### Tema B — Tipografia & gerarchia (alto valore, basso rischio, tocco "editoriale premium")

**B1. Una sola classe `.section-label` per il kicker di sezione**
- *Cosa*: definire in `globals.css` (`@layer components`) `.section-label` sui token esistenti: `font-family var(--font-label)`, `letter-spacing .08em`, `text-transform uppercase`, `font-size .75rem`, `color var(--muted-foreground)`. Sostituirla nei 5 callsite incoerenti: `programma/page.tsx:135`, `LibraryFilters.tsx:166/201`, `CustomSelectionForm.tsx:156/245`, `ResetScheduleSection.tsx:43`.
- *Perché*: lo stesso ruolo semantico ha oggi cinque grammatiche (due famiglie di font, tre size). Una classe sola = coerenza e meno duplicazione. `progress/SectionHeader` (con icona, zona brand-ok) resta fuori scope.
- *Riferimento*: Linear/Bear (label uppercase ripetute in modo sistematico).
- *Impatto minimalismo*: alleggerisce.
- *Effort*: M.
- *File*: `globals.css`, `programma/page.tsx`, `LibraryFilters.tsx`, `CustomSelectionForm.tsx`, `ResetScheduleSection.tsx`.

**B2. Allineare l'h1 di `/today`** — incluso in A1 (3xl → 2xl). Nove route su undici sono già a `text-2xl font-semibold`; `/today` è l'unica anomalia non giustificata. `error.tsx` resta a `text-lg` (boundary), `hub` resta editoriale (eccezione brand).

**B3. Allineare `TeacherNote` esteso alla compact**
- *Cosa*: in `TeacherNote.tsx`, portare il kicker della versione estesa (riga 25-37) al registro della compact (label-font, text-primary, text-xs) e il corpo in `italic`. Filetto gold a sinistra opzionale (eccezione editoriale ammessa, è contenuto non controllo).
- *Perché*: le due varianti dello stesso microcopy identitario divergono (font-body vs label-font, corsivo vs no). È coerenza, non gusto.
- *Riferimento*: Bear/Oak (contenuto curato trattato come editoriale).
- *Impatto minimalismo*: neutro.
- *Effort*: S.
- *File*: `TeacherNote.tsx`.

---

### Tema C — Stati: loading / error / edge case (crepe in un'app altrimenti curatissima)

**C1. `error.tsx` non deve essere un vicolo cieco**
- *Cosa*: accanto a "Riprova" (unica azione gold) aggiungere `<Button asChild variant="ghost"><Link href="/hub">Torna alla home</Link></Button>`. Scartare la detection offline (il SW già copre i navigate).
- *Perché*: su errore deterministico `reset()` rifallisce e l'utente resta intrappolato senza uscita.
- *Riferimento*: principio anti-dead-end (verificabile, non serve brand).
- *Impatto minimalismo*: neutro.
- *Effort*: S.
- *File*: `app/(app)/error.tsx`.

**C2. Skeleton `/progress` che combacia con la pagina reale**
- *Cosa*: riscrivere `progress/loading.tsx` riusando `ProgressSectionSkeleton` (già il fallback dei Suspense): header skeleton + 4 sezioni con `heightClass` h-16/h-16/h-40/h-56, stesso ordine. Eliminare il variant "calendar" che mostra una griglia inesistente.
- *Perché*: oggi al primo paint compare un finto mese a griglia che poi salta a 4 card → layout shift e forma sbagliata.
- *Riferimento*: Next.js App Router docs (loading.tsx rispecchia il segmento).
- *Impatto minimalismo*: alleggerisce.
- *Effort*: S.
- *File*: `progress/loading.tsx`.

**C3. Skeleton `/today` che mima l'header reale**
- *Cosa*: `today/loading.tsx` dedicato che disegni la forma vera (material-bar, eyebrow corta, h1, corpo). Nota: se si fa prima A1 (header snellito), questo skeleton va allineato alla **nuova** forma senza i due bottoni — fare C3 dopo A1.
- *Perché*: il default mostra 3 chip (filtri inesistenti) e cambia altezza alla risoluzione.
- *Riferimento*: Next.js streaming.
- *Impatto minimalismo*: neutro.
- *Effort*: S.
- *File*: `today/loading.tsx`.

**C4. Errore di mutation silenzioso in `PlanFormsSection` (toggle Focus/Mantenimento)**
- *Cosa*: aggiungere `useState<string|null>` per l'errore; in `applyStatus` (riga 51-59) fare `setError(null)` prima della chiamata e `setError(result.error)` su fallimento, poi mostrare una riga `p role="status"` destructive — esattamente il pattern visibile già in `RepsCounter.tsx:73-77`.
- ⚠️ *Precisazione (revisione)*: il rollback qui è **implicito** via `useOptimistic` (lo stato ottimistico decade al termine della transition se la revalidation non conferma il nuovo valore), non un rollback esplicito come in `PracticeCompletionToggle`. Va bene così: l'unico gap reale è la **visibilità** del fallimento, non il ripristino dello stato.
- *Perché*: oggi c'è solo `console.error` (riga 56); lo stato ottimistico alimenta via `onCountsChange`+`useEffect` l'anteprima conteggi/durata di `SetupForm`, quindi un errore silenzioso falsa anche la preview.
- *Riferimento*: coerenza interna col pattern già adottato altrove.
- *Impatto minimalismo*: neutro.
- *Effort*: S.
- *File*: `PlanFormsSection.tsx`.

**C5. Data ISO grezza in `AddFreePracticeSheet`**
- *Cosa*: formattare `dateKey` con `toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long' })` (pattern già in `RestDayCard`/`CalendarDayPanel`) prima di passarlo alla `SheetDescription`.
- *Perché*: in un'app curatissima nella copy italiana compare "2026-06-02" grezzo.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `AddFreePracticeSheet.tsx`.

**C6. `RestDayCard` "Nessuna sessione futura" senza azione**
- *Cosa*: nel ramo `nextTrainingDate === null`, aggiungere un `Button variant="secondary" size="sm"` verso `/sessions/setup` e copy più direttivo ("Il ciclo è concluso. Imposta nuove sessioni per ripartire."), allineandolo al gemello `expired` di `TodayEmptyState`.
- *Perché*: due stati equivalenti trattati in modo incoerente; qui l'utente non sa come ripartire.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `RestDayCard.tsx`.

---

### Tema D — IA & navigazione

**D1. Riattivare il tab di sezione su `/skill/[id]`**
- *Cosa*: in `BottomNav.tsx`, aggiungere `'/skill'` ai match dello slot `/library` (riusa il pattern già usato per `/calendar` e `/plan`).
- *Perché*: aprendo una tecnica nessuno dei 5 tab è attivo: la barra non dice più da quale area si proviene. La tecnica è parte della Scuola, quindi "Scuola" attivo è corretto.
- *Riferimento*: pattern standard iOS/Material (il dettaglio mantiene attiva la tab d'origine) — qui è solo estensione del pattern interno.
- *Impatto minimalismo*: alleggerisce.
- *Effort*: S. *File*: `BottomNav.tsx`.

**D2. Affordance "Indietro" su `/skill/[id]`** (nice-to-have, fare dopo D1)
- *Cosa*: un solo `Button` ghost con `ChevronLeft` (aria-label "Indietro", non gold) in cima a `skill/[skillId]/page.tsx`. Richiede una piccola isola client (`components/skill/BackButton.tsx`). ⚠️ *Dettaglio (revisione)*: `router.back()` nudo fallisce su entry diretta/deep-link in PWA standalone (history vuota → resta fermo). Implementare con fallback: se `window.history.length > 1` allora `router.back()`, altrimenti `router.push('/library')`. Pattern di isola client già usato in `ResetScheduleSection`.
- *Perché*: oggi l'unico ritorno è il back OS (non garantito in PWA standalone iOS) o il temple-icon che salta a `/hub` perdendo i filtri. Se D1 basta per l'orientamento, questo è secondario.
- *Riferimento*: convenzione iOS/Safari; ricerca PWA conferma back nativo non garantito in standalone.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `skill/[skillId]/page.tsx` (+ nuova isola client).

---

### Tema E — Accessibilità

**E1. Focus-ring gold su Button default (doppio anello)**
- *Cosa*: sul `Button variant=default` dare in focus un doppio anello (gap scuro + outline gold). ⚠️ *Implementazione sicura (revisione)*: una utility `box-shadow` rischia di **sovrascrivere** lo shadow/ring esistente del bottone. Comporre i layer in un'unica regola: `focus-visible:shadow-[0_0_0_2px_var(--surface-base),0_0_0_4px_var(--ring)]` (gap scuro interno + anello gold esterno) **mantenendo** lo shadow di base del variant (concatenare, non rimpiazzare; verificare l'ordine in `button.tsx`/`globals.css`). In alternativa restare su `outline`+`outline-offset` (già usato globalmente in `*:focus-visible`) e limitarsi ad aggiungere il gap. Obbligatorio uno smoke test da tastiera sul variant default dopo la modifica.
- *Perché*: ring gold su fill gold non raggiunge il 3:1 di WCAG 2.2 SC 2.4.13. Si vede solo da tastiera, zero impatto a riposo. Limitare al variant default (le altre hanno già stacco).
- *Riferimento*: WCAG 2.2 SC 2.4.13 (pattern doppio anello).
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `globals.css`, `button.tsx`.

**E2. Heatmap `/progress` come immagine unica per screen reader**
- *Cosa*: in `PracticeCalendar.tsx`, mettere `role="img"` + un solo `aria-label` riassuntivo sul contenitore della griglia, marcare le 90 celle `aria-hidden` (tenere `title` per l'hover mouse).
- *Perché*: oggi uno SR percorre fino a 90 nodi etichettati uno per uno, dato già riassunto dalla riga finale.
- *Riferimento*: WCAG (matrici decorative come `role=img`).
- *Impatto minimalismo*: alleggerisce. *Effort*: S. *File*: `PracticeCalendar.tsx`.

**E3. Skip-link al contenuto**
- *Cosa*: `id="main"` su `<main>` in `(app)/layout.tsx` + un `<a href="#main">` "Salta al contenuto" `sr-only` che diventa visibile su focus.
- *Perché*: WCAG 2.4.1 Bypass Blocks; `sr-only` già in uso nel progetto. Basso impatto per single-user ma a costo quasi zero.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `(app)/layout.tsx`.

**E4. Correzioni minori a11y**
- `PracticeCompletionToggle.tsx`: sostituire `role="switch"+aria-checked` con `aria-pressed` (è un bottone-stato, non uno switch widget). Non introdurre thumb scorrevole.
- `MetricStrip.tsx:23`: label caption da `text-[0.68rem]` a `text-xs` (APCA borderline su muted ~11px).
- `PersonalNotesPanel.tsx:21`: data del diario da ~11px a ≥12px (unico testo gold informativo fine). Lasciare invariati i kicker decorativi.
- *Impatto minimalismo*: neutro/alleggerisce. *Effort*: S. *File*: i tre indicati.

---

### Tema F — Profondità, materiali & micro-interazioni (rifinitura, non priorità)

**F1. Hairline "Fresnel" sulla material-bar**
- *Cosa*: aggiungere a `.material-bar` un solo specular hairline: `box-shadow: var(--shadow-md), inset 0 0.5px 0 0 rgba(232,223,208,0.08)`. Non ridurre il blur (claim GPU non verificabile, cambierebbe un look apprezzato).
- *Perché*: dà profondità di vetro a costo zero su header e sticky player.
- *Riferimento*: iOS 26 / macOS Tahoe Liquid Glass (solo la parte verificabile).
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `globals.css`.

**F2. Active-dot BottomNav in fade**
- *Cosa*: in `BottomNav.tsx` rendere il dot sempre nel DOM e pilotarne l'`opacity` (`opacity-0`/`opacity-100` con `transition-opacity duration-[var(--duration-feedback)]`) invece di mount/unmount.
- *Perché*: oggi il cambio tab fa sparire/ricomparire il dot di colpo — il cambio più brusco della shell. Niente View Transitions (sproporzionato).
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `BottomNav.tsx`, `globals.css`.

**F3. Documentare la mappa superfici + allineare l'ombra delle card**
- *Cosa*: in `docs/ui-system.md` dichiarare pagina=base / card=grouped / overlay-chrome=elevated / nota=inset (così il sotto-uso di `elevated` diventa scelta esplicita). Allineare l'ombra "card su pagina": le sezioni `/progress` (`shadow-sm`) e la `Card` (`shadow-[0_0_40px_...]`) usano due trattamenti diversi per superfici identiche — sceglierne uno.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: `docs/ui-system.md`, `card.tsx`, `PracticeCalendar.tsx`.

**F4. Haptica web sui momenti del loop** (opzionale)
- *Cosa*: micro-helper `lib/haptics.ts` (~10 righe) con guard `navigator.vibrate` + `prefers-reduced-motion`; chiamarlo solo su `markPracticeDone` riuscito, transizione a completed in `RepsCounter` e `PracticeCompletionToggle`.
- *Nota onesta*: su iOS Safari (target primario PWA) `vibrate` non è esposto → no-op nel caso d'uso più probabile. Tenuto solo perché a costo nullo; legittimo rimandarlo.
- *Impatto minimalismo*: neutro. *Effort*: S. *File*: i tre + `lib/haptics.ts`.

---

### Tema G — Qualità codice & dipendenze

**G1. Rimuovere `next-pwa` (dipendenza morta)**
- *Cosa*: `npm uninstall next-pwa`, togliere l'entry da `package.json`, correggere `skill-practice/CLAUDE.md` (sezione Stack vincolato) sostituendo "next-pwa per service worker e manifest" con "Service worker statico in `public/sw.js`, registrato da `ServiceWorkerRegister`; manifest in `public/manifest.json`".
- *Perché*: `next-pwa@5.x` è fermo al Pages Router, incompatibile con App Router/Next 16, mai importato. È peso morto + doc che contraddice il codice. Verificare `npm run build` dopo.
- *Impatto minimalismo*: alleggerisce. *Effort*: S. *File*: `package.json`, `CLAUDE.md`.

**G2. Rimuovere Geist (font scaricato a vuoto)**
- *Cosa*: in `layout.tsx` togliere import `Geist`, la const `geistSans` e `${geistSans.variable}` dall'`<html>`. Zero referenze altrove; il sans operativo è Spectral.
- *Perché*: famiglia font self-hosted scaricata senza un solo callsite → peso netto sul first paint.
- *Impatto minimalismo*: alleggerisce. *Effort*: S. *File*: `layout.tsx`.

**G3. Refactor `PlanFormsSection` / `SetupForm`** (vedi §5 — investimento M, da fare insieme a C4).

## 4. Quick wins (S/M, alto impatto, da fare subito)

| # | Intervento | Tema | Effort | Impatto |
|---|-----------|------|--------|---------|
| A3 | Togliere glow gold dalla card focus (governance) | Core loop | S | alleggerisce |
| A2 | Rimuovere `PracticeCompletionBadge` dalla card today | Core loop | S | alleggerisce |
| A6 | Redirect onboarding `/hub` → `/today` | Core loop | S | alleggerisce |
| D1 | Riattivare tab "Scuola" su `/skill/[id]` | Navigazione | S | alleggerisce |
| C1 | Uscita verso `/hub` in `error.tsx` | Stati | S | neutro |
| C2 | Skeleton `/progress` allineato alle 4 card | Stati | S | alleggerisce |
| G1 | Disinstallare `next-pwa` + fix doc | Codice | S | alleggerisce |
| G2 | Rimuovere font Geist inutilizzato | Codice/perf | S | alleggerisce |
| E2 | Heatmap `role=img` (–90 annunci SR) | A11y | S | alleggerisce |
| C4 | Errore visibile nel toggle Focus/Mantenimento | Stati | S | neutro |

Dieci interventi a basso costo che già spostano l'ago: rispettano la governance, riducono peso, chiudono crepe.

## 5. Investimenti più grandi (M, nessun vero L)

Non emergono interventi L genuini: il sistema è sano e tutto è proporzionato a un MVP. I due "M" reali:

- **A1 — Snellire header `/today`** (M): tocca 3 file e va coordinato con C3 (skeleton). È il singolo intervento di maggior valore percepito perché agisce sulla schermata più usata. **Vale per un MVP single-user**: è sottrazione, non nuova feature.
- **B1 — Classe `.section-label`** (M): tocca 5 callsite + globals.css. Vale perché elimina cinque grammatiche divergenti con una sola classe basata su token esistenti. **Sì per l'MVP**, ma fermarsi qui: NON creare l'intera scala nominata `.page-title/.body-note/.caption` (scartato — mini design-system anticipato).
- **G3 — Refactor `PlanFormsSection`/`SetupForm`** (M): spostare `useOptimistic` in `SetupForm` come fonte unica, eliminare `onCountsChange`+`useEffect`. **Da fare solo insieme a C4** (stesso blocco di codice), altrimenti la fragilità resta teorica e si può rimandare per un single-user.

## 6. Scartati di proposito

- **View Transitions / shared-element morph** (anche se è il "wow nativo" di moda): gli ingredienti visivi descritti non esistono (le righe library non mostrano poster, l'header skill è un `<h1>`), richiede flag experimental + wrapper su più file. Aggiunge peso, non lo toglie.
- **Scala tipografica nominata completa** (`.page-title/.body-note/.caption`): mini design-system anticipato per un single-user; viola "meno è meglio" e il decision tree (≥3 callsite reali). Tengo solo `.section-label` + l'edit puntuale sull'h1.
- **Hub come dashboard dinamica di stato**: duplicherebbe `/today`, aggiunge query e logica a una superficie volutamente leggera/identitaria. La ridondanza hub/nav è accettabile per un MVP.
- **Gamification in qualsiasi forma** (streak come leva, badge, confetti, "N dei tuoi M giorni" con framing di quota): esclusione hard §10. La chiusura sessione (A5) resta una constatazione di stato, mai una ricompensa.
- **Glass nuovo / blur ridotto / WebGL refraction**: tengo solo l'hairline Fresnel verificabile (F1); il resto è speculativo e cambierebbe un look già apprezzato.
- **npm `web-haptics`, AI, multi-lingua, upload video, nuove UI library**: esclusioni hard. L'haptica (F4), se mai, è 10 righe a mano e degrada a no-op su iOS.
- **Drag&drop calendario, time-of-day color shift, scroll-driven pervasivo**: over-engineering per un MVP single-user.

## 7. Sequenza consigliata

1. **Core loop `/today` (sottrazione)**: A3 → A2 → A4 → A1 → A5. Sono il cuore quotidiano e in larga parte S; A1 è l'unico M e chiude il blocco. Subito dopo A1, allineare C3 (skeleton today) alla nuova forma.
2. **Pulizia tecnica a costo zero**: G1 (next-pwa) + G2 (Geist) + A6 (redirect onboarding). Tre edit isolate, verificare `npm run build`.
3. **Stati & coerenza**: C1, C2, C4, C5, C6 + D1. Chiudono le crepe più visibili in uso reale.
4. **Tipografia & gerarchia**: B1 (`.section-label`) + B3 (`TeacherNote`). Rifinitura editoriale a basso rischio.
5. **Accessibilità & rifinitura materiali**: E1, E2, E3, E4 + F1, F2, F3. Opzionali e da fare in coda: D2, F4, G3 (quest'ultimo solo se si rimette mano a `PlanFormsSection` per C4).

File chiave più toccati: `src/components/today/TodaySkillCard.tsx`, `src/components/today/TodaySessionHeader.tsx`, `src/app/(app)/today/page.tsx`, `src/app/globals.css`, `src/components/nav/BottomNav.tsx`, `src/app/(app)/error.tsx`, `src/app/(app)/progress/loading.tsx`, `src/components/sessions/PlanFormsSection.tsx`, `src/lib/actions/onboarding.ts`, `package.json`, `src/app/layout.tsx`.

## 8. Verifica (per ogni blocco, prima di considerarlo chiuso)

Automatica (sempre, dalla root `skill-practice/`):

```
npm run lint
npm run typecheck
npm run build
npm run ui:audit   # rilevante soprattutto dopo A3 (glow gold = violazione governance) e B1
```

Smoke manuale mirato, per area toccata:

- **Core loop (A1-A5)**: `/today` con sessione attiva → header più basso, prima card sopra la piega; il glow gold sparisce ma il bordo focus resta leggibile; completare una skill → transizione calma del bordo + chiusura sobria a 100%. **Critico per A1**: con schedule attiva verificare che `/profile` mostri "Modifica allenamento" e che da lì si raggiunga `/sessions/setup` (non deve esistere uno stato in cui la schedule è immodificabile).
- **Onboarding (A6)**: percorso "con esame" e "senza esame" → atterraggio su `/today` con lo stato/CTA corretto, non su `/hub`.
- **Navigazione (D1/D2)**: aprire `/skill/[id]` → tab "Scuola" attivo; back funziona sia da navigazione interna sia da apertura diretta (fallback a `/library`).
- **Stati (C1-C6)**: forzare un errore → `error.tsx` offre l'uscita a `/hub`; `/progress` e `/today` in caricamento mostrano skeleton della forma giusta (no layout shift); toggle Focus/Mantenimento con rete spenta → errore visibile e conteggio che torna indietro; date in `it-IT` nello sheet pratica libera; `RestDayCard` "nessuna sessione futura" con CTA.
- **A11y (E1-E4)**: focus da tastiera sui `Button variant=default` (doppio anello visibile, niente shadow rotto); heatmap `/progress` annunciata come immagine unica; skip-link al primo Tab; `prefers-reduced-motion` attivo → niente transizioni nuove fastidiose.
- **Pulizia dipendenze (G1/G2)**: dopo rimozione `next-pwa` e Geist, `npm run build` verde e nessun import orfano (`grep` di `next-pwa`, `Geist`, `geistSans`).

Mobile reale (PWA standalone iOS, target primario): altezza header `/today`, safe-area, back su `/skill/[id]`.
