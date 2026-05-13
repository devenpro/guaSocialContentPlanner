/**
 * @category    editing
 * @purpose     Pipeline step 3 — Content. Main social composer + type-specific
 *              extras: carousel slide planner (with AI plan button + per-slide
 *              theme/text-overlay rows) and video details (duration, format,
 *              concept) with timeline-visualised structured-script output.
 * @exports     window._scpRenderers.step_content
 *              window._scpRenderContentStep
 * @depends-on  window._scpEsc, window._scpIcon, window._scpTruncate,
 *              window._scpRenderers.socialComposer (from scp-part2a runtime),
 *              window._scpPart2A.renderStructuredOutput, window._scpAiSel
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 7 of v0.2.0)
 */
(function($) {
  'use strict';

  var esc, icon, truncate;
  function _resolveHelpers() {
    esc = window._scpEsc; icon = window._scpIcon; truncate = window._scpTruncate;
  }
  function renderSocialComposer(id, content, opts) {
    var R = window._scpRenderers;
    if (R && R.socialComposer) return R.socialComposer(id, content, opts);
    return '';
  }
  function renderStructuredOutput(data, schemaId, opts) {
    var P = window._scpPart2A;
    if (P && P.renderStructuredOutput) return P.renderStructuredOutput(data, schemaId, opts);
    return '';
  }

  // ============================================================
  // SECTION 7: STEP 3 — CONTENT
  // ============================================================

  function renderContentStep(post) {
    _resolveHelpers();
    var r = post.research || {};
    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // Show selected angle/hook context
    if (r.selected_angle || r.selected_hook) {
      html += '<div class="scp-context-strip">';
      if (r.selected_angle) html += '<span>' + icon('eye') + ' <strong>Angle:</strong> ' + esc(r.selected_angle) + '</span>';
      if (r.selected_hook) html += '<span>' + icon('bolt') + ' <strong>Hook:</strong> "' + esc(truncate(r.selected_hook, 60)) + '"</span>';
      html += '</div>';
    }

    // Main social composer
    html += '<div class="scp-form-group"><label>Write Your Post</label>';
    html += '<p class="scp-text-sm scp-text-muted">Compose your master content — hook, body, CTA, and hashtags all in one place.</p>';
    html += renderSocialComposer('master', post.content.body || '', { charLimit: 3000, label: 'Master Content', postId: post.id });
    html += '</div>';

    // Carousel slide planner
    if (post.type === 'carousel') {
      html += renderCarouselPlanner(post);
    }

    // Video details
    if (post.type === 'video') {
      html += renderVideoDetails(post);
    }

    html += '</div>';
    return html;
  }

  function renderCarouselPlanner(post) {
    var car = post.carousel || { slide_count: 5, slides: [] };
    var count = car.slide_count || 5;
    var slides = car.slides || [];
    var visualPlans = (post.media && post.media.visual_plans) || [];

    var html = '<div class="scp-carousel-planner">';
    html += '<div class="scp-section-header"><h3>' + icon('images') + ' Slide Planner</h3>';
    html += '<div class="scp-slide-count-row">';
    html += '<span class="scp-text-xs scp-text-muted">Slides:</span>';
    for (var n = 3; n <= 10; n++) {
      html += '<button class="scp-slide-count-btn' + (count === n ? ' scp-slide-count-btn-active' : '') + '" data-action="set-slide-count" data-count="' + n + '">' + n + '</button>';
    }
    html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-plan-slides">' + icon('sparkles') + ' AI Plan</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-plan-slides') : '');
    html += '</div></div>';

    for (var i = 0; i < count; i++) {
      var slide = slides[i] || { index: i, theme: '', text_overlay: '' };
      var hasVP = visualPlans[i] && visualPlans[i].visual_concept && visualPlans[i].visual_concept.scene;
      html += '<div class="scp-slide-row" data-slide-index="' + i + '">';
      html += '<span class="scp-slide-num">' + (i + 1) + '</span>';
      html += '<input type="text" class="scp-input scp-slide-field" data-slide-index="' + i + '" data-slide-field="theme" value="' + esc(slide.theme || '') + '" placeholder="Slide ' + (i + 1) + ' theme...">';
      html += '<input type="text" class="scp-input scp-slide-field scp-slide-overlay" data-slide-index="' + i + '" data-slide-field="text_overlay" value="' + esc(slide.text_overlay || '') + '" placeholder="Text overlay (opt)">';
      if (hasVP) {
        html += '<span class="scp-slide-vp-badge" title="Visual plan exists — go to Media step to view">' + icon('circle-check') + '</span>';
      }
      html += '</div>';
    }

    // Link to media step if plans exist
    if (visualPlans.length > 0) {
      html += '<div class="scp-carousel-plan-link">' + icon('image') + ' <strong>' + visualPlans.length + '</strong> visual plan' + (visualPlans.length !== 1 ? 's' : '') + ' created. ';
      html += '<a href="#" data-action="go-step" data-step="media">View in Media step ' + icon('arrow-right') + '</a></div>';
    }

    html += '</div>';
    return html;
  }

  function renderVideoDetails(post) {
    var vid = post.video || {};
    var hasStructuredScript = !!(vid.structured_script && (vid.structured_script.hook || vid.structured_script.body));
    var html = '<div class="scp-video-details">';
    html += '<div class="scp-section-header"><h3>' + icon('video') + ' Video Details</h3></div>';

    html += '<div class="scp-form-row">';
    // Duration
    html += '<div class="scp-form-third"><label>Duration</label><div class="scp-duration-selector">';
    ['15', '30', '60', '90'].forEach(function(d) {
      html += '<button class="scp-dur-btn' + (vid.duration_seconds == d ? ' scp-dur-btn-active' : '') + '" data-action="set-video-duration" data-duration="' + d + '">' + d + 's</button>';
    });
    html += '</div></div>';
    // Format
    html += '<div class="scp-form-third"><label>Format</label><div class="scp-duration-selector">';
    ['reel', 'short', 'story'].forEach(function(f) {
      html += '<button class="scp-dur-btn' + (vid.format === f ? ' scp-dur-btn-active' : '') + '" data-action="set-video-format" data-format="' + f + '">' + f.charAt(0).toUpperCase() + f.slice(1) + '</button>';
    });
    html += '</div></div>';
    html += '<div class="scp-form-third"><label>&nbsp;</label><button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-generate-script">' + icon('sparkles') + ' AI Script</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-generate-script') : '') + '</div>';
    html += '</div>';

    // Concept
    html += '<div class="scp-form-group"><label>Concept</label>';
    html += '<input type="text" class="scp-input scp-video-field" data-video-field="concept" value="' + esc(vid.concept || '') + '" placeholder="Describe the video idea..."></div>';

    // ─── Structured Script Output (via AIO renderer) ───
    if (hasStructuredScript) {
      html += '<div class="scp-video-script-output">';
      // Duration timeline visualization
      html += renderScriptTimeline(vid.structured_script);
      // Structured cards
      html += renderStructuredOutput(vid.structured_script, 'video_script', {
        outputId: 'vs_' + post.id, postId: post.id, title: 'Video Script (' + (vid.structured_script.total_duration || vid.duration_seconds || '?') + 's)'
      });
      html += '</div>';
    }

    // ─── Legacy plain-text script (shown if no structured script, or as fallback) ───
    if (!hasStructuredScript) {
      html += '<div class="scp-form-group"><label>Script' + (vid.script ? '' : ' <span class="scp-text-xs scp-text-muted">— click AI Script above to generate</span>') + '</label>';
      html += '<textarea class="scp-textarea scp-video-field" data-video-field="script" rows="6" placeholder="Write your video script or use AI to generate a structured one...">' + esc(vid.script || '') + '</textarea></div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Renders a visual duration timeline bar for structured video scripts.
   * Shows hook (red), body sections (blue), outro (green) as proportional segments.
   */
  function renderScriptTimeline(script) {
    if (!script) return '';
    var segments = [];
    var totalDuration = 0;

    // Hook
    var hookDur = (script.hook && script.hook.duration_seconds) || 0;
    if (hookDur > 0) {
      segments.push({ label: 'Hook', duration: hookDur, color: '#d93025', icon: 'bolt' });
      totalDuration += hookDur;
    }

    // Body sections
    if (script.body && Array.isArray(script.body)) {
      for (var i = 0; i < script.body.length; i++) {
        var b = script.body[i];
        var bDur = b.duration_seconds || 0;
        if (bDur > 0) {
          segments.push({ label: b.section || ('Body ' + (i + 1)), duration: bDur, color: '#1a73e8', icon: 'pen-fancy' });
          totalDuration += bDur;
        }
      }
    }

    // Outro
    var outroDur = (script.outro && script.outro.duration_seconds) || 0;
    if (outroDur > 0) {
      segments.push({ label: 'Outro', duration: outroDur, color: '#0d904f', icon: 'rocket' });
      totalDuration += outroDur;
    }

    if (segments.length === 0 || totalDuration === 0) return '';

    // Build timeline HTML
    var html = '<div class="scp-script-timeline">';
    html += '<div class="scp-script-timeline-header">';
    html += '<span class="scp-script-timeline-title">' + icon('clock') + ' Duration Timeline</span>';
    html += '<span class="scp-script-timeline-total">' + totalDuration + 's total</span>';
    html += '</div>';

    // Bar
    html += '<div class="scp-script-timeline-bar">';
    var elapsed = 0;
    for (var si = 0; si < segments.length; si++) {
      var seg = segments[si];
      var pct = (seg.duration / totalDuration) * 100;
      html += '<div class="scp-script-timeline-segment" style="width:' + pct + '%;background:' + seg.color + '" title="' + esc(seg.label) + ': ' + seg.duration + 's (' + Math.round(pct) + '%)">';
      if (pct > 10) html += '<span class="scp-script-timeline-seg-label">' + seg.duration + 's</span>';
      html += '</div>';
      elapsed += seg.duration;
    }
    html += '</div>';

    // Legend
    html += '<div class="scp-script-timeline-legend">';
    for (var li = 0; li < segments.length; li++) {
      var s = segments[li];
      html += '<span class="scp-script-timeline-legend-item">';
      html += '<span class="scp-script-timeline-legend-dot" style="background:' + s.color + '"></span>';
      html += esc(s.label) + ' <span class="scp-text-xs scp-text-muted">' + s.duration + 's</span>';
      html += '</span>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_content = renderContentStep;
  window._scpRenderContentStep = renderContentStep;

})(jQuery);
