// Migration inputs only. Never use these as a runtime content fallback.
export const CMS_INITIAL_DOCUMENTS: Array<{slug:string;kind:'page'|'global'|'config';title:string;description:string;content:Record<string,unknown>;publish?:boolean}> = [
  {
    "slug": "home",
    "kind": "page",
    "title": "Home",
    "description": "Website content and search information for Home.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Home",
        "description": "Home at Seedly."
      },
      "copy": {
        "text_the_seedly_pantry": "The Seedly pantry",
        "text_good_ingredients": "Good ingredients.",
        "text_everyday_rituals": "Everyday rituals.",
        "text_whole_seeds_thoughtful_seed_kits_and_loose_teas_find_th": "Whole seeds, thoughtful seed kits and loose teas. Find the simple things you’ll reach for every day.",
        "text_explore_the_pantry": "Explore the pantry",
        "text_find_your_routine": "Find your routine",
        "text_a_little_care_for_your": "A little care for your",
        "text_everyday_pantry": "everyday pantry.",
        "alt_seeds_and_a_cup_of_tea_on_a_kitchen_table": "Seeds and a cup of tea on a kitchen table",
        "text_find_your_everyday_favourites": "Find your everyday favourites",
        "text_shop_all_products": "Shop all products",
        "text_pantry_essentials": "Pantry essentials",
        "text_browse_the_collection": "Browse the collection",
        "text_a_routine_made_simple": "A routine made simple",
        "text_see_what_s_inside": "See what’s inside",
        "text_food_for_your_routine_no_medical_promises": "Food for your routine. No medical promises.",
        "text_our_story": "Our story",
        "text_a_pantry_you_can_get_to_know": "A pantry you can get to know.",
        "text_we_re_a_pantry_shop_based_in_lahore_bringing_seeds_and": "We’re a pantry shop based in Lahore, bringing seeds and teas to kitchens across Pakistan. Explore the ingredients, learn how to use them, and ask us when you need a hand.",
        "text_meet_seedly": "Meet Seedly"
      },
      "links": {
        "href_shop": "/shop",
        "href_find_your_seed": "/find-your-seed",
        "href_about": "/about"
      },
      "images": {
        "src_images_hero_seedly_hero_jpg": "/images/hero/seedly-hero.jpg"
      },
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        },
        {
          "id": "page_section_04",
          "enabled": true
        },
        {
          "id": "testimonials",
          "enabled": true
        },
        {
          "id": "page_section_05",
          "enabled": true
        }
      ],
      "collections": [
        {
          "title": "Raw seeds",
          "text": "A spoonful for breakfast, baking and everything between.",
          "href": "/seeds",
          "image": "/images/products/pumpkin-seeds.jpg"
        },
        {
          "title": "Seed kits",
          "text": "Thoughtful pairings. A simpler daily routine.",
          "href": "/kits",
          "image": "/images/products/complete-kit.jpg"
        },
        {
          "title": "Loose teas",
          "text": "Make a little room for a slower cup.",
          "href": "/teas",
          "image": "/images/products/chamomile-tea.jpg"
        }
      ],
      "featuredKitSlug": "complete-cycle-kit"
    }
  },
  {
    "slug": "about",
    "kind": "page",
    "title": "Our story",
    "description": "Website content and search information for Our story.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Our story | Seedly",
        "description": "Get to know the Seedly collection: pantry seeds, loose-leaf teas and seed cycling kits, with ingredients, pack sizes and preparation details on every product page."
      },
      "copy": {
        "alt_seedly_pumpkin_seeds_sesame_and_chamomile_on_a_kitchen": "Seedly pumpkin seeds, sesame and chamomile on a kitchen table",
        "alt_founder": "Founder"
      },
      "links": {
        "href_shop": "/shop",
        "href_find_your_seed": "/find-your-seed",
        "href_seeds": "/seeds"
      },
      "images": {
        "src_images_hero_seedly_hero_lifestyle_jpg": "/images/hero/seedly-hero-lifestyle.jpg",
        "hero": "/images/hero/seedly-hero-lifestyle.jpg"
      },
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        },
        {
          "id": "page_section_04",
          "enabled": true
        },
        {
          "id": "page_section_05",
          "enabled": true
        }
      ],
      "story": {
        "hero": {
          "eyebrow": "Our story",
          "h1": "Everyday ingredients. A place in your kitchen.",
          "lead": "A spoonful of seeds over breakfast. A pot of tea in the afternoon. Seedly is built around ingredients that fit into the way you already eat and drink.",
          "primaryCta": "Browse the collection",
          "secondaryCta": "Routine finder"
        },
        "whySeedly": {
          "eyebrow": "Why Seedly",
          "h2": "Honest ingredients, packed fresh.",
          "paragraph1": "Seedly is a pantry shop based in Lahore. Explore seeds, seed kits and teas with ingredients, pack sizes and preparation details on each product page.",
          "paragraph2": "Choose the ingredients that fit your everyday meals and ask our customer care team when you need help.",
          "signature": ""
        },
        "sourceToPouch": {
          "h2": "From source to your kitchen.",
          "steps": [
            {
              "step": "01",
              "title": "Explore the ingredients",
              "text": "Check the product page for ingredients and preparation details."
            },
            {
              "step": "02",
              "title": "Choose your pack",
              "text": "Compare the available pack sizes and current prices before ordering."
            },
            {
              "step": "03",
              "title": "Keep it fresh",
              "text": "Follow the storage instructions provided for each product."
            },
            {
              "step": "04",
              "title": "Follow your delivery",
              "text": "Courier details appear on your order page once your parcel has been dispatched."
            }
          ]
        },
        "collection": {
          "h2": "A small, useful collection.",
          "shopAll": "Shop all",
          "cards": [
            {
              "id": "seeds",
              "title": "Pantry seeds",
              "description": "Pumpkin, flax, sunflower and sesame. Add them to breakfast, use them in baking or finish a salad with a spoonful.",
              "count": "",
              "linkText": "Shop seeds",
              "href": "/seeds"
            },
            {
              "id": "teas",
              "title": "Loose-leaf teas",
              "description": "Chamomile flowers, spearmint and green tea. Choose a familiar flavour or find something different for your next cup.",
              "count": "",
              "linkText": "Shop teas",
              "href": "/teas"
            },
            {
              "id": "kits",
              "title": "Seed kits",
              "description": "Our seeds, paired together in one box. Compare the two-seed and four-seed options to find the contents you need.",
              "count": "",
              "linkText": "Compare kits",
              "href": "/kits"
            }
          ]
        },
        "closingCta": {
          "h2": "Start with one ingredient.",
          "sub": "Not sure where to begin? Try the routine finder, or ask us on WhatsApp.",
          "primaryCta": "Shop seeds",
          "secondaryCta": "Routine finder",
          "whatsappCta": "Ask on WhatsApp"
        }
      }
    }
  },
  {
    "slug": "faq",
    "kind": "page",
    "title": "Frequently asked questions",
    "description": "Website content and search information for Frequently asked questions.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Frequently Asked Questions | Seedly Pakistan",
        "description": "Answers about raw seeds, mountain teas, seed cycling routines, nationwide delivery across Pakistan, and our 7-day quality guarantee."
      },
      "copy": {
        "text_answers_guidance": "Answers & Guidance",
        "text_frequently_asked_questions": "Frequently Asked Questions",
        "text_clear_facts_on_our_smallholder_sourcing_cold_milling_st": "Clear facts on our smallholder sourcing, cold-milling standards, brewing parameters, and nationwide courier delivery.",
        "text_still_have_a_question": "Still have a question?",
        "text_our_lahore_pantry_team_is_available_monday_to_saturday": "Our Lahore pantry team is available Monday to Saturday (9am–7pm PKT) to guide you on seed routines, batch origin, or courier tracking.",
        "text_whatsapp": "WhatsApp (",
        "text_contact_care_team": "Contact & Care Team"
      },
      "links": {
        "href_contact": "/contact"
      },
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        }
      ],
      "items": [
        {
          "category": "Seed Routines & Usage",
          "question": "What is seed cycling and how does it work?",
          "answer": "Seed cycling is a traditional whole-food dietary habit where you rotate four nutrient-dense pantry seeds between the two phases of your monthly cycle. During Phase 1 (Days 1–14, Follicular), raw pumpkin seeds and cold-milled golden flax provide dietary magnesium, zinc, and plant-based ALA omega-3 fatty acids. During Phase 2 (Days 15–28, Luteal), raw sunflower kernels and unhulled sesame seeds supply natural Vitamin E, selenium, and essential minerals. While popular as a gentle dietary habit, research is early and limited. Individuals with PCOS, thyroid conditions, or who are pregnant or nursing should speak with their physician."
        },
        {
          "category": "Seed Routines & Usage",
          "question": "Do I need to grind Seedly Golden Flax Seeds at home?",
          "answer": "No grinding required! Whole flax seeds have a tough outer cellulose husk that passes through the digestive tract unabsorbed unless milled. To save you time and maximize nutrient absorption, Seedly Golden Flax is already freshly cold-milled into a coarse meal in small batches right here in Lahore. It arrives ready to spoon straight into yogurt bowls, warm oatmeal, or morning smoothies."
        },
        {
          "category": "Seed Routines & Usage",
          "question": "How long does a 250g pouch or Complete Kit last?",
          "answer": "Based on the standard daily serving of 1 level tablespoon (approx. 8–10g), a single 250g pouch provides roughly 25–30 daily servings. Our Complete Cycle Kit contains four separate 250g pouches (1kg total) plus a wooden measured scoop and cycle calendar, providing approximately 50–60 daily servings—enough for two complete 28-day cycles."
        },
        {
          "category": "Mountain Teas & Brewing",
          "question": "Why does Seedly use loose whole chamomile flowers instead of teabags?",
          "answer": "Commercial teabags frequently contain finely pulverized \"tea dust\" (fannings) that leach bitter tannins, and many bags contain microplastics or bleached paper fibers. Our whole chamomile flowers are intact blossoms harvested by smallholder growers in high mountain valleys of Gilgit-Baltistan, delivering a clean, sweet honey-apple infusion without microplastics or artificial additives."
        },
        {
          "category": "Mountain Teas & Brewing",
          "question": "What are the recommended water temperatures and steeping times?",
          "answer": "For Pure Chamomile Flowers: 1 rounded teaspoon (approx. 2.5g) in 200–250ml freshly boiled water (95–100°C), steeping 5–7 minutes for a soothing evening cup (yields approx. 20 cups per 50g pack). For Highland Spearmint Leaf: 1 teaspoon (approx. 2g) in 90–95°C water, steeping 4–5 minutes. For Highland Green Tea: 1 teaspoon in cooler water (approx. 80°C) for 2–3 minutes to avoid bitter astringency."
        },
        {
          "category": "Mountain Teas & Brewing",
          "question": "Are your herbal teas caffeine-free?",
          "answer": "Both our Pure Mountain Chamomile Flowers and Highland Spearmint Leaf teas are 100% naturally caffeine-free herbal tisanes that can be enjoyed any time of day or night. Highland Green Tea contains a gentle amount of natural caffeine (approx. 20–25mg per cup)."
        },
        {
          "category": "Storage & Freshness",
          "question": "What is the shelf life and how should seeds be stored?",
          "answer": "Whole raw seeds (pumpkin, sunflower, unhulled sesame) stay fresh for 12 months when stored in a cool, dry, dark pantry in their airtight barrier pouches. Because cold-milled flax meal contains fragile polyunsaturated omega-3 fatty acids, it has a 9-month sealed shelf life. Once opened, we strongly recommend storing cold-milled flax in the refrigerator and consuming it within 60–90 days for peak freshness."
        },
        {
          "category": "Allergen Advisory",
          "question": "What allergens are handled in your facility?",
          "answer": "All Seedly products are cleaned and packed in a Lahore facility that also handles edible seeds (sesame, sunflower, pumpkin, flax), mustard, and tree nuts (almonds, walnuts). In addition, individuals with known sensitivities to the Asteraceae / Daisy plant family (e.g. ragweed, chrysanthemums) should exercise caution with chamomile infusions."
        },
        {
          "category": "Shipping & Delivery",
          "question": "How fast is nationwide courier delivery across Pakistan?",
          "answer": "All orders are dispatched daily from our central Lahore hub via TCS and Leopards Courier. Expected transit windows are: Lahore (1–2 business days); rest of Punjab and Islamabad/Rawalpindi (2–3 business days); Sindh (including Karachi), Khyber Pakhtunkhwa, and Balochistan (3–4 business days); Gilgit-Baltistan and Azad Jammu & Kashmir (4–6 business days)."
        },
        {
          "category": "Shipping & Delivery",
          "question": "How does Free Delivery work?",
          "answer": "Current delivery charges and the free-delivery threshold are shown in your basket before checkout. See our shipping page for delivery information."
        },
        {
          "category": "Payments & Verification",
          "question": "What payment methods do you accept?",
          "answer": "We accept Cash on Delivery (COD) across Pakistan, allowing you to pay the courier rider in cash upon parcel arrival. We also accept digital wallet payments via JazzCash and Easypaisa, as well as direct online bank transfer (IBFT). Note that direct digital payments are verified manually by our accounts team against your transaction ID or screenshot prior to dispatch."
        },
        {
          "category": "Quality & Returns",
          "question": "What does your 7-Day Guarantee cover?",
          "answer": "Under our 7-Day Quality & Freshness Guarantee, if any item arrives damaged, crushed, unsealed, incorrect, or with a verified quality or freshness concern (such as unexpected staleness or rancidity), we will dispatch a free replacement immediately at our expense or issue a full refund to your original payment method. Reach out via WhatsApp at 0371 9055758 within 7 days of delivery."
        }
      ]
    }
  },
  {
    "slug": "contact",
    "kind": "page",
    "title": "Contact Seedly",
    "description": "Website content and search information for Contact Seedly.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Contact Seedly | Customer Care & Support",
        "description": "Connect directly with our Lahore care team via WhatsApp, phone, or email for order assistance, product guidance, and delivery support."
      },
      "copy": {
        "text_customer_care": "Customer Care",
        "text_contact_seedly": "Contact Seedly",
        "text_a_question_about_your_order_choosing_seeds_or_brewing_y": "A question about your order, choosing seeds, or brewing your mountain tea? Get in touch with our Lahore team directly.",
        "text_ways_to_get_in_touch": "Ways to get in touch",
        "text_whatsapp": "WhatsApp",
        "text_instant_order_assistance_address_confirmations_and_pers": "Instant order assistance, address confirmations, and personalized product questions.",
        "text_message_on_whatsapp": "Message on WhatsApp",
        "text_phone": "Phone",
        "text_speak_directly_with_our_care_desk_during_customer_servi": "Speak directly with our care desk during customer service hours.",
        "text_email": "Email",
        "text_write_to_us_with_parcel_photographs_feedback_or_wholesa": "Write to us with parcel photographs, feedback, or wholesale inquiries.",
        "text_inquiring_about_an_existing_order": "Inquiring about an existing order?",
        "text_please_include_your_order_number_e_g_sed_xxxxxx_and_you": "Please include your order number (e.g. SED-XXXXXX) and your delivery phone number so we can look up your dispatch status immediately. If reporting damaged goods, please attach photos or an unboxing video.",
        "text_customer_care_hours": "Customer care hours",
        "text_shipping_delivery": "Shipping & delivery",
        "text_delivery_areas_flat_charges_and_estimated_timings": "Delivery areas, flat charges, and estimated timings.",
        "text_returns_replacements": "Returns & replacements",
        "text_7_day_guarantee_details_and_how_to_initiate_a_claim": "7-day guarantee details and how to initiate a claim.",
        "text_frequently_asked_questions": "Frequently asked questions",
        "text_answers_about_cold_milled_seeds_brewing_and_storage": "Answers about cold-milled seeds, brewing, and storage."
      },
      "links": {
        "href_shipping": "/shipping",
        "href_returns": "/returns",
        "href_faq": "/faq"
      },
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "shipping",
    "kind": "page",
    "title": "shipping",
    "description": "Website content and search information for shipping.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Shipping & delivery",
        "description": "Delivery information, current charges and order tracking for Seedly customers in Pakistan."
      },
      "copy": {
        "text_nationwide_logistics": "Nationwide Logistics",
        "text_shipping_delivery_policy": "Shipping & Delivery Policy",
        "text_carefully_packaged_raw_pantry_seeds_and_mountain_teas_d": "Carefully packaged raw pantry seeds and mountain teas dispatched daily from our central Lahore hub across all serviceable areas in Pakistan.",
        "text_delivery_charges": "Delivery Charges",
        "text_daily_dispatch_cutoff": "Daily Dispatch Cutoff",
        "text_our_team_prepares_orders_during_business_days_bank_and": "Our team prepares orders during business days. Bank and wallet transfers require manual payment verification before preparation. Dispatch timing is confirmed on your order page.",
        "text_courier_partners": "Courier Partners",
        "text_we_partner_exclusively_with": "We partner exclusively with ",
        "text_tcs": "TCS",
        "text_and": " and ",
        "text_leopards_courier": "Leopards Courier",
        "text_for_secure_door_to_door_delivery_with_sms_status_notifi": " for secure door-to-door delivery with SMS status notifications and parcel tracking.",
        "text_estimated_delivery_timelines": "Estimated Delivery Timelines",
        "text_destination_region": "Destination Region",
        "text_expected_transit_window": "Expected Transit Window",
        "text_courier_network": "Courier Network",
        "text_tcs_leopards_courier": "TCS / Leopards Courier",
        "text_remote_addresses_or_extreme_seasonal_weather_conditions": "* Remote addresses or extreme seasonal weather conditions may occasionally add 24–48 hours to transit windows.",
        "text_cash_on_delivery_cod_payment_verification": "Cash on Delivery (COD) & Payment Verification",
        "text_cash_on_delivery_is_available_across_all_serviceable_de": "Cash on Delivery is available across all serviceable delivery zones in Pakistan. Please ensure the exact cash amount is ready for the courier rider upon delivery. For first-time customers or high-value orders, our care team may reach out via WhatsApp at ",
        "text_to_confirm_your_delivery_address_prior_to_handing_parce": " to confirm your delivery address prior to handing parcels over to TCS or Leopards.",
        "text_for_online_bank_transfers_ibft_jazzcash_or_easypaisa_ou": "For online bank transfers (IBFT), JazzCash, or Easypaisa, our accounts team manually verifies the transaction ID or payment screenshot before releasing your parcel to dispatch.",
        "text_airtight_packaging_transit_protection": "Airtight Packaging & Transit Protection",
        "text_all_raw_seeds_are_heat_sealed_in_thick_food_grade_moist": "All raw seeds are heat-sealed in thick, food-grade moisture-barrier pouches with tamper-evident tear notches and press-to-close airtight locks. Loose-leaf chamomile flowers and delicate botanicals are protected inside sturdy, bubble-cushioned outer boxes to prevent crushing during transit.",
        "text_order_tracking_delivery_support": "Order Tracking & Delivery Support",
        "text_courier_details_appear_on_your_order_tracking_page_when": "Courier details appear on your order tracking page when your parcel is dispatched. For order status inquiries, reach out directly to our customer care team on WhatsApp at",
        "text_or_email": "or email"
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "returns",
    "kind": "page",
    "title": "returns",
    "description": "Website content and search information for returns.",
    "publish": true,
    "content": {
      "seo": {
        "title": "7-Day Return & Replacement Policy | Seedly Pakistan",
        "description": "Our fresh botanical guarantee. 7-day free replacements for damaged, unsealed, or quality-compromised parcels. Direct refunds via JazzCash, Easypaisa, or Bank Transfer."
      },
      "copy": {
        "text_customer_assurance": "Customer Assurance",
        "text_7_day_quality_replacement_policy": "7-Day Quality & Replacement Policy",
        "text_your_confidence_in_the_freshness_integrity_and_safety_o": "Your confidence in the freshness, integrity, and safety of our seeds and botanical teas is our highest standard.",
        "text_7_day_quality_freshness_guarantee": "7-Day Quality & Freshness Guarantee",
        "text_food_safety_notice_change_of_mind": "Food Safety Notice (Change of Mind):",
        "text_once_an_airtight_barrier_pouch_or_botanical_seal_has_be": " Once an airtight barrier pouch or botanical seal has been broken, we cannot accept returns or restock the product.",
        "text_eligible_claims_for_free_replacement_or_refund": "Eligible Claims for Free Replacement or Refund",
        "text_item_arrived_damaged_crushed_leaking_or_with_a_broken_c": "Item arrived damaged, crushed, leaking, or with a broken courier seal during transit.",
        "text_verified_quality_or_freshness_issue_such_as_unexpected": "Verified quality or freshness issue (such as unexpected staleness, off-odour, or rancidity reported within 7 days of delivery).",
        "text_incorrect_seed_variety_tea_blend_or_routine_kit_receive": "Incorrect seed variety, tea blend, or routine kit received compared to your confirmed invoice.",
        "text_verified_packaging_defect_such_as_pouch_tear_or_comprom": "Verified packaging defect (such as pouch tear or compromised resealable zipper upon unboxing).",
        "text_how_to_initiate_a_claim": "How to Initiate a Claim",
        "text_please_contact_our_customer_care_team_within": "Please contact our customer care team within ",
        "text_7_days_of_delivery": "7 days of delivery",
        "text_with_your_order_number_e_g_sed_xxxxxx_and_1_2_clear_pho": " with your order number (e.g. SED-XXXXXX) and 1–2 clear photographs or an unboxing video showing the affected item:",
        "text_whatsapp_helpline": "WhatsApp Helpline",
        "text_email_support": "Email Support",
        "text_refund_methods_timelines": "Refund Methods & Timelines",
        "text_if_an_immediate_replacement_is_not_preferred_an_approve": "If an immediate replacement is not preferred, an approved refund will be processed back to your chosen payment method within ",
        "text_2_3_business_days": "2–3 business days",
        "text_for_cash_on_delivery_cod_orders_refunds_are_transferred": ". For Cash on Delivery (COD) orders, refunds are transferred directly via ",
        "text_jazzcash": "JazzCash",
        "text_easypaisa": "Easypaisa",
        "text_or": ", or ",
        "text_pakistani_online_bank_transfer_ibft": "Pakistani online bank transfer (IBFT)"
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "privacy",
    "kind": "page",
    "title": "privacy",
    "description": "Website content and search information for privacy.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Privacy Policy | Seedly Pakistan",
        "description": "How Seedly protects and handles your personal information. Safe, transparent customer data practices for nationwide orders in Pakistan."
      },
      "copy": {
        "text_data_protection": "Data Protection",
        "text_privacy_policy": "Privacy Policy",
        "text_how_seedly_respects_handles_and_safeguards_your_custome": "How Seedly respects, handles, and safeguards your customer information across our website and delivery network.",
        "text_1_information_we_collect": "1. Information We Collect",
        "text_we_collect_personal_information_necessary_to_deliver_yo": "We collect personal information necessary to deliver your orders and provide helpful customer care: your name, shipping address, landmark, city, email address, mobile contact number, and payment verification references.",
        "text_2_routine_questionnaire_interactive_tools": "2. Routine Questionnaire & Interactive Tools",
        "text_when_you_use_our_routine_finder_questionnaire_cycle_cal": "When you use our Routine Finder questionnaire, cycle calendar, or brew guides, any responses you provide are processed in-session or on your device solely to suggest relevant whole-food ingredients and guidance. We never sell, rent, or share your routine questionnaire answers with third parties or advertisers.",
        "text_3_email_newsletter_communications": "3. Email Newsletter & Communications",
        "text_if_you_subscribe_to_our_fresh_dispatches_newsletter_we": "If you subscribe to our Fresh Dispatches newsletter, we store your email address solely to send seasonal harvest announcements, pantry recipes, and store updates. You may opt out or unsubscribe at any time via the one-click unsubscribe link at the bottom of every email dispatch.",
        "text_4_payment_processing_verification": "4. Payment Processing & Verification",
        "text_seedly_does_not_collect_process_or_store_credit_debit_c": "Seedly does not collect, process, or store credit/debit card numbers or confidential banking passwords. For Cash on Delivery (COD), payment is made directly to the courier rider upon delivery. For manual transfers via JazzCash, Easypaisa, or direct bank transfer (IBFT), payment transaction IDs and verification screenshots are inspected solely by our internal Lahore accounts team to verify settlement prior to parcel dispatch.",
        "text_5_courier_logistics_partners": "5. Courier Logistics Partners",
        "text_to_fulfill_your_physical_delivery_we_share_your_recipie": "To fulfill your physical delivery, we share your recipient name, destination address, and mobile phone number strictly with our contracted courier logistics partners—",
        "text_tcs": "TCS",
        "text_and": " and ",
        "text_leopards_courier": "Leopards Courier",
        "text_they_use_this_data_solely_to_transport_the_parcel_and_s": ". They use this data solely to transport the parcel and send you SMS tracking and delivery arrival notifications.",
        "text_6_cookies_anonymous_analytics": "6. Cookies & Anonymous Analytics",
        "text_we_use_essential_first_party_cookies_to_remember_your_s": "We use essential first-party cookies to remember your shopping cart items across visits and retain session preferences. We also use privacy-focused, anonymous site telemetry to monitor page loading speed and technical reliability. We do not use third-party behavioral advertising trackers.",
        "text_7_your_data_rights": "7. Your Data Rights",
        "text_you_have_the_right_to_request_access_to_correction_of_o": "You have the right to request access to, correction of, or deletion of your customer information at any time. Simply contact our support team via WhatsApp at",
        "text_or_email": "or email"
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        },
        {
          "id": "page_section_04",
          "enabled": true
        },
        {
          "id": "page_section_05",
          "enabled": true
        },
        {
          "id": "page_section_06",
          "enabled": true
        },
        {
          "id": "page_section_07",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "terms",
    "kind": "page",
    "title": "terms",
    "description": "Website content and search information for terms.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Terms of Service | Seedly Pakistan",
        "description": "Clear, transparent shopping terms for catalog orders, courier delivery, payments, and 7-day replacements on Seedly.pk."
      },
      "copy": {
        "text_legal_terms": "Legal Terms",
        "text_terms_of_service": "Terms of Service",
        "text_straightforward_terms_governing_catalog_orders_nationwi": "Straightforward terms governing catalog orders, nationwide courier dispatch, payment processing, and consumer safety on Seedly.pk.",
        "text_1_orders_address_verification": "1. Orders & Address Verification",
        "text_when_you_place_an_order_on_seedly_pk_you_will_receive_a": "When you place an order on Seedly.pk, you will receive an immediate order number (e.g., SED-XXXXXX) and automated confirmation. Please ensure your shipping address, city, and active mobile number are accurate. For first-time Cash on Delivery orders, our care team may reach out via WhatsApp to verify shipping details before dispatching parcels with TCS or Leopards Courier.",
        "text_2_pricing_payment_options": "2. Pricing & Payment Options",
        "text_all_prices_are_listed_in_pakistani_rupees_pkr_and_inclu": "All prices are listed in Pakistani Rupees (PKR) and inclusive of packaging costs. We offer three transparent payment channels: Cash on Delivery (COD) paid to the courier upon delivery, mobile wallets (JazzCash and Easypaisa), and direct Pakistani bank transfer (IBFT). Digital transfers are manually reviewed and verified by our accounts team against your submitted transaction ID or proof of payment prior to dispatch.",
        "text_3_nationwide_courier_dispatch": "3. Nationwide Courier Dispatch",
        "text_orders_placed_by_3_00_pm_pkt_monday_to_saturday_are_dis": "Orders placed by 3:00 PM PKT (Monday to Saturday) are dispatched the same day from our central Lahore hub via ",
        "text_tcs": "TCS",
        "text_and": " and ",
        "text_leopards_courier": "Leopards Courier",
        "text_expected_transit_times_are": ". Expected transit times are:",
        "text_current_delivery_charges_and_any_free_delivery_threshol": "Current delivery charges and any free-delivery threshold are shown in your basket and confirmed before you place your order.",
        "text_4_7_day_replacement_guarantee_food_safety_returns": "4. 7-Day Replacement Guarantee & Food Safety Returns",
        "text_5_food_notice_dietary_status": "5. Food Notice & Dietary Status",
        "text_6_customer_care_inquiries": "6. Customer Care & Inquiries",
        "text_for_any_questions_regarding_these_terms_your_order_stat": "For any questions regarding these terms, your order status, or dietary guidance, contact our team Monday to Saturday (9am–7pm PKT) at",
        "text_whatsapp": "WhatsApp ",
        "text_or_email": "or email"
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        },
        {
          "id": "page_section_04",
          "enabled": true
        },
        {
          "id": "page_section_05",
          "enabled": true
        },
        {
          "id": "page_section_06",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "product-disclaimer",
    "kind": "page",
    "title": "product disclaimer",
    "description": "Website content and search information for product disclaimer.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Dietary & Product Disclaimer | Seedly Pakistan",
        "description": "Important dietary consumer advisory regarding raw seeds, culinary nutrition, allergen notices, and botanical infusions from Seedly."
      },
      "copy": {
        "text_consumer_safety_compliance": "Consumer Safety & Compliance",
        "text_product_dietary_disclaimer": "Product & Dietary Disclaimer",
        "text_important_consumer_clarity_regarding_raw_culinary_seeds": "Important consumer clarity regarding raw culinary seeds, botanical herbal teas, and routine practices.",
        "text_standard_food_notice": "Standard Food Notice:",
        "text_scope_of_culinary_nutritional_content": "Scope of Culinary & Nutritional Content",
        "text_information_presented_on_our_website_packaging_pouches": "Information presented on our website, packaging pouches, printed routine inserts, and customer care channels is published strictly for culinary and wholesome nutritional education. Seedly seeds (pumpkin, cold-milled flax, sunflower, sesame) and mountain teas (chamomile, spearmint, green tea) are raw food ingredients, not pharmaceutical drugs, endocrine therapies, or treatments for diagnosed medical conditions.",
        "text_medical_endocrine_advisory": "Medical & Endocrine Advisory",
        "text_allergen_advisories": "Allergen Advisories",
        "text_facility_allergen_statement": "Facility Allergen Statement:",
        "text_sesame_seeds_major_allergen": "Sesame Seeds (Major Allergen):",
        "text_chamomile_blossoms_asteraceae_daisy_family": "Chamomile Blossoms (Asteraceae / Daisy Family):",
        "text_questions_product_safety": "Questions & Product Safety",
        "text_if_you_have_specific_ingredient_questions_dietary_sensi": "If you have specific ingredient questions, dietary sensitivities, or need batch verification details, contact our Lahore team directly via",
        "text_whatsapp": "WhatsApp ",
        "text_or_email": "or email"
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        },
        {
          "id": "page_section_04",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "shop",
    "kind": "page",
    "title": "shop",
    "description": "Website content and search information for shop.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Shop raw seeds, kits & teas",
        "description": "Compare pantry seeds, seed kits and loose teas with current pack prices."
      },
      "copy": {
        "text_loading_the_pantry": "Loading the pantry…",
        "title": "Shop the pantry",
        "description": "Find raw seeds, seed kits and loose teas for your daily kitchen."
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "seeds",
    "kind": "page",
    "title": "seeds",
    "description": "Website content and search information for seeds.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Raw Pantry Seeds | Seedly Pakistan",
        "description": "Shop pumpkin seeds, ground flaxseed, sunflower kernels and white sesame. Compare pack sizes and find an ingredient for breakfast, baking or salads."
      },
      "copy": {
        "text_loading_products": "Loading products…",
        "title_raw_pantry_seeds": "Raw pantry seeds",
        "description_pumpkin_flax_sunflower_and_sesame_for_breakfast_baking": "Pumpkin, flax, sunflower and sesame for breakfast, baking and salads."
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "kits",
    "kind": "page",
    "title": "kits",
    "description": "Website content and search information for kits.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Seed Cycling Kits | Seedly Pakistan",
        "description": "Compare Seedly seed cycling kits. Choose a two-seed pairing or the complete four-seed set, and see the contents and current prices before you order."
      },
      "copy": {
        "text_loading_products": "Loading products…",
        "title_seed_kits": "Seed kits",
        "description_compare_seed_pairings_pack_contents_and_current_prices": "Compare seed pairings, pack contents and current prices."
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "teas",
    "kind": "page",
    "title": "teas",
    "description": "Website content and search information for teas.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Loose-Leaf Tea & Herbal Tea | Seedly Pakistan",
        "description": "Shop loose chamomile flowers, spearmint and green tea. Find flavour notes, caffeine information and brewing instructions on each product page."
      },
      "copy": {
        "text_loading_products": "Loading products…",
        "title_loose_teas": "Loose teas",
        "description_explore_flavours_caffeine_levels_and_brewing_instructio": "Explore flavours, caffeine levels and brewing instructions."
      },
      "links": {},
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "cart",
    "kind": "page",
    "title": "Your basket",
    "description": "Website content and search information for Your basket.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Your basket",
        "description": "Your basket at Seedly."
      },
      "copy": {
        "text_continue_shopping": "Continue shopping",
        "text_basket": "Basket",
        "text_checkout": "Checkout",
        "text_your_pantry_coming_together": "Your pantry, coming together",
        "text_your_basket": "Your basket",
        "text_a_few_good_ingredients_a_little_care_for_your_everyday": "A few good ingredients. A little care for your everyday.",
        "text_removed": "Removed ",
        "text_undo": "Undo",
        "text_loading_your_basket": "Loading your basket",
        "text_good_things_start_here": "Good things start here.",
        "text_your_basket_is_ready_for_its_first_favourite_discover_w": "Your basket is ready for its first favourite. Discover whole seeds, loose teas and thoughtful seed kits.",
        "text_explore_the_pantry": "Explore the pantry",
        "text_raw_seeds": "Raw seeds",
        "text_loose_teas": "Loose teas",
        "text_seed_kits": "Seed kits",
        "text_your_selection": "Your selection",
        "text_a_question_about_your_basket": "A question about your basket?",
        "text_we_can_help_with_ingredients_sizes_and_delivery": "We can help with ingredients, sizes and delivery.",
        "text_talk_to_seedly": "Talk to Seedly",
        "text_order_summary": "Order summary",
        "text_retry": "Retry",
        "text_refresh_total": "Refresh total",
        "text_subtotal": "Subtotal",
        "text_delivery": "Delivery",
        "text_free": "Free",
        "text_remove_unavailable_packs_to_continue": "Remove unavailable packs to continue.",
        "text_continue_to_checkout": "Continue to checkout",
        "text_prices_and_availability_are_confirmed_at_checkout": "Prices and availability are confirmed at checkout.",
        "text_guest_checkout_no_account_needed": "Guest checkout. No account needed.",
        "text_delivery_across_pakistan": "Delivery across Pakistan",
        "text_choose_your_payment_method_at_checkout_transfer_payment": "Choose your payment method at checkout. Transfer payments are reviewed before preparation.",
        "text_delivery_returns_information": "Delivery & returns information"
      },
      "links": {
        "href_shop": "/shop",
        "href_seeds": "/seeds",
        "href_teas": "/teas",
        "href_kits": "/kits",
        "href_contact": "/contact",
        "href_checkout": "/checkout",
        "href_shipping": "/shipping"
      },
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "checkout",
    "kind": "page",
    "title": "Checkout",
    "description": "Website content and search information for Checkout.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Checkout",
        "description": "Checkout at Seedly."
      },
      "copy": {
        "text_optional": " (optional)",
        "text_loading_your_basket": "Loading your basket…",
        "text_your_basket_is_empty": "Your basket is empty",
        "text_explore_the_shop": "Explore the shop",
        "text_back_to_basket": "Back to basket",
        "text_checkout": "Checkout",
        "text_a_few_details_and_your_pantry_order_is_on_its_way_no_ac": "A few details and your pantry order is on its way. No account needed.",
        "text_1_contact_details": "1. Contact details",
        "text_2_delivery_address": "2. Delivery address",
        "text_city_town": "City / town",
        "text_province_region": "Province / region",
        "text_delivery_instructions": "Delivery instructions ",
        "text_optional_2": "(optional)",
        "text_3_payment_method": "3. Payment method",
        "text_retry": "Retry",
        "text_wallet_provider": "Wallet provider",
        "text_iban": "IBAN: ",
        "text_transfer_amount": "Transfer amount: ",
        "text_your_payment_will_remain_under_review_until_confirmed_b": "Your payment will remain under review until confirmed by our team. Preparation does not begin automatically.",
        "text_account_details_are_unavailable_choose_cash_on_delivery": "Account details are unavailable. Choose cash on delivery or contact support before transferring money.",
        "text_transaction_id_optional": "Transaction ID (optional)",
        "text_payment_receipt": "Payment receipt ",
        "text_remove_receipt": "Remove receipt",
        "text_we_will_recover_the_original_submitted_basket_and_total": "We will recover the original submitted basket and total. Items added to your current basket will remain there.",
        "text_items": " items · ",
        "text_edit_basket": "Edit basket",
        "text_qty": " · Qty ",
        "text_update_total": "Update total",
        "text_subtotal": "Subtotal",
        "text_delivery": "Delivery",
        "text_total": "Total",
        "text_checking_current_prices_and_stock": "Checking current prices and stock…",
        "text_please_correct_the_highlighted_fields": "Please correct the highlighted fields.",
        "text_ordering_is_temporarily_unavailable_please": "Ordering is temporarily unavailable. Please ",
        "text_contact_our_team": "contact our team",
        "text_before_transferring_payment": " before transferring payment.",
        "text_by_placing_your_order_you_agree_to_our": "By placing your order, you agree to our ",
        "text_terms": "terms",
        "text_and": " and ",
        "text_delivery_policy": "delivery policy",
        "text_need_help_with_your_order": "Need help with your order?"
      },
      "links": {
        "href_shop": "/shop",
        "href_cart": "/cart",
        "href_contact": "/contact",
        "href_terms": "/terms",
        "href_shipping": "/shipping"
      },
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        },
        {
          "id": "page_section_03",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "account",
    "kind": "page",
    "title": "Orders & saved items",
    "description": "Website content and search information for Orders & saved items.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Orders & saved items",
        "description": "Orders & saved items at Seedly."
      },
      "copy": {
        "text_orders_saved_items": "Orders & saved items",
        "text_track_your_delivery_or_revisit_the_products_you_saved_o": "Track your delivery or revisit the products you saved on this device.",
        "text_track_an_order": "Track an order",
        "text_your_pantry_picks": "Your pantry picks",
        "text_view_saved_products": "View saved products",
        "text_find_a_routine": "Find a routine",
        "text_need_to_change_delivery_details": "Need to change delivery details? ",
        "text_contact_our_team": "Contact our team"
      },
      "links": {
        "href_account_wishlist": "/account/wishlist",
        "href_find_your_seed": "/find-your-seed",
        "href_contact": "/contact"
      },
      "images": {},
      "sections": [
        {
          "id": "page_section_01",
          "enabled": true
        },
        {
          "id": "page_section_02",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "wishlist",
    "kind": "page",
    "title": "Saved products",
    "description": "Website content and search information for Saved products.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Saved products",
        "description": "Saved products at Seedly."
      },
      "copy": {
        "text_saved_products": "Saved products",
        "text_your_favourites_are_saved_on_this_device_clearing_brows": "Your favourites are saved on this device. Clearing browser data will remove this list.",
        "text_loading_your_saved_products": "Loading your saved products…",
        "text_try_again": "Try again",
        "text_some_saved_products_are_no_longer_listed_in_the_shop": "Some saved products are no longer listed in the shop.",
        "text_tap_a_product_s_heart_to_save_it_for_later": "Tap a product’s heart to save it for later.",
        "text_explore_the_pantry": "Explore the pantry"
      },
      "links": {
        "href_shop": "/shop"
      },
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "order",
    "kind": "page",
    "title": "Order tracking",
    "description": "Website content and search information for Order tracking.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Order tracking",
        "description": ""
      },
      "copy": {
        "title": "Order status",
        "text_view_your_order_securely": "View your order securely",
        "text_open_the_full_confirmation_link_from_checkout_or_your_o": "Open the full confirmation link from checkout or your order email to view this reference. Your order details stay private.",
        "text_if_you_no_longer_have_the_link_contact_our_team_for_hel": "If you no longer have the link, contact our team for help.",
        "text_contact_customer_care": "Contact customer care",
        "text_enter_a_confirmation_link": "Enter a confirmation link",
        "text_order_reference": "Order reference: ",
        "text_order_contact": " Order contact: ",
        "text_mobile": " · Mobile ",
        "text_general_status_and_package_tracking_are_shown_below": " General status and package tracking are shown below.",
        "text_payment_under_review": "Payment under review",
        "text_our_team_is_verifying_your_payment_preparation_updates": "Our team is verifying your payment. Preparation updates appear after verification and a separate fulfillment update.",
        "text_dispatched_with": "Dispatched with ",
        "text_tracking_number": "Tracking Number:",
        "text_your_package_is_currently_on_the_delivery_route": ". Your package is currently on the delivery route.",
        "text_fulfillment_timeline": "Fulfillment Timeline",
        "text_personal_delivery_details_protected": "Personal Delivery Details Protected",
        "text_your_delivery_address_and_contact_details_are_private_u": "Your delivery address and contact details are private. Use your original confirmation link to view them.",
        "text_need_help_finding_your_confirmation": "Need help finding your confirmation?",
        "text_delivery_destination": "Delivery Destination",
        "text_note": "Note: ",
        "text_phone": "Phone: ",
        "text_payment_summary": "Payment Summary",
        "text_payment_method": "Payment Method:",
        "text_payment_status": "Payment Status:",
        "text_order_date": "Order Date:",
        "text_order_items": "Order items",
        "text_quantity": "Quantity: ",
        "text_subtotal": "Subtotal",
        "text_nationwide_delivery": "Nationwide Delivery",
        "text_total_amount": "Total Amount",
        "text_chat_on_whatsapp_regarding_order": "Chat on WhatsApp regarding Order #",
        "text_continue_browsing_catalog": "Continue Browsing Catalog"
      },
      "links": {
        "href_contact": "/contact",
        "href_account": "/account",
        "href_shop": "/shop"
      },
      "images": {},
      "sections": [
        {
          "id": "page",
          "enabled": true
        }
      ]
    }
  },
  {
    "slug": "routine",
    "kind": "page",
    "title": "Routine finder",
    "description": "Website content and search information for Routine finder.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Routine finder",
        "description": "Routine finder at Seedly."
      },
      "copy": {
        "text_the_routine_finder": "The routine finder",
        "text_a_little_ritual": "A little ritual.",
        "text_a_little_more_you": "A little more you.",
        "text_three_simple_questions_a_few_pantry_favourites_chosen_a": "Three simple questions. A few pantry favourites chosen around the way you like to spend your day.",
        "text_your_pantry_shortlist": "Your pantry shortlist",
        "text_a_starting_point_for_your_everyday_ritual_explore_each": "A starting point for your everyday ritual. Explore each pick to find your favourite pack size.",
        "text_no_matching_products_are_available_right_now": "No matching products are available right now.",
        "text_explore_the_pantry": "Explore the pantry",
        "text_find_another_routine": "Find another routine",
        "text_explore_all_products": "Explore all products",
        "text_question": "Question ",
        "text_of": " of ",
        "text_back": "Back",
        "text_made_for_your_kitchen_preferences_this_is_a_food_guide": "Made for your kitchen preferences. This is a food guide, not medical advice."
      },
      "links": {
        "href_shop": "/shop"
      },
      "images": {},
      "sections": [
        {
          "id": "routinefinder_section_01",
          "enabled": true
        },
        {
          "id": "routinefinder_section_02",
          "enabled": true
        }
      ],
      "questions": [
        {
          "id": "category",
          "step": "Your pantry",
          "title": "What are you in the mood for?",
          "description": "Choose the starting point that feels most like you.",
          "options": [
            {
              "value": "seeds",
              "label": "Everyday seeds",
              "detail": "A little goodness for bowls, bakes and salads.",
              "image": "/images/products/pumpkin-seeds.jpg",
              "icon": "sprout"
            },
            {
              "value": "tea",
              "label": "A slower cup",
              "detail": "Loose leaves and flowers for a moment to yourself.",
              "image": "/images/products/chamomile-tea.jpg",
              "icon": "coffee"
            },
            {
              "value": "kit",
              "label": "A ready-made routine",
              "detail": "Thoughtful seed pairings, brought together.",
              "image": "/images/products/complete-kit.jpg",
              "icon": "layers"
            }
          ]
        },
        {
          "id": "moment",
          "step": "Your day",
          "title": "Where does your ritual fit?",
          "description": "Think about a moment you would like to make a little better.",
          "options": [
            {
              "value": "breakfast",
              "label": "The morning table",
              "detail": "Breakfast bowls, smoothies and a fresh start.",
              "image": "",
              "icon": "sunrise"
            },
            {
              "value": "cooking",
              "label": "In the kitchen",
              "detail": "A finishing touch for cooking, baking and salads.",
              "image": "",
              "icon": "cooking"
            },
            {
              "value": "cup",
              "label": "A quiet pause",
              "detail": "An afternoon break or a warm evening cup.",
              "image": "",
              "icon": "coffee"
            }
          ]
        },
        {
          "id": "quantity",
          "step": "Your pace",
          "title": "How would you like to begin?",
          "description": "There is no perfect routine. Start with what suits your day.",
          "options": [
            {
              "value": "simple",
              "label": "One small start",
              "detail": "A single pick to get to know and enjoy.",
              "image": "",
              "icon": "leaf"
            },
            {
              "value": "variety",
              "label": "A little variety",
              "detail": "A few favourites to explore at your own pace.",
              "image": "",
              "icon": "layers"
            }
          ]
        }
      ],
      "recommendationRules": {
        "breakfast": [
          "pumpkin-seeds",
          "flax-seeds",
          "golden-flaxseed"
        ],
        "cooking": [
          "sesame-seeds",
          "white-sesame",
          "sunflower-seeds"
        ],
        "cup": [
          "chamomile-tea",
          "spearmint-tea"
        ]
      },
      "categoryRules": {
        "seeds": "seed",
        "tea": "tea",
        "kit": "kit"
      },
      "resultCounts": {
        "simple": 1,
        "variety": 3
      }
    }
  },
  {
    "slug": "product",
    "kind": "page",
    "title": "Product details",
    "description": "Website content and search information for Product details.",
    "publish": true,
    "content": {
      "seo": {
        "title": "Product details",
        "description": "Product details at Seedly."
      },
      "copy": {
        "text_home": "Home",
        "text_questions_about_this_product": "Questions about this product?",
        "text_ask_our_team_about_ingredients_preparation_or_storage": "Ask our team about ingredients, preparation, or storage.",
        "text_ask_on_whatsapp": "Ask on WhatsApp",
        "text_low_stock": "Low stock — ",
        "text_left": " left",
        "text_in_stock": "In stock",
        "text_out_of_stock": "Out of stock",
        "text_per_100g": " per 100g",
        "text_sold_out": "Sold out",
        "text_delivery_charges_are_confirmed_in_your_basket_see_deliv": "Delivery charges are confirmed in your basket. See delivery information below.",
        "text_currently_out_of_stock": "Currently out of stock",
        "text_leave_your_email_and_we_will_let_you_know_when_this_fre": "Leave your email and we will let you know when this fresh batch is packed.",
        "text_notify_me_when_available": "Notify me when available",
        "text_delivery_times_charges": "Delivery times & charges",
        "text_replacement_policy": "Replacement policy",
        "text_culinary_food_item_not_a_medicine": "Culinary food item, not a medicine.",
        "text_dietary_notice": "Dietary notice",
        "text_product_information": "Product information",
        "text_ingredients_details": "Ingredients & details",
        "text_ingredients": "Ingredients",
        "text_origin": "Origin",
        "text_pack_size": "Pack size",
        "text_product_code": "Product code",
        "text_keeping_it_fresh_storage": "Keeping it fresh & storage",
        "text_check_your_pack_for_its_best_before_date_and_reseal_it": "Check your pack for its best-before date and reseal it after each use.",
        "text_common_questions": "Common questions",
        "text_does_it_contain_caffeine": "Does it contain caffeine?",
        "text_caffeine_level": "Caffeine level: ",
        "text_which_pack_sizes_are_available": "Which pack sizes are available?",
        "text_when_will_my_order_arrive": "When will my order arrive?",
        "text_timings_depend_on_your_delivery_address": "Timings depend on your delivery address. ",
        "text_see_our_delivery_estimates": "See our delivery estimates",
        "text_have_another_question": "Have another question?",
        "text_contact_the_seedly_team": "Contact the Seedly team",
        "text_for_help_with_this_product_or_your_order": " for help with this product or your order.",
        "text_nutrition_per_28g_typical_values": "Nutrition per 28g (typical values)",
        "text_dietary_food_notice": "Dietary Food Notice:",
        "text_customer_reviews": "Customer reviews",
        "text_write_a_review": "Write a review",
        "text_retry": "Retry",
        "text_submit_your_review": "Submit your review",
        "text_your_name": "Your Name *",
        "placeholder_e_g_fatima_ali_lahore": "e.g. Fatima Ali (Lahore)",
        "text_rating": "Rating",
        "text_5_excellent": "★★★★★ (5 - Excellent)",
        "text_4_good": "★★★★☆ (4 - Good)",
        "text_3_average": "★★★☆☆ (3 - Average)",
        "text_2_poor": "★★☆☆☆ (2 - Poor)",
        "text_1_very_bad": "★☆☆☆☆ (1 - Very Bad)",
        "text_title": "Title",
        "placeholder_e_g_clean_seeds_and_prompt_delivery": "e.g. Clean seeds and prompt delivery",
        "text_review_comments": "Review Comments *",
        "placeholder_share_your_experience_regarding_freshness_quality_and_r": "Share your experience regarding freshness, quality, and routine convenience...",
        "text_cancel": "Cancel",
        "text_verified_buyer": "Verified Buyer",
        "text_you_might_also_like": "You might also like",
        "text_curated_seed_kits": "Curated Seed Kits",
        "text_questions_about_how_this_routine_works": "Questions about how this routine works?",
        "text_chat_with_our_team_on_whatsapp_for_ingredients_preparat": "Chat with our team on WhatsApp for ingredients, preparation and storage guidance.",
        "text_14_28_day_routine_kit": "✦ 14 & 28-Day Routine Kit",
        "text_reviews": " reviews)",
        "text_kits_left": " kits left",
        "text_in_stock_in_lahore": "In Stock in Lahore",
        "text_ritual_bundle_value": "Ritual Bundle Value:",
        "text_save_rs_470": "Save Rs. 470",
        "text_4_x_250g_fresh_pouches_rs_2_970_individual_seed_value": "• 4 x 250g Fresh Pouches (Rs. 2,970 individual seed value)",
        "text_engraved_wooden_measuring_scoop_printed_cycle_calendar": "• Engraved Wooden Measuring Scoop + Printed Cycle Calendar (Rs. 350 value)",
        "text_standalone_total_rs_3_320_at_1_tbsp_day_this_kit_suppli": "Standalone total: Rs. 3,320 · At 1 tbsp/day, this kit supplies ",
        "text_50_60_daily_servings_approx_two_28_day_cycles": "~50–60 daily servings (approx. two 28-day cycles)",
        "text_flat_rs_200_delivery": "Flat Rs. 200 delivery",
        "text_free": "FREE",
        "text_over_rs_2_500_dispatched_in_24h_from_lahore": " over Rs. 2,500 · Dispatched in 24h from Lahore",
        "text_kit_currently_out_of_stock": "Kit currently out of stock",
        "text_leave_your_email_and_we_will_let_you_know_when_this_kit": "Leave your email and we will let you know when this kit is available.",
        "text_notify_me_when_kit_returns": "Notify Me When Kit Returns",
        "text_delivery_across_pakistan": "Delivery across Pakistan. ",
        "text_see_delivery_times_and_charges": "See delivery times and charges",
        "text_check_each_pack_for_storage_instructions_and_its_best_b": "Check each pack for storage instructions and its best-before date.",
        "text_dietary_food_notice_2": "Dietary Food Notice: ",
        "text_how_this_seed_routine_works": "How this seed routine works",
        "text_daily_usage": "Daily Usage",
        "text_simple_preparation": "Simple Preparation",
        "text_proper_storage": "Proper Storage",
        "text_protecting_freshness": "Protecting Freshness",
        "text_write_a_review_2": "Write a Review",
        "text_review_this_kit": "Review this kit",
        "placeholder_e_g_zainab_m_karachi": "e.g. Zainab M. (Karachi)",
        "placeholder_e_g_beautiful_packaging_and_easy_to_follow": "e.g. Beautiful packaging and easy to follow",
        "text_review_details": "Review Details *",
        "placeholder_how_was_the_experience_taste_and_daily_convenience": "How was the experience, taste, and daily convenience?",
        "text_verified_purchase": "Verified Purchase",
        "text_interactive_brew_guide": "Interactive Brew Guide",
        "text_how_many_cups_are_you_preparing": "How many cups are you preparing?",
        "text_adjust_cups_to_calculate_exact_leaf_weight_water_ratio": "Adjust cups to calculate exact leaf weight & water ratio",
        "text_ml": " ml",
        "text_loose_leaf_flower": "Loose Leaf / Flower",
        "text_g": " g",
        "text_approx": "approx. ",
        "text_water_volume": "Water Volume",
        "text_water_temp": "Water Temp",
        "text_steep_time": "Steep Time",
        "text_cover_while_steeping": "Cover while steeping",
        "text_brewmaster_note": "Brewmaster Note: ",
        "text_what_s_inside_this_kit": "What's inside this kit?",
        "text_click_any_pouch_to_explore_routine_phase_ingredients": "Click any pouch to explore routine phase & ingredients",
        "text_times": "&times; ",
        "text_pack_size_2": "Pack Size: ",
        "text_quantity": " (Quantity: ",
        "text_view_single_pouch": "View single pouch",
        "text_kitchen_serving_suggestion": "Kitchen serving suggestion",
        "text_nutrients": "Nutrients"
      },
      "links": {
        "href": "/",
        "href_reviews": "#reviews",
        "href_shipping": "/shipping",
        "href_returns": "/returns",
        "href_dietary_notice": "#dietary-notice",
        "href_contact": "/contact",
        "href_kits": "/kits"
      },
      "images": {},
      "sections": [
        {
          "id": "productdetailview_section_01",
          "enabled": true
        },
        {
          "id": "productdetailview_section_02",
          "enabled": true
        },
        {
          "id": "productdetailview_section_03",
          "enabled": true
        },
        {
          "id": "kitcontentsexplorer_section_01",
          "enabled": true
        }
      ],
      "pouchGuides": [
        {
          "id": "pumpkin-seeds",
          "phase": "Phase 1: Follicular Phase",
          "timing": "Days 1 to 14 of cycle",
          "nutrients": [
            "Zinc",
            "Magnesium",
            "Plant Phytosterols"
          ],
          "intakeGuide": "1 tablespoon daily, gently chewed or blended into warm porridge or fresh salads.",
          "slug": "pumpkin-seeds",
          "image": "/images/products/pumpkin-seeds.jpg"
        },
        {
          "id": "flax-seeds",
          "phase": "Phase 1: Follicular Phase",
          "timing": "Days 1 to 14 of cycle",
          "nutrients": [
            "Omega-3 (ALA)",
            "Dietary Lignans",
            "Prebiotic Fiber"
          ],
          "intakeGuide": "1 tablespoon daily, freshly milled or cracked for optimal nutrient absorption.",
          "slug": "flax-seeds",
          "image": "/images/products/flax-seeds.jpg"
        },
        {
          "id": "sunflower-seeds",
          "phase": "Phase 2: Luteal Phase",
          "timing": "Days 15 to 28 of cycle",
          "nutrients": [
            "Vitamin E (Alpha-Tocopherol)",
            "Selenium",
            "B-Complex Vitamins"
          ],
          "intakeGuide": "1 tablespoon daily, sprinkled raw over yogurt, fruit bowls, or wholesome smoothies.",
          "slug": "sunflower-seeds",
          "image": "/images/products/sunflower-seeds.jpg"
        },
        {
          "id": "sesame-seeds",
          "phase": "Phase 2: Luteal Phase",
          "timing": "Days 15 to 28 of cycle",
          "nutrients": [
            "Calcium",
            "Sesamin Lignans",
            "Copper & Zinc"
          ],
          "intakeGuide": "1 tablespoon daily, unhulled or lightly crushed into breakfast bowls.",
          "slug": "sesame-seeds",
          "image": "/images/products/sesame-seeds.jpg"
        }
      ],
      "brewGuides": [
        {
          "id": "green",
          "gramsPerCup": 2.5,
          "waterMlPerCup": 250,
          "temp": "80?C",
          "steep": "2?3 mins",
          "tip": "Boil fresh water, let it rest for 2 minutes to cool to 80?C. Avoid boiling water to prevent bitterness."
        },
        {
          "id": "chamomile",
          "gramsPerCup": 2.5,
          "waterMlPerCup": 250,
          "temp": "95?C?100?C",
          "steep": "5?7 mins",
          "tip": "Use freshly boiled water over dried blossoms and steep to your preferred taste."
        },
        {
          "id": "spearmint",
          "gramsPerCup": 2,
          "waterMlPerCup": 250,
          "temp": "90?C?95?C",
          "steep": "4?5 mins",
          "tip": "Pour hot water over the leaves and steep to your preferred taste."
        }
      ]
    }
  },
  {
    "slug": "site",
    "kind": "global",
    "title": "Site settings",
    "description": "Shared website settings.",
    "publish": true,
    "content": {
      "config": {
        "name": "Seedly",
        "brandLine": "Pakistan’s Raw Seeds & Mountain Teas",
        "description": "Pure whole raw pantry seeds and high-altitude teas from Pakistan, packed fresh in Lahore. Direct sourcing from Gilgit-Baltistan, Khyber Pakhtunkhwa, and Punjab.",
        "url": "https://seedly.softbytes.co.uk",
        "contact": {
          "phone": "0371 9055758",
          "phoneInternational": "+92 371 9055758",
          "phoneRaw": "923719055758",
          "whatsappUrl": "https://wa.me/923719055758",
          "email": "seedly@softbytes.co.uk",
          "address": "",
          "dispatchHub": "Packing & dispatch",
          "hours": "Monday – Saturday: 9:00 AM – 7:00 PM PKT"
        },
        "social": {
          "instagram": "https://instagram.com/seedlypk",
          "facebook": "https://facebook.com/seedlypk"
        },
        "shipping": {
          "freeThreshold": 2500,
          "standardFee": 200,
          "cutoffTime": "3:00 PM PKT (Monday to Saturday)",
          "couriers": [
            "TCS",
            "Leopards Courier"
          ],
          "timelines": [
            {
              "area": "Lahore",
              "time": "1–2 business days"
            },
            {
              "area": "Rest of Punjab & Islamabad / Rawalpindi",
              "time": "2–3 business days"
            },
            {
              "area": "Sindh, Khyber Pakhtunkhwa & Balochistan",
              "time": "3–4 business days"
            },
            {
              "area": "Gilgit-Baltistan & Azad Jammu and Kashmir (AJK)",
              "time": "4–6 business days"
            }
          ]
        },
        "disclaimer": {
          "standard": "This product is a culinary food item, not a medicine, and is not intended to diagnose, treat, cure, or prevent any medical condition. If you are pregnant, breastfeeding, taking prescription medication, or have an underlying health condition (including PCOS or thyroid conditions), consult your physician before making dietary changes.",
          "facility": "Packed in a facility that also handles edible seeds (sesame, sunflower, pumpkin, flax), mustard, and tree nuts (almonds, walnuts). May contain trace allergens.",
          "medicalConsultation": "Always consult a qualified medical physician or certified dietitian before introducing a new seed rotation or herbal tisane if you are pregnant, nursing, taking chronic prescription medications, or managing an endocrine condition (including PCOS, endometriosis, or thyroid conditions).",
          "chamomile": "Allergy Caution: Chamomile belongs to the Asteraceae (daisy) plant family. Avoid if you have known allergies to daisies, ragweed, or chrysanthemums.",
          "sesame": "Allergen Notice: Contains Sesame Seeds. Packed in a facility that also handles tree nuts, flax, sunflower, and pumpkin seeds.",
          "returnsChangeOfMind": "For food safety and hygiene reasons, opened food pouches or jars cannot be returned for change of mind.",
          "returnsDamaged": "If your parcel arrives damaged, unsealed, incorrect, or with any quality issue, send a photo or unboxing video to care@seedly.pk or WhatsApp 0371 9055758 within 7 days of delivery. We will dispatch a free replacement immediately at our expense, or issue a full refund.",
          "paymentVerification": "Cash on Delivery is available nationwide. Mobile wallet transfers (JazzCash, Easypaisa) and bank transfers are verified manually by our Lahore accounts team prior to dispatch.",
          "seedCyclingNote": "Dietary note: Seed cycling is a traditional whole-food culinary practice. Raw seeds supply natural plant minerals, healthy fats, and fiber, but clinical research remains preliminary. If managing endocrine or hormonal conditions, always consult your physician."
        },
        "brewing": {
          "chamomile": {
            "dose": "1 rounded teaspoon (approx. 2.5g)",
            "water": "200–250ml freshly boiled water",
            "temp": "95°C–100°C",
            "time": "5–7 minutes",
            "cups": "approx. 20 cups per 50g pack (at 2.5g per cup)"
          },
          "spearmint": {
            "dose": "1 rounded teaspoon (approx. 2g)",
            "water": "200–250ml freshly boiled water",
            "temp": "90°C–95°C",
            "time": "4–5 minutes",
            "cups": "approx. 25–30 cups per 50g pouch"
          },
          "greenTea": {
            "dose": "1 level teaspoon (approx. 2.5g)",
            "water": "200–250ml hot water",
            "temp": "80°C (let boiled water rest 2 min)",
            "time": "2–3 minutes",
            "cups": "approx. 20–25 cups per 50g pouch (re-steepable 2–3 times)"
          }
        },
        "kitMath": {
          "complete": {
            "seedsValue": 2970,
            "extrasValue": 350,
            "totalValue": 3320,
            "price": 2850,
            "savingsTotal": 470,
            "savingsSeedsOnly": 120,
            "durationDescription": "Four 250g pouches (~50–60 daily tablespoons / approx. two full 28-day cycles)"
          },
          "follicular": {
            "seedsValue": 1630,
            "price": 1550,
            "savings": 80,
            "durationDescription": "Two 250g pouches (~25–30 daily tablespoons / 14-day routine)"
          },
          "luteal": {
            "seedsValue": 1340,
            "price": 1290,
            "savings": 50,
            "durationDescription": "Two 250g pouches (~25–30 daily tablespoons / 14-day routine)"
          }
        }
      },
      "features": {
        "routine": true,
        "reviews": true,
        "announcements": true,
        "savedProducts": true,
        "whatsapp": true,
        "search": true
      },
      "header": {
        "shopLinks": [
          {
            "label": "Shop all",
            "href": "/shop"
          },
          {
            "label": "Seeds",
            "href": "/seeds"
          },
          {
            "label": "Kits",
            "href": "/kits"
          },
          {
            "label": "Teas",
            "href": "/teas"
          }
        ],
        "exploreLinks": [
          {
            "label": "Routine finder",
            "href": "/find-your-seed"
          },
          {
            "label": "Our story",
            "href": "/about"
          }
        ],
        "tagline": "The everyday pantry",
        "searchLabel": "Search seeds, kits and teas",
        "savedLabel": "Saved",
        "basketLabel": "Basket",
        "trackLabel": "Track order",
        "mobileSearchLabel": "Search the pantry",
        "mobileShopLabel": "Shop the pantry",
        "mobileExploreLabel": "Explore Seedly",
        "mobileTrackLabel": "Track an order",
        "mobileAccountLabel": "Orders & saved items",
        "mobileContactLabel": "Contact Seedly"
      },
      "footer": {
        "intro": "Raw pantry seeds and loose teas, for everyday meals and quiet moments.",
        "storyLabel": "Our story",
        "groups": [
          {
            "title": "Shop",
            "links": [
              {
                "label": "Shop all",
                "href": "/shop"
              },
              {
                "label": "Raw seeds",
                "href": "/seeds"
              },
              {
                "label": "Seed kits",
                "href": "/kits"
              },
              {
                "label": "Mountain teas",
                "href": "/teas"
              },
              {
                "label": "Routine finder",
                "href": "/find-your-seed"
              }
            ]
          },
          {
            "title": "Customer care",
            "links": [
              {
                "label": "Track an order",
                "href": "/account"
              },
              {
                "label": "Delivery information",
                "href": "/shipping"
              },
              {
                "label": "Returns & replacements",
                "href": "/returns"
              },
              {
                "label": "FAQs",
                "href": "/faq"
              },
              {
                "label": "Contact us",
                "href": "/contact"
              }
            ]
          }
        ],
        "helpTitle": "Here to help",
        "whatsappLabel": "Chat on WhatsApp",
        "guidanceLabel": "Ingredients, allergens & dietary guidance",
        "foodNotice": "Our products are food ingredients and teas for culinary use. They are not intended to diagnose, treat, cure or prevent a medical condition.",
        "copyrightLocation": "Pakistan",
        "privacyLabel": "Privacy",
        "termsLabel": "Terms",
        "instagramLabel": "Instagram"
      },
      "announcement": {
        "deliveryTemplate": "Free delivery from {amount}",
        "deliveryFallback": "Delivered across Pakistan",
        "paymentLabel": "Cash on delivery available"
      },
      "delivery": {
        "template": "Delivery {fee} ? Free from {threshold}.",
        "fallback": "Delivery charges are confirmed in your basket.",
        "linkLabel": "Delivery information"
      },
      "mobileNavigation": [
        {
          "id": "home",
          "label": "Home",
          "href": "/"
        },
        {
          "id": "shop",
          "label": "Shop",
          "href": "/shop"
        },
        {
          "id": "routine",
          "label": "Find yours",
          "href": "/find-your-seed"
        },
        {
          "id": "saved",
          "label": "Saved",
          "href": "/account/wishlist"
        },
        {
          "id": "orders",
          "label": "Orders",
          "href": "/account"
        }
      ],
      "testimonials": {
        "eyebrow": "Community feedback",
        "title": "Customer testimonials & reviews",
        "subtitle": "Stories from our customers",
        "topPick": "Customer review",
        "reviewLabel": "Review",
        "instagramLabel": "Tag us to be featured",
        "instagramHandle": "@seedlypk",
        "empty": "Customer reviews will appear here once approved.",
        "unavailable": "Customer reviews are temporarily unavailable."
      },
      "copy": {
        "text_search_seedly_pantry": "Search Seedly Pantry",
        "text_search_products": "Search products",
        "placeholder_search_seeds_kits_and_teas": "Search seeds, kits and teas",
        "text_results_update_as_you_type_use_the_arrow_keys_to_browse": "Results update as you type. Use the arrow keys to browse products, Enter to open, and Escape to close.",
        "text_we_couldn_t_load_products_please_try_again": "We couldn't load products. Please try again.",
        "text_try_again": "Try again",
        "text_middot": " &middot; ",
        "text_no_products_found": "No products found",
        "text_try_a_product_or_ingredient_like_pumpkin_flax_or_chamom": "Try a product or ingredient, like pumpkin, flax or chamomile.",
        "text_track_your_order": "Track your order"
      },
      "links": {},
      "images": {},
      "brand": {
        "logoUrl": "",
        "logoAlt": "Seedly"
      }
    }
  },
  {
    "slug": "page-template",
    "kind": "config",
    "title": "New page template",
    "description": "Shared website settings.",
    "publish": true,
    "content": {
      "seo": {
        "title": "New page",
        "description": "Page description"
      },
      "title": "New page",
      "intro": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Section heading",
          "body": "",
          "image": "",
          "linkLabel": "",
          "href": "",
          "enabled": true
        }
      ]
    }
  }
];
