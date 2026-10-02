export const siteConfig = {
  name: 'Seedly',
  brandLine: "Pakistan’s Raw Seeds & Mountain Teas",
  description: 'Pure whole raw pantry seeds and high-altitude teas from Pakistan, packed fresh in Lahore. Direct sourcing from Gilgit-Baltistan, Khyber Pakhtunkhwa, and Punjab.',
  url: 'https://seedly.pk',
  contact: {
    phone: '0371 9055758',
    phoneInternational: '+92 371 9055758',
    phoneRaw: '923719055758',
    whatsappUrl: 'https://wa.me/923719055758',
    email: 'care@seedly.pk',
    address: 'Plot 42, Block C-2, Gulberg III, Lahore, Punjab, Pakistan',
    dispatchHub: 'Lahore Packing & Dispatch Hub',
    hours: 'Monday – Saturday: 9:00 AM – 7:00 PM PKT',
  },
  social: {
    instagram: 'https://instagram.com/seedlypk',
    facebook: 'https://facebook.com/seedlypk',
  },
  shipping: {
    freeThreshold: 2500, // PKR
    standardFee: 200,    // PKR
    cutoffTime: '3:00 PM PKT (Monday to Saturday)',
    couriers: ['TCS', 'Leopards Courier'],
    timelines: [
      { area: 'Lahore', time: '1–2 business days' },
      { area: 'Rest of Punjab & Islamabad / Rawalpindi', time: '2–3 business days' },
      { area: 'Sindh, Khyber Pakhtunkhwa & Balochistan', time: '3–4 business days' },
      { area: 'Gilgit-Baltistan & Azad Jammu and Kashmir (AJK)', time: '4–6 business days' },
    ],
  },
  disclaimer: {
    standard: 'This product is a culinary food item, not a medicine, and is not intended to diagnose, treat, cure, or prevent any medical condition. If you are pregnant, breastfeeding, taking prescription medication, or have an underlying health condition (including PCOS or thyroid conditions), consult your physician before making dietary changes.',
    facility: 'Packed in a facility that also handles edible seeds (sesame, sunflower, pumpkin, flax), mustard, and tree nuts (almonds, walnuts). May contain trace allergens.',
    medicalConsultation: 'Always consult a qualified medical physician or certified dietitian before introducing a new seed rotation or herbal tisane if you are pregnant, nursing, taking chronic prescription medications, or managing an endocrine condition (including PCOS, endometriosis, or thyroid conditions).',
    chamomile: 'Allergy Caution: Chamomile belongs to the Asteraceae (daisy) plant family. Avoid if you have known allergies to daisies, ragweed, or chrysanthemums.',
    sesame: 'Allergen Notice: Contains Sesame Seeds. Packed in a facility that also handles tree nuts, flax, sunflower, and pumpkin seeds.',
    returnsChangeOfMind: 'For food safety and hygiene reasons, opened food pouches or jars cannot be returned for change of mind.',
    returnsDamaged: 'If your parcel arrives damaged, unsealed, incorrect, or with any quality issue, send a photo or unboxing video to care@seedly.pk or WhatsApp 0371 9055758 within 7 days of delivery. We will dispatch a free replacement immediately at our expense, or issue a full refund.',
    paymentVerification: 'Cash on Delivery is available nationwide. Mobile wallet transfers (JazzCash, Easypaisa) and bank transfers are verified manually by our Lahore accounts team prior to dispatch.',
    seedCyclingNote: 'Dietary note: Seed cycling is a traditional whole-food culinary practice. Raw seeds supply natural plant minerals, healthy fats, and fiber, but clinical research remains preliminary. If managing endocrine or hormonal conditions, always consult your physician.',
  },
  brewing: {
    chamomile: {
      dose: '1 rounded teaspoon (approx. 2.5g)',
      water: '200–250ml freshly boiled water',
      temp: '95°C–100°C',
      time: '5–7 minutes',
      cups: 'approx. 20 cups per 50g pack (at 2.5g per cup)',
    },
    spearmint: {
      dose: '1 rounded teaspoon (approx. 2g)',
      water: '200–250ml freshly boiled water',
      temp: '90°C–95°C',
      time: '4–5 minutes',
      cups: 'approx. 25–30 cups per 50g pouch',
    },
    greenTea: {
      dose: '1 level teaspoon (approx. 2.5g)',
      water: '200–250ml hot water',
      temp: '80°C (let boiled water rest 2 min)',
      time: '2–3 minutes',
      cups: 'approx. 20–25 cups per 50g pouch (re-steepable 2–3 times)',
    },
  },
  kitMath: {
    complete: {
      seedsValue: 2970, // 950 + 680 + 720 + 620
      extrasValue: 350,  // Engraved wooden scoop + printed cycle calendar
      totalValue: 3320,
      price: 2850,
      savingsTotal: 470,
      savingsSeedsOnly: 120,
      durationDescription: 'Four 250g pouches (~50–60 daily tablespoons / approx. two full 28-day cycles)',
    },
    follicular: {
      seedsValue: 1630, // 950 + 680
      price: 1550,
      savings: 80,
      durationDescription: 'Two 250g pouches (~25–30 daily tablespoons / 14-day routine)',
    },
    luteal: {
      seedsValue: 1340, // 720 + 620
      price: 1290,
      savings: 50,
      durationDescription: 'Two 250g pouches (~25–30 daily tablespoons / 14-day routine)',
    },
  },
};
