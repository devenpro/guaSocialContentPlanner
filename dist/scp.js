/* gua Social Content Planner v0.1.0 | https://github.com/devenpro/guaSocialContentPlanner */
(() => {
  // src/core/scp-part1.js
  (function($, Drupal2) {
    "use strict";
    window._scpRenderers = window._scpRenderers || {};
    var APP_VIEWS = {
      "dashboard": { order: 1, label: "Dashboard", icon: "chart-pie", description: "Overview & pipeline" },
      "research": { order: 2, label: "Research", icon: "flask", description: "AI-powered ideation" },
      "topics": { order: 3, label: "Topics", icon: "tags", description: "Themes & content pillars" },
      "series": { order: 4, label: "Series", icon: "layer-group", description: "Multi-post content arcs" },
      "posts": { order: 5, label: "Posts", icon: "thumbtack", description: "Content pipeline" },
      "calendar": { order: 6, label: "Calendar", icon: "calendar", description: "Schedule view" },
      "images": { order: 7, label: "Images", icon: "images", description: "Reference image library" },
      "activity": { order: 8, label: "Activity", icon: "clock-rotate-left", description: "Full activity log" },
      "settings": { order: 9, label: "Settings", icon: "gear", description: "Workspace configuration" }
    };
    var POST_TYPES = {
      "image": { key: "image", label: "Single Image", icon: "image", color: "#1a73e8" },
      "carousel": { key: "carousel", label: "Carousel", icon: "images", color: "#7c3aed" },
      "video": { key: "video", label: "Video", icon: "video", color: "#d93025" },
      "text": { key: "text", label: "Text Only", icon: "align-left", color: "#0d904f" }
    };
    var PLATFORMS = {
      "linkedin": { key: "linkedin", label: "LinkedIn", icon: "linkedin", brandIcon: true, color: "#0077b5" },
      "instagram": { key: "instagram", label: "Instagram", icon: "instagram", brandIcon: true, color: "#e4405f" },
      "facebook": { key: "facebook", label: "Facebook", icon: "facebook", brandIcon: true, color: "#1877f2" },
      "youtube": { key: "youtube", label: "YouTube", icon: "youtube", brandIcon: true, color: "#ff0000" }
    };
    var POST_STATUSES = {
      "idea": { key: "idea", label: "Idea", icon: "lightbulb", color: "#e37400", order: 0 },
      "research": { key: "research", label: "Research", icon: "flask", color: "#9334e9", order: 1 },
      "content_writing": { key: "content_writing", label: "Content", icon: "pen-fancy", color: "#1a73e8", order: 2 },
      "media_prompts": { key: "media_prompts", label: "Media", icon: "wand-magic", color: "#7c3aed", order: 3 },
      "platform_adapt": { key: "platform_adapt", label: "Platforms", icon: "share-nodes", color: "#0891b2", order: 4 },
      "ready": { key: "ready", label: "Ready", icon: "circle-check", color: "#0d904f", order: 5 },
      "scheduled": { key: "scheduled", label: "Scheduled", icon: "calendar-check", color: "#0d9488", order: 6 },
      "published": { key: "published", label: "Published", icon: "rocket", color: "#059669", order: 7 },
      "archived": { key: "archived", label: "Archived", icon: "box-archive", color: "#80868b", order: 8 }
    };
    var STATUS_ORDER = ["idea", "research", "content_writing", "media_prompts", "platform_adapt", "ready", "scheduled", "published", "archived"];
    var ACTIVE_STATUSES = ["idea", "research", "content_writing", "media_prompts", "platform_adapt", "ready", "scheduled"];
    var WORKFLOW_GROUPS = {
      "todo": { key: "todo", label: "To Do", icon: "clipboard-list", color: "#e37400", statuses: ["idea"] },
      "working": { key: "working", label: "Working", icon: "hammer", color: "#1a73e8", statuses: ["research", "content_writing", "media_prompts", "platform_adapt", "ready", "scheduled"] },
      "published": { key: "published", label: "Published", icon: "rocket", color: "#059669", statuses: ["published"] },
      "trashed": { key: "trashed", label: "Trashed", icon: "box-archive", color: "#80868b", statuses: ["archived"] }
    };
    var GROUPING_OPTIONS = [
      { key: "workflow", label: "Workflow" },
      { key: "status", label: "Status" },
      { key: "type", label: "Type" },
      { key: "platform", label: "Platform" },
      { key: "topic", label: "Topic" },
      { key: "series", label: "Series" },
      { key: "priority", label: "Priority" }
    ];
    var PIPELINE_STEPS = [
      { key: "basics", label: "Basics", icon: "info-circle", order: 0 },
      { key: "research", label: "Research", icon: "flask", order: 1 },
      { key: "content", label: "Content", icon: "pen-fancy", order: 2 },
      { key: "media", label: "Media", icon: "wand-magic", order: 3, skipForText: true },
      { key: "platforms", label: "Platforms", icon: "share-nodes", order: 4 },
      { key: "schedule", label: "Schedule", icon: "calendar", order: 5 }
    ];
    var PRIORITY_LEVELS = {
      "low": { key: "low", label: "Low", icon: "arrow-down", color: "#0d904f" },
      "medium": { key: "medium", label: "Medium", icon: "minus", color: "#e37400" },
      "high": { key: "high", label: "High", icon: "arrow-up", color: "#d93025" },
      "urgent": { key: "urgent", label: "Urgent", icon: "bolt", color: "#be123c" }
    };
    var ACTIVITY_TYPES = {
      "post_created": { icon: "plus", color: "#0d904f" },
      "post_updated": { icon: "edit", color: "#1a73e8" },
      "post_deleted": { icon: "trash", color: "#d93025" },
      "post_status_changed": { icon: "refresh", color: "#1a73e8" },
      "post_promoted": { icon: "arrow-right", color: "#0d904f" },
      "post_archived": { icon: "box-archive", color: "#80868b" },
      "post_rescheduled": { icon: "calendar", color: "#0891b2" },
      "research_created": { icon: "flask", color: "#9334e9" },
      "research_completed": { icon: "sparkles", color: "#9334e9" },
      "content_written": { icon: "pen-fancy", color: "#1a73e8" },
      "content_improved": { icon: "pen", color: "#0891b2" },
      "slides_planned": { icon: "images", color: "#7c3aed" },
      "script_generated": { icon: "video", color: "#d93025" },
      "media_prompts_generated": { icon: "wand-magic", color: "#7c3aed" },
      "media_prompts_built": { icon: "hammer", color: "#7c3aed" },
      "media_prompts_enhanced": { icon: "sparkles", color: "#7c3aed" },
      "visual_plan_created": { icon: "image", color: "#7c3aed" },
      "structured_script_created": { icon: "video", color: "#d93025" },
      "platform_adapted": { icon: "share-nodes", color: "#0891b2" },
      "angles_researched": { icon: "flask", color: "#e37400" },
      "hooks_researched": { icon: "sparkles", color: "#9334e9" },
      "image_uploaded": { icon: "upload", color: "#0d904f" },
      "topic_created": { icon: "tag", color: "#0d904f" },
      "topic_updated": { icon: "tag", color: "#1a73e8" },
      "topic_deleted": { icon: "trash", color: "#d93025" },
      "series_created": { icon: "layer-group", color: "#0d904f" },
      "series_updated": { icon: "layer-group", color: "#1a73e8" },
      "series_deleted": { icon: "trash", color: "#d93025" },
      "setup_completed": { icon: "circle-check", color: "#0d904f" },
      "settings_changed": { icon: "gear", color: "#80868b" },
      "data_imported": { icon: "upload", color: "#1a73e8" },
      "data_exported": { icon: "download", color: "#1a73e8" }
    };
    var CARD_DENSITIES = {
      "compact": { label: "Compact", icon: "list", rowHeight: 40 },
      "normal": { label: "Normal", icon: "menu", rowHeight: 56 },
      "detailed": { label: "Detailed", icon: "layout-grid", rowHeight: 72 }
    };
    var MEDIA_PROMPT_STATUSES = {
      "draft": { label: "Draft", color: "#e37400" },
      "final": { label: "Final", color: "#0d904f" }
    };
    var S = {
      data: { posts: [], research: { sessions: [] }, topics: [], series: [] },
      meta: { workspace: {}, settings: {}, aiPreferences: {}, setup: { firstRun: true, completedAt: "", version: 1 } },
      activity: [],
      user: { id: "", name: "", email: "", fullName: "", timezone: "", roles: "" },
      brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },
      // Lookup maps
      postMap: {},
      topicMap: {},
      seriesMap: {},
      researchMap: {},
      toneMap: {},
      audienceMap: {},
      imageStyleMap: {},
      // Aggregated counts
      statusCounts: {},
      typeCounts: {},
      platformCounts: {},
      topicIndex: {},
      seriesIndex: {},
      totalPosts: 0,
      activePosts: 0,
      publishedPosts: 0,
      // UI state
      currentView: "dashboard",
      previousView: null,
      selectedPostId: null,
      currentStep: "basics",
      cardDensity: "normal",
      settingsTab: "workspace",
      // Posts view state
      postGroupBy: "workflow",
      postFilter: { search: "", statuses: [], type: "", platform: "", topic: "", series: "", priority: "", sortBy: "updated", sortDir: "desc" },
      collapsedGroups: {},
      // Activity view state
      activityFilter: { search: "", type: "" },
      // Topics view state
      selectedTopicId: null,
      // Series view state
      selectedSeriesId: null,
      // Images view state
      images: [],
      imageMap: {},
      $imageField: null,
      selectedImageId: null,
      imageFilter: { search: "", category: "", style: "", tag: "", star: false, sort: "newest" },
      imageViewMode: "grid",
      // Calendar state
      calendarYear: null,
      calendarMonth: null,
      calendarMode: "month",
      // 'month' or 'week'
      calendarWeekStart: null,
      // Date object for week view start
      calendarFilters: { platforms: [], types: [], status: "", topic: "", series: "" },
      calendarPopover: null,
      // { postId, x, y } when showing
      // Shell UI
      sidebarHidden: false,
      // Drupal refs + flags
      $textarea: null,
      $metaTextarea: null,
      $activityTextarea: null,
      $form: null,
      $submitBtn: null,
      _initializing: false,
      initialized: false,
      _part2bTimeout: false,
      dirty: false,
      autoSaveTimer: null,
      lastSaved: null
    };
    function isScpPage() {
      return $("body").hasClass("node--type-social-content-planner");
    }
    Drupal2.behaviors = Drupal2.behaviors || {};
    Drupal2.behaviors.scpPart1 = {
      attach: function(context) {
        if (S.initialized || S._initializing) return;
        if (!isScpPage()) return;
        if (!$(context).find("#edit-field-json-data-0-value").length && !$(context).find("#edit-field-json-meta-0-value").length && context !== document) return;
        init();
      }
    };
    function init() {
      if (S._initializing || S.initialized) return;
      S._initializing = true;
      console.log("[SCP] Initializing Part 1...");
      parseUserData();
      if (!detectDrupalForm()) {
        console.error("[SCP] Could not find Drupal form");
        S._initializing = false;
        return;
      }
      loadData();
      migrateMeta();
      migrateData();
      injectQuillCSS();
      buildMaps();
      renderApp();
      setupEventHandlers();
      startAutoSave();
      S.initialized = true;
      S._initializing = false;
      console.log("[SCP] Part 1 initialized \u2014 " + S.totalPosts + " posts, " + (S.data.topics || []).length + " topics, " + (S.data.series || []).length + " series, user: " + (S.user.name || "unknown"));
      setTimeout(function() {
        var R = window._scpRenderers || {};
        if (!R.researchView || !R.settingsView || !R.imagesView) {
          console.warn("[SCP] Part 2B not loaded after 8s \u2014 updating placeholders");
          S._part2bTimeout = true;
          if (S.currentView === "research" || S.currentView === "settings" || S.currentView === "images") renderCurrentView();
        }
      }, 8e3);
    }
    function parseUserData() {
      var $ud = $("#guau-userdata");
      if (!$ud.length) {
        console.warn("[SCP] User data div not found");
        return;
      }
      S.user = {
        id: ($ud.find("#guau-userid").text() || "").trim(),
        name: ($ud.find("#guau-username").text() || "").trim(),
        email: ($ud.find("#guau-useremail").text() || "").trim(),
        fullName: ($ud.find("#guau-userfullname").text() || "").trim(),
        timezone: ($ud.find("#guau-usertimezone").text() || "").trim(),
        roles: ($ud.find("#guau-userroles").text() || "").trim()
      };
      console.log("[SCP] User: " + S.user.fullName + " (" + S.user.name + ", id=" + S.user.id + ")");
    }
    function detectDrupalForm() {
      var $ta = $("#edit-field-json-data-0-value");
      var $metaTa = $("#edit-field-json-meta-0-value");
      var $actTa = $("#edit-field-activity-log-0-value");
      if (!$ta.length || !$metaTa.length || !$actTa.length) return false;
      S.$textarea = $ta;
      S.$metaTextarea = $metaTa;
      S.$activityTextarea = $actTa;
      S.$form = $ta.closest("form");
      S.$submitBtn = S.$form.find('#edit-submit, [data-drupal-selector="edit-submit"]').first();
      S.$textarea.closest(".field--name-field-json-data").hide();
      S.$metaTextarea.closest(".field--name-field-json-meta").hide();
      S.$activityTextarea.closest(".field--name-field-activity-log").hide();
      S.$form.find(".node-form-options, .field--name-title, .form-actions").hide();
      S.$imageField = S.$form.find(".field--name-field-images");
      if (S.$imageField.length) {
        S.$imageField.hide();
        console.log("[SCP] Image field detected");
      } else {
        console.log("[SCP] No image field found (field_images)");
      }
      return true;
    }
    function loadData() {
      var rawData = S.$textarea.val();
      if (rawData && rawData.trim()) {
        try {
          S.data = JSON.parse(rawData);
        } catch (e) {
          console.error("[SCP] JSON data parse error:", e);
          S.data = getDefaultData();
        }
      } else {
        S.data = getDefaultData();
      }
      var rawMeta = S.$metaTextarea.val();
      if (rawMeta && rawMeta.trim()) {
        try {
          S.meta = JSON.parse(rawMeta);
        } catch (e) {
          console.error("[SCP] JSON meta parse error:", e);
          S.meta = getDefaultMeta();
        }
      } else {
        S.meta = getDefaultMeta();
      }
      var rawActivity = S.$activityTextarea.val();
      if (rawActivity && rawActivity.trim()) {
        try {
          S.activity = JSON.parse(rawActivity);
        } catch (e) {
          console.error("[SCP] JSON activity parse error:", e);
          S.activity = [];
        }
      } else {
        S.activity = [];
      }
      if (!Array.isArray(S.activity)) S.activity = [];
      parseImageField();
    }
    function parseImageField() {
      S.images = [];
      S.imageMap = {};
      if (!S.$imageField || !S.$imageField.length) return;
      var imgMeta = S.meta && S.meta.reference_images || {};
      var _seenUrls = {};
      var _seenFids = {};
      var _imgIdx = 0;
      var $widgets = S.$imageField.find(".image-widget");
      if (!$widgets.length) $widgets = S.$imageField.find('[data-drupal-selector*="edit-field-images-"] > .form-managed-file, .field--type-image .image-widget-data').parent();
      if (!$widgets.length) $widgets = S.$imageField.find(".details-wrapper .form-managed-file, .field-multiple-table tbody tr");
      $widgets.each(function() {
        var $widget = $(this);
        var $img = $widget.find(".image-preview img, .image-style-thumbnail, img").first();
        var $fileLink = $widget.find('.file a, a[href*="/files/"]').first();
        var imgUrl = "";
        if ($img.length) imgUrl = $img.attr("src") || "";
        if (!imgUrl && $fileLink.length) imgUrl = $fileLink.attr("href") || "";
        if (!imgUrl) return;
        var normalizedUrl = imgUrl.replace(/\?.*$/, "").replace(/^https?:/, "");
        if (_seenUrls[normalizedUrl]) return;
        _seenUrls[normalizedUrl] = true;
        var fid = "";
        var $fidInput = $widget.find('input[name*="fids"], input[data-fid]');
        if ($fidInput.length) fid = $fidInput.data("fid") || $fidInput.val() || "";
        if (!fid) {
          var $anyInput = $widget.find('input[name*="field_images"]').first();
          if ($anyInput.length) {
            var match = $anyInput.attr("name").match(/field_images\[(\d+)\]/);
            if (match) fid = "idx_" + match[1];
          }
        }
        if (!fid) fid = "img_" + _imgIdx;
        if (_seenFids[String(fid)]) return;
        _seenFids[String(fid)] = true;
        var filename = "";
        if ($fileLink.length) filename = $fileLink.text().trim();
        if (!filename && imgUrl) filename = imgUrl.split("/").pop().split("?")[0];
        var alt = $img.attr("alt") || "";
        var meta = imgMeta[fid] || {};
        S.images.push({
          fid: String(fid),
          url: imgUrl,
          filename,
          alt,
          index: _imgIdx,
          category: meta.category || "",
          style: meta.style || "",
          tags: meta.tags || [],
          star: !!meta.star,
          description: meta.description || "",
          notes: meta.notes || "",
          usage: meta.usage || []
        });
        _imgIdx++;
      });
      for (var i = 0; i < S.images.length; i++) S.imageMap[S.images[i].fid] = S.images[i];
      console.log("[SCP] Parsed " + S.images.length + " reference images (deduped)");
    }
    function getImages(filters) {
      var imgs = S.images.slice();
      if (!filters) return imgs;
      if (filters.star) imgs = imgs.filter(function(img) {
        return img.star;
      });
      if (filters.category) imgs = imgs.filter(function(img) {
        return img.category === filters.category;
      });
      if (filters.style) imgs = imgs.filter(function(img) {
        return img.style === filters.style;
      });
      if (filters.tag) imgs = imgs.filter(function(img) {
        return img.tags.indexOf(filters.tag) > -1;
      });
      if (filters.search) {
        var q = filters.search.toLowerCase();
        imgs = imgs.filter(function(img) {
          return (img.filename || "").toLowerCase().indexOf(q) > -1 || (img.description || "").toLowerCase().indexOf(q) > -1 || (img.tags || []).some(function(t) {
            return t.toLowerCase().indexOf(q) > -1;
          });
        });
      }
      if (filters.sort === "name") imgs.sort(function(a, b) {
        return (a.filename || "").localeCompare(b.filename || "");
      });
      else if (filters.sort === "most-used") imgs.sort(function(a, b) {
        return (b.usage || []).length - (a.usage || []).length;
      });
      return imgs;
    }
    function getImageById(fid) {
      return S.imageMap[fid] || null;
    }
    function getAllImageTags() {
      var tags = {};
      S.images.forEach(function(img) {
        (img.tags || []).forEach(function(t) {
          tags[t] = (tags[t] || 0) + 1;
        });
      });
      return Object.keys(tags).sort();
    }
    function migrateData() {
      var d = S.data;
      d.posts = d.posts || [];
      d.research = d.research || { sessions: [] };
      d.research.sessions = d.research.sessions || [];
      d.topics = d.topics || [];
      d.series = d.series || [];
      for (var topicI = 0; topicI < d.topics.length; topicI++) {
        if (typeof d.topics[topicI].seriesId === "undefined") d.topics[topicI].seriesId = "";
      }
      for (var i = 0; i < d.posts.length; i++) {
        var p = d.posts[i];
        p.topics = p.topics || [];
        p.seriesId = p.seriesId || "";
        p.platforms = p.platforms || [];
        p.source = p.source || { type: "manual", research_session_id: "", research_idea_id: "", notes: "" };
        p.research = p.research || { angles: [], selected_angle: "", angle_custom_input: "", hooks: [], selected_hook: "", hook_custom_input: "", notes: "" };
        p.content = p.content || { body: "", tone_id: "", audience_id: "", notes: "" };
        p.carousel = p.carousel || { slide_count: 0, slides: [] };
        p.video = p.video || { concept: "", script: "", duration_seconds: 0, format: "" };
        p.media = p.media || { prompts: [], config: { style_id: "", custom_instructions: "", brand_context_enabled: false } };
        p.media.prompts = p.media.prompts || [];
        p.media.config = p.media.config || { style_id: "", custom_instructions: "", brand_context_enabled: false };
        if (p.media.visual_plan && typeof p.media.visual_plan !== "object") p.media.visual_plan = null;
        if (p.media.visual_plans && !Array.isArray(p.media.visual_plans)) p.media.visual_plans = [];
        if (p.video && p.video.structured_script && typeof p.video.structured_script !== "object") p.video.structured_script = null;
        p.platform_content = p.platform_content || {};
        for (var pk in PLATFORMS) {
          if (!p.platform_content[pk]) {
            if (pk === "youtube") p.platform_content[pk] = { enabled: false, title: "", description: "", tags: [], notes: "" };
            else p.platform_content[pk] = { enabled: false, body: "", notes: "" };
          }
        }
        p.schedule = p.schedule || { date: "", time: "", timezone: "", published_urls: {} };
        p.schedule.published_urls = p.schedule.published_urls || {};
        p.performance = p.performance || {};
        p.created_by = p.created_by || "";
        p.assigned_to = p.assigned_to || "";
        p.review_notes = p.review_notes || "";
      }
    }
    function migrateMeta() {
      var m = S.meta;
      m.workspace = m.workspace || { name: "", description: "", created: "" };
      m.settings = m.settings || {};
      m.settings.timezone = m.settings.timezone || "Asia/Kolkata";
      m.settings.card_density = m.settings.card_density || "normal";
      m.settings.default_view = m.settings.default_view || "dashboard";
      m.settings.platforms = m.settings.platforms || {};
      if (!m.settings.platforms.linkedin) m.settings.platforms.linkedin = { enabled: true, handle: "", char_limit: 3e3, hashtag_limit: 5, best_times: [], notes: "" };
      if (!m.settings.platforms.instagram) m.settings.platforms.instagram = { enabled: true, handle: "", char_limit: 2200, hashtag_limit: 30, best_times: [], notes: "" };
      if (!m.settings.platforms.facebook) m.settings.platforms.facebook = { enabled: true, handle: "", char_limit: 63206, hashtag_limit: 10, best_times: [], notes: "" };
      if (!m.settings.platforms.youtube) m.settings.platforms.youtube = { enabled: true, handle: "", title_limit: 100, description_limit: 5e3, tag_limit: 500, notes: "" };
      m.settings.defaults = m.settings.defaults || { type: "image", platforms: ["linkedin"], tone_id: "", audience_id: "", priority: "medium", topics: [] };
      m.settings.tones = m.settings.tones || getDefaultTones();
      m.settings.audiences = m.settings.audiences || getDefaultAudiences();
      m.settings.image_styles = m.settings.image_styles || getDefaultImageStyles();
      m.settings.media_prompt_templates = m.settings.media_prompt_templates || getDefaultMediaPromptTemplates();
      m.settings.research_templates = m.settings.research_templates || getDefaultResearchTemplates();
      m.aiPreferences = m.aiPreferences || {};
      m.aiPreferences.perAction = m.aiPreferences.perAction || {};
      m.aiPreferences.lastProvider = m.aiPreferences.lastProvider || "";
      m.aiPreferences.lastModel = m.aiPreferences.lastModel || "";
      m.setup = m.setup || { firstRun: true, completedAt: "", version: 1 };
      if (typeof m.setup.firstRun !== "boolean") m.setup.firstRun = true;
      m.setup.completedAt = m.setup.completedAt || "";
      m.setup.version = m.setup.version || 1;
      m.reference_images = m.reference_images || {};
      m.image_categories = m.image_categories || getDefaultImageCategories();
      m.settings.brand_design = m.settings.brand_design || getDefaultBrandDesign();
      S.cardDensity = m.settings.card_density;
      S.currentView = readHash();
    }
    function getDefaultData() {
      return { posts: [], research: { sessions: [] }, topics: [], series: [] };
    }
    function getDefaultMeta() {
      return {
        workspace: { name: "", description: "", created: (/* @__PURE__ */ new Date()).toISOString() },
        settings: {
          timezone: "Asia/Kolkata",
          card_density: "normal",
          default_view: "dashboard",
          platforms: {
            linkedin: { enabled: true, handle: "", char_limit: 3e3, hashtag_limit: 5, best_times: ["09:00", "12:00", "17:00"], notes: "" },
            instagram: { enabled: true, handle: "", char_limit: 2200, hashtag_limit: 30, best_times: ["11:00", "14:00", "19:00"], notes: "" },
            facebook: { enabled: true, handle: "", char_limit: 63206, hashtag_limit: 10, best_times: ["09:00", "13:00", "16:00"], notes: "" },
            youtube: { enabled: true, handle: "", title_limit: 100, description_limit: 5e3, tag_limit: 500, notes: "" }
          },
          defaults: { type: "image", platforms: ["linkedin"], tone_id: "", audience_id: "", priority: "medium", topics: [] },
          tones: getDefaultTones(),
          audiences: getDefaultAudiences(),
          image_styles: getDefaultImageStyles(),
          media_prompt_templates: getDefaultMediaPromptTemplates(),
          research_templates: getDefaultResearchTemplates(),
          brand_design: getDefaultBrandDesign()
        },
        aiPreferences: { appDefault: {}, perAction: {}, lastProvider: "", lastModel: "" },
        reference_images: {},
        image_categories: getDefaultImageCategories(),
        setup: { firstRun: true, completedAt: "", version: 1 }
      };
    }
    function getDefaultTones() {
      return [
        { id: "tone_001", name: "Professional", description: "Authoritative, data-driven, polished" },
        { id: "tone_002", name: "Conversational", description: "Friendly, relatable, approachable" },
        { id: "tone_003", name: "Educational", description: "Teaching, step-by-step, clear" },
        { id: "tone_004", name: "Storytelling", description: "Narrative-driven, personal, engaging" },
        { id: "tone_005", name: "Bold / Provocative", description: "Contrarian, attention-grabbing, punchy" },
        { id: "tone_006", name: "Inspirational", description: "Motivational, uplifting, visionary" }
      ];
    }
    function getDefaultAudiences() {
      return [
        { id: "aud_001", name: "Industry Peers", description: "Professionals in your field" },
        { id: "aud_002", name: "Decision Makers", description: "C-suite, managers, buyers" },
        { id: "aud_003", name: "Beginners", description: "New to the topic" },
        { id: "aud_004", name: "Developers", description: "Technical audience" },
        { id: "aud_005", name: "Small Business Owners", description: "Non-technical, ROI-focused" }
      ];
    }
    function getDefaultImageStyles() {
      return [
        { id: "is_001", name: "Photorealistic", description: "Real photography look" },
        { id: "is_002", name: "Flat Illustration", description: "Clean vector style" },
        { id: "is_003", name: "3D Render", description: "Dimensional, glossy" },
        { id: "is_004", name: "Minimalist", description: "Simple, clean, whitespace" },
        { id: "is_005", name: "Corporate", description: "Business, polished" },
        { id: "is_006", name: "Branded", description: "Match brand visual identity" }
      ];
    }
    function getDefaultMediaPromptTemplates() {
      return {
        image: "Create a {style} image for a {platform} post about: {topic}.\n\nBrand: {brand_name}\nMood: {tone}\nKey message: {hook}\n\n{custom_instructions}",
        carousel_batch: "Create {count} cohesive images for a {platform} carousel post.\n\nOverall topic: {topic}\nStyle: {style}\nBrand: {brand_name}\n\nSlide themes:\n{slide_themes}\n\nEnsure visual consistency across all slides.\n\n{custom_instructions}",
        thumbnail: "Create a thumbnail image for a short-form video about: {topic}.\n\nStyle: {style}\nBrand: {brand_name}\nMood: {tone}\nMust be eye-catching and clear at small sizes.\n\n{custom_instructions}"
      };
    }
    function getDefaultResearchTemplates() {
      return [
        { id: "rt_001", name: "Topic Ideation", description: "Generate post ideas for a topic", prompt: "Generate {count} creative post ideas about: {topic}.\n\nRespond ONLY as a JSON array.", variables: ["topic", "count", "platform", "audience", "tone", "custom_instructions"] },
        { id: "rt_002", name: "Competitor Analysis", description: "Differentiated ideas from competitor", prompt: "Analyze competitor and suggest {count} differentiated ideas.\n\nRespond ONLY as a JSON array.", variables: ["competitor_info", "brand_info", "topic", "count"] },
        { id: "rt_003", name: "Content Pillar Expansion", description: "Expand a content pillar", prompt: "Expand pillar '{pillar}' into {count} diverse ideas.\n\nRespond ONLY as a JSON array.", variables: ["pillar", "count", "platforms", "audience"] }
      ];
    }
    function getDefaultImageCategories() {
      return [
        { id: "linkedin_post", label: "LinkedIn Post", icon: "linkedin", color: "#0077b5" },
        { id: "carousel_slide", label: "Carousel Slide", icon: "images", color: "#7c3aed" },
        { id: "thumbnail", label: "Thumbnail", icon: "video", color: "#d93025" },
        { id: "logo", label: "Logo / Branding", icon: "fingerprint", color: "#0d904f" },
        { id: "pattern", label: "Pattern / Texture", icon: "grid-2", color: "#e37400" },
        { id: "instagram_post", label: "Instagram Post", icon: "instagram", color: "#e4405f" },
        { id: "other", label: "Other", icon: "image", color: "#80868b" }
      ];
    }
    function getDefaultBrandDesign() {
      return {
        colors: { primary: "", secondary: "", accent: "", background: "#ffffff", text: "#202124", palette_description: "" },
        typography: { heading_style: "", body_style: "", text_treatment: "" },
        visual_style: { overall_aesthetic: "", photography_style: "", illustration_style: "", icon_style: "", pattern_usage: "", mood: "" },
        layout_rules: { image_composition: "", carousel_consistency: "", thumbnail_style: "", border_radius: "", spacing: "" },
        reference_image_ids: { primary_style: [], carousel_template: [], thumbnail_template: [] },
        brand_prompt_prefix: ""
      };
    }
    function injectQuillCSS() {
      if (!$('link[href*="quill"]').length) {
        $("head").append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css">');
      }
    }
    function buildMaps() {
      S.postMap = {};
      S.statusCounts = {};
      S.typeCounts = {};
      S.platformCounts = {};
      S.topicIndex = {};
      S.seriesIndex = {};
      S.totalPosts = 0;
      S.activePosts = 0;
      S.publishedPosts = 0;
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
        else if (p.status === "published") S.publishedPosts++;
        var plats = p.platforms || [];
        for (var pli = 0; pli < plats.length; pli++) S.platformCounts[plats[pli]] = (S.platformCounts[plats[pli]] || 0) + 1;
        var pTopics = p.topics || [];
        for (var ti = 0; ti < pTopics.length; ti++) {
          S.topicIndex[pTopics[ti]] = S.topicIndex[pTopics[ti]] || [];
          S.topicIndex[pTopics[ti]].push(p.id);
        }
        if (p.seriesId) {
          S.seriesIndex[p.seriesId] = S.seriesIndex[p.seriesId] || [];
          S.seriesIndex[p.seriesId].push(p.id);
        }
      }
      S.topicMap = {};
      var topics = S.data.topics || [];
      for (var tgi = 0; tgi < topics.length; tgi++) S.topicMap[topics[tgi].id] = topics[tgi];
      S.seriesMap = {};
      var seriesList = S.data.series || [];
      for (var sri = 0; sri < seriesList.length; sri++) S.seriesMap[seriesList[sri].id] = seriesList[sri];
      S.researchMap = {};
      var sessions = S.data.research && S.data.research.sessions || [];
      for (var si = 0; si < sessions.length; si++) S.researchMap[sessions[si].id] = sessions[si];
      S.toneMap = {};
      S.audienceMap = {};
      S.imageStyleMap = {};
      var tones = S.meta.settings && S.meta.settings.tones || [];
      for (var tni = 0; tni < tones.length; tni++) S.toneMap[tones[tni].id] = tones[tni];
      var auds = S.meta.settings && S.meta.settings.audiences || [];
      for (var ai = 0; ai < auds.length; ai++) S.audienceMap[auds[ai].id] = auds[ai];
      var styles = S.meta.settings && S.meta.settings.image_styles || [];
      for (var isi = 0; isi < styles.length; isi++) S.imageStyleMap[styles[isi].id] = styles[isi];
      S.imageCategoryMap = {};
      var cats = S.meta && S.meta.image_categories || [];
      for (var ci = 0; ci < cats.length; ci++) S.imageCategoryMap[cats[ci].id] = cats[ci];
    }
    function navigate(viewName, options) {
      options = options || {};
      if (!APP_VIEWS[viewName]) {
        console.warn("[SCP] Unknown view:", viewName);
        return;
      }
      S.previousView = S.currentView;
      S.currentView = viewName;
      updateSidebarActive(viewName);
      renderCurrentView();
      if (!options.noHash) updateHash(viewName);
      if (options.scrollTop !== false) $("#scpContent").scrollTop(0);
    }
    function updateHash(v) {
      if (history.replaceState) history.replaceState(null, null, "#" + v);
      else window.location.hash = v;
    }
    function readHash() {
      var h = window.location.hash.replace("#", "");
      return h && APP_VIEWS[h] ? h : S.meta && S.meta.settings && S.meta.settings.default_view || "dashboard";
    }
    function updateSidebarActive(v) {
      $(".scp-nav-item").removeClass("scp-nav-item-active");
      $('.scp-nav-item[data-view="' + v + '"]').addClass("scp-nav-item-active");
    }
    function formatDate(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    function formatDateShort(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    function formatRelativeTime(iso) {
      if (!iso) return "";
      var diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
      if (diff < 60) return "just now";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
      return formatDate(iso);
    }
    function formatNumber(n) {
      return (n || 0).toLocaleString();
    }
    function formatCharCount(current, limit) {
      var pct = limit > 0 ? current / limit * 100 : 0;
      var color = pct > 95 ? "var(--scp-error)" : pct > 80 ? "var(--scp-warning)" : "var(--scp-text-muted)";
      return '<span class="scp-char-count" style="color:' + color + '">' + formatNumber(current) + " / " + formatNumber(limit) + "</span>";
    }
    function esc(text) {
      if (!text) return "";
      var d = document.createElement("div");
      d.appendChild(document.createTextNode(text));
      return d.innerHTML;
    }
    function truncate(text, max) {
      if (!text || text.length <= max) return text || "";
      return text.substring(0, max) + "\u2026";
    }
    function countWords(text) {
      return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    }
    function countChars(text) {
      return text ? text.length : 0;
    }
    function icon(name, className) {
      className = className || "";
      var icons = {
        "search": "fa-magnifying-glass",
        "lightbulb": "fa-lightbulb",
        "file-text": "fa-file-lines",
        "sparkles": "fa-sparkles",
        "wand-sparkles": "fa-wand-magic-sparkles",
        "wand-magic": "fa-wand-magic-sparkles",
        "edit": "fa-pen-to-square",
        "trash": "fa-trash",
        "copy": "fa-copy",
        "plus": "fa-plus",
        "minus": "fa-minus",
        "x": "fa-xmark",
        "chevron-down": "fa-chevron-down",
        "chevron-right": "fa-chevron-right",
        "chevron-up": "fa-chevron-up",
        "chevron-left": "fa-chevron-left",
        "external-link": "fa-arrow-up-right-from-square",
        "clock": "fa-clock",
        "clock-rotate-left": "fa-clock-rotate-left",
        "calendar": "fa-calendar",
        "calendar-check": "fa-calendar-check",
        "target": "fa-bullseye",
        "bolt": "fa-bolt",
        "play": "fa-play",
        "gear": "fa-gear",
        "settings": "fa-gear",
        "info": "fa-circle-info",
        "info-circle": "fa-circle-info",
        "warning": "fa-triangle-exclamation",
        "error": "fa-circle-xmark",
        "success": "fa-circle-check",
        "circle-check": "fa-circle-check",
        "star": "fa-star",
        "star-half": "fa-star-half-stroke",
        "arrow-up": "fa-arrow-up",
        "arrow-down": "fa-arrow-down",
        "arrow-right": "fa-arrow-right",
        "arrow-left": "fa-arrow-left",
        "video": "fa-video",
        "globe": "fa-globe",
        "archive": "fa-box-archive",
        "box-archive": "fa-box-archive",
        "link": "fa-link",
        "users": "fa-users",
        "user": "fa-user",
        "chart-line": "fa-chart-line",
        "chart-pie": "fa-chart-pie",
        "bar-chart": "fa-chart-bar",
        "eye": "fa-eye",
        "eye-off": "fa-eye-slash",
        "list": "fa-list",
        "list-ol": "fa-list-ol",
        "menu": "fa-bars",
        "layout-grid": "fa-grid-2",
        "image": "fa-image",
        "images": "fa-images",
        "pen-fancy": "fa-pen-fancy",
        "pen": "fa-pen",
        "align-left": "fa-align-left",
        "align-center": "fa-align-center",
        "share-nodes": "fa-share-nodes",
        "share": "fa-share",
        "thumbtack": "fa-thumbtack",
        "bookmark": "fa-bookmark",
        "rocket": "fa-rocket",
        "paper-plane": "fa-paper-plane",
        "flask": "fa-flask",
        "flask-vial": "fa-flask-vial",
        "clipboard-list": "fa-clipboard-list",
        "hammer": "fa-hammer",
        "tag": "fa-tag",
        "tags": "fa-tags",
        "hashtag": "fa-hashtag",
        "at": "fa-at",
        "face-smile": "fa-face-smile",
        "bold": "fa-bold",
        "italic": "fa-italic",
        "refresh": "fa-arrows-rotate",
        "download": "fa-download",
        "upload": "fa-upload",
        "key": "fa-key",
        "lock": "fa-lock",
        "shield": "fa-shield",
        "cube": "fa-cube",
        "shapes": "fa-shapes",
        "briefcase": "fa-briefcase",
        "layer-group": "fa-layer-group",
        "palette": "fa-palette",
        "panel-left": "fa-angles-right",
        "panel-left-close": "fa-angles-left",
        "circle": "fa-circle",
        "check": "fa-check",
        "grip-vertical": "fa-grip-vertical",
        "ellipsis": "fa-ellipsis",
        "filter": "fa-filter",
        "sort": "fa-sort",
        "expand": "fa-expand",
        "compress": "fa-compress",
        "spinner": "fa-spinner fa-spin",
        "circle-xmark": "fa-circle-xmark",
        "fingerprint": "fa-fingerprint",
        "grid-2": "fa-grid-2",
        "wand-magic": "fa-wand-magic-sparkles",
        "sliders": "fa-sliders",
        "font": "fa-font",
        "search": "fa-magnifying-glass",
        // Brand icons (use fab class)
        "youtube": "fa-youtube",
        "instagram": "fa-instagram",
        "facebook": "fa-facebook",
        "linkedin": "fa-linkedin",
        "tiktok": "fa-tiktok",
        "twitter": "fa-x-twitter"
      };
      var brandIcons = { youtube: 1, instagram: 1, facebook: 1, linkedin: 1, tiktok: 1, twitter: 1 };
      var faClass = icons[name] || "fa-" + name;
      return '<i class="' + (brandIcons[name] ? "fab" : "fas") + " " + faClass + (className ? " " + className : "") + ' scp-icon"></i>';
    }
    function badge(text, bg, fg) {
      fg = fg || bg;
      return '<span class="scp-badge" style="background:' + bg + "15;color:" + fg + '">' + esc(text) + "</span>";
    }
    function statusBadge(status) {
      var c = POST_STATUSES[status] || { label: status, color: "#80868b" };
      return '<span class="scp-status-badge"><span class="scp-status-dot" style="background:' + c.color + '"></span>' + esc(c.label) + "</span>";
    }
    function typeBadge(type) {
      var c = POST_TYPES[type] || { label: type, color: "#80868b", icon: "circle" };
      return '<span class="scp-badge" style="background:' + c.color + "15;color:" + c.color + '">' + icon(c.icon) + " " + esc(c.label) + "</span>";
    }
    function priorityBadge(p) {
      if (!p) return "";
      var c = PRIORITY_LEVELS[p] || { label: p, color: "#80868b", icon: "minus" };
      return '<span class="scp-badge" style="background:' + c.color + "15;color:" + c.color + '">' + icon(c.icon) + " " + esc(c.label) + "</span>";
    }
    function platformBadge(platform) {
      var c = PLATFORMS[platform] || { label: platform, color: "#80868b", icon: "globe" };
      return '<span class="scp-badge scp-badge-platform" style="background:' + c.color + "15;color:" + c.color + '">' + icon(c.icon) + " " + esc(c.label) + "</span>";
    }
    function mediaPromptStatusBadge(st) {
      var c = MEDIA_PROMPT_STATUSES[st] || { label: st, color: "#80868b" };
      return '<span class="scp-badge" style="background:' + c.color + "15;color:" + c.color + '">' + esc(c.label) + "</span>";
    }
    function progressBar(pct, color) {
      color = color || "var(--scp-primary)";
      return '<div class="scp-progress-bar"><div class="scp-progress-fill" style="width:' + pct + "%;background:" + color + '"></div></div>';
    }
    function cleanAIText(text) {
      if (!text) return "";
      var cleaned = text;
      cleaned = cleaned.replace(/^```(?:json|text|markdown|html)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      cleaned = cleaned.replace(/\\\\n/g, "\n");
      cleaned = cleaned.replace(/\\n/g, "\n");
      cleaned = cleaned.replace(/\\t/g, "	");
      cleaned = cleaned.replace(/^(?:Here(?:'s| is) (?:the |your |an? )?(?:improved|updated|revised|adapted|generated|written|new) (?:version|post|content|text|copy)[:\s]*\n*)/i, "");
      cleaned = cleaned.trim();
      return cleaned;
    }
    function formatContentForPreview(text) {
      if (!text) return '<span class="scp-text-muted">No content yet</span>';
      var safe = esc(text);
      safe = safe.replace(/\n\n+/g, "</p><p>");
      safe = safe.replace(/\n/g, "<br>");
      safe = safe.replace(/(#[a-zA-Z][\w]*)/g, '<span class="scp-preview-hashtag">$1</span>');
      safe = safe.replace(/(@[a-zA-Z][\w.-]*)/g, '<span class="scp-preview-mention">$1</span>');
      safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");
      safe = "<p>" + safe + "</p>";
      return safe;
    }
    function parsePromptSections(promptText) {
      if (!promptText) return [];
      var sections = [];
      var currentSection = { label: "Prompt", lines: [] };
      var lines = promptText.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        if (/^[A-Z][A-Z\s&\/]+:/.test(line) || line.endsWith(":") && line.length < 40 && /^[A-Z]/.test(line)) {
          if (currentSection.lines.length > 0) sections.push(currentSection);
          currentSection = { label: line.replace(/:$/, "").trim(), lines: [] };
        } else {
          currentSection.lines.push(line);
        }
      }
      if (currentSection.lines.length > 0) sections.push(currentSection);
      return sections;
    }
    function generateId(prefix) {
      return prefix + "_" + Math.random().toString(36).substr(2, 8);
    }
    function getAllTopics() {
      return (S.data.topics || []).slice().sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    function getTopicPosts(topicId) {
      return (S.data.posts || []).filter(function(p) {
        return (p.topics || []).indexOf(topicId) > -1;
      });
    }
    function getAllSeries() {
      return (S.data.series || []).slice().sort(function(a, b) {
        return (a.name || "").localeCompare(b.name || "");
      });
    }
    function getSeriesPosts(seriesId) {
      return (S.data.posts || []).filter(function(p) {
        return p.seriesId === seriesId;
      });
    }
    function getUpcomingPosts(n) {
      var now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return (S.data.posts || []).filter(function(p) {
        return p.schedule && p.schedule.date && p.schedule.date >= now && p.status !== "published" && p.status !== "archived";
      }).sort(function(a, b) {
        return a.schedule.date + (a.schedule.time || "") < b.schedule.date + (b.schedule.time || "") ? -1 : 1;
      }).slice(0, n || 5);
    }
    function getRecentlyPublished(n) {
      return (S.data.posts || []).filter(function(p) {
        return p.status === "published";
      }).sort(function(a, b) {
        var aDate = a.schedule && a.schedule.date || a.updated || "";
        var bDate = b.schedule && b.schedule.date || b.updated || "";
        return bDate.localeCompare(aDate);
      }).slice(0, n || 5);
    }
    function getRecentActivity(n) {
      return (S.activity || []).slice(-(n || 15)).reverse();
    }
    function resolveTone(id) {
      return S.toneMap[id] || null;
    }
    function resolveAudience(id) {
      return S.audienceMap[id] || null;
    }
    function resolveImageStyle(id) {
      return S.imageStyleMap[id] || null;
    }
    function getPlatformConfig(key) {
      return S.meta.settings && S.meta.settings.platforms && S.meta.settings.platforms[key] || {};
    }
    function resolveTopic(id) {
      return S.topicMap[id] || null;
    }
    function resolveSeries(id) {
      return S.seriesMap[id] || null;
    }
    function debounce(fn, delay) {
      var t;
      return function() {
        var c = this, a = arguments;
        clearTimeout(t);
        t = setTimeout(function() {
          fn.apply(c, a);
        }, delay);
      };
    }
    function deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    function isEmpty(obj) {
      return !obj || typeof obj === "object" && Object.keys(obj).length === 0;
    }
    function renderApp() {
      var toolbarH = 0;
      var $toolbarBar = $("#toolbar-bar");
      if ($toolbarBar.length) {
        toolbarH = $toolbarBar.outerHeight() || 0;
        var $tray = $("#toolbar-tray-horizontal");
        if ($tray.length && $tray.is(":visible")) toolbarH += $tray.outerHeight() || 0;
      }
      document.documentElement.style.setProperty("--scp-drupal-toolbar", toolbarH + "px");
      $("body").addClass("scp-active");
      S.$form.closest(".layout-region-node-main, .node-form").hide();
      var $app = $('<div id="scpApp" class="scp-app"></div>');
      S.$form.closest(".layout-region-node-main, .node-form").before($app);
      $app.html(renderAppShell());
      renderCurrentView();
    }
    function renderAppShell() {
      return renderHeader() + '<div class="scp-body">' + renderSidebar() + '<div class="scp-main"><div class="scp-content" id="scpContent"></div></div></div><div id="scpToasts" class="scp-toast-container"></div>';
    }
    function renderHeader() {
      var ws = S.meta && S.meta.workspace || {};
      var html = '<div class="scp-header"><div class="scp-header-left">';
      html += '<button class="scp-btn-icon scp-sidebar-toggle" id="scpSidebarToggle">' + icon("menu") + "</button>";
      html += '<div class="scp-header-logo">SCP</div>';
      html += '<div class="scp-header-info"><span class="scp-header-name">' + esc(ws.name || "Social Content Planner") + "</span></div>";
      if (S.brand && S.brand.configured && S.brand.identity.name) {
        html += '<div class="scp-header-brand">';
        if (S.brand.identity.logoUrl) html += '<img class="scp-header-brand-logo" src="' + esc(S.brand.identity.logoUrl) + '" alt="">';
        html += '<span class="scp-header-brand-name">' + esc(S.brand.core && S.brand.core.brand_name ? S.brand.core.brand_name : S.brand.identity.name) + "</span></div>";
      }
      html += '</div><div class="scp-header-right">';
      html += '<span class="scp-save-status" id="scpSaveStatus"></span>';
      html += '<span class="scp-ai-status-indicator" id="scpAIStatus" title="AI status \u2014 loading..."><span class="scp-ai-status-dot scp-ai-status-loading"></span><span class="scp-ai-status-label">AI</span></span>';
      html += '<div class="scp-ai-quick-switch" id="scpAIQuickSwitch" style="display:none"></div>';
      html += '<button class="scp-btn scp-btn-primary scp-btn-sm" id="scpSaveNodeBtn">' + icon("check") + " Save</button>";
      if (S.user.fullName) html += '<span class="scp-header-user">' + icon("user") + " " + esc(S.user.fullName) + "</span>";
      html += "</div></div>";
      return html;
    }
    function renderSidebar() {
      var html = '<div class="scp-sidebar" id="scpSidebar"><div class="scp-sidebar-overlay"></div><div class="scp-sidebar-inner"><nav class="scp-nav">';
      for (var key in APP_VIEWS) {
        var v = APP_VIEWS[key];
        var active = S.currentView === key ? " scp-nav-item-active" : "";
        var badgeHtml = "";
        if (key === "posts") badgeHtml = S.activePosts > 0 ? '<span class="scp-nav-badge">' + S.activePosts + "</span>" : "";
        else if (key === "research") {
          var sesCount = S.data.research && S.data.research.sessions ? S.data.research.sessions.length : 0;
          badgeHtml = sesCount > 0 ? '<span class="scp-nav-badge">' + sesCount + "</span>" : "";
        } else if (key === "topics") badgeHtml = (S.data.topics || []).length > 0 ? '<span class="scp-nav-badge">' + (S.data.topics || []).length + "</span>" : "";
        else if (key === "series") badgeHtml = (S.data.series || []).length > 0 ? '<span class="scp-nav-badge">' + (S.data.series || []).length + "</span>" : "";
        else if (key === "images") badgeHtml = S.images.length > 0 ? '<span class="scp-nav-badge">' + S.images.length + "</span>" : "";
        html += '<a href="#' + key + '" class="scp-nav-item' + active + '" data-view="' + key + '">';
        html += '<span class="scp-nav-icon">' + icon(v.icon) + "</span>";
        html += '<span class="scp-nav-label">' + esc(v.label) + "</span>";
        html += badgeHtml + "</a>";
      }
      html += "</nav></div></div>";
      return html;
    }
    function renderCurrentView() {
      var R = window._scpRenderers;
      var html = "";
      switch (S.currentView) {
        case "dashboard":
          html = renderDashboardView();
          break;
        case "research":
          html = R.researchView ? R.researchView() : renderResearchPlaceholder();
          break;
        case "posts":
          html = renderPostsView();
          break;
        case "calendar":
          html = renderCalendarView();
          break;
        case "images":
          html = R.imagesView ? R.imagesView() : renderImagesPlaceholder();
          break;
        case "topics":
          html = renderTopicsView();
          break;
        case "series":
          html = renderSeriesPlaceholder();
          break;
        case "activity":
          html = renderActivityView();
          break;
        case "settings":
          html = R.settingsView ? R.settingsView() : renderSettingsPlaceholder();
          break;
        default:
          html = renderDashboardView();
      }
      $("#scpContent").html(html);
      setupViewEventHandlers();
      if (R.setupResearchEvents && S.currentView === "research") R.setupResearchEvents();
      if (R.setupImagesEvents && S.currentView === "images") R.setupImagesEvents();
      if (R.setupSettingsEvents && S.currentView === "settings") R.setupSettingsEvents();
    }
    var renderDashboardView = window._scpRenderDashboardView;
    var renderPostsView = window._scpRenderPostsView;
    var renderCalendarView = window._scpRenderCalendarView;
    var renderTopicsView = window._scpRenderTopicsView;
    var renderActivityView = window._scpRenderActivityView;
    var renderStatCard = window._scpRenderStatCard;
    var renderActivityItem = window._scpRenderActivityItem;
    var renderPostListItem = window._scpRenderPostListItem;
    var renderCalendarPopover = window._scpRenderCalendarPopover;
    function renderResearchPlaceholder() {
      if (S._part2bTimeout) {
        return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("flask") + ' Research</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon("warning") + `</div><div class="scp-empty-state-title">Research Module Not Loaded</div><div class="scp-empty-state-text">The AI Research module (Part 2B JS) didn't load. Check that the Asset Injector has all 3 JS files enabled in the correct order: Part 1 \u2192 Part 2A \u2192 Part 2B.</div><button class="scp-btn scp-btn-outline" onclick="location.reload()">` + icon("refresh") + " Reload Page</button></div></div>";
      }
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("flask") + ' Research</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon("spinner") + '</div><div class="scp-empty-state-title">AI-Powered Ideation</div><div class="scp-empty-state-text">Loading research workspace...</div></div></div>';
    }
    function renderSettingsPlaceholder() {
      if (S._part2bTimeout) {
        return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("gear") + ' Settings</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon("warning") + `</div><div class="scp-empty-state-title">Settings Module Not Loaded</div><div class="scp-empty-state-text">The Settings module (Part 2B JS) didn't load. Check Asset Injector configuration.</div><button class="scp-btn scp-btn-outline" onclick="location.reload()">` + icon("refresh") + " Reload Page</button></div></div>";
      }
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("gear") + ' Settings</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon("spinner") + '</div><div class="scp-empty-state-title">Settings</div><div class="scp-empty-state-text">Loading workspace configuration...</div></div></div>';
    }
    function renderImagesPlaceholder() {
      if (S._part2bTimeout) {
        return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("images") + ' Reference Images</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon" style="color:var(--scp-warning)">' + icon("warning") + `</div><div class="scp-empty-state-title">Images Module Not Loaded</div><div class="scp-empty-state-text">The Images module (Part 2B JS) didn't load. Check Asset Injector configuration.</div><button class="scp-btn scp-btn-outline" onclick="location.reload()">` + icon("refresh") + " Reload Page</button></div></div>";
      }
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("images") + ' Reference Images</h1></div><div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon("spinner") + '</div><div class="scp-empty-state-title">Reference Images</div><div class="scp-empty-state-text">Loading brand image library...</div></div></div>';
    }
    function renderSeriesPlaceholder() {
      var count = (S.data.series || []).length;
      return '<div class="scp-view"><div class="scp-view-header"><h1>' + icon("layer-group") + ' Series</h1><span class="scp-view-subtitle">' + count + ' series</span></div><div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon("layer-group") + '</div><div class="scp-empty-state-title">Series view coming soon</div><div class="scp-empty-state-text">Group related posts into multi-part content arcs. Generated from the setup wizard or created manually.</div></div></div>';
    }
    function getFilteredPosts() {
      var f = S.postFilter;
      var posts = (S.data.posts || []).slice();
      if (f.search) {
        var q = f.search.toLowerCase();
        posts = posts.filter(function(p) {
          if ((p.title || "").toLowerCase().indexOf(q) > -1) return true;
          if (p.content && (p.content.body || "").toLowerCase().indexOf(q) > -1) return true;
          if (p.research && (p.research.selected_hook || "").toLowerCase().indexOf(q) > -1) return true;
          if (p.topics && p.topics.length > 0) {
            for (var ti = 0; ti < p.topics.length; ti++) {
              var topic = S.topicMap[p.topics[ti]];
              if (topic && topic.name.toLowerCase().indexOf(q) > -1) return true;
            }
          }
          return false;
        });
      }
      if (f.statuses && f.statuses.length > 0) {
        posts = posts.filter(function(p) {
          return f.statuses.indexOf(p.status) > -1;
        });
      }
      if (f.type) posts = posts.filter(function(p) {
        return p.type === f.type;
      });
      if (f.platform) posts = posts.filter(function(p) {
        return (p.platforms || []).indexOf(f.platform) > -1;
      });
      if (f.topic) posts = posts.filter(function(p) {
        return (p.topics || []).indexOf(f.topic) > -1;
      });
      if (f.series) posts = posts.filter(function(p) {
        return p.seriesId === f.series;
      });
      if (f.priority) posts = posts.filter(function(p) {
        return p.priority === f.priority;
      });
      var sortBy = f.sortBy || "updated";
      var dir = f.sortDir === "asc" ? 1 : -1;
      posts.sort(function(a, b) {
        var av, bv;
        switch (sortBy) {
          case "title":
            av = (a.title || "").toLowerCase();
            bv = (b.title || "").toLowerCase();
            return av < bv ? -dir : av > bv ? dir : 0;
          case "created":
            av = a.created || "";
            bv = b.created || "";
            return av < bv ? dir : av > bv ? -dir : 0;
          case "priority":
            var po = { urgent: 0, high: 1, medium: 2, low: 3 };
            av = po[a.priority] !== void 0 ? po[a.priority] : 9;
            bv = po[b.priority] !== void 0 ? po[b.priority] : 9;
            return (av - bv) * dir;
          default:
            av = a.updated || a.created || "";
            bv = b.updated || b.created || "";
            return av < bv ? dir : av > bv ? -dir : 0;
        }
      });
      return posts;
    }
    function getGroupedPosts(groupBy) {
      var posts = getFilteredPosts();
      var groups = [];
      switch (groupBy) {
        case "workflow":
          for (var gk in WORKFLOW_GROUPS) {
            var wg = WORKFLOW_GROUPS[gk];
            var gPosts = posts.filter(function(p) {
              return wg.statuses.indexOf(p.status) > -1;
            });
            groups.push({ key: gk, label: wg.label, icon: wg.icon, color: wg.color, posts: gPosts });
          }
          break;
        case "status":
          for (var si = 0; si < STATUS_ORDER.length; si++) {
            var sk = STATUS_ORDER[si];
            var st = POST_STATUSES[sk];
            var sPosts = posts.filter(function(p) {
              return p.status === sk;
            });
            if (sPosts.length) groups.push({ key: sk, label: st.label, icon: st.icon, color: st.color, posts: sPosts });
          }
          break;
        case "type":
          for (var tk in POST_TYPES) {
            var pt = POST_TYPES[tk];
            var tPosts = posts.filter(function(p) {
              return p.type === tk;
            });
            if (tPosts.length) groups.push({ key: tk, label: pt.label, icon: pt.icon, color: pt.color, posts: tPosts });
          }
          break;
        case "platform":
          for (var pk in PLATFORMS) {
            var pl = PLATFORMS[pk];
            var pPosts = posts.filter(function(p) {
              return (p.platforms || []).indexOf(pk) > -1;
            });
            if (pPosts.length) groups.push({ key: pk, label: pl.label, icon: pl.icon, color: pl.color, posts: pPosts });
          }
          break;
        case "topic":
          var topics = getAllTopics();
          for (var tgi = 0; tgi < topics.length; tgi++) {
            var topic = topics[tgi];
            var topicPosts = posts.filter(function(p) {
              return (p.topics || []).indexOf(topic.id) > -1;
            });
            if (topicPosts.length) groups.push({ key: topic.id, label: topic.name, icon: "tag", color: topic.color, posts: topicPosts });
          }
          var untagged = posts.filter(function(p) {
            return !p.topics || p.topics.length === 0;
          });
          if (untagged.length) groups.push({ key: "_untagged", label: "No Topic", icon: "tag", color: "#9aa0a6", posts: untagged });
          break;
        case "series":
          var seriesList = getAllSeries();
          for (var sgi = 0; sgi < seriesList.length; sgi++) {
            var ser = seriesList[sgi];
            var sPosts = posts.filter(function(p) {
              return p.seriesId === ser.id;
            });
            if (sPosts.length) groups.push({ key: ser.id, label: ser.name, icon: "layer-group", color: ser.color || "#1a73e8", posts: sPosts });
          }
          var unassigned = posts.filter(function(p) {
            return !p.seriesId;
          });
          if (unassigned.length) groups.push({ key: "_no_series", label: "No Series", icon: "layer-group", color: "#9aa0a6", posts: unassigned });
          break;
        case "priority":
          var priOrder = ["urgent", "high", "medium", "low"];
          for (var pri = 0; pri < priOrder.length; pri++) {
            var prk = priOrder[pri];
            var prCfg = PRIORITY_LEVELS[prk];
            var prPosts = posts.filter(function(p) {
              return p.priority === prk;
            });
            if (prPosts.length) groups.push({ key: prk, label: prCfg.label, icon: prCfg.icon, color: prCfg.color, posts: prPosts });
          }
          var noPri = posts.filter(function(p) {
            return !p.priority;
          });
          if (noPri.length) groups.push({ key: "_none", label: "No Priority", icon: "minus", color: "#9aa0a6", posts: noPri });
          break;
        default:
          groups.push({ key: "all", label: "All Posts", icon: "thumbtack", color: "#1a73e8", posts });
      }
      return groups;
    }
    function setupEventHandlers() {
      $(document).off("click.scp-nav", ".scp-nav-item").on("click.scp-nav", ".scp-nav-item", function(e) {
        e.preventDefault();
        var v = $(this).data("view");
        if (v) navigate(v);
      });
      $(document).off("click.scp-sidebar", "#scpSidebarToggle").on("click.scp-sidebar", "#scpSidebarToggle", function(e) {
        e.preventDefault();
        if (window.innerWidth <= 992) {
          $("#scpSidebar").toggleClass("scp-sidebar-open");
        } else {
          S.sidebarHidden = !S.sidebarHidden;
          $("#scpApp").toggleClass("scp-app--sidebar-hidden", S.sidebarHidden);
        }
      });
      $(document).off("click.scp-overlay", ".scp-sidebar-overlay").on("click.scp-overlay", ".scp-sidebar-overlay", function() {
        $("#scpSidebar").removeClass("scp-sidebar-open");
      });
      $(document).off("click.scp-save", "#scpSaveNodeBtn").on("click.scp-save", "#scpSaveNodeBtn", function(e) {
        e.preventDefault();
        syncToTextarea();
        updateSaveStatus("saving");
        if (S.$submitBtn && S.$submitBtn.length) {
          S.dirty = false;
          S.$submitBtn.click();
        } else {
          updateSaveStatus("saved");
          toast("Data synced to fields. Use the Drupal Save button to persist.", "info");
        }
      });
      $(document).off("click.scp-toast", '[data-action="close-toast"]').on("click.scp-toast", '[data-action="close-toast"]', function() {
        $(this).closest(".scp-toast").remove();
      });
      $(window).off("hashchange.scp").on("hashchange.scp", function() {
        var h = readHash();
        if (h !== S.currentView) navigate(h, { noHash: true });
      });
      $(document).off("click.scp-goview", '[data-action="go-view"]').on("click.scp-goview", '[data-action="go-view"]', function(e) {
        e.preventDefault();
        navigate($(this).data("view"));
      });
      $(document).off("click.scp-goset", '[data-action="go-settings"]').on("click.scp-goset", '[data-action="go-settings"]', function(e) {
        e.preventDefault();
        S.settingsTab = $(this).data("tab") || "workspace";
        navigate("settings");
      });
    }
    function setupViewEventHandlers() {
      $(document).off("input.scp-ps", "#scpPostSearch").on("input.scp-ps", "#scpPostSearch", debounce(function() {
        S.postFilter.search = $(this).val();
        renderCurrentView();
      }, 300));
      $(document).off("click.scp-grp", '[data-action="change-group"]').on("click.scp-grp", '[data-action="change-group"]', function(e) {
        e.preventDefault();
        S.postGroupBy = $(this).data("group");
        S.collapsedGroups = {};
        renderCurrentView();
      });
      $(document).off("click.scp-tg", '[data-action="toggle-group"]').on("click.scp-tg", '[data-action="toggle-group"]', function(e) {
        e.preventDefault();
        var gk = $(this).data("group");
        S.collapsedGroups[gk] = !S.collapsedGroups[gk];
        renderCurrentView();
      });
      $(document).off("click.scp-sp", '[data-action="select-post"]').on("click.scp-sp", '[data-action="select-post"]', function(e) {
        e.preventDefault();
        S.selectedPostId = $(this).data("id");
        S.currentStep = "basics";
        if (S.currentView !== "posts") navigate("posts");
        else renderCurrentView();
      });
      $(document).off("click.scp-gs", '[data-action="go-step"]').on("click.scp-gs", '[data-action="go-step"]', function(e) {
        e.preventDefault();
        S.currentStep = $(this).data("step");
        renderCurrentView();
      });
      $(document).off("click.scp-np", '[data-action="new-post"]').on("click.scp-np", '[data-action="new-post"]', function(e) {
        e.preventDefault();
        createNewPost();
      });
      $(document).off("click.scp-dp", '[data-action="delete-post"]').on("click.scp-dp", '[data-action="delete-post"]', function(e) {
        e.preventDefault();
        var id = $(this).data("id");
        if (id && window._scpPart2A && window._scpPart2A.deletePost) {
          window._scpPart2A.deletePost(id);
        } else if (id && confirm("Delete this post?")) {
          S.data.posts = (S.data.posts || []).filter(function(p) {
            return p.id !== id;
          });
          if (S.selectedPostId === id) S.selectedPostId = null;
          logActivity("post_deleted", id, "", "Post deleted");
          buildMaps();
          renderCurrentView();
          syncToTextarea();
          toast("Post deleted", "success");
        }
      });
      $(document).off("change.scp-sb", "#scpSortBy").on("change.scp-sb", "#scpSortBy", function() {
        S.postFilter.sortBy = $(this).val();
        renderCurrentView();
      });
      $(document).off("click.scp-sd", '[data-action="toggle-sort-dir"]').on("click.scp-sd", '[data-action="toggle-sort-dir"]', function(e) {
        e.preventDefault();
        S.postFilter.sortDir = S.postFilter.sortDir === "asc" ? "desc" : "asc";
        renderCurrentView();
      });
      $(document).off("click.scp-pf", '[data-action="filter-pipeline-status"]').on("click.scp-pf", '[data-action="filter-pipeline-status"]', function(e) {
        e.preventDefault();
        S.postFilter.statuses = [$(this).data("status")];
        navigate("posts");
      });
      $(document).off("click.scp-cp", '[data-action="cal-prev"]').on("click.scp-cp", '[data-action="cal-prev"]', function(e) {
        e.preventDefault();
        if (S.calendarMode === "week") {
          var ws = getWeekStart(S.calendarYear, S.calendarMonth);
          ws.setDate(ws.getDate() - 7);
          S.calendarWeekStart = ws;
          S.calendarYear = ws.getFullYear();
          S.calendarMonth = ws.getMonth();
        } else {
          S.calendarMonth--;
          if (S.calendarMonth < 0) {
            S.calendarMonth = 11;
            S.calendarYear--;
          }
        }
        renderCurrentView();
      });
      $(document).off("click.scp-cn", '[data-action="cal-next"]').on("click.scp-cn", '[data-action="cal-next"]', function(e) {
        e.preventDefault();
        if (S.calendarMode === "week") {
          var ws = getWeekStart(S.calendarYear, S.calendarMonth);
          ws.setDate(ws.getDate() + 7);
          S.calendarWeekStart = ws;
          S.calendarYear = ws.getFullYear();
          S.calendarMonth = ws.getMonth();
        } else {
          S.calendarMonth++;
          if (S.calendarMonth > 11) {
            S.calendarMonth = 0;
            S.calendarYear++;
          }
        }
        renderCurrentView();
      });
      $(document).off("click.scp-ct", '[data-action="cal-today"]').on("click.scp-ct", '[data-action="cal-today"]', function(e) {
        e.preventDefault();
        var now = /* @__PURE__ */ new Date();
        S.calendarYear = now.getFullYear();
        S.calendarMonth = now.getMonth();
        S.calendarWeekStart = null;
        renderCurrentView();
      });
      $(document).off("click.scp-cm", '[data-action="cal-mode"]').on("click.scp-cm", '[data-action="cal-mode"]', function(e) {
        e.preventDefault();
        S.calendarMode = $(this).data("mode");
        S.calendarWeekStart = null;
        renderCurrentView();
      });
      $(document).off("click.scp-cfp", '[data-action="cal-filter-platform"]').on("click.scp-cfp", '[data-action="cal-filter-platform"]', function(e) {
        e.preventDefault();
        var pk = $(this).data("platform");
        S.calendarFilters.platforms = S.calendarFilters.platforms || [];
        var idx = S.calendarFilters.platforms.indexOf(pk);
        if (idx > -1) S.calendarFilters.platforms.splice(idx, 1);
        else S.calendarFilters.platforms.push(pk);
        renderCurrentView();
      });
      $(document).off("click.scp-cft", '[data-action="cal-filter-type"]').on("click.scp-cft", '[data-action="cal-filter-type"]', function(e) {
        e.preventDefault();
        var tk = $(this).data("type");
        S.calendarFilters.types = S.calendarFilters.types || [];
        var idx = S.calendarFilters.types.indexOf(tk);
        if (idx > -1) S.calendarFilters.types.splice(idx, 1);
        else S.calendarFilters.types.push(tk);
        renderCurrentView();
      });
      $(document).off("change.scp-cfs", ".scp-cal-status-filter").on("change.scp-cfs", ".scp-cal-status-filter", function() {
        S.calendarFilters.status = $(this).val();
        renderCurrentView();
      });
      $(document).off("change.scp-cftg", ".scp-cal-topic-filter").on("change.scp-cftg", ".scp-cal-topic-filter", function() {
        S.calendarFilters.topic = $(this).val();
        renderCurrentView();
      });
      $(document).off("change.scp-cfsr", ".scp-cal-series-filter").on("change.scp-cfsr", ".scp-cal-series-filter", function() {
        S.calendarFilters.series = $(this).val();
        renderCurrentView();
      });
      $(document).off("click.scp-ccf", '[data-action="cal-clear-filters"]').on("click.scp-ccf", '[data-action="cal-clear-filters"]', function(e) {
        e.preventDefault();
        S.calendarFilters = { platforms: [], types: [], status: "", topic: "", series: "" };
        renderCurrentView();
      });
      $(document).off("dragstart.scp-cds").on("dragstart.scp-cds", ".scp-cal-post[draggable], .scp-cal-week-card[draggable]", function(e) {
        var postId = $(this).data("id");
        e.originalEvent.dataTransfer.setData("text/plain", postId);
        e.originalEvent.dataTransfer.effectAllowed = "move";
        $(this).addClass("scp-cal-dragging");
      });
      $(document).off("dragend.scp-cde").on("dragend.scp-cde", ".scp-cal-post, .scp-cal-week-card", function() {
        $(this).removeClass("scp-cal-dragging");
        $(".scp-cal-day-drop").removeClass("scp-cal-day-drop");
      });
      $(document).off("drop.scp-cdr").on("drop.scp-cdr", ".scp-cal-day[data-date], .scp-cal-week-day[data-date]", function(e) {
        e.preventDefault();
        var postId = e.originalEvent.dataTransfer.getData("text/plain");
        var newDate = $(this).data("date");
        if (postId && newDate) {
          var post = S.postMap[postId];
          if (post) {
            var oldDate = post.schedule && post.schedule.date || "";
            if (oldDate === newDate) return;
            post.schedule = post.schedule || {};
            post.schedule.date = newDate;
            post.updated = (/* @__PURE__ */ new Date()).toISOString();
            logActivity("post_rescheduled", post.id, post.title, "Moved from " + (oldDate || "unscheduled") + " to " + newDate);
            if (window._scpPart2A && window._scpPart2A.snapshot) window._scpPart2A.snapshot("Reschedule " + truncate(post.title, 20));
            buildMaps();
            syncToTextarea();
            renderCurrentView();
            toast('Moved "' + truncate(post.title, 30) + '" to ' + newDate, "success");
          }
        }
      });
      $(document).off("mouseenter.scp-cph", '[data-action="cal-post-hover"]').on("mouseenter.scp-cph", '[data-action="cal-post-hover"]', function(e) {
        var postId = $(this).data("id");
        var post = S.postMap[postId];
        if (!post) return;
        var $pop = $("#scpCalPopover");
        $pop.html(renderCalendarPopover(post));
        var rect = this.getBoundingClientRect();
        var popW = 300;
        var popH = 240;
        var left = rect.left + rect.width / 2 - popW / 2;
        var top = rect.bottom + 8;
        if (left < 8) left = 8;
        if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
        if (top + popH > window.innerHeight - 8) top = rect.top - popH - 8;
        $pop.css({ left: left + "px", top: top + "px", width: popW + "px", display: "block", position: "fixed" });
      });
      $(document).off("mouseleave.scp-cpl", '[data-action="cal-post-hover"]').on("mouseleave.scp-cpl", '[data-action="cal-post-hover"]', function(e) {
        setTimeout(function() {
          if (!$("#scpCalPopover:hover").length) $("#scpCalPopover").hide();
        }, 200);
      });
      $(document).off("mouseleave.scp-cppl", "#scpCalPopover").on("mouseleave.scp-cppl", "#scpCalPopover", function() {
        $(this).hide();
      });
      $(document).off("click.scp-cpc", '[data-action="cal-pop-close"]').on("click.scp-cpc", '[data-action="cal-pop-close"]', function(e) {
        e.preventDefault();
        $("#scpCalPopover").hide();
      });
      $(document).off("click.scp-cdc", '[data-action="cal-day-click"]').on("click.scp-cdc", '[data-action="cal-day-click"]', function(e) {
        if ($(e.target).closest(".scp-cal-post, .scp-cal-more, .scp-cal-week-card, .scp-cal-add-btn").length) return;
        e.preventDefault();
        var date = $(this).data("date");
        if (!date) return;
        var postCount = $(this).find(".scp-cal-post, .scp-cal-week-card").length;
        if (postCount === 0) {
          var np = createNewPost({ schedule: { date, time: "", timezone: S.meta.settings && S.meta.settings.timezone || "" } });
          if (np) {
            toast("New post created for " + date, "success");
            renderCurrentView();
          }
        }
      });
      $(document).off("click.scp-cnp", '[data-action="cal-new-post"]').on("click.scp-cnp", '[data-action="cal-new-post"]', function(e) {
        e.preventDefault();
        var date = $(this).data("date");
        var np = createNewPost({ schedule: { date, time: "", timezone: S.meta.settings && S.meta.settings.timezone || "" } });
        if (np) {
          toast("New post created for " + date, "success");
          renderCurrentView();
        }
      });
      $(document).off("click.scp-st", '[data-action="select-topic"]').on("click.scp-st", '[data-action="select-topic"]', function(e) {
        e.preventDefault();
        S.selectedTopicId = $(this).data("id");
        renderCurrentView();
      });
      $(document).off("click.scp-stn", '[data-action="select-topic-nav"]').on("click.scp-stn", '[data-action="select-topic-nav"]', function(e) {
        e.preventDefault();
        S.selectedTopicId = $(this).data("id");
        navigate("topics");
      });
      $(document).off("click.scp-bt", '[data-action="back-to-topics"]').on("click.scp-bt", '[data-action="back-to-topics"]', function(e) {
        e.preventDefault();
        S.selectedTopicId = null;
        renderCurrentView();
      });
      $(document).off("click.scp-nt", '[data-action="new-topic"]').on("click.scp-nt", '[data-action="new-topic"]', function(e) {
        e.preventDefault();
        if (window._scpPart2A && window._scpPart2A.openModal) {
        } else {
          var name = prompt("Topic name:");
          if (name && name.trim()) {
            var colors = ["#1a73e8", "#7c3aed", "#0d904f", "#e37400", "#d93025", "#0891b2"];
            var topic = { id: generateId("topic"), name: name.trim(), color: colors[Math.floor(Math.random() * colors.length)], description: "", seriesId: "", created: (/* @__PURE__ */ new Date()).toISOString() };
            S.data.topics = S.data.topics || [];
            S.data.topics.push(topic);
            logActivity("topic_created", "", "", "Created topic: " + topic.name);
            buildMaps();
            renderCurrentView();
            syncToTextarea();
            toast("Topic created", "success");
          }
        }
      });
      $(document).off("input.scp-as", "#scpActivitySearch").on("input.scp-as", "#scpActivitySearch", debounce(function() {
        S.activityFilter.search = $(this).val();
        renderCurrentView();
      }, 300));
      $(document).off("change.scp-at", "#scpActivityTypeFilter").on("change.scp-at", "#scpActivityTypeFilter", function() {
        S.activityFilter.type = $(this).val();
        renderCurrentView();
      });
    }
    function createNewPost(overrides) {
      overrides = overrides || {};
      var now = (/* @__PURE__ */ new Date()).toISOString();
      var defs = S.meta.settings && S.meta.settings.defaults || {};
      var post = {
        id: generateId("post"),
        title: overrides.title || "",
        type: overrides.type || defs.type || "image",
        status: "idea",
        priority: overrides.priority || defs.priority || "medium",
        topics: overrides.topics || (defs.topics || []).slice(),
        seriesId: overrides.seriesId || "",
        source: overrides.source || { type: "manual", research_session_id: "", research_idea_id: "", notes: "" },
        platforms: overrides.platforms || (defs.platforms || ["linkedin"]).slice(),
        research: { angles: [], selected_angle: "", angle_custom_input: "", hooks: [], selected_hook: "", hook_custom_input: "", notes: "" },
        content: { body: "", tone_id: overrides.tone_id || defs.tone_id || "", audience_id: overrides.audience_id || defs.audience_id || "", notes: "" },
        carousel: { slide_count: 0, slides: [] },
        video: { concept: "", script: "", duration_seconds: 60, format: "reel" },
        media: { prompts: [], config: { style_id: "", custom_instructions: "", brand_context_enabled: false } },
        platform_content: {
          linkedin: { enabled: false, body: "", notes: "" },
          instagram: { enabled: false, body: "", notes: "" },
          facebook: { enabled: false, body: "", notes: "" },
          youtube: { enabled: false, title: "", description: "", tags: [], notes: "" }
        },
        schedule: { date: "", time: "", timezone: "", published_urls: {} },
        performance: {},
        created_by: S.user.id || "",
        assigned_to: "",
        review_notes: "",
        created: now,
        updated: now
      };
      if (overrides.hook) post.content.body = overrides.hook;
      S.data.posts = S.data.posts || [];
      S.data.posts.unshift(post);
      logActivity("post_created", post.id, post.title || "New Post", "Post created (" + POST_TYPES[post.type].label + ")");
      buildMaps();
      S.selectedPostId = post.id;
      S.currentStep = "basics";
      if (S.currentView !== "posts") navigate("posts");
      else renderCurrentView();
      syncToTextarea();
      toast("Post created", "success");
      return post;
    }
    function savePostField(postId, field, value) {
      var post = S.postMap[postId || S.selectedPostId];
      if (!post) return;
      if (post[field] === value) return;
      var oldValue = post[field];
      post[field] = value;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      if (field === "status") {
        var oLbl = (POST_STATUSES[oldValue] || {}).label || oldValue;
        var nLbl = (POST_STATUSES[value] || {}).label || value;
        logActivity("post_status_changed", post.id, post.title, "Status: " + oLbl + " \u2192 " + nLbl);
      }
      buildMaps();
      syncToTextarea();
      renderCurrentView();
    }
    function logActivity(type, postId, postTitle, description) {
      S.activity = S.activity || [];
      S.activity.push({
        id: generateId("act"),
        type,
        post_id: postId || "",
        post_title: postTitle || "",
        description: description || "",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user_id: S.user.id || "",
        user_name: S.user.name || ""
      });
    }
    function syncToTextarea() {
      if (!S.$textarea || !S.$metaTextarea || !S.$activityTextarea) return;
      try {
        S.$textarea.val(JSON.stringify(S.data, null, 2)).trigger("change");
        S.$metaTextarea.val(JSON.stringify(S.meta, null, 2)).trigger("change");
        S.$activityTextarea.val(JSON.stringify(S.activity, null, 2)).trigger("change");
        S.dirty = true;
        updateSaveStatus("unsaved");
      } catch (e) {
        console.error("[SCP] Sync error:", e);
      }
    }
    function updateSaveStatus(status) {
      var $s = $("#scpSaveStatus");
      if (status === "saving") $s.text("Saving...").removeClass("scp-saved scp-synced scp-unsaved").addClass("scp-saving");
      else if (status === "saved") {
        $s.text("Saved").removeClass("scp-saving scp-synced scp-unsaved").addClass("scp-saved");
        S.dirty = false;
        S.lastSaved = /* @__PURE__ */ new Date();
      } else if (status === "synced") {
        $s.text("Synced").removeClass("scp-saving scp-saved scp-unsaved").addClass("scp-synced");
      } else $s.text("Unsaved").removeClass("scp-saving scp-saved scp-synced").addClass("scp-unsaved");
    }
    function startAutoSave() {
      if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
      S.autoSaveTimer = setInterval(function() {
        if (S.dirty) {
          syncToTextarea();
          updateSaveStatus("synced");
        }
      }, 3e4);
    }
    $(window).on("beforeunload", function(e) {
      if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
      if (S.dirty) {
        var msg = 'You have unsaved changes. Click "Save" to save to Drupal before leaving.';
        e.returnValue = msg;
        return msg;
      }
    });
    function toast(msg, type, dur) {
      type = type || "info";
      dur = dur || 3e3;
      var $c = $("#scpToasts");
      if (!$c.length) {
        $c = $('<div id="scpToasts" class="scp-toast-container"></div>');
        $("#scpApp").append($c);
      }
      var id = "toast_" + Date.now();
      var iconName = type === "success" ? "success" : type === "error" ? "error" : type === "warning" ? "warning" : "info";
      $c.append('<div class="scp-toast scp-toast-' + type + '" id="' + id + '"><span class="scp-toast-icon">' + icon(iconName) + '</span><span class="scp-toast-message">' + esc(msg) + '</span><button class="scp-toast-close" data-action="close-toast">&times;</button></div>');
      setTimeout(function() {
        $("#" + id).addClass("scp-toast-show");
      }, 10);
      setTimeout(function() {
        $("#" + id).removeClass("scp-toast-show");
        setTimeout(function() {
          $("#" + id).remove();
        }, 300);
      }, dur);
    }
    function evaluateAutoStatus(post) {
      if (!post) return null;
      var currentIdx = STATUS_ORDER.indexOf(post.status);
      if (currentIdx < 0) return null;
      var suggested = post.status;
      var r = post.research || {};
      if (STATUS_ORDER.indexOf("research") > currentIdx) {
        if (r.angles && r.angles.length > 0 || r.hooks && r.hooks.length > 0) {
          suggested = "research";
        }
      }
      var sugIdx = STATUS_ORDER.indexOf(suggested);
      if (STATUS_ORDER.indexOf("content_writing") > sugIdx) {
        if (r.selected_angle && r.selected_hook) {
          suggested = "content_writing";
        }
      }
      sugIdx = STATUS_ORDER.indexOf(suggested);
      var content = post.content || {};
      if (STATUS_ORDER.indexOf("media_prompts") > sugIdx || STATUS_ORDER.indexOf("platform_adapt") > sugIdx) {
        if (content.body && content.body.trim().length > 50) {
          if (post.type === "text") {
            if (STATUS_ORDER.indexOf("platform_adapt") > sugIdx) suggested = "platform_adapt";
          } else {
            if (STATUS_ORDER.indexOf("media_prompts") > sugIdx) suggested = "media_prompts";
          }
        }
      }
      sugIdx = STATUS_ORDER.indexOf(suggested);
      if (STATUS_ORDER.indexOf("platform_adapt") > sugIdx) {
        var prompts = post.media && post.media.prompts || [];
        var hasFinal = prompts.length > 0 && prompts.some(function(mp) {
          return mp.status === "final";
        });
        var hasVisualPlan = !!(post.media && post.media.visual_plan && post.media.visual_plan.visual_concept && post.media.visual_plan.visual_concept.scene);
        var hasCarouselPlans = !!(post.media && post.media.visual_plans && post.media.visual_plans.length > 0 && post.media.visual_plans[0].visual_concept);
        if (hasFinal || hasVisualPlan || hasCarouselPlans) suggested = "platform_adapt";
      }
      sugIdx = STATUS_ORDER.indexOf(suggested);
      if (STATUS_ORDER.indexOf("ready") > sugIdx) {
        var hasAdaptation = (post.platforms || []).some(function(pk) {
          var pc = (post.platform_content || {})[pk];
          if (pk === "youtube") return pc && pc.enabled && pc.title && pc.title.trim().length > 0;
          return pc && pc.enabled && pc.body && pc.body.trim().length > 0;
        });
        if (hasAdaptation) suggested = "ready";
      }
      sugIdx = STATUS_ORDER.indexOf(suggested);
      if (STATUS_ORDER.indexOf("scheduled") > sugIdx) {
        var sched = post.schedule || {};
        if (sched.date && sched.time) suggested = "scheduled";
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
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      logActivity("post_status_changed", post.id, post.title, oldLabel + " \u2192 " + newLabel + (reason ? " (" + reason + ")" : ""));
      toast("Auto-advanced to " + newLabel + (reason ? " \u2014 " + reason : ""), "success", 4e3);
      return true;
    }
    window._scpState = S;
    window._scpRender = renderCurrentView;
    window._scpNavigate = navigate;
    window._scpToast = toast;
    window._scpGenerateId = generateId;
    window._scpBuildMaps = buildMaps;
    window._scpSyncToTextarea = syncToTextarea;
    window._scpUpdateSaveStatus = updateSaveStatus;
    window._scpLogActivity = logActivity;
    window._scpFormatDate = formatDate;
    window._scpFormatDateShort = formatDateShort;
    window._scpFormatRelativeTime = formatRelativeTime;
    window._scpFormatNumber = formatNumber;
    window._scpFormatCharCount = formatCharCount;
    window._scpEsc = esc;
    window._scpIcon = icon;
    window._scpTruncate = truncate;
    window._scpDeepClone = deepClone;
    window._scpDebounce = debounce;
    window._scpIsEmpty = isEmpty;
    window._scpCountWords = countWords;
    window._scpCountChars = countChars;
    window._scpBadge = badge;
    window._scpStatusBadge = statusBadge;
    window._scpTypeBadge = typeBadge;
    window._scpPriorityBadge = priorityBadge;
    window._scpPlatformBadge = platformBadge;
    window._scpMediaPromptStatusBadge = mediaPromptStatusBadge;
    window._scpProgressBar = progressBar;
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
    window._scpEvaluateAutoStatus = evaluateAutoStatus;
    window._scpMaybeAdvanceStatus = maybeAdvanceStatus;
    window._scpGetImages = getImages;
    window._scpGetImageById = getImageById;
    window._scpGetAllImageTags = getAllImageTags;
    window._scpParseImageField = parseImageField;
    window._scpCreateNewPost = createNewPost;
    window._scpSavePostField = savePostField;
    function markSetupComplete() {
      S.meta.setup = S.meta.setup || {};
      S.meta.setup.firstRun = false;
      S.meta.setup.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      S.meta.setup.version = S.meta.setup.version || 1;
      logActivity("setup_completed", "", "", "Setup wizard completed");
      syncToTextarea();
    }
    function resetSetup() {
      S.meta.setup = S.meta.setup || {};
      S.meta.setup.firstRun = true;
      S.meta.setup.completedAt = "";
      syncToTextarea();
    }
    function isFirstRun() {
      return !!(S.meta.setup && S.meta.setup.firstRun);
    }
    window._scpMarkSetupComplete = markSetupComplete;
    window._scpResetSetup = resetSetup;
    window._scpIsFirstRun = isFirstRun;
    window._scpCleanAIText = cleanAIText;
    window._scpFormatContentForPreview = formatContentForPreview;
    window._scpParsePromptSections = parsePromptSections;
    window._scpConstants = {
      APP_VIEWS,
      POST_TYPES,
      PLATFORMS,
      POST_STATUSES,
      STATUS_ORDER,
      ACTIVE_STATUSES,
      WORKFLOW_GROUPS,
      GROUPING_OPTIONS,
      PIPELINE_STEPS,
      PRIORITY_LEVELS,
      ACTIVITY_TYPES,
      CARD_DENSITIES,
      MEDIA_PROMPT_STATUSES
    };
    console.log("[SCP] Part 1 loaded");
  })(jQuery, Drupal);

  // src/editing/scp-part2a.js
  (function($, Drupal2) {
    "use strict";
    var S, render, navigate, toast, generateId, buildMaps, syncToTextarea;
    var updateSaveStatus, esc, deepClone, icon, formatDate, formatRelativeTime;
    var truncate, statusBadge, typeBadge, priorityBadge, platformBadge, mediaPromptStatusBadge;
    var logActivity, countWords, countChars, formatCharCount, formatNumber;
    var maybeAdvanceStatus, resolveTopic, resolveTone, resolveAudience, resolveImageStyle;
    var getPlatformConfig, progressBar, badge;
    var cleanAIText, formatContentForPreview, parsePromptSections;
    var Constants;
    var _checkCount = 0;
    var checkInterval = setInterval(function() {
      _checkCount++;
      if (window._scpState && window._scpState.initialized) {
        clearInterval(checkInterval);
        initPart2A();
      } else if (_checkCount > 100) {
        clearInterval(checkInterval);
        console.error("[SCP] Part 2A: Timed out waiting for Part 1");
      }
    }, 100);
    function initPart2A() {
      console.log("[SCP] Initializing Part 2A...");
      S = window._scpState;
      render = window._scpRender;
      navigate = window._scpNavigate;
      toast = window._scpToast;
      generateId = window._scpGenerateId;
      buildMaps = window._scpBuildMaps;
      syncToTextarea = window._scpSyncToTextarea;
      updateSaveStatus = window._scpUpdateSaveStatus;
      esc = window._scpEsc;
      deepClone = window._scpDeepClone;
      icon = window._scpIcon;
      formatDate = window._scpFormatDate;
      formatRelativeTime = window._scpFormatRelativeTime;
      truncate = window._scpTruncate;
      formatNumber = window._scpFormatNumber;
      formatCharCount = window._scpFormatCharCount;
      statusBadge = window._scpStatusBadge;
      typeBadge = window._scpTypeBadge;
      priorityBadge = window._scpPriorityBadge;
      platformBadge = window._scpPlatformBadge;
      mediaPromptStatusBadge = window._scpMediaPromptStatusBadge;
      logActivity = window._scpLogActivity;
      countWords = window._scpCountWords;
      countChars = window._scpCountChars;
      badge = window._scpBadge;
      maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
      resolveTopic = window._scpResolveTopic;
      resolveTone = window._scpResolveTone;
      resolveAudience = window._scpResolveAudience;
      resolveImageStyle = window._scpResolveImageStyle;
      getPlatformConfig = window._scpGetPlatformConfig;
      progressBar = window._scpProgressBar;
      cleanAIText = window._scpCleanAIText;
      formatContentForPreview = window._scpFormatContentForPreview;
      parsePromptSections = window._scpParsePromptSections;
      Constants = window._scpConstants;
      window._scpAiSel = function(actionId) {
        if (window._scpPart2B && window._scpPart2B.renderInlinePicker) {
          return window._scpPart2B.renderInlinePicker(actionId);
        }
        return '<span class="scp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon("spinner") + "</span>";
      };
      var R = window._scpRenderers = window._scpRenderers || {};
      R.topicInput = renderTopicInput;
      R.socialComposer = renderSocialComposer;
      setupPart2AEvents();
      snapshot("Initial state");
      if (render) render();
      console.log("[SCP] Part 2A initialized");
    }
    var currentModal = null;
    function openModal(title, content, options) {
      options = options || {};
      closeModal();
      var size = options.size || "md";
      var html = '<div class="scp-modal-backdrop"><div class="scp-modal scp-modal-' + size + '">';
      html += '<div class="scp-modal-header"><h3>' + esc(title) + '</h3><button class="scp-btn-icon scp-modal-close" data-action="close-modal">' + icon("x") + "</button></div>";
      html += '<div class="scp-modal-body">' + content + "</div>";
      if (options.footer !== false) {
        html += '<div class="scp-modal-footer"><button class="scp-btn scp-btn-outline" data-action="close-modal">Cancel</button>';
        html += '<button class="scp-btn ' + (options.danger ? "scp-btn-danger" : "scp-btn-primary") + '" data-action="modal-save">' + (options.saveLabel || "Save") + "</button></div>";
      }
      html += "</div></div>";
      $("body").append(html);
      currentModal = options;
      setTimeout(function() {
        $(".scp-modal-backdrop").addClass("scp-modal-visible");
      }, 10);
    }
    function closeModal() {
      $(".scp-modal-backdrop").remove();
      currentModal = null;
    }
    function openConfirmDialog(opts) {
      var html = '<div class="scp-confirm-backdrop"><div class="scp-confirm-dialog"><h3>' + esc(opts.title || "Confirm") + "</h3><p>" + esc(opts.message || "Are you sure?") + "</p>";
      html += '<div class="scp-confirm-actions"><button class="scp-btn scp-btn-outline" data-action="confirm-cancel">Cancel</button>';
      html += '<button class="scp-btn ' + (opts.danger ? "scp-btn-danger" : "scp-btn-primary") + '" data-action="confirm-ok">' + esc(opts.confirmLabel || "Confirm") + "</button></div></div></div>";
      $("body").append(html);
      $(document).off("click.scp2a-cok").on("click.scp2a-cok", '[data-action="confirm-ok"]', function() {
        closeConfirmDialog();
        if (opts.onConfirm) opts.onConfirm();
      });
      $(document).off("click.scp2a-ccn").on("click.scp2a-ccn", '[data-action="confirm-cancel"]', function() {
        closeConfirmDialog();
      });
    }
    function closeConfirmDialog() {
      $(".scp-confirm-backdrop").remove();
      $(document).off("click.scp2a-cok click.scp2a-ccn");
    }
    function collectModalFields() {
      var data = {};
      $(".scp-modal-body [data-field]").each(function() {
        var $f = $(this);
        data[$f.data("field")] = $f.is(":checkbox") ? $f.is(":checked") : $f.val();
      });
      return data;
    }
    function snapshot(label) {
      S.undoStack = S.undoStack || [];
      S.undoStack.push({ label: label || "", data: deepClone(S.data), meta: deepClone(S.meta), activity: deepClone(S.activity) });
      if (S.undoStack.length > 50) S.undoStack.shift();
      S.redoStack = [];
    }
    function undo() {
      if (!S.undoStack || S.undoStack.length <= 1) {
        toast("Nothing to undo", "info");
        return;
      }
      S.redoStack = S.redoStack || [];
      S.redoStack.push(S.undoStack.pop());
      var prev = S.undoStack[S.undoStack.length - 1];
      S.data = deepClone(prev.data);
      if (prev.meta) S.meta = deepClone(prev.meta);
      if (prev.activity) S.activity = deepClone(prev.activity);
      buildMaps();
      render();
      syncToTextarea();
      toast("Undone", "info");
    }
    function redo() {
      if (!S.redoStack || S.redoStack.length === 0) {
        toast("Nothing to redo", "info");
        return;
      }
      var next = S.redoStack.pop();
      S.undoStack.push(next);
      S.data = deepClone(next.data);
      if (next.meta) S.meta = deepClone(next.meta);
      if (next.activity) S.activity = deepClone(next.activity);
      buildMaps();
      render();
      syncToTextarea();
      toast("Redone", "info");
    }
    function deletePost(postId) {
      var post = S.postMap[postId];
      if (!post) return;
      openConfirmDialog({
        title: "Delete Post",
        message: 'Delete "' + (post.title || "Untitled") + '"?',
        confirmLabel: "Delete",
        danger: true,
        onConfirm: function() {
          S.data.posts = (S.data.posts || []).filter(function(p) {
            return p.id !== postId;
          });
          if (S.selectedPostId === postId) S.selectedPostId = null;
          logActivity("post_deleted", postId, post.title, "Post deleted");
          snapshot("Delete post");
          buildMaps();
          render();
          syncToTextarea();
          toast("Post deleted", "success");
        }
      });
    }
    function duplicatePost(postId) {
      var post = S.postMap[postId];
      if (!post) return;
      var clone = deepClone(post);
      clone.id = generateId("post");
      clone.title = (clone.title || "") + " (copy)";
      clone.status = "idea";
      clone.created = (/* @__PURE__ */ new Date()).toISOString();
      clone.updated = clone.created;
      clone.schedule = { date: "", time: "", timezone: "", published_urls: {} };
      clone.performance = {};
      S.data.posts.unshift(clone);
      logActivity("post_created", clone.id, clone.title, "Post duplicated");
      snapshot("Duplicate post");
      buildMaps();
      S.selectedPostId = clone.id;
      S.currentStep = "basics";
      render();
      syncToTextarea();
      toast("Post duplicated", "success");
    }
    function promoteResearchIdea(sessionId, ideaId) {
      var session = S.researchMap[sessionId];
      if (!session) return;
      var idea = null;
      for (var i = 0; i < (session.results || []).length; i++) {
        if (session.results[i].id === ideaId) {
          idea = session.results[i];
          break;
        }
      }
      if (!idea) return;
      var defs = S.meta.settings && S.meta.settings.defaults || {};
      var post = window._scpCreateNewPost({
        title: idea.title || "",
        type: idea.type || defs.type || "image",
        platforms: idea.platforms && idea.platforms.length ? idea.platforms : defs.platforms || ["linkedin"],
        hook: idea.hook || "",
        source: { type: "research", research_session_id: sessionId, research_idea_id: ideaId, notes: "" }
      });
      if (post) {
        idea.promoted = true;
        idea.promoted_post_id = post.id;
        logActivity("post_promoted", post.id, post.title, "Promoted from research");
        snapshot("Promote idea");
        buildMaps();
        syncToTextarea();
      }
    }
    function openNewTopicModal() {
      var colors = ["#1a73e8", "#7c3aed", "#0d904f", "#e37400", "#d93025", "#0891b2", "#059669", "#be123c"];
      var html = '<div class="scp-editor-form">';
      html += '<div class="scp-form-group"><label>Topic Name</label><input type="text" class="scp-input" data-field="name" placeholder="e.g. Product Updates"></div>';
      html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" placeholder="What this topic represents..."></div>';
      html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
      for (var ci = 0; ci < colors.length; ci++) {
        html += '<button class="scp-color-swatch' + (ci === 0 ? " scp-color-swatch-active" : "") + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
      }
      html += '<input type="hidden" data-field="color" value="' + colors[0] + '">';
      html += "</div></div></div>";
      openModal("New Topic", html, {
        saveLabel: "Create Topic",
        onSave: function() {
          var fields = collectModalFields();
          if (!fields.name || !fields.name.trim()) {
            toast("Topic name is required", "warning");
            return;
          }
          var topic = { id: generateId("topic"), name: fields.name.trim(), color: fields.color || colors[0], description: fields.description || "", seriesId: "", created: (/* @__PURE__ */ new Date()).toISOString() };
          S.data.topics = S.data.topics || [];
          S.data.topics.push(topic);
          logActivity("topic_created", "", "", "Created topic: " + topic.name);
          snapshot("Create topic");
          buildMaps();
          closeModal();
          render();
          syncToTextarea();
          toast('Topic "' + topic.name + '" created', "success");
        }
      });
    }
    function editTopicModal(topicId) {
      var topic = S.topicMap[topicId];
      if (!topic) return;
      var colors = ["#1a73e8", "#7c3aed", "#0d904f", "#e37400", "#d93025", "#0891b2", "#059669", "#be123c"];
      var html = '<div class="scp-editor-form">';
      html += '<div class="scp-form-group"><label>Topic Name</label><input type="text" class="scp-input" data-field="name" value="' + esc(topic.name) + '"></div>';
      html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" value="' + esc(topic.description || "") + '"></div>';
      html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
      for (var ci = 0; ci < colors.length; ci++) {
        html += '<button class="scp-color-swatch' + (topic.color === colors[ci] ? " scp-color-swatch-active" : "") + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
      }
      html += '<input type="hidden" data-field="color" value="' + esc(topic.color) + '">';
      html += "</div></div></div>";
      openModal("Edit Topic", html, {
        saveLabel: "Save",
        onSave: function() {
          var fields = collectModalFields();
          if (!fields.name || !fields.name.trim()) {
            toast("Topic name is required", "warning");
            return;
          }
          topic.name = fields.name.trim();
          topic.color = fields.color || topic.color;
          topic.description = fields.description || "";
          logActivity("topic_updated", "", "", "Updated topic: " + topic.name);
          snapshot("Edit topic");
          buildMaps();
          closeModal();
          render();
          syncToTextarea();
          toast("Topic updated", "success");
        }
      });
    }
    function deleteTopic(topicId) {
      var topic = S.topicMap[topicId];
      if (!topic) return;
      openConfirmDialog({
        title: "Delete Topic",
        message: 'Delete "' + topic.name + '"? Posts will lose this topic.',
        confirmLabel: "Delete",
        danger: true,
        onConfirm: function() {
          S.data.topics = (S.data.topics || []).filter(function(t) {
            return t.id !== topicId;
          });
          (S.data.posts || []).forEach(function(p) {
            p.topics = (p.topics || []).filter(function(t) {
              return t !== topicId;
            });
          });
          if (S.selectedTopicId === topicId) S.selectedTopicId = null;
          logActivity("topic_deleted", "", "", "Deleted topic: " + topic.name);
          snapshot("Delete topic");
          buildMaps();
          render();
          syncToTextarea();
          toast("Topic deleted", "success");
        }
      });
    }
    var renderBasicsStep = window._scpRenderBasicsStep;
    var renderResearchStep = window._scpRenderResearchStep;
    var renderContentStep = window._scpRenderContentStep;
    var renderMediaStep = window._scpRenderMediaStep;
    var renderPlatformsStep = window._scpRenderPlatformsStep;
    var renderScheduleStep = window._scpRenderScheduleStep;
    function renderSocialComposer(id, content, options) {
      options = options || {};
      var charLimit = options.charLimit || 3e3;
      var label = options.label || "Post";
      var color = options.color || "var(--scp-primary)";
      var currentChars = countChars(content);
      var wordCount = countWords(content);
      var html = '<div class="scp-composer" data-composer-id="' + esc(id) + '">';
      html += '<div class="scp-composer-header" style="border-color:' + color + "20;background:" + color + '08">';
      html += '<div class="scp-composer-identity">';
      html += '<div class="scp-composer-avatar" style="background:' + color + '">' + icon(options.platform ? Constants.PLATFORMS[options.platform].icon : "pen-fancy") + "</div>";
      html += '<div><div class="scp-composer-name">' + esc(S.meta.workspace && S.meta.workspace.name || "Brand") + "</div>";
      html += '<div class="scp-composer-meta">' + esc(label) + " \u2022 Draft</div></div></div>";
      html += '<div class="scp-composer-stats">';
      html += '<div class="scp-composer-char-count">' + formatCharCount(currentChars, charLimit) + "</div>";
      if (wordCount > 0) html += '<span class="scp-composer-word-count">' + wordCount + " words</span>";
      html += "</div>";
      html += "</div>";
      html += '<div class="scp-composer-tabs">';
      html += '<button class="scp-composer-tab scp-composer-tab-active" data-action="composer-mode" data-mode="edit" data-composer="' + esc(id) + '">' + icon("edit") + " Edit</button>";
      html += '<button class="scp-composer-tab" data-action="composer-mode" data-mode="preview" data-composer="' + esc(id) + '">' + icon("eye") + " Preview</button>";
      html += "</div>";
      html += '<div class="scp-composer-body scp-composer-edit-mode" data-composer-panel="edit-' + esc(id) + '">';
      html += '<textarea class="scp-composer-textarea" data-composer-id="' + esc(id) + '" placeholder="Write your ' + esc(label.toLowerCase()) + ' here...\n\nInclude hook, body, CTA, and hashtags \u2014 all in one place.">' + esc(content) + "</textarea>";
      html += "</div>";
      html += '<div class="scp-composer-body scp-composer-preview-mode" data-composer-panel="preview-' + esc(id) + '" style="display:none">';
      html += '<div class="scp-composer-preview">';
      if (content && content.trim()) {
        html += formatContentForPreview(content);
      } else {
        html += '<span class="scp-text-muted">Write content above to see preview</span>';
      }
      html += "</div></div>";
      html += '<div class="scp-composer-footer">';
      html += '<div class="scp-composer-tools">';
      html += '<button class="scp-composer-tool" title="Bold">' + icon("bold") + "</button>";
      html += '<button class="scp-composer-tool" title="Italic">' + icon("italic") + "</button>";
      html += '<button class="scp-composer-tool" title="Emoji">' + icon("face-smile") + "</button>";
      html += '<button class="scp-composer-tool" title="Hashtag">' + icon("hashtag") + "</button>";
      html += '<button class="scp-composer-tool" title="Mention">' + icon("at") + "</button>";
      html += "</div>";
      html += '<div class="scp-composer-ai-btns">';
      html += '<button class="scp-btn scp-btn-ai scp-btn-sm" data-action="ai-write-content" data-composer="' + esc(id) + '">' + icon("sparkles") + " AI Write</button>";
      html += window._scpAiSel ? window._scpAiSel("ai-write-content") : "";
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="ai-improve-content" data-composer="' + esc(id) + '">Improve</button>';
      html += "</div></div>";
      html += "</div>";
      return html;
    }
    function renderTopicInput(topicIds, postId) {
      var html = '<div class="scp-topic-input" data-post-id="' + esc(postId || "") + '">';
      html += '<div class="scp-topic-chips">';
      for (var i = 0; i < topicIds.length; i++) {
        var topic = resolveTopic(topicIds[i]);
        if (topic) {
          html += '<span class="scp-topic-input-chip" style="background:' + topic.color + "15;color:" + topic.color + ";border-color:" + topic.color + '30">';
          html += esc(topic.name) + ' <button class="scp-topic-remove" data-action="remove-post-topic" data-topic-id="' + esc(topic.id) + '" data-post-id="' + esc(postId) + '">&times;</button></span>';
        }
      }
      var availTopics = (S.data.topics || []).filter(function(t) {
        return topicIds.indexOf(t.id) < 0;
      });
      if (availTopics.length > 0) {
        html += '<select class="scp-select scp-select-sm scp-topic-add-select" data-post-id="' + esc(postId) + '">';
        html += '<option value="">+ Add topic</option>';
        for (var ai = 0; ai < availTopics.length; ai++) html += '<option value="' + esc(availTopics[ai].id) + '">' + esc(availTopics[ai].name) + "</option>";
        html += "</select>";
      }
      html += "</div></div>";
      return html;
    }
    var OUTPUT_SCHEMAS = {
      image_visual_plan: {
        id: "image_visual_plan",
        label: "Visual Content Plan",
        icon: "image",
        sections: [
          {
            key: "visual_concept",
            label: "Visual Concept",
            icon: "eye",
            color: "#1a73e8",
            expanded: true,
            description: "What the audience sees and feels",
            fields: [
              { key: "scene", label: "Scene / Subject", type: "textarea", rows: 2, placeholder: "Describe what the image shows\u2026" },
              { key: "emotion", label: "Emotion / Feeling", type: "text", placeholder: "What feeling should this evoke?" },
              { key: "message_delivered", label: "Core Message", type: "text", placeholder: "What does the viewer take away?" }
            ]
          },
          {
            key: "text_overlays",
            label: "Text on Image",
            icon: "font",
            color: "#7c3aed",
            expanded: true,
            description: "Text that appears ON the image",
            fields: [
              { key: "headline", label: "Headline", type: "text", placeholder: "Primary text overlay" },
              { key: "subtext", label: "Subtext", type: "text", placeholder: "Supporting text (optional)" },
              { key: "cta", label: "CTA", type: "text", placeholder: "Call to action text" }
            ]
          },
          {
            key: "color_mood",
            label: "Color & Mood",
            icon: "palette",
            color: "#e37400",
            expanded: false,
            fields: [
              { key: "palette", label: "Color Palette", type: "text", placeholder: "Dominant colors and transitions" },
              { key: "mood", label: "Mood", type: "text", placeholder: "Overall emotional tone" },
              { key: "contrast", label: "Contrast", type: "text", placeholder: "Contrast approach for readability" }
            ]
          },
          {
            key: "layout",
            label: "Layout Direction",
            icon: "layout-grid",
            color: "#0891b2",
            expanded: false,
            fields: [
              { key: "composition", label: "Composition", type: "text", placeholder: "How elements are arranged" },
              { key: "focal_point", label: "Focal Point", type: "text", placeholder: "Where the eye goes first" },
              { key: "text_placement", label: "Text Placement", type: "text", placeholder: "Where text overlays sit" }
            ]
          },
          {
            key: "_meta",
            label: "Technical",
            icon: "gear",
            color: "#80868b",
            expanded: false,
            fields: [
              { key: "style_notes", label: "Style Notes", type: "text", placeholder: "Overall style direction" },
              { key: "generation_prompt", label: "Generation Prompt", type: "textarea", rows: 4, placeholder: "Technical prompt for AI image generators", mono: true }
            ]
          }
        ],
        exports: ["plain", "json", "markdown"]
      },
      video_script: {
        id: "video_script",
        label: "Video Script",
        icon: "video",
        sections: [
          {
            key: "hook",
            label: "Hook",
            icon: "bolt",
            color: "#d93025",
            expanded: true,
            description: "The scroll-stopping opening",
            fields: [
              { key: "voiceover", label: "Voiceover", type: "textarea", rows: 2, placeholder: "Spoken words\u2026" },
              { key: "visual", label: "Visual / Shot", type: "text", placeholder: "What the viewer sees" },
              { key: "on_screen_text", label: "On-Screen Text", type: "text", placeholder: "Text overlay" },
              { key: "duration_seconds", label: "Duration", type: "number", suffix: "s", placeholder: "3" },
              { key: "analysis", label: "Hook Analysis", type: "textarea", rows: 2, placeholder: "Why this opening works\u2026", muted: true }
            ]
          },
          {
            key: "body",
            label: "Main Body",
            icon: "pen-fancy",
            color: "#1a73e8",
            expanded: true,
            description: "The core content sections",
            isList: true,
            fields: [
              { key: "section", label: "Section Name", type: "text", placeholder: "e.g. Problem, Solution, Proof" },
              { key: "voiceover", label: "Voiceover", type: "textarea", rows: 2, placeholder: "Spoken words\u2026" },
              { key: "visual", label: "Visual / Shot", type: "text", placeholder: "What the viewer sees" },
              { key: "on_screen_text", label: "On-Screen Text", type: "text", placeholder: "Text overlay" },
              { key: "duration_seconds", label: "Duration", type: "number", suffix: "s", placeholder: "10" }
            ]
          },
          {
            key: "outro",
            label: "Outro & CTA",
            icon: "rocket",
            color: "#0d904f",
            expanded: true,
            description: "The closing and call to action",
            fields: [
              { key: "voiceover", label: "Voiceover", type: "textarea", rows: 2, placeholder: "Closing words\u2026" },
              { key: "visual", label: "Visual / Shot", type: "text", placeholder: "Closing visual" },
              { key: "on_screen_text", label: "On-Screen Text", type: "text", placeholder: "Final text overlay" },
              { key: "cta", label: "CTA", type: "text", placeholder: "e.g. Follow + Save" },
              { key: "duration_seconds", label: "Duration", type: "number", suffix: "s", placeholder: "5" }
            ]
          },
          {
            key: "_summary",
            label: "Summary",
            icon: "info",
            color: "#80868b",
            expanded: false,
            fields: [
              { key: "total_duration", label: "Total Duration", type: "number", suffix: "s", readOnly: true },
              { key: "music_suggestion", label: "Music / Sound", type: "text", placeholder: "Music mood suggestion" }
            ]
          }
        ],
        exports: ["plain", "json", "markdown", "voiceover"]
      },
      carousel_visual_plan: {
        id: "carousel_visual_plan",
        label: "Carousel Visual Plan",
        icon: "images",
        isSequence: true,
        sequenceLabel: "Slide",
        sections: [
          {
            key: "visual_concept",
            label: "Visual Concept",
            icon: "eye",
            color: "#1a73e8",
            expanded: true,
            fields: [
              { key: "scene", label: "Scene / Subject", type: "textarea", rows: 2, placeholder: "What this slide shows\u2026" },
              { key: "message_delivered", label: "Slide Message", type: "text", placeholder: "What this slide communicates" }
            ]
          },
          {
            key: "text_overlays",
            label: "Text on Slide",
            icon: "font",
            color: "#7c3aed",
            expanded: true,
            fields: [
              { key: "headline", label: "Headline", type: "text", placeholder: "Primary text" },
              { key: "subtext", label: "Subtext", type: "text", placeholder: "Supporting text" }
            ]
          },
          {
            key: "_meta",
            label: "Style",
            icon: "palette",
            color: "#80868b",
            expanded: false,
            fields: [
              { key: "generation_prompt", label: "Generation Prompt", type: "textarea", rows: 3, mono: true }
            ]
          }
        ],
        exports: ["plain", "json", "markdown"]
      }
    };
    function renderStructuredOutput(data, schemaId, options) {
      var schema = OUTPUT_SCHEMAS[schemaId];
      if (!schema || !data) return '<div class="scp-empty-state scp-empty-state--compact"><p>No structured data available.</p></div>';
      options = options || {};
      var oid = options.outputId || generateId("aio");
      var readOnly = !!options.readOnly;
      var html = '<div class="scp-aio" data-aio-id="' + esc(oid) + '" data-schema="' + esc(schemaId) + '" data-post-id="' + esc(options.postId || "") + '">';
      html += renderExportToolbar(data, schema, oid);
      if (schema.isSequence && Array.isArray(data)) {
        for (var si = 0; si < data.length; si++) {
          html += '<div class="scp-aio-sequence-item" data-seq-index="' + si + '">';
          html += '<div class="scp-aio-sequence-header">';
          html += '<span class="scp-aio-sequence-num">' + (si + 1) + "</span>";
          html += '<span class="scp-aio-sequence-label">' + esc(schema.sequenceLabel || "Item") + " " + (si + 1) + "</span>";
          if (data[si].text_overlays && data[si].text_overlays.headline) html += '<span class="scp-text-sm scp-text-muted"> \u2014 ' + esc(truncate(data[si].text_overlays.headline, 40)) + "</span>";
          html += "</div>";
          html += renderSectionsForItem(data[si], schema.sections, oid + "_s" + si, readOnly);
          html += "</div>";
        }
      } else {
        html += renderSectionsForItem(data, schema.sections, oid, readOnly);
      }
      html += "</div>";
      return html;
    }
    function renderSectionsForItem(data, sections, pathPrefix, readOnly) {
      var html = "";
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        var secPath = pathPrefix + "." + sec.key;
        var secData = sec.key === "_meta" || sec.key === "_summary" ? data : data[sec.key] || {};
        var isExpanded = sec.expanded !== false;
        if (sec.isList && Array.isArray(secData)) {
          html += '<div class="scp-aio-section scp-aio-section-list" data-section="' + esc(sec.key) + '">';
          html += renderSectionHeader(sec, isExpanded, secData.length + " section" + (secData.length !== 1 ? "s" : ""));
          html += '<div class="scp-aio-section-body' + (isExpanded ? "" : " scp-aio-collapsed") + '" data-aio-body="' + esc(secPath) + '">';
          for (var li = 0; li < secData.length; li++) {
            var itemLabel = secData[li].section || sec.label + " " + (li + 1);
            html += '<div class="scp-aio-list-card" data-list-index="' + li + '">';
            html += '<div class="scp-aio-list-card-header" data-action="aio-toggle-list-item" data-path="' + esc(secPath + "." + li) + '">';
            html += '<span class="scp-aio-list-num">' + (li + 1) + "</span>";
            html += '<span class="scp-aio-list-label">' + esc(itemLabel) + "</span>";
            if (secData[li].duration_seconds) html += '<span class="scp-aio-duration">' + secData[li].duration_seconds + "s</span>";
            html += '<span class="scp-aio-chevron">' + icon("chevron-down") + "</span>";
            html += "</div>";
            html += '<div class="scp-aio-list-card-body">';
            html += renderFieldSet(sec.fields, secData[li], secPath + "." + li, readOnly);
            html += "</div></div>";
          }
          html += "</div></div>";
          continue;
        }
        html += '<div class="scp-aio-section" data-section="' + esc(sec.key) + '">';
        html += renderSectionHeader(sec, isExpanded, null);
        html += '<div class="scp-aio-section-body' + (isExpanded ? "" : " scp-aio-collapsed") + '" data-aio-body="' + esc(secPath) + '">';
        if (sec.description) html += '<p class="scp-aio-section-desc">' + esc(sec.description) + "</p>";
        html += renderFieldSet(sec.fields, secData, secPath, readOnly);
        html += "</div></div>";
      }
      return html;
    }
    function renderSectionHeader(sec, isExpanded, badge_text) {
      var html = '<div class="scp-aio-section-header" data-action="aio-toggle-section" data-section="' + esc(sec.key) + '">';
      html += '<div class="scp-aio-section-title">';
      html += '<span class="scp-aio-section-icon" style="color:' + (sec.color || "var(--scp-primary)") + '">' + icon(sec.icon || "circle") + "</span>";
      html += "<strong>" + esc(sec.label) + "</strong>";
      if (badge_text) html += '<span class="scp-aio-section-badge">' + esc(badge_text) + "</span>";
      html += "</div>";
      html += '<span class="scp-aio-chevron">' + icon(isExpanded ? "chevron-up" : "chevron-down") + "</span>";
      html += "</div>";
      return html;
    }
    function renderFieldSet(fields, data, pathPrefix, readOnly) {
      var html = '<div class="scp-aio-fields">';
      for (var fi = 0; fi < fields.length; fi++) {
        var field = fields[fi];
        var value = data ? data[field.key] !== void 0 ? data[field.key] : "" : "";
        var fieldPath = pathPrefix + "." + field.key;
        html += '<div class="scp-aio-field' + (field.muted ? " scp-aio-field-muted" : "") + '" data-field-key="' + esc(field.key) + '">';
        html += '<label class="scp-aio-field-label">' + esc(field.label);
        if (field.suffix) html += ' <span class="scp-aio-field-suffix">(' + esc(field.suffix) + ")</span>";
        html += "</label>";
        if (readOnly || field.readOnly) {
          if (field.type === "textarea") {
            html += '<div class="scp-aio-field-value scp-aio-field-value-multi">' + (value ? esc(String(value)).replace(/\n/g, "<br>") : '<span class="scp-text-muted">\u2014</span>') + "</div>";
          } else {
            html += '<div class="scp-aio-field-value">' + (value ? esc(String(value)) + (field.suffix ? " " + esc(field.suffix) : "") : '<span class="scp-text-muted">\u2014</span>') + "</div>";
          }
        } else {
          if (field.type === "textarea") {
            html += '<textarea class="scp-aio-input scp-aio-textarea' + (field.mono ? " scp-aio-mono" : "") + '" data-aio-path="' + esc(fieldPath) + '" rows="' + (field.rows || 2) + '" placeholder="' + esc(field.placeholder || "") + '">' + esc(String(value)) + "</textarea>";
          } else if (field.type === "number") {
            html += '<input type="number" class="scp-aio-input scp-aio-input-number" data-aio-path="' + esc(fieldPath) + '" value="' + esc(String(value)) + '" placeholder="' + esc(field.placeholder || "") + '">';
          } else {
            html += '<input type="text" class="scp-aio-input" data-aio-path="' + esc(fieldPath) + '" value="' + esc(String(value)) + '" placeholder="' + esc(field.placeholder || "") + '">';
          }
        }
        html += "</div>";
      }
      html += "</div>";
      return html;
    }
    function renderExportToolbar(data, schema, oid) {
      var exports = schema.exports || ["plain", "json"];
      var html = '<div class="scp-aio-export-toolbar" data-aio-id="' + esc(oid) + '">';
      html += '<span class="scp-aio-export-label">' + icon("download") + " Export:</span>";
      if (exports.indexOf("plain") > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="plain" data-aio-id="' + esc(oid) + '">Plain Text</button>';
      if (exports.indexOf("json") > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="json" data-aio-id="' + esc(oid) + '">JSON</button>';
      if (exports.indexOf("markdown") > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="markdown" data-aio-id="' + esc(oid) + '">Markdown</button>';
      if (exports.indexOf("voiceover") > -1) html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="aio-export" data-format="voiceover" data-aio-id="' + esc(oid) + '">' + icon("play") + " Voiceover Only</button>";
      html += "</div>";
      return html;
    }
    function exportStructuredOutput(data, schemaId, format) {
      var schema = OUTPUT_SCHEMAS[schemaId];
      if (!schema || !data) return "";
      switch (format) {
        case "json":
          return JSON.stringify(data, null, 2);
        case "markdown":
          return _exportMarkdown(data, schema);
        case "voiceover":
          return _exportVoiceover(data, schema);
        default:
          return _exportPlainText(data, schema);
      }
    }
    function _exportPlainText(data, schema) {
      var lines = [];
      if (schema.isSequence && Array.isArray(data)) {
        for (var si = 0; si < data.length; si++) {
          lines.push("--- " + (schema.sequenceLabel || "Item") + " " + (si + 1) + " ---");
          _flattenSections(data[si], schema.sections, lines, "");
          lines.push("");
        }
      } else {
        _flattenSections(data, schema.sections, lines, "");
      }
      return lines.join("\n").trim();
    }
    function _flattenSections(data, sections, lines, indent) {
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        var secData = sec.key === "_meta" || sec.key === "_summary" ? data : data[sec.key] || {};
        if (sec.isList && Array.isArray(secData)) {
          lines.push(indent + sec.label.toUpperCase() + ":");
          for (var li = 0; li < secData.length; li++) {
            lines.push(indent + "  [" + (secData[li].section || sec.label + " " + (li + 1)) + "]");
            _flattenFields(sec.fields, secData[li], lines, indent + "  ");
          }
        } else {
          lines.push(indent + sec.label.toUpperCase() + ":");
          _flattenFields(sec.fields, secData, lines, indent + "  ");
        }
      }
    }
    function _flattenFields(fields, data, lines, indent) {
      for (var fi = 0; fi < fields.length; fi++) {
        var f = fields[fi];
        var v = data ? data[f.key] : "";
        if (v !== "" && v !== void 0 && v !== null) {
          lines.push(indent + f.label + ": " + String(v));
        }
      }
    }
    function _exportMarkdown(data, schema) {
      var lines = ["# " + schema.label, ""];
      if (schema.isSequence && Array.isArray(data)) {
        for (var si = 0; si < data.length; si++) {
          lines.push("## " + (schema.sequenceLabel || "Item") + " " + (si + 1));
          _mdSections(data[si], schema.sections, lines);
          lines.push("");
        }
      } else {
        _mdSections(data, schema.sections, lines);
      }
      return lines.join("\n").trim();
    }
    function _mdSections(data, sections, lines) {
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        var secData = sec.key === "_meta" || sec.key === "_summary" ? data : data[sec.key] || {};
        if (sec.isList && Array.isArray(secData)) {
          lines.push("### " + sec.label);
          for (var li = 0; li < secData.length; li++) {
            lines.push("#### " + (secData[li].section || sec.label + " " + (li + 1)));
            _mdFields(sec.fields, secData[li], lines);
          }
        } else {
          lines.push("### " + sec.label);
          _mdFields(sec.fields, secData, lines);
        }
        lines.push("");
      }
    }
    function _mdFields(fields, data, lines) {
      for (var fi = 0; fi < fields.length; fi++) {
        var f = fields[fi];
        var v = data ? data[f.key] : "";
        if (v !== "" && v !== void 0 && v !== null) {
          lines.push("**" + f.label + ":** " + String(v));
        }
      }
    }
    function _exportVoiceover(data, schema) {
      var lines = [];
      if (data.hook && data.hook.voiceover) lines.push("[HOOK] " + data.hook.voiceover);
      if (data.body && Array.isArray(data.body)) {
        for (var i = 0; i < data.body.length; i++) {
          if (data.body[i].voiceover) lines.push("[" + (data.body[i].section || "Body " + (i + 1)).toUpperCase() + "] " + data.body[i].voiceover);
        }
      }
      if (data.outro && data.outro.voiceover) lines.push("[OUTRO] " + data.outro.voiceover);
      return lines.join("\n\n");
    }
    function collectStructuredOutputData(oid) {
      var $aio = $('[data-aio-id="' + oid + '"]').first();
      if (!$aio.length) return null;
      var schemaId = $aio.data("schema");
      var schema = OUTPUT_SCHEMAS[schemaId];
      if (!schema) return null;
      var data = {};
      $aio.find(".scp-aio-input").each(function() {
        var path = $(this).data("aio-path");
        if (!path) return;
        var relativePath = path.replace(new RegExp("^" + oid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[._]?"), "");
        var val = $(this).is('input[type="number"]') ? parseFloat($(this).val()) || 0 : $(this).val();
        _setByPath(data, relativePath, val);
      });
      return data;
    }
    function _setByPath(obj, path, value) {
      var parts = path.split(".");
      var target = obj;
      for (var i = 0; i < parts.length - 1; i++) {
        var part = parts[i];
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
    function setupAIOEvents() {
      $(document).off("click.scp-aio-ts", '[data-action="aio-toggle-section"]').on("click.scp-aio-ts", '[data-action="aio-toggle-section"]', function(e) {
        e.preventDefault();
        var $header = $(this);
        var $body = $header.next(".scp-aio-section-body");
        var isCollapsed = $body.hasClass("scp-aio-collapsed");
        $body.toggleClass("scp-aio-collapsed");
        $header.find(".scp-aio-chevron").html(icon(isCollapsed ? "chevron-up" : "chevron-down"));
      });
      $(document).off("click.scp-aio-tli", '[data-action="aio-toggle-list-item"]').on("click.scp-aio-tli", '[data-action="aio-toggle-list-item"]', function(e) {
        e.preventDefault();
        var $body = $(this).next(".scp-aio-list-card-body");
        $body.toggleClass("scp-aio-collapsed");
        $(this).find(".scp-aio-chevron").html(icon($body.hasClass("scp-aio-collapsed") ? "chevron-down" : "chevron-up"));
      });
      $(document).off("blur.scp-aio-fe", ".scp-aio-input").on("blur.scp-aio-fe", ".scp-aio-input", function() {
        var path = $(this).data("aio-path");
        if (!path) return;
        var $aio = $(this).closest(".scp-aio");
        var postId = $aio.data("post-id");
        if (!postId || !S.postMap[postId]) return;
        var val = $(this).is('input[type="number"]') ? parseFloat($(this).val()) || 0 : $(this).val();
        if (window._scpAIOSaveField) window._scpAIOSaveField(postId, path, val);
      });
      $(document).off("click.scp-aio-exp", '[data-action="aio-export"]').on("click.scp-aio-exp", '[data-action="aio-export"]', function(e) {
        e.preventDefault();
        var format = $(this).data("format");
        var oid = $(this).data("aio-id");
        var $aio = $('[data-aio-id="' + oid + '"]').first();
        var schemaId = $aio.data("schema");
        var currentData = collectStructuredOutputData(oid);
        if (!currentData) {
          toast("No data to export", "warning");
          return;
        }
        var output = exportStructuredOutput(currentData, schemaId, format);
        if (output) {
          navigator.clipboard.writeText(output).then(function() {
            var formatLabel = { plain: "Plain text", json: "JSON", markdown: "Markdown", voiceover: "Voiceover script" };
            toast((formatLabel[format] || format) + " copied to clipboard!", "success");
          });
        }
      });
    }
    function setupPart2AEvents() {
      $(document).off("click.scp2a-cm", '[data-action="close-modal"]').on("click.scp2a-cm", '[data-action="close-modal"]', function(e) {
        e.preventDefault();
        closeModal();
      });
      $(document).off("click.scp2a-ms", '[data-action="modal-save"]').on("click.scp2a-ms", '[data-action="modal-save"]', function(e) {
        e.preventDefault();
        if (currentModal && currentModal.onSave) currentModal.onSave();
      });
      $(document).off("click.scp2a-mb", ".scp-modal-backdrop").on("click.scp2a-mb", ".scp-modal-backdrop", function(e) {
        if ($(e.target).hasClass("scp-modal-backdrop")) closeModal();
      });
      $(document).off("click.scp2a-cp", '[data-action="pick-color"]').on("click.scp2a-cp", '[data-action="pick-color"]', function(e) {
        e.preventDefault();
        var color = $(this).data("color");
        $(this).siblings(".scp-color-swatch").removeClass("scp-color-swatch-active");
        $(this).addClass("scp-color-swatch-active");
        $(this).siblings('input[data-field="color"]').val(color);
      });
      $(document).off("click.scp2a-nt", '[data-action="new-topic"]').on("click.scp2a-nt", '[data-action="new-topic"]', function(e) {
        e.preventDefault();
        openNewTopicModal();
      });
      $(document).off("click.scp2a-et", '[data-action="edit-topic"]').on("click.scp2a-et", '[data-action="edit-topic"]', function(e) {
        e.preventDefault();
        editTopicModal($(this).data("id"));
      });
      $(document).off("click.scp2a-dt", '[data-action="delete-topic"]').on("click.scp2a-dt", '[data-action="delete-topic"]', function(e) {
        e.preventDefault();
        deleteTopic($(this).data("id"));
      });
      $(document).off("click.scp2a-spt", '[data-action="set-post-type"]').on("click.scp2a-spt", '[data-action="set-post-type"]', function(e) {
        e.preventDefault();
        var type = $(this).data("type");
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        post.type = type;
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        snapshot("Change type");
        buildMaps();
        syncToTextarea();
        render();
      });
      $(document).off("change.scp2a-plc", ".scp-platform-check").on("change.scp2a-plc", ".scp-platform-check", function() {
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        var pk = $(this).data("platform");
        var checked = $(this).is(":checked");
        post.platforms = post.platforms || [];
        if (checked && post.platforms.indexOf(pk) < 0) post.platforms.push(pk);
        else if (!checked) post.platforms = post.platforms.filter(function(p) {
          return p !== pk;
        });
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
        render();
      });
      $(document).off("blur.scp2a-bf", ".scp-basics-field").on("blur.scp2a-bf", ".scp-basics-field", function() {
        saveBasicsField($(this));
      });
      $(document).off("change.scp2a-bfc", "select.scp-basics-field").on("change.scp2a-bfc", "select.scp-basics-field", function() {
        saveBasicsField($(this));
      });
      $(document).off("change.scp2a-cmf", ".scp-content-meta-field").on("change.scp2a-cmf", ".scp-content-meta-field", function() {
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        var path = $(this).data("path");
        var val = $(this).val();
        setNestedValue(post, path, val);
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
      });
      $(document).off("change.scp2a-ta", ".scp-topic-add-select").on("change.scp2a-ta", ".scp-topic-add-select", function() {
        var topicId = $(this).val();
        var postId = $(this).data("post-id");
        if (!topicId || !postId) return;
        var post = S.postMap[postId];
        if (!post) return;
        post.topics = post.topics || [];
        if (post.topics.indexOf(topicId) < 0) {
          post.topics.push(topicId);
          post.updated = (/* @__PURE__ */ new Date()).toISOString();
          syncToTextarea();
          render();
        }
      });
      $(document).off("click.scp2a-tr", '[data-action="remove-post-topic"]').on("click.scp2a-tr", '[data-action="remove-post-topic"]', function(e) {
        e.preventDefault();
        var topicId = $(this).data("topic-id");
        var postId = $(this).data("post-id");
        var post = S.postMap[postId];
        if (!post) return;
        post.topics = (post.topics || []).filter(function(t) {
          return t !== topicId;
        });
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
        render();
      });
      $(document).off("change.scp2a-sa", '[data-action="select-angle"]').on("change.scp2a-sa", '[data-action="select-angle"]', function() {
        saveAngleSelection(parseInt($(this).data("index"), 10));
      });
      $(document).off("change.scp2a-sh", '[data-action="select-hook"]').on("change.scp2a-sh", '[data-action="select-hook"]', function() {
        saveHookSelection(parseInt($(this).data("index"), 10));
      });
      $(document).off("click.scp2a-aam", '[data-action="add-angle-manual"]').on("click.scp2a-aam", '[data-action="add-angle-manual"]', function(e) {
        e.preventDefault();
        addResearchItem("angle");
      });
      $(document).off("click.scp2a-ahm", '[data-action="add-hook-manual"]').on("click.scp2a-ahm", '[data-action="add-hook-manual"]', function(e) {
        e.preventDefault();
        addResearchItem("hook");
      });
      $(document).off("click.scp2a-ra", '[data-action="remove-angle"]').on("click.scp2a-ra", '[data-action="remove-angle"]', function(e) {
        e.preventDefault();
        removeResearchItem("angle", parseInt($(this).data("index"), 10));
      });
      $(document).off("click.scp2a-rh", '[data-action="remove-hook"]').on("click.scp2a-rh", '[data-action="remove-hook"]', function(e) {
        e.preventDefault();
        removeResearchItem("hook", parseInt($(this).data("index"), 10));
      });
      $(document).off("blur.scp2a-rn", ".scp-research-notes").on("blur.scp2a-rn", ".scp-research-notes", function() {
        saveResearchNotes($(this).val());
      });
      $(document).off("blur.scp2a-ac", ".scp-angle-custom").on("blur.scp2a-ac", ".scp-angle-custom", function() {
        saveResearchCustomInput("angle", $(this).val());
      });
      $(document).off("blur.scp2a-hc", ".scp-hook-custom").on("blur.scp2a-hc", ".scp-hook-custom", function() {
        saveResearchCustomInput("hook", $(this).val());
      });
      $(document).off("input.scp2a-ct", ".scp-composer-textarea").on("input.scp2a-ct", ".scp-composer-textarea", window._scpDebounce(function() {
        saveComposerContent($(this));
      }, 500));
      $(document).off("click.scp2a-cmt", '[data-action="composer-mode"]').on("click.scp2a-cmt", '[data-action="composer-mode"]', function(e) {
        e.preventDefault();
        var mode = $(this).data("mode");
        var composerId = $(this).data("composer");
        var $composer = $(this).closest(".scp-composer");
        $composer.find(".scp-composer-tab").removeClass("scp-composer-tab-active");
        $(this).addClass("scp-composer-tab-active");
        if (mode === "preview") {
          $composer.find('[data-composer-panel="edit-' + composerId + '"]').hide();
          var $preview = $composer.find('[data-composer-panel="preview-' + composerId + '"]');
          var content = $composer.find(".scp-composer-textarea").val() || "";
          $preview.find(".scp-composer-preview").html(
            content.trim() ? window._scpFormatContentForPreview ? window._scpFormatContentForPreview(content) : esc(content).replace(/\n/g, "<br>") : '<span class="scp-text-muted">Write content above to see preview</span>'
          );
          $preview.show();
        } else {
          $composer.find('[data-composer-panel="preview-' + composerId + '"]').hide();
          $composer.find('[data-composer-panel="edit-' + composerId + '"]').show();
          $composer.find(".scp-composer-textarea").focus();
        }
      });
      $(document).off("click.scp2a-tpv", '[data-action="toggle-single-prompt-view"]').on("click.scp2a-tpv", '[data-action="toggle-single-prompt-view"]', function(e) {
        e.preventDefault();
        var idx = $(this).data("index");
        var $visual = $('[data-prompt-view="visual-' + idx + '"]');
        var $raw = $('[data-prompt-view="raw-' + idx + '"]');
        if ($raw.is(":visible")) {
          $raw.hide();
          $visual.show();
          $(this).html(icon("edit") + " Edit Raw");
        } else {
          $visual.hide();
          $raw.show();
          $(this).html(icon("eye") + " Visual View");
        }
      });
      $(document).off("click.scp2a-tpvm", '[data-action="toggle-prompt-view-mode"]').on("click.scp2a-tpvm", '[data-action="toggle-prompt-view-mode"]', function(e) {
        e.preventDefault();
        var allVisual = $(".scp-prompt-visual:visible").length > 0;
        if (allVisual) {
          $(".scp-prompt-visual").hide();
          $(".scp-prompt-raw").show();
          $(this).html(icon("eye") + " Visual View");
        } else {
          $(".scp-prompt-card").each(function() {
            var $v = $(this).find(".scp-prompt-visual");
            var $r = $(this).find(".scp-prompt-raw");
            if ($v.length && $v.children().length > 0) {
              $v.show();
              $r.hide();
            }
          });
          $(this).html(icon("edit") + " Raw View");
        }
      });
      $(document).off("blur.scp2a-sf", ".scp-slide-field").on("blur.scp2a-sf", ".scp-slide-field", function() {
        saveSlideField($(this));
      });
      $(document).off("click.scp2a-ssc", '[data-action="set-slide-count"]').on("click.scp2a-ssc", '[data-action="set-slide-count"]', function(e) {
        e.preventDefault();
        setSlideCount(parseInt($(this).data("count"), 10));
      });
      $(document).off("blur.scp2a-vf", ".scp-video-field").on("blur.scp2a-vf", ".scp-video-field", function() {
        saveVideoField($(this));
      });
      $(document).off("click.scp2a-svd", '[data-action="set-video-duration"]').on("click.scp2a-svd", '[data-action="set-video-duration"]', function(e) {
        e.preventDefault();
        setVideoProperty("duration_seconds", parseInt($(this).data("duration"), 10));
      });
      $(document).off("click.scp2a-svf", '[data-action="set-video-format"]').on("click.scp2a-svf", '[data-action="set-video-format"]', function(e) {
        e.preventDefault();
        setVideoProperty("format", $(this).data("format"));
      });
      $(document).off("change.scp2a-mcf", ".scp-media-config-field").on("change.scp2a-mcf", ".scp-media-config-field", function() {
        saveMediaConfigField($(this));
      });
      $(document).off("blur.scp2a-mcfb", "textarea.scp-media-config-field").on("blur.scp2a-mcfb", "textarea.scp-media-config-field", function() {
        saveMediaConfigField($(this));
      });
      $(document).off("change.scp2a-mbt", ".scp-media-brand-toggle").on("change.scp2a-mbt", ".scp-media-brand-toggle", function() {
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        post.media = post.media || {};
        post.media.config = post.media.config || {};
        post.media.config.brand_context_enabled = $(this).is(":checked");
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
      });
      $(document).off("click.scp2a-cpr", '[data-action="copy-prompt"]').on("click.scp2a-cpr", '[data-action="copy-prompt"]', function(e) {
        e.preventDefault();
        var idx = parseInt($(this).data("index"), 10);
        var $ta = $('.scp-prompt-text[data-prompt-index="' + idx + '"]');
        if ($ta.length) navigator.clipboard.writeText($ta.val()).then(function() {
          toast("Prompt copied!", "success");
        });
      });
      $(document).off("click.scp2a-cap", '[data-action="copy-all-prompts"]').on("click.scp2a-cap", '[data-action="copy-all-prompts"]', function(e) {
        e.preventDefault();
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post || !post.media) return;
        var all = (post.media.prompts || []).map(function(mp, i) {
          var text = "--- " + (mp.label || "Prompt " + (i + 1)) + " ---\n" + (mp.prompt_text || "");
          if (mp.negative_prompt) text += "\n\nNegative: " + mp.negative_prompt;
          if (mp.reference_urls && mp.reference_urls.length) text += "\n\nReferences:\n" + mp.reference_urls.join("\n");
          return text;
        }).join("\n\n");
        navigator.clipboard.writeText(all).then(function() {
          toast("All prompts copied!", "success");
        });
      });
      $(document).off("click.scp2a-tps", '[data-action="toggle-prompt-status"]').on("click.scp2a-tps", '[data-action="toggle-prompt-status"]', function(e) {
        e.preventDefault();
        var idx = parseInt($(this).data("index"), 10);
        var status = $(this).data("status");
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post || !post.media || !post.media.prompts[idx]) return;
        post.media.prompts[idx].status = status;
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        snapshot("Toggle prompt status");
        if (maybeAdvanceStatus) maybeAdvanceStatus(post, "prompt " + status);
        buildMaps();
        syncToTextarea();
        render();
      });
      $(document).off("blur.scp2a-pt", ".scp-prompt-text").on("blur.scp2a-pt", ".scp-prompt-text", function() {
        var idx = parseInt($(this).data("prompt-index"), 10);
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post || !post.media || !post.media.prompts[idx]) return;
        post.media.prompts[idx].prompt_text = $(this).val();
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
      });
      $(document).off("blur.scp2a-pf", ".scp-platform-field").on("blur.scp2a-pf", ".scp-platform-field", function() {
        savePlatformField($(this));
      });
      $(document).off("change.scp2a-pe", ".scp-platform-enable-check").on("change.scp2a-pe", ".scp-platform-enable-check", function() {
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        var pk = $(this).data("platform");
        var enabled = $(this).is(":checked");
        post.platform_content = post.platform_content || {};
        post.platform_content[pk] = post.platform_content[pk] || {};
        post.platform_content[pk].enabled = enabled;
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        if (maybeAdvanceStatus) maybeAdvanceStatus(post, "platform enabled");
        buildMaps();
        syncToTextarea();
        render();
      });
      $(document).off("click.scp2a-ap", '[data-action="add-platform"]').on("click.scp2a-ap", '[data-action="add-platform"]', function(e) {
        e.preventDefault();
        var pk = $(this).data("platform");
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        post.platforms = post.platforms || [];
        if (post.platforms.indexOf(pk) < 0) post.platforms.push(pk);
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
        render();
      });
      $(document).off("blur.scp2a-schf", ".scp-schedule-field").on("blur.scp2a-schf", ".scp-schedule-field", function() {
        saveScheduleField($(this));
      });
      $(document).off("change.scp2a-schfc", ".scp-schedule-field").on("change.scp2a-schfc", ".scp-schedule-field", function() {
        saveScheduleField($(this));
      });
      $(document).off("blur.scp2a-uf", ".scp-url-field").on("blur.scp2a-uf", ".scp-url-field", function() {
        if (!S.selectedPostId) return;
        var post = S.postMap[S.selectedPostId];
        if (!post) return;
        var pk = $(this).data("platform");
        post.schedule = post.schedule || {};
        post.schedule.published_urls = post.schedule.published_urls || {};
        post.schedule.published_urls[pk] = $(this).val();
        post.updated = (/* @__PURE__ */ new Date()).toISOString();
        syncToTextarea();
      });
      $(document).off("click.scp2a-mr", '[data-action="mark-ready"]').on("click.scp2a-mr", '[data-action="mark-ready"]', function(e) {
        e.preventDefault();
        setPostStatus("ready");
      });
      $(document).off("click.scp2a-msc", '[data-action="mark-scheduled"]').on("click.scp2a-msc", '[data-action="mark-scheduled"]', function(e) {
        e.preventDefault();
        setPostStatus("scheduled");
      });
      $(document).off("click.scp2a-mp", '[data-action="mark-published"]').on("click.scp2a-mp", '[data-action="mark-published"]', function(e) {
        e.preventDefault();
        setPostStatus("published");
      });
      var aiActions = [
        "ai-research-angles",
        "ai-research-hooks",
        "ai-write-content",
        "ai-improve-content",
        "ai-plan-slides",
        "ai-generate-script",
        "ai-generate-media",
        "ai-adapt-platform",
        "ai-generate-visual-plan"
      ];
      aiActions.forEach(function(action) {
        $(document).off("click.scp2a-" + action, '[data-action="' + action + '"]').on("click.scp2a-" + action, '[data-action="' + action + '"]', function(e) {
          e.preventDefault();
          var b2 = window._scpPart2B;
          if (b2) {
            var fnMap = {
              "ai-research-angles": function() {
                b2.aiResearchAngles && b2.aiResearchAngles(S.selectedPostId, $(".scp-angle-custom").val());
              },
              "ai-research-hooks": function() {
                b2.aiResearchHooks && b2.aiResearchHooks(S.selectedPostId, $(".scp-hook-custom").val());
              },
              "ai-write-content": function() {
                b2.aiWriteContent && b2.aiWriteContent(S.selectedPostId);
              },
              "ai-improve-content": function() {
                b2.aiImproveContent && b2.aiImproveContent(S.selectedPostId);
              },
              "ai-plan-slides": function() {
                b2.aiSuggestSlides && b2.aiSuggestSlides(S.selectedPostId);
              },
              "ai-generate-script": function() {
                b2.aiGenerateStructuredScript && b2.aiGenerateStructuredScript(S.selectedPostId);
              },
              "ai-generate-media": function() {
                saveAllMediaConfig();
                b2.aiGenerateMediaPrompt && b2.aiGenerateMediaPrompt(S.selectedPostId);
              },
              "ai-adapt-platform": function() {
                var pk = $(e.currentTarget).data("platform");
                b2.aiAdaptForPlatform && b2.aiAdaptForPlatform(S.selectedPostId, pk);
              },
              "ai-generate-visual-plan": function() {
                saveAllMediaConfig();
                b2.aiGenerateVisualPlan && b2.aiGenerateVisualPlan(S.selectedPostId);
              }
            };
            if (fnMap[action]) fnMap[action]();
          } else {
            toast("AI module loading...", "info");
          }
        });
      });
      $(document).off("click.scp2a-dup", '[data-action="duplicate-post"]').on("click.scp2a-dup", '[data-action="duplicate-post"]', function(e) {
        e.preventDefault();
        duplicatePost($(this).data("id"));
      });
      $(document).off("keydown.scp2a-keys").on("keydown.scp2a-keys", function(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT" || e.target.isContentEditable) return;
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          syncToTextarea();
          if (S.$submitBtn && S.$submitBtn.length) S.$submitBtn.click();
        } else if ((e.ctrlKey || e.metaKey) && e.key === "n") {
          e.preventDefault();
          window._scpCreateNewPost();
        }
      });
      setupAIOEvents();
      console.log("[SCP] Part 2A events initialized");
    }
    function getSelectedPost() {
      return S.selectedPostId ? S.postMap[S.selectedPostId] : null;
    }
    function setNestedValue(obj, path, value) {
      var parts = path.split(".");
      var target = obj;
      for (var i = 0; i < parts.length - 1; i++) {
        target[parts[i]] = target[parts[i]] || {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
    }
    function saveBasicsField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var field = $el.data("field");
      var val = $el.val();
      if (field && field.indexOf(".") > -1) {
        setNestedValue(post, field, val);
      } else if (field) {
        post[field] = val;
      }
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function saveAngleSelection(index) {
      var post = getSelectedPost();
      if (!post || !post.research) return;
      var angles = post.research.angles || [];
      angles.forEach(function(a, i) {
        a.selected = i === index;
      });
      post.research.selected_angle = angles[index] ? angles[index].angle : "";
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      snapshot("Select angle");
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, "angle selected");
      buildMaps();
      syncToTextarea();
      render();
    }
    function saveHookSelection(index) {
      var post = getSelectedPost();
      if (!post || !post.research) return;
      var hooks = post.research.hooks || [];
      hooks.forEach(function(h, i) {
        h.selected = i === index;
      });
      post.research.selected_hook = hooks[index] ? hooks[index].hook : "";
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      snapshot("Select hook");
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, "hook selected");
      buildMaps();
      syncToTextarea();
      render();
    }
    function addResearchItem(type) {
      var post = getSelectedPost();
      if (!post) return;
      post.research = post.research || { angles: [], hooks: [], selected_angle: "", selected_hook: "", notes: "" };
      if (type === "angle") post.research.angles.push({ id: generateId("ang"), angle: "", description: "", selected: false });
      else if (type === "hook") post.research.hooks.push({ id: generateId("hk"), hook: "", selected: false });
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, type + " added");
      buildMaps();
      render();
    }
    function removeResearchItem(type, index) {
      var post = getSelectedPost();
      if (!post || !post.research) return;
      if (type === "angle" && post.research.angles) {
        var wasSelected = post.research.angles[index] && post.research.angles[index].selected;
        post.research.angles.splice(index, 1);
        if (wasSelected) post.research.selected_angle = "";
      } else if (type === "hook" && post.research.hooks) {
        var wasHookSel = post.research.hooks[index] && post.research.hooks[index].selected;
        post.research.hooks.splice(index, 1);
        if (wasHookSel) post.research.selected_hook = "";
      }
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      render();
    }
    function saveResearchNotes(val) {
      var post = getSelectedPost();
      if (!post) return;
      post.research = post.research || {};
      post.research.notes = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function saveResearchCustomInput(type, val) {
      var post = getSelectedPost();
      if (!post) return;
      post.research = post.research || {};
      if (type === "angle") post.research.angle_custom_input = val;
      else post.research.hook_custom_input = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function saveComposerContent($ta) {
      var composerId = $ta.data("composer-id");
      var val = $ta.val();
      var post = getSelectedPost();
      if (!post) return;
      if (composerId === "master") {
        post.content = post.content || {};
        post.content.body = val;
      } else if (composerId && composerId.indexOf("platform_") === 0) {
        var pk = composerId.replace("platform_", "");
        post.platform_content = post.platform_content || {};
        post.platform_content[pk] = post.platform_content[pk] || {};
        post.platform_content[pk].body = val;
      }
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      var charLimit = 3e3;
      if (composerId && composerId.indexOf("platform_") === 0) {
        var pCfg = getPlatformConfig(composerId.replace("platform_", ""));
        charLimit = pCfg.char_limit || 3e3;
      }
      $ta.closest(".scp-composer").find(".scp-composer-char-count").html(formatCharCount(countChars(val), charLimit));
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, "content updated");
      buildMaps();
    }
    function saveSlideField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var idx = parseInt($el.data("slide-index"), 10);
      var field = $el.data("slide-field");
      var val = $el.val();
      post.carousel = post.carousel || { slide_count: 5, slides: [] };
      while (post.carousel.slides.length <= idx) post.carousel.slides.push({ index: post.carousel.slides.length, theme: "", text_overlay: "" });
      post.carousel.slides[idx][field] = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function setSlideCount(count) {
      var post = getSelectedPost();
      if (!post) return;
      post.carousel = post.carousel || { slide_count: 5, slides: [] };
      post.carousel.slide_count = count;
      while (post.carousel.slides.length > count) post.carousel.slides.pop();
      while (post.carousel.slides.length < count) post.carousel.slides.push({ index: post.carousel.slides.length, theme: "", text_overlay: "" });
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      render();
    }
    function saveVideoField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var field = $el.data("video-field");
      var val = $el.val();
      post.video = post.video || {};
      post.video[field] = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function setVideoProperty(field, val) {
      var post = getSelectedPost();
      if (!post) return;
      post.video = post.video || {};
      post.video[field] = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      render();
    }
    function saveMediaConfigField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var field = $el.data("config-field");
      var val = $el.val();
      post.media = post.media || {};
      post.media.config = post.media.config || {};
      post.media.config[field] = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function saveAllMediaConfig() {
      if (!S.selectedPostId) return;
      var post = S.postMap[S.selectedPostId];
      if (!post) return;
      post.media = post.media || {};
      post.media.config = post.media.config || {};
      $(".scp-media-config-field").each(function() {
        var field = $(this).data("config-field");
        if (field) post.media.config[field] = $(this).val();
      });
      post.media.config.brand_context_enabled = $(".scp-media-brand-toggle").is(":checked");
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
    }
    function savePlatformField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var pk = $el.data("platform");
      var field = $el.data("pfield");
      var val = $el.val();
      post.platform_content = post.platform_content || {};
      post.platform_content[pk] = post.platform_content[pk] || {};
      if (field === "tags") {
        post.platform_content[pk].tags = val.split(",").map(function(t) {
          return t.trim();
        }).filter(Boolean);
      } else {
        post.platform_content[pk][field] = val;
      }
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, "platform content updated");
      buildMaps();
    }
    function saveScheduleField($el) {
      var post = getSelectedPost();
      if (!post) return;
      var field = $el.data("sfield");
      var val = $el.val();
      post.schedule = post.schedule || {};
      post.schedule[field] = val;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      syncToTextarea();
      if (maybeAdvanceStatus) maybeAdvanceStatus(post, "schedule updated");
      buildMaps();
    }
    function setPostStatus(status) {
      var post = getSelectedPost();
      if (!post) return;
      var oldStatus = post.status;
      post.status = status;
      post.updated = (/* @__PURE__ */ new Date()).toISOString();
      var oldLabel = (Constants.POST_STATUSES[oldStatus] || {}).label || oldStatus;
      var newLabel = (Constants.POST_STATUSES[status] || {}).label || status;
      logActivity("post_status_changed", post.id, post.title, "Status: " + oldLabel + " \u2192 " + newLabel);
      snapshot("Status change");
      buildMaps();
      syncToTextarea();
      render();
      toast("Status changed to " + newLabel, "success");
    }
    window._scpPart2A = {
      snapshot,
      undo,
      redo,
      openModal,
      closeModal,
      openConfirmDialog,
      closeConfirmDialog,
      collectModalFields,
      deletePost,
      duplicatePost,
      promoteResearchIdea,
      openNewTopicModal,
      editTopicModal,
      deleteTopic,
      addResearchItem,
      removeResearchItem,
      setPostStatus,
      // AIOutputRenderer (Phase A)
      renderStructuredOutput,
      collectStructuredOutputData,
      exportStructuredOutput,
      OUTPUT_SCHEMAS
    };
    window._scpAIOSaveField = null;
    console.log("[SCP] Part 2A loaded");
  })(jQuery, Drupal);

  // src/ai/scp-part2b.js
  (function($, Drupal2) {
    "use strict";
    var S, render, navigate, toast, generateId, buildMaps, syncToTextarea, esc, deepClone, icon;
    var formatDate, formatRelativeTime, formatNumber, truncate, logActivity, countWords, countChars;
    var formatCharCount, badge, statusBadge, typeBadge, priorityBadge, platformBadge, progressBar;
    var Constants, maybeAdvanceStatus, resolveTopic, resolveTone, resolveAudience, resolveImageStyle;
    var getPlatformConfig, cleanAIText;
    var snapshot, openModal, closeModal, openConfirmDialog, closeConfirmDialog, collectModalFields;
    var promoteResearchIdea;
    var _checkCount = 0;
    var checkInterval = setInterval(function() {
      _checkCount++;
      if (window._scpPart2A && window._scpState && window._scpState.initialized) {
        clearInterval(checkInterval);
        initPart2B();
      } else if (_checkCount > 150) {
        clearInterval(checkInterval);
        console.error("[SCP] Part 2B: Timed out");
      }
    }, 100);
    function initPart2B() {
      try {
        console.log("[SCP] Initializing Part 2B...");
        S = window._scpState;
        render = window._scpRender;
        navigate = window._scpNavigate;
        toast = window._scpToast;
        generateId = window._scpGenerateId;
        buildMaps = window._scpBuildMaps;
        syncToTextarea = window._scpSyncToTextarea;
        esc = window._scpEsc;
        deepClone = window._scpDeepClone;
        icon = window._scpIcon;
        formatDate = window._scpFormatDate;
        formatRelativeTime = window._scpFormatRelativeTime;
        formatNumber = window._scpFormatNumber;
        truncate = window._scpTruncate;
        logActivity = window._scpLogActivity;
        countWords = window._scpCountWords;
        countChars = window._scpCountChars;
        formatCharCount = window._scpFormatCharCount;
        badge = window._scpBadge;
        statusBadge = window._scpStatusBadge;
        typeBadge = window._scpTypeBadge;
        priorityBadge = window._scpPriorityBadge;
        platformBadge = window._scpPlatformBadge;
        progressBar = window._scpProgressBar;
        Constants = window._scpConstants;
        maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
        resolveTopic = window._scpResolveTopic;
        resolveTone = window._scpResolveTone;
        resolveAudience = window._scpResolveAudience;
        resolveImageStyle = window._scpResolveImageStyle;
        getPlatformConfig = window._scpGetPlatformConfig;
        cleanAIText = window._scpCleanAIText;
        if (!S) {
          console.error("[SCP] Part 2B: State not available");
          return;
        }
        if (!render) {
          console.error("[SCP] Part 2B: render not available");
          return;
        }
        if (!icon) {
          console.error("[SCP] Part 2B: icon not available");
          return;
        }
        var P2A = window._scpPart2A;
        if (!P2A) {
          console.error("[SCP] Part 2B: Part 2A exports not found");
          return;
        }
        snapshot = P2A.snapshot;
        openModal = P2A.openModal;
        closeModal = P2A.closeModal;
        openConfirmDialog = P2A.openConfirmDialog;
        closeConfirmDialog = P2A.closeConfirmDialog;
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
        window._scpAIOSaveField = function(postId, path, value) {
          var post = S.postMap[postId];
          if (!post) return;
          var $aio = $("[data-aio-id]").filter(function() {
            return path.indexOf($(this).data("aio-id")) === 0;
          }).first();
          if (!$aio.length) {
            post.updated = (/* @__PURE__ */ new Date()).toISOString();
            syncToTextarea();
            return;
          }
          var schemaId = $aio.data("schema");
          var oid = $aio.data("aio-id");
          var relativePath = path.replace(new RegExp("^" + oid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[._]?"), "");
          if (!relativePath) {
            post.updated = (/* @__PURE__ */ new Date()).toISOString();
            syncToTextarea();
            return;
          }
          var target = null;
          if (schemaId === "image_visual_plan") {
            post.media = post.media || {};
            post.media.visual_plan = post.media.visual_plan || {};
            target = post.media.visual_plan;
          } else if (schemaId === "video_script") {
            post.video = post.video || {};
            post.video.structured_script = post.video.structured_script || {};
            target = post.video.structured_script;
          } else if (schemaId === "carousel_visual_plan") {
            post.media = post.media || {};
            post.media.visual_plans = post.media.visual_plans || [];
            var seqMatch = relativePath.match(/^s(\d+)\.(.*)/);
            if (seqMatch) {
              var seqIdx = parseInt(seqMatch[1], 10);
              while (post.media.visual_plans.length <= seqIdx) post.media.visual_plans.push({});
              target = post.media.visual_plans[seqIdx];
              relativePath = seqMatch[2];
            } else {
              post.updated = (/* @__PURE__ */ new Date()).toISOString();
              syncToTextarea();
              return;
            }
          }
          if (target && relativePath) {
            var parts = relativePath.split(".");
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
            } else {
              obj[lastKey] = value;
            }
          }
          post.updated = (/* @__PURE__ */ new Date()).toISOString();
          syncToTextarea();
        };
        setupPart2BEvents();
        setupKeyboardShortcuts();
        LLMService.init();
        try {
          BrandService.init();
          BrandService.autoPopulateBrandDesign();
        } catch (e) {
          console.error("[SCP] BrandService init error:", e);
        }
        $(".scp-ai-picker-loading").each(function() {
          try {
            var actionId = $(this).data("pending-action");
            if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
          } catch (pe) {
            console.warn("[SCP] Failed to replace AI picker placeholder:", pe.message);
            $(this).html(icon("warning") + " AI");
          }
        });
        updateAIStatusIndicator();
        S._part2bTimeout = false;
        if (render) render();
        console.log("[SCP] Part 2B initialized \u2014 renderers: research, settings, images");
      } catch (e) {
        console.error("[SCP] Part 2B init FAILED:", e.message, e.stack);
        if (window._scpToast) window._scpToast("Part 2B init error: " + e.message, "error");
      }
    }
    var LLMService = window.LLMService;
    var BrandService = window.BrandService;
    var parseJSON = window._scpAIHelpers.parseJSON;
    var extractBraceBlock = window._scpAIHelpers.extractBraceBlock;
    var brandSnippet = window._scpAIHelpers.brandSnippet;
    var callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    var aiActionLoading = window._scpAIHelpers.aiActionLoading;
    var aiResearchAngles = window._scpAIActions.research.angles;
    var aiResearchHooks = window._scpAIActions.research.hooks;
    var aiWriteContent = window._scpAIActions.content.write;
    var aiImproveContent = window._scpAIActions.content.improve;
    var aiSuggestSlides = window._scpAIActions.content.slides;
    var aiGenerateScript = window._scpAIActions.content.script;
    var buildStructuredPrompt = window._scpAIActions.media.buildStructured;
    var aiGenerateMediaPrompt = window._scpAIActions.media.generate;
    var aiGenerateVisualPlan = window._scpAIActions.visual.plan;
    var aiGenerateStructuredScript = window._scpAIActions.visual.script;
    var aiAdaptForPlatform = window._scpAIActions.platform.adapt;
    function renderResearchView() {
      var researchMode = S._researchMode || "quick";
      var html = '<div class="scp-view scp-view-research">';
      html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon("flask") + " Research</h1></div>";
      html += '<div class="scp-view-header-right">';
      html += '<button class="scp-btn ' + (researchMode === "quick" ? "scp-btn-primary" : "scp-btn-outline") + ' scp-btn-sm" data-action="research-mode" data-mode="quick">' + icon("bolt") + " Quick</button>";
      html += '<button class="scp-btn ' + (researchMode === "advanced" ? "scp-btn-primary" : "scp-btn-outline") + ' scp-btn-sm" data-action="research-mode" data-mode="advanced">' + icon("flask") + " Advanced</button>";
      html += "</div></div>";
      if (researchMode === "quick") {
        html += renderQuickResearch();
      } else {
        html += renderAdvancedResearch();
      }
      var sessions = S.data.research && S.data.research.sessions || [];
      if (sessions.length > 0) {
        html += '<div class="scp-section"><div class="scp-section-header"><h2>Past Sessions</h2></div>';
        for (var si = sessions.length - 1; si >= 0; si--) {
          var ses = sessions[si];
          html += '<div class="scp-research-session" data-session-id="' + esc(ses.id) + '">';
          html += '<div class="scp-research-session-header">';
          html += '<div class="scp-research-session-info">';
          html += "<strong>" + esc(ses.topic || ses.title || "Research Session") + "</strong>";
          html += '<span class="scp-text-sm scp-text-muted">' + esc(ses.type === "advanced" ? "Advanced" : "Quick") + " \u2022 " + (ses.results || []).length + " ideas \u2022 " + formatDate(ses.created) + "</span>";
          html += "</div>";
          html += '<div class="scp-research-session-actions">';
          html += '<button class="scp-btn-icon" data-action="rename-research-session" data-session-id="' + esc(ses.id) + '" title="Rename">' + icon("edit") + "</button>";
          html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-research-session" data-session-id="' + esc(ses.id) + '" title="Delete session">' + icon("trash") + "</button>";
          html += "</div>";
          html += "</div>";
          if (ses.results && ses.results.length > 0) {
            html += '<div class="scp-research-results">';
            for (var ri = 0; ri < ses.results.length; ri++) {
              var idea = ses.results[ri];
              var pt = Constants.POST_TYPES[idea.type] || { icon: "circle", color: "#80868b", label: idea.type };
              html += '<div class="scp-research-idea-card' + (idea.promoted ? " scp-research-idea-promoted" : "") + '">';
              html += '<div class="scp-research-idea-top">';
              html += '<span class="scp-research-idea-title">' + esc(idea.title || "") + "</span>";
              html += typeBadge(idea.type);
              html += "</div>";
              if (idea.hook) html += '<div class="scp-research-idea-hook">"' + esc(truncate(idea.hook, 80)) + '"</div>';
              if (idea.reasoning) html += '<div class="scp-research-idea-reasoning">' + esc(truncate(idea.reasoning, 100)) + "</div>";
              html += '<div class="scp-research-idea-rating">';
              for (var star = 1; star <= 5; star++) html += '<span class="scp-star' + (star <= (idea.rating || 0) ? " scp-star-filled" : "") + '" data-action="rate-idea" data-session="' + esc(ses.id) + '" data-idea="' + esc(idea.id) + '" data-rating="' + star + '">\u2605</span>';
              html += "</div>";
              html += '<div class="scp-research-idea-actions">';
              if (idea.promoted) html += badge("Promoted", "#059669");
              else html += '<button class="scp-btn scp-btn-sm scp-btn-primary" data-action="promote-idea" data-session="' + esc(ses.id) + '" data-idea="' + esc(idea.id) + '">' + icon("plus") + " Create Post</button>";
              html += "</div></div>";
            }
            html += "</div>";
          }
          html += "</div>";
        }
        html += "</div>";
      }
      html += "</div>";
      return html;
    }
    function renderQuickResearch() {
      var stg = S.meta.settings || {};
      var html = '<div class="scp-research-panel">';
      html += '<div class="scp-section-header"><h3>' + icon("bolt") + " Quick Ideation</h3></div>";
      html += '<div class="scp-form-group"><label>Topic / Brief</label>';
      html += '<textarea class="scp-textarea" id="scpResearchTopic" rows="2" placeholder="e.g. AI automation for small businesses..."></textarea></div>';
      html += '<div class="scp-form-row">';
      html += '<div class="scp-form-third"><label>Platforms</label><select class="scp-select" id="scpResearchPlatform"><option value="">Any</option>';
      for (var pk in Constants.PLATFORMS) html += '<option value="' + pk + '">' + Constants.PLATFORMS[pk].label + "</option>";
      html += "</select></div>";
      html += '<div class="scp-form-third"><label>Tone</label><select class="scp-select" id="scpResearchTone"><option value="">Any</option>';
      (stg.tones || []).forEach(function(t) {
        html += '<option value="' + esc(t.id) + '">' + esc(t.name) + "</option>";
      });
      html += "</select></div>";
      html += '<div class="scp-form-third"><label>Ideas</label><select class="scp-select" id="scpResearchCount">';
      [4, 6, 8, 10].forEach(function(n) {
        html += '<option value="' + n + '"' + (n === 6 ? " selected" : "") + ">" + n + "</option>";
      });
      html += "</select></div></div>";
      html += '<div class="scp-form-group"><label class="scp-toggle-label"><input type="checkbox" id="scpResearchBrand"> Include Brand Context</label></div>';
      html += '<div class="scp-research-actions"><button class="scp-btn scp-btn-ai" data-action="run-quick-research" id="scpRunQuick">' + icon("sparkles") + " Generate Ideas</button>";
      html += LLMService.renderInlinePicker("research_quick") + "</div>";
      html += "</div>";
      return html;
    }
    function renderAdvancedResearch() {
      var templates = S.meta.settings && S.meta.settings.research_templates || [];
      var html = '<div class="scp-research-panel">';
      html += '<div class="scp-section-header"><h3>' + icon("flask") + " Advanced Research</h3></div>";
      html += '<div class="scp-form-group"><label>Template</label><select class="scp-select" id="scpResearchTemplate">';
      for (var ti = 0; ti < templates.length; ti++) html += '<option value="' + esc(templates[ti].id) + '">' + esc(templates[ti].name) + " \u2014 " + esc(templates[ti].description || "") + "</option>";
      html += "</select></div>";
      html += '<div id="scpTemplateVars"></div>';
      html += '<div class="scp-form-group"><label class="scp-toggle-label"><input type="checkbox" id="scpResearchBrandAdv"> Include Brand Context</label></div>';
      html += '<div class="scp-research-actions"><button class="scp-btn scp-btn-ai" data-action="run-advanced-research">' + icon("sparkles") + " Run Research</button>";
      html += LLMService.renderInlinePicker("research_advanced") + "</div>";
      html += "</div>";
      return html;
    }
    function runQuickResearch() {
      var topic = $("#scpResearchTopic").val();
      if (!topic || !topic.trim()) {
        toast("Enter a topic", "warning");
        return;
      }
      if (!LLMService.isConfigured()) {
        toast("No AI providers configured", "warning");
        return;
      }
      var platform = $("#scpResearchPlatform").val();
      var tone = $("#scpResearchTone").val();
      var count = parseInt($("#scpResearchCount").val(), 10) || 6;
      var useBrand = $("#scpResearchBrand").is(":checked");
      toast("Researching ideas...", "info");
      $("#scpRunQuick").prop("disabled", true).html(icon("sparkles") + " Generating...");
      var ws = S.meta.workspace && S.meta.workspace.name || "";
      var prompt2 = "You are a social media strategist" + (ws ? ' for "' + ws + '"' : "") + ".\n\nGenerate " + count + " creative post ideas:\n- Topic: " + topic + "\n";
      if (platform) prompt2 += "- Platform: " + (Constants.PLATFORMS[platform] || {}).label + "\n";
      if (tone) {
        var tObj = resolveTone(tone);
        if (tObj) prompt2 += "- Tone: " + tObj.name + "\n";
      }
      if (useBrand) prompt2 += brandSnippet("research");
      prompt2 += '\nFor each idea provide: title, angle, hook, type (image/carousel/video/text), platforms (array), cta_suggestion, reasoning, suggested_topics (array of topic names).\n\nRespond ONLY as JSON: [{"title":"...","angle":"...","hook":"...","type":"...","platforms":[...],"cta_suggestion":"...","reasoning":"...","suggested_topics":[...]}]';
      var sessionId = generateId("rs");
      LLMService.callAI(prompt2, function(text) {
        try {
          var ideas = parseJSON(text);
          if (!Array.isArray(ideas)) ideas = ideas.ideas || ideas.results || [];
          var session = {
            id: sessionId,
            title: truncate(topic, 50),
            topic,
            type: "quick",
            input: { topic, template_id: "", variables: {}, target_platforms: platform ? [platform] : [], target_types: [], custom_instructions: "", brand_context_enabled: useBrand },
            results: ideas.map(function(idea) {
              return { id: generateId("ri"), title: idea.title || "", angle: idea.angle || "", hook: idea.hook || "", type: idea.type || "image", platforms: idea.platforms || [], cta_suggestion: idea.cta_suggestion || "", reasoning: idea.reasoning || "", topics: idea.suggested_topics || idea.suggested_tags || [], promoted: false, promoted_post_id: "", rating: 0 };
            }),
            created: (/* @__PURE__ */ new Date()).toISOString(),
            updated: (/* @__PURE__ */ new Date()).toISOString()
          };
          S.data.research = S.data.research || { sessions: [] };
          S.data.research.sessions.push(session);
          logActivity("research_completed", "", "", "Quick research: " + session.results.length + " ideas");
          snapshot("Quick research");
          buildMaps();
          render();
          syncToTextarea();
          toast("Generated " + session.results.length + " ideas!", "success");
        } catch (e) {
          toast("Parse error: " + e.message, "error");
        }
        $("#scpRunQuick").prop("disabled", false).html(icon("sparkles") + " Generate Ideas");
      }, function(err) {
        toast("AI Error: " + err, "error");
        $("#scpRunQuick").prop("disabled", false).html(icon("sparkles") + " Generate Ideas");
      }, "research_quick", useBrand ? BrandService.getSystemPrompt("social") : "");
    }
    function runAdvancedResearch() {
      var templateId = $("#scpResearchTemplate").val();
      var templates = S.meta.settings && S.meta.settings.research_templates || [];
      var template = templates.find(function(t) {
        return t.id === templateId;
      });
      if (!template) {
        toast("Select a template", "warning");
        return;
      }
      if (!LLMService.isConfigured()) {
        toast("No AI providers configured", "warning");
        return;
      }
      var vars = {};
      (template.variables || []).forEach(function(v) {
        vars[v] = ($("#scpVar_" + v).val() || "").trim();
      });
      var useBrand = $("#scpResearchBrandAdv").is(":checked");
      var prompt2 = template.prompt;
      for (var vk in vars) prompt2 = prompt2.replace(new RegExp("\\{" + vk + "\\}", "g"), vars[vk] || "");
      if (useBrand) prompt2 += brandSnippet("research");
      toast("Running research...", "info");
      var sessionId = generateId("rs");
      LLMService.callAI(prompt2, function(text) {
        try {
          var ideas = parseJSON(text);
          if (!Array.isArray(ideas)) ideas = ideas.ideas || ideas.results || [];
          var session = {
            id: sessionId,
            title: template.name + " \u2014 " + (vars.topic || vars.pillar || "Research"),
            topic: vars.topic || vars.pillar || "",
            type: "advanced",
            input: { topic: vars.topic || "", template_id: templateId, variables: vars, target_platforms: [], target_types: [], custom_instructions: "", brand_context_enabled: useBrand },
            results: ideas.map(function(idea) {
              return { id: generateId("ri"), title: idea.title || "", angle: idea.angle || "", hook: idea.hook || "", type: idea.type || "image", platforms: idea.platforms || [], cta_suggestion: idea.cta_suggestion || "", reasoning: idea.reasoning || "", topics: idea.suggested_topics || idea.suggested_tags || [], promoted: false, promoted_post_id: "", rating: 0 };
            }),
            created: (/* @__PURE__ */ new Date()).toISOString(),
            updated: (/* @__PURE__ */ new Date()).toISOString()
          };
          S.data.research.sessions.push(session);
          logActivity("research_completed", "", "", "Advanced research: " + session.results.length + " ideas");
          snapshot("Advanced research");
          buildMaps();
          render();
          syncToTextarea();
          toast("Generated " + session.results.length + " ideas!", "success");
        } catch (e) {
          toast("Parse error: " + e.message, "error");
        }
      }, function(err) {
        toast("AI Error: " + err, "error");
      }, "research_advanced", useBrand ? BrandService.getSystemPrompt("social") : "");
    }
    function renderSettingsView() {
      var tab = S.settingsTab || "workspace";
      var tabs = [
        { key: "workspace", label: "Workspace", icon: "briefcase" },
        { key: "platforms", label: "Platforms", icon: "share-nodes" },
        { key: "content", label: "Content", icon: "pen-fancy" },
        { key: "media", label: "Media", icon: "image" },
        { key: "research", label: "Research", icon: "flask" },
        { key: "ai", label: "AI", icon: "sparkles" },
        { key: "brand_design", label: "Brand Design", icon: "palette" }
      ];
      var html = '<div class="scp-view scp-view-settings">';
      html += '<div class="scp-view-header"><h1>' + icon("gear") + " Settings</h1></div>";
      html += '<div class="scp-settings-tabs">';
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        html += '<button class="scp-settings-tab' + (tab === t.key ? " scp-settings-tab-active" : "") + '" data-action="settings-tab" data-tab="' + t.key + '">' + icon(t.icon) + " " + esc(t.label) + "</button>";
      }
      html += "</div>";
      html += '<div class="scp-settings-body">';
      switch (tab) {
        case "workspace":
          html += renderWorkspaceSettings();
          break;
        case "platforms":
          html += renderPlatformSettings();
          break;
        case "content":
          html += renderContentSettings();
          break;
        case "media":
          html += renderMediaSettings();
          break;
        case "research":
          html += renderResearchSettings();
          break;
        case "ai":
          html += renderAISettings();
          break;
        case "brand_design":
          html += renderBrandDesignSettings();
          break;
      }
      html += "</div></div>";
      return html;
    }
    function renderWorkspaceSettings() {
      var ws = S.meta && S.meta.workspace || {};
      var stg = S.meta && S.meta.settings || {};
      var html = '<div class="scp-settings-panel">';
      html += '<div class="scp-form-group"><label>Workspace Name</label><input type="text" class="scp-input scp-settings-field" data-path="workspace.name" value="' + esc(ws.name || "") + '"></div>';
      html += '<div class="scp-form-group"><label>Description</label><textarea class="scp-textarea scp-settings-field" data-path="workspace.description" rows="2">' + esc(ws.description || "") + "</textarea></div>";
      html += '<div class="scp-form-row"><div class="scp-form-third"><label>Timezone</label><select class="scp-select scp-settings-field" data-path="settings.timezone">';
      ["UTC", "America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Kolkata"].forEach(function(tz) {
        html += '<option value="' + tz + '"' + (stg.timezone === tz ? " selected" : "") + ">" + tz + "</option>";
      });
      html += "</select></div>";
      html += '<div class="scp-form-third"><label>Card Density</label><select class="scp-select scp-settings-field" data-path="settings.card_density">';
      for (var d in Constants.CARD_DENSITIES) html += '<option value="' + d + '"' + (stg.card_density === d ? " selected" : "") + ">" + Constants.CARD_DENSITIES[d].label + "</option>";
      html += "</select></div>";
      html += '<div class="scp-form-third"><label>Default View</label><select class="scp-select scp-settings-field" data-path="settings.default_view">';
      for (var v in Constants.APP_VIEWS) html += '<option value="' + v + '"' + (stg.default_view === v ? " selected" : "") + ">" + Constants.APP_VIEWS[v].label + "</option>";
      html += "</select></div></div>";
      html += '<div class="scp-settings-actions">';
      html += '<button class="scp-btn scp-btn-outline" data-action="export-json">' + icon("download") + " Export All</button>";
      html += '<button class="scp-btn scp-btn-outline" data-action="import-json">' + icon("upload") + " Import</button>";
      html += '<input type="file" id="scpImportFile" accept=".json" style="display:none">';
      html += '<button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button>";
      html += "</div></div>";
      return html;
    }
    function renderPlatformSettings() {
      var platforms = S.meta.settings && S.meta.settings.platforms || {};
      var html = '<div class="scp-settings-panel">';
      for (var pk in Constants.PLATFORMS) {
        var pl = Constants.PLATFORMS[pk];
        var cfg = platforms[pk] || {};
        html += '<div class="scp-settings-section" style="border-left:3px solid ' + pl.color + '">';
        html += '<div class="scp-flex-between"><h3 style="color:' + pl.color + '">' + icon(pl.icon) + " " + esc(pl.label) + "</h3>";
        html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-platform-setting" data-pk="' + pk + '" data-field="enabled"' + (cfg.enabled !== false ? " checked" : "") + "> Enabled</label></div>";
        html += '<div class="scp-form-row">';
        html += '<div class="scp-form-half"><label>Handle</label><input type="text" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="handle" value="' + esc(cfg.handle || "") + '"></div>';
        if (pk === "youtube") {
          html += '<div class="scp-form-half"><label>Title Limit</label><input type="number" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="title_limit" value="' + (cfg.title_limit || 100) + '"></div>';
        } else {
          html += '<div class="scp-form-half"><label>Char Limit</label><input type="number" class="scp-input scp-platform-setting" data-pk="' + pk + '" data-field="char_limit" value="' + (cfg.char_limit || 3e3) + '"></div>';
        }
        html += "</div></div>";
      }
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderContentSettings() {
      var stg = S.meta.settings || {};
      var defs = stg.defaults || {};
      var html = '<div class="scp-settings-panel">';
      html += renderConfigCRUD("Tones", "tone", stg.tones || []);
      html += renderConfigCRUD("Audiences", "audience", stg.audiences || []);
      html += '<div class="scp-settings-section"><h3>Default Post Settings</h3>';
      html += '<div class="scp-form-row"><div class="scp-form-half"><label>Default Type</label><select class="scp-select scp-default-field" data-default="type">';
      for (var tk in Constants.POST_TYPES) html += '<option value="' + tk + '"' + (defs.type === tk ? " selected" : "") + ">" + Constants.POST_TYPES[tk].label + "</option>";
      html += "</select></div>";
      html += '<div class="scp-form-half"><label>Default Priority</label><select class="scp-select scp-default-field" data-default="priority">';
      for (var pk in Constants.PRIORITY_LEVELS) html += '<option value="' + pk + '"' + (defs.priority === pk ? " selected" : "") + ">" + Constants.PRIORITY_LEVELS[pk].label + "</option>";
      html += "</select></div></div></div>";
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderMediaSettings() {
      var stg = S.meta.settings || {};
      var html = '<div class="scp-settings-panel">';
      html += renderConfigCRUD("Image Styles", "image_style", stg.image_styles || []);
      var mpt = stg.media_prompt_templates || {};
      html += '<div class="scp-settings-section"><h3>Media Prompt Templates</h3>';
      html += '<div class="scp-form-group"><label>Image Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="image" rows="4">' + esc(mpt.image || "") + "</textarea></div>";
      html += '<div class="scp-form-group"><label>Carousel Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="carousel_batch" rows="4">' + esc(mpt.carousel_batch || "") + "</textarea></div>";
      html += '<div class="scp-form-group"><label>Thumbnail Template</label><textarea class="scp-textarea scp-mpt-field" data-mpt="thumbnail" rows="4">' + esc(mpt.thumbnail || "") + "</textarea></div>";
      html += "</div>";
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderResearchSettings() {
      var templates = S.meta.settings && S.meta.settings.research_templates || [];
      var html = '<div class="scp-settings-panel">';
      html += '<div class="scp-settings-section"><div class="scp-flex-between"><h3>Research Templates</h3>';
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-research-template">' + icon("plus") + " New</button></div>";
      for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        html += '<div class="scp-config-item"><span class="scp-config-item-name">' + esc(t.name) + "</span>";
        html += '<span class="scp-text-xs scp-text-muted">' + esc(t.description || "") + "</span>";
        html += '<button class="scp-btn-icon" data-action="edit-research-template" data-index="' + i + '">' + icon("edit") + "</button>";
        html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-research-template" data-index="' + i + '">' + icon("trash") + "</button></div>";
      }
      html += "</div>";
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderAISettings() {
      var stg = S.meta.settings || {};
      var prefs = S.meta.aiPreferences || {};
      var html = '<div class="scp-settings-panel">';
      html += '<div class="scp-settings-section"><h3>' + icon("bolt") + " AI Status</h3>";
      if (LLMService.isConfigured()) {
        var provCount = LLMService.getProviderCount();
        var modelCount = LLMService.getTotalModelCount();
        var def = LLMService.getDefault();
        html += '<div class="scp-ai-status-summary scp-ai-status-summary-ok">';
        html += icon("circle-check") + " <strong>" + provCount + " provider" + (provCount > 1 ? "s" : "") + "</strong> active with <strong>" + modelCount + " model" + (modelCount > 1 ? "s" : "") + "</strong>";
        html += "</div>";
      } else {
        html += '<div class="scp-ai-status-summary scp-ai-status-summary-off">';
        html += icon("warning") + " <strong>No AI providers found</strong>";
        html += "</div>";
        html += '<div class="scp-ai-setup-guide">';
        html += '<p class="scp-text-sm">To enable AI features:</p>';
        html += '<ol class="scp-ai-setup-steps">';
        html += "<li>Go to your <strong>user profile</strong> edit page</li>";
        html += "<li>Find the <strong>LLM Config</strong> field (JSON textarea)</li>";
        html += "<li>Add your API keys and model configuration</li>";
        html += "<li>Make sure the config div is exposed via <strong>Drupal Views</strong> on this page</li>";
        html += "</ol>";
        html += '<p class="scp-text-xs scp-text-muted">The app looks for <code>.llm-config-data</code> or <code>.llm-brand-config-data</code> divs on the page.</p>';
        html += "</div>";
      }
      html += '<div class="scp-ai-status-actions">';
      html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="rescan-ai-config">' + icon("refresh") + " Re-scan Page</button>";
      if (LLMService.isConfigured()) {
        html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="test-ai-connection">' + icon("bolt") + " Test Default</button>";
      }
      html += "</div></div>";
      if (LLMService.isConfigured()) {
        html += '<div class="scp-settings-section"><h3>' + icon("star") + " Default Provider & Model</h3>";
        html += '<p class="scp-text-sm scp-text-muted">This is used for all AI actions unless overridden per-action. Changes take effect immediately.</p>';
        html += '<div class="scp-ai-default-picker">';
        html += LLMService.renderInlinePicker("app-default");
        html += "</div>";
        var def = LLMService.getDefault();
        if (def) {
          var defInfo = LLMService.getProviderInfo(def.provider);
          html += '<div class="scp-ai-default-info">';
          html += '<span class="scp-text-xs scp-text-muted">Resolved default: <strong>' + esc(defInfo ? defInfo.label : def.provider) + "</strong> / <strong>" + esc(def.model) + "</strong></span>";
          html += '<span class="scp-text-xs scp-text-muted"> \u2014 temp: ' + def.temperature + ", max tokens: " + formatNumber(def.max_tokens) + "</span>";
          html += "</div>";
        }
        html += "</div>";
      }
      if (LLMService.isConfigured()) {
        var provs = LLMService.getActiveProviders();
        html += '<div class="scp-settings-section"><h3>' + icon("cube") + " Active Providers (" + provs.length + ")</h3>";
        html += '<div class="scp-ai-provider-cards">';
        for (var pi = 0; pi < provs.length; pi++) {
          var prov = provs[pi];
          var pInfo = LLMService.getProviderInfo(prov.id);
          if (!pInfo) continue;
          var isDefault = def && def.provider === prov.id;
          html += '<div class="scp-ai-provider-card' + (isDefault ? " scp-ai-provider-card-default" : "") + '">';
          html += '<div class="scp-ai-provider-card-header">';
          html += '<div class="scp-ai-provider-card-name">';
          html += "<strong>" + esc(pInfo.label) + "</strong>";
          if (isDefault) html += " " + badge("Default", "#0d904f");
          html += "</div>";
          html += '<div class="scp-ai-provider-card-meta">';
          html += '<span class="scp-text-xs">' + pInfo.modelCount + " model" + (pInfo.modelCount > 1 ? "s" : "") + "</span>";
          html += '<span class="scp-text-xs" style="color:' + (pInfo.hasKey ? "var(--scp-success)" : "var(--scp-error)") + '">' + icon(pInfo.hasKey ? "key" : "warning") + " " + (pInfo.hasKey ? pInfo.maskedKey : "No key") + "</span>";
          html += "</div></div>";
          html += '<div class="scp-ai-provider-card-models">';
          for (var mi = 0; mi < pInfo.models.length; mi++) {
            var model = pInfo.models[mi];
            var isDefModel = isDefault && def.model === model.id;
            html += '<div class="scp-ai-model-row' + (isDefModel ? " scp-ai-model-row-active" : "") + '">';
            html += '<span class="scp-ai-model-name">' + esc(model.label) + "</span>";
            html += '<span class="scp-ai-model-params">';
            html += '<span title="Temperature">T:' + (model.temperature !== void 0 ? model.temperature : "1.0") + "</span>";
            html += '<span title="Max tokens">' + formatNumber(model.max_tokens) + " tok</span>";
            if (model.is_default) html += '<span class="scp-ai-model-badge">config default</span>';
            html += "</span></div>";
          }
          html += "</div>";
          html += '<div class="scp-ai-provider-card-actions">';
          html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="test-provider" data-provider="' + esc(prov.id) + '">' + icon("bolt") + " Test</button>";
          if (!isDefault) {
            html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="set-default-provider" data-provider="' + esc(prov.id) + '">' + icon("star") + " Set Default</button>";
          }
          html += "</div>";
          html += "</div>";
        }
        html += "</div></div>";
      }
      var pa = prefs.perAction || {};
      var actionKeys = Object.keys(pa).filter(function(k2) {
        return k2 !== "app-default" && k2 !== "test-connection";
      });
      if (actionKeys.length > 0) {
        var actionLabels = {
          "ai-research-angles": { label: "Research Angles", icon: "eye" },
          "ai-research-hooks": { label: "Research Hooks", icon: "bolt" },
          "ai-write-content": { label: "Write Content", icon: "pen-fancy" },
          "ai-improve-content": { label: "Improve Content", icon: "pen" },
          "ai-plan-slides": { label: "Plan Slides", icon: "images" },
          "ai-generate-script": { label: "Generate Script", icon: "video" },
          "ai-generate-media": { label: "Generate Media Prompts", icon: "wand-magic" },
          "ai-adapt-platform": { label: "Platform Adaptation", icon: "share-nodes" },
          "research_quick": { label: "Quick Research", icon: "flask" },
          "research_advanced": { label: "Advanced Research", icon: "flask-vial" }
        };
        html += '<div class="scp-settings-section"><h3>' + icon("sliders") + " Per-Action Overrides</h3>";
        html += '<p class="scp-text-sm scp-text-muted">These override the default for specific AI actions. Auto-saved when you change the picker next to any AI button.</p>';
        html += '<div class="scp-config-list">';
        for (var ki = 0; ki < actionKeys.length; ki++) {
          var k = actionKeys[ki];
          var actionMeta = actionLabels[k] || { label: k.replace(/-/g, " ").replace(/^ai /i, ""), icon: "sparkles" };
          var pInfo2 = LLMService.getProviderInfo(pa[k].provider);
          var providerLabel = pInfo2 ? pInfo2.label : pa[k].provider;
          var modelLabel = pa[k].model;
          if (pInfo2) {
            for (var mli = 0; mli < pInfo2.models.length; mli++) {
              if (pInfo2.models[mli].id === pa[k].model) {
                modelLabel = pInfo2.models[mli].label;
                break;
              }
            }
          }
          html += '<div class="scp-config-item scp-ai-action-override">';
          html += '<span class="scp-config-item-name">' + icon(actionMeta.icon) + " " + esc(actionMeta.label) + "</span>";
          html += '<span class="scp-ai-override-value">' + esc(providerLabel) + " / " + esc(modelLabel) + "</span>";
          html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="clear-action-pref" data-action-key="' + esc(k) + '" title="Remove override">' + icon("x") + "</button>";
          html += "</div>";
        }
        html += "</div>";
        if (actionKeys.length > 1) {
          html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="clear-all-action-prefs" style="margin-top:var(--scp-space-2)">' + icon("trash") + " Clear All Overrides</button>";
        }
        html += "</div>";
      }
      if (BrandService.isConfigured()) {
        var enabled = stg.brand_context_enabled || {};
        html += '<div class="scp-settings-section"><h3>' + icon("fingerprint") + " Brand Context Injection</h3>";
        html += '<p class="scp-text-sm scp-text-muted">Control which brand data is sent to AI alongside prompts.</p>';
        [
          { key: "social", label: "Research & Social Content", icon: "flask" },
          { key: "content", label: "Content Writing", icon: "pen-fancy" },
          { key: "media", label: "Media Generation", icon: "image" }
        ].forEach(function(tgl) {
          var isOn = enabled[tgl.key] !== false;
          html += '<div class="scp-config-item"><span class="scp-config-item-name">' + icon(tgl.icon) + " " + esc(tgl.label) + "</span>";
          html += '<label class="scp-toggle-label"><input type="checkbox" class="scp-brand-context-toggle" data-key="' + tgl.key + '"' + (isOn ? " checked" : "") + "></label></div>";
        });
        html += "</div>";
      }
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderBrandDesignSettings() {
      var bd = S.meta.settings && S.meta.settings.brand_design || {};
      var c = bd.colors || {};
      var t = bd.typography || {};
      var vs = bd.visual_style || {};
      var lr = bd.layout_rules || {};
      var refs = bd.reference_image_ids || {};
      var hasDrupalBrand = BrandService.isConfigured();
      var html = '<div class="scp-settings-panel scp-brand-design-panel">';
      if (hasDrupalBrand) {
        html += '<div class="scp-ai-status-summary scp-ai-status-summary-ok" style="margin-bottom:var(--scp-space-5)">';
        html += icon("circle-check") + " <strong>Drupal brand data detected</strong> \u2014 empty fields will auto-fill from your brand profile.";
        html += "</div>";
      }
      html += '<div class="scp-settings-section"><h3>' + icon("palette") + " Color Palette</h3>";
      html += '<div class="scp-brand-color-row">';
      html += '<div class="scp-brand-color-field"><label>Primary</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.primary" value="' + (c.primary || "#1a73e8") + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.primary" value="' + esc(c.primary || "") + '" placeholder="#1a73e8"></div></div>';
      html += '<div class="scp-brand-color-field"><label>Secondary</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.secondary" value="' + (c.secondary || "#0d904f") + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.secondary" value="' + esc(c.secondary || "") + '" placeholder="#0d904f"></div></div>';
      html += '<div class="scp-brand-color-field"><label>Accent</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.accent" value="' + (c.accent || "#e37400") + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.accent" value="' + esc(c.accent || "") + '" placeholder="#e37400"></div></div>';
      html += '<div class="scp-brand-color-field"><label>Background</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.background" value="' + (c.background || "#ffffff") + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.background" value="' + esc(c.background || "#ffffff") + '"></div></div>';
      html += '<div class="scp-brand-color-field"><label>Text</label><div class="scp-color-input-wrap"><input type="color" class="scp-brand-design-color" data-bd-path="colors.text" value="' + (c.text || "#202124") + '"><input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.text" value="' + esc(c.text || "#202124") + '"></div></div>';
      html += "</div>";
      html += '<div class="scp-form-group" style="margin-top:var(--scp-space-3)"><label>Palette Description</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="colors.palette_description" value="' + esc(c.palette_description || "") + '" placeholder="e.g. Clean professional blue with green accents"></div>';
      html += "</div>";
      html += '<div class="scp-settings-section"><h3>' + icon("font") + " Typography</h3>";
      html += '<div class="scp-form-group"><label>Heading Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.heading_style" value="' + esc(t.heading_style || "") + '" placeholder="e.g. Bold sans-serif, clean lines"></div>';
      html += '<div class="scp-form-group"><label>Body Text Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.body_style" value="' + esc(t.body_style || "") + '" placeholder="e.g. Clean sans-serif, high readability"></div>';
      html += '<div class="scp-form-group"><label>Text Treatment on Images</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.text_treatment" value="' + esc(t.text_treatment || "") + '" placeholder="e.g. Minimal text, large headings only"></div>';
      html += "</div>";
      html += '<div class="scp-settings-section"><h3>' + icon("eye") + " Visual Style</h3>";
      html += '<div class="scp-form-group"><label>Overall Aesthetic</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.overall_aesthetic" value="' + esc(vs.overall_aesthetic || "") + '" placeholder="e.g. Modern minimalist with subtle gradients"></div>';
      html += '<div class="scp-form-row"><div class="scp-form-half"><label>Photography Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.photography_style" value="' + esc(vs.photography_style || "") + '" placeholder="Bright, natural lighting..."></div>';
      html += '<div class="scp-form-half"><label>Illustration Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.illustration_style" value="' + esc(vs.illustration_style || "") + '" placeholder="Flat vector, rounded corners..."></div></div>';
      html += '<div class="scp-form-row"><div class="scp-form-half"><label>Icon Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.icon_style" value="' + esc(vs.icon_style || "") + '" placeholder="Line icons, 2px stroke..."></div>';
      html += '<div class="scp-form-half"><label>Pattern Usage</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.pattern_usage" value="' + esc(vs.pattern_usage || "") + '" placeholder="Subtle geometric backgrounds..."></div></div>';
      html += '<div class="scp-form-group"><label>Mood / Feel</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="visual_style.mood" value="' + esc(vs.mood || "") + '" placeholder="Professional but approachable, aspirational"></div>';
      html += "</div>";
      html += '<div class="scp-settings-section"><h3>' + icon("layout-grid") + " Layout Rules</h3>";
      html += '<div class="scp-form-group"><label>Image Composition</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.image_composition" value="' + esc(lr.image_composition || "") + '" placeholder="e.g. Clean negative space, subject left-aligned"></div>';
      html += '<div class="scp-form-group"><label>Carousel Consistency</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.carousel_consistency" value="' + esc(lr.carousel_consistency || "") + '" placeholder="Same header bar, consistent fonts across slides"></div>';
      html += '<div class="scp-form-group"><label>Thumbnail Style</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.thumbnail_style" value="' + esc(lr.thumbnail_style || "") + '" placeholder="Bold text overlay, high contrast, face focus"></div>';
      html += '<div class="scp-form-row"><div class="scp-form-half"><label>Border Radius</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.border_radius" value="' + esc(lr.border_radius || "") + '" placeholder="Rounded corners 12-16px"></div>';
      html += '<div class="scp-form-half"><label>Spacing</label>';
      html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="layout_rules.spacing" value="' + esc(lr.spacing || "") + '" placeholder="Generous whitespace"></div></div>';
      html += "</div>";
      html += '<div class="scp-settings-section"><h3>' + icon("images") + " Reference Images by Role</h3>";
      html += '<p class="scp-text-sm scp-text-muted">Assign reference images to roles. These will be auto-suggested when generating media prompts.</p>';
      var roles = [
        { key: "primary_style", label: "Primary Style Reference", desc: "Your default brand visual style" },
        { key: "carousel_template", label: "Carousel Template", desc: "Consistent slide design reference" },
        { key: "thumbnail_template", label: "Thumbnail Template", desc: "Video/reel thumbnail style" }
      ];
      for (var ri = 0; ri < roles.length; ri++) {
        var role = roles[ri];
        var roleIds = refs[role.key] || [];
        html += '<div class="scp-brand-ref-role">';
        html += '<div class="scp-brand-ref-role-header"><strong>' + esc(role.label) + '</strong><span class="scp-text-xs scp-text-muted">' + esc(role.desc) + "</span></div>";
        html += '<div class="scp-brand-ref-thumbs">';
        for (var rii = 0; rii < roleIds.length; rii++) {
          var img = S.imageMap[roleIds[rii]];
          if (img) {
            html += '<div class="scp-brand-ref-thumb"><img src="' + esc(img.url) + '" alt=""><button class="scp-brand-ref-remove" data-action="remove-brand-ref" data-role="' + role.key + '" data-fid="' + esc(img.fid) + '">&times;</button></div>';
          }
        }
        html += '<button class="scp-brand-ref-add" data-action="add-brand-ref" data-role="' + role.key + '">' + icon("plus") + "</button>";
        html += "</div></div>";
      }
      html += "</div>";
      var previewText = BrandService.buildBrandDesignText(bd);
      html += '<div class="scp-settings-section"><h3>' + icon("eye") + " Brand Prompt Prefix</h3>";
      html += '<p class="scp-text-sm scp-text-muted">This text is auto-injected into every media prompt. Edit to customize, or leave empty to auto-generate from fields above.</p>';
      html += '<textarea class="scp-textarea scp-brand-design-field" data-bd-path="brand_prompt_prefix" rows="8" placeholder="Auto-generated from fields above...">' + esc(bd.brand_prompt_prefix || "") + "</textarea>";
      if (previewText && !bd.brand_prompt_prefix) {
        html += '<div class="scp-brand-prefix-preview"><label class="scp-text-xs scp-text-muted">AUTO-GENERATED PREVIEW</label><pre class="scp-brand-prefix-text">' + esc(previewText) + "</pre></div>";
      }
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="regenerate-brand-prefix" style="margin-top:var(--scp-space-2)">' + icon("refresh") + " Regenerate from Fields</button>";
      html += "</div>";
      html += '<div class="scp-settings-actions"><button class="scp-btn scp-btn-primary" data-action="save-settings">' + icon("check") + " Save</button></div>";
      html += "</div>";
      return html;
    }
    function renderConfigCRUD(title, type, items) {
      var html = '<div class="scp-settings-section"><div class="scp-flex-between"><h3>' + esc(title) + "</h3>";
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="add-config" data-type="' + type + '">' + icon("plus") + " Add</button></div>";
      html += '<div class="scp-config-list">';
      for (var i = 0; i < items.length; i++) {
        html += '<div class="scp-config-item"><span class="scp-config-item-name">' + esc(items[i].name) + "</span>";
        html += '<span class="scp-text-xs scp-text-muted">' + esc(items[i].description || "") + "</span>";
        html += '<button class="scp-btn-icon" data-action="edit-config" data-type="' + type + '" data-index="' + i + '">' + icon("edit") + "</button>";
        html += '<button class="scp-btn-icon scp-btn-delete-sm" data-action="delete-config" data-type="' + type + '" data-index="' + i + '">' + icon("trash") + "</button></div>";
      }
      html += "</div></div>";
      return html;
    }
    function addConfigItem(type) {
      var fields = '<div class="scp-editor-form">';
      fields += '<div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name"></div>';
      fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description"></div>';
      fields += "</div>";
      openModal("Add " + type.replace(/_/g, " "), fields, { onSave: function() {
        var d = collectModalFields();
        if (!d.name) {
          toast("Name required", "warning");
          return;
        }
        var prefixes = { tone: "tone", audience: "aud", image_style: "is" };
        var item = { id: generateId(prefixes[type] || type), name: d.name.trim(), description: d.description || "" };
        var listKeys = { tone: "tones", audience: "audiences", image_style: "image_styles" };
        var listKey = listKeys[type];
        if (!listKey) return;
        S.meta.settings[listKey] = S.meta.settings[listKey] || [];
        S.meta.settings[listKey].push(item);
        snapshot("Add " + type);
        buildMaps();
        closeModal();
        render();
        syncToTextarea();
        toast("Added", "success");
      } });
    }
    function editConfigItem(type, index) {
      var listKeys = { tone: "tones", audience: "audiences", image_style: "image_styles" };
      var list = S.meta.settings[listKeys[type]] || [];
      var item = list[index];
      if (!item) return;
      var fields = '<div class="scp-editor-form">';
      fields += '<div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name" value="' + esc(item.name) + '"></div>';
      fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" value="' + esc(item.description || "") + '"></div>';
      fields += "</div>";
      openModal("Edit " + type.replace(/_/g, " "), fields, { onSave: function() {
        var d = collectModalFields();
        if (!d.name) {
          toast("Name required", "warning");
          return;
        }
        item.name = d.name.trim();
        item.description = d.description || "";
        snapshot("Edit " + type);
        buildMaps();
        closeModal();
        render();
        syncToTextarea();
        toast("Updated", "success");
      } });
    }
    function deleteConfigItem(type, index) {
      var listKeys = { tone: "tones", audience: "audiences", image_style: "image_styles" };
      var list = S.meta.settings[listKeys[type]] || [];
      if (!list[index]) return;
      openConfirmDialog({
        title: "Delete",
        message: 'Delete "' + list[index].name + '"?',
        confirmLabel: "Delete",
        danger: true,
        onConfirm: function() {
          list.splice(index, 1);
          snapshot("Delete " + type);
          buildMaps();
          render();
          syncToTextarea();
          toast("Deleted", "success");
        }
      });
    }
    function saveAllSettings() {
      S.meta = S.meta || {};
      S.meta.settings = S.meta.settings || {};
      $(".scp-settings-field").each(function() {
        var path = $(this).data("path");
        if (!path) return;
        var val = $(this).val();
        var parts = path.split(".");
        var obj = S.meta;
        for (var i = 0; i < parts.length - 1; i++) {
          obj[parts[i]] = obj[parts[i]] || {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = val;
      });
      $(".scp-default-field").each(function() {
        var key = $(this).data("default");
        var val = $(this).val();
        S.meta.settings.defaults = S.meta.settings.defaults || {};
        S.meta.settings.defaults[key] = val;
      });
      $(".scp-platform-setting").each(function() {
        var pk = $(this).data("pk");
        var field = $(this).data("field");
        S.meta.settings.platforms = S.meta.settings.platforms || {};
        S.meta.settings.platforms[pk] = S.meta.settings.platforms[pk] || {};
        if ($(this).is(":checkbox")) S.meta.settings.platforms[pk][field] = $(this).is(":checked");
        else if (field === "char_limit" || field === "title_limit" || field === "hashtag_limit") S.meta.settings.platforms[pk][field] = parseInt($(this).val(), 10) || 0;
        else S.meta.settings.platforms[pk][field] = $(this).val();
      });
      $(".scp-mpt-field").each(function() {
        var key = $(this).data("mpt");
        S.meta.settings.media_prompt_templates = S.meta.settings.media_prompt_templates || {};
        S.meta.settings.media_prompt_templates[key] = $(this).val();
      });
      S.meta.settings.brand_context_enabled = S.meta.settings.brand_context_enabled || {};
      $(".scp-brand-context-toggle").each(function() {
        var key = $(this).data("key");
        if (key) S.meta.settings.brand_context_enabled[key] = $(this).is(":checked");
      });
      S.meta.settings.brand_design = S.meta.settings.brand_design || {};
      $(".scp-brand-design-field").each(function() {
        var path = $(this).data("bd-path");
        if (!path) return;
        var val = $(this).val();
        var parts = path.split(".");
        var obj = S.meta.settings.brand_design;
        for (var i = 0; i < parts.length - 1; i++) {
          obj[parts[i]] = obj[parts[i]] || {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = val;
      });
      S.cardDensity = S.meta.settings.card_density || S.cardDensity;
      var $defProvider = $('.scp-ai-provider-select[data-action-id="app-default"]');
      var $defModel = $('.scp-ai-model-select[data-action-id="app-default"]');
      if ($defProvider.length && $defModel.length) {
        S.meta.aiPreferences = S.meta.aiPreferences || {};
        S.meta.aiPreferences.appDefault = { provider: $defProvider.val(), model: $defModel.val() };
        console.log("[SCP] Saved AI default: " + $defProvider.val() + " / " + $defModel.val());
      }
      snapshot("Save settings");
      buildMaps();
      syncToTextarea();
      updateAIStatusIndicator();
      toast("Settings saved", "success");
    }
    function exportJSON(mode) {
      mode = mode || "combined";
      var name = (S.meta.workspace && S.meta.workspace.name || "scp").toLowerCase().replace(/\s+/g, "-");
      var date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      var json, fileName;
      if (mode === "meta-only") {
        json = JSON.stringify(S.meta, null, 2);
        fileName = name + "-meta-" + date + ".json";
      } else if (mode === "data-only") {
        json = JSON.stringify(S.data, null, 2);
        fileName = name + "-data-" + date + ".json";
      } else {
        json = JSON.stringify({ _format: "scp-combined", _version: "1.0", meta: S.meta, data: S.data, activity: S.activity }, null, 2);
        fileName = name + "-export-" + date + ".json";
      }
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Exported: " + fileName, "success");
    }
    function importJSON() {
      var $input = $("#scpImportFile");
      if (!$input.length) {
        $input = $('<input type="file" id="scpImportFile" accept=".json" style="display:none">');
        $("body").append($input);
      }
      $input.off("change").on("change", function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(evt) {
          try {
            var imported = JSON.parse(evt.target.result);
            openConfirmDialog({
              title: "Import Data",
              message: "Replace all data? Current data will be lost.",
              confirmLabel: "Import",
              danger: true,
              onConfirm: function() {
                if (imported._format === "scp-combined" && imported.meta && imported.data) {
                  S.meta = imported.meta;
                  S.data = imported.data;
                  S.activity = imported.activity || [];
                } else if (imported.workspace || imported.settings) {
                  S.meta = imported;
                } else {
                  S.data = imported;
                }
                snapshot("Import");
                buildMaps();
                render();
                syncToTextarea();
                toast("Imported successfully", "success");
              }
            });
          } catch (err) {
            toast("Invalid JSON file", "error");
          }
        };
        reader.readAsText(file);
        $input.val("");
      });
      $input.click();
    }
    var getImages, getImageById, getAllImageTags, parseImageField;
    function _importImageHelpers() {
      getImages = window._scpGetImages;
      getImageById = window._scpGetImageById;
      getAllImageTags = window._scpGetAllImageTags;
      parseImageField = window._scpParseImageField;
    }
    function renderImagesView() {
      if (!getImages) _importImageHelpers();
      var cats = S.meta && S.meta.image_categories || [];
      var imgs = getImages(S.imageFilter);
      var allImgTags = getAllImageTags();
      var html = '<div class="scp-view scp-view-images">';
      html += '<div class="scp-view-header"><div class="scp-view-header-left"><h1>' + icon("images") + " Reference Images</h1>";
      html += '<span class="scp-view-subtitle">' + S.images.length + " image" + (S.images.length !== 1 ? "s" : "") + "</span></div>";
      html += '<div class="scp-view-header-right">';
      html += '<button class="scp-btn scp-btn-primary" data-action="upload-image">' + icon("upload") + " Upload</button>";
      html += '<button class="scp-btn-icon' + (S.imageViewMode === "grid" ? "" : " scp-btn-icon-active") + '" data-action="image-view-mode" data-mode="list" title="List view">' + icon("list") + "</button>";
      html += '<button class="scp-btn-icon' + (S.imageViewMode === "grid" ? " scp-btn-icon-active" : "") + '" data-action="image-view-mode" data-mode="grid" title="Grid view">' + icon("layout-grid") + "</button>";
      html += "</div></div>";
      html += '<div class="scp-img-filters">';
      html += '<div class="scp-search-wrapper"><span class="scp-icon">' + icon("search") + "</span>";
      html += '<input type="text" class="scp-input scp-img-search" id="scpImgSearch" placeholder="Search images..." value="' + esc(S.imageFilter.search || "") + '"></div>';
      html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="category"><option value="">All Categories</option>';
      for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (S.imageFilter.category === cats[ci].id ? " selected" : "") + ">" + esc(cats[ci].label) + "</option>";
      html += "</select>";
      var imgStyles = S.meta.settings && S.meta.settings.image_styles || [];
      if (imgStyles.length > 0) {
        html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="style"><option value="">All Styles</option>';
        for (var sti = 0; sti < imgStyles.length; sti++) html += '<option value="' + esc(imgStyles[sti].id) + '"' + (S.imageFilter.style === imgStyles[sti].id ? " selected" : "") + ">" + esc(imgStyles[sti].name) + "</option>";
        html += "</select>";
      }
      if (allImgTags.length > 0) {
        html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="tag"><option value="">All Tags</option>';
        for (var ti = 0; ti < allImgTags.length; ti++) html += '<option value="' + esc(allImgTags[ti]) + '"' + (S.imageFilter.tag === allImgTags[ti] ? " selected" : "") + ">" + esc(allImgTags[ti]) + "</option>";
        html += "</select>";
      }
      html += '<button class="scp-btn scp-btn-sm' + (S.imageFilter.star ? " scp-btn-primary" : " scp-btn-outline") + '" data-action="toggle-img-star-filter">' + icon("star") + " Starred</button>";
      html += '<select class="scp-select scp-select-sm scp-img-filter" data-filter="sort">';
      [["newest", "Newest"], ["name", "Name"], ["most-used", "Most Used"]].forEach(function(opt) {
        html += '<option value="' + opt[0] + '"' + (S.imageFilter.sort === opt[0] ? " selected" : "") + ">" + opt[1] + "</option>";
      });
      html += "</select>";
      html += "</div>";
      if (imgs.length === 0) {
        html += '<div class="scp-empty-state"><div class="scp-empty-state-icon">' + icon("images") + "</div>";
        if (S.images.length === 0 && (!S.$imageField || !S.$imageField.length)) {
          html += '<div class="scp-empty-state-title">Image Field Not Found</div>';
          html += '<div class="scp-empty-state-text">Add a <strong>field_images</strong> (Image, multi-value) field to your Social Content Planner content type in Drupal, then upload reference images on this node.</div>';
        } else if (S.images.length === 0) {
          html += '<div class="scp-empty-state-title">No reference images yet</div>';
          html += '<div class="scp-empty-state-text">Upload brand reference images to build your visual library. These are used to guide AI image prompt generation for brand consistency.</div>';
          html += '<button class="scp-btn scp-btn-primary" data-action="upload-image">' + icon("upload") + " Upload First Image</button>";
        } else {
          html += '<div class="scp-empty-state-title">No matches</div>';
          html += '<div class="scp-empty-state-text">Try adjusting your search or filters.</div>';
        }
        html += "</div>";
      } else if (S.imageViewMode === "grid") {
        html += '<div class="scp-img-grid">';
        for (var gi = 0; gi < imgs.length; gi++) html += renderImageCard(imgs[gi]);
        html += "</div>";
      } else {
        html += '<div class="scp-img-list-table">';
        for (var li = 0; li < imgs.length; li++) html += renderImageListRow(imgs[li]);
        html += "</div>";
      }
      if (S.selectedImageId && S.imageMap[S.selectedImageId]) {
        html += renderImageDetailPanel(S.imageMap[S.selectedImageId]);
      }
      html += "</div>";
      return html;
    }
    function renderImageCard(img) {
      var cat = S.imageCategoryMap[img.category];
      var isSelected = S.selectedImageId === img.fid;
      var html = '<div class="scp-img-card' + (isSelected ? " scp-img-card-selected" : "") + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
      html += '<div class="scp-img-card-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.alt || img.filename) + '" loading="lazy"></div>';
      html += '<div class="scp-img-card-body">';
      html += '<div class="scp-img-card-top">';
      html += '<span class="scp-img-card-name">' + esc(truncate(img.filename, 24)) + "</span>";
      html += '<button class="scp-img-star' + (img.star ? " scp-img-star-active" : "") + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '" title="' + (img.star ? "Unstar" : "Star") + '">\u2605</button>';
      html += "</div>";
      if (cat) html += '<span class="scp-badge" style="background:' + cat.color + "15;color:" + cat.color + '">' + icon(cat.icon) + " " + esc(cat.label) + "</span>";
      var styleObj = img.style ? S.imageStyleMap[img.style] : null;
      if (styleObj) html += '<span class="scp-badge" style="background:var(--scp-primary-light);color:var(--scp-primary)">' + icon("palette") + " " + esc(styleObj.name) + "</span>";
      if (img.tags && img.tags.length > 0) {
        html += '<div class="scp-img-card-tags">';
        for (var t = 0; t < Math.min(img.tags.length, 3); t++) html += '<span class="scp-tag-chip" style="font-size:10px;padding:1px 6px;border-color:var(--scp-border-default);cursor:default">' + esc(img.tags[t]) + "</span>";
        if (img.tags.length > 3) html += '<span class="scp-text-xs scp-text-muted">+' + (img.tags.length - 3) + "</span>";
        html += "</div>";
      }
      if (img.usage && img.usage.length > 0) html += '<span class="scp-text-xs scp-text-muted">' + icon("link") + " Used in " + img.usage.length + " post" + (img.usage.length !== 1 ? "s" : "") + "</span>";
      html += "</div></div>";
      return html;
    }
    function renderImageListRow(img) {
      var cat = S.imageCategoryMap[img.category];
      var isSelected = S.selectedImageId === img.fid;
      var html = '<div class="scp-img-list-row' + (isSelected ? " scp-img-list-row-selected" : "") + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
      html += '<img class="scp-img-list-thumb" src="' + esc(img.url) + '" alt="" loading="lazy">';
      html += '<div class="scp-img-list-info"><span class="scp-img-list-name">' + esc(img.filename) + "</span>";
      if (img.description) html += '<span class="scp-text-xs scp-text-muted">' + esc(truncate(img.description, 60)) + "</span>";
      html += "</div>";
      if (cat) html += '<span class="scp-badge" style="background:' + cat.color + "15;color:" + cat.color + '">' + esc(cat.label) + "</span>";
      var styleObj = img.style ? S.imageStyleMap[img.style] : null;
      if (styleObj) html += '<span class="scp-badge" style="background:var(--scp-primary-light);color:var(--scp-primary)">' + esc(styleObj.name) + "</span>";
      html += '<button class="scp-img-star' + (img.star ? " scp-img-star-active" : "") + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">\u2605</button>';
      html += '<span class="scp-text-xs scp-text-muted">' + (img.usage || []).length + " use" + ((img.usage || []).length !== 1 ? "s" : "") + "</span>";
      html += "</div>";
      return html;
    }
    function renderImageDetailPanel(img) {
      var cats = S.meta && S.meta.image_categories || [];
      var html = '<div class="scp-img-detail-backdrop" data-action="close-image-detail"></div>';
      html += '<div class="scp-img-detail">';
      html += '<div class="scp-img-detail-header"><h3>' + icon("image") + " Image Details</h3>";
      html += '<button class="scp-btn-icon" data-action="close-image-detail">' + icon("x") + "</button></div>";
      html += '<div class="scp-img-detail-body">';
      html += '<div class="scp-img-detail-preview"><img src="' + esc(img.url) + '" alt="' + esc(img.alt || "") + '"></div>';
      html += '<div class="scp-img-detail-title">';
      html += "<strong>" + esc(img.filename) + "</strong>";
      html += '<button class="scp-img-star' + (img.star ? " scp-img-star-active" : "") + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">\u2605</button>';
      html += "</div>";
      html += '<div class="scp-editor-form">';
      html += '<div class="scp-form-group"><label>Description</label>';
      html += '<textarea class="scp-textarea scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="description" rows="2" placeholder="Describe this reference image...">' + esc(img.description || "") + "</textarea></div>";
      html += '<div class="scp-form-group"><label>Category</label>';
      html += '<select class="scp-select scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="category">';
      html += '<option value="">Uncategorized</option>';
      for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (img.category === cats[ci].id ? " selected" : "") + ">" + esc(cats[ci].label) + "</option>";
      html += "</select></div>";
      var imgStyles = S.meta.settings && S.meta.settings.image_styles || [];
      html += '<div class="scp-form-group"><label>Visual Style</label>';
      html += '<select class="scp-select scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="style">';
      html += '<option value="">No style assigned</option>';
      for (var sti = 0; sti < imgStyles.length; sti++) html += '<option value="' + esc(imgStyles[sti].id) + '"' + (img.style === imgStyles[sti].id ? " selected" : "") + ">" + esc(imgStyles[sti].name) + "</option>";
      html += "</select></div>";
      html += '<div class="scp-form-group"><label>Tags</label>';
      html += '<input type="text" class="scp-input scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="tags" value="' + esc((img.tags || []).join(", ")) + '" placeholder="minimalist, blue-theme, clean..."></div>';
      html += '<div class="scp-form-group"><label>Notes</label>';
      html += '<textarea class="scp-textarea scp-img-meta-field" data-fid="' + esc(img.fid) + '" data-field="notes" rows="2" placeholder="When to use this reference...">' + esc(img.notes || "") + "</textarea></div>";
      html += "</div>";
      if (img.usage && img.usage.length > 0) {
        html += '<div class="scp-img-detail-section"><h4>Usage History</h4>';
        html += '<div class="scp-img-usage-list">';
        for (var ui = 0; ui < img.usage.length; ui++) {
          var u = img.usage[ui];
          var post = S.postMap[u.post_id];
          html += '<div class="scp-img-usage-item">';
          html += "<span>" + (post ? esc(truncate(post.title, 30)) : esc(u.post_id)) + "</span>";
          html += '<span class="scp-text-xs scp-text-muted">' + formatDate(u.used_at) + "</span>";
          html += "</div>";
        }
        html += "</div></div>";
      }
      html += '<div class="scp-img-detail-info">';
      html += "<span>File ID: " + esc(img.fid) + "</span>";
      html += "</div>";
      html += '<div class="scp-img-detail-actions">';
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" data-action="copy-image-url" data-url="' + esc(img.url) + '">' + icon("copy") + " Copy URL</button>";
      html += '<a href="' + esc(img.url) + '" target="_blank" class="scp-btn scp-btn-sm scp-btn-outline">' + icon("external-link") + " Open</a>";
      html += '<button class="scp-btn scp-btn-sm scp-btn-outline" style="margin-left:auto;color:var(--scp-error)" data-action="delete-image-meta" data-fid="' + esc(img.fid) + '">' + icon("trash") + " Clear Metadata</button>";
      html += "</div>";
      html += "</div></div>";
      return html;
    }
    function saveImageMeta(fid, field, value) {
      S.meta.reference_images = S.meta.reference_images || {};
      S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: "", style: "", tags: [], star: false, description: "", notes: "", usage: [] };
      var meta = S.meta.reference_images[fid];
      if (field === "tags") {
        meta.tags = value.split(",").map(function(t) {
          return t.trim().toLowerCase();
        }).filter(Boolean);
      } else {
        meta[field] = value;
      }
      if (S.imageMap[fid]) {
        S.imageMap[fid].category = meta.category;
        S.imageMap[fid].style = meta.style || "";
        S.imageMap[fid].tags = meta.tags;
        S.imageMap[fid].description = meta.description;
        S.imageMap[fid].notes = meta.notes;
      }
      syncToTextarea();
    }
    function toggleImageStar(fid) {
      S.meta.reference_images = S.meta.reference_images || {};
      S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: "", tags: [], star: false, description: "", notes: "", usage: [] };
      S.meta.reference_images[fid].star = !S.meta.reference_images[fid].star;
      if (S.imageMap[fid]) S.imageMap[fid].star = S.meta.reference_images[fid].star;
      syncToTextarea();
    }
    function deleteImageMeta(fid) {
      openConfirmDialog({
        title: "Clear Metadata",
        message: "Remove all metadata (category, tags, notes) for this image? The image file itself remains in Drupal.",
        confirmLabel: "Clear",
        danger: true,
        onConfirm: function() {
          if (S.meta.reference_images && S.meta.reference_images[fid]) delete S.meta.reference_images[fid];
          if (S.imageMap[fid]) {
            S.imageMap[fid].category = "";
            S.imageMap[fid].tags = [];
            S.imageMap[fid].star = false;
            S.imageMap[fid].description = "";
            S.imageMap[fid].notes = "";
          }
          S.selectedImageId = null;
          syncToTextarea();
          render();
          toast("Metadata cleared", "success");
        }
      });
    }
    function recordImageUsage(fid, postId, context) {
      S.meta.reference_images = S.meta.reference_images || {};
      S.meta.reference_images[fid] = S.meta.reference_images[fid] || { category: "", tags: [], star: false, description: "", notes: "", usage: [] };
      S.meta.reference_images[fid].usage.push({ post_id: postId, used_at: (/* @__PURE__ */ new Date()).toISOString(), context: context || "media_prompt" });
      if (S.imageMap[fid]) S.imageMap[fid].usage = S.meta.reference_images[fid].usage;
      syncToTextarea();
    }
    function triggerImageUpload() {
      if (!S.$imageField || !S.$imageField.length) {
        toast("Image field not found on this page", "error");
        return;
      }
      S.$imageField.show();
      var $fileInputs = S.$imageField.find('input[type="file"]');
      var $emptySlot = $fileInputs.filter(function() {
        return !$(this).val();
      }).last();
      if (!$emptySlot.length) {
        toast("No upload slots available \u2014 save the node first to get more slots", "warning");
        S.$imageField.hide();
        return;
      }
      var _checkCount2 = 0;
      var _prevCount = S.images.length;
      toast("Drupal upload dialog opened \u2014 select your image", "info");
      $emptySlot.trigger("click");
      var pollTimer = setInterval(function() {
        _checkCount2++;
        parseImageField();
        if (S.images.length > _prevCount) {
          clearInterval(pollTimer);
          S.$imageField.hide();
          var newImg = S.images[S.images.length - 1];
          S.selectedImageId = newImg.fid;
          logActivity("image_uploaded", "", "", "Uploaded reference image: " + newImg.filename);
          buildMaps();
          render();
          toast("Image uploaded! Add metadata below.", "success");
        } else if (_checkCount2 > 120) {
          clearInterval(pollTimer);
          S.$imageField.hide();
          toast("Upload timed out. If you selected a file, try saving the node first, then re-open this page.", "warning");
        }
      }, 500);
    }
    function renderImagePicker(options) {
      if (!getImages) _importImageHelpers();
      options = options || {};
      var mode = options.mode || "multi";
      var selectedIds = options.selectedIds || [];
      var filterCategory = options.category || "";
      var imgs = getImages({ category: filterCategory });
      var cats = S.meta && S.meta.image_categories || [];
      var html = '<div class="scp-img-picker">';
      html += '<div class="scp-img-picker-filters">';
      html += '<select class="scp-select scp-select-sm scp-img-picker-cat">';
      html += '<option value="">All</option>';
      for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + (filterCategory === cats[ci].id ? " selected" : "") + ">" + esc(cats[ci].label) + "</option>";
      html += "</select>";
      html += '<span class="scp-text-xs scp-text-muted">' + imgs.length + " image" + (imgs.length !== 1 ? "s" : "") + "</span>";
      html += "</div>";
      if (imgs.length === 0) {
        html += '<div class="scp-empty-state scp-empty-state--compact"><p>No images available. Upload reference images first.</p></div>';
      } else {
        html += '<div class="scp-img-picker-grid">';
        for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          var isChecked = selectedIds.indexOf(img.fid) > -1;
          html += '<label class="scp-img-picker-item' + (isChecked ? " scp-img-picker-item-selected" : "") + '">';
          html += '<input type="' + (mode === "single" ? "radio" : "checkbox") + '" name="scp_img_pick" class="scp-img-picker-check" data-fid="' + esc(img.fid) + '"' + (isChecked ? " checked" : "") + ">";
          html += '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy">';
          if (img.star) html += '<span class="scp-img-picker-star">\u2605</span>';
          html += '<span class="scp-img-picker-label">' + esc(truncate(img.filename, 16)) + "</span>";
          html += "</label>";
        }
        html += "</div>";
      }
      html += "</div>";
      return html;
    }
    function openImagePickerModal(options, callback) {
      options = options || {};
      var content = renderImagePicker(options);
      openModal("Select Reference Images", content, {
        size: "lg",
        saveLabel: "Select",
        onSave: function() {
          var selected = [];
          $(".scp-img-picker-check:checked").each(function() {
            selected.push($(this).data("fid"));
          });
          closeModal();
          if (callback) callback(selected);
        }
      });
      $(document).off("change.scp-imgpick-cat", ".scp-img-picker-cat").on("change.scp-imgpick-cat", ".scp-img-picker-cat", function() {
        var cat = $(this).val();
        var newContent = renderImagePicker({ mode: options.mode, selectedIds: options.selectedIds, category: cat });
        $(".scp-modal-body").html(newContent);
      });
    }
    function setupImagesEvents() {
    }
    function updateAIStatusIndicator() {
      var $el = $("#scpAIStatus");
      if (!$el.length) return;
      if (LLMService.isConfigured()) {
        var def = LLMService.getDefault();
        if (def) {
          var provs = LLMService.getActiveProviders();
          var provLabel = def.provider;
          for (var i = 0; i < provs.length; i++) {
            if (provs[i].id === def.provider) {
              provLabel = provs[i].label;
              break;
            }
          }
          var modelLabel = def.model;
          var models = LLMService.getActiveModels(def.provider);
          for (var j = 0; j < models.length; j++) {
            if (models[j].id === def.model) {
              modelLabel = models[j].label || models[j].id;
              break;
            }
          }
          var displayText = provLabel + " / " + modelLabel;
          if (displayText.length > 35) displayText = displayText.substring(0, 32) + "\u2026";
          $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">' + esc(displayText) + "</span>");
          $el.attr("title", "AI: " + provLabel + " / " + modelLabel + " \u2014 click to change");
        } else {
          $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">AI Ready</span>');
          $el.attr("title", "AI active \u2014 click to configure");
        }
      } else {
        $el.html('<span class="scp-ai-status-dot scp-ai-status-off"></span><span class="scp-ai-status-label">No AI</span>');
        $el.attr("title", "AI not configured \u2014 click for setup");
      }
    }
    function testAIConnection() {
      if (!LLMService.isConfigured()) {
        toast("No AI providers configured. Add providers in your user profile \u2192 LLM Config field.", "warning");
        return;
      }
      toast("Testing AI connection...", "info");
      var $btn = $('[data-action="test-ai-connection"]');
      $btn.prop("disabled", true).html(icon("spinner") + " Testing...");
      LLMService.callAI('Respond with exactly: {"status":"ok","message":"Connection successful"}', function(text) {
        $btn.prop("disabled", false).html(icon("bolt") + " Test Connection");
        try {
          var parsed = parseJSON(text);
          if (parsed.status === "ok") {
            toast("AI connection successful!", "success");
            $btn.after('<span class="scp-ai-test-result scp-ai-test-ok" style="margin-left:var(--scp-space-2)">' + icon("circle-check") + " Connected</span>");
            setTimeout(function() {
              $(".scp-ai-test-result").fadeOut(400, function() {
                $(this).remove();
              });
            }, 4e3);
          } else {
            toast("AI responded but format unexpected: " + text.substring(0, 100), "warning");
          }
        } catch (e) {
          toast("AI connection works! (Response: " + text.substring(0, 60) + ")", "success");
          $btn.after('<span class="scp-ai-test-result scp-ai-test-ok" style="margin-left:var(--scp-space-2)">' + icon("circle-check") + " Connected</span>");
          setTimeout(function() {
            $(".scp-ai-test-result").fadeOut(400, function() {
              $(this).remove();
            });
          }, 4e3);
        }
      }, function(err) {
        $btn.prop("disabled", false).html(icon("bolt") + " Test Connection");
        toast("AI connection failed: " + err, "error");
        $btn.after('<span class="scp-ai-test-result scp-ai-test-fail" style="margin-left:var(--scp-space-2)">' + icon("circle-xmark") + " Failed</span>");
        setTimeout(function() {
          $(".scp-ai-test-result").fadeOut(400, function() {
            $(this).remove();
          });
        }, 6e3);
      }, "test-connection");
    }
    function setupPart2BEvents() {
      $(document).off("click.scp2b-stab", '[data-action="settings-tab"]').on("click.scp2b-stab", '[data-action="settings-tab"]', function(e) {
        e.preventDefault();
        S.settingsTab = $(this).data("tab");
        render();
      });
      $(document).off("click.scp2b-ss", '[data-action="save-settings"]').on("click.scp2b-ss", '[data-action="save-settings"]', function(e) {
        e.preventDefault();
        saveAllSettings();
      });
      $(document).off("change.scp2b-aip", ".scp-ai-provider-select").on("change.scp2b-aip", ".scp-ai-provider-select", function() {
        var actionId = $(this).data("action-id");
        var pid = $(this).val();
        var models = LLMService.getActiveModels(pid);
        var $modSel = $('.scp-ai-model-select[data-action-id="' + actionId + '"]').empty();
        for (var i = 0; i < models.length; i++) $modSel.append('<option value="' + esc(models[i].id) + '" data-temp="' + (models[i].temperature !== void 0 ? models[i].temperature : 1) + '" data-tokens="' + (models[i].max_tokens || 8192) + '">' + esc(models[i].label) + "</option>");
      });
      $(document).off("click.scp2b-ac", '[data-action="add-config"]').on("click.scp2b-ac", '[data-action="add-config"]', function(e) {
        e.preventDefault();
        addConfigItem($(this).data("type"));
      });
      $(document).off("click.scp2b-ec", '[data-action="edit-config"]').on("click.scp2b-ec", '[data-action="edit-config"]', function(e) {
        e.preventDefault();
        editConfigItem($(this).data("type"), parseInt($(this).data("index"), 10));
      });
      $(document).off("click.scp2b-dc", '[data-action="delete-config"]').on("click.scp2b-dc", '[data-action="delete-config"]', function(e) {
        e.preventDefault();
        deleteConfigItem($(this).data("type"), parseInt($(this).data("index"), 10));
      });
      $(document).off("click.scp2b-cap", '[data-action="clear-action-pref"]').on("click.scp2b-cap", '[data-action="clear-action-pref"]', function(e) {
        e.preventDefault();
        var key = $(this).data("action-key");
        if (key && S.meta.aiPreferences && S.meta.aiPreferences.perAction) {
          delete S.meta.aiPreferences.perAction[key];
          syncToTextarea();
          render();
        }
      });
      $(document).off("click.scp2b-exp", '[data-action="export-json"]').on("click.scp2b-exp", '[data-action="export-json"]', function(e) {
        e.preventDefault();
        exportJSON("combined");
      });
      $(document).off("click.scp2b-imp", '[data-action="import-json"]').on("click.scp2b-imp", '[data-action="import-json"]', function(e) {
        e.preventDefault();
        importJSON();
      });
      $(document).off("click.scp2b-tac", '[data-action="test-ai-connection"]').on("click.scp2b-tac", '[data-action="test-ai-connection"]', function(e) {
        e.preventDefault();
        testAIConnection();
      });
      $(document).off("click.scp2b-rac", '[data-action="rescan-ai-config"]').on("click.scp2b-rac", '[data-action="rescan-ai-config"]', function(e) {
        e.preventDefault();
        var $btn = $(this);
        $btn.prop("disabled", true).html(icon("spinner") + " Scanning...");
        setTimeout(function() {
          var found = LLMService.rescanConfig();
          $btn.prop("disabled", false).html(icon("refresh") + " Re-scan Page");
          updateAIStatusIndicator();
          $(".scp-ai-picker-loading").each(function() {
            var actionId = $(this).data("pending-action");
            if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
          });
          if (found) {
            toast("AI config found! " + LLMService.getProviderCount() + " provider(s) detected.", "success");
          } else {
            toast("No AI config found on page. Check your Drupal Views setup.", "warning");
          }
          render();
        }, 300);
      });
      $(document).off("click.scp2b-tp", '[data-action="test-provider"]').on("click.scp2b-tp", '[data-action="test-provider"]', function(e) {
        e.preventDefault();
        var pid = $(this).data("provider");
        var $btn = $(this);
        $btn.prop("disabled", true).html(icon("spinner") + " Testing...");
        $btn.closest(".scp-ai-provider-card-actions").find(".scp-ai-test-result").remove();
        LLMService.testProvider(pid, function(ok, msg, elapsed) {
          $btn.prop("disabled", false).html(icon("bolt") + " Test");
          var resultClass = ok ? "scp-ai-test-ok" : "scp-ai-test-fail";
          var resultIcon = ok ? "circle-check" : "circle-xmark";
          $btn.after('<span class="scp-ai-test-result ' + resultClass + '">' + icon(resultIcon) + " " + esc(msg) + "</span>");
          setTimeout(function() {
            $btn.closest(".scp-ai-provider-card-actions").find(".scp-ai-test-result").fadeOut(400, function() {
              $(this).remove();
            });
          }, 5e3);
          if (ok) toast(LLMService.getProviderInfo(pid).label + " connected (" + elapsed + "ms)", "success");
          else toast(LLMService.getProviderInfo(pid).label + " failed: " + msg, "error");
        });
      });
      $(document).off("click.scp2b-sdp", '[data-action="set-default-provider"]').on("click.scp2b-sdp", '[data-action="set-default-provider"]', function(e) {
        e.preventDefault();
        var pid = $(this).data("provider");
        var pInfo = LLMService.getProviderInfo(pid);
        if (!pInfo || !pInfo.models.length) return;
        var defModel = pInfo.models[0];
        for (var i = 0; i < pInfo.models.length; i++) {
          if (pInfo.models[i].is_default) {
            defModel = pInfo.models[i];
            break;
          }
        }
        S.meta.aiPreferences = S.meta.aiPreferences || {};
        S.meta.aiPreferences.appDefault = { provider: pid, model: defModel.id };
        syncToTextarea();
        updateAIStatusIndicator();
        render();
        toast("Default set to " + pInfo.label + " / " + defModel.label, "success");
      });
      $(document).off("click.scp2b-caap", '[data-action="clear-all-action-prefs"]').on("click.scp2b-caap", '[data-action="clear-all-action-prefs"]', function(e) {
        e.preventDefault();
        if (!confirm("Clear all per-action AI overrides? All actions will use the default provider.")) return;
        S.meta.aiPreferences = S.meta.aiPreferences || {};
        S.meta.aiPreferences.perAction = {};
        syncToTextarea();
        render();
        toast("All overrides cleared", "success");
      });
      $(document).off("click.scp2b-asi", "#scpAIStatus").on("click.scp2b-asi", "#scpAIStatus", function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $dropdown = $("#scpAIQuickSwitch");
        if ($dropdown.is(":visible")) {
          $dropdown.hide();
          return;
        }
        if (!LLMService.isConfigured()) {
          S.settingsTab = "ai";
          navigate("settings");
          return;
        }
        var provs = LLMService.getActiveProviders();
        var def = LLMService.getDefault();
        var ddHtml = '<div class="scp-ai-dropdown-header">' + icon("sparkles") + " Quick Switch AI</div>";
        for (var pi = 0; pi < provs.length; pi++) {
          var prov = provs[pi];
          var pInfo = LLMService.getProviderInfo(prov.id);
          if (!pInfo) continue;
          ddHtml += '<div class="scp-ai-dropdown-provider">' + esc(pInfo.label) + "</div>";
          for (var mi = 0; mi < pInfo.models.length; mi++) {
            var model = pInfo.models[mi];
            var isActive = def && def.provider === prov.id && def.model === model.id;
            ddHtml += '<button class="scp-ai-dropdown-model' + (isActive ? " scp-ai-dropdown-model-active" : "") + '" data-action="quick-switch-ai" data-provider="' + esc(prov.id) + '" data-model="' + esc(model.id) + '">';
            ddHtml += "<span>" + esc(model.label) + "</span>";
            if (isActive) ddHtml += icon("check");
            ddHtml += "</button>";
          }
        }
        ddHtml += '<div class="scp-ai-dropdown-footer"><a href="#" data-action="ai-dropdown-settings">' + icon("gear") + " AI Settings</a></div>";
        $dropdown.html(ddHtml).show();
      });
      $(document).off("click.scp2b-ddclose").on("click.scp2b-ddclose", function(e) {
        if (!$(e.target).closest("#scpAIQuickSwitch, #scpAIStatus").length) {
          $("#scpAIQuickSwitch").hide();
        }
      });
      $(document).off("click.scp2b-qsa", '[data-action="quick-switch-ai"]').on("click.scp2b-qsa", '[data-action="quick-switch-ai"]', function(e) {
        e.preventDefault();
        var pid = $(this).data("provider");
        var mid = $(this).data("model");
        S.meta.aiPreferences = S.meta.aiPreferences || {};
        S.meta.aiPreferences.appDefault = { provider: pid, model: mid };
        syncToTextarea();
        updateAIStatusIndicator();
        $("#scpAIQuickSwitch").hide();
        var pInfo = LLMService.getProviderInfo(pid);
        var modelLabel = mid;
        if (pInfo) {
          for (var i = 0; i < pInfo.models.length; i++) {
            if (pInfo.models[i].id === mid) {
              modelLabel = pInfo.models[i].label;
              break;
            }
          }
        }
        toast("Switched to " + (pInfo ? pInfo.label : pid) + " / " + modelLabel, "success");
      });
      $(document).off("click.scp2b-dds", '[data-action="ai-dropdown-settings"]').on("click.scp2b-dds", '[data-action="ai-dropdown-settings"]', function(e) {
        e.preventDefault();
        $("#scpAIQuickSwitch").hide();
        S.settingsTab = "ai";
        navigate("settings");
      });
      $(document).off("click.scp2b-acl", ".scp-ai-config-link").on("click.scp2b-acl", ".scp-ai-config-link", function(e) {
        e.preventDefault();
        S.settingsTab = "ai";
        navigate("settings");
      });
      $(document).off("click.scp2b-rm", '[data-action="research-mode"]').on("click.scp2b-rm", '[data-action="research-mode"]', function(e) {
        e.preventDefault();
        S._researchMode = $(this).data("mode");
        render();
      });
      $(document).off("click.scp2b-rqr", '[data-action="run-quick-research"]').on("click.scp2b-rqr", '[data-action="run-quick-research"]', function(e) {
        e.preventDefault();
        runQuickResearch();
      });
      $(document).off("click.scp2b-rar", '[data-action="run-advanced-research"]').on("click.scp2b-rar", '[data-action="run-advanced-research"]', function(e) {
        e.preventDefault();
        runAdvancedResearch();
      });
      $(document).off("click.scp2b-pi", '[data-action="promote-idea"]').on("click.scp2b-pi", '[data-action="promote-idea"]', function(e) {
        e.preventDefault();
        promoteResearchIdea($(this).data("session"), $(this).data("idea"));
      });
      $(document).off("click.scp2b-ri", '[data-action="rate-idea"]').on("click.scp2b-ri", '[data-action="rate-idea"]', function(e) {
        e.preventDefault();
        var sesId = $(this).data("session");
        var ideaId = $(this).data("idea");
        var rating = parseInt($(this).data("rating"), 10);
        var session = S.researchMap[sesId];
        if (!session) return;
        for (var i = 0; i < (session.results || []).length; i++) {
          if (session.results[i].id === ideaId) {
            session.results[i].rating = rating;
            break;
          }
        }
        syncToTextarea();
        render();
      });
      $(document).off("click.scp2b-drs", '[data-action="delete-research-session"]').on("click.scp2b-drs", '[data-action="delete-research-session"]', function(e) {
        e.preventDefault();
        var sesId = $(this).data("session-id");
        var session = S.researchMap[sesId];
        if (!session) return;
        var ideaCount = (session.results || []).length;
        openConfirmDialog({
          title: "Delete Research Session",
          message: 'Delete "' + (session.topic || session.title || "Research Session") + '" with ' + ideaCount + " idea" + (ideaCount !== 1 ? "s" : "") + "? This cannot be undone.",
          confirmLabel: "Delete",
          danger: true,
          onConfirm: function() {
            S.data.research = S.data.research || { sessions: [] };
            S.data.research.sessions = S.data.research.sessions.filter(function(s) {
              return s.id !== sesId;
            });
            logActivity("research_created", "", "", "Deleted research session: " + (session.topic || session.title || sesId));
            snapshot("Delete research session");
            buildMaps();
            render();
            syncToTextarea();
            toast("Research session deleted", "success");
          }
        });
      });
      $(document).off("click.scp2b-rrs", '[data-action="rename-research-session"]').on("click.scp2b-rrs", '[data-action="rename-research-session"]', function(e) {
        e.preventDefault();
        var sesId = $(this).data("session-id");
        var session = S.researchMap[sesId];
        if (!session) return;
        var currentName = session.topic || session.title || "";
        var newName = prompt("Rename session:", currentName);
        if (newName !== null && newName.trim()) {
          session.topic = newName.trim();
          session.title = newName.trim();
          session.updated = (/* @__PURE__ */ new Date()).toISOString();
          snapshot("Rename research session");
          syncToTextarea();
          render();
          toast("Session renamed", "success");
        }
      });
      $(document).off("change.scp2b-rt", "#scpResearchTemplate").on("change.scp2b-rt", "#scpResearchTemplate", function() {
        var templateId = $(this).val();
        var templates = S.meta.settings && S.meta.settings.research_templates || [];
        var template = templates.find(function(t) {
          return t.id === templateId;
        });
        var $vars = $("#scpTemplateVars").empty();
        if (template && template.variables) {
          template.variables.forEach(function(v) {
            $vars.append('<div class="scp-form-group"><label>' + v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ") + '</label><input type="text" class="scp-input" id="scpVar_' + v + '" placeholder="Enter ' + v + '..."></div>');
          });
        }
      });
      $(document).off("click.scp2b-art", '[data-action="add-research-template"]').on("click.scp2b-art", '[data-action="add-research-template"]', function(e) {
        e.preventDefault();
        var fields = '<div class="scp-editor-form"><div class="scp-form-group"><label>Name</label><input type="text" class="scp-input" data-field="name"></div>';
        fields += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description"></div>';
        fields += '<div class="scp-form-group"><label>Prompt Template</label><textarea class="scp-textarea" data-field="prompt" rows="6" placeholder="Use {variable_name} for template variables..."></textarea></div>';
        fields += '<div class="scp-form-group"><label>Variables (comma-separated)</label><input type="text" class="scp-input" data-field="variables" placeholder="topic, count, audience, tone"></div></div>';
        openModal("New Research Template", fields, { size: "lg", onSave: function() {
          var d = collectModalFields();
          if (!d.name) {
            toast("Name required", "warning");
            return;
          }
          var tmpl = { id: generateId("rt"), name: d.name.trim(), description: d.description || "", prompt: d.prompt || "", variables: (d.variables || "").split(",").map(function(v) {
            return v.trim();
          }).filter(Boolean) };
          S.meta.settings.research_templates = S.meta.settings.research_templates || [];
          S.meta.settings.research_templates.push(tmpl);
          snapshot("Add template");
          closeModal();
          render();
          syncToTextarea();
          toast("Template created", "success");
        } });
      });
      $(document).off("click.scp2b-drt", '[data-action="delete-research-template"]').on("click.scp2b-drt", '[data-action="delete-research-template"]', function(e) {
        e.preventDefault();
        var idx = parseInt($(this).data("index"), 10);
        var templates = S.meta.settings.research_templates || [];
        if (templates[idx]) {
          openConfirmDialog({
            title: "Delete Template",
            message: 'Delete "' + templates[idx].name + '"?',
            confirmLabel: "Delete",
            danger: true,
            onConfirm: function() {
              templates.splice(idx, 1);
              snapshot("Delete template");
              render();
              syncToTextarea();
              toast("Deleted", "success");
            }
          });
        }
      });
      $(document).off("input.scp2b-bdc", ".scp-brand-design-color").on("input.scp2b-bdc", ".scp-brand-design-color", function() {
        var path = $(this).data("bd-path");
        var val = $(this).val();
        $(this).siblings('.scp-brand-design-field[data-bd-path="' + path + '"]').val(val);
      });
      $(document).off("blur.scp2b-bdf", 'input.scp-brand-design-field[data-bd-path*="colors."]').on("blur.scp2b-bdf", 'input.scp-brand-design-field[data-bd-path*="colors."]', function() {
        var path = $(this).data("bd-path");
        var val = $(this).val();
        if (/^#[0-9a-fA-F]{6}$/.test(val)) $(this).siblings('.scp-brand-design-color[data-bd-path="' + path + '"]').val(val);
      });
      $(document).off("click.scp2b-abr", '[data-action="add-brand-ref"]').on("click.scp2b-abr", '[data-action="add-brand-ref"]', function(e) {
        e.preventDefault();
        var role = $(this).data("role");
        var currentIds = S.meta.settings.brand_design && S.meta.settings.brand_design.reference_image_ids && S.meta.settings.brand_design.reference_image_ids[role] || [];
        openImagePickerModal({ mode: "multi", selectedIds: currentIds }, function(selected) {
          S.meta.settings.brand_design = S.meta.settings.brand_design || {};
          S.meta.settings.brand_design.reference_image_ids = S.meta.settings.brand_design.reference_image_ids || {};
          S.meta.settings.brand_design.reference_image_ids[role] = selected;
          syncToTextarea();
          render();
        });
      });
      $(document).off("click.scp2b-rbr", '[data-action="remove-brand-ref"]').on("click.scp2b-rbr", '[data-action="remove-brand-ref"]', function(e) {
        e.preventDefault();
        var role = $(this).data("role");
        var fid = $(this).data("fid");
        if (S.meta.settings.brand_design && S.meta.settings.brand_design.reference_image_ids && S.meta.settings.brand_design.reference_image_ids[role]) {
          S.meta.settings.brand_design.reference_image_ids[role] = S.meta.settings.brand_design.reference_image_ids[role].filter(function(id) {
            return id !== fid;
          });
          syncToTextarea();
          render();
        }
      });
      $(document).off("click.scp2b-rgp", '[data-action="regenerate-brand-prefix"]').on("click.scp2b-rgp", '[data-action="regenerate-brand-prefix"]', function(e) {
        e.preventDefault();
        saveAllSettings();
        var bd = S.meta.settings.brand_design || {};
        bd.brand_prompt_prefix = "";
        S.meta.settings.brand_design = bd;
        syncToTextarea();
        render();
        toast("Brand prefix regenerated from fields", "success");
      });
      $(document).off("click.scp2b-ui", '[data-action="upload-image"]').on("click.scp2b-ui", '[data-action="upload-image"]', function(e) {
        e.preventDefault();
        triggerImageUpload();
      });
      $(document).off("click.scp2b-si", '[data-action="select-image"]').on("click.scp2b-si", '[data-action="select-image"]', function(e) {
        e.preventDefault();
        var fid = $(this).data("fid");
        S.selectedImageId = S.selectedImageId === fid ? null : fid;
        render();
      });
      $(document).off("click.scp2b-cid", '[data-action="close-image-detail"]').on("click.scp2b-cid", '[data-action="close-image-detail"]', function(e) {
        if ($(e.target).hasClass("scp-img-detail-backdrop") || $(e.target).closest('[data-action="close-image-detail"]').is(".scp-btn-icon")) {
          S.selectedImageId = null;
          render();
        }
      });
      $(document).off("click.scp2b-tis", '[data-action="toggle-image-star"]').on("click.scp2b-tis", '[data-action="toggle-image-star"]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleImageStar($(this).data("fid"));
        render();
      });
      $(document).off("blur.scp2b-imf", ".scp-img-meta-field").on("blur.scp2b-imf", ".scp-img-meta-field", function() {
        var fid = $(this).data("fid");
        var field = $(this).data("field");
        var val = $(this).val();
        if (fid && field) saveImageMeta(fid, field, val);
      });
      $(document).off("change.scp2b-imfc", "select.scp-img-meta-field").on("change.scp2b-imfc", "select.scp-img-meta-field", function() {
        var fid = $(this).data("fid");
        var field = $(this).data("field");
        var val = $(this).val();
        if (fid && field) {
          saveImageMeta(fid, field, val);
          render();
        }
      });
      $(document).off("click.scp2b-dim", '[data-action="delete-image-meta"]').on("click.scp2b-dim", '[data-action="delete-image-meta"]', function(e) {
        e.preventDefault();
        deleteImageMeta($(this).data("fid"));
      });
      $(document).off("click.scp2b-ciu", '[data-action="copy-image-url"]').on("click.scp2b-ciu", '[data-action="copy-image-url"]', function(e) {
        e.preventDefault();
        navigator.clipboard.writeText($(this).data("url")).then(function() {
          toast("URL copied!", "success");
        });
      });
      $(document).off("click.scp2b-ivm", '[data-action="image-view-mode"]').on("click.scp2b-ivm", '[data-action="image-view-mode"]', function(e) {
        e.preventDefault();
        S.imageViewMode = $(this).data("mode");
        render();
      });
      $(document).off("click.scp2b-tisf", '[data-action="toggle-img-star-filter"]').on("click.scp2b-tisf", '[data-action="toggle-img-star-filter"]', function(e) {
        e.preventDefault();
        S.imageFilter.star = !S.imageFilter.star;
        render();
      });
      $(document).off("change.scp2b-imgf", ".scp-img-filter").on("change.scp2b-imgf", ".scp-img-filter", function() {
        var filter = $(this).data("filter");
        S.imageFilter[filter] = $(this).val();
        render();
      });
      $(document).off("input.scp2b-imgs", ".scp-img-search").on("input.scp2b-imgs", ".scp-img-search", window._scpDebounce(function() {
        S.imageFilter.search = $(this).val();
        render();
      }, 300));
    }
    function setupResearchEvents() {
      setTimeout(function() {
        $("#scpResearchTemplate").trigger("change");
      }, 100);
    }
    function setupSettingsEvents() {
    }
    function setupKeyboardShortcuts() {
      $(document).off("keydown.scp2b-sk").on("keydown.scp2b-sk", function(e) {
        if ($(e.target).is('input, textarea, select, [contenteditable="true"]')) return;
        if (e.key === "1") navigate("dashboard");
        if (e.key === "2") navigate("research");
        if (e.key === "3") navigate("topics");
        if (e.key === "4") navigate("series");
        if (e.key === "5") navigate("posts");
        if (e.key === "6") navigate("calendar");
        if (e.key === "7") navigate("images");
        if (e.key === "8") navigate("activity");
        if (e.key === "9") navigate("settings");
        if (e.key === "/" && S.currentView === "posts") {
          e.preventDefault();
          $("#scpPostSearch").focus();
        }
      });
    }
    window._scpUpdateAIStatusIndicator = updateAIStatusIndicator;
    window._scpPart2B = {
      // AI actions (called by Part 2A delegates)
      aiResearchAngles,
      aiResearchHooks,
      aiWriteContent,
      aiImproveContent,
      aiSuggestSlides,
      aiGenerateScript,
      aiGenerateMediaPrompt,
      buildStructuredPrompt,
      aiAdaptForPlatform,
      // Phase B: Visual plan + structured script
      aiGenerateVisualPlan,
      aiGenerateStructuredScript,
      // Services
      LLMService,
      BrandService,
      renderInlinePicker: LLMService.renderInlinePicker.bind(LLMService),
      isAIConfigured: LLMService.isConfigured.bind(LLMService),
      // Research
      runQuickResearch,
      runAdvancedResearch,
      // Settings & data
      saveAllSettings,
      exportJSON,
      importJSON,
      // AI status
      updateAIStatusIndicator,
      testAIConnection,
      // LLMService Phase 3
      rescanAIConfig: function() {
        return LLMService.rescanConfig();
      },
      testProvider: function(pid, cb) {
        LLMService.testProvider(pid, cb);
      },
      // Images
      renderImagePicker,
      openImagePickerModal,
      saveImageMeta,
      toggleImageStar,
      recordImageUsage,
      triggerImageUpload
    };
    console.log("[SCP] Part 2B loaded");
  })(jQuery, Drupal);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvcmUvc2NwLXBhcnQxLmpzIiwgIi4uL3NyYy9lZGl0aW5nL3NjcC1wYXJ0MmEuanMiLCAiLi4vc3JjL2FpL3NjcC1wYXJ0MmIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogU29jaWFsIENvbnRlbnQgUGxhbm5lciB2MS4wIC0gUGFydCAxOiBDb3JlIEVuZ2luZVxuICpcbiAqIFNpbmdsZS1icmFuZCBzb2NpYWwgbWVkaWEgY29udGVudCBwbGFubmluZyBhcHAgd2l0aCByZXNlYXJjaCxcbiAqIDYtc3RlcCBwb3N0IHBpcGVsaW5lLCA0IHBvc3QgdHlwZXMsIDQgcGxhdGZvcm1zLCBhbmQgZmxleGlibGUgdGFnIGdyb3VwaW5nLlxuICpcbiAqIFNlY3Rpb25zOlxuICogIDEuIENvbnN0YW50cyAoMTIgb2JqZWN0cylcbiAqICAyLiBTdGF0ZSBvYmplY3RcbiAqICAzLiBJbml0aWFsaXphdGlvblxuICogIDQuIE1hcCBidWlsZGVyc1xuICogIDUuIE5hdmlnYXRpb25cbiAqICA2LiBVdGlsaXRpZXMgKGljb25zIDkwKywgYmFkZ2VzLCBnZXR0ZXJzKVxuICogIDcuIEFwcCBzaGVsbCAoaGVhZGVyLCBzaWRlYmFyLCA3IG5hdiBpdGVtcylcbiAqICA4LiBEYXNoYm9hcmQgdmlldyAoNiBwYW5lbHMpXG4gKiAgOS4gUG9zdHMgdmlldyAoc3BsaXQgcGFuZTogZ3JvdXBlZCBsaXN0ICsgcGlwZWxpbmUgZWRpdG9yIHNoZWxsKVxuICogMTAuIENhbGVuZGFyIHZpZXdcbiAqIDExLiBUb3BpY3MgdmlldyAobGlzdCArIGRldGFpbClcbiAqIDEyLiBBY3Rpdml0eSB2aWV3XG4gKiAxMy4gUGxhY2Vob2xkZXIgdmlld3MgKHJlc2VhcmNoLCBzZXR0aW5ncylcbiAqIDE0LiBQb3N0IGZpbHRlcmluZyAmIHNvcnRpbmdcbiAqIDE1LiBFdmVudCBoYW5kbGVyc1xuICogMTYuIENSVUQgaGVscGVyc1xuICogMTcuIFN5bmMgJiBzYXZlXG4gKiAxOC4gVG9hc3QgJiBhdXRvLXN0YXR1cyBlbmdpbmVcbiAqIDE5LiBBUEkgZXhwb3J0cyAofjYwKVxuICpcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cbihmdW5jdGlvbigkLCBEcnVwYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHdpbmRvdy5fc2NwUmVuZGVyZXJzID0gd2luZG93Ll9zY3BSZW5kZXJlcnMgfHwge307XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTogQ09OU1RBTlRTXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBBUFBfVklFV1MgPSB7XG4gICAgJ2Rhc2hib2FyZCc6IHsgb3JkZXI6IDEsIGxhYmVsOiAnRGFzaGJvYXJkJywgIGljb246ICdjaGFydC1waWUnLCAgICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJ2aWV3ICYgcGlwZWxpbmUnIH0sXG4gICAgJ3Jlc2VhcmNoJzogIHsgb3JkZXI6IDIsIGxhYmVsOiAnUmVzZWFyY2gnLCAgIGljb246ICdmbGFzaycsICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FJLXBvd2VyZWQgaWRlYXRpb24nIH0sXG4gICAgJ3RvcGljcyc6ICAgIHsgb3JkZXI6IDMsIGxhYmVsOiAnVG9waWNzJywgICAgIGljb246ICd0YWdzJywgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZW1lcyAmIGNvbnRlbnQgcGlsbGFycycgfSxcbiAgICAnc2VyaWVzJzogICAgeyBvcmRlcjogNCwgbGFiZWw6ICdTZXJpZXMnLCAgICAgaWNvbjogJ2xheWVyLWdyb3VwJywgICAgICAgIGRlc2NyaXB0aW9uOiAnTXVsdGktcG9zdCBjb250ZW50IGFyY3MnIH0sXG4gICAgJ3Bvc3RzJzogICAgIHsgb3JkZXI6IDUsIGxhYmVsOiAnUG9zdHMnLCAgICAgIGljb246ICd0aHVtYnRhY2snLCAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbnRlbnQgcGlwZWxpbmUnIH0sXG4gICAgJ2NhbGVuZGFyJzogIHsgb3JkZXI6IDYsIGxhYmVsOiAnQ2FsZW5kYXInLCAgIGljb246ICdjYWxlbmRhcicsICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NjaGVkdWxlIHZpZXcnIH0sXG4gICAgJ2ltYWdlcyc6ICAgIHsgb3JkZXI6IDcsIGxhYmVsOiAnSW1hZ2VzJywgICAgIGljb246ICdpbWFnZXMnLCAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZmVyZW5jZSBpbWFnZSBsaWJyYXJ5JyB9LFxuICAgICdhY3Rpdml0eSc6ICB7IG9yZGVyOiA4LCBsYWJlbDogJ0FjdGl2aXR5JywgICBpY29uOiAnY2xvY2stcm90YXRlLWxlZnQnLCAgZGVzY3JpcHRpb246ICdGdWxsIGFjdGl2aXR5IGxvZycgfSxcbiAgICAnc2V0dGluZ3MnOiAgeyBvcmRlcjogOSwgbGFiZWw6ICdTZXR0aW5ncycsICAgaWNvbjogJ2dlYXInLCAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV29ya3NwYWNlIGNvbmZpZ3VyYXRpb24nIH1cbiAgfTtcblxuICB2YXIgUE9TVF9UWVBFUyA9IHtcbiAgICAnaW1hZ2UnOiAgICB7IGtleTogJ2ltYWdlJywgICAgbGFiZWw6ICdTaW5nbGUgSW1hZ2UnLCBpY29uOiAnaW1hZ2UnLCAgICAgIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAnY2Fyb3VzZWwnOiB7IGtleTogJ2Nhcm91c2VsJywgbGFiZWw6ICdDYXJvdXNlbCcsICAgICBpY29uOiAnaW1hZ2VzJywgICAgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAndmlkZW8nOiAgICB7IGtleTogJ3ZpZGVvJywgICAgbGFiZWw6ICdWaWRlbycsICAgICAgICBpY29uOiAndmlkZW8nLCAgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAndGV4dCc6ICAgICB7IGtleTogJ3RleHQnLCAgICAgbGFiZWw6ICdUZXh0IE9ubHknLCAgICBpY29uOiAnYWxpZ24tbGVmdCcsIGNvbG9yOiAnIzBkOTA0ZicgfVxuICB9O1xuXG4gIHZhciBQTEFURk9STVMgPSB7XG4gICAgJ2xpbmtlZGluJzogIHsga2V5OiAnbGlua2VkaW4nLCAgbGFiZWw6ICdMaW5rZWRJbicsICBpY29uOiAnbGlua2VkaW4nLCAgYnJhbmRJY29uOiB0cnVlLCBjb2xvcjogJyMwMDc3YjUnIH0sXG4gICAgJ2luc3RhZ3JhbSc6IHsga2V5OiAnaW5zdGFncmFtJywgbGFiZWw6ICdJbnN0YWdyYW0nLCBpY29uOiAnaW5zdGFncmFtJywgYnJhbmRJY29uOiB0cnVlLCBjb2xvcjogJyNlNDQwNWYnIH0sXG4gICAgJ2ZhY2Vib29rJzogIHsga2V5OiAnZmFjZWJvb2snLCAgbGFiZWw6ICdGYWNlYm9vaycsICBpY29uOiAnZmFjZWJvb2snLCAgYnJhbmRJY29uOiB0cnVlLCBjb2xvcjogJyMxODc3ZjInIH0sXG4gICAgJ3lvdXR1YmUnOiAgIHsga2V5OiAneW91dHViZScsICAgbGFiZWw6ICdZb3VUdWJlJywgICBpY29uOiAneW91dHViZScsICAgYnJhbmRJY29uOiB0cnVlLCBjb2xvcjogJyNmZjAwMDAnIH1cbiAgfTtcblxuICB2YXIgUE9TVF9TVEFUVVNFUyA9IHtcbiAgICAnaWRlYSc6ICAgICAgICAgICAgeyBrZXk6ICdpZGVhJywgICAgICAgICAgICBsYWJlbDogJ0lkZWEnLCAgICAgICBpY29uOiAnbGlnaHRidWxiJywgICAgICAgY29sb3I6ICcjZTM3NDAwJywgb3JkZXI6IDAgfSxcbiAgICAncmVzZWFyY2gnOiAgICAgICAgeyBrZXk6ICdyZXNlYXJjaCcsICAgICAgICBsYWJlbDogJ1Jlc2VhcmNoJywgICBpY29uOiAnZmxhc2snLCAgICAgICAgICAgY29sb3I6ICcjOTMzNGU5Jywgb3JkZXI6IDEgfSxcbiAgICAnY29udGVudF93cml0aW5nJzogeyBrZXk6ICdjb250ZW50X3dyaXRpbmcnLCBsYWJlbDogJ0NvbnRlbnQnLCAgICBpY29uOiAncGVuLWZhbmN5JywgICAgICAgY29sb3I6ICcjMWE3M2U4Jywgb3JkZXI6IDIgfSxcbiAgICAnbWVkaWFfcHJvbXB0cyc6ICAgeyBrZXk6ICdtZWRpYV9wcm9tcHRzJywgICBsYWJlbDogJ01lZGlhJywgICAgICBpY29uOiAnd2FuZC1tYWdpYycsICAgICAgY29sb3I6ICcjN2MzYWVkJywgb3JkZXI6IDMgfSxcbiAgICAncGxhdGZvcm1fYWRhcHQnOiAgeyBrZXk6ICdwbGF0Zm9ybV9hZGFwdCcsICBsYWJlbDogJ1BsYXRmb3JtcycsICBpY29uOiAnc2hhcmUtbm9kZXMnLCAgICAgY29sb3I6ICcjMDg5MWIyJywgb3JkZXI6IDQgfSxcbiAgICAncmVhZHknOiAgICAgICAgICAgeyBrZXk6ICdyZWFkeScsICAgICAgICAgICBsYWJlbDogJ1JlYWR5JywgICAgICBpY29uOiAnY2lyY2xlLWNoZWNrJywgICAgY29sb3I6ICcjMGQ5MDRmJywgb3JkZXI6IDUgfSxcbiAgICAnc2NoZWR1bGVkJzogICAgICAgeyBrZXk6ICdzY2hlZHVsZWQnLCAgICAgICBsYWJlbDogJ1NjaGVkdWxlZCcsICBpY29uOiAnY2FsZW5kYXItY2hlY2snLCAgY29sb3I6ICcjMGQ5NDg4Jywgb3JkZXI6IDYgfSxcbiAgICAncHVibGlzaGVkJzogICAgICAgeyBrZXk6ICdwdWJsaXNoZWQnLCAgICAgICBsYWJlbDogJ1B1Ymxpc2hlZCcsICBpY29uOiAncm9ja2V0JywgICAgICAgICAgY29sb3I6ICcjMDU5NjY5Jywgb3JkZXI6IDcgfSxcbiAgICAnYXJjaGl2ZWQnOiAgICAgICAgeyBrZXk6ICdhcmNoaXZlZCcsICAgICAgICBsYWJlbDogJ0FyY2hpdmVkJywgICBpY29uOiAnYm94LWFyY2hpdmUnLCAgICAgY29sb3I6ICcjODA4NjhiJywgb3JkZXI6IDggfVxuICB9O1xuXG4gIHZhciBTVEFUVVNfT1JERVIgPSBbJ2lkZWEnLCAncmVzZWFyY2gnLCAnY29udGVudF93cml0aW5nJywgJ21lZGlhX3Byb21wdHMnLCAncGxhdGZvcm1fYWRhcHQnLCAncmVhZHknLCAnc2NoZWR1bGVkJywgJ3B1Ymxpc2hlZCcsICdhcmNoaXZlZCddO1xuICB2YXIgQUNUSVZFX1NUQVRVU0VTID0gWydpZGVhJywgJ3Jlc2VhcmNoJywgJ2NvbnRlbnRfd3JpdGluZycsICdtZWRpYV9wcm9tcHRzJywgJ3BsYXRmb3JtX2FkYXB0JywgJ3JlYWR5JywgJ3NjaGVkdWxlZCddO1xuXG4gIHZhciBXT1JLRkxPV19HUk9VUFMgPSB7XG4gICAgJ3RvZG8nOiAgICAgIHsga2V5OiAndG9kbycsICAgICAgbGFiZWw6ICdUbyBEbycsICAgICBpY29uOiAnY2xpcGJvYXJkLWxpc3QnLCBjb2xvcjogJyNlMzc0MDAnLCBzdGF0dXNlczogWydpZGVhJ10gfSxcbiAgICAnd29ya2luZyc6ICAgeyBrZXk6ICd3b3JraW5nJywgICBsYWJlbDogJ1dvcmtpbmcnLCAgIGljb246ICdoYW1tZXInLCAgICAgICAgIGNvbG9yOiAnIzFhNzNlOCcsIHN0YXR1c2VzOiBbJ3Jlc2VhcmNoJywgJ2NvbnRlbnRfd3JpdGluZycsICdtZWRpYV9wcm9tcHRzJywgJ3BsYXRmb3JtX2FkYXB0JywgJ3JlYWR5JywgJ3NjaGVkdWxlZCddIH0sXG4gICAgJ3B1Ymxpc2hlZCc6IHsga2V5OiAncHVibGlzaGVkJywgbGFiZWw6ICdQdWJsaXNoZWQnLCBpY29uOiAncm9ja2V0JywgICAgICAgICBjb2xvcjogJyMwNTk2NjknLCBzdGF0dXNlczogWydwdWJsaXNoZWQnXSB9LFxuICAgICd0cmFzaGVkJzogICB7IGtleTogJ3RyYXNoZWQnLCAgIGxhYmVsOiAnVHJhc2hlZCcsICAgaWNvbjogJ2JveC1hcmNoaXZlJywgICAgY29sb3I6ICcjODA4NjhiJywgc3RhdHVzZXM6IFsnYXJjaGl2ZWQnXSB9XG4gIH07XG5cbiAgdmFyIEdST1VQSU5HX09QVElPTlMgPSBbXG4gICAgeyBrZXk6ICd3b3JrZmxvdycsIGxhYmVsOiAnV29ya2Zsb3cnIH0sXG4gICAgeyBrZXk6ICdzdGF0dXMnLCAgIGxhYmVsOiAnU3RhdHVzJyB9LFxuICAgIHsga2V5OiAndHlwZScsICAgICBsYWJlbDogJ1R5cGUnIH0sXG4gICAgeyBrZXk6ICdwbGF0Zm9ybScsIGxhYmVsOiAnUGxhdGZvcm0nIH0sXG4gICAgeyBrZXk6ICd0b3BpYycsICAgIGxhYmVsOiAnVG9waWMnIH0sXG4gICAgeyBrZXk6ICdzZXJpZXMnLCAgIGxhYmVsOiAnU2VyaWVzJyB9LFxuICAgIHsga2V5OiAncHJpb3JpdHknLCBsYWJlbDogJ1ByaW9yaXR5JyB9XG4gIF07XG5cbiAgdmFyIFBJUEVMSU5FX1NURVBTID0gW1xuICAgIHsga2V5OiAnYmFzaWNzJywgICAgbGFiZWw6ICdCYXNpY3MnLCAgICAgaWNvbjogJ2luZm8tY2lyY2xlJywgb3JkZXI6IDAgfSxcbiAgICB7IGtleTogJ3Jlc2VhcmNoJywgIGxhYmVsOiAnUmVzZWFyY2gnLCAgIGljb246ICdmbGFzaycsICAgICAgIG9yZGVyOiAxIH0sXG4gICAgeyBrZXk6ICdjb250ZW50JywgICBsYWJlbDogJ0NvbnRlbnQnLCAgICBpY29uOiAncGVuLWZhbmN5JywgICBvcmRlcjogMiB9LFxuICAgIHsga2V5OiAnbWVkaWEnLCAgICAgbGFiZWw6ICdNZWRpYScsICAgICAgaWNvbjogJ3dhbmQtbWFnaWMnLCAgb3JkZXI6IDMsIHNraXBGb3JUZXh0OiB0cnVlIH0sXG4gICAgeyBrZXk6ICdwbGF0Zm9ybXMnLCBsYWJlbDogJ1BsYXRmb3JtcycsICBpY29uOiAnc2hhcmUtbm9kZXMnLCBvcmRlcjogNCB9LFxuICAgIHsga2V5OiAnc2NoZWR1bGUnLCAgbGFiZWw6ICdTY2hlZHVsZScsICAgaWNvbjogJ2NhbGVuZGFyJywgICAgb3JkZXI6IDUgfVxuICBdO1xuXG4gIHZhciBQUklPUklUWV9MRVZFTFMgPSB7XG4gICAgJ2xvdyc6ICAgIHsga2V5OiAnbG93JywgICAgbGFiZWw6ICdMb3cnLCAgICBpY29uOiAnYXJyb3ctZG93bicsIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAnbWVkaXVtJzogeyBrZXk6ICdtZWRpdW0nLCBsYWJlbDogJ01lZGl1bScsIGljb246ICdtaW51cycsICAgICAgY29sb3I6ICcjZTM3NDAwJyB9LFxuICAgICdoaWdoJzogICB7IGtleTogJ2hpZ2gnLCAgIGxhYmVsOiAnSGlnaCcsICAgaWNvbjogJ2Fycm93LXVwJywgICBjb2xvcjogJyNkOTMwMjUnIH0sXG4gICAgJ3VyZ2VudCc6IHsga2V5OiAndXJnZW50JywgbGFiZWw6ICdVcmdlbnQnLCBpY29uOiAnYm9sdCcsICAgICAgIGNvbG9yOiAnI2JlMTIzYycgfVxuICB9O1xuXG4gIHZhciBBQ1RJVklUWV9UWVBFUyA9IHtcbiAgICAncG9zdF9jcmVhdGVkJzogICAgICAgICAgICB7IGljb246ICdwbHVzJywgICAgICAgIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAncG9zdF91cGRhdGVkJzogICAgICAgICAgICB7IGljb246ICdlZGl0JywgICAgICAgIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAncG9zdF9kZWxldGVkJzogICAgICAgICAgICB7IGljb246ICd0cmFzaCcsICAgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAncG9zdF9zdGF0dXNfY2hhbmdlZCc6ICAgICB7IGljb246ICdyZWZyZXNoJywgICAgIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAncG9zdF9wcm9tb3RlZCc6ICAgICAgICAgICB7IGljb246ICdhcnJvdy1yaWdodCcsIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAncG9zdF9hcmNoaXZlZCc6ICAgICAgICAgICB7IGljb246ICdib3gtYXJjaGl2ZScsIGNvbG9yOiAnIzgwODY4YicgfSxcbiAgICAncG9zdF9yZXNjaGVkdWxlZCc6ICAgICAgICB7IGljb246ICdjYWxlbmRhcicsICAgIGNvbG9yOiAnIzA4OTFiMicgfSxcbiAgICAncmVzZWFyY2hfY3JlYXRlZCc6ICAgICAgICB7IGljb246ICdmbGFzaycsICAgICAgIGNvbG9yOiAnIzkzMzRlOScgfSxcbiAgICAncmVzZWFyY2hfY29tcGxldGVkJzogICAgICB7IGljb246ICdzcGFya2xlcycsICAgIGNvbG9yOiAnIzkzMzRlOScgfSxcbiAgICAnY29udGVudF93cml0dGVuJzogICAgICAgICB7IGljb246ICdwZW4tZmFuY3knLCAgIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAnY29udGVudF9pbXByb3ZlZCc6ICAgICAgICB7IGljb246ICdwZW4nLCAgICAgICAgIGNvbG9yOiAnIzA4OTFiMicgfSxcbiAgICAnc2xpZGVzX3BsYW5uZWQnOiAgICAgICAgICB7IGljb246ICdpbWFnZXMnLCAgICAgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAnc2NyaXB0X2dlbmVyYXRlZCc6ICAgICAgICB7IGljb246ICd2aWRlbycsICAgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAnbWVkaWFfcHJvbXB0c19nZW5lcmF0ZWQnOiB7IGljb246ICd3YW5kLW1hZ2ljJywgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAnbWVkaWFfcHJvbXB0c19idWlsdCc6ICAgICB7IGljb246ICdoYW1tZXInLCAgICAgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAnbWVkaWFfcHJvbXB0c19lbmhhbmNlZCc6ICB7IGljb246ICdzcGFya2xlcycsICAgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAndmlzdWFsX3BsYW5fY3JlYXRlZCc6ICAgICB7IGljb246ICdpbWFnZScsICAgICAgIGNvbG9yOiAnIzdjM2FlZCcgfSxcbiAgICAnc3RydWN0dXJlZF9zY3JpcHRfY3JlYXRlZCc6IHsgaWNvbjogJ3ZpZGVvJywgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAncGxhdGZvcm1fYWRhcHRlZCc6ICAgICAgICB7IGljb246ICdzaGFyZS1ub2RlcycsIGNvbG9yOiAnIzA4OTFiMicgfSxcbiAgICAnYW5nbGVzX3Jlc2VhcmNoZWQnOiAgICAgICB7IGljb246ICdmbGFzaycsICAgICAgIGNvbG9yOiAnI2UzNzQwMCcgfSxcbiAgICAnaG9va3NfcmVzZWFyY2hlZCc6ICAgICAgICB7IGljb246ICdzcGFya2xlcycsICAgIGNvbG9yOiAnIzkzMzRlOScgfSxcbiAgICAnaW1hZ2VfdXBsb2FkZWQnOiAgICAgICAgICB7IGljb246ICd1cGxvYWQnLCAgICAgIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAndG9waWNfY3JlYXRlZCc6ICAgICAgICAgICB7IGljb246ICd0YWcnLCAgICAgICAgIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAndG9waWNfdXBkYXRlZCc6ICAgICAgICAgICB7IGljb246ICd0YWcnLCAgICAgICAgIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAndG9waWNfZGVsZXRlZCc6ICAgICAgICAgICB7IGljb246ICd0cmFzaCcsICAgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAnc2VyaWVzX2NyZWF0ZWQnOiAgICAgICAgICB7IGljb246ICdsYXllci1ncm91cCcsIGNvbG9yOiAnIzBkOTA0ZicgfSxcbiAgICAnc2VyaWVzX3VwZGF0ZWQnOiAgICAgICAgICB7IGljb246ICdsYXllci1ncm91cCcsIGNvbG9yOiAnIzFhNzNlOCcgfSxcbiAgICAnc2VyaWVzX2RlbGV0ZWQnOiAgICAgICAgICB7IGljb246ICd0cmFzaCcsICAgICAgIGNvbG9yOiAnI2Q5MzAyNScgfSxcbiAgICAnc2V0dXBfY29tcGxldGVkJzogICAgICAgICB7IGljb246ICdjaXJjbGUtY2hlY2snLCBjb2xvcjogJyMwZDkwNGYnIH0sXG4gICAgJ3NldHRpbmdzX2NoYW5nZWQnOiAgICAgICAgeyBpY29uOiAnZ2VhcicsICAgICAgICBjb2xvcjogJyM4MDg2OGInIH0sXG4gICAgJ2RhdGFfaW1wb3J0ZWQnOiAgICAgICAgICAgeyBpY29uOiAndXBsb2FkJywgICAgICBjb2xvcjogJyMxYTczZTgnIH0sXG4gICAgJ2RhdGFfZXhwb3J0ZWQnOiAgICAgICAgICAgeyBpY29uOiAnZG93bmxvYWQnLCAgICBjb2xvcjogJyMxYTczZTgnIH1cbiAgfTtcblxuICB2YXIgQ0FSRF9ERU5TSVRJRVMgPSB7XG4gICAgJ2NvbXBhY3QnOiAgeyBsYWJlbDogJ0NvbXBhY3QnLCAgaWNvbjogJ2xpc3QnLCAgICAgICByb3dIZWlnaHQ6IDQwIH0sXG4gICAgJ25vcm1hbCc6ICAgeyBsYWJlbDogJ05vcm1hbCcsICAgaWNvbjogJ21lbnUnLCAgICAgICByb3dIZWlnaHQ6IDU2IH0sXG4gICAgJ2RldGFpbGVkJzogeyBsYWJlbDogJ0RldGFpbGVkJywgaWNvbjogJ2xheW91dC1ncmlkJywgcm93SGVpZ2h0OiA3MiB9XG4gIH07XG5cbiAgdmFyIE1FRElBX1BST01QVF9TVEFUVVNFUyA9IHtcbiAgICAnZHJhZnQnOiB7IGxhYmVsOiAnRHJhZnQnLCBjb2xvcjogJyNlMzc0MDAnIH0sXG4gICAgJ2ZpbmFsJzogeyBsYWJlbDogJ0ZpbmFsJywgY29sb3I6ICcjMGQ5MDRmJyB9XG4gIH07XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMjogU1RBVEUgT0JKRUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBTID0ge1xuICAgIGRhdGE6IHsgcG9zdHM6IFtdLCByZXNlYXJjaDogeyBzZXNzaW9uczogW10gfSwgdG9waWNzOiBbXSwgc2VyaWVzOiBbXSB9LFxuICAgIG1ldGE6IHsgd29ya3NwYWNlOiB7fSwgc2V0dGluZ3M6IHt9LCBhaVByZWZlcmVuY2VzOiB7fSwgc2V0dXA6IHsgZmlyc3RSdW46IHRydWUsIGNvbXBsZXRlZEF0OiAnJywgdmVyc2lvbjogMSB9IH0sXG4gICAgYWN0aXZpdHk6IFtdLFxuICAgIHVzZXI6IHsgaWQ6ICcnLCBuYW1lOiAnJywgZW1haWw6ICcnLCBmdWxsTmFtZTogJycsIHRpbWV6b25lOiAnJywgcm9sZXM6ICcnIH0sXG4gICAgYnJhbmQ6IHsgY29uZmlndXJlZDogZmFsc2UsIGlkZW50aXR5OiB7fSwgY29yZTogbnVsbCwgdmlkZW86IG51bGwsIGNvbnRlbnQ6IG51bGwsIHNlbzogbnVsbCwgc29jaWFsOiBudWxsIH0sXG4gICAgLy8gTG9va3VwIG1hcHNcbiAgICBwb3N0TWFwOiB7fSwgdG9waWNNYXA6IHt9LCBzZXJpZXNNYXA6IHt9LCByZXNlYXJjaE1hcDoge30sIHRvbmVNYXA6IHt9LCBhdWRpZW5jZU1hcDoge30sIGltYWdlU3R5bGVNYXA6IHt9LFxuICAgIC8vIEFnZ3JlZ2F0ZWQgY291bnRzXG4gICAgc3RhdHVzQ291bnRzOiB7fSwgdHlwZUNvdW50czoge30sIHBsYXRmb3JtQ291bnRzOiB7fSwgdG9waWNJbmRleDoge30sIHNlcmllc0luZGV4OiB7fSxcbiAgICB0b3RhbFBvc3RzOiAwLCBhY3RpdmVQb3N0czogMCwgcHVibGlzaGVkUG9zdHM6IDAsXG4gICAgLy8gVUkgc3RhdGVcbiAgICBjdXJyZW50VmlldzogJ2Rhc2hib2FyZCcsIHByZXZpb3VzVmlldzogbnVsbCxcbiAgICBzZWxlY3RlZFBvc3RJZDogbnVsbCwgY3VycmVudFN0ZXA6ICdiYXNpY3MnLFxuICAgIGNhcmREZW5zaXR5OiAnbm9ybWFsJywgc2V0dGluZ3NUYWI6ICd3b3Jrc3BhY2UnLFxuICAgIC8vIFBvc3RzIHZpZXcgc3RhdGVcbiAgICBwb3N0R3JvdXBCeTogJ3dvcmtmbG93JyxcbiAgICBwb3N0RmlsdGVyOiB7IHNlYXJjaDogJycsIHN0YXR1c2VzOiBbXSwgdHlwZTogJycsIHBsYXRmb3JtOiAnJywgdG9waWM6ICcnLCBzZXJpZXM6ICcnLCBwcmlvcml0eTogJycsIHNvcnRCeTogJ3VwZGF0ZWQnLCBzb3J0RGlyOiAnZGVzYycgfSxcbiAgICBjb2xsYXBzZWRHcm91cHM6IHt9LFxuICAgIC8vIEFjdGl2aXR5IHZpZXcgc3RhdGVcbiAgICBhY3Rpdml0eUZpbHRlcjogeyBzZWFyY2g6ICcnLCB0eXBlOiAnJyB9LFxuICAgIC8vIFRvcGljcyB2aWV3IHN0YXRlXG4gICAgc2VsZWN0ZWRUb3BpY0lkOiBudWxsLFxuICAgIC8vIFNlcmllcyB2aWV3IHN0YXRlXG4gICAgc2VsZWN0ZWRTZXJpZXNJZDogbnVsbCxcbiAgICAvLyBJbWFnZXMgdmlldyBzdGF0ZVxuICAgIGltYWdlczogW10sIGltYWdlTWFwOiB7fSwgJGltYWdlRmllbGQ6IG51bGwsXG4gICAgc2VsZWN0ZWRJbWFnZUlkOiBudWxsLFxuICAgIGltYWdlRmlsdGVyOiB7IHNlYXJjaDogJycsIGNhdGVnb3J5OiAnJywgc3R5bGU6ICcnLCB0YWc6ICcnLCBzdGFyOiBmYWxzZSwgc29ydDogJ25ld2VzdCcgfSxcbiAgICBpbWFnZVZpZXdNb2RlOiAnZ3JpZCcsXG4gICAgLy8gQ2FsZW5kYXIgc3RhdGVcbiAgICBjYWxlbmRhclllYXI6IG51bGwsIGNhbGVuZGFyTW9udGg6IG51bGwsXG4gICAgY2FsZW5kYXJNb2RlOiAnbW9udGgnLCAvLyAnbW9udGgnIG9yICd3ZWVrJ1xuICAgIGNhbGVuZGFyV2Vla1N0YXJ0OiBudWxsLCAvLyBEYXRlIG9iamVjdCBmb3Igd2VlayB2aWV3IHN0YXJ0XG4gICAgY2FsZW5kYXJGaWx0ZXJzOiB7IHBsYXRmb3JtczogW10sIHR5cGVzOiBbXSwgc3RhdHVzOiAnJywgdG9waWM6ICcnLCBzZXJpZXM6ICcnIH0sXG4gICAgY2FsZW5kYXJQb3BvdmVyOiBudWxsLCAvLyB7IHBvc3RJZCwgeCwgeSB9IHdoZW4gc2hvd2luZ1xuICAgIC8vIFNoZWxsIFVJXG4gICAgc2lkZWJhckhpZGRlbjogZmFsc2UsXG4gICAgLy8gRHJ1cGFsIHJlZnMgKyBmbGFnc1xuICAgICR0ZXh0YXJlYTogbnVsbCwgJG1ldGFUZXh0YXJlYTogbnVsbCwgJGFjdGl2aXR5VGV4dGFyZWE6IG51bGwsICRmb3JtOiBudWxsLCAkc3VibWl0QnRuOiBudWxsLFxuICAgIF9pbml0aWFsaXppbmc6IGZhbHNlLCBpbml0aWFsaXplZDogZmFsc2UsIF9wYXJ0MmJUaW1lb3V0OiBmYWxzZSwgZGlydHk6IGZhbHNlLCBhdXRvU2F2ZVRpbWVyOiBudWxsLCBsYXN0U2F2ZWQ6IG51bGxcbiAgfTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAzOiBJTklUSUFMSVpBVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBpc1NjcFBhZ2UoKSB7IHJldHVybiAkKCdib2R5JykuaGFzQ2xhc3MoJ25vZGUtLXR5cGUtc29jaWFsLWNvbnRlbnQtcGxhbm5lcicpOyB9XG5cbiAgRHJ1cGFsLmJlaGF2aW9ycyA9IERydXBhbC5iZWhhdmlvcnMgfHwge307XG4gIERydXBhbC5iZWhhdmlvcnMuc2NwUGFydDEgPSB7XG4gICAgYXR0YWNoOiBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICBpZiAoUy5pbml0aWFsaXplZCB8fCBTLl9pbml0aWFsaXppbmcpIHJldHVybjtcbiAgICAgIGlmICghaXNTY3BQYWdlKCkpIHJldHVybjtcbiAgICAgIGlmICghJChjb250ZXh0KS5maW5kKCcjZWRpdC1maWVsZC1qc29uLWRhdGEtMC12YWx1ZScpLmxlbmd0aCAmJiAhJChjb250ZXh0KS5maW5kKCcjZWRpdC1maWVsZC1qc29uLW1ldGEtMC12YWx1ZScpLmxlbmd0aCAmJiBjb250ZXh0ICE9PSBkb2N1bWVudCkgcmV0dXJuO1xuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlmIChTLl9pbml0aWFsaXppbmcgfHwgUy5pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIFMuX2luaXRpYWxpemluZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1tTQ1BdIEluaXRpYWxpemluZyBQYXJ0IDEuLi4nKTtcbiAgICBwYXJzZVVzZXJEYXRhKCk7XG4gICAgaWYgKCFkZXRlY3REcnVwYWxGb3JtKCkpIHsgY29uc29sZS5lcnJvcignW1NDUF0gQ291bGQgbm90IGZpbmQgRHJ1cGFsIGZvcm0nKTsgUy5faW5pdGlhbGl6aW5nID0gZmFsc2U7IHJldHVybjsgfVxuICAgIGxvYWREYXRhKCk7IG1pZ3JhdGVNZXRhKCk7IG1pZ3JhdGVEYXRhKCk7IGluamVjdFF1aWxsQ1NTKCk7IGJ1aWxkTWFwcygpO1xuICAgIHJlbmRlckFwcCgpOyBzZXR1cEV2ZW50SGFuZGxlcnMoKTsgc3RhcnRBdXRvU2F2ZSgpO1xuICAgIFMuaW5pdGlhbGl6ZWQgPSB0cnVlOyBTLl9pbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICBjb25zb2xlLmxvZygnW1NDUF0gUGFydCAxIGluaXRpYWxpemVkIFx1MjAxNCAnICsgUy50b3RhbFBvc3RzICsgJyBwb3N0cywgJyArIChTLmRhdGEudG9waWNzIHx8IFtdKS5sZW5ndGggKyAnIHRvcGljcywgJyArIChTLmRhdGEuc2VyaWVzIHx8IFtdKS5sZW5ndGggKyAnIHNlcmllcywgdXNlcjogJyArIChTLnVzZXIubmFtZSB8fCAndW5rbm93bicpKTtcblxuICAgIC8vIFRpbWVvdXQ6IGlmIFBhcnQgMkIgaGFzbid0IGxvYWRlZCBpbiA4IHNlY29uZHMsIHJlLXJlbmRlciB3aXRoIGhlbHBmdWwgbWVzc2FnZXNcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIFIgPSB3aW5kb3cuX3NjcFJlbmRlcmVycyB8fCB7fTtcbiAgICAgIGlmICghUi5yZXNlYXJjaFZpZXcgfHwgIVIuc2V0dGluZ3NWaWV3IHx8ICFSLmltYWdlc1ZpZXcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbU0NQXSBQYXJ0IDJCIG5vdCBsb2FkZWQgYWZ0ZXIgOHMgXHUyMDE0IHVwZGF0aW5nIHBsYWNlaG9sZGVycycpO1xuICAgICAgICBTLl9wYXJ0MmJUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKFMuY3VycmVudFZpZXcgPT09ICdyZXNlYXJjaCcgfHwgUy5jdXJyZW50VmlldyA9PT0gJ3NldHRpbmdzJyB8fCBTLmN1cnJlbnRWaWV3ID09PSAnaW1hZ2VzJykgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICAgIH1cbiAgICB9LCA4MDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVXNlckRhdGEoKSB7XG4gICAgdmFyICR1ZCA9ICQoJyNndWF1LXVzZXJkYXRhJyk7XG4gICAgaWYgKCEkdWQubGVuZ3RoKSB7IGNvbnNvbGUud2FybignW1NDUF0gVXNlciBkYXRhIGRpdiBub3QgZm91bmQnKTsgcmV0dXJuOyB9XG4gICAgUy51c2VyID0ge1xuICAgICAgaWQ6ICgkdWQuZmluZCgnI2d1YXUtdXNlcmlkJykudGV4dCgpIHx8ICcnKS50cmltKCksXG4gICAgICBuYW1lOiAoJHVkLmZpbmQoJyNndWF1LXVzZXJuYW1lJykudGV4dCgpIHx8ICcnKS50cmltKCksXG4gICAgICBlbWFpbDogKCR1ZC5maW5kKCcjZ3VhdS11c2VyZW1haWwnKS50ZXh0KCkgfHwgJycpLnRyaW0oKSxcbiAgICAgIGZ1bGxOYW1lOiAoJHVkLmZpbmQoJyNndWF1LXVzZXJmdWxsbmFtZScpLnRleHQoKSB8fCAnJykudHJpbSgpLFxuICAgICAgdGltZXpvbmU6ICgkdWQuZmluZCgnI2d1YXUtdXNlcnRpbWV6b25lJykudGV4dCgpIHx8ICcnKS50cmltKCksXG4gICAgICByb2xlczogKCR1ZC5maW5kKCcjZ3VhdS11c2Vycm9sZXMnKS50ZXh0KCkgfHwgJycpLnRyaW0oKVxuICAgIH07XG4gICAgY29uc29sZS5sb2coJ1tTQ1BdIFVzZXI6ICcgKyBTLnVzZXIuZnVsbE5hbWUgKyAnICgnICsgUy51c2VyLm5hbWUgKyAnLCBpZD0nICsgUy51c2VyLmlkICsgJyknKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRldGVjdERydXBhbEZvcm0oKSB7XG4gICAgdmFyICR0YSA9ICQoJyNlZGl0LWZpZWxkLWpzb24tZGF0YS0wLXZhbHVlJyk7XG4gICAgdmFyICRtZXRhVGEgPSAkKCcjZWRpdC1maWVsZC1qc29uLW1ldGEtMC12YWx1ZScpO1xuICAgIHZhciAkYWN0VGEgPSAkKCcjZWRpdC1maWVsZC1hY3Rpdml0eS1sb2ctMC12YWx1ZScpO1xuICAgIGlmICghJHRhLmxlbmd0aCB8fCAhJG1ldGFUYS5sZW5ndGggfHwgISRhY3RUYS5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBTLiR0ZXh0YXJlYSA9ICR0YTsgUy4kbWV0YVRleHRhcmVhID0gJG1ldGFUYTsgUy4kYWN0aXZpdHlUZXh0YXJlYSA9ICRhY3RUYTtcbiAgICBTLiRmb3JtID0gJHRhLmNsb3Nlc3QoJ2Zvcm0nKTtcbiAgICBTLiRzdWJtaXRCdG4gPSBTLiRmb3JtLmZpbmQoJyNlZGl0LXN1Ym1pdCwgW2RhdGEtZHJ1cGFsLXNlbGVjdG9yPVwiZWRpdC1zdWJtaXRcIl0nKS5maXJzdCgpO1xuICAgIFMuJHRleHRhcmVhLmNsb3Nlc3QoJy5maWVsZC0tbmFtZS1maWVsZC1qc29uLWRhdGEnKS5oaWRlKCk7XG4gICAgUy4kbWV0YVRleHRhcmVhLmNsb3Nlc3QoJy5maWVsZC0tbmFtZS1maWVsZC1qc29uLW1ldGEnKS5oaWRlKCk7XG4gICAgUy4kYWN0aXZpdHlUZXh0YXJlYS5jbG9zZXN0KCcuZmllbGQtLW5hbWUtZmllbGQtYWN0aXZpdHktbG9nJykuaGlkZSgpO1xuICAgIFMuJGZvcm0uZmluZCgnLm5vZGUtZm9ybS1vcHRpb25zLCAuZmllbGQtLW5hbWUtdGl0bGUsIC5mb3JtLWFjdGlvbnMnKS5oaWRlKCk7XG4gICAgLy8gRGV0ZWN0IGFuZCBoaWRlIGltYWdlIGZpZWxkXG4gICAgUy4kaW1hZ2VGaWVsZCA9IFMuJGZvcm0uZmluZCgnLmZpZWxkLS1uYW1lLWZpZWxkLWltYWdlcycpO1xuICAgIGlmIChTLiRpbWFnZUZpZWxkLmxlbmd0aCkge1xuICAgICAgUy4kaW1hZ2VGaWVsZC5oaWRlKCk7XG4gICAgICBjb25zb2xlLmxvZygnW1NDUF0gSW1hZ2UgZmllbGQgZGV0ZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ1tTQ1BdIE5vIGltYWdlIGZpZWxkIGZvdW5kIChmaWVsZF9pbWFnZXMpJyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZERhdGEoKSB7XG4gICAgdmFyIHJhd0RhdGEgPSBTLiR0ZXh0YXJlYS52YWwoKTtcbiAgICBpZiAocmF3RGF0YSAmJiByYXdEYXRhLnRyaW0oKSkge1xuICAgICAgdHJ5IHsgUy5kYXRhID0gSlNPTi5wYXJzZShyYXdEYXRhKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCdbU0NQXSBKU09OIGRhdGEgcGFyc2UgZXJyb3I6JywgZSk7IFMuZGF0YSA9IGdldERlZmF1bHREYXRhKCk7IH1cbiAgICB9IGVsc2UgeyBTLmRhdGEgPSBnZXREZWZhdWx0RGF0YSgpOyB9XG5cbiAgICB2YXIgcmF3TWV0YSA9IFMuJG1ldGFUZXh0YXJlYS52YWwoKTtcbiAgICBpZiAocmF3TWV0YSAmJiByYXdNZXRhLnRyaW0oKSkge1xuICAgICAgdHJ5IHsgUy5tZXRhID0gSlNPTi5wYXJzZShyYXdNZXRhKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCdbU0NQXSBKU09OIG1ldGEgcGFyc2UgZXJyb3I6JywgZSk7IFMubWV0YSA9IGdldERlZmF1bHRNZXRhKCk7IH1cbiAgICB9IGVsc2UgeyBTLm1ldGEgPSBnZXREZWZhdWx0TWV0YSgpOyB9XG5cbiAgICB2YXIgcmF3QWN0aXZpdHkgPSBTLiRhY3Rpdml0eVRleHRhcmVhLnZhbCgpO1xuICAgIGlmIChyYXdBY3Rpdml0eSAmJiByYXdBY3Rpdml0eS50cmltKCkpIHtcbiAgICAgIHRyeSB7IFMuYWN0aXZpdHkgPSBKU09OLnBhcnNlKHJhd0FjdGl2aXR5KTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCdbU0NQXSBKU09OIGFjdGl2aXR5IHBhcnNlIGVycm9yOicsIGUpOyBTLmFjdGl2aXR5ID0gW107IH1cbiAgICB9IGVsc2UgeyBTLmFjdGl2aXR5ID0gW107IH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoUy5hY3Rpdml0eSkpIFMuYWN0aXZpdHkgPSBbXTtcblxuICAgIC8vIFBhcnNlIGltYWdlcyBmcm9tIERydXBhbCBmaWVsZCBhZnRlciBKU09OIGlzIGxvYWRlZCAobWV0YWRhdGEgY29tZXMgZnJvbSBtZXRhKVxuICAgIHBhcnNlSW1hZ2VGaWVsZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VJbWFnZUZpZWxkKCkge1xuICAgIFMuaW1hZ2VzID0gW107IFMuaW1hZ2VNYXAgPSB7fTtcbiAgICBpZiAoIVMuJGltYWdlRmllbGQgfHwgIVMuJGltYWdlRmllbGQubGVuZ3RoKSByZXR1cm47XG4gICAgdmFyIGltZ01ldGEgPSAoUy5tZXRhICYmIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzKSB8fCB7fTtcblxuICAgIC8vIERlZHVwbGljYXRpb24gdHJhY2tpbmcgXHUyMDE0IHByZXZlbnRzIHNhbWUgaW1hZ2UgYXBwZWFyaW5nIDItM3hcbiAgICB2YXIgX3NlZW5VcmxzID0ge307XG4gICAgdmFyIF9zZWVuRmlkcyA9IHt9O1xuICAgIHZhciBfaW1nSWR4ID0gMDtcblxuICAgIC8vIFNjYW4gRHJ1cGFsIGltYWdlIHdpZGdldCBlbGVtZW50cyBcdTIwMTQgdXNlIE9OTFkgLmltYWdlLXdpZGdldCB0byBhdm9pZFxuICAgIC8vIHBhcmVudCB3cmFwcGVyIG1hdGNoZXMgZnJvbSBbZGF0YS1kcnVwYWwtc2VsZWN0b3IqPVwiZWRpdC1maWVsZC1pbWFnZXNcIl1cbiAgICAvLyB3aGljaCBjYXVzZWQgZHVwbGljYXRlcyBpbiBEcnVwYWwgMTAvMTEgbmVzdGVkIG1hcmt1cFxuICAgIHZhciAkd2lkZ2V0cyA9IFMuJGltYWdlRmllbGQuZmluZCgnLmltYWdlLXdpZGdldCcpO1xuICAgIC8vIEZhbGxiYWNrOiBpZiBubyAuaW1hZ2Utd2lkZ2V0IGZvdW5kLCB0cnkgdGFibGUgcm93cyBvciBmaWVsZHNldCB3cmFwcGVyc1xuICAgIGlmICghJHdpZGdldHMubGVuZ3RoKSAkd2lkZ2V0cyA9IFMuJGltYWdlRmllbGQuZmluZCgnW2RhdGEtZHJ1cGFsLXNlbGVjdG9yKj1cImVkaXQtZmllbGQtaW1hZ2VzLVwiXSA+IC5mb3JtLW1hbmFnZWQtZmlsZSwgLmZpZWxkLS10eXBlLWltYWdlIC5pbWFnZS13aWRnZXQtZGF0YScpLnBhcmVudCgpO1xuICAgIC8vIEZpbmFsIGZhbGxiYWNrIGZvciBvdGhlciBEcnVwYWwgbGF5b3V0c1xuICAgIGlmICghJHdpZGdldHMubGVuZ3RoKSAkd2lkZ2V0cyA9IFMuJGltYWdlRmllbGQuZmluZCgnLmRldGFpbHMtd3JhcHBlciAuZm9ybS1tYW5hZ2VkLWZpbGUsIC5maWVsZC1tdWx0aXBsZS10YWJsZSB0Ym9keSB0cicpO1xuXG4gICAgJHdpZGdldHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkd2lkZ2V0ID0gJCh0aGlzKTtcbiAgICAgIC8vIFRyeSBtdWx0aXBsZSBzZWxlY3RvcnMgZm9yIGltYWdlIHNvdXJjZSAoRHJ1cGFsIDEwLzExIHZhcmlhdGlvbnMpXG4gICAgICB2YXIgJGltZyA9ICR3aWRnZXQuZmluZCgnLmltYWdlLXByZXZpZXcgaW1nLCAuaW1hZ2Utc3R5bGUtdGh1bWJuYWlsLCBpbWcnKS5maXJzdCgpO1xuICAgICAgdmFyICRmaWxlTGluayA9ICR3aWRnZXQuZmluZCgnLmZpbGUgYSwgYVtocmVmKj1cIi9maWxlcy9cIl0nKS5maXJzdCgpO1xuICAgICAgdmFyIGltZ1VybCA9ICcnO1xuICAgICAgaWYgKCRpbWcubGVuZ3RoKSBpbWdVcmwgPSAkaW1nLmF0dHIoJ3NyYycpIHx8ICcnO1xuICAgICAgaWYgKCFpbWdVcmwgJiYgJGZpbGVMaW5rLmxlbmd0aCkgaW1nVXJsID0gJGZpbGVMaW5rLmF0dHIoJ2hyZWYnKSB8fCAnJztcbiAgICAgIGlmICghaW1nVXJsKSByZXR1cm47IC8vIFNraXAgZW1wdHkgdXBsb2FkIHNsb3RzXG5cbiAgICAgIC8vIE5vcm1hbGl6ZSBVUkwgZm9yIGRlZHVwbGljYXRpb24gKHN0cmlwIHF1ZXJ5IHBhcmFtcywgcHJvdG9jb2wpXG4gICAgICB2YXIgbm9ybWFsaXplZFVybCA9IGltZ1VybC5yZXBsYWNlKC9cXD8uKiQvLCAnJykucmVwbGFjZSgvXmh0dHBzPzovLCAnJyk7XG4gICAgICBpZiAoX3NlZW5VcmxzW25vcm1hbGl6ZWRVcmxdKSByZXR1cm47IC8vIFNLSVAgRFVQTElDQVRFXG4gICAgICBfc2VlblVybHNbbm9ybWFsaXplZFVybF0gPSB0cnVlO1xuXG4gICAgICAvLyBFeHRyYWN0IGZpbGUgSUQgXHUyMDE0IHRyeSBkYXRhLWZpZCwgaW5wdXQgbmFtZSBwYXJzaW5nLCBvciBmYWxsYmFjayB0byBpbmRleFxuICAgICAgdmFyIGZpZCA9ICcnO1xuICAgICAgdmFyICRmaWRJbnB1dCA9ICR3aWRnZXQuZmluZCgnaW5wdXRbbmFtZSo9XCJmaWRzXCJdLCBpbnB1dFtkYXRhLWZpZF0nKTtcbiAgICAgIGlmICgkZmlkSW5wdXQubGVuZ3RoKSBmaWQgPSAkZmlkSW5wdXQuZGF0YSgnZmlkJykgfHwgJGZpZElucHV0LnZhbCgpIHx8ICcnO1xuICAgICAgaWYgKCFmaWQpIHtcbiAgICAgICAgLy8gVHJ5IGV4dHJhY3RpbmcgZnJvbSBpbnB1dCBuYW1lIHBhdHRlcm46IGZpZWxkX2ltYWdlc1tOXVtmaWRzXVxuICAgICAgICB2YXIgJGFueUlucHV0ID0gJHdpZGdldC5maW5kKCdpbnB1dFtuYW1lKj1cImZpZWxkX2ltYWdlc1wiXScpLmZpcnN0KCk7XG4gICAgICAgIGlmICgkYW55SW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gJGFueUlucHV0LmF0dHIoJ25hbWUnKS5tYXRjaCgvZmllbGRfaW1hZ2VzXFxbKFxcZCspXFxdLyk7XG4gICAgICAgICAgaWYgKG1hdGNoKSBmaWQgPSAnaWR4XycgKyBtYXRjaFsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmaWQpIGZpZCA9ICdpbWdfJyArIF9pbWdJZHg7XG5cbiAgICAgIC8vIFNraXAgZHVwbGljYXRlIGZpZHMgYXMgd2VsbFxuICAgICAgaWYgKF9zZWVuRmlkc1tTdHJpbmcoZmlkKV0pIHJldHVybjtcbiAgICAgIF9zZWVuRmlkc1tTdHJpbmcoZmlkKV0gPSB0cnVlO1xuXG4gICAgICB2YXIgZmlsZW5hbWUgPSAnJztcbiAgICAgIGlmICgkZmlsZUxpbmsubGVuZ3RoKSBmaWxlbmFtZSA9ICRmaWxlTGluay50ZXh0KCkudHJpbSgpO1xuICAgICAgaWYgKCFmaWxlbmFtZSAmJiBpbWdVcmwpIGZpbGVuYW1lID0gaW1nVXJsLnNwbGl0KCcvJykucG9wKCkuc3BsaXQoJz8nKVswXTtcblxuICAgICAgdmFyIGFsdCA9ICRpbWcuYXR0cignYWx0JykgfHwgJyc7XG5cbiAgICAgIC8vIE1lcmdlIHdpdGggc2F2ZWQgbWV0YWRhdGFcbiAgICAgIHZhciBtZXRhID0gaW1nTWV0YVtmaWRdIHx8IHt9O1xuXG4gICAgICBTLmltYWdlcy5wdXNoKHtcbiAgICAgICAgZmlkOiBTdHJpbmcoZmlkKSxcbiAgICAgICAgdXJsOiBpbWdVcmwsXG4gICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcbiAgICAgICAgYWx0OiBhbHQsXG4gICAgICAgIGluZGV4OiBfaW1nSWR4LFxuICAgICAgICBjYXRlZ29yeTogbWV0YS5jYXRlZ29yeSB8fCAnJyxcbiAgICAgICAgc3R5bGU6IG1ldGEuc3R5bGUgfHwgJycsXG4gICAgICAgIHRhZ3M6IG1ldGEudGFncyB8fCBbXSxcbiAgICAgICAgc3RhcjogISFtZXRhLnN0YXIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBtZXRhLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICBub3RlczogbWV0YS5ub3RlcyB8fCAnJyxcbiAgICAgICAgdXNhZ2U6IG1ldGEudXNhZ2UgfHwgW11cbiAgICAgIH0pO1xuICAgICAgX2ltZ0lkeCsrO1xuICAgIH0pO1xuXG4gICAgLy8gQnVpbGQgbG9va3VwIG1hcFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgUy5pbWFnZXMubGVuZ3RoOyBpKyspIFMuaW1hZ2VNYXBbUy5pbWFnZXNbaV0uZmlkXSA9IFMuaW1hZ2VzW2ldO1xuICAgIGNvbnNvbGUubG9nKCdbU0NQXSBQYXJzZWQgJyArIFMuaW1hZ2VzLmxlbmd0aCArICcgcmVmZXJlbmNlIGltYWdlcyAoZGVkdXBlZCknKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltYWdlcyhmaWx0ZXJzKSB7XG4gICAgdmFyIGltZ3MgPSBTLmltYWdlcy5zbGljZSgpO1xuICAgIGlmICghZmlsdGVycykgcmV0dXJuIGltZ3M7XG4gICAgaWYgKGZpbHRlcnMuc3RhcikgaW1ncyA9IGltZ3MuZmlsdGVyKGZ1bmN0aW9uKGltZykgeyByZXR1cm4gaW1nLnN0YXI7IH0pO1xuICAgIGlmIChmaWx0ZXJzLmNhdGVnb3J5KSBpbWdzID0gaW1ncy5maWx0ZXIoZnVuY3Rpb24oaW1nKSB7IHJldHVybiBpbWcuY2F0ZWdvcnkgPT09IGZpbHRlcnMuY2F0ZWdvcnk7IH0pO1xuICAgIGlmIChmaWx0ZXJzLnN0eWxlKSBpbWdzID0gaW1ncy5maWx0ZXIoZnVuY3Rpb24oaW1nKSB7IHJldHVybiBpbWcuc3R5bGUgPT09IGZpbHRlcnMuc3R5bGU7IH0pO1xuICAgIGlmIChmaWx0ZXJzLnRhZykgaW1ncyA9IGltZ3MuZmlsdGVyKGZ1bmN0aW9uKGltZykgeyByZXR1cm4gaW1nLnRhZ3MuaW5kZXhPZihmaWx0ZXJzLnRhZykgPiAtMTsgfSk7XG4gICAgaWYgKGZpbHRlcnMuc2VhcmNoKSB7XG4gICAgICB2YXIgcSA9IGZpbHRlcnMuc2VhcmNoLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpbWdzID0gaW1ncy5maWx0ZXIoZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHJldHVybiAoaW1nLmZpbGVuYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocSkgPiAtMSB8fFxuICAgICAgICAgICAgICAgKGltZy5kZXNjcmlwdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHEpID4gLTEgfHxcbiAgICAgICAgICAgICAgIChpbWcudGFncyB8fCBbXSkuc29tZShmdW5jdGlvbih0KSB7IHJldHVybiB0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxKSA+IC0xOyB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBTb3J0XG4gICAgaWYgKGZpbHRlcnMuc29ydCA9PT0gJ25hbWUnKSBpbWdzLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gKGEuZmlsZW5hbWUgfHwgJycpLmxvY2FsZUNvbXBhcmUoYi5maWxlbmFtZSB8fCAnJyk7IH0pO1xuICAgIGVsc2UgaWYgKGZpbHRlcnMuc29ydCA9PT0gJ21vc3QtdXNlZCcpIGltZ3Muc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiAoYi51c2FnZSB8fCBbXSkubGVuZ3RoIC0gKGEudXNhZ2UgfHwgW10pLmxlbmd0aDsgfSk7XG4gICAgLy8gRGVmYXVsdDogaW5kZXggb3JkZXIgKG5ld2VzdCA9IGhpZ2hlc3QgaW5kZXgpXG4gICAgcmV0dXJuIGltZ3M7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJbWFnZUJ5SWQoZmlkKSB7IHJldHVybiBTLmltYWdlTWFwW2ZpZF0gfHwgbnVsbDsgfVxuICBmdW5jdGlvbiBnZXRBbGxJbWFnZVRhZ3MoKSB7XG4gICAgdmFyIHRhZ3MgPSB7fTtcbiAgICBTLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltZykgeyAoaW1nLnRhZ3MgfHwgW10pLmZvckVhY2goZnVuY3Rpb24odCkgeyB0YWdzW3RdID0gKHRhZ3NbdF0gfHwgMCkgKyAxOyB9KTsgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhZ3MpLnNvcnQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1pZ3JhdGVEYXRhKCkge1xuICAgIHZhciBkID0gUy5kYXRhO1xuICAgIGQucG9zdHMgPSBkLnBvc3RzIHx8IFtdO1xuICAgIGQucmVzZWFyY2ggPSBkLnJlc2VhcmNoIHx8IHsgc2Vzc2lvbnM6IFtdIH07XG4gICAgZC5yZXNlYXJjaC5zZXNzaW9ucyA9IGQucmVzZWFyY2guc2Vzc2lvbnMgfHwgW107XG4gICAgZC50b3BpY3MgPSBkLnRvcGljcyB8fCBbXTtcbiAgICBkLnNlcmllcyA9IGQuc2VyaWVzIHx8IFtdO1xuICAgIC8vIEVuc3VyZSBlYWNoIHRvcGljIGhhcyBhIHNlcmllc0lkIHNsb3QgZm9yIGZ1dHVyZSBncm91cGluZ1xuICAgIGZvciAodmFyIHRvcGljSSA9IDA7IHRvcGljSSA8IGQudG9waWNzLmxlbmd0aDsgdG9waWNJKyspIHtcbiAgICAgIGlmICh0eXBlb2YgZC50b3BpY3NbdG9waWNJXS5zZXJpZXNJZCA9PT0gJ3VuZGVmaW5lZCcpIGQudG9waWNzW3RvcGljSV0uc2VyaWVzSWQgPSAnJztcbiAgICB9XG4gICAgLy8gRW5zdXJlIGVhY2ggcG9zdCBoYXMgYWxsIHJlcXVpcmVkIHN1Yi1vYmplY3RzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLnBvc3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcCA9IGQucG9zdHNbaV07XG4gICAgICBwLnRvcGljcyA9IHAudG9waWNzIHx8IFtdO1xuICAgICAgcC5zZXJpZXNJZCA9IHAuc2VyaWVzSWQgfHwgJyc7XG4gICAgICBwLnBsYXRmb3JtcyA9IHAucGxhdGZvcm1zIHx8IFtdO1xuICAgICAgcC5zb3VyY2UgPSBwLnNvdXJjZSB8fCB7IHR5cGU6ICdtYW51YWwnLCByZXNlYXJjaF9zZXNzaW9uX2lkOiAnJywgcmVzZWFyY2hfaWRlYV9pZDogJycsIG5vdGVzOiAnJyB9O1xuICAgICAgcC5yZXNlYXJjaCA9IHAucmVzZWFyY2ggfHwgeyBhbmdsZXM6IFtdLCBzZWxlY3RlZF9hbmdsZTogJycsIGFuZ2xlX2N1c3RvbV9pbnB1dDogJycsIGhvb2tzOiBbXSwgc2VsZWN0ZWRfaG9vazogJycsIGhvb2tfY3VzdG9tX2lucHV0OiAnJywgbm90ZXM6ICcnIH07XG4gICAgICBwLmNvbnRlbnQgPSBwLmNvbnRlbnQgfHwgeyBib2R5OiAnJywgdG9uZV9pZDogJycsIGF1ZGllbmNlX2lkOiAnJywgbm90ZXM6ICcnIH07XG4gICAgICBwLmNhcm91c2VsID0gcC5jYXJvdXNlbCB8fCB7IHNsaWRlX2NvdW50OiAwLCBzbGlkZXM6IFtdIH07XG4gICAgICBwLnZpZGVvID0gcC52aWRlbyB8fCB7IGNvbmNlcHQ6ICcnLCBzY3JpcHQ6ICcnLCBkdXJhdGlvbl9zZWNvbmRzOiAwLCBmb3JtYXQ6ICcnIH07XG4gICAgICBwLm1lZGlhID0gcC5tZWRpYSB8fCB7IHByb21wdHM6IFtdLCBjb25maWc6IHsgc3R5bGVfaWQ6ICcnLCBjdXN0b21faW5zdHJ1Y3Rpb25zOiAnJywgYnJhbmRfY29udGV4dF9lbmFibGVkOiBmYWxzZSB9IH07XG4gICAgICBwLm1lZGlhLnByb21wdHMgPSBwLm1lZGlhLnByb21wdHMgfHwgW107XG4gICAgICBwLm1lZGlhLmNvbmZpZyA9IHAubWVkaWEuY29uZmlnIHx8IHsgc3R5bGVfaWQ6ICcnLCBjdXN0b21faW5zdHJ1Y3Rpb25zOiAnJywgYnJhbmRfY29udGV4dF9lbmFibGVkOiBmYWxzZSB9O1xuICAgICAgLy8gUGhhc2UgQjogdmlzdWFsIHBsYW4gZmllbGRzXG4gICAgICBpZiAocC5tZWRpYS52aXN1YWxfcGxhbiAmJiB0eXBlb2YgcC5tZWRpYS52aXN1YWxfcGxhbiAhPT0gJ29iamVjdCcpIHAubWVkaWEudmlzdWFsX3BsYW4gPSBudWxsO1xuICAgICAgaWYgKHAubWVkaWEudmlzdWFsX3BsYW5zICYmICFBcnJheS5pc0FycmF5KHAubWVkaWEudmlzdWFsX3BsYW5zKSkgcC5tZWRpYS52aXN1YWxfcGxhbnMgPSBbXTtcbiAgICAgIC8vIFBoYXNlIEI6IHN0cnVjdHVyZWQgdmlkZW8gc2NyaXB0XG4gICAgICBpZiAocC52aWRlbyAmJiBwLnZpZGVvLnN0cnVjdHVyZWRfc2NyaXB0ICYmIHR5cGVvZiBwLnZpZGVvLnN0cnVjdHVyZWRfc2NyaXB0ICE9PSAnb2JqZWN0JykgcC52aWRlby5zdHJ1Y3R1cmVkX3NjcmlwdCA9IG51bGw7XG4gICAgICBwLnBsYXRmb3JtX2NvbnRlbnQgPSBwLnBsYXRmb3JtX2NvbnRlbnQgfHwge307XG4gICAgICBmb3IgKHZhciBwayBpbiBQTEFURk9STVMpIHtcbiAgICAgICAgaWYgKCFwLnBsYXRmb3JtX2NvbnRlbnRbcGtdKSB7XG4gICAgICAgICAgaWYgKHBrID09PSAneW91dHViZScpIHAucGxhdGZvcm1fY29udGVudFtwa10gPSB7IGVuYWJsZWQ6IGZhbHNlLCB0aXRsZTogJycsIGRlc2NyaXB0aW9uOiAnJywgdGFnczogW10sIG5vdGVzOiAnJyB9O1xuICAgICAgICAgIGVsc2UgcC5wbGF0Zm9ybV9jb250ZW50W3BrXSA9IHsgZW5hYmxlZDogZmFsc2UsIGJvZHk6ICcnLCBub3RlczogJycgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcC5zY2hlZHVsZSA9IHAuc2NoZWR1bGUgfHwgeyBkYXRlOiAnJywgdGltZTogJycsIHRpbWV6b25lOiAnJywgcHVibGlzaGVkX3VybHM6IHt9IH07XG4gICAgICBwLnNjaGVkdWxlLnB1Ymxpc2hlZF91cmxzID0gcC5zY2hlZHVsZS5wdWJsaXNoZWRfdXJscyB8fCB7fTtcbiAgICAgIHAucGVyZm9ybWFuY2UgPSBwLnBlcmZvcm1hbmNlIHx8IHt9O1xuICAgICAgcC5jcmVhdGVkX2J5ID0gcC5jcmVhdGVkX2J5IHx8ICcnO1xuICAgICAgcC5hc3NpZ25lZF90byA9IHAuYXNzaWduZWRfdG8gfHwgJyc7XG4gICAgICBwLnJldmlld19ub3RlcyA9IHAucmV2aWV3X25vdGVzIHx8ICcnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1pZ3JhdGVNZXRhKCkge1xuICAgIHZhciBtID0gUy5tZXRhO1xuICAgIG0ud29ya3NwYWNlID0gbS53b3Jrc3BhY2UgfHwgeyBuYW1lOiAnJywgZGVzY3JpcHRpb246ICcnLCBjcmVhdGVkOiAnJyB9O1xuICAgIG0uc2V0dGluZ3MgPSBtLnNldHRpbmdzIHx8IHt9O1xuICAgIG0uc2V0dGluZ3MudGltZXpvbmUgPSBtLnNldHRpbmdzLnRpbWV6b25lIHx8ICdBc2lhL0tvbGthdGEnO1xuICAgIG0uc2V0dGluZ3MuY2FyZF9kZW5zaXR5ID0gbS5zZXR0aW5ncy5jYXJkX2RlbnNpdHkgfHwgJ25vcm1hbCc7XG4gICAgbS5zZXR0aW5ncy5kZWZhdWx0X3ZpZXcgPSBtLnNldHRpbmdzLmRlZmF1bHRfdmlldyB8fCAnZGFzaGJvYXJkJztcbiAgICBtLnNldHRpbmdzLnBsYXRmb3JtcyA9IG0uc2V0dGluZ3MucGxhdGZvcm1zIHx8IHt9O1xuICAgIGlmICghbS5zZXR0aW5ncy5wbGF0Zm9ybXMubGlua2VkaW4pICBtLnNldHRpbmdzLnBsYXRmb3Jtcy5saW5rZWRpbiAgPSB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCBjaGFyX2xpbWl0OiAzMDAwLCAgaGFzaHRhZ19saW1pdDogNSwgIGJlc3RfdGltZXM6IFtdLCBub3RlczogJycgfTtcbiAgICBpZiAoIW0uc2V0dGluZ3MucGxhdGZvcm1zLmluc3RhZ3JhbSkgbS5zZXR0aW5ncy5wbGF0Zm9ybXMuaW5zdGFncmFtID0geyBlbmFibGVkOiB0cnVlLCAgaGFuZGxlOiAnJywgY2hhcl9saW1pdDogMjIwMCwgIGhhc2h0YWdfbGltaXQ6IDMwLCBiZXN0X3RpbWVzOiBbXSwgbm90ZXM6ICcnIH07XG4gICAgaWYgKCFtLnNldHRpbmdzLnBsYXRmb3Jtcy5mYWNlYm9vaykgIG0uc2V0dGluZ3MucGxhdGZvcm1zLmZhY2Vib29rICA9IHsgZW5hYmxlZDogdHJ1ZSwgIGhhbmRsZTogJycsIGNoYXJfbGltaXQ6IDYzMjA2LCBoYXNodGFnX2xpbWl0OiAxMCwgYmVzdF90aW1lczogW10sIG5vdGVzOiAnJyB9O1xuICAgIGlmICghbS5zZXR0aW5ncy5wbGF0Zm9ybXMueW91dHViZSkgICBtLnNldHRpbmdzLnBsYXRmb3Jtcy55b3V0dWJlICAgPSB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCB0aXRsZV9saW1pdDogMTAwLCAgZGVzY3JpcHRpb25fbGltaXQ6IDUwMDAsIHRhZ19saW1pdDogNTAwLCBub3RlczogJycgfTtcbiAgICBtLnNldHRpbmdzLmRlZmF1bHRzID0gbS5zZXR0aW5ncy5kZWZhdWx0cyB8fCB7IHR5cGU6ICdpbWFnZScsIHBsYXRmb3JtczogWydsaW5rZWRpbiddLCB0b25lX2lkOiAnJywgYXVkaWVuY2VfaWQ6ICcnLCBwcmlvcml0eTogJ21lZGl1bScsIHRvcGljczogW10gfTtcbiAgICBtLnNldHRpbmdzLnRvbmVzID0gbS5zZXR0aW5ncy50b25lcyB8fCBnZXREZWZhdWx0VG9uZXMoKTtcbiAgICBtLnNldHRpbmdzLmF1ZGllbmNlcyA9IG0uc2V0dGluZ3MuYXVkaWVuY2VzIHx8IGdldERlZmF1bHRBdWRpZW5jZXMoKTtcbiAgICBtLnNldHRpbmdzLmltYWdlX3N0eWxlcyA9IG0uc2V0dGluZ3MuaW1hZ2Vfc3R5bGVzIHx8IGdldERlZmF1bHRJbWFnZVN0eWxlcygpO1xuICAgIG0uc2V0dGluZ3MubWVkaWFfcHJvbXB0X3RlbXBsYXRlcyA9IG0uc2V0dGluZ3MubWVkaWFfcHJvbXB0X3RlbXBsYXRlcyB8fCBnZXREZWZhdWx0TWVkaWFQcm9tcHRUZW1wbGF0ZXMoKTtcbiAgICBtLnNldHRpbmdzLnJlc2VhcmNoX3RlbXBsYXRlcyA9IG0uc2V0dGluZ3MucmVzZWFyY2hfdGVtcGxhdGVzIHx8IGdldERlZmF1bHRSZXNlYXJjaFRlbXBsYXRlcygpO1xuICAgIG0uYWlQcmVmZXJlbmNlcyA9IG0uYWlQcmVmZXJlbmNlcyB8fCB7fTtcbiAgICBtLmFpUHJlZmVyZW5jZXMucGVyQWN0aW9uID0gbS5haVByZWZlcmVuY2VzLnBlckFjdGlvbiB8fCB7fTtcbiAgICBtLmFpUHJlZmVyZW5jZXMubGFzdFByb3ZpZGVyID0gbS5haVByZWZlcmVuY2VzLmxhc3RQcm92aWRlciB8fCAnJztcbiAgICBtLmFpUHJlZmVyZW5jZXMubGFzdE1vZGVsID0gbS5haVByZWZlcmVuY2VzLmxhc3RNb2RlbCB8fCAnJztcbiAgICAvLyBTZXR1cCB3aXphcmQgc3RhdGVcbiAgICBtLnNldHVwID0gbS5zZXR1cCB8fCB7IGZpcnN0UnVuOiB0cnVlLCBjb21wbGV0ZWRBdDogJycsIHZlcnNpb246IDEgfTtcbiAgICBpZiAodHlwZW9mIG0uc2V0dXAuZmlyc3RSdW4gIT09ICdib29sZWFuJykgbS5zZXR1cC5maXJzdFJ1biA9IHRydWU7XG4gICAgbS5zZXR1cC5jb21wbGV0ZWRBdCA9IG0uc2V0dXAuY29tcGxldGVkQXQgfHwgJyc7XG4gICAgbS5zZXR1cC52ZXJzaW9uID0gbS5zZXR1cC52ZXJzaW9uIHx8IDE7XG4gICAgLy8gUmVmZXJlbmNlIGltYWdlIG1ldGFkYXRhXG4gICAgbS5yZWZlcmVuY2VfaW1hZ2VzID0gbS5yZWZlcmVuY2VfaW1hZ2VzIHx8IHt9O1xuICAgIG0uaW1hZ2VfY2F0ZWdvcmllcyA9IG0uaW1hZ2VfY2F0ZWdvcmllcyB8fCBnZXREZWZhdWx0SW1hZ2VDYXRlZ29yaWVzKCk7XG4gICAgLy8gQnJhbmQgZGVzaWduIGd1aWRlXG4gICAgbS5zZXR0aW5ncy5icmFuZF9kZXNpZ24gPSBtLnNldHRpbmdzLmJyYW5kX2Rlc2lnbiB8fCBnZXREZWZhdWx0QnJhbmREZXNpZ24oKTtcbiAgICBTLmNhcmREZW5zaXR5ID0gbS5zZXR0aW5ncy5jYXJkX2RlbnNpdHk7XG4gICAgUy5jdXJyZW50VmlldyA9IHJlYWRIYXNoKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXREZWZhdWx0RGF0YSgpIHsgcmV0dXJuIHsgcG9zdHM6IFtdLCByZXNlYXJjaDogeyBzZXNzaW9uczogW10gfSwgdG9waWNzOiBbXSwgc2VyaWVzOiBbXSB9OyB9XG5cbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdE1ldGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdvcmtzcGFjZTogeyBuYW1lOiAnJywgZGVzY3JpcHRpb246ICcnLCBjcmVhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIHRpbWV6b25lOiAnQXNpYS9Lb2xrYXRhJywgY2FyZF9kZW5zaXR5OiAnbm9ybWFsJywgZGVmYXVsdF92aWV3OiAnZGFzaGJvYXJkJyxcbiAgICAgICAgcGxhdGZvcm1zOiB7XG4gICAgICAgICAgbGlua2VkaW46ICB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCBjaGFyX2xpbWl0OiAzMDAwLCAgaGFzaHRhZ19saW1pdDogNSwgIGJlc3RfdGltZXM6IFsnMDk6MDAnLCAnMTI6MDAnLCAnMTc6MDAnXSwgbm90ZXM6ICcnIH0sXG4gICAgICAgICAgaW5zdGFncmFtOiB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCBjaGFyX2xpbWl0OiAyMjAwLCAgaGFzaHRhZ19saW1pdDogMzAsIGJlc3RfdGltZXM6IFsnMTE6MDAnLCAnMTQ6MDAnLCAnMTk6MDAnXSwgbm90ZXM6ICcnIH0sXG4gICAgICAgICAgZmFjZWJvb2s6ICB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCBjaGFyX2xpbWl0OiA2MzIwNiwgaGFzaHRhZ19saW1pdDogMTAsIGJlc3RfdGltZXM6IFsnMDk6MDAnLCAnMTM6MDAnLCAnMTY6MDAnXSwgbm90ZXM6ICcnIH0sXG4gICAgICAgICAgeW91dHViZTogICB7IGVuYWJsZWQ6IHRydWUsICBoYW5kbGU6ICcnLCB0aXRsZV9saW1pdDogMTAwLCAgZGVzY3JpcHRpb25fbGltaXQ6IDUwMDAsIHRhZ19saW1pdDogNTAwLCBub3RlczogJycgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0czogeyB0eXBlOiAnaW1hZ2UnLCBwbGF0Zm9ybXM6IFsnbGlua2VkaW4nXSwgdG9uZV9pZDogJycsIGF1ZGllbmNlX2lkOiAnJywgcHJpb3JpdHk6ICdtZWRpdW0nLCB0b3BpY3M6IFtdIH0sXG4gICAgICAgIHRvbmVzOiBnZXREZWZhdWx0VG9uZXMoKSwgYXVkaWVuY2VzOiBnZXREZWZhdWx0QXVkaWVuY2VzKCksIGltYWdlX3N0eWxlczogZ2V0RGVmYXVsdEltYWdlU3R5bGVzKCksXG4gICAgICAgIG1lZGlhX3Byb21wdF90ZW1wbGF0ZXM6IGdldERlZmF1bHRNZWRpYVByb21wdFRlbXBsYXRlcygpLCByZXNlYXJjaF90ZW1wbGF0ZXM6IGdldERlZmF1bHRSZXNlYXJjaFRlbXBsYXRlcygpLFxuICAgICAgICBicmFuZF9kZXNpZ246IGdldERlZmF1bHRCcmFuZERlc2lnbigpXG4gICAgICB9LFxuICAgICAgYWlQcmVmZXJlbmNlczogeyBhcHBEZWZhdWx0OiB7fSwgcGVyQWN0aW9uOiB7fSwgbGFzdFByb3ZpZGVyOiAnJywgbGFzdE1vZGVsOiAnJyB9LFxuICAgICAgcmVmZXJlbmNlX2ltYWdlczoge30sXG4gICAgICBpbWFnZV9jYXRlZ29yaWVzOiBnZXREZWZhdWx0SW1hZ2VDYXRlZ29yaWVzKCksXG4gICAgICBzZXR1cDogeyBmaXJzdFJ1bjogdHJ1ZSwgY29tcGxldGVkQXQ6ICcnLCB2ZXJzaW9uOiAxIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdFRvbmVzKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IGlkOiAndG9uZV8wMDEnLCBuYW1lOiAnUHJvZmVzc2lvbmFsJywgZGVzY3JpcHRpb246ICdBdXRob3JpdGF0aXZlLCBkYXRhLWRyaXZlbiwgcG9saXNoZWQnIH0sXG4gICAgICB7IGlkOiAndG9uZV8wMDInLCBuYW1lOiAnQ29udmVyc2F0aW9uYWwnLCBkZXNjcmlwdGlvbjogJ0ZyaWVuZGx5LCByZWxhdGFibGUsIGFwcHJvYWNoYWJsZScgfSxcbiAgICAgIHsgaWQ6ICd0b25lXzAwMycsIG5hbWU6ICdFZHVjYXRpb25hbCcsIGRlc2NyaXB0aW9uOiAnVGVhY2hpbmcsIHN0ZXAtYnktc3RlcCwgY2xlYXInIH0sXG4gICAgICB7IGlkOiAndG9uZV8wMDQnLCBuYW1lOiAnU3Rvcnl0ZWxsaW5nJywgZGVzY3JpcHRpb246ICdOYXJyYXRpdmUtZHJpdmVuLCBwZXJzb25hbCwgZW5nYWdpbmcnIH0sXG4gICAgICB7IGlkOiAndG9uZV8wMDUnLCBuYW1lOiAnQm9sZCAvIFByb3ZvY2F0aXZlJywgZGVzY3JpcHRpb246ICdDb250cmFyaWFuLCBhdHRlbnRpb24tZ3JhYmJpbmcsIHB1bmNoeScgfSxcbiAgICAgIHsgaWQ6ICd0b25lXzAwNicsIG5hbWU6ICdJbnNwaXJhdGlvbmFsJywgZGVzY3JpcHRpb246ICdNb3RpdmF0aW9uYWwsIHVwbGlmdGluZywgdmlzaW9uYXJ5JyB9XG4gICAgXTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZWZhdWx0QXVkaWVuY2VzKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IGlkOiAnYXVkXzAwMScsIG5hbWU6ICdJbmR1c3RyeSBQZWVycycsIGRlc2NyaXB0aW9uOiAnUHJvZmVzc2lvbmFscyBpbiB5b3VyIGZpZWxkJyB9LFxuICAgICAgeyBpZDogJ2F1ZF8wMDInLCBuYW1lOiAnRGVjaXNpb24gTWFrZXJzJywgZGVzY3JpcHRpb246ICdDLXN1aXRlLCBtYW5hZ2VycywgYnV5ZXJzJyB9LFxuICAgICAgeyBpZDogJ2F1ZF8wMDMnLCBuYW1lOiAnQmVnaW5uZXJzJywgZGVzY3JpcHRpb246ICdOZXcgdG8gdGhlIHRvcGljJyB9LFxuICAgICAgeyBpZDogJ2F1ZF8wMDQnLCBuYW1lOiAnRGV2ZWxvcGVycycsIGRlc2NyaXB0aW9uOiAnVGVjaG5pY2FsIGF1ZGllbmNlJyB9LFxuICAgICAgeyBpZDogJ2F1ZF8wMDUnLCBuYW1lOiAnU21hbGwgQnVzaW5lc3MgT3duZXJzJywgZGVzY3JpcHRpb246ICdOb24tdGVjaG5pY2FsLCBST0ktZm9jdXNlZCcgfVxuICAgIF07XG4gIH1cbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdEltYWdlU3R5bGVzKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IGlkOiAnaXNfMDAxJywgbmFtZTogJ1Bob3RvcmVhbGlzdGljJywgZGVzY3JpcHRpb246ICdSZWFsIHBob3RvZ3JhcGh5IGxvb2snIH0sXG4gICAgICB7IGlkOiAnaXNfMDAyJywgbmFtZTogJ0ZsYXQgSWxsdXN0cmF0aW9uJywgZGVzY3JpcHRpb246ICdDbGVhbiB2ZWN0b3Igc3R5bGUnIH0sXG4gICAgICB7IGlkOiAnaXNfMDAzJywgbmFtZTogJzNEIFJlbmRlcicsIGRlc2NyaXB0aW9uOiAnRGltZW5zaW9uYWwsIGdsb3NzeScgfSxcbiAgICAgIHsgaWQ6ICdpc18wMDQnLCBuYW1lOiAnTWluaW1hbGlzdCcsIGRlc2NyaXB0aW9uOiAnU2ltcGxlLCBjbGVhbiwgd2hpdGVzcGFjZScgfSxcbiAgICAgIHsgaWQ6ICdpc18wMDUnLCBuYW1lOiAnQ29ycG9yYXRlJywgZGVzY3JpcHRpb246ICdCdXNpbmVzcywgcG9saXNoZWQnIH0sXG4gICAgICB7IGlkOiAnaXNfMDA2JywgbmFtZTogJ0JyYW5kZWQnLCBkZXNjcmlwdGlvbjogJ01hdGNoIGJyYW5kIHZpc3VhbCBpZGVudGl0eScgfVxuICAgIF07XG4gIH1cbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdE1lZGlhUHJvbXB0VGVtcGxhdGVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpbWFnZTogJ0NyZWF0ZSBhIHtzdHlsZX0gaW1hZ2UgZm9yIGEge3BsYXRmb3JtfSBwb3N0IGFib3V0OiB7dG9waWN9LlxcblxcbkJyYW5kOiB7YnJhbmRfbmFtZX1cXG5Nb29kOiB7dG9uZX1cXG5LZXkgbWVzc2FnZToge2hvb2t9XFxuXFxue2N1c3RvbV9pbnN0cnVjdGlvbnN9JyxcbiAgICAgIGNhcm91c2VsX2JhdGNoOiAnQ3JlYXRlIHtjb3VudH0gY29oZXNpdmUgaW1hZ2VzIGZvciBhIHtwbGF0Zm9ybX0gY2Fyb3VzZWwgcG9zdC5cXG5cXG5PdmVyYWxsIHRvcGljOiB7dG9waWN9XFxuU3R5bGU6IHtzdHlsZX1cXG5CcmFuZDoge2JyYW5kX25hbWV9XFxuXFxuU2xpZGUgdGhlbWVzOlxcbntzbGlkZV90aGVtZXN9XFxuXFxuRW5zdXJlIHZpc3VhbCBjb25zaXN0ZW5jeSBhY3Jvc3MgYWxsIHNsaWRlcy5cXG5cXG57Y3VzdG9tX2luc3RydWN0aW9uc30nLFxuICAgICAgdGh1bWJuYWlsOiAnQ3JlYXRlIGEgdGh1bWJuYWlsIGltYWdlIGZvciBhIHNob3J0LWZvcm0gdmlkZW8gYWJvdXQ6IHt0b3BpY30uXFxuXFxuU3R5bGU6IHtzdHlsZX1cXG5CcmFuZDoge2JyYW5kX25hbWV9XFxuTW9vZDoge3RvbmV9XFxuTXVzdCBiZSBleWUtY2F0Y2hpbmcgYW5kIGNsZWFyIGF0IHNtYWxsIHNpemVzLlxcblxcbntjdXN0b21faW5zdHJ1Y3Rpb25zfSdcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGdldERlZmF1bHRSZXNlYXJjaFRlbXBsYXRlcygpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyBpZDogJ3J0XzAwMScsIG5hbWU6ICdUb3BpYyBJZGVhdGlvbicsIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgcG9zdCBpZGVhcyBmb3IgYSB0b3BpYycsIHByb21wdDogJ0dlbmVyYXRlIHtjb3VudH0gY3JlYXRpdmUgcG9zdCBpZGVhcyBhYm91dDoge3RvcGljfS5cXG5cXG5SZXNwb25kIE9OTFkgYXMgYSBKU09OIGFycmF5LicsIHZhcmlhYmxlczogWyd0b3BpYycsICdjb3VudCcsICdwbGF0Zm9ybScsICdhdWRpZW5jZScsICd0b25lJywgJ2N1c3RvbV9pbnN0cnVjdGlvbnMnXSB9LFxuICAgICAgeyBpZDogJ3J0XzAwMicsIG5hbWU6ICdDb21wZXRpdG9yIEFuYWx5c2lzJywgZGVzY3JpcHRpb246ICdEaWZmZXJlbnRpYXRlZCBpZGVhcyBmcm9tIGNvbXBldGl0b3InLCBwcm9tcHQ6ICdBbmFseXplIGNvbXBldGl0b3IgYW5kIHN1Z2dlc3Qge2NvdW50fSBkaWZmZXJlbnRpYXRlZCBpZGVhcy5cXG5cXG5SZXNwb25kIE9OTFkgYXMgYSBKU09OIGFycmF5LicsIHZhcmlhYmxlczogWydjb21wZXRpdG9yX2luZm8nLCAnYnJhbmRfaW5mbycsICd0b3BpYycsICdjb3VudCddIH0sXG4gICAgICB7IGlkOiAncnRfMDAzJywgbmFtZTogJ0NvbnRlbnQgUGlsbGFyIEV4cGFuc2lvbicsIGRlc2NyaXB0aW9uOiAnRXhwYW5kIGEgY29udGVudCBwaWxsYXInLCBwcm9tcHQ6ICdFeHBhbmQgcGlsbGFyIFxcJ3twaWxsYXJ9XFwnIGludG8ge2NvdW50fSBkaXZlcnNlIGlkZWFzLlxcblxcblJlc3BvbmQgT05MWSBhcyBhIEpTT04gYXJyYXkuJywgdmFyaWFibGVzOiBbJ3BpbGxhcicsICdjb3VudCcsICdwbGF0Zm9ybXMnLCAnYXVkaWVuY2UnXSB9XG4gICAgXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERlZmF1bHRJbWFnZUNhdGVnb3JpZXMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgaWQ6ICdsaW5rZWRpbl9wb3N0JywgbGFiZWw6ICdMaW5rZWRJbiBQb3N0JywgaWNvbjogJ2xpbmtlZGluJywgY29sb3I6ICcjMDA3N2I1JyB9LFxuICAgICAgeyBpZDogJ2Nhcm91c2VsX3NsaWRlJywgbGFiZWw6ICdDYXJvdXNlbCBTbGlkZScsIGljb246ICdpbWFnZXMnLCBjb2xvcjogJyM3YzNhZWQnIH0sXG4gICAgICB7IGlkOiAndGh1bWJuYWlsJywgbGFiZWw6ICdUaHVtYm5haWwnLCBpY29uOiAndmlkZW8nLCBjb2xvcjogJyNkOTMwMjUnIH0sXG4gICAgICB7IGlkOiAnbG9nbycsIGxhYmVsOiAnTG9nbyAvIEJyYW5kaW5nJywgaWNvbjogJ2ZpbmdlcnByaW50JywgY29sb3I6ICcjMGQ5MDRmJyB9LFxuICAgICAgeyBpZDogJ3BhdHRlcm4nLCBsYWJlbDogJ1BhdHRlcm4gLyBUZXh0dXJlJywgaWNvbjogJ2dyaWQtMicsIGNvbG9yOiAnI2UzNzQwMCcgfSxcbiAgICAgIHsgaWQ6ICdpbnN0YWdyYW1fcG9zdCcsIGxhYmVsOiAnSW5zdGFncmFtIFBvc3QnLCBpY29uOiAnaW5zdGFncmFtJywgY29sb3I6ICcjZTQ0MDVmJyB9LFxuICAgICAgeyBpZDogJ290aGVyJywgbGFiZWw6ICdPdGhlcicsIGljb246ICdpbWFnZScsIGNvbG9yOiAnIzgwODY4YicgfVxuICAgIF07XG4gIH1cblxuICBmdW5jdGlvbiBnZXREZWZhdWx0QnJhbmREZXNpZ24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yczogeyBwcmltYXJ5OiAnJywgc2Vjb25kYXJ5OiAnJywgYWNjZW50OiAnJywgYmFja2dyb3VuZDogJyNmZmZmZmYnLCB0ZXh0OiAnIzIwMjEyNCcsIHBhbGV0dGVfZGVzY3JpcHRpb246ICcnIH0sXG4gICAgICB0eXBvZ3JhcGh5OiB7IGhlYWRpbmdfc3R5bGU6ICcnLCBib2R5X3N0eWxlOiAnJywgdGV4dF90cmVhdG1lbnQ6ICcnIH0sXG4gICAgICB2aXN1YWxfc3R5bGU6IHsgb3ZlcmFsbF9hZXN0aGV0aWM6ICcnLCBwaG90b2dyYXBoeV9zdHlsZTogJycsIGlsbHVzdHJhdGlvbl9zdHlsZTogJycsIGljb25fc3R5bGU6ICcnLCBwYXR0ZXJuX3VzYWdlOiAnJywgbW9vZDogJycgfSxcbiAgICAgIGxheW91dF9ydWxlczogeyBpbWFnZV9jb21wb3NpdGlvbjogJycsIGNhcm91c2VsX2NvbnNpc3RlbmN5OiAnJywgdGh1bWJuYWlsX3N0eWxlOiAnJywgYm9yZGVyX3JhZGl1czogJycsIHNwYWNpbmc6ICcnIH0sXG4gICAgICByZWZlcmVuY2VfaW1hZ2VfaWRzOiB7IHByaW1hcnlfc3R5bGU6IFtdLCBjYXJvdXNlbF90ZW1wbGF0ZTogW10sIHRodW1ibmFpbF90ZW1wbGF0ZTogW10gfSxcbiAgICAgIGJyYW5kX3Byb21wdF9wcmVmaXg6ICcnXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluamVjdFF1aWxsQ1NTKCkge1xuICAgIGlmICghJCgnbGlua1tocmVmKj1cInF1aWxsXCJdJykubGVuZ3RoKSB7XG4gICAgICAkKCdoZWFkJykuYXBwZW5kKCc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vcXVpbGxAMi4wLjMvZGlzdC9xdWlsbC5zbm93LmNzc1wiPicpO1xuICAgIH1cbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDQ6IE1BUCBCVUlMREVSU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBidWlsZE1hcHMoKSB7XG4gICAgLy8gUG9zdHNcbiAgICBTLnBvc3RNYXAgPSB7fTsgUy5zdGF0dXNDb3VudHMgPSB7fTsgUy50eXBlQ291bnRzID0ge307IFMucGxhdGZvcm1Db3VudHMgPSB7fTsgUy50b3BpY0luZGV4ID0ge307IFMuc2VyaWVzSW5kZXggPSB7fTtcbiAgICBTLnRvdGFsUG9zdHMgPSAwOyBTLmFjdGl2ZVBvc3RzID0gMDsgUy5wdWJsaXNoZWRQb3N0cyA9IDA7XG4gICAgZm9yICh2YXIgc3QgaW4gUE9TVF9TVEFUVVNFUykgUy5zdGF0dXNDb3VudHNbc3RdID0gMDtcbiAgICBmb3IgKHZhciBwdCBpbiBQT1NUX1RZUEVTKSBTLnR5cGVDb3VudHNbcHRdID0gMDtcbiAgICBmb3IgKHZhciBwayBpbiBQTEFURk9STVMpIFMucGxhdGZvcm1Db3VudHNbcGtdID0gMDtcblxuICAgIHZhciBwb3N0cyA9IFMuZGF0YS5wb3N0cyB8fCBbXTtcbiAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcG9zdHMubGVuZ3RoOyBwaSsrKSB7XG4gICAgICB2YXIgcCA9IHBvc3RzW3BpXTtcbiAgICAgIFMucG9zdE1hcFtwLmlkXSA9IHA7XG4gICAgICBTLnN0YXR1c0NvdW50c1twLnN0YXR1c10gPSAoUy5zdGF0dXNDb3VudHNbcC5zdGF0dXNdIHx8IDApICsgMTtcbiAgICAgIFMudHlwZUNvdW50c1twLnR5cGVdID0gKFMudHlwZUNvdW50c1twLnR5cGVdIHx8IDApICsgMTtcbiAgICAgIFMudG90YWxQb3N0cysrO1xuICAgICAgaWYgKEFDVElWRV9TVEFUVVNFUy5pbmRleE9mKHAuc3RhdHVzKSA+IC0xKSBTLmFjdGl2ZVBvc3RzKys7XG4gICAgICBlbHNlIGlmIChwLnN0YXR1cyA9PT0gJ3B1Ymxpc2hlZCcpIFMucHVibGlzaGVkUG9zdHMrKztcbiAgICAgIC8vIFBsYXRmb3JtIGNvdW50c1xuICAgICAgdmFyIHBsYXRzID0gcC5wbGF0Zm9ybXMgfHwgW107XG4gICAgICBmb3IgKHZhciBwbGkgPSAwOyBwbGkgPCBwbGF0cy5sZW5ndGg7IHBsaSsrKSBTLnBsYXRmb3JtQ291bnRzW3BsYXRzW3BsaV1dID0gKFMucGxhdGZvcm1Db3VudHNbcGxhdHNbcGxpXV0gfHwgMCkgKyAxO1xuICAgICAgLy8gVG9waWMgaW5kZXhcbiAgICAgIHZhciBwVG9waWNzID0gcC50b3BpY3MgfHwgW107XG4gICAgICBmb3IgKHZhciB0aSA9IDA7IHRpIDwgcFRvcGljcy5sZW5ndGg7IHRpKyspIHtcbiAgICAgICAgUy50b3BpY0luZGV4W3BUb3BpY3NbdGldXSA9IFMudG9waWNJbmRleFtwVG9waWNzW3RpXV0gfHwgW107XG4gICAgICAgIFMudG9waWNJbmRleFtwVG9waWNzW3RpXV0ucHVzaChwLmlkKTtcbiAgICAgIH1cbiAgICAgIC8vIFNlcmllcyBpbmRleFxuICAgICAgaWYgKHAuc2VyaWVzSWQpIHtcbiAgICAgICAgUy5zZXJpZXNJbmRleFtwLnNlcmllc0lkXSA9IFMuc2VyaWVzSW5kZXhbcC5zZXJpZXNJZF0gfHwgW107XG4gICAgICAgIFMuc2VyaWVzSW5kZXhbcC5zZXJpZXNJZF0ucHVzaChwLmlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb3BpY3NcbiAgICBTLnRvcGljTWFwID0ge307XG4gICAgdmFyIHRvcGljcyA9IFMuZGF0YS50b3BpY3MgfHwgW107XG4gICAgZm9yICh2YXIgdGdpID0gMDsgdGdpIDwgdG9waWNzLmxlbmd0aDsgdGdpKyspIFMudG9waWNNYXBbdG9waWNzW3RnaV0uaWRdID0gdG9waWNzW3RnaV07XG5cbiAgICAvLyBTZXJpZXNcbiAgICBTLnNlcmllc01hcCA9IHt9O1xuICAgIHZhciBzZXJpZXNMaXN0ID0gUy5kYXRhLnNlcmllcyB8fCBbXTtcbiAgICBmb3IgKHZhciBzcmkgPSAwOyBzcmkgPCBzZXJpZXNMaXN0Lmxlbmd0aDsgc3JpKyspIFMuc2VyaWVzTWFwW3Nlcmllc0xpc3Rbc3JpXS5pZF0gPSBzZXJpZXNMaXN0W3NyaV07XG5cbiAgICAvLyBSZXNlYXJjaCBzZXNzaW9uc1xuICAgIFMucmVzZWFyY2hNYXAgPSB7fTtcbiAgICB2YXIgc2Vzc2lvbnMgPSAoUy5kYXRhLnJlc2VhcmNoICYmIFMuZGF0YS5yZXNlYXJjaC5zZXNzaW9ucykgfHwgW107XG4gICAgZm9yICh2YXIgc2kgPSAwOyBzaSA8IHNlc3Npb25zLmxlbmd0aDsgc2krKykgUy5yZXNlYXJjaE1hcFtzZXNzaW9uc1tzaV0uaWRdID0gc2Vzc2lvbnNbc2ldO1xuXG4gICAgLy8gU2V0dGluZ3MgbWFwc1xuICAgIFMudG9uZU1hcCA9IHt9OyBTLmF1ZGllbmNlTWFwID0ge307IFMuaW1hZ2VTdHlsZU1hcCA9IHt9O1xuICAgIHZhciB0b25lcyA9IChTLm1ldGEuc2V0dGluZ3MgJiYgUy5tZXRhLnNldHRpbmdzLnRvbmVzKSB8fCBbXTtcbiAgICBmb3IgKHZhciB0bmkgPSAwOyB0bmkgPCB0b25lcy5sZW5ndGg7IHRuaSsrKSBTLnRvbmVNYXBbdG9uZXNbdG5pXS5pZF0gPSB0b25lc1t0bmldO1xuICAgIHZhciBhdWRzID0gKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MuYXVkaWVuY2VzKSB8fCBbXTtcbiAgICBmb3IgKHZhciBhaSA9IDA7IGFpIDwgYXVkcy5sZW5ndGg7IGFpKyspIFMuYXVkaWVuY2VNYXBbYXVkc1thaV0uaWRdID0gYXVkc1thaV07XG4gICAgdmFyIHN0eWxlcyA9IChTLm1ldGEuc2V0dGluZ3MgJiYgUy5tZXRhLnNldHRpbmdzLmltYWdlX3N0eWxlcykgfHwgW107XG4gICAgZm9yICh2YXIgaXNpID0gMDsgaXNpIDwgc3R5bGVzLmxlbmd0aDsgaXNpKyspIFMuaW1hZ2VTdHlsZU1hcFtzdHlsZXNbaXNpXS5pZF0gPSBzdHlsZXNbaXNpXTtcblxuICAgIC8vIEltYWdlIGNhdGVnb3J5IG1hcFxuICAgIFMuaW1hZ2VDYXRlZ29yeU1hcCA9IHt9O1xuICAgIHZhciBjYXRzID0gKFMubWV0YSAmJiBTLm1ldGEuaW1hZ2VfY2F0ZWdvcmllcykgfHwgW107XG4gICAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IGNhdHMubGVuZ3RoOyBjaSsrKSBTLmltYWdlQ2F0ZWdvcnlNYXBbY2F0c1tjaV0uaWRdID0gY2F0c1tjaV07XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA1OiBOQVZJR0FUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIG5hdmlnYXRlKHZpZXdOYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKCFBUFBfVklFV1Nbdmlld05hbWVdKSB7IGNvbnNvbGUud2FybignW1NDUF0gVW5rbm93biB2aWV3OicsIHZpZXdOYW1lKTsgcmV0dXJuOyB9XG4gICAgUy5wcmV2aW91c1ZpZXcgPSBTLmN1cnJlbnRWaWV3OyBTLmN1cnJlbnRWaWV3ID0gdmlld05hbWU7XG4gICAgdXBkYXRlU2lkZWJhckFjdGl2ZSh2aWV3TmFtZSk7IHJlbmRlckN1cnJlbnRWaWV3KCk7XG4gICAgaWYgKCFvcHRpb25zLm5vSGFzaCkgdXBkYXRlSGFzaCh2aWV3TmFtZSk7XG4gICAgaWYgKG9wdGlvbnMuc2Nyb2xsVG9wICE9PSBmYWxzZSkgJCgnI3NjcENvbnRlbnQnKS5zY3JvbGxUb3AoMCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVIYXNoKHYpIHsgaWYgKGhpc3RvcnkucmVwbGFjZVN0YXRlKSBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBudWxsLCAnIycgKyB2KTsgZWxzZSB3aW5kb3cubG9jYXRpb24uaGFzaCA9IHY7IH1cbiAgZnVuY3Rpb24gcmVhZEhhc2goKSB7IHZhciBoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTsgcmV0dXJuIChoICYmIEFQUF9WSUVXU1toXSkgPyBoIDogKFMubWV0YSAmJiBTLm1ldGEuc2V0dGluZ3MgJiYgUy5tZXRhLnNldHRpbmdzLmRlZmF1bHRfdmlldykgfHwgJ2Rhc2hib2FyZCc7IH1cbiAgZnVuY3Rpb24gdXBkYXRlU2lkZWJhckFjdGl2ZSh2KSB7ICQoJy5zY3AtbmF2LWl0ZW0nKS5yZW1vdmVDbGFzcygnc2NwLW5hdi1pdGVtLWFjdGl2ZScpOyAkKCcuc2NwLW5hdi1pdGVtW2RhdGEtdmlldz1cIicgKyB2ICsgJ1wiXScpLmFkZENsYXNzKCdzY3AtbmF2LWl0ZW0tYWN0aXZlJyk7IH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA2OiBVVElMSVRJRVNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgLy8gLS0tIEZvcm1hdHRlcnMgLS0tXG4gIGZ1bmN0aW9uIGZvcm1hdERhdGUoaXNvKSB7IGlmICghaXNvKSByZXR1cm4gJyc7IHZhciBkID0gbmV3IERhdGUoaXNvKTsgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHsgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnLCB5ZWFyOiAnbnVtZXJpYycgfSk7IH1cbiAgZnVuY3Rpb24gZm9ybWF0RGF0ZVNob3J0KGlzbykgeyBpZiAoIWlzbykgcmV0dXJuICcnOyB2YXIgZCA9IG5ldyBEYXRlKGlzbyk7IHJldHVybiBkLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7IG1vbnRoOiAnc2hvcnQnLCBkYXk6ICdudW1lcmljJyB9KTsgfVxuICBmdW5jdGlvbiBmb3JtYXRSZWxhdGl2ZVRpbWUoaXNvKSB7XG4gICAgaWYgKCFpc28pIHJldHVybiAnJztcbiAgICB2YXIgZGlmZiA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBuZXcgRGF0ZShpc28pLmdldFRpbWUoKSkgLyAxMDAwKTtcbiAgICBpZiAoZGlmZiA8IDYwKSByZXR1cm4gJ2p1c3Qgbm93JztcbiAgICBpZiAoZGlmZiA8IDM2MDApIHJldHVybiBNYXRoLmZsb29yKGRpZmYgLyA2MCkgKyAnbSBhZ28nO1xuICAgIGlmIChkaWZmIDwgODY0MDApIHJldHVybiBNYXRoLmZsb29yKGRpZmYgLyAzNjAwKSArICdoIGFnbyc7XG4gICAgaWYgKGRpZmYgPCA2MDQ4MDApIHJldHVybiBNYXRoLmZsb29yKGRpZmYgLyA4NjQwMCkgKyAnZCBhZ28nO1xuICAgIHJldHVybiBmb3JtYXREYXRlKGlzbyk7XG4gIH1cbiAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKG4pIHsgcmV0dXJuIChuIHx8IDApLnRvTG9jYWxlU3RyaW5nKCk7IH1cbiAgZnVuY3Rpb24gZm9ybWF0Q2hhckNvdW50KGN1cnJlbnQsIGxpbWl0KSB7XG4gICAgdmFyIHBjdCA9IGxpbWl0ID4gMCA/IChjdXJyZW50IC8gbGltaXQpICogMTAwIDogMDtcbiAgICB2YXIgY29sb3IgPSBwY3QgPiA5NSA/ICd2YXIoLS1zY3AtZXJyb3IpJyA6IHBjdCA+IDgwID8gJ3ZhcigtLXNjcC13YXJuaW5nKScgOiAndmFyKC0tc2NwLXRleHQtbXV0ZWQpJztcbiAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwic2NwLWNoYXItY291bnRcIiBzdHlsZT1cImNvbG9yOicgKyBjb2xvciArICdcIj4nICsgZm9ybWF0TnVtYmVyKGN1cnJlbnQpICsgJyAvICcgKyBmb3JtYXROdW1iZXIobGltaXQpICsgJzwvc3Bhbj4nO1xuICB9XG5cbiAgLy8gLS0tIFRleHQgLS0tXG4gIGZ1bmN0aW9uIGVzYyh0ZXh0KSB7IGlmICghdGV4dCkgcmV0dXJuICcnOyB2YXIgZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyBkLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTsgcmV0dXJuIGQuaW5uZXJIVE1MOyB9XG4gIGZ1bmN0aW9uIHRydW5jYXRlKHRleHQsIG1heCkgeyBpZiAoIXRleHQgfHwgdGV4dC5sZW5ndGggPD0gbWF4KSByZXR1cm4gdGV4dCB8fCAnJzsgcmV0dXJuIHRleHQuc3Vic3RyaW5nKDAsIG1heCkgKyAnXHUyMDI2JzsgfVxuICBmdW5jdGlvbiBjb3VudFdvcmRzKHRleHQpIHsgcmV0dXJuIHRleHQgPyB0ZXh0LnRyaW0oKS5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKS5sZW5ndGggOiAwOyB9XG4gIGZ1bmN0aW9uIGNvdW50Q2hhcnModGV4dCkgeyByZXR1cm4gdGV4dCA/IHRleHQubGVuZ3RoIDogMDsgfVxuXG4gIC8vIC0tLSBJY29ucyAoRm9udCBBd2Vzb21lIFBybykgLS0tXG4gIGZ1bmN0aW9uIGljb24obmFtZSwgY2xhc3NOYW1lKSB7XG4gICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lIHx8ICcnO1xuICAgIHZhciBpY29ucyA9IHtcbiAgICAgICdzZWFyY2gnOiAnZmEtbWFnbmlmeWluZy1nbGFzcycsICdsaWdodGJ1bGInOiAnZmEtbGlnaHRidWxiJywgJ2ZpbGUtdGV4dCc6ICdmYS1maWxlLWxpbmVzJyxcbiAgICAgICdzcGFya2xlcyc6ICdmYS1zcGFya2xlcycsICd3YW5kLXNwYXJrbGVzJzogJ2ZhLXdhbmQtbWFnaWMtc3BhcmtsZXMnLCAnd2FuZC1tYWdpYyc6ICdmYS13YW5kLW1hZ2ljLXNwYXJrbGVzJyxcbiAgICAgICdlZGl0JzogJ2ZhLXBlbi10by1zcXVhcmUnLCAndHJhc2gnOiAnZmEtdHJhc2gnLCAnY29weSc6ICdmYS1jb3B5JyxcbiAgICAgICdwbHVzJzogJ2ZhLXBsdXMnLCAnbWludXMnOiAnZmEtbWludXMnLCAneCc6ICdmYS14bWFyaycsXG4gICAgICAnY2hldnJvbi1kb3duJzogJ2ZhLWNoZXZyb24tZG93bicsICdjaGV2cm9uLXJpZ2h0JzogJ2ZhLWNoZXZyb24tcmlnaHQnLCAnY2hldnJvbi11cCc6ICdmYS1jaGV2cm9uLXVwJyxcbiAgICAgICdjaGV2cm9uLWxlZnQnOiAnZmEtY2hldnJvbi1sZWZ0JywgJ2V4dGVybmFsLWxpbmsnOiAnZmEtYXJyb3ctdXAtcmlnaHQtZnJvbS1zcXVhcmUnLFxuICAgICAgJ2Nsb2NrJzogJ2ZhLWNsb2NrJywgJ2Nsb2NrLXJvdGF0ZS1sZWZ0JzogJ2ZhLWNsb2NrLXJvdGF0ZS1sZWZ0JyxcbiAgICAgICdjYWxlbmRhcic6ICdmYS1jYWxlbmRhcicsICdjYWxlbmRhci1jaGVjayc6ICdmYS1jYWxlbmRhci1jaGVjaycsXG4gICAgICAndGFyZ2V0JzogJ2ZhLWJ1bGxzZXllJywgJ2JvbHQnOiAnZmEtYm9sdCcsICdwbGF5JzogJ2ZhLXBsYXknLFxuICAgICAgJ2dlYXInOiAnZmEtZ2VhcicsICdzZXR0aW5ncyc6ICdmYS1nZWFyJyxcbiAgICAgICdpbmZvJzogJ2ZhLWNpcmNsZS1pbmZvJywgJ2luZm8tY2lyY2xlJzogJ2ZhLWNpcmNsZS1pbmZvJyxcbiAgICAgICd3YXJuaW5nJzogJ2ZhLXRyaWFuZ2xlLWV4Y2xhbWF0aW9uJywgJ2Vycm9yJzogJ2ZhLWNpcmNsZS14bWFyaycsXG4gICAgICAnc3VjY2Vzcyc6ICdmYS1jaXJjbGUtY2hlY2snLCAnY2lyY2xlLWNoZWNrJzogJ2ZhLWNpcmNsZS1jaGVjaycsXG4gICAgICAnc3Rhcic6ICdmYS1zdGFyJywgJ3N0YXItaGFsZic6ICdmYS1zdGFyLWhhbGYtc3Ryb2tlJyxcbiAgICAgICdhcnJvdy11cCc6ICdmYS1hcnJvdy11cCcsICdhcnJvdy1kb3duJzogJ2ZhLWFycm93LWRvd24nLCAnYXJyb3ctcmlnaHQnOiAnZmEtYXJyb3ctcmlnaHQnLCAnYXJyb3ctbGVmdCc6ICdmYS1hcnJvdy1sZWZ0JyxcbiAgICAgICd2aWRlbyc6ICdmYS12aWRlbycsICdnbG9iZSc6ICdmYS1nbG9iZScsICdhcmNoaXZlJzogJ2ZhLWJveC1hcmNoaXZlJywgJ2JveC1hcmNoaXZlJzogJ2ZhLWJveC1hcmNoaXZlJyxcbiAgICAgICdsaW5rJzogJ2ZhLWxpbmsnLCAndXNlcnMnOiAnZmEtdXNlcnMnLCAndXNlcic6ICdmYS11c2VyJyxcbiAgICAgICdjaGFydC1saW5lJzogJ2ZhLWNoYXJ0LWxpbmUnLCAnY2hhcnQtcGllJzogJ2ZhLWNoYXJ0LXBpZScsICdiYXItY2hhcnQnOiAnZmEtY2hhcnQtYmFyJyxcbiAgICAgICdleWUnOiAnZmEtZXllJywgJ2V5ZS1vZmYnOiAnZmEtZXllLXNsYXNoJyxcbiAgICAgICdsaXN0JzogJ2ZhLWxpc3QnLCAnbGlzdC1vbCc6ICdmYS1saXN0LW9sJywgJ21lbnUnOiAnZmEtYmFycycsICdsYXlvdXQtZ3JpZCc6ICdmYS1ncmlkLTInLFxuICAgICAgJ2ltYWdlJzogJ2ZhLWltYWdlJywgJ2ltYWdlcyc6ICdmYS1pbWFnZXMnLFxuICAgICAgJ3Blbi1mYW5jeSc6ICdmYS1wZW4tZmFuY3knLCAncGVuJzogJ2ZhLXBlbicsXG4gICAgICAnYWxpZ24tbGVmdCc6ICdmYS1hbGlnbi1sZWZ0JywgJ2FsaWduLWNlbnRlcic6ICdmYS1hbGlnbi1jZW50ZXInLFxuICAgICAgJ3NoYXJlLW5vZGVzJzogJ2ZhLXNoYXJlLW5vZGVzJywgJ3NoYXJlJzogJ2ZhLXNoYXJlJyxcbiAgICAgICd0aHVtYnRhY2snOiAnZmEtdGh1bWJ0YWNrJywgJ2Jvb2ttYXJrJzogJ2ZhLWJvb2ttYXJrJyxcbiAgICAgICdyb2NrZXQnOiAnZmEtcm9ja2V0JywgJ3BhcGVyLXBsYW5lJzogJ2ZhLXBhcGVyLXBsYW5lJyxcbiAgICAgICdmbGFzayc6ICdmYS1mbGFzaycsICdmbGFzay12aWFsJzogJ2ZhLWZsYXNrLXZpYWwnLFxuICAgICAgJ2NsaXBib2FyZC1saXN0JzogJ2ZhLWNsaXBib2FyZC1saXN0JywgJ2hhbW1lcic6ICdmYS1oYW1tZXInLFxuICAgICAgJ3RhZyc6ICdmYS10YWcnLCAndGFncyc6ICdmYS10YWdzJyxcbiAgICAgICdoYXNodGFnJzogJ2ZhLWhhc2h0YWcnLCAnYXQnOiAnZmEtYXQnLFxuICAgICAgJ2ZhY2Utc21pbGUnOiAnZmEtZmFjZS1zbWlsZScsICdib2xkJzogJ2ZhLWJvbGQnLCAnaXRhbGljJzogJ2ZhLWl0YWxpYycsXG4gICAgICAncmVmcmVzaCc6ICdmYS1hcnJvd3Mtcm90YXRlJywgJ2Rvd25sb2FkJzogJ2ZhLWRvd25sb2FkJywgJ3VwbG9hZCc6ICdmYS11cGxvYWQnLFxuICAgICAgJ2tleSc6ICdmYS1rZXknLCAnbG9jayc6ICdmYS1sb2NrJywgJ3NoaWVsZCc6ICdmYS1zaGllbGQnLFxuICAgICAgJ2N1YmUnOiAnZmEtY3ViZScsICdzaGFwZXMnOiAnZmEtc2hhcGVzJywgJ2JyaWVmY2FzZSc6ICdmYS1icmllZmNhc2UnLFxuICAgICAgJ2xheWVyLWdyb3VwJzogJ2ZhLWxheWVyLWdyb3VwJywgJ3BhbGV0dGUnOiAnZmEtcGFsZXR0ZScsXG4gICAgICAncGFuZWwtbGVmdCc6ICdmYS1hbmdsZXMtcmlnaHQnLCAncGFuZWwtbGVmdC1jbG9zZSc6ICdmYS1hbmdsZXMtbGVmdCcsXG4gICAgICAnY2lyY2xlJzogJ2ZhLWNpcmNsZScsICdjaGVjayc6ICdmYS1jaGVjaycsXG4gICAgICAnZ3JpcC12ZXJ0aWNhbCc6ICdmYS1ncmlwLXZlcnRpY2FsJywgJ2VsbGlwc2lzJzogJ2ZhLWVsbGlwc2lzJyxcbiAgICAgICdmaWx0ZXInOiAnZmEtZmlsdGVyJywgJ3NvcnQnOiAnZmEtc29ydCcsXG4gICAgICAnZXhwYW5kJzogJ2ZhLWV4cGFuZCcsICdjb21wcmVzcyc6ICdmYS1jb21wcmVzcycsXG4gICAgICAnc3Bpbm5lcic6ICdmYS1zcGlubmVyIGZhLXNwaW4nLCAnY2lyY2xlLXhtYXJrJzogJ2ZhLWNpcmNsZS14bWFyaycsXG4gICAgICAnZmluZ2VycHJpbnQnOiAnZmEtZmluZ2VycHJpbnQnLCAnZ3JpZC0yJzogJ2ZhLWdyaWQtMicsXG4gICAgICAnd2FuZC1tYWdpYyc6ICdmYS13YW5kLW1hZ2ljLXNwYXJrbGVzJywgJ3NsaWRlcnMnOiAnZmEtc2xpZGVycycsXG4gICAgICAnZm9udCc6ICdmYS1mb250JywgJ3NlYXJjaCc6ICdmYS1tYWduaWZ5aW5nLWdsYXNzJyxcbiAgICAgIC8vIEJyYW5kIGljb25zICh1c2UgZmFiIGNsYXNzKVxuICAgICAgJ3lvdXR1YmUnOiAnZmEteW91dHViZScsICdpbnN0YWdyYW0nOiAnZmEtaW5zdGFncmFtJywgJ2ZhY2Vib29rJzogJ2ZhLWZhY2Vib29rJyxcbiAgICAgICdsaW5rZWRpbic6ICdmYS1saW5rZWRpbicsICd0aWt0b2snOiAnZmEtdGlrdG9rJywgJ3R3aXR0ZXInOiAnZmEteC10d2l0dGVyJ1xuICAgIH07XG4gICAgdmFyIGJyYW5kSWNvbnMgPSB7IHlvdXR1YmU6IDEsIGluc3RhZ3JhbTogMSwgZmFjZWJvb2s6IDEsIGxpbmtlZGluOiAxLCB0aWt0b2s6IDEsIHR3aXR0ZXI6IDEgfTtcbiAgICB2YXIgZmFDbGFzcyA9IGljb25zW25hbWVdIHx8ICdmYS0nICsgbmFtZTtcbiAgICByZXR1cm4gJzxpIGNsYXNzPVwiJyArIChicmFuZEljb25zW25hbWVdID8gJ2ZhYicgOiAnZmFzJykgKyAnICcgKyBmYUNsYXNzICsgKGNsYXNzTmFtZSA/ICcgJyArIGNsYXNzTmFtZSA6ICcnKSArICcgc2NwLWljb25cIj48L2k+JztcbiAgfVxuXG4gIC8vIC0tLSBCYWRnZXMgLS0tXG4gIGZ1bmN0aW9uIGJhZGdlKHRleHQsIGJnLCBmZykgeyBmZyA9IGZnIHx8IGJnOyByZXR1cm4gJzxzcGFuIGNsYXNzPVwic2NwLWJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyBiZyArICcxNTtjb2xvcjonICsgZmcgKyAnXCI+JyArIGVzYyh0ZXh0KSArICc8L3NwYW4+JzsgfVxuICBmdW5jdGlvbiBzdGF0dXNCYWRnZShzdGF0dXMpIHsgdmFyIGMgPSBQT1NUX1NUQVRVU0VTW3N0YXR1c10gfHwgeyBsYWJlbDogc3RhdHVzLCBjb2xvcjogJyM4MDg2OGInIH07IHJldHVybiAnPHNwYW4gY2xhc3M9XCJzY3Atc3RhdHVzLWJhZGdlXCI+PHNwYW4gY2xhc3M9XCJzY3Atc3RhdHVzLWRvdFwiIHN0eWxlPVwiYmFja2dyb3VuZDonICsgYy5jb2xvciArICdcIj48L3NwYW4+JyArIGVzYyhjLmxhYmVsKSArICc8L3NwYW4+JzsgfVxuICBmdW5jdGlvbiB0eXBlQmFkZ2UodHlwZSkgeyB2YXIgYyA9IFBPU1RfVFlQRVNbdHlwZV0gfHwgeyBsYWJlbDogdHlwZSwgY29sb3I6ICcjODA4NjhiJywgaWNvbjogJ2NpcmNsZScgfTsgcmV0dXJuICc8c3BhbiBjbGFzcz1cInNjcC1iYWRnZVwiIHN0eWxlPVwiYmFja2dyb3VuZDonICsgYy5jb2xvciArICcxNTtjb2xvcjonICsgYy5jb2xvciArICdcIj4nICsgaWNvbihjLmljb24pICsgJyAnICsgZXNjKGMubGFiZWwpICsgJzwvc3Bhbj4nOyB9XG4gIGZ1bmN0aW9uIHByaW9yaXR5QmFkZ2UocCkgeyBpZiAoIXApIHJldHVybiAnJzsgdmFyIGMgPSBQUklPUklUWV9MRVZFTFNbcF0gfHwgeyBsYWJlbDogcCwgY29sb3I6ICcjODA4NjhiJywgaWNvbjogJ21pbnVzJyB9OyByZXR1cm4gJzxzcGFuIGNsYXNzPVwic2NwLWJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyBjLmNvbG9yICsgJzE1O2NvbG9yOicgKyBjLmNvbG9yICsgJ1wiPicgKyBpY29uKGMuaWNvbikgKyAnICcgKyBlc2MoYy5sYWJlbCkgKyAnPC9zcGFuPic7IH1cbiAgZnVuY3Rpb24gcGxhdGZvcm1CYWRnZShwbGF0Zm9ybSkgeyB2YXIgYyA9IFBMQVRGT1JNU1twbGF0Zm9ybV0gfHwgeyBsYWJlbDogcGxhdGZvcm0sIGNvbG9yOiAnIzgwODY4YicsIGljb246ICdnbG9iZScgfTsgcmV0dXJuICc8c3BhbiBjbGFzcz1cInNjcC1iYWRnZSBzY3AtYmFkZ2UtcGxhdGZvcm1cIiBzdHlsZT1cImJhY2tncm91bmQ6JyArIGMuY29sb3IgKyAnMTU7Y29sb3I6JyArIGMuY29sb3IgKyAnXCI+JyArIGljb24oYy5pY29uKSArICcgJyArIGVzYyhjLmxhYmVsKSArICc8L3NwYW4+JzsgfVxuICBmdW5jdGlvbiBtZWRpYVByb21wdFN0YXR1c0JhZGdlKHN0KSB7IHZhciBjID0gTUVESUFfUFJPTVBUX1NUQVRVU0VTW3N0XSB8fCB7IGxhYmVsOiBzdCwgY29sb3I6ICcjODA4NjhiJyB9OyByZXR1cm4gJzxzcGFuIGNsYXNzPVwic2NwLWJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyBjLmNvbG9yICsgJzE1O2NvbG9yOicgKyBjLmNvbG9yICsgJ1wiPicgKyBlc2MoYy5sYWJlbCkgKyAnPC9zcGFuPic7IH1cbiAgZnVuY3Rpb24gcHJvZ3Jlc3NCYXIocGN0LCBjb2xvcikgeyBjb2xvciA9IGNvbG9yIHx8ICd2YXIoLS1zY3AtcHJpbWFyeSknOyByZXR1cm4gJzxkaXYgY2xhc3M9XCJzY3AtcHJvZ3Jlc3MtYmFyXCI+PGRpdiBjbGFzcz1cInNjcC1wcm9ncmVzcy1maWxsXCIgc3R5bGU9XCJ3aWR0aDonICsgcGN0ICsgJyU7YmFja2dyb3VuZDonICsgY29sb3IgKyAnXCI+PC9kaXY+PC9kaXY+JzsgfVxuXG4gIC8vIC0tLSBBSSBUZXh0IEZvcm1hdHRpbmcgLS0tXG5cbiAgLyoqXG4gICAqIENsZWFucyByYXcgQUkgcmVzcG9uc2UgdGV4dCBiZWZvcmUgc3RvcmluZyBpbiBkYXRhLlxuICAgKiBIYW5kbGVzOiBlc2NhcGVkIG5ld2xpbmVzIGZyb20gSlNPTiwgY29kZSBmZW5jZXMsIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZSxcbiAgICogbWFya2Rvd24gYXJ0aWZhY3RzIHRoYXQgc2hvdWxkbid0IGJlIGluIHNvY2lhbCBwb3N0IGNvbnRlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBjbGVhbkFJVGV4dCh0ZXh0KSB7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gJyc7XG4gICAgdmFyIGNsZWFuZWQgPSB0ZXh0O1xuICAgIC8vIFJlbW92ZSBtYXJrZG93biBjb2RlIGZlbmNlcyB0aGF0IHNvbWUgbW9kZWxzIHdyYXAgcmVzcG9uc2VzIGluXG4gICAgY2xlYW5lZCA9IGNsZWFuZWQucmVwbGFjZSgvXmBgYCg/Ompzb258dGV4dHxtYXJrZG93bnxodG1sKT9cXHMqXFxuPy9pLCAnJykucmVwbGFjZSgvXFxuP2BgYFxccyokL2ksICcnKTtcbiAgICAvLyBGaXggZG91YmxlLWVzY2FwZWQgbmV3bGluZXM6IFxcXFxuIFx1MjE5MiBcXG4gKGNvbW1vbiB3aGVuIEpTT04taW4tSlNPTilcbiAgICBjbGVhbmVkID0gY2xlYW5lZC5yZXBsYWNlKC9cXFxcXFxcXG4vZywgJ1xcbicpO1xuICAgIC8vIEZpeCBsaXRlcmFsIFxcbiB0aGF0IHNob3VsZCBiZSByZWFsIG5ld2xpbmVzIChmcm9tIEpTT04gc3RyaW5nIHZhbHVlcylcbiAgICBjbGVhbmVkID0gY2xlYW5lZC5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJyk7XG4gICAgLy8gRml4IGxpdGVyYWwgXFx0IFx1MjE5MiByZWFsIHRhYnNcbiAgICBjbGVhbmVkID0gY2xlYW5lZC5yZXBsYWNlKC9cXFxcdC9nLCAnXFx0Jyk7XG4gICAgLy8gUmVtb3ZlIFwiSGVyZSdzIHRoZSBpbXByb3ZlZCB2ZXJzaW9uOlwiIHR5cGUgcHJlYW1ibGVzXG4gICAgY2xlYW5lZCA9IGNsZWFuZWQucmVwbGFjZSgvXig/OkhlcmUoPzonc3wgaXMpICg/OnRoZSB8eW91ciB8YW4/ICk/KD86aW1wcm92ZWR8dXBkYXRlZHxyZXZpc2VkfGFkYXB0ZWR8Z2VuZXJhdGVkfHdyaXR0ZW58bmV3KSAoPzp2ZXJzaW9ufHBvc3R8Y29udGVudHx0ZXh0fGNvcHkpWzpcXHNdKlxcbiopL2ksICcnKTtcbiAgICAvLyBUcmltXG4gICAgY2xlYW5lZCA9IGNsZWFuZWQudHJpbSgpO1xuICAgIHJldHVybiBjbGVhbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdHMgY29udGVudCB0ZXh0IGZvciBIVE1MIHByZXZpZXcgZGlzcGxheS5cbiAgICogQ29udmVydHMgbmV3bGluZXMgdG8gPGJyPiwgYmFzaWMgbWFya2Rvd24gYm9sZC9pdGFsaWMgdG8gSFRNTCxcbiAgICogaGlnaGxpZ2h0cyBoYXNodGFncyBhbmQgbWVudGlvbnMuIFJldHVybnMgc2FmZSBIVE1MLlxuICAgKi9cbiAgZnVuY3Rpb24gZm9ybWF0Q29udGVudEZvclByZXZpZXcodGV4dCkge1xuICAgIGlmICghdGV4dCkgcmV0dXJuICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LW11dGVkXCI+Tm8gY29udGVudCB5ZXQ8L3NwYW4+JztcbiAgICAvLyBGaXJzdCBlc2NhcGUgSFRNTCBlbnRpdGllc1xuICAgIHZhciBzYWZlID0gZXNjKHRleHQpO1xuICAgIC8vIENvbnZlcnQgZG91YmxlIG5ld2xpbmVzIHRvIHBhcmFncmFwaCBicmVha3NcbiAgICBzYWZlID0gc2FmZS5yZXBsYWNlKC9cXG5cXG4rL2csICc8L3A+PHA+Jyk7XG4gICAgLy8gQ29udmVydCBzaW5nbGUgbmV3bGluZXMgdG8gPGJyPlxuICAgIHNhZmUgPSBzYWZlLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpO1xuICAgIC8vIEhpZ2hsaWdodCBoYXNodGFnc1xuICAgIHNhZmUgPSBzYWZlLnJlcGxhY2UoLygjW2EtekEtWl1bXFx3XSopL2csICc8c3BhbiBjbGFzcz1cInNjcC1wcmV2aWV3LWhhc2h0YWdcIj4kMTwvc3Bhbj4nKTtcbiAgICAvLyBIaWdobGlnaHQgQG1lbnRpb25zXG4gICAgc2FmZSA9IHNhZmUucmVwbGFjZSgvKEBbYS16QS1aXVtcXHcuLV0qKS9nLCAnPHNwYW4gY2xhc3M9XCJzY3AtcHJldmlldy1tZW50aW9uXCI+JDE8L3NwYW4+Jyk7XG4gICAgLy8gQmFzaWMgbWFya2Rvd246ICoqYm9sZCoqIFx1MjE5MiA8c3Ryb25nPlxuICAgIHNhZmUgPSBzYWZlLnJlcGxhY2UoL1xcKlxcKiguKz8pXFwqXFwqL2csICc8c3Ryb25nPiQxPC9zdHJvbmc+Jyk7XG4gICAgLy8gQmFzaWMgbWFya2Rvd246ICppdGFsaWMqIFx1MjE5MiA8ZW0+XG4gICAgc2FmZSA9IHNhZmUucmVwbGFjZSgvXFwqKC4rPylcXCovZywgJzxlbT4kMTwvZW0+Jyk7XG4gICAgLy8gV3JhcCBpbiBwYXJhZ3JhcGhcbiAgICBzYWZlID0gJzxwPicgKyBzYWZlICsgJzwvcD4nO1xuICAgIHJldHVybiBzYWZlO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhIHN0cnVjdHVyZWQgaW1hZ2UgcHJvbXB0IGludG8gdmlzdWFsIHNlY3Rpb25zIGZvciBkaXNwbGF5LlxuICAgKiBSZXR1cm5zIGFycmF5IG9mIHsgbGFiZWwsIGxpbmVzW10gfSBvYmplY3RzLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VQcm9tcHRTZWN0aW9ucyhwcm9tcHRUZXh0KSB7XG4gICAgaWYgKCFwcm9tcHRUZXh0KSByZXR1cm4gW107XG4gICAgdmFyIHNlY3Rpb25zID0gW107XG4gICAgdmFyIGN1cnJlbnRTZWN0aW9uID0geyBsYWJlbDogJ1Byb21wdCcsIGxpbmVzOiBbXSB9O1xuICAgIHZhciBsaW5lcyA9IHByb21wdFRleHQuc3BsaXQoJ1xcbicpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lID0gbGluZXNbaV0udHJpbSgpO1xuICAgICAgaWYgKCFsaW5lKSBjb250aW51ZTtcbiAgICAgIC8vIERldGVjdCBzZWN0aW9uIGhlYWRlcnMgKEFMTCBDQVBTIGZvbGxvd2VkIGJ5IGNvbG9uLCBvciBsaW5lcyBlbmRpbmcgd2l0aCBjb2xvbiB0aGF0IGFyZSBzaG9ydClcbiAgICAgIGlmICgvXltBLVpdW0EtWlxccyZcXC9dKzovLnRlc3QobGluZSkgfHwgKGxpbmUuZW5kc1dpdGgoJzonKSAmJiBsaW5lLmxlbmd0aCA8IDQwICYmIC9eW0EtWl0vLnRlc3QobGluZSkpKSB7XG4gICAgICAgIGlmIChjdXJyZW50U2VjdGlvbi5saW5lcy5sZW5ndGggPiAwKSBzZWN0aW9ucy5wdXNoKGN1cnJlbnRTZWN0aW9uKTtcbiAgICAgICAgY3VycmVudFNlY3Rpb24gPSB7IGxhYmVsOiBsaW5lLnJlcGxhY2UoLzokLywgJycpLnRyaW0oKSwgbGluZXM6IFtdIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50U2VjdGlvbi5saW5lcy5wdXNoKGxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3VycmVudFNlY3Rpb24ubGluZXMubGVuZ3RoID4gMCkgc2VjdGlvbnMucHVzaChjdXJyZW50U2VjdGlvbik7XG4gICAgcmV0dXJuIHNlY3Rpb25zO1xuICB9XG5cbiAgLy8gLS0tIElEcyAtLS1cbiAgZnVuY3Rpb24gZ2VuZXJhdGVJZChwcmVmaXgpIHsgcmV0dXJuIHByZWZpeCArICdfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA4KTsgfVxuXG4gIC8vIC0tLSBDb2xsZWN0aW9uIGdldHRlcnMgLS0tXG4gIGZ1bmN0aW9uIGdldEFsbFRvcGljcygpIHsgcmV0dXJuIChTLmRhdGEudG9waWNzIHx8IFtdKS5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTsgfSk7IH1cbiAgZnVuY3Rpb24gZ2V0VG9waWNQb3N0cyh0b3BpY0lkKSB7IHJldHVybiAoUy5kYXRhLnBvc3RzIHx8IFtdKS5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gKHAudG9waWNzIHx8IFtdKS5pbmRleE9mKHRvcGljSWQpID4gLTE7IH0pOyB9XG4gIGZ1bmN0aW9uIGdldEFsbFNlcmllcygpIHsgcmV0dXJuIChTLmRhdGEuc2VyaWVzIHx8IFtdKS5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gKGEubmFtZSB8fCAnJykubG9jYWxlQ29tcGFyZShiLm5hbWUgfHwgJycpOyB9KTsgfVxuICBmdW5jdGlvbiBnZXRTZXJpZXNQb3N0cyhzZXJpZXNJZCkgeyByZXR1cm4gKFMuZGF0YS5wb3N0cyB8fCBbXSkuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuc2VyaWVzSWQgPT09IHNlcmllc0lkOyB9KTsgfVxuICBmdW5jdGlvbiBnZXRVcGNvbWluZ1Bvc3RzKG4pIHtcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgcmV0dXJuIChTLmRhdGEucG9zdHMgfHwgW10pLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiBwLnNjaGVkdWxlICYmIHAuc2NoZWR1bGUuZGF0ZSAmJiBwLnNjaGVkdWxlLmRhdGUgPj0gbm93ICYmIHAuc3RhdHVzICE9PSAncHVibGlzaGVkJyAmJiBwLnN0YXR1cyAhPT0gJ2FyY2hpdmVkJzsgfSlcbiAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIChhLnNjaGVkdWxlLmRhdGUgKyAoYS5zY2hlZHVsZS50aW1lIHx8ICcnKSkgPCAoYi5zY2hlZHVsZS5kYXRlICsgKGIuc2NoZWR1bGUudGltZSB8fCAnJykpID8gLTEgOiAxOyB9KS5zbGljZSgwLCBuIHx8IDUpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFJlY2VudGx5UHVibGlzaGVkKG4pIHtcbiAgICByZXR1cm4gKFMuZGF0YS5wb3N0cyB8fCBbXSkuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuc3RhdHVzID09PSAncHVibGlzaGVkJzsgfSlcbiAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgdmFyIGFEYXRlID0gKGEuc2NoZWR1bGUgJiYgYS5zY2hlZHVsZS5kYXRlKSB8fCBhLnVwZGF0ZWQgfHwgJyc7XG4gICAgICAgIHZhciBiRGF0ZSA9IChiLnNjaGVkdWxlICYmIGIuc2NoZWR1bGUuZGF0ZSkgfHwgYi51cGRhdGVkIHx8ICcnO1xuICAgICAgICByZXR1cm4gYkRhdGUubG9jYWxlQ29tcGFyZShhRGF0ZSk7IC8vIERlc2NlbmRpbmcgXHUyMDE0IG5ld2VzdCBmaXJzdFxuICAgICAgfSkuc2xpY2UoMCwgbiB8fCA1KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRSZWNlbnRBY3Rpdml0eShuKSB7IHJldHVybiAoUy5hY3Rpdml0eSB8fCBbXSkuc2xpY2UoLShuIHx8IDE1KSkucmV2ZXJzZSgpOyB9XG4gIGZ1bmN0aW9uIHJlc29sdmVUb25lKGlkKSB7IHJldHVybiBTLnRvbmVNYXBbaWRdIHx8IG51bGw7IH1cbiAgZnVuY3Rpb24gcmVzb2x2ZUF1ZGllbmNlKGlkKSB7IHJldHVybiBTLmF1ZGllbmNlTWFwW2lkXSB8fCBudWxsOyB9XG4gIGZ1bmN0aW9uIHJlc29sdmVJbWFnZVN0eWxlKGlkKSB7IHJldHVybiBTLmltYWdlU3R5bGVNYXBbaWRdIHx8IG51bGw7IH1cbiAgZnVuY3Rpb24gZ2V0UGxhdGZvcm1Db25maWcoa2V5KSB7IHJldHVybiAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5wbGF0Zm9ybXMgJiYgUy5tZXRhLnNldHRpbmdzLnBsYXRmb3Jtc1trZXldKSB8fCB7fTsgfVxuICBmdW5jdGlvbiByZXNvbHZlVG9waWMoaWQpIHsgcmV0dXJuIFMudG9waWNNYXBbaWRdIHx8IG51bGw7IH1cbiAgZnVuY3Rpb24gcmVzb2x2ZVNlcmllcyhpZCkgeyByZXR1cm4gUy5zZXJpZXNNYXBbaWRdIHx8IG51bGw7IH1cblxuICAvLyAtLS0gTWlzYyAtLS1cbiAgZnVuY3Rpb24gZGVib3VuY2UoZm4sIGRlbGF5KSB7IHZhciB0OyByZXR1cm4gZnVuY3Rpb24oKSB7IHZhciBjID0gdGhpcywgYSA9IGFyZ3VtZW50czsgY2xlYXJUaW1lb3V0KHQpOyB0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHsgZm4uYXBwbHkoYywgYSk7IH0sIGRlbGF5KTsgfTsgfVxuICBmdW5jdGlvbiBkZWVwQ2xvbmUob2JqKSB7IHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpOyB9XG4gIGZ1bmN0aW9uIGlzRW1wdHkob2JqKSB7IHJldHVybiAhb2JqIHx8ICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMCk7IH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA3OiBBUFAgU0hFTExcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gcmVuZGVyQXBwKCkge1xuICAgIHZhciB0b29sYmFySCA9IDA7XG4gICAgdmFyICR0b29sYmFyQmFyID0gJCgnI3Rvb2xiYXItYmFyJyk7XG4gICAgaWYgKCR0b29sYmFyQmFyLmxlbmd0aCkge1xuICAgICAgdG9vbGJhckggPSAkdG9vbGJhckJhci5vdXRlckhlaWdodCgpIHx8IDA7XG4gICAgICB2YXIgJHRyYXkgPSAkKCcjdG9vbGJhci10cmF5LWhvcml6b250YWwnKTtcbiAgICAgIGlmICgkdHJheS5sZW5ndGggJiYgJHRyYXkuaXMoJzp2aXNpYmxlJykpIHRvb2xiYXJIICs9ICR0cmF5Lm91dGVySGVpZ2h0KCkgfHwgMDtcbiAgICB9XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLXNjcC1kcnVwYWwtdG9vbGJhcicsIHRvb2xiYXJIICsgJ3B4Jyk7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdzY3AtYWN0aXZlJyk7XG4gICAgUy4kZm9ybS5jbG9zZXN0KCcubGF5b3V0LXJlZ2lvbi1ub2RlLW1haW4sIC5ub2RlLWZvcm0nKS5oaWRlKCk7XG4gICAgdmFyICRhcHAgPSAkKCc8ZGl2IGlkPVwic2NwQXBwXCIgY2xhc3M9XCJzY3AtYXBwXCI+PC9kaXY+Jyk7XG4gICAgUy4kZm9ybS5jbG9zZXN0KCcubGF5b3V0LXJlZ2lvbi1ub2RlLW1haW4sIC5ub2RlLWZvcm0nKS5iZWZvcmUoJGFwcCk7XG4gICAgJGFwcC5odG1sKHJlbmRlckFwcFNoZWxsKCkpO1xuICAgIHJlbmRlckN1cnJlbnRWaWV3KCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJBcHBTaGVsbCgpIHtcbiAgICByZXR1cm4gcmVuZGVySGVhZGVyKCkgKyAnPGRpdiBjbGFzcz1cInNjcC1ib2R5XCI+JyArIHJlbmRlclNpZGViYXIoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cInNjcC1tYWluXCI+PGRpdiBjbGFzcz1cInNjcC1jb250ZW50XCIgaWQ9XCJzY3BDb250ZW50XCI+PC9kaXY+PC9kaXY+PC9kaXY+JyArXG4gICAgICAnPGRpdiBpZD1cInNjcFRvYXN0c1wiIGNsYXNzPVwic2NwLXRvYXN0LWNvbnRhaW5lclwiPjwvZGl2Pic7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJIZWFkZXIoKSB7XG4gICAgdmFyIHdzID0gKFMubWV0YSAmJiBTLm1ldGEud29ya3NwYWNlKSB8fCB7fTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLWhlYWRlclwiPjxkaXYgY2xhc3M9XCJzY3AtaGVhZGVyLWxlZnRcIj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuLWljb24gc2NwLXNpZGViYXItdG9nZ2xlXCIgaWQ9XCJzY3BTaWRlYmFyVG9nZ2xlXCI+JyArIGljb24oJ21lbnUnKSArICc8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaGVhZGVyLWxvZ29cIj5TQ1A8L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaGVhZGVyLWluZm9cIj48c3BhbiBjbGFzcz1cInNjcC1oZWFkZXItbmFtZVwiPicgKyBlc2Mod3MubmFtZSB8fCAnU29jaWFsIENvbnRlbnQgUGxhbm5lcicpICsgJzwvc3Bhbj48L2Rpdj4nO1xuICAgIC8vIEJyYW5kIGlkZW50aXR5IHBpbGxcbiAgICBpZiAoUy5icmFuZCAmJiBTLmJyYW5kLmNvbmZpZ3VyZWQgJiYgUy5icmFuZC5pZGVudGl0eS5uYW1lKSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWhlYWRlci1icmFuZFwiPic7XG4gICAgICBpZiAoUy5icmFuZC5pZGVudGl0eS5sb2dvVXJsKSBodG1sICs9ICc8aW1nIGNsYXNzPVwic2NwLWhlYWRlci1icmFuZC1sb2dvXCIgc3JjPVwiJyArIGVzYyhTLmJyYW5kLmlkZW50aXR5LmxvZ29VcmwpICsgJ1wiIGFsdD1cIlwiPic7XG4gICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1oZWFkZXItYnJhbmQtbmFtZVwiPicgKyBlc2MoUy5icmFuZC5jb3JlICYmIFMuYnJhbmQuY29yZS5icmFuZF9uYW1lID8gUy5icmFuZC5jb3JlLmJyYW5kX25hbWUgOiBTLmJyYW5kLmlkZW50aXR5Lm5hbWUpICsgJzwvc3Bhbj48L2Rpdj4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8L2Rpdj48ZGl2IGNsYXNzPVwic2NwLWhlYWRlci1yaWdodFwiPic7XG4gICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3Atc2F2ZS1zdGF0dXNcIiBpZD1cInNjcFNhdmVTdGF0dXNcIj48L3NwYW4+JztcbiAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haS1zdGF0dXMtaW5kaWNhdG9yXCIgaWQ9XCJzY3BBSVN0YXR1c1wiIHRpdGxlPVwiQUkgc3RhdHVzIFx1MjAxNCBsb2FkaW5nLi4uXCI+PHNwYW4gY2xhc3M9XCJzY3AtYWktc3RhdHVzLWRvdCBzY3AtYWktc3RhdHVzLWxvYWRpbmdcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY3AtYWktc3RhdHVzLWxhYmVsXCI+QUk8L3NwYW4+PC9zcGFuPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1xdWljay1zd2l0Y2hcIiBpZD1cInNjcEFJUXVpY2tTd2l0Y2hcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5IHNjcC1idG4tc21cIiBpZD1cInNjcFNhdmVOb2RlQnRuXCI+JyArIGljb24oJ2NoZWNrJykgKyAnIFNhdmU8L2J1dHRvbj4nO1xuICAgIGlmIChTLnVzZXIuZnVsbE5hbWUpIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWhlYWRlci11c2VyXCI+JyArIGljb24oJ3VzZXInKSArICcgJyArIGVzYyhTLnVzZXIuZnVsbE5hbWUpICsgJzwvc3Bhbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTaWRlYmFyKCkge1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3Atc2lkZWJhclwiIGlkPVwic2NwU2lkZWJhclwiPjxkaXYgY2xhc3M9XCJzY3Atc2lkZWJhci1vdmVybGF5XCI+PC9kaXY+PGRpdiBjbGFzcz1cInNjcC1zaWRlYmFyLWlubmVyXCI+PG5hdiBjbGFzcz1cInNjcC1uYXZcIj4nO1xuICAgIGZvciAodmFyIGtleSBpbiBBUFBfVklFV1MpIHtcbiAgICAgIHZhciB2ID0gQVBQX1ZJRVdTW2tleV07XG4gICAgICB2YXIgYWN0aXZlID0gUy5jdXJyZW50VmlldyA9PT0ga2V5ID8gJyBzY3AtbmF2LWl0ZW0tYWN0aXZlJyA6ICcnO1xuICAgICAgdmFyIGJhZGdlSHRtbCA9ICcnO1xuICAgICAgaWYgKGtleSA9PT0gJ3Bvc3RzJykgYmFkZ2VIdG1sID0gUy5hY3RpdmVQb3N0cyA+IDAgPyAnPHNwYW4gY2xhc3M9XCJzY3AtbmF2LWJhZGdlXCI+JyArIFMuYWN0aXZlUG9zdHMgKyAnPC9zcGFuPicgOiAnJztcbiAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ3Jlc2VhcmNoJykge1xuICAgICAgICB2YXIgc2VzQ291bnQgPSAoUy5kYXRhLnJlc2VhcmNoICYmIFMuZGF0YS5yZXNlYXJjaC5zZXNzaW9ucykgPyBTLmRhdGEucmVzZWFyY2guc2Vzc2lvbnMubGVuZ3RoIDogMDtcbiAgICAgICAgYmFkZ2VIdG1sID0gc2VzQ291bnQgPiAwID8gJzxzcGFuIGNsYXNzPVwic2NwLW5hdi1iYWRnZVwiPicgKyBzZXNDb3VudCArICc8L3NwYW4+JyA6ICcnO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoa2V5ID09PSAndG9waWNzJykgYmFkZ2VIdG1sID0gKFMuZGF0YS50b3BpY3MgfHwgW10pLmxlbmd0aCA+IDAgPyAnPHNwYW4gY2xhc3M9XCJzY3AtbmF2LWJhZGdlXCI+JyArIChTLmRhdGEudG9waWNzIHx8IFtdKS5sZW5ndGggKyAnPC9zcGFuPicgOiAnJztcbiAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ3NlcmllcycpIGJhZGdlSHRtbCA9IChTLmRhdGEuc2VyaWVzIHx8IFtdKS5sZW5ndGggPiAwID8gJzxzcGFuIGNsYXNzPVwic2NwLW5hdi1iYWRnZVwiPicgKyAoUy5kYXRhLnNlcmllcyB8fCBbXSkubGVuZ3RoICsgJzwvc3Bhbj4nIDogJyc7XG4gICAgICBlbHNlIGlmIChrZXkgPT09ICdpbWFnZXMnKSBiYWRnZUh0bWwgPSBTLmltYWdlcy5sZW5ndGggPiAwID8gJzxzcGFuIGNsYXNzPVwic2NwLW5hdi1iYWRnZVwiPicgKyBTLmltYWdlcy5sZW5ndGggKyAnPC9zcGFuPicgOiAnJztcbiAgICAgIGh0bWwgKz0gJzxhIGhyZWY9XCIjJyArIGtleSArICdcIiBjbGFzcz1cInNjcC1uYXYtaXRlbScgKyBhY3RpdmUgKyAnXCIgZGF0YS12aWV3PVwiJyArIGtleSArICdcIj4nO1xuICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtbmF2LWljb25cIj4nICsgaWNvbih2Lmljb24pICsgJzwvc3Bhbj4nO1xuICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtbmF2LWxhYmVsXCI+JyArIGVzYyh2LmxhYmVsKSArICc8L3NwYW4+JztcbiAgICAgIGh0bWwgKz0gYmFkZ2VIdG1sICsgJzwvYT4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8L25hdj48L2Rpdj48L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyQ3VycmVudFZpZXcoKSB7XG4gICAgdmFyIFIgPSB3aW5kb3cuX3NjcFJlbmRlcmVycztcbiAgICB2YXIgaHRtbCA9ICcnO1xuICAgIHN3aXRjaCAoUy5jdXJyZW50Vmlldykge1xuICAgICAgY2FzZSAnZGFzaGJvYXJkJzogaHRtbCA9IHJlbmRlckRhc2hib2FyZFZpZXcoKTsgYnJlYWs7XG4gICAgICBjYXNlICdyZXNlYXJjaCc6ICBodG1sID0gKFIucmVzZWFyY2hWaWV3KSA/IFIucmVzZWFyY2hWaWV3KCkgOiByZW5kZXJSZXNlYXJjaFBsYWNlaG9sZGVyKCk7IGJyZWFrO1xuICAgICAgY2FzZSAncG9zdHMnOiAgICAgaHRtbCA9IHJlbmRlclBvc3RzVmlldygpOyBicmVhaztcbiAgICAgIGNhc2UgJ2NhbGVuZGFyJzogIGh0bWwgPSByZW5kZXJDYWxlbmRhclZpZXcoKTsgYnJlYWs7XG4gICAgICBjYXNlICdpbWFnZXMnOiAgICBodG1sID0gKFIuaW1hZ2VzVmlldykgPyBSLmltYWdlc1ZpZXcoKSA6IHJlbmRlckltYWdlc1BsYWNlaG9sZGVyKCk7IGJyZWFrO1xuICAgICAgY2FzZSAndG9waWNzJzogICAgaHRtbCA9IHJlbmRlclRvcGljc1ZpZXcoKTsgYnJlYWs7XG4gICAgICBjYXNlICdzZXJpZXMnOiAgICBodG1sID0gcmVuZGVyU2VyaWVzUGxhY2Vob2xkZXIoKTsgYnJlYWs7XG4gICAgICBjYXNlICdhY3Rpdml0eSc6ICBodG1sID0gcmVuZGVyQWN0aXZpdHlWaWV3KCk7IGJyZWFrO1xuICAgICAgY2FzZSAnc2V0dGluZ3MnOiAgaHRtbCA9IChSLnNldHRpbmdzVmlldykgPyBSLnNldHRpbmdzVmlldygpIDogcmVuZGVyU2V0dGluZ3NQbGFjZWhvbGRlcigpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IGh0bWwgPSByZW5kZXJEYXNoYm9hcmRWaWV3KCk7XG4gICAgfVxuICAgICQoJyNzY3BDb250ZW50JykuaHRtbChodG1sKTtcbiAgICBzZXR1cFZpZXdFdmVudEhhbmRsZXJzKCk7XG4gICAgLy8gVHJpZ2dlciBQYXJ0IDJBLzJCIHZpZXctc3BlY2lmaWMgZXZlbnQgc2V0dXBcbiAgICBpZiAoUi5zZXR1cFJlc2VhcmNoRXZlbnRzICYmIFMuY3VycmVudFZpZXcgPT09ICdyZXNlYXJjaCcpIFIuc2V0dXBSZXNlYXJjaEV2ZW50cygpO1xuICAgIGlmIChSLnNldHVwSW1hZ2VzRXZlbnRzICYmIFMuY3VycmVudFZpZXcgPT09ICdpbWFnZXMnKSBSLnNldHVwSW1hZ2VzRXZlbnRzKCk7XG4gICAgaWYgKFIuc2V0dXBTZXR0aW5nc0V2ZW50cyAmJiBTLmN1cnJlbnRWaWV3ID09PSAnc2V0dGluZ3MnKSBSLnNldHVwU2V0dGluZ3NFdmVudHMoKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OUyA4LTEyOiBWSUVXIFJFTkRFUkVSUyBcdTIwMTQgZXh0cmFjdGVkICh2MC4yLjApXG4gIC8vICAgOCAgIERhc2hib2FyZCAgLT4gc3JjL2NvcmUvdmlld3MvZGFzaGJvYXJkLmpzXG4gIC8vICAgOSAgIFBvc3RzICAgICAgLT4gc3JjL2NvcmUvdmlld3MvcG9zdHMuanNcbiAgLy8gICAxMCAgQ2FsZW5kYXIgICAtPiBzcmMvY29yZS92aWV3cy9jYWxlbmRhci5qc1xuICAvLyAgIDExICBUb3BpY3MgICAgIC0+IHNyYy9jb3JlL3ZpZXdzL3RvcGljcy5qc1xuICAvLyAgIDEyICBBY3Rpdml0eSAgIC0+IHNyYy9jb3JlL3ZpZXdzL2FjdGl2aXR5LmpzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgcmVuZGVyRGFzaGJvYXJkVmlldyAgID0gd2luZG93Ll9zY3BSZW5kZXJEYXNoYm9hcmRWaWV3O1xuICB2YXIgcmVuZGVyUG9zdHNWaWV3ICAgICAgID0gd2luZG93Ll9zY3BSZW5kZXJQb3N0c1ZpZXc7XG4gIHZhciByZW5kZXJDYWxlbmRhclZpZXcgICAgPSB3aW5kb3cuX3NjcFJlbmRlckNhbGVuZGFyVmlldztcbiAgdmFyIHJlbmRlclRvcGljc1ZpZXcgICAgICA9IHdpbmRvdy5fc2NwUmVuZGVyVG9waWNzVmlldztcbiAgdmFyIHJlbmRlckFjdGl2aXR5VmlldyAgICA9IHdpbmRvdy5fc2NwUmVuZGVyQWN0aXZpdHlWaWV3O1xuICB2YXIgcmVuZGVyU3RhdENhcmQgICAgICAgID0gd2luZG93Ll9zY3BSZW5kZXJTdGF0Q2FyZDtcbiAgdmFyIHJlbmRlckFjdGl2aXR5SXRlbSAgICA9IHdpbmRvdy5fc2NwUmVuZGVyQWN0aXZpdHlJdGVtO1xuICB2YXIgcmVuZGVyUG9zdExpc3RJdGVtICAgID0gd2luZG93Ll9zY3BSZW5kZXJQb3N0TGlzdEl0ZW07XG4gIHZhciByZW5kZXJDYWxlbmRhclBvcG92ZXIgPSB3aW5kb3cuX3NjcFJlbmRlckNhbGVuZGFyUG9wb3ZlcjtcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTM6IFBMQUNFSE9MREVSIFZJRVdTXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHJlbmRlclJlc2VhcmNoUGxhY2Vob2xkZXIoKSB7XG4gICAgaWYgKFMuX3BhcnQyYlRpbWVvdXQpIHtcbiAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInNjcC12aWV3XCI+PGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlclwiPjxoMT4nICsgaWNvbignZmxhc2snKSArICcgUmVzZWFyY2g8L2gxPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZVwiPjxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtaWNvblwiIHN0eWxlPVwiY29sb3I6dmFyKC0tc2NwLXdhcm5pbmcpXCI+JyArIGljb24oJ3dhcm5pbmcnKSArICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGl0bGVcIj5SZXNlYXJjaCBNb2R1bGUgTm90IExvYWRlZDwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS10ZXh0XCI+VGhlIEFJIFJlc2VhcmNoIG1vZHVsZSAoUGFydCAyQiBKUykgZGlkblxcJ3QgbG9hZC4gQ2hlY2sgdGhhdCB0aGUgQXNzZXQgSW5qZWN0b3IgaGFzIGFsbCAzIEpTIGZpbGVzIGVuYWJsZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXI6IFBhcnQgMSBcdTIxOTIgUGFydCAyQSBcdTIxOTIgUGFydCAyQi48L2Rpdj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tb3V0bGluZVwiIG9uY2xpY2s9XCJsb2NhdGlvbi5yZWxvYWQoKVwiPicgKyBpY29uKCdyZWZyZXNoJykgKyAnIFJlbG9hZCBQYWdlPC9idXR0b24+PC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2NwLXZpZXdcIj48ZGl2IGNsYXNzPVwic2NwLXZpZXctaGVhZGVyXCI+PGgxPicgKyBpY29uKCdmbGFzaycpICsgJyBSZXNlYXJjaDwvaDE+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZVwiPjxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtaWNvblwiPicgKyBpY29uKCdzcGlubmVyJykgKyAnPC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS10aXRsZVwiPkFJLVBvd2VyZWQgSWRlYXRpb248L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5Mb2FkaW5nIHJlc2VhcmNoIHdvcmtzcGFjZS4uLjwvZGl2PjwvZGl2PjwvZGl2Pic7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTZXR0aW5nc1BsYWNlaG9sZGVyKCkge1xuICAgIGlmIChTLl9wYXJ0MmJUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzY3Atdmlld1wiPjxkaXYgY2xhc3M9XCJzY3Atdmlldy1oZWFkZXJcIj48aDE+JyArIGljb24oJ2dlYXInKSArICcgU2V0dGluZ3M8L2gxPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZVwiPjxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtaWNvblwiIHN0eWxlPVwiY29sb3I6dmFyKC0tc2NwLXdhcm5pbmcpXCI+JyArIGljb24oJ3dhcm5pbmcnKSArICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGl0bGVcIj5TZXR0aW5ncyBNb2R1bGUgTm90IExvYWRlZDwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS10ZXh0XCI+VGhlIFNldHRpbmdzIG1vZHVsZSAoUGFydCAyQiBKUykgZGlkblxcJ3QgbG9hZC4gQ2hlY2sgQXNzZXQgSW5qZWN0b3IgY29uZmlndXJhdGlvbi48L2Rpdj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tb3V0bGluZVwiIG9uY2xpY2s9XCJsb2NhdGlvbi5yZWxvYWQoKVwiPicgKyBpY29uKCdyZWZyZXNoJykgKyAnIFJlbG9hZCBQYWdlPC9idXR0b24+PC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2NwLXZpZXdcIj48ZGl2IGNsYXNzPVwic2NwLXZpZXctaGVhZGVyXCI+PGgxPicgKyBpY29uKCdnZWFyJykgKyAnIFNldHRpbmdzPC9oMT48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlXCI+PGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS1pY29uXCI+JyArIGljb24oJ3NwaW5uZXInKSArICc8L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRpdGxlXCI+U2V0dGluZ3M8L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5Mb2FkaW5nIHdvcmtzcGFjZSBjb25maWd1cmF0aW9uLi4uPC9kaXY+PC9kaXY+PC9kaXY+JztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckltYWdlc1BsYWNlaG9sZGVyKCkge1xuICAgIGlmIChTLl9wYXJ0MmJUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzY3Atdmlld1wiPjxkaXYgY2xhc3M9XCJzY3Atdmlldy1oZWFkZXJcIj48aDE+JyArIGljb24oJ2ltYWdlcycpICsgJyBSZWZlcmVuY2UgSW1hZ2VzPC9oMT48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGVcIj48ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLWljb25cIiBzdHlsZT1cImNvbG9yOnZhcigtLXNjcC13YXJuaW5nKVwiPicgKyBpY29uKCd3YXJuaW5nJykgKyAnPC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRpdGxlXCI+SW1hZ2VzIE1vZHVsZSBOb3QgTG9hZGVkPC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5UaGUgSW1hZ2VzIG1vZHVsZSAoUGFydCAyQiBKUykgZGlkblxcJ3QgbG9hZC4gQ2hlY2sgQXNzZXQgSW5qZWN0b3IgY29uZmlndXJhdGlvbi48L2Rpdj4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tb3V0bGluZVwiIG9uY2xpY2s9XCJsb2NhdGlvbi5yZWxvYWQoKVwiPicgKyBpY29uKCdyZWZyZXNoJykgKyAnIFJlbG9hZCBQYWdlPC9idXR0b24+PC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2NwLXZpZXdcIj48ZGl2IGNsYXNzPVwic2NwLXZpZXctaGVhZGVyXCI+PGgxPicgKyBpY29uKCdpbWFnZXMnKSArICcgUmVmZXJlbmNlIEltYWdlczwvaDE+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZVwiPjxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtaWNvblwiPicgKyBpY29uKCdzcGlubmVyJykgKyAnPC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS10aXRsZVwiPlJlZmVyZW5jZSBJbWFnZXM8L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5Mb2FkaW5nIGJyYW5kIGltYWdlIGxpYnJhcnkuLi48L2Rpdj48L2Rpdj48L2Rpdj4nO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyU2VyaWVzUGxhY2Vob2xkZXIoKSB7XG4gICAgdmFyIGNvdW50ID0gKFMuZGF0YS5zZXJpZXMgfHwgW10pLmxlbmd0aDtcbiAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzY3Atdmlld1wiPjxkaXYgY2xhc3M9XCJzY3Atdmlldy1oZWFkZXJcIj48aDE+JyArIGljb24oJ2xheWVyLWdyb3VwJykgKyAnIFNlcmllczwvaDE+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJzY3Atdmlldy1zdWJ0aXRsZVwiPicgKyBjb3VudCArICcgc2VyaWVzPC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGVcIj48ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLWljb25cIj4nICsgaWNvbignbGF5ZXItZ3JvdXAnKSArICc8L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRpdGxlXCI+U2VyaWVzIHZpZXcgY29taW5nIHNvb248L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5Hcm91cCByZWxhdGVkIHBvc3RzIGludG8gbXVsdGktcGFydCBjb250ZW50IGFyY3MuIEdlbmVyYXRlZCBmcm9tIHRoZSBzZXR1cCB3aXphcmQgb3IgY3JlYXRlZCBtYW51YWxseS48L2Rpdj48L2Rpdj48L2Rpdj4nO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTQ6IFBPU1QgRklMVEVSSU5HICYgU09SVElOR1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBnZXRGaWx0ZXJlZFBvc3RzKCkge1xuICAgIHZhciBmID0gUy5wb3N0RmlsdGVyO1xuICAgIHZhciBwb3N0cyA9IChTLmRhdGEucG9zdHMgfHwgW10pLnNsaWNlKCk7XG5cbiAgICAvLyBTZWFyY2ggXHUyMDE0IG1hdGNoZXMgdGl0bGUsIGNvbnRlbnQgYm9keSwgdG9waWNzLCBob29rLCBhbmQgcGxhdGZvcm0gY29udGVudFxuICAgIGlmIChmLnNlYXJjaCkge1xuICAgICAgdmFyIHEgPSBmLnNlYXJjaC50b0xvd2VyQ2FzZSgpO1xuICAgICAgcG9zdHMgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkge1xuICAgICAgICAvLyBUaXRsZVxuICAgICAgICBpZiAoKHAudGl0bGUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxKSA+IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gQ29udGVudCBib2R5XG4gICAgICAgIGlmIChwLmNvbnRlbnQgJiYgKHAuY29udGVudC5ib2R5IHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocSkgPiAtMSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIFNlbGVjdGVkIGhvb2tcbiAgICAgICAgaWYgKHAucmVzZWFyY2ggJiYgKHAucmVzZWFyY2guc2VsZWN0ZWRfaG9vayB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHEpID4gLTEpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBUb3BpYyBuYW1lc1xuICAgICAgICBpZiAocC50b3BpY3MgJiYgcC50b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGZvciAodmFyIHRpID0gMDsgdGkgPCBwLnRvcGljcy5sZW5ndGg7IHRpKyspIHtcbiAgICAgICAgICAgIHZhciB0b3BpYyA9IFMudG9waWNNYXBbcC50b3BpY3NbdGldXTtcbiAgICAgICAgICAgIGlmICh0b3BpYyAmJiB0b3BpYy5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxKSA+IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFN0YXR1cyBmaWx0ZXJcbiAgICBpZiAoZi5zdGF0dXNlcyAmJiBmLnN0YXR1c2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIGYuc3RhdHVzZXMuaW5kZXhPZihwLnN0YXR1cykgPiAtMTsgfSk7XG4gICAgfVxuICAgIC8vIFR5cGUgZmlsdGVyXG4gICAgaWYgKGYudHlwZSkgcG9zdHMgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC50eXBlID09PSBmLnR5cGU7IH0pO1xuICAgIC8vIFBsYXRmb3JtIGZpbHRlclxuICAgIGlmIChmLnBsYXRmb3JtKSBwb3N0cyA9IHBvc3RzLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiAocC5wbGF0Zm9ybXMgfHwgW10pLmluZGV4T2YoZi5wbGF0Zm9ybSkgPiAtMTsgfSk7XG4gICAgLy8gVG9waWMgZmlsdGVyXG4gICAgaWYgKGYudG9waWMpIHBvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIChwLnRvcGljcyB8fCBbXSkuaW5kZXhPZihmLnRvcGljKSA+IC0xOyB9KTtcbiAgICAvLyBTZXJpZXMgZmlsdGVyXG4gICAgaWYgKGYuc2VyaWVzKSBwb3N0cyA9IHBvc3RzLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiBwLnNlcmllc0lkID09PSBmLnNlcmllczsgfSk7XG4gICAgLy8gUHJpb3JpdHkgZmlsdGVyXG4gICAgaWYgKGYucHJpb3JpdHkpIHBvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucHJpb3JpdHkgPT09IGYucHJpb3JpdHk7IH0pO1xuXG4gICAgLy8gU29ydFxuICAgIHZhciBzb3J0QnkgPSBmLnNvcnRCeSB8fCAndXBkYXRlZCc7XG4gICAgdmFyIGRpciA9IGYuc29ydERpciA9PT0gJ2FzYycgPyAxIDogLTE7XG4gICAgcG9zdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICB2YXIgYXYsIGJ2O1xuICAgICAgc3dpdGNoIChzb3J0QnkpIHtcbiAgICAgICAgY2FzZSAndGl0bGUnOiBhdiA9IChhLnRpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpOyBidiA9IChiLnRpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpOyByZXR1cm4gYXYgPCBidiA/IC1kaXIgOiBhdiA+IGJ2ID8gZGlyIDogMDtcbiAgICAgICAgY2FzZSAnY3JlYXRlZCc6IGF2ID0gYS5jcmVhdGVkIHx8ICcnOyBidiA9IGIuY3JlYXRlZCB8fCAnJzsgcmV0dXJuIGF2IDwgYnYgPyBkaXIgOiBhdiA+IGJ2ID8gLWRpciA6IDA7XG4gICAgICAgIGNhc2UgJ3ByaW9yaXR5JzpcbiAgICAgICAgICB2YXIgcG8gPSB7IHVyZ2VudDogMCwgaGlnaDogMSwgbWVkaXVtOiAyLCBsb3c6IDMgfTtcbiAgICAgICAgICBhdiA9IHBvW2EucHJpb3JpdHldICE9PSB1bmRlZmluZWQgPyBwb1thLnByaW9yaXR5XSA6IDk7XG4gICAgICAgICAgYnYgPSBwb1tiLnByaW9yaXR5XSAhPT0gdW5kZWZpbmVkID8gcG9bYi5wcmlvcml0eV0gOiA5O1xuICAgICAgICAgIHJldHVybiAoYXYgLSBidikgKiBkaXI7XG4gICAgICAgIGRlZmF1bHQ6IGF2ID0gYS51cGRhdGVkIHx8IGEuY3JlYXRlZCB8fCAnJzsgYnYgPSBiLnVwZGF0ZWQgfHwgYi5jcmVhdGVkIHx8ICcnOyByZXR1cm4gYXYgPCBidiA/IGRpciA6IGF2ID4gYnYgPyAtZGlyIDogMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcG9zdHM7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRHcm91cGVkUG9zdHMoZ3JvdXBCeSkge1xuICAgIHZhciBwb3N0cyA9IGdldEZpbHRlcmVkUG9zdHMoKTtcbiAgICB2YXIgZ3JvdXBzID0gW107XG5cbiAgICBzd2l0Y2ggKGdyb3VwQnkpIHtcbiAgICAgIGNhc2UgJ3dvcmtmbG93JzpcbiAgICAgICAgZm9yICh2YXIgZ2sgaW4gV09SS0ZMT1dfR1JPVVBTKSB7XG4gICAgICAgICAgdmFyIHdnID0gV09SS0ZMT1dfR1JPVVBTW2drXTtcbiAgICAgICAgICB2YXIgZ1Bvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHdnLnN0YXR1c2VzLmluZGV4T2YocC5zdGF0dXMpID4gLTE7IH0pO1xuICAgICAgICAgIGdyb3Vwcy5wdXNoKHsga2V5OiBnaywgbGFiZWw6IHdnLmxhYmVsLCBpY29uOiB3Zy5pY29uLCBjb2xvcjogd2cuY29sb3IsIHBvc3RzOiBnUG9zdHMgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0YXR1cyc6XG4gICAgICAgIGZvciAodmFyIHNpID0gMDsgc2kgPCBTVEFUVVNfT1JERVIubGVuZ3RoOyBzaSsrKSB7XG4gICAgICAgICAgdmFyIHNrID0gU1RBVFVTX09SREVSW3NpXTsgdmFyIHN0ID0gUE9TVF9TVEFUVVNFU1tza107XG4gICAgICAgICAgdmFyIHNQb3N0cyA9IHBvc3RzLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiBwLnN0YXR1cyA9PT0gc2s7IH0pO1xuICAgICAgICAgIGlmIChzUG9zdHMubGVuZ3RoKSBncm91cHMucHVzaCh7IGtleTogc2ssIGxhYmVsOiBzdC5sYWJlbCwgaWNvbjogc3QuaWNvbiwgY29sb3I6IHN0LmNvbG9yLCBwb3N0czogc1Bvc3RzIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd0eXBlJzpcbiAgICAgICAgZm9yICh2YXIgdGsgaW4gUE9TVF9UWVBFUykge1xuICAgICAgICAgIHZhciBwdCA9IFBPU1RfVFlQRVNbdGtdO1xuICAgICAgICAgIHZhciB0UG9zdHMgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC50eXBlID09PSB0azsgfSk7XG4gICAgICAgICAgaWYgKHRQb3N0cy5sZW5ndGgpIGdyb3Vwcy5wdXNoKHsga2V5OiB0aywgbGFiZWw6IHB0LmxhYmVsLCBpY29uOiBwdC5pY29uLCBjb2xvcjogcHQuY29sb3IsIHBvc3RzOiB0UG9zdHMgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3BsYXRmb3JtJzpcbiAgICAgICAgZm9yICh2YXIgcGsgaW4gUExBVEZPUk1TKSB7XG4gICAgICAgICAgdmFyIHBsID0gUExBVEZPUk1TW3BrXTtcbiAgICAgICAgICB2YXIgcFBvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIChwLnBsYXRmb3JtcyB8fCBbXSkuaW5kZXhPZihwaykgPiAtMTsgfSk7XG4gICAgICAgICAgaWYgKHBQb3N0cy5sZW5ndGgpIGdyb3Vwcy5wdXNoKHsga2V5OiBwaywgbGFiZWw6IHBsLmxhYmVsLCBpY29uOiBwbC5pY29uLCBjb2xvcjogcGwuY29sb3IsIHBvc3RzOiBwUG9zdHMgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3RvcGljJzpcbiAgICAgICAgdmFyIHRvcGljcyA9IGdldEFsbFRvcGljcygpO1xuICAgICAgICBmb3IgKHZhciB0Z2kgPSAwOyB0Z2kgPCB0b3BpY3MubGVuZ3RoOyB0Z2krKykge1xuICAgICAgICAgIHZhciB0b3BpYyA9IHRvcGljc1t0Z2ldO1xuICAgICAgICAgIHZhciB0b3BpY1Bvc3RzID0gcG9zdHMuZmlsdGVyKGZ1bmN0aW9uKHApIHsgcmV0dXJuIChwLnRvcGljcyB8fCBbXSkuaW5kZXhPZih0b3BpYy5pZCkgPiAtMTsgfSk7XG4gICAgICAgICAgaWYgKHRvcGljUG9zdHMubGVuZ3RoKSBncm91cHMucHVzaCh7IGtleTogdG9waWMuaWQsIGxhYmVsOiB0b3BpYy5uYW1lLCBpY29uOiAndGFnJywgY29sb3I6IHRvcGljLmNvbG9yLCBwb3N0czogdG9waWNQb3N0cyB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdW50YWdnZWQgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gIXAudG9waWNzIHx8IHAudG9waWNzLmxlbmd0aCA9PT0gMDsgfSk7XG4gICAgICAgIGlmICh1bnRhZ2dlZC5sZW5ndGgpIGdyb3Vwcy5wdXNoKHsga2V5OiAnX3VudGFnZ2VkJywgbGFiZWw6ICdObyBUb3BpYycsIGljb246ICd0YWcnLCBjb2xvcjogJyM5YWEwYTYnLCBwb3N0czogdW50YWdnZWQgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzZXJpZXMnOlxuICAgICAgICB2YXIgc2VyaWVzTGlzdCA9IGdldEFsbFNlcmllcygpO1xuICAgICAgICBmb3IgKHZhciBzZ2kgPSAwOyBzZ2kgPCBzZXJpZXNMaXN0Lmxlbmd0aDsgc2dpKyspIHtcbiAgICAgICAgICB2YXIgc2VyID0gc2VyaWVzTGlzdFtzZ2ldO1xuICAgICAgICAgIHZhciBzUG9zdHMgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5zZXJpZXNJZCA9PT0gc2VyLmlkOyB9KTtcbiAgICAgICAgICBpZiAoc1Bvc3RzLmxlbmd0aCkgZ3JvdXBzLnB1c2goeyBrZXk6IHNlci5pZCwgbGFiZWw6IHNlci5uYW1lLCBpY29uOiAnbGF5ZXItZ3JvdXAnLCBjb2xvcjogc2VyLmNvbG9yIHx8ICcjMWE3M2U4JywgcG9zdHM6IHNQb3N0cyB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdW5hc3NpZ25lZCA9IHBvc3RzLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiAhcC5zZXJpZXNJZDsgfSk7XG4gICAgICAgIGlmICh1bmFzc2lnbmVkLmxlbmd0aCkgZ3JvdXBzLnB1c2goeyBrZXk6ICdfbm9fc2VyaWVzJywgbGFiZWw6ICdObyBTZXJpZXMnLCBpY29uOiAnbGF5ZXItZ3JvdXAnLCBjb2xvcjogJyM5YWEwYTYnLCBwb3N0czogdW5hc3NpZ25lZCB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3ByaW9yaXR5JzpcbiAgICAgICAgdmFyIHByaU9yZGVyID0gWyd1cmdlbnQnLCAnaGlnaCcsICdtZWRpdW0nLCAnbG93J107XG4gICAgICAgIGZvciAodmFyIHByaSA9IDA7IHByaSA8IHByaU9yZGVyLmxlbmd0aDsgcHJpKyspIHtcbiAgICAgICAgICB2YXIgcHJrID0gcHJpT3JkZXJbcHJpXTsgdmFyIHByQ2ZnID0gUFJJT1JJVFlfTEVWRUxTW3Bya107XG4gICAgICAgICAgdmFyIHByUG9zdHMgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5wcmlvcml0eSA9PT0gcHJrOyB9KTtcbiAgICAgICAgICBpZiAocHJQb3N0cy5sZW5ndGgpIGdyb3Vwcy5wdXNoKHsga2V5OiBwcmssIGxhYmVsOiBwckNmZy5sYWJlbCwgaWNvbjogcHJDZmcuaWNvbiwgY29sb3I6IHByQ2ZnLmNvbG9yLCBwb3N0czogcHJQb3N0cyB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9QcmkgPSBwb3N0cy5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gIXAucHJpb3JpdHk7IH0pO1xuICAgICAgICBpZiAobm9QcmkubGVuZ3RoKSBncm91cHMucHVzaCh7IGtleTogJ19ub25lJywgbGFiZWw6ICdObyBQcmlvcml0eScsIGljb246ICdtaW51cycsIGNvbG9yOiAnIzlhYTBhNicsIHBvc3RzOiBub1ByaSB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGdyb3Vwcy5wdXNoKHsga2V5OiAnYWxsJywgbGFiZWw6ICdBbGwgUG9zdHMnLCBpY29uOiAndGh1bWJ0YWNrJywgY29sb3I6ICcjMWE3M2U4JywgcG9zdHM6IHBvc3RzIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvdXBzO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTU6IEVWRU5UIEhBTkRMRVJTXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHNldHVwRXZlbnRIYW5kbGVycygpIHtcbiAgICAvLyBOYXZpZ2F0aW9uXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtbmF2JywgJy5zY3AtbmF2LWl0ZW0nKS5vbignY2xpY2suc2NwLW5hdicsICcuc2NwLW5hdi1pdGVtJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHZhciB2ID0gJCh0aGlzKS5kYXRhKCd2aWV3Jyk7IGlmICh2KSBuYXZpZ2F0ZSh2KTsgfSk7XG4gICAgLy8gU2lkZWJhciB0b2dnbGVcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1zaWRlYmFyJywgJyNzY3BTaWRlYmFyVG9nZ2xlJykub24oJ2NsaWNrLnNjcC1zaWRlYmFyJywgJyNzY3BTaWRlYmFyVG9nZ2xlJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IDk5MikgeyAkKCcjc2NwU2lkZWJhcicpLnRvZ2dsZUNsYXNzKCdzY3Atc2lkZWJhci1vcGVuJyk7IH1cbiAgICAgIGVsc2UgeyBTLnNpZGViYXJIaWRkZW4gPSAhUy5zaWRlYmFySGlkZGVuOyAkKCcjc2NwQXBwJykudG9nZ2xlQ2xhc3MoJ3NjcC1hcHAtLXNpZGViYXItaGlkZGVuJywgUy5zaWRlYmFySGlkZGVuKTsgfVxuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLW92ZXJsYXknLCAnLnNjcC1zaWRlYmFyLW92ZXJsYXknKS5vbignY2xpY2suc2NwLW92ZXJsYXknLCAnLnNjcC1zaWRlYmFyLW92ZXJsYXknLCBmdW5jdGlvbigpIHsgJCgnI3NjcFNpZGViYXInKS5yZW1vdmVDbGFzcygnc2NwLXNpZGViYXItb3BlbicpOyB9KTtcbiAgICAvLyBTYXZlIHRvIERydXBhbFxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLXNhdmUnLCAnI3NjcFNhdmVOb2RlQnRuJykub24oJ2NsaWNrLnNjcC1zYXZlJywgJyNzY3BTYXZlTm9kZUJ0bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHN5bmNUb1RleHRhcmVhKCk7XG4gICAgICB1cGRhdGVTYXZlU3RhdHVzKCdzYXZpbmcnKTtcbiAgICAgIGlmIChTLiRzdWJtaXRCdG4gJiYgUy4kc3VibWl0QnRuLmxlbmd0aCkge1xuICAgICAgICBTLmRpcnR5ID0gZmFsc2U7IC8vIENsZWFyIGRpcnR5IGZsYWcgYmVmb3JlIERydXBhbCBzdWJtaXRzIChwYWdlIHdpbGwgcmVsb2FkKVxuICAgICAgICBTLiRzdWJtaXRCdG4uY2xpY2soKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZVNhdmVTdGF0dXMoJ3NhdmVkJyk7XG4gICAgICAgIHRvYXN0KCdEYXRhIHN5bmNlZCB0byBmaWVsZHMuIFVzZSB0aGUgRHJ1cGFsIFNhdmUgYnV0dG9uIHRvIHBlcnNpc3QuJywgJ2luZm8nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBUb2FzdCBjbG9zZVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLXRvYXN0JywgJ1tkYXRhLWFjdGlvbj1cImNsb3NlLXRvYXN0XCJdJykub24oJ2NsaWNrLnNjcC10b2FzdCcsICdbZGF0YS1hY3Rpb249XCJjbG9zZS10b2FzdFwiXScsIGZ1bmN0aW9uKCkgeyAkKHRoaXMpLmNsb3Nlc3QoJy5zY3AtdG9hc3QnKS5yZW1vdmUoKTsgfSk7XG4gICAgLy8gSGFzaCBjaGFuZ2VcbiAgICAkKHdpbmRvdykub2ZmKCdoYXNoY2hhbmdlLnNjcCcpLm9uKCdoYXNoY2hhbmdlLnNjcCcsIGZ1bmN0aW9uKCkgeyB2YXIgaCA9IHJlYWRIYXNoKCk7IGlmIChoICE9PSBTLmN1cnJlbnRWaWV3KSBuYXZpZ2F0ZShoLCB7IG5vSGFzaDogdHJ1ZSB9KTsgfSk7XG4gICAgLy8gR28gdmlld1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLWdvdmlldycsICdbZGF0YS1hY3Rpb249XCJnby12aWV3XCJdJykub24oJ2NsaWNrLnNjcC1nb3ZpZXcnLCAnW2RhdGEtYWN0aW9uPVwiZ28tdmlld1wiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBuYXZpZ2F0ZSgkKHRoaXMpLmRhdGEoJ3ZpZXcnKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLWdvc2V0JywgJ1tkYXRhLWFjdGlvbj1cImdvLXNldHRpbmdzXCJdJykub24oJ2NsaWNrLnNjcC1nb3NldCcsICdbZGF0YS1hY3Rpb249XCJnby1zZXR0aW5nc1wiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBTLnNldHRpbmdzVGFiID0gJCh0aGlzKS5kYXRhKCd0YWInKSB8fCAnd29ya3NwYWNlJzsgbmF2aWdhdGUoJ3NldHRpbmdzJyk7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0dXBWaWV3RXZlbnRIYW5kbGVycygpIHtcbiAgICAvLyAtLS0gUG9zdCBzZWFyY2ggLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdpbnB1dC5zY3AtcHMnLCAnI3NjcFBvc3RTZWFyY2gnKS5vbignaW5wdXQuc2NwLXBzJywgJyNzY3BQb3N0U2VhcmNoJywgZGVib3VuY2UoZnVuY3Rpb24oKSB7IFMucG9zdEZpbHRlci5zZWFyY2ggPSAkKHRoaXMpLnZhbCgpOyByZW5kZXJDdXJyZW50VmlldygpOyB9LCAzMDApKTtcblxuICAgIC8vIC0tLSBHcm91cGluZyAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1ncnAnLCAnW2RhdGEtYWN0aW9uPVwiY2hhbmdlLWdyb3VwXCJdJykub24oJ2NsaWNrLnNjcC1ncnAnLCAnW2RhdGEtYWN0aW9uPVwiY2hhbmdlLWdyb3VwXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMucG9zdEdyb3VwQnkgPSAkKHRoaXMpLmRhdGEoJ2dyb3VwJyk7IFMuY29sbGFwc2VkR3JvdXBzID0ge307IHJlbmRlckN1cnJlbnRWaWV3KCk7IH0pO1xuXG4gICAgLy8gLS0tIEdyb3VwIGNvbGxhcHNlIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLXRnJywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1ncm91cFwiXScpLm9uKCdjbGljay5zY3AtdGcnLCAnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLWdyb3VwXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBnayA9ICQodGhpcykuZGF0YSgnZ3JvdXAnKTsgUy5jb2xsYXBzZWRHcm91cHNbZ2tdID0gIVMuY29sbGFwc2VkR3JvdXBzW2drXTsgcmVuZGVyQ3VycmVudFZpZXcoKTsgfSk7XG5cbiAgICAvLyAtLS0gU2VsZWN0IHBvc3QgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3Atc3AnLCAnW2RhdGEtYWN0aW9uPVwic2VsZWN0LXBvc3RcIl0nKS5vbignY2xpY2suc2NwLXNwJywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC1wb3N0XCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMuc2VsZWN0ZWRQb3N0SWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7IFMuY3VycmVudFN0ZXAgPSAnYmFzaWNzJzsgaWYgKFMuY3VycmVudFZpZXcgIT09ICdwb3N0cycpIG5hdmlnYXRlKCdwb3N0cycpOyBlbHNlIHJlbmRlckN1cnJlbnRWaWV3KCk7IH0pO1xuXG4gICAgLy8gLS0tIFBpcGVsaW5lIHN0ZXBzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLWdzJywgJ1tkYXRhLWFjdGlvbj1cImdvLXN0ZXBcIl0nKS5vbignY2xpY2suc2NwLWdzJywgJ1tkYXRhLWFjdGlvbj1cImdvLXN0ZXBcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgUy5jdXJyZW50U3RlcCA9ICQodGhpcykuZGF0YSgnc3RlcCcpOyByZW5kZXJDdXJyZW50VmlldygpOyB9KTtcblxuICAgIC8vIC0tLSBOZXcgcG9zdCAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1ucCcsICdbZGF0YS1hY3Rpb249XCJuZXctcG9zdFwiXScpLm9uKCdjbGljay5zY3AtbnAnLCAnW2RhdGEtYWN0aW9uPVwibmV3LXBvc3RcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgY3JlYXRlTmV3UG9zdCgpOyB9KTtcblxuICAgIC8vIC0tLSBEZWxldGUgcG9zdCAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1kcCcsICdbZGF0YS1hY3Rpb249XCJkZWxldGUtcG9zdFwiXScpLm9uKCdjbGljay5zY3AtZHAnLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLXBvc3RcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICAgIGlmIChpZCAmJiB3aW5kb3cuX3NjcFBhcnQyQSAmJiB3aW5kb3cuX3NjcFBhcnQyQS5kZWxldGVQb3N0KSB7IHdpbmRvdy5fc2NwUGFydDJBLmRlbGV0ZVBvc3QoaWQpOyB9XG4gICAgICBlbHNlIGlmIChpZCAmJiBjb25maXJtKCdEZWxldGUgdGhpcyBwb3N0PycpKSB7XG4gICAgICAgIFMuZGF0YS5wb3N0cyA9IChTLmRhdGEucG9zdHMgfHwgW10pLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiBwLmlkICE9PSBpZDsgfSk7XG4gICAgICAgIGlmIChTLnNlbGVjdGVkUG9zdElkID09PSBpZCkgUy5zZWxlY3RlZFBvc3RJZCA9IG51bGw7XG4gICAgICAgIGxvZ0FjdGl2aXR5KCdwb3N0X2RlbGV0ZWQnLCBpZCwgJycsICdQb3N0IGRlbGV0ZWQnKTtcbiAgICAgICAgYnVpbGRNYXBzKCk7IHJlbmRlckN1cnJlbnRWaWV3KCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdQb3N0IGRlbGV0ZWQnLCAnc3VjY2VzcycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gLS0tIFNvcnQgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwLXNiJywgJyNzY3BTb3J0QnknKS5vbignY2hhbmdlLnNjcC1zYicsICcjc2NwU29ydEJ5JywgZnVuY3Rpb24oKSB7IFMucG9zdEZpbHRlci5zb3J0QnkgPSAkKHRoaXMpLnZhbCgpOyByZW5kZXJDdXJyZW50VmlldygpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1zZCcsICdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtc29ydC1kaXJcIl0nKS5vbignY2xpY2suc2NwLXNkJywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1zb3J0LWRpclwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBTLnBvc3RGaWx0ZXIuc29ydERpciA9IFMucG9zdEZpbHRlci5zb3J0RGlyID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnOyByZW5kZXJDdXJyZW50VmlldygpOyB9KTtcblxuICAgIC8vIC0tLSBQaXBlbGluZSBjYXJkIGZpbHRlciAoZGFzaGJvYXJkKSAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1wZicsICdbZGF0YS1hY3Rpb249XCJmaWx0ZXItcGlwZWxpbmUtc3RhdHVzXCJdJykub24oJ2NsaWNrLnNjcC1wZicsICdbZGF0YS1hY3Rpb249XCJmaWx0ZXItcGlwZWxpbmUtc3RhdHVzXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMucG9zdEZpbHRlci5zdGF0dXNlcyA9IFskKHRoaXMpLmRhdGEoJ3N0YXR1cycpXTsgbmF2aWdhdGUoJ3Bvc3RzJyk7IH0pO1xuXG4gICAgLy8gLS0tIENhbGVuZGFyIC0tLVxuICAgIC8vIE5hdmlnYXRpb24gKG1vbnRoIG1vZGUpXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtY3AnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLXByZXZcIl0nKS5vbignY2xpY2suc2NwLWNwJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1wcmV2XCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKFMuY2FsZW5kYXJNb2RlID09PSAnd2VlaycpIHtcbiAgICAgICAgdmFyIHdzID0gZ2V0V2Vla1N0YXJ0KFMuY2FsZW5kYXJZZWFyLCBTLmNhbGVuZGFyTW9udGgpOyB3cy5zZXREYXRlKHdzLmdldERhdGUoKSAtIDcpO1xuICAgICAgICBTLmNhbGVuZGFyV2Vla1N0YXJ0ID0gd3M7IFMuY2FsZW5kYXJZZWFyID0gd3MuZ2V0RnVsbFllYXIoKTsgUy5jYWxlbmRhck1vbnRoID0gd3MuZ2V0TW9udGgoKTtcbiAgICAgIH0gZWxzZSB7IFMuY2FsZW5kYXJNb250aC0tOyBpZiAoUy5jYWxlbmRhck1vbnRoIDwgMCkgeyBTLmNhbGVuZGFyTW9udGggPSAxMTsgUy5jYWxlbmRhclllYXItLTsgfSB9XG4gICAgICByZW5kZXJDdXJyZW50VmlldygpO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLWNuJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1uZXh0XCJdJykub24oJ2NsaWNrLnNjcC1jbicsICdbZGF0YS1hY3Rpb249XCJjYWwtbmV4dFwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChTLmNhbGVuZGFyTW9kZSA9PT0gJ3dlZWsnKSB7XG4gICAgICAgIHZhciB3cyA9IGdldFdlZWtTdGFydChTLmNhbGVuZGFyWWVhciwgUy5jYWxlbmRhck1vbnRoKTsgd3Muc2V0RGF0ZSh3cy5nZXREYXRlKCkgKyA3KTtcbiAgICAgICAgUy5jYWxlbmRhcldlZWtTdGFydCA9IHdzOyBTLmNhbGVuZGFyWWVhciA9IHdzLmdldEZ1bGxZZWFyKCk7IFMuY2FsZW5kYXJNb250aCA9IHdzLmdldE1vbnRoKCk7XG4gICAgICB9IGVsc2UgeyBTLmNhbGVuZGFyTW9udGgrKzsgaWYgKFMuY2FsZW5kYXJNb250aCA+IDExKSB7IFMuY2FsZW5kYXJNb250aCA9IDA7IFMuY2FsZW5kYXJZZWFyKys7IH0gfVxuICAgICAgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1jdCcsICdbZGF0YS1hY3Rpb249XCJjYWwtdG9kYXlcIl0nKS5vbignY2xpY2suc2NwLWN0JywgJ1tkYXRhLWFjdGlvbj1cImNhbC10b2RheVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIG5vdyA9IG5ldyBEYXRlKCk7IFMuY2FsZW5kYXJZZWFyID0gbm93LmdldEZ1bGxZZWFyKCk7IFMuY2FsZW5kYXJNb250aCA9IG5vdy5nZXRNb250aCgpOyBTLmNhbGVuZGFyV2Vla1N0YXJ0ID0gbnVsbDsgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICB9KTtcbiAgICAvLyBNb2RlIHRvZ2dsZSAobW9udGgvd2VlaylcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1jbScsICdbZGF0YS1hY3Rpb249XCJjYWwtbW9kZVwiXScpLm9uKCdjbGljay5zY3AtY20nLCAnW2RhdGEtYWN0aW9uPVwiY2FsLW1vZGVcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IFMuY2FsZW5kYXJNb2RlID0gJCh0aGlzKS5kYXRhKCdtb2RlJyk7IFMuY2FsZW5kYXJXZWVrU3RhcnQgPSBudWxsOyByZW5kZXJDdXJyZW50VmlldygpO1xuICAgIH0pO1xuICAgIC8vIEZpbHRlcnNcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1jZnAnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLWZpbHRlci1wbGF0Zm9ybVwiXScpLm9uKCdjbGljay5zY3AtY2ZwJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1maWx0ZXItcGxhdGZvcm1cIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBwayA9ICQodGhpcykuZGF0YSgncGxhdGZvcm0nKTsgUy5jYWxlbmRhckZpbHRlcnMucGxhdGZvcm1zID0gUy5jYWxlbmRhckZpbHRlcnMucGxhdGZvcm1zIHx8IFtdO1xuICAgICAgdmFyIGlkeCA9IFMuY2FsZW5kYXJGaWx0ZXJzLnBsYXRmb3Jtcy5pbmRleE9mKHBrKTtcbiAgICAgIGlmIChpZHggPiAtMSkgUy5jYWxlbmRhckZpbHRlcnMucGxhdGZvcm1zLnNwbGljZShpZHgsIDEpOyBlbHNlIFMuY2FsZW5kYXJGaWx0ZXJzLnBsYXRmb3Jtcy5wdXNoKHBrKTtcbiAgICAgIHJlbmRlckN1cnJlbnRWaWV3KCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtY2Z0JywgJ1tkYXRhLWFjdGlvbj1cImNhbC1maWx0ZXItdHlwZVwiXScpLm9uKCdjbGljay5zY3AtY2Z0JywgJ1tkYXRhLWFjdGlvbj1cImNhbC1maWx0ZXItdHlwZVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIHRrID0gJCh0aGlzKS5kYXRhKCd0eXBlJyk7IFMuY2FsZW5kYXJGaWx0ZXJzLnR5cGVzID0gUy5jYWxlbmRhckZpbHRlcnMudHlwZXMgfHwgW107XG4gICAgICB2YXIgaWR4ID0gUy5jYWxlbmRhckZpbHRlcnMudHlwZXMuaW5kZXhPZih0ayk7XG4gICAgICBpZiAoaWR4ID4gLTEpIFMuY2FsZW5kYXJGaWx0ZXJzLnR5cGVzLnNwbGljZShpZHgsIDEpOyBlbHNlIFMuY2FsZW5kYXJGaWx0ZXJzLnR5cGVzLnB1c2godGspO1xuICAgICAgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NoYW5nZS5zY3AtY2ZzJywgJy5zY3AtY2FsLXN0YXR1cy1maWx0ZXInKS5vbignY2hhbmdlLnNjcC1jZnMnLCAnLnNjcC1jYWwtc3RhdHVzLWZpbHRlcicsIGZ1bmN0aW9uKCkgeyBTLmNhbGVuZGFyRmlsdGVycy5zdGF0dXMgPSAkKHRoaXMpLnZhbCgpOyByZW5kZXJDdXJyZW50VmlldygpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NoYW5nZS5zY3AtY2Z0ZycsICcuc2NwLWNhbC10b3BpYy1maWx0ZXInKS5vbignY2hhbmdlLnNjcC1jZnRnJywgJy5zY3AtY2FsLXRvcGljLWZpbHRlcicsIGZ1bmN0aW9uKCkgeyBTLmNhbGVuZGFyRmlsdGVycy50b3BpYyA9ICQodGhpcykudmFsKCk7IHJlbmRlckN1cnJlbnRWaWV3KCk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcC1jZnNyJywgJy5zY3AtY2FsLXNlcmllcy1maWx0ZXInKS5vbignY2hhbmdlLnNjcC1jZnNyJywgJy5zY3AtY2FsLXNlcmllcy1maWx0ZXInLCBmdW5jdGlvbigpIHsgUy5jYWxlbmRhckZpbHRlcnMuc2VyaWVzID0gJCh0aGlzKS52YWwoKTsgcmVuZGVyQ3VycmVudFZpZXcoKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtY2NmJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1jbGVhci1maWx0ZXJzXCJdJykub24oJ2NsaWNrLnNjcC1jY2YnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLWNsZWFyLWZpbHRlcnNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IFMuY2FsZW5kYXJGaWx0ZXJzID0geyBwbGF0Zm9ybXM6IFtdLCB0eXBlczogW10sIHN0YXR1czogJycsIHRvcGljOiAnJywgc2VyaWVzOiAnJyB9OyByZW5kZXJDdXJyZW50VmlldygpO1xuICAgIH0pO1xuICAgIC8vIERyYWctYW5kLWRyb3BcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2RyYWdzdGFydC5zY3AtY2RzJykub24oJ2RyYWdzdGFydC5zY3AtY2RzJywgJy5zY3AtY2FsLXBvc3RbZHJhZ2dhYmxlXSwgLnNjcC1jYWwtd2Vlay1jYXJkW2RyYWdnYWJsZV0nLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgcG9zdElkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L3BsYWluJywgcG9zdElkKTtcbiAgICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3NjcC1jYWwtZHJhZ2dpbmcnKTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2RyYWdlbmQuc2NwLWNkZScpLm9uKCdkcmFnZW5kLnNjcC1jZGUnLCAnLnNjcC1jYWwtcG9zdCwgLnNjcC1jYWwtd2Vlay1jYXJkJywgZnVuY3Rpb24oKSB7ICQodGhpcykucmVtb3ZlQ2xhc3MoJ3NjcC1jYWwtZHJhZ2dpbmcnKTsgJCgnLnNjcC1jYWwtZGF5LWRyb3AnKS5yZW1vdmVDbGFzcygnc2NwLWNhbC1kYXktZHJvcCcpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2Ryb3Auc2NwLWNkcicpLm9uKCdkcm9wLnNjcC1jZHInLCAnLnNjcC1jYWwtZGF5W2RhdGEtZGF0ZV0sIC5zY3AtY2FsLXdlZWstZGF5W2RhdGEtZGF0ZV0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBwb3N0SWQgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICAgIHZhciBuZXdEYXRlID0gJCh0aGlzKS5kYXRhKCdkYXRlJyk7XG4gICAgICBpZiAocG9zdElkICYmIG5ld0RhdGUpIHtcbiAgICAgICAgdmFyIHBvc3QgPSBTLnBvc3RNYXBbcG9zdElkXTtcbiAgICAgICAgaWYgKHBvc3QpIHtcbiAgICAgICAgICB2YXIgb2xkRGF0ZSA9IChwb3N0LnNjaGVkdWxlICYmIHBvc3Quc2NoZWR1bGUuZGF0ZSkgfHwgJyc7XG4gICAgICAgICAgaWYgKG9sZERhdGUgPT09IG5ld0RhdGUpIHJldHVybjsgLy8gTm8gY2hhbmdlXG4gICAgICAgICAgcG9zdC5zY2hlZHVsZSA9IHBvc3Quc2NoZWR1bGUgfHwge307XG4gICAgICAgICAgcG9zdC5zY2hlZHVsZS5kYXRlID0gbmV3RGF0ZTtcbiAgICAgICAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgbG9nQWN0aXZpdHkoJ3Bvc3RfcmVzY2hlZHVsZWQnLCBwb3N0LmlkLCBwb3N0LnRpdGxlLCAnTW92ZWQgZnJvbSAnICsgKG9sZERhdGUgfHwgJ3Vuc2NoZWR1bGVkJykgKyAnIHRvICcgKyBuZXdEYXRlKTtcbiAgICAgICAgICAvLyBzbmFwc2hvdCBmb3IgdW5kbyBzdXBwb3J0IFx1MjAxNCBjYWxsZWQgdmlhIFBhcnQgMkEgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgaWYgKHdpbmRvdy5fc2NwUGFydDJBICYmIHdpbmRvdy5fc2NwUGFydDJBLnNuYXBzaG90KSB3aW5kb3cuX3NjcFBhcnQyQS5zbmFwc2hvdCgnUmVzY2hlZHVsZSAnICsgdHJ1bmNhdGUocG9zdC50aXRsZSwgMjApKTtcbiAgICAgICAgICBidWlsZE1hcHMoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICAgICAgICB0b2FzdCgnTW92ZWQgXCInICsgdHJ1bmNhdGUocG9zdC50aXRsZSwgMzApICsgJ1wiIHRvICcgKyBuZXdEYXRlLCAnc3VjY2VzcycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gUG9wb3ZlclxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2VlbnRlci5zY3AtY3BoJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1wb3N0LWhvdmVyXCJdJykub24oJ21vdXNlZW50ZXIuc2NwLWNwaCcsICdbZGF0YS1hY3Rpb249XCJjYWwtcG9zdC1ob3ZlclwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBwb3N0SWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7IHZhciBwb3N0ID0gUy5wb3N0TWFwW3Bvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgdmFyICRwb3AgPSAkKCcjc2NwQ2FsUG9wb3ZlcicpO1xuICAgICAgJHBvcC5odG1sKHJlbmRlckNhbGVuZGFyUG9wb3Zlcihwb3N0KSk7XG4gICAgICB2YXIgcmVjdCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgcG9wVyA9IDMwMDsgdmFyIHBvcEggPSAyNDA7XG4gICAgICB2YXIgbGVmdCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyIC0gcG9wVyAvIDI7XG4gICAgICB2YXIgdG9wID0gcmVjdC5ib3R0b20gKyA4O1xuICAgICAgLy8gS2VlcCBpbiB2aWV3cG9ydFxuICAgICAgaWYgKGxlZnQgPCA4KSBsZWZ0ID0gODtcbiAgICAgIGlmIChsZWZ0ICsgcG9wVyA+IHdpbmRvdy5pbm5lcldpZHRoIC0gOCkgbGVmdCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gcG9wVyAtIDg7XG4gICAgICBpZiAodG9wICsgcG9wSCA+IHdpbmRvdy5pbm5lckhlaWdodCAtIDgpIHRvcCA9IHJlY3QudG9wIC0gcG9wSCAtIDg7XG4gICAgICAkcG9wLmNzcyh7IGxlZnQ6IGxlZnQgKyAncHgnLCB0b3A6IHRvcCArICdweCcsIHdpZHRoOiBwb3BXICsgJ3B4JywgZGlzcGxheTogJ2Jsb2NrJywgcG9zaXRpb246ICdmaXhlZCcgfSk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZWxlYXZlLnNjcC1jcGwnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLXBvc3QtaG92ZXJcIl0nKS5vbignbW91c2VsZWF2ZS5zY3AtY3BsJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1wb3N0LWhvdmVyXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgLy8gRGVsYXkgaGlkZSBzbyB1c2VyIGNhbiBtb3ZlIHRvIHBvcG92ZXJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGlmICghJCgnI3NjcENhbFBvcG92ZXI6aG92ZXInKS5sZW5ndGgpICQoJyNzY3BDYWxQb3BvdmVyJykuaGlkZSgpOyB9LCAyMDApO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2VsZWF2ZS5zY3AtY3BwbCcsICcjc2NwQ2FsUG9wb3ZlcicpLm9uKCdtb3VzZWxlYXZlLnNjcC1jcHBsJywgJyNzY3BDYWxQb3BvdmVyJywgZnVuY3Rpb24oKSB7ICQodGhpcykuaGlkZSgpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1jcGMnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLXBvcC1jbG9zZVwiXScpLm9uKCdjbGljay5zY3AtY3BjJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1wb3AtY2xvc2VcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgJCgnI3NjcENhbFBvcG92ZXInKS5oaWRlKCk7IH0pO1xuICAgIC8vIENsaWNrIGVtcHR5IGRheSBcdTIxOTIgbmV3IHBvc3Qgd2l0aCBkYXRlXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtY2RjJywgJ1tkYXRhLWFjdGlvbj1cImNhbC1kYXktY2xpY2tcIl0nKS5vbignY2xpY2suc2NwLWNkYycsICdbZGF0YS1hY3Rpb249XCJjYWwtZGF5LWNsaWNrXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgLy8gT25seSB0cmlnZ2VyIG9uIHRoZSBkYXkgY2VsbCBpdHNlbGYsIG5vdCBvbiBwb3N0IGNoaXBzIGluc2lkZSBpdFxuICAgICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy5zY3AtY2FsLXBvc3QsIC5zY3AtY2FsLW1vcmUsIC5zY3AtY2FsLXdlZWstY2FyZCwgLnNjcC1jYWwtYWRkLWJ0bicpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyB2YXIgZGF0ZSA9ICQodGhpcykuZGF0YSgnZGF0ZScpOyBpZiAoIWRhdGUpIHJldHVybjtcbiAgICAgIHZhciBwb3N0Q291bnQgPSAkKHRoaXMpLmZpbmQoJy5zY3AtY2FsLXBvc3QsIC5zY3AtY2FsLXdlZWstY2FyZCcpLmxlbmd0aDtcbiAgICAgIGlmIChwb3N0Q291bnQgPT09IDApIHtcbiAgICAgICAgdmFyIG5wID0gY3JlYXRlTmV3UG9zdCh7IHNjaGVkdWxlOiB7IGRhdGU6IGRhdGUsIHRpbWU6ICcnLCB0aW1lem9uZTogKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MudGltZXpvbmUpIHx8ICcnIH0gfSk7XG4gICAgICAgIGlmIChucCkgeyB0b2FzdCgnTmV3IHBvc3QgY3JlYXRlZCBmb3IgJyArIGRhdGUsICdzdWNjZXNzJyk7IHJlbmRlckN1cnJlbnRWaWV3KCk7IH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1jbnAnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLW5ldy1wb3N0XCJdJykub24oJ2NsaWNrLnNjcC1jbnAnLCAnW2RhdGEtYWN0aW9uPVwiY2FsLW5ldy1wb3N0XCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyB2YXIgZGF0ZSA9ICQodGhpcykuZGF0YSgnZGF0ZScpO1xuICAgICAgdmFyIG5wID0gY3JlYXRlTmV3UG9zdCh7IHNjaGVkdWxlOiB7IGRhdGU6IGRhdGUsIHRpbWU6ICcnLCB0aW1lem9uZTogKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MudGltZXpvbmUpIHx8ICcnIH0gfSk7XG4gICAgICBpZiAobnApIHsgdG9hc3QoJ05ldyBwb3N0IGNyZWF0ZWQgZm9yICcgKyBkYXRlLCAnc3VjY2VzcycpOyByZW5kZXJDdXJyZW50VmlldygpOyB9XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gVG9waWNzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLXN0JywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC10b3BpY1wiXScpLm9uKCdjbGljay5zY3Atc3QnLCAnW2RhdGEtYWN0aW9uPVwic2VsZWN0LXRvcGljXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMuc2VsZWN0ZWRUb3BpY0lkID0gJCh0aGlzKS5kYXRhKCdpZCcpOyByZW5kZXJDdXJyZW50VmlldygpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcC1zdG4nLCAnW2RhdGEtYWN0aW9uPVwic2VsZWN0LXRvcGljLW5hdlwiXScpLm9uKCdjbGljay5zY3Atc3RuJywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC10b3BpYy1uYXZcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgUy5zZWxlY3RlZFRvcGljSWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7IG5hdmlnYXRlKCd0b3BpY3MnKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtYnQnLCAnW2RhdGEtYWN0aW9uPVwiYmFjay10by10b3BpY3NcIl0nKS5vbignY2xpY2suc2NwLWJ0JywgJ1tkYXRhLWFjdGlvbj1cImJhY2stdG8tdG9waWNzXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMuc2VsZWN0ZWRUb3BpY0lkID0gbnVsbDsgcmVuZGVyQ3VycmVudFZpZXcoKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtbnQnLCAnW2RhdGEtYWN0aW9uPVwibmV3LXRvcGljXCJdJykub24oJ2NsaWNrLnNjcC1udCcsICdbZGF0YS1hY3Rpb249XCJuZXctdG9waWNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAod2luZG93Ll9zY3BQYXJ0MkEgJiYgd2luZG93Ll9zY3BQYXJ0MkEub3Blbk1vZGFsKSB7IC8qIFBhcnQgMkEgaGFuZGxlcyB0b3BpYyBjcmVhdGlvbiBtb2RhbCAqLyB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwcm9tcHQoJ1RvcGljIG5hbWU6Jyk7XG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUudHJpbSgpKSB7XG4gICAgICAgICAgdmFyIGNvbG9ycyA9IFsnIzFhNzNlOCcsICcjN2MzYWVkJywgJyMwZDkwNGYnLCAnI2UzNzQwMCcsICcjZDkzMDI1JywgJyMwODkxYjInXTtcbiAgICAgICAgICB2YXIgdG9waWMgPSB7IGlkOiBnZW5lcmF0ZUlkKCd0b3BpYycpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY29sb3I6IGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb2xvcnMubGVuZ3RoKV0sIGRlc2NyaXB0aW9uOiAnJywgc2VyaWVzSWQ6ICcnLCBjcmVhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfTtcbiAgICAgICAgICBTLmRhdGEudG9waWNzID0gUy5kYXRhLnRvcGljcyB8fCBbXTtcbiAgICAgICAgICBTLmRhdGEudG9waWNzLnB1c2godG9waWMpO1xuICAgICAgICAgIGxvZ0FjdGl2aXR5KCd0b3BpY19jcmVhdGVkJywgJycsICcnLCAnQ3JlYXRlZCB0b3BpYzogJyArIHRvcGljLm5hbWUpO1xuICAgICAgICAgIGJ1aWxkTWFwcygpOyByZW5kZXJDdXJyZW50VmlldygpOyBzeW5jVG9UZXh0YXJlYSgpOyB0b2FzdCgnVG9waWMgY3JlYXRlZCcsICdzdWNjZXNzJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIC0tLSBBY3Rpdml0eSBmaWx0ZXJzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignaW5wdXQuc2NwLWFzJywgJyNzY3BBY3Rpdml0eVNlYXJjaCcpLm9uKCdpbnB1dC5zY3AtYXMnLCAnI3NjcEFjdGl2aXR5U2VhcmNoJywgZGVib3VuY2UoZnVuY3Rpb24oKSB7IFMuYWN0aXZpdHlGaWx0ZXIuc2VhcmNoID0gJCh0aGlzKS52YWwoKTsgcmVuZGVyQ3VycmVudFZpZXcoKTsgfSwgMzAwKSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwLWF0JywgJyNzY3BBY3Rpdml0eVR5cGVGaWx0ZXInKS5vbignY2hhbmdlLnNjcC1hdCcsICcjc2NwQWN0aXZpdHlUeXBlRmlsdGVyJywgZnVuY3Rpb24oKSB7IFMuYWN0aXZpdHlGaWx0ZXIudHlwZSA9ICQodGhpcykudmFsKCk7IHJlbmRlckN1cnJlbnRWaWV3KCk7IH0pO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTY6IENSVUQgSEVMUEVSU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBjcmVhdGVOZXdQb3N0KG92ZXJyaWRlcykge1xuICAgIG92ZXJyaWRlcyA9IG92ZXJyaWRlcyB8fCB7fTtcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHZhciBkZWZzID0gKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MuZGVmYXVsdHMpIHx8IHt9O1xuICAgIHZhciBwb3N0ID0ge1xuICAgICAgaWQ6IGdlbmVyYXRlSWQoJ3Bvc3QnKSxcbiAgICAgIHRpdGxlOiBvdmVycmlkZXMudGl0bGUgfHwgJycsXG4gICAgICB0eXBlOiBvdmVycmlkZXMudHlwZSB8fCBkZWZzLnR5cGUgfHwgJ2ltYWdlJyxcbiAgICAgIHN0YXR1czogJ2lkZWEnLFxuICAgICAgcHJpb3JpdHk6IG92ZXJyaWRlcy5wcmlvcml0eSB8fCBkZWZzLnByaW9yaXR5IHx8ICdtZWRpdW0nLFxuICAgICAgdG9waWNzOiBvdmVycmlkZXMudG9waWNzIHx8IChkZWZzLnRvcGljcyB8fCBbXSkuc2xpY2UoKSxcbiAgICAgIHNlcmllc0lkOiBvdmVycmlkZXMuc2VyaWVzSWQgfHwgJycsXG4gICAgICBzb3VyY2U6IG92ZXJyaWRlcy5zb3VyY2UgfHwgeyB0eXBlOiAnbWFudWFsJywgcmVzZWFyY2hfc2Vzc2lvbl9pZDogJycsIHJlc2VhcmNoX2lkZWFfaWQ6ICcnLCBub3RlczogJycgfSxcbiAgICAgIHBsYXRmb3Jtczogb3ZlcnJpZGVzLnBsYXRmb3JtcyB8fCAoZGVmcy5wbGF0Zm9ybXMgfHwgWydsaW5rZWRpbiddKS5zbGljZSgpLFxuICAgICAgcmVzZWFyY2g6IHsgYW5nbGVzOiBbXSwgc2VsZWN0ZWRfYW5nbGU6ICcnLCBhbmdsZV9jdXN0b21faW5wdXQ6ICcnLCBob29rczogW10sIHNlbGVjdGVkX2hvb2s6ICcnLCBob29rX2N1c3RvbV9pbnB1dDogJycsIG5vdGVzOiAnJyB9LFxuICAgICAgY29udGVudDogeyBib2R5OiAnJywgdG9uZV9pZDogb3ZlcnJpZGVzLnRvbmVfaWQgfHwgZGVmcy50b25lX2lkIHx8ICcnLCBhdWRpZW5jZV9pZDogb3ZlcnJpZGVzLmF1ZGllbmNlX2lkIHx8IGRlZnMuYXVkaWVuY2VfaWQgfHwgJycsIG5vdGVzOiAnJyB9LFxuICAgICAgY2Fyb3VzZWw6IHsgc2xpZGVfY291bnQ6IDAsIHNsaWRlczogW10gfSxcbiAgICAgIHZpZGVvOiB7IGNvbmNlcHQ6ICcnLCBzY3JpcHQ6ICcnLCBkdXJhdGlvbl9zZWNvbmRzOiA2MCwgZm9ybWF0OiAncmVlbCcgfSxcbiAgICAgIG1lZGlhOiB7IHByb21wdHM6IFtdLCBjb25maWc6IHsgc3R5bGVfaWQ6ICcnLCBjdXN0b21faW5zdHJ1Y3Rpb25zOiAnJywgYnJhbmRfY29udGV4dF9lbmFibGVkOiBmYWxzZSB9IH0sXG4gICAgICBwbGF0Zm9ybV9jb250ZW50OiB7XG4gICAgICAgIGxpbmtlZGluOiB7IGVuYWJsZWQ6IGZhbHNlLCBib2R5OiAnJywgbm90ZXM6ICcnIH0sXG4gICAgICAgIGluc3RhZ3JhbTogeyBlbmFibGVkOiBmYWxzZSwgYm9keTogJycsIG5vdGVzOiAnJyB9LFxuICAgICAgICBmYWNlYm9vazogeyBlbmFibGVkOiBmYWxzZSwgYm9keTogJycsIG5vdGVzOiAnJyB9LFxuICAgICAgICB5b3V0dWJlOiB7IGVuYWJsZWQ6IGZhbHNlLCB0aXRsZTogJycsIGRlc2NyaXB0aW9uOiAnJywgdGFnczogW10sIG5vdGVzOiAnJyB9XG4gICAgICB9LFxuICAgICAgc2NoZWR1bGU6IHsgZGF0ZTogJycsIHRpbWU6ICcnLCB0aW1lem9uZTogJycsIHB1Ymxpc2hlZF91cmxzOiB7fSB9LFxuICAgICAgcGVyZm9ybWFuY2U6IHt9LFxuICAgICAgY3JlYXRlZF9ieTogUy51c2VyLmlkIHx8ICcnLCBhc3NpZ25lZF90bzogJycsIHJldmlld19ub3RlczogJycsXG4gICAgICBjcmVhdGVkOiBub3csIHVwZGF0ZWQ6IG5vd1xuICAgIH07XG4gICAgLy8gUHJlLWZpbGwgaG9vayBpZiBwcm92aWRlZFxuICAgIGlmIChvdmVycmlkZXMuaG9vaykgcG9zdC5jb250ZW50LmJvZHkgPSBvdmVycmlkZXMuaG9vaztcblxuICAgIFMuZGF0YS5wb3N0cyA9IFMuZGF0YS5wb3N0cyB8fCBbXTtcbiAgICBTLmRhdGEucG9zdHMudW5zaGlmdChwb3N0KTtcbiAgICBsb2dBY3Rpdml0eSgncG9zdF9jcmVhdGVkJywgcG9zdC5pZCwgcG9zdC50aXRsZSB8fCAnTmV3IFBvc3QnLCAnUG9zdCBjcmVhdGVkICgnICsgUE9TVF9UWVBFU1twb3N0LnR5cGVdLmxhYmVsICsgJyknKTtcbiAgICBidWlsZE1hcHMoKTtcbiAgICBTLnNlbGVjdGVkUG9zdElkID0gcG9zdC5pZDtcbiAgICBTLmN1cnJlbnRTdGVwID0gJ2Jhc2ljcyc7XG4gICAgaWYgKFMuY3VycmVudFZpZXcgIT09ICdwb3N0cycpIG5hdmlnYXRlKCdwb3N0cycpO1xuICAgIGVsc2UgcmVuZGVyQ3VycmVudFZpZXcoKTtcbiAgICBzeW5jVG9UZXh0YXJlYSgpO1xuICAgIHRvYXN0KCdQb3N0IGNyZWF0ZWQnLCAnc3VjY2VzcycpO1xuICAgIHJldHVybiBwb3N0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVBvc3RGaWVsZChwb3N0SWQsIGZpZWxkLCB2YWx1ZSkge1xuICAgIHZhciBwb3N0ID0gUy5wb3N0TWFwW3Bvc3RJZCB8fCBTLnNlbGVjdGVkUG9zdElkXTsgaWYgKCFwb3N0KSByZXR1cm47XG4gICAgaWYgKHBvc3RbZmllbGRdID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgIHZhciBvbGRWYWx1ZSA9IHBvc3RbZmllbGRdO1xuICAgIHBvc3RbZmllbGRdID0gdmFsdWU7XG4gICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGlmIChmaWVsZCA9PT0gJ3N0YXR1cycpIHtcbiAgICAgIHZhciBvTGJsID0gKFBPU1RfU1RBVFVTRVNbb2xkVmFsdWVdIHx8IHt9KS5sYWJlbCB8fCBvbGRWYWx1ZTtcbiAgICAgIHZhciBuTGJsID0gKFBPU1RfU1RBVFVTRVNbdmFsdWVdIHx8IHt9KS5sYWJlbCB8fCB2YWx1ZTtcbiAgICAgIGxvZ0FjdGl2aXR5KCdwb3N0X3N0YXR1c19jaGFuZ2VkJywgcG9zdC5pZCwgcG9zdC50aXRsZSwgJ1N0YXR1czogJyArIG9MYmwgKyAnIFx1MjE5MiAnICsgbkxibCk7XG4gICAgfVxuICAgIGJ1aWxkTWFwcygpOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXJDdXJyZW50VmlldygpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nQWN0aXZpdHkodHlwZSwgcG9zdElkLCBwb3N0VGl0bGUsIGRlc2NyaXB0aW9uKSB7XG4gICAgUy5hY3Rpdml0eSA9IFMuYWN0aXZpdHkgfHwgW107XG4gICAgUy5hY3Rpdml0eS5wdXNoKHtcbiAgICAgIGlkOiBnZW5lcmF0ZUlkKCdhY3QnKSwgdHlwZTogdHlwZSxcbiAgICAgIHBvc3RfaWQ6IHBvc3RJZCB8fCAnJywgcG9zdF90aXRsZTogcG9zdFRpdGxlIHx8ICcnLFxuICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB1c2VyX2lkOiBTLnVzZXIuaWQgfHwgJycsIHVzZXJfbmFtZTogUy51c2VyLm5hbWUgfHwgJydcbiAgICB9KTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDE3OiBTWU5DICYgU0FWRVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBzeW5jVG9UZXh0YXJlYSgpIHtcbiAgICBpZiAoIVMuJHRleHRhcmVhIHx8ICFTLiRtZXRhVGV4dGFyZWEgfHwgIVMuJGFjdGl2aXR5VGV4dGFyZWEpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgUy4kdGV4dGFyZWEudmFsKEpTT04uc3RyaW5naWZ5KFMuZGF0YSwgbnVsbCwgMikpLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgUy4kbWV0YVRleHRhcmVhLnZhbChKU09OLnN0cmluZ2lmeShTLm1ldGEsIG51bGwsIDIpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgIFMuJGFjdGl2aXR5VGV4dGFyZWEudmFsKEpTT04uc3RyaW5naWZ5KFMuYWN0aXZpdHksIG51bGwsIDIpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgIFMuZGlydHkgPSB0cnVlO1xuICAgICAgdXBkYXRlU2F2ZVN0YXR1cygndW5zYXZlZCcpO1xuICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcignW1NDUF0gU3luYyBlcnJvcjonLCBlKTsgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2F2ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICB2YXIgJHMgPSAkKCcjc2NwU2F2ZVN0YXR1cycpO1xuICAgIGlmIChzdGF0dXMgPT09ICdzYXZpbmcnKSAkcy50ZXh0KCdTYXZpbmcuLi4nKS5yZW1vdmVDbGFzcygnc2NwLXNhdmVkIHNjcC1zeW5jZWQgc2NwLXVuc2F2ZWQnKS5hZGRDbGFzcygnc2NwLXNhdmluZycpO1xuICAgIGVsc2UgaWYgKHN0YXR1cyA9PT0gJ3NhdmVkJykgeyAkcy50ZXh0KCdTYXZlZCcpLnJlbW92ZUNsYXNzKCdzY3Atc2F2aW5nIHNjcC1zeW5jZWQgc2NwLXVuc2F2ZWQnKS5hZGRDbGFzcygnc2NwLXNhdmVkJyk7IFMuZGlydHkgPSBmYWxzZTsgUy5sYXN0U2F2ZWQgPSBuZXcgRGF0ZSgpOyB9XG4gICAgZWxzZSBpZiAoc3RhdHVzID09PSAnc3luY2VkJykgeyAkcy50ZXh0KCdTeW5jZWQnKS5yZW1vdmVDbGFzcygnc2NwLXNhdmluZyBzY3Atc2F2ZWQgc2NwLXVuc2F2ZWQnKS5hZGRDbGFzcygnc2NwLXN5bmNlZCcpOyB9XG4gICAgZWxzZSAkcy50ZXh0KCdVbnNhdmVkJykucmVtb3ZlQ2xhc3MoJ3NjcC1zYXZpbmcgc2NwLXNhdmVkIHNjcC1zeW5jZWQnKS5hZGRDbGFzcygnc2NwLXVuc2F2ZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0QXV0b1NhdmUoKSB7XG4gICAgaWYgKFMuYXV0b1NhdmVUaW1lcikgY2xlYXJJbnRlcnZhbChTLmF1dG9TYXZlVGltZXIpO1xuICAgIFMuYXV0b1NhdmVUaW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKFMuZGlydHkpIHtcbiAgICAgICAgc3luY1RvVGV4dGFyZWEoKTtcbiAgICAgICAgLy8gTm90ZTogdGhpcyBvbmx5IHN5bmNzIHRvIHRleHRhcmVhIFx1MjAxNCBhY3R1YWwgRHJ1cGFsIHNhdmUgcmVxdWlyZXMgY2xpY2tpbmcgU2F2ZS5cbiAgICAgICAgLy8gU2hvdyBcIlN5bmNlZFwiIGluc3RlYWQgb2YgXCJTYXZlZFwiIHRvIGF2b2lkIG1pc2xlYWRpbmcgdGhlIHVzZXJcbiAgICAgICAgdXBkYXRlU2F2ZVN0YXR1cygnc3luY2VkJyk7XG4gICAgICB9XG4gICAgfSwgMzAwMDApO1xuICB9XG5cbiAgLy8gV2FybiB1c2VyIGFib3V0IHVuc2F2ZWQgY2hhbmdlcyBiZWZvcmUgbGVhdmluZ1xuICAkKHdpbmRvdykub24oJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoUy5hdXRvU2F2ZVRpbWVyKSBjbGVhckludGVydmFsKFMuYXV0b1NhdmVUaW1lcik7XG4gICAgaWYgKFMuZGlydHkpIHtcbiAgICAgIHZhciBtc2cgPSAnWW91IGhhdmUgdW5zYXZlZCBjaGFuZ2VzLiBDbGljayBcIlNhdmVcIiB0byBzYXZlIHRvIERydXBhbCBiZWZvcmUgbGVhdmluZy4nO1xuICAgICAgZS5yZXR1cm5WYWx1ZSA9IG1zZztcbiAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuICB9KTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxODogVE9BU1QgJiBBVVRPLVNUQVRVUyBFTkdJTkVcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gdG9hc3QobXNnLCB0eXBlLCBkdXIpIHtcbiAgICB0eXBlID0gdHlwZSB8fCAnaW5mbyc7IGR1ciA9IGR1ciB8fCAzMDAwO1xuICAgIHZhciAkYyA9ICQoJyNzY3BUb2FzdHMnKTtcbiAgICBpZiAoISRjLmxlbmd0aCkgeyAkYyA9ICQoJzxkaXYgaWQ9XCJzY3BUb2FzdHNcIiBjbGFzcz1cInNjcC10b2FzdC1jb250YWluZXJcIj48L2Rpdj4nKTsgJCgnI3NjcEFwcCcpLmFwcGVuZCgkYyk7IH1cbiAgICB2YXIgaWQgPSAndG9hc3RfJyArIERhdGUubm93KCk7XG4gICAgdmFyIGljb25OYW1lID0gdHlwZSA9PT0gJ3N1Y2Nlc3MnID8gJ3N1Y2Nlc3MnIDogKHR5cGUgPT09ICdlcnJvcicgPyAnZXJyb3InIDogKHR5cGUgPT09ICd3YXJuaW5nJyA/ICd3YXJuaW5nJyA6ICdpbmZvJykpO1xuICAgICRjLmFwcGVuZCgnPGRpdiBjbGFzcz1cInNjcC10b2FzdCBzY3AtdG9hc3QtJyArIHR5cGUgKyAnXCIgaWQ9XCInICsgaWQgKyAnXCI+PHNwYW4gY2xhc3M9XCJzY3AtdG9hc3QtaWNvblwiPicgKyBpY29uKGljb25OYW1lKSArICc8L3NwYW4+PHNwYW4gY2xhc3M9XCJzY3AtdG9hc3QtbWVzc2FnZVwiPicgKyBlc2MobXNnKSArICc8L3NwYW4+PGJ1dHRvbiBjbGFzcz1cInNjcC10b2FzdC1jbG9zZVwiIGRhdGEtYWN0aW9uPVwiY2xvc2UtdG9hc3RcIj4mdGltZXM7PC9idXR0b24+PC9kaXY+Jyk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgJCgnIycgKyBpZCkuYWRkQ2xhc3MoJ3NjcC10b2FzdC1zaG93Jyk7IH0sIDEwKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyAkKCcjJyArIGlkKS5yZW1vdmVDbGFzcygnc2NwLXRvYXN0LXNob3cnKTsgc2V0VGltZW91dChmdW5jdGlvbigpIHsgJCgnIycgKyBpZCkucmVtb3ZlKCk7IH0sIDMwMCk7IH0sIGR1cik7XG4gIH1cblxuICAvLyAtLS0gQXV0by1TdGF0dXMgRW5naW5lIC0tLVxuXG4gIGZ1bmN0aW9uIGV2YWx1YXRlQXV0b1N0YXR1cyhwb3N0KSB7XG4gICAgaWYgKCFwb3N0KSByZXR1cm4gbnVsbDtcbiAgICB2YXIgY3VycmVudElkeCA9IFNUQVRVU19PUkRFUi5pbmRleE9mKHBvc3Quc3RhdHVzKTtcbiAgICBpZiAoY3VycmVudElkeCA8IDApIHJldHVybiBudWxsO1xuXG4gICAgdmFyIHN1Z2dlc3RlZCA9IHBvc3Quc3RhdHVzO1xuXG4gICAgLy8gaWRlYSBcdTIxOTIgcmVzZWFyY2g6IHdoZW4gYW5nbGVzIG9yIGhvb2tzIHJlc2VhcmNoZWRcbiAgICB2YXIgciA9IHBvc3QucmVzZWFyY2ggfHwge307XG4gICAgaWYgKFNUQVRVU19PUkRFUi5pbmRleE9mKCdyZXNlYXJjaCcpID4gY3VycmVudElkeCkge1xuICAgICAgaWYgKChyLmFuZ2xlcyAmJiByLmFuZ2xlcy5sZW5ndGggPiAwKSB8fCAoci5ob29rcyAmJiByLmhvb2tzLmxlbmd0aCA+IDApKSB7XG4gICAgICAgIHN1Z2dlc3RlZCA9ICdyZXNlYXJjaCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVzZWFyY2ggXHUyMTkyIGNvbnRlbnRfd3JpdGluZzogd2hlbiBhbmdsZSBBTkQgaG9vayBzZWxlY3RlZFxuICAgIHZhciBzdWdJZHggPSBTVEFUVVNfT1JERVIuaW5kZXhPZihzdWdnZXN0ZWQpO1xuICAgIGlmIChTVEFUVVNfT1JERVIuaW5kZXhPZignY29udGVudF93cml0aW5nJykgPiBzdWdJZHgpIHtcbiAgICAgIGlmIChyLnNlbGVjdGVkX2FuZ2xlICYmIHIuc2VsZWN0ZWRfaG9vaykge1xuICAgICAgICBzdWdnZXN0ZWQgPSAnY29udGVudF93cml0aW5nJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb250ZW50X3dyaXRpbmcgXHUyMTkyIG1lZGlhX3Byb21wdHMgKG9yIHBsYXRmb3JtX2FkYXB0IGZvciB0ZXh0KVxuICAgIHN1Z0lkeCA9IFNUQVRVU19PUkRFUi5pbmRleE9mKHN1Z2dlc3RlZCk7XG4gICAgdmFyIGNvbnRlbnQgPSBwb3N0LmNvbnRlbnQgfHwge307XG4gICAgaWYgKFNUQVRVU19PUkRFUi5pbmRleE9mKCdtZWRpYV9wcm9tcHRzJykgPiBzdWdJZHggfHwgU1RBVFVTX09SREVSLmluZGV4T2YoJ3BsYXRmb3JtX2FkYXB0JykgPiBzdWdJZHgpIHtcbiAgICAgIGlmIChjb250ZW50LmJvZHkgJiYgY29udGVudC5ib2R5LnRyaW0oKS5sZW5ndGggPiA1MCkge1xuICAgICAgICBpZiAocG9zdC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBpZiAoU1RBVFVTX09SREVSLmluZGV4T2YoJ3BsYXRmb3JtX2FkYXB0JykgPiBzdWdJZHgpIHN1Z2dlc3RlZCA9ICdwbGF0Zm9ybV9hZGFwdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKFNUQVRVU19PUkRFUi5pbmRleE9mKCdtZWRpYV9wcm9tcHRzJykgPiBzdWdJZHgpIHN1Z2dlc3RlZCA9ICdtZWRpYV9wcm9tcHRzJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG1lZGlhX3Byb21wdHMgXHUyMTkyIHBsYXRmb3JtX2FkYXB0XG4gICAgc3VnSWR4ID0gU1RBVFVTX09SREVSLmluZGV4T2Yoc3VnZ2VzdGVkKTtcbiAgICBpZiAoU1RBVFVTX09SREVSLmluZGV4T2YoJ3BsYXRmb3JtX2FkYXB0JykgPiBzdWdJZHgpIHtcbiAgICAgIHZhciBwcm9tcHRzID0gKHBvc3QubWVkaWEgJiYgcG9zdC5tZWRpYS5wcm9tcHRzKSB8fCBbXTtcbiAgICAgIHZhciBoYXNGaW5hbCA9IHByb21wdHMubGVuZ3RoID4gMCAmJiBwcm9tcHRzLnNvbWUoZnVuY3Rpb24obXApIHsgcmV0dXJuIG1wLnN0YXR1cyA9PT0gJ2ZpbmFsJzsgfSk7XG4gICAgICAvLyBQaGFzZSBCOiB2aXN1YWwgcGxhbiBhbHNvIGNvdW50cyBhcyBtZWRpYSBjb21wbGV0aW9uXG4gICAgICB2YXIgaGFzVmlzdWFsUGxhbiA9ICEhKHBvc3QubWVkaWEgJiYgcG9zdC5tZWRpYS52aXN1YWxfcGxhbiAmJiBwb3N0Lm1lZGlhLnZpc3VhbF9wbGFuLnZpc3VhbF9jb25jZXB0ICYmIHBvc3QubWVkaWEudmlzdWFsX3BsYW4udmlzdWFsX2NvbmNlcHQuc2NlbmUpO1xuICAgICAgdmFyIGhhc0Nhcm91c2VsUGxhbnMgPSAhIShwb3N0Lm1lZGlhICYmIHBvc3QubWVkaWEudmlzdWFsX3BsYW5zICYmIHBvc3QubWVkaWEudmlzdWFsX3BsYW5zLmxlbmd0aCA+IDAgJiYgcG9zdC5tZWRpYS52aXN1YWxfcGxhbnNbMF0udmlzdWFsX2NvbmNlcHQpO1xuICAgICAgaWYgKGhhc0ZpbmFsIHx8IGhhc1Zpc3VhbFBsYW4gfHwgaGFzQ2Fyb3VzZWxQbGFucykgc3VnZ2VzdGVkID0gJ3BsYXRmb3JtX2FkYXB0JztcbiAgICB9XG5cbiAgICAvLyBwbGF0Zm9ybV9hZGFwdCBcdTIxOTIgcmVhZHlcbiAgICBzdWdJZHggPSBTVEFUVVNfT1JERVIuaW5kZXhPZihzdWdnZXN0ZWQpO1xuICAgIGlmIChTVEFUVVNfT1JERVIuaW5kZXhPZigncmVhZHknKSA+IHN1Z0lkeCkge1xuICAgICAgdmFyIGhhc0FkYXB0YXRpb24gPSAocG9zdC5wbGF0Zm9ybXMgfHwgW10pLnNvbWUoZnVuY3Rpb24ocGspIHtcbiAgICAgICAgdmFyIHBjID0gKHBvc3QucGxhdGZvcm1fY29udGVudCB8fCB7fSlbcGtdO1xuICAgICAgICBpZiAocGsgPT09ICd5b3V0dWJlJykgcmV0dXJuIHBjICYmIHBjLmVuYWJsZWQgJiYgcGMudGl0bGUgJiYgcGMudGl0bGUudHJpbSgpLmxlbmd0aCA+IDA7XG4gICAgICAgIHJldHVybiBwYyAmJiBwYy5lbmFibGVkICYmIHBjLmJvZHkgJiYgcGMuYm9keS50cmltKCkubGVuZ3RoID4gMDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGhhc0FkYXB0YXRpb24pIHN1Z2dlc3RlZCA9ICdyZWFkeSc7XG4gICAgfVxuXG4gICAgLy8gcmVhZHkgXHUyMTkyIHNjaGVkdWxlZFxuICAgIHN1Z0lkeCA9IFNUQVRVU19PUkRFUi5pbmRleE9mKHN1Z2dlc3RlZCk7XG4gICAgaWYgKFNUQVRVU19PUkRFUi5pbmRleE9mKCdzY2hlZHVsZWQnKSA+IHN1Z0lkeCkge1xuICAgICAgdmFyIHNjaGVkID0gcG9zdC5zY2hlZHVsZSB8fCB7fTtcbiAgICAgIGlmIChzY2hlZC5kYXRlICYmIHNjaGVkLnRpbWUpIHN1Z2dlc3RlZCA9ICdzY2hlZHVsZWQnO1xuICAgIH1cblxuICAgIHJldHVybiBzdWdnZXN0ZWQgPT09IHBvc3Quc3RhdHVzID8gbnVsbCA6IHN1Z2dlc3RlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1heWJlQWR2YW5jZVN0YXR1cyhwb3N0LCByZWFzb24pIHtcbiAgICBpZiAoIXBvc3QpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgc3VnZ2VzdGVkID0gZXZhbHVhdGVBdXRvU3RhdHVzKHBvc3QpO1xuICAgIGlmICghc3VnZ2VzdGVkKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGN1cnJlbnRJZHggPSBTVEFUVVNfT1JERVIuaW5kZXhPZihwb3N0LnN0YXR1cyk7XG4gICAgdmFyIHN1Z2dlc3RlZElkeCA9IFNUQVRVU19PUkRFUi5pbmRleE9mKHN1Z2dlc3RlZCk7XG4gICAgaWYgKHN1Z2dlc3RlZElkeCA8PSBjdXJyZW50SWR4KSByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgb2xkTGFiZWwgPSAoUE9TVF9TVEFUVVNFU1twb3N0LnN0YXR1c10gfHwge30pLmxhYmVsIHx8IHBvc3Quc3RhdHVzO1xuICAgIHZhciBuZXdMYWJlbCA9IChQT1NUX1NUQVRVU0VTW3N1Z2dlc3RlZF0gfHwge30pLmxhYmVsIHx8IHN1Z2dlc3RlZDtcbiAgICBwb3N0LnN0YXR1cyA9IHN1Z2dlc3RlZDtcbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgbG9nQWN0aXZpdHkoJ3Bvc3Rfc3RhdHVzX2NoYW5nZWQnLCBwb3N0LmlkLCBwb3N0LnRpdGxlLCBvbGRMYWJlbCArICcgXHUyMTkyICcgKyBuZXdMYWJlbCArIChyZWFzb24gPyAnICgnICsgcmVhc29uICsgJyknIDogJycpKTtcbiAgICB0b2FzdCgnQXV0by1hZHZhbmNlZCB0byAnICsgbmV3TGFiZWwgKyAocmVhc29uID8gJyBcdTIwMTQgJyArIHJlYXNvbiA6ICcnKSwgJ3N1Y2Nlc3MnLCA0MDAwKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDE5OiBBUEkgRVhQT1JUU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB3aW5kb3cuX3NjcFN0YXRlID0gUztcblxuICAvLyBDb3JlXG4gIHdpbmRvdy5fc2NwUmVuZGVyID0gcmVuZGVyQ3VycmVudFZpZXc7XG4gIHdpbmRvdy5fc2NwTmF2aWdhdGUgPSBuYXZpZ2F0ZTtcbiAgd2luZG93Ll9zY3BUb2FzdCA9IHRvYXN0O1xuICB3aW5kb3cuX3NjcEdlbmVyYXRlSWQgPSBnZW5lcmF0ZUlkO1xuICB3aW5kb3cuX3NjcEJ1aWxkTWFwcyA9IGJ1aWxkTWFwcztcbiAgd2luZG93Ll9zY3BTeW5jVG9UZXh0YXJlYSA9IHN5bmNUb1RleHRhcmVhO1xuICB3aW5kb3cuX3NjcFVwZGF0ZVNhdmVTdGF0dXMgPSB1cGRhdGVTYXZlU3RhdHVzO1xuICB3aW5kb3cuX3NjcExvZ0FjdGl2aXR5ID0gbG9nQWN0aXZpdHk7XG5cbiAgLy8gRm9ybWF0dGVyc1xuICB3aW5kb3cuX3NjcEZvcm1hdERhdGUgPSBmb3JtYXREYXRlO1xuICB3aW5kb3cuX3NjcEZvcm1hdERhdGVTaG9ydCA9IGZvcm1hdERhdGVTaG9ydDtcbiAgd2luZG93Ll9zY3BGb3JtYXRSZWxhdGl2ZVRpbWUgPSBmb3JtYXRSZWxhdGl2ZVRpbWU7XG4gIHdpbmRvdy5fc2NwRm9ybWF0TnVtYmVyID0gZm9ybWF0TnVtYmVyO1xuICB3aW5kb3cuX3NjcEZvcm1hdENoYXJDb3VudCA9IGZvcm1hdENoYXJDb3VudDtcblxuICAvLyBVdGlsaXRpZXNcbiAgd2luZG93Ll9zY3BFc2MgPSBlc2M7XG4gIHdpbmRvdy5fc2NwSWNvbiA9IGljb247XG4gIHdpbmRvdy5fc2NwVHJ1bmNhdGUgPSB0cnVuY2F0ZTtcbiAgd2luZG93Ll9zY3BEZWVwQ2xvbmUgPSBkZWVwQ2xvbmU7XG4gIHdpbmRvdy5fc2NwRGVib3VuY2UgPSBkZWJvdW5jZTtcbiAgd2luZG93Ll9zY3BJc0VtcHR5ID0gaXNFbXB0eTtcbiAgd2luZG93Ll9zY3BDb3VudFdvcmRzID0gY291bnRXb3JkcztcbiAgd2luZG93Ll9zY3BDb3VudENoYXJzID0gY291bnRDaGFycztcblxuICAvLyBCYWRnZXNcbiAgd2luZG93Ll9zY3BCYWRnZSA9IGJhZGdlO1xuICB3aW5kb3cuX3NjcFN0YXR1c0JhZGdlID0gc3RhdHVzQmFkZ2U7XG4gIHdpbmRvdy5fc2NwVHlwZUJhZGdlID0gdHlwZUJhZGdlO1xuICB3aW5kb3cuX3NjcFByaW9yaXR5QmFkZ2UgPSBwcmlvcml0eUJhZGdlO1xuICB3aW5kb3cuX3NjcFBsYXRmb3JtQmFkZ2UgPSBwbGF0Zm9ybUJhZGdlO1xuICB3aW5kb3cuX3NjcE1lZGlhUHJvbXB0U3RhdHVzQmFkZ2UgPSBtZWRpYVByb21wdFN0YXR1c0JhZGdlO1xuICB3aW5kb3cuX3NjcFByb2dyZXNzQmFyID0gcHJvZ3Jlc3NCYXI7XG5cbiAgLy8gR2V0dGVyc1xuICB3aW5kb3cuX3NjcEdldEZpbHRlcmVkUG9zdHMgPSBnZXRGaWx0ZXJlZFBvc3RzO1xuICB3aW5kb3cuX3NjcEdldEdyb3VwZWRQb3N0cyA9IGdldEdyb3VwZWRQb3N0cztcbiAgd2luZG93Ll9zY3BHZXRBbGxUb3BpY3MgPSBnZXRBbGxUb3BpY3M7XG4gIHdpbmRvdy5fc2NwR2V0VG9waWNQb3N0cyA9IGdldFRvcGljUG9zdHM7XG4gIHdpbmRvdy5fc2NwR2V0QWxsU2VyaWVzID0gZ2V0QWxsU2VyaWVzO1xuICB3aW5kb3cuX3NjcEdldFNlcmllc1Bvc3RzID0gZ2V0U2VyaWVzUG9zdHM7XG4gIHdpbmRvdy5fc2NwR2V0VXBjb21pbmdQb3N0cyA9IGdldFVwY29taW5nUG9zdHM7XG4gIHdpbmRvdy5fc2NwR2V0UmVjZW50bHlQdWJsaXNoZWQgPSBnZXRSZWNlbnRseVB1Ymxpc2hlZDtcbiAgd2luZG93Ll9zY3BHZXRSZWNlbnRBY3Rpdml0eSA9IGdldFJlY2VudEFjdGl2aXR5O1xuICB3aW5kb3cuX3NjcFJlc29sdmVUb25lID0gcmVzb2x2ZVRvbmU7XG4gIHdpbmRvdy5fc2NwUmVzb2x2ZUF1ZGllbmNlID0gcmVzb2x2ZUF1ZGllbmNlO1xuICB3aW5kb3cuX3NjcFJlc29sdmVJbWFnZVN0eWxlID0gcmVzb2x2ZUltYWdlU3R5bGU7XG4gIHdpbmRvdy5fc2NwR2V0UGxhdGZvcm1Db25maWcgPSBnZXRQbGF0Zm9ybUNvbmZpZztcbiAgd2luZG93Ll9zY3BSZXNvbHZlVG9waWMgPSByZXNvbHZlVG9waWM7XG4gIHdpbmRvdy5fc2NwUmVzb2x2ZVNlcmllcyA9IHJlc29sdmVTZXJpZXM7XG5cbiAgLy8gQXV0by1zdGF0dXNcbiAgd2luZG93Ll9zY3BFdmFsdWF0ZUF1dG9TdGF0dXMgPSBldmFsdWF0ZUF1dG9TdGF0dXM7XG4gIHdpbmRvdy5fc2NwTWF5YmVBZHZhbmNlU3RhdHVzID0gbWF5YmVBZHZhbmNlU3RhdHVzO1xuXG4gIC8vIEltYWdlc1xuICB3aW5kb3cuX3NjcEdldEltYWdlcyA9IGdldEltYWdlcztcbiAgd2luZG93Ll9zY3BHZXRJbWFnZUJ5SWQgPSBnZXRJbWFnZUJ5SWQ7XG4gIHdpbmRvdy5fc2NwR2V0QWxsSW1hZ2VUYWdzID0gZ2V0QWxsSW1hZ2VUYWdzO1xuICB3aW5kb3cuX3NjcFBhcnNlSW1hZ2VGaWVsZCA9IHBhcnNlSW1hZ2VGaWVsZDtcblxuICAvLyBDUlVEXG4gIHdpbmRvdy5fc2NwQ3JlYXRlTmV3UG9zdCA9IGNyZWF0ZU5ld1Bvc3Q7XG4gIHdpbmRvdy5fc2NwU2F2ZVBvc3RGaWVsZCA9IHNhdmVQb3N0RmllbGQ7XG5cbiAgLy8gU2V0dXAgd2l6YXJkIGhlbHBlcnNcbiAgZnVuY3Rpb24gbWFya1NldHVwQ29tcGxldGUoKSB7XG4gICAgUy5tZXRhLnNldHVwID0gUy5tZXRhLnNldHVwIHx8IHt9O1xuICAgIFMubWV0YS5zZXR1cC5maXJzdFJ1biA9IGZhbHNlO1xuICAgIFMubWV0YS5zZXR1cC5jb21wbGV0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBTLm1ldGEuc2V0dXAudmVyc2lvbiA9IFMubWV0YS5zZXR1cC52ZXJzaW9uIHx8IDE7XG4gICAgbG9nQWN0aXZpdHkoJ3NldHVwX2NvbXBsZXRlZCcsICcnLCAnJywgJ1NldHVwIHdpemFyZCBjb21wbGV0ZWQnKTtcbiAgICBzeW5jVG9UZXh0YXJlYSgpO1xuICB9XG4gIGZ1bmN0aW9uIHJlc2V0U2V0dXAoKSB7XG4gICAgUy5tZXRhLnNldHVwID0gUy5tZXRhLnNldHVwIHx8IHt9O1xuICAgIFMubWV0YS5zZXR1cC5maXJzdFJ1biA9IHRydWU7XG4gICAgUy5tZXRhLnNldHVwLmNvbXBsZXRlZEF0ID0gJyc7XG4gICAgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuICBmdW5jdGlvbiBpc0ZpcnN0UnVuKCkgeyByZXR1cm4gISEoUy5tZXRhLnNldHVwICYmIFMubWV0YS5zZXR1cC5maXJzdFJ1bik7IH1cbiAgd2luZG93Ll9zY3BNYXJrU2V0dXBDb21wbGV0ZSA9IG1hcmtTZXR1cENvbXBsZXRlO1xuICB3aW5kb3cuX3NjcFJlc2V0U2V0dXAgPSByZXNldFNldHVwO1xuICB3aW5kb3cuX3NjcElzRmlyc3RSdW4gPSBpc0ZpcnN0UnVuO1xuXG4gIC8vIEFJIFRleHQgRm9ybWF0dGluZ1xuICB3aW5kb3cuX3NjcENsZWFuQUlUZXh0ID0gY2xlYW5BSVRleHQ7XG4gIHdpbmRvdy5fc2NwRm9ybWF0Q29udGVudEZvclByZXZpZXcgPSBmb3JtYXRDb250ZW50Rm9yUHJldmlldztcbiAgd2luZG93Ll9zY3BQYXJzZVByb21wdFNlY3Rpb25zID0gcGFyc2VQcm9tcHRTZWN0aW9ucztcblxuICAvLyBDb25zdGFudHNcbiAgd2luZG93Ll9zY3BDb25zdGFudHMgPSB7XG4gICAgQVBQX1ZJRVdTOiBBUFBfVklFV1MsIFBPU1RfVFlQRVM6IFBPU1RfVFlQRVMsIFBMQVRGT1JNUzogUExBVEZPUk1TLFxuICAgIFBPU1RfU1RBVFVTRVM6IFBPU1RfU1RBVFVTRVMsIFNUQVRVU19PUkRFUjogU1RBVFVTX09SREVSLCBBQ1RJVkVfU1RBVFVTRVM6IEFDVElWRV9TVEFUVVNFUyxcbiAgICBXT1JLRkxPV19HUk9VUFM6IFdPUktGTE9XX0dST1VQUywgR1JPVVBJTkdfT1BUSU9OUzogR1JPVVBJTkdfT1BUSU9OUywgUElQRUxJTkVfU1RFUFM6IFBJUEVMSU5FX1NURVBTLFxuICAgIFBSSU9SSVRZX0xFVkVMUzogUFJJT1JJVFlfTEVWRUxTLCBBQ1RJVklUWV9UWVBFUzogQUNUSVZJVFlfVFlQRVMsIENBUkRfREVOU0lUSUVTOiBDQVJEX0RFTlNJVElFUyxcbiAgICBNRURJQV9QUk9NUFRfU1RBVFVTRVM6IE1FRElBX1BST01QVF9TVEFUVVNFU1xuICB9O1xuXG4gIGNvbnNvbGUubG9nKCdbU0NQXSBQYXJ0IDEgbG9hZGVkJyk7XG59KShqUXVlcnksIERydXBhbCk7XG4iLCAiLyoqXG4gKiBTb2NpYWwgQ29udGVudCBQbGFubmVyIHYxLjAgLSBQYXJ0IDJBOiBQaXBlbGluZSBFZGl0b3IgJiBDUlVEXG4gKlxuICogTW9kYWxzLCB1bmRvL3JlZG8sIHBvc3QvdG9waWMgQ1JVRCwgNiBwaXBlbGluZSBzdGVwIHJlbmRlcmVycyxcbiAqIHNvY2lhbCBjb21wb3NlciBjb21wb25lbnQsIHRvcGljIGlucHV0LCBpbmxpbmUgZWRpdGluZy5cbiAqXG4gKiBSZWdpc3RyeTogc3RlcF9iYXNpY3MsIHN0ZXBfcmVzZWFyY2gsIHN0ZXBfY29udGVudCwgc3RlcF9tZWRpYSxcbiAqICAgc3RlcF9wbGF0Zm9ybXMsIHN0ZXBfc2NoZWR1bGUsIHRvcGljSW5wdXQsIHNvY2lhbENvbXBvc2VyXG4gKlxuICogU2VjdGlvbnM6XG4gKiAgMS4gSW5pdCAmIGltcG9ydHNcbiAqICAyLiBNb2RhbCBzeXN0ZW1cbiAqICAzLiBVbmRvL3JlZG9cbiAqICA0LiBQb3N0ICYgdG9waWMgQ1JVRFxuICogIDUuIFN0ZXAgMTogQmFzaWNzIHJlbmRlcmVyXG4gKiAgNi4gU3RlcCAyOiBSZXNlYXJjaCByZW5kZXJlciAoYW5nbGVzICsgaG9va3MpXG4gKiAgNy4gU3RlcCAzOiBDb250ZW50IHJlbmRlcmVyIChzb2NpYWwgY29tcG9zZXIgKyBjYXJvdXNlbCArIHZpZGVvKVxuICogIDguIFN0ZXAgNDogTWVkaWEgcHJvbXB0cyByZW5kZXJlclxuICogIDkuIFN0ZXAgNTogUGxhdGZvcm1zIHJlbmRlcmVyXG4gKiAxMC4gU3RlcCA2OiBTY2hlZHVsZSByZW5kZXJlclxuICogMTEuIFNvY2lhbCBjb21wb3NlciBjb21wb25lbnRcbiAqIDEyLiBUb3BpYyBpbnB1dCBjb21wb25lbnRcbiAqIDEzLiBFdmVudCBoYW5kbGVyc1xuICogMTQuIERhdGEgc2F2ZSBoZWxwZXJzXG4gKiAxNS4gQVBJIGV4cG9ydHNcbiAqXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG4oZnVuY3Rpb24oJCwgRHJ1cGFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxOiBJTklUICYgSU1QT1JUU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgUywgcmVuZGVyLCBuYXZpZ2F0ZSwgdG9hc3QsIGdlbmVyYXRlSWQsIGJ1aWxkTWFwcywgc3luY1RvVGV4dGFyZWE7XG4gIHZhciB1cGRhdGVTYXZlU3RhdHVzLCBlc2MsIGRlZXBDbG9uZSwgaWNvbiwgZm9ybWF0RGF0ZSwgZm9ybWF0UmVsYXRpdmVUaW1lO1xuICB2YXIgdHJ1bmNhdGUsIHN0YXR1c0JhZGdlLCB0eXBlQmFkZ2UsIHByaW9yaXR5QmFkZ2UsIHBsYXRmb3JtQmFkZ2UsIG1lZGlhUHJvbXB0U3RhdHVzQmFkZ2U7XG4gIHZhciBsb2dBY3Rpdml0eSwgY291bnRXb3JkcywgY291bnRDaGFycywgZm9ybWF0Q2hhckNvdW50LCBmb3JtYXROdW1iZXI7XG4gIHZhciBtYXliZUFkdmFuY2VTdGF0dXMsIHJlc29sdmVUb3BpYywgcmVzb2x2ZVRvbmUsIHJlc29sdmVBdWRpZW5jZSwgcmVzb2x2ZUltYWdlU3R5bGU7XG4gIHZhciBnZXRQbGF0Zm9ybUNvbmZpZywgcHJvZ3Jlc3NCYXIsIGJhZGdlO1xuICB2YXIgY2xlYW5BSVRleHQsIGZvcm1hdENvbnRlbnRGb3JQcmV2aWV3LCBwYXJzZVByb21wdFNlY3Rpb25zO1xuICB2YXIgQ29uc3RhbnRzO1xuXG4gIHZhciBfY2hlY2tDb3VudCA9IDA7XG4gIHZhciBjaGVja0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgX2NoZWNrQ291bnQrKztcbiAgICBpZiAod2luZG93Ll9zY3BTdGF0ZSAmJiB3aW5kb3cuX3NjcFN0YXRlLmluaXRpYWxpemVkKSB7IGNsZWFySW50ZXJ2YWwoY2hlY2tJbnRlcnZhbCk7IGluaXRQYXJ0MkEoKTsgfVxuICAgIGVsc2UgaWYgKF9jaGVja0NvdW50ID4gMTAwKSB7IGNsZWFySW50ZXJ2YWwoY2hlY2tJbnRlcnZhbCk7IGNvbnNvbGUuZXJyb3IoJ1tTQ1BdIFBhcnQgMkE6IFRpbWVkIG91dCB3YWl0aW5nIGZvciBQYXJ0IDEnKTsgfVxuICB9LCAxMDApO1xuXG4gIGZ1bmN0aW9uIGluaXRQYXJ0MkEoKSB7XG4gICAgY29uc29sZS5sb2coJ1tTQ1BdIEluaXRpYWxpemluZyBQYXJ0IDJBLi4uJyk7XG4gICAgUyA9IHdpbmRvdy5fc2NwU3RhdGU7XG4gICAgcmVuZGVyID0gd2luZG93Ll9zY3BSZW5kZXI7IG5hdmlnYXRlID0gd2luZG93Ll9zY3BOYXZpZ2F0ZTsgdG9hc3QgPSB3aW5kb3cuX3NjcFRvYXN0O1xuICAgIGdlbmVyYXRlSWQgPSB3aW5kb3cuX3NjcEdlbmVyYXRlSWQ7IGJ1aWxkTWFwcyA9IHdpbmRvdy5fc2NwQnVpbGRNYXBzO1xuICAgIHN5bmNUb1RleHRhcmVhID0gd2luZG93Ll9zY3BTeW5jVG9UZXh0YXJlYTsgdXBkYXRlU2F2ZVN0YXR1cyA9IHdpbmRvdy5fc2NwVXBkYXRlU2F2ZVN0YXR1cztcbiAgICBlc2MgPSB3aW5kb3cuX3NjcEVzYzsgZGVlcENsb25lID0gd2luZG93Ll9zY3BEZWVwQ2xvbmU7IGljb24gPSB3aW5kb3cuX3NjcEljb247XG4gICAgZm9ybWF0RGF0ZSA9IHdpbmRvdy5fc2NwRm9ybWF0RGF0ZTsgZm9ybWF0UmVsYXRpdmVUaW1lID0gd2luZG93Ll9zY3BGb3JtYXRSZWxhdGl2ZVRpbWU7XG4gICAgdHJ1bmNhdGUgPSB3aW5kb3cuX3NjcFRydW5jYXRlOyBmb3JtYXROdW1iZXIgPSB3aW5kb3cuX3NjcEZvcm1hdE51bWJlcjtcbiAgICBmb3JtYXRDaGFyQ291bnQgPSB3aW5kb3cuX3NjcEZvcm1hdENoYXJDb3VudDtcbiAgICBzdGF0dXNCYWRnZSA9IHdpbmRvdy5fc2NwU3RhdHVzQmFkZ2U7IHR5cGVCYWRnZSA9IHdpbmRvdy5fc2NwVHlwZUJhZGdlO1xuICAgIHByaW9yaXR5QmFkZ2UgPSB3aW5kb3cuX3NjcFByaW9yaXR5QmFkZ2U7IHBsYXRmb3JtQmFkZ2UgPSB3aW5kb3cuX3NjcFBsYXRmb3JtQmFkZ2U7XG4gICAgbWVkaWFQcm9tcHRTdGF0dXNCYWRnZSA9IHdpbmRvdy5fc2NwTWVkaWFQcm9tcHRTdGF0dXNCYWRnZTtcbiAgICBsb2dBY3Rpdml0eSA9IHdpbmRvdy5fc2NwTG9nQWN0aXZpdHk7IGNvdW50V29yZHMgPSB3aW5kb3cuX3NjcENvdW50V29yZHM7XG4gICAgY291bnRDaGFycyA9IHdpbmRvdy5fc2NwQ291bnRDaGFyczsgYmFkZ2UgPSB3aW5kb3cuX3NjcEJhZGdlO1xuICAgIG1heWJlQWR2YW5jZVN0YXR1cyA9IHdpbmRvdy5fc2NwTWF5YmVBZHZhbmNlU3RhdHVzO1xuICAgIHJlc29sdmVUb3BpYyA9IHdpbmRvdy5fc2NwUmVzb2x2ZVRvcGljOyByZXNvbHZlVG9uZSA9IHdpbmRvdy5fc2NwUmVzb2x2ZVRvbmU7XG4gICAgcmVzb2x2ZUF1ZGllbmNlID0gd2luZG93Ll9zY3BSZXNvbHZlQXVkaWVuY2U7IHJlc29sdmVJbWFnZVN0eWxlID0gd2luZG93Ll9zY3BSZXNvbHZlSW1hZ2VTdHlsZTtcbiAgICBnZXRQbGF0Zm9ybUNvbmZpZyA9IHdpbmRvdy5fc2NwR2V0UGxhdGZvcm1Db25maWc7IHByb2dyZXNzQmFyID0gd2luZG93Ll9zY3BQcm9ncmVzc0JhcjtcbiAgICBjbGVhbkFJVGV4dCA9IHdpbmRvdy5fc2NwQ2xlYW5BSVRleHQ7IGZvcm1hdENvbnRlbnRGb3JQcmV2aWV3ID0gd2luZG93Ll9zY3BGb3JtYXRDb250ZW50Rm9yUHJldmlldztcbiAgICBwYXJzZVByb21wdFNlY3Rpb25zID0gd2luZG93Ll9zY3BQYXJzZVByb21wdFNlY3Rpb25zO1xuICAgIENvbnN0YW50cyA9IHdpbmRvdy5fc2NwQ29uc3RhbnRzO1xuXG4gICAgLy8gQUkgcGlja2VyIGhlbHBlciBcdTIwMTQgbGF6eSBldmFsdWF0aW9uIChQYXJ0IDJCIG1heSBub3QgYmUgbG9hZGVkIHlldClcbiAgICB3aW5kb3cuX3NjcEFpU2VsID0gZnVuY3Rpb24oYWN0aW9uSWQpIHtcbiAgICAgIGlmICh3aW5kb3cuX3NjcFBhcnQyQiAmJiB3aW5kb3cuX3NjcFBhcnQyQi5yZW5kZXJJbmxpbmVQaWNrZXIpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5fc2NwUGFydDJCLnJlbmRlcklubGluZVBpY2tlcihhY3Rpb25JZCk7XG4gICAgICB9XG4gICAgICAvLyBQYXJ0IDJCIG5vdCByZWFkeSB5ZXQgXHUyMDE0IHNob3cgbG9hZGluZyBwbGFjZWhvbGRlciB0aGF0IGdldHMgcmVwbGFjZWQgbGF0ZXJcbiAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJzY3AtYWktcGlja2VyLWxvYWRpbmdcIiBkYXRhLXBlbmRpbmctYWN0aW9uPVwiJyArIGVzYyhhY3Rpb25JZCkgKyAnXCI+JyArIGljb24oJ3NwaW5uZXInKSArICc8L3NwYW4+JztcbiAgICB9O1xuXG4gICAgLy8gUmVnaXN0ZXIgc3RlcCByZW5kZXJlcnNcbiAgICB2YXIgUiA9IHdpbmRvdy5fc2NwUmVuZGVyZXJzID0gd2luZG93Ll9zY3BSZW5kZXJlcnMgfHwge307XG4gICAgUi50b3BpY0lucHV0ID0gcmVuZGVyVG9waWNJbnB1dDtcbiAgICBSLnNvY2lhbENvbXBvc2VyID0gcmVuZGVyU29jaWFsQ29tcG9zZXI7XG5cbiAgICBzZXR1cFBhcnQyQUV2ZW50cygpO1xuICAgIHNuYXBzaG90KCdJbml0aWFsIHN0YXRlJyk7XG4gICAgaWYgKHJlbmRlcikgcmVuZGVyKCk7XG4gICAgY29uc29sZS5sb2coJ1tTQ1BdIFBhcnQgMkEgaW5pdGlhbGl6ZWQnKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDI6IE1PREFMIFNZU1RFTVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgY3VycmVudE1vZGFsID0gbnVsbDtcbiAgZnVuY3Rpb24gb3Blbk1vZGFsKHRpdGxlLCBjb250ZW50LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IGNsb3NlTW9kYWwoKTtcbiAgICB2YXIgc2l6ZSA9IG9wdGlvbnMuc2l6ZSB8fCAnbWQnO1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtbW9kYWwtYmFja2Ryb3BcIj48ZGl2IGNsYXNzPVwic2NwLW1vZGFsIHNjcC1tb2RhbC0nICsgc2l6ZSArICdcIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtbW9kYWwtaGVhZGVyXCI+PGgzPicgKyBlc2ModGl0bGUpICsgJzwvaDM+PGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvbiBzY3AtbW9kYWwtY2xvc2VcIiBkYXRhLWFjdGlvbj1cImNsb3NlLW1vZGFsXCI+JyArIGljb24oJ3gnKSArICc8L2J1dHRvbj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtbW9kYWwtYm9keVwiPicgKyBjb250ZW50ICsgJzwvZGl2Pic7XG4gICAgaWYgKG9wdGlvbnMuZm9vdGVyICE9PSBmYWxzZSkge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1tb2RhbC1mb290ZXJcIj48YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImNsb3NlLW1vZGFsXCI+Q2FuY2VsPC9idXR0b24+JztcbiAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuICcgKyAob3B0aW9ucy5kYW5nZXIgPyAnc2NwLWJ0bi1kYW5nZXInIDogJ3NjcC1idG4tcHJpbWFyeScpICsgJ1wiIGRhdGEtYWN0aW9uPVwibW9kYWwtc2F2ZVwiPicgKyAob3B0aW9ucy5zYXZlTGFiZWwgfHwgJ1NhdmUnKSArICc8L2J1dHRvbj48L2Rpdj4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgICQoJ2JvZHknKS5hcHBlbmQoaHRtbCk7IGN1cnJlbnRNb2RhbCA9IG9wdGlvbnM7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgJCgnLnNjcC1tb2RhbC1iYWNrZHJvcCcpLmFkZENsYXNzKCdzY3AtbW9kYWwtdmlzaWJsZScpOyB9LCAxMCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkgeyAkKCcuc2NwLW1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7IGN1cnJlbnRNb2RhbCA9IG51bGw7IH1cblxuICBmdW5jdGlvbiBvcGVuQ29uZmlybURpYWxvZyhvcHRzKSB7XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maXJtLWJhY2tkcm9wXCI+PGRpdiBjbGFzcz1cInNjcC1jb25maXJtLWRpYWxvZ1wiPjxoMz4nICsgZXNjKG9wdHMudGl0bGUgfHwgJ0NvbmZpcm0nKSArICc8L2gzPjxwPicgKyBlc2Mob3B0cy5tZXNzYWdlIHx8ICdBcmUgeW91IHN1cmU/JykgKyAnPC9wPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maXJtLWFjdGlvbnNcIj48YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImNvbmZpcm0tY2FuY2VsXCI+Q2FuY2VsPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biAnICsgKG9wdHMuZGFuZ2VyID8gJ3NjcC1idG4tZGFuZ2VyJyA6ICdzY3AtYnRuLXByaW1hcnknKSArICdcIiBkYXRhLWFjdGlvbj1cImNvbmZpcm0tb2tcIj4nICsgZXNjKG9wdHMuY29uZmlybUxhYmVsIHx8ICdDb25maXJtJykgKyAnPC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+JztcbiAgICAkKCdib2R5JykuYXBwZW5kKGh0bWwpO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtY29rJykub24oJ2NsaWNrLnNjcDJhLWNvaycsICdbZGF0YS1hY3Rpb249XCJjb25maXJtLW9rXCJdJywgZnVuY3Rpb24oKSB7IGNsb3NlQ29uZmlybURpYWxvZygpOyBpZiAob3B0cy5vbkNvbmZpcm0pIG9wdHMub25Db25maXJtKCk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtY2NuJykub24oJ2NsaWNrLnNjcDJhLWNjbicsICdbZGF0YS1hY3Rpb249XCJjb25maXJtLWNhbmNlbFwiXScsIGZ1bmN0aW9uKCkgeyBjbG9zZUNvbmZpcm1EaWFsb2coKTsgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZUNvbmZpcm1EaWFsb2coKSB7ICQoJy5zY3AtY29uZmlybS1iYWNrZHJvcCcpLnJlbW92ZSgpOyAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLWNvayBjbGljay5zY3AyYS1jY24nKTsgfVxuXG4gIGZ1bmN0aW9uIGNvbGxlY3RNb2RhbEZpZWxkcygpIHtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgICQoJy5zY3AtbW9kYWwtYm9keSBbZGF0YS1maWVsZF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRmID0gJCh0aGlzKTtcbiAgICAgIGRhdGFbJGYuZGF0YSgnZmllbGQnKV0gPSAkZi5pcygnOmNoZWNrYm94JykgPyAkZi5pcygnOmNoZWNrZWQnKSA6ICRmLnZhbCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMzogVU5ETy9SRURPXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHNuYXBzaG90KGxhYmVsKSB7XG4gICAgUy51bmRvU3RhY2sgPSBTLnVuZG9TdGFjayB8fCBbXTtcbiAgICBTLnVuZG9TdGFjay5wdXNoKHsgbGFiZWw6IGxhYmVsIHx8ICcnLCBkYXRhOiBkZWVwQ2xvbmUoUy5kYXRhKSwgbWV0YTogZGVlcENsb25lKFMubWV0YSksIGFjdGl2aXR5OiBkZWVwQ2xvbmUoUy5hY3Rpdml0eSkgfSk7XG4gICAgaWYgKFMudW5kb1N0YWNrLmxlbmd0aCA+IDUwKSBTLnVuZG9TdGFjay5zaGlmdCgpO1xuICAgIFMucmVkb1N0YWNrID0gW107XG4gIH1cblxuICBmdW5jdGlvbiB1bmRvKCkge1xuICAgIGlmICghUy51bmRvU3RhY2sgfHwgUy51bmRvU3RhY2subGVuZ3RoIDw9IDEpIHsgdG9hc3QoJ05vdGhpbmcgdG8gdW5kbycsICdpbmZvJyk7IHJldHVybjsgfVxuICAgIFMucmVkb1N0YWNrID0gUy5yZWRvU3RhY2sgfHwgW107XG4gICAgUy5yZWRvU3RhY2sucHVzaChTLnVuZG9TdGFjay5wb3AoKSk7XG4gICAgdmFyIHByZXYgPSBTLnVuZG9TdGFja1tTLnVuZG9TdGFjay5sZW5ndGggLSAxXTtcbiAgICBTLmRhdGEgPSBkZWVwQ2xvbmUocHJldi5kYXRhKTtcbiAgICBpZiAocHJldi5tZXRhKSBTLm1ldGEgPSBkZWVwQ2xvbmUocHJldi5tZXRhKTtcbiAgICBpZiAocHJldi5hY3Rpdml0eSkgUy5hY3Rpdml0eSA9IGRlZXBDbG9uZShwcmV2LmFjdGl2aXR5KTtcbiAgICBidWlsZE1hcHMoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdVbmRvbmUnLCAnaW5mbycpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVkbygpIHtcbiAgICBpZiAoIVMucmVkb1N0YWNrIHx8IFMucmVkb1N0YWNrLmxlbmd0aCA9PT0gMCkgeyB0b2FzdCgnTm90aGluZyB0byByZWRvJywgJ2luZm8nKTsgcmV0dXJuOyB9XG4gICAgdmFyIG5leHQgPSBTLnJlZG9TdGFjay5wb3AoKTtcbiAgICBTLnVuZG9TdGFjay5wdXNoKG5leHQpO1xuICAgIFMuZGF0YSA9IGRlZXBDbG9uZShuZXh0LmRhdGEpO1xuICAgIGlmIChuZXh0Lm1ldGEpIFMubWV0YSA9IGRlZXBDbG9uZShuZXh0Lm1ldGEpO1xuICAgIGlmIChuZXh0LmFjdGl2aXR5KSBTLmFjdGl2aXR5ID0gZGVlcENsb25lKG5leHQuYWN0aXZpdHkpO1xuICAgIGJ1aWxkTWFwcygpOyByZW5kZXIoKTsgc3luY1RvVGV4dGFyZWEoKTsgdG9hc3QoJ1JlZG9uZScsICdpbmZvJyk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA0OiBQT1NUICYgVEFHIENSVURcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gZGVsZXRlUG9zdChwb3N0SWQpIHtcbiAgICB2YXIgcG9zdCA9IFMucG9zdE1hcFtwb3N0SWRdOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICBvcGVuQ29uZmlybURpYWxvZyh7XG4gICAgICB0aXRsZTogJ0RlbGV0ZSBQb3N0JywgbWVzc2FnZTogJ0RlbGV0ZSBcIicgKyAocG9zdC50aXRsZSB8fCAnVW50aXRsZWQnKSArICdcIj8nLCBjb25maXJtTGFiZWw6ICdEZWxldGUnLCBkYW5nZXI6IHRydWUsXG4gICAgICBvbkNvbmZpcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICBTLmRhdGEucG9zdHMgPSAoUy5kYXRhLnBvc3RzIHx8IFtdKS5maWx0ZXIoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5pZCAhPT0gcG9zdElkOyB9KTtcbiAgICAgICAgaWYgKFMuc2VsZWN0ZWRQb3N0SWQgPT09IHBvc3RJZCkgUy5zZWxlY3RlZFBvc3RJZCA9IG51bGw7XG4gICAgICAgIGxvZ0FjdGl2aXR5KCdwb3N0X2RlbGV0ZWQnLCBwb3N0SWQsIHBvc3QudGl0bGUsICdQb3N0IGRlbGV0ZWQnKTtcbiAgICAgICAgc25hcHNob3QoJ0RlbGV0ZSBwb3N0Jyk7IGJ1aWxkTWFwcygpOyByZW5kZXIoKTsgc3luY1RvVGV4dGFyZWEoKTsgdG9hc3QoJ1Bvc3QgZGVsZXRlZCcsICdzdWNjZXNzJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBkdXBsaWNhdGVQb3N0KHBvc3RJZCkge1xuICAgIHZhciBwb3N0ID0gUy5wb3N0TWFwW3Bvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHZhciBjbG9uZSA9IGRlZXBDbG9uZShwb3N0KTtcbiAgICBjbG9uZS5pZCA9IGdlbmVyYXRlSWQoJ3Bvc3QnKTtcbiAgICBjbG9uZS50aXRsZSA9IChjbG9uZS50aXRsZSB8fCAnJykgKyAnIChjb3B5KSc7XG4gICAgY2xvbmUuc3RhdHVzID0gJ2lkZWEnO1xuICAgIGNsb25lLmNyZWF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY2xvbmUudXBkYXRlZCA9IGNsb25lLmNyZWF0ZWQ7XG4gICAgY2xvbmUuc2NoZWR1bGUgPSB7IGRhdGU6ICcnLCB0aW1lOiAnJywgdGltZXpvbmU6ICcnLCBwdWJsaXNoZWRfdXJsczoge30gfTtcbiAgICBjbG9uZS5wZXJmb3JtYW5jZSA9IHt9O1xuICAgIFMuZGF0YS5wb3N0cy51bnNoaWZ0KGNsb25lKTtcbiAgICBsb2dBY3Rpdml0eSgncG9zdF9jcmVhdGVkJywgY2xvbmUuaWQsIGNsb25lLnRpdGxlLCAnUG9zdCBkdXBsaWNhdGVkJyk7XG4gICAgc25hcHNob3QoJ0R1cGxpY2F0ZSBwb3N0Jyk7IGJ1aWxkTWFwcygpOyBTLnNlbGVjdGVkUG9zdElkID0gY2xvbmUuaWQ7IFMuY3VycmVudFN0ZXAgPSAnYmFzaWNzJztcbiAgICByZW5kZXIoKTsgc3luY1RvVGV4dGFyZWEoKTsgdG9hc3QoJ1Bvc3QgZHVwbGljYXRlZCcsICdzdWNjZXNzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9tb3RlUmVzZWFyY2hJZGVhKHNlc3Npb25JZCwgaWRlYUlkKSB7XG4gICAgdmFyIHNlc3Npb24gPSBTLnJlc2VhcmNoTWFwW3Nlc3Npb25JZF07IGlmICghc2Vzc2lvbikgcmV0dXJuO1xuICAgIHZhciBpZGVhID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IChzZXNzaW9uLnJlc3VsdHMgfHwgW10pLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc2Vzc2lvbi5yZXN1bHRzW2ldLmlkID09PSBpZGVhSWQpIHsgaWRlYSA9IHNlc3Npb24ucmVzdWx0c1tpXTsgYnJlYWs7IH1cbiAgICB9XG4gICAgaWYgKCFpZGVhKSByZXR1cm47XG4gICAgdmFyIGRlZnMgPSAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5kZWZhdWx0cykgfHwge307XG4gICAgdmFyIHBvc3QgPSB3aW5kb3cuX3NjcENyZWF0ZU5ld1Bvc3Qoe1xuICAgICAgdGl0bGU6IGlkZWEudGl0bGUgfHwgJycsXG4gICAgICB0eXBlOiBpZGVhLnR5cGUgfHwgZGVmcy50eXBlIHx8ICdpbWFnZScsXG4gICAgICBwbGF0Zm9ybXM6IChpZGVhLnBsYXRmb3JtcyAmJiBpZGVhLnBsYXRmb3Jtcy5sZW5ndGgpID8gaWRlYS5wbGF0Zm9ybXMgOiBkZWZzLnBsYXRmb3JtcyB8fCBbJ2xpbmtlZGluJ10sXG4gICAgICBob29rOiBpZGVhLmhvb2sgfHwgJycsXG4gICAgICBzb3VyY2U6IHsgdHlwZTogJ3Jlc2VhcmNoJywgcmVzZWFyY2hfc2Vzc2lvbl9pZDogc2Vzc2lvbklkLCByZXNlYXJjaF9pZGVhX2lkOiBpZGVhSWQsIG5vdGVzOiAnJyB9XG4gICAgfSk7XG4gICAgaWYgKHBvc3QpIHtcbiAgICAgIGlkZWEucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgaWRlYS5wcm9tb3RlZF9wb3N0X2lkID0gcG9zdC5pZDtcbiAgICAgIGxvZ0FjdGl2aXR5KCdwb3N0X3Byb21vdGVkJywgcG9zdC5pZCwgcG9zdC50aXRsZSwgJ1Byb21vdGVkIGZyb20gcmVzZWFyY2gnKTtcbiAgICAgIHNuYXBzaG90KCdQcm9tb3RlIGlkZWEnKTsgYnVpbGRNYXBzKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb3Blbk5ld1RvcGljTW9kYWwoKSB7XG4gICAgdmFyIGNvbG9ycyA9IFsnIzFhNzNlOCcsICcjN2MzYWVkJywgJyMwZDkwNGYnLCAnI2UzNzQwMCcsICcjZDkzMDI1JywgJyMwODkxYjInLCAnIzA1OTY2OScsICcjYmUxMjNjJ107XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1lZGl0b3ItZm9ybVwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPlRvcGljIE5hbWU8L2xhYmVsPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0XCIgZGF0YS1maWVsZD1cIm5hbWVcIiBwbGFjZWhvbGRlcj1cImUuZy4gUHJvZHVjdCBVcGRhdGVzXCI+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+RGVzY3JpcHRpb248L2xhYmVsPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0XCIgZGF0YS1maWVsZD1cImRlc2NyaXB0aW9uXCIgcGxhY2Vob2xkZXI9XCJXaGF0IHRoaXMgdG9waWMgcmVwcmVzZW50cy4uLlwiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkNvbG9yPC9sYWJlbD48ZGl2IGNsYXNzPVwic2NwLWNvbG9yLXBpY2tlclwiPic7XG4gICAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IGNvbG9ycy5sZW5ndGg7IGNpKyspIHtcbiAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtY29sb3Itc3dhdGNoJyArIChjaSA9PT0gMCA/ICcgc2NwLWNvbG9yLXN3YXRjaC1hY3RpdmUnIDogJycpICsgJ1wiIGRhdGEtYWN0aW9uPVwicGljay1jb2xvclwiIGRhdGEtY29sb3I9XCInICsgY29sb3JzW2NpXSArICdcIiBzdHlsZT1cImJhY2tncm91bmQ6JyArIGNvbG9yc1tjaV0gKyAnXCI+PC9idXR0b24+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBkYXRhLWZpZWxkPVwiY29sb3JcIiB2YWx1ZT1cIicgKyBjb2xvcnNbMF0gKyAnXCI+JztcbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj48L2Rpdj4nO1xuICAgIG9wZW5Nb2RhbCgnTmV3IFRvcGljJywgaHRtbCwge1xuICAgICAgc2F2ZUxhYmVsOiAnQ3JlYXRlIFRvcGljJyxcbiAgICAgIG9uU2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWVsZHMgPSBjb2xsZWN0TW9kYWxGaWVsZHMoKTtcbiAgICAgICAgaWYgKCFmaWVsZHMubmFtZSB8fCAhZmllbGRzLm5hbWUudHJpbSgpKSB7IHRvYXN0KCdUb3BpYyBuYW1lIGlzIHJlcXVpcmVkJywgJ3dhcm5pbmcnKTsgcmV0dXJuOyB9XG4gICAgICAgIHZhciB0b3BpYyA9IHsgaWQ6IGdlbmVyYXRlSWQoJ3RvcGljJyksIG5hbWU6IGZpZWxkcy5uYW1lLnRyaW0oKSwgY29sb3I6IGZpZWxkcy5jb2xvciB8fCBjb2xvcnNbMF0sIGRlc2NyaXB0aW9uOiBmaWVsZHMuZGVzY3JpcHRpb24gfHwgJycsIHNlcmllc0lkOiAnJywgY3JlYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH07XG4gICAgICAgIFMuZGF0YS50b3BpY3MgPSBTLmRhdGEudG9waWNzIHx8IFtdO1xuICAgICAgICBTLmRhdGEudG9waWNzLnB1c2godG9waWMpO1xuICAgICAgICBsb2dBY3Rpdml0eSgndG9waWNfY3JlYXRlZCcsICcnLCAnJywgJ0NyZWF0ZWQgdG9waWM6ICcgKyB0b3BpYy5uYW1lKTtcbiAgICAgICAgc25hcHNob3QoJ0NyZWF0ZSB0b3BpYycpOyBidWlsZE1hcHMoKTsgY2xvc2VNb2RhbCgpOyByZW5kZXIoKTsgc3luY1RvVGV4dGFyZWEoKTsgdG9hc3QoJ1RvcGljIFwiJyArIHRvcGljLm5hbWUgKyAnXCIgY3JlYXRlZCcsICdzdWNjZXNzJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBlZGl0VG9waWNNb2RhbCh0b3BpY0lkKSB7XG4gICAgdmFyIHRvcGljID0gUy50b3BpY01hcFt0b3BpY0lkXTsgaWYgKCF0b3BpYykgcmV0dXJuO1xuICAgIHZhciBjb2xvcnMgPSBbJyMxYTczZTgnLCAnIzdjM2FlZCcsICcjMGQ5MDRmJywgJyNlMzc0MDAnLCAnI2Q5MzAyNScsICcjMDg5MWIyJywgJyMwNTk2NjknLCAnI2JlMTIzYyddO1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtZWRpdG9yLWZvcm1cIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5Ub3BpYyBOYW1lPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJuYW1lXCIgdmFsdWU9XCInICsgZXNjKHRvcGljLm5hbWUpICsgJ1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkRlc2NyaXB0aW9uPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJkZXNjcmlwdGlvblwiIHZhbHVlPVwiJyArIGVzYyh0b3BpYy5kZXNjcmlwdGlvbiB8fCAnJykgKyAnXCI+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+Q29sb3I8L2xhYmVsPjxkaXYgY2xhc3M9XCJzY3AtY29sb3ItcGlja2VyXCI+JztcbiAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgY29sb3JzLmxlbmd0aDsgY2krKykge1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1jb2xvci1zd2F0Y2gnICsgKHRvcGljLmNvbG9yID09PSBjb2xvcnNbY2ldID8gJyBzY3AtY29sb3Itc3dhdGNoLWFjdGl2ZScgOiAnJykgKyAnXCIgZGF0YS1hY3Rpb249XCJwaWNrLWNvbG9yXCIgZGF0YS1jb2xvcj1cIicgKyBjb2xvcnNbY2ldICsgJ1wiIHN0eWxlPVwiYmFja2dyb3VuZDonICsgY29sb3JzW2NpXSArICdcIj48L2J1dHRvbj4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIGRhdGEtZmllbGQ9XCJjb2xvclwiIHZhbHVlPVwiJyArIGVzYyh0b3BpYy5jb2xvcikgKyAnXCI+JztcbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj48L2Rpdj4nO1xuICAgIG9wZW5Nb2RhbCgnRWRpdCBUb3BpYycsIGh0bWwsIHtcbiAgICAgIHNhdmVMYWJlbDogJ1NhdmUnLFxuICAgICAgb25TYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpZWxkcyA9IGNvbGxlY3RNb2RhbEZpZWxkcygpO1xuICAgICAgICBpZiAoIWZpZWxkcy5uYW1lIHx8ICFmaWVsZHMubmFtZS50cmltKCkpIHsgdG9hc3QoJ1RvcGljIG5hbWUgaXMgcmVxdWlyZWQnLCAnd2FybmluZycpOyByZXR1cm47IH1cbiAgICAgICAgdG9waWMubmFtZSA9IGZpZWxkcy5uYW1lLnRyaW0oKTsgdG9waWMuY29sb3IgPSBmaWVsZHMuY29sb3IgfHwgdG9waWMuY29sb3I7IHRvcGljLmRlc2NyaXB0aW9uID0gZmllbGRzLmRlc2NyaXB0aW9uIHx8ICcnO1xuICAgICAgICBsb2dBY3Rpdml0eSgndG9waWNfdXBkYXRlZCcsICcnLCAnJywgJ1VwZGF0ZWQgdG9waWM6ICcgKyB0b3BpYy5uYW1lKTtcbiAgICAgICAgc25hcHNob3QoJ0VkaXQgdG9waWMnKTsgYnVpbGRNYXBzKCk7IGNsb3NlTW9kYWwoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdUb3BpYyB1cGRhdGVkJywgJ3N1Y2Nlc3MnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlbGV0ZVRvcGljKHRvcGljSWQpIHtcbiAgICB2YXIgdG9waWMgPSBTLnRvcGljTWFwW3RvcGljSWRdOyBpZiAoIXRvcGljKSByZXR1cm47XG4gICAgb3BlbkNvbmZpcm1EaWFsb2coe1xuICAgICAgdGl0bGU6ICdEZWxldGUgVG9waWMnLCBtZXNzYWdlOiAnRGVsZXRlIFwiJyArIHRvcGljLm5hbWUgKyAnXCI/IFBvc3RzIHdpbGwgbG9zZSB0aGlzIHRvcGljLicsIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZScsIGRhbmdlcjogdHJ1ZSxcbiAgICAgIG9uQ29uZmlybTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFMuZGF0YS50b3BpY3MgPSAoUy5kYXRhLnRvcGljcyB8fCBbXSkuZmlsdGVyKGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQuaWQgIT09IHRvcGljSWQ7IH0pO1xuICAgICAgICAoUy5kYXRhLnBvc3RzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHApIHsgcC50b3BpY3MgPSAocC50b3BpY3MgfHwgW10pLmZpbHRlcihmdW5jdGlvbih0KSB7IHJldHVybiB0ICE9PSB0b3BpY0lkOyB9KTsgfSk7XG4gICAgICAgIGlmIChTLnNlbGVjdGVkVG9waWNJZCA9PT0gdG9waWNJZCkgUy5zZWxlY3RlZFRvcGljSWQgPSBudWxsO1xuICAgICAgICBsb2dBY3Rpdml0eSgndG9waWNfZGVsZXRlZCcsICcnLCAnJywgJ0RlbGV0ZWQgdG9waWM6ICcgKyB0b3BpYy5uYW1lKTtcbiAgICAgICAgc25hcHNob3QoJ0RlbGV0ZSB0b3BpYycpOyBidWlsZE1hcHMoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdUb3BpYyBkZWxldGVkJywgJ3N1Y2Nlc3MnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OUyA1LTEwOiBTVEVQIFJFTkRFUkVSUyBcdTIwMTQgZXh0cmFjdGVkICh2MC4zLjApXG4gIC8vICAgNSAgIEJhc2ljcyAgICAgLT4gc3JjL2VkaXRpbmcvc3RlcHMvYmFzaWNzLmpzXG4gIC8vICAgNiAgIFJlc2VhcmNoICAgLT4gc3JjL2VkaXRpbmcvc3RlcHMvcmVzZWFyY2guanNcbiAgLy8gICA3ICAgQ29udGVudCAgICAtPiBzcmMvZWRpdGluZy9zdGVwcy9jb250ZW50LmpzXG4gIC8vICAgOCAgIE1lZGlhICAgICAgLT4gc3JjL2VkaXRpbmcvc3RlcHMvbWVkaWEuanNcbiAgLy8gICA5ICAgUGxhdGZvcm1zICAtPiBzcmMvZWRpdGluZy9zdGVwcy9wbGF0Zm9ybXMuanNcbiAgLy8gICAxMCAgU2NoZWR1bGUgICAtPiBzcmMvZWRpdGluZy9zdGVwcy9zY2hlZHVsZS5qc1xuICAvLyBFYWNoIHN0ZXAgZmlsZSBzZWxmLXJlZ2lzdGVycyBpbnRvIHdpbmRvdy5fc2NwUmVuZGVyZXJzLnN0ZXBfWCBhdFxuICAvLyBpdHMgb3duIG1vZHVsZS1sb2FkIHRpbWUuIFRoZSBSLnN0ZXBfWCA9IC4uLiBsaW5lcyBwcmV2aW91c2x5IGF0IHRoZVxuICAvLyB0b3Agb2YgaW5pdFBhcnQyQSBhcmUgYWxzbyByZW1vdmVkIGluIHRoaXMgY29tbWl0LlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIHJlbmRlckJhc2ljc1N0ZXAgICAgPSB3aW5kb3cuX3NjcFJlbmRlckJhc2ljc1N0ZXA7XG4gIHZhciByZW5kZXJSZXNlYXJjaFN0ZXAgID0gd2luZG93Ll9zY3BSZW5kZXJSZXNlYXJjaFN0ZXA7XG4gIHZhciByZW5kZXJDb250ZW50U3RlcCAgID0gd2luZG93Ll9zY3BSZW5kZXJDb250ZW50U3RlcDtcbiAgdmFyIHJlbmRlck1lZGlhU3RlcCAgICAgPSB3aW5kb3cuX3NjcFJlbmRlck1lZGlhU3RlcDtcbiAgdmFyIHJlbmRlclBsYXRmb3Jtc1N0ZXAgPSB3aW5kb3cuX3NjcFJlbmRlclBsYXRmb3Jtc1N0ZXA7XG4gIHZhciByZW5kZXJTY2hlZHVsZVN0ZXAgID0gd2luZG93Ll9zY3BSZW5kZXJTY2hlZHVsZVN0ZXA7XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTE6IFNPQ0lBTCBDT01QT1NFUiBDT01QT05FTlRcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gcmVuZGVyU29jaWFsQ29tcG9zZXIoaWQsIGNvbnRlbnQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgY2hhckxpbWl0ID0gb3B0aW9ucy5jaGFyTGltaXQgfHwgMzAwMDtcbiAgICB2YXIgbGFiZWwgPSBvcHRpb25zLmxhYmVsIHx8ICdQb3N0JztcbiAgICB2YXIgY29sb3IgPSBvcHRpb25zLmNvbG9yIHx8ICd2YXIoLS1zY3AtcHJpbWFyeSknO1xuICAgIHZhciBjdXJyZW50Q2hhcnMgPSBjb3VudENoYXJzKGNvbnRlbnQpO1xuICAgIHZhciB3b3JkQ291bnQgPSBjb3VudFdvcmRzKGNvbnRlbnQpO1xuXG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3NlclwiIGRhdGEtY29tcG9zZXItaWQ9XCInICsgZXNjKGlkKSArICdcIj4nO1xuICAgIC8vIEhlYWRlclxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtY29tcG9zZXItaGVhZGVyXCIgc3R5bGU9XCJib3JkZXItY29sb3I6JyArIGNvbG9yICsgJzIwO2JhY2tncm91bmQ6JyArIGNvbG9yICsgJzA4XCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWNvbXBvc2VyLWlkZW50aXR5XCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWNvbXBvc2VyLWF2YXRhclwiIHN0eWxlPVwiYmFja2dyb3VuZDonICsgY29sb3IgKyAnXCI+JyArIGljb24ob3B0aW9ucy5wbGF0Zm9ybSA/IENvbnN0YW50cy5QTEFURk9STVNbb3B0aW9ucy5wbGF0Zm9ybV0uaWNvbiA6ICdwZW4tZmFuY3knKSArICc8L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXY+PGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1uYW1lXCI+JyArIGVzYygoUy5tZXRhLndvcmtzcGFjZSAmJiBTLm1ldGEud29ya3NwYWNlLm5hbWUpIHx8ICdCcmFuZCcpICsgJzwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1tZXRhXCI+JyArIGVzYyhsYWJlbCkgKyAnIFx1MjAyMiBEcmFmdDwvZGl2PjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1zdGF0c1wiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1jaGFyLWNvdW50XCI+JyArIGZvcm1hdENoYXJDb3VudChjdXJyZW50Q2hhcnMsIGNoYXJMaW1pdCkgKyAnPC9kaXY+JztcbiAgICBpZiAod29yZENvdW50ID4gMCkgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtY29tcG9zZXItd29yZC1jb3VudFwiPicgKyB3b3JkQ291bnQgKyAnIHdvcmRzPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgLy8gRWRpdC9QcmV2aWV3IHRvZ2dsZVxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtY29tcG9zZXItdGFic1wiPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1jb21wb3Nlci10YWIgc2NwLWNvbXBvc2VyLXRhYi1hY3RpdmVcIiBkYXRhLWFjdGlvbj1cImNvbXBvc2VyLW1vZGVcIiBkYXRhLW1vZGU9XCJlZGl0XCIgZGF0YS1jb21wb3Nlcj1cIicgKyBlc2MoaWQpICsgJ1wiPicgKyBpY29uKCdlZGl0JykgKyAnIEVkaXQ8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtY29tcG9zZXItdGFiXCIgZGF0YS1hY3Rpb249XCJjb21wb3Nlci1tb2RlXCIgZGF0YS1tb2RlPVwicHJldmlld1wiIGRhdGEtY29tcG9zZXI9XCInICsgZXNjKGlkKSArICdcIj4nICsgaWNvbignZXllJykgKyAnIFByZXZpZXc8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICAvLyBCb2R5IFx1MjAxNCBFZGl0IG1vZGUgKGRlZmF1bHQpXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1ib2R5IHNjcC1jb21wb3Nlci1lZGl0LW1vZGVcIiBkYXRhLWNvbXBvc2VyLXBhbmVsPVwiZWRpdC0nICsgZXNjKGlkKSArICdcIj4nO1xuICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBjbGFzcz1cInNjcC1jb21wb3Nlci10ZXh0YXJlYVwiIGRhdGEtY29tcG9zZXItaWQ9XCInICsgZXNjKGlkKSArICdcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgJyArIGVzYyhsYWJlbC50b0xvd2VyQ2FzZSgpKSArICcgaGVyZS4uLlxcblxcbkluY2x1ZGUgaG9vaywgYm9keSwgQ1RBLCBhbmQgaGFzaHRhZ3MgXHUyMDE0IGFsbCBpbiBvbmUgcGxhY2UuXCI+JyArIGVzYyhjb250ZW50KSArICc8L3RleHRhcmVhPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIEJvZHkgXHUyMDE0IFByZXZpZXcgbW9kZSAoaGlkZGVuIGJ5IGRlZmF1bHQpXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1ib2R5IHNjcC1jb21wb3Nlci1wcmV2aWV3LW1vZGVcIiBkYXRhLWNvbXBvc2VyLXBhbmVsPVwicHJldmlldy0nICsgZXNjKGlkKSArICdcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1wcmV2aWV3XCI+JztcbiAgICBpZiAoY29udGVudCAmJiBjb250ZW50LnRyaW0oKSkge1xuICAgICAgaHRtbCArPSBmb3JtYXRDb250ZW50Rm9yUHJldmlldyhjb250ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC1tdXRlZFwiPldyaXRlIGNvbnRlbnQgYWJvdmUgdG8gc2VlIHByZXZpZXc8L3NwYW4+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcblxuICAgIC8vIEZvb3RlciB0b29sYmFyXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb21wb3Nlci1mb290ZXJcIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtY29tcG9zZXItdG9vbHNcIj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtY29tcG9zZXItdG9vbFwiIHRpdGxlPVwiQm9sZFwiPicgKyBpY29uKCdib2xkJykgKyAnPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWNvbXBvc2VyLXRvb2xcIiB0aXRsZT1cIkl0YWxpY1wiPicgKyBpY29uKCdpdGFsaWMnKSArICc8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtY29tcG9zZXItdG9vbFwiIHRpdGxlPVwiRW1vamlcIj4nICsgaWNvbignZmFjZS1zbWlsZScpICsgJzwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1jb21wb3Nlci10b29sXCIgdGl0bGU9XCJIYXNodGFnXCI+JyArIGljb24oJ2hhc2h0YWcnKSArICc8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtY29tcG9zZXItdG9vbFwiIHRpdGxlPVwiTWVudGlvblwiPicgKyBpY29uKCdhdCcpICsgJzwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWNvbXBvc2VyLWFpLWJ0bnNcIj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tYWkgc2NwLWJ0bi1zbVwiIGRhdGEtYWN0aW9uPVwiYWktd3JpdGUtY29udGVudFwiIGRhdGEtY29tcG9zZXI9XCInICsgZXNjKGlkKSArICdcIj4nICsgaWNvbignc3BhcmtsZXMnKSArICcgQUkgV3JpdGU8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gKHdpbmRvdy5fc2NwQWlTZWwgPyB3aW5kb3cuX3NjcEFpU2VsKCdhaS13cml0ZS1jb250ZW50JykgOiAnJyk7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbSBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFpLWltcHJvdmUtY29udGVudFwiIGRhdGEtY29tcG9zZXI9XCInICsgZXNjKGlkKSArICdcIj5JbXByb3ZlPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxMjogVE9QSUMgSU5QVVQgQ09NUE9ORU5UXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHJlbmRlclRvcGljSW5wdXQodG9waWNJZHMsIHBvc3RJZCkge1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtdG9waWMtaW5wdXRcIiBkYXRhLXBvc3QtaWQ9XCInICsgZXNjKHBvc3RJZCB8fCAnJykgKyAnXCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXRvcGljLWNoaXBzXCI+JztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvcGljSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9waWMgPSByZXNvbHZlVG9waWModG9waWNJZHNbaV0pO1xuICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLXRvcGljLWlucHV0LWNoaXBcIiBzdHlsZT1cImJhY2tncm91bmQ6JyArIHRvcGljLmNvbG9yICsgJzE1O2NvbG9yOicgKyB0b3BpYy5jb2xvciArICc7Ym9yZGVyLWNvbG9yOicgKyB0b3BpYy5jb2xvciArICczMFwiPic7XG4gICAgICAgIGh0bWwgKz0gZXNjKHRvcGljLm5hbWUpICsgJyA8YnV0dG9uIGNsYXNzPVwic2NwLXRvcGljLXJlbW92ZVwiIGRhdGEtYWN0aW9uPVwicmVtb3ZlLXBvc3QtdG9waWNcIiBkYXRhLXRvcGljLWlkPVwiJyArIGVzYyh0b3BpYy5pZCkgKyAnXCIgZGF0YS1wb3N0LWlkPVwiJyArIGVzYyhwb3N0SWQpICsgJ1wiPiZ0aW1lczs8L2J1dHRvbj48L3NwYW4+JztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQWRkIHRvcGljIGRyb3Bkb3duXG4gICAgdmFyIGF2YWlsVG9waWNzID0gKFMuZGF0YS50b3BpY3MgfHwgW10pLmZpbHRlcihmdW5jdGlvbih0KSB7IHJldHVybiB0b3BpY0lkcy5pbmRleE9mKHQuaWQpIDwgMDsgfSk7XG4gICAgaWYgKGF2YWlsVG9waWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIGh0bWwgKz0gJzxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1zZWxlY3Qtc20gc2NwLXRvcGljLWFkZC1zZWxlY3RcIiBkYXRhLXBvc3QtaWQ9XCInICsgZXNjKHBvc3RJZCkgKyAnXCI+JztcbiAgICAgIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCJcIj4rIEFkZCB0b3BpYzwvb3B0aW9uPic7XG4gICAgICBmb3IgKHZhciBhaSA9IDA7IGFpIDwgYXZhaWxUb3BpY3MubGVuZ3RoOyBhaSsrKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGVzYyhhdmFpbFRvcGljc1thaV0uaWQpICsgJ1wiPicgKyBlc2MoYXZhaWxUb3BpY3NbYWldLm5hbWUpICsgJzwvb3B0aW9uPic7XG4gICAgICBodG1sICs9ICc8L3NlbGVjdD4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTIuNTogQUkgT1VUUFVUIFJFTkRFUkVSIEVOR0lORVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy9cbiAgLy8gVW5pdmVyc2FsIHN0cnVjdHVyZWQtb3V0cHV0IHJlbmRlcmVyOiB0YWtlcyBBSSBKU09OIGRhdGEgKyBhIHNjaGVtYVxuICAvLyBkZWZpbml0aW9uLCByZW5kZXJzIHZpc3VhbCBjYXJkcyB3aXRoIGV4cGFuZGFibGUgc2VjdGlvbnMsIGlubGluZVxuICAvLyBlZGl0aW5nLCBhbmQgbXVsdGktZm9ybWF0IGV4cG9ydC5cbiAgLy9cbiAgLy8gVXNlZCBieTogaW1hZ2UgdmlzdWFsIHBsYW5zLCB2aWRlbyBzY3JpcHRzLCBjYXJvdXNlbCBwbGFucy5cblxuICAvLyBcdTI1MDBcdTI1MDBcdTI1MDAgT1VUUFVUIFNDSEVNQVMgXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgdmFyIE9VVFBVVF9TQ0hFTUFTID0ge1xuICAgIGltYWdlX3Zpc3VhbF9wbGFuOiB7XG4gICAgICBpZDogJ2ltYWdlX3Zpc3VhbF9wbGFuJywgbGFiZWw6ICdWaXN1YWwgQ29udGVudCBQbGFuJywgaWNvbjogJ2ltYWdlJyxcbiAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgIHsga2V5OiAndmlzdWFsX2NvbmNlcHQnLCBsYWJlbDogJ1Zpc3VhbCBDb25jZXB0JywgaWNvbjogJ2V5ZScsIGNvbG9yOiAnIzFhNzNlOCcsIGV4cGFuZGVkOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1doYXQgdGhlIGF1ZGllbmNlIHNlZXMgYW5kIGZlZWxzJyxcbiAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgIHsga2V5OiAnc2NlbmUnLCBsYWJlbDogJ1NjZW5lIC8gU3ViamVjdCcsIHR5cGU6ICd0ZXh0YXJlYScsIHJvd3M6IDIsIHBsYWNlaG9sZGVyOiAnRGVzY3JpYmUgd2hhdCB0aGUgaW1hZ2Ugc2hvd3NcdTIwMjYnIH0sXG4gICAgICAgICAgICB7IGtleTogJ2Vtb3Rpb24nLCBsYWJlbDogJ0Vtb3Rpb24gLyBGZWVsaW5nJywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ1doYXQgZmVlbGluZyBzaG91bGQgdGhpcyBldm9rZT8nIH0sXG4gICAgICAgICAgICB7IGtleTogJ21lc3NhZ2VfZGVsaXZlcmVkJywgbGFiZWw6ICdDb3JlIE1lc3NhZ2UnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnV2hhdCBkb2VzIHRoZSB2aWV3ZXIgdGFrZSBhd2F5PycgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgeyBrZXk6ICd0ZXh0X292ZXJsYXlzJywgbGFiZWw6ICdUZXh0IG9uIEltYWdlJywgaWNvbjogJ2ZvbnQnLCBjb2xvcjogJyM3YzNhZWQnLCBleHBhbmRlZDogdHJ1ZSwgZGVzY3JpcHRpb246ICdUZXh0IHRoYXQgYXBwZWFycyBPTiB0aGUgaW1hZ2UnLFxuICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgeyBrZXk6ICdoZWFkbGluZScsIGxhYmVsOiAnSGVhZGxpbmUnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnUHJpbWFyeSB0ZXh0IG92ZXJsYXknIH0sXG4gICAgICAgICAgICB7IGtleTogJ3N1YnRleHQnLCBsYWJlbDogJ1N1YnRleHQnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnU3VwcG9ydGluZyB0ZXh0IChvcHRpb25hbCknIH0sXG4gICAgICAgICAgICB7IGtleTogJ2N0YScsIGxhYmVsOiAnQ1RBJywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ0NhbGwgdG8gYWN0aW9uIHRleHQnIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHsga2V5OiAnY29sb3JfbW9vZCcsIGxhYmVsOiAnQ29sb3IgJiBNb29kJywgaWNvbjogJ3BhbGV0dGUnLCBjb2xvcjogJyNlMzc0MDAnLCBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ3BhbGV0dGUnLCBsYWJlbDogJ0NvbG9yIFBhbGV0dGUnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnRG9taW5hbnQgY29sb3JzIGFuZCB0cmFuc2l0aW9ucycgfSxcbiAgICAgICAgICAgIHsga2V5OiAnbW9vZCcsIGxhYmVsOiAnTW9vZCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdPdmVyYWxsIGVtb3Rpb25hbCB0b25lJyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdjb250cmFzdCcsIGxhYmVsOiAnQ29udHJhc3QnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnQ29udHJhc3QgYXBwcm9hY2ggZm9yIHJlYWRhYmlsaXR5JyB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7IGtleTogJ2xheW91dCcsIGxhYmVsOiAnTGF5b3V0IERpcmVjdGlvbicsIGljb246ICdsYXlvdXQtZ3JpZCcsIGNvbG9yOiAnIzA4OTFiMicsIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgIHsga2V5OiAnY29tcG9zaXRpb24nLCBsYWJlbDogJ0NvbXBvc2l0aW9uJywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ0hvdyBlbGVtZW50cyBhcmUgYXJyYW5nZWQnIH0sXG4gICAgICAgICAgICB7IGtleTogJ2ZvY2FsX3BvaW50JywgbGFiZWw6ICdGb2NhbCBQb2ludCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdXaGVyZSB0aGUgZXllIGdvZXMgZmlyc3QnIH0sXG4gICAgICAgICAgICB7IGtleTogJ3RleHRfcGxhY2VtZW50JywgbGFiZWw6ICdUZXh0IFBsYWNlbWVudCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdXaGVyZSB0ZXh0IG92ZXJsYXlzIHNpdCcgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgeyBrZXk6ICdfbWV0YScsIGxhYmVsOiAnVGVjaG5pY2FsJywgaWNvbjogJ2dlYXInLCBjb2xvcjogJyM4MDg2OGInLCBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ3N0eWxlX25vdGVzJywgbGFiZWw6ICdTdHlsZSBOb3RlcycsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdPdmVyYWxsIHN0eWxlIGRpcmVjdGlvbicgfSxcbiAgICAgICAgICAgIHsga2V5OiAnZ2VuZXJhdGlvbl9wcm9tcHQnLCBsYWJlbDogJ0dlbmVyYXRpb24gUHJvbXB0JywgdHlwZTogJ3RleHRhcmVhJywgcm93czogNCwgcGxhY2Vob2xkZXI6ICdUZWNobmljYWwgcHJvbXB0IGZvciBBSSBpbWFnZSBnZW5lcmF0b3JzJywgbW9ubzogdHJ1ZSB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgZXhwb3J0czogWydwbGFpbicsICdqc29uJywgJ21hcmtkb3duJ11cbiAgICB9LFxuXG4gICAgdmlkZW9fc2NyaXB0OiB7XG4gICAgICBpZDogJ3ZpZGVvX3NjcmlwdCcsIGxhYmVsOiAnVmlkZW8gU2NyaXB0JywgaWNvbjogJ3ZpZGVvJyxcbiAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgIHsga2V5OiAnaG9vaycsIGxhYmVsOiAnSG9vaycsIGljb246ICdib2x0JywgY29sb3I6ICcjZDkzMDI1JywgZXhwYW5kZWQ6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHNjcm9sbC1zdG9wcGluZyBvcGVuaW5nJyxcbiAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgIHsga2V5OiAndm9pY2VvdmVyJywgbGFiZWw6ICdWb2ljZW92ZXInLCB0eXBlOiAndGV4dGFyZWEnLCByb3dzOiAyLCBwbGFjZWhvbGRlcjogJ1Nwb2tlbiB3b3Jkc1x1MjAyNicgfSxcbiAgICAgICAgICAgIHsga2V5OiAndmlzdWFsJywgbGFiZWw6ICdWaXN1YWwgLyBTaG90JywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ1doYXQgdGhlIHZpZXdlciBzZWVzJyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdvbl9zY3JlZW5fdGV4dCcsIGxhYmVsOiAnT24tU2NyZWVuIFRleHQnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnVGV4dCBvdmVybGF5JyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdkdXJhdGlvbl9zZWNvbmRzJywgbGFiZWw6ICdEdXJhdGlvbicsIHR5cGU6ICdudW1iZXInLCBzdWZmaXg6ICdzJywgcGxhY2Vob2xkZXI6ICczJyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdhbmFseXNpcycsIGxhYmVsOiAnSG9vayBBbmFseXNpcycsIHR5cGU6ICd0ZXh0YXJlYScsIHJvd3M6IDIsIHBsYWNlaG9sZGVyOiAnV2h5IHRoaXMgb3BlbmluZyB3b3Jrc1x1MjAyNicsIG11dGVkOiB0cnVlIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHsga2V5OiAnYm9keScsIGxhYmVsOiAnTWFpbiBCb2R5JywgaWNvbjogJ3Blbi1mYW5jeScsIGNvbG9yOiAnIzFhNzNlOCcsIGV4cGFuZGVkOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBjb3JlIGNvbnRlbnQgc2VjdGlvbnMnLCBpc0xpc3Q6IHRydWUsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ3NlY3Rpb24nLCBsYWJlbDogJ1NlY3Rpb24gTmFtZScsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdlLmcuIFByb2JsZW0sIFNvbHV0aW9uLCBQcm9vZicgfSxcbiAgICAgICAgICAgIHsga2V5OiAndm9pY2VvdmVyJywgbGFiZWw6ICdWb2ljZW92ZXInLCB0eXBlOiAndGV4dGFyZWEnLCByb3dzOiAyLCBwbGFjZWhvbGRlcjogJ1Nwb2tlbiB3b3Jkc1x1MjAyNicgfSxcbiAgICAgICAgICAgIHsga2V5OiAndmlzdWFsJywgbGFiZWw6ICdWaXN1YWwgLyBTaG90JywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ1doYXQgdGhlIHZpZXdlciBzZWVzJyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdvbl9zY3JlZW5fdGV4dCcsIGxhYmVsOiAnT24tU2NyZWVuIFRleHQnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnVGV4dCBvdmVybGF5JyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdkdXJhdGlvbl9zZWNvbmRzJywgbGFiZWw6ICdEdXJhdGlvbicsIHR5cGU6ICdudW1iZXInLCBzdWZmaXg6ICdzJywgcGxhY2Vob2xkZXI6ICcxMCcgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgeyBrZXk6ICdvdXRybycsIGxhYmVsOiAnT3V0cm8gJiBDVEEnLCBpY29uOiAncm9ja2V0JywgY29sb3I6ICcjMGQ5MDRmJywgZXhwYW5kZWQ6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGNsb3NpbmcgYW5kIGNhbGwgdG8gYWN0aW9uJyxcbiAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgIHsga2V5OiAndm9pY2VvdmVyJywgbGFiZWw6ICdWb2ljZW92ZXInLCB0eXBlOiAndGV4dGFyZWEnLCByb3dzOiAyLCBwbGFjZWhvbGRlcjogJ0Nsb3Npbmcgd29yZHNcdTIwMjYnIH0sXG4gICAgICAgICAgICB7IGtleTogJ3Zpc3VhbCcsIGxhYmVsOiAnVmlzdWFsIC8gU2hvdCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdDbG9zaW5nIHZpc3VhbCcgfSxcbiAgICAgICAgICAgIHsga2V5OiAnb25fc2NyZWVuX3RleHQnLCBsYWJlbDogJ09uLVNjcmVlbiBUZXh0JywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ0ZpbmFsIHRleHQgb3ZlcmxheScgfSxcbiAgICAgICAgICAgIHsga2V5OiAnY3RhJywgbGFiZWw6ICdDVEEnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnZS5nLiBGb2xsb3cgKyBTYXZlJyB9LFxuICAgICAgICAgICAgeyBrZXk6ICdkdXJhdGlvbl9zZWNvbmRzJywgbGFiZWw6ICdEdXJhdGlvbicsIHR5cGU6ICdudW1iZXInLCBzdWZmaXg6ICdzJywgcGxhY2Vob2xkZXI6ICc1JyB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7IGtleTogJ19zdW1tYXJ5JywgbGFiZWw6ICdTdW1tYXJ5JywgaWNvbjogJ2luZm8nLCBjb2xvcjogJyM4MDg2OGInLCBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ3RvdGFsX2R1cmF0aW9uJywgbGFiZWw6ICdUb3RhbCBEdXJhdGlvbicsIHR5cGU6ICdudW1iZXInLCBzdWZmaXg6ICdzJywgcmVhZE9ubHk6IHRydWUgfSxcbiAgICAgICAgICAgIHsga2V5OiAnbXVzaWNfc3VnZ2VzdGlvbicsIGxhYmVsOiAnTXVzaWMgLyBTb3VuZCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdNdXNpYyBtb29kIHN1Z2dlc3Rpb24nIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBleHBvcnRzOiBbJ3BsYWluJywgJ2pzb24nLCAnbWFya2Rvd24nLCAndm9pY2VvdmVyJ11cbiAgICB9LFxuXG4gICAgY2Fyb3VzZWxfdmlzdWFsX3BsYW46IHtcbiAgICAgIGlkOiAnY2Fyb3VzZWxfdmlzdWFsX3BsYW4nLCBsYWJlbDogJ0Nhcm91c2VsIFZpc3VhbCBQbGFuJywgaWNvbjogJ2ltYWdlcycsXG4gICAgICBpc1NlcXVlbmNlOiB0cnVlLCBzZXF1ZW5jZUxhYmVsOiAnU2xpZGUnLFxuICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgeyBrZXk6ICd2aXN1YWxfY29uY2VwdCcsIGxhYmVsOiAnVmlzdWFsIENvbmNlcHQnLCBpY29uOiAnZXllJywgY29sb3I6ICcjMWE3M2U4JywgZXhwYW5kZWQ6IHRydWUsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ3NjZW5lJywgbGFiZWw6ICdTY2VuZSAvIFN1YmplY3QnLCB0eXBlOiAndGV4dGFyZWEnLCByb3dzOiAyLCBwbGFjZWhvbGRlcjogJ1doYXQgdGhpcyBzbGlkZSBzaG93c1x1MjAyNicgfSxcbiAgICAgICAgICAgIHsga2V5OiAnbWVzc2FnZV9kZWxpdmVyZWQnLCBsYWJlbDogJ1NsaWRlIE1lc3NhZ2UnLCB0eXBlOiAndGV4dCcsIHBsYWNlaG9sZGVyOiAnV2hhdCB0aGlzIHNsaWRlIGNvbW11bmljYXRlcycgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgeyBrZXk6ICd0ZXh0X292ZXJsYXlzJywgbGFiZWw6ICdUZXh0IG9uIFNsaWRlJywgaWNvbjogJ2ZvbnQnLCBjb2xvcjogJyM3YzNhZWQnLCBleHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgIHsga2V5OiAnaGVhZGxpbmUnLCBsYWJlbDogJ0hlYWRsaW5lJywgdHlwZTogJ3RleHQnLCBwbGFjZWhvbGRlcjogJ1ByaW1hcnkgdGV4dCcgfSxcbiAgICAgICAgICAgIHsga2V5OiAnc3VidGV4dCcsIGxhYmVsOiAnU3VidGV4dCcsIHR5cGU6ICd0ZXh0JywgcGxhY2Vob2xkZXI6ICdTdXBwb3J0aW5nIHRleHQnIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHsga2V5OiAnX21ldGEnLCBsYWJlbDogJ1N0eWxlJywgaWNvbjogJ3BhbGV0dGUnLCBjb2xvcjogJyM4MDg2OGInLCBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICB7IGtleTogJ2dlbmVyYXRpb25fcHJvbXB0JywgbGFiZWw6ICdHZW5lcmF0aW9uIFByb21wdCcsIHR5cGU6ICd0ZXh0YXJlYScsIHJvd3M6IDMsIG1vbm86IHRydWUgfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIGV4cG9ydHM6IFsncGxhaW4nLCAnanNvbicsICdtYXJrZG93biddXG4gICAgfVxuICB9O1xuXG4gIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBNQUlOIFJFTkRFUkVSIFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIGEgc3RydWN0dXJlZCBBSSBvdXRwdXQgYXMgdmlzdWFsIGNhcmRzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBcdTIwMTQgVGhlIHBhcnNlZCBBSSBKU09OIGRhdGFcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjaGVtYUlkIFx1MjAxNCBLZXkgaW50byBPVVRQVVRfU0NIRU1BU1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBcdTIwMTQgeyBvdXRwdXRJZCwgcG9zdElkLCByZWFkT25seSwgb25TYXZlKHBhdGgsIHZhbHVlKSB9XG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IEhUTUxcbiAgICovXG4gIGZ1bmN0aW9uIHJlbmRlclN0cnVjdHVyZWRPdXRwdXQoZGF0YSwgc2NoZW1hSWQsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2NoZW1hID0gT1VUUFVUX1NDSEVNQVNbc2NoZW1hSWRdO1xuICAgIGlmICghc2NoZW1hIHx8ICFkYXRhKSByZXR1cm4gJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUgc2NwLWVtcHR5LXN0YXRlLS1jb21wYWN0XCI+PHA+Tm8gc3RydWN0dXJlZCBkYXRhIGF2YWlsYWJsZS48L3A+PC9kaXY+JztcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgb2lkID0gb3B0aW9ucy5vdXRwdXRJZCB8fCBnZW5lcmF0ZUlkKCdhaW8nKTtcbiAgICB2YXIgcmVhZE9ubHkgPSAhIW9wdGlvbnMucmVhZE9ubHk7XG5cbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLWFpb1wiIGRhdGEtYWlvLWlkPVwiJyArIGVzYyhvaWQpICsgJ1wiIGRhdGEtc2NoZW1hPVwiJyArIGVzYyhzY2hlbWFJZCkgKyAnXCIgZGF0YS1wb3N0LWlkPVwiJyArIGVzYyhvcHRpb25zLnBvc3RJZCB8fCAnJykgKyAnXCI+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBFeHBvcnQgdG9vbGJhciBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBodG1sICs9IHJlbmRlckV4cG9ydFRvb2xiYXIoZGF0YSwgc2NoZW1hLCBvaWQpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIFNlcXVlbmNlIG1vZGUgKGNhcm91c2VsOiBhcnJheSBvZiBpdGVtcywgZWFjaCB3aXRoIHNlY3Rpb25zKSBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBpZiAoc2NoZW1hLmlzU2VxdWVuY2UgJiYgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgZm9yICh2YXIgc2kgPSAwOyBzaSA8IGRhdGEubGVuZ3RoOyBzaSsrKSB7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLXNlcXVlbmNlLWl0ZW1cIiBkYXRhLXNlcS1pbmRleD1cIicgKyBzaSArICdcIj4nO1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1zZXF1ZW5jZS1oZWFkZXJcIj4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haW8tc2VxdWVuY2UtbnVtXCI+JyArIChzaSArIDEpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haW8tc2VxdWVuY2UtbGFiZWxcIj4nICsgZXNjKHNjaGVtYS5zZXF1ZW5jZUxhYmVsIHx8ICdJdGVtJykgKyAnICcgKyAoc2kgKyAxKSArICc8L3NwYW4+JztcbiAgICAgICAgaWYgKGRhdGFbc2ldLnRleHRfb3ZlcmxheXMgJiYgZGF0YVtzaV0udGV4dF9vdmVybGF5cy5oZWFkbGluZSkgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC1zbSBzY3AtdGV4dC1tdXRlZFwiPiBcdTIwMTQgJyArIGVzYyh0cnVuY2F0ZShkYXRhW3NpXS50ZXh0X292ZXJsYXlzLmhlYWRsaW5lLCA0MCkpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICBodG1sICs9IHJlbmRlclNlY3Rpb25zRm9ySXRlbShkYXRhW3NpXSwgc2NoZW1hLnNlY3Rpb25zLCBvaWQgKyAnX3MnICsgc2ksIHJlYWRPbmx5KTtcbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIFNpbmdsZSBpdGVtIG1vZGUgKGltYWdlIHBsYW4sIHZpZGVvIHNjcmlwdCkgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgZWxzZSB7XG4gICAgICBodG1sICs9IHJlbmRlclNlY3Rpb25zRm9ySXRlbShkYXRhLCBzY2hlbWEuc2VjdGlvbnMsIG9pZCwgcmVhZE9ubHkpO1xuICAgIH1cblxuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTZWN0aW9uc0Zvckl0ZW0oZGF0YSwgc2VjdGlvbnMsIHBhdGhQcmVmaXgsIHJlYWRPbmx5KSB7XG4gICAgdmFyIGh0bWwgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjID0gc2VjdGlvbnNbaV07XG4gICAgICB2YXIgc2VjUGF0aCA9IHBhdGhQcmVmaXggKyAnLicgKyBzZWMua2V5O1xuICAgICAgdmFyIHNlY0RhdGEgPSAoc2VjLmtleSA9PT0gJ19tZXRhJyB8fCBzZWMua2V5ID09PSAnX3N1bW1hcnknKSA/IGRhdGEgOiAoZGF0YVtzZWMua2V5XSB8fCB7fSk7XG4gICAgICB2YXIgaXNFeHBhbmRlZCA9IHNlYy5leHBhbmRlZCAhPT0gZmFsc2U7XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBMaXN0IHNlY3Rpb25zICh2aWRlbyBib2R5IFx1MjAxNCBhcnJheSBvZiBzdWItaXRlbXMpIFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgICAgaWYgKHNlYy5pc0xpc3QgJiYgQXJyYXkuaXNBcnJheShzZWNEYXRhKSkge1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1zZWN0aW9uIHNjcC1haW8tc2VjdGlvbi1saXN0XCIgZGF0YS1zZWN0aW9uPVwiJyArIGVzYyhzZWMua2V5KSArICdcIj4nO1xuICAgICAgICBodG1sICs9IHJlbmRlclNlY3Rpb25IZWFkZXIoc2VjLCBpc0V4cGFuZGVkLCBzZWNEYXRhLmxlbmd0aCArICcgc2VjdGlvbicgKyAoc2VjRGF0YS5sZW5ndGggIT09IDEgPyAncycgOiAnJykpO1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1zZWN0aW9uLWJvZHknICsgKGlzRXhwYW5kZWQgPyAnJyA6ICcgc2NwLWFpby1jb2xsYXBzZWQnKSArICdcIiBkYXRhLWFpby1ib2R5PVwiJyArIGVzYyhzZWNQYXRoKSArICdcIj4nO1xuICAgICAgICBmb3IgKHZhciBsaSA9IDA7IGxpIDwgc2VjRGF0YS5sZW5ndGg7IGxpKyspIHtcbiAgICAgICAgICB2YXIgaXRlbUxhYmVsID0gc2VjRGF0YVtsaV0uc2VjdGlvbiB8fCAoc2VjLmxhYmVsICsgJyAnICsgKGxpICsgMSkpO1xuICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLWxpc3QtY2FyZFwiIGRhdGEtbGlzdC1pbmRleD1cIicgKyBsaSArICdcIj4nO1xuICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLWxpc3QtY2FyZC1oZWFkZXJcIiBkYXRhLWFjdGlvbj1cImFpby10b2dnbGUtbGlzdC1pdGVtXCIgZGF0YS1wYXRoPVwiJyArIGVzYyhzZWNQYXRoICsgJy4nICsgbGkpICsgJ1wiPic7XG4gICAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtYWlvLWxpc3QtbnVtXCI+JyArIChsaSArIDEpICsgJzwvc3Bhbj4nO1xuICAgICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWFpby1saXN0LWxhYmVsXCI+JyArIGVzYyhpdGVtTGFiZWwpICsgJzwvc3Bhbj4nO1xuICAgICAgICAgIGlmIChzZWNEYXRhW2xpXS5kdXJhdGlvbl9zZWNvbmRzKSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haW8tZHVyYXRpb25cIj4nICsgc2VjRGF0YVtsaV0uZHVyYXRpb25fc2Vjb25kcyArICdzPC9zcGFuPic7XG4gICAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtYWlvLWNoZXZyb25cIj4nICsgaWNvbignY2hldnJvbi1kb3duJykgKyAnPC9zcGFuPic7XG4gICAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1saXN0LWNhcmQtYm9keVwiPic7XG4gICAgICAgICAgaHRtbCArPSByZW5kZXJGaWVsZFNldChzZWMuZmllbGRzLCBzZWNEYXRhW2xpXSwgc2VjUGF0aCArICcuJyArIGxpLCByZWFkT25seSk7XG4gICAgICAgICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcbiAgICAgICAgfVxuICAgICAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIFN0YW5kYXJkIHNlY3Rpb24gKG9iamVjdCB3aXRoIGZpZWxkcykgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1zZWN0aW9uXCIgZGF0YS1zZWN0aW9uPVwiJyArIGVzYyhzZWMua2V5KSArICdcIj4nO1xuICAgICAgaHRtbCArPSByZW5kZXJTZWN0aW9uSGVhZGVyKHNlYywgaXNFeHBhbmRlZCwgbnVsbCk7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1zZWN0aW9uLWJvZHknICsgKGlzRXhwYW5kZWQgPyAnJyA6ICcgc2NwLWFpby1jb2xsYXBzZWQnKSArICdcIiBkYXRhLWFpby1ib2R5PVwiJyArIGVzYyhzZWNQYXRoKSArICdcIj4nO1xuICAgICAgaWYgKHNlYy5kZXNjcmlwdGlvbikgaHRtbCArPSAnPHAgY2xhc3M9XCJzY3AtYWlvLXNlY3Rpb24tZGVzY1wiPicgKyBlc2Moc2VjLmRlc2NyaXB0aW9uKSArICc8L3A+JztcbiAgICAgIGh0bWwgKz0gcmVuZGVyRmllbGRTZXQoc2VjLmZpZWxkcywgc2VjRGF0YSwgc2VjUGF0aCwgcmVhZE9ubHkpO1xuICAgICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTZWN0aW9uSGVhZGVyKHNlYywgaXNFeHBhbmRlZCwgYmFkZ2VfdGV4dCkge1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLXNlY3Rpb24taGVhZGVyXCIgZGF0YS1hY3Rpb249XCJhaW8tdG9nZ2xlLXNlY3Rpb25cIiBkYXRhLXNlY3Rpb249XCInICsgZXNjKHNlYy5rZXkpICsgJ1wiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haW8tc2VjdGlvbi10aXRsZVwiPic7XG4gICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtYWlvLXNlY3Rpb24taWNvblwiIHN0eWxlPVwiY29sb3I6JyArIChzZWMuY29sb3IgfHwgJ3ZhcigtLXNjcC1wcmltYXJ5KScpICsgJ1wiPicgKyBpY29uKHNlYy5pY29uIHx8ICdjaXJjbGUnKSArICc8L3NwYW4+JztcbiAgICBodG1sICs9ICc8c3Ryb25nPicgKyBlc2Moc2VjLmxhYmVsKSArICc8L3N0cm9uZz4nO1xuICAgIGlmIChiYWRnZV90ZXh0KSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haW8tc2VjdGlvbi1iYWRnZVwiPicgKyBlc2MoYmFkZ2VfdGV4dCkgKyAnPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1haW8tY2hldnJvblwiPicgKyBpY29uKGlzRXhwYW5kZWQgPyAnY2hldnJvbi11cCcgOiAnY2hldnJvbi1kb3duJykgKyAnPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckZpZWxkU2V0KGZpZWxkcywgZGF0YSwgcGF0aFByZWZpeCwgcmVhZE9ubHkpIHtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1maWVsZHNcIj4nO1xuICAgIGZvciAodmFyIGZpID0gMDsgZmkgPCBmaWVsZHMubGVuZ3RoOyBmaSsrKSB7XG4gICAgICB2YXIgZmllbGQgPSBmaWVsZHNbZmldO1xuICAgICAgdmFyIHZhbHVlID0gZGF0YSA/IChkYXRhW2ZpZWxkLmtleV0gIT09IHVuZGVmaW5lZCA/IGRhdGFbZmllbGQua2V5XSA6ICcnKSA6ICcnO1xuICAgICAgdmFyIGZpZWxkUGF0aCA9IHBhdGhQcmVmaXggKyAnLicgKyBmaWVsZC5rZXk7XG5cbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLWZpZWxkJyArIChmaWVsZC5tdXRlZCA/ICcgc2NwLWFpby1maWVsZC1tdXRlZCcgOiAnJykgKyAnXCIgZGF0YS1maWVsZC1rZXk9XCInICsgZXNjKGZpZWxkLmtleSkgKyAnXCI+JztcbiAgICAgIGh0bWwgKz0gJzxsYWJlbCBjbGFzcz1cInNjcC1haW8tZmllbGQtbGFiZWxcIj4nICsgZXNjKGZpZWxkLmxhYmVsKTtcbiAgICAgIGlmIChmaWVsZC5zdWZmaXgpIGh0bWwgKz0gJyA8c3BhbiBjbGFzcz1cInNjcC1haW8tZmllbGQtc3VmZml4XCI+KCcgKyBlc2MoZmllbGQuc3VmZml4KSArICcpPC9zcGFuPic7XG4gICAgICBodG1sICs9ICc8L2xhYmVsPic7XG5cbiAgICAgIGlmIChyZWFkT25seSB8fCBmaWVsZC5yZWFkT25seSkge1xuICAgICAgICAvLyBSZWFkLW9ubHkgZGlzcGxheVxuICAgICAgICBpZiAoZmllbGQudHlwZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWlvLWZpZWxkLXZhbHVlIHNjcC1haW8tZmllbGQtdmFsdWUtbXVsdGlcIj4nICsgKHZhbHVlID8gZXNjKFN0cmluZyh2YWx1ZSkpLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpIDogJzxzcGFuIGNsYXNzPVwic2NwLXRleHQtbXV0ZWRcIj5cdTIwMTQ8L3NwYW4+JykgKyAnPC9kaXY+JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1maWVsZC12YWx1ZVwiPicgKyAodmFsdWUgPyBlc2MoU3RyaW5nKHZhbHVlKSkgKyAoZmllbGQuc3VmZml4ID8gJyAnICsgZXNjKGZpZWxkLnN1ZmZpeCkgOiAnJykgOiAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC1tdXRlZFwiPlx1MjAxNDwvc3Bhbj4nKSArICc8L2Rpdj4nO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFZGl0YWJsZSBmaWVsZFxuICAgICAgICBpZiAoZmllbGQudHlwZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBjbGFzcz1cInNjcC1haW8taW5wdXQgc2NwLWFpby10ZXh0YXJlYScgKyAoZmllbGQubW9ubyA/ICcgc2NwLWFpby1tb25vJyA6ICcnKSArICdcIiBkYXRhLWFpby1wYXRoPVwiJyArIGVzYyhmaWVsZFBhdGgpICsgJ1wiIHJvd3M9XCInICsgKGZpZWxkLnJvd3MgfHwgMikgKyAnXCIgcGxhY2Vob2xkZXI9XCInICsgZXNjKGZpZWxkLnBsYWNlaG9sZGVyIHx8ICcnKSArICdcIj4nICsgZXNjKFN0cmluZyh2YWx1ZSkpICsgJzwvdGV4dGFyZWE+JztcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZC50eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwibnVtYmVyXCIgY2xhc3M9XCJzY3AtYWlvLWlucHV0IHNjcC1haW8taW5wdXQtbnVtYmVyXCIgZGF0YS1haW8tcGF0aD1cIicgKyBlc2MoZmllbGRQYXRoKSArICdcIiB2YWx1ZT1cIicgKyBlc2MoU3RyaW5nKHZhbHVlKSkgKyAnXCIgcGxhY2Vob2xkZXI9XCInICsgZXNjKGZpZWxkLnBsYWNlaG9sZGVyIHx8ICcnKSArICdcIj4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWFpby1pbnB1dFwiIGRhdGEtYWlvLXBhdGg9XCInICsgZXNjKGZpZWxkUGF0aCkgKyAnXCIgdmFsdWU9XCInICsgZXNjKFN0cmluZyh2YWx1ZSkpICsgJ1wiIHBsYWNlaG9sZGVyPVwiJyArIGVzYyhmaWVsZC5wbGFjZWhvbGRlciB8fCAnJykgKyAnXCI+JztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBFWFBPUlQgVE9PTEJBUiBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBmdW5jdGlvbiByZW5kZXJFeHBvcnRUb29sYmFyKGRhdGEsIHNjaGVtYSwgb2lkKSB7XG4gICAgdmFyIGV4cG9ydHMgPSBzY2hlbWEuZXhwb3J0cyB8fCBbJ3BsYWluJywgJ2pzb24nXTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLWFpby1leHBvcnQtdG9vbGJhclwiIGRhdGEtYWlvLWlkPVwiJyArIGVzYyhvaWQpICsgJ1wiPic7XG4gICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtYWlvLWV4cG9ydC1sYWJlbFwiPicgKyBpY29uKCdkb3dubG9hZCcpICsgJyBFeHBvcnQ6PC9zcGFuPic7XG4gICAgaWYgKGV4cG9ydHMuaW5kZXhPZigncGxhaW4nKSA+IC0xKSBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWlvLWV4cG9ydFwiIGRhdGEtZm9ybWF0PVwicGxhaW5cIiBkYXRhLWFpby1pZD1cIicgKyBlc2Mob2lkKSArICdcIj5QbGFpbiBUZXh0PC9idXR0b24+JztcbiAgICBpZiAoZXhwb3J0cy5pbmRleE9mKCdqc29uJykgPiAtMSkgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbSBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFpby1leHBvcnRcIiBkYXRhLWZvcm1hdD1cImpzb25cIiBkYXRhLWFpby1pZD1cIicgKyBlc2Mob2lkKSArICdcIj5KU09OPC9idXR0b24+JztcbiAgICBpZiAoZXhwb3J0cy5pbmRleE9mKCdtYXJrZG93bicpID4gLTEpIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tc20gc2NwLWJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhaW8tZXhwb3J0XCIgZGF0YS1mb3JtYXQ9XCJtYXJrZG93blwiIGRhdGEtYWlvLWlkPVwiJyArIGVzYyhvaWQpICsgJ1wiPk1hcmtkb3duPC9idXR0b24+JztcbiAgICBpZiAoZXhwb3J0cy5pbmRleE9mKCd2b2ljZW92ZXInKSA+IC0xKSBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWlvLWV4cG9ydFwiIGRhdGEtZm9ybWF0PVwidm9pY2VvdmVyXCIgZGF0YS1haW8taWQ9XCInICsgZXNjKG9pZCkgKyAnXCI+JyArIGljb24oJ3BsYXknKSArICcgVm9pY2VvdmVyIE9ubHk8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICAvLyBcdTI1MDBcdTI1MDBcdTI1MDAgRVhQT1JUIEZPUk1BVFRFUlMgXHUyNTAwXHUyNTAwXHUyNTAwXG5cbiAgZnVuY3Rpb24gZXhwb3J0U3RydWN0dXJlZE91dHB1dChkYXRhLCBzY2hlbWFJZCwgZm9ybWF0KSB7XG4gICAgdmFyIHNjaGVtYSA9IE9VVFBVVF9TQ0hFTUFTW3NjaGVtYUlkXTtcbiAgICBpZiAoIXNjaGVtYSB8fCAhZGF0YSkgcmV0dXJuICcnO1xuICAgIHN3aXRjaChmb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2pzb24nOiByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG4gICAgICBjYXNlICdtYXJrZG93bic6IHJldHVybiBfZXhwb3J0TWFya2Rvd24oZGF0YSwgc2NoZW1hKTtcbiAgICAgIGNhc2UgJ3ZvaWNlb3Zlcic6IHJldHVybiBfZXhwb3J0Vm9pY2VvdmVyKGRhdGEsIHNjaGVtYSk7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gX2V4cG9ydFBsYWluVGV4dChkYXRhLCBzY2hlbWEpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9leHBvcnRQbGFpblRleHQoZGF0YSwgc2NoZW1hKSB7XG4gICAgdmFyIGxpbmVzID0gW107XG4gICAgaWYgKHNjaGVtYS5pc1NlcXVlbmNlICYmIEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIGZvciAodmFyIHNpID0gMDsgc2kgPCBkYXRhLmxlbmd0aDsgc2krKykge1xuICAgICAgICBsaW5lcy5wdXNoKCctLS0gJyArIChzY2hlbWEuc2VxdWVuY2VMYWJlbCB8fCAnSXRlbScpICsgJyAnICsgKHNpICsgMSkgKyAnIC0tLScpO1xuICAgICAgICBfZmxhdHRlblNlY3Rpb25zKGRhdGFbc2ldLCBzY2hlbWEuc2VjdGlvbnMsIGxpbmVzLCAnJyk7XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfZmxhdHRlblNlY3Rpb25zKGRhdGEsIHNjaGVtYS5zZWN0aW9ucywgbGluZXMsICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpLnRyaW0oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9mbGF0dGVuU2VjdGlvbnMoZGF0YSwgc2VjdGlvbnMsIGxpbmVzLCBpbmRlbnQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjID0gc2VjdGlvbnNbaV07XG4gICAgICB2YXIgc2VjRGF0YSA9IChzZWMua2V5ID09PSAnX21ldGEnIHx8IHNlYy5rZXkgPT09ICdfc3VtbWFyeScpID8gZGF0YSA6IChkYXRhW3NlYy5rZXldIHx8IHt9KTtcbiAgICAgIGlmIChzZWMuaXNMaXN0ICYmIEFycmF5LmlzQXJyYXkoc2VjRGF0YSkpIHtcbiAgICAgICAgbGluZXMucHVzaChpbmRlbnQgKyBzZWMubGFiZWwudG9VcHBlckNhc2UoKSArICc6Jyk7XG4gICAgICAgIGZvciAodmFyIGxpID0gMDsgbGkgPCBzZWNEYXRhLmxlbmd0aDsgbGkrKykge1xuICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50ICsgJyAgWycgKyAoc2VjRGF0YVtsaV0uc2VjdGlvbiB8fCBzZWMubGFiZWwgKyAnICcgKyAobGkgKyAxKSkgKyAnXScpO1xuICAgICAgICAgIF9mbGF0dGVuRmllbGRzKHNlYy5maWVsZHMsIHNlY0RhdGFbbGldLCBsaW5lcywgaW5kZW50ICsgJyAgJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmVzLnB1c2goaW5kZW50ICsgc2VjLmxhYmVsLnRvVXBwZXJDYXNlKCkgKyAnOicpO1xuICAgICAgICBfZmxhdHRlbkZpZWxkcyhzZWMuZmllbGRzLCBzZWNEYXRhLCBsaW5lcywgaW5kZW50ICsgJyAgJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2ZsYXR0ZW5GaWVsZHMoZmllbGRzLCBkYXRhLCBsaW5lcywgaW5kZW50KSB7XG4gICAgZm9yICh2YXIgZmkgPSAwOyBmaSA8IGZpZWxkcy5sZW5ndGg7IGZpKyspIHtcbiAgICAgIHZhciBmID0gZmllbGRzW2ZpXTsgdmFyIHYgPSBkYXRhID8gZGF0YVtmLmtleV0gOiAnJztcbiAgICAgIGlmICh2ICE9PSAnJyAmJiB2ICE9PSB1bmRlZmluZWQgJiYgdiAhPT0gbnVsbCkge1xuICAgICAgICBsaW5lcy5wdXNoKGluZGVudCArIGYubGFiZWwgKyAnOiAnICsgU3RyaW5nKHYpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfZXhwb3J0TWFya2Rvd24oZGF0YSwgc2NoZW1hKSB7XG4gICAgdmFyIGxpbmVzID0gWycjICcgKyBzY2hlbWEubGFiZWwsICcnXTtcbiAgICBpZiAoc2NoZW1hLmlzU2VxdWVuY2UgJiYgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgZm9yICh2YXIgc2kgPSAwOyBzaSA8IGRhdGEubGVuZ3RoOyBzaSsrKSB7XG4gICAgICAgIGxpbmVzLnB1c2goJyMjICcgKyAoc2NoZW1hLnNlcXVlbmNlTGFiZWwgfHwgJ0l0ZW0nKSArICcgJyArIChzaSArIDEpKTtcbiAgICAgICAgX21kU2VjdGlvbnMoZGF0YVtzaV0sIHNjaGVtYS5zZWN0aW9ucywgbGluZXMpO1xuICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgX21kU2VjdGlvbnMoZGF0YSwgc2NoZW1hLnNlY3Rpb25zLCBsaW5lcyk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKS50cmltKCk7XG4gIH1cblxuICBmdW5jdGlvbiBfbWRTZWN0aW9ucyhkYXRhLCBzZWN0aW9ucywgbGluZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjID0gc2VjdGlvbnNbaV07XG4gICAgICB2YXIgc2VjRGF0YSA9IChzZWMua2V5ID09PSAnX21ldGEnIHx8IHNlYy5rZXkgPT09ICdfc3VtbWFyeScpID8gZGF0YSA6IChkYXRhW3NlYy5rZXldIHx8IHt9KTtcbiAgICAgIGlmIChzZWMuaXNMaXN0ICYmIEFycmF5LmlzQXJyYXkoc2VjRGF0YSkpIHtcbiAgICAgICAgbGluZXMucHVzaCgnIyMjICcgKyBzZWMubGFiZWwpO1xuICAgICAgICBmb3IgKHZhciBsaSA9IDA7IGxpIDwgc2VjRGF0YS5sZW5ndGg7IGxpKyspIHtcbiAgICAgICAgICBsaW5lcy5wdXNoKCcjIyMjICcgKyAoc2VjRGF0YVtsaV0uc2VjdGlvbiB8fCBzZWMubGFiZWwgKyAnICcgKyAobGkgKyAxKSkpO1xuICAgICAgICAgIF9tZEZpZWxkcyhzZWMuZmllbGRzLCBzZWNEYXRhW2xpXSwgbGluZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKCcjIyMgJyArIHNlYy5sYWJlbCk7XG4gICAgICAgIF9tZEZpZWxkcyhzZWMuZmllbGRzLCBzZWNEYXRhLCBsaW5lcyk7XG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfbWRGaWVsZHMoZmllbGRzLCBkYXRhLCBsaW5lcykge1xuICAgIGZvciAodmFyIGZpID0gMDsgZmkgPCBmaWVsZHMubGVuZ3RoOyBmaSsrKSB7XG4gICAgICB2YXIgZiA9IGZpZWxkc1tmaV07IHZhciB2ID0gZGF0YSA/IGRhdGFbZi5rZXldIDogJyc7XG4gICAgICBpZiAodiAhPT0gJycgJiYgdiAhPT0gdW5kZWZpbmVkICYmIHYgIT09IG51bGwpIHtcbiAgICAgICAgbGluZXMucHVzaCgnKionICsgZi5sYWJlbCArICc6KiogJyArIFN0cmluZyh2KSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2V4cG9ydFZvaWNlb3ZlcihkYXRhLCBzY2hlbWEpIHtcbiAgICAvLyBFeHRyYWN0cyBvbmx5IHZvaWNlb3Zlci9zcG9rZW4gdGV4dCBmaWVsZHMgaW4gb3JkZXJcbiAgICB2YXIgbGluZXMgPSBbXTtcbiAgICBpZiAoZGF0YS5ob29rICYmIGRhdGEuaG9vay52b2ljZW92ZXIpIGxpbmVzLnB1c2goJ1tIT09LXSAnICsgZGF0YS5ob29rLnZvaWNlb3Zlcik7XG4gICAgaWYgKGRhdGEuYm9keSAmJiBBcnJheS5pc0FycmF5KGRhdGEuYm9keSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5ib2R5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhLmJvZHlbaV0udm9pY2VvdmVyKSBsaW5lcy5wdXNoKCdbJyArIChkYXRhLmJvZHlbaV0uc2VjdGlvbiB8fCAnQm9keSAnICsgKGkrMSkpLnRvVXBwZXJDYXNlKCkgKyAnXSAnICsgZGF0YS5ib2R5W2ldLnZvaWNlb3Zlcik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhLm91dHJvICYmIGRhdGEub3V0cm8udm9pY2VvdmVyKSBsaW5lcy5wdXNoKCdbT1VUUk9dICcgKyBkYXRhLm91dHJvLnZvaWNlb3Zlcik7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcblxcbicpO1xuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIElOTElORSBEQVRBIEVYVFJBQ1RJT04gKHJlYWQgY3VycmVudCB2YWx1ZXMgZnJvbSBET00gYmFjayB0byBvYmplY3QpIFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4gIGZ1bmN0aW9uIGNvbGxlY3RTdHJ1Y3R1cmVkT3V0cHV0RGF0YShvaWQpIHtcbiAgICB2YXIgJGFpbyA9ICQoJ1tkYXRhLWFpby1pZD1cIicgKyBvaWQgKyAnXCJdJykuZmlyc3QoKTtcbiAgICBpZiAoISRhaW8ubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgc2NoZW1hSWQgPSAkYWlvLmRhdGEoJ3NjaGVtYScpO1xuICAgIHZhciBzY2hlbWEgPSBPVVRQVVRfU0NIRU1BU1tzY2hlbWFJZF07XG4gICAgaWYgKCFzY2hlbWEpIHJldHVybiBudWxsO1xuXG4gICAgLy8gQnVpbGQgZGF0YSBvYmplY3QgYnkgcmVhZGluZyBhbGwgaW5wdXQgdmFsdWVzXG4gICAgdmFyIGRhdGEgPSB7fTtcbiAgICAkYWlvLmZpbmQoJy5zY3AtYWlvLWlucHV0JykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXRoID0gJCh0aGlzKS5kYXRhKCdhaW8tcGF0aCcpO1xuICAgICAgaWYgKCFwYXRoKSByZXR1cm47XG4gICAgICAvLyBSZW1vdmUgdGhlIG9pZCBwcmVmaXg6IFwiYWlvX2FiYy52aXN1YWxfY29uY2VwdC5zY2VuZVwiIFx1MjE5MiBcInZpc3VhbF9jb25jZXB0LnNjZW5lXCJcbiAgICAgIHZhciByZWxhdGl2ZVBhdGggPSBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBvaWQucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKSArICdbLl9dPycpLCAnJyk7XG4gICAgICAvLyBIYW5kbGUgc2VxdWVuY2UgcGF0aHM6IFwiczAudmlzdWFsX2NvbmNlcHQuc2NlbmVcIiBcdTIxOTIgaW5kZXggaW50byBhcnJheVxuICAgICAgdmFyIHZhbCA9ICQodGhpcykuaXMoJ2lucHV0W3R5cGU9XCJudW1iZXJcIl0nKSA/IChwYXJzZUZsb2F0KCQodGhpcykudmFsKCkpIHx8IDApIDogJCh0aGlzKS52YWwoKTtcbiAgICAgIF9zZXRCeVBhdGgoZGF0YSwgcmVsYXRpdmVQYXRoLCB2YWwpO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gX3NldEJ5UGF0aChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgdmFyIHBhcnRzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgIHZhciB0YXJnZXQgPSBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAvLyBOdW1lcmljIHBhcnRzIFx1MjE5MiBhcnJheSBpbmRleFxuICAgICAgaWYgKC9eXFxkKyQvLnRlc3QocGFydHNbaSArIDFdKSkge1xuICAgICAgICB0YXJnZXRbcGFydF0gPSB0YXJnZXRbcGFydF0gfHwgW107XG4gICAgICB9IGVsc2UgaWYgKC9eXFxkKyQvLnRlc3QocGFydCkpIHtcbiAgICAgICAgdmFyIGlkeCA9IHBhcnNlSW50KHBhcnQsIDEwKTtcbiAgICAgICAgd2hpbGUgKHRhcmdldC5sZW5ndGggPD0gaWR4KSB0YXJnZXQucHVzaCh7fSk7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldFtpZHhdO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldFtwYXJ0XSA9IHRhcmdldFtwYXJ0XSB8fCB7fTtcbiAgICAgIH1cbiAgICAgIHRhcmdldCA9IHRhcmdldFtwYXJ0XTtcbiAgICB9XG4gICAgdmFyIGxhc3RLZXkgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICBpZiAoL15cXGQrJC8udGVzdChsYXN0S2V5KSkge1xuICAgICAgdmFyIGxhc3RJZHggPSBwYXJzZUludChsYXN0S2V5LCAxMCk7XG4gICAgICB3aGlsZSAodGFyZ2V0Lmxlbmd0aCA8PSBsYXN0SWR4KSB0YXJnZXQucHVzaCh7fSk7XG4gICAgICB0YXJnZXRbbGFzdElkeF0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W2xhc3RLZXldID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIEFJTyBFVkVOVCBIQU5ETEVSUyBcdTI1MDBcdTI1MDBcdTI1MDBcblxuICBmdW5jdGlvbiBzZXR1cEFJT0V2ZW50cygpIHtcbiAgICAvLyBTZWN0aW9uIGV4cGFuZC9jb2xsYXBzZVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwLWFpby10cycsICdbZGF0YS1hY3Rpb249XCJhaW8tdG9nZ2xlLXNlY3Rpb25cIl0nKS5vbignY2xpY2suc2NwLWFpby10cycsICdbZGF0YS1hY3Rpb249XCJhaW8tdG9nZ2xlLXNlY3Rpb25cIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJGhlYWRlciA9ICQodGhpcyk7XG4gICAgICB2YXIgJGJvZHkgPSAkaGVhZGVyLm5leHQoJy5zY3AtYWlvLXNlY3Rpb24tYm9keScpO1xuICAgICAgdmFyIGlzQ29sbGFwc2VkID0gJGJvZHkuaGFzQ2xhc3MoJ3NjcC1haW8tY29sbGFwc2VkJyk7XG4gICAgICAkYm9keS50b2dnbGVDbGFzcygnc2NwLWFpby1jb2xsYXBzZWQnKTtcbiAgICAgICRoZWFkZXIuZmluZCgnLnNjcC1haW8tY2hldnJvbicpLmh0bWwoaWNvbihpc0NvbGxhcHNlZCA/ICdjaGV2cm9uLXVwJyA6ICdjaGV2cm9uLWRvd24nKSk7XG4gICAgfSk7XG5cbiAgICAvLyBMaXN0IGl0ZW0gZXhwYW5kL2NvbGxhcHNlXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtYWlvLXRsaScsICdbZGF0YS1hY3Rpb249XCJhaW8tdG9nZ2xlLWxpc3QtaXRlbVwiXScpLm9uKCdjbGljay5zY3AtYWlvLXRsaScsICdbZGF0YS1hY3Rpb249XCJhaW8tdG9nZ2xlLWxpc3QtaXRlbVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkYm9keSA9ICQodGhpcykubmV4dCgnLnNjcC1haW8tbGlzdC1jYXJkLWJvZHknKTtcbiAgICAgICRib2R5LnRvZ2dsZUNsYXNzKCdzY3AtYWlvLWNvbGxhcHNlZCcpO1xuICAgICAgJCh0aGlzKS5maW5kKCcuc2NwLWFpby1jaGV2cm9uJykuaHRtbChpY29uKCRib2R5Lmhhc0NsYXNzKCdzY3AtYWlvLWNvbGxhcHNlZCcpID8gJ2NoZXZyb24tZG93bicgOiAnY2hldnJvbi11cCcpKTtcbiAgICB9KTtcblxuICAgIC8vIElubGluZSBmaWVsZCBlZGl0IFx1MjE5MiBzYXZlIGJhY2sgdG8gcG9zdCBkYXRhXG4gICAgJChkb2N1bWVudCkub2ZmKCdibHVyLnNjcC1haW8tZmUnLCAnLnNjcC1haW8taW5wdXQnKS5vbignYmx1ci5zY3AtYWlvLWZlJywgJy5zY3AtYWlvLWlucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aCA9ICQodGhpcykuZGF0YSgnYWlvLXBhdGgnKTtcbiAgICAgIGlmICghcGF0aCkgcmV0dXJuO1xuICAgICAgdmFyICRhaW8gPSAkKHRoaXMpLmNsb3Nlc3QoJy5zY3AtYWlvJyk7XG4gICAgICB2YXIgcG9zdElkID0gJGFpby5kYXRhKCdwb3N0LWlkJyk7XG4gICAgICBpZiAoIXBvc3RJZCB8fCAhUy5wb3N0TWFwW3Bvc3RJZF0pIHJldHVybjtcbiAgICAgIC8vIFRyaWdnZXIgc2F2ZSBjYWxsYmFjayBpZiByZWdpc3RlcmVkLCBvdGhlcndpc2UgYXV0by1zYXZlXG4gICAgICB2YXIgdmFsID0gJCh0aGlzKS5pcygnaW5wdXRbdHlwZT1cIm51bWJlclwiXScpID8gKHBhcnNlRmxvYXQoJCh0aGlzKS52YWwoKSkgfHwgMCkgOiAkKHRoaXMpLnZhbCgpO1xuICAgICAgLy8gU3RvcmUgdXBkYXRlZCB2YWx1ZSB2aWEgdGhlIG9uU2F2ZSBjYWxsYmFjayBwYXR0ZXJuXG4gICAgICBpZiAod2luZG93Ll9zY3BBSU9TYXZlRmllbGQpIHdpbmRvdy5fc2NwQUlPU2F2ZUZpZWxkKHBvc3RJZCwgcGF0aCwgdmFsKTtcbiAgICB9KTtcblxuICAgIC8vIEV4cG9ydCBidXR0b25zXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AtYWlvLWV4cCcsICdbZGF0YS1hY3Rpb249XCJhaW8tZXhwb3J0XCJdJykub24oJ2NsaWNrLnNjcC1haW8tZXhwJywgJ1tkYXRhLWFjdGlvbj1cImFpby1leHBvcnRcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgZm9ybWF0ID0gJCh0aGlzKS5kYXRhKCdmb3JtYXQnKTtcbiAgICAgIHZhciBvaWQgPSAkKHRoaXMpLmRhdGEoJ2Fpby1pZCcpO1xuICAgICAgdmFyICRhaW8gPSAkKCdbZGF0YS1haW8taWQ9XCInICsgb2lkICsgJ1wiXScpLmZpcnN0KCk7XG4gICAgICB2YXIgc2NoZW1hSWQgPSAkYWlvLmRhdGEoJ3NjaGVtYScpO1xuICAgICAgLy8gQ29sbGVjdCBjdXJyZW50IGRhdGEgZnJvbSBET00gKGluY2x1ZGVzIGlubGluZSBlZGl0cylcbiAgICAgIHZhciBjdXJyZW50RGF0YSA9IGNvbGxlY3RTdHJ1Y3R1cmVkT3V0cHV0RGF0YShvaWQpO1xuICAgICAgaWYgKCFjdXJyZW50RGF0YSkgeyB0b2FzdCgnTm8gZGF0YSB0byBleHBvcnQnLCAnd2FybmluZycpOyByZXR1cm47IH1cbiAgICAgIHZhciBvdXRwdXQgPSBleHBvcnRTdHJ1Y3R1cmVkT3V0cHV0KGN1cnJlbnREYXRhLCBzY2hlbWFJZCwgZm9ybWF0KTtcbiAgICAgIGlmIChvdXRwdXQpIHtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQob3V0cHV0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmb3JtYXRMYWJlbCA9IHsgcGxhaW46ICdQbGFpbiB0ZXh0JywganNvbjogJ0pTT04nLCBtYXJrZG93bjogJ01hcmtkb3duJywgdm9pY2VvdmVyOiAnVm9pY2VvdmVyIHNjcmlwdCcgfTtcbiAgICAgICAgICB0b2FzdCgoZm9ybWF0TGFiZWxbZm9ybWF0XSB8fCBmb3JtYXQpICsgJyBjb3BpZWQgdG8gY2xpcGJvYXJkIScsICdzdWNjZXNzJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gUmVnaXN0ZXIgQUlPIGV2ZW50cyB3aGVuIFBhcnQgMkEgaW5pdGlhbGl6ZXNcbiAgLy8gKGNhbGxlZCBhdCBlbmQgb2Ygc2V0dXBQYXJ0MkFFdmVudHMpXG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTM6IEVWRU5UIEhBTkRMRVJTXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHNldHVwUGFydDJBRXZlbnRzKCkge1xuICAgIC8vIC0tLSBNb2RhbCBldmVudHMgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS1jbScsICdbZGF0YS1hY3Rpb249XCJjbG9zZS1tb2RhbFwiXScpLm9uKCdjbGljay5zY3AyYS1jbScsICdbZGF0YS1hY3Rpb249XCJjbG9zZS1tb2RhbFwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBjbG9zZU1vZGFsKCk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtbXMnLCAnW2RhdGEtYWN0aW9uPVwibW9kYWwtc2F2ZVwiXScpLm9uKCdjbGljay5zY3AyYS1tcycsICdbZGF0YS1hY3Rpb249XCJtb2RhbC1zYXZlXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IGlmIChjdXJyZW50TW9kYWwgJiYgY3VycmVudE1vZGFsLm9uU2F2ZSkgY3VycmVudE1vZGFsLm9uU2F2ZSgpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLW1iJywgJy5zY3AtbW9kYWwtYmFja2Ryb3AnKS5vbignY2xpY2suc2NwMmEtbWInLCAnLnNjcC1tb2RhbC1iYWNrZHJvcCcsIGZ1bmN0aW9uKGUpIHsgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdzY3AtbW9kYWwtYmFja2Ryb3AnKSkgY2xvc2VNb2RhbCgpOyB9KTtcblxuICAgIC8vIC0tLSBDb2xvciBwaWNrZXIgaW4gbW9kYWxzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtY3AnLCAnW2RhdGEtYWN0aW9uPVwicGljay1jb2xvclwiXScpLm9uKCdjbGljay5zY3AyYS1jcCcsICdbZGF0YS1hY3Rpb249XCJwaWNrLWNvbG9yXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyB2YXIgY29sb3IgPSAkKHRoaXMpLmRhdGEoJ2NvbG9yJyk7XG4gICAgICAkKHRoaXMpLnNpYmxpbmdzKCcuc2NwLWNvbG9yLXN3YXRjaCcpLnJlbW92ZUNsYXNzKCdzY3AtY29sb3Itc3dhdGNoLWFjdGl2ZScpO1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnc2NwLWNvbG9yLXN3YXRjaC1hY3RpdmUnKTtcbiAgICAgICQodGhpcykuc2libGluZ3MoJ2lucHV0W2RhdGEtZmllbGQ9XCJjb2xvclwiXScpLnZhbChjb2xvcik7XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gVG9waWMgQ1JVRCAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLW50JywgJ1tkYXRhLWFjdGlvbj1cIm5ldy10b3BpY1wiXScpLm9uKCdjbGljay5zY3AyYS1udCcsICdbZGF0YS1hY3Rpb249XCJuZXctdG9waWNcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgb3Blbk5ld1RvcGljTW9kYWwoKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS1ldCcsICdbZGF0YS1hY3Rpb249XCJlZGl0LXRvcGljXCJdJykub24oJ2NsaWNrLnNjcDJhLWV0JywgJ1tkYXRhLWFjdGlvbj1cImVkaXQtdG9waWNcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgZWRpdFRvcGljTW9kYWwoJCh0aGlzKS5kYXRhKCdpZCcpKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS1kdCcsICdbZGF0YS1hY3Rpb249XCJkZWxldGUtdG9waWNcIl0nKS5vbignY2xpY2suc2NwMmEtZHQnLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLXRvcGljXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IGRlbGV0ZVRvcGljKCQodGhpcykuZGF0YSgnaWQnKSk7IH0pO1xuXG4gICAgLy8gLS0tIFBvc3QgdHlwZSBzZWxlY3RvciAoYmFzaWNzIHN0ZXApIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtc3B0JywgJ1tkYXRhLWFjdGlvbj1cInNldC1wb3N0LXR5cGVcIl0nKS5vbignY2xpY2suc2NwMmEtc3B0JywgJ1tkYXRhLWFjdGlvbj1cInNldC1wb3N0LXR5cGVcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciB0eXBlID0gJCh0aGlzKS5kYXRhKCd0eXBlJyk7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgcG9zdC50eXBlID0gdHlwZTsgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgc25hcHNob3QoJ0NoYW5nZSB0eXBlJyk7IGJ1aWxkTWFwcygpOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBQbGF0Zm9ybSBjaGVja2JveGVzIChiYXNpY3Mgc3RlcCkgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwMmEtcGxjJywgJy5zY3AtcGxhdGZvcm0tY2hlY2snKS5vbignY2hhbmdlLnNjcDJhLXBsYycsICcuc2NwLXBsYXRmb3JtLWNoZWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgdmFyIHBrID0gJCh0aGlzKS5kYXRhKCdwbGF0Zm9ybScpOyB2YXIgY2hlY2tlZCA9ICQodGhpcykuaXMoJzpjaGVja2VkJyk7XG4gICAgICBwb3N0LnBsYXRmb3JtcyA9IHBvc3QucGxhdGZvcm1zIHx8IFtdO1xuICAgICAgaWYgKGNoZWNrZWQgJiYgcG9zdC5wbGF0Zm9ybXMuaW5kZXhPZihwaykgPCAwKSBwb3N0LnBsYXRmb3Jtcy5wdXNoKHBrKTtcbiAgICAgIGVsc2UgaWYgKCFjaGVja2VkKSBwb3N0LnBsYXRmb3JtcyA9IHBvc3QucGxhdGZvcm1zLmZpbHRlcihmdW5jdGlvbihwKSB7IHJldHVybiBwICE9PSBwazsgfSk7XG4gICAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgLy8gLS0tIEJhc2ljcyBmaWVsZCBzYXZlcyAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtYmYnLCAnLnNjcC1iYXNpY3MtZmllbGQnKS5vbignYmx1ci5zY3AyYS1iZicsICcuc2NwLWJhc2ljcy1maWVsZCcsIGZ1bmN0aW9uKCkgeyBzYXZlQmFzaWNzRmllbGQoJCh0aGlzKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLWJmYycsICdzZWxlY3Quc2NwLWJhc2ljcy1maWVsZCcpLm9uKCdjaGFuZ2Uuc2NwMmEtYmZjJywgJ3NlbGVjdC5zY3AtYmFzaWNzLWZpZWxkJywgZnVuY3Rpb24oKSB7IHNhdmVCYXNpY3NGaWVsZCgkKHRoaXMpKTsgfSk7XG5cbiAgICAvLyAtLS0gQ29udGVudCBtZXRhIGZpZWxkcyAodG9uZSwgYXVkaWVuY2UpIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLWNtZicsICcuc2NwLWNvbnRlbnQtbWV0YS1maWVsZCcpLm9uKCdjaGFuZ2Uuc2NwMmEtY21mJywgJy5zY3AtY29udGVudC1tZXRhLWZpZWxkJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgdmFyIHBhdGggPSAkKHRoaXMpLmRhdGEoJ3BhdGgnKTsgdmFyIHZhbCA9ICQodGhpcykudmFsKCk7XG4gICAgICBzZXROZXN0ZWRWYWx1ZShwb3N0LCBwYXRoLCB2YWwpO1xuICAgICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICAgIH0pO1xuXG4gICAgLy8gLS0tIFRvcGljIGFkZC9yZW1vdmUgb24gcG9zdHMgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwMmEtdGEnLCAnLnNjcC10b3BpYy1hZGQtc2VsZWN0Jykub24oJ2NoYW5nZS5zY3AyYS10YScsICcuc2NwLXRvcGljLWFkZC1zZWxlY3QnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b3BpY0lkID0gJCh0aGlzKS52YWwoKTsgdmFyIHBvc3RJZCA9ICQodGhpcykuZGF0YSgncG9zdC1pZCcpO1xuICAgICAgaWYgKCF0b3BpY0lkIHx8ICFwb3N0SWQpIHJldHVybjtcbiAgICAgIHZhciBwb3N0ID0gUy5wb3N0TWFwW3Bvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgcG9zdC50b3BpY3MgPSBwb3N0LnRvcGljcyB8fCBbXTtcbiAgICAgIGlmIChwb3N0LnRvcGljcy5pbmRleE9mKHRvcGljSWQpIDwgMCkgeyBwb3N0LnRvcGljcy5wdXNoKHRvcGljSWQpOyBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpOyB9XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS10cicsICdbZGF0YS1hY3Rpb249XCJyZW1vdmUtcG9zdC10b3BpY1wiXScpLm9uKCdjbGljay5zY3AyYS10cicsICdbZGF0YS1hY3Rpb249XCJyZW1vdmUtcG9zdC10b3BpY1wiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIHRvcGljSWQgPSAkKHRoaXMpLmRhdGEoJ3RvcGljLWlkJyk7IHZhciBwb3N0SWQgPSAkKHRoaXMpLmRhdGEoJ3Bvc3QtaWQnKTtcbiAgICAgIHZhciBwb3N0ID0gUy5wb3N0TWFwW3Bvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgcG9zdC50b3BpY3MgPSAocG9zdC50b3BpY3MgfHwgW10pLmZpbHRlcihmdW5jdGlvbih0KSB7IHJldHVybiB0ICE9PSB0b3BpY0lkOyB9KTtcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gUmVzZWFyY2g6IGFuZ2xlL2hvb2sgc2VsZWN0aW9uIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLXNhJywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC1hbmdsZVwiXScpLm9uKCdjaGFuZ2Uuc2NwMmEtc2EnLCAnW2RhdGEtYWN0aW9uPVwic2VsZWN0LWFuZ2xlXCJdJywgZnVuY3Rpb24oKSB7IHNhdmVBbmdsZVNlbGVjdGlvbihwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLXNoJywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC1ob29rXCJdJykub24oJ2NoYW5nZS5zY3AyYS1zaCcsICdbZGF0YS1hY3Rpb249XCJzZWxlY3QtaG9va1wiXScsIGZ1bmN0aW9uKCkgeyBzYXZlSG9va1NlbGVjdGlvbihwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtYWFtJywgJ1tkYXRhLWFjdGlvbj1cImFkZC1hbmdsZS1tYW51YWxcIl0nKS5vbignY2xpY2suc2NwMmEtYWFtJywgJ1tkYXRhLWFjdGlvbj1cImFkZC1hbmdsZS1tYW51YWxcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgYWRkUmVzZWFyY2hJdGVtKCdhbmdsZScpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLWFobScsICdbZGF0YS1hY3Rpb249XCJhZGQtaG9vay1tYW51YWxcIl0nKS5vbignY2xpY2suc2NwMmEtYWhtJywgJ1tkYXRhLWFjdGlvbj1cImFkZC1ob29rLW1hbnVhbFwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBhZGRSZXNlYXJjaEl0ZW0oJ2hvb2snKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS1yYScsICdbZGF0YS1hY3Rpb249XCJyZW1vdmUtYW5nbGVcIl0nKS5vbignY2xpY2suc2NwMmEtcmEnLCAnW2RhdGEtYWN0aW9uPVwicmVtb3ZlLWFuZ2xlXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHJlbW92ZVJlc2VhcmNoSXRlbSgnYW5nbGUnLCBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtcmgnLCAnW2RhdGEtYWN0aW9uPVwicmVtb3ZlLWhvb2tcIl0nKS5vbignY2xpY2suc2NwMmEtcmgnLCAnW2RhdGEtYWN0aW9uPVwicmVtb3ZlLWhvb2tcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgcmVtb3ZlUmVzZWFyY2hJdGVtKCdob29rJywgcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdpbmRleCcpLCAxMCkpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtcm4nLCAnLnNjcC1yZXNlYXJjaC1ub3RlcycpLm9uKCdibHVyLnNjcDJhLXJuJywgJy5zY3AtcmVzZWFyY2gtbm90ZXMnLCBmdW5jdGlvbigpIHsgc2F2ZVJlc2VhcmNoTm90ZXMoJCh0aGlzKS52YWwoKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignYmx1ci5zY3AyYS1hYycsICcuc2NwLWFuZ2xlLWN1c3RvbScpLm9uKCdibHVyLnNjcDJhLWFjJywgJy5zY3AtYW5nbGUtY3VzdG9tJywgZnVuY3Rpb24oKSB7IHNhdmVSZXNlYXJjaEN1c3RvbUlucHV0KCdhbmdsZScsICQodGhpcykudmFsKCkpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtaGMnLCAnLnNjcC1ob29rLWN1c3RvbScpLm9uKCdibHVyLnNjcDJhLWhjJywgJy5zY3AtaG9vay1jdXN0b20nLCBmdW5jdGlvbigpIHsgc2F2ZVJlc2VhcmNoQ3VzdG9tSW5wdXQoJ2hvb2snLCAkKHRoaXMpLnZhbCgpKTsgfSk7XG5cbiAgICAvLyAtLS0gQ29tcG9zZXIgdGV4dGFyZWEgYXV0by1zYXZlIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignaW5wdXQuc2NwMmEtY3QnLCAnLnNjcC1jb21wb3Nlci10ZXh0YXJlYScpLm9uKCdpbnB1dC5zY3AyYS1jdCcsICcuc2NwLWNvbXBvc2VyLXRleHRhcmVhJywgd2luZG93Ll9zY3BEZWJvdW5jZShmdW5jdGlvbigpIHsgc2F2ZUNvbXBvc2VyQ29udGVudCgkKHRoaXMpKTsgfSwgNTAwKSk7XG5cbiAgICAvLyAtLS0gQ29tcG9zZXIgZWRpdC9wcmV2aWV3IHRvZ2dsZSAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLWNtdCcsICdbZGF0YS1hY3Rpb249XCJjb21wb3Nlci1tb2RlXCJdJykub24oJ2NsaWNrLnNjcDJhLWNtdCcsICdbZGF0YS1hY3Rpb249XCJjb21wb3Nlci1tb2RlXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyIG1vZGUgPSAkKHRoaXMpLmRhdGEoJ21vZGUnKTtcbiAgICAgIHZhciBjb21wb3NlcklkID0gJCh0aGlzKS5kYXRhKCdjb21wb3NlcicpO1xuICAgICAgdmFyICRjb21wb3NlciA9ICQodGhpcykuY2xvc2VzdCgnLnNjcC1jb21wb3NlcicpO1xuICAgICAgLy8gVG9nZ2xlIHRhYiBhY3RpdmUgc3RhdGVcbiAgICAgICRjb21wb3Nlci5maW5kKCcuc2NwLWNvbXBvc2VyLXRhYicpLnJlbW92ZUNsYXNzKCdzY3AtY29tcG9zZXItdGFiLWFjdGl2ZScpO1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnc2NwLWNvbXBvc2VyLXRhYi1hY3RpdmUnKTtcbiAgICAgIGlmIChtb2RlID09PSAncHJldmlldycpIHtcbiAgICAgICAgJGNvbXBvc2VyLmZpbmQoJ1tkYXRhLWNvbXBvc2VyLXBhbmVsPVwiZWRpdC0nICsgY29tcG9zZXJJZCArICdcIl0nKS5oaWRlKCk7XG4gICAgICAgIHZhciAkcHJldmlldyA9ICRjb21wb3Nlci5maW5kKCdbZGF0YS1jb21wb3Nlci1wYW5lbD1cInByZXZpZXctJyArIGNvbXBvc2VySWQgKyAnXCJdJyk7XG4gICAgICAgIC8vIFJlZnJlc2ggcHJldmlldyBjb250ZW50IGZyb20gdGV4dGFyZWFcbiAgICAgICAgdmFyIGNvbnRlbnQgPSAkY29tcG9zZXIuZmluZCgnLnNjcC1jb21wb3Nlci10ZXh0YXJlYScpLnZhbCgpIHx8ICcnO1xuICAgICAgICAkcHJldmlldy5maW5kKCcuc2NwLWNvbXBvc2VyLXByZXZpZXcnKS5odG1sKFxuICAgICAgICAgIGNvbnRlbnQudHJpbSgpID8gKHdpbmRvdy5fc2NwRm9ybWF0Q29udGVudEZvclByZXZpZXcgPyB3aW5kb3cuX3NjcEZvcm1hdENvbnRlbnRGb3JQcmV2aWV3KGNvbnRlbnQpIDogZXNjKGNvbnRlbnQpLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpKVxuICAgICAgICAgIDogJzxzcGFuIGNsYXNzPVwic2NwLXRleHQtbXV0ZWRcIj5Xcml0ZSBjb250ZW50IGFib3ZlIHRvIHNlZSBwcmV2aWV3PC9zcGFuPidcbiAgICAgICAgKTtcbiAgICAgICAgJHByZXZpZXcuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGNvbXBvc2VyLmZpbmQoJ1tkYXRhLWNvbXBvc2VyLXBhbmVsPVwicHJldmlldy0nICsgY29tcG9zZXJJZCArICdcIl0nKS5oaWRlKCk7XG4gICAgICAgICRjb21wb3Nlci5maW5kKCdbZGF0YS1jb21wb3Nlci1wYW5lbD1cImVkaXQtJyArIGNvbXBvc2VySWQgKyAnXCJdJykuc2hvdygpO1xuICAgICAgICAkY29tcG9zZXIuZmluZCgnLnNjcC1jb21wb3Nlci10ZXh0YXJlYScpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gUHJvbXB0IHZpc3VhbC9yYXcgdmlldyB0b2dnbGVzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtdHB2JywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1zaW5nbGUtcHJvbXB0LXZpZXdcIl0nKS5vbignY2xpY2suc2NwMmEtdHB2JywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1zaW5nbGUtcHJvbXB0LXZpZXdcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgaWR4ID0gJCh0aGlzKS5kYXRhKCdpbmRleCcpO1xuICAgICAgdmFyICR2aXN1YWwgPSAkKCdbZGF0YS1wcm9tcHQtdmlldz1cInZpc3VhbC0nICsgaWR4ICsgJ1wiXScpO1xuICAgICAgdmFyICRyYXcgPSAkKCdbZGF0YS1wcm9tcHQtdmlldz1cInJhdy0nICsgaWR4ICsgJ1wiXScpO1xuICAgICAgaWYgKCRyYXcuaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgJHJhdy5oaWRlKCk7ICR2aXN1YWwuc2hvdygpO1xuICAgICAgICAkKHRoaXMpLmh0bWwoaWNvbignZWRpdCcpICsgJyBFZGl0IFJhdycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHZpc3VhbC5oaWRlKCk7ICRyYXcuc2hvdygpO1xuICAgICAgICAkKHRoaXMpLmh0bWwoaWNvbignZXllJykgKyAnIFZpc3VhbCBWaWV3Jyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS10cHZtJywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1wcm9tcHQtdmlldy1tb2RlXCJdJykub24oJ2NsaWNrLnNjcDJhLXRwdm0nLCAnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXByb21wdC12aWV3LW1vZGVcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgYWxsVmlzdWFsID0gJCgnLnNjcC1wcm9tcHQtdmlzdWFsOnZpc2libGUnKS5sZW5ndGggPiAwO1xuICAgICAgaWYgKGFsbFZpc3VhbCkge1xuICAgICAgICAkKCcuc2NwLXByb21wdC12aXN1YWwnKS5oaWRlKCk7ICQoJy5zY3AtcHJvbXB0LXJhdycpLnNob3coKTtcbiAgICAgICAgJCh0aGlzKS5odG1sKGljb24oJ2V5ZScpICsgJyBWaXN1YWwgVmlldycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdyB2aXN1YWwgd2hlcmUgYXZhaWxhYmxlLCBrZWVwIHJhdyBmb3Igc2ltcGxlIHByb21wdHNcbiAgICAgICAgJCgnLnNjcC1wcm9tcHQtY2FyZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICR2ID0gJCh0aGlzKS5maW5kKCcuc2NwLXByb21wdC12aXN1YWwnKTtcbiAgICAgICAgICB2YXIgJHIgPSAkKHRoaXMpLmZpbmQoJy5zY3AtcHJvbXB0LXJhdycpO1xuICAgICAgICAgIGlmICgkdi5sZW5ndGggJiYgJHYuY2hpbGRyZW4oKS5sZW5ndGggPiAwKSB7ICR2LnNob3coKTsgJHIuaGlkZSgpOyB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMpLmh0bWwoaWNvbignZWRpdCcpICsgJyBSYXcgVmlldycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gLS0tIENhcm91c2VsIHNsaWRlIGZpZWxkcyAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtc2YnLCAnLnNjcC1zbGlkZS1maWVsZCcpLm9uKCdibHVyLnNjcDJhLXNmJywgJy5zY3Atc2xpZGUtZmllbGQnLCBmdW5jdGlvbigpIHsgc2F2ZVNsaWRlRmllbGQoJCh0aGlzKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtc3NjJywgJ1tkYXRhLWFjdGlvbj1cInNldC1zbGlkZS1jb3VudFwiXScpLm9uKCdjbGljay5zY3AyYS1zc2MnLCAnW2RhdGEtYWN0aW9uPVwic2V0LXNsaWRlLWNvdW50XCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHNldFNsaWRlQ291bnQocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdjb3VudCcpLCAxMCkpOyB9KTtcblxuICAgIC8vIC0tLSBWaWRlbyBmaWVsZHMgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdibHVyLnNjcDJhLXZmJywgJy5zY3AtdmlkZW8tZmllbGQnKS5vbignYmx1ci5zY3AyYS12ZicsICcuc2NwLXZpZGVvLWZpZWxkJywgZnVuY3Rpb24oKSB7IHNhdmVWaWRlb0ZpZWxkKCQodGhpcykpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLXN2ZCcsICdbZGF0YS1hY3Rpb249XCJzZXQtdmlkZW8tZHVyYXRpb25cIl0nKS5vbignY2xpY2suc2NwMmEtc3ZkJywgJ1tkYXRhLWFjdGlvbj1cInNldC12aWRlby1kdXJhdGlvblwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXRWaWRlb1Byb3BlcnR5KCdkdXJhdGlvbl9zZWNvbmRzJywgcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdkdXJhdGlvbicpLCAxMCkpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLXN2ZicsICdbZGF0YS1hY3Rpb249XCJzZXQtdmlkZW8tZm9ybWF0XCJdJykub24oJ2NsaWNrLnNjcDJhLXN2ZicsICdbZGF0YS1hY3Rpb249XCJzZXQtdmlkZW8tZm9ybWF0XCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHNldFZpZGVvUHJvcGVydHkoJ2Zvcm1hdCcsICQodGhpcykuZGF0YSgnZm9ybWF0JykpOyB9KTtcblxuICAgIC8vIC0tLSBNZWRpYSBjb25maWcgZmllbGRzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLW1jZicsICcuc2NwLW1lZGlhLWNvbmZpZy1maWVsZCcpLm9uKCdjaGFuZ2Uuc2NwMmEtbWNmJywgJy5zY3AtbWVkaWEtY29uZmlnLWZpZWxkJywgZnVuY3Rpb24oKSB7IHNhdmVNZWRpYUNvbmZpZ0ZpZWxkKCQodGhpcykpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtbWNmYicsICd0ZXh0YXJlYS5zY3AtbWVkaWEtY29uZmlnLWZpZWxkJykub24oJ2JsdXIuc2NwMmEtbWNmYicsICd0ZXh0YXJlYS5zY3AtbWVkaWEtY29uZmlnLWZpZWxkJywgZnVuY3Rpb24oKSB7IHNhdmVNZWRpYUNvbmZpZ0ZpZWxkKCQodGhpcykpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NoYW5nZS5zY3AyYS1tYnQnLCAnLnNjcC1tZWRpYS1icmFuZC10b2dnbGUnKS5vbignY2hhbmdlLnNjcDJhLW1idCcsICcuc2NwLW1lZGlhLWJyYW5kLXRvZ2dsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFTLnNlbGVjdGVkUG9zdElkKSByZXR1cm47IHZhciBwb3N0ID0gUy5wb3N0TWFwW1Muc2VsZWN0ZWRQb3N0SWRdOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICAgIHBvc3QubWVkaWEgPSBwb3N0Lm1lZGlhIHx8IHt9OyBwb3N0Lm1lZGlhLmNvbmZpZyA9IHBvc3QubWVkaWEuY29uZmlnIHx8IHt9O1xuICAgICAgcG9zdC5tZWRpYS5jb25maWcuYnJhbmRfY29udGV4dF9lbmFibGVkID0gJCh0aGlzKS5pcygnOmNoZWNrZWQnKTtcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBQcm9tcHQgYWN0aW9ucyAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLWNwcicsICdbZGF0YS1hY3Rpb249XCJjb3B5LXByb21wdFwiXScpLm9uKCdjbGljay5zY3AyYS1jcHInLCAnW2RhdGEtYWN0aW9uPVwiY29weS1wcm9tcHRcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBpZHggPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKTtcbiAgICAgIHZhciAkdGEgPSAkKCcuc2NwLXByb21wdC10ZXh0W2RhdGEtcHJvbXB0LWluZGV4PVwiJyArIGlkeCArICdcIl0nKTtcbiAgICAgIGlmICgkdGEubGVuZ3RoKSBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCgkdGEudmFsKCkpLnRoZW4oZnVuY3Rpb24oKSB7IHRvYXN0KCdQcm9tcHQgY29waWVkIScsICdzdWNjZXNzJyk7IH0pO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtY2FwJywgJ1tkYXRhLWFjdGlvbj1cImNvcHktYWxsLXByb21wdHNcIl0nKS5vbignY2xpY2suc2NwMmEtY2FwJywgJ1tkYXRhLWFjdGlvbj1cImNvcHktYWxsLXByb21wdHNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IGlmICghUy5zZWxlY3RlZFBvc3RJZCkgcmV0dXJuOyB2YXIgcG9zdCA9IFMucG9zdE1hcFtTLnNlbGVjdGVkUG9zdElkXTsgaWYgKCFwb3N0IHx8ICFwb3N0Lm1lZGlhKSByZXR1cm47XG4gICAgICB2YXIgYWxsID0gKHBvc3QubWVkaWEucHJvbXB0cyB8fCBbXSkubWFwKGZ1bmN0aW9uKG1wLCBpKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gJy0tLSAnICsgKG1wLmxhYmVsIHx8ICdQcm9tcHQgJyArIChpICsgMSkpICsgJyAtLS1cXG4nICsgKG1wLnByb21wdF90ZXh0IHx8ICcnKTtcbiAgICAgICAgaWYgKG1wLm5lZ2F0aXZlX3Byb21wdCkgdGV4dCArPSAnXFxuXFxuTmVnYXRpdmU6ICcgKyBtcC5uZWdhdGl2ZV9wcm9tcHQ7XG4gICAgICAgIGlmIChtcC5yZWZlcmVuY2VfdXJscyAmJiBtcC5yZWZlcmVuY2VfdXJscy5sZW5ndGgpIHRleHQgKz0gJ1xcblxcblJlZmVyZW5jZXM6XFxuJyArIG1wLnJlZmVyZW5jZV91cmxzLmpvaW4oJ1xcbicpO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgIH0pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYWxsKS50aGVuKGZ1bmN0aW9uKCkgeyB0b2FzdCgnQWxsIHByb21wdHMgY29waWVkIScsICdzdWNjZXNzJyk7IH0pO1xuICAgIH0pO1xuICAgIC8vIChTdHJ1Y3R1cmVkIGZvcm0gaGFuZGxlcnMgcmVtb3ZlZCBcdTIwMTQgcmVwbGFjZWQgYnkgUGhhc2UgQiB2aXN1YWwgcGxhbm5lcilcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLXRwcycsICdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtcHJvbXB0LXN0YXR1c1wiXScpLm9uKCdjbGljay5zY3AyYS10cHMnLCAnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXByb21wdC1zdGF0dXNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBpZHggPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKTsgdmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgnc3RhdHVzJyk7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCB8fCAhcG9zdC5tZWRpYSB8fCAhcG9zdC5tZWRpYS5wcm9tcHRzW2lkeF0pIHJldHVybjtcbiAgICAgIHBvc3QubWVkaWEucHJvbXB0c1tpZHhdLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc25hcHNob3QoJ1RvZ2dsZSBwcm9tcHQgc3RhdHVzJyk7XG4gICAgICBpZiAobWF5YmVBZHZhbmNlU3RhdHVzKSBtYXliZUFkdmFuY2VTdGF0dXMocG9zdCwgJ3Byb21wdCAnICsgc3RhdHVzKTtcbiAgICAgIGJ1aWxkTWFwcygpOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmEtcHQnLCAnLnNjcC1wcm9tcHQtdGV4dCcpLm9uKCdibHVyLnNjcDJhLXB0JywgJy5zY3AtcHJvbXB0LXRleHQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpZHggPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ3Byb21wdC1pbmRleCcpLCAxMCk7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCB8fCAhcG9zdC5tZWRpYSB8fCAhcG9zdC5tZWRpYS5wcm9tcHRzW2lkeF0pIHJldHVybjtcbiAgICAgIHBvc3QubWVkaWEucHJvbXB0c1tpZHhdLnByb21wdF90ZXh0ID0gJCh0aGlzKS52YWwoKTtcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBQbGF0Zm9ybSBmaWVsZHMgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdibHVyLnNjcDJhLXBmJywgJy5zY3AtcGxhdGZvcm0tZmllbGQnKS5vbignYmx1ci5zY3AyYS1wZicsICcuc2NwLXBsYXRmb3JtLWZpZWxkJywgZnVuY3Rpb24oKSB7IHNhdmVQbGF0Zm9ybUZpZWxkKCQodGhpcykpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NoYW5nZS5zY3AyYS1wZScsICcuc2NwLXBsYXRmb3JtLWVuYWJsZS1jaGVjaycpLm9uKCdjaGFuZ2Uuc2NwMmEtcGUnLCAnLnNjcC1wbGF0Zm9ybS1lbmFibGUtY2hlY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghUy5zZWxlY3RlZFBvc3RJZCkgcmV0dXJuOyB2YXIgcG9zdCA9IFMucG9zdE1hcFtTLnNlbGVjdGVkUG9zdElkXTsgaWYgKCFwb3N0KSByZXR1cm47XG4gICAgICB2YXIgcGsgPSAkKHRoaXMpLmRhdGEoJ3BsYXRmb3JtJyk7IHZhciBlbmFibGVkID0gJCh0aGlzKS5pcygnOmNoZWNrZWQnKTtcbiAgICAgIHBvc3QucGxhdGZvcm1fY29udGVudCA9IHBvc3QucGxhdGZvcm1fY29udGVudCB8fCB7fTtcbiAgICAgIHBvc3QucGxhdGZvcm1fY29udGVudFtwa10gPSBwb3N0LnBsYXRmb3JtX2NvbnRlbnRbcGtdIHx8IHt9O1xuICAgICAgcG9zdC5wbGF0Zm9ybV9jb250ZW50W3BrXS5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGlmIChtYXliZUFkdmFuY2VTdGF0dXMpIG1heWJlQWR2YW5jZVN0YXR1cyhwb3N0LCAncGxhdGZvcm0gZW5hYmxlZCcpO1xuICAgICAgYnVpbGRNYXBzKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtYXAnLCAnW2RhdGEtYWN0aW9uPVwiYWRkLXBsYXRmb3JtXCJdJykub24oJ2NsaWNrLnNjcDJhLWFwJywgJ1tkYXRhLWFjdGlvbj1cImFkZC1wbGF0Zm9ybVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIHBrID0gJCh0aGlzKS5kYXRhKCdwbGF0Zm9ybScpO1xuICAgICAgaWYgKCFTLnNlbGVjdGVkUG9zdElkKSByZXR1cm47IHZhciBwb3N0ID0gUy5wb3N0TWFwW1Muc2VsZWN0ZWRQb3N0SWRdOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICAgIHBvc3QucGxhdGZvcm1zID0gcG9zdC5wbGF0Zm9ybXMgfHwgW107XG4gICAgICBpZiAocG9zdC5wbGF0Zm9ybXMuaW5kZXhPZihwaykgPCAwKSBwb3N0LnBsYXRmb3Jtcy5wdXNoKHBrKTtcbiAgICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gU2NoZWR1bGUgZmllbGRzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignYmx1ci5zY3AyYS1zY2hmJywgJy5zY3Atc2NoZWR1bGUtZmllbGQnKS5vbignYmx1ci5zY3AyYS1zY2hmJywgJy5zY3Atc2NoZWR1bGUtZmllbGQnLCBmdW5jdGlvbigpIHsgc2F2ZVNjaGVkdWxlRmllbGQoJCh0aGlzKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJhLXNjaGZjJywgJy5zY3Atc2NoZWR1bGUtZmllbGQnKS5vbignY2hhbmdlLnNjcDJhLXNjaGZjJywgJy5zY3Atc2NoZWR1bGUtZmllbGQnLCBmdW5jdGlvbigpIHsgc2F2ZVNjaGVkdWxlRmllbGQoJCh0aGlzKSk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignYmx1ci5zY3AyYS11ZicsICcuc2NwLXVybC1maWVsZCcpLm9uKCdibHVyLnNjcDJhLXVmJywgJy5zY3AtdXJsLWZpZWxkJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgICAgdmFyIHBrID0gJCh0aGlzKS5kYXRhKCdwbGF0Zm9ybScpO1xuICAgICAgcG9zdC5zY2hlZHVsZSA9IHBvc3Quc2NoZWR1bGUgfHwge307IHBvc3Quc2NoZWR1bGUucHVibGlzaGVkX3VybHMgPSBwb3N0LnNjaGVkdWxlLnB1Ymxpc2hlZF91cmxzIHx8IHt9O1xuICAgICAgcG9zdC5zY2hlZHVsZS5wdWJsaXNoZWRfdXJsc1twa10gPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICAgIH0pO1xuXG4gICAgLy8gLS0tIFN0YXR1cyBhY3Rpb25zIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtbXInLCAnW2RhdGEtYWN0aW9uPVwibWFyay1yZWFkeVwiXScpLm9uKCdjbGljay5zY3AyYS1tcicsICdbZGF0YS1hY3Rpb249XCJtYXJrLXJlYWR5XCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHNldFBvc3RTdGF0dXMoJ3JlYWR5Jyk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtbXNjJywgJ1tkYXRhLWFjdGlvbj1cIm1hcmstc2NoZWR1bGVkXCJdJykub24oJ2NsaWNrLnNjcDJhLW1zYycsICdbZGF0YS1hY3Rpb249XCJtYXJrLXNjaGVkdWxlZFwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXRQb3N0U3RhdHVzKCdzY2hlZHVsZWQnKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYS1tcCcsICdbZGF0YS1hY3Rpb249XCJtYXJrLXB1Ymxpc2hlZFwiXScpLm9uKCdjbGljay5zY3AyYS1tcCcsICdbZGF0YS1hY3Rpb249XCJtYXJrLXB1Ymxpc2hlZFwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzZXRQb3N0U3RhdHVzKCdwdWJsaXNoZWQnKTsgfSk7XG5cbiAgICAvLyAtLS0gQUkgYWN0aW9uIGRlbGVnYXRlcyAodG8gUGFydCAyQikgLS0tXG4gICAgdmFyIGFpQWN0aW9ucyA9IFsnYWktcmVzZWFyY2gtYW5nbGVzJywgJ2FpLXJlc2VhcmNoLWhvb2tzJywgJ2FpLXdyaXRlLWNvbnRlbnQnLCAnYWktaW1wcm92ZS1jb250ZW50JyxcbiAgICAgICdhaS1wbGFuLXNsaWRlcycsICdhaS1nZW5lcmF0ZS1zY3JpcHQnLCAnYWktZ2VuZXJhdGUtbWVkaWEnLCAnYWktYWRhcHQtcGxhdGZvcm0nLCAnYWktZ2VuZXJhdGUtdmlzdWFsLXBsYW4nXTtcbiAgICBhaUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmEtJyArIGFjdGlvbiwgJ1tkYXRhLWFjdGlvbj1cIicgKyBhY3Rpb24gKyAnXCJdJykub24oJ2NsaWNrLnNjcDJhLScgKyBhY3Rpb24sICdbZGF0YS1hY3Rpb249XCInICsgYWN0aW9uICsgJ1wiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgYjIgPSB3aW5kb3cuX3NjcFBhcnQyQjtcbiAgICAgICAgaWYgKGIyKSB7XG4gICAgICAgICAgdmFyIGZuTWFwID0ge1xuICAgICAgICAgICAgJ2FpLXJlc2VhcmNoLWFuZ2xlcyc6IGZ1bmN0aW9uKCkgeyBiMi5haVJlc2VhcmNoQW5nbGVzICYmIGIyLmFpUmVzZWFyY2hBbmdsZXMoUy5zZWxlY3RlZFBvc3RJZCwgJCgnLnNjcC1hbmdsZS1jdXN0b20nKS52YWwoKSk7IH0sXG4gICAgICAgICAgICAnYWktcmVzZWFyY2gtaG9va3MnOiBmdW5jdGlvbigpIHsgYjIuYWlSZXNlYXJjaEhvb2tzICYmIGIyLmFpUmVzZWFyY2hIb29rcyhTLnNlbGVjdGVkUG9zdElkLCAkKCcuc2NwLWhvb2stY3VzdG9tJykudmFsKCkpOyB9LFxuICAgICAgICAgICAgJ2FpLXdyaXRlLWNvbnRlbnQnOiBmdW5jdGlvbigpIHsgYjIuYWlXcml0ZUNvbnRlbnQgJiYgYjIuYWlXcml0ZUNvbnRlbnQoUy5zZWxlY3RlZFBvc3RJZCk7IH0sXG4gICAgICAgICAgICAnYWktaW1wcm92ZS1jb250ZW50JzogZnVuY3Rpb24oKSB7IGIyLmFpSW1wcm92ZUNvbnRlbnQgJiYgYjIuYWlJbXByb3ZlQ29udGVudChTLnNlbGVjdGVkUG9zdElkKTsgfSxcbiAgICAgICAgICAgICdhaS1wbGFuLXNsaWRlcyc6IGZ1bmN0aW9uKCkgeyBiMi5haVN1Z2dlc3RTbGlkZXMgJiYgYjIuYWlTdWdnZXN0U2xpZGVzKFMuc2VsZWN0ZWRQb3N0SWQpOyB9LFxuICAgICAgICAgICAgJ2FpLWdlbmVyYXRlLXNjcmlwdCc6IGZ1bmN0aW9uKCkgeyBiMi5haUdlbmVyYXRlU3RydWN0dXJlZFNjcmlwdCAmJiBiMi5haUdlbmVyYXRlU3RydWN0dXJlZFNjcmlwdChTLnNlbGVjdGVkUG9zdElkKTsgfSxcbiAgICAgICAgICAgICdhaS1nZW5lcmF0ZS1tZWRpYSc6IGZ1bmN0aW9uKCkgeyBzYXZlQWxsTWVkaWFDb25maWcoKTsgYjIuYWlHZW5lcmF0ZU1lZGlhUHJvbXB0ICYmIGIyLmFpR2VuZXJhdGVNZWRpYVByb21wdChTLnNlbGVjdGVkUG9zdElkKTsgfSxcbiAgICAgICAgICAgICdhaS1hZGFwdC1wbGF0Zm9ybSc6IGZ1bmN0aW9uKCkgeyB2YXIgcGsgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgncGxhdGZvcm0nKTsgYjIuYWlBZGFwdEZvclBsYXRmb3JtICYmIGIyLmFpQWRhcHRGb3JQbGF0Zm9ybShTLnNlbGVjdGVkUG9zdElkLCBwayk7IH0sXG4gICAgICAgICAgICAnYWktZ2VuZXJhdGUtdmlzdWFsLXBsYW4nOiBmdW5jdGlvbigpIHsgc2F2ZUFsbE1lZGlhQ29uZmlnKCk7IGIyLmFpR2VuZXJhdGVWaXN1YWxQbGFuICYmIGIyLmFpR2VuZXJhdGVWaXN1YWxQbGFuKFMuc2VsZWN0ZWRQb3N0SWQpOyB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAoZm5NYXBbYWN0aW9uXSkgZm5NYXBbYWN0aW9uXSgpO1xuICAgICAgICB9IGVsc2UgeyB0b2FzdCgnQUkgbW9kdWxlIGxvYWRpbmcuLi4nLCAnaW5mbycpOyB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBEdXBsaWNhdGUgcG9zdCAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJhLWR1cCcsICdbZGF0YS1hY3Rpb249XCJkdXBsaWNhdGUtcG9zdFwiXScpLm9uKCdjbGljay5zY3AyYS1kdXAnLCAnW2RhdGEtYWN0aW9uPVwiZHVwbGljYXRlLXBvc3RcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgZHVwbGljYXRlUG9zdCgkKHRoaXMpLmRhdGEoJ2lkJykpOyB9KTtcblxuICAgIC8vIC0tLSBLZXlib2FyZCBzaG9ydGN1dHMgLS0tXG4gICAgJChkb2N1bWVudCkub2ZmKCdrZXlkb3duLnNjcDJhLWtleXMnKS5vbigna2V5ZG93bi5zY3AyYS1rZXlzJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcgfHwgZS50YXJnZXQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyB8fCBlLnRhcmdldC50YWdOYW1lID09PSAnU0VMRUNUJyB8fCBlLnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuO1xuICAgICAgaWYgKChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSAmJiBlLmtleSA9PT0gJ3onICYmICFlLnNoaWZ0S2V5KSB7IGUucHJldmVudERlZmF1bHQoKTsgdW5kbygpOyB9XG4gICAgICBlbHNlIGlmICgoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkgJiYgKGUua2V5ID09PSAneScgfHwgKGUua2V5ID09PSAneicgJiYgZS5zaGlmdEtleSkpKSB7IGUucHJldmVudERlZmF1bHQoKTsgcmVkbygpOyB9XG4gICAgICBlbHNlIGlmICgoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkgJiYgZS5rZXkgPT09ICdzJykgeyBlLnByZXZlbnREZWZhdWx0KCk7IHN5bmNUb1RleHRhcmVhKCk7IGlmIChTLiRzdWJtaXRCdG4gJiYgUy4kc3VibWl0QnRuLmxlbmd0aCkgUy4kc3VibWl0QnRuLmNsaWNrKCk7IH1cbiAgICAgIGVsc2UgaWYgKChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSAmJiBlLmtleSA9PT0gJ24nKSB7IGUucHJldmVudERlZmF1bHQoKTsgd2luZG93Ll9zY3BDcmVhdGVOZXdQb3N0KCk7IH1cbiAgICB9KTtcblxuICAgIC8vIC0tLSBBSSBPdXRwdXQgUmVuZGVyZXIgZXZlbnRzIC0tLVxuICAgIHNldHVwQUlPRXZlbnRzKCk7XG5cbiAgICBjb25zb2xlLmxvZygnW1NDUF0gUGFydCAyQSBldmVudHMgaW5pdGlhbGl6ZWQnKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDE0OiBEQVRBIFNBVkUgSEVMUEVSU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBnZXRTZWxlY3RlZFBvc3QoKSB7IHJldHVybiBTLnNlbGVjdGVkUG9zdElkID8gUy5wb3N0TWFwW1Muc2VsZWN0ZWRQb3N0SWRdIDogbnVsbDsgfVxuXG4gIGZ1bmN0aW9uIHNldE5lc3RlZFZhbHVlKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7IHZhciB0YXJnZXQgPSBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHsgdGFyZ2V0W3BhcnRzW2ldXSA9IHRhcmdldFtwYXJ0c1tpXV0gfHwge307IHRhcmdldCA9IHRhcmdldFtwYXJ0c1tpXV07IH1cbiAgICB0YXJnZXRbcGFydHNbcGFydHMubGVuZ3RoIC0gMV1dID0gdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlQmFzaWNzRmllbGQoJGVsKSB7XG4gICAgdmFyIHBvc3QgPSBnZXRTZWxlY3RlZFBvc3QoKTsgaWYgKCFwb3N0KSByZXR1cm47XG4gICAgdmFyIGZpZWxkID0gJGVsLmRhdGEoJ2ZpZWxkJyk7IHZhciB2YWwgPSAkZWwudmFsKCk7XG4gICAgaWYgKGZpZWxkICYmIGZpZWxkLmluZGV4T2YoJy4nKSA+IC0xKSB7IHNldE5lc3RlZFZhbHVlKHBvc3QsIGZpZWxkLCB2YWwpOyB9XG4gICAgZWxzZSBpZiAoZmllbGQpIHsgcG9zdFtmaWVsZF0gPSB2YWw7IH1cbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlQW5nbGVTZWxlY3Rpb24oaW5kZXgpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QgfHwgIXBvc3QucmVzZWFyY2gpIHJldHVybjtcbiAgICB2YXIgYW5nbGVzID0gcG9zdC5yZXNlYXJjaC5hbmdsZXMgfHwgW107XG4gICAgYW5nbGVzLmZvckVhY2goZnVuY3Rpb24oYSwgaSkgeyBhLnNlbGVjdGVkID0gKGkgPT09IGluZGV4KTsgfSk7XG4gICAgcG9zdC5yZXNlYXJjaC5zZWxlY3RlZF9hbmdsZSA9IGFuZ2xlc1tpbmRleF0gPyBhbmdsZXNbaW5kZXhdLmFuZ2xlIDogJyc7XG4gICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzbmFwc2hvdCgnU2VsZWN0IGFuZ2xlJyk7XG4gICAgaWYgKG1heWJlQWR2YW5jZVN0YXR1cykgbWF5YmVBZHZhbmNlU3RhdHVzKHBvc3QsICdhbmdsZSBzZWxlY3RlZCcpO1xuICAgIGJ1aWxkTWFwcygpOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVIb29rU2VsZWN0aW9uKGluZGV4KSB7XG4gICAgdmFyIHBvc3QgPSBnZXRTZWxlY3RlZFBvc3QoKTsgaWYgKCFwb3N0IHx8ICFwb3N0LnJlc2VhcmNoKSByZXR1cm47XG4gICAgdmFyIGhvb2tzID0gcG9zdC5yZXNlYXJjaC5ob29rcyB8fCBbXTtcbiAgICBob29rcy5mb3JFYWNoKGZ1bmN0aW9uKGgsIGkpIHsgaC5zZWxlY3RlZCA9IChpID09PSBpbmRleCk7IH0pO1xuICAgIHBvc3QucmVzZWFyY2guc2VsZWN0ZWRfaG9vayA9IGhvb2tzW2luZGV4XSA/IGhvb2tzW2luZGV4XS5ob29rIDogJyc7XG4gICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzbmFwc2hvdCgnU2VsZWN0IGhvb2snKTtcbiAgICBpZiAobWF5YmVBZHZhbmNlU3RhdHVzKSBtYXliZUFkdmFuY2VTdGF0dXMocG9zdCwgJ2hvb2sgc2VsZWN0ZWQnKTtcbiAgICBidWlsZE1hcHMoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRSZXNlYXJjaEl0ZW0odHlwZSkge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHBvc3QucmVzZWFyY2ggPSBwb3N0LnJlc2VhcmNoIHx8IHsgYW5nbGVzOiBbXSwgaG9va3M6IFtdLCBzZWxlY3RlZF9hbmdsZTogJycsIHNlbGVjdGVkX2hvb2s6ICcnLCBub3RlczogJycgfTtcbiAgICBpZiAodHlwZSA9PT0gJ2FuZ2xlJykgcG9zdC5yZXNlYXJjaC5hbmdsZXMucHVzaCh7IGlkOiBnZW5lcmF0ZUlkKCdhbmcnKSwgYW5nbGU6ICcnLCBkZXNjcmlwdGlvbjogJycsIHNlbGVjdGVkOiBmYWxzZSB9KTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnaG9vaycpIHBvc3QucmVzZWFyY2guaG9va3MucHVzaCh7IGlkOiBnZW5lcmF0ZUlkKCdoaycpLCBob29rOiAnJywgc2VsZWN0ZWQ6IGZhbHNlIH0pO1xuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgICBpZiAobWF5YmVBZHZhbmNlU3RhdHVzKSBtYXliZUFkdmFuY2VTdGF0dXMocG9zdCwgdHlwZSArICcgYWRkZWQnKTtcbiAgICBidWlsZE1hcHMoKTsgcmVuZGVyKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVSZXNlYXJjaEl0ZW0odHlwZSwgaW5kZXgpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QgfHwgIXBvc3QucmVzZWFyY2gpIHJldHVybjtcbiAgICBpZiAodHlwZSA9PT0gJ2FuZ2xlJyAmJiBwb3N0LnJlc2VhcmNoLmFuZ2xlcykge1xuICAgICAgdmFyIHdhc1NlbGVjdGVkID0gcG9zdC5yZXNlYXJjaC5hbmdsZXNbaW5kZXhdICYmIHBvc3QucmVzZWFyY2guYW5nbGVzW2luZGV4XS5zZWxlY3RlZDtcbiAgICAgIHBvc3QucmVzZWFyY2guYW5nbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICBpZiAod2FzU2VsZWN0ZWQpIHBvc3QucmVzZWFyY2guc2VsZWN0ZWRfYW5nbGUgPSAnJztcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdob29rJyAmJiBwb3N0LnJlc2VhcmNoLmhvb2tzKSB7XG4gICAgICB2YXIgd2FzSG9va1NlbCA9IHBvc3QucmVzZWFyY2guaG9va3NbaW5kZXhdICYmIHBvc3QucmVzZWFyY2guaG9va3NbaW5kZXhdLnNlbGVjdGVkO1xuICAgICAgcG9zdC5yZXNlYXJjaC5ob29rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgaWYgKHdhc0hvb2tTZWwpIHBvc3QucmVzZWFyY2guc2VsZWN0ZWRfaG9vayA9ICcnO1xuICAgIH1cbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVJlc2VhcmNoTm90ZXModmFsKSB7XG4gICAgdmFyIHBvc3QgPSBnZXRTZWxlY3RlZFBvc3QoKTsgaWYgKCFwb3N0KSByZXR1cm47XG4gICAgcG9zdC5yZXNlYXJjaCA9IHBvc3QucmVzZWFyY2ggfHwge307XG4gICAgcG9zdC5yZXNlYXJjaC5ub3RlcyA9IHZhbDtcbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUmVzZWFyY2hDdXN0b21JbnB1dCh0eXBlLCB2YWwpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICBwb3N0LnJlc2VhcmNoID0gcG9zdC5yZXNlYXJjaCB8fCB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ2FuZ2xlJykgcG9zdC5yZXNlYXJjaC5hbmdsZV9jdXN0b21faW5wdXQgPSB2YWw7XG4gICAgZWxzZSBwb3N0LnJlc2VhcmNoLmhvb2tfY3VzdG9tX2lucHV0ID0gdmFsO1xuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVDb21wb3NlckNvbnRlbnQoJHRhKSB7XG4gICAgdmFyIGNvbXBvc2VySWQgPSAkdGEuZGF0YSgnY29tcG9zZXItaWQnKTsgdmFyIHZhbCA9ICR0YS52YWwoKTtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QpIHJldHVybjtcblxuICAgIGlmIChjb21wb3NlcklkID09PSAnbWFzdGVyJykge1xuICAgICAgcG9zdC5jb250ZW50ID0gcG9zdC5jb250ZW50IHx8IHt9O1xuICAgICAgcG9zdC5jb250ZW50LmJvZHkgPSB2YWw7XG4gICAgfSBlbHNlIGlmIChjb21wb3NlcklkICYmIGNvbXBvc2VySWQuaW5kZXhPZigncGxhdGZvcm1fJykgPT09IDApIHtcbiAgICAgIHZhciBwayA9IGNvbXBvc2VySWQucmVwbGFjZSgncGxhdGZvcm1fJywgJycpO1xuICAgICAgcG9zdC5wbGF0Zm9ybV9jb250ZW50ID0gcG9zdC5wbGF0Zm9ybV9jb250ZW50IHx8IHt9O1xuICAgICAgcG9zdC5wbGF0Zm9ybV9jb250ZW50W3BrXSA9IHBvc3QucGxhdGZvcm1fY29udGVudFtwa10gfHwge307XG4gICAgICBwb3N0LnBsYXRmb3JtX2NvbnRlbnRbcGtdLmJvZHkgPSB2YWw7XG4gICAgfVxuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgICAvLyBVcGRhdGUgY2hhciBjb3VudCBkaXNwbGF5XG4gICAgdmFyIGNoYXJMaW1pdCA9IDMwMDA7XG4gICAgaWYgKGNvbXBvc2VySWQgJiYgY29tcG9zZXJJZC5pbmRleE9mKCdwbGF0Zm9ybV8nKSA9PT0gMCkge1xuICAgICAgdmFyIHBDZmcgPSBnZXRQbGF0Zm9ybUNvbmZpZyhjb21wb3NlcklkLnJlcGxhY2UoJ3BsYXRmb3JtXycsICcnKSk7XG4gICAgICBjaGFyTGltaXQgPSBwQ2ZnLmNoYXJfbGltaXQgfHwgMzAwMDtcbiAgICB9XG4gICAgJHRhLmNsb3Nlc3QoJy5zY3AtY29tcG9zZXInKS5maW5kKCcuc2NwLWNvbXBvc2VyLWNoYXItY291bnQnKS5odG1sKGZvcm1hdENoYXJDb3VudChjb3VudENoYXJzKHZhbCksIGNoYXJMaW1pdCkpO1xuICAgIGlmIChtYXliZUFkdmFuY2VTdGF0dXMpIG1heWJlQWR2YW5jZVN0YXR1cyhwb3N0LCAnY29udGVudCB1cGRhdGVkJyk7XG4gICAgYnVpbGRNYXBzKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlU2xpZGVGaWVsZCgkZWwpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICB2YXIgaWR4ID0gcGFyc2VJbnQoJGVsLmRhdGEoJ3NsaWRlLWluZGV4JyksIDEwKTtcbiAgICB2YXIgZmllbGQgPSAkZWwuZGF0YSgnc2xpZGUtZmllbGQnKTsgdmFyIHZhbCA9ICRlbC52YWwoKTtcbiAgICBwb3N0LmNhcm91c2VsID0gcG9zdC5jYXJvdXNlbCB8fCB7IHNsaWRlX2NvdW50OiA1LCBzbGlkZXM6IFtdIH07XG4gICAgd2hpbGUgKHBvc3QuY2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCA8PSBpZHgpIHBvc3QuY2Fyb3VzZWwuc2xpZGVzLnB1c2goeyBpbmRleDogcG9zdC5jYXJvdXNlbC5zbGlkZXMubGVuZ3RoLCB0aGVtZTogJycsIHRleHRfb3ZlcmxheTogJycgfSk7XG4gICAgcG9zdC5jYXJvdXNlbC5zbGlkZXNbaWR4XVtmaWVsZF0gPSB2YWw7XG4gICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0U2xpZGVDb3VudChjb3VudCkge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHBvc3QuY2Fyb3VzZWwgPSBwb3N0LmNhcm91c2VsIHx8IHsgc2xpZGVfY291bnQ6IDUsIHNsaWRlczogW10gfTtcbiAgICBwb3N0LmNhcm91c2VsLnNsaWRlX2NvdW50ID0gY291bnQ7XG4gICAgLy8gVHJpbSBvciBleHRlbmQgc2xpZGVzIGFycmF5XG4gICAgd2hpbGUgKHBvc3QuY2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCA+IGNvdW50KSBwb3N0LmNhcm91c2VsLnNsaWRlcy5wb3AoKTtcbiAgICB3aGlsZSAocG9zdC5jYXJvdXNlbC5zbGlkZXMubGVuZ3RoIDwgY291bnQpIHBvc3QuY2Fyb3VzZWwuc2xpZGVzLnB1c2goeyBpbmRleDogcG9zdC5jYXJvdXNlbC5zbGlkZXMubGVuZ3RoLCB0aGVtZTogJycsIHRleHRfb3ZlcmxheTogJycgfSk7XG4gICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVWaWRlb0ZpZWxkKCRlbCkge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHZhciBmaWVsZCA9ICRlbC5kYXRhKCd2aWRlby1maWVsZCcpOyB2YXIgdmFsID0gJGVsLnZhbCgpO1xuICAgIHBvc3QudmlkZW8gPSBwb3N0LnZpZGVvIHx8IHt9O1xuICAgIHBvc3QudmlkZW9bZmllbGRdID0gdmFsO1xuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFZpZGVvUHJvcGVydHkoZmllbGQsIHZhbCkge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHBvc3QudmlkZW8gPSBwb3N0LnZpZGVvIHx8IHt9O1xuICAgIHBvc3QudmlkZW9bZmllbGRdID0gdmFsO1xuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlTWVkaWFDb25maWdGaWVsZCgkZWwpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICB2YXIgZmllbGQgPSAkZWwuZGF0YSgnY29uZmlnLWZpZWxkJyk7IHZhciB2YWwgPSAkZWwudmFsKCk7XG4gICAgcG9zdC5tZWRpYSA9IHBvc3QubWVkaWEgfHwge307IHBvc3QubWVkaWEuY29uZmlnID0gcG9zdC5tZWRpYS5jb25maWcgfHwge307XG4gICAgcG9zdC5tZWRpYS5jb25maWdbZmllbGRdID0gdmFsO1xuICAgIHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVBbGxNZWRpYUNvbmZpZygpIHtcbiAgICBpZiAoIVMuc2VsZWN0ZWRQb3N0SWQpIHJldHVybjsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbUy5zZWxlY3RlZFBvc3RJZF07IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHBvc3QubWVkaWEgPSBwb3N0Lm1lZGlhIHx8IHt9OyBwb3N0Lm1lZGlhLmNvbmZpZyA9IHBvc3QubWVkaWEuY29uZmlnIHx8IHt9O1xuICAgICQoJy5zY3AtbWVkaWEtY29uZmlnLWZpZWxkJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmaWVsZCA9ICQodGhpcykuZGF0YSgnY29uZmlnLWZpZWxkJyk7XG4gICAgICBpZiAoZmllbGQpIHBvc3QubWVkaWEuY29uZmlnW2ZpZWxkXSA9ICQodGhpcykudmFsKCk7XG4gICAgfSk7XG4gICAgcG9zdC5tZWRpYS5jb25maWcuYnJhbmRfY29udGV4dF9lbmFibGVkID0gJCgnLnNjcC1tZWRpYS1icmFuZC10b2dnbGUnKS5pcygnOmNoZWNrZWQnKTtcbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUGxhdGZvcm1GaWVsZCgkZWwpIHtcbiAgICB2YXIgcG9zdCA9IGdldFNlbGVjdGVkUG9zdCgpOyBpZiAoIXBvc3QpIHJldHVybjtcbiAgICB2YXIgcGsgPSAkZWwuZGF0YSgncGxhdGZvcm0nKTsgdmFyIGZpZWxkID0gJGVsLmRhdGEoJ3BmaWVsZCcpOyB2YXIgdmFsID0gJGVsLnZhbCgpO1xuICAgIHBvc3QucGxhdGZvcm1fY29udGVudCA9IHBvc3QucGxhdGZvcm1fY29udGVudCB8fCB7fTtcbiAgICBwb3N0LnBsYXRmb3JtX2NvbnRlbnRbcGtdID0gcG9zdC5wbGF0Zm9ybV9jb250ZW50W3BrXSB8fCB7fTtcbiAgICBpZiAoZmllbGQgPT09ICd0YWdzJykge1xuICAgICAgcG9zdC5wbGF0Zm9ybV9jb250ZW50W3BrXS50YWdzID0gdmFsLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQudHJpbSgpOyB9KS5maWx0ZXIoQm9vbGVhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc3QucGxhdGZvcm1fY29udGVudFtwa11bZmllbGRdID0gdmFsO1xuICAgIH1cbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gICAgaWYgKG1heWJlQWR2YW5jZVN0YXR1cykgbWF5YmVBZHZhbmNlU3RhdHVzKHBvc3QsICdwbGF0Zm9ybSBjb250ZW50IHVwZGF0ZWQnKTtcbiAgICBidWlsZE1hcHMoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVTY2hlZHVsZUZpZWxkKCRlbCkge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHZhciBmaWVsZCA9ICRlbC5kYXRhKCdzZmllbGQnKTsgdmFyIHZhbCA9ICRlbC52YWwoKTtcbiAgICBwb3N0LnNjaGVkdWxlID0gcG9zdC5zY2hlZHVsZSB8fCB7fTtcbiAgICBwb3N0LnNjaGVkdWxlW2ZpZWxkXSA9IHZhbDtcbiAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7XG4gICAgaWYgKG1heWJlQWR2YW5jZVN0YXR1cykgbWF5YmVBZHZhbmNlU3RhdHVzKHBvc3QsICdzY2hlZHVsZSB1cGRhdGVkJyk7XG4gICAgYnVpbGRNYXBzKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRQb3N0U3RhdHVzKHN0YXR1cykge1xuICAgIHZhciBwb3N0ID0gZ2V0U2VsZWN0ZWRQb3N0KCk7IGlmICghcG9zdCkgcmV0dXJuO1xuICAgIHZhciBvbGRTdGF0dXMgPSBwb3N0LnN0YXR1cztcbiAgICBwb3N0LnN0YXR1cyA9IHN0YXR1czsgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHZhciBvbGRMYWJlbCA9IChDb25zdGFudHMuUE9TVF9TVEFUVVNFU1tvbGRTdGF0dXNdIHx8IHt9KS5sYWJlbCB8fCBvbGRTdGF0dXM7XG4gICAgdmFyIG5ld0xhYmVsID0gKENvbnN0YW50cy5QT1NUX1NUQVRVU0VTW3N0YXR1c10gfHwge30pLmxhYmVsIHx8IHN0YXR1cztcbiAgICBsb2dBY3Rpdml0eSgncG9zdF9zdGF0dXNfY2hhbmdlZCcsIHBvc3QuaWQsIHBvc3QudGl0bGUsICdTdGF0dXM6ICcgKyBvbGRMYWJlbCArICcgXHUyMTkyICcgKyBuZXdMYWJlbCk7XG4gICAgc25hcHNob3QoJ1N0YXR1cyBjaGFuZ2UnKTsgYnVpbGRNYXBzKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpO1xuICAgIHRvYXN0KCdTdGF0dXMgY2hhbmdlZCB0byAnICsgbmV3TGFiZWwsICdzdWNjZXNzJyk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxNTogQVBJIEVYUE9SVFNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgd2luZG93Ll9zY3BQYXJ0MkEgPSB7XG4gICAgc25hcHNob3Q6IHNuYXBzaG90LCB1bmRvOiB1bmRvLCByZWRvOiByZWRvLFxuICAgIG9wZW5Nb2RhbDogb3Blbk1vZGFsLCBjbG9zZU1vZGFsOiBjbG9zZU1vZGFsLFxuICAgIG9wZW5Db25maXJtRGlhbG9nOiBvcGVuQ29uZmlybURpYWxvZywgY2xvc2VDb25maXJtRGlhbG9nOiBjbG9zZUNvbmZpcm1EaWFsb2csXG4gICAgY29sbGVjdE1vZGFsRmllbGRzOiBjb2xsZWN0TW9kYWxGaWVsZHMsXG4gICAgZGVsZXRlUG9zdDogZGVsZXRlUG9zdCwgZHVwbGljYXRlUG9zdDogZHVwbGljYXRlUG9zdCxcbiAgICBwcm9tb3RlUmVzZWFyY2hJZGVhOiBwcm9tb3RlUmVzZWFyY2hJZGVhLFxuICAgIG9wZW5OZXdUb3BpY01vZGFsOiBvcGVuTmV3VG9waWNNb2RhbCwgZWRpdFRvcGljTW9kYWw6IGVkaXRUb3BpY01vZGFsLCBkZWxldGVUb3BpYzogZGVsZXRlVG9waWMsXG4gICAgYWRkUmVzZWFyY2hJdGVtOiBhZGRSZXNlYXJjaEl0ZW0sIHJlbW92ZVJlc2VhcmNoSXRlbTogcmVtb3ZlUmVzZWFyY2hJdGVtLFxuICAgIHNldFBvc3RTdGF0dXM6IHNldFBvc3RTdGF0dXMsXG4gICAgLy8gQUlPdXRwdXRSZW5kZXJlciAoUGhhc2UgQSlcbiAgICByZW5kZXJTdHJ1Y3R1cmVkT3V0cHV0OiByZW5kZXJTdHJ1Y3R1cmVkT3V0cHV0LFxuICAgIGNvbGxlY3RTdHJ1Y3R1cmVkT3V0cHV0RGF0YTogY29sbGVjdFN0cnVjdHVyZWRPdXRwdXREYXRhLFxuICAgIGV4cG9ydFN0cnVjdHVyZWRPdXRwdXQ6IGV4cG9ydFN0cnVjdHVyZWRPdXRwdXQsXG4gICAgT1VUUFVUX1NDSEVNQVM6IE9VVFBVVF9TQ0hFTUFTXG4gIH07XG5cbiAgLy8gR2xvYmFsIEFJTyBzYXZlIGNhbGxiYWNrIFx1MjAxNCBzZXQgYnkgUGFydCAyQiB0byB3aXJlIGlubGluZSBlZGl0cyBiYWNrIHRvIHBvc3QgZGF0YVxuICB3aW5kb3cuX3NjcEFJT1NhdmVGaWVsZCA9IG51bGw7XG5cbiAgY29uc29sZS5sb2coJ1tTQ1BdIFBhcnQgMkEgbG9hZGVkJyk7XG5cbn0pKGpRdWVyeSwgRHJ1cGFsKTtcbiIsICIvKipcbiAqIFNvY2lhbCBDb250ZW50IFBsYW5uZXIgdjEuMCAtIFBhcnQgMkI6IEFJICYgQWR2YW5jZWQgRmVhdHVyZXNcbiAqXG4gKiBNdWx0aS1wcm92aWRlciBBSSAoTExNU2VydmljZSksIGJyYW5kIGNvbnRleHQgKEJyYW5kU2VydmljZSksXG4gKiBnbG9iYWwgcmVzZWFyY2ggd29ya3NwYWNlIChxdWljayArIGFkdmFuY2VkIG1vZGVzKSxcbiAqIDEyIEFJIGFjdGlvbiBmdW5jdGlvbnMsIHNldHRpbmdzICg2IHRhYnMpLCBjb25maWcgQ1JVRCwgaW1wb3J0L2V4cG9ydC5cbiAqXG4gKiBSZWdpc3RyeTogcmVzZWFyY2hWaWV3LCBzZXR1cFJlc2VhcmNoRXZlbnRzLCBzZXR0aW5nc1ZpZXcsIHNldHVwU2V0dGluZ3NFdmVudHNcbiAqXG4gKiBTZWN0aW9uczpcbiAqICAxLiBJbml0ICYgaW1wb3J0c1xuICogIDIuIExMTVNlcnZpY2UgKG11bHRpLXByb3ZpZGVyIEFJIG1hbmFnZW1lbnQpXG4gKiAgMy4gQnJhbmRTZXJ2aWNlIChicmFuZCBjb250ZXh0IGZyb20gRHJ1cGFsIGRpdnMpXG4gKiAgNC4gQUkgcmVzcG9uc2UgcGFyc2luZ1xuICogIDUuIEJyYW5kIHByb21wdCBoZWxwZXJzXG4gKiAgNi4gQUkgYWN0aW9ucyBcdTIwMTQgUmVzZWFyY2ggKGFuZ2xlcywgaG9va3MpXG4gKiAgNy4gQUkgYWN0aW9ucyBcdTIwMTQgQ29udGVudCAod3JpdGUsIGltcHJvdmUsIHNsaWRlcywgc2NyaXB0KVxuICogIDguIEFJIGFjdGlvbnMgXHUyMDE0IE1lZGlhIHByb21wdHNcbiAqICA5LiBBSSBhY3Rpb25zIFx1MjAxNCBQbGF0Zm9ybSBhZGFwdGF0aW9uXG4gKiAxMC4gR2xvYmFsIHJlc2VhcmNoIHZpZXcgKHF1aWNrICsgYWR2YW5jZWQpXG4gKiAxMS4gU2V0dGluZ3MgdmlldyAoNiB0YWJzKVxuICogMTIuIENvbmZpZyBDUlVEICh0b25lcywgYXVkaWVuY2VzLCBpbWFnZSBzdHlsZXMsIHJlc2VhcmNoIHRlbXBsYXRlcylcbiAqIDEzLiBJbXBvcnQvZXhwb3J0XG4gKiAxNC4gRXZlbnRzICYga2V5Ym9hcmQgc2hvcnRjdXRzXG4gKiAxNS4gQVBJIGV4cG9ydHNcbiAqXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG4oZnVuY3Rpb24oJCwgRHJ1cGFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxOiBJTklUICYgSU1QT1JUU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgUywgcmVuZGVyLCBuYXZpZ2F0ZSwgdG9hc3QsIGdlbmVyYXRlSWQsIGJ1aWxkTWFwcywgc3luY1RvVGV4dGFyZWEsIGVzYywgZGVlcENsb25lLCBpY29uO1xuICB2YXIgZm9ybWF0RGF0ZSwgZm9ybWF0UmVsYXRpdmVUaW1lLCBmb3JtYXROdW1iZXIsIHRydW5jYXRlLCBsb2dBY3Rpdml0eSwgY291bnRXb3JkcywgY291bnRDaGFycztcbiAgdmFyIGZvcm1hdENoYXJDb3VudCwgYmFkZ2UsIHN0YXR1c0JhZGdlLCB0eXBlQmFkZ2UsIHByaW9yaXR5QmFkZ2UsIHBsYXRmb3JtQmFkZ2UsIHByb2dyZXNzQmFyO1xuICB2YXIgQ29uc3RhbnRzLCBtYXliZUFkdmFuY2VTdGF0dXMsIHJlc29sdmVUb3BpYywgcmVzb2x2ZVRvbmUsIHJlc29sdmVBdWRpZW5jZSwgcmVzb2x2ZUltYWdlU3R5bGU7XG4gIHZhciBnZXRQbGF0Zm9ybUNvbmZpZywgY2xlYW5BSVRleHQ7XG4gIHZhciBzbmFwc2hvdCwgb3Blbk1vZGFsLCBjbG9zZU1vZGFsLCBvcGVuQ29uZmlybURpYWxvZywgY2xvc2VDb25maXJtRGlhbG9nLCBjb2xsZWN0TW9kYWxGaWVsZHM7XG4gIHZhciBwcm9tb3RlUmVzZWFyY2hJZGVhO1xuXG4gIHZhciBfY2hlY2tDb3VudCA9IDA7XG4gIHZhciBjaGVja0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgX2NoZWNrQ291bnQrKztcbiAgICBpZiAod2luZG93Ll9zY3BQYXJ0MkEgJiYgd2luZG93Ll9zY3BTdGF0ZSAmJiB3aW5kb3cuX3NjcFN0YXRlLmluaXRpYWxpemVkKSB7IGNsZWFySW50ZXJ2YWwoY2hlY2tJbnRlcnZhbCk7IGluaXRQYXJ0MkIoKTsgfVxuICAgIGVsc2UgaWYgKF9jaGVja0NvdW50ID4gMTUwKSB7IGNsZWFySW50ZXJ2YWwoY2hlY2tJbnRlcnZhbCk7IGNvbnNvbGUuZXJyb3IoJ1tTQ1BdIFBhcnQgMkI6IFRpbWVkIG91dCcpOyB9XG4gIH0sIDEwMCk7XG5cbiAgZnVuY3Rpb24gaW5pdFBhcnQyQigpIHtcbiAgICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbU0NQXSBJbml0aWFsaXppbmcgUGFydCAyQi4uLicpO1xuICAgIFMgPSB3aW5kb3cuX3NjcFN0YXRlOyByZW5kZXIgPSB3aW5kb3cuX3NjcFJlbmRlcjsgbmF2aWdhdGUgPSB3aW5kb3cuX3NjcE5hdmlnYXRlO1xuICAgIHRvYXN0ID0gd2luZG93Ll9zY3BUb2FzdDsgZ2VuZXJhdGVJZCA9IHdpbmRvdy5fc2NwR2VuZXJhdGVJZDsgYnVpbGRNYXBzID0gd2luZG93Ll9zY3BCdWlsZE1hcHM7XG4gICAgc3luY1RvVGV4dGFyZWEgPSB3aW5kb3cuX3NjcFN5bmNUb1RleHRhcmVhOyBlc2MgPSB3aW5kb3cuX3NjcEVzYzsgZGVlcENsb25lID0gd2luZG93Ll9zY3BEZWVwQ2xvbmU7XG4gICAgaWNvbiA9IHdpbmRvdy5fc2NwSWNvbjsgZm9ybWF0RGF0ZSA9IHdpbmRvdy5fc2NwRm9ybWF0RGF0ZTsgZm9ybWF0UmVsYXRpdmVUaW1lID0gd2luZG93Ll9zY3BGb3JtYXRSZWxhdGl2ZVRpbWU7XG4gICAgZm9ybWF0TnVtYmVyID0gd2luZG93Ll9zY3BGb3JtYXROdW1iZXI7IHRydW5jYXRlID0gd2luZG93Ll9zY3BUcnVuY2F0ZTsgbG9nQWN0aXZpdHkgPSB3aW5kb3cuX3NjcExvZ0FjdGl2aXR5O1xuICAgIGNvdW50V29yZHMgPSB3aW5kb3cuX3NjcENvdW50V29yZHM7IGNvdW50Q2hhcnMgPSB3aW5kb3cuX3NjcENvdW50Q2hhcnM7XG4gICAgZm9ybWF0Q2hhckNvdW50ID0gd2luZG93Ll9zY3BGb3JtYXRDaGFyQ291bnQ7IGJhZGdlID0gd2luZG93Ll9zY3BCYWRnZTtcbiAgICBzdGF0dXNCYWRnZSA9IHdpbmRvdy5fc2NwU3RhdHVzQmFkZ2U7IHR5cGVCYWRnZSA9IHdpbmRvdy5fc2NwVHlwZUJhZGdlO1xuICAgIHByaW9yaXR5QmFkZ2UgPSB3aW5kb3cuX3NjcFByaW9yaXR5QmFkZ2U7IHBsYXRmb3JtQmFkZ2UgPSB3aW5kb3cuX3NjcFBsYXRmb3JtQmFkZ2U7XG4gICAgcHJvZ3Jlc3NCYXIgPSB3aW5kb3cuX3NjcFByb2dyZXNzQmFyOyBDb25zdGFudHMgPSB3aW5kb3cuX3NjcENvbnN0YW50cztcbiAgICBtYXliZUFkdmFuY2VTdGF0dXMgPSB3aW5kb3cuX3NjcE1heWJlQWR2YW5jZVN0YXR1cztcbiAgICByZXNvbHZlVG9waWMgPSB3aW5kb3cuX3NjcFJlc29sdmVUb3BpYzsgcmVzb2x2ZVRvbmUgPSB3aW5kb3cuX3NjcFJlc29sdmVUb25lO1xuICAgIHJlc29sdmVBdWRpZW5jZSA9IHdpbmRvdy5fc2NwUmVzb2x2ZUF1ZGllbmNlOyByZXNvbHZlSW1hZ2VTdHlsZSA9IHdpbmRvdy5fc2NwUmVzb2x2ZUltYWdlU3R5bGU7XG4gICAgZ2V0UGxhdGZvcm1Db25maWcgPSB3aW5kb3cuX3NjcEdldFBsYXRmb3JtQ29uZmlnO1xuICAgIGNsZWFuQUlUZXh0ID0gd2luZG93Ll9zY3BDbGVhbkFJVGV4dDtcblxuICAgIC8vIFZlcmlmeSBjcml0aWNhbCBpbXBvcnRzXG4gICAgaWYgKCFTKSB7IGNvbnNvbGUuZXJyb3IoJ1tTQ1BdIFBhcnQgMkI6IFN0YXRlIG5vdCBhdmFpbGFibGUnKTsgcmV0dXJuOyB9XG4gICAgaWYgKCFyZW5kZXIpIHsgY29uc29sZS5lcnJvcignW1NDUF0gUGFydCAyQjogcmVuZGVyIG5vdCBhdmFpbGFibGUnKTsgcmV0dXJuOyB9XG4gICAgaWYgKCFpY29uKSB7IGNvbnNvbGUuZXJyb3IoJ1tTQ1BdIFBhcnQgMkI6IGljb24gbm90IGF2YWlsYWJsZScpOyByZXR1cm47IH1cblxuICAgIHZhciBQMkEgPSB3aW5kb3cuX3NjcFBhcnQyQTtcbiAgICBpZiAoIVAyQSkgeyBjb25zb2xlLmVycm9yKCdbU0NQXSBQYXJ0IDJCOiBQYXJ0IDJBIGV4cG9ydHMgbm90IGZvdW5kJyk7IHJldHVybjsgfVxuICAgIHNuYXBzaG90ID0gUDJBLnNuYXBzaG90OyBvcGVuTW9kYWwgPSBQMkEub3Blbk1vZGFsOyBjbG9zZU1vZGFsID0gUDJBLmNsb3NlTW9kYWw7XG4gICAgb3BlbkNvbmZpcm1EaWFsb2cgPSBQMkEub3BlbkNvbmZpcm1EaWFsb2c7IGNsb3NlQ29uZmlybURpYWxvZyA9IFAyQS5jbG9zZUNvbmZpcm1EaWFsb2c7XG4gICAgY29sbGVjdE1vZGFsRmllbGRzID0gUDJBLmNvbGxlY3RNb2RhbEZpZWxkcztcbiAgICBwcm9tb3RlUmVzZWFyY2hJZGVhID0gUDJBLnByb21vdGVSZXNlYXJjaElkZWE7XG5cbiAgICB2YXIgUiA9IHdpbmRvdy5fc2NwUmVuZGVyZXJzID0gd2luZG93Ll9zY3BSZW5kZXJlcnMgfHwge307XG4gICAgUi5yZXNlYXJjaFZpZXcgPSByZW5kZXJSZXNlYXJjaFZpZXc7XG4gICAgUi5zZXR1cFJlc2VhcmNoRXZlbnRzID0gc2V0dXBSZXNlYXJjaEV2ZW50cztcbiAgICBSLnNldHRpbmdzVmlldyA9IHJlbmRlclNldHRpbmdzVmlldztcbiAgICBSLnNldHVwU2V0dGluZ3NFdmVudHMgPSBzZXR1cFNldHRpbmdzRXZlbnRzO1xuICAgIFIuaW1hZ2VzVmlldyA9IHJlbmRlckltYWdlc1ZpZXc7XG4gICAgUi5zZXR1cEltYWdlc0V2ZW50cyA9IHNldHVwSW1hZ2VzRXZlbnRzO1xuICAgIFIuaW1hZ2VQaWNrZXIgPSByZW5kZXJJbWFnZVBpY2tlcjtcblxuICAgIC8vIFJlZ2lzdGVyIEFJTyBpbmxpbmUgZWRpdCBzYXZlIGNhbGxiYWNrIFx1MjAxNCB3aXJlcyBzdHJ1Y3R1cmVkIG91dHB1dCBlZGl0cyBiYWNrIHRvIHBvc3QgZGF0YVxuICAgIHdpbmRvdy5fc2NwQUlPU2F2ZUZpZWxkID0gZnVuY3Rpb24ocG9zdElkLCBwYXRoLCB2YWx1ZSkge1xuICAgICAgdmFyIHBvc3QgPSBTLnBvc3RNYXBbcG9zdElkXTsgaWYgKCFwb3N0KSByZXR1cm47XG4gICAgICAvLyBQYXRoIGZvcm1hdDogXCJhaW9feHh4LnNlY3Rpb25fa2V5LmZpZWxkX2tleVwiIG9yIFwiYWlvX3h4eF9zTi5zZWN0aW9uX2tleS5maWVsZF9rZXlcIlxuICAgICAgLy8gV2UgbmVlZCB0byByZXNvbHZlIHdoaWNoIGRhdGEgZmllbGQgdGhpcyBtYXBzIHRvXG5cbiAgICAgIHZhciAkYWlvID0gJCgnW2RhdGEtYWlvLWlkXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguaW5kZXhPZigkKHRoaXMpLmRhdGEoJ2Fpby1pZCcpKSA9PT0gMDtcbiAgICAgIH0pLmZpcnN0KCk7XG4gICAgICBpZiAoISRhaW8ubGVuZ3RoKSB7IHBvc3QudXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTsgc3luY1RvVGV4dGFyZWEoKTsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBzY2hlbWFJZCA9ICRhaW8uZGF0YSgnc2NoZW1hJyk7XG4gICAgICB2YXIgb2lkID0gJGFpby5kYXRhKCdhaW8taWQnKTtcbiAgICAgIC8vIFN0cmlwIHRoZSBvdXRwdXQgSUQgcHJlZml4IGZyb20gdGhlIHBhdGhcbiAgICAgIHZhciByZWxhdGl2ZVBhdGggPSBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBvaWQucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKSArICdbLl9dPycpLCAnJyk7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgeyBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJldHVybjsgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgdG8gc2F2ZSBiYXNlZCBvbiBzY2hlbWFcbiAgICAgIHZhciB0YXJnZXQgPSBudWxsO1xuICAgICAgaWYgKHNjaGVtYUlkID09PSAnaW1hZ2VfdmlzdWFsX3BsYW4nKSB7XG4gICAgICAgIHBvc3QubWVkaWEgPSBwb3N0Lm1lZGlhIHx8IHt9O1xuICAgICAgICBwb3N0Lm1lZGlhLnZpc3VhbF9wbGFuID0gcG9zdC5tZWRpYS52aXN1YWxfcGxhbiB8fCB7fTtcbiAgICAgICAgdGFyZ2V0ID0gcG9zdC5tZWRpYS52aXN1YWxfcGxhbjtcbiAgICAgIH0gZWxzZSBpZiAoc2NoZW1hSWQgPT09ICd2aWRlb19zY3JpcHQnKSB7XG4gICAgICAgIHBvc3QudmlkZW8gPSBwb3N0LnZpZGVvIHx8IHt9O1xuICAgICAgICBwb3N0LnZpZGVvLnN0cnVjdHVyZWRfc2NyaXB0ID0gcG9zdC52aWRlby5zdHJ1Y3R1cmVkX3NjcmlwdCB8fCB7fTtcbiAgICAgICAgdGFyZ2V0ID0gcG9zdC52aWRlby5zdHJ1Y3R1cmVkX3NjcmlwdDtcbiAgICAgIH0gZWxzZSBpZiAoc2NoZW1hSWQgPT09ICdjYXJvdXNlbF92aXN1YWxfcGxhbicpIHtcbiAgICAgICAgcG9zdC5tZWRpYSA9IHBvc3QubWVkaWEgfHwge307XG4gICAgICAgIHBvc3QubWVkaWEudmlzdWFsX3BsYW5zID0gcG9zdC5tZWRpYS52aXN1YWxfcGxhbnMgfHwgW107XG4gICAgICAgIC8vIEZvciBjYXJvdXNlbCwgdGhlIHBhdGggaW5jbHVkZXMgc2VxdWVuY2UgaW5kZXg6IFwiczAudmlzdWFsX2NvbmNlcHQuc2NlbmVcIlxuICAgICAgICB2YXIgc2VxTWF0Y2ggPSByZWxhdGl2ZVBhdGgubWF0Y2goL15zKFxcZCspXFwuKC4qKS8pO1xuICAgICAgICBpZiAoc2VxTWF0Y2gpIHtcbiAgICAgICAgICB2YXIgc2VxSWR4ID0gcGFyc2VJbnQoc2VxTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICB3aGlsZSAocG9zdC5tZWRpYS52aXN1YWxfcGxhbnMubGVuZ3RoIDw9IHNlcUlkeCkgcG9zdC5tZWRpYS52aXN1YWxfcGxhbnMucHVzaCh7fSk7XG4gICAgICAgICAgdGFyZ2V0ID0gcG9zdC5tZWRpYS52aXN1YWxfcGxhbnNbc2VxSWR4XTtcbiAgICAgICAgICByZWxhdGl2ZVBhdGggPSBzZXFNYXRjaFsyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3N0LnVwZGF0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7IHN5bmNUb1RleHRhcmVhKCk7IHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0ICYmIHJlbGF0aXZlUGF0aCkge1xuICAgICAgICAvLyBTZXQgdmFsdWUgYXQgdGhlIHJlbGF0aXZlIHBhdGggd2l0aGluIHRoZSB0YXJnZXQgb2JqZWN0XG4gICAgICAgIHZhciBwYXJ0cyA9IHJlbGF0aXZlUGF0aC5zcGxpdCgnLicpO1xuICAgICAgICB2YXIgb2JqID0gdGFyZ2V0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgaWYgKC9eXFxkKyQvLnRlc3QocGFydCkpIHtcbiAgICAgICAgICAgIHZhciBhcnJJZHggPSBwYXJzZUludChwYXJ0LCAxMCk7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkob2JqKSkgYnJlYWs7XG4gICAgICAgICAgICB3aGlsZSAob2JqLmxlbmd0aCA8PSBhcnJJZHgpIG9iai5wdXNoKHt9KTtcbiAgICAgICAgICAgIG9iaiA9IG9ialthcnJJZHhdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpbcGFydF0gPSBvYmpbcGFydF0gfHwge307XG4gICAgICAgICAgICBvYmogPSBvYmpbcGFydF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBsYXN0S2V5ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICgvXlxcZCskLy50ZXN0KGxhc3RLZXkpKSB7XG4gICAgICAgICAgLy8gTnVtZXJpYyBsYXN0IGtleSBcdTIxOTIgYXJyYXkgaXRlbSAoc2hvdWxkbid0IGhhcHBlbiBmb3IgZmllbGQgZWRpdHMgYnV0IGhhbmRsZSBpdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbbGFzdEtleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9zdC51cGRhdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgc3luY1RvVGV4dGFyZWEoKTtcbiAgICB9O1xuXG4gICAgc2V0dXBQYXJ0MkJFdmVudHMoKTsgc2V0dXBLZXlib2FyZFNob3J0Y3V0cygpO1xuICAgIExMTVNlcnZpY2UuaW5pdCgpO1xuICAgIHRyeSB7IEJyYW5kU2VydmljZS5pbml0KCk7IEJyYW5kU2VydmljZS5hdXRvUG9wdWxhdGVCcmFuZERlc2lnbigpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ1tTQ1BdIEJyYW5kU2VydmljZSBpbml0IGVycm9yOicsIGUpOyB9XG5cbiAgICAvLyBSZXBsYWNlIGFueSBBSSBwaWNrZXIgbG9hZGluZyBwbGFjZWhvbGRlcnMgZnJvbSBQYXJ0IDJBJ3MgZmlyc3QgcmVuZGVyXG4gICAgJCgnLnNjcC1haS1waWNrZXItbG9hZGluZycpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgYWN0aW9uSWQgPSAkKHRoaXMpLmRhdGEoJ3BlbmRpbmctYWN0aW9uJyk7XG4gICAgICAgIGlmIChhY3Rpb25JZCkgJCh0aGlzKS5yZXBsYWNlV2l0aChMTE1TZXJ2aWNlLnJlbmRlcklubGluZVBpY2tlcihhY3Rpb25JZCkpO1xuICAgICAgfSBjYXRjaChwZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tTQ1BdIEZhaWxlZCB0byByZXBsYWNlIEFJIHBpY2tlciBwbGFjZWhvbGRlcjonLCBwZS5tZXNzYWdlKTtcbiAgICAgICAgJCh0aGlzKS5odG1sKGljb24oJ3dhcm5pbmcnKSArICcgQUknKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBBSSBzdGF0dXMgaW5kaWNhdG9yIGluIGhlYWRlclxuICAgIHVwZGF0ZUFJU3RhdHVzSW5kaWNhdG9yKCk7XG5cbiAgICAvLyBDbGVhciBQYXJ0IDEncyB0aW1lb3V0IGZsYWcgc2luY2Ugd2UgbG9hZGVkIHN1Y2Nlc3NmdWxseVxuICAgIFMuX3BhcnQyYlRpbWVvdXQgPSBmYWxzZTtcblxuICAgIGlmIChyZW5kZXIpIHJlbmRlcigpO1xuICAgIGNvbnNvbGUubG9nKCdbU0NQXSBQYXJ0IDJCIGluaXRpYWxpemVkIFx1MjAxNCByZW5kZXJlcnM6IHJlc2VhcmNoLCBzZXR0aW5ncywgaW1hZ2VzJyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbU0NQXSBQYXJ0IDJCIGluaXQgRkFJTEVEOicsIGUubWVzc2FnZSwgZS5zdGFjayk7XG4gICAgICAvLyBTdGlsbCB0cnkgdG8gc2hvdyB3aGF0IHdlIGNhblxuICAgICAgaWYgKHdpbmRvdy5fc2NwVG9hc3QpIHdpbmRvdy5fc2NwVG9hc3QoJ1BhcnQgMkIgaW5pdCBlcnJvcjogJyArIGUubWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMjogTExNU2VydmljZSAgXHUyMDE0IGV4dHJhY3RlZCB0byBzcmMvYWkvbGxtLXNlcnZpY2UuanMgKHYwLjEuMilcbiAgLy8gICBwbHVzIHByb3ZpZGVyIGFkYXB0ZXJzIGluIHNyYy9haS9wcm92aWRlcnMvKi5qcyAodjAuMS4zKS5cbiAgLy8gTExNU2VydmljZSBpcyBub3cgYHdpbmRvdy5MTE1TZXJ2aWNlYDsgZWFjaCBwcm92aWRlciBpcyByZWdpc3RlcmVkXG4gIC8vIG9uIGB3aW5kb3cuX3NjcEFJUHJvdmlkZXJzWzxpZD5dYC4gUmVmZXJlbmNlcyBiZWxvdyByZXNvbHZlIHZpYSB0aGVcbiAgLy8gbG9jYWwgYWxpYXMgb24gdGhlIG5leHQgbGluZS5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHZhciBMTE1TZXJ2aWNlID0gd2luZG93LkxMTVNlcnZpY2U7XG5cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAzOiBCcmFuZFNlcnZpY2UgIFx1MjAxNCBleHRyYWN0ZWQgdG8gc3JjL2FpL2JyYW5kLXNlcnZpY2UuanMgKHYwLjEuMSlcbiAgLy8gQnJhbmRTZXJ2aWNlIGlzIG5vdyBgd2luZG93LkJyYW5kU2VydmljZWAuIEFsbCByZWZlcmVuY2VzIGJlbG93IHJlc29sdmVcbiAgLy8gdG8gdGhhdCBnbG9iYWwgd2l0aG91dCBhbnkgY29kZSBjaGFuZ2UuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgQnJhbmRTZXJ2aWNlID0gd2luZG93LkJyYW5kU2VydmljZTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTlMgNC02OiBBSSBIRUxQRVJTICsgUkVTRUFSQ0ggQUNUSU9OUyBcdTIwMTQgZXh0cmFjdGVkICh2MC4xLjQpXG4gIC8vICAgNCAgIEFJIFJlc3BvbnNlIFBhcnNpbmcgICAgICAgLT4gc3JjL2FpL19oZWxwZXJzLmpzXG4gIC8vICAgNSAgIEJyYW5kIFByb21wdCBIZWxwZXJzICAgICAgLT4gc3JjL2FpL19oZWxwZXJzLmpzXG4gIC8vICAgNS41IEFJIFJldHJ5IFdyYXBwZXIgICAgICAgICAgLT4gc3JjL2FpL19oZWxwZXJzLmpzXG4gIC8vICAgNS42IEFJIEJ1dHRvbiBMb2FkaW5nIFN0YXRlICAgLT4gc3JjL2FpL19oZWxwZXJzLmpzXG4gIC8vICAgNiAgIFJlc2VhcmNoIEFjdGlvbnMgICAgICAgICAgLT4gc3JjL2FpL2FjdGlvbnMvcmVzZWFyY2guanNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHZhciBwYXJzZUpTT04gICAgICAgICA9IHdpbmRvdy5fc2NwQUlIZWxwZXJzLnBhcnNlSlNPTjtcbiAgdmFyIGV4dHJhY3RCcmFjZUJsb2NrID0gd2luZG93Ll9zY3BBSUhlbHBlcnMuZXh0cmFjdEJyYWNlQmxvY2s7XG4gIHZhciBicmFuZFNuaXBwZXQgICAgICA9IHdpbmRvdy5fc2NwQUlIZWxwZXJzLmJyYW5kU25pcHBldDtcbiAgdmFyIGNhbGxBSVdpdGhSZXRyeSAgID0gd2luZG93Ll9zY3BBSUhlbHBlcnMuY2FsbEFJV2l0aFJldHJ5O1xuICB2YXIgYWlBY3Rpb25Mb2FkaW5nICAgPSB3aW5kb3cuX3NjcEFJSGVscGVycy5haUFjdGlvbkxvYWRpbmc7XG4gIHZhciBhaVJlc2VhcmNoQW5nbGVzICA9IHdpbmRvdy5fc2NwQUlBY3Rpb25zLnJlc2VhcmNoLmFuZ2xlcztcbiAgdmFyIGFpUmVzZWFyY2hIb29rcyAgID0gd2luZG93Ll9zY3BBSUFjdGlvbnMucmVzZWFyY2guaG9va3M7XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gNzogQUkgQUNUSU9OUyBcdTIwMTQgQ09OVEVOVCBcdTIwMTQgZXh0cmFjdGVkICh2MC4xLjUpXG4gIC8vICAgLT4gc3JjL2FpL2FjdGlvbnMvY29udGVudC5qc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIGFpV3JpdGVDb250ZW50ICAgPSB3aW5kb3cuX3NjcEFJQWN0aW9ucy5jb250ZW50LndyaXRlO1xuICB2YXIgYWlJbXByb3ZlQ29udGVudCA9IHdpbmRvdy5fc2NwQUlBY3Rpb25zLmNvbnRlbnQuaW1wcm92ZTtcbiAgdmFyIGFpU3VnZ2VzdFNsaWRlcyAgPSB3aW5kb3cuX3NjcEFJQWN0aW9ucy5jb250ZW50LnNsaWRlcztcbiAgdmFyIGFpR2VuZXJhdGVTY3JpcHQgPSB3aW5kb3cuX3NjcEFJQWN0aW9ucy5jb250ZW50LnNjcmlwdDtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA4OiBBSSBBQ1RJT05TIFx1MjAxNCBNRURJQSBQUk9NUFRTIFx1MjAxNCBleHRyYWN0ZWQgKHYwLjEuNilcbiAgLy8gICAtPiBzcmMvYWkvYWN0aW9ucy9tZWRpYS5qc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIGJ1aWxkU3RydWN0dXJlZFByb21wdCA9IHdpbmRvdy5fc2NwQUlBY3Rpb25zLm1lZGlhLmJ1aWxkU3RydWN0dXJlZDtcbiAgdmFyIGFpR2VuZXJhdGVNZWRpYVByb21wdCA9IHdpbmRvdy5fc2NwQUlBY3Rpb25zLm1lZGlhLmdlbmVyYXRlO1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDguNTogQUkgQUNUSU9OUyBcdTIwMTQgVklTVUFMIFBMQU4gKyBTVFJVQ1RVUkVEIFNDUklQVCBcdTIwMTQgZXh0cmFjdGVkICh2MC4xLjYpXG4gIC8vICAgLT4gc3JjL2FpL2FjdGlvbnMvdmlzdWFsLmpzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgYWlHZW5lcmF0ZVZpc3VhbFBsYW4gICAgICAgPSB3aW5kb3cuX3NjcEFJQWN0aW9ucy52aXN1YWwucGxhbjtcbiAgdmFyIGFpR2VuZXJhdGVTdHJ1Y3R1cmVkU2NyaXB0ID0gd2luZG93Ll9zY3BBSUFjdGlvbnMudmlzdWFsLnNjcmlwdDtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiA5OiBBSSBBQ1RJT05TIFx1MjAxNCBQTEFURk9STSBBREFQVEFUSU9OIFx1MjAxNCBleHRyYWN0ZWQgKHYwLjEuNClcbiAgLy8gICAtPiBzcmMvYWkvYWN0aW9ucy9wbGF0Zm9ybS5qc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIGFpQWRhcHRGb3JQbGF0Zm9ybSA9IHdpbmRvdy5fc2NwQUlBY3Rpb25zLnBsYXRmb3JtLmFkYXB0O1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDEwOiBHTE9CQUwgUkVTRUFSQ0ggVklFV1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiByZW5kZXJSZXNlYXJjaFZpZXcoKSB7XG4gICAgdmFyIHJlc2VhcmNoTW9kZSA9IFMuX3Jlc2VhcmNoTW9kZSB8fCAncXVpY2snO1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtdmlldyBzY3Atdmlldy1yZXNlYXJjaFwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlclwiPjxkaXYgY2xhc3M9XCJzY3Atdmlldy1oZWFkZXItbGVmdFwiPjxoMT4nICsgaWNvbignZmxhc2snKSArICcgUmVzZWFyY2g8L2gxPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlci1yaWdodFwiPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gJyArIChyZXNlYXJjaE1vZGUgPT09ICdxdWljaycgPyAnc2NwLWJ0bi1wcmltYXJ5JyA6ICdzY3AtYnRuLW91dGxpbmUnKSArICcgc2NwLWJ0bi1zbVwiIGRhdGEtYWN0aW9uPVwicmVzZWFyY2gtbW9kZVwiIGRhdGEtbW9kZT1cInF1aWNrXCI+JyArIGljb24oJ2JvbHQnKSArICcgUXVpY2s8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuICcgKyAocmVzZWFyY2hNb2RlID09PSAnYWR2YW5jZWQnID8gJ3NjcC1idG4tcHJpbWFyeScgOiAnc2NwLWJ0bi1vdXRsaW5lJykgKyAnIHNjcC1idG4tc21cIiBkYXRhLWFjdGlvbj1cInJlc2VhcmNoLW1vZGVcIiBkYXRhLW1vZGU9XCJhZHZhbmNlZFwiPicgKyBpY29uKCdmbGFzaycpICsgJyBBZHZhbmNlZDwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcblxuICAgIGlmIChyZXNlYXJjaE1vZGUgPT09ICdxdWljaycpIHtcbiAgICAgIGh0bWwgKz0gcmVuZGVyUXVpY2tSZXNlYXJjaCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9IHJlbmRlckFkdmFuY2VkUmVzZWFyY2goKTtcbiAgICB9XG5cbiAgICAvLyBTZXNzaW9uIGhpc3RvcnlcbiAgICB2YXIgc2Vzc2lvbnMgPSAoUy5kYXRhLnJlc2VhcmNoICYmIFMuZGF0YS5yZXNlYXJjaC5zZXNzaW9ucykgfHwgW107XG4gICAgaWYgKHNlc3Npb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2VjdGlvblwiPjxkaXYgY2xhc3M9XCJzY3Atc2VjdGlvbi1oZWFkZXJcIj48aDI+UGFzdCBTZXNzaW9uczwvaDI+PC9kaXY+JztcbiAgICAgIGZvciAodmFyIHNpID0gc2Vzc2lvbnMubGVuZ3RoIC0gMTsgc2kgPj0gMDsgc2ktLSkge1xuICAgICAgICB2YXIgc2VzID0gc2Vzc2lvbnNbc2ldO1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXJlc2VhcmNoLXNlc3Npb25cIiBkYXRhLXNlc3Npb24taWQ9XCInICsgZXNjKHNlcy5pZCkgKyAnXCI+JztcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1zZXNzaW9uLWhlYWRlclwiPic7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtcmVzZWFyY2gtc2Vzc2lvbi1pbmZvXCI+JztcbiAgICAgICAgaHRtbCArPSAnPHN0cm9uZz4nICsgZXNjKHNlcy50b3BpYyB8fCBzZXMudGl0bGUgfHwgJ1Jlc2VhcmNoIFNlc3Npb24nKSArICc8L3N0cm9uZz4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXNtIHNjcC10ZXh0LW11dGVkXCI+JyArIGVzYyhzZXMudHlwZSA9PT0gJ2FkdmFuY2VkJyA/ICdBZHZhbmNlZCcgOiAnUXVpY2snKSArICcgXHUyMDIyICcgKyAoc2VzLnJlc3VsdHMgfHwgW10pLmxlbmd0aCArICcgaWRlYXMgXHUyMDIyICcgKyBmb3JtYXREYXRlKHNlcy5jcmVhdGVkKSArICc8L3NwYW4+JztcbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1zZXNzaW9uLWFjdGlvbnNcIj4nO1xuICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0bi1pY29uXCIgZGF0YS1hY3Rpb249XCJyZW5hbWUtcmVzZWFyY2gtc2Vzc2lvblwiIGRhdGEtc2Vzc2lvbi1pZD1cIicgKyBlc2Moc2VzLmlkKSArICdcIiB0aXRsZT1cIlJlbmFtZVwiPicgKyBpY29uKCdlZGl0JykgKyAnPC9idXR0b24+JztcbiAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvbiBzY3AtYnRuLWRlbGV0ZS1zbVwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLXJlc2VhcmNoLXNlc3Npb25cIiBkYXRhLXNlc3Npb24taWQ9XCInICsgZXNjKHNlcy5pZCkgKyAnXCIgdGl0bGU9XCJEZWxldGUgc2Vzc2lvblwiPicgKyBpY29uKCd0cmFzaCcpICsgJzwvYnV0dG9uPic7XG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICAgIC8vIFJlc3VsdHMgZ3JpZFxuICAgICAgICBpZiAoc2VzLnJlc3VsdHMgJiYgc2VzLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtcmVzZWFyY2gtcmVzdWx0c1wiPic7XG4gICAgICAgICAgZm9yICh2YXIgcmkgPSAwOyByaSA8IHNlcy5yZXN1bHRzLmxlbmd0aDsgcmkrKykge1xuICAgICAgICAgICAgdmFyIGlkZWEgPSBzZXMucmVzdWx0c1tyaV07IHZhciBwdCA9IENvbnN0YW50cy5QT1NUX1RZUEVTW2lkZWEudHlwZV0gfHwgeyBpY29uOiAnY2lyY2xlJywgY29sb3I6ICcjODA4NjhiJywgbGFiZWw6IGlkZWEudHlwZSB9O1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLWNhcmQnICsgKGlkZWEucHJvbW90ZWQgPyAnIHNjcC1yZXNlYXJjaC1pZGVhLXByb21vdGVkJyA6ICcnKSArICdcIj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLXRvcFwiPic7XG4gICAgICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLXRpdGxlXCI+JyArIGVzYyhpZGVhLnRpdGxlIHx8ICcnKSArICc8L3NwYW4+JztcbiAgICAgICAgICAgIGh0bWwgKz0gdHlwZUJhZGdlKGlkZWEudHlwZSk7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICAgICAgaWYgKGlkZWEuaG9vaykgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLWhvb2tcIj5cIicgKyBlc2ModHJ1bmNhdGUoaWRlYS5ob29rLCA4MCkpICsgJ1wiPC9kaXY+JztcbiAgICAgICAgICAgIGlmIChpZGVhLnJlYXNvbmluZykgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLXJlYXNvbmluZ1wiPicgKyBlc2ModHJ1bmNhdGUoaWRlYS5yZWFzb25pbmcsIDEwMCkpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICAvLyBSYXRpbmdcbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtcmVzZWFyY2gtaWRlYS1yYXRpbmdcIj4nO1xuICAgICAgICAgICAgZm9yICh2YXIgc3RhciA9IDE7IHN0YXIgPD0gNTsgc3RhcisrKSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1zdGFyJyArIChzdGFyIDw9IChpZGVhLnJhdGluZyB8fCAwKSA/ICcgc2NwLXN0YXItZmlsbGVkJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cInJhdGUtaWRlYVwiIGRhdGEtc2Vzc2lvbj1cIicgKyBlc2Moc2VzLmlkKSArICdcIiBkYXRhLWlkZWE9XCInICsgZXNjKGlkZWEuaWQpICsgJ1wiIGRhdGEtcmF0aW5nPVwiJyArIHN0YXIgKyAnXCI+XHUyNjA1PC9zcGFuPic7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1yZXNlYXJjaC1pZGVhLWFjdGlvbnNcIj4nO1xuICAgICAgICAgICAgaWYgKGlkZWEucHJvbW90ZWQpIGh0bWwgKz0gYmFkZ2UoJ1Byb21vdGVkJywgJyMwNTk2NjknKTtcbiAgICAgICAgICAgIGVsc2UgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbSBzY3AtYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cInByb21vdGUtaWRlYVwiIGRhdGEtc2Vzc2lvbj1cIicgKyBlc2Moc2VzLmlkKSArICdcIiBkYXRhLWlkZWE9XCInICsgZXNjKGlkZWEuaWQpICsgJ1wiPicgKyBpY29uKCdwbHVzJykgKyAnIENyZWF0ZSBQb3N0PC9idXR0b24+JztcbiAgICAgICAgICAgIGh0bWwgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgIH1cbiAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlclF1aWNrUmVzZWFyY2goKSB7XG4gICAgdmFyIHN0ZyA9IFMubWV0YS5zZXR0aW5ncyB8fCB7fTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLXJlc2VhcmNoLXBhbmVsXCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNlY3Rpb24taGVhZGVyXCI+PGgzPicgKyBpY29uKCdib2x0JykgKyAnIFF1aWNrIElkZWF0aW9uPC9oMz48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5Ub3BpYyAvIEJyaWVmPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBjbGFzcz1cInNjcC10ZXh0YXJlYVwiIGlkPVwic2NwUmVzZWFyY2hUb3BpY1wiIHJvd3M9XCIyXCIgcGxhY2Vob2xkZXI9XCJlLmcuIEFJIGF1dG9tYXRpb24gZm9yIHNtYWxsIGJ1c2luZXNzZXMuLi5cIj48L3RleHRhcmVhPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXJvd1wiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXRoaXJkXCI+PGxhYmVsPlBsYXRmb3JtczwvbGFiZWw+PHNlbGVjdCBjbGFzcz1cInNjcC1zZWxlY3RcIiBpZD1cInNjcFJlc2VhcmNoUGxhdGZvcm1cIj48b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+JztcbiAgICBmb3IgKHZhciBwayBpbiBDb25zdGFudHMuUExBVEZPUk1TKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHBrICsgJ1wiPicgKyBDb25zdGFudHMuUExBVEZPUk1TW3BrXS5sYWJlbCArICc8L29wdGlvbj4nO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXRoaXJkXCI+PGxhYmVsPlRvbmU8L2xhYmVsPjxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0XCIgaWQ9XCJzY3BSZXNlYXJjaFRvbmVcIj48b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+JztcbiAgICAoc3RnLnRvbmVzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHQpIHsgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBlc2ModC5pZCkgKyAnXCI+JyArIGVzYyh0Lm5hbWUpICsgJzwvb3B0aW9uPic7IH0pO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXRoaXJkXCI+PGxhYmVsPklkZWFzPC9sYWJlbD48c2VsZWN0IGNsYXNzPVwic2NwLXNlbGVjdFwiIGlkPVwic2NwUmVzZWFyY2hDb3VudFwiPic7XG4gICAgWzQsIDYsIDgsIDEwXS5mb3JFYWNoKGZ1bmN0aW9uKG4pIHsgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBuICsgJ1wiJyArIChuID09PSA2ID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBuICsgJzwvb3B0aW9uPic7IH0pO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsIGNsYXNzPVwic2NwLXRvZ2dsZS1sYWJlbFwiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInNjcFJlc2VhcmNoQnJhbmRcIj4gSW5jbHVkZSBCcmFuZCBDb250ZXh0PC9sYWJlbD48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtcmVzZWFyY2gtYWN0aW9uc1wiPjxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tYWlcIiBkYXRhLWFjdGlvbj1cInJ1bi1xdWljay1yZXNlYXJjaFwiIGlkPVwic2NwUnVuUXVpY2tcIj4nICsgaWNvbignc3BhcmtsZXMnKSArICcgR2VuZXJhdGUgSWRlYXM8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gTExNU2VydmljZS5yZW5kZXJJbmxpbmVQaWNrZXIoJ3Jlc2VhcmNoX3F1aWNrJykgKyAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyQWR2YW5jZWRSZXNlYXJjaCgpIHtcbiAgICB2YXIgdGVtcGxhdGVzID0gKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MucmVzZWFyY2hfdGVtcGxhdGVzKSB8fCBbXTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLXJlc2VhcmNoLXBhbmVsXCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNlY3Rpb24taGVhZGVyXCI+PGgzPicgKyBpY29uKCdmbGFzaycpICsgJyBBZHZhbmNlZCBSZXNlYXJjaDwvaDM+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+VGVtcGxhdGU8L2xhYmVsPjxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0XCIgaWQ9XCJzY3BSZXNlYXJjaFRlbXBsYXRlXCI+JztcbiAgICBmb3IgKHZhciB0aSA9IDA7IHRpIDwgdGVtcGxhdGVzLmxlbmd0aDsgdGkrKykgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBlc2ModGVtcGxhdGVzW3RpXS5pZCkgKyAnXCI+JyArIGVzYyh0ZW1wbGF0ZXNbdGldLm5hbWUpICsgJyBcdTIwMTQgJyArIGVzYyh0ZW1wbGF0ZXNbdGldLmRlc2NyaXB0aW9uIHx8ICcnKSArICc8L29wdGlvbj4nO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBpZD1cInNjcFRlbXBsYXRlVmFyc1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsIGNsYXNzPVwic2NwLXRvZ2dsZS1sYWJlbFwiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInNjcFJlc2VhcmNoQnJhbmRBZHZcIj4gSW5jbHVkZSBCcmFuZCBDb250ZXh0PC9sYWJlbD48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtcmVzZWFyY2gtYWN0aW9uc1wiPjxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tYWlcIiBkYXRhLWFjdGlvbj1cInJ1bi1hZHZhbmNlZC1yZXNlYXJjaFwiPicgKyBpY29uKCdzcGFya2xlcycpICsgJyBSdW4gUmVzZWFyY2g8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gTExNU2VydmljZS5yZW5kZXJJbmxpbmVQaWNrZXIoJ3Jlc2VhcmNoX2FkdmFuY2VkJykgKyAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcnVuUXVpY2tSZXNlYXJjaCgpIHtcbiAgICB2YXIgdG9waWMgPSAkKCcjc2NwUmVzZWFyY2hUb3BpYycpLnZhbCgpO1xuICAgIGlmICghdG9waWMgfHwgIXRvcGljLnRyaW0oKSkgeyB0b2FzdCgnRW50ZXIgYSB0b3BpYycsICd3YXJuaW5nJyk7IHJldHVybjsgfVxuICAgIGlmICghTExNU2VydmljZS5pc0NvbmZpZ3VyZWQoKSkgeyB0b2FzdCgnTm8gQUkgcHJvdmlkZXJzIGNvbmZpZ3VyZWQnLCAnd2FybmluZycpOyByZXR1cm47IH1cbiAgICB2YXIgcGxhdGZvcm0gPSAkKCcjc2NwUmVzZWFyY2hQbGF0Zm9ybScpLnZhbCgpO1xuICAgIHZhciB0b25lID0gJCgnI3NjcFJlc2VhcmNoVG9uZScpLnZhbCgpO1xuICAgIHZhciBjb3VudCA9IHBhcnNlSW50KCQoJyNzY3BSZXNlYXJjaENvdW50JykudmFsKCksIDEwKSB8fCA2O1xuICAgIHZhciB1c2VCcmFuZCA9ICQoJyNzY3BSZXNlYXJjaEJyYW5kJykuaXMoJzpjaGVja2VkJyk7XG5cbiAgICB0b2FzdCgnUmVzZWFyY2hpbmcgaWRlYXMuLi4nLCAnaW5mbycpO1xuICAgICQoJyNzY3BSdW5RdWljaycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkuaHRtbChpY29uKCdzcGFya2xlcycpICsgJyBHZW5lcmF0aW5nLi4uJyk7XG5cbiAgICB2YXIgd3MgPSAoUy5tZXRhLndvcmtzcGFjZSAmJiBTLm1ldGEud29ya3NwYWNlLm5hbWUpIHx8ICcnO1xuICAgIHZhciBwcm9tcHQgPSAnWW91IGFyZSBhIHNvY2lhbCBtZWRpYSBzdHJhdGVnaXN0JyArICh3cyA/ICcgZm9yIFwiJyArIHdzICsgJ1wiJyA6ICcnKSArICcuXFxuXFxuR2VuZXJhdGUgJyArIGNvdW50ICsgJyBjcmVhdGl2ZSBwb3N0IGlkZWFzOlxcbi0gVG9waWM6ICcgKyB0b3BpYyArICdcXG4nO1xuICAgIGlmIChwbGF0Zm9ybSkgcHJvbXB0ICs9ICctIFBsYXRmb3JtOiAnICsgKENvbnN0YW50cy5QTEFURk9STVNbcGxhdGZvcm1dIHx8IHt9KS5sYWJlbCArICdcXG4nO1xuICAgIGlmICh0b25lKSB7IHZhciB0T2JqID0gcmVzb2x2ZVRvbmUodG9uZSk7IGlmICh0T2JqKSBwcm9tcHQgKz0gJy0gVG9uZTogJyArIHRPYmoubmFtZSArICdcXG4nOyB9XG4gICAgaWYgKHVzZUJyYW5kKSBwcm9tcHQgKz0gYnJhbmRTbmlwcGV0KCdyZXNlYXJjaCcpO1xuICAgIHByb21wdCArPSAnXFxuRm9yIGVhY2ggaWRlYSBwcm92aWRlOiB0aXRsZSwgYW5nbGUsIGhvb2ssIHR5cGUgKGltYWdlL2Nhcm91c2VsL3ZpZGVvL3RleHQpLCBwbGF0Zm9ybXMgKGFycmF5KSwgY3RhX3N1Z2dlc3Rpb24sIHJlYXNvbmluZywgc3VnZ2VzdGVkX3RvcGljcyAoYXJyYXkgb2YgdG9waWMgbmFtZXMpLlxcblxcblJlc3BvbmQgT05MWSBhcyBKU09OOiBbe1widGl0bGVcIjpcIi4uLlwiLFwiYW5nbGVcIjpcIi4uLlwiLFwiaG9va1wiOlwiLi4uXCIsXCJ0eXBlXCI6XCIuLi5cIixcInBsYXRmb3Jtc1wiOlsuLi5dLFwiY3RhX3N1Z2dlc3Rpb25cIjpcIi4uLlwiLFwicmVhc29uaW5nXCI6XCIuLi5cIixcInN1Z2dlc3RlZF90b3BpY3NcIjpbLi4uXX1dJztcblxuICAgIHZhciBzZXNzaW9uSWQgPSBnZW5lcmF0ZUlkKCdycycpO1xuICAgIExMTVNlcnZpY2UuY2FsbEFJKHByb21wdCwgZnVuY3Rpb24odGV4dCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGlkZWFzID0gcGFyc2VKU09OKHRleHQpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaWRlYXMpKSBpZGVhcyA9IGlkZWFzLmlkZWFzIHx8IGlkZWFzLnJlc3VsdHMgfHwgW107XG4gICAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICAgIGlkOiBzZXNzaW9uSWQsIHRpdGxlOiB0cnVuY2F0ZSh0b3BpYywgNTApLCB0b3BpYzogdG9waWMsIHR5cGU6ICdxdWljaycsXG4gICAgICAgICAgaW5wdXQ6IHsgdG9waWM6IHRvcGljLCB0ZW1wbGF0ZV9pZDogJycsIHZhcmlhYmxlczoge30sIHRhcmdldF9wbGF0Zm9ybXM6IHBsYXRmb3JtID8gW3BsYXRmb3JtXSA6IFtdLCB0YXJnZXRfdHlwZXM6IFtdLCBjdXN0b21faW5zdHJ1Y3Rpb25zOiAnJywgYnJhbmRfY29udGV4dF9lbmFibGVkOiB1c2VCcmFuZCB9LFxuICAgICAgICAgIHJlc3VsdHM6IGlkZWFzLm1hcChmdW5jdGlvbihpZGVhKSB7XG4gICAgICAgICAgICByZXR1cm4geyBpZDogZ2VuZXJhdGVJZCgncmknKSwgdGl0bGU6IGlkZWEudGl0bGUgfHwgJycsIGFuZ2xlOiBpZGVhLmFuZ2xlIHx8ICcnLCBob29rOiBpZGVhLmhvb2sgfHwgJycsIHR5cGU6IGlkZWEudHlwZSB8fCAnaW1hZ2UnLCBwbGF0Zm9ybXM6IGlkZWEucGxhdGZvcm1zIHx8IFtdLCBjdGFfc3VnZ2VzdGlvbjogaWRlYS5jdGFfc3VnZ2VzdGlvbiB8fCAnJywgcmVhc29uaW5nOiBpZGVhLnJlYXNvbmluZyB8fCAnJywgdG9waWNzOiBpZGVhLnN1Z2dlc3RlZF90b3BpY3MgfHwgaWRlYS5zdWdnZXN0ZWRfdGFncyB8fCBbXSwgcHJvbW90ZWQ6IGZhbHNlLCBwcm9tb3RlZF9wb3N0X2lkOiAnJywgcmF0aW5nOiAwIH07XG4gICAgICAgICAgfSksXG4gICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLCB1cGRhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgUy5kYXRhLnJlc2VhcmNoID0gUy5kYXRhLnJlc2VhcmNoIHx8IHsgc2Vzc2lvbnM6IFtdIH07XG4gICAgICAgIFMuZGF0YS5yZXNlYXJjaC5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICAgICAgICBsb2dBY3Rpdml0eSgncmVzZWFyY2hfY29tcGxldGVkJywgJycsICcnLCAnUXVpY2sgcmVzZWFyY2g6ICcgKyBzZXNzaW9uLnJlc3VsdHMubGVuZ3RoICsgJyBpZGVhcycpO1xuICAgICAgICBzbmFwc2hvdCgnUXVpY2sgcmVzZWFyY2gnKTsgYnVpbGRNYXBzKCk7IHJlbmRlcigpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICAgICAgICB0b2FzdCgnR2VuZXJhdGVkICcgKyBzZXNzaW9uLnJlc3VsdHMubGVuZ3RoICsgJyBpZGVhcyEnLCAnc3VjY2VzcycpO1xuICAgICAgfSBjYXRjaChlKSB7IHRvYXN0KCdQYXJzZSBlcnJvcjogJyArIGUubWVzc2FnZSwgJ2Vycm9yJyk7IH1cbiAgICAgICQoJyNzY3BSdW5RdWljaycpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpLmh0bWwoaWNvbignc3BhcmtsZXMnKSArICcgR2VuZXJhdGUgSWRlYXMnKTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIHRvYXN0KCdBSSBFcnJvcjogJyArIGVyciwgJ2Vycm9yJyk7XG4gICAgICAkKCcjc2NwUnVuUXVpY2snKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKS5odG1sKGljb24oJ3NwYXJrbGVzJykgKyAnIEdlbmVyYXRlIElkZWFzJyk7XG4gICAgfSwgJ3Jlc2VhcmNoX3F1aWNrJywgdXNlQnJhbmQgPyBCcmFuZFNlcnZpY2UuZ2V0U3lzdGVtUHJvbXB0KCdzb2NpYWwnKSA6ICcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkFkdmFuY2VkUmVzZWFyY2goKSB7XG4gICAgdmFyIHRlbXBsYXRlSWQgPSAkKCcjc2NwUmVzZWFyY2hUZW1wbGF0ZScpLnZhbCgpO1xuICAgIHZhciB0ZW1wbGF0ZXMgPSAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5yZXNlYXJjaF90ZW1wbGF0ZXMpIHx8IFtdO1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlcy5maW5kKGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQuaWQgPT09IHRlbXBsYXRlSWQ7IH0pO1xuICAgIGlmICghdGVtcGxhdGUpIHsgdG9hc3QoJ1NlbGVjdCBhIHRlbXBsYXRlJywgJ3dhcm5pbmcnKTsgcmV0dXJuOyB9XG4gICAgaWYgKCFMTE1TZXJ2aWNlLmlzQ29uZmlndXJlZCgpKSB7IHRvYXN0KCdObyBBSSBwcm92aWRlcnMgY29uZmlndXJlZCcsICd3YXJuaW5nJyk7IHJldHVybjsgfVxuXG4gICAgdmFyIHZhcnMgPSB7fTtcbiAgICAodGVtcGxhdGUudmFyaWFibGVzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHsgdmFyc1t2XSA9ICgkKCcjc2NwVmFyXycgKyB2KS52YWwoKSB8fCAnJykudHJpbSgpOyB9KTtcbiAgICB2YXIgdXNlQnJhbmQgPSAkKCcjc2NwUmVzZWFyY2hCcmFuZEFkdicpLmlzKCc6Y2hlY2tlZCcpO1xuXG4gICAgdmFyIHByb21wdCA9IHRlbXBsYXRlLnByb21wdDtcbiAgICBmb3IgKHZhciB2ayBpbiB2YXJzKSBwcm9tcHQgPSBwcm9tcHQucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxceycgKyB2ayArICdcXFxcfScsICdnJyksIHZhcnNbdmtdIHx8ICcnKTtcbiAgICBpZiAodXNlQnJhbmQpIHByb21wdCArPSBicmFuZFNuaXBwZXQoJ3Jlc2VhcmNoJyk7XG5cbiAgICB0b2FzdCgnUnVubmluZyByZXNlYXJjaC4uLicsICdpbmZvJyk7XG4gICAgdmFyIHNlc3Npb25JZCA9IGdlbmVyYXRlSWQoJ3JzJyk7XG4gICAgTExNU2VydmljZS5jYWxsQUkocHJvbXB0LCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaWRlYXMgPSBwYXJzZUpTT04odGV4dCk7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShpZGVhcykpIGlkZWFzID0gaWRlYXMuaWRlYXMgfHwgaWRlYXMucmVzdWx0cyB8fCBbXTtcbiAgICAgICAgdmFyIHNlc3Npb24gPSB7XG4gICAgICAgICAgaWQ6IHNlc3Npb25JZCwgdGl0bGU6IHRlbXBsYXRlLm5hbWUgKyAnIFx1MjAxNCAnICsgKHZhcnMudG9waWMgfHwgdmFycy5waWxsYXIgfHwgJ1Jlc2VhcmNoJyksIHRvcGljOiB2YXJzLnRvcGljIHx8IHZhcnMucGlsbGFyIHx8ICcnLCB0eXBlOiAnYWR2YW5jZWQnLFxuICAgICAgICAgIGlucHV0OiB7IHRvcGljOiB2YXJzLnRvcGljIHx8ICcnLCB0ZW1wbGF0ZV9pZDogdGVtcGxhdGVJZCwgdmFyaWFibGVzOiB2YXJzLCB0YXJnZXRfcGxhdGZvcm1zOiBbXSwgdGFyZ2V0X3R5cGVzOiBbXSwgY3VzdG9tX2luc3RydWN0aW9uczogJycsIGJyYW5kX2NvbnRleHRfZW5hYmxlZDogdXNlQnJhbmQgfSxcbiAgICAgICAgICByZXN1bHRzOiBpZGVhcy5tYXAoZnVuY3Rpb24oaWRlYSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgaWQ6IGdlbmVyYXRlSWQoJ3JpJyksIHRpdGxlOiBpZGVhLnRpdGxlIHx8ICcnLCBhbmdsZTogaWRlYS5hbmdsZSB8fCAnJywgaG9vazogaWRlYS5ob29rIHx8ICcnLCB0eXBlOiBpZGVhLnR5cGUgfHwgJ2ltYWdlJywgcGxhdGZvcm1zOiBpZGVhLnBsYXRmb3JtcyB8fCBbXSwgY3RhX3N1Z2dlc3Rpb246IGlkZWEuY3RhX3N1Z2dlc3Rpb24gfHwgJycsIHJlYXNvbmluZzogaWRlYS5yZWFzb25pbmcgfHwgJycsIHRvcGljczogaWRlYS5zdWdnZXN0ZWRfdG9waWNzIHx8IGlkZWEuc3VnZ2VzdGVkX3RhZ3MgfHwgW10sIHByb21vdGVkOiBmYWxzZSwgcHJvbW90ZWRfcG9zdF9pZDogJycsIHJhdGluZzogMCB9O1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSwgdXBkYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIFMuZGF0YS5yZXNlYXJjaC5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICAgICAgICBsb2dBY3Rpdml0eSgncmVzZWFyY2hfY29tcGxldGVkJywgJycsICcnLCAnQWR2YW5jZWQgcmVzZWFyY2g6ICcgKyBzZXNzaW9uLnJlc3VsdHMubGVuZ3RoICsgJyBpZGVhcycpO1xuICAgICAgICBzbmFwc2hvdCgnQWR2YW5jZWQgcmVzZWFyY2gnKTsgYnVpbGRNYXBzKCk7IHJlbmRlcigpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICAgICAgICB0b2FzdCgnR2VuZXJhdGVkICcgKyBzZXNzaW9uLnJlc3VsdHMubGVuZ3RoICsgJyBpZGVhcyEnLCAnc3VjY2VzcycpO1xuICAgICAgfSBjYXRjaChlKSB7IHRvYXN0KCdQYXJzZSBlcnJvcjogJyArIGUubWVzc2FnZSwgJ2Vycm9yJyk7IH1cbiAgICB9LCBmdW5jdGlvbihlcnIpIHsgdG9hc3QoJ0FJIEVycm9yOiAnICsgZXJyLCAnZXJyb3InKTsgfSwgJ3Jlc2VhcmNoX2FkdmFuY2VkJywgdXNlQnJhbmQgPyBCcmFuZFNlcnZpY2UuZ2V0U3lzdGVtUHJvbXB0KCdzb2NpYWwnKSA6ICcnKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDExOiBTRVRUSU5HUyBWSUVXICg2IHRhYnMpXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHJlbmRlclNldHRpbmdzVmlldygpIHtcbiAgICB2YXIgdGFiID0gUy5zZXR0aW5nc1RhYiB8fCAnd29ya3NwYWNlJztcbiAgICB2YXIgdGFicyA9IFtcbiAgICAgIHsga2V5OiAnd29ya3NwYWNlJywgIGxhYmVsOiAnV29ya3NwYWNlJywgIGljb246ICdicmllZmNhc2UnIH0sXG4gICAgICB7IGtleTogJ3BsYXRmb3JtcycsICBsYWJlbDogJ1BsYXRmb3JtcycsICAgaWNvbjogJ3NoYXJlLW5vZGVzJyB9LFxuICAgICAgeyBrZXk6ICdjb250ZW50JywgICAgbGFiZWw6ICdDb250ZW50JywgICAgIGljb246ICdwZW4tZmFuY3knIH0sXG4gICAgICB7IGtleTogJ21lZGlhJywgICAgICBsYWJlbDogJ01lZGlhJywgICAgICAgaWNvbjogJ2ltYWdlJyB9LFxuICAgICAgeyBrZXk6ICdyZXNlYXJjaCcsICAgbGFiZWw6ICdSZXNlYXJjaCcsICAgIGljb246ICdmbGFzaycgfSxcbiAgICAgIHsga2V5OiAnYWknLCAgICAgICAgIGxhYmVsOiAnQUknLCAgICAgICAgICBpY29uOiAnc3BhcmtsZXMnIH0sXG4gICAgICB7IGtleTogJ2JyYW5kX2Rlc2lnbicsIGxhYmVsOiAnQnJhbmQgRGVzaWduJywgaWNvbjogJ3BhbGV0dGUnIH1cbiAgICBdO1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3AtdmlldyBzY3Atdmlldy1zZXR0aW5nc1wiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlclwiPjxoMT4nICsgaWNvbignZ2VhcicpICsgJyBTZXR0aW5nczwvaDE+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXRhYnNcIj4nO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHQgPSB0YWJzW2ldO1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1zZXR0aW5ncy10YWInICsgKHRhYiA9PT0gdC5rZXkgPyAnIHNjcC1zZXR0aW5ncy10YWItYWN0aXZlJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cInNldHRpbmdzLXRhYlwiIGRhdGEtdGFiPVwiJyArIHQua2V5ICsgJ1wiPicgKyBpY29uKHQuaWNvbikgKyAnICcgKyBlc2ModC5sYWJlbCkgKyAnPC9idXR0b24+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3MtYm9keVwiPic7XG4gICAgc3dpdGNoKHRhYikge1xuICAgICAgY2FzZSAnd29ya3NwYWNlJzogIGh0bWwgKz0gcmVuZGVyV29ya3NwYWNlU2V0dGluZ3MoKTsgYnJlYWs7XG4gICAgICBjYXNlICdwbGF0Zm9ybXMnOiAgaHRtbCArPSByZW5kZXJQbGF0Zm9ybVNldHRpbmdzKCk7IGJyZWFrO1xuICAgICAgY2FzZSAnY29udGVudCc6ICAgIGh0bWwgKz0gcmVuZGVyQ29udGVudFNldHRpbmdzKCk7IGJyZWFrO1xuICAgICAgY2FzZSAnbWVkaWEnOiAgICAgIGh0bWwgKz0gcmVuZGVyTWVkaWFTZXR0aW5ncygpOyBicmVhaztcbiAgICAgIGNhc2UgJ3Jlc2VhcmNoJzogICBodG1sICs9IHJlbmRlclJlc2VhcmNoU2V0dGluZ3MoKTsgYnJlYWs7XG4gICAgICBjYXNlICdhaSc6ICAgICAgICAgaHRtbCArPSByZW5kZXJBSVNldHRpbmdzKCk7IGJyZWFrO1xuICAgICAgY2FzZSAnYnJhbmRfZGVzaWduJzogaHRtbCArPSByZW5kZXJCcmFuZERlc2lnblNldHRpbmdzKCk7IGJyZWFrO1xuICAgIH1cbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyV29ya3NwYWNlU2V0dGluZ3MoKSB7XG4gICAgdmFyIHdzID0gKFMubWV0YSAmJiBTLm1ldGEud29ya3NwYWNlKSB8fCB7fTsgdmFyIHN0ZyA9IChTLm1ldGEgJiYgUy5tZXRhLnNldHRpbmdzKSB8fCB7fTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXBhbmVsXCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+V29ya3NwYWNlIE5hbWU8L2xhYmVsPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1zZXR0aW5ncy1maWVsZFwiIGRhdGEtcGF0aD1cIndvcmtzcGFjZS5uYW1lXCIgdmFsdWU9XCInICsgZXNjKHdzLm5hbWUgfHwgJycpICsgJ1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkRlc2NyaXB0aW9uPC9sYWJlbD48dGV4dGFyZWEgY2xhc3M9XCJzY3AtdGV4dGFyZWEgc2NwLXNldHRpbmdzLWZpZWxkXCIgZGF0YS1wYXRoPVwid29ya3NwYWNlLmRlc2NyaXB0aW9uXCIgcm93cz1cIjJcIj4nICsgZXNjKHdzLmRlc2NyaXB0aW9uIHx8ICcnKSArICc8L3RleHRhcmVhPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXJvd1wiPjxkaXYgY2xhc3M9XCJzY3AtZm9ybS10aGlyZFwiPjxsYWJlbD5UaW1lem9uZTwvbGFiZWw+PHNlbGVjdCBjbGFzcz1cInNjcC1zZWxlY3Qgc2NwLXNldHRpbmdzLWZpZWxkXCIgZGF0YS1wYXRoPVwic2V0dGluZ3MudGltZXpvbmVcIj4nO1xuICAgIFsnVVRDJywgJ0FtZXJpY2EvTmV3X1lvcmsnLCAnQW1lcmljYS9DaGljYWdvJywgJ0FtZXJpY2EvTG9zX0FuZ2VsZXMnLCAnRXVyb3BlL0xvbmRvbicsICdFdXJvcGUvUGFyaXMnLCAnQXNpYS9Ub2t5bycsICdBc2lhL0tvbGthdGEnXS5mb3JFYWNoKGZ1bmN0aW9uKHR6KSB7IGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgdHogKyAnXCInICsgKHN0Zy50aW1lem9uZSA9PT0gdHogPyAnIHNlbGVjdGVkJyA6ICcnKSArICc+JyArIHR6ICsgJzwvb3B0aW9uPic7IH0pO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXRoaXJkXCI+PGxhYmVsPkNhcmQgRGVuc2l0eTwvbGFiZWw+PHNlbGVjdCBjbGFzcz1cInNjcC1zZWxlY3Qgc2NwLXNldHRpbmdzLWZpZWxkXCIgZGF0YS1wYXRoPVwic2V0dGluZ3MuY2FyZF9kZW5zaXR5XCI+JztcbiAgICBmb3IgKHZhciBkIGluIENvbnN0YW50cy5DQVJEX0RFTlNJVElFUykgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBkICsgJ1wiJyArIChzdGcuY2FyZF9kZW5zaXR5ID09PSBkID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBDb25zdGFudHMuQ0FSRF9ERU5TSVRJRVNbZF0ubGFiZWwgKyAnPC9vcHRpb24+JztcbiAgICBodG1sICs9ICc8L3NlbGVjdD48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS10aGlyZFwiPjxsYWJlbD5EZWZhdWx0IFZpZXc8L2xhYmVsPjxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1zZXR0aW5ncy1maWVsZFwiIGRhdGEtcGF0aD1cInNldHRpbmdzLmRlZmF1bHRfdmlld1wiPic7XG4gICAgZm9yICh2YXIgdiBpbiBDb25zdGFudHMuQVBQX1ZJRVdTKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHYgKyAnXCInICsgKHN0Zy5kZWZhdWx0X3ZpZXcgPT09IHYgPyAnIHNlbGVjdGVkJyA6ICcnKSArICc+JyArIENvbnN0YW50cy5BUFBfVklFV1Nbdl0ubGFiZWwgKyAnPC9vcHRpb24+JztcbiAgICBodG1sICs9ICc8L3NlbGVjdD48L2Rpdj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3MtYWN0aW9uc1wiPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJleHBvcnQtanNvblwiPicgKyBpY29uKCdkb3dubG9hZCcpICsgJyBFeHBvcnQgQWxsPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImltcG9ydC1qc29uXCI+JyArIGljb24oJ3VwbG9hZCcpICsgJyBJbXBvcnQ8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiZmlsZVwiIGlkPVwic2NwSW1wb3J0RmlsZVwiIGFjY2VwdD1cIi5qc29uXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tcHJpbWFyeVwiIGRhdGEtYWN0aW9uPVwic2F2ZS1zZXR0aW5nc1wiPicgKyBpY29uKCdjaGVjaycpICsgJyBTYXZlPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyUGxhdGZvcm1TZXR0aW5ncygpIHtcbiAgICB2YXIgcGxhdGZvcm1zID0gKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MucGxhdGZvcm1zKSB8fCB7fTtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXBhbmVsXCI+JztcbiAgICBmb3IgKHZhciBwayBpbiBDb25zdGFudHMuUExBVEZPUk1TKSB7XG4gICAgICB2YXIgcGwgPSBDb25zdGFudHMuUExBVEZPUk1TW3BrXTsgdmFyIGNmZyA9IHBsYXRmb3Jtc1twa10gfHwge307XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXNlY3Rpb25cIiBzdHlsZT1cImJvcmRlci1sZWZ0OjNweCBzb2xpZCAnICsgcGwuY29sb3IgKyAnXCI+JztcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZmxleC1iZXR3ZWVuXCI+PGgzIHN0eWxlPVwiY29sb3I6JyArIHBsLmNvbG9yICsgJ1wiPicgKyBpY29uKHBsLmljb24pICsgJyAnICsgZXNjKHBsLmxhYmVsKSArICc8L2gzPic7XG4gICAgICBodG1sICs9ICc8bGFiZWwgY2xhc3M9XCJzY3AtdG9nZ2xlLWxhYmVsXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2NwLXBsYXRmb3JtLXNldHRpbmdcIiBkYXRhLXBrPVwiJyArIHBrICsgJ1wiIGRhdGEtZmllbGQ9XCJlbmFibGVkXCInICsgKGNmZy5lbmFibGVkICE9PSBmYWxzZSA/ICcgY2hlY2tlZCcgOiAnJykgKyAnPiBFbmFibGVkPC9sYWJlbD48L2Rpdj4nO1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXJvd1wiPic7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0taGFsZlwiPjxsYWJlbD5IYW5kbGU8L2xhYmVsPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1wbGF0Zm9ybS1zZXR0aW5nXCIgZGF0YS1waz1cIicgKyBwayArICdcIiBkYXRhLWZpZWxkPVwiaGFuZGxlXCIgdmFsdWU9XCInICsgZXNjKGNmZy5oYW5kbGUgfHwgJycpICsgJ1wiPjwvZGl2Pic7XG4gICAgICBpZiAocGsgPT09ICd5b3V0dWJlJykge1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0taGFsZlwiPjxsYWJlbD5UaXRsZSBMaW1pdDwvbGFiZWw+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtcGxhdGZvcm0tc2V0dGluZ1wiIGRhdGEtcGs9XCInICsgcGsgKyAnXCIgZGF0YS1maWVsZD1cInRpdGxlX2xpbWl0XCIgdmFsdWU9XCInICsgKGNmZy50aXRsZV9saW1pdCB8fCAxMDApICsgJ1wiPjwvZGl2Pic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0taGFsZlwiPjxsYWJlbD5DaGFyIExpbWl0PC9sYWJlbD48aW5wdXQgdHlwZT1cIm51bWJlclwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1wbGF0Zm9ybS1zZXR0aW5nXCIgZGF0YS1waz1cIicgKyBwayArICdcIiBkYXRhLWZpZWxkPVwiY2hhcl9saW1pdFwiIHZhbHVlPVwiJyArIChjZmcuY2hhcl9saW1pdCB8fCAzMDAwKSArICdcIj48L2Rpdj4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1hY3Rpb25zXCI+PGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJzYXZlLXNldHRpbmdzXCI+JyArIGljb24oJ2NoZWNrJykgKyAnIFNhdmU8L2J1dHRvbj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJDb250ZW50U2V0dGluZ3MoKSB7XG4gICAgdmFyIHN0ZyA9IFMubWV0YS5zZXR0aW5ncyB8fCB7fTsgdmFyIGRlZnMgPSBzdGcuZGVmYXVsdHMgfHwge307XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1wYW5lbFwiPic7XG4gICAgaHRtbCArPSByZW5kZXJDb25maWdDUlVEKCdUb25lcycsICd0b25lJywgc3RnLnRvbmVzIHx8IFtdKTtcbiAgICBodG1sICs9IHJlbmRlckNvbmZpZ0NSVUQoJ0F1ZGllbmNlcycsICdhdWRpZW5jZScsIHN0Zy5hdWRpZW5jZXMgfHwgW10pO1xuICAgIC8vIERlZmF1bHRzXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPkRlZmF1bHQgUG9zdCBTZXR0aW5nczwvaDM+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tcm93XCI+PGRpdiBjbGFzcz1cInNjcC1mb3JtLWhhbGZcIj48bGFiZWw+RGVmYXVsdCBUeXBlPC9sYWJlbD48c2VsZWN0IGNsYXNzPVwic2NwLXNlbGVjdCBzY3AtZGVmYXVsdC1maWVsZFwiIGRhdGEtZGVmYXVsdD1cInR5cGVcIj4nO1xuICAgIGZvciAodmFyIHRrIGluIENvbnN0YW50cy5QT1NUX1RZUEVTKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHRrICsgJ1wiJyArIChkZWZzLnR5cGUgPT09IHRrID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBDb25zdGFudHMuUE9TVF9UWVBFU1t0a10ubGFiZWwgKyAnPC9vcHRpb24+JztcbiAgICBodG1sICs9ICc8L3NlbGVjdD48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1oYWxmXCI+PGxhYmVsPkRlZmF1bHQgUHJpb3JpdHk8L2xhYmVsPjxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1kZWZhdWx0LWZpZWxkXCIgZGF0YS1kZWZhdWx0PVwicHJpb3JpdHlcIj4nO1xuICAgIGZvciAodmFyIHBrIGluIENvbnN0YW50cy5QUklPUklUWV9MRVZFTFMpIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgcGsgKyAnXCInICsgKGRlZnMucHJpb3JpdHkgPT09IHBrID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBDb25zdGFudHMuUFJJT1JJVFlfTEVWRUxTW3BrXS5sYWJlbCArICc8L29wdGlvbj4nO1xuICAgIGh0bWwgKz0gJzwvc2VsZWN0PjwvZGl2PjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1hY3Rpb25zXCI+PGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJzYXZlLXNldHRpbmdzXCI+JyArIGljb24oJ2NoZWNrJykgKyAnIFNhdmU8L2J1dHRvbj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJNZWRpYVNldHRpbmdzKCkge1xuICAgIHZhciBzdGcgPSBTLm1ldGEuc2V0dGluZ3MgfHwge307XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1wYW5lbFwiPic7XG4gICAgaHRtbCArPSByZW5kZXJDb25maWdDUlVEKCdJbWFnZSBTdHlsZXMnLCAnaW1hZ2Vfc3R5bGUnLCBzdGcuaW1hZ2Vfc3R5bGVzIHx8IFtdKTtcbiAgICAvLyBQcm9tcHQgdGVtcGxhdGVzXG4gICAgdmFyIG1wdCA9IHN0Zy5tZWRpYV9wcm9tcHRfdGVtcGxhdGVzIHx8IHt9O1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3Mtc2VjdGlvblwiPjxoMz5NZWRpYSBQcm9tcHQgVGVtcGxhdGVzPC9oMz4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5JbWFnZSBUZW1wbGF0ZTwvbGFiZWw+PHRleHRhcmVhIGNsYXNzPVwic2NwLXRleHRhcmVhIHNjcC1tcHQtZmllbGRcIiBkYXRhLW1wdD1cImltYWdlXCIgcm93cz1cIjRcIj4nICsgZXNjKG1wdC5pbWFnZSB8fCAnJykgKyAnPC90ZXh0YXJlYT48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5DYXJvdXNlbCBUZW1wbGF0ZTwvbGFiZWw+PHRleHRhcmVhIGNsYXNzPVwic2NwLXRleHRhcmVhIHNjcC1tcHQtZmllbGRcIiBkYXRhLW1wdD1cImNhcm91c2VsX2JhdGNoXCIgcm93cz1cIjRcIj4nICsgZXNjKG1wdC5jYXJvdXNlbF9iYXRjaCB8fCAnJykgKyAnPC90ZXh0YXJlYT48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5UaHVtYm5haWwgVGVtcGxhdGU8L2xhYmVsPjx0ZXh0YXJlYSBjbGFzcz1cInNjcC10ZXh0YXJlYSBzY3AtbXB0LWZpZWxkXCIgZGF0YS1tcHQ9XCJ0aHVtYm5haWxcIiByb3dzPVwiNFwiPicgKyBlc2MobXB0LnRodW1ibmFpbCB8fCAnJykgKyAnPC90ZXh0YXJlYT48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1hY3Rpb25zXCI+PGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJzYXZlLXNldHRpbmdzXCI+JyArIGljb24oJ2NoZWNrJykgKyAnIFNhdmU8L2J1dHRvbj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJSZXNlYXJjaFNldHRpbmdzKCkge1xuICAgIHZhciB0ZW1wbGF0ZXMgPSAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5yZXNlYXJjaF90ZW1wbGF0ZXMpIHx8IFtdO1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3MtcGFuZWxcIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3Mtc2VjdGlvblwiPjxkaXYgY2xhc3M9XCJzY3AtZmxleC1iZXR3ZWVuXCI+PGgzPlJlc2VhcmNoIFRlbXBsYXRlczwvaDM+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRkLXJlc2VhcmNoLXRlbXBsYXRlXCI+JyArIGljb24oJ3BsdXMnKSArICcgTmV3PC9idXR0b24+PC9kaXY+JztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlbXBsYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHQgPSB0ZW1wbGF0ZXNbaV07XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWNvbmZpZy1pdGVtXCI+PHNwYW4gY2xhc3M9XCJzY3AtY29uZmlnLWl0ZW0tbmFtZVwiPicgKyBlc2ModC5uYW1lKSArICc8L3NwYW4+JztcbiAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLXRleHQteHMgc2NwLXRleHQtbXV0ZWRcIj4nICsgZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpICsgJzwvc3Bhbj4nO1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvblwiIGRhdGEtYWN0aW9uPVwiZWRpdC1yZXNlYXJjaC10ZW1wbGF0ZVwiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgaWNvbignZWRpdCcpICsgJzwvYnV0dG9uPic7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0bi1pY29uIHNjcC1idG4tZGVsZXRlLXNtXCIgZGF0YS1hY3Rpb249XCJkZWxldGUtcmVzZWFyY2gtdGVtcGxhdGVcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGljb24oJ3RyYXNoJykgKyAnPC9idXR0b24+PC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLWFjdGlvbnNcIj48YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cInNhdmUtc2V0dGluZ3NcIj4nICsgaWNvbignY2hlY2snKSArICcgU2F2ZTwvYnV0dG9uPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckFJU2V0dGluZ3MoKSB7XG4gICAgdmFyIHN0ZyA9IFMubWV0YS5zZXR0aW5ncyB8fCB7fTsgdmFyIHByZWZzID0gUy5tZXRhLmFpUHJlZmVyZW5jZXMgfHwge307XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1wYW5lbFwiPic7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDAgQUkgU3RhdHVzIHN1bW1hcnkgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdib2x0JykgKyAnIEFJIFN0YXR1czwvaDM+JztcbiAgICBpZiAoTExNU2VydmljZS5pc0NvbmZpZ3VyZWQoKSkge1xuICAgICAgdmFyIHByb3ZDb3VudCA9IExMTVNlcnZpY2UuZ2V0UHJvdmlkZXJDb3VudCgpO1xuICAgICAgdmFyIG1vZGVsQ291bnQgPSBMTE1TZXJ2aWNlLmdldFRvdGFsTW9kZWxDb3VudCgpO1xuICAgICAgdmFyIGRlZiA9IExMTVNlcnZpY2UuZ2V0RGVmYXVsdCgpO1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1zdGF0dXMtc3VtbWFyeSBzY3AtYWktc3RhdHVzLXN1bW1hcnktb2tcIj4nO1xuICAgICAgaHRtbCArPSBpY29uKCdjaXJjbGUtY2hlY2snKSArICcgPHN0cm9uZz4nICsgcHJvdkNvdW50ICsgJyBwcm92aWRlcicgKyAocHJvdkNvdW50ID4gMSA/ICdzJyA6ICcnKSArICc8L3N0cm9uZz4gYWN0aXZlIHdpdGggPHN0cm9uZz4nICsgbW9kZWxDb3VudCArICcgbW9kZWwnICsgKG1vZGVsQ291bnQgPiAxID8gJ3MnIDogJycpICsgJzwvc3Ryb25nPic7XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXN0YXR1cy1zdW1tYXJ5IHNjcC1haS1zdGF0dXMtc3VtbWFyeS1vZmZcIj4nO1xuICAgICAgaHRtbCArPSBpY29uKCd3YXJuaW5nJykgKyAnIDxzdHJvbmc+Tm8gQUkgcHJvdmlkZXJzIGZvdW5kPC9zdHJvbmc+JztcbiAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXNldHVwLWd1aWRlXCI+JztcbiAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic2NwLXRleHQtc21cIj5UbyBlbmFibGUgQUkgZmVhdHVyZXM6PC9wPic7XG4gICAgICBodG1sICs9ICc8b2wgY2xhc3M9XCJzY3AtYWktc2V0dXAtc3RlcHNcIj4nO1xuICAgICAgaHRtbCArPSAnPGxpPkdvIHRvIHlvdXIgPHN0cm9uZz51c2VyIHByb2ZpbGU8L3N0cm9uZz4gZWRpdCBwYWdlPC9saT4nO1xuICAgICAgaHRtbCArPSAnPGxpPkZpbmQgdGhlIDxzdHJvbmc+TExNIENvbmZpZzwvc3Ryb25nPiBmaWVsZCAoSlNPTiB0ZXh0YXJlYSk8L2xpPic7XG4gICAgICBodG1sICs9ICc8bGk+QWRkIHlvdXIgQVBJIGtleXMgYW5kIG1vZGVsIGNvbmZpZ3VyYXRpb248L2xpPic7XG4gICAgICBodG1sICs9ICc8bGk+TWFrZSBzdXJlIHRoZSBjb25maWcgZGl2IGlzIGV4cG9zZWQgdmlhIDxzdHJvbmc+RHJ1cGFsIFZpZXdzPC9zdHJvbmc+IG9uIHRoaXMgcGFnZTwvbGk+JztcbiAgICAgIGh0bWwgKz0gJzwvb2w+JztcbiAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic2NwLXRleHQteHMgc2NwLXRleHQtbXV0ZWRcIj5UaGUgYXBwIGxvb2tzIGZvciA8Y29kZT4ubGxtLWNvbmZpZy1kYXRhPC9jb2RlPiBvciA8Y29kZT4ubGxtLWJyYW5kLWNvbmZpZy1kYXRhPC9jb2RlPiBkaXZzIG9uIHRoZSBwYWdlLjwvcD4nO1xuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1zdGF0dXMtYWN0aW9uc1wiPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1vdXRsaW5lIHNjcC1idG4tc21cIiBkYXRhLWFjdGlvbj1cInJlc2Nhbi1haS1jb25maWdcIj4nICsgaWNvbigncmVmcmVzaCcpICsgJyBSZS1zY2FuIFBhZ2U8L2J1dHRvbj4nO1xuICAgIGlmIChMTE1TZXJ2aWNlLmlzQ29uZmlndXJlZCgpKSB7XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLW91dGxpbmUgc2NwLWJ0bi1zbVwiIGRhdGEtYWN0aW9uPVwidGVzdC1haS1jb25uZWN0aW9uXCI+JyArIGljb24oJ2JvbHQnKSArICcgVGVzdCBEZWZhdWx0PC9idXR0b24+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBEZWZhdWx0IFByb3ZpZGVyIFBpY2tlciBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBpZiAoTExNU2VydmljZS5pc0NvbmZpZ3VyZWQoKSkge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdzdGFyJykgKyAnIERlZmF1bHQgUHJvdmlkZXIgJiBNb2RlbDwvaDM+JztcbiAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic2NwLXRleHQtc20gc2NwLXRleHQtbXV0ZWRcIj5UaGlzIGlzIHVzZWQgZm9yIGFsbCBBSSBhY3Rpb25zIHVubGVzcyBvdmVycmlkZGVuIHBlci1hY3Rpb24uIENoYW5nZXMgdGFrZSBlZmZlY3QgaW1tZWRpYXRlbHkuPC9wPic7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLWRlZmF1bHQtcGlja2VyXCI+JztcbiAgICAgIGh0bWwgKz0gTExNU2VydmljZS5yZW5kZXJJbmxpbmVQaWNrZXIoJ2FwcC1kZWZhdWx0Jyk7XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgLy8gU2hvdyB3aGF0IHRoZSByZXNvbHZlZCBkZWZhdWx0IGlzXG4gICAgICB2YXIgZGVmID0gTExNU2VydmljZS5nZXREZWZhdWx0KCk7XG4gICAgICBpZiAoZGVmKSB7XG4gICAgICAgIHZhciBkZWZJbmZvID0gTExNU2VydmljZS5nZXRQcm92aWRlckluZm8oZGVmLnByb3ZpZGVyKTtcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1kZWZhdWx0LWluZm9cIj4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXhzIHNjcC10ZXh0LW11dGVkXCI+UmVzb2x2ZWQgZGVmYXVsdDogPHN0cm9uZz4nICsgZXNjKGRlZkluZm8gPyBkZWZJbmZvLmxhYmVsIDogZGVmLnByb3ZpZGVyKSArICc8L3N0cm9uZz4gLyA8c3Ryb25nPicgKyBlc2MoZGVmLm1vZGVsKSArICc8L3N0cm9uZz48L3NwYW4+JztcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC14cyBzY3AtdGV4dC1tdXRlZFwiPiBcdTIwMTQgdGVtcDogJyArIGRlZi50ZW1wZXJhdHVyZSArICcsIG1heCB0b2tlbnM6ICcgKyBmb3JtYXROdW1iZXIoZGVmLm1heF90b2tlbnMpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDAgUHJvdmlkZXIgQ2FyZHMgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaWYgKExMTVNlcnZpY2UuaXNDb25maWd1cmVkKCkpIHtcbiAgICAgIHZhciBwcm92cyA9IExMTVNlcnZpY2UuZ2V0QWN0aXZlUHJvdmlkZXJzKCk7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXNlY3Rpb25cIj48aDM+JyArIGljb24oJ2N1YmUnKSArICcgQWN0aXZlIFByb3ZpZGVycyAoJyArIHByb3ZzLmxlbmd0aCArICcpPC9oMz4nO1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1wcm92aWRlci1jYXJkc1wiPic7XG4gICAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcHJvdnMubGVuZ3RoOyBwaSsrKSB7XG4gICAgICAgIHZhciBwcm92ID0gcHJvdnNbcGldO1xuICAgICAgICB2YXIgcEluZm8gPSBMTE1TZXJ2aWNlLmdldFByb3ZpZGVySW5mbyhwcm92LmlkKTtcbiAgICAgICAgaWYgKCFwSW5mbykgY29udGludWU7XG4gICAgICAgIHZhciBpc0RlZmF1bHQgPSBkZWYgJiYgZGVmLnByb3ZpZGVyID09PSBwcm92LmlkO1xuXG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWktcHJvdmlkZXItY2FyZCcgKyAoaXNEZWZhdWx0ID8gJyBzY3AtYWktcHJvdmlkZXItY2FyZC1kZWZhdWx0JyA6ICcnKSArICdcIj4nO1xuICAgICAgICAvLyBDYXJkIGhlYWRlclxuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXByb3ZpZGVyLWNhcmQtaGVhZGVyXCI+JztcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1wcm92aWRlci1jYXJkLW5hbWVcIj4nO1xuICAgICAgICBodG1sICs9ICc8c3Ryb25nPicgKyBlc2MocEluZm8ubGFiZWwpICsgJzwvc3Ryb25nPic7XG4gICAgICAgIGlmIChpc0RlZmF1bHQpIGh0bWwgKz0gJyAnICsgYmFkZ2UoJ0RlZmF1bHQnLCAnIzBkOTA0ZicpO1xuICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXByb3ZpZGVyLWNhcmQtbWV0YVwiPic7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLXRleHQteHNcIj4nICsgcEluZm8ubW9kZWxDb3VudCArICcgbW9kZWwnICsgKHBJbmZvLm1vZGVsQ291bnQgPiAxID8gJ3MnIDogJycpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXhzXCIgc3R5bGU9XCJjb2xvcjonICsgKHBJbmZvLmhhc0tleSA/ICd2YXIoLS1zY3Atc3VjY2VzcyknIDogJ3ZhcigtLXNjcC1lcnJvciknKSArICdcIj4nICsgaWNvbihwSW5mby5oYXNLZXkgPyAna2V5JyA6ICd3YXJuaW5nJykgKyAnICcgKyAocEluZm8uaGFzS2V5ID8gcEluZm8ubWFza2VkS2V5IDogJ05vIGtleScpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuXG4gICAgICAgIC8vIE1vZGVscyBsaXN0XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYWktcHJvdmlkZXItY2FyZC1tb2RlbHNcIj4nO1xuICAgICAgICBmb3IgKHZhciBtaSA9IDA7IG1pIDwgcEluZm8ubW9kZWxzLmxlbmd0aDsgbWkrKykge1xuICAgICAgICAgIHZhciBtb2RlbCA9IHBJbmZvLm1vZGVsc1ttaV07XG4gICAgICAgICAgdmFyIGlzRGVmTW9kZWwgPSBpc0RlZmF1bHQgJiYgZGVmLm1vZGVsID09PSBtb2RlbC5pZDtcbiAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLW1vZGVsLXJvdycgKyAoaXNEZWZNb2RlbCA/ICcgc2NwLWFpLW1vZGVsLXJvdy1hY3RpdmUnIDogJycpICsgJ1wiPic7XG4gICAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtYWktbW9kZWwtbmFtZVwiPicgKyBlc2MobW9kZWwubGFiZWwpICsgJzwvc3Bhbj4nO1xuICAgICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWFpLW1vZGVsLXBhcmFtc1wiPic7XG4gICAgICAgICAgaHRtbCArPSAnPHNwYW4gdGl0bGU9XCJUZW1wZXJhdHVyZVwiPlQ6JyArIChtb2RlbC50ZW1wZXJhdHVyZSAhPT0gdW5kZWZpbmVkID8gbW9kZWwudGVtcGVyYXR1cmUgOiAnMS4wJykgKyAnPC9zcGFuPic7XG4gICAgICAgICAgaHRtbCArPSAnPHNwYW4gdGl0bGU9XCJNYXggdG9rZW5zXCI+JyArIGZvcm1hdE51bWJlcihtb2RlbC5tYXhfdG9rZW5zKSArICcgdG9rPC9zcGFuPic7XG4gICAgICAgICAgaWYgKG1vZGVsLmlzX2RlZmF1bHQpIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWFpLW1vZGVsLWJhZGdlXCI+Y29uZmlnIGRlZmF1bHQ8L3NwYW4+JztcbiAgICAgICAgICBodG1sICs9ICc8L3NwYW4+PC9kaXY+JztcbiAgICAgICAgfVxuICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgICAgIC8vIENhcmQgYWN0aW9uc1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXByb3ZpZGVyLWNhcmQtYWN0aW9uc1wiPic7XG4gICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuIHNjcC1idG4tc20gc2NwLWJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJ0ZXN0LXByb3ZpZGVyXCIgZGF0YS1wcm92aWRlcj1cIicgKyBlc2MocHJvdi5pZCkgKyAnXCI+JyArIGljb24oJ2JvbHQnKSArICcgVGVzdDwvYnV0dG9uPic7XG4gICAgICAgIGlmICghaXNEZWZhdWx0KSB7XG4gICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbSBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cInNldC1kZWZhdWx0LXByb3ZpZGVyXCIgZGF0YS1wcm92aWRlcj1cIicgKyBlc2MocHJvdi5pZCkgKyAnXCI+JyArIGljb24oJ3N0YXInKSArICcgU2V0IERlZmF1bHQ8L2J1dHRvbj4nO1xuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7IC8vIGVuZCBjYXJkXG4gICAgICB9XG4gICAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nOyAvLyBlbmQgY2FyZHMgKyBzZWN0aW9uXG4gICAgfVxuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwIFBlci1hY3Rpb24gb3ZlcnJpZGVzIFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIHZhciBwYSA9IHByZWZzLnBlckFjdGlvbiB8fCB7fTtcbiAgICB2YXIgYWN0aW9uS2V5cyA9IE9iamVjdC5rZXlzKHBhKS5maWx0ZXIoZnVuY3Rpb24oaykgeyByZXR1cm4gayAhPT0gJ2FwcC1kZWZhdWx0JyAmJiBrICE9PSAndGVzdC1jb25uZWN0aW9uJzsgfSk7XG4gICAgaWYgKGFjdGlvbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGFjdGlvbkxhYmVscyA9IHtcbiAgICAgICAgJ2FpLXJlc2VhcmNoLWFuZ2xlcyc6IHsgbGFiZWw6ICdSZXNlYXJjaCBBbmdsZXMnLCBpY29uOiAnZXllJyB9LFxuICAgICAgICAnYWktcmVzZWFyY2gtaG9va3MnOiB7IGxhYmVsOiAnUmVzZWFyY2ggSG9va3MnLCBpY29uOiAnYm9sdCcgfSxcbiAgICAgICAgJ2FpLXdyaXRlLWNvbnRlbnQnOiB7IGxhYmVsOiAnV3JpdGUgQ29udGVudCcsIGljb246ICdwZW4tZmFuY3knIH0sXG4gICAgICAgICdhaS1pbXByb3ZlLWNvbnRlbnQnOiB7IGxhYmVsOiAnSW1wcm92ZSBDb250ZW50JywgaWNvbjogJ3BlbicgfSxcbiAgICAgICAgJ2FpLXBsYW4tc2xpZGVzJzogeyBsYWJlbDogJ1BsYW4gU2xpZGVzJywgaWNvbjogJ2ltYWdlcycgfSxcbiAgICAgICAgJ2FpLWdlbmVyYXRlLXNjcmlwdCc6IHsgbGFiZWw6ICdHZW5lcmF0ZSBTY3JpcHQnLCBpY29uOiAndmlkZW8nIH0sXG4gICAgICAgICdhaS1nZW5lcmF0ZS1tZWRpYSc6IHsgbGFiZWw6ICdHZW5lcmF0ZSBNZWRpYSBQcm9tcHRzJywgaWNvbjogJ3dhbmQtbWFnaWMnIH0sXG4gICAgICAgICdhaS1hZGFwdC1wbGF0Zm9ybSc6IHsgbGFiZWw6ICdQbGF0Zm9ybSBBZGFwdGF0aW9uJywgaWNvbjogJ3NoYXJlLW5vZGVzJyB9LFxuICAgICAgICAncmVzZWFyY2hfcXVpY2snOiB7IGxhYmVsOiAnUXVpY2sgUmVzZWFyY2gnLCBpY29uOiAnZmxhc2snIH0sXG4gICAgICAgICdyZXNlYXJjaF9hZHZhbmNlZCc6IHsgbGFiZWw6ICdBZHZhbmNlZCBSZXNlYXJjaCcsIGljb246ICdmbGFzay12aWFsJyB9XG4gICAgICB9O1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdzbGlkZXJzJykgKyAnIFBlci1BY3Rpb24gT3ZlcnJpZGVzPC9oMz4nO1xuICAgICAgaHRtbCArPSAnPHAgY2xhc3M9XCJzY3AtdGV4dC1zbSBzY3AtdGV4dC1tdXRlZFwiPlRoZXNlIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGZvciBzcGVjaWZpYyBBSSBhY3Rpb25zLiBBdXRvLXNhdmVkIHdoZW4geW91IGNoYW5nZSB0aGUgcGlja2VyIG5leHQgdG8gYW55IEFJIGJ1dHRvbi48L3A+JztcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtY29uZmlnLWxpc3RcIj4nO1xuICAgICAgZm9yICh2YXIga2kgPSAwOyBraSA8IGFjdGlvbktleXMubGVuZ3RoOyBraSsrKSB7XG4gICAgICAgIHZhciBrID0gYWN0aW9uS2V5c1traV07XG4gICAgICAgIHZhciBhY3Rpb25NZXRhID0gYWN0aW9uTGFiZWxzW2tdIHx8IHsgbGFiZWw6IGsucmVwbGFjZSgvLS9nLCAnICcpLnJlcGxhY2UoL15haSAvaSwgJycpLCBpY29uOiAnc3BhcmtsZXMnIH07XG4gICAgICAgIHZhciBwSW5mbzIgPSBMTE1TZXJ2aWNlLmdldFByb3ZpZGVySW5mbyhwYVtrXS5wcm92aWRlcik7XG4gICAgICAgIHZhciBwcm92aWRlckxhYmVsID0gcEluZm8yID8gcEluZm8yLmxhYmVsIDogcGFba10ucHJvdmlkZXI7XG4gICAgICAgIC8vIEZpbmQgbW9kZWwgbGFiZWxcbiAgICAgICAgdmFyIG1vZGVsTGFiZWwgPSBwYVtrXS5tb2RlbDtcbiAgICAgICAgaWYgKHBJbmZvMikge1xuICAgICAgICAgIGZvciAodmFyIG1saSA9IDA7IG1saSA8IHBJbmZvMi5tb2RlbHMubGVuZ3RoOyBtbGkrKykge1xuICAgICAgICAgICAgaWYgKHBJbmZvMi5tb2RlbHNbbWxpXS5pZCA9PT0gcGFba10ubW9kZWwpIHsgbW9kZWxMYWJlbCA9IHBJbmZvMi5tb2RlbHNbbWxpXS5sYWJlbDsgYnJlYWs7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maWctaXRlbSBzY3AtYWktYWN0aW9uLW92ZXJyaWRlXCI+JztcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtY29uZmlnLWl0ZW0tbmFtZVwiPicgKyBpY29uKGFjdGlvbk1ldGEuaWNvbikgKyAnICcgKyBlc2MoYWN0aW9uTWV0YS5sYWJlbCkgKyAnPC9zcGFuPic7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWFpLW92ZXJyaWRlLXZhbHVlXCI+JyArIGVzYyhwcm92aWRlckxhYmVsKSArICcgLyAnICsgZXNjKG1vZGVsTGFiZWwpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0bi1pY29uIHNjcC1idG4tZGVsZXRlLXNtXCIgZGF0YS1hY3Rpb249XCJjbGVhci1hY3Rpb24tcHJlZlwiIGRhdGEtYWN0aW9uLWtleT1cIicgKyBlc2MoaykgKyAnXCIgdGl0bGU9XCJSZW1vdmUgb3ZlcnJpZGVcIj4nICsgaWNvbigneCcpICsgJzwvYnV0dG9uPic7XG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICB9XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgICAgaWYgKGFjdGlvbktleXMubGVuZ3RoID4gMSkge1xuICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiY2xlYXItYWxsLWFjdGlvbi1wcmVmc1wiIHN0eWxlPVwibWFyZ2luLXRvcDp2YXIoLS1zY3Atc3BhY2UtMilcIj4nICsgaWNvbigndHJhc2gnKSArICcgQ2xlYXIgQWxsIE92ZXJyaWRlczwvYnV0dG9uPic7XG4gICAgICB9XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBCcmFuZCBjb250ZXh0IHRvZ2dsZXMgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaWYgKEJyYW5kU2VydmljZS5pc0NvbmZpZ3VyZWQoKSkge1xuICAgICAgdmFyIGVuYWJsZWQgPSBzdGcuYnJhbmRfY29udGV4dF9lbmFibGVkIHx8IHt9O1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdmaW5nZXJwcmludCcpICsgJyBCcmFuZCBDb250ZXh0IEluamVjdGlvbjwvaDM+JztcbiAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic2NwLXRleHQtc20gc2NwLXRleHQtbXV0ZWRcIj5Db250cm9sIHdoaWNoIGJyYW5kIGRhdGEgaXMgc2VudCB0byBBSSBhbG9uZ3NpZGUgcHJvbXB0cy48L3A+JztcbiAgICAgIFt7IGtleTogJ3NvY2lhbCcsIGxhYmVsOiAnUmVzZWFyY2ggJiBTb2NpYWwgQ29udGVudCcsIGljb246ICdmbGFzaycgfSxcbiAgICAgICB7IGtleTogJ2NvbnRlbnQnLCBsYWJlbDogJ0NvbnRlbnQgV3JpdGluZycsIGljb246ICdwZW4tZmFuY3knIH0sXG4gICAgICAgeyBrZXk6ICdtZWRpYScsIGxhYmVsOiAnTWVkaWEgR2VuZXJhdGlvbicsIGljb246ICdpbWFnZScgfV0uZm9yRWFjaChmdW5jdGlvbih0Z2wpIHtcbiAgICAgICAgdmFyIGlzT24gPSBlbmFibGVkW3RnbC5rZXldICE9PSBmYWxzZTtcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maWctaXRlbVwiPjxzcGFuIGNsYXNzPVwic2NwLWNvbmZpZy1pdGVtLW5hbWVcIj4nICsgaWNvbih0Z2wuaWNvbikgKyAnICcgKyBlc2ModGdsLmxhYmVsKSArICc8L3NwYW4+JztcbiAgICAgICAgaHRtbCArPSAnPGxhYmVsIGNsYXNzPVwic2NwLXRvZ2dsZS1sYWJlbFwiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cInNjcC1icmFuZC1jb250ZXh0LXRvZ2dsZVwiIGRhdGEta2V5PVwiJyArIHRnbC5rZXkgKyAnXCInICsgKGlzT24gPyAnIGNoZWNrZWQnIDogJycpICsgJz48L2xhYmVsPjwvZGl2Pic7XG4gICAgICB9KTtcbiAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1hY3Rpb25zXCI+PGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJzYXZlLXNldHRpbmdzXCI+JyArIGljb24oJ2NoZWNrJykgKyAnIFNhdmU8L2J1dHRvbj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJCcmFuZERlc2lnblNldHRpbmdzKCkge1xuICAgIHZhciBiZCA9IChTLm1ldGEuc2V0dGluZ3MgJiYgUy5tZXRhLnNldHRpbmdzLmJyYW5kX2Rlc2lnbikgfHwge307XG4gICAgdmFyIGMgPSBiZC5jb2xvcnMgfHwge307IHZhciB0ID0gYmQudHlwb2dyYXBoeSB8fCB7fTsgdmFyIHZzID0gYmQudmlzdWFsX3N0eWxlIHx8IHt9OyB2YXIgbHIgPSBiZC5sYXlvdXRfcnVsZXMgfHwge307XG4gICAgdmFyIHJlZnMgPSBiZC5yZWZlcmVuY2VfaW1hZ2VfaWRzIHx8IHt9O1xuICAgIHZhciBoYXNEcnVwYWxCcmFuZCA9IEJyYW5kU2VydmljZS5pc0NvbmZpZ3VyZWQoKTtcblxuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3MtcGFuZWwgc2NwLWJyYW5kLWRlc2lnbi1wYW5lbFwiPic7XG5cbiAgICAvLyBTb3VyY2UgaW5kaWNhdG9yXG4gICAgaWYgKGhhc0RydXBhbEJyYW5kKSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLXN0YXR1cy1zdW1tYXJ5IHNjcC1haS1zdGF0dXMtc3VtbWFyeS1va1wiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTp2YXIoLS1zY3Atc3BhY2UtNSlcIj4nO1xuICAgICAgaHRtbCArPSBpY29uKCdjaXJjbGUtY2hlY2snKSArICcgPHN0cm9uZz5EcnVwYWwgYnJhbmQgZGF0YSBkZXRlY3RlZDwvc3Ryb25nPiBcdTIwMTQgZW1wdHkgZmllbGRzIHdpbGwgYXV0by1maWxsIGZyb20geW91ciBicmFuZCBwcm9maWxlLic7XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBDb2xvcnMgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdwYWxldHRlJykgKyAnIENvbG9yIFBhbGV0dGU8L2gzPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1icmFuZC1jb2xvci1yb3dcIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYnJhbmQtY29sb3ItZmllbGRcIj48bGFiZWw+UHJpbWFyeTwvbGFiZWw+PGRpdiBjbGFzcz1cInNjcC1jb2xvci1pbnB1dC13cmFwXCI+PGlucHV0IHR5cGU9XCJjb2xvclwiIGNsYXNzPVwic2NwLWJyYW5kLWRlc2lnbi1jb2xvclwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy5wcmltYXJ5XCIgdmFsdWU9XCInICsgKGMucHJpbWFyeSB8fCAnIzFhNzNlOCcpICsgJ1wiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1icmFuZC1kZXNpZ24tZmllbGRcIiBkYXRhLWJkLXBhdGg9XCJjb2xvcnMucHJpbWFyeVwiIHZhbHVlPVwiJyArIGVzYyhjLnByaW1hcnkgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiIzFhNzNlOFwiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1icmFuZC1jb2xvci1maWVsZFwiPjxsYWJlbD5TZWNvbmRhcnk8L2xhYmVsPjxkaXYgY2xhc3M9XCJzY3AtY29sb3ItaW5wdXQtd3JhcFwiPjxpbnB1dCB0eXBlPVwiY29sb3JcIiBjbGFzcz1cInNjcC1icmFuZC1kZXNpZ24tY29sb3JcIiBkYXRhLWJkLXBhdGg9XCJjb2xvcnMuc2Vjb25kYXJ5XCIgdmFsdWU9XCInICsgKGMuc2Vjb25kYXJ5IHx8ICcjMGQ5MDRmJykgKyAnXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy5zZWNvbmRhcnlcIiB2YWx1ZT1cIicgKyBlc2MoYy5zZWNvbmRhcnkgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiIzBkOTA0ZlwiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1icmFuZC1jb2xvci1maWVsZFwiPjxsYWJlbD5BY2NlbnQ8L2xhYmVsPjxkaXYgY2xhc3M9XCJzY3AtY29sb3ItaW5wdXQtd3JhcFwiPjxpbnB1dCB0eXBlPVwiY29sb3JcIiBjbGFzcz1cInNjcC1icmFuZC1kZXNpZ24tY29sb3JcIiBkYXRhLWJkLXBhdGg9XCJjb2xvcnMuYWNjZW50XCIgdmFsdWU9XCInICsgKGMuYWNjZW50IHx8ICcjZTM3NDAwJykgKyAnXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy5hY2NlbnRcIiB2YWx1ZT1cIicgKyBlc2MoYy5hY2NlbnQgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiI2UzNzQwMFwiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1icmFuZC1jb2xvci1maWVsZFwiPjxsYWJlbD5CYWNrZ3JvdW5kPC9sYWJlbD48ZGl2IGNsYXNzPVwic2NwLWNvbG9yLWlucHV0LXdyYXBcIj48aW5wdXQgdHlwZT1cImNvbG9yXCIgY2xhc3M9XCJzY3AtYnJhbmQtZGVzaWduLWNvbG9yXCIgZGF0YS1iZC1wYXRoPVwiY29sb3JzLmJhY2tncm91bmRcIiB2YWx1ZT1cIicgKyAoYy5iYWNrZ3JvdW5kIHx8ICcjZmZmZmZmJykgKyAnXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy5iYWNrZ3JvdW5kXCIgdmFsdWU9XCInICsgZXNjKGMuYmFja2dyb3VuZCB8fCAnI2ZmZmZmZicpICsgJ1wiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1icmFuZC1jb2xvci1maWVsZFwiPjxsYWJlbD5UZXh0PC9sYWJlbD48ZGl2IGNsYXNzPVwic2NwLWNvbG9yLWlucHV0LXdyYXBcIj48aW5wdXQgdHlwZT1cImNvbG9yXCIgY2xhc3M9XCJzY3AtYnJhbmQtZGVzaWduLWNvbG9yXCIgZGF0YS1iZC1wYXRoPVwiY29sb3JzLnRleHRcIiB2YWx1ZT1cIicgKyAoYy50ZXh0IHx8ICcjMjAyMTI0JykgKyAnXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy50ZXh0XCIgdmFsdWU9XCInICsgZXNjKGMudGV4dCB8fCAnIzIwMjEyNCcpICsgJ1wiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIiBzdHlsZT1cIm1hcmdpbi10b3A6dmFyKC0tc2NwLXNwYWNlLTMpXCI+PGxhYmVsPlBhbGV0dGUgRGVzY3JpcHRpb248L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImNvbG9ycy5wYWxldHRlX2Rlc2NyaXB0aW9uXCIgdmFsdWU9XCInICsgZXNjKGMucGFsZXR0ZV9kZXNjcmlwdGlvbiB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJlLmcuIENsZWFuIHByb2Zlc3Npb25hbCBibHVlIHdpdGggZ3JlZW4gYWNjZW50c1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBUeXBvZ3JhcGh5IFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3Mtc2VjdGlvblwiPjxoMz4nICsgaWNvbignZm9udCcpICsgJyBUeXBvZ3JhcGh5PC9oMz4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5IZWFkaW5nIFN0eWxlPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1icmFuZC1kZXNpZ24tZmllbGRcIiBkYXRhLWJkLXBhdGg9XCJ0eXBvZ3JhcGh5LmhlYWRpbmdfc3R5bGVcIiB2YWx1ZT1cIicgKyBlc2ModC5oZWFkaW5nX3N0eWxlIHx8ICcnKSArICdcIiBwbGFjZWhvbGRlcj1cImUuZy4gQm9sZCBzYW5zLXNlcmlmLCBjbGVhbiBsaW5lc1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkJvZHkgVGV4dCBTdHlsZTwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtYnJhbmQtZGVzaWduLWZpZWxkXCIgZGF0YS1iZC1wYXRoPVwidHlwb2dyYXBoeS5ib2R5X3N0eWxlXCIgdmFsdWU9XCInICsgZXNjKHQuYm9keV9zdHlsZSB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJlLmcuIENsZWFuIHNhbnMtc2VyaWYsIGhpZ2ggcmVhZGFiaWxpdHlcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5UZXh0IFRyZWF0bWVudCBvbiBJbWFnZXM8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cInR5cG9ncmFwaHkudGV4dF90cmVhdG1lbnRcIiB2YWx1ZT1cIicgKyBlc2ModC50ZXh0X3RyZWF0bWVudCB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJlLmcuIE1pbmltYWwgdGV4dCwgbGFyZ2UgaGVhZGluZ3Mgb25seVwiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBWaXN1YWwgU3R5bGUgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdleWUnKSArICcgVmlzdWFsIFN0eWxlPC9oMz4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5PdmVyYWxsIEFlc3RoZXRpYzwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtYnJhbmQtZGVzaWduLWZpZWxkXCIgZGF0YS1iZC1wYXRoPVwidmlzdWFsX3N0eWxlLm92ZXJhbGxfYWVzdGhldGljXCIgdmFsdWU9XCInICsgZXNjKHZzLm92ZXJhbGxfYWVzdGhldGljIHx8ICcnKSArICdcIiBwbGFjZWhvbGRlcj1cImUuZy4gTW9kZXJuIG1pbmltYWxpc3Qgd2l0aCBzdWJ0bGUgZ3JhZGllbnRzXCI+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tcm93XCI+PGRpdiBjbGFzcz1cInNjcC1mb3JtLWhhbGZcIj48bGFiZWw+UGhvdG9ncmFwaHkgU3R5bGU8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cInZpc3VhbF9zdHlsZS5waG90b2dyYXBoeV9zdHlsZVwiIHZhbHVlPVwiJyArIGVzYyh2cy5waG90b2dyYXBoeV9zdHlsZSB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJCcmlnaHQsIG5hdHVyYWwgbGlnaHRpbmcuLi5cIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1oYWxmXCI+PGxhYmVsPklsbHVzdHJhdGlvbiBTdHlsZTwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtYnJhbmQtZGVzaWduLWZpZWxkXCIgZGF0YS1iZC1wYXRoPVwidmlzdWFsX3N0eWxlLmlsbHVzdHJhdGlvbl9zdHlsZVwiIHZhbHVlPVwiJyArIGVzYyh2cy5pbGx1c3RyYXRpb25fc3R5bGUgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiRmxhdCB2ZWN0b3IsIHJvdW5kZWQgY29ybmVycy4uLlwiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXJvd1wiPjxkaXYgY2xhc3M9XCJzY3AtZm9ybS1oYWxmXCI+PGxhYmVsPkljb24gU3R5bGU8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cInZpc3VhbF9zdHlsZS5pY29uX3N0eWxlXCIgdmFsdWU9XCInICsgZXNjKHZzLmljb25fc3R5bGUgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiTGluZSBpY29ucywgMnB4IHN0cm9rZS4uLlwiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWhhbGZcIj48bGFiZWw+UGF0dGVybiBVc2FnZTwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtYnJhbmQtZGVzaWduLWZpZWxkXCIgZGF0YS1iZC1wYXRoPVwidmlzdWFsX3N0eWxlLnBhdHRlcm5fdXNhZ2VcIiB2YWx1ZT1cIicgKyBlc2ModnMucGF0dGVybl91c2FnZSB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJTdWJ0bGUgZ2VvbWV0cmljIGJhY2tncm91bmRzLi4uXCI+PC9kaXY+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+TW9vZCAvIEZlZWw8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cInZpc3VhbF9zdHlsZS5tb29kXCIgdmFsdWU9XCInICsgZXNjKHZzLm1vb2QgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiUHJvZmVzc2lvbmFsIGJ1dCBhcHByb2FjaGFibGUsIGFzcGlyYXRpb25hbFwiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBMYXlvdXQgUnVsZXMgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1zZXR0aW5ncy1zZWN0aW9uXCI+PGgzPicgKyBpY29uKCdsYXlvdXQtZ3JpZCcpICsgJyBMYXlvdXQgUnVsZXM8L2gzPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkltYWdlIENvbXBvc2l0aW9uPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1icmFuZC1kZXNpZ24tZmllbGRcIiBkYXRhLWJkLXBhdGg9XCJsYXlvdXRfcnVsZXMuaW1hZ2VfY29tcG9zaXRpb25cIiB2YWx1ZT1cIicgKyBlc2MobHIuaW1hZ2VfY29tcG9zaXRpb24gfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiZS5nLiBDbGVhbiBuZWdhdGl2ZSBzcGFjZSwgc3ViamVjdCBsZWZ0LWFsaWduZWRcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5DYXJvdXNlbCBDb25zaXN0ZW5jeTwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtYnJhbmQtZGVzaWduLWZpZWxkXCIgZGF0YS1iZC1wYXRoPVwibGF5b3V0X3J1bGVzLmNhcm91c2VsX2NvbnNpc3RlbmN5XCIgdmFsdWU9XCInICsgZXNjKGxyLmNhcm91c2VsX2NvbnNpc3RlbmN5IHx8ICcnKSArICdcIiBwbGFjZWhvbGRlcj1cIlNhbWUgaGVhZGVyIGJhciwgY29uc2lzdGVudCBmb250cyBhY3Jvc3Mgc2xpZGVzXCI+PC9kaXY+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+VGh1bWJuYWlsIFN0eWxlPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1icmFuZC1kZXNpZ24tZmllbGRcIiBkYXRhLWJkLXBhdGg9XCJsYXlvdXRfcnVsZXMudGh1bWJuYWlsX3N0eWxlXCIgdmFsdWU9XCInICsgZXNjKGxyLnRodW1ibmFpbF9zdHlsZSB8fCAnJykgKyAnXCIgcGxhY2Vob2xkZXI9XCJCb2xkIHRleHQgb3ZlcmxheSwgaGlnaCBjb250cmFzdCwgZmFjZSBmb2N1c1wiPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLXJvd1wiPjxkaXYgY2xhc3M9XCJzY3AtZm9ybS1oYWxmXCI+PGxhYmVsPkJvcmRlciBSYWRpdXM8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImxheW91dF9ydWxlcy5ib3JkZXJfcmFkaXVzXCIgdmFsdWU9XCInICsgZXNjKGxyLmJvcmRlcl9yYWRpdXMgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiUm91bmRlZCBjb3JuZXJzIDEyLTE2cHhcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1oYWxmXCI+PGxhYmVsPlNwYWNpbmc8L2xhYmVsPic7XG4gICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXQgc2NwLWJyYW5kLWRlc2lnbi1maWVsZFwiIGRhdGEtYmQtcGF0aD1cImxheW91dF9ydWxlcy5zcGFjaW5nXCIgdmFsdWU9XCInICsgZXNjKGxyLnNwYWNpbmcgfHwgJycpICsgJ1wiIHBsYWNlaG9sZGVyPVwiR2VuZXJvdXMgd2hpdGVzcGFjZVwiPjwvZGl2PjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBSZWZlcmVuY2UgSW1hZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3Mtc2VjdGlvblwiPjxoMz4nICsgaWNvbignaW1hZ2VzJykgKyAnIFJlZmVyZW5jZSBJbWFnZXMgYnkgUm9sZTwvaDM+JztcbiAgICBodG1sICs9ICc8cCBjbGFzcz1cInNjcC10ZXh0LXNtIHNjcC10ZXh0LW11dGVkXCI+QXNzaWduIHJlZmVyZW5jZSBpbWFnZXMgdG8gcm9sZXMuIFRoZXNlIHdpbGwgYmUgYXV0by1zdWdnZXN0ZWQgd2hlbiBnZW5lcmF0aW5nIG1lZGlhIHByb21wdHMuPC9wPic7XG4gICAgdmFyIHJvbGVzID0gW1xuICAgICAgeyBrZXk6ICdwcmltYXJ5X3N0eWxlJywgbGFiZWw6ICdQcmltYXJ5IFN0eWxlIFJlZmVyZW5jZScsIGRlc2M6ICdZb3VyIGRlZmF1bHQgYnJhbmQgdmlzdWFsIHN0eWxlJyB9LFxuICAgICAgeyBrZXk6ICdjYXJvdXNlbF90ZW1wbGF0ZScsIGxhYmVsOiAnQ2Fyb3VzZWwgVGVtcGxhdGUnLCBkZXNjOiAnQ29uc2lzdGVudCBzbGlkZSBkZXNpZ24gcmVmZXJlbmNlJyB9LFxuICAgICAgeyBrZXk6ICd0aHVtYm5haWxfdGVtcGxhdGUnLCBsYWJlbDogJ1RodW1ibmFpbCBUZW1wbGF0ZScsIGRlc2M6ICdWaWRlby9yZWVsIHRodW1ibmFpbCBzdHlsZScgfVxuICAgIF07XG4gICAgZm9yICh2YXIgcmkgPSAwOyByaSA8IHJvbGVzLmxlbmd0aDsgcmkrKykge1xuICAgICAgdmFyIHJvbGUgPSByb2xlc1tyaV07IHZhciByb2xlSWRzID0gcmVmc1tyb2xlLmtleV0gfHwgW107XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWJyYW5kLXJlZi1yb2xlXCI+JztcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtYnJhbmQtcmVmLXJvbGUtaGVhZGVyXCI+PHN0cm9uZz4nICsgZXNjKHJvbGUubGFiZWwpICsgJzwvc3Ryb25nPjxzcGFuIGNsYXNzPVwic2NwLXRleHQteHMgc2NwLXRleHQtbXV0ZWRcIj4nICsgZXNjKHJvbGUuZGVzYykgKyAnPC9zcGFuPjwvZGl2Pic7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWJyYW5kLXJlZi10aHVtYnNcIj4nO1xuICAgICAgZm9yICh2YXIgcmlpID0gMDsgcmlpIDwgcm9sZUlkcy5sZW5ndGg7IHJpaSsrKSB7XG4gICAgICAgIHZhciBpbWcgPSBTLmltYWdlTWFwW3JvbGVJZHNbcmlpXV07XG4gICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWJyYW5kLXJlZi10aHVtYlwiPjxpbWcgc3JjPVwiJyArIGVzYyhpbWcudXJsKSArICdcIiBhbHQ9XCJcIj48YnV0dG9uIGNsYXNzPVwic2NwLWJyYW5kLXJlZi1yZW1vdmVcIiBkYXRhLWFjdGlvbj1cInJlbW92ZS1icmFuZC1yZWZcIiBkYXRhLXJvbGU9XCInICsgcm9sZS5rZXkgKyAnXCIgZGF0YS1maWQ9XCInICsgZXNjKGltZy5maWQpICsgJ1wiPiZ0aW1lczs8L2J1dHRvbj48L2Rpdj4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJyYW5kLXJlZi1hZGRcIiBkYXRhLWFjdGlvbj1cImFkZC1icmFuZC1yZWZcIiBkYXRhLXJvbGU9XCInICsgcm9sZS5rZXkgKyAnXCI+JyArIGljb24oJ3BsdXMnKSArICc8L2J1dHRvbj4nO1xuICAgICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMCBHZW5lcmF0ZWQgUHJlZml4IFByZXZpZXcgXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgdmFyIHByZXZpZXdUZXh0ID0gQnJhbmRTZXJ2aWNlLmJ1aWxkQnJhbmREZXNpZ25UZXh0KGJkKTtcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLXNlY3Rpb25cIj48aDM+JyArIGljb24oJ2V5ZScpICsgJyBCcmFuZCBQcm9tcHQgUHJlZml4PC9oMz4nO1xuICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic2NwLXRleHQtc20gc2NwLXRleHQtbXV0ZWRcIj5UaGlzIHRleHQgaXMgYXV0by1pbmplY3RlZCBpbnRvIGV2ZXJ5IG1lZGlhIHByb21wdC4gRWRpdCB0byBjdXN0b21pemUsIG9yIGxlYXZlIGVtcHR5IHRvIGF1dG8tZ2VuZXJhdGUgZnJvbSBmaWVsZHMgYWJvdmUuPC9wPic7XG4gICAgaHRtbCArPSAnPHRleHRhcmVhIGNsYXNzPVwic2NwLXRleHRhcmVhIHNjcC1icmFuZC1kZXNpZ24tZmllbGRcIiBkYXRhLWJkLXBhdGg9XCJicmFuZF9wcm9tcHRfcHJlZml4XCIgcm93cz1cIjhcIiBwbGFjZWhvbGRlcj1cIkF1dG8tZ2VuZXJhdGVkIGZyb20gZmllbGRzIGFib3ZlLi4uXCI+JyArIGVzYyhiZC5icmFuZF9wcm9tcHRfcHJlZml4IHx8ICcnKSArICc8L3RleHRhcmVhPic7XG4gICAgaWYgKHByZXZpZXdUZXh0ICYmICFiZC5icmFuZF9wcm9tcHRfcHJlZml4KSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWJyYW5kLXByZWZpeC1wcmV2aWV3XCI+PGxhYmVsIGNsYXNzPVwic2NwLXRleHQteHMgc2NwLXRleHQtbXV0ZWRcIj5BVVRPLUdFTkVSQVRFRCBQUkVWSUVXPC9sYWJlbD48cHJlIGNsYXNzPVwic2NwLWJyYW5kLXByZWZpeC10ZXh0XCI+JyArIGVzYyhwcmV2aWV3VGV4dCkgKyAnPC9wcmU+PC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbSBzY3AtYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cInJlZ2VuZXJhdGUtYnJhbmQtcHJlZml4XCIgc3R5bGU9XCJtYXJnaW4tdG9wOnZhcigtLXNjcC1zcGFjZS0yKVwiPicgKyBpY29uKCdyZWZyZXNoJykgKyAnIFJlZ2VuZXJhdGUgZnJvbSBGaWVsZHM8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNldHRpbmdzLWFjdGlvbnNcIj48YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cInNhdmUtc2V0dGluZ3NcIj4nICsgaWNvbignY2hlY2snKSArICcgU2F2ZTwvYnV0dG9uPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDEyOiBDT05GSUcgQ1JVRFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiByZW5kZXJDb25maWdDUlVEKHRpdGxlLCB0eXBlLCBpdGVtcykge1xuICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJzY3Atc2V0dGluZ3Mtc2VjdGlvblwiPjxkaXYgY2xhc3M9XCJzY3AtZmxleC1iZXR3ZWVuXCI+PGgzPicgKyBlc2ModGl0bGUpICsgJzwvaDM+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRkLWNvbmZpZ1wiIGRhdGEtdHlwZT1cIicgKyB0eXBlICsgJ1wiPicgKyBpY29uKCdwbHVzJykgKyAnIEFkZDwvYnV0dG9uPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maWctbGlzdFwiPic7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1jb25maWctaXRlbVwiPjxzcGFuIGNsYXNzPVwic2NwLWNvbmZpZy1pdGVtLW5hbWVcIj4nICsgZXNjKGl0ZW1zW2ldLm5hbWUpICsgJzwvc3Bhbj4nO1xuICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC14cyBzY3AtdGV4dC1tdXRlZFwiPicgKyBlc2MoaXRlbXNbaV0uZGVzY3JpcHRpb24gfHwgJycpICsgJzwvc3Bhbj4nO1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvblwiIGRhdGEtYWN0aW9uPVwiZWRpdC1jb25maWdcIiBkYXRhLXR5cGU9XCInICsgdHlwZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGljb24oJ2VkaXQnKSArICc8L2J1dHRvbj4nO1xuICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvbiBzY3AtYnRuLWRlbGV0ZS1zbVwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWNvbmZpZ1wiIGRhdGEtdHlwZT1cIicgKyB0eXBlICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgaWNvbigndHJhc2gnKSArICc8L2J1dHRvbj48L2Rpdj4nO1xuICAgIH1cbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ29uZmlnSXRlbSh0eXBlKSB7XG4gICAgdmFyIGZpZWxkcyA9ICc8ZGl2IGNsYXNzPVwic2NwLWVkaXRvci1mb3JtXCI+JztcbiAgICBmaWVsZHMgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5OYW1lPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJuYW1lXCI+PC9kaXY+JztcbiAgICBmaWVsZHMgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5EZXNjcmlwdGlvbjwvbGFiZWw+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzY3AtaW5wdXRcIiBkYXRhLWZpZWxkPVwiZGVzY3JpcHRpb25cIj48L2Rpdj4nO1xuICAgIGZpZWxkcyArPSAnPC9kaXY+JztcbiAgICBvcGVuTW9kYWwoJ0FkZCAnICsgdHlwZS5yZXBsYWNlKC9fL2csICcgJyksIGZpZWxkcywgeyBvblNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGQgPSBjb2xsZWN0TW9kYWxGaWVsZHMoKTsgaWYgKCFkLm5hbWUpIHsgdG9hc3QoJ05hbWUgcmVxdWlyZWQnLCAnd2FybmluZycpOyByZXR1cm47IH1cbiAgICAgIHZhciBwcmVmaXhlcyA9IHsgdG9uZTogJ3RvbmUnLCBhdWRpZW5jZTogJ2F1ZCcsIGltYWdlX3N0eWxlOiAnaXMnIH07XG4gICAgICB2YXIgaXRlbSA9IHsgaWQ6IGdlbmVyYXRlSWQocHJlZml4ZXNbdHlwZV0gfHwgdHlwZSksIG5hbWU6IGQubmFtZS50cmltKCksIGRlc2NyaXB0aW9uOiBkLmRlc2NyaXB0aW9uIHx8ICcnIH07XG4gICAgICB2YXIgbGlzdEtleXMgPSB7IHRvbmU6ICd0b25lcycsIGF1ZGllbmNlOiAnYXVkaWVuY2VzJywgaW1hZ2Vfc3R5bGU6ICdpbWFnZV9zdHlsZXMnIH07XG4gICAgICB2YXIgbGlzdEtleSA9IGxpc3RLZXlzW3R5cGVdOyBpZiAoIWxpc3RLZXkpIHJldHVybjtcbiAgICAgIFMubWV0YS5zZXR0aW5nc1tsaXN0S2V5XSA9IFMubWV0YS5zZXR0aW5nc1tsaXN0S2V5XSB8fCBbXTtcbiAgICAgIFMubWV0YS5zZXR0aW5nc1tsaXN0S2V5XS5wdXNoKGl0ZW0pO1xuICAgICAgc25hcHNob3QoJ0FkZCAnICsgdHlwZSk7IGJ1aWxkTWFwcygpOyBjbG9zZU1vZGFsKCk7IHJlbmRlcigpOyBzeW5jVG9UZXh0YXJlYSgpOyB0b2FzdCgnQWRkZWQnLCAnc3VjY2VzcycpO1xuICAgIH19KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRDb25maWdJdGVtKHR5cGUsIGluZGV4KSB7XG4gICAgdmFyIGxpc3RLZXlzID0geyB0b25lOiAndG9uZXMnLCBhdWRpZW5jZTogJ2F1ZGllbmNlcycsIGltYWdlX3N0eWxlOiAnaW1hZ2Vfc3R5bGVzJyB9O1xuICAgIHZhciBsaXN0ID0gUy5tZXRhLnNldHRpbmdzW2xpc3RLZXlzW3R5cGVdXSB8fCBbXTtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaW5kZXhdOyBpZiAoIWl0ZW0pIHJldHVybjtcbiAgICB2YXIgZmllbGRzID0gJzxkaXYgY2xhc3M9XCJzY3AtZWRpdG9yLWZvcm1cIj4nO1xuICAgIGZpZWxkcyArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPk5hbWU8L2xhYmVsPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0XCIgZGF0YS1maWVsZD1cIm5hbWVcIiB2YWx1ZT1cIicgKyBlc2MoaXRlbS5uYW1lKSArICdcIj48L2Rpdj4nO1xuICAgIGZpZWxkcyArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkRlc2NyaXB0aW9uPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJkZXNjcmlwdGlvblwiIHZhbHVlPVwiJyArIGVzYyhpdGVtLmRlc2NyaXB0aW9uIHx8ICcnKSArICdcIj48L2Rpdj4nO1xuICAgIGZpZWxkcyArPSAnPC9kaXY+JztcbiAgICBvcGVuTW9kYWwoJ0VkaXQgJyArIHR5cGUucmVwbGFjZSgvXy9nLCAnICcpLCBmaWVsZHMsIHsgb25TYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkID0gY29sbGVjdE1vZGFsRmllbGRzKCk7IGlmICghZC5uYW1lKSB7IHRvYXN0KCdOYW1lIHJlcXVpcmVkJywgJ3dhcm5pbmcnKTsgcmV0dXJuOyB9XG4gICAgICBpdGVtLm5hbWUgPSBkLm5hbWUudHJpbSgpOyBpdGVtLmRlc2NyaXB0aW9uID0gZC5kZXNjcmlwdGlvbiB8fCAnJztcbiAgICAgIHNuYXBzaG90KCdFZGl0ICcgKyB0eXBlKTsgYnVpbGRNYXBzKCk7IGNsb3NlTW9kYWwoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdVcGRhdGVkJywgJ3N1Y2Nlc3MnKTtcbiAgICB9fSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWxldGVDb25maWdJdGVtKHR5cGUsIGluZGV4KSB7XG4gICAgdmFyIGxpc3RLZXlzID0geyB0b25lOiAndG9uZXMnLCBhdWRpZW5jZTogJ2F1ZGllbmNlcycsIGltYWdlX3N0eWxlOiAnaW1hZ2Vfc3R5bGVzJyB9O1xuICAgIHZhciBsaXN0ID0gUy5tZXRhLnNldHRpbmdzW2xpc3RLZXlzW3R5cGVdXSB8fCBbXTtcbiAgICBpZiAoIWxpc3RbaW5kZXhdKSByZXR1cm47XG4gICAgb3BlbkNvbmZpcm1EaWFsb2coeyB0aXRsZTogJ0RlbGV0ZScsIG1lc3NhZ2U6ICdEZWxldGUgXCInICsgbGlzdFtpbmRleF0ubmFtZSArICdcIj8nLCBjb25maXJtTGFiZWw6ICdEZWxldGUnLCBkYW5nZXI6IHRydWUsXG4gICAgICBvbkNvbmZpcm06IGZ1bmN0aW9uKCkge1xuICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHNuYXBzaG90KCdEZWxldGUgJyArIHR5cGUpOyBidWlsZE1hcHMoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdEZWxldGVkJywgJ3N1Y2Nlc3MnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVBbGxTZXR0aW5ncygpIHtcbiAgICBTLm1ldGEgPSBTLm1ldGEgfHwge307IFMubWV0YS5zZXR0aW5ncyA9IFMubWV0YS5zZXR0aW5ncyB8fCB7fTtcbiAgICAvLyBEZWVwIHBhdGggZmllbGRzXG4gICAgJCgnLnNjcC1zZXR0aW5ncy1maWVsZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aCA9ICQodGhpcykuZGF0YSgncGF0aCcpOyBpZiAoIXBhdGgpIHJldHVybjtcbiAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpOyB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7IHZhciBvYmogPSBTLm1ldGE7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykgeyBvYmpbcGFydHNbaV1dID0gb2JqW3BhcnRzW2ldXSB8fCB7fTsgb2JqID0gb2JqW3BhcnRzW2ldXTsgfVxuICAgICAgb2JqW3BhcnRzW3BhcnRzLmxlbmd0aCAtIDFdXSA9IHZhbDtcbiAgICB9KTtcbiAgICAvLyBEZWZhdWx0c1xuICAgICQoJy5zY3AtZGVmYXVsdC1maWVsZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gJCh0aGlzKS5kYXRhKCdkZWZhdWx0Jyk7IHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgUy5tZXRhLnNldHRpbmdzLmRlZmF1bHRzID0gUy5tZXRhLnNldHRpbmdzLmRlZmF1bHRzIHx8IHt9O1xuICAgICAgUy5tZXRhLnNldHRpbmdzLmRlZmF1bHRzW2tleV0gPSB2YWw7XG4gICAgfSk7XG4gICAgLy8gUGxhdGZvcm0gc2V0dGluZ3NcbiAgICAkKCcuc2NwLXBsYXRmb3JtLXNldHRpbmcnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBrID0gJCh0aGlzKS5kYXRhKCdwaycpOyB2YXIgZmllbGQgPSAkKHRoaXMpLmRhdGEoJ2ZpZWxkJyk7XG4gICAgICBTLm1ldGEuc2V0dGluZ3MucGxhdGZvcm1zID0gUy5tZXRhLnNldHRpbmdzLnBsYXRmb3JtcyB8fCB7fTtcbiAgICAgIFMubWV0YS5zZXR0aW5ncy5wbGF0Zm9ybXNbcGtdID0gUy5tZXRhLnNldHRpbmdzLnBsYXRmb3Jtc1twa10gfHwge307XG4gICAgICBpZiAoJCh0aGlzKS5pcygnOmNoZWNrYm94JykpIFMubWV0YS5zZXR0aW5ncy5wbGF0Zm9ybXNbcGtdW2ZpZWxkXSA9ICQodGhpcykuaXMoJzpjaGVja2VkJyk7XG4gICAgICBlbHNlIGlmIChmaWVsZCA9PT0gJ2NoYXJfbGltaXQnIHx8IGZpZWxkID09PSAndGl0bGVfbGltaXQnIHx8IGZpZWxkID09PSAnaGFzaHRhZ19saW1pdCcpIFMubWV0YS5zZXR0aW5ncy5wbGF0Zm9ybXNbcGtdW2ZpZWxkXSA9IHBhcnNlSW50KCQodGhpcykudmFsKCksIDEwKSB8fCAwO1xuICAgICAgZWxzZSBTLm1ldGEuc2V0dGluZ3MucGxhdGZvcm1zW3BrXVtmaWVsZF0gPSAkKHRoaXMpLnZhbCgpO1xuICAgIH0pO1xuICAgIC8vIE1lZGlhIHByb21wdCB0ZW1wbGF0ZXNcbiAgICAkKCcuc2NwLW1wdC1maWVsZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gJCh0aGlzKS5kYXRhKCdtcHQnKTtcbiAgICAgIFMubWV0YS5zZXR0aW5ncy5tZWRpYV9wcm9tcHRfdGVtcGxhdGVzID0gUy5tZXRhLnNldHRpbmdzLm1lZGlhX3Byb21wdF90ZW1wbGF0ZXMgfHwge307XG4gICAgICBTLm1ldGEuc2V0dGluZ3MubWVkaWFfcHJvbXB0X3RlbXBsYXRlc1trZXldID0gJCh0aGlzKS52YWwoKTtcbiAgICB9KTtcbiAgICAvLyBCcmFuZCBjb250ZXh0IHRvZ2dsZXNcbiAgICBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfY29udGV4dF9lbmFibGVkID0gUy5tZXRhLnNldHRpbmdzLmJyYW5kX2NvbnRleHRfZW5hYmxlZCB8fCB7fTtcbiAgICAkKCcuc2NwLWJyYW5kLWNvbnRleHQtdG9nZ2xlJykuZWFjaChmdW5jdGlvbigpIHsgdmFyIGtleSA9ICQodGhpcykuZGF0YSgna2V5Jyk7IGlmIChrZXkpIFMubWV0YS5zZXR0aW5ncy5icmFuZF9jb250ZXh0X2VuYWJsZWRba2V5XSA9ICQodGhpcykuaXMoJzpjaGVja2VkJyk7IH0pO1xuICAgIC8vIEJyYW5kIGRlc2lnbiBmaWVsZHNcbiAgICBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduID0gUy5tZXRhLnNldHRpbmdzLmJyYW5kX2Rlc2lnbiB8fCB7fTtcbiAgICAkKCcuc2NwLWJyYW5kLWRlc2lnbi1maWVsZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aCA9ICQodGhpcykuZGF0YSgnYmQtcGF0aCcpOyBpZiAoIXBhdGgpIHJldHVybjtcbiAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpOyB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJyk7IHZhciBvYmogPSBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHsgb2JqW3BhcnRzW2ldXSA9IG9ialtwYXJ0c1tpXV0gfHwge307IG9iaiA9IG9ialtwYXJ0c1tpXV07IH1cbiAgICAgIG9ialtwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXV0gPSB2YWw7XG4gICAgfSk7XG4gICAgUy5jYXJkRGVuc2l0eSA9IFMubWV0YS5zZXR0aW5ncy5jYXJkX2RlbnNpdHkgfHwgUy5jYXJkRGVuc2l0eTtcblxuICAgIC8vIFNhdmUgQUkgYXBwLWRlZmF1bHQgZnJvbSBwaWNrZXIgKGlmIHByZXNlbnQgb24gU2V0dGluZ3MgPiBBSSB0YWIpXG4gICAgdmFyICRkZWZQcm92aWRlciA9ICQoJy5zY3AtYWktcHJvdmlkZXItc2VsZWN0W2RhdGEtYWN0aW9uLWlkPVwiYXBwLWRlZmF1bHRcIl0nKTtcbiAgICB2YXIgJGRlZk1vZGVsID0gJCgnLnNjcC1haS1tb2RlbC1zZWxlY3RbZGF0YS1hY3Rpb24taWQ9XCJhcHAtZGVmYXVsdFwiXScpO1xuICAgIGlmICgkZGVmUHJvdmlkZXIubGVuZ3RoICYmICRkZWZNb2RlbC5sZW5ndGgpIHtcbiAgICAgIFMubWV0YS5haVByZWZlcmVuY2VzID0gUy5tZXRhLmFpUHJlZmVyZW5jZXMgfHwge307XG4gICAgICBTLm1ldGEuYWlQcmVmZXJlbmNlcy5hcHBEZWZhdWx0ID0geyBwcm92aWRlcjogJGRlZlByb3ZpZGVyLnZhbCgpLCBtb2RlbDogJGRlZk1vZGVsLnZhbCgpIH07XG4gICAgICBjb25zb2xlLmxvZygnW1NDUF0gU2F2ZWQgQUkgZGVmYXVsdDogJyArICRkZWZQcm92aWRlci52YWwoKSArICcgLyAnICsgJGRlZk1vZGVsLnZhbCgpKTtcbiAgICB9XG5cbiAgICBzbmFwc2hvdCgnU2F2ZSBzZXR0aW5ncycpOyBidWlsZE1hcHMoKTsgc3luY1RvVGV4dGFyZWEoKTtcblxuICAgIC8vIFVwZGF0ZSBBSSBzdGF0dXMgaW5kaWNhdG9yIGluIGhlYWRlciB0byByZWZsZWN0IG5ldyBkZWZhdWx0XG4gICAgdXBkYXRlQUlTdGF0dXNJbmRpY2F0b3IoKTtcblxuICAgIHRvYXN0KCdTZXR0aW5ncyBzYXZlZCcsICdzdWNjZXNzJyk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0VDVElPTiAxMzogSU1QT1JUL0VYUE9SVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBleHBvcnRKU09OKG1vZGUpIHtcbiAgICBtb2RlID0gbW9kZSB8fCAnY29tYmluZWQnO1xuICAgIHZhciBuYW1lID0gKChTLm1ldGEud29ya3NwYWNlICYmIFMubWV0YS53b3Jrc3BhY2UubmFtZSkgfHwgJ3NjcCcpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnLScpO1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgdmFyIGpzb24sIGZpbGVOYW1lO1xuICAgIGlmIChtb2RlID09PSAnbWV0YS1vbmx5JykgeyBqc29uID0gSlNPTi5zdHJpbmdpZnkoUy5tZXRhLCBudWxsLCAyKTsgZmlsZU5hbWUgPSBuYW1lICsgJy1tZXRhLScgKyBkYXRlICsgJy5qc29uJzsgfVxuICAgIGVsc2UgaWYgKG1vZGUgPT09ICdkYXRhLW9ubHknKSB7IGpzb24gPSBKU09OLnN0cmluZ2lmeShTLmRhdGEsIG51bGwsIDIpOyBmaWxlTmFtZSA9IG5hbWUgKyAnLWRhdGEtJyArIGRhdGUgKyAnLmpzb24nOyB9XG4gICAgZWxzZSB7IGpzb24gPSBKU09OLnN0cmluZ2lmeSh7IF9mb3JtYXQ6ICdzY3AtY29tYmluZWQnLCBfdmVyc2lvbjogJzEuMCcsIG1ldGE6IFMubWV0YSwgZGF0YTogUy5kYXRhLCBhY3Rpdml0eTogUy5hY3Rpdml0eSB9LCBudWxsLCAyKTsgZmlsZU5hbWUgPSBuYW1lICsgJy1leHBvcnQtJyArIGRhdGUgKyAnLmpzb24nOyB9XG4gICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbanNvbl0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuICAgIHZhciB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpOyB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7IGEuZG93bmxvYWQgPSBmaWxlTmFtZTsgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTsgYS5jbGljaygpOyBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGEpOyBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgdG9hc3QoJ0V4cG9ydGVkOiAnICsgZmlsZU5hbWUsICdzdWNjZXNzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbXBvcnRKU09OKCkge1xuICAgIHZhciAkaW5wdXQgPSAkKCcjc2NwSW1wb3J0RmlsZScpO1xuICAgIGlmICghJGlucHV0Lmxlbmd0aCkgeyAkaW5wdXQgPSAkKCc8aW5wdXQgdHlwZT1cImZpbGVcIiBpZD1cInNjcEltcG9ydEZpbGVcIiBhY2NlcHQ9XCIuanNvblwiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+Jyk7ICQoJ2JvZHknKS5hcHBlbmQoJGlucHV0KTsgfVxuICAgICRpbnB1dC5vZmYoJ2NoYW5nZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdOyBpZiAoIWZpbGUpIHJldHVybjtcbiAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbXBvcnRlZCA9IEpTT04ucGFyc2UoZXZ0LnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgIG9wZW5Db25maXJtRGlhbG9nKHsgdGl0bGU6ICdJbXBvcnQgRGF0YScsIG1lc3NhZ2U6ICdSZXBsYWNlIGFsbCBkYXRhPyBDdXJyZW50IGRhdGEgd2lsbCBiZSBsb3N0LicsIGNvbmZpcm1MYWJlbDogJ0ltcG9ydCcsIGRhbmdlcjogdHJ1ZSxcbiAgICAgICAgICAgIG9uQ29uZmlybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChpbXBvcnRlZC5fZm9ybWF0ID09PSAnc2NwLWNvbWJpbmVkJyAmJiBpbXBvcnRlZC5tZXRhICYmIGltcG9ydGVkLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBTLm1ldGEgPSBpbXBvcnRlZC5tZXRhOyBTLmRhdGEgPSBpbXBvcnRlZC5kYXRhOyBTLmFjdGl2aXR5ID0gaW1wb3J0ZWQuYWN0aXZpdHkgfHwgW107XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW1wb3J0ZWQud29ya3NwYWNlIHx8IGltcG9ydGVkLnNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgUy5tZXRhID0gaW1wb3J0ZWQ7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgUy5kYXRhID0gaW1wb3J0ZWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc25hcHNob3QoJ0ltcG9ydCcpOyBidWlsZE1hcHMoKTsgcmVuZGVyKCk7IHN5bmNUb1RleHRhcmVhKCk7IHRvYXN0KCdJbXBvcnRlZCBzdWNjZXNzZnVsbHknLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGVycikgeyB0b2FzdCgnSW52YWxpZCBKU09OIGZpbGUnLCAnZXJyb3InKTsgfVxuICAgICAgfTtcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpOyAkaW5wdXQudmFsKCcnKTtcbiAgICB9KTtcbiAgICAkaW5wdXQuY2xpY2soKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDEzLjE6IElNQUdFUyBWSUVXIFx1MjAxNCBHYWxsZXJ5LCBEZXRhaWwsIENSVUQsIFVwbG9hZFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgZ2V0SW1hZ2VzLCBnZXRJbWFnZUJ5SWQsIGdldEFsbEltYWdlVGFncywgcGFyc2VJbWFnZUZpZWxkO1xuXG4gIGZ1bmN0aW9uIF9pbXBvcnRJbWFnZUhlbHBlcnMoKSB7XG4gICAgZ2V0SW1hZ2VzID0gd2luZG93Ll9zY3BHZXRJbWFnZXM7XG4gICAgZ2V0SW1hZ2VCeUlkID0gd2luZG93Ll9zY3BHZXRJbWFnZUJ5SWQ7XG4gICAgZ2V0QWxsSW1hZ2VUYWdzID0gd2luZG93Ll9zY3BHZXRBbGxJbWFnZVRhZ3M7XG4gICAgcGFyc2VJbWFnZUZpZWxkID0gd2luZG93Ll9zY3BQYXJzZUltYWdlRmllbGQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJJbWFnZXNWaWV3KCkge1xuICAgIGlmICghZ2V0SW1hZ2VzKSBfaW1wb3J0SW1hZ2VIZWxwZXJzKCk7XG4gICAgdmFyIGNhdHMgPSAoUy5tZXRhICYmIFMubWV0YS5pbWFnZV9jYXRlZ29yaWVzKSB8fCBbXTtcbiAgICB2YXIgaW1ncyA9IGdldEltYWdlcyhTLmltYWdlRmlsdGVyKTtcbiAgICB2YXIgYWxsSW1nVGFncyA9IGdldEFsbEltYWdlVGFncygpO1xuXG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3IHNjcC12aWV3LWltYWdlc1wiPic7XG4gICAgLy8gSGVhZGVyXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlclwiPjxkaXYgY2xhc3M9XCJzY3Atdmlldy1oZWFkZXItbGVmdFwiPjxoMT4nICsgaWNvbignaW1hZ2VzJykgKyAnIFJlZmVyZW5jZSBJbWFnZXM8L2gxPic7XG4gICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3Atdmlldy1zdWJ0aXRsZVwiPicgKyBTLmltYWdlcy5sZW5ndGggKyAnIGltYWdlJyArIChTLmltYWdlcy5sZW5ndGggIT09IDEgPyAncycgOiAnJykgKyAnPC9zcGFuPjwvZGl2Pic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC12aWV3LWhlYWRlci1yaWdodFwiPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJ1cGxvYWQtaW1hZ2VcIj4nICsgaWNvbigndXBsb2FkJykgKyAnIFVwbG9hZDwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4taWNvbicgKyAoUy5pbWFnZVZpZXdNb2RlID09PSAnZ3JpZCcgPyAnJyA6ICcgc2NwLWJ0bi1pY29uLWFjdGl2ZScpICsgJ1wiIGRhdGEtYWN0aW9uPVwiaW1hZ2Utdmlldy1tb2RlXCIgZGF0YS1tb2RlPVwibGlzdFwiIHRpdGxlPVwiTGlzdCB2aWV3XCI+JyArIGljb24oJ2xpc3QnKSArICc8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYnRuLWljb24nICsgKFMuaW1hZ2VWaWV3TW9kZSA9PT0gJ2dyaWQnID8gJyBzY3AtYnRuLWljb24tYWN0aXZlJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cImltYWdlLXZpZXctbW9kZVwiIGRhdGEtbW9kZT1cImdyaWRcIiB0aXRsZT1cIkdyaWQgdmlld1wiPicgKyBpY29uKCdsYXlvdXQtZ3JpZCcpICsgJzwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcblxuICAgIC8vIEZpbHRlciBiYXJcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1maWx0ZXJzXCI+JztcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLXNlYXJjaC13cmFwcGVyXCI+PHNwYW4gY2xhc3M9XCJzY3AtaWNvblwiPicgKyBpY29uKCdzZWFyY2gnKSArICc8L3NwYW4+JztcbiAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dCBzY3AtaW1nLXNlYXJjaFwiIGlkPVwic2NwSW1nU2VhcmNoXCIgcGxhY2Vob2xkZXI9XCJTZWFyY2ggaW1hZ2VzLi4uXCIgdmFsdWU9XCInICsgZXNjKFMuaW1hZ2VGaWx0ZXIuc2VhcmNoIHx8ICcnKSArICdcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1zZWxlY3Qtc20gc2NwLWltZy1maWx0ZXJcIiBkYXRhLWZpbHRlcj1cImNhdGVnb3J5XCI+PG9wdGlvbiB2YWx1ZT1cIlwiPkFsbCBDYXRlZ29yaWVzPC9vcHRpb24+JztcbiAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgY2F0cy5sZW5ndGg7IGNpKyspIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgZXNjKGNhdHNbY2ldLmlkKSArICdcIicgKyAoUy5pbWFnZUZpbHRlci5jYXRlZ29yeSA9PT0gY2F0c1tjaV0uaWQgPyAnIHNlbGVjdGVkJyA6ICcnKSArICc+JyArIGVzYyhjYXRzW2NpXS5sYWJlbCkgKyAnPC9vcHRpb24+JztcbiAgICBodG1sICs9ICc8L3NlbGVjdD4nO1xuICAgIC8vIFN0eWxlIGZpbHRlclxuICAgIHZhciBpbWdTdHlsZXMgPSAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5pbWFnZV9zdHlsZXMpIHx8IFtdO1xuICAgIGlmIChpbWdTdHlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgaHRtbCArPSAnPHNlbGVjdCBjbGFzcz1cInNjcC1zZWxlY3Qgc2NwLXNlbGVjdC1zbSBzY3AtaW1nLWZpbHRlclwiIGRhdGEtZmlsdGVyPVwic3R5bGVcIj48b3B0aW9uIHZhbHVlPVwiXCI+QWxsIFN0eWxlczwvb3B0aW9uPic7XG4gICAgICBmb3IgKHZhciBzdGkgPSAwOyBzdGkgPCBpbWdTdHlsZXMubGVuZ3RoOyBzdGkrKykgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBlc2MoaW1nU3R5bGVzW3N0aV0uaWQpICsgJ1wiJyArIChTLmltYWdlRmlsdGVyLnN0eWxlID09PSBpbWdTdHlsZXNbc3RpXS5pZCA/ICcgc2VsZWN0ZWQnIDogJycpICsgJz4nICsgZXNjKGltZ1N0eWxlc1tzdGldLm5hbWUpICsgJzwvb3B0aW9uPic7XG4gICAgICBodG1sICs9ICc8L3NlbGVjdD4nO1xuICAgIH1cbiAgICBpZiAoYWxsSW1nVGFncy5sZW5ndGggPiAwKSB7XG4gICAgICBodG1sICs9ICc8c2VsZWN0IGNsYXNzPVwic2NwLXNlbGVjdCBzY3Atc2VsZWN0LXNtIHNjcC1pbWctZmlsdGVyXCIgZGF0YS1maWx0ZXI9XCJ0YWdcIj48b3B0aW9uIHZhbHVlPVwiXCI+QWxsIFRhZ3M8L29wdGlvbj4nO1xuICAgICAgZm9yICh2YXIgdGkgPSAwOyB0aSA8IGFsbEltZ1RhZ3MubGVuZ3RoOyB0aSsrKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGVzYyhhbGxJbWdUYWdzW3RpXSkgKyAnXCInICsgKFMuaW1hZ2VGaWx0ZXIudGFnID09PSBhbGxJbWdUYWdzW3RpXSA/ICcgc2VsZWN0ZWQnIDogJycpICsgJz4nICsgZXNjKGFsbEltZ1RhZ3NbdGldKSArICc8L29wdGlvbj4nO1xuICAgICAgaHRtbCArPSAnPC9zZWxlY3Q+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1idG4gc2NwLWJ0bi1zbScgKyAoUy5pbWFnZUZpbHRlci5zdGFyID8gJyBzY3AtYnRuLXByaW1hcnknIDogJyBzY3AtYnRuLW91dGxpbmUnKSArICdcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1pbWctc3Rhci1maWx0ZXJcIj4nICsgaWNvbignc3RhcicpICsgJyBTdGFycmVkPC9idXR0b24+JztcbiAgICBodG1sICs9ICc8c2VsZWN0IGNsYXNzPVwic2NwLXNlbGVjdCBzY3Atc2VsZWN0LXNtIHNjcC1pbWctZmlsdGVyXCIgZGF0YS1maWx0ZXI9XCJzb3J0XCI+JztcbiAgICBbWyduZXdlc3QnLCAnTmV3ZXN0J10sIFsnbmFtZScsICdOYW1lJ10sIFsnbW9zdC11c2VkJywgJ01vc3QgVXNlZCddXS5mb3JFYWNoKGZ1bmN0aW9uKG9wdCkge1xuICAgICAgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyBvcHRbMF0gKyAnXCInICsgKFMuaW1hZ2VGaWx0ZXIuc29ydCA9PT0gb3B0WzBdID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBvcHRbMV0gKyAnPC9vcHRpb24+JztcbiAgICB9KTtcbiAgICBodG1sICs9ICc8L3NlbGVjdD4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICAvLyBHYWxsZXJ5XG4gICAgaWYgKGltZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlXCI+PGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS1pY29uXCI+JyArIGljb24oJ2ltYWdlcycpICsgJzwvZGl2Pic7XG4gICAgICBpZiAoUy5pbWFnZXMubGVuZ3RoID09PSAwICYmICghUy4kaW1hZ2VGaWVsZCB8fCAhUy4kaW1hZ2VGaWVsZC5sZW5ndGgpKSB7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGl0bGVcIj5JbWFnZSBGaWVsZCBOb3QgRm91bmQ8L2Rpdj4nO1xuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWVtcHR5LXN0YXRlLXRleHRcIj5BZGQgYSA8c3Ryb25nPmZpZWxkX2ltYWdlczwvc3Ryb25nPiAoSW1hZ2UsIG11bHRpLXZhbHVlKSBmaWVsZCB0byB5b3VyIFNvY2lhbCBDb250ZW50IFBsYW5uZXIgY29udGVudCB0eXBlIGluIERydXBhbCwgdGhlbiB1cGxvYWQgcmVmZXJlbmNlIGltYWdlcyBvbiB0aGlzIG5vZGUuPC9kaXY+JztcbiAgICAgIH0gZWxzZSBpZiAoUy5pbWFnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGl0bGVcIj5ObyByZWZlcmVuY2UgaW1hZ2VzIHlldDwvZGl2Pic7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGV4dFwiPlVwbG9hZCBicmFuZCByZWZlcmVuY2UgaW1hZ2VzIHRvIGJ1aWxkIHlvdXIgdmlzdWFsIGxpYnJhcnkuIFRoZXNlIGFyZSB1c2VkIHRvIGd1aWRlIEFJIGltYWdlIHByb21wdCBnZW5lcmF0aW9uIGZvciBicmFuZCBjb25zaXN0ZW5jeS48L2Rpdj4nO1xuICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cInVwbG9hZC1pbWFnZVwiPicgKyBpY29uKCd1cGxvYWQnKSArICcgVXBsb2FkIEZpcnN0IEltYWdlPC9idXR0b24+JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZW1wdHktc3RhdGUtdGl0bGVcIj5ObyBtYXRjaGVzPC9kaXY+JztcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZS10ZXh0XCI+VHJ5IGFkanVzdGluZyB5b3VyIHNlYXJjaCBvciBmaWx0ZXJzLjwvZGl2Pic7XG4gICAgICB9XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIH0gZWxzZSBpZiAoUy5pbWFnZVZpZXdNb2RlID09PSAnZ3JpZCcpIHtcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWdyaWRcIj4nO1xuICAgICAgZm9yICh2YXIgZ2kgPSAwOyBnaSA8IGltZ3MubGVuZ3RoOyBnaSsrKSBodG1sICs9IHJlbmRlckltYWdlQ2FyZChpbWdzW2dpXSk7XG4gICAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1saXN0LXRhYmxlXCI+JztcbiAgICAgIGZvciAodmFyIGxpID0gMDsgbGkgPCBpbWdzLmxlbmd0aDsgbGkrKykgaHRtbCArPSByZW5kZXJJbWFnZUxpc3RSb3coaW1nc1tsaV0pO1xuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICAvLyBEZXRhaWwgcGFuZWwgKHNob3duIHdoZW4gaW1hZ2Ugc2VsZWN0ZWQpXG4gICAgaWYgKFMuc2VsZWN0ZWRJbWFnZUlkICYmIFMuaW1hZ2VNYXBbUy5zZWxlY3RlZEltYWdlSWRdKSB7XG4gICAgICBodG1sICs9IHJlbmRlckltYWdlRGV0YWlsUGFuZWwoUy5pbWFnZU1hcFtTLnNlbGVjdGVkSW1hZ2VJZF0pO1xuICAgIH1cblxuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJJbWFnZUNhcmQoaW1nKSB7XG4gICAgdmFyIGNhdCA9IFMuaW1hZ2VDYXRlZ29yeU1hcFtpbWcuY2F0ZWdvcnldO1xuICAgIHZhciBpc1NlbGVjdGVkID0gUy5zZWxlY3RlZEltYWdlSWQgPT09IGltZy5maWQ7XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctY2FyZCcgKyAoaXNTZWxlY3RlZCA/ICcgc2NwLWltZy1jYXJkLXNlbGVjdGVkJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cInNlbGVjdC1pbWFnZVwiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWNhcmQtdGh1bWJcIj48aW1nIHNyYz1cIicgKyBlc2MoaW1nLnVybCkgKyAnXCIgYWx0PVwiJyArIGVzYyhpbWcuYWx0IHx8IGltZy5maWxlbmFtZSkgKyAnXCIgbG9hZGluZz1cImxhenlcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWNhcmQtYm9keVwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctY2FyZC10b3BcIj4nO1xuICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWltZy1jYXJkLW5hbWVcIj4nICsgZXNjKHRydW5jYXRlKGltZy5maWxlbmFtZSwgMjQpKSArICc8L3NwYW4+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWltZy1zdGFyJyArIChpbWcuc3RhciA/ICcgc2NwLWltZy1zdGFyLWFjdGl2ZScgOiAnJykgKyAnXCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtaW1hZ2Utc3RhclwiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIiB0aXRsZT1cIicgKyAoaW1nLnN0YXIgPyAnVW5zdGFyJyA6ICdTdGFyJykgKyAnXCI+XHUyNjA1PC9idXR0b24+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuICAgIGlmIChjYXQpIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyBjYXQuY29sb3IgKyAnMTU7Y29sb3I6JyArIGNhdC5jb2xvciArICdcIj4nICsgaWNvbihjYXQuaWNvbikgKyAnICcgKyBlc2MoY2F0LmxhYmVsKSArICc8L3NwYW4+JztcbiAgICB2YXIgc3R5bGVPYmogPSBpbWcuc3R5bGUgPyBTLmltYWdlU3R5bGVNYXBbaW1nLnN0eWxlXSA6IG51bGw7XG4gICAgaWYgKHN0eWxlT2JqKSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1iYWRnZVwiIHN0eWxlPVwiYmFja2dyb3VuZDp2YXIoLS1zY3AtcHJpbWFyeS1saWdodCk7Y29sb3I6dmFyKC0tc2NwLXByaW1hcnkpXCI+JyArIGljb24oJ3BhbGV0dGUnKSArICcgJyArIGVzYyhzdHlsZU9iai5uYW1lKSArICc8L3NwYW4+JztcbiAgICBpZiAoaW1nLnRhZ3MgJiYgaW1nLnRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctY2FyZC10YWdzXCI+JztcbiAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgTWF0aC5taW4oaW1nLnRhZ3MubGVuZ3RoLCAzKTsgdCsrKSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10YWctY2hpcFwiIHN0eWxlPVwiZm9udC1zaXplOjEwcHg7cGFkZGluZzoxcHggNnB4O2JvcmRlci1jb2xvcjp2YXIoLS1zY3AtYm9yZGVyLWRlZmF1bHQpO2N1cnNvcjpkZWZhdWx0XCI+JyArIGVzYyhpbWcudGFnc1t0XSkgKyAnPC9zcGFuPic7XG4gICAgICBpZiAoaW1nLnRhZ3MubGVuZ3RoID4gMykgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC14cyBzY3AtdGV4dC1tdXRlZFwiPisnICsgKGltZy50YWdzLmxlbmd0aCAtIDMpICsgJzwvc3Bhbj4nO1xuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG4gICAgaWYgKGltZy51c2FnZSAmJiBpbWcudXNhZ2UubGVuZ3RoID4gMCkgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC14cyBzY3AtdGV4dC1tdXRlZFwiPicgKyBpY29uKCdsaW5rJykgKyAnIFVzZWQgaW4gJyArIGltZy51c2FnZS5sZW5ndGggKyAnIHBvc3QnICsgKGltZy51c2FnZS5sZW5ndGggIT09IDEgPyAncycgOiAnJykgKyAnPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+PC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckltYWdlTGlzdFJvdyhpbWcpIHtcbiAgICB2YXIgY2F0ID0gUy5pbWFnZUNhdGVnb3J5TWFwW2ltZy5jYXRlZ29yeV07XG4gICAgdmFyIGlzU2VsZWN0ZWQgPSBTLnNlbGVjdGVkSW1hZ2VJZCA9PT0gaW1nLmZpZDtcbiAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1saXN0LXJvdycgKyAoaXNTZWxlY3RlZCA/ICcgc2NwLWltZy1saXN0LXJvdy1zZWxlY3RlZCcgOiAnJykgKyAnXCIgZGF0YS1hY3Rpb249XCJzZWxlY3QtaW1hZ2VcIiBkYXRhLWZpZD1cIicgKyBlc2MoaW1nLmZpZCkgKyAnXCI+JztcbiAgICBodG1sICs9ICc8aW1nIGNsYXNzPVwic2NwLWltZy1saXN0LXRodW1iXCIgc3JjPVwiJyArIGVzYyhpbWcudXJsKSArICdcIiBhbHQ9XCJcIiBsb2FkaW5nPVwibGF6eVwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctbGlzdC1pbmZvXCI+PHNwYW4gY2xhc3M9XCJzY3AtaW1nLWxpc3QtbmFtZVwiPicgKyBlc2MoaW1nLmZpbGVuYW1lKSArICc8L3NwYW4+JztcbiAgICBpZiAoaW1nLmRlc2NyaXB0aW9uKSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXhzIHNjcC10ZXh0LW11dGVkXCI+JyArIGVzYyh0cnVuY2F0ZShpbWcuZGVzY3JpcHRpb24sIDYwKSkgKyAnPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICBpZiAoY2F0KSBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC1iYWRnZVwiIHN0eWxlPVwiYmFja2dyb3VuZDonICsgY2F0LmNvbG9yICsgJzE1O2NvbG9yOicgKyBjYXQuY29sb3IgKyAnXCI+JyArIGVzYyhjYXQubGFiZWwpICsgJzwvc3Bhbj4nO1xuICAgIHZhciBzdHlsZU9iaiA9IGltZy5zdHlsZSA/IFMuaW1hZ2VTdHlsZU1hcFtpbWcuc3R5bGVdIDogbnVsbDtcbiAgICBpZiAoc3R5bGVPYmopIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOnZhcigtLXNjcC1wcmltYXJ5LWxpZ2h0KTtjb2xvcjp2YXIoLS1zY3AtcHJpbWFyeSlcIj4nICsgZXNjKHN0eWxlT2JqLm5hbWUpICsgJzwvc3Bhbj4nO1xuICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtaW1nLXN0YXInICsgKGltZy5zdGFyID8gJyBzY3AtaW1nLXN0YXItYWN0aXZlJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1pbWFnZS1zdGFyXCIgZGF0YS1maWQ9XCInICsgZXNjKGltZy5maWQpICsgJ1wiPlx1MjYwNTwvYnV0dG9uPic7XG4gICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtdGV4dC14cyBzY3AtdGV4dC1tdXRlZFwiPicgKyAoaW1nLnVzYWdlIHx8IFtdKS5sZW5ndGggKyAnIHVzZScgKyAoKGltZy51c2FnZSB8fCBbXSkubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpICsgJzwvc3Bhbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJJbWFnZURldGFpbFBhbmVsKGltZykge1xuICAgIHZhciBjYXRzID0gKFMubWV0YSAmJiBTLm1ldGEuaW1hZ2VfY2F0ZWdvcmllcykgfHwgW107XG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctZGV0YWlsLWJhY2tkcm9wXCIgZGF0YS1hY3Rpb249XCJjbG9zZS1pbWFnZS1kZXRhaWxcIj48L2Rpdj4nO1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWRldGFpbFwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctZGV0YWlsLWhlYWRlclwiPjxoMz4nICsgaWNvbignaW1hZ2UnKSArICcgSW1hZ2UgRGV0YWlsczwvaDM+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0bi1pY29uXCIgZGF0YS1hY3Rpb249XCJjbG9zZS1pbWFnZS1kZXRhaWxcIj4nICsgaWNvbigneCcpICsgJzwvYnV0dG9uPjwvZGl2Pic7XG5cbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1kZXRhaWwtYm9keVwiPic7XG4gICAgLy8gUHJldmlld1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWRldGFpbC1wcmV2aWV3XCI+PGltZyBzcmM9XCInICsgZXNjKGltZy51cmwpICsgJ1wiIGFsdD1cIicgKyBlc2MoaW1nLmFsdCB8fCAnJykgKyAnXCI+PC9kaXY+JztcbiAgICAvLyBGaWxlbmFtZSArIHN0YXJcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1kZXRhaWwtdGl0bGVcIj4nO1xuICAgIGh0bWwgKz0gJzxzdHJvbmc+JyArIGVzYyhpbWcuZmlsZW5hbWUpICsgJzwvc3Ryb25nPic7XG4gICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cInNjcC1pbWctc3RhcicgKyAoaW1nLnN0YXIgPyAnIHNjcC1pbWctc3Rhci1hY3RpdmUnIDogJycpICsgJ1wiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLWltYWdlLXN0YXJcIiBkYXRhLWZpZD1cIicgKyBlc2MoaW1nLmZpZCkgKyAnXCI+XHUyNjA1PC9idXR0b24+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgLy8gRWRpdGFibGUgZmllbGRzXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1lZGl0b3ItZm9ybVwiPic7XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkRlc2NyaXB0aW9uPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBjbGFzcz1cInNjcC10ZXh0YXJlYSBzY3AtaW1nLW1ldGEtZmllbGRcIiBkYXRhLWZpZD1cIicgKyBlc2MoaW1nLmZpZCkgKyAnXCIgZGF0YS1maWVsZD1cImRlc2NyaXB0aW9uXCIgcm93cz1cIjJcIiBwbGFjZWhvbGRlcj1cIkRlc2NyaWJlIHRoaXMgcmVmZXJlbmNlIGltYWdlLi4uXCI+JyArIGVzYyhpbWcuZGVzY3JpcHRpb24gfHwgJycpICsgJzwvdGV4dGFyZWE+PC9kaXY+JztcblxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5DYXRlZ29yeTwvbGFiZWw+JztcbiAgICBodG1sICs9ICc8c2VsZWN0IGNsYXNzPVwic2NwLXNlbGVjdCBzY3AtaW1nLW1ldGEtZmllbGRcIiBkYXRhLWZpZD1cIicgKyBlc2MoaW1nLmZpZCkgKyAnXCIgZGF0YS1maWVsZD1cImNhdGVnb3J5XCI+JztcbiAgICBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiXCI+VW5jYXRlZ29yaXplZDwvb3B0aW9uPic7XG4gICAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IGNhdHMubGVuZ3RoOyBjaSsrKSBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGVzYyhjYXRzW2NpXS5pZCkgKyAnXCInICsgKGltZy5jYXRlZ29yeSA9PT0gY2F0c1tjaV0uaWQgPyAnIHNlbGVjdGVkJyA6ICcnKSArICc+JyArIGVzYyhjYXRzW2NpXS5sYWJlbCkgKyAnPC9vcHRpb24+JztcbiAgICBodG1sICs9ICc8L3NlbGVjdD48L2Rpdj4nO1xuXG4gICAgLy8gVmlzdWFsIHN0eWxlIFx1MjAxNCBmb3IgZmlsdGVyaW5nIGluIG1lZGlhIHN0ZXBcbiAgICB2YXIgaW1nU3R5bGVzID0gKFMubWV0YS5zZXR0aW5ncyAmJiBTLm1ldGEuc2V0dGluZ3MuaW1hZ2Vfc3R5bGVzKSB8fCBbXTtcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+VmlzdWFsIFN0eWxlPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1pbWctbWV0YS1maWVsZFwiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIiBkYXRhLWZpZWxkPVwic3R5bGVcIj4nO1xuICAgIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCJcIj5ObyBzdHlsZSBhc3NpZ25lZDwvb3B0aW9uPic7XG4gICAgZm9yICh2YXIgc3RpID0gMDsgc3RpIDwgaW1nU3R5bGVzLmxlbmd0aDsgc3RpKyspIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgZXNjKGltZ1N0eWxlc1tzdGldLmlkKSArICdcIicgKyAoaW1nLnN0eWxlID09PSBpbWdTdHlsZXNbc3RpXS5pZCA/ICcgc2VsZWN0ZWQnIDogJycpICsgJz4nICsgZXNjKGltZ1N0eWxlc1tzdGldLm5hbWUpICsgJzwvb3B0aW9uPic7XG4gICAgaHRtbCArPSAnPC9zZWxlY3Q+PC9kaXY+JztcblxuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5UYWdzPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2NwLWlucHV0IHNjcC1pbWctbWV0YS1maWVsZFwiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIiBkYXRhLWZpZWxkPVwidGFnc1wiIHZhbHVlPVwiJyArIGVzYygoaW1nLnRhZ3MgfHwgW10pLmpvaW4oJywgJykpICsgJ1wiIHBsYWNlaG9sZGVyPVwibWluaW1hbGlzdCwgYmx1ZS10aGVtZSwgY2xlYW4uLi5cIj48L2Rpdj4nO1xuXG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPk5vdGVzPC9sYWJlbD4nO1xuICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBjbGFzcz1cInNjcC10ZXh0YXJlYSBzY3AtaW1nLW1ldGEtZmllbGRcIiBkYXRhLWZpZD1cIicgKyBlc2MoaW1nLmZpZCkgKyAnXCIgZGF0YS1maWVsZD1cIm5vdGVzXCIgcm93cz1cIjJcIiBwbGFjZWhvbGRlcj1cIldoZW4gdG8gdXNlIHRoaXMgcmVmZXJlbmNlLi4uXCI+JyArIGVzYyhpbWcubm90ZXMgfHwgJycpICsgJzwvdGV4dGFyZWE+PC9kaXY+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgLy8gVXNhZ2UgaGlzdG9yeVxuICAgIGlmIChpbWcudXNhZ2UgJiYgaW1nLnVzYWdlLmxlbmd0aCA+IDApIHtcbiAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWRldGFpbC1zZWN0aW9uXCI+PGg0PlVzYWdlIEhpc3Rvcnk8L2g0Pic7XG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy11c2FnZS1saXN0XCI+JztcbiAgICAgIGZvciAodmFyIHVpID0gMDsgdWkgPCBpbWcudXNhZ2UubGVuZ3RoOyB1aSsrKSB7XG4gICAgICAgIHZhciB1ID0gaW1nLnVzYWdlW3VpXTsgdmFyIHBvc3QgPSBTLnBvc3RNYXBbdS5wb3N0X2lkXTtcbiAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctdXNhZ2UtaXRlbVwiPic7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuPicgKyAocG9zdCA/IGVzYyh0cnVuY2F0ZShwb3N0LnRpdGxlLCAzMCkpIDogZXNjKHUucG9zdF9pZCkpICsgJzwvc3Bhbj4nO1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXhzIHNjcC10ZXh0LW11dGVkXCI+JyArIGZvcm1hdERhdGUodS51c2VkX2F0KSArICc8L3NwYW4+JztcbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgIH1cbiAgICAgIGh0bWwgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgfVxuXG4gICAgLy8gSW5mbyByb3dcbiAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWltZy1kZXRhaWwtaW5mb1wiPic7XG4gICAgaHRtbCArPSAnPHNwYW4+RmlsZSBJRDogJyArIGVzYyhpbWcuZmlkKSArICc8L3NwYW4+JztcbiAgICBodG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgLy8gQWN0aW9uc1xuICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzY3AtaW1nLWRldGFpbC1hY3Rpb25zXCI+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiY29weS1pbWFnZS11cmxcIiBkYXRhLXVybD1cIicgKyBlc2MoaW1nLnVybCkgKyAnXCI+JyArIGljb24oJ2NvcHknKSArICcgQ29weSBVUkw8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzxhIGhyZWY9XCInICsgZXNjKGltZy51cmwpICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiPicgKyBpY29uKCdleHRlcm5hbC1saW5rJykgKyAnIE9wZW48L2E+JztcbiAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwic2NwLWJ0biBzY3AtYnRuLXNtIHNjcC1idG4tb3V0bGluZVwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6YXV0bztjb2xvcjp2YXIoLS1zY3AtZXJyb3IpXCIgZGF0YS1hY3Rpb249XCJkZWxldGUtaW1hZ2UtbWV0YVwiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIj4nICsgaWNvbigndHJhc2gnKSArICcgQ2xlYXIgTWV0YWRhdGE8L2J1dHRvbj4nO1xuICAgIGh0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nOyAvLyBlbmQgYm9keSArIHBhbmVsXG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICAvLyAtLS0gSW1hZ2UgQ1JVRCAtLS1cblxuICBmdW5jdGlvbiBzYXZlSW1hZ2VNZXRhKGZpZCwgZmllbGQsIHZhbHVlKSB7XG4gICAgUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXMgPSBTLm1ldGEucmVmZXJlbmNlX2ltYWdlcyB8fCB7fTtcbiAgICBTLm1ldGEucmVmZXJlbmNlX2ltYWdlc1tmaWRdID0gUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXNbZmlkXSB8fCB7IGNhdGVnb3J5OiAnJywgc3R5bGU6ICcnLCB0YWdzOiBbXSwgc3RhcjogZmFsc2UsIGRlc2NyaXB0aW9uOiAnJywgbm90ZXM6ICcnLCB1c2FnZTogW10gfTtcbiAgICB2YXIgbWV0YSA9IFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF07XG4gICAgaWYgKGZpZWxkID09PSAndGFncycpIHtcbiAgICAgIG1ldGEudGFncyA9IHZhbHVlLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQudHJpbSgpLnRvTG93ZXJDYXNlKCk7IH0pLmZpbHRlcihCb29sZWFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWV0YVtmaWVsZF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgLy8gU3luYyBydW50aW1lXG4gICAgaWYgKFMuaW1hZ2VNYXBbZmlkXSkge1xuICAgICAgUy5pbWFnZU1hcFtmaWRdLmNhdGVnb3J5ID0gbWV0YS5jYXRlZ29yeTtcbiAgICAgIFMuaW1hZ2VNYXBbZmlkXS5zdHlsZSA9IG1ldGEuc3R5bGUgfHwgJyc7XG4gICAgICBTLmltYWdlTWFwW2ZpZF0udGFncyA9IG1ldGEudGFncztcbiAgICAgIFMuaW1hZ2VNYXBbZmlkXS5kZXNjcmlwdGlvbiA9IG1ldGEuZGVzY3JpcHRpb247XG4gICAgICBTLmltYWdlTWFwW2ZpZF0ubm90ZXMgPSBtZXRhLm5vdGVzO1xuICAgIH1cbiAgICBzeW5jVG9UZXh0YXJlYSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlSW1hZ2VTdGFyKGZpZCkge1xuICAgIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzID0gUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXMgfHwge307XG4gICAgUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXNbZmlkXSA9IFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0gfHwgeyBjYXRlZ29yeTogJycsIHRhZ3M6IFtdLCBzdGFyOiBmYWxzZSwgZGVzY3JpcHRpb246ICcnLCBub3RlczogJycsIHVzYWdlOiBbXSB9O1xuICAgIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0uc3RhciA9ICFTLm1ldGEucmVmZXJlbmNlX2ltYWdlc1tmaWRdLnN0YXI7XG4gICAgaWYgKFMuaW1hZ2VNYXBbZmlkXSkgUy5pbWFnZU1hcFtmaWRdLnN0YXIgPSBTLm1ldGEucmVmZXJlbmNlX2ltYWdlc1tmaWRdLnN0YXI7XG4gICAgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlbGV0ZUltYWdlTWV0YShmaWQpIHtcbiAgICBvcGVuQ29uZmlybURpYWxvZyh7IHRpdGxlOiAnQ2xlYXIgTWV0YWRhdGEnLCBtZXNzYWdlOiAnUmVtb3ZlIGFsbCBtZXRhZGF0YSAoY2F0ZWdvcnksIHRhZ3MsIG5vdGVzKSBmb3IgdGhpcyBpbWFnZT8gVGhlIGltYWdlIGZpbGUgaXRzZWxmIHJlbWFpbnMgaW4gRHJ1cGFsLicsIGNvbmZpcm1MYWJlbDogJ0NsZWFyJywgZGFuZ2VyOiB0cnVlLFxuICAgICAgb25Db25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzICYmIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0pIGRlbGV0ZSBTLm1ldGEucmVmZXJlbmNlX2ltYWdlc1tmaWRdO1xuICAgICAgICBpZiAoUy5pbWFnZU1hcFtmaWRdKSB7IFMuaW1hZ2VNYXBbZmlkXS5jYXRlZ29yeSA9ICcnOyBTLmltYWdlTWFwW2ZpZF0udGFncyA9IFtdOyBTLmltYWdlTWFwW2ZpZF0uc3RhciA9IGZhbHNlOyBTLmltYWdlTWFwW2ZpZF0uZGVzY3JpcHRpb24gPSAnJzsgUy5pbWFnZU1hcFtmaWRdLm5vdGVzID0gJyc7IH1cbiAgICAgICAgUy5zZWxlY3RlZEltYWdlSWQgPSBudWxsOyBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTsgdG9hc3QoJ01ldGFkYXRhIGNsZWFyZWQnLCAnc3VjY2VzcycpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3JkSW1hZ2VVc2FnZShmaWQsIHBvc3RJZCwgY29udGV4dCkge1xuICAgIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzID0gUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXMgfHwge307XG4gICAgUy5tZXRhLnJlZmVyZW5jZV9pbWFnZXNbZmlkXSA9IFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0gfHwgeyBjYXRlZ29yeTogJycsIHRhZ3M6IFtdLCBzdGFyOiBmYWxzZSwgZGVzY3JpcHRpb246ICcnLCBub3RlczogJycsIHVzYWdlOiBbXSB9O1xuICAgIFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0udXNhZ2UucHVzaCh7IHBvc3RfaWQ6IHBvc3RJZCwgdXNlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLCBjb250ZXh0OiBjb250ZXh0IHx8ICdtZWRpYV9wcm9tcHQnIH0pO1xuICAgIGlmIChTLmltYWdlTWFwW2ZpZF0pIFMuaW1hZ2VNYXBbZmlkXS51c2FnZSA9IFMubWV0YS5yZWZlcmVuY2VfaW1hZ2VzW2ZpZF0udXNhZ2U7XG4gICAgc3luY1RvVGV4dGFyZWEoKTtcbiAgfVxuXG4gIC8vIC0tLSBVcGxvYWQgdHJpZ2dlciAtLS1cblxuICBmdW5jdGlvbiB0cmlnZ2VySW1hZ2VVcGxvYWQoKSB7XG4gICAgaWYgKCFTLiRpbWFnZUZpZWxkIHx8ICFTLiRpbWFnZUZpZWxkLmxlbmd0aCkgeyB0b2FzdCgnSW1hZ2UgZmllbGQgbm90IGZvdW5kIG9uIHRoaXMgcGFnZScsICdlcnJvcicpOyByZXR1cm47IH1cbiAgICAvLyBUZW1wb3JhcmlseSBzaG93IHRoZSBEcnVwYWwgZmllbGQgdG8gdHJpZ2dlciB1cGxvYWRcbiAgICBTLiRpbWFnZUZpZWxkLnNob3coKTtcbiAgICAvLyBGaW5kIHRoZSBsYXN0IGVtcHR5IGZpbGUgaW5wdXQgKERydXBhbCBhZGRzIGEgbmV3IG9uZSBmb3IgZWFjaCBzbG90KVxuICAgIHZhciAkZmlsZUlucHV0cyA9IFMuJGltYWdlRmllbGQuZmluZCgnaW5wdXRbdHlwZT1cImZpbGVcIl0nKTtcbiAgICB2YXIgJGVtcHR5U2xvdCA9ICRmaWxlSW5wdXRzLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICEkKHRoaXMpLnZhbCgpOyB9KS5sYXN0KCk7XG4gICAgaWYgKCEkZW1wdHlTbG90Lmxlbmd0aCkgeyB0b2FzdCgnTm8gdXBsb2FkIHNsb3RzIGF2YWlsYWJsZSBcdTIwMTQgc2F2ZSB0aGUgbm9kZSBmaXJzdCB0byBnZXQgbW9yZSBzbG90cycsICd3YXJuaW5nJyk7IFMuJGltYWdlRmllbGQuaGlkZSgpOyByZXR1cm47IH1cbiAgICAvLyBTZXQgdXAgYSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgRHJ1cGFsIEFKQVggY29tcGxldGlvblxuICAgIHZhciBfY2hlY2tDb3VudCA9IDA7XG4gICAgdmFyIF9wcmV2Q291bnQgPSBTLmltYWdlcy5sZW5ndGg7XG4gICAgdG9hc3QoJ0RydXBhbCB1cGxvYWQgZGlhbG9nIG9wZW5lZCBcdTIwMTQgc2VsZWN0IHlvdXIgaW1hZ2UnLCAnaW5mbycpO1xuICAgICRlbXB0eVNsb3QudHJpZ2dlcignY2xpY2snKTtcbiAgICAvLyBQb2xsIGZvciBuZXcgaW1hZ2UgYWZ0ZXIgdXBsb2FkIGNvbXBsZXRlc1xuICAgIHZhciBwb2xsVGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIF9jaGVja0NvdW50Kys7XG4gICAgICAvLyBSZS1wYXJzZSB0byBkZXRlY3QgbmV3IGltYWdlc1xuICAgICAgcGFyc2VJbWFnZUZpZWxkKCk7XG4gICAgICBpZiAoUy5pbWFnZXMubGVuZ3RoID4gX3ByZXZDb3VudCkge1xuICAgICAgICBjbGVhckludGVydmFsKHBvbGxUaW1lcik7XG4gICAgICAgIFMuJGltYWdlRmllbGQuaGlkZSgpO1xuICAgICAgICB2YXIgbmV3SW1nID0gUy5pbWFnZXNbUy5pbWFnZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIFMuc2VsZWN0ZWRJbWFnZUlkID0gbmV3SW1nLmZpZDtcbiAgICAgICAgbG9nQWN0aXZpdHkoJ2ltYWdlX3VwbG9hZGVkJywgJycsICcnLCAnVXBsb2FkZWQgcmVmZXJlbmNlIGltYWdlOiAnICsgbmV3SW1nLmZpbGVuYW1lKTtcbiAgICAgICAgYnVpbGRNYXBzKCk7IHJlbmRlcigpOyB0b2FzdCgnSW1hZ2UgdXBsb2FkZWQhIEFkZCBtZXRhZGF0YSBiZWxvdy4nLCAnc3VjY2VzcycpO1xuICAgICAgfSBlbHNlIGlmIChfY2hlY2tDb3VudCA+IDEyMCkgeyAvLyA2MCBzZWNvbmRzIHRpbWVvdXRcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwb2xsVGltZXIpO1xuICAgICAgICBTLiRpbWFnZUZpZWxkLmhpZGUoKTtcbiAgICAgICAgdG9hc3QoJ1VwbG9hZCB0aW1lZCBvdXQuIElmIHlvdSBzZWxlY3RlZCBhIGZpbGUsIHRyeSBzYXZpbmcgdGhlIG5vZGUgZmlyc3QsIHRoZW4gcmUtb3BlbiB0aGlzIHBhZ2UuJywgJ3dhcm5pbmcnKTtcbiAgICAgIH1cbiAgICB9LCA1MDApO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTMuMjogSU1BR0UgUElDS0VSIFx1MjAxNCBSZXVzYWJsZSBzZWxlY3Rpb24gbW9kYWxcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gcmVuZGVySW1hZ2VQaWNrZXIob3B0aW9ucykge1xuICAgIGlmICghZ2V0SW1hZ2VzKSBfaW1wb3J0SW1hZ2VIZWxwZXJzKCk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG1vZGUgPSBvcHRpb25zLm1vZGUgfHwgJ211bHRpJzsgLy8gJ3NpbmdsZScgb3IgJ211bHRpJ1xuICAgIHZhciBzZWxlY3RlZElkcyA9IG9wdGlvbnMuc2VsZWN0ZWRJZHMgfHwgW107XG4gICAgdmFyIGZpbHRlckNhdGVnb3J5ID0gb3B0aW9ucy5jYXRlZ29yeSB8fCAnJztcbiAgICB2YXIgaW1ncyA9IGdldEltYWdlcyh7IGNhdGVnb3J5OiBmaWx0ZXJDYXRlZ29yeSB9KTtcbiAgICB2YXIgY2F0cyA9IChTLm1ldGEgJiYgUy5tZXRhLmltYWdlX2NhdGVnb3JpZXMpIHx8IFtdO1xuXG4gICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctcGlja2VyXCI+JztcbiAgICAvLyBGaWx0ZXIgcm93XG4gICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctcGlja2VyLWZpbHRlcnNcIj4nO1xuICAgIGh0bWwgKz0gJzxzZWxlY3QgY2xhc3M9XCJzY3Atc2VsZWN0IHNjcC1zZWxlY3Qtc20gc2NwLWltZy1waWNrZXItY2F0XCI+JztcbiAgICBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiXCI+QWxsPC9vcHRpb24+JztcbiAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgY2F0cy5sZW5ndGg7IGNpKyspIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgZXNjKGNhdHNbY2ldLmlkKSArICdcIicgKyAoZmlsdGVyQ2F0ZWdvcnkgPT09IGNhdHNbY2ldLmlkID8gJyBzZWxlY3RlZCcgOiAnJykgKyAnPicgKyBlc2MoY2F0c1tjaV0ubGFiZWwpICsgJzwvb3B0aW9uPic7XG4gICAgaHRtbCArPSAnPC9zZWxlY3Q+JztcbiAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cInNjcC10ZXh0LXhzIHNjcC10ZXh0LW11dGVkXCI+JyArIGltZ3MubGVuZ3RoICsgJyBpbWFnZScgKyAoaW1ncy5sZW5ndGggIT09IDEgPyAncycgOiAnJykgKyAnPC9zcGFuPic7XG4gICAgaHRtbCArPSAnPC9kaXY+JztcblxuICAgIGlmIChpbWdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1lbXB0eS1zdGF0ZSBzY3AtZW1wdHktc3RhdGUtLWNvbXBhY3RcIj48cD5ObyBpbWFnZXMgYXZhaWxhYmxlLiBVcGxvYWQgcmVmZXJlbmNlIGltYWdlcyBmaXJzdC48L3A+PC9kaXY+JztcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1pbWctcGlja2VyLWdyaWRcIj4nO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpbWcgPSBpbWdzW2ldOyB2YXIgaXNDaGVja2VkID0gc2VsZWN0ZWRJZHMuaW5kZXhPZihpbWcuZmlkKSA+IC0xO1xuICAgICAgICBodG1sICs9ICc8bGFiZWwgY2xhc3M9XCJzY3AtaW1nLXBpY2tlci1pdGVtJyArIChpc0NoZWNrZWQgPyAnIHNjcC1pbWctcGlja2VyLWl0ZW0tc2VsZWN0ZWQnIDogJycpICsgJ1wiPic7XG4gICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJyArIChtb2RlID09PSAnc2luZ2xlJyA/ICdyYWRpbycgOiAnY2hlY2tib3gnKSArICdcIiBuYW1lPVwic2NwX2ltZ19waWNrXCIgY2xhc3M9XCJzY3AtaW1nLXBpY2tlci1jaGVja1wiIGRhdGEtZmlkPVwiJyArIGVzYyhpbWcuZmlkKSArICdcIicgKyAoaXNDaGVja2VkID8gJyBjaGVja2VkJyA6ICcnKSArICc+JztcbiAgICAgICAgaHRtbCArPSAnPGltZyBzcmM9XCInICsgZXNjKGltZy51cmwpICsgJ1wiIGFsdD1cIicgKyBlc2MoaW1nLmZpbGVuYW1lKSArICdcIiBsb2FkaW5nPVwibGF6eVwiPic7XG4gICAgICAgIGlmIChpbWcuc3RhcikgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJzY3AtaW1nLXBpY2tlci1zdGFyXCI+XHUyNjA1PC9zcGFuPic7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwic2NwLWltZy1waWNrZXItbGFiZWxcIj4nICsgZXNjKHRydW5jYXRlKGltZy5maWxlbmFtZSwgMTYpKSArICc8L3NwYW4+JztcbiAgICAgICAgaHRtbCArPSAnPC9sYWJlbD4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG4gICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wZW5JbWFnZVBpY2tlck1vZGFsKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGNvbnRlbnQgPSByZW5kZXJJbWFnZVBpY2tlcihvcHRpb25zKTtcbiAgICBvcGVuTW9kYWwoJ1NlbGVjdCBSZWZlcmVuY2UgSW1hZ2VzJywgY29udGVudCwge1xuICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgIHNhdmVMYWJlbDogJ1NlbGVjdCcsXG4gICAgICBvblNhdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWQgPSBbXTtcbiAgICAgICAgJCgnLnNjcC1pbWctcGlja2VyLWNoZWNrOmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uKCkgeyBzZWxlY3RlZC5wdXNoKCQodGhpcykuZGF0YSgnZmlkJykpOyB9KTtcbiAgICAgICAgY2xvc2VNb2RhbCgpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKHNlbGVjdGVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBDYXRlZ29yeSBmaWx0ZXIgaW5zaWRlIG1vZGFsXG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwLWltZ3BpY2stY2F0JywgJy5zY3AtaW1nLXBpY2tlci1jYXQnKS5vbignY2hhbmdlLnNjcC1pbWdwaWNrLWNhdCcsICcuc2NwLWltZy1waWNrZXItY2F0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2F0ID0gJCh0aGlzKS52YWwoKTtcbiAgICAgIHZhciBuZXdDb250ZW50ID0gcmVuZGVySW1hZ2VQaWNrZXIoeyBtb2RlOiBvcHRpb25zLm1vZGUsIHNlbGVjdGVkSWRzOiBvcHRpb25zLnNlbGVjdGVkSWRzLCBjYXRlZ29yeTogY2F0IH0pO1xuICAgICAgJCgnLnNjcC1tb2RhbC1ib2R5JykuaHRtbChuZXdDb250ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIC0tLSBJbWFnZXMgZXZlbnRzIC0tLVxuXG4gIGZ1bmN0aW9uIHNldHVwSW1hZ2VzRXZlbnRzKCkge1xuICAgIC8vIGhhbmRsZWQgYnkgZ2xvYmFsIGV2ZW50cyBpbiBzZXR1cFBhcnQyQkV2ZW50c1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTMuNTogQUkgU1RBVFVTIElORElDQVRPUiArIFRFU1QgQ09OTkVDVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiB1cGRhdGVBSVN0YXR1c0luZGljYXRvcigpIHtcbiAgICB2YXIgJGVsID0gJCgnI3NjcEFJU3RhdHVzJyk7XG4gICAgaWYgKCEkZWwubGVuZ3RoKSByZXR1cm47XG4gICAgaWYgKExMTVNlcnZpY2UuaXNDb25maWd1cmVkKCkpIHtcbiAgICAgIHZhciBkZWYgPSBMTE1TZXJ2aWNlLmdldERlZmF1bHQoKTtcbiAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgLy8gRmluZCBwcm92aWRlciBsYWJlbFxuICAgICAgICB2YXIgcHJvdnMgPSBMTE1TZXJ2aWNlLmdldEFjdGl2ZVByb3ZpZGVycygpO1xuICAgICAgICB2YXIgcHJvdkxhYmVsID0gZGVmLnByb3ZpZGVyO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHByb3ZzW2ldLmlkID09PSBkZWYucHJvdmlkZXIpIHsgcHJvdkxhYmVsID0gcHJvdnNbaV0ubGFiZWw7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRmluZCBtb2RlbCBsYWJlbFxuICAgICAgICB2YXIgbW9kZWxMYWJlbCA9IGRlZi5tb2RlbDtcbiAgICAgICAgdmFyIG1vZGVscyA9IExMTVNlcnZpY2UuZ2V0QWN0aXZlTW9kZWxzKGRlZi5wcm92aWRlcik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbW9kZWxzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKG1vZGVsc1tqXS5pZCA9PT0gZGVmLm1vZGVsKSB7IG1vZGVsTGFiZWwgPSBtb2RlbHNbal0ubGFiZWwgfHwgbW9kZWxzW2pdLmlkOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBkaXNwbGF5VGV4dCA9IHByb3ZMYWJlbCArICcgLyAnICsgbW9kZWxMYWJlbDtcbiAgICAgICAgaWYgKGRpc3BsYXlUZXh0Lmxlbmd0aCA+IDM1KSBkaXNwbGF5VGV4dCA9IGRpc3BsYXlUZXh0LnN1YnN0cmluZygwLCAzMikgKyAnXHUyMDI2JztcbiAgICAgICAgJGVsLmh0bWwoJzxzcGFuIGNsYXNzPVwic2NwLWFpLXN0YXR1cy1kb3Qgc2NwLWFpLXN0YXR1cy1va1wiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjcC1haS1zdGF0dXMtbGFiZWxcIj4nICsgZXNjKGRpc3BsYXlUZXh0KSArICc8L3NwYW4+Jyk7XG4gICAgICAgICRlbC5hdHRyKCd0aXRsZScsICdBSTogJyArIHByb3ZMYWJlbCArICcgLyAnICsgbW9kZWxMYWJlbCArICcgXHUyMDE0IGNsaWNrIHRvIGNoYW5nZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGVsLmh0bWwoJzxzcGFuIGNsYXNzPVwic2NwLWFpLXN0YXR1cy1kb3Qgc2NwLWFpLXN0YXR1cy1va1wiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjcC1haS1zdGF0dXMtbGFiZWxcIj5BSSBSZWFkeTwvc3Bhbj4nKTtcbiAgICAgICAgJGVsLmF0dHIoJ3RpdGxlJywgJ0FJIGFjdGl2ZSBcdTIwMTQgY2xpY2sgdG8gY29uZmlndXJlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICRlbC5odG1sKCc8c3BhbiBjbGFzcz1cInNjcC1haS1zdGF0dXMtZG90IHNjcC1haS1zdGF0dXMtb2ZmXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NwLWFpLXN0YXR1cy1sYWJlbFwiPk5vIEFJPC9zcGFuPicpO1xuICAgICAgJGVsLmF0dHIoJ3RpdGxlJywgJ0FJIG5vdCBjb25maWd1cmVkIFx1MjAxNCBjbGljayBmb3Igc2V0dXAnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0ZXN0QUlDb25uZWN0aW9uKCkge1xuICAgIGlmICghTExNU2VydmljZS5pc0NvbmZpZ3VyZWQoKSkgeyB0b2FzdCgnTm8gQUkgcHJvdmlkZXJzIGNvbmZpZ3VyZWQuIEFkZCBwcm92aWRlcnMgaW4geW91ciB1c2VyIHByb2ZpbGUgXHUyMTkyIExMTSBDb25maWcgZmllbGQuJywgJ3dhcm5pbmcnKTsgcmV0dXJuOyB9XG4gICAgdG9hc3QoJ1Rlc3RpbmcgQUkgY29ubmVjdGlvbi4uLicsICdpbmZvJyk7XG4gICAgdmFyICRidG4gPSAkKCdbZGF0YS1hY3Rpb249XCJ0ZXN0LWFpLWNvbm5lY3Rpb25cIl0nKTtcbiAgICAkYnRuLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkuaHRtbChpY29uKCdzcGlubmVyJykgKyAnIFRlc3RpbmcuLi4nKTtcbiAgICBMTE1TZXJ2aWNlLmNhbGxBSSgnUmVzcG9uZCB3aXRoIGV4YWN0bHk6IHtcInN0YXR1c1wiOlwib2tcIixcIm1lc3NhZ2VcIjpcIkNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFwifScsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICRidG4ucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSkuaHRtbChpY29uKCdib2x0JykgKyAnIFRlc3QgQ29ubmVjdGlvbicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlSlNPTih0ZXh0KTtcbiAgICAgICAgaWYgKHBhcnNlZC5zdGF0dXMgPT09ICdvaycpIHtcbiAgICAgICAgICB0b2FzdCgnQUkgY29ubmVjdGlvbiBzdWNjZXNzZnVsIScsICdzdWNjZXNzJyk7XG4gICAgICAgICAgJGJ0bi5hZnRlcignPHNwYW4gY2xhc3M9XCJzY3AtYWktdGVzdC1yZXN1bHQgc2NwLWFpLXRlc3Qtb2tcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OnZhcigtLXNjcC1zcGFjZS0yKVwiPicgKyBpY29uKCdjaXJjbGUtY2hlY2snKSArICcgQ29ubmVjdGVkPC9zcGFuPicpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoJy5zY3AtYWktdGVzdC1yZXN1bHQnKS5mYWRlT3V0KDQwMCwgZnVuY3Rpb24oKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pOyB9LCA0MDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2FzdCgnQUkgcmVzcG9uZGVkIGJ1dCBmb3JtYXQgdW5leHBlY3RlZDogJyArIHRleHQuc3Vic3RyaW5nKDAsIDEwMCksICd3YXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAvLyBFdmVuIGlmIG5vdCB2YWxpZCBKU09OLCB0aGUgQUkgcmVzcG9uZGVkIFx1MjAxNCBjb25uZWN0aW9uIHdvcmtzXG4gICAgICAgIHRvYXN0KCdBSSBjb25uZWN0aW9uIHdvcmtzISAoUmVzcG9uc2U6ICcgKyB0ZXh0LnN1YnN0cmluZygwLCA2MCkgKyAnKScsICdzdWNjZXNzJyk7XG4gICAgICAgICRidG4uYWZ0ZXIoJzxzcGFuIGNsYXNzPVwic2NwLWFpLXRlc3QtcmVzdWx0IHNjcC1haS10ZXN0LW9rXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDp2YXIoLS1zY3Atc3BhY2UtMilcIj4nICsgaWNvbignY2lyY2xlLWNoZWNrJykgKyAnIENvbm5lY3RlZDwvc3Bhbj4nKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgJCgnLnNjcC1haS10ZXN0LXJlc3VsdCcpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHsgJCh0aGlzKS5yZW1vdmUoKTsgfSk7IH0sIDQwMDApO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgJGJ0bi5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKS5odG1sKGljb24oJ2JvbHQnKSArICcgVGVzdCBDb25uZWN0aW9uJyk7XG4gICAgICB0b2FzdCgnQUkgY29ubmVjdGlvbiBmYWlsZWQ6ICcgKyBlcnIsICdlcnJvcicpO1xuICAgICAgJGJ0bi5hZnRlcignPHNwYW4gY2xhc3M9XCJzY3AtYWktdGVzdC1yZXN1bHQgc2NwLWFpLXRlc3QtZmFpbFwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6dmFyKC0tc2NwLXNwYWNlLTIpXCI+JyArIGljb24oJ2NpcmNsZS14bWFyaycpICsgJyBGYWlsZWQ8L3NwYW4+Jyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyAkKCcuc2NwLWFpLXRlc3QtcmVzdWx0JykuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnJlbW92ZSgpOyB9KTsgfSwgNjAwMCk7XG4gICAgfSwgJ3Rlc3QtY29ubmVjdGlvbicpO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFNFQ1RJT04gMTQ6IEVWRU5UUyAmIEtFWUJPQVJEIFNIT1JUQ1VUU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBzZXR1cFBhcnQyQkV2ZW50cygpIHtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLXN0YWInLCAnW2RhdGEtYWN0aW9uPVwic2V0dGluZ3MtdGFiXCJdJykub24oJ2NsaWNrLnNjcDJiLXN0YWInLCAnW2RhdGEtYWN0aW9uPVwic2V0dGluZ3MtdGFiXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMuc2V0dGluZ3NUYWIgPSAkKHRoaXMpLmRhdGEoJ3RhYicpOyByZW5kZXIoKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1zcycsICdbZGF0YS1hY3Rpb249XCJzYXZlLXNldHRpbmdzXCJdJykub24oJ2NsaWNrLnNjcDJiLXNzJywgJ1tkYXRhLWFjdGlvbj1cInNhdmUtc2V0dGluZ3NcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2F2ZUFsbFNldHRpbmdzKCk7IH0pO1xuICAgIC8vIEFJIHBpY2tlciBkeW5hbWljIG1vZGVsIHVwZGF0ZVxuICAgICQoZG9jdW1lbnQpLm9mZignY2hhbmdlLnNjcDJiLWFpcCcsICcuc2NwLWFpLXByb3ZpZGVyLXNlbGVjdCcpLm9uKCdjaGFuZ2Uuc2NwMmItYWlwJywgJy5zY3AtYWktcHJvdmlkZXItc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0aW9uSWQgPSAkKHRoaXMpLmRhdGEoJ2FjdGlvbi1pZCcpOyB2YXIgcGlkID0gJCh0aGlzKS52YWwoKTtcbiAgICAgIHZhciBtb2RlbHMgPSBMTE1TZXJ2aWNlLmdldEFjdGl2ZU1vZGVscyhwaWQpO1xuICAgICAgdmFyICRtb2RTZWwgPSAkKCcuc2NwLWFpLW1vZGVsLXNlbGVjdFtkYXRhLWFjdGlvbi1pZD1cIicgKyBhY3Rpb25JZCArICdcIl0nKS5lbXB0eSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlbHMubGVuZ3RoOyBpKyspICRtb2RTZWwuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGVzYyhtb2RlbHNbaV0uaWQpICsgJ1wiIGRhdGEtdGVtcD1cIicgKyAobW9kZWxzW2ldLnRlbXBlcmF0dXJlICE9PSB1bmRlZmluZWQgPyBtb2RlbHNbaV0udGVtcGVyYXR1cmUgOiAxLjApICsgJ1wiIGRhdGEtdG9rZW5zPVwiJyArIChtb2RlbHNbaV0ubWF4X3Rva2VucyB8fCA4MTkyKSArICdcIj4nICsgZXNjKG1vZGVsc1tpXS5sYWJlbCkgKyAnPC9vcHRpb24+Jyk7XG4gICAgfSk7XG4gICAgLy8gQ29uZmlnIENSVURcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWFjJywgJ1tkYXRhLWFjdGlvbj1cImFkZC1jb25maWdcIl0nKS5vbignY2xpY2suc2NwMmItYWMnLCAnW2RhdGEtYWN0aW9uPVwiYWRkLWNvbmZpZ1wiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBhZGRDb25maWdJdGVtKCQodGhpcykuZGF0YSgndHlwZScpKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1lYycsICdbZGF0YS1hY3Rpb249XCJlZGl0LWNvbmZpZ1wiXScpLm9uKCdjbGljay5zY3AyYi1lYycsICdbZGF0YS1hY3Rpb249XCJlZGl0LWNvbmZpZ1wiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBlZGl0Q29uZmlnSXRlbSgkKHRoaXMpLmRhdGEoJ3R5cGUnKSwgcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdpbmRleCcpLCAxMCkpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWRjJywgJ1tkYXRhLWFjdGlvbj1cImRlbGV0ZS1jb25maWdcIl0nKS5vbignY2xpY2suc2NwMmItZGMnLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWNvbmZpZ1wiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBkZWxldGVDb25maWdJdGVtKCQodGhpcykuZGF0YSgndHlwZScpLCBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKSk7IH0pO1xuICAgIC8vIENsZWFyIGFjdGlvbiBwcmVmXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1jYXAnLCAnW2RhdGEtYWN0aW9uPVwiY2xlYXItYWN0aW9uLXByZWZcIl0nKS5vbignY2xpY2suc2NwMmItY2FwJywgJ1tkYXRhLWFjdGlvbj1cImNsZWFyLWFjdGlvbi1wcmVmXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyB2YXIga2V5ID0gJCh0aGlzKS5kYXRhKCdhY3Rpb24ta2V5Jyk7XG4gICAgICBpZiAoa2V5ICYmIFMubWV0YS5haVByZWZlcmVuY2VzICYmIFMubWV0YS5haVByZWZlcmVuY2VzLnBlckFjdGlvbikgeyBkZWxldGUgUy5tZXRhLmFpUHJlZmVyZW5jZXMucGVyQWN0aW9uW2tleV07IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpOyB9XG4gICAgfSk7XG4gICAgLy8gSW1wb3J0L2V4cG9ydFxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItZXhwJywgJ1tkYXRhLWFjdGlvbj1cImV4cG9ydC1qc29uXCJdJykub24oJ2NsaWNrLnNjcDJiLWV4cCcsICdbZGF0YS1hY3Rpb249XCJleHBvcnQtanNvblwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBleHBvcnRKU09OKCdjb21iaW5lZCcpOyB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWltcCcsICdbZGF0YS1hY3Rpb249XCJpbXBvcnQtanNvblwiXScpLm9uKCdjbGljay5zY3AyYi1pbXAnLCAnW2RhdGEtYWN0aW9uPVwiaW1wb3J0LWpzb25cIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgaW1wb3J0SlNPTigpOyB9KTtcbiAgICAvLyBUZXN0IEFJIGNvbm5lY3Rpb25cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLXRhYycsICdbZGF0YS1hY3Rpb249XCJ0ZXN0LWFpLWNvbm5lY3Rpb25cIl0nKS5vbignY2xpY2suc2NwMmItdGFjJywgJ1tkYXRhLWFjdGlvbj1cInRlc3QtYWktY29ubmVjdGlvblwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB0ZXN0QUlDb25uZWN0aW9uKCk7IH0pO1xuXG4gICAgLy8gLS0tIFBoYXNlIDM6IFJlLXNjYW4gQUkgY29uZmlnIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcmFjJywgJ1tkYXRhLWFjdGlvbj1cInJlc2Nhbi1haS1jb25maWdcIl0nKS5vbignY2xpY2suc2NwMmItcmFjJywgJ1tkYXRhLWFjdGlvbj1cInJlc2Nhbi1haS1jb25maWdcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJGJ0biA9ICQodGhpcyk7XG4gICAgICAkYnRuLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkuaHRtbChpY29uKCdzcGlubmVyJykgKyAnIFNjYW5uaW5nLi4uJyk7XG4gICAgICAvLyBTbWFsbCBkZWxheSBzbyB1c2VyIHNlZXMgdGhlIHNwaW5uZXJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IExMTVNlcnZpY2UucmVzY2FuQ29uZmlnKCk7XG4gICAgICAgICRidG4ucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSkuaHRtbChpY29uKCdyZWZyZXNoJykgKyAnIFJlLXNjYW4gUGFnZScpO1xuICAgICAgICB1cGRhdGVBSVN0YXR1c0luZGljYXRvcigpO1xuICAgICAgICAvLyBSZXBsYWNlIGFueSBsb2FkaW5nIHBsYWNlaG9sZGVyc1xuICAgICAgICAkKCcuc2NwLWFpLXBpY2tlci1sb2FkaW5nJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgYWN0aW9uSWQgPSAkKHRoaXMpLmRhdGEoJ3BlbmRpbmctYWN0aW9uJyk7XG4gICAgICAgICAgaWYgKGFjdGlvbklkKSAkKHRoaXMpLnJlcGxhY2VXaXRoKExMTVNlcnZpY2UucmVuZGVySW5saW5lUGlja2VyKGFjdGlvbklkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICB0b2FzdCgnQUkgY29uZmlnIGZvdW5kISAnICsgTExNU2VydmljZS5nZXRQcm92aWRlckNvdW50KCkgKyAnIHByb3ZpZGVyKHMpIGRldGVjdGVkLicsICdzdWNjZXNzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9hc3QoJ05vIEFJIGNvbmZpZyBmb3VuZCBvbiBwYWdlLiBDaGVjayB5b3VyIERydXBhbCBWaWV3cyBzZXR1cC4nLCAnd2FybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgfSwgMzAwKTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBQaGFzZSAzOiBQZXItcHJvdmlkZXIgdGVzdCAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLXRwJywgJ1tkYXRhLWFjdGlvbj1cInRlc3QtcHJvdmlkZXJcIl0nKS5vbignY2xpY2suc2NwMmItdHAnLCAnW2RhdGEtYWN0aW9uPVwidGVzdC1wcm92aWRlclwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBwaWQgPSAkKHRoaXMpLmRhdGEoJ3Byb3ZpZGVyJyk7XG4gICAgICB2YXIgJGJ0biA9ICQodGhpcyk7XG4gICAgICAkYnRuLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSkuaHRtbChpY29uKCdzcGlubmVyJykgKyAnIFRlc3RpbmcuLi4nKTtcbiAgICAgIC8vIFJlbW92ZSBwcmV2aW91cyByZXN1bHQgYmFkZ2VzXG4gICAgICAkYnRuLmNsb3Nlc3QoJy5zY3AtYWktcHJvdmlkZXItY2FyZC1hY3Rpb25zJykuZmluZCgnLnNjcC1haS10ZXN0LXJlc3VsdCcpLnJlbW92ZSgpO1xuICAgICAgTExNU2VydmljZS50ZXN0UHJvdmlkZXIocGlkLCBmdW5jdGlvbihvaywgbXNnLCBlbGFwc2VkKSB7XG4gICAgICAgICRidG4ucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSkuaHRtbChpY29uKCdib2x0JykgKyAnIFRlc3QnKTtcbiAgICAgICAgdmFyIHJlc3VsdENsYXNzID0gb2sgPyAnc2NwLWFpLXRlc3Qtb2snIDogJ3NjcC1haS10ZXN0LWZhaWwnO1xuICAgICAgICB2YXIgcmVzdWx0SWNvbiA9IG9rID8gJ2NpcmNsZS1jaGVjaycgOiAnY2lyY2xlLXhtYXJrJztcbiAgICAgICAgJGJ0bi5hZnRlcignPHNwYW4gY2xhc3M9XCJzY3AtYWktdGVzdC1yZXN1bHQgJyArIHJlc3VsdENsYXNzICsgJ1wiPicgKyBpY29uKHJlc3VsdEljb24pICsgJyAnICsgZXNjKG1zZykgKyAnPC9zcGFuPicpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyAkYnRuLmNsb3Nlc3QoJy5zY3AtYWktcHJvdmlkZXItY2FyZC1hY3Rpb25zJykuZmluZCgnLnNjcC1haS10ZXN0LXJlc3VsdCcpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHsgJCh0aGlzKS5yZW1vdmUoKTsgfSk7IH0sIDUwMDApO1xuICAgICAgICBpZiAob2spIHRvYXN0KExMTVNlcnZpY2UuZ2V0UHJvdmlkZXJJbmZvKHBpZCkubGFiZWwgKyAnIGNvbm5lY3RlZCAoJyArIGVsYXBzZWQgKyAnbXMpJywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgZWxzZSB0b2FzdChMTE1TZXJ2aWNlLmdldFByb3ZpZGVySW5mbyhwaWQpLmxhYmVsICsgJyBmYWlsZWQ6ICcgKyBtc2csICdlcnJvcicpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyAtLS0gUGhhc2UgMzogU2V0IGRlZmF1bHQgcHJvdmlkZXIgZnJvbSBjYXJkIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItc2RwJywgJ1tkYXRhLWFjdGlvbj1cInNldC1kZWZhdWx0LXByb3ZpZGVyXCJdJykub24oJ2NsaWNrLnNjcDJiLXNkcCcsICdbZGF0YS1hY3Rpb249XCJzZXQtZGVmYXVsdC1wcm92aWRlclwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBwaWQgPSAkKHRoaXMpLmRhdGEoJ3Byb3ZpZGVyJyk7XG4gICAgICB2YXIgcEluZm8gPSBMTE1TZXJ2aWNlLmdldFByb3ZpZGVySW5mbyhwaWQpO1xuICAgICAgaWYgKCFwSW5mbyB8fCAhcEluZm8ubW9kZWxzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgLy8gUGljayB0aGUgZmlyc3QgbW9kZWwgKG9yIHRoZSBvbmUgbWFya2VkIGRlZmF1bHQpXG4gICAgICB2YXIgZGVmTW9kZWwgPSBwSW5mby5tb2RlbHNbMF07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBJbmZvLm1vZGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocEluZm8ubW9kZWxzW2ldLmlzX2RlZmF1bHQpIHsgZGVmTW9kZWwgPSBwSW5mby5tb2RlbHNbaV07IGJyZWFrOyB9XG4gICAgICB9XG4gICAgICBTLm1ldGEuYWlQcmVmZXJlbmNlcyA9IFMubWV0YS5haVByZWZlcmVuY2VzIHx8IHt9O1xuICAgICAgUy5tZXRhLmFpUHJlZmVyZW5jZXMuYXBwRGVmYXVsdCA9IHsgcHJvdmlkZXI6IHBpZCwgbW9kZWw6IGRlZk1vZGVsLmlkIH07XG4gICAgICBzeW5jVG9UZXh0YXJlYSgpOyB1cGRhdGVBSVN0YXR1c0luZGljYXRvcigpOyByZW5kZXIoKTtcbiAgICAgIHRvYXN0KCdEZWZhdWx0IHNldCB0byAnICsgcEluZm8ubGFiZWwgKyAnIC8gJyArIGRlZk1vZGVsLmxhYmVsLCAnc3VjY2VzcycpO1xuICAgIH0pO1xuXG4gICAgLy8gLS0tIFBoYXNlIDM6IENsZWFyIGFsbCBhY3Rpb24gb3ZlcnJpZGVzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItY2FhcCcsICdbZGF0YS1hY3Rpb249XCJjbGVhci1hbGwtYWN0aW9uLXByZWZzXCJdJykub24oJ2NsaWNrLnNjcDJiLWNhYXAnLCAnW2RhdGEtYWN0aW9uPVwiY2xlYXItYWxsLWFjdGlvbi1wcmVmc1wiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICghY29uZmlybSgnQ2xlYXIgYWxsIHBlci1hY3Rpb24gQUkgb3ZlcnJpZGVzPyBBbGwgYWN0aW9ucyB3aWxsIHVzZSB0aGUgZGVmYXVsdCBwcm92aWRlci4nKSkgcmV0dXJuO1xuICAgICAgUy5tZXRhLmFpUHJlZmVyZW5jZXMgPSBTLm1ldGEuYWlQcmVmZXJlbmNlcyB8fCB7fTtcbiAgICAgIFMubWV0YS5haVByZWZlcmVuY2VzLnBlckFjdGlvbiA9IHt9O1xuICAgICAgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gICAgICB0b2FzdCgnQWxsIG92ZXJyaWRlcyBjbGVhcmVkJywgJ3N1Y2Nlc3MnKTtcbiAgICB9KTtcblxuICAgIC8vIC0tLSBQaGFzZSAzOiBIZWFkZXIgQUkgcXVpY2stc3dpdGNoIGRyb3Bkb3duIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItYXNpJywgJyNzY3BBSVN0YXR1cycpLm9uKCdjbGljay5zY3AyYi1hc2knLCAnI3NjcEFJU3RhdHVzJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdmFyICRkcm9wZG93biA9ICQoJyNzY3BBSVF1aWNrU3dpdGNoJyk7XG4gICAgICBpZiAoJGRyb3Bkb3duLmlzKCc6dmlzaWJsZScpKSB7ICRkcm9wZG93bi5oaWRlKCk7IHJldHVybjsgfVxuICAgICAgLy8gQnVpbGQgZHJvcGRvd24gY29udGVudFxuICAgICAgaWYgKCFMTE1TZXJ2aWNlLmlzQ29uZmlndXJlZCgpKSB7XG4gICAgICAgIFMuc2V0dGluZ3NUYWIgPSAnYWknOyBuYXZpZ2F0ZSgnc2V0dGluZ3MnKTsgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHByb3ZzID0gTExNU2VydmljZS5nZXRBY3RpdmVQcm92aWRlcnMoKTtcbiAgICAgIHZhciBkZWYgPSBMTE1TZXJ2aWNlLmdldERlZmF1bHQoKTtcbiAgICAgIHZhciBkZEh0bWwgPSAnPGRpdiBjbGFzcz1cInNjcC1haS1kcm9wZG93bi1oZWFkZXJcIj4nICsgaWNvbignc3BhcmtsZXMnKSArICcgUXVpY2sgU3dpdGNoIEFJPC9kaXY+JztcbiAgICAgIGZvciAodmFyIHBpID0gMDsgcGkgPCBwcm92cy5sZW5ndGg7IHBpKyspIHtcbiAgICAgICAgdmFyIHByb3YgPSBwcm92c1twaV07XG4gICAgICAgIHZhciBwSW5mbyA9IExMTVNlcnZpY2UuZ2V0UHJvdmlkZXJJbmZvKHByb3YuaWQpO1xuICAgICAgICBpZiAoIXBJbmZvKSBjb250aW51ZTtcbiAgICAgICAgZGRIdG1sICs9ICc8ZGl2IGNsYXNzPVwic2NwLWFpLWRyb3Bkb3duLXByb3ZpZGVyXCI+JyArIGVzYyhwSW5mby5sYWJlbCkgKyAnPC9kaXY+JztcbiAgICAgICAgZm9yICh2YXIgbWkgPSAwOyBtaSA8IHBJbmZvLm1vZGVscy5sZW5ndGg7IG1pKyspIHtcbiAgICAgICAgICB2YXIgbW9kZWwgPSBwSW5mby5tb2RlbHNbbWldO1xuICAgICAgICAgIHZhciBpc0FjdGl2ZSA9IGRlZiAmJiBkZWYucHJvdmlkZXIgPT09IHByb3YuaWQgJiYgZGVmLm1vZGVsID09PSBtb2RlbC5pZDtcbiAgICAgICAgICBkZEh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJzY3AtYWktZHJvcGRvd24tbW9kZWwnICsgKGlzQWN0aXZlID8gJyBzY3AtYWktZHJvcGRvd24tbW9kZWwtYWN0aXZlJyA6ICcnKSArICdcIiBkYXRhLWFjdGlvbj1cInF1aWNrLXN3aXRjaC1haVwiIGRhdGEtcHJvdmlkZXI9XCInICsgZXNjKHByb3YuaWQpICsgJ1wiIGRhdGEtbW9kZWw9XCInICsgZXNjKG1vZGVsLmlkKSArICdcIj4nO1xuICAgICAgICAgIGRkSHRtbCArPSAnPHNwYW4+JyArIGVzYyhtb2RlbC5sYWJlbCkgKyAnPC9zcGFuPic7XG4gICAgICAgICAgaWYgKGlzQWN0aXZlKSBkZEh0bWwgKz0gaWNvbignY2hlY2snKTtcbiAgICAgICAgICBkZEh0bWwgKz0gJzwvYnV0dG9uPic7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRkSHRtbCArPSAnPGRpdiBjbGFzcz1cInNjcC1haS1kcm9wZG93bi1mb290ZXJcIj48YSBocmVmPVwiI1wiIGRhdGEtYWN0aW9uPVwiYWktZHJvcGRvd24tc2V0dGluZ3NcIj4nICsgaWNvbignZ2VhcicpICsgJyBBSSBTZXR0aW5nczwvYT48L2Rpdj4nO1xuICAgICAgJGRyb3Bkb3duLmh0bWwoZGRIdG1sKS5zaG93KCk7XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSBkcm9wZG93biBvbiBvdXRzaWRlIGNsaWNrXG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1kZGNsb3NlJykub24oJ2NsaWNrLnNjcDJiLWRkY2xvc2UnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJyNzY3BBSVF1aWNrU3dpdGNoLCAjc2NwQUlTdGF0dXMnKS5sZW5ndGgpIHtcbiAgICAgICAgJCgnI3NjcEFJUXVpY2tTd2l0Y2gnKS5oaWRlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBRdWljayBzd2l0Y2ggbW9kZWwgZnJvbSBkcm9wZG93blxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcXNhJywgJ1tkYXRhLWFjdGlvbj1cInF1aWNrLXN3aXRjaC1haVwiXScpLm9uKCdjbGljay5zY3AyYi1xc2EnLCAnW2RhdGEtYWN0aW9uPVwicXVpY2stc3dpdGNoLWFpXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyIHBpZCA9ICQodGhpcykuZGF0YSgncHJvdmlkZXInKTtcbiAgICAgIHZhciBtaWQgPSAkKHRoaXMpLmRhdGEoJ21vZGVsJyk7XG4gICAgICBTLm1ldGEuYWlQcmVmZXJlbmNlcyA9IFMubWV0YS5haVByZWZlcmVuY2VzIHx8IHt9O1xuICAgICAgUy5tZXRhLmFpUHJlZmVyZW5jZXMuYXBwRGVmYXVsdCA9IHsgcHJvdmlkZXI6IHBpZCwgbW9kZWw6IG1pZCB9O1xuICAgICAgc3luY1RvVGV4dGFyZWEoKTsgdXBkYXRlQUlTdGF0dXNJbmRpY2F0b3IoKTtcbiAgICAgICQoJyNzY3BBSVF1aWNrU3dpdGNoJykuaGlkZSgpO1xuICAgICAgdmFyIHBJbmZvID0gTExNU2VydmljZS5nZXRQcm92aWRlckluZm8ocGlkKTtcbiAgICAgIHZhciBtb2RlbExhYmVsID0gbWlkO1xuICAgICAgaWYgKHBJbmZvKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcEluZm8ubW9kZWxzLmxlbmd0aDsgaSsrKSB7IGlmIChwSW5mby5tb2RlbHNbaV0uaWQgPT09IG1pZCkgeyBtb2RlbExhYmVsID0gcEluZm8ubW9kZWxzW2ldLmxhYmVsOyBicmVhazsgfSB9IH1cbiAgICAgIHRvYXN0KCdTd2l0Y2hlZCB0byAnICsgKHBJbmZvID8gcEluZm8ubGFiZWwgOiBwaWQpICsgJyAvICcgKyBtb2RlbExhYmVsLCAnc3VjY2VzcycpO1xuICAgIH0pO1xuXG4gICAgLy8gRHJvcGRvd24gc2V0dGluZ3MgbGlua1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItZGRzJywgJ1tkYXRhLWFjdGlvbj1cImFpLWRyb3Bkb3duLXNldHRpbmdzXCJdJykub24oJ2NsaWNrLnNjcDJiLWRkcycsICdbZGF0YS1hY3Rpb249XCJhaS1kcm9wZG93bi1zZXR0aW5nc1wiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgJCgnI3NjcEFJUXVpY2tTd2l0Y2gnKS5oaWRlKCk7IFMuc2V0dGluZ3NUYWIgPSAnYWknOyBuYXZpZ2F0ZSgnc2V0dGluZ3MnKTtcbiAgICB9KTtcbiAgICAvLyBBSSBjb25maWcgbGluayAoZnJvbSBcIm5vdCBjb25maWd1cmVkXCIgbWVzc2FnZSBpbiBpbmxpbmUgcGlja2VycylcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWFjbCcsICcuc2NwLWFpLWNvbmZpZy1saW5rJykub24oJ2NsaWNrLnNjcDJiLWFjbCcsICcuc2NwLWFpLWNvbmZpZy1saW5rJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IFMuc2V0dGluZ3NUYWIgPSAnYWknOyBuYXZpZ2F0ZSgnc2V0dGluZ3MnKTsgfSk7XG4gICAgLy8gUmVzZWFyY2ggbW9kZSB0b2dnbGVcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLXJtJywgJ1tkYXRhLWFjdGlvbj1cInJlc2VhcmNoLW1vZGVcIl0nKS5vbignY2xpY2suc2NwMmItcm0nLCAnW2RhdGEtYWN0aW9uPVwicmVzZWFyY2gtbW9kZVwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBTLl9yZXNlYXJjaE1vZGUgPSAkKHRoaXMpLmRhdGEoJ21vZGUnKTsgcmVuZGVyKCk7IH0pO1xuICAgIC8vIFJ1biByZXNlYXJjaFxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcnFyJywgJ1tkYXRhLWFjdGlvbj1cInJ1bi1xdWljay1yZXNlYXJjaFwiXScpLm9uKCdjbGljay5zY3AyYi1ycXInLCAnW2RhdGEtYWN0aW9uPVwicnVuLXF1aWNrLXJlc2VhcmNoXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IHJ1blF1aWNrUmVzZWFyY2goKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1yYXInLCAnW2RhdGEtYWN0aW9uPVwicnVuLWFkdmFuY2VkLXJlc2VhcmNoXCJdJykub24oJ2NsaWNrLnNjcDJiLXJhcicsICdbZGF0YS1hY3Rpb249XCJydW4tYWR2YW5jZWQtcmVzZWFyY2hcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgcnVuQWR2YW5jZWRSZXNlYXJjaCgpOyB9KTtcbiAgICAvLyBQcm9tb3RlIGlkZWEgZnJvbSByZXNlYXJjaFxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcGknLCAnW2RhdGEtYWN0aW9uPVwicHJvbW90ZS1pZGVhXCJdJykub24oJ2NsaWNrLnNjcDJiLXBpJywgJ1tkYXRhLWFjdGlvbj1cInByb21vdGUtaWRlYVwiXScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBwcm9tb3RlUmVzZWFyY2hJZGVhKCQodGhpcykuZGF0YSgnc2Vzc2lvbicpLCAkKHRoaXMpLmRhdGEoJ2lkZWEnKSk7IH0pO1xuICAgIC8vIFJhdGUgaWRlYVxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcmknLCAnW2RhdGEtYWN0aW9uPVwicmF0ZS1pZGVhXCJdJykub24oJ2NsaWNrLnNjcDJiLXJpJywgJ1tkYXRhLWFjdGlvbj1cInJhdGUtaWRlYVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIHNlc0lkID0gJCh0aGlzKS5kYXRhKCdzZXNzaW9uJyk7IHZhciBpZGVhSWQgPSAkKHRoaXMpLmRhdGEoJ2lkZWEnKTsgdmFyIHJhdGluZyA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgncmF0aW5nJyksIDEwKTtcbiAgICAgIHZhciBzZXNzaW9uID0gUy5yZXNlYXJjaE1hcFtzZXNJZF07IGlmICghc2Vzc2lvbikgcmV0dXJuO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAoc2Vzc2lvbi5yZXN1bHRzIHx8IFtdKS5sZW5ndGg7IGkrKykgeyBpZiAoc2Vzc2lvbi5yZXN1bHRzW2ldLmlkID09PSBpZGVhSWQpIHsgc2Vzc2lvbi5yZXN1bHRzW2ldLnJhdGluZyA9IHJhdGluZzsgYnJlYWs7IH0gfVxuICAgICAgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gICAgfSk7XG4gICAgLy8gRGVsZXRlIHJlc2VhcmNoIHNlc3Npb25cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWRycycsICdbZGF0YS1hY3Rpb249XCJkZWxldGUtcmVzZWFyY2gtc2Vzc2lvblwiXScpLm9uKCdjbGljay5zY3AyYi1kcnMnLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLXJlc2VhcmNoLXNlc3Npb25cIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgc2VzSWQgPSAkKHRoaXMpLmRhdGEoJ3Nlc3Npb24taWQnKTtcbiAgICAgIHZhciBzZXNzaW9uID0gUy5yZXNlYXJjaE1hcFtzZXNJZF07IGlmICghc2Vzc2lvbikgcmV0dXJuO1xuICAgICAgdmFyIGlkZWFDb3VudCA9IChzZXNzaW9uLnJlc3VsdHMgfHwgW10pLmxlbmd0aDtcbiAgICAgIG9wZW5Db25maXJtRGlhbG9nKHtcbiAgICAgICAgdGl0bGU6ICdEZWxldGUgUmVzZWFyY2ggU2Vzc2lvbicsXG4gICAgICAgIG1lc3NhZ2U6ICdEZWxldGUgXCInICsgKHNlc3Npb24udG9waWMgfHwgc2Vzc2lvbi50aXRsZSB8fCAnUmVzZWFyY2ggU2Vzc2lvbicpICsgJ1wiIHdpdGggJyArIGlkZWFDb3VudCArICcgaWRlYScgKyAoaWRlYUNvdW50ICE9PSAxID8gJ3MnIDogJycpICsgJz8gVGhpcyBjYW5ub3QgYmUgdW5kb25lLicsXG4gICAgICAgIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZScsIGRhbmdlcjogdHJ1ZSxcbiAgICAgICAgb25Db25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBTLmRhdGEucmVzZWFyY2ggPSBTLmRhdGEucmVzZWFyY2ggfHwgeyBzZXNzaW9uczogW10gfTtcbiAgICAgICAgICBTLmRhdGEucmVzZWFyY2guc2Vzc2lvbnMgPSBTLmRhdGEucmVzZWFyY2guc2Vzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuaWQgIT09IHNlc0lkOyB9KTtcbiAgICAgICAgICBsb2dBY3Rpdml0eSgncmVzZWFyY2hfY3JlYXRlZCcsICcnLCAnJywgJ0RlbGV0ZWQgcmVzZWFyY2ggc2Vzc2lvbjogJyArIChzZXNzaW9uLnRvcGljIHx8IHNlc3Npb24udGl0bGUgfHwgc2VzSWQpKTtcbiAgICAgICAgICBzbmFwc2hvdCgnRGVsZXRlIHJlc2VhcmNoIHNlc3Npb24nKTsgYnVpbGRNYXBzKCk7IHJlbmRlcigpOyBzeW5jVG9UZXh0YXJlYSgpO1xuICAgICAgICAgIHRvYXN0KCdSZXNlYXJjaCBzZXNzaW9uIGRlbGV0ZWQnLCAnc3VjY2VzcycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICAvLyBSZW5hbWUgcmVzZWFyY2ggc2Vzc2lvblxuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcnJzJywgJ1tkYXRhLWFjdGlvbj1cInJlbmFtZS1yZXNlYXJjaC1zZXNzaW9uXCJdJykub24oJ2NsaWNrLnNjcDJiLXJycycsICdbZGF0YS1hY3Rpb249XCJyZW5hbWUtcmVzZWFyY2gtc2Vzc2lvblwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBzZXNJZCA9ICQodGhpcykuZGF0YSgnc2Vzc2lvbi1pZCcpO1xuICAgICAgdmFyIHNlc3Npb24gPSBTLnJlc2VhcmNoTWFwW3Nlc0lkXTsgaWYgKCFzZXNzaW9uKSByZXR1cm47XG4gICAgICB2YXIgY3VycmVudE5hbWUgPSBzZXNzaW9uLnRvcGljIHx8IHNlc3Npb24udGl0bGUgfHwgJyc7XG4gICAgICB2YXIgbmV3TmFtZSA9IHByb21wdCgnUmVuYW1lIHNlc3Npb246JywgY3VycmVudE5hbWUpO1xuICAgICAgaWYgKG5ld05hbWUgIT09IG51bGwgJiYgbmV3TmFtZS50cmltKCkpIHtcbiAgICAgICAgc2Vzc2lvbi50b3BpYyA9IG5ld05hbWUudHJpbSgpO1xuICAgICAgICBzZXNzaW9uLnRpdGxlID0gbmV3TmFtZS50cmltKCk7XG4gICAgICAgIHNlc3Npb24udXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgc25hcHNob3QoJ1JlbmFtZSByZXNlYXJjaCBzZXNzaW9uJyk7IHN5bmNUb1RleHRhcmVhKCk7IHJlbmRlcigpO1xuICAgICAgICB0b2FzdCgnU2Vzc2lvbiByZW5hbWVkJywgJ3N1Y2Nlc3MnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBBZHZhbmNlZCByZXNlYXJjaCB0ZW1wbGF0ZSBjaGFuZ2VcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NoYW5nZS5zY3AyYi1ydCcsICcjc2NwUmVzZWFyY2hUZW1wbGF0ZScpLm9uKCdjaGFuZ2Uuc2NwMmItcnQnLCAnI3NjcFJlc2VhcmNoVGVtcGxhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZUlkID0gJCh0aGlzKS52YWwoKTtcbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSAoUy5tZXRhLnNldHRpbmdzICYmIFMubWV0YS5zZXR0aW5ncy5yZXNlYXJjaF90ZW1wbGF0ZXMpIHx8IFtdO1xuICAgICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVzLmZpbmQoZnVuY3Rpb24odCkgeyByZXR1cm4gdC5pZCA9PT0gdGVtcGxhdGVJZDsgfSk7XG4gICAgICB2YXIgJHZhcnMgPSAkKCcjc2NwVGVtcGxhdGVWYXJzJykuZW1wdHkoKTtcbiAgICAgIGlmICh0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS52YXJpYWJsZXMpIHtcbiAgICAgICAgdGVtcGxhdGUudmFyaWFibGVzLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICAgICR2YXJzLmFwcGVuZCgnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPicgKyB2LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdi5zbGljZSgxKS5yZXBsYWNlKC9fL2csICcgJykgKyAnPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGlkPVwic2NwVmFyXycgKyB2ICsgJ1wiIHBsYWNlaG9sZGVyPVwiRW50ZXIgJyArIHYgKyAnLi4uXCI+PC9kaXY+Jyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFJlc2VhcmNoIHRlbXBsYXRlIENSVURcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWFydCcsICdbZGF0YS1hY3Rpb249XCJhZGQtcmVzZWFyY2gtdGVtcGxhdGVcIl0nKS5vbignY2xpY2suc2NwMmItYXJ0JywgJ1tkYXRhLWFjdGlvbj1cImFkZC1yZXNlYXJjaC10ZW1wbGF0ZVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBmaWVsZHMgPSAnPGRpdiBjbGFzcz1cInNjcC1lZGl0b3ItZm9ybVwiPjxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5OYW1lPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJuYW1lXCI+PC9kaXY+JztcbiAgICAgIGZpZWxkcyArPSAnPGRpdiBjbGFzcz1cInNjcC1mb3JtLWdyb3VwXCI+PGxhYmVsPkRlc2NyaXB0aW9uPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJkZXNjcmlwdGlvblwiPjwvZGl2Pic7XG4gICAgICBmaWVsZHMgKz0gJzxkaXYgY2xhc3M9XCJzY3AtZm9ybS1ncm91cFwiPjxsYWJlbD5Qcm9tcHQgVGVtcGxhdGU8L2xhYmVsPjx0ZXh0YXJlYSBjbGFzcz1cInNjcC10ZXh0YXJlYVwiIGRhdGEtZmllbGQ9XCJwcm9tcHRcIiByb3dzPVwiNlwiIHBsYWNlaG9sZGVyPVwiVXNlIHt2YXJpYWJsZV9uYW1lfSBmb3IgdGVtcGxhdGUgdmFyaWFibGVzLi4uXCI+PC90ZXh0YXJlYT48L2Rpdj4nO1xuICAgICAgZmllbGRzICs9ICc8ZGl2IGNsYXNzPVwic2NwLWZvcm0tZ3JvdXBcIj48bGFiZWw+VmFyaWFibGVzIChjb21tYS1zZXBhcmF0ZWQpPC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNjcC1pbnB1dFwiIGRhdGEtZmllbGQ9XCJ2YXJpYWJsZXNcIiBwbGFjZWhvbGRlcj1cInRvcGljLCBjb3VudCwgYXVkaWVuY2UsIHRvbmVcIj48L2Rpdj48L2Rpdj4nO1xuICAgICAgb3Blbk1vZGFsKCdOZXcgUmVzZWFyY2ggVGVtcGxhdGUnLCBmaWVsZHMsIHsgc2l6ZTogJ2xnJywgb25TYXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGQgPSBjb2xsZWN0TW9kYWxGaWVsZHMoKTsgaWYgKCFkLm5hbWUpIHsgdG9hc3QoJ05hbWUgcmVxdWlyZWQnLCAnd2FybmluZycpOyByZXR1cm47IH1cbiAgICAgICAgdmFyIHRtcGwgPSB7IGlkOiBnZW5lcmF0ZUlkKCdydCcpLCBuYW1lOiBkLm5hbWUudHJpbSgpLCBkZXNjcmlwdGlvbjogZC5kZXNjcmlwdGlvbiB8fCAnJywgcHJvbXB0OiBkLnByb21wdCB8fCAnJywgdmFyaWFibGVzOiAoZC52YXJpYWJsZXMgfHwgJycpLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYudHJpbSgpOyB9KS5maWx0ZXIoQm9vbGVhbikgfTtcbiAgICAgICAgUy5tZXRhLnNldHRpbmdzLnJlc2VhcmNoX3RlbXBsYXRlcyA9IFMubWV0YS5zZXR0aW5ncy5yZXNlYXJjaF90ZW1wbGF0ZXMgfHwgW107XG4gICAgICAgIFMubWV0YS5zZXR0aW5ncy5yZXNlYXJjaF90ZW1wbGF0ZXMucHVzaCh0bXBsKTtcbiAgICAgICAgc25hcHNob3QoJ0FkZCB0ZW1wbGF0ZScpOyBjbG9zZU1vZGFsKCk7IHJlbmRlcigpOyBzeW5jVG9UZXh0YXJlYSgpOyB0b2FzdCgnVGVtcGxhdGUgY3JlYXRlZCcsICdzdWNjZXNzJyk7XG4gICAgICB9fSk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1kcnQnLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLXJlc2VhcmNoLXRlbXBsYXRlXCJdJykub24oJ2NsaWNrLnNjcDJiLWRydCcsICdbZGF0YS1hY3Rpb249XCJkZWxldGUtcmVzZWFyY2gtdGVtcGxhdGVcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciBpZHggPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2luZGV4JyksIDEwKTtcbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSBTLm1ldGEuc2V0dGluZ3MucmVzZWFyY2hfdGVtcGxhdGVzIHx8IFtdO1xuICAgICAgaWYgKHRlbXBsYXRlc1tpZHhdKSB7XG4gICAgICAgIG9wZW5Db25maXJtRGlhbG9nKHsgdGl0bGU6ICdEZWxldGUgVGVtcGxhdGUnLCBtZXNzYWdlOiAnRGVsZXRlIFwiJyArIHRlbXBsYXRlc1tpZHhdLm5hbWUgKyAnXCI/JywgY29uZmlybUxhYmVsOiAnRGVsZXRlJywgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgIG9uQ29uZmlybTogZnVuY3Rpb24oKSB7IHRlbXBsYXRlcy5zcGxpY2UoaWR4LCAxKTsgc25hcHNob3QoJ0RlbGV0ZSB0ZW1wbGF0ZScpOyByZW5kZXIoKTsgc3luY1RvVGV4dGFyZWEoKTsgdG9hc3QoJ0RlbGV0ZWQnLCAnc3VjY2VzcycpOyB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIC0tLSBCcmFuZCBkZXNpZ24gZXZlbnRzIC0tLVxuICAgICQoZG9jdW1lbnQpLm9mZignaW5wdXQuc2NwMmItYmRjJywgJy5zY3AtYnJhbmQtZGVzaWduLWNvbG9yJykub24oJ2lucHV0LnNjcDJiLWJkYycsICcuc2NwLWJyYW5kLWRlc2lnbi1jb2xvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGggPSAkKHRoaXMpLmRhdGEoJ2JkLXBhdGgnKTsgdmFyIHZhbCA9ICQodGhpcykudmFsKCk7XG4gICAgICAvLyBTeW5jIGNvbG9yIHBpY2tlciBcdTIxOTIgdGV4dCBpbnB1dFxuICAgICAgJCh0aGlzKS5zaWJsaW5ncygnLnNjcC1icmFuZC1kZXNpZ24tZmllbGRbZGF0YS1iZC1wYXRoPVwiJyArIHBhdGggKyAnXCJdJykudmFsKHZhbCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdibHVyLnNjcDJiLWJkZicsICdpbnB1dC5zY3AtYnJhbmQtZGVzaWduLWZpZWxkW2RhdGEtYmQtcGF0aCo9XCJjb2xvcnMuXCJdJykub24oJ2JsdXIuc2NwMmItYmRmJywgJ2lucHV0LnNjcC1icmFuZC1kZXNpZ24tZmllbGRbZGF0YS1iZC1wYXRoKj1cImNvbG9ycy5cIl0nLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXRoID0gJCh0aGlzKS5kYXRhKCdiZC1wYXRoJyk7IHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgLy8gU3luYyB0ZXh0IGlucHV0IFx1MjE5MiBjb2xvciBwaWNrZXIgKGlmIHZhbGlkIGhleClcbiAgICAgIGlmICgvXiNbMC05YS1mQS1GXXs2fSQvLnRlc3QodmFsKSkgJCh0aGlzKS5zaWJsaW5ncygnLnNjcC1icmFuZC1kZXNpZ24tY29sb3JbZGF0YS1iZC1wYXRoPVwiJyArIHBhdGggKyAnXCJdJykudmFsKHZhbCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1hYnInLCAnW2RhdGEtYWN0aW9uPVwiYWRkLWJyYW5kLXJlZlwiXScpLm9uKCdjbGljay5zY3AyYi1hYnInLCAnW2RhdGEtYWN0aW9uPVwiYWRkLWJyYW5kLXJlZlwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIHJvbGUgPSAkKHRoaXMpLmRhdGEoJ3JvbGUnKTtcbiAgICAgIHZhciBjdXJyZW50SWRzID0gKFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24gJiYgUy5tZXRhLnNldHRpbmdzLmJyYW5kX2Rlc2lnbi5yZWZlcmVuY2VfaW1hZ2VfaWRzICYmIFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24ucmVmZXJlbmNlX2ltYWdlX2lkc1tyb2xlXSkgfHwgW107XG4gICAgICBvcGVuSW1hZ2VQaWNrZXJNb2RhbCh7IG1vZGU6ICdtdWx0aScsIHNlbGVjdGVkSWRzOiBjdXJyZW50SWRzIH0sIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XG4gICAgICAgIFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24gPSBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduIHx8IHt9O1xuICAgICAgICBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduLnJlZmVyZW5jZV9pbWFnZV9pZHMgPSBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduLnJlZmVyZW5jZV9pbWFnZV9pZHMgfHwge307XG4gICAgICAgIFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24ucmVmZXJlbmNlX2ltYWdlX2lkc1tyb2xlXSA9IHNlbGVjdGVkO1xuICAgICAgICBzeW5jVG9UZXh0YXJlYSgpOyByZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItcmJyJywgJ1tkYXRhLWFjdGlvbj1cInJlbW92ZS1icmFuZC1yZWZcIl0nKS5vbignY2xpY2suc2NwMmItcmJyJywgJ1tkYXRhLWFjdGlvbj1cInJlbW92ZS1icmFuZC1yZWZcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IHZhciByb2xlID0gJCh0aGlzKS5kYXRhKCdyb2xlJyk7IHZhciBmaWQgPSAkKHRoaXMpLmRhdGEoJ2ZpZCcpO1xuICAgICAgaWYgKFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24gJiYgUy5tZXRhLnNldHRpbmdzLmJyYW5kX2Rlc2lnbi5yZWZlcmVuY2VfaW1hZ2VfaWRzICYmIFMubWV0YS5zZXR0aW5ncy5icmFuZF9kZXNpZ24ucmVmZXJlbmNlX2ltYWdlX2lkc1tyb2xlXSkge1xuICAgICAgICBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduLnJlZmVyZW5jZV9pbWFnZV9pZHNbcm9sZV0gPSBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduLnJlZmVyZW5jZV9pbWFnZV9pZHNbcm9sZV0uZmlsdGVyKGZ1bmN0aW9uKGlkKSB7IHJldHVybiBpZCAhPT0gZmlkOyB9KTtcbiAgICAgICAgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1yZ3AnLCAnW2RhdGEtYWN0aW9uPVwicmVnZW5lcmF0ZS1icmFuZC1wcmVmaXhcIl0nKS5vbignY2xpY2suc2NwMmItcmdwJywgJ1tkYXRhLWFjdGlvbj1cInJlZ2VuZXJhdGUtYnJhbmQtcHJlZml4XCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gU2F2ZSBjdXJyZW50IGZpZWxkcyBmaXJzdFxuICAgICAgc2F2ZUFsbFNldHRpbmdzKCk7XG4gICAgICB2YXIgYmQgPSBTLm1ldGEuc2V0dGluZ3MuYnJhbmRfZGVzaWduIHx8IHt9O1xuICAgICAgYmQuYnJhbmRfcHJvbXB0X3ByZWZpeCA9ICcnOyAvLyBDbGVhciBjdXN0b20gdG8gZm9yY2UgYXV0by1nZW5lcmF0ZVxuICAgICAgUy5tZXRhLnNldHRpbmdzLmJyYW5kX2Rlc2lnbiA9IGJkO1xuICAgICAgc3luY1RvVGV4dGFyZWEoKTsgcmVuZGVyKCk7IHRvYXN0KCdCcmFuZCBwcmVmaXggcmVnZW5lcmF0ZWQgZnJvbSBmaWVsZHMnLCAnc3VjY2VzcycpO1xuICAgIH0pO1xuICAgIC8vIC0tLSBJbWFnZSBnYWxsZXJ5IGV2ZW50cyAtLS1cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLXVpJywgJ1tkYXRhLWFjdGlvbj1cInVwbG9hZC1pbWFnZVwiXScpLm9uKCdjbGljay5zY3AyYi11aScsICdbZGF0YS1hY3Rpb249XCJ1cGxvYWQtaW1hZ2VcIl0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgdHJpZ2dlckltYWdlVXBsb2FkKCk7IH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItc2knLCAnW2RhdGEtYWN0aW9uPVwic2VsZWN0LWltYWdlXCJdJykub24oJ2NsaWNrLnNjcDJiLXNpJywgJ1tkYXRhLWFjdGlvbj1cInNlbGVjdC1pbWFnZVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgdmFyIGZpZCA9ICQodGhpcykuZGF0YSgnZmlkJyk7XG4gICAgICBTLnNlbGVjdGVkSW1hZ2VJZCA9IChTLnNlbGVjdGVkSW1hZ2VJZCA9PT0gZmlkKSA/IG51bGwgOiBmaWQ7IHJlbmRlcigpO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItY2lkJywgJ1tkYXRhLWFjdGlvbj1cImNsb3NlLWltYWdlLWRldGFpbFwiXScpLm9uKCdjbGljay5zY3AyYi1jaWQnLCAnW2RhdGEtYWN0aW9uPVwiY2xvc2UtaW1hZ2UtZGV0YWlsXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdzY3AtaW1nLWRldGFpbC1iYWNrZHJvcCcpIHx8ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cImNsb3NlLWltYWdlLWRldGFpbFwiXScpLmlzKCcuc2NwLWJ0bi1pY29uJykpIHsgUy5zZWxlY3RlZEltYWdlSWQgPSBudWxsOyByZW5kZXIoKTsgfVxuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItdGlzJywgJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1pbWFnZS1zdGFyXCJdJykub24oJ2NsaWNrLnNjcDJiLXRpcycsICdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtaW1hZ2Utc3RhclwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgZS5zdG9wUHJvcGFnYXRpb24oKTsgdG9nZ2xlSW1hZ2VTdGFyKCQodGhpcykuZGF0YSgnZmlkJykpOyByZW5kZXIoKTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2JsdXIuc2NwMmItaW1mJywgJy5zY3AtaW1nLW1ldGEtZmllbGQnKS5vbignYmx1ci5zY3AyYi1pbWYnLCAnLnNjcC1pbWctbWV0YS1maWVsZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZpZCA9ICQodGhpcykuZGF0YSgnZmlkJyk7IHZhciBmaWVsZCA9ICQodGhpcykuZGF0YSgnZmllbGQnKTsgdmFyIHZhbCA9ICQodGhpcykudmFsKCk7XG4gICAgICBpZiAoZmlkICYmIGZpZWxkKSBzYXZlSW1hZ2VNZXRhKGZpZCwgZmllbGQsIHZhbCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwMmItaW1mYycsICdzZWxlY3Quc2NwLWltZy1tZXRhLWZpZWxkJykub24oJ2NoYW5nZS5zY3AyYi1pbWZjJywgJ3NlbGVjdC5zY3AtaW1nLW1ldGEtZmllbGQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmaWQgPSAkKHRoaXMpLmRhdGEoJ2ZpZCcpOyB2YXIgZmllbGQgPSAkKHRoaXMpLmRhdGEoJ2ZpZWxkJyk7IHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgaWYgKGZpZCAmJiBmaWVsZCkgeyBzYXZlSW1hZ2VNZXRhKGZpZCwgZmllbGQsIHZhbCk7IHJlbmRlcigpOyB9XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1kaW0nLCAnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWltYWdlLW1ldGFcIl0nKS5vbignY2xpY2suc2NwMmItZGltJywgJ1tkYXRhLWFjdGlvbj1cImRlbGV0ZS1pbWFnZS1tZXRhXCJdJywgZnVuY3Rpb24oZSkgeyBlLnByZXZlbnREZWZhdWx0KCk7IGRlbGV0ZUltYWdlTWV0YSgkKHRoaXMpLmRhdGEoJ2ZpZCcpKTsgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5zY3AyYi1jaXUnLCAnW2RhdGEtYWN0aW9uPVwiY29weS1pbWFnZS11cmxcIl0nKS5vbignY2xpY2suc2NwMmItY2l1JywgJ1tkYXRhLWFjdGlvbj1cImNvcHktaW1hZ2UtdXJsXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCgkKHRoaXMpLmRhdGEoJ3VybCcpKS50aGVuKGZ1bmN0aW9uKCkgeyB0b2FzdCgnVVJMIGNvcGllZCEnLCAnc3VjY2VzcycpOyB9KTtcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLnNjcDJiLWl2bScsICdbZGF0YS1hY3Rpb249XCJpbWFnZS12aWV3LW1vZGVcIl0nKS5vbignY2xpY2suc2NwMmItaXZtJywgJ1tkYXRhLWFjdGlvbj1cImltYWdlLXZpZXctbW9kZVwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgUy5pbWFnZVZpZXdNb2RlID0gJCh0aGlzKS5kYXRhKCdtb2RlJyk7IHJlbmRlcigpO1xuICAgIH0pO1xuICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suc2NwMmItdGlzZicsICdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtaW1nLXN0YXItZmlsdGVyXCJdJykub24oJ2NsaWNrLnNjcDJiLXRpc2YnLCAnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLWltZy1zdGFyLWZpbHRlclwiXScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgUy5pbWFnZUZpbHRlci5zdGFyID0gIVMuaW1hZ2VGaWx0ZXIuc3RhcjsgcmVuZGVyKCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdjaGFuZ2Uuc2NwMmItaW1nZicsICcuc2NwLWltZy1maWx0ZXInKS5vbignY2hhbmdlLnNjcDJiLWltZ2YnLCAnLnNjcC1pbWctZmlsdGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmlsdGVyID0gJCh0aGlzKS5kYXRhKCdmaWx0ZXInKTsgUy5pbWFnZUZpbHRlcltmaWx0ZXJdID0gJCh0aGlzKS52YWwoKTsgcmVuZGVyKCk7XG4gICAgfSk7XG4gICAgJChkb2N1bWVudCkub2ZmKCdpbnB1dC5zY3AyYi1pbWdzJywgJy5zY3AtaW1nLXNlYXJjaCcpLm9uKCdpbnB1dC5zY3AyYi1pbWdzJywgJy5zY3AtaW1nLXNlYXJjaCcsIHdpbmRvdy5fc2NwRGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgICBTLmltYWdlRmlsdGVyLnNlYXJjaCA9ICQodGhpcykudmFsKCk7IHJlbmRlcigpO1xuICAgIH0sIDMwMCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0dXBSZXNlYXJjaEV2ZW50cygpIHtcbiAgICAvLyBUZW1wbGF0ZSB2YXJpYWJsZSBsb2FkaW5nIG9uIGZpcnN0IHJlbmRlclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoJyNzY3BSZXNlYXJjaFRlbXBsYXRlJykudHJpZ2dlcignY2hhbmdlJyk7IH0sIDEwMCk7XG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBTZXR0aW5nc0V2ZW50cygpIHsgLyogSGFuZGxlZCBieSBnbG9iYWwgZXZlbnRzICovIH1cblxuICBmdW5jdGlvbiBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCkge1xuICAgICQoZG9jdW1lbnQpLm9mZigna2V5ZG93bi5zY3AyYi1zaycpLm9uKCdrZXlkb3duLnNjcDJiLXNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKSkgcmV0dXJuO1xuICAgICAgaWYgKGUua2V5ID09PSAnMScpIG5hdmlnYXRlKCdkYXNoYm9hcmQnKTtcbiAgICAgIGlmIChlLmtleSA9PT0gJzInKSBuYXZpZ2F0ZSgncmVzZWFyY2gnKTtcbiAgICAgIGlmIChlLmtleSA9PT0gJzMnKSBuYXZpZ2F0ZSgndG9waWNzJyk7XG4gICAgICBpZiAoZS5rZXkgPT09ICc0JykgbmF2aWdhdGUoJ3NlcmllcycpO1xuICAgICAgaWYgKGUua2V5ID09PSAnNScpIG5hdmlnYXRlKCdwb3N0cycpO1xuICAgICAgaWYgKGUua2V5ID09PSAnNicpIG5hdmlnYXRlKCdjYWxlbmRhcicpO1xuICAgICAgaWYgKGUua2V5ID09PSAnNycpIG5hdmlnYXRlKCdpbWFnZXMnKTtcbiAgICAgIGlmIChlLmtleSA9PT0gJzgnKSBuYXZpZ2F0ZSgnYWN0aXZpdHknKTtcbiAgICAgIGlmIChlLmtleSA9PT0gJzknKSBuYXZpZ2F0ZSgnc2V0dGluZ3MnKTtcbiAgICAgIGlmIChlLmtleSA9PT0gJy8nICYmIFMuY3VycmVudFZpZXcgPT09ICdwb3N0cycpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyAkKCcjc2NwUG9zdFNlYXJjaCcpLmZvY3VzKCk7IH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBTRUNUSU9OIDE1OiBBUEkgRVhQT1JUU1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvLyBFeHBvc2UgdXBkYXRlQUlTdGF0dXNJbmRpY2F0b3Igc28gdGhlIGV4dHJhY3RlZCBsbG0tc2VydmljZS5qcyBjYW5cbiAgLy8gY2FsbCBpdCB3aXRob3V0IHJlYWNoaW5nIGludG8gcGFydDJiJ3MgSUlGRSBjbG9zdXJlLlxuICB3aW5kb3cuX3NjcFVwZGF0ZUFJU3RhdHVzSW5kaWNhdG9yID0gdXBkYXRlQUlTdGF0dXNJbmRpY2F0b3I7XG5cbiAgd2luZG93Ll9zY3BQYXJ0MkIgPSB7XG4gICAgLy8gQUkgYWN0aW9ucyAoY2FsbGVkIGJ5IFBhcnQgMkEgZGVsZWdhdGVzKVxuICAgIGFpUmVzZWFyY2hBbmdsZXM6IGFpUmVzZWFyY2hBbmdsZXMsXG4gICAgYWlSZXNlYXJjaEhvb2tzOiBhaVJlc2VhcmNoSG9va3MsXG4gICAgYWlXcml0ZUNvbnRlbnQ6IGFpV3JpdGVDb250ZW50LFxuICAgIGFpSW1wcm92ZUNvbnRlbnQ6IGFpSW1wcm92ZUNvbnRlbnQsXG4gICAgYWlTdWdnZXN0U2xpZGVzOiBhaVN1Z2dlc3RTbGlkZXMsXG4gICAgYWlHZW5lcmF0ZVNjcmlwdDogYWlHZW5lcmF0ZVNjcmlwdCxcbiAgICBhaUdlbmVyYXRlTWVkaWFQcm9tcHQ6IGFpR2VuZXJhdGVNZWRpYVByb21wdCxcbiAgICBidWlsZFN0cnVjdHVyZWRQcm9tcHQ6IGJ1aWxkU3RydWN0dXJlZFByb21wdCxcbiAgICBhaUFkYXB0Rm9yUGxhdGZvcm06IGFpQWRhcHRGb3JQbGF0Zm9ybSxcbiAgICAvLyBQaGFzZSBCOiBWaXN1YWwgcGxhbiArIHN0cnVjdHVyZWQgc2NyaXB0XG4gICAgYWlHZW5lcmF0ZVZpc3VhbFBsYW46IGFpR2VuZXJhdGVWaXN1YWxQbGFuLFxuICAgIGFpR2VuZXJhdGVTdHJ1Y3R1cmVkU2NyaXB0OiBhaUdlbmVyYXRlU3RydWN0dXJlZFNjcmlwdCxcbiAgICAvLyBTZXJ2aWNlc1xuICAgIExMTVNlcnZpY2U6IExMTVNlcnZpY2UsXG4gICAgQnJhbmRTZXJ2aWNlOiBCcmFuZFNlcnZpY2UsXG4gICAgcmVuZGVySW5saW5lUGlja2VyOiBMTE1TZXJ2aWNlLnJlbmRlcklubGluZVBpY2tlci5iaW5kKExMTVNlcnZpY2UpLFxuICAgIGlzQUlDb25maWd1cmVkOiBMTE1TZXJ2aWNlLmlzQ29uZmlndXJlZC5iaW5kKExMTVNlcnZpY2UpLFxuICAgIC8vIFJlc2VhcmNoXG4gICAgcnVuUXVpY2tSZXNlYXJjaDogcnVuUXVpY2tSZXNlYXJjaCxcbiAgICBydW5BZHZhbmNlZFJlc2VhcmNoOiBydW5BZHZhbmNlZFJlc2VhcmNoLFxuICAgIC8vIFNldHRpbmdzICYgZGF0YVxuICAgIHNhdmVBbGxTZXR0aW5nczogc2F2ZUFsbFNldHRpbmdzLFxuICAgIGV4cG9ydEpTT046IGV4cG9ydEpTT04sXG4gICAgaW1wb3J0SlNPTjogaW1wb3J0SlNPTixcbiAgICAvLyBBSSBzdGF0dXNcbiAgICB1cGRhdGVBSVN0YXR1c0luZGljYXRvcjogdXBkYXRlQUlTdGF0dXNJbmRpY2F0b3IsXG4gICAgdGVzdEFJQ29ubmVjdGlvbjogdGVzdEFJQ29ubmVjdGlvbixcbiAgICAvLyBMTE1TZXJ2aWNlIFBoYXNlIDNcbiAgICByZXNjYW5BSUNvbmZpZzogZnVuY3Rpb24oKSB7IHJldHVybiBMTE1TZXJ2aWNlLnJlc2NhbkNvbmZpZygpOyB9LFxuICAgIHRlc3RQcm92aWRlcjogZnVuY3Rpb24ocGlkLCBjYikgeyBMTE1TZXJ2aWNlLnRlc3RQcm92aWRlcihwaWQsIGNiKTsgfSxcbiAgICAvLyBJbWFnZXNcbiAgICByZW5kZXJJbWFnZVBpY2tlcjogcmVuZGVySW1hZ2VQaWNrZXIsXG4gICAgb3BlbkltYWdlUGlja2VyTW9kYWw6IG9wZW5JbWFnZVBpY2tlck1vZGFsLFxuICAgIHNhdmVJbWFnZU1ldGE6IHNhdmVJbWFnZU1ldGEsXG4gICAgdG9nZ2xlSW1hZ2VTdGFyOiB0b2dnbGVJbWFnZVN0YXIsXG4gICAgcmVjb3JkSW1hZ2VVc2FnZTogcmVjb3JkSW1hZ2VVc2FnZSxcbiAgICB0cmlnZ2VySW1hZ2VVcGxvYWQ6IHRyaWdnZXJJbWFnZVVwbG9hZFxuICB9O1xuXG4gIGNvbnNvbGUubG9nKCdbU0NQXSBQ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WUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFVBQVU7QUFDdEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFFBQVE7QUFDcEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFFBQVE7QUFDcEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLE9BQU87QUFDbkMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFVBQVU7QUFDdEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFFBQVE7QUFDcEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFVBQVU7QUFDdEMsWUFBSSxFQUFFLFFBQVEsSUFBSyxVQUFTLFVBQVU7QUFDdEMsWUFBSSxFQUFFLFFBQVEsT0FBTyxFQUFFLGdCQUFnQixTQUFTO0FBQUUsWUFBRSxlQUFlO0FBQUcsWUFBRSxnQkFBZ0IsRUFBRSxNQUFNO0FBQUEsUUFBRztBQUFBLE1BQ3JHLENBQUM7QUFBQSxJQUNIO0FBUUEsV0FBTyw4QkFBOEI7QUFFckMsV0FBTyxhQUFhO0FBQUE7QUFBQSxNQUVsQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUVBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFFQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLG9CQUFvQixXQUFXLG1CQUFtQixLQUFLLFVBQVU7QUFBQSxNQUNqRSxnQkFBZ0IsV0FBVyxhQUFhLEtBQUssVUFBVTtBQUFBO0FBQUEsTUFFdkQ7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUVBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BRUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUVBLGdCQUFnQixXQUFXO0FBQUUsZUFBTyxXQUFXLGFBQWE7QUFBQSxNQUFHO0FBQUEsTUFDL0QsY0FBYyxTQUFTLEtBQUssSUFBSTtBQUFFLG1CQUFXLGFBQWEsS0FBSyxFQUFFO0FBQUEsTUFBRztBQUFBO0FBQUEsTUFFcEU7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFFQSxZQUFRLElBQUksc0JBQXNCO0FBQUEsRUFDcEMsR0FBRyxRQUFRLE1BQU07IiwKICAibmFtZXMiOiBbIkRydXBhbCIsICJEcnVwYWwiLCAiRHJ1cGFsIiwgInByb21wdCIsICJrIiwgIl9jaGVja0NvdW50Il0KfQo=
