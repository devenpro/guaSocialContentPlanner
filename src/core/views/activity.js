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
