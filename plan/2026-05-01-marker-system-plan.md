# Piano marker visuali e disponibilità video

## Obiettivo

Rendere coerenti i marker che indicano stato del piano, pratica completata,
accessibilità del curriculum e disponibilità video. Il colore non deve essere
l'unico segnale: ogni stato importante deve avere anche icona, testo, `title` o
`aria-label`.

## Convenzione

| Ambito | Significato | Marker |
| --- | --- | --- |
| Piano | `Focus` | oro + icona fiamma |
| Piano | `Ripasso` | ambra + icona ripeti |
| Piano | `Mantenimento` | blu informativo + icona chiave |
| Pratica | `Fatto oggi` / completato | verde + check |
| Pratica | `Da fare` | neutro + cerchio vuoto |
| Programma | non nel piano attivo | cerchio vuoto neutro |
| Curriculum | accessibile ma non nel piano | quadrato neutro |
| Curriculum | bloccato | quadrato muted + opacità |
| Video | video presente | icona video neutra |
| Video | video mancante o placeholder | icona video-off ambra |
| UI | tab/filtro attivo | controllo selezionato, non marker di progresso |

## Implementazione

1. Centralizzare le classi in `src/lib/marker-visuals.ts`.
2. Derivare la disponibilità video con `hasPlayableVideo()` da `src/lib/youtube.ts`,
   usando la stessa logica del player.
3. Riutilizzare i marker in:
   - `Scuola Chang` e `Programma`, dove si sceglie la forma;
   - dettaglio skill, dove si pratica liberamente;
   - `/today`, dove lo stato quotidiano è operativo;
   - `Progresso`, dove le mappe devono usare la stessa semantica.
4. Sostituire i pallini solo-colore di stato attivo con icona/testo quando lo
   spazio lo permette.

## Note di coerenza

- Verde è riservato a ciò che è completato o praticato, non a stati del piano.
- Il piano dice "perché questa forma appare"; la pratica dice "cosa hai fatto
  oggi"; il video dice "il contenuto multimediale è pronto".
- La presenza video è mostrata anche nelle liste, perché è un criterio utile
  prima di aprire una forma.
