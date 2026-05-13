/**
 * @category    ai
 * @purpose     Bootstrap for the AI-provider registry. Each provider file
 *              registers itself onto `window._scpAIProviders[<id>]` with the
 *              shape: { buildRequest, parseResponse, buildTestRequest }.
 *              LLMService.callAI / testProvider look up the registry instead
 *              of carrying provider-specific switch statements.
 * @exports     window._scpAIProviders (initialised to {})
 * @extracted-from  src/ai/scp-part2b.js → src/ai/llm-service.js (v0.1.3)
 *
 * Adapter contract:
 *   buildRequest(prompt: string, cfg: SelObj, systemPrompt: string)
 *     → { endpoint: string, headers: object, body: object }
 *   parseResponse(data: any) → string
 *   buildTestRequest(model: ModelObj, apiKey: string)
 *     → { endpoint: string, headers: object, body: object }
 *
 *   SelObj   = { provider, model, temperature, max_tokens, top_p, api_key }
 *   ModelObj = { id, label, temperature, max_tokens, is_default }
 */
(function() {
  'use strict';
  window._scpAIProviders = window._scpAIProviders || {};
})();
