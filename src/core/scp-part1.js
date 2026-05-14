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
 * 11. Topics view (list + detail)
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
    'dashboard': { order: 1, label: 'Dashboard',  icon: 'chart-pie',          group: 'overview', description: 'Overview & pipeline' },
    'research':  { order: 2, label: 'Research',   icon: 'flask',              group: 'strategy', description: 'AI-powered ideation' },
    'topics':    { order: 3, label: 'Topics',     icon: 'tags',               group: 'strategy', description: 'Themes & content pillars' },
    'series':    { order: 4, label: 'Series',     icon: 'layer-group',        group: 'strategy', description: 'Multi-post content arcs' },
    'posts':     { order: 5, label: 'Posts',      icon: 'thumbtack',          group: 'work',     description: 'Content pipeline' },
    'calendar':  { order: 6, label: 'Calendar',   icon: 'calendar',           group: 'work',     description: 'Schedule view' },
    'images':    { order: 7, label: 'Images',     icon: 'images',             group: 'work',     description: 'Reference image library' },
    'activity':  { order: 8, label: 'Activity',   icon: 'clock-rotate-left',  group: 'system',   description: 'Full activity log' },
    'settings':  { order: 9, label: 'Settings',   icon: 'gear',               group: 'system',   description: 'Workspace configuration' }
  };

  // Sidebar groupings. Keys must match APP_VIEWS[*].group values.
  var SIDEBAR_GROUPS = [
    { key: 'overview', label: 'Overview' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'work',     label: 'Work' },
    { key: 'system',   label: 'System' }
  ];

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
    { key: 'topic',    label: 'Topic' },
    { key: 'series',   label: 'Series' },
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
    'topic_created':           { icon: 'tag',         color: '#0d904f' },
    'topic_updated':           { icon: 'tag',         color: '#1a73e8' },
    'topic_deleted':           { icon: 'trash',       color: '#d93025' },
    'series_created':          { icon: 'layer-group', color: '#0d904f' },
    'series_updated':          { icon: 'layer-group', color: '#1a73e8' },
    'series_deleted':          { icon: 'trash',       color: '#d93025' },
    'setup_completed':         { icon: 'circle-check', color: '#0d904f' },
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
    data: { posts: [], research: { sessions: [] }, topics: [], series: [] },
    meta: { workspace: {}, settings: {}, aiPreferences: {}, setup: { firstRun: true, completedAt: '', version: 1 } },
    activity: [],
    user: { id: '', name: '', email: '', fullName: '', timezone: '', roles: '' },
    brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },
    // Lookup maps
    postMap: {}, topicMap: {}, seriesMap: {}, researchMap: {}, toneMap: {}, audienceMap: {}, imageStyleMap: {},
    // Aggregated counts
    statusCounts: {}, typeCounts: {}, platformCounts: {}, topicIndex: {}, seriesIndex: {},
    totalPosts: 0, activePosts: 0, publishedPosts: 0,
    // UI state
    currentView: 'dashboard', previousView: null,
    selectedPostId: null, currentStep: 'basics',
    cardDensity: 'normal', settingsTab: 'workspace',
    // Posts view state
    postGroupBy: 'workflow',
    postFilter: { search: '', statuses: [], type: '', platform: '', topic: '', series: '', priority: '', sortBy: 'updated', sortDir: 'desc' },
    collapsedGroups: {},
    // Activity view state
    activityFilter: { search: '', type: '' },
    // Topics view state
    selectedTopicId: null,
    // Series view state
    selectedSeriesId: null,
    // Images view state
    images: [], imageMap: {}, $imageField: null,
    selectedImageId: null,
    imageFilter: { search: '', category: '', style: '', tag: '', star: false, sort: 'newest' },
    imageViewMode: 'grid',
    // Calendar state
    calendarYear: null, calendarMonth: null,
    calendarMode: 'month', // 'month' or 'week'
    calendarWeekStart: null, // Date object for week view start
    calendarFilters: { platforms: [], types: [], status: '', topic: '', series: '' },
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
    console.log('[SCP] Part 1 initialized — ' + S.totalPosts + ' posts, ' + (S.data.topics || []).length + ' topics, ' + (S.data.series || []).length + ' series, user: ' + (S.user.name || 'unknown'));

    // Timeout: if Part 2B hasn't loaded in 8 seconds, re-render with helpful messages
    setTimeout(function() {
      var R = window._scpRenderers || {};
      if (!R.researchView || !R.settingsView || !R.imagesView) {
        console.warn('[SCP] Part 2B not loaded after 8s — updating placeholders');
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

    // Deduplication tracking — prevents same image appearing 2-3x
    var _seenUrls = {};
    var _seenFids = {};
    var _imgIdx = 0;

    // Scan Drupal image widget elements — use ONLY .image-widget to avoid
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

      // Extract file ID — try data-fid, input name parsing, or fallback to index
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
    d.topics = d.topics || [];
    d.series = d.series || [];
    // Ensure each topic has a seriesId slot for future grouping
    for (var topicI = 0; topicI < d.topics.length; topicI++) {
      if (typeof d.topics[topicI].seriesId === 'undefined') d.topics[topicI].seriesId = '';
    }
    // Ensure each post has all required sub-objects
    for (var i = 0; i < d.posts.length; i++) {
      var p = d.posts[i];
      p.topics = p.topics || [];
      p.seriesId = p.seriesId || '';
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
    // Setup wizard fields — backfilled for older workspaces.
    if (typeof m.workspace.niche === 'undefined') m.workspace.niche = '';
    if (typeof m.workspace.audience_description === 'undefined') m.workspace.audience_description = '';
    if (typeof m.workspace.primary_platform === 'undefined') m.workspace.primary_platform = '';
    if (typeof m.workspace.posting_frequency === 'undefined') m.workspace.posting_frequency = '';
    m.settings = m.settings || {};
    m.settings.timezone = m.settings.timezone || 'Asia/Kolkata';
    m.settings.card_density = m.settings.card_density || 'normal';
    m.settings.default_view = m.settings.default_view || 'dashboard';
    m.settings.platforms = m.settings.platforms || {};
    if (!m.settings.platforms.linkedin)  m.settings.platforms.linkedin  = { enabled: true,  handle: '', char_limit: 3000,  hashtag_limit: 5,  best_times: [], notes: '' };
    if (!m.settings.platforms.instagram) m.settings.platforms.instagram = { enabled: true,  handle: '', char_limit: 2200,  hashtag_limit: 30, best_times: [], notes: '' };
    if (!m.settings.platforms.facebook)  m.settings.platforms.facebook  = { enabled: true,  handle: '', char_limit: 63206, hashtag_limit: 10, best_times: [], notes: '' };
    if (!m.settings.platforms.youtube)   m.settings.platforms.youtube   = { enabled: true,  handle: '', title_limit: 100,  description_limit: 5000, tag_limit: 500, notes: '' };
    m.settings.defaults = m.settings.defaults || { type: 'image', platforms: ['linkedin'], tone_id: '', audience_id: '', priority: 'medium', topics: [] };
    m.settings.tones = m.settings.tones || getDefaultTones();
    m.settings.audiences = m.settings.audiences || getDefaultAudiences();
    m.settings.image_styles = m.settings.image_styles || getDefaultImageStyles();
    m.settings.media_prompt_templates = m.settings.media_prompt_templates || getDefaultMediaPromptTemplates();
    m.settings.research_templates = m.settings.research_templates || getDefaultResearchTemplates();
    m.aiPreferences = m.aiPreferences || {};
    m.aiPreferences.perAction = m.aiPreferences.perAction || {};
    m.aiPreferences.lastProvider = m.aiPreferences.lastProvider || '';
    m.aiPreferences.lastModel = m.aiPreferences.lastModel || '';
    // Setup wizard state
    m.setup = m.setup || { firstRun: true, completedAt: '', version: 1 };
    if (typeof m.setup.firstRun !== 'boolean') m.setup.firstRun = true;
    m.setup.completedAt = m.setup.completedAt || '';
    m.setup.version = m.setup.version || 1;
    // Reference image metadata
    m.reference_images = m.reference_images || {};
    m.image_categories = m.image_categories || getDefaultImageCategories();
    // Brand design guide
    m.settings.brand_design = m.settings.brand_design || getDefaultBrandDesign();
    S.cardDensity = m.settings.card_density;
    S.currentView = readHash();
  }

  function getDefaultData() { return { posts: [], research: { sessions: [] }, topics: [], series: [] }; }

  function getDefaultMeta() {
    return {
      workspace: { name: '', description: '', niche: '', audience_description: '', primary_platform: '', posting_frequency: '', created: new Date().toISOString() },
      settings: {
        timezone: 'Asia/Kolkata', card_density: 'normal', default_view: 'dashboard',
        platforms: {
          linkedin:  { enabled: true,  handle: '', char_limit: 3000,  hashtag_limit: 5,  best_times: ['09:00', '12:00', '17:00'], notes: '' },
          instagram: { enabled: true,  handle: '', char_limit: 2200,  hashtag_limit: 30, best_times: ['11:00', '14:00', '19:00'], notes: '' },
          facebook:  { enabled: true,  handle: '', char_limit: 63206, hashtag_limit: 10, best_times: ['09:00', '13:00', '16:00'], notes: '' },
          youtube:   { enabled: true,  handle: '', title_limit: 100,  description_limit: 5000, tag_limit: 500, notes: '' }
        },
        defaults: { type: 'image', platforms: ['linkedin'], tone_id: '', audience_id: '', priority: 'medium', topics: [] },
        tones: getDefaultTones(), audiences: getDefaultAudiences(), image_styles: getDefaultImageStyles(),
        media_prompt_templates: getDefaultMediaPromptTemplates(), research_templates: getDefaultResearchTemplates(),
        brand_design: getDefaultBrandDesign()
      },
      aiPreferences: { appDefault: {}, perAction: {}, lastProvider: '', lastModel: '' },
      reference_images: {},
      image_categories: getDefaultImageCategories(),
      setup: { firstRun: true, completedAt: '', version: 1 }
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
    S.postMap = {}; S.statusCounts = {}; S.typeCounts = {}; S.platformCounts = {}; S.topicIndex = {}; S.seriesIndex = {};
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
      // Topic index
      var pTopics = p.topics || [];
      for (var ti = 0; ti < pTopics.length; ti++) {
        S.topicIndex[pTopics[ti]] = S.topicIndex[pTopics[ti]] || [];
        S.topicIndex[pTopics[ti]].push(p.id);
      }
      // Series index
      if (p.seriesId) {
        S.seriesIndex[p.seriesId] = S.seriesIndex[p.seriesId] || [];
        S.seriesIndex[p.seriesId].push(p.id);
      }
    }

    // Topics
    S.topicMap = {};
    var topics = S.data.topics || [];
    for (var tgi = 0; tgi < topics.length; tgi++) S.topicMap[topics[tgi].id] = topics[tgi];

    // Series
    S.seriesMap = {};
    var seriesList = S.data.series || [];
    for (var sri = 0; sri < seriesList.length; sri++) S.seriesMap[seriesList[sri].id] = seriesList[sri];

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
  function truncate(text, max) { if (!text || text.length <= max) return text || ''; return text.substring(0, max) + '…'; }
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
    // Fix double-escaped newlines: \\n → \n (common when JSON-in-JSON)
    cleaned = cleaned.replace(/\\\\n/g, '\n');
    // Fix literal \n that should be real newlines (from JSON string values)
    cleaned = cleaned.replace(/\\n/g, '\n');
    // Fix literal \t → real tabs
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
    // Basic markdown: **bold** → <strong>
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Basic markdown: *italic* → <em>
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
  function getAllTopics() { return (S.data.topics || []).slice().sort(function(a, b) { return a.name.localeCompare(b.name); }); }
  function getTopicPosts(topicId) { return (S.data.posts || []).filter(function(p) { return (p.topics || []).indexOf(topicId) > -1; }); }
  function getAllSeries() { return (S.data.series || []).slice().sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); }); }
  function getSeriesPosts(seriesId) { return (S.data.posts || []).filter(function(p) { return p.seriesId === seriesId; }); }
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
        return bDate.localeCompare(aDate); // Descending — newest first
      }).slice(0, n || 5);
  }
  function getRecentActivity(n) { return (S.activity || []).slice(-(n || 15)).reverse(); }
  function resolveTone(id) { return S.toneMap[id] || null; }
  function resolveAudience(id) { return S.audienceMap[id] || null; }
  function resolveImageStyle(id) { return S.imageStyleMap[id] || null; }
  function getPlatformConfig(key) { return (S.meta.settings && S.meta.settings.platforms && S.meta.settings.platforms[key]) || {}; }
  function resolveTopic(id) { return S.topicMap[id] || null; }
  function resolveSeries(id) { return S.seriesMap[id] || null; }

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
    html += '<span class="scp-ai-status-indicator" id="scpAIStatus" title="AI status — loading..."><span class="scp-ai-status-dot scp-ai-status-loading"></span><span class="scp-ai-status-label">AI</span></span>';
    html += '<div class="scp-ai-quick-switch" id="scpAIQuickSwitch" style="display:none"></div>';
    html += '<button class="scp-btn scp-btn-primary scp-btn-sm" id="scpSaveNodeBtn">' + icon('check') + ' Save</button>';
    if (S.user.fullName) html += '<span class="scp-header-user">' + icon('user') + ' ' + esc(S.user.fullName) + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderSidebar() {
    var html = '<div class="scp-sidebar" id="scpSidebar"><div class="scp-sidebar-overlay"></div><div class="scp-sidebar-inner"><nav class="scp-nav">';

    // Bucket views by group, preserving APP_VIEWS insertion order within
    // each bucket.
    var byGroup = {};
    for (var key in APP_VIEWS) {
      var v = APP_VIEWS[key];
      var g = v.group || 'overview';
      (byGroup[g] = byGroup[g] || []).push(key);
    }

    for (var gi = 0; gi < SIDEBAR_GROUPS.length; gi++) {
      var grp = SIDEBAR_GROUPS[gi];
      var keys = byGroup[grp.key] || [];
      if (keys.length === 0) continue;
      html += '<div class="scp-nav-group">';
      html += '<div class="scp-nav-group-label">' + esc(grp.label) + '</div>';
      for (var ki = 0; ki < keys.length; ki++) html += renderSidebarItem(keys[ki]);
      html += '</div>';
    }

    html += '</nav></div></div>';
    return html;
  }

  function renderSidebarItem(key) {
    var v = APP_VIEWS[key]; if (!v) return '';
    var active = S.currentView === key ? ' scp-nav-item-active' : '';
    var badgeHtml = '';
    if (key === 'posts') badgeHtml = S.activePosts > 0 ? '<span class="scp-nav-badge">' + S.activePosts + '</span>' : '';
    else if (key === 'research') {
      var sesCount = (S.data.research && S.data.research.sessions) ? S.data.research.sessions.length : 0;
      badgeHtml = sesCount > 0 ? '<span class="scp-nav-badge">' + sesCount + '</span>' : '';
    }
    else if (key === 'topics') badgeHtml = (S.data.topics || []).length > 0 ? '<span class="scp-nav-badge">' + (S.data.topics || []).length + '</span>' : '';
    else if (key === 'series') badgeHtml = (S.data.series || []).length > 0 ? '<span class="scp-nav-badge">' + (S.data.series || []).length + '</span>' : '';
    else if (key === 'images') badgeHtml = S.images.length > 0 ? '<span class="scp-nav-badge">' + S.images.length + '</span>' : '';
    var html = '<a href="#' + key + '" class="scp-nav-item' + active + '" data-view="' + key + '" title="' + esc(v.description || '') + '">';
    html += '<span class="scp-nav-icon">' + icon(v.icon) + '</span>';
    html += '<span class="scp-nav-label">' + esc(v.label) + '</span>';
    html += badgeHtml + '</a>';
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
      case 'topics':    html = renderTopicsView(); break;
      case 'series':    html = renderSeriesView ? renderSeriesView() : renderSeriesPlaceholder(); break;
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
  // SECTIONS 8-12: VIEW RENDERERS — extracted (v0.2.0)
  //   8   Dashboard  -> src/core/views/dashboard.js
  //   9   Posts      -> src/core/views/posts.js
  //   10  Calendar   -> src/core/views/calendar.js
  //   11  Topics     -> src/core/views/topics.js
  //   11b Series     -> src/core/views/series.js
  //   12  Activity   -> src/core/views/activity.js
  // ============================================================
  var renderDashboardView   = window._scpRenderDashboardView;
  var renderPostsView       = window._scpRenderPostsView;
  var renderCalendarView    = window._scpRenderCalendarView;
  var renderTopicsView      = window._scpRenderTopicsView;
  var renderSeriesView      = window._scpRenderSeriesView;
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
        '<div class="scp-empty-state-text">The AI Research module (Part 2B JS) didn\'t load. Check that the Asset Injector has all 3 JS files enabled in the correct order: Part 1 → Part 2A → Part 2B.</div>' +
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

  function renderSeriesPlaceholder() {
    var count = (S.data.series || []).length;
    return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon('layer-group') + ' Series</h1>' +
      '<span class="scp-view-subtitle">' + count + ' series</span></div>' +
      '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon('layer-group') + '</div>' +
      '<div class="scp-empty-state-title">Series view coming soon</div>' +
      '<div class="scp-empty-state-text">Group related posts into multi-part content arcs. Generated from the setup wizard or created manually.</div></div></div>';
  }

  // ============================================================
  // SECTION 14: POST FILTERING & SORTING
  // ============================================================

  function getFilteredPosts() {
    var f = S.postFilter;
    var posts = (S.data.posts || []).slice();

    // Search — matches title, content body, topics, hook, and platform content
    if (f.search) {
      var q = f.search.toLowerCase();
      posts = posts.filter(function(p) {
        // Title
        if ((p.title || '').toLowerCase().indexOf(q) > -1) return true;
        // Content body
        if (p.content && (p.content.body || '').toLowerCase().indexOf(q) > -1) return true;
        // Selected hook
        if (p.research && (p.research.selected_hook || '').toLowerCase().indexOf(q) > -1) return true;
        // Topic names
        if (p.topics && p.topics.length > 0) {
          for (var ti = 0; ti < p.topics.length; ti++) {
            var topic = S.topicMap[p.topics[ti]];
            if (topic && topic.name.toLowerCase().indexOf(q) > -1) return true;
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
    // Topic filter
    if (f.topic) posts = posts.filter(function(p) { return (p.topics || []).indexOf(f.topic) > -1; });
    // Series filter
    if (f.series) posts = posts.filter(function(p) { return p.seriesId === f.series; });
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

      case 'topic':
        var topics = getAllTopics();
        for (var tgi = 0; tgi < topics.length; tgi++) {
          var topic = topics[tgi];
          var topicPosts = posts.filter(function(p) { return (p.topics || []).indexOf(topic.id) > -1; });
          if (topicPosts.length) groups.push({ key: topic.id, label: topic.name, icon: 'tag', color: topic.color, posts: topicPosts });
        }
        var untagged = posts.filter(function(p) { return !p.topics || p.topics.length === 0; });
        if (untagged.length) groups.push({ key: '_untagged', label: 'No Topic', icon: 'tag', color: '#9aa0a6', posts: untagged });
        break;

      case 'series':
        var seriesList = getAllSeries();
        for (var sgi = 0; sgi < seriesList.length; sgi++) {
          var ser = seriesList[sgi];
          var sPosts = posts.filter(function(p) { return p.seriesId === ser.id; });
          if (sPosts.length) groups.push({ key: ser.id, label: ser.name, icon: 'layer-group', color: ser.color || '#1a73e8', posts: sPosts });
        }
        var unassigned = posts.filter(function(p) { return !p.seriesId; });
        if (unassigned.length) groups.push({ key: '_no_series', label: 'No Series', icon: 'layer-group', color: '#9aa0a6', posts: unassigned });
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
    $(document).off('change.scp-cftg', '.scp-cal-topic-filter').on('change.scp-cftg', '.scp-cal-topic-filter', function() { S.calendarFilters.topic = $(this).val(); renderCurrentView(); });
    $(document).off('change.scp-cfsr', '.scp-cal-series-filter').on('change.scp-cfsr', '.scp-cal-series-filter', function() { S.calendarFilters.series = $(this).val(); renderCurrentView(); });
    $(document).off('click.scp-ccf', '[data-action="cal-clear-filters"]').on('click.scp-ccf', '[data-action="cal-clear-filters"]', function(e) {
      e.preventDefault(); S.calendarFilters = { platforms: [], types: [], status: '', topic: '', series: '' }; renderCurrentView();
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
          // snapshot for undo support — called via Part 2A if available
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
    // Click empty day → new post with date
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

    // --- Series ---
    $(document).off('click.scp-ssr', '[data-action="select-series"]').on('click.scp-ssr', '[data-action="select-series"]', function(e) { e.preventDefault(); S.selectedSeriesId = $(this).data('id'); renderCurrentView(); });
    $(document).off('click.scp-bsr', '[data-action="back-to-series"]').on('click.scp-bsr', '[data-action="back-to-series"]', function(e) { e.preventDefault(); S.selectedSeriesId = null; renderCurrentView(); });

    // --- Topics ---
    $(document).off('click.scp-st', '[data-action="select-topic"]').on('click.scp-st', '[data-action="select-topic"]', function(e) { e.preventDefault(); S.selectedTopicId = $(this).data('id'); renderCurrentView(); });
    $(document).off('click.scp-stn', '[data-action="select-topic-nav"]').on('click.scp-stn', '[data-action="select-topic-nav"]', function(e) { e.preventDefault(); S.selectedTopicId = $(this).data('id'); navigate('topics'); });
    $(document).off('click.scp-bt', '[data-action="back-to-topics"]').on('click.scp-bt', '[data-action="back-to-topics"]', function(e) { e.preventDefault(); S.selectedTopicId = null; renderCurrentView(); });
    $(document).off('click.scp-nt', '[data-action="new-topic"]').on('click.scp-nt', '[data-action="new-topic"]', function(e) {
      e.preventDefault();
      if (window._scpPart2A && window._scpPart2A.openModal) { /* Part 2A handles topic creation modal */ }
      else {
        var name = prompt('Topic name:');
        if (name && name.trim()) {
          var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2'];
          var topic = { id: generateId('topic'), name: name.trim(), color: colors[Math.floor(Math.random() * colors.length)], description: '', seriesId: '', created: new Date().toISOString() };
          S.data.topics = S.data.topics || [];
          S.data.topics.push(topic);
          logActivity('topic_created', '', '', 'Created topic: ' + topic.name);
          buildMaps(); renderCurrentView(); syncToTextarea(); toast('Topic created', 'success');
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
      topics: overrides.topics || (defs.topics || []).slice(),
      seriesId: overrides.seriesId || '',
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
      logActivity('post_status_changed', post.id, post.title, 'Status: ' + oLbl + ' → ' + nLbl);
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
        // Note: this only syncs to textarea — actual Drupal save requires clicking Save.
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

    // idea → research: when angles or hooks researched
    var r = post.research || {};
    if (STATUS_ORDER.indexOf('research') > currentIdx) {
      if ((r.angles && r.angles.length > 0) || (r.hooks && r.hooks.length > 0)) {
        suggested = 'research';
      }
    }

    // research → content_writing: when angle AND hook selected
    var sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('content_writing') > sugIdx) {
      if (r.selected_angle && r.selected_hook) {
        suggested = 'content_writing';
      }
    }

    // content_writing → media_prompts (or platform_adapt for text)
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

    // media_prompts → platform_adapt
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('platform_adapt') > sugIdx) {
      var prompts = (post.media && post.media.prompts) || [];
      var hasFinal = prompts.length > 0 && prompts.some(function(mp) { return mp.status === 'final'; });
      // Phase B: visual plan also counts as media completion
      var hasVisualPlan = !!(post.media && post.media.visual_plan && post.media.visual_plan.visual_concept && post.media.visual_plan.visual_concept.scene);
      var hasCarouselPlans = !!(post.media && post.media.visual_plans && post.media.visual_plans.length > 0 && post.media.visual_plans[0].visual_concept);
      if (hasFinal || hasVisualPlan || hasCarouselPlans) suggested = 'platform_adapt';
    }

    // platform_adapt → ready
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('ready') > sugIdx) {
      var hasAdaptation = (post.platforms || []).some(function(pk) {
        var pc = (post.platform_content || {})[pk];
        if (pk === 'youtube') return pc && pc.enabled && pc.title && pc.title.trim().length > 0;
        return pc && pc.enabled && pc.body && pc.body.trim().length > 0;
      });
      if (hasAdaptation) suggested = 'ready';
    }

    // ready → scheduled
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
    logActivity('post_status_changed', post.id, post.title, oldLabel + ' → ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' — ' + reason : ''), 'success', 4000);
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
  window._scpGetAllTopics = getAllTopics;
  window._scpGetTopicPosts = getTopicPosts;
  window._scpGetAllSeries = getAllSeries;
  window._scpGetSeriesPosts = getSeriesPosts;
  window._scpGetUpcomingPosts = getUpcomingPosts;
  window._scpGetRecentlyPublished = getRecentlyPublished;
  window._scpGetRecentActivity = getRecentActivity;
  window._scpResolveTone = resolveTone;
  window._scpResolveAudience = resolveAudience;
  window._scpResolveImageStyle = resolveImageStyle;
  window._scpGetPlatformConfig = getPlatformConfig;
  window._scpResolveTopic = resolveTopic;
  window._scpResolveSeries = resolveSeries;

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

  // Setup wizard helpers
  function markSetupComplete() {
    S.meta.setup = S.meta.setup || {};
    S.meta.setup.firstRun = false;
    S.meta.setup.completedAt = new Date().toISOString();
    S.meta.setup.version = S.meta.setup.version || 1;
    logActivity('setup_completed', '', '', 'Setup wizard completed');
    syncToTextarea();
  }
  function resetSetup() {
    S.meta.setup = S.meta.setup || {};
    S.meta.setup.firstRun = true;
    S.meta.setup.completedAt = '';
    syncToTextarea();
  }
  function isFirstRun() { return !!(S.meta.setup && S.meta.setup.firstRun); }
  // True when this looks like a brand-new workspace: no user-authored
  // data, no activity entries, no completed-setup timestamp, and no
  // workspace metadata. Used as the primary auto-open trigger for the
  // setup wizard — independent of the S.meta.setup.firstRun flag so a
  // missed flag write does not strand the wizard.
  function isFreshWorkspace() {
    if (!S.data || !S.meta) return false;
    if ((S.data.posts || []).length) return false;
    if ((S.data.topics || []).length) return false;
    if ((S.data.series || []).length) return false;
    if (((S.data.research || {}).sessions || []).length) return false;
    if ((S.activity || []).length) return false;
    var ws = S.meta.workspace || {};
    if (ws.name || ws.description || ws.niche || ws.audience_description) return false;
    if (S.meta.setup && S.meta.setup.completedAt) return false;
    return true;
  }
  window._scpMarkSetupComplete = markSetupComplete;
  window._scpResetSetup = resetSetup;
  window._scpIsFirstRun = isFirstRun;
  window._scpIsFreshWorkspace = isFreshWorkspace;

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
