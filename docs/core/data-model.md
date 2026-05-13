# SCP Data Model — v1.1

## field_json_data (S.data)

```javascript
{
  posts: [Post],
  research: { sessions: [ResearchSession] },
  tags: [Tag]
}
```

### Post Object

```javascript
{
  id: "post_abc123",           // generateId('post')
  title: "5 Ways to Scale",    // Required
  type: "image",               // "image" | "carousel" | "video" | "text"
  status: "content_writing",   // See STATUS_ORDER below
  priority: "medium",          // "low" | "medium" | "high" | "urgent"
  platforms: ["linkedin", "instagram"],  // Keys from PLATFORMS constant
  tags: ["tag_xyz"],           // Tag IDs referencing S.data.tags

  source: {
    type: "manual",            // "manual" | "research" | "imported"
    research_session_id: "",   // If promoted from research
    research_idea_id: "",
    notes: ""
  },

  research: {
    angles: [],                // AI-generated angle strings
    selected_angle: "",        // User's chosen angle
    angle_custom_input: "",    // User's custom angle input
    hooks: [],                 // AI-generated hook strings
    selected_hook: "",         // User's chosen hook (drives visual planning)
    hook_custom_input: "",
    notes: ""
  },

  content: {
    body: "",                  // Master content (HTML from Quill)
    tone_id: "",               // References S.meta.settings.tones[].id
    audience_id: "",           // References S.meta.settings.audiences[].id
    notes: ""
  },

  carousel: {
    slide_count: 5,            // 3-10
    slides: [{
      index: 0,
      theme: "Hook slide",    // Slide topic/theme
      text_overlay: ""         // Text visible on the slide
    }]
  },

  video: {
    concept: "",               // Video idea description
    script: "",                // Plain-text script (legacy or auto-generated backup)
    duration_seconds: 60,      // 15 | 30 | 60 | 90
    format: "reel",            // "reel" | "short" | "story"
    structured_script: {       // Phase B: Structured JSON script
      hook: {
        voiceover: "",         // Spoken words
        visual: "",            // What the viewer sees
        on_screen_text: "",    // Text overlay on screen
        duration_seconds: 5,
        analysis: ""           // Why this hook works
      },
      body: [{
        section: "Problem",    // Section label
        voiceover: "",
        visual: "",
        on_screen_text: "",
        duration_seconds: 15
      }],
      outro: {
        voiceover: "",
        visual: "",
        on_screen_text: "",
        cta: "Follow + Save",
        duration_seconds: 8
      },
      total_duration: 53,
      music_suggestion: ""
    }
  },

  media: {
    prompts: [{                // Legacy prompt format
      id: "mp_abc",
      type: "image",           // "image" | "thumbnail" | "carousel_slide"
      label: "Image Prompt",
      prompt_text: "",
      negative_prompt: "",
      reference_urls: [],
      style_notes: "",
      status: "draft"          // "draft" | "final"
    }],
    config: {
      style_id: "",            // References S.meta.settings.image_styles[].id
      custom_instructions: "",
      brand_context_enabled: true
    },
    visual_plan: {             // Phase B: Single image/thumbnail visual plan
      visual_concept: {
        scene: "",             // What the image shows
        emotion: "",           // What the viewer should feel
        message_delivered: ""  // The takeaway communicated
      },
      text_overlays: {
        headline: "",          // Primary bold text
        subtext: "",           // Supporting line
        cta: ""                // Action text
      },
      color_mood: {
        palette: "",           // Color direction
        mood: "",              // Emotional tone
        contrast: ""           // Readability guidance
      },
      layout: {
        composition: "",       // Where elements sit
        focal_point: "",       // Eye draw point
        text_placement: ""     // Where text goes
      },
      style_notes: "",
      generation_prompt: ""    // Technical prompt for AI image tools
    },
    visual_plans: [/* ...per-slide visual_plan objects for carousel */]
  },

  platform_content: {
    linkedin:  { enabled: false, body: "", notes: "" },
    instagram: { enabled: false, body: "", notes: "" },
    facebook:  { enabled: false, body: "", notes: "" },
    youtube:   { enabled: false, title: "", description: "", tags: [], notes: "" }
  },

  schedule: {
    date: "2025-06-15",        // ISO date string
    time: "09:00",
    timezone: "Asia/Kolkata",
    published_urls: {
      linkedin: "https://...", // URL after publishing
      instagram: ""
    }
  },

  performance: {},             // Reserved for analytics
  created: "2025-01-15T10:30:00Z",
  updated: "2025-01-15T12:00:00Z",
  created_by: "user_123",
  assigned_to: "",
  review_notes: ""
}
```

### Status Order

```javascript
['idea', 'research', 'content_writing', 'media_prompts', 'platform_adapt', 'ready', 'scheduled', 'published', 'archived']
```

### Research Session

```javascript
{
  id: "rs_abc123",
  topic: "Content marketing trends",
  title: "Content marketing trends",  // Same as topic
  type: "quick",                       // "quick" | "advanced"
  template: "",                        // Template ID if advanced
  results: [{
    id: "ri_xyz",
    title: "5 Ways AI Changes Content",
    hook: "Did you know 80% of marketers...",
    angle: "Data-driven insight",
    format: "carousel",
    content_type: "educational",
    rating: 4,                         // 1-5 stars
    notes: ""
  }],
  created: "2025-01-15T10:00:00Z",
  updated: "2025-01-15T10:05:00Z"
}
```

### Tag

```javascript
{
  id: "tag_abc",
  name: "Q1 Campaign",
  color: "#1a73e8",
  description: "All posts for Q1 launch",
  created: "2025-01-01T00:00:00Z"
}
```

---

## field_json_meta (S.meta)

```javascript
{
  workspace: {
    name: "Brand Social Hub",
    description: "",
    created: "2025-01-01T00:00:00Z"
  },

  settings: {
    timezone: "Asia/Kolkata",
    card_density: "normal",        // "compact" | "normal" | "detailed"
    default_view: "dashboard",     // Any APP_VIEWS key

    platforms: {
      linkedin:  { enabled: true, handle: "@brand", char_limit: 3000, hashtag_limit: 5, best_times: ["09:00","12:00","17:00"], notes: "" },
      instagram: { enabled: true, handle: "@brand", char_limit: 2200, hashtag_limit: 30, best_times: ["11:00","14:00","19:00"], notes: "" },
      facebook:  { enabled: true, handle: "", char_limit: 63206, hashtag_limit: 10, best_times: ["09:00","13:00","16:00"], notes: "" },
      youtube:   { enabled: true, handle: "", title_limit: 100, description_limit: 5000, tag_limit: 500, notes: "" }
    },

    defaults: {
      type: "image",
      platforms: ["linkedin"],
      tone_id: "",
      audience_id: "",
      priority: "medium",
      tags: []
    },

    tones: [{ id: "t_001", name: "Professional", description: "..." }],
    audiences: [{ id: "a_001", name: "B2B Decision Makers", description: "..." }],
    image_styles: [{ id: "is_001", name: "Photorealistic", description: "..." }],
    media_prompt_templates: [...],
    research_templates: [...],

    brand_design: {
      colors: { primary: "#1a73e8", secondary: "#34a853", accent: "#fbbc04", background: "#ffffff", text: "#202124", palette_description: "" },
      typography: { heading_style: "", body_style: "", text_treatment: "" },
      visual_style: { overall_aesthetic: "", photography_style: "", illustration_style: "", icon_style: "", pattern_usage: "", mood: "" },
      layout_rules: { image_composition: "", carousel_consistency: "", thumbnail_style: "", border_radius: "", spacing: "" },
      reference_image_ids: { primary_style: [], carousel_template: [], thumbnail_template: [] },
      brand_prompt_prefix: ""
    }
  },

  aiPreferences: {
    appDefault: { provider: "gemini", model: "gemini-2.5-flash" },
    perAction: {
      "ai-write-content": { provider: "claude", model: "claude-sonnet-4-20250514" }
    },
    lastProvider: "gemini",
    lastModel: "gemini-2.5-flash"
  },

  reference_images: {
    "fid_123": {
      category: "linkedin_cover",  // References image_categories[].id
      style: "is_001",             // References image_styles[].id
      tags: ["brand", "hero"],
      star: true,
      description: "Main brand hero image",
      notes: "",
      usage: ["post_abc"]          // Post IDs that reference this image
    }
  },

  image_categories: [
    { id: "linkedin_cover", label: "LinkedIn Cover", icon: "linkedin", color: "#0077b5" }
  ]
}
```

---

## field_activity_log (S.activity)

```javascript
[
  {
    type: "post_created",          // See ACTIVITY_TYPES constant
    post_id: "post_abc",
    post_title: "5 Ways to Scale",
    description: "Created as image post",
    timestamp: "2025-01-15T10:30:00Z",
    user_id: "123",
    user_name: "admin"
  }
]
```

### Activity Types

```
post_created, post_updated, post_deleted, post_status_changed, post_promoted,
post_archived, post_rescheduled, research_created, research_completed,
content_written, content_improved, slides_planned, script_generated,
media_prompts_generated, media_prompts_built, media_prompts_enhanced,
visual_plan_created, structured_script_created, platform_adapted,
angles_researched, hooks_researched, image_uploaded, tag_created,
tag_updated, tag_deleted, settings_changed, data_imported, data_exported
```
