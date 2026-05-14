/**
 * @category    core
 * @purpose     Series view. List (grid of series cards with post + topic
 *              counts) and detail view (stats, topics, and posts list)
 *              with a one-click bulk-promote action that advances every
 *              status='idea' post in the series to 'drafting' — the
 *              primary way to graduate wizard-seeded posts.
 * @exports     window._scpRenderSeriesView
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpTruncate, window._scpGetAllSeries,
 *              window._scpGetSeriesPosts, window._scpResolveTopic,
 *              window._scpBadge, window._scpRenderStatCard,
 *              window._scpRenderPostListItem, window._scpConstants
 */
(function($) {
  'use strict';

  var S, esc, icon, truncate, getAllSeries, getSeriesPosts, resolveTopic, badge;
  var renderStatCard, renderPostListItem, Constants, ACTIVE_STATUSES;

  function _resolveHelpers() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    truncate = window._scpTruncate;
    getAllSeries = window._scpGetAllSeries;
    getSeriesPosts = window._scpGetSeriesPosts;
    resolveTopic = window._scpResolveTopic;
    badge = window._scpBadge;
    renderStatCard = window._scpRenderStatCard;
    renderPostListItem = window._scpRenderPostListItem;
    Constants = window._scpConstants;
    ACTIVE_STATUSES = Constants.ACTIVE_STATUSES;
  }

  function renderSeriesView() {
    _resolveHelpers();
    if (S.selectedSeriesId && S.seriesMap[S.selectedSeriesId]) {
      return renderSeriesDetail(S.seriesMap[S.selectedSeriesId]);
    }
    return renderSeriesList();
  }

  function renderSeriesList() {
    var seriesList = getAllSeries();
    var html = '<div class="scp-view scp-view-series">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon('layer-group') + ' Series</h1>';
    html += '<span class="scp-view-subtitle">' + seriesList.length + ' series</span></div>';
    html += '<div class="scp-view-header-right"><button class="scp-btn scp-btn-primary" data-action="new-series">' + icon('plus') + ' New Series</button></div></div>';

    if (seriesList.length === 0) {
      html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('layer-group') + '</div>';
      html += '<div class="scp-empty-state-title">No series yet</div>';
      html += '<div class="scp-empty-state-text">Series are multi-post arcs that bundle related topics. Use them to plan a sequence around a launch, a campaign, or an evergreen theme.</div>';
      html += '<button class="scp-btn scp-btn-primary" data-action="new-series">' + icon('plus') + ' Create Series</button></div>';
    } else {
      html += '<div class="scp-card-grid">';
      for (var i = 0; i < seriesList.length; i++) html += renderSeriesCard(seriesList[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderSeriesCard(ser) {
    var posts = getSeriesPosts(ser.id);
    var topicCount = (ser.topicIds || []).length;
    var publishedCount = posts.filter(function(p) { return p.status === 'published'; }).length;
    var ideaCount = posts.filter(function(p) { return p.status === 'idea'; }).length;
    var color = ser.color || '#1a73e8';

    var html = '<div class="scp-topic-card scp-series-card" data-action="select-series" data-id="' + esc(ser.id) + '">';
    html += '<div class="scp-topic-card-header">';
    html += '<div class="scp-topic-card-color" style="background:' + color + '"></div>';
    html += '<div class="scp-topic-card-info"><h3>' + esc(ser.name) + '</h3>';
    if (ser.description) html += '<p>' + esc(truncate(ser.description, 70)) + '</p>';
    html += '</div>';
    html += '<div class="scp-topic-card-count" style="color:' + color + '">' + posts.length + '</div>';
    html += '</div>';
    html += '<div class="scp-topic-card-badges">';
    if (topicCount > 0) html += badge(topicCount + ' topic' + (topicCount === 1 ? '' : 's'), '#1a73e8');
    if (ideaCount > 0) html += badge(ideaCount + ' idea' + (ideaCount === 1 ? '' : 's'), '#9aa0a6');
    if (publishedCount > 0) html += badge(publishedCount + ' published', '#059669');
    html += '</div></div>';
    return html;
  }

  function renderSeriesDetail(ser) {
    var posts = getSeriesPosts(ser.id);
    var ideaPosts = posts.filter(function(p) { return p.status === 'idea'; });
    var activeCount = posts.filter(function(p) { return ACTIVE_STATUSES.indexOf(p.status) > -1; }).length;
    var publishedCount = posts.filter(function(p) { return p.status === 'published'; }).length;
    var scheduledCount = posts.filter(function(p) { return p.status === 'scheduled'; }).length;
    var color = ser.color || '#1a73e8';

    var html = '<div class="scp-view scp-view-series-detail">';
    html += '<div class="scp-view-header"><div class="scp-view-header-left">';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="back-to-series">' + icon('arrow-left') + ' Series</button>';
    html += '<span class="scp-topic-detail-dot" style="background:' + color + '"></span>';
    html += '<h1>' + esc(ser.name) + '</h1></div>';
    html += '<div class="scp-view-header-right">';
    if (ideaPosts.length > 0) {
      html += '<button class="scp-btn scp-btn-primary scp-btn-sm" data-action="promote-series-ideas" data-id="' + esc(ser.id) + '">' + icon('arrow-right') + ' Start drafting (' + ideaPosts.length + ')</button>';
    }
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="edit-series" data-id="' + esc(ser.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-series" data-id="' + esc(ser.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (ser.description) html += '<p class="scp-topic-detail-desc">' + esc(ser.description) + '</p>';

    // Stats
    html += '<div class="scp-dash-stats">';
    html += renderStatCard('Total Posts', posts.length, '', color);
    html += renderStatCard('Active', activeCount, 'In pipeline', '#1a73e8');
    html += renderStatCard('Published', publishedCount, '', '#059669');
    html += renderStatCard('Scheduled', scheduledCount, '', '#0d9488');
    html += '</div>';

    // Topics in this series
    var topicIds = ser.topicIds || [];
    if (topicIds.length > 0) {
      html += '<div class="scp-section"><div class="scp-section-header"><h2>Topics</h2></div>';
      html += '<div class="scp-topic-cloud">';
      for (var i = 0; i < topicIds.length; i++) {
        var topic = resolveTopic(topicIds[i]);
        if (!topic) continue;
        html += '<span class="scp-topic-chip" style="background:' + topic.color + '15;color:' + topic.color + ';border-color:' + topic.color + '30" data-action="select-topic-nav" data-id="' + esc(topic.id) + '">' +
          esc(topic.name) + '</span>';
      }
      html += '</div></div>';
    }

    // Posts list
    html += '<div class="scp-section"><div class="scp-section-header"><h2>Posts</h2></div>';
    if (posts.length === 0) {
      html += '<div class="scp-empty-state scp-empty-state--compact"><p>No posts in this series yet.</p></div>';
    } else {
      for (var pi = 0; pi < posts.length; pi++) html += renderPostListItem(posts[pi]);
    }
    html += '</div></div>';
    return html;
  }

  window._scpRenderSeriesView = renderSeriesView;
})(jQuery);
