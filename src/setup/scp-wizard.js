/**
 * @category    setup
 * @purpose     First-run setup wizard. Full-screen app takeover with its
 *              own top bar and a left sidebar nav showing 4 stages:
 *                Stage 1 — Welcome & brand attributes
 *                Stage 2 — Topics (content pillars)
 *                Stage 3 — Series (multi-post arcs)
 *                Stage 4 — Post Planning (seed the calendar)
 *
 *              The wizard hides the app's regular chrome while open
 *              (via body.scp-wizard-open { .scp-app display:none }) so
 *              it reads as a dedicated onboarding surface, not a modal.
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
 * Stages self-register via _scpRegisterWizardStage so the shell stays
 * decoupled from per-stage renderers (which live in scp-wizard-steps.js).
 */
(function($) {
  'use strict';

  var S, esc, icon, syncToTextarea, toast, logActivity, markSetupComplete;
  var Constants;
  var ready = false;

  var stageRenderers = {};
  var stageValidators = {};
  var flushers = [];
  var stageEnterHooks = {};
  var stageMeta = {
    1: { title: 'Welcome',       subtitle: 'Brand & AI basics',     desc: "Tell us about your brand. The AI will propose primary platforms, posting frequency, voice, and audience — you can edit anything." },
    2: { title: 'Topics',        subtitle: 'Content pillars',       desc: 'Run the AI for topic ideas, accept the ones you like, add your own. Multiple runs accumulate — only selected topics carry forward.' },
    3: { title: 'Series',        subtitle: 'Multi-post arcs',       desc: 'Group your selected topics into reusable series. Series make it easy to plan multi-post campaigns and recurring themes.' },
    4: { title: 'Post Planning', subtitle: 'Seed your calendar',    desc: 'Pick a series (or topic), generate post ideas, accumulate across runs, and select which to keep. Selected ideas become draft posts.' }
  };
  var TOTAL_STAGES = 4;

  // ------------------------------------------------------------------
  // BOOT
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
      var brand = S.brand || {};
      var brandIdentity = brand.identity || {};
      var brandCore = brand.core || {};
      var workspaceName  = (S.meta.workspace && S.meta.workspace.name)  || brandCore.brand_name || brandIdentity.name || '';
      var workspaceNiche = (S.meta.workspace && S.meta.workspace.niche) || brandCore.industry   || brandCore.niche    || '';
      S.setupWizard = {
        open: false,
        currentStage: 1,
        furthestStage: 1,
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
          stage2Brief: '',
          series: [],
          stage3Brief: '',
          plannedPosts: [],
          stage4Brief: '',
          stage4Basis: 'series',
          stage4BasisId: ''
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
    var hook = stageEnterHooks[w.currentStage];
    if (typeof hook === 'function') {
      try { hook(w); } catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
    }
  }

  function closeWizard() {
    if (S.setupWizard) S.setupWizard.open = false;
    $('.scp-wizard-app').remove();
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
    w.furthestStage = Math.max(w.furthestStage || 1, n);
    render();
    var hook = stageEnterHooks[n];
    if (typeof hook === 'function') {
      try { hook(w); } catch (e) { console.error('[SCP] Wizard enter hook threw', e); }
    }
  }

  function nextStage() {
    var w = ensureWizardState();
    var validator = stageValidators[w.currentStage];
    if (validator && !validator()) return;
    if (w.currentStage < TOTAL_STAGES) goToStage(w.currentStage + 1);
    else finishSetup();
  }

  function prevStage() {
    var w = ensureWizardState();
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
    var existing = $('.scp-wizard-app');
    var html = renderShell(w);
    if (existing.length) {
      // Preserve which stage we're rendering so the transition class
      // knows the direction.
      var prevStage = parseInt(existing.attr('data-stage') || '1', 10);
      var nextStage = w.currentStage;
      existing.replaceWith(html);
      var $app = $('.scp-wizard-app').attr('data-stage', String(nextStage));
      if (nextStage !== prevStage) {
        var dir = nextStage > prevStage ? 'forward' : 'back';
        $app.find('.scp-wizard-page-body').addClass('scp-wizard-stage-enter scp-wizard-stage-enter-' + dir);
        setTimeout(function() {
          $('.scp-wizard-page-body').removeClass('scp-wizard-stage-enter scp-wizard-stage-enter-forward scp-wizard-stage-enter-back');
        }, 280);
      }
    } else {
      $('body').append(html).addClass('scp-wizard-open');
      $('.scp-wizard-app').attr('data-stage', String(w.currentStage));
    }
    setTimeout(function() {
      var $first = $('.scp-wizard-page-body input[type="text"], .scp-wizard-page-body textarea').not('[readonly]').first();
      if ($first.length) $first.trigger('focus');
    }, 100);
  }

  function renderShell(w) {
    var meta = stageMeta[w.currentStage] || { title: 'Stage', subtitle: '', desc: '' };
    var brand = S.brand || {};
    var brandIdentity = brand.identity || {};

    var html = '<div class="scp-wizard-app" role="application" aria-label="Setup wizard">';

    // ── Topbar ─────────────────────────────────────────────────
    html += '<header class="scp-wizard-topbar">';
    html += '<div class="scp-wizard-topbar-brand">';
    if (brand.configured && brandIdentity.logoUrl) {
      html += '<img class="scp-wizard-topbar-logo" src="' + esc(brandIdentity.logoUrl) + '" alt="">';
    } else {
      html += '<span class="scp-wizard-topbar-iconwrap">' + icon('sparkles') + '</span>';
    }
    html += '<div class="scp-wizard-topbar-titles">';
    html += '<div class="scp-wizard-topbar-title">Workspace Setup</div>';
    var subtitle = brandIdentity.name || (w.data.workspace && w.data.workspace.name) || 'First-run wizard';
    html += '<div class="scp-wizard-topbar-sub">' + esc(subtitle) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="scp-wizard-topbar-actions">';
    html += '<button class="scp-btn scp-btn-link scp-wizard-skip" data-action="wizard-skip">Skip setup</button>';
    html += '</div>';
    html += '</header>';

    // ── Shell: sidenav + content ───────────────────────────────
    html += '<div class="scp-wizard-shell">';
    html += renderSidenav(w);

    html += '<main class="scp-wizard-content" role="main">';

    html += '<div class="scp-wizard-page-header">';
    html += '<div class="scp-wizard-page-eyebrow">Stage ' + w.currentStage + ' of ' + TOTAL_STAGES + ' · ' + esc(meta.subtitle) + '</div>';
    html += '<h1 class="scp-wizard-page-title">' + esc(meta.title) + '</h1>';
    if (meta.desc) html += '<p class="scp-wizard-page-desc">' + esc(meta.desc) + '</p>';
    html += '</div>';

    html += '<div class="scp-wizard-page-body">' + renderStage(w.currentStage, w) + '</div>';

    // ── Sticky footer (inside content pane) ─────────────────────
    html += '<div class="scp-wizard-footer">';
    html += '<div class="scp-wizard-footer-left">';
    if (w.currentStage > 1) {
      html += '<button class="scp-btn scp-btn-outline" data-action="wizard-back">' + icon('arrow-left') + ' Back</button>';
    }
    html += '</div>';
    html += '<div class="scp-wizard-footer-meta">Stage ' + w.currentStage + ' of ' + TOTAL_STAGES + '</div>';
    html += '<div class="scp-wizard-footer-right">';
    var isLast = w.currentStage === TOTAL_STAGES;
    var nextLabel = isLast ? 'Finish & Save' : 'Continue';
    var nextIcon  = isLast ? 'check' : 'arrow-right';
    html += '<button class="scp-btn scp-btn-primary" data-action="wizard-next">' + esc(nextLabel) + ' ' + icon(nextIcon) + '</button>';
    html += '</div>';
    html += '</div>';

    html += '</main>';
    html += '</div>'; // /shell

    // Off-screen live region for AI status announcements.
    html += '<div class="scp-wizard-live" role="status" aria-live="polite" aria-atomic="true"></div>';

    html += '</div>'; // /app
    return html;
  }

  function renderSidenav(w) {
    var html = '<aside class="scp-wizard-sidenav" role="navigation" aria-label="Setup stages">';
    html += '<div class="scp-wizard-sidenav-label">Setup stages</div>';
    html += '<ol class="scp-wizard-sidenav-list">';
    for (var i = 1; i <= TOTAL_STAGES; i++) {
      var meta = stageMeta[i] || { title: 'Stage ' + i, subtitle: '' };
      var status = i < w.currentStage ? 'done' : (i === w.currentStage ? 'active' : 'pending');
      var clickable = i <= (w.furthestStage || 1);
      var attrs  = ' class="scp-wizard-nav-item scp-wizard-nav-' + status + (clickable ? ' scp-wizard-nav-clickable' : '') + '"';
      attrs += ' data-stage="' + i + '"';
      if (status === 'active') attrs += ' aria-current="step"';
      html += '<li' + attrs + '>';
      html += '<span class="scp-wizard-nav-dot">' + (status === 'done' ? icon('check') : i) + '</span>';
      html += '<div class="scp-wizard-nav-text">';
      html += '<div class="scp-wizard-nav-title">' + esc(meta.title) + '</div>';
      html += '<div class="scp-wizard-nav-sub">' + esc(meta.subtitle) + '</div>';
      html += '</div>';
      html += '</li>';
    }
    html += '</ol>';
    html += '<div class="scp-wizard-sidenav-progress">';
    var pct = Math.round(((w.currentStage - 1) / (TOTAL_STAGES - 1)) * 100);
    html += '<div class="scp-wizard-sidenav-bar"><span style="width:' + pct + '%"></span></div>';
    html += '<div class="scp-wizard-sidenav-progress-text">Stage ' + w.currentStage + ' of ' + TOTAL_STAGES + '</div>';
    html += '</div>';
    html += '</aside>';
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

    // Sidenav stage click — only jumps to visited/current stages.
    $(document).off('click.scp-wiz-nav', '.scp-wizard-nav-clickable')
      .on('click.scp-wiz-nav', '.scp-wizard-nav-clickable', function(e) {
        e.preventDefault();
        var n = parseInt($(this).data('stage'), 10);
        if (n && n !== S.setupWizard.currentStage) goToStage(n);
      });

    // Esc → confirm skip; helpful escape hatch.
    $(document).off('keydown.scp-wiz-esc')
      .on('keydown.scp-wiz-esc', function(e) {
        if (e.key !== 'Escape') return;
        if (!S.setupWizard || !S.setupWizard.open) return;
        // Let textareas/inputs handle Esc to blur first.
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
          document.activeElement.blur(); return;
        }
        skipSetup();
      });

    // Cmd/Ctrl + Enter in any brief textarea → fire the corresponding Run button.
    $(document).off('keydown.scp-wiz-runkey', '.scp-wiz-brief')
      .on('keydown.scp-wiz-runkey', '.scp-wiz-brief', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          var $btn = $(this).closest('.scp-wiz-research').find('.scp-wiz-run-btn').not(':disabled');
          if ($btn.length) $btn.trigger('click');
        }
      });
  }

  // Public helper for stage modules to announce AI events to AT.
  window._scpWizardAnnounce = function(msg) {
    var $live = $('.scp-wizard-live');
    if ($live.length) $live.text(String(msg || ''));
  };

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
