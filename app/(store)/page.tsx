import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getFeaturedProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { ProductCard } from '../../components/product/ProductCard';
import { Reveal } from '../../components/ui/Reveal';
import { siteConfig } from '../../lib/config';
import { formatPKR } from '../../lib/utils';

const collections = [
  {
    href: '/seeds',
    title: 'Raw seeds',
    description: 'For breakfast bowls, baking, and a handful on the go.',
    image: '/images/products/pumpkin-seeds.jpg',
    alt: 'Pumpkin seeds in a pouch with a wooden scoop',
  },
  {
    href: '/teas',
    title: 'Mountain teas',
    description: 'Loose leaves and whole blossoms. Just add hot water.',
    image: '/images/products/chamomile-tea.jpg',
    alt: 'Dried chamomile blossoms and a glass of brewed tea',
  },
  {
    href: '/kits',
    title: 'Seed kits',
    description: 'Our seed combinations, brought together in one box.',
    image: '/images/products/complete-kit.jpg',
    alt: 'Four seed varieties with a scoop and printed guide',
  },
];

export default async function HomePage() {
  const [featuredProductsList, kitsList] = await Promise.all([
    getFeaturedProducts(),
    getKits(),
  ]);
  const featuredProducts = featuredProductsList.slice(0, 4);
  const completeKit = kitsList.find((kit) => kit.slug === 'complete-cycle-kit' || kit.id === 'kit-complete');

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: 'Seedly Pakistan',
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo/seedly-logo.jpg`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.contact.phoneInternational,
          contactType: 'Customer Support',
          areaServed: 'PK',
          availableLanguage: ['English', 'Urdu'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: 'Seedly Pakistan',
        publisher: { '@id': `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <section className="border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 pb-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-9 lg:gap-10 xl:gap-16 items-center">
            <div className="motion-enter lg:col-span-5 lg:py-6">
              <p className="eyebrow mb-6">The Seedly pantry</p>
              <h1 className="font-serif text-[2.25rem] min-[375px]:text-[2.65rem] sm:text-6xl lg:text-[3.1rem] xl:text-[3.75rem] leading-[1.08] tracking-[-0.045em] font-normal text-seedly-dark">
                Raw seeds.<br />
                Mountain teas.<br />
                <span className="text-seedly-primary">Everyday staples.</span>
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-gray max-w-sm">
                Good ingredients deserve a place in your kitchen. Explore our raw seeds,
                loose-leaf teas, and seed kits, packed in Lahore and delivered across Pakistan.
              </p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4 mt-8">
                <Link href="/shop" className="button-primary">
                  Shop the pantry <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link href="/about" className="text-link">Get to know Seedly</Link>
              </div>
            </div>

            <figure className="lg:col-span-7 min-w-0">
              <div className="relative aspect-[5/4] sm:aspect-[4/3] lg:aspect-[6/5] overflow-hidden bg-seedly-stone">
                <Image
                  src="/images/hero/seedly-hero.jpg"
                  alt="A pouch of Seedly pumpkin seeds, a bowl of seeds, and a jar of chamomile on a kitchen table"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  className="motion-hero object-cover object-[48%_center]"
                />
              </div>
              <figcaption className="flex justify-between gap-4 mt-3 text-xs text-muted-gray">
                <span>A few good things for your kitchen.</span>
                <span className="shrink-0">Seedly, Lahore</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section aria-labelledby="collections-heading" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
          <h2 id="collections-heading" className="section-heading">Find your everyday favourites.</h2>
          <p className="text-sm text-muted-gray">A small collection. Plenty of ways to enjoy it.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <Reveal key={collection.href} delay={index * 65}>
              <Link href={collection.href} className="motion-collection group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-seedly-stone">
                  <Image
                    src={collection.image}
                    alt={collection.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 mt-5">
                  <h3 className="font-serif text-2xl font-normal text-seedly-dark">{collection.title}</h3>
                  <ArrowUpRight className="w-5 h-5 text-seedly-dark" aria-hidden="true" />
                </div>
                <p className="text-sm leading-6 text-muted-gray mt-2 max-w-xs">{collection.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section aria-labelledby="essentials-heading" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-14 sm:pb-20">
          <div className="border-t border-border-gray pt-12 sm:pt-16">
            <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
              <div>
                <p className="eyebrow mb-3">Start with the essentials</p>
                <h2 id="essentials-heading" className="section-heading">A place in the pantry.</h2>
              </div>
              <Link href="/shop" className="text-link inline-flex items-center gap-3">
                Browse all products <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-8">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {completeKit && (
        <Reveal as="section" aria-labelledby="kit-heading" className="bg-seedly-light">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[540px]">
              <Image
                src={completeKit.image_url}
                alt={completeKit.name}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="px-5 py-10 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-center items-start">
              <p className="eyebrow mb-5">All together, in one box</p>
              <h2 id="kit-heading" className="font-serif font-normal text-4xl sm:text-[2.75rem] leading-[1.15] tracking-[-0.025em] text-seedly-dark">
                Four seeds.<br />One simple routine.
              </h2>
              <p className="text-base text-muted-gray leading-7 mt-5 max-w-md">
                Pumpkin, flax, sunflower, and sesame. Our complete kit brings all four
                together, with a wooden scoop and a printed guide to help you get started.
              </p>
              <div className="w-full mt-7 border-t border-seedly-dark/15 pt-5">
                <p className="text-sm text-seedly-dark">{completeKit.name}</p>
                <p className="mt-1 text-sm text-muted-gray">{completeKit.package_size}</p>
                <p className="text-xl font-medium text-seedly-dark mt-3 tabular-nums">{formatPKR(completeKit.price_minor)}</p>
              </div>
              <Link href={`/kits/${completeKit.slug}`} className="button-primary mt-6">
                Explore the kit <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal as="section" aria-labelledby="about-heading" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-4">
            <p className="eyebrow mb-4">A note from Seedly</p>
            <h2 id="about-heading" className="section-heading">Keep it simple.<br />Make it part of your day.</h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="font-serif text-2xl sm:text-[1.75rem] leading-relaxed tracking-[-0.015em] text-seedly-dark">
              A spoonful of seeds in your breakfast. A pot of tea after a long day.
              We think good ingredients belong in the ordinary moments.
            </p>
            <p className="text-sm sm:text-base leading-7 text-muted-gray mt-5 max-w-xl">
              Seedly is a pantry shop based in Lahore. We bring together seeds and teas
              with clear ingredient lists, pack sizes, and preparation instructions,
              so you can choose what works for your kitchen.
            </p>
            <Link href="/about" className="text-link inline-flex items-center gap-3 mt-6">
              More about Seedly <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="border-t border-border-gray mt-12 sm:mt-16 pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-gray">Need a hand with a product or an order? Our team can help.</p>
          <Link href="/contact" className="text-link inline-flex items-center gap-3 shrink-0">
            Get in touch <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
