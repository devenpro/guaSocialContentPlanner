# Category: drupal

**Charter.** Code that exists only because we run inside Drupal: behavior registration, hidden-textarea sync, image-widget integration, content-type body-class detection, AJAX-timing retry helpers, save-button hijacking.

**Belongs here.** `Drupal.behaviors.scpPart1` boot wrapper, the readers and writers for `field_json_data` / `field_json_meta` / `field_activity_log`, the `.image-widget` parser, the `beforeunload` dirty-state warning, AJAX retry timers.

**Does not belong here.** Anything that would still make sense if the app were extracted into a standalone HTML page.

**Status.** Empty for now. This glue is currently inlined at the top of `core/scp-part1.js` and will be lifted out during refactor so `core/` becomes Drupal-agnostic.
