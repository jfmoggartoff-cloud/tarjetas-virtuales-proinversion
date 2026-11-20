# Servidor web local minimo (solo para pruebas), sin dependencias. Uso:
#   powershell -ExecutionPolicy Bypass -File herramientas\servidor.ps1
#   y abrir http://localhost:8766/ (tarjeta) o http://localhost:8766/admin/ (panel)
param([string]$Raiz = (Join-Path $PSScriptRoot '..\prototipo'), [int]$Puerto = 8766)
$Raiz = (Resolve-Path $Raiz).Path
$mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.json'='application/json'; '.woff2'='font/woff2'; '.ttf'='font/ttf'; '.vcf'='text/vcard; charset=utf-8'; '.csv'='text/csv; charset=utf-8'; '.ico'='image/x-icon'; '.xlsx'='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Puerto/")
$l.Start()
Write-Host "Sirviendo $Raiz en http://localhost:$Puerto/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    $path = Join-Path $Raiz $rel
    if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
    $full = [IO.Path]::GetFullPath($path)
    if ($full.StartsWith($Raiz) -and (Test-Path $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
      $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
      $ctx.Response.Headers.Add('Last-Modified', (Get-Item $full).LastWriteTimeUtc.ToString('r'))
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes("404: $rel"); $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    }
  } catch { } finally { $ctx.Response.Close() }
}
