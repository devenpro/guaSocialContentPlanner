/* gua Social Content Planner v0.1.0 | https://github.com/devenpro/guaSocialContentPlanner | built via build.ps1 (concat-only, no minify) */

/* ----- src/core/views/dashboard.js ----- */

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


/* ----- src/core/views/posts.js ----- */

/**
 * @category    core
 * @purpose     Posts view (split pane: left = grouped post list with filter
 *              and sort toolbar; right = preview with pipeline-step indicator
 *              and step content slot delegated to part2a's renderer registry).
 * @exports     window._scpRenderPostsView (entry)
 *              window._scpRenderPostListItem (used by views/tags.js)
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpFormatRelativeTime, window._scpGetGroupedPosts,
 *              window._scpStatusBadge, window._scpTypeBadge,
 *              window._scpPriorityBadge, window._scpPlatformBadge,
 *              window._scpConstants, window._scpRenderers
 * @extracted-from  src/core/scp-part1.js (was SECTION 9 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, formatRelativeTime, getGroupedPosts;
  var statusBadge, typeBadge, priorityBadge, platformBadge, Constants;
  var POST_TYPES, POST_STATUSES, PRIORITY_LEVELS, PLATFORMS, PIPELINE_STEPS, GROUPING_OPTIONS;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    formatRelativeTime = window._scpFormatRelativeTime;
    getGroupedPosts = window._scpGetGroupedPosts;
    statusBadge = window._scpStatusBadge;
    typeBadge = window._scpTypeBadge;
    priorityBadge = window._scpPriorityBadge;
    platformBadge = window._scpPlatformBadge;
    Constants = window._scpConstants;
    POST_TYPES = Constants.POST_TYPES;
    POST_STATUSES = Constants.POST_STATUSES;
    PRIORITY_LEVELS = Constants.PRIORITY_LEVELS;
    PLATFORMS = Constants.PLATFORMS;
    PIPELINE_STEPS = Constants.PIPELINE_STEPS;
    GROUPING_OPTIONS = Constants.GROUPING_OPTIONS;
  }

  // ============================================================
  // SECTION 9: POSTS VIEW (Split Pane)
  // ============================================================

  function renderPostsView() {
    _resolveHelpers();
    var html = '<div class="scp-view scp-view-posts"><div class="scp-split-pane">';
    html += renderPostsLeftPane();
    html += '<div class="scp-preview-pane" id="scpPreviewPane">' + renderPostsRightPane() + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderPostsLeftPane() {
    var groups = getGroupedPosts(S.postGroupBy);
    var totalFiltered = 0;
    groups.forEach(function(g) { totalFiltered += g.posts.length; });

    var f = S.postFilter;
    var html = '<div class="scp-list-pane"><div class="scp-list-toolbar">';

    // Search + New button
    html += '<div class="scp-list-toolbar-row">';
    html += '<div class="scp-search-wrapper">' + icon('search') + '<input type="text" class="scp-input" id="scpPostSearch" placeholder="Search posts..." value="' + esc(f.search) + '"></div>';
    html += '<button class="scp-btn scp-btn-primary scp-btn-sm" data-action="new-post">' + icon('plus') + ' New</button>';
    html += '</div>';

    // Grouping switcher
    html += '<div class="scp-list-toolbar-row scp-group-switcher">';
    for (var gi = 0; gi < GROUPING_OPTIONS.length; gi++) {
      var go = GROUPING_OPTIONS[gi];
      var active = S.postGroupBy === go.key ? ' scp-group-btn-active' : '';
      html += '<button class="scp-group-btn' + active + '" data-action="change-group" data-group="' + go.key + '">' + esc(go.label) + '</button>';
    }
    html += '</div>';

    // Filter & sort row
    html += '<div class="scp-list-toolbar-row scp-list-filters">';
    html += '<select class="scp-select scp-select-sm" id="scpSortBy">';
    html += '<option value="updated"' + (f.sortBy === 'updated' ? ' selected' : '') + '>Updated</option>';
    html += '<option value="created"' + (f.sortBy === 'created' ? ' selected' : '') + '>Created</option>';
    html += '<option value="title"' + (f.sortBy === 'title' ? ' selected' : '') + '>Title</option>';
    html += '<option value="priority"' + (f.sortBy === 'priority' ? ' selected' : '') + '>Priority</option>';
    html += '</select>';
    html += '<button class="scp-btn-icon scp-btn-sm" data-action="toggle-sort-dir" title="Sort direction">' + icon(f.sortDir === 'asc' ? 'arrow-up' : 'arrow-down') + '</button>';
    html += '<span class="scp-filter-count">' + totalFiltered + ' post' + (totalFiltered !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    html += '</div>'; // end toolbar

    // Grouped post list
    html += '<div class="scp-post-list" id="scpPostList">';
    if (groups.length === 0 || totalFiltered === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No posts found.</p>';
      html += '<button class="scp-btn scp-btn-primary scp-btn-sm" data-action="new-post">' + icon('plus') + ' Create First Post</button></div>';
    } else {
      for (var gIdx = 0; gIdx < groups.length; gIdx++) {
        var group = groups[gIdx];
        if (group.posts.length === 0) continue;
        var collapsed = S.collapsedGroups[group.key] || false;
        html += '<div class="scp-post-group">';
        html += '<div class="scp-post-group-header" data-action="toggle-group" data-group="' + esc(group.key) + '">';
        html += '<span class="scp-post-group-chevron">' + icon(collapsed ? 'chevron-right' : 'chevron-down') + '</span>';
        html += '<span class="scp-post-group-dot" style="background:' + group.color + '"></span>';
        html += '<span class="scp-post-group-label">' + icon(group.icon) + ' ' + esc(group.label) + '</span>';
        html += '<span class="scp-post-group-count">' + group.posts.length + '</span>';
        html += '</div>';
        if (!collapsed) {
          for (var pIdx = 0; pIdx < group.posts.length; pIdx++) {
            html += renderPostListItem(group.posts[pIdx]);
          }
        }
        html += '</div>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function renderPostListItem(post) {
    if (!esc) _resolveHelpers();
    var sel = S.selectedPostId === post.id ? ' scp-post-item-selected' : '';
    var pt = POST_TYPES[post.type] || { icon: 'circle', color: '#80868b' };
    var stCfg = POST_STATUSES[post.status] || { label: post.status, color: '#80868b' };
    var priCfg = PRIORITY_LEVELS[post.priority] || {};

    var html = '<div class="scp-post-item' + sel + '" data-action="select-post" data-id="' + esc(post.id) + '">';
    html += '<div class="scp-post-item-type" style="color:' + pt.color + '">' + icon(pt.icon) + '</div>';
    html += '<div class="scp-post-item-body">';
    html += '<div class="scp-post-item-title">' + esc(post.title || 'Untitled Post') + '</div>';
    html += '<div class="scp-post-item-meta">';
    var plats = post.platforms || [];
    for (var i = 0; i < plats.length; i++) {
      var plCfg = PLATFORMS[plats[i]];
      if (plCfg) html += '<span class="scp-post-item-platform" style="color:' + plCfg.color + '">' + icon(plCfg.icon) + '</span>';
    }
    html += '<span class="scp-post-item-date">' + formatRelativeTime(post.updated || post.created) + '</span>';
    html += '</div></div>';
    // Right side: priority dot + status badge
    if (priCfg.color && (post.priority === 'high' || post.priority === 'urgent')) {
      html += '<span class="scp-priority-dot" style="background:' + priCfg.color + '" title="' + esc(priCfg.label || '') + '"></span>';
    }
    html += '<span class="scp-post-item-status">' + statusBadge(post.status) + '</span>';
    html += '</div>';
    return html;
  }

  function renderPostsRightPane() {
    if (!S.selectedPostId || !S.postMap[S.selectedPostId]) {
      return '<div class="scp-empty-state" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<div class="scp-empty-state-icon">' + icon('thumbtack') + '</div>' +
        '<div class="scp-empty-state-title">Select a post</div>' +
        '<div class="scp-empty-state-text">Choose a post from the list, or create a new one.</div>' +
        '<button class="scp-btn scp-btn-primary" data-action="new-post">' + icon('plus') + ' New Post</button></div>';
    }
    var post = S.postMap[S.selectedPostId];
    var R = window._scpRenderers;

    var html = '<div class="scp-preview-inner" data-post-id="' + esc(post.id) + '">';
    // Post header
    html += renderPostPreviewHeader(post);
    // Pipeline step indicator
    html += renderPipelineIndicator(post);
    // Step content â€” Part 2A overrides via renderer registry
    html += '<div class="scp-step-content">';
    var stepKey = 'step_' + S.currentStep;
    if (R[stepKey]) {
      html += R[stepKey](post);
    } else {
      html += renderStepPlaceholder(post);
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderPostPreviewHeader(post) {
    var pt = POST_TYPES[post.type] || { icon: 'circle', color: '#80868b', label: post.type };
    var html = '<div class="scp-preview-header">';
    html += '<div class="scp-preview-header-top">';
    html += '<div class="scp-preview-header-left">';
    html += '<span class="scp-preview-type-icon" style="color:' + pt.color + '">' + icon(pt.icon) + '</span>';
    html += '<span class="scp-preview-title">' + esc(post.title || 'Untitled Post') + '</span>';
    html += '</div>';
    html += '<div class="scp-preview-header-right">';
    html += '<button class="scp-btn-icon" data-action="delete-post" data-id="' + esc(post.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';
    html += '<div class="scp-preview-badges">';
    html += typeBadge(post.type);
    html += statusBadge(post.status);
    if (post.priority) html += priorityBadge(post.priority);
    var plats = post.platforms || [];
    for (var i = 0; i < plats.length; i++) html += platformBadge(plats[i]);
    html += '</div></div>';
    return html;
  }

  function renderPipelineIndicator(post) {
    var steps = [];
    for (var si = 0; si < PIPELINE_STEPS.length; si++) {
      var step = PIPELINE_STEPS[si];
      if (step.skipForText && post.type === 'text') continue;
      steps.push(step);
    }

    var currentIdx = -1;
    for (var ci = 0; ci < steps.length; ci++) {
      if (steps[ci].key === S.currentStep) { currentIdx = ci; break; }
    }
    if (currentIdx < 0) { S.currentStep = 'basics'; currentIdx = 0; }

    var html = '<div class="scp-pipeline-steps">';
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i];
      var isActive = i === currentIdx;
      var isDone = i < currentIdx;
      var stepClass = isActive ? ' scp-step-active' : isDone ? ' scp-step-done' : '';
      html += '<div class="scp-step-item' + stepClass + '" data-action="go-step" data-step="' + st.key + '">';
      html += '<div class="scp-step-dot">' + (isDone ? icon('check') : '<span>' + (i + 1) + '</span>') + '</div>';
      html += '<div class="scp-step-label">' + esc(st.label) + '</div>';
      html += '</div>';
      if (i < steps.length - 1) html += '<div class="scp-step-connector' + (isDone ? ' scp-step-connector-done' : '') + '"></div>';
    }
    html += '</div>';

    // Step nav buttons
    var prevStep = currentIdx > 0 ? steps[currentIdx - 1].key : null;
    var nextStep = currentIdx < steps.length - 1 ? steps[currentIdx + 1].key : null;
    html += '<div class="scp-step-nav">';
    if (prevStep) html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="go-step" data-step="' + prevStep + '">' + icon('arrow-left') + ' ' + esc(steps[currentIdx - 1].label) + '</button>';
    else html += '<span></span>';
    if (nextStep) html += '<button class="scp-btn scp-btn-primary scp-btn-sm" data-action="go-step" data-step="' + nextStep + '">Next: ' + esc(steps[currentIdx + 1].label) + ' ' + icon('arrow-right') + '</button>';
    else html += '<span></span>';
    html += '</div>';

    return html;
  }

  function renderStepPlaceholder(post) {
    return '<div class="scp-empty-state scp-empty-state--compact">' +
      '<p>' + icon('sparkles') + ' Loading step content...</p>' +
      '<p class="scp-text-muted scp-text-xs">This step will be available when all components are loaded.</p></div>';
  }

  window._scpRenderPostsView = renderPostsView;
  window._scpRenderPostListItem = renderPostListItem;

})(jQuery);


/* ----- src/core/views/calendar.js ----- */

/**
 * @category    core
 * @purpose     Calendar view (month + week toggle). Filters by platform, type,
 *              status, tag. Renders post chips per day (drag-and-drop ready)
 *              and a hover popover with post detail.
 * @exports     window._scpRenderCalendarView
 *              window._scpRenderCalendarPopover (used by event handlers)
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpFormatDateShort,
 *              window._scpGetAllTags, window._scpStatusBadge,
 *              window._scpTypeBadge, window._scpPriorityBadge,
 *              window._scpPlatformBadge, window._scpConstants
 * @extracted-from  src/core/scp-part1.js (was SECTION 10 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, formatDateShort, getAllTags;
  var statusBadge, typeBadge, priorityBadge, platformBadge, Constants;
  var POST_TYPES, POST_STATUSES, PLATFORMS;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    truncate = window._scpTruncate;
    formatDateShort = window._scpFormatDateShort;
    getAllTags = window._scpGetAllTags;
    statusBadge = window._scpStatusBadge;
    typeBadge = window._scpTypeBadge;
    priorityBadge = window._scpPriorityBadge;
    platformBadge = window._scpPlatformBadge;
    Constants = window._scpConstants;
    POST_TYPES = Constants.POST_TYPES;
    POST_STATUSES = Constants.POST_STATUSES;
    PLATFORMS = Constants.PLATFORMS;
  }

  // ============================================================
  // SECTION 10: CALENDAR VIEW
  // ============================================================

  function renderCalendarView() {
    _resolveHelpers();
    var now = new Date();
    if (S.calendarYear === null) S.calendarYear = now.getFullYear();
    if (S.calendarMonth === null) S.calendarMonth = now.getMonth();

    var year = S.calendarYear; var month = S.calendarMonth;
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var dayNamesFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var mode = S.calendarMode || 'month';

    // Filter posts
    var allPosts = getCalendarPosts();
    var postsByDate = {};
    allPosts.forEach(function(p) {
      if (p.schedule && p.schedule.date) {
        postsByDate[p.schedule.date] = postsByDate[p.schedule.date] || [];
        postsByDate[p.schedule.date].push(p);
      }
    });

    var html = '<div class="scp-view scp-view-calendar">';

    // â”€â”€â”€ Header: Title + Mode toggle + Navigation â”€â”€â”€
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('calendar') + ' Calendar</h1>';
    html += '<div class="scp-cal-mode-toggle">';
    html += '<button class="scp-cal-mode-btn' + (mode === 'month' ? ' scp-cal-mode-active' : '') + '" data-action="cal-mode" data-mode="month">Month</button>';
    html += '<button class="scp-cal-mode-btn' + (mode === 'week' ? ' scp-cal-mode-active' : '') + '" data-action="cal-mode" data-mode="week">Week</button>';
    html += '</div></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="cal-prev">' + icon('chevron-left') + '</button>';
    if (mode === 'month') {
      html += '<span class="scp-cal-title">' + monthNames[month] + ' ' + year + '</span>';
    } else {
      var ws = getWeekStart(year, month);
      var we = new Date(ws); we.setDate(we.getDate() + 6);
      html += '<span class="scp-cal-title">' + formatDateShort(ws.toISOString()) + ' â€“ ' + formatDateShort(we.toISOString()) + '</span>';
    }
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="cal-next">' + icon('chevron-right') + '</button>';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="cal-today">Today</button>';
    html += '</div></div>';

    // â”€â”€â”€ Filter bar â”€â”€â”€
    html += renderCalendarFilters();

    // â”€â”€â”€ Month or Week view â”€â”€â”€
    if (mode === 'month') {
      html += renderMonthGrid(year, month, dayNames, postsByDate, now);
    } else {
      html += renderWeekGrid(year, month, dayNamesFull, postsByDate, now);
    }

    // â”€â”€â”€ Popover (rendered if active) â”€â”€â”€
    html += '<div id="scpCalPopover" class="scp-cal-popover" style="display:none"></div>';

    html += '</div>';
    return html;
  }

  function getCalendarPosts() {
    var f = S.calendarFilters || {};
    var posts = (S.data.posts || []).filter(function(p) { return p.schedule && p.schedule.date; });
    if (f.platforms && f.platforms.length > 0) posts = posts.filter(function(p) { return (p.platforms || []).some(function(pk) { return f.platforms.indexOf(pk) > -1; }); });
    if (f.types && f.types.length > 0) posts = posts.filter(function(p) { return f.types.indexOf(p.type) > -1; });
    if (f.status) posts = posts.filter(function(p) { return p.status === f.status; });
    if (f.tag) posts = posts.filter(function(p) { return (p.tags || []).indexOf(f.tag) > -1; });
    return posts;
  }

  function getWeekStart(year, month) {
    if (S.calendarWeekStart) return new Date(S.calendarWeekStart);
    var d = new Date(year, month, 1);
    var dow = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - dow);
    return d;
  }

  function renderCalendarFilters() {
    var f = S.calendarFilters || {};
    var html = '<div class="scp-cal-filters">';
    // Platform chips
    html += '<div class="scp-cal-filter-group">';
    for (var pk in PLATFORMS) {
      var pl = PLATFORMS[pk]; var active = (f.platforms || []).indexOf(pk) > -1;
      html += '<button class="scp-cal-filter-chip' + (active ? ' scp-cal-filter-chip-active' : '') + '" data-action="cal-filter-platform" data-platform="' + pk + '" style="--chip-color:' + pl.color + '">' + icon(pl.icon) + '</button>';
    }
    html += '</div>';
    // Type chips
    html += '<div class="scp-cal-filter-group">';
    for (var tk in POST_TYPES) {
      var pt = POST_TYPES[tk]; var tActive = (f.types || []).indexOf(tk) > -1;
      html += '<button class="scp-cal-filter-chip' + (tActive ? ' scp-cal-filter-chip-active' : '') + '" data-action="cal-filter-type" data-type="' + tk + '" style="--chip-color:' + pt.color + '">' + icon(pt.icon) + '</button>';
    }
    html += '</div>';
    // Status dropdown
    html += '<select class="scp-select scp-select-sm scp-cal-status-filter">';
    html += '<option value="">All Statuses</option>';
    for (var sk in POST_STATUSES) {
      if (sk === 'archived') continue;
      html += '<option value="' + sk + '"' + (f.status === sk ? ' selected' : '') + '>' + POST_STATUSES[sk].label + '</option>';
    }
    html += '</select>';
    // Tag dropdown
    var tags = getAllTags();
    if (tags.length > 0) {
      html += '<select class="scp-select scp-select-sm scp-cal-tag-filter">';
      html += '<option value="">All Tags</option>';
      for (var ti = 0; ti < tags.length; ti++) html += '<option value="' + esc(tags[ti].id) + '"' + (f.tag === tags[ti].id ? ' selected' : '') + '>' + esc(tags[ti].name) + '</option>';
      html += '</select>';
    }
    // Active filter count
    var activeCount = (f.platforms || []).length + (f.types || []).length + (f.status ? 1 : 0) + (f.tag ? 1 : 0);
    if (activeCount > 0) html += '<button class="scp-btn-link" data-action="cal-clear-filters">' + icon('x') + ' Clear (' + activeCount + ')</button>';
    html += '</div>';
    return html;
  }

  function renderMonthGrid(year, month, dayNames, postsByDate, now) {
    var firstDay = new Date(year, month, 1);
    var startDow = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate(); var todayMonth = now.getMonth(); var todayYear = now.getFullYear();

    var html = '<div class="scp-calendar-grid">';
    for (var dh = 0; dh < 7; dh++) html += '<div class="scp-cal-header">' + dayNames[dh] + '</div>';

    var totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
    for (var c = 0; c < totalCells; c++) {
      var dayNum = c - startDow + 1;
      var isValid = dayNum >= 1 && dayNum <= daysInMonth;
      var isToday = isValid && dayNum === today && month === todayMonth && year === todayYear;
      var dateStr = isValid ? year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0') : '';
      var dayPosts = isValid && postsByDate[dateStr] ? postsByDate[dateStr] : [];

      html += '<div class="scp-cal-day' + (isValid ? '' : ' scp-cal-day-empty') + (isToday ? ' scp-cal-day-today' : '') + '"';
      if (isValid) html += ' data-date="' + dateStr + '" data-action="cal-day-click"';
      // Drop target for drag-drop
      if (isValid) html += ' ondragover="event.preventDefault();this.classList.add(\'scp-cal-day-drop\')" ondragleave="this.classList.remove(\'scp-cal-day-drop\')" ondrop="this.classList.remove(\'scp-cal-day-drop\')"';
      html += '>';
      if (isValid) {
        html += '<div class="scp-cal-day-header"><span class="scp-cal-day-num">' + dayNum + '</span>';
        if (dayPosts.length > 0) html += '<span class="scp-cal-day-count">' + dayPosts.length + '</span>';
        html += '</div>';
        for (var dpi = 0; dpi < Math.min(dayPosts.length, 3); dpi++) {
          html += renderCalendarPostChip(dayPosts[dpi]);
        }
        if (dayPosts.length > 3) html += '<div class="scp-cal-more" data-action="cal-day-click" data-date="' + dateStr + '">+' + (dayPosts.length - 3) + ' more</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderWeekGrid(year, month, dayNamesFull, postsByDate, now) {
    var ws = getWeekStart(year, month);
    var todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    var html = '<div class="scp-cal-week">';
    for (var d = 0; d < 7; d++) {
      var dayDate = new Date(ws); dayDate.setDate(dayDate.getDate() + d);
      var dateStr = dayDate.getFullYear() + '-' + String(dayDate.getMonth() + 1).padStart(2, '0') + '-' + String(dayDate.getDate()).padStart(2, '0');
      var isToday = dateStr === todayStr;
      var dayPosts = postsByDate[dateStr] || [];

      html += '<div class="scp-cal-week-day' + (isToday ? ' scp-cal-week-day-today' : '') + '" data-date="' + dateStr + '"';
      html += ' ondragover="event.preventDefault();this.classList.add(\'scp-cal-day-drop\')" ondragleave="this.classList.remove(\'scp-cal-day-drop\')" ondrop="this.classList.remove(\'scp-cal-day-drop\')">';
      html += '<div class="scp-cal-week-header">';
      html += '<span class="scp-cal-week-dayname">' + dayNamesFull[d] + '</span>';
      html += '<span class="scp-cal-week-date' + (isToday ? ' scp-cal-week-date-today' : '') + '">' + dayDate.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dayDate.getMonth()] + '</span>';
      if (dayPosts.length > 0) html += '<span class="scp-cal-day-count">' + dayPosts.length + '</span>';
      html += '</div>';

      html += '<div class="scp-cal-week-posts">';
      for (var pi = 0; pi < dayPosts.length; pi++) {
        html += renderCalendarWeekCard(dayPosts[pi]);
      }
      // Add post button
      html += '<button class="scp-cal-add-btn" data-action="cal-new-post" data-date="' + dateStr + '">' + icon('plus') + '</button>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function renderCalendarPostChip(post) {
    var pt = POST_TYPES[post.type] || { color: '#80868b', icon: 'circle' };
    var time = (post.schedule && post.schedule.time) ? post.schedule.time.substring(0, 5) : '';
    var html = '<div class="scp-cal-post" style="background:' + pt.color + '15;color:' + pt.color + '"';
    html += ' data-id="' + esc(post.id) + '" draggable="true"';
    html += ' data-action="cal-post-hover" title="' + esc(post.title) + '">';
    html += '<span class="scp-cal-post-icon">' + icon(pt.icon) + '</span>';
    if (time) html += '<span class="scp-cal-post-time">' + time + '</span>';
    html += '<span class="scp-cal-post-title">' + esc(truncate(post.title, 16)) + '</span>';
    html += '</div>';
    return html;
  }

  function renderCalendarWeekCard(post) {
    var pt = POST_TYPES[post.type] || { color: '#80868b', icon: 'circle' };
    var st = POST_STATUSES[post.status] || { color: '#80868b', label: post.status };
    var time = (post.schedule && post.schedule.time) ? post.schedule.time.substring(0, 5) : '';
    var html = '<div class="scp-cal-week-card" style="border-left-color:' + pt.color + '" data-id="' + esc(post.id) + '" draggable="true" data-action="cal-post-hover">';
    html += '<div class="scp-cal-week-card-top">';
    html += '<span class="scp-cal-week-card-type" style="color:' + pt.color + '">' + icon(pt.icon) + '</span>';
    html += '<strong>' + esc(truncate(post.title, 28)) + '</strong>';
    html += '</div>';
    html += '<div class="scp-cal-week-card-meta">';
    if (time) html += '<span>' + icon('clock') + ' ' + time + '</span>';
    html += '<span>' + statusBadge(post.status) + '</span>';
    var plats = post.platforms || [];
    if (plats.length > 0) {
      html += '<span class="scp-cal-week-card-plats">';
      for (var i = 0; i < Math.min(plats.length, 3); i++) html += icon(PLATFORMS[plats[i]] ? PLATFORMS[plats[i]].icon : 'globe');
      html += '</span>';
    }
    html += '</div></div>';
    return html;
  }

  function renderCalendarPopover(post) {
    if (!esc) _resolveHelpers();
    if (!post) return '';
    var pt = POST_TYPES[post.type] || { color: '#80868b', icon: 'circle', label: post.type };
    var time = (post.schedule && post.schedule.time) ? post.schedule.time.substring(0, 5) : '';
    var html = '<div class="scp-cal-pop-header">';
    html += '<span style="color:' + pt.color + '">' + icon(pt.icon) + '</span>';
    html += '<strong>' + esc(post.title || 'Untitled') + '</strong>';
    html += '<button class="scp-btn-icon scp-cal-pop-close" data-action="cal-pop-close">' + icon('x') + '</button>';
    html += '</div>';
    html += '<div class="scp-cal-pop-badges">';
    html += typeBadge(post.type) + ' ' + statusBadge(post.status);
    if (post.priority && post.priority !== 'medium') html += ' ' + priorityBadge(post.priority);
    html += '</div>';
    // Platforms
    if (post.platforms && post.platforms.length > 0) {
      html += '<div class="scp-cal-pop-plats">';
      for (var pi = 0; pi < post.platforms.length; pi++) html += platformBadge(post.platforms[pi]);
      html += '</div>';
    }
    // Content preview
    if (post.content && post.content.body) {
      html += '<div class="scp-cal-pop-preview">' + esc(truncate(post.content.body, 120)) + '</div>';
    }
    // Schedule
    if (time) html += '<div class="scp-cal-pop-time">' + icon('clock') + ' Scheduled at ' + time + '</div>';
    // Actions
    html += '<div class="scp-cal-pop-actions">';
    html += '<button class="scp-btn scp-btn-sm scp-btn-primary" data-action="select-post" data-id="' + esc(post.id) + '">' + icon('pen') + ' Open</button>';
    html += '</div>';
    return html;
  }

  window._scpRenderCalendarView = renderCalendarView;
  window._scpRenderCalendarPopover = renderCalendarPopover;

})(jQuery);


/* ----- src/core/views/tags.js ----- */

/**
 * @category    core
 * @purpose     Tags view. List (grid of tag cards with counts) and detail
 *              view (stats + post list filtered by tag). Reuses the
 *              renderStatCard and renderPostListItem primitives exposed by
 *              dashboard.js / posts.js.
 * @exports     window._scpRenderTagsView
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpGetAllTags, window._scpGetTagPosts,
 *              window._scpBadge, window._scpRenderStatCard,
 *              window._scpRenderPostListItem, window._scpConstants
 * @extracted-from  src/core/scp-part1.js (was SECTION 11 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, getAllTags, getTagPosts, badge;
  var renderStatCard, renderPostListItem, Constants;
  var ACTIVE_STATUSES;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    truncate = window._scpTruncate;
    getAllTags = window._scpGetAllTags;
    getTagPosts = window._scpGetTagPosts;
    badge = window._scpBadge;
    renderStatCard = window._scpRenderStatCard;
    renderPostListItem = window._scpRenderPostListItem;
    Constants = window._scpConstants;
    ACTIVE_STATUSES = Constants.ACTIVE_STATUSES;
  }

  // ============================================================
  // SECTION 11: TAGS VIEW
  // ============================================================

  function renderTagsView() {
    _resolveHelpers();
    if (S.selectedTagId && S.tagMap[S.selectedTagId]) {
      return renderTagDetailView(S.tagMap[S.selectedTagId]);
    }
    return renderTagListView();
  }

  function renderTagListView() {
    var tags = getAllTags();
    var html = '<div class="scp-view scp-view-tags">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('tags') + ' Tags</h1>';
    html += '<span class="scp-view-subtitle">' + tags.length + ' tags</span></div>';
    html += '<div class="scp-view-header-right"><button class="scp-btn scp-btn-primary" data-action="new-tag">' + icon('plus') + ' New Tag</button></div></div>';

    if (tags.length === 0) {
      html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('tags') + '</div>';
      html += '<div class="scp-empty-state-title">No tags yet</div>';
      html += '<div class="scp-empty-state-text">Create tags to organize your posts into campaigns, topics, or themes.</div>';
      html += '<button class="scp-btn scp-btn-primary" data-action="new-tag">' + icon('plus') + ' Create Tag</button></div>';
    } else {
      html += '<div class="scp-card-grid">';
      for (var i = 0; i < tags.length; i++) html += renderTagCard(tags[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderTagCard(tag) {
    var postCount = (S.tagIndex[tag.id] || []).length;
    var tagPosts = getTagPosts(tag.id);
    var publishedCount = tagPosts.filter(function(p) { return p.status === 'published'; }).length;
    var activeCount = tagPosts.filter(function(p) { return ACTIVE_STATUSES.indexOf(p.status) > -1; }).length;

    var html = '<div class="scp-tag-card" data-action="select-tag" data-id="' + esc(tag.id) + '">';
    html += '<div class="scp-tag-card-header">';
    html += '<div class="scp-tag-card-color" style="background:' + tag.color + '"></div>';
    html += '<div class="scp-tag-card-info"><h3>' + esc(tag.name) + '</h3>';
    if (tag.description) html += '<p>' + esc(truncate(tag.description, 60)) + '</p>';
    html += '</div>';
    html += '<div class="scp-tag-card-count" style="color:' + tag.color + '">' + postCount + '</div>';
    html += '</div>';
    html += '<div class="scp-tag-card-badges">';
    if (activeCount > 0) html += badge(activeCount + ' active', '#1a73e8');
    if (publishedCount > 0) html += badge(publishedCount + ' published', '#059669');
    html += '</div></div>';
    return html;
  }

  function renderTagDetailView(tag) {
    var tagPosts = getTagPosts(tag.id);
    var publishedCount = tagPosts.filter(function(p) { return p.status === 'published'; }).length;
    var activeCount = tagPosts.filter(function(p) { return ACTIVE_STATUSES.indexOf(p.status) > -1; }).length;
    var scheduledCount = tagPosts.filter(function(p) { return p.status === 'scheduled'; }).length;

    var html = '<div class="scp-view scp-view-tag-detail">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="back-to-tags">' + icon('arrow-left') + ' Tags</button>';
    html += '<span class="scp-tag-detail-dot" style="background:' + tag.color + '"></span>';
    html += '<h1>' + esc(tag.name) + '</h1></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="edit-tag" data-id="' + esc(tag.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-tag" data-id="' + esc(tag.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (tag.description) html += '<p class="scp-tag-detail-desc">' + esc(tag.description) + '</p>';

    // Stats
    html += '<div class="scp-dash-stats">';
    html += renderStatCard('Total Posts', tagPosts.length, '', tag.color);
    html += renderStatCard('Active', activeCount, 'In pipeline', '#1a73e8');
    html += renderStatCard('Published', publishedCount, '', '#059669');
    html += renderStatCard('Scheduled', scheduledCount, '', '#0d9488');
    html += '</div>';

    // Posts list
    html += '<div class="scp-section"><div class="scp-section-header"><h2>Posts</h2></div>';
    if (tagPosts.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No posts with this tag yet.</p></div>';
    } else {
      for (var i = 0; i < tagPosts.length; i++) html += renderPostListItem(tagPosts[i]);
    }
    html += '</div></div>';
    return html;
  }

  window._scpRenderTagsView = renderTagsView;

})(jQuery);


/* ----- src/core/views/activity.js ----- */

/**
 * @category    core
 * @purpose     Activity log view. Search and type-filter over S.activity entries.
 *              Reuses renderActivityItem from views/dashboard.js.
 * @exports     window._scpRenderActivityView
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpRenderActivityItem, window._scpConstants
 * @extracted-from  src/core/scp-part1.js (was SECTION 12 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, renderActivityItem, Constants, ACTIVITY_TYPES;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    renderActivityItem = window._scpRenderActivityItem;
    Constants = window._scpConstants;
    ACTIVITY_TYPES = Constants.ACTIVITY_TYPES;
  }

  // ============================================================
  // SECTION 12: ACTIVITY VIEW
  // ============================================================

  function renderActivityView() {
    _resolveHelpers();
    var f = S.activityFilter;
    var allActs = (S.activity || []).slice().reverse();
    // Filter
    var filtered = allActs.filter(function(a) {
      if (f.search) {
        var q = f.search.toLowerCase();
        var inDesc = (a.description || '').toLowerCase().indexOf(q) > -1;
        var inTitle = (a.post_title || '').toLowerCase().indexOf(q) > -1;
        var inType = (a.type || '').replace(/_/g, ' ').toLowerCase().indexOf(q) > -1;
        if (!inDesc && !inTitle && !inType) return false;
      }
      if (f.type && a.type !== f.type) return false;
      return true;
    });

    var html = '<div class="scp-view scp-view-activity">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('clock-rotate-left') + ' Activity</h1>';
    html += '<span class="scp-view-subtitle">' + filtered.length + ' entries</span></div>';
    html += '<div class="scp-view-header-right">';
    html += '<div class="scp-search-wrapper scp-search-sm">' + icon('search') + '<input type="text" class="scp-input" id="scpActivitySearch" placeholder="Search..." value="' + esc(f.search) + '"></div>';
    html += '<select class="scp-select scp-select-sm" id="scpActivityTypeFilter"><option value="">All Types</option>';
    for (var at in ACTIVITY_TYPES) html += '<option value="' + at + '"' + (f.type === at ? ' selected' : '') + '>' + at.replace(/_/g, ' ') + '</option>';
    html += '</select></div></div>';

    if (filtered.length === 0) {
      html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('clock-rotate-left') + '</div><div class="scp-empty-state-title">No activity</div></div>';
    } else {
      html += '<div class="scp-activity-list scp-activity-list--full">';
      for (var i = 0; i < filtered.length; i++) html += renderActivityItem(filtered[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  window._scpRenderActivityView = renderActivityView;

})(jQuery);


/* ----- src/core/scp-part1.js ----- */

/**
 * Social Content Planner v1.0 - Part 1: Core Engine
 *
 * Single-brand social media content planning app with research,
 * 6-step post pipeline, 4 post types, 4 platforms, and flexible tag grouping.
 *
 * Sections:
 *  1. Constants (12 objects)
 *  2. State object
 *  3. Initialization
 *  4. Map builders
 *  5. Navigation
 *  6. Utilities (icons 90+, badges, getters)
 *  7. App shell (header, sidebar, 7 nav items)
 *  8. Dashboard view (6 panels)
 *  9. Posts view (split pane: grouped list + pipeline editor shell)
 * 10. Calendar view
 * 11. Tags view (list + detail)
 * 12. Activity view
 * 13. Placeholder views (research, settings)
 * 14. Post filtering & sorting
 * 15. Event handlers
 * 16. CRUD helpers
 * 17. Sync & save
 * 18. Toast & auto-status engine
 * 19. API exports (~60)
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  window._scpRenderers = window._scpRenderers || {};

  // ============================================================
  // SECTION 1: CONSTANTS
  // ============================================================

  var APP_VIEWS = {
    'dashboard': { order: 1, label: 'Dashboard',  icon: 'chart-pie',          description: 'Overview & pipeline' },
    'research':  { order: 2, label: 'Research',   icon: 'flask',              description: 'AI-powered ideation' },
    'posts':     { order: 3, label: 'Posts',      icon: 'thumbtack',          description: 'Content pipeline' },
    'calendar':  { order: 4, label: 'Calendar',   icon: 'calendar',           description: 'Schedule view' },
    'images':    { order: 5, label: 'Images',     icon: 'images',             description: 'Reference image library' },
    'tags':      { order: 6, label: 'Tags',       icon: 'tags',               description: 'Campaign & topic tags' },
    'activity':  { order: 7, label: 'Activity',   icon: 'clock-rotate-left',  description: 'Full activity log' },
    'settings':  { order: 8, label: 'Settings',   icon: 'gear',               description: 'Workspace configuration' }
  };

  var POST_TYPES = {
    'image':    { key: 'image',    label: 'Single Image', icon: 'image',      color: '#1a73e8' },
    'carousel': { key: 'carousel', label: 'Carousel',     icon: 'images',     color: '#7c3aed' },
    'video':    { key: 'video',    label: 'Video',        icon: 'video',      color: '#d93025' },
    'text':     { key: 'text',     label: 'Text Only',    icon: 'align-left', color: '#0d904f' }
  };

  var PLATFORMS = {
    'linkedin':  { key: 'linkedin',  label: 'LinkedIn',  icon: 'linkedin',  brandIcon: true, color: '#0077b5' },
    'instagram': { key: 'instagram', label: 'Instagram', icon: 'instagram', brandIcon: true, color: '#e4405f' },
    'facebook':  { key: 'facebook',  label: 'Facebook',  icon: 'facebook',  brandIcon: true, color: '#1877f2' },
    'youtube':   { key: 'youtube',   label: 'YouTube',   icon: 'youtube',   brandIcon: true, color: '#ff0000' }
  };

  var POST_STATUSES = {
    'idea':            { key: 'idea',            label: 'Idea',       icon: 'lightbulb',       color: '#e37400', order: 0 },
    'research':        { key: 'research',        label: 'Research',   icon: 'flask',           color: '#9334e9', order: 1 },
    'content_writing': { key: 'content_writing', label: 'Content',    icon: 'pen-fancy',       color: '#1a73e8', order: 2 },
    'media_prompts':   { key: 'media_prompts',   label: 'Media',      icon: 'wand-magic',      color: '#7c3aed', order: 3 },
    'platform_adapt':  { key: 'platform_adapt',  label: 'Platforms',  icon: 'share-nodes',     color: '#0891b2', order: 4 },
    'ready':           { key: 'ready',           label: 'Ready',      icon: 'circle-check',    color: '#0d904f', order: 5 },
    'scheduled':       { key: 'scheduled',       label: 'Scheduled',  icon: 'calendar-check',  color: '#0d9488', order: 6 },
    'published':       { key: 'published',       label: 'Published',  icon: 'rocket',          color: '#059669', order: 7 },
    'archived':        { key: 'archived',        label: 'Archived',   icon: 'box-archive',     color: '#80868b', order: 8 }
  };

  var STATUS_ORDER = ['idea', 'research', 'content_writing', 'media_prompts', 'platform_adapt', 'ready', 'scheduled', 'published', 'archived'];
  var ACTIVE_STATUSES = ['idea', 'research', 'content_writing', 'media_prompts', 'platform_adapt', 'ready', 'scheduled'];

  var WORKFLOW_GROUPS = {
    'todo':      { key: 'todo',      label: 'To Do',     icon: 'clipboard-list', color: '#e37400', statuses: ['idea'] },
    'working':   { key: 'working',   label: 'Working',   icon: 'hammer',         color: '#1a73e8', statuses: ['research', 'content_writing', 'media_prompts', 'platform_adapt', 'ready', 'scheduled'] },
    'published': { key: 'published', label: 'Published', icon: 'rocket',         color: '#059669', statuses: ['published'] },
    'trashed':   { key: 'trashed',   label: 'Trashed',   icon: 'box-archive',    color: '#80868b', statuses: ['archived'] }
  };

  var GROUPING_OPTIONS = [
    { key: 'workflow', label: 'Workflow' },
    { key: 'status',   label: 'Status' },
    { key: 'type',     label: 'Type' },
    { key: 'platform', label: 'Platform' },
    { key: 'tag',      label: 'Tag' },
    { key: 'priority', label: 'Priority' }
  ];

  var PIPELINE_STEPS = [
    { key: 'basics',    label: 'Basics',     icon: 'info-circle', order: 0 },
    { key: 'research',  label: 'Research',   icon: 'flask',       order: 1 },
    { key: 'content',   label: 'Content',    icon: 'pen-fancy',   order: 2 },
    { key: 'media',     label: 'Media',      icon: 'wand-magic',  order: 3, skipForText: true },
    { key: 'platforms', label: 'Platforms',  icon: 'share-nodes', order: 4 },
    { key: 'schedule',  label: 'Schedule',   icon: 'calendar',    order: 5 }
  ];

  var PRIORITY_LEVELS = {
    'low':    { key: 'low',    label: 'Low',    icon: 'arrow-down', color: '#0d904f' },
    'medium': { key: 'medium', label: 'Medium', icon: 'minus',      color: '#e37400' },
    'high':   { key: 'high',   label: 'High',   icon: 'arrow-up',   color: '#d93025' },
    'urgent': { key: 'urgent', label: 'Urgent', icon: 'bolt',       color: '#be123c' }
  };

  var ACTIVITY_TYPES = {
    'post_created':            { icon: 'plus',        color: '#0d904f' },
    'post_updated':            { icon: 'edit',        color: '#1a73e8' },
    'post_deleted':            { icon: 'trash',       color: '#d93025' },
    'post_status_changed':     { icon: 'refresh',     color: '#1a73e8' },
    'post_promoted':           { icon: 'arrow-right', color: '#0d904f' },
    'post_archived':           { icon: 'box-archive', color: '#80868b' },
    'post_rescheduled':        { icon: 'calendar',    color: '#0891b2' },
    'research_created':        { icon: 'flask',       color: '#9334e9' },
    'research_completed':      { icon: 'sparkles',    color: '#9334e9' },
    'content_written':         { icon: 'pen-fancy',   color: '#1a73e8' },
    'content_improved':        { icon: 'pen',         color: '#0891b2' },
    'slides_planned':          { icon: 'images',      color: '#7c3aed' },
    'script_generated':        { icon: 'video',       color: '#d93025' },
    'media_prompts_generated': { icon: 'wand-magic',  color: '#7c3aed' },
    'media_prompts_built':     { icon: 'hammer',      color: '#7c3aed' },
    'media_prompts_enhanced':  { icon: 'sparkles',    color: '#7c3aed' },
    'visual_plan_created':     { icon: 'image',       color: '#7c3aed' },
    'structured_script_created': { icon: 'video',     color: '#d93025' },
    'platform_adapted':        { icon: 'share-nodes', color: '#0891b2' },
    'angles_researched':       { icon: 'flask',       color: '#e37400' },
    'hooks_researched':        { icon: 'sparkles',    color: '#9334e9' },
    'image_uploaded':          { icon: 'upload',      color: '#0d904f' },
    'tag_created':             { icon: 'tag',         color: '#0d904f' },
    'tag_updated':             { icon: 'tag',         color: '#1a73e8' },
    'tag_deleted':             { icon: 'trash',       color: '#d93025' },
    'settings_changed':        { icon: 'gear',        color: '#80868b' },
    'data_imported':           { icon: 'upload',      color: '#1a73e8' },
    'data_exported':           { icon: 'download',    color: '#1a73e8' }
  };

  var CARD_DENSITIES = {
    'compact':  { label: 'Compact',  icon: 'list',       rowHeight: 40 },
    'normal':   { label: 'Normal',   icon: 'menu',       rowHeight: 56 },
    'detailed': { label: 'Detailed', icon: 'layout-grid', rowHeight: 72 }
  };

  var MEDIA_PROMPT_STATUSES = {
    'draft': { label: 'Draft', color: '#e37400' },
    'final': { label: 'Final', color: '#0d904f' }
  };

  // ============================================================
  // SECTION 2: STATE OBJECT
  // ============================================================

  var S = {
    data: { posts: [], research: { sessions: [] }, tags: [] },
    meta: { workspace: {}, settings: {}, aiPreferences: {} },
    activity: [],
    user: { id: '', name: '', email: '', fullName: '', timezone: '', roles: '' },
    brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },
    // Lookup maps
    postMap: {}, tagMap: {}, researchMap: {}, toneMap: {}, audienceMap: {}, imageStyleMap: {},
    // Aggregated counts
    statusCounts: {}, typeCounts: {}, platformCounts: {}, tagIndex: {},
    totalPosts: 0, activePosts: 0, publishedPosts: 0,
    // UI state
    currentView: 'dashboard', previousView: null,
    selectedPostId: null, currentStep: 'basics',
    cardDensity: 'normal', settingsTab: 'workspace',
    // Posts view state
    postGroupBy: 'workflow',
    postFilter: { search: '', statuses: [], type: '', platform: '', tag: '', priority: '', sortBy: 'updated', sortDir: 'desc' },
    collapsedGroups: {},
    // Activity view state
    activityFilter: { search: '', type: '' },
    // Tags view state
    selectedTagId: null,
    // Images view state
    images: [], imageMap: {}, $imageField: null,
    selectedImageId: null,
    imageFilter: { search: '', category: '', style: '', tag: '', star: false, sort: 'newest' },
    imageViewMode: 'grid',
    // Calendar state
    calendarYear: null, calendarMonth: null,
    calendarMode: 'month', // 'month' or 'week'
    calendarWeekStart: null, // Date object for week view start
    calendarFilters: { platforms: [], types: [], status: '', tag: '' },
    calendarPopover: null, // { postId, x, y } when showing
    // Shell UI
    sidebarHidden: false,
    // Drupal refs + flags
    $textarea: null, $metaTextarea: null, $activityTextarea: null, $form: null, $submitBtn: null,
    _initializing: false, initialized: false, _part2bTimeout: false, dirty: false, autoSaveTimer: null, lastSaved: null
  };

  // ============================================================
  // SECTION 3: INITIALIZATION
  // ============================================================

  function isScpPage() { return $('body').hasClass('node--type-social-content-planner'); }

  Drupal.behaviors = Drupal.behaviors || {};
  Drupal.behaviors.scpPart1 = {
    attach: function(context) {
      if (S.initialized || S._initializing) return;
      if (!isScpPage()) return;
      if (!$(context).find('#edit-field-json-data-0-value').length && !$(context).find('#edit-field-json-meta-0-value').length && context !== document) return;
      init();
    }
  };

  function init() {
    if (S._initializing || S.initialized) return;
    S._initializing = true;
    console.log('[SCP] Initializing Part 1...');
    parseUserData();
    if (!detectDrupalForm()) { console.error('[SCP] Could not find Drupal form'); S._initializing = false; return; }
    loadData(); migrateMeta(); migrateData(); injectQuillCSS(); buildMaps();
    renderApp(); setupEventHandlers(); startAutoSave();
    S.initialized = true; S._initializing = false;
    console.log('[SCP] Part 1 initialized â€” ' + S.totalPosts + ' posts, ' + (S.data.tags || []).length + ' tags, user: ' + (S.user.name || 'unknown'));

    // Timeout: if Part 2B hasn't loaded in 8 seconds, re-render with helpful messages
    setTimeout(function() {
      var R = window._scpRenderers || {};
      if (!R.researchView || !R.settingsView || !R.imagesView) {
        console.warn('[SCP] Part 2B not loaded after 8s â€” updating placeholders');
        S._part2bTimeout = true;
        if (S.currentView === 'research' || S.currentView === 'settings' || S.currentView === 'images') renderCurrentView();
      }
    }, 8000);
  }

  function parseUserData() {
    var $ud = $('#guau-userdata');
    if (!$ud.length) { console.warn('[SCP] User data div not found'); return; }
    S.user = {
      id: ($ud.find('#guau-userid').text() || '').trim(),
      name: ($ud.find('#guau-username').text() || '').trim(),
      email: ($ud.find('#guau-useremail').text() || '').trim(),
      fullName: ($ud.find('#guau-userfullname').text() || '').trim(),
      timezone: ($ud.find('#guau-usertimezone').text() || '').trim(),
      roles: ($ud.find('#guau-userroles').text() || '').trim()
    };
    console.log('[SCP] User: ' + S.user.fullName + ' (' + S.user.name + ', id=' + S.user.id + ')');
  }

  function detectDrupalForm() {
    var $ta = $('#edit-field-json-data-0-value');
    var $metaTa = $('#edit-field-json-meta-0-value');
    var $actTa = $('#edit-field-activity-log-0-value');
    if (!$ta.length || !$metaTa.length || !$actTa.length) return false;
    S.$textarea = $ta; S.$metaTextarea = $metaTa; S.$activityTextarea = $actTa;
    S.$form = $ta.closest('form');
    S.$submitBtn = S.$form.find('#edit-submit, [data-drupal-selector="edit-submit"]').first();
    S.$textarea.closest('.field--name-field-json-data').hide();
    S.$metaTextarea.closest('.field--name-field-json-meta').hide();
    S.$activityTextarea.closest('.field--name-field-activity-log').hide();
    S.$form.find('.node-form-options, .field--name-title, .form-actions').hide();
    // Detect and hide image field
    S.$imageField = S.$form.find('.field--name-field-images');
    if (S.$imageField.length) {
      S.$imageField.hide();
      console.log('[SCP] Image field detected');
    } else {
      console.log('[SCP] No image field found (field_images)');
    }
    return true;
  }

  function loadData() {
    var rawData = S.$textarea.val();
    if (rawData && rawData.trim()) {
      try { S.data = JSON.parse(rawData); } catch (e) { console.error('[SCP] JSON data parse error:', e); S.data = getDefaultData(); }
    } else { S.data = getDefaultData(); }

    var rawMeta = S.$metaTextarea.val();
    if (rawMeta && rawMeta.trim()) {
      try { S.meta = JSON.parse(rawMeta); } catch (e) { console.error('[SCP] JSON meta parse error:', e); S.meta = getDefaultMeta(); }
    } else { S.meta = getDefaultMeta(); }

    var rawActivity = S.$activityTextarea.val();
    if (rawActivity && rawActivity.trim()) {
      try { S.activity = JSON.parse(rawActivity); } catch (e) { console.error('[SCP] JSON activity parse error:', e); S.activity = []; }
    } else { S.activity = []; }
    if (!Array.isArray(S.activity)) S.activity = [];

    // Parse images from Drupal field after JSON is loaded (metadata comes from meta)
    parseImageField();
  }

  function parseImageField() {
    S.images = []; S.imageMap = {};
    if (!S.$imageField || !S.$imageField.length) return;
    var imgMeta = (S.meta && S.meta.reference_images) || {};

    // Deduplication tracking â€” prevents same image appearing 2-3x
    var _seenUrls = {};
    var _seenFids = {};
    var _imgIdx = 0;

    // Scan Drupal image widget elements â€” use ONLY .image-widget to avoid
    // parent wrapper matches from [data-drupal-selector*="edit-field-images"]
    // which caused duplicates in Drupal 10/11 nested markup
    var $widgets = S.$imageField.find('.image-widget');
    // Fallback: if no .image-widget found, try table rows or fieldset wrappers
    if (!$widgets.length) $widgets = S.$imageField.find('[data-drupal-selector*="edit-field-images-"] > .form-managed-file, .field--type-image .image-widget-data').parent();
    // Final fallback for other Drupal layouts
    if (!$widgets.length) $widgets = S.$imageField.find('.details-wrapper .form-managed-file, .field-multiple-table tbody tr');

    $widgets.each(function() {
      var $widget = $(this);
      // Try multiple selectors for image source (Drupal 10/11 variations)
      var $img = $widget.find('.image-preview img, .image-style-thumbnail, img').first();
      var $fileLink = $widget.find('.file a, a[href*="/files/"]').first();
      var imgUrl = '';
      if ($img.length) imgUrl = $img.attr('src') || '';
      if (!imgUrl && $fileLink.length) imgUrl = $fileLink.attr('href') || '';
      if (!imgUrl) return; // Skip empty upload slots

      // Normalize URL for deduplication (strip query params, protocol)
      var normalizedUrl = imgUrl.replace(/\?.*$/, '').replace(/^https?:/, '');
      if (_seenUrls[normalizedUrl]) return; // SKIP DUPLICATE
      _seenUrls[normalizedUrl] = true;

      // Extract file ID â€” try data-fid, input name parsing, or fallback to index
      var fid = '';
      var $fidInput = $widget.find('input[name*="fids"], input[data-fid]');
      if ($fidInput.length) fid = $fidInput.data('fid') || $fidInput.val() || '';
      if (!fid) {
        // Try extracting from input name pattern: field_images[N][fids]
        var $anyInput = $widget.find('input[name*="field_images"]').first();
        if ($anyInput.length) {
          var match = $anyInput.attr('name').match(/field_images\[(\d+)\]/);
          if (match) fid = 'idx_' + match[1];
        }
      }
      if (!fid) fid = 'img_' + _imgIdx;

      // Skip duplicate fids as well
      if (_seenFids[String(fid)]) return;
      _seenFids[String(fid)] = true;

      var filename = '';
      if ($fileLink.length) filename = $fileLink.text().trim();
      if (!filename && imgUrl) filename = imgUrl.split('/').pop().split('?')[0];

      var alt = $img.attr('alt') || '';

      // Merge with saved metadata
      var meta = imgMeta[fid] || {};

      S.images.push({
        fid: String(fid),
        url: imgUrl,
        filename: filename,
        alt: alt,
        index: _imgIdx,
        category: meta.category || '',
        style: meta.style || '',
        tags: meta.tags || [],
        star: !!meta.star,
        description: meta.description || '',
        notes: meta.notes || '',
        usage: meta.usage || []
      });
      _imgIdx++;
    });

    // Build lookup map
    for (var i = 0; i < S.images.length; i++) S.imageMap[S.images[i].fid] = S.images[i];
    console.log('[SCP] Parsed ' + S.images.length + ' reference images (deduped)');
  }

  function getImages(filters) {
    var imgs = S.images.slice();
    if (!filters) return imgs;
    if (filters.star) imgs = imgs.filter(function(img) { return img.star; });
    if (filters.category) imgs = imgs.filter(function(img) { return img.category === filters.category; });
    if (filters.style) imgs = imgs.filter(function(img) { return img.style === filters.style; });
    if (filters.tag) imgs = imgs.filter(function(img) { return img.tags.indexOf(filters.tag) > -1; });
    if (filters.search) {
      var q = filters.search.toLowerCase();
      imgs = imgs.filter(function(img) {
        return (img.filename || '').toLowerCase().indexOf(q) > -1 ||
               (img.description || '').toLowerCase().indexOf(q) > -1 ||
               (img.tags || []).some(function(t) { return t.toLowerCase().indexOf(q) > -1; });
      });
    }
    // Sort
    if (filters.sort === 'name') imgs.sort(function(a, b) { return (a.filename || '').localeCompare(b.filename || ''); });
    else if (filters.sort === 'most-used') imgs.sort(function(a, b) { return (b.usage || []).length - (a.usage || []).length; });
    // Default: index order (newest = highest index)
    return imgs;
  }

  function getImageById(fid) { return S.imageMap[fid] || null; }
  function getAllImageTags() {
    var tags = {};
    S.images.forEach(function(img) { (img.tags || []).forEach(function(t) { tags[t] = (tags[t] || 0) + 1; }); });
    return Object.keys(tags).sort();
  }

  function migrateData() {
    var d = S.data;
    d.posts = d.posts || [];
    d.research = d.research || { sessions: [] };
    d.research.sessions = d.research.sessions || [];
    d.tags = d.tags || [];
    // Ensure each post has all required sub-objects
    for (var i = 0; i < d.posts.length; i++) {
      var p = d.posts[i];
      p.tags = p.tags || [];
      p.platforms = p.platforms || [];
      p.source = p.source || { type: 'manual', research_session_id: '', research_idea_id: '', notes: '' };
      p.research = p.research || { angles: [], selected_angle: '', angle_custom_input: '', hooks: [], selected_hook: '', hook_custom_input: '', notes: '' };
      p.content = p.content || { body: '', tone_id: '', audience_id: '', notes: '' };
      p.carousel = p.carousel || { slide_count: 0, slides: [] };
      p.video = p.video || { concept: '', script: '', duration_seconds: 0, format: '' };
      p.media = p.media || { prompts: [], config: { style_id: '', custom_instructions: '', brand_context_enabled: false } };
      p.media.prompts = p.media.prompts || [];
      p.media.config = p.media.config || { style_id: '', custom_instructions: '', brand_context_enabled: false };
      // Phase B: visual plan fields
      if (p.media.visual_plan && typeof p.media.visual_plan !== 'object') p.media.visual_plan = null;
      if (p.media.visual_plans && !Array.isArray(p.media.visual_plans)) p.media.visual_plans = [];
      // Phase B: structured video script
      if (p.video && p.video.structured_script && typeof p.video.structured_script !== 'object') p.video.structured_script = null;
      p.platform_content = p.platform_content || {};
      for (var pk in PLATFORMS) {
        if (!p.platform_content[pk]) {
          if (pk === 'youtube') p.platform_content[pk] = { enabled: false, title: '', description: '', tags: [], notes: '' };
          else p.platform_content[pk] = { enabled: false, body: '', notes: '' };
        }
      }
      p.schedule = p.schedule || { date: '', time: '', timezone: '', published_urls: {} };
      p.schedule.published_urls = p.schedule.published_urls || {};
      p.performance = p.performance || {};
      p.created_by = p.created_by || '';
      p.assigned_to = p.assigned_to || '';
      p.review_notes = p.review_notes || '';
    }
  }

  function migrateMeta() {
    var m = S.meta;
    m.workspace = m.workspace || { name: '', description: '', created: '' };
    m.settings = m.settings || {};
    m.settings.timezone = m.settings.timezone || 'Asia/Kolkata';
    m.settings.card_density = m.settings.card_density || 'normal';
    m.settings.default_view = m.settings.default_view || 'dashboard';
    m.settings.platforms = m.settings.platforms || {};
    if (!m.settings.platforms.linkedin)  m.settings.platforms.linkedin  = { enabled: true,  handle: '', char_limit: 3000,  hashtag_limit: 5,  best_times: [], notes: '' };
    if (!m.settings.platforms.instagram) m.settings.platforms.instagram = { enabled: true,  handle: '', char_limit: 2200,  hashtag_limit: 30, best_times: [], notes: '' };
    if (!m.settings.platforms.facebook)  m.settings.platforms.facebook  = { enabled: true,  handle: '', char_limit: 63206, hashtag_limit: 10, best_times: [], notes: '' };
    if (!m.settings.platforms.youtube)   m.settings.platforms.youtube   = { enabled: true,  handle: '', title_limit: 100,  description_limit: 5000, tag_limit: 500, notes: '' };
    m.settings.defaults = m.settings.defaults || { type: 'image', platforms: ['linkedin'], tone_id: '', audience_id: '', priority: 'medium', tags: [] };
    m.settings.tones = m.settings.tones || getDefaultTones();
    m.settings.audiences = m.settings.audiences || getDefaultAudiences();
    m.settings.image_styles = m.settings.image_styles || getDefaultImageStyles();
    m.settings.media_prompt_templates = m.settings.media_prompt_templates || getDefaultMediaPromptTemplates();
    m.settings.research_templates = m.settings.research_templates || getDefaultResearchTemplates();
    m.aiPreferences = m.aiPreferences || {};
    m.aiPreferences.perAction = m.aiPreferences.perAction || {};
    m.aiPreferences.lastProvider = m.aiPreferences.lastProvider || '';
    m.aiPreferences.lastModel = m.aiPreferences.lastModel || '';
    // Reference image metadata
    m.reference_images = m.reference_images || {};
    m.image_categories = m.image_categories || getDefaultImageCategories();
    // Brand design guide
    m.settings.brand_design = m.settings.brand_design || getDefaultBrandDesign();
    S.cardDensity = m.settings.card_density;
    S.currentView = readHash();
  }

  function getDefaultData() { return { posts: [], research: { sessions: [] }, tags: [] }; }

  function getDefaultMeta() {
    return {
      workspace: { name: '', description: '', created: new Date().toISOString() },
      settings: {
        timezone: 'Asia/Kolkata', card_density: 'normal', default_view: 'dashboard',
        platforms: {
          linkedin:  { enabled: true,  handle: '', char_limit: 3000,  hashtag_limit: 5,  best_times: ['09:00', '12:00', '17:00'], notes: '' },
          instagram: { enabled: true,  handle: '', char_limit: 2200,  hashtag_limit: 30, best_times: ['11:00', '14:00', '19:00'], notes: '' },
          facebook:  { enabled: true,  handle: '', char_limit: 63206, hashtag_limit: 10, best_times: ['09:00', '13:00', '16:00'], notes: '' },
          youtube:   { enabled: true,  handle: '', title_limit: 100,  description_limit: 5000, tag_limit: 500, notes: '' }
        },
        defaults: { type: 'image', platforms: ['linkedin'], tone_id: '', audience_id: '', priority: 'medium', tags: [] },
        tones: getDefaultTones(), audiences: getDefaultAudiences(), image_styles: getDefaultImageStyles(),
        media_prompt_templates: getDefaultMediaPromptTemplates(), research_templates: getDefaultResearchTemplates(),
        brand_design: getDefaultBrandDesign()
      },
      aiPreferences: { appDefault: {}, perAction: {}, lastProvider: '', lastModel: '' },
      reference_images: {},
      image_categories: getDefaultImageCategories()
    };
  }

  function getDefaultTones() {
    return [
      { id: 'tone_001', name: 'Professional', description: 'Authoritative, data-driven, polished' },
      { id: 'tone_002', name: 'Conversational', description: 'Friendly, relatable, approachable' },
      { id: 'tone_003', name: 'Educational', description: 'Teaching, step-by-step, clear' },
      { id: 'tone_004', name: 'Storytelling', description: 'Narrative-driven, personal, engaging' },
      { id: 'tone_005', name: 'Bold / Provocative', description: 'Contrarian, attention-grabbing, punchy' },
      { id: 'tone_006', name: 'Inspirational', description: 'Motivational, uplifting, visionary' }
    ];
  }
  function getDefaultAudiences() {
    return [
      { id: 'aud_001', name: 'Industry Peers', description: 'Professionals in your field' },
      { id: 'aud_002', name: 'Decision Makers', description: 'C-suite, managers, buyers' },
      { id: 'aud_003', name: 'Beginners', description: 'New to the topic' },
      { id: 'aud_004', name: 'Developers', description: 'Technical audience' },
      { id: 'aud_005', name: 'Small Business Owners', description: 'Non-technical, ROI-focused' }
    ];
  }
  function getDefaultImageStyles() {
    return [
      { id: 'is_001', name: 'Photorealistic', description: 'Real photography look' },
      { id: 'is_002', name: 'Flat Illustration', description: 'Clean vector style' },
      { id: 'is_003', name: '3D Render', description: 'Dimensional, glossy' },
      { id: 'is_004', name: 'Minimalist', description: 'Simple, clean, whitespace' },
      { id: 'is_005', name: 'Corporate', description: 'Business, polished' },
      { id: 'is_006', name: 'Branded', description: 'Match brand visual identity' }
    ];
  }
  function getDefaultMediaPromptTemplates() {
    return {
      image: 'Create a {style} image for a {platform} post about: {topic}.\n\nBrand: {brand_name}\nMood: {tone}\nKey message: {hook}\n\n{custom_instructions}',
      carousel_batch: 'Create {count} cohesive images for a {platform} carousel post.\n\nOverall topic: {topic}\nStyle: {style}\nBrand: {brand_name}\n\nSlide themes:\n{slide_themes}\n\nEnsure visual consistency across all slides.\n\n{custom_instructions}',
      thumbnail: 'Create a thumbnail image for a short-form video about: {topic}.\n\nStyle: {style}\nBrand: {brand_name}\nMood: {tone}\nMust be eye-catching and clear at small sizes.\n\n{custom_instructions}'
    };
  }
  function getDefaultResearchTemplates() {
    return [
      { id: 'rt_001', name: 'Topic Ideation', description: 'Generate post ideas for a topic', prompt: 'Generate {count} creative post ideas about: {topic}.\n\nRespond ONLY as a JSON array.', variables: ['topic', 'count', 'platform', 'audience', 'tone', 'custom_instructions'] },
      { id: 'rt_002', name: 'Competitor Analysis', description: 'Differentiated ideas from competitor', prompt: 'Analyze competitor and suggest {count} differentiated ideas.\n\nRespond ONLY as a JSON array.', variables: ['competitor_info', 'brand_info', 'topic', 'count'] },
      { id: 'rt_003', name: 'Content Pillar Expansion', description: 'Expand a content pillar', prompt: 'Expand pillar \'{pillar}\' into {count} diverse ideas.\n\nRespond ONLY as a JSON array.', variables: ['pillar', 'count', 'platforms', 'audience'] }
    ];
  }

  function getDefaultImageCategories() {
    return [
      { id: 'linkedin_post', label: 'LinkedIn Post', icon: 'linkedin', color: '#0077b5' },
      { id: 'carousel_slide', label: 'Carousel Slide', icon: 'images', color: '#7c3aed' },
      { id: 'thumbnail', label: 'Thumbnail', icon: 'video', color: '#d93025' },
      { id: 'logo', label: 'Logo / Branding', icon: 'fingerprint', color: '#0d904f' },
      { id: 'pattern', label: 'Pattern / Texture', icon: 'grid-2', color: '#e37400' },
      { id: 'instagram_post', label: 'Instagram Post', icon: 'instagram', color: '#e4405f' },
      { id: 'other', label: 'Other', icon: 'image', color: '#80868b' }
    ];
  }

  function getDefaultBrandDesign() {
    return {
      colors: { primary: '', secondary: '', accent: '', background: '#ffffff', text: '#202124', palette_description: '' },
      typography: { heading_style: '', body_style: '', text_treatment: '' },
      visual_style: { overall_aesthetic: '', photography_style: '', illustration_style: '', icon_style: '', pattern_usage: '', mood: '' },
      layout_rules: { image_composition: '', carousel_consistency: '', thumbnail_style: '', border_radius: '', spacing: '' },
      reference_image_ids: { primary_style: [], carousel_template: [], thumbnail_template: [] },
      brand_prompt_prefix: ''
    };
  }

  function injectQuillCSS() {
    if (!$('link[href*="quill"]').length) {
      $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css">');
    }
  }

  // ============================================================
  // SECTION 4: MAP BUILDERS
  // ============================================================

  function buildMaps() {
    // Posts
    S.postMap = {}; S.statusCounts = {}; S.typeCounts = {}; S.platformCounts = {}; S.tagIndex = {};
    S.totalPosts = 0; S.activePosts = 0; S.publishedPosts = 0;
    for (var st in POST_STATUSES) S.statusCounts[st] = 0;
    for (var pt in POST_TYPES) S.typeCounts[pt] = 0;
    for (var pk in PLATFORMS) S.platformCounts[pk] = 0;

    var posts = S.data.posts || [];
    for (var pi = 0; pi < posts.length; pi++) {
      var p = posts[pi];
      S.postMap[p.id] = p;
      S.statusCounts[p.status] = (S.statusCounts[p.status] || 0) + 1;
      S.typeCounts[p.type] = (S.typeCounts[p.type] || 0) + 1;
      S.totalPosts++;
      if (ACTIVE_STATUSES.indexOf(p.status) > -1) S.activePosts++;
      else if (p.status === 'published') S.publishedPosts++;
      // Platform counts
      var plats = p.platforms || [];
      for (var pli = 0; pli < plats.length; pli++) S.platformCounts[plats[pli]] = (S.platformCounts[plats[pli]] || 0) + 1;
      // Tag index
      var ptags = p.tags || [];
      for (var ti = 0; ti < ptags.length; ti++) {
        S.tagIndex[ptags[ti]] = S.tagIndex[ptags[ti]] || [];
        S.tagIndex[ptags[ti]].push(p.id);
      }
    }

    // Tags
    S.tagMap = {};
    var tags = S.data.tags || [];
    for (var tgi = 0; tgi < tags.length; tgi++) S.tagMap[tags[tgi].id] = tags[tgi];

    // Research sessions
    S.researchMap = {};
    var sessions = (S.data.research && S.data.research.sessions) || [];
    for (var si = 0; si < sessions.length; si++) S.researchMap[sessions[si].id] = sessions[si];

    // Settings maps
    S.toneMap = {}; S.audienceMap = {}; S.imageStyleMap = {};
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    for (var tni = 0; tni < tones.length; tni++) S.toneMap[tones[tni].id] = tones[tni];
    var auds = (S.meta.settings && S.meta.settings.audiences) || [];
    for (var ai = 0; ai < auds.length; ai++) S.audienceMap[auds[ai].id] = auds[ai];
    var styles = (S.meta.settings && S.meta.settings.image_styles) || [];
    for (var isi = 0; isi < styles.length; isi++) S.imageStyleMap[styles[isi].id] = styles[isi];

    // Image category map
    S.imageCategoryMap = {};
    var cats = (S.meta && S.meta.image_categories) || [];
    for (var ci = 0; ci < cats.length; ci++) S.imageCategoryMap[cats[ci].id] = cats[ci];
  }

  // ============================================================
  // SECTION 5: NAVIGATION
  // ============================================================

  function navigate(viewName, options) {
    options = options || {};
    if (!APP_VIEWS[viewName]) { console.warn('[SCP] Unknown view:', viewName); return; }
    S.previousView = S.currentView; S.currentView = viewName;
    updateSidebarActive(viewName); renderCurrentView();
    if (!options.noHash) updateHash(viewName);
    if (options.scrollTop !== false) $('#scpContent').scrollTop(0);
  }

  function updateHash(v) { if (history.replaceState) history.replaceState(null, null, '#' + v); else window.location.hash = v; }
  function readHash() { var h = window.location.hash.replace('#', ''); return (h && APP_VIEWS[h]) ? h : (S.meta && S.meta.settings && S.meta.settings.default_view) || 'dashboard'; }
  function updateSidebarActive(v) { $('.scp-nav-item').removeClass('scp-nav-item-active'); $('.scp-nav-item[data-view="' + v + '"]').addClass('scp-nav-item-active'); }

  // ============================================================
  // SECTION 6: UTILITIES
  // ============================================================

  // --- Formatters ---
  function formatDate(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function formatDateShort(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  function formatRelativeTime(iso) {
    if (!iso) return '';
    var diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return formatDate(iso);
  }
  function formatNumber(n) { return (n || 0).toLocaleString(); }
  function formatCharCount(current, limit) {
    var pct = limit > 0 ? (current / limit) * 100 : 0;
    var color = pct > 95 ? 'var(--scp-error)' : pct > 80 ? 'var(--scp-warning)' : 'var(--scp-text-muted)';
    return '<span class="scp-char-count" style="color:' + color + '">' + formatNumber(current) + ' / ' + formatNumber(limit) + '</span>';
  }

  // --- Text ---
  function esc(text) { if (!text) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(text)); return d.innerHTML; }
  function truncate(text, max) { if (!text || text.length <= max) return text || ''; return text.substring(0, max) + 'â€¦'; }
  function countWords(text) { return text ? text.trim().split(/\s+/).filter(Boolean).length : 0; }
  function countChars(text) { return text ? text.length : 0; }

  // --- Icons (Font Awesome Pro) ---
  function icon(name, className) {
    className = className || '';
    var icons = {
      'search': 'fa-magnifying-glass', 'lightbulb': 'fa-lightbulb', 'file-text': 'fa-file-lines',
      'sparkles': 'fa-sparkles', 'wand-sparkles': 'fa-wand-magic-sparkles', 'wand-magic': 'fa-wand-magic-sparkles',
      'edit': 'fa-pen-to-square', 'trash': 'fa-trash', 'copy': 'fa-copy',
      'plus': 'fa-plus', 'minus': 'fa-minus', 'x': 'fa-xmark',
      'chevron-down': 'fa-chevron-down', 'chevron-right': 'fa-chevron-right', 'chevron-up': 'fa-chevron-up',
      'chevron-left': 'fa-chevron-left', 'external-link': 'fa-arrow-up-right-from-square',
      'clock': 'fa-clock', 'clock-rotate-left': 'fa-clock-rotate-left',
      'calendar': 'fa-calendar', 'calendar-check': 'fa-calendar-check',
      'target': 'fa-bullseye', 'bolt': 'fa-bolt', 'play': 'fa-play',
      'gear': 'fa-gear', 'settings': 'fa-gear',
      'info': 'fa-circle-info', 'info-circle': 'fa-circle-info',
      'warning': 'fa-triangle-exclamation', 'error': 'fa-circle-xmark',
      'success': 'fa-circle-check', 'circle-check': 'fa-circle-check',
      'star': 'fa-star', 'star-half': 'fa-star-half-stroke',
      'arrow-up': 'fa-arrow-up', 'arrow-down': 'fa-arrow-down', 'arrow-right': 'fa-arrow-right', 'arrow-left': 'fa-arrow-left',
      'video': 'fa-video', 'globe': 'fa-globe', 'archive': 'fa-box-archive', 'box-archive': 'fa-box-archive',
      'link': 'fa-link', 'users': 'fa-users', 'user': 'fa-user',
      'chart-line': 'fa-chart-line', 'chart-pie': 'fa-chart-pie', 'bar-chart': 'fa-chart-bar',
      'eye': 'fa-eye', 'eye-off': 'fa-eye-slash',
      'list': 'fa-list', 'list-ol': 'fa-list-ol', 'menu': 'fa-bars', 'layout-grid': 'fa-grid-2',
      'image': 'fa-image', 'images': 'fa-images',
      'pen-fancy': 'fa-pen-fancy', 'pen': 'fa-pen',
      'align-left': 'fa-align-left', 'align-center': 'fa-align-center',
      'share-nodes': 'fa-share-nodes', 'share': 'fa-share',
      'thumbtack': 'fa-thumbtack', 'bookmark': 'fa-bookmark',
      'rocket': 'fa-rocket', 'paper-plane': 'fa-paper-plane',
      'flask': 'fa-flask', 'flask-vial': 'fa-flask-vial',
      'clipboard-list': 'fa-clipboard-list', 'hammer': 'fa-hammer',
      'tag': 'fa-tag', 'tags': 'fa-tags',
      'hashtag': 'fa-hashtag', 'at': 'fa-at',
      'face-smile': 'fa-face-smile', 'bold': 'fa-bold', 'italic': 'fa-italic',
      'refresh': 'fa-arrows-rotate', 'download': 'fa-download', 'upload': 'fa-upload',
      'key': 'fa-key', 'lock': 'fa-lock', 'shield': 'fa-shield',
      'cube': 'fa-cube', 'shapes': 'fa-shapes', 'briefcase': 'fa-briefcase',
      'layer-group': 'fa-layer-group', 'palette': 'fa-palette',
      'panel-left': 'fa-angles-right', 'panel-left-close': 'fa-angles-left',
      'circle': 'fa-circle', 'check': 'fa-check',
      'grip-vertical': 'fa-grip-vertical', 'ellipsis': 'fa-ellipsis',
      'filter': 'fa-filter', 'sort': 'fa-sort',
      'expand': 'fa-expand', 'compress': 'fa-compress',
      'spinner': 'fa-spinner fa-spin', 'circle-xmark': 'fa-circle-xmark',
      'fingerprint': 'fa-fingerprint', 'grid-2': 'fa-grid-2',
      'wand-magic': 'fa-wand-magic-sparkles', 'sliders': 'fa-sliders',
      'font': 'fa-font', 'search': 'fa-magnifying-glass',
      // Brand icons (use fab class)
      'youtube': 'fa-youtube', 'instagram': 'fa-instagram', 'facebook': 'fa-facebook',
      'linkedin': 'fa-linkedin', 'tiktok': 'fa-tiktok', 'twitter': 'fa-x-twitter'
    };
    var brandIcons = { youtube: 1, instagram: 1, facebook: 1, linkedin: 1, tiktok: 1, twitter: 1 };
    var faClass = icons[name] || 'fa-' + name;
    return '<i class="' + (brandIcons[name] ? 'fab' : 'fas') + ' ' + faClass + (className ? ' ' + className : '') + ' scp-icon"></i>';
  }

  // --- Badges ---
  function badge(text, bg, fg) { fg = fg || bg; return '<span class="scp-badge" style="background:' + bg + '15;color:' + fg + '">' + esc(text) + '</span>'; }
  function statusBadge(status) { var c = POST_STATUSES[status] || { label: status, color: '#80868b' }; return '<span class="scp-status-badge"><span class="scp-status-dot" style="background:' + c.color + '"></span>' + esc(c.label) + '</span>'; }
  function typeBadge(type) { var c = POST_TYPES[type] || { label: type, color: '#80868b', icon: 'circle' }; return '<span class="scp-badge" style="background:' + c.color + '15;color:' + c.color + '">' + icon(c.icon) + ' ' + esc(c.label) + '</span>'; }
  function priorityBadge(p) { if (!p) return ''; var c = PRIORITY_LEVELS[p] || { label: p, color: '#80868b', icon: 'minus' }; return '<span class="scp-badge" style="background:' + c.color + '15;color:' + c.color + '">' + icon(c.icon) + ' ' + esc(c.label) + '</span>'; }
  function platformBadge(platform) { var c = PLATFORMS[platform] || { label: platform, color: '#80868b', icon: 'globe' }; return '<span class="scp-badge scp-badge-platform" style="background:' + c.color + '15;color:' + c.color + '">' + icon(c.icon) + ' ' + esc(c.label) + '</span>'; }
  function mediaPromptStatusBadge(st) { var c = MEDIA_PROMPT_STATUSES[st] || { label: st, color: '#80868b' }; return '<span class="scp-badge" style="background:' + c.color + '15;color:' + c.color + '">' + esc(c.label) + '</span>'; }
  function progressBar(pct, color) { color = color || 'var(--scp-primary)'; return '<div class="scp-progress-bar"><div class="scp-progress-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'; }

  // --- AI Text Formatting ---

  /**
   * Cleans raw AI response text before storing in data.
   * Handles: escaped newlines from JSON, code fences, leading/trailing whitespace,
   * markdown artifacts that shouldn't be in social post content.
   */
  function cleanAIText(text) {
    if (!text) return '';
    var cleaned = text;
    // Remove markdown code fences that some models wrap responses in
    cleaned = cleaned.replace(/^```(?:json|text|markdown|html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    // Fix double-escaped newlines: \\n â†’ \n (common when JSON-in-JSON)
    cleaned = cleaned.replace(/\\\\n/g, '\n');
    // Fix literal \n that should be real newlines (from JSON string values)
    cleaned = cleaned.replace(/\\n/g, '\n');
    // Fix literal \t â†’ real tabs
    cleaned = cleaned.replace(/\\t/g, '\t');
    // Remove "Here's the improved version:" type preambles
    cleaned = cleaned.replace(/^(?:Here(?:'s| is) (?:the |your |an? )?(?:improved|updated|revised|adapted|generated|written|new) (?:version|post|content|text|copy)[:\s]*\n*)/i, '');
    // Trim
    cleaned = cleaned.trim();
    return cleaned;
  }

  /**
   * Formats content text for HTML preview display.
   * Converts newlines to <br>, basic markdown bold/italic to HTML,
   * highlights hashtags and mentions. Returns safe HTML.
   */
  function formatContentForPreview(text) {
    if (!text) return '<span class="scp-text-muted">No content yet</span>';
    // First escape HTML entities
    var safe = esc(text);
    // Convert double newlines to paragraph breaks
    safe = safe.replace(/\n\n+/g, '</p><p>');
    // Convert single newlines to <br>
    safe = safe.replace(/\n/g, '<br>');
    // Highlight hashtags
    safe = safe.replace(/(#[a-zA-Z][\w]*)/g, '<span class="scp-preview-hashtag">$1</span>');
    // Highlight @mentions
    safe = safe.replace(/(@[a-zA-Z][\w.-]*)/g, '<span class="scp-preview-mention">$1</span>');
    // Basic markdown: **bold** â†’ <strong>
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Basic markdown: *italic* â†’ <em>
    safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Wrap in paragraph
    safe = '<p>' + safe + '</p>';
    return safe;
  }

  /**
   * Parses a structured image prompt into visual sections for display.
   * Returns array of { label, lines[] } objects.
   */
  function parsePromptSections(promptText) {
    if (!promptText) return [];
    var sections = [];
    var currentSection = { label: 'Prompt', lines: [] };
    var lines = promptText.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      // Detect section headers (ALL CAPS followed by colon, or lines ending with colon that are short)
      if (/^[A-Z][A-Z\s&\/]+:/.test(line) || (line.endsWith(':') && line.length < 40 && /^[A-Z]/.test(line))) {
        if (currentSection.lines.length > 0) sections.push(currentSection);
        currentSection = { label: line.replace(/:$/, '').trim(), lines: [] };
      } else {
        currentSection.lines.push(line);
      }
    }
    if (currentSection.lines.length > 0) sections.push(currentSection);
    return sections;
  }

  // --- IDs ---
  function generateId(prefix) { return prefix + '_' + Math.random().toString(36).substr(2, 8); }

  // --- Collection getters ---
  function getAllTags() { return (S.data.tags || []).slice().sort(function(a, b) { return a.name.localeCompare(b.name); }); }
  function getTagPosts(tagId) { return (S.data.posts || []).filter(function(p) { return (p.tags || []).indexOf(tagId) > -1; }); }
  function getUpcomingPosts(n) {
    var now = new Date().toISOString().split('T')[0];
    return (S.data.posts || []).filter(function(p) { return p.schedule && p.schedule.date && p.schedule.date >= now && p.status !== 'published' && p.status !== 'archived'; })
      .sort(function(a, b) { return (a.schedule.date + (a.schedule.time || '')) < (b.schedule.date + (b.schedule.time || '')) ? -1 : 1; }).slice(0, n || 5);
  }
  function getRecentlyPublished(n) {
    return (S.data.posts || []).filter(function(p) { return p.status === 'published'; })
      .sort(function(a, b) {
        var aDate = (a.schedule && a.schedule.date) || a.updated || '';
        var bDate = (b.schedule && b.schedule.date) || b.updated || '';
        return bDate.localeCompare(aDate); // Descending â€” newest first
      }).slice(0, n || 5);
  }
  function getRecentActivity(n) { return (S.activity || []).slice(-(n || 15)).reverse(); }
  function resolveTone(id) { return S.toneMap[id] || null; }
  function resolveAudience(id) { return S.audienceMap[id] || null; }
  function resolveImageStyle(id) { return S.imageStyleMap[id] || null; }
  function getPlatformConfig(key) { return (S.meta.settings && S.meta.settings.platforms && S.meta.settings.platforms[key]) || {}; }
  function resolveTag(id) { return S.tagMap[id] || null; }

  // --- Misc ---
  function debounce(fn, delay) { var t; return function() { var c = this, a = arguments; clearTimeout(t); t = setTimeout(function() { fn.apply(c, a); }, delay); }; }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function isEmpty(obj) { return !obj || (typeof obj === 'object' && Object.keys(obj).length === 0); }

  // ============================================================
  // SECTION 7: APP SHELL
  // ============================================================

  function renderApp() {
    var toolbarH = 0;
    var $toolbarBar = $('#toolbar-bar');
    if ($toolbarBar.length) {
      toolbarH = $toolbarBar.outerHeight() || 0;
      var $tray = $('#toolbar-tray-horizontal');
      if ($tray.length && $tray.is(':visible')) toolbarH += $tray.outerHeight() || 0;
    }
    document.documentElement.style.setProperty('--scp-drupal-toolbar', toolbarH + 'px');
    $('body').addClass('scp-active');
    S.$form.closest('.layout-region-node-main, .node-form').hide();
    var $app = $('<div id="scpApp" class="scp-app"></div>');
    S.$form.closest('.layout-region-node-main, .node-form').before($app);
    $app.html(renderAppShell());
    renderCurrentView();
  }

  function renderAppShell() {
    return renderHeader() + '<div class="scp-body">' + renderSidebar() +
      '<div class="scp-main"><div class="scp-content" id="scpContent"></div></div></div>' +
      '<div id="scpToasts" class="scp-toast-container"></div>';
  }

  function renderHeader() {
    var ws = (S.meta && S.meta.workspace) || {};
    var html = '<div class="scp-header"><div class="scp-header-left">';
    html += '<button class="scp-btn-icon scp-sidebar-toggle" id="scpSidebarToggle">' + icon('menu') + '</button>';
    html += '<div class="scp-header-logo">SCP</div>';
    html += '<div class="scp-header-info"><span class="scp-header-name">' + esc(ws.name || 'Social Content Planner') + '</span></div>';
    // Brand identity pill
    if (S.brand && S.brand.configured && S.brand.identity.name) {
      html += '<div class="scp-header-brand">';
      if (S.brand.identity.logoUrl) html += '<img class="scp-header-brand-logo" src="' + esc(S.brand.identity.logoUrl) + '" alt="">';
      html += '<span class="scp-header-brand-name">' + esc(S.brand.core && S.brand.core.brand_name ? S.brand.core.brand_name : S.brand.identity.name) + '</span></div>';
    }
    html += '</div><div class="scp-header-right">';
    html += '<span class="scp-save-status" id="scpSaveStatus"></span>';
    html += '<span class="scp-ai-status-indicator" id="scpAIStatus" title="AI status â€” loading..."><span class="scp-ai-status-dot scp-ai-status-loading"></span><span class="scp-ai-status-label">AI</span></span>';
    html += '<div class="scp-ai-quick-switch" id="scpAIQuickSwitch" style="display:none"></div>';
    html += '<button class="scp-btn scp-btn-primary scp-btn-sm" id="scpSaveNodeBtn">' + icon('check') + ' Save</button>';
    if (S.user.fullName) html += '<span class="scp-header-user">' + icon('user') + ' ' + esc(S.user.fullName) + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderSidebar() {
    var html = '<div class="scp-sidebar" id="scpSidebar"><div class="scp-sidebar-overlay"></div><div class="scp-sidebar-inner"><nav class="scp-nav">';
    for (var key in APP_VIEWS) {
      var v = APP_VIEWS[key];
      var active = S.currentView === key ? ' scp-nav-item-active' : '';
      var badgeHtml = '';
      if (key === 'posts') badgeHtml = S.activePosts > 0 ? '<span class="scp-nav-badge">' + S.activePosts + '</span>' : '';
      else if (key === 'research') {
        var sesCount = (S.data.research && S.data.research.sessions) ? S.data.research.sessions.length : 0;
        badgeHtml = sesCount > 0 ? '<span class="scp-nav-badge">' + sesCount + '</span>' : '';
      }
      else if (key === 'tags') badgeHtml = (S.data.tags || []).length > 0 ? '<span class="scp-nav-badge">' + (S.data.tags || []).length + '</span>' : '';
      else if (key === 'images') badgeHtml = S.images.length > 0 ? '<span class="scp-nav-badge">' + S.images.length + '</span>' : '';
      html += '<a href="#' + key + '" class="scp-nav-item' + active + '" data-view="' + key + '">';
      html += '<span class="scp-nav-icon">' + icon(v.icon) + '</span>';
      html += '<span class="scp-nav-label">' + esc(v.label) + '</span>';
      html += badgeHtml + '</a>';
    }
    html += '</nav></div></div>';
    return html;
  }

  function renderCurrentView() {
    var R = window._scpRenderers;
    var html = '';
    switch (S.currentView) {
      case 'dashboard': html = renderDashboardView(); break;
      case 'research':  html = (R.researchView) ? R.researchView() : renderResearchPlaceholder(); break;
      case 'posts':     html = renderPostsView(); break;
      case 'calendar':  html = renderCalendarView(); break;
      case 'images':    html = (R.imagesView) ? R.imagesView() : renderImagesPlaceholder(); break;
      case 'tags':      html = renderTagsView(); break;
      case 'activity':  html = renderActivityView(); break;
      case 'settings':  html = (R.settingsView) ? R.settingsView() : renderSettingsPlaceholder(); break;
      default: html = renderDashboardView();
    }
    $('#scpContent').html(html);
    setupViewEventHandlers();
    // Trigger Part 2A/2B view-specific event setup
    if (R.setupResearchEvents && S.currentView === 'research') R.setupResearchEvents();
    if (R.setupImagesEvents && S.currentView === 'images') R.setupImagesEvents();
    if (R.setupSettingsEvents && S.currentView === 'settings') R.setupSettingsEvents();
  }

  // ============================================================
  // SECTIONS 8-12: VIEW RENDERERS â€” extracted (v0.2.0)
  //   8   Dashboard  -> src/core/views/dashboard.js
  //   9   Posts      -> src/core/views/posts.js
  //   10  Calendar   -> src/core/views/calendar.js
  //   11  Tags       -> src/core/views/tags.js
  //   12  Activity   -> src/core/views/activity.js
  // ============================================================
  var renderDashboardView   = window._scpRenderDashboardView;
  var renderPostsView       = window._scpRenderPostsView;
  var renderCalendarView    = window._scpRenderCalendarView;
  var renderTagsView        = window._scpRenderTagsView;
  var renderActivityView    = window._scpRenderActivityView;
  var renderStatCard        = window._scpRenderStatCard;
  var renderActivityItem    = window._scpRenderActivityItem;
  var renderPostListItem    = window._scpRenderPostListItem;
  var renderCalendarPopover = window._scpRenderCalendarPopover;
  // ============================================================
  // SECTION 13: PLACEHOLDER VIEWS
  // ============================================================

  function renderResearchPlaceholder() {
    if (S._part2bTimeout) {
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('flask') + ' Research</h1></div>' +
        '<div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon('warning') + '</div>' +
        '<div class="scp-empty-state-title">Research Module Not Loaded</div>' +
        '<div class="scp-empty-state-text">The AI Research module (Part 2B JS) didn\'t load. Check that the Asset Injector has all 3 JS files enabled in the correct order: Part 1 â†’ Part 2A â†’ Part 2B.</div>' +
        '<button class="scp-btn scp-btn-outline" onclick="location.reload()">' + icon('refresh') + ' Reload Page</button></div></div>';
    }
    return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('flask') + ' Research</h1></div>' +
      '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('spinner') + '</div>' +
      '<div class="scp-empty-state-title">AI-Powered Ideation</div>' +
      '<div class="scp-empty-state-text">Loading research workspace...</div></div></div>';
  }

  function renderSettingsPlaceholder() {
    if (S._part2bTimeout) {
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('gear') + ' Settings</h1></div>' +
        '<div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon('warning') + '</div>' +
        '<div class="scp-empty-state-title">Settings Module Not Loaded</div>' +
        '<div class="scp-empty-state-text">The Settings module (Part 2B JS) didn\'t load. Check Asset Injector configuration.</div>' +
        '<button class="scp-btn scp-btn-outline" onclick="location.reload()">' + icon('refresh') + ' Reload Page</button></div></div>';
    }
    return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('gear') + ' Settings</h1></div>' +
      '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('spinner') + '</div>' +
      '<div class="scp-empty-state-title">Settings</div>' +
      '<div class="scp-empty-state-text">Loading workspace configuration...</div></div></div>';
  }

  function renderImagesPlaceholder() {
    if (S._part2bTimeout) {
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('images') + ' Reference Images</h1></div>' +
        '<div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon('warning') + '</div>' +
        '<div class="scp-empty-state-title">Images Module Not Loaded</div>' +
        '<div class="scp-empty-state-text">The Images module (Part 2B JS) didn\'t load. Check Asset Injector configuration.</div>' +
        '<button class="scp-btn scp-btn-outline" onclick="location.reload()">' + icon('refresh') + ' Reload Page</button></div></div>';
    }
    return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('images') + ' Reference Images</h1></div>' +
      '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('spinner') + '</div>' +
      '<div class="scp-empty-state-title">Reference Images</div>' +
      '<div class="scp-empty-state-text">Loading brand image library...</div></div></div>';
  }

  // ============================================================
  // SECTION 14: POST FILTERING & SORTING
  // ============================================================

  function getFilteredPosts() {
    var f = S.postFilter;
    var posts = (S.data.posts || []).slice();

    // Search â€” matches title, content body, tags, hook, and platform content
    if (f.search) {
      var q = f.search.toLowerCase();
      posts = posts.filter(function(p) {
        // Title
        if ((p.title || '').toLowerCase().indexOf(q) > -1) return true;
        // Content body
        if (p.content && (p.content.body || '').toLowerCase().indexOf(q) > -1) return true;
        // Selected hook
        if (p.research && (p.research.selected_hook || '').toLowerCase().indexOf(q) > -1) return true;
        // Tag names
        if (p.tags && p.tags.length > 0) {
          for (var ti = 0; ti < p.tags.length; ti++) {
            var tag = S.tagMap[p.tags[ti]];
            if (tag && tag.name.toLowerCase().indexOf(q) > -1) return true;
          }
        }
        return false;
      });
    }
    // Status filter
    if (f.statuses && f.statuses.length > 0) {
      posts = posts.filter(function(p) { return f.statuses.indexOf(p.status) > -1; });
    }
    // Type filter
    if (f.type) posts = posts.filter(function(p) { return p.type === f.type; });
    // Platform filter
    if (f.platform) posts = posts.filter(function(p) { return (p.platforms || []).indexOf(f.platform) > -1; });
    // Tag filter
    if (f.tag) posts = posts.filter(function(p) { return (p.tags || []).indexOf(f.tag) > -1; });
    // Priority filter
    if (f.priority) posts = posts.filter(function(p) { return p.priority === f.priority; });

    // Sort
    var sortBy = f.sortBy || 'updated';
    var dir = f.sortDir === 'asc' ? 1 : -1;
    posts.sort(function(a, b) {
      var av, bv;
      switch (sortBy) {
        case 'title': av = (a.title || '').toLowerCase(); bv = (b.title || '').toLowerCase(); return av < bv ? -dir : av > bv ? dir : 0;
        case 'created': av = a.created || ''; bv = b.created || ''; return av < bv ? dir : av > bv ? -dir : 0;
        case 'priority':
          var po = { urgent: 0, high: 1, medium: 2, low: 3 };
          av = po[a.priority] !== undefined ? po[a.priority] : 9;
          bv = po[b.priority] !== undefined ? po[b.priority] : 9;
          return (av - bv) * dir;
        default: av = a.updated || a.created || ''; bv = b.updated || b.created || ''; return av < bv ? dir : av > bv ? -dir : 0;
      }
    });
    return posts;
  }

  function getGroupedPosts(groupBy) {
    var posts = getFilteredPosts();
    var groups = [];

    switch (groupBy) {
      case 'workflow':
        for (var gk in WORKFLOW_GROUPS) {
          var wg = WORKFLOW_GROUPS[gk];
          var gPosts = posts.filter(function(p) { return wg.statuses.indexOf(p.status) > -1; });
          groups.push({ key: gk, label: wg.label, icon: wg.icon, color: wg.color, posts: gPosts });
        }
        break;

      case 'status':
        for (var si = 0; si < STATUS_ORDER.length; si++) {
          var sk = STATUS_ORDER[si]; var st = POST_STATUSES[sk];
          var sPosts = posts.filter(function(p) { return p.status === sk; });
          if (sPosts.length) groups.push({ key: sk, label: st.label, icon: st.icon, color: st.color, posts: sPosts });
        }
        break;

      case 'type':
        for (var tk in POST_TYPES) {
          var pt = POST_TYPES[tk];
          var tPosts = posts.filter(function(p) { return p.type === tk; });
          if (tPosts.length) groups.push({ key: tk, label: pt.label, icon: pt.icon, color: pt.color, posts: tPosts });
        }
        break;

      case 'platform':
        for (var pk in PLATFORMS) {
          var pl = PLATFORMS[pk];
          var pPosts = posts.filter(function(p) { return (p.platforms || []).indexOf(pk) > -1; });
          if (pPosts.length) groups.push({ key: pk, label: pl.label, icon: pl.icon, color: pl.color, posts: pPosts });
        }
        break;

      case 'tag':
        var tags = getAllTags();
        for (var tgi = 0; tgi < tags.length; tgi++) {
          var tag = tags[tgi];
          var tagPosts = posts.filter(function(p) { return (p.tags || []).indexOf(tag.id) > -1; });
          if (tagPosts.length) groups.push({ key: tag.id, label: tag.name, icon: 'tag', color: tag.color, posts: tagPosts });
        }
        var untagged = posts.filter(function(p) { return !p.tags || p.tags.length === 0; });
        if (untagged.length) groups.push({ key: '_untagged', label: 'Untagged', icon: 'tag', color: '#9aa0a6', posts: untagged });
        break;

      case 'priority':
        var priOrder = ['urgent', 'high', 'medium', 'low'];
        for (var pri = 0; pri < priOrder.length; pri++) {
          var prk = priOrder[pri]; var prCfg = PRIORITY_LEVELS[prk];
          var prPosts = posts.filter(function(p) { return p.priority === prk; });
          if (prPosts.length) groups.push({ key: prk, label: prCfg.label, icon: prCfg.icon, color: prCfg.color, posts: prPosts });
        }
        var noPri = posts.filter(function(p) { return !p.priority; });
        if (noPri.length) groups.push({ key: '_none', label: 'No Priority', icon: 'minus', color: '#9aa0a6', posts: noPri });
        break;

      default:
        groups.push({ key: 'all', label: 'All Posts', icon: 'thumbtack', color: '#1a73e8', posts: posts });
    }
    return groups;
  }

  // ============================================================
  // SECTION 15: EVENT HANDLERS
  // ============================================================

  function setupEventHandlers() {
    // Navigation
    $(document).off('click.scp-nav', '.scp-nav-item').on('click.scp-nav', '.scp-nav-item', function(e) { e.preventDefault(); var v = $(this).data('view'); if (v) navigate(v); });
    // Sidebar toggle
    $(document).off('click.scp-sidebar', '#scpSidebarToggle').on('click.scp-sidebar', '#scpSidebarToggle', function(e) {
      e.preventDefault();
      if (window.innerWidth <= 992) { $('#scpSidebar').toggleClass('scp-sidebar-open'); }
      else { S.sidebarHidden = !S.sidebarHidden; $('#scpApp').toggleClass('scp-app--sidebar-hidden', S.sidebarHidden); }
    });
    $(document).off('click.scp-overlay', '.scp-sidebar-overlay').on('click.scp-overlay', '.scp-sidebar-overlay', function() { $('#scpSidebar').removeClass('scp-sidebar-open'); });
    // Save to Drupal
    $(document).off('click.scp-save', '#scpSaveNodeBtn').on('click.scp-save', '#scpSaveNodeBtn', function(e) {
      e.preventDefault();
      syncToTextarea();
      updateSaveStatus('saving');
      if (S.$submitBtn && S.$submitBtn.length) {
        S.dirty = false; // Clear dirty flag before Drupal submits (page will reload)
        S.$submitBtn.click();
      } else {
        updateSaveStatus('saved');
        toast('Data synced to fields. Use the Drupal Save button to persist.', 'info');
      }
    });
    // Toast close
    $(document).off('click.scp-toast', '[data-action="close-toast"]').on('click.scp-toast', '[data-action="close-toast"]', function() { $(this).closest('.scp-toast').remove(); });
    // Hash change
    $(window).off('hashchange.scp').on('hashchange.scp', function() { var h = readHash(); if (h !== S.currentView) navigate(h, { noHash: true }); });
    // Go view
    $(document).off('click.scp-goview', '[data-action="go-view"]').on('click.scp-goview', '[data-action="go-view"]', function(e) { e.preventDefault(); navigate($(this).data('view')); });
    $(document).off('click.scp-goset', '[data-action="go-settings"]').on('click.scp-goset', '[data-action="go-settings"]', function(e) { e.preventDefault(); S.settingsTab = $(this).data('tab') || 'workspace'; navigate('settings'); });
  }

  function setupViewEventHandlers() {
    // --- Post search ---
    $(document).off('input.scp-ps', '#scpPostSearch').on('input.scp-ps', '#scpPostSearch', debounce(function() { S.postFilter.search = $(this).val(); renderCurrentView(); }, 300));

    // --- Grouping ---
    $(document).off('click.scp-grp', '[data-action="change-group"]').on('click.scp-grp', '[data-action="change-group"]', function(e) { e.preventDefault(); S.postGroupBy = $(this).data('group'); S.collapsedGroups = {}; renderCurrentView(); });

    // --- Group collapse ---
    $(document).off('click.scp-tg', '[data-action="toggle-group"]').on('click.scp-tg', '[data-action="toggle-group"]', function(e) { e.preventDefault(); var gk = $(this).data('group'); S.collapsedGroups[gk] = !S.collapsedGroups[gk]; renderCurrentView(); });

    // --- Select post ---
    $(document).off('click.scp-sp', '[data-action="select-post"]').on('click.scp-sp', '[data-action="select-post"]', function(e) { e.preventDefault(); S.selectedPostId = $(this).data('id'); S.currentStep = 'basics'; if (S.currentView !== 'posts') navigate('posts'); else renderCurrentView(); });

    // --- Pipeline steps ---
    $(document).off('click.scp-gs', '[data-action="go-step"]').on('click.scp-gs', '[data-action="go-step"]', function(e) { e.preventDefault(); S.currentStep = $(this).data('step'); renderCurrentView(); });

    // --- New post ---
    $(document).off('click.scp-np', '[data-action="new-post"]').on('click.scp-np', '[data-action="new-post"]', function(e) { e.preventDefault(); createNewPost(); });

    // --- Delete post ---
    $(document).off('click.scp-dp', '[data-action="delete-post"]').on('click.scp-dp', '[data-action="delete-post"]', function(e) {
      e.preventDefault(); var id = $(this).data('id');
      if (id && window._scpPart2A && window._scpPart2A.deletePost) { window._scpPart2A.deletePost(id); }
      else if (id && confirm('Delete this post?')) {
        S.data.posts = (S.data.posts || []).filter(function(p) { return p.id !== id; });
        if (S.selectedPostId === id) S.selectedPostId = null;
        logActivity('post_deleted', id, '', 'Post deleted');
        buildMaps(); renderCurrentView(); syncToTextarea(); toast('Post deleted', 'success');
      }
    });

    // --- Sort ---
    $(document).off('change.scp-sb', '#scpSortBy').on('change.scp-sb', '#scpSortBy', function() { S.postFilter.sortBy = $(this).val(); renderCurrentView(); });
    $(document).off('click.scp-sd', '[data-action="toggle-sort-dir"]').on('click.scp-sd', '[data-action="toggle-sort-dir"]', function(e) { e.preventDefault(); S.postFilter.sortDir = S.postFilter.sortDir === 'asc' ? 'desc' : 'asc'; renderCurrentView(); });

    // --- Pipeline card filter (dashboard) ---
    $(document).off('click.scp-pf', '[data-action="filter-pipeline-status"]').on('click.scp-pf', '[data-action="filter-pipeline-status"]', function(e) { e.preventDefault(); S.postFilter.statuses = [$(this).data('status')]; navigate('posts'); });

    // --- Calendar ---
    // Navigation (month mode)
    $(document).off('click.scp-cp', '[data-action="cal-prev"]').on('click.scp-cp', '[data-action="cal-prev"]', function(e) {
      e.preventDefault();
      if (S.calendarMode === 'week') {
        var ws = getWeekStart(S.calendarYear, S.calendarMonth); ws.setDate(ws.getDate() - 7);
        S.calendarWeekStart = ws; S.calendarYear = ws.getFullYear(); S.calendarMonth = ws.getMonth();
      } else { S.calendarMonth--; if (S.calendarMonth < 0) { S.calendarMonth = 11; S.calendarYear--; } }
      renderCurrentView();
    });
    $(document).off('click.scp-cn', '[data-action="cal-next"]').on('click.scp-cn', '[data-action="cal-next"]', function(e) {
      e.preventDefault();
      if (S.calendarMode === 'week') {
        var ws = getWeekStart(S.calendarYear, S.calendarMonth); ws.setDate(ws.getDate() + 7);
        S.calendarWeekStart = ws; S.calendarYear = ws.getFullYear(); S.calendarMonth = ws.getMonth();
      } else { S.calendarMonth++; if (S.calendarMonth > 11) { S.calendarMonth = 0; S.calendarYear++; } }
      renderCurrentView();
    });
    $(document).off('click.scp-ct', '[data-action="cal-today"]').on('click.scp-ct', '[data-action="cal-today"]', function(e) {
      e.preventDefault(); var now = new Date(); S.calendarYear = now.getFullYear(); S.calendarMonth = now.getMonth(); S.calendarWeekStart = null; renderCurrentView();
    });
    // Mode toggle (month/week)
    $(document).off('click.scp-cm', '[data-action="cal-mode"]').on('click.scp-cm', '[data-action="cal-mode"]', function(e) {
      e.preventDefault(); S.calendarMode = $(this).data('mode'); S.calendarWeekStart = null; renderCurrentView();
    });
    // Filters
    $(document).off('click.scp-cfp', '[data-action="cal-filter-platform"]').on('click.scp-cfp', '[data-action="cal-filter-platform"]', function(e) {
      e.preventDefault(); var pk = $(this).data('platform'); S.calendarFilters.platforms = S.calendarFilters.platforms || [];
      var idx = S.calendarFilters.platforms.indexOf(pk);
      if (idx > -1) S.calendarFilters.platforms.splice(idx, 1); else S.calendarFilters.platforms.push(pk);
      renderCurrentView();
    });
    $(document).off('click.scp-cft', '[data-action="cal-filter-type"]').on('click.scp-cft', '[data-action="cal-filter-type"]', function(e) {
      e.preventDefault(); var tk = $(this).data('type'); S.calendarFilters.types = S.calendarFilters.types || [];
      var idx = S.calendarFilters.types.indexOf(tk);
      if (idx > -1) S.calendarFilters.types.splice(idx, 1); else S.calendarFilters.types.push(tk);
      renderCurrentView();
    });
    $(document).off('change.scp-cfs', '.scp-cal-status-filter').on('change.scp-cfs', '.scp-cal-status-filter', function() { S.calendarFilters.status = $(this).val(); renderCurrentView(); });
    $(document).off('change.scp-cftg', '.scp-cal-tag-filter').on('change.scp-cftg', '.scp-cal-tag-filter', function() { S.calendarFilters.tag = $(this).val(); renderCurrentView(); });
    $(document).off('click.scp-ccf', '[data-action="cal-clear-filters"]').on('click.scp-ccf', '[data-action="cal-clear-filters"]', function(e) {
      e.preventDefault(); S.calendarFilters = { platforms: [], types: [], status: '', tag: '' }; renderCurrentView();
    });
    // Drag-and-drop
    $(document).off('dragstart.scp-cds').on('dragstart.scp-cds', '.scp-cal-post[draggable], .scp-cal-week-card[draggable]', function(e) {
      var postId = $(this).data('id');
      e.originalEvent.dataTransfer.setData('text/plain', postId);
      e.originalEvent.dataTransfer.effectAllowed = 'move';
      $(this).addClass('scp-cal-dragging');
    });
    $(document).off('dragend.scp-cde').on('dragend.scp-cde', '.scp-cal-post, .scp-cal-week-card', function() { $(this).removeClass('scp-cal-dragging'); $('.scp-cal-day-drop').removeClass('scp-cal-day-drop'); });
    $(document).off('drop.scp-cdr').on('drop.scp-cdr', '.scp-cal-day[data-date], .scp-cal-week-day[data-date]', function(e) {
      e.preventDefault(); var postId = e.originalEvent.dataTransfer.getData('text/plain');
      var newDate = $(this).data('date');
      if (postId && newDate) {
        var post = S.postMap[postId];
        if (post) {
          var oldDate = (post.schedule && post.schedule.date) || '';
          if (oldDate === newDate) return; // No change
          post.schedule = post.schedule || {};
          post.schedule.date = newDate;
          post.updated = new Date().toISOString();
          logActivity('post_rescheduled', post.id, post.title, 'Moved from ' + (oldDate || 'unscheduled') + ' to ' + newDate);
          // snapshot for undo support â€” called via Part 2A if available
          if (window._scpPart2A && window._scpPart2A.snapshot) window._scpPart2A.snapshot('Reschedule ' + truncate(post.title, 20));
          buildMaps(); syncToTextarea(); renderCurrentView();
          toast('Moved "' + truncate(post.title, 30) + '" to ' + newDate, 'success');
        }
      }
    });
    // Popover
    $(document).off('mouseenter.scp-cph', '[data-action="cal-post-hover"]').on('mouseenter.scp-cph', '[data-action="cal-post-hover"]', function(e) {
      var postId = $(this).data('id'); var post = S.postMap[postId]; if (!post) return;
      var $pop = $('#scpCalPopover');
      $pop.html(renderCalendarPopover(post));
      var rect = this.getBoundingClientRect();
      var popW = 300; var popH = 240;
      var left = rect.left + rect.width / 2 - popW / 2;
      var top = rect.bottom + 8;
      // Keep in viewport
      if (left < 8) left = 8;
      if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
      if (top + popH > window.innerHeight - 8) top = rect.top - popH - 8;
      $pop.css({ left: left + 'px', top: top + 'px', width: popW + 'px', display: 'block', position: 'fixed' });
    });
    $(document).off('mouseleave.scp-cpl', '[data-action="cal-post-hover"]').on('mouseleave.scp-cpl', '[data-action="cal-post-hover"]', function(e) {
      // Delay hide so user can move to popover
      setTimeout(function() { if (!$('#scpCalPopover:hover').length) $('#scpCalPopover').hide(); }, 200);
    });
    $(document).off('mouseleave.scp-cppl', '#scpCalPopover').on('mouseleave.scp-cppl', '#scpCalPopover', function() { $(this).hide(); });
    $(document).off('click.scp-cpc', '[data-action="cal-pop-close"]').on('click.scp-cpc', '[data-action="cal-pop-close"]', function(e) { e.preventDefault(); $('#scpCalPopover').hide(); });
    // Click empty day â†’ new post with date
    $(document).off('click.scp-cdc', '[data-action="cal-day-click"]').on('click.scp-cdc', '[data-action="cal-day-click"]', function(e) {
      // Only trigger on the day cell itself, not on post chips inside it
      if ($(e.target).closest('.scp-cal-post, .scp-cal-more, .scp-cal-week-card, .scp-cal-add-btn').length) return;
      e.preventDefault(); var date = $(this).data('date'); if (!date) return;
      var postCount = $(this).find('.scp-cal-post, .scp-cal-week-card').length;
      if (postCount === 0) {
        var np = createNewPost({ schedule: { date: date, time: '', timezone: (S.meta.settings && S.meta.settings.timezone) || '' } });
        if (np) { toast('New post created for ' + date, 'success'); renderCurrentView(); }
      }
    });
    $(document).off('click.scp-cnp', '[data-action="cal-new-post"]').on('click.scp-cnp', '[data-action="cal-new-post"]', function(e) {
      e.preventDefault(); var date = $(this).data('date');
      var np = createNewPost({ schedule: { date: date, time: '', timezone: (S.meta.settings && S.meta.settings.timezone) || '' } });
      if (np) { toast('New post created for ' + date, 'success'); renderCurrentView(); }
    });

    // --- Tags ---
    $(document).off('click.scp-st', '[data-action="select-tag"]').on('click.scp-st', '[data-action="select-tag"]', function(e) { e.preventDefault(); S.selectedTagId = $(this).data('id'); renderCurrentView(); });
    $(document).off('click.scp-stn', '[data-action="select-tag-nav"]').on('click.scp-stn', '[data-action="select-tag-nav"]', function(e) { e.preventDefault(); S.selectedTagId = $(this).data('id'); navigate('tags'); });
    $(document).off('click.scp-bt', '[data-action="back-to-tags"]').on('click.scp-bt', '[data-action="back-to-tags"]', function(e) { e.preventDefault(); S.selectedTagId = null; renderCurrentView(); });
    $(document).off('click.scp-nt', '[data-action="new-tag"]').on('click.scp-nt', '[data-action="new-tag"]', function(e) {
      e.preventDefault();
      if (window._scpPart2A && window._scpPart2A.openModal) { /* Part 2A handles tag creation modal */ }
      else {
        var name = prompt('Tag name:');
        if (name && name.trim()) {
          var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2'];
          var tag = { id: generateId('tag'), name: name.trim(), color: colors[Math.floor(Math.random() * colors.length)], description: '', created: new Date().toISOString() };
          S.data.tags = S.data.tags || [];
          S.data.tags.push(tag);
          logActivity('tag_created', '', '', 'Created tag: ' + tag.name);
          buildMaps(); renderCurrentView(); syncToTextarea(); toast('Tag created', 'success');
        }
      }
    });

    // --- Activity filters ---
    $(document).off('input.scp-as', '#scpActivitySearch').on('input.scp-as', '#scpActivitySearch', debounce(function() { S.activityFilter.search = $(this).val(); renderCurrentView(); }, 300));
    $(document).off('change.scp-at', '#scpActivityTypeFilter').on('change.scp-at', '#scpActivityTypeFilter', function() { S.activityFilter.type = $(this).val(); renderCurrentView(); });
  }

  // ============================================================
  // SECTION 16: CRUD HELPERS
  // ============================================================

  function createNewPost(overrides) {
    overrides = overrides || {};
    var now = new Date().toISOString();
    var defs = (S.meta.settings && S.meta.settings.defaults) || {};
    var post = {
      id: generateId('post'),
      title: overrides.title || '',
      type: overrides.type || defs.type || 'image',
      status: 'idea',
      priority: overrides.priority || defs.priority || 'medium',
      tags: overrides.tags || (defs.tags || []).slice(),
      source: overrides.source || { type: 'manual', research_session_id: '', research_idea_id: '', notes: '' },
      platforms: overrides.platforms || (defs.platforms || ['linkedin']).slice(),
      research: { angles: [], selected_angle: '', angle_custom_input: '', hooks: [], selected_hook: '', hook_custom_input: '', notes: '' },
      content: { body: '', tone_id: overrides.tone_id || defs.tone_id || '', audience_id: overrides.audience_id || defs.audience_id || '', notes: '' },
      carousel: { slide_count: 0, slides: [] },
      video: { concept: '', script: '', duration_seconds: 60, format: 'reel' },
      media: { prompts: [], config: { style_id: '', custom_instructions: '', brand_context_enabled: false } },
      platform_content: {
        linkedin: { enabled: false, body: '', notes: '' },
        instagram: { enabled: false, body: '', notes: '' },
        facebook: { enabled: false, body: '', notes: '' },
        youtube: { enabled: false, title: '', description: '', tags: [], notes: '' }
      },
      schedule: { date: '', time: '', timezone: '', published_urls: {} },
      performance: {},
      created_by: S.user.id || '', assigned_to: '', review_notes: '',
      created: now, updated: now
    };
    // Pre-fill hook if provided
    if (overrides.hook) post.content.body = overrides.hook;

    S.data.posts = S.data.posts || [];
    S.data.posts.unshift(post);
    logActivity('post_created', post.id, post.title || 'New Post', 'Post created (' + POST_TYPES[post.type].label + ')');
    buildMaps();
    S.selectedPostId = post.id;
    S.currentStep = 'basics';
    if (S.currentView !== 'posts') navigate('posts');
    else renderCurrentView();
    syncToTextarea();
    toast('Post created', 'success');
    return post;
  }

  function savePostField(postId, field, value) {
    var post = S.postMap[postId || S.selectedPostId]; if (!post) return;
    if (post[field] === value) return;
    var oldValue = post[field];
    post[field] = value;
    post.updated = new Date().toISOString();
    if (field === 'status') {
      var oLbl = (POST_STATUSES[oldValue] || {}).label || oldValue;
      var nLbl = (POST_STATUSES[value] || {}).label || value;
      logActivity('post_status_changed', post.id, post.title, 'Status: ' + oLbl + ' â†’ ' + nLbl);
    }
    buildMaps(); syncToTextarea(); renderCurrentView();
  }

  function logActivity(type, postId, postTitle, description) {
    S.activity = S.activity || [];
    S.activity.push({
      id: generateId('act'), type: type,
      post_id: postId || '', post_title: postTitle || '',
      description: description || '',
      timestamp: new Date().toISOString(),
      user_id: S.user.id || '', user_name: S.user.name || ''
    });
  }

  // ============================================================
  // SECTION 17: SYNC & SAVE
  // ============================================================

  function syncToTextarea() {
    if (!S.$textarea || !S.$metaTextarea || !S.$activityTextarea) return;
    try {
      S.$textarea.val(JSON.stringify(S.data, null, 2)).trigger('change');
      S.$metaTextarea.val(JSON.stringify(S.meta, null, 2)).trigger('change');
      S.$activityTextarea.val(JSON.stringify(S.activity, null, 2)).trigger('change');
      S.dirty = true;
      updateSaveStatus('unsaved');
    } catch (e) { console.error('[SCP] Sync error:', e); }
  }

  function updateSaveStatus(status) {
    var $s = $('#scpSaveStatus');
    if (status === 'saving') $s.text('Saving...').removeClass('scp-saved scp-synced scp-unsaved').addClass('scp-saving');
    else if (status === 'saved') { $s.text('Saved').removeClass('scp-saving scp-synced scp-unsaved').addClass('scp-saved'); S.dirty = false; S.lastSaved = new Date(); }
    else if (status === 'synced') { $s.text('Synced').removeClass('scp-saving scp-saved scp-unsaved').addClass('scp-synced'); }
    else $s.text('Unsaved').removeClass('scp-saving scp-saved scp-synced').addClass('scp-unsaved');
  }

  function startAutoSave() {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    S.autoSaveTimer = setInterval(function() {
      if (S.dirty) {
        syncToTextarea();
        // Note: this only syncs to textarea â€” actual Drupal save requires clicking Save.
        // Show "Synced" instead of "Saved" to avoid misleading the user
        updateSaveStatus('synced');
      }
    }, 30000);
  }

  // Warn user about unsaved changes before leaving
  $(window).on('beforeunload', function(e) {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    if (S.dirty) {
      var msg = 'You have unsaved changes. Click "Save" to save to Drupal before leaving.';
      e.returnValue = msg;
      return msg;
    }
  });

  // ============================================================
  // SECTION 18: TOAST & AUTO-STATUS ENGINE
  // ============================================================

  function toast(msg, type, dur) {
    type = type || 'info'; dur = dur || 3000;
    var $c = $('#scpToasts');
    if (!$c.length) { $c = $('<div id="scpToasts" class="scp-toast-container"></div>'); $('#scpApp').append($c); }
    var id = 'toast_' + Date.now();
    var iconName = type === 'success' ? 'success' : (type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));
    $c.append('<div class="scp-toast scp-toast-' + type + '" id="' + id + '"><span class="scp-toast-icon">' + icon(iconName) + '</span><span class="scp-toast-message">' + esc(msg) + '</span><button class="scp-toast-close" data-action="close-toast">&times;</button></div>');
    setTimeout(function() { $('#' + id).addClass('scp-toast-show'); }, 10);
    setTimeout(function() { $('#' + id).removeClass('scp-toast-show'); setTimeout(function() { $('#' + id).remove(); }, 300); }, dur);
  }

  // --- Auto-Status Engine ---

  function evaluateAutoStatus(post) {
    if (!post) return null;
    var currentIdx = STATUS_ORDER.indexOf(post.status);
    if (currentIdx < 0) return null;

    var suggested = post.status;

    // idea â†’ research: when angles or hooks researched
    var r = post.research || {};
    if (STATUS_ORDER.indexOf('research') > currentIdx) {
      if ((r.angles && r.angles.length > 0) || (r.hooks && r.hooks.length > 0)) {
        suggested = 'research';
      }
    }

    // research â†’ content_writing: when angle AND hook selected
    var sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('content_writing') > sugIdx) {
      if (r.selected_angle && r.selected_hook) {
        suggested = 'content_writing';
      }
    }

    // content_writing â†’ media_prompts (or platform_adapt for text)
    sugIdx = STATUS_ORDER.indexOf(suggested);
    var content = post.content || {};
    if (STATUS_ORDER.indexOf('media_prompts') > sugIdx || STATUS_ORDER.indexOf('platform_adapt') > sugIdx) {
      if (content.body && content.body.trim().length > 50) {
        if (post.type === 'text') {
          if (STATUS_ORDER.indexOf('platform_adapt') > sugIdx) suggested = 'platform_adapt';
        } else {
          if (STATUS_ORDER.indexOf('media_prompts') > sugIdx) suggested = 'media_prompts';
        }
      }
    }

    // media_prompts â†’ platform_adapt
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('platform_adapt') > sugIdx) {
      var prompts = (post.media && post.media.prompts) || [];
      var hasFinal = prompts.length > 0 && prompts.some(function(mp) { return mp.status === 'final'; });
      // Phase B: visual plan also counts as media completion
      var hasVisualPlan = !!(post.media && post.media.visual_plan && post.media.visual_plan.visual_concept && post.media.visual_plan.visual_concept.scene);
      var hasCarouselPlans = !!(post.media && post.media.visual_plans && post.media.visual_plans.length > 0 && post.media.visual_plans[0].visual_concept);
      if (hasFinal || hasVisualPlan || hasCarouselPlans) suggested = 'platform_adapt';
    }

    // platform_adapt â†’ ready
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('ready') > sugIdx) {
      var hasAdaptation = (post.platforms || []).some(function(pk) {
        var pc = (post.platform_content || {})[pk];
        if (pk === 'youtube') return pc && pc.enabled && pc.title && pc.title.trim().length > 0;
        return pc && pc.enabled && pc.body && pc.body.trim().length > 0;
      });
      if (hasAdaptation) suggested = 'ready';
    }

    // ready â†’ scheduled
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('scheduled') > sugIdx) {
      var sched = post.schedule || {};
      if (sched.date && sched.time) suggested = 'scheduled';
    }

    return suggested === post.status ? null : suggested;
  }

  function maybeAdvanceStatus(post, reason) {
    if (!post) return false;
    var suggested = evaluateAutoStatus(post);
    if (!suggested) return false;
    var currentIdx = STATUS_ORDER.indexOf(post.status);
    var suggestedIdx = STATUS_ORDER.indexOf(suggested);
    if (suggestedIdx <= currentIdx) return false;

    var oldLabel = (POST_STATUSES[post.status] || {}).label || post.status;
    var newLabel = (POST_STATUSES[suggested] || {}).label || suggested;
    post.status = suggested;
    post.updated = new Date().toISOString();
    logActivity('post_status_changed', post.id, post.title, oldLabel + ' â†’ ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' â€” ' + reason : ''), 'success', 4000);
    return true;
  }

  // ============================================================
  // SECTION 19: API EXPORTS
  // ============================================================

  window._scpState = S;

  // Core
  window._scpRender = renderCurrentView;
  window._scpNavigate = navigate;
  window._scpToast = toast;
  window._scpGenerateId = generateId;
  window._scpBuildMaps = buildMaps;
  window._scpSyncToTextarea = syncToTextarea;
  window._scpUpdateSaveStatus = updateSaveStatus;
  window._scpLogActivity = logActivity;

  // Formatters
  window._scpFormatDate = formatDate;
  window._scpFormatDateShort = formatDateShort;
  window._scpFormatRelativeTime = formatRelativeTime;
  window._scpFormatNumber = formatNumber;
  window._scpFormatCharCount = formatCharCount;

  // Utilities
  window._scpEsc = esc;
  window._scpIcon = icon;
  window._scpTruncate = truncate;
  window._scpDeepClone = deepClone;
  window._scpDebounce = debounce;
  window._scpIsEmpty = isEmpty;
  window._scpCountWords = countWords;
  window._scpCountChars = countChars;

  // Badges
  window._scpBadge = badge;
  window._scpStatusBadge = statusBadge;
  window._scpTypeBadge = typeBadge;
  window._scpPriorityBadge = priorityBadge;
  window._scpPlatformBadge = platformBadge;
  window._scpMediaPromptStatusBadge = mediaPromptStatusBadge;
  window._scpProgressBar = progressBar;

  // Getters
  window._scpGetFilteredPosts = getFilteredPosts;
  window._scpGetGroupedPosts = getGroupedPosts;
  window._scpGetAllTags = getAllTags;
  window._scpGetTagPosts = getTagPosts;
  window._scpGetUpcomingPosts = getUpcomingPosts;
  window._scpGetRecentlyPublished = getRecentlyPublished;
  window._scpGetRecentActivity = getRecentActivity;
  window._scpResolveTone = resolveTone;
  window._scpResolveAudience = resolveAudience;
  window._scpResolveImageStyle = resolveImageStyle;
  window._scpGetPlatformConfig = getPlatformConfig;
  window._scpResolveTag = resolveTag;

  // Auto-status
  window._scpEvaluateAutoStatus = evaluateAutoStatus;
  window._scpMaybeAdvanceStatus = maybeAdvanceStatus;

  // Images
  window._scpGetImages = getImages;
  window._scpGetImageById = getImageById;
  window._scpGetAllImageTags = getAllImageTags;
  window._scpParseImageField = parseImageField;

  // CRUD
  window._scpCreateNewPost = createNewPost;
  window._scpSavePostField = savePostField;

  // AI Text Formatting
  window._scpCleanAIText = cleanAIText;
  window._scpFormatContentForPreview = formatContentForPreview;
  window._scpParsePromptSections = parsePromptSections;

  // Constants
  window._scpConstants = {
    APP_VIEWS: APP_VIEWS, POST_TYPES: POST_TYPES, PLATFORMS: PLATFORMS,
    POST_STATUSES: POST_STATUSES, STATUS_ORDER: STATUS_ORDER, ACTIVE_STATUSES: ACTIVE_STATUSES,
    WORKFLOW_GROUPS: WORKFLOW_GROUPS, GROUPING_OPTIONS: GROUPING_OPTIONS, PIPELINE_STEPS: PIPELINE_STEPS,
    PRIORITY_LEVELS: PRIORITY_LEVELS, ACTIVITY_TYPES: ACTIVITY_TYPES, CARD_DENSITIES: CARD_DENSITIES,
    MEDIA_PROMPT_STATUSES: MEDIA_PROMPT_STATUSES
  };

  console.log('[SCP] Part 1 loaded');
})(jQuery, Drupal);


/* ----- src/editing/steps/basics.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 1 â€” Basics. Title, type chips, priority,
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
  // SECTION 5: STEP 1 â€” BASICS
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
      html += '<div class="scp-info-strip">' + icon('flask') + ' From research session â€¢ Created ' + formatDate(post.created) + '</div>';
    }

    html += '</div>';
    return html;
  }

  window._scpRenderers = window._scpRenderers || {};
  window._scpRenderers.step_basics = renderBasicsStep;
  window._scpRenderBasicsStep = renderBasicsStep;

})(jQuery);


/* ----- src/editing/steps/research.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 2 â€” Research. Two-phase UI: angle research
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
  // SECTION 6: STEP 2 â€” RESEARCH (Angles + Hooks)
  // ============================================================

  function renderResearchStep(post) {
    _resolveHelpers();
    var r = post.research || {};
    var angles = r.angles || [];
    var hooks = r.hooks || [];
    var hasSelectedAngle = !!r.selected_angle;
    var hasSelectedHook = !!r.selected_hook;

    var html = '<div class="scp-editor-form" data-post-id="' + esc(post.id) + '">';

    // â”€â”€â”€ PHASE 1: ANGLE RESEARCH â”€â”€â”€
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

    // â”€â”€â”€ PHASE 2: HOOK RESEARCH (unlocked after angle) â”€â”€â”€
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


/* ----- src/editing/steps/content.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 3 â€” Content. Main social composer + type-specific
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
  // SECTION 7: STEP 3 â€” CONTENT
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
    html += '<p class="scp-text-sm scp-text-muted">Compose your master content â€” hook, body, CTA, and hashtags all in one place.</p>';
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
        html += '<span class="scp-slide-vp-badge" title="Visual plan exists â€” go to Media step to view">' + icon('circle-check') + '</span>';
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

    // â”€â”€â”€ Structured Script Output (via AIO renderer) â”€â”€â”€
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

    // â”€â”€â”€ Legacy plain-text script (shown if no structured script, or as fallback) â”€â”€â”€
    if (!hasStructuredScript) {
      html += '<div class="scp-form-group"><label>Script' + (vid.script ? '' : ' <span class="scp-text-xs scp-text-muted">â€” click AI Script above to generate</span>') + '</label>';
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


/* ----- src/editing/steps/media.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 4 â€” Media. Style selector + custom instructions
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
  // SECTION 8: STEP 4 â€” MEDIA PROMPTS
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

    // â”€â”€â”€ Context strip â€” show what message this visual should deliver â”€â”€â”€
    var r = post.research || {};
    var contentBody = (post.content && post.content.body) || '';
    html += '<div class="scp-media-context">';
    html += '<div class="scp-media-context-header">' + icon('lightbulb') + ' <strong>Content Context</strong> <span class="scp-text-xs scp-text-muted">â€” the AI will plan visuals that deliver this message</span></div>';
    if (r.selected_hook) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Hook:</span> <span>"' + esc(truncate(r.selected_hook, 80)) + '"</span></div>';
    if (r.selected_angle) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Angle:</span> <span>' + esc(r.selected_angle) + '</span></div>';
    if (contentBody) html += '<div class="scp-media-context-item"><span class="scp-media-context-label">Content:</span> <span>' + esc(truncate(contentBody, 120)) + '</span></div>';
    if (!r.selected_hook && !contentBody) html += '<div class="scp-media-context-item scp-text-muted">' + icon('info') + ' Complete the Research and Content steps first for better visual planning.</div>';
    html += '</div>';

    // â”€â”€â”€ Style selection â”€â”€â”€
    html += '<div class="scp-media-style-row">';
    html += '<div class="scp-form-group" style="flex:1"><label>Visual Style Reference</label>';
    html += '<select class="scp-select scp-media-config-field" data-config-field="style_id">';
    html += '<option value="">Auto (let AI decide)</option>';
    for (var si = 0; si < styles.length; si++) html += '<option value="' + esc(styles[si].id) + '"' + (config.style_id === styles[si].id ? ' selected' : '') + '>' + esc(styles[si].name) + ' â€” ' + esc(styles[si].description || '') + '</option>';
    html += '</select></div>';
    html += '<div class="scp-form-group" style="flex:1"><label>Additional Direction</label>';
    html += '<input type="text" class="scp-input scp-media-config-field" data-config-field="custom_instructions" value="' + esc(config.custom_instructions || '') + '" placeholder="Optional: specific requirements, mood, constraints..."></div>';
    html += '</div>';

    // â”€â”€â”€ Brand toggle + Generate button â”€â”€â”€
    html += '<div class="scp-media-actions">';
    html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-media-brand-toggle"' + (config.brand_context_enabled !== false ? ' checked' : '') + '> Include Brand Context</label>';
    var genLabel = post.type === 'carousel' ? 'Plan All Slides' : post.type === 'video' ? 'Plan Thumbnail' : 'Plan Visual';
    html += '<button class="scp-btn scp-btn-ai" data-action="ai-generate-visual-plan">' + icon('sparkles') + ' ' + genLabel + '</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-generate-media') : '');
    html += '</div>';

    // â”€â”€â”€ Output: Visual Plan (rendered via AIO engine) â”€â”€â”€
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

    // â”€â”€â”€ Legacy: Old-style prompt output (backward compat) â”€â”€â”€
    if (hasLegacyPrompts && !hasVisualPlan && !hasCarouselPlans) {
      html += renderLegacyPromptOutput(post, media.prompts);
    }

    html += '</div>';
    return html;
  }

  // Legacy prompt card rendering â€” kept for backward compatibility with old data
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


/* ----- src/editing/steps/platforms.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 5 â€” Platforms. Per-platform composer (or YouTube
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
  // SECTION 9: STEP 5 â€” PLATFORMS
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


/* ----- src/editing/steps/schedule.js ----- */

/**
 * @category    editing
 * @purpose     Pipeline step 6 â€” Schedule. Date/time/timezone inputs +
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
  // SECTION 10: STEP 6 â€” SCHEDULE
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
        html += '<div class="scp-perf-cell"><div class="scp-perf-label">' + perfMetrics[mi] + '</div><div class="scp-perf-value">â€”</div></div>';
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


/* ----- src/editing/scp-part2a.js ----- */

/**
 * Social Content Planner v1.0 - Part 2A: Pipeline Editor & CRUD
 *
 * Modals, undo/redo, post/tag CRUD, 6 pipeline step renderers,
 * social composer component, tag input, inline editing.
 *
 * Registry: step_basics, step_research, step_content, step_media,
 *   step_platforms, step_schedule, tagInput, socialComposer
 *
 * Sections:
 *  1. Init & imports
 *  2. Modal system
 *  3. Undo/redo
 *  4. Post & tag CRUD
 *  5. Step 1: Basics renderer
 *  6. Step 2: Research renderer (angles + hooks)
 *  7. Step 3: Content renderer (social composer + carousel + video)
 *  8. Step 4: Media prompts renderer
 *  9. Step 5: Platforms renderer
 * 10. Step 6: Schedule renderer
 * 11. Social composer component
 * 12. Tag input component
 * 13. Event handlers
 * 14. Data save helpers
 * 15. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea;
  var updateSaveStatus, esc, deepClone, icon, formatDate, formatRelativeTime;
  var truncate, statusBadge, typeBadge, priorityBadge, platformBadge, mediaPromptStatusBadge;
  var logActivity, countWords, countChars, formatCharCount, formatNumber;
  var maybeAdvanceStatus, resolveTag, resolveTone, resolveAudience, resolveImageStyle;
  var getPlatformConfig, progressBar, badge;
  var cleanAIText, formatContentForPreview, parsePromptSections;
  var Constants;

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._scpState && window._scpState.initialized) { clearInterval(checkInterval); initPart2A(); }
    else if (_checkCount > 100) { clearInterval(checkInterval); console.error('[SCP] Part 2A: Timed out waiting for Part 1'); }
  }, 100);

  function initPart2A() {
    console.log('[SCP] Initializing Part 2A...');
    S = window._scpState;
    render = window._scpRender; navigate = window._scpNavigate; toast = window._scpToast;
    generateId = window._scpGenerateId; buildMaps = window._scpBuildMaps;
    syncToTextarea = window._scpSyncToTextarea; updateSaveStatus = window._scpUpdateSaveStatus;
    esc = window._scpEsc; deepClone = window._scpDeepClone; icon = window._scpIcon;
    formatDate = window._scpFormatDate; formatRelativeTime = window._scpFormatRelativeTime;
    truncate = window._scpTruncate; formatNumber = window._scpFormatNumber;
    formatCharCount = window._scpFormatCharCount;
    statusBadge = window._scpStatusBadge; typeBadge = window._scpTypeBadge;
    priorityBadge = window._scpPriorityBadge; platformBadge = window._scpPlatformBadge;
    mediaPromptStatusBadge = window._scpMediaPromptStatusBadge;
    logActivity = window._scpLogActivity; countWords = window._scpCountWords;
    countChars = window._scpCountChars; badge = window._scpBadge;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    resolveTag = window._scpResolveTag; resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience; resolveImageStyle = window._scpResolveImageStyle;
    getPlatformConfig = window._scpGetPlatformConfig; progressBar = window._scpProgressBar;
    cleanAIText = window._scpCleanAIText; formatContentForPreview = window._scpFormatContentForPreview;
    parsePromptSections = window._scpParsePromptSections;
    Constants = window._scpConstants;

    // AI picker helper â€” lazy evaluation (Part 2B may not be loaded yet)
    window._scpAiSel = function(actionId) {
      if (window._scpPart2B && window._scpPart2B.renderInlinePicker) {
        return window._scpPart2B.renderInlinePicker(actionId);
      }
      // Part 2B not ready yet â€” show loading placeholder that gets replaced later
      return '<span class="scp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon('spinner') + '</span>';
    };

    // Register step renderers
    var R = window._scpRenderers = window._scpRenderers || {};
    R.tagInput = renderTagInput;
    R.socialComposer = renderSocialComposer;

    setupPart2AEvents();
    snapshot('Initial state');
    if (render) render();
    console.log('[SCP] Part 2A initialized');
  }

  // ============================================================
  // SECTION 2: MODAL SYSTEM
  // ============================================================

  var currentModal = null;
  function openModal(title, content, options) {
    options = options || {}; closeModal();
    var size = options.size || 'md';
    var html = '<div class="scp-modal-backdrop"><div class="scp-modal scp-modal-' + size + '">';
    html += '<div class="scp-modal-header"><h3>' + esc(title) + '</h3><button class="scp-btn-icon scp-modal-close" data-action="close-modal">' + icon('x') + '</button></div>';
    html += '<div class="scp-modal-body">' + content + '</div>';
    if (options.footer !== false) {
      html += '<div class="scp-modal-footer"><button class="scp-btn scp-btn-outline" data-action="close-modal">Cancel</button>';
      html += '<button class="scp-btn ' + (options.danger ? 'scp-btn-danger' : 'scp-btn-primary') + '" data-action="modal-save">' + (options.saveLabel || 'Save') + '</button></div>';
    }
    html += '</div></div>';
    $('body').append(html); currentModal = options;
    setTimeout(function() { $('.scp-modal-backdrop').addClass('scp-modal-visible'); }, 10);
  }

  function closeModal() { $('.scp-modal-backdrop').remove(); currentModal = null; }

  function openConfirmDialog(opts) {
    var html = '<div class="scp-confirm-backdrop"><div class="scp-confirm-dialog"><h3>' + esc(opts.title || 'Confirm') + '</h3><p>' + esc(opts.message || 'Are you sure?') + '</p>';
    html += '<div class="scp-confirm-actions"><button class="scp-btn scp-btn-outline" data-action="confirm-cancel">Cancel</button>';
    html += '<button class="scp-btn ' + (opts.danger ? 'scp-btn-danger' : 'scp-btn-primary') + '" data-action="confirm-ok">' + esc(opts.confirmLabel || 'Confirm') + '</button></div></div></div>';
    $('body').append(html);
    $(document).off('click.scp2a-cok').on('click.scp2a-cok', '[data-action="confirm-ok"]', function() { closeConfirmDialog(); if (opts.onConfirm) opts.onConfirm(); });
    $(document).off('click.scp2a-ccn').on('click.scp2a-ccn', '[data-action="confirm-cancel"]', function() { closeConfirmDialog(); });
  }

  function closeConfirmDialog() { $('.scp-confirm-backdrop').remove(); $(document).off('click.scp2a-cok click.scp2a-ccn'); }

  function collectModalFields() {
    var data = {};
    $('.scp-modal-body [data-field]').each(function() {
      var $f = $(this);
      data[$f.data('field')] = $f.is(':checkbox') ? $f.is(':checked') : $f.val();
    });
    return data;
  }

  // ============================================================
  // SECTION 3: UNDO/REDO
  // ============================================================

  function snapshot(label) {
    S.undoStack = S.undoStack || [];
    S.undoStack.push({ label: label || '', data: deepClone(S.data), meta: deepClone(S.meta), activity: deepClone(S.activity) });
    if (S.undoStack.length > 50) S.undoStack.shift();
    S.redoStack = [];
  }

  function undo() {
    if (!S.undoStack || S.undoStack.length <= 1) { toast('Nothing to undo', 'info'); return; }
    S.redoStack = S.redoStack || [];
    S.redoStack.push(S.undoStack.pop());
    var prev = S.undoStack[S.undoStack.length - 1];
    S.data = deepClone(prev.data);
    if (prev.meta) S.meta = deepClone(prev.meta);
    if (prev.activity) S.activity = deepClone(prev.activity);
    buildMaps(); render(); syncToTextarea(); toast('Undone', 'info');
  }

  function redo() {
    if (!S.redoStack || S.redoStack.length === 0) { toast('Nothing to redo', 'info'); return; }
    var next = S.redoStack.pop();
    S.undoStack.push(next);
    S.data = deepClone(next.data);
    if (next.meta) S.meta = deepClone(next.meta);
    if (next.activity) S.activity = deepClone(next.activity);
    buildMaps(); render(); syncToTextarea(); toast('Redone', 'info');
  }

  // ============================================================
  // SECTION 4: POST & TAG CRUD
  // ============================================================

  function deletePost(postId) {
    var post = S.postMap[postId]; if (!post) return;
    openConfirmDialog({
      title: 'Delete Post', message: 'Delete "' + (post.title || 'Untitled') + '"?', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        S.data.posts = (S.data.posts || []).filter(function(p) { return p.id !== postId; });
        if (S.selectedPostId === postId) S.selectedPostId = null;
        logActivity('post_deleted', postId, post.title, 'Post deleted');
        snapshot('Delete post'); buildMaps(); render(); syncToTextarea(); toast('Post deleted', 'success');
      }
    });
  }

  function duplicatePost(postId) {
    var post = S.postMap[postId]; if (!post) return;
    var clone = deepClone(post);
    clone.id = generateId('post');
    clone.title = (clone.title || '') + ' (copy)';
    clone.status = 'idea';
    clone.created = new Date().toISOString();
    clone.updated = clone.created;
    clone.schedule = { date: '', time: '', timezone: '', published_urls: {} };
    clone.performance = {};
    S.data.posts.unshift(clone);
    logActivity('post_created', clone.id, clone.title, 'Post duplicated');
    snapshot('Duplicate post'); buildMaps(); S.selectedPostId = clone.id; S.currentStep = 'basics';
    render(); syncToTextarea(); toast('Post duplicated', 'success');
  }

  function promoteResearchIdea(sessionId, ideaId) {
    var session = S.researchMap[sessionId]; if (!session) return;
    var idea = null;
    for (var i = 0; i < (session.results || []).length; i++) {
      if (session.results[i].id === ideaId) { idea = session.results[i]; break; }
    }
    if (!idea) return;
    var defs = (S.meta.settings && S.meta.settings.defaults) || {};
    var post = window._scpCreateNewPost({
      title: idea.title || '',
      type: idea.type || defs.type || 'image',
      platforms: (idea.platforms && idea.platforms.length) ? idea.platforms : defs.platforms || ['linkedin'],
      hook: idea.hook || '',
      source: { type: 'research', research_session_id: sessionId, research_idea_id: ideaId, notes: '' }
    });
    if (post) {
      idea.promoted = true;
      idea.promoted_post_id = post.id;
      logActivity('post_promoted', post.id, post.title, 'Promoted from research');
      snapshot('Promote idea'); buildMaps(); syncToTextarea();
    }
  }

  function openNewTagModal() {
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var html = '<div class="scp-editor-form">';
    html += '<div class="scp-form-group"><label>Tag Name</label><input type="text" class="scp-input" data-field="name" placeholder="e.g. Product Launch Q2"></div>';
    html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" placeholder="What this tag represents..."></div>';
    html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button class="scp-color-swatch' + (ci === 0 ? ' scp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + colors[0] + '">';
    html += '</div></div></div>';
    openModal('New Tag', html, {
      saveLabel: 'Create Tag',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Tag name is required', 'warning'); return; }
        var tag = { id: generateId('tag'), name: fields.name.trim(), color: fields.color || colors[0], description: fields.description || '', created: new Date().toISOString() };
        S.data.tags = S.data.tags || [];
        S.data.tags.push(tag);
        logActivity('tag_created', '', '', 'Created tag: ' + tag.name);
        snapshot('Create tag'); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Tag "' + tag.name + '" created', 'success');
      }
    });
  }

  function editTagModal(tagId) {
    var tag = S.tagMap[tagId]; if (!tag) return;
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var html = '<div class="scp-editor-form">';
    html += '<div class="scp-form-group"><label>Tag Name</label><input type="text" class="scp-input" data-field="name" value="' + esc(tag.name) + '"></div>';
    html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" value="' + esc(tag.description || '') + '"></div>';
    html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button class="scp-color-swatch' + (tag.color === colors[ci] ? ' scp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + esc(tag.color) + '">';
    html += '</div></div></div>';
    openModal('Edit Tag', html, {
      saveLabel: 'Save',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Tag name is required', 'warning'); return; }
        tag.name = fields.name.trim(); tag.color = fields.color || tag.color; tag.description = fields.description || '';
        logActivity('tag_updated', '', '', 'Updated tag: ' + tag.name);
        snapshot('Edit tag'); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Tag updated', 'success');
      }
    });
  }

  function deleteTag(tagId) {
    var tag = S.tagMap[tagId]; if (!tag) return;
    openConfirmDialog({
      title: 'Delete Tag', message: 'Delete "' + tag.name + '"? Posts will be untagged.', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        S.data.tags = (S.data.tags || []).filter(function(t) { return t.id !== tagId; });
        // Remove tag from all posts
        (S.data.posts || []).forEach(function(p) { p.tags = (p.tags || []).filter(function(t) { return t !== tagId; }); });
        if (S.selectedTagId === tagId) S.selectedTagId = null;
        logActivity('tag_deleted', '', '', 'Deleted tag: ' + tag.name);
        snapshot('Delete tag'); buildMaps(); render(); syncToTextarea(); toast('Tag deleted', 'success');
      }
    });
  }

  // ============================================================
  // SECTIONS 5-10: STEP RENDERERS â€” extracted (v0.3.0)
  //   5   Basics     -> src/editing/steps/basics.js
  //   6   Research   -> src/editing/steps/research.js
  //   7   Content    -> src/editing/steps/content.js
  //   8   Media      -> src/editing/steps/media.js
  //   9   Platforms  -> src/editing/steps/platforms.js
  //   10  Schedule   -> src/editing/steps/schedule.js
  // Each step file self-registers into window._scpRenderers.step_X at
  // its own module-load time. The R.step_X = ... lines previously at the
  // top of initPart2A are also removed in this commit.
  // ============================================================
  var renderBasicsStep    = window._scpRenderBasicsStep;
  var renderResearchStep  = window._scpRenderResearchStep;
  var renderContentStep   = window._scpRenderContentStep;
  var renderMediaStep     = window._scpRenderMediaStep;
  var renderPlatformsStep = window._scpRenderPlatformsStep;
  var renderScheduleStep  = window._scpRenderScheduleStep;

  // ============================================================
  // SECTION 11: SOCIAL COMPOSER COMPONENT
  // ============================================================

  function renderSocialComposer(id, content, options) {
    options = options || {};
    var charLimit = options.charLimit || 3000;
    var label = options.label || 'Post';
    var color = options.color || 'var(--scp-primary)';
    var currentChars = countChars(content);
    var wordCount = countWords(content);

    var html = '<div class="scp-composer" data-composer-id="' + esc(id) + '">';
    // Header
    html += '<div class="scp-composer-header" style="border-color:' + color + '20;background:' + color + '08">';
    html += '<div class="scp-composer-identity">';
    html += '<div class="scp-composer-avatar" style="background:' + color + '">' + icon(options.platform ? Constants.PLATFORMS[options.platform].icon : 'pen-fancy') + '</div>';
    html += '<div><div class="scp-composer-name">' + esc((S.meta.workspace && S.meta.workspace.name) || 'Brand') + '</div>';
    html += '<div class="scp-composer-meta">' + esc(label) + ' â€¢ Draft</div></div></div>';
    html += '<div class="scp-composer-stats">';
    html += '<div class="scp-composer-char-count">' + formatCharCount(currentChars, charLimit) + '</div>';
    if (wordCount > 0) html += '<span class="scp-composer-word-count">' + wordCount + ' words</span>';
    html += '</div>';
    html += '</div>';

    // Edit/Preview toggle
    html += '<div class="scp-composer-tabs">';
    html += '<button class="scp-composer-tab scp-composer-tab-active" data-action="composer-mode" data-mode="edit" data-composer="' + esc(id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="scp-composer-tab" data-action="composer-mode" data-mode="preview" data-composer="' + esc(id) + '">' + icon('eye') + ' Preview</button>';
    html += '</div>';

    // Body â€” Edit mode (default)
    html += '<div class="scp-composer-body scp-composer-edit-mode" data-composer-panel="edit-' + esc(id) + '">';
    html += '<textarea class="scp-composer-textarea" data-composer-id="' + esc(id) + '" placeholder="Write your ' + esc(label.toLowerCase()) + ' here...\n\nInclude hook, body, CTA, and hashtags â€” all in one place.">' + esc(content) + '</textarea>';
    html += '</div>';

    // Body â€” Preview mode (hidden by default)
    html += '<div class="scp-composer-body scp-composer-preview-mode" data-composer-panel="preview-' + esc(id) + '" style="display:none">';
    html += '<div class="scp-composer-preview">';
    if (content && content.trim()) {
      html += formatContentForPreview(content);
    } else {
      html += '<span class="scp-text-muted">Write content above to see preview</span>';
    }
    html += '</div></div>';

    // Footer toolbar
    html += '<div class="scp-composer-footer">';
    html += '<div class="scp-composer-tools">';
    html += '<button class="scp-composer-tool" title="Bold">' + icon('bold') + '</button>';
    html += '<button class="scp-composer-tool" title="Italic">' + icon('italic') + '</button>';
    html += '<button class="scp-composer-tool" title="Emoji">' + icon('face-smile') + '</button>';
    html += '<button class="scp-composer-tool" title="Hashtag">' + icon('hashtag') + '</button>';
    html += '<button class="scp-composer-tool" title="Mention">' + icon('at') + '</button>';
    html += '</div>';
    html += '<div class="scp-composer-ai-btns">';
    html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-write-content" data-composer="' + esc(id) + '">' + icon('sparkles') + ' AI Write</button>';
    html += (window._scpAiSel ? window._scpAiSel('ai-write-content') : '');
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="ai-improve-content" data-composer="' + esc(id) + '">Improve</button>';
    html += '</div></div>';
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 12: TAG INPUT COMPONENT
  // ============================================================

  function renderTagInput(tagIds, postId) {
    var html = '<div class="scp-tag-input" data-post-id="' + esc(postId || '') + '">';
    html += '<div class="scp-tag-chips">';
    for (var i = 0; i < tagIds.length; i++) {
      var tag = resolveTag(tagIds[i]);
      if (tag) {
        html += '<span class="scp-tag-input-chip" style="background:' + tag.color + '15;color:' + tag.color + ';border-color:' + tag.color + '30">';
        html += esc(tag.name) + ' <button class="scp-tag-remove" data-action="remove-post-tag" data-tag-id="' + esc(tag.id) + '" data-post-id="' + esc(postId) + '">&times;</button></span>';
      }
    }
    // Add tag dropdown
    var availTags = (S.data.tags || []).filter(function(t) { return tagIds.indexOf(t.id) < 0; });
    if (availTags.length > 0) {
      html += '<select class="scp-select scp-select-sm scp-tag-add-select" data-post-id="' + esc(postId) + '">';
      html += '<option value="">+ Add tag</option>';
      for (var ai = 0; ai < availTags.length; ai++) html += '<option value="' + esc(availTags[ai].id) + '">' + esc(availTags[ai].name) + '</option>';
      html += '</select>';
    }
    html += '</div></div>';
    return html;
  }

  // ============================================================
  // SECTION 12.5: AI OUTPUT RENDERER ENGINE
  // ============================================================
  //
  // Universal structured-output renderer: takes AI JSON data + a schema
  // definition, renders visual cards with expandable sections, inline
  // editing, and multi-format export.
  //
  // Used by: image visual plans, video scripts, carousel plans.

  // â”€â”€â”€ OUTPUT SCHEMAS â”€â”€â”€

  var OUTPUT_SCHEMAS = {
    image_visual_plan: {
      id: 'image_visual_plan', label: 'Visual Content Plan', icon: 'image',
      sections: [
        { key: 'visual_concept', label: 'Visual Concept', icon: 'eye', color: '#1a73e8', expanded: true, description: 'What the audience sees and feels',
          fields: [
            { key: 'scene', label: 'Scene / Subject', type: 'textarea', rows: 2, placeholder: 'Describe what the image showsâ€¦' },
            { key: 'emotion', label: 'Emotion / Feeling', type: 'text', placeholder: 'What feeling should this evoke?' },
            { key: 'message_delivered', label: 'Core Message', type: 'text', placeholder: 'What does the viewer take away?' }
          ]
        },
        { key: 'text_overlays', label: 'Text on Image', icon: 'font', color: '#7c3aed', expanded: true, description: 'Text that appears ON the image',
          fields: [
            { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Primary text overlay' },
            { key: 'subtext', label: 'Subtext', type: 'text', placeholder: 'Supporting text (optional)' },
            { key: 'cta', label: 'CTA', type: 'text', placeholder: 'Call to action text' }
          ]
        },
        { key: 'color_mood', label: 'Color & Mood', icon: 'palette', color: '#e37400', expanded: false,
          fields: [
            { key: 'palette', label: 'Color Palette', type: 'text', placeholder: 'Dominant colors and transitions' },
            { key: 'mood', label: 'Mood', type: 'text', placeholder: 'Overall emotional tone' },
            { key: 'contrast', label: 'Contrast', type: 'text', placeholder: 'Contrast approach for readability' }
          ]
        },
        { key: 'layout', label: 'Layout Direction', icon: 'layout-grid', color: '#0891b2', expanded: false,
          fields: [
            { key: 'composition', label: 'Composition', type: 'text', placeholder: 'How elements are arranged' },
            { key: 'focal_point', label: 'Focal Point', type: 'text', placeholder: 'Where the eye goes first' },
            { key: 'text_placement', label: 'Text Placement', type: 'text', placeholder: 'Where text overlays sit' }
          ]
        },
        { key: '_meta', label: 'Technical', icon: 'gear', color: '#80868b', expanded: false,
          fields: [
            { key: 'style_notes', label: 'Style Notes', type: 'text', placeholder: 'Overall style direction' },
            { key: 'generation_prompt', label: 'Generation Prompt', type: 'textarea', rows: 4, placeholder: 'Technical prompt for AI image generators', mono: true }
          ]
        }
      ],
      exports: ['plain', 'json', 'markdown']
    },

    video_script: {
      id: 'video_script', label: 'Video Script', icon: 'video',
      sections: [
        { key: 'hook', label: 'Hook', icon: 'bolt', color: '#d93025', expanded: true, description: 'The scroll-stopping opening',
          fields: [
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Spoken wordsâ€¦' },
            { key: 'visual', label: 'Visual / Shot', type: 'text', placeholder: 'What the viewer sees' },
            { key: 'on_screen_text', label: 'On-Screen Text', type: 'text', placeholder: 'Text overlay' },
            { key: 'duration_seconds', label: 'Duration', type: 'number', suffix: 's', placeholder: '3' },
            { key: 'analysis', label: 'Hook Analysis', type: 'textarea', rows: 2, placeholder: 'Why this opening worksâ€¦', muted: true }
          ]
        },
        { key: 'body', label: 'Main Body', icon: 'pen-fancy', color: '#1a73e8', expanded: true, description: 'The core content sections', isList: true,
          fields: [
            { key: 'section', label: 'Section Name', type: 'text', placeholder: 'e.g. Problem, Solution, Proof' },
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Spoken wordsâ€¦' },
            { key: 'visual', label: 'Visual / Shot', type: 'text', placeholder: 'What the viewer sees' },
            { key: 'on_screen_text', label: 'On-Screen Text', type: 'text', placeholder: 'Text overlay' },
            { key: 'duration_seconds', label: 'Duration', type: 'number', suffix: 's', placeholder: '10' }
          ]
        },
        { key: 'outro', label: 'Outro & CTA', icon: 'rocket', color: '#0d904f', expanded: true, description: 'The closing and call to action',
          fields: [
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Closing wordsâ€¦' },
            { key: 'visual', label: 'Visual / Shot', type: 'text', placeholder: 'Closing visual' },
            { key: 'on_screen_text', label: 'On-Screen Text', type: 'text', placeholder: 'Final text overlay' },
            { key: 'cta', label: 'CTA', type: 'text', placeholder: 'e.g. Follow + Save' },
            { key: 'duration_seconds', label: 'Duration', type: 'number', suffix: 's', placeholder: '5' }
          ]
        },
        { key: '_summary', label: 'Summary', icon: 'info', color: '#80868b', expanded: false,
          fields: [
            { key: 'total_duration', label: 'Total Duration', type: 'number', suffix: 's', readOnly: true },
            { key: 'music_suggestion', label: 'Music / Sound', type: 'text', placeholder: 'Music mood suggestion' }
          ]
        }
      ],
      exports: ['plain', 'json', 'markdown', 'voiceover']
    },

    carousel_visual_plan: {
      id: 'carousel_visual_plan', label: 'Carousel Visual Plan', icon: 'images',
      isSequence: true, sequenceLabel: 'Slide',
      sections: [
        { key: 'visual_concept', label: 'Visual Concept', icon: 'eye', color: '#1a73e8', expanded: true,
          fields: [
            { key: 'scene', label: 'Scene / Subject', type: 'textarea', rows: 2, placeholder: 'What this slide showsâ€¦' },
            { key: 'message_delivered', label: 'Slide Message', type: 'text', placeholder: 'What this slide communicates' }
          ]
        },
        { key: 'text_overlays', label: 'Text on Slide', icon: 'font', color: '#7c3aed', expanded: true,
          fields: [
            { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Primary text' },
            { key: 'subtext', label: 'Subtext', type: 'text', placeholder: 'Supporting text' }
          ]
        },
        { key: '_meta', label: 'Style', icon: 'palette', color: '#80868b', expanded: false,
          fields: [
            { key: 'generation_prompt', label: 'Generation Prompt', type: 'textarea', rows: 3, mono: true }
          ]
        }
      ],
      exports: ['plain', 'json', 'markdown']
    }
  };

  // â”€â”€â”€ MAIN RENDERER â”€â”€â”€

  /**
   * Renders a structured AI output as visual cards.
   *
   * @param {object} data â€” The parsed AI JSON data
   * @param {string} schemaId â€” Key into OUTPUT_SCHEMAS
   * @param {object} options â€” { outputId, postId, readOnly, onSave(path, value) }
   * @returns {string} HTML
   */
  function renderStructuredOutput(data, schemaId, options) {
    var schema = OUTPUT_SCHEMAS[schemaId];
    if (!schema || !data) return '<div class="scp-empty-state scp-empty-state--compact"><p>No structured data available.</p></div>';
    options = options || {};
    var oid = options.outputId || generateId('aio');
    var readOnly = !!options.readOnly;

    var html = '<div class="scp-aio" data-aio-id="' + esc(oid) + '" data-schema="' + esc(schemaId) + '" data-post-id="' + esc(options.postId || '') + '">';

    // â”€â”€â”€ Export toolbar â”€â”€â”€
    html += renderExportToolbar(data, schema, oid);

    // â”€â”€â”€ Sequence mode (carousel: array of items, each with sections) â”€â”€â”€
    if (schema.isSequence && Array.isArray(data)) {
      for (var si = 0; si < data.length; si++) {
        html += '<div class="scp-aio-sequence-item" data-seq-index="' + si + '">';
        html += '<div class="scp-aio-sequence-header">';
        html += '<span class="scp-aio-sequence-num">' + (si + 1) + '</span>';
        html += '<span class="scp-aio-sequence-label">' + esc(schema.sequenceLabel || 'Item') + ' ' + (si + 1) + '</span>';
        if (data[si].text_overlays && data[si].text_overlays.headline) html += '<span class="scp-text-sm scp-text-muted"> â€” ' + esc(truncate(data[si].text_overlays.headline, 40)) + '</span>';
        html += '</div>';
        html += renderSectionsForItem(data[si], schema.sections, oid + '_s' + si, readOnly);
        html += '</div>';
      }
    }
    // â”€â”€â”€ Single item mode (image plan, video script) â”€â”€â”€
    else {
      html += renderSectionsForItem(data, schema.sections, oid, readOnly);
    }

    html += '</div>';
    return html;
  }

  function renderSectionsForItem(data, sections, pathPrefix, readOnly) {
    var html = '';
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var secPath = pathPrefix + '.' + sec.key;
      var secData = (sec.key === '_meta' || sec.key === '_summary') ? data : (data[sec.key] || {});
      var isExpanded = sec.expanded !== false;

      // â”€â”€â”€ List sections (video body â€” array of sub-items) â”€â”€â”€
      if (sec.isList && Array.isArray(secData)) {
        html += '<div class="scp-aio-section scp-aio-section-list" data-section="' + esc(sec.key) + '">';
        html += renderSectionHeader(sec, isExpanded, secData.length + ' section' + (secData.length !== 1 ? 's' : ''));
        html += '<div class="scp-aio-section-body' + (isExpanded ? '' : ' scp-aio-collapsed') + '" data-aio-body="' + esc(secPath) + '">';
        for (var li = 0; li < secData.length; li++) {
          var itemLabel = secData[li].section || (sec.label + ' ' + (li + 1));
          html += '<div class="scp-aio-list-card" data-list-index="' + li + '">';
          html += '<div class="scp-aio-list-card-header" data-action="aio-toggle-list-item" data-path="' + esc(secPath + '.' + li) + '">';
          html += '<span class="scp-aio-list-num">' + (li + 1) + '</span>';
          html += '<span class="scp-aio-list-label">' + esc(itemLabel) + '</span>';
          if (secData[li].duration_seconds) html += '<span class="scp-aio-duration">' + secData[li].duration_seconds + 's</span>';
          html += '<span class="scp-aio-chevron">' + icon('chevron-down') + '</span>';
          html += '</div>';
          html += '<div class="scp-aio-list-card-body">';
          html += renderFieldSet(sec.fields, secData[li], secPath + '.' + li, readOnly);
          html += '</div></div>';
        }
        html += '</div></div>';
        continue;
      }

      // â”€â”€â”€ Standard section (object with fields) â”€â”€â”€
      html += '<div class="scp-aio-section" data-section="' + esc(sec.key) + '">';
      html += renderSectionHeader(sec, isExpanded, null);
      html += '<div class="scp-aio-section-body' + (isExpanded ? '' : ' scp-aio-collapsed') + '" data-aio-body="' + esc(secPath) + '">';
      if (sec.description) html += '<p class="scp-aio-section-desc">' + esc(sec.description) + '</p>';
      html += renderFieldSet(sec.fields, secData, secPath, readOnly);
      html += '</div></div>';
    }
    return html;
  }

  function renderSectionHeader(sec, isExpanded, badge_text) {
    var html = '<div class="scp-aio-section-header" data-action="aio-toggle-section" data-section="' + esc(sec.key) + '">';
    html += '<div class="scp-aio-section-title">';
    html += '<span class="scp-aio-section-icon" style="color:' + (sec.color || 'var(--scp-primary)') + '">' + icon(sec.icon || 'circle') + '</span>';
    html += '<strong>' + esc(sec.label) + '</strong>';
    if (badge_text) html += '<span class="scp-aio-section-badge">' + esc(badge_text) + '</span>';
    html += '</div>';
    html += '<span class="scp-aio-chevron">' + icon(isExpanded ? 'chevron-up' : 'chevron-down') + '</span>';
    html += '</div>';
    return html;
  }

  function renderFieldSet(fields, data, pathPrefix, readOnly) {
    var html = '<div class="scp-aio-fields">';
    for (var fi = 0; fi < fields.length; fi++) {
      var field = fields[fi];
      var value = data ? (data[field.key] !== undefined ? data[field.key] : '') : '';
      var fieldPath = pathPrefix + '.' + field.key;

      html += '<div class="scp-aio-field' + (field.muted ? ' scp-aio-field-muted' : '') + '" data-field-key="' + esc(field.key) + '">';
      html += '<label class="scp-aio-field-label">' + esc(field.label);
      if (field.suffix) html += ' <span class="scp-aio-field-suffix">(' + esc(field.suffix) + ')</span>';
      html += '</label>';

      if (readOnly || field.readOnly) {
        // Read-only display
        if (field.type === 'textarea') {
          html += '<div class="scp-aio-field-value scp-aio-field-value-multi">' + (value ? esc(String(value)).replace(/\n/g, '<br>') : '<span class="scp-text-muted">â€”</span>') + '</div>';
        } else {
          html += '<div class="scp-aio-field-value">' + (value ? esc(String(value)) + (field.suffix ? ' ' + esc(field.suffix) : '') : '<span class="scp-text-muted">â€”</span>') + '</div>';
        }
      } else {
        // Editable field
        if (field.type === 'textarea') {
          html += '<textarea class="scp-aio-input scp-aio-textarea' + (field.mono ? ' scp-aio-mono' : '') + '" data-aio-path="' + esc(fieldPath) + '" rows="' + (field.rows || 2) + '" placeholder="' + esc(field.placeholder || '') + '">' + esc(String(value)) + '</textarea>';
        } else if (field.type === 'number') {
          html += '<input type="number" class="scp-aio-input scp-aio-input-number" data-aio-path="' + esc(fieldPath) + '" value="' + esc(String(value)) + '" placeholder="' + esc(field.placeholder || '') + '">';
        } else {
          html += '<input type="text" class="scp-aio-input" data-aio-path="' + esc(fieldPath) + '" value="' + esc(String(value)) + '" placeholder="' + esc(field.placeholder || '') + '">';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // â”€â”€â”€ EXPORT TOOLBAR â”€â”€â”€

  function renderExportToolbar(data, schema, oid) {
    var exports = schema.exports || ['plain', 'json'];
    var html = '<div class="scp-aio-export-toolbar" data-aio-id="' + esc(oid) + '">';
    html += '<span class="scp-aio-export-label">' + icon('download') + ' Export:</span>';
    if (exports.indexOf('plain') > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="plain" data-aio-id="' + esc(oid) + '">Plain Text</button>';
    if (exports.indexOf('json') > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="json" data-aio-id="' + esc(oid) + '">JSON</button>';
    if (exports.indexOf('markdown') > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="markdown" data-aio-id="' + esc(oid) + '">Markdown</button>';
    if (exports.indexOf('voiceover') > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="voiceover" data-aio-id="' + esc(oid) + '">' + icon('play') + ' Voiceover Only</button>';
    html += '</div>';
    return html;
  }

  // â”€â”€â”€ EXPORT FORMATTERS â”€â”€â”€

  function exportStructuredOutput(data, schemaId, format) {
    var schema = OUTPUT_SCHEMAS[schemaId];
    if (!schema || !data) return '';
    switch(format) {
      case 'json': return JSON.stringify(data, null, 2);
      case 'markdown': return _exportMarkdown(data, schema);
      case 'voiceover': return _exportVoiceover(data, schema);
      default: return _exportPlainText(data, schema);
    }
  }

  function _exportPlainText(data, schema) {
    var lines = [];
    if (schema.isSequence && Array.isArray(data)) {
      for (var si = 0; si < data.length; si++) {
        lines.push('--- ' + (schema.sequenceLabel || 'Item') + ' ' + (si + 1) + ' ---');
        _flattenSections(data[si], schema.sections, lines, '');
        lines.push('');
      }
    } else {
      _flattenSections(data, schema.sections, lines, '');
    }
    return lines.join('\n').trim();
  }

  function _flattenSections(data, sections, lines, indent) {
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var secData = (sec.key === '_meta' || sec.key === '_summary') ? data : (data[sec.key] || {});
      if (sec.isList && Array.isArray(secData)) {
        lines.push(indent + sec.label.toUpperCase() + ':');
        for (var li = 0; li < secData.length; li++) {
          lines.push(indent + '  [' + (secData[li].section || sec.label + ' ' + (li + 1)) + ']');
          _flattenFields(sec.fields, secData[li], lines, indent + '  ');
        }
      } else {
        lines.push(indent + sec.label.toUpperCase() + ':');
        _flattenFields(sec.fields, secData, lines, indent + '  ');
      }
    }
  }

  function _flattenFields(fields, data, lines, indent) {
    for (var fi = 0; fi < fields.length; fi++) {
      var f = fields[fi]; var v = data ? data[f.key] : '';
      if (v !== '' && v !== undefined && v !== null) {
        lines.push(indent + f.label + ': ' + String(v));
      }
    }
  }

  function _exportMarkdown(data, schema) {
    var lines = ['# ' + schema.label, ''];
    if (schema.isSequence && Array.isArray(data)) {
      for (var si = 0; si < data.length; si++) {
        lines.push('## ' + (schema.sequenceLabel || 'Item') + ' ' + (si + 1));
        _mdSections(data[si], schema.sections, lines);
        lines.push('');
      }
    } else {
      _mdSections(data, schema.sections, lines);
    }
    return lines.join('\n').trim();
  }

  function _mdSections(data, sections, lines) {
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var secData = (sec.key === '_meta' || sec.key === '_summary') ? data : (data[sec.key] || {});
      if (sec.isList && Array.isArray(secData)) {
        lines.push('### ' + sec.label);
        for (var li = 0; li < secData.length; li++) {
          lines.push('#### ' + (secData[li].section || sec.label + ' ' + (li + 1)));
          _mdFields(sec.fields, secData[li], lines);
        }
      } else {
        lines.push('### ' + sec.label);
        _mdFields(sec.fields, secData, lines);
      }
      lines.push('');
    }
  }

  function _mdFields(fields, data, lines) {
    for (var fi = 0; fi < fields.length; fi++) {
      var f = fields[fi]; var v = data ? data[f.key] : '';
      if (v !== '' && v !== undefined && v !== null) {
        lines.push('**' + f.label + ':** ' + String(v));
      }
    }
  }

  function _exportVoiceover(data, schema) {
    // Extracts only voiceover/spoken text fields in order
    var lines = [];
    if (data.hook && data.hook.voiceover) lines.push('[HOOK] ' + data.hook.voiceover);
    if (data.body && Array.isArray(data.body)) {
      for (var i = 0; i < data.body.length; i++) {
        if (data.body[i].voiceover) lines.push('[' + (data.body[i].section || 'Body ' + (i+1)).toUpperCase() + '] ' + data.body[i].voiceover);
      }
    }
    if (data.outro && data.outro.voiceover) lines.push('[OUTRO] ' + data.outro.voiceover);
    return lines.join('\n\n');
  }

  // â”€â”€â”€ INLINE DATA EXTRACTION (read current values from DOM back to object) â”€â”€â”€

  function collectStructuredOutputData(oid) {
    var $aio = $('[data-aio-id="' + oid + '"]').first();
    if (!$aio.length) return null;
    var schemaId = $aio.data('schema');
    var schema = OUTPUT_SCHEMAS[schemaId];
    if (!schema) return null;

    // Build data object by reading all input values
    var data = {};
    $aio.find('.scp-aio-input').each(function() {
      var path = $(this).data('aio-path');
      if (!path) return;
      // Remove the oid prefix: "aio_abc.visual_concept.scene" â†’ "visual_concept.scene"
      var relativePath = path.replace(new RegExp('^' + oid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[._]?'), '');
      // Handle sequence paths: "s0.visual_concept.scene" â†’ index into array
      var val = $(this).is('input[type="number"]') ? (parseFloat($(this).val()) || 0) : $(this).val();
      _setByPath(data, relativePath, val);
    });
    return data;
  }

  function _setByPath(obj, path, value) {
    var parts = path.split('.');
    var target = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var part = parts[i];
      // Numeric parts â†’ array index
      if (/^\d+$/.test(parts[i + 1])) {
        target[part] = target[part] || [];
      } else if (/^\d+$/.test(part)) {
        var idx = parseInt(part, 10);
        while (target.length <= idx) target.push({});
        target = target[idx];
        continue;
      } else {
        target[part] = target[part] || {};
      }
      target = target[part];
    }
    var lastKey = parts[parts.length - 1];
    if (/^\d+$/.test(lastKey)) {
      var lastIdx = parseInt(lastKey, 10);
      while (target.length <= lastIdx) target.push({});
      target[lastIdx] = value;
    } else {
      target[lastKey] = value;
    }
  }

  // â”€â”€â”€ AIO EVENT HANDLERS â”€â”€â”€

  function setupAIOEvents() {
    // Section expand/collapse
    $(document).off('click.scp-aio-ts', '[data-action="aio-toggle-section"]').on('click.scp-aio-ts', '[data-action="aio-toggle-section"]', function(e) {
      e.preventDefault();
      var $header = $(this);
      var $body = $header.next('.scp-aio-section-body');
      var isCollapsed = $body.hasClass('scp-aio-collapsed');
      $body.toggleClass('scp-aio-collapsed');
      $header.find('.scp-aio-chevron').html(icon(isCollapsed ? 'chevron-up' : 'chevron-down'));
    });

    // List item expand/collapse
    $(document).off('click.scp-aio-tli', '[data-action="aio-toggle-list-item"]').on('click.scp-aio-tli', '[data-action="aio-toggle-list-item"]', function(e) {
      e.preventDefault();
      var $body = $(this).next('.scp-aio-list-card-body');
      $body.toggleClass('scp-aio-collapsed');
      $(this).find('.scp-aio-chevron').html(icon($body.hasClass('scp-aio-collapsed') ? 'chevron-down' : 'chevron-up'));
    });

    // Inline field edit â†’ save back to post data
    $(document).off('blur.scp-aio-fe', '.scp-aio-input').on('blur.scp-aio-fe', '.scp-aio-input', function() {
      var path = $(this).data('aio-path');
      if (!path) return;
      var $aio = $(this).closest('.scp-aio');
      var postId = $aio.data('post-id');
      if (!postId || !S.postMap[postId]) return;
      // Trigger save callback if registered, otherwise auto-save
      var val = $(this).is('input[type="number"]') ? (parseFloat($(this).val()) || 0) : $(this).val();
      // Store updated value via the onSave callback pattern
      if (window._scpAIOSaveField) window._scpAIOSaveField(postId, path, val);
    });

    // Export buttons
    $(document).off('click.scp-aio-exp', '[data-action="aio-export"]').on('click.scp-aio-exp', '[data-action="aio-export"]', function(e) {
      e.preventDefault();
      var format = $(this).data('format');
      var oid = $(this).data('aio-id');
      var $aio = $('[data-aio-id="' + oid + '"]').first();
      var schemaId = $aio.data('schema');
      // Collect current data from DOM (includes inline edits)
      var currentData = collectStructuredOutputData(oid);
      if (!currentData) { toast('No data to export', 'warning'); return; }
      var output = exportStructuredOutput(currentData, schemaId, format);
      if (output) {
        navigator.clipboard.writeText(output).then(function() {
          var formatLabel = { plain: 'Plain text', json: 'JSON', markdown: 'Markdown', voiceover: 'Voiceover script' };
          toast((formatLabel[format] || format) + ' copied to clipboard!', 'success');
        });
      }
    });
  }

  // Register AIO events when Part 2A initializes
  // (called at end of setupPart2AEvents)

  // ============================================================
  // SECTION 13: EVENT HANDLERS
  // ============================================================

  function setupPart2AEvents() {
    // --- Modal events ---
    $(document).off('click.scp2a-cm', '[data-action="close-modal"]').on('click.scp2a-cm', '[data-action="close-modal"]', function(e) { e.preventDefault(); closeModal(); });
    $(document).off('click.scp2a-ms', '[data-action="modal-save"]').on('click.scp2a-ms', '[data-action="modal-save"]', function(e) { e.preventDefault(); if (currentModal && currentModal.onSave) currentModal.onSave(); });
    $(document).off('click.scp2a-mb', '.scp-modal-backdrop').on('click.scp2a-mb', '.scp-modal-backdrop', function(e) { if ($(e.target).hasClass('scp-modal-backdrop')) closeModal(); });

    // --- Color picker in modals ---
    $(document).off('click.scp2a-cp', '[data-action="pick-color"]').on('click.scp2a-cp', '[data-action="pick-color"]', function(e) {
      e.preventDefault(); var color = $(this).data('color');
      $(this).siblings('.scp-color-swatch').removeClass('scp-color-swatch-active');
      $(this).addClass('scp-color-swatch-active');
      $(this).siblings('input[data-field="color"]').val(color);
    });

    // --- Tag CRUD ---
    $(document).off('click.scp2a-nt', '[data-action="new-tag"]').on('click.scp2a-nt', '[data-action="new-tag"]', function(e) { e.preventDefault(); openNewTagModal(); });
    $(document).off('click.scp2a-et', '[data-action="edit-tag"]').on('click.scp2a-et', '[data-action="edit-tag"]', function(e) { e.preventDefault(); editTagModal($(this).data('id')); });
    $(document).off('click.scp2a-dt', '[data-action="delete-tag"]').on('click.scp2a-dt', '[data-action="delete-tag"]', function(e) { e.preventDefault(); deleteTag($(this).data('id')); });

    // --- Post type selector (basics step) ---
    $(document).off('click.scp2a-spt', '[data-action="set-post-type"]').on('click.scp2a-spt', '[data-action="set-post-type"]', function(e) {
      e.preventDefault(); var type = $(this).data('type');
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      post.type = type; post.updated = new Date().toISOString();
      snapshot('Change type'); buildMaps(); syncToTextarea(); render();
    });

    // --- Platform checkboxes (basics step) ---
    $(document).off('change.scp2a-plc', '.scp-platform-check').on('change.scp2a-plc', '.scp-platform-check', function() {
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      var pk = $(this).data('platform'); var checked = $(this).is(':checked');
      post.platforms = post.platforms || [];
      if (checked && post.platforms.indexOf(pk) < 0) post.platforms.push(pk);
      else if (!checked) post.platforms = post.platforms.filter(function(p) { return p !== pk; });
      post.updated = new Date().toISOString(); syncToTextarea(); render();
    });

    // --- Basics field saves ---
    $(document).off('blur.scp2a-bf', '.scp-basics-field').on('blur.scp2a-bf', '.scp-basics-field', function() { saveBasicsField($(this)); });
    $(document).off('change.scp2a-bfc', 'select.scp-basics-field').on('change.scp2a-bfc', 'select.scp-basics-field', function() { saveBasicsField($(this)); });

    // --- Content meta fields (tone, audience) ---
    $(document).off('change.scp2a-cmf', '.scp-content-meta-field').on('change.scp2a-cmf', '.scp-content-meta-field', function() {
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      var path = $(this).data('path'); var val = $(this).val();
      setNestedValue(post, path, val);
      post.updated = new Date().toISOString(); syncToTextarea();
    });

    // --- Tag add/remove on posts ---
    $(document).off('change.scp2a-ta', '.scp-tag-add-select').on('change.scp2a-ta', '.scp-tag-add-select', function() {
      var tagId = $(this).val(); var postId = $(this).data('post-id');
      if (!tagId || !postId) return;
      var post = S.postMap[postId]; if (!post) return;
      post.tags = post.tags || [];
      if (post.tags.indexOf(tagId) < 0) { post.tags.push(tagId); post.updated = new Date().toISOString(); syncToTextarea(); render(); }
    });
    $(document).off('click.scp2a-tr', '[data-action="remove-post-tag"]').on('click.scp2a-tr', '[data-action="remove-post-tag"]', function(e) {
      e.preventDefault(); var tagId = $(this).data('tag-id'); var postId = $(this).data('post-id');
      var post = S.postMap[postId]; if (!post) return;
      post.tags = (post.tags || []).filter(function(t) { return t !== tagId; });
      post.updated = new Date().toISOString(); syncToTextarea(); render();
    });

    // --- Research: angle/hook selection ---
    $(document).off('change.scp2a-sa', '[data-action="select-angle"]').on('change.scp2a-sa', '[data-action="select-angle"]', function() { saveAngleSelection(parseInt($(this).data('index'), 10)); });
    $(document).off('change.scp2a-sh', '[data-action="select-hook"]').on('change.scp2a-sh', '[data-action="select-hook"]', function() { saveHookSelection(parseInt($(this).data('index'), 10)); });
    $(document).off('click.scp2a-aam', '[data-action="add-angle-manual"]').on('click.scp2a-aam', '[data-action="add-angle-manual"]', function(e) { e.preventDefault(); addResearchItem('angle'); });
    $(document).off('click.scp2a-ahm', '[data-action="add-hook-manual"]').on('click.scp2a-ahm', '[data-action="add-hook-manual"]', function(e) { e.preventDefault(); addResearchItem('hook'); });
    $(document).off('click.scp2a-ra', '[data-action="remove-angle"]').on('click.scp2a-ra', '[data-action="remove-angle"]', function(e) { e.preventDefault(); removeResearchItem('angle', parseInt($(this).data('index'), 10)); });
    $(document).off('click.scp2a-rh', '[data-action="remove-hook"]').on('click.scp2a-rh', '[data-action="remove-hook"]', function(e) { e.preventDefault(); removeResearchItem('hook', parseInt($(this).data('index'), 10)); });
    $(document).off('blur.scp2a-rn', '.scp-research-notes').on('blur.scp2a-rn', '.scp-research-notes', function() { saveResearchNotes($(this).val()); });
    $(document).off('blur.scp2a-ac', '.scp-angle-custom').on('blur.scp2a-ac', '.scp-angle-custom', function() { saveResearchCustomInput('angle', $(this).val()); });
    $(document).off('blur.scp2a-hc', '.scp-hook-custom').on('blur.scp2a-hc', '.scp-hook-custom', function() { saveResearchCustomInput('hook', $(this).val()); });

    // --- Composer textarea auto-save ---
    $(document).off('input.scp2a-ct', '.scp-composer-textarea').on('input.scp2a-ct', '.scp-composer-textarea', window._scpDebounce(function() { saveComposerContent($(this)); }, 500));

    // --- Composer edit/preview toggle ---
    $(document).off('click.scp2a-cmt', '[data-action="composer-mode"]').on('click.scp2a-cmt', '[data-action="composer-mode"]', function(e) {
      e.preventDefault();
      var mode = $(this).data('mode');
      var composerId = $(this).data('composer');
      var $composer = $(this).closest('.scp-composer');
      // Toggle tab active state
      $composer.find('.scp-composer-tab').removeClass('scp-composer-tab-active');
      $(this).addClass('scp-composer-tab-active');
      if (mode === 'preview') {
        $composer.find('[data-composer-panel="edit-' + composerId + '"]').hide();
        var $preview = $composer.find('[data-composer-panel="preview-' + composerId + '"]');
        // Refresh preview content from textarea
        var content = $composer.find('.scp-composer-textarea').val() || '';
        $preview.find('.scp-composer-preview').html(
          content.trim() ? (window._scpFormatContentForPreview ? window._scpFormatContentForPreview(content) : esc(content).replace(/\n/g, '<br>'))
          : '<span class="scp-text-muted">Write content above to see preview</span>'
        );
        $preview.show();
      } else {
        $composer.find('[data-composer-panel="preview-' + composerId + '"]').hide();
        $composer.find('[data-composer-panel="edit-' + composerId + '"]').show();
        $composer.find('.scp-composer-textarea').focus();
      }
    });

    // --- Prompt visual/raw view toggles ---
    $(document).off('click.scp2a-tpv', '[data-action="toggle-single-prompt-view"]').on('click.scp2a-tpv', '[data-action="toggle-single-prompt-view"]', function(e) {
      e.preventDefault();
      var idx = $(this).data('index');
      var $visual = $('[data-prompt-view="visual-' + idx + '"]');
      var $raw = $('[data-prompt-view="raw-' + idx + '"]');
      if ($raw.is(':visible')) {
        $raw.hide(); $visual.show();
        $(this).html(icon('edit') + ' Edit Raw');
      } else {
        $visual.hide(); $raw.show();
        $(this).html(icon('eye') + ' Visual View');
      }
    });
    $(document).off('click.scp2a-tpvm', '[data-action="toggle-prompt-view-mode"]').on('click.scp2a-tpvm', '[data-action="toggle-prompt-view-mode"]', function(e) {
      e.preventDefault();
      var allVisual = $('.scp-prompt-visual:visible').length > 0;
      if (allVisual) {
        $('.scp-prompt-visual').hide(); $('.scp-prompt-raw').show();
        $(this).html(icon('eye') + ' Visual View');
      } else {
        // Show visual where available, keep raw for simple prompts
        $('.scp-prompt-card').each(function() {
          var $v = $(this).find('.scp-prompt-visual');
          var $r = $(this).find('.scp-prompt-raw');
          if ($v.length && $v.children().length > 0) { $v.show(); $r.hide(); }
        });
        $(this).html(icon('edit') + ' Raw View');
      }
    });

    // --- Carousel slide fields ---
    $(document).off('blur.scp2a-sf', '.scp-slide-field').on('blur.scp2a-sf', '.scp-slide-field', function() { saveSlideField($(this)); });
    $(document).off('click.scp2a-ssc', '[data-action="set-slide-count"]').on('click.scp2a-ssc', '[data-action="set-slide-count"]', function(e) { e.preventDefault(); setSlideCount(parseInt($(this).data('count'), 10)); });

    // --- Video fields ---
    $(document).off('blur.scp2a-vf', '.scp-video-field').on('blur.scp2a-vf', '.scp-video-field', function() { saveVideoField($(this)); });
    $(document).off('click.scp2a-svd', '[data-action="set-video-duration"]').on('click.scp2a-svd', '[data-action="set-video-duration"]', function(e) { e.preventDefault(); setVideoProperty('duration_seconds', parseInt($(this).data('duration'), 10)); });
    $(document).off('click.scp2a-svf', '[data-action="set-video-format"]').on('click.scp2a-svf', '[data-action="set-video-format"]', function(e) { e.preventDefault(); setVideoProperty('format', $(this).data('format')); });

    // --- Media config fields ---
    $(document).off('change.scp2a-mcf', '.scp-media-config-field').on('change.scp2a-mcf', '.scp-media-config-field', function() { saveMediaConfigField($(this)); });
    $(document).off('blur.scp2a-mcfb', 'textarea.scp-media-config-field').on('blur.scp2a-mcfb', 'textarea.scp-media-config-field', function() { saveMediaConfigField($(this)); });
    $(document).off('change.scp2a-mbt', '.scp-media-brand-toggle').on('change.scp2a-mbt', '.scp-media-brand-toggle', function() {
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      post.media = post.media || {}; post.media.config = post.media.config || {};
      post.media.config.brand_context_enabled = $(this).is(':checked');
      post.updated = new Date().toISOString(); syncToTextarea();
    });

    // --- Prompt actions ---
    $(document).off('click.scp2a-cpr', '[data-action="copy-prompt"]').on('click.scp2a-cpr', '[data-action="copy-prompt"]', function(e) {
      e.preventDefault(); var idx = parseInt($(this).data('index'), 10);
      var $ta = $('.scp-prompt-text[data-prompt-index="' + idx + '"]');
      if ($ta.length) navigator.clipboard.writeText($ta.val()).then(function() { toast('Prompt copied!', 'success'); });
    });
    $(document).off('click.scp2a-cap', '[data-action="copy-all-prompts"]').on('click.scp2a-cap', '[data-action="copy-all-prompts"]', function(e) {
      e.preventDefault(); if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post || !post.media) return;
      var all = (post.media.prompts || []).map(function(mp, i) {
        var text = '--- ' + (mp.label || 'Prompt ' + (i + 1)) + ' ---\n' + (mp.prompt_text || '');
        if (mp.negative_prompt) text += '\n\nNegative: ' + mp.negative_prompt;
        if (mp.reference_urls && mp.reference_urls.length) text += '\n\nReferences:\n' + mp.reference_urls.join('\n');
        return text;
      }).join('\n\n');
      navigator.clipboard.writeText(all).then(function() { toast('All prompts copied!', 'success'); });
    });
    // (Structured form handlers removed â€” replaced by Phase B visual planner)
    $(document).off('click.scp2a-tps', '[data-action="toggle-prompt-status"]').on('click.scp2a-tps', '[data-action="toggle-prompt-status"]', function(e) {
      e.preventDefault(); var idx = parseInt($(this).data('index'), 10); var status = $(this).data('status');
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post || !post.media || !post.media.prompts[idx]) return;
      post.media.prompts[idx].status = status;
      post.updated = new Date().toISOString(); snapshot('Toggle prompt status');
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'prompt ' + status);
      buildMaps(); syncToTextarea(); render();
    });
    $(document).off('blur.scp2a-pt', '.scp-prompt-text').on('blur.scp2a-pt', '.scp-prompt-text', function() {
      var idx = parseInt($(this).data('prompt-index'), 10);
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post || !post.media || !post.media.prompts[idx]) return;
      post.media.prompts[idx].prompt_text = $(this).val();
      post.updated = new Date().toISOString(); syncToTextarea();
    });

    // --- Platform fields ---
    $(document).off('blur.scp2a-pf', '.scp-platform-field').on('blur.scp2a-pf', '.scp-platform-field', function() { savePlatformField($(this)); });
    $(document).off('change.scp2a-pe', '.scp-platform-enable-check').on('change.scp2a-pe', '.scp-platform-enable-check', function() {
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      var pk = $(this).data('platform'); var enabled = $(this).is(':checked');
      post.platform_content = post.platform_content || {};
      post.platform_content[pk] = post.platform_content[pk] || {};
      post.platform_content[pk].enabled = enabled;
      post.updated = new Date().toISOString();
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'platform enabled');
      buildMaps(); syncToTextarea(); render();
    });
    $(document).off('click.scp2a-ap', '[data-action="add-platform"]').on('click.scp2a-ap', '[data-action="add-platform"]', function(e) {
      e.preventDefault(); var pk = $(this).data('platform');
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      post.platforms = post.platforms || [];
      if (post.platforms.indexOf(pk) < 0) post.platforms.push(pk);
      post.updated = new Date().toISOString(); syncToTextarea(); render();
    });

    // --- Schedule fields ---
    $(document).off('blur.scp2a-schf', '.scp-schedule-field').on('blur.scp2a-schf', '.scp-schedule-field', function() { saveScheduleField($(this)); });
    $(document).off('change.scp2a-schfc', '.scp-schedule-field').on('change.scp2a-schfc', '.scp-schedule-field', function() { saveScheduleField($(this)); });
    $(document).off('blur.scp2a-uf', '.scp-url-field').on('blur.scp2a-uf', '.scp-url-field', function() {
      if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
      var pk = $(this).data('platform');
      post.schedule = post.schedule || {}; post.schedule.published_urls = post.schedule.published_urls || {};
      post.schedule.published_urls[pk] = $(this).val();
      post.updated = new Date().toISOString(); syncToTextarea();
    });

    // --- Status actions ---
    $(document).off('click.scp2a-mr', '[data-action="mark-ready"]').on('click.scp2a-mr', '[data-action="mark-ready"]', function(e) { e.preventDefault(); setPostStatus('ready'); });
    $(document).off('click.scp2a-msc', '[data-action="mark-scheduled"]').on('click.scp2a-msc', '[data-action="mark-scheduled"]', function(e) { e.preventDefault(); setPostStatus('scheduled'); });
    $(document).off('click.scp2a-mp', '[data-action="mark-published"]').on('click.scp2a-mp', '[data-action="mark-published"]', function(e) { e.preventDefault(); setPostStatus('published'); });

    // --- AI action delegates (to Part 2B) ---
    var aiActions = ['ai-research-angles', 'ai-research-hooks', 'ai-write-content', 'ai-improve-content',
      'ai-plan-slides', 'ai-generate-script', 'ai-generate-media', 'ai-adapt-platform', 'ai-generate-visual-plan'];
    aiActions.forEach(function(action) {
      $(document).off('click.scp2a-' + action, '[data-action="' + action + '"]').on('click.scp2a-' + action, '[data-action="' + action + '"]', function(e) {
        e.preventDefault();
        var b2 = window._scpPart2B;
        if (b2) {
          var fnMap = {
            'ai-research-angles': function() { b2.aiResearchAngles && b2.aiResearchAngles(S.selectedPostId, $('.scp-angle-custom').val()); },
            'ai-research-hooks': function() { b2.aiResearchHooks && b2.aiResearchHooks(S.selectedPostId, $('.scp-hook-custom').val()); },
            'ai-write-content': function() { b2.aiWriteContent && b2.aiWriteContent(S.selectedPostId); },
            'ai-improve-content': function() { b2.aiImproveContent && b2.aiImproveContent(S.selectedPostId); },
            'ai-plan-slides': function() { b2.aiSuggestSlides && b2.aiSuggestSlides(S.selectedPostId); },
            'ai-generate-script': function() { b2.aiGenerateStructuredScript && b2.aiGenerateStructuredScript(S.selectedPostId); },
            'ai-generate-media': function() { saveAllMediaConfig(); b2.aiGenerateMediaPrompt && b2.aiGenerateMediaPrompt(S.selectedPostId); },
            'ai-adapt-platform': function() { var pk = $(e.currentTarget).data('platform'); b2.aiAdaptForPlatform && b2.aiAdaptForPlatform(S.selectedPostId, pk); },
            'ai-generate-visual-plan': function() { saveAllMediaConfig(); b2.aiGenerateVisualPlan && b2.aiGenerateVisualPlan(S.selectedPostId); }
          };
          if (fnMap[action]) fnMap[action]();
        } else { toast('AI module loading...', 'info'); }
      });
    });

    // --- Duplicate post ---
    $(document).off('click.scp2a-dup', '[data-action="duplicate-post"]').on('click.scp2a-dup', '[data-action="duplicate-post"]', function(e) { e.preventDefault(); duplicatePost($(this).data('id')); });

    // --- Keyboard shortcuts ---
    $(document).off('keydown.scp2a-keys').on('keydown.scp2a-keys', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); syncToTextarea(); if (S.$submitBtn && S.$submitBtn.length) S.$submitBtn.click(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); window._scpCreateNewPost(); }
    });

    // --- AI Output Renderer events ---
    setupAIOEvents();

    console.log('[SCP] Part 2A events initialized');
  }

  // ============================================================
  // SECTION 14: DATA SAVE HELPERS
  // ============================================================

  function getSelectedPost() { return S.selectedPostId ? S.postMap[S.selectedPostId] : null; }

  function setNestedValue(obj, path, value) {
    var parts = path.split('.'); var target = obj;
    for (var i = 0; i < parts.length - 1; i++) { target[parts[i]] = target[parts[i]] || {}; target = target[parts[i]]; }
    target[parts[parts.length - 1]] = value;
  }

  function saveBasicsField($el) {
    var post = getSelectedPost(); if (!post) return;
    var field = $el.data('field'); var val = $el.val();
    if (field && field.indexOf('.') > -1) { setNestedValue(post, field, val); }
    else if (field) { post[field] = val; }
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function saveAngleSelection(index) {
    var post = getSelectedPost(); if (!post || !post.research) return;
    var angles = post.research.angles || [];
    angles.forEach(function(a, i) { a.selected = (i === index); });
    post.research.selected_angle = angles[index] ? angles[index].angle : '';
    post.updated = new Date().toISOString(); snapshot('Select angle');
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'angle selected');
    buildMaps(); syncToTextarea(); render();
  }

  function saveHookSelection(index) {
    var post = getSelectedPost(); if (!post || !post.research) return;
    var hooks = post.research.hooks || [];
    hooks.forEach(function(h, i) { h.selected = (i === index); });
    post.research.selected_hook = hooks[index] ? hooks[index].hook : '';
    post.updated = new Date().toISOString(); snapshot('Select hook');
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'hook selected');
    buildMaps(); syncToTextarea(); render();
  }

  function addResearchItem(type) {
    var post = getSelectedPost(); if (!post) return;
    post.research = post.research || { angles: [], hooks: [], selected_angle: '', selected_hook: '', notes: '' };
    if (type === 'angle') post.research.angles.push({ id: generateId('ang'), angle: '', description: '', selected: false });
    else if (type === 'hook') post.research.hooks.push({ id: generateId('hk'), hook: '', selected: false });
    post.updated = new Date().toISOString(); syncToTextarea();
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, type + ' added');
    buildMaps(); render();
  }

  function removeResearchItem(type, index) {
    var post = getSelectedPost(); if (!post || !post.research) return;
    if (type === 'angle' && post.research.angles) {
      var wasSelected = post.research.angles[index] && post.research.angles[index].selected;
      post.research.angles.splice(index, 1);
      if (wasSelected) post.research.selected_angle = '';
    } else if (type === 'hook' && post.research.hooks) {
      var wasHookSel = post.research.hooks[index] && post.research.hooks[index].selected;
      post.research.hooks.splice(index, 1);
      if (wasHookSel) post.research.selected_hook = '';
    }
    post.updated = new Date().toISOString(); syncToTextarea(); render();
  }

  function saveResearchNotes(val) {
    var post = getSelectedPost(); if (!post) return;
    post.research = post.research || {};
    post.research.notes = val;
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function saveResearchCustomInput(type, val) {
    var post = getSelectedPost(); if (!post) return;
    post.research = post.research || {};
    if (type === 'angle') post.research.angle_custom_input = val;
    else post.research.hook_custom_input = val;
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function saveComposerContent($ta) {
    var composerId = $ta.data('composer-id'); var val = $ta.val();
    var post = getSelectedPost(); if (!post) return;

    if (composerId === 'master') {
      post.content = post.content || {};
      post.content.body = val;
    } else if (composerId && composerId.indexOf('platform_') === 0) {
      var pk = composerId.replace('platform_', '');
      post.platform_content = post.platform_content || {};
      post.platform_content[pk] = post.platform_content[pk] || {};
      post.platform_content[pk].body = val;
    }
    post.updated = new Date().toISOString(); syncToTextarea();
    // Update char count display
    var charLimit = 3000;
    if (composerId && composerId.indexOf('platform_') === 0) {
      var pCfg = getPlatformConfig(composerId.replace('platform_', ''));
      charLimit = pCfg.char_limit || 3000;
    }
    $ta.closest('.scp-composer').find('.scp-composer-char-count').html(formatCharCount(countChars(val), charLimit));
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'content updated');
    buildMaps();
  }

  function saveSlideField($el) {
    var post = getSelectedPost(); if (!post) return;
    var idx = parseInt($el.data('slide-index'), 10);
    var field = $el.data('slide-field'); var val = $el.val();
    post.carousel = post.carousel || { slide_count: 5, slides: [] };
    while (post.carousel.slides.length <= idx) post.carousel.slides.push({ index: post.carousel.slides.length, theme: '', text_overlay: '' });
    post.carousel.slides[idx][field] = val;
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function setSlideCount(count) {
    var post = getSelectedPost(); if (!post) return;
    post.carousel = post.carousel || { slide_count: 5, slides: [] };
    post.carousel.slide_count = count;
    // Trim or extend slides array
    while (post.carousel.slides.length > count) post.carousel.slides.pop();
    while (post.carousel.slides.length < count) post.carousel.slides.push({ index: post.carousel.slides.length, theme: '', text_overlay: '' });
    post.updated = new Date().toISOString(); syncToTextarea(); render();
  }

  function saveVideoField($el) {
    var post = getSelectedPost(); if (!post) return;
    var field = $el.data('video-field'); var val = $el.val();
    post.video = post.video || {};
    post.video[field] = val;
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function setVideoProperty(field, val) {
    var post = getSelectedPost(); if (!post) return;
    post.video = post.video || {};
    post.video[field] = val;
    post.updated = new Date().toISOString(); syncToTextarea(); render();
  }

  function saveMediaConfigField($el) {
    var post = getSelectedPost(); if (!post) return;
    var field = $el.data('config-field'); var val = $el.val();
    post.media = post.media || {}; post.media.config = post.media.config || {};
    post.media.config[field] = val;
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function saveAllMediaConfig() {
    if (!S.selectedPostId) return; var post = S.postMap[S.selectedPostId]; if (!post) return;
    post.media = post.media || {}; post.media.config = post.media.config || {};
    $('.scp-media-config-field').each(function() {
      var field = $(this).data('config-field');
      if (field) post.media.config[field] = $(this).val();
    });
    post.media.config.brand_context_enabled = $('.scp-media-brand-toggle').is(':checked');
    post.updated = new Date().toISOString(); syncToTextarea();
  }

  function savePlatformField($el) {
    var post = getSelectedPost(); if (!post) return;
    var pk = $el.data('platform'); var field = $el.data('pfield'); var val = $el.val();
    post.platform_content = post.platform_content || {};
    post.platform_content[pk] = post.platform_content[pk] || {};
    if (field === 'tags') {
      post.platform_content[pk].tags = val.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    } else {
      post.platform_content[pk][field] = val;
    }
    post.updated = new Date().toISOString(); syncToTextarea();
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'platform content updated');
    buildMaps();
  }

  function saveScheduleField($el) {
    var post = getSelectedPost(); if (!post) return;
    var field = $el.data('sfield'); var val = $el.val();
    post.schedule = post.schedule || {};
    post.schedule[field] = val;
    post.updated = new Date().toISOString(); syncToTextarea();
    if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'schedule updated');
    buildMaps();
  }

  function setPostStatus(status) {
    var post = getSelectedPost(); if (!post) return;
    var oldStatus = post.status;
    post.status = status; post.updated = new Date().toISOString();
    var oldLabel = (Constants.POST_STATUSES[oldStatus] || {}).label || oldStatus;
    var newLabel = (Constants.POST_STATUSES[status] || {}).label || status;
    logActivity('post_status_changed', post.id, post.title, 'Status: ' + oldLabel + ' â†’ ' + newLabel);
    snapshot('Status change'); buildMaps(); syncToTextarea(); render();
    toast('Status changed to ' + newLabel, 'success');
  }

  // ============================================================
  // SECTION 15: API EXPORTS
  // ============================================================

  window._scpPart2A = {
    snapshot: snapshot, undo: undo, redo: redo,
    openModal: openModal, closeModal: closeModal,
    openConfirmDialog: openConfirmDialog, closeConfirmDialog: closeConfirmDialog,
    collectModalFields: collectModalFields,
    deletePost: deletePost, duplicatePost: duplicatePost,
    promoteResearchIdea: promoteResearchIdea,
    openNewTagModal: openNewTagModal, editTagModal: editTagModal, deleteTag: deleteTag,
    addResearchItem: addResearchItem, removeResearchItem: removeResearchItem,
    setPostStatus: setPostStatus,
    // AIOutputRenderer (Phase A)
    renderStructuredOutput: renderStructuredOutput,
    collectStructuredOutputData: collectStructuredOutputData,
    exportStructuredOutput: exportStructuredOutput,
    OUTPUT_SCHEMAS: OUTPUT_SCHEMAS
  };

  // Global AIO save callback â€” set by Part 2B to wire inline edits back to post data
  window._scpAIOSaveField = null;

  console.log('[SCP] Part 2A loaded');

})(jQuery, Drupal);


/* ----- src/ai/providers/_registry.js ----- */

/**
 * @category    ai
 * @purpose     Bootstrap for the AI-provider registry. Each provider file
 *              registers itself onto `window._scpAIProviders[<id>]` with the
 *              shape: { buildRequest, parseResponse, buildTestRequest }.
 *              LLMService.callAI / testProvider look up the registry instead
 *              of carrying provider-specific switch statements.
 * @exports     window._scpAIProviders (initialised to {})
 * @extracted-from  src/ai/scp-part2b.js â†’ src/ai/llm-service.js (v0.1.3)
 *
 * Adapter contract:
 *   buildRequest(prompt: string, cfg: SelObj, systemPrompt: string)
 *     â†’ { endpoint: string, headers: object, body: object }
 *   parseResponse(data: any) â†’ string
 *   buildTestRequest(model: ModelObj, apiKey: string)
 *     â†’ { endpoint: string, headers: object, body: object }
 *
 *   SelObj   = { provider, model, temperature, max_tokens, top_p, api_key }
 *   ModelObj = { id, label, temperature, max_tokens, is_default }
 */
(function() {
  'use strict';
  window._scpAIProviders = window._scpAIProviders || {};
})();


/* ----- src/ai/providers/gemini.js ----- */

/**
 * @category   ai
 * @purpose    Google Gemini provider adapter. Generative Language API v1beta.
 * @exports    window._scpAIProviders.gemini
 * @docs       https://ai.google.dev/api/rest/v1beta/models/generateContent
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent';

  window._scpAIProviders.gemini = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: cfg.max_tokens, temperature: cfg.temperature, topP: cfg.top_p }
      };
      if (systemPrompt) body.system_instruction = { parts: [{ text: systemPrompt }] };
      return {
        endpoint: ENDPOINT.replace('{MODEL}', cfg.model) + '?key=' + cfg.api_key,
        headers: { 'Content-Type': 'application/json' },
        body: body
      };
    },

    parseResponse: function(data) {
      return data.candidates && data.candidates[0] && data.candidates[0].content
        ? data.candidates[0].content.parts.map(function(p) { return p.text || ''; }).join('')
        : JSON.stringify(data);
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT.replace('{MODEL}', model.id) + '?key=' + apiKey,
        headers: { 'Content-Type': 'application/json' },
        body: {
          contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: {"status":"ok"}' }] }],
          generationConfig: { maxOutputTokens: 50, temperature: 0 }
        }
      };
    }
  };
})();


/* ----- src/ai/providers/claude.js ----- */

/**
 * @category   ai
 * @purpose    Anthropic Claude provider adapter. Messages API.
 * @exports    window._scpAIProviders.claude
 * @docs       https://docs.anthropic.com/en/api/messages
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://api.anthropic.com/v1/messages';
  var ANTHROPIC_VERSION = '2023-06-01';

  window._scpAIProviders.claude = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var body = {
        model: cfg.model,
        max_tokens: cfg.max_tokens,
        messages: [{ role: 'user', content: prompt }]
      };
      if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
      if (systemPrompt) body.system = systemPrompt;
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.api_key, 'anthropic-version': ANTHROPIC_VERSION },
        body: body
      };
    },

    parseResponse: function(data) {
      return data.content
        ? data.content.filter(function(c) { return c.type === 'text'; })
                      .map(function(c) { return c.text; })
                      .join('')
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }] }
      };
    }
  };
})();


/* ----- src/ai/providers/openai.js ----- */

/**
 * @category   ai
 * @purpose    OpenAI chat-completions provider adapter.
 * @exports    window._scpAIProviders.openai
 * @docs       https://platform.openai.com/docs/api-reference/chat/create
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  window._scpAIProviders.openai = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();


/* ----- src/ai/providers/grok.js ----- */

/**
 * @category   ai
 * @purpose    xAI Grok provider adapter. OpenAI-compatible chat-completions API.
 * @exports    window._scpAIProviders.grok
 * @docs       https://docs.x.ai/api
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://api.x.ai/v1/chat/completions';

  window._scpAIProviders.grok = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();


/* ----- src/ai/providers/groq.js ----- */

/**
 * @category   ai
 * @purpose    Groq provider adapter. OpenAI-compatible. Note: rejects
 *             temperature=0 â€” we substitute 0.01 to match upstream quirk.
 * @exports    window._scpAIProviders.groq
 * @docs       https://console.groq.com/docs/api-reference
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

  window._scpAIProviders.groq = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      var temperature = (cfg.temperature === 0) ? 0.01 : cfg.temperature;  // Groq quirk
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0.01 }
      };
    }
  };
})();


/* ----- src/ai/providers/nvidia.js ----- */

/**
 * @category   ai
 * @purpose    NVIDIA Build provider adapter. OpenAI-compatible.
 * @exports    window._scpAIProviders.nvidia
 * @docs       https://docs.api.nvidia.com/nim/reference/models
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

  window._scpAIProviders.nvidia = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();


/* ----- src/ai/providers/huggingface.js ----- */

/**
 * @category   ai
 * @purpose    Hugging Face Router provider adapter. OpenAI-compatible.
 * @exports    window._scpAIProviders.huggingface
 * @docs       https://huggingface.co/docs/api-inference
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

  window._scpAIProviders.huggingface = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();


/* ----- src/ai/providers/openrouter.js ----- */

/**
 * @category   ai
 * @purpose    OpenRouter provider adapter. OpenAI-compatible, requires extra
 *             HTTP-Referer and X-Title headers for rankings/attribution.
 * @exports    window._scpAIProviders.openrouter
 * @docs       https://openrouter.ai/docs/api-reference/overview
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  var EXTRA_HEADERS = { 'HTTP-Referer': window.location.origin, 'X-Title': 'Social Content Planner' };

  function _headers(apiKey, extra) {
    var h = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey };
    for (var k in EXTRA_HEADERS) h[k] = EXTRA_HEADERS[k];
    if (extra) for (var ek in extra) h[ek] = extra[ek];
    return h;
  }

  window._scpAIProviders.openrouter = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: _headers(cfg.api_key),
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: _headers(apiKey, { 'X-Title': 'SCP Test' }),
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();


/* ----- src/ai/brand-service.js ----- */

/**
 * @category    ai
 * @purpose     Brand context: reads brand JSON from Drupal `.brand-*-data` divs,
 *              produces system-prompt strings, auto-populates brand-design fields.
 * @exports     window.BrandService
 * @depends-on  window._scpState (alias S), jQuery
 * @extracted-from  src/ai/scp-part2b.js (was inline SECTION 3, lines 548â€“692 of v0.1.0)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 3: BrandService
  // ============================================================

  window.BrandService = (function() {
    var S;  // acquired inside init() from window._scpState (set by core/scp-part1.js)
    var _parsed = {}, _identity = { name: '', id: '', logoUrl: '' }, _raw = {};
    var CONTEXT_DIVS = { core: '.brand-core-data', video: '.brand-video-data', content: '.brand-content-data', seo: '.brand-seo-data', social: '.brand-social-data' };

    function init() {
      S = window._scpState;
      _parsed = {}; _raw = {};
      var $wrap = $('.brand-data');
      if ($wrap.length) {
        _identity = { name: ($wrap.find('.brand-name').text() || '').trim(), id: ($wrap.find('.brand-id').text() || '').trim(), logoUrl: ($wrap.find('.brand-logo-url').text() || '').trim() };
      }
      for (var type in CONTEXT_DIVS) {
        var $div = $(CONTEXT_DIVS[type]);
        if ($div.length) { var text = $div.text().trim(); if (text) { _raw[type] = text; try { _parsed[type] = JSON.parse(text); } catch(e) { _parsed[type] = null; } } }
      }
      S.brand = { configured: Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).length > 0, identity: _identity, core: _parsed.core || null, video: _parsed.video || null, content: _parsed.content || null, seo: _parsed.seo || null, social: _parsed.social || null };
      console.log('[SCP] BrandService: ' + (_identity.name || 'none') + ', contexts: ' + Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).join(', '));
    }

    function isConfigured() { return S && S.brand && S.brand.configured; }
    function getCore() { return _parsed.core || {}; }
    function getSocial() { return _parsed.social || {}; }
    function getContent() { return _parsed.content || {}; }
    function getSeo() { return _parsed.seo || {}; }
    function getAudience() { return (_parsed.core || {}).audience || {}; }
    function getForbiddenWords() { return (_parsed.core || {}).forbidden_words || []; }
    function getDos() { return (_parsed.core || {}).dos || []; }
    function getDonts() { return (_parsed.core || {}).donts || []; }

    function getSystemPrompt(contextType) {
      if (!isConfigured()) return '';
      var core = _parsed.core || {}; var parts = [];
      var brandName = core.brand_name || _identity.name || 'this brand';
      parts.push('You are an expert social media content creator for ' + brandName + '. Every output must embody this brand perfectly.');
      if (core.tagline) parts.push('Brand tagline: ' + core.tagline);
      if (core.brand_voice) parts.push('Brand voice & personality: ' + core.brand_voice);
      // Audience with psychographics
      if (core.audience) {
        var aud = core.audience;
        if (aud.primary) parts.push('Primary audience: ' + aud.primary);
        if (aud.pain_points) parts.push('Pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
        if (aud.desires) parts.push('Desires: ' + (Array.isArray(aud.desires) ? aud.desires.join('; ') : aud.desires));
        if (aud.objections) parts.push('Common objections: ' + (Array.isArray(aud.objections) ? aud.objections.join('; ') : aud.objections));
      }
      if (core.forbidden_words && core.forbidden_words.length) parts.push('FORBIDDEN WORDS (never use these): ' + core.forbidden_words.join(', '));
      // Platform-specific context
      if ((contextType === 'social' || contextType === 'platform') && _parsed.social) {
        var soc = _parsed.social;
        var platTones = [];
        if (soc.social) {
          if (soc.social.linkedin && soc.social.linkedin.tone) platTones.push('LinkedIn: ' + soc.social.linkedin.tone);
          if (soc.social.instagram && soc.social.instagram.tone) platTones.push('Instagram: ' + soc.social.instagram.tone);
          if (soc.social.facebook && soc.social.facebook.tone) platTones.push('Facebook: ' + soc.social.facebook.tone);
        }
        if (platTones.length) parts.push('Platform tone variations: ' + platTones.join(' | '));
      }
      // Content writing style
      if ((contextType === 'content' || contextType === 'platform') && _parsed.content) {
        var cnt = _parsed.content;
        if (cnt.writing_style) parts.push('Writing style: ' + cnt.writing_style);
        if (cnt.sentence_rules) parts.push('Sentence rules: ' + (Array.isArray(cnt.sentence_rules) ? cnt.sentence_rules.join('; ') : cnt.sentence_rules));
        if (cnt.cta_style) parts.push('CTA style: ' + cnt.cta_style);
      }
      // Content pillars
      if (_parsed.video && _parsed.video.content_pillars && _parsed.video.content_pillars.length) {
        parts.push('Content pillars: ' + _parsed.video.content_pillars.join(', '));
      }
      // DOs and DON'Ts
      if (core.dos && core.dos.length) parts.push('ALWAYS: ' + core.dos.slice(0, 6).join('; '));
      if (core.donts && core.donts.length) parts.push('NEVER: ' + core.donts.slice(0, 6).join('; '));
      return parts.join('\n');
    }

    function getBrandDesignPrompt() {
      var bd = (S && S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      // Check if custom prefix was manually written
      if (bd.brand_prompt_prefix && bd.brand_prompt_prefix.trim()) return bd.brand_prompt_prefix;
      // Otherwise auto-build from structured fields
      return buildBrandDesignText(bd);
    }

    function buildBrandDesignText(bd) {
      if (!bd) return '';
      var lines = [];
      lines.push('BRAND VISUAL IDENTITY:');
      // Colors
      var c = bd.colors || {};
      if (c.primary || c.secondary || c.accent) {
        var colorParts = [];
        if (c.primary) colorParts.push('Primary ' + c.primary);
        if (c.secondary) colorParts.push('Secondary ' + c.secondary);
        if (c.accent) colorParts.push('Accent ' + c.accent);
        lines.push('Colors: ' + colorParts.join(', ') + '.');
        if (c.background) lines.push('Background: ' + c.background + '. Text: ' + (c.text || '#202124') + '.');
        if (c.palette_description) lines.push('Palette feel: ' + c.palette_description);
      }
      // Typography
      var t = bd.typography || {};
      if (t.heading_style || t.body_style) {
        var typoParts = [];
        if (t.heading_style) typoParts.push('Headings: ' + t.heading_style);
        if (t.body_style) typoParts.push('Body: ' + t.body_style);
        lines.push('Typography: ' + typoParts.join('. ') + '.');
        if (t.text_treatment) lines.push('Text on images: ' + t.text_treatment);
      }
      // Visual style
      var vs = bd.visual_style || {};
      if (vs.overall_aesthetic) lines.push('Visual Style: ' + vs.overall_aesthetic);
      if (vs.photography_style) lines.push('Photography: ' + vs.photography_style);
      if (vs.illustration_style) lines.push('Illustrations: ' + vs.illustration_style);
      if (vs.icon_style) lines.push('Icons: ' + vs.icon_style);
      if (vs.mood) lines.push('Mood: ' + vs.mood);
      // Layout
      var lr = bd.layout_rules || {};
      if (lr.image_composition) lines.push('Layout: ' + lr.image_composition);
      if (lr.carousel_consistency) lines.push('Carousel: ' + lr.carousel_consistency);
      if (lr.thumbnail_style) lines.push('Thumbnails: ' + lr.thumbnail_style);
      // Reference images
      var refs = bd.reference_image_ids || {};
      var refCount = (refs.primary_style || []).length + (refs.carousel_template || []).length + (refs.thumbnail_template || []).length;
      if (refCount > 0) lines.push('Reference images provided â€” match this exact visual style.');
      // Final instruction
      if (lines.length > 1) lines.push('CRITICAL: All generated images MUST follow this brand guide for visual consistency.');
      return lines.length > 1 ? lines.join('\n') : '';
    }

    function autoPopulateBrandDesign() {
      if (!isConfigured()) return;
      var bd = (S && S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      var core = _parsed.core || {};
      // Only auto-fill empty fields â€” never overwrite user customizations
      if (!bd.colors) bd.colors = {};
      if (!bd.colors.primary && core.brand_colors && core.brand_colors.primary) bd.colors.primary = core.brand_colors.primary;
      if (!bd.colors.secondary && core.brand_colors && core.brand_colors.secondary) bd.colors.secondary = core.brand_colors.secondary;
      if (!bd.colors.accent && core.brand_colors && core.brand_colors.accent) bd.colors.accent = core.brand_colors.accent;
      if (!bd.visual_style) bd.visual_style = {};
      if (!bd.visual_style.mood && core.brand_voice) bd.visual_style.mood = core.brand_voice;
      if (S && S.meta && S.meta.settings) S.meta.settings.brand_design = bd;
    }

    return { init: init, isConfigured: isConfigured, getSystemPrompt: getSystemPrompt, getBrandDesignPrompt: getBrandDesignPrompt, buildBrandDesignText: buildBrandDesignText, autoPopulateBrandDesign: autoPopulateBrandDesign, getCore: getCore, getSocial: getSocial, getContent: getContent, getSeo: getSeo, getAudience: getAudience, getForbiddenWords: getForbiddenWords, getDos: getDos, getDonts: getDonts };
  })();

})(jQuery);


/* ----- src/ai/llm-service.js ----- */

/**
 * @category    ai
 * @purpose     Multi-provider LLM service: provider/model discovery from Drupal
 *              divs, per-action preference persistence, unified callAI() wrapper
 *              over 8 chat-completion endpoints, inline picker UI, connection test.
 * @exports     window.LLMService
 * @depends-on  window._scpState (S), window._scpEsc, window._scpIcon,
 *              window._scpDeepClone, window._scpSyncToTextarea, window._scpRender,
 *              window._scpUpdateAIStatusIndicator, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 2, lines 191â€“546 of v0.1.1)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 2: LLMService
  // ============================================================
  //
  // Provider-specific HTTP shaping lives in src/ai/providers/<id>.js.
  // This file holds only provider-agnostic logic: config discovery,
  // default selection, preference persistence, and the picker UI.
  // ============================================================

  window.LLMService = (function() {
    // Helpers resolved lazily at first init() â€” all defined in core/scp-part1.js
    // (esc, icon, deepClone, syncToTextarea, render) or in scp-part2b.js
    // (updateAIStatusIndicator). Lazy resolution lets this file load before
    // scp-part2b.js while still picking up its updateAIStatusIndicator.
    var S, esc, icon, deepClone, syncToTextarea, render, updateAIStatusIndicator;

    function _resolveHelpers() {
      S = window._scpState;
      esc = window._scpEsc;
      icon = window._scpIcon;
      deepClone = window._scpDeepClone;
      syncToTextarea = window._scpSyncToTextarea;
      render = window._scpRender;
      updateAIStatusIndicator = window._scpUpdateAIStatusIndicator || function() {};
    }

    var _config = null, _providerMap = {}, _initialized = false;

    function init() {
      _resolveHelpers();
      _config = null; _providerMap = {};
      var raw = null;

      // --- Source 1: Brand-level LLM config div ---
      var $brand = $('.llm-brand-config-data');
      if ($brand.length) {
        console.log('[SCP] LLMService: .llm-brand-config-data found (' + $brand.text().trim().length + ' chars)');
        try { raw = JSON.parse($brand.text().trim()); console.log('[SCP] LLMService: Brand config parsed OK'); }
        catch(e) { console.warn('[SCP] LLMService: Brand config parse failed:', e.message); }
      } else {
        console.log('[SCP] LLMService: .llm-brand-config-data not found');
      }

      // --- Source 2: User-level LLM config div ---
      var $user = $('.llm-config-data');
      if (!raw && $user.length) {
        console.log('[SCP] LLMService: .llm-config-data found (' + $user.text().trim().length + ' chars)');
        try { raw = JSON.parse($user.text().trim()); console.log('[SCP] LLMService: User config parsed OK'); }
        catch(e) { console.warn('[SCP] LLMService: User config parse failed:', e.message); }
      }

      // --- Source 3: Try data attribute on config divs (some Drupal setups use data-*) ---
      if (!raw) {
        var $dataAttr = $('[data-llm-config]');
        if ($dataAttr.length) {
          try { raw = JSON.parse($dataAttr.attr('data-llm-config')); console.log('[SCP] LLMService: data-llm-config attribute parsed OK'); }
          catch(e) { /* silent */ }
        }
      }

      // --- Source 4: Try script tags with type="application/json" that contain LLM config ---
      if (!raw) {
        $('script[type="application/json"]').each(function() {
          if (raw) return;
          try {
            var parsed = JSON.parse($(this).text().trim());
            if (parsed && parsed.providers && Array.isArray(parsed.providers)) {
              raw = parsed;
              console.log('[SCP] LLMService: Found config in <script type="application/json"> tag');
            }
          } catch(e) { /* not this one, try next */ }
        });
      }

      // --- Source 5: Try inside #guau-userdata or other common Drupal wrapper divs ---
      if (!raw) {
        var altSelectors = ['#guau-userdata .llm-config-data', '#block-content .llm-config-data', '.region-content .llm-config-data', '.layout-content .llm-config-data', '.node__content .llm-config-data'];
        for (var asi = 0; asi < altSelectors.length; asi++) {
          var $alt = $(altSelectors[asi]);
          if ($alt.length) {
            try { raw = JSON.parse($alt.text().trim()); console.log('[SCP] LLMService: Found config via ' + altSelectors[asi]); break; }
            catch(e) { /* try next */ }
          }
        }
      }

      if (!raw) {
        console.warn('[SCP] LLMService: No config found on initial scan â€” will retry in 2s. Ensure .llm-config-data or .llm-brand-config-data div is on the page.');
        // Schedule a retry â€” Drupal AJAX may not have rendered the div yet
        setTimeout(function() { _retryInit(); }, 2000);
      } else {
        _processConfig(raw);
      }
    }

    function _retryInit() {
      var raw = null;
      var selectors = ['.llm-brand-config-data', '.llm-config-data', '[data-llm-config]'];
      for (var i = 0; i < selectors.length; i++) {
        var $el = $(selectors[i]);
        if ($el.length) {
          try {
            raw = selectors[i] === '[data-llm-config]' ? JSON.parse($el.attr('data-llm-config')) : JSON.parse($el.text().trim());
            if (raw) { console.log('[SCP] LLMService: Retry found config via ' + selectors[i]); break; }
          } catch(e) { /* continue */ }
        }
      }
      if (raw) {
        _processConfig(raw);
        // Re-render UI now that AI is available
        updateAIStatusIndicator();
        if (render) render();
      } else {
        console.warn('[SCP] LLMService: Retry also found no config â€” AI features will be unavailable.');
      }
    }

    function _processConfig(raw) {
      _config = raw;
      if (_config && _config.providers) {
        for (var i = 0; i < _config.providers.length; i++) {
          var p = _config.providers[i];
          if (!p.active) { console.log('[SCP] LLMService: Provider "' + p.id + '" skipped (inactive)'); continue; }
          var activeModels = (p.models || []).filter(function(m) { return m.active; });
          if (!activeModels.length) { console.log('[SCP] LLMService: Provider "' + p.id + '" skipped (no active models)'); continue; }
          _providerMap[p.id] = { id: p.id, label: p.label || p.id, api_key: p.api_key || '', activeModels: activeModels };
          console.log('[SCP] LLMService: Provider "' + p.label + '" â†’ ' + activeModels.length + ' model(s): ' + activeModels.map(function(m) { return m.label || m.id; }).join(', '));
        }
      }
      _initialized = true;
      var pids = Object.keys(_providerMap);
      if (pids.length > 0) {
        var def = getDefault();
        console.log('[SCP] LLMService: ' + pids.length + ' active provider(s). Default: ' + (def ? def.provider + '/' + def.model : 'none'));
      } else {
        console.warn('[SCP] LLMService: No active providers â€” all AI features will show "Not configured"');
      }
    }

    function isConfigured() { return Object.keys(_providerMap).length > 0; }
    function getActiveProviders() { return Object.keys(_providerMap).map(function(id) { return _providerMap[id]; }); }
    function getActiveModels(providerId) { var p = _providerMap[providerId]; return p ? p.activeModels : []; }

    function _getModelObj(pid, mid) { var p = _providerMap[pid]; if (!p) return null; for (var i = 0; i < p.activeModels.length; i++) { if (p.activeModels[i].id === mid) return p.activeModels[i]; } return null; }
    function _buildSel(pid, model) { return { provider: pid, model: model.id, temperature: model.temperature !== undefined ? model.temperature : 1.0, max_tokens: model.max_tokens || 8192, top_p: model.top_p !== undefined ? model.top_p : 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' }; }

    function getDefault() {
      var provs = getActiveProviders(); if (!provs.length) return null;

      // Priority 1: User's explicit app default (from Settings > AI)
      var appDef = S && S.meta && S.meta.aiPreferences && S.meta.aiPreferences.appDefault;
      if (appDef && appDef.provider && appDef.model) {
        var ma = _getModelObj(appDef.provider, appDef.model);
        if (ma) return _buildSel(appDef.provider, ma);
      }

      // Priority 2: Config-level default (from LLM config JSON)
      if (_config && _config.default_provider && _config.default_model) {
        var m = _getModelObj(_config.default_provider, _config.default_model);
        if (m) return _buildSel(_config.default_provider, m);
      }

      // Priority 3: Smart fallback â€” prefer Gemini 2.5 Flash > Gemini 2.0 Flash > any Gemini > first provider
      var preferredModels = ['gemini-2.5-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      var geminiProvider = _providerMap['gemini'];
      if (geminiProvider) {
        for (var pi = 0; pi < preferredModels.length; pi++) {
          var prefM = _getModelObj('gemini', preferredModels[pi]);
          if (prefM) return _buildSel('gemini', prefM);
        }
        // Any Gemini model with "flash" in its id
        for (var fi = 0; fi < geminiProvider.activeModels.length; fi++) {
          if (geminiProvider.activeModels[fi].id.indexOf('flash') > -1) return _buildSel('gemini', geminiProvider.activeModels[fi]);
        }
      }

      // Priority 4: First provider's default model or first model
      var p = provs[0]; var defM = null;
      for (var i = 0; i < p.activeModels.length; i++) {
        if (p.activeModels[i].is_default) { defM = p.activeModels[i]; break; }
      }
      return _buildSel(p.id, defM || p.activeModels[0]);
    }

    function resolveSelection(actionId) {
      var prefs = S.meta.aiPreferences || {};
      var pa = (prefs.perAction || {})[actionId || ''];
      if (pa && pa.provider && pa.model) { var m = _getModelObj(pa.provider, pa.model); if (m) return _buildSel(pa.provider, m); }
      if (prefs.lastProvider && prefs.lastModel) { var m2 = _getModelObj(prefs.lastProvider, prefs.lastModel); if (m2) return _buildSel(prefs.lastProvider, m2); }
      return getDefault();
    }

    function savePreference(actionId, pid, mid) {
      S.meta.aiPreferences = S.meta.aiPreferences || {}; S.meta.aiPreferences.perAction = S.meta.aiPreferences.perAction || {};
      S.meta.aiPreferences.lastProvider = pid; S.meta.aiPreferences.lastModel = mid;
      if (actionId) S.meta.aiPreferences.perAction[actionId] = { provider: pid, model: mid };
      // If this is the app-default action, also save to appDefault
      if (actionId === 'app-default') {
        S.meta.aiPreferences.appDefault = { provider: pid, model: mid };
      }
      syncToTextarea();
      // Update header indicator to reflect latest selection
      updateAIStatusIndicator();
    }

    function renderInlinePicker(actionId) {
      if (!isConfigured()) return '<span class="scp-ai-not-configured" title="Configure AI providers in your user profile â†’ LLM Config field">' + icon('warning') + ' <a href="#" data-action="go-view" data-view="settings" data-tab="ai" class="scp-ai-config-link">Configure AI</a></span>';
      var sel = resolveSelection(actionId); var provs = getActiveProviders();
      var html = '<span class="scp-ai-picker" data-action-id="' + esc(actionId) + '">';
      html += '<select class="scp-select scp-select-sm scp-ai-provider-select" data-action-id="' + esc(actionId) + '">';
      for (var i = 0; i < provs.length; i++) html += '<option value="' + esc(provs[i].id) + '"' + (sel && sel.provider === provs[i].id ? ' selected' : '') + '>' + esc(provs[i].label) + '</option>';
      html += '</select>';
      var curProv = sel ? _providerMap[sel.provider] : provs[0]; var models = curProv ? curProv.activeModels : [];
      html += '<select class="scp-select scp-select-sm scp-ai-model-select" data-action-id="' + esc(actionId) + '">';
      for (var j = 0; j < models.length; j++) html += '<option value="' + esc(models[j].id) + '"' + (sel && sel.model === models[j].id ? ' selected' : '') + ' data-temp="' + (models[j].temperature !== undefined ? models[j].temperature : 1.0) + '" data-tokens="' + (models[j].max_tokens || 8192) + '">' + esc(models[j].label) + '</option>';
      html += '</select></span>';
      return html;
    }

    function _getPickerSel(actionId) {
      var $p = $('.scp-ai-provider-select[data-action-id="' + actionId + '"]');
      if (!$p.length) return resolveSelection(actionId);
      var pid = $p.val(), mid = $('.scp-ai-model-select[data-action-id="' + actionId + '"]').val();
      var $opt = $('.scp-ai-model-select[data-action-id="' + actionId + '"] option:selected');
      return { provider: pid, model: mid, temperature: parseFloat($opt.data('temp')) || 1.0, max_tokens: parseInt($opt.data('tokens'), 10) || 8192, top_p: 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' };
    }

    function callAI(prompt, onSuccess, onError, actionId, systemPrompt) {
      var cfg = _getPickerSel(actionId || '');
      if (!cfg || !cfg.api_key) { if (onError) onError('No AI providers configured.'); return; }
      var adapter = window._scpAIProviders && window._scpAIProviders[cfg.provider];
      if (!adapter) { if (onError) onError('Unknown provider: ' + cfg.provider); return; }

      var req = adapter.buildRequest(prompt, cfg, systemPrompt || '');
      fetch(req.endpoint, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) })
        .then(function(res) { if (!res.ok) return res.text().then(function(t) { var m = 'API ' + res.status; try { m = JSON.parse(t).error.message || m; } catch(e) {} throw new Error(m); }); return res.json(); })
        .then(function(data) {
          var text;
          try { text = adapter.parseResponse(data); }
          catch(e) { text = JSON.stringify(data); }
          console.log('[SCP] AI (' + cfg.provider + '/' + cfg.model + '):', text.substring(0, 200));
          if (actionId) savePreference(actionId, cfg.provider, cfg.model);
          if (onSuccess) onSuccess(text);
        })
        .catch(function(err) { console.error('[SCP] AI error:', err); if (onError) onError(err.message || 'Request failed'); });
    }

    /**
     * Returns detailed info about a provider including masked key and all models.
     */
    function getProviderInfo(pid) {
      var p = _providerMap[pid]; if (!p) return null;
      var key = p.api_key || '';
      var maskedKey = key.length > 8 ? key.substring(0, 4) + 'â€¢â€¢â€¢â€¢' + key.substring(key.length - 4) : (key ? 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' : '');
      return {
        id: p.id, label: p.label, maskedKey: maskedKey, hasKey: !!key,
        modelCount: p.activeModels.length,
        models: p.activeModels.map(function(m) {
          return { id: m.id, label: m.label || m.id, temperature: m.temperature, max_tokens: m.max_tokens || 8192, is_default: !!m.is_default };
        })
      };
    }

    /**
     * Returns raw config for inspection (read-only).
     */
    function getRawConfig() { return _config ? deepClone(_config) : null; }

    /**
     * Total count of all active providers.
     */
    function getProviderCount() { return Object.keys(_providerMap).length; }

    /**
     * Total count of all active models across all providers.
     */
    function getTotalModelCount() {
      var count = 0;
      for (var pid in _providerMap) count += _providerMap[pid].activeModels.length;
      return count;
    }

    /**
     * Re-scan the page for LLM config divs. Used when user clicks "Re-scan" button.
     */
    function rescanConfig() {
      console.log('[SCP] LLMService: Manual re-scan triggered');
      _providerMap = {}; _config = null; _initialized = false;
      init();
      // Return whether config was found
      return isConfigured();
    }

    /**
     * Test a specific provider by ID with a simple prompt.
     * callback(success: bool, message: string, responseTime: number)
     */
    function testProvider(pid, callback) {
      var p = _providerMap[pid];
      if (!p || !p.api_key) { if (callback) callback(false, 'No API key', 0); return; }
      var model = p.activeModels[0];
      if (!model) { if (callback) callback(false, 'No models', 0); return; }
      var adapter = window._scpAIProviders && window._scpAIProviders[pid];
      if (!adapter || !adapter.buildTestRequest) { if (callback) callback(false, 'Unknown provider', 0); return; }

      var startTime = Date.now();
      var req = adapter.buildTestRequest(model, p.api_key);
      fetch(req.endpoint, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) })
        .then(function(res) {
          var elapsed = Date.now() - startTime;
          if (!res.ok) return res.text().then(function(t) { var msg = 'HTTP ' + res.status; try { msg = JSON.parse(t).error.message || msg; } catch(e) {} if (callback) callback(false, msg, elapsed); });
          return res.json().then(function() { if (callback) callback(true, 'OK (' + elapsed + 'ms)', elapsed); });
        })
        .catch(function(err) { var elapsed = Date.now() - startTime; if (callback) callback(false, err.message || 'Network error', elapsed); });
    }

    return {
      init: init, isConfigured: isConfigured,
      getActiveProviders: getActiveProviders, getActiveModels: getActiveModels,
      getDefault: getDefault, resolveSelection: resolveSelection,
      savePreference: savePreference, renderInlinePicker: renderInlinePicker, callAI: callAI,
      // Phase 3 additions
      getProviderInfo: getProviderInfo, getRawConfig: getRawConfig,
      getProviderCount: getProviderCount, getTotalModelCount: getTotalModelCount,
      rescanConfig: rescanConfig, testProvider: testProvider
    };
  })();

})(jQuery);


/* ----- src/ai/_helpers.js ----- */

/**
 * @category    ai
 * @purpose     Shared helpers for AI actions: structured-JSON parsing,
 *              brace-block extraction, brand-snippet builder, retry wrapper
 *              around LLMService.callAI, and the AI-button loading-state
 *              manager (returns a restore closure).
 * @exports     window._scpAIHelpers = { parseJSON, extractBraceBlock,
 *              brandSnippet, callAIWithRetry, aiActionLoading }
 * @depends-on  window.BrandService (runtime), window.LLMService (runtime),
 *              window._scpToast (runtime), window._scpIcon (runtime), jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 4/5/5.5/5.6 of v0.1.3)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 4: AI RESPONSE PARSING
  // ============================================================

  function parseJSON(text) {
    if (!text || !text.trim()) throw new Error('Empty AI response');
    try { return JSON.parse(text); } catch(e) {}
    var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { return JSON.parse(cleaned); } catch(e) {}
    var objStr = extractBraceBlock(cleaned, '{', '}');
    if (objStr) { try { return JSON.parse(objStr); } catch(e) {} }
    var arrStr = extractBraceBlock(cleaned, '[', ']');
    if (arrStr) { try { return JSON.parse(arrStr); } catch(e) {} }
    if (objStr) { var relaxed = objStr.replace(/,\s*([}\]])/g, '$1'); try { return JSON.parse(relaxed); } catch(e) {} }
    throw new Error('Could not parse AI response as JSON');
  }

  function extractBraceBlock(text, openChar, closeChar) {
    var start = text.indexOf(openChar); if (start === -1) return null;
    var depth = 0, inStr = false, escaped = false;
    for (var i = start; i < text.length; i++) {
      var ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) { depth--; if (depth === 0) return text.substring(start, i + 1); }
    }
    return null;
  }

  // ============================================================
  // SECTION 5: BRAND PROMPT HELPERS
  // ============================================================

  function brandSnippet(type) {
    var BrandService = window.BrandService;
    if (!BrandService || !BrandService.isConfigured()) return '';
    var lines = [], core = BrandService.getCore(), aud = BrandService.getAudience();
    if (type === 'research' || type === 'angles') {
      if (aud.primary) lines.push('Target audience: ' + aud.primary);
      if (aud.pain_points) lines.push('Their pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
      if (core.brand_voice) lines.push('Brand voice: ' + core.brand_voice);
      var seo = BrandService.getSeo();
      if (seo.content_gaps) lines.push('Content gaps to exploit: ' + (Array.isArray(seo.content_gaps) ? seo.content_gaps.join(', ') : seo.content_gaps));
    }
    if (type === 'hooks') {
      if (aud.primary) lines.push('Audience: ' + aud.primary);
      if (core.brand_voice) lines.push('Voice: ' + core.brand_voice);
      var fw = BrandService.getForbiddenWords();
      if (fw.length) lines.push('NEVER use: ' + fw.join(', '));
      var dos = BrandService.getDos();
      if (dos.length) lines.push('Hook style should: ' + dos.slice(0, 3).join('; '));
    }
    if (type === 'content' || type === 'platform') {
      var cnt = BrandService.getContent();
      if (cnt.writing_style) lines.push('Writing style: ' + cnt.writing_style);
      if (cnt.sentence_rules) lines.push('Sentence rules: ' + (Array.isArray(cnt.sentence_rules) ? cnt.sentence_rules.join('; ') : cnt.sentence_rules));
      if (cnt.cta_style) lines.push('CTA style: ' + cnt.cta_style);
      if (core.forbidden_words && core.forbidden_words.length) lines.push('NEVER use: ' + core.forbidden_words.join(', '));
    }
    if (type === 'media') {
      var bdPrompt = BrandService.getBrandDesignPrompt();
      if (bdPrompt) return '\n\n' + bdPrompt;
      if (core.brand_name) lines.push('Brand: ' + core.brand_name);
    }
    return lines.length ? '\n\nBrand context:\n' + lines.join('\n') : '';
  }

  // ============================================================
  // SECTION 5.5: AI RETRY WRAPPER
  // ============================================================

  function callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt) {
    var LLMService = window.LLMService;
    var toast = window._scpToast || function() {};
    LLMService.callAI(prompt, function(text) {
      try {
        onSuccess(text);
      } catch(e) {
        console.warn('[SCP] AI response parse failed, retrying with stricter instructions:', e.message);
        // Retry once with stricter JSON instructions
        var retryPrompt = prompt + '\n\nCRITICAL: Your previous response was not valid JSON. Respond with ONLY a valid JSON object. No markdown, no code fences, no explanations before or after. Just pure JSON.';
        toast('Retrying with stricter instructions...', 'info');
        LLMService.callAI(retryPrompt, function(text2) {
          try {
            onSuccess(text2);
          } catch(e2) {
            console.error('[SCP] AI retry also failed:', e2.message);
            toast('AI response format error: ' + e2.message + '. Try a different AI model.', 'error');
            if (onError) onError('Parse error after retry: ' + e2.message);
          }
        }, function(err) {
          if (onError) onError(err);
        }, actionId, systemPrompt);
      }
    }, function(err) {
      if (onError) onError(err);
    }, actionId, systemPrompt);
  }

  // ============================================================
  // SECTION 5.6: AI BUTTON LOADING STATE MANAGEMENT
  // ============================================================

  /**
   * Sets an AI button to loading state. Returns a restore function.
   */
  function aiActionLoading(actionName) {
    var icon = window._scpIcon || function() { return ''; };
    var $btns = $('[data-action="' + actionName + '"]');
    var origData = [];
    $btns.each(function() {
      origData.push({ el: this, html: $(this).html(), disabled: $(this).prop('disabled') });
      $(this).prop('disabled', true).addClass('scp-btn-loading').html(icon('spinner') + ' Working...');
    });
    return function() {
      for (var i = 0; i < origData.length; i++) {
        $(origData[i].el).prop('disabled', origData[i].disabled).removeClass('scp-btn-loading').html(origData[i].html);
      }
    };
  }

  window._scpAIHelpers = {
    parseJSON: parseJSON,
    extractBraceBlock: extractBraceBlock,
    brandSnippet: brandSnippet,
    callAIWithRetry: callAIWithRetry,
    aiActionLoading: aiActionLoading
  };

})(jQuery);


/* ----- src/ai/actions/research.js ----- */

/**
 * @category    ai
 * @purpose     AI actions: research phase (angles + hooks).
 *              Generates 4 differentiated content angles or 5 scroll-stopping
 *              hooks via the chosen LLM, parses structured JSON, mutates the
 *              post's research arrays, and re-renders.
 * @exports     window._scpAIActions.research = { angles, hooks }
 *              Also bare global functions aiResearchAngles, aiResearchHooks
 *              so existing scp-part2b exports keep working.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpGenerateId, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveTone, window._scpResolveAudience,
 *              window._scpMaybeAdvanceStatus, window._scpConstants,
 *              window._scpPart2A.snapshot, window.LLMService, window.BrandService,
 *              window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 6 of v0.1.3)
 */
(function($) {
  'use strict';

  var S, toast, esc, generateId, buildMaps, render, syncToTextarea, logActivity;
  var resolveTone, resolveAudience, maybeAdvanceStatus, Constants, snapshot;
  var LLMService, BrandService, parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    generateId = window._scpGenerateId;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    Constants = window._scpConstants;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 6: AI ACTIONS â€” RESEARCH (Angles, Hooks)
  // ============================================================

  function aiResearchAngles(postId, customInput) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-research-angles');
    toast('Researching angles...', 'info');
    var toneObj = resolveTone(post.content.tone_id);
    var audObj = resolveAudience(post.content.audience_id);
    var prompt = 'You are a senior social media strategist analyzing content angles. Generate 4 unique, differentiated content angles for this post.\n\nContext:\n- Title: ' + esc(post.title || 'Untitled') + '\n- Post type: ' + (Constants.POST_TYPES[post.type] || {}).label + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (toneObj) prompt += '- Tone: ' + toneObj.name + ' (' + (toneObj.description || '') + ')\n';
    if (audObj) prompt += '- Target audience: ' + audObj.name + ' (' + (audObj.description || '') + ')\n';
    if (customInput) prompt += '- User direction: ' + customInput + '\n';
    prompt += brandSnippet('angles');
    prompt += '\n\nRules:\n- Each angle must be DISTINCT â€” different perspective, not just rewording\n- Consider: contrarian takes, data-driven, storytelling, problem-solution, aspirational, educational\n- Think about what competing content misses or gets wrong\n- Each angle should suggest a clear emotional trigger\n\nFor each angle provide:\n- angle: short memorable name (2-4 words)\n- description: 2-3 sentences explaining the perspective and WHY it works for this audience\n\nRespond ONLY as JSON: {"angles":[{"angle":"...","description":"..."}]}';

    callAIWithRetry(prompt, function(text) {
      done();
      var parsed = parseJSON(text);
      post.research = post.research || { angles: [], hooks: [], selected_angle: '', selected_hook: '', notes: '' };
      (parsed.angles || []).forEach(function(a) { post.research.angles.push({ id: generateId('ang'), angle: a.angle || '', description: a.description || '', selected: false }); });
      post.updated = new Date().toISOString();
      logActivity('angles_researched', post.id, post.title, (parsed.angles || []).length + ' angles generated');
      snapshot('AI angles'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'angles researched');
      buildMaps(); render(); syncToTextarea(); toast('Generated ' + (parsed.angles || []).length + ' angles', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-research-angles', BrandService.getSystemPrompt('social'));
  }

  function aiResearchHooks(postId, customInput) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var doneHooks = aiActionLoading('ai-research-hooks');
    var angle = (post.research && post.research.selected_angle) || '';
    if (!angle) { toast('Select an angle first', 'warning'); return; }
    toast('Generating hooks...', 'info');
    var prompt = 'You are a copywriting expert specializing in scroll-stopping social media hooks. Generate 5 opening hooks for this post.\n\nContext:\n- Title: ' + esc(post.title || '') + '\n- Chosen angle: ' + angle + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (customInput) prompt += '- User direction: ' + customInput + '\n';
    prompt += brandSnippet('hooks');
    prompt += '\n\nRules:\n- Each hook MUST stop the scroll in under 2 seconds of reading\n- Use different hook psychology types across the 5:\n  1. Question hook (provocative question)\n  2. Bold claim / contrarian statement\n  3. Story/curiosity hook ("I was wrong about...")\n  4. Data/statistic hook (specific number)\n  5. Direct address ("If you [specific situation]...")\n- Keep each hook under 15 words\n- No generic openers like "In today\'s world" or "Have you ever wondered"\n\nRespond ONLY as JSON: {"hooks":[{"hook":"...","type":"question|bold|story|data|direct"}]}';

    callAIWithRetry(prompt, function(text) {
      doneHooks();
      var parsed = parseJSON(text);
      post.research = post.research || { angles: [], hooks: [], selected_angle: '', selected_hook: '', notes: '' };
      (parsed.hooks || []).forEach(function(h) { post.research.hooks.push({ id: generateId('hk'), hook: h.hook || h.text || '', type: h.type || '', selected: false }); });
      post.updated = new Date().toISOString();
      logActivity('hooks_researched', post.id, post.title, (parsed.hooks || []).length + ' hooks generated');
      snapshot('AI hooks'); buildMaps(); render(); syncToTextarea(); toast('Generated ' + (parsed.hooks || []).length + ' hooks', 'success');
    }, function(err) { doneHooks(); toast('AI Error: ' + err, 'error'); }, 'ai-research-hooks', BrandService.getSystemPrompt('social'));
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.research = { angles: aiResearchAngles, hooks: aiResearchHooks };

})(jQuery);


/* ----- src/ai/actions/content.js ----- */

/**
 * @category    ai
 * @purpose     AI actions: content production. Four functions covering the
 *              core writing pipeline:
 *                aiWriteContent     â€” generates a complete platform-ready post
 *                aiImproveContent   â€” rewrites an existing draft, tightening prose
 *                aiSuggestSlides    â€” plans a carousel slide deck as JSON
 *                aiGenerateScript   â€” writes a timed video script
 * @exports     window._scpAIActions.content = { write, improve, slides, script }
 *              Also bare globals aiWriteContent, aiImproveContent,
 *              aiSuggestSlides, aiGenerateScript via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpTruncate, window._scpCountChars, window._scpBuildMaps,
 *              window._scpRender, window._scpSyncToTextarea,
 *              window._scpLogActivity, window._scpResolveTone,
 *              window._scpResolveAudience, window._scpGetPlatformConfig,
 *              window._scpMaybeAdvanceStatus, window._scpCleanAIText,
 *              window._scpConstants, window._scpPart2A.snapshot,
 *              window.LLMService, window.BrandService,
 *              window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 7 of v0.1.4)
 */
(function($) {
  'use strict';

  var S, toast, esc, truncate, countChars, buildMaps, render, syncToTextarea, logActivity;
  var resolveTone, resolveAudience, getPlatformConfig, maybeAdvanceStatus, cleanAIText, Constants;
  var snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    truncate = window._scpTruncate;
    countChars = window._scpCountChars;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience;
    getPlatformConfig = window._scpGetPlatformConfig;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    cleanAIText = window._scpCleanAIText;
    Constants = window._scpConstants;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 7: AI ACTIONS â€” CONTENT
  // ============================================================

  function aiWriteContent(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    // Confirm if content exists
    if (post.content && post.content.body && post.content.body.trim().length > 50) {
      if (!confirm('This will replace your existing content. Continue?')) return;
    }
    var done = aiActionLoading('ai-write-content');
    toast('Writing content...', 'info');
    var r = post.research || {};
    var primaryPlatform = (post.platforms || [])[0] || 'LinkedIn';
    var platSettings = getPlatformConfig(primaryPlatform.toLowerCase());
    var charLimit = platSettings.char_limit || 3000;
    var toneObj = resolveTone(post.content.tone_id);
    var audObj = resolveAudience(post.content.audience_id);

    var prompt = 'Write a complete, ready-to-publish social media post.\n\nContext:\n- Primary platform: ' + primaryPlatform + ' (max ' + charLimit + ' chars)\n- Post type: ' + (Constants.POST_TYPES[post.type] || {}).label + '\n';
    if (r.selected_angle) prompt += '- Chosen angle: ' + r.selected_angle + '\n';
    if (r.selected_hook) prompt += '- Opening hook (use as first line): ' + r.selected_hook + '\n';
    if (toneObj) prompt += '- Tone: ' + toneObj.name + ' (' + (toneObj.description || '') + ')\n';
    if (audObj) prompt += '- Audience: ' + audObj.name + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nStructure requirements:\n- Start with the hook (if provided) as the very first line\n- Use line breaks for readability (especially on LinkedIn)\n- Include a clear, specific CTA (not generic "like and share")\n- End with 3-5 relevant hashtags on a new line\n- Stay within ' + charLimit + ' characters total\n- Write for ' + primaryPlatform + ' conventions and culture\n\nOutput ONLY the post text as plain text. No JSON, no markdown, no explanations.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.content = post.content || {};
      post.content.body = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('content_written', post.id, post.title, 'AI-generated content (' + countChars(post.content.body) + ' chars)');
      snapshot('AI content'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'content written');
      buildMaps(); render(); syncToTextarea(); toast('Content generated!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-write-content', BrandService.getSystemPrompt('content'));
  }

  function aiImproveContent(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || !post.content || !post.content.body) { toast('Write content first', 'warning'); return; }
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-improve-content');
    toast('Improving content...', 'info');
    var charCount = countChars(post.content.body);
    var primaryPlatform = (post.platforms || [])[0] || 'LinkedIn';

    var prompt = 'You are an elite social media editor. Improve this ' + primaryPlatform + ' post while preserving the author\'s intent and voice.\n\nCurrent post (' + charCount + ' chars):\n---\n' + post.content.body + '\n---\n';
    prompt += brandSnippet('content');
    prompt += '\n\nImprovement checklist:\n- Sharpen the hook â€” make first line impossible to scroll past\n- Tighten every sentence â€” remove filler words, passive voice, clichÃ©s\n- Strengthen the CTA â€” make it specific and actionable\n- Improve formatting â€” line breaks, white space, scanability\n- Ensure emotional resonance â€” does every paragraph earn the next?\n- Check hashtag relevance and count\n- Keep similar length (Â±15%)\n\nOutput ONLY the improved post as plain text. No explanations, no "here\'s the improved version", just the post.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.content.body = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('content_improved', post.id, post.title, 'AI-improved content');
      snapshot('AI improve'); render(); syncToTextarea(); toast('Content improved!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-improve-content', BrandService.getSystemPrompt('content'));
  }

  function aiSuggestSlides(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type !== 'carousel') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-plan-slides');
    toast('Planning slides...', 'info');
    var count = (post.carousel && post.carousel.slide_count) || 5;
    var prompt = 'You are a carousel content designer. Plan a ' + count + '-slide carousel post.\n\nContext:\n- Topic: ' + esc(post.title || '') + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (post.content.body) prompt += '- Post content: ' + truncate(post.content.body, 400) + '\n';
    if (post.research && post.research.selected_angle) prompt += '- Angle: ' + post.research.selected_angle + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nStructure rules:\n- Slide 1: Hook slide â€” bold attention-grabbing statement, minimal text\n- Slides 2-' + (count - 1) + ': Value slides â€” one key point per slide, concise text overlay\n- Slide ' + count + ': CTA slide â€” clear next step, profile tag\n- Each text_overlay should be 3-8 words (what appears ON the image)\n- Each theme explains the slide\'s purpose (for the designer)\n\nRespond ONLY as JSON: {"slides":[{"theme":"...","text_overlay":"..."}]}';

    callAIWithRetry(prompt, function(text) {
      done();
      var parsed = parseJSON(text);
      post.carousel = post.carousel || { slide_count: count, slides: [] };
      post.carousel.slides = (parsed.slides || []).map(function(s, i) { return { index: i, theme: s.theme || '', text_overlay: s.text_overlay || '' }; });
      post.carousel.slide_count = post.carousel.slides.length;
      post.updated = new Date().toISOString();
      logActivity('slides_planned', post.id, post.title, post.carousel.slides.length + ' slides planned');
      snapshot('AI slides'); render(); syncToTextarea(); toast('Slides planned!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-plan-slides');
  }

  function aiGenerateScript(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type !== 'video') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-generate-script');
    toast('Generating script...', 'info');
    var dur = post.video.duration_seconds || 60;
    var primaryPlatform = (post.platforms || [])[0] || 'Instagram';
    var formatLabel = dur <= 30 ? 'Reel/Short' : dur <= 90 ? 'Short-form video' : 'Long-form video';

    var prompt = 'You are a video script writer for social media. Write a ' + dur + '-second ' + formatLabel + ' script.\n\nContext:\n- Topic: ' + esc(post.title || '') + '\n- Platform: ' + primaryPlatform + '\n- Duration: ' + dur + ' seconds\n- Format: ' + (post.video.format || formatLabel) + '\n';
    if (post.video.concept) prompt += '- Concept: ' + post.video.concept + '\n';
    if (post.research && post.research.selected_hook) prompt += '- Hook: ' + post.research.selected_hook + '\n';
    if (post.research && post.research.selected_angle) prompt += '- Angle: ' + post.research.selected_angle + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nScript format:\n- Use timestamp markers: [0-3s], [3-8s], etc.\n- Include [VISUAL CUE] notes in brackets for what\'s on screen\n- Start with a 0-3s HOOK that stops the scroll\n- End with a clear CTA in the last 5 seconds\n- Match pacing to platform: ' + (dur <= 30 ? 'fast cuts, punchy, no wasted frames' : 'conversational but tight, one idea per segment') + '\n- Write the voiceover/spoken words as natural speech, not essay prose\n\nOutput the script as plain text only. No JSON.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.video = post.video || {};
      post.video.script = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('script_generated', post.id, post.title, dur + 's video script');
      snapshot('AI script'); render(); syncToTextarea(); toast('Script generated!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-script', BrandService.getSystemPrompt('content'));
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.content = {
    write: aiWriteContent,
    improve: aiImproveContent,
    slides: aiSuggestSlides,
    script: aiGenerateScript
  };

})(jQuery);


/* ----- src/ai/actions/media.js ----- */

/**
 * @category    ai
 * @purpose     AI actions: media prompt generation. Two functions:
 *                buildStructuredPrompt â€” assembles an image-gen prompt from
 *                                        the post's structured_config fields
 *                                        (no AI call; deterministic builder).
 *                aiGenerateMediaPrompt â€” quick mode (AI writes prompt) OR
 *                                        structured mode (builds via above
 *                                        then asks AI to enhance each).
 * @exports     window._scpAIActions.media = { buildStructured, generate }
 *              Also bare globals buildStructuredPrompt, aiGenerateMediaPrompt
 *              via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpGenerateId, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveImageStyle, window._scpPart2A.snapshot,
 *              window._scpPart2B.recordImageUsage, window.LLMService,
 *              window.BrandService, window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 8 of v0.1.5)
 */
(function($) {
  'use strict';

  var S, toast, esc, generateId, buildMaps, render, syncToTextarea, logActivity;
  var resolveImageStyle, snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    generateId = window._scpGenerateId;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveImageStyle = window._scpResolveImageStyle;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 8: AI ACTIONS â€” MEDIA PROMPTS
  // ============================================================

  function buildStructuredPrompt(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    var sc = (post.media && post.media.structured_config) || {};
    var config = (post.media && post.media.config) || {};
    var styleObj = resolveImageStyle(config.style_id);
    var bd = (S.meta.settings && S.meta.settings.brand_design) || {};

    var lines = [];
    lines.push('CREATE AN IMAGE with these specifications:');
    lines.push('');

    // Subject
    if (sc.subject) lines.push('SUBJECT: ' + sc.subject);
    if (sc.key_message) lines.push('KEY MESSAGE: ' + sc.key_message);
    if (sc.text_overlay) lines.push('TEXT ON IMAGE: "' + sc.text_overlay + '"');

    // Visual approach
    lines.push('');
    lines.push('VISUAL STYLE:');
    if (sc.visual_approach) lines.push('- Approach: ' + sc.visual_approach);
    if (styleObj) lines.push('- Image style: ' + styleObj.name + (styleObj.description ? ' (' + styleObj.description + ')' : ''));
    if (sc.background_type) lines.push('- Background: ' + sc.background_type);
    if (sc.human_presence && sc.human_presence !== 'none') lines.push('- Human presence: ' + sc.human_presence.replace(/_/g, ' '));
    if (sc.icon_usage && sc.icon_style) lines.push('- Icons: ' + sc.icon_style);
    if (sc.pattern_usage && sc.pattern_description) lines.push('- Patterns: ' + sc.pattern_description);

    // Composition
    lines.push('');
    lines.push('COMPOSITION:');
    if (sc.aspect_ratio) lines.push('- Aspect ratio: ' + sc.aspect_ratio);
    if (sc.layout) lines.push('- Layout: ' + sc.layout.replace(/_/g, ' '));
    if (sc.negative_space) lines.push('- Negative space: ' + sc.negative_space);
    if (sc.text_placement && sc.text_placement !== 'none') lines.push('- Text placement: ' + sc.text_placement);

    // Brand context
    var bdPrompt = BrandService.getBrandDesignPrompt();
    if (bdPrompt && config.brand_context_enabled !== false) {
      lines.push('');
      lines.push(bdPrompt);
    }
    if (sc.color_override) lines.push('COLOR OVERRIDE: ' + sc.color_override);
    if (sc.style_override) lines.push('STYLE OVERRIDE: ' + sc.style_override);

    // Reference images
    var refIds = sc.reference_image_ids || [];
    var refUrls = [];
    for (var i = 0; i < refIds.length; i++) {
      var img = S.imageMap[refIds[i]];
      if (img) refUrls.push(img.url);
    }
    // Also add brand design role references
    var bdRefs = bd.reference_image_ids || {};
    var autoRefs = (post.type === 'carousel') ? (bdRefs.carousel_template || []) : (post.type === 'video') ? (bdRefs.thumbnail_template || []) : (bdRefs.primary_style || []);
    for (var j = 0; j < autoRefs.length; j++) {
      var aImg = S.imageMap[autoRefs[j]];
      if (aImg && refUrls.indexOf(aImg.url) < 0) refUrls.push(aImg.url);
    }

    // Assemble prompt text
    var promptText = lines.join('\n');

    // Build prompt objects
    if (post.type === 'carousel') {
      var slides = (post.carousel && post.carousel.slides) || [];
      var count = (post.carousel && post.carousel.slide_count) || slides.length || 5;
      post.media = post.media || {};
      post.media.prompts = [];
      for (var si = 0; si < count; si++) {
        var slide = slides[si] || {};
        var slidePrompt = promptText + '\n\nSLIDE ' + (si + 1) + ' OF ' + count + ':';
        if (slide.theme) slidePrompt += '\n- Theme: ' + slide.theme;
        if (slide.text_overlay) slidePrompt += '\n- Slide text: "' + slide.text_overlay + '"';
        slidePrompt += '\n\nMAINTAIN exact same color palette, font style, and layout grid across ALL slides for visual consistency.';
        post.media.prompts.push({
          id: generateId('mp'), type: 'slide', label: 'Slide ' + (si + 1),
          prompt_text: slidePrompt, negative_prompt: sc.negative_prompt || '',
          reference_urls: refUrls, style_notes: styleObj ? styleObj.name : '', status: 'draft'
        });
      }
    } else {
      post.media = post.media || {};
      post.media.prompts = [{
        id: generateId('mp'), type: post.type === 'video' ? 'thumbnail' : 'image',
        label: post.type === 'video' ? 'Thumbnail' : 'Main Image',
        prompt_text: promptText, negative_prompt: sc.negative_prompt || '',
        reference_urls: refUrls, style_notes: styleObj ? styleObj.name : '', status: 'draft'
      }];
    }

    // Record reference image usage
    if (window._scpPart2B && window._scpPart2B.recordImageUsage) {
      refIds.forEach(function(fid) { window._scpPart2B.recordImageUsage(fid, post.id, 'structured_prompt'); });
    }

    post.updated = new Date().toISOString();
    logActivity('media_prompts_built', post.id, post.title, 'Structured prompt built (' + post.media.prompts.length + ' prompt' + (post.media.prompts.length !== 1 ? 's' : '') + ')');
    snapshot('Build structured prompt'); buildMaps(); render(); syncToTextarea();
    toast('Prompt' + (post.media.prompts.length > 1 ? 's' : '') + ' built from structured config', 'success');
  }

  function aiGenerateMediaPrompt(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type === 'text') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var promptMode = (post.media && post.media.prompt_mode) || 'quick';
    var doneMedia = aiActionLoading('ai-generate-media');

    // â”€â”€â”€ STRUCTURED MODE: Build from fields, then AI-enhance â”€â”€â”€
    if (promptMode === 'structured') {
      // First build the prompt from structured fields
      buildStructuredPrompt(postId);
      // Then ask AI to enhance it
      var builtPrompts = (post.media && post.media.prompts) || [];
      if (builtPrompts.length === 0) { doneMedia(); return; }
      toast('AI enhancing structured prompt' + (builtPrompts.length > 1 ? 's' : '') + '...', 'info');

      var pending = builtPrompts.length; var completed = 0;
      builtPrompts.forEach(function(mp, idx) {
        var enhancePrompt = 'You are an expert image prompt engineer. Enhance and expand this image generation prompt while keeping ALL the specifications exactly. Make it more detailed, vivid, and production-ready:\n\n' + mp.prompt_text + '\n\nOutput ONLY the enhanced prompt as plain text. Keep all original constraints. Add details about lighting, texture, depth, and atmosphere.';
        LLMService.callAI(enhancePrompt, function(text) {
          mp.prompt_text = text.trim();
          completed++;
          if (completed >= pending) {
            doneMedia();
            post.updated = new Date().toISOString();
            logActivity('media_prompts_enhanced', post.id, post.title, completed + ' prompt(s) AI-enhanced');
            snapshot('AI enhance media'); buildMaps(); render(); syncToTextarea();
            toast(completed + ' prompt' + (completed > 1 ? 's' : '') + ' AI-enhanced!', 'success');
          }
        }, function(err) {
          completed++;
          if (completed >= pending) { doneMedia(); render(); syncToTextarea(); }
          toast('AI enhance error: ' + err, 'error');
        }, 'ai-generate-media');
      });
      return;
    }

    // â”€â”€â”€ QUICK MODE: Original behavior with brand design injection â”€â”€â”€
    toast('Generating media prompts...', 'info');
    var config = (post.media && post.media.config) || {};
    var styleObj = resolveImageStyle(config.style_id);
    var styleName = styleObj ? styleObj.name : 'professional';

    // Collect reference image URLs from brand design guide
    var bd = (S.meta.settings && S.meta.settings.brand_design) || {};
    var bdRefs = bd.reference_image_ids || {};
    var autoRefIds = (post.type === 'carousel') ? (bdRefs.carousel_template || []) : (post.type === 'video') ? (bdRefs.thumbnail_template || []) : (bdRefs.primary_style || []);
    var refUrls = [];
    autoRefIds.forEach(function(fid) { var img = S.imageMap[fid]; if (img) refUrls.push(img.url); });

    if (post.type === 'carousel') {
      var slides = (post.carousel && post.carousel.slides) || [];
      var slideThemes = slides.map(function(s, i) { return 'Slide ' + (i + 1) + ': ' + (s.theme || 'Untitled'); }).join('\n');
      var prompt = 'Generate image prompts for a ' + slides.length + '-slide carousel:\n\nTopic: ' + esc(post.title || '') + '\nStyle: ' + styleName + '\n\nSlide themes:\n' + slideThemes + '\n';
      if (config.custom_instructions) prompt += '\nCustom instructions: ' + config.custom_instructions;
      if (config.brand_context_enabled !== false) prompt += brandSnippet('media');
      prompt += '\n\nFor each slide, write a detailed image generation prompt. Also include a negative prompt (what to avoid).\nRespond ONLY as JSON: {"prompts":[{"label":"Slide 1","prompt_text":"...","negative_prompt":"..."}]}';

      LLMService.callAI(prompt, function(text) {
        doneMedia();
        try {
          var parsed = parseJSON(text);
          post.media = post.media || { prompts: [], config: config };
          post.media.prompts = (parsed.prompts || []).map(function(p, i) {
            return { id: generateId('mp'), type: 'slide', label: p.label || 'Slide ' + (i + 1), prompt_text: p.prompt_text || p.prompt || '', negative_prompt: p.negative_prompt || '', reference_urls: refUrls, style_notes: styleName, status: 'draft' };
          });
          post.updated = new Date().toISOString();
          logActivity('media_prompts_generated', post.id, post.title, post.media.prompts.length + ' carousel prompts');
          snapshot('AI media'); buildMaps(); render(); syncToTextarea(); toast(post.media.prompts.length + ' prompts generated!', 'success');
        } catch(e) { toast('Parse error: ' + e.message, 'error'); }
      }, function(err) { doneMedia(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-media');
    } else {
      var label = post.type === 'video' ? 'Thumbnail' : 'Main Image';
      var prompt2 = 'Generate a detailed image generation prompt for a ' + (post.type === 'video' ? 'video thumbnail' : 'social media image') + ':\n\n';
      prompt2 += 'Topic: ' + esc(post.title || '') + '\nStyle: ' + styleName + '\nPlatforms: ' + (post.platforms || []).join(', ') + '\n';
      if (post.research && post.research.selected_hook) prompt2 += 'Key message: ' + post.research.selected_hook + '\n';
      if (config.custom_instructions) prompt2 += 'Custom instructions: ' + config.custom_instructions + '\n';
      if (config.brand_context_enabled !== false) prompt2 += brandSnippet('media');
      prompt2 += '\nWrite ONE detailed image generation prompt. Also write a negative prompt (what to avoid). Output as JSON: {"prompt_text":"...","negative_prompt":"..."}';

      LLMService.callAI(prompt2, function(text) {
        doneMedia();
        try {
          var parsed = parseJSON(text);
          var promptText = parsed.prompt_text || parsed.prompt || text.trim();
          var negPrompt = parsed.negative_prompt || '';
          post.media = post.media || { prompts: [], config: config };
          post.media.prompts = [{ id: generateId('mp'), type: post.type === 'video' ? 'thumbnail' : 'image', label: label, prompt_text: promptText, negative_prompt: negPrompt, reference_urls: refUrls, style_notes: styleName, status: 'draft' }];
          post.updated = new Date().toISOString();
          logActivity('media_prompts_generated', post.id, post.title, '1 ' + label.toLowerCase() + ' prompt');
          snapshot('AI media'); buildMaps(); render(); syncToTextarea(); toast('Prompt generated!', 'success');
        } catch(e) {
          // Fallback: treat entire response as prompt text
          post.media = post.media || { prompts: [], config: config };
          post.media.prompts = [{ id: generateId('mp'), type: post.type === 'video' ? 'thumbnail' : 'image', label: label, prompt_text: text.trim(), negative_prompt: '', reference_urls: refUrls, style_notes: styleName, status: 'draft' }];
          post.updated = new Date().toISOString();
          snapshot('AI media'); buildMaps(); render(); syncToTextarea(); toast('Prompt generated!', 'success');
        }
      }, function(err) { doneMedia(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-media');
    }
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.media = {
    buildStructured: buildStructuredPrompt,
    generate: aiGenerateMediaPrompt
  };

})(jQuery);


/* ----- src/ai/actions/visual.js ----- */

/**
 * @category    ai
 * @purpose     AI actions: visual plan + structured video script. Two
 *              "message-first" generators that emit structured JSON rather
 *              than free-form prose:
 *                aiGenerateVisualPlan      â€” for image/carousel posts, plans
 *                                            visual concept + text overlays +
 *                                            color mood + layout per slide.
 *                aiGenerateStructuredScript â€” for video posts, returns
 *                                            hook + body[] + outro as JSON
 *                                            plus a plain-text rendering.
 * @exports     window._scpAIActions.visual = { plan, script }
 *              Also bare globals aiGenerateVisualPlan,
 *              aiGenerateStructuredScript via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpTruncate, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveImageStyle, window._scpResolveTone,
 *              window._scpResolveAudience, window._scpMaybeAdvanceStatus,
 *              window._scpConstants, window._scpPart2A.snapshot,
 *              window.LLMService, window.BrandService, window._scpAIHelpers,
 *              jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 8.5 of v0.1.5)
 */
(function($) {
  'use strict';

  var S, toast, esc, truncate, buildMaps, render, syncToTextarea, logActivity;
  var resolveImageStyle, resolveTone, resolveAudience, maybeAdvanceStatus, Constants;
  var snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    truncate = window._scpTruncate;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveImageStyle = window._scpResolveImageStyle;
    resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    Constants = window._scpConstants;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 8.5: AI ACTIONS â€” VISUAL PLAN + STRUCTURED SCRIPT
  // ============================================================

  /**
   * Message-first visual plan generator.
   * Asks AI: "Given this message/hook, what visual communicates it best?"
   * Returns structured JSON that maps to image_visual_plan schema.
   */
  function aiGenerateVisualPlan(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type === 'text') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var doneVP = aiActionLoading('ai-generate-visual-plan');

    var r = post.research || {};
    var contentBody = (post.content && post.content.body) || '';
    var config = (post.media && post.media.config) || {};
    var styleObj = resolveImageStyle(config.style_id);
    var toneObj = resolveTone((post.content && post.content.tone_id) || '');
    var audObj = resolveAudience((post.content && post.content.audience_id) || '');

    // â”€â”€â”€ Build context-rich prompt â”€â”€â”€
    var prompt = 'You are a visual content strategist for social media. Your job is to plan the MOST IMPACTFUL visual that communicates a specific message.\n\n';
    prompt += 'FOCUS: The visual must DELIVER the message, not just look pretty. Think about what scene, subject, and text overlays will make the audience stop scrolling and understand the key point instantly.\n\n';
    prompt += 'CONTEXT:\n';
    prompt += '- Post title: ' + esc(post.title || 'Untitled') + '\n';
    prompt += '- Post type: ' + (Constants.POST_TYPES[post.type] || {}).label + '\n';
    prompt += '- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (r.selected_hook) prompt += '- Hook (opening line): "' + r.selected_hook + '"\n';
    if (r.selected_angle) prompt += '- Content angle: ' + r.selected_angle + '\n';
    if (contentBody) prompt += '- Post content (first 300 chars): ' + truncate(contentBody, 300) + '\n';
    if (toneObj) prompt += '- Tone: ' + toneObj.name + '\n';
    if (audObj) prompt += '- Target audience: ' + audObj.name + '\n';
    if (styleObj) prompt += '- Preferred visual style: ' + styleObj.name + ' (' + (styleObj.description || '') + ')\n';
    if (config.custom_instructions) prompt += '- Additional direction: ' + config.custom_instructions + '\n';
    if (config.brand_context_enabled !== false) prompt += brandSnippet('media');

    if (post.type === 'carousel') {
      // Carousel: generate per-slide plans
      var slides = (post.carousel && post.carousel.slides) || [];
      var slideCount = (post.carousel && post.carousel.slide_count) || slides.length || 5;
      prompt += '\nThis is a ' + slideCount + '-SLIDE CAROUSEL. Plan each slide as part of a narrative flow:\n';
      prompt += '- Slide 1: Hook slide â€” bold, attention-grabbing, minimal text\n';
      for (var sci = 0; sci < slides.length; sci++) {
        if (slides[sci].theme) prompt += '- Slide ' + (sci + 1) + ' theme: ' + slides[sci].theme + '\n';
      }
      prompt += '- Last slide: CTA â€” clear next step\n';
      prompt += '- ALL slides must share the same color palette, font style, and visual consistency\n';
      prompt += '\nRespond ONLY as JSON array. Each element has: visual_concept (scene, emotion, message_delivered), text_overlays (headline, subtext, cta), color_mood (palette, mood, contrast), layout (composition, focal_point, text_placement), style_notes, generation_prompt.\n\n';
      prompt += 'JSON format: [{"visual_concept":{"scene":"...","emotion":"...","message_delivered":"..."},"text_overlays":{"headline":"...","subtext":"...","cta":""},"color_mood":{"palette":"...","mood":"...","contrast":"..."},"layout":{"composition":"...","focal_point":"...","text_placement":"..."},"style_notes":"...","generation_prompt":"..."}]';

      toast('Planning ' + slideCount + ' carousel slides...', 'info');
      callAIWithRetry(prompt, function(text) {
        doneVP();
        var parsed = parseJSON(text);
        var plans = Array.isArray(parsed) ? parsed : (parsed.slides || parsed.plans || [parsed]);
        post.media = post.media || {};
        post.media.visual_plans = plans.map(function(p) {
          return {
            visual_concept: p.visual_concept || { scene: '', emotion: '', message_delivered: '' },
            text_overlays: p.text_overlays || { headline: '', subtext: '', cta: '' },
            color_mood: p.color_mood || { palette: '', mood: '', contrast: '' },
            layout: p.layout || { composition: '', focal_point: '', text_placement: '' },
            style_notes: p.style_notes || '',
            generation_prompt: p.generation_prompt || ''
          };
        });
        post.updated = new Date().toISOString();
        logActivity('visual_plan_created', post.id, post.title, plans.length + ' slide visual plans');
        snapshot('AI visual plan'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'visual plan created');
        buildMaps(); render(); syncToTextarea();
        toast(plans.length + ' slide plans generated!', 'success');
      }, function(err) { doneVP(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-media', BrandService.getSystemPrompt('social'));

    } else {
      // Single image / thumbnail
      prompt += '\nRespond ONLY as JSON object with: visual_concept (scene, emotion, message_delivered), text_overlays (headline, subtext, cta), color_mood (palette, mood, contrast), layout (composition, focal_point, text_placement), style_notes, generation_prompt.\n\n';
      prompt += 'JSON format: {"visual_concept":{"scene":"...","emotion":"...","message_delivered":"..."},"text_overlays":{"headline":"...","subtext":"...","cta":"..."},"color_mood":{"palette":"...","mood":"...","contrast":"..."},"layout":{"composition":"...","focal_point":"...","text_placement":"..."},"style_notes":"...","generation_prompt":"..."}';

      toast('Planning visual content...', 'info');
      callAIWithRetry(prompt, function(text) {
        doneVP();
        var parsed = parseJSON(text);
        post.media = post.media || {};
        post.media.visual_plan = {
          visual_concept: parsed.visual_concept || { scene: '', emotion: '', message_delivered: '' },
          text_overlays: parsed.text_overlays || { headline: '', subtext: '', cta: '' },
          color_mood: parsed.color_mood || { palette: '', mood: '', contrast: '' },
          layout: parsed.layout || { composition: '', focal_point: '', text_placement: '' },
          style_notes: parsed.style_notes || '',
          generation_prompt: parsed.generation_prompt || ''
        };
        post.updated = new Date().toISOString();
        logActivity('visual_plan_created', post.id, post.title, 'Visual content plan created');
        snapshot('AI visual plan'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'visual plan created');
        buildMaps(); render(); syncToTextarea();
        toast('Visual plan generated!', 'success');
      }, function(err) { doneVP(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-media', BrandService.getSystemPrompt('social'));
    }
  }

  /**
   * Structured video script generator.
   * Returns Hook + Body sections + Outro as structured JSON.
   */
  function aiGenerateStructuredScript(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type !== 'video') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-generate-script');
    toast('Generating structured script...', 'info');

    var dur = post.video.duration_seconds || 60;
    var primaryPlatform = (post.platforms || [])[0] || 'Instagram';
    var r = post.research || {};

    var prompt = 'You are a video script writer for social media. Create a structured ' + dur + '-second script.\n\n';
    prompt += 'CONTEXT:\n';
    prompt += '- Topic: ' + esc(post.title || '') + '\n';
    prompt += '- Platform: ' + primaryPlatform + '\n';
    prompt += '- Duration: ' + dur + ' seconds\n';
    prompt += '- Format: ' + (post.video.format || 'reel') + '\n';
    if (post.video.concept) prompt += '- Concept: ' + post.video.concept + '\n';
    if (r.selected_hook) prompt += '- Hook: ' + r.selected_hook + '\n';
    if (r.selected_angle) prompt += '- Angle: ' + r.selected_angle + '\n';
    if (post.content && post.content.body) prompt += '- Post content (first 300 chars): ' + truncate(post.content.body, 300) + '\n';
    prompt += brandSnippet('content');

    prompt += '\n\nSTRUCTURE RULES:\n';
    prompt += '- Hook: 3-5 seconds, stops the scroll. Include WHY this hook works (analysis).\n';
    prompt += '- Body: 2-4 sections (Problem, Solution, Proof, etc). Each has voiceover, visual cue, on-screen text, duration.\n';
    prompt += '- Outro: 5-8 seconds, clear CTA, closing visual.\n';
    prompt += '- Total must be approximately ' + dur + ' seconds.\n';
    prompt += '- Voiceover should be natural spoken language, not essay prose.\n\n';
    prompt += 'Respond ONLY as JSON:\n{"hook":{"voiceover":"...","visual":"...","on_screen_text":"...","duration_seconds":5,"analysis":"..."},"body":[{"section":"Problem","voiceover":"...","visual":"...","on_screen_text":"...","duration_seconds":15}],"outro":{"voiceover":"...","visual":"...","on_screen_text":"...","cta":"...","duration_seconds":8},"total_duration":' + dur + ',"music_suggestion":"..."}';

    callAIWithRetry(prompt, function(text) {
      done();
      var parsed = parseJSON(text);
      post.video = post.video || {};
      post.video.structured_script = {
        hook: parsed.hook || { voiceover: '', visual: '', on_screen_text: '', duration_seconds: 5, analysis: '' },
        body: (parsed.body || []).map(function(b) {
          return { section: b.section || '', voiceover: b.voiceover || '', visual: b.visual || '', on_screen_text: b.on_screen_text || '', duration_seconds: b.duration_seconds || 10 };
        }),
        outro: parsed.outro || { voiceover: '', visual: '', on_screen_text: '', cta: '', duration_seconds: 8 },
        total_duration: parsed.total_duration || dur,
        music_suggestion: parsed.music_suggestion || ''
      };
      // Also save as plain text for backward compat
      post.video.script = _structuredScriptToPlainText(post.video.structured_script);
      post.updated = new Date().toISOString();
      logActivity('structured_script_created', post.id, post.title, dur + 's structured video script');
      snapshot('AI structured script'); render(); syncToTextarea();
      toast('Structured script generated!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-script', BrandService.getSystemPrompt('content'));
  }

  // Private helper, only used by aiGenerateStructuredScript above.
  function _structuredScriptToPlainText(script) {
    if (!script) return '';
    var lines = [];
    if (script.hook && script.hook.voiceover) {
      lines.push('[HOOK â€” ' + (script.hook.duration_seconds || '?') + 's]');
      lines.push(script.hook.voiceover);
      if (script.hook.visual) lines.push('[VISUAL] ' + script.hook.visual);
      if (script.hook.on_screen_text) lines.push('[TEXT] ' + script.hook.on_screen_text);
      lines.push('');
    }
    if (script.body && Array.isArray(script.body)) {
      for (var i = 0; i < script.body.length; i++) {
        var b = script.body[i];
        lines.push('[' + (b.section || 'SECTION ' + (i + 1)).toUpperCase() + ' â€” ' + (b.duration_seconds || '?') + 's]');
        if (b.voiceover) lines.push(b.voiceover);
        if (b.visual) lines.push('[VISUAL] ' + b.visual);
        if (b.on_screen_text) lines.push('[TEXT] ' + b.on_screen_text);
        lines.push('');
      }
    }
    if (script.outro && script.outro.voiceover) {
      lines.push('[OUTRO â€” ' + (script.outro.duration_seconds || '?') + 's]');
      lines.push(script.outro.voiceover);
      if (script.outro.visual) lines.push('[VISUAL] ' + script.outro.visual);
      if (script.outro.cta) lines.push('[CTA] ' + script.outro.cta);
    }
    return lines.join('\n').trim();
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.visual = { plan: aiGenerateVisualPlan, script: aiGenerateStructuredScript };

})(jQuery);


/* ----- src/ai/actions/platform.js ----- */

/**
 * @category    ai
 * @purpose     AI action: per-platform content adaptation. Generates YouTube
 *              metadata (title/description/tags as JSON) for the youtube key,
 *              or plain-text adapted body for linkedin/instagram/facebook with
 *              per-platform formatting rules.
 * @exports     window._scpAIActions.platform = { adapt }
 *              Also bare global aiAdaptForPlatform so scp-part2b exports work.
 * @depends-on  Same set as actions/research.js, plus window._scpTruncate,
 *              window._scpGetPlatformConfig, window._scpCleanAIText.
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 9 of v0.1.3)
 */
(function($) {
  'use strict';

  var S, toast, truncate, buildMaps, render, syncToTextarea, logActivity;
  var getPlatformConfig, maybeAdvanceStatus, cleanAIText, Constants, snapshot;
  var LLMService, BrandService, parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    truncate = window._scpTruncate;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    getPlatformConfig = window._scpGetPlatformConfig;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    cleanAIText = window._scpCleanAIText;
    Constants = window._scpConstants;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 9: AI ACTIONS â€” PLATFORM ADAPTATION
  // ============================================================

  function aiAdaptForPlatform(postId, platformKey) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    if (!post.content || !post.content.body) { toast('Write master content first', 'warning'); return; }
    var plCfg = Constants.PLATFORMS[platformKey]; if (!plCfg) return;
    var platSettings = getPlatformConfig(platformKey);
    var done = aiActionLoading('ai-adapt-platform');
    toast('Adapting for ' + plCfg.label + '...', 'info');

    if (platformKey === 'youtube') {
      var prompt = 'You are a YouTube Shorts optimization expert. Create YouTube metadata for this content.\n\nOriginal post:\n---\n' + truncate(post.content.body, 500) + '\n---\n';
      prompt += brandSnippet('platform');
      prompt += '\n\nRequirements:\n- title: Compelling, keyword-rich, under 100 chars. Use power words.\n- description: SEO-optimized, 150-300 chars. Include 1-2 relevant keywords naturally.\n- tags: 8-12 relevant search tags, mix broad and specific\n\nRespond ONLY as JSON: {"title":"...","description":"...","tags":["..."]}';

      callAIWithRetry(prompt, function(text) {
        done();
        var parsed = parseJSON(text);
        post.platform_content = post.platform_content || {};
        post.platform_content.youtube = { enabled: true, title: parsed.title || '', description: parsed.description || '', tags: parsed.tags || [], notes: '' };
        post.updated = new Date().toISOString();
        logActivity('platform_adapted', post.id, post.title, 'Adapted for YouTube');
        snapshot('AI adapt YT'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'YouTube adapted');
        buildMaps(); render(); syncToTextarea(); toast('YouTube content ready!', 'success');
      }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-adapt-platform');
    } else {
      var charLimit = platSettings.char_limit || 3000;
      var hashtagLimit = platSettings.hashtag_limit || 5;

      // Platform-specific formatting instructions
      var platRules = '';
      if (platformKey === 'linkedin') {
        platRules = '- Professional tone, thought-leadership positioning\n- Use line breaks after every 1-2 sentences for scanability\n- Strong hook in FIRST LINE â€” this shows before "see more"\n- Use bullet points or numbered lists for key points\n- CTA should feel conversational, not salesy\n- 3-5 hashtags at the very end, on their own line\n- No emojis in first line, sparingly elsewhere\n';
      } else if (platformKey === 'instagram') {
        platRules = '- Emoji-friendly, punchy, visual-first language\n- Hook must work in 125-char preview (before "more")\n- Use short paragraphs separated by line breaks\n- Storytelling tone â€” personal, relatable\n- CTA: encourage saves, shares, comments with specific prompts\n- Put most hashtags at end (20-30 is fine) or in first comment\n- Use relevant emojis as visual anchors, not decoration\n';
      } else if (platformKey === 'facebook') {
        platRules = '- Conversational, community-focused tone\n- Ask questions to drive comments\n- Keep under 250 chars for optimal engagement (though limit is higher)\n- Shareable format â€” would someone tag a friend?\n- 1-3 hashtags maximum, or none\n- Emojis OK but don\'t overdo\n';
      }

      var prompt2 = 'You are a ' + plCfg.label + ' content specialist. Adapt this post for ' + plCfg.label + '.\n\nOriginal master content:\n---\n' + post.content.body + '\n---\n';
      prompt2 += brandSnippet('platform');
      prompt2 += '\n\n' + plCfg.label + ' formatting rules:\n' + platRules;
      prompt2 += '- Maximum ' + charLimit + ' characters\n- Up to ' + hashtagLimit + ' hashtags\n';
      prompt2 += '\nOutput ONLY the adapted post as plain text. Ready to copy-paste and publish. No JSON, no explanations.';

      LLMService.callAI(prompt2, function(text) {
        done();
        post.platform_content = post.platform_content || {};
        post.platform_content[platformKey] = post.platform_content[platformKey] || {};
        post.platform_content[platformKey].body = cleanAIText ? cleanAIText(text) : text.trim();
        post.platform_content[platformKey].enabled = true;
        post.updated = new Date().toISOString();
        logActivity('platform_adapted', post.id, post.title, 'Adapted for ' + plCfg.label);
        snapshot('AI adapt ' + platformKey); if (maybeAdvanceStatus) maybeAdvanceStatus(post, platformKey + ' adapted');
        buildMaps(); render(); syncToTextarea(); toast(plCfg.label + ' content ready!', 'success');
      }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-adapt-platform', BrandService.getSystemPrompt('platform'));
    }
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.platform = { adapt: aiAdaptForPlatform };

})(jQuery);


/* ----- src/ai/scp-part2b.js ----- */

/**
 * Social Content Planner v1.0 - Part 2B: AI & Advanced Features
 *
 * Multi-provider AI (LLMService), brand context (BrandService),
 * global research workspace (quick + advanced modes),
 * 12 AI action functions, settings (6 tabs), config CRUD, import/export.
 *
 * Registry: researchView, setupResearchEvents, settingsView, setupSettingsEvents
 *
 * Sections:
 *  1. Init & imports
 *  2. LLMService (multi-provider AI management)
 *  3. BrandService (brand context from Drupal divs)
 *  4. AI response parsing
 *  5. Brand prompt helpers
 *  6. AI actions â€” Research (angles, hooks)
 *  7. AI actions â€” Content (write, improve, slides, script)
 *  8. AI actions â€” Media prompts
 *  9. AI actions â€” Platform adaptation
 * 10. Global research view (quick + advanced)
 * 11. Settings view (6 tabs)
 * 12. Config CRUD (tones, audiences, image styles, research templates)
 * 13. Import/export
 * 14. Events & keyboard shortcuts
 * 15. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea, esc, deepClone, icon;
  var formatDate, formatRelativeTime, formatNumber, truncate, logActivity, countWords, countChars;
  var formatCharCount, badge, statusBadge, typeBadge, priorityBadge, platformBadge, progressBar;
  var Constants, maybeAdvanceStatus, resolveTag, resolveTone, resolveAudience, resolveImageStyle;
  var getPlatformConfig, cleanAIText;
  var snapshot, openModal, closeModal, openConfirmDialog, closeConfirmDialog, collectModalFields;
  var promoteResearchIdea;

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._scpPart2A && window._scpState && window._scpState.initialized) { clearInterval(checkInterval); initPart2B(); }
    else if (_checkCount > 150) { clearInterval(checkInterval); console.error('[SCP] Part 2B: Timed out'); }
  }, 100);

  function initPart2B() {
    try {
    console.log('[SCP] Initializing Part 2B...');
    S = window._scpState; render = window._scpRender; navigate = window._scpNavigate;
    toast = window._scpToast; generateId = window._scpGenerateId; buildMaps = window._scpBuildMaps;
    syncToTextarea = window._scpSyncToTextarea; esc = window._scpEsc; deepClone = window._scpDeepClone;
    icon = window._scpIcon; formatDate = window._scpFormatDate; formatRelativeTime = window._scpFormatRelativeTime;
    formatNumber = window._scpFormatNumber; truncate = window._scpTruncate; logActivity = window._scpLogActivity;
    countWords = window._scpCountWords; countChars = window._scpCountChars;
    formatCharCount = window._scpFormatCharCount; badge = window._scpBadge;
    statusBadge = window._scpStatusBadge; typeBadge = window._scpTypeBadge;
    priorityBadge = window._scpPriorityBadge; platformBadge = window._scpPlatformBadge;
    progressBar = window._scpProgressBar; Constants = window._scpConstants;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    resolveTag = window._scpResolveTag; resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience; resolveImageStyle = window._scpResolveImageStyle;
    getPlatformConfig = window._scpGetPlatformConfig;
    cleanAIText = window._scpCleanAIText;

    // Verify critical imports
    if (!S) { console.error('[SCP] Part 2B: State not available'); return; }
    if (!render) { console.error('[SCP] Part 2B: render not available'); return; }
    if (!icon) { console.error('[SCP] Part 2B: icon not available'); return; }

    var P2A = window._scpPart2A;
    if (!P2A) { console.error('[SCP] Part 2B: Part 2A exports not found'); return; }
    snapshot = P2A.snapshot; openModal = P2A.openModal; closeModal = P2A.closeModal;
    openConfirmDialog = P2A.openConfirmDialog; closeConfirmDialog = P2A.closeConfirmDialog;
    collectModalFields = P2A.collectModalFields;
    promoteResearchIdea = P2A.promoteResearchIdea;

    var R = window._scpRenderers = window._scpRenderers || {};
    R.researchView = renderResearchView;
    R.setupResearchEvents = setupResearchEvents;
    R.settingsView = renderSettingsView;
    R.setupSettingsEvents = setupSettingsEvents;
    R.imagesView = renderImagesView;
    R.setupImagesEvents = setupImagesEvents;
    R.imagePicker = renderImagePicker;

    // Register AIO inline edit save callback â€” wires structured output edits back to post data
    window._scpAIOSaveField = function(postId, path, value) {
      var post = S.postMap[postId]; if (!post) return;
      // Path format: "aio_xxx.section_key.field_key" or "aio_xxx_sN.section_key.field_key"
      // We need to resolve which data field this maps to

      var $aio = $('[data-aio-id]').filter(function() {
        return path.indexOf($(this).data('aio-id')) === 0;
      }).first();
      if (!$aio.length) { post.updated = new Date().toISOString(); syncToTextarea(); return; }

      var schemaId = $aio.data('schema');
      var oid = $aio.data('aio-id');
      // Strip the output ID prefix from the path
      var relativePath = path.replace(new RegExp('^' + oid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[._]?'), '');
      if (!relativePath) { post.updated = new Date().toISOString(); syncToTextarea(); return; }

      // Determine where to save based on schema
      var target = null;
      if (schemaId === 'image_visual_plan') {
        post.media = post.media || {};
        post.media.visual_plan = post.media.visual_plan || {};
        target = post.media.visual_plan;
      } else if (schemaId === 'video_script') {
        post.video = post.video || {};
        post.video.structured_script = post.video.structured_script || {};
        target = post.video.structured_script;
      } else if (schemaId === 'carousel_visual_plan') {
        post.media = post.media || {};
        post.media.visual_plans = post.media.visual_plans || [];
        // For carousel, the path includes sequence index: "s0.visual_concept.scene"
        var seqMatch = relativePath.match(/^s(\d+)\.(.*)/);
        if (seqMatch) {
          var seqIdx = parseInt(seqMatch[1], 10);
          while (post.media.visual_plans.length <= seqIdx) post.media.visual_plans.push({});
          target = post.media.visual_plans[seqIdx];
          relativePath = seqMatch[2];
        } else {
          post.updated = new Date().toISOString(); syncToTextarea(); return;
        }
      }

      if (target && relativePath) {
        // Set value at the relative path within the target object
        var parts = relativePath.split('.');
        var obj = target;
        for (var i = 0; i < parts.length - 1; i++) {
          var part = parts[i];
          if (/^\d+$/.test(part)) {
            var arrIdx = parseInt(part, 10);
            if (!Array.isArray(obj)) break;
            while (obj.length <= arrIdx) obj.push({});
            obj = obj[arrIdx];
          } else {
            obj[part] = obj[part] || {};
            obj = obj[part];
          }
        }
        var lastKey = parts[parts.length - 1];
        if (/^\d+$/.test(lastKey)) {
          // Numeric last key â†’ array item (shouldn't happen for field edits but handle it)
        } else {
          obj[lastKey] = value;
        }
      }
      post.updated = new Date().toISOString();
      syncToTextarea();
    };

    setupPart2BEvents(); setupKeyboardShortcuts();
    LLMService.init();
    try { BrandService.init(); BrandService.autoPopulateBrandDesign(); } catch (e) { console.error('[SCP] BrandService init error:', e); }

    // Replace any AI picker loading placeholders from Part 2A's first render
    $('.scp-ai-picker-loading').each(function() {
      try {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      } catch(pe) {
        console.warn('[SCP] Failed to replace AI picker placeholder:', pe.message);
        $(this).html(icon('warning') + ' AI');
      }
    });

    // Update AI status indicator in header
    updateAIStatusIndicator();

    // Clear Part 1's timeout flag since we loaded successfully
    S._part2bTimeout = false;

    if (render) render();
    console.log('[SCP] Part 2B initialized â€” renderers: research, settings, images');
    } catch(e) {
      console.error('[SCP] Part 2B init FAILED:', e.message, e.stack);
      // Still try to show what we can
      if (window._scpToast) window._scpToast('Part 2B init error: ' + e.message, 'error');
    }
  }

  // ============================================================
  // SECTION 2: LLMService  â€” extracted to src/ai/llm-service.js (v0.1.2)
  //   plus provider adapters in src/ai/providers/*.js (v0.1.3).
  // LLMService is now `window.LLMService`; each provider is registered
  // on `window._scpAIProviders[<id>]`. References below resolve via the
  // local alias on the next line.
  // ============================================================
  var LLMService = window.LLMService;


  // ============================================================
  // SECTION 3: BrandService  â€” extracted to src/ai/brand-service.js (v0.1.1)
  // BrandService is now `window.BrandService`. All references below resolve
  // to that global without any code change.
  // ============================================================
  var BrandService = window.BrandService;

  // ============================================================
  // SECTIONS 4-6: AI HELPERS + RESEARCH ACTIONS â€” extracted (v0.1.4)
  //   4   AI Response Parsing       -> src/ai/_helpers.js
  //   5   Brand Prompt Helpers      -> src/ai/_helpers.js
  //   5.5 AI Retry Wrapper          -> src/ai/_helpers.js
  //   5.6 AI Button Loading State   -> src/ai/_helpers.js
  //   6   Research Actions          -> src/ai/actions/research.js
  // ============================================================
  var parseJSON         = window._scpAIHelpers.parseJSON;
  var extractBraceBlock = window._scpAIHelpers.extractBraceBlock;
  var brandSnippet      = window._scpAIHelpers.brandSnippet;
  var callAIWithRetry   = window._scpAIHelpers.callAIWithRetry;
  var aiActionLoading   = window._scpAIHelpers.aiActionLoading;
  var aiResearchAngles  = window._scpAIActions.research.angles;
  var aiResearchHooks   = window._scpAIActions.research.hooks;

  // ============================================================
  // SECTION 7: AI ACTIONS â€” CONTENT â€” extracted (v0.1.5)
  //   -> src/ai/actions/content.js
  // ============================================================
  var aiWriteContent   = window._scpAIActions.content.write;
  var aiImproveContent = window._scpAIActions.content.improve;
  var aiSuggestSlides  = window._scpAIActions.content.slides;
  var aiGenerateScript = window._scpAIActions.content.script;

  // ============================================================
  // SECTION 8: AI ACTIONS â€” MEDIA PROMPTS â€” extracted (v0.1.6)
  //   -> src/ai/actions/media.js
  // ============================================================
  var buildStructuredPrompt = window._scpAIActions.media.buildStructured;
  var aiGenerateMediaPrompt = window._scpAIActions.media.generate;

  // ============================================================
  // SECTION 8.5: AI ACTIONS â€” VISUAL PLAN + STRUCTURED SCRIPT â€” extracted (v0.1.6)
  //   -> src/ai/actions/visual.js
  // ============================================================
  var aiGenerateVisualPlan       = window._scpAIActions.visual.plan;
  var aiGenerateStructuredScript = window._scpAIActions.visual.script;

  // ============================================================
  // SECTION 9: AI ACTIONS â€” PLATFORM ADAPTATION â€” extracted (v0.1.4)
  //   -> src/ai/actions/platform.js
  // ============================================================
  var aiAdaptForPlatform = window._scpAIActions.platform.adapt;

  // ============================================================
  // SECTION 10: GLOBAL RESEARCH VIEW
  // ============================================================

  function renderResearchView() {
    var researchMode = S._researchMode || 'quick';
    var html = '<div class="scp-view scp-view-research">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('flask') + ' Research</h1></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn ' + (researchMode === 'quick' ? 'scp-btn-primary' : 'scp-btn-outline') + ' scp-btn-sm" data-action="research-mode" data-mode="quick">' + icon('bolt') + ' Quick</button>';
    html += '<button class="scp-btn ' + (researchMode === 'advanced' ? 'scp-btn-primary' : 'scp-btn-outline') + ' scp-btn-sm" data-action="research-mode" data-mode="advanced">' + icon('flask') + ' Advanced</button>';
    html += '</div></div>';

    if (researchMode === 'quick') {
      html += renderQuickResearch();
    } else {
      html += renderAdvancedResearch();
    }

    // Session history
    var sessions = (S.data.research && S.data.research.sessions) || [];
    if (sessions.length > 0) {
      html += '<div class="scp-section"><div class="scp-section-header"><h2>Past Sessions</h2></div>';
      for (var si = sessions.length - 1; si >= 0; si--) {
        var ses = sessions[si];
        html += '<div class="scp-research-session" data-session-id="' + esc(ses.id) + '">';
        html += '<div class="scp-research-session-header">';
        html += '<div class="scp-research-session-info">';
        html += '<strong>' + esc(ses.topic || ses.title || 'Research Session') + '</strong>';
        html += '<span class="scp-text-sm scp-text-muted">' + esc(ses.type === 'advanced' ? 'Advanced' : 'Quick') + ' â€¢ ' + (ses.results || []).length + ' ideas â€¢ ' + formatDate(ses.created) + '</span>';
        html += '</div>';
        html += '<div class="scp-research-session-actions">';
        html += '<button class="scp-btn-icon" data-action="rename-research-session" data-session-id="' + esc(ses.id) + '" title="Rename">' + icon('edit') + '</button>';
        html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-research-session" data-session-id="' + esc(ses.id) + '" title="Delete session">' + icon('trash') + '</button>';
        html += '</div>';
        html += '</div>';
        // Results grid
        if (ses.results && ses.results.length > 0) {
          html += '<div class="scp-research-results">';
          for (var ri = 0; ri < ses.results.length; ri++) {
            var idea = ses.results[ri]; var pt = Constants.POST_TYPES[idea.type] || { icon: 'circle', color: '#80868b', label: idea.type };
            html += '<div class="scp-research-idea-card' + (idea.promoted ? ' scp-research-idea-promoted' : '') + '">';
            html += '<div class="scp-research-idea-top">';
            html += '<span class="scp-research-idea-title">' + esc(idea.title || '') + '</span>';
            html += typeBadge(idea.type);
            html += '</div>';
            if (idea.hook) html += '<div class="scp-research-idea-hook">"' + esc(truncate(idea.hook, 80)) + '"</div>';
            if (idea.reasoning) html += '<div class="scp-research-idea-reasoning">' + esc(truncate(idea.reasoning, 100)) + '</div>';
            // Rating
            html += '<div class="scp-research-idea-rating">';
            for (var star = 1; star <= 5; star++) html += '<span class="scp-star' + (star <= (idea.rating || 0) ? ' scp-star-filled' : '') + '" data-action="rate-idea" data-session="' + esc(ses.id) + '" data-idea="' + esc(idea.id) + '" data-rating="' + star + '">â˜…</span>';
            html += '</div>';
            html += '<div class="scp-research-idea-actions">';
            if (idea.promoted) html += badge('Promoted', '#059669');
            else html += '<button class="scp-btn scp-btn-sm scp-btn-primary" data-action="promote-idea" data-session="' + esc(ses.id) + '" data-idea="' + esc(idea.id) + '">' + icon('plus') + ' Create Post</button>';
            html += '</div></div>';
          }
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderQuickResearch() {
    var stg = S.meta.settings || {};
    var html = '<div class="scp-research-panel">';
    html += '<div class="scp-section-header"><h3>' + icon('bolt') + ' Quick Ideation</h3></div>';
    html += '<div class="scp-form-group"><label>Topic / Brief</label>';
    html += '<textarea class="scp-textarea" id="scpResearchTopic" rows="2" placeholder="e.g. AI automation for small businesses..."></textarea></div>';
    html += '<div class="scp-form-row">';
    html += '<div class="scp-form-third"><label>Platforms</label><select class="scp-select" id="scpResearchPlatform"><option value="">Any</option>';
    for (var pk in Constants.PLATFORMS) html += '<option value="' + pk + '">' + Constants.PLATFORMS[pk].label + '</option>';
    html += '</select></div>';
    html += '<div class="scp-form-third"><label>Tone</label><select class="scp-select" id="scpResearchTone"><option value="">Any</option>';
    (stg.tones || []).forEach(function(t) { html += '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; });
    html += '</select></div>';
    html += '<div class="scp-form-third"><label>Ideas</label><select class="scp-select" id="scpResearchCount">';
    [4, 6, 8, 10].forEach(function(n) { html += '<option value="' + n + '"' + (n === 6 ? ' selected' : '') + '>' + n + '</option>'; });
    html += '</select></div></div>';
    html += '<div class="scp-form-group"><label class="scp-toggle-label"><input type="checkbox" id="scpResearchBrand"> Include Brand Context</label></div>';
    html += '<div class="scp-research-actions"><button class="scp-btn scp-btn-ai" data-action="run-quick-research" id="scpRunQuick">' + icon('sparkles') + ' Generate Ideas</button>';
    html += LLMService.renderInlinePicker('research_quick') + '</div>';
    html += '</div>';
    return html;
  }

  function renderAdvancedResearch() {
    var templates = (S.meta.settings && S.meta.settings.research_templates) || [];
    var html = '<div class="scp-research-panel">';
    html += '<div class="scp-section-header"><h3>' + icon('flask') + ' Advanced Research</h3></div>';
    html += '<div class="scp-form-group"><label>Template</label><select class="scp-select" id="scpResearchTemplate">';
    for (var ti = 0; ti < templates.length; ti++) html += '<option value="' + esc(templates[ti].id) + '">' + esc(templates[ti].name) + ' â€” ' + esc(templates[ti].description || '') + '</option>';
    html += '</select></div>';
    html += '<div id="scpTemplateVars"></div>';
    html += '<div class="scp-form-group"><label class="scp-toggle-label"><input type="checkbox" id="scpResearchBrandAdv"> Include Brand Context</label></div>';
    html += '<div class="scp-research-actions"><button class="scp-btn scp-btn-ai" data-action="run-advanced-research">' + icon('sparkles') + ' Run Research</button>';
    html += LLMService.renderInlinePicker('research_advanced') + '</div>';
    html += '</div>';
    return html;
  }

  function runQuickResearch() {
    var topic = $('#scpResearchTopic').val();
    if (!topic || !topic.trim()) { toast('Enter a topic', 'warning'); return; }
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var platform = $('#scpResearchPlatform').val();
    var tone = $('#scpResearchTone').val();
    var count = parseInt($('#scpResearchCount').val(), 10) || 6;
    var useBrand = $('#scpResearchBrand').is(':checked');

    toast('Researching ideas...', 'info');
    $('#scpRunQuick').prop('disabled', true).html(icon('sparkles') + ' Generating...');

    var ws = (S.meta.workspace && S.meta.workspace.name) || '';
    var prompt = 'You are a social media strategist' + (ws ? ' for "' + ws + '"' : '') + '.\n\nGenerate ' + count + ' creative post ideas:\n- Topic: ' + topic + '\n';
    if (platform) prompt += '- Platform: ' + (Constants.PLATFORMS[platform] || {}).label + '\n';
    if (tone) { var tObj = resolveTone(tone); if (tObj) prompt += '- Tone: ' + tObj.name + '\n'; }
    if (useBrand) prompt += brandSnippet('research');
    prompt += '\nFor each idea provide: title, angle, hook, type (image/carousel/video/text), platforms (array), cta_suggestion, reasoning, suggested_tags (array).\n\nRespond ONLY as JSON: [{"title":"...","angle":"...","hook":"...","type":"...","platforms":[...],"cta_suggestion":"...","reasoning":"...","suggested_tags":[...]}]';

    var sessionId = generateId('rs');
    LLMService.callAI(prompt, function(text) {
      try {
        var ideas = parseJSON(text);
        if (!Array.isArray(ideas)) ideas = ideas.ideas || ideas.results || [];
        var session = {
          id: sessionId, title: truncate(topic, 50), topic: topic, type: 'quick',
          input: { topic: topic, template_id: '', variables: {}, target_platforms: platform ? [platform] : [], target_types: [], custom_instructions: '', brand_context_enabled: useBrand },
          results: ideas.map(function(idea) {
            return { id: generateId('ri'), title: idea.title || '', angle: idea.angle || '', hook: idea.hook || '', type: idea.type || 'image', platforms: idea.platforms || [], cta_suggestion: idea.cta_suggestion || '', reasoning: idea.reasoning || '', tags: idea.suggested_tags || [], promoted: false, promoted_post_id: '', rating: 0 };
          }),
          created: new Date().toISOString(), updated: new Date().toISOString()
        };
        S.data.research = S.data.research || { sessions: [] };
        S.data.research.sessions.push(session);
        logActivity('research_completed', '', '', 'Quick research: ' + session.results.length + ' ideas');
        snapshot('Quick research'); buildMaps(); render(); syncToTextarea();
        toast('Generated ' + session.results.length + ' ideas!', 'success');
      } catch(e) { toast('Parse error: ' + e.message, 'error'); }
      $('#scpRunQuick').prop('disabled', false).html(icon('sparkles') + ' Generate Ideas');
    }, function(err) {
      toast('AI Error: ' + err, 'error');
      $('#scpRunQuick').prop('disabled', false).html(icon('sparkles') + ' Generate Ideas');
    }, 'research_quick', useBrand ? BrandService.getSystemPrompt('social') : '');
  }

  function runAdvancedResearch() {
    var templateId = $('#scpResearchTemplate').val();
    var templates = (S.meta.settings && S.meta.settings.research_templates) || [];
    var template = templates.find(function(t) { return t.id === templateId; });
    if (!template) { toast('Select a template', 'warning'); return; }
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }

    var vars = {};
    (template.variables || []).forEach(function(v) { vars[v] = ($('#scpVar_' + v).val() || '').trim(); });
    var useBrand = $('#scpResearchBrandAdv').is(':checked');

    var prompt = template.prompt;
    for (var vk in vars) prompt = prompt.replace(new RegExp('\\{' + vk + '\\}', 'g'), vars[vk] || '');
    if (useBrand) prompt += brandSnippet('research');

    toast('Running research...', 'info');
    var sessionId = generateId('rs');
    LLMService.callAI(prompt, function(text) {
      try {
        var ideas = parseJSON(text);
        if (!Array.isArray(ideas)) ideas = ideas.ideas || ideas.results || [];
        var session = {
          id: sessionId, title: template.name + ' â€” ' + (vars.topic || vars.pillar || 'Research'), topic: vars.topic || vars.pillar || '', type: 'advanced',
          input: { topic: vars.topic || '', template_id: templateId, variables: vars, target_platforms: [], target_types: [], custom_instructions: '', brand_context_enabled: useBrand },
          results: ideas.map(function(idea) {
            return { id: generateId('ri'), title: idea.title || '', angle: idea.angle || '', hook: idea.hook || '', type: idea.type || 'image', platforms: idea.platforms || [], cta_suggestion: idea.cta_suggestion || '', reasoning: idea.reasoning || '', tags: idea.suggested_tags || [], promoted: false, promoted_post_id: '', rating: 0 };
          }),
          created: new Date().toISOString(), updated: new Date().toISOString()
        };
        S.data.research.sessions.push(session);
        logActivity('research_completed', '', '', 'Advanced research: ' + session.results.length + ' ideas');
        snapshot('Advanced research'); buildMaps(); render(); syncToTextarea();
        toast('Generated ' + session.results.length + ' ideas!', 'success');
      } catch(e) { toast('Parse error: ' + e.message, 'error'); }
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'research_advanced', useBrand ? BrandService.getSystemPrompt('social') : '');
  }

  // ============================================================
  // SECTION 11: SETTINGS VIEW (6 tabs)
  // ============================================================

  function renderSettingsView() {
    var tab = S.settingsTab || 'workspace';
    var tabs = [
      { key: 'workspace',  label: 'Workspace',  icon: 'briefcase' },
      { key: 'platforms',  label: 'Platforms',   icon: 'share-nodes' },
      { key: 'content',    label: 'Content',     icon: 'pen-fancy' },
      { key: 'media',      label: 'Media',       icon: 'image' },
      { key: 'research',   label: 'Research',    icon: 'flask' },
      { key: 'ai',         label: 'AI',          icon: 'sparkles' },
      { key: 'brand_design', label: 'Brand Design', icon: 'palette' }
    ];
    var html = '<div class="scp-view scp-view-settings">';
    html += '<div class="scp-view-header"><h1>' + icon('gear') + ' Settings</h1></div>';
    html += '<div class="scp-settings-tabs">';
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      html += '<button class="scp-settings-tab' + (tab === t.key ? ' scp-settings-tab-active' : '') + '" data-action="settings-tab" data-tab="' + t.key + '">' + icon(t.icon) + ' ' + esc(t.label) + '</button>';
    }
    html += '</div>';

    html += '<div class="scp-settings-body">';
    switch(tab) {
      case 'workspace':  html += renderWorkspaceSettings(); break;
      case 'platforms':  html += renderPlatformSettings(); break;
      case 'content':    html += renderContentSettings(); break;
      case 'media':      html += renderMediaSettings(); break;
      case 'research':   html += renderResearchSettings(); break;
      case 'ai':         html += renderAISettings(); break;
      case 'brand_design': html += renderBrandDesignSettings(); break;
    }
    html += '</div></div>';
    return html;
  }

  function renderWorkspaceSettings() {
    var ws = (S.meta && S.meta.workspace) || {}; var stg = (S.meta && S.meta.settings) || {};
    var html = '<div class="scp-settings-panel">';
    html += '<div class="scp-form-group"><label>Workspace Name</label><input type="text" class="scp-input scp-settings-field" data-path="workspace.name" value="' + esc(ws.name || '') + '"></div>';
    html += '<div class="scp-form-group"><label>Description</label><textarea class="scp-textarea scp-settings-field" data-path="workspace.description" rows="2">' + esc(ws.description || '') + '</textarea></div>';
    html += '<div class="scp-form-row"><div class="scp-form-third"><label>Timezone</label><select class="scp-select scp-settings-field" data-path="settings.timezone">';
    ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata'].forEach(function(tz) { html += '<option value="' + tz + '"' + (stg.timezone === tz ? ' selected' : '') + '>' + tz + '</option>'; });
    html += '</select></div>';
    html += '<div class="scp-form-third"><label>Card Density</label><select class="scp-select scp-settings-field" data-path="settings.card_density">';
    for (var d in Constants.CARD_DENSITIES) html += '<option value="' + d + '"' + (stg.card_density === d ? ' selected' : '') + '>' + Constants.CARD_DENSITIES[d].label + '</option>';
    html += '</select></div>';
    html += '<div class="scp-form-third"><label>Default View</label><select class="scp-select scp-settings-field" data-path="settings.default_view">';
    for (var v in Constants.APP_VIEWS) html += '<option value="' + v + '"' + (stg.default_view === v ? ' selected' : '') + '>' + Constants.APP_VIEWS[v].label + '</option>';
    html += '</select></div></div>';
    html += '<div class="scp-settings-actions">';
    html += '<button class="scp-btn scp-btn-outline" data-action="export-json">' + icon('download') + ' Export All</button>';
    html += '<button class="scp-btn scp-btn-outline" data-action="import-json">' + icon('upload') + ' Import</button>';
    html += '<input type="file" id="scpImportFile" accept=".json" style="display:none">';
    html += '<button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button>';
    html += '</div></div>';
    return html;
  }

  function renderPlatformSettings() {
    var platforms = (S.meta.settings && S.meta.settings.platforms) || {};
    var html = '<div class="scp-settings-panel">';
    for (var pk in Constants.PLATFORMS) {
      var pl = Constants.PLATFORMS[pk]; var cfg = platforms[pk] || {};
      html += '<div class="scp-settings-section" style="border-left:3px solid ' + pl.color + '">';
      html += '<div class="scp-flex-between"><h3 style="color:' + pl.color + '">' + icon(pl.icon) + ' ' + esc(pl.label) + '</h3>';
      html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-platform-setting" data-pk="' + pk + '" data-field="enabled"' + (cfg.enabled !== false ? ' checked' : '') + '> Enabled</label></div>';
      html += '<div class="scp-form-row">';
      html += '<div class="scp-form-half"><label>Handle</label><input type="text" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="handle" value="' + esc(cfg.handle || '') + '"></div>';
      if (pk === 'youtube') {
        html += '<div class="scp-form-half"><label>Title Limit</label><input type="number" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="title_limit" value="' + (cfg.title_limit || 100) + '"></div>';
      } else {
        html += '<div class="scp-form-half"><label>Char Limit</label><input type="number" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="char_limit" value="' + (cfg.char_limit || 3000) + '"></div>';
      }
      html += '</div></div>';
    }
    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderContentSettings() {
    var stg = S.meta.settings || {}; var defs = stg.defaults || {};
    var html = '<div class="scp-settings-panel">';
    html += renderConfigCRUD('Tones', 'tone', stg.tones || []);
    html += renderConfigCRUD('Audiences', 'audience', stg.audiences || []);
    // Defaults
    html += '<div class="scp-settings-section"><h3>Default Post Settings</h3>';
    html += '<div class="scp-form-row"><div class="scp-form-half"><label>Default Type</label><select class="scp-select scp-default-field" data-default="type">';
    for (var tk in Constants.POST_TYPES) html += '<option value="' + tk + '"' + (defs.type === tk ? ' selected' : '') + '>' + Constants.POST_TYPES[tk].label + '</option>';
    html += '</select></div>';
    html += '<div class="scp-form-half"><label>Default Priority</label><select class="scp-select scp-default-field" data-default="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) html += '<option value="' + pk + '"' + (defs.priority === pk ? ' selected' : '') + '>' + Constants.PRIORITY_LEVELS[pk].label + '</option>';
    html += '</select></div></div></div>';
    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderMediaSettings() {
    var stg = S.meta.settings || {};
    var html = '<div class="scp-settings-panel">';
    html += renderConfigCRUD('Image Styles', 'image_style', stg.image_styles || []);
    // Prompt templates
    var mpt = stg.media_prompt_templates || {};
    html += '<div class="scp-settings-section"><h3>Media Prompt Templates</h3>';
    html += '<div class="scp-form-group"><label>Image Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="image" rows="4">' + esc(mpt.image || '') + '</textarea></div>';
    html += '<div class="scp-form-group"><label>Carousel Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="carousel_batch" rows="4">' + esc(mpt.carousel_batch || '') + '</textarea></div>';
    html += '<div class="scp-form-group"><label>Thumbnail Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="thumbnail" rows="4">' + esc(mpt.thumbnail || '') + '</textarea></div>';
    html += '</div>';
    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderResearchSettings() {
    var templates = (S.meta.settings && S.meta.settings.research_templates) || [];
    var html = '<div class="scp-settings-panel">';
    html += '<div class="scp-settings-section"><div class="scp-flex-between"><h3>Research Templates</h3>';
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-research-template">' + icon('plus') + ' New</button></div>';
    for (var i = 0; i < templates.length; i++) {
      var t = templates[i];
      html += '<div class="scp-config-item"><span class="scp-config-item-name">' + esc(t.name) + '</span>';
      html += '<span class="scp-text-xs scp-text-muted">' + esc(t.description || '') + '</span>';
      html += '<button class="scp-btn-icon" data-action="edit-research-template" data-index="' + i + '">' + icon('edit') + '</button>';
      html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-research-template" data-index="' + i + '">' + icon('trash') + '</button></div>';
    }
    html += '</div>';
    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderAISettings() {
    var stg = S.meta.settings || {}; var prefs = S.meta.aiPreferences || {};
    var html = '<div class="scp-settings-panel">';

    // â”€â”€â”€ AI Status summary â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('bolt') + ' AI Status</h3>';
    if (LLMService.isConfigured()) {
      var provCount = LLMService.getProviderCount();
      var modelCount = LLMService.getTotalModelCount();
      var def = LLMService.getDefault();
      html += '<div class="scp-ai-status-summary scp-ai-status-summary-ok">';
      html += icon('circle-check') + ' <strong>' + provCount + ' provider' + (provCount > 1 ? 's' : '') + '</strong> active with <strong>' + modelCount + ' model' + (modelCount > 1 ? 's' : '') + '</strong>';
      html += '</div>';
    } else {
      html += '<div class="scp-ai-status-summary scp-ai-status-summary-off">';
      html += icon('warning') + ' <strong>No AI providers found</strong>';
      html += '</div>';
      html += '<div class="scp-ai-setup-guide">';
      html += '<p class="scp-text-sm">To enable AI features:</p>';
      html += '<ol class="scp-ai-setup-steps">';
      html += '<li>Go to your <strong>user profile</strong> edit page</li>';
      html += '<li>Find the <strong>LLM Config</strong> field (JSON textarea)</li>';
      html += '<li>Add your API keys and model configuration</li>';
      html += '<li>Make sure the config div is exposed via <strong>Drupal Views</strong> on this page</li>';
      html += '</ol>';
      html += '<p class="scp-text-xs scp-text-muted">The app looks for <code>.llm-config-data</code> or <code>.llm-brand-config-data</code> divs on the page.</p>';
      html += '</div>';
    }
    html += '<div class="scp-ai-status-actions">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="rescan-ai-config">' + icon('refresh') + ' Re-scan Page</button>';
    if (LLMService.isConfigured()) {
      html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="test-ai-connection">' + icon('bolt') + ' Test Default</button>';
    }
    html += '</div></div>';

    // â”€â”€â”€ Default Provider Picker â”€â”€â”€
    if (LLMService.isConfigured()) {
      html += '<div class="scp-settings-section"><h3>' + icon('star') + ' Default Provider & Model</h3>';
      html += '<p class="scp-text-sm scp-text-muted">This is used for all AI actions unless overridden per-action. Changes take effect immediately.</p>';
      html += '<div class="scp-ai-default-picker">';
      html += LLMService.renderInlinePicker('app-default');
      html += '</div>';
      // Show what the resolved default is
      var def = LLMService.getDefault();
      if (def) {
        var defInfo = LLMService.getProviderInfo(def.provider);
        html += '<div class="scp-ai-default-info">';
        html += '<span class="scp-text-xs scp-text-muted">Resolved default: <strong>' + esc(defInfo ? defInfo.label : def.provider) + '</strong> / <strong>' + esc(def.model) + '</strong></span>';
        html += '<span class="scp-text-xs scp-text-muted"> â€” temp: ' + def.temperature + ', max tokens: ' + formatNumber(def.max_tokens) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // â”€â”€â”€ Provider Cards â”€â”€â”€
    if (LLMService.isConfigured()) {
      var provs = LLMService.getActiveProviders();
      html += '<div class="scp-settings-section"><h3>' + icon('cube') + ' Active Providers (' + provs.length + ')</h3>';
      html += '<div class="scp-ai-provider-cards">';
      for (var pi = 0; pi < provs.length; pi++) {
        var prov = provs[pi];
        var pInfo = LLMService.getProviderInfo(prov.id);
        if (!pInfo) continue;
        var isDefault = def && def.provider === prov.id;

        html += '<div class="scp-ai-provider-card' + (isDefault ? ' scp-ai-provider-card-default' : '') + '">';
        // Card header
        html += '<div class="scp-ai-provider-card-header">';
        html += '<div class="scp-ai-provider-card-name">';
        html += '<strong>' + esc(pInfo.label) + '</strong>';
        if (isDefault) html += ' ' + badge('Default', '#0d904f');
        html += '</div>';
        html += '<div class="scp-ai-provider-card-meta">';
        html += '<span class="scp-text-xs">' + pInfo.modelCount + ' model' + (pInfo.modelCount > 1 ? 's' : '') + '</span>';
        html += '<span class="scp-text-xs" style="color:' + (pInfo.hasKey ? 'var(--scp-success)' : 'var(--scp-error)') + '">' + icon(pInfo.hasKey ? 'key' : 'warning') + ' ' + (pInfo.hasKey ? pInfo.maskedKey : 'No key') + '</span>';
        html += '</div></div>';

        // Models list
        html += '<div class="scp-ai-provider-card-models">';
        for (var mi = 0; mi < pInfo.models.length; mi++) {
          var model = pInfo.models[mi];
          var isDefModel = isDefault && def.model === model.id;
          html += '<div class="scp-ai-model-row' + (isDefModel ? ' scp-ai-model-row-active' : '') + '">';
          html += '<span class="scp-ai-model-name">' + esc(model.label) + '</span>';
          html += '<span class="scp-ai-model-params">';
          html += '<span title="Temperature">T:' + (model.temperature !== undefined ? model.temperature : '1.0') + '</span>';
          html += '<span title="Max tokens">' + formatNumber(model.max_tokens) + ' tok</span>';
          if (model.is_default) html += '<span class="scp-ai-model-badge">config default</span>';
          html += '</span></div>';
        }
        html += '</div>';

        // Card actions
        html += '<div class="scp-ai-provider-card-actions">';
        html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="test-provider" data-provider="' + esc(prov.id) + '">' + icon('bolt') + ' Test</button>';
        if (!isDefault) {
          html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="set-default-provider" data-provider="' + esc(prov.id) + '">' + icon('star') + ' Set Default</button>';
        }
        html += '</div>';
        html += '</div>'; // end card
      }
      html += '</div></div>'; // end cards + section
    }

    // â”€â”€â”€ Per-action overrides â”€â”€â”€
    var pa = prefs.perAction || {};
    var actionKeys = Object.keys(pa).filter(function(k) { return k !== 'app-default' && k !== 'test-connection'; });
    if (actionKeys.length > 0) {
      var actionLabels = {
        'ai-research-angles': { label: 'Research Angles', icon: 'eye' },
        'ai-research-hooks': { label: 'Research Hooks', icon: 'bolt' },
        'ai-write-content': { label: 'Write Content', icon: 'pen-fancy' },
        'ai-improve-content': { label: 'Improve Content', icon: 'pen' },
        'ai-plan-slides': { label: 'Plan Slides', icon: 'images' },
        'ai-generate-script': { label: 'Generate Script', icon: 'video' },
        'ai-generate-media': { label: 'Generate Media Prompts', icon: 'wand-magic' },
        'ai-adapt-platform': { label: 'Platform Adaptation', icon: 'share-nodes' },
        'research_quick': { label: 'Quick Research', icon: 'flask' },
        'research_advanced': { label: 'Advanced Research', icon: 'flask-vial' }
      };
      html += '<div class="scp-settings-section"><h3>' + icon('sliders') + ' Per-Action Overrides</h3>';
      html += '<p class="scp-text-sm scp-text-muted">These override the default for specific AI actions. Auto-saved when you change the picker next to any AI button.</p>';
      html += '<div class="scp-config-list">';
      for (var ki = 0; ki < actionKeys.length; ki++) {
        var k = actionKeys[ki];
        var actionMeta = actionLabels[k] || { label: k.replace(/-/g, ' ').replace(/^ai /i, ''), icon: 'sparkles' };
        var pInfo2 = LLMService.getProviderInfo(pa[k].provider);
        var providerLabel = pInfo2 ? pInfo2.label : pa[k].provider;
        // Find model label
        var modelLabel = pa[k].model;
        if (pInfo2) {
          for (var mli = 0; mli < pInfo2.models.length; mli++) {
            if (pInfo2.models[mli].id === pa[k].model) { modelLabel = pInfo2.models[mli].label; break; }
          }
        }
        html += '<div class="scp-config-item scp-ai-action-override">';
        html += '<span class="scp-config-item-name">' + icon(actionMeta.icon) + ' ' + esc(actionMeta.label) + '</span>';
        html += '<span class="scp-ai-override-value">' + esc(providerLabel) + ' / ' + esc(modelLabel) + '</span>';
        html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="clear-action-pref" data-action-key="' + esc(k) + '" title="Remove override">' + icon('x') + '</button>';
        html += '</div>';
      }
      html += '</div>';
      if (actionKeys.length > 1) {
        html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="clear-all-action-prefs" style="margin-top:var(--scp-space-2)">' + icon('trash') + ' Clear All Overrides</button>';
      }
      html += '</div>';
    }

    // â”€â”€â”€ Brand context toggles â”€â”€â”€
    if (BrandService.isConfigured()) {
      var enabled = stg.brand_context_enabled || {};
      html += '<div class="scp-settings-section"><h3>' + icon('fingerprint') + ' Brand Context Injection</h3>';
      html += '<p class="scp-text-sm scp-text-muted">Control which brand data is sent to AI alongside prompts.</p>';
      [{ key: 'social', label: 'Research & Social Content', icon: 'flask' },
       { key: 'content', label: 'Content Writing', icon: 'pen-fancy' },
       { key: 'media', label: 'Media Generation', icon: 'image' }].forEach(function(tgl) {
        var isOn = enabled[tgl.key] !== false;
        html += '<div class="scp-config-item"><span class="scp-config-item-name">' + icon(tgl.icon) + ' ' + esc(tgl.label) + '</span>';
        html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-brand-context-toggle" data-key="' + tgl.key + '"' + (isOn ? ' checked' : '') + '></label></div>';
      });
      html += '</div>';
    }

    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderBrandDesignSettings() {
    var bd = (S.meta.settings && S.meta.settings.brand_design) || {};
    var c = bd.colors || {}; var t = bd.typography || {}; var vs = bd.visual_style || {}; var lr = bd.layout_rules || {};
    var refs = bd.reference_image_ids || {};
    var hasDrupalBrand = BrandService.isConfigured();

    var html = '<div class="scp-settings-panel scp-brand-design-panel">';

    // Source indicator
    if (hasDrupalBrand) {
      html += '<div class="scp-ai-status-summary scp-ai-status-summary-ok" style="margin-bottom:var(--scp-space-5)">';
      html += icon('circle-check') + ' <strong>Drupal brand data detected</strong> â€” empty fields will auto-fill from your brand profile.';
      html += '</div>';
    }

    // â”€â”€â”€ Colors â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('palette') + ' Color Palette</h3>';
    html += '<div class="scp-brand-color-row">';
    html += '<div class="scp-brand-color-field"><label>Primary</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.primary" value="' + (c.primary || '#1a73e8') + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.primary" value="' + esc(c.primary || '') + '" placeholder="#1a73e8"></div></div>';
    html += '<div class="scp-brand-color-field"><label>Secondary</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.secondary" value="' + (c.secondary || '#0d904f') + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.secondary" value="' + esc(c.secondary || '') + '" placeholder="#0d904f"></div></div>';
    html += '<div class="scp-brand-color-field"><label>Accent</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.accent" value="' + (c.accent || '#e37400') + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.accent" value="' + esc(c.accent || '') + '" placeholder="#e37400"></div></div>';
    html += '<div class="scp-brand-color-field"><label>Background</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.background" value="' + (c.background || '#ffffff') + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.background" value="' + esc(c.background || '#ffffff') + '"></div></div>';
    html += '<div class="scp-brand-color-field"><label>Text</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.text" value="' + (c.text || '#202124') + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.text" value="' + esc(c.text || '#202124') + '"></div></div>';
    html += '</div>';
    html += '<div class="scp-form-group" style="margin-top:var(--scp-space-3)"><label>Palette Description</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.palette_description" value="' + esc(c.palette_description || '') + '" placeholder="e.g. Clean professional blue with green accents"></div>';
    html += '</div>';

    // â”€â”€â”€ Typography â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('font') + ' Typography</h3>';
    html += '<div class="scp-form-group"><label>Heading Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.heading_style" value="' + esc(t.heading_style || '') + '" placeholder="e.g. Bold sans-serif, clean lines"></div>';
    html += '<div class="scp-form-group"><label>Body Text Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.body_style" value="' + esc(t.body_style || '') + '" placeholder="e.g. Clean sans-serif, high readability"></div>';
    html += '<div class="scp-form-group"><label>Text Treatment on Images</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.text_treatment" value="' + esc(t.text_treatment || '') + '" placeholder="e.g. Minimal text, large headings only"></div>';
    html += '</div>';

    // â”€â”€â”€ Visual Style â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('eye') + ' Visual Style</h3>';
    html += '<div class="scp-form-group"><label>Overall Aesthetic</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.overall_aesthetic" value="' + esc(vs.overall_aesthetic || '') + '" placeholder="e.g. Modern minimalist with subtle gradients"></div>';
    html += '<div class="scp-form-row"><div class="scp-form-half"><label>Photography Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.photography_style" value="' + esc(vs.photography_style || '') + '" placeholder="Bright, natural lighting..."></div>';
    html += '<div class="scp-form-half"><label>Illustration Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.illustration_style" value="' + esc(vs.illustration_style || '') + '" placeholder="Flat vector, rounded corners..."></div></div>';
    html += '<div class="scp-form-row"><div class="scp-form-half"><label>Icon Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.icon_style" value="' + esc(vs.icon_style || '') + '" placeholder="Line icons, 2px stroke..."></div>';
    html += '<div class="scp-form-half"><label>Pattern Usage</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.pattern_usage" value="' + esc(vs.pattern_usage || '') + '" placeholder="Subtle geometric backgrounds..."></div></div>';
    html += '<div class="scp-form-group"><label>Mood / Feel</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.mood" value="' + esc(vs.mood || '') + '" placeholder="Professional but approachable, aspirational"></div>';
    html += '</div>';

    // â”€â”€â”€ Layout Rules â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('layout-grid') + ' Layout Rules</h3>';
    html += '<div class="scp-form-group"><label>Image Composition</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.image_composition" value="' + esc(lr.image_composition || '') + '" placeholder="e.g. Clean negative space, subject left-aligned"></div>';
    html += '<div class="scp-form-group"><label>Carousel Consistency</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.carousel_consistency" value="' + esc(lr.carousel_consistency || '') + '" placeholder="Same header bar, consistent fonts across slides"></div>';
    html += '<div class="scp-form-group"><label>Thumbnail Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.thumbnail_style" value="' + esc(lr.thumbnail_style || '') + '" placeholder="Bold text overlay, high contrast, face focus"></div>';
    html += '<div class="scp-form-row"><div class="scp-form-half"><label>Border Radius</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.border_radius" value="' + esc(lr.border_radius || '') + '" placeholder="Rounded corners 12-16px"></div>';
    html += '<div class="scp-form-half"><label>Spacing</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.spacing" value="' + esc(lr.spacing || '') + '" placeholder="Generous whitespace"></div></div>';
    html += '</div>';

    // â”€â”€â”€ Reference Images â”€â”€â”€
    html += '<div class="scp-settings-section"><h3>' + icon('images') + ' Reference Images by Role</h3>';
    html += '<p class="scp-text-sm scp-text-muted">Assign reference images to roles. These will be auto-suggested when generating media prompts.</p>';
    var roles = [
      { key: 'primary_style', label: 'Primary Style Reference', desc: 'Your default brand visual style' },
      { key: 'carousel_template', label: 'Carousel Template', desc: 'Consistent slide design reference' },
      { key: 'thumbnail_template', label: 'Thumbnail Template', desc: 'Video/reel thumbnail style' }
    ];
    for (var ri = 0; ri < roles.length; ri++) {
      var role = roles[ri]; var roleIds = refs[role.key] || [];
      html += '<div class="scp-brand-ref-role">';
      html += '<div class="scp-brand-ref-role-header"><strong>' + esc(role.label) + '</strong><span class="scp-text-xs scp-text-muted">' + esc(role.desc) + '</span></div>';
      html += '<div class="scp-brand-ref-thumbs">';
      for (var rii = 0; rii < roleIds.length; rii++) {
        var img = S.imageMap[roleIds[rii]];
        if (img) {
          html += '<div class="scp-brand-ref-thumb"><img src="' + esc(img.url) + '" alt=""><button class="scp-brand-ref-remove" data-action="remove-brand-ref" data-role="' + role.key + '" data-fid="' + esc(img.fid) + '">&times;</button></div>';
        }
      }
      html += '<button class="scp-brand-ref-add" data-action="add-brand-ref" data-role="' + role.key + '">' + icon('plus') + '</button>';
      html += '</div></div>';
    }
    html += '</div>';

    // â”€â”€â”€ Generated Prefix Preview â”€â”€â”€
    var previewText = BrandService.buildBrandDesignText(bd);
    html += '<div class="scp-settings-section"><h3>' + icon('eye') + ' Brand Prompt Prefix</h3>';
    html += '<p class="scp-text-sm scp-text-muted">This text is auto-injected into every media prompt. Edit to customize, or leave empty to auto-generate from fields above.</p>';
    html += '<textarea class="scp-textarea scp-brand-design-field" data-bd-path="brand_prompt_prefix" rows="8" placeholder="Auto-generated from fields above...">' + esc(bd.brand_prompt_prefix || '') + '</textarea>';
    if (previewText && !bd.brand_prompt_prefix) {
      html += '<div class="scp-brand-prefix-preview"><label class="scp-text-xs scp-text-muted">AUTO-GENERATED PREVIEW</label><pre class="scp-brand-prefix-text">' + esc(previewText) + '</pre></div>';
    }
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="regenerate-brand-prefix" style="margin-top:var(--scp-space-2)">' + icon('refresh') + ' Regenerate from Fields</button>';
    html += '</div>';

    html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 12: CONFIG CRUD
  // ============================================================

  function renderConfigCRUD(title, type, items) {
    var html = '<div class="scp-settings-section"><div class="scp-flex-between"><h3>' + esc(title) + '</h3>';
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-config" data-type="' + type + '">' + icon('plus') + ' Add</button></div>';
    html += '<div class="scp-config-list">';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="scp-config-item"><span class="scp-config-item-name">' + esc(items[i].name) + '</span>';
      html += '<span class="scp-text-xs scp-text-muted">' + esc(items[i].description || '') + '</span>';
      html += '<button class="scp-btn-icon" data-action="edit-config" data-type="' + type + '" data-index="' + i + '">' + icon('edit') + '</button>';
      html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-config" data-type="' + type + '" data-index="' + i + '">' + icon('trash') + '</button></div>';
    }
    html += '</div></div>';
    return html;
  }

  function addConfigItem(type) {
    var fields = '<div class="scp-editor-form">';
    fields += '<div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name"></div>';
    fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description"></div>';
    fields += '</div>';
    openModal('Add ' + type.replace(/_/g, ' '), fields, { onSave: function() {
      var d = collectModalFields(); if (!d.name) { toast('Name required', 'warning'); return; }
      var prefixes = { tone: 'tone', audience: 'aud', image_style: 'is' };
      var item = { id: generateId(prefixes[type] || type), name: d.name.trim(), description: d.description || '' };
      var listKeys = { tone: 'tones', audience: 'audiences', image_style: 'image_styles' };
      var listKey = listKeys[type]; if (!listKey) return;
      S.meta.settings[listKey] = S.meta.settings[listKey] || [];
      S.meta.settings[listKey].push(item);
      snapshot('Add ' + type); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Added', 'success');
    }});
  }

  function editConfigItem(type, index) {
    var listKeys = { tone: 'tones', audience: 'audiences', image_style: 'image_styles' };
    var list = S.meta.settings[listKeys[type]] || [];
    var item = list[index]; if (!item) return;
    var fields = '<div class="scp-editor-form">';
    fields += '<div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name" value="' + esc(item.name) + '"></div>';
    fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" value="' + esc(item.description || '') + '"></div>';
    fields += '</div>';
    openModal('Edit ' + type.replace(/_/g, ' '), fields, { onSave: function() {
      var d = collectModalFields(); if (!d.name) { toast('Name required', 'warning'); return; }
      item.name = d.name.trim(); item.description = d.description || '';
      snapshot('Edit ' + type); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Updated', 'success');
    }});
  }

  function deleteConfigItem(type, index) {
    var listKeys = { tone: 'tones', audience: 'audiences', image_style: 'image_styles' };
    var list = S.meta.settings[listKeys[type]] || [];
    if (!list[index]) return;
    openConfirmDialog({ title: 'Delete', message: 'Delete "' + list[index].name + '"?', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        list.splice(index, 1);
        snapshot('Delete ' + type); buildMaps(); render(); syncToTextarea(); toast('Deleted', 'success');
      }
    });
  }

  function saveAllSettings() {
    S.meta = S.meta || {}; S.meta.settings = S.meta.settings || {};
    // Deep path fields
    $('.scp-settings-field').each(function() {
      var path = $(this).data('path'); if (!path) return;
      var val = $(this).val(); var parts = path.split('.'); var obj = S.meta;
      for (var i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] || {}; obj = obj[parts[i]]; }
      obj[parts[parts.length - 1]] = val;
    });
    // Defaults
    $('.scp-default-field').each(function() {
      var key = $(this).data('default'); var val = $(this).val();
      S.meta.settings.defaults = S.meta.settings.defaults || {};
      S.meta.settings.defaults[key] = val;
    });
    // Platform settings
    $('.scp-platform-setting').each(function() {
      var pk = $(this).data('pk'); var field = $(this).data('field');
      S.meta.settings.platforms = S.meta.settings.platforms || {};
      S.meta.settings.platforms[pk] = S.meta.settings.platforms[pk] || {};
      if ($(this).is(':checkbox')) S.meta.settings.platforms[pk][field] = $(this).is(':checked');
      else if (field === 'char_limit' || field === 'title_limit' || field === 'hashtag_limit') S.meta.settings.platforms[pk][field] = parseInt($(this).val(), 10) || 0;
      else S.meta.settings.platforms[pk][field] = $(this).val();
    });
    // Media prompt templates
    $('.scp-mpt-field').each(function() {
      var key = $(this).data('mpt');
      S.meta.settings.media_prompt_templates = S.meta.settings.media_prompt_templates || {};
      S.meta.settings.media_prompt_templates[key] = $(this).val();
    });
    // Brand context toggles
    S.meta.settings.brand_context_enabled = S.meta.settings.brand_context_enabled || {};
    $('.scp-brand-context-toggle').each(function() { var key = $(this).data('key'); if (key) S.meta.settings.brand_context_enabled[key] = $(this).is(':checked'); });
    // Brand design fields
    S.meta.settings.brand_design = S.meta.settings.brand_design || {};
    $('.scp-brand-design-field').each(function() {
      var path = $(this).data('bd-path'); if (!path) return;
      var val = $(this).val(); var parts = path.split('.'); var obj = S.meta.settings.brand_design;
      for (var i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] || {}; obj = obj[parts[i]]; }
      obj[parts[parts.length - 1]] = val;
    });
    S.cardDensity = S.meta.settings.card_density || S.cardDensity;

    // Save AI app-default from picker (if present on Settings > AI tab)
    var $defProvider = $('.scp-ai-provider-select[data-action-id="app-default"]');
    var $defModel = $('.scp-ai-model-select[data-action-id="app-default"]');
    if ($defProvider.length && $defModel.length) {
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.appDefault = { provider: $defProvider.val(), model: $defModel.val() };
      console.log('[SCP] Saved AI default: ' + $defProvider.val() + ' / ' + $defModel.val());
    }

    snapshot('Save settings'); buildMaps(); syncToTextarea();

    // Update AI status indicator in header to reflect new default
    updateAIStatusIndicator();

    toast('Settings saved', 'success');
  }

  // ============================================================
  // SECTION 13: IMPORT/EXPORT
  // ============================================================

  function exportJSON(mode) {
    mode = mode || 'combined';
    var name = ((S.meta.workspace && S.meta.workspace.name) || 'scp').toLowerCase().replace(/\s+/g, '-');
    var date = new Date().toISOString().split('T')[0];
    var json, fileName;
    if (mode === 'meta-only') { json = JSON.stringify(S.meta, null, 2); fileName = name + '-meta-' + date + '.json'; }
    else if (mode === 'data-only') { json = JSON.stringify(S.data, null, 2); fileName = name + '-data-' + date + '.json'; }
    else { json = JSON.stringify({ _format: 'scp-combined', _version: '1.0', meta: S.meta, data: S.data, activity: S.activity }, null, 2); fileName = name + '-export-' + date + '.json'; }
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Exported: ' + fileName, 'success');
  }

  function importJSON() {
    var $input = $('#scpImportFile');
    if (!$input.length) { $input = $('<input type="file" id="scpImportFile" accept=".json" style="display:none">'); $('body').append($input); }
    $input.off('change').on('change', function(e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var imported = JSON.parse(evt.target.result);
          openConfirmDialog({ title: 'Import Data', message: 'Replace all data? Current data will be lost.', confirmLabel: 'Import', danger: true,
            onConfirm: function() {
              if (imported._format === 'scp-combined' && imported.meta && imported.data) {
                S.meta = imported.meta; S.data = imported.data; S.activity = imported.activity || [];
              } else if (imported.workspace || imported.settings) {
                S.meta = imported;
              } else {
                S.data = imported;
              }
              snapshot('Import'); buildMaps(); render(); syncToTextarea(); toast('Imported successfully', 'success');
            }
          });
        } catch(err) { toast('Invalid JSON file', 'error'); }
      };
      reader.readAsText(file); $input.val('');
    });
    $input.click();
  }

  // ============================================================
  // SECTION 13.1: IMAGES VIEW â€” Gallery, Detail, CRUD, Upload
  // ============================================================

  var getImages, getImageById, getAllImageTags, parseImageField;

  function _importImageHelpers() {
    getImages = window._scpGetImages;
    getImageById = window._scpGetImageById;
    getAllImageTags = window._scpGetAllImageTags;
    parseImageField = window._scpParseImageField;
  }

  function renderImagesView() {
    if (!getImages) _importImageHelpers();
    var cats = (S.meta && S.meta.image_categories) || [];
    var imgs = getImages(S.imageFilter);
    var allImgTags = getAllImageTags();

    var html = '<div class="scp-view scp-view-images">';
    // Header
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('images') + ' Reference Images</h1>';
    html += '<span class="scp-view-subtitle">' + S.images.length + ' image' + (S.images.length !== 1 ? 's' : '') + '</span></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn scp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload</button>';
    html += '<button class="scp-btn-icon' + (S.imageViewMode === 'grid' ? '' : ' scp-btn-icon-active') + '" data-action="image-view-mode" data-mode="list" title="List view">' + icon('list') + '</button>';
    html += '<button class="scp-btn-icon' + (S.imageViewMode === 'grid' ? ' scp-btn-icon-active' : '') + '" data-action="image-view-mode" data-mode="grid" title="Grid view">' + icon('layout-grid') + '</button>';
    html += '</div></div>';

    // Filter bar
    html += '<div class="scp-img-filters">';
    html += '<div class="scp-search-wrapper"><span class="scp-icon">' + icon('search') + '</span>';
    html += '<input type="text" class="scp-input scp-img-search" id="scpImgSearch" placeholder="Search images..." value="' + esc(S.imageFilter.search || '') + '"></div>';
    html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="category"><option value="">All Categories</option>';
    for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (S.imageFilter.category === cats[ci].id ? ' selected' : '') + '>' + esc(cats[ci].label) + '</option>';
    html += '</select>';
    // Style filter
    var imgStyles = (S.meta.settings && S.meta.settings.image_styles) || [];
    if (imgStyles.length > 0) {
      html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="style"><option value="">All Styles</option>';
      for (var sti = 0; sti < imgStyles.length; sti++) html += '<option value="' + esc(imgStyles[sti].id) + '"' + (S.imageFilter.style === imgStyles[sti].id ? ' selected' : '') + '>' + esc(imgStyles[sti].name) + '</option>';
      html += '</select>';
    }
    if (allImgTags.length > 0) {
      html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="tag"><option value="">All Tags</option>';
      for (var ti = 0; ti < allImgTags.length; ti++) html += '<option value="' + esc(allImgTags[ti]) + '"' + (S.imageFilter.tag === allImgTags[ti] ? ' selected' : '') + '>' + esc(allImgTags[ti]) + '</option>';
      html += '</select>';
    }
    html += '<button class="scp-btn scp-btn-sm' + (S.imageFilter.star ? ' scp-btn-primary' : ' scp-btn-outline') + '" data-action="toggle-img-star-filter">' + icon('star') + ' Starred</button>';
    html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="sort">';
    [['newest', 'Newest'], ['name', 'Name'], ['most-used', 'Most Used']].forEach(function(opt) {
      html += '<option value="' + opt[0] + '"' + (S.imageFilter.sort === opt[0] ? ' selected' : '') + '>' + opt[1] + '</option>';
    });
    html += '</select>';
    html += '</div>';

    // Gallery
    if (imgs.length === 0) {
      html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('images') + '</div>';
      if (S.images.length === 0 && (!S.$imageField || !S.$imageField.length)) {
        html += '<div class="scp-empty-state-title">Image Field Not Found</div>';
        html += '<div class="scp-empty-state-text">Add a <strong>field_images</strong> (Image, multi-value) field to your Social Content Planner content type in Drupal, then upload reference images on this node.</div>';
      } else if (S.images.length === 0) {
        html += '<div class="scp-empty-state-title">No reference images yet</div>';
        html += '<div class="scp-empty-state-text">Upload brand reference images to build your visual library. These are used to guide AI image prompt generation for brand consistency.</div>';
        html += '<button class="scp-btn scp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload First Image</button>';
      } else {
        html += '<div class="scp-empty-state-title">No matches</div>';
        html += '<div class="scp-empty-state-text">Try adjusting your search or filters.</div>';
      }
      html += '</div>';
    } else if (S.imageViewMode === 'grid') {
      html += '<div class="scp-img-grid">';
      for (var gi = 0; gi < imgs.length; gi++) html += renderImageCard(imgs[gi]);
      html += '</div>';
    } else {
      html += '<div class="scp-img-list-table">';
      for (var li = 0; li < imgs.length; li++) html += renderImageListRow(imgs[li]);
      html += '</div>';
    }

    // Detail panel (shown when image selected)
    if (S.selectedImageId && S.imageMap[S.selectedImageId]) {
      html += renderImageDetailPanel(S.imageMap[S.selectedImageId]);
    }

    html += '</div>';
    return html;
  }

  function renderImageCard(img) {
    var cat = S.imageCategoryMap[img.category];
    var isSelected = S.selectedImageId === img.fid;
    var html = '<div class="scp-img-card' + (isSelected ? ' scp-img-card-selected' : '') + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
    html += '<div class="scp-img-card-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.alt || img.filename) + '" loading="lazy"></div>';
    html += '<div class="scp-img-card-body">';
    html += '<div class="scp-img-card-top">';
    html += '<span class="scp-img-card-name">' + esc(truncate(img.filename, 24)) + '</span>';
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '" title="' + (img.star ? 'Unstar' : 'Star') + '">â˜…</button>';
    html += '</div>';
    if (cat) html += '<span class="scp-badge" style="background:' + cat.color + '15;color:' + cat.color + '">' + icon(cat.icon) + ' ' + esc(cat.label) + '</span>';
    var styleObj = img.style ? S.imageStyleMap[img.style] : null;
    if (styleObj) html += '<span class="scp-badge" style="background:var(--scp-primary-light);color:var(--scp-primary)">' + icon('palette') + ' ' + esc(styleObj.name) + '</span>';
    if (img.tags && img.tags.length > 0) {
      html += '<div class="scp-img-card-tags">';
      for (var t = 0; t < Math.min(img.tags.length, 3); t++) html += '<span class="scp-tag-chip" style="font-size:10px;padding:1px 6px;border-color:var(--scp-border-default);cursor:default">' + esc(img.tags[t]) + '</span>';
      if (img.tags.length > 3) html += '<span class="scp-text-xs scp-text-muted">+' + (img.tags.length - 3) + '</span>';
      html += '</div>';
    }
    if (img.usage && img.usage.length > 0) html += '<span class="scp-text-xs scp-text-muted">' + icon('link') + ' Used in ' + img.usage.length + ' post' + (img.usage.length !== 1 ? 's' : '') + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderImageListRow(img) {
    var cat = S.imageCategoryMap[img.category];
    var isSelected = S.selectedImageId === img.fid;
    var html = '<div class="scp-img-list-row' + (isSelected ? ' scp-img-list-row-selected' : '') + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
    html += '<img class="scp-img-list-thumb" src="' + esc(img.url) + '" alt="" loading="lazy">';
    html += '<div class="scp-img-list-info"><span class="scp-img-list-name">' + esc(img.filename) + '</span>';
    if (img.description) html += '<span class="scp-text-xs scp-text-muted">' + esc(truncate(img.description, 60)) + '</span>';
    html += '</div>';
    if (cat) html += '<span class="scp-badge" style="background:' + cat.color + '15;color:' + cat.color + '">' + esc(cat.label) + '</span>';
    var styleObj = img.style ? S.imageStyleMap[img.style] : null;
    if (styleObj) html += '<span class="scp-badge" style="background:var(--scp-primary-light);color:var(--scp-primary)">' + esc(styleObj.name) + '</span>';
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">â˜…</button>';
    html += '<span class="scp-text-xs scp-text-muted">' + (img.usage || []).length + ' use' + ((img.usage || []).length !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    return html;
  }

  function renderImageDetailPanel(img) {
    var cats = (S.meta && S.meta.image_categories) || [];
    var html = '<div class="scp-img-detail-backdrop" data-action="close-image-detail"></div>';
    html += '<div class="scp-img-detail">';
    html += '<div class="scp-img-detail-header"><h3>' + icon('image') + ' Image Details</h3>';
    html += '<button class="scp-btn-icon" data-action="close-image-detail">' + icon('x') + '</button></div>';

    html += '<div class="scp-img-detail-body">';
    // Preview
    html += '<div class="scp-img-detail-preview"><img src="' + esc(img.url) + '" alt="' + esc(img.alt || '') + '"></div>';
    // Filename + star
    html += '<div class="scp-img-detail-title">';
    html += '<strong>' + esc(img.filename) + '</strong>';
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">â˜…</button>';
    html += '</div>';

    // Editable fields
    html += '<div class="scp-editor-form">';
    html += '<div class="scp-form-group"><label>Description</label>';
    html += '<textarea class="scp-textarea scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="description" rows="2" placeholder="Describe this reference image...">' + esc(img.description || '') + '</textarea></div>';

    html += '<div class="scp-form-group"><label>Category</label>';
    html += '<select class="scp-select scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="category">';
    html += '<option value="">Uncategorized</option>';
    for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (img.category === cats[ci].id ? ' selected' : '') + '>' + esc(cats[ci].label) + '</option>';
    html += '</select></div>';

    // Visual style â€” for filtering in media step
    var imgStyles = (S.meta.settings && S.meta.settings.image_styles) || [];
    html += '<div class="scp-form-group"><label>Visual Style</label>';
    html += '<select class="scp-select scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="style">';
    html += '<option value="">No style assigned</option>';
    for (var sti = 0; sti < imgStyles.length; sti++) html += '<option value="' + esc(imgStyles[sti].id) + '"' + (img.style === imgStyles[sti].id ? ' selected' : '') + '>' + esc(imgStyles[sti].name) + '</option>';
    html += '</select></div>';

    html += '<div class="scp-form-group"><label>Tags</label>';
    html += '<input type="text" class="scp-input scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="tags" value="' + esc((img.tags || []).join(', ')) + '" placeholder="minimalist, blue-theme, clean..."></div>';

    html += '<div class="scp-form-group"><label>Notes</label>';
    html += '<textarea class="scp-textarea scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="notes" rows="2" placeholder="When to use this reference...">' + esc(img.notes || '') + '</textarea></div>';
    html += '</div>';

    // Usage history
    if (img.usage && img.usage.length > 0) {
      html += '<div class="scp-img-detail-section"><h4>Usage History</h4>';
      html += '<div class="scp-img-usage-list">';
      for (var ui = 0; ui < img.usage.length; ui++) {
        var u = img.usage[ui]; var post = S.postMap[u.post_id];
        html += '<div class="scp-img-usage-item">';
        html += '<span>' + (post ? esc(truncate(post.title, 30)) : esc(u.post_id)) + '</span>';
        html += '<span class="scp-text-xs scp-text-muted">' + formatDate(u.used_at) + '</span>';
        html += '</div>';
      }
      html += '</div></div>';
    }

    // Info row
    html += '<div class="scp-img-detail-info">';
    html += '<span>File ID: ' + esc(img.fid) + '</span>';
    html += '</div>';

    // Actions
    html += '<div class="scp-img-detail-actions">';
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="copy-image-url" data-url="' + esc(img.url) + '">' + icon('copy') + ' Copy URL</button>';
    html += '<a href="' + esc(img.url) + '" target="_blank" class="scp-btn scp-btn-sm scp-btn-outline">' + icon('external-link') + ' Open</a>';
    html += '<button class="scp-btn scp-btn-sm scp-btn-outline" style="margin-left:auto;color:var(--scp-error)" data-action="delete-image-meta" data-fid="' + esc(img.fid) + '">' + icon('trash') + ' Clear Metadata</button>';
    html += '</div>';

    html += '</div></div>'; // end body + panel
    return html;
  }

  // --- Image CRUD ---

  function saveImageMeta(fid, field, value) {
    S.meta.reference_images = S.meta.reference_images || {};
    S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: '', style: '', tags: [], star: false, description: '', notes: '', usage: [] };
    var meta = S.meta.reference_images[fid];
    if (field === 'tags') {
      meta.tags = value.split(',').map(function(t) { return t.trim().toLowerCase(); }).filter(Boolean);
    } else {
      meta[field] = value;
    }
    // Sync runtime
    if (S.imageMap[fid]) {
      S.imageMap[fid].category = meta.category;
      S.imageMap[fid].style = meta.style || '';
      S.imageMap[fid].tags = meta.tags;
      S.imageMap[fid].description = meta.description;
      S.imageMap[fid].notes = meta.notes;
    }
    syncToTextarea();
  }

  function toggleImageStar(fid) {
    S.meta.reference_images = S.meta.reference_images || {};
    S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: '', tags: [], star: false, description: '', notes: '', usage: [] };
    S.meta.reference_images[fid].star = !S.meta.reference_images[fid].star;
    if (S.imageMap[fid]) S.imageMap[fid].star = S.meta.reference_images[fid].star;
    syncToTextarea();
  }

  function deleteImageMeta(fid) {
    openConfirmDialog({ title: 'Clear Metadata', message: 'Remove all metadata (category, tags, notes) for this image? The image file itself remains in Drupal.', confirmLabel: 'Clear', danger: true,
      onConfirm: function() {
        if (S.meta.reference_images && S.meta.reference_images[fid]) delete S.meta.reference_images[fid];
        if (S.imageMap[fid]) { S.imageMap[fid].category = ''; S.imageMap[fid].tags = []; S.imageMap[fid].star = false; S.imageMap[fid].description = ''; S.imageMap[fid].notes = ''; }
        S.selectedImageId = null; syncToTextarea(); render(); toast('Metadata cleared', 'success');
      }
    });
  }

  function recordImageUsage(fid, postId, context) {
    S.meta.reference_images = S.meta.reference_images || {};
    S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: '', tags: [], star: false, description: '', notes: '', usage: [] };
    S.meta.reference_images[fid].usage.push({ post_id: postId, used_at: new Date().toISOString(), context: context || 'media_prompt' });
    if (S.imageMap[fid]) S.imageMap[fid].usage = S.meta.reference_images[fid].usage;
    syncToTextarea();
  }

  // --- Upload trigger ---

  function triggerImageUpload() {
    if (!S.$imageField || !S.$imageField.length) { toast('Image field not found on this page', 'error'); return; }
    // Temporarily show the Drupal field to trigger upload
    S.$imageField.show();
    // Find the last empty file input (Drupal adds a new one for each slot)
    var $fileInputs = S.$imageField.find('input[type="file"]');
    var $emptySlot = $fileInputs.filter(function() { return !$(this).val(); }).last();
    if (!$emptySlot.length) { toast('No upload slots available â€” save the node first to get more slots', 'warning'); S.$imageField.hide(); return; }
    // Set up a one-time listener for Drupal AJAX completion
    var _checkCount = 0;
    var _prevCount = S.images.length;
    toast('Drupal upload dialog opened â€” select your image', 'info');
    $emptySlot.trigger('click');
    // Poll for new image after upload completes
    var pollTimer = setInterval(function() {
      _checkCount++;
      // Re-parse to detect new images
      parseImageField();
      if (S.images.length > _prevCount) {
        clearInterval(pollTimer);
        S.$imageField.hide();
        var newImg = S.images[S.images.length - 1];
        S.selectedImageId = newImg.fid;
        logActivity('image_uploaded', '', '', 'Uploaded reference image: ' + newImg.filename);
        buildMaps(); render(); toast('Image uploaded! Add metadata below.', 'success');
      } else if (_checkCount > 120) { // 60 seconds timeout
        clearInterval(pollTimer);
        S.$imageField.hide();
        toast('Upload timed out. If you selected a file, try saving the node first, then re-open this page.', 'warning');
      }
    }, 500);
  }

  // ============================================================
  // SECTION 13.2: IMAGE PICKER â€” Reusable selection modal
  // ============================================================

  function renderImagePicker(options) {
    if (!getImages) _importImageHelpers();
    options = options || {};
    var mode = options.mode || 'multi'; // 'single' or 'multi'
    var selectedIds = options.selectedIds || [];
    var filterCategory = options.category || '';
    var imgs = getImages({ category: filterCategory });
    var cats = (S.meta && S.meta.image_categories) || [];

    var html = '<div class="scp-img-picker">';
    // Filter row
    html += '<div class="scp-img-picker-filters">';
    html += '<select class="scp-select scp-select-sm scp-img-picker-cat">';
    html += '<option value="">All</option>';
    for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (filterCategory === cats[ci].id ? ' selected' : '') + '>' + esc(cats[ci].label) + '</option>';
    html += '</select>';
    html += '<span class="scp-text-xs scp-text-muted">' + imgs.length + ' image' + (imgs.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    if (imgs.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No images available. Upload reference images first.</p></div>';
    } else {
      html += '<div class="scp-img-picker-grid">';
      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i]; var isChecked = selectedIds.indexOf(img.fid) > -1;
        html += '<label class="scp-img-picker-item' + (isChecked ? ' scp-img-picker-item-selected' : '') + '">';
        html += '<input type="' + (mode === 'single' ? 'radio' : 'checkbox') + '" name="scp_img_pick" class="scp-img-picker-check" data-fid="' + esc(img.fid) + '"' + (isChecked ? ' checked' : '') + '>';
        html += '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy">';
        if (img.star) html += '<span class="scp-img-picker-star">â˜…</span>';
        html += '<span class="scp-img-picker-label">' + esc(truncate(img.filename, 16)) + '</span>';
        html += '</label>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function openImagePickerModal(options, callback) {
    options = options || {};
    var content = renderImagePicker(options);
    openModal('Select Reference Images', content, {
      size: 'lg',
      saveLabel: 'Select',
      onSave: function() {
        var selected = [];
        $('.scp-img-picker-check:checked').each(function() { selected.push($(this).data('fid')); });
        closeModal();
        if (callback) callback(selected);
      }
    });
    // Category filter inside modal
    $(document).off('change.scp-imgpick-cat', '.scp-img-picker-cat').on('change.scp-imgpick-cat', '.scp-img-picker-cat', function() {
      var cat = $(this).val();
      var newContent = renderImagePicker({ mode: options.mode, selectedIds: options.selectedIds, category: cat });
      $('.scp-modal-body').html(newContent);
    });
  }

  // --- Images events ---

  function setupImagesEvents() {
    // handled by global events in setupPart2BEvents
  }

  // ============================================================
  // SECTION 13.5: AI STATUS INDICATOR + TEST CONNECTION
  // ============================================================

  function updateAIStatusIndicator() {
    var $el = $('#scpAIStatus');
    if (!$el.length) return;
    if (LLMService.isConfigured()) {
      var def = LLMService.getDefault();
      if (def) {
        // Find provider label
        var provs = LLMService.getActiveProviders();
        var provLabel = def.provider;
        for (var i = 0; i < provs.length; i++) {
          if (provs[i].id === def.provider) { provLabel = provs[i].label; break; }
        }
        // Find model label
        var modelLabel = def.model;
        var models = LLMService.getActiveModels(def.provider);
        for (var j = 0; j < models.length; j++) {
          if (models[j].id === def.model) { modelLabel = models[j].label || models[j].id; break; }
        }
        var displayText = provLabel + ' / ' + modelLabel;
        if (displayText.length > 35) displayText = displayText.substring(0, 32) + 'â€¦';
        $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">' + esc(displayText) + '</span>');
        $el.attr('title', 'AI: ' + provLabel + ' / ' + modelLabel + ' â€” click to change');
      } else {
        $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">AI Ready</span>');
        $el.attr('title', 'AI active â€” click to configure');
      }
    } else {
      $el.html('<span class="scp-ai-status-dot scp-ai-status-off"></span><span class="scp-ai-status-label">No AI</span>');
      $el.attr('title', 'AI not configured â€” click for setup');
    }
  }

  function testAIConnection() {
    if (!LLMService.isConfigured()) { toast('No AI providers configured. Add providers in your user profile â†’ LLM Config field.', 'warning'); return; }
    toast('Testing AI connection...', 'info');
    var $btn = $('[data-action="test-ai-connection"]');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    LLMService.callAI('Respond with exactly: {"status":"ok","message":"Connection successful"}', function(text) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      try {
        var parsed = parseJSON(text);
        if (parsed.status === 'ok') {
          toast('AI connection successful!', 'success');
          $btn.after('<span class="scp-ai-test-result scp-ai-test-ok" style="margin-left:var(--scp-space-2)">' + icon('circle-check') + ' Connected</span>');
          setTimeout(function() { $('.scp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 4000);
        } else {
          toast('AI responded but format unexpected: ' + text.substring(0, 100), 'warning');
        }
      } catch(e) {
        // Even if not valid JSON, the AI responded â€” connection works
        toast('AI connection works! (Response: ' + text.substring(0, 60) + ')', 'success');
        $btn.after('<span class="scp-ai-test-result scp-ai-test-ok" style="margin-left:var(--scp-space-2)">' + icon('circle-check') + ' Connected</span>');
        setTimeout(function() { $('.scp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 4000);
      }
    }, function(err) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      toast('AI connection failed: ' + err, 'error');
      $btn.after('<span class="scp-ai-test-result scp-ai-test-fail" style="margin-left:var(--scp-space-2)">' + icon('circle-xmark') + ' Failed</span>');
      setTimeout(function() { $('.scp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 6000);
    }, 'test-connection');
  }

  // ============================================================
  // SECTION 14: EVENTS & KEYBOARD SHORTCUTS
  // ============================================================

  function setupPart2BEvents() {
    $(document).off('click.scp2b-stab', '[data-action="settings-tab"]').on('click.scp2b-stab', '[data-action="settings-tab"]', function(e) { e.preventDefault(); S.settingsTab = $(this).data('tab'); render(); });
    $(document).off('click.scp2b-ss', '[data-action="save-settings"]').on('click.scp2b-ss', '[data-action="save-settings"]', function(e) { e.preventDefault(); saveAllSettings(); });
    // AI picker dynamic model update
    $(document).off('change.scp2b-aip', '.scp-ai-provider-select').on('change.scp2b-aip', '.scp-ai-provider-select', function() {
      var actionId = $(this).data('action-id'); var pid = $(this).val();
      var models = LLMService.getActiveModels(pid);
      var $modSel = $('.scp-ai-model-select[data-action-id="' + actionId + '"]').empty();
      for (var i = 0; i < models.length; i++) $modSel.append('<option value="' + esc(models[i].id) + '" data-temp="' + (models[i].temperature !== undefined ? models[i].temperature : 1.0) + '" data-tokens="' + (models[i].max_tokens || 8192) + '">' + esc(models[i].label) + '</option>');
    });
    // Config CRUD
    $(document).off('click.scp2b-ac', '[data-action="add-config"]').on('click.scp2b-ac', '[data-action="add-config"]', function(e) { e.preventDefault(); addConfigItem($(this).data('type')); });
    $(document).off('click.scp2b-ec', '[data-action="edit-config"]').on('click.scp2b-ec', '[data-action="edit-config"]', function(e) { e.preventDefault(); editConfigItem($(this).data('type'), parseInt($(this).data('index'), 10)); });
    $(document).off('click.scp2b-dc', '[data-action="delete-config"]').on('click.scp2b-dc', '[data-action="delete-config"]', function(e) { e.preventDefault(); deleteConfigItem($(this).data('type'), parseInt($(this).data('index'), 10)); });
    // Clear action pref
    $(document).off('click.scp2b-cap', '[data-action="clear-action-pref"]').on('click.scp2b-cap', '[data-action="clear-action-pref"]', function(e) {
      e.preventDefault(); var key = $(this).data('action-key');
      if (key && S.meta.aiPreferences && S.meta.aiPreferences.perAction) { delete S.meta.aiPreferences.perAction[key]; syncToTextarea(); render(); }
    });
    // Import/export
    $(document).off('click.scp2b-exp', '[data-action="export-json"]').on('click.scp2b-exp', '[data-action="export-json"]', function(e) { e.preventDefault(); exportJSON('combined'); });
    $(document).off('click.scp2b-imp', '[data-action="import-json"]').on('click.scp2b-imp', '[data-action="import-json"]', function(e) { e.preventDefault(); importJSON(); });
    // Test AI connection
    $(document).off('click.scp2b-tac', '[data-action="test-ai-connection"]').on('click.scp2b-tac', '[data-action="test-ai-connection"]', function(e) { e.preventDefault(); testAIConnection(); });

    // --- Phase 3: Re-scan AI config ---
    $(document).off('click.scp2b-rac', '[data-action="rescan-ai-config"]').on('click.scp2b-rac', '[data-action="rescan-ai-config"]', function(e) {
      e.preventDefault();
      var $btn = $(this);
      $btn.prop('disabled', true).html(icon('spinner') + ' Scanning...');
      // Small delay so user sees the spinner
      setTimeout(function() {
        var found = LLMService.rescanConfig();
        $btn.prop('disabled', false).html(icon('refresh') + ' Re-scan Page');
        updateAIStatusIndicator();
        // Replace any loading placeholders
        $('.scp-ai-picker-loading').each(function() {
          var actionId = $(this).data('pending-action');
          if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
        });
        if (found) {
          toast('AI config found! ' + LLMService.getProviderCount() + ' provider(s) detected.', 'success');
        } else {
          toast('No AI config found on page. Check your Drupal Views setup.', 'warning');
        }
        render();
      }, 300);
    });

    // --- Phase 3: Per-provider test ---
    $(document).off('click.scp2b-tp', '[data-action="test-provider"]').on('click.scp2b-tp', '[data-action="test-provider"]', function(e) {
      e.preventDefault();
      var pid = $(this).data('provider');
      var $btn = $(this);
      $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
      // Remove previous result badges
      $btn.closest('.scp-ai-provider-card-actions').find('.scp-ai-test-result').remove();
      LLMService.testProvider(pid, function(ok, msg, elapsed) {
        $btn.prop('disabled', false).html(icon('bolt') + ' Test');
        var resultClass = ok ? 'scp-ai-test-ok' : 'scp-ai-test-fail';
        var resultIcon = ok ? 'circle-check' : 'circle-xmark';
        $btn.after('<span class="scp-ai-test-result ' + resultClass + '">' + icon(resultIcon) + ' ' + esc(msg) + '</span>');
        setTimeout(function() { $btn.closest('.scp-ai-provider-card-actions').find('.scp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 5000);
        if (ok) toast(LLMService.getProviderInfo(pid).label + ' connected (' + elapsed + 'ms)', 'success');
        else toast(LLMService.getProviderInfo(pid).label + ' failed: ' + msg, 'error');
      });
    });

    // --- Phase 3: Set default provider from card ---
    $(document).off('click.scp2b-sdp', '[data-action="set-default-provider"]').on('click.scp2b-sdp', '[data-action="set-default-provider"]', function(e) {
      e.preventDefault();
      var pid = $(this).data('provider');
      var pInfo = LLMService.getProviderInfo(pid);
      if (!pInfo || !pInfo.models.length) return;
      // Pick the first model (or the one marked default)
      var defModel = pInfo.models[0];
      for (var i = 0; i < pInfo.models.length; i++) {
        if (pInfo.models[i].is_default) { defModel = pInfo.models[i]; break; }
      }
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.appDefault = { provider: pid, model: defModel.id };
      syncToTextarea(); updateAIStatusIndicator(); render();
      toast('Default set to ' + pInfo.label + ' / ' + defModel.label, 'success');
    });

    // --- Phase 3: Clear all action overrides ---
    $(document).off('click.scp2b-caap', '[data-action="clear-all-action-prefs"]').on('click.scp2b-caap', '[data-action="clear-all-action-prefs"]', function(e) {
      e.preventDefault();
      if (!confirm('Clear all per-action AI overrides? All actions will use the default provider.')) return;
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.perAction = {};
      syncToTextarea(); render();
      toast('All overrides cleared', 'success');
    });

    // --- Phase 3: Header AI quick-switch dropdown ---
    $(document).off('click.scp2b-asi', '#scpAIStatus').on('click.scp2b-asi', '#scpAIStatus', function(e) {
      e.preventDefault(); e.stopPropagation();
      var $dropdown = $('#scpAIQuickSwitch');
      if ($dropdown.is(':visible')) { $dropdown.hide(); return; }
      // Build dropdown content
      if (!LLMService.isConfigured()) {
        S.settingsTab = 'ai'; navigate('settings'); return;
      }
      var provs = LLMService.getActiveProviders();
      var def = LLMService.getDefault();
      var ddHtml = '<div class="scp-ai-dropdown-header">' + icon('sparkles') + ' Quick Switch AI</div>';
      for (var pi = 0; pi < provs.length; pi++) {
        var prov = provs[pi];
        var pInfo = LLMService.getProviderInfo(prov.id);
        if (!pInfo) continue;
        ddHtml += '<div class="scp-ai-dropdown-provider">' + esc(pInfo.label) + '</div>';
        for (var mi = 0; mi < pInfo.models.length; mi++) {
          var model = pInfo.models[mi];
          var isActive = def && def.provider === prov.id && def.model === model.id;
          ddHtml += '<button class="scp-ai-dropdown-model' + (isActive ? ' scp-ai-dropdown-model-active' : '') + '" data-action="quick-switch-ai" data-provider="' + esc(prov.id) + '" data-model="' + esc(model.id) + '">';
          ddHtml += '<span>' + esc(model.label) + '</span>';
          if (isActive) ddHtml += icon('check');
          ddHtml += '</button>';
        }
      }
      ddHtml += '<div class="scp-ai-dropdown-footer"><a href="#" data-action="ai-dropdown-settings">' + icon('gear') + ' AI Settings</a></div>';
      $dropdown.html(ddHtml).show();
    });

    // Close dropdown on outside click
    $(document).off('click.scp2b-ddclose').on('click.scp2b-ddclose', function(e) {
      if (!$(e.target).closest('#scpAIQuickSwitch, #scpAIStatus').length) {
        $('#scpAIQuickSwitch').hide();
      }
    });

    // Quick switch model from dropdown
    $(document).off('click.scp2b-qsa', '[data-action="quick-switch-ai"]').on('click.scp2b-qsa', '[data-action="quick-switch-ai"]', function(e) {
      e.preventDefault();
      var pid = $(this).data('provider');
      var mid = $(this).data('model');
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.appDefault = { provider: pid, model: mid };
      syncToTextarea(); updateAIStatusIndicator();
      $('#scpAIQuickSwitch').hide();
      var pInfo = LLMService.getProviderInfo(pid);
      var modelLabel = mid;
      if (pInfo) { for (var i = 0; i < pInfo.models.length; i++) { if (pInfo.models[i].id === mid) { modelLabel = pInfo.models[i].label; break; } } }
      toast('Switched to ' + (pInfo ? pInfo.label : pid) + ' / ' + modelLabel, 'success');
    });

    // Dropdown settings link
    $(document).off('click.scp2b-dds', '[data-action="ai-dropdown-settings"]').on('click.scp2b-dds', '[data-action="ai-dropdown-settings"]', function(e) {
      e.preventDefault(); $('#scpAIQuickSwitch').hide(); S.settingsTab = 'ai'; navigate('settings');
    });
    // AI config link (from "not configured" message in inline pickers)
    $(document).off('click.scp2b-acl', '.scp-ai-config-link').on('click.scp2b-acl', '.scp-ai-config-link', function(e) { e.preventDefault(); S.settingsTab = 'ai'; navigate('settings'); });
    // Research mode toggle
    $(document).off('click.scp2b-rm', '[data-action="research-mode"]').on('click.scp2b-rm', '[data-action="research-mode"]', function(e) { e.preventDefault(); S._researchMode = $(this).data('mode'); render(); });
    // Run research
    $(document).off('click.scp2b-rqr', '[data-action="run-quick-research"]').on('click.scp2b-rqr', '[data-action="run-quick-research"]', function(e) { e.preventDefault(); runQuickResearch(); });
    $(document).off('click.scp2b-rar', '[data-action="run-advanced-research"]').on('click.scp2b-rar', '[data-action="run-advanced-research"]', function(e) { e.preventDefault(); runAdvancedResearch(); });
    // Promote idea from research
    $(document).off('click.scp2b-pi', '[data-action="promote-idea"]').on('click.scp2b-pi', '[data-action="promote-idea"]', function(e) { e.preventDefault(); promoteResearchIdea($(this).data('session'), $(this).data('idea')); });
    // Rate idea
    $(document).off('click.scp2b-ri', '[data-action="rate-idea"]').on('click.scp2b-ri', '[data-action="rate-idea"]', function(e) {
      e.preventDefault(); var sesId = $(this).data('session'); var ideaId = $(this).data('idea'); var rating = parseInt($(this).data('rating'), 10);
      var session = S.researchMap[sesId]; if (!session) return;
      for (var i = 0; i < (session.results || []).length; i++) { if (session.results[i].id === ideaId) { session.results[i].rating = rating; break; } }
      syncToTextarea(); render();
    });
    // Delete research session
    $(document).off('click.scp2b-drs', '[data-action="delete-research-session"]').on('click.scp2b-drs', '[data-action="delete-research-session"]', function(e) {
      e.preventDefault();
      var sesId = $(this).data('session-id');
      var session = S.researchMap[sesId]; if (!session) return;
      var ideaCount = (session.results || []).length;
      openConfirmDialog({
        title: 'Delete Research Session',
        message: 'Delete "' + (session.topic || session.title || 'Research Session') + '" with ' + ideaCount + ' idea' + (ideaCount !== 1 ? 's' : '') + '? This cannot be undone.',
        confirmLabel: 'Delete', danger: true,
        onConfirm: function() {
          S.data.research = S.data.research || { sessions: [] };
          S.data.research.sessions = S.data.research.sessions.filter(function(s) { return s.id !== sesId; });
          logActivity('research_created', '', '', 'Deleted research session: ' + (session.topic || session.title || sesId));
          snapshot('Delete research session'); buildMaps(); render(); syncToTextarea();
          toast('Research session deleted', 'success');
        }
      });
    });
    // Rename research session
    $(document).off('click.scp2b-rrs', '[data-action="rename-research-session"]').on('click.scp2b-rrs', '[data-action="rename-research-session"]', function(e) {
      e.preventDefault();
      var sesId = $(this).data('session-id');
      var session = S.researchMap[sesId]; if (!session) return;
      var currentName = session.topic || session.title || '';
      var newName = prompt('Rename session:', currentName);
      if (newName !== null && newName.trim()) {
        session.topic = newName.trim();
        session.title = newName.trim();
        session.updated = new Date().toISOString();
        snapshot('Rename research session'); syncToTextarea(); render();
        toast('Session renamed', 'success');
      }
    });
    // Advanced research template change
    $(document).off('change.scp2b-rt', '#scpResearchTemplate').on('change.scp2b-rt', '#scpResearchTemplate', function() {
      var templateId = $(this).val();
      var templates = (S.meta.settings && S.meta.settings.research_templates) || [];
      var template = templates.find(function(t) { return t.id === templateId; });
      var $vars = $('#scpTemplateVars').empty();
      if (template && template.variables) {
        template.variables.forEach(function(v) {
          $vars.append('<div class="scp-form-group"><label>' + v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ') + '</label><input type="text" class="scp-input" id="scpVar_' + v + '" placeholder="Enter ' + v + '..."></div>');
        });
      }
    });
    // Research template CRUD
    $(document).off('click.scp2b-art', '[data-action="add-research-template"]').on('click.scp2b-art', '[data-action="add-research-template"]', function(e) {
      e.preventDefault();
      var fields = '<div class="scp-editor-form"><div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name"></div>';
      fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description"></div>';
      fields += '<div class="scp-form-group"><label>Prompt Template</label><textarea class="scp-textarea" data-field="prompt" rows="6" placeholder="Use {variable_name} for template variables..."></textarea></div>';
      fields += '<div class="scp-form-group"><label>Variables (comma-separated)</label><input type="text" class="scp-input" data-field="variables" placeholder="topic, count, audience, tone"></div></div>';
      openModal('New Research Template', fields, { size: 'lg', onSave: function() {
        var d = collectModalFields(); if (!d.name) { toast('Name required', 'warning'); return; }
        var tmpl = { id: generateId('rt'), name: d.name.trim(), description: d.description || '', prompt: d.prompt || '', variables: (d.variables || '').split(',').map(function(v) { return v.trim(); }).filter(Boolean) };
        S.meta.settings.research_templates = S.meta.settings.research_templates || [];
        S.meta.settings.research_templates.push(tmpl);
        snapshot('Add template'); closeModal(); render(); syncToTextarea(); toast('Template created', 'success');
      }});
    });
    $(document).off('click.scp2b-drt', '[data-action="delete-research-template"]').on('click.scp2b-drt', '[data-action="delete-research-template"]', function(e) {
      e.preventDefault(); var idx = parseInt($(this).data('index'), 10);
      var templates = S.meta.settings.research_templates || [];
      if (templates[idx]) {
        openConfirmDialog({ title: 'Delete Template', message: 'Delete "' + templates[idx].name + '"?', confirmLabel: 'Delete', danger: true,
          onConfirm: function() { templates.splice(idx, 1); snapshot('Delete template'); render(); syncToTextarea(); toast('Deleted', 'success'); }
        });
      }
    });
    // --- Brand design events ---
    $(document).off('input.scp2b-bdc', '.scp-brand-design-color').on('input.scp2b-bdc', '.scp-brand-design-color', function() {
      var path = $(this).data('bd-path'); var val = $(this).val();
      // Sync color picker â†’ text input
      $(this).siblings('.scp-brand-design-field[data-bd-path="' + path + '"]').val(val);
    });
    $(document).off('blur.scp2b-bdf', 'input.scp-brand-design-field[data-bd-path*="colors."]').on('blur.scp2b-bdf', 'input.scp-brand-design-field[data-bd-path*="colors."]', function() {
      var path = $(this).data('bd-path'); var val = $(this).val();
      // Sync text input â†’ color picker (if valid hex)
      if (/^#[0-9a-fA-F]{6}$/.test(val)) $(this).siblings('.scp-brand-design-color[data-bd-path="' + path + '"]').val(val);
    });
    $(document).off('click.scp2b-abr', '[data-action="add-brand-ref"]').on('click.scp2b-abr', '[data-action="add-brand-ref"]', function(e) {
      e.preventDefault(); var role = $(this).data('role');
      var currentIds = (S.meta.settings.brand_design && S.meta.settings.brand_design.reference_image_ids && S.meta.settings.brand_design.reference_image_ids[role]) || [];
      openImagePickerModal({ mode: 'multi', selectedIds: currentIds }, function(selected) {
        S.meta.settings.brand_design = S.meta.settings.brand_design || {};
        S.meta.settings.brand_design.reference_image_ids = S.meta.settings.brand_design.reference_image_ids || {};
        S.meta.settings.brand_design.reference_image_ids[role] = selected;
        syncToTextarea(); render();
      });
    });
    $(document).off('click.scp2b-rbr', '[data-action="remove-brand-ref"]').on('click.scp2b-rbr', '[data-action="remove-brand-ref"]', function(e) {
      e.preventDefault(); var role = $(this).data('role'); var fid = $(this).data('fid');
      if (S.meta.settings.brand_design && S.meta.settings.brand_design.reference_image_ids && S.meta.settings.brand_design.reference_image_ids[role]) {
        S.meta.settings.brand_design.reference_image_ids[role] = S.meta.settings.brand_design.reference_image_ids[role].filter(function(id) { return id !== fid; });
        syncToTextarea(); render();
      }
    });
    $(document).off('click.scp2b-rgp', '[data-action="regenerate-brand-prefix"]').on('click.scp2b-rgp', '[data-action="regenerate-brand-prefix"]', function(e) {
      e.preventDefault();
      // Save current fields first
      saveAllSettings();
      var bd = S.meta.settings.brand_design || {};
      bd.brand_prompt_prefix = ''; // Clear custom to force auto-generate
      S.meta.settings.brand_design = bd;
      syncToTextarea(); render(); toast('Brand prefix regenerated from fields', 'success');
    });
    // --- Image gallery events ---
    $(document).off('click.scp2b-ui', '[data-action="upload-image"]').on('click.scp2b-ui', '[data-action="upload-image"]', function(e) { e.preventDefault(); triggerImageUpload(); });
    $(document).off('click.scp2b-si', '[data-action="select-image"]').on('click.scp2b-si', '[data-action="select-image"]', function(e) {
      e.preventDefault(); var fid = $(this).data('fid');
      S.selectedImageId = (S.selectedImageId === fid) ? null : fid; render();
    });
    $(document).off('click.scp2b-cid', '[data-action="close-image-detail"]').on('click.scp2b-cid', '[data-action="close-image-detail"]', function(e) {
      if ($(e.target).hasClass('scp-img-detail-backdrop') || $(e.target).closest('[data-action="close-image-detail"]').is('.scp-btn-icon')) { S.selectedImageId = null; render(); }
    });
    $(document).off('click.scp2b-tis', '[data-action="toggle-image-star"]').on('click.scp2b-tis', '[data-action="toggle-image-star"]', function(e) {
      e.preventDefault(); e.stopPropagation(); toggleImageStar($(this).data('fid')); render();
    });
    $(document).off('blur.scp2b-imf', '.scp-img-meta-field').on('blur.scp2b-imf', '.scp-img-meta-field', function() {
      var fid = $(this).data('fid'); var field = $(this).data('field'); var val = $(this).val();
      if (fid && field) saveImageMeta(fid, field, val);
    });
    $(document).off('change.scp2b-imfc', 'select.scp-img-meta-field').on('change.scp2b-imfc', 'select.scp-img-meta-field', function() {
      var fid = $(this).data('fid'); var field = $(this).data('field'); var val = $(this).val();
      if (fid && field) { saveImageMeta(fid, field, val); render(); }
    });
    $(document).off('click.scp2b-dim', '[data-action="delete-image-meta"]').on('click.scp2b-dim', '[data-action="delete-image-meta"]', function(e) { e.preventDefault(); deleteImageMeta($(this).data('fid')); });
    $(document).off('click.scp2b-ciu', '[data-action="copy-image-url"]').on('click.scp2b-ciu', '[data-action="copy-image-url"]', function(e) {
      e.preventDefault(); navigator.clipboard.writeText($(this).data('url')).then(function() { toast('URL copied!', 'success'); });
    });
    $(document).off('click.scp2b-ivm', '[data-action="image-view-mode"]').on('click.scp2b-ivm', '[data-action="image-view-mode"]', function(e) {
      e.preventDefault(); S.imageViewMode = $(this).data('mode'); render();
    });
    $(document).off('click.scp2b-tisf', '[data-action="toggle-img-star-filter"]').on('click.scp2b-tisf', '[data-action="toggle-img-star-filter"]', function(e) {
      e.preventDefault(); S.imageFilter.star = !S.imageFilter.star; render();
    });
    $(document).off('change.scp2b-imgf', '.scp-img-filter').on('change.scp2b-imgf', '.scp-img-filter', function() {
      var filter = $(this).data('filter'); S.imageFilter[filter] = $(this).val(); render();
    });
    $(document).off('input.scp2b-imgs', '.scp-img-search').on('input.scp2b-imgs', '.scp-img-search', window._scpDebounce(function() {
      S.imageFilter.search = $(this).val(); render();
    }, 300));
  }

  function setupResearchEvents() {
    // Template variable loading on first render
    setTimeout(function() { $('#scpResearchTemplate').trigger('change'); }, 100);
  }
  function setupSettingsEvents() { /* Handled by global events */ }

  function setupKeyboardShortcuts() {
    $(document).off('keydown.scp2b-sk').on('keydown.scp2b-sk', function(e) {
      if ($(e.target).is('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === '1') navigate('dashboard');
      if (e.key === '2') navigate('research');
      if (e.key === '3') navigate('posts');
      if (e.key === '4') navigate('calendar');
      if (e.key === '5') navigate('images');
      if (e.key === '6') navigate('tags');
      if (e.key === '7') navigate('activity');
      if (e.key === '8') navigate('settings');
      if (e.key === '/' && S.currentView === 'posts') { e.preventDefault(); $('#scpPostSearch').focus(); }
    });
  }

  // ============================================================
  // SECTION 15: API EXPORTS
  // ============================================================

  // Expose updateAIStatusIndicator so the extracted llm-service.js can
  // call it without reaching into part2b's IIFE closure.
  window._scpUpdateAIStatusIndicator = updateAIStatusIndicator;

  window._scpPart2B = {
    // AI actions (called by Part 2A delegates)
    aiResearchAngles: aiResearchAngles,
    aiResearchHooks: aiResearchHooks,
    aiWriteContent: aiWriteContent,
    aiImproveContent: aiImproveContent,
    aiSuggestSlides: aiSuggestSlides,
    aiGenerateScript: aiGenerateScript,
    aiGenerateMediaPrompt: aiGenerateMediaPrompt,
    buildStructuredPrompt: buildStructuredPrompt,
    aiAdaptForPlatform: aiAdaptForPlatform,
    // Phase B: Visual plan + structured script
    aiGenerateVisualPlan: aiGenerateVisualPlan,
    aiGenerateStructuredScript: aiGenerateStructuredScript,
    // Services
    LLMService: LLMService,
    BrandService: BrandService,
    renderInlinePicker: LLMService.renderInlinePicker.bind(LLMService),
    isAIConfigured: LLMService.isConfigured.bind(LLMService),
    // Research
    runQuickResearch: runQuickResearch,
    runAdvancedResearch: runAdvancedResearch,
    // Settings & data
    saveAllSettings: saveAllSettings,
    exportJSON: exportJSON,
    importJSON: importJSON,
    // AI status
    updateAIStatusIndicator: updateAIStatusIndicator,
    testAIConnection: testAIConnection,
    // LLMService Phase 3
    rescanAIConfig: function() { return LLMService.rescanConfig(); },
    testProvider: function(pid, cb) { LLMService.testProvider(pid, cb); },
    // Images
    renderImagePicker: renderImagePicker,
    openImagePickerModal: openImagePickerModal,
    saveImageMeta: saveImageMeta,
    toggleImageStar: toggleImageStar,
    recordImageUsage: recordImageUsage,
    triggerImageUpload: triggerImageUpload
  };

  console.log('[SCP] Part 2B loaded');
})(jQuery, Drupal);
