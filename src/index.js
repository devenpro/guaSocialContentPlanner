/**
 * @entry    src/index.js
 * @purpose  Single-bundle entry. Imports every source file in strict load
 *           order so the esbuild bundle (dist/scp.js) contains the same
 *           contents as the build.ps1 concat-fallback.
 *
 * Order is load-bearing. Each file is a self-contained IIFE that either:
 *   (a) registers a global on `window` for later modules to read, or
 *   (b) reads a `window` global at module-load time.
 * If a producer ships after its consumer, the consumer's module-scope
 * read sees `undefined` and breaks the rest of init.
 *
 * Section ordering mirrors build.ps1 line-for-line:
 *   1. core views          — define window._scpRender* before scp-part1
 *   2. core engine         — scp-part1 reads those view fns at module load
 *   3. editing steps       — register into window._scpRenderers
 *   4. editing controller  — scp-part2a, polls for core
 *   5. AI providers        — _registry.js first; providers self-register
 *   6. AI services         — LLMService, BrandService, _scpAIHelpers
 *   7. AI actions          — register into window._scpAIActions
 *   8. AI controller       — scp-part2b reads LLMService/BrandService at load
 *   9. setup wizard        — depends on everything above
 */

// 1. Core views.
import './core/views/dashboard.js';
import './core/views/posts.js';
import './core/views/calendar.js';
import './core/views/topics.js';
import './core/views/series.js';
import './core/views/activity.js';

// 2. Core engine.
import './core/scp-part1.js';

// 3. Editing pipeline step renderers.
import './editing/steps/basics.js';
import './editing/steps/research.js';
import './editing/steps/content.js';
import './editing/steps/media.js';
import './editing/steps/platforms.js';
import './editing/steps/schedule.js';

// 4. Editing controller.
import './editing/scp-part2a.js';

// 5. AI providers — registry first.
import './ai/providers/_registry.js';
import './ai/providers/gemini.js';
import './ai/providers/claude.js';
import './ai/providers/openai.js';
import './ai/providers/grok.js';
import './ai/providers/groq.js';
import './ai/providers/nvidia.js';
import './ai/providers/huggingface.js';
import './ai/providers/openrouter.js';

// 6. AI services & helpers — must precede scp-part2b's module-load reads.
import './ai/brand-service.js';
import './ai/llm-service.js';
import './ai/_helpers.js';

// 7. AI actions.
import './ai/actions/research.js';
import './ai/actions/content.js';
import './ai/actions/media.js';
import './ai/actions/visual.js';
import './ai/actions/platform.js';

// 8. AI controller.
import './ai/scp-part2b.js';

// 9. Setup wizard.
import './setup/scp-wizard.js';
import './setup/scp-wizard-steps.js';
