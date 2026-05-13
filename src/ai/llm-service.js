/**
 * @category    ai
 * @purpose     Multi-provider LLM service: provider/model discovery from Drupal
 *              divs, per-action preference persistence, unified callAI() wrapper
 *              over 8 chat-completion endpoints, inline picker UI, connection test.
 * @exports     window.LLMService
 * @depends-on  window._scpState (S), window._scpEsc, window._scpIcon,
 *              window._scpDeepClone, window._scpSyncToTextarea, window._scpRender,
 *              window._scpUpdateAIStatusIndicator, jQuery
 * @extracted-from  src/ai/scp-part2b.js (was SECTION 2, lines 191–546 of v0.1.1)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 2: LLMService
  // ============================================================
  //
  // Provider-specific HTTP shaping lives in src/ai/providers/<id>.js.
  // This file holds only provider-agnostic logic: config discovery,
  // default selection, preference persistence, and the picker UI.
  // ============================================================

  window.LLMService = (function() {
    // Helpers resolved lazily at first init() — all defined in core/scp-part1.js
    // (esc, icon, deepClone, syncToTextarea, render) or in scp-part2b.js
    // (updateAIStatusIndicator). Lazy resolution lets this file load before
    // scp-part2b.js while still picking up its updateAIStatusIndicator.
    var S, esc, icon, deepClone, syncToTextarea, render, updateAIStatusIndicator;

    function _resolveHelpers() {
      S = window._scpState;
      esc = window._scpEsc;
      icon = window._scpIcon;
      deepClone = window._scpDeepClone;
      syncToTextarea = window._scpSyncToTextarea;
      render = window._scpRender;
      updateAIStatusIndicator = window._scpUpdateAIStatusIndicator || function() {};
    }

    var _config = null, _providerMap = {}, _initialized = false;

    function init() {
      _resolveHelpers();
      _config = null; _providerMap = {};
      var raw = null;

      // --- Source 1: Brand-level LLM config div ---
      var $brand = $('.llm-brand-config-data');
      if ($brand.length) {
        console.log('[SCP] LLMService: .llm-brand-config-data found (' + $brand.text().trim().length + ' chars)');
        try { raw = JSON.parse($brand.text().trim()); console.log('[SCP] LLMService: Brand config parsed OK'); }
        catch(e) { console.warn('[SCP] LLMService: Brand config parse failed:', e.message); }
      } else {
        console.log('[SCP] LLMService: .llm-brand-config-data not found');
      }

      // --- Source 2: User-level LLM config div ---
      var $user = $('.llm-config-data');
      if (!raw && $user.length) {
        console.log('[SCP] LLMService: .llm-config-data found (' + $user.text().trim().length + ' chars)');
        try { raw = JSON.parse($user.text().trim()); console.log('[SCP] LLMService: User config parsed OK'); }
        catch(e) { console.warn('[SCP] LLMService: User config parse failed:', e.message); }
      }

      // --- Source 3: Try data attribute on config divs (some Drupal setups use data-*) ---
      if (!raw) {
        var $dataAttr = $('[data-llm-config]');
        if ($dataAttr.length) {
          try { raw = JSON.parse($dataAttr.attr('data-llm-config')); console.log('[SCP] LLMService: data-llm-config attribute parsed OK'); }
          catch(e) { /* silent */ }
        }
      }

      // --- Source 4: Try script tags with type="application/json" that contain LLM config ---
      if (!raw) {
        $('script[type="application/json"]').each(function() {
          if (raw) return;
          try {
            var parsed = JSON.parse($(this).text().trim());
            if (parsed && parsed.providers && Array.isArray(parsed.providers)) {
              raw = parsed;
              console.log('[SCP] LLMService: Found config in <script type="application/json"> tag');
            }
          } catch(e) { /* not this one, try next */ }
        });
      }

      // --- Source 5: Try inside #guau-userdata or other common Drupal wrapper divs ---
      if (!raw) {
        var altSelectors = ['#guau-userdata .llm-config-data', '#block-content .llm-config-data', '.region-content .llm-config-data', '.layout-content .llm-config-data', '.node__content .llm-config-data'];
        for (var asi = 0; asi < altSelectors.length; asi++) {
          var $alt = $(altSelectors[asi]);
          if ($alt.length) {
            try { raw = JSON.parse($alt.text().trim()); console.log('[SCP] LLMService: Found config via ' + altSelectors[asi]); break; }
            catch(e) { /* try next */ }
          }
        }
      }

      if (!raw) {
        console.warn('[SCP] LLMService: No config found on initial scan — will retry in 2s. Ensure .llm-config-data or .llm-brand-config-data div is on the page.');
        // Schedule a retry — Drupal AJAX may not have rendered the div yet
        setTimeout(function() { _retryInit(); }, 2000);
      } else {
        _processConfig(raw);
      }
    }

    function _retryInit() {
      var raw = null;
      var selectors = ['.llm-brand-config-data', '.llm-config-data', '[data-llm-config]'];
      for (var i = 0; i < selectors.length; i++) {
        var $el = $(selectors[i]);
        if ($el.length) {
          try {
            raw = selectors[i] === '[data-llm-config]' ? JSON.parse($el.attr('data-llm-config')) : JSON.parse($el.text().trim());
            if (raw) { console.log('[SCP] LLMService: Retry found config via ' + selectors[i]); break; }
          } catch(e) { /* continue */ }
        }
      }
      if (raw) {
        _processConfig(raw);
        // Re-render UI now that AI is available
        updateAIStatusIndicator();
        if (render) render();
      } else {
        console.warn('[SCP] LLMService: Retry also found no config — AI features will be unavailable.');
      }
    }

    function _processConfig(raw) {
      _config = raw;
      if (_config && _config.providers) {
        for (var i = 0; i < _config.providers.length; i++) {
          var p = _config.providers[i];
          if (!p.active) { console.log('[SCP] LLMService: Provider "' + p.id + '" skipped (inactive)'); continue; }
          var activeModels = (p.models || []).filter(function(m) { return m.active; });
          if (!activeModels.length) { console.log('[SCP] LLMService: Provider "' + p.id + '" skipped (no active models)'); continue; }
          _providerMap[p.id] = { id: p.id, label: p.label || p.id, api_key: p.api_key || '', activeModels: activeModels };
          console.log('[SCP] LLMService: Provider "' + p.label + '" → ' + activeModels.length + ' model(s): ' + activeModels.map(function(m) { return m.label || m.id; }).join(', '));
        }
      }
      _initialized = true;
      var pids = Object.keys(_providerMap);
      if (pids.length > 0) {
        var def = getDefault();
        console.log('[SCP] LLMService: ' + pids.length + ' active provider(s). Default: ' + (def ? def.provider + '/' + def.model : 'none'));
      } else {
        console.warn('[SCP] LLMService: No active providers — all AI features will show "Not configured"');
      }
    }

    function isConfigured() { return Object.keys(_providerMap).length > 0; }
    function getActiveProviders() { return Object.keys(_providerMap).map(function(id) { return _providerMap[id]; }); }
    function getActiveModels(providerId) { var p = _providerMap[providerId]; return p ? p.activeModels : []; }

    function _getModelObj(pid, mid) { var p = _providerMap[pid]; if (!p) return null; for (var i = 0; i < p.activeModels.length; i++) { if (p.activeModels[i].id === mid) return p.activeModels[i]; } return null; }
    function _buildSel(pid, model) { return { provider: pid, model: model.id, temperature: model.temperature !== undefined ? model.temperature : 1.0, max_tokens: model.max_tokens || 8192, top_p: model.top_p !== undefined ? model.top_p : 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' }; }

    function getDefault() {
      var provs = getActiveProviders(); if (!provs.length) return null;

      // Priority 1: User's explicit app default (from Settings > AI)
      var appDef = S && S.meta && S.meta.aiPreferences && S.meta.aiPreferences.appDefault;
      if (appDef && appDef.provider && appDef.model) {
        var ma = _getModelObj(appDef.provider, appDef.model);
        if (ma) return _buildSel(appDef.provider, ma);
      }

      // Priority 2: Config-level default (from LLM config JSON)
      if (_config && _config.default_provider && _config.default_model) {
        var m = _getModelObj(_config.default_provider, _config.default_model);
        if (m) return _buildSel(_config.default_provider, m);
      }

      // Priority 3: Smart fallback — prefer Gemini 2.5 Flash > Gemini 2.0 Flash > any Gemini > first provider
      var preferredModels = ['gemini-2.5-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      var geminiProvider = _providerMap['gemini'];
      if (geminiProvider) {
        for (var pi = 0; pi < preferredModels.length; pi++) {
          var prefM = _getModelObj('gemini', preferredModels[pi]);
          if (prefM) return _buildSel('gemini', prefM);
        }
        // Any Gemini model with "flash" in its id
        for (var fi = 0; fi < geminiProvider.activeModels.length; fi++) {
          if (geminiProvider.activeModels[fi].id.indexOf('flash') > -1) return _buildSel('gemini', geminiProvider.activeModels[fi]);
        }
      }

      // Priority 4: First provider's default model or first model
      var p = provs[0]; var defM = null;
      for (var i = 0; i < p.activeModels.length; i++) {
        if (p.activeModels[i].is_default) { defM = p.activeModels[i]; break; }
      }
      return _buildSel(p.id, defM || p.activeModels[0]);
    }

    function resolveSelection(actionId) {
      var prefs = S.meta.aiPreferences || {};
      var pa = (prefs.perAction || {})[actionId || ''];
      if (pa && pa.provider && pa.model) { var m = _getModelObj(pa.provider, pa.model); if (m) return _buildSel(pa.provider, m); }
      if (prefs.lastProvider && prefs.lastModel) { var m2 = _getModelObj(prefs.lastProvider, prefs.lastModel); if (m2) return _buildSel(prefs.lastProvider, m2); }
      return getDefault();
    }

    function savePreference(actionId, pid, mid) {
      S.meta.aiPreferences = S.meta.aiPreferences || {}; S.meta.aiPreferences.perAction = S.meta.aiPreferences.perAction || {};
      S.meta.aiPreferences.lastProvider = pid; S.meta.aiPreferences.lastModel = mid;
      if (actionId) S.meta.aiPreferences.perAction[actionId] = { provider: pid, model: mid };
      // If this is the app-default action, also save to appDefault
      if (actionId === 'app-default') {
        S.meta.aiPreferences.appDefault = { provider: pid, model: mid };
      }
      syncToTextarea();
      // Update header indicator to reflect latest selection
      updateAIStatusIndicator();
    }

    function renderInlinePicker(actionId) {
      if (!isConfigured()) return '<span class="scp-ai-not-configured" title="Configure AI providers in your user profile → LLM Config field">' + icon('warning') + ' <a href="#" data-action="go-view" data-view="settings" data-tab="ai" class="scp-ai-config-link">Configure AI</a></span>';
      var sel = resolveSelection(actionId); var provs = getActiveProviders();
      var html = '<span class="scp-ai-picker" data-action-id="' + esc(actionId) + '">';
      html += '<select class="scp-select scp-select-sm scp-ai-provider-select" data-action-id="' + esc(actionId) + '">';
      for (var i = 0; i < provs.length; i++) html += '<option value="' + esc(provs[i].id) + '"' + (sel && sel.provider === provs[i].id ? ' selected' : '') + '>' + esc(provs[i].label) + '</option>';
      html += '</select>';
      var curProv = sel ? _providerMap[sel.provider] : provs[0]; var models = curProv ? curProv.activeModels : [];
      html += '<select class="scp-select scp-select-sm scp-ai-model-select" data-action-id="' + esc(actionId) + '">';
      for (var j = 0; j < models.length; j++) html += '<option value="' + esc(models[j].id) + '"' + (sel && sel.model === models[j].id ? ' selected' : '') + ' data-temp="' + (models[j].temperature !== undefined ? models[j].temperature : 1.0) + '" data-tokens="' + (models[j].max_tokens || 8192) + '">' + esc(models[j].label) + '</option>';
      html += '</select></span>';
      return html;
    }

    function _getPickerSel(actionId) {
      var $p = $('.scp-ai-provider-select[data-action-id="' + actionId + '"]');
      if (!$p.length) return resolveSelection(actionId);
      var pid = $p.val(), mid = $('.scp-ai-model-select[data-action-id="' + actionId + '"]').val();
      var $opt = $('.scp-ai-model-select[data-action-id="' + actionId + '"] option:selected');
      return { provider: pid, model: mid, temperature: parseFloat($opt.data('temp')) || 1.0, max_tokens: parseInt($opt.data('tokens'), 10) || 8192, top_p: 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' };
    }

    function callAI(prompt, onSuccess, onError, actionId, systemPrompt) {
      var cfg = _getPickerSel(actionId || '');
      if (!cfg || !cfg.api_key) { if (onError) onError('No AI providers configured.'); return; }
      var adapter = window._scpAIProviders && window._scpAIProviders[cfg.provider];
      if (!adapter) { if (onError) onError('Unknown provider: ' + cfg.provider); return; }

      var req = adapter.buildRequest(prompt, cfg, systemPrompt || '');
      fetch(req.endpoint, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) })
        .then(function(res) { if (!res.ok) return res.text().then(function(t) { var m = 'API ' + res.status; try { m = JSON.parse(t).error.message || m; } catch(e) {} throw new Error(m); }); return res.json(); })
        .then(function(data) {
          var text;
          try { text = adapter.parseResponse(data); }
          catch(e) { text = JSON.stringify(data); }
          console.log('[SCP] AI (' + cfg.provider + '/' + cfg.model + '):', text.substring(0, 200));
          if (actionId) savePreference(actionId, cfg.provider, cfg.model);
          if (onSuccess) onSuccess(text);
        })
        .catch(function(err) { console.error('[SCP] AI error:', err); if (onError) onError(err.message || 'Request failed'); });
    }

    /**
     * Returns detailed info about a provider including masked key and all models.
     */
    function getProviderInfo(pid) {
      var p = _providerMap[pid]; if (!p) return null;
      var key = p.api_key || '';
      var maskedKey = key.length > 8 ? key.substring(0, 4) + '••••' + key.substring(key.length - 4) : (key ? '••••••••' : '');
      return {
        id: p.id, label: p.label, maskedKey: maskedKey, hasKey: !!key,
        modelCount: p.activeModels.length,
        models: p.activeModels.map(function(m) {
          return { id: m.id, label: m.label || m.id, temperature: m.temperature, max_tokens: m.max_tokens || 8192, is_default: !!m.is_default };
        })
      };
    }

    /**
     * Returns raw config for inspection (read-only).
     */
    function getRawConfig() { return _config ? deepClone(_config) : null; }

    /**
     * Total count of all active providers.
     */
    function getProviderCount() { return Object.keys(_providerMap).length; }

    /**
     * Total count of all active models across all providers.
     */
    function getTotalModelCount() {
      var count = 0;
      for (var pid in _providerMap) count += _providerMap[pid].activeModels.length;
      return count;
    }

    /**
     * Re-scan the page for LLM config divs. Used when user clicks "Re-scan" button.
     */
    function rescanConfig() {
      console.log('[SCP] LLMService: Manual re-scan triggered');
      _providerMap = {}; _config = null; _initialized = false;
      init();
      // Return whether config was found
      return isConfigured();
    }

    /**
     * Test a specific provider by ID with a simple prompt.
     * callback(success: bool, message: string, responseTime: number)
     */
    function testProvider(pid, callback) {
      var p = _providerMap[pid];
      if (!p || !p.api_key) { if (callback) callback(false, 'No API key', 0); return; }
      var model = p.activeModels[0];
      if (!model) { if (callback) callback(false, 'No models', 0); return; }
      var adapter = window._scpAIProviders && window._scpAIProviders[pid];
      if (!adapter || !adapter.buildTestRequest) { if (callback) callback(false, 'Unknown provider', 0); return; }

      var startTime = Date.now();
      var req = adapter.buildTestRequest(model, p.api_key);
      fetch(req.endpoint, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) })
        .then(function(res) {
          var elapsed = Date.now() - startTime;
          if (!res.ok) return res.text().then(function(t) { var msg = 'HTTP ' + res.status; try { msg = JSON.parse(t).error.message || msg; } catch(e) {} if (callback) callback(false, msg, elapsed); });
          return res.json().then(function() { if (callback) callback(true, 'OK (' + elapsed + 'ms)', elapsed); });
        })
        .catch(function(err) { var elapsed = Date.now() - startTime; if (callback) callback(false, err.message || 'Network error', elapsed); });
    }

    return {
      init: init, isConfigured: isConfigured,
      getActiveProviders: getActiveProviders, getActiveModels: getActiveModels,
      getDefault: getDefault, resolveSelection: resolveSelection,
      savePreference: savePreference, renderInlinePicker: renderInlinePicker, callAI: callAI,
      // Phase 3 additions
      getProviderInfo: getProviderInfo, getRawConfig: getRawConfig,
      getProviderCount: getProviderCount, getTotalModelCount: getTotalModelCount,
      rescanConfig: rescanConfig, testProvider: testProvider
    };
  })();

})(jQuery);
