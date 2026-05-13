/**
 * @category    ai
 * @purpose     AI actions: media prompt generation. Two functions:
 *                buildStructuredPrompt — assembles an image-gen prompt from
 *                                        the post's structured_config fields
 *                                        (no AI call; deterministic builder).
 *                aiGenerateMediaPrompt — quick mode (AI writes prompt) OR
 *                                        structured mode (builds via above
 *                                        then asks AI to enhance each).
 * @exports     window._scpAIActions.media = { buildStructured, generate }
 *              Also bare globals buildStructuredPrompt, aiGenerateMediaPrompt
 *              via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpGenerateId, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveImageStyle, window._scpPart2A.snapshot,
 *              window._scpPart2B.recordImageUsage, window.LLMService,
 *              window.BrandService, window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 8 of v0.1.5)
 */
(function($) {
  'use strict';

  var S, toast, esc, generateId, buildMaps, render, syncToTextarea, logActivity;
  var resolveImageStyle, snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    generateId = window._scpGenerateId;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveImageStyle = window._scpResolveImageStyle;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
  }

  // ============================================================
  // SECTION 8: AI ACTIONS — MEDIA PROMPTS
  // ============================================================

  function buildStructuredPrompt(postId) {
    _resolveHelpers();
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
    _resolveHelpers();
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

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.media = {
    buildStructured: buildStructuredPrompt,
    generate: aiGenerateMediaPrompt
  };

})(jQuery);
