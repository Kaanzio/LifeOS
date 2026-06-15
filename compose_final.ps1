Add-Type -AssemblyName System.Drawing
$bgPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\pomo-bg.png"
$logoPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\icon-512.png"

$bg = [System.Drawing.Image]::FromFile($bgPath)
$logo = [System.Drawing.Image]::FromFile($logoPath)

$size = 1024
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Draw the background stretched/fitted to square
$g.DrawImage($bg, 0, 0, $size, $size)

# Darken it slightly to make it look premium
$overlayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
$g.FillRectangle($overlayBrush, 0, 0, $size, $size)
$overlayBrush.Dispose()

# Draw logo in center
$logoSize = 400
$logoX = ($size - $logoSize) / 2
$logoY = ($size - $logoSize) / 2
$logoRect = New-Object System.Drawing.Rectangle $logoX, $logoY, $logoSize, $logoSize
$g.DrawImage($logo, $logoRect)

$outPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\pomo-bg-final.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$bg.Dispose()
$logo.Dispose()
Write-Host "Composed final square background."
