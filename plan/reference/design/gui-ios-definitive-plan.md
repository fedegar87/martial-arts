# Piano Definitivo GUI/iOS - Skill Practice FESK

**Status:** piano consolidato ed eseguibile  
**Data:** 2026-04-25  
**Sostituisce operativamente:** `gui-ux-experience-audit.md` + `ios-design-principles-enhancement.md`  
**Scope:** Scenario A, MVP personale FESK. Scenario B e landing pubblica restano gated.

---

## 0. Fonti e decisione guida

Fonti Apple usate come riferimento, senza copiare pattern nativi in modo letterale:

- Apple HIG - Foundations: https://developer.apple.com/design/human-interface-guidelines/
- Apple HIG - Color: https://developer.apple.com/design/human-interface-guidelines/color
- Apple HIG - Materials: https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/materials/
- Apple HIG - Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Apple HIG - Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility/

Decisione: l'app deve sentirsi piu' nativa e calma, non piu' decorata. Il contenuto tecnico resta protagonista; oro, blur, motion e superfici servono solo a chiarire gerarchia e stato.

---

## 1. Principi definitivi

1. **Gerarchia prima dell'estetica.** Ogni schermata risponde subito a: cosa pratico, perche', dove sono nel programma.
2. **Oro come tint unico.** Oro pieno solo per CTA primaria, stato attivo e focus reale; verde/amber/blu solo come indicatori semantici compatti.
3. **Materiali solo flottanti.** Blur e trasparenza su bottom nav, sticky action bar e sheet; card e note restano opache.
4. **Superfici semantiche.** Base, grouped, elevated, inset; meno bordi decorativi, piu' separazione tramite layer.
5. **Motion fisica ma sobria.** Feedback breve su tap, transizioni 150-300ms, nessuna animazione indispensabile per capire lo stato.
6. **Accessibilita' mobile reale.** Zoom abilitato, target principali almeno 44px, focus visibile, `aria-current`, label non solo colore.
7. **Lessico FESK lato utente.** "Programma", "forme", "tecniche", "piano"; "skill" resta nome tecnico nel codice.

---

## 2. Piano esecutivo Scenario A

### Fase A0 - Base visiva e accessibilita'

- Riorganizzare token CSS in livelli: primitive, semantic, component.
- Aggiungere materiali `.material-bar` e `.material-sheet` con fallback `prefers-reduced-transparency`.
- Aggiungere motion tokens e fallback `prefers-reduced-motion`.
- Ridurre grain overlay sotto i materiali.
- Riabilitare zoom mobile.
- Portare bottoni, input, select e checkbox principali a 44px minimi.
- Aggiungere `aria-current` su nav e tab.
- Sostituire emoji/category marker con icone Lucide coerenti.
- Correggere date "oggi" e range settimanali usando data locale Europe/Rome.

### Fase A1 - Navigazione e lessico

- Bottom nav: `Oggi | Programma | Progressi | Profilo`.
- Route `/library` resta invariata per non introdurre migrazioni routing inutili, ma label pubblica diventa `Programma`.
- Sotto-tab Programma: `Mio grado | Prossimo esame | Curriculum | Tutte`.
- Usare un solo pattern segmented per discipline, tabs e progress discipline.
- Rendere il piano discoverable da Today e Profilo.

### Fase A2 - Today

- Header piu' forte: piano attivo, numero contenuti, tempo stimato, giorni settimana.
- CTA primaria "Inizia sessione".
- News banner resta contestuale.
- Sezioni Focus/Ripasso/Mantenimento mantengono le card, ma con superfici opache, note inset e motion/tap feedback.
- "Fatto" apre sheet nota con materiale e mantiene feedback di stato.

### Fase A3 - Programma e Piano

- Programma diventa mappa mentale primaria, non "libreria".
- Righe curriculum: icona categoria, stato piano, lock esplicito.
- Selezione libera: righe grandi, checkbox 44px, counter sticky, salva disabilitato se 0, filtro rapido per grado.
- Programma esame: select 44px, preview testuale delle conseguenze, submit chiaro.
- Nessun `window.confirm`: usare sheet/dialog coerente.

### Fase A4 - Skill detail, Progressi, Profilo

- Skill detail: titolo prima, metadati sotto, nota maestro su surface inset, CTA piano in sticky action bar.
- Progressi: top summary leggibile, calendario accessibile con label, legenda curriculum.
- Profilo: resta impostazioni; piano e gradi sono sezioni secondarie con copy sulle conseguenze.

---

## 3. Gating non eseguito ora

### Landing pubblica

Non fa parte dell'esecuzione Scenario A. Si abilita solo se:

- l'app deve essere mostrata a istruttori, federazione o utenti terzi;
- esistono privacy/ToS minime;
- ci sono screenshot o asset visivi reali/generati coerenti.

Quando il gate si apre: `/` diventa landing pubblica per non loggati, gli utenti loggati vanno a `/today`, `/login` resta accesso diretto.

### Scenario B

Non si esegue ora:

- tab Bacheca primaria;
- admin CRUD;
- multiutente scuola/istruttore;
- GDPR minorenni;
- SRS avanzato.

---

## 4. Definition of Done di questa tranche

- `npm run lint` passa.
- `npm run build` passa.
- Nessun blocco zoom mobile.
- Nessun `window.confirm`.
- Nessuna emoji usata come iconografia UI primaria.
- Bottom nav e tab usano label/active state coerenti.
- Today, Programma, Piano, Progressi e Profilo riflettono il lessico definitivo.
- Le date pratica usano la giornata locale, non UTC raw.
