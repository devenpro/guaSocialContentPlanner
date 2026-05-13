# Category: setup

**Charter.** First-run setup wizard. A modal flow that captures brand
basics, generates topic and series scaffolding via AI, picks a tone, and
seeds an initial batch of planned posts so a new workspace starts with
content already in the pipeline.

**Belongs here.** The wizard shell, individual step renderers, validation,
and the boot trigger that opens the wizard when `S.meta.setup.firstRun`
is true.

**Does not belong here.** Long-term settings UI (Settings view lives in
`ai/scp-part2b.js`). LLM provider plumbing (that's `ai/`). The data shape
the wizard writes into — that's owned by `core/` (state) and is the same
shape used everywhere else.

**Public exports** (window globals; tightening will come with the broader
window-globals cleanup):

- `window._scpWizard` — `{ openWizard, closeWizard, openIfFirstRun,
  goToStep, nextStep, prevStep, skipSetup, finishSetup, TOTAL_STEPS,
  stepMeta }`
- `window._scpRegisterWizardStep(stepNumber, renderFn, validatorFn?)` —
  later step renderers self-register through this so the shell stays
  decoupled from the step content.

**Current files.** `scp-wizard.js`, `scp-wizard.css`.

**Phase rollout.**

- Phase 1 — wizard shell + Step 1 (brand basics).
- Phase 2 — Step 2 (AI topic suggestions), Step 3 (series grouping),
  Step 4 (tone picker), Step 5 (review + seed planned posts).
- Later phases polish copy and add the Settings "re-run setup" entry.
