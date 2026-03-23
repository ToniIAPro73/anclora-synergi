param(
  [Parameter(Mandatory = $true)]
  [string]$InputHtml,

  [Parameter(Mandatory = $true)]
  [string]$OutputPdf
)

$resolvedInput = (Resolve-Path $InputHtml).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPdf)
$outputDir = Split-Path -Parent $resolvedOutput

if (-not (Test-Path $resolvedInput)) {
  throw "Input HTML not found: $InputHtml"
}

if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$browserCandidates = @(
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
)

$browser = $browserCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $browser) {
  throw 'Chrome/Edge executable not found for PDF rendering.'
}

$inputUri = [System.Uri]::new($resolvedInput)

& $browser `
  --headless=new `
  --disable-gpu `
  --run-all-compositor-stages-before-draw `
  --virtual-time-budget=4000 `
  --print-to-pdf-no-header `
  "--print-to-pdf=$resolvedOutput" `
  $inputUri.AbsoluteUri

$maxAttempts = 10
for ($attempt = 0; $attempt -lt $maxAttempts; $attempt++) {
  if ((Test-Path $resolvedOutput) -and ((Get-Item $resolvedOutput).Length -gt 0)) {
    exit 0
  }

  Start-Sleep -Milliseconds 500
}

throw "PDF was not generated: $resolvedOutput"
