# Category: core

**Charter.** The minimum viable engine that the app cannot run without: state container, navigation, app shell, view registry, dashboard/posts/calendar/tags/activity views, global utilities (icons, formatting, sync, toast), and the Drupal behavior that boots everything.

**Belongs here.** State management (`window._scpState`), the view-renderer registry (`window._scpRenderers`), navigation router, the app shell HTML, view-level renderers that ship with the core (dashboard, posts list, calendar, tags, activity), filter/sort helpers, auto-save / sync, toast notifications, the icon set.

**Does not belong here.** Anything specific to the post-editing pipeline (lives in `editing/`). Anything that calls an LLM (lives in `ai/`). Reusable UI primitives that should be shared across categories (will live in `ui/` after refactor).

**Public exports** (window globals; will be tightened during refactor):

- `Drupal.behaviors.scpPart1` — the boot entry point
- `window._scpState` (alias `S`) — the live state object
- `window._scpRenderers` — registry that `editing/` and `ai/` populate

**Current files.** `scp-part1.js` (everything above, monolithic — to be split), `scp-part1.css` (design tokens, shell, views).
