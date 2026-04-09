# Starts Vite on http://localhost:3000 (see vite.config.ts).
# Run from Cursor terminal:  cd apps\snd-web  ;  .\start-dev.ps1

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

function Find-Npm {
    $candidates = @(
        (Join-Path $env:ProgramFiles "nodejs\npm.cmd"),
        (Join-Path ${env:ProgramFiles(x86)} "nodejs\npm.cmd"),
        (Join-Path $env:APPDATA "nvm\current\npm.cmd")
    )
    foreach ($p in $candidates) {
        if (Test-Path -LiteralPath $p) { return $p }
    }
    $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

$npm = Find-Npm
if (-not $npm) {
    Write-Host "Node.js was not found. Install LTS from https://nodejs.org/ then reopen Cursor and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Using: $npm" -ForegroundColor DarkGray
& $npm run dev
