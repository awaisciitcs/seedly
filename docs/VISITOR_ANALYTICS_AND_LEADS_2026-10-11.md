# Visitor analytics and private leads - 11 October 2026

The storefront now has consent-controlled PostHog behaviour analytics, optional masked Microsoft Clarity recordings, and a private Supabase leads list. Owners can configure these features through the existing dashboard. PostHog and Clarity are disabled until project details are supplied. Contact capture is enabled, with a default retention of 90 days.

## Configure providers later

1. Sign in at https://seedly.softbytes.co.uk/admin/login and open **Visitor Analytics** (https://seedly.softbytes.co.uk/admin/analytics). Only an active OWNER can change this configuration.
2. Create your PostHog project. In project settings, copy its public **phc_... project token**, select the matching **EU or US** cloud region, and enter its numeric **project ID** for dashboard links. Do not enter a phx_ personal API key, a Supabase secret, or another private credential. Enable PostHog and save.
3. If using Clarity, create a website project for https://seedly.softbytes.co.uk. Copy the public project ID. Select **Strict masking** and require consent in the Clarity dashboard, then enter the project ID, enable Clarity, and save.
4. Visit the shop in a fresh browser session. Before acceptance, neither optional provider should send events. Accept only the categories you want to test. Browse products, change filters, use the basket and submit an authorized test contact.
5. Verify events in PostHog and any permitted recordings in Clarity. Open **Leads & Journeys** (https://seedly.softbytes.co.uk/admin/leads), find the submitted contact and use its PostHog journey link. Withdraw consent through **Privacy choices** in the footer and check that optional collection stops. Deleting a test lead in Seedly does not delete its provider history; remove that history in the provider dashboard separately.

No new Vercel environment variables, private provider API keys or provider proxy are required for this setup. Public project settings are stored in Supabase and refresh in an open storefront within 45 seconds or on focus. A provider/project change invalidates the previous scoped choice. A loaded provider is unloaded by reloading the page where necessary.

Official setup references: [PostHog for Next.js](https://posthog.com/docs/libraries/next-js), [PostHog identification](https://posthog.com/docs/product-analytics/identify), [Microsoft Clarity consent API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).

## Data and consent

- Consented PostHog events cover page and product views, selected filters, sorting, result counts, basket actions, checkout starts, successful orders/submissions, contact-channel clicks and scroll milestones. Provider device details and approximate IP-based geography are available after consent. Autocapture, raw search text, automatic exception/network capture and PostHog session replay are disabled.
- Names, phones, emails and an optional city stay in the protected leads table. Contact-form submissions require a valid name and at least one contact method, plus permission to reply. Marketing permission is a separate unchecked choice. Typed or abandoned fields are never captured.
- Checkout and restock information creates an optional lead copy only after the original operation succeeds. Optional synchronization waits at most five seconds; errors or timeouts are contained and do not roll back a successful order or restock request. A missing optional lead copy can be reviewed separately. Original checkout idempotency, stock checks, payment status and email scheduling remain in place.
- Links use a consented browser identifier and opaque lead UUIDs, without sending contact details as analytics properties. Repeated submissions from the same consented browser keep its existing journey identity. Identities are self-reported; links do not verify email/phone ownership, and shared browsers may contain interactions from more than one person. Leads are never merged by email or phone.
- Referral capture is restricted to a hostname, approved public page paths and bounded campaign values. URL queries, fragments, order access tokens and sensitive identifiers are removed. WhatsApp/call clicks reveal only the clicked channel; they do not disclose the caller's identity.
- Clarity uses separate affirmative consent, masks body text and excludes admin, account, checkout, basket, order, contact and routine pages. Query/fragment pages and sensitive referrers are excluded. Recordings stop before a search or private SPA navigation reaches history.
- Do Not Track and Global Privacy Control keep optional tracking off. Consent expires after 180 days, is scoped to the configured providers, and can be rejected or withdrawn without preventing shopping. Already-collected provider history is not automatically erased by withdrawal.
- Lead expiry applies to new copies, not existing orders. Expired rows disappear from admin results through RLS. Up to 1,000 expired rows are physically purged on a successful new lead submission or the owner's expiry-purge button. There is **no scheduled daily purge** in this release; on an idle site, physical deletion waits for a submission or an owner purge. Provider retention and deletion must also be configured in each provider dashboard.

Anonymous visitors cannot reliably be assigned names, phone numbers or emails unless they submit them. Ad blockers, rejected consent, disabled JavaScript and provider delivery failures can reduce observed traffic. The integration does not fingerprint devices or try to infer a real-world identity.

## Administration and security

- Active OWNER/STAFF accounts can read unexpired leads. Only OWNER accounts can change tracking settings, erase a lead or run the bounded expiry purge. Anonymous visitors and ordinary authenticated users cannot read identities or insert directly into the table.
- Admin requests use verified Supabase Auth and role checks alongside database RLS. Public submission requires same-origin JSON, validation, bounded payloads, honeypot filtering and shared rate limiting.
- An opaque submission key and HMAC prevent duplicate retries or changed-payload overwrites. API responses reveal only a submission's own lead UUID. Contact information never controls admin authorization.
- Search, source filtering, 25-row pagination, details and current-page CSV export are available. Exports neutralize spreadsheet formula prefixes. Failed requests and empty states are visible. Settings use version checks to prevent stale updates.
- Browser SDKs are loaded lazily only after affirmative consent. Optional analytics does not block navigation or basket interactions. Tracking runs only within the public layout.

## Validation and limits

The release passed 128 regression tests, TypeScript checking and a production build. The runtime dependency audit reported no vulnerabilities. Isolated desktop/mobile browser checks cover real contact persistence, validation correction, duplicate retry handling, owner controls, private-key rejection, stale-version rejection, consent rejection, SDK loading after acceptance and withdrawal. Synthetic contacts are erased after checks; no test orders, emails or restock notifications are created.

Hosted Supabase checks confirm both new tables have RLS, anonymous identity access and direct inserts are denied, and a rollback-only transaction verifies OWNER access versus a non-admin. Existing order, product and content records are preserved. Optional providers remain disabled; actual PostHog ingestion and Clarity recordings cannot be verified until real project details are configured. This is verification of the new integration, not a certification of every pre-existing system or legal compliance.

## Backup and rollback

The source archive and original files are in **F:/Seedly/backups/pre-visitor-tracking-20261011**, based on commit **9e83ff974f171473fff057b9963f3e9433f970fc**. Environment secrets and customer record exports are excluded. The manifest records original checksums and changes.json records this release.

Preview a source-only rollback:

~~~powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-visitor-tracking-20261011 --section visitor-tracking
~~~

Add --apply only after reviewing the preview, then rebuild, test and deploy. Current files are saved into a recovery folder before restoration. Dependency versions should be restored together with all provider hooks and UI components.

**Retain applied migration 20261011100854_visitor_tracking_and_private_leads.sql and the new tables.** This additive migration does not seed, reset, update or delete existing commerce/CMS records. A code rollback does not drop leads or erase submitted customer information. Repairs to an already-applied schema require a reviewed forward migration. The Vercel build never runs seeds or database resets.
