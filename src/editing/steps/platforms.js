/**
 * @category    editing
 * @purpose     Pipeline step 5 — Platforms. Per-platform composer (or YouTube
 *              title/description/tags form for video posts on YouTube) with
 *              per-platform character limits, AI Adapt button, and enable
 *              toggle. "Add platform" affordance at the bottom.
 * @exports     window._scpRenderers.step_platforms
 *              window._scpRenderPlatformsStep
 * @depends-on  window._scpEsc, window._scpIcon, window._scpBadge,
 *              window._scpGetPlatformConfig, window._scpConstants,
 *              window._scpRenderers.socialComposer (from scp-part2a runtime),
 *              window._scpAiSel
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 9 of v0.2.0)
 */
(function($) {
  'use strict';

  var esc, icon, badge, getPlatformConfig, Constants;
  function _resolveHelpers() {
    esc = window._scpEsc; icon = window._scpIcon; badge = window._scpBadge;
    getPlatformConfig = window._scpGetPlatformConfig; Constants = window._scpConstants;
  }
  function renderSocialComposer(id, content, opts) {
    var R = window._scpRenderers;
    if (R && R.socialComposer) return R.socialComposer(id, content, opts);
    return '';
  }

  // ============================================================
  // SECTION 9: STEP 5 — PLATFORMS
  // ============================================================

  function renderPlatformsStep(post) {
    _resolveHelpers();
    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';
    html += '<p class="scp-text-sm scp-text-muted">Adapt your master content for each target platform. Write the full post for each.</p>';

    var plats = post.platforms || [];
    for (var pi = 0; pi < plats.length; pi++) {
      var pk = plats[pi];
      var plCfg = Constants.PLATFORMS[pk]; if (!plCfg) continue;
      var pc = (post.platform_content && post.platform_content[pk]) || {};
      var platformSettings = getPlatformConfig(pk);

      // Skip instagram for text-only
      if (pk === 'instagram' && post.type === 'text') {
        html += '<div class="scp-platform-section scp-platform-disabled" style="border-left-color:' + plCfg.color + '">';
        html += '<div class="scp-platform-header"><span style="color:' + plCfg.color + '">' + icon(plCfg.icon) + ' ' + esc(plCfg.label) + '</span>';
        html += badge('Text posts not supported', '#9aa0a6') + '</div></div>';
        continue;
      }

      html += '<div class="scp-platform-section" style="border-left-color:' + plCfg.color + '">';
      html += '<div class="scp-platform-header">';
      html += '<span style="color:' + plCfg.color + ';font-weight:700">' + icon(plCfg.icon) + ' ' + esc(plCfg.label) + '</span>';
      html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-adapt-platform" data-platform="' + pk + '">' + icon('sparkles') + ' AI Adapt</button>';
      html += (window._scpAiSel ? window._scpAiSel('ai-adapt-' + pk) : '');
      html += '</div>';

      if (pk === 'youtube' && post.type === 'video') {
        // YouTube gets title + description + tags
        html += '<div class="scp-form-group"><label>Video Title</label>';
        html += '<input type="text" class="scp-input scp-platform-field" data-platform="' + pk + '" data-pfield="title" value="' + esc(pc.title || '') + '" placeholder="YouTube title..."></div>';
        html += '<div class="scp-form-group"><label>Description</label>';
        html += '<textarea class="scp-textarea scp-platform-field" data-platform="' + pk + '" data-pfield="description" rows="4" placeholder="YouTube description...">' + esc(pc.description || '') + '</textarea></div>';
        html += '<div class="scp-form-group"><label>Tags</label>';
        html += '<input type="text" class="scp-input scp-platform-field" data-platform="' + pk + '" data-pfield="tags" value="' + esc((pc.tags || []).join(', ')) + '" placeholder="tag1, tag2, tag3..."></div>';
      } else {
        // Standard platform: social composer
        var charLimit = platformSettings.char_limit || 3000;
        html += renderSocialComposer('platform_' + pk, pc.body || '', { charLimit: charLimit, label: plCfg.label, platform: pk, postId: post.id, color: plCfg.color });
      }

      // Enable toggle
      html += '<label class="scp-toggle-label scp-platform-enable"><input type="checkbox" class="scp-platform-enable-check" data-platform="' + pk + '"' + (pc.enabled ? ' checked' : '') + '> Enable for publishing</label>';
      html += '</div>';
    }

    // Add more platforms
    var otherPlats = Object.keys(Constants.PLATFORMS).filter(function(pk) { return plats.indexOf(pk) < 0; });
    if (otherPlats.length > 0) {
      html += '<div class="scp-add-platform"><span class="scp-text-xs scp-text-muted">Add platform:</span>';
      for (var opi = 0; opi < otherPlats.length; opi++) {
        var opk = otherPlats[opi]; var opl = Constants.PLATFORMS[opk];
        html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-platform" data-platform="' + opk + '">' + icon(opl.icon) + ' ' + esc(opl.label) + '</button>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_platforms = renderPlatformsStep;
  window._scpRenderPlatformsStep = renderPlatformsStep;

})(jQuery);
