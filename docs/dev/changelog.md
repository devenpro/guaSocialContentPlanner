# SCP Changelog

## v1.1 — AI Overhaul + Structured Output Engine (2025)

### Phase 1: Critical Bug Fixes
- **A1** Image deduplication: narrowed selector to `.image-widget` only, added dual dedup by URL + FID
- **A2** AI service detection: 5 fallback sources + 2-second retry for Drupal AJAX timing
- **A3** Default provider + header sync: smart fallback (Gemini 2.5 Flash preferred), `appDefault` persistence
- **B1** Operator precedence fix in priority color rendering
- **B3** Gemini JSON mode: removed `responseMimeType` that broke plain-text responses

### Phase 2: AI Response Formatting
- `cleanAIText()`: strips escaped newlines, code fences, AI preambles
- `formatContentForPreview()`: converts newlines, highlights hashtags/mentions
- Composer preview mode: Edit/Preview tabs with word count
- Structured prompt visualization: media prompts parsed into visual section cards
- AI loading states: spinner + disabled on all 8 AI buttons during calls

### Phase 3: AI Provider Management
- LLMService expanded: `getProviderInfo()`, `rescanConfig()`, `testProvider()`
- Overhauled Settings → AI tab: provider cards with masked keys, individual test buttons
- Header AI quick-switch dropdown: instant provider/model switching
- Per-action override management with "Clear All Overrides"

### Phase 4: UX Polish
- AutoSave shows "Synced" (blue) not "Saved" (green) — distinguishes textarea sync from Drupal save
- `beforeunload` warning for unsaved changes
- Calendar drag-drop: added `snapshot()` for undo + no-op check
- `getRecentlyPublished()`: fixed sort with `localeCompare`
- AI picker placeholder error boundary: per-element try/catch
- Research session delete + rename with confirmation dialogs
- Post search extended: matches title, content body, selected hook, and tag names

### Phase A: AI Output Renderer Engine
- Universal `renderStructuredOutput(data, schemaId, options)` renderer
- 3 schemas: `image_visual_plan`, `video_script`, `carousel_visual_plan`
- Collapsible section cards with color-coded icons and badges
- List mode for arrays (video body), sequence mode for carousels
- Inline editable fields (text, textarea, number) with read-only mode
- 4 export formats: Plain Text, JSON, Markdown, Voiceover-only
- `collectStructuredOutputData()` reads inline edits from DOM
- Full CSS: 41 `scp-aio-*` classes
- Removed ~480 lines of dead duplicate renderer code

### Phase B: Message-First Visual Content Planner
- **renderMediaStep() rewritten**: context strip (hook/angle/content), style reference dropdown, "Plan Visual" button
- **aiGenerateVisualPlan()**: message-first prompt → structured JSON (visual_concept, text_overlays, color_mood, layout, generation_prompt)
- Carousel mode: generates per-slide plans as cohesive narrative flow
- **aiGenerateStructuredScript()**: Hook+Body+Outro JSON with hook analysis
- Legacy backward compatibility for old `media.prompts[]` data
- AIO save callback fully wired: inline edits → post data via path resolution
- Data migration for `visual_plan`, `visual_plans`, `structured_script`

### Phase C: Video Timeline + Image Style + Carousel Linking
- **renderScriptTimeline()**: visual duration bar (Hook red, Body blue, Outro green) with proportional segments
- Image `style` metadata field: added to image objects, detail panel, save function
- Images view style filter: "All Styles" dropdown in filter bar
- Image card/list style badges (palette icon)
- Carousel planner shows green checkmark per slide with visual plan, summary strip with link to Media step

### Phase D: Integration & Cleanup
- Auto-status engine: recognizes `visual_plan` and `visual_plans` as media completion
- New activity types: `visual_plan_created`, `structured_script_created`
- Dashboard "Media Planned" stat card: counts posts with visual plans, scripts, or prompts
- Removed dead `renderStructuredMediaForm()` (~130 lines)
- Removed orphaned event handlers from old structured form (~45 lines)
- Cleaned `saveAllMediaConfig()` and removed dead `saveStructuredField()`

### Size Change
| File | v1.0 | v1.1 | Delta |
|------|------|------|-------|
| scp-part1.js | 2,227 | 2,404 | +177 |
| scp-part2a.js | 1,434 | 1,923 | +489 |
| scp-part2b.js | 2,179 | 3,002 | +823 |
| scp-part2.css | 414 | 1,280 | +866 |
| scp-part1.css | 477 | 478 | +1 |
| **Total** | **6,731** | **9,087** | **+2,356** |

---

## v1.0 — Initial Release

- Core engine with 8 views, 4 post types, 4 platforms
- 6-step pipeline editor
- LLMService with 8 providers (BYOK)
- BrandService with 5 context types
- Research view with quick + advanced modes
- Calendar view with month/week modes + drag-drop
- Images view with grid/list/detail + metadata management
- Tags system with color + description
- Activity logging with user enrichment
- Auto-status engine (forward-only)
- 30-second auto-save
- Settings with 7 tabs (Workspace, Platforms, Tones, Audiences, Image Styles, Brand Design, AI)
- Import/Export JSON
- Quill.js rich text editor
- Font Awesome Pro icons (90+)
