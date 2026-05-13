/**
 * @category    ai
 * @purpose     Brand context: reads brand JSON from Drupal `.brand-*-data` divs,
 *              produces system-prompt strings, auto-populates brand-design fields.
 * @exports     window.BrandService
 * @depends-on  window._scpState (alias S), jQuery
 * @extracted-from  src/ai/scp-part2b.js (was inline SECTION 3, lines 548–692 of v0.1.0)
 */
(function($) {
  'use strict';

  // ============================================================
  // SECTION 3: BrandService
  // ============================================================

  window.BrandService = (function() {
    var S;  // acquired inside init() from window._scpState (set by core/scp-part1.js)
    var _parsed = {}, _identity = { name: '', id: '', logoUrl: '' }, _raw = {};
    var CONTEXT_DIVS = { core: '.brand-core-data', video: '.brand-video-data', content: '.brand-content-data', seo: '.brand-seo-data', social: '.brand-social-data' };

    function init() {
      S = window._scpState;
      _parsed = {}; _raw = {};
      var $wrap = $('.brand-data');
      if ($wrap.length) {
        _identity = { name: ($wrap.find('.brand-name').text() || '').trim(), id: ($wrap.find('.brand-id').text() || '').trim(), logoUrl: ($wrap.find('.brand-logo-url').text() || '').trim() };
      }
      for (var type in CONTEXT_DIVS) {
        var $div = $(CONTEXT_DIVS[type]);
        if ($div.length) { var text = $div.text().trim(); if (text) { _raw[type] = text; try { _parsed[type] = JSON.parse(text); } catch(e) { _parsed[type] = null; } } }
      }
      S.brand = { configured: Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).length > 0, identity: _identity, core: _parsed.core || null, video: _parsed.video || null, content: _parsed.content || null, seo: _parsed.seo || null, social: _parsed.social || null };
      console.log('[SCP] BrandService: ' + (_identity.name || 'none') + ', contexts: ' + Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).join(', '));
    }

    function isConfigured() { return S && S.brand && S.brand.configured; }
    function getCore() { return _parsed.core || {}; }
    function getSocial() { return _parsed.social || {}; }
    function getContent() { return _parsed.content || {}; }
    function getSeo() { return _parsed.seo || {}; }
    function getAudience() { return (_parsed.core || {}).audience || {}; }
    function getForbiddenWords() { return (_parsed.core || {}).forbidden_words || []; }
    function getDos() { return (_parsed.core || {}).dos || []; }
    function getDonts() { return (_parsed.core || {}).donts || []; }

    function getSystemPrompt(contextType) {
      if (!isConfigured()) return '';
      var core = _parsed.core || {}; var parts = [];
      var brandName = core.brand_name || _identity.name || 'this brand';
      parts.push('You are an expert social media content creator for ' + brandName + '. Every output must embody this brand perfectly.');
      if (core.tagline) parts.push('Brand tagline: ' + core.tagline);
      if (core.brand_voice) parts.push('Brand voice & personality: ' + core.brand_voice);
      // Audience with psychographics
      if (core.audience) {
        var aud = core.audience;
        if (aud.primary) parts.push('Primary audience: ' + aud.primary);
        if (aud.pain_points) parts.push('Pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
        if (aud.desires) parts.push('Desires: ' + (Array.isArray(aud.desires) ? aud.desires.join('; ') : aud.desires));
        if (aud.objections) parts.push('Common objections: ' + (Array.isArray(aud.objections) ? aud.objections.join('; ') : aud.objections));
      }
      if (core.forbidden_words && core.forbidden_words.length) parts.push('FORBIDDEN WORDS (never use these): ' + core.forbidden_words.join(', '));
      // Platform-specific context
      if ((contextType === 'social' || contextType === 'platform') && _parsed.social) {
        var soc = _parsed.social;
        var platTones = [];
        if (soc.social) {
          if (soc.social.linkedin && soc.social.linkedin.tone) platTones.push('LinkedIn: ' + soc.social.linkedin.tone);
          if (soc.social.instagram && soc.social.instagram.tone) platTones.push('Instagram: ' + soc.social.instagram.tone);
          if (soc.social.facebook && soc.social.facebook.tone) platTones.push('Facebook: ' + soc.social.facebook.tone);
        }
        if (platTones.length) parts.push('Platform tone variations: ' + platTones.join(' | '));
      }
      // Content writing style
      if ((contextType === 'content' || contextType === 'platform') && _parsed.content) {
        var cnt = _parsed.content;
        if (cnt.writing_style) parts.push('Writing style: ' + cnt.writing_style);
        if (cnt.sentence_rules) parts.push('Sentence rules: ' + (Array.isArray(cnt.sentence_rules) ? cnt.sentence_rules.join('; ') : cnt.sentence_rules));
        if (cnt.cta_style) parts.push('CTA style: ' + cnt.cta_style);
      }
      // Content pillars
      if (_parsed.video && _parsed.video.content_pillars && _parsed.video.content_pillars.length) {
        parts.push('Content pillars: ' + _parsed.video.content_pillars.join(', '));
      }
      // DOs and DON'Ts
      if (core.dos && core.dos.length) parts.push('ALWAYS: ' + core.dos.slice(0, 6).join('; '));
      if (core.donts && core.donts.length) parts.push('NEVER: ' + core.donts.slice(0, 6).join('; '));
      return parts.join('\n');
    }

    function getBrandDesignPrompt() {
      var bd = (S && S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      // Check if custom prefix was manually written
      if (bd.brand_prompt_prefix && bd.brand_prompt_prefix.trim()) return bd.brand_prompt_prefix;
      // Otherwise auto-build from structured fields
      return buildBrandDesignText(bd);
    }

    function buildBrandDesignText(bd) {
      if (!bd) return '';
      var lines = [];
      lines.push('BRAND VISUAL IDENTITY:');
      // Colors
      var c = bd.colors || {};
      if (c.primary || c.secondary || c.accent) {
        var colorParts = [];
        if (c.primary) colorParts.push('Primary ' + c.primary);
        if (c.secondary) colorParts.push('Secondary ' + c.secondary);
        if (c.accent) colorParts.push('Accent ' + c.accent);
        lines.push('Colors: ' + colorParts.join(', ') + '.');
        if (c.background) lines.push('Background: ' + c.background + '. Text: ' + (c.text || '#202124') + '.');
        if (c.palette_description) lines.push('Palette feel: ' + c.palette_description);
      }
      // Typography
      var t = bd.typography || {};
      if (t.heading_style || t.body_style) {
        var typoParts = [];
        if (t.heading_style) typoParts.push('Headings: ' + t.heading_style);
        if (t.body_style) typoParts.push('Body: ' + t.body_style);
        lines.push('Typography: ' + typoParts.join('. ') + '.');
        if (t.text_treatment) lines.push('Text on images: ' + t.text_treatment);
      }
      // Visual style
      var vs = bd.visual_style || {};
      if (vs.overall_aesthetic) lines.push('Visual Style: ' + vs.overall_aesthetic);
      if (vs.photography_style) lines.push('Photography: ' + vs.photography_style);
      if (vs.illustration_style) lines.push('Illustrations: ' + vs.illustration_style);
      if (vs.icon_style) lines.push('Icons: ' + vs.icon_style);
      if (vs.mood) lines.push('Mood: ' + vs.mood);
      // Layout
      var lr = bd.layout_rules || {};
      if (lr.image_composition) lines.push('Layout: ' + lr.image_composition);
      if (lr.carousel_consistency) lines.push('Carousel: ' + lr.carousel_consistency);
      if (lr.thumbnail_style) lines.push('Thumbnails: ' + lr.thumbnail_style);
      // Reference images
      var refs = bd.reference_image_ids || {};
      var refCount = (refs.primary_style || []).length + (refs.carousel_template || []).length + (refs.thumbnail_template || []).length;
      if (refCount > 0) lines.push('Reference images provided — match this exact visual style.');
      // Final instruction
      if (lines.length > 1) lines.push('CRITICAL: All generated images MUST follow this brand guide for visual consistency.');
      return lines.length > 1 ? lines.join('\n') : '';
    }

    function autoPopulateBrandDesign() {
      if (!isConfigured()) return;
      var bd = (S && S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      var core = _parsed.core || {};
      // Only auto-fill empty fields — never overwrite user customizations
      if (!bd.colors) bd.colors = {};
      if (!bd.colors.primary && core.brand_colors && core.brand_colors.primary) bd.colors.primary = core.brand_colors.primary;
      if (!bd.colors.secondary && core.brand_colors && core.brand_colors.secondary) bd.colors.secondary = core.brand_colors.secondary;
      if (!bd.colors.accent && core.brand_colors && core.brand_colors.accent) bd.colors.accent = core.brand_colors.accent;
      if (!bd.visual_style) bd.visual_style = {};
      if (!bd.visual_style.mood && core.brand_voice) bd.visual_style.mood = core.brand_voice;
      if (S && S.meta && S.meta.settings) S.meta.settings.brand_design = bd;
    }

    return { init: init, isConfigured: isConfigured, getSystemPrompt: getSystemPrompt, getBrandDesignPrompt: getBrandDesignPrompt, buildBrandDesignText: buildBrandDesignText, autoPopulateBrandDesign: autoPopulateBrandDesign, getCore: getCore, getSocial: getSocial, getContent: getContent, getSeo: getSeo, getAudience: getAudience, getForbiddenWords: getForbiddenWords, getDos: getDos, getDonts: getDonts };
  })();

})(jQuery);
