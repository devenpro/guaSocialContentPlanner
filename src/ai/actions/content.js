/**
 * @category    ai
 * @purpose     AI actions: content production. Four functions covering the
 *              core writing pipeline:
 *                aiWriteContent     — generates a complete platform-ready post
 *                aiImproveContent   — rewrites an existing draft, tightening prose
 *                aiSuggestSlides    — plans a carousel slide deck as JSON
 *                aiGenerateScript   — writes a timed video script
 * @exports     window._scpAIActions.content = { write, improve, slides, script }
 *              Also bare globals aiWriteContent, aiImproveContent,
 *              aiSuggestSlides, aiGenerateScript via scp-part2b aliases.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpTruncate, window._scpCountChars, window._scpBuildMaps,
 *              window._scpRender, window._scpSyncToTextarea,
 *              window._scpLogActivity, window._scpResolveTone,
 *              window._scpResolveAudience, window._scpGetPlatformConfig,
 *              window._scpMaybeAdvanceStatus, window._scpCleanAIText,
 *              window._scpConstants, window._scpPart2A.snapshot,
 *              window.LLMService, window.BrandService,
 *              window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 7 of v0.1.4)
 */
(function($) {
  'use strict';

  var S, toast, esc, truncate, countChars, buildMaps, render, syncToTextarea, logActivity;
  var resolveTone, resolveAudience, getPlatformConfig, maybeAdvanceStatus, cleanAIText, Constants;
  var snapshot, LLMService, BrandService;
  var parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    truncate = window._scpTruncate;
    countChars = window._scpCountChars;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
    resolveTone = window._scpResolveTone;
    resolveAudience = window._scpResolveAudience;
    getPlatformConfig = window._scpGetPlatformConfig;
    maybeAdvanceStatus = window._scpMaybeAdvanceStatus;
    cleanAIText = window._scpCleanAIText;
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
  // SECTION 7: AI ACTIONS — CONTENT
  // ============================================================

  function aiWriteContent(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    // Confirm if content exists
    if (post.content && post.content.body && post.content.body.trim().length > 50) {
      if (!confirm('This will replace your existing content. Continue?')) return;
    }
    var done = aiActionLoading('ai-write-content');
    toast('Writing content...', 'info');
    var r = post.research || {};
    var primaryPlatform = (post.platforms || [])[0] || 'LinkedIn';
    var platSettings = getPlatformConfig(primaryPlatform.toLowerCase());
    var charLimit = platSettings.char_limit || 3000;
    var toneObj = resolveTone(post.content.tone_id);
    var audObj = resolveAudience(post.content.audience_id);

    var prompt = 'Write a complete, ready-to-publish social media post.\n\nContext:\n- Primary platform: ' + primaryPlatform + ' (max ' + charLimit + ' chars)\n- Post type: ' + (Constants.POST_TYPES[post.type] || {}).label + '\n';
    if (r.selected_angle) prompt += '- Chosen angle: ' + r.selected_angle + '\n';
    if (r.selected_hook) prompt += '- Opening hook (use as first line): ' + r.selected_hook + '\n';
    if (toneObj) prompt += '- Tone: ' + toneObj.name + ' (' + (toneObj.description || '') + ')\n';
    if (audObj) prompt += '- Audience: ' + audObj.name + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nStructure requirements:\n- Start with the hook (if provided) as the very first line\n- Use line breaks for readability (especially on LinkedIn)\n- Include a clear, specific CTA (not generic "like and share")\n- End with 3-5 relevant hashtags on a new line\n- Stay within ' + charLimit + ' characters total\n- Write for ' + primaryPlatform + ' conventions and culture\n\nOutput ONLY the post text as plain text. No JSON, no markdown, no explanations.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.content = post.content || {};
      post.content.body = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('content_written', post.id, post.title, 'AI-generated content (' + countChars(post.content.body) + ' chars)');
      snapshot('AI content'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'content written');
      buildMaps(); render(); syncToTextarea(); toast('Content generated!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-write-content', BrandService.getSystemPrompt('content'));
  }

  function aiImproveContent(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || !post.content || !post.content.body) { toast('Write content first', 'warning'); return; }
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-improve-content');
    toast('Improving content...', 'info');
    var charCount = countChars(post.content.body);
    var primaryPlatform = (post.platforms || [])[0] || 'LinkedIn';

    var prompt = 'You are an elite social media editor. Improve this ' + primaryPlatform + ' post while preserving the author\'s intent and voice.\n\nCurrent post (' + charCount + ' chars):\n---\n' + post.content.body + '\n---\n';
    prompt += brandSnippet('content');
    prompt += '\n\nImprovement checklist:\n- Sharpen the hook — make first line impossible to scroll past\n- Tighten every sentence — remove filler words, passive voice, clichés\n- Strengthen the CTA — make it specific and actionable\n- Improve formatting — line breaks, white space, scanability\n- Ensure emotional resonance — does every paragraph earn the next?\n- Check hashtag relevance and count\n- Keep similar length (±15%)\n\nOutput ONLY the improved post as plain text. No explanations, no "here\'s the improved version", just the post.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.content.body = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('content_improved', post.id, post.title, 'AI-improved content');
      snapshot('AI improve'); render(); syncToTextarea(); toast('Content improved!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-improve-content', BrandService.getSystemPrompt('content'));
  }

  function aiSuggestSlides(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type !== 'carousel') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-plan-slides');
    toast('Planning slides...', 'info');
    var count = (post.carousel && post.carousel.slide_count) || 5;
    var prompt = 'You are a carousel content designer. Plan a ' + count + '-slide carousel post.\n\nContext:\n- Topic: ' + esc(post.title || '') + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (post.content.body) prompt += '- Post content: ' + truncate(post.content.body, 400) + '\n';
    if (post.research && post.research.selected_angle) prompt += '- Angle: ' + post.research.selected_angle + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nStructure rules:\n- Slide 1: Hook slide — bold attention-grabbing statement, minimal text\n- Slides 2-' + (count - 1) + ': Value slides — one key point per slide, concise text overlay\n- Slide ' + count + ': CTA slide — clear next step, profile tag\n- Each text_overlay should be 3-8 words (what appears ON the image)\n- Each theme explains the slide\'s purpose (for the designer)\n\nRespond ONLY as JSON: {"slides":[{"theme":"...","text_overlay":"..."}]}';

    callAIWithRetry(prompt, function(text) {
      done();
      var parsed = parseJSON(text);
      post.carousel = post.carousel || { slide_count: count, slides: [] };
      post.carousel.slides = (parsed.slides || []).map(function(s, i) { return { index: i, theme: s.theme || '', text_overlay: s.text_overlay || '' }; });
      post.carousel.slide_count = post.carousel.slides.length;
      post.updated = new Date().toISOString();
      logActivity('slides_planned', post.id, post.title, post.carousel.slides.length + ' slides planned');
      snapshot('AI slides'); render(); syncToTextarea(); toast('Slides planned!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-plan-slides');
  }

  function aiGenerateScript(postId) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post || post.type !== 'video') return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-generate-script');
    toast('Generating script...', 'info');
    var dur = post.video.duration_seconds || 60;
    var primaryPlatform = (post.platforms || [])[0] || 'Instagram';
    var formatLabel = dur <= 30 ? 'Reel/Short' : dur <= 90 ? 'Short-form video' : 'Long-form video';

    var prompt = 'You are a video script writer for social media. Write a ' + dur + '-second ' + formatLabel + ' script.\n\nContext:\n- Topic: ' + esc(post.title || '') + '\n- Platform: ' + primaryPlatform + '\n- Duration: ' + dur + ' seconds\n- Format: ' + (post.video.format || formatLabel) + '\n';
    if (post.video.concept) prompt += '- Concept: ' + post.video.concept + '\n';
    if (post.research && post.research.selected_hook) prompt += '- Hook: ' + post.research.selected_hook + '\n';
    if (post.research && post.research.selected_angle) prompt += '- Angle: ' + post.research.selected_angle + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nScript format:\n- Use timestamp markers: [0-3s], [3-8s], etc.\n- Include [VISUAL CUE] notes in brackets for what\'s on screen\n- Start with a 0-3s HOOK that stops the scroll\n- End with a clear CTA in the last 5 seconds\n- Match pacing to platform: ' + (dur <= 30 ? 'fast cuts, punchy, no wasted frames' : 'conversational but tight, one idea per segment') + '\n- Write the voiceover/spoken words as natural speech, not essay prose\n\nOutput the script as plain text only. No JSON.';

    LLMService.callAI(prompt, function(text) {
      done();
      post.video = post.video || {};
      post.video.script = cleanAIText ? cleanAIText(text) : text.trim();
      post.updated = new Date().toISOString();
      logActivity('script_generated', post.id, post.title, dur + 's video script');
      snapshot('AI script'); render(); syncToTextarea(); toast('Script generated!', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-generate-script', BrandService.getSystemPrompt('content'));
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.content = {
    write: aiWriteContent,
    improve: aiImproveContent,
    slides: aiSuggestSlides,
    script: aiGenerateScript
  };

})(jQuery);
