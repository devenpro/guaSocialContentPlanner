# SCP Style Reference — v1.1

## CSS Variables (Design Tokens)

### Colors
```css
--scp-primary: #1a73e8;          --scp-primary-light: #e8f0fe;
--scp-primary-hover: #1557b0;    --scp-primary-dark: #174ea6;
--scp-success: #0d904f;          --scp-success-light: #e6f4ea;
--scp-warning: #e37400;          --scp-warning-light: #fef7e0;
--scp-error: #d93025;            --scp-error-light: #fce8e6;
--scp-accent: #9334e9;           --scp-accent-light: #f3e8fd;
--scp-white: #ffffff;
--scp-gray-50: #f8f9fa;          --scp-gray-100: #f1f3f4;
--scp-gray-200: #e8eaed;         --scp-gray-300: #dadce0;
--scp-gray-400: #bdc1c6;         --scp-gray-500: #9aa0a6;
--scp-gray-600: #80868b;         --scp-gray-700: #5f6368;
--scp-gray-800: #3c4043;         --scp-gray-900: #202124;
```

### Typography
```css
--scp-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--scp-font-size-xs: 11px;    --scp-font-size-sm: 13px;
--scp-font-size-base: 14px;  --scp-font-size-md: 16px;
--scp-font-size-lg: 20px;    --scp-font-size-xl: 24px;
```

### Spacing
```css
--scp-space-1: 4px;   --scp-space-2: 8px;   --scp-space-3: 12px;
--scp-space-4: 16px;  --scp-space-5: 20px;  --scp-space-6: 24px;
--scp-space-8: 32px;
```

### Borders & Radius
```css
--scp-border-light: #e8eaed;   --scp-border-default: #dadce0;
--scp-radius-sm: 4px;   --scp-radius-md: 8px;
--scp-radius-lg: 12px;  --scp-radius-xl: 16px;
--scp-radius-full: 999px;
```

### Shadows
```css
--scp-shadow-sm: 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1);
--scp-shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--scp-shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
```

### Semantic
```css
--scp-bg-primary: var(--scp-white);
--scp-bg-secondary: var(--scp-gray-50);
--scp-text-primary: var(--scp-gray-900);
--scp-text-secondary: var(--scp-gray-700);
--scp-text-muted: var(--scp-gray-500);
```

## Component Patterns

### Buttons
```css
.scp-btn          /* Base: pill-shaped, 500 weight, translateY(-1px) on hover */
.scp-btn-primary  /* Blue background */
.scp-btn-outline  /* Border only */
.scp-btn-ai       /* Purple accent, sparkles icon */
.scp-btn-sm       /* Small variant */
.scp-btn-icon     /* Icon-only (32x32) */
.scp-btn-delete-sm /* Red icon button */
```

### Inputs
```css
.scp-input    /* Text input: 1.5px border, blue glow on focus */
.scp-select   /* Dropdown: same border treatment */
.scp-textarea /* Multi-line: same treatment, min-height */
```

### Cards
```css
.scp-card         /* White background, border, radius-lg, shadow-sm */
.scp-stat-card    /* Dashboard stat: value + label + subtitle */
.scp-prompt-card  /* Media prompt: header + body + actions */
.scp-img-card     /* Image grid: thumbnail + metadata */
```

### Badges
```css
.scp-badge        /* Generic: small pill with bg + text color */
.scp-status-badge /* Status with icon */
.scp-tag-chip     /* Tag: bordered pill */
```

### Modals
```css
.scp-modal-overlay   /* Fixed overlay with backdrop */
.scp-modal           /* Centered panel, max-width 600px */
.scp-modal-header    /* Title + close button */
.scp-modal-body      /* Scrollable content */
.scp-modal-footer    /* Action buttons */
```

## Z-Index Scale
```
1    — Card overlays, tooltips
10   — Sticky headers
100  — Dropdowns, popovers
500  — Sidebar (when overlaying content on mobile)
900  — Modal overlay
1000 — Modal panel
1100 — Toast notifications
```

## Breakpoints
```css
@media (max-width: 1200px) { /* Sidebar collapses */ }
@media (max-width: 992px)  { /* Grid adjustments */ }
@media (max-width: 768px)  { /* Mobile layout */ }
@media (max-width: 480px)  { /* Small mobile */ }
```

## AIO Renderer Classes (scp-aio-*)

| Class | Purpose |
|-------|---------|
| `.scp-aio-container` | Outer wrapper with schema border color |
| `.scp-aio-header` | Title bar with icon + export toolbar |
| `.scp-aio-export-toolbar` | Export buttons row |
| `.scp-aio-export-btn` | Individual export button |
| `.scp-aio-section` | Collapsible section card |
| `.scp-aio-section-header` | Clickable header with chevron |
| `.scp-aio-section-body` | Collapsible content area |
| `.scp-aio-field` | Single field wrapper |
| `.scp-aio-field-label` | Field label |
| `.scp-aio-input` | Editable text/textarea/number input |
| `.scp-aio-field-value` | Read-only display value |
| `.scp-aio-list-item` | Expandable list item (video body) |
| `.scp-aio-sequence-item` | Numbered sequence item (carousel) |
| `.scp-aio-sequence-header` | Sequence item header with number |

## Script Timeline Classes (scp-script-timeline-*)

| Class | Purpose |
|-------|---------|
| `.scp-script-timeline` | Container |
| `.scp-script-timeline-bar` | Flex bar with colored segments |
| `.scp-script-timeline-segment` | Proportional colored segment |
| `.scp-script-timeline-legend` | Color legend below bar |
