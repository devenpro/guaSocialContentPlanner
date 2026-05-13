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
    // Step content — Part 2A overrides via renderer registry
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
