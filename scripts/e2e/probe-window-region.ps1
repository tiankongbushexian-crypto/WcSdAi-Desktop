param([Parameter(Mandatory = $true)][long]$windowHandle)

$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public struct RegionRect { public int Left; public int Top; public int Right; public int Bottom; }
public static class RegionProbe {
  [DllImport("user32.dll")] public static extern int GetWindowRgn(IntPtr window, IntPtr region);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateRectRgn(int l, int t, int r, int b);
  [DllImport("gdi32.dll")] public static extern int GetRgnBox(IntPtr region, out RegionRect rect);
  [DllImport("gdi32.dll")] public static extern bool PtInRegion(IntPtr region, int x, int y);
  [DllImport("gdi32.dll")] public static extern bool DeleteObject(IntPtr obj);
}
'@

$region = [RegionProbe]::CreateRectRgn(0, 0, 0, 0)
if ($region -eq [IntPtr]::Zero) { throw 'Cannot allocate native window region probe' }
try {
  $kind = [RegionProbe]::GetWindowRgn([IntPtr]::new($windowHandle), $region)
  $result = @{ kind = $kind }
  if ($kind -gt 1) {
    $rect = [RegionRect]::new()
    [void][RegionProbe]::GetRgnBox($region, [ref]$rect)
    $right = $rect.Right - 1
    $bottom = $rect.Bottom - 1
    $inset = 0
    while ($inset -lt $rect.Right -and -not [RegionProbe]::PtInRegion($region, $inset, 0)) { $inset++ }
    $result['width'] = $rect.Right
    $result['height'] = $rect.Bottom
    $result['topInset'] = $inset
    $result['cornersExcluded'] = @(
      (-not [RegionProbe]::PtInRegion($region, 0, 0)),
      (-not [RegionProbe]::PtInRegion($region, $right, 0)),
      (-not [RegionProbe]::PtInRegion($region, 0, $bottom)),
      (-not [RegionProbe]::PtInRegion($region, $right, $bottom))
    )
    $result['centerOwned'] = [RegionProbe]::PtInRegion($region, [int]($right / 2), [int]($bottom / 2))
  }
  $result | ConvertTo-Json -Compress
} finally { [void][RegionProbe]::DeleteObject($region) }
