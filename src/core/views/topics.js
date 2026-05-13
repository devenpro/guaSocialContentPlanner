/**
 * @category    core
 * @purpose     Topics view. List (grid of topic cards with counts) and detail
 *              view (stats + post list filtered by topic). Reuses the
 *              renderStatCard and renderPostListItem primitives exposed by
 *              dashboard.js / posts.js.
 * @exports     window._scpRenderTopicsView
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpGetAllTopics, window._scpGetTopicPosts,
 *              window._scpBadge, window._scpRenderStatCard,
 *              window._scpRenderPostListItem, window._scpConstants
 * @extracted-from  src/core/scp-part1.js (was SECTION 11 of v0.1.6)
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, getAllTopics, getTopicPosts, badge;
  var renderStatCard, renderPostListItem, Constants;
  var ACTIVE_STATUSES;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    truncate = window._scpTruncate;
    getAllTopics = window._scpGetAllTopics;
    getTopicPosts = window._scpGetTopicPosts;
    badge = window._scpBadge;
    renderStatCard = window._scpRenderStatCard;
    renderPostListItem = window._scpRenderPostListItem;
    Constants = window._scpConstants;
    ACTIVE_STATUSES = Constants.ACTIVE_STATUSES;
  }

  // ============================================================
  // SECTION 11: TOPICS VIEW
  // ============================================================

  function renderTopicsView() {
    _resolveHelpers();
    if (S.selectedTopicId && S.topicMap[S.selectedTopicId]) {
      return renderTopicDetailView(S.topicMap[S.selectedTopicId]);
    }
    return renderTopicListView();
  }

  function renderTopicListView() {
    var topics = getAllTopics();
    var html = '<div class="scp-view scp-view-topics">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('tags') + ' Topics</h1>';
    html += '<span class="scp-view-subtitle">' + topics.length + ' topics</span></div>';
    html += '<div class="scp-view-header-right"><button class="scp-btn scp-btn-primary" data-action="new-topic">' + icon('plus') + ' New Topic</button></div></div>';

    if (topics.length === 0) {
      html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('tags') + '</div>';
      html += '<div class="scp-empty-state-title">No topics yet</div>';
      html += '<div class="scp-empty-state-text">Create topics to organize your posts into themes and content pillars.</div>';
      html += '<button class="scp-btn scp-btn-primary" data-action="new-topic">' + icon('plus') + ' Create Topic</button></div>';
    } else {
      html += '<div class="scp-card-grid">';
      for (var i = 0; i < topics.length; i++) html += renderTopicCard(topics[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderTopicCard(topic) {
    var postCount = (S.topicIndex[topic.id] || []).length;
    var topicPosts = getTopicPosts(topic.id);
    var publishedCount = topicPosts.filter(function(p) { return p.status === 'published'; }).length;
    var activeCount = topicPosts.filter(function(p) { return ACTIVE_STATUSES.indexOf(p.status) > -1; }).length;

    var html = '<div class="scp-topic-card" data-action="select-topic" data-id="' + esc(topic.id) + '">';
    html += '<div class="scp-topic-card-header">';
    html += '<div class="scp-topic-card-color" style="background:' + topic.color + '"></div>';
    html += '<div class="scp-topic-card-info"><h3>' + esc(topic.name) + '</h3>';
    if (topic.description) html += '<p>' + esc(truncate(topic.description, 60)) + '</p>';
    html += '</div>';
    html += '<div class="scp-topic-card-count" style="color:' + topic.color + '">' + postCount + '</div>';
    html += '</div>';
    html += '<div class="scp-topic-card-badges">';
    if (activeCount > 0) html += badge(activeCount + ' active', '#1a73e8');
    if (publishedCount > 0) html += badge(publishedCount + ' published', '#059669');
    html += '</div></div>';
    return html;
  }

  function renderTopicDetailView(topic) {
    var topicPosts = getTopicPosts(topic.id);
    var publishedCount = topicPosts.filter(function(p) { return p.status === 'published'; }).length;
    var activeCount = topicPosts.filter(function(p) { return ACTIVE_STATUSES.indexOf(p.status) > -1; }).length;
    var scheduledCount = topicPosts.filter(function(p) { return p.status === 'scheduled'; }).length;

    var html = '<div class="scp-view scp-view-topic-detail">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="back-to-topics">' + icon('arrow-left') + ' Topics</button>';
    html += '<span class="scp-topic-detail-dot" style="background:' + topic.color + '"></span>';
    html += '<h1>' + esc(topic.name) + '</h1></div>';
    html += '<div class="scp-view-header-right">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="edit-topic" data-id="' + esc(topic.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-topic" data-id="' + esc(topic.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (topic.description) html += '<p class="scp-topic-detail-desc">' + esc(topic.description) + '</p>';

    // Stats
    html += '<div class="scp-dash-stats">';
    html += renderStatCard('Total Posts', topicPosts.length, '', topic.color);
    html += renderStatCard('Active', activeCount, 'In pipeline', '#1a73e8');
    html += renderStatCard('Published', publishedCount, '', '#059669');
    html += renderStatCard('Scheduled', scheduledCount, '', '#0d9488');
    html += '</div>';

    // Posts list
    html += '<div class="scp-section"><div class="scp-section-header"><h2>Posts</h2></div>';
    if (topicPosts.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No posts in this topic yet.</p></div>';
    } else {
      for (var i = 0; i < topicPosts.length; i++) html += renderPostListItem(topicPosts[i]);
    }
    html += '</div></div>';
    return html;
  }

  window._scpRenderTopicsView = renderTopicsView;

})(jQuery);
