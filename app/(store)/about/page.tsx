import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../../../components/ui/Reveal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Seedly | Seeds, Tea & Pantry Staples',
  description:
    'Get to know the Seedly collection: pantry seeds, loose-leaf teas and seed cycling kits, with ingredients, pack sizes and preparation details on every product page.',
  openGraph: {
    title: 'About Seedly',
    description: 'Pantry seeds, loose-leaf teas and seed kits for everyday use.',
    images: ['/images/hero/seedly-hero-lifestyle.jpg'],
  },
};

const COLLECTIONS = [
  {
    number: '01',
    title: 'Pantry seeds',
    description: 'Pumpkin, flax, sunflower and sesame. Add them to breakfast, use them in baking or finish a salad with a spoonful.',
    href: '/seeds',
    link: 'Shop seeds',
  },
  {
    number: '02',
    title: 'Loose-leaf teas',
    description: 'Chamomile flowers, spearmint and green tea. Choose a familiar flavour or find something different for your next cup.',
    href: '/teas',
    link: 'Shop teas',
  },
  {
    number: '03',
    title: 'Seed kits',
    description: 'Our seeds, paired together in one box. Compare the two-seed and four-seed options to find the contents you need.',
    href: '/kits',
    link: 'Compare kits',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <Reveal as="section" className="grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
        <div className="motion-enter max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-seedly-primary mb-5">About Seedly</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal leading-[1.12]">
            Everyday ingredients.<br />A place in your kitchen.
          </h1>
          <p className="text-base sm:text-lg text-muted-gray leading-relaxed mt-6">
            A spoonful of seeds over breakfast. A pot of tea in the afternoon. Seedly is built around ingredients that fit into the way you already eat and drink.
          </p>
          <p className="text-base text-muted-gray leading-relaxed mt-4">
            Our collection brings together four pantry seeds, three loose-leaf teas and a choice of seed kits. Start with a single ingredient, or pick a few to keep on hand.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-3 mt-7 pb-1 border-b border-seedly-dark text-sm font-semibold text-seedly-dark hover:text-seedly-primary transition-colors">
            Browse the collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-sm bg-stone">
          <Image
            src="/images/hero/seedly-hero-lifestyle.jpg"
            alt="Seedly pumpkin seeds, sesame and chamomile on a kitchen table"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="motion-hero object-cover"
          />
        </div>
      </Reveal>

      <Reveal as="section" className="mt-16 sm:mt-24 border-t border-border-gray pt-9 sm:pt-12">
        <h2 className="font-serif text-3xl font-medium text-charcoal">A small, useful collection.</h2>
        <div className="grid md:grid-cols-3 gap-9 md:gap-12 mt-9">
          {COLLECTIONS.map((collection) => (
            <div key={collection.href}>
              <span className="text-xs text-muted-gray tabular-nums">{collection.number}</span>
              <h3 className="font-serif text-2xl text-charcoal mt-3">{collection.title}</h3>
              <p className="text-sm sm:text-base text-muted-gray leading-relaxed mt-3">{collection.description}</p>
              <Link href={collection.href} className="inline-flex items-center gap-2 text-sm font-semibold text-seedly-dark hover:text-seedly-primary mt-5 transition-colors">
                {collection.link} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="grid md:grid-cols-[1fr_1.3fr] gap-6 md:gap-16 mt-16 sm:mt-24 border-t border-border-gray pt-9 sm:pt-12">
        <h2 className="font-serif text-3xl font-medium text-charcoal">The details, before you order.</h2>
        <div>
          <p className="text-base text-muted-gray leading-relaxed">
            Each product page lists ingredients, pack sizes and storage instructions. For teas, you can also check the flavour, caffeine level and brewing guide. Kit pages show which seeds and accessories are included.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-seedly-dark hover:text-seedly-primary mt-5 transition-colors">
            Get in touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
