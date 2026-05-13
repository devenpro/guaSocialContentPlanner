# SCP Quick Reference — v1.1

## Drupal Configuration

| Setting | Value |
|---------|-------|
| Content type | `social_content_planner` |
| Body class | `node--type-social-content-planner` |
| Asset Injector | 2 CSS files, 3 JS files, all injected on this content type |

## Field Selectors

```javascript
$('#edit-field-json-data-0-value')    // S.data
$('#edit-field-json-meta-0-value')    // S.meta
$('#edit-field-activity-log-0-value') // S.activity
$('.field--name-field-images')        // S.images (DOM scan)
```

## Global Resource Access

```javascript
// USER
S.user.id          // "123"
S.user.name        // "admin"
S.user.fullName    // "John Doe"
S.user.timezone    // "Asia/Kolkata"

// AI — check + use
LLMService.isConfigured()                    // → boolean
LLMService.getDefault()                      // → { provider, model, api_key, ... }
LLMService.resolveSelection('ai-write-content') // → resolved selection
callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt)

// BRAND
BrandService.isConfigured()                  // → boolean
BrandService.getCore()                       // → { brand_name, tagline, voice, ... }
BrandService.getSystemPrompt('social')       // → full system prompt string
BrandService.getBrandDesignPrompt()          // → visual identity string
brandSnippet('content')                      // → brand context for user prompt
```

## File Sizes (v1.1)

| File | Lines |
|------|-------|
| scp-part1.css | 478 |
| scp-part2.css | 1,280 |
| scp-part1.js | 2,404 |
| scp-part2a.js | 1,923 |
| scp-part2b.js | 3,002 |
| **Total** | **9,087** |

## Views (8)

Dashboard, Research, Posts, Calendar, Images, Tags, Activity, Settings

## Pipeline Steps (6)

Basics → Research → Content → Media → Platforms → Schedule

## Status Flow (9)

idea → research → content_writing → media_prompts → platform_adapt → ready → scheduled → published → archived

## Post Types (4)

image (#1a73e8), carousel (#7c3aed), video (#d93025), text (#0d904f)

## Platforms (4)

LinkedIn (#0077b5), Instagram (#e4405f), Facebook (#1877f2), YouTube (#ff0000)

## AI Actions (11)

| Action ID | Function | Purpose |
|-----------|----------|---------|
| ai-research-angles | aiResearchAngles | Generate content angles |
| ai-research-hooks | aiResearchHooks | Generate hooks |
| ai-write-content | aiWriteContent | Write master content |
| ai-improve-content | aiImproveContent | Improve content |
| ai-plan-slides | aiSuggestSlides | Plan carousel slides |
| ai-generate-script | aiGenerateStructuredScript | Structured video script |
| ai-generate-media | aiGenerateMediaPrompt | Legacy image prompt |
| ai-generate-visual-plan | aiGenerateVisualPlan | Message-first visual plan |
| ai-adapt-platform | aiAdaptForPlatform | Platform adaptation |
| (research) | runQuickResearch | Quick topic research |
| (research) | runAdvancedResearch | Template-based research |

## Key Patterns

```javascript
// State change flow
update S.data → snapshot('label') → buildMaps() → render() → syncToTextarea() → toast()

// Event delegation
$(document).off('click.scp-ns', '[data-action="verb"]')
           .on('click.scp-ns', '[data-action="verb"]', handler);

// Null-safe access
var val = (S.meta && S.meta.settings && S.meta.settings.platforms) || {};

// Activity logging
logActivity('post_updated', post.id, post.title, 'Changed priority to high');

// Auto-status (never regresses)
maybeAdvanceStatus(post, 'content body written');

// AI Output Renderer
renderStructuredOutput(data, 'image_visual_plan', { outputId: 'vp_' + id, postId: id });
```

## CSS Convention

```css
/* Always use scp- prefix */
.scp-my-component { }

/* Always use CSS variables */
color: var(--scp-primary);
background: var(--scp-bg-secondary);
border: 1px solid var(--scp-border-light);
border-radius: var(--scp-radius-md);
padding: var(--scp-space-3);
```
