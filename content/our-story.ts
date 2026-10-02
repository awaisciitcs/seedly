export interface OurStoryContent {
  hero: {
    eyebrow: string;
    h1: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
  };
  whySeedly: {
    eyebrow: string;
    h2: string;
    paragraph1: string;
    paragraph2: string;
    signature: string;
    founderAvatar?: string;
  };
  sourceToPouch: {
    h2: string;
    steps: Array<{
      step: string;
      title: string;
      text: string;
    }>;
  };
  collection: {
    h2: string;
    shopAll: string;
    cards: Array<{
      id: string;
      title: string;
      description: string;
      count: string;
      linkText: string;
      href: string;
    }>;
  };
  closingCta: {
    h2: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
    whatsappCta: string;
  };
}

export const ourStoryEn: OurStoryContent = {
  hero: {
    eyebrow: 'Our story',
    h1: 'Everyday ingredients. A place in your kitchen.',
    lead: 'A spoonful of seeds over breakfast. A pot of tea in the afternoon. Seedly is built around ingredients that fit into the way you already eat and drink.',
    primaryCta: 'Browse the collection',
    secondaryCta: 'Routine finder',
  },
  whySeedly: {
    eyebrow: 'Why Seedly',
    h2: 'Honest ingredients, packed fresh.',
    paragraph1:
      "Seedly started in Lahore because [your reason: what you couldn't find]. We source from [growers / cooperatives], pack in small batches and say plainly what's in every pouch. Ingredients, pack size and storage are listed on every product page.",
    paragraph2: '[One sentence on who you are and what you want customers to know.]',
    signature: '[Founder name], founder',
    // founderAvatar is omitted unless an actual image path is provided
  },
  sourceToPouch: {
    h2: 'From source to your kitchen.',
    steps: [
      {
        step: '01',
        title: 'Sourced',
        text: 'Our golden flax comes from smallholder cooperatives in Bahawalpur. [Origin of the other seeds and the teas.]',
      },
      {
        step: '02',
        title: 'Made in small batches',
        text: 'Flax is cold-milled slowly in small batches. [How the other seeds and teas are cleaned and checked.]',
      },
      {
        step: '03',
        title: 'Packed in Lahore',
        text: 'Packed fresh and tracked by lot, so every pouch traces back to its batch.',
      },
      {
        step: '04',
        title: 'Dispatched in 24h',
        text: 'Sent from Lahore within 24 hours, nationwide, with cash on delivery.',
      },
    ],
  },
  collection: {
    h2: 'A small, useful collection.',
    shopAll: 'Shop all',
    cards: [
      {
        id: 'seeds',
        title: 'Pantry seeds',
        description:
          'Pumpkin, flax, sunflower and sesame. Add them to breakfast, use them in baking or finish a salad with a spoonful.',
        count: '4 products',
        linkText: 'Shop seeds',
        href: '/seeds',
      },
      {
        id: 'teas',
        title: 'Loose-leaf teas',
        description:
          'Chamomile flowers, spearmint and green tea. Choose a familiar flavour or find something different for your next cup.',
        count: '3 products',
        linkText: 'Shop teas',
        href: '/teas',
      },
      {
        id: 'kits',
        title: 'Seed kits',
        description:
          'Our seeds, paired together in one box. Compare the two-seed and four-seed options to find the contents you need.',
        count: '3 routine boxes',
        linkText: 'Compare kits',
        href: '/kits',
      },
    ],
  },
  closingCta: {
    h2: 'Start with one ingredient.',
    sub: 'Not sure where to begin? Try the routine finder, or ask us on WhatsApp.',
    primaryCta: 'Shop seeds',
    secondaryCta: 'Routine finder',
    whatsappCta: 'Ask on WhatsApp',
  },
};

// Urdu fallback mapping (using English text as requested until native Urdu translation is provided)
export const ourStoryUr: OurStoryContent = {
  ...ourStoryEn,
};

export const getOurStoryContent = (lang: 'en' | 'ur' = 'en'): OurStoryContent => {
  return lang === 'ur' ? ourStoryUr : ourStoryEn;
};
