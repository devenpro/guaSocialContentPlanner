/**
 * @category    ai
 * @purpose     AI actions: visual plan + structured video script. Two
 *              "message-first" generators that emit structured JSON rather
 *              than free-form prose:
 *                aiGenerateVisualPlan      — for image/carousel posts, plans
 *                                            visual concept + text overlays +
 *                                            color mood + layout per slide.
 *                aiGenerateStructuredScript — for video posts, returns
 *                                            hook + body[] + outro as JSON
 *                                            plus a plain-text rendering.
 * @exports     window._scpAIActions.visual = { plan, script }
 *              Also bare globals aiGenerateVisualPlan,
 *              aiGenerateStructuredScript via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpTruncate, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveImageStyle, window._scpResolveTone,
 *              window._scpResolveAudience, window._scpMaybeAdvanceStatus,
 *              window._scpConstants, window._scpPart2A.snapshot,
 *              window.LLMService, window.BrandService, window._scpAIHelpers,
 *              jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 8.5 of v0.1.5)
 */
(function($) {
  'use strict';

  var S, toast, esc, truncate, buildMaps, render, syncToTextarea, logActivity;
  var resolveImageStyle, resolveTone, resolveAudience, maybeAdvanceStatus, Constants;
  var snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    truncate = window._scpTruncate;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveImageStyle = window._scpResolveImageStyle;
    resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    Constants = window._scpConstants;
    snapshot = (window._scpPart2A && window._scpPart2A.snapshot) || function() {};
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    parseJSON = window._scpAIHelpers.parseJSON;
    brandSnippet = window._scpAIHelpers.brandSnippet;
    callAIWithRetry = window._scpAIHelpers.callAIWithRetry;
    aiActionLoading = window._scpAIHelpers.aiActionLoading;
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
    _resolveHelpers();
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
    _resolveHelpers();
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

  // Private helper, only used by aiGenerateStructuredScript above.
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

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.visual = { plan: aiGenerateVisualPlan, script: aiGenerateStructuredScript };

})(jQuery);
