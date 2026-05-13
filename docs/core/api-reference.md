# SCP API Reference — v1.1

## Part 1 Exports (window._scp*)

### Core

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpState` | `S` (object) | Direct reference to state object |
| `_scpRender` | `()` | Re-render current view |
| `_scpNavigate` | `(viewKey)` | Navigate to a view, updates hash |
| `_scpToast` | `(message, type)` | Show toast notification. Types: 'success', 'error', 'warning', 'info' |
| `_scpGenerateId` | `(prefix)` | Generate unique ID: `prefix_timestamp_random` |
| `_scpBuildMaps` | `()` | Rebuild all lookup maps and counts |
| `_scpSyncToTextarea` | `()` | Write S.data/meta/activity JSON to textarea fields |
| `_scpUpdateSaveStatus` | `(status)` | Update save indicator. Status: 'saving', 'saved', 'synced', 'unsaved' |
| `_scpLogActivity` | `(type, postId, postTitle, description)` | Log activity with user enrichment |

### Formatters

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpFormatDate` | `(isoString)` | Format as "Jan 15, 2025 10:30 AM" |
| `_scpFormatDateShort` | `(isoString)` | Format as "Jan 15" |
| `_scpFormatRelativeTime` | `(isoString)` | Format as "2 hours ago" |
| `_scpFormatNumber` | `(n)` | Format with commas |
| `_scpFormatCharCount` | `(text, limit)` | "123/280" with color coding |

### Utilities

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpEsc` | `(str)` | HTML escape |
| `_scpIcon` | `(name, extraClass)` | Font Awesome Pro icon HTML |
| `_scpTruncate` | `(str, maxLen)` | Truncate with "..." |
| `_scpDeepClone` | `(obj)` | JSON-based deep clone |
| `_scpDebounce` | `(fn, delay)` | Debounce wrapper |
| `_scpIsEmpty` | `(val)` | Check if null/undefined/empty string/empty array |
| `_scpCountWords` | `(text)` | Word count (strips HTML) |
| `_scpCountChars` | `(text)` | Character count (strips HTML) |

### Badges

| Export | Signature | Returns |
|--------|-----------|---------|
| `_scpBadge` | `(text, color)` | Generic colored badge HTML |
| `_scpStatusBadge` | `(statusKey)` | Status badge with icon and color |
| `_scpTypeBadge` | `(typeKey)` | Post type badge |
| `_scpPriorityBadge` | `(priorityKey)` | Priority badge |
| `_scpPlatformBadge` | `(platformKey)` | Platform badge with brand icon |
| `_scpMediaPromptStatusBadge` | `(status)` | "Draft" or "Final" badge |
| `_scpProgressBar` | `(percent, color)` | Progress bar HTML |

### Getters

| Export | Signature | Returns |
|--------|-----------|---------|
| `_scpGetFilteredPosts` | `()` | Posts filtered by current S.postFilter |
| `_scpGetGroupedPosts` | `(groupBy)` | Filtered posts grouped by workflow/status/type/platform/tag/priority |
| `_scpGetAllTags` | `()` | All tags sorted by name |
| `_scpGetTagPosts` | `(tagId)` | Posts with a specific tag |
| `_scpGetUpcomingPosts` | `(n)` | Next n scheduled posts |
| `_scpGetRecentlyPublished` | `(n)` | Last n published posts |
| `_scpGetRecentActivity` | `(n)` | Last n activity entries |
| `_scpResolveTone` | `(id)` | Tone object by ID |
| `_scpResolveAudience` | `(id)` | Audience object by ID |
| `_scpResolveImageStyle` | `(id)` | Image style object by ID |
| `_scpGetPlatformConfig` | `(key)` | Platform settings by key |
| `_scpResolveTag` | `(id)` | Tag object by ID |

### Auto-Status

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpEvaluateAutoStatus` | `(post)` | Evaluate what status a post should be at |
| `_scpMaybeAdvanceStatus` | `(post, reason)` | Advance if evaluated status is higher |

### Images

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpGetImages` | `(filters)` | Get images with optional filters: { star, category, style, tag, search, sort } |
| `_scpGetImageById` | `(fid)` | Get image by file ID |
| `_scpGetAllImageTags` | `()` | Get all unique image tags |
| `_scpParseImageField` | `()` | Re-parse Drupal image field DOM |

### CRUD

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpCreateNewPost` | `(overrides)` | Create post with defaults, returns post object |
| `_scpSavePostField` | `(postId, field, value)` | Update a single post field |

### AI Text Formatting

| Export | Signature | Purpose |
|--------|-----------|---------|
| `_scpCleanAIText` | `(text)` | Strip code fences, escaped newlines, AI preambles |
| `_scpFormatContentForPreview` | `(text)` | Convert newlines to `<br>`, highlight hashtags/mentions |
| `_scpParsePromptSections` | `(text)` | Parse prompt text into `[{label, lines}]` sections |

### Constants

| Export | Contents |
|--------|----------|
| `_scpConstants` | `{ APP_VIEWS, POST_TYPES, PLATFORMS, POST_STATUSES, STATUS_ORDER, ACTIVE_STATUSES, WORKFLOW_GROUPS, GROUPING_OPTIONS, PIPELINE_STEPS, PRIORITY_LEVELS, ACTIVITY_TYPES, CARD_DENSITIES, MEDIA_PROMPT_STATUSES }` |

---

## Part 2A Exports (window._scpPart2A)

| Export | Signature | Purpose |
|--------|-----------|---------|
| `snapshot` | `(label)` | Save undo snapshot |
| `undo` | `()` | Undo last change |
| `redo` | `()` | Redo |
| `openModal` | `(config)` | Open modal dialog |
| `closeModal` | `()` | Close modal |
| `openConfirmDialog` | `(config)` | Open confirmation dialog: `{ title, message, confirmLabel, danger, onConfirm }` |
| `closeConfirmDialog` | `()` | Close confirmation |
| `collectModalFields` | `()` | Collect all `.scp-modal-field` values as object |
| `deletePost` | `(postId)` | Delete with confirmation |
| `duplicatePost` | `(postId)` | Deep clone post |
| `promoteResearchIdea` | `(sessionId, ideaId)` | Create post from research idea |
| `openNewTagModal` | `()` | Open tag creation modal |
| `editTagModal` | `(tagId)` | Open tag edit modal |
| `deleteTag` | `(tagId)` | Delete tag with confirmation |
| `addResearchItem` | `(postId, field, item)` | Add to angles/hooks array |
| `removeResearchItem` | `(postId, field, index)` | Remove from angles/hooks |
| `setPostStatus` | `(postId, status)` | Manually set post status |
| `renderStructuredOutput` | `(data, schemaId, options)` | Render AI output as editable cards |
| `collectStructuredOutputData` | `(outputId)` | Read inline edits from AIO renderer |
| `exportStructuredOutput` | `(data, schemaId, format)` | Export as plaintext/json/markdown/voiceover |
| `OUTPUT_SCHEMAS` | `object` | Schema definitions for image_visual_plan, video_script, carousel_visual_plan |

---

## Part 2B Exports (window._scpPart2B)

### AI Actions

| Export | Signature | Purpose |
|--------|-----------|---------|
| `aiResearchAngles` | `(postId, customInput)` | Generate content angles |
| `aiResearchHooks` | `(postId, customInput)` | Generate hooks |
| `aiWriteContent` | `(postId)` | Write master content body |
| `aiImproveContent` | `(postId)` | Improve existing content |
| `aiSuggestSlides` | `(postId)` | Plan carousel slide themes |
| `aiGenerateScript` | `(postId)` | Generate plain-text script (legacy) |
| `aiGenerateStructuredScript` | `(postId)` | Generate structured Hook/Body/Outro script |
| `aiGenerateMediaPrompt` | `(postId)` | Generate image prompt (legacy) |
| `aiGenerateVisualPlan` | `(postId)` | Message-first visual content planning |
| `buildStructuredPrompt` | `(postId)` | Build prompt from structured config (legacy) |
| `aiAdaptForPlatform` | `(postId, platformKey)` | Adapt content for platform |

### Services

| Export | Signature | Purpose |
|--------|-----------|---------|
| `LLMService` | `object` | Full LLMService reference |
| `BrandService` | `object` | Full BrandService reference |
| `renderInlinePicker` | `(actionId)` | Render AI provider/model picker dropdown |
| `isAIConfigured` | `()` | Check if any AI provider is active |

### LLMService API

| Method | Signature | Purpose |
|--------|-----------|---------|
| `init()` | | Scan DOM for AI config, process providers |
| `isConfigured()` | → boolean | Any active providers? |
| `getActiveProviders()` | → [{id, label, api_key, activeModels}] | All active providers |
| `getActiveModels(providerId)` | → [model] | Models for a provider |
| `getDefault()` | → {provider, model, temperature, max_tokens, top_p, api_key} | Resolved default selection |
| `resolveSelection(actionId)` | → selection | Resolve per-action or default |
| `call(prompt, selection, callbacks, systemPrompt)` | | Make API call to provider |
| `renderInlinePicker(actionId)` | → HTML | Provider/model picker dropdown |
| `savePreference(type, data)` | | Save to S.meta.aiPreferences |
| `getProviderInfo(providerId)` | → {id, label, modelCount} | Provider metadata |
| `rescanConfig()` | | Re-scan DOM for AI config |
| `testProvider(providerId, callback)` | | Test provider with "Hello" prompt |

### BrandService API

| Method | Signature | Purpose |
|--------|-----------|---------|
| `init()` | | Parse brand context divs |
| `isConfigured()` | → boolean | Brand data available? |
| `getSystemPrompt(contextType)` | → string | Build system prompt. contextType: 'social', 'content', 'platform', 'media' |
| `getBrandDesignPrompt()` | → string | Visual identity prompt for media |
| `getCore()` | → object | Brand core data |
| `getSocial()` | → object | Social platform configs |
| `getContent()` | → object | Writing style data |
| `getSeo()` | → object | SEO data |
| `getAudience()` | → object | Audience psychographics |
| `getForbiddenWords()` | → string[] | Words to never use |
| `getDos()` | → string[] | Brand dos |
| `getDonts()` | → string[] | Brand don'ts |
| `autoPopulateBrandDesign()` | | Pre-fill empty brand design fields from core |

### Other Exports

| Export | Signature | Purpose |
|--------|-----------|---------|
| `runQuickResearch` | `(topic)` | Run quick research session |
| `runAdvancedResearch` | `(topic, template)` | Run advanced research |
| `saveAllSettings` | `()` | Save all settings fields |
| `exportJSON` | `()` | Export all data as JSON download |
| `importJSON` | `()` | Import JSON data from file |
| `updateAIStatusIndicator` | `()` | Update header AI status |
| `testAIConnection` | `()` | Test AI with simple prompt |
| `rescanAIConfig` | `()` | Re-scan for AI config |
| `saveImageMeta` | `(fid, field, value)` | Save image metadata |
| `toggleImageStar` | `(fid)` | Toggle star on image |
| `recordImageUsage` | `(fid, postId, context)` | Record image usage |
| `triggerImageUpload` | `()` | Open Drupal image upload |
