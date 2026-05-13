/**
 * @category   ai
 * @purpose    Google Gemini provider adapter. Generative Language API v1beta.
 * @exports    window._scpAIProviders.gemini
 * @docs       https://ai.google.dev/api/rest/v1beta/models/generateContent
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent';

  window._scpAIProviders.gemini = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: cfg.max_tokens, temperature: cfg.temperature, topP: cfg.top_p }
      };
      if (systemPrompt) body.system_instruction = { parts: [{ text: systemPrompt }] };
      return {
        endpoint: ENDPOINT.replace('{MODEL}', cfg.model) + '?key=' + cfg.api_key,
        headers: { 'Content-Type': 'application/json' },
        body: body
      };
    },

    parseResponse: function(data) {
      return data.candidates && data.candidates[0] && data.candidates[0].content
        ? data.candidates[0].content.parts.map(function(p) { return p.text || ''; }).join('')
        : JSON.stringify(data);
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT.replace('{MODEL}', model.id) + '?key=' + apiKey,
        headers: { 'Content-Type': 'application/json' },
        body: {
          contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: {"status":"ok"}' }] }],
          generationConfig: { maxOutputTokens: 50, temperature: 0 }
        }
      };
    }
  };
})();
