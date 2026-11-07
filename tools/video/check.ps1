$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Push-Location $PSScriptRoot
try {
    $ffmpegVersion = & ffmpeg -hide_banner -version
    if ($LASTEXITCODE -ne 0) { throw 'FFmpeg non disponibile' }
    Write-Output $ffmpegVersion[0]
    $ffprobeVersion = & ffprobe -hide_banner -version
    if ($LASTEXITCODE -ne 0) { throw 'FFprobe non disponibile' }
    Write-Output $ffprobeVersion[0]
    & node -e "console.log('Remotion ' + require('remotion/package.json').version); console.log('Playwright ' + require('playwright/package.json').version)"
    if ($LASTEXITCODE -ne 0) { throw 'Dipendenze Node non disponibili' }
    & '.\.venv\Scripts\python.exe' -c "import whisper, torch; print('Whisper ' + whisper.__version__); print('PyTorch ' + torch.__version__)"
    if ($LASTEXITCODE -ne 0) { throw 'Whisper non disponibile' }
    $baseModel = Join-Path $projectRoot '.video-cache\whisper\base.pt'
    if (-not (Test-Path -LiteralPath $baseModel)) { throw 'Modello Whisper base non scaricato' }
    & node --input-type=module -e "process.env.PLAYWRIGHT_BROWSERS_PATH = '0'; const {chromium} = await import('playwright'); const b = await chromium.launch(); console.log('Chromium ' + b.version()); await b.close();"
    if ($LASTEXITCODE -ne 0) { throw 'Browser di registrazione non disponibile' }
} finally {
    Pop-Location
}
