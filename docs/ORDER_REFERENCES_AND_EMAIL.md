# Sequential order references and confirmation email
Date: 7 October 2026

## Current status

The 8 October audit installed the sequence allocator and database hardening in live Supabase. At installation the next reference was SED-100200; no existing order was renamed and no test order or email was sent. Local ORDER_REFERENCE_MODE is sequential. The user subsequently configured the private server key locally; protected read-only checks passed and the restarted local preview reports checkout available. Hosting secrets and positive staging checkout verification remain required; email sending also requires provider/sender configuration. See [the current production audit](PRODUCTION_AUDIT_2026-10-08.md) for verification and launch gates.

## Reference behavior

New references in sequential mode are allocated centrally: SED-100200, SED-100201, SED-100202, and so on. If existing numeric references are already higher, the counter begins after the highest existing number to avoid collisions. Allocation never uses a browser counter or an in-memory app counter.

The existing reference SED-C93F82A40B400828759527D0 remains valid. Existing orders are not renamed. Internal HMAC references remain private retry identities; customer-facing references use the database sequence after activation.

A private reservation associates one checkout identity with one number and request fingerprint. It allocates only after the basket, quote and any receipt pass validation. Changed requests are rejected; interrupted retries reuse the reservation. Already-committed numeric and legacy orders are recovered before fresh stock/quote checks.

Numbers increase by one per new reservation. They are not gapless invoice numbers: an abandoned/failed reservation or PostgreSQL rollback can leave a gap. Numbers are never reused. See [PostgreSQL sequence behavior](https://www.postgresql.org/docs/current/sql-createsequence.html).

## Privacy and permissions

Sequential references are guessable. Knowing a number alone does not reveal its customer, destination, items, totals or courier tracking. Guest website lookup requires the original private confirmation capability for every reference. Active administrators can preview orders through their verified session. The tracking form accepts a full confirmation URL. A numeric reference alone displays the same private-link help screen whether an order exists or not.

The migration:
- Creates the non-exposed seedly_checkout schema, sequence and reservation table.
- Enables RLS on the table and denies public/anon/authenticated schema, table, sequence and allocator access.
- Uses SECURITY INVOKER, a pinned empty search_path, explicit grants to service_role and indexed unique identities/numbers.
- Serializes allocation for the same checkout identity with a transaction advisory lock.
- Keeps creator/allocator functions restricted to service_role. The preceding commerce migration protects public tracking with the private capability and strips internal fields.
- Preserves existing orders and existing transactional order/stock logic.

A server secret is required before applying these access restrictions. Server lookup uses that key when configured. See [Supabase function security](https://supabase.com/docs/guides/database/functions).

## Activation

1. Configure SUPABASE_SECRET_KEY on the server and connect an authenticated database session. Never paste keys into chat, commit them, or use a NEXT_PUBLIC_ prefix.
2. In staging, back up the live database and capture installed function definitions/grants. The local workspace snapshot is not a live database backup.
3. Review and apply supabase/migrations/20261008074034_sequential_order_references.sql. It was created using Supabase CLI 2.120.0 migration new, then tested on isolated PostgreSQL. Do not apply the isolated verification script to a real database: it creates fixture roles and tables.
4. Run database advisors and verify installed function permissions, sequence state, numeric capability lookup and existing transactional RPC compatibility. No live schema advisors or installed RPC internals could be inspected in this session.
5. Set ORDER_REFERENCE_MODE=sequential on every app server only after the migration succeeds. Rebuild/restart the application so configuration is loaded.
6. Verify staged purchases produce sequential references, simultaneous same/different checkout attempts do not collide, old links work and committed retries succeed with depleted stock. Do not reset an established counter.

Useful read-only post-migration verification:
```sql
select last_value, is_called from seedly_checkout.order_reference_seq;

select p.oid::regprocedure as function_signature,
       p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'execute') as server_can_execute
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('find_checkout_order_reference', 'allocate_checkout_order_reference',
                   'create_order_transactional', 'lookup_order_with_capability');

select relrowsecurity
from pg_catalog.pg_class
where oid = 'seedly_checkout.order_references'::regclass;
```

Run allocation tests only in staging: even a rolled-back nextval consumes a sequence value.

## Confirmation template design

The responsive HTML email uses Seedly's forest/cream palette, a restrained wordmark, readable headings, a prominent reference, product rows, totals, payment guidance, delivery destination and a single View your order action. It uses email-compatible presentation tables, inline styles, system fonts and a plain-text alternative.

Three previews use sample data:
- docs/email-previews/order-confirmation-cod.html
- docs/email-previews/order-confirmation-bank-transfer.html
- docs/email-previews/order-confirmation-wallet.html

COD says Pay on delivery. Transfers say Payment under review, without claiming preparation or payment approval. Customer/catalog/address content is HTML escaped. Images cannot load from an arbitrary third-party tracking host. The confirmation link includes the existing private tracking capability.

Regenerate previews:
```powershell
& 'C:/Users/HP/.codex/tools/node-v22.23.3-win-x64/node.exe' scripts/preview-order-email.cjs
```

## Reliable order email delivery

Updated 9 October 2026: the private Supabase email outbox is installed. New order creation and payment/shipping/delivery events now queue once inside the same database transaction; old direct order sends have been removed. Next.js after() schedules processing after a successful API operation, while a separate authenticated recurring worker retries interrupted/temporary failures. Persisted messages use stable provider keys, frozen sender/body, claim leases and bounded retry. Uncertain attempts stop at 23 hours to avoid resending beyond Resend's 24-hour deduplication retention.

The requested sender is Seedly <seedly@softbytes.co.uk>, and customer email links point to https://seedly.softbytes.co.uk. The root softbytes.co.uk must be verified in Resend. Local non-secret settings and a worker token are configured, but provider/API-key credentials are still absent. Sending and inbox delivery have not been tested.

See [the complete DNS, credential, worker and monitoring instructions](EMAIL_DELIVERY_SETUP.md). ACCEPTED means provider acceptance only; delivery/bounce webhooks are not implemented. Restock/WhatsApp remain preparation-only. Reconcile any old-release direct sends against queue events during rollout.

The follow-up passed 66 Node regression tests, TypeScript, the production build and an isolated SQL fixture for all lifecycle events, rollback, replay, private grants, frozen messages, retries, leases and uncertain expiry. Live grants were verified read-only and the newly installed queue initially contained zero rows.

## Verification and backup

40 regression tests, TypeScript and the production build passed. Local HTTP checks passed for home, Shop, routine finder, cart, checkout and account. Numeric references without a capability show the same private-link help screen; an invalid capability returns 404, with private/no-store and no-referrer headers. A same-origin catalog quote succeeded without placing an order. Actual isolated PostgreSQL tests passed for:
- Start/increment, replay identity, request conflict and malformed identity.
- Anonymous/authenticated allocator, table and original order RPC access denial.
- RLS and invoker behavior.
- Migration reruns, counter advancement past existing numeric orders and preservation of existing legacy orders.

Service tests cover sequential/legacy committed retry, quote expiry, zero stock, retained allocation after RPC failure, no duplicate confirmation on replay, capability authorization and post-commit notification exceptions. Email tests cover escaping, unsafe URLs/header input, monetary values, all payment variants, opt-in delivery, provider acceptance and transport failure.

Tests do not establish live multi-connection database concurrency, existing production RPC internals, inbox delivery or email-client rendering. The isolated SQL fixture uses an embedded PostgreSQL engine and mocked legacy RPC definitions for permission checks. The reproducible script is scripts/verify-order-sequence.mjs; its PostgreSQL tool dependency was installed outside the application in F:/Seedly-backups/order-email-verification. To run it, set PGLITE_MODULE to file:///F:/Seedly-backups/order-email-verification/node_modules/@electric-sql/pglite/dist/index.js and run the script with Node 22+. The original isolated verification did not require a Supabase CLI token; the live follow-up migration was installed through the authenticated Supabase connector.

Snapshot before this work: F:/Seedly-backups/pre-order-email-20261007-002942 (229 SHA256-verified files). The snapshot, manifest and section restoration utility preserve the previous working version.

Use scripts/restore-version.mjs with this backup and --section references, --section email or --section all; it defaults to dry run. references restores all coupled order/reference/privacy/template callers together. email restores notification/service callers, their checkout-security helper and email assets together while retaining unrelated helpers. Because email creation is coupled to the order service, this section also restores legacy reference behavior; use a compatibility-aware rollback after activating sequential orders. Existing older backup manifests are refreshed to include new files for a complete initial-version rollback.

Source restoration does not reverse a live SQL migration. Once numeric orders exist, retain the reservation table/sequence and private capabilities; never reset/drop the counter or renumber orders. Drain in-flight checkouts before any rollback. Restoring the older legacy-only order service during an uncertain numeric checkout can bypass its reservation and start another attempt, so use a compatibility-aware rollback after activation. Preserve the server key and protected lookup grants. Take an independent database backup before changing database objects or privileges.
