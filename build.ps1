# build.ps1 — no-Node fallback build for gua Social Content Planner.
# Concatenates src/ files in load order into dist/scp.js and dist/scp.css.
# Produces unminified output only (use `npm run build` for minified bundles).
#
# Usage:  ./build.ps1

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

# Read version from package.json so the banner stays in sync with the esbuild path.
$pkg = Get-Content -Raw -Path 'package.json' | ConvertFrom-Json
$version = $pkg.version
$banner = "/* gua Social Content Planner v$version | https://github.com/devenpro/guaSocialContentPlanner | built via build.ps1 (concat-only, no minify) */"

# Load order matters: part1 must initialise before part2a polls for it,
# and part2a before part2b. Within ai/, the providers/_registry.js must
# bootstrap window._scpAIProviders before any provider registers; all
# providers should load before llm-service.js so its callAI dispatcher
# can find them; brand-service.js and llm-service.js both load before
# scp-part2b.js because part2b aliases the globals they define.
# If you add new files, append them here in the correct order.
$jsFiles = @(
    'src/core/views/dashboard.js',
    'src/core/views/posts.js',
    'src/core/views/calendar.js',
    'src/core/views/topics.js',
    'src/core/views/activity.js',
    'src/core/scp-part1.js',
    'src/editing/steps/basics.js',
    'src/editing/steps/research.js',
    'src/editing/steps/content.js',
    'src/editing/steps/media.js',
    'src/editing/steps/platforms.js',
    'src/editing/steps/schedule.js',
    'src/editing/scp-part2a.js',
    'src/ai/providers/_registry.js',
    'src/ai/providers/gemini.js',
    'src/ai/providers/claude.js',
    'src/ai/providers/openai.js',
    'src/ai/providers/grok.js',
    'src/ai/providers/groq.js',
    'src/ai/providers/nvidia.js',
    'src/ai/providers/huggingface.js',
    'src/ai/providers/openrouter.js',
    'src/ai/brand-service.js',
    'src/ai/llm-service.js',
    'src/ai/_helpers.js',
    'src/ai/actions/research.js',
    'src/ai/actions/content.js',
    'src/ai/actions/media.js',
    'src/ai/actions/visual.js',
    'src/ai/actions/platform.js',
    'src/ai/scp-part2b.js',
    'src/setup/scp-wizard.js'
)

$cssFiles = @(
    'src/core/scp-part1.css',
    'src/editing/scp-part2.css',
    'src/setup/scp-wizard.css'
)

New-Item -ItemType Directory -Force -Path 'dist' | Out-Null

function Join-FilesWithBanner {
    param(
        [string[]]$Files,
        [string]$OutPath,
        [string]$Banner,
        [string]$Separator
    )
    $parts = New-Object System.Collections.Generic.List[string]
    $parts.Add($Banner) | Out-Null
    foreach ($f in $Files) {
        if (-not (Test-Path $f)) {
            throw "Source file not found: $f"
        }
        $parts.Add($Separator -f $f) | Out-Null
        $parts.Add((Get-Content -Raw -Path $f)) | Out-Null
    }
    $combined = $parts -join "`n"
    # Write as UTF-8 without BOM so browsers and Drupal don't choke.
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($combined)
    [System.IO.File]::WriteAllBytes((Join-Path $repoRoot $OutPath), $bytes)
    $size = [Math]::Round((Get-Item $OutPath).Length / 1KB, 1)
    Write-Host ("[build.ps1] wrote {0} ({1} KB)" -f $OutPath, $size)
}

Join-FilesWithBanner -Files $jsFiles  -OutPath 'dist/scp.js'  -Banner $banner -Separator "`n/* ----- {0} ----- */`n"
Join-FilesWithBanner -Files $cssFiles -OutPath 'dist/scp.css' -Banner $banner -Separator "`n/* ----- {0} ----- */`n"

Write-Host "[build.ps1] done. For minified bundles run: npm install; npm run build"
