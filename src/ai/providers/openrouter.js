/**
 * @category   ai
 * @purpose    OpenRouter provider adapter. OpenAI-compatible, requires extra
 *             HTTP-Referer and X-Title headers for rankings/attribution.
 * @exports    window._scpAIProviders.openrouter
 * @docs       https://openrouter.ai/docs/api-reference/overview
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  var EXTRA_HEADERS = { 'HTTP-Referer': window.location.origin, 'X-Title': 'Social Content Planner' };

  function _headers(apiKey, extra) {
    var h = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey };
    for (var k in EXTRA_HEADERS) h[k] = EXTRA_HEADERS[k];
    if (extra) for (var ek in extra) h[ek] = extra[ek];
    return h;
  }

  window._scpAIProviders.openrouter = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: _headers(cfg.api_key),
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: cfg.temperature }
      };
    },

    parseResponse: function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content || ''
        : '';
    },

    buildTestRequest: function(model, apiKey) {
      return {
        endpoint: ENDPOINT,
        headers: _headers(apiKey, { 'X-Title': 'SCP Test' }),
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();
