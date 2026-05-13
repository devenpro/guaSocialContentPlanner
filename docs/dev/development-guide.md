# SCP Development Guide — v1.1

## Using Global Resources

### Making AI Calls

```javascript
// 1. Check if AI is configured
if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }

// 2. Show loading state
var done = aiActionLoading('my-action-id');

// 3. Build prompt with brand context
var prompt = 'Your prompt here...\n';
prompt += brandSnippet('content'); // Appends brand voice, audience, forbidden words

// 4. Call AI with retry
callAIWithRetry(prompt, function(text) {
  done(); // Clear loading
  var parsed = parseJSON(text); // Safe JSON parse with fallbacks
  // Use parsed result...
  snapshot('AI action label');
  buildMaps(); render(); syncToTextarea();
  toast('Done!', 'success');
}, function(err) {
  done();
  toast('AI Error: ' + err, 'error');
}, 'my-action-id', BrandService.getSystemPrompt('content'));
```

### Accessing Brand Context

```javascript
// Check if brand is configured
if (BrandService.isConfigured()) {
  var core = BrandService.getCore();     // { brand_name, tagline, audience, voice, dos, donts }
  var social = BrandService.getSocial(); // Per-platform social config
  var words = BrandService.getForbiddenWords(); // string[]

  // Build system prompt for AI
  var sysPrompt = BrandService.getSystemPrompt('social'); // Full brand context string

  // Get brand design for visual prompts
  var visualPrompt = BrandService.getBrandDesignPrompt(); // Colors, typography, style
}
```

### Getting User Info

```javascript
var user = S.user;
// user.id, user.name, user.email, user.fullName, user.timezone, user.roles
```

## Common Patterns

### Adding a New Post Field

1. **Data model** — Add to `migrateData()` in Part 1 with default value
2. **Step renderer** — Add input/display in the appropriate step renderer (Part 2A)
3. **Save handler** — Add blur/change event handler in Part 2A events section
4. **Activity log** — Call `logActivity()` when the field changes significantly

### Adding a New AI Action

1. **Part 2B** — Create `function aiMyAction(postId)` following the pattern above
2. **Part 2B exports** — Add to `window._scpPart2B` object
3. **Part 2A** — Add button with `data-action="ai-my-action"` in the step renderer
4. **Part 2A events** — Add to `aiActions` array and `fnMap` in event handlers
5. **AI picker** — Add `window._scpAiSel('ai-my-action')` next to the button

### Adding a New View

1. **Part 1** — Add to `APP_VIEWS` constant
2. **Part 1** — Add rendering case in `renderCurrentView()` with registry fallback
3. **Part 2B** — Create `function renderMyView()` and register as `R.myView`
4. **Part 2B** — Create `function setupMyEvents()` and register
5. **CSS** — Add view-specific styles

### Adding a New Pipeline Step

1. **Part 1** — Add to `PIPELINE_STEPS` constant
2. **Part 2A** — Create `function renderMyStep(post)` and register as `R.stepMyStep`
3. **Part 2A** — Add event handlers for the step's controls
4. **Part 1** — Update auto-status engine if the step affects status progression

### Using the AI Output Renderer

```javascript
// Render structured data as editable cards
var html = renderStructuredOutput(data, 'image_visual_plan', {
  outputId: 'vp_' + post.id,
  postId: post.id,
  title: 'Visual Content Plan',
  editable: true  // default true, set false for read-only
});

// Collect inline edits back from DOM
var editedData = collectStructuredOutputData('vp_' + post.id);

// Export in different formats
var text = exportStructuredOutput(data, 'image_visual_plan', 'plaintext');
var md = exportStructuredOutput(data, 'video_script', 'markdown');
var vo = exportStructuredOutput(data, 'video_script', 'voiceover');
```

## Coding Checklist

### Before Writing Code
- [ ] Read the relevant source file sections (never assume from memory)
- [ ] Identify which files need changes
- [ ] Plan the change: data model → renderer → events → activity log

### While Writing Code
- [ ] Use `scp-` prefix for all CSS classes
- [ ] Use CSS variables, never hardcode colors
- [ ] Use event delegation with namespace: `$(document).off('event.ns').on('event.ns', ...)`
- [ ] Null-safe all nested property access
- [ ] Call `syncToTextarea()` after every data change
- [ ] Call `snapshot('label')` before destructive changes (for undo)
- [ ] Call `logActivity()` for significant user actions
- [ ] Call `maybeAdvanceStatus(post, reason)` when content completion changes

### After Writing Code
- [ ] Validate all JS: `node -c scp-part1.js && node -c scp-part2a.js && node -c scp-part2b.js`
- [ ] Check for `scp-` prefix on all new CSS classes
- [ ] Check no hardcoded colors (grep for `#[0-9a-f]{3,6}` in CSS)
- [ ] Verify no cross-app prefix leaks
- [ ] Test the save flow: edit → auto-save shows "Synced" → manual save triggers Drupal submit

## File Section Maps

### scp-part1.js (2,404 lines)
```
 S1: Constants (12 objects)           lines 38-151
 S2: State object                     lines 153-196
 S3: Initialization                   lines 198-571
 S4: Map builders                     lines 574-645
 S5: Navigation                       lines 645-660
 S6: Utilities (icons, badges, etc.)  lines 662-860
 S7: App shell                        lines 862-970
 S8: Dashboard view                   lines 972-1090
 S9: Posts view                       lines 1092-1240
S10: Calendar view                    lines 1242-1710
S11: Tags view                        lines 1712-1815
S12: Activity view                    lines 1817-1870
S13: Placeholder views                lines 1872-1920
S14: Post filtering & sorting         lines 1922-1970
S15: Event handlers                   lines 1972-2100
S16: CRUD helpers                     lines 2102-2160
S17: Sync & save                      lines 2162-2220
S18: Toast & auto-status engine       lines 2222-2316
S19: API exports                      lines 2318-2404
```

### scp-part2a.js (1,923 lines)
```
 S1: Init & imports                   lines 1-60
 S2: Undo/redo                        lines 62-130
 S3: Modal system                     lines 132-260
 S4: Pipeline editor shell            lines 262-340
 S5: Step 1 — Basics                  lines 342-400
 S6: Step 2 — Research                lines 402-480
 S7: Step 3 — Content                 lines 482-575
 S8: Step 4 — Media (visual planner)  lines 577-750
 S9: Step 5 — Platforms               lines 752-870
S10: Step 6 — Schedule                lines 872-940
S11: Social composer                  lines 942-1010
S12: Tag input component              lines 1012-1020
S12.5: AI Output Renderer engine      lines 1022-1570
S13: Event handlers                   lines 1572-1800
S14: CRUD & save helpers              lines 1802-1900
S15: Exports                          lines 1900-1923
```

### scp-part2b.js (3,002 lines)
```
 S1: Init & imports                   lines 1-188
 S2: LLMService                       lines 190-545
 S3: BrandService                     lines 549-692
 S4: AI response parsing              lines 694-724
 S5: Brand prompt helpers             lines 726-765
 S6: AI call infrastructure           lines 767-816
 S7: AI actions — Research            lines 818-865
 S8: AI actions — Content             lines 867-925
 S8.5: AI actions — Visual Plan/Script lines 927-1190
 S9: AI actions — Platform            lines 1192-1430
S10: AI actions — Media Prompt (legacy) lines 1430-1550
S11: Research view                    lines 1552-1720
S12: Settings view (7 tabs)           lines 1722-2020
S13: Images view                      lines 2022-2460
S14: Image management                 lines 2462-2580
S15: Part 2B events                   lines 2582-2790
S16: Keyboard shortcuts               lines 2792-2840
S17: Settings save/import/export      lines 2842-2950
S18: Exports                          lines 2952-3002
```
