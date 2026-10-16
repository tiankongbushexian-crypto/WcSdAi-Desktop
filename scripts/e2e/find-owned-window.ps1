param(
  [Parameter(Mandatory = $true)][uint32]$targetProcessId,
  [Parameter(Mandatory = $true)][string]$expectedTitle,
  [long]$backdropHandle = 0,
  [switch]$fitInsideBackdrop
)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public struct OwnedWindowRect { public int Left; public int Top; public int Right; public int Bottom; }
public static class OwnedWindowFinder {
  public delegate bool EnumWindowCallback(IntPtr window, IntPtr parameter);
  [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowCallback callback, IntPtr parameter);
  [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr window);
  [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetWindowText(IntPtr window, StringBuilder title, int maximum);
  [DllImport("user32.dll")] private static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")] private static extern uint GetDpiForWindow(IntPtr window);
  [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr window, out OwnedWindowRect bounds);
  [DllImport("user32.dll")] private static extern bool SetWindowPos(IntPtr window, IntPtr insertAfter, int x, int y, int width, int height, uint flags);
  public static string Find(uint processId, string expectedTitle) {
    var matches = new List<IntPtr>();
    EnumWindows((window, parameter) => {
      uint owner; GetWindowThreadProcessId(window, out owner);
      if (owner != processId || !IsWindowVisible(window)) return true;
      var title = new StringBuilder(1024); GetWindowText(window, title, title.Capacity);
      if (title.ToString() == expectedTitle) matches.Add(window);
      return true;
    }, IntPtr.Zero);
    if (matches.Count != 1) throw new InvalidOperationException("Expected exactly one visible owned window; found " + matches.Count);
    return matches[0].ToInt64().ToString();
  }
  public static void FitInsideBackdrop(IntPtr window, IntPtr backdrop) {
    var previous = SetThreadDpiAwarenessContext(new IntPtr(-4));
    if (previous == IntPtr.Zero) throw new InvalidOperationException("Cannot use physical window coordinates");
    try {
      OwnedWindowRect bounds;
      if (!GetWindowRect(backdrop, out bounds)) throw new InvalidOperationException("Cannot read backdrop bounds");
      var scale = GetDpiForWindow(backdrop) / 96.0;
      if (scale < 1) throw new InvalidOperationException("Invalid backdrop DPI");
      var width = bounds.Right - bounds.Left; var height = bounds.Bottom - bounds.Top;
      var margin = (int)Math.Ceiling(40 * scale);
      if (width < 880 * scale || height < 640 * scale) throw new InvalidOperationException("Runner desktop cannot fit product minimum size and backdrop");
      if (!SetWindowPos(window, IntPtr.Zero, bounds.Left + margin, bounds.Top + margin,
          Math.Min((int)(1000 * scale), width - 2 * margin), Math.Min((int)(720 * scale), height - 2 * margin), 0x0004 | 0x0010))
        throw new InvalidOperationException("Cannot place owned product window within backdrop");
    } finally { SetThreadDpiAwarenessContext(previous); }
  }
}
'@
$handle = [OwnedWindowFinder]::Find($targetProcessId, $expectedTitle)
if ($fitInsideBackdrop) {
  if ($backdropHandle -le 0) { throw 'Fitting requires the owned backdrop handle' }
  [OwnedWindowFinder]::FitInsideBackdrop([IntPtr]::new([long]$handle), [IntPtr]::new($backdropHandle))
}
@{ handle = $handle } | ConvertTo-Json -Compress
