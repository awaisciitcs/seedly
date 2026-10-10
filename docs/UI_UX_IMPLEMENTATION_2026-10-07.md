# Seedly UI/UX implementation and rollback guide
Date: 7 October 2026

## Delivery status

The storefront changes are implemented locally in F:\Seedly. The production build passes and a local production preview is running at http://127.0.0.1:3107. Nothing has been deployed. No live orders, inventory, receipts, customer subscriptions, schema, or database procedures were changed during verification.

This is an implementation with automated and HTTP verification, not a claim that the site has no possible defects. Browser visual QA and staging payment/transaction tests remain release checks.

## Design and layout

The homepage now uses a clear editorial hierarchy, consistent spacing, a restrained forest/cream palette, real catalog content, and a clearer shopping flow. The review presentation was subsequently restored by user request as described below. Removed decorative orbit effects, excessive tilt, false trust promises, decorative language switching, and the nonfunctional newsletter. The footer and navigation consistently expose collections, delivery, customer help, and tracking.

Shared controls have larger touch areas, readable contrast, coherent rounded styling, visible selection and focus states, and restrained motion. Product grids keep consistent columns when result counts change. Product names have room for two lines. Image sizes match mobile columns and small basket thumbnails.

Product pages have image galleries with zoom, thumbnails and swipe; clear pack/price choices; modern quantity, basket and saved-item controls; delivery information near purchasing; and reliable sticky purchase feedback. Existing brew and kit interactions remain useful alternatives to decorative 3D. Heavy 3D scenes were deliberately deferred as optional enhancements in the review.

Native modal dialogs now unify search, basket, filters, tracking, quick view, image zoom and restock requests. They provide modal focus behavior, Escape dismissal, scroll locking and focus restoration. Kit tabs support arrow/Home/End navigation. Hidden fixed controls are removed from keyboard navigation. Mobile navigation, toast, support and sticky purchasing coordinate their placement. Reduced-motion preferences suppress unnecessary transforms.

## Discovery and customer workflows

- Search opens a compact product preview and updates while typing, with images, pack sizes, matching prices, stale-request cancellation and error recovery.
- Sorting applies immediately. Categories, price/stock/phase/collection filters and search are reflected in the URL.
- Seeds, teas, kits and Shop share a consistent catalog layout, stable grid and clear empty/reset states.
- Quick view is now reachable. Saved items and the routine finder use current catalog IDs, pack prices and stock.
- Kit comparison uses real catalog prices and contents.
- The customer area is accurately named Orders & saved items. Tracking accepts an order reference rather than pretending to provide authenticated history.
- Catalog outages produce retry feedback rather than appearing as an empty store.

Search no longer fetches review data. It still uses catalog service records for this small catalog; a dedicated bounded database projection should be considered if the catalog grows. No payload or conversion improvement percentage is claimed.

## Commerce safeguards

Basket identities distinguish products, packs and kits. Quantity controls validate input and enforce current stock/quantity limits. Failed additions do not show a success message. Removal undo remains available even for the final line. Refresh uses authoritative prices and availability.

Checkout uses server-calculated signed quotes and configured shipping fees. It validates customer data, line identities and pack ownership, rechecks changed totals, verifies receipt ownership, limits request/upload sizes and rejects cross-site requests. Receipt uploads accept checked JPG/PNG/PDF content and use private storage.

Order attempts retain a stable identity and exact retry body while the page stays open. If a response is uncertain, the user can recover that attempt without placing a new one; existing committed orders can be recovered before rechecking depleted stock. This is tested against mocked order/RPC behavior. Retry state is in page memory, not durable across a reload: do not reload an uncertain checkout; use recovery or support.

Existing transactional order RPCs are retained. Their live SQL concurrency, RLS policies and internal price-update behavior have not been independently audited here. Application prechecks cannot substitute for transaction-level checks inside the database.

Payment and fulfillment remain separate. Pending manual payment does not show packing complete. Cancellation, refund and rejection show appropriate next actions. Private order details require the confirmation capability; order pages prevent indexing and referrer leakage. No fake email/dispatch confirmation is shown.

Restock requests do not expose subscription records or unsubscribe tokens. The notification adapter only prepares messages: it does not deliver email or WhatsApp. Prepared messages are not marked delivered, and subscribers are not marked notified when delivery has not occurred.

## Configuration required before release

SUPABASE_SECRET_KEY is absent from the current local environment. Public catalog reads work, but private receipt upload and restock persistence cannot be fully exercised. Bank-transfer receipt selection is disabled until private upload is available. Configure this server-only key locally and in the deployment environment; never use a NEXT_PUBLIC_ prefix or commit the key. See [Supabase API key documentation](https://supabase.com/docs/guides/getting-started/api-keys).

A private CHECKOUT_SIGNING_SECRET was generated in the ignored local environment. Configure a stable strong secret in production; keep it consistent across server instances and restarts. Changing it invalidates outstanding signed proofs and derived retry capabilities. Do not print or commit its value.

Connect a real notification provider before promising restock/order message delivery. Supabase MCP database inspection was unavailable in this session; no remote migrations or policies were changed.

## Verification evidence

- 28 automated regression tests passed, including order progress, search mapping, basket validation, quote tampering/expiry, receipt ownership, uncertain order retries, variant ownership, safe error responses and rollback.
- TypeScript noEmit passed.
- Next.js production build passed with storefront and product routes rendered dynamically for current stock/prices.
- Live HTTP checks passed for 15 storefront pages: home, Shop, seeds, teas, kits, product, kit detail, basket, checkout, orders/saved items, wishlist, finder, delivery, FAQ and terms.
- Supabase-backed catalog returned 10 items. Search for pumpkin returned three matches with images, prices and pack information.
- A legitimate same-origin quote returned 200 with a signed total. One 100g pumpkin pack quoted PKR 450 plus configured PKR 200 shipping, total PKR 650. No order was placed.
- Basket sync replaced a deliberately stale test price with the current variant price and stock.
- Invalid checkout/quantity requests returned 400; cross-site order requests returned 403; anonymous admin settings returned 401; unsupported order enumeration GET returned 405.
- Unknown order returned 404 with no-referrer and private/no-store headers.
- Private upload returned controlled 503 while the required private key is absent.

Latest build-reported first-load JS: approximately 126KB home, 123KB catalog, 130–132KB product detail, 120KB cart, 122KB checkout and 123KB routine finder. These are build figures, not Lighthouse or Web Vitals measurements.

## Backup and selective rollback

Backup: F:\Seedly-backups\pre-ui-ux-20261007-015918
Base Git commit: a18063dc6d382e5399764a30aa239ac1bec5c2b9

Before implementation, 207 files were copied and SHA256 checked. The backup includes source, assets, local configuration, the local SQLite file and a verified Git bundle. It excludes dependencies, build output and the Git working directory. Treat the backup as private because it contains local configuration and original operational documents.

This is a workspace backup, not a backup of the live Supabase database or Storage. Restoring source must not rewind real orders or inventory. No database rollback is required for these changes because no live schema/data migrations were applied.

All 207 original snapshot checksums were verified again after implementation. At the first implementation handoff, full rollback dry run covered 83 changes: 61 original files to restore and 22 introduced files to remove. The change manifest is refreshed as subsequent work adds files. No rollback was applied to the live workspace. Mixed Windows/forward-slash paths are covered by the rollback regression test.

manifest.json records original files and checksums. changes.json records changed/new/deleted files and section groups. The restore utility defaults to dry run, verifies selected original hashes before modifying anything, rejects unsafe paths and symbolic-link file targets, and saves current selected files in a recovery folder before applying restoration.

Run from F:\Seedly. Use your normal Node 22+ command, or the installed executable shown below.

```powershell
$nodeExecutable = 'C:/Users/HP/.codex/tools/node-v22.23.3-win-x64/node.exe'
$backupFolder = 'F:/Seedly-backups/pre-ui-ux-20261007-015918'

# Preview only: no changes.
& $nodeExecutable scripts/restore-version.mjs --backup $backupFolder --section appearance

# Restore that reviewed section.
& $nodeExecutable scripts/restore-version.mjs --backup $backupFolder --section appearance --apply

# Preview one recorded file, or repeat --file for related files.
& $nodeExecutable scripts/restore-version.mjs --backup $backupFolder --file 'components/storefront/Footer.tsx'

# Preview the complete recorded application restoration.
& $nodeExecutable scripts/restore-version.mjs --backup $backupFolder --section all
```

Sections:
- appearance: shared colors/type/layout, homepage, announcement/footer and delivery/legal presentation.
- discovery: navigation/search/catalog/cards/quick view/routine finder/saved items/tracking and their direct callers.
- commerce: all changed application code, configuration and regression tests, because checkout/provider/dialog/catalog/security dependencies cross page boundaries.
- all: every recorded changed/new/deleted file, including documentation and rollback utilities.

Apply is explicit. Full rollback removes files introduced by this implementation, including the rollback utility after it finishes. The original audit report remains because it existed at backup time. Local environment restoration is included in commerce/all and reverts the locally added signing secret; coordinate environment and application restoration.

Selective files/sections can depend on retained helpers. Always inspect the dry run, keep related callers together, run tests/typecheck/build and restart the server after restoration. A recovery directory saves the prior current bytes of existing selected files; absent files are listed in files.json but have no byte copy. It is not an automatically runnable reverse migration.

Do not use the old npm backup command for this task: its existing script pushes remote state and is not this verified snapshot/restore workflow.

## Staging acceptance before production

1. Configure the private Supabase key and stable signing secret. Test COD, wallet/manual payment and bank receipt flows, including invalid/oversized files, interrupted upload, expired quote, changed price, order response timeout and retry after commit.
2. Inspect the existing transactional RPC and policies in staging. Test concurrent last-stock purchases, ownership, refunds/cancellation and a price/settings change during an order transaction. Ensure the database validates expected prices/stock atomically.
3. Use a real browser at 320, 375, 390, 768, 1024, 1280 and 1440px, 200% zoom, keyboard-only, reduced motion and mobile keyboard/safe-area layouts. Check focus restoration, no hidden focus targets, no clipped essential labels and no overlapping purchasing controls.
4. Measure image transfers, Lighthouse and mobile/desktop Web Vitals. No interactive browser surface was available here, so visual layout and actual focus interaction were not manually verified.
5. Configure and test actual notification delivery before changing prepared/request-saved wording to delivery promises. Establish analytics baselines without collecting payment proofs, raw phone numbers or full addresses.

## Files for review

The original findings are in docs/UI_UX_REVIEW_2026-10-07.md. Current implementation spans app/(store), app/api, components, hooks/useCartQuote.ts and lib. The local source has not been committed or pushed automatically.

## Requested UI refinements: 7 October 2026

A second verified workspace snapshot was taken before these refinements: F:/Seedly-backups/pre-followup-ui-20261007-001338 (228 files). The original backup above is retained.

- Filters: a persistent left sidebar on desktop; a full-height drawer opening from the left on mobile. Filters and sorting still apply immediately. Sidebar and drawer controls have distinct IDs.
- Mini cart: the basket opens directly on click and immediately displays stored items and available totals. Price/stock checks run in the background; the checkout navigation link no longer waits for a quote. Unknown delivery is clearly shown as calculated at checkout. Unavailable items still require removal. Actual order submission continues to require a fresh validated server quote.
- Routine finder: a centered page with a contained progress stepper, visual choice cards, explicit continue/back navigation and a centered results shortlist. All three choices affect presentation or ranking; products still come from the current catalog.
- Cart page: clearer shopping progress, larger product rows, per-pack and line prices, stock-aware quantity controls, undo, a focused summary, delivery progress and useful contact/empty states.
- Order confirmation: a modal loading screen appears after valid submission, with live status for quote checking, receipt upload, order confirmation and navigation. It prevents interaction with the background while the request is pending, closes on errors and preserves the existing retry identity. The final screen only says received after a valid server response.
- Reviews: the original TestimonialCarousel component is mounted again with its exact existing cards, content, numbered controls and styling. Its file checksum matches the original backup. This restores the earlier curated testimonial content; it does not add new verified database reviews. Product review moderation and APIs are unchanged.
- Quotes from a previous quantity/pack selection are not displayed against a changed basket.

TypeScript, the production build and all 28 regression tests passed for the refinements. Eight live page checks and a signed quote check also passed. Both original and follow-up rollback dry runs passed. No real order was submitted during verification. A browser surface remains unavailable for manual responsive/interaction checks.

The second backup changes.json has sections filters, routine, cart, checkout, reviews and appearance, plus all. Use the same restore utility with the second backup path; dry run first. For example:

```powershell
& 'C:/Users/HP/.codex/tools/node-v22.23.3-win-x64/node.exe' scripts/restore-version.mjs --backup 'F:/Seedly-backups/pre-followup-ui-20261007-001338' --section routine
```

Each functional section restores its callers together. Shared CSS is retained when rolling back an individual page; unused styles are harmless. The appearance section restores the shared stylesheet for all refinements, so it affects multiple pages. The original backup change manifest was also refreshed to include newly introduced files, preserving a complete rollback to the initial version.


## Sequential references and confirmation email

The next requested change adds a database sequence beginning at SED-100200, private numeric-order lookup, retry-safe reservations and branded responsive confirmation templates for COD, bank transfer and wallet payments. Existing references are preserved. The code defaults to legacy references until the migration and server credentials are configured. Actual email delivery is opt-in and remains unconfigured.

The dedicated guide is [ORDER_REFERENCES_AND_EMAIL.md](ORDER_REFERENCES_AND_EMAIL.md). It contains activation steps, template previews, migration permissions, delivery limitations and the new 229-file pre-change backup. Forty regression tests, TypeScript, the production build, isolated PostgreSQL migration tests and local HTTP checks passed. No live database migration or real email send was performed. Earlier backup change manifests include these introduced files for complete source restoration. After activating the migration, source rollback alone must preserve the sequence, server lookup access and in-flight checkout compatibility.
