/**
 * @category   ai
 * @purpose    Groq provider adapter. OpenAI-compatible. Note: rejects
 *             temperature=0 — we substitute 0.01 to match upstream quirk.
 * @exports    window._scpAIProviders.groq
 * @docs       https://console.groq.com/docs/api-reference
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

  window._scpAIProviders.groq = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      var temperature = (cfg.temperature === 0) ? 0.01 : cfg.temperature;  // Groq quirk
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
        body: { model: cfg.model, max_tokens: cfg.max_tokens, messages: messages, temperature: temperature }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0.01 }
      };
    }
  };
})();
