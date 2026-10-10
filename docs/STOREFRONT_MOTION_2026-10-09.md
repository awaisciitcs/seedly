# Storefront motion and depth ? 9 October 2026

The storefront now has pointer-responsive depth on the home hero, collection photos, product cards and product galleries. The hero uses a restrained stacked frame and a raised caption using the existing photography. Shared product image controls and basket actions keep their original positions.

Collections, product cards, the kit feature and the story section reveal once as they enter view. The existing Reveal component keeps server-rendered content visible before JavaScript and reveals immediately on focus. Products retain full-height cards so prices and basket actions align even when pack descriptions wrap.

A storefront-only Next.js template adds a short opacity entrance on route changes. It does not intercept navigation or transform the page container. Button hover/press feedback, saved/added icon feedback, photo changes and routine-question/results transitions are brief and finite. Existing dialog, basket and search behavior is preserved. Review markup/data, order logic, payment state, email configuration, API handlers and database objects were not changed.

## Motion and performance

Depth uses CSS perspective/rotateX/rotateY/translate3d. It runs only while a fine mouse pointer moves over an eligible surface, with a single requestAnimationFrame update per paint and no React state changes per move. It resets on pointer leave/cancel/down, focus, preference changes and a hidden document; callbacks and listeners are cleaned up on unmount.

Touch/coarse pointers, reduced-motion preferences and supported Save-Data settings keep depth static. The reduced-motion media rule also disables route/photo entrances and tactile transforms. Decorative sheen cannot capture clicks; keyboard focus stays visible. There are no new WebGL canvases, models, image downloads or animation libraries. Affected page bundles increased by roughly 2 KB in the production build.

Entrances run for 220?480 ms. Active depth follows the pointer over 100 ms and returns to neutral over 320 ms; the hero is limited to 5 degrees and product images to 3 degrees. There is no new continuous auto-animation.

References: [Next.js templates](https://nextjs.org/docs/app/api-reference/file-conventions/template), [reduced-motion preferences](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

## Verification

- TypeScript and production build passed.
- All 66 existing Node regression tests passed.
- All 60 local production HTTP smoke checks passed.
- Eleven headless Chrome browser checks passed at 1440?1024, 390?844 and 320?740: hero pointer depth; live reduced-motion reset; image proportions/button alignment; quick-view open/Escape; gallery keyboard activation, Escape and focus return; basket addition/immediate drawer opening; checkout error correction while typing; static mobile depth/no horizontal overflow; narrow catalog layout; routine heading focus; and no browser runtime exceptions.
- Desktop home/shop/product and mobile home/hero/shop/routine screenshots were inspected. Evidence and the reproducible browser script are in the backup folder.
- Browser tests used a separate temporary profile, blocked the order endpoint and created no customer order or email. They used the public catalog and local basket/form state only.
- These checks do not certify every browser, device, screen reader or real-device frame rate. Use a staging pass on Safari/iOS and actual low-end Android before production deployment.

## Preview and rollback

The updated production preview runs at http://127.0.0.1:3000. This work was not deployed to the public host.

The source snapshot is F:/Seedly/backups/pre-storefront-motion-20261009. Six original files were saved before edits and SHA256-verified; new files are recorded for removal during a full rollback. The backup contains no application environment secrets.

Dry-run examples:

~~~powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-storefront-motion-20261009 --section all
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-storefront-motion-20261009 --section homepage
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-storefront-motion-20261009 --section products
~~~

Add --apply to perform a reviewed restore. Homepage/products sections restore their respective markup while retaining shared effects on the other pages. Restore all for the complete pre-motion source version. CSS, DepthSurface and its consumers form a coupled bundle; restoring only the stylesheet would remove sizing rules required by the new photo wrappers. Rebuild and rerun relevant checks after restoring.
