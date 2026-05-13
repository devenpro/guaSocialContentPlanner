// build.mjs — esbuild driver for gua Social Content Planner.
// Outputs dist/scp.js, dist/scp.css (unminified, with sourcemap) and
// dist/scp.min.js, dist/scp.min.css (minified, production).
// Usage:  node build.mjs           // one-shot
//         node build.mjs --watch   // rebuild on save

import { build, context } from 'esbuild';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const banner = `/* gua Social Content Planner v${pkg.version} | https://github.com/devenpro/guaSocialContentPlanner */`;

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  logLevel: 'info',
  target: ['es2018'],
  legalComments: 'none',
};

const jsCommon = {
  ...common,
  entryPoints: ['src/index.js'],
  format: 'iife',
  banner: { js: banner },
};

const cssCommon = {
  ...common,
  entryPoints: ['src/index.css'],
  loader: { '.css': 'css' },
  banner: { css: banner },
};

const configs = [
  { ...jsCommon,  outfile: 'dist/scp.js',      sourcemap: 'inline' },
  { ...jsCommon,  outfile: 'dist/scp.min.js',  minify: true },
  { ...cssCommon, outfile: 'dist/scp.css',     sourcemap: 'inline' },
  { ...cssCommon, outfile: 'dist/scp.min.css', minify: true },
];

if (watch) {
  for (const cfg of configs) {
    const ctx = await context(cfg);
    await ctx.watch();
  }
  console.log('[build] watching src/ — saved changes will rebuild dist/');
} else {
  await Promise.all(configs.map((cfg) => build(cfg)));
  console.log('[build] wrote dist/scp.{js,min.js,css,min.css}');
}
