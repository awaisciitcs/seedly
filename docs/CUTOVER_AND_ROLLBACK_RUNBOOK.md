> Historical guidance: some configuration, upload limits, and implementation status below have been superseded. Use [the current CMS handoff](ADMIN_MANAGED_CONTENT_2026-10-10.md) and [production security handoff](PRODUCTION_SECURITY_2026-10-10.md). Email activation is deferred until the owner chooses a provider.

# Seedly cutover and rollback runbook

Updated 9 October 2026. The current release is not production-ready until the open gates in [the production audit](PRODUCTION_AUDIT_2026-10-08.md) are closed.

## Current database and application state

Supabase is authoritative. The five 8 October migrations for public boundaries, atomic catalog updates, commerce transactions, sequential numbering and direct-write restrictions are installed. Existing order references were preserved. The allocator starts at SED-100200, keeps retry reservations private and never reuses numbers. Local sequential mode is enabled. The user has configured the private server key locally; protected read-only checks passed and the local preview reports checkout and receipt uploads available after restart. Production hosting secrets and positive staging workflows still need verification. The private durable order-email queue is installed. The Resend API key, domain verification, hosted retry schedule and inbox test remain pending; see [EMAIL_DELIVERY_SETUP.md](EMAIL_DELIVERY_SETUP.md). Checkout fails closed whenever its backend key is missing.

Do not route traffic back to the historical SQLite archive. It is not synchronized with Supabase or the current order/stock transaction implementation. The local archive remains preserved at data/seedly.db and in private source snapshots; it is excluded from future Git commits.

## Required production configuration

Configure NEXT_PUBLIC_SUPABASE_URL and a publishable key, SUPABASE_SECRET_KEY as a server-only private key, NEXT_PUBLIC_SITE_URL as the HTTPS production origin, a stable CHECKOUT_SIGNING_SECRET and ORDER_REFERENCE_MODE=sequential. Order email sending additionally needs EMAIL_PROVIDER=resend, RESEND_API_KEY, verified EMAIL_FROM/reply addresses, EMAIL_SITE_URL and a private EMAIL_CRON_SECRET shared with a recurring retry worker. Never paste secret values into tickets, logs, client variables or source.

Admin users must already have explicit active auth_user_id links and OWNER/STAFF roles. Run the positive staging acceptance matrix in the audit before deployment, including stock concurrency, receipt permissions, expired/changed quotes, unknown response recovery and payment/status transitions. Reconcile original inventory reservations for affected historical orders before cancelling them.

## Source rollback

The audit snapshot is F:/Seedly-backups/pre-production-audit-20261007-230348. Earlier design/follow-up/order-email snapshots remain preserved. Their manifests are refreshed to account for new files so a full rollback does not leave incompatible new source modules behind.

First run scripts/restore-version.mjs --backup <absolute backup directory> --section all. This is a dry run. Review listed files; --section appearance provides a CSS/theme-only subset in earlier design snapshots that contain CSS changes. The audit snapshot has no CSS-theme changes. Admin, commerce and security share dependencies and are restored as a coupled bundle. --file can target individual paths, but the maintainer must check their imports and database compatibility.

Add --apply to execute a reviewed restoration. The helper checks hashes and paths, copies the current files into a recovery directory, then restores/removes only recorded source files. Run tests, TypeScript and a clean build afterwards. Git index/history and installed database objects are not restored by this helper. When running a copy of the helper from a backup directory, also pass --workspace F:/Seedly. The original audit snapshot includes private .env.local and the historical archive; keep it private.

Do not restore an exposed password to published source. Do not remove database grants/RLS restrictions to make older code work. In particular, keep public order creation denied, receipt Storage private, exact stock reservations, terminal transition guards and monotonic sequence values. A commerce/auth rollback requires a tested compatibility patch using the secure transactional creator.

## Database recovery

The audit metadata directory contains original function/schema/policy definitions, but is not a data recovery dump. Before launch, enable and test Supabase’s transaction-consistent backup/restore process. Include Auth identities, Storage objects, private schemas, sequences and row data. A private JSON row export from scripts/backup.mjs is supplementary and does not cover all of these or guarantee a consistent snapshot across tables.

In an incident, pause new order acceptance, preserve evidence and take a full database backup. Prefer a forward migration. Reconstruct uncertain historical reservations from actual records; never guess from current kit definitions. Do not rewind the order sequence or delete reservation/idempotency records. Validate the recovery on staging before redirecting customers.

No Git push, deployment, full private customer export, real order mutation or actual customer email was performed in this audit.


## Checkout and email follow-up (9 October)

Checkout field errors are derived from the current values after a failed validation attempt. A corrected field clears immediately; the summary clears when all required fields are valid. Unrelated server/payment errors remain separate.

Migration 20261008220317_durable_order_emails adds the private transactional queue and guarded worker RPCs. Disable the provider and retry worker before rolling back the email source bundle at F:/Seedly/backups/pre-checkout-email-20261009. File restoration does not reverse database objects or environment settings. Preserve pending/unknown messages and reconcile any old direct-sender confirmations before resuming the queue, because their provider keys differ. Keep the backup exclusion in tsconfig.json when restoring source snapshots inside this workspace.

Local settings now use seedly@softbytes.co.uk and https://seedly.softbytes.co.uk, with a generated private worker token. No provider key is configured. No customer email or positive live customer/admin mutation was performed in this follow-up.
