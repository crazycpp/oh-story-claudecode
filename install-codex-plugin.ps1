param(
  [switch]$SkipGitUpdate
)

$ErrorActionPreference = "Stop"

function Require-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Require-Command node
Require-Command codex

if (-not $SkipGitUpdate) {
  Require-Command git

  $dirty = git status --short
  if ($dirty) {
    throw "Working tree is not clean. Commit, stash, or discard local changes before installing."
  }

  $currentBranch = git branch --show-current
  if ($currentBranch -ne "codex/main") {
    Write-Host "Switching to codex/main..."
    git checkout codex/main
  }

  Write-Host "Updating codex/main from origin..."
  git fetch origin codex/main
  git pull --ff-only origin codex/main
}

Write-Host "Installing oh-story-skills as a clean Codex personal plugin..."
node .codex-plugin\scripts\install-personal.js
if ($LASTEXITCODE -ne 0) {
  throw "Failed to build and publish the local Codex plugin package."
}

Write-Host "Registering oh-story-skills with Codex..."
codex plugin add oh-story-skills@personal
if ($LASTEXITCODE -ne 0) {
  throw "Codex could not register oh-story-skills@personal."
}

$pluginList = codex plugin list
if ($LASTEXITCODE -ne 0) {
  throw "Codex could not verify the installed plugin."
}
$pluginLine = $pluginList | Where-Object { $_ -match '^\s*oh-story-skills@personal\s+' } | Select-Object -First 1
if (-not $pluginLine -or $pluginLine -notmatch 'installed,\s+enabled') {
  throw "Codex did not report oh-story-skills@personal as installed and enabled."
}
Write-Host $pluginLine

Write-Host ""
Write-Host "Install complete. Restart Codex, then test with:"
Write-Host '$story plan a web novel'
