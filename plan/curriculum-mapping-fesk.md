# Mappatura Curriculum FESK — Riferimento Canonico

**Status:** Validato dal fondatore (terminologia corretta)
**Ultimo aggiornamento:** 2026-04-25
**Fonte:** Programma ufficiale FESK — https://www.feskfongttai.it/il-kung-fu/il-programma-d-insegnamento
**Uso:** Seed data per `0004_seed_fesk.sql` (vedi `sprint-curriculum-fesk.md §6`)

**Implementazione:** `skill-practice/scripts/generate-fesk-seed.mjs` espande questa mappatura in 137 skill e genera `skill-practice/supabase/migrations/0004_seed_fesk.sql`.

---

## 1. GLOSSARIO UFFICIALE

> Terminologia validata dal fondatore. La trascrizione è **Wade-Giles italianizzato**, tipica delle scuole italiane anni '70-'80 (lignaggio Chang Dsu Yao). Il pinyin è aggiunto come riferimento.

### 1.1 Termini strutturali

| Trascrizione antica | Pinyin | Hanzi | Significato corretto | Note |
|---|---|---|---|---|
| Lu | lu | 路 | Forma di studio (sequenza individuale) | — |
| Tao | tao | 套 | Esecuzione in coppia | Non confondere con 刀 (sciabola) |
| Lu-Tao | lu-tao | 路套 | Forma individuale + applicazione in coppia | Ricorrente dopo Po Chi, Chinna, armi |
| Chi | ji | 級 | Grado base (dal 7 al 1) | Numerazione decrescente |
| Chieh | duan | 段 | Grado avanzato (cintura nera) | Da 1 a 5 (Shaolin) / 6 (Tai Chi) |
| Mezza Luna | — | — | Grado maestro/esperto | 1 e 2 Mezza Luna |

### 1.2 Tecniche e categorie

| Trascrizione antica | Pinyin | Hanzi | Significato corretto | Categoria app |
|---|---|---|---|---|
| Tui Fa | tui fa | 腿法 | **Calci fondamentali** — 15 tecniche singole progressive | `tui_fa` |
| Po Chi | bo ji | 搏擊 | **Combattimenti preordinati** — sequenze a due | `po_chi` |
| Chinna | qin na | 擒拿 | **Leve articolari** | `chin_na` |
| Ti Kung Ch'uan | di gong quan | 地功拳 | **Cadute fondamentali** | `preparatori` |
| Tue Shou | tui shou | 推手 | Mani che spingono (Pushing Hands) | `tue_shou` |
| Ta Lu | da lu | 大捋 | Grandi deviazioni/avvolgimenti | `ta_lu` |
| Chi Kung | qi gong | 氣功 | Lavoro sull'energia vitale | `chi_kung` |

### 1.3 Forme a mano nuda

| Trascrizione antica | Pinyin | Hanzi | Significato | Categoria app |
|---|---|---|---|---|
| Lien Pu Ch'uan | lian bu quan | 連步拳 | Pugno a passi collegati | `forme` |
| Shaolin (forme) | shao lin | 少林 | Forme Shaolin (1-10 Lu) | `forme` |
| Mei Hua Ch'uan | mei hua quan | 梅花拳 | Pugno del Pruno Fiorito | `forme` |
| Pa Chi Ch'uan | ba ji quan | 八極拳 | Pugno delle Otto Estremita | `forme` |
| Kung Li Ch'uan | gong li quan | 功力拳 | Pugno della forza e abilita | `forme` |
| Sho Hung Ch'uan | xiao hong quan | 小洪拳 | Piccolo Pugno Hong | `forme` |
| Ta Hung Ch'uan | da hong quan | 大洪拳 | Grande Pugno Hong | `forme` |
| Hsing I Wu Shin Ch'uan | xing yi wu xing quan | 形意五行拳 | Cinque Fasi dello Xing Yi | `forme` |
| Hsing I Shih Erh Hsing | xing yi shi er xing | 形意十二形 | Dodici Forme di Xing Yi | `forme` |
| Liang I Ch'uan | liang yi quan | 兩儀拳 | Forma dei Due Principi (Liang Yi) | `forme` |
| Lung Hsing Pa Kua Chang | long xing ba gua zhang | 龍形八卦掌 | Palmo Otto Trigrammi — Drago | `forme` |
| T'ai Chi (forme) | tai ji | 太極 | Forme Tai Chi (1-4 Lu + SX) | `forme` |

### 1.4 Armi

| Trascrizione antica | Pinyin | Hanzi | Significato | Categoria app |
|---|---|---|---|---|
| Pang Fa | bang fa | 棒法 | **Bastone corto** | `armi_forma` |
| Kun Fa | gun fa | 棍法 | **Bastone lungo** | `armi_forma` |
| Tan Tao | dan dao | 單刀 | **Sciabola singola** | `armi_forma` |
| Shuang Tao | shuang dao | 雙刀 | Sciabole doppie | `armi_forma` |
| Shuang Chieh Kun | shuang jie gun | 雙節棍 | Nunchaku | `armi_forma` |
| San Chieh Kun | san jie gun | 三節棍 | Bastone a tre sezioni | `armi_forma` |
| Kuan Tao | guan dao | 關刀 | Alabarda | `armi_forma` |
| Chiang Fa | qiang fa | 槍法 | Lancia | `armi_forma` |
| Shuang Kuei | shuang chui | 雙鎚 | Martelli doppi | `armi_forma` |
| Mei Hua Shuang Chien | mei hua shuang jian | 梅花雙劍 | Spade doppie del Pruno Fiorito | `armi_forma` |
| T'ai Chi Tao | tai ji dao | 太極刀 | Sciabola Tai Chi | `armi_forma` |
| T'ai Chi Kun | tai ji gun | 太極棍 | Bastone lungo Tai Chi | `armi_forma` |
| T'ai Chi Chiang | tai ji qiang | 太極槍 | Lancia Tai Chi | `armi_forma` |
| T'ai Chi Tieh Chih | tai ji tie zhi | 太極鐵指 | Dita di ferro Tai Chi | `armi_forma` |

### 1.5 Combattimenti preordinati con armi (Tui = contro)

| Voce programma | Significato | Categoria app |
|---|---|---|
| Pang Fa Po Chi 1 Tao | Combattimento preord. con bastone corto | `armi_combattimento` |
| Kun Fa Po Chi 1 Tao | Combattimento preord. con bastone lungo | `armi_combattimento` |
| Tan Tao Tui Pang Fa | Sciabola singola vs bastone corto | `armi_combattimento` |
| Tan Tao Tui Kun Fa | Sciabola singola vs bastone lungo | `armi_combattimento` |
| Pang Fa Tui Kun Fa | Bastone corto vs bastone lungo | `armi_combattimento` |
| Shuang Chieh Kun Tui Pang Fa | Nunchaku vs bastone corto | `armi_combattimento` |
| Shuang Chieh Kun Tui Kun Fa | Nunchaku vs bastone lungo | `armi_combattimento` |
| Chiang Fa Tui Za | Lancia vs (da chiarire) | `armi_combattimento` |
| Kuan Tao Tui Chiang Fa | Alabarda vs lancia | `armi_combattimento` |
| Shuang Kuei Tui Tan Tao | Martelli doppi vs sciabola singola | `armi_combattimento` |
| Shuang Kuei Tui Ta | Martelli doppi vs (da chiarire) | `armi_combattimento` |
| Tan Tao Tui Chiang | Sciabola singola vs lancia | `armi_combattimento` |
| Kung Shou To Tan Tao | Mano nuda contro sciabola singola | `armi_combattimento` |
| T'ai Chi Tao Tui T'ai Chi Tao | Sciabola TC vs sciabola TC | `armi_combattimento` |
| T'ai Chi Kun Tui T'ai Chi Kun | Bastone TC vs bastone TC | `armi_combattimento` |
| T'ai Chi Chiang Tui T'ai Chi Chiang | Lancia TC vs lancia TC | `armi_combattimento` |

---

## 2. PROGRAMMA SHAOLIN (Wei Chia)

> Formato: `Nome — categoria / practice_mode — note`

### Gradi Chi (base)

**8 Chi** — Principiante, nessuna skill (punto di partenza)

**7 Chi** (grade_value = 7)
- Lien Pu Ch'uan 1 Lu — `forme` / `solo`
- Tui Fa 1-2 — `tui_fa` / `solo` — primi 2 calci fondamentali

**6 Chi** (grade_value = 6)
- Lien Pu Ch'uan 2 Lu — `forme` / `solo`
- Tui Fa 3-4 — `tui_fa` / `solo`

**5 Chi** (grade_value = 5)
- Shaolin 1 Lu — `forme` / `solo`
- Tui Fa 5-6 — `tui_fa` / `solo`

**4 Chi** (grade_value = 4)
- Shaolin 2 Lu — `forme` / `solo`
- Tui Fa 7-8 — `tui_fa` / `solo`

**3 Chi** (grade_value = 3)
- Shaolin 3 Lu — `forme` / `solo`
- Tui Fa 9-10 — `tui_fa` / `solo`
- Po Chi 1 (Lu-Tao) — `po_chi` / `both`

**2 Chi** (grade_value = 2)
- Shaolin 4 Lu — `forme` / `solo`
- Tui Fa 11-12 — `tui_fa` / `solo`
- Po Chi 2 (Lu-Tao) — `po_chi` / `both`

**1 Chi** (grade_value = 1)
- Shaolin 5 Lu — `forme` / `solo`
- Tui Fa 13-14-15 — `tui_fa` / `solo` — tutti i 15 calci fondamentali
- Po Chi 3 (Lu-Tao) — `po_chi` / `both`

### Gradi Chieh (cintura nera)

**1 Chieh** (grade_value = -1)
- Tui Fa Lu 1-2 Lu — `tui_fa` / `solo` — forme che combinano i calci
- Po Chi 4-5 (Lu-Tao) — `po_chi` / `both`
- Pang Fa 1-2 Lu — `armi_forma` / `solo` — bastone corto
- Mei Hua Ch'uan Chi Pen Pa Fa — `forme` / `solo` — 8 metodi base Pruno Fiorito
- Ti Kung Ch'uan fond. (10) — `preparatori` / `solo` — 10 cadute fondamentali

**2 Chieh** (grade_value = -2)
- Tui Fa Lu 3 — `tui_fa` / `solo`
- Po Chi 6-7 (Lu-Tao) — `po_chi` / `both`
- Pang Fa Po Chi 1 Tao — `armi_combattimento` / `paired`
- Kun Fa 1-2 Lu — `armi_forma` / `solo` — bastone lungo
- Mei Hua Ch'uan 1 Lu — `forme` / `solo`
- Shaolin 6-7 Lu — `forme` / `solo`
- Chinna 1 (Lu-Tao) — `chin_na` / `both`

**3 Chieh** (grade_value = -3)
- Tui Fa Lu 4 — `tui_fa` / `solo`
- Pa Chi Ch'uan 1 Lu — `forme` / `solo`
- Po Chi 8-9 (Lu-Tao) — `po_chi` / `both`
- Shaolin 8-9 Lu — `forme` / `solo`
- Kun Fa Po Chi 1 Tao — `armi_combattimento` / `paired`
- Tan Tao 1-2 Lu — `armi_forma` / `solo` — sciabola singola
- Tan Tao Tui Pang Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Chinna 2 (Lu-Tao) — `chin_na` / `both`

**4 Chieh** (grade_value = -4)
- Tui Fa Lu 5 — `tui_fa` / `solo`
- Po Chi 10-11 (Lu-Tao) — `po_chi` / `both`
- Shaolin 10 Lu — `forme` / `solo`
- Shuang Kuei 1-2 — `armi_forma` / `solo` — martelli doppi
- Sho Hung Ch'uan — `forme` / `solo`
- Shuang Chieh Kun 1 Lu — `armi_forma` / `solo` — nunchaku
- Pang Fa Tui Kun Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Tan Tao Tui Kun Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Chinna 3 (Lu-Tao) — `chin_na` / `both`

**5 Chieh** (grade_value = -5)
- Tui Fa Lu 6 — `tui_fa` / `solo`
- Po Chi 12-13 (Lu-Tao) — `po_chi` / `both`
- Mei Hua Ch'uan 2 Lu — `forme` / `solo`
- Pa Chi Ch'uan 2 Lu — `forme` / `solo`
- Shuang Kuei Tui Ta — `armi_combattimento` / `paired`
- Shuang Chieh Kun Tui Pang Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Shuang Chieh Kun Tui Kun Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Kuan Tao 1 Lu — `armi_forma` / `solo` — alabarda
- Kun Fa 3 Lu — `armi_forma` / `solo`
- Shaolin Chiang Fa — `armi_forma` / `solo` — lancia Shaolin
- Chinna 4 (Lu-Tao) — `chin_na` / `both`

### Gradi Mezza Luna (maestro)

**1 Mezza Luna** (grade_value = -6)
- Tui Fa 7 — `tui_fa` / `solo`
- Po Chi 14 (Lu-Tao) — `po_chi` / `both`
- Kung Li Ch'uan — `forme` / `solo`
- Pa Chi Ch'uan Tao — `forme` / `paired`
- Chiang Fa Tui Za (Lu-Tao) — `armi_combattimento` / `paired`
- Mei Hua Ch'uan 3 Lu — `forme` / `solo`
- Kuan Tao Tui Chiang Fa (Lu-Tao) — `armi_combattimento` / `paired`
- Shuang Tao 1 Lu — `armi_forma` / `solo` — sciabole doppie
- Shuang Kuei Tui Tan Tao (Lu-Tao) — `armi_combattimento` / `paired`
- Chinna 5 (Lu-Tao) — `chin_na` / `both`

**2 Mezza Luna** (grade_value = -7)
- Tui Fa 8 — `tui_fa` / `solo`
- Po Chi 15 (Lu-Tao) — `po_chi` / `both`
- Tan Tao 3 Lu — `armi_forma` / `solo`
- Shuang Chieh Kun 2 Lu — `armi_forma` / `solo`
- San Chieh Kun 1 Lu — `armi_forma` / `solo` — bastone tre sezioni
- Tan Tao Tui Chiang (Lu-Tao) — `armi_combattimento` / `paired`
- Mei Hua Ch'uan 4 Lu — `forme` / `solo`
- Kung Shou To Tan Tao (Tao-Lu) — `armi_combattimento` / `paired`
- Ta Hung Ch'uan — `forme` / `solo`
- Shuang Tao 2 Lu — `armi_forma` / `solo`
- Chinna 6 (Lu-Tao) — `chin_na` / `both`

---

## 3. PROGRAMMA T'AI CHI (Nei Chia)

> Tai Chi parte dal 5 Chi. Gradi 7-6 Chi vuoti.
> "SX" = forma eseguita a sinistra (specularmente).

### Gradi Chi

**5 Chi** (grade_value = 5)
- Tai Chi 1 Lu — `forme` / `solo`

**4 Chi** (grade_value = 4)
- Tai Chi 2 Lu — `forme` / `solo`

**3 Chi** (grade_value = 3)
- Tai Chi 3 Lu — `forme` / `solo`

**2 Chi** (grade_value = 2)
- Tai Chi 4 Lu — `forme` / `solo`

**1 Chi** (grade_value = 1)
- Tue Shou Chi Pen Pa Fa — `tue_shou` / `paired` — basi pushing hands
- Tai Chi 1 Lu SX — `forme` / `solo`

### Gradi Chieh

**1 Chieh** (grade_value = -1)
- Tue Shou 1 Tao — `tue_shou` / `paired`
- Chi Kung Chi Pen Kung Chia — `chi_kung` / `solo`
- Hsing I Wu Shin Ch'uan — `forme` / `solo`
- Tai Chi 2 Lu SX — `forme` / `solo`

**2 Chieh** (grade_value = -2)
- Tue Shou 2 Tao — `tue_shou` / `paired`
- San Shou Ta Lu Chi Pen Pa Fa — `ta_lu` / `paired`
- Chinna 1 (Lu-Tao) — `chin_na` / `both`
- Tai Chi 3 Lu SX — `forme` / `solo`

**3 Chieh** (grade_value = -3)
- Tue Shou 3 Tao — `tue_shou` / `paired`
- Ta Lu 1 Tao — `ta_lu` / `paired`
- Mei Hua Ch'uan Chi Pen Pa Fa — `forme` / `solo`
- Chinna 2 (Lu-Tao) — `chin_na` / `both`
- Tai Chi 4 Lu SX — `forme` / `solo`

**4 Chieh** (grade_value = -4)
- Tue Shou 4 Tao — `tue_shou` / `paired`
- Ta Lu 2 Tao — `ta_lu` / `paired`
- T'ai Chi Tao — `armi_forma` / `solo` — sciabola TC
- Liang I Ch'uan 1 Lu — `forme` / `solo`
- Chinna 3 (Lu-Tao) — `chin_na` / `both`

**5 Chieh** (grade_value = -5)
- Ta Lu 3 Tao — `ta_lu` / `paired`
- T'ai Chi Tao Tui T'ai Chi Tao — `armi_combattimento` / `paired`
- T'ai Chi Kun — `armi_forma` / `solo`
- Hsing I Shih Erh Hsing — `forme` / `solo`
- Chinna 4 (Lu-Tao) — `chin_na` / `both`

**6 Chieh — Cintura Oro** (grade_value = -6)
- Ta Lu 4 Tao — `ta_lu` / `paired`
- T'ai Chi Kun Tui T'ai Chi Kun — `armi_combattimento` / `paired`
- T'ai Chi Chiang — `armi_forma` / `solo`
- Lung Hsing Pa Kua Chang — `forme` / `solo`
- Chinna 5 (Lu-Tao) — `chin_na` / `both`

### Mezza Luna

**1 Mezza Luna** (grade_value = -7)
- T'ai Chi Tieh Chih — `armi_forma` / `solo`
- Mei Hua Shuang Chien — `armi_forma` / `solo`
- T'ai Chi Chiang Tui T'ai Chi Chiang — `armi_combattimento` / `paired`
- Liang I Ch'uan 2 Lu — `forme` / `solo`
- Chinna 6 (Lu-Tao) — `chin_na` / `both`

---

## 4. NOTA SULLA TRASCRIZIONE

Sistema: **Wade-Giles italianizzato** (scuole italiane anni 70-80, lignaggio Chang Dsu Yao).

| Regola | Esempio | Pinyin moderno |
|---|---|---|
| Apostrofo = aspirazione | Ch'uan, T'ai | Quan, Tai |
| K = G non aspirata | Kun, Kuan | Gun, Guan |
| P = B non aspirata | Pang, Pa | Bang, Ba |
| T = D non aspirata | Tan, Tao | Dan, Dao |
| Hs = X | Hsing | Xing |
| Ch (prima di i/e) = J | Chi, Chieh | Ji, Jie |

---

## 5. CONTEGGI PER VERIFICA SEED

Allineati a `sprint-curriculum-fesk.md` par. 6.1:

| Sezione | Count |
|---|---|
| Shaolin — Forme | ~23 |
| Shaolin — Tui Fa | ~23 |
| Shaolin — Po Chi | 15 |
| Shaolin — Chin Na | 6 |
| Shaolin — Armi (forme + combattimenti) | ~30 |
| Tai Chi — Forme + Chi Kung | ~15 |
| Tai Chi — Tue Shou + Ta Lu + Chin Na | ~16 |
| Tai Chi — Armi | ~8 |
| Preparatori | 1 |
| **Totale** | **~137** |

---

## 6. TERMINI DA CHIARIRE CON IL FONDATORE

| Termine | Contesto | Dubbio |
|---|---|---|
| Chiang Fa Tui Za | 1 Mezza Luna Shaolin | Cosa significa "Za"? |
| Shuang Kuei Tui Ta | 5 Chieh Shaolin | Martelli doppi vs cosa? |
| Shuang Kuei | Ovunque | Confermato martelli doppi? |
| Tui Fa Lu (nei Chieh) | Da 1 Chieh in poi | Forme di calci (sequenze) vs calci singoli? |
| Shaolin Chiang Fa | 5 Chieh | Forma di lancia Shaolin o tecnica? |
| T'ai Chi Tieh Chih | 1 ML Tai Chi | Dita di ferro o altro? |
