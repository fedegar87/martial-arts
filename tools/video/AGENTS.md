# Strumenti per il video tutorial

Questa cartella contiene strumenti di produzione separati dall'app Next.js.
Leggi `../../docs/video-tutorial-setup.md` prima di lavorare a un tutorial.

- Esegui `powershell -NoProfile -ExecutionPolicy Bypass -File check.ps1` per verificare il setup.
- Usa il Remotion rilasciato e fissato in `package-lock.json`; `C:\remotion` e `C:\hyperframes` sono checkout sorgente senza build CLI al momento del setup.
- Le istruzioni Remotion sono in `C:\remotion\packages\skills\skills\remotion-best-practices\SKILL.md`; segui i riferimenti pertinenti al lavoro richiesto.
- Per HyperFrames leggi prima `C:\hyperframes\skills\hyperframes\SKILL.md` e verifica i prerequisiti; non considerarlo gia collaudato.
- Usa `.venv\Scripts\python.exe -m whisper`, non Python globale. Modelli in `../../.video-cache/whisper`.
- File di lavoro, registrazioni, audio, sottotitoli ed export vanno in `work/`, ignorata da Git.
- Non modificare l'app per simulare funzionalita nel tutorial. Mostra comportamento reale con account e dati demo.
- L'account demo e lo storyboard si definiscono quando viene richiesto il tutorial. Non registrare account reali o schermate con credenziali.
