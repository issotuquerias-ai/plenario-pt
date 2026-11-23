# PLENÁRIO PT — servidor HTTP local minimalista (sem instalar nada).
# Serve a pasta do jogo em http://localhost:8765/ e abre o navegador.
# Útil para usar a IA local (Ollama), que aceita pedidos vindos de http://localhost.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8765
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
  Write-Host "Nao foi possivel abrir a porta $port. Talvez o jogo ja esteja aberto." -ForegroundColor Yellow
  Start-Process $prefix
  exit
}
Write-Host "Servidor ativo em $prefix" -ForegroundColor Green
Start-Process $prefix
$mime = @{
  '.html'='text/html; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg';
  '.svg'='image/svg+xml'; '.ico'='image/x-icon'; '.md'='text/plain; charset=utf-8'; '.txt'='text/plain; charset=utf-8'
}
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path.TrimStart('/') -replace '/', '\')
    $full = [System.IO.Path]::GetFullPath($file)
    if (-not $full.StartsWith($root) -or -not (Test-Path $full -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('404')
    } else {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
      $bytes = [System.IO.File]::ReadAllBytes($full)
    }
    $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.OutputStream.Close()
  } catch { }
}
