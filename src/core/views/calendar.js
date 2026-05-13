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

    // ─── Header: Title + Mode toggle + Navigation ───
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
      html += '<span class="scp-cal-title">' + formatDateShort(ws.toISOString()) + ' – ' + formatDateShort(we.toISOString()) + '</span>';
    }
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="cal-next">' + icon('chevron-right') + '</button>';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="cal-today">Today</button>';
    html += '</div></div>';

    // ─── Filter bar ───
    html += renderCalendarFilters();

    // ─── Month or Week view ───
    if (mode === 'month') {
      html += renderMonthGrid(year, month, dayNames, postsByDate, now);
    } else {
      html += renderWeekGrid(year, month, dayNamesFull, postsByDate, now);
    }

    // ─── Popover (rendered if active) ───
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
