# Header redesign ? 10 October 2026

The storefront now gives the wordmark, product discovery, and basket distinct positions. Desktop uses a main row with a larger Seedly wordmark, a search control, saved products, and a labeled basket button. A lower row holds category and story navigation alongside order tracking. The shipping strip uses the current delivery threshold from store settings.

Below 1024px, the wordmark is centered between the navigation button and search/basket controls. The navigation drawer groups shopping and discovery links, with order tracking, account access, and contact links below. It remains scrollable on short screens and closes when resized to desktop.

Product search retains its live results and images. The new / shortcut opens search when focus is outside editable fields and no dialog is open. Escape closes search even when the search input contains text. Dialog focus return, page scroll locking, and immediate basket opening were verified. Parent category links remain marked as current on product detail routes.

Styles use the existing brand colors, fonts, and icon package. Header selectors are scoped to the storefront; the drawer animation respects reduced motion. No new dependency is required.

## Validation

- TypeScript check passed.
- Production build, including type validation, passed after the search keyboard correction.
- All 66 existing regression tests passed.
- All 16 focused browser checks passed against the final local production build in an isolated headless Chrome profile.
- Browser checks covered live product search and loaded images, arrow-key/Enter navigation, Escape and focus return, the / shortcut, editable-field protection, saved products, persistent basket state, basket opening with background basket requests blocked, order tracking, sticky navigation, mobile menu handoffs, desktop resize, short-screen scrolling, and reduced motion.
- Widths checked: 320, 360, 390, 768, 1024, 1280, and 1440 CSS pixels. No header control overlap or horizontal page overflow was found.
- All ten header/menu destinations returned HTTP 200.
- Browser tests created no orders and sent no customer emails.

Screenshots and the browser results are stored in:
`backups/pre-header-redesign-20261010/`

The final screenshots are `after-desktop.png`, `after-mobile.png`, `after-mobile-menu.png`, `after-desktop-search.png`, and `after-mobile-search.png`. The browser report is `browser-results.json`.

## Backup and rollback

Verified originals were saved before their edits under:
`F:/Seedly/backups/pre-header-redesign-20261010/snapshot/`

The manifest records SHA-256 checksums. It contains the previous Navbar, AnnouncementBar, global stylesheet (including the existing storefront motion), and ProductSearch.

Run from `F:/Seedly`:

```powershell
$taskNode = 'C:\Users\HP\.codex\tools\node-v22.23.3-win-x64\node.exe'
& $taskNode scripts/restore-version.mjs --backup backups/pre-header-redesign-20261010 --section header
```

This is a dry run. Add `--apply` to restore the four header/search files. Current files are saved to a recovery directory before replacement.

Use `--section appearance` to restore the three layout/style files while retaining the Escape correction. Use `--section search` to restore only ProductSearch. Keep Navbar, AnnouncementBar, and the stylesheet together when reverting the visual header. Stop the local server before rebuilding the restored version.

## Local preview

The final production preview runs at `http://localhost:3000`. Build and start commands:

```powershell
$env:Path = 'C:\Users\HP\.codex\tools\node-v22.23.3-win-x64;' + $env:Path
& $taskNode node_modules/next/dist/bin/next build
& $taskNode node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```
