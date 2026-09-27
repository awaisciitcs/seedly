import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'seedly.db');
const db = new DatabaseSync(dbPath);

console.log('Clearing old catalog and seeding authentic packaging and product dossiers...');

// Clear old catalog
db.exec(`
  DELETE FROM kit_items;
  DELETE FROM kits;
  DELETE FROM product_variants;
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM reviews;
`);

// 1. Categories
const insertCat = db.prepare(`
  INSERT INTO categories (id, name, slug, type, description, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertCat.run(
  'cat-seeds',
  'Heirloom Seeds',
  'seeds',
  'seed',
  'Whole, raw, single-origin seeds from family farms across Punjab. Tested for purity and cold-stored.',
  1
);
insertCat.run(
  'cat-kits',
  'Curated Kits',
  'kits',
  'kit',
  'Portioned seed routines and starter boxes with measuring tools and cycle calendars.',
  2
);
insertCat.run(
  'cat-teas',
  'Herbal Teas',
  'teas',
  'tea',
  'Whole flower blossoms and shade-dried mountain leaves from Gilgit and northern valleys.',
  3
);

// 2. Products
const insertProd = db.prepare(`
  INSERT INTO products (
    id, category_id, name, slug, sku, product_type, status, short_description, description,
    price_minor, compare_price_minor, weight_grams, ingredients, usage_instructions,
    storage_instructions, flavor_profile, caffeine_level, steep_time, water_temp,
    nutrition_information, seo_title, seo_description, image_url, badge, is_featured
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertVariant = db.prepare(`
  INSERT INTO product_variants (
    id, product_id, sku, option_name, option_value, price_minor, compare_price_minor,
    weight_grams, inventory_quantity
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Pumpkin Seeds
insertProd.run(
  'prod-pumpkin',
  'cat-seeds',
  'Raw Heirloom Pumpkin Seeds',
  'pumpkin-seeds',
  'SED-PUMP-RAW',
  'seed',
  'ACTIVE',
  'Raw unsalted green pepitas from Sahiwal. Sun-dried and high in elemental zinc and magnesium.',
  'Carefully shelled, triple-cleaned, and sun-dried to keep their natural oils intact. Grown in the fertile soil of Sahiwal, Punjab. A mineral-dense staple for morning bowls, salads, sourdough toasts, or straight from the jar.',
  95000,
  110000,
  250,
  '100% Raw Unsalted Pumpkin Seed Kernels (Cucurbita pepo)',
  'Eat 1 to 2 tablespoons daily. Blend into smoothies, toss over salads, or lightly toast on low heat for 2 minutes.',
  'Store tightly sealed in a dry pantry away from direct heat. Once opened, keep in a cool place or refrigerate for maximum crunch.',
  null,
  null,
  null,
  null,
  JSON.stringify({
    calories: '160 kcal / 28g',
    protein: '9g',
    magnesium: '150mg (37% DV)',
    zinc: '2.2mg (20% DV)',
    origin: 'Sahiwal, Punjab',
  }),
  'Raw Heirloom Pumpkin Seeds (250g) | Seedly Pakistan',
  'Sun-dried, raw heirloom pumpkin seeds grown in Sahiwal. Clean, unsalted, and high in zinc.',
  '/images/products/pumpkin-seeds.svg',
  'BESTSELLER',
  1
);
insertVariant.run('var-pump-100', 'prod-pumpkin', 'SED-PUMP-100', 'Pack Size', '100g', 45000, null, 100, 30);
insertVariant.run('var-pump-250', 'prod-pumpkin', 'SED-PUMP-250', 'Pack Size', '250g', 95000, 110000, 250, 45);
insertVariant.run('var-pump-500', 'prod-pumpkin', 'SED-PUMP-500', 'Pack Size', '500g', 175000, 195000, 500, 20);

// Flax Seeds
insertProd.run(
  'prod-flax',
  'cat-seeds',
  'Cold-Milled Golden Flax Seeds',
  'flax-seeds',
  'SED-FLAX-GLD',
  'seed',
  'ACTIVE',
  'Golden flax seeds from Bahawalpur, cold-milled in small batches to preserve omega-3 fatty acids.',
  'Sourced from smallholder cooperatives in Bahawalpur. We cold-mill these golden flax seeds slowly to prevent heat friction, protecting delicate alpha-linolenic acid (ALA) and soluble lignan fiber.',
  68000,
  80000,
  250,
  '100% Pure Golden Flax Seeds (Linum usitatissimum)',
  'Take 1 tablespoon daily. Stir into yogurt, porridge, dough, or smoothies.',
  'Keep sealed in a cool, dark cupboard. After opening, refrigeration is recommended to preserve delicate omega-3s.',
  null,
  null,
  null,
  null,
  JSON.stringify({
    calories: '150 kcal / 28g',
    omega3_ala: '6,400mg',
    dietary_fiber: '8g',
    protein: '5g',
    origin: 'Bahawalpur, Punjab',
  }),
  'Cold-Milled Golden Flax Seeds (250g) | Seedly Pakistan',
  'Locally sourced golden flax seeds, cold-milled in batches to protect vital omega-3 fatty acids.',
  '/images/products/flax-seeds.svg',
  'POPULAR',
  1
);
insertVariant.run('var-flax-100', 'prod-flax', 'SED-FLAX-100', 'Pack Size', '100g', 32000, null, 100, 25);
insertVariant.run('var-flax-250', 'prod-flax', 'SED-FLAX-250', 'Pack Size', '250g', 68000, 80000, 250, 40);
insertVariant.run('var-flax-500', 'prod-flax', 'SED-FLAX-500', 'Pack Size', '500g', 125000, 140000, 500, 15);

// Sunflower Seeds
insertProd.run(
  'prod-sunflower',
  'cat-seeds',
  'Organic Raw Sunflower Kernels',
  'sunflower-seeds',
  'SED-SUN-RAW',
  'seed',
  'ACTIVE',
  'Plump raw sunflower kernels from Multan. Rich in natural Vitamin E and dietary selenium.',
  'Shelled clean without heat or chemical solvents. Grown in Multan’s fertile sun-drenched plains, our sunflower kernels have a mild, clean, nutty flavor and a tender crunch.',
  72000,
  85000,
  250,
  '100% Raw Shelled Sunflower Kernels (Helianthus annuus)',
  '1 to 2 tablespoons daily. Eat raw or lightly dry-toasted in a pan. Excellent in baking and homemade seed trail mixes.',
  'Store in an airtight jar in a cool, dry pantry away from light.',
  null,
  null,
  null,
  null,
  JSON.stringify({
    calories: '165 kcal / 28g',
    vitamin_e: '10mg (66% DV)',
    selenium: '23mcg (34% DV)',
    protein: '6g',
    origin: 'Multan, Punjab',
  }),
  'Raw Sunflower Seed Kernels | Seedly Pakistan',
  'Raw, clean sunflower seed kernels from Multan. High in natural vitamin E and plant protein.',
  '/images/products/sunflower-seeds.svg',
  null,
  0
);
insertVariant.run('var-sun-100', 'prod-sunflower', 'SED-SUN-100', 'Pack Size', '100g', 35000, null, 100, 20);
insertVariant.run('var-sun-250', 'prod-sunflower', 'SED-SUN-250', 'Pack Size', '250g', 72000, 85000, 250, 35);
insertVariant.run('var-sun-500', 'prod-sunflower', 'SED-SUN-500', 'Pack Size', '500g', 135000, 155000, 500, 15);

// Sesame Seeds
insertProd.run(
  'prod-sesame',
  'cat-seeds',
  'Natural White Sesame Seeds',
  'sesame-seeds',
  'SED-SES-WHT',
  'seed',
  'ACTIVE',
  'Unhulled sun-dried white sesame seeds from Sargodha. Rich in bioavailable calcium and sesamin.',
  'Our sesame seeds retain their nutrient-dense outer hull, making them exceptionally rich in natural plant calcium. Never bleached, chemically washed, or sulfured.',
  62000,
  75000,
  250,
  '100% Natural White Sesame Seeds (Sesamum indicum)',
  '1 tablespoon daily. Lightly toast in a skillet for 2 minutes to bring out the aromatics, or grind into fresh homemade tahini.',
  'Keep sealed at room temperature away from moisture.',
  null,
  null,
  null,
  null,
  JSON.stringify({
    calories: '160 kcal / 28g',
    calcium: '280mg (28% DV)',
    iron: '4.1mg (23% DV)',
    healthy_fats: '14g',
    origin: 'Sargodha, Punjab',
  }),
  'Natural White Sesame Seeds | Seedly Pakistan',
  'Unhulled, unbleached white sesame seeds from Sargodha. Exceptional natural calcium content.',
  '/images/products/sesame-seeds.svg',
  null,
  0
);
insertVariant.run('var-ses-100', 'prod-sesame', 'SED-SES-100', 'Pack Size', '100g', 30000, null, 100, 25);
insertVariant.run('var-ses-250', 'prod-sesame', 'SED-SES-250', 'Pack Size', '250g', 62000, 75000, 250, 40);

// Chamomile Tea
insertProd.run(
  'prod-chamomile',
  'cat-teas',
  'Pure Whole Flower Chamomile Tea',
  'chamomile-tea',
  'SED-TEA-CHAM',
  'tea',
  'ACTIVE',
  'Hand-gathered whole chamomile flowers from Gilgit valleys. Naturally caffeine-free with honey-apple notes.',
  'Only intact, aromatic whole flower heads—never broken fannings or bleached tea bags. Harvested at high elevation in Gilgit-Baltistan and shade-dried to protect fragile volatile oils. Brews into a gentle golden cup.',
  125000,
  145000,
  50,
  '100% Whole Dried German Chamomile Blossoms (Matricaria chamomilla)',
  'Steep 1 tablespoon of whole flower heads in 250ml of freshly boiled water (95°C) for 5 minutes. Strain and enjoy warm.',
  'Store tightly capped in dark amber glass away from humidity and direct sunlight.',
  'Wild Honey, Sweet Hay, Crisp Apple',
  'Caffeine-Free',
  '4–5 mins',
  '95°C',
  JSON.stringify({
    calories: '0',
    caffeine: '0mg',
    flavonoids: 'Rich in apigenin',
    origin: 'Gilgit-Baltistan',
  }),
  'Whole Flower Chamomile Tea | Seedly Pakistan',
  'Intact loose whole chamomile blossoms from Gilgit. Calming, fragrant, and 100% caffeine-free.',
  '/images/products/chamomile-tea.svg',
  'BESTSELLER',
  1
);
insertVariant.run('var-cham-50', 'prod-chamomile', 'SED-TEA-CHAM-50', 'Weight', '50g Loose Blossom', 125000, 145000, 50, 35);

// Spearmint Tea
insertProd.run(
  'prod-spearmint',
  'cat-teas',
  'Organic Gilgit Spearmint Leaf Tea',
  'spearmint-tea',
  'SED-TEA-SPEAR',
  'tea',
  'ACTIVE',
  'Mountain-grown cut spearmint leaves from northern valleys. Naturally soothing and refreshing.',
  'Unlike harsh commercial peppermint, northern spearmint is naturally sweet and gentle on the stomach. Harvested by hand, air-dried in alpine shade, and cut into loose leaf pieces.',
  115000,
  130000,
  50,
  '100% Organically Grown Spearmint Leaves (Mentha spicata)',
  'Infuse 1 teaspoon in 250ml of hot water (90°C) for 3 to 4 minutes. Enjoy warm after dinner or poured over ice.',
  'Store sealed in a dry cupboard away from heat and moisture.',
  'Cooling Sweet Mint, Soft Mountain Herb',
  'Caffeine-Free',
  '3–4 mins',
  '90°C',
  JSON.stringify({
    calories: '0',
    caffeine: '0mg',
    origin: 'Hunza & Gilgit Valleys',
  }),
  'Organic Spearmint Leaf Tea | Seedly Pakistan',
  'Mountain spearmint loose leaf tea from Gilgit. Clean cooling taste for daily digestive comfort.',
  '/images/products/spearmint-tea.svg',
  'POPULAR',
  1
);
insertVariant.run('var-spear-50', 'prod-spearmint', 'SED-TEA-SPEAR-50', 'Weight', '50g Loose Leaf', 115000, 130000, 50, 30);

// Green Tea
insertProd.run(
  'prod-green-tea',
  'cat-teas',
  'Highland Whole Leaf Green Tea',
  'green-tea',
  'SED-TEA-GRN',
  'tea',
  'ACTIVE',
  'Spring-harvested whole leaf green tea from Khyber Pakhtunkhwa foothills. Delicate, sweet, and low in caffeine.',
  'Hand-plucked whole leaves from highland slopes. Pan-fired gently to prevent oxidation without creating the bitter astringency common in commercial tea bags. Can be steeped multiple times.',
  135000,
  155000,
  75,
  '100% Highland Green Tea Whole Leaves (Camellia sinensis)',
  'Steep 1 teaspoon in 250ml water cooled to 80°C (let boiled water sit for 2 minutes) for 2 minutes. Re-steep leaves up to 3 times.',
  'Keep sealed in an airtight tin away from spices or strong aromas.',
  'Fresh Meadow Grass, Spring Orchid, Toasted Rice',
  'Low Caffeine (~20mg/cup)',
  '2–3 mins',
  '80°C',
  JSON.stringify({
    calories: '0',
    caffeine: 'Approx 20mg per cup',
    polyphenols: 'High EGCG',
    origin: 'Mansehra Foothills, KP',
  }),
  'Highland Whole Leaf Green Tea | Seedly Pakistan',
  'Single-estate green tea whole leaves from northern foothills. Smooth and never bitter.',
  '/images/products/green-tea.svg',
  null,
  0
);
insertVariant.run('var-grn-75', 'prod-green-tea', 'SED-TEA-GRN-75', 'Weight', '75g Loose Leaf', 135000, 155000, 75, 40);

// 3. Kits
const insertKit = db.prepare(`
  INSERT INTO kits (
    id, name, slug, short_description, description, price_minor, compare_price_minor,
    currency, status, package_size, ingredients, usage_instructions, storage_instructions,
    compliance_status, image_url, badge, is_featured, seo_title, seo_description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertKitItem = db.prepare(`
  INSERT INTO kit_items (id, kit_id, product_id, product_variant_id, quantity, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Kit 1: Follicular Blend (Phase 1)
insertKit.run(
  'kit-follicular',
  'Follicular Phase Seed Kit',
  'follicular-blend',
  'Curated pairing of raw Pumpkin and Golden Flax seeds (250g each) with an engraved wooden measuring scoop.',
  'Formulated to supply essential fatty acids and minerals during the first half of your monthly cycle (Days 1–14). Pumpkin seeds supply elemental zinc, while golden flax seeds provide gentle plant lignans.',
  155000,
  175000,
  'PKR',
  'ACTIVE',
  '2 x 250g Pouches + Wooden Measuring Scoop',
  'Raw Pumpkin Seeds (250g) + Cold-Milled Golden Flax Seeds (250g)',
  'Take 1 tablespoon of pumpkin seeds and 1 tablespoon of ground flax seeds daily during days 1 to 14 of your cycle.',
  'Store tightly closed in a cool, dry pantry. Ground flax can be refrigerated.',
  'APPROVED',
  '/images/products/follicular-kit.svg',
  'POPULAR KIT',
  1,
  'Follicular Phase Seed Kit | Seedly Pakistan',
  'Curated Phase 1 seed kit with raw pumpkin and golden flax seeds plus measuring scoop.'
);
insertKitItem.run('ki-foll-1', 'kit-follicular', 'prod-pumpkin', 'var-pump-250', 1, 1);
insertKitItem.run('ki-foll-2', 'kit-follicular', 'prod-flax', 'var-flax-250', 1, 2);

// Kit 2: Luteal Blend (Phase 2)
insertKit.run(
  'kit-luteal',
  'Luteal Phase Seed Kit',
  'luteal-blend',
  'Synergistic pair of raw Sunflower Kernels and White Sesame seeds (250g each) with an engraved wooden measuring scoop.',
  'Supplies Vitamin E and bioavailable calcium during the second half of your cycle (Days 15–28). Raw sunflower kernels provide natural tocopherols, while white sesame seeds supply plant calcium.',
  145000,
  165000,
  'PKR',
  'ACTIVE',
  '2 x 250g Pouches + Wooden Measuring Scoop',
  'Raw Sunflower Kernels (250g) + Natural White Sesame Seeds (250g)',
  'Take 1 tablespoon of sunflower seeds and 1 tablespoon of sesame seeds daily from day 15 until day 28 of your cycle.',
  'Keep sealed in a cool, dark cupboard away from moisture.',
  'APPROVED',
  '/images/products/luteal-kit.svg',
  'CYCLE SUPPORT',
  1,
  'Luteal Phase Seed Kit | Seedly Pakistan',
  'Sunflower and sesame seed kit for luteal cycle nutrition with measuring scoop.'
);
insertKitItem.run('ki-lut-1', 'kit-luteal', 'prod-sunflower', 'var-sun-250', 1, 1);
insertKitItem.run('ki-lut-2', 'kit-luteal', 'prod-sesame', 'var-ses-250', 1, 2);

// Kit 3: Complete Cycle Kit
insertKit.run(
  'kit-complete',
  'Complete 28-Day Seed Cycling Ritual Kit',
  'complete-cycle-kit',
  'The complete 4-seed ritual box: Pumpkin, Flax, Sunflower, and Sesame seeds (250g each) with measuring scoop and calendar guide.',
  'A complete monthly routine in one boxed set. Includes 250g pouches of all four seeds, an engraved wooden measuring scoop, and a printed cycle calendar guide.',
  285000,
  340000,
  'PKR',
  'ACTIVE',
  '4 x 250g Pouches + Wooden Scoop + Cycle Calendar',
  'Raw Pumpkin (250g), Golden Flax (250g), Sunflower Kernels (250g), White Sesame (250g)',
  'Days 1–14: 1 tbsp Pumpkin + 1 tbsp Flax daily. Days 15–28: 1 tbsp Sunflower + 1 tbsp Sesame daily.',
  'Keep pouches sealed in a cool pantry or refrigerator.',
  'APPROVED',
  '/images/products/complete-kit.svg',
  'BEST VALUE',
  1,
  'Complete 28-Day Seed Cycling Kit | Seedly Pakistan',
  'Full month seed cycling routine with 4 heirloom seeds, measuring scoop, and tracking guide.'
);
insertKitItem.run('ki-comp-1', 'kit-complete', 'prod-pumpkin', 'var-pump-250', 1, 1);
insertKitItem.run('ki-comp-2', 'kit-complete', 'prod-flax', 'var-flax-250', 1, 2);
insertKitItem.run('ki-comp-3', 'kit-complete', 'prod-sunflower', 'var-sun-250', 1, 3);
insertKitItem.run('ki-comp-4', 'kit-complete', 'prod-sesame', 'var-ses-250', 1, 4);

// 4. Genuine Customer Reviews
const insertRev = db.prepare(`
  INSERT INTO reviews (id, product_id, product_name, customer_name, rating, title, body, status, verified_purchase)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertRev.run(
  'rev-1',
  'prod-pumpkin',
  'Raw Heirloom Pumpkin Seeds',
  'Ayesha K. (Lahore)',
  5,
  'Fresh and clean',
  'Arrived properly sealed in a kraft pouch. The seeds are vibrant green, crisp, and completely unsalted. A daily staple in our house now.',
  'APPROVED',
  1
);

insertRev.run(
  'rev-2',
  'prod-chamomile',
  'Pure Whole Flower Chamomile Tea',
  'Dr. Bilal S. (Islamabad)',
  5,
  'Real whole blossoms',
  'Opening the jar was wonderful—actual intact chamomile blossoms with a clear honey aroma. No dust or paper bags.',
  'APPROVED',
  1
);

insertRev.run(
  'rev-3',
  'kit-complete',
  'Complete 28-Day Seed Cycling Ritual Kit',
  'Zainab M. (Karachi)',
  5,
  'Clear and practical',
  'Having all four seeds portioned with the wooden scoop made it easy to stick to the routine. Arrived in Clifton in 2 days.',
  'APPROVED',
  1
);

insertRev.run(
  'rev-4',
  'prod-spearmint',
  'Organic Gilgit Spearmint Leaf Tea',
  'Mariam T. (Rawalpindi)',
  5,
  'Gentle and soothing',
  'Gentle mountain spearmint without the harsh bitterness of commercial tea bags. Very pleasant after meals.',
  'APPROVED',
  1
);

console.log('Database successfully reseeded with authentic packaging & catalog!');
