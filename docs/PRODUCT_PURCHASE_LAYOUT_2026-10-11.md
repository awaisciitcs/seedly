# Product purchase placement - 11 October 2026

Seed, tea and kit product pages now place the purchase controls directly after the price and pack selection. Descriptions, delivery information, bundle contents and product assistance follow the controls. The purchase area has a pale green background and a prominent 56px primary button, with quantity controls alongside it. Buy now and saving products remain available beneath it.

Mobile galleries use a compact height while preserving the complete image and enlargement controls. The mobile purchase bar appears whenever the main purchase button is not fully visible, including the initial screen on smaller phones. It respects the header and bottom navigation, and clears its state when leaving the page or resizing to desktop.

Existing variant selection, stock checks, quantity limits, basket synchronization, checkout navigation and reviews are retained. No database migrations, seeds, configuration changes or record updates are part of this release.

## Validation

- 107 existing regression tests passed.
- 17 isolated browser checks passed across seed, tea and kit pages at desktop, laptop, 390px mobile and 320px mobile sizes.
- Checks cover initial purchase visibility, scrolling and resizing, selecting a 500g pack, quantity changes, adding to the basket, saving products, image enlargement, review availability and Buy now navigation.
- Browser verification creates no orders and sends no email; only the read-only basket synchronization API is allowed to POST.

## Rollback

Source archive and original copies are stored in backups/pre-product-purchase-position-20261011, based on commit e95666045c5f22366b687af647113c0e46e27c2b. Environment files and database records are excluded.

Preview the section restore before applying it:

```powershell
node scripts/restore-version.mjs --backup F:/Seedly/backups/pre-product-purchase-position-20261011 --section product-purchase
```

Append --apply to restore this section, then rebuild, check the layout and deploy. Restoration saves the current files to a recovery folder first. Shared CSS changes made after this snapshot must be reviewed before restoring the entire CSS file.
