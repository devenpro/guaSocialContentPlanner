/**
 * @category    core
 * @purpose     Dashboard view. Renders 4-column stats grid, pipeline pipeline
 *              card row, by-type breakdown, upcoming posts, tag cloud, and
 *              activity feed. Also owns two small shared rendering primitives
 *              re-used by Tags and Activity views (renderStatCard,
 *              renderActivityItem).
 * @exports     window._scpRenderDashboardView (entry)
 *              window._scpRenderStatCard      (used by views/tags.js)
 *              window._scpRenderActivityItem  (used by views/activity.js)
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpFormatNumber, window._scpFormatDate,
 *              window._scpFormatDateShort, window._scpFormatRelativeTime,
 *              window._scpProgressBar, window._scpGetUpcomingPosts,
 *              window._scpGetAllTags, window._scpGetRecentActivity,
 *              window._scpConstants
 * @extracted-from  src/core/scp-part1.js (was SECTION 8 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, formatNumber, formatDate, formatDateShort, formatRelativeTime;
  var progressBar, getUpcomingPosts, getAllTags, getRecentActivity, Constants;
  var POST_TYPES, POST_STATUSES, ACTIVITY_TYPES;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    truncate = window._scpTruncate;
    formatNumber = window._scpFormatNumber;
    formatDate = window._scpFormatDate;
    formatDateShort = window._scpFormatDateShort;
    formatRelativeTime = window._scpFormatRelativeTime;
    progressBar = window._scpProgressBar;
    getUpcomingPosts = window._scpGetUpcomingPosts;
    getAllTags = window._scpGetAllTags;
    getRecentActivity = window._scpGetRecentActivity;
    Constants = window._scpConstants;
    POST_TYPES = Constants.POST_TYPES;
    POST_STATUSES = Constants.POST_STATUSES;
    ACTIVITY_TYPES = Constants.ACTIVITY_TYPES;
  }

  // ============================================================
  // SECTION 8: DASHBOARD VIEW
  // ============================================================

  function renderDashboardView() {
    _resolveHelpers();
    var html = '<div class="scp-view scp-view-dashboard">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>Dashboard</h1></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn scp-btn-primary" data-action="new-post">' + icon('plus') + ' New Post</button>';
    html += '<button class="scp-btn scp-btn-outline" data-action="go-view" data-view="research">' + icon('flask') + ' Research</button>';
    html += '</div></div>';
    html += renderDashStats();
    html += renderDashPipeline();
    html += '<div class="scp-dash-grid">' + renderDashByType() + renderDashUpcoming() + '</div>';
    html += '<div class="scp-dash-grid">' + renderDashTagBreakdown() + renderDashActivity() + '</div>';
    // Brand strip
    if (S.brand && S.brand.configured) {
      var bi = S.brand.identity || {};
      var bc = S.brand.core || {};
      html += '<div class="scp-brand-card"><div class="scp-brand-card-header">';
      if (bi.logoUrl) html += '<img class="scp-brand-card-logo" src="' + esc(bi.logoUrl) + '" alt="">';
      html += '<div class="scp-brand-card-info"><h3>' + esc(bc.brand_name || bi.name || 'Brand') + '</h3>';
      if (bc.tagline) html += '<p>' + esc(bc.tagline) + '</p>';
      html += '</div></div></div>';
    } else {
      html += '<div class="scp-brand-strip scp-brand-strip--inactive">' + icon('warning') + ' No brand profile assigned. AI calls will have no brand context. ';
      html += '<a href="#" data-action="go-settings" data-tab="workspace">Learn more</a></div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashStats() {
    var sc = S.statusCounts || {};
    var readySched = (sc.ready || 0) + (sc.scheduled || 0);
    var pubThisMonth = (S.data.posts || []).filter(function(p) {
      if (p.status !== 'published' || !p.schedule || !p.schedule.date) return false;
      var now = new Date(); var d = new Date(p.schedule.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    var researchIdeas = 0;
    (S.data.research && S.data.research.sessions || []).forEach(function(s) { researchIdeas += (s.results || []).length; });

    // Count posts with visual plans or structured scripts
    var mediaReady = (S.data.posts || []).filter(function(p) {
      if (p.type === 'text') return false;
      var hasVP = p.media && p.media.visual_plan && p.media.visual_plan.visual_concept && p.media.visual_plan.visual_concept.scene;
      var hasCP = p.media && p.media.visual_plans && p.media.visual_plans.length > 0;
      var hasScript = p.type === 'video' && p.video && p.video.structured_script && p.video.structured_script.hook;
      var hasLegacy = p.media && p.media.prompts && p.media.prompts.length > 0;
      return hasVP || hasCP || hasScript || hasLegacy;
    }).length;
    var needsMedia = (S.data.posts || []).filter(function(p) { return p.type !== 'text' && p.status !== 'published' && p.status !== 'archived'; }).length;

    var html = '<div class="scp-dash-stats">';
    html += renderStatCard('Total Posts', S.totalPosts, S.activePosts + ' active', 'var(--scp-primary)');
    html += renderStatCard('Ready / Scheduled', readySched, readySched > 0 ? 'Next up' : 'None queued', 'var(--scp-success)');
    html += renderStatCard('Published (MTD)', pubThisMonth, 'This month', '#059669');
    html += renderStatCard('Media Planned', mediaReady, needsMedia > 0 ? (needsMedia - mediaReady) + ' need plans' : 'All done', '#7c3aed');
    html += renderStatCard('Research Ideas', researchIdeas, 'From ' + ((S.data.research && S.data.research.sessions) || []).length + ' sessions', 'var(--scp-accent)');
    html += '</div>';
    return html;
  }

  function renderStatCard(label, value, sub, color) {
    if (!esc) _resolveHelpers();
    return '<div class="scp-stat-card"><div class="scp-stat-label">' + esc(label) + '</div>' +
      '<div class="scp-stat-value" style="color:' + color + '">' + formatNumber(value) + '</div>' +
      '<div class="scp-stat-sub">' + esc(sub) + '</div></div>';
  }

  function renderDashPipeline() {
    var html = '<div class="scp-section"><div class="scp-section-header"><h2>Post Pipeline</h2></div><div class="scp-pipeline">';
    for (var status in POST_STATUSES) {
      var cfg = POST_STATUSES[status]; var count = S.statusCounts[status] || 0;
      html += '<div class="scp-pipeline-card" data-action="filter-pipeline-status" data-status="' + status + '">';
      html += '<div class="scp-pipeline-card-bar" style="background:' + cfg.color + '"></div>';
      html += '<div class="scp-pipeline-card-icon" style="color:' + cfg.color + '">' + icon(cfg.icon) + '</div>';
      html += '<div class="scp-pipeline-card-count" style="color:' + cfg.color + '">' + count + '</div>';
      html += '<div class="scp-pipeline-card-label">' + esc(cfg.label) + '</div>';
      html += '</div>';
    }
    html += '</div>';
    // Pipeline bar
    if (S.totalPosts > 0) {
      html += '<div class="scp-pipeline-bar">';
      for (var s in POST_STATUSES) {
        var cnt = S.statusCounts[s] || 0; var w = (cnt / S.totalPosts) * 100;
        if (w > 0) html += '<div class="scp-pipeline-segment" style="width:' + w + '%;background:' + POST_STATUSES[s].color + '" title="' + esc(POST_STATUSES[s].label) + ': ' + cnt + '"></div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashByType() {
    var html = '<div class="scp-section scp-dash-panel"><div class="scp-section-header"><h2>' + icon('image') + ' By Type</h2></div>';
    for (var tk in POST_TYPES) {
      var t = POST_TYPES[tk]; var cnt = S.typeCounts[tk] || 0;
      var pct = S.totalPosts > 0 ? Math.round((cnt / S.totalPosts) * 100) : 0;
      html += '<div class="scp-type-row"><span class="scp-type-row-icon" style="color:' + t.color + '">' + icon(t.icon) + '</span>';
      html += '<span class="scp-type-row-label">' + esc(t.label) + '</span>';
      html += '<div class="scp-type-row-bar">' + progressBar(pct, t.color) + '</div>';
      html += '<span class="scp-type-row-count" style="color:' + t.color + '">' + cnt + '</span></div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashUpcoming() {
    var upcoming = getUpcomingPosts(5);
    var html = '<div class="scp-section scp-dash-panel"><div class="scp-section-header"><h2>' + icon('calendar') + ' Upcoming</h2></div>';
    if (upcoming.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No upcoming posts scheduled.</p></div>';
    } else {
      for (var i = 0; i < upcoming.length; i++) {
        var p = upcoming[i]; var pt = POST_TYPES[p.type] || { icon: 'circle', color: '#80868b' };
        html += '<div class="scp-dash-upcoming-item" data-action="select-post" data-id="' + esc(p.id) + '">';
        html += '<span class="scp-dash-upcoming-icon" style="color:' + pt.color + '">' + icon(pt.icon) + '</span>';
        html += '<span class="scp-dash-upcoming-title">' + esc(truncate(p.title, 35)) + '</span>';
        var plats = (p.platforms || []).map(function(pk) { return icon(pk); }).join(' ');
        html += '<span class="scp-dash-upcoming-platforms">' + plats + '</span>';
        html += '<span class="scp-dash-upcoming-date">' + formatDateShort(p.schedule.date) + '</span></div>';
      }
    }
    html += '</div>';
    return html;
  }

  function renderDashTagBreakdown() {
    var tags = getAllTags().slice(0, 8);
    var html = '<div class="scp-section scp-dash-panel"><div class="scp-section-header"><h2>' + icon('tags') + ' Tags</h2>';
    html += '<button class="scp-btn-link" data-action="go-view" data-view="tags">View All</button></div>';
    if (tags.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No tags created yet.</p></div>';
    } else {
      html += '<div class="scp-tag-cloud">';
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i]; var postCount = (S.tagIndex[tag.id] || []).length;
        html += '<span class="scp-tag-chip" style="background:' + tag.color + '15;color:' + tag.color + ';border-color:' + tag.color + '30" data-action="select-tag-nav" data-id="' + esc(tag.id) + '">';
        html += esc(tag.name) + ' <span class="scp-tag-chip-count">' + postCount + '</span></span>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashActivity() {
    var acts = getRecentActivity(10);
    var html = '<div class="scp-section scp-dash-panel"><div class="scp-section-header"><h2>' + icon('clock-rotate-left') + ' Activity</h2>';
    if (S.activity && S.activity.length > 0) html += '<a href="#" class="scp-btn-link" data-action="go-view" data-view="activity">View all ' + icon('arrow-right') + '</a>';
    html += '</div>';
    if (acts.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No activity yet.</p></div>';
    } else {
      html += '<div class="scp-activity-list">';
      for (var i = 0; i < acts.length; i++) html += renderActivityItem(acts[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderActivityItem(act) {
    if (!esc) _resolveHelpers();
    var at = ACTIVITY_TYPES[act.type] || { icon: 'circle', color: '#80868b' };
    var html = '<div class="scp-activity-item">';
    html += '<div class="scp-activity-icon" style="background:' + at.color + '15;color:' + at.color + '">' + icon(at.icon) + '</div>';
    html += '<div class="scp-activity-body">';
    // Type label
    var typeLabel = (act.type || '').replace(/_/g, ' ');
    html += '<div class="scp-activity-type-label" style="color:' + at.color + '">' + esc(typeLabel) + '</div>';
    // Post title (clickable if post exists)
    if (act.post_title) {
      html += '<div class="scp-activity-post-title">';
      if (act.post_id) html += '<a href="#" class="scp-activity-post-link" data-action="select-post" data-id="' + esc(act.post_id) + '">' + esc(act.post_title) + '</a>';
      else html += '<span>' + esc(act.post_title) + '</span>';
      html += '</div>';
    }
    // Description detail
    if (act.description) html += '<div class="scp-activity-text">' + esc(act.description) + '</div>';
    // User + time
    html += '<div class="scp-activity-meta">';
    if (act.user_name) html += '<span class="scp-activity-user">' + icon('user') + ' ' + esc(act.user_name) + '</span>';
    html += '<span class="scp-activity-time">' + formatRelativeTime(act.timestamp) + '</span>';
    if (act.timestamp) html += '<span class="scp-activity-date">' + formatDate(act.timestamp) + '</span>';
    html += '</div></div></div>';
    return html;
  }

  window._scpRenderDashboardView = renderDashboardView;
  window._scpRenderStatCard = renderStatCard;
  window._scpRenderActivityItem = renderActivityItem;

})(jQuery);
