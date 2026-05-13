/**
 * @category    editing
 * @purpose     Pipeline step 1 — Basics. Title, type chips, priority,
 *              platform checkboxes, tags input, tone/audience selects, notes.
 * @exports     window._scpRenderers.step_basics (registered at load time)
 *              window._scpRenderBasicsStep (for part2a alias if needed)
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpFormatDate, window._scpConstants,
 *              window._scpRenderers.tagInput (set by scp-part2a at init)
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 5 of v0.2.0)
 */
(function($) {
  'use strict';

  var S, esc, icon, formatDate, Constants;
  function _resolveHelpers() {
    S = window._scpState; esc = window._scpEsc; icon = window._scpIcon;
    formatDate = window._scpFormatDate; Constants = window._scpConstants;
  }
  function renderTagInput(tagIds, postId) {
    var R = window._scpRenderers; if (R && R.tagInput) return R.tagInput(tagIds, postId);
    return '';
  }

  // ============================================================
  // SECTION 5: STEP 1 — BASICS
  // ============================================================

  function renderBasicsStep(post) {
    _resolveHelpers();
    var stg = (S.meta && S.meta.settings) || {};
    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // Title
    html += '<div class="scp-form-group"><label>Title</label>';
    html += '<input type="text" class="scp-input scp-basics-field" data-field="title" value="' + esc(post.title || '') + '" placeholder="Post title..."></div>';

    // Type + Priority row
    html += '<div class="scp-form-row"><div class="scp-form-half">';
    html += '<label>Post Type</label><div class="scp-type-selector">';
    for (var tk in Constants.POST_TYPES) {
      var pt = Constants.POST_TYPES[tk];
      html += '<button class="scp-type-option' + (post.type === tk ? ' scp-type-option-active' : '') + '" data-action="set-post-type" data-type="' + tk + '" style="--opt-color:' + pt.color + '">' + icon(pt.icon) + ' ' + esc(pt.label) + '</button>';
    }
    html += '</div></div><div class="scp-form-half">';
    html += '<label>Priority</label><select class="scp-select scp-basics-field" data-field="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) {
      var pr = Constants.PRIORITY_LEVELS[pk];
      html += '<option value="' + pk + '"' + (post.priority === pk ? ' selected' : '') + '>' + pr.label + '</option>';
    }
    html += '</select></div></div>';

    // Platforms
    html += '<div class="scp-form-group"><label>Target Platforms</label><div class="scp-platform-selector">';
    for (var plk in Constants.PLATFORMS) {
      var pl = Constants.PLATFORMS[plk];
      var isOn = (post.platforms || []).indexOf(plk) > -1;
      html += '<label class="scp-chip-checkbox' + (isOn ? ' scp-chip-checkbox-active' : '') + '" style="--chip-color:' + pl.color + '">';
      html += '<input type="checkbox" class="scp-platform-check" data-platform="' + plk + '"' + (isOn ? ' checked' : '') + '>';
      html += icon(pl.icon) + ' ' + esc(pl.label) + '</label>';
    }
    html += '</div></div>';

    // Tags
    html += '<div class="scp-form-group"><label>Tags</label>' + renderTagInput(post.tags || [], post.id) + '</div>';

    // Tone + Audience
    var tones = stg.tones || []; var auds = stg.audiences || [];
    html += '<div class="scp-form-row"><div class="scp-form-half">';
    html += '<label>Tone</label><select class="scp-select scp-content-meta-field" data-path="content.tone_id">';
    html += '<option value="">Not set</option>';
    for (var ti = 0; ti < tones.length; ti++) html += '<option value="' + esc(tones[ti].id) + '"' + (post.content.tone_id === tones[ti].id ? ' selected' : '') + '>' + esc(tones[ti].name) + '</option>';
    html += '</select></div><div class="scp-form-half">';
    html += '<label>Audience</label><select class="scp-select scp-content-meta-field" data-path="content.audience_id">';
    html += '<option value="">Not set</option>';
    for (var ai = 0; ai < auds.length; ai++) html += '<option value="' + esc(auds[ai].id) + '"' + (post.content.audience_id === auds[ai].id ? ' selected' : '') + '>' + esc(auds[ai].name) + '</option>';
    html += '</select></div></div>';

    // Notes
    html += '<div class="scp-form-group"><label>Notes</label>';
    html += '<textarea class="scp-textarea scp-basics-field" data-field="source.notes" rows="2" placeholder="Any additional context...">' + esc((post.source && post.source.notes) || '') + '</textarea></div>';

    // Source info
    if (post.source && post.source.type === 'research') {
      html += '<div class="scp-info-strip">' + icon('flask') + ' From research session • Created ' + formatDate(post.created) + '</div>';
    }

    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_basics = renderBasicsStep;
  window._scpRenderBasicsStep = renderBasicsStep;

})(jQuery);
