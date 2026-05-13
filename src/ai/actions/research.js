/**
 * @category    ai
 * @purpose     AI actions: research phase (angles + hooks).
 *              Generates 4 differentiated content angles or 5 scroll-stopping
 *              hooks via the chosen LLM, parses structured JSON, mutates the
 *              post's research arrays, and re-renders.
 * @exports     window._scpAIActions.research = { angles, hooks }
 *              Also bare global functions aiResearchAngles, aiResearchHooks
 *              so existing scp-part2b exports keep working.
 * @depends-on  window._scpState, window._scpToast, window._scpEsc,
 *              window._scpGenerateId, window._scpBuildMaps, window._scpRender,
 *              window._scpSyncToTextarea, window._scpLogActivity,
 *              window._scpResolveTone, window._scpResolveAudience,
 *              window._scpMaybeAdvanceStatus, window._scpConstants,
 *              window._scpPart2A.snapshot, window.LLMService, window.BrandService,
 *              window._scpAIHelpers, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 6 of v0.1.3)
 */
(function($) {
  'use strict';

  var S, toast, esc, generateId, buildMaps, render, syncToTextarea, logActivity;
  var resolveTone, resolveAudience, maybeAdvanceStatus, Constants, snapshot;
  var LLMService, BrandService, parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    esc = window._scpEsc;
    generateId = window._scpGenerateId;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
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
  // SECTION 6: AI ACTIONS — RESEARCH (Angles, Hooks)
  // ============================================================

  function aiResearchAngles(postId, customInput) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var done = aiActionLoading('ai-research-angles');
    toast('Researching angles...', 'info');
    var toneObj = resolveTone(post.content.tone_id);
    var audObj = resolveAudience(post.content.audience_id);
    var prompt = 'You are a senior social media strategist analyzing content angles. Generate 4 unique, differentiated content angles for this post.\n\nContext:\n- Title: ' + esc(post.title || 'Untitled') + '\n- Post type: ' + (Constants.POST_TYPES[post.type] || {}).label + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (toneObj) prompt += '- Tone: ' + toneObj.name + ' (' + (toneObj.description || '') + ')\n';
    if (audObj) prompt += '- Target audience: ' + audObj.name + ' (' + (audObj.description || '') + ')\n';
    if (customInput) prompt += '- User direction: ' + customInput + '\n';
    prompt += brandSnippet('angles');
    prompt += '\n\nRules:\n- Each angle must be DISTINCT — different perspective, not just rewording\n- Consider: contrarian takes, data-driven, storytelling, problem-solution, aspirational, educational\n- Think about what competing content misses or gets wrong\n- Each angle should suggest a clear emotional trigger\n\nFor each angle provide:\n- angle: short memorable name (2-4 words)\n- description: 2-3 sentences explaining the perspective and WHY it works for this audience\n\nRespond ONLY as JSON: {"angles":[{"angle":"...","description":"..."}]}';

    callAIWithRetry(prompt, function(text) {
      done();
      var parsed = parseJSON(text);
      post.research = post.research || { angles: [], hooks: [], selected_angle: '', selected_hook: '', notes: '' };
      (parsed.angles || []).forEach(function(a) { post.research.angles.push({ id: generateId('ang'), angle: a.angle || '', description: a.description || '', selected: false }); });
      post.updated = new Date().toISOString();
      logActivity('angles_researched', post.id, post.title, (parsed.angles || []).length + ' angles generated');
      snapshot('AI angles'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'angles researched');
      buildMaps(); render(); syncToTextarea(); toast('Generated ' + (parsed.angles || []).length + ' angles', 'success');
    }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-research-angles', BrandService.getSystemPrompt('social'));
  }

  function aiResearchHooks(postId, customInput) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var doneHooks = aiActionLoading('ai-research-hooks');
    var angle = (post.research && post.research.selected_angle) || '';
    if (!angle) { toast('Select an angle first', 'warning'); return; }
    toast('Generating hooks...', 'info');
    var prompt = 'You are a copywriting expert specializing in scroll-stopping social media hooks. Generate 5 opening hooks for this post.\n\nContext:\n- Title: ' + esc(post.title || '') + '\n- Chosen angle: ' + angle + '\n- Platforms: ' + (post.platforms || []).join(', ') + '\n';
    if (customInput) prompt += '- User direction: ' + customInput + '\n';
    prompt += brandSnippet('hooks');
    prompt += '\n\nRules:\n- Each hook MUST stop the scroll in under 2 seconds of reading\n- Use different hook psychology types across the 5:\n  1. Question hook (provocative question)\n  2. Bold claim / contrarian statement\n  3. Story/curiosity hook ("I was wrong about...")\n  4. Data/statistic hook (specific number)\n  5. Direct address ("If you [specific situation]...")\n- Keep each hook under 15 words\n- No generic openers like "In today\'s world" or "Have you ever wondered"\n\nRespond ONLY as JSON: {"hooks":[{"hook":"...","type":"question|bold|story|data|direct"}]}';

    callAIWithRetry(prompt, function(text) {
      doneHooks();
      var parsed = parseJSON(text);
      post.research = post.research || { angles: [], hooks: [], selected_angle: '', selected_hook: '', notes: '' };
      (parsed.hooks || []).forEach(function(h) { post.research.hooks.push({ id: generateId('hk'), hook: h.hook || h.text || '', type: h.type || '', selected: false }); });
      post.updated = new Date().toISOString();
      logActivity('hooks_researched', post.id, post.title, (parsed.hooks || []).length + ' hooks generated');
      snapshot('AI hooks'); buildMaps(); render(); syncToTextarea(); toast('Generated ' + (parsed.hooks || []).length + ' hooks', 'success');
    }, function(err) { doneHooks(); toast('AI Error: ' + err, 'error'); }, 'ai-research-hooks', BrandService.getSystemPrompt('social'));
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.research = { angles: aiResearchAngles, hooks: aiResearchHooks };

})(jQuery);
