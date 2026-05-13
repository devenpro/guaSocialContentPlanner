/**
 * Social Content Planner v1.0 - Part 2A: Pipeline Editor & CRUD
 *
 * Modals, undo/redo, post/topic CRUD, 6 pipeline step renderers,
 * social composer component, topic input, inline editing.
 *
 * Registry: step_basics, step_research, step_content, step_media,
 *   step_platforms, step_schedule, topicInput, socialComposer
 *
 * Sections:
 *  1. Init & imports
 *  2. Modal system
 *  3. Undo/redo
 *  4. Post & topic CRUD
 *  5. Step 1: Basics renderer
 *  6. Step 2: Research renderer (angles + hooks)
 *  7. Step 3: Content renderer (social composer + carousel + video)
 *  8. Step 4: Media prompts renderer
 *  9. Step 5: Platforms renderer
 * 10. Step 6: Schedule renderer
 * 11. Social composer component
 * 12. Topic input component
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
  var maybeAdvanceStatus, resolveTopic, resolveTone, resolveAudience, resolveImageStyle;
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
    resolveTopic = window._scpResolveTopic; resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience; resolveImageStyle = window._scpResolveImageStyle;
    getPlatformConfig = window._scpGetPlatformConfig; progressBar = window._scpProgressBar;
    cleanAIText = window._scpCleanAIText; formatContentForPreview = window._scpFormatContentForPreview;
    parsePromptSections = window._scpParsePromptSections;
    Constants = window._scpConstants;

    // AI picker helper — lazy evaluation (Part 2B may not be loaded yet)
    window._scpAiSel = function(actionId) {
      if (window._scpPart2B && window._scpPart2B.renderInlinePicker) {
        return window._scpPart2B.renderInlinePicker(actionId);
      }
      // Part 2B not ready yet — show loading placeholder that gets replaced later
      return '<span class="scp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon('spinner') + '</span>';
    };

    // Register step renderers
    var R = window._scpRenderers = window._scpRenderers || {};
    R.topicInput = renderTopicInput;
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

  function openNewTopicModal() {
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var html = '<div class="scp-editor-form">';
    html += '<div class="scp-form-group"><label>Topic Name</label><input type="text" class="scp-input" data-field="name" placeholder="e.g. Product Updates"></div>';
    html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" placeholder="What this topic represents..."></div>';
    html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button class="scp-color-swatch' + (ci === 0 ? ' scp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + colors[0] + '">';
    html += '</div></div></div>';
    openModal('New Topic', html, {
      saveLabel: 'Create Topic',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Topic name is required', 'warning'); return; }
        var topic = { id: generateId('topic'), name: fields.name.trim(), color: fields.color || colors[0], description: fields.description || '', seriesId: '', created: new Date().toISOString() };
        S.data.topics = S.data.topics || [];
        S.data.topics.push(topic);
        logActivity('topic_created', '', '', 'Created topic: ' + topic.name);
        snapshot('Create topic'); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Topic "' + topic.name + '" created', 'success');
      }
    });
  }

  function editTopicModal(topicId) {
    var topic = S.topicMap[topicId]; if (!topic) return;
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var html = '<div class="scp-editor-form">';
    html += '<div class="scp-form-group"><label>Topic Name</label><input type="text" class="scp-input" data-field="name" value="' + esc(topic.name) + '"></div>';
    html += '<div class="scp-form-group"><label>Description</label><input type="text" class="scp-input" data-field="description" value="' + esc(topic.description || '') + '"></div>';
    html += '<div class="scp-form-group"><label>Color</label><div class="scp-color-picker">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button class="scp-color-swatch' + (topic.color === colors[ci] ? ' scp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="background:' + colors[ci] + '"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + esc(topic.color) + '">';
    html += '</div></div></div>';
    openModal('Edit Topic', html, {
      saveLabel: 'Save',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Topic name is required', 'warning'); return; }
        topic.name = fields.name.trim(); topic.color = fields.color || topic.color; topic.description = fields.description || '';
        logActivity('topic_updated', '', '', 'Updated topic: ' + topic.name);
        snapshot('Edit topic'); buildMaps(); closeModal(); render(); syncToTextarea(); toast('Topic updated', 'success');
      }
    });
  }

  function deleteTopic(topicId) {
    var topic = S.topicMap[topicId]; if (!topic) return;
    openConfirmDialog({
      title: 'Delete Topic', message: 'Delete "' + topic.name + '"? Posts will lose this topic.', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        S.data.topics = (S.data.topics || []).filter(function(t) { return t.id !== topicId; });
        (S.data.posts || []).forEach(function(p) { p.topics = (p.topics || []).filter(function(t) { return t !== topicId; }); });
        if (S.selectedTopicId === topicId) S.selectedTopicId = null;
        logActivity('topic_deleted', '', '', 'Deleted topic: ' + topic.name);
        snapshot('Delete topic'); buildMaps(); render(); syncToTextarea(); toast('Topic deleted', 'success');
      }
    });
  }

  // ============================================================
  // SECTIONS 5-10: STEP RENDERERS — extracted (v0.3.0)
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
    html += '<div class="scp-composer-meta">' + esc(label) + ' • Draft</div></div></div>';
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

    // Body — Edit mode (default)
    html += '<div class="scp-composer-body scp-composer-edit-mode" data-composer-panel="edit-' + esc(id) + '">';
    html += '<textarea class="scp-composer-textarea" data-composer-id="' + esc(id) + '" placeholder="Write your ' + esc(label.toLowerCase()) + ' here...\n\nInclude hook, body, CTA, and hashtags — all in one place.">' + esc(content) + '</textarea>';
    html += '</div>';

    // Body — Preview mode (hidden by default)
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
  // SECTION 12: TOPIC INPUT COMPONENT
  // ============================================================

  function renderTopicInput(topicIds, postId) {
    var html = '<div class="scp-topic-input" data-post-id="' + esc(postId || '') + '">';
    html += '<div class="scp-topic-chips">';
    for (var i = 0; i < topicIds.length; i++) {
      var topic = resolveTopic(topicIds[i]);
      if (topic) {
        html += '<span class="scp-topic-input-chip" style="background:' + topic.color + '15;color:' + topic.color + ';border-color:' + topic.color + '30">';
        html += esc(topic.name) + ' <button class="scp-topic-remove" data-action="remove-post-topic" data-topic-id="' + esc(topic.id) + '" data-post-id="' + esc(postId) + '">&times;</button></span>';
      }
    }
    // Add topic dropdown
    var availTopics = (S.data.topics || []).filter(function(t) { return topicIds.indexOf(t.id) < 0; });
    if (availTopics.length > 0) {
      html += '<select class="scp-select scp-select-sm scp-topic-add-select" data-post-id="' + esc(postId) + '">';
      html += '<option value="">+ Add topic</option>';
      for (var ai = 0; ai < availTopics.length; ai++) html += '<option value="' + esc(availTopics[ai].id) + '">' + esc(availTopics[ai].name) + '</option>';
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

  // ─── OUTPUT SCHEMAS ───

  var OUTPUT_SCHEMAS = {
    image_visual_plan: {
      id: 'image_visual_plan', label: 'Visual Content Plan', icon: 'image',
      sections: [
        { key: 'visual_concept', label: 'Visual Concept', icon: 'eye', color: '#1a73e8', expanded: true, description: 'What the audience sees and feels',
          fields: [
            { key: 'scene', label: 'Scene / Subject', type: 'textarea', rows: 2, placeholder: 'Describe what the image shows…' },
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
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Spoken words…' },
            { key: 'visual', label: 'Visual / Shot', type: 'text', placeholder: 'What the viewer sees' },
            { key: 'on_screen_text', label: 'On-Screen Text', type: 'text', placeholder: 'Text overlay' },
            { key: 'duration_seconds', label: 'Duration', type: 'number', suffix: 's', placeholder: '3' },
            { key: 'analysis', label: 'Hook Analysis', type: 'textarea', rows: 2, placeholder: 'Why this opening works…', muted: true }
          ]
        },
        { key: 'body', label: 'Main Body', icon: 'pen-fancy', color: '#1a73e8', expanded: true, description: 'The core content sections', isList: true,
          fields: [
            { key: 'section', label: 'Section Name', type: 'text', placeholder: 'e.g. Problem, Solution, Proof' },
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Spoken words…' },
            { key: 'visual', label: 'Visual / Shot', type: 'text', placeholder: 'What the viewer sees' },
            { key: 'on_screen_text', label: 'On-Screen Text', type: 'text', placeholder: 'Text overlay' },
            { key: 'duration_seconds', label: 'Duration', type: 'number', suffix: 's', placeholder: '10' }
          ]
        },
        { key: 'outro', label: 'Outro & CTA', icon: 'rocket', color: '#0d904f', expanded: true, description: 'The closing and call to action',
          fields: [
            { key: 'voiceover', label: 'Voiceover', type: 'textarea', rows: 2, placeholder: 'Closing words…' },
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
            { key: 'scene', label: 'Scene / Subject', type: 'textarea', rows: 2, placeholder: 'What this slide shows…' },
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

  // ─── MAIN RENDERER ───

  /**
   * Renders a structured AI output as visual cards.
   *
   * @param {object} data — The parsed AI JSON data
   * @param {string} schemaId — Key into OUTPUT_SCHEMAS
   * @param {object} options — { outputId, postId, readOnly, onSave(path, value) }
   * @returns {string} HTML
   */
  function renderStructuredOutput(data, schemaId, options) {
    var schema = OUTPUT_SCHEMAS[schemaId];
    if (!schema || !data) return '<div class="scp-empty-state scp-empty-state--compact"><p>No structured data available.</p></div>';
    options = options || {};
    var oid = options.outputId || generateId('aio');
    var readOnly = !!options.readOnly;

    var html = '<div class="scp-aio" data-aio-id="' + esc(oid) + '" data-schema="' + esc(schemaId) + '" data-post-id="' + esc(options.postId || '') + '">';

    // ─── Export toolbar ───
    html += renderExportToolbar(data, schema, oid);

    // ─── Sequence mode (carousel: array of items, each with sections) ───
    if (schema.isSequence && Array.isArray(data)) {
      for (var si = 0; si < data.length; si++) {
        html += '<div class="scp-aio-sequence-item" data-seq-index="' + si + '">';
        html += '<div class="scp-aio-sequence-header">';
        html += '<span class="scp-aio-sequence-num">' + (si + 1) + '</span>';
        html += '<span class="scp-aio-sequence-label">' + esc(schema.sequenceLabel || 'Item') + ' ' + (si + 1) + '</span>';
        if (data[si].text_overlays && data[si].text_overlays.headline) html += '<span class="scp-text-sm scp-text-muted"> — ' + esc(truncate(data[si].text_overlays.headline, 40)) + '</span>';
        html += '</div>';
        html += renderSectionsForItem(data[si], schema.sections, oid + '_s' + si, readOnly);
        html += '</div>';
      }
    }
    // ─── Single item mode (image plan, video script) ───
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

      // ─── List sections (video body — array of sub-items) ───
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

      // ─── Standard section (object with fields) ───
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
          html += '<div class="scp-aio-field-value scp-aio-field-value-multi">' + (value ? esc(String(value)).replace(/\n/g, '<br>') : '<span class="scp-text-muted">—</span>') + '</div>';
        } else {
          html += '<div class="scp-aio-field-value">' + (value ? esc(String(value)) + (field.suffix ? ' ' + esc(field.suffix) : '') : '<span class="scp-text-muted">—</span>') + '</div>';
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

  // ─── EXPORT TOOLBAR ───

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

  // ─── EXPORT FORMATTERS ───

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

  // ─── INLINE DATA EXTRACTION (read current values from DOM back to object) ───

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
      // Remove the oid prefix: "aio_abc.visual_concept.scene" → "visual_concept.scene"
      var relativePath = path.replace(new RegExp('^' + oid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[._]?'), '');
      // Handle sequence paths: "s0.visual_concept.scene" → index into array
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
      // Numeric parts → array index
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

  // ─── AIO EVENT HANDLERS ───

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

    // Inline field edit → save back to post data
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

    // --- Topic CRUD ---
    $(document).off('click.scp2a-nt', '[data-action="new-topic"]').on('click.scp2a-nt', '[data-action="new-topic"]', function(e) { e.preventDefault(); openNewTopicModal(); });
    $(document).off('click.scp2a-et', '[data-action="edit-topic"]').on('click.scp2a-et', '[data-action="edit-topic"]', function(e) { e.preventDefault(); editTopicModal($(this).data('id')); });
    $(document).off('click.scp2a-dt', '[data-action="delete-topic"]').on('click.scp2a-dt', '[data-action="delete-topic"]', function(e) { e.preventDefault(); deleteTopic($(this).data('id')); });

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

    // --- Topic add/remove on posts ---
    $(document).off('change.scp2a-ta', '.scp-topic-add-select').on('change.scp2a-ta', '.scp-topic-add-select', function() {
      var topicId = $(this).val(); var postId = $(this).data('post-id');
      if (!topicId || !postId) return;
      var post = S.postMap[postId]; if (!post) return;
      post.topics = post.topics || [];
      if (post.topics.indexOf(topicId) < 0) { post.topics.push(topicId); post.updated = new Date().toISOString(); syncToTextarea(); render(); }
    });
    $(document).off('click.scp2a-tr', '[data-action="remove-post-topic"]').on('click.scp2a-tr', '[data-action="remove-post-topic"]', function(e) {
      e.preventDefault(); var topicId = $(this).data('topic-id'); var postId = $(this).data('post-id');
      var post = S.postMap[postId]; if (!post) return;
      post.topics = (post.topics || []).filter(function(t) { return t !== topicId; });
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
    // (Structured form handlers removed — replaced by Phase B visual planner)
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
    logActivity('post_status_changed', post.id, post.title, 'Status: ' + oldLabel + ' → ' + newLabel);
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
    openNewTopicModal: openNewTopicModal, editTopicModal: editTopicModal, deleteTopic: deleteTopic,
    addResearchItem: addResearchItem, removeResearchItem: removeResearchItem,
    setPostStatus: setPostStatus,
    // AIOutputRenderer (Phase A)
    renderStructuredOutput: renderStructuredOutput,
    collectStructuredOutputData: collectStructuredOutputData,
    exportStructuredOutput: exportStructuredOutput,
    OUTPUT_SCHEMAS: OUTPUT_SCHEMAS
  };

  // Global AIO save callback — set by Part 2B to wire inline edits back to post data
  window._scpAIOSaveField = null;

  console.log('[SCP] Part 2A loaded');

})(jQuery, Drupal);
