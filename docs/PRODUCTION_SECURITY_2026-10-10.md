# Production security and Vercel handoff - 10 October 2026

This covers security/resilience work accompanying the Supabase CMS integration, not complete production certification. The owner confirmed GitHub to Vercel deployment and explicitly deferred email provider selection and live email tests.

## Implemented boundaries

- Explicit Supabase environment configuration replaces embedded fallback project keys; public clients reject private keys.
- Database/Auth fetches are bounded at 15 seconds, Storage at 30 seconds, and caller cancellation is preserved. Repeated built-in reads are disabled to avoid multiplying the deadline; explicit persisted checkout recovery remains.
- Atomic shared Supabase counters admit orders, quotes, receipts, reviews and restock requests. Global limits work on all hosts; Vercel's overwritten x-vercel-forwarded-for header also controls per-client limits. Arbitrary forwarded headers on other hosts are ignored. TRUSTED_CLIENT_IP_HEADER requires a proxy that overwrites it and blocks direct origin access. HMAC-SHA256 identifiers replace raw IP storage. Limiter failures return 503; denial returns 429 and Retry-After. This is not upstream DDoS protection.
- Public database review INSERT is revoked by the migration; validated submissions use the private server client. Approved public reads and cookie/RLS-protected moderation remain separate, preventing REST bypass of admission.
- Owner-managed settings control new orders and COD/bank/wallet availability. The database transaction rechecks settings/destinations; committed attempts remain recoverable when paused.
- Payment destinations, shipping amounts and cities have no invented defaults. Admin settings support errors/retry, duplicate-submit prevention and precise two-decimal amounts.
- Quote validation batches requested products/variants/kits and omits reviews. Transactions remain price/stock authority. Admin badges use exact HEAD counts instead of capped whole-list downloads.
- Multipart errors return 400/415/413. Files are capped at 4 MiB plus bounded overhead to fit Vercel's 4.5 MB function request cap. Catalog URLs accept local paths, Unsplash, and the configured public product-images bucket.
- Basic CSP denies object embeds and foreign bases; framing is same-origin and admin framing denied. This is not a nonce-based script CSP. Private responses remain no-store.
- GitHub Actions runs Node tests, TypeScript and production advisory checks on push/PR with pinned official action commits, read-only permission and no retained Git credential. Vercel still builds deployments/previews.

## Deployment configuration

Run node scripts/production-readiness.mjs locally or add --production --json with proposed hosting configuration. It prints pass/fail names without values, creates no orders and sends no messages. Passing validates configuration shape, not external acceptance.

Configure Node 22, intended Supabase project/public key, server-only SUPABASE_SECRET_KEY, separate stable CHECKOUT_SIGNING_SECRET, ORDER_REFERENCE_MODE=sequential in Vercel. Isolate preview environments on staging; never supply production private credentials to untrusted pull-request builds. Apply migrations before code requiring consume_rate_limit and ordering flags. Publish the correct HTTPS origin in Website Content > Site > Config > URL; the preflight verifies this public CMS value.

Admin identities require active Auth UUID links with OWNER/STAFF roles, never editable user metadata. Verify the protected Vercel preview on desktop/mobile before assigning traffic. Do not publish env files/backups. The GitHub deployment request is handled separately; local verification does not certify hosted deployment success. vercel.json pins npm ci and npm run build, with no seed/reset/migration command.

## Deferred email

The private transactional order outbox remains durable. No provider was configured and no customer email was sent. Queuing or sender settings do not imply delivery.

The worker accepts Vercel CRON_SECRET or existing EMAIL_CRON_SECRET, at least 32 random characters; CRON_SECRET takes precedence. Vercel sends CRON_SECRET as Bearer Authorization. GET/POST remain protected. The email cron is intentionally omitted from vercel.json while provider selection is deferred. The worker endpoint remains available for future authorized activation.

After provider selection, configure its adapter and verified sender and test an authorized inbox. Schedule /api/internal/email-delivery through a suitable recurring worker. Hobby cron supports daily runs and may execute within the hour; this is unsuitable as the only recovery mechanism for prompt confirmations or the conservative 23-hour uncertain-send cutoff. Use an authorized paid-plan or external scheduler. Do not put worker tokens in URLs. Provider acceptance is not inbox delivery; add bounce/delivery monitoring at activation.

## Unresolved release gates

1. Confirm exposed administrator credential rotation and session revocation.
2. Reconcile historical orders with incomplete original component reservations before cancellation.
3. Verify protected staging checkout/receipt/retry and concurrent stock/idempotency workflows.
4. Test full database/Auth/Storage restoration and hosted failure monitoring.
5. Production npm audit reports zero vulnerabilities. Full audit has five high entries from dev-only braces GHSA-vfj7-8cjw-p6xm via Tailwind 3, with no directly patched braces release. No major CSS migration was forced; use trusted build globs and exclude dev tools from runtime.
6. Legacy dashboard/customer/order list pages still need true pagination and database aggregates at large volumes. Exact badge counts are fixed, not whole-report scale certification. Verify real Web Vitals and load/abuse protection.
7. Email and preparation-only restock/WhatsApp delivery remain deferred until enabled and verified.

## Rollback and references

Source snapshot F:/Seedly/backups/pre-production-cms-20261010 was hashed before changes. Restore coupled source bundles through scripts/restore-version.mjs after reviewing its change manifest. Source restoration does not reverse migrations/grants/Auth/environment changes. Never reopen anonymous privileged writes or rewind order/reservation/idempotency data.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [custom fetch/retries](https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js), [Vercel request headers](https://vercel.com/docs/headers/request-headers), [function limits](https://vercel.com/docs/functions/limitations), [cron constraints/authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Installed Supabase source was checked because current retry docs differ: this installed version only retries GET/HEAD/OPTIONS and 503/520, never POST. Unsafe automatic privileged RPC replay was not asserted as a current finding.
