Add-Type -AssemblyName System.Drawing
$bgPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\pomo-bg.png"
$logoPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\icon-512.png"
$bg = [System.Drawing.Image]::FromFile($bgPath)
$logo = [System.Drawing.Image]::FromFile($logoPath)

$w = 1024
$h = 512
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$bgRatio = $bg.Width / $bg.Height
$targetRatio = $w / $h
$cropW = 0
$cropH = 0
$srcX = 0
$srcY = 0

if ($bgRatio -gt $targetRatio) {
    $cropW = $bg.Height * $targetRatio
    $cropH = $bg.Height
    $srcX = ($bg.Width - $cropW) / 2
    $srcY = 0
}
else {
    $cropW = $bg.Width
    $cropH = $bg.Width / $targetRatio
    $srcX = 0
    $srcY = ($bg.Height - $cropH) / 2
}

$srcRect = New-Object System.Drawing.RectangleF $srcX, $srcY, $cropW, $cropH
$destRect = New-Object System.Drawing.RectangleF 0, 0, $w, $h
$g.DrawImage($bg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Draw dark overlay so logo pops
$overlayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(100, 0, 0, 0))
$g.FillRectangle($overlayBrush, 0, 0, $w, $h)
$overlayBrush.Dispose()

$logoSize = 300
$logoRect = New-Object System.Drawing.Rectangle (($w - $logoSize) / 2), (($h - $logoSize) / 2), $logoSize, $logoSize
$g.DrawImage($logo, $logoRect)

$outPath = "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\pomo-bg-wide.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$bg.Dispose()
$logo.Dispose()
Write-Host "Composed wide background."
