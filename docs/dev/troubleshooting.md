# SCP Troubleshooting — v1.1

## AI Not Loading / "No AI providers configured"

**Symptom:** AI buttons show "Not configured", header shows no provider.

**Root cause:** LLMService couldn't find the AI config div on the page.

**Diagnostic steps:**
1. Open browser console, look for `[SCP] LLMService:` messages
2. Check if `LLMService: No config found on initial scan` appears
3. Check if retry message appears 2 seconds later

**Fixes:**
1. **Refresh the page** — the AI config div may not have loaded due to Drupal AJAX timing (especially with hash URLs)
2. **Click Re-scan** in Settings → AI tab — calls `LLMService.rescanConfig()`
3. **Check Drupal config** — ensure the `.llm-config-data` or `.llm-brand-config-data` div is rendered on the page. Verify in page source (View Source, search for "llm-config" or "llm-brand-config")
4. **Check provider activation** — the config JSON must have `"active": true` on both the provider and at least one model

**Hash navigation issue:** Navigating directly to `node/123#research` may load the page before Drupal AJAX renders the config div. The 2-second retry handles most cases, but if it still fails, refresh.

## Image Deduplication / Images Appearing Multiple Times

**Symptom:** Same image appears 2-3 times in the Images view.

**Root cause (fixed in v1.1):** The old selector `[data-drupal-selector*="edit-field-images"]` matched both parent wrappers and child elements in Drupal's nested markup.

**Current behavior:** `parseImageField()` uses `.image-widget` selector (narrower match) + dual deduplication by normalized URL and FID. If duplicates still appear:
1. Check if `.image-widget` matches correctly for your Drupal theme
2. Look at console for `[SCP] Parsed X reference images (deduped)` count
3. If count is wrong, check the fallback selectors in `parseImageField()`

## Init Chain Race Conditions

**Symptom:** Part 2A or 2B features don't work, console shows errors about missing functions.

**Pattern:** Part 2B tries to call Part 2A functions before Part 2A has initialized.

**Diagnostic:** Check console for initialization order:
```
[SCP] Initializing Part 1...
[SCP] Part 1 initialized
[SCP] Part 2A loaded
[SCP] Part 2B initialized — renderers: research, settings, images
```

If Part 2B appears before Part 2A, there's a loading order issue.

**Fix:** The polling mechanism (100ms intervals) should handle this. If it fails:
1. Check that Part 1 sets `S.initialized = true`
2. Check that Part 2A exports `window._scpPart2A` inside its init function
3. Check that Part 2B checks for both `window._scpPart2A` AND `window._scpState.initialized`

## Save Flow Issues

**Symptom:** Changes not persisting after Drupal save, or "Unsaved changes" warning on every page load.

**Diagnostic:**
1. Check that `syncToTextarea()` is called after every data change
2. Check that `S.dirty` is being set properly
3. Check console for JSON serialization errors
4. Verify textarea values: `$('#edit-field-json-data-0-value').val()` should contain valid JSON

**Common causes:**
- Missing `syncToTextarea()` call after a data update
- Circular reference in state (breaks `JSON.stringify`)
- Drupal form validation errors preventing save

## AI Response Parsing Failures

**Symptom:** "Could not parse AI response as JSON" error.

**Root cause:** LLM returned malformed JSON, or response includes markdown code fences, preamble text, or trailing commas.

**Handled by:** `parseJSON(text)` in Part 2B tries 6 parsing strategies:
1. Direct `JSON.parse(text)`
2. Strip code fences and retry
3. Extract first `{...}` block
4. Extract first `[...]` block
5. Strip trailing commas and retry
6. Throw if all fail

**If failures persist:** Check the LLM prompt — ensure it ends with "Respond ONLY as JSON" and includes a format example.

## Auto-Status Not Advancing

**Symptom:** Post stays at "idea" even after content is written.

**Check these conditions:**
- `idea → research`: requires `research.angles.length > 0` or `research.hooks.length > 0`
- `research → content_writing`: requires `research.selected_hook` or `research.selected_angle`
- `content_writing → media_prompts`: requires `content.body` (non-text posts only)
- `media_prompts → platform_adapt`: requires `visual_plan.visual_concept.scene`, OR `visual_plans.length > 0`, OR a prompt with status "final"
- `platform_adapt → ready`: requires at least one platform with `enabled && body`
- `ready → scheduled`: requires `schedule.date`

**Key rule:** Auto-status only advances, never regresses. If a post is manually set to "ready" and content is later deleted, it stays at "ready".

## Brand Context Not Injected

**Symptom:** AI outputs don't reflect brand voice/colors.

**Check:**
1. Console: `[SCP] BrandService: BrandName, contexts: core, content, social`
2. If "none" appears, the `.brand-data` div isn't on the page
3. Verify individual context divs exist: `.brand-core-data`, `.brand-content-data`, etc.
4. Check that each div contains valid JSON text content

## Performance Issues with Large Post Sets

**Symptom:** Slow rendering with 100+ posts.

**Mitigations:**
- Posts view uses grouped rendering — only visible groups render
- Calendar view only renders current month/week
- Consider archiving old published posts
- Auto-save interval is 30 seconds (not on every keystroke)

## Keyboard Shortcuts Not Working

| Shortcut | Action | Requires |
|----------|--------|----------|
| Ctrl+Z | Undo | Post selected in pipeline editor |
| Ctrl+Shift+Z | Redo | Post selected |
| Ctrl+S | Save | Any view |

**If not working:** Check that Part 2B's `setupKeyboardShortcuts()` ran (look for console messages). Keyboard events only fire when focus is inside the SCP app area.
