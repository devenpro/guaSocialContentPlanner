/**
 * @category    editing
 * @purpose     Pipeline step 6 — Schedule. Date/time/timezone inputs +
 *              status action buttons (Mark Ready, Set Schedule, Mark Published),
 *              published URLs per platform, and a placeholder performance grid.
 * @exports     window._scpRenderers.step_schedule
 *              window._scpRenderScheduleStep
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpConstants
 * @extracted-from  src/editing/scp-part2a.js (was SECTION 10 of v0.2.0)
 */
(function($) {
  'use strict';

  var S, esc, icon, Constants;
  function _resolveHelpers() {
    S = window._scpState; esc = window._scpEsc; icon = window._scpIcon;
    Constants = window._scpConstants;
  }

  // ============================================================
  // SECTION 10: STEP 6 — SCHEDULE
  // ============================================================

  function renderScheduleStep(post) {
    _resolveHelpers();
    var sched = post.schedule || {};
    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // Schedule section
    html += '<div class="scp-schedule-section"><div class="scp-section-header"><h3>' + icon('calendar') + ' Schedule</h3></div>';
    html += '<div class="scp-form-row">';
    html += '<div class="scp-form-third"><label>Date</label><input type="date" class="scp-input scp-schedule-field" data-sfield="date" value="' + esc(sched.date || '') + '"></div>';
    html += '<div class="scp-form-third"><label>Time</label><input type="time" class="scp-input scp-schedule-field" data-sfield="time" value="' + esc(sched.time || '') + '"></div>';
    html += '<div class="scp-form-third"><label>Timezone</label><input type="text" class="scp-input scp-schedule-field" data-sfield="timezone" value="' + esc(sched.timezone || (S.meta.settings && S.meta.settings.timezone) || '') + '" placeholder="Asia/Kolkata"></div>';
    html += '</div>';
    html += '<div class="scp-schedule-actions">';
    html += '<button class="scp-btn scp-btn-primary" data-action="mark-ready">' + icon('circle-check') + ' Mark as Ready</button>';
    html += '<button class="scp-btn scp-btn-outline" data-action="mark-scheduled">' + icon('calendar-check') + ' Set Schedule</button>';
    html += '</div></div>';

    // Published URLs
    html += '<div class="scp-schedule-section"><div class="scp-section-header"><h3>' + icon('link') + ' Published URLs</h3></div>';
    var plats = post.platforms || [];
    var urls = sched.published_urls || {};
    for (var i = 0; i < plats.length; i++) {
      var pk = plats[i]; var plCfg = Constants.PLATFORMS[pk]; if (!plCfg) continue;
      html += '<div class="scp-url-row">';
      html += '<span class="scp-url-platform" style="color:' + plCfg.color + '">' + icon(plCfg.icon) + '</span>';
      html += '<input type="url" class="scp-input scp-url-field" data-platform="' + pk + '" value="' + esc(urls[pk] || '') + '" placeholder="Paste URL after publishing...">';
      html += '</div>';
    }
    html += '<button class="scp-btn scp-btn-primary" data-action="mark-published" style="margin-top:var(--scp-space-3)">' + icon('rocket') + ' Mark Published</button>';
    html += '</div>';

    // Performance
    html += '<div class="scp-schedule-section"><div class="scp-section-header"><h3>' + icon('chart-line') + ' Performance</h3></div>';
    if (post.status === 'published') {
      html += '<div class="scp-perf-grid">';
      var perfMetrics = ['Impressions', 'Likes', 'Comments', 'Shares', 'Clicks', 'Saves'];
      for (var mi = 0; mi < perfMetrics.length; mi++) {
        html += '<div class="scp-perf-cell"><div class="scp-perf-label">' + perfMetrics[mi] + '</div><div class="scp-perf-value">—</div></div>';
      }
      html += '</div>';
    } else {
      html += '<p class="scp-text-sm scp-text-muted">Performance data will appear here after publishing.</p>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_schedule = renderScheduleStep;
  window._scpRenderScheduleStep = renderScheduleStep;

})(jQuery);
