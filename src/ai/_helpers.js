/**
 * @category    ai
 * @purpose     Shared helpers for AI actions: structured-JSON parsing,
 *              brace-block extraction, brand-snippet builder, retry wrapper
 *              around LLMService.callAI, and the AI-button loading-state
 *              manager (returns a restore closure).
 * @exports     window._scpAIHelpers = { parseJSON, extractBraceBlock,
 *              brandSnippet, callAIWithRetry, aiActionLoading }
 * @depends-on  window.BrandService (runtime), window.LLMService (runtime),
 *              window._scpToast (runtime), window._scpIcon (runtime), jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 4/5/5.5/5.6 of v0.1.3)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 4: AI RESPONSE PARSING
  // ============================================================

  function parseJSON(text) {
    if (!text || !text.trim()) throw new Error('Empty AI response');
    try { return JSON.parse(text); } catch(e) {}
    var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { return JSON.parse(cleaned); } catch(e) {}
    var objStr = extractBraceBlock(cleaned, '{', '}');
    if (objStr) { try { return JSON.parse(objStr); } catch(e) {} }
    var arrStr = extractBraceBlock(cleaned, '[', ']');
    if (arrStr) { try { return JSON.parse(arrStr); } catch(e) {} }
    if (objStr) { var relaxed = objStr.replace(/,\s*([}\]])/g, '$1'); try { return JSON.parse(relaxed); } catch(e) {} }
    throw new Error('Could not parse AI response as JSON');
  }

  function extractBraceBlock(text, openChar, closeChar) {
    var start = text.indexOf(openChar); if (start === -1) return null;
    var depth = 0, inStr = false, escaped = false;
    for (var i = start; i < text.length; i++) {
      var ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) { depth--; if (depth === 0) return text.substring(start, i + 1); }
    }
    return null;
  }

  // ============================================================
  // SECTION 5: BRAND PROMPT HELPERS
  // ============================================================

  function brandSnippet(type) {
    var BrandService = window.BrandService;
    if (!BrandService || !BrandService.isConfigured()) return '';
    var lines = [], core = BrandService.getCore(), aud = BrandService.getAudience();
    if (type === 'research' || type === 'angles') {
      if (aud.primary) lines.push('Target audience: ' + aud.primary);
      if (aud.pain_points) lines.push('Their pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
      if (core.brand_voice) lines.push('Brand voice: ' + core.brand_voice);
      var seo = BrandService.getSeo();
      if (seo.content_gaps) lines.push('Content gaps to exploit: ' + (Array.isArray(seo.content_gaps) ? seo.content_gaps.join(', ') : seo.content_gaps));
    }
    if (type === 'hooks') {
      if (aud.primary) lines.push('Audience: ' + aud.primary);
      if (core.brand_voice) lines.push('Voice: ' + core.brand_voice);
      var fw = BrandService.getForbiddenWords();
      if (fw.length) lines.push('NEVER use: ' + fw.join(', '));
      var dos = BrandService.getDos();
      if (dos.length) lines.push('Hook style should: ' + dos.slice(0, 3).join('; '));
    }
    if (type === 'content' || type === 'platform') {
      var cnt = BrandService.getContent();
      if (cnt.writing_style) lines.push('Writing style: ' + cnt.writing_style);
      if (cnt.sentence_rules) lines.push('Sentence rules: ' + (Array.isArray(cnt.sentence_rules) ? cnt.sentence_rules.join('; ') : cnt.sentence_rules));
      if (cnt.cta_style) lines.push('CTA style: ' + cnt.cta_style);
      if (core.forbidden_words && core.forbidden_words.length) lines.push('NEVER use: ' + core.forbidden_words.join(', '));
    }
    if (type === 'media') {
      var bdPrompt = BrandService.getBrandDesignPrompt();
      if (bdPrompt) return '\n\n' + bdPrompt;
      if (core.brand_name) lines.push('Brand: ' + core.brand_name);
    }
    return lines.length ? '\n\nBrand context:\n' + lines.join('\n') : '';
  }

  // ============================================================
  // SECTION 5.5: AI RETRY WRAPPER
  // ============================================================

  function callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt) {
    var LLMService = window.LLMService;
    var toast = window._scpToast || function() {};
    LLMService.callAI(prompt, function(text) {
      try {
        onSuccess(text);
      } catch(e) {
        console.warn('[SCP] AI response parse failed, retrying with stricter instructions:', e.message);
        // Retry once with stricter JSON instructions
        var retryPrompt = prompt + '\n\nCRITICAL: Your previous response was not valid JSON. Respond with ONLY a valid JSON object. No markdown, no code fences, no explanations before or after. Just pure JSON.';
        toast('Retrying with stricter instructions...', 'info');
        LLMService.callAI(retryPrompt, function(text2) {
          try {
            onSuccess(text2);
          } catch(e2) {
            console.error('[SCP] AI retry also failed:', e2.message);
            toast('AI response format error: ' + e2.message + '. Try a different AI model.', 'error');
            if (onError) onError('Parse error after retry: ' + e2.message);
          }
        }, function(err) {
          if (onError) onError(err);
        }, actionId, systemPrompt);
      }
    }, function(err) {
      if (onError) onError(err);
    }, actionId, systemPrompt);
  }

  // ============================================================
  // SECTION 5.6: AI BUTTON LOADING STATE MANAGEMENT
  // ============================================================

  /**
   * Sets an AI button to loading state. Returns a restore function.
   */
  function aiActionLoading(actionName) {
    var icon = window._scpIcon || function() { return ''; };
    var $btns = $('[data-action="' + actionName + '"]');
    var origData = [];
    $btns.each(function() {
      origData.push({ el: this, html: $(this).html(), disabled: $(this).prop('disabled') });
      $(this).prop('disabled', true).addClass('scp-btn-loading').html(icon('spinner') + ' Working...');
    });
    return function() {
      for (var i = 0; i < origData.length; i++) {
        $(origData[i].el).prop('disabled', origData[i].disabled).removeClass('scp-btn-loading').html(origData[i].html);
      }
    };
  }

  window._scpAIHelpers = {
    parseJSON: parseJSON,
    extractBraceBlock: extractBraceBlock,
    brandSnippet: brandSnippet,
    callAIWithRetry: callAIWithRetry,
    aiActionLoading: aiActionLoading
  };

})(jQuery);
