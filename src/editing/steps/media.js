/**
 * @category    editing
 * @purpose     Pipeline step 4 — Media. Style selector + custom instructions
 *              + brand context toggle + "Plan Visual" AI button. Renders
 *              structured-output for visual_plan / visual_plans (single image
 *              or carousel), or legacy prompt cards for backward compat.
 * @exports     window._scpRenderers.step_media
 *              window._scpRenderMediaStep
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpMediaPromptStatusBadge,
 *              window._scpPart2A.renderStructuredOutput, window._scpAiSel
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 8 of v0.2.0)
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, mediaPromptStatusBadge;
  function _resolveHelpers() {
    S = window._scpState; esc = window._scpEsc; icon = window._scpIcon;
    truncate = window._scpTruncate; mediaPromptStatusBadge = window._scpMediaPromptStatusBadge;
  }
  function renderStructuredOutput(data, schemaId, opts) {
    var P = window._scpPart2A;
    if (P && P.renderStructuredOutput) return P.renderStructuredOutput(data, schemaId, opts);
    return '';
  }

  // ============================================================
  // SECTION 8: STEP 4 — MEDIA PROMPTS
  // ============================================================

  function renderMediaStep(post) {
    _resolveHelpers();
    if (post.type === 'text') {
      return '<div class="scp-empty-state scp-empty-state--compact"><p>' + icon('info') + ' Text-only posts don\'t need media. This step is skipped.</p></div>';
    }

    var media = post.media || {};
    var config = media.config || {};
    var styles = (S.meta.settings && S.meta.settings.image_styles) || [];
    var hasVisualPlan = !!(media.visual_plan && media.visual_plan.visual_concept);
    var hasCarouselPlans = !!(media.visual_plans && media.visual_plans.length > 0);
    var hasLegacyPrompts = (media.prompts || []).length > 0;

    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // ─── Context strip — show what message this visual should deliver ───
    var r = post.research || {};
    var contentBody = (post.content && post.content.body) || '';
    html += '<div class="scp-media-context">';
    html += '<div class="scp-media-context-header">' + icon('lightbulb') + ' <strong>Content Context</strong> <span class="scp-text-xs scp-text-muted">— the AI will plan visuals that deliver this message</span></div>';
    if (r.selected_hook) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Hook:</span> <span>"' + esc(truncate(r.selected_hook, 80)) + '"</span></div>';
    if (r.selected_angle) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Angle:</span> <span>' + esc(r.selected_angle) + '</span></div>';
    if (contentBody) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Content:</span> <span>' + esc(truncate(contentBody, 120)) + '</span></div>';
    if (!r.selected_hook && !contentBody) html += '<div class="scp-media-context-item scp-text-muted">' + icon('info') + ' Complete the Research and Content steps first for better visual planning.</div>';
    html += '</div>';

    // ─── Style selection ───
    html += '<div class="scp-media-style-row">';
    html += '<div class="scp-form-group" style="flex:1"><label>Visual Style Reference</label>';
    html += '<select class="scp-select scp-media-config-field" data-config-field="style_id">';
    html += '<option value="">Auto (let AI decide)</option>';
    for (var si = 0; si < styles.length; si++) html += '<option value="' + esc(styles[si].id) + '"' + (config.style_id === styles[si].id ? ' selected' : '') + '>' + esc(styles[si].name) + ' — ' + esc(styles[si].description || '') + '</option>';
    html += '</select></div>';
    html += '<div class="scp-form-group" style="flex:1"><label>Additional Direction</label>';
    html += '<input type="text" class="scp-input scp-media-config-field" data-config-field="custom_instructions" value="' + esc(config.custom_instructions || '') + '" placeholder="Optional: specific requirements, mood, constraints..."></div>';
    html += '</div>';

    // ─── Brand toggle + Generate button ───
    html += '<div class="scp-media-actions">';
    html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-media-brand-toggle"' + (config.brand_context_enabled !== false ? ' checked' : '') + '> Include Brand Context</label>';
    var genLabel = post.type === 'carousel' ? 'Plan All Slides' : post.type === 'video' ? 'Plan Thumbnail' : 'Plan Visual';
    html += '<button class="scp-btn scp-btn-ai" data-action="ai-generate-visual-plan">' + icon('sparkles') + ' ' + genLabel + '</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-generate-media') : '');
    html += '</div>';

    // ─── Output: Visual Plan (rendered via AIO engine) ───
    if (post.type === 'carousel' && hasCarouselPlans) {
      // Carousel: array of per-slide visual plans
      html += '<div class="scp-media-visual-output">';
      html += renderStructuredOutput(media.visual_plans, 'carousel_visual_plan', {
        outputId: 'vp_' + post.id, postId: post.id, title: 'Carousel Visual Plan (' + media.visual_plans.length + ' slides)'
      });
      html += '</div>';
    } else if (hasVisualPlan) {
      // Single image / thumbnail visual plan
      html += '<div class="scp-media-visual-output">';
      html += renderStructuredOutput(media.visual_plan, 'image_visual_plan', {
        outputId: 'vp_' + post.id, postId: post.id,
        title: post.type === 'video' ? 'Thumbnail Visual Plan' : 'Visual Content Plan'
      });
      html += '</div>';
    }

    // ─── Legacy: Old-style prompt output (backward compat) ───
    if (hasLegacyPrompts && !hasVisualPlan && !hasCarouselPlans) {
      html += renderLegacyPromptOutput(post, media.prompts);
    }

    html += '</div>';
    return html;
  }

  // Legacy prompt card rendering — kept for backward compatibility with old data
  function renderLegacyPromptOutput(post, prompts) {
    var html = '<div class="scp-media-output scp-media-legacy">';
    html += '<div class="scp-section-header"><h3>' + icon('wand-magic') + ' Generated Prompts <span class="scp-text-xs scp-text-muted">(legacy format)</span></h3>';
    html += '<div class="scp-prompt-header-actions">';
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="copy-all-prompts">' + icon('copy') + ' Copy All</button>';
    html += '</div></div>';
    for (var pi = 0; pi < prompts.length; pi++) {
      var mp = prompts[pi];
      html += '<div class="scp-prompt-card" data-prompt-index="' + pi + '">';
      html += '<div class="scp-prompt-card-header">';
      html += '<span class="scp-prompt-label">' + esc(mp.label || 'Prompt ' + (pi + 1)) + '</span>';
      html += mediaPromptStatusBadge(mp.status || 'draft');
      html += '</div>';
      html += '<textarea class="scp-textarea scp-prompt-text" data-prompt-index="' + pi + '" rows="4">' + esc(mp.prompt_text || '') + '</textarea>';
      if (mp.negative_prompt) {
        html += '<div class="scp-prompt-negative"><label class="scp-text-xs scp-text-muted">NEGATIVE PROMPT</label>';
        html += '<textarea class="scp-textarea scp-prompt-negative-text" data-prompt-index="' + pi + '" rows="2">' + esc(mp.negative_prompt || '') + '</textarea></div>';
      }
      html += '<div class="scp-prompt-card-actions">';
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="copy-prompt" data-index="' + pi + '">' + icon('copy') + ' Copy</button>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_media = renderMediaStep;
  window._scpRenderMediaStep = renderMediaStep;

})(jQuery);
