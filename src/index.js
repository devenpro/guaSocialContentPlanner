/**
 * @entry    src/index.js
 * @purpose  Single-bundle entry. Imports every category in strict load order.
 *
 * Load order is load-bearing:
 *   1. core    — defines Drupal.behaviors.scpPart1, state, renderer registry
 *   2. editing — polls for core readiness, then registers pipeline step renderers
 *   3. ai      — polls for editing readiness, then registers AI actions and settings view
 *
 * The polling design pre-dates this bundle and survives because each part still
 * runs as its own IIFE. Once part2a/part2b are refactored into modules with
 * explicit imports, the polling can be replaced with direct calls.
 */

import './core/scp-part1.js';
import './editing/scp-part2a.js';
import './ai/scp-part2b.js';
