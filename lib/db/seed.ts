import { getDatabase } from './index';

export function runSeed() {
  const db = getDatabase();

  // 1. Seed Categories, Products, Variants, Kits if products table is empty
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (!prodCount || prodCount.count === 0) {
    seedCatalog(db);
  }

  // 2. Seed Reviews if empty
  const revCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number };
  if (!revCount || revCount.count === 0) {
    seedReviews(db);
  }

  // 3. Seed Site Settings if empty
  const setCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (!setCount || setCount.count === 0) {
    seedSettings(db);
  }

  // 4. Seed Admin Users if empty
  const admCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (!admCount || admCount.count === 0) {
    seedAdminUsers(db);
  }
}

function seedCatalog(db: any) {
  // Categories
  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, type, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCat.run('cat-seeds', 'Individual Seeds', 'seeds', 'seed', 'Pure, single-origin heirloom seeds packed with vitality and healthy fats.', 1);
  insertCat.run('cat-kits', 'Curated Kits', 'kits', 'kit', 'Nutritionally aligned blends formulated for daily harmony and cycle nourishment.', 2);
  insertCat.run('cat-teas', 'Herbal Teas', 'teas', 'tea', 'Mountain-harvested whole flower and botanical infusions from northern valleys.', 3);

  // Products
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

  // Product 1: Pumpkin Seeds
  insertProd.run(
    'prod-pumpkin',
    'cat-seeds',
    'Raw Heirloom Pumpkin Seeds',
    'pumpkin-seeds',
    'SED-PUMP-RAW',
    'seed',
    'ACTIVE',
    'Nutrient-dense raw green pepitas, rich in zinc, magnesium, and natural tryptophan for restful vitality.',
    'Our raw Heirloom Pumpkin Seeds are carefully shelled and sun-dried to preserve their delicate enzymes and nutritional potency. Naturally dense in magnesium, elemental zinc, and plant-based protein, they make a grounding daily addition to smoothie bowls, salads, sourdough toasts, or straight by the spoonful.',
    95000,
    110000,
    250,
    '100% Raw Unsalted Pumpkin Seed Kernels (Cucurbita pepo)',
    'Enjoy 1 to 2 tablespoons daily. Great blended into morning smoothies, sprinkled on grain bowls, or lightly toasted on a cast iron pan.',
    'Store in a cool, dry pantry away from direct sunlight. Once opened, seal tightly or refrigerate for maximum freshness.',
    null,
    null,
    null,
    null,
    JSON.stringify({ calories: '160 kcal / 28g', protein: '9g', healthy_fats: '13g', magnesium: '40% DV', zinc: '20% DV' }),
    'Raw Heirloom Pumpkin Seeds | Seedly Pakistan',
    'Buy pure raw heirloom pumpkin seeds in Pakistan. High in zinc, magnesium, and natural energy.',
    'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&q=80&w=800',
    'BESTSELLER',
    1
  );
  insertVariant.run('var-pump-100', 'prod-pumpkin', 'SED-PUMP-100', 'Pack Size', '100g', 45000, null, 100, 40);
  insertVariant.run('var-pump-250', 'prod-pumpkin', 'SED-PUMP-250', 'Pack Size', '250g', 95000, 110000, 250, 65);
  insertVariant.run('var-pump-500', 'prod-pumpkin', 'SED-PUMP-500', 'Pack Size', '500g', 175000, 195000, 500, 30);

  // Product 2: Flax Seeds
  insertProd.run(
    'prod-flax',
    'cat-seeds',
    'Cold-Milled Golden Flax Seeds',
    'flax-seeds',
    'SED-FLAX-GLD',
    'seed',
    'ACTIVE',
    'Triple-cleaned golden flax seeds loaded with dietary lignans and plant-based Omega-3 alpha-linolenic acid.',
    'Sourced from smallholder organic farms, our golden flax seeds are prized for their mild, nutty flavor and soluble fiber matrix. They are exceptional for supporting gut regularity, cellular membrane health, and gentle estrogen clearance during the first half of the menstrual cycle.',
    68000,
    80000,
    250,
    '100% Pure Organic Golden Flax Seeds (Linum usitatissimum)',
    'Consume 1 tablespoon ground daily. Best freshly ground in a coffee or spice grinder, then stirred into yogurt, oatmeal, or baking.',
    'Store in an airtight container in a dark, cool spot. Ground flax should ideally be kept refrigerated.',
    null,
    null,
    null,
    null,
    JSON.stringify({ calories: '150 kcal / 28g', protein: '5g', omega3: '6,400mg ALA', fiber: '8g', healthy_fats: '12g' }),
    'Golden Flax Seeds | High Omega-3 | Seedly Pakistan',
    'Shop premium organic golden flax seeds in Pakistan. Pure, pesticide-free, and rich in natural fiber.',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    'POPULAR',
    1
  );
  insertVariant.run('var-flax-100', 'prod-flax', 'SED-FLAX-100', 'Pack Size', '100g', 32000, null, 100, 30);
  insertVariant.run('var-flax-250', 'prod-flax', 'SED-FLAX-250', 'Pack Size', '250g', 68000, 80000, 250, 40);
  insertVariant.run('var-flax-500', 'prod-flax', 'SED-FLAX-500', 'Pack Size', '500g', 125000, 140000, 500, 25);

  // Product 3: Sunflower Seeds
  insertProd.run(
    'prod-sunflower',
    'cat-seeds',
    'Organic Raw Sunflower Kernels',
    'sunflower-seeds',
    'SED-SUN-RAW',
    'seed',
    'ACTIVE',
    'Delicate nutty raw sunflower seeds packed with natural Vitamin E, selenium, and essential minerals.',
    'Plump, buttery, and untreated with heat or preservatives, our raw sunflower kernels deliver concentrated antioxidant protection. Naturally abundant in d-alpha-tocopherol (natural Vitamin E) and selenium, they protect against oxidative stress and nurture skin radiance.',
    72000,
    85000,
    250,
    '100% Raw Shelled Sunflower Seeds (Helianthus annuus)',
    'Eat 1 to 2 tablespoons daily raw or lightly dry-roasted. Toss over salads, blend into seed butter, or add to homemade granola.',
    'Keep in a sealed jar in a cool, shaded environment away from moisture.',
    null,
    null,
    null,
    null,
    JSON.stringify({ calories: '165 kcal / 28g', protein: '6g', healthy_fats: '14g', vitaminE: '66% DV', selenium: '34% DV' }),
    'Raw Sunflower Seed Kernels | Seedly Pakistan',
    'Buy clean raw sunflower seed kernels in Pakistan. Nutrient-rich for skin glow and natural vitality.',
    'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800',
    null,
    0
  );
  insertVariant.run('var-sun-100', 'prod-sunflower', 'SED-SUN-100', 'Pack Size', '100g', 35000, null, 100, 35);
  insertVariant.run('var-sun-250', 'prod-sunflower', 'SED-SUN-250', 'Pack Size', '250g', 72000, 85000, 250, 55);
  insertVariant.run('var-sun-500', 'prod-sunflower', 'SED-SUN-500', 'Pack Size', '500g', 135000, 155000, 500, 20);

  // Product 4: Sesame Seeds
  insertProd.run(
    'prod-sesame',
    'cat-seeds',
    'Premium Natural White Sesame Seeds',
    'sesame-seeds',
    'SED-SES-WHT',
    'seed',
    'ACTIVE',
    'Sun-dried natural unhulled sesame seeds, high in bioavailable plant calcium, copper, and sesamin.',
    'Our natural sesame seeds retain their nutrient-dense outer bran layer, making them one of the richest botanical sources of calcium on Earth. Revered in traditional holistic health for bone strength, joint lubrication, and calming nervous energy.',
    62000,
    75000,
    250,
    '100% Pure Natural Sesame Seeds (Sesamum indicum)',
    '1 tablespoon daily. Lightly dry-roast in a skillet for 2 minutes to unlock rich aromatics, or grind into homemade tahini.',
    'Store in an airtight container at room temperature away from moisture.',
    null,
    null,
    null,
    null,
    JSON.stringify({ calories: '160 kcal / 28g', protein: '5g', healthy_fats: '14g', calcium: '28% DV', iron: '23% DV' }),
    'Natural White Sesame Seeds | Seedly Pakistan',
    'High-calcium natural sesame seeds in Pakistan. Raw, cleaned, and ethically sourced.',
    'https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&q=80&w=800',
    null,
    0
  );
  insertVariant.run('var-ses-100', 'prod-sesame', 'SED-SES-100', 'Pack Size', '100g', 30000, null, 100, 30);
  insertVariant.run('var-ses-250', 'prod-sesame', 'SED-SES-250', 'Pack Size', '250g', 62000, 75000, 250, 35);

  // Product 5: Pure Chamomile Tea
  insertProd.run(
    'prod-chamomile',
    'cat-teas',
    'Pure Whole Flower Chamomile Tea',
    'chamomile-tea',
    'SED-TEA-CHAM',
    'tea',
    'ACTIVE',
    'Hand-harvested whole chamomile blossoms from Gilgit valleys. Naturally caffeine-free with honey-apple notes.',
    'Composed entirely of golden, aromatic whole flower heads—never dusty fannings or tea bags. Grown in high elevation mountain soil and dried gently in alpine shade, this soothing infusion blossoms into a fragrant, golden nectar with calming nuances of wild honey and crisp green apple.',
    125000,
    145000,
    50,
    '100% Whole Dried German Chamomile Flowers (Matricaria chamomilla)',
    'Steep 1 heaping tablespoon of whole flower heads in 250ml of freshly boiled water (95°C) for 5 minutes. Strain and enjoy warm with a drizzle of raw honey if desired.',
    'Keep in a sealed, dark container to protect the fragile aromatic oils from humidity and light.',
    'Floral Honey, Sweet Hay, Crisp Apple',
    'Caffeine-Free',
    '4–5 mins',
    '95°C',
    JSON.stringify({ calories: '0', antioxidants: 'High apigenin flavonoids', caffeine: '0mg' }),
    'Whole Flower Chamomile Tea | Seedly Pakistan',
    'Buy authentic loose whole flower chamomile tea in Pakistan. Pure calming herbal relaxation.',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    'BESTSELLER',
    1
  );
  insertVariant.run('var-cham-50', 'prod-chamomile', 'SED-TEA-CHAM-50', 'Weight', '50g Loose Blossom', 125000, 145000, 50, 48);

  // Product 6: Spearmint Tea
  insertProd.run(
    'prod-spearmint',
    'cat-teas',
    'Organic Gilgit Spearmint Leaf Tea',
    'spearmint-tea',
    'SED-TEA-SPEAR',
    'tea',
    'ACTIVE',
    'Aromatic mountain-grown cut spearmint leaves. Naturally soothing, crisp, and renowned for digestive ease.',
    'Distinct from peppermint, spearmint contains natural carvone compounds that grant it a gentler, naturally sweet, and non-overpowering cooling flavor. Widely enjoyed for post-meal digestive lightness and daily hormonal harmony.',
    115000,
    130000,
    50,
    '100% Organically Grown Spearmint Leaves (Mentha spicata)',
    'Infuse 1 teaspoon in 250ml of hot water (90°C) for 3 to 4 minutes. Enjoy warm after meals, or chill over ice with a slice of fresh cucumber.',
    'Store sealed in a dry, cool cabinet away from heat.',
    'Cooling Sweet Mint, Soft Alpine Herb',
    'Caffeine-Free',
    '3–4 mins',
    '90°C',
    JSON.stringify({ calories: '0', caffeine: '0mg', benefits: 'Digestive comfort & gentle botanical balance' }),
    'Organic Spearmint Leaf Tea | Seedly Pakistan',
    'Shop mountain-grown organic spearmint tea in Pakistan. Refreshing, digestive support, and pure taste.',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
    'POPULAR',
    1
  );
  insertVariant.run('var-spear-50', 'prod-spearmint', 'SED-TEA-SPEAR-50', 'Weight', '50g Loose Leaf', 115000, 130000, 50, 42);

  // Product 7: Green Tea
  insertProd.run(
    'prod-green-tea',
    'cat-teas',
    'Highland Whole Leaf Green Tea',
    'green-tea',
    'SED-TEA-GRN',
    'tea',
    'ACTIVE',
    'Spring-harvested Pakistani mountain green tea. Light, delicate vegetal sweetness packed with EGCG catechins.',
    'Single-estate whole leaf green tea picked during the fresh spring flush in northern valleys. Gently pan-fired to lock in natural antioxidants without the bitterness common in commercial tea dust. Delivers sustained calm focus with no caffeine crash.',
    135000,
    155000,
    75,
    '100% High-Elevation Green Tea Whole Leaves (Camellia sinensis)',
    'Steep 1 teaspoon in 250ml water cooled to 80°C (let boiling water sit for 2 minutes first) for 2 to 3 minutes. Re-steep the same leaves up to 3 times.',
    'Keep in an airtight tin away from kitchen spices or aromas.',
    'Fresh Meadow Grass, Spring Orchid, Toasted Rice',
    'Low Caffeine',
    '2–3 mins',
    '80°C',
    JSON.stringify({ calories: '0', polyphenols: 'High EGCG', caffeine: 'Approx 20mg per cup' }),
    'Highland Whole Leaf Green Tea | Seedly Pakistan',
    'Pure hand-picked whole leaf green tea in Pakistan. Gentle antioxidant uplift with zero bitterness.',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800',
    null,
    0
  );
  insertVariant.run('var-grn-75', 'prod-green-tea', 'SED-TEA-GRN-75', 'Weight', '75g Loose Leaf', 135000, 155000, 75, 50);

  // Kits
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
    'Specially formulated pairing of raw Pumpkin and Golden Flax seeds to support Phase 1 of natural cycle nutrition (Days 1–14).',
    'The Follicular Phase Kit provides your body with optimal fatty acid ratios and zinc during the first two weeks of your cycle (from the first day of menstruation until ovulation). Pumpkin seeds supply elemental zinc for healthy follicular maturation, while golden flax seeds supply gentle lignans to help your body naturally metabolize estrogen.',
    155000,
    175000,
    'PKR',
    'ACTIVE',
    '2 x 250g Glass Amber Jars + Measuring Scoop',
    'Raw Pumpkin Seeds (250g) + Cold-Milled Golden Flax Seeds (250g)',
    'Take 1 tablespoon of raw pumpkin seeds and 1 tablespoon of ground flax seeds daily during days 1 to 14 of your cycle. Blend into smoothies, oatmeal, or grain bowls.',
    'Store sealed in a dry pantry away from direct heat. Ground flax can be kept refrigerated.',
    'APPROVED',
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=800',
    'POPULAR KIT',
    1,
    'Follicular Phase Seed Kit | Cycle Harmony | Seedly',
    'Natural Phase 1 seed kit featuring raw pumpkin seeds and golden flax seeds. Formulated for women in Pakistan.'
  );
  insertKitItem.run('ki-foll-1', 'kit-follicular', 'prod-pumpkin', 'var-pump-250', 1, 1);
  insertKitItem.run('ki-foll-2', 'kit-follicular', 'prod-flax', 'var-flax-250', 1, 2);

  // Kit 2: Luteal Blend (Phase 2)
  insertKit.run(
    'kit-luteal',
    'Luteal Phase Seed Kit',
    'luteal-blend',
    'Synergistic pair of raw Sunflower and Sesame seeds to nourish Phase 2 progesterone balance (Days 15–28).',
    'During the second half of the cycle (from ovulation until menstruation), your body requires increased Vitamin E and selenium to support corpus luteum function and healthy progesterone production. Our Luteal Blend combines raw sunflower kernels with calcium-rich sesame seeds to gently calm premenstrual fluctuations and sustain daily energy.',
    145000,
    165000,
    'PKR',
    'ACTIVE',
    '2 x 250g Glass Amber Jars + Measuring Scoop',
    'Raw Sunflower Seed Kernels (250g) + Natural White Sesame Seeds (250g)',
    'Take 1 tablespoon of sunflower seeds and 1 tablespoon of sesame seeds daily from day 15 until day 28 (or until your next cycle begins). Enjoy raw or lightly dry-toasted.',
    'Keep in an airtight container at room temperature away from direct sunlight.',
    'APPROVED',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
    'CYCLE SUPPORT',
    1,
    'Luteal Phase Seed Kit | Seedly Pakistan',
    'Synergistic sunflower and sesame seed kit for luteal cycle wellness and soothing natural balance.'
  );
  insertKitItem.run('ki-lut-1', 'kit-luteal', 'prod-sunflower', 'var-sun-250', 1, 1);
  insertKitItem.run('ki-lut-2', 'kit-luteal', 'prod-sesame', 'var-ses-250', 1, 2);

  // Kit 3: Complete Cycle Kit
  insertKit.run(
    'kit-complete',
    'Complete 28-Day Seed Cycling Ritual Kit',
    'complete-cycle-kit',
    'The complete 4-seed ritual box: Pumpkin, Flax, Sunflower, and Sesame seeds with brass measuring scoop and cycle guide.',
    'Everything you need for a full monthly seed-cycling journey in one beautifully boxed presentation. Features our four signature nutrient-dense seed varieties (250g each), an engraved natural wooden measuring scoop, and a printed lunar cycle guide with simple daily recipes. An inspiring gift to yourself or someone you care about.',
    285000,
    340000,
    'PKR',
    'ACTIVE',
    '4 x 250g Amber Jars + Custom Scoop + Calendar',
    'Raw Pumpkin (250g), Golden Flax (250g), Sunflower Kernels (250g), Natural Sesame (250g)',
    'Days 1–14: 1 tbsp Pumpkin + 1 tbsp Flax daily. Days 15–28: 1 tbsp Sunflower + 1 tbsp Sesame daily.',
    'Keep jars tightly capped in a cool pantry or refrigerator.',
    'APPROVED',
    'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?auto=format&fit=crop&q=80&w=800',
    'BEST VALUE',
    1,
    'Complete 28-Day Seed Cycling Kit | Seedly Pakistan',
    'Full month natural seed cycling routine with 4 heirloom seeds, measuring scoop, and tracking calendar.'
  );
  insertKitItem.run('ki-comp-1', 'kit-complete', 'prod-pumpkin', 'var-pump-250', 1, 1);
  insertKitItem.run('ki-comp-2', 'kit-complete', 'prod-flax', 'var-flax-250', 1, 2);
  insertKitItem.run('ki-comp-3', 'kit-complete', 'prod-sunflower', 'var-sun-250', 1, 3);
  insertKitItem.run('ki-comp-4', 'kit-complete', 'prod-sesame', 'var-ses-250', 1, 4);
}

function seedReviews(db: any) {
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
    'Remarkably fresh and crunchy',
    'Unlike standard grocery store seeds that often taste stale or oily, these arrived wonderfully clean, vibrant green, and fragrant. I add them to my yogurt bowl every morning.',
    'APPROVED',
    1
  );

  insertRev.run(
    'rev-2',
    'prod-chamomile',
    'Pure Whole Flower Chamomile Tea',
    'Dr. Bilal S. (Islamabad)',
    5,
    'Real whole flowers make all the difference',
    'Opening the jar was an absolute delight—actual intact chamomile blossoms with a sweet honey scent. No dust or paper bags. My sleep quality has noticeably improved.',
    'APPROVED',
    1
  );

  insertRev.run(
    'rev-3',
    'kit-complete',
    'Complete 28-Day Seed Cycling Ritual Kit',
    'Zainab M. (Karachi)',
    5,
    'A beautifully curated wellness ritual',
    'The packaging is breathtaking and thoughtful. Having all 4 seeds portioned with the wooden scoop made it effortless to stick to my daily routine. Delivery in Clifton took just 2 days.',
    'APPROVED',
    1
  );

  insertRev.run(
    'rev-4',
    'prod-spearmint',
    'Organic Gilgit Spearmint Leaf Tea',
    'Mariam T. (Rawalpindi)',
    5,
    'So soothing for bloating and digestion',
    'The taste is pure mountain herbs with no bitterness. I drink a cup after dinner and feel so light and calm. Highly recommended!',
    'APPROVED',
    1
  );
}

function seedSettings(db: any) {
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)
  `);

  insertSetting.run('store_name', 'Seedly');
  insertSetting.run('tagline', 'Grow something good.');
  insertSetting.run('currency', 'PKR');
  insertSetting.run('delivery_fee_minor', '20000'); // Rs. 200 standard delivery
  insertSetting.run('free_delivery_threshold_minor', '250000'); // Free delivery on orders over Rs. 2,500
  insertSetting.run('bank_name', 'Meezan Bank Limited');
  insertSetting.run('bank_account_title', 'Seedly Naturals Pakistan');
  insertSetting.run('bank_account_number', '0102-0104882910');
  insertSetting.run('bank_iban', 'PK36MEZN0001020104882910');
  insertSetting.run('whatsapp_number', '+92 300 1234567');
  insertSetting.run('support_email', 'care@seedly.pk');
}

function seedAdminUsers(db: any) {
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, email, name, role)
    VALUES (?, ?, ?, ?)
  `);
  insertAdmin.run('adm-owner', 'owner@seedly.pk', 'Seedly Founder', 'Owner');
  insertAdmin.run('adm-staff', 'staff@seedly.pk', 'Store Operations', 'Staff');
}
