**Seedly: Supabase migration handoff**

Prepared on 30 September 2026 from the current F:\Seedly repository. This document is a proposed implementation plan, not a completed migration.

**Objective**

Replace the application's SQLite persistence with Supabase Postgres, use Supabase Auth for real administrator access, and move payment receipts to private Supabase Storage. Preserve the storefront, URLs, checkout options, live product search, automatic sorting, product controls, wishlist, cart and animations.

Work against local Supabase or a separate staging project first. Preserve existing uncommitted changes. Do not seed over existing records or use production orders for tests.

**Current application: what the agent must know**

- Next.js 15 App Router, React 19, TypeScript, Node 22. The installed Next.js version reviewed was 15.5.26.
- lib/db/index.ts opens node:sqlite, initializes tables and automatically runs lib/db/seed.ts. Its serverless fallback copies the database to temporary storage.
- lib/services/products.ts, kits.ts, orders.ts, reviews.ts, settings.ts and stockAlerts.ts use synchronous SQLite queries. app/api/admin/products/route.ts also accesses SQLite directly.
- app/admin/login/page.tsx currently accepts nonempty fields and redirects after a timer. app/admin/layout.tsx switches Owner/Staff with client state. Reviewed admin API routes do not authenticate the caller.
- app/api/payments/bank-transfer/receipt/route.ts writes into public/uploads/receipts. Receipts must not remain public.
- Order creation inserts an order and line items, then decrements inventory through separate statements. It needs a real transaction before supporting concurrent cloud checkout.
- Order tracking currently looks up an order using its order number alone and displays personal details. Database RLS alone will not protect a server route using an elevated key.
- Cart and wishlist are browser-side stores. Keep that behavior; customer accounts and cross-device synchronization are separate optional work.
- Notifications currently include in-memory logging. Supabase database connectivity does not make email or WhatsApp delivery operational.

**1. Prepare the project and configuration**

Obtain project access through the owner's account or secret manager. Required inputs: staging and production project references, deployment host and URLs, permitted administrator identities, and the authoritative source database/receipt location. Do not assume the developer's local SQLite file contains every live order.

Choose a Supabase region close to the application server. Keep staging and production data separate. Install @supabase/supabase-js and @supabase/ssr at compatible versions, record them in the lockfile, and initialize version-controlled Supabase migrations.

Add an .env.example containing placeholders only:

    NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
    SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
    NEXT_PUBLIC_SITE_URL=http://localhost:3001

Use the same URL value in server clients. Configure actual values in ignored local environment files and the deployment platform. CLI/project linking or a migration-only database connection belongs in local/CI secret storage, not browser configuration.

Publishable keys are intended for public clients; secret keys bypass RLS and must remain server-only. Follow the current [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

Create these modules:

- lib/supabase/browser.ts: browser Auth client, publishable key only.
- lib/supabase/server.ts: request-scoped cookie-based Auth client.
- lib/supabase/public.ts: server-side, low-privilege catalog client with no customer cookies.
- lib/supabase/admin.ts: elevated client for approved server operations; mark the module server-only and disable persistent Auth sessions.
- lib/supabase/database.types.ts: generated database types.
- lib/auth/require-admin.ts: server-side identity verification and role lookup.
- middleware.ts: session refresh for protected areas, excluding static assets.

This repository uses Next.js 15: use middleware.ts, not a Next.js 16-only proxy.ts entry point. Validate identity using getClaims, or getUser when a fresh Auth record is needed; never authorize using an unverified getSession user object. Follow [Supabase's Next.js SSR instructions](https://supabase.com/docs/guides/auth/server-side/nextjs).

**2. Design and migrate the schema**

Recreate the existing 13 tables through SQL migrations:

| Area | Existing tables |
| --- | --- |
| Catalog | categories, products, product_variants, kits, kit_items |
| Commerce | orders, order_items |
| Reviews/configuration | reviews, site_settings |
| Administration/subscriptions | admin_users, newsletter_subscribers, stock_alert_subscriptions, stock_alert_deliveries |

Use these conversion rules:

- Preserve existing text IDs, slugs, SKUs and order numbers. Values such as prod-pumpkin and var-pump-250 are not UUIDs. New Supabase Auth user IDs are UUIDs and need a separate, explicit mapping.
- Store prices in integer minor units, retaining PKR. Do not convert paisa to floating-point currency.
- Convert boolean flags to boolean, timestamps to timestamptz with documented source timezone handling, and validated JSON fields to jsonb where appropriate. Preserve settings values as text initially unless their adapters are migrated deliberately.
- Add foreign keys, unique constraints and indexes after auditing existing rows for violations. Index foreign-key columns, order number, creation time, payment/order status and subscription lookups.
- Require positive integer quantities, nonnegative prices and inventory, and valid status/payment values. New inventory must default to zero, not an invented stock quantity.
- Add updated_at handling explicitly.
- Add a unique checkout idempotency constraint and a request fingerprint. Reusing a key with different checkout content must return a conflict.
- Add an order event/audit table for payment and fulfillment changes, with verified actor, timestamp and old/new states.
- Add minimal private records for guest checkout sessions, receipt ownership and tracking capabilities; store capability/token hashes, not raw tokens.

Resolve these actual schema traps before adding foreign keys:

- Kit order lines currently put the KIT ID into order_items.product_id. Normalize kit lines to kit_id with product_id nullable and enforce exactly one sellable reference. Preserve the existing API representation through an adapter if consumers require it.
- reviews.product_id is used for both products and kits. Audit and split references into product_id/kit_id, or document another valid catalog reference model. Do not attach every legacy value to products blindly.
- Some kit component variant references are nullable. Resolve them explicitly or make the kit unavailable; do not copy the current fallback that treats a missing variant as 50 units in stock.
- Link approved real admin identities to auth.users using a unique auth_user_id. Seeded admin rows are not authorization to create working administrator accounts.
- Preserve the exclusion of demonstration reviews rev-1 through rev-4 from public reviews and rating totals. Prefer an explicit is_demo flag and migrate those records accordingly.

Keep migration files and local-only seed fixtures separate. No automatic production seeding on application startup. See the [Supabase migration workflow](https://supabase.com/docs/guides/local-development/database-migrations).

**3. Implement access controls before exposing cloud data**

Use Supabase Auth for administrators. Replace the timer-based login and client-controlled role switch with verified sessions and server-owned role assignments. Owner controls settings and administrator management; document which catalog, order and review actions Staff may perform.

Protect every admin page and every /api/admin endpoint on the server. Split the current client admin layout into a guarded server layout and a client navigation shell. Protect service operations as well; middleware or hidden navigation alone is insufficient.

For all exposed tables, enable RLS and set explicit grants. Recommended initial access model:

| Data | Anonymous / ordinary authenticated clients | Application server |
| --- | --- | --- |
| Active catalog and active variants | Read published fields only; parent product must also be active | Validated catalog operations |
| Public reviews | Read approved, non-demo review fields only | Validated submission/moderation |
| Orders, items, audit events, receipts | No direct table access | Admin authorization or verified order ownership/capability |
| Admin identities and roles | No direct access or self-assignment | Role lookup and Owner-authorized administration |
| Settings | No unrestricted table access | Explicit public checkout allowlist; guarded administration |
| Subscriber lists and delivery records | No direct reads or writes | Validated subscribe/unsubscribe and admin routes |

Do not expose all columns just because a row is public. Keep internal fields in private tables/columns or return explicit public projections. If using views, ensure their security model preserves underlying policies; Postgres views can otherwise bypass RLS. See [Supabase's RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

The elevated server client bypasses RLS: every route using it must independently verify authorization, validate input and return a minimal response. Deny ordinary clients direct access to privileged checkout/payment RPCs. Revoke default EXECUTE from PUBLIC, anon and authenticated where appropriate and grant it only to the intended server role.

For guest checkout, issue an unguessable, order-scoped tracking capability. An order number alone must not reveal names, addresses, phone numbers, receipts or admin notes. Keep the existing /order/[orderNumber] path but add verified access. Provide a recovery route for historical orders through verified identity or staff assistance; do not silently make old records public.

Apply rate limits to public checkout, search, reviews and upload endpoints as appropriate. Protect cookie-authenticated mutations against cross-site requests.

**4. Move services to asynchronous Supabase access**

Preserve the existing service boundary and public response contracts where possible. Convert database functions and their callers to async/await:

- lib/services/products.ts, kits.ts, orders.ts, reviews.ts, settings.ts and stockAlerts.ts.
- app/api/products, search, orders, reviews, stock-alerts and all admin routes.
- Storefront pages, admin dashboards, product generateMetadata/generateStaticParams and app/sitemap.ts.
- Any direct SQL usage discovered by a final repository-wide search.

Use joined queries or carefully scoped database views/functions to avoid one network request per variant, review statistic or kit component. Handle { data, error } explicitly and return appropriate validation, authorization and conflict errors.

Preserve these behaviors:

- /api/search returns at most six previews with total count, image, name, size, price and detail URL. Match names, descriptions and ingredients consistently with the full shop page.
- Live search keeps its short debounce, cancellation and stale-response protection. Supabase Realtime is not required for search-as-you-type.
- Sorting applies immediately and retains search/category parameters.
- Prices and sizes use the same active default variant on cards, search and product details.
- Guest carts and wishlists remain usable, and retained text IDs keep existing saved items valid.
- Kit availability uses real component inventory. Validate stock again at checkout.
- Settings read/write adapters retain correct delivery fees and thresholds.
- Demo reviews stay excluded after moving from raw SQL filters to Supabase queries.

Make caching explicit. During migration, prefer uncached/dynamic catalog reads for correctness; optionally introduce tagged caching and invalidation afterward. Orders, private receipts, admin pages and session-dependent responses must never enter shared public caches. Ensure new products and inventory changes appear without requiring a rebuild. Do not let generateStaticParams or build-time queries turn missing production credentials into empty catalog deployments.

**5. Make checkout and order transitions transactional**

Create a restricted Postgres RPC for order creation. A sequence of supabase.from(...).insert/update calls is not a single transaction.

Within one transaction:

1. Validate the checkout session, idempotency key and request fingerprint.
2. Validate active products/kits, variant ownership, positive quantities and required kit components. Reject invalid lines rather than skipping them.
3. Aggregate total variant demand across duplicate product lines, kit quantities and products sharing kit components.
4. Lock affected inventory rows in a consistent order, then recheck availability.
5. Calculate authoritative prices, shipping and totals from database records/settings.
6. Insert the order and item snapshots; decrement stock only when sufficient. Never clamp negative stock to zero to hide overselling.
7. Associate a receipt owned by that checkout session, if present.
8. Commit all records and stock together, or roll everything back. A retry with the same valid key returns the same order and does not reserve stock twice.

Use separate guarded RPCs for payment decisions and fulfillment updates. Enforce valid transitions and audit them inside the transaction. Repeated approvals/rejections must not duplicate actions or regress a shipped order to PAID.

Preserve lib/order-status.ts and enforce equivalent rules in database mutations:

| Event | Expected behavior |
| --- | --- |
| Cash on delivery checkout | Payment PENDING; order RECEIVED |
| Bank transfer without receipt | Payment PENDING; order PENDING_PAYMENT |
| Valid bank receipt or wallet review | Payment UNDER_REVIEW; order PAYMENT_REVIEW |
| Admin verifies payment | VERIFIED and PAID where valid; no automatic packing |
| Admin starts processing | Preparation active, not completed packing |
| Admin explicitly marks PACKED | Packing becomes completed |
| Unverified non-COD order | Cannot advance to paid/processing/packed/shipped/delivered |

Choose and document stock-release policy before enabling cancellations. Recommended: cancellation/payment rejection before shipment releases that order's reservation exactly once. Refunds after shipment must not automatically restock items. Do not retroactively modify historical inventory based on guessed cancellation rules.

Dispatch any real notifications only after commit. Keep staging notifications disabled/mocked. Existing notification logs are not proof of delivery; adding an email/WhatsApp provider is separate work. If reliable delivery is included, use a persisted, deduplicated outbox and report actual provider outcomes.

Prefer SECURITY INVOKER functions. If SECURITY DEFINER is necessary, use a fixed safe search_path, schema-qualified objects, explicit authorization and restrictive execution grants. See [Supabase database function guidance](https://supabase.com/docs/guides/database/functions).

**6. Move receipts to private Storage**

Create a PRIVATE payment-receipts bucket. Keep the existing 5 MB limit and allow only validated JPEG, PNG and PDF content; inspect actual file content rather than trusting the filename or MIME claim.

Bind uploads to a server-issued checkout session or an authorized order. Use randomized object paths, reject arbitrary client-supplied receipt paths, and record ownership before associating a file with an order. Unattached uploads should expire and be cleaned up.

Store bucket/object references in the database, not public URLs or temporary signed URLs. Authorized administrators can request short-lived signed links; customers receive only access explicitly required by their verified order session. Never send receipt links in catalog or public order responses.

Copy existing local receipts using a manifest and checksums, update references and verify readability before retiring old files. Remove public receipt files from future deployments after the verified cutover; retaining them in public defeats the private bucket. Keep backups outside the web root.

Existing product photos can remain in public/images for the first migration. A public product-images bucket is optional later; if used, restrict writes to administrators and allow only the exact project host/path in next.config.mjs.

Private buckets support authorized downloads and expiring signed URLs. See [Supabase Storage access models](https://supabase.com/docs/guides/storage/buckets/fundamentals).

**7. Migrate existing data safely**

Implement a repeatable, dry-run-capable export/import script. Do not use a destructive reseed script.

- Discover and reconcile all authoritative database copies before export, including any serverless temporary copies. Report unrecoverable gaps rather than silently importing an old bundled file.
- Take a consistent SQLite backup/export that accounts for WAL; copying an actively written main database file alone is insufficient.
- Audit duplicates, invalid references, JSON and dates. Preserve IDs and original monetary values; produce a report for exceptions instead of dropping records.
- Import parents before dependent rows, transform kit/review references, and map real administrators separately.
- Preserve existing subscriber states and valid unsubscribe behavior. If tokens are migrated to hashes, validate old links by hashing the submitted token.
- Use pagination/batching for complete export and verification; do not assume an API's first response contains every row.
- Make reruns safe using stable identifiers and an import manifest. Disable outbound notifications and business event processing during import.
- Verify counts per table, primary-key sets, monetary totals, inventory totals, referential integrity and receipt checksums. Sample old orders and their line snapshots.
- Keep customer exports, backups, keys and full PII logs out of Git.

**8. Validate before production cutover**

Run tests against disposable/local or staging Supabase, never production. Update the existing scripts/order-status.test.cjs and scripts/product-search.test.cjs for the new persistence layer while keeping business-rule assertions.

Acceptance checks:

- Clean SQL migrations apply successfully; generated types match the schema; TypeScript and production build pass.
- Anonymous and ordinary authenticated users cannot access private tables, privileged RPCs or admin endpoints, including by calling Supabase directly.
- Owner/Staff restrictions are enforced on server reads and writes. Invalid credentials, logout and session expiry work.
- Two concurrent checkouts for the last unit produce one successful reservation, not negative inventory.
- Duplicate requests, mixed kits/products sharing components, invalid variants and mid-transaction failures are handled correctly.
- Payment review never appears packed; approval alone never packs; duplicate status changes do not repeat side effects.
- Receipt uploads enforce ownership, type and size; unauthorized downloads fail and signed links expire.
- Migration reports reconcile historical orders, item totals, inventory and files. Retried imports do not duplicate records.
- Search, sort, product images, default variant prices, checkout options, reviews and stock alerts retain their behavior.
- Public/customer/admin responses are not cross-cached. New catalog entries and stock changes appear correctly.
- Browser tests cover desktop/mobile navigation, checkout and the recent animation/search UI.
- No secrets or private receipts appear in client bundles, public files or logs.

**9. Cut over and retain a workable rollback**

First deploy the Supabase-backed application to staging and present the reconciliation/test reports.

For production, use a short maintenance/write-freeze window covering checkout, receipt uploads and all admin/public mutations. Wait for in-flight writes, take the final consistent export, import/reconcile, switch environment configuration and deploy the matching application.

Remove SQLite auto-initialization/seeding and the data/**/* build tracing rule from next.config.mjs once the Supabase runtime is ready. Do not silently fall back to SQLite when Supabase is unavailable. Keep SQLite tooling only for controlled migration/verification.

Before reopening writes, verify sign-in, public catalog, protected admin access and the agreed checkout test procedure. Then monitor database errors, checkout failures, denied access and stock changes.

Keep the original SQLite snapshot and receipt backup intact. Before new Supabase writes, rollback can return to the frozen source. After new writes, pause traffic and reconcile/export those orders and stock changes before any rollback to SQLite; switching to an old snapshot would lose orders. Prefer a compatible application rollback that keeps Supabase as the data source.

**Deliverables required from the implementation agent**

- SQL migrations, RLS/grants, transactional RPCs and audit schema.
- Typed Supabase clients, real admin Auth and guarded routes.
- Asynchronous services with compatible storefront responses.
- Private receipt storage with ownership checks and migration manifest.
- Safe SQLite export/import and verification scripts.
- Placeholder-only environment template and deployment instructions.
- Passing integration/security tests and migration reconciliation report.
- A staging preview and a documented cutover/rollback runbook.
- A list of unresolved business decisions or missing owner-provided configuration.

Customer login, synced wishlists, live database subscriptions, changing the payment gateway and redesigning the storefront are outside this migration unless separately requested.