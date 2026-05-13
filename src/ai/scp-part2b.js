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
 *  6. AI actions — Research (angles, hooks)
 *  7. AI actions — Content (write, improve, slides, script)
 *  8. AI actions — Media prompts
 *  9. AI actions — Platform adaptation
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

    // Register AIO inline edit save callback — wires structured output edits back to post data
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
          // Numeric last key → array item (shouldn't happen for field edits but handle it)
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
    console.log('[SCP] Part 2B initialized — renderers: research, settings, images');
    } catch(e) {
      console.error('[SCP] Part 2B init FAILED:', e.message, e.stack);
      // Still try to show what we can
      if (window._scpToast) window._scpToast('Part 2B init error: ' + e.message, 'error');
    }
  }

  // ============================================================
  // SECTION 2: LLMService  — extracted to src/ai/llm-service.js (v0.1.2)
  //   plus provider adapters in src/ai/providers/*.js (v0.1.3).
  // LLMService is now `window.LLMService`; each provider is registered
  // on `window._scpAIProviders[<id>]`. References below resolve via the
  // local alias on the next line.
  // ============================================================
  var LLMService = window.LLMService;


  // ============================================================
  // SECTION 3: BrandService  — extracted to src/ai/brand-service.js (v0.1.1)
  // BrandService is now `window.BrandService`. All references below resolve
  // to that global without any code change.
  // ============================================================
  var BrandService = window.BrandService;

  // ============================================================
  // SECTIONS 4-6: AI HELPERS + RESEARCH ACTIONS — extracted (v0.1.4)
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
  // SECTION 7: AI ACTIONS — CONTENT — extracted (v0.1.5)
  //   -> src/ai/actions/content.js
  // ============================================================
  var aiWriteContent   = window._scpAIActions.content.write;
  var aiImproveContent = window._scpAIActions.content.improve;
  var aiSuggestSlides  = window._scpAIActions.content.slides;
  var aiGenerateScript = window._scpAIActions.content.script;

  // ============================================================
  // SECTION 8: AI ACTIONS — MEDIA PROMPTS
  // ============================================================

  function buildStructuredPrompt(postId) {
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
    var post = S.postMap[postId]; if (!post || post.type === 'text') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var promptMode = (post.media && post.media.prompt_mode) || 'quick';
    var doneMedia = aiActionLoading('ai-generate-media');

    // ─── STRUCTURED MODE: Build from fields, then AI-enhance ───
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

    // ─── QUICK MODE: Original behavior with brand design injection ───
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

  // ============================================================
  // SECTION 8.5: AI ACTIONS — VISUAL PLAN + STRUCTURED SCRIPT
  // ============================================================

  /**
   * Message-first visual plan generator.
   * Asks AI: "Given this message/hook, what visual communicates it best?"
   * Returns structured JSON that maps to image_visual_plan schema.
   */
  function aiGenerateVisualPlan(postId) {
    var post = S.postMap[postId]; if (!post || post.type === 'text') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var doneVP = aiActionLoading('ai-generate-visual-plan');

    var r = post.research || {};
    var contentBody = (post.content && post.content.body) || '';
    var config = (post.media && post.media.config) || {};
    var styleObj = resolveImageStyle(config.style_id);
    var toneObj = resolveTone((post.content && post.content.tone_id) || '');
    var audObj = resolveAudience((post.content && post.content.audience_id) || '');

    // ─── Build context-rich prompt ───
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
      prompt += '- Slide 1: Hook slide — bold, attention-grabbing, minimal text\n';
      for (var sci = 0; sci < slides.length; sci++) {
        if (slides[sci].theme) prompt += '- Slide ' + (sci + 1) + ' theme: ' + slides[sci].theme + '\n';
      }
      prompt += '- Last slide: CTA — clear next step\n';
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

  function _structuredScriptToPlainText(script) {
    if (!script) return '';
    var lines = [];
    if (script.hook && script.hook.voiceover) {
      lines.push('[HOOK — ' + (script.hook.duration_seconds || '?') + 's]');
      lines.push(script.hook.voiceover);
      if (script.hook.visual) lines.push('[VISUAL] ' + script.hook.visual);
      if (script.hook.on_screen_text) lines.push('[TEXT] ' + script.hook.on_screen_text);
      lines.push('');
    }
    if (script.body && Array.isArray(script.body)) {
      for (var i = 0; i < script.body.length; i++) {
        var b = script.body[i];
        lines.push('[' + (b.section || 'SECTION ' + (i + 1)).toUpperCase() + ' — ' + (b.duration_seconds || '?') + 's]');
        if (b.voiceover) lines.push(b.voiceover);
        if (b.visual) lines.push('[VISUAL] ' + b.visual);
        if (b.on_screen_text) lines.push('[TEXT] ' + b.on_screen_text);
        lines.push('');
      }
    }
    if (script.outro && script.outro.voiceover) {
      lines.push('[OUTRO — ' + (script.outro.duration_seconds || '?') + 's]');
      lines.push(script.outro.voiceover);
      if (script.outro.visual) lines.push('[VISUAL] ' + script.outro.visual);
      if (script.outro.cta) lines.push('[CTA] ' + script.outro.cta);
    }
    return lines.join('\n').trim();
  }

  // ============================================================
  // SECTION 9: AI ACTIONS — PLATFORM ADAPTATION — extracted (v0.1.4)
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
        html += '<span class="scp-text-sm scp-text-muted">' + esc(ses.type === 'advanced' ? 'Advanced' : 'Quick') + ' • ' + (ses.results || []).length + ' ideas • ' + formatDate(ses.created) + '</span>';
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
            for (var star = 1; star <= 5; star++) html += '<span class="scp-star' + (star <= (idea.rating || 0) ? ' scp-star-filled' : '') + '" data-action="rate-idea" data-session="' + esc(ses.id) + '" data-idea="' + esc(idea.id) + '" data-rating="' + star + '">★</span>';
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
    for (var ti = 0; ti < templates.length; ti++) html += '<option value="' + esc(templates[ti].id) + '">' + esc(templates[ti].name) + ' — ' + esc(templates[ti].description || '') + '</option>';
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
          id: sessionId, title: template.name + ' — ' + (vars.topic || vars.pillar || 'Research'), topic: vars.topic || vars.pillar || '', type: 'advanced',
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

    // ─── AI Status summary ───
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

    // ─── Default Provider Picker ───
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
        html += '<span class="scp-text-xs scp-text-muted"> — temp: ' + def.temperature + ', max tokens: ' + formatNumber(def.max_tokens) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // ─── Provider Cards ───
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

    // ─── Per-action overrides ───
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

    // ─── Brand context toggles ───
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
      html += icon('circle-check') + ' <strong>Drupal brand data detected</strong> — empty fields will auto-fill from your brand profile.';
      html += '</div>';
    }

    // ─── Colors ───
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

    // ─── Typography ───
    html += '<div class="scp-settings-section"><h3>' + icon('font') + ' Typography</h3>';
    html += '<div class="scp-form-group"><label>Heading Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.heading_style" value="' + esc(t.heading_style || '') + '" placeholder="e.g. Bold sans-serif, clean lines"></div>';
    html += '<div class="scp-form-group"><label>Body Text Style</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.body_style" value="' + esc(t.body_style || '') + '" placeholder="e.g. Clean sans-serif, high readability"></div>';
    html += '<div class="scp-form-group"><label>Text Treatment on Images</label>';
    html += '<input type="text" class="scp-input scp-brand-design-field" data-bd-path="typography.text_treatment" value="' + esc(t.text_treatment || '') + '" placeholder="e.g. Minimal text, large headings only"></div>';
    html += '</div>';

    // ─── Visual Style ───
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

    // ─── Layout Rules ───
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

    // ─── Reference Images ───
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

    // ─── Generated Prefix Preview ───
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
  // SECTION 13.1: IMAGES VIEW — Gallery, Detail, CRUD, Upload
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
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '" title="' + (img.star ? 'Unstar' : 'Star') + '">★</button>';
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
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">★</button>';
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
    html += '<button class="scp-img-star' + (img.star ? ' scp-img-star-active' : '') + '" data-action="toggle-image-star" data-fid="' + esc(img.fid) + '">★</button>';
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

    // Visual style — for filtering in media step
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
    if (!$emptySlot.length) { toast('No upload slots available — save the node first to get more slots', 'warning'); S.$imageField.hide(); return; }
    // Set up a one-time listener for Drupal AJAX completion
    var _checkCount = 0;
    var _prevCount = S.images.length;
    toast('Drupal upload dialog opened — select your image', 'info');
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
  // SECTION 13.2: IMAGE PICKER — Reusable selection modal
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
        if (img.star) html += '<span class="scp-img-picker-star">★</span>';
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
        if (displayText.length > 35) displayText = displayText.substring(0, 32) + '…';
        $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">' + esc(displayText) + '</span>');
        $el.attr('title', 'AI: ' + provLabel + ' / ' + modelLabel + ' — click to change');
      } else {
        $el.html('<span class="scp-ai-status-dot scp-ai-status-ok"></span><span class="scp-ai-status-label">AI Ready</span>');
        $el.attr('title', 'AI active — click to configure');
      }
    } else {
      $el.html('<span class="scp-ai-status-dot scp-ai-status-off"></span><span class="scp-ai-status-label">No AI</span>');
      $el.attr('title', 'AI not configured — click for setup');
    }
  }

  function testAIConnection() {
    if (!LLMService.isConfigured()) { toast('No AI providers configured. Add providers in your user profile → LLM Config field.', 'warning'); return; }
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
        // Even if not valid JSON, the AI responded — connection works
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
      // Sync color picker → text input
      $(this).siblings('.scp-brand-design-field[data-bd-path="' + path + '"]').val(val);
    });
    $(document).off('blur.scp2b-bdf', 'input.scp-brand-design-field[data-bd-path*="colors."]').on('blur.scp2b-bdf', 'input.scp-brand-design-field[data-bd-path*="colors."]', function() {
      var path = $(this).data('bd-path'); var val = $(this).val();
      // Sync text input → color picker (if valid hex)
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
