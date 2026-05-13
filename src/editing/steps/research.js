/**
 * @category    editing
 * @purpose     Pipeline step 2 — Research. Two-phase UI: angle research
 *              (radio-list of generated angles) which unlocks hook research
 *              (radio-list of hooks built on the selected angle). Uses
 *              window._scpAiSel to inject the AI provider picker.
 * @exports     window._scpRenderers.step_research
 *              window._scpRenderResearchStep
 * @depends-on  window._scpEsc, window._scpIcon, window._scpAiSel
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 6 of v0.2.0)
 */
(function($) {
  'use strict';

  var esc, icon;
  function _resolveHelpers() {
    esc = window._scpEsc; icon = window._scpIcon;
  }

  // ============================================================
  // SECTION 6: STEP 2 — RESEARCH (Angles + Hooks)
  // ============================================================

  function renderResearchStep(post) {
    _resolveHelpers();
    var r = post.research || {};
    var angles = r.angles || [];
    var hooks = r.hooks || [];
    var hasSelectedAngle = !!r.selected_angle;
    var hasSelectedHook = !!r.selected_hook;

    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // ─── PHASE 1: ANGLE RESEARCH ───
    html += '<div class="scp-research-phase" style="border-left-color: var(--scp-accent)">';
    html += '<div class="scp-research-phase-header"><span class="scp-phase-num">1</span><h3>' + icon('eye') + ' Angle Research</h3></div>';
    html += '<p class="scp-text-sm scp-text-muted">Research different angles for this post. What unique perspective will you take?</p>';

    // Custom input
    html += '<div class="scp-form-row scp-research-input-row">';
    html += '<div style="flex:1"><input type="text" class="scp-input scp-angle-custom" value="' + esc(r.angle_custom_input || '') + '" placeholder="Custom direction (optional): focus on cost-saving angle..."></div>';
    html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-research-angles">' + icon('sparkles') + ' Research Angles</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-research-angles') : '');
    html += '</div>';

    // Angle list
    if (angles.length > 0) {
      html += '<div class="scp-radio-list">';
      for (var a = 0; a < angles.length; a++) {
        var isSelAngle = angles[a].selected || (r.selected_angle && r.selected_angle === angles[a].angle);
        html += '<div class="scp-radio-item' + (isSelAngle ? ' scp-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="scp_angle" class="scp-radio" data-action="select-angle" data-index="' + a + '"' + (isSelAngle ? ' checked' : '') + '>';
        html += '<div class="scp-radio-body"><div class="scp-radio-title">' + esc(angles[a].angle || '') + '</div>';
        if (angles[a].description) html += '<div class="scp-radio-desc">' + esc(angles[a].description) + '</div>';
        html += '</div>';
        html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="remove-angle" data-index="' + a + '">' + icon('trash') + '</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    if (angles.length > 0 && !hasSelectedAngle) {
      html += '<p class="scp-text-sm" style="color:var(--scp-accent);margin-top:var(--scp-space-2)">' + icon('info') + ' Select an angle above to unlock hook research.</p>';
    }
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-angle-manual" style="margin-top:var(--scp-space-2)">' + icon('plus') + ' Add Manually</button>';
    html += '</div>'; // end phase 1

    // ─── PHASE 2: HOOK RESEARCH (unlocked after angle) ───
    if (hasSelectedAngle) {
      html += '<div class="scp-research-phase" style="border-left-color: #9334e9">';
      html += '<div class="scp-research-phase-header"><span class="scp-phase-num scp-phase-num-2">2</span><h3>' + icon('bolt') + ' Hook Research</h3></div>';
      html += '<p class="scp-text-sm scp-text-muted">Based on angle: <strong>"' + esc(r.selected_angle) + '"</strong></p>';

      html += '<div class="scp-form-row scp-research-input-row">';
      html += '<div style="flex:1"><input type="text" class="scp-input scp-hook-custom" value="' + esc(r.hook_custom_input || '') + '" placeholder="Custom direction: make it provocative, use numbers..."></div>';
      html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-research-hooks">' + icon('sparkles') + ' Research Hooks</button>';
      html += (window._scpAiSel ? window._scpAiSel('ai-research-hooks') : '');
      html += '</div>';

      if (hooks.length > 0) {
        html += '<div class="scp-radio-list">';
        for (var h = 0; h < hooks.length; h++) {
          var isSelHook = hooks[h].selected || (r.selected_hook && r.selected_hook === hooks[h].hook);
          html += '<div class="scp-radio-item' + (isSelHook ? ' scp-radio-item-selected' : '') + '">';
          html += '<input type="radio" name="scp_hook" class="scp-radio" data-action="select-hook" data-index="' + h + '"' + (isSelHook ? ' checked' : '') + '>';
          html += '<div class="scp-radio-body"><div class="scp-radio-title">"' + esc(hooks[h].hook || '') + '"</div></div>';
          html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="remove-hook" data-index="' + h + '">' + icon('trash') + '</button>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-hook-manual" style="margin-top:var(--scp-space-2)">' + icon('plus') + ' Add Manually</button>';
      html += '</div>'; // end phase 2
    } else {
      html += '<div class="scp-research-phase scp-phase-locked">';
      html += '<div class="scp-research-phase-header"><span class="scp-phase-num scp-phase-num-locked">2</span><h3 class="scp-text-muted">' + icon('bolt') + ' Hook Research</h3></div>';
      html += '<p class="scp-text-sm scp-text-muted">' + icon('lock') + ' Select an angle first to unlock hook research.</p>';
      html += '</div>';
    }

    // Research notes
    html += '<div class="scp-form-group" style="margin-top:var(--scp-space-4)"><label>Research Notes</label>';
    html += '<textarea class="scp-textarea scp-research-notes" rows="2" placeholder="Notes...">' + esc(r.notes || '') + '</textarea></div>';

    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_research = renderResearchStep;
  window._scpRenderResearchStep = renderResearchStep;

})(jQuery);
