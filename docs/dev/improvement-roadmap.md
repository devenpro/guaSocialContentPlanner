# SCP Improvement Roadmap — v1.1

## Completed (v1.1)

- ✅ AI Output Renderer engine (universal structured JSON → visual cards)
- ✅ Message-first visual content planner
- ✅ Structured video scripts (Hook + Body + Outro)
- ✅ Script duration timeline visualization
- ✅ Image style metadata and filtering
- ✅ Carousel ↔ visual plan cross-linking
- ✅ AI provider management overhaul (cards, test, quick-switch)
- ✅ Image deduplication fix
- ✅ Extended post search (body, hooks, tags)
- ✅ Research session delete + rename
- ✅ Save/sync status distinction
- ✅ Calendar drag-drop undo support

## Priority: High

### Content Preview & Collaboration
- Post preview mode showing content as it would appear on each platform
- Internal commenting/review system per post
- Post assignment workflow (assign_to → review → approve)
- Version history for content body (diff view)

### Analytics & Performance
- Post performance tracking: link published URLs to engagement metrics
- Best-performing content analysis (by type, platform, tone, audience)
- Suggested posting times based on historical performance
- Content calendar heatmap (posting frequency visualization)

### Bulk Operations
- Multi-select posts for bulk status change, tag assignment, platform toggle
- Bulk AI operations (generate content for all "idea" posts)
- Bulk schedule: drag-select date range and auto-distribute posts

## Priority: Medium

### AI Enhancements
- AI content scoring (rate content quality before publishing)
- AI-powered hashtag research per platform
- SEO optimization suggestions using brand SEO data
- Content repurposing: convert one post type to another (video → carousel)
- AI revision history: show before/after for each AI edit
- Multi-language content generation

### Media & Visual
- AI image generation integration (DALL-E, Midjourney API)
- Visual plan → actual image generation pipeline
- Video storyboard visualization from structured script
- Reference image auto-tagging via AI vision
- Drag-drop image ordering for carousels

### Calendar & Scheduling
- Calendar conflict detection (too many posts on same day/platform)
- Recurring post templates (weekly series)
- Time slot suggestions based on platform best practices
- Multi-timezone scheduling view

## Priority: Low

### Data & Integration
- Google Sheets export for content calendar
- WordPress/CMS publishing integration
- Social media API integration for direct publishing
- Content template library (reusable post structures)
- Team analytics dashboard

### UX Polish
- Dark mode support
- Customizable dashboard widgets
- Drag-drop pipeline columns (kanban board alternative)
- Global search across all views
- Mobile-optimized touch interactions
- Onboarding tour for new users

## Technical Debt

- Consider migrating social composers to use Quill.js consistently
- Evaluate if `media.prompts[]` (legacy) can be fully deprecated in favor of `visual_plan`
- Performance audit for posts view with 200+ posts
- Consider WebSocket/SSE for real-time collaboration
- Evaluate lazy loading for images view with 50+ reference images
