# Detecta el rostro principal de cada foto con el detector de rostros de Windows (sin instalar nada).
# Devuelve objetos: usuario, ancho, alto, x, y, w, h (caja del rostro en píxeles de la imagen original).
param([string[]]$Archivos)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Media.FaceAnalysis.FaceDetector, Windows.Media.FaceAnalysis, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Esperar($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait() | Out-Null; $task.Result }
$detector = Esperar ([Windows.Media.FaceAnalysis.FaceDetector]::CreateAsync()) ([Windows.Media.FaceAnalysis.FaceDetector])
foreach ($ruta in $Archivos) {
  $u = [IO.Path]::GetFileNameWithoutExtension($ruta)
  try {
    $file = Esperar ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $ruta).Path)) ([Windows.Storage.StorageFile])
    $stream = Esperar ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = Esperar ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $sb = Esperar ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $gris = [Windows.Graphics.Imaging.SoftwareBitmap]::Convert($sb, [Windows.Graphics.Imaging.BitmapPixelFormat]::Gray8)
    $caras = Esperar ($detector.DetectFacesAsync($gris)) ([System.Collections.Generic.IList[Windows.Media.FaceAnalysis.DetectedFace]])
    $stream.Dispose()
    if (-not $caras -or $caras.Count -eq 0) { [pscustomobject]@{ usuario = $u; ancho = $sb.PixelWidth; alto = $sb.PixelHeight; x = $null; y = $null; w = $null; h = $null; caras = 0 }; continue }
    $c = $caras | Sort-Object { $_.FaceBox.Width * $_.FaceBox.Height } -Descending | Select-Object -First 1
    [pscustomobject]@{ usuario = $u; ancho = $sb.PixelWidth; alto = $sb.PixelHeight; x = $c.FaceBox.X; y = $c.FaceBox.Y; w = $c.FaceBox.Width; h = $c.FaceBox.Height; caras = $caras.Count }
  } catch { [pscustomobject]@{ usuario = $u; ancho = 0; alto = 0; x = $null; y = $null; w = $null; h = $null; caras = -1; error = $_.Exception.Message } }
}
