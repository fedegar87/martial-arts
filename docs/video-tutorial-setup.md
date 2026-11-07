# Setup per il video tutorial dell'app

Preparato il 7 novembre 2026. Strumenti locali in `C:\martial-arts\tools\video`.
Questo setup serve alla produzione dei video; non aggiunge dipendenze all'app.

## Strumenti e ruoli

| Strumento | Impiego | Installazione |
| --- | --- | --- |
| Remotion 4.0.540 | Montaggio, zoom, titoli, evidenziazione dei passaggi | `tools/video/node_modules`, versioni fissate nel lockfile |
| Playwright | Registrazione della UI reale in un browser desktop | Dipendenza di `tools/video`; Chromium locale al pacchetto |
| OpenAI Whisper | Trascrizione della voce e sottotitoli con tempi | Python 3.11 isolato in `tools/video/.venv` |
| PyTorch CPU | Esecuzione locale di Whisper senza dipendere da CUDA | Nello stesso ambiente Python |
| FFmpeg / FFprobe 8.1.1 | Conversioni, audio, encoding e verifica dei file | Gia presenti nel PATH tramite WinGet |
| HyperFrames | Alternativa per intro e motion graphics HTML | Checkout `C:\hyperframes`, build e rendering ancora da verificare |

## Collaudo eseguito

- Remotion: rendering di 60 fotogrammi e verifica visiva del frame centrale;
  `tools/video/work/setup-check.mp4`, 1280x720, 30 fps, durata 2 secondi.
- Playwright: registrazione di una pagina di prova salvata come WebM in
  `tools/video/work/capture-check/`. Non e una registrazione dell'app.
- Whisper `20250625` con PyTorch `2.15.0+cpu`: modello `base` scaricato e
  caricato; audio sintetico inglese di 5 secondi trascritto correttamente,
  con TXT, SRT, VTT, TSV e JSON in `tools/video/work/captions/`.
- FFmpeg: export integrato `tools/video/work/pipeline-check.mp4` verificato
  con FFprobe: video H.264, audio AAC, sottotitoli `mov_text`, durata 2 secondi.

La qualita dei sottotitoli italiani andra verificata sulla voce reale. I primi
avvii includono download e inizializzazione: non costituiscono un benchmark.
Il sandbox dell'agente puo impedire l'avvio di Chromium: in questo ambiente
il collaudo browser ha richiesto l'esecuzione autorizzata fuori dal sandbox.

`C:\remotion` contiene il monorepo sorgente 4.0.540 con `node_modules`, ma
senza `packages/cli/dist/index.js`. Per essere operativi usiamo il pacchetto
rilasciato della stessa versione, in un piccolo progetto autonomo.
Anche `C:\hyperframes` risulta privo della CLI compilata: la sola presenza
dei sorgenti non equivale a un rendering collaudato.

Whisper riconosce il parlato: non genera una voce narrante. Per il tutorial
possiamo usare una registrazione della tua voce; un'eventuale voce sintetica
si scegliera quando servira. Il modello multilingue `base` e predisposto per
l'uso locale senza API key. `small` o modelli superiori si possono scaricare
in seguito per confrontare la qualita sull'audio italiano reale.

## Comandi pronti

Dalla root del progetto, in PowerShell:

```powershell
# Verifica installazioni, modello e avvio del browser
.\tools\video\check.ps1

# Apri l'editor video sulla porta 3100, separata dall'app
Set-Location C:\martial-arts\tools\video
npm.cmd run studio

# Render di collaudo: 2 secondi, 1280x720, 30 fps, H.264
npm.cmd run render:smoke

# Collaudo registrazione browser, senza accedere all'app
npm.cmd run capture:smoke

# Registra l'app gia avviata; Invio nel terminale termina e salva
npm.cmd run capture -- http://localhost:3000

# Trascrivi audio o video in italiano: TXT, SRT, VTT, TSV, JSON
.\transcribe.ps1 -InputFile .\work\narration.wav

# Modello piu accurato da scaricare al primo utilizzo
.\transcribe.ps1 -InputFile .\work\narration.wav -Model small
```

La registrazione Playwright usa un contesto nuovo senza sessioni salvate:
si accede con un account demo. Produce WebM a 1440x900 e non cattura microfono
o audio di sistema. La voce si registra separatamente. Per mostrare installazione
PWA, notifiche o gesti iOS reali serve invece una registrazione dal telefono.
Il comando di cattura e interattivo: avviarlo da un terminale visibile oppure
preparare in seguito uno script di percorso per l'automazione.

Conserva registrazioni, voci ed export in `tools/video/work/`; ambiente Python,
modelli e cache sono esclusi da Git. Non spostare `.venv`: ricreala se cambia
il percorso del progetto.

## Ripristino dell'ambiente

```powershell
Set-Location C:\martial-arts
uv venv --python 3.11 --cache-dir .video-cache\uv tools\video\.venv
uv pip install --python tools\video\.venv\Scripts\python.exe --cache-dir .video-cache\uv torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python tools\video\.venv\Scripts\python.exe --cache-dir .video-cache\uv -r tools\video\requirements-whisper.txt
.\tools\video\.venv\Scripts\python.exe -c "import whisper; whisper.load_model('base', device='cpu', download_root='.video-cache/whisper')"
Set-Location tools\video
npm.cmd ci
$env:PLAYWRIGHT_BROWSERS_PATH = '0'
.\node_modules\.bin\playwright.cmd install chromium
Remove-Item Env:\PLAYWRIGHT_BROWSERS_PATH
```

Il primo rendering Remotion scarica il proprio browser; Playwright ne usa uno
separato. Dopo il collaudo i relativi file sono locali. Riferimenti ufficiali:
[Remotion](https://www.remotion.dev/docs/),
[OpenAI Whisper](https://github.com/openai/whisper),
[FFmpeg](https://ffmpeg.org/).

## Impostazione proposta per il tutorial

1. Definire pubblico e risultato: un nuovo allievo riesce a iniziare una pratica.
2. Preparare account e dati demo stabili, senza email o note personali visibili.
3. Registrare l'interfaccia reale: Oggi, apertura skill e riferimenti video,
   completamento pratica, note e consultazione dei progressi/calendario.
4. Montare una prima versione di circa 2-3 minuti, con una sola azione spiegata
   alla volta. Proposta iniziale: master 1920x1080 a 30 fps con UI mobile
   ingrandita dove utile; eventuale versione verticale dopo la prima revisione.
5. Registrare la voce sul montaggio; usare Whisper per i sottotitoli, correggendo
   nomi delle forme, terminologia FESK e sincronizzazione.
6. Esportare MP4 H.264/AAC piu SRT e verificare leggibilita sul telefono,
   tempi, audio e corrispondenza con il comportamento attuale dell'app.

La guida `marketing-video-promo-guide.md` riguarda il promo breve: per un tutorial
sono piu utili ritmo calmo, azioni complete e dettagli leggibili.
Non e ancora stato registrato il tutorial dell'app.
