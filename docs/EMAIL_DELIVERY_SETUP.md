> Historical guidance: some configuration, upload limits, and implementation status below have been superseded. Use [the current CMS handoff](ADMIN_MANAGED_CONTENT_2026-10-10.md) and [production security handoff](PRODUCTION_SECURITY_2026-10-10.md). Email activation is deferred until the owner chooses a provider.

# Seedly email delivery setup

Updated 9 October 2026.

The website is https://seedly.softbytes.co.uk. The requested sender is Seedly <seedly@softbytes.co.uk>. Verify softbytes.co.uk in Resend because it is the domain after the @ sign. The website can remain on its existing subdomain.

## Verify the sender domain

1. Open https://resend.com/domains and add softbytes.co.uk with sending enabled.
2. Public nameservers currently identify Namecheap BasicDNS: dns1.registrar-servers.com and dns2.registrar-servers.com. In Namecheap open Domain List ? Manage next to softbytes.co.uk ? Advanced DNS.
3. Copy the exact records displayed by Resend, including type, Host, value and MX priority. Typical sending records are a DKIM TXT at resend._domainkey and an SPF TXT plus MX at send. Use the actual dashboard values rather than values from another account.
4. Namecheap automatically appends the root domain. If Resend shows resend._domainkey.softbytes.co.uk, enter resend._domainkey in Host; if it shows send.softbytes.co.uk, enter send.
5. Preserve the existing website records and root mailbox MX records. The sending MX at send is separate from the existing inbound mailbox configuration. Do not enable Resend inbound receiving or replace root MX just to send confirmations.
6. Save and return to Resend ? Verify DNS Records. Wait for the sending domain to show Verified before activation.

Sending through Resend does not create a mailbox for customer replies. If seedly@softbytes.co.uk is not already a working inbox, create it with the existing mail provider or choose a monitored existing address for EMAIL_REPLY_TO.

Primary references: [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction), [Resend Namecheap guide](https://resend.com/docs/guides/dns/namecheap), [Namecheap TXT/SPF/DKIM records](https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain/).

## Configure the application

Create a Resend API key with Sending access, restricted to the verified domain where that option is available. Store it only on the server.

In F:/Seedly/.env.local for local testing, and in the deployed application's private environment configuration for production:

~~~dotenv
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_private_resend_api_key
EMAIL_FROM="Seedly <seedly@softbytes.co.uk>"
EMAIL_REPLY_TO=seedly@softbytes.co.uk
EMAIL_SITE_URL=https://seedly.softbytes.co.uk
EMAIL_CRON_SECRET=at_least_32_random_private_characters
EMAIL_WORKER_ORIGIN=http://127.0.0.1:3000
~~~

The local sender, reply address, email site URL and a random 64-character worker secret have already been saved without overwriting existing settings. EMAIL_PROVIDER and RESEND_API_KEY remain absent, so sending is inactive. Do not paste keys in chat or use NEXT_PUBLIC_ variables for secrets. Preserve the existing CHECKOUT_SIGNING_SECRET; changing it would invalidate pending tracking capability reconstruction and checkout recovery.

EMAIL_WORKER_ORIGIN addresses the running application from the worker. Use loopback on the same server, or https://seedly.softbytes.co.uk for a separate HTTPS scheduler. EMAIL_SITE_URL always controls customer-facing email links. Configure NEXT_PUBLIC_SITE_URL separately as the production HTTPS origin in the hosting environment. Restart the application after changing its environment; setting .env.local on this computer does not configure the deployed host.

## Run the retry worker

The durable migration 20261008220317_durable_order_emails is installed in Supabase project fyqmbjzpajmnyyqcrmgc. It adds a private queue and an order trigger; it does not backfill historical orders or change their status.

Successful order creation, payment approval/rejection and shipment/delivery API calls schedule a small batch with Next.js after(). A recurring worker is still required to recover interrupted or failed attempts.

With the application running, execute:

~~~powershell
npm run email:worker -- --once
npm run email:worker
~~~

The continuous worker polls every 60 seconds. Run it under the production host's process manager with automatic restart, or configure the host's scheduler to call GET or POST /api/internal/email-delivery every minute with Authorization: Bearer <EMAIL_CRON_SECRET>. The token belongs in the header, never the query string. Ensure the same private token is configured on the server and scheduler. Starting a local worker alone does not create a persistent production schedule.

The endpoint returns only aggregate processing counts. Missing/invalid authorization returns 401; missing credentials or unavailable processing returns 503. An unconfigured provider leaves all jobs untouched.

## Delivery behavior and monitoring

- Emails are queued in the same database transaction as the order/state change. A rolled-back transaction leaves no email event.
- The unique event key prevents duplicate queue entries on checkout replay or repeated status requests. Old direct order-email calls have been removed from the new release.
- Confirmation, payment verified/rejected, shipped and delivered templates include escaped HTML and plain text. Payment verification never marks an order packed. Packing/preparation has no separate automatic customer email.
- Before the first send, the full message, sender, reply address and provider idempotency key are frozen in the database. Retries use the identical body/key. A five-minute claim lease permits recovery after a process stops; stale claim tokens cannot acknowledge a job.
- Temporary network, timeout, rate-limit and provider service failures use exponential retry, up to one hour between attempts. Invalid address/configuration/provider requests fail for operator review.
- Resend retains idempotency keys for 24 hours. This implementation stops automatic resend of an uncertain attempt at 23 hours, or after 20 attempts, and marks it UNKNOWN. Check the provider's logs before any manual resend.
- ACCEPTED means Resend accepted the message. It does not prove inbox delivery. Delivery/bounce webhooks and a dashboard delivery-status view are not implemented.
- Queue data and RPCs are unavailable to anonymous users and normal authenticated browser sessions. Only the private worker can claim/prepare/finish emails.
- Existing restock and WhatsApp adapters remain preparation-only; they are outside this order-email activation.

Use a privileged database session for monitoring; do not expose this data through a public API:

~~~sql
select status,count(*) from seedly_notifications.email_outbox group by status;
select id,event_type,status,attempts,error_code,provider_id,created_at
from seedly_notifications.email_outbox
where status in ('FAILED','UNKNOWN') order by created_at;
~~~

These queries avoid printing recipients or message bodies. Retention/cleanup and production delivery monitoring need an operational owner. Do not delete uncertain jobs to hide failures.

During rollout, disable the old direct sender and deploy the new application before activating the worker. If the old release sent any confirmations after the queue trigger was installed, reconcile those queued events against provider logs before processing them; permanent provider deduplication cannot be assumed across old and new keys.

## Verification and activation checklist

The final local verification passed 66 Node tests, TypeScript, the production build, an isolated PostgreSQL email fixture and 60 production HTTP smoke checks plus two protected-worker HTTP checks. Fixtures cover every lifecycle event, transaction rollback, replay, retry backoff, lease recovery, frozen messages, stale claims, expiry and unauthorized queue access. The live queue initially contained zero rows, and live grants/RLS were checked without creating an order or sending a message.

Before enabling production sending: verify the Resend domain, configure the API key on the deployed server, confirm a monitored reply inbox, deploy this release, start the recurring worker and authorize one test recipient. Test provider acceptance and actual receipt, mobile/email-client rendering and a positive staging order. Actual inbox delivery remains unverified.

## Backup and rollback

The pre-change source snapshot is F:/Seedly/backups/pre-checkout-email-20261009, with SHA256 checksums and section restore manifests. It contains no environment secrets.

~~~powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-checkout-email-20261009 --section checkout
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-checkout-email-20261009 --section email
~~~

Commands default to dry run; add --apply only when restoring. Disable the provider/worker before restoring the email bundle. Restoring source does not remove the live queue, trigger or migrations. Keep queued evidence and review old/direct-sender compatibility before reactivation. The backup exclusion in tsconfig.json is retained as housekeeping so backup source files never enter application compilation. Environment changes are managed separately.
