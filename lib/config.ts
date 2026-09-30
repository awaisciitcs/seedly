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
    standard: 'This product is a culinary food item, not a medicine, and is not intended to diagnose, treat, cure, or prevent any medical condition. If you are pregnant, breastfeeding, taking prescription medication, or have an underlying health condition, consult your physician before making dietary changes.',
    chamomile: 'Allergy Caution: Chamomile belongs to the Asteraceae (daisy) plant family. Avoid if you have known allergies to daisies, ragweed, or chrysanthemums.',
    sesame: 'Allergen Notice: Contains Sesame Seeds. Packed in a facility that also handles flax, sunflower, and pumpkin seeds.',
    returnsChangeOfMind: 'For food safety and hygiene reasons, opened food pouches cannot be returned for change of mind.',
    returnsDamaged: 'If your parcel arrives damaged or unsealed, send a photo or unboxing video to care@seedly.pk or WhatsApp 0371 9055758 within 7 days. We will dispatch a free replacement immediately at our expense, or issue a full refund.',
  },
};
