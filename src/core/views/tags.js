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
