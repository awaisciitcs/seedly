import { getContentMetadata } from '@/lib/cms/metadata';
import { getContentDocument } from '@/lib/services/content';
import { ManagedSection, ManagedSections } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent, HomeContent } from '@/lib/cms/storefront-types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf } from 'lucide-react';
import { DepthSurface } from '@/components/ui/DepthSurface';
import { getFeaturedProducts } from '@/lib/services/products';
import { getApprovedReviews } from '@/lib/services/reviews';
import { getKits } from '@/lib/services/kits';
import { TestimonialCarousel } from '@/components/storefront/TestimonialCarousel';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal } from '@/components/ui/Reveal';
import { DeliveryNote } from '@/components/storefront/DeliveryNote';
import { formatPKR } from '@/lib/utils';
export default async function HomePage() {
  const cms = await getContentDocument<HomeContent>('home'); const { copy, links, images } = cms;

  const [products,kits,reviewResult]=await Promise.all([getFeaturedProducts(),getKits(),getApprovedReviews().then(reviews=>({reviews,unavailable:false})).catch(()=>({reviews:[],unavailable:true}))]);
  const kit=kits.find(k=>k.slug===cms.featuredKitSlug); const collections=cms.collections;
  return <div>
    <ManagedSections document="home" sections={{"page_section_01":(<ManagedSection document="home" sectionId="page_section_01"><section className="store-container grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-10 sm:py-16">
      <div className="max-w-xl"><p className="eyebrow mb-5">{copy.text_the_seedly_pantry}</p><h1 className="hero-heading">{copy.text_good_ingredients}<br/>{copy.text_everyday_rituals}</h1><p className="text-muted-gray text-base sm:text-lg leading-relaxed mt-6 max-w-lg">{copy.text_whole_seeds_thoughtful_seed_kits_and_loose_teas_find_th}</p><div className="flex flex-wrap gap-3 mt-8"><Link className="button-primary" href={links.href_shop}>{copy.text_explore_the_pantry}<ArrowRight size={18}/></Link><Link className="button-secondary" href={links.href_find_your_seed}>{copy.text_find_your_routine}</Link></div><div className="mt-6"><DeliveryNote/></div></div>
      <div className="hero-stage"><DepthSurface strength={5} className="hero-depth aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl" layer={<p className="hero-depth-note"><Leaf size={22} strokeWidth={1.5} aria-hidden="true"/><span>{copy.text_a_little_care_for_your}<br/>{copy.text_everyday_pantry}</span></p>}><Image src={images.src_images_hero_seedly_hero_jpg} alt={copy.alt_seeds_and_a_cup_of_tea_on_a_kitchen_table} fill priority sizes="(max-width:1023px) 92vw, 46vw" className="object-cover"/></DepthSurface></div>
    </section></ManagedSection>),"page_section_02":(<ManagedSection document="home" sectionId="page_section_02"><section className="store-container py-10 sm:py-16 border-t border-border-gray"><div className="flex flex-wrap items-end justify-between gap-4 mb-7"><h2 className="section-heading">{copy.text_find_your_everyday_favourites}</h2><Link href={links.href_shop} className="text-link">{copy.text_shop_all_products}</Link></div><div className="grid md:grid-cols-3 gap-6">{collections.map(collection=><Reveal key={collection.href} stagger><Link href={collection.href} className="collection-card group block"><DepthSurface strength={3} className="aspect-[4/3] rounded-xl bg-cream"><Image src={collection.image} alt={collection.title} fill sizes="(max-width:767px) 92vw, 30vw" className="object-cover product-image"/></DepthSurface><div className="flex justify-between items-center mt-4"><h3 className="text-xl">{collection.title}</h3><ArrowRight size={20}/></div><p className="text-sm text-muted-gray mt-2">{collection.text}</p></Link></Reveal>)}</div></section></ManagedSection>),"page_section_03":(products.length>0 && <ManagedSection document="home" sectionId="page_section_03"><section className="bg-cream py-12 sm:py-20"><div className="store-container"><div className="flex flex-wrap justify-between items-end gap-4 mb-8"><h2 className="section-heading">{copy.text_pantry_essentials}</h2><Link href={links.href_shop} className="text-link">{copy.text_browse_the_collection}</Link></div><div className="product-grid">{products.slice(0,4).map(product=><ProductCard key={product.id} product={product}/>)}</div></div></section></ManagedSection>),"page_section_04":(kit && <ManagedSection document="home" sectionId="page_section_04"><section className="store-container py-12 sm:py-20"><Reveal className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"><div className="relative aspect-square rounded-2xl overflow-hidden"><Image src={kit.image_url} alt={kit.name} fill sizes="(max-width:767px) 92vw, 46vw" className="object-cover"/></div><div><p className="eyebrow mb-4">{copy.text_a_routine_made_simple}</p><h2 className="section-heading">{kit.name}</h2><p className="text-muted-gray leading-relaxed mt-5">{kit.short_description}</p><p className="text-sm text-muted-gray mt-5">{kit.package_size}</p><p className="text-2xl font-semibold mt-2">{formatPKR(kit.price_minor)}</p><Link className="button-primary mt-6" href={'/kits/'+kit.slug}>{copy.text_see_what_s_inside}<ArrowRight size={18}/></Link><p className="text-sm text-muted-gray mt-5">{copy.text_food_for_your_routine_no_medical_promises}</p></div></Reveal></section></ManagedSection>),"testimonials":(<TestimonialCarousel initialReviews={reviewResult.reviews} unavailable={reviewResult.unavailable} />),"page_section_05":(<ManagedSection document="home" sectionId="page_section_05"><Reveal as="section" className="store-container grid md:grid-cols-2 gap-8 py-12 sm:py-20"><div><p className="eyebrow mb-4">{copy.text_our_story}</p><h2 className="section-heading">{copy.text_a_pantry_you_can_get_to_know}</h2></div><div><p className="text-muted-gray leading-relaxed">{copy.text_we_re_a_pantry_shop_based_in_lahore_bringing_seeds_and}</p><Link className="text-link inline-block mt-5" href={links.href_about}>{copy.text_meet_seedly}</Link></div></Reveal></ManagedSection>)}}/>





  </div>;
}

export async function generateMetadata(){return getContentMetadata('home');}
