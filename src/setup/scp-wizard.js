/**
 * @category    setup
 * @purpose     First-run setup wizard. Five-step modal flow that captures
 *              brand basics, then (in later phases) generates topic and
 *              series scaffolding and seeds a starter planned-post batch.
 * @exports     window._scpWizard
 *                { openWizard, closeWizard, openIfFirstRun,
 *                  goToStep, nextStep, prevStep, skipSetup, finishSetup }
 *              window._scpRegisterWizardStep(stepNumber, renderFn)
 *                — later phases register their step renderers here.
 * @depends-on  window._scpState, window._scpEsc, window._scpIcon,
 *              window._scpSyncToTextarea, window._scpToast,
 *              window._scpLogActivity, window._scpMarkSetupComplete,
 *              window._scpIsFirstRun, window._scpConstants
 *
 * Step renderers self-register so Phase 2+ files can drop in step 2/3/4/5
 * without editing the shell. Unknown steps fall back to a "coming soon"
 * placeholder.
 */
(function($) {
  'use strict';

  var S, esc, icon, syncToTextarea, toast, logActivity, markSetupComplete;
  var Constants;
  var ready = false;

  // Registered step renderers — { 1: fn, 2: fn, ... }. Phase 1 ships only
  // step 1; the rest live in subsequent phases.
  var stepRenderers = {};
  // Optional step validators — return true to allow advance.
  var stepValidators = {};
  // Finish-time flushers — additional flush functions registered by step
  // modules. Each receives the live wizard state and is expected to write
  // its slice into S.data / S.meta. Runs before markSetupComplete.
  var flushers = [];
  // Step-bound init hooks: run on entry to a step (e.g. focus first input,
  // kick off an AI call). Keyed by step number.
  var stepEnterHooks = {};
  // Step metadata: title + short subtitle shown in the stepper.
  var stepMeta = {
    1: { title: 'Welcome', subtitle: 'Tell us about your brand' },
    2: { title: 'Topics', subtitle: 'AI-suggested content pillars' },
    3: { title: 'Series', subtitle: 'Group topics into arcs' },
    4: { title: 'Voice', subtitle: 'Pick your tone' },
    5: { title: 'Review', subtitle: 'Seed your first posts' }
  };
  var TOTAL_STEPS = 5;

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
    registerStep1();
    setupEvents();
    // Defer the auto-open by a frame so the main app shell paints first —
    // the wizard then animates in on top of a fully-rendered background.
    setTimeout(function() {
      if (window._scpIsFirstRun && window._scpIsFirstRun()) openWizard();
    }, 50);
    console.log('[SCP] Setup wizard ready');
  }

  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  function ensureWizardState() {
    if (!S.setupWizard) {
      // Prefill from Drupal brand block if present — saves keystrokes for
      // workspaces that already have brand data set up at the user level.
      var brand = S.brand || {};
      var brandIdentity = brand.identity || {};
      var brandCore = brand.core || {};
      var workspaceName = (S.meta.workspace && S.meta.workspace.name) || brandCore.brand_name || brandIdentity.name || '';
      var workspaceNiche = (S.meta.workspace && S.meta.workspace.niche) || brandCore.industry || brandCore.niche || '';
      S.setupWizard = {
        open: false,
        currentStep: 1,
        // Per-step working data. Steps write here as the user fills them
        // out; finishSetup() flushes the relevant slices to S.meta / S.data.
        data: {
          workspace: {
            name: workspaceName,
            niche: workspaceNiche,
            audience_description: (S.meta.workspace && S.meta.workspace.audience_description) || '',
            primary_platform: (S.meta.workspace && S.meta.workspace.primary_platform) || '',
            posting_frequency: (S.meta.workspace && S.meta.workspace.posting_frequency) || ''
          },
          topics: [],            // Step 2 will populate
          series: [],            // Step 3 will populate
          tone: { id: '', name: '', description: '' }, // Step 4
          plannedPosts: []       // Step 5
        }
      };
    }
    return S.setupWizard;
  }

  // ------------------------------------------------------------------
  // API
  // ------------------------------------------------------------------
  function openWizard() {
    if (!ready) return;
    var w = ensureWizardState();
    w.open = true;
    render();
  }

  function closeWizard() {
    if (S.setupWizard) S.setupWizard.open = false;
    $('.scp-wizard-backdrop').remove();
  }

  function openIfFirstRun() {
    if (window._scpIsFirstRun && window._scpIsFirstRun()) openWizard();
  }

  function goToStep(n) {
    var w = ensureWizardState();
    if (n < 1 || n > TOTAL_STEPS) return;
    w.currentStep = n;
    render();
    var hook = stepEnterHooks[n];
    if (typeof hook === 'function') {
      try { hook(w); }
      catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
    }
  }

  function nextStep() {
    var w = ensureWizardState();
    var validator = stepValidators[w.currentStep];
    if (validator && !validator()) return;
    if (w.currentStep < TOTAL_STEPS) {
      goToStep(w.currentStep + 1);
    } else {
      finishSetup();
    }
  }

  function prevStep() {
    var w = ensureWizardState();
    if (w.currentStep > 1) goToStep(w.currentStep - 1);
  }

  function skipSetup() {
    if (!confirm('Skip setup? You can re-run it later from Settings.')) return;
    if (markSetupComplete) markSetupComplete();
    if (logActivity) logActivity('setup_completed', '', '', 'Setup skipped');
    closeWizard();
    if (toast) toast('Setup skipped — explore freely', 'info');
  }

  function finishSetup() {
    var w = ensureWizardState();
    // Flush workspace basics. Step modules add their own flushers below.
    var ws = w.data.workspace || {};
    S.meta.workspace = S.meta.workspace || {};
    S.meta.workspace.name = (ws.name || '').trim();
    S.meta.workspace.niche = (ws.niche || '').trim();
    S.meta.workspace.audience_description = (ws.audience_description || '').trim();
    S.meta.workspace.primary_platform = ws.primary_platform || '';
    S.meta.workspace.posting_frequency = ws.posting_frequency || '';
    // Run step-module flushers (topics, series, tone, planned posts, etc.)
    for (var i = 0; i < flushers.length; i++) {
      try { flushers[i](w); }
      catch (e) { console.error('[SCP] Wizard flusher threw', e); }
    }
    if (window._scpBuildMaps) window._scpBuildMaps();
    if (markSetupComplete) markSetupComplete();
    closeWizard();
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
    } else {
      $('body').append(html);
      setTimeout(function() { $('.scp-wizard-backdrop').addClass('scp-wizard-visible'); }, 10);
    }
    // Focus the first text input for keyboard-first users.
    setTimeout(function() {
      var $first = $('.scp-wizard-body input[type="text"], .scp-wizard-body textarea').first();
      if ($first.length) $first.trigger('focus');
    }, 100);
  }

  function renderShell(w) {
    var step = w.currentStep;
    var isLast = step === TOTAL_STEPS;
    var html = '<div class="scp-wizard-backdrop">';
    html += '<div class="scp-wizard-modal" role="dialog" aria-modal="true" aria-label="Setup wizard">';

    // Header — title + stepper
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
    html += renderStepper(step);
    html += '</div>';

    // Body — step content
    html += '<div class="scp-wizard-body">' + renderStep(step) + '</div>';

    // Footer — back / next
    html += '<div class="scp-wizard-footer">';
    html += '<div class="scp-wizard-footer-left">';
    if (step > 1) {
      html += '<button class="scp-btn scp-btn-outline" data-action="wizard-back">' + icon('arrow-left') + ' Back</button>';
    }
    html += '</div>';
    html += '<div class="scp-wizard-footer-right">';
    html += '<span class="scp-wizard-step-count">Step ' + step + ' of ' + TOTAL_STEPS + '</span>';
    var nextLabel = isLast ? 'Finish' : 'Continue';
    var nextIcon = isLast ? 'check' : 'arrow-right';
    html += '<button class="scp-btn scp-btn-primary" data-action="wizard-next">' + nextLabel + ' ' + icon(nextIcon) + '</button>';
    html += '</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderStepper(currentStep) {
    var html = '<div class="scp-wizard-stepper" role="list">';
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var status = i < currentStep ? 'done' : (i === currentStep ? 'active' : 'pending');
      var meta = stepMeta[i] || { title: 'Step ' + i, subtitle: '' };
      html += '<div class="scp-wizard-step scp-wizard-step-' + status + '" role="listitem">';
      html += '<div class="scp-wizard-step-dot">' + (status === 'done' ? icon('check') : i) + '</div>';
      html += '<div class="scp-wizard-step-label">';
      html += '<div class="scp-wizard-step-title">' + esc(meta.title) + '</div>';
      html += '<div class="scp-wizard-step-subtitle">' + esc(meta.subtitle) + '</div>';
      html += '</div></div>';
      if (i < TOTAL_STEPS) {
        html += '<div class="scp-wizard-step-line scp-wizard-step-line-' + (i < currentStep ? 'done' : 'pending') + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  function renderStep(step) {
    var fn = stepRenderers[step];
    if (fn) return fn(S.setupWizard);
    return renderPlaceholderStep(step);
  }

  function renderPlaceholderStep(step) {
    var meta = stepMeta[step] || { title: 'Step ' + step, subtitle: '' };
    var html = '<div class="scp-wizard-step-content scp-wizard-step-placeholder">';
    html += '<div class="scp-wizard-placeholder-icon">' + icon('flask') + '</div>';
    html += '<h2>' + esc(meta.title) + ' coming soon</h2>';
    html += '<p>' + esc(meta.subtitle) + '. This step is wired up in a later phase — for now you can continue or skip.</p>';
    html += '</div>';
    return html;
  }

  // ------------------------------------------------------------------
  // STEP 1 — Welcome + brand basics
  // ------------------------------------------------------------------
  function registerStep1() {
    stepRenderers[1] = renderStep1;
    stepValidators[1] = validateStep1;
  }

  function renderStep1(w) {
    var d = (w.data && w.data.workspace) || {};
    var PLATFORMS = (Constants && Constants.PLATFORMS) || {};
    var html = '<div class="scp-wizard-step-content scp-wizard-step-welcome">';
    html += '<h2 class="scp-wizard-headline">Let\'s set up your workspace</h2>';
    html += '<p class="scp-wizard-sub">Five quick steps — you can change anything later from Settings.</p>';

    html += '<div class="scp-wizard-form">';

    html += '<div class="scp-form-group">';
    html += '<label>Workspace name <span class="scp-wizard-required">*</span></label>';
    html += '<input type="text" class="scp-input scp-wizard-field" data-field="name" value="' + esc(d.name || '') + '" placeholder="e.g. Acme Coffee Co.">';
    html += '</div>';

    html += '<div class="scp-form-group">';
    html += '<label>What\'s your niche or focus? <span class="scp-wizard-required">*</span></label>';
    html += '<input type="text" class="scp-input scp-wizard-field" data-field="niche" value="' + esc(d.niche || '') + '" placeholder="e.g. B2B SaaS for marketing teams, sustainable fashion, fitness coaching">';
    html += '<p class="scp-form-hint">A short description we can pass to the AI for topic and content suggestions.</p>';
    html += '</div>';

    html += '<div class="scp-form-group">';
    html += '<label>Who are you trying to reach?</label>';
    html += '<textarea class="scp-textarea scp-wizard-field" data-field="audience_description" rows="2" placeholder="e.g. Marketing managers at 50-500 person companies, busy parents looking for healthy meals, junior developers learning Rust">' + esc(d.audience_description || '') + '</textarea>';
    html += '<p class="scp-form-hint">The more specific, the better the AI suggestions.</p>';
    html += '</div>';

    html += '<div class="scp-form-row">';
    html += '<div class="scp-form-half">';
    html += '<label>Primary platform</label>';
    html += '<select class="scp-select scp-wizard-field" data-field="primary_platform">';
    html += '<option value="">Choose a platform...</option>';
    for (var pk in PLATFORMS) {
      var pl = PLATFORMS[pk];
      html += '<option value="' + pk + '"' + (d.primary_platform === pk ? ' selected' : '') + '>' + esc(pl.label) + '</option>';
    }
    html += '</select>';
    html += '</div>';
    html += '<div class="scp-form-half">';
    html += '<label>Posting frequency</label>';
    html += '<select class="scp-select scp-wizard-field" data-field="posting_frequency">';
    var freqs = [
      { v: '', l: 'Not sure yet' },
      { v: 'daily', l: 'Daily' },
      { v: '3x_week', l: '3× per week' },
      { v: 'weekly', l: 'Weekly' },
      { v: '2x_month', l: 'Twice a month' },
      { v: 'monthly', l: 'Monthly' }
    ];
    for (var i = 0; i < freqs.length; i++) {
      html += '<option value="' + freqs[i].v + '"' + (d.posting_frequency === freqs[i].v ? ' selected' : '') + '>' + esc(freqs[i].l) + '</option>';
    }
    html += '</select>';
    html += '</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function validateStep1() {
    var w = ensureWizardState();
    var d = w.data.workspace;
    if (!d.name || !d.name.trim()) { toast && toast('Please enter a workspace name', 'warning'); return false; }
    if (!d.niche || !d.niche.trim()) { toast && toast('Please describe your niche or focus', 'warning'); return false; }
    return true;
  }

  // ------------------------------------------------------------------
  // EVENTS
  // ------------------------------------------------------------------
  function setupEvents() {
    // Field updates — bind on the body so input/change reach any future step's fields.
    $(document).off('input.scp-wiz change.scp-wiz', '.scp-wizard-field')
      .on('input.scp-wiz change.scp-wiz', '.scp-wizard-field', function() {
        var w = ensureWizardState();
        var field = $(this).data('field');
        var bucket = $(this).data('bucket') || 'workspace';
        if (!field) return;
        w.data[bucket] = w.data[bucket] || {};
        w.data[bucket][field] = $(this).val();
      });

    $(document).off('click.scp-wiz-next', '[data-action="wizard-next"]')
      .on('click.scp-wiz-next', '[data-action="wizard-next"]', function(e) { e.preventDefault(); nextStep(); });

    $(document).off('click.scp-wiz-back', '[data-action="wizard-back"]')
      .on('click.scp-wiz-back', '[data-action="wizard-back"]', function(e) { e.preventDefault(); prevStep(); });

    $(document).off('click.scp-wiz-skip', '[data-action="wizard-skip"]')
      .on('click.scp-wiz-skip', '[data-action="wizard-skip"]', function(e) { e.preventDefault(); skipSetup(); });

    // Enter on a text input advances (textareas keep newline behavior).
    $(document).off('keydown.scp-wiz', '.scp-wizard-body input[type="text"]')
      .on('keydown.scp-wiz', '.scp-wizard-body input[type="text"]', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); nextStep(); }
      });
  }

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  window._scpWizard = {
    openWizard: openWizard,
    closeWizard: closeWizard,
    openIfFirstRun: openIfFirstRun,
    goToStep: goToStep,
    nextStep: nextStep,
    prevStep: prevStep,
    skipSetup: skipSetup,
    finishSetup: finishSetup,
    TOTAL_STEPS: TOTAL_STEPS,
    stepMeta: stepMeta
  };

  // Later phases call this to plug in their step renderers without
  // editing the shell. Validators are optional.
  window._scpRegisterWizardStep = function(stepNumber, renderFn, validatorFn) {
    if (typeof renderFn === 'function') stepRenderers[stepNumber] = renderFn;
    if (typeof validatorFn === 'function') stepValidators[stepNumber] = validatorFn;
    // If the wizard is currently sitting on this step, re-render so the
    // new content shows immediately.
    if (S && S.setupWizard && S.setupWizard.open && S.setupWizard.currentStep === stepNumber) render();
  };
  // Step modules call this to be notified when the user enters their step
  // (e.g. to lazily fire an AI request the first time).
  window._scpRegisterWizardStepEnter = function(stepNumber, hookFn) {
    if (typeof hookFn === 'function') stepEnterHooks[stepNumber] = hookFn;
  };
  // Step modules register a finish-time flusher to persist their slice.
  window._scpRegisterWizardFlush = function(fn) {
    if (typeof fn === 'function') flushers.push(fn);
  };
  // Step modules trigger a wizard re-render after async work (AI returns,
  // user toggles, etc.) without needing access to the shell's render().
  window._scpRenderWizard = function() {
    if (S && S.setupWizard && S.setupWizard.open) render();
  };

})(jQuery);
