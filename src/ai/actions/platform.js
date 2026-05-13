/**
 * @category    ai
 * @purpose     AI action: per-platform content adaptation. Generates YouTube
 *              metadata (title/description/tags as JSON) for the youtube key,
 *              or plain-text adapted body for linkedin/instagram/facebook with
 *              per-platform formatting rules.
 * @exports     window._scpAIActions.platform = { adapt }
 *              Also bare global aiAdaptForPlatform so scp-part2b exports work.
 * @depends-on  Same set as actions/research.js, plus window._scpTruncate,
 *              window._scpGetPlatformConfig, window._scpCleanAIText.
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 9 of v0.1.3)
 */
(function($) {
  'use strict';

  var S, toast, truncate, buildMaps, render, syncToTextarea, logActivity;
  var getPlatformConfig, maybeAdvanceStatus, cleanAIText, Constants, snapshot;
  var LLMService, BrandService, parseJSON, brandSnippet, callAIWithRetry, aiActionLoading;

  function _resolveHelpers() {
    S = window._scpState;
    toast = window._scpToast;
    truncate = window._scpTruncate;
    buildMaps = window._scpBuildMaps;
    render = window._scpRender;
    syncToTextarea = window._scpSyncToTextarea;
    logActivity = window._scpLogActivity;
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
  // SECTION 9: AI ACTIONS — PLATFORM ADAPTATION
  // ============================================================

  function aiAdaptForPlatform(postId, platformKey) {
    _resolveHelpers();
    var post = S.postMap[postId]; if (!post) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    if (!post.content || !post.content.body) { toast('Write master content first', 'warning'); return; }
    var plCfg = Constants.PLATFORMS[platformKey]; if (!plCfg) return;
    var platSettings = getPlatformConfig(platformKey);
    var done = aiActionLoading('ai-adapt-platform');
    toast('Adapting for ' + plCfg.label + '...', 'info');

    if (platformKey === 'youtube') {
      var prompt = 'You are a YouTube Shorts optimization expert. Create YouTube metadata for this content.\n\nOriginal post:\n---\n' + truncate(post.content.body, 500) + '\n---\n';
      prompt += brandSnippet('platform');
      prompt += '\n\nRequirements:\n- title: Compelling, keyword-rich, under 100 chars. Use power words.\n- description: SEO-optimized, 150-300 chars. Include 1-2 relevant keywords naturally.\n- tags: 8-12 relevant search tags, mix broad and specific\n\nRespond ONLY as JSON: {"title":"...","description":"...","tags":["..."]}';

      callAIWithRetry(prompt, function(text) {
        done();
        var parsed = parseJSON(text);
        post.platform_content = post.platform_content || {};
        post.platform_content.youtube = { enabled: true, title: parsed.title || '', description: parsed.description || '', tags: parsed.tags || [], notes: '' };
        post.updated = new Date().toISOString();
        logActivity('platform_adapted', post.id, post.title, 'Adapted for YouTube');
        snapshot('AI adapt YT'); if (maybeAdvanceStatus) maybeAdvanceStatus(post, 'YouTube adapted');
        buildMaps(); render(); syncToTextarea(); toast('YouTube content ready!', 'success');
      }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-adapt-platform');
    } else {
      var charLimit = platSettings.char_limit || 3000;
      var hashtagLimit = platSettings.hashtag_limit || 5;

      // Platform-specific formatting instructions
      var platRules = '';
      if (platformKey === 'linkedin') {
        platRules = '- Professional tone, thought-leadership positioning\n- Use line breaks after every 1-2 sentences for scanability\n- Strong hook in FIRST LINE — this shows before "see more"\n- Use bullet points or numbered lists for key points\n- CTA should feel conversational, not salesy\n- 3-5 hashtags at the very end, on their own line\n- No emojis in first line, sparingly elsewhere\n';
      } else if (platformKey === 'instagram') {
        platRules = '- Emoji-friendly, punchy, visual-first language\n- Hook must work in 125-char preview (before "more")\n- Use short paragraphs separated by line breaks\n- Storytelling tone — personal, relatable\n- CTA: encourage saves, shares, comments with specific prompts\n- Put most hashtags at end (20-30 is fine) or in first comment\n- Use relevant emojis as visual anchors, not decoration\n';
      } else if (platformKey === 'facebook') {
        platRules = '- Conversational, community-focused tone\n- Ask questions to drive comments\n- Keep under 250 chars for optimal engagement (though limit is higher)\n- Shareable format — would someone tag a friend?\n- 1-3 hashtags maximum, or none\n- Emojis OK but don\'t overdo\n';
      }

      var prompt2 = 'You are a ' + plCfg.label + ' content specialist. Adapt this post for ' + plCfg.label + '.\n\nOriginal master content:\n---\n' + post.content.body + '\n---\n';
      prompt2 += brandSnippet('platform');
      prompt2 += '\n\n' + plCfg.label + ' formatting rules:\n' + platRules;
      prompt2 += '- Maximum ' + charLimit + ' characters\n- Up to ' + hashtagLimit + ' hashtags\n';
      prompt2 += '\nOutput ONLY the adapted post as plain text. Ready to copy-paste and publish. No JSON, no explanations.';

      LLMService.callAI(prompt2, function(text) {
        done();
        post.platform_content = post.platform_content || {};
        post.platform_content[platformKey] = post.platform_content[platformKey] || {};
        post.platform_content[platformKey].body = cleanAIText ? cleanAIText(text) : text.trim();
        post.platform_content[platformKey].enabled = true;
        post.updated = new Date().toISOString();
        logActivity('platform_adapted', post.id, post.title, 'Adapted for ' + plCfg.label);
        snapshot('AI adapt ' + platformKey); if (maybeAdvanceStatus) maybeAdvanceStatus(post, platformKey + ' adapted');
        buildMaps(); render(); syncToTextarea(); toast(plCfg.label + ' content ready!', 'success');
      }, function(err) { done(); toast('AI Error: ' + err, 'error'); }, 'ai-adapt-platform', BrandService.getSystemPrompt('platform'));
    }
  }

  window._scpAIActions = window._scpAIActions || {};
  window._scpAIActions.platform = { adapt: aiAdaptForPlatform };

})(jQuery);
