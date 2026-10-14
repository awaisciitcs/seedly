# Checkout dropdown and discounts

The city field is an editable combobox using the existing Pakistan city and province data. Its menu is rendered in a portal, measured against the visual viewport, and placed below the input when it fits or above when necessary. The options scroll independently. Compact windows hide the decorative header and footer to leave space for selectable rows. Mouse, touch, arrow keys, Enter, Escape, Tab and Ctrl+Home/End are supported; unlisted towns remain valid text entries. Selecting a known city retains automatic province selection and existing live field validation.

## Managing coupons

Open **Admin → Discount Codes** (`/admin/coupons`). Owners can create and edit codes; active staff can inspect them. New codes are paused by default. There are no seeded public promotional codes.

Set a percentage (whole numbers from 1 to 100) or fixed PKR amount, optional minimum item subtotal, maximum discount, start/end dates, total redemption limit, and per-email limit. Dates in the editor use the browser's local timezone; storage uses UTC. Blank dates or limits mean unrestricted. Enable the code and save. To stop an offer, edit it and uncheck **Enable this discount code**. Codes cannot be renamed or deleted, preserving redemption history. Concurrent edits are rejected by the `updated_at` version check; close the editor, reload codes and reopen the code before resubmitting.

Customers can apply/remove a code in the basket and checkout. The chosen code persists between those pages and across reloads. Only one code applies to an order. Discounts apply to the item subtotal and cannot exceed it; delivery remains payable. Free-delivery eligibility continues to use the original item subtotal. The mini basket, public order page, administrator order drawer and confirmation email display discounted totals. Coupons clear after an accepted order or an explicit basket clear.

Per-email limits match the normalized submitted checkout email. Guest emails are not proof of a person's identity; someone using another email has a separate allowance. Accepted orders count once, including cancelled/refunded orders. This avoids repeatedly reclaiming a code through cancellation. Quotes check current eligibility and order submission rechecks it atomically.

## Security and data

`20261014015105_checkout_coupons.sql` adds private `coupons` and `coupon_redemptions` tables, an admin view with `security_invoker`, and an optional `orders.coupon_code` column. It does not rewrite existing orders, products, stock, settings or website content. Coupon/redemption tables use RLS. Anonymous users cannot read them, including customer emails. Owners manage rules through authenticated RLS; the private server role alone can redeem codes. The public quote API retains origin checks and rate limiting.

The signed quote binds the code, coupon ID/version, discount, totals, item identities and prices. The request fingerprint includes a nonempty coupon while preserving older coupon-free checkout fingerprints. The new database transaction calls the existing secure order/stock transaction, locks the coupon row before checking redemption counts, recalculates the discount, updates final totals, fixes the queued email snapshot, and inserts one redemption. Any failure rolls everything back. An idempotent retry returns the original order even if the coupon is paused or expired afterwards.

## Verification and rollback

Source backup: `backups/pre-checkout-coupons-20261014` (tracked source archive and checksummed snapshots; environment keys excluded). The change manifest supports a city-component rollback and coupon-code rollback. Shared CSS is intentionally retained in those section restores so restoring one feature does not alter the other. A complete source restore can include shared CSS.

Preview without applying:

```powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-checkout-coupons-20261014 --section city-dropdown
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-checkout-coupons-20261014 --section coupons
```

Retain the applied migration and redemption history. Reverting application code disables new coupon checkout without deleting saved records; use a reviewed forward migration for any database repair.

`npm test` covers input limits, eligibility, signed quote tampering, authorization and existing commerce workflows. `scripts/verify-coupons.mjs` runs the real migrations and transactions in a disposable PGlite database, including rejected-discount rollback, caps, usage limits, replay, stale versions, email amounts and role permissions. It does not create live orders or send emails. Browser QA artifacts and the release verification report are saved with the backup.
