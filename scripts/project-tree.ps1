param(
  [string]$Root = ".",
  [string[]]$Exclude = @(".git",".github",".next",".vercel",".vscode","node_modules"),
  [string]$OutFile = ""
)

[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

function New-ExcludeRegex([string[]]$names){
  if(-not $names -or $names.Count -eq 0){ return $null }
  $esc = $names | ForEach-Object { [Regex]::Escape($_) }
  [Regex]::new("(^|[\\/])(" + ($esc -join "|") + ")(?=([\\/]|$))","IgnoreCase")
}

$rx = New-ExcludeRegex $Exclude
$lines = [System.Collections.Generic.List[string]]::new()
$rootPath = (Resolve-Path $Root).Path
$lines.Add((Split-Path $rootPath -Leaf))

function Walk([string]$p, [string]$pref){
  $kids = Get-ChildItem -Force $p | Where-Object {
    if($rx){ -not $rx.IsMatch($_.FullName) } else { $true }
  } | Sort-Object @{Expression={$_.PSIsContainer};Descending=$true}, Name

  for($i=0; $i -lt $kids.Count; $i++){
    $k = $kids[$i]
    $last = ($i -eq $kids.Count-1)
    $conn = if($last){ '\--' } else { '|--' }
    $lines.Add("$pref$conn $($k.Name)")
    if($k.PSIsContainer){
      $childPrefix = if($last){ '   ' } else { '|  ' }
      Walk -p $k.FullName -pref ($pref + $childPrefix)
    }
  }
}

Walk -p $rootPath -pref ''

if([string]::IsNullOrWhiteSpace($OutFile)){
  $lines
}else{
  $lines | Out-File -Encoding ascii $OutFile
  Write-Host "Saved to $OutFile"
}
