# SCP Architecture — v1.1

## Overview

The Social Content Planner is a Drupal 11 Node-Based Application. It runs entirely in the browser as a jQuery single-page app embedded inside a Drupal node edit form. All data is stored as JSON in Drupal textarea fields.

## System Architecture

```
┌─ Drupal Node Edit Page ──────────────────────────────────────┐
│  ┌─ Hidden Fields ─────────────────────────────────────────┐ │
│  │  field_json_data (textarea)   → S.data                  │ │
│  │  field_json_meta (textarea)   → S.meta                  │ │
│  │  field_activity_log (textarea) → S.activity             │ │
│  │  field_images (image widget)  → S.images[] (DOM scan)   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─ Global Resource Divs ─────────────────────────────────┐ │
│  │  #guau-userdata              → S.user                   │ │
│  │  .brand-data + sub-divs      → S.brand (via BrandSvc)   │ │
│  │  .llm-config-data            → LLMService._config       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─ App UI ────────────────────────────────────────────────┐ │
│  │  #scpApp (injected by Part 1)                           │ │
│  │    ├── .scp-header (logo, nav, AI status, save)         │ │
│  │    ├── .scp-sidebar (8 nav items)                       │ │
│  │    └── .scp-content (view-specific content)             │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Initialization Chain

### Part 1: Core Engine (scp-part1.js)

**Entry point:** `Drupal.behaviors.scpPart1.attach(context)`

**Guards:** `S.initialized`, `S._initializing`, `isScpPage()`, textarea presence.

**Sequence:**
1. `parseUserData()` — reads `#guau-userdata` → `S.user`
2. `detectDrupalForm()` — finds 3 textareas + image field, hides them and Drupal form chrome
3. `loadData()` — parses JSON from textareas → `S.data`, `S.meta`, `S.activity`
4. `parseImageField()` — scans `.image-widget` elements, deduplicates by URL + FID
5. `migrateMeta()` — ensures all settings exist with defaults, reads hash
6. `migrateData()` — ensures all post sub-objects exist
7. `injectQuillCSS()` — loads Quill 2.0.3 stylesheet from CDN
8. `buildMaps()` — creates lookup maps and aggregated counts
9. `renderApp()` — builds app shell HTML, inserts into DOM
10. `setupEventHandlers()` — registers all delegated event handlers
11. `startAutoSave()` — 30-second interval
12. Sets `S.initialized = true`
13. `setTimeout(8s)` — if Part 2B hasn't loaded, marks `_part2bTimeout` and updates placeholders

**Exports:** ~60 functions on `window._scp*` namespace + `window._scpState = S`

### Part 2A: Pipeline Editor (scp-part2a.js)

**Entry:** Polls `setInterval(100ms)` for `window._scpState.initialized`.

**Imports:** S, render, navigate, toast, icon, esc, truncate, deepClone, debounce, formatDate, badges, getters, constants, etc.

**Initializes:**
1. Registers step renderers: `R.stepBasics`, `R.stepResearch`, `R.stepContent`, `R.stepMedia`, `R.stepPlatforms`, `R.stepSchedule`
2. Registers helper renderers: `R.videoDetails`, `R.carouselPlanner`, `R.socialComposer`
3. Sets up undo/redo system (snapshot stack)
4. Sets up modal system, CRUD event handlers
5. Sets up AIO (AI Output Renderer) events
6. Exports `window._scpPart2A`

### Part 2B: AI & Services (scp-part2b.js)

**Entry:** Polls `setInterval(100ms)` for `window._scpPart2A` AND `window._scpState.initialized`.

**Imports:** All Part 1 exports + Part 2A exports (snapshot, openModal, etc.).

**Initializes:**
1. Registers view renderers: `R.researchView`, `R.settingsView`, `R.imagesView`
2. Wires `window._scpAIOSaveField` callback for inline edit saving
3. Sets up Part 2B event handlers + keyboard shortcuts
4. `LLMService.init()` — scans for AI config (5 sources + 2s retry)
5. `BrandService.init()` — parses brand context divs
6. `BrandService.autoPopulateBrandDesign()` — pre-fills brand design from core
7. Replaces AI picker loading placeholders
8. `updateAIStatusIndicator()` — shows active provider in header
9. Calls `render()` to re-render with AI-aware components

## State Management

### Single Source of Truth

All state lives in `var S = { ... }` inside Part 1's IIFE. Parts 2A and 2B get a reference via `window._scpState`.

### Persisted State (JSON in Drupal fields)

| State Key | Field | Contents |
|-----------|-------|----------|
| `S.data` | `field_json_data` | Posts array, research sessions, tags |
| `S.meta` | `field_json_meta` | Workspace, settings, AI prefs, image metadata |
| `S.activity` | `field_activity_log` | Activity log entries |

### Runtime State (not persisted)

Lookup maps (`postMap`, `tagMap`, etc.), aggregated counts, UI state (current view, selected post, filters), Drupal form references.

### Save Flow

```
User edits → update S.data/S.meta → snapshot() → buildMaps()
  → render() → syncToTextarea() → toast()

syncToTextarea():
  S.$textarea.val(JSON.stringify(S.data))
  S.$metaTextarea.val(JSON.stringify(S.meta))
  S.$activityTextarea.val(JSON.stringify(S.activity))
  S.dirty = true

AutoSave (30s): if S.dirty → syncToTextarea() → show "Synced" (blue, not "Saved")
Save button: syncToTextarea() → show "Saving..." → S.$submitBtn.click() → Drupal saves to DB
beforeunload: warns if S.dirty
```

## Registry Pattern

Views and step renderers use a registry pattern via `window._scpRenderers`:

```javascript
// Part 1 defines placeholder views
// Part 2A registers: R.stepBasics, R.stepResearch, R.stepContent, R.stepMedia, R.stepPlatforms, R.stepSchedule
// Part 2B registers: R.researchView, R.settingsView, R.imagesView

// Part 1 calls renderers:
var R = window._scpRenderers;
if (R.researchView) html = R.researchView();
else html = '<div class="scp-loading">Loading research module...</div>';
```

## Global Resources Architecture

### AI Configuration (LLMService)

**Config source cascade (5 sources):**
1. `.llm-brand-config-data` — brand-level config (highest priority)
2. `.llm-config-data` — user-level config
3. `[data-llm-config]` — data attribute on any element
4. `<script type="application/json">` — containing `providers` array
5. Alternate wrapper divs (`#guau-userdata .llm-config-data`, etc.)

**Provider resolution priority:**
1. User's explicit app default (`S.meta.aiPreferences.appDefault`)
2. Config-level default (`_config.default_provider/model`)
3. Smart fallback: Gemini 2.5 Flash → Gemini 2.0 Flash → any Flash → first provider
4. First provider's default model

**Per-action overrides:** `S.meta.aiPreferences.perAction[actionId]` stores provider/model per AI action.

**Hash navigation issue:** When navigating via hash URL, Drupal AJAX may not have rendered AI config divs. Handled by 2-second `setTimeout` retry + manual Re-scan button in Settings.

### Brand Context (BrandService)

**Context div mapping:**
| Div | Parsed Into | Contains |
|-----|------------|----------|
| `.brand-core-data` | `S.brand.core` | brand_name, tagline, audience, voice, dos, donts, forbidden_words |
| `.brand-video-data` | `S.brand.video` | content_pillars, video_tone, cta_patterns |
| `.brand-content-data` | `S.brand.content` | writing_style, sentence_rules, cta_style |
| `.brand-seo-data` | `S.brand.seo` | keyword_clusters, content_gaps, niche, markets |
| `.brand-social-data` | `S.brand.social` | Per-platform tone, posting guidelines |

**Brand injection into AI:** `BrandService.getSystemPrompt(contextType)` builds a multi-line system prompt. `brandSnippet(type)` appends inline brand context to user prompts. Both are passed to `callAIWithRetry()`.

### User Information

Parsed from `#guau-userdata` into `S.user = { id, name, email, fullName, timezone, roles }`. Used for activity log enrichment and timezone defaults.

## AI Output Renderer Engine

Universal structured output system (Section 12.5 of Part 2A).

**3 Schemas:** `image_visual_plan`, `video_script`, `carousel_visual_plan`

**Flow:**
```
AI returns JSON → renderStructuredOutput(data, schemaId, options)
  → Renders collapsible section cards with inline editable fields
  → User edits fields → blur → _scpAIOSaveField callback → saves to post data
  → Export toolbar: Plain Text / JSON / Markdown / Voiceover-only
```

**Rendering modes:**
- **Standard**: Object sections (used by `image_visual_plan`)
- **List**: Array sections with expandable items (used by `video_script.body`)
- **Sequence**: Array of items, each rendered with full schema (used by `carousel_visual_plan`)

## Auto-Status Engine

Posts automatically advance through statuses based on content completion:

```
idea → research (when angles or hooks exist)
research → content_writing (when selected_hook or selected_angle)
content_writing → media_prompts (when content body exists, for non-text)
content_writing → platform_adapt (for text posts, skip media)
media_prompts → platform_adapt (when visual_plan, visual_plans, or finalized prompts exist)
platform_adapt → ready (when any platform has adapted content)
ready → scheduled (when schedule.date is set)
```

**Never regresses.** Only advances. Called via `maybeAdvanceStatus(post, reason)`.
