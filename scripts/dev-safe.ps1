param(
  [switch]$NoLaunch,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ForwardArgs
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$lockFile = Join-Path $projectRoot '.next\dev\lock'
$nextCommand = Join-Path $projectRoot 'node_modules\.bin\next.cmd'

function Get-RepoNextProcesses {
  $escapedRoot = [Regex]::Escape($projectRoot)
  Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
    Where-Object {
      $_.CommandLine -and
      $_.CommandLine -match 'next' -and
      $_.CommandLine -match 'dev' -and
      $_.CommandLine -match $escapedRoot
    }
}

function Stop-RepoNextProcesses {
  $processes = @(Get-RepoNextProcesses)
  foreach ($process in $processes) {
    try {
      Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    } catch {
      # Ignore already-closed or inaccessible process errors.
    }
  }

  if ($processes.Count -gt 0) {
    Start-Sleep -Milliseconds 450
  }
}

if (-not (Test-Path $nextCommand)) {
  throw "No se ha encontrado next.cmd en $nextCommand. Ejecuta npm install antes de arrancar el entorno."
}

Stop-RepoNextProcesses

if (Test-Path $lockFile) {
  try {
    Remove-Item $lockFile -Force -ErrorAction Stop
  } catch {
    Start-Sleep -Milliseconds 300
    if (Test-Path $lockFile) {
      Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    }
  }
}

if ($NoLaunch) {
  Write-Output "dev-safe check completado"
  exit 0
}

$arguments = @('dev') + $ForwardArgs
Push-Location $projectRoot
try {
  & $nextCommand @arguments
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
