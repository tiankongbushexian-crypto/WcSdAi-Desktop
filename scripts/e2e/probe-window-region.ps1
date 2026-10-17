param(
  [Parameter(Mandatory = $true)][long]$windowHandle,
  [string]$outputImagePath = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public struct RegionRect { public int Left; public int Top; public int Right; public int Bottom; }
public struct RegionPoint { public int X; public int Y; public RegionPoint(int x, int y) { X = x; Y = y; } }
public static class RegionProbe {
  [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr window, out RegionRect rect);
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(RegionPoint point);
  [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr window, uint flags);
  [DllImport("dwmapi.dll")] public static extern int DwmFlush();
  [DllImport("user32.dll")] public static extern int GetWindowRgn(IntPtr window, IntPtr region);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateRectRgn(int l, int t, int r, int b);
  [DllImport("gdi32.dll")] public static extern int GetRgnBox(IntPtr region, out RegionRect rect);
  [DllImport("gdi32.dll")] public static extern bool PtInRegion(IntPtr region, int x, int y);
  [DllImport("gdi32.dll")] public static extern bool DeleteObject(IntPtr obj);
}
'@

$previousDpi = [RegionProbe]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
if ($previousDpi -eq [IntPtr]::Zero) { throw 'Cannot enable per-monitor DPI-aware native probe' }
$region = [RegionProbe]::CreateRectRgn(0, 0, 0, 0)
if ($region -eq [IntPtr]::Zero) { throw 'Cannot allocate native window region probe' }
try {
  $window = [IntPtr]::new($windowHandle)
  $nativeRect = [RegionRect]::new()
  if (-not [RegionProbe]::GetWindowRect($window, [ref]$nativeRect)) { throw 'Cannot read native window bounds' }
  $width = $nativeRect.Right - $nativeRect.Left
  $height = $nativeRect.Bottom - $nativeRect.Top
  if ($width -lt 3 -or $height -lt 3) { throw 'Native window is too small to sample' }
  $kind = [RegionProbe]::GetWindowRgn($window, $region)
  $result = @{
    kind = $kind
    dpi = [RegionProbe]::GetDpiForWindow($window)
    windowRect = @{ left = $nativeRect.Left; top = $nativeRect.Top; right = $nativeRect.Right; bottom = $nativeRect.Bottom; width = $width; height = $height }
  }
  if ($kind -gt 1) {
    $rect = [RegionRect]::new()
    [void][RegionProbe]::GetRgnBox($region, [ref]$rect)
    $right = $rect.Right - 1
    $bottom = $rect.Bottom - 1
    $inset = 0
    while ($inset -lt $rect.Right -and -not [RegionProbe]::PtInRegion($region, $inset, 0)) { $inset++ }
    $result['width'] = $rect.Right
    $result['height'] = $rect.Bottom
    $result['regionBounds'] = @{ left = $rect.Left; top = $rect.Top; right = $rect.Right; bottom = $rect.Bottom; width = $rect.Right - $rect.Left; height = $rect.Bottom - $rect.Top }
    $result['topInset'] = $inset
    $result['cornersExcluded'] = @(
      (-not [RegionProbe]::PtInRegion($region, 0, 0)),
      (-not [RegionProbe]::PtInRegion($region, $right, 0)),
      (-not [RegionProbe]::PtInRegion($region, 0, $bottom)),
      (-not [RegionProbe]::PtInRegion($region, $right, $bottom))
    )
    $result['centerOwned'] = [RegionProbe]::PtInRegion($region, [int]($right / 2), [int]($bottom / 2))
  }
  # Capture the composed desktop, not the renderer's rectangular capturePage.
  # The caller owns the foreground and full-screen backdrop fixture windows.
  Add-Type -AssemblyName System.Drawing
  if ([RegionProbe]::DwmFlush() -ne 0) { throw 'DWM composition flush failed' }
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.CopyFromScreen($nativeRect.Left, $nativeRect.Top, 0, 0, [System.Drawing.Size]::new($width, $height))
    $points = @(
      @{ corner = 'top-left'; x = 1; y = 1 },
      @{ corner = 'top-right'; x = $width - 2; y = 1 },
      @{ corner = 'bottom-left'; x = 1; y = $height - 2 },
      @{ corner = 'bottom-right'; x = $width - 2; y = $height - 2 }
    )
    $result['samples'] = @($points | ForEach-Object {
      $color = $bitmap.GetPixel($_.x, $_.y)
      $screenX = $nativeRect.Left + $_.x
      $screenY = $nativeRect.Top + $_.y
      $hit = [RegionProbe]::WindowFromPoint([RegionPoint]::new($screenX, $screenY))
      $root = [RegionProbe]::GetAncestor($hit, 2)
      @{ corner = $_.corner; x = $screenX; y = $screenY; rgb = @([int]$color.R, [int]$color.G, [int]$color.B); rootWindowHandle = $root.ToInt64().ToString() }
    })
    if ($outputImagePath) {
      [void][System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($outputImagePath))
      $bitmap.Save($outputImagePath, [System.Drawing.Imaging.ImageFormat]::Png)
      $result['screenshot'] = $outputImagePath
    }
  } finally { $graphics.Dispose(); $bitmap.Dispose() }
  $result | ConvertTo-Json -Compress -Depth 5
} finally {
  [void][RegionProbe]::DeleteObject($region)
  [void][RegionProbe]::SetThreadDpiAwarenessContext($previousDpi)
}
