# Seedly

Seedly's storefront and operations dashboard use Next.js App Router, React, TypeScript and Supabase. Supabase is authoritative for the catalog, inventory, orders, content, reviews, coupons and private leads. The SQLite files and migration helpers are historical tooling; the deployed application does not use SQLite or automatically seed data.

## Local development

Use Node.js 22.23.3 or a compatible supported Node 22 release.

1. Run npm ci.
2. Copy .env.example to .env.local and configure your intended Supabase project. Use a disposable staging project for write tests.
3. Set the public project URL and publishable key, server-only SUPABASE_SECRET_KEY, a separate stable CHECKOUT_SIGNING_SECRET, and ORDER_REFERENCE_MODE=sequential.
4. Apply the reviewed Supabase migrations in order to a new staging database. Do not replay already-applied migrations, run seeds, or reset production data.
5. Run npm run dev and open http://localhost:3000.

Keep private keys and test credentials out of chat, source control, browser bundles and NEXT_PUBLIC variables. The published CMS site configuration controls canonical URLs and storefront content. Website Content in the dashboard supports drafts, publication and revision history.

## Verification and production builds

~~~powershell
npm test
npm run typecheck
npm audit --omit=dev --audit-level=high
npm run build
npm start
~~~

Also review the framework vendor's current security advisories: an empty npm audit result is not sufficient. The 22 October 2026 review pins Next.js 15.5.28, React/React DOM 19.3.1 and Sharp 0.35.5. See [the production readiness review](docs/PRODUCTION_READINESS_REVIEW_2026-10-22.md) for evidence, remaining launch gates, and the build-tool advisory.

Vercel production builds validate backend configuration, the stable signing secret, sequential order mode, and the public CMS origin. Builds never seed, reset or mutate commerce records. Set production hosting variables separately from .env.local. Keep preview deployments on staging credentials and do not expose production secrets to untrusted pull requests.

The protected dashboard starts at /admin/login. Active OWNER or STAFF membership must be explicitly linked to the verified Supabase Auth UUID. Privileged server credentials never substitute for a user's admin authorization.

## Isolated database workflow tests

The Node regression suite uses mocks and never submits live orders. PostgreSQL fixture scripts cover actual transactional SQL and permissions without changing the linked Supabase project. They require an isolated @electric-sql/pglite installation; set PGLITE_MODULE to that installation's dist/index.js file URL.

~~~powershell
node scripts/verify-public-boundaries.mjs
node scripts/verify-admin-catalog.mjs
node scripts/verify-commerce-transactions.mjs
node scripts/verify-order-sequence.mjs
node scripts/verify-admin-write-boundaries.mjs
node scripts/verify-email-outbox.mjs
node scripts/verify-cms.mjs
node scripts/verify-coupons.mjs
~~~

node scripts/test-admin-and-supabase.mjs checks live public access boundaries read-only. Positive admin tests additionally require dedicated SEEDLY_TEST_ADMIN_EMAIL and SEEDLY_TEST_ADMIN_PASSWORD. scripts/verify-http-smoke.mjs is restricted to a local production preview and never creates a successful customer order.

## Email delivery

Order and lifecycle emails use a durable private database outbox with provider idempotency and retry leases. Email templates and queued jobs do not mean that a message has been delivered. Configure the supported Resend adapter and verified sending domain, approve a test inbox, schedule the authenticated worker, and verify failures and delivery/bounce monitoring before declaring email operational. Restock email delivery is currently preparation-only.

See [email setup](docs/EMAIL_DELIVERY_SETUP.md) and [order references and email](docs/ORDER_REFERENCES_AND_EMAIL.md). Never put worker tokens in URLs.

## Backup, restoration and launch gates

Source backups exclude secrets and customer exports. scripts/restore-version.mjs previews section or file restoration and verifies checksums before --apply. Source restoration never reverses database migrations, order history, stock reservations, Auth or Storage. Keep order numbering monotonic and never reopen anonymous privileged writes to accommodate older code.

scripts/backup.mjs creates private paged row exports only when explicitly configured outside this repository. These exports do not replace transaction-consistent database backups, Auth backups, Storage backups or a tested restoration drill.

Read [the production readiness review](docs/PRODUCTION_READINESS_REVIEW_2026-10-22.md), [cutover and rollback](docs/CUTOVER_AND_ROLLBACK_RUNBOOK.md), [production security](docs/PRODUCTION_SECURITY_2026-10-10.md), and [visitor analytics and leads](docs/VISITOR_ANALYTICS_AND_LEADS_2026-10-11.md) before deploying.

Private and proprietary.
