Add-Type -TypeDefinition (Get-Content -Raw "CropUtil.cs") -ReferencedAssemblies "System.Drawing"
[Cropper]::CropImage("c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\icon-192.png", "c:\Users\kaane\.gemini\antigravity\scratch\lifeos_mobile\assets\icons\favicon-desktop.png")
