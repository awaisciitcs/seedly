import { getContentMetadata } from '@/lib/cms/metadata';
import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import Link from 'next/link';
import { TrackingForm } from '@/components/storefront/TrackingForm';
export default async function AccountPage() {
  const cms = await getContentDocument<CmsPageContent>('account'); const { copy, links, images } = cms; const {features}=await getContentDocument<SiteContent>('site');
 return <div className="store-container py-12 sm:py-20"><h1 className="text-3xl sm:text-4xl mb-3">{copy.text_orders_saved_items}</h1><p className="text-muted-gray mb-10">{copy.text_track_your_delivery_or_revisit_the_products_you_saved_o}</p><div className="grid md:grid-cols-2 gap-8 max-w-4xl"><ManagedSection document="account" sectionId="page_section_01"><section className="checkout-section"><h2 className="text-2xl mb-5">{copy.text_track_an_order}</h2><TrackingForm /></section></ManagedSection><ManagedSection document="account" sectionId="page_section_02"><section className="checkout-section space-y-5"><h2 className="text-2xl">{copy.text_your_pantry_picks}</h2>{features.savedProducts&&(<Link className="button-secondary w-full" href={links.href_account_wishlist}>{copy.text_view_saved_products}</Link>)}{features.routine&&(<Link className="button-secondary w-full" href={links.href_find_your_seed}>{copy.text_find_a_routine}</Link>)}<p className="text-sm text-muted-gray">{copy.text_need_to_change_delivery_details}<Link className="underline" href={links.href_contact}>{copy.text_contact_our_team}</Link>.</p></section></ManagedSection></div></div>; }

export async function generateMetadata(){return getContentMetadata('account');}
