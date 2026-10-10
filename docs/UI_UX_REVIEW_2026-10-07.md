# Seedly UI, UX, and customer workflow review

Review date: 7 October 2026. Repository revision reviewed: a18063d.

**Overall assessment:** Seedly has the foundations of a useful store: recognizable product categories, automatic sorting, image-based live search, pack-size selection, local payment methods, saved items, and product-specific guidance. The biggest improvements are to make these features work consistently, simplify the visual presentation, and replace unsupported interface promises with reliable feedback. Another layer of decoration would have less value than fixing the purchase and tracking flows.

**Scope and evidence:** This is a source-based audit of the current repository, informed by the screenshots supplied in the conversation and direct inspection of the current hero image. The current source uses a white, charcoal, and amber design with Roboto; the earlier cream-and-green screenshots are not treated as screenshots of the current implementation. Browser inspection was attempted, but Computer Use stopped because it could not reliably verify the current browser URL. No live checkout, order submission, device screenshots, screen-reader session, or performance benchmark was completed. Findings below distinguish source-confirmed behavior, source-derived defects, and design recommendations. There were no storefront implementation changes during this review.

**Priority definitions:** P0 means a purchase-blocking or payment-critical problem to address first. P1 means a substantial discovery, trust, accessibility, or conversion problem. P2 means useful polish after the main flows are reliable. Priorities are judgments about potential impact, not measured conversion losses.

**1. Customer workflow**

| Stage | Current implementation | Main improvement |
| --- | --- | --- |
| Arrive and orient | Hero, category collections, featured products, testimonials, kit promotion, brand story | Reduce competing badges and decorations; make shopping the dominant first action |
| Discover products | Shop chips and filter drawer; separate Seeds, Teas, and Kits pages; search dialog elsewhere | Keep navigation and live search available everywhere; synchronize filters with the URL |
| Evaluate a product | Main image, description, prices, variants, stock, delivery strip, accordions, reviews | Show actual packaging and gallery images; surface reviews and essential facts before lengthy guidance |
| Add to basket | Desktop drawer; mobile toast; quantity controls and shipping progress | Repair drawer closing; report stock limits and price changes accurately |
| Complete checkout | One page with contact, delivery, payment, and order summary groups | Load correct public payment configuration; provide a server-backed quote; improve mobile summary and error recovery |
| Follow the order | Confirmation page, header tracking popup, account tracker | Use one working tracking flow and the same payment/fulfillment labels everywhere |
| Return later | Local wishlist and a footer newsletter form | Explain what is saved, recover failures, and only confirm subscriptions that were actually stored |

The ideal direct purchase path is Home → Category/Search → Product → Basket → Checkout → Confirmation/Tracking. The routine finder should be an optional branch that returns customers to the same catalog, variant, stock, and basket rules.

**2. Fix the critical workflow problems first**

**P0 — Cart drawer closing cancels itself.**

Source-derived defect: in components/cart/CartDrawer.tsx:43, the synchronization effect depends on isClosing. When handleClose sets isClosing to true, that effect runs while isCartOpen is still true, clears the close timeout, and resets isClosing to false. The scroll-lock effect also clears the timeout when the handleClose callback changes. The expected result is that the X, backdrop, Escape, and “Keep Browsing” close actions can fail; checkout uses a separate immediate-close path.

Use one open/closing lifecycle, keep the close timer independent of the state that triggers its cancellation, and restore focus after dismissal. This requires a meaningful interaction regression check. Acceptance: open the basket, dismiss it separately with X, backdrop, Escape, and Keep Browsing; repeat twice; confirm the overlay disappears and body scrolling returns every time.

**P0 — Guest checkout cannot load the payment settings it requests.**

Source-confirmed mismatch: app/(store)/checkout/page.tsx:131 requests /api/admin/settings. Its GET handler in app/api/admin/settings/route.ts requires OWNER authorization. A guest will not obtain those settings and the checkout silently retains its hard-coded fallback payment details. Those fallback details also differ from the defaults in lib/services/settings.ts. This is a payment-critical UI problem.

Provide a public response containing only customer-facing payment and delivery configuration, or pass that configuration from the server-rendered checkout. Display a loading or retry state; do not offer a transfer destination based on unverified fallback values. Acceptance: test as a guest and confirm the displayed bank/wallet details match the configured store settings; when loading fails, transfers show a recoverable error instead of fallback details.

**3. High-impact discovery, trust, and conversion fixes**

| Priority and finding | Evidence and customer impact | Action and acceptance check |
| --- | --- | --- |
| P1 — Tracking popup calls an unsupported endpoint | TrackOrderModal.tsx requests GET /api/orders?search=…; app/api/orders/route.ts exports POST only. A legitimate lookup is therefore expected to fall into the “No active order” message. The popup also reads status rather than order_status and defaults to CONFIRMED. | Connect it to the existing capability-based tracking flow or a dedicated public tracking endpoint. Use real order/payment fields and distinguish invalid input, not found, and service failure. Verify a known staging order through every tracking entry point. |
| P1 — Search disappears from mobile Shop | Navbar.tsx:78 replaces desktop navigation with a submit-only search form on /shop. That form is hidden below md, while the search icon is omitted on /shop at all widths. ShopCatalogClient contains no alternative search input. | Keep the same image-based live search on all pages, including Shop at 320–767px. Preserve the typed query when opening full results and allow clear/reset without losing unrelated filters. |
| P1 — Shop filters operate on an already restricted dataset | ShopPage fetches products for the URL category/search, then ShopCatalogClient filters that subset locally. Visiting /shop?category=seeds and selecting Teas cannot reveal teas that were never loaded. Clear all only resets local state. Filter/sort changes do not update the URL. | Choose one consistent model: fetch through URL changes, or load the small full catalog and apply all filters locally. Persist category, search, price, stock, and sort in the URL. Verify category switching, Clear all, refresh, and browser Back from a filtered entry URL. |
| P1 — Delivery totals have several sources | CartProvider fixes the free-delivery threshold at Rs. 2,500; CartPage fixes the fee at Rs. 200; checkout/PDP use siteConfig; order quotation uses Supabase settings. A settings change can make the paid order total differ from the displayed total. | Use one public configuration and a server-backed quote before placing the order. Show subtotal, delivery, and final total consistently. Change shipping settings in staging and verify home messaging, PDP, drawer, cart, checkout, and confirmation agree. |
| P1 — Routine recommendations use hard-coded catalog data | find-your-seed/page.tsx embeds IDs, prices, and images and adds products with a separate “-quiz” basket key, without variant IDs or stock limits. Catalog changes can leave the recommendation and basket out of sync. | Resolve recommendations against live products and variants. Reuse the regular basket identity and stock checks. Verify the same pack added through the quiz and PDP merges into one line, uses the current price, and cannot be added when unavailable. |
| P1 — Newsletter confirms a subscription without saving it | Footer.tsx:35 only changes local subscribed state; it does not call a service or persist the email. The customer sees a success message for an action that did not occur. | Connect to a real subscription service with pending, success, duplicate, and error states, or remove the form until it works. Verify a staging subscription is actually recorded and failure never shows success. |
| P1 — “Verified” reviews are not consistently grounded | TestimonialCarousel.tsx contains hard-coded review sets under “Verified Pantry Stories.” Their authenticity cannot be established from source. ProductDetailView.tsx:706 calls the entire review count “verified,” although individual records have a separate verified_purchase flag. | Use approved genuine feedback, retain provenance for curated quotes, and reserve “Verified buyer” for verified purchases. Label other feedback accurately. Do not imply that moderation alone verifies a purchase. |
| P1 — Receipt upload failure can be ignored | Checkout handles a non-OK upload response by continuing to create the order without a receipt path. A customer who selected a receipt may believe the proof was received. | Show a clear upload failure and retry before proceeding, or explicitly let the customer choose to place an unpaid order. Preserve form data and validate file type/size before upload. Test rejected files, connection failure, and switching payment methods. |
| P1 — Basket feedback can claim success without adding quantity | CartProvider caps an existing line at stock but still announces “Added.” Live revalidation changes price/stock silently, without resolving quantities that now exceed stock or removing unavailable catalog entries. | Announce “Stock limit reached” when quantity did not increase. Show price/availability changes next to the affected line and require an accurate quote before checkout. Test a full-stock basket and a saved basket after stock decreases. |
| P1 — Checkout retry lacks a stable request identity | The orders API supports idempotency, but checkout does not submit an idempotency key. A lost response followed by a retry could create another order; disabling the button alone does not handle that case. | Persist one key for a single checkout attempt and reuse it on retry. Show recoverable connection feedback while preserving fields and basket state. Verify a simulated lost response and retry results in one staging order. |

Also correct the checkout “Pending Ref” in checkout/page.tsx:116: it is a random UI value and is not included in the order request. Remove it unless it is a real server reservation that becomes the order reference. Keep confirmation delivery claims conditional on actual notification outcomes rather than always claiming both email and WhatsApp confirmation were dispatched.

**4. Visual direction and layout**

**Recommended direction: a restrained, contemporary pantry store.** Use the actual products, packaging, clear specifications, and useful preparation guidance as the identity. The existing neutral canvas and lifestyle hero can support this. The hero asset shows a warm kitchen scene and a Seedly pouch, but this review cannot establish its provenance or whether it matches current physical packaging. Confirm that all imagery and packaging claims accurately represent what customers receive.

The source currently combines oversized heavy home headings, medium-weight catalog/PDP headings, many uppercase micro-labels, nested rounded frames, orbit lines, tilted testimonials, and repeated pill badges. These choices can create a template-like impression because decoration repeats more often than product-specific information. Simplify the system before introducing another visual style.

| Element | Recommended specification | Purpose |
| --- | --- | --- |
| Main page container | One shared maximum around 1,200–1,280px; consistent 16–20px mobile and 24–32px desktop gutters | Align header, content, grids, and footer edges |
| Body copy | Usually 16px, with 1.5–1.65 line height; 14px for secondary product facts | Keep ingredients, delivery, and payment instructions readable |
| Small labels | Usually 12–14px; use 10–11px only for genuinely secondary metadata | Prevent important instructions from looking like fine print |
| Headings | Establish one scale: approximately 40–56px desktop hero, 32–40px mobile hero, 28–36px section titles, 18–20px card titles where space allows | Create hierarchy through size and spacing rather than many weights |
| Font weights | Mostly regular, medium, and semibold; reserve very heavy weight for limited brand emphasis | Make home, catalog, and checkout feel like one store |
| Palette | One light canvas, one slightly tinted surface, charcoal text, one restrained brand accent; semantic colors for success/warning/error | Give color a clear meaning |
| Shape and borders | About 12–16px for product/image surfaces, up to 20–24px for larger panels; pills for compact controls; predominantly 1px borders | Avoid every element becoming a badge or oversized rounded card |
| Spacing | Use a small consistent scale such as 8, 12, 16, 24, 32, 48, and 64px | Make grouping and reading order predictable |

Roboto is usable; another font is not required to look professional. If a distinctive display face is introduced, limit it to editorial headings and keep controls and dense product information in the readable body face. Consolidate the font/color definitions in globals.css and tailwind.config.js so future pages cannot quietly adopt different systems.

**Home page.** Keep one primary “Shop the pantry” action and a quieter routine-finder link. Remove the decorative orbit, extra tilted outline, standalone amber orb, and redundant image borders; allow the image to carry the visual interest. Reduce repeated sparkle/pill labels. Replace “Always In Stock” with a truthful heading such as “Pantry essentials,” or generate availability messaging from inventory. State dispatch timing with an appropriate payment-verification qualification.

Recommended sequence: concise hero → three category entry points → featured products → real customer proof → useful kit comparison/promotion → compact sourcing story. The current collection cards contain several paragraphs and mini-labels before the featured grid; shorten those cards, especially on mobile, so customers reach products sooner. Replace the six large review-navigation tiles with compact controls; selecting “Review 01” has little information value.

**Header and navigation.** Keep logo, category navigation, search, saved items, and basket in the same places across routes. Shop currently replaces category navigation with search, which makes the header change its job during browsing. Keep tracking in an accessible help/account location if header space is tight. The equal-side three-column header needs visual verification around 1,024–1,280px because the utilities and six navigation links compete for space. Collapse navigation before it crowds the controls.

The EN/UR switch only toggles component state; it does not change content, html language, or direction. Remove the control until translation is implemented, or complete translation, persistent preference, and RTL behavior throughout the flow. A decorative language toggle reduces trust.

**Catalog and category pages.** Preserve instant sorting; there is already no Apply button. Use one consistent toolbar and keep the result count visible on mobile. Show active filter chips and give an empty result page a useful route back to all products. Keep card widths stable as result counts change: the current count-dependent grid changes from two columns to one mobile column when only two or three results remain, and expands cards on desktop. Use a stable responsive grid instead of changing the layout based on the result count.

Product names use a one-line clamp in ProductCard.tsx:151. Allow two lines of consistent reserved height so customers can distinguish similar teas and kits. Display the selected/default pack size beside its matching price, and use the same variant when sorting or filtering by price. The in-stock filter currently checks the first active variant, whereas the card can display a different default variant; choose and communicate one availability rule, such as “any pack available.”

QuickViewModal exists but ProductCard never calls setIsQuickViewOpen(true), so quick view is currently unreachable from that card. Either expose a clearly labeled, keyboard-accessible Quick view action or remove the dormant component. Retain a direct link to full product information.

**Product pages.** The two-column desktop structure and prominent price/stock controls are sensible. Add a real image gallery: product detail currently renders one main image even though the data service maps gallery_images. Useful views include front/back packaging, ingredients close-up, pack scale, seal/date label, and a serving example. Provide an accessible zoom action and swipe controls rather than relying on hover.

Above the purchase controls, keep this order: category/breadcrumb → product name → short description → rating link when real reviews exist → price and unit price → pack size → availability/delivery → quantity and primary Add to cart action. Keep Buy now visually secondary. At 320–360px, visually verify the quantity/Add/wishlist row: its fixed-width neighboring controls leave little room for the label. Stack controls when necessary instead of truncating the purchase action.

Use the existing tea brew calculator and kit contents explorer as meaningful interaction. Put detailed nutrition, storage, dietary information, and longer routine guidance below the purchase area, using consistent accordions. The sticky mobile purchase bar is already implemented; improve its state and placement rather than adding another floating CTA.

**Basket and checkout.** The basket should make three facts immediately clear: what is included, what it costs, and what happens next. Preserve removal undo, but give quantity limits a visible explanation. Use “Basket” or “Cart” consistently across navigation, purchase controls, toast, drawer, and checkout.

Checkout is a single page with grouped sections, not a step-by-step wizard. Keep guest checkout and the useful Pakistani phone/city validation. Simplify the header and number the groups clearly. On mobile, show a compact expandable order summary near the top and a concise total near the final action; currently the summary and Place Order button follow the entire contact/address/payment column. Keep the full price and payment instructions available before confirmation. Use method-specific action text, for example “Place COD order” or “Submit order for payment review,” with an explanation of what happens next.

**Order status and customer area.** The shared order-progress helper already prevents a prepaid order from showing packing complete while payment is unverified. Preserve that correction. Give payment and delivery their own clear statuses so COD can say “Pay on delivery” without implying a stalled order. Explain rejected payment, cancellation, and refund as distinct situations with relevant next actions. Replace the perpetual pulse on a review state with a static badge; waiting for manual review does not need continuous animation.

“My Seedly Account” currently presents tracking and shortcuts rather than a signed-in profile or order history. Rename it “Orders & saved items” or “Customer help” unless account functionality is added. Make the meaning of wishlist persistence clear and show a retry state when saved products cannot load instead of leaving an apparently empty area.

**5. Mobile usability and accessibility**

- **Resolve overlapping fixed controls.** FloatingWhatsApp is fixed 24px above the bottom on every storefront route, while MobileBottomNav occupies the bottom 64px plus the safe area. Their source positions overlap. Position support above the active bottom control or use an inline help link; suppress floating distractions during checkout. Coordinate toast, sticky purchase, navigation, keyboard, and safe-area positions in one layout system.
- **Use one reliable modal pattern.** Search uses a native modal dialog with focus restoration and scroll lock. Cart, quick view, tracking, and filters do not share the same complete behavior. Implement initial focus, trapped focus, Escape, focus restoration, background inactivity, and consistent scroll locking. The filter drawer needs modal semantics as well as a visual backdrop. See the [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- **Remove hidden controls from keyboard navigation.** StickyPurchaseBar translates off-screen and disables pointer events when hidden, but its buttons remain in the DOM without inert/hidden behavior. The hidden bottom navigation has a similar issue. Ensure keyboard focus cannot land on invisible purchase/navigation controls.
- **Complete the kit tabs.** KitContentsExplorer assigns non-selected tabs tabIndex=-1 without arrow-key handlers. Keyboard users can reach the selected tab but cannot navigate to the others as a tab list. Implement the full keyboard pattern or use ordinary accessible selection buttons. Use native radio inputs for payment options or implement complete radio-group keyboard behavior.
- **Improve target comfort.** Several basket steppers are 24px and icon controls are 32–36px. Aim for 44–48px touch areas, even if the visible icon is smaller. The [WCAG 2.2 minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) is 24×24 CSS pixels with defined exceptions; 44–48px here is a usability recommendation, not a claim that every smaller control fails WCAG.
- **Correct weak text contrast.** Calculated from source colors: white on amber #D97706 is approximately 3.19:1, insufficient for the small Instagram CTA text. Stone-400 #A8A29E on white is approximately 2.52:1 and is used for some counts/reset/help text. Use darker text or a darker accent for these combinations. Normal text requires 4.5:1, with 3:1 for qualifying large text. See [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- **Improve validation recovery.** Checkout scrolls to a fixed page position when fields fail validation. Focus the first invalid field or a linked error summary instead. Preserve all entered information after network/upload failures. Labels and inline error associations already exist for many checkout fields; keep them.

**6. Motion, interaction, and modern visual elements**

Keep interaction feedback tied to an actual action: add confirmation, selection state, quantity updates, modal opening, and meaningful loading. Existing 150–250ms control transitions are a suitable starting point. Avoid delaying a successful local basket action merely to show a spinner.

Reduce the collection-card rotation and testimonial-card lift. A mild image zoom or small elevation change is enough; static customer quotes do not need to react like buttons. Use a consistent 200–300ms drawer transition and 350–450ms one-time section reveal. Keep the hero and purchase controls immediately visible.

Reduced-motion support already exists, but the global rule mainly reduces duration; it does not remove every hover/active transform defined directly in Tailwind classes. Check zoom, tilt, translate, and press effects explicitly. Testimonials also start with opacity zero until their observer runs; reuse the existing progressive Reveal approach so important content remains visible if JavaScript or the observer fails.

The existing brew calculator and kit explorer offer more useful engagement than a decorative 3D scene. An optional package rotation or simple illustrated routine diagram could be considered later if it clarifies pack contents or usage. Give it a static fallback, load it after user interest, and keep it away from checkout. Avoid committing to heavy visual tooling before validating the main conversion flow.

**7. Performance and responsiveness**

There is no measured Lighthouse score or production Web Vitals result in this review. Suggested field targets are LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 at the 75th percentile, assessed separately for mobile and desktop. These are targets, not current site measurements. See [Google's Core Web Vitals guidance](https://web.dev/articles/vitals).

Retain Next Image, reserved image aspect ratios, and priority loading for the hero/main product image. Source JPEGs inspected are roughly 0.75–0.87MB each, but Next Image can serve smaller transformed responses; inspect actual network transfers before deciding the cost. ProductCard advertises 100vw below 640px although its usual grid is two columns, which can request unnecessarily large images. Some small cart/checkout images omit sizes. Supply sizes that match each real layout, and avoid loading a full gallery at high priority.

Search currently loads full product/kit records and review information before returning six suggestions; use a lighter search projection, bounded queries, and deliberate caching. Preserve stale-request cancellation and the existing short debounce. Catalog service failures currently return empty arrays, so a backend outage can look like a legitimate empty catalog; distinguish service failure from zero matches and provide retry feedback.

Test widths of 320, 375, 390, 768, 1,024, 1,280, and 1,440px, including a mobile keyboard and safe-area device. Check long product names, different currencies/price widths, many basket lines, every payment method, one/zero-result grids, 200% zoom, reduced motion, and keyboard-only operation. The acceptance target is no accidental horizontal scrolling, obscured actions, truncated essential labels, or focus behind overlays.

**8. Suggested delivery order and verification**

1. **Repair transactional workflows:** drawer dismissal, guest payment configuration, tracking, quotes, receipt handling, stock feedback, and checkout retry identity. Deliver staging evidence for happy paths and failure/retry paths.
2. **Unify product discovery:** one search behavior, durable URL filters, current quiz data, matching price/stock rules, and useful empty/error states. Preserve automatic sorting.
3. **Apply the shared design system:** typography, page gutters, stable grids, consistent controls, product galleries, compact mobile checkout, and coordinated fixed elements.
4. **Strengthen credibility and access:** authentic review labels, a working newsletter, accurate language/account controls, keyboard-complete dialogs/tabs, contrast, and readable delivery/payment copy.
5. **Polish and measure:** reduce unnecessary motion, verify responsive layouts, inspect image/search payloads, and measure field performance before adding optional interactive visuals.

Track product discovery success, product-to-basket progression, checkout completion, validation/upload errors, tracking failures, and whether users can recover without contacting support. Establish a baseline before claiming any conversion improvement; do not collect raw payment proofs, phone numbers, or full addresses in routine analytics events.

The release is ready when a guest can find a product from every device layout, understand the pack and final cost, add/edit/remove items without false feedback, complete each supported payment flow with correct configuration, and return to a working and accurate order-status screen.
