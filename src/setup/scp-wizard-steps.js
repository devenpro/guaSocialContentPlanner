/**
 * @category    setup
 * @purpose     Setup-wizard Stages 1–4 renderers + finish-time flusher.
 *              Self-registers into the shell via _scpRegisterWizardStage
 *              and _scpRegisterWizardFlush.
 *
 *   Stage 1 — Welcome & brand attributes
 *   Stage 2 — Topics (accumulating, multi-select)
 *   Stage 3 — Series (uses selected topics)
 *   Stage 4 — Post Planning (research by series or topic, accumulating)
 *
 * Each AI-driven stage shares a "research panel" component:
 *   brief textarea + provider/model picker + Run button + error line.
 *
 *   Stage   brief field     loading flag       error field
 *   1       stage1Brief     stage1Loading      stage1Error
 *   2       stage2Brief     topicsLoading      topicsError
 *   3       stage3Brief     seriesLoading      seriesError
 *   4       stage4Brief     postsLoading       postsError
 *
 * @depends-on  window._scpWizard, window._scpState, window._scpEsc,
 *              window._scpIcon, window._scpToast, window._scpGenerateId,
 *              window._scpAIHelpers (parseJSON), window.LLMService,
 *              window.BrandService, window._scpAiSel, window._scpConstants,
 *              window._scpLogActivity
 */
(function($) {
  'use strict';

  var TOPIC_COLORS  = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
  var SERIES_COLORS = ['#4c6ef5', '#9333ea', '#059669', '#dc2626', '#0891b2', '#d97706', '#be185d', '#475569'];
  var POST_TYPES_LIST = ['image', 'carousel', 'video', 'text'];

  var S, esc, icon, toast, generateId, parseJSON, LLMService, BrandService;
  var Constants, logActivity;
  var ready = false;

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._scpWizard && window._scpState && window._scpState.initialized) {
      clearInterval(checkInterval);
      initSteps();
    } else if (_checkCount > 100) {
      clearInterval(checkInterval);
      console.error('[SCP] Wizard steps: timed out waiting for shell');
    }
  }, 100);

  function initSteps() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    toast = window._scpToast;
    generateId = window._scpGenerateId;
    parseJSON = (window._scpAIHelpers && window._scpAIHelpers.parseJSON) || JSON.parse;
    LLMService = window.LLMService;
    BrandService = window.BrandService;
    Constants = window._scpConstants;
    logActivity = window._scpLogActivity;
    ready = true;

    window._scpRegisterWizardStage(1, renderStage1, validateStage1);
    window._scpRegisterWizardStage(2, renderStage2Topics, validateStage2Topics);
    window._scpRegisterWizardStage(3, renderStage3Series, validateStage3Series);
    window._scpRegisterWizardStage(4, renderStage4Posts, validateStage4Posts);
    window._scpRegisterWizardFlush(flushSetup);
    setupEvents();
    console.log('[SCP] Wizard stages 1–4 registered');
  }

  function refresh() { if (window._scpRenderWizard) window._scpRenderWizard(); }
  function isAIReady() { return LLMService && LLMService.isConfigured && LLMService.isConfigured(); }

  function genTempId(prefix) {
    return 'tmp_' + prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ============================================================
  // Reusable: research panel — two-row "AI workspace" block
  //   row 1: title + helper + brief textarea
  //   row 2: provider/model picker (left) + Run button (right)
  // Loading: card gets primary-tinted left accent + Run shows spinner.
  // Error:   inline pill below the controls row.
  // ============================================================
  function renderResearchPanel(opts) {
    var loadingCls = opts.loading ? ' scp-wiz-research-loading' : '';
    var html = '<section class="scp-wiz-research' + loadingCls + '" aria-busy="' + (opts.loading ? 'true' : 'false') + '">';

    // Row 1 — title + helper + textarea
    html += '<div class="scp-wiz-research-row scp-wiz-research-row-prompt">';
    html += '<header class="scp-wiz-research-head">';
    html += '<span class="scp-wiz-research-icon">' + icon('sparkles') + '</span>';
    html += '<div class="scp-wiz-research-headtext">';
    html += '<h3 class="scp-wiz-research-title">' + esc(opts.label || 'Brief for the AI') + '</h3>';
    if (opts.helpText) html += '<p class="scp-wiz-research-help">' + esc(opts.helpText) + '</p>';
    html += '</div></header>';
    html += '<textarea class="scp-wiz-brief" data-brief-field="' + esc(opts.briefField) + '" rows="3" placeholder="' + esc(opts.placeholder || 'Tell the AI what you want — context, constraints, examples…') + '">' + esc(opts.briefValue || '') + '</textarea>';
    html += '</div>';

    // Row 2 — picker + Run
    html += '<div class="scp-wiz-research-row scp-wiz-research-row-controls">';
    if (isAIReady()) {
      html += '<div class="scp-wiz-research-picker">' + (window._scpAiSel ? window._scpAiSel(opts.actionId) : '') + '</div>';
      var disabled = opts.loading ? ' disabled' : '';
      html += '<button class="scp-btn scp-btn-primary scp-wiz-run-btn" data-action="' + esc(opts.runActionAttr) + '"' + disabled + '>';
      html += '<span class="scp-wiz-run-icon">' + icon(opts.loading ? 'spinner' : 'sparkles') + '</span>';
      html += '<span class="scp-wiz-run-label">' + esc(opts.loading ? 'Generating…' : (opts.runLabel || 'Run AI')) + '</span>';
      html += '</button>';
    } else {
      html += '<div class="scp-wiz-research-disabled">' + icon('warning') + ' AI not configured — add manually below or set up providers in Settings.</div>';
    }
    html += '</div>';

    if (opts.lastError) {
      html += '<div class="scp-wiz-error" role="alert">';
      html += '<span class="scp-wiz-error-icon">' + icon('warning') + '</span>';
      html += '<span class="scp-wiz-error-text">' + esc(opts.lastError) + '</span>';
      html += '</div>';
    }
    html += '</section>';
    return html;
  }

  // List header used by Topics / Series / Posts.
  function renderListHeader(opts) {
    var html = '<div class="scp-wiz-list-header">';
    html += '<div class="scp-wiz-list-headline">';
    html += '<span class="scp-wiz-count-badge">' + opts.total + ' ' + esc(opts.noun) + (opts.total === 1 ? '' : 's') + '</span>';
    html += '<span class="scp-wiz-count-sep">·</span>';
    html += '<span class="scp-wiz-count-selected">' + opts.selected + ' selected</span>';
    html += '</div>';
    html += '<div class="scp-wiz-list-actions">';
    html += '<button class="scp-btn-link scp-wiz-link" data-action="' + esc(opts.toggleAllAction) + '" data-on="1">Select all</button>';
    html += '<span class="scp-wiz-link-sep">·</span>';
    html += '<button class="scp-btn-link scp-wiz-link" data-action="' + esc(opts.toggleAllAction) + '" data-on="0">Deselect all</button>';
    html += '<button class="scp-btn scp-btn-outline scp-btn-sm scp-wiz-add-btn" data-action="' + esc(opts.addAction) + '">' + icon('plus') + ' Add manually</button>';
    html += '</div></div>';
    return html;
  }

  // Empty state (matches app's .scp-empty-state pattern).
  function renderEmptyState(opts) {
    var html = '<div class="scp-wiz-empty">';
    html += '<div class="scp-wiz-empty-icon">' + icon(opts.icon || 'flask') + '</div>';
    html += '<h4 class="scp-wiz-empty-title">' + esc(opts.title) + '</h4>';
    if (opts.text) html += '<p class="scp-wiz-empty-text">' + esc(opts.text) + '</p>';
    if (opts.ctaLabel && opts.ctaAction) {
      html += '<button class="scp-btn scp-btn-primary scp-btn-sm scp-wiz-empty-cta" data-action="' + esc(opts.ctaAction) + '">' + icon('sparkles') + ' ' + esc(opts.ctaLabel) + '</button>';
    }
    html += '</div>';
    return html;
  }

  // Skeleton card stack — rendered while an AI Run is in flight.
  function renderSkeletonCards(count) {
    var n = Math.max(1, count || 3);
    var html = '<div class="scp-wiz-skeleton-stack" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      html += '<div class="scp-wiz-skeleton-card">';
      html += '<div class="scp-wiz-skeleton-edge"></div>';
      html += '<div class="scp-wiz-skeleton-body">';
      html += '<div class="scp-wiz-skeleton-bar scp-wiz-skeleton-bar-title"></div>';
      html += '<div class="scp-wiz-skeleton-bar scp-wiz-skeleton-bar-text"></div>';
      html += '<div class="scp-wiz-skeleton-bar scp-wiz-skeleton-bar-text scp-wiz-skeleton-bar-short"></div>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function renderBrandContextCard() {
    var brand = S.brand || {};
    if (!brand.configured) return '';
    var identity = brand.identity || {};
    var core = brand.core || {};
    var design = (brand.design || {});
    var colours = design.colors || identity.colors || [];

    var html = '<aside class="scp-wiz-brand-card" aria-label="Brand context summary">';
    html += '<div class="scp-wiz-brand-card-head">';
    if (identity.logoUrl) {
      html += '<img class="scp-wiz-brand-card-logo" src="' + esc(identity.logoUrl) + '" alt="">';
    } else {
      html += '<div class="scp-wiz-brand-card-logo scp-wiz-brand-card-logo-placeholder">' + icon('shapes') + '</div>';
    }
    html += '<div class="scp-wiz-brand-card-titles">';
    html += '<div class="scp-wiz-brand-card-name">' + esc(core.brand_name || identity.name || 'Brand') + '</div>';
    if (core.industry) html += '<div class="scp-wiz-brand-card-industry">' + esc(core.industry) + '</div>';
    html += '</div>';
    html += '<span class="scp-wiz-brand-card-pill">' + icon('check') + ' Connected</span>';
    html += '</div>';

    if (core.brand_description || core.tagline) {
      html += '<p class="scp-wiz-brand-card-desc">' + esc(core.brand_description || core.tagline) + '</p>';
    }

    if (Array.isArray(colours) && colours.length) {
      html += '<div class="scp-wiz-brand-card-colors" aria-label="Brand colours">';
      for (var ci = 0; ci < colours.length && ci < 6; ci++) {
        var c = typeof colours[ci] === 'string' ? colours[ci] : (colours[ci] && colours[ci].value);
        if (!c) continue;
        html += '<span class="scp-wiz-brand-card-swatch" style="background:' + esc(c) + '" title="' + esc(c) + '"></span>';
      }
      html += '</div>';
    }

    html += '<div class="scp-wiz-brand-card-foot">' + icon('sparkles') + ' Brand context is sent to the AI on every Run for this setup.</div>';
    html += '</aside>';
    return html;
  }

  // Small badge rendered next to AI-filled fields on Stage 1.
  function aiFilledBadge() {
    return '<span class="scp-wiz-ai-badge">' + icon('sparkles') + ' AI-filled</span>';
  }

  function brandContextSnippet() {
    if (!BrandService || !BrandService.isConfigured()) return '';
    return BrandService.getSystemPrompt('social') || '';
  }

  // ============================================================
  // STAGE 1 — Welcome & brand attributes
  // ============================================================
  function renderStage1(w) {
    var d = w.data.workspace;
    var u = w.uiState;
    var PLATFORMS = (Constants && Constants.PLATFORMS) || {};
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    var AUD_MAX = 240;
    var audLen = (d.audienceDescription || '').length;

    var html = '<div class="scp-wizard-step-content">';
    html += renderBrandContextCard();

    // ── Workspace basics ─────────────────────────────────────────
    html += '<section class="scp-wiz-section">';
    html += '<header class="scp-wiz-section-head">';
    html += '<h3 class="scp-wiz-section-title">' + icon('briefcase') + ' Workspace basics</h3>';
    html += '<p class="scp-wiz-section-sub">Pre-filled from your brand profile when available. Both are required.</p>';
    html += '</header>';
    html += '<div class="scp-wiz-formgrid">';
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label"><label for="scp-wiz-ws-name">Workspace name</label><span class="scp-wiz-required-pill">Required</span></div>';
    html += '<input id="scp-wiz-ws-name" type="text" class="scp-input scp-wiz-ws-field" data-field="name" value="' + esc(d.name || '') + '" placeholder="e.g. Acme Coffee Co.">';
    html += '</div>';
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label"><label for="scp-wiz-ws-niche">Niche / focus</label><span class="scp-wiz-required-pill">Required</span></div>';
    html += '<input id="scp-wiz-ws-niche" type="text" class="scp-input scp-wiz-ws-field" data-field="niche" value="' + esc(d.niche || '') + '" placeholder="e.g. B2B SaaS for marketers">';
    html += '</div>';
    html += '</div></section>';

    // ── Research panel ───────────────────────────────────────────
    html += renderResearchPanel({
      label: 'Brief for the AI',
      briefField: 'stage1Brief',
      briefValue: w.data.stage1Brief,
      actionId: 'setup_wizard_stage1',
      runActionAttr: 'wiz-run-stage1',
      runLabel: 'Discover with AI',
      loading: u.stage1Loading,
      lastError: u.stage1Error,
      helpText: 'Describe your goals, audience, vibe, or anything you\'d tell a strategist on day one. Combined with your brand context, the AI will fill the fields below.',
      placeholder: 'e.g. Helping early-career data engineers grow on LinkedIn. Smart, contrarian, lots of code snippets, posting Mon/Wed/Fri.'
    });

    // ── AI-discovered fields ────────────────────────────────────
    html += '<section class="scp-wiz-section scp-wiz-discovered">';
    html += '<header class="scp-wiz-section-head">';
    html += '<h3 class="scp-wiz-section-title">' + icon('sparkles') + ' AI-discovered</h3>';
    html += '<p class="scp-wiz-section-sub">Edit anything — these become the defaults for every new post.</p>';
    html += '</header>';

    // Primary platforms
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label>Primary platforms</label>';
    if ((d.primaryPlatforms || []).length) html += aiFilledBadge();
    html += '</div>';
    html += '<p class="scp-wiz-field-help">Where this brand should focus first. 1-2 typically.</p>';
    html += '<div class="scp-wiz-platform-grid">';
    for (var pk in PLATFORMS) {
      var pl = PLATFORMS[pk];
      var isP = (d.primaryPlatforms || []).indexOf(pk) > -1;
      html += '<label class="scp-wiz-platform-chip' + (isP ? ' scp-wiz-platform-chip-active' : '') + '" style="--chip-color:' + pl.color + '">';
      html += '<input type="checkbox" class="scp-wiz-platform-toggle" data-platform-tier="primary" data-platform="' + pk + '"' + (isP ? ' checked' : '') + '>';
      html += '<span class="scp-wiz-platform-chip-icon">' + icon(pl.icon) + '</span>';
      html += '<span class="scp-wiz-platform-chip-label">' + esc(pl.label) + '</span>';
      html += '</label>';
    }
    html += '</div></div>';

    // Secondary platforms
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label>Secondary platforms <span class="scp-wiz-meta">optional</span></label>';
    if ((d.secondaryPlatforms || []).length) html += aiFilledBadge();
    html += '</div>';
    html += '<p class="scp-wiz-field-help">Channels you\'ll repurpose into. Disabled chips are already primary.</p>';
    html += '<div class="scp-wiz-platform-grid">';
    for (var pk2 in PLATFORMS) {
      var pl2 = PLATFORMS[pk2];
      var isS = (d.secondaryPlatforms || []).indexOf(pk2) > -1;
      var disabledSec = (d.primaryPlatforms || []).indexOf(pk2) > -1;
      html += '<label class="scp-wiz-platform-chip' + (isS ? ' scp-wiz-platform-chip-active' : '') + (disabledSec ? ' scp-wiz-platform-chip-disabled' : '') + '" style="--chip-color:' + pl2.color + '"' + (disabledSec ? ' title="Already a primary platform"' : '') + '>';
      html += '<input type="checkbox" class="scp-wiz-platform-toggle" data-platform-tier="secondary" data-platform="' + pk2 + '"' + (isS ? ' checked' : '') + (disabledSec ? ' disabled' : '') + '>';
      html += '<span class="scp-wiz-platform-chip-icon">' + icon(pl2.icon) + '</span>';
      html += '<span class="scp-wiz-platform-chip-label">' + esc(pl2.label) + '</span>';
      html += '</label>';
    }
    html += '</div></div>';

    // Posting frequency — button group
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label>Posting frequency</label>';
    if (d.postingFrequency) html += aiFilledBadge();
    html += '</div>';
    html += '<div class="scp-wiz-freq-grid">';
    var freqs = [
      { id: '',         label: 'Not sure', sub: 'Decide later',    iconName: 'clock' },
      { id: 'daily',    label: 'Daily',    sub: '7 posts / week',  iconName: 'bolt' },
      { id: '3x_week',  label: '3× / week',sub: 'Mon · Wed · Fri', iconName: 'calendar' },
      { id: 'weekly',   label: 'Weekly',   sub: '1 post / week',   iconName: 'calendar' },
      { id: '2x_month', label: '2× / month',sub:'Every ~2 weeks',  iconName: 'calendar' },
      { id: 'monthly',  label: 'Monthly',  sub: '1 post / month',  iconName: 'calendar' }
    ];
    for (var fi = 0; fi < freqs.length; fi++) {
      var fq = freqs[fi];
      var fqActive = d.postingFrequency === fq.id;
      html += '<button class="scp-wiz-freq-card' + (fqActive ? ' scp-wiz-freq-card-active' : '') + '" data-action="wiz-set-freq" data-freq="' + esc(fq.id) + '" type="button">';
      html += '<span class="scp-wiz-freq-icon">' + icon(fq.iconName) + '</span>';
      html += '<span class="scp-wiz-freq-label">' + esc(fq.label) + '</span>';
      html += '<span class="scp-wiz-freq-sub">' + esc(fq.sub) + '</span>';
      html += '</button>';
    }
    html += '</div></div>';

    // Tone — card picker
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label>Default tone</label>';
    if (d.toneId) html += aiFilledBadge();
    html += '</div>';
    html += '<p class="scp-wiz-field-help">The voice every new post starts from. Override per-post later.</p>';
    html += '<div class="scp-wiz-tone-grid">';
    // "None" option
    html += '<button class="scp-wiz-tone-card' + (!d.toneId ? ' scp-wiz-tone-card-active' : '') + ' scp-wiz-tone-card-none" data-action="wiz-set-tone" data-tone-id="" type="button">';
    html += '<span class="scp-wiz-tone-name">No default</span>';
    html += '<span class="scp-wiz-tone-desc">Pick per post.</span>';
    html += '</button>';
    for (var ti = 0; ti < tones.length; ti++) {
      var tn = tones[ti];
      var toneActive = d.toneId === tn.id;
      html += '<button class="scp-wiz-tone-card' + (toneActive ? ' scp-wiz-tone-card-active' : '') + '" data-action="wiz-set-tone" data-tone-id="' + esc(tn.id) + '" type="button">';
      html += '<span class="scp-wiz-tone-name">' + esc(tn.name) + '</span>';
      if (tn.description) html += '<span class="scp-wiz-tone-desc">' + esc(tn.description) + '</span>';
      html += '</button>';
    }
    html += '</div></div>';

    // Audience description with char counter
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label for="scp-wiz-ws-audience">Target audience</label>';
    if (d.audienceDescription) html += aiFilledBadge();
    html += '</div>';
    html += '<p class="scp-wiz-field-help">The more specific, the better every AI suggestion downstream.</p>';
    html += '<textarea id="scp-wiz-ws-audience" class="scp-wiz-textarea scp-wiz-ws-field" data-field="audienceDescription" maxlength="' + AUD_MAX + '" rows="3" placeholder="e.g. Marketing managers at 50-500 person SaaS companies who own demand-gen.">' + esc(d.audienceDescription || '') + '</textarea>';
    html += '<div class="scp-wiz-charcount">' + audLen + ' / ' + AUD_MAX + ' chars</div>';
    html += '</div>';

    // Strategy notes
    html += '<div class="scp-wiz-field">';
    html += '<div class="scp-wiz-field-label">';
    html += '<label for="scp-wiz-ws-notes">Strategy notes <span class="scp-wiz-meta">optional</span></label>';
    if (d.notes) html += aiFilledBadge();
    html += '</div>';
    html += '<p class="scp-wiz-field-help">Rationale, reminders, or anything else you want to keep handy on this workspace.</p>';
    html += '<textarea id="scp-wiz-ws-notes" class="scp-wiz-textarea scp-wiz-ws-field" data-field="notes" rows="3" placeholder="">' + esc(d.notes || '') + '</textarea>';
    html += '</div>';

    html += '</section>';
    html += '</div>';
    return html;
  }

  function validateStage1() {
    var w = S.setupWizard;
    var d = w.data.workspace;
    if (!d.name || !d.name.trim()) { toast('Workspace name is required', 'warning'); return false; }
    if (!d.niche || !d.niche.trim()) { toast('Niche / focus is required', 'warning'); return false; }
    return true;
  }

  function runStage1(w) {
    if (!isAIReady()) { toast('AI not configured — fill the fields manually', 'warning'); return; }
    var u = w.uiState;
    if (u.stage1Loading) return;
    u.stage1Loading = true; u.stage1Error = '';
    refresh();

    var d = w.data.workspace;
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    var PLATFORMS = (Constants && Constants.PLATFORMS) || {};
    var platformList = Object.keys(PLATFORMS).map(function(k) { return '- ' + k + ': ' + PLATFORMS[k].label; }).join('\n');
    var toneList = tones.map(function(t) { return '- ' + t.id + ' ("' + t.name + '"): ' + (t.description || ''); }).join('\n');

    var prompt = 'You are advising a brand on social-media setup.\n\n';
    prompt += 'Workspace name: ' + (d.name || '(unnamed)') + '\n';
    prompt += 'Niche / focus: ' + (d.niche || '(general)') + '\n\n';
    prompt += 'User brief:\n' + (w.data.stage1Brief || '(no brief — use brand context only)') + '\n\n';
    prompt += 'Available platform keys (use these EXACT keys):\n' + platformList + '\n\n';
    prompt += 'Available tone ids (pick the closest match):\n' + toneList + '\n\n';
    prompt += 'Suggest:\n';
    prompt += '- primary_platforms: 1-2 keys where this brand should focus first\n';
    prompt += '- secondary_platforms: 0-2 additional keys to repurpose into\n';
    prompt += '- posting_frequency: one of [daily, 3x_week, weekly, 2x_month, monthly]\n';
    prompt += '- tone_id: one id from the tone list above\n';
    prompt += '- audience_description: 1 sentence describing the target audience\n';
    prompt += '- notes: 1-2 sentence rationale a strategist would tell the founder\n\n';
    prompt += 'Respond ONLY as JSON: {"primary_platforms":[...],"secondary_platforms":[...],"posting_frequency":"...","tone_id":"...","audience_description":"...","notes":"..."}';

    LLMService.callAI(prompt, function(text) {
      try {
        var parsed = parseJSON(text);
        if (Array.isArray(parsed.primary_platforms))   d.primaryPlatforms   = filterValidPlatforms(parsed.primary_platforms);
        if (Array.isArray(parsed.secondary_platforms)) d.secondaryPlatforms = filterValidPlatforms(parsed.secondary_platforms).filter(function(k) { return d.primaryPlatforms.indexOf(k) === -1; });
        if (parsed.posting_frequency)    d.postingFrequency    = parsed.posting_frequency;
        if (parsed.tone_id)              d.toneId              = validToneId(parsed.tone_id) ? parsed.tone_id : '';
        if (parsed.audience_description) d.audienceDescription = String(parsed.audience_description);
        if (parsed.notes)                d.notes               = String(parsed.notes);
      } catch (e) {
        u.stage1Error = 'Could not parse AI response — fields kept as-is.';
      }
      u.stage1Loading = false;
      refresh();
    }, function(err) {
      u.stage1Loading = false;
      u.stage1Error = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_stage1', brandContextSnippet());
  }

  function filterValidPlatforms(arr) {
    var PLATFORMS = (Constants && Constants.PLATFORMS) || {};
    return arr.filter(function(k) { return !!PLATFORMS[k]; });
  }
  function validToneId(id) {
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    for (var i = 0; i < tones.length; i++) if (tones[i].id === id) return true;
    return false;
  }

  // ============================================================
  // STAGE 2 — Topics
  // ============================================================
  function renderStage2Topics(w) {
    var u = w.uiState;
    var topics = w.data.topics || [];
    var selectedCount = topics.filter(function(t) { return t.selected; }).length;

    var html = '<div class="scp-wizard-step-content">';

    html += renderResearchPanel({
      label: 'Brief for topic research',
      briefField: 'stage2Brief',
      briefValue: w.data.stage2Brief,
      actionId: 'setup_wizard_topics',
      runActionAttr: 'wiz-run-topics',
      runLabel: topics.length ? 'Suggest more topics' : 'Suggest topics',
      loading: u.topicsLoading,
      lastError: u.topicsError,
      placeholder: 'e.g. Mix of educational tutorials, opinion pieces, and behind-the-scenes. Avoid trends.'
    });

    html += renderListHeader({
      total: topics.length, selected: selectedCount, noun: 'topic',
      toggleAllAction: 'wiz-toggle-all-topics', addAction: 'wiz-add-topic'
    });

    html += '<div class="scp-wiz-suggestions">';
    for (var i = 0; i < topics.length; i++) html += renderTopicCard(topics[i]);
    if (u.topicsLoading) html += renderSkeletonCards(3);
    html += '</div>';
    if (topics.length === 0 && !u.topicsLoading) {
      html += renderEmptyState({
        icon: 'tags',
        title: 'No topics yet',
        text: 'Run the AI above for pillar ideas, or add one manually. Multiple AI runs accumulate — selections persist.',
        ctaLabel: isAIReady() ? 'Suggest topics with AI' : '',
        ctaAction: isAIReady() ? 'wiz-run-topics' : ''
      });
    }

    html += '</div>';
    return html;
  }

  function renderTopicCard(t) {
    var stateCls = t.selected ? ' scp-wiz-card-selected' : ' scp-wiz-card-deselected';
    var html = '<article class="scp-wiz-card scp-wiz-topic-card' + stateCls + '" data-temp-id="' + esc(t.tempId) + '" style="--card-color:' + esc(t.color) + '">';
    html += '<span class="scp-wiz-card-edge" data-action="wiz-cycle-topic-color" title="Click to cycle color"></span>';
    html += '<div class="scp-wiz-card-body">';
    html += '<div class="scp-wiz-card-head">';
    html += '<label class="scp-wiz-card-select" title="Toggle selection"><input type="checkbox" class="scp-wiz-topic-select"' + (t.selected ? ' checked' : '') + '></label>';
    html += '<input type="text" class="scp-input scp-wiz-card-title scp-wiz-topic-field" data-field="name" value="' + esc(t.name) + '" placeholder="Topic name">';
    html += '<div class="scp-wiz-card-actions">';
    html += '<span class="scp-wiz-card-tag scp-wiz-card-tag-' + (t.source === 'manual' ? 'manual' : 'ai') + '">' + (t.source === 'manual' ? 'Manual' : icon('sparkles') + ' AI') + '</span>';
    html += '<button class="scp-btn-icon scp-wiz-card-remove" data-action="wiz-remove-topic" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    html += '<input type="text" class="scp-input scp-wiz-card-desc scp-wiz-topic-field" data-field="description" value="' + esc(t.description || '') + '" placeholder="What this pillar covers in one sentence…">';
    html += '</div></article>';
    return html;
  }

  function validateStage2Topics() {
    var w = S.setupWizard;
    var sel = (w.data.topics || []).filter(function(t) { return t.selected; });
    if (sel.length === 0) {
      return confirm('No topics selected. Continue anyway? You can add them later from the Topics view.');
    }
    return true;
  }

  function runTopics(w) {
    if (!isAIReady()) { toast('AI not configured — add manually', 'warning'); return; }
    var u = w.uiState;
    if (u.topicsLoading) return;
    u.topicsLoading = true; u.topicsError = '';
    refresh();

    var d = w.data.workspace;
    var existingNames = (w.data.topics || []).map(function(t) { return t.name; }).filter(Boolean);
    var prompt = 'Suggest 6 NEW content topics (pillars) for this brand.\n\n';
    prompt += 'Workspace: ' + (d.name || '(unnamed)') + '\n';
    prompt += 'Niche: ' + (d.niche || '(general)') + '\n';
    prompt += 'Audience: ' + (d.audienceDescription || '(general)') + '\n';
    if (w.data.stage2Brief) prompt += '\nUser brief:\n' + w.data.stage2Brief + '\n';
    if (existingNames.length) prompt += '\nDo NOT repeat any of these existing topics:\n- ' + existingNames.join('\n- ') + '\n';
    prompt += '\nFor each topic provide: name (2-4 words), description (one sentence).\n';
    prompt += 'Respond ONLY as JSON: [{"name":"...","description":"..."}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.topics || raw.results || [];
        var existingCount = w.data.topics.length;
        for (var i = 0; i < raw.length; i++) {
          var t = raw[i] || {};
          if (!t.name) continue;
          w.data.topics.push({
            tempId: genTempId('topic'),
            name: String(t.name).trim(),
            description: String(t.description || '').trim(),
            color: TOPIC_COLORS[(existingCount + i) % TOPIC_COLORS.length],
            selected: true,
            source: 'ai'
          });
        }
      } catch (e) {
        u.topicsError = 'Could not parse AI response — try again or add manually.';
      }
      u.topicsLoading = false;
      refresh();
    }, function(err) {
      u.topicsLoading = false;
      u.topicsError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_topics', brandContextSnippet());
  }

  // ============================================================
  // STAGE 3 — Series
  // ============================================================
  function renderStage3Series(w) {
    var u = w.uiState;
    var selectedTopics = (w.data.topics || []).filter(function(t) { return t.selected; });
    var series = w.data.series || [];
    var selectedSeriesCount = series.filter(function(s) { return s.selected; }).length;

    var html = '<div class="scp-wizard-step-content">';

    if (selectedTopics.length === 0) {
      html += renderEmptyState({
        icon: 'layer-group',
        title: 'No selected topics to group',
        text: 'Series are built from the topics you select in Stage 2. Go back to Topics, pick a few, then return here.'
      });
      html += '</div>';
      return html;
    }

    html += '<div class="scp-wiz-context-panel">';
    html += '<div class="scp-wiz-context-panel-head">';
    html += '<span class="scp-wiz-context-panel-icon">' + icon('tags') + '</span>';
    html += '<div class="scp-wiz-context-panel-titles">';
    html += '<div class="scp-wiz-context-panel-title">' + selectedTopics.length + ' topic' + (selectedTopics.length === 1 ? '' : 's') + ' selected from Stage 2</div>';
    html += '<div class="scp-wiz-context-panel-sub">These are the only topics the AI will group into series.</div>';
    html += '</div></div>';
    html += '<div class="scp-wiz-context-chip-row">';
    for (var i = 0; i < selectedTopics.length; i++) {
      var t = selectedTopics[i];
      html += '<span class="scp-wiz-context-chip" style="--chip-color:' + esc(t.color) + '">';
      html += '<span class="scp-wiz-context-chip-dot"></span>' + esc(t.name);
      html += '</span>';
    }
    html += '</div></div>';

    html += renderResearchPanel({
      label: 'Brief for series research',
      briefField: 'stage3Brief',
      briefValue: w.data.stage3Brief,
      actionId: 'setup_wizard_series',
      runActionAttr: 'wiz-run-series',
      runLabel: series.length ? 'Suggest more series' : 'Suggest series',
      loading: u.seriesLoading,
      lastError: u.seriesError,
      placeholder: 'e.g. Group the educational topics into a "Foundations" series, the opinion ones into "Hot takes".'
    });

    html += renderListHeader({
      total: series.length, selected: selectedSeriesCount, noun: 'series',
      toggleAllAction: 'wiz-toggle-all-series', addAction: 'wiz-add-series'
    });

    html += '<div class="scp-wiz-suggestions">';
    for (var s = 0; s < series.length; s++) html += renderSeriesCard(series[s], selectedTopics);
    if (u.seriesLoading) html += renderSkeletonCards(3);
    html += '</div>';
    if (series.length === 0 && !u.seriesLoading) {
      html += renderEmptyState({
        icon: 'layer-group',
        title: 'No series yet',
        text: 'Group your topics into multi-post arcs. Run the AI for suggestions, or add a series manually.',
        ctaLabel: isAIReady() ? 'Suggest series with AI' : '',
        ctaAction: isAIReady() ? 'wiz-run-series' : ''
      });
    }

    html += '</div>';
    return html;
  }

  function renderSeriesCard(s, selectedTopics) {
    var stateCls = s.selected ? ' scp-wiz-card-selected' : ' scp-wiz-card-deselected';
    var pickedCount = (s.topicTempIds || []).filter(function(tid) {
      return selectedTopics.some(function(t) { return t.tempId === tid; });
    }).length;
    var pickedNames = (s.topicTempIds || []).map(function(tid) {
      var t = selectedTopics.find(function(t) { return t.tempId === tid; });
      return t ? t.name : null;
    }).filter(Boolean);

    var html = '<article class="scp-wiz-card scp-wiz-series-card' + stateCls + '" data-temp-id="' + esc(s.tempId) + '" style="--card-color:' + esc(s.color) + '">';
    html += '<span class="scp-wiz-card-edge"></span>';
    html += '<div class="scp-wiz-card-body">';
    html += '<div class="scp-wiz-card-head">';
    html += '<label class="scp-wiz-card-select" title="Toggle selection"><input type="checkbox" class="scp-wiz-series-select"' + (s.selected ? ' checked' : '') + '></label>';
    html += '<span class="scp-wiz-card-leadicon scp-wiz-card-leadicon-filled" aria-hidden="true">' + icon('layer-group') + '</span>';
    html += '<input type="text" class="scp-input scp-wiz-card-title scp-wiz-series-field" data-field="name" value="' + esc(s.name) + '" placeholder="Series name">';
    html += '<div class="scp-wiz-card-actions">';
    html += '<span class="scp-wiz-card-count" title="Topics in this series">' + pickedCount + ' ' + (pickedCount === 1 ? 'topic' : 'topics') + '</span>';
    html += '<span class="scp-wiz-card-tag scp-wiz-card-tag-' + (s.source === 'manual' ? 'manual' : 'ai') + '">' + (s.source === 'manual' ? 'Manual' : icon('sparkles') + ' AI') + '</span>';
    html += '<button class="scp-btn-icon scp-wiz-card-remove" data-action="wiz-remove-series" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    html += '<input type="text" class="scp-input scp-wiz-card-desc scp-wiz-series-field" data-field="description" value="' + esc(s.description || '') + '" placeholder="What ties these posts together…">';

    // AI hint line — show only when AI populated topics for this series
    if (s.source === 'ai' && pickedNames.length) {
      html += '<div class="scp-wiz-series-aihint">';
      html += '<span class="scp-wiz-series-aihint-icon">' + icon('sparkles') + '</span>';
      html += '<span class="scp-wiz-series-aihint-text">AI grouped: ' + esc(pickedNames.slice(0, 4).join(', ')) + (pickedNames.length > 4 ? ' + ' + (pickedNames.length - 4) + ' more' : '') + '</span>';
      html += '</div>';
    }

    html += '<div class="scp-wiz-topic-pickers">';
    html += '<div class="scp-wiz-topic-pickers-label">Topics in this series</div>';
    for (var i = 0; i < selectedTopics.length; i++) {
      var t = selectedTopics[i];
      var on = (s.topicTempIds || []).indexOf(t.tempId) > -1;
      html += '<label class="scp-wiz-topic-picker' + (on ? ' scp-wiz-topic-picker-active' : '') + '" style="--chip-color:' + esc(t.color) + '">';
      html += '<input type="checkbox" class="scp-wiz-series-topic-toggle" data-topic-temp-id="' + esc(t.tempId) + '"' + (on ? ' checked' : '') + '>';
      html += '<span class="scp-wiz-topic-picker-dot"></span>' + esc(t.name);
      html += '</label>';
    }
    html += '</div>';
    html += '</div></article>';
    return html;
  }

  function validateStage3Series() { return true; }

  function runSeries(w) {
    if (!isAIReady()) { toast('AI not configured — add manually', 'warning'); return; }
    var u = w.uiState;
    if (u.seriesLoading) return;
    var selectedTopics = (w.data.topics || []).filter(function(t) { return t.selected; });
    if (selectedTopics.length === 0) { toast('Select at least one topic first', 'warning'); return; }
    u.seriesLoading = true; u.seriesError = '';
    refresh();

    var d = w.data.workspace;
    var topicLines = selectedTopics.map(function(t) { return '- "' + t.name + '" — ' + (t.description || ''); }).join('\n');
    var existingNames = (w.data.series || []).map(function(s) { return s.name; }).filter(Boolean);
    var prompt = 'Group these topics into multi-post content series (arcs).\n\n';
    prompt += 'Brand: ' + (d.name || '(unnamed)') + ' — ' + (d.niche || '(general)') + '\n';
    prompt += 'Audience: ' + (d.audienceDescription || '(general)') + '\n\n';
    prompt += 'Topics to group:\n' + topicLines + '\n';
    if (w.data.stage3Brief) prompt += '\nUser brief:\n' + w.data.stage3Brief + '\n';
    if (existingNames.length) prompt += '\nDo NOT repeat any of these existing series:\n- ' + existingNames.join('\n- ') + '\n';
    prompt += '\nSuggest 2-4 NEW series. Each series bundles 2+ topics. Some topics may stand alone.\n';
    prompt += 'For each series provide: name (3-5 words), description (one sentence), topic_names (array of EXACT topic names from the list above).\n';
    prompt += 'Respond ONLY as JSON: [{"name":"...","description":"...","topic_names":["..."]}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.series || raw.results || [];
        var existingCount = w.data.series.length;
        for (var i = 0; i < raw.length; i++) {
          var entry = raw[i] || {};
          if (!entry.name) continue;
          var topicTempIds = [];
          (entry.topic_names || entry.topics || []).forEach(function(name) {
            var match = findTopicByName(selectedTopics, name);
            if (match) topicTempIds.push(match.tempId);
          });
          w.data.series.push({
            tempId: genTempId('series'),
            name: String(entry.name).trim(),
            description: String(entry.description || '').trim(),
            color: SERIES_COLORS[(existingCount + i) % SERIES_COLORS.length],
            topicTempIds: topicTempIds,
            selected: true,
            source: 'ai'
          });
        }
      } catch (e) {
        u.seriesError = 'Could not parse AI response — try again or add manually.';
      }
      u.seriesLoading = false;
      refresh();
    }, function(err) {
      u.seriesLoading = false;
      u.seriesError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_series', brandContextSnippet());
  }

  function findTopicByName(topics, name) {
    var n = String(name || '').toLowerCase().trim();
    for (var i = 0; i < topics.length; i++) {
      if (String(topics[i].name || '').toLowerCase().trim() === n) return topics[i];
    }
    return null;
  }

  // ============================================================
  // STAGE 4 — Post Planning
  // ============================================================
  function renderStage4Posts(w) {
    var u = w.uiState;
    var selectedSeries = (w.data.series || []).filter(function(s) { return s.selected; });
    var selectedTopics = (w.data.topics || []).filter(function(t) { return t.selected; });
    var posts = w.data.plannedPosts || [];
    var selectedCount = posts.filter(function(p) { return p.selected; }).length;

    if (!w.data.stage4Basis) w.data.stage4Basis = selectedSeries.length ? 'series' : 'topic';
    var basis = w.data.stage4Basis;
    var basisOptions = basis === 'series' ? selectedSeries : selectedTopics;
    if (!w.data.stage4BasisId && basisOptions.length) w.data.stage4BasisId = basisOptions[0].tempId;
    var activeBasis = basisOptions.find(function(o) { return o.tempId === w.data.stage4BasisId; });

    var html = '<div class="scp-wizard-step-content">';

    if (selectedSeries.length === 0 && selectedTopics.length === 0) {
      html += renderEmptyState({
        icon: 'thumbtack',
        title: 'Nothing to research from yet',
        text: 'Post planning needs at least one selected topic or series. Go back to Stage 2 or 3 and pick the ones to seed posts from.'
      });
      html += '</div>';
      return html;
    }

    html += '<div class="scp-wiz-basis-row">';
    html += '<div class="scp-wiz-basis-toggle">';
    html += '<button class="scp-wiz-basis-btn' + (basis === 'series' ? ' scp-wiz-basis-btn-active' : '') + '" data-action="wiz-set-basis" data-basis="series"' + (selectedSeries.length === 0 ? ' disabled' : '') + '>' + icon('layer-group') + ' By series</button>';
    html += '<button class="scp-wiz-basis-btn' + (basis === 'topic'  ? ' scp-wiz-basis-btn-active' : '') + '" data-action="wiz-set-basis" data-basis="topic"' + (selectedTopics.length === 0 ? ' disabled' : '') + '>' + icon('tag') + ' By topic</button>';
    html += '</div>';
    html += '<select class="scp-select scp-wiz-basis-select">';
    for (var i = 0; i < basisOptions.length; i++) {
      var o = basisOptions[i];
      html += '<option value="' + esc(o.tempId) + '"' + (o.tempId === w.data.stage4BasisId ? ' selected' : '') + '>' + esc(o.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    html += renderResearchPanel({
      label: 'Brief for post ideas' + (activeBasis ? ' on "' + activeBasis.name + '"' : ''),
      briefField: 'stage4Brief',
      briefValue: w.data.stage4Brief,
      actionId: 'setup_wizard_posts',
      runActionAttr: 'wiz-run-posts',
      runLabel: posts.length ? 'Suggest more posts' : 'Suggest posts',
      loading: u.postsLoading,
      lastError: u.postsError,
      placeholder: 'e.g. 4 ideas mixing tutorial, contrarian, and behind-the-scenes formats.'
    });

    html += renderListHeader({
      total: posts.length, selected: selectedCount, noun: 'post idea',
      toggleAllAction: 'wiz-toggle-all-posts', addAction: 'wiz-add-post'
    });

    html += '<div class="scp-wiz-suggestions">';
    for (var pi = 0; pi < posts.length; pi++) html += renderPostCard(posts[pi], w);
    if (u.postsLoading) html += renderSkeletonCards(3);
    html += '</div>';
    if (posts.length === 0 && !u.postsLoading) {
      html += renderEmptyState({
        icon: 'thumbtack',
        title: 'No post ideas yet',
        text: 'Run the AI for ideas against the active ' + basis + ', or add a post manually.',
        ctaLabel: isAIReady() ? 'Suggest posts with AI' : '',
        ctaAction: isAIReady() ? 'wiz-run-posts' : ''
      });
    }

    html += '</div>';
    return html;
  }

  function renderPostCard(p, w) {
    var topic = (w.data.topics || []).find(function(t) { return t.tempId === p.topicTempId; });
    var series = (w.data.series || []).find(function(s) { return s.tempId === p.seriesTempId; });
    var stateCls = p.selected ? ' scp-wiz-card-selected' : ' scp-wiz-card-deselected';
    var typeCls  = ' scp-wiz-post-card-' + (p.type || 'image');
    // Card color follows the active basis (series colour preferred).
    var cardColor = (series && series.color) || (topic && topic.color) || '#1a73e8';
    var html = '<article class="scp-wiz-card scp-wiz-post-card' + stateCls + typeCls + '" data-temp-id="' + esc(p.tempId) + '" style="--card-color:' + esc(cardColor) + '">';
    html += '<span class="scp-wiz-card-edge"></span>';
    html += '<div class="scp-wiz-card-body">';
    html += '<div class="scp-wiz-card-head">';
    html += '<label class="scp-wiz-card-select" title="Toggle selection"><input type="checkbox" class="scp-wiz-post-select"' + (p.selected ? ' checked' : '') + '></label>';
    html += '<input type="text" class="scp-input scp-wiz-card-title scp-wiz-post-field" data-field="title" value="' + esc(p.title) + '" placeholder="Working title">';
    html += '<div class="scp-wiz-card-actions">';
    html += '<span class="scp-wiz-card-tag scp-wiz-card-tag-' + (p.source === 'manual' ? 'manual' : 'ai') + '">' + (p.source === 'manual' ? 'Manual' : icon('sparkles') + ' AI') + '</span>';
    html += '<button class="scp-btn-icon scp-wiz-card-remove" data-action="wiz-remove-post" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    html += '<textarea class="scp-wiz-card-hook scp-wiz-post-field" data-field="hook" rows="2" placeholder="Hook — opening line of the post…">' + esc(p.hook || '') + '</textarea>';
    html += '<div class="scp-wiz-post-meta">';
    html += '<select class="scp-select scp-select-sm scp-wiz-post-field scp-wiz-post-type-select" data-field="type">';
    for (var t = 0; t < POST_TYPES_LIST.length; t++) {
      html += '<option value="' + POST_TYPES_LIST[t] + '"' + (p.type === POST_TYPES_LIST[t] ? ' selected' : '') + '>' + POST_TYPES_LIST[t] + '</option>';
    }
    html += '</select>';
    if (topic)  html += '<span class="scp-wiz-context-chip" style="--chip-color:' + esc(topic.color)  + '">' + icon('tag') + ' ' + esc(topic.name) + '</span>';
    if (series) html += '<span class="scp-wiz-context-chip" style="--chip-color:' + esc(series.color) + '">' + icon('layer-group') + ' ' + esc(series.name) + '</span>';
    html += '</div>';
    html += '</div></article>';
    return html;
  }

  function validateStage4Posts() { return true; }

  function runPosts(w) {
    if (!isAIReady()) { toast('AI not configured — add manually', 'warning'); return; }
    var u = w.uiState;
    if (u.postsLoading) return;

    var basis = w.data.stage4Basis;
    var basisOptions = basis === 'series'
      ? (w.data.series || []).filter(function(s) { return s.selected; })
      : (w.data.topics || []).filter(function(t) { return t.selected; });
    var active = basisOptions.find(function(o) { return o.tempId === w.data.stage4BasisId; });
    if (!active) { toast('Pick a ' + basis + ' to research', 'warning'); return; }

    u.postsLoading = true; u.postsError = '';
    refresh();

    var d = w.data.workspace;
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    var tone = tones.find(function(t) { return t.id === d.toneId; });
    var existingTitlesInBasis = (w.data.plannedPosts || [])
      .filter(function(p) { return basis === 'series' ? p.seriesTempId === active.tempId : p.topicTempId === active.tempId; })
      .map(function(p) { return p.title; });

    var prompt = 'Generate 5 NEW post ideas for this brand.\n\n';
    prompt += 'Brand: ' + (d.name || '(unnamed)') + ' — ' + (d.niche || '(general)') + '\n';
    prompt += 'Audience: ' + (d.audienceDescription || '(general)') + '\n';
    if (tone) prompt += 'Tone: ' + tone.name + ' — ' + (tone.description || '') + '\n';
    prompt += '\nResearch basis: ' + basis + ' "' + active.name + '"';
    if (active.description) prompt += ' — ' + active.description;
    prompt += '\n';
    if (w.data.stage4Brief) prompt += '\nUser brief:\n' + w.data.stage4Brief + '\n';
    if (existingTitlesInBasis.length) prompt += '\nDo NOT repeat any of these existing titles for this ' + basis + ':\n- ' + existingTitlesInBasis.join('\n- ') + '\n';
    prompt += '\nFor each idea provide: title (working title — short), hook (opening line of the post), type (one of: image, carousel, video, text).\n';
    prompt += 'Respond ONLY as JSON: [{"title":"...","hook":"...","type":"..."}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.posts || raw.results || [];
        var pinTopicId, pinSeriesId;
        if (basis === 'series') {
          pinSeriesId = active.tempId;
          pinTopicId  = (active.topicTempIds && active.topicTempIds[0]) || '';
        } else {
          pinTopicId  = active.tempId;
          var ownerSeries = (w.data.series || []).find(function(s) { return s.selected && (s.topicTempIds || []).indexOf(active.tempId) > -1; });
          pinSeriesId = ownerSeries ? ownerSeries.tempId : '';
        }
        var primaryPlat = (d.primaryPlatforms && d.primaryPlatforms[0]) || 'linkedin';
        for (var i = 0; i < raw.length; i++) {
          var p = raw[i] || {};
          if (!p.title) continue;
          w.data.plannedPosts.push({
            tempId: genTempId('post'),
            title: String(p.title).trim(),
            hook: String(p.hook || '').trim(),
            type: POST_TYPES_LIST.indexOf(p.type) > -1 ? p.type : 'image',
            topicTempId: pinTopicId,
            seriesTempId: pinSeriesId,
            platform: primaryPlat,
            selected: true,
            source: 'ai'
          });
        }
      } catch (e) {
        u.postsError = 'Could not parse AI response — try again or add manually.';
      }
      u.postsLoading = false;
      refresh();
    }, function(err) {
      u.postsLoading = false;
      u.postsError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_posts', brandContextSnippet());
  }

  // ============================================================
  // FINISH FLUSHER — wizard state → S.data + S.meta
  // ============================================================
  function flushSetup(w) {
    var nowIso = new Date().toISOString();
    var ws = w.data.workspace || {};

    S.meta.workspace = S.meta.workspace || {};
    S.meta.workspace.name                 = (ws.name  || '').trim();
    S.meta.workspace.niche                = (ws.niche || '').trim();
    S.meta.workspace.audience_description = (ws.audienceDescription || '').trim();
    S.meta.workspace.primary_platform     = (ws.primaryPlatforms && ws.primaryPlatforms[0]) || '';
    S.meta.workspace.posting_frequency    = ws.postingFrequency || '';
    if (ws.notes) S.meta.workspace.description = ws.notes;

    if (ws.toneId) {
      S.meta.settings = S.meta.settings || {};
      S.meta.settings.defaults = S.meta.settings.defaults || {};
      S.meta.settings.defaults.tone_id = ws.toneId;
      var defaultPlats = (ws.primaryPlatforms || []).concat((ws.secondaryPlatforms || []).filter(function(k) { return (ws.primaryPlatforms || []).indexOf(k) === -1; }));
      if (defaultPlats.length) S.meta.settings.defaults.platforms = defaultPlats;
    }

    var topicIdMap = {};
    S.data.topics = S.data.topics || [];
    var selectedTopics = (w.data.topics || []).filter(function(t) { return t.selected; });
    for (var ti = 0; ti < selectedTopics.length; ti++) {
      var td = selectedTopics[ti];
      var tid = generateId('topic');
      topicIdMap[td.tempId] = tid;
      S.data.topics.push({
        id: tid,
        name: (td.name || 'Untitled topic').trim(),
        description: (td.description || '').trim(),
        color: td.color || TOPIC_COLORS[ti % TOPIC_COLORS.length],
        seriesId: '',
        created: nowIso
      });
      if (logActivity) logActivity('topic_created', '', '', 'Created topic: ' + td.name);
    }

    var seriesIdMap = {};
    S.data.series = S.data.series || [];
    var selectedSeries = (w.data.series || []).filter(function(s) { return s.selected; });
    for (var si = 0; si < selectedSeries.length; si++) {
      var sd = selectedSeries[si];
      var sid = generateId('series');
      seriesIdMap[sd.tempId] = sid;
      var topicIds = (sd.topicTempIds || []).map(function(t) { return topicIdMap[t]; }).filter(Boolean);
      S.data.series.push({
        id: sid,
        name: (sd.name || 'Untitled series').trim(),
        description: (sd.description || '').trim(),
        color: sd.color || SERIES_COLORS[si % SERIES_COLORS.length],
        topicIds: topicIds,
        created: nowIso
      });
      topicIds.forEach(function(realTopicId) {
        for (var j = 0; j < S.data.topics.length; j++) {
          if (S.data.topics[j].id === realTopicId) { S.data.topics[j].seriesId = sid; break; }
        }
      });
      if (logActivity) logActivity('series_created', '', '', 'Created series: ' + sd.name);
    }

    S.data.posts = S.data.posts || [];
    var defs = (S.meta.settings && S.meta.settings.defaults) || {};
    var selectedPosts = (w.data.plannedPosts || []).filter(function(p) { return p.selected; });
    for (var pi = 0; pi < selectedPosts.length; pi++) {
      var pd = selectedPosts[pi];
      var post = buildSeedPost(pd, topicIdMap, seriesIdMap, ws, defs, nowIso);
      S.data.posts.unshift(post);
      if (logActivity) logActivity('post_created', post.id, post.title, 'Seeded from setup wizard');
    }
  }

  function buildSeedPost(pd, topicIdMap, seriesIdMap, ws, defs, nowIso) {
    var topicId  = topicIdMap[pd.topicTempId]   || '';
    var seriesId = seriesIdMap[pd.seriesTempId] || '';
    var primary  = pd.platform || (ws.primaryPlatforms && ws.primaryPlatforms[0]) || (defs.platforms && defs.platforms[0]) || 'linkedin';
    return {
      id: generateId('post'),
      title: pd.title || 'Untitled',
      type: pd.type || 'image',
      status: 'idea',
      priority: defs.priority || 'medium',
      topics: topicId ? [topicId] : [],
      seriesId: seriesId,
      source: { type: 'setup_wizard', research_session_id: '', research_idea_id: '', notes: 'Seeded from setup wizard' },
      platforms: [primary].concat((ws.secondaryPlatforms || []).filter(function(k) { return k !== primary; })),
      research: { angles: [], selected_angle: '', angle_custom_input: '', hooks: [], selected_hook: pd.hook || '', hook_custom_input: '', notes: '' },
      content: { body: pd.hook || '', tone_id: ws.toneId || defs.tone_id || '', audience_id: defs.audience_id || '', notes: '' },
      carousel: { slide_count: 0, slides: [] },
      video: { concept: '', script: '', duration_seconds: 60, format: 'reel' },
      media: { prompts: [], config: { style_id: '', custom_instructions: '', brand_context_enabled: false } },
      platform_content: {
        linkedin:  { enabled: primary === 'linkedin',  body: '', notes: '' },
        instagram: { enabled: primary === 'instagram', body: '', notes: '' },
        facebook:  { enabled: primary === 'facebook',  body: '', notes: '' },
        youtube:   { enabled: primary === 'youtube',   title: '', description: '', tags: [], notes: '' }
      },
      schedule: { date: '', time: '', timezone: '', published_urls: {} },
      performance: {},
      created_by: (S.user && S.user.id) || '',
      assigned_to: '', review_notes: '',
      created: nowIso, updated: nowIso
    };
  }

  // ============================================================
  // EVENTS
  // ============================================================
  function setupEvents() {
    $(document).off('input.scp-wizbr change.scp-wizbr', '.scp-wiz-brief')
      .on('input.scp-wizbr change.scp-wizbr', '.scp-wiz-brief', function() {
        var w = S.setupWizard;
        var field = $(this).data('brief-field');
        if (field) w.data[field] = $(this).val();
      });

    $(document).off('input.scp-wizws change.scp-wizws', '.scp-wiz-ws-field')
      .on('input.scp-wizws change.scp-wizws', '.scp-wiz-ws-field', function() {
        var w = S.setupWizard;
        var field = $(this).data('field');
        if (field) w.data.workspace[field] = $(this).val();
      });

    $(document).off('change.scp-wizpt', '.scp-wiz-platform-toggle')
      .on('change.scp-wizpt', '.scp-wiz-platform-toggle', function() {
        var w = S.setupWizard;
        var tier = $(this).data('platform-tier');
        var pk = $(this).data('platform');
        var key = tier === 'primary' ? 'primaryPlatforms' : 'secondaryPlatforms';
        w.data.workspace[key] = w.data.workspace[key] || [];
        var idx = w.data.workspace[key].indexOf(pk);
        if (this.checked) {
          if (idx === -1) w.data.workspace[key].push(pk);
          if (tier === 'primary') {
            var sIdx = (w.data.workspace.secondaryPlatforms || []).indexOf(pk);
            if (sIdx > -1) w.data.workspace.secondaryPlatforms.splice(sIdx, 1);
          }
        } else if (idx > -1) {
          w.data.workspace[key].splice(idx, 1);
        }
        refresh();
      });

    // Stage 1 frequency button group
    $(document).off('click.scp-wizfq', '[data-action="wiz-set-freq"]')
      .on('click.scp-wizfq', '[data-action="wiz-set-freq"]', function(e) {
        e.preventDefault();
        S.setupWizard.data.workspace.postingFrequency = $(this).data('freq') || '';
        refresh();
      });

    // Stage 1 tone card picker
    $(document).off('click.scp-wiztn', '[data-action="wiz-set-tone"]')
      .on('click.scp-wiztn', '[data-action="wiz-set-tone"]', function(e) {
        e.preventDefault();
        S.setupWizard.data.workspace.toneId = $(this).data('tone-id') || '';
        refresh();
      });

    // Run buttons
    $(document).off('click.scp-wizr1', '[data-action="wiz-run-stage1"]')
      .on('click.scp-wizr1', '[data-action="wiz-run-stage1"]', function(e) { e.preventDefault(); runStage1(S.setupWizard); });
    $(document).off('click.scp-wizrt', '[data-action="wiz-run-topics"]')
      .on('click.scp-wizrt', '[data-action="wiz-run-topics"]', function(e) { e.preventDefault(); runTopics(S.setupWizard); });
    $(document).off('click.scp-wizrs', '[data-action="wiz-run-series"]')
      .on('click.scp-wizrs', '[data-action="wiz-run-series"]', function(e) { e.preventDefault(); runSeries(S.setupWizard); });
    $(document).off('click.scp-wizrp', '[data-action="wiz-run-posts"]')
      .on('click.scp-wizrp', '[data-action="wiz-run-posts"]', function(e) { e.preventDefault(); runPosts(S.setupWizard); });

    // ---- Topics list ----
    $(document).off('change.scp-wizts', '.scp-wiz-topic-select')
      .on('change.scp-wizts', '.scp-wiz-topic-select', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var checked = this.checked;
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) { w.data.topics[i].selected = checked; break; }
        }
        refresh();
      });
    $(document).off('input.scp-wiztf change.scp-wiztf', '.scp-wiz-topic-field')
      .on('input.scp-wiztf change.scp-wiztf', '.scp-wiz-topic-field', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) { w.data.topics[i][field] = val; break; }
        }
      });
    $(document).off('click.scp-wizat', '[data-action="wiz-add-topic"]')
      .on('click.scp-wizat', '[data-action="wiz-add-topic"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        w.data.topics.push({
          tempId: genTempId('topic'), name: '', description: '',
          color: TOPIC_COLORS[w.data.topics.length % TOPIC_COLORS.length],
          selected: true, source: 'manual'
        });
        refresh();
      });
    $(document).off('click.scp-wizrt2', '[data-action="wiz-remove-topic"]')
      .on('click.scp-wizrt2', '[data-action="wiz-remove-topic"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        w.data.topics = w.data.topics.filter(function(t) { return t.tempId !== tempId; });
        w.data.series.forEach(function(s) {
          s.topicTempIds = (s.topicTempIds || []).filter(function(x) { return x !== tempId; });
        });
        w.data.plannedPosts.forEach(function(p) { if (p.topicTempId === tempId) p.topicTempId = ''; });
        refresh();
      });
    $(document).off('click.scp-wizct', '[data-action="wiz-cycle-topic-color"]')
      .on('click.scp-wizct', '[data-action="wiz-cycle-topic-color"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) {
            var idx = TOPIC_COLORS.indexOf(w.data.topics[i].color);
            w.data.topics[i].color = TOPIC_COLORS[(idx + 1) % TOPIC_COLORS.length];
            break;
          }
        }
        refresh();
      });
    $(document).off('click.scp-wizatt', '[data-action="wiz-toggle-all-topics"]')
      .on('click.scp-wizatt', '[data-action="wiz-toggle-all-topics"]', function(e) {
        e.preventDefault();
        var on = $(this).data('on') === 1 || $(this).data('on') === '1';
        S.setupWizard.data.topics.forEach(function(t) { t.selected = on; });
        refresh();
      });

    // ---- Series list ----
    $(document).off('change.scp-wizss', '.scp-wiz-series-select')
      .on('change.scp-wizss', '.scp-wiz-series-select', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var checked = this.checked;
        for (var i = 0; i < w.data.series.length; i++) {
          if (w.data.series[i].tempId === tempId) { w.data.series[i].selected = checked; break; }
        }
        refresh();
      });
    $(document).off('input.scp-wizsf change.scp-wizsf', '.scp-wiz-series-field')
      .on('input.scp-wizsf change.scp-wizsf', '.scp-wiz-series-field', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        for (var i = 0; i < w.data.series.length; i++) {
          if (w.data.series[i].tempId === tempId) { w.data.series[i][field] = val; break; }
        }
      });
    $(document).off('change.scp-wizstt', '.scp-wiz-series-topic-toggle')
      .on('change.scp-wizstt', '.scp-wiz-series-topic-toggle', function() {
        var w = S.setupWizard;
        var seriesTempId = $(this).closest('[data-temp-id]').data('temp-id');
        var topicTempId = $(this).data('topic-temp-id');
        var checked = this.checked;
        var ser = w.data.series.find(function(s) { return s.tempId === seriesTempId; });
        if (!ser) return;
        ser.topicTempIds = ser.topicTempIds || [];
        var idx = ser.topicTempIds.indexOf(topicTempId);
        if (checked && idx === -1) ser.topicTempIds.push(topicTempId);
        else if (!checked && idx > -1) ser.topicTempIds.splice(idx, 1);
        refresh();
      });
    $(document).off('click.scp-wizas', '[data-action="wiz-add-series"]')
      .on('click.scp-wizas', '[data-action="wiz-add-series"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        w.data.series.push({
          tempId: genTempId('series'), name: '', description: '',
          color: SERIES_COLORS[w.data.series.length % SERIES_COLORS.length],
          topicTempIds: [], selected: true, source: 'manual'
        });
        refresh();
      });
    $(document).off('click.scp-wizrs2', '[data-action="wiz-remove-series"]')
      .on('click.scp-wizrs2', '[data-action="wiz-remove-series"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        w.data.series = w.data.series.filter(function(s) { return s.tempId !== tempId; });
        w.data.plannedPosts.forEach(function(p) { if (p.seriesTempId === tempId) p.seriesTempId = ''; });
        if (w.data.stage4BasisId === tempId) w.data.stage4BasisId = '';
        refresh();
      });
    $(document).off('click.scp-wizats', '[data-action="wiz-toggle-all-series"]')
      .on('click.scp-wizats', '[data-action="wiz-toggle-all-series"]', function(e) {
        e.preventDefault();
        var on = $(this).data('on') === 1 || $(this).data('on') === '1';
        S.setupWizard.data.series.forEach(function(s) { s.selected = on; });
        refresh();
      });

    // ---- Stage 4 basis ----
    $(document).off('click.scp-wizsb', '[data-action="wiz-set-basis"]')
      .on('click.scp-wizsb', '[data-action="wiz-set-basis"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var basis = $(this).data('basis');
        if (w.data.stage4Basis === basis) return;
        w.data.stage4Basis = basis;
        var opts = basis === 'series'
          ? (w.data.series || []).filter(function(s) { return s.selected; })
          : (w.data.topics || []).filter(function(t) { return t.selected; });
        w.data.stage4BasisId = opts.length ? opts[0].tempId : '';
        refresh();
      });
    $(document).off('change.scp-wizbsl', '.scp-wiz-basis-select')
      .on('change.scp-wizbsl', '.scp-wiz-basis-select', function() {
        S.setupWizard.data.stage4BasisId = $(this).val();
        refresh();
      });

    // ---- Posts list ----
    $(document).off('change.scp-wizps', '.scp-wiz-post-select')
      .on('change.scp-wizps', '.scp-wiz-post-select', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var checked = this.checked;
        for (var i = 0; i < w.data.plannedPosts.length; i++) {
          if (w.data.plannedPosts[i].tempId === tempId) { w.data.plannedPosts[i].selected = checked; break; }
        }
        refresh();
      });
    $(document).off('input.scp-wizpf change.scp-wizpf', '.scp-wiz-post-field')
      .on('input.scp-wizpf change.scp-wizpf', '.scp-wiz-post-field', function() {
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        for (var i = 0; i < w.data.plannedPosts.length; i++) {
          if (w.data.plannedPosts[i].tempId === tempId) { w.data.plannedPosts[i][field] = val; break; }
        }
      });
    $(document).off('click.scp-wizap', '[data-action="wiz-add-post"]')
      .on('click.scp-wizap', '[data-action="wiz-add-post"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var basis = w.data.stage4Basis;
        var active = (basis === 'series' ? w.data.series : w.data.topics).find(function(o) { return o.tempId === w.data.stage4BasisId; });
        var pinTopic = '', pinSeries = '';
        if (active) {
          if (basis === 'series') { pinSeries = active.tempId; pinTopic = (active.topicTempIds && active.topicTempIds[0]) || ''; }
          else                    { pinTopic = active.tempId; }
        }
        w.data.plannedPosts.push({
          tempId: genTempId('post'),
          title: '', hook: '', type: 'image',
          topicTempId: pinTopic, seriesTempId: pinSeries,
          platform: (w.data.workspace.primaryPlatforms && w.data.workspace.primaryPlatforms[0]) || 'linkedin',
          selected: true, source: 'manual'
        });
        refresh();
      });
    $(document).off('click.scp-wizrp2', '[data-action="wiz-remove-post"]')
      .on('click.scp-wizrp2', '[data-action="wiz-remove-post"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        w.data.plannedPosts = w.data.plannedPosts.filter(function(p) { return p.tempId !== tempId; });
        refresh();
      });
    $(document).off('click.scp-wizatp', '[data-action="wiz-toggle-all-posts"]')
      .on('click.scp-wizatp', '[data-action="wiz-toggle-all-posts"]', function(e) {
        e.preventDefault();
        var on = $(this).data('on') === 1 || $(this).data('on') === '1';
        S.setupWizard.data.plannedPosts.forEach(function(p) { p.selected = on; });
        refresh();
      });
  }

})(jQuery);
