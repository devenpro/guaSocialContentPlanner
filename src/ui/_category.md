# Category: ui

**Charter.** Shared UI primitives that more than one category uses: buttons, badges, the toast system, the icon set, generic form controls, the modal frame. Pure presentation — owns no app state and makes no LLM calls.

**Belongs here.** Anything that would be a reusable component if this were React (`Button`, `Badge`, `IconButton`, `Toast`, `ModalShell`, `TabBar`, `ChipInput`).

**Does not belong here.** Domain logic of any kind. CSS theme tokens (those live in `core/` since the entire shell depends on them).

**Status.** Empty for now. Components will be extracted from `core/scp-part1.js` and `editing/scp-part2a.js` during the incremental refactor described in `docs/dev/improvement-roadmap.md`.
