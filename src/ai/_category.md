# Category: ai

**Charter.** All LLM-facing code: provider abstraction, prompt assembly, structured-output parsing, brand-context detection, AI-driven actions (research, write, improve, media prompts, platform adaptation), the global research workspace, and the AI settings view. Depends on `core` and `editing`; nothing in those categories depends back on `ai`.

**Belongs here.** `LLMService` (provider selection + request normalisation for Gemini, Claude, OpenAI, Grok, Groq, NVIDIA, HuggingFace, OpenRouter), `BrandService` (reads brand JSON from Drupal divs with AJAX-timing retry), prompt templates, structured-output schemas, AI action functions, the settings view's six tabs, import/export of AI configuration.

**Does not belong here.** UI components that are not AI-specific (`editing/` or `ui/`). Drupal form glue (`drupal/` after extraction). State or routing (`core/`).

**Public exports.**

- `window.LLMService` — provider-agnostic chat/completion API
- `window.BrandService` — brand context lookup
- AI action functions registered onto `window._scpRenderers` for the pipeline's "AI assist" buttons

**Current files.** `scp-part2b.js` (monolithic — to be split into `llm-service.js`, `brand-service.js`, `providers/*.js`, `actions/*.js`, `settings-view.js`, `research-workspace.js`).
