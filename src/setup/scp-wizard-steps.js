/**
 * @category    setup
 * @purpose     Setup-wizard Steps 2–5 plus the finish-time flusher.
 *              Self-registers into the shell exposed by scp-wizard.js via
 *              window._scpRegisterWizardStep / _scpRegisterWizardStepEnter
 *              / _scpRegisterWizardFlush.
 *
 *   Step 2 — AI topic suggestions (or manual add) → w.data.topics
 *   Step 3 — Series grouping                       → w.data.series
 *   Step 4 — Tone selection                        → w.data.tone
 *   Step 5 — Review + AI-generated planned posts   → w.data.plannedPosts
 *
 * @depends-on  window._scpWizard, window._scpState, window._scpEsc,
 *              window._scpIcon, window._scpToast, window._scpGenerateId,
 *              window._scpAIHelpers (parseJSON), window.LLMService,
 *              window._scpConstants, window._scpLogActivity
 */
(function($) {
  'use strict';

  var COLORS = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
  var SERIES_COLORS = ['#4c6ef5', '#9333ea', '#059669', '#dc2626', '#0891b2', '#d97706'];

  var S, esc, icon, toast, generateId, parseJSON, LLMService, Constants, logActivity;
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
    Constants = window._scpConstants;
    logActivity = window._scpLogActivity;
    ready = true;

    window._scpRegisterWizardStep(2, renderStep2, validateStep2);
    window._scpRegisterWizardStep(3, renderStep3, validateStep3);
    window._scpRegisterWizardStep(4, renderStep4, validateStep4);
    window._scpRegisterWizardStep(5, renderStep5, validateStep5);
    window._scpRegisterWizardStepEnter(2, onEnterStep2);
    window._scpRegisterWizardStepEnter(5, onEnterStep5);
    window._scpRegisterWizardFlush(flushSetup);
    setupEvents();
    console.log('[SCP] Wizard steps 2–5 registered');
  }

  // Convenience — quick re-render
  function refresh() { if (window._scpRenderWizard) window._scpRenderWizard(); }
  function isAIReady() { return LLMService && LLMService.isConfigured && LLMService.isConfigured(); }

  // ============================================================
  // STEP 2 — AI TOPIC SUGGESTIONS
  // ============================================================
  function onEnterStep2(w) {
    w.uiState = w.uiState || {};
    if (w.uiState.topicsGenerated || w.data.topics.length > 0) return;
    if (!isAIReady()) return;
    generateTopics(w);
  }

  function generateTopics(w) {
    w.uiState = w.uiState || {};
    if (w.uiState.topicsLoading) return;
    if (!isAIReady()) { toast('AI not configured — add topics manually below', 'warning'); return; }
    w.uiState.topicsLoading = true;
    w.uiState.topicsError = '';
    refresh();

    var ws = w.data.workspace || {};
    var prompt = 'You are a social-media strategist helping a brand define its core content topics (pillars).\n\n' +
      'Brand: ' + (ws.name || 'Unnamed workspace') + '\n' +
      'Niche / focus: ' + (ws.niche || 'general') + '\n' +
      'Target audience: ' + (ws.audience_description || 'general audience') + '\n' +
      'Primary platform: ' + (ws.primary_platform || 'multiple platforms') + '\n\n' +
      'Suggest 6 content topics (pillars) this brand should consistently post about. ' +
      'Each topic should be specific enough to guide post ideas, broad enough to support dozens of posts over time.\n\n' +
      'For each topic provide: name (2-4 words), description (one sentence explaining what the topic covers and why this audience cares).\n\n' +
      'Respond ONLY as JSON: [{"name":"...","description":"..."}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.topics || raw.results || [];
        var existing = w.data.topics.length;
        for (var i = 0; i < raw.length; i++) {
          var t = raw[i] || {};
          if (!t.name) continue;
          w.data.topics.push({
            tempId: 'tmp_topic_' + (Date.now() + i).toString(36),
            name: (t.name || '').toString().trim(),
            description: (t.description || '').toString().trim(),
            color: COLORS[(existing + i) % COLORS.length],
            seriesTempId: ''
          });
        }
        w.uiState.topicsGenerated = true;
      } catch (e) {
        w.uiState.topicsError = 'Could not parse AI response. Try again or add topics manually.';
      }
      w.uiState.topicsLoading = false;
      refresh();
    }, function(err) {
      w.uiState.topicsLoading = false;
      w.uiState.topicsError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_topics');
  }

  function renderStep2(w) {
    w.uiState = w.uiState || {};
    var ws = w.data.workspace || {};
    var topics = w.data.topics || [];
    var aiReady = isAIReady();

    var html = '<div class="scp-wizard-step-content">';
    html += '<h2 class="scp-wizard-headline">Pick your content topics</h2>';
    html += '<p class="scp-wizard-sub">These become your <strong>content pillars</strong> — recurring themes every post ties back to. ' +
      'We\'ll group them into series next.</p>';

    html += '<div class="scp-wizard-context">';
    html += icon('flask') + ' <span>For <strong>' + esc(ws.name || 'your workspace') + '</strong>';
    if (ws.niche) html += ' &middot; ' + esc(ws.niche);
    html += '</span></div>';

    // Action row
    html += '<div class="scp-wizard-actions">';
    if (aiReady) {
      var loading = w.uiState.topicsLoading;
      html += '<button class="scp-btn scp-btn-primary" data-action="wiz-gen-topics"' + (loading ? ' disabled' : '') + '>' +
        icon(loading ? 'spinner' : 'sparkles') + ' ' + (loading ? 'Generating…' : (topics.length ? 'Regenerate with AI' : 'Generate with AI')) +
        '</button>';
    } else {
      html += '<div class="scp-wizard-ai-disabled">' + icon('warning') + ' AI not configured — add topics manually, or configure providers in Settings after setup.</div>';
    }
    html += '<button class="scp-btn scp-btn-outline" data-action="wiz-add-topic">' + icon('plus') + ' Add topic</button>';
    html += '</div>';

    if (w.uiState.topicsError) {
      html += '<div class="scp-wizard-error">' + icon('warning') + ' ' + esc(w.uiState.topicsError) + '</div>';
    }

    // Topic list
    if (topics.length === 0) {
      html += '<div class="scp-wizard-empty">';
      html += '<div class="scp-wizard-empty-icon">' + icon('tags') + '</div>';
      html += '<p>No topics yet. Generate suggestions with AI or add your own — you can always edit them later from the Topics view.</p>';
      html += '</div>';
    } else {
      html += '<div class="scp-wizard-topic-list">';
      for (var i = 0; i < topics.length; i++) html += renderTopicCard(topics[i], i);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderTopicCard(t, index) {
    var html = '<div class="scp-wizard-topic-row" data-temp-id="' + esc(t.tempId) + '">';
    html += '<div class="scp-wizard-topic-swatch" style="background:' + esc(t.color) + '" data-action="wiz-cycle-topic-color" title="Click to change color"></div>';
    html += '<div class="scp-wizard-topic-fields">';
    html += '<input type="text" class="scp-input scp-wiz-topic-field" data-field="name" value="' + esc(t.name) + '" placeholder="Topic name">';
    html += '<input type="text" class="scp-input scp-wiz-topic-field" data-field="description" value="' + esc(t.description) + '" placeholder="What this topic covers...">';
    html += '</div>';
    html += '<button class="scp-btn-icon scp-wizard-topic-delete" data-action="wiz-remove-topic" title="Remove">' + icon('trash') + '</button>';
    html += '</div>';
    return html;
  }

  function validateStep2() {
    // Allow zero topics — user might prefer to build them later — but
    // warn so they know what happens.
    var w = S.setupWizard;
    if (!w || !w.data.topics || w.data.topics.length === 0) {
      return confirm('Continue without any topics? You can add them later from the Topics view.');
    }
    return true;
  }

  // ============================================================
  // STEP 3 — SERIES GROUPING
  // ============================================================
  function renderStep3(w) {
    var topics = w.data.topics || [];
    var series = w.data.series || [];

    var html = '<div class="scp-wizard-step-content">';
    html += '<h2 class="scp-wizard-headline">Group topics into series</h2>';
    html += '<p class="scp-wizard-sub">Series are multi-post content arcs — a way to plan a sequence around a topic ' +
      '(e.g. "Onboarding Tips Week" or "Founder Story Series"). Optional, but they make planning easier.</p>';

    if (topics.length === 0) {
      html += '<div class="scp-wizard-empty">';
      html += '<div class="scp-wizard-empty-icon">' + icon('layer-group') + '</div>';
      html += '<p>No topics to group yet. Go back to Step 2 to add some, or skip ahead — you can build series later.</p>';
      html += '</div></div>';
      return html;
    }

    html += '<div class="scp-wizard-actions">';
    if (isAIReady()) {
      var loading = (w.uiState && w.uiState.seriesLoading) || false;
      html += '<button class="scp-btn scp-btn-primary" data-action="wiz-gen-series"' + (loading ? ' disabled' : '') + '>' +
        icon(loading ? 'spinner' : 'sparkles') + ' ' + (loading ? 'Grouping…' : 'Auto-group with AI') + '</button>';
    }
    html += '<button class="scp-btn scp-btn-outline" data-action="wiz-add-series">' + icon('plus') + ' New series</button>';
    html += '</div>';

    if (w.uiState && w.uiState.seriesError) {
      html += '<div class="scp-wizard-error">' + icon('warning') + ' ' + esc(w.uiState.seriesError) + '</div>';
    }

    // Series cards
    if (series.length > 0) {
      html += '<div class="scp-wizard-series-list">';
      for (var s = 0; s < series.length; s++) html += renderSeriesCard(series[s]);
      html += '</div>';
    }

    // Topic assignment grid
    html += '<div class="scp-wizard-assign-section">';
    html += '<h3>Assign topics</h3>';
    html += '<div class="scp-wizard-assign-list">';
    for (var i = 0; i < topics.length; i++) html += renderTopicAssignRow(topics[i], series);
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderSeriesCard(s) {
    var html = '<div class="scp-wizard-series-card" data-temp-id="' + esc(s.tempId) + '" style="border-left-color:' + esc(s.color) + '">';
    html += '<div class="scp-wizard-series-fields">';
    html += '<input type="text" class="scp-input scp-wiz-series-field" data-field="name" value="' + esc(s.name) + '" placeholder="Series name">';
    html += '<input type="text" class="scp-input scp-wiz-series-field" data-field="description" value="' + esc(s.description || '') + '" placeholder="Short description...">';
    html += '</div>';
    html += '<button class="scp-btn-icon scp-wizard-topic-delete" data-action="wiz-remove-series" title="Remove series">' + icon('trash') + '</button>';
    html += '</div>';
    return html;
  }

  function renderTopicAssignRow(t, series) {
    var html = '<div class="scp-wizard-assign-row" data-temp-id="' + esc(t.tempId) + '">';
    html += '<span class="scp-wizard-assign-dot" style="background:' + esc(t.color) + '"></span>';
    html += '<span class="scp-wizard-assign-name">' + esc(t.name) + '</span>';
    html += '<select class="scp-select scp-wiz-topic-series">';
    html += '<option value=""' + (!t.seriesTempId ? ' selected' : '') + '>— No series —</option>';
    for (var i = 0; i < series.length; i++) {
      var sel = t.seriesTempId === series[i].tempId ? ' selected' : '';
      html += '<option value="' + esc(series[i].tempId) + '"' + sel + '>' + esc(series[i].name || 'Untitled series') + '</option>';
    }
    html += '</select>';
    html += '</div>';
    return html;
  }

  function validateStep3() { return true; } // Series are optional

  function generateSeries(w) {
    if (!isAIReady()) { toast('AI not configured', 'warning'); return; }
    var topics = w.data.topics || [];
    if (topics.length < 2) { toast('Add at least 2 topics first', 'warning'); return; }
    w.uiState = w.uiState || {};
    if (w.uiState.seriesLoading) return;
    w.uiState.seriesLoading = true;
    w.uiState.seriesError = '';
    refresh();

    var ws = w.data.workspace || {};
    var topicLines = topics.map(function(t) { return '- ' + t.name + ': ' + (t.description || ''); }).join('\n');
    var prompt = 'You are organising content topics into multi-post series for a brand.\n\n' +
      'Brand: ' + (ws.name || 'Unnamed') + '\n' +
      'Niche: ' + (ws.niche || 'general') + '\n\n' +
      'Topics:\n' + topicLines + '\n\n' +
      'Group the topics into 2-3 series (content arcs). Each series should bundle 2+ related topics. ' +
      'Some topics may stand alone — leave them unassigned.\n\n' +
      'For each series provide: name (3-5 words), description (one sentence), topic_names (array of topic names exactly as given).\n\n' +
      'Respond ONLY as JSON: [{"name":"...","description":"...","topic_names":["..."]}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.series || raw.results || [];
        // Reset existing AI series + assignments first
        w.data.series = [];
        for (var t = 0; t < topics.length; t++) topics[t].seriesTempId = '';
        for (var i = 0; i < raw.length; i++) {
          var entry = raw[i] || {};
          if (!entry.name) continue;
          var tempId = 'tmp_series_' + (Date.now() + i).toString(36);
          w.data.series.push({
            tempId: tempId,
            name: (entry.name || '').toString().trim(),
            description: (entry.description || '').toString().trim(),
            color: SERIES_COLORS[i % SERIES_COLORS.length]
          });
          var names = entry.topic_names || entry.topics || [];
          for (var j = 0; j < names.length; j++) {
            var match = findTopicByName(topics, names[j]);
            if (match) match.seriesTempId = tempId;
          }
        }
      } catch (e) {
        w.uiState.seriesError = 'Could not parse AI response — group manually instead.';
      }
      w.uiState.seriesLoading = false;
      refresh();
    }, function(err) {
      w.uiState.seriesLoading = false;
      w.uiState.seriesError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_series');
  }

  function findTopicByName(topics, name) {
    var n = (name || '').toLowerCase().trim();
    for (var i = 0; i < topics.length; i++) {
      if ((topics[i].name || '').toLowerCase().trim() === n) return topics[i];
    }
    return null;
  }

  // ============================================================
  // STEP 4 — TONE
  // ============================================================
  function renderStep4(w) {
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    var selectedId = (w.data.tone && w.data.tone.id) || '';

    var html = '<div class="scp-wizard-step-content">';
    html += '<h2 class="scp-wizard-headline">Pick your default tone</h2>';
    html += '<p class="scp-wizard-sub">The default voice for AI-generated content. You can override it on any individual post.</p>';

    html += '<div class="scp-wizard-actions">';
    if (isAIReady()) {
      var loading = (w.uiState && w.uiState.toneLoading) || false;
      html += '<button class="scp-btn scp-btn-outline" data-action="wiz-suggest-tone"' + (loading ? ' disabled' : '') + '>' +
        icon(loading ? 'spinner' : 'sparkles') + ' ' + (loading ? 'Thinking…' : 'Suggest based on my niche') + '</button>';
    }
    html += '</div>';

    if (w.uiState && w.uiState.toneSuggestion) {
      var ts = w.uiState.toneSuggestion;
      html += '<div class="scp-wizard-tone-suggestion">';
      html += '<div class="scp-wizard-tone-suggestion-label">' + icon('sparkles') + ' AI suggests for your brand</div>';
      html += '<div class="scp-wizard-tone-suggestion-text">' + esc(ts.name) + ' &mdash; <span>' + esc(ts.description) + '</span></div>';
      html += '</div>';
    }

    html += '<div class="scp-wizard-tone-grid">';
    for (var i = 0; i < tones.length; i++) {
      var t = tones[i];
      var active = t.id === selectedId ? ' scp-wizard-tone-active' : '';
      html += '<button class="scp-wizard-tone-card' + active + '" data-action="wiz-pick-tone" data-id="' + esc(t.id) + '" type="button">';
      html += '<div class="scp-wizard-tone-name">' + esc(t.name) + '</div>';
      html += '<div class="scp-wizard-tone-desc">' + esc(t.description || '') + '</div>';
      html += '</button>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function validateStep4() { return true; } // Tone optional

  function suggestTone(w) {
    if (!isAIReady()) return;
    w.uiState = w.uiState || {};
    if (w.uiState.toneLoading) return;
    w.uiState.toneLoading = true;
    refresh();

    var ws = w.data.workspace || {};
    var tones = (S.meta.settings && S.meta.settings.tones) || [];
    var toneLines = tones.map(function(t) { return '- ' + t.name + ': ' + (t.description || ''); }).join('\n');
    var prompt = 'Pick the single best content tone for this brand from the list below.\n\n' +
      'Brand: ' + (ws.name || 'Unnamed') + '\n' +
      'Niche: ' + (ws.niche || 'general') + '\n' +
      'Audience: ' + (ws.audience_description || 'general audience') + '\n' +
      'Primary platform: ' + (ws.primary_platform || 'multiple') + '\n\n' +
      'Available tones:\n' + toneLines + '\n\n' +
      'Respond ONLY as JSON: {"tone_name":"<exact name from the list>","reasoning":"<one sentence>"}';

    LLMService.callAI(prompt, function(text) {
      try {
        var parsed = parseJSON(text);
        var name = (parsed.tone_name || '').toString().toLowerCase().trim();
        var hit = null;
        for (var i = 0; i < tones.length; i++) {
          if ((tones[i].name || '').toLowerCase().trim() === name) { hit = tones[i]; break; }
        }
        if (hit) {
          w.data.tone = { id: hit.id, name: hit.name, description: hit.description || '' };
          w.uiState.toneSuggestion = { name: hit.name, description: parsed.reasoning || hit.description || '' };
        }
      } catch (e) {
        // Silent — user can just pick manually
      }
      w.uiState.toneLoading = false;
      refresh();
    }, function() {
      w.uiState.toneLoading = false;
      refresh();
    }, 'setup_wizard_tone');
  }

  // ============================================================
  // STEP 5 — REVIEW + PLANNED POSTS
  // ============================================================
  function onEnterStep5(w) {
    w.uiState = w.uiState || {};
    if (w.uiState.postsGenerated) return;
    if (!isAIReady()) return;
    if (!w.data.topics || w.data.topics.length === 0) return;
    generatePlannedPosts(w);
  }

  function plannedPostCountFor(frequency) {
    switch (frequency) {
      case 'daily': return 6;
      case '3x_week': return 5;
      case 'weekly': return 4;
      case '2x_month': return 3;
      case 'monthly': return 2;
      default: return 4;
    }
  }

  function generatePlannedPosts(w) {
    if (!isAIReady()) { toast('AI not configured — finish without seed posts', 'warning'); return; }
    var topics = w.data.topics || [];
    if (topics.length === 0) { toast('Add topics first', 'warning'); return; }
    w.uiState = w.uiState || {};
    if (w.uiState.postsLoading) return;
    w.uiState.postsLoading = true;
    w.uiState.postsError = '';
    refresh();

    var ws = w.data.workspace || {};
    var count = plannedPostCountFor(ws.posting_frequency);
    var primary = ws.primary_platform || 'linkedin';
    var tone = (w.data.tone && w.data.tone.name) || '';
    var topicLines = topics.map(function(t) { return '- ' + t.name + ': ' + (t.description || ''); }).join('\n');

    var prompt = 'Generate ' + count + ' planned social-media post ideas to seed a content calendar.\n\n' +
      'Brand: ' + (ws.name || 'Unnamed') + '\n' +
      'Niche: ' + (ws.niche || 'general') + '\n' +
      'Audience: ' + (ws.audience_description || 'general') + '\n' +
      'Primary platform: ' + primary + '\n' +
      (tone ? 'Tone: ' + tone + '\n' : '') +
      '\nTopics:\n' + topicLines + '\n\n' +
      'Spread the ideas across the topics. Each post should include:\n' +
      '- title (a short working title, not the post body)\n' +
      '- hook (the opening line of the post)\n' +
      '- type (one of: image, carousel, video, text)\n' +
      '- topic_name (exactly one from the topics list)\n\n' +
      'Respond ONLY as JSON: [{"title":"...","hook":"...","type":"...","topic_name":"..."}]';

    LLMService.callAI(prompt, function(text) {
      try {
        var raw = parseJSON(text);
        if (!Array.isArray(raw)) raw = raw.posts || raw.results || [];
        w.data.plannedPosts = [];
        for (var i = 0; i < raw.length; i++) {
          var p = raw[i] || {};
          if (!p.title) continue;
          var topic = findTopicByName(topics, p.topic_name);
          w.data.plannedPosts.push({
            tempId: 'tmp_post_' + (Date.now() + i).toString(36),
            title: (p.title || '').toString().trim(),
            hook: (p.hook || '').toString().trim(),
            type: ['image', 'carousel', 'video', 'text'].indexOf(p.type) > -1 ? p.type : 'image',
            topicTempId: topic ? topic.tempId : '',
            seriesTempId: topic ? (topic.seriesTempId || '') : '',
            platform: primary
          });
        }
        w.uiState.postsGenerated = true;
      } catch (e) {
        w.uiState.postsError = 'Could not parse AI response — finish without seed posts and create them manually.';
      }
      w.uiState.postsLoading = false;
      refresh();
    }, function(err) {
      w.uiState.postsLoading = false;
      w.uiState.postsError = err || 'AI request failed.';
      refresh();
    }, 'setup_wizard_posts');
  }

  function renderStep5(w) {
    var ws = w.data.workspace || {};
    var topics = w.data.topics || [];
    var series = w.data.series || [];
    var posts = w.data.plannedPosts || [];
    var loading = (w.uiState && w.uiState.postsLoading) || false;

    var html = '<div class="scp-wizard-step-content">';
    html += '<h2 class="scp-wizard-headline">Review &amp; seed your calendar</h2>';
    html += '<p class="scp-wizard-sub">A quick recap, then we\'ll save everything and drop a handful of planned posts into your pipeline.</p>';

    // Summary grid
    html += '<div class="scp-wizard-summary">';
    html += summaryItem('briefcase', 'Workspace', ws.name || 'Unnamed');
    if (ws.niche) html += summaryItem('flask', 'Niche', ws.niche);
    if (ws.primary_platform) {
      var pl = (Constants.PLATFORMS && Constants.PLATFORMS[ws.primary_platform]) || {};
      html += summaryItem(pl.icon || 'globe', 'Primary platform', pl.label || ws.primary_platform);
    }
    if (ws.posting_frequency) html += summaryItem('calendar', 'Frequency', humanFreq(ws.posting_frequency));
    html += summaryItem('tags', 'Topics', topics.length + ' topic' + (topics.length === 1 ? '' : 's'));
    html += summaryItem('layer-group', 'Series', series.length + ' series');
    if (w.data.tone && w.data.tone.name) html += summaryItem('face-smile', 'Tone', w.data.tone.name);
    html += '</div>';

    // Planned posts section
    html += '<div class="scp-wizard-posts-section">';
    html += '<div class="scp-wizard-posts-header">';
    html += '<h3>Seed posts <span class="scp-wizard-posts-count">' + posts.length + '</span></h3>';
    if (isAIReady() && topics.length > 0) {
      html += '<button class="scp-btn scp-btn-outline scp-btn-sm" data-action="wiz-gen-posts"' + (loading ? ' disabled' : '') + '>' +
        icon(loading ? 'spinner' : 'sparkles') + ' ' + (loading ? 'Generating…' : (posts.length ? 'Regenerate' : 'Generate with AI')) + '</button>';
    }
    html += '</div>';

    if (w.uiState && w.uiState.postsError) {
      html += '<div class="scp-wizard-error">' + icon('warning') + ' ' + esc(w.uiState.postsError) + '</div>';
    }

    if (posts.length === 0) {
      html += '<div class="scp-wizard-empty scp-wizard-empty--compact">';
      html += '<p>No seed posts yet. ' +
        (isAIReady() ? 'Click <strong>Generate with AI</strong> above, or finish setup and add posts manually.' : 'Finish setup and add posts manually from the Posts view.') +
        '</p></div>';
    } else {
      html += '<div class="scp-wizard-posts-list">';
      for (var i = 0; i < posts.length; i++) html += renderPlannedPost(posts[i], topics, series);
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderPlannedPost(p, topics, series) {
    var topic = null, ser = null;
    for (var i = 0; i < topics.length; i++) if (topics[i].tempId === p.topicTempId) { topic = topics[i]; break; }
    for (var j = 0; j < series.length; j++) if (series[j].tempId === p.seriesTempId) { ser = series[j]; break; }

    var html = '<div class="scp-wizard-post-card" data-temp-id="' + esc(p.tempId) + '">';
    html += '<div class="scp-wizard-post-head">';
    html += '<input type="text" class="scp-input scp-wiz-post-field" data-field="title" value="' + esc(p.title) + '" placeholder="Post title">';
    html += '<button class="scp-btn-icon scp-wizard-topic-delete" data-action="wiz-remove-post" title="Remove">' + icon('trash') + '</button>';
    html += '</div>';
    html += '<textarea class="scp-textarea scp-wiz-post-field" data-field="hook" rows="2" placeholder="Hook (opening line)">' + esc(p.hook) + '</textarea>';
    html += '<div class="scp-wizard-post-meta">';
    if (topic) html += '<span class="scp-wizard-post-chip" style="background:' + esc(topic.color) + '15;color:' + esc(topic.color) + ';border-color:' + esc(topic.color) + '40">' + esc(topic.name) + '</span>';
    if (ser) html += '<span class="scp-wizard-post-chip" style="background:' + esc(ser.color) + '15;color:' + esc(ser.color) + ';border-color:' + esc(ser.color) + '40">' + icon('layer-group') + ' ' + esc(ser.name) + '</span>';
    html += '<span class="scp-wizard-post-type">' + esc(p.type) + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function summaryItem(iconName, label, value) {
    return '<div class="scp-wizard-summary-item">' +
      '<div class="scp-wizard-summary-icon">' + icon(iconName) + '</div>' +
      '<div class="scp-wizard-summary-text">' +
      '<div class="scp-wizard-summary-label">' + esc(label) + '</div>' +
      '<div class="scp-wizard-summary-value">' + esc(value) + '</div>' +
      '</div></div>';
  }

  function humanFreq(f) {
    switch (f) {
      case 'daily': return 'Daily';
      case '3x_week': return '3× per week';
      case 'weekly': return 'Weekly';
      case '2x_month': return 'Twice a month';
      case 'monthly': return 'Monthly';
      default: return f;
    }
  }

  function validateStep5() { return true; }

  // ============================================================
  // FINISH FLUSHER — wizard state → S.data + S.meta
  // ============================================================
  function flushSetup(w) {
    var topicIdMap = {};   // tempId → real id
    var seriesIdMap = {};  // tempId → real id

    // Series first so topics can reference real series ids.
    S.data.series = S.data.series || [];
    var nowIso = new Date().toISOString();
    var seriesDrafts = w.data.series || [];
    for (var s = 0; s < seriesDrafts.length; s++) {
      var sd = seriesDrafts[s];
      var sid = generateId('series');
      seriesIdMap[sd.tempId] = sid;
      S.data.series.push({
        id: sid,
        name: (sd.name || 'Untitled series').trim(),
        description: (sd.description || '').trim(),
        color: sd.color || SERIES_COLORS[s % SERIES_COLORS.length],
        topicIds: [],
        created: nowIso
      });
      if (logActivity) logActivity('series_created', '', '', 'Created series: ' + sd.name);
    }

    // Topics
    S.data.topics = S.data.topics || [];
    var topicDrafts = w.data.topics || [];
    for (var t = 0; t < topicDrafts.length; t++) {
      var td = topicDrafts[t];
      var tid = generateId('topic');
      topicIdMap[td.tempId] = tid;
      var seriesId = seriesIdMap[td.seriesTempId] || '';
      S.data.topics.push({
        id: tid,
        name: (td.name || 'Untitled topic').trim(),
        description: (td.description || '').trim(),
        color: td.color || COLORS[t % COLORS.length],
        seriesId: seriesId,
        created: nowIso
      });
      if (seriesId) {
        // Mirror into series.topicIds for fast lookup later.
        for (var k = 0; k < S.data.series.length; k++) {
          if (S.data.series[k].id === seriesId) { S.data.series[k].topicIds.push(tid); break; }
        }
      }
      if (logActivity) logActivity('topic_created', '', '', 'Created topic: ' + td.name);
    }

    // Tone — store as default tone on settings.defaults so future posts inherit it.
    if (w.data.tone && w.data.tone.id) {
      S.meta.settings = S.meta.settings || {};
      S.meta.settings.defaults = S.meta.settings.defaults || {};
      S.meta.settings.defaults.tone_id = w.data.tone.id;
    }

    // Planned posts → S.data.posts as 'idea' status drafts.
    var posts = w.data.plannedPosts || [];
    if (posts.length > 0) {
      S.data.posts = S.data.posts || [];
      var defs = (S.meta.settings && S.meta.settings.defaults) || {};
      var primary = (w.data.workspace && w.data.workspace.primary_platform) || (defs.platforms && defs.platforms[0]) || 'linkedin';
      for (var p = 0; p < posts.length; p++) {
        var pd = posts[p];
        var post = buildPlannedPost(pd, topicIdMap, seriesIdMap, primary, defs, nowIso);
        S.data.posts.unshift(post);
        if (logActivity) logActivity('post_created', post.id, post.title, 'Seeded from setup wizard');
      }
    }
  }

  function buildPlannedPost(pd, topicIdMap, seriesIdMap, primaryPlatform, defs, nowIso) {
    var topicId = topicIdMap[pd.topicTempId] || '';
    var seriesId = seriesIdMap[pd.seriesTempId] || '';
    return {
      id: generateId('post'),
      title: pd.title || 'Untitled',
      type: pd.type || 'image',
      status: 'idea',
      priority: defs.priority || 'medium',
      topics: topicId ? [topicId] : [],
      seriesId: seriesId,
      source: { type: 'setup_wizard', research_session_id: '', research_idea_id: '', notes: 'Seeded from setup wizard' },
      platforms: [primaryPlatform],
      research: { angles: [], selected_angle: '', angle_custom_input: '', hooks: [], selected_hook: pd.hook || '', hook_custom_input: '', notes: '' },
      content: { body: pd.hook || '', tone_id: defs.tone_id || '', audience_id: defs.audience_id || '', notes: '' },
      carousel: { slide_count: 0, slides: [] },
      video: { concept: '', script: '', duration_seconds: 60, format: 'reel' },
      media: { prompts: [], config: { style_id: '', custom_instructions: '', brand_context_enabled: false } },
      platform_content: {
        linkedin:  { enabled: primaryPlatform === 'linkedin',  body: '', notes: '' },
        instagram: { enabled: primaryPlatform === 'instagram', body: '', notes: '' },
        facebook:  { enabled: primaryPlatform === 'facebook',  body: '', notes: '' },
        youtube:   { enabled: primaryPlatform === 'youtube',   title: '', description: '', tags: [], notes: '' }
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
    // ── Step 2 ──
    $(document).off('click.scp-wiz-gt', '[data-action="wiz-gen-topics"]')
      .on('click.scp-wiz-gt', '[data-action="wiz-gen-topics"]', function(e) { e.preventDefault(); generateTopics(S.setupWizard); });

    $(document).off('click.scp-wiz-at', '[data-action="wiz-add-topic"]')
      .on('click.scp-wiz-at', '[data-action="wiz-add-topic"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        w.data.topics.push({
          tempId: 'tmp_topic_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          name: '', description: '',
          color: COLORS[w.data.topics.length % COLORS.length],
          seriesTempId: ''
        });
        refresh();
      });

    $(document).off('click.scp-wiz-rt', '[data-action="wiz-remove-topic"]')
      .on('click.scp-wiz-rt', '[data-action="wiz-remove-topic"]', function(e) {
        e.preventDefault();
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var w = S.setupWizard;
        w.data.topics = w.data.topics.filter(function(t) { return t.tempId !== tempId; });
        // Cascade: drop topic refs from planned posts
        w.data.plannedPosts = (w.data.plannedPosts || []).map(function(p) {
          return p.topicTempId === tempId ? Object.assign({}, p, { topicTempId: '' }) : p;
        });
        refresh();
      });

    $(document).off('click.scp-wiz-cc', '[data-action="wiz-cycle-topic-color"]')
      .on('click.scp-wiz-cc', '[data-action="wiz-cycle-topic-color"]', function(e) {
        e.preventDefault();
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var w = S.setupWizard;
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) {
            var idx = COLORS.indexOf(w.data.topics[i].color);
            w.data.topics[i].color = COLORS[(idx + 1) % COLORS.length];
            break;
          }
        }
        refresh();
      });

    $(document).off('input.scp-wiz-tf change.scp-wiz-tf', '.scp-wiz-topic-field')
      .on('input.scp-wiz-tf change.scp-wiz-tf', '.scp-wiz-topic-field', function() {
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        var w = S.setupWizard;
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) { w.data.topics[i][field] = val; break; }
        }
      });

    // ── Step 3 ──
    $(document).off('click.scp-wiz-gs', '[data-action="wiz-gen-series"]')
      .on('click.scp-wiz-gs', '[data-action="wiz-gen-series"]', function(e) { e.preventDefault(); generateSeries(S.setupWizard); });

    $(document).off('click.scp-wiz-as', '[data-action="wiz-add-series"]')
      .on('click.scp-wiz-as', '[data-action="wiz-add-series"]', function(e) {
        e.preventDefault();
        var w = S.setupWizard;
        w.data.series.push({
          tempId: 'tmp_series_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          name: '', description: '',
          color: SERIES_COLORS[w.data.series.length % SERIES_COLORS.length]
        });
        refresh();
      });

    $(document).off('click.scp-wiz-rs', '[data-action="wiz-remove-series"]')
      .on('click.scp-wiz-rs', '[data-action="wiz-remove-series"]', function(e) {
        e.preventDefault();
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var w = S.setupWizard;
        w.data.series = w.data.series.filter(function(s) { return s.tempId !== tempId; });
        // Cascade: unassign topics that referenced this series
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].seriesTempId === tempId) w.data.topics[i].seriesTempId = '';
        }
        for (var p = 0; p < (w.data.plannedPosts || []).length; p++) {
          if (w.data.plannedPosts[p].seriesTempId === tempId) w.data.plannedPosts[p].seriesTempId = '';
        }
        refresh();
      });

    $(document).off('input.scp-wiz-sf change.scp-wiz-sf', '.scp-wiz-series-field')
      .on('input.scp-wiz-sf change.scp-wiz-sf', '.scp-wiz-series-field', function() {
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        var w = S.setupWizard;
        for (var i = 0; i < w.data.series.length; i++) {
          if (w.data.series[i].tempId === tempId) { w.data.series[i][field] = val; break; }
        }
      });

    $(document).off('change.scp-wiz-ts', '.scp-wiz-topic-series')
      .on('change.scp-wiz-ts', '.scp-wiz-topic-series', function() {
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var val = $(this).val();
        var w = S.setupWizard;
        for (var i = 0; i < w.data.topics.length; i++) {
          if (w.data.topics[i].tempId === tempId) { w.data.topics[i].seriesTempId = val; break; }
        }
        // Cascade: planned posts inherit topic.seriesTempId at flush time, so
        // we don't need to refresh anything here unless we want re-render to
        // show updated series chips on Step 5 — but the user isn't on Step 5.
      });

    // ── Step 4 ──
    $(document).off('click.scp-wiz-st', '[data-action="wiz-suggest-tone"]')
      .on('click.scp-wiz-st', '[data-action="wiz-suggest-tone"]', function(e) { e.preventDefault(); suggestTone(S.setupWizard); });

    $(document).off('click.scp-wiz-pt', '[data-action="wiz-pick-tone"]')
      .on('click.scp-wiz-pt', '[data-action="wiz-pick-tone"]', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var tones = (S.meta.settings && S.meta.settings.tones) || [];
        var hit = null;
        for (var i = 0; i < tones.length; i++) if (tones[i].id === id) { hit = tones[i]; break; }
        if (!hit) return;
        S.setupWizard.data.tone = { id: hit.id, name: hit.name, description: hit.description || '' };
        refresh();
      });

    // ── Step 5 ──
    $(document).off('click.scp-wiz-gp', '[data-action="wiz-gen-posts"]')
      .on('click.scp-wiz-gp', '[data-action="wiz-gen-posts"]', function(e) { e.preventDefault(); generatePlannedPosts(S.setupWizard); });

    $(document).off('click.scp-wiz-rp', '[data-action="wiz-remove-post"]')
      .on('click.scp-wiz-rp', '[data-action="wiz-remove-post"]', function(e) {
        e.preventDefault();
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var w = S.setupWizard;
        w.data.plannedPosts = (w.data.plannedPosts || []).filter(function(p) { return p.tempId !== tempId; });
        refresh();
      });

    $(document).off('input.scp-wiz-pf change.scp-wiz-pf', '.scp-wiz-post-field')
      .on('input.scp-wiz-pf change.scp-wiz-pf', '.scp-wiz-post-field', function() {
        var tempId = $(this).closest('[data-temp-id]').data('temp-id');
        var field = $(this).data('field');
        var val = $(this).val();
        var w = S.setupWizard;
        for (var i = 0; i < (w.data.plannedPosts || []).length; i++) {
          if (w.data.plannedPosts[i].tempId === tempId) { w.data.plannedPosts[i][field] = val; break; }
        }
      });
  }

})(jQuery);
