/**
 * @category   ai
 * @purpose    Hugging Face Router provider adapter. OpenAI-compatible.
 * @exports    window._scpAIProviders.huggingface
 * @docs       https://huggingface.co/docs/api-inference
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

  window._scpAIProviders.huggingface = {
    buildRequest: function(prompt, cfg, systemPrompt) {
      var messages = [{ role: 'user', content: prompt }];
      if (systemPrompt) messages = [{ role: 'system', content: systemPrompt }].concat(messages);
      return {
        endpoint: ENDPOINT,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.api_key },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: { model: model.id, max_tokens: 50, messages: [{ role: 'user', content: 'Respond with exactly: {"status":"ok"}' }], temperature: 0 }
      };
    }
  };
})();
