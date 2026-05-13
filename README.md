# gua Social Content Planner

A Drupal-embedded social media content planner. Loads inside a Drupal node-edit form (content type `social_content_planner`), reads/writes three JSON textareas (`field_json_data`, `field_json_meta`, `field_activity_log`), and exposes a full planner UI with multi-provider AI assistance.

## Use in Drupal (Asset Injector)

This is a public repository, so the built assets are served by [jsDelivr CDN](https://www.jsdelivr.com/) directly from GitHub tags. No build step needed on the Drupal side — just paste these URLs into the [Asset Injector](https://www.drupal.org/project/asset_injector) module.

**JS Injector** (one entry):

```
https://cdn.jsdelivr.net/gh/devenpro/guaSocialContentPlanner@v0.1.0/dist/scp.min.js
```

**CSS Injector** (one entry):

```
https://cdn.jsdelivr.net/gh/devenpro/guaSocialContentPlanner@v0.1.0/dist/scp.min.css
```

**Quill stylesheet** (third-party dependency for rich-text editor, also one CSS Injector entry):

```
https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css
```

Asset Injector settings for all three:

- **Page paths:** `/node/add/social_content_planner` and `/node/*/edit` (or whatever matches your bundle).
- **Preprocess:** OFF (jsDelivr already minifies and gzips).
- **Condition:** Restrict to the `social_content_planner` content type if your Asset Injector version supports it. The JS also self-guards via the body class `node--type-social-content-planner`.

To roll out a new version, push a new Git tag (see "Release" below) and bump the `@v0.1.0` segment of each URL.

## Repository layout

```
src/          — source modules, organised by feature category
  core/         core app feature: state, navigation, app shell, views, utilities
  editing/      editing feature: post pipeline UI, modals, CRUD, undo/redo, composer
  ai/           AI feature: LLM providers, prompt generation, structured output, brand context
  ui/           shared UI primitives (currently empty — reserved for refactor)
  drupal/       Drupal-specific glue (currently empty — reserved for refactor)
  index.js      bundle entry, imports the three category bundles in load order
  index.css     bundle entry for CSS

dist/         — built single-file bundles (committed to repo, served by jsDelivr)
  scp.js        unminified, with sourcemap, for debugging
  scp.css       unminified
  scp.min.js    minified, production
  scp.min.css   minified, production

docs/         — documentation, mirrors src/ categories
  core/, editing/, ai/, dev/, samples/

build.mjs     — esbuild driver (preferred, requires Node.js)
build.ps1     — no-Node PowerShell fallback (concatenation only, no minification)
```

Each `src/<category>/_category.md` defines what belongs in that category and what does not. Read those first before adding a new module.

## Develop locally

### Option A — esbuild (preferred, requires Node.js 18+)

```bash
npm install
npm run build      # one-shot build → writes dist/scp.{js,css,min.js,min.css}
npm run watch      # rebuild on save
```

### Option B — PowerShell fallback (no Node required)

```powershell
./build.ps1
```

This concatenates `src/` files in load order and writes `dist/scp.js` and `dist/scp.css` (unminified only — no minification without Node).

## Release a new version

```bash
# 1. Bump version in package.json
# 2. Build & commit
npm run build
git add -A
git commit -m "Release vX.Y.Z: <one-line summary>"
git push

# 3. Tag and push the tag
git tag vX.Y.Z
git push origin vX.Y.Z

# 4. Update the @vX.Y.Z segment of each Asset Injector URL in Drupal
# 5. Clear Drupal cache (admin/config/development/performance)
```

jsDelivr serves the tagged URL within seconds. The first request to a brand-new tag may take 30–60 seconds while jsDelivr fetches and caches it; subsequent requests are <100ms.

## Architecture & internals

See [docs/README.md](docs/README.md) — short index linking to architecture, data model, API reference, AI system prompt, and the development guide.

## License

MIT — see [LICENSE](LICENSE).
