# Seedly: Supabase Cutover & Rollback Runbook

## 1. Migration Summary & Status

Seedly has been successfully migrated from local SQLite (`node:sqlite`) to Supabase PostgreSQL, Supabase Auth, and private Supabase Storage.

- **Supabase Project**: `fyqmbjzpajmnyyqcrmgc` (`awaisciitcs@gmail.com's Project`, region `ap-southeast-2`)
- **Database Engine**: PostgreSQL 17 (Supabase Managed)
- **Authentication**: Supabase Auth GoTrue (BCrypt password hashing) with verified admin accounts
- **Storage**: Private bucket `payment-receipts` (max 5MB, magic-byte inspection, short-lived signed URLs)
- **Data Parity**: 100% reconciled from authoritative SQLite `data/seedly.db`

---

## 2. Security Hardening & Access Control Architecture

### Row-Level Security (RLS) Policies
| Table | Anonymous / Storefront Clients | Authenticated Admin / Owner |
|---|---|---|
| `categories` | Read active categories (`is_active = true`) | Full administrative management |
| `products` | Read active products (`status = 'ACTIVE'`) | Full administrative management |
| `product_variants` | Read active variants belonging to active products | Full administrative management |
| `kits` | Read active kits (`status = 'ACTIVE'`) | Full administrative management |
| `kit_items` | Read kit components belonging to active kits | Full administrative management |
| `reviews` | Read approved non-demo reviews (`status = 'APPROVED' AND is_demo = false`), submit pending reviews | Full moderation and demo review management |
| `site_settings` | Read public non-sensitive keys (delivery fee, free shipping threshold, bank details) | Full settings management (Owner restricted) |
| `orders` | **NO DIRECT ACCESS** (blocked by RLS) | Manage orders via `is_admin()` policy |
| `order_items` | **NO DIRECT ACCESS** (blocked by RLS) | Manage order items via `is_admin()` policy |
| `order_events` | **NO DIRECT ACCESS** (blocked by RLS) | Read audit trail via `is_admin()` policy |
| `admin_users` | **NO DIRECT ACCESS** (blocked by RLS) | View own profile; Owner manages users |
| `stock_alert_subscriptions` | Subscribe / unsubscribe via token hash | View and trigger restock alerts |
| `stock_alert_deliveries` | **NO DIRECT ACCESS** (blocked by RLS) | Read delivery logs |

### Transactional RPCs (PostgreSQL Stored Procedures)
1. `create_order_transactional`:
   - Enforces checkout idempotency replay (matches request fingerprint).
   - Locks affected product variants `FOR UPDATE`.
   - Atomically checks stock availability (never allows overselling or negative inventory).
   - Inserts order, line items, and decrements stock in a single atomic database transaction.
   - Generates capability token hash for unguessable customer order tracking.
2. `update_order_payment_transactional`:
   - Guarded by internal `is_admin()` check.
   - Enforces valid payment state transitions (`VERIFIED`, `REJECTED`).
   - Writes immutable audit trail to `order_events`.
3. `update_order_fulfillment_transactional`:
   - Guarded by internal `is_admin()` check.
   - Enforces fulfillment state machine (`RECEIVED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).
   - Prevents unverified bank transfers from being marked as packed or shipped.
   - Writes immutable audit trail to `order_events`.
4. `lookup_order_with_capability`:
   - Public tracking RPC granted to `anon, authenticated`.
   - If caller is admin or presents matching SHA256 capability token or customer email/phone verification: returns full order details.
   - If unverified/anonymous: returns masked PII (masked name, email, phone, masked street address, no admin notes, no receipt links).

---

## 3. Administrator Access

Two production admin accounts have been provisioned in Supabase Auth and mapped to `public.admin_users`:
- **Owner**: `owner@seedly.pk` (Role: `OWNER` — full store settings & admin access)
- **Staff**: `staff@seedly.pk` (Role: `STAFF` — catalog, orders, and review moderation access)

Initial temporary password: `ChangeMe123!Admin` *(Admins must reset on first login)*.

---

## 4. Environment Configuration

### Production Environment Variables (`.env` / Hosting Provider)
```env
NEXT_PUBLIC_SUPABASE_URL=https://fyqmbjzpajmnyyqcrmgc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qu7RVH39xF_KTN9RETEECg_vC3rzb3P
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cW1ianpwYWptbnl5cWNybWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzM2NzUsImV4cCI6MjEwNjEwOTY3NX0.dTRmzfklrB4W1lc5OG3YrV-Fa4pY5OJ4oQLmNAMQVE4
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://seedly.pk
```

---

## 5. Verification Checklist & Test Results

- [x] **TypeScript Validation**: `npx tsc --noEmit` passed with 0 errors.
- [x] **Product Search Tests**: `node --test scripts/product-search.test.cjs` passed 7/7 tests.
- [x] **Order Status State Machine Tests**: `node --test scripts/order-status.test.cjs` passed 7/7 tests.
- [x] **Next.js Production Build**: `npm run build` compiled 43 static & dynamic routes and middleware (94.6 kB).
- [x] **Anon RLS Isolation**: Direct queries with anonymous key return 0 rows for `orders`, `admin_users`, and private storage.
- [x] **Demo Review Exclusion**: Demo reviews (`rev-1`, `rev-2`, `rev-3`) are flagged `is_demo = true` and excluded from public storefront.

---

## 6. Rollback Runbook

If an emergency rollback to SQLite is required before write traffic starts:
1. In `next.config.mjs`, re-enable SQLite asset tracing if needed.
2. The original SQLite database is preserved at `data/seedly.db`.
3. If new orders have occurred on Supabase before deciding to roll back:
   - Export all orders created after cutover: `SELECT * FROM orders WHERE created_at >= '<cutover_time>';`
   - Import into `data/seedly.db` before routing traffic back to avoid order loss.
