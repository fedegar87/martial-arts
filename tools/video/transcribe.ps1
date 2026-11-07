param(
    [Parameter(Mandatory = $true)][string]$InputFile,
    [ValidateSet('tiny', 'base', 'small', 'medium', 'large', 'turbo')][string]$Model = 'base',
    [string]$Language = 'it'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$pythonPath = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$modelDirectory = Join-Path $projectRoot '.video-cache\whisper'
$outputDirectory = Join-Path $PSScriptRoot 'work\captions'
$sourceFile = (Resolve-Path -LiteralPath $InputFile).Path
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Ambiente Whisper assente: consultare docs/video-tutorial-setup.md' }
& $pythonPath -m whisper $sourceFile --model $Model --model_dir $modelDirectory --language $Language --task transcribe --device cpu --threads 4 --fp16 False --word_timestamps True --output_format all --output_dir $outputDirectory
if ($LASTEXITCODE -ne 0) { throw 'Trascrizione Whisper fallita' }
