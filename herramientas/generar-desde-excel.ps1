# Genera las tarjetas del prototipo a partir de plantilla-tarjetas.xlsx y de la carpeta fotos\.
# Uso (desde la carpeta del proyecto):
#   powershell -ExecutionPolicy Bypass -File herramientas\generar-desde-excel.ps1
# Produce:
#   prototipo\<direccion>\index.html     una tarjeta pública por funcionario (igual que investinperu.pe/tarjeta/<direccion>/)
#   prototipo\index.html                  se actualiza con los datos de la Gerenta General (enlace usado en la demostración)
#   prototipo\assets\datos-tarjetas.js   datos que usa el panel de administración
#   prototipo\assets\fotos\<usuario>.jpg fotos optimizadas para web (máx. 1000 px)
param([string]$Proyecto = (Join-Path $PSScriptRoot '..'))
$ErrorActionPreference = 'Stop'
$Proyecto = (Resolve-Path $Proyecto).Path
$excel = Join-Path $Proyecto 'plantilla-tarjetas.xlsx'
$proto = Join-Path $Proyecto 'prototipo'
$fotosOrigen = Join-Path $Proyecto 'fotos'
$fotosWeb = Join-Path $proto 'assets\fotos'
$plantillaHtml = Join-Path $proto 'index.html'

# Direcciones (slug) y encuadres definidos a mano; el resto se calcula
$DIRECCION = @{ 'mrazuri'='mirtha-razuri'; 'ldelcarpioc'='luis-del-carpio'; 'mcaballero'='maria-caballero'; 'jdelatorre'='juan-carlos-de-la-torre'; 'mfernandezc'='maria-fernandez' }
$ENCUADRE = @{ 'mrazuri'='33% 22%' }
$PRINCIPAL = 'mrazuri'   # su tarjeta también se publica en prototipo\index.html

function Get-Slug([string]$t) {
  $n = $t.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', ''
  (($n.ToLower() -replace '[^a-z0-9]+', '-') -replace '^-+|-+$', '')
}
function Get-Codigo([string]$s) {
  $h = 2166136261L; foreach ($ch in $s.ToCharArray()) { $h = (($h -bxor [int]$ch) * 16777619L) % 4294967296L }
  $abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; $c = ''
  for ($i = 0; $i -lt 5; $i++) { $c += $abc[[int]($h % 32)]; $h = [math]::Floor($h / 32) + ($i + 7) * 131 }
  $c
}

# 1) Leer el Excel
$xl = New-Object -ComObject Excel.Application; $xl.Visible = $false; $xl.DisplayAlerts = $false
$filas = @()
try {
  $wb = $xl.Workbooks.Open($excel, 0, $true); $ws = $wb.Worksheets.Item('Tarjetas')
  $r = 2
  while ($ws.Cells.Item($r, 3).Text.Trim()) {
    $v = @(); for ($c = 1; $c -le 12; $c++) { $v += $ws.Cells.Item($r, $c).Text.Trim() }
    $filas += [pscustomobject]@{ nombres = $v[0]; apellidos = $v[1]; correo = $v[2]; cargo_es = $v[3]; cargo_en = $v[4]; area_es = $v[5]; area_en = $v[6]; celular = $v[7]; whatsapp = $v[8]; anexo = $v[9]; bio_es = $v[10]; bio_en = $v[11] }
    $r++
  }
  $wb.Close($false)
} finally { $xl.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($xl); [GC]::Collect() }
"Funcionarios leídos del Excel: $($filas.Count)"

# 2) Preparación de fotos
Add-Type -AssemblyName System.Drawing
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L
New-Item -ItemType Directory -Force $fotosWeb | Out-Null

# 3) Datos comunes: se toman de la tarjeta plantilla (prototipo\index.html)
$html = [IO.File]::ReadAllText($plantillaHtml, [Text.Encoding]::UTF8)
$rx = [regex]'(?s)(<script id="datos-tarjeta" type="application/json">)(.*?)(</script>)'
$base = $rx.Match($html).Groups[2].Value | ConvertFrom-Json
$comunes = @{ entidad = $base.entidad; telefono = $base.telefono; direccion = $base.direccion; web = $base.web; enlaces = $base.enlaces; redes = $base.redes }

$tarjetas = @(); $usadas = @{}
foreach ($f in $filas) {
  $u = $f.correo.Split('@')[0].ToLower()
  $slug = if ($DIRECCION.ContainsKey($u)) { $DIRECCION[$u] } else { Get-Slug(($f.nombres.Split(' ')[0]) + ' ' + ($f.apellidos.Split(' ')[0])) }
  if ($usadas.ContainsKey($slug)) { throw "Dirección repetida: $slug ($u y $($usadas[$slug]))" }; $usadas[$slug] = $u
  $foto = ''
  $origen = @('jpg', 'jpeg', 'png') | ForEach-Object { Join-Path $fotosOrigen "$u.$_" } | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($origen) {
    $im = [System.Drawing.Image]::FromFile($origen)
    $k = [math]::Min(1, 1000 / [math]::Max($im.Width, $im.Height)); $w = [int]($im.Width * $k); $h = [int]($im.Height * $k)
    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $gr = [System.Drawing.Graphics]::FromImage($bmp); $gr.Clear([System.Drawing.Color]::White); $gr.InterpolationMode = 'HighQualityBicubic'; $gr.PixelOffsetMode = 'HighQuality'
    $gr.DrawImage($im, 0, 0, $w, $h); $gr.Dispose(); $im.Dispose()
    $bmp.Save((Join-Path $fotosWeb "$u.jpg"), $enc, $ep); $bmp.Dispose()
    $foto = "assets/fotos/$u.jpg"
  } else { Write-Warning "Sin foto para $u (la tarjeta mostrará las iniciales)" }
  $tarjetas += [pscustomobject][ordered]@{
    slug = $slug; nombres = $f.nombres; apellidos = $f.apellidos; correo = $f.correo
    cargo = [pscustomobject][ordered]@{ es = $f.cargo_es; en = $f.cargo_en }
    area = [pscustomobject][ordered]@{ es = $f.area_es; en = $f.area_en }
    bio = [pscustomobject][ordered]@{ es = $f.bio_es; en = $f.bio_en }
    celular = $f.celular; whatsapp = [bool]($f.whatsapp -match '^s'); anexo = ($f.anexo -replace '\D', '')
    foto = $foto; foto_posicion = $(if ($ENCUADRE.ContainsKey($u)) { $ENCUADRE[$u] } else { '50% 24%' })
    estado = 'activa'; codigo = (Get-Codigo $u)
  }
}

# 4) Datos del panel
$js = "/* Generado por herramientas/generar-desde-excel.ps1 a partir de plantilla-tarjetas.xlsx. No editar a mano. */`nwindow.TARJETAS_DATOS = " + (ConvertTo-Json -InputObject $tarjetas -Depth 6) + ";`n"
[IO.File]::WriteAllText((Join-Path $proto 'assets\datos-tarjetas.js'), $js, (New-Object Text.UTF8Encoding $false))

# 5) Una página por tarjeta
function New-Pagina($t, [string]$prefijo) {
  $url = 'https://www.investinperu.pe/tarjeta/' + $t.slug + '/'
  $d = [pscustomobject][ordered]@{
    slug = $t.slug; nombres = $t.nombres; apellidos = $t.apellidos; cargo = $t.cargo; area = $t.area; entidad = $comunes.entidad; bio = $t.bio
    celular = $t.celular; whatsapp = $t.whatsapp; telefono = $comunes.telefono; anexo = $t.anexo; correo = $t.correo
    direccion = $comunes.direccion; web = $comunes.web
    foto = $(if ($t.foto) { $prefijo + $t.foto } else { '' }); foto_posicion = $t.foto_posicion
    url_tarjeta = $url; url_qr = $url; enlaces = $comunes.enlaces; redes = $comunes.redes
  }
  $json = "`n" + (ConvertTo-Json -InputObject $d -Depth 6) + "`n"
  $nombre = ($t.nombres + ' ' + $t.apellidos).Trim()
  $cargo = $t.cargo.es
  $p = $rx.Replace($html, { param($m) $m.Groups[1].Value + $json + $m.Groups[3].Value })
  $p = [regex]::Replace($p, '<title>.*?</title>', '<title>' + [Net.WebUtility]::HtmlEncode($nombre) + ' · PROINVERSIÓN</title>')
  $p = [regex]::Replace($p, '(<meta name="description" content=")[^"]*', '${1}' + [Net.WebUtility]::HtmlEncode('Tarjeta de contacto de ' + $nombre + ', ' + $cargo + ' de PROINVERSIÓN.'))
  $p = [regex]::Replace($p, '(<meta property="og:title" content=")[^"]*', '${1}' + [Net.WebUtility]::HtmlEncode($nombre + ' · PROINVERSIÓN'))
  $p = [regex]::Replace($p, '(<meta property="og:description" content=")[^"]*', '${1}' + [Net.WebUtility]::HtmlEncode($cargo))
  $p = [regex]::Replace($p, '(<meta property="og:url" content=")[^"]*', '${1}' + $url)
  if ($prefijo) { $p = $p.Replace('href="assets/', 'href="' + $prefijo + 'assets/').Replace('src="assets/', 'src="' + $prefijo + 'assets/') }
  $p
}
$utf8 = New-Object Text.UTF8Encoding $false
foreach ($t in $tarjetas) {
  $dir = Join-Path $proto $t.slug; New-Item -ItemType Directory -Force $dir | Out-Null
  [IO.File]::WriteAllText((Join-Path $dir 'index.html'), (New-Pagina $t '../'), $utf8)
}
$prin = $tarjetas | Where-Object { $_.correo -like "$PRINCIPAL@*" } | Select-Object -First 1
if ($prin) { [IO.File]::WriteAllText($plantillaHtml, (New-Pagina $prin ''), $utf8) }
"Tarjetas generadas: $($tarjetas.Count)"
$tarjetas | ForEach-Object { "  prototipo/{0}/  ·  {1} {2}{3}" -f $_.slug, $_.nombres, $_.apellidos, $(if (-not $_.foto) { '  (sin foto)' } else { '' }) }
