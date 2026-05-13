# Category: editing

**Charter.** Everything the user touches when editing a single post: the 6-step pipeline UI, modal lifecycle, CRUD handlers, undo/redo, the social-media composer, tag inputs, inline editors. Depends on `core` (reads state, registers renderers); knows nothing about LLMs.

**Belongs here.** Modal open/close, step renderers (Basics, Research, Content, Media, Platforms, Schedule), social composer (character counts, platform limits), tag chip input, inline field editors, the snapshot-based undo/redo stack, CRUD event wiring (create / edit / delete / duplicate post).

**Does not belong here.** LLM calls or prompt building (`ai/`). Top-level navigation between views (`core/`). The auto-save loop (`core/`).

**Public exports.**

- Step renderers registered onto `window._scpRenderers`
- `window._scpSnapshot()`, `window._scpUndo()`, `window._scpRedo()`
- `window._scpOpenModal()`, `window._scpCloseModal()`

**Current files.** `scp-part2a.js` (monolithic — to be split into `modals.js`, `undo-redo.js`, `steps/*.js`, `composer.js`), `scp-part2.css`.
