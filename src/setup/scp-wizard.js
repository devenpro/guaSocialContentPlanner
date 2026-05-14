/**
 * @category    setup
 * @purpose     First-run setup wizard. Three-stage full-page flow:
 *                Stage 1 — Welcome & brand attributes (AI-discovered, editable)
 *                Stage 2 — Topics & Series (sub-stages 'topics' and 'series')
 *                Stage 3 — Post Planning (research by series or topic)
 *              All stages share a research-panel pattern: brief textarea +
 *              provider/model picker + Run button + accumulating list with
 *              per-row select. Data flushes to S.data / S.meta only on Finish.
 *
 * @exports     window._scpWizard
 *                { openWizard, closeWizard, openIfFirstRun,
 *                  goToStage, nextStage, prevStage, skipSetup, finishSetup,
 *                  TOTAL_STAGES, stageMeta }
 *              window._scpRegisterWizardStage(stageNumber, renderFn, validatorFn?)
 *              window._scpRegisterWizardStageEnter(stageNumber, hookFn)
 *              window._scpRegisterWizardFlush(fn)
 *              window._scpRenderWizard()  — re-render trigger for step modules
 *
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpSyncToTextarea, window._scpToast,
 *              window._scpLogActivity, window._scpMarkSetupComplete,
 *              window._scpIsFirstRun, window._scpIsFreshWorkspace,
 *              window._scpConstants, window._scpBuildMaps, window._scpRender
 *
 * Stages self-register via _scpRegisterWizardStage, so the shell stays
 * decoupled from per-stage renderers (which live in scp-wizard-steps.js).
 */
(function($) {
  'use strict';

  var S, esc, icon, syncToTextarea, toast, logActivity, markSetupComplete;
  var Constants;
  var ready = false;

  // Registered stage renderers — { 1: fn, 2: fn, 3: fn }.
  var stageRenderers = {};
  // Optional stage validators — return true to allow advance.
  var stageValidators = {};
  // Finish-time flushers registered by step modules.
  var flushers = [];
  // Stage-bound init hooks: run on entry to a stage.
  var stageEnterHooks = {};
  // Stage metadata: title + short subtitle shown in the stepper.
  var stageMeta = {
    1: { title: 'Welcome',           subtitle: 'Brand & AI-discovered basics' },
    2: { title: 'Topics & Series',   subtitle: 'Pillars and multi-post arcs' },
    3: { title: 'Post Planning',     subtitle: 'Seed your content calendar' }
  };
  var TOTAL_STAGES = 3;

  // ------------------------------------------------------------------
  // BOOT — poll for Part 1 readiness, then auto-open on first run.
  // ------------------------------------------------------------------
  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._scpState && window._scpState.initialized) {
      clearInterval(checkInterval);
      initWizard();
    } else if (_checkCount > 100) {
      clearInterval(checkInterval);
      console.error('[SCP] Wizard: timed out waiting for Part 1');
    }
  }, 100);

  function initWizard() {
    S = window._scpState;
    esc = window._scpEsc;
    icon = window._scpIcon;
    syncToTextarea = window._scpSyncToTextarea;
    toast = window._scpToast;
    logActivity = window._scpLogActivity;
    markSetupComplete = window._scpMarkSetupComplete;
    Constants = window._scpConstants;
    ready = true;
    setupEvents();
    // Defer the auto-open so the main app shell paints first.
    // isFreshWorkspace() is the authoritative signal; firstRun is a
    // belt+suspenders fallback for the Settings → re-run path.
    setTimeout(function() {
      var fresh    = window._scpIsFreshWorkspace && window._scpIsFreshWorkspace();
      var firstRun = window._scpIsFirstRun       && window._scpIsFirstRun();
      if (fresh || firstRun) openWizard();
    }, 50);
    console.log('[SCP] Setup wizard ready');
  }

  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  function ensureWizardState() {
    if (!S.setupWizard) {
      // Prefill workspace name + niche from Drupal brand block when present.
      var brand = S.brand || {};
      var brandIdentity = brand.identity || {};
      var brandCore = brand.core || {};
      var workspaceName  = (S.meta.workspace && S.meta.workspace.name)  || brandCore.brand_name || brandIdentity.name || '';
      var workspaceNiche = (S.meta.workspace && S.meta.workspace.niche) || brandCore.industry   || brandCore.niche    || '';
      S.setupWizard = {
        open: false,
        currentStage: 1,
        stage2Sub: 'topics',
        data: {
          workspace: {
            name: workspaceName,
            niche: workspaceNiche,
            audienceDescription: (S.meta.workspace && S.meta.workspace.audience_description) || '',
            primaryPlatforms: [],
            secondaryPlatforms: [],
            postingFrequency: '',
            toneId: '',
            notes: ''
          },
          stage1Brief: '',
          topics: [],
          stage2aBrief: '',
          series: [],
          stage2bBrief: '',
          plannedPosts: [],
          stage3Brief: '',
          stage3Basis: 'series',
          stage3BasisId: ''
        },
        uiState: {
          stage1Loading: false, stage1Error: '',
          topicsLoading: false, topicsError: '',
          seriesLoading: false, seriesError: '',
          postsLoading:  false, postsError:  ''
        }
      };
    }
    return S.setupWizard;
  }

  function clearWizardState() { S.setupWizard = null; }

  // ------------------------------------------------------------------
  // API
  // ------------------------------------------------------------------
  function openWizard() {
    if (!ready) return;
    var w = ensureWizardState();
    w.open = true;
    render();
    // Fire the stage-enter hook for the stage we're opening on (usually 1).
    var hook = stageEnterHooks[w.currentStage];
    if (typeof hook === 'function') {
      try { hook(w); } catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
    }
  }

  function closeWizard() {
    if (S.setupWizard) S.setupWizard.open = false;
    $('.scp-wizard-backdrop').remove();
    $('body').removeClass('scp-wizard-open');
  }

  function openIfFirstRun() {
    var fresh    = window._scpIsFreshWorkspace && window._scpIsFreshWorkspace();
    var firstRun = window._scpIsFirstRun       && window._scpIsFirstRun();
    if (fresh || firstRun) openWizard();
  }

  function goToStage(n) {
    var w = ensureWizardState();
    if (n < 1 || n > TOTAL_STAGES) return;
    w.currentStage = n;
    // Reset Stage 2 sub-tab when leaving / entering Stage 2 fresh.
    if (n === 2) w.stage2Sub = w.stage2Sub || 'topics';
    render();
    var hook = stageEnterHooks[n];
    if (typeof hook === 'function') {
      try { hook(w); } catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
    }
  }

  function nextStage() {
    var w = ensureWizardState();
    // Stage 2 is two sub-stages. Continue from 'topics' goes to 'series'
    // before advancing to Stage 3.
    if (w.currentStage === 2 && w.stage2Sub === 'topics') {
      var v2a = stageValidators['2a'];
      if (v2a && !v2a()) return;
      w.stage2Sub = 'series';
      render();
      var hookSeries = stageEnterHooks['2b'];
      if (typeof hookSeries === 'function') {
        try { hookSeries(w); } catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
      }
      return;
    }
    var validator = stageValidators[w.currentStage] || stageValidators[w.currentStage === 2 ? '2b' : ''];
    if (validator && !validator()) return;
    if (w.currentStage < TOTAL_STAGES) {
      goToStage(w.currentStage + 1);
    } else {
      finishSetup();
    }
  }

  function prevStage() {
    var w = ensureWizardState();
    // From Stage 2 sub 'series' go back to 'topics' before leaving Stage 2.
    if (w.currentStage === 2 && w.stage2Sub === 'series') {
      w.stage2Sub = 'topics';
      render();
      return;
    }
    if (w.currentStage > 1) goToStage(w.currentStage - 1);
  }

  function skipSetup() {
    if (!confirm('Skip setup? You can re-run it later from Settings.')) return;
    if (markSetupComplete) markSetupComplete();
    if (logActivity) logActivity('setup_completed', '', '', 'Setup skipped');
    closeWizard();
    clearWizardState();
    if (toast) toast('Setup skipped — explore freely', 'info');
  }

  function finishSetup() {
    var w = ensureWizardState();
    // Run step-module flushers (Stage 1 workspace, topics, series, posts).
    for (var i = 0; i < flushers.length; i++) {
      try { flushers[i](w); }
      catch (e) { console.error('[SCP] Wizard flusher threw', e); }
    }
    if (window._scpBuildMaps) window._scpBuildMaps();
    if (markSetupComplete) markSetupComplete();
    closeWizard();
    clearWizardState();
    if (syncToTextarea) syncToTextarea();
    if (window._scpRender) window._scpRender();
    if (toast) toast('Setup complete — welcome aboard!', 'success');
  }

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  function render() {
    var w = ensureWizardState();
    if (!w.open) return;
    var existing = $('.scp-wizard-backdrop');
    var html = renderShell(w);
    if (existing.length) {
      existing.replaceWith(html);
      // The new backdrop has no .scp-wizard-visible — without it the
      // CSS keeps opacity:0 and the wizard appears to "disappear".
      $('.scp-wizard-backdrop').addClass('scp-wizard-visible');
    } else {
      $('body').append(html).addClass('scp-wizard-open');
      setTimeout(function() { $('.scp-wizard-backdrop').addClass('scp-wizard-visible'); }, 10);
    }
    // Focus the first text input for keyboard-first users (re-running
    // each render so the focus lands on whatever is most relevant for
    // the current stage).
    setTimeout(function() {
      var $first = $('.scp-wizard-body input[type="text"], .scp-wizard-body textarea').not('[readonly]').first();
      if ($first.length) $first.trigger('focus');
    }, 100);
  }

  function renderShell(w) {
    var stage = w.currentStage;
    var isLast = stage === TOTAL_STAGES;
    var html = '<div class="scp-wizard-backdrop">';
    html += '<div class="scp-wizard-modal" role="dialog" aria-modal="true" aria-label="Setup wizard">';

    // Header — brand block + skip + stepper
    html += '<div class="scp-wizard-header">';
    html += '<div class="scp-wizard-header-top">';
    var brand = S.brand || {};
    var brandIdentity = brand.identity || {};
    if (brand.configured && brandIdentity.logoUrl) {
      html += '<div class="scp-wizard-brand">';
      html += '<img class="scp-wizard-brand-logo" src="' + esc(brandIdentity.logoUrl) + '" alt="">';
      html += '<span>Set up ' + esc(brandIdentity.name || 'your workspace') + '</span>';
      html += '</div>';
    } else {
      html += '<div class="scp-wizard-brand">' + icon('sparkles') + ' <span>Workspace Setup</span></div>';
    }
    html += '<button class="scp-wizard-skip" data-action="wizard-skip">Skip setup</button>';
    html += '</div>';
    html += renderStepper(stage, w);
    html += '</div>';

    // Body — stage content
    html += '<div class="scp-wizard-body">' + renderStage(stage, w) + '</div>';

    // Footer — back / next
    html += '<div class="scp-wizard-footer">';
    html += '<div class="scp-wizard-footer-left">';
    var canGoBack = stage > 1 || (stage === 2 && w.stage2Sub === 'series');
    if (canGoBack) {
      html += '<button class="scp-btn scp-btn-outline" data-action="wizard-back">' + icon('arrow-left') + ' Back</button>';
    }
    html += '</div>';
    html += '<div class="scp-wizard-footer-right">';
    var stageLabel = isLast ? 'Stage ' + stage + ' of ' + TOTAL_STAGES : 'Stage ' + stage + ' of ' + TOTAL_STAGES;
    if (stage === 2) stageLabel += ' · ' + (w.stage2Sub === 'topics' ? 'Topics' : 'Series');
    html += '<span class="scp-wizard-step-count">' + esc(stageLabel) + '</span>';
    var nextLabel, nextIcon;
    if (isLast) { nextLabel = 'Finish & Save'; nextIcon = 'check'; }
    else if (stage === 2 && w.stage2Sub === 'topics') { nextLabel = 'Continue to Series'; nextIcon = 'arrow-right'; }
    else if (stage === 2 && w.stage2Sub === 'series') { nextLabel = 'Continue to Posts';  nextIcon = 'arrow-right'; }
    else { nextLabel = 'Continue'; nextIcon = 'arrow-right'; }
    html += '<button class="scp-btn scp-btn-primary" data-action="wizard-next">' + esc(nextLabel) + ' ' + icon(nextIcon) + '</button>';
    html += '</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderStepper(currentStage, w) {
    var html = '<div class="scp-wizard-stepper" role="list">';
    for (var i = 1; i <= TOTAL_STAGES; i++) {
      var status = i < currentStage ? 'done' : (i === currentStage ? 'active' : 'pending');
      var meta = stageMeta[i] || { title: 'Stage ' + i, subtitle: '' };
      var subLabel = meta.subtitle;
      // Stage 2 shows the sub-tab on the active dot label.
      if (i === 2 && currentStage === 2) subLabel = w.stage2Sub === 'topics' ? 'Topics' : 'Series';
      html += '<div class="scp-wizard-step scp-wizard-step-' + status + '" role="listitem">';
      html += '<div class="scp-wizard-step-dot">' + (status === 'done' ? icon('check') : i) + '</div>';
      html += '<div class="scp-wizard-step-label">';
      html += '<div class="scp-wizard-step-title">' + esc(meta.title) + '</div>';
      html += '<div class="scp-wizard-step-subtitle">' + esc(subLabel) + '</div>';
      html += '</div></div>';
      if (i < TOTAL_STAGES) {
        html += '<div class="scp-wizard-step-line scp-wizard-step-line-' + (i < currentStage ? 'done' : 'pending') + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  function renderStage(stage, w) {
    var fn = stageRenderers[stage];
    if (fn) return fn(w);
    return renderPlaceholderStage(stage);
  }

  function renderPlaceholderStage(stage) {
    var meta = stageMeta[stage] || { title: 'Stage ' + stage, subtitle: '' };
    var html = '<div class="scp-wizard-step-content scp-wizard-step-placeholder">';
    html += '<div class="scp-wizard-placeholder-icon">' + icon('flask') + '</div>';
    html += '<h2>' + esc(meta.title) + ' coming soon</h2>';
    html += '<p>' + esc(meta.subtitle) + '. Step module not loaded — Skip or reload.</p>';
    html += '</div>';
    return html;
  }

  // ------------------------------------------------------------------
  // EVENTS
  // ------------------------------------------------------------------
  function setupEvents() {
    $(document).off('click.scp-wiz-next', '[data-action="wizard-next"]')
      .on('click.scp-wiz-next', '[data-action="wizard-next"]', function(e) { e.preventDefault(); nextStage(); });

    $(document).off('click.scp-wiz-back', '[data-action="wizard-back"]')
      .on('click.scp-wiz-back', '[data-action="wizard-back"]', function(e) { e.preventDefault(); prevStage(); });

    $(document).off('click.scp-wiz-skip', '[data-action="wizard-skip"]')
      .on('click.scp-wiz-skip', '[data-action="wizard-skip"]', function(e) { e.preventDefault(); skipSetup(); });
  }

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  window._scpWizard = {
    openWizard: openWizard,
    closeWizard: closeWizard,
    openIfFirstRun: openIfFirstRun,
    goToStage: goToStage,
    nextStage: nextStage,
    prevStage: prevStage,
    skipSetup: skipSetup,
    finishSetup: finishSetup,
    TOTAL_STAGES: TOTAL_STAGES,
    stageMeta: stageMeta
  };

  // Stages self-register. validatorFn returns true to allow advance.
  // For Stage 2 sub-stages, register with stageNumber === '2a' / '2b'.
  window._scpRegisterWizardStage = function(stageNumber, renderFn, validatorFn) {
    if (typeof renderFn === 'function') stageRenderers[stageNumber] = renderFn;
    if (typeof validatorFn === 'function') stageValidators[stageNumber] = validatorFn;
    if (S && S.setupWizard && S.setupWizard.open && S.setupWizard.currentStage === stageNumber) render();
  };
  window._scpRegisterWizardStageEnter = function(stageNumber, hookFn) {
    if (typeof hookFn === 'function') stageEnterHooks[stageNumber] = hookFn;
  };
  window._scpRegisterWizardFlush = function(fn) {
    if (typeof fn === 'function') flushers.push(fn);
  };
  window._scpRenderWizard = function() {
    if (S && S.setupWizard && S.setupWizard.open) render();
  };

})(jQuery);
