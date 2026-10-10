# Admin-managed website content: implementation and handoff

Updated 10 October 2026. Supabase-backed content management is implemented. This handoff records verified checks and remaining release gates; it is not a production-readiness certificate.

## Editing workflow

Open Website Content at /admin/content. Search documents, select a content section, edit its structured fields, and save a draft. Published content stays unchanged until an OWNER publishes the document. The editor shows draft/published versions, loading and error states, and revision history.

Active administrators must have a verified Supabase Auth identity linked to an active OWNER or STAFF record. STAFF can create pages, save drafts, and restore a revision into a new draft. Only OWNER can publish or unpublish. These permissions are enforced by authenticated APIs and the database mutation function, not just hidden buttons. Anonymous visitors can read published documents only; drafts and history remain administrator-only.

The 22 seeded Supabase documents are:

| Area | Documents |
| --- | --- |
| Main pages and guidance | home, about, faq, contact, shipping, returns, privacy, terms, product-disclaimer |
| Catalog and customer workflows | shop, seeds, kits, teas, cart, checkout, account, wishlist, order |
| Specialized content | routine, product |
| Shared website configuration | site |
| Internal custom-page template | page-template |

The internal template is not a public page. Structured fields cover SEO, text, links, images, supported section visibility, ordered lists, FAQs, navigation, feature visibility, product guidance, routine questions and recommendation rules. Site content owns branding, logo, contact information, header/footer copy, announcements and social links. Published site.config.url is the authoritative HTTPS origin for canonical website URLs; NEXT_PUBLIC_SITE_URL is no longer a runtime requirement. Supported routine answer identifiers stay protected while labels and supported rules can be edited.

Create a custom page using New page. It starts as a draft and publishes at /pages/<slug>. Custom sections support a title, plain-text body, image, link and visibility switch. Add its navigation link separately in the site document when desired. Unpublishing a custom page removes its public route while preserving its draft and history. Required built-in content cannot be unpublished.

## Safeguards and synchronization

Content is validated in application code and PostgreSQL: allowed fields and types, safe links/image locations, bounded lists and nesting, unique item identifiers and a 128 KB document limit. Content is rendered as structured escaped text, not executable HTML or arbitrary scripts. Publication is transactional; history records each successful mutation.

Every update supplies the loaded version and is serialized per document. A stale version returns HTTP 409 without overwriting another editor's changes. The conflict panel preserves local edits and offers Download my draft and Load latest version. Restoring history creates a new draft; it does not silently republish. Unsaved-change prompts and upload-in-progress guards reduce accidental loss.

The additive conflict migration uses SQLSTATE PT409 rather than 40001, which PostgREST treats as retryable serialization failure. This keeps stale-editor responses bounded and actionable. See [Supabase troubleshooting](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) and [PostgREST custom errors](https://docs.postgrest.org/en/stable/references/errors.html#custom-errors). Apply the additive migration as well as the initial CMS migration when provisioning another environment.

The storefront fetches the published Supabase snapshot dynamically; seed files are migration inputs, not runtime fallbacks. Generic Realtime invalidation events cover published content, catalog, settings and reviews without broadcasting customer data. Connected visible pages refetch content, refresh server-rendered data, and notify basket/settings consumers. A 30-second polling fallback plus focus, reconnect and visibility checks handle missed events. Open pages retain their last published snapshot during a transient refresh outage; initial-load failures show an error rather than fabricated content.

## Data ownership

| Data | Authoritative editor/source |
| --- | --- |
| Branding, support contact, navigation, page copy, SEO, supported visibility and routine content | Website Content; Supabase drafts, published documents and revisions |
| Products, packs, prices, stock, categories, kit composition and product images | Existing catalog dashboard and Supabase catalog tables |
| Delivery fees, free-delivery threshold, serviceable cities, payment destinations and ordering/payment availability | Store & Payment Settings; Supabase site_settings |
| Order/payment/fulfillment operations and review moderation | Existing operational dashboard and guarded Supabase workflows |
| Administrator identity and role access | Supabase Auth plus explicit active administrator records |
| Private credentials, verified email sender, hosting and worker configuration | Server/hosting environment; never the CMS |

Duplicate store-name, tagline, support-email and WhatsApp editors were removed from Store Settings. That page links to the site content editor; deprecated API writes are rejected with a clear message. Legacy settings reads remain compatible. Checkout and database transactions recheck ordering availability, destinations, prices and stock; pausing orders preserves recovery of already committed attempts.

Images use the existing authenticated uploader and public product-images bucket. Uploads are capped at 4 MiB with bounded multipart overhead for Vercel's request limit. Server validation checks file signatures; supported local paths, Unsplash and the configured public bucket are accepted. Payment receipts stay in private Storage with separate authorization. Public image upload is not allowed.

Email template display branding reads published site content when a message is first prepared. Frozen queued messages remain unchanged on retries. CMS contact changes do not configure an email provider or a verified sending address.

## Boundaries

This is a structured CMS for existing layouts and supported custom-page sections. It is not a visual editor for arbitrary React components, CSS, 3D scenes or new block types. New rendering components, schema fields, payment integrations, recommendation algorithms and security rules still require reviewed code and migrations. Visibility switches affect presentation; they do not grant permissions or disable API validation. Basket/saved-item browser persistence and private guest tracking capabilities retain their existing workflows.

## Verification status

The initial integrated Node run passed 87/87 tests; the deployment configuration guard and administrator outage response bring the passing regression total to 99/99. The 11 October Roboto and catalog-filter update passed 107/107 regressions and 11 additional browser checks; see ROBOTO_AND_FILTERS_2026-10-11.md. Eleven CMS SQL security/workflow groups and all six isolated SQL verification suites passed. HTTP checks passed 60/60. CMS browser acceptance passed 15/15, including real Storage upload, OWNER/STAFF permissions, atomic publication, automatic refresh of an open guest page, stale-version HTTP 409 and recovery, revision restore, custom-page unpublishing, mobile behavior and no browser exceptions. The final integration build and TypeScript passed. All eight storefront browser checks passed against the final production build, including live search, instant sorting/filtering, settled purchase-button alignment, mini cart, checkout validation clearing, routine recommendations, reduced motion and mobile layouts. Temporary page, image, two Auth users and two administrator links were removed after verification; the private credential fixture was deleted. No customer order was placed and no email was sent. These checks are local or isolated verification, not hosted production acceptance. Live email delivery and positive customer commerce workflows are not certified by these counts.

Remaining gates:

- Verify Vercel production environment variables, protected preview behavior and staging isolation. Check the intended published CMS site.config.url; the preflight CLI reads the public snapshot with a 15-second deadline and does not print content or keys. Hosted deployment acceptance must still be verified after the requested GitHub push.
- Confirm exposed administrator credential rotation and session revocation; enable [Supabase leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) and review administrator protection.
- Reconcile historical orders whose original inventory reservations are incomplete before cancellation; never reconstruct old kit contents from current recipes.
- Complete staging checkout, private receipt, lost-response recovery and concurrent stock/idempotency acceptance.
- Test database/Auth/Storage disaster recovery and hosted monitoring. A source snapshot is not a complete database recovery backup.
- Email provider selection and live delivery tests are explicitly deferred by the owner. The durable outbox does not establish delivery; Vercel email scheduling stays disabled until activation. Timely retry scheduling and delivery/bounce monitoring remain activation work.
- Five high development dependency findings through Tailwind 3/braces remain, despite zero production dependency findings. Large-volume dashboard pagination/aggregation and real hosted performance testing remain scale limitations.

## Backup and rollback

The pre-change source snapshot is F:/Seedly/backups/pre-production-cms-20261010, hashed before edits. Keep backups and verification artifacts private. Use the [restore helper](../scripts/restore-version.mjs) and review its current change manifest before applying restoration:

~~~powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-production-cms-20261010 --section all
~~~

This command is a dry run. The change manifest records all changed/new files; all 264 original source files passed SHA-256 verification. Applied migration history is retained by the restore helper. The cms-and-storefront and admin-content sections restore the coupled application bundle; email, deployment and documentation sections are also available, as is an explicit --file restore for deliberate maintenance. Add --apply only after reviewing the listed coupled changes, then rerun tests, TypeScript and the build. Restoring source does not reverse Supabase migrations, grants, Auth, Storage or hosting environment changes. Prefer a compatible forward repair; never reopen privileged anonymous writes or rewind order sequence, reservation or idempotency records.

See the [production security handoff](PRODUCTION_SECURITY_2026-10-10.md), [cutover/rollback runbook](CUTOVER_AND_ROLLBACK_RUNBOOK.md) and [historical production audit](PRODUCTION_AUDIT_2026-10-08.md). Older email activation instructions are optional provider guidance; the current owner decision is to defer email activation.

## Advisor review

All CMS tables have RLS enabled; anonymous content mutations and review writes are denied. The final production dependency audit found zero vulnerabilities. Supabase notices remain for intentional [service-only tables](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [guest capability lookup](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), and [authenticated privileged functions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). The fixture tests verify role/capability restrictions; warning counts alone do not certify safety. Performance notices include [multiple permissive policies](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies) and [unused indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index); no speculative index removal or policy rewrite was applied.
