import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import { formatPKR } from '../../../lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seed Cycling Kits | Seedly Pakistan',
  description:
    'Compare Seedly seed cycling kits. Choose a two-seed pairing or the complete four-seed set, and see the contents and current prices before you order.',
  openGraph: {
    title: 'Seed Cycling Kits | Seedly Pakistan',
    description:
      'Two-seed pairings and a complete four-seed set. Compare the contents and prices of our seed cycling kits.',
    url: 'https://seedly.pk/kits',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/products/complete-kit.jpg',
        width: 800,
        height: 800,
        alt: 'Seedly complete seed cycling kit',
      },
    ],
  },
};

export default async function KitsPage() {
  const kits = await getKits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      <div className="motion-enter max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-seedly-primary mb-4">The seed collection</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal">Seed cycling kits.</h1>
        <p className="text-base text-muted-gray mt-4 leading-relaxed">
          Choose a pumpkin and flax pairing, sunflower and sesame, or all four seeds in one box. Compare the contents below to find the kit that suits your routine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {kits.map((kit) => (
          <ProductCard key={kit.id} product={kit} />
        ))}
      </div>

      {kits.length > 0 && (
        <section className="border-t border-border-gray pt-9 sm:pt-12">
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-medium text-charcoal">What is in each kit?</h2>
            <p className="text-sm sm:text-base text-muted-gray mt-3">The contents and price, side by side.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm border-collapse">
              <caption className="sr-only">Compare seed kit ingredients, package contents and prices</caption>
              <thead>
                <tr className="border-b border-border-gray">
                  <th scope="col" className="py-4 pr-6 w-36 font-medium text-muted-gray">Kit</th>
                  {kits.map((kit) => (
                    <th key={kit.id} scope="col" className="px-5 py-4 font-medium text-charcoal align-top">{kit.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray text-muted-gray">
                <tr>
                  <th scope="row" className="py-5 pr-6 font-medium text-charcoal align-top">Seeds included</th>
                  {kits.map((kit) => (
                    <td key={kit.id} className="px-5 py-5 leading-relaxed align-top">
                      <ul className="space-y-1">
                        {kit.items.map((item) => <li key={item.id}>{item.product_name}{item.variant_name ? ` (${item.variant_name})` : ''}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</li>)}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-5 pr-6 font-medium text-charcoal align-top">In the box</th>
                  {kits.map((kit) => <td key={kit.id} className="px-5 py-5 leading-relaxed align-top">{kit.package_size}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="py-5 pr-6 font-medium text-charcoal">Price</th>
                  {kits.map((kit) => <td key={kit.id} className="px-5 py-5 font-semibold text-charcoal">{formatPKR(kit.price_minor)}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="py-5 pr-6 font-medium text-charcoal"><span className="sr-only">Product details</span></th>
                  {kits.map((kit) => (
                    <td key={kit.id} className="px-5 py-5">
                      <Link href={`/kits/${kit.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-seedly-dark hover:text-seedly-primary transition-colors" aria-label={`View ${kit.name}`}>
                        View kit <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
