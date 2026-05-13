# Documentation

Documentation is organised by the same feature categories as `src/`.

## Core

- [Architecture overview](core/architecture.md) — how Parts 1 / 2A / 2B fit together, registry pattern, load order, Drupal integration points.
- [Data model](core/data-model.md) — JSON schemas for `field_json_data`, `field_json_meta`, `field_activity_log`.
- [API reference](core/api-reference.md) — global `window._scp*` functions exposed by the core engine.
- [Quick reference](core/quick-reference.md) — cheat-sheet of common operations.

## Editing

- [Style reference](editing/style-reference.md) — CSS variable conventions, component class names, modal patterns.

## AI

- [System prompt](ai/system-prompt.md) — the master prompt used for AI actions, with placeholder semantics and structured-output schema.

## Dev

- [Development guide](dev/development-guide.md) — how to extend the app: add a view, add a step, add an AI provider.
- [Troubleshooting](dev/troubleshooting.md) — known issues, debug tips, common gotchas.
- [Improvement roadmap](dev/improvement-roadmap.md) — planned features and refactors.
- [Changelog](dev/changelog.md) — version history.

## Samples

- [data.json](samples/data.json), [meta.json](samples/meta.json), [activity.json](samples/activity.json) — example payloads matching the current schema.
