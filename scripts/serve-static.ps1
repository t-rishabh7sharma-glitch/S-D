# Serves a folder over HTTP — no Node, Python, or npm. Same idea as the old static/serve.ps1.
# Usage:
#   .\scripts\serve-static.ps1
#   .\scripts\serve-static.ps1 -Port 8080
#   .\scripts\serve-static.ps1 -Root "C:\path\to\folder"
param(
  [int]$Port = 3000,
  [string]$Root = ""
)

$ErrorActionPreference = "Stop"

if (-not $Root) {
  $Root = Join-Path (Split-Path $PSScriptRoot -Parent) "static"
}
if (-not (Test-Path -LiteralPath $Root)) {
  Write-Host "Creating folder: $Root" -ForegroundColor DarkYellow
  New-Item -ItemType Directory -Path $Root -Force | Out-Null
}
try {
  $Root = (Resolve-Path -LiteralPath $Root).Path
}
catch {
  Write-Host "Root folder not found: $Root" -ForegroundColor Red
  exit 1
}

$prefix = "http://127.0.0.1:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
}
catch {
  Write-Host "Could not bind $prefix — close other apps using this port or try -Port 8080." -ForegroundColor Red
  throw
}

function Get-Mime {
  param([string]$ext)
  switch ($ext.ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".htm" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    ".mjs" { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".gif" { "image/gif" }
    ".webp" { "image/webp" }
    ".ico" { "image/x-icon" }
    ".woff" { "font/woff" }
    ".woff2" { "font/woff2" }
    ".ttf" { "font/ttf" }
    ".txt" { "text/plain; charset=utf-8" }
    ".map" { "application/json; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

function Send-Bytes {
  param(
    [System.Net.HttpListenerResponse]$res,
    [byte[]]$bytes,
    [string]$type
  )
  $res.ContentType = $type
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.Close()
}

function Send-Status {
  param([System.Net.HttpListenerResponse]$res, [int]$code, [string]$text)
  $res.StatusCode = $code
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  Send-Bytes -res $res -bytes $bytes -type "text/plain; charset=utf-8"
}

Write-Host ""
Write-Host "  Static file server (PowerShell only)" -ForegroundColor Green
Write-Host "  Root:  $Root" -ForegroundColor DarkGray
Write-Host "  Open:  ${prefix}" -ForegroundColor Yellow
Write-Host "  Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

try {
while ($true) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $raw = $req.Url.LocalPath.TrimStart("/")
    if ($raw -eq "") { $raw = "index.html" }

    $candidate = Join-Path $Root $raw
    $fullRoot = [System.IO.Path]::GetFullPath($Root)
    $fullFile = [System.IO.Path]::GetFullPath($candidate)

    if (-not $fullFile.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
      Send-Status -res $res -code 403 -text "Forbidden"
      continue
    }

    if (Test-Path -LiteralPath $fullFile -PathType Container) {
      $idx = Join-Path $fullFile "index.html"
      if (Test-Path -LiteralPath $idx) {
        $fullFile = $idx
      }
      else {
        Send-Status -res $res -code 403 -text "Directory listing disabled"
        continue
      }
    }

    if (-not (Test-Path -LiteralPath $fullFile)) {
      Send-Status -res $res -code 404 -text "Not found"
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($fullFile)
    $ext = [System.IO.Path]::GetExtension($fullFile)
    $mime = Get-Mime $ext
    Send-Bytes -res $res -bytes $bytes -type $mime
  }
  catch {
    try {
      $res.StatusCode = 500
      $res.Close()
    }
    catch { }
  }
}
}
finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
}
